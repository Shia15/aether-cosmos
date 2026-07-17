import { Router, type IRouter } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";

const router: IRouter = Router();

const OPENROUTER_BASE = process.env.AI_INTEGRATIONS_OPENROUTER_BASE_URL ?? "http://localhost:1106/modelfarm/openrouter";
const IMAGE_MODEL = "x-ai/grok-2-image-1212";

const GROK_MODEL = "x-ai/grok-4.5";

const BASE_SYSTEM_PROMPT = `You are the AETHER Systems Analyst — a live Grok-powered assistant embedded inside the AETHER Knowledge System, operated on X via @Strategicproce (primary) and @Shia449272 (archive account).

Your job: answer questions about, and compare between, the system architectures listed in the CONTEXT section. The context may also include a POST ARCHIVE — real posts written by the operator on X. It may also include a VISUAL LIBRARY — an enumerated catalog of images and videos generated for AETHER pages, grouped by source (GPT, LinkedIn, Grok, etc.). When the user asks about their posts, quote and reference specific posts from the archive, connect them to the architectures, and surface patterns across them. When the user asks about images, videos, or visual assets, reference specific filenames from the VISUAL LIBRARY and connect them to the architectures they illustrate. When comparing architectures, be concrete: shared principles, differences in mechanism, data flow, and where one system's output could feed another's input.

Style: precise, structured, technically grounded. Use short headed sections or bullet lists for comparisons. Keep responses focused — no filler.`;

router.post("/grok/chat", async (req, res) => {
  const body = req.body ?? {};

  const rawMessages: unknown[] = Array.isArray(body.messages)
    ? body.messages
    : [];
  const messages = rawMessages
    .filter(
      (m: unknown): m is { role: string; content: string } =>
        !!m &&
        typeof m === "object" &&
        typeof (m as { role?: unknown }).role === "string" &&
        typeof (m as { content?: unknown }).content === "string",
    )
    .filter(
      (m: { role: string; content: string }) =>
        m.role === "user" || m.role === "assistant",
    )
    .slice(-24)
    .map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content.slice(0, 8000),
    }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    res.status(400).json({ error: "messages must end with a user message" });
    return;
  }

  const context =
    typeof body.context === "string" ? body.context.slice(0, 24000) : "";

  const systemPrompt = context
    ? `${BASE_SYSTEM_PROMPT}\n\nCONTEXT — SYSTEM ARCHITECTURES:\n${context}`
    : BASE_SYSTEM_PROMPT;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openrouter.chat.completions.create({
      model: GROK_MODEL,
      max_tokens: 8192,
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      stream: true,
    });

    req.on("close", () => {
      if (!res.writableEnded) stream.controller.abort();
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err) {
    req.log.error({ err }, "grok chat stream failed");
    if (!res.headersSent) {
      res.status(502).json({ error: "Grok request failed" });
    } else {
      res.write(
        `data: ${JSON.stringify({ error: "Grok stream interrupted" })}\n\n`,
      );
      res.end();
    }
  }
});

// ── Matrix Field Scale — AETHER prompt enhancer ───────────────────────────────
// Applies node+switch-plate coherence framing to enrich prompts that failed
// or are sent in "enhanced" mode. Adds structural + aesthetic guidance without
// changing the user's core intent.
function matrixFieldEnhance(prompt: string): string {
  const lower = prompt.toLowerCase();
  const isAether = lower.includes("aether") || lower.includes("coherence") || lower.includes("lattice") || lower.includes("crystalliz");
  const base = prompt.trim().slice(0, 900);
  if (isAether) {
    return `${base}. Ultra-detailed digital art, cinematic lighting, deep space background with warm gold and teal accents, 8K render quality.`;
  }
  return `${base}. Photorealistic or illustrative render with strong contrast, precise detail, and cinematic composition.`;
}

// Single image call — the model generates 1 image per request on this endpoint
async function generateOne(enhancedPrompt: string): Promise<{ url?: string; b64_json?: string }> {
  const resp = await fetch(`${OPENROUTER_BASE}/v1/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: IMAGE_MODEL, prompt: enhancedPrompt.slice(0, 1000) }),
  });
  if (!resp.ok) {
    let errText = await resp.text();
    // Try parsing as JSON to extract message
    try {
      const parsed = JSON.parse(errText) as { error?: { message?: string } | string };
      if (typeof parsed.error === "object" && parsed.error?.message) errText = parsed.error.message;
      else if (typeof parsed.error === "string") errText = parsed.error;
    } catch { /* keep raw text */ }
    throw new Error(`[${resp.status}] ${errText}`);
  }
  const data = await resp.json() as { data?: { url?: string; b64_json?: string }[] };
  const first = data.data?.[0];
  if (!first) throw new Error("No image data returned");
  return first;
}

// ── Grok image generation (Aurora / grok-2-image-1212) ───────────────────────
// n>1 is handled client-side by firing n parallel single-image calls.
// On first error, retries once with matrix-field-enhanced prompt.
router.post("/grok/imagine", async (req, res) => {
  const { prompt, n = 1, enhance = false } = req.body ?? {};
  if (!prompt || typeof prompt !== "string") {
    res.status(400).json({ error: "prompt required" });
    return;
  }
  const count = Math.max(1, Math.min(4, Number(n) || 1));
  const finalPrompt = enhance ? matrixFieldEnhance(prompt) : prompt.trim();

  try {
    // Fire count parallel requests (model only supports 1 at a time)
    const tasks = Array.from({ length: count }, () =>
      generateOne(finalPrompt).catch(async (err: Error) => {
        // Retry once with matrix field enhancement
        req.log.warn({ err: err.message }, "grok imagine retry with matrix enhance");
        return generateOne(matrixFieldEnhance(prompt));
      })
    );

    const settled = await Promise.allSettled(tasks);
    const results: { url?: string; b64_json?: string }[] = [];
    const errors: string[] = [];

    for (const s of settled) {
      if (s.status === "fulfilled") results.push(s.value);
      else errors.push(s.reason?.message ?? String(s.reason));
    }

    if (results.length === 0) {
      req.log.error({ errors }, "grok imagine all requests failed");
      res.status(502).json({ error: errors[0] ?? "Image generation failed" });
      return;
    }

    res.json({ data: results, _errors: errors.length > 0 ? errors : undefined });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    req.log.error({ err }, "grok imagine failed");
    res.status(502).json({ error: msg });
  }
});

export default router;

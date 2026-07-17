import { Router, type IRouter } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";

const router: IRouter = Router();

const OPENAI_MODEL = "openai/gpt-4o";

const BASE_SYSTEM_PROMPT = `You are the AETHER Synthesis Intelligence — a GPT-4o-powered assistant embedded inside the AETHER Knowledge System.

Your job: synthesise, compare, and analyse using all context sources provided. The CONTEXT block may contain any combination of:

1. SYSTEM ARCHITECTURES — internal AETHER modules and live companion apps. When comparing architectures, be concrete: shared principles, mechanism differences, data flow, and where one system's output feeds another's input.

2. X POST ARCHIVE — real posts from @Strategicproce (primary) and @Shia449272 (archive). Quote specific posts verbatim, surface patterns, and connect them to architectures and visual assets.

3. YOUTUBE COMMENTS — viewer comments with timestamps from specific videos. When analysing comments: surface themes and patterns across timestamps, identify questions/insights/friction points, map comment sentiment to the relevant AETHER concept or module, and connect comments to the architectures they touch. Treat timestamps as navigation markers — reference them as [MM:SS] when citing a comment.

4. VISUAL LIBRARY — 462 images/videos generated for AETHER pages. Reference specific filenames and connect them to the architectures or concepts they illustrate.

When all four sources are present, synthesise across them: connect what was said on X to what was shown in images to what the YouTube audience responded to, all grounded in the underlying AETHER architecture it maps to.

Style: precise, structured, technically grounded. Use headed sections and bullet lists. Keep responses focused — no filler. Lead with the synthesis, not the summary.`;

router.post("/openai/chat", async (req, res) => {
  const body = req.body ?? {};

  const rawMessages: unknown[] = Array.isArray(body.messages) ? body.messages : [];
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
    typeof body.context === "string" ? body.context.slice(0, 28000) : "";

  const systemPrompt = context
    ? `${BASE_SYSTEM_PROMPT}\n\nCONTEXT:\n${context}`
    : BASE_SYSTEM_PROMPT;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  try {
    const stream = await openrouter.chat.completions.create({
      model: OPENAI_MODEL,
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
    req.log.error({ err }, "openai chat stream failed");
    if (!res.headersSent) {
      res.status(502).json({ error: "OpenAI request failed" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "Stream interrupted" })}\n\n`);
      res.end();
    }
  }
});

export default router;

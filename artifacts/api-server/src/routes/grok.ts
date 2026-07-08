import { Router, type IRouter } from "express";
import { openrouter } from "@workspace/integrations-openrouter-ai";

const router: IRouter = Router();

const GROK_MODEL = "x-ai/grok-4.5";

const BASE_SYSTEM_PROMPT = `You are the AETHER Systems Analyst — a live Grok-powered assistant embedded inside the AETHER Knowledge System, operated on X via @Strategicproce (primary) and @Shia449272 (archive account).

Your job: answer questions about, and compare between, the system architectures listed in the CONTEXT section. The context may also include a POST ARCHIVE — real posts written by the operator on X. When the user asks about their posts, quote and reference specific posts from the archive, connect them to the architectures, and surface patterns across them. When comparing architectures, be concrete: shared principles, differences in mechanism, data flow, and where one system's output could feed another's input.

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

export default router;

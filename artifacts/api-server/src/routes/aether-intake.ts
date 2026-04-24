import { Router, type IRouter } from "express";
import express from "express";

const router: IRouter = Router();

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS_TITLE = 80;
const MAX_TOKENS_SECTION = 380;

// 15 MB body limit — base64 image payloads can easily exceed the default 100kb.
router.use("/aether-intake", express.json({ limit: "15mb" }));

const SYSTEM_PROMPT = `You are the AETHER OS knowledge analysis engine. Analyze documents mapping to the AETHER mathematical framework.

AETHER has 9 shells: DM(Dim1-2), GM(Dim3-4), AM(Dim5-6), HM(Dim7-8), QM(Dim9-10), LBM(Dim11-12), LGM(Dim13-14), DQM(Dim15-17), DHM(Dim18-22), plus extended dims 23-26 (Resonance Depth, Gyroid Topology, Biophoton Axis, Aether Substrate).

The 26 spatial dimensions + 1 time dimension (Dim 6) form the complete freedom space. Each dimension represents a degree of freedom in the AETHER coherence field C(x,t)=f(d).

Layers: N(Note), C(Concept), S(System), F(Framework), P(Project), D(Diagram).
Be precise and technical. Use -> for list items. 80-180 words. No preamble.`;

// Server-side whitelist of allowed analysis sections.
// The frontend may only request these by id — never supply prompts directly.
const SECTION_PROMPTS: Record<string, string> = {
  title:       "Extract the exact title from this document. Return only the title.",
  executive:   "Write a 3-sentence executive summary of this content.",
  abstract:    "Extract or reconstruct the abstract in 2-3 sentences.",
  summary:     "Summarize the key ideas in 3-4 sentences.",
  mathmap:     "Map the core ideas to AETHER shells DM,GM,AM,HM,QM,LBM,LGM,DQM,DHM with dimensional placement. Use -> bullet list.",
  dimfreedom:  "Which of the 26 AETHER spatial dimensions does this content operate within? List each dimension by number (Dim 1, Dim 2, etc) with a brief reason.",
  coherence:   "Assign AETHER layer (N/C/S/F/P/D) and explain the field position in 2-3 sentences.",
  gaps:        "List 3 critical gaps or open questions this content leaves open. Use -> bullets.",
  crosslinks:  "List 5 concepts that should link to other nodes in the knowledge graph. Use -> bullets.",
  dataread:    "Describe what this chart/data shows: axes, trend, scale, key data points.",
  implication: "What does this content imply for the AETHER system architecture? 2-3 sentences.",
};

// docTypes the client is allowed to declare (passed only as label to model).
const ALLOWED_DOC_TYPES = new Set([
  "pitch", "paper", "chart", "note", "textbook", "formula", "any",
]);

// Section ids that may use vision input.
const VISION_SECTIONS = new Set(["title", "dataread", "abstract", "executive"]);

const ALLOWED_IMAGE_MIME = new Set([
  "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp",
]);

type AnthropicMessage = {
  role: "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | {
            type: "image";
            source: { type: "base64"; media_type: string; data: string };
          }
      >;
};

async function callAnthropic(
  messages: AnthropicMessage[],
  maxTokens: number,
  useSystem: boolean,
): Promise<string> {
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  if (!baseURL || !apiKey) {
    throw new Error("Anthropic AI integration not configured");
  }
  const url = `${baseURL.replace(/\/$/, "")}/v1/messages`;
  const body: Record<string, unknown> = {
    model: MODEL,
    max_tokens: maxTokens,
    messages,
  };
  if (useSystem) body.system = SYSTEM_PROMPT;

  const r = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const txt = await r.text();
    throw new Error(`Anthropic ${r.status}: ${txt.slice(0, 200)}`);
  }
  const d = (await r.json()) as {
    content?: Array<{ type: string; text?: string }>;
  };
  const text =
    d.content?.find((b) => b.type === "text")?.text?.trim() ?? "";
  return text;
}

function sanitizeShortText(s: unknown, maxLen: number): string {
  if (typeof s !== "string") return "";
  // Keep printable chars only; collapse whitespace.
  return s.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLen);
}

function decodeImage(dataURL: unknown, mime: unknown): { data: string; mime: string } | null {
  if (typeof dataURL !== "string" || !dataURL) return null;
  const b64 = dataURL.includes(",") ? dataURL.split(",")[1] : dataURL;
  if (!b64 || b64.length < 16) return null;
  // Cap base64 image size at ~5MB raw (~6.7MB base64).
  if (b64.length > 7_000_000) return null;
  let m = typeof mime === "string" ? mime.toLowerCase() : "";
  if (!ALLOWED_IMAGE_MIME.has(m)) m = "image/jpeg";
  return { data: b64, mime: m };
}

router.post("/aether-intake/title", async (req, res) => {
  try {
    const filename = sanitizeShortText(req.body?.filename, 200);
    const text = sanitizeShortText(req.body?.text, 1500);
    const img = decodeImage(req.body?.dataURL, req.body?.mimeType);

    let messages: AnthropicMessage[];
    if (img) {
      messages = [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: img.mime, data: img.data } },
            { type: "text", text: "Find the main title or headline - the largest or most prominent text at the top of this page. Return ONLY that title, nothing else." },
          ],
        },
      ];
    } else if (text && text.length > 10) {
      messages = [{
        role: "user",
        content: `Filename: "${filename || "document"}"\nText:\n${text}\n\nExtract the main title or heading. Return ONLY the title.`,
      }];
    } else {
      messages = [{
        role: "user",
        content: `Filename: "${filename || "document"}"\n\nGenerate a precise professional title for this document. Return ONLY the title.`,
      }];
    }
    const title = await callAnthropic(messages, MAX_TOKENS_TITLE, false);
    const cleaned = title.replace(/^["']|["']$/g, "").replace(/^Title:\s*/i, "").trim();
    res.json({ title: cleaned });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    res.status(500).json({ error: msg });
  }
});

router.post("/aether-intake/analyze", async (req, res) => {
  try {
    const sectionId = String(req.body?.sectionId ?? "");
    const sectionPrompt = SECTION_PROMPTS[sectionId];
    if (!sectionPrompt) {
      res.status(400).json({ error: "unknown sectionId" });
      return;
    }

    const docTypeRaw = String(req.body?.docType ?? "any");
    const docType = ALLOWED_DOC_TYPES.has(docTypeRaw) ? docTypeRaw : "any";
    const filename = sanitizeShortText(req.body?.filename, 200);
    const title = sanitizeShortText(req.body?.title, 250);
    const text = sanitizeShortText(req.body?.text, 1200);
    const useImage = !!req.body?.useImage && VISION_SECTIONS.has(sectionId);
    const img = useImage ? decodeImage(req.body?.dataURL, req.body?.mimeType) : null;

    let messages: AnthropicMessage[];
    if (img) {
      messages = [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: img.mime, data: img.data } },
          { type: "text", text: `Type: ${docType}. Title: ${title || "?"}. ${sectionPrompt}` },
        ],
      }];
    } else {
      const ctx = `Type: ${docType}\nFilename: ${filename || "?"}\nTitle: ${title || "?"}\nText: ${text || "(binary/image)"}`;
      messages = [{ role: "user", content: `${ctx}\n\nTask: ${sectionPrompt}` }];
    }

    const result = await callAnthropic(messages, MAX_TOKENS_SECTION, true);
    res.json({ result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown";
    res.status(500).json({ error: msg });
  }
});

export default router;

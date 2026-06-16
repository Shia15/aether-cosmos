import { Router, type IRouter } from "express";

const router: IRouter = Router();

const MODEL = "claude-sonnet-4-5";

const SYSTEM = `You are the AETHER neural plasmoid simulation engine. Return ONLY valid JSON — no markdown fences, no explanation, no extra text. Schema:
{
  "name":"string","scientificName":"string","class":"string",
  "locomotion":"swimming|walking|flying|crawling|undulating|gliding",
  "neuralComplexity":1-10,"nodeCount":12-40,"primaryMedium":"solid|granular|fluid|diffusion|light",
  "dominantFreqHz":number,"gammaHz":number,"thetaHz":number,"alphaHz":number,
  "bodyColor":[r,g,b],"accentColor":[r,g,b],"haloColor":[r,g,b],
  "wavePattern":"sinusoidal|burst|ripple|pulse|spiral",
  "movementStyle":"undulating|rhythmic|erratic|smooth|flocking",
  "synapticDensity":0.1-1.0,"motorNodeRatio":0.2-0.6,"sensoryNodeRatio":0.1-0.4,"inertia":0.1-1.0,
  "description":"One sentence about neural/movement signature.",
  "plasmoidNote":"One sentence about AETHER plasmoid mapping.",
  "pipelineSteps":["step1","step2","step3","step4","step5","step6"],
  "ltp":0.0-1.0,"ltd":0.0-1.0,
  "movementNote":"Brief locomotion mechanics note"
}
Be scientifically accurate. Use real neuroscience values.`;

router.post("/animal-profile", async (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name || typeof name !== "string") {
    res.status(400).json({ error: "name required" });
    return;
  }

  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  const apiKey  = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  if (!baseURL || !apiKey) {
    res.status(503).json({ error: "Anthropic AI integration not configured" });
    return;
  }

  try {
    const url = `${baseURL.replace(/\/$/, "")}/v1/messages`;
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{ role: "user", content: `Animal: ${name.trim()}` }],
      }),
    });

    if (!r.ok) {
      const txt = await r.text();
      req.log.error({ status: r.status, body: txt.slice(0, 300) }, "Anthropic error");
      res.status(502).json({ error: `Upstream error ${r.status}` });
      return;
    }

    const d = (await r.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const txt = d.content
      ?.filter((b) => b.type === "text")
      .map((b) => b.text ?? "")
      .join("")
      .replace(/```json|```/g, "")
      .trim() ?? "";

    const profile = JSON.parse(txt);
    res.json(profile);
  } catch (e) {
    req.log.error(e, "animal-profile error");
    res.status(500).json({ error: "profile generation failed" });
  }
});

export default router;

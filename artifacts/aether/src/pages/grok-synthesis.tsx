/*═══════════════════════════════════════════════════════════════════
  Grok Cross-Synthesis — nodetacular cross-sectioning of both X accounts
  @Strategicproce × @Shia449272 → Grok-4.5 streaming synthesis → node canvas
═══════════════════════════════════════════════════════════════════*/
import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────
type XPost    = { id: string; account: string; text: string; addedAt: number };
type SynthNode = { id: string; label: string; account: "A" | "B" | "shared"; x: number; y: number; vx: number; vy: number };
type SynthEdge = { a: string; b: string; strength: number };

const ACCOUNTS = ["@Strategicproce", "@Shia449272"] as const;
const POSTS_KEY = "aether.xposts.v1";
const A_COLOR   = "#f5c84c";   // gold — @Strategicproce
const B_COLOR   = "#4fe8e8";   // cyan — @Shia449272
const AB_COLOR  = "#c084fc";   // purple — shared

const B = {
  bg:    "#0b0906", panel: "#14100a", panel2: "#1c160e",
  line:  "rgba(245,200,76,0.14)", gold: "#f5c84c", ivory: "#f4f1ea",
  dim:   "rgba(244,241,234,0.5)",
};

function loadPosts(): XPost[] {
  try {
    const raw = JSON.parse(localStorage.getItem(POSTS_KEY) ?? "[]");
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function topWords(posts: XPost[], account: string, n = 40): string[] {
  const stop = new Set(["the","a","an","and","or","but","in","on","at","to","for","of","is","it","i","we","you","this","that","with","from","are","was","be","as","by","have","has","had","not","so","do","if","my","your","our","they","their","he","she","what","how","can","will","also","just","all","been","more","its","one","new","like","get","let","us","me","who","when","where","which","than","then","up","out","about","would","could","should","make","need","want","see","know","use","way","per","via","into","over","some","into","well","even","only","time","back","go","now","here","after","first","last","much","very","any","no","yes","&","—","·"]);
  const freq: Record<string, number> = {};
  posts.filter(p => p.account === account).forEach(p => {
    p.text.toLowerCase().split(/[\s,.!?;:()\[\]"'\/\\]+/).filter(w => w.length > 4 && !stop.has(w) && !/^\d+$/.test(w)).forEach(w => { freq[w] = (freq[w] ?? 0) + 1; });
  });
  return Object.entries(freq).sort((a,b) => b[1]-a[1]).slice(0,n).map(([w]) => w);
}

function buildNodes(aWords: string[], bWords: string[], W: number, H: number): { nodes: SynthNode[]; edges: SynthEdge[] } {
  const aSet = new Set(aWords), bSet = new Set(bWords);
  const shared = aWords.filter(w => bSet.has(w));
  const onlyA  = aWords.filter(w => !bSet.has(w)).slice(0, 12);
  const onlyB  = bWords.filter(w => !aSet.has(w)).slice(0, 12);
  const sharedSlice = shared.slice(0, 8);

  const rnd = (lo: number, hi: number) => lo + Math.random() * (hi - lo);
  const nodes: SynthNode[] = [
    ...onlyA.map((label, i) => ({ id: `a${i}`, label, account: "A" as const, x: rnd(40, W*0.38), y: rnd(40, H-40), vx: 0, vy: 0 })),
    ...onlyB.map((label, i) => ({ id: `b${i}`, label, account: "B" as const, x: rnd(W*0.62, W-40), y: rnd(40, H-40), vx: 0, vy: 0 })),
    ...sharedSlice.map((label, i) => ({ id: `s${i}`, label, account: "shared" as const, x: rnd(W*0.35, W*0.65), y: rnd(60, H-60), vx: 0, vy: 0 })),
  ];

  const edges: SynthEdge[] = [];
  sharedSlice.forEach((_, si) => {
    const sId = `s${si}`;
    onlyA.forEach((_, ai) => { if (Math.random() < 0.35) edges.push({ a: sId, b: `a${ai}`, strength: 0.4 }); });
    onlyB.forEach((_, bi) => { if (Math.random() < 0.35) edges.push({ a: sId, b: `b${bi}`, strength: 0.4 }); });
  });
  onlyA.forEach((_, i) => onlyA.forEach((_, j) => { if (i < j && Math.random() < 0.15) edges.push({ a: `a${i}`, b: `a${j}`, strength: 0.2 }); }));
  onlyB.forEach((_, i) => onlyB.forEach((_, j) => { if (i < j && Math.random() < 0.15) edges.push({ a: `b${i}`, b: `b${j}`, strength: 0.2 }); }));

  return { nodes, edges };
}

export default function GrokSynthesisPage() {
  const [posts, setPosts]     = useState<XPost[]>([]);
  const [aCount, setACount]   = useState(0);
  const [bCount, setBCount]   = useState(0);
  const [query, setQuery]     = useState("Synthesize the key theoretical differences and convergence points between these two X accounts. Identify the strongest lines of planetary health coherence, material knowledge nodes, and the fine thread that unifies both perspectives into one coherent field.");
  const [streaming, setStreaming] = useState(false);
  const [output, setOutput]   = useState("");
  const [nodes, setNodes]     = useState<SynthNode[]>([]);
  const [edges, setEdges]     = useState<SynthEdge[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const abortRef  = useRef<AbortController>();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef  = useRef<SynthNode[]>([]);
  const rafRef    = useRef<number>();

  useEffect(() => {
    const all = loadPosts();
    setPosts(all);
    setACount(all.filter(p => p.account === ACCOUNTS[0]).length);
    setBCount(all.filter(p => p.account === ACCOUNTS[1]).length);
    if (all.length > 0) buildGraph(all);
  }, []);

  function buildGraph(allPosts: XPost[]) {
    const aW = topWords(allPosts, ACCOUNTS[0]);
    const bW = topWords(allPosts, ACCOUNTS[1]);
    const cv = canvasRef.current;
    const W = cv ? cv.offsetWidth : 700;
    const H = cv ? cv.offsetHeight : 400;
    const { nodes: n, edges: e } = buildNodes(aW, bW, W, H);
    setNodes(n); nodesRef.current = n; setEdges(e);
  }

  // ── Force-directed layout ──────────────────────────────────────────────────
  const tickLayout = useCallback(() => {
    const ns = nodesRef.current;
    if (!ns.length) return;
    const cv = canvasRef.current;
    const W = cv ? cv.width : 700, H = cv ? cv.height : 400;
    const k = 80, rep = 4000;

    // Repulsion
    for (let i = 0; i < ns.length; i++) {
      for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x, dy = ns[i].y - ns[j].y;
        const d2 = dx*dx + dy*dy + 1;
        const f = rep / d2;
        ns[i].vx += dx * f; ns[i].vy += dy * f;
        ns[j].vx -= dx * f; ns[j].vy -= dy * f;
      }
    }
    // Attraction along edges
    edges.forEach(e => {
      const a = ns.find(n => n.id === e.a), b = ns.find(n => n.id === e.b);
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx*dx+dy*dy)+0.01;
      const f = (d - k) * e.strength * 0.1;
      const fx = dx/d*f, fy = dy/d*f;
      a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
    });
    // Centering + boundary + damping
    ns.forEach(n => {
      n.vx *= 0.7; n.vy *= 0.7;
      n.x = Math.max(50, Math.min(W-50, n.x + n.vx));
      n.y = Math.max(20, Math.min(H-20, n.y + n.vy));
    });
  }, [edges]);

  // ── Canvas draw ───────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const ns = nodesRef.current;
    const dpr = window.devicePixelRatio ?? 1;
    const W = cv.width / dpr, H = cv.height / dpr;
    ctx.clearRect(0, 0, cv.width, cv.height);
    ctx.save(); ctx.scale(dpr, dpr);

    // Edges
    edges.forEach(e => {
      const a = ns.find(n => n.id === e.a), b = ns.find(n => n.id === e.b);
      if (!a || !b) return;
      const isHov = hovered === a.id || hovered === b.id;
      ctx.strokeStyle = isHov ? "rgba(245,200,76,0.55)" : "rgba(245,200,76,0.10)";
      ctx.lineWidth = isHov ? 1.5 : 0.8;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });

    // Nodes
    ns.forEach(n => {
      const color = n.account === "A" ? A_COLOR : n.account === "B" ? B_COLOR : AB_COLOR;
      const isHov = hovered === n.id;
      const r = n.account === "shared" ? 6 : 5;
      if (isHov) {
        const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 28);
        g.addColorStop(0, color + "55"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(n.x, n.y, 28, 0, Math.PI*2); ctx.fill();
      }
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI*2);
      ctx.fillStyle = color; ctx.fill();
      ctx.font = isHov ? "bold 11px monospace" : "10px monospace";
      ctx.fillStyle = isHov ? color : "rgba(244,241,234,0.75)";
      ctx.fillText(n.label, n.x + r + 4, n.y + 4);
    });

    // Legend
    ctx.font = "10px monospace";
    [[A_COLOR, ACCOUNTS[0]], [B_COLOR, ACCOUNTS[1]], [AB_COLOR, "Shared nodes"]].forEach(([c, lbl], i) => {
      ctx.fillStyle = c as string;
      ctx.beginPath(); ctx.arc(14, H - 48 + i*16, 4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = B.dim as string;
      ctx.fillText(lbl as string, 24, H - 44 + i*16);
    });
    ctx.restore();
  }, [edges, hovered]);

  useEffect(() => {
    if (!nodes.length) return;
    nodesRef.current = nodes;
    let t = 0;
    function loop() {
      if (t++ < 120) tickLayout();
      nodesRef.current = [...nodesRef.current];
      draw();
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [nodes, edges, draw, tickLayout]);

  // ── Canvas resize ─────────────────────────────────────────────────────────
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const obs = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio ?? 1;
      cv.width = cv.offsetWidth * dpr;
      cv.height = cv.offsetHeight * dpr;
    });
    obs.observe(cv);
    return () => obs.disconnect();
  }, []);

  // ── Canvas hover ──────────────────────────────────────────────────────────
  function onCanvasMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const hit = nodesRef.current.find(n => (n.x-mx)**2+(n.y-my)**2 < 256);
    setHovered(hit?.id ?? null);
  }

  // ── Streaming synthesis ───────────────────────────────────────────────────
  async function runSynthesis() {
    if (streaming) { abortRef.current?.abort(); setStreaming(false); return; }
    abortRef.current = new AbortController();
    setStreaming(true); setOutput("");

    const aPost = posts.filter(p => p.account === ACCOUNTS[0]).slice(-80).map(p => p.text).join("\n");
    const bPost = posts.filter(p => p.account === ACCOUNTS[1]).slice(-80).map(p => p.text).join("\n");

    const systemMsg = `You are AETHER's cross-account knowledge synthesizer. You analyze two X/Twitter archives to identify:
1. Theoretical differences between the accounts
2. Convergence points and shared concepts
3. Key "material knowledge nodes" — the strongest conceptual atoms
4. The coherent planetary health thread that unifies both
5. The fine line of stability running through both perspectives

Output concise insight clusters. Use node labels in [[brackets]] to mark key concepts. Be direct and specific.`;

    const userMsg = `ARCHIVE A (${ACCOUNTS[0]}, ${aCount} posts):
${aPost || "(no posts — add posts in Grok Bridge first)"}

ARCHIVE B (${ACCOUNTS[1]}, ${bCount} posts):
${bPost || "(no posts — add posts in Grok Bridge first)"}

SYNTHESIS DIRECTIVE:
${query}`;

    try {
      const resp = await fetch("/api/grok/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({ messages: [{ role: "user", content: userMsg }], context: systemMsg }),
      });
      if (!resp.ok || !resp.body) { setOutput("API error: " + resp.statusText); setStreaming(false); return; }
      const reader = resp.body.getReader();
      const dec = new TextDecoder();
      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = dec.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;
          try { const j = JSON.parse(data); const delta = j?.content ?? j?.choices?.[0]?.delta?.content ?? ""; fullText += delta; setOutput(fullText); } catch { /* */ }
        }
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") setOutput(`Error: ${err?.message ?? err}`);
    }
    setStreaming(false);
  }

  // ── Render extracted node labels from synthesis text ─────────────────────
  const nodePills = output.match(/\[\[([^\]]+)\]\]/g)?.map(m => m.slice(2,-2)) ?? [];
  const cleanOutput = output.replace(/\[\[([^\]]+)\]\]/g, (_, w) => `**${w}**`);

  // ── Styles ────────────────────────────────────────────────────────────────
  const s: Record<string, React.CSSProperties> = {
    page:   { minHeight: "100vh", background: B.bg, color: B.ivory, fontFamily: "inherit", display: "flex", flexDirection: "column" },
    header: { padding: "24px 32px 16px", borderBottom: `1px solid ${B.line}`, background: `linear-gradient(180deg,rgba(245,200,76,0.06),transparent)`, flexShrink: 0 },
    h1:     { fontSize: 21, fontWeight: 700, color: B.gold, letterSpacing: 1, marginBottom: 4 },
    sub:    { fontSize: 12, color: B.dim, letterSpacing: 0.5 },
    body:   { flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 0 },
    left:   { borderRight: `1px solid ${B.line}`, display: "flex", flexDirection: "column", minHeight: 0 },
    right:  { display: "flex", flexDirection: "column", minHeight: 0 },
    sec:    { padding: "16px 24px", borderBottom: `1px solid ${B.line}` },
    label:  { fontSize: 11, color: B.dim, letterSpacing: 1, textTransform: "uppercase" as const, marginBottom: 6 },
    accountRow: { display: "flex", gap: 12, marginBottom: 10 },
    badge:  (c: string) => ({ padding: "4px 12px", borderRadius: 6, border: `1px solid ${c}`, background: c + "22", color: c, fontSize: 11, fontWeight: 700 }),
    textarea: { width: "100%", background: B.panel2, border: `1px solid ${B.line}`, borderRadius: 8, padding: "10px 14px", color: B.ivory, fontSize: 12, lineHeight: 1.6, resize: "vertical" as const, outline: "none", minHeight: 80 },
    synthBtn: (active: boolean) => ({ marginTop: 10, padding: "10px 24px", borderRadius: 8, border: `1.5px solid ${active ? "#f87171" : B.gold}`, background: active ? "rgba(248,113,113,0.1)" : "rgba(245,200,76,0.1)", color: active ? "#f87171" : B.gold, fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }),
    canvas: { flex: 1, width: "100%", minHeight: 260, display: "block", cursor: "crosshair" },
    canvasSec: { flex: 1, display: "flex", flexDirection: "column" as const, minHeight: 0, borderBottom: `1px solid ${B.line}` },
    outputSec: { flex: "0 0 auto", maxHeight: "42vh", overflowY: "auto", padding: "16px 24px" },
    outputText: { fontSize: 13, lineHeight: 1.75, color: B.ivory, whiteSpace: "pre-wrap" as const },
    pills: { display: "flex", flexWrap: "wrap" as const, gap: 6, padding: "0 24px 12px" },
    pill:  { padding: "3px 10px", borderRadius: 12, background: AB_COLOR + "22", border: `1px solid ${AB_COLOR}55`, color: AB_COLOR, fontSize: 11 },
    emptyNote: { padding: "24px", color: B.dim, fontSize: 13, textAlign: "center" as const },
    cursor: { display: "inline-block", width: 2, height: "1em", background: B.gold, marginLeft: 2, animation: "blink 1s step-end infinite", verticalAlign: "text-bottom" },
  };

  return (
    <div style={s.page}>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
      <div style={s.header}>
        <div style={s.h1}>Grok Cross-Synthesis · Nodetacular Knowledge Cross-Section</div>
        <div style={s.sub}>X post archive from both accounts × Grok-4.5 streaming × live node canvas — find the coherent line</div>
      </div>

      <div style={s.body}>
        {/* LEFT — Controls + Node Canvas */}
        <div style={s.left}>
          <div style={s.sec}>
            <div style={s.label}>Archive Status</div>
            <div style={s.accountRow}>
              <span style={s.badge(A_COLOR)}>{ACCOUNTS[0]} · {aCount} posts</span>
              <span style={s.badge(B_COLOR)}>{ACCOUNTS[1]} · {bCount} posts</span>
            </div>
            {(aCount === 0 || bCount === 0) && (
              <div style={{ fontSize: 11, color: "#f87171", marginBottom: 8 }}>
                ⚠ Add posts for both accounts in <b>/x-grok</b> first — paste X posts into the Archive panel there
              </div>
            )}
            <div style={s.label}>Synthesis Directive</div>
            <textarea
              style={s.textarea}
              value={query}
              onChange={e => setQuery(e.target.value)}
              rows={4}
            />
            <button style={s.synthBtn(streaming)} onClick={runSynthesis}>
              {streaming ? "⬛ Stop" : "✦ Run Cross-Synthesis"}
            </button>
          </div>

          <div style={{ ...s.sec, padding: "10px 24px 6px" }}>
            <div style={s.label}>Material Knowledge Node Canvas</div>
            <div style={{ fontSize: 11, color: B.dim }}>
              <span style={{ color: A_COLOR }}>●</span> {ACCOUNTS[0]} &nbsp;
              <span style={{ color: B_COLOR }}>●</span> {ACCOUNTS[1]} &nbsp;
              <span style={{ color: AB_COLOR }}>●</span> Shared nodes — hover to highlight connections
            </div>
          </div>
          <div style={s.canvasSec}>
            {nodes.length === 0
              ? <div style={s.emptyNote}>Node canvas will populate from your X post archive.<br/>Add posts in /x-grok to begin.</div>
              : <canvas ref={canvasRef} style={s.canvas} onMouseMove={onCanvasMove} onMouseLeave={() => setHovered(null)} />
            }
          </div>
        </div>

        {/* RIGHT — Synthesis output */}
        <div style={s.right}>
          <div style={{ ...s.sec, flexShrink: 0 }}>
            <div style={s.label}>Synthesis Output · streaming from Grok-4.5</div>
          </div>
          {nodePills.length > 0 && (
            <div style={s.pills}>
              {nodePills.map((p, i) => <span key={i} style={s.pill}>⬡ {p}</span>)}
            </div>
          )}
          <div style={s.outputSec}>
            {!output && !streaming && (
              <div style={{ color: B.dim, fontSize: 13 }}>
                Click "Run Cross-Synthesis" to stream Grok-4.5's analysis of both archives.<br/><br/>
                The node canvas on the left is already built from your X post archive frequency analysis — showing the highest-frequency concept words from each account and where they overlap.<br/><br/>
                Use <b>[[double brackets]]</b> in your directive to request specific node labels in the output.
              </div>
            )}
            {output && (
              <div style={s.outputText}>
                {cleanOutput.split("**").map((seg, i) =>
                  i % 2 === 1
                    ? <span key={i} style={{ color: AB_COLOR, fontWeight: 700 }}>{seg}</span>
                    : <span key={i}>{seg}</span>
                )}
                {streaming && <span style={s.cursor} />}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

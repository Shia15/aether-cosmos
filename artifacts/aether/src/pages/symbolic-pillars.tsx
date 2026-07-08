import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#5AB8E8", green: "#6EC87A", rose: "#E06878",
  violet: "#C890E8", amber: "#E87035", stone: "#9A8A6E",
};

type TabKey = "pillars" | "cluster" | "constraint" | "celestial";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "pillars",    label: "Pillar Map",       sym: "⊥",  col: C.gold },
  { key: "cluster",    label: "Cluster · Sequence", sym: "⌬",  col: C.cyan },
  { key: "constraint", label: "3 · 6 · 9 Pattern",  sym: "▦",  col: C.violet },
  { key: "celestial",  label: "Celestial Align",   sym: "✦",  col: C.green },
];

// ==== ANIMALS — symbol & colour ====
type Animal = "fox" | "snake" | "bird" | "boar" | "scorpion" | "vulture" | "wildass" | "lion";
const ANIMAL_META: Record<Animal, { sym: string; col: string; label: string }> = {
  fox:      { sym: "🦊", col: C.amber,  label: "Fox" },
  snake:    { sym: "𓆗", col: C.green,  label: "Snake" },
  bird:     { sym: "𓅓", col: C.cyan,   label: "Bird" },
  boar:     { sym: "𓃟", col: C.rose,   label: "Boar" },
  scorpion: { sym: "𓆱", col: C.violet, label: "Scorpion" },
  vulture:  { sym: "𓅐", col: C.gold,   label: "Vulture" },
  wildass:  { sym: "𓃘", col: C.stone,  label: "Wild Ass" },
  lion:     { sym: "𓃭", col: C.goldPale, label: "Lion" },
};

// ==== PILLARS in Enclosure C (positions normalised 0..1) — T-pillars in a ring with 2 central ====
type Pillar = { id: number; name: string; x: number; y: number; animals: Animal[]; vulture?: boolean; central?: boolean };
const PILLARS: Pillar[] = [
  { id: 1,  name: "P1",  x: 0.50, y: 0.16, animals: ["fox", "snake", "snake", "snake"] },
  { id: 2,  name: "P2",  x: 0.66, y: 0.21, animals: ["fox", "boar", "snake"] },
  { id: 3,  name: "P3",  x: 0.78, y: 0.32, animals: ["bird", "boar"] },
  { id: 4,  name: "P4",  x: 0.84, y: 0.48, animals: ["snake", "snake", "snake", "snake", "snake", "snake"] },
  { id: 43, name: "P43 · Vulture Stone", x: 0.86, y: 0.65, animals: ["vulture", "scorpion", "snake", "snake", "snake", "bird", "fox", "boar", "wildass"], vulture: true },
  { id: 5,  name: "P5",  x: 0.74, y: 0.78, animals: ["fox", "bird"] },
  { id: 6,  name: "P6",  x: 0.58, y: 0.84, animals: ["snake", "snake", "snake"] },
  { id: 7,  name: "P7",  x: 0.42, y: 0.84, animals: ["lion", "fox"] },
  { id: 8,  name: "P8",  x: 0.26, y: 0.78, animals: ["bird", "scorpion"] },
  { id: 9,  name: "P9",  x: 0.16, y: 0.65, animals: ["snake", "snake", "snake", "snake", "snake", "snake", "snake", "snake", "snake"] },
  { id: 10, name: "P10", x: 0.14, y: 0.48, animals: ["fox", "wildass"] },
  { id: 11, name: "P11", x: 0.20, y: 0.32, animals: ["bird", "boar", "snake"] },
  { id: 12, name: "P12", x: 0.34, y: 0.21, animals: ["fox", "scorpion", "bird"] },
  // central pair (the two big T-pillars in middle of Enclosure C)
  { id: 18, name: "P18 · Central N", x: 0.50, y: 0.42, animals: ["fox", "bird"], central: true },
  { id: 31, name: "P31 · Central S", x: 0.50, y: 0.58, animals: ["fox", "bird"], central: true },
];

// ==== Sweatman-style constellation mappings ====
const CONSTELLATION: Record<Animal, { name: string; ra: number; dec: number; col: string }> = {
  vulture:  { name: "Sagittarius",   ra: 0.78, dec: 0.66, col: C.gold },
  scorpion: { name: "Scorpius",      ra: 0.62, dec: 0.72, col: C.violet },
  snake:    { name: "Taurids stream",ra: 0.20, dec: 0.34, col: C.green },
  fox:      { name: "Lupus",         ra: 0.55, dec: 0.78, col: C.amber },
  boar:     { name: "Capricornus",   ra: 0.86, dec: 0.62, col: C.rose },
  bird:     { name: "Pisces",        ra: 0.10, dec: 0.40, col: C.cyan },
  wildass:  { name: "Pegasus",       ra: 0.04, dec: 0.30, col: C.stone },
  lion:     { name: "Leo",           ra: 0.40, dec: 0.45, col: C.goldPale },
};

// Stored as a NEGATIVE year to match the slider's BCE = negative convention.
const YOUNGER_DRYAS_BCE = -10950;

function SymbolicPillarsHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const pillars=7;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let p=0;p<pillars;p++){
        const x=60+p*(W-120)/pillars;
        const h=60+30*Math.sin(t*0.025+p*0.8);
        const y=H-h-10;
        const col=["#2ef0d8","#9966ff","#c9a84c","#44aaff","#ff4477","#44cc77","#2ef0d8"][p];
        const grd=ctx.createLinearGradient(0,y,0,H-10);
        grd.addColorStop(0,col+"44");grd.addColorStop(1,col+"08");
        ctx.fillStyle=grd;ctx.fillRect(x-12,y,24,h);
        ctx.strokeStyle=col+"55";ctx.lineWidth=0.5;ctx.strokeRect(x-12,y,24,h);
        ctx.fillStyle=col+"66";ctx.fillRect(x-16,y-6,32,6);
        ctx.fillStyle=col+"66";ctx.fillRect(x-16,H-16,32,6);
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SYMBOLIC PILLARS · ARCHETYPE · FOUNDATIONAL GLYPHS · MEANING · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SymbolicPillarsPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("pillars");
  const tabRef = useRef<TabKey>("pillars");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  const [selectedId, setSelectedId] = useState<number>(43);
  const selectedRef = useRef(selectedId); useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);

  // Cluster tab — edge weight threshold + tracing
  const [edgeThresh, setEdgeThresh] = useState(2);
  const edgeThreshRef = useRef(edgeThresh); useEffect(() => { edgeThreshRef.current = edgeThresh; }, [edgeThresh]);
  const [tracePhase, setTracePhase] = useState(0);   // 0..1 string trace anim
  const traceRef = useRef(tracePhase); useEffect(() => { traceRef.current = tracePhase; }, [tracePhase]);
  const [tracing, setTracing] = useState(false);
  const tracingRef = useRef(tracing); useEffect(() => { tracingRef.current = tracing; }, [tracing]);

  // Celestial tab — date BCE (negative = BCE, positive = CE). Slider domain is fully BCE.
  const [dateBCE, setDateBCE] = useState(YOUNGER_DRYAS_BCE);
  const dateBCERef = useRef(dateBCE); useEffect(() => { dateBCERef.current = dateBCE; }, [dateBCE]);

  // Log + ops
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [ops, setOps] = useState(0);
  function pushLog(tag: string, msg: string, col: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setEvents(e => [{ ts, tag, msg, col }, ...e].slice(0, 24));
    setOps(o => o + 1);
  }

  // ==== Derived: animal frequencies, snake clusters, edges, alignment fit ====
  const stats = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of PILLARS) for (const a of p.animals) counts[a] = (counts[a] ?? 0) + 1;
    const snakeClusters = PILLARS
      .map(p => ({ id: p.id, name: p.name, n: p.animals.filter(a => a === "snake").length }))
      .filter(p => p.n > 0)
      .sort((a, b) => b.n - a.n);
    const triplePillars = snakeClusters.filter(p => p.n % 3 === 0);
    type Edge = { a: Animal; b: Animal; w: number };
    const edges: Edge[] = [];
    for (const p of PILLARS) {
      const uniq = Array.from(new Set(p.animals));
      for (let i = 0; i < uniq.length; i++) for (let j = i + 1; j < uniq.length; j++) {
        const a = uniq[i] as Animal, b = uniq[j] as Animal;
        const idx = edges.findIndex(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
        if (idx === -1) edges.push({ a: a < b ? a : b, b: a < b ? b : a, w: 1 });
        else edges[idx].w++;
      }
    }
    const dt = dateBCE - YOUNGER_DRYAS_BCE;
    const fit = Math.exp(-Math.pow(dt / 1500, 2));
    const sel = PILLARS.find(p => p.id === selectedRef.current) ?? PILLARS[0];
    return { counts, snakeClusters, triplePillars, edges, fit, sel };
  }, [dateBCE, selectedId]);

  // ==== Trace animation ====
  useEffect(() => {
    if (!tracing) { setTracePhase(0); return; }
    let raf = 0; let t0 = performance.now();
    function step(t: number) {
      const e = Math.min(1, (t - t0) / 1800);
      setTracePhase(e);
      if (e < 1) raf = requestAnimationFrame(step);
      else setTracing(false);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [tracing]);

  // ==== Canvas ====
  useEffect(() => {
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0; let phase = 0;

    function fit() {
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      const r = c.getBoundingClientRect();
      c.width = Math.floor(r.width * dpr);
      c.height = Math.floor(r.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    const ro = new ResizeObserver(fit); ro.observe(c);

    function bgGrid(w: number, h: number) {
      ctx!.strokeStyle = "rgba(232,200,120,0.05)"; ctx!.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) { ctx!.beginPath(); ctx!.moveTo(x, 0); ctx!.lineTo(x, h); ctx!.stroke(); }
      for (let y = 0; y < h; y += step) { ctx!.beginPath(); ctx!.moveTo(0, y); ctx!.lineTo(w, y); ctx!.stroke(); }
    }

    function onClick(ev: MouseEvent) {
      if (tabRef.current !== "pillars") return;
      const rect = c!.getBoundingClientRect();
      const w = c!.clientWidth, h = c!.clientHeight;
      const cx = ev.clientX - rect.left, cy = ev.clientY - rect.top;
      let best = -1, bestD = 30;
      for (const p of PILLARS) {
        const px = 40 + p.x * (w - 80), py = 40 + p.y * (h - 80);
        const d = Math.hypot(px - cx, py - cy);
        if (d < bestD) { bestD = d; best = p.id; }
      }
      if (best > 0) {
        setSelectedId(best);
        const pp = PILLARS.find(x => x.id === best)!;
        pushLog("PICK", `${pp.name} · ${pp.animals.length} carvings`, C.gold);
      }
    }
    c.addEventListener("click", onClick);

    function draw() {
      if (!c || !ctx) return;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      bgGrid(w, h);

      const t = tabRef.current;
      if      (t === "pillars")    drawPillars(ctx, w, h, phase);
      else if (t === "cluster")    drawCluster(ctx, w, h, phase);
      else if (t === "constraint") drawConstraint(ctx, w, h, phase);
      else if (t === "celestial")  drawCelestial(ctx, w, h, phase);

      phase += 0.018;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function drawPillars(ctx: CanvasRenderingContext2D, w: number, h: number, ph: number) {
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(232,200,120,0.55)"; ctx.textAlign = "left";
      ctx.fillText("◆ ENCLOSURE C — T-PILLAR RING (top-down)", 14, 24);

      const cx = 40 + 0.5 * (w - 80), cy = 40 + 0.5 * (h - 80);
      const rr = Math.min(w, h) * 0.36;
      ctx.strokeStyle = "rgba(154,138,110,0.4)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = "rgba(154,138,110,0.16)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, rr * 1.1, 0, Math.PI * 2); ctx.stroke();

      for (const p of PILLARS) {
        const px = 40 + p.x * (w - 80), py = 40 + p.y * (h - 80);
        const isSel = p.id === selectedRef.current;
        const isVulture = !!p.vulture;
        const isCentral = !!p.central;
        const pw = isCentral ? 14 : 10, phh = isCentral ? 26 : 22;
        ctx.fillStyle = isSel ? "rgba(232,200,120,0.92)"
                      : isVulture ? "rgba(232,200,120,0.7)"
                      : "rgba(154,138,110,0.55)";
        ctx.strokeStyle = isSel ? C.goldPale : "rgba(220,216,204,0.4)";
        ctx.lineWidth = isSel ? 2 : 1;
        ctx.fillRect(px - pw / 4, py - phh / 2, pw / 2, phh);
        ctx.fillRect(px - pw, py - phh / 2 - 4, pw * 2, 4);
        ctx.strokeRect(px - pw, py - phh / 2 - 4, pw * 2, 4);
        ctx.strokeRect(px - pw / 4, py - phh / 2, pw / 2, phh);
        const uniq = Array.from(new Set(p.animals)) as Animal[];
        uniq.forEach((a, i) => {
          const ax = px + pw + 4 + (i * 5);
          const ay = py - phh / 2 + 2 + (i % 2) * 5;
          ctx.fillStyle = ANIMAL_META[a].col;
          ctx.beginPath(); ctx.arc(ax, ay, 2.4, 0, Math.PI * 2); ctx.fill();
        });
        if (isSel || isVulture || isCentral) {
          ctx.font = isSel ? "bold 10px ui-monospace, JetBrains Mono, monospace" : "9px ui-monospace, JetBrains Mono, monospace";
          ctx.fillStyle = isSel ? C.goldPale : isVulture ? C.gold : "rgba(220,216,204,0.7)";
          ctx.textAlign = "center";
          ctx.fillText(p.name, px, py + phh / 2 + 14);
        } else {
          ctx.font = "8px ui-monospace, JetBrains Mono, monospace";
          ctx.fillStyle = "rgba(154,138,110,0.7)"; ctx.textAlign = "center";
          ctx.fillText(`P${p.id}`, px, py + phh / 2 + 12);
        }
        if (isSel) {
          ctx.strokeStyle = `rgba(232,200,120,${0.3 + 0.2 * Math.sin(ph * 4)})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(px, py, 22, 0, Math.PI * 2); ctx.stroke();
        }
      }

      const sel = PILLARS.find(x => x.id === selectedRef.current)!;
      ctx.font = "10px ui-monospace, JetBrains Mono, monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = "rgba(232,200,120,0.45)";
      ctx.fillText(`SELECTED → ${sel.name}`, 14, h - 36);
      ctx.fillStyle = "rgba(220,216,204,0.85)";
      const carvList = sel.animals.map(a => ANIMAL_META[a].label).join(" · ");
      ctx.fillText(carvList, 14, h - 18);
      ctx.fillStyle = "rgba(96,96,122,0.65)"; ctx.textAlign = "right";
      ctx.fillText("click any pillar →", w - 14, h - 18);
    }

    function drawCluster(ctx: CanvasRenderingContext2D, w: number, h: number, ph: number) {
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(90,184,232,0.55)"; ctx.textAlign = "left";
      ctx.fillText("◆ ANIMAL CO-OCCURRENCE GRAPH", 14, 24);

      const cx = w / 2, cy = h / 2 + 8;
      const rr = Math.min(w, h) * 0.32;
      const animals = Object.keys(ANIMAL_META) as Animal[];
      const N = animals.length;
      const positions: Record<string, { x: number; y: number }> = {};
      animals.forEach((a, i) => {
        const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
        positions[a] = { x: cx + Math.cos(ang) * rr, y: cy + Math.sin(ang) * rr };
      });

      const edges = stats.edges.filter(e => e.w >= edgeThreshRef.current);
      for (const e of edges) {
        const A = positions[e.a], B = positions[e.b];
        const alpha = Math.min(0.85, 0.18 + e.w * 0.16);
        ctx.strokeStyle = `rgba(232,200,120,${alpha})`;
        ctx.lineWidth = 0.6 + e.w * 0.4;
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        ctx.font = "9px ui-monospace, JetBrains Mono, monospace";
        ctx.fillStyle = `rgba(220,216,204,${alpha * 0.9})`; ctx.textAlign = "center";
        ctx.fillText(String(e.w), (A.x + B.x) / 2, (A.y + B.y) / 2 - 4);
      }

      if (traceRef.current > 0) {
        const sorted = [...edges].sort((a, b) => b.w - a.w).slice(0, 6);
        const tp = traceRef.current;
        const upTo = Math.floor(tp * sorted.length);
        ctx.strokeStyle = "rgba(110,200,122,0.95)";
        ctx.lineWidth = 2.5;
        for (let i = 0; i < upTo; i++) {
          const e = sorted[i];
          const A = positions[e.a], B = positions[e.b];
          ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
        }
        if (upTo < sorted.length) {
          const e = sorted[upTo];
          const subT = (tp * sorted.length) % 1;
          const A = positions[e.a], B = positions[e.b];
          ctx.strokeStyle = "rgba(110,200,122,0.95)";
          ctx.beginPath(); ctx.moveTo(A.x, A.y);
          ctx.lineTo(A.x + (B.x - A.x) * subT, A.y + (B.y - A.y) * subT); ctx.stroke();
        }
      }

      for (const a of animals) {
        const P = positions[a];
        const meta = ANIMAL_META[a];
        const cnt = stats.counts[a] ?? 0;
        const r = 14 + Math.min(20, cnt * 1.4);
        ctx.fillStyle = `${meta.col}33`;
        ctx.strokeStyle = meta.col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(P.x, P.y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.font = "11px ui-serif, Georgia, serif";
        ctx.fillStyle = meta.col; ctx.textAlign = "center";
        ctx.fillText(meta.label, P.x, P.y + 4);
        ctx.font = "9px ui-monospace, JetBrains Mono, monospace";
        ctx.fillStyle = "rgba(220,216,204,0.7)";
        ctx.fillText(`×${cnt}`, P.x, P.y + 18);
      }

      ctx.font = "10px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(168,158,136,0.7)"; ctx.textAlign = "left";
      ctx.fillText(`edges shown: ${edges.length} · weight ≥ ${edgeThreshRef.current}`, 14, h - 18);
      ctx.fillStyle = "rgba(110,200,122,0.85)"; ctx.textAlign = "right";
      ctx.fillText(traceRef.current > 0 ? "tracing string-logic path…" : "press TRACE to walk highest-weight path", w - 14, h - 18);
    }

    function drawConstraint(ctx: CanvasRenderingContext2D, w: number, h: number, ph: number) {
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(200,144,232,0.55)"; ctx.textAlign = "left";
      ctx.fillText("◆ ANIMAL FREQUENCY · 3·6·9 CONSTRAINT", 14, 24);

      const animals = (Object.keys(ANIMAL_META) as Animal[]);
      const x0 = 60, x1 = w - 280;
      const y0 = 60, y1 = h - 100;
      const maxC = Math.max(1, ...animals.map(a => stats.counts[a] ?? 0));
      const bandW = (x1 - x0) / animals.length;

      ctx.strokeStyle = "rgba(232,200,120,0.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.lineTo(x1, y1); ctx.stroke();
      for (const m of [3, 6, 9, 12]) {
        const yy = y1 - (m / maxC) * (y1 - y0);
        ctx.strokeStyle = "rgba(200,144,232,0.18)"; ctx.lineWidth = 1;
        ctx.setLineDash([3, 4]);
        ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = "9px ui-monospace, JetBrains Mono, monospace";
        ctx.fillStyle = "rgba(200,144,232,0.55)"; ctx.textAlign = "right";
        ctx.fillText(String(m), x0 - 4, yy + 3);
      }

      animals.forEach((a, i) => {
        const cnt = stats.counts[a] ?? 0;
        const barX = x0 + i * bandW + bandW * 0.18;
        const barW = bandW * 0.64;
        const barH = (cnt / maxC) * (y1 - y0);
        const meta = ANIMAL_META[a];
        const triple = cnt > 0 && cnt % 3 === 0;
        ctx.fillStyle = triple ? meta.col : `${meta.col}55`;
        ctx.fillRect(barX, y1 - barH, barW, barH);
        if (triple) {
          ctx.strokeStyle = C.violet; ctx.lineWidth = 1.5;
          ctx.strokeRect(barX, y1 - barH, barW, barH);
        }
        ctx.font = "9px ui-monospace, JetBrains Mono, monospace";
        ctx.fillStyle = "rgba(220,216,204,0.85)"; ctx.textAlign = "center";
        ctx.fillText(meta.label, barX + barW / 2, y1 + 14);
        ctx.fillStyle = triple ? C.violet : "rgba(168,158,136,0.7)";
        ctx.fillText(`×${cnt}${triple ? "  ▲3" : ""}`, barX + barW / 2, y1 + 26);
      });

      ctx.font = "10px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(224,104,120,0.85)"; ctx.textAlign = "left";
      const missing5 = animals.filter(a => stats.counts[a] === 5).length === 0;
      const missing7 = animals.filter(a => stats.counts[a] === 7).length === 0;
      ctx.fillText(`✕ no count = 5  · ${missing5 ? "constraint holds" : "broken"}`, 14, h - 64);
      ctx.fillText(`✕ no count = 7  · ${missing7 ? "constraint holds" : "broken"}`, 14, h - 48);

      const sx = w - 250, sy = 60;
      ctx.font = "10px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(232,200,120,0.55)"; ctx.textAlign = "left";
      ctx.fillText("SNAKE CLUSTERS (per pillar):", sx, sy);
      let yy = sy + 18;
      for (const sc of stats.snakeClusters.slice(0, 8)) {
        const triple = sc.n % 3 === 0;
        ctx.fillStyle = triple ? C.violet : "rgba(168,158,136,0.85)";
        ctx.fillText(`${sc.name.padEnd(20)} ×${sc.n}${triple ? "  ▲3" : ""}`, sx, yy);
        yy += 14;
      }
      ctx.fillStyle = C.violet; ctx.font = "italic 11px ui-serif, Georgia, serif";
      ctx.fillText(`${stats.triplePillars.length} pillars satisfy n ∈ {3, 6, 9, …}`, sx, yy + 8);
    }

    function drawCelestial(ctx: CanvasRenderingContext2D, w: number, h: number, ph: number) {
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(110,200,122,0.55)"; ctx.textAlign = "left";
      ctx.fillText("◆ SKY OVERLAY · SWEATMAN MAPPING", 14, 24);

      ctx.fillStyle = "rgba(8,9,18,0.8)";
      ctx.fillRect(40, 40, w - 80, h - 80);
      for (let i = 0; i < 280; i++) {
        const sx = 40 + ((i * 53) % (w - 80));
        const sy = 40 + ((i * 97) % (h - 80));
        const sr = (i % 7 === 0) ? 1.6 : 0.9;
        ctx.fillStyle = `rgba(220,216,204,${0.25 + 0.5 * Math.sin(ph + i)})`;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }

      const dt = dateBCERef.current - YOUNGER_DRYAS_BCE;
      const offX = (dt / 25772) * (w - 80) * 0.4;

      const animals = Object.keys(ANIMAL_META) as Animal[];
      for (const a of animals) {
        const meta = ANIMAL_META[a];
        const con = CONSTELLATION[a];
        const cnt = stats.counts[a] ?? 0;
        if (cnt === 0) continue;
        const sxRaw = con.ra * (w - 80) + offX;
        const wrap = (((sxRaw % (w - 80)) + (w - 80)) % (w - 80));
        const sx = 40 + wrap;
        const sy = 40 + con.dec * (h - 80);
        const r = 8 + Math.min(16, cnt);
        ctx.fillStyle = `${con.col}22`;
        ctx.beginPath(); ctx.arc(sx, sy, r * 1.8, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = con.col; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.stroke();
        ctx.font = "10px ui-serif, Georgia, serif";
        ctx.fillStyle = con.col; ctx.textAlign = "center";
        ctx.fillText(con.name, sx, sy + r + 12);
        ctx.font = "9px ui-monospace, JetBrains Mono, monospace";
        ctx.fillStyle = "rgba(220,216,204,0.7)";
        ctx.fillText(`${meta.label} ×${cnt}`, sx, sy + r + 24);
      }

      const fit = stats.fit;
      const gx = w - 260, gy = 56;
      ctx.font = "10px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(232,200,120,0.55)"; ctx.textAlign = "left";
      ctx.fillText("ALIGNMENT FIT", gx, gy);
      ctx.strokeStyle = "rgba(232,200,120,0.2)";
      ctx.strokeRect(gx, gy + 8, 200, 8);
      ctx.fillStyle = fit > 0.85 ? C.green : fit > 0.4 ? C.gold : C.rose;
      ctx.fillRect(gx, gy + 8, fit * 200, 8);
      ctx.fillStyle = "rgba(220,216,204,0.85)";
      ctx.fillText(`${(fit * 100).toFixed(0)}%`, gx + 210, gy + 16);

      ctx.fillStyle = "rgba(232,200,120,0.55)";
      ctx.fillText(`year: ${formatYear(dateBCERef.current)}`, gx, gy + 40);
      ctx.fillStyle = fit > 0.85 ? C.green : "rgba(168,158,136,0.85)";
      ctx.fillText(fit > 0.85 ? "▲ LOCK · Younger Dryas window" : `Δt to YD = ${Math.abs(dt)} yr`, gx, gy + 56);

      ctx.font = "italic 11px ui-serif, Georgia, serif";
      ctx.fillStyle = "rgba(220,216,204,0.7)"; ctx.textAlign = "center";
      ctx.fillText("Pillar 43 / Vulture Stone · Sweatman et al. encoding hypothesis (~10,950 BCE)", w / 2, h - 18);
    }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); c.removeEventListener("click", onClick); };
  }, [stats.edges, stats.counts, stats.fit, stats.snakeClusters, stats.triplePillars, edgeThresh, dateBCE, selectedId]);

  const setEdgeThreshL = (v: number) => { setEdgeThresh(Math.round(v)); pushLog("EDGE", `threshold = ${Math.round(v)}`, C.cyan); };
  const setDateBCEL = (v: number) => {
    setDateBCE(Math.round(v));
    const dt = Math.abs(Math.round(v) - YOUNGER_DRYAS_BCE);
    pushLog("DATE", `${formatYear(Math.round(v))} · Δ YD = ${dt} yr`, dt < 500 ? C.green : C.gold);
  };
  function startTrace() {
    setTracing(true); setTracePhase(0);
    pushLog("TRACE", "string-logic path · top-6 edges", C.cyan);
  }
  function snapToYD() {
    setDateBCE(YOUNGER_DRYAS_BCE);
    pushLog("LOCK", `snap to ${formatYear(YOUNGER_DRYAS_BCE)} · Younger Dryas`, C.green);
  }

  useEffect(() => {
    pushLog("INIT", "Symbolic Pillar Mapper online", C.gold);
    pushLog("READY", `${PILLARS.length} pillars · ${Object.keys(ANIMAL_META).length} animal types`, C.cyan);
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ background: C.bg, color: C.text, fontFamily: "ui-sans-serif, system-ui" }}>
      <header className="mb-6">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: C.muted }}>
          AETHER · SYMBOLIC PILLAR MAPPER · GÖBEKLI TEPE ~9600–8200 BCE
        </div>
        <h1 className="text-4xl mt-2" style={{ fontFamily: "Cinzel, ui-serif, Georgia, serif", color: C.white, letterSpacing: "0.04em" }}>
          Symbolic Pillars · Stone Memory System
        </h1>
        <p className="text-sm mt-2 max-w-3xl" style={{ color: C.text }}>
          Animals as graph nodes · pillars as data structures · 3·6·9 snake clusters as constraint
          rules · Pillar 43 as a star map possibly encoding the Younger Dryas event around 10,950 BCE.
          A pre-digital symbolic operating system — read it like one.
        </p>
      </header>

      <div className="flex gap-2 mb-5" data-testid="sp-tabs">
        {TABS.map(tDef => {
          const active = tab === tDef.key;
          return (
            <button key={tDef.key}
              data-testid={`tab-${tDef.key}`}
              aria-pressed={active}
              aria-label={`Switch to ${tDef.label} workbench`}
              onClick={() => { setTab(tDef.key); pushLog("TAB", tDef.label, tDef.col); }}
              className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border transition"
              style={{
                borderColor: active ? tDef.col : C.border,
                background: active ? `${tDef.col}1A` : "transparent",
                color: active ? tDef.col : C.text,
              }}>
              <span className="mr-2">{tDef.sym}</span>{tDef.label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5" style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}>
        <div>
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="flex justify-between items-center px-4 py-2 border-b" style={{ borderColor: C.border }}>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TABS.find(t => t.key === tab)!.col }}>
                <span className="mr-2">●</span>{TABS.find(t => t.key === tab)!.label} · LIVE RENDER
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                ops: <span style={{ color: C.gold }}>{ops}</span> · {PILLARS.length} pillars · {sumAnimals()} carvings
              </div>
            </div>
            <canvas ref={cvRef} data-testid="sp-canvas" style={{ width: "100%", height: 480, display: "block", cursor: tab === "pillars" ? "pointer" : "default" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "pillars" && (
                <>
                  <Title col={C.gold}>Pillar Map · click any T-pillar to inspect</Title>
                  <Body>
                    The Enclosure C ring of T-pillars from the early Pre-Pottery Neolithic A site at
                    Göbekli Tepe. Each pillar carries animal carvings — colour-coded dots beside each
                    pillar show which species appear there. Pillar 43 (the Vulture Stone) is the most
                    information-dense and is highlighted in gold.
                  </Body>
                  <div className="mt-4 grid gap-2" style={{ gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
                    {PILLARS.map(p => (
                      <button key={p.id} data-testid={`btn-pillar-${p.id}`}
                        aria-pressed={selectedId === p.id}
                        aria-label={`Select ${p.name}`}
                        onClick={() => { setSelectedId(p.id); pushLog("PICK", `${p.name} · ${p.animals.length} carvings`, C.gold); }}
                        className="px-2 py-1.5 text-[10px] tracking-[0.1em] uppercase border text-left"
                        style={{ borderColor: selectedId === p.id ? C.gold : C.border, background: selectedId === p.id ? `${C.gold}1A` : "transparent", color: selectedId === p.id ? C.gold : C.text }}>
                        {p.name}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Stat k="selected"  v={stats.sel.name}                                         c={C.gold} />
                    <Stat k="carvings"  v={String(stats.sel.animals.length)}                       c={C.cyan} />
                    <Stat k="snakes"    v={String(stats.sel.animals.filter(a => a === "snake").length)} c={C.green} />
                  </div>
                </>
              )}

              {tab === "cluster" && (
                <>
                  <Title col={C.cyan}>Cluster · Sequence — co-occurrence graph</Title>
                  <Body>
                    Every pair of animals carved on the same pillar gets an edge; the edge weight
                    is the number of pillars they share. The thickest threads — Snake↔Fox,
                    Snake↔Bird, Fox↔Bird — form the spine of the symbol system. Press TRACE to
                    walk the highest-weight edges as a string-logic path.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <Slider id="edge" label="edge weight ≥" value={edgeThresh} min={1} max={6} step={1} col={C.cyan} fmt={v => v.toFixed(0)} onChange={setEdgeThreshL} />
                    <button onClick={startTrace} data-testid="btn-trace"
                      aria-pressed={tracing}
                      aria-label="Trace string-logic path through highest-weight edges"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-end"
                      style={{ borderColor: C.border2, color: tracing ? C.green : C.cyan }}>
                      {tracing ? "tracing…" : "trace path"}
                    </button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Stat k="edges (≥ threshold)" v={String(stats.edges.filter(e => e.w >= edgeThresh).length)} c={C.cyan} />
                    <Stat k="strongest pair"     v={topPair(stats.edges)}                                      c={C.gold} />
                    <Stat k="total animals"      v={String(Object.keys(stats.counts).length)}                  c={C.green} />
                  </div>
                </>
              )}

              {tab === "constraint" && (
                <>
                  <Title col={C.violet}>3·6·9 Constraint Recognition</Title>
                  <Body>
                    Snake counts on pillars cluster heavily on multiples of 3 — three on Pillar 1,
                    six on Pillar 4, nine on Pillar 9, three on Pillar 6 — while 5 and 7 simply
                    do not appear. The bars highlight every animal whose total carving count is
                    a multiple of 3 (▲3); the missing-counts banner confirms the rule holds.
                  </Body>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Stat k="3-rule pillars" v={String(stats.triplePillars.length)}              c={C.violet} />
                    <Stat k="rule: ¬5"       v={Object.values(stats.counts).some(v => v === 5) ? "broken" : "holds"} c={C.green} />
                    <Stat k="rule: ¬7"       v={Object.values(stats.counts).some(v => v === 7) ? "broken" : "holds"} c={C.green} />
                  </div>
                </>
              )}

              {tab === "celestial" && (
                <>
                  <Title col={C.green}>Celestial Alignment · Sweatman Mapping</Title>
                  <Body>
                    The Sweatman et al. hypothesis maps each animal on Pillar 43 to a constellation
                    near the galactic centre. Scrub the date slider through the late Pleistocene —
                    the alignment fit (a Gaussian centred on 10,950 BCE with σ ≈ 1500 yr) climbs
                    sharply near the Younger Dryas onset and locks above 85%.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <Slider id="date" label={`year: ${formatYear(dateBCE)}`} value={dateBCE} min={-13000} max={-1000} step={50} col={C.green} fmt={v => formatYear(Math.round(v))} onChange={setDateBCEL} />
                    <button onClick={snapToYD} data-testid="btn-snap-yd"
                      aria-label="Snap to Younger Dryas date 10950 BCE"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-end"
                      style={{ borderColor: C.border2, color: C.green }}>
                      snap to Younger Dryas
                    </button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Stat k="alignment fit" v={`${(stats.fit * 100).toFixed(0)}%`}                    c={stats.fit > 0.85 ? C.green : C.gold} />
                    <Stat k="year"          v={formatYear(dateBCE)}                                   c={C.cyan} />
                    <Stat k="lock window"   v={stats.fit > 0.85 ? "▲ LOCK" : `Δ = ${Math.abs(dateBCE - YOUNGER_DRYAS_BCE)} yr`} c={stats.fit > 0.85 ? C.green : C.muted} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>HOW THE FOUR LAYERS FIT — pre-digital information system</div>
            <div className="grid gap-3 text-[12px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.gold }}>1 · Pillars = data structures</div>
                <div style={{ color: C.text }}>
                  Each T-pillar is an addressable record. Pillar 43 carries the densest payload —
                  vulture, scorpion, three snakes, fox, bird, boar, wild ass — read together as one
                  composite glyph.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.cyan }}>2 · Animals = symbol nodes</div>
                <div style={{ color: C.text }}>
                  Co-occurrence on the same pillar is the edge. Snake-fox-bird is the recurring
                  triplet that ties the graph together; the edge weights tell you which symbols
                  travel as a unit.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.violet }}>3 · Repetition = weighting + rule</div>
                <div style={{ color: C.text }}>
                  Snakes appear in groups of 3, 6, 9. Counts of 5 and 7 are absent — a hard
                  constraint that looks engineered, not random. The system has a syntactic rule.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.green }}>4 · Alignment = temporal index</div>
                <div style={{ color: C.text }}>
                  Pillar 43 lines up with the Sagittarius / Scorpius region around 10,950 BCE —
                  the onset of the Younger Dryas. The geometry is the timestamp.
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside>
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              TELEMETRY
            </div>
            <div className="p-4 text-[11px] space-y-2">
              <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label}             c={TABS.find(t => t.key === tab)!.col} />
              <Row k="pillars"          v={String(PILLARS.length)}                            c={C.gold} />
              <Row k="animal carvings"  v={String(sumAnimals())}                              c={C.cyan} />
              <Row k="animal types"     v={String(Object.keys(ANIMAL_META).length)}           c={C.cyan} />
              <Row k="snake total"      v={String(stats.counts["snake"] ?? 0)}                c={C.green} />
              <Row k="3-rule pillars"   v={String(stats.triplePillars.length)}                c={C.violet} />
              <Row k="selected pillar"  v={stats.sel.name}                                    c={C.gold} />
              <Row k="alignment fit"    v={`${(stats.fit * 100).toFixed(0)}%`}                c={stats.fit > 0.85 ? C.green : C.gold} />
              <Row k="ops"              v={String(ops)}                                       c={C.gold} />
            </div>
          </div>

          <div className="border mt-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              ANIMAL FREQUENCIES
            </div>
            <div className="p-4 space-y-3">
              {(Object.keys(ANIMAL_META) as Animal[]).map(a => {
                const cnt = stats.counts[a] ?? 0;
                const max = Math.max(1, ...(Object.values(stats.counts) as number[]));
                return <Bar key={a} label={ANIMAL_META[a].label} val={cnt / max} cnt={cnt} c={ANIMAL_META[a].col} />;
              })}
            </div>
          </div>

          <div className="border mt-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              EVENT LOG
            </div>
            <div className="p-3 max-h-72 overflow-auto text-[10px] space-y-1" data-testid="event-log">
              {events.map((e, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span style={{ color: C.muted }}>{e.ts}</span>
                  <span style={{ color: e.col, minWidth: 56 }}>[{e.tag}]</span>
                  <span style={{ color: C.text }}>{e.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function sumAnimals(): number {
  return PILLARS.reduce((acc, p) => acc + p.animals.length, 0);
}
function formatYear(yr: number): string {
  return yr < 0 ? `${Math.abs(yr)} BCE` : `${yr} CE`;
}
function topPair(edges: { a: string; b: string; w: number }[]): string {
  const sorted = [...edges].sort((a, b) => b.w - a.w)[0];
  return sorted ? `${sorted.a}↔${sorted.b} ×${sorted.w}` : "—";
}

function Title({ children, col }: { children: React.ReactNode; col: string }) {
  return <div className="text-[15px] mb-2" style={{ fontFamily: "Cinzel, ui-serif, Georgia, serif", color: col, letterSpacing: "0.05em" }}>{children}</div>;
}
function Body({ children }: { children: React.ReactNode }) {
  return <div className="text-[12.5px] leading-relaxed" style={{ color: C.text }}>{children}</div>;
}
function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="border px-3 py-2" style={{ borderColor: C.border }}>
      <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: C.muted }}>{k}</div>
      <div className="mt-1" style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</div>
    </div>
  );
}
function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="flex justify-between">
      <span style={{ color: C.muted }}>{k}</span>
      <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</span>
    </div>
  );
}
function Bar({ label, val, cnt, c }: { label: string; val: number; cnt: number; c: string }) {
  const triple = cnt > 0 && cnt % 3 === 0;
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>×{cnt}{triple ? " ▲3" : ""}</span>
      </div>
      <div className="h-[3px]" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full" style={{ width: `${val * 100}%`, background: c }} />
      </div>
    </div>
  );
}
function Slider({ id, label, value, min, max, step, col, fmt, onChange }:
  { id: string; label: string; value: number; min: number; max: number; step: number; col: string; fmt: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        onInput={e => onChange(parseFloat((e.target as HTMLInputElement).value))}
        data-testid={`slider-${id}`} aria-label={label}
        className="w-full" />
    </div>
  );
}

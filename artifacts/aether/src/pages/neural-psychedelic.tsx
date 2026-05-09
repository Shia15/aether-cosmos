import { useState, useEffect, useRef, useCallback } from "react";

const C = {
  bg: "#020810", panel: "#060d1a",
  teal: "#00e5c0", violet: "#b47ef8", gold: "#c9a227",
  blue: "#4db8ff", rose: "#f472b6", green: "#4ade80",
  white: "#e2e8f0", dim: "#4a6080",
};

// ── SCALE definitions — quantum → consciousness ────────────────────────────────
const SCALES = [
  { id: "quantum",    label: "Quantum",      m: "10⁻¹⁵ m",  color: "#b47ef8", desc: "Quantum coherence in microtubules · Penrose-Hameroff Orch-OR · photon-phonon coupling" },
  { id: "molecular",  label: "Molecular",    m: "10⁻⁹ m",   color: "#4db8ff", desc: "Neurotransmitter binding · receptor conformational change · ion channel gating" },
  { id: "synaptic",   label: "Synaptic",     m: "10⁻⁶ m",   color: "#00e5c0", desc: "Synaptic vesicle release · LTP/LTD · spine morphogenesis · STDP windows" },
  { id: "cellular",   label: "Cellular",     m: "10⁻⁵ m",   color: "#4ade80", desc: "Action potential propagation · dendritic computation · axonal myelination" },
  { id: "circuit",    label: "Circuit",      m: "10⁻³ m",   color: "#f59e0b", desc: "Cortical columns · thalamo-cortical loops · gamma oscillations (40 Hz)" },
  { id: "region",     label: "Region",       m: "10⁻² m",   color: "#fb923c", desc: "Hippocampal–prefrontal dialogue · default mode network · salience network" },
  { id: "whole",      label: "Whole Brain",  m: "10⁻¹ m",   color: "#fb7185", desc: "Global workspace theory · integrated information (Φ) · binding problem" },
  { id: "conscious",  label: "Consciousness",m: "?",         color: "#c9a227", desc: "Integrated Information Theory · Global Workspace · predictive processing — the hard problem" },
];

// ── Multiscale canvas ─────────────────────────────────────────────────────────
function drawMultiscale(canvas: HTMLCanvasElement, t: number, activeIdx: number) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const nS = SCALES.length;
  const rowH = H / nS;

  SCALES.forEach((sc, i) => {
    const y0 = i * rowH, y1 = y0 + rowH;
    const cy = (y0 + y1) / 2;
    const isActive = i === activeIdx;
    const glow = Math.exp(-Math.abs(i - activeIdx) * 0.7);

    // Background band
    ctx.fillStyle = isActive ? `${sc.color}14` : `rgba(255,255,255,0.01)`;
    ctx.fillRect(0, y0, W, rowH);

    // Left colour bar
    ctx.fillStyle = sc.color;
    ctx.globalAlpha = 0.3 + glow * 0.6;
    ctx.fillRect(0, y0 + 2, 4, rowH - 4);
    ctx.globalAlpha = 1;

    // Animated oscillation line
    ctx.strokeStyle = sc.color;
    ctx.lineWidth = isActive ? 2 : 0.8;
    ctx.globalAlpha = 0.15 + glow * 0.75;
    const freq = 2 + i * 0.6;
    const amp = rowH * 0.3 * (isActive ? 1 : 0.4);
    ctx.beginPath();
    for (let x = 80; x <= W - 60; x += 2) {
      const wave = Math.sin((x / W) * freq * Math.PI * 2 + t * (0.8 + i * 0.15)) * amp
        + Math.sin((x / W) * freq * 3 * Math.PI + t * 1.1 * (i % 2 === 0 ? 1 : -1)) * amp * 0.3;
      x === 80 ? ctx.moveTo(x, cy + wave) : ctx.lineTo(x, cy + wave);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Scale label
    ctx.fillStyle = sc.color;
    ctx.globalAlpha = 0.5 + glow * 0.5;
    ctx.font = `bold ${isActive ? 11 : 9}px 'DM Mono',monospace`;
    ctx.textAlign = "left";
    ctx.fillText(sc.label.toUpperCase(), 12, cy - 6);
    ctx.globalAlpha = 0.35 + glow * 0.35;
    ctx.font = "9px 'DM Mono',monospace";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(sc.m, 12, cy + 8);
    ctx.globalAlpha = 1;

    // Vertical connections between scales
    if (i < nS - 1) {
      const pulse = (Math.sin(t * 1.5 - i * 0.7) + 1) / 2;
      ctx.strokeStyle = sc.color;
      ctx.lineWidth = 0.8;
      ctx.globalAlpha = 0.1 + (i === activeIdx || i + 1 === activeIdx ? pulse * 0.4 : 0);
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(W / 2, y1 - 2); ctx.lineTo(W / 2, y1 + 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
    }
  });
}

// ── Receptor binding canvas ───────────────────────────────────────────────────
const RECEPTORS = [
  { id: "5HT2A", label: "5-HT₂A", x: 0.3, y: 0.35, color: "#b47ef8", ligands: ["Serotonin","Psilocin","DMT","LSD"] },
  { id: "5HT1A", label: "5-HT₁A", x: 0.7, y: 0.3,  color: "#4db8ff", ligands: ["Serotonin","Buspirone"] },
  { id: "NMDA",  label: "NMDA",   x: 0.5, y: 0.65, color: "#00e5c0", ligands: ["Glutamate","Ketamine","PCP"] },
  { id: "GABA",  label: "GABAₐ",  x: 0.2, y: 0.7,  color: "#4ade80", ligands: ["GABA","Benzodiazepine","Ethanol"] },
  { id: "D2",    label: "D₂",     x: 0.8, y: 0.65, color: "#f59e0b", ligands: ["Dopamine","Haloperidol"] },
];

const COMPOUNDS = [
  { name: "Psilocin",   targets: ["5HT2A","5HT1A"], color: "#b47ef8", effect: "Default Mode Network suppression · ego dissolution · pattern amplification" },
  { name: "DMT",        targets: ["5HT2A","NMDA"],  color: "#f472b6", effect: "Sigma-1 agonism · endogenous psychedelic · rapid onset tryptamine" },
  { name: "LSD",        targets: ["5HT2A","D2"],    color: "#4db8ff", effect: "High affinity 5-HT₂A partial agonist · β-arrestin bias · 12hr duration" },
  { name: "Ketamine",   targets: ["NMDA"],           color: "#00e5c0", effect: "NMDA antagonism · glutamate surge · rapid antidepressant · dissociation" },
  { name: "Serotonin",  targets: ["5HT2A","5HT1A"], color: "#4ade80", effect: "Endogenous monoamine · mood/cognition/perception homeostasis" },
];

function drawReceptors(canvas: HTMLCanvasElement, t: number, compound: string, bindProg: number) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const comp = COMPOUNDS.find(c => c.name === compound);
  if (!comp) return;

  // Neural membrane background
  ctx.fillStyle = "rgba(6,13,26,0.8)";
  ctx.fillRect(0, 0, W, H);
  // Membrane line
  ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 2;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 4) {
    const y = H * 0.5 + Math.sin(x * 0.02 + t * 0.4) * 8;
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = "rgba(0,229,192,0.04)";
  ctx.fillRect(0, 0, W, H * 0.5);

  // Draw receptors
  RECEPTORS.forEach(rec => {
    const rx = rec.x * W, ry = rec.y * H;
    const isTarget = comp.targets.includes(rec.id);
    const pulse = isTarget ? (Math.sin(t * 2.5) + 1) / 2 * bindProg : 0;
    const R = 28 + pulse * 12;

    // Outer glow
    const grad = ctx.createRadialGradient(rx, ry, 0, rx, ry, R * 2);
    grad.addColorStop(0, `${rec.color}${isTarget ? "40" : "10"}`);
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad; ctx.fillRect(0, 0, W, H);

    // Receptor body
    ctx.fillStyle = `${rec.color}${isTarget ? "30" : "12"}`;
    ctx.strokeStyle = rec.color;
    ctx.lineWidth = isTarget ? 2 : 0.8;
    ctx.globalAlpha = 0.5 + pulse * 0.5;
    ctx.beginPath(); ctx.arc(rx, ry, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.globalAlpha = 1;

    // Binding site notch
    ctx.strokeStyle = rec.color; ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4 + pulse * 0.4;
    ctx.beginPath(); ctx.arc(rx, ry - R + 6, 10, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;

    // Label
    ctx.fillStyle = rec.color; ctx.font = `bold 11px 'DM Mono',monospace`; ctx.textAlign = "center";
    ctx.globalAlpha = 0.7 + pulse * 0.3;
    ctx.fillText(rec.label, rx, ry + 4);
    ctx.globalAlpha = 1;

    // Animated ligand approaching the receptor
    if (isTarget && bindProg > 0.05) {
      for (let k = 0; k < 3; k++) {
        const angle = t * 1.2 + k * (Math.PI * 2 / 3);
        const dist = R * 1.8 * (1 - bindProg * 0.6);
        const lx = rx + Math.cos(angle) * dist;
        const ly = ry + Math.sin(angle) * dist;
        ctx.fillStyle = comp.color;
        ctx.globalAlpha = bindProg * 0.75;
        ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  });

  // Compound label
  ctx.fillStyle = comp.color; ctx.font = "bold 12px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.fillText(compound.toUpperCase() + " · BINDING SIMULATION", W / 2, 22);
}

// ── Organoid growth canvas ────────────────────────────────────────────────────
interface ONode { x: number; y: number; r: number; age: number; type: number }

function drawOrganoid(canvas: HTMLCanvasElement, t: number, nodes: ONode[], growth: number) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;
  const COLS = ["#00e5c0", "#b47ef8", "#4db8ff", "#f472b6", "#c9a227"];

  // Outer sphere
  const outerR = growth * Math.min(W, H) * 0.38;
  const outerG = ctx.createRadialGradient(cx, cy, 0, cx, cy, outerR);
  outerG.addColorStop(0, "rgba(0,229,192,0.04)");
  outerG.addColorStop(0.7, "rgba(180,126,248,0.06)");
  outerG.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = outerG; ctx.fillRect(0, 0, W, H);

  // Boundary
  ctx.strokeStyle = "rgba(0,229,192,0.18)"; ctx.lineWidth = 1.2;
  ctx.setLineDash([4, 6]);
  ctx.beginPath(); ctx.arc(cx, cy, outerR, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);

  // Connections
  ctx.lineWidth = 0.6;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[i].x - nodes[j].x;
      const dy = nodes[i].y - nodes[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 70) {
        const pulse = (Math.sin(t * 2 + i * 0.5 + j * 0.3) + 1) / 2;
        ctx.globalAlpha = (1 - d / 70) * 0.25 * pulse;
        ctx.strokeStyle = COLS[nodes[i].type];
        ctx.beginPath(); ctx.moveTo(nodes[i].x, nodes[i].y); ctx.lineTo(nodes[j].x, nodes[j].y); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // Nodes
  nodes.forEach((n, i) => {
    const col = COLS[n.type];
    const activity = (Math.sin(t * 2.5 + i * 0.6) + 1) / 2;
    const r = n.r * (1 + activity * 0.3);
    ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.shadowColor = col; ctx.shadowBlur = 8 * activity;
    ctx.globalAlpha = 0.5 + activity * 0.4;
    ctx.fill();
    ctx.shadowBlur = 0; ctx.globalAlpha = 1;
  });

  // Labels
  ctx.fillStyle = "rgba(0,229,192,0.35)"; ctx.font = "9px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.fillText(`ORGANOID · ${nodes.length} CELLS · ${(growth * 100).toFixed(0)}% GROWN`, cx, H - 16);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
type Tab = "multiscale" | "receptors" | "organoid";

export default function NeuralPsychedelicPage() {
  const [tab, setTab] = useState<Tab>("multiscale");
  const [scaleIdx, setScaleIdx] = useState(3);
  const [compound, setCompound] = useState("Psilocin");
  const [bindProgress, setBindProgress] = useState(0);
  const [orgGrowth, setOrgGrowth] = useState(0.3);
  const [orgNodes, setOrgNodes] = useState<ONode[]>([]);

  const msRef = useRef<HTMLCanvasElement>(null);
  const recRef = useRef<HTMLCanvasElement>(null);
  const orgRef = useRef<HTMLCanvasElement>(null);
  const rafMs = useRef(0);
  const rafRec = useRef(0);
  const rafOrg = useRef(0);

  // Init organoid nodes
  useEffect(() => {
    const W = 500, H = 380, cx = W / 2, cy = H / 2;
    const n = 60;
    setOrgNodes(Array.from({ length: n }, (_, i) => {
      const a = Math.random() * Math.PI * 2;
      const r2 = Math.sqrt(Math.random()) * 150 * orgGrowth;
      return { x: cx + Math.cos(a) * r2, y: cy + Math.sin(a) * r2, r: 3 + Math.random() * 4, age: Math.random(), type: Math.floor(Math.random() * 5) };
    }));
  }, []);

  // Grow organoid
  const growMore = useCallback(() => {
    setOrgGrowth(g => Math.min(1, g + 0.08));
    setOrgNodes(prev => {
      const W = 500, H = 380, cx = W / 2, cy = H / 2;
      const newNodes: ONode[] = Array.from({ length: 8 }, () => {
        const a = Math.random() * Math.PI * 2;
        const r2 = Math.sqrt(Math.random()) * 190 * orgGrowth;
        return { x: cx + Math.cos(a) * r2, y: cy + Math.sin(a) * r2, r: 3 + Math.random() * 4, age: 0, type: Math.floor(Math.random() * 5) };
      });
      return [...prev.slice(-80), ...newNodes];
    });
  }, [orgGrowth]);

  // Bind animation
  const triggerBind = useCallback(() => {
    setBindProgress(0);
    let p = 0;
    const interval = setInterval(() => {
      p += 0.02;
      setBindProgress(Math.min(1, p));
      if (p >= 1) clearInterval(interval);
    }, 30);
  }, []);

  // Canvas loops
  useEffect(() => {
    const canvas = msRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawMultiscale(canvas, (Date.now() - st) / 1000, scaleIdx); rafMs.current = requestAnimationFrame(loop); };
    rafMs.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafMs.current);
  }, [scaleIdx]);

  useEffect(() => {
    const canvas = recRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawReceptors(canvas, (Date.now() - st) / 1000, compound, bindProgress); rafRec.current = requestAnimationFrame(loop); };
    rafRec.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRec.current);
  }, [compound, bindProgress]);

  useEffect(() => {
    const canvas = orgRef.current; if (!canvas) return;
    const st = Date.now();
    const loop = () => { drawOrganoid(canvas, (Date.now() - st) / 1000, orgNodes, orgGrowth); rafOrg.current = requestAnimationFrame(loop); };
    rafOrg.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafOrg.current);
  }, [orgNodes, orgGrowth]);

  const panel = { background: "rgba(6,13,26,0.9)", border: "1px solid rgba(0,229,192,0.1)", borderRadius: 12 };
  const tabBtn = (id: Tab, label: string, color: string) => (
    <button onClick={() => setTab(id)} style={{
      fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.2em",
      padding: "0.4rem 1rem", borderRadius: 6, cursor: "pointer", border: `1px solid`,
      borderColor: tab === id ? color : "rgba(255,255,255,0.08)",
      background: tab === id ? `${color}18` : "transparent",
      color: tab === id ? color : "rgba(255,255,255,0.3)", textTransform: "uppercase",
    }}>{label}</button>
  );

  const activeScale = SCALES[scaleIdx];
  const activeComp = COMPOUNDS.find(c => c.name === compound)!;

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.white, fontFamily: "'DM Mono',monospace", overflowY: "auto" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(0,229,192,0.1)", padding: "2rem 2.5rem 1.5rem" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: C.teal, textTransform: "uppercase", marginBottom: 8 }}>
          AETHER · NEURAL SYSTEMS
        </div>
        <h1 style={{ fontSize: "2.4rem", fontFamily: "'Cinzel',serif", color: C.white, margin: "0 0 0.5rem" }}>
          Neural Multiscale · Psychedelics · Organoids
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 740, lineHeight: 1.7, margin: "0 0 1.2rem" }}>
          From quantum coherence in microtubules to global conscious integration — the AETHER neural stack spans
          twelve orders of magnitude. Psychedelic compounds reveal the architecture of consciousness by dismantling its
          default structures. Cerebral organoids grow that architecture in a dish.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          {tabBtn("multiscale", "⟡ Multiscale", C.teal)}
          {tabBtn("receptors",  "⬡ Receptor Map", C.violet)}
          {tabBtn("organoid",   "◈ Organoid", C.rose)}
        </div>
      </div>

      <div style={{ padding: "1.8rem 2.5rem" }}>

        {/* ── MULTISCALE TAB ── */}
        {tab === "multiscale" && (
          <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.5rem" }}>
            {/* Scale selector */}
            <div style={{ ...panel, padding: "1rem 1.2rem", height: "fit-content" }}>
              <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.teal, textTransform: "uppercase", marginBottom: 12 }}>
                Scale Navigator
              </div>
              {SCALES.map((sc, i) => (
                <div key={sc.id} onClick={() => setScaleIdx(i)}
                  style={{
                    padding: "0.65rem 0.9rem", marginBottom: 6, borderRadius: 8, cursor: "pointer",
                    background: i === scaleIdx ? `${sc.color}12` : "transparent",
                    border: `1px solid ${i === scaleIdx ? sc.color + "40" : "rgba(255,255,255,0.04)"}`,
                    transition: "all 0.2s",
                  }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: sc.color, fontWeight: "bold", letterSpacing: "0.15em" }}>{sc.label.toUpperCase()}</span>
                    <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{sc.m}</span>
                  </div>
                  {i === scaleIdx && (
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", lineHeight: 1.55 }}>{sc.desc}</div>
                  )}
                </div>
              ))}
            </div>

            {/* Canvas + info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ ...panel, overflow: "hidden" }}>
                <canvas ref={msRef} width={700} height={500} style={{ width: "100%", height: "auto", display: "block" }} />
              </div>
              <div style={{ ...panel, padding: "1rem 1.2rem", borderLeft: `3px solid ${activeScale.color}` }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: activeScale.color, textTransform: "uppercase", marginBottom: 6 }}>
                  Active Scale · {activeScale.label} · {activeScale.m}
                </div>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.7, margin: "0 0 0.8rem" }}>{activeScale.desc}</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                  {[
                    { k: "Scale", v: activeScale.m },
                    { k: "Below", v: SCALES[scaleIdx - 1]?.label ?? "—" },
                    { k: "Above", v: SCALES[scaleIdx + 1]?.label ?? "—" },
                    { k: "Coupling", v: scaleIdx < 4 ? "Bottom-up" : "Top-down" },
                  ].map(s => (
                    <div key={s.k} style={{ textAlign: "center", padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: 8 }}>
                      <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.2em", marginBottom: 4 }}>{s.k.toUpperCase()}</div>
                      <div style={{ fontSize: 11, color: activeScale.color }}>{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RECEPTOR MAP TAB ── */}
        {tab === "receptors" && (
          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: "1.5rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {/* Compound selector */}
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.violet, textTransform: "uppercase", marginBottom: 10 }}>
                  Compound
                </div>
                {COMPOUNDS.map(c => (
                  <div key={c.name} onClick={() => { setCompound(c.name); setBindProgress(0); }}
                    style={{
                      padding: "0.6rem 0.8rem", marginBottom: 6, borderRadius: 8, cursor: "pointer",
                      background: compound === c.name ? `${c.color}12` : "transparent",
                      border: `1px solid ${compound === c.name ? c.color + "50" : "rgba(255,255,255,0.05)"}`,
                    }}>
                    <div style={{ fontSize: 10, color: c.color, letterSpacing: "0.15em", marginBottom: 2 }}>{c.name.toUpperCase()}</div>
                    <div style={{ fontSize: 8, color: "rgba(255,255,255,0.3)" }}>Targets: {c.targets.join(", ")}</div>
                  </div>
                ))}
                <button onClick={triggerBind} style={{
                  width: "100%", marginTop: 8, padding: "0.5rem",
                  background: `${activeComp.color}18`, border: `1px solid ${activeComp.color}50`,
                  borderRadius: 8, color: activeComp.color, cursor: "pointer",
                  fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.2em",
                }}>
                  ⬡ BIND SIMULATION
                </button>
                {/* Bind progress */}
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.dim, marginBottom: 4 }}>
                    <span>BINDING</span><span>{(bindProgress * 100).toFixed(0)}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${bindProgress * 100}%`, background: activeComp.color, borderRadius: 2, transition: "width 0.05s" }} />
                  </div>
                </div>
              </div>

              {/* Effect card */}
              <div style={{ ...panel, padding: "1rem 1.2rem", borderLeft: `3px solid ${activeComp.color}` }}>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: activeComp.color, textTransform: "uppercase", marginBottom: 6 }}>
                  Pharmacodynamics
                </div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>{activeComp.effect}</p>
              </div>

              {/* Receptor legend */}
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: C.dim, textTransform: "uppercase", marginBottom: 8 }}>Receptors</div>
                {RECEPTORS.map(r => (
                  <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 9, color: r.color }}>{r.label}</div>
                      <div style={{ fontSize: 8, color: C.dim }}>{r.ligands.slice(0, 2).join(", ")}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...panel, overflow: "hidden" }}>
              <canvas ref={recRef} width={600} height={480} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>
          </div>
        )}

        {/* ── ORGANOID TAB ── */}
        {tab === "organoid" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem" }}>
            <div style={{ ...panel, overflow: "hidden" }}>
              <canvas ref={orgRef} width={500} height={380} style={{ width: "100%", height: "auto", display: "block" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ ...panel, padding: "1rem 1.2rem" }}>
                <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.rose, textTransform: "uppercase", marginBottom: 10 }}>
                  Growth Controls
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: C.dim }}>
                    <span>GROWTH STATE</span><span>{(orgGrowth * 100).toFixed(0)}%</span>
                  </div>
                  <input type="range" min={0.1} max={1} step={0.01} value={orgGrowth}
                    onChange={e => setOrgGrowth(Number(e.target.value))}
                    style={{ accentColor: C.rose, width: "100%" }} />
                </div>
                <button onClick={growMore} style={{
                  width: "100%", padding: "0.5rem",
                  background: "rgba(244,114,182,0.1)", border: "1px solid rgba(244,114,182,0.3)",
                  borderRadius: 8, color: C.rose, cursor: "pointer",
                  fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.2em",
                }}>
                  + PROLIFERATE CELLS
                </button>
                <div style={{ marginTop: 12, fontSize: 9, color: C.dim }}>Cells: {orgNodes.length}</div>
              </div>

              {[
                { kicker: "What is a Cerebral Organoid?", color: C.rose, text: "A 3D self-organizing neural tissue grown from human iPSCs. Develops cortical layers, GABAergic interneurons, and spontaneous electrical activity within 2–4 months." },
                { kicker: "Cell Types", color: C.violet, text: "Pyramidal neurons (teal) · GABAergic interneurons (violet) · Radial glia (blue) · Astrocytes (pink) · Oligodendrocyte precursors (gold)" },
                { kicker: "AETHER Link", color: C.gold, text: "Organoids as hardware substrate — phase-coupled neural growth embedded in CGLE attractor fields. Living computation beyond von Neumann architecture." },
              ].map(c => (
                <div key={c.kicker} style={{ ...panel, padding: "0.85rem 1rem", borderLeft: `3px solid ${c.color}` }}>
                  <div style={{ fontSize: 8, letterSpacing: "0.2em", color: c.color, textTransform: "uppercase", marginBottom: 5 }}>{c.kicker}</div>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", lineHeight: 1.6, margin: 0 }}>{c.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

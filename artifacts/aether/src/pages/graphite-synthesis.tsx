import { useEffect, useRef, useState } from "react";
import { CodeFilesPanel } from "@/components/code-files-panel";

/* ── Gray/white charcoal palette ─────────────────────────────────────────── */
const BG0   = "#0a0a0c";  // near-black
const BG1   = "#141418";  // dark charcoal
const G10   = "#1e1e24";  // graphite shadow
const G20   = "#323240";  // graphite mid-dark
const G40   = "#606075";  // graphite medium
const G60   = "#9090a8";  // graphite light
const G80   = "#c4c4d8";  // silver-white
const G90   = "#e0e0ee";  // near-white
const WHITE = "#f4f4f8";  // pure off-white
const CREAM = "#f0ead8";  // warm paper white
const MIST  = "#b8c8d4";  // blue-gray mist
const FROST = "#d4e4ec";  // frost white
const SMOKE = "#8898a8";  // blue-gray smoke
const SLATE = "#4a5a6a";  // slate mid
const COAL  = "#2a2a32";  // coal dark
const MICA  = "#a8b4c0";  // mica shimmer
const GOLD  = "#c8b878";  // warm gold tint
const ROSE  = "#c8a0a0";  // pale rose
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

function GChip({ c = G80, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}14`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function GEQ({ children }: { children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: G80, background: COAL, borderLeft: `2px solid ${G40}`, borderRadius: "0 6px 6px 0", padding: "12px 18px", margin: "12px 0", overflowX: "auto", whiteSpace: "pre-wrap" }}>{children}</pre>;
}
function GHead({ id, n, title, sub }: { id: string; n: string; title: string; sub: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: G40, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: WHITE, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: G40, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${G40}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function GPull({ children }: { children: string }) {
  return <blockquote style={{ borderTop: `1px solid ${G40}`, borderBottom: `1px solid ${G40}`, padding: "14px 24px", margin: "24px 0", fontFamily: body, fontStyle: "italic", fontSize: 18, color: G80, lineHeight: 1.6, textAlign: "center" }}>{children}</blockquote>;
}
function GTbl({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead><tr style={{ background: G10 }}>{headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: G60, textAlign: "left", padding: "6px 10px", letterSpacing: 1, borderBottom: `1px solid ${G20}` }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => <tr key={ri} style={{ background: ri % 2 === 0 ? `${COAL}80` : "transparent" }}>{row.map((c, ci) => <td key={ci} style={{ padding: "7px 10px", color: G80, borderBottom: `1px solid ${G10}` }}>{c}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

/* ══ CANVAS ══ */
type Mode = "graphite" | "phi" | "rydberg";

function SubstrateCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(440, Math.round(p.clientWidth * 0.52));
    };
    resize();
    window.addEventListener("resize", resize);

    /* φ-spiral atom positions */
    const PHI = (1 + Math.sqrt(5)) / 2;
    const GOLDEN_ANGLE = 2 * Math.PI * (2 - PHI); // 137.508°
    const N_ATOMS = 512;
    const atoms = Array.from({ length: N_ATOMS }, (_, i) => {
      const r = Math.sqrt(i / N_ATOMS);
      const theta = i * GOLDEN_ANGLE;
      return {
        r, theta,
        phase: Math.random() * Math.PI * 2,
        group: Math.floor(i * 8 / N_ATOMS),
        excited: false,
        excPhase: 0,
      };
    });
    const groupCols = [WHITE, G90, FROST, MIST, SMOKE, G60, G40, MICA];

    /* graphite layers */
    const LAYER_N = 120;
    const layers = Array.from({ length: LAYER_N }, (_, i) => ({
      y0: i / LAYER_N,
      amp: 0.02 + Math.random() * 0.04,
      freq: 1.5 + Math.random() * 3,
      phase: Math.random() * Math.PI * 2,
      density: 0.3 + Math.random() * 0.7,
      speed: 0.003 + Math.random() * 0.004,
    }));

    /* Rydberg dynamics */
    let rydT = 0;
    const OMEGA = 0.08; // Rabi frequency
    const V_BLOCK = 0.6; // blockade strength >> Omega
    const N_PAIRS = 4;
    const pairs = Array.from({ length: N_PAIRS }, (_, i) => ({
      x: 0.15 + (i % 2) * 0.45,
      y: 0.3 + Math.floor(i / 2) * 0.4,
      phase: i * Math.PI / 4,
    }));

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current;
      ctx.clearRect(0, 0, W, H);

      /* ── GRAPHITE WAVE GRADIENT ── */
      if (mode === "graphite") {
        // Background gradient — dark to charcoal
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        bgGrad.addColorStop(0, BG0);
        bgGrad.addColorStop(0.5, G10);
        bgGrad.addColorStop(1, BG0);
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

        // Graphite accumulation layers — each layer is a gradient stroke
        for (const layer of layers) {
          layer.phase += layer.speed;
          const baseY = layer.y0 * H;
          const brightness = layer.density * (0.7 + 0.3 * Math.sin(layer.phase));

          ctx.beginPath();
          for (let xi = 0; xi <= W; xi += 2) {
            const wave = Math.sin(xi * layer.freq * 0.01 + layer.phase) * layer.amp * H
                       + Math.sin(xi * layer.freq * 0.023 + layer.phase * 1.3) * layer.amp * H * 0.5;
            const py = baseY + wave;
            xi === 0 ? ctx.moveTo(0, py) : ctx.lineTo(xi, py);
          }
          // Gradient stroke: mid of canvas is brightest
          const normDist = 1 - Math.abs(layer.y0 - 0.5) * 2;
          const alpha = brightness * normDist * 0.35;
          const gray = Math.round(80 + normDist * 160);
          ctx.strokeStyle = `rgba(${gray},${gray},${gray + 8},${alpha})`;
          ctx.lineWidth = 1 + layer.density * 2;
          ctx.stroke();
        }

        // MAGNETISM — oscillatory blue-gray waves over graphite
        for (let mi = 0; mi < 6; mi++) {
          const baseY = (mi + 1) / 7 * H;
          ctx.beginPath();
          for (let xi = 0; xi <= W; xi += 2) {
            const freq = 0.025 + mi * 0.005;
            const amp = 0.04 * H * (0.6 + 0.4 * Math.sin(t * 0.02 + mi));
            const wave = Math.sin(xi * freq + t * 0.04 - mi * 0.6) * amp;
            xi === 0 ? ctx.moveTo(xi, baseY + wave) : ctx.lineTo(xi, baseY + wave);
          }
          const alpha = 0.12 + 0.08 * Math.sin(t * 0.03 + mi);
          ctx.strokeStyle = `rgba(160,180,200,${alpha})`; ctx.lineWidth = 1.2; ctx.stroke();
        }

        // GRAPHING — cumulative energy curve (proportional, green-gray)
        const cum_curve = Array.from({ length: W }, (_, xi) => {
          const x_norm = xi / W;
          // Cumulative sigmoid with oscillation
          const cumulative = 1 / (1 + Math.exp(-8 * (x_norm - 0.5)));
          const oscillation = 0.04 * Math.sin(x_norm * 20 + t * 0.03);
          return cumulative + oscillation;
        });
        ctx.beginPath();
        for (let xi = 0; xi < W; xi++) {
          const py = H * (0.85 - cum_curve[xi] * 0.7);
          xi === 0 ? ctx.moveTo(xi, py) : ctx.lineTo(xi, py);
        }
        const crvGrad = ctx.createLinearGradient(0, 0, W, 0);
        crvGrad.addColorStop(0, `rgba(120,140,130,0.05)`);
        crvGrad.addColorStop(0.5, `rgba(160,185,165,0.5)`);
        crvGrad.addColorStop(1, `rgba(180,210,190,0.15)`);
        ctx.strokeStyle = crvGrad; ctx.lineWidth = 2; ctx.stroke();

        // Fill under curve (graphite-like density)
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let xi = 0; xi < W; xi++) {
          const py = H * (0.85 - cum_curve[xi] * 0.7);
          xi === 0 ? ctx.lineTo(0, py) : ctx.lineTo(xi, py);
        }
        ctx.lineTo(W, H); ctx.closePath();
        const fillGrad = ctx.createLinearGradient(0, H * 0.1, 0, H);
        fillGrad.addColorStop(0, `rgba(130,150,140,0.12)`);
        fillGrad.addColorStop(1, `rgba(0,0,0,0)`);
        ctx.fillStyle = fillGrad; ctx.fill();

        // Labels
        ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillStyle = `rgba(180,180,200,0.5)`;
        ctx.fillText("GRAPHITE · dense layer accumulation", 12, H - 42);
        ctx.fillStyle = `rgba(160,180,200,0.5)`;
        ctx.fillText("MAGNETISM · oscillatory diamagnetic wave", 12, H - 28);
        ctx.fillStyle = `rgba(160,185,165,0.5)`;
        ctx.fillText("GRAPHING · cumulative proportional energy curve", 12, H - 14);
      }

      /* ── PHI-SPIRAL TWEEZER ARRAY ── */
      else if (mode === "phi") {
        // Background
        const bgGrad = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.7);
        bgGrad.addColorStop(0, G10); bgGrad.addColorStop(1, BG0);
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

        const cx = W / 2, cy = H / 2;
        const maxR = Math.min(W, H) * 0.45;
        const time_t = t * 0.015;

        // Pale grid rings
        for (let ring = 1; ring <= 6; ring++) {
          ctx.beginPath(); ctx.arc(cx, cy, (ring / 6) * maxR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(80,80,100,0.15)`; ctx.lineWidth = 0.5; ctx.stroke();
        }

        // Golden angle spokes
        for (let s = 0; s < 8; s++) {
          const angle = s * GOLDEN_ANGLE;
          ctx.beginPath(); ctx.moveTo(cx, cy);
          ctx.lineTo(cx + Math.cos(angle) * maxR, cy + Math.sin(angle) * maxR);
          ctx.strokeStyle = `rgba(80,80,100,0.08)`; ctx.lineWidth = 0.4; ctx.stroke();
        }

        // Atoms
        for (let i = 0; i < N_ATOMS; i++) {
          const atom = atoms[i];
          atom.phase += 0.01;
          const px = cx + Math.cos(atom.theta) * atom.r * maxR;
          const py = cy + Math.sin(atom.theta) * atom.r * maxR;

          // Activation wave propagating outward from centre
          const waveFront = ((time_t * 0.3) % 1.0);
          const waveActive = Math.abs(atom.r - waveFront) < 0.06;
          const groupActive = Math.floor(time_t * 0.5) % 8 === atom.group;

          let col: string, r_size: number;
          if (waveActive) {
            col = WHITE; r_size = 3.5;
          } else if (groupActive) {
            col = groupCols[atom.group]; r_size = 2.8;
          } else {
            const dimAlpha = 0.15 + 0.1 * Math.sin(atom.phase);
            col = `rgba(120,120,145,${dimAlpha})`; r_size = 1.5;
          }

          ctx.beginPath(); ctx.arc(px, py, r_size, 0, Math.PI * 2);
          if (waveActive || groupActive) {
            ctx.fillStyle = col;
            ctx.fill();
            // Glow
            const glow = ctx.createRadialGradient(px, py, 0, px, py, r_size * 4);
            const gcol = waveActive ? WHITE : groupCols[atom.group];
            glow.addColorStop(0, `${gcol}30`); glow.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc(px, py, r_size * 4, 0, Math.PI * 2);
            ctx.fillStyle = glow; ctx.fill();
          } else {
            ctx.fillStyle = col; ctx.fill();
          }
        }

        // Centre glow
        const centreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.12);
        centreGlow.addColorStop(0, `rgba(200,200,220,0.18)`);
        centreGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx, cy, maxR * 0.12, 0, Math.PI * 2);
        ctx.fillStyle = centreGlow; ctx.fill();

        // Labels
        ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillStyle = `rgba(160,160,180,0.7)`;
        ctx.fillText(`φ-SPIRAL TWEEZER ARRAY · ${N_ATOMS} ATOMS · GOLDEN ANGLE 137.508°`, cx, H - 24);
        ctx.fillStyle = `rgba(200,200,220,0.5)`;
        ctx.fillText(`HOLOGRAPHIC GROUP: ${groupCols.indexOf(groupCols[Math.floor(time_t * 0.5) % 8]) + 1}/8 ACTIVE · WAVE FRONT ${((((time_t * 0.3) % 1.0)) * 100).toFixed(0)}%`, cx, H - 10);
      }

      /* ── RYDBERG ENTANGLEMENT DYNAMICS ── */
      else if (mode === "rydberg") {
        rydT += 0.022;
        const bgGrad = ctx.createLinearGradient(0, 0, W, H);
        bgGrad.addColorStop(0, BG0); bgGrad.addColorStop(0.5, G10); bgGrad.addColorStop(1, BG0);
        ctx.fillStyle = bgGrad; ctx.fillRect(0, 0, W, H);

        // Rydberg blockade populations
        // Two-atom system: |gg⟩, |Bell⟩ = (|gr⟩+|rg⟩)/√2, |rr⟩ (blocked)
        const popGG  = Math.cos(OMEGA * rydT) ** 2;  // ground-ground
        const popBell= Math.sin(OMEGA * rydT) ** 2;  // entangled Bell state
        // |rr⟩ stays near 0 due to blockade (V >> Omega)
        const popRR  = 0.01 * Math.sin(V_BLOCK * rydT) ** 2;

        // Population history chart
        const histLen = Math.min(Math.round(rydT * 45), W - 80);
        const hist_gg: number[]   = [];
        const hist_bell: number[] = [];
        const hist_rr: number[]   = [];
        for (let xi = 0; xi < histLen; xi++) {
          const tau = (xi / histLen) * rydT;
          hist_gg.push(Math.cos(OMEGA * tau) ** 2);
          hist_bell.push(Math.sin(OMEGA * tau) ** 2);
          hist_rr.push(0.01 * Math.sin(V_BLOCK * tau) ** 2);
        }

        const chartL = 50, chartR = W - 30, chartT = H * 0.1, chartB = H * 0.72;
        const chartW = chartR - chartL, chartH = chartB - chartT;

        // Chart background
        ctx.fillStyle = `rgba(10,10,15,0.5)`; ctx.fillRect(chartL, chartT, chartW, chartH);

        // Grid
        for (let gi = 0; gi <= 4; gi++) {
          const yy = chartT + (gi / 4) * chartH;
          ctx.beginPath(); ctx.moveTo(chartL, yy); ctx.lineTo(chartR, yy);
          ctx.strokeStyle = `rgba(60,60,80,0.4)`; ctx.lineWidth = 0.5; ctx.stroke();
          ctx.fillStyle = `rgba(100,100,130,0.6)`; ctx.font = `7px ${mono}`; ctx.textAlign = "right";
          ctx.fillText(`${(1 - gi / 4).toFixed(2)}`, chartL - 4, yy + 3);
        }

        // Population curves
        const drawPop = (hist: number[], col: string, label: string, labelY: number) => {
          if (hist.length < 2) return;
          ctx.beginPath();
          for (let xi = 0; xi < hist.length; xi++) {
            const px = chartL + (xi / (histLen - 1)) * chartW;
            const py = chartB - hist[xi] * chartH;
            xi === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
          // Current value dot
          const curX = chartL + chartW;
          const curY = chartB - hist[hist.length - 1] * chartH;
          ctx.beginPath(); ctx.arc(curX - chartW * (1 - histLen / (W - 80)), curY, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = col; ctx.fill();
          ctx.fillStyle = col; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
          ctx.fillText(label, chartL + 8, labelY);
        };
        drawPop(hist_gg,   `rgba(220,220,235,0.85)`, `|gg⟩ ground-ground  ${(popGG * 100).toFixed(0)}%`,   chartT + 14);
        drawPop(hist_bell, `rgba(160,180,170,0.85)`, `|Bell⟩ entangled    ${(popBell * 100).toFixed(0)}%`, chartT + 26);
        drawPop(hist_rr,   `rgba(160,130,130,0.75)`, `|rr⟩  blocked      ${(popRR * 100).toFixed(1)}%`,   chartT + 38);

        // Axes
        ctx.beginPath(); ctx.moveTo(chartL, chartT); ctx.lineTo(chartL, chartB); ctx.lineTo(chartR, chartB);
        ctx.strokeStyle = `rgba(100,100,130,0.6)`; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = `rgba(140,140,160,0.7)`; ctx.font = `7px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("TIME (Rabi periods)", W / 2, chartB + 14);
        ctx.save(); ctx.translate(14, (chartT + chartB) / 2); ctx.rotate(-Math.PI / 2);
        ctx.fillText("POPULATION", 0, 0); ctx.restore();

        // Atom pair visualiser
        const PAIR_Y = H * 0.85;
        for (let pi = 0; pi < N_PAIRS; pi++) {
          const p = pairs[pi];
          const tau = rydT + p.phase;
          const pGG   = Math.cos(OMEGA * tau) ** 2;
          const pBell = Math.sin(OMEGA * tau) ** 2;
          const px1 = (p.x - 0.04) * W, px2 = (p.x + 0.04) * W;
          const py  = p.y * H * 0.15 + PAIR_Y * 0.9;
          // Draw bond
          ctx.beginPath(); ctx.moveTo(px1, py); ctx.lineTo(px2, py);
          const bondAlpha = pBell * 0.7;
          ctx.strokeStyle = `rgba(160,180,170,${bondAlpha})`; ctx.lineWidth = 1 + pBell * 3; ctx.stroke();
          // Atom 1 (ground mostly)
          const col1 = `rgba(${Math.round(180 + pGG * 60)},${Math.round(180 + pGG * 60)},${Math.round(190 + pGG * 50)},0.9)`;
          ctx.beginPath(); ctx.arc(px1, py, 5 + pBell * 3, 0, Math.PI * 2); ctx.fillStyle = col1; ctx.fill();
          // Atom 2
          ctx.beginPath(); ctx.arc(px2, py, 5 + pBell * 3, 0, Math.PI * 2); ctx.fillStyle = col1; ctx.fill();
          // Entanglement glow
          if (pBell > 0.3) {
            const bellGlow = ctx.createRadialGradient((px1 + px2) / 2, py, 0, (px1 + px2) / 2, py, 30 * pBell);
            bellGlow.addColorStop(0, `rgba(160,180,170,${pBell * 0.2})`);
            bellGlow.addColorStop(1, "transparent");
            ctx.beginPath(); ctx.arc((px1 + px2) / 2, py, 30 * pBell, 0, Math.PI * 2);
            ctx.fillStyle = bellGlow; ctx.fill();
          }
        }
        ctx.fillStyle = `rgba(160,160,180,0.6)`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(`RYDBERG BLOCKADE · Ω = ${OMEGA} · V = ${V_BLOCK} >> Ω · BLOCKADE PREVENTS |rr⟩`, W / 2, H - 8);
      }

      tick.current++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${G20}` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "graphite" as Mode, label: "Graphite · Magnetism · Graphing",    col: G80  },
    { k: "phi"      as Mode, label: "φ-Spiral Tweezer Array · 512 Atoms", col: FROST },
    { k: "rydberg"  as Mode, label: "Rydberg Blockade · Entanglement",     col: MIST  },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{ fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer", border: `1px solid ${value === tab.k ? tab.col : G20}`, background: value === tab.k ? `${tab.col}12` : "transparent", color: value === tab.k ? tab.col : G40, transition: "all 0.2s" }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Three Substrates" }, { id: "s2", label: "Graphite" },
  { id: "s3", label: "Phi-Flower" },       { id: "s4", label: "Holographic" },
  { id: "s5", label: "Cold Atoms" },       { id: "s6", label: "Rydberg" },
  { id: "s7", label: "AETHER" },
];

function GraphiteCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 160;
    const W = canvas.width, H = canvas.height;
    const hexR = 16;
    const cols = Math.ceil(W/(hexR*1.74))+1;
    const rows = Math.ceil(H/(hexR*1.5))+1;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(18,16,12,0.3)"; ctx.fillRect(0,0,W,H);
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        const x=c*hexR*1.74+(r%2)*hexR*0.87;
        const y=r*hexR*1.5;
        const wave=Math.sin(t*0.02+c*0.4+r*0.6);
        const alpha=0.08+0.18*Math.abs(wave);
        ctx.beginPath();
        for(let k=0;k<6;k++){const a=(k/6)*Math.PI*2-Math.PI/6;ctx.lineTo(x+hexR*Math.cos(a),y+hexR*Math.sin(a));}
        ctx.closePath();
        ctx.strokeStyle=`rgba(200,190,170,${alpha})`; ctx.lineWidth=0.8; ctx.stroke();
        if(wave>0.8){ctx.fillStyle=`rgba(200,190,170,${alpha*0.5})`; ctx.fill();}
      }
      ctx.fillStyle="rgba(200,190,170,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GRAPHITE SYNTHESIS · HEXAGONAL LATTICE · CARBON PLANES · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

/* ── simulation code files ───────────────────────────────────────────── */
const GRAPHITE_CODE_FILES = [
  {
    id: "graphite", name: "graphite_conductivity.qg", icon: "Cg",
    content: `# AETHER-GRAY -- Graphite Layer Conductivity
# sigma(x) grows with graphite layer count N(x)
# sp2 carbon: pi electrons delocalised across graphene planes
# Anisotropic: sigma_in-plane >> sigma_out-of-plane (ratio ~10^4)

import numpy as np
from aether.substrate import van_der_Pauw

# Graphene monolayer: sigma_mono = 7.748e-5 S (quantum of conductance * 2)
# Each additional layer adds sigma_mono (parallel layers)
SIGMA_MONO  = 7.748e-5  # S -- conductance quantum G0 * 2
RHO_BULK    = 3.5e-5    # Ohm m -- bulk graphite in-plane resistivity

def layer_conductivity(N_layers, overlap=0.95):
    """
    sigma(N) = N * sigma_mono * overlap^(N-1)
    overlap: interlayer electronic coupling (Bernal stacking ~ 0.95)
    For few-layer graphene (N < 10): quantum effects, non-linear sigma(N)
    For many layers (N > 30): converges to bulk graphite sigma
    """
    return N_layers * SIGMA_MONO * (overlap ** (N_layers - 1))

def gradient_conductivity_field(N_field):
    """
    Given 2D array N(x,y) of layer counts, return sigma(x,y).
    This IS the AETHER C(x,t) field for graphite substrate:
    C_graphite(x,y) = sigma(x,y) / sigma_max
    """
    sigma = np.vectorize(layer_conductivity)(N_field)
    return sigma / sigma.max()  # normalise to [0,1]

class GradientSketch:
    """Model of a graphite gradient drawing on paper."""
    def __init__(self, width=200, height=150, paper_texture=0.02):
        self.W, self.H = width, height
        self.N = np.zeros((H, W))   # layer count field
        self.noise = paper_texture

    def shade(self, x0, y0, radius, layers=1):
        """Add graphite at (x0,y0) with given radius and layer count."""
        for y in range(self.H):
            for x in range(self.W):
                d = ((x-x0)**2 + (y-y0)**2)**0.5
                if d < radius:
                    self.N[y,x] += layers * (1 - d/radius)

    def coherence_field(self):
        """C_graphite = gradient_conductivity_field(N)"""
        return gradient_conductivity_field(self.N)

# The gray gradient made by an artist's hand:
# Each stroke adds N_layers ~ 1-5 depending on pressure
# Tonal value (darkness) = visual proxy for sigma(x)
# The medium remembers every stroke -- irreversible accumulation`,
  },
  {
    id: "phi", name: "phi_spiral.qg", icon: "ph",
    content: `# AETHER-GRAY -- Phi-Spiral & Fibonacci Phyllotaxis
# Golden angle: alpha = 360 * (1 - 1/phi) = 137.507764... degrees
# phi = (1 + sqrt(5)) / 2 = 1.6180339...  (golden ratio)
# Plants use this angle to pack leaves/seeds with maximum efficiency

import numpy as np

PHI = (1 + 5**0.5) / 2        # golden ratio
GOLDEN_ANGLE = 2*np.pi * (1 - 1/PHI)  # 2.39996... rad = 137.5077...deg

def fibonacci_lattice(n_points, scale=1.0):
    """
    Sunflower seed pattern: r = sqrt(i), theta = i * GOLDEN_ANGLE
    Each new seed at angle golden_angle from previous -> no two seeds
    ever align radially -> maximum density packing (Vogel 1979)
    """
    i = np.arange(n_points)
    r     = scale * np.sqrt(i)
    theta = i * GOLDEN_ANGLE
    x = r * np.cos(theta)
    y = r * np.sin(theta)
    return x, y

def fibonacci_sequence(n):
    """F(n) = F(n-1) + F(n-2), F(0)=0, F(1)=1"""
    F = [0, 1]
    for _ in range(n-2):
        F.append(F[-1] + F[-2])
    return F

def phi_power_spiral(n_arms, n_turns, steps=500):
    """
    Logarithmic spiral: r = a * exp(b * theta)
    b = ln(phi) / (pi/2)  -> spiral grows by phi every quarter turn
    Appears in: nautilus shells, galaxy arms, romanesco broccoli
    """
    b = np.log(PHI) / (np.pi / 2)
    theta = np.linspace(0, n_turns * 2*np.pi, steps)
    r     = np.exp(b * theta)
    return r * np.cos(theta), r * np.sin(theta)

# Rydberg atom arrays use phi-spiral geometry to minimise blockade overlap
# Each atom site r_i = sqrt(i) * d_blockade -> no two atoms in same blockade
# This is exactly the graphite phi-spiral tweezers geometry:
# phi-spiral loading of optical tweezers -> maximum qubit density
# C_quantum(x) = atom density matrix purity rho(x)`,
  },
  {
    id: "rydberg", name: "rydberg_atom.qg", icon: "Ry",
    content: `# AETHER-GRAY -- Rydberg Atom Arrays & Quantum Computation
# Principal quantum number n >> 1: highly excited alkali atom
# n=50-100: atom size ~ n^2 * a0 (micron scale), dipole ~ n^2 * e*a0
# Blockade radius: no two atoms in Rydberg state simultaneously within r_b

import numpy as np
from aether.quantum import rydberg_units

HBAR  = 1.055e-34  # [J s]
A0    = 5.292e-11  # Bohr radius [m]
E_H   = 4.36e-18   # Hartree energy [J]

class RydbergAtom:
    """
    Single neutral atom (Rb-87 or Cs-133) laser-excited to state |n>.
    Trapped in optical tweezer array at programmable positions.
    """
    def __init__(self, n=70, species="Rb87"):
        self.n = n
        self.species = species
        self.r_orbit = n**2 * A0          # orbital radius [m]  ~ 260 nm at n=70
        self.dipole  = n**2 * 1.6e-19 * A0 # electric dipole moment [C m]
        self.lifetime = n**3 * 1e-9       # lifetime [s] ~ 340 us at n=70

    def van_der_waals_C6(self):
        """
        C6 coefficient: U(r) = C6 / r^6
        C6 ~ n^11  (scales strongly with n)
        For n=70, Rb: C6 ~ 2e21 a.u. ~ 140 GHz um^6
        """
        return (self.n**11) * 1e-10  # [J m^6] approximate scaling

    def blockade_radius(self, Omega_rabi_hz):
        """
        r_b = (C6 / hbar / Omega)^(1/6)
        Within r_b: two-atom Rydberg excitation is blockaded.
        Typical: r_b ~ 5-10 um for Omega/(2pi) ~ 1 MHz, n=70
        """
        C6 = self.van_der_waals_C6()
        return (C6 / (HBAR * Omega_rabi_hz)) ** (1/6)

    def two_qubit_gate_fidelity(self, r_m, Omega_hz):
        """
        CZ gate via Rydberg blockade.
        Fidelity limited by finite blockade U vs Omega:
        F ~ 1 - (Omega/U)^2 where U = C6/r^6
        """
        U = self.van_der_waals_C6() / r_m**6
        return 1 - (HBAR * Omega_hz / U)**2

# Gray Medium Substrate connection:
# Graphite substrate sigma(x) = classical coherence field C_graphite
# Rydberg array rho(x) = quantum coherence field C_quantum
# Both: C in [0,1], ordered -> coherent, disordered -> decoherent
# phi-spiral tweezers geometry optimises C_quantum density (same as seed packing)`,
  },
  {
    id: "aether", name: "aether_gray_field.qg", icon: "Ag",
    content: `# AETHER-GRAY -- C(x,t) Field Written in Three Substrates
# Three media, one coherence field -- different physical instantiations
# Gray gradient = sigma(x)/sigma_max  (graphite)
# phi-spiral    = rho(x) purity      (quantum atoms)
# Living flower = eta(x) exciton efficiency  (biological)

from aether.kernel import CoherenceField
import numpy as np

class SubstrateCoherence:
    """
    Unified C(x,t) across three gray-medium substrates.
    C in [0,1]: 0 = disordered, 1 = maximally coherent.
    """
    def graphite(self, N_layers, sigma_max):
        """
        C_graphite(x) = sigma(N(x)) / sigma_max
        sigma grows with N_layers -- each pencil stroke adds coherence.
        Irreversible: you cannot un-shade paper.
        The medium accumulates and remembers every mark.
        """
        sigma_mono = 7.748e-5
        sigma = N_layers * sigma_mono
        return np.clip(sigma / sigma_max, 0, 1)

    def quantum(self, rho_atom):
        """
        C_quantum(x) = Tr(rho^2)  -- purity of density matrix
        rho = |psi><psi| for pure state (C=1)
        rho = I/d for maximally mixed state (C=0)
        phi-spiral geometry maximises sum_x C_quantum(x).
        """
        return np.real(np.trace(rho_atom @ rho_atom))

    def biological(self, exciton_efficiency, eta_max):
        """
        C_bio(x) = eta_exciton(x) / eta_max
        Exciton transfer in photosynthetic antenna:
        FMO complex: 95% efficiency (near-quantum-optimal)
        Coherent wavelike transport vs incoherent hopping
        """
        return np.clip(exciton_efficiency / eta_max, 0, 1)

# AETHER synthesis:
# All three substrates obey the same Crystallization Model:
# Apply energy (pencil pressure / laser / sunlight) + geometry (phi-spiral)
# -> C(x,t) crystallises from 0 toward 1
# -> Structure emerges: gradient / qubit array / living flower
# The gray gradient IS the C(x,t) field written in graphite.
# The phi-spiral IS the C(x,t) field written in vacuum.
# The living flower IS the C(x,t) field written in cellulose.

sc = SubstrateCoherence()
print("C_graphite at 10 layers:", sc.graphite(10, 50*7.748e-5))
print("C_quantum (pure state):", sc.quantum(np.array([[1,0],[0,0]])))`,
  },
];

export default function GraphiteSynthesisPage() {
  const [mode, setMode] = useState<Mode>("graphite");
  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: body, color: G80 }}>
      {/* ── GRADIENT HERO ─────────────────────────────────────────────── */}
      <div style={{ padding: "0", position: "relative", overflow: "hidden" }}>
        {/* Multi-layer gradient background */}
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 80% 60% at 20% 40%, rgba(80,80,100,0.25) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 80% 60%, rgba(60,70,80,0.2) 0%, transparent 60%),
            radial-gradient(ellipse 100% 40% at 50% 0%, rgba(100,100,120,0.15) 0%, transparent 50%),
            linear-gradient(180deg, rgba(30,30,36,0.95) 0%, rgba(10,10,12,0.98) 100%)
          `,
        }} />
        {/* Graphite grain texture via SVG filter */}
        <div style={{
          position: "absolute", inset: 0, opacity: 0.06,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(200,200,220,0.3) 2px, rgba(200,200,220,0.3) 3px)`,
        }} />

        <div style={{ position: "relative", padding: "72px 28px 52px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: G40, letterSpacing: 5, marginBottom: 14 }}>
            AETHER · MEDIUM SUBSTRATE SYNTHESIS · GRAY + WHITE
          </div>

          {/* Gradient title */}
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(22px,4.5vw,48px)",
            background: `linear-gradient(135deg, ${G40} 0%, ${WHITE} 35%, ${FROST} 55%, ${MIST} 75%, ${G60} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", margin: "0 0 16px", letterSpacing: 3, lineHeight: 1.1,
          }}>
            DYNAMIC MEDIUM<br />SUBSTRATE SYNTHESIS
          </h1>

          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 17,
            background: `linear-gradient(90deg, ${G40}, ${G80}, ${G40})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text", marginBottom: 22,
          }}>
            Graphite · Diamagnetism · Proportional Graphing · φ-Spiral Tweezers · Rydberg Entanglement
          </div>

          <p style={{ fontFamily: body, fontSize: 16, color: G60, maxWidth: 700, margin: "0 auto 28px", lineHeight: 1.85 }}>
            Three substrates — Graphite (density/accumulation), Magnetism (oscillatory force),
            Graphing (proportional mastery) — synthesised into a unified medium.
            From charcoal gradients to φ-spiral holographic tweezer arrays and Rydberg
            blockade entanglement: each layer is a proportional energy manipulation system.
          </p>

          {/* Gradient chips */}
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <GChip c={G80}>Graphite Layering</GChip>
            <GChip c={FROST}>φ = 1.618034</GChip>
            <GChip c={MIST}>Diamagnetism</GChip>
            <GChip c={G60}>432 Hz Resonance</GChip>
            <GChip c={WHITE}>Holographic SLM</GChip>
            <GChip c={MICA}>Cold Atoms μK</GChip>
            <GChip c={SMOKE}>Rydberg Blockade</GChip>
            <GChip c={CREAM}>Phi-Flower Printer</GChip>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG0}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${G10}`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: G40, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = G80; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = G40; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px 96px" }}>
        {/* Canvas */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <SubstrateCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: G40, marginTop: 6 }}>
            {mode === "graphite"  && "GRAY GRADIENT WAVES = GRAPHITE DENSITY LAYERS · BLUE-GRAY = DIAMAGNETIC OSCILLATION · GREEN-GRAY = CUMULATIVE PROPORTIONAL ENERGY CURVE · ALL THREE SUBSTRATES VISIBLE SIMULTANEOUSLY"}
            {mode === "phi"       && "512-ATOM φ-SPIRAL ARRAY · GOLDEN ANGLE 137.508° PACKING · WHITE WAVE FRONT PROPAGATES OUTWARD · 8 HOLOGRAPHIC GROUPS (COLORED) ADDRESSED IN PARALLEL · NO EDGE EFFECTS"}
            {mode === "rydberg"   && "TWO-ATOM RYDBERG BLOCKADE DYNAMICS · |gg⟩ → |Bell⟩ COHERENT OSCILLATION · |rr⟩ SUPPRESSED (V >> Ω) · POPULATION HISTORY + 4 LIVE ATOM PAIRS WITH ENTANGLEMENT GLOW"}
          </div>
        </div>

        {/* ── SECTION I ── */}
        <GHead id="s1" n="I" title="Three Substrates of Proportional Energy" sub="Graphite builds density · Magnetism directs flow · Graphing controls proportion" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28 }}>
          {[
            {
              col: G80, label: "GRAPHITE", icon: "◼",
              body: "A layered carbon material — hexagonal graphene planes bonded by van der Waals forces. In pencil shading: each stroke deposits a layer of graphene flakes, increasing tonal density proportionally. In science: strongly diamagnetic (χ_m ≈ −450 × 10⁻⁶ for pyrolytic graphite — 5000× stronger than water). Can levitate over strong permanent magnets (Earnshaw violation for diamagnets). Conducts electricity along planes (σ ≈ 10⁶ S/m), insulates perpendicular to planes. In AETHER: graphite = accumulation medium. Each layer = one iteration of the coherence field depositing information.",
              eq: "χ_m(C) ≈ −450 × 10⁻⁶\nσ_graphite ≈ 10⁶ S/m (in-plane)\nρ = 2.09–2.23 g/cm³",
            },
            {
              col: G60, label: "MAGNETISM", icon: "⊛",
              body: "Oscillatory forces: attraction (ferro/ferrimagnetism), repulsion (diamagnetism), and dynamic resonance. Graphite's diamagnetism creates a repulsive levitation force F = (χ_m / μ₀) (B · ∇B) · V. At 432 Hz: the resonant frequency is in the auditory/biophysical range — Schumann resonance is 7.83 Hz (fundamental), 432 Hz maps to overtone 55 of the Schumann series. In energy terms: magnetism directs flow through attraction/repulsion cycles — not building density like graphite, but shaping the gradient of the field.",
              eq: "F_levit = (χ_m/μ₀)(B·∇B)V\n432 Hz = 55 × 7.83 Hz (Schumann)\nf_diamag_levit ≈ 0.3–3 Hz (passive)",
            },
            {
              col: G60, label: "GRAPHING", icon: "∿",
              body: "Mathematical proportion mapping: turns abstract energy accumulation (moss growth, sunrise light curves, frequency buildup) into scalable, controllable visual form. The proportional energy curve E(t) = E_total · [1/(1+e^{-k(t-t₀)})] (sigmoidal growth) describes all accumulation processes — from graphite layer density to biological mass to quantum state population. Graphing = the map for proportional control. It is the C(x,t) coherence field written down — the act of measuring which stabilises the substrate.",
              eq: "E(t) = E₀ / (1 + e^{-k(t-t₀)})\n∫₀^∞ dE/dt dt = E_total\nC_proportional = ‖∇E(t)‖ / E_total",
            },
          ].map(item => (
            <div key={item.label} style={{ borderTop: `2px solid ${item.col}60`, background: `${G10}80`, borderRadius: 6, padding: "14px 15px" }}>
              <div style={{ fontFamily: mono, fontSize: 20, color: item.col, marginBottom: 6 }}>{item.icon}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: item.col, letterSpacing: 2, marginBottom: 8 }}>{item.label}</div>
              <div style={{ fontFamily: body, fontSize: 12, color: G60, lineHeight: 1.65, marginBottom: 12 }}>{item.body}</div>
              <pre style={{ fontFamily: mono, fontSize: 10, color: G40, background: COAL, borderRadius: 4, padding: "8px 10px", whiteSpace: "pre-wrap" }}>{item.eq}</pre>
            </div>
          ))}
        </div>

        {/* ── SECTION II ── */}
        <GHead id="s2" n="II" title="Graphite Gradient Science" sub="Diamagnetic levitation · Layered carbon physics · Proportional shading as energy model" />
        <GEQ>{`Graphite diamagnetism — the levitation physics:

  Crystal structure: sp² carbon in hexagonal planes (graphene layers)
    Intralayer bonding: covalent σ + π bonds (strong, 346 kJ/mol)
    Interlayer bonding: van der Waals (weak, 2.5 kJ/mol) → layers slide easily → smooth shading

  Diamagnetic susceptibility:
    χ_m ≈ −40 × 10⁻⁶ (in-plane) to −450 × 10⁻⁶ (perpendicular to planes, pyrolytic)
    This is 5000× stronger than water (χ_m = −9.1 × 10⁻⁶)
    Mechanism: orbital current loops in the π electron cloud oppose applied B field
    (Lenz's law at the electron orbital level — no permanent magnetism needed)

  Levitation condition (Earnshaw theorem note):
    Normal: Earnshaw's theorem forbids stable levitation with static fields
    Diamagnets: exempt because χ_m < 0 → force is repulsive everywhere
    F_levit = (χ_m / 2μ₀) ∇(B²) · V  [force on diamagnet in B-gradient]
    Levitation height: where F_levit = mg → B·(dB/dz) = μ₀ρg / |χ_m|
    For pyrolytic graphite: B ≈ 0.5 T, dB/dz ≈ 2000 T/m (achievable with NdFeB magnets)

  Graphite gradient as energy model:
    Shading depth D ∝ number of graphite layers N
    Layer conductivity: σ_layer(N) = N · σ_monolayer (linear accumulation)
    Magnetic response: χ_m(N) ≈ N^0.85 · χ_m(monolayer) (sub-linear due to interlayer coupling)
    → Dense shading = high σ, high |χ_m| = maximum energy accumulation + diamagnetic protection
    AETHER: dense graphite regions = high C(x,t) zones — topological protection from field disruption

  432 Hz in context:
    432 Hz = A4 (concert pitch in non-standard tuning) = λ_sound ≈ 0.79 m in air
    Schumann resonances: 7.83, 14.3, 20.8, 27.3, 33.8 Hz (Earth's EM cavity resonances)
    432 Hz / 7.83 Hz = 55.2 ≈ 55 (near-integer harmonic relation)
    Possible link: the 55th harmonic of the Schumann fundamental = 430.65 Hz ≈ 432 Hz
    Physical: resonance of the Earth-ionosphere cavity with brain alpha waves (8–12 Hz)
    AETHER: 432 Hz = coherence frequency at which graphite/medium density aligns with field`}</GEQ>

        {/* ── SECTION III ── */}
        <GHead id="s3" n="III" title="Phi-Flower Printer · Bio-Computational Fabrication" sub="Phyllotaxis algorithms + quantum coherence + 3D bioprinting = living flowers by design" />
        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.85, marginBottom: 20, color: G60 }}>
          The Phi-Flower Printer is a closed-loop bio-computational fabrication system:
          a phi-reservoir design engine running phyllotaxis morphological simulations drives
          a fluid-dynamics 3D bioprinter that deposits living plant cell bio-inks into
          Fibonacci-optimised structures. The result: flowers that exceed natural limits —
          larger, more fragrant, self-repairing — because they are geometrically optimised
          at every scale simultaneously.
        </p>
        <GEQ>{`Phyllotaxis — the mathematical substrate of flower morphology:

  Golden angle: α = 360° × (1 - 1/φ) = 360°/φ² = 137.508°
    Where φ = (1+√5)/2 = 1.6180339...
    This is the ONLY angle that produces non-repeating, non-overlapping packing
    of growth points at all radii simultaneously
    → Maximum density, minimum overlap → optimal light capture, structural efficiency

  Fibonacci parastichies (spiral counts):
    Sunflower seed heads: 34 clockwise + 55 counterclockwise (consecutive Fibonacci)
    Rose petals: 5, 8, 13 (Fibonacci sequence)
    Orchid structure: 3, 5, 8, 13 (nested Fibonacci)
    AETHER: Fibonacci parastichies = discrete approximations to the irrational φ-spiral
             → same principle as irrational q in plasma confinement → ergodic, no preferred direction

  Bio-ink formulation (plant bioprinting, 2025–2026):
    Carrier: plant polysaccharide hydrogel (cellulose, pectin, alginate)
    Living cells: plant protoplasts (cell wall-removed → printable → regenerate walls post-print)
    Scent payload: volatile organic compounds (VOCs) in lipid microspheres (time-released)
    Pigment: extracted anthocyanins, carotenoids, chlorophylls (gradient-depositable)
    Growth factors: phytohormones (auxin, cytokinin) in spatial gradients → guides post-print growth

  Phi-reservoir design engine:
    Input: target flower morphology (petal number, scent profile, max diameter)
    Simulation: 
      Layer 1: phyllotaxis algorithm → petal/seed geometry (macro, Fibonacci)
      Layer 2: vibronic exciton model → chlorophyll network efficiency (micro, quantum coherence)
      Layer 3: VOC diffusion → scent channel placement (fluid dynamics)
    Output: print path (G-code) for each bio-ink layer
    
  Quantum coherence in printed flowers:
    Photosynthetic efficiency η ≈ 95% (quantum coherence-assisted energy transfer)
    Vibronic coupling: exciton + phonon form hybrid vibronic quasiparticle
    Coherence time τ_coh ≈ 300–500 fs at room temperature (Flemming et al. 2007)
    AETHER: the chlorophyll π-network in printed flowers IS a living C(x,t) coherence field
             Each photon absorbed → coherence propagates via vibronic channel → energy at reaction centre`}</GEQ>

        {/* ── SECTION IV ── */}
        <GHead id="s4" n="IV" title="Holographic Optical Tweezers · φ-Spiral Arrays" sub="One laser beam → thousands of addressable atom traps in golden-angle geometry" />
        <GEQ>{`Holographic optical tweezer (HOT) system:

  Core component: Spatial Light Modulator (SLM)
    Type: liquid crystal on silicon (LCoS), 1920×1080 pixels, pixel pitch ~8 μm
    Function: imprints computer-generated hologram (CGH) on laser wavefront
    Algorithm: weighted Gerchberg-Saxton (WGS) — iterative phase retrieval
      Objective: find phase pattern φ(x,y) such that |FFT{e^{iφ}Gaussian}|² = target intensity
    Result: arbitrary 2D (and 3D) intensity patterns in the focal plane

  Trap formation:
    Focused Gaussian beam (NA > 0.8 objective) → trapping force on atom
    Dipole force: F_dipole = (α/4) ∇⟨E²⟩  [α = atomic polarisability]
    Trap depth: U₀ = (3c²/2ω₀³) × (Γ/Δ) × I/c
      ω₀: resonance frequency, Γ: linewidth, Δ: detuning, I: intensity
    Trap frequency: f_trap ≈ 50–200 kHz (tightly focused 1064 nm beam, Rb atoms)
    Single-atom occupancy enforced by: light-assisted collisions → pairwise ejection

  φ-spiral geometry advantages:
    Standard arrays: square or hexagonal grids → Bragg scattering lobes at grid period
    φ-spiral: golden angle 137.508° → APERIODIC → no Bragg peaks at any wavevector
    Nearest-neighbor distance: d_NN ≈ const × √(A/N) (uniform across entire array)
    → Uniform blockade strength across entire array (critical for Rydberg gates)
    → No preferred propagation direction (ergodic, like irrational q plasma)
    → Packs maximum atoms in minimum area without lattice artifacts

  Current records (2025–2026):
    >6,100 highly coherent atom qubits in single array (Harvard/MIT 2025)
    Coherence times: T₁ ~ seconds, T₂ ~ 100ms (in optical clock states)
    Gate fidelity: >99.5% (single-qubit), >99% (two-qubit Rydberg CZ)
    Logical qubits: 48 logical qubits demonstrated with error correction (2024)`}</GEQ>

        {/* ── SECTION V ── */}
        <GHead id="s5" n="V" title="Cold Approach · Laser Cooling to μK" sub="Atoms cooled to near absolute zero — quantum coherence at macroscopic scale" />
        <GTbl headers={["Species", "Ground State", "Cooling Method", "T_final", "Coherence Time", "Application"]}
          rows={[
            ["⁸⁷Rb", "|5S₁/₂, F=1⟩", "MOT + polarisation gradient + evap.", "~1 μK", "T₂ ~ 10ms (hyperfine)", "Standard qubit platform (85% of demos)"],
            ["⁸⁸Sr", "|5s² ¹S₀⟩", "MOT (461nm) + narrow MOT (689nm)", "~1 μK", "T₂ ~ 1s (clock transition)", "Optical clock qubit, Hz-level spectroscopy"],
            ["Cs", "|6S₁/₂, F=3⟩", "3D MOT + grey molasses (D1)", "~1.5 μK", "T₂ ~ 30ms", "Precise π/2 Rabi, entanglement fidelity"],
            ["Er", "|J=6, mJ⟩", "MOT + evap in optical dipole trap", "~0.3 μK", "—", "Highly magnetic — novel interaction physics"],
            ["CaF", "|X ²Σ⁺, v=0⟩", "Laser cooling (7 freq.) + MOT", "~50 μK", "T₂ ~ 100ms", "Polar molecule qubit — electric dipole gates"],
          ]}
        />
        <GEQ>{`Laser cooling mechanism (Doppler cooling):
  Photon momentum kick: ħk ≈ 5.9 × 10⁻²⁸ kg·m/s (for Rb 780nm)
  Velocity capture range: Δv ≈ Γ/k ≈ 6 m/s (Doppler shift matches linewidth)
  Equilibrium temperature: T_Doppler = ħΓ / 2kB
    Rb: Γ = 2π × 6.07 MHz → T_D = 145 μK
  Sub-Doppler (Sisyphus) cooling: T_SS ≈ ħΩ²_Rabi / (kB·Γ) ~ 1–10 μK
  
  φ-spiral in cold atom context:
    All atoms in the spiral have identical quantum states (single species, single isotope)
    → No fabrication variance (unlike superconducting qubits where each is physically different)
    → The only thing that varies is position, which is set by the hologram
    → The hologram IS the geometry — change the SLM phase → different φ-pattern → different computer
    
  Hybrid: Cold atoms + printed flower substrate
    Optical tweezer frequency: 1064nm (near-IR) → also absorbed by chlorophyll Q_y band (~700nm): NO
    Solution: use 810nm tweezer light (between Rb D-lines, not absorbed by chlorophyll)
    → Same laser cools atoms + illuminates printed flower substrate simultaneously
    → Rydberg-state lifetime 1/Γ_n ~ n³/Γ_1 → n=50 → τ ~ 100 μs (addressable window)
    → Printed chlorophyll coherence τ_coh ~ 300 fs (much faster, different channel)
    AETHER: cold atoms provide LOCALIZED C(x,t) computation; chlorophyll provides DELOCALIZED sensing`}</GEQ>

        {/* ── SECTION VI ── */}
        <GHead id="s6" n="VI" title="Rydberg Entanglement · Blockade Dynamics" sub="High-n quantum states — microsecond gates — scalable parallel entanglement" />
        <GEQ>{`Rydberg state properties:
  Principal quantum number n: standard operation n = 40–80
  Orbital radius: ⟨r⟩ = n² a₀ (Bohr radius a₀ = 0.53Å)
    n=50: ⟨r⟩ ≈ 50² × 0.53Å = 1.3 nm  (electron cloud ~1nm → strong interactions)
  Dipole moment: d_n ≈ n² ea₀ → n=50: d ≈ 10⁴ Debye (enormous)
  Lifetime: τ_n ≈ n³/Γ_1 → n=50, Rb: τ ≈ 70 μs (long enough for gates)

Rydberg blockade mechanism:
  Two atoms separated by R:
    Van der Waals interaction: V_vdW = C₆/R⁶
    C₆ coefficient: C₆ ≈ n¹¹ × (atomic units) → n=50, Rb |r, r⟩: C₆ ≈ 10⁷ au
    At R = 10 μm: V_vdW ≈ ħ × 100 MHz >> ħΩ_Rabi ≈ ħ × 1–5 MHz → BLOCKADE
    
  Blockade mechanism:
    Both atoms driven toward |r⟩: Hamiltonian for doubly-excited state |rr⟩ is off-resonant by V_vdW
    → |rr⟩ state cannot be populated within blockade radius R_B where V_vdW > ħΩ
    R_B = (C₆ / ħΩ)^{1/6}  [n=50, Ω=2π×5MHz: R_B ≈ 10 μm]
    
  Two-atom dynamics (coherent evolution):
    |ψ(0)⟩ = |gg⟩ (ground-ground)
    H = ħΩ (σ₁⁺ + σ₁⁻ + σ₂⁺ + σ₂⁻) + V_vdW |rr⟩⟨rr|
    In blockade limit (V >> ħΩ): effective Rabi frequency = √2 Ω on symmetric state
    |ψ(t)⟩ = cos(√2 Ω t)|gg⟩ - i sin(√2 Ω t) (|gr⟩ + |rg⟩)/√2
    At t = π/(2√2 Ω): |ψ⟩ = (|gr⟩ + |rg⟩)/√2  → MAXIMALLY ENTANGLED BELL STATE
    Gate time: τ_gate = π/(√2 Ω) ≈ 0.1–1 μs  (10,000× faster than biological coherence)

Performance:
  Gate fidelity F > 99%  (Evered et al., Harvard 2023)
  Two-qubit CZ gate: τ = 200 ns, F = 99.5%
  Parallel gates: entire φ-spiral array addressed simultaneously (1 SLM update)
  → Scale: 6000 atoms × parallel gates → equivalent of 10⁶ serial gate operations/second`}</GEQ>

        {/* ── SECTION VII ── */}
        <GHead id="s7" n="VII" title="AETHER Synthesis · Gray Medium as Universal Substrate" sub="Graphite shading, quantum computing, and flower printing are the same process at different scales" />
        <GEQ>{`Gray medium synthesis — the unified model:

  Graphite shading:
    Medium: cellulose paper (fiber substrate)
    Material: graphene layers (diamagnetic, conductive)
    Process: mechanical pressure → layer-by-layer deposition → increasing density
    Output: gradient from white (0 layers) to black (dense graphene coverage)
    Energy representation: E_visual ∝ N_layers × σ_graphene × reflectance_loss

  φ-spiral holographic array:
    Medium: vacuum (optical substrate)
    Material: ultracold atoms (quantum substrate)
    Process: SLM hologram → dipole trap array → golden-angle positions → coherent control
    Output: gradient from uncooled (thermal noise) to μK (pure quantum coherence)
    Energy representation: E_quantum ∝ N_atoms × ‖C(x,t)‖² × Rydberg_entanglement_depth

  Phi-Flower Printer:
    Medium: hydrogel (biological substrate)
    Material: plant protoplasts + VOCs + pigments (living substrate)
    Process: microfluidic deposition → phyllotactic scaffold → vibronic activation
    Output: gradient from formless bio-ink to living, coherent, scent-emitting flower
    Energy representation: E_bio ∝ N_cells × η_photosynthesis × scent_release_rate

  THE SYNTHESIS:
    All three are the same process:
      SUBSTRATE (paper / vacuum / hydrogel)
      + MATERIAL (graphene / cold atoms / protoplasts) with proportional energy (density / coherence / growth)
      + GEOMETRY (gradient shading / φ-spiral / Fibonacci phyllotaxis)
      = EMERGENT STRUCTURE (tonal depth / quantum computation / living flower)

  AETHER coherence field across all three:
    C_graphite(x,t) = σ(x)/σ_max  [local graphite conductivity normalized]
    C_quantum(x,t)  = ‖ρ_atom(x)‖/‖ρ_pure‖  [atom density matrix purity]
    C_bio(x,t)      = η_exciton(x)/η_max  [exciton transfer efficiency]
    All three: C ∈ [0,1], C=0 → disordered (white paper / hot atoms / formless bio-ink)
               C=1 → fully ordered (dense graphite / pure qubit / living coherent flower)
    
    The gray gradient IS the C(x,t) field written in graphite.
    The φ-spiral IS the C(x,t) field written in vacuum.
    The living flower IS the C(x,t) field written in cellulose.`}</GEQ>

        <GPull>"Graphite is the most honest material. Every layer you add darkens the field and makes the gradient irreversible. You cannot un-shade. The proportion accumulates. The substrate remembers."</GPull>

        <div style={{ marginTop: 48, padding: "22px 24px", background: G10, border: `1px solid ${G20}`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: G80, marginBottom: 8 }}>MEDIUM = MESSAGE = MEMORY</div>
          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 17, lineHeight: 1.8, marginBottom: 16,
            background: `linear-gradient(135deg, ${G40}, ${WHITE}, ${MIST}, ${G60})`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
          }}>
            "Graphite, vacuum, and hydrogel are three<br />
            versions of the same substrate.<br />
            The gradient is always C(x,t) written down."
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: G40, lineHeight: 2 }}>
            σ(x) ∝ N_layers (graphite) · ‖ρ(x)‖ ∝ N_atoms (quantum) · η(x) ∝ N_cells (bio)
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${G20}cc`, marginTop: 14 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce
          </div>
        </div>
        <CodeFilesPanel
          heading="Gray Medium Substrate Simulation Files"
          accentColor={G80}
          files={GRAPHITE_CODE_FILES}
        />
      </div>
    </div>
  );
}

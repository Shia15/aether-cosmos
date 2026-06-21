import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ─────────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";

/* Cluster palette — one hue per cluster ID (cycles) */
const CLUSTER_COLS = [TEAL, GOLD, ROSE, VIO, AMB,
  "#44aaff", "#44ee88", "#ff88cc", "#ffee44", "#88ffcc"];

/* ── Agent type ──────────────────────────────────────────── */
interface Agent {
  x: number; y: number;
  vx: number; vy: number;
  phase: number;
  omega: number;
  spikeTimer: number;
  id: number;
  history: Array<{ x: number; y: number }>;
}

/* ── Math helpers ────────────────────────────────────────── */
function hsl(phase: number, s = 78, l = 62) {
  const h = ((phase / (Math.PI * 2)) * 360) % 360;
  return `hsl(${h},${s}%,${l}%)`;
}
function hslA(phase: number, a: number) {
  const h = ((phase / (Math.PI * 2)) * 360) % 360;
  return `hsla(${h},78%,62%,${a})`;
}
function dist(a: Agent, b: Agent) {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Box-Muller Gaussian sample (mean 0, σ 1) */
function gaussRand(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/**
 * Cluster detection via BFS on the phase-alignment graph.
 * Two agents i,j are connected when |sin((θᵢ-θⱼ)/2)| < threshold.
 * Returns an array of cluster IDs (one per agent).
 */
function findClusters(agents: Agent[], threshold = 0.30): number[] {
  const n = agents.length;
  const cluster = new Array(n).fill(-1);
  let cid = 0;
  for (let i = 0; i < n; i++) {
    if (cluster[i] >= 0) continue;
    const queue = [i];
    cluster[i] = cid;
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (let j = 0; j < n; j++) {
        if (cluster[j] >= 0) continue;
        const dph = Math.abs(Math.sin((agents[curr].phase - agents[j].phase) / 2));
        if (dph < threshold) { cluster[j] = cid; queue.push(j); }
      }
    }
    cid++;
  }
  return cluster;
}

/* ── Simulation constants ────────────────────────────────── */
const DT           = 0.04;
const AGENT_R      = 16;
const REPULSE_R    = AGENT_R * 2.6;
const CONTACT_R    = AGENT_R * 2.1;
const SIGMA        = 90;
const MAX_SPEED    = 1.8;
const ATTRACT_PULL = 0.012;
const WANDER       = 0.18;
const SPIKE_K      = 5.0;
const SPIKE_DECAY  = 0.94;
const TRAIL_LEN    = 28;

/* ── Init agents ─────────────────────────────────────────── */
function makeAgents(n: number, W: number, H: number, omegaSpread: number): Agent[] {
  return Array.from({ length: n }, (_, id) => {
    const a = (id / n) * Math.PI * 2;
    const r = 80 + Math.random() * 60;
    return {
      id,
      x: W / 2 + r * Math.cos(a),
      y: H / 2 + r * Math.sin(a),
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      phase: Math.random() * Math.PI * 2,
      omega: 1.0 + (Math.random() - 0.5) * omegaSpread,
      spikeTimer: 0,
      history: [],
    };
  });
}

/* ── Kuramoto order parameter |⟨e^{iθ}⟩| ──────────────────── */
function orderParam(agents: Agent[]): number {
  let re = 0, im = 0;
  for (const a of agents) { re += Math.cos(a.phase); im += Math.sin(a.phase); }
  const n = agents.length;
  return Math.sqrt((re / n) * (re / n) + (im / n) * (im / n));
}

/* ── Canvas simulation ───────────────────────────────────── */
function CouplingCanvas({
  nAgents, K, omegaSpread, contactBoost, eta, showClusters, running,
  onOrder, onClusters,
}: {
  nAgents: number; K: number; omegaSpread: number;
  contactBoost: number; eta: number; showClusters: boolean; running: boolean;
  onOrder: (r: number) => void;
  onClusters: (count: number) => void;
}) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const agents = useRef<Agent[]>([]);
  const histR  = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const params = useRef({ nAgents, K, omegaSpread, contactBoost, eta, showClusters, running });

  useEffect(() => {
    params.current = { nAgents, K, omegaSpread, contactBoost, eta, showClusters, running };
  }, [nAgents, K, omegaSpread, contactBoost, eta, showClusters, running]);

  /* Re-init on agent count change */
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    agents.current = makeAgents(nAgents, cv.width, cv.height, omegaSpread);
    histR.current  = [];
  }, [nAgents]); // eslint-disable-line

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    if (agents.current.length === 0)
      agents.current = makeAgents(nAgents, W, H, omegaSpread);

    let frame = 0;

    const tick = () => {
      const { K: kBase, contactBoost: cb, eta: noise,
               showClusters: sc, running: run } = params.current;
      const ag = agents.current;
      const n  = ag.length;

      /* ── 1. Physics update ──────────────────────────── */
      if (run) {
        /* centroid */
        let cx = 0, cy = 0;
        for (const a of ag) { cx += a.x; cy += a.y; }
        cx /= n; cy /= n;

        for (let i = 0; i < n; i++) {
          const ai = ag[i];

          /* trail history */
          ai.history.push({ x: ai.x, y: ai.y });
          if (ai.history.length > TRAIL_LEN) ai.history.shift();

          /* effective K with spike */
          const Keff = kBase + ai.spikeTimer * cb * SPIKE_K;
          ai.spikeTimer *= SPIKE_DECAY;

          /* Kuramoto phase update + thermal noise */
          let dTheta = ai.omega;
          for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const aj = ag[j];
            const d  = dist(ai, aj);
            const w  = Math.exp(-(d * d) / (2 * SIGMA * SIGMA));
            dTheta += (Keff / n) * Math.sin(aj.phase - ai.phase) * w;
          }
          /* thermal noise term: η·ξ(t) */
          dTheta += noise * gaussRand();

          ai.phase = (ai.phase + dTheta * DT) % (Math.PI * 2);
          if (ai.phase < 0) ai.phase += Math.PI * 2;

          /* centroid attraction */
          const toCx = cx - ai.x, toCy = cy - ai.y;
          const dCen  = Math.sqrt(toCx * toCx + toCy * toCy);
          if (dCen > 20) {
            ai.vx += (toCx / dCen) * ATTRACT_PULL * dCen * 0.012;
            ai.vy += (toCy / dCen) * ATTRACT_PULL * dCen * 0.012;
          }

          /* repulsion + contact spike */
          for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const aj = ag[j];
            const dx = ai.x - aj.x, dy = ai.y - aj.y;
            const d  = Math.sqrt(dx * dx + dy * dy) + 0.001;
            if (d < REPULSE_R) {
              const force = (REPULSE_R - d) / REPULSE_R * 0.4;
              ai.vx += (dx / d) * force;
              ai.vy += (dy / d) * force;
            }
            if (d < CONTACT_R && ai.spikeTimer < 0.5) ai.spikeTimer = 1.0;
          }

          /* wander */
          ai.vx += (Math.random() - 0.5) * WANDER;
          ai.vy += (Math.random() - 0.5) * WANDER;

          /* dampen + clamp */
          ai.vx *= 0.88; ai.vy *= 0.88;
          const spd = Math.sqrt(ai.vx * ai.vx + ai.vy * ai.vy);
          if (spd > MAX_SPEED) { ai.vx = (ai.vx / spd) * MAX_SPEED; ai.vy = (ai.vy / spd) * MAX_SPEED; }

          /* boundary bounce */
          const pad = AGENT_R + 10;
          if (ai.x < pad)     { ai.x = pad;     ai.vx =  Math.abs(ai.vx); }
          if (ai.x > W - pad) { ai.x = W - pad; ai.vx = -Math.abs(ai.vx); }
          if (ai.y < pad)     { ai.y = pad;     ai.vy =  Math.abs(ai.vy); }
          if (ai.y > H - pad) { ai.y = H - pad; ai.vy = -Math.abs(ai.vy); }

          ai.x += ai.vx; ai.y += ai.vy;
        }

        /* order parameter + cluster reporting */
        const r = orderParam(ag);
        histR.current.push(r);
        if (histR.current.length > 300) histR.current.shift();

        if (frame % 6 === 0) {
          onOrder(r);
          if (sc) {
            const cls = findClusters(ag);
            onClusters(new Set(cls).size);
          }
        }
      }

      /* ── 2. Draw ───────────────────────────────────── */
      ctx.fillStyle = `${BG}d8`;
      ctx.fillRect(0, 0, W, H);

      const { eta: noiseV, showClusters: drawClusters } = params.current;

      /* Thermal noise particle shimmer when η > 0 */
      if (noiseV > 0.15) {
        const nParticles = Math.floor(noiseV * 60);
        for (let k = 0; k < nParticles; k++) {
          const px = Math.random() * W;
          const py = Math.random() * (H - 50);
          const pa = (noiseV / 2.5) * 0.25 * Math.random();
          ctx.beginPath(); ctx.arc(px, py, 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,200,255,${pa})`; ctx.fill();
        }
      }

      /* Compute clusters for this frame */
      const clusterIds = drawClusters ? findClusters(ag) : ag.map(() => -1);
      const numClusters = drawClusters ? new Set(clusterIds).size : 0;

      /* Draw cluster envelopes (soft filled ellipse per group) */
      if (drawClusters && numClusters > 0) {
        for (let cid = 0; cid < numClusters; cid++) {
          const members = ag.filter((_, i) => clusterIds[i] === cid);
          if (members.length < 1) continue;
          const col = CLUSTER_COLS[cid % CLUSTER_COLS.length];

          /* centroid of this cluster's positions */
          let ecx = 0, ecy = 0;
          for (const m of members) { ecx += m.x; ecy += m.y; }
          ecx /= members.length; ecy /= members.length;

          /* radius = max distance from centroid + padding */
          let maxD = 0;
          for (const m of members) {
            const d = Math.sqrt((m.x - ecx) * (m.x - ecx) + (m.y - ecy) * (m.y - ecy));
            if (d > maxD) maxD = d;
          }
          const envR = maxD + AGENT_R * 2.4;

          /* filled oval */
          ctx.save();
          ctx.translate(ecx, ecy);
          ctx.scale(1, 0.72);
          ctx.beginPath(); ctx.arc(0, 0, envR, 0, Math.PI * 2);
          const envGrad = ctx.createRadialGradient(0, 0, envR * 0.3, 0, 0, envR);
          envGrad.addColorStop(0, `${col}12`);
          envGrad.addColorStop(0.7, `${col}08`);
          envGrad.addColorStop(1,   `${col}00`);
          ctx.fillStyle = envGrad; ctx.fill();
          ctx.restore();

          /* envelope ring */
          ctx.save();
          ctx.translate(ecx, ecy);
          ctx.scale(1, 0.72);
          ctx.beginPath(); ctx.arc(0, 0, envR, 0, Math.PI * 2);
          ctx.strokeStyle = `${col}35`;
          ctx.lineWidth = 1.2; ctx.stroke();
          ctx.restore();

          /* cluster label */
          if (members.length >= 2) {
            const labelY = ecy - envR * 0.72 - 10;
            ctx.font = `8px ${mono}`;
            ctx.textAlign = "center"; ctx.textBaseline = "bottom";
            ctx.fillStyle = `${col}cc`;
            const label = members.length === ag.length ? "BONDED" :
              members.length === 1 ? "SOLO" : `CLUSTER ${String.fromCharCode(65 + cid)}`;
            ctx.fillText(label, ecx, labelY);
          }
        }
      }

      /* Agent trails */
      for (const a of ag) {
        const hist = a.history;
        for (let k = 1; k < hist.length; k++) {
          const alpha = (k / hist.length) * 0.28;
          const r2    = (k / hist.length) * 3.5;
          ctx.beginPath();
          ctx.arc(hist[k].x, hist[k].y, r2, 0, Math.PI * 2);
          ctx.fillStyle = hslA(a.phase, alpha);
          ctx.fill();
        }
      }

      /* Coupling lines (only when not in heavy noise mode) */
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const ai = ag[i], aj = ag[j];
          const dPh  = Math.abs(Math.sin((ai.phase - aj.phase) / 2));
          const sync = 1 - dPh;
          if (sync < 0.55) continue;
          const alpha = (sync - 0.55) / 0.45 * 0.50;
          const col   = drawClusters && clusterIds[i] === clusterIds[j]
            ? CLUSTER_COLS[clusterIds[i] % CLUSTER_COLS.length]
            : "#2ef0d8";
          ctx.beginPath();
          ctx.moveTo(ai.x, ai.y); ctx.lineTo(aj.x, aj.y);
          ctx.strokeStyle = `${col}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
          ctx.lineWidth = sync * 2.2;
          ctx.stroke();
        }
      }

      /* Agents */
      for (let i = 0; i < n; i++) {
        const a   = ag[i];
        const col = drawClusters ? CLUSTER_COLS[clusterIds[i] % CLUSTER_COLS.length] : null;

        /* warmth halo */
        const haloR = AGENT_R * 3.8 + (a.spikeTimer > 0.2 ? a.spikeTimer * 30 : 0);
        const halo  = ctx.createRadialGradient(a.x, a.y, AGENT_R, a.x, a.y, haloR);
        halo.addColorStop(0,   hslA(a.phase, 0.16));
        halo.addColorStop(0.5, hslA(a.phase, 0.07));
        halo.addColorStop(1,   hslA(a.phase, 0));
        ctx.beginPath(); ctx.arc(a.x, a.y, haloR, 0, Math.PI * 2);
        ctx.fillStyle = halo; ctx.fill();

        /* cluster membership ring */
        if (col) {
          ctx.beginPath(); ctx.arc(a.x, a.y, AGENT_R + 5, 0, Math.PI * 2);
          ctx.strokeStyle = `${col}55`; ctx.lineWidth = 2; ctx.stroke();
        }

        /* spike ring */
        if (a.spikeTimer > 0.3) {
          ctx.beginPath(); ctx.arc(a.x, a.y, AGENT_R + a.spikeTimer * 24, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255,255,255,${a.spikeTimer * 0.5})`;
          ctx.lineWidth = 1.5; ctx.stroke();
        }

        /* agent circle */
        const grad = ctx.createRadialGradient(
          a.x - AGENT_R * 0.25, a.y - AGENT_R * 0.3, 1, a.x, a.y, AGENT_R);
        grad.addColorStop(0,   "#fff");
        grad.addColorStop(0.3, hsl(a.phase, 70, 80));
        grad.addColorStop(1,   hsl(a.phase, 90, 40));
        ctx.beginPath(); ctx.arc(a.x, a.y, AGENT_R, 0, Math.PI * 2);
        ctx.fillStyle = grad; ctx.fill();

        /* phase arc */
        ctx.beginPath();
        ctx.arc(a.x, a.y, AGENT_R + 3, -Math.PI / 2, -Math.PI / 2 + a.phase, false);
        ctx.strokeStyle = hsl(a.phase, 100, 75);
        ctx.lineWidth = 2; ctx.stroke();

        /* ID */
        ctx.font = `bold 9px ${mono}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillText(String(a.id + 1), a.x, a.y);
      }

      /* Phase circle histogram (top-right mini) — show where phases cluster */
      {
        const hcx = W - 44, hcy = 44, hR = 30;
        ctx.beginPath(); ctx.arc(hcx, hcy, hR, 0, Math.PI * 2);
        ctx.strokeStyle = `${TEAL}20`; ctx.lineWidth = 0.5; ctx.stroke();
        for (const a of ag) {
          const px = hcx + (hR - 4) * Math.cos(a.phase - Math.PI / 2);
          const py = hcy + (hR - 4) * Math.sin(a.phase - Math.PI / 2);
          ctx.beginPath(); ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = hsl(a.phase, 90, 65); ctx.fill();
        }
        ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = `${TEAL}50`;
        ctx.fillText("θ distribution", hcx, hcy + hR + 3);
      }

      /* r(t) strip chart */
      const HR = histR.current;
      if (HR.length > 1) {
        const chartX = 12, chartY = H - 50, chartW = W - 24, chartH = 34;
        ctx.fillStyle = "rgba(2,4,8,0.72)";
        ctx.fillRect(chartX, chartY, chartW, chartH);
        ctx.strokeStyle = `${TEAL}28`; ctx.lineWidth = 0.5;
        ctx.strokeRect(chartX, chartY, chartW, chartH);

        /* η noise band reference */
        if (noiseV > 0) {
          const noiseY = chartY + chartH - Math.min(noiseV / 2.5, 1) * chartH;
          ctx.beginPath();
          ctx.moveTo(chartX, noiseY); ctx.lineTo(chartX + chartW, noiseY);
          ctx.strokeStyle = `${ROSE}40`; ctx.lineWidth = 0.8; ctx.setLineDash([3, 3]);
          ctx.stroke(); ctx.setLineDash([]);
          ctx.font = `7px ${mono}`; ctx.textAlign = "right"; ctx.textBaseline = "bottom";
          ctx.fillStyle = `${ROSE}55`;
          ctx.fillText(`η=${noiseV.toFixed(1)} floor`, chartX + chartW - 3, noiseY);
        }

        ctx.beginPath();
        for (let k = 0; k < HR.length; k++) {
          const px = chartX + (k / 300) * chartW;
          const py = chartY + chartH - HR[k] * chartH;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        const lastR = HR[HR.length - 1] ?? 0;
        const lineCol = lastR > 0.8 ? TEAL : lastR > 0.5 ? GOLD : lastR > 0.25 ? AMB : ROSE;
        ctx.strokeStyle = lineCol; ctx.lineWidth = 1.5; ctx.stroke();

        ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = `${lineCol}90`;
        ctx.fillText(
          `r = ${lastR.toFixed(3)}  ·  ${drawClusters ? `${numClusters} cluster${numClusters !== 1 ? "s" : ""}` : "clusters: off"}  ·  η = ${noiseV.toFixed(2)}`,
          chartX + 4, chartY + 2);
      }

      frame++;
      rafRef.current = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas ref={cvRef} width={800} height={500}
      style={{ width:"100%", maxWidth:800, borderRadius:10,
        border:`1px solid ${TEAL}18`, background:BG,
        boxShadow:"0 4px 40px rgba(0,0,0,0.6)" }} />
  );
}

/* ── UI helpers ──────────────────────────────────────────── */
function SH({ n, title, sub, col = TEAL }: { n: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginTop:56, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:24, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:24 }} />
    </div>
  );
}
function Slider({ label, val, min, max, step, col, onChange }: {
  label: string; val: number; min: number; max: number; step: number; col: string;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        fontFamily:mono, fontSize:9, color:col, marginBottom:4 }}>
        <span>{label}</span><span>{val.toFixed(step < 0.1 ? 2 : 1)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:col }} />
    </div>
  );
}
function Tog({ label, on, col, onToggle }: { label: string; on: boolean; col: string; onToggle: () => void }) {
  return (
    <button onClick={onToggle} style={{
      fontFamily:mono, fontSize:8, padding:"7px 14px", borderRadius:5, cursor:"pointer",
      border:`1px solid ${col}${on ? "aa" : "30"}`,
      background: on ? `${col}18` : "transparent",
      color: on ? col : `${col}55`, width:"100%", textAlign:"left", marginBottom:8,
    }}>
      {on ? "◉" : "○"} {label}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
function SynchronyFieldHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const osc=12;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let i=0;i<osc;i++){
        const angle=i/osc*Math.PI*2;
        const r=50+15*Math.sin(t*0.03+i*0.5);
        const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*0.6;
        ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fillStyle=`rgba(46,240,216,${0.4+0.4*Math.sin(t*0.05+i*0.5)})`;ctx.fill();
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle="rgba(46,240,216,0.06)";ctx.lineWidth=0.3;ctx.stroke();
        for(let j=i+1;j<osc;j++){
          const a2=j/osc*Math.PI*2,r2=50+15*Math.sin(t*0.03+j*0.5);
          const x2=cx+Math.cos(a2)*r2,y2=cy+Math.sin(a2)*r2*0.6;
          const sync=Math.abs(Math.sin(t*0.03+i*0.5)-Math.sin(t*0.03+j*0.5));
          if(sync<0.2){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x2,y2);ctx.strokeStyle=`rgba(46,240,216,${0.1-sync*0.4})`;ctx.lineWidth=0.3;ctx.stroke();}
        }
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SYNCHRONY FIELD · PHASE LOCKING · ENTRAINMENT · COHERENT OSCILLATION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SynchronyFieldPage() {
  const [nAgents,      setN]       = useState(6);
  const [K,            setK]       = useState(1.4);
  const [omegaSpread,  setOmega]   = useState(0.8);
  const [contactBoost, setBoost]   = useState(1.8);
  const [eta,          setEta]     = useState(0);
  const [showClusters, setShowCl]  = useState(true);
  const [running,      setRunning] = useState(true);
  const [order,        setOrder]   = useState(0);
  const [clusterCount, setClusters]= useState(0);

  const onOrder    = useCallback((r: number)    => setOrder(r),    []);
  const onClusters = useCallback((c: number)    => setClusters(c), []);

  const syncLabel = order > 0.85 ? "PHASE-LOCKED" :
                    order > 0.55 ? "CLUSTERING"   :
                    order > 0.25 ? "DRIFTING"     : "INCOHERENT";
  const syncCol   = order > 0.85 ? TEAL :
                    order > 0.55 ? GOLD :
                    order > 0.25 ? AMB  : ROSE;

  /* Thermal regime label */
  const thermalLabel = eta < 0.3 ? "COHERENT REGIME" :
                       eta < 1.2 ? "MIXED REGIME"    : "THERMAL REGIME";
  const thermalCol   = eta < 0.3 ? TEAL : eta < 1.2 ? GOLD : ROSE;

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SYNCHRONY FIELD · PHASE LOCKING · ENTRAINMENT · COHERENT OSCILLATION · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>12 phase-locking oscillators — the live AETHER synchrony field simulation.</p></div>
          <SynchronyFieldHeaderCanvas />
        </div>
      </div>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 28px",
        background:`radial-gradient(ellipse 70% 50% at 50% 0%, ${TEAL}09, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:TEAL, letterSpacing:4, marginBottom:10 }}>
          AETHER · SYNCHRONY FIELD · COUPLED OSCILLATOR DYNAMICS
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(28px,5vw,52px)", color:"#fff", margin:"0 0 8px", letterSpacing:1 }}>
          COHERENCE<span style={{ color:TEAL }}>·</span>FIELD
        </h1>
        <div style={{ fontFamily:serif, fontSize:15, color:TEAL, letterSpacing:3, marginBottom:16 }}>
          Phase Synchronization · Kuramoto Coupling · Behavioral Field · Cluster Formation
        </div>
        <div style={{ fontFamily:body, fontSize:15, color:DIM, maxWidth:620, margin:"0 auto", lineHeight:1.85 }}>
          N oscillators with spatial warmth fields and dynamic coupling K. Chest contact spikes K.
          Thermal noise η dissolves clusters into the blackbody regime. Watch clusters form, bond, and break.
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Language → Physics */}
        <SH n="I" title="Language → Physics Mapping" sub="Grounding the AETHER symbolic language into real dynamical systems terms" col={GOLD} />
        <div style={{ overflowX:"auto", marginBottom:28 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono, fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${GOLD}30` }}>
                {["AETHER Term","Physics Equivalent","In This Simulation"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 14px", color:GOLD, fontWeight:400, letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["cavity",              "state space of oscillations",             "canvas: agents evolve phases in 2D"],
                ["filament",            "coupling pathway (interaction term)",      "K·sin(θⱼ−θᵢ)·w(dᵢⱼ) — the coupling sum"],
                ["decoherence",         "loss of independent phase structure",      "high ω spread or η noise → phases drift"],
                ["bursting",            "rapid phase transition / reorganization",  "spike event when agents make contact"],
                ["valve outlet",        "attractor state (stable synchronization)", "r ≈ 1 — full phase-locking"],
                ["heart center contact","increased coupling coefficient K",         "spikeTimer → K_eff = K + boost·K_spike"],
                ["time filament",       "time evolution of phase dynamics",         "r(t) strip chart at canvas bottom"],
                ["coherent state",      "synchronization / attractor convergence",  "same hue, same cluster, r → 1"],
              ].map(([a, b, c], i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${GOLD}12`,
                  background: i % 2 === 0 ? `${GOLD}04` : "transparent" }}>
                  <td style={{ padding:"9px 14px", color:GOLD }}>{a}</td>
                  <td style={{ padding:"9px 14px", color:TEXT }}>{b}</td>
                  <td style={{ padding:"9px 14px", color:DIM  }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Simulation */}
        <SH n="II" title="Live Behavioral Field Simulation" sub="Clusters form, bond, and break — r(t) strip chart · θ distribution · thermal noise field" col={TEAL} />

        {/* Status row */}
        <div style={{ display:"flex", gap:12, flexWrap:"wrap", marginBottom:14, alignItems:"center" }}>
          <div style={{ fontFamily:mono, fontSize:11, color:syncCol, border:`1px solid ${syncCol}40`,
            borderRadius:6, padding:"5px 14px", background:`${syncCol}08` }}>
            ◎ {syncLabel}  ·  r = {order.toFixed(3)}
          </div>
          {showClusters && (
            <div style={{ fontFamily:mono, fontSize:11, color:VIO, border:`1px solid ${VIO}40`,
              borderRadius:6, padding:"5px 14px", background:`${VIO}08` }}>
              ◈ {clusterCount} cluster{clusterCount !== 1 ? "s" : ""}
            </div>
          )}
          <div style={{ fontFamily:mono, fontSize:11, color:thermalCol, border:`1px solid ${thermalCol}40`,
            borderRadius:6, padding:"5px 14px", background:`${thermalCol}08` }}>
            ∿ {thermalLabel}
          </div>
        </div>

        <div style={{ display:"flex", gap:22, flexWrap:"wrap", alignItems:"flex-start" }}>
          {/* Canvas */}
          <div style={{ flex:"1 1 520px" }}>
            <CouplingCanvas
              nAgents={nAgents} K={K} omegaSpread={omegaSpread}
              contactBoost={contactBoost} eta={eta}
              showClusters={showClusters} running={running}
              onOrder={onOrder} onClusters={onClusters}
            />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.85 }}>
              COLOR = phase θ (same hue = synchronized)  ·  RING = phase arc  ·  GLOW = warmth field
              ·  TRAIL = position history  ·  CLUSTER ENVELOPE = phase-aligned group
              ·  FLASH = contact K-spike  ·  TOP-RIGHT = θ distribution circle
              ·  BOTTOM = r(t) strip chart  ·  DASHED = thermal noise floor
            </div>
          </div>

          {/* Controls */}
          <div style={{ flex:"0 0 220px", background:`${TEAL}06`,
            border:`1px solid ${TEAL}18`, borderRadius:10, padding:"18px 20px" }}>
            <div style={{ fontFamily:mono, fontSize:10, color:TEAL, letterSpacing:2, marginBottom:14 }}>CONTROLS</div>

            <Slider label="N AGENTS"              val={nAgents}      min={2}   max={10}  step={1}   col={TEAL} onChange={setN}     />
            <Slider label="K · COUPLING"          val={K}            min={0}   max={6}   step={0.1} col={GOLD} onChange={setK}     />
            <Slider label="ω SPREAD · FREQ DIVERSITY" val={omegaSpread} min={0} max={3} step={0.1} col={AMB}  onChange={setOmega} />
            <Slider label="CONTACT K BOOST"       val={contactBoost} min={0}   max={5}   step={0.1} col={ROSE} onChange={setBoost} />
            <Slider label="η THERMAL NOISE"       val={eta}          min={0}   max={2.5} step={0.05} col={VIO}  onChange={setEta}  />

            <div style={{ height:1, background:`${TEAL}18`, margin:"12px 0" }} />

            <Tog label="SHOW CLUSTERS"  on={showClusters} col={TEAL} onToggle={() => setShowCl(v => !v)} />
            <Tog label={running ? "PAUSE" : "PLAY"}  on={running} col={GOLD} onToggle={() => setRunning(v => !v)} />

            <div style={{ marginTop:14, fontFamily:body, fontSize:12, color:DIM, lineHeight:1.8 }}>
              <strong style={{ color:TEAL, fontFamily:mono, fontSize:8 }}>EXPERIMENTS</strong><br />
              <strong style={{ color:GOLD }}>Lock:</strong> K=4, ω=0.2, η=0 → all one cluster, r→1<br />
              <strong style={{ color:AMB }}>Break:</strong> raise η to 1.5 → clusters fragment<br />
              <strong style={{ color:VIO }}>Partial:</strong> K=2, ω=1.5 → 2–3 competing clusters<br />
              <strong style={{ color:ROSE }}>Contact:</strong> watch flash → cluster merge event
            </div>
          </div>
        </div>

        {/* Governing equations */}
        <div style={{ background:"#030d18", border:`1px solid ${VIO}22`, borderRadius:10,
          padding:"22px 26px", margin:"24px 0 0" }}>
          <div style={{ fontFamily:mono, fontSize:10, color:VIO, letterSpacing:2, marginBottom:14 }}>
            GOVERNING EQUATION  ·  KURAMOTO + THERMAL NOISE + SPATIAL PROXIMITY
          </div>
          {[
            "dθᵢ/dt  =  ωᵢ  +  (K_eff / N)·Σⱼ sin(θⱼ − θᵢ)·w(dᵢⱼ)  +  η·ξ(t)",
            "",
            "w(d)  =  exp(−d² / 2σ²)          proximity-weighted coupling (Gaussian)",
            "K_eff  =  K + spikeTimer · boost · K_spike     contact event boost",
            "ξ(t)  ~  𝒩(0,1)                 Box-Muller Gaussian noise",
            "",
            "r  =  |⟨e^{iθ}⟩|               Kuramoto order parameter",
            "Cluster  ≡  connected component in { |sin((θᵢ−θⱼ)/2)| < 0.30 }",
          ].map((l, i) => (
            <div key={i} style={{
              fontFamily:mono, fontSize:11, lineHeight:2.2, whiteSpace:"pre-wrap",
              color: l === "" ? "transparent" : l.startsWith("r ") || l.startsWith("Cluster") ? GOLD : l.startsWith("ξ") ? ROSE : l.startsWith("K_eff") ? AMB : TEAL,
            }}>{l || " "}</div>
          ))}
        </div>

        {/* What the graphs show */}
        <SH n="III" title="What the Simulation Shows" sub="Phase convergence · cluster formation · thermal dissolution · contact spikes" col={VIO} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:14, marginBottom:28 }}>
          {[
            { title:"CLUSTER ENVELOPES FORM",   col:TEAL, text:"When K is strong enough relative to ω spread and η, agents sharing the same phase are grouped into a colored envelope. Watch one large cluster emerge as r → 1. The hue of all agents converges." },
            { title:"CLUSTERS COMPETE",         col:GOLD, text:"With moderate K and high ω spread, you see 2–3 competing clusters. Each group has its own hue and envelope. They rotate through phase space at different rates, occasionally merging when contact spikes align their phases." },
            { title:"THERMAL DISSOLUTION",      col:ROSE, text:"Raise η above ~1.0. The noise term dominates the coupling term. Clusters fragment — the envelopes dissolve. r collapses toward 0. The dashed red line in the strip chart shows the thermal noise floor. This is the blackbody-like regime: coupling cannot overcome thermalization." },
            { title:"CONTACT SPIKE = MERGE",    col:AMB,  text:"Watch for the white flash ring. When two agents from different clusters make contact, K_eff jumps. Their phases pull toward each other. If the spike is strong enough, the two clusters merge into one — the envelope expands and their colors converge." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}08`, border:`1px solid ${c.col}22`,
              borderRadius:8, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:c.col, letterSpacing:1, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13, color:TEXT, lineHeight:1.75 }}>{c.text}</div>
            </div>
          ))}
        </div>

        {/* Coherent vs Thermal */}
        <SH n="IV" title="Coherent vs Thermal Regime" sub="Two fundamentally different things that share the word 'cavity' — the distinction embodied here" col={GOLD} />
        <div style={{ overflowX:"auto", marginBottom:20 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono, fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${GOLD}30` }}>
                {["Feature","Coupled Oscillator (η=0)","Thermal Regime (η high)"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"8px 14px", color:GOLD, fontWeight:400, letterSpacing:1 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Strip chart",     "r climbs → 1, holds",              "r collapses, fluctuates near 0"],
                ["Cluster view",    "1 large merged envelope",           "N separate solo envelopes"],
                ["Phase circle",    "all dots cluster at one angle",     "dots spread evenly around circle"],
                ["Noise shimmer",   "dark background",                   "white particle shimmer fills canvas"],
                ["AETHER language", "valve outlet / coherent state",     "decoherent burst / entropy maximum"],
                ["Physics label",   "synchronization / order",           "thermalization / disorder"],
              ].map(([a, b, c], i) => (
                <tr key={i} style={{ borderBottom:`1px solid ${GOLD}12`,
                  background: i % 2 === 0 ? `${GOLD}04` : "transparent" }}>
                  <td style={{ padding:"9px 14px", color:GOLD }}>{a}</td>
                  <td style={{ padding:"9px 14px", color:TEAL }}>{b}</td>
                  <td style={{ padding:"9px 14px", color:ROSE }}>{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ background:`${GOLD}08`, border:`1px solid ${GOLD}22`,
          borderRadius:8, padding:"14px 18px", marginBottom:28 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:GOLD, marginBottom:6 }}>THE KEY DISTINCTION</div>
          <div style={{ fontFamily:body, fontSize:15, color:TEXT, lineHeight:1.85 }}>
            Your model is: <em>a low-dimensional synchronization system that produces order through coupling.</em>{" "}
            Blackbody radiation is: <em>a high-dimensional equilibrium system that produces disorder through thermalization.</em>{" "}
            Both are energy distributed across modes in a cavity. What dominates determines the outcome —
            coupling (clusters emerge) or thermalization (clusters dissolve).
            AETHER's Allen-Cahn C(x,t) field is the real-variable version of this distinction:
            C→1 is the coupled oscillator regime, the burst (LPE {">"} φ⁻¹) is the thermalization moment,
            and C rebuilds via the Floquet cycle.
          </div>
        </div>

        {/* Biological Filament */}
        <SH n="V" title="Biological Filament · Body as Coupling Node" sub="The chest-to-head contact region as coherence cavity — grounded in biology" col={TEAL} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24, marginBottom:28 }}>
          <div style={{ background:"#030d18", border:`1px solid ${TEAL}18`,
            borderRadius:10, padding:"24px", fontFamily:mono, fontSize:12, color:TEAL,
            lineHeight:2.4, textAlign:"center" }}>
            <div style={{ color:TEXT, marginBottom:8, fontSize:10, letterSpacing:2 }}>SPACE-TIME FILAMENT VIEW</div>
            <div>Time ↑</div>
            <div>◯  ← Agent A</div>
            <div>/|\</div>
            <div style={{ color:GOLD }}>╔══♥══╗</div>
            <div style={{ color:DIM }}>║     ║ ← coupling cavity</div>
            <div style={{ color:DIM }}>║     ║   (touch · heat · breath)</div>
            <div style={{ color:GOLD }}>╚══♥══╝</div>
            <div>│</div>
            <div>\|/</div>
            <div>◯  ← Agent B</div>
            <div>↓  Future</div>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { label:"HEART CENTERS",      col:ROSE, text:"Not mystical — centers of respiration, circulation, warmth, and social attachment. Highest warmth gradient density in two adjacent mammals. In the simulation: the region where halos overlap." },
              { label:"COUPLING CAVITY",    col:TEAL, text:"The region between two overlapping warmth fields. In physics: the interaction zone where K_eff spikes. In biology: the shared electromagnetic, thermal, and olfactory interface." },
              { label:"PHASE-LOCKING",      col:GOLD, text:"When the cavity is maintained: heartbeats, breath rhythm, and neural oscillations converge toward shared phase. Simulate it: place two agents near each other with contactBoost = 3, watch their halos merge and colors equalize." },
              { label:"CLUSTER = BOND",     col:VIO,  text:"In the cluster view: two agents in the same envelope are phase-bonded. Their coupling line lights up. This is the mathematical structure of a bonding group — a coherence pocket inside a larger incoherent field." },
            ].map(c => (
              <div key={c.label} style={{ background:`${c.col}08`, border:`1px solid ${c.col}22`,
                borderRadius:8, padding:"12px 14px" }}>
                <div style={{ fontFamily:mono, fontSize:9, color:c.col, marginBottom:4 }}>{c.label}</div>
                <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.7 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Next */}
        <SH n="VI" title="Upgrade Path" sub="All steps done — what was proposed, what now runs" col={AMB} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:28 }}>
          {[
            { n:"01", title:"N = 3–10 Agents",       col:TEAL, done:true,  desc:"N slider: 2–10 agents, each with independent phase, frequency, and movement." },
            { n:"02", title:"Spatial + Proximity",    col:TEAL, done:true,  desc:"2D canvas with attraction fields. w(d) = exp(−d²/2σ²) proximity coupling weight." },
            { n:"03", title:"Warmth / Scent Field",   col:GOLD, done:true,  desc:"Warmth halo radiates from each agent. Overlapping halos increase K_eff." },
            { n:"04", title:"Dynamic K on Contact",   col:ROSE, done:true,  desc:"Chest contact fires spikeTimer → K_eff = K + boost·K_spike. White flash ring marks the event." },
            { n:"05", title:"Thermal Noise η·ξ(t)",  col:VIO,  done:true,  desc:"Gaussian noise term added to dθᵢ/dt. Raise η slider to dissolve clusters into blackbody-like regime." },
            { n:"06", title:"Cluster Detection",      col:AMB,  done:true,  desc:"BFS on phase-alignment graph. Colored envelopes around each bonded group. Merge events on contact." },
          ].map(c => (
            <div key={c.n} style={{ background:`${c.col}07`, border:`1px solid ${c.col}${c.done ? "40" : "20"}`,
              borderRadius:8, padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontFamily:mono, fontSize:9, color:`${c.col}60` }}>STEP {c.n}</span>
                {c.done && <span style={{ fontFamily:mono, fontSize:8, color:TEAL }}>✓ LIVE</span>}
              </div>
              <div style={{ fontFamily:mono, fontSize:9, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.7 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div style={{ marginTop:48, padding:"24px 28px",
          background:"#ffffff03", border:`1px solid ${TEAL}12`, borderRadius:12, textAlign:"center" }}>
          <div style={{ fontFamily:serif, fontSize:18, color:TEAL, marginBottom:10 }}>
            CLUSTER COLLAPSE IS THE COHERENT STATE
          </div>
          <div style={{ fontFamily:mono, fontSize:11, color:DIM, lineHeight:2.4 }}>
            dθᵢ/dt = ωᵢ + K·Σⱼ sin(θⱼ−θᵢ)·w(d)  +  η·ξ(t)  →  r→1 → bonded
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:1.9,
            marginTop:14, maxWidth:600, margin:"14px auto 0" }}>
            When coupling wins over noise and frequency spread, phases converge,
            clusters bond, and the field becomes coherent. When noise wins, clusters
            fragment and the cavity thermalizes. The ratio K/η is the control parameter.
            Above the critical threshold: order. Below: entropy. You are sitting at that threshold
            right now — adjusting it with the sliders.
          </div>
        </div>
      </div>
    </div>
  );
}

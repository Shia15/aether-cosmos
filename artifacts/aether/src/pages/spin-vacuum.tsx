import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#5AB8E8", green: "#6EC87A", rose: "#E06878",
  violet: "#C890E8", amber: "#E87035",
};

type TabKey = "persistent" | "texture" | "gates" | "charge";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "persistent", label: "Persistent Spin",   sym: "↻∞", col: C.gold },
  { key: "texture",    label: "Spin Texture",      sym: "⌽",  col: C.cyan },
  { key: "gates",      label: "Vacuum Gates",      sym: "⏚",  col: C.violet },
  { key: "charge",     label: "Charge Balance",    sym: "±",  col: C.green },
];

export default function SpinVacuumPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("persistent");
  const tabRef = useRef<TabKey>("persistent");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ==== Persistent spin controls ====
  const [bias, setBias]   = useState(0.5);     // bias voltage (a.u.)
  const biasRef = useRef(bias); useEffect(() => { biasRef.current = bias; }, [bias]);
  const [sgap, setSgap]   = useState(0.6);     // spin gap Δ_s (topological)
  const sgapRef = useRef(sgap); useEffect(() => { sgapRef.current = sgap; }, [sgap]);
  const [scatter, setScatter] = useState(0.3); // ordinary scattering rate γ
  const scatterRef = useRef(scatter); useEffect(() => { scatterRef.current = scatter; }, [scatter]);

  // ==== Spin texture controls ====
  const [qwind, setQwind] = useState(1);       // winding number (1,2,3)
  const qwindRef = useRef(qwind); useEffect(() => { qwindRef.current = qwind; }, [qwind]);
  const [mtxt, setMtxt]   = useState(0.7);     // texture amplitude
  const mtxtRef = useRef(mtxt); useEffect(() => { mtxtRef.current = mtxt; }, [mtxt]);

  // ==== Vacuum gates controls ====
  const [ultraUp, setUltraUp] = useState(true);    // magnetization state
  const ultraRef = useRef(ultraUp); useEffect(() => { ultraRef.current = ultraUp; }, [ultraUp]);
  const [gateThresh, setGateThresh] = useState(0.5); // gate threshold (controls coupling strength)
  const gateRef = useRef(gateThresh); useEffect(() => { gateRef.current = gateThresh; }, [gateThresh]);
  const [flipPhase, setFlipPhase] = useState(1);   // 0..1 animation of flip
  const flipRef = useRef(flipPhase); useEffect(() => { flipRef.current = flipPhase; }, [flipPhase]);

  // ==== Charge balance controls ====
  const [nPos, setNpos] = useState(1.0);       // positive population (a.u.)
  const nPosRef = useRef(nPos); useEffect(() => { nPosRef.current = nPos; }, [nPos]);
  const [nNeg, setNneg] = useState(1.0);       // negative population
  const nNegRef = useRef(nNeg); useEffect(() => { nNegRef.current = nNeg; }, [nNeg]);

  // ==== Log + ops ====
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [ops, setOps] = useState(0);
  const [coh, setCoh] = useState(0.45);
  function pushLog(tag: string, msg: string, col: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setEvents(e => [{ ts, tag, msg, col }, ...e].slice(0, 24));
    setOps(o => o + 1);
    setCoh(c => Math.min(0.99, c + 0.03 * (1 - c)));
  }

  // ==== Derived observables ====
  const obs = useMemo(() => {
    // PERSISTENT: spin current J_s = (bias × σ_s) where σ_s is gapped/topological
    // ordinary: σ_n decays with scattering γ as 1/(1+γ²)
    // persistent: σ_s = (bias) × Θ(Δ_s - threshold) protected (≈ constant in bias range)
    const sigmaN = 1 / (1 + scatter * scatter * 4);                 // 0..1
    const persistent = sgap > 0.25 ? 1 : 0;
    const Js = persistent * bias * 0.95;                             // lossless spin current
    const Jn = sigmaN * bias;                                        // ordinary current (decays)
    const tauPersist = persistent ? Infinity : 1 / Math.max(0.05, scatter);

    // TEXTURE: net magnetization small but |∇m|² large
    const Mz = (1 - mtxt) * 0.05;                                    // residual (invisible)
    const gradM = mtxt * mtxt * (qwind * qwind);                     // texture density Q²
    // torque sign flips at Q crossing (here at q=2 boundary)
    const torqueSign = qwind >= 2 ? -1 : 1;

    // GATES: when UP, port open with strength χ_v
    const portOpen = ultraUp;
    const chiV = portOpen ? gateThresh * flipPhase : 0;              // vacuum coupling
    const ports = portOpen ? 4 : 0;
    const zptap = chiV * 0.84;                                       // zero-point tap rate (a.u.)

    // CHARGE: net = (n+ - n-)
    const netQ = nPos - nNeg;                                         // should be 0 at balance
    // if persistent spin is on, total spin current scales with sum even if charge cancels
    const spinFlow = (nPos + nNeg) * (persistent ? 0.6 : 0.15);

    return { Js, Jn, sigmaN, tauPersist, Mz, gradM, torqueSign, chiV, ports, zptap, netQ, spinFlow, persistent };
  }, [bias, sgap, scatter, qwind, mtxt, ultraUp, gateThresh, flipPhase, nPos, nNeg]);

  // ==== Animate flip transition when ultraUp changes ====
  useEffect(() => {
    let raf = 0; let t0 = performance.now();
    setFlipPhase(0);
    function step(t: number) {
      const e = Math.min(1, (t - t0) / 600);
      setFlipPhase(e);
      if (e < 1) raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [ultraUp]);

  // ==== Canvas ====
  useEffect(() => {
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    let phase = 0;
    let particles: { x: number; y: number; vx: number; vy: number; sign: 1 | -1; spin: 1 | -1 }[] = [];

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

    function draw() {
      if (!c || !ctx) return;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      // bg grid
      ctx.strokeStyle = "rgba(232,200,120,0.05)"; ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const t = tabRef.current;
      if (t === "persistent") drawPersistent(ctx, w, h, phase);
      else if (t === "texture") drawTexture(ctx, w, h, phase);
      else if (t === "gates") drawGates(ctx, w, h, phase);
      else if (t === "charge") drawCharge(ctx, w, h, phase, particles);

      phase += 0.018;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    // ============ DRAW: PERSISTENT SPIN ============
    function drawPersistent(ctx: CanvasRenderingContext2D, w: number, h: number, ph: number) {
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.32;

      // Title
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(232,200,120,0.55)"; ctx.textAlign = "left";
      ctx.fillText("◆ LOSSLESS PERSISTENT SPIN TRANSPORT", 14, 24);

      // Outer ring (the topologically protected channel)
      ctx.strokeStyle = "rgba(232,200,120,0.35)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
      // Inner ring (ordinary channel)
      ctx.strokeStyle = "rgba(90,184,232,0.25)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.62, 0, Math.PI * 2); ctx.stroke();

      // Persistent (gold) spin packets — never decay
      const persistent = sgapRef.current > 0.25;
      const Nout = 14;
      for (let i = 0; i < Nout; i++) {
        const a = (i / Nout) * Math.PI * 2 + ph * (0.6 + biasRef.current * 0.6);
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        const alpha = persistent ? 0.85 : 0.18;
        // spin arrow
        ctx.fillStyle = `rgba(232,200,120,${alpha})`;
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
        // up arrow tail
        ctx.strokeStyle = `rgba(245,232,176,${alpha})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x, y - 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x - 3, y - 5); ctx.lineTo(x, y - 8); ctx.lineTo(x + 3, y - 5); ctx.stroke();
      }

      // Ordinary (cyan) carriers — decay strongly with scattering
      const ordAlpha = 1 / (1 + scatterRef.current * scatterRef.current * 4);
      const Nin = 10;
      for (let i = 0; i < Nin; i++) {
        const a = (i / Nin) * Math.PI * 2 + ph * (0.4 + biasRef.current * 0.4) * ordAlpha;
        // simulate decay positions: only first few visible
        const visible = i / Nin < ordAlpha;
        if (!visible) continue;
        const x = cx + Math.cos(a) * R * 0.62;
        const y = cy + Math.sin(a) * R * 0.62;
        ctx.fillStyle = `rgba(90,184,232,${0.7 * ordAlpha})`;
        ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.fill();
      }

      // Scattering events — bursts in the inner ring only
      if (scatterRef.current > 0.1) {
        const Nsc = Math.floor(scatterRef.current * 12);
        for (let i = 0; i < Nsc; i++) {
          const a = ((i * 1.7 + ph) % (Math.PI * 2));
          const x = cx + Math.cos(a) * R * 0.62;
          const y = cy + Math.sin(a) * R * 0.62;
          ctx.fillStyle = "rgba(224,104,120,0.45)";
          ctx.beginPath(); ctx.arc(x, y, 4 + 2 * Math.sin(ph * 5 + i), 0, Math.PI * 2); ctx.fill();
        }
      }

      // Topological gap label — center
      ctx.font = "italic 16px ui-serif, Georgia, serif";
      ctx.fillStyle = "rgba(220,216,204,0.85)"; ctx.textAlign = "center";
      ctx.fillText(persistent ? "Δₛ ≠ 0  · protected" : "Δₛ → 0  · trivial", cx, cy - 6);
      ctx.font = "11px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(168,158,136,0.85)";
      ctx.fillText(persistent ? "spin current  is  lossless" : "spin current decays with γ", cx, cy + 14);

      // Plot strip on the right — current vs time (Js flat, Jn decaying)
      const px = w - 220, py = 60, pw = 200, phh = 110;
      ctx.strokeStyle = "rgba(232,200,120,0.18)"; ctx.lineWidth = 1;
      ctx.strokeRect(px, py, pw, phh);
      ctx.font = "9px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(232,200,120,0.5)"; ctx.textAlign = "left";
      ctx.fillText("J(t) — bias × σ", px + 6, py - 6);
      // axes
      ctx.strokeStyle = "rgba(232,200,120,0.12)";
      ctx.beginPath(); ctx.moveTo(px, py + phh - 18); ctx.lineTo(px + pw, py + phh - 18); ctx.stroke();
      // persistent line — flat
      ctx.strokeStyle = persistent ? "rgba(232,200,120,0.9)" : "rgba(232,200,120,0.2)";
      ctx.lineWidth = 2; ctx.beginPath();
      const yJs = py + phh - 18 - obs.Js * (phh - 26);
      ctx.moveTo(px, yJs); ctx.lineTo(px + pw, yJs); ctx.stroke();
      ctx.fillStyle = persistent ? "rgba(232,200,120,0.9)" : "rgba(232,200,120,0.4)";
      ctx.fillText(`Jₛ = ${obs.Js.toFixed(2)}`, px + 6, yJs - 4);
      // ordinary line — exponential decay
      ctx.strokeStyle = "rgba(90,184,232,0.85)"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i <= pw; i++) {
        const tau = Math.max(0.05, scatterRef.current);
        const v = obs.Jn * Math.exp(-(i / pw) * tau * 5);
        const yy = py + phh - 18 - v * (phh - 26);
        if (i === 0) ctx.moveTo(px + i, yy); else ctx.lineTo(px + i, yy);
      }
      ctx.stroke();
      ctx.fillStyle = "rgba(90,184,232,0.85)";
      ctx.fillText(`Jₙ = ${obs.Jn.toFixed(2)} → 0`, px + 6, py + phh - 4);
    }

    // ============ DRAW: SPIN TEXTURE ============
    function drawTexture(ctx: CanvasRenderingContext2D, w: number, h: number, ph: number) {
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(90,184,232,0.55)"; ctx.textAlign = "left";
      ctx.fillText("◆ INVISIBLE SPIN TEXTURE — TORQUE FLIP", 14, 24);

      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.36;
      const Q = qwindRef.current;
      const A = mtxtRef.current;

      // outer host magnet boundary
      ctx.strokeStyle = "rgba(90,184,232,0.25)"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      // grid of spin arrows
      const gx = 16, gy = 12;
      const sx = (R * 1.6) / gx;
      const sy = (R * 1.4) / gy;
      const x0 = cx - (sx * gx) / 2;
      const y0 = cy - (sy * gy) / 2;

      let netMx = 0, netMy = 0, netMz = 0; let nin = 0;
      for (let i = 0; i < gx; i++) {
        for (let j = 0; j < gy; j++) {
          const x = x0 + (i + 0.5) * sx;
          const y = y0 + (j + 0.5) * sy;
          const dx = x - cx, dy = y - cy;
          const r = Math.sqrt(dx * dx + dy * dy);
          if (r > R) continue;
          nin++;
          const ang = Math.atan2(dy, dx);
          // skyrmion-like: in-plane spin tangent rotates with winding Q
          const phi = Q * ang + ph * 0.6;
          // out-of-plane component (m_z) follows profile
          const profile = Math.cos((r / R) * Math.PI);     // +1 at center, -1 at edge
          const mz = profile * A;
          const mxy = Math.sqrt(Math.max(0, 1 - mz * mz)) * A;
          const sxv = Math.cos(phi) * mxy;
          const syv = Math.sin(phi) * mxy;
          netMx += sxv; netMy += syv; netMz += mz;

          // draw arrow
          const len = sx * 0.45;
          const ax = x - sxv * len * 0.5;
          const ay = y - syv * len * 0.5;
          const bx = x + sxv * len * 0.5;
          const by = y + syv * len * 0.5;
          // color encodes mz: green up, rose down, fade to gold mid
          const col = mz > 0.1 ? `rgba(110,200,122,${0.4 + 0.5 * Math.abs(mz)})`
                    : mz < -0.1 ? `rgba(224,104,120,${0.4 + 0.5 * Math.abs(mz)})`
                    : `rgba(232,200,120,${0.45})`;
          ctx.strokeStyle = col; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
          // dot at center indicating mz polarity
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.arc(x, y, mz > 0 ? 1.6 : 0.8, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Net magnetization — draw a tiny arrow at the centre (visible if not zero)
      const Mx = netMx / Math.max(1, nin), My = netMy / Math.max(1, nin), Mz = netMz / Math.max(1, nin);
      const Mtot = Math.sqrt(Mx * Mx + My * My + Mz * Mz);
      ctx.font = "italic 14px ui-serif, Georgia, serif";
      ctx.fillStyle = "rgba(220,216,204,0.85)"; ctx.textAlign = "center";
      ctx.fillText(`⟨M⟩ ≈ ${Mtot.toFixed(3)}  ·  invisible`, cx, cy + R + 28);
      ctx.font = "11px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(168,158,136,0.85)";
      ctx.fillText(`|∇m|² ∝ Q² = ${Q * Q}  ·  texture density LARGE`, cx, cy + R + 46);

      // torque flip indicator — top-right
      const tflip = obs.torqueSign;
      const tCol = tflip > 0 ? "rgba(110,200,122,0.85)" : "rgba(224,104,120,0.85)";
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = tCol; ctx.textAlign = "right";
      ctx.fillText(`τ_spin sign:  ${tflip > 0 ? "+" : "−"}  (Q ${tflip > 0 ? "<" : "≥"} 2)`, w - 14, 24);
    }

    // ============ DRAW: VACUUM GATES ============
    function drawGates(ctx: CanvasRenderingContext2D, w: number, h: number, ph: number) {
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(200,144,232,0.55)"; ctx.textAlign = "left";
      ctx.fillText("◆ ULTRA-FLIP → VACUUM PORTS", 14, 24);

      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.34;
      const up = ultraRef.current;
      const fp = flipRef.current;

      // central ultra-magnet block
      const blockR = 50;
      ctx.fillStyle = "rgba(200,144,232,0.10)";
      ctx.strokeStyle = "rgba(200,144,232,0.6)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, blockR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      // magnetization arrow inside (animates flip)
      const angCurr = up ? -Math.PI / 2 : Math.PI / 2;
      const angPrev = up ? Math.PI / 2 : -Math.PI / 2;
      const ang = angPrev + (angCurr - angPrev) * fp;
      ctx.strokeStyle = up ? "rgba(110,200,122,0.95)" : "rgba(224,104,120,0.95)";
      ctx.lineWidth = 3;
      const lx = cx + Math.cos(ang) * (blockR - 10);
      const ly = cy + Math.sin(ang) * (blockR - 10);
      const lx0 = cx - Math.cos(ang) * (blockR - 10);
      const ly0 = cy - Math.sin(ang) * (blockR - 10);
      ctx.beginPath(); ctx.moveTo(lx0, ly0); ctx.lineTo(lx, ly); ctx.stroke();
      // arrowhead
      const ahx = Math.cos(ang) * 8, ahy = Math.sin(ang) * 8;
      const px1 = lx - ahx + Math.cos(ang + Math.PI / 2) * 5;
      const py1 = ly - ahy + Math.sin(ang + Math.PI / 2) * 5;
      const px2 = lx - ahx + Math.cos(ang - Math.PI / 2) * 5;
      const py2 = ly - ahy + Math.sin(ang - Math.PI / 2) * 5;
      ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(px1, py1); ctx.moveTo(lx, ly); ctx.lineTo(px2, py2); ctx.stroke();

      // label inside
      ctx.font = "11px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = up ? "rgba(110,200,122,0.95)" : "rgba(224,104,120,0.95)";
      ctx.textAlign = "center";
      ctx.fillText(up ? "ULTRA ↑" : "ULTRA ↓", cx, cy + blockR + 16);

      // 4 vacuum ports around the block
      const portR = 22;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 - Math.PI / 4;
        const px = cx + Math.cos(a) * R;
        const py = cy + Math.sin(a) * R;
        // line from center to port
        ctx.strokeStyle = up ? `rgba(110,200,122,${0.25 + 0.25 * fp})`
                             : "rgba(120,120,140,0.15)";
        ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * blockR, cy + Math.sin(a) * blockR);
        ctx.lineTo(px - Math.cos(a) * portR, py - Math.sin(a) * portR); ctx.stroke();

        // port body
        const open = up;
        ctx.fillStyle = open ? `rgba(110,200,122,${0.18 + 0.20 * fp})` : "rgba(40,42,50,0.6)";
        ctx.strokeStyle = open ? `rgba(110,200,122,${0.7 + 0.25 * fp})` : "rgba(120,120,140,0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(px, py, portR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        // port label
        ctx.font = "10px ui-monospace, JetBrains Mono, monospace";
        ctx.fillStyle = open ? "rgba(110,200,122,0.95)" : "rgba(120,120,140,0.7)";
        ctx.textAlign = "center";
        ctx.fillText(open ? "OPEN" : "CLOSED", px, py + 3);
        // pulsing zero-point ripple if open
        if (open) {
          const rr = portR + (Math.sin(ph * 2 + i) * 0.5 + 0.5) * 8 * gateRef.current;
          ctx.strokeStyle = `rgba(110,200,122,${0.20 * gateRef.current})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(px, py, rr, 0, Math.PI * 2); ctx.stroke();
        }
      }

      // legend top-right
      ctx.font = "11px ui-monospace, JetBrains Mono, monospace";
      ctx.textAlign = "right";
      ctx.fillStyle = up ? "rgba(110,200,122,0.85)" : "rgba(224,104,120,0.85)";
      ctx.fillText(`vacuum coupling χᵥ = ${obs.chiV.toFixed(2)}`, w - 14, 24);
      ctx.fillStyle = "rgba(168,158,136,0.85)";
      ctx.fillText(`zero-point tap = ${obs.zptap.toFixed(2)}  · ports ${obs.ports}/4`, w - 14, 40);

      // tagline bottom
      ctx.font = "italic 13px ui-serif, Georgia, serif";
      ctx.fillStyle = "rgba(220,216,204,0.7)"; ctx.textAlign = "center";
      ctx.fillText(up ? "tap on" : "tap off", cx, h - 18);
    }

    // ============ DRAW: CHARGE BALANCE ============
    function drawCharge(ctx: CanvasRenderingContext2D, w: number, h: number, ph: number, parts: typeof particles) {
      ctx.font = "12px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(110,200,122,0.55)"; ctx.textAlign = "left";
      ctx.fillText("◆ ± POPULATION BALANCE — NET-NEUTRAL SPIN FLOW", 14, 24);

      const lane = h * 0.4;
      const ymid = h / 2;
      // channel boundaries
      ctx.strokeStyle = "rgba(232,200,120,0.18)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(40, ymid - lane / 2); ctx.lineTo(w - 40, ymid - lane / 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(40, ymid + lane / 2); ctx.lineTo(w - 40, ymid + lane / 2); ctx.stroke();

      // ensure population
      const want = Math.floor((nPosRef.current + nNegRef.current) * 12);
      while (parts.length < want) {
        const sign = Math.random() < nPosRef.current / (nPosRef.current + nNegRef.current) ? 1 : -1;
        parts.push({
          x: 40 + Math.random() * (w - 80),
          y: ymid + (Math.random() - 0.5) * (lane - 16),
          vx: sign === 1 ? 1.0 : -1.0,
          vy: 0,
          sign: sign as 1 | -1,
          spin: 1 as 1 | -1,        // both species have SAME spin → spin current ≠ 0 even when charge cancels
        });
      }
      while (parts.length > want) parts.pop();

      // update + draw
      let posMoving = 0, negMoving = 0;
      for (const p of parts) {
        p.x += p.vx * (0.7 + biasRef.current * 0.6);
        if (p.x < 30) p.x = w - 40;
        if (p.x > w - 30) p.x = 40;
        if (p.sign === 1) posMoving++; else negMoving++;
        // colour
        const col = p.sign === 1 ? "rgba(110,200,122,0.9)" : "rgba(224,104,120,0.9)";
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2); ctx.fill();
        // sign symbol
        ctx.font = "9px ui-monospace, JetBrains Mono, monospace";
        ctx.fillStyle = "rgba(11,12,15,0.95)"; ctx.textAlign = "center";
        ctx.fillText(p.sign === 1 ? "+" : "−", p.x, p.y + 3);
        // spin tick (always up — same for both species)
        ctx.strokeStyle = "rgba(232,200,120,0.65)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(p.x, p.y - 6); ctx.lineTo(p.x, p.y - 12); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(p.x - 2, p.y - 9); ctx.lineTo(p.x, p.y - 12); ctx.lineTo(p.x + 2, p.y - 9); ctx.stroke();
      }

      // net flow indicators on the right
      const px = w - 200, py = 60;
      ctx.font = "10px ui-monospace, JetBrains Mono, monospace";
      ctx.fillStyle = "rgba(232,200,120,0.55)"; ctx.textAlign = "left";
      ctx.fillText("CARRIERS", px, py);
      ctx.fillStyle = "rgba(110,200,122,0.85)";
      ctx.fillText(`n+ = ${posMoving}`, px, py + 18);
      ctx.fillStyle = "rgba(224,104,120,0.85)";
      ctx.fillText(`n− = ${negMoving}`, px, py + 34);

      // net charge bar
      ctx.fillStyle = "rgba(232,200,120,0.55)";
      ctx.fillText("J_charge = e(n+v − n−v)", px, py + 60);
      const netVal = obs.netQ;
      const barW = 160; const cxx = px;
      ctx.strokeStyle = "rgba(232,200,120,0.2)";
      ctx.strokeRect(cxx, py + 70, barW, 8);
      const fill = Math.max(-1, Math.min(1, netVal / 2));
      ctx.fillStyle = Math.abs(fill) < 0.05 ? "rgba(110,200,122,0.85)" : "rgba(224,104,120,0.85)";
      ctx.fillRect(cxx + barW / 2, py + 70, fill * barW / 2, 8);
      ctx.fillStyle = "rgba(220,216,204,0.85)";
      ctx.fillText(`= ${netVal.toFixed(2)}`, cxx, py + 92);

      // spin current bar (always positive when persistent)
      ctx.fillStyle = "rgba(232,200,120,0.55)";
      ctx.fillText("J_spin  ∝ (n+ + n−)", px, py + 118);
      ctx.strokeStyle = "rgba(232,200,120,0.2)";
      ctx.strokeRect(cxx, py + 128, barW, 8);
      const spinFill = Math.min(1, obs.spinFlow / 2);
      ctx.fillStyle = "rgba(232,200,120,0.85)";
      ctx.fillRect(cxx, py + 128, spinFill * barW, 8);
      ctx.fillStyle = "rgba(220,216,204,0.85)";
      ctx.fillText(`= ${obs.spinFlow.toFixed(2)}  ·  spin survives`, cxx, py + 150);
    }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [obs.Js, obs.Jn, obs.chiV, obs.zptap, obs.ports, obs.netQ, obs.spinFlow, obs.torqueSign]);

  // ==== Setters with logging ====
  const setBiasL = (v: number) => { setBias(v); pushLog("BIAS", `bias = ${v.toFixed(2)}`, C.gold); };
  const setSgapL = (v: number) => { setSgap(v); pushLog("GAP", `Δₛ = ${v.toFixed(2)}`, C.gold); };
  const setScatterL = (v: number) => { setScatter(v); pushLog("γ", `scattering = ${v.toFixed(2)}`, C.rose); };
  const setQwindL = (v: number) => { setQwind(Math.round(v)); pushLog("Q", `winding = ${Math.round(v)}`, C.cyan); };
  const setMtxtL = (v: number) => { setMtxt(v); pushLog("TXT", `texture = ${v.toFixed(2)}`, C.cyan); };
  const setGateL = (v: number) => { setGateThresh(v); pushLog("GATE", `χᵥ scale = ${v.toFixed(2)}`, C.violet); };
  const setNposL = (v: number) => { setNpos(v); pushLog("n+", `population = ${v.toFixed(2)}`, C.green); };
  const setNnegL = (v: number) => { setNneg(v); pushLog("n−", `population = ${v.toFixed(2)}`, C.green); };

  function flipUltra() {
    setUltraUp(u => !u);
    pushLog("FLIP", ultraUp ? "ultra ↓ · ports CLOSED" : "ultra ↑ · ports OPEN", C.violet);
  }
  function balanceCharge() {
    const avg = (nPos + nNeg) / 2;
    setNpos(avg); setNneg(avg);
    pushLog("BAL", `n+ = n− = ${avg.toFixed(2)} · net Q = 0`, C.green);
  }

  // ==== INIT log ====
  useEffect(() => {
    pushLog("INIT", "spin-vacuum workbench online", C.gold);
    pushLog("READY", "tap into ↻∞ · ⌽ · ⏚ · ±", C.cyan);
  }, []);

  return (
    <div className="min-h-screen p-6" style={{ background: C.bg, color: C.text, fontFamily: "ui-sans-serif, system-ui" }}>
      <header className="mb-6">
        <div className="text-[10px] tracking-[0.4em] uppercase" style={{ color: C.muted }}>
          AETHER · SPIN-VACUUM HARDWARE · {new Date().toLocaleString("en-US", { month: "long", year: "numeric" }).toUpperCase()}
        </div>
        <h1 className="text-4xl mt-2" style={{ fontFamily: "Cinzel, ui-serif, Georgia, serif", color: C.white, letterSpacing: "0.04em" }}>
          Lossless Spin · Vacuum Gates
        </h1>
        <p className="text-sm mt-2 max-w-3xl" style={{ color: C.text }}>
          Persistent (lossless) spin currents · invisible spin texture that flips torque · vacuum ports
          opened and closed by a single ultra-magnet flip · charge stays neutral while spin keeps flowing.
        </p>
      </header>

      {/* Tab strip */}
      <div className="flex gap-2 mb-5" data-testid="sv-tabs">
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
        {/* MAIN PANEL */}
        <div>
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="flex justify-between items-center px-4 py-2 border-b" style={{ borderColor: C.border }}>
              <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: TABS.find(t => t.key === tab)!.col }}>
                <span className="mr-2">●</span>{TABS.find(t => t.key === tab)!.label} · LIVE RENDER
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                ops: <span style={{ color: C.gold }}>{ops}</span> · coherence: <span style={{ color: C.green }}>{(coh * 100).toFixed(0)}%</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="sv-canvas" style={{ width: "100%", height: 460, display: "block" }} />
          </div>

          {/* CONTROL PANEL */}
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "persistent" && (
                <>
                  <Title col={C.gold}>Persistent Spin · Lossless Channel</Title>
                  <Body>
                    A topologically protected spin gap Δₛ &gt; 0 puts the carriers into an edge mode where
                    backscattering is forbidden. The spin current Jₛ then equals bias × σₛ and stays
                    constant in time — even with a finite ordinary scattering rate γ that wipes out
                    the trivial channel Jₙ ∝ 1/(1 + γ²).
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="bias"    label="bias V"        value={bias}    min={0} max={1.0} step={0.01} col={C.gold}  fmt={v => v.toFixed(2)} onChange={setBiasL} />
                    <Slider id="sgap"    label="spin gap Δₛ"   value={sgap}    min={0} max={1.0} step={0.01} col={C.gold}  fmt={v => v.toFixed(2)} onChange={setSgapL} />
                    <Slider id="scatter" label="scattering γ"   value={scatter} min={0} max={1.0} step={0.01} col={C.rose}  fmt={v => v.toFixed(2)} onChange={setScatterL} />
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Stat k="Jₛ (lossless)" v={obs.Js.toFixed(2)} c={obs.persistent ? C.gold : C.muted} />
                    <Stat k="Jₙ (decays)"   v={obs.Jn.toFixed(2)} c={C.cyan} />
                    <Stat k="τ_persist"     v={obs.persistent ? "∞" : (1 / Math.max(0.05, scatter)).toFixed(1)} c={obs.persistent ? C.green : C.rose} />
                  </div>
                </>
              )}

              {tab === "texture" && (
                <>
                  <Title col={C.cyan}>Invisible Spin Texture · Torque Flip</Title>
                  <Body>
                    Spins curl across the lattice with winding number Q, so the local texture density
                    |∇m|² ∝ Q² is enormous, but the volume-average ⟨M⟩ is essentially zero — the
                    magnetisation looks invisible from the outside while internally the texture is rich.
                    Crossing Q = 2 inverts the spin-transfer torque sign (skyrmion → antiskyrmion regime).
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <Slider id="qwind" label="winding Q"      value={qwind} min={1} max={3} step={1}    col={C.cyan} fmt={v => v.toFixed(0)} onChange={setQwindL} />
                    <Slider id="mtxt"  label="texture amp"    value={mtxt}  min={0} max={1.0} step={0.01} col={C.cyan} fmt={v => v.toFixed(2)} onChange={setMtxtL} />
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Stat k="⟨M⟩"           v={obs.Mz.toFixed(3)}                             c={C.muted} />
                    <Stat k="|∇m|² (Q²)"    v={obs.gradM.toFixed(2)}                          c={C.cyan} />
                    <Stat k="τ_spin sign"   v={obs.torqueSign > 0 ? "+ (Q<2)" : "− (Q≥2)"}    c={obs.torqueSign > 0 ? C.green : C.rose} />
                  </div>
                </>
              )}

              {tab === "gates" && (
                <>
                  <Title col={C.violet}>Vacuum Ports · Ultra-Magnet Flip</Title>
                  <Body>
                    The ultra-magnet sits at the centre of four vacuum ports. When the magnetisation
                    is up, the ports are open and the device couples to zero-point modes
                    (Aharonov-Bohm phase, Casimir flux, Pais-style coupling). One toggle of the ultra
                    state and every port closes — the on/off is gated entirely by the ultra direction,
                    not by adding energy.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <Slider id="gate"  label="port amplitude" value={gateThresh} min={0} max={1.0} step={0.01} col={C.violet} fmt={v => v.toFixed(2)} onChange={setGateL} />
                    <button onClick={flipUltra} data-testid="btn-flip"
                      aria-pressed={ultraUp}
                      aria-label="Flip ultra-magnet to toggle vacuum ports"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-end"
                      style={{ borderColor: C.border2, color: ultraUp ? C.green : C.rose }}>
                      flip ultra · ports {ultraUp ? "open" : "closed"}
                    </button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Stat k="state"     v={ultraUp ? "ULTRA ↑ · OPEN" : "ULTRA ↓ · CLOSED"}  c={ultraUp ? C.green : C.rose} />
                    <Stat k="χᵥ"        v={obs.chiV.toFixed(2)}                              c={C.violet} />
                    <Stat k="ports"     v={`${obs.ports}/4`}                                  c={obs.ports > 0 ? C.green : C.muted} />
                  </div>
                </>
              )}

              {tab === "charge" && (
                <>
                  <Title col={C.green}>± Population Balance · Net-Neutral Spin Flow</Title>
                  <Body>
                    Equal populations of positive and negative carriers move in opposite directions, so
                    the charge current J_charge = e(n₊v₊ − n₋v₋) cancels to zero. The spin current
                    J_spin ∝ (n₊ + n₋), which is the sum, so it survives the cancellation —
                    spin keeps flowing through a charge-neutral channel.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="npos" label="n+ population" value={nPos} min={0.1} max={2.0} step={0.01} col={C.green} fmt={v => v.toFixed(2)} onChange={setNposL} />
                    <Slider id="nneg" label="n− population" value={nNeg} min={0.1} max={2.0} step={0.01} col={C.rose}  fmt={v => v.toFixed(2)} onChange={setNnegL} />
                    <button onClick={balanceCharge} data-testid="btn-balance"
                      aria-pressed={Math.abs(nPos - nNeg) < 0.01}
                      aria-label="Balance positive and negative populations"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-end"
                      style={{ borderColor: C.border2, color: C.green }}>balance ±</button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Stat k="net Q"     v={obs.netQ.toFixed(2)}                                              c={Math.abs(obs.netQ) < 0.05 ? C.green : C.rose} />
                    <Stat k="J_spin"    v={obs.spinFlow.toFixed(2)}                                          c={C.gold} />
                    <Stat k="J_charge"  v={Math.abs(obs.netQ) < 0.05 ? "≈ 0 · neutral" : "≠ 0 · imbalanced"} c={Math.abs(obs.netQ) < 0.05 ? C.green : C.rose} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* TAB EXPLAINERS */}
          <div className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>HOW THE FOUR FIT</div>
            <div className="grid gap-3 text-[12px]" style={{ gridTemplateColumns: "1fr 1fr" }}>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.gold }}>1 · Persistent</div>
                <div style={{ color: C.text }}>
                  Topological gap → backscattering is forbidden → spin current never decays. This is the
                  carrier the rest of the hardware uses.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.cyan }}>2 · Texture</div>
                <div style={{ color: C.text }}>
                  Built-in spin winding gives a huge |∇m|² with ⟨M⟩ ≈ 0. The torque sign is set by Q —
                  flipping past Q=2 reverses the spin-transfer direction without touching any voltage.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.violet }}>3 · Vacuum Gates</div>
                <div style={{ color: C.text }}>
                  One ultra flip toggles all four ports between OPEN (coupled to vacuum modes) and
                  CLOSED (decoupled). The energy comes from the zero-point bath, not from the bias.
                </div>
              </div>
              <div>
                <div className="text-[11px] mb-1" style={{ color: C.green }}>4 · Charge Balance</div>
                <div style={{ color: C.text }}>
                  Equal ± populations make the charge current cancel while the spin current adds.
                  The device looks electrically dead while pumping spin coherently.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TELEMETRY SIDEBAR */}
        <aside>
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              TELEMETRY
            </div>
            <div className="p-4 text-[11px] space-y-2">
              <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
              <Row k="Jₛ (persistent)"  v={obs.Js.toFixed(2)}                  c={obs.persistent ? C.gold : C.muted} />
              <Row k="Jₙ (ordinary)"    v={obs.Jn.toFixed(2)}                  c={C.cyan} />
              <Row k="texture |∇m|²"     v={obs.gradM.toFixed(2)}               c={C.cyan} />
              <Row k="τ_spin sign"      v={obs.torqueSign > 0 ? "+" : "−"}     c={obs.torqueSign > 0 ? C.green : C.rose} />
              <Row k="ultra state"      v={ultraUp ? "↑" : "↓"}                c={ultraUp ? C.green : C.rose} />
              <Row k="vacuum χᵥ"        v={obs.chiV.toFixed(2)}                c={C.violet} />
              <Row k="open ports"       v={`${obs.ports} / 4`}                  c={obs.ports > 0 ? C.green : C.muted} />
              <Row k="net Q"            v={obs.netQ.toFixed(2)}                c={Math.abs(obs.netQ) < 0.05 ? C.green : C.rose} />
              <Row k="ops"              v={String(ops)}                         c={C.gold} />
            </div>
          </div>

          {/* PHENOMENA bars */}
          <div className="border mt-5" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-[10px] tracking-[0.3em] uppercase" style={{ borderColor: C.border, color: C.muted }}>
              PHENOMENA
            </div>
            <div className="p-4 space-y-3">
              <Bar label="lossless Jₛ"          val={Math.min(1, obs.Js)}                  c={C.gold} />
              <Bar label="texture density Q²"   val={Math.min(1, obs.gradM / 9)}           c={C.cyan} />
              <Bar label="vacuum coupling χᵥ"   val={Math.min(1, obs.chiV)}                c={C.violet} />
              <Bar label="charge neutrality"    val={1 - Math.min(1, Math.abs(obs.netQ))}  c={C.green} />
              <Bar label="coherence"            val={coh}                                   c={C.gold} />
            </div>
          </div>

          {/* EVENT LOG */}
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

// ==== Helper components ====
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
function Bar({ label, val, c }: { label: string; val: number; c: string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color: C.muted }}>{label}</span>
        <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{val.toFixed(2)}</span>
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

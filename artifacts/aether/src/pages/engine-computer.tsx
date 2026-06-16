import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG     = "#04030a";
const PANEL  = "rgba(4,3,10,0.97)";
const BORDER = "#12101e";
const GOLD   = "#e8b030";
const CYAN   = "#30e0e8";
const VIOLET = "#9966ff";
const GREEN  = "#44ee88";
const ROSE   = "#ff5580";
const TEAL   = "#1fd4c8";
const AMBER  = "#ff9933";
const LIME   = "#aaee44";
const DIM    = "#2a2050";
const TEXT   = "#c0b8d8";
const MUTED  = "#332a50";
const BLUE   = "#4477ff";
const SKY    = "#66ccff";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

type CanvasTab = "otto" | "correction" | "landscape";

/* ── Engine stroke phases ── */
interface Stroke { name: string; sub: string; color: string; phase: string; compute: string; }
const STROKES: Stroke[] = [
  { name:"INTAKE",      sub:"Load state · fuel + air",       color:CYAN,   phase:"0–25%",  compute:"Read configuration q(t) from register · ingest input signal S(x,t) · set solver initial conditions" },
  { name:"COMPRESSION", sub:"Reduce entropy · densify info",  color:VIOLET, phase:"25–50%", compute:"Compress configuration space · accumulate coherence C(t) · form Jacobian J(q) = ∂F/∂q" },
  { name:"COMBUSTION",  sub:"Compute · transform · fire",     color:AMBER,  phase:"50–75%", compute:"Solve F(q)=0 via Newton-Raphson: q_{n+1} = qₙ − J⁻¹·F(qₙ) · burst event (quaternion threshold)" },
  { name:"EXHAUST",     sub:"Output · discard entropy · loop",color:GREEN,  phase:"75–100%",compute:"Emit corrected configuration q* · compute residual ε = ||F(q*)|| · feed q* back to intake · repeat" },
];

/* ── Configuration equations ── */
const CONFIG_EQS = [
  { label:"Otto efficiency",          eq:"η = 1 − 1/r^(γ−1)",              color:GOLD,   note:"r = compression ratio (typically 8–12 for gasoline). γ = C_p/C_v ≈ 1.4 for air-fuel. Higher r → higher η → more computation per cycle." },
  { label:"Newton-Raphson step",      eq:"q_{n+1} = qₙ − [J(qₙ)]⁻¹·F(qₙ)", color:CYAN,  note:"J = Jacobian matrix of partial derivatives. F = configuration residual vector. Each combustion stroke fires one Newton step." },
  { label:"Equilibrium condition",    eq:"∂E/∂qᵢ = 0  ∀i",                 color:VIOLET, note:"Configuration energy E(q) is minimised when all partial derivatives vanish — a fixed point of the engine computation." },
  { label:"Convergence rate",         eq:"||qₙ₊₁ − q*|| ≤ C||qₙ − q*||²", color:GREEN,  note:"Newton-Raphson has quadratic convergence near a simple root — error squares each iteration. Fast self-correction." },
  { label:"Gibbs free energy",        eq:"ΔG = ΔH − TΔS = 0",              color:TEAL,   note:"Equilibrium also defined thermodynamically: minimum Gibbs energy. Connects combustion thermodynamics to configuration stability." },
  { label:"Correction residual",      eq:"εₙ = ||F(qₙ)|| → 0",             color:AMBER,  note:"The scalar residual measures how far the configuration is from equilibrium. Self-correction stops when ε < threshold (≈φ⁻¹)." },
  { label:"Coherence update",         eq:"∂C/∂t = αS − βD",                color:ROSE,   note:"The engine combustion step is the αS synchronisation term. Exhaust removes βD decoherence. C→C* when balanced." },
  { label:"Adiabatic compression",    eq:"TV^(γ−1) = const",                color:LIME,   note:"During compression stroke: temperature rises without heat exchange. Analogous to internal (closed-system) coherence accumulation." },
];

/* ── Self-correction algorithm steps ── */
const ALGO_STEPS = [
  { n:"01", label:"Initialise",    code:"q₀ = q_init  ;  ε₀ = ‖F(q₀)‖",       color:CYAN   },
  { n:"02", label:"Evaluate",     code:"F(qₙ) = configuration residual",        color:VIOLET },
  { n:"03", label:"Jacobian",     code:"J(qₙ) = ∂F/∂q  (computed at qₙ)",      color:GOLD   },
  { n:"04", label:"Solve",        code:"Δq = −J⁻¹·F(qₙ)  (combustion step)",   color:AMBER  },
  { n:"05", label:"Update",       code:"q_{n+1} = qₙ + Δq",                     color:GREEN  },
  { n:"06", label:"Residual",     code:"εₙ₊₁ = ‖F(q_{n+1})‖",                  color:TEAL   },
  { n:"07", label:"Check",        code:"if εₙ₊₁ < φ⁻¹ → EQUILIBRIUM",          color:ROSE   },
  { n:"08", label:"Recurse",      code:"else → INTAKE(q_{n+1})  [next cycle]",  color:LIME   },
];

/* ── AETHER engine stack ── */
const AETHER_MAP = [
  { sym:"FUEL",     label:"Input Signal  S(x,t)",   color:AMBER,  note:"The synchronisation energy driving the engine — new data, sensory input, or field coupling" },
  { sym:"INTAKE",   label:"Load State q(t)",         color:CYAN,   note:"Register read: current configuration loaded into working memory at cycle start" },
  { sym:"COMPRESS", label:"Coherence C(t) ↑",        color:VIOLET, note:"αS term in ∂C/∂t — compression accumulates coherence, tightens configuration space" },
  { sym:"COMBUST",  label:"Newton Step Δq",           color:GOLD,   note:"The computation: J⁻¹F fires — the burst event. Config updated toward equilibrium" },
  { sym:"EXHAUST",  label:"Decoherence βD removed",  color:GREEN,  note:"Output residual ε, discard entropy, feed corrected q back to intake — the recursion" },
  { sym:"C* = φ⁻¹", label:"Equilibrium Attractor",   color:ROSE,   note:"Convergence when ε < φ⁻¹ ≈ 0.618 — the golden threshold, same as all AETHER systems" },
];

/* ══════════════════════════════════════════
   OTTO CYCLE P-V CANVAS
   Animated pressure-volume diagram
   with four computational phase labels
══════════════════════════════════════════ */
function OttoCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(); window.addEventListener("resize", resize);

    // P-V Otto cycle parametric
    // V in [1, r], P follows adiabat and isochoric legs
    const gamma = 1.4, r_comp = 9.5;
    // Points of cycle (normalized):
    // 1: (V=r, P=1) BDC (bottom dead center) — end of exhaust/start intake
    // 2: (V=1, P=r^γ) TDC after adiabatic compression
    // 3: (V=1, P=r^γ * Q/Cv * T2) after heat addition (combustion)
    // 4: (V=r, P=...) after adiabatic expansion

    const P1 = 1.0, V1 = r_comp;
    const P2 = P1 * Math.pow(r_comp, gamma); // adiabatic compression
    const Q_ratio = 4.5; // heat ratio
    const P3 = P2 * Q_ratio; // combustion heat addition
    const P4 = P3 / Math.pow(r_comp, gamma); // adiabatic expansion
    const V3 = 1.0, V2 = 1.0, V4 = r_comp;

    // Normalise for canvas
    const Vmax = V1 + 0.4, Pmax = P3 * 1.1;

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.0055;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      const padL = 52, padR = 20, padT = 16, padB = 40;
      const pW = W-padL-padR, pH = H-padT-padB;
      const ox = padL, oy = padT+pH;

      // Helper: convert V,P to canvas coords
      const vx = (V: number) => ox + ((V-1)/(Vmax-1))*pW;
      const py = (P: number) => oy - (P/Pmax)*pH;

      // Grid
      for (let g=0; g<=4; g++) {
        ctx!.strokeStyle = DIM+"25"; ctx!.lineWidth=0.5;
        ctx!.beginPath(); ctx!.moveTo(ox+(g/4)*pW,padT); ctx!.lineTo(ox+(g/4)*pW,oy); ctx!.stroke();
      }
      for (let g=0; g<=4; g++) {
        ctx!.beginPath(); ctx!.moveTo(ox,padT+(g/4)*pH); ctx!.lineTo(ox+pW,padT+(g/4)*pH); ctx!.stroke();
      }

      // Axes
      ctx!.strokeStyle = DIM+"cc"; ctx!.lineWidth=1.5;
      ctx!.beginPath(); ctx!.moveTo(ox,padT-4); ctx!.lineTo(ox,oy+4); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(ox-4,oy); ctx!.lineTo(ox+pW+4,oy); ctx!.stroke();
      ctx!.font = `7px ${mono}`; ctx!.textAlign="right"; ctx!.fillStyle=TEXT+"60";
      ctx!.fillText("P →", ox+8, padT+6);
      ctx!.fillText("PRESSURE", ox-4, padT+16);
      ctx!.textAlign="center"; ctx!.fillText("VOLUME  V →", ox+pW/2, oy+30);

      // ── OTTO CYCLE SEGMENTS ──
      // Segment 1-2: Adiabatic compression (right→left, bottom→top)
      ctx!.beginPath();
      for (let i=0; i<=50; i++) {
        const frac = i/50;
        const V = V1 - frac*(V1-V2);
        const P = P1 * Math.pow(V1/V, gamma);
        if (i===0) ctx!.moveTo(vx(V), py(P)); else ctx!.lineTo(vx(V), py(P));
      }
      ctx!.strokeStyle = VIOLET+"cc"; ctx!.lineWidth=2; ctx!.stroke();

      // Segment 2-3: Isochoric heat addition (combustion) — vertical up at V=1
      ctx!.beginPath(); ctx!.moveTo(vx(V2),py(P2)); ctx!.lineTo(vx(V3),py(P3));
      ctx!.strokeStyle = AMBER+"cc"; ctx!.lineWidth=2.5; ctx!.stroke();

      // Segment 3-4: Adiabatic expansion (left→right, top→bottom)
      ctx!.beginPath();
      for (let i=0; i<=50; i++) {
        const frac = i/50;
        const V = V3 + frac*(V4-V3);
        const P = P3 * Math.pow(V3/V, gamma);
        if (i===0) ctx!.moveTo(vx(V), py(P)); else ctx!.lineTo(vx(V), py(P));
      }
      ctx!.strokeStyle = GREEN+"cc"; ctx!.lineWidth=2; ctx!.stroke();

      // Segment 4-1: Isochoric heat rejection — vertical down at V=r
      ctx!.beginPath(); ctx!.moveTo(vx(V4),py(P4)); ctx!.lineTo(vx(V1),py(P1));
      ctx!.strokeStyle = CYAN+"cc"; ctx!.lineWidth=2; ctx!.stroke();

      // ── Segment labels ──
      ctx!.font=`7px ${mono}`;
      ctx!.fillStyle=VIOLET+"cc"; ctx!.textAlign="right";
      ctx!.fillText("2 COMPRESS", vx(V2)-6, py(P2+P3*0.4));
      ctx!.fillStyle=AMBER+"cc"; ctx!.textAlign="left";
      ctx!.fillText("3 COMBUST", vx(V3)+4, py((P2+P3)/2));
      ctx!.fillStyle=GREEN+"cc"; ctx!.textAlign="left";
      ctx!.fillText("4 EXHAUST", vx(V4*0.35+V3*0.65)+6, py(P4+P3*0.25));
      ctx!.fillStyle=CYAN+"cc"; ctx!.textAlign="right";
      ctx!.fillText("1 INTAKE", vx(V4)-4, py((P1+P4)/2));

      // ── Animated cursor ──
      const cycleT = (T * 0.35) % 1;
      let curV: number, curP: number, curPhase: string, curColor: string;
      if (cycleT < 0.25) {
        // Compression 1→2
        const f = cycleT/0.25;
        const V = V1 - f*(V1-V2);
        curV = V; curP = P1 * Math.pow(V1/V, gamma);
        curPhase = "COMPRESSION · Coherence ↑"; curColor = VIOLET;
      } else if (cycleT < 0.40) {
        // Combustion 2→3
        const f = (cycleT-0.25)/0.15;
        curV = V2; curP = P2 + f*(P3-P2);
        curPhase = "COMBUSTION · Newton step fires"; curColor = AMBER;
      } else if (cycleT < 0.75) {
        // Expansion 3→4
        const f = (cycleT-0.40)/0.35;
        const V = V3 + f*(V4-V3);
        curV = V; curP = P3 * Math.pow(V3/V, gamma);
        curPhase = "EXHAUST · Output q* · residual ε"; curColor = GREEN;
      } else {
        // Intake 4→1
        const f = (cycleT-0.75)/0.25;
        curV = V4; curP = P4 + f*(P1-P4);
        curPhase = "INTAKE · Load q(t) · fuel"; curColor = CYAN;
      }
      const cx_ = vx(curV), cy_ = py(curP);
      ctx!.beginPath(); ctx!.arc(cx_, cy_, 7, 0, Math.PI*2);
      ctx!.fillStyle = curColor + "35"; ctx!.fill();
      ctx!.beginPath(); ctx!.arc(cx_, cy_, 3.5, 0, Math.PI*2);
      ctx!.fillStyle = curColor; ctx!.fill();

      // Phase label
      ctx!.font=`8px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle = curColor+"cc";
      ctx!.fillText(curPhase, ox+pW/2, H-12);

      // ── Efficiency display ──
      const eta = 1 - 1/Math.pow(r_comp, gamma-1);
      ctx!.font=`7px ${mono}`; ctx!.textAlign="right"; ctx!.fillStyle=GOLD+"cc";
      ctx!.fillText(`η = ${(eta*100).toFixed(1)}%  r=${r_comp}  γ=${gamma}`, ox+pW, padT+7);

      // ── Fill cycle area with work output ──
      ctx!.beginPath();
      // Clockwise: 1→2 compression, 2→3 combust, 3→4 expand, 4→1 reject
      for (let i=50; i>=0; i--) { // 1→2 compression
        const frac = i/50;
        const V = V1 - frac*(V1-V2);
        const P = P1 * Math.pow(V1/V, gamma);
        if (i===50) ctx!.moveTo(vx(V), py(P)); else ctx!.lineTo(vx(V), py(P));
      }
      for (let i=0; i<=50; i++) { // 3→4 expansion
        const frac = i/50;
        const V = V3 + frac*(V4-V3);
        const P = P3 * Math.pow(V3/V, gamma);
        ctx!.lineTo(vx(V), py(P));
      }
      ctx!.closePath();
      ctx!.fillStyle = AMBER + "10"; ctx!.fill();

      // W_net label in cycle area
      ctx!.font=`8px ${serif}`; ctx!.textAlign="center"; ctx!.fillStyle=AMBER+"50";
      ctx!.fillText("W_net", vx(V1*0.45+V3*0.55), py(P1+P3*0.18));
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:260 }} />;
}

/* ══════════════════════════════════════════
   RECURSIVE CORRECTION CANVAS
   Newton-Raphson convergence plot
   x_n → x* with error decay curve
══════════════════════════════════════════ */
function CorrectionCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.014;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      const padL = 52, padR = 20, padT = 16, padB = 40;
      const pW = W-padL-padR, pH = H-padT-padB;
      const ox = padL, oy = padT+pH;

      const N = 10; // iterations
      const x_star = 0.0; // equilibrium
      // Simulate quadratic convergence from x_0 = 2.5
      const errors: number[] = [2.5];
      for (let i=1; i<=N; i++) {
        const e = Math.pow(errors[i-1], 2) * 0.35; // quadratic convergence
        errors.push(Math.max(e, 0.001));
      }
      const errMax = errors[0];

      // Active iteration: animated, shows 1..n with n growing
      const animN = Math.min(N, Math.floor((T*0.7) % (N+2)));

      // Grid
      for (let g=0; g<=N; g++) {
        ctx!.strokeStyle = DIM+"20"; ctx!.lineWidth=0.5;
        ctx!.beginPath(); ctx!.moveTo(ox+(g/N)*pW, padT); ctx!.lineTo(ox+(g/N)*pW, oy); ctx!.stroke();
      }
      for (let g=0; g<=4; g++) {
        ctx!.beginPath(); ctx!.moveTo(ox, padT+(g/4)*pH); ctx!.lineTo(ox+pW, padT+(g/4)*pH); ctx!.stroke();
      }

      // Axes
      ctx!.strokeStyle = DIM+"cc"; ctx!.lineWidth=1.5;
      ctx!.beginPath(); ctx!.moveTo(ox, padT-4); ctx!.lineTo(ox, oy+4); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(ox-4, oy); ctx!.lineTo(ox+pW+4, oy); ctx!.stroke();
      ctx!.font=`7px ${mono}`; ctx!.textAlign="right"; ctx!.fillStyle=TEXT+"60";
      ctx!.fillText("ε = ‖F(qₙ)‖", ox-4, padT+8);
      ctx!.textAlign="center"; ctx!.fillText("iteration  n  →", ox+pW/2, oy+30);

      // Equilibrium threshold line (φ⁻¹)
      const phi_inv = 0.618;
      const threshY = oy - (phi_inv/errMax)*pH;
      ctx!.beginPath(); ctx!.moveTo(ox, threshY); ctx!.lineTo(ox+pW, threshY);
      ctx!.strokeStyle = ROSE+"55"; ctx!.lineWidth=1; ctx!.setLineDash([4,6]); ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=ROSE+"88";
      ctx!.fillText("ε* = φ⁻¹ ≈ 0.618  [equilibrium threshold]", ox+4, threshY-4);

      // Error curve (full, dim)
      ctx!.beginPath();
      for (let i=0; i<=N; i++) {
        const ex = ox+(i/N)*pW;
        const ey = oy - (errors[i]/errMax)*pH;
        if (i===0) ctx!.moveTo(ex, ey); else ctx!.lineTo(ex, ey);
      }
      ctx!.strokeStyle = CYAN+"25"; ctx!.lineWidth=1.5; ctx!.stroke();

      // Active portion (bright, animated up to animN)
      if (animN > 0) {
        ctx!.beginPath();
        for (let i=0; i<=animN && i<=N; i++) {
          const ex = ox+(i/N)*pW;
          const ey = oy - (errors[i]/errMax)*pH;
          if (i===0) ctx!.moveTo(ex, ey); else ctx!.lineTo(ex, ey);
        }
        ctx!.strokeStyle = CYAN+"cc"; ctx!.lineWidth=2.5; ctx!.stroke();
      }

      // Iteration dots
      for (let i=0; i<=N; i++) {
        const ex = ox+(i/N)*pW;
        const ey = oy - (errors[i]/errMax)*pH;
        const active = i === animN;
        const past   = i < animN;
        if (!past && !active) { continue; }
        ctx!.beginPath(); ctx!.arc(ex, ey, active?6:3.5, 0, Math.PI*2);
        ctx!.fillStyle = (active?GOLD:CYAN) + (active?"cc":"60"); ctx!.fill();
        if (active || i <= 4) {
          ctx!.font=`6px ${mono}`; ctx!.textAlign="center";
          ctx!.fillStyle = active?GOLD+"cc":CYAN+"60";
          ctx!.fillText(`n=${i}`, ex, ey-9);
          ctx!.fillText(`ε=${errors[i].toFixed(3)}`, ex, ey-18);
        }

        // Drop lines to axis
        ctx!.beginPath(); ctx!.moveTo(ex, ey); ctx!.lineTo(ex, oy);
        ctx!.strokeStyle = (past?CYAN:GOLD)+"20"; ctx!.lineWidth=0.8; ctx!.stroke();
      }

      // x_n → x* convergence track (separate sub-panel, bottom half)
      // Show how q values converge
      const trackY = padT + pH*0.58, trackH = pH*0.30;
      ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=VIOLET+"70";
      ctx!.fillText("configuration q:", ox, trackY-5);
      // Track line
      ctx!.beginPath(); ctx!.moveTo(ox, trackY+trackH/2); ctx!.lineTo(ox+pW, trackY+trackH/2);
      ctx!.strokeStyle=DIM+"40"; ctx!.lineWidth=1; ctx!.stroke();
      // q* marker
      const q_star_x = ox + pW * 0.85;
      ctx!.beginPath(); ctx!.moveTo(q_star_x, trackY); ctx!.lineTo(q_star_x, trackY+trackH);
      ctx!.strokeStyle=GREEN+"50"; ctx!.lineWidth=1; ctx!.setLineDash([3,4]); ctx!.stroke();
      ctx!.setLineDash([]);
      ctx!.font=`6px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=GREEN+"80";
      ctx!.fillText("q*", q_star_x, trackY-3);

      // q_n markers converging to q*
      for (let i=0; i<=Math.min(animN,N); i++) {
        const fracErr = errors[i]/errMax;
        const qx = ox + pW * (0.85 - fracErr * 0.65);
        const active = i===animN;
        ctx!.beginPath(); ctx!.arc(qx, trackY+trackH/2, active?5:3, 0, Math.PI*2);
        ctx!.fillStyle = (active?GOLD:VIOLET) + (active?"cc":"55"); ctx!.fill();
        if (active || i===0) {
          ctx!.font=`6px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=(active?GOLD:VIOLET)+"88";
          ctx!.fillText(`q${i}`, qx, trackY+trackH+10);
        }
      }

      // Phase annotation
      const convergY = oy - (errors[animN]/errMax)*pH;
      ctx!.font=`7px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=GOLD+"cc";
      if (animN <= N)
        ctx!.fillText(`Cycle ${animN} · ε=${errors[animN<errors.length?animN:N].toFixed(4)} · ${animN===0?"Initial state":errors[animN]<phi_inv?"EQUILIBRIUM REACHED · ε < φ⁻¹":"Correcting…"}`, ox+pW/2, H-10);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:260 }} />;
}

/* ══════════════════════════════════════════
   ENERGY LANDSCAPE CANVAS
   2D configuration energy surface
   with gradient descent to equilibrium
══════════════════════════════════════════ */
function LandscapeCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(); window.addEventListener("resize", resize);

    // Pre-compute gradient lookup table for performance
    function E(qx: number, qy: number): number {
      // Multi-well energy landscape with one global minimum
      return (
        0.4 * Math.pow(qx - 0.3, 2) +
        0.5 * Math.pow(qy - 0.55, 2) +
        0.15 * Math.sin(qx * 6 + 1) * Math.sin(qy * 5 + 0.5) +
        0.12 * Math.exp(-10 * ((qx-0.7)**2 + (qy-0.2)**2)) +
        0.10 * Math.exp(-15 * ((qx-0.15)**2 + (qy-0.75)**2))
      );
    }

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.013;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H);

      const ROWS = 50, COLS = 70;
      const cellW = W / COLS, cellH = H / ROWS;

      // Energy surface (colour field)
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const qx = col / COLS, qy = row / ROWS;
          const e = E(qx, qy);
          const norm = Math.min(1, e / 0.7);
          // Colour map: deep blue (low E) → violet → gold (high E)
          const r_ = Math.floor(norm < 0.5 ? norm*2*80 : 80 + (norm-0.5)*2*180);
          const g_ = Math.floor(norm < 0.5 ? norm*2*20 : 20 + (norm-0.5)*2*60);
          const b_ = Math.floor(norm < 0.5 ? 120 + norm*2*100 : 220 - (norm-0.5)*2*180);
          ctx!.fillStyle = `rgba(${r_},${g_},${b_},0.85)`;
          ctx!.fillRect(col*cellW, row*cellH, cellW+0.5, cellH+0.5);
        }
      }

      // ── Gradient arrows (sparse grid) ──
      const ARROW_ROWS = 10, ARROW_COLS = 14;
      const h = 0.02; // finite difference step
      for (let ar = 0; ar < ARROW_ROWS; ar++) {
        for (let ac = 0; ac < ARROW_COLS; ac++) {
          const qx = (ac + 0.5) / ARROW_COLS;
          const qy = (ar + 0.5) / ARROW_ROWS;
          const dEdx = (E(qx+h, qy) - E(qx-h, qy)) / (2*h);
          const dEdy = (E(qx, qy+h) - E(qx, qy-h)) / (2*h);
          const len = Math.sqrt(dEdx*dEdx + dEdy*dEdy);
          if (len < 0.001) continue;
          const nx = -dEdx/len, ny = -dEdy/len; // negative gradient (descent direction)
          const ax = qx*W, ay = qy*H;
          const arrowLen = Math.min(12, len*18);
          ctx!.beginPath();
          ctx!.moveTo(ax, ay);
          ctx!.lineTo(ax + nx*arrowLen, ay + ny*arrowLen);
          ctx!.strokeStyle = "rgba(255,255,255,0.22)"; ctx!.lineWidth=0.8; ctx!.stroke();
          // Arrowhead
          const perpX = -ny, perpY = nx;
          ctx!.beginPath();
          ctx!.moveTo(ax+nx*arrowLen, ay+ny*arrowLen);
          ctx!.lineTo(ax+nx*(arrowLen-3)+perpX*2, ay+ny*(arrowLen-3)+perpY*2);
          ctx!.lineTo(ax+nx*(arrowLen-3)-perpX*2, ay+ny*(arrowLen-3)-perpY*2);
          ctx!.closePath(); ctx!.fillStyle="rgba(255,255,255,0.22)"; ctx!.fill();
        }
      }

      // ── Animated gradient descent trajectory ──
      // Starts from q0 = (0.8, 0.15) and converges to minimum ~(0.3, 0.55)
      const trajLen = 60;
      const trajPoints: {x:number,y:number}[] = [];
      let qx = 0.78, qy = 0.12;
      for (let i=0; i<trajLen; i++) {
        trajPoints.push({x:qx*W, y:qy*H});
        const dEx = (E(qx+h, qy) - E(qx-h, qy)) / (2*h);
        const dEy = (E(qx, qy+h) - E(qx, qy-h)) / (2*h);
        const lr = 0.04;
        qx = Math.max(0.02, Math.min(0.98, qx - lr*dEx));
        qy = Math.max(0.02, Math.min(0.98, qy - lr*dEy));
      }

      // Draw trajectory
      const animStep = Math.floor((T * 0.5) % trajLen);
      ctx!.beginPath();
      for (let i=0; i<Math.min(animStep+1, trajLen); i++) {
        if (i===0) ctx!.moveTo(trajPoints[i].x, trajPoints[i].y);
        else ctx!.lineTo(trajPoints[i].x, trajPoints[i].y);
      }
      const trajGrad = ctx!.createLinearGradient(trajPoints[0].x, trajPoints[0].y,
        trajPoints[Math.min(animStep,trajLen-1)].x, trajPoints[Math.min(animStep,trajLen-1)].y);
      trajGrad.addColorStop(0, AMBER+"aa");
      trajGrad.addColorStop(0.6, VIOLET+"aa");
      trajGrad.addColorStop(1, GREEN+"cc");
      ctx!.strokeStyle = trajGrad; ctx!.lineWidth=2.5; ctx!.stroke();

      // Current position dot
      if (animStep < trajLen) {
        const cp = trajPoints[animStep];
        ctx!.beginPath(); ctx!.arc(cp.x, cp.y, 8, 0, Math.PI*2);
        ctx!.fillStyle = GOLD+"35"; ctx!.fill();
        ctx!.beginPath(); ctx!.arc(cp.x, cp.y, 4, 0, Math.PI*2);
        ctx!.fillStyle = GOLD; ctx!.fill();
        const curE = E(cp.x/W, cp.y/H);
        ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=GOLD+"cc";
        ctx!.fillText(`q=(${(cp.x/W).toFixed(2)},${(cp.y/H).toFixed(2)})`, cp.x+8, cp.y-6);
        ctx!.fillText(`E=${curE.toFixed(3)}`, cp.x+8, cp.y+4);
      }

      // Equilibrium minimum marker (approx)
      const eqX = 0.3*W, eqY = 0.52*H;
      ctx!.beginPath(); ctx!.arc(eqX, eqY, 10, 0, Math.PI*2);
      ctx!.strokeStyle = GREEN+"80"; ctx!.lineWidth=1.5; ctx!.stroke();
      ctx!.beginPath(); ctx!.arc(eqX, eqY, 4, 0, Math.PI*2);
      ctx!.fillStyle = GREEN; ctx!.fill();
      ctx!.font=`7px ${serif}`; ctx!.textAlign="center"; ctx!.fillStyle=GREEN+"cc";
      ctx!.fillText("q*", eqX, eqY-14);
      ctx!.font=`6px ${mono}`; ctx!.fillStyle=GREEN+"80";
      ctx!.fillText("∂E/∂q=0", eqX, eqY-6);

      // Start marker
      ctx!.beginPath(); ctx!.arc(trajPoints[0].x, trajPoints[0].y, 5, 0, Math.PI*2);
      ctx!.fillStyle = AMBER+"cc"; ctx!.fill();
      ctx!.font=`6px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=AMBER+"cc";
      ctx!.fillText("q₀", trajPoints[0].x, trajPoints[0].y-8);

      // Legend
      ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=TEXT+"60";
      ctx!.fillText("ENERGY LANDSCAPE  E(q)", 8, 14);
      ctx!.fillStyle=BLUE+"60"; ctx!.fillText("■ LOW  E", 8, H-24);
      ctx!.fillStyle=GOLD+"80"; ctx!.fillText("■ HIGH  E", 60, H-24);
      ctx!.fillStyle=TEXT+"50"; ctx!.fillText("↓ GRADIENT DESCENT →  q*", 8, H-12);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:260 }} />;
}

/* ══════════ MAIN PAGE ══════════ */
export default function EngineComputerPage() {
  const [tab, setTab] = useState<CanvasTab>("otto");
  const [activeStroke, setActiveStroke] = useState(0);
  const [activeAlgo, setActiveAlgo] = useState(-1);

  const panelBox: React.CSSProperties = {
    background:PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px", marginBottom:10, position:"relative",
  };
  const topLine = (c = GOLD) => (
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
      background:`linear-gradient(90deg,${c},transparent)`,opacity:0.4 }} />
  );
  const SH = ({ label, color=GOLD }:{label:string;color?:string}) => (
    <div style={{ fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",
      color,marginBottom:6,borderBottom:`1px solid ${BORDER}`,paddingBottom:3 }}>
      {label}
    </div>
  );

  const tabs: [CanvasTab,string,string][] = [
    ["otto",       "OTTO CYCLE · P-V",      AMBER ],
    ["correction", "RECURSIVE CORRECTION",   CYAN  ],
    ["landscape",  "ENERGY LANDSCAPE",       GREEN ],
  ];

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>

      {/* ── HEADER ── */}
      <div style={{ padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(4,3,12,0.98)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${AMBER},${VIOLET},${GREEN},transparent)`,
          opacity:0.45 }} />
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:7, letterSpacing:"0.2em", color:AMBER, marginBottom:3 }}>
              AETHER · THERMODYNAMIC COMPUTATION · OTTO CYCLE · NEWTON-RAPHSON · GIBBS EQUILIBRIUM
            </div>
            <div style={{ fontFamily:serif, fontSize:20, letterSpacing:2, color:"#fff" }}>
              ENGINE COMPUTER
            </div>
            <div style={{ fontFamily:body, fontStyle:"italic", fontSize:11, color:MUTED, marginTop:2 }}>
              Combustion cycle as recursive computation · configuration equation equilibrium · self-correction to q*
            </div>
          </div>
          {/* Canvas tab selector */}
          <div style={{ display:"flex", gap:4 }}>
            {tabs.map(([id, label, c]) => (
              <button key={id} onClick={()=>setTab(id)} style={{
                padding:"6px 12px", fontFamily:mono, fontSize:8, letterSpacing:"0.1em",
                cursor:"pointer", borderRadius:2, transition:"all 0.15s",
                border:`1px solid ${tab===id ? c : BORDER}`,
                background: tab===id ? `${c}18` : "transparent",
                color: tab===id ? c : MUTED,
              }}>{label}</button>
            ))}
          </div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:MUTED,
            maxWidth:220, lineHeight:1.65 }}>
            Each combustion stroke fires one Newton-Raphson step. Cycles repeat until configuration residual ε falls below the golden threshold φ⁻¹ ≈ 0.618.
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"14px 20px 32px",
        display:"grid", gridTemplateColumns:"240px 1fr 270px", gap:12 }}>

        {/* ══ LEFT ══ */}
        <div>
          {/* Four strokes */}
          <div style={panelBox}>
            {topLine(AMBER)}
            <SH label="4-Stroke Computation Cycle" color={AMBER} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.65 }}>
              Each engine stroke maps to a computation phase. Four strokes = one complete recursive correction cycle.
            </div>
            {STROKES.map((s, i) => (
              <div key={s.name} onClick={()=>setActiveStroke(i)} style={{
                marginBottom:6, padding:"7px 9px", cursor:"pointer",
                background: activeStroke===i ? `${s.color}10` : "transparent",
                border:`1px solid ${activeStroke===i ? s.color : BORDER}`,
                borderRadius:2, transition:"all 0.15s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:s.color }}>{s.name}</div>
                  <div style={{ fontSize:7, color:MUTED }}>{s.phase}</div>
                </div>
                <div style={{ fontSize:8, color:MUTED, marginBottom:3, fontStyle:"italic" }}>{s.sub}</div>
                {activeStroke===i && (
                  <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.55, marginTop:4 }}>
                    {s.compute}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Configuration equations */}
          <div style={panelBox}>
            {topLine(CYAN)}
            <SH label="Configuration Equations" color={CYAN} />
            {CONFIG_EQS.map(e => (
              <div key={e.label} style={{ marginBottom:5, padding:"5px 7px",
                borderLeft:`2px solid ${e.color}50`, background:`${e.color}05`, borderRadius:2 }}>
                <div style={{ fontSize:7, color:MUTED, marginBottom:1 }}>{e.label}</div>
                <div style={{ fontFamily:serif, fontSize:9, color:e.color, letterSpacing:0.3, marginBottom:2 }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.5 }}>{e.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Canvas panel */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"6px 12px 5px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:7, color:MUTED, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                {tab==="otto"       ? "Otto Cycle P-V · Intake→Compression→Combustion→Exhaust · Work Output W_net" :
                 tab==="correction" ? "Recursive Correction · Newton-Raphson qₙ₊₁=qₙ−J⁻¹F(qₙ) · Convergence to q*" :
                 "Energy Landscape · Gradient Descent · ∂E/∂qᵢ=0 at Equilibrium q*"}
              </div>
              <div style={{ fontSize:8, color:tab==="otto"?AMBER:tab==="correction"?CYAN:GREEN }}>
                {tab==="otto"?"η=1−r^(1−γ)":tab==="correction"?"quadratic convergence":"∂²E/∂q²>0 at q*"}
              </div>
            </div>
            {tab==="otto"       && <OttoCanvas />}
            {tab==="correction" && <CorrectionCanvas />}
            {tab==="landscape"  && <LandscapeCanvas />}
          </div>

          {/* Self-correction algorithm */}
          <div style={{ ...panelBox, border:`1px solid ${VIOLET}35` }}>
            {topLine(VIOLET)}
            <SH label="Recursive Self-Correction Algorithm" color={VIOLET} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.65 }}>
              Each engine cycle executes one iteration of the self-correction loop. Quadratic convergence: error squares each cycle. The system reaches equilibrium in O(log log ε) cycles.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
              {ALGO_STEPS.map((s, i) => (
                <div key={s.n} onClick={()=>setActiveAlgo(i===activeAlgo?-1:i)} style={{
                  padding:"6px 8px", cursor:"pointer",
                  background: activeAlgo===i ? `${s.color}10` : "transparent",
                  border:`1px solid ${activeAlgo===i ? s.color : BORDER}`,
                  borderRadius:2, transition:"all 0.15s" }}>
                  <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3 }}>
                    <div style={{ fontFamily:serif, fontSize:9, color:s.color, width:18 }}>{s.n}</div>
                    <div style={{ fontSize:8, color:s.color }}>{s.label}</div>
                  </div>
                  <div style={{ fontFamily:mono, fontSize:7, color:MUTED, lineHeight:1.5 }}>{s.code}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Equilibrium synthesis */}
          <div style={{ ...panelBox, border:`1px solid ${GREEN}30` }}>
            {topLine(GREEN)}
            <SH label="Configuration Equilibrium · Synthesis" color={GREEN} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              {[
                [GREEN, "Fixed Point",    "The engine converges to a configuration q* such that F(q*)=0 — no further correction is applied. All partial derivatives ∂E/∂qᵢ vanish simultaneously."],
                [GOLD,  "Golden Threshold","Equilibrium is declared when the residual ε = ‖F(q)‖ < φ⁻¹ ≈ 0.618. The golden ratio reciprocal as the boundary of stability — same threshold as all AETHER systems."],
                [VIOLET,"Recursion Depth","Each engine cycle reduces residual quadratically: ε_{n+1} ≈ C·εₙ². Typically 4–7 combustion cycles reach machine-precision equilibrium from an arbitrary initial configuration."],
                [CYAN,  "Compression Ratio","Higher compression ratio r → higher Otto efficiency η → more useful work per cycle → faster convergence. The engine's computational power scales with its thermodynamic efficiency."],
              ].map(([c,t,d])=>(
                <div key={t as string} style={{ padding:"7px 9px",
                  background:`${(c as string)}06`,
                  border:`1px solid ${(c as string)}20`, borderRadius:2 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:c as string, marginBottom:3 }}>{t}</div>
                  <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div>
          {/* AETHER engine map */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}40` }}>
            {topLine()}
            <SH label="AETHER Engine Map" color={GOLD} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.65 }}>
              The engine computation maps directly onto the AETHER coherence cycle. Fuel is the signal. Combustion is the update. Equilibrium is the crystallisation point.
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {AETHER_MAP.map((s, i) => (
                <div key={s.sym}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 9px",
                    background:`${s.color}08`, border:`1px solid ${s.color}25`, borderRadius:2 }}>
                    <div style={{ fontFamily:serif, fontSize:12, color:s.color, width:60, flexShrink:0 }}>{s.sym}</div>
                    <div>
                      <div style={{ fontSize:8, color:s.color, marginBottom:1 }}>{s.label}</div>
                      <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.4 }}>{s.note}</div>
                    </div>
                  </div>
                  {i < AETHER_MAP.length-1 && (
                    <div style={{ textAlign:"center", fontSize:10, color:MUTED, lineHeight:1.2 }}>↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Engine specs */}
          <div style={panelBox}>
            {topLine(VIOLET)}
            <SH label="Engine Computer · Specifications" color={VIOLET} />
            {[
              ["Fuel type",          "Configuration residual F(q) — any equation system",        AMBER ],
              ["Compression ratio r","8–12 (gasoline) · maps to convergence rate parameter",      GOLD  ],
              ["γ (heat capacity)",  "1.4 air-fuel · sets adiabat steepness / info density",      CYAN  ],
              ["Efficiency η",       "1 − r^(1−γ) ≈ 56–62% at r=9.5 · φ^-1 range",             GREEN ],
              ["Convergence",        "Quadratic: O(log log ε) cycles to equilibrium",             VIOLET],
              ["Threshold",          "ε* = φ⁻¹ ≈ 0.618 — golden equilibrium boundary",           ROSE  ],
              ["Correction method",  "Newton-Raphson: qₙ₊₁ = qₙ − J⁻¹·F(qₙ)",                  TEAL  ],
              ["Equilibrium type",   "∂E/∂qᵢ = 0 · saddle-free (iff ∂²E/∂q² > 0)",             LIME  ],
              ["Exhaust output",     "Corrected configuration q* + residual history εₙ",          BLUE  ],
              ["Recursion depth",    "n=4–7 cycles for convergence from arbitrary q₀",            SKY   ],
            ].map(([k,v,c])=>(
              <div key={k as string} style={{ display:"flex", justifyContent:"space-between",
                padding:"4px 0", borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ fontSize:8, color:MUTED }}>{k}</span>
                <span style={{ fontSize:8, color:c as string, maxWidth:"52%", textAlign:"right" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Bursting quaternions link */}
          <div style={{ ...panelBox, border:`1px solid ${ROSE}30` }}>
            {topLine(ROSE)}
            <SH label="Bursting Quaternions Link" color={ROSE} />
            <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.8 }}>
              The combustion step in the engine computer is the <span style={{ color:AMBER }}>burst event</span> from the Bursting Quaternions framework: coherence accumulates during compression, reaches the critical threshold C*, and fires a rapid state reorganisation — the Newton step. The new configuration q* is the post-burst coherent state. <span style={{ color:VIOLET }}>Oscillation → Coupling → Coherence → Threshold → Burst → Reorganisation</span> is the same sequence as Intake → Compression → Combustion → Exhaust.
            </div>
            <div style={{ marginTop:8, padding:"6px 9px",
              background:`${VIOLET}08`, border:`1px solid ${VIOLET}25`, borderRadius:2 }}>
              <div style={{ fontFamily:serif, fontSize:11, color:VIOLET, marginBottom:2 }}>C(t) ≥ C*  →  BURST  →  q*</div>
              <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>
                The combustion is not heat — it is a reconfiguration of information structure. The fuel is coherence. The output is a new stable equilibrium.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

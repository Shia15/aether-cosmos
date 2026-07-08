import { useEffect, useRef, useState, useCallback } from "react";
import humanStrandImg  from "@assets/42C7A69D-3F45-4D4B-81EC-4F92E157EB18_1782000038123.png";
import strandDiagram  from "@assets/C20E8497-E3A4-4693-AB3B-D03440AEA4B8_1782000566540.png";
import humanStrand2   from "@assets/42C7A69D-3F45-4D4B-81EC-4F92E157EB18_1782000566540.png";

/* ── Palette ─────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";
const PHI  = (1 + Math.sqrt(5)) / 2;
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ≈137.5°

/* ── Sieve of Eratosthenes ───────────────────────────── */
function sieve(n: number): number[] {
  const composite = new Uint8Array(n + 1);
  const primes: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (!composite[i]) {
      primes.push(i);
      for (let j = i * i; j <= n; j += i) composite[j] = 1;
    }
  }
  return primes;
}
const PRIMES = sieve(400);
const PRIME_SET = new Set(PRIMES);

/* ── Branch type ─────────────────────────────────────── */
interface Branch {
  id:       number;
  prime:    number;      // triggering prime
  angle:    number;      // phyllotaxis angle (golden angle × id)
  maxLen:   number;      // log(p_n) × scale
  curLen:   number;      // current drawn length (grows to maxLen)
  phase:    number;      // color hue
  opacity:  number;      // fades with decoherence
  birthT:   number;      // frame born
  subN:     number;      // how many sub-branches spawned
  collapsed:boolean;     // selected during observation
  dismissed:boolean;     // deselected during observation
  cx:       number;      // origin x on human body
  cy:       number;      // origin y on human body
}

/* ── Sim params ──────────────────────────────────────── */
interface Params {
  alpha: number;   // dU/dt growth coupling
  beta:  number;   // decoherence coupling
  gamma: number;   // prime-burst coupling
  tau:   number;   // decoherence timescale (frames)
  speed: number;   // frames per tick
  Dc:    number;   // critical decoherence threshold for sub-branching
}

/* ── Human body emission points ─────────────────────── */
function emissionPoints(cx: number, cy: number): Array<{ x: number; y: number; bias: number }> {
  return [
    { x: cx,        y: cy - 220, bias: 0.3  },  // crown
    { x: cx,        y: cy - 155, bias: 0.25 },  // third eye
    { x: cx - 75,   y: cy - 100, bias: 0.15 },  // left shoulder
    { x: cx + 75,   y: cy - 100, bias: 0.15 },  // right shoulder
    { x: cx,        y: cy - 80,  bias: 0.4  },  // heart center
    { x: cx - 110,  y: cy - 30,  bias: 0.1  },  // left hand
    { x: cx + 110,  y: cy - 30,  bias: 0.1  },  // right hand
    { x: cx,        y: cy + 10,  bias: 0.2  },  // solar plexus
    { x: cx - 40,   y: cy + 80,  bias: 0.05 },  // left hip
    { x: cx + 40,   y: cy + 80,  bias: 0.05 },  // right hip
  ];
}

/* ── Main canvas ─────────────────────────────────────── */
function StrandCanvas({
  params, observed, onObserve, onStats,
}: {
  params: Params;
  observed: boolean;
  onObserve: (U: number, D: number, r: number) => void;
  onStats: (s: { U: number; D: number; P: number; t: number; branches: number; r: number }) => void;
}) {
  const cvRef    = useRef<HTMLCanvasElement>(null);
  const rafRef   = useRef<number>(0);
  const branches = useRef<Branch[]>([]);
  const histU    = useRef<number[]>([]);
  const histD    = useRef<number[]>([]);
  const frameRef = useRef(0);
  const Uref     = useRef(0.1);
  const Dref     = useRef(1.0);
  const Pref     = useRef(0.0);
  const pRef     = useRef(params);
  const obsRef   = useRef(observed);

  useEffect(() => { pRef.current = params; },  [params]);
  useEffect(() => { obsRef.current = observed; }, [observed]);

  /* Trigger observe: collapse wavefunction */
  useEffect(() => {
    if (!observed || branches.current.length === 0) return;
    const br = branches.current;
    /* Born-rule amplitudes: more recent branches have larger amplitude */
    const total = br.length;
    const amps  = br.map((b, i) => Math.exp(-(total - 1 - i) * 0.15));
    const Z     = amps.reduce((a, b) => a + b, 0);
    let rng = Math.random() * Z;
    let chosen = 0;
    for (let k = 0; k < total; k++) {
      rng -= amps[k];
      if (rng <= 0) { chosen = k; break; }
    }
    br.forEach((b, i) => {
      if (i === chosen)  { b.collapsed = true;  b.dismissed = false; }
      else               { b.dismissed = true;  b.collapsed = false; }
    });
    const U = Uref.current, D = Dref.current;
    onObserve(U, D, amps[chosen] / Z);
  }, [observed]); // eslint-disable-line

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const CX = W / 2, CY = H * 0.62;

    const EMITS = emissionPoints(CX, CY);

    function hsl(h: number, s = 80, l = 62) {
      return `hsl(${h % 360},${s}%,${l}%)`;
    }
    function hslA(h: number, a: number) {
      return `hsla(${h % 360},80%,65%,${a})`;
    }

    const draw = () => {
      const p = pRef.current;
      const obs = obsRef.current;
      const F = frameRef.current;

      /* ── ODE update ───────────────────────────────── */
      for (let s = 0; s < p.speed; s++) {
        const t = frameRef.current;
        const D = Math.exp(-t / p.tau);
        Dref.current = D;

        /* Prime burst — spike if current t is prime */
        let P = 0;
        if (PRIME_SET.has(t)) {
          const idx = PRIMES.indexOf(t);
          P = Math.log(t + 1) * p.gamma;
          Pref.current = P;

          /* Emit branch from a weighted random emission point */
          const em  = EMITS[Math.floor(Math.random() * EMITS.length * 0.7)]; // bias toward upper body
          const id  = branches.current.length;
          const ang = id * GOLDEN_ANGLE;
          branches.current.push({
            id, prime: t, angle: ang,
            maxLen: Math.log(t + 1) * 38,
            curLen: 0, phase: (ang / (Math.PI * 2)) * 360,
            opacity: 1, birthT: t,
            subN: 0, collapsed: false, dismissed: false,
            cx: em.x, cy: em.y,
          });
        } else {
          Pref.current *= 0.88; // decay between primes
        }

        /* dU/dt = α·U - β·D + γ·P */
        const dU = p.alpha * Uref.current - p.beta * D + P;
        Uref.current = Math.max(0, Math.min(20, Uref.current + dU * 0.01));

        frameRef.current++;

        /* History */
        if (t % 3 === 0) {
          histU.current.push(Uref.current);
          histD.current.push(D);
          if (histU.current.length > 300) { histU.current.shift(); histD.current.shift(); }
        }
      }

      const t  = frameRef.current;
      const D  = Dref.current;
      const Uv = Uref.current;

      /* Grow branch lengths */
      for (const b of branches.current) {
        if (b.curLen < b.maxLen) b.curLen += (b.maxLen - b.curLen) * 0.06;
        /* Fade with age and decoherence */
        const age = t - b.birthT;
        b.opacity = obs && b.dismissed
          ? Math.max(0, b.opacity - 0.04)
          : Math.min(1, 1 - age * 0.0015 + D * 0.2);
        b.opacity = Math.max(0, b.opacity);
      }

      /* Sub-branch spawning when D < Dc (cap total to prevent stack overflow) */
      if (D < p.Dc && !obs && branches.current.length < 400) {
        for (const b of branches.current) {
          if (b.subN < 2 && b.curLen > b.maxLen * 0.6 && Math.random() < 0.004) {
            branches.current.push({
              id: branches.current.length,
              prime: b.prime,
              angle: b.angle + (Math.random() - 0.5) * 0.9,
              maxLen: b.maxLen * 0.5,
              curLen: 0,
              phase: b.phase + 30,
              opacity: 0.7,
              birthT: t,
              subN: 0,
              collapsed: false, dismissed: false,
              cx: b.cx + Math.cos(b.angle) * b.curLen,
              cy: b.cy + Math.sin(b.angle) * b.curLen,
            });
            b.subN++;
          }
        }
      }

      /* ── Draw ─────────────────────────────────────── */
      ctx.fillStyle = `${BG}e8`; ctx.fillRect(0, 0, W, H);

      /* Stars (fabric of space) */
      if (F % 6 === 0) {
        for (let k = 0; k < 8; k++) {
          const sx = Math.random() * W, sy = Math.random() * H;
          ctx.beginPath(); ctx.arc(sx, sy, 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,220,255,${Math.random() * 0.12})`; ctx.fill();
        }
      }

      /* Coherence shell — oval wrapping all branches */
      if (branches.current.length > 0) {
        const maxR = branches.current.reduce((acc, b) => Math.max(acc, b.curLen + 30), 50);
        const shellGrad = ctx.createRadialGradient(CX, CY, maxR * 0.4, CX, CY, maxR * 1.1);
        shellGrad.addColorStop(0, `${BLUE}00`);
        shellGrad.addColorStop(0.7, `${BLUE}${Math.round(D * 12).toString(16).padStart(2, "0")}`);
        shellGrad.addColorStop(1, `${BLUE}00`);
        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(1, 0.7);
        ctx.beginPath(); ctx.arc(0, 0, maxR * 1.1, 0, Math.PI * 2);
        ctx.fillStyle = shellGrad; ctx.fill();
        ctx.restore();
        /* Shell ring */
        ctx.save();
        ctx.translate(CX, CY);
        ctx.scale(1, 0.7);
        ctx.beginPath(); ctx.arc(0, 0, maxR * 1.05, 0, Math.PI * 2);
        ctx.strokeStyle = `${BLUE}${Math.round(D * 40).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 1.2; ctx.setLineDash([4, 8]); ctx.stroke();
        ctx.setLineDash([]); ctx.restore();
      }

      /* Branches — prime-burst filaments */
      for (const b of branches.current) {
        if (b.opacity < 0.02) continue;
        const ex = b.cx + Math.cos(b.angle) * b.curLen;
        const ey = b.cy + Math.sin(b.angle) * b.curLen;
        const bright = b.collapsed ? 1.5 : b.dismissed ? 0.15 : 1;
        const alpha  = b.opacity * bright;

        /* Glow outer */
        const gl = ctx.createLinearGradient(b.cx, b.cy, ex, ey);
        gl.addColorStop(0, hslA(b.phase, alpha * 0.5));
        gl.addColorStop(1, hslA(b.phase + 40, alpha * 0.15));
        ctx.beginPath(); ctx.moveTo(b.cx, b.cy); ctx.lineTo(ex, ey);
        ctx.strokeStyle = gl; ctx.lineWidth = b.collapsed ? 5 : 2.5; ctx.stroke();

        /* Core line */
        ctx.beginPath(); ctx.moveTo(b.cx, b.cy); ctx.lineTo(ex, ey);
        ctx.strokeStyle = hslA(b.phase, alpha * 0.9);
        ctx.lineWidth = b.collapsed ? 3 : 1.2; ctx.stroke();

        /* Tip node */
        if (b.curLen > b.maxLen * 0.5) {
          ctx.beginPath(); ctx.arc(ex, ey, b.collapsed ? 5 : 2.5, 0, Math.PI * 2);
          ctx.fillStyle = hslA(b.phase, alpha); ctx.fill();
        }
      }

      /* ── Human body ──────────────────────────────── */
      /* Ground line */
      const footY = CY + 130;
      ctx.beginPath();
      ctx.moveTo(CX - 160, footY + 10); ctx.lineTo(CX + 160, footY + 10);
      ctx.strokeStyle = `${BLUE}20`; ctx.lineWidth = 1; ctx.stroke();

      /* Filament body nodes */
      const nodes = [
        { x: CX,      y: CY - 220, r: 14, col: TEAL  },  // crown
        { x: CX,      y: CY - 175, r: 9,  col: BLUE  },  // brow
        { x: CX,      y: CY - 130, r: 7,  col: BLUE  },  // throat
        { x: CX - 65, y: CY - 100, r: 6,  col: VIO   },  // L shoulder
        { x: CX + 65, y: CY - 100, r: 6,  col: VIO   },  // R shoulder
        { x: CX,      y: CY - 85,  r: 11, col: TEAL  },  // heart
        { x: CX - 110,y: CY - 30,  r: 5,  col: GOLD  },  // L hand
        { x: CX + 110,y: CY - 30,  r: 5,  col: GOLD  },  // R hand
        { x: CX,      y: CY + 5,   r: 8,  col: AMB   },  // solar
        { x: CX - 35, y: CY + 80,  r: 5,  col: VIO   },  // L hip
        { x: CX + 35, y: CY + 80,  r: 5,  col: VIO   },  // R hip
        { x: CX - 22, y: footY,    r: 4,  col: TEAL  },  // L foot
        { x: CX + 22, y: footY,    r: 4,  col: TEAL  },  // R foot
      ];

      /* Connection filaments */
      const connections = [
        [0,1],[1,2],[2,3],[2,4],[2,5],[3,6],[4,7],[5,8],[8,9],[8,10],[9,11],[10,12]
      ];
      for (const [a, b2] of connections) {
        const na = nodes[a], nb = nodes[b2];
        const cg = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
        cg.addColorStop(0, `${na.col}90`);
        cg.addColorStop(1, `${nb.col}90`);
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = cg; ctx.lineWidth = 1.8;
        ctx.shadowColor = na.col; ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      /* Node glows */
      for (const nd of nodes) {
        const ng = ctx.createRadialGradient(nd.x, nd.y, 0, nd.x, nd.y, nd.r * 3.5);
        ng.addColorStop(0, `${nd.col}30`);
        ng.addColorStop(1, `${nd.col}00`);
        ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = ng; ctx.fill();
        ctx.beginPath(); ctx.arc(nd.x, nd.y, nd.r, 0, Math.PI * 2);
        ctx.fillStyle = `${nd.col}cc`; ctx.fill();
      }

      /* Worldline — vertical glowing spine */
      const spineGrad = ctx.createLinearGradient(CX, footY, CX, CY - 230);
      spineGrad.addColorStop(0, `${BLUE}60`);
      spineGrad.addColorStop(0.5, `${TEAL}aa`);
      spineGrad.addColorStop(1, `${VIO}60`);
      ctx.beginPath(); ctx.moveTo(CX, footY); ctx.lineTo(CX, CY - 225);
      ctx.strokeStyle = spineGrad; ctx.lineWidth = 2.5;
      ctx.shadowColor = TEAL; ctx.shadowBlur = 12;
      ctx.stroke(); ctx.shadowBlur = 0;

      /* ── Equation overlay ─────────────────────────── */
      ctx.font = `10px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";

      /* dU/dt equation */
      ctx.fillStyle = `${TEAL}70`;
      ctx.fillText(`dU/dt = α·${Uv.toFixed(2)} − β·${D.toFixed(3)} + γ·P`, 12, 12);
      ctx.fillText(`U = ${Uv.toFixed(3)}   D = ${D.toFixed(4)}   t = ${t}`, 12, 28);
      ctx.fillText(`branches = ${branches.current.length}  primes ≤ ${t}: ${PRIMES.filter(p2 => p2 <= t).length}`, 12, 44);

      /* D(t) overlay bar (right side) */
      const barH = 120, barX = W - 22, barY = 12;
      ctx.strokeStyle = `${DIM}50`; ctx.lineWidth = 0.5;
      ctx.strokeRect(barX, barY, 10, barH);
      const fillH = D * barH;
      const barCol = D > p.Dc ? TEAL : ROSE;
      ctx.fillStyle = `${barCol}80`;
      ctx.fillRect(barX, barY + barH - fillH, 10, fillH);
      ctx.font = `7px ${mono}`; ctx.textAlign = "center";
      ctx.fillStyle = barCol;
      ctx.fillText("D", barX + 5, barY + barH + 4);
      if (D < p.Dc) {
        ctx.fillStyle = ROSE;
        ctx.fillText("SUB-", barX + 5, barY - 18);
        ctx.fillText("BRANCH", barX + 5, barY - 10);
      }

      /* r(t) strip chart — U and D */
      const HR_U = histU.current, HR_D = histD.current;
      if (HR_U.length > 2) {
        const chX = 12, chY = H - 52, chW = W - 24, chH = 36;
        ctx.fillStyle = "rgba(2,4,8,0.75)"; ctx.fillRect(chX, chY, chW, chH);
        ctx.strokeStyle = `${TEAL}20`; ctx.lineWidth = 0.5;
        ctx.strokeRect(chX, chY, chW, chH);
        const maxU = Math.max(1, ...HR_U);
        /* U curve */
        ctx.beginPath();
        for (let k = 0; k < HR_U.length; k++) {
          const px = chX + (k / 300) * chW;
          const py = chY + chH - (HR_U[k] / maxU) * chH;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = GOLD; ctx.lineWidth = 1.5; ctx.stroke();
        /* D curve */
        ctx.beginPath();
        for (let k = 0; k < HR_D.length; k++) {
          const px = chX + (k / 300) * chW;
          const py = chY + chH - HR_D[k] * chH;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = BLUE; ctx.lineWidth = 1; ctx.stroke();
        /* Dc threshold line */
        ctx.beginPath();
        ctx.moveTo(chX, chY + chH - p.Dc * chH);
        ctx.lineTo(chX + chW, chY + chH - p.Dc * chH);
        ctx.strokeStyle = `${ROSE}60`; ctx.lineWidth = 0.7;
        ctx.setLineDash([3, 4]); ctx.stroke(); ctx.setLineDash([]);
        ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = `${GOLD}80`;
        ctx.fillText(`U(t) understanding  ·  D(t) decoherence  ·  — Dc threshold`, chX + 4, chY + 2);
      }

      /* Prime burst flash */
      if (PRIME_SET.has(t - 1)) {
        const flash = 1 - (F % 8) / 8;
        ctx.beginPath(); ctx.arc(CX, CY - 85, 80 + flash * 40, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(46,240,216,${flash * 0.3})`; ctx.lineWidth = 2;
        ctx.stroke();
      }

      /* Collapse label */
      if (obs) {
        ctx.font = `bold 11px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = `${ROSE}cc`;
        ctx.fillText("OBSERVATION EVENT · WAVEFUNCTION COLLAPSED", CX, 64);
        ctx.font = `9px ${mono}`; ctx.fillStyle = `${ROSE}70`;
        ctx.fillText("One branch selected by Born rule  ·  P(k) = |c_k|² / Σ|c_k|²", CX, 80);
      }

      if (F % 4 === 0) {
        onStats({ U: Uref.current, D: Dref.current, P: Pref.current,
          t: frameRef.current, branches: branches.current.length, r: D });
      }

      frameRef.current++;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={720} height={560}
      style={{ width:"100%", maxWidth:720, borderRadius:12,
        border:`1px solid ${BLUE}18`, background:BG,
        boxShadow:"0 4px 60px rgba(0,0,0,0.8)" }} />
  );
}

/* ── UI helpers ──────────────────────────────────────── */
function SH({ n, title, sub, col = TEAL }: { n: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginTop:56, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:23, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:22 }} />
    </div>
  );
}
function Sl({ label, val, min, max, step, col, fmt, onChange }: {
  label: string; val: number; min: number; max: number; step: number; col: string;
  fmt?: (v: number) => string; onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", fontFamily:mono, fontSize:9, color:col, marginBottom:3 }}>
        <span>{label}</span><span>{fmt ? fmt(val) : val.toFixed(3)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={val}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:col }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
function UnderstandingStrandHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const nodes=12;
      for(let i=0;i<nodes;i++){
        const frac=i/(nodes-1);
        const x=30+frac*(W-60);
        const y1=cy()+30*Math.sin(frac*Math.PI*3+t*0.04);
        const y2=cy()-30*Math.sin(frac*Math.PI*3+t*0.04);
        ctx.beginPath();ctx.arc(x,y1,3,0,Math.PI*2);ctx.fillStyle="rgba(46,240,216,0.5)";ctx.fill();
        ctx.beginPath();ctx.arc(x,y2,3,0,Math.PI*2);ctx.fillStyle="rgba(153,102,255,0.5)";ctx.fill();
        if(i%2===0){
          ctx.beginPath();ctx.moveTo(x,y1);ctx.lineTo(x,y2);ctx.strokeStyle="rgba(201,168,76,0.25)";ctx.lineWidth=0.8;ctx.stroke();
        }
      }
      ctx.beginPath();
      for(let x=0;x<=W;x+=3){
        const frac=x/W;
        const y=cy()+30*Math.sin(frac*Math.PI*3+t*0.04);
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle="rgba(46,240,216,0.3)";ctx.lineWidth=0.8;ctx.stroke();
      ctx.beginPath();
      for(let x=0;x<=W;x+=3){
        const frac=x/W;
        const y=cy()-30*Math.sin(frac*Math.PI*3+t*0.04);
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle="rgba(153,102,255,0.3)";ctx.lineWidth=0.8;ctx.stroke();
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UNDERSTANDING STRAND · DNA HELIX · KNOWLEDGE THREADING · BASE PAIRS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
      function cy(){return H/2;}
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UnderstandingStrandPage() {
  const [params, setParams] = useState<Params>({
    alpha: 0.12, beta: 0.08, gamma: 0.6, tau: 180, speed: 1, Dc: 0.25,
  });
  const [observed,  setObserved]  = useState(false);
  const [obsResult, setObsResult] = useState<{ U: number; D: number; r: number } | null>(null);
  const [stats, setStats] = useState({ U:0.1, D:1, P:0, t:0, branches:0, r:1 });

  const sp = (k: keyof Params) => (v: number) => setParams(p => ({ ...p, [k]: v }));
  const onStats    = useCallback((s: typeof stats) => setStats(s), []);
  const onObserve  = useCallback((U: number, D: number, r: number) => setObsResult({ U, D, r }), []);
  const handleObs  = () => { setObserved(true); };

  const DlabelCol = stats.D > params.Dc ? TEAL : ROSE;
  const DlabelTxt = stats.D > params.Dc ? "COHERENT" : "DECOHERENT · SUB-BRANCHING";

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 28px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, ${BLUE}08, ${TEAL}04, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:BLUE, letterSpacing:4, marginBottom:10 }}>
          AETHER · UNDERSTANDING STRAND · LENGTH FABRIC SPACE · QUANTUM MEASUREMENT
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(26px,5vw,50px)", color:"#fff", margin:"0 0 8px", letterSpacing:1 }}>
          HUMAN AS ENERGETIC<span style={{ color:TEAL }}>·</span>WORLDLINE
        </h1>
        <div style={{ fontFamily:serif, fontSize:15, color:TEAL, letterSpacing:3, marginBottom:16 }}>
          Prime Bursts · Flower Branching · Decoherence Collapse · Measurement Problem
        </div>
        <div style={{ fontFamily:body, fontSize:16, color:DIM, maxWidth:700, margin:"0 auto", lineHeight:1.9 }}>
          A human is an information trajectory through possibility space — an understanding worldline
          extending outward through length fabric space like a flower. At each prime position in time,
          new branches of possibility erupt. Decoherence narrows the field. Observation collapses it to one.
          This is the measurement problem, embodied.
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"0 24px 80px" }}>

        <SH n="I" title="Live Understanding Worldline Simulation"
          sub="Prime bursts create flower-like branches · D(t) coherence shell · click OBSERVE to collapse the wavefunction"
          col={BLUE} />

        {/* Status row */}
        <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:16 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:GOLD, border:`1px solid ${GOLD}40`,
            borderRadius:5, padding:"5px 12px", background:`${GOLD}08` }}>
            U = {stats.U.toFixed(3)} · t = {stats.t}
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:DlabelCol, border:`1px solid ${DlabelCol}40`,
            borderRadius:5, padding:"5px 12px", background:`${DlabelCol}08` }}>
            D = {stats.D.toFixed(4)} · {DlabelTxt}
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:VIO, border:`1px solid ${VIO}40`,
            borderRadius:5, padding:"5px 12px", background:`${VIO}08` }}>
            BRANCHES: {stats.branches} · primes ≤ t: {PRIMES.filter(p => p <= stats.t).length}
          </div>
          {obsResult && (
            <div style={{ fontFamily:mono, fontSize:10, color:ROSE, border:`1px solid ${ROSE}40`,
              borderRadius:5, padding:"5px 12px", background:`${ROSE}08` }}>
              COLLAPSED · P(k) = {(obsResult.r * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <div style={{ display:"flex", gap:22, flexWrap:"wrap", alignItems:"flex-start" }}>
          {/* Canvas */}
          <div style={{ flex:"1 1 500px" }}>
            <StrandCanvas params={params} observed={observed}
              onObserve={onObserve} onStats={onStats} />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
              SPINE = understanding worldline (vertical filament)  ·  NODES = body energy centers  ·
              BRANCHES = prime-burst possibilities (golden angle phyllotaxis)  ·
              BLUE SHELL = decoherence envelope D(t)  ·  DASHED RING = coherence boundary  ·
              BOTTOM STRIP = U(t) understanding (gold) and D(t) decoherence (blue)  ·
              RED DASHED LINE = Dc threshold (sub-branching begins below)
            </div>
          </div>

          {/* Controls */}
          <div style={{ flex:"0 0 240px", background:`${BLUE}05`,
            border:`1px solid ${BLUE}18`, borderRadius:10, padding:"18px 20px" }}>
            <div style={{ fontFamily:mono, fontSize:10, color:BLUE, letterSpacing:2, marginBottom:16 }}>
              ODE PARAMETERS
            </div>

            <Sl label="α GROWTH COUPLING" val={params.alpha} min={0} max={0.5} step={0.005} col={GOLD}
              onChange={sp("alpha")} />
            <Sl label="β DECOHERENCE COUPLING" val={params.beta} min={0} max={0.5} step={0.005} col={ROSE}
              onChange={sp("beta")} />
            <Sl label="γ PRIME BOOST" val={params.gamma} min={0} max={2} step={0.05} col={VIO}
              onChange={sp("gamma")} />
            <Sl label="τ DECOHERENCE TIMESCALE" val={params.tau} min={20} max={500} step={5} col={BLUE}
              fmt={v => `${v} frames`} onChange={sp("tau")} />
            <Sl label="Dc CRITICAL THRESHOLD" val={params.Dc} min={0.01} max={0.9} step={0.01} col={TEAL}
              onChange={sp("Dc")} />
            <Sl label="SPEED" val={params.speed} min={1} max={5} step={1} col={DIM as string}
              fmt={v => `${v}×`} onChange={sp("speed")} />

            <div style={{ height:1, background:`${BLUE}18`, margin:"14px 0" }} />

            <button onClick={handleObs} disabled={observed}
              style={{ fontFamily:mono, fontSize:10, padding:"9px 16px", borderRadius:6,
                cursor: observed ? "default" : "pointer",
                border:`1px solid ${ROSE}${observed ? "30" : "80"}`,
                background: observed ? `${ROSE}08` : `${ROSE}18`,
                color: observed ? `${ROSE}40` : ROSE,
                width:"100%", letterSpacing:1, marginBottom:10 }}>
              {observed ? "COLLAPSED" : "◉ OBSERVE · COLLAPSE"}
            </button>

            <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.8 }}>
              <strong style={{ color:BLUE, fontFamily:mono, fontSize:8 }}>WHAT TO WATCH</strong><br />
              Each <strong style={{ color:GOLD }}>prime t</strong> fires a branch from a body node.<br />
              Branches angle by <strong style={{ color:VIO }}>golden angle φ</strong> — producing flower phyllotaxis.<br />
              When D falls below <strong style={{ color:ROSE }}>Dc</strong>, sub-branches form.<br />
              <strong style={{ color:ROSE }}>OBSERVE</strong> collapses to one branch via Born rule.
            </div>
          </div>
        </div>

        {/* The ODE */}
        <SH n="II" title="The Understanding Worldline Equation"
          sub="dU/dt = α·U − β·D + γ·P — a driven nonlinear ODE for the information trajectory"
          col={GOLD} />
        <div style={{ background:"#030d18", border:`1px solid ${GOLD}22`, borderRadius:10, padding:"24px 28px", marginBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:10, color:GOLD, letterSpacing:2, marginBottom:16 }}>
            GOVERNING EQUATION · UNDERSTANDING WORLDLINE DYNAMICS
          </div>
          {[
            "dU/dt  =  α·U  −  β·D  +  γ·P",
            "",
            "U  =  understanding accumulation (the worldline's information content)",
            "D  =  decoherence:   D(t) = exp(−t/τ)     (coherence decays over time)",
            "P  =  prime burst:   P(t) = γ·log(pₙ)·δ(t − pₙ)   (spike at each prime)",
            "",
            "α·U  →  self-reinforcing understanding (understanding begets understanding)",
            "−β·D  →  decoherence pressure (environment destroys phase relationships)",
            "γ·P  →  prime-burst injection (new distinguishable structures emerge)",
            "",
            "Branch condition:   U·P > Dc   →   new branch emitted",
            "Branch angle:       θₙ = n·φ_golden  (phyllotaxis: golden angle 137.5°)",
            "Branch length:      Lₙ = log(pₙ) · scale   (B(n) = log(pₙ) from prime law)",
          ].map((l, i) => (
            <div key={i} style={{
              fontFamily:mono, fontSize:11, lineHeight:2.15, whiteSpace:"pre-wrap",
              color: l === "" ? "transparent" :
                l.startsWith("dU") ? GOLD :
                l.startsWith("U =") || l.startsWith("D =") || l.startsWith("P =") ? TEAL :
                l.startsWith("α·U") ? GOLD :
                l.startsWith("−β") ? ROSE :
                l.startsWith("γ·P") ? VIO :
                l.startsWith("Branch") ? AMB :
                TEXT,
            }}>{l || " "}</div>
          ))}
        </div>

        {/* Prime burst table */}
        <SH n="III" title="Prime Burst Sequence"
          sub="Each prime triggers a new possibility branch — B(n) = log(pₙ) determines the branch reach"
          col={VIO} />
        <div style={{ overflowX:"auto", marginBottom:28 }}>
          <table style={{ borderCollapse:"collapse", fontFamily:mono, fontSize:10 }}>
            <thead>
              <tr style={{ borderBottom:`1px solid ${VIO}30` }}>
                {["n","pₙ","B(n)=log(pₙ)","Branch Length (px)","Golden Angle θₙ","Hue (°)"].map(h => (
                  <th key={h} style={{ padding:"8px 14px", color:VIO, fontWeight:400, letterSpacing:1, textAlign:"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PRIMES.slice(0, 14).map((p, i) => {
                const B = Math.log(p);
                const len = B * 38;
                const ang = ((i * GOLDEN_ANGLE) / (Math.PI * 2)) * 360;
                const hue = ang % 360;
                const isPast = p <= stats.t;
                return (
                  <tr key={p} style={{ borderBottom:`1px solid ${VIO}12`,
                    background: isPast ? `${VIO}08` : "transparent" }}>
                    <td style={{ padding:"7px 14px", color:`${VIO}${isPast ? "ff" : "40"}` }}>{i + 1}</td>
                    <td style={{ padding:"7px 14px", color: isPast ? GOLD : DIM }}>{p}</td>
                    <td style={{ padding:"7px 14px", color:TEAL }}>{B.toFixed(4)}</td>
                    <td style={{ padding:"7px 14px", color:TEXT }}>{len.toFixed(1)} px</td>
                    <td style={{ padding:"7px 14px", color:AMB }}>{ang.toFixed(1)}°</td>
                    <td style={{ padding:"7px 14px" }}>
                      <span style={{ display:"inline-block", width:14, height:14, borderRadius:"50%",
                        background:`hsl(${hue},80%,55%)`, verticalAlign:"middle", marginRight:6 }} />
                      <span style={{ color:DIM }}>{Math.round(hue)}°</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Four models of the measurement problem */}
        <SH n="IV" title="Four Models of the Measurement Problem"
          sub="How this simulation embodies each interpretation of quantum branching"
          col={TEAL} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginBottom:28 }}>
          {[
            {
              title:"1 · INFORMATION-THRESHOLD SPLITTING",
              eq:"N_branches ≈ e^I",
              col:GOLD,
              sim:"In the simulation: each prime t adds log(t) bits to the information field I. The total branch count follows N ≈ Σlog(pₙ) ≈ ∫log(p)dp by the prime number theorem. Watch the branch count grow — it follows this exponential approximately. The more information the worldline accumulates, the more branching opportunities appear.",
              interp:"Information-theoretic: the wavefunction branches when information stored in the system exceeds a threshold. Each branch represents a distinguishable future.",
            },
            {
              title:"2 · DECOHERENCE SPLITTING",
              eq:"D(t) = exp(−t/τ)",
              col:BLUE,
              sim:"The blue coherence shell wraps all branches. As time advances, D(t) decays exponentially with timescale τ. When D < Dc (the red dashed line in the strip chart), sub-branching begins — you see the branches spawning child branches. Adjust τ slider to control how quickly the system thermalizes.",
              interp:"Decoherence theory (Zurek, Joos, Zeh): the environment continuously measures the system, destroying off-diagonal elements of the density matrix. When coherence drops below Dc, the branches become independent.",
            },
            {
              title:"3 · PRIME-BURST SPLITTING",
              eq:"B(n) = log(pₙ)",
              col:VIO,
              sim:"At each prime t = 2, 3, 5, 7, 11, ..., a pulse fires. The branch length is B(n) = log(pₙ) — early primes create short nearby branches, later primes create longer reaches. The spacing between primes grows (prime gap theorem), so bursts become rarer but more powerful. The golden angle phyllotaxis creates the flower pattern.",
              interp:"Prime-number model: distinguishability events are not continuous but discrete, occurring at prime positions. Primes represent moments when the system generates genuinely new information — irreducible, indivisible structure.",
            },
            {
              title:"4 · FRACTAL FLOWER MODEL",
              eq:"N_{k+1} = N_k + φ·N_k",
              col:ROSE,
              sim:"The golden angle θ = 137.5° (= 2π/φ²) ensures each branch points to a direction not yet occupied — the Fibonacci phyllotaxis that creates sunflower/daisy patterns. Sub-branches follow the same rule, creating self-similar scaling. The total branch count follows Fibonacci growth N_{k+1} = N_k·φ asymptotically.",
              interp:"Phyllotaxis model: the branching pattern is not random but follows a curvature-minimization principle. Like a plant maximizing light capture, the understanding worldline maximizes distinguishable futures per unit of coherence lost.",
            },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`, border:`1px solid ${c.col}22`,
              borderRadius:10, padding:"16px 18px" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:c.col, letterSpacing:1, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:mono, fontSize:10, color:`${c.col}90`, background:`${c.col}10`,
                padding:"6px 10px", borderRadius:5, marginBottom:10 }}>{c.eq}</div>
              <div style={{ fontFamily:body, fontSize:13, color:TEXT, lineHeight:1.75, marginBottom:10 }}>
                <strong style={{ color:c.col }}>In simulation: </strong>{c.sim}
              </div>
              <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.7, borderTop:`1px solid ${c.col}18`, paddingTop:8 }}>
                <strong style={{ color:`${c.col}80` }}>Interpretation: </strong>{c.interp}
              </div>
            </div>
          ))}
        </div>

        {/* The quantum equations */}
        <SH n="V" title="Quantum Measurement Problem · Formal Structure"
          sub="The full density matrix formalism — how this simulation makes it visual"
          col={BLUE} />
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>
          <div style={{ background:"#030d18", border:`1px solid ${BLUE}22`, borderRadius:10, padding:"20px 24px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:BLUE, letterSpacing:1, marginBottom:12 }}>
              QUANTUM FORMALISM
            </div>
            {[
              { label:"|Ψ⟩ = Σᵢ cᵢ|i⟩", desc:"superposition of all branches", col:TEAL },
              { label:"ρ̂ = Σᵢ pᵢ|i⟩⟨i|", desc:"density matrix (diagonal after decoherence)", col:BLUE },
              { label:"M_k = |m_k⟩⟨m_k|", desc:"measurement operator for branch k", col:VIO },
              { label:"P(k) = Tr(ρ̂ M_k)", desc:"Born rule: probability of observing branch k", col:GOLD },
              { label:"P(k) = |c_k|²", desc:"amplitude squared = branch probability", col:AMB },
            ].map(eq => (
              <div key={eq.label} style={{ marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${eq.col}15` }}>
                <div style={{ fontFamily:mono, fontSize:12, color:eq.col, marginBottom:3 }}>{eq.label}</div>
                <div style={{ fontFamily:body, fontSize:13, color:DIM }}>{eq.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background:"#030d18", border:`1px solid ${TEAL}22`, borderRadius:10, padding:"20px 24px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:TEAL, letterSpacing:1, marginBottom:12 }}>
              SIMULATION MAPPING
            </div>
            {[
              { label:"|Ψ⟩ ↔ all active branches", col:TEAL, desc:"Each branch IS a |i⟩ basis state. The full branch array is the superposition." },
              { label:"cᵢ ↔ exp(−age_i × 0.15)", col:BLUE, desc:"Amplitude decays with branch age. Recent branches have higher weight in the Born rule." },
              { label:"D(t) ↔ off-diagonal ρ̂", col:VIO, desc:"Decoherence destroys phase relationships between branches. When D=0, branches are fully independent." },
              { label:"OBSERVE ↔ Tr(ρ̂ M_k)", col:GOLD, desc:"Clicking OBSERVE runs Born-rule sampling: P(k) = |ck|² is computed and one branch is selected." },
              { label:"Collapse ↔ branch = 1", col:ROSE, desc:"All dismissed branches fade. The selected branch brightens. This is the measurement postulate applied." },
            ].map(eq => (
              <div key={eq.label} style={{ marginBottom:12, paddingBottom:10, borderBottom:`1px solid ${eq.col}15` }}>
                <div style={{ fontFamily:mono, fontSize:11, color:eq.col, marginBottom:3 }}>{eq.label}</div>
                <div style={{ fontFamily:body, fontSize:13, color:DIM }}>{eq.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Cross synthesis */}
        <SH n="VI" title="Cross-System Synthesis · AETHER Connections"
          sub="How the understanding worldline connects to every prior mathematical layer"
          col={VIO} />
        <div style={{ borderLeft:`2px solid ${VIO}30`, paddingLeft:20, marginBottom:32 }}>
          {[
            { page:"Kuramoto Coupling (synchrony-field)", col:TEAL,
              text:"The coupling between branches — U·P > Dc — is the Kuramoto transition condition K > Kc in disguise. When prime bursts drive U above the decoherence floor, new synchronized clusters form. The branch-count oscillation mirrors the r(t) strip chart: coherent burst → cluster forms → decoherence → cluster breaks → next prime regenerates. The worldline IS a Kuramoto agent moving through its own phase space." },
            { page:"Allen-Cahn / Water Density (perceptive-universe)", col:GOLD,
              text:"D(t) = exp(-t/τ) IS the Allen-Cahn C(x,t) field evaluated along the worldline's time axis. The Dc threshold is the φ⁻¹ = 0.618 critical value. Below Dc: decoherent regime — sub-branches, multiple competing possibilities. Above Dc: coherent regime — unified trajectory. The worldline's transition from coherent → decoherent is the C: 1→0 bifurcation written in time instead of space." },
            { page:"Stromatolite Irreversibility (stromatolite-field)", col:AMB,
              text:"Each prime burst creates an irreversible lamination layer — the branch is emitted, its position is permanent (H only increases). The flower pattern of branches accumulating over time IS the stromatolite dome: local rules (prime occurrence) + constraint (golden angle phyllotaxis) + time = irreversible layered macroscopic structure. The 'observed' branch is the one that gets written into geological record — the others were never chosen." },
            { page:"Floquet Topology (core-resonance)", col:ROSE,
              text:"The understanding worldline traces a Floquet cycle: grow (α·U) → burst (γ·P) → decohere (−β·D) → new prime → grow again. Each cycle is a topological winding around the prime-burst attractor. The golden angle phyllotaxis creates a toroidal winding pattern: 137.5° × N visits every direction before repeating, never self-intersecting. The worldline is topologically protected by irrationality of φ." },
          ].map((e, i) => (
            <div key={i} style={{ marginBottom:20 }}>
              <div style={{ fontFamily:mono, fontSize:9, color:e.col, letterSpacing:1, marginBottom:4 }}>
                ← {e.page.toUpperCase()}
              </div>
              <blockquote style={{ fontFamily:body, fontSize:15, color:TEXT, lineHeight:1.9,
                margin:0, borderLeft:`3px solid ${e.col}40`, paddingLeft:16, fontStyle:"italic" }}>
                {e.text}
              </blockquote>
            </div>
          ))}
        </div>

        {/* Reference images */}
        <SH n="VII" title="Reference Visualizations" sub="The full mathematical diagram + human energetic strand images that ground this simulation" col={DIM} />

        {/* Full-width diagram — most information-dense */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:TEAL, letterSpacing:2, marginBottom:8 }}>
            THE UNDERSTANDING STRAND IN LENGTH FABRIC SPACE · COMPLETE MATHEMATICAL DIAGRAM
          </div>
          <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${TEAL}22`, marginBottom:6 }}>
            <img src={strandDiagram} alt="The Understanding Strand in Length Fabric Space — full mathematical diagram"
              style={{ width:"100%", display:"block", opacity:0.95 }} />
          </div>
          <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.8 }}>
            The complete model: information accumulation I(t) and N_branches ≈ e^I · decoherence D(t) = e^(−t/τ) splitting at D {"<"} Dc ·
            prime-burst generation B(n) = log(p_n) at positions 2,3,5,7,11... · fractal flower growth N_(k+1) = N_k + φ·N_k ·
            splitting condition U·P {">"} Dc · quantum measurement as information resolution P(k) = |c_k|².
            The horizontal axis is length fabric space (information time t₀→t₇...). Branch points mark moments when reality can no longer
            be represented as a single coherent possibility.
          </div>
        </div>

        {/* Two-up: both human strand images */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:32 }}>
          {[
            { src: humanStrandImg, label: "Human as Energetic Strand · Quantum Measurement Problem · Born Rule · Superposition",   col: BLUE },
            { src: humanStrand2,  label: "Human as Energetic Strand · Bursting Primes · Length Fabric Space · Possibility Collapse", col: TEAL },
          ].map(({ src, label, col }) => (
            <div key={label} style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${col}20` }}>
              <img src={src} alt={label} style={{ width:"100%", display:"block", opacity:0.92 }} />
              <div style={{ padding:"6px 10px", fontFamily:mono, fontSize:8, color:`${col}70`, lineHeight:1.6 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Closing */}
        <div style={{ textAlign:"center", padding:"28px", background:"#ffffff03",
          border:`1px solid ${BLUE}12`, borderRadius:12 }}>
          <div style={{ fontFamily:serif, fontSize:18, color:BLUE, marginBottom:10 }}>
            THE CENTRAL LINE IS NOT A PARTICLE — IT IS AN INFORMATION TRAJECTORY
          </div>
          <div style={{ fontFamily:mono, fontSize:11, color:DIM, lineHeight:2.4 }}>
            dU/dt = α·U − β·D + γ·P  →  branches at primes  →  D{"<"}Dc  →  observe  →  one reality
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:1.9,
            maxWidth:620, margin:"14px auto 0" }}>
            Observation doesn't create reality — it selects it. The branches were always there,
            flowering outward at prime positions in the golden-angle spiral. Decoherence makes them
            independent. The Born rule chooses. What remains is not the collapse of possibility —
            it is the crystallization of one coherent thread from the infinite field of understanding.
          </div>
        </div>
      </div>
    </div>
  );
}

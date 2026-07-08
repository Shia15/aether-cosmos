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

type TabKey = "hubble" | "cmb" | "inflation" | "darkmatter";
type LogEntry = { ts: string; tag: string; msg: string; col: string };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "hubble",     label: "Hubble Constant · Brightness Ladder", sym: "↗", col: C.gold   },
  { key: "cmb",        label: "CMB Power Spectrum · Plug & Predict",  sym: "≈", col: C.cyan   },
  { key: "inflation",  label: "Inflation · Refining Gravity (3·4)",   sym: "∮", col: C.violet },
  { key: "darkmatter", label: "Dark-Matter Halo · N-Body Simulation",  sym: "•", col: C.rose   },
];

type DMParticle = { x: number; y: number; vx: number; vy: number; m: number };

function CosmicRefineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const pts: {ang:number,r:number,phase:number,col:string}[]=[];
    for(let i=0;i<24;i++) pts.push({ ang:i*(Math.PI*2/24), r:60+Math.random()*20, phase:Math.random()*Math.PI*2, col:`hsl(${220+i*6},70%,60%)` });
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      ctx.beginPath();
      pts.forEach((p,i)=>{
        const psi=0.5+0.5*Math.sin(t*0.03+p.phase);
        const r=p.r*(0.8+0.2*psi);
        const x=cx+r*Math.cos(p.ang), y=cy+r*Math.sin(p.ang);
        if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      });
      ctx.closePath();
      ctx.strokeStyle="rgba(46,240,216,0.3)"; ctx.lineWidth=1.5; ctx.stroke();
      pts.forEach(p=>{
        const psi=0.5+0.5*Math.sin(t*0.03+p.phase);
        const r=p.r*(0.8+0.2*psi);
        const x=cx+r*Math.cos(p.ang), y=cy+r*Math.sin(p.ang);
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.shadowColor=p.col; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
      });
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,18);
      g.addColorStop(0,"rgba(46,240,216,0.5)"); g.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("COSMIC REFINE · SPECTRAL ANALYSIS · ELEMENT SYNTHESIS · STELLAR REFINEMENT · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CosmicRefinePage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("hubble");
  const tabRef = useRef<TabKey>("hubble");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // Tab 1 — Hubble + Brightness ladder
  const [H0, setH0] = useState(70);             // km/s/Mpc
  const H0Ref = useRef(H0); useEffect(() => { H0Ref.current = H0; }, [H0]);
  const [bright, setBright] = useState(0.55);    // intrinsic brightness multiplier
  const brightRef = useRef(bright); useEffect(() => { brightRef.current = bright; }, [bright]);
  const [zMax, setZMax] = useState(2.0);         // max redshift shown
  const zMaxRef = useRef(zMax); useEffect(() => { zMaxRef.current = zMax; }, [zMax]);

  // Tab 2 — CMB power spectrum
  const [Ωb, setΩb]     = useState(0.049);       // baryon density
  const ΩbRef = useRef(Ωb); useEffect(() => { ΩbRef.current = Ωb; }, [Ωb]);
  const [Ωdm, setΩdm]   = useState(0.265);       // dark matter
  const ΩdmRef = useRef(Ωdm); useEffect(() => { ΩdmRef.current = Ωdm; }, [Ωdm]);
  const [ΩΛ,  setΩΛ]    = useState(0.686);       // dark energy
  const ΩΛRef = useRef(ΩΛ); useEffect(() => { ΩΛRef.current = ΩΛ; }, [ΩΛ]);
  const [ns,  setNs]    = useState(0.965);       // spectral index
  const nsRef = useRef(ns); useEffect(() => { nsRef.current = ns; }, [ns]);

  // Tab 3 — Inflation · 3 + 4 = 7 (3 generations / 4 forces)
  const [Hinf, setHinf] = useState(0.55);        // inflation scale
  const HinfRef = useRef(Hinf); useEffect(() => { HinfRef.current = Hinf; }, [Hinf]);
  const [Nef,  setNef]  = useState(60);          // e-folds
  const NefRef = useRef(Nef); useEffect(() => { NefRef.current = Nef; }, [Nef]);
  const [eps,  setEps]  = useState(0.012);       // slow-roll ε
  const epsRef = useRef(eps); useEffect(() => { epsRef.current = eps; }, [eps]);

  // Tab 4 — Dark-matter halo
  const [Npart, setNpart] = useState(220);
  const NpartRef = useRef(Npart); useEffect(() => { NpartRef.current = Npart; }, [Npart]);
  const [sigmaV, setSigmaV] = useState(0.45);    // velocity dispersion
  const sigmaRef = useRef(sigmaV); useEffect(() => { sigmaRef.current = sigmaV; }, [sigmaV]);
  const [haloM, setHaloM] = useState(0.55);      // halo mass / virial radius
  const haloRef = useRef(haloM); useEffect(() => { haloRef.current = haloM; }, [haloM]);
  const [running, setRunning] = useState(true);
  const runRef = useRef(running); useEffect(() => { runRef.current = running; }, [running]);

  const [log, setLog] = useState<LogEntry[]>([
    { ts: nowStamp(), tag: "boot", msg: "cosmic-refine · Hubble · CMB · inflation · dark matter", col: C.green },
    { ts: nowStamp(), tag: "init", msg: "H₀ ≈ 70 km/s/Mpc · brightness ladder anchors distance", col: C.gold },
    { ts: nowStamp(), tag: "init", msg: "CMB acoustic peaks · l ≈ 220, 540, 800 · plug Ω, predict positions", col: C.cyan },
    { ts: nowStamp(), tag: "init", msg: "inflation · 60 e-folds · solves flatness + horizon + monopoles + seeds δρ/ρ", col: C.violet },
    { ts: nowStamp(), tag: "init", msg: "dark matter · NFW halo · gravitational clumping · no EM coupling", col: C.rose },
  ]);
  const [ops, setOps] = useState(0);
  function pushLog(tag: string, msg: string, col: string) {
    setLog(L => [{ ts: nowStamp(), tag, msg, col }, ...L].slice(0, 60));
  }
  function bump() { setOps(n => n + 1); }

  const setH0L = (v: number) => { setH0(v); bump(); };
  const setBL  = (v: number) => { setBright(v); bump(); };
  const setZL  = (v: number) => { setZMax(v); bump(); };
  const setΩbL = (v: number) => { setΩb(v); bump(); };
  const setΩdmL = (v: number) => { setΩdm(v); bump(); };
  const setΩΛL = (v: number) => { setΩΛ(v); bump(); };
  const setNsL = (v: number) => { setNs(v); bump(); };
  const setHinfL = (v: number) => { setHinf(v); bump(); };
  const setNefL  = (v: number) => { setNef(Math.max(20, Math.min(120, Math.round(v)))); bump(); };
  const setEpsL  = (v: number) => { setEps(v); bump(); };
  const setNpartL = (v: number) => { setNpart(Math.max(50, Math.min(400, Math.round(v)))); bump(); };
  const setSigmaL = (v: number) => { setSigmaV(v); bump(); };
  const setHaloL  = (v: number) => { setHaloM(v); bump(); };

  function lockPlanck() {
    setΩb(0.049); setΩdm(0.265); setΩΛ(0.686); setNs(0.965); bump();
    pushLog("cmb", "Planck 2018 best-fit locked · Ωb = 0.049, Ωdm = 0.265, ΩΛ = 0.686, n_s = 0.965", C.gold);
  }
  function resetHalo() {
    seedDM();
    pushLog("dm", "halo reseeded · particles re-virialized", C.rose);
  }

  // 4 Hz heartbeat for telemetry sync
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(n => (n + 1) % 1_000_000), 250);
    return () => clearInterval(id);
  }, []);

  const obs = useMemo(() => {
    // 1: Hubble Hubble age ≈ 1/H0 in Gyr units (rough)
    const ageGyr = 977.8 / H0;                           // Hubble age
    const recVel = H0 * (zMax * 1000) / 70;              // proxy v at zMax
    // 2: CMB peak positions ~ l ∝ 1/sqrt(Ω_total) ; l1 ≈ 220 nominal
    const Ωtot = Ωb + Ωdm + ΩΛ;
    const l1 = 220 * Math.sqrt(0.31 / (Ωb + Ωdm)) * (1 + 0.05 * (ns - 0.965));
    const l2 = l1 * 2.45;
    const l3 = l1 * 3.6;
    // 3: inflation
    const aGrowth = Math.exp(Math.min(120, Nef));        // a(end)/a(start)
    const r = 16 * eps;                                  // tensor-to-scalar
    // 4: virial radius proxy
    const Rvir = 0.10 + haloM * 0.3;
    return { ageGyr, recVel, Ωtot, l1, l2, l3, aGrowth, r, Rvir };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [H0, bright, zMax, Ωb, Ωdm, ΩΛ, ns, Hinf, Nef, eps, Npart, sigmaV, haloM, tick]);

  // ====== dark matter N-body buffer ======
  const dmRef = useRef<DMParticle[]>([]);
  function seedDM() {
    const list: DMParticle[] = [];
    const N = NpartRef.current;
    for (let i = 0; i < N; i++) {
      const θ = Math.random() * Math.PI * 2;
      const r = 30 + Math.pow(Math.random(), 0.7) * 220;
      const x = Math.cos(θ) * r;
      const y = Math.sin(θ) * r;
      // approximately tangential velocities (orbital)
      const sp = (0.4 + sigmaRef.current * 0.9) / Math.sqrt(r / 80);
      const vx = -Math.sin(θ) * sp + (Math.random() - 0.5) * sigmaRef.current * 0.5;
      const vy =  Math.cos(θ) * sp + (Math.random() - 0.5) * sigmaRef.current * 0.5;
      list.push({ x, y, vx, vy, m: 1 });
    }
    dmRef.current = list;
  }

  useEffect(() => {
    const _c = cvRef.current; if (!_c) return;
    const _ctx = _c.getContext("2d"); if (!_ctx) return;
    const c: HTMLCanvasElement = _c;
    const ctx: CanvasRenderingContext2D = _ctx;
    let raf = 0;
    let dprFix = 1;
    function resize() {
      const r = c.getBoundingClientRect();
      dprFix = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      c.width = r.width * dprFix;
      c.height = r.height * dprFix;
      ctx.setTransform(dprFix, 0, 0, dprFix, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);
    seedDM();

    function frame() {
      raf = requestAnimationFrame(frame);
      const w = c.width / dprFix, h = c.height / dprFix;
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, w, h);
      const t = performance.now();
      const which = tabRef.current;
      if (which === "hubble") drawHubble(w, h, t);
      else if (which === "cmb") drawCMB(w, h, t);
      else if (which === "inflation") drawInflation(w, h, t);
      else drawDM(w, h, t);
    }

    function drawHubble(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("HUBBLE FLOW · DISTANCE-VELOCITY RELATION · v = H₀ · d · BRIGHTNESS LADDER", 16, 18);

      const padL = 70, padR = 60, padT = 50, padB = 110;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;
      const H = H0Ref.current;
      const B = brightRef.current;
      const Z = zMaxRef.current;

      // axes
      ctx.strokeStyle = C.border2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
      ctx.stroke();

      // axis labels
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText(`distance (Mpc)  →`, padL + plotW / 2, padT + plotH + 22);
      ctx.save();
      ctx.translate(padL - 36, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("recession velocity (× 10³ km/s)", 0, 0);
      ctx.restore();

      // Hubble line v = H · d
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(padL, padT + plotH);
      ctx.lineTo(padL + plotW, padT + plotH - plotH * (H / 100) * 0.9);
      ctx.stroke();

      // brightness scatter — 4 ladder rungs (parallax → cepheid → SN Ia → hubble)
      const rungs = [
        { dPct: 0.05, col: C.cyan,   name: "parallax"   },
        { dPct: 0.20, col: C.green,  name: "cepheid"    },
        { dPct: 0.55, col: C.amber,  name: "SN Ia"      },
        { dPct: 0.90, col: C.violet, name: "hubble"     },
      ];
      for (const r of rungs) {
        const N = 18;
        for (let i = 0; i < N; i++) {
          const dx = r.dPct * plotW + (i - N / 2) * 4 + (Math.random() - 0.5) * 6;
          const v  = (dx / plotW) * 100 * (H / 100) * 0.9 * plotH / 100 * 100;
          const dy = padT + plotH - v / 100 * plotH;
          // brightness sets dot size
          const dot = 0.8 + B * 2.4;
          ctx.fillStyle = r.col;
          ctx.beginPath(); ctx.arc(padL + dx, dy + (Math.random() - 0.5) * 8, dot, 0, Math.PI * 2); ctx.fill();
        }
        ctx.fillStyle = r.col;
        ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
        ctx.textAlign = "center";
        ctx.fillText(r.name, padL + r.dPct * plotW, padT - 6);
      }

      // animated cepheid pulsation
      const pulse = 0.5 + 0.5 * Math.sin(t / 700);
      ctx.fillStyle = `rgba(110,200,122,${(0.4 + 0.5 * pulse).toFixed(3)})`;
      ctx.beginPath(); ctx.arc(padL + 0.20 * plotW, padT - 18, 4 + 3 * pulse, 0, Math.PI * 2); ctx.fill();

      // readouts
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`H₀ = ${H.toFixed(1)} km/s/Mpc   ·   intrinsic brightness = ${B.toFixed(2)}   ·   z_max shown = ${Z.toFixed(2)}`, 16, h - 78);
      ctx.fillStyle = C.gold;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`Hubble age ≈ ${(977.8 / H).toFixed(2)} Gyr   ·   v(d=100 Mpc) ≈ ${(H * 100).toFixed(0)} km/s`, 16, h - 60);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("standardised brightness anchors each rung — parallax → cepheid → SN Ia → hubble flow", w - 16, h - 14);
    }

    function drawCMB(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("CMB ANGULAR POWER SPECTRUM · l × C_l · PLUG Ωᵦ, Ω_dm, Ω_Λ, n_s → PREDICT PEAKS", 16, 18);

      const padL = 70, padR = 60, padT = 50, padB = 110;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // axes
      ctx.strokeStyle = C.border2;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
      ctx.stroke();

      // labels
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("multipole l  →", padL + plotW / 2, padT + plotH + 22);
      ctx.save();
      ctx.translate(padL - 36, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("l(l+1) C_l / 2π   (μK²)", 0, 0);
      ctx.restore();

      // x ticks
      ctx.fillStyle = C.muted;
      ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "center";
      [10, 100, 500, 1000, 2000, 3000].forEach(lt => {
        const x = padL + (Math.log10(lt) / Math.log10(3000)) * plotW;
        ctx.fillStyle = C.muted;
        ctx.fillText(`${lt}`, x, padT + plotH + 12);
        ctx.strokeStyle = "rgba(232,200,120,0.05)";
        ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();
      });

      // peaks influenced by Ω_b, Ω_dm, Ω_Λ
      const Ωb_ = ΩbRef.current;
      const Ωdm_ = ΩdmRef.current;
      const ΩΛ_  = ΩΛRef.current;
      const ns_  = nsRef.current;
      const l1 = 220 * Math.sqrt(0.31 / (Ωb_ + Ωdm_)) * (1 + 0.05 * (ns_ - 0.965));
      const peakLs = [l1, l1 * 2.45, l1 * 3.6, l1 * 4.7];
      const peakAmpl = [
        1.0,
        0.55 + Ωb_ * 4.0,           // 2nd peak suppressed by baryons
        0.40 + Ωdm_ * 0.4,
        0.25,
      ];

      // draw spectrum
      ctx.strokeStyle = C.cyan;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const Nx = 240;
      for (let i = 0; i <= Nx; i++) {
        const u = i / Nx;
        const l = Math.pow(10, u * Math.log10(3000));
        // Sachs-Wolfe rise + acoustic peaks (gaussian sum)
        let val = 0.20 * Math.pow(l / 30, ns_ - 1) * Math.exp(-l / 12);  // SW plateau
        for (let p = 0; p < peakLs.length; p++) {
          val += peakAmpl[p] * Math.exp(-Math.pow((l - peakLs[p]) / (60 + p * 30), 2));
        }
        // damping tail
        val *= Math.exp(-Math.pow(l / 1700, 2));
        const x = padL + u * plotW;
        const y = padT + plotH - val * plotH * 0.85;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // mark predicted peaks
      peakLs.forEach((lp, i) => {
        if (lp > 3000) return;
        const x = padL + (Math.log10(lp) / Math.log10(3000)) * plotW;
        const y = padT + plotH - peakAmpl[i] * plotH * 0.85;
        ctx.strokeStyle = C.gold;
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, padT + plotH); ctx.stroke();
        ctx.fillStyle = C.gold;
        ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(`l${i + 1} = ${lp.toFixed(0)}`, x, y - 6);
      });

      // readouts
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText(`Ωb = ${Ωb_.toFixed(3)}   ·   Ω_dm = ${Ωdm_.toFixed(3)}   ·   Ω_Λ = ${ΩΛ_.toFixed(3)}   ·   n_s = ${ns_.toFixed(3)}`, 16, h - 78);
      const Ωtot = Ωb_ + Ωdm_ + ΩΛ_;
      const flatCol = Math.abs(Ωtot - 1) < 0.02 ? C.green : Math.abs(Ωtot - 1) < 0.06 ? C.gold : C.amber;
      ctx.fillStyle = flatCol;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`Ω_total = ${Ωtot.toFixed(3)}   (universe is ${Math.abs(Ωtot - 1) < 0.02 ? "FLAT" : Ωtot > 1 ? "closed" : "open"})`, 16, h - 60);
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("first peak l₁ ≈ 220 anchors curvature · 2nd-peak ratio constrains Ω_b · damping tail constrains n_s", w - 16, h - 14);
    }

    function drawInflation(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("INFLATION · 60 E-FOLDS · DIMENSIONS 3+1   ·   FORCES 4 (gravity · EM · strong · weak)", 16, 18);

      const Hi = HinfRef.current;
      const N = NefRef.current;
      const ε = epsRef.current;
      const padL = 70, padR = 60, padT = 50, padB = 130;
      const plotW = w - padL - padR;
      const plotH = h - padT - padB;

      // axes — log a vs Ne
      ctx.strokeStyle = C.border2;
      ctx.beginPath();
      ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
      ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("e-folds  N  →", padL + plotW / 2, padT + plotH + 22);
      ctx.save();
      ctx.translate(padL - 36, padT + plotH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("log a(t)  →", 0, 0);
      ctx.restore();

      // exponential expansion curve with slow-roll fall-off
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      const Nx = 200;
      for (let i = 0; i <= Nx; i++) {
        const u = i / Nx;
        const Ni = u * 120;            // x axis: 0..120 e-folds
        const a = Hi * Ni * (1 - ε * Ni / 120);
        const x = padL + u * plotW;
        const y = padT + plotH - (a / 80) * plotH;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // mark requested e-folds
      const xN = padL + (N / 120) * plotW;
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(xN, padT); ctx.lineTo(xN, padT + plotH); ctx.stroke();
      ctx.fillStyle = C.gold;
      ctx.font = "9px JetBrains Mono, ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillText(`N = ${N}`, xN, padT - 6);

      // 60 e-folds marker
      const x60 = padL + (60 / 120) * plotW;
      ctx.strokeStyle = "rgba(110,200,122,0.5)";
      ctx.beginPath(); ctx.moveTo(x60, padT); ctx.lineTo(x60, padT + plotH); ctx.stroke();
      ctx.fillStyle = C.green;
      ctx.fillText("60 (flatness)", x60, padT - 6);

      // factors of 3 & 4 panel — 3 generations × 4 forces
      const px = padL, py = padT + plotH + 36;
      ctx.fillStyle = C.muted;
      ctx.font = "10px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("STANDARD-MODEL FACTS COSMOLOGY MUST REMAIN CONSISTENT WITH (not derived from inflation):", px, py);
      // 3 generations
      ctx.fillStyle = C.cyan;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("3 fermion generations", px, py + 18);
      ["I", "II", "III"].forEach((g, i) => {
        ctx.fillStyle = C.cyan;
        ctx.beginPath(); ctx.arc(px + 180 + i * 30, py + 14, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.bg;
        ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(g, px + 180 + i * 30, py + 17);
      });
      // 4 forces
      ctx.textAlign = "left";
      ctx.fillStyle = C.violet;
      ctx.font = "11px Cinzel, ui-serif, Georgia, serif";
      ctx.fillText("4 fundamental forces", px + 320, py + 18);
      ["G", "γ", "g", "W"].forEach((f, i) => {
        ctx.fillStyle = C.violet;
        ctx.beginPath(); ctx.arc(px + 470 + i * 30, py + 14, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.bg;
        ctx.font = "8px JetBrains Mono, ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillText(f, px + 470 + i * 30, py + 17);
      });

      // readouts
      ctx.textAlign = "left";
      ctx.fillStyle = C.gold;
      ctx.font = "12px JetBrains Mono, ui-monospace, monospace";
      ctx.fillText(`a(end)/a(start) ≈ e^${N} ≈ 10^${(N / 2.303).toFixed(0)}    r = 16ε = ${(16 * ε).toFixed(4)}`, px, h - 14);
    }

    function drawDM(w: number, h: number, t: number) {
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText("DARK-MATTER HALO · N-BODY · GRAVITATIONAL CLUMPING · NO EM COUPLING", 16, 18);

      const cx = w / 2, cy = h / 2 - 30;
      const G = 0.18 + haloRef.current * 0.25;
      const list = dmRef.current;

      // step the simulation
      if (runRef.current) {
        for (const p of list) {
          const dx = -p.x;
          const dy = -p.y;
          const r2 = dx * dx + dy * dy + 200;     // softened
          const inv = 1 / Math.sqrt(r2);
          const a = G * inv * inv * inv * 200;    // pull toward centre
          p.vx += dx * a;
          p.vy += dy * a;
          // mild damping (mimics dynamical friction)
          p.vx *= 0.999; p.vy *= 0.999;
          p.x += p.vx;
          p.y += p.vy;
        }
      }

      // density background — radial gradient
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 280);
      grad.addColorStop(0, "rgba(224,104,120,0.15)");
      grad.addColorStop(0.5, "rgba(200,144,232,0.06)");
      grad.addColorStop(1, "rgba(232,200,120,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(cx - 280, cy - 280, 560, 560);

      // particles
      for (const p of list) {
        const r = Math.hypot(p.x, p.y);
        const col = r < 60 ? C.gold : r < 140 ? C.violet : C.rose;
        ctx.fillStyle = `${col}aa`;
        ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 1.2, 0, Math.PI * 2); ctx.fill();
      }

      // central dot — galactic centre
      ctx.fillStyle = C.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx.fill();

      // virial radius circle
      const Rvir = 60 + haloRef.current * 200;
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.arc(cx, cy, Rvir, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.gold;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText("R_vir", cx + Rvir + 18, cy);

      // density profile mini-plot bottom
      const histX = 60, histY = h - 100, histW = 320, histH = 60;
      ctx.strokeStyle = C.border2;
      ctx.strokeRect(histX, histY, histW, histH);
      // bin radial density
      const Nb = 24;
      const bins = new Array(Nb).fill(0);
      const Rmax = 280;
      for (const p of list) {
        const rr = Math.hypot(p.x, p.y);
        const idx = Math.min(Nb - 1, Math.floor((rr / Rmax) * Nb));
        bins[idx]++;
      }
      const maxB = Math.max(1, ...bins);
      for (let i = 0; i < Nb; i++) {
        const x = histX + i * (histW / Nb);
        const bh = (bins[i] / maxB) * histH * 0.95;
        ctx.fillStyle = i < 4 ? C.gold : i < 10 ? C.violet : C.rose;
        ctx.fillRect(x + 1, histY + histH - bh, histW / Nb - 2, bh);
      }
      ctx.fillStyle = C.muted;
      ctx.font = "9px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "left";
      ctx.fillText("density profile · ρ(r) ~ NFW", histX, histY - 4);
      ctx.textAlign = "right";
      ctx.fillText(`N = ${list.length} particles  ·  σ_v = ${sigmaRef.current.toFixed(2)}  ·  M_halo = ${haloRef.current.toFixed(2)}`, histX + histW, histY - 4);

      // bottom note
      ctx.fillStyle = C.muted;
      ctx.font = "8px Cinzel, ui-serif, Georgia, serif";
      ctx.textAlign = "right";
      ctx.fillText("bright systems trace the wells dark matter has dug — galaxies sit inside DM halos", w - 16, h - 14);
    }

    frame();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // re-seed dark matter when N or σ changes
  useEffect(() => {
    if (tabRef.current === "darkmatter") seedDM();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Npart, sigmaV]);

  return (
    <div className="min-h-screen px-8 py-6" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      <div className="mb-5">
        <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.muted }}>
          aether · cosmology refinement · hubble · CMB · inflation · dark matter
        </div>
        <h1 className="text-[34px] mt-1" style={{ color: C.white, letterSpacing: "0.02em" }}>
          Cosmic Refine · <span style={{ color: C.gold }}>Hubble · CMB · Inflation · Dark Matter</span>
        </h1>
        <p className="text-[13px] mt-2 max-w-3xl" style={{ color: C.text }}>
          Refine gravity by feeding in what we already measure: the <span style={{ color: C.gold }}>Hubble constant H₀</span> from the brightness ladder
          (parallax → cepheid → type-Ia supernova → hubble flow), the <span style={{ color: C.cyan }}>CMB acoustic-peak spectrum</span> (plug Ωb, Ω_dm and n_s and predict
          where the peaks land — Ω_Λ then closes the budget to flat Ω_total = 1), the <span style={{ color: C.violet }}>inflationary 60 e-folds</span> that flattened the universe, washed out monopoles
          and stretched quantum fluctuations into the seeds of structure, and finally a live <span style={{ color: C.rose }}>dark-matter N-body halo</span> that shows the gravitational wells luminous
          matter falls into. <span style={{ color: C.cyan }}>3+1</span> spacetime dimensions, <span style={{ color: C.cyan }}>3</span> fermion generations and <span style={{ color: C.violet }}>4</span> fundamental
          forces are Standard-Model facts the cosmology has to remain consistent with — they are not consequences of inflation. The brightness of every system traces the wells dark matter has dug.
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap" data-testid="cr-tabs">
        {TABS.map(T => {
          const active = tab === T.key;
          return (
            <button key={T.key} onClick={() => { setTab(T.key); pushLog("tab", `→ ${T.label}`, T.col); }}
              data-testid={`tab-${T.key}`} aria-pressed={active}
              aria-label={`Switch to ${T.label}`}
              className="px-4 py-2 text-[11px] tracking-[0.2em] uppercase border"
              style={{
                borderColor: active ? T.col : C.border,
                background:  active ? `${T.col}14` : "transparent",
                color:       active ? T.col : C.text,
                fontFamily:  "Cinzel, ui-serif, Georgia, serif",
              }}>
              <span className="mr-2">{T.sym}</span>{T.label}
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
                ops: <span style={{ color: C.gold }}>{ops}</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="cr-canvas" style={{ width: "100%", height: 520, display: "block" }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              className="mt-5 border p-5" style={{ borderColor: C.border, background: C.panel }}>

              {tab === "hubble" && (
                <>
                  <Title col={C.gold}>Hubble constant — distance ladder anchored by brightness</Title>
                  <Body>
                    Each rung of the cosmological distance ladder uses a standardised brightness — geometric parallax for nearby stars, period-luminosity for cepheid variables,
                    standardisable peak luminosity for type-Ia supernovae, and finally the Hubble flow itself. The slope <span style={{ color: C.gold }}>H₀</span> connects recession velocity
                    to distance: <span style={{ color: C.gold }}>v = H₀ · d</span>. Slide H₀ around 67–73 km/s/Mpc and watch the inferred age of the universe move with it.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="H0"     label="H₀ (km/s/Mpc)"        value={H0}     min={50}   max={90}  step={0.1}  col={C.gold}   fmt={v => v.toFixed(1)} onChange={setH0L} />
                    <Slider id="bright" label="brightness intensity" value={bright} min={0.0}  max={1.0} step={0.01} col={C.cyan}   fmt={v => v.toFixed(2)} onChange={setBL} />
                    <Slider id="zmax"   label="z_max shown"           value={zMax}   min={0.1}  max={4.0} step={0.05} col={C.violet} fmt={v => v.toFixed(2)} onChange={setZL} />
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="H₀"          v={`${H0.toFixed(1)} km/s/Mpc`}   c={C.gold}   />
                    <Stat k="Hubble age"  v={`${obs.ageGyr.toFixed(2)} Gyr`} c={C.cyan}   />
                    <Stat k="z_max"       v={zMax.toFixed(2)}                c={C.violet} />
                    <Stat k="rungs"       v="4 (px·cep·Ia·flow)"             c={C.amber}  />
                  </div>
                </>
              )}

              {tab === "cmb" && (
                <>
                  <Title col={C.cyan}>CMB power spectrum — plug parameters in, predict the peaks</Title>
                  <Body>
                    The acoustic peaks of the cosmic microwave background carry the imprint of baryon-photon oscillations at recombination. The <span style={{ color: C.gold }}>first peak</span>
                    at ℓ ≈ 220 anchors curvature; the <span style={{ color: C.cyan }}>2nd-to-1st ratio</span> constrains the baryon density Ω_b; the damping tail constrains the spectral index n_s.
                    The toy predictor below uses Ωb + Ωdm + n_s for peak positions; <span style={{ color: C.gold }}>Ω_Λ</span> only enters via the flatness sum Ω_total = 1.
                    Plug values in — or lock the Planck 2018 best fit — and watch the predicted peaks slide along the curve.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Slider id="omegaB"  label="Ωb (baryons)"     value={Ωb}  min={0.01} max={0.10} step={0.001} col={C.amber}  fmt={v => v.toFixed(3)} onChange={setΩbL} />
                    <Slider id="omegaDM" label="Ω_dm (cold DM)"   value={Ωdm} min={0.10} max={0.50} step={0.001} col={C.violet} fmt={v => v.toFixed(3)} onChange={setΩdmL} />
                    <Slider id="omegaL"  label="Ω_Λ (dark E)"     value={ΩΛ}  min={0.30} max={0.85} step={0.001} col={C.gold}   fmt={v => v.toFixed(3)} onChange={setΩΛL} />
                    <Slider id="ns"      label="n_s (spec index)"  value={ns}  min={0.85} max={1.05} step={0.001} col={C.cyan}   fmt={v => v.toFixed(3)} onChange={setNsL} />
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={lockPlanck} data-testid="btn-lock-planck"
                      aria-label="Lock Planck 2018 best-fit parameters"
                      className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                      style={{ borderColor: C.border2, color: C.gold }}>lock planck 2018</button>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="l₁"          v={obs.l1.toFixed(0)}                                        c={C.gold} />
                    <Stat k="l₂"          v={obs.l2.toFixed(0)}                                        c={C.cyan} />
                    <Stat k="l₃"          v={obs.l3.toFixed(0)}                                        c={C.violet} />
                    <Stat k="Ω_total"     v={obs.Ωtot.toFixed(3)}                                      c={Math.abs(obs.Ωtot - 1) < 0.02 ? C.green : C.amber} />
                  </div>
                </>
              )}

              {tab === "inflation" && (
                <>
                  <Title col={C.violet}>Inflation — refining gravity with 60 e-folds</Title>
                  <Body>
                    A burst of exponential expansion in the first ~10⁻³² s does four things: flatten the spatial geometry, solve the horizon problem, dilute relic monopoles, and stretch
                    microscopic quantum fluctuations into the seeds of all later structure. <span style={{ color: C.gold }}>~60 e-folds</span> is the minimum needed to flatten the observable universe.
                    The <span style={{ color: C.cyan }}>3 + 1</span> spacetime dimensions, <span style={{ color: C.cyan }}>3</span> fermion generations and <span style={{ color: C.violet }}>4</span> fundamental forces
                    shown alongside are Standard-Model facts that the post-inflationary cosmology has to remain consistent with — inflation does not derive them.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                    <Slider id="hinf" label="H_inflation"  value={Hinf} min={0.1} max={1.0}  step={0.01}  col={C.violet} fmt={v => v.toFixed(2)} onChange={setHinfL} />
                    <Slider id="nef"  label="e-folds N"    value={Nef}  min={20}  max={120}  step={1}     col={C.gold}   fmt={v => `${Math.round(v)}`} onChange={setNefL} />
                    <Slider id="eps"  label="slow-roll ε"  value={eps}  min={0.001} max={0.1} step={0.001} col={C.cyan}   fmt={v => v.toFixed(3)} onChange={setEpsL} />
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="e-folds"     v={`${Nef}`}                                          c={C.gold}   />
                    <Stat k="growth a"    v={`e^${Nef} ≈ 10^${(Nef / 2.303).toFixed(0)}`}        c={C.violet} />
                    <Stat k="r = 16ε"     v={(16 * eps).toFixed(4)}                              c={C.cyan}   />
                    <Stat k="dim · forces" v="3+1   ·   4"                                       c={C.amber}  />
                  </div>
                </>
              )}

              {tab === "darkmatter" && (
                <>
                  <Title col={C.rose}>Dark-matter halo — the gravitational well luminous matter falls into</Title>
                  <Body>
                    Dark matter does not couple to light, so we see only its gravity. A live N-body sketch shows particles attracted to a softened central potential, settling into an
                    NFW-like <span style={{ color: C.gold }}>density profile</span> with most of the mass inside the virial radius. Galaxies and clusters trace these wells — the brighter
                    the system, the deeper the well it sits in.
                  </Body>
                  <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Slider id="npart"  label="N particles"           value={Npart}    min={50}   max={400}  step={10}    col={C.cyan}   fmt={v => `${Math.round(v)}`} onChange={setNpartL} />
                    <Slider id="sigmav" label="σ_v (vel dispersion)"  value={sigmaV}   min={0.05} max={1.0}  step={0.01}  col={C.violet} fmt={v => v.toFixed(2)} onChange={setSigmaL} />
                    <Slider id="halo"   label="halo mass / R_vir"     value={haloM}    min={0.1}  max={1.0}  step={0.01}  col={C.gold}   fmt={v => v.toFixed(2)} onChange={setHaloL} />
                    <div className="flex flex-col justify-end">
                      <div className="flex gap-2">
                        <button onClick={() => { setRunning(r => !r); pushLog("dm", running ? "halo paused" : "halo running", C.rose); }}
                          data-testid="btn-dm-toggle" aria-pressed={running}
                          aria-label="Pause or run halo simulation"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: running ? C.rose : C.text }}>
                          {running ? "■ pause" : "▶ run"}
                        </button>
                        <button onClick={resetHalo} data-testid="btn-dm-reset"
                          aria-label="Reseed halo"
                          className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border"
                          style={{ borderColor: C.border2, color: C.muted }}>reseed</button>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
                    <Stat k="N"          v={`${Npart}`}                              c={C.cyan}   />
                    <Stat k="σ_v"        v={sigmaV.toFixed(2)}                       c={C.violet} />
                    <Stat k="R_vir"      v={obs.Rvir.toFixed(2)}                     c={C.gold}   />
                    <Stat k="state"      v={running ? "running" : "paused"}          c={running ? C.rose : C.muted} />
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-5 border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>cosmological phenomena</div>
            <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}>
              <Bar label="H₀ position"        val={(H0 - 50) / 40}                   c={C.gold}   />
              <Bar label="Ω_total → 1 (flat)" val={1 - Math.min(1, Math.abs(obs.Ωtot - 1) * 5)} c={C.cyan}   />
              <Bar label="inflation e-folds"  val={Math.min(1, Nef / 80)}             c={C.violet} />
              <Bar label="dark matter halo"   val={haloM}                             c={C.rose}   />
            </div>
          </div>
        </div>

        <aside className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
          <div className="text-[10px] tracking-[0.3em] uppercase mb-3" style={{ color: C.muted }}>telemetry</div>
          <div className="space-y-2 text-[11px]" style={{ fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
            <Row k="active workbench" v={TABS.find(t => t.key === tab)!.label} c={TABS.find(t => t.key === tab)!.col} />
            <Row k="H₀"            v={`${H0.toFixed(1)} km/s/Mpc`}            c={C.gold} />
            <Row k="Hubble age"    v={`${obs.ageGyr.toFixed(2)} Gyr`}         c={C.cyan} />
            <Row k="brightness"    v={bright.toFixed(2)}                       c={C.amber} />
            <Row k="Ωb"            v={Ωb.toFixed(3)}                           c={C.amber} />
            <Row k="Ω_dm"          v={Ωdm.toFixed(3)}                          c={C.violet} />
            <Row k="Ω_Λ"           v={ΩΛ.toFixed(3)}                           c={C.gold} />
            <Row k="n_s"           v={ns.toFixed(3)}                            c={C.cyan} />
            <Row k="Ω_total"       v={obs.Ωtot.toFixed(3)}                      c={Math.abs(obs.Ωtot - 1) < 0.02 ? C.green : C.amber} />
            <Row k="l₁ (CMB peak)" v={obs.l1.toFixed(0)}                       c={C.gold} />
            <Row k="N e-folds"     v={`${Nef}`}                                c={C.violet} />
            <Row k="r = 16ε"       v={(16 * eps).toFixed(4)}                    c={C.cyan} />
            <Row k="DM N"          v={`${Npart}`}                              c={C.cyan} />
            <Row k="DM σ_v"        v={sigmaV.toFixed(2)}                        c={C.violet} />
            <Row k="ops"           v={`${ops}`}                                c={C.gold} />
          </div>
          <div className="mt-5 border-t pt-4" style={{ borderColor: C.border }}>
            <div className="text-[10px] tracking-[0.3em] uppercase mb-2" style={{ color: C.muted }}>thesis</div>
            <div className="text-[10.5px] leading-relaxed" style={{ color: C.text }}>
              <p>Refine gravity by feeding the model what we already measure: <span style={{ color: C.gold }}>H₀</span>, <span style={{ color: C.cyan }}>CMB peaks</span>, <span style={{ color: C.violet }}>inflationary e-folds</span>, <span style={{ color: C.rose }}>halo dynamics</span>.</p>
              <p className="mt-2">Brightness is the thread — every rung of the distance ladder, every CMB temperature fluctuation, every galaxy luminosity hangs off it.</p>
            </div>
          </div>
        </aside>
      </div>

      <div className="mt-6 border" style={{ borderColor: C.border, background: C.panel }}>
        <div className="px-4 py-2 text-[10px] tracking-[0.3em] uppercase border-b" style={{ color: C.muted, borderColor: C.border }}>
          event log
        </div>
        <div className="px-4 py-3 max-h-48 overflow-y-auto text-[11px] font-mono" data-testid="event-log">
          {log.map((L, i) => (
            <div key={i} className="flex gap-3">
              <span style={{ color: C.muted }}>{L.ts}</span>
              <span style={{ color: L.col, minWidth: 80 }}>[{L.tag}]</span>
              <span style={{ color: C.text }}>{L.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function nowStamp() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}
function Title({ children, col }: { children: React.ReactNode; col: string }) {
  return <div className="text-[14px] tracking-[0.05em] mb-2" style={{ color: col, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>{children}</div>;
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
  const v = Math.max(0, Math.min(1, val));
  return (
    <div>
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v.toFixed(2)}</span>
      </div>
      <div className="h-[3px]" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div className="h-full" style={{ width: `${v * 100}%`, background: c }} />
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

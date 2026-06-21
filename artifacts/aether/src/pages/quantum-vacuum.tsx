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

type TabKey = "ab" | "vectorA" | "casimir" | "pais";
type LogEntry = { ts: string; tag: string; msg: string; col: string; };

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "ab",      label: "Aharonov-Bohm",        sym: "⊙", col: C.gold },
  { key: "vectorA", label: "Vector Potential A",   sym: "↻", col: C.cyan },
  { key: "casimir", label: "Casimir · Vacuum",     sym: "‖‖", col: C.green },
  { key: "pais",    label: "Pais · Room-T SC",     sym: "≈", col: C.violet },
];

function QuantumVacuumHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const bubbles: {x:number;y:number;r:number;life:number;maxLife:number}[]=[];
    const spawn=()=>{bubbles.push({x:Math.random()*W,y:H,r:2+Math.random()*8,life:0,maxLife:60+Math.random()*40});};
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      if(t%12===0) spawn();
      for(let i=bubbles.length-1;i>=0;i--){
        const b=bubbles[i]; b.life++; b.y-=0.8; b.r*=0.998;
        if(b.life>b.maxLife){bubbles.splice(i,1);continue;}
        const alpha=1-b.life/b.maxLife;
        ctx.beginPath();ctx.arc(b.x,b.y,b.r,0,Math.PI*2);ctx.strokeStyle=`rgba(153,102,255,${alpha*0.6})`;ctx.lineWidth=0.6;ctx.stroke();
        ctx.beginPath();ctx.arc(b.x,b.y,b.r*0.3,0,Math.PI*2);ctx.fillStyle=`rgba(153,102,255,${alpha*0.15})`;ctx.fill();
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("QUANTUM VACUUM · ZERO POINT FIELD · VIRTUAL PARTICLES · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function QuantumVacuumPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("ab");
  const tabRef = useRef<TabKey>("ab");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // ==== AB controls (flux in units of flux quantum Φ₀ = h/e) ====
  const [flux, setFlux] = useState(0.5);
  const fluxRef = useRef(flux); useEffect(() => { fluxRef.current = flux; }, [flux]);
  const [coherence, setCoherence] = useState(0.95);
  const cohRef = useRef(coherence); useEffect(() => { cohRef.current = coherence; }, [coherence]);

  // ==== Vector A controls ====
  const [solR, setSolR] = useState(40);              // solenoid radius (px)
  const solRRef = useRef(solR); useEffect(() => { solRRef.current = solR; }, [solR]);
  const [Bin, setBin] = useState(0.7);               // internal B (normalised)
  const BinRef = useRef(Bin); useEffect(() => { BinRef.current = Bin; }, [Bin]);

  // ==== Casimir controls (plate separation d in microns) ====
  const [d, setD] = useState(1.0);
  const dRef = useRef(d); useEffect(() => { dRef.current = d; }, [d]);
  const [plateA, setPlateA] = useState(1.0);         // plate area cm²
  const plateARef = useRef(plateA); useEffect(() => { plateARef.current = plateA; }, [plateA]);

  // ==== Pais controls ====
  const [omega, setOmega] = useState(1.4);           // vibration freq (THz, normalised)
  const omegaRef = useRef(omega); useEffect(() => { omegaRef.current = omega; }, [omega]);
  const [resPeak, setResPeak] = useState(1.5);       // resonance frequency
  const resRef = useRef(resPeak); useEffect(() => { resRef.current = resPeak; }, [resPeak]);
  const [width, setWidth] = useState(0.4);           // resonance width
  const widthRef = useRef(width); useEffect(() => { widthRef.current = width; }, [width]);

  // ==== Log + ops ====
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [ops, setOps] = useState(0);
  const [coh, setCoh] = useState(0.42);
  function pushLog(tag: string, msg: string, col: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setEvents(e => [{ ts, tag, msg, col }, ...e].slice(0, 24));
    setOps(o => o + 1);
    setCoh(c => Math.min(0.99, c + 0.03 * (1 - c)));
  }

  // ==== Derived observables ====
  const obs = useMemo(() => {
    // AB: phase shift Δφ = 2π · (Φ/Φ₀)
    const dPhi = 2 * Math.PI * flux;
    // contrast: visibility of fringes
    const visibility = coherence;
    // Casimir: F/A = -π² ℏ c / (240 d⁴)  (in SI, gives Pa)
    // ℏc ≈ 3.16e-26 J·m
    const dM = d * 1e-6;
    const FperA = (Math.PI * Math.PI * 3.16e-26) / (240 * Math.pow(dM, 4));   // N/m²
    const F = FperA * (plateA * 1e-4);                                         // N (plate area cm² → m²)
    // Pais: speculative Tc(ω) = Tc_max · exp(-(ω-ωr)² / 2σ²)
    const Tc = 320 * Math.exp(-Math.pow(omega - resPeak, 2) / (2 * width * width));
    return { dPhi, visibility, FperA, F, Tc };
  }, [flux, coherence, d, plateA, omega, resPeak, width]);

  // ==== Canvas ====
  useEffect(() => {
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    let phase = 0;
    let electrons: { t: number; path: 0 | 1 }[] = [];

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

    function spawnElectron() {
      electrons.push({ t: 0, path: Math.random() < 0.5 ? 0 : 1 });
    }
    const ev = setInterval(spawnElectron, 120);

    function draw() {
      if (!c || !ctx) return;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      // bg grid
      ctx.strokeStyle = "rgba(232,200,120,0.05)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const t = tabRef.current;
      if (t === "ab")           drawAB(ctx, w, h, phase);
      else if (t === "vectorA") drawVectorA(ctx, w, h, phase);
      else if (t === "casimir") drawCasimir(ctx, w, h, phase);
      else if (t === "pais")    drawPais(ctx, w, h, phase);

      phase += 0.016;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function drawAB(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      const cy = h / 2;
      const xSrc = 60, xSplit = 180, xRecomb = w - 220, xDet = w - 60;
      const yUpper = cy - 80, yLower = cy + 80;
      const flux = fluxRef.current;
      const vis = cohRef.current;

      // beam paths
      ctx.strokeStyle = "rgba(232,200,120,0.4)";
      ctx.lineWidth = 1;
      // splitter
      ctx.beginPath(); ctx.moveTo(xSrc, cy); ctx.lineTo(xSplit, cy); ctx.stroke();
      // upper arm
      ctx.beginPath();
      ctx.moveTo(xSplit, cy); ctx.lineTo(xSplit + 40, yUpper);
      ctx.lineTo(xRecomb - 40, yUpper);
      ctx.lineTo(xRecomb, cy);
      ctx.stroke();
      // lower arm
      ctx.beginPath();
      ctx.moveTo(xSplit, cy); ctx.lineTo(xSplit + 40, yLower);
      ctx.lineTo(xRecomb - 40, yLower);
      ctx.lineTo(xRecomb, cy);
      ctx.stroke();
      // recomb to detector
      ctx.beginPath(); ctx.moveTo(xRecomb, cy); ctx.lineTo(xDet, cy); ctx.stroke();

      // solenoid (between paths) — B is INSIDE only
      const sx = (xSplit + xRecomb) / 2, sy = cy, sr = 26;
      ctx.fillStyle = "rgba(200,144,232,0.18)";
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // dot indicating B coming out of page
      ctx.fillStyle = C.violet;
      for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) {
        const dx = (i - 1) * 10, dy = (j - 1) * 10;
        if (Math.hypot(dx, dy) < sr - 8) {
          ctx.beginPath(); ctx.arc(sx + dx, sy + dy, 1.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = C.violet; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText(`Φ = ${flux.toFixed(2)} Φ₀`, sx - 36, sy - sr - 8);
      ctx.fillStyle = C.muted;
      ctx.fillText("B inside · zero outside", sx - 60, sy + sr + 14);

      // electrons travel
      electrons = electrons.filter(e => e.t < 1.05);
      for (const e of electrons) {
        e.t += 0.012;
        const t = e.t;
        let ex = 0, ey = 0;
        if (t < 0.18) {
          const u = t / 0.18; ex = xSrc + u * (xSplit - xSrc); ey = cy;
        } else if (t < 0.85) {
          const u = (t - 0.18) / 0.67;
          // path through arm
          const yArm = e.path === 0 ? yUpper : yLower;
          if (u < 0.1) { ex = xSplit + (u / 0.1) * 40; ey = cy + (u / 0.1) * (yArm - cy); }
          else if (u < 0.9) { const v = (u - 0.1) / 0.8; ex = xSplit + 40 + v * (xRecomb - xSplit - 80); ey = yArm; }
          else { const v = (u - 0.9) / 0.1; ex = xRecomb - 40 + v * 40; ey = yArm + v * (cy - yArm); }
        } else {
          const u = (t - 0.85) / 0.2;
          ex = xRecomb + u * (xDet - xRecomb); ey = cy;
        }
        const col = e.path === 0 ? C.gold : C.cyan;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(ex, ey, 3, 0, Math.PI * 2); ctx.fill();
      }

      // detector — interference fringes I(y) = ½(1 + V·cos(2π·flux + 2π·y/L))
      const detH = 120;
      const detY0 = cy - detH / 2;
      ctx.strokeStyle = C.muted; ctx.lineWidth = 1;
      ctx.strokeRect(xDet - 4, detY0, 30, detH);
      for (let yy = 0; yy < detH; yy++) {
        const arg = 2 * Math.PI * flux + (yy / detH - 0.5) * 8 * Math.PI;
        const I = 0.5 * (1 + vis * Math.cos(arg));
        ctx.fillStyle = `rgba(232,200,120,${I})`;
        ctx.fillRect(xDet - 4, detY0 + yy, 30, 1);
      }
      ctx.fillStyle = C.gold; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("Δφ = 2π · (Φ/Φ₀)", xDet - 130, detY0 - 8);
      ctx.fillText(`= ${(2 * Math.PI * flux).toFixed(2)} rad`, xDet - 130, detY0 + 8);

      // banner
      ctx.fillStyle = C.violet; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("electrons phase-shift even though both arms see  B = 0  outside the solenoid", 16, h - 12);
    }

    function drawVectorA(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      const cx = w / 2, cy = h / 2;
      const R = solRRef.current;
      const Bin = BinRef.current;

      // Solenoid (filled disk)
      ctx.fillStyle = "rgba(200,144,232,0.22)";
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      // B field (inside only) — dots out of page
      ctx.fillStyle = C.violet;
      for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
        const dx = i * (R / 2.5), dy = j * (R / 2.5);
        if (Math.hypot(dx, dy) < R - 6) {
          ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 1.6, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Vector A field as curling arrows OUTSIDE solenoid
      // For solenoid:  inside  A_φ(r) = B·r / 2
      //                outside A_φ(r) = B·R² / (2r)
      // Animate slight rotation of arrow heads to suggest the curl.
      const rings = 5;
      for (let ring = 0; ring < rings; ring++) {
        const r = R + 30 + ring * 38;
        if (r > Math.min(w, h) / 2 - 20) break;
        const Aphi = (Bin * R * R) / (2 * r);            // |A|
        // arrow density grows as 1/r
        const nArrows = 12 + ring * 4;
        for (let k = 0; k < nArrows; k++) {
          const ang = (k / nArrows) * Math.PI * 2 + p * 0.4;
          const ax = cx + r * Math.cos(ang);
          const ay = cy + r * Math.sin(ang);
          // tangent direction (perpendicular to radial, counter-clockwise)
          const tx = -Math.sin(ang), ty = Math.cos(ang);
          const len = 14 * Math.min(1, Aphi * 6);
          const x2 = ax + tx * len;
          const y2 = ay + ty * len;
          ctx.strokeStyle = C.cyan;
          ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(x2, y2); ctx.stroke();
          // arrowhead
          const ah = 4;
          ctx.beginPath();
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - tx * ah - ty * ah * 0.6, y2 - ty * ah + tx * ah * 0.6);
          ctx.moveTo(x2, y2);
          ctx.lineTo(x2 - tx * ah + ty * ah * 0.6, y2 - ty * ah - tx * ah * 0.6);
          ctx.stroke();
        }
      }

      // labels
      ctx.fillStyle = C.violet; ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText("B ≠ 0 inside", cx - 40, cy - R - 12);
      ctx.fillStyle = C.cyan;
      ctx.fillText("A ≠ 0 OUTSIDE  (B = 0 here, but ∮A·dl = Φ ≠ 0)", cx - 180, cy + R + 30);
      ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("A_φ(r > R) = B · R² / (2r)   ·   ∇ × A = 0 outside", cx - 170, cy + R + 48);
    }

    function drawCasimir(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      const dPx = Math.max(40, dRef.current * 80);     // pixels per micron
      const cx = w / 2;
      const plateW = 120, plateH = h - 120;
      const x1 = cx - dPx / 2 - plateW;
      const x2 = cx + dPx / 2;
      const y0 = 60;

      // plates
      ctx.fillStyle = "rgba(232,200,120,0.18)";
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
      ctx.fillRect(x1, y0, plateW, plateH);   ctx.strokeRect(x1, y0, plateW, plateH);
      ctx.fillRect(x2, y0, plateW, plateH);   ctx.strokeRect(x2, y0, plateW, plateH);

      // outside vacuum modes — continuous spectrum, drawn faintly on left and right
      ctx.strokeStyle = "rgba(110,200,122,0.25)";
      ctx.lineWidth = 1;
      for (let n = 1; n <= 14; n++) {
        const k = n * 0.6;
        // left side
        ctx.beginPath();
        for (let xx = 4; xx < x1 - 4; xx++) {
          const yy = y0 + plateH / 2 + 12 * Math.sin(xx * k * 0.05 + p * 2 + n);
          if (xx === 4) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
        // right side
        ctx.beginPath();
        for (let xx = x2 + plateW + 4; xx < w - 4; xx++) {
          const yy = y0 + plateH / 2 + 12 * Math.sin(xx * k * 0.05 + p * 2 + n);
          if (xx === x2 + plateW + 4) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }

      // between plates — only standing-wave modes that fit
      // n·λ/2 = d_px → λ = 2·d_px/n
      ctx.lineWidth = 1.2;
      const yc = y0 + plateH / 2;
      const dW = dPx;
      for (let n = 1; n <= 4; n++) {
        const amp = 14 / n;
        ctx.strokeStyle = n === 1 ? C.cyan : n === 2 ? C.violet : n === 3 ? C.amber : C.rose;
        ctx.beginPath();
        for (let xx = 0; xx <= dW; xx++) {
          const u = xx / dW;
          const yy = yc + amp * Math.sin(n * Math.PI * u) * Math.cos(p * 3 + n);
          if (xx === 0) ctx.moveTo(x1 + plateW + xx, yy); else ctx.lineTo(x1 + plateW + xx, yy);
        }
        ctx.stroke();
      }

      // arrow showing attractive force inward
      ctx.strokeStyle = C.rose; ctx.lineWidth = 2;
      const ay = y0 + plateH + 24;
      ctx.beginPath();
      ctx.moveTo(x1 - 30, ay); ctx.lineTo(x1 + 6, ay);
      ctx.moveTo(x1 + 6, ay); ctx.lineTo(x1, ay - 4); ctx.moveTo(x1 + 6, ay); ctx.lineTo(x1, ay + 4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2 + plateW + 30, ay); ctx.lineTo(x2 + plateW - 6, ay);
      ctx.moveTo(x2 + plateW - 6, ay); ctx.lineTo(x2 + plateW, ay - 4); ctx.moveTo(x2 + plateW - 6, ay); ctx.lineTo(x2 + plateW, ay + 4);
      ctx.stroke();

      // labels
      ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("vacuum modes EXCLUDED  (only n·λ/2 = d allowed)", x1 + plateW - 30, y0 - 12);
      ctx.fillStyle = C.green;
      ctx.fillText("full vacuum continuum",  10, y0 - 12);
      ctx.fillText("full vacuum continuum",  w - 180, y0 - 12);
      ctx.fillStyle = C.rose;
      ctx.fillText(`F = π² ℏc / (240 d⁴) · A  →  ${formatNewtons(obs.F)}`, 10, h - 14);
      ctx.fillStyle = C.gold;
      ctx.fillText(`d = ${dRef.current.toFixed(2)} µm`, cx - 30, h - 14);
    }

    function drawPais(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // Vibrating coil/cavity in left half · Tc(ω) curve in right half
      const halfW = w / 2;
      const cx = halfW / 2, cy = h / 2;
      const omega = omegaRef.current, res = resRef.current, sigma = widthRef.current;

      // coil with rapid vibration — concentric oscillating rings
      const rings = 6;
      for (let i = 0; i < rings; i++) {
        const r = 30 + i * 12;
        const wig = 4 * Math.sin(p * 6 * omega + i);
        ctx.strokeStyle = C.violet;
        ctx.lineWidth = 1 + 0.5 * Math.sin(p * 3 + i);
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += 0.05) {
          const rr = r + wig * Math.cos(2 * a + p * 4);
          const x = cx + rr * Math.cos(a);
          const y = cy + rr * Math.sin(a);
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
      // EM emanation arrows (high-frequency drive)
      ctx.fillStyle = C.amber;
      for (let k = 0; k < 8; k++) {
        const a = (k / 8) * Math.PI * 2 + p * omega;
        const r1 = 110, r2 = 130 + 8 * Math.sin(p * 6 + k);
        const x1 = cx + r1 * Math.cos(a), y1 = cy + r1 * Math.sin(a);
        const x2 = cx + r2 * Math.cos(a), y2 = cy + r2 * Math.sin(a);
        ctx.strokeStyle = C.amber; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      }
      ctx.fillStyle = C.violet; ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText(`vibration  ω = ${omega.toFixed(2)} THz`, cx - 70, cy + 160);

      // Tc(ω) curve in right half
      const padL = halfW + 50, padR = w - 30, padT = 50, padB = 60;
      ctx.strokeStyle = "rgba(96,96,122,0.5)";
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padL, h - padB); ctx.lineTo(padR, h - padB); ctx.stroke();
      ctx.fillStyle = C.muted; ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("ω (THz)", padR - 50, h - padB + 16);
      ctx.fillText("Tc (K)",  padL - 28, padT - 6);
      // 300 K horizontal line
      const Tmax = 400;
      const y300 = h - padB - (300 / Tmax) * (h - padB - padT);
      ctx.strokeStyle = C.green; ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(padL, y300); ctx.lineTo(padR, y300); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = C.green;
      ctx.fillText("300 K · room temperature", padL + 6, y300 - 4);

      // Tc curve
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 2;
      ctx.beginPath();
      const omMin = 0.1, omMax = 3.0;
      for (let i = 0; i <= 100; i++) {
        const om = omMin + (i / 100) * (omMax - omMin);
        const Tc = 320 * Math.exp(-Math.pow(om - res, 2) / (2 * sigma * sigma));
        const x = padL + (i / 100) * (padR - padL);
        const y = h - padB - (Tc / Tmax) * (h - padB - padT);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
      // current point
      const x = padL + ((omega - omMin) / (omMax - omMin)) * (padR - padL);
      const y = h - padB - (obs.Tc / Tmax) * (h - padB - padT);
      ctx.fillStyle = obs.Tc >= 300 ? C.green : C.amber;
      ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C.gold; ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText(`Tc = ${obs.Tc.toFixed(0)} K`, x + 10, y + 4);
    }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); clearInterval(ev); };
  }, [obs.F, obs.Tc]);

  // ==== UI handlers ====
  function setFluxAndLog(f: number) {
    setFlux(f);
    pushLog("FLUX", `Φ → ${f.toFixed(2)} Φ₀  ·  Δφ = ${(2 * Math.PI * f).toFixed(2)} rad`, C.gold);
  }
  function setSolRandLog(r: number) {
    setSolR(r);
    pushLog("SOL", `R → ${r}px`, C.violet);
  }
  function setDandLog(v: number) {
    setD(v);
    pushLog("PLATES", `d → ${v.toFixed(2)} µm`, C.green);
  }
  function setOmegaAndLog(v: number) {
    setOmega(v);
    pushLog("ω", `vibration → ${v.toFixed(2)} THz · Tc ≈ ${(320 * Math.exp(-Math.pow(v - resPeak, 2) / (2 * width * width))).toFixed(0)} K`, C.violet);
  }
  function tuneToResonance() {
    setOmega(resPeak);
    pushLog("TUNE", `ω → resonance ${resPeak.toFixed(2)} THz · maximum Tc`, C.green);
  }

  useEffect(() => {
    pushLog("INIT", "Quantum-vacuum bench online", C.gold);
    pushLog("READY", "Aharonov-Bohm · vector A · Casimir · Pais", C.cyan);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = TABS.find(t => t.key === tab)!;

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>QUANTUM VACUUM · ZERO POINT FIELD · VIRTUAL PARTICLES · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Rising virtual particle bubbles — the live AETHER quantum vacuum simulation.</p></div>
          <QuantumVacuumHeaderCanvas />
        </div>
      </div>
      <header className="px-8 pt-8 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: C.muted }}>
          AETHER · QUANTUM VACUUM &amp; NON-LOCAL EM · APRIL 2026
        </div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 44, color: C.white, letterSpacing: "0.04em" }}>
          Quantum Vacuum &amp; Non-Local EM
        </div>
        <div className="text-sm mt-2" style={{ color: C.text }}>
          Electron phase shifts where E and B vanish — Aharonov-Bohm · the vector potential A as the deeper reality · Casimir / Forward vacuum-energy extraction · Pais high-frequency room-temperature SC
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="flex gap-2 flex-wrap" data-testid="qv-tabs">
          {TABS.map(t => {
            const isOn = tab === t.key;
            return (
              <button key={t.key}
                onClick={() => { setTab(t.key); pushLog("TAB", `Workbench → ${t.label}`, t.col); }}
                data-testid={`tab-${t.key}`}
                aria-pressed={isOn} aria-label={`Open ${t.label}`}
                className="px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all"
                style={{
                  borderColor: isOn ? t.col : C.border,
                  color: isOn ? t.col : C.muted,
                  background: isOn ? t.col + "15" : "transparent",
                }}>
                <span style={{ marginRight: 10, fontFamily: "'Cinzel', serif" }}>{t.sym}</span>{t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex-1 px-8 pt-6 pb-8 grid gap-6" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
        <div className="space-y-4 min-w-0">
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: active.col }}>
                ◉ {active.label} · live render
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                ops: <span style={{ color: C.gold }}>{ops}</span> · coherence:&nbsp;
                <span style={{ color: C.green }}>{(coh * 100).toFixed(0)}%</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="qv-canvas" style={{ width: "100%", height: 380, display: "block" }} />
          </div>

          {tab === "ab" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.gold }}>◉ Aharonov-Bohm interferometer</div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Slider id="flux"     label="enclosed flux Φ / Φ₀"  value={flux}     min={0} max={3}   step={0.01} col={C.gold}  fmt={v => v.toFixed(2)}     onChange={setFluxAndLog} />
                <Slider id="coh"      label="beam visibility V"     value={coherence} min={0} max={1}   step={0.01} col={C.cyan}  fmt={v => v.toFixed(2)}     onChange={setCoherence} />
              </div>
              <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <Stat k="Δφ"    v={`${obs.dPhi.toFixed(2)} rad`} c={C.gold} />
                <Stat k="Φ₀"    v={"h/e ≈ 4.14·10⁻¹⁵ Wb"}        c={C.cyan} />
                <Stat k="fringe" v={`I ∝ cos²(πΦ/Φ₀)`}            c={C.violet} />
              </div>
              <div className="text-[11px] mt-4 leading-relaxed" style={{ color: C.text }}>
                Two electron beams travel around a tiny solenoid where B is confined to its interior. Outside, both arms see <span style={{ color: C.rose }}>E = 0</span> AND <span style={{ color: C.rose }}>B = 0</span> — yet the interference pattern at the screen <em>shifts</em> with the enclosed flux. The phase difference is Δφ = (e/ℏ)·∮A·dl = 2π·(Φ/Φ₀). The vector potential A — not the field B — is the gauge-invariant quantity the wave-function couples to in regions where the field is zero.
              </div>
            </div>
          )}

          {tab === "vectorA" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.cyan }}>◉ Vector potential A</div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Slider id="solR"  label="solenoid radius R"   value={solR} min={20} max={80}  step={1}    col={C.violet} fmt={v => `${v} px`}    onChange={setSolRandLog} />
                <Slider id="Bin"   label="internal field B"    value={Bin}  min={0}  max={1.5} step={0.05} col={C.gold}   fmt={v => v.toFixed(2)} onChange={setBin} />
              </div>
              <div className="text-[11px] mt-4 leading-relaxed" style={{ color: C.text }}>
                Inside the solenoid, B points out of the page (purple dots). Outside, <span style={{ color: C.rose }}>B = 0</span> — but the vector potential A still curls around in azimuthal rings (cyan arrows), with magnitude A_φ(r) = B·R²/(2r). Its line integral around any loop enclosing the solenoid gives the trapped flux: <span style={{ color: C.gold }}>∮A·dl = Φ</span>. This is what the electron's wave-function detects in the AB experiment.
              </div>
            </div>
          )}

          {tab === "casimir" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.green }}>◉ Casimir effect &amp; Forward's vacuum-energy concept</div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Slider id="d"     label="plate gap d (µm)"    value={d}      min={0.1} max={3.0} step={0.05} col={C.gold}  fmt={v => v.toFixed(2)} onChange={setDandLog} />
                <Slider id="A"     label="plate area (cm²)"    value={plateA} min={0.1} max={10}  step={0.1}  col={C.cyan}  fmt={v => v.toFixed(1)} onChange={setPlateA} />
              </div>
              <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <Stat k="F/A"           v={`${obs.FperA.toFixed(2)} Pa`} c={C.green} />
                <Stat k="F"             v={formatNewtons(obs.F)}         c={C.gold} />
                <Stat k="scaling"       v={"∝ 1 / d⁴"}                   c={C.cyan} />
              </div>
              <div className="text-[11px] mt-4 leading-relaxed" style={{ color: C.text }}>
                Two uncharged conducting plates in vacuum attract because the standing-wave modes between them are restricted (n·λ/2 = d) while the outside continuum is full. The pressure difference is the Casimir force F/A = π²ℏc/(240·d⁴). <span style={{ color: C.violet }}>Robert Forward (1984)</span> proposed exploiting this: alternately move the plates apart (work in) and let them snap back (work out), using non-conservative geometry or fluid effects to extract net energy from the vacuum. The mechanical engineering is brutal but the underlying force is real and routinely measured.
              </div>
            </div>
          )}

          {tab === "pais" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.violet }}>◉ Pais effect · vibration-mediated SC</div>
              <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Slider id="omega"  label="vibration ω (THz)" value={omega}   min={0.1} max={3.0} step={0.02} col={C.violet} fmt={v => v.toFixed(2)} onChange={setOmegaAndLog} />
                <Slider id="res"    label="resonance ωr"      value={resPeak} min={0.1} max={3.0} step={0.05} col={C.gold}   fmt={v => v.toFixed(2)} onChange={setResPeak} />
                <Slider id="width"  label="resonance σ"       value={width}   min={0.05} max={1.5} step={0.01} col={C.cyan}  fmt={v => v.toFixed(2)} onChange={setWidth} />
                <button onClick={tuneToResonance} data-testid="btn-tune"
                  aria-pressed={Math.abs(omega - resPeak) < 0.01}
                  aria-label="Tune vibration to resonance for maximum Tc"
                  className="px-3 py-2 text-[10px] tracking-[0.2em] uppercase border self-end"
                  style={{ borderColor: C.border2, color: C.green }}>tune to resonance</button>
              </div>
              <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <Stat k="Tc(ω)"    v={`${obs.Tc.toFixed(0)} K`}                                       c={obs.Tc >= 300 ? C.green : C.amber} />
                <Stat k="state"    v={obs.Tc >= 300 ? "Room-T SC ✓" : "below room T"}                  c={obs.Tc >= 300 ? C.green : C.rose} />
                <Stat k="ω / ωr"   v={(omega / resPeak).toFixed(2)}                                   c={C.cyan} />
              </div>
              <div className="text-[11px] mt-4 leading-relaxed" style={{ color: C.text }}>
                <span style={{ color: C.violet }}>Salvatore Pais</span> (US Navy patents, 2017–2019) proposed that a coil or cavity vibrating at very high frequency can polarise the vacuum strongly enough to mediate Cooper pairing without bulk magnets or cryogenic cooling — yielding superconductivity at room temperature. The mechanism is speculative and controversial; this canvas plots a Lorentzian-style Tc(ω) profile so you can sweep the vibration frequency and watch Tc cross the 300 K line at the resonance peak. Press <em>tune to resonance</em> to centre on the maximum.
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
            <div className="text-[11px] space-y-1" style={{ color: C.text }}>
              <Row k="active workbench" v={active.label} c={active.col} />
              <Row k="Φ / Φ₀"   v={flux.toFixed(2)}              c={C.gold} />
              <Row k="Δφ (AB)"  v={`${obs.dPhi.toFixed(2)} rad`} c={C.gold} />
              <Row k="A_outside" v={"≠ 0"}                       c={C.cyan} />
              <Row k="F/A"      v={`${obs.FperA.toFixed(1)} Pa`} c={C.green} />
              <Row k="d"        v={`${d.toFixed(2)} µm`}         c={C.gold} />
              <Row k="Tc(ω)"    v={`${obs.Tc.toFixed(0)} K`}     c={obs.Tc >= 300 ? C.green : C.amber} />
              <Row k="ω"        v={`${omega.toFixed(2)} THz`}    c={C.violet} />
              <Row k="ops"      v={ops.toString()}                c={C.muted} />
            </div>
          </div>

          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.gold }}>Phenomena</div>
            <Bar label="AB phase  Δφ / 2π"      v={Math.min(1, flux / 3)}                     col={C.gold} />
            <Bar label="|A| outside (rel.)"     v={Math.min(1, Bin * solR / 100)}             col={C.cyan} />
            <Bar label="Casimir  F/A (rel.)"    v={Math.min(1, obs.FperA / 1300)}             col={C.green} />
            <Bar label="Tc / 300 K"             v={Math.min(1, obs.Tc / 300)}                 col={C.violet} />
            <Bar label="coherence"              v={coh}                                       col={C.rose} />
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.gold }}>Event Log</div>
            <div className="p-3 space-y-1 text-[10px]" style={{ maxHeight: 220, overflowY: "auto" }} data-testid="event-log">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={`${e.ts}-${i}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}>
                    <span style={{ color: C.muted }}>{e.ts}</span>{" "}
                    <span style={{ color: e.col }}>[{e.tag}]</span>{" "}
                    <span>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </section>

      <footer className="px-8 py-4 border-t flex items-center justify-between text-[10px] tracking-[0.3em] uppercase"
              style={{ borderColor: C.border, color: C.muted }}>
        <div>⊙ &nbsp; ↻ &nbsp; ‖‖ &nbsp; ≈ &nbsp; · &nbsp; aharonov-bohm · vector A · casimir · pais</div>
        <div>Quantum Vacuum · AETHER OS</div>
      </footer>
    </div>
  );
}

function formatNewtons(F: number): string {
  if (F > 1) return `${F.toFixed(2)} N`;
  if (F > 1e-3) return `${(F * 1e3).toFixed(2)} mN`;
  if (F > 1e-6) return `${(F * 1e6).toFixed(2)} µN`;
  if (F > 1e-9) return `${(F * 1e9).toFixed(2)} nN`;
  if (F > 1e-12) return `${(F * 1e12).toFixed(2)} pN`;
  return `${F.toExponential(2)} N`;
}

function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span style={{ color: "#60607A" }}>{k}</span>
      <span style={{ color: c, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="border p-2" style={{ borderColor: "rgba(232,200,120,0.14)" }}>
      <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "#60607A" }}>{k}</div>
      <div style={{ color: c, fontSize: 13 }}>{v}</div>
    </div>
  );
}

function Bar({ label, v, col }: { label: string; v: number; col: string }) {
  return (
    <div className="mb-2">
      <div className="flex justify-between text-[10px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{v.toFixed(2)}</span>
      </div>
      <div className="w-full h-1.5" style={{ background: "rgba(96,96,122,0.2)" }}>
        <div style={{ width: `${Math.min(100, v * 100)}%`, height: "100%", background: col }} />
      </div>
    </div>
  );
}

function Slider({ id, label, value, min, max, step, col, onChange, fmt }:
  { id: string; label: string; value: number; min: number; max: number; step: number; col: string; onChange: (v: number) => void; fmt: (v: number) => string }) {
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

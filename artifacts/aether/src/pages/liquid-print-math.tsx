import { useEffect, useRef, useState } from "react";

/* ── palette ──────────────────────────────────── */
const BG   = "#030408";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const ORG  = "#f97316";
const DIM  = "#374858";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

function ha(hex: string, a: number) {
  return hex + Math.round(a * 255).toString(16).padStart(2, "0");
}

/* ── Slider ──────────────────────────────────── */
function Slider({
  label, value, min, max, step, unit, col = TEAL, decimals = 2, onChange,
}: {
  label: string; value: number; min: number; max: number;
  step: number; unit: string; col?: string; decimals?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: MN, fontSize: 11, color: "rgba(180,200,230,0.65)" }}>{label}</span>
        <span style={{ fontFamily: MN, fontSize: 11, color: col }}>
          {value.toFixed(decimals)}{unit}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: col, cursor: "pointer", height: 4 }} />
    </div>
  );
}

/* ── Equation chip ───────────────────────────── */
function EqChip({ eq, col }: { eq: string; col: string }) {
  return (
    <div style={{
      display: "inline-block", fontFamily: MN, fontSize: 12,
      background: ha(col, 0.08), border: `1px solid ${ha(col, 0.30)}`,
      color: col, padding: "3px 10px", borderRadius: 3, marginRight: 6, marginBottom: 4,
    }}>{eq}</div>
  );
}

/* ── Main page ───────────────────────────────── */
export default function LiquidPrintMathPage() {
  const rheoRef  = useRef<HTMLCanvasElement>(null);
  const condRef  = useRef<HTMLCanvasElement>(null);
  const kinetRef = useRef<HTMLCanvasElement>(null);
  const stackRef = useRef<HTMLCanvasElement>(null);
  const animRef  = useRef(0);

  /* ── Rheology state ── */
  const [K,       setK]       = useState(12);
  const [n,       setN]       = useState(0.55);
  const [nozzleR, setNozzleR] = useState(60);
  const [deltaP,  setDeltaP]  = useState(50);

  /* ── Conductivity state ── */
  const [sigProxy, setSigProxy] = useState(0.72);
  const [traceLen, setTraceLen] = useState(8.0);
  const [traceW,   setTraceW]   = useState(0.15);

  /* ── Kinetics state ── */
  const [Km,   setKm]   = useState(0.35);
  const [Vmax, setVmax] = useState(1.0);
  const [S0,   setS0]   = useState(0.48);

  /* ── Stack state ── */
  const [layers,   setLayers]   = useState(5);
  const [sensorD,  setSensorD]  = useState(0.5);
  const [coupling, setCoupling] = useState(0.6);

  /* ── Refs for canvas reads ── */
  const rK   = useRef(K);       useEffect(() => { rK.current   = K;       }, [K]);
  const rN   = useRef(n);       useEffect(() => { rN.current   = n;       }, [n]);
  const rNoz = useRef(nozzleR); useEffect(() => { rNoz.current = nozzleR; }, [nozzleR]);
  const rDP  = useRef(deltaP);  useEffect(() => { rDP.current  = deltaP;  }, [deltaP]);
  const rSig = useRef(sigProxy);useEffect(() => { rSig.current = sigProxy;}, [sigProxy]);
  const rTL  = useRef(traceLen);useEffect(() => { rTL.current  = traceLen;}, [traceLen]);
  const rTW  = useRef(traceW);  useEffect(() => { rTW.current  = traceW;  }, [traceW]);
  const rKm  = useRef(Km);      useEffect(() => { rKm.current  = Km;      }, [Km]);
  const rVm  = useRef(Vmax);    useEffect(() => { rVm.current  = Vmax;    }, [Vmax]);
  const rS0  = useRef(S0);      useEffect(() => { rS0.current  = S0;      }, [S0]);
  const rLy  = useRef(layers);  useEffect(() => { rLy.current  = layers;  }, [layers]);
  const rSd  = useRef(sensorD); useEffect(() => { rSd.current  = sensorD; }, [sensorD]);
  const rCp  = useRef(coupling);useEffect(() => { rCp.current  = coupling;}, [coupling]);

  useEffect(() => {
    const cR = rheoRef.current, cC = condRef.current;
    const cK = kinetRef.current, cS = stackRef.current;
    if (!cR || !cC || !cK || !cS) return;
    const xR = cR.getContext("2d")!;
    const xC = cC.getContext("2d")!;
    const xK = cK.getContext("2d")!;
    const xS = cS.getContext("2d")!;
    let t = 0;

    /* ────────────────── RHEOLOGY CANVAS ────────────────── */
    function drawRheo() {
      const W = cR!.width, H = cR!.height;
      const Kv = rK.current, nv = rN.current;
      const r  = rNoz.current * 1e-6;   // m
      const dp = rDP.current  * 1e3;    // Pa
      const L_noz = 0.002;              // 2 mm nozzle length

      xR.fillStyle = "#040810"; xR.fillRect(0, 0, W, H);

      const pl = 90, pr = 30, pt = 52, pb = 72;
      const pw = W - pl - pr, ph = H - pt - pb;

      // log-log axes
      const mnG = -1, mxG = 3; // shear rate 0.1→1000 s⁻¹
      const mnE = -1, mxE = 4; // viscosity 0.1→10000 Pa·s

      const gx = (lg: number) => pl + (lg - mnG) / (mxG - mnG) * pw;
      const gy = (le: number) => pt + ph - (le - mnE) / (mxE - mnE) * ph;

      // grid
      xR.save(); xR.setLineDash([3, 5]);
      xR.strokeStyle = ha(TEAL, 0.07); xR.lineWidth = 1;
      for (let i = mnG; i <= mxG; i++) {
        xR.beginPath(); xR.moveTo(gx(i), pt); xR.lineTo(gx(i), pt + ph); xR.stroke();
        xR.fillStyle = ha("#b0c8e8", 0.45); xR.font = `15px ${MN}`; xR.textAlign = "center";
        const lab = i === -1 ? "0.1" : i === 0 ? "1" : i === 1 ? "10" : i === 2 ? "100" : "1k";
        xR.fillText(lab, gx(i), pt + ph + 22);
      }
      for (let i = mnE; i <= mxE; i++) {
        xR.beginPath(); xR.moveTo(pl, gy(i)); xR.lineTo(pl + pw, gy(i)); xR.stroke();
        xR.fillStyle = ha("#b0c8e8", 0.45); xR.font = `14px ${MN}`; xR.textAlign = "right";
        const labs = ["-1","0","1","2","3","4"];
        xR.fillText(`10${["⁻¹","⁰","¹","²","³","⁴"][i + 1]}`, pl - 7, gy(i) + 5);
      }
      xR.restore();

      // axis labels
      xR.fillStyle = TEAL; xR.font = `17px ${MN}`; xR.textAlign = "center";
      xR.fillText("Shear Rate  γ̇  (s⁻¹)", pl + pw / 2, pt + ph + 50);
      xR.save(); xR.translate(22, pt + ph / 2); xR.rotate(-Math.PI / 2);
      xR.fillText("Viscosity  η  (Pa·s)", 0, 0); xR.restore();

      // print window
      const pMin = Math.log10(8), pMax = Math.log10(500);
      xR.fillStyle = ha(TEAL, 0.045);
      xR.fillRect(gx(pMin), pt, gx(pMax) - gx(pMin), ph);
      xR.fillStyle = ha(TEAL, 0.3); xR.font = `13px ${MN}`; xR.textAlign = "center";
      xR.fillText("extrusion window", gx((pMin + pMax) / 2), pt + 15);

      // newtonian reference
      xR.save(); xR.setLineDash([6, 4]);
      xR.strokeStyle = ha(BLUE, 0.25); xR.lineWidth = 1.5;
      xR.beginPath(); xR.moveTo(pl, gy(Math.log10(Kv))); xR.lineTo(pl + pw, gy(Math.log10(Kv))); xR.stroke();
      xR.restore();
      xR.fillStyle = ha(BLUE, 0.35); xR.font = `13px ${MN}`; xR.textAlign = "left";
      xR.fillText("Newtonian  n=1", gx(pMin) + 6, gy(Math.log10(Kv)) - 6);

      // power-law curve: η = K·γ̇^(n-1)
      xR.beginPath(); xR.strokeStyle = TEAL; xR.lineWidth = 2.5;
      xR.shadowColor = TEAL; xR.shadowBlur = 9;
      let first = true;
      for (let px = 0; px <= pw; px += 2) {
        const lg = mnG + (px / pw) * (mxG - mnG);
        const g  = Math.pow(10, lg);
        const ev = Math.log10(Math.max(1e-2, Kv * Math.pow(g, nv - 1)));
        if (ev < mnE - 0.2 || ev > mxE + 0.2) { first = true; continue; }
        if (first) { xR.moveTo(pl + px, gy(ev)); first = false; }
        else xR.lineTo(pl + px, gy(ev));
      }
      xR.stroke(); xR.shadowBlur = 0;

      // operating point via modified Hagen-Poiseuille
      const gWall = Math.pow((r * dp) / (2 * Kv * L_noz), 1 / nv);
      const etaOp = Kv * Math.pow(Math.max(1e-4, gWall), nv - 1);
      const Q     = Math.PI * Math.pow(r, 4) * dp / (8 * etaOp * L_noz);
      const lgOp  = Math.log10(Math.max(0.1, gWall));
      const leOp  = Math.log10(Math.max(0.01, etaOp));

      if (lgOp >= mnG && lgOp <= mxG && leOp >= mnE && leOp <= mxE) {
        xR.save();
        xR.shadowColor = GOLD; xR.shadowBlur = 18;
        xR.fillStyle = GOLD;
        xR.beginPath(); xR.arc(gx(lgOp), gy(leOp), 7, 0, Math.PI * 2); xR.fill();
        xR.shadowBlur = 0;
        xR.fillStyle = GOLD; xR.font = `14px ${MN}`; xR.textAlign = "left";
        xR.fillText(`γ̇ = ${gWall.toFixed(0)} s⁻¹`, gx(lgOp) + 12, gy(leOp) - 4);
        xR.fillText(`η = ${etaOp.toFixed(2)} Pa·s`, gx(lgOp) + 12, gy(leOp) + 14);
        xR.restore();
      }

      // readout bar
      xR.fillStyle = TEAL; xR.font = `bold 16px ${MN}`; xR.textAlign = "left";
      xR.fillText(
        `Q = ${(Q * 1e9).toFixed(2)} mm³/s  ·  r = ${rNoz.current} μm  ·  ΔP = ${rDP.current} kPa`,
        pl, pt + ph + 60,
      );

      // title
      xR.font = `bold 22px ${OR}`; xR.fillStyle = TEAL;
      xR.shadowColor = TEAL; xR.shadowBlur = 10;
      xR.textAlign = "left"; xR.fillText("I · Rheology · Flow Curve", pl, 34);
      xR.shadowBlur = 0;
      xR.font = `13px ${MN}`; xR.fillStyle = ha("#b0c8e8", 0.45);
      xR.fillText("η(γ̇) = K · γ̇ ^(n−1)   Ostwald-de Waele · Hagen-Poiseuille", pl + 310, 34);

      xR.strokeStyle = ha(TEAL, 0.14); xR.lineWidth = 1;
      xR.strokeRect(pl, pt, pw, ph);
    }

    /* ────────────────── CONDUCTIVITY CANVAS ────────────────── */
    function drawCond() {
      const W = cC!.width, H = cC!.height;
      const sigN = rSig.current;
      const sigma = 1e3 + sigN * 4.5e6;      // S/m (gallium range)
      const rho   = 1 / sigma;                // Ω·m
      const L     = rTL.current * 1e-3;       // m
      const Wt    = rTW.current * 1e-3;       // m
      const Ht    = 0.05e-3;                  // 50 μm height
      const A     = Wt * Ht;                  // m²
      const R     = rho * L / A;              // Ω

      xC.fillStyle = "#040810"; xC.fillRect(0, 0, W, H);

      const pl = 86, pr = 30, pt = 52, pb = 72;
      const pw = W - pl - pr, ph = H - pt - pb;

      const maxL = 30e-3;
      const rhoCu = 1.68e-8;
      const Rmax  = Math.max(rho * maxL / A, rhoCu * maxL / A) * 1.15;

      const gx = (l: number) => pl + (l / maxL) * pw;
      const gy = (Rv: number) => pt + ph - (Rv / Rmax) * ph;

      // grid
      xC.save(); xC.setLineDash([3, 5]);
      xC.strokeStyle = ha(GOLD, 0.07); xC.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        const x = pl + (i / 6) * pw;
        xC.beginPath(); xC.moveTo(x, pt); xC.lineTo(x, pt + ph); xC.stroke();
        xC.fillStyle = ha("#b0c8e8", 0.45); xC.font = `15px ${MN}`; xC.textAlign = "center";
        xC.fillText(`${i * 5}`, x, pt + ph + 22);
      }
      for (let i = 0; i <= 4; i++) {
        const y = pt + (i / 4) * ph;
        xC.beginPath(); xC.moveTo(pl, y); xC.lineTo(pl + pw, y); xC.stroke();
        const Rv = Rmax * (1 - i / 4);
        xC.fillStyle = ha("#b0c8e8", 0.45); xC.font = `14px ${MN}`; xC.textAlign = "right";
        xC.fillText(Rv < 0.001 ? `${(Rv * 1000).toFixed(1)} mΩ` : `${Rv.toFixed(3)}`, pl - 6, y + 5);
      }
      xC.restore();

      // copper reference
      xC.save(); xC.setLineDash([5, 4]);
      xC.strokeStyle = ha(ORG, 0.28); xC.lineWidth = 1.5;
      xC.beginPath();
      for (let px = 0; px <= pw; px += 4) {
        const l = (px / pw) * maxL;
        const Rv = rhoCu * l / A;
        if (px === 0) xC.moveTo(gx(l), gy(Rv)); else xC.lineTo(gx(l), gy(Rv));
      }
      xC.stroke(); xC.setLineDash([]);
      xC.restore();
      xC.fillStyle = ha(ORG, 0.45); xC.font = `13px ${MN}`; xC.textAlign = "right";
      xC.fillText("Cu ref (ρ=1.68×10⁻⁸ Ω·m)", pl + pw - 6, pt + 18);

      // gallium / liquid metal curve
      xC.beginPath(); xC.strokeStyle = GOLD; xC.lineWidth = 2.5;
      xC.shadowColor = GOLD; xC.shadowBlur = 9;
      for (let px = 0; px <= pw; px += 2) {
        const l = (px / pw) * maxL;
        const Rv = rho * l / A;
        if (px === 0) xC.moveTo(gx(l), gy(Rv)); else xC.lineTo(gx(l), gy(Rv));
      }
      xC.stroke(); xC.shadowBlur = 0;

      // operating point
      xC.save(); xC.shadowColor = TEAL; xC.shadowBlur = 16;
      xC.fillStyle = TEAL; xC.beginPath();
      xC.arc(gx(L), gy(R), 7, 0, Math.PI * 2); xC.fill();
      xC.shadowBlur = 0; xC.fillStyle = TEAL; xC.font = `14px ${MN}`; xC.textAlign = "left";
      xC.fillText(`R = ${(R * 1000).toFixed(3)} mΩ`, gx(L) + 12, gy(R) - 4);
      xC.fillText(`L = ${rTL.current} mm`, gx(L) + 12, gy(R) + 14);
      xC.restore();

      // animated pulse
      const px2 = pl + ((t * 0.5) % (pw + 60)) - 30;
      if (px2 >= pl && px2 <= pl + pw) {
        xC.save(); xC.shadowColor = GOLD; xC.shadowBlur = 22;
        xC.fillStyle = ha(GOLD, 0.85);
        xC.beginPath(); xC.arc(px2, pt + ph - 8, 5, 0, Math.PI * 2); xC.fill();
        xC.shadowBlur = 0; xC.restore();
      }

      // axes
      xC.fillStyle = GOLD; xC.font = `17px ${MN}`; xC.textAlign = "center";
      xC.fillText("Trace Length  L  (mm)", pl + pw / 2, pt + ph + 50);
      xC.save(); xC.translate(22, pt + ph / 2); xC.rotate(-Math.PI / 2);
      xC.fillText("Resistance  R  (Ω)", 0, 0); xC.restore();

      // readout
      xC.fillStyle = GOLD; xC.font = `bold 16px ${MN}`; xC.textAlign = "left";
      xC.fillText(
        `σ = ${sigma.toExponential(2)} S/m  ·  ρ = ${rho.toExponential(2)} Ω·m  ·  w = ${rTW.current} mm`,
        pl, pt + ph + 60,
      );

      xC.font = `bold 22px ${OR}`; xC.fillStyle = GOLD;
      xC.shadowColor = GOLD; xC.shadowBlur = 10; xC.textAlign = "left";
      xC.fillText("II · Conductivity · Trace Resistance", pl, 34);
      xC.shadowBlur = 0;
      xC.font = `13px ${MN}`; xC.fillStyle = ha("#b0c8e8", 0.45);
      xC.fillText("R = ρL/A   ·   σ = ne²τ/mₑ   [Drude]", pl + 370, 34);
      xC.strokeStyle = ha(GOLD, 0.14); xC.lineWidth = 1;
      xC.strokeRect(pl, pt, pw, ph);
    }

    /* ────────────────── KINETICS CANVAS ────────────────── */
    function drawKinet() {
      const W = cK!.width, H = cK!.height;
      const Kv = rKm.current, Vv = rVm.current, Sv = rS0.current;

      xK.fillStyle = "#040810"; xK.fillRect(0, 0, W, H);

      const pl = 86, pr = 40, pt = 52, pb = 72;
      const pw = W - pl - pr, ph = H - pt - pb;
      const maxS = 2.0, maxV = Vv * 1.18;

      const gx = (s: number) => pl + (s / maxS) * pw;
      const gy = (v: number) => pt + ph - (v / maxV) * ph;

      // grid
      xK.save(); xK.setLineDash([3, 5]);
      xK.strokeStyle = ha(VIO, 0.07); xK.lineWidth = 1;
      for (let i = 0; i <= 5; i++) {
        const x = pl + (i / 5) * pw;
        xK.beginPath(); xK.moveTo(x, pt); xK.lineTo(x, pt + ph); xK.stroke();
        xK.fillStyle = ha("#b0c8e8", 0.45); xK.font = `15px ${MN}`; xK.textAlign = "center";
        xK.fillText(`${(i * maxS / 5).toFixed(1)}`, x, pt + ph + 22);
      }
      for (let i = 0; i <= 4; i++) {
        const y = pt + (i / 4) * ph;
        xK.beginPath(); xK.moveTo(pl, y); xK.lineTo(pl + pw, y); xK.stroke();
        xK.fillStyle = ha("#b0c8e8", 0.45); xK.font = `14px ${MN}`; xK.textAlign = "right";
        xK.fillText(`${(Vv * (1 - i / 4)).toFixed(2)}`, pl - 6, y + 5);
      }
      xK.restore();

      // Vmax asymptote
      xK.save(); xK.setLineDash([5, 4]);
      xK.strokeStyle = ha(VIO, 0.3); xK.lineWidth = 1.5;
      xK.beginPath(); xK.moveTo(pl, gy(Vv)); xK.lineTo(pl + pw, gy(Vv)); xK.stroke();
      xK.setLineDash([]);
      xK.restore();
      xK.fillStyle = ha(VIO, 0.55); xK.font = `14px ${MN}`; xK.textAlign = "right";
      xK.fillText(`Vmax = ${Vv.toFixed(2)}`, pl + pw, gy(Vv) - 7);

      // Km + Vmax/2 crosshairs
      const KmX = gx(Kv), halfY = gy(Vv / 2);
      xK.save(); xK.setLineDash([4, 4]);
      xK.strokeStyle = ha(GRN, 0.4); xK.lineWidth = 1;
      xK.beginPath(); xK.moveTo(KmX, pt); xK.lineTo(KmX, pt + ph); xK.stroke();
      xK.beginPath(); xK.moveTo(pl, halfY); xK.lineTo(KmX, halfY); xK.stroke();
      xK.setLineDash([]); xK.restore();
      xK.fillStyle = ha(GRN, 0.65); xK.font = `13px ${MN}`; xK.textAlign = "center";
      xK.fillText(`Km`, KmX, pt + ph + 20);
      xK.textAlign = "right";
      xK.fillText("Vmax/2 ─", KmX - 6, halfY + 5);

      // MM curve: v = Vmax[S]/(Km+[S])
      xK.beginPath(); xK.strokeStyle = VIO; xK.lineWidth = 2.5;
      xK.shadowColor = VIO; xK.shadowBlur = 9;
      let first = true;
      for (let px = 0; px <= pw; px += 2) {
        const s = (px / pw) * maxS;
        const v = Vv * s / (Kv + s);
        if (first) { xK.moveTo(pl + px, gy(v)); first = false; }
        else xK.lineTo(pl + px, gy(v));
      }
      xK.stroke(); xK.shadowBlur = 0;

      // Hill cooperative (n=2) comparison
      xK.beginPath(); xK.strokeStyle = ha(PINK, 0.35); xK.lineWidth = 1.5;
      xK.setLineDash([4, 4]);
      first = true;
      for (let px = 0; px <= pw; px += 2) {
        const s = (px / pw) * maxS;
        const v = Vv * (s * s) / (Kv * Kv + s * s);
        if (first) { xK.moveTo(pl + px, gy(v)); first = false; }
        else xK.lineTo(pl + px, gy(v));
      }
      xK.stroke(); xK.setLineDash([]);
      xK.fillStyle = ha(PINK, 0.45); xK.font = `13px ${MN}`; xK.textAlign = "right";
      xK.fillText("Hill n=2", pl + pw, gy(Vv * (maxS * maxS) / (Kv * Kv + maxS * maxS)) - 6);

      // operating point
      const vOp = Vv * Sv / (Kv + Sv);
      xK.save(); xK.shadowColor = TEAL; xK.shadowBlur = 16;
      xK.fillStyle = TEAL;
      xK.beginPath(); xK.arc(gx(Sv), gy(vOp), 7, 0, Math.PI * 2); xK.fill();
      xK.shadowBlur = 0; xK.fillStyle = TEAL; xK.font = `14px ${MN}`; xK.textAlign = "left";
      xK.fillText(`v = ${vOp.toFixed(3)}`, gx(Sv) + 12, gy(vOp) - 4);
      xK.fillText(`[S]=${Sv.toFixed(2)}`, gx(Sv) + 12, gy(vOp) + 14);
      xK.restore();

      // axes
      xK.fillStyle = VIO; xK.font = `17px ${MN}`; xK.textAlign = "center";
      xK.fillText("Substrate Concentration  [S]", pl + pw / 2, pt + ph + 50);
      xK.save(); xK.translate(22, pt + ph / 2); xK.rotate(-Math.PI / 2);
      xK.fillText("Reaction Rate  v", 0, 0); xK.restore();

      // ops readout
      xK.fillStyle = VIO; xK.font = `bold 16px ${MN}`; xK.textAlign = "left";
      const satPct = (vOp / Vv * 100).toFixed(1);
      xK.fillText(
        `saturation ${satPct}%   ·   Km = ${Kv.toFixed(2)}   ·   [S]/Km ratio = ${(Sv / Kv).toFixed(2)}`,
        pl, pt + ph + 60,
      );

      xK.font = `bold 22px ${OR}`; xK.fillStyle = VIO;
      xK.shadowColor = VIO; xK.shadowBlur = 10; xK.textAlign = "left";
      xK.fillText("III · Kinetics · Strand Displacement", pl, 34);
      xK.shadowBlur = 0;
      xK.font = `13px ${MN}`; xK.fillStyle = ha("#b0c8e8", 0.45);
      xK.fillText("v = Vmax·[S] / (Km + [S])   [Michaelis-Menten]", pl + 370, 34);
      xK.strokeStyle = ha(VIO, 0.14); xK.lineWidth = 1;
      xK.strokeRect(pl, pt, pw, ph);
    }

    /* ────────────────── STACK CANVAS ────────────────── */
    function drawStack() {
      const W = cS!.width, H = cS!.height;
      const L  = rLy.current;
      const sd = rSd.current;
      const cp = rCp.current;

      xS.fillStyle = "#040810"; xS.fillRect(0, 0, W, H);

      const allLayers = [
        { name: "Gel Scaffold",      col: TEAL, h: 0.40 + sd * 0.10 },
        { name: "Conductive Ink",    col: GOLD, h: 0.25 + sd * 0.05 },
        { name: "DNA / RNA Logic",   col: GRN,  h: 0.35 + sd * 0.20 },
        { name: "Sensor Mesh",       col: VIO,  h: 0.20 + sd * 0.15 },
        { name: "Bio Interface",     col: PINK, h: 0.28 + sd * 0.10 },
        { name: "Neural Coupling",   col: ORG,  h: 0.24 + sd * 0.05 },
        { name: "Encapsulation",     col: BLUE, h: 0.15 + sd * 0.05 },
      ].slice(0, L);

      const totalMm  = allLayers.reduce((s, l) => s + l.h, 0);
      const stackX   = W * 0.32, stackW = W * 0.44;
      const stackTop = 70, stackBot = H - 90;
      const drawH    = stackBot - stackTop;

      let yPos = stackTop;

      for (let i = 0; i < allLayers.length; i++) {
        const ld  = allLayers[i];
        const lh  = (ld.h / totalMm) * drawH;
        const act = 0.5 + 0.5 * Math.sin(t * 0.018 + i * 0.9);

        // fill
        xS.save();
        xS.fillStyle = ha(ld.col, 0.08 + act * 0.06);
        xS.strokeStyle = ha(ld.col, 0.30 + act * 0.20);
        xS.lineWidth = 1.5;
        xS.beginPath(); xS.roundRect(stackX, yPos, stackW, lh - 2, 4);
        xS.fill(); xS.stroke(); xS.restore();

        // accent bar
        xS.fillStyle = ha(ld.col, 0.55 + act * 0.3);
        xS.fillRect(stackX, yPos, 5, lh - 2);

        // shimmer scan
        const shimX = stackX + 5 + ((t * 1.2 + i * 55) % (stackW - 10));
        xS.save(); xS.shadowColor = ld.col; xS.shadowBlur = 12 * act;
        xS.fillStyle = ha(ld.col, 0.25 * act);
        xS.fillRect(shimX - 14, yPos + 2, 28, lh - 4);
        xS.shadowBlur = 0; xS.restore();

        // left label
        xS.fillStyle = ha(ld.col, 0.55 + act * 0.40);
        xS.font = `${act > 0.7 ? "bold " : ""}17px ${MN}`;
        xS.textAlign = "right";
        xS.fillText(ld.name, stackX - 14, yPos + lh * 0.5 + 6);

        // right: height
        xS.fillStyle = ha(ld.col, 0.50);
        xS.font = `14px ${MN}`; xS.textAlign = "left";
        xS.fillText(`${ld.h.toFixed(2)} mm`, stackX + stackW + 14, yPos + lh * 0.5 + 5);

        // impedance coupling arrow between layers
        if (i < allLayers.length - 1) {
          const arrowY = yPos + lh;
          const cpAlpha = 0.12 + cp * 0.5;
          xS.save(); xS.strokeStyle = ha(TEAL, cpAlpha); xS.lineWidth = 1 + cp;
          xS.setLineDash([2, 3]);
          xS.beginPath();
          for (let cx2 = stackW * 0.15; cx2 <= stackW * 0.85; cx2 += stackW * 0.14) {
            xS.moveTo(stackX + cx2, arrowY - 1); xS.lineTo(stackX + cx2, arrowY + 1);
          }
          xS.stroke(); xS.setLineDash([]); xS.restore();
          // Γ label
          xS.fillStyle = ha(TEAL, 0.30 + cp * 0.3); xS.font = `12px ${MN}`; xS.textAlign = "center";
          xS.fillText(`Γ=${cp.toFixed(2)}`, stackX + stackW * 0.5, arrowY + 11);
        }

        yPos += lh;
      }

      // outer bracket lines
      xS.strokeStyle = ha(TEAL, 0.15); xS.lineWidth = 1.5;
      xS.beginPath(); xS.moveTo(stackX - 2, stackTop); xS.lineTo(stackX + stackW + 2, stackTop); xS.stroke();
      xS.beginPath(); xS.moveTo(stackX - 2, stackBot); xS.lineTo(stackX + stackW + 2, stackBot); xS.stroke();

      // total height arrow (left side)
      xS.strokeStyle = ha(TEAL, 0.25); xS.lineWidth = 1;
      xS.beginPath(); xS.moveTo(stackX - 28, stackTop); xS.lineTo(stackX - 28, stackBot); xS.stroke();
      xS.fillStyle = ha(TEAL, 0.55); xS.font = `14px ${MN}`; xS.textAlign = "center";
      xS.save(); xS.translate(stackX - 44, (stackTop + stackBot) / 2); xS.rotate(-Math.PI / 2);
      xS.fillText(`${totalMm.toFixed(2)} mm total`, 0, 0); xS.restore();

      // Z model + readout
      xS.textAlign = "center";
      xS.fillStyle = ha("#b0c8e8", 0.45); xS.font = `16px ${MN}`;
      xS.fillText("Z(ω) = R + 1/(iωC)   ·   Γ = (Z₂−Z₁)/(Z₂+Z₁)   ·   H = Σᵢ hᵢ", W / 2, H - 52);
      xS.fillStyle = GRN; xS.font = `bold 17px ${MN}`;
      xS.fillText(
        `${L} layers  ·  ${totalMm.toFixed(2)} mm  ·  coupling Γ = ${cp.toFixed(2)}  ·  sensor ρ = ${sd.toFixed(2)}`,
        W / 2, H - 28,
      );

      // title
      xS.font = `bold 22px ${OR}`; xS.fillStyle = GRN;
      xS.shadowColor = GRN; xS.shadowBlur = 10; xS.textAlign = "left";
      xS.fillText("IV · Bio-Hybrid Stack · Layer Model", stackX, 34);
      xS.shadowBlur = 0;
      xS.font = `13px ${MN}`; xS.fillStyle = ha("#b0c8e8", 0.45);
      xS.fillText("impedance-matched · H = Σᵢ hᵢ", stackX + 400, 34);
    }

    /* ── main loop ── */
    const loop = () => { t++; drawRheo(); drawCond(); drawKinet(); drawStack(); animRef.current = requestAnimationFrame(loop); };
    loop();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  /* ── style helpers ── */
  const panel = (col = TEAL): React.CSSProperties => ({
    background: ha(col, 0.04), border: `1px solid ${ha(col, 0.18)}`,
    borderRadius: 6, padding: "10px 14px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 8, letterSpacing: "0.22em", color: DIM,
    textTransform: "uppercase", marginBottom: 8, paddingBottom: 4,
    borderBottom: "1px solid rgba(31,212,200,0.09)",
  };
  const body: React.CSSProperties = { fontSize: 11.5, color: "rgba(200,210,228,0.7)", lineHeight: 1.7 };
  const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 260px", gap: 12, marginBottom: 12, alignItems: "start" };

  return (
    <div style={{ minHeight: "100%", background: BG, color: "#d4e4f4",
      fontFamily: "'Rajdhani',sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "16px 20px" }}>

        {/* ── Title ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "inline-block", border: `1px solid ${TEAL}55`,
            padding: "3px 10px", fontSize: 9, letterSpacing: "0.2em",
            fontFamily: MN, color: TEAL, marginBottom: 8, borderRadius: 2 }}>
            AETHER · LIQUID PRINT · MATHEMATICAL FRAMEWORK
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 24, color: "#fff",
            margin: "0 0 6px", letterSpacing: 2, textShadow: `0 0 24px ${TEAL}55` }}>
            Complete Mathematical Framework · Liquid Print
          </h1>
          <p style={{ ...body, margin: 0, maxWidth: 900 }}>
            Four physical domains — <strong style={{ color: TEAL }}>rheology</strong>,{" "}
            <strong style={{ color: GOLD }}>electrical conductivity</strong>,{" "}
            <strong style={{ color: VIO }}>molecular kinetics</strong>, and{" "}
            <strong style={{ color: GRN }}>stack geometry</strong> — each modelled by a live interactive
            simulation. Adjust parameters to move the operating point in real time.
          </p>
          <div style={{ marginTop: 8 }}>
            <EqChip eq="η(γ̇) = K·γ̇^(n−1)" col={TEAL} />
            <EqChip eq="R = ρL/A" col={GOLD} />
            <EqChip eq="v = Vmax·[S]/(Km+[S])" col={VIO} />
            <EqChip eq="Z = R + 1/(iωC)" col={GRN} />
          </div>
        </div>

        {/* ══════════ SECTION I : RHEOLOGY ══════════ */}
        <div style={row}>
          <div style={{ ...panel(TEAL), padding: 0, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "6px 14px", borderBottom: `1px solid ${ha(TEAL, 0.12)}` }}>
              <span style={{ fontFamily: OR, fontSize: 10, color: TEAL, letterSpacing: 1 }}>
                I · RHEOLOGY
              </span>
              <span style={{ fontFamily: MN, fontSize: 9, color: DIM, marginLeft: 12 }}>
                Ostwald-de Waele  ·  Hagen-Poiseuille
              </span>
            </div>
            <canvas ref={rheoRef} width={820} height={420}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
          <div style={panel(TEAL)}>
            <div style={secLabel}>Controls · Rheology</div>
            <Slider label="K — consistency index" value={K} min={1} max={50} step={1} unit=" Pa·s^n" col={TEAL} decimals={0} onChange={setK} />
            <Slider label="n — flow index" value={n} min={0.1} max={1.0} step={0.01} unit="" col={TEAL} onChange={setN} />
            <Slider label="r — nozzle radius" value={nozzleR} min={20} max={300} step={5} unit=" μm" col={TEAL} decimals={0} onChange={setNozzleR} />
            <Slider label="ΔP — extrusion pressure" value={deltaP} min={5} max={200} step={5} unit=" kPa" col={GOLD} decimals={0} onChange={setDeltaP} />
            <div style={{ ...secLabel, marginTop: 10 }}>Key equations</div>
            <div style={{ fontFamily: MN, fontSize: 10, color: ha(TEAL, 0.7), lineHeight: 1.9 }}>
              η(γ̇) = K · γ̇^(n−1)<br />
              Q = πr⁴ΔP / 8ηL<br />
              γ̇_wall = (r·ΔP/2KL)^(1/n)
            </div>
          </div>
        </div>

        {/* ══════════ SECTION II : CONDUCTIVITY ══════════ */}
        <div style={row}>
          <div style={{ ...panel(GOLD), padding: 0, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "6px 14px", borderBottom: `1px solid ${ha(GOLD, 0.12)}` }}>
              <span style={{ fontFamily: OR, fontSize: 10, color: GOLD, letterSpacing: 1 }}>
                II · CONDUCTIVITY
              </span>
              <span style={{ fontFamily: MN, fontSize: 9, color: DIM, marginLeft: 12 }}>
                Drude model  ·  trace resistance  ·  signal propagation
              </span>
            </div>
            <canvas ref={condRef} width={820} height={420}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
          <div style={panel(GOLD)}>
            <div style={secLabel}>Controls · Conductivity</div>
            <Slider label="σ̃ — conductivity proxy" value={sigProxy} min={0.01} max={1.0} step={0.01} unit="" col={GOLD} onChange={setSigProxy} />
            <Slider label="L — trace length" value={traceLen} min={1} max={30} step={0.5} unit=" mm" col={GOLD} onChange={setTraceLen} />
            <Slider label="w — trace width" value={traceW} min={0.05} max={1.0} step={0.05} unit=" mm" col={TEAL} onChange={setTraceW} />
            <div style={{ ...secLabel, marginTop: 10 }}>Key equations</div>
            <div style={{ fontFamily: MN, fontSize: 10, color: ha(GOLD, 0.7), lineHeight: 1.9 }}>
              σ = ne²τ / mₑ<br />
              R = ρL / A<br />
              σ_Ga ≈ 3.7×10⁶ S/m<br />
              ρ = 1/σ
            </div>
          </div>
        </div>

        {/* ══════════ SECTION III : KINETICS ══════════ */}
        <div style={row}>
          <div style={{ ...panel(VIO), padding: 0, borderRadius: 6, overflow: "hidden" }}>
            <div style={{ padding: "6px 14px", borderBottom: `1px solid ${ha(VIO, 0.12)}` }}>
              <span style={{ fontFamily: OR, fontSize: 10, color: VIO, letterSpacing: 1 }}>
                III · MOLECULAR KINETICS
              </span>
              <span style={{ fontFamily: MN, fontSize: 9, color: DIM, marginLeft: 12 }}>
                Michaelis-Menten  ·  Hill cooperative  ·  DNA strand displacement
              </span>
            </div>
            <canvas ref={kinetRef} width={820} height={420}
              style={{ width: "100%", height: "auto", display: "block" }} />
          </div>
          <div style={panel(VIO)}>
            <div style={secLabel}>Controls · Kinetics</div>
            <Slider label="Km — Michaelis constant" value={Km} min={0.05} max={1.5} step={0.05} unit="" col={GRN} onChange={setKm} />
            <Slider label="Vmax — max rate" value={Vmax} min={0.2} max={2.0} step={0.1} unit="" col={VIO} onChange={setVmax} />
            <Slider label="[S] — substrate conc." value={S0} min={0.01} max={2.0} step={0.01} unit="" col={TEAL} onChange={setS0} />
            <div style={{ ...secLabel, marginTop: 10 }}>Key equations</div>
            <div style={{ fontFamily: MN, fontSize: 10, color: ha(VIO, 0.75), lineHeight: 1.9 }}>
              v = Vmax·[S] / (Km+[S])<br />
              Hill: v = Vmax·[S]^n /<br />
              {"    "}(Kn+[S]^n)<br />
              k_obs = k₀·e^(-ΔG‡/RT)
            </div>
          </div>
        </div>

        {/* ══════════ SECTION IV : STACK ══════════ */}
        <div style={{ ...panel(GRN), padding: 0, borderRadius: 6, overflow: "hidden", marginBottom: 12 }}>
          <div style={{ padding: "6px 14px", borderBottom: `1px solid ${ha(GRN, 0.12)}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <span style={{ fontFamily: OR, fontSize: 10, color: GRN, letterSpacing: 1 }}>
                IV · BIO-HYBRID STACK
              </span>
              <span style={{ fontFamily: MN, fontSize: 9, color: DIM, marginLeft: 12 }}>
                Layer model  ·  impedance coupling  ·  total height
              </span>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: MN, fontSize: 10, color: DIM }}>Layers</span>
                <input type="range" min={3} max={7} step={1} value={layers}
                  onChange={e => setLayers(Number(e.target.value))}
                  style={{ width: 80, accentColor: GRN }} />
                <span style={{ fontFamily: MN, fontSize: 11, color: GRN }}>{layers}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: MN, fontSize: 10, color: DIM }}>Sensor ρ</span>
                <input type="range" min={0.1} max={1.0} step={0.05} value={sensorD}
                  onChange={e => setSensorD(Number(e.target.value))}
                  style={{ width: 80, accentColor: VIO }} />
                <span style={{ fontFamily: MN, fontSize: 11, color: VIO }}>{sensorD.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: MN, fontSize: 10, color: DIM }}>Coupling Γ</span>
                <input type="range" min={0.1} max={1.0} step={0.05} value={coupling}
                  onChange={e => setCoupling(Number(e.target.value))}
                  style={{ width: 80, accentColor: TEAL }} />
                <span style={{ fontFamily: MN, fontSize: 11, color: TEAL }}>{coupling.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <canvas ref={stackRef} width={1120} height={480}
            style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* ══════════ SYNTHESIS ══════════ */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
          {[
            { col: TEAL, domain: "Rheology", eq: "η(γ̇) = K·γ̇^(n−1)", detail: "Power-law (shear-thinning) fluid. η → 0 as γ̇ → ∞ for n < 1. Enables gel to flow under nozzle shear but hold shape at rest. Coupled to flow rate Q via Hagen-Poiseuille.", ref: "Ostwald-de Waele · Bird et al., 1987" },
            { col: GOLD, domain: "Conductivity", eq: "R = ρL / A", detail: "Gallium-based liquid metal (σ ≈ 3.7×10⁶ S/m) deposited in 3D traces. Trace cross-section A = w·h. Drude model: σ = ne²τ/mₑ — mean free path τ determines conductivity.", ref: "Drude 1900 · Kocak & Toprak, 2021" },
            { col: VIO, domain: "Kinetics", eq: "v = Vmax[S]/(Km+[S])", detail: "DNA strand displacement as enzymatic analogue. Km = half-saturation concentration. At [S] >> Km: v → Vmax. Cooperative logic via Hill equation. Massively parallel: N_sites × v × ρ_chem ops/s.", ref: "Michaelis & Menten 1913 · Seelig 2011" },
            { col: GRN, domain: "Stack", eq: "Z = R + 1/(iωC)", detail: "Each layer is an R-C element. Inter-layer coupling coefficient Γ = (Z₂−Z₁)/(Z₂+Z₁). Total stack height H = Σᵢhᵢ. Self-healing potential from gel matrix — damage restores via diffusion.", ref: "Bard & Faulkner, Electrochemical Methods" },
          ].map(({ col, domain, eq, detail, ref }) => (
            <div key={domain} style={{
              background: ha(col, 0.05), border: `1px solid ${ha(col, 0.20)}`,
              borderRadius: 4, padding: "10px 12px",
            }}>
              <div style={{ fontFamily: OR, fontSize: 10, color: col, letterSpacing: 1, marginBottom: 6 }}>
                {domain}
              </div>
              <div style={{ fontFamily: MN, fontSize: 11, color: col, marginBottom: 6 }}>{eq}</div>
              <div style={body}>{detail}</div>
              <div style={{ fontFamily: MN, fontSize: 9, color: DIM, marginTop: 6 }}>{ref}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

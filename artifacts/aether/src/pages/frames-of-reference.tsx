import { useState, useEffect, useRef } from "react";

/* ── palette ──────────────────────────────────────────────────────────── */
const C = {
  bg:     "#04060E",
  panel:  "rgba(8,12,28,0.72)",
  border: "rgba(200,160,80,0.12)",
  white:  "#EAE6F2",
  text:   "#A4A0B8",
  muted:  "#5A5870",
  gold:   "#C8A030",
  cyan:   "#00FFB2",
  rose:   "#FF6080",
  violet: "#B596E8",
  dim:    "#1A1830",
};
const MONO = "'Space Mono','DM Mono',monospace";
const SERIF = "'Cinzel','Crimson Pro',ui-serif,Georgia,serif";

/* ── physics helpers ──────────────────────────────────────────────────── */
function gamma(beta: number) { return 1 / Math.sqrt(1 - beta * beta); }

/* Lorentz transform: S -> S' (v = +beta*c) */
function lorentz(x: number, ct: number, beta: number) {
  const g = gamma(beta);
  return { x: g * (x - beta * ct), ct: g * (ct - beta * x) };
}
/* Lorentz transform: S -> S'' (v = -beta*c, anti-x') */
function lorentzAnti(x: number, ct: number, beta: number) {
  const g = gamma(beta);
  return { x: g * (x + beta * ct), ct: g * (ct + beta * x) };
}
/* Invariant interval (signature: +--) */
function interval(x: number, ct: number) { return ct * ct - x * x; }

/* ── Minkowski diagram canvas ─────────────────────────────────────────── */
const SCALE = 52;
const CX = 320, CY = 230;

function toScreen(x: number, ct: number): [number, number] {
  return [CX + x * SCALE, CY - ct * SCALE];
}

/* find param s where point+s*dir hits line ct=slope*x */
function hitXAxis(px: number, pct: number, dx: number, dct: number, slope: number): number {
  /* pct + s*dct = slope*(px + s*dx) => s = (slope*px - pct)/(dct - slope*dx) */
  const denom = dct - slope * dx;
  if (Math.abs(denom) < 1e-9) return Infinity;
  return (slope * px - pct) / denom;
}
/* find param s where point+s*dir hits line x=slope*ct */
function hitTAxis(px: number, pct: number, dx: number, dct: number, slope: number): number {
  /* px + s*dx = slope*(pct + s*dct) => s = (slope*pct - px)/(dx - slope*dct) */
  const denom = dx - slope * dct;
  if (Math.abs(denom) < 1e-9) return Infinity;
  return (slope * pct - px) / denom;
}

function drawAxes(ctx: CanvasRenderingContext2D, dx: number, dct: number, col: string, _label: string, len: number) {
  const [ox, oy] = toScreen(0, 0);
  for (let sign = -1; sign <= 1; sign += 2) {
    /* t-direction axis */
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + sign * dct * SCALE * len, oy - sign * 1 * SCALE * len);
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
    /* x-direction axis */
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + sign * dx * SCALE * len, oy - sign * dct * SCALE * len);
    ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
  }
}

interface CanvasProps { beta: number; ex: number; ect: number; }

function MinkowskiCanvas({ beta, ex, ect }: CanvasProps) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 640, H = 460;
    canvas.width = W; canvas.height = H;

    ctx.clearRect(0, 0, W, H);

    /* background */
    ctx.fillStyle = "#030409"; ctx.fillRect(0, 0, W, H);
    /* faint grid */
    ctx.strokeStyle = "rgba(255,255,255,0.035)"; ctx.lineWidth = 0.5;
    for (let i = -5; i <= 5; i++) {
      const [sx] = toScreen(i, 0); ctx.beginPath(); ctx.moveTo(sx, 0); ctx.lineTo(sx, H); ctx.stroke();
      const [,sy] = toScreen(0, i); ctx.beginPath(); ctx.moveTo(0, sy); ctx.lineTo(W, sy); ctx.stroke();
    }

    const b = beta;

    /* ── light cone ── */
    ctx.setLineDash([4, 6]); ctx.strokeStyle = "rgba(255,255,255,0.22)"; ctx.lineWidth = 0.8;
    /* ct = x */
    ctx.beginPath(); ctx.moveTo(...toScreen(-5, -5)); ctx.lineTo(...toScreen(5, 5)); ctx.stroke();
    /* ct = -x */
    ctx.beginPath(); ctx.moveTo(...toScreen(-5, 5)); ctx.lineTo(...toScreen(5, -5)); ctx.stroke();
    ctx.setLineDash([]);

    /* light cone label */
    ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = `8px ${MONO}`;
    ctx.fillText("ct = x", ...toScreen(3.2, 3.2)); ctx.textAlign = "right";
    ctx.fillText("ct = -x", ...toScreen(-3.0, 3.0)); ctx.textAlign = "left";

    /* ── S frame axes (gold) ── */
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.6;
    /* x-axis */
    ctx.beginPath(); ctx.moveTo(...toScreen(-4.5, 0)); ctx.lineTo(...toScreen(4.5, 0)); ctx.stroke();
    /* ct-axis */
    ctx.beginPath(); ctx.moveTo(...toScreen(0, -4)); ctx.lineTo(...toScreen(0, 4)); ctx.stroke();
    /* labels */
    ctx.fillStyle = C.gold; ctx.font = `bold 10px ${MONO}`;
    ctx.fillText("x", ...toScreen(4.2, 0.15));
    ctx.fillText("ct", ...toScreen(0.1, 3.8));
    /* tick marks */
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const [sx, sy] = toScreen(i, 0);
      ctx.beginPath(); ctx.moveTo(sx, sy - 3); ctx.lineTo(sx, sy + 3); ctx.strokeStyle = C.gold + "88"; ctx.lineWidth = 0.8; ctx.stroke();
      const [sx2, sy2] = toScreen(0, i);
      ctx.beginPath(); ctx.moveTo(sx2 - 3, sy2); ctx.lineTo(sx2 + 3, sy2); ctx.stroke();
    }

    /* ── S' frame axes (cyan): x' axis along ct=beta*x, ct' axis along x=beta*ct ── */
    /* t' axis direction in (x,ct): (beta, 1) — worldline of S' origin */
    /* x' axis direction in (x,ct): (1, beta) */
    if (b > 0.001) {
      ctx.strokeStyle = C.cyan + "cc"; ctx.lineWidth = 1.6;
      /* ct' axis: x = beta*ct  →  parametric (beta*s, s) */
      ctx.beginPath();
      ctx.moveTo(...toScreen(b * -4, -4)); ctx.lineTo(...toScreen(b * 4, 4)); ctx.stroke();
      /* x' axis: ct = beta*x  →  parametric (s, beta*s) */
      ctx.beginPath();
      ctx.moveTo(...toScreen(-4, b * -4)); ctx.lineTo(...toScreen(4, b * 4)); ctx.stroke();
      ctx.fillStyle = C.cyan; ctx.font = `bold 9px ${MONO}`;
      ctx.fillText("ct'", ...toScreen(b * 3.6 + 0.1, 3.6));
      ctx.fillText("x'",  ...toScreen(3.8, b * 3.8 + 0.15));
    }

    /* ── anti-x' (rose): ct'' axis: x = -beta*ct, x'' axis: ct = -beta*x ── */
    if (b > 0.001) {
      ctx.strokeStyle = C.rose + "cc"; ctx.lineWidth = 1.6;
      /* ct'' axis: x = -beta*ct → parametric (-beta*s, s) */
      ctx.beginPath();
      ctx.moveTo(...toScreen(-b * -4, -4)); ctx.lineTo(...toScreen(-b * 4, 4)); ctx.stroke();
      /* x'' axis: ct = -beta*x → parametric (s, -beta*s) */
      ctx.beginPath();
      ctx.moveTo(...toScreen(-4, b * 4)); ctx.lineTo(...toScreen(4, -b * 4)); ctx.stroke();
      ctx.fillStyle = C.rose; ctx.font = `bold 9px ${MONO}`;
      ctx.fillText("ct''", ...toScreen(-b * 3.6 - 0.6, 3.6));
      ctx.fillText("x''",  ...toScreen(3.8, -b * 3.8 - 0.25));
    }

    /* ── event E ── */
    const [esx, esy] = toScreen(ex, ect);

    /* projection from E to S axes */
    /* vertical line from E to x-axis */
    ctx.setLineDash([2, 4]); ctx.strokeStyle = C.gold + "88"; ctx.lineWidth = 0.9;
    ctx.beginPath(); ctx.moveTo(esx, esy); ctx.lineTo(esx, CY); ctx.stroke();
    /* horizontal line from E to ct-axis */
    ctx.beginPath(); ctx.moveTo(esx, esy); ctx.lineTo(CX, esy); ctx.stroke();
    ctx.setLineDash([]);

    if (b > 0.001) {
      const primed = lorentz(ex, ect, b);
      const antiP  = lorentzAnti(ex, ect, b);

      /* ── projection to S' axes ── */
      /* From E, go parallel to ct' direction (beta, 1) until hitting x' axis (ct = beta*x) */
      const s1 = hitXAxis(ex, ect, b, 1, b);
      if (isFinite(s1)) {
        const [hx, hct] = [ex + b * s1, ect + s1];
        ctx.setLineDash([2, 4]); ctx.strokeStyle = C.cyan + "88"; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(esx, esy); ctx.lineTo(...toScreen(hx, hct)); ctx.stroke();
        /* tick on x' axis */
        const [tx, ty] = toScreen(hx, hct);
        ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.cyan + "aa"; ctx.fill();
        ctx.font = `8px ${MONO}`; ctx.fillStyle = C.cyan + "cc"; ctx.textAlign = "left";
        ctx.fillText(`x'=${primed.x.toFixed(2)}`, tx + 5, ty - 3);
      }
      /* From E, go parallel to x' direction (1, beta) until hitting ct' axis (x = beta*ct) */
      const s2 = hitTAxis(ex, ect, 1, b, b);
      if (isFinite(s2)) {
        const [hx, hct] = [ex + s2, ect + b * s2];
        ctx.setLineDash([2, 4]); ctx.strokeStyle = C.cyan + "66"; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(esx, esy); ctx.lineTo(...toScreen(hx, hct)); ctx.stroke();
        const [tx, ty] = toScreen(hx, hct);
        ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.cyan + "aa"; ctx.fill();
        ctx.font = `8px ${MONO}`; ctx.fillStyle = C.cyan + "cc"; ctx.textAlign = "right";
        ctx.fillText(`ct'=${primed.ct.toFixed(2)}`, tx - 5, ty - 3);
      }
      ctx.setLineDash([]);

      /* ── projection to anti-x' axes ── */
      /* From E, parallel to ct'' direction (-beta, 1) until hitting x'' axis (ct = -beta*x) */
      const s3 = hitXAxis(ex, ect, -b, 1, -b);
      if (isFinite(s3)) {
        const [hx, hct] = [ex + -b * s3, ect + s3];
        ctx.setLineDash([2, 4]); ctx.strokeStyle = C.rose + "88"; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(esx, esy); ctx.lineTo(...toScreen(hx, hct)); ctx.stroke();
        const [tx, ty] = toScreen(hx, hct);
        ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.rose + "aa"; ctx.fill();
        ctx.font = `8px ${MONO}`; ctx.fillStyle = C.rose + "cc"; ctx.textAlign = "right";
        ctx.fillText(`x''=${antiP.x.toFixed(2)}`, tx - 5, ty + 10);
      }
      /* From E, parallel to x'' direction (1, -beta) until hitting ct'' axis (x = -beta*ct) */
      const s4 = hitTAxis(ex, ect, 1, -b, -b);
      if (isFinite(s4)) {
        const [hx, hct] = [ex + s4, ect + -b * s4];
        ctx.setLineDash([2, 4]); ctx.strokeStyle = C.rose + "66"; ctx.lineWidth = 0.9;
        ctx.beginPath(); ctx.moveTo(esx, esy); ctx.lineTo(...toScreen(hx, hct)); ctx.stroke();
        const [tx, ty] = toScreen(hx, hct);
        ctx.beginPath(); ctx.arc(tx, ty, 3, 0, Math.PI * 2);
        ctx.fillStyle = C.rose + "aa"; ctx.fill();
        ctx.font = `8px ${MONO}`; ctx.fillStyle = C.rose + "cc"; ctx.textAlign = "left";
        ctx.fillText(`ct''=${antiP.ct.toFixed(2)}`, tx + 5, ty + 10);
      }
      ctx.setLineDash([]);
    }

    /* coordinate dot marks on S axes */
    const [dotX] = toScreen(ex, 0);
    ctx.beginPath(); ctx.arc(dotX, CY, 4, 0, Math.PI * 2);
    ctx.fillStyle = C.gold + "aa"; ctx.fill();
    ctx.font = `8px ${MONO}`; ctx.fillStyle = C.gold + "cc"; ctx.textAlign = "center";
    ctx.fillText(`x=${ex.toFixed(2)}`, dotX, CY + 14);

    const [,dotY] = toScreen(0, ect);
    ctx.beginPath(); ctx.arc(CX, dotY, 4, 0, Math.PI * 2);
    ctx.fillStyle = C.gold + "aa"; ctx.fill();
    ctx.font = `8px ${MONO}`; ctx.fillStyle = C.gold + "cc"; ctx.textAlign = "right";
    ctx.fillText(`ct=${ect.toFixed(2)}`, CX - 8, dotY + 3);

    /* event glow */
    const grd = ctx.createRadialGradient(esx, esy, 0, esx, esy, 18);
    grd.addColorStop(0, "rgba(255,255,255,0.9)");
    grd.addColorStop(0.35, "rgba(200,200,255,0.4)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.beginPath(); ctx.arc(esx, esy, 18, 0, Math.PI * 2);
    ctx.fillStyle = grd; ctx.fill();
    ctx.beginPath(); ctx.arc(esx, esy, 5, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff"; ctx.fill();

    /* E label */
    ctx.font = `bold 11px ${MONO}`; ctx.fillStyle = "#ffffff"; ctx.textAlign = "left";
    ctx.fillText("E", esx + 8, esy - 6);

    /* FRAME legend */
    const legendX = 14, legendY = H - 18;
    [
      ["S", C.gold],
      ["S' (x')", C.cyan],
      ["S'' (anti-x')", C.rose],
      ["light cone", "rgba(255,255,255,0.4)"],
    ].forEach(([lbl, col], li) => {
      const lx = legendX + li * 130;
      ctx.fillStyle = col; ctx.font = `8px ${MONO}`;
      ctx.fillRect(lx, legendY - 6, 14, 3);
      ctx.fillStyle = col; ctx.fillText(lbl, lx + 18, legendY - 1);
    });

  }, [beta, ex, ect]);

  return (
    <canvas ref={ref}
      style={{ width:"100%", maxWidth:640, height:"auto", display:"block", margin:"0 auto",
        borderRadius:10, border:`1px solid ${C.border}` }} />
  );
}

/* ── slider ───────────────────────────────────────────────────────────── */
function Slider({ label, value, min, max, step, onChange, color }:
  { label: string; value: number; min: number; max: number; step: number; onChange:(v:number)=>void; color: string }) {
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontFamily:MONO, fontSize:9, letterSpacing:".16em", textTransform:"uppercase", color:C.muted }}>{label}</span>
        <span style={{ fontFamily:MONO, fontSize:10, color, fontWeight:700 }}>{value.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width:"100%", accentColor:color, cursor:"pointer" }} />
    </div>
  );
}

/* ── equation row ─────────────────────────────────────────────────────── */
function EqRow({ lhs, rhs, color }: { lhs: string; rhs: string; color: string }) {
  return (
    <div style={{ display:"flex", gap:12, alignItems:"baseline", padding:"6px 0",
      borderBottom:"1px solid rgba(255,255,255,0.04)", fontFamily:MONO }}>
      <span style={{ fontSize:11, color, minWidth:90, textAlign:"right" }}>{lhs}</span>
      <span style={{ fontSize:11, color:"rgba(255,255,255,0.2)" }}>=</span>
      <span style={{ fontSize:11, color:C.text }}>{rhs}</span>
    </div>
  );
}

/* ── main page ────────────────────────────────────────────────────────── */
export default function FramesOfReferencePage() {
  const [beta, setBeta] = useState(0.5);
  const [ex,   setEx]   = useState(1.5);
  const [ect,  setEct]  = useState(2.0);

  const b   = beta;
  const g   = gamma(b);
  const Ep  = lorentz(ex, ect, b);
  const Epp = lorentzAnti(ex, ect, b);
  const s2  = interval(ex, ect);
  const s2p = interval(Ep.x, Ep.ct);

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:SERIF }}>
      <style>{`
        @keyframes fr-fadein { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fr-fadein { animation:fr-fadein 500ms ease-out both; }
        input[type=range] { -webkit-appearance:none; height:3px; border-radius:2px; background:rgba(255,255,255,0.08); }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:13px; height:13px; border-radius:50%; cursor:pointer; }
      `}</style>

      <div style={{ maxWidth:1080, margin:"0 auto", padding:"40px 32px 80px" }}>

        {/* hero */}
        <div className="fr-fadein" style={{ marginBottom:32, maxWidth:720 }}>
          <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:".3em", textTransform:"uppercase", color:C.muted, marginBottom:8 }}>
            Physics · Frames of Reference · Symmetry Derivation
          </div>
          <h1 style={{ margin:0, fontSize:38, color:C.white, letterSpacing:".015em", lineHeight:1.05 }}>
            x' and <span style={{ color:C.rose }}>anti-x'</span>
          </h1>
          <div style={{ width:"58%", height:1, background:`linear-gradient(90deg,${C.gold}66,${C.rose}33,transparent)`, margin:"14px 0 16px" }} />
          <p style={{ fontFamily:"'Crimson Pro',ui-serif,Georgia,serif", fontSize:15, lineHeight:1.7, color:C.text, margin:0 }}>
            Two observers share a single event. Observer A rides frame S -- at rest, axes upright.
            Observer B rides frame S', moving at velocity v = {'\u03B2'}c rightward.
            Observer anti-B rides frame S'' (anti-x'), moving at -v leftward.
            The event E is real; only the coordinates disagree.
          </p>
          <p style={{ fontFamily:MONO, fontSize:10, color:C.muted, marginTop:10, fontStyle:"italic" }}>
            -- drag the sliders to move the event and tune the velocity
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:24, alignItems:"start" }}>

          {/* ── LEFT: diagram + sliders ── */}
          <div>
            <div className="fr-fadein" style={{ animationDelay:"80ms", marginBottom:20,
              background:C.panel, borderRadius:14, border:`1px solid ${C.border}`, padding:"18px 18px 14px", overflow:"hidden" }}>
              <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:C.gold, marginBottom:14 }}>
                MINKOWSKI SPACETIME DIAGRAM
              </div>
              <MinkowskiCanvas beta={b} ex={ex} ect={ect} />
              <div style={{ marginTop:16, paddingTop:14, borderTop:"1px solid rgba(255,255,255,0.05)" }}>
                <Slider label="velocity  beta = v/c" value={b}   min={0}    max={0.95} step={0.01} onChange={setBeta} color={C.cyan} />
                <Slider label="event  x  (spatial)"  value={ex}  min={-3.5} max={3.5}  step={0.05} onChange={setEx}   color={C.gold} />
                <Slider label="event  ct (temporal)"  value={ect} min={-3.5} max={3.5}  step={0.05} onChange={setEct}  color={C.gold} />
              </div>
            </div>

            {/* Lorentz equations block */}
            <div className="fr-fadein" style={{ animationDelay:"160ms",
              background:C.panel, borderRadius:14, border:`1px solid ${C.border}`, padding:"18px 20px" }}>
              <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:".2em", textTransform:"uppercase", color:C.muted, marginBottom:14 }}>
                Lorentz Transformation
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".14em", color:C.cyan, marginBottom:6 }}>S -- S' &nbsp;(v = +{'\u03B2'}c)</div>
                  <EqRow lhs="x'"  rhs={`\u03B3 (x \u2212 \u03B2 ct)`} color={C.cyan} />
                  <EqRow lhs="ct'" rhs={`\u03B3 (ct \u2212 \u03B2 x)`} color={C.cyan} />
                </div>
                <div>
                  <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".14em", color:C.rose, marginBottom:6 }}>S -- S'' &nbsp;(v = \u2212{'\u03B2'}c)</div>
                  <EqRow lhs="x''"  rhs={`\u03B3 (x + \u03B2 ct)`} color={C.rose} />
                  <EqRow lhs="ct''" rhs={`\u03B3 (ct + \u03B2 x)`} color={C.rose} />
                </div>
              </div>
              <div style={{ marginTop:14, paddingTop:12, borderTop:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".14em", color:C.violet, marginBottom:6 }}>Symmetry identity</div>
                <EqRow lhs="x' + x''" rhs={`2\u03B3 x`} color={C.violet} />
                <EqRow lhs="x' \u2212 x''" rhs={`\u22122\u03B3\u03B2 ct`} color={C.violet} />
                <EqRow lhs="s\u00B2 = ct\u00B2 \u2212 x\u00B2" rhs="invariant in all frames" color="rgba(255,255,255,0.35)" />
              </div>
            </div>
          </div>

          {/* ── RIGHT: live numbers panel ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* gamma card */}
            <div className="fr-fadein" style={{ animationDelay:"120ms",
              background:C.panel, borderRadius:12, border:`1px solid ${C.border}`, padding:"16px 18px" }}>
              <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".2em", textTransform:"uppercase", color:C.muted, marginBottom:10 }}>Lorentz Factor</div>
              <div style={{ fontFamily:MONO, fontSize:28, color:C.white, fontWeight:700, marginBottom:4 }}>{g.toFixed(4)}</div>
              <div style={{ fontFamily:MONO, fontSize:9, color:C.muted }}>{'\u03B3'} = 1 / sqrt(1 - {'\u03B2'}\u00B2)</div>
              <div style={{ marginTop:10, height:4, background:"rgba(255,255,255,0.06)", borderRadius:2 }}>
                <div style={{ height:"100%", width:`${Math.min(100, (g - 1) / 9 * 100)}%`,
                  background:`linear-gradient(90deg,${C.cyan}88,${C.rose})`, borderRadius:2, transition:"width .3s" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:MONO, fontSize:8, color:C.muted, marginTop:4 }}>
                <span>1 (rest)</span><span>10 (v~0.995c)</span>
              </div>
            </div>

            {/* Frame S */}
            <div className="fr-fadein" style={{ animationDelay:"140ms",
              background:`rgba(200,160,48,0.06)`, borderRadius:12,
              border:`1px solid ${C.gold}33`, padding:"16px 18px" }}>
              <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:C.gold, marginBottom:10 }}>
                Frame S -- Observer A
              </div>
              {[["x", ex.toFixed(3)],["ct", ect.toFixed(3)],["s\u00B2", s2.toFixed(3)]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0",
                  borderBottom:"1px solid rgba(200,160,48,0.08)", fontFamily:MONO, fontSize:11 }}>
                  <span style={{ color:C.gold + "88" }}>{k}</span>
                  <span style={{ color:C.white }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Frame S' */}
            <div className="fr-fadein" style={{ animationDelay:"160ms",
              background:"rgba(0,255,178,0.05)", borderRadius:12,
              border:`1px solid ${C.cyan}33`, padding:"16px 18px" }}>
              <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:C.cyan, marginBottom:10 }}>
                Frame S' -- x' (v = +{'\u03B2'}c)
              </div>
              {[["x'", Ep.x.toFixed(3)],["ct'", Ep.ct.toFixed(3)],["s\u00B2", s2p.toFixed(3)]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0",
                  borderBottom:"1px solid rgba(0,255,178,0.08)", fontFamily:MONO, fontSize:11 }}>
                  <span style={{ color:C.cyan + "88" }}>{k}</span>
                  <span style={{ color:C.white }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Frame anti-x' */}
            <div className="fr-fadein" style={{ animationDelay:"180ms",
              background:"rgba(255,96,128,0.05)", borderRadius:12,
              border:`1px solid ${C.rose}33`, padding:"16px 18px" }}>
              <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:C.rose, marginBottom:10 }}>
                Frame S'' -- anti-x' (v = -{'\u03B2'}c)
              </div>
              {[["x''", Epp.x.toFixed(3)],["ct''", Epp.ct.toFixed(3)],["s\u00B2", interval(Epp.x, Epp.ct).toFixed(3)]].map(([k,v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0",
                  borderBottom:"1px solid rgba(255,96,128,0.08)", fontFamily:MONO, fontSize:11 }}>
                  <span style={{ color:C.rose + "88" }}>{k}</span>
                  <span style={{ color:C.white }}>{v}</span>
                </div>
              ))}
            </div>

            {/* symmetry check */}
            <div className="fr-fadein" style={{ animationDelay:"200ms",
              background:"rgba(181,150,232,0.05)", borderRadius:12,
              border:`1px solid ${C.violet}33`, padding:"16px 18px" }}>
              <div style={{ fontFamily:MONO, fontSize:8, letterSpacing:".18em", textTransform:"uppercase", color:C.violet, marginBottom:10 }}>
                Symmetry Check
              </div>
              {[
                ["x' + x''", (Ep.x + Epp.x).toFixed(3), `2\u03B3x = ${(2*g*ex).toFixed(3)}`],
                ["x' - x''", (Ep.x - Epp.x).toFixed(3), `-2\u03B3\u03B2ct = ${(-2*g*b*ect).toFixed(3)}`],
              ].map(([k, v, expected]) => (
                <div key={k as string} style={{ padding:"5px 0", borderBottom:"1px solid rgba(181,150,232,0.08)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", fontFamily:MONO, fontSize:11 }}>
                    <span style={{ color:C.violet + "88" }}>{k}</span>
                    <span style={{ color:C.white }}>{v}</span>
                  </div>
                  <div style={{ fontFamily:MONO, fontSize:8, color:C.muted, marginTop:2 }}>{expected}</div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── SYMMETRY DERIVATION section ── */}
        <div className="fr-fadein" style={{ animationDelay:"240ms", marginTop:32,
          background:C.panel, borderRadius:14, border:`1px solid ${C.border}`, padding:"24px 28px" }}>
          <div style={{ fontFamily:MONO, fontSize:9, letterSpacing:".22em", textTransform:"uppercase", color:C.muted, marginBottom:18 }}>
            Symmetry Derivation -- why x' and anti-x' are mirrors
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:24 }}>
            {[
              {
                num:"01", col:C.cyan, title:"Boost symmetry",
                body:"The Lorentz boost L(v) has an inverse L(-v). If B moves at +v relative to A, then A moves at -v relative to B. anti-x' is precisely the boost L(-v) applied to the same event."
              },
              {
                num:"02", col:C.violet, title:"Invariant interval",
                body:"s\u00B2 = c\u00B2t\u00B2 - x\u00B2 is unchanged by any Lorentz boost. All three frames agree on s\u00B2 even when they disagree on x and t. This is the Minkowski 'distance' -- the geometry beneath the coordinates."
              },
              {
                num:"03", col:C.rose, title:"The mirror identity",
                body:"x' + x'' = 2\u03B3x and x' - x'' = -2\u03B3\u03B2ct. The sum recovers the spatial position scaled by \u03B3; the difference encodes the time coordinate scaled by \u03B3\u03B2. x' and x'' are Lorentz-conjugate partners."
              },
            ].map(s => (
              <div key={s.num} style={{ borderLeft:`2px solid ${s.col}44`, paddingLeft:16 }}>
                <div style={{ fontFamily:MONO, fontSize:8, color:s.col, letterSpacing:".16em", marginBottom:6 }}>{s.num} -- {s.title.toUpperCase()}</div>
                <p style={{ fontFamily:"'Crimson Pro',ui-serif,Georgia,serif", fontSize:13.5, lineHeight:1.65, color:C.text, margin:0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* coda */}
        <div className="fr-fadein" style={{ animationDelay:"320ms", marginTop:28, maxWidth:700 }}>
          <div style={{ height:1, background:`linear-gradient(90deg,transparent,${C.gold}33,${C.rose}33,transparent)`, marginBottom:20 }} />
          <p style={{ fontFamily:"'Crimson Pro',ui-serif,Georgia,serif", fontSize:14, lineHeight:1.8, color:C.muted, margin:0, fontStyle:"italic" }}>
            Every observer tells a different story. None are wrong.
            The event exists before any coordinate touches it -- absolute in spacetime, relative in expression.
            AETHER reads the invariant beneath every frame.
          </p>
        </div>

      </div>
    </div>
  );
}

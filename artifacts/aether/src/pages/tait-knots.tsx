import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

/* ── Palette ─────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── 3-D vector helpers ───────── */
type V3 = [number, number, number];
function rotY(p: V3, a: number): V3 {
  return [p[0]*Math.cos(a)+p[2]*Math.sin(a), p[1], -p[0]*Math.sin(a)+p[2]*Math.cos(a)];
}
function rotX(p: V3, a: number): V3 {
  return [p[0], p[1]*Math.cos(a)-p[2]*Math.sin(a), p[1]*Math.sin(a)+p[2]*Math.cos(a)];
}
function proj(p: V3, cx: number, cy: number, sc: number): [number, number, number] {
  return [cx + sc * p[0], cy + sc * p[1], p[2]];
}

/* ── Tait knot parametrisations ── */
const KNOTS = [
  { id: "0₁", name: "Unknot",         cross: 0, col: TEAL,  device: "TOKAMAK",      dCol: TEAL,
    fn: (t: number): V3 => [Math.cos(t), Math.sin(t), 0] },
  { id: "3₁", name: "Trefoil",         cross: 3, col: GOLD,  device: "STELLARATOR",  dCol: GOLD,
    fn: (t: number): V3 => [Math.sin(t)+2*Math.sin(2*t), Math.cos(t)-2*Math.cos(2*t), -Math.sin(3*t)] },
  { id: "4₁", name: "Figure-Eight",    cross: 4, col: VIO,   device: "REV. FIELD PINCH", dCol: VIO,
    fn: (t: number): V3 => [(2+Math.cos(2*t))*Math.cos(3*t)*0.42, (2+Math.cos(2*t))*Math.sin(3*t)*0.42, Math.sin(4*t)] },
  { id: "5₁", name: "Cinquefoil",      cross: 5, col: AMB,   device: "SPHEROMAK",    dCol: AMB,
    fn: (t: number): V3 => [Math.sin(t)+2*Math.sin(2*t)-Math.sin(4*t)*0.5, Math.cos(t)+2*Math.cos(2*t)-Math.cos(4*t)*0.5, Math.sin(5*t)*0.7] },
  { id: "5₂", name: "Three-Twist",     cross: 5, col: ROSE,  device: "TOKAMAK q=5/2", dCol: TEAL,
    fn: (t: number): V3 => [Math.cos(2*t)-Math.cos(3*t), Math.sin(2*t)+Math.sin(3*t), Math.sin(5*t)*0.65] },
  { id: "6₁", name: "Stevedore",       cross: 6, col: BLUE,  device: "STELLARATOR ι=6", dCol: GOLD,
    fn: (t: number): V3 => [Math.sin(t)+2*Math.sin(2*t)+Math.sin(3*t)*0.4, Math.cos(t)-2*Math.cos(2*t)-Math.cos(3*t)*0.4, Math.sin(4*t)*0.6] },
  { id: "6₂", name: "Miller Inst.",    cross: 6, col: GRN,   device: "SPHEROMAK Taylor", dCol: AMB,
    fn: (t: number): V3 => [(2+Math.cos(4*t))*Math.cos(3*t)*0.40, (2+Math.cos(4*t))*Math.sin(3*t)*0.40, Math.sin(6*t)*0.75] },
  { id: "7₁", name: "Heptafoil",       cross: 7, col: ROSE,  device: "TOKAMAK q=7/2", dCol: TEAL,
    fn: (t: number): V3 => [(2+Math.cos(7*t))*Math.cos(2*t)*0.44, (2+Math.cos(7*t))*Math.sin(2*t)*0.44, Math.sin(7*t)*0.60] },
];

/* ══════════════════════════════════════════════════════════════
   CANVAS 1 — TAIT KNOT GALLERY
   8 knots rotating in 3D · depth-sorted tube rendering
══════════════════════════════════════════════════════════════ */
function KnotGalleryCanvas({ onSelect }: { onSelect: (i: number) => void }) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [sel, setSel] = useState(-1);
  const selRef = useRef(-1);
  useEffect(() => { selRef.current = sel; }, [sel]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const COLS = 4, ROWS = 2;
    const CW = W / COLS, CH = H / ROWS;
    const N = 200;

    let t = 0;
    const phases = KNOTS.map((_, i) => i * 0.37);

    const draw = () => {
      t += 0.008;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      KNOTS.forEach((k, ki) => {
        const col2 = ki % COLS, row2 = Math.floor(ki / COLS);
        const cx = col2 * CW + CW / 2, cy = row2 * CH + CH / 2;
        const sc = Math.min(CW, CH) * 0.155;
        const isSel = selRef.current === ki;

        // Cell bg
        if (isSel) {
          ctx.fillStyle = `${k.col}12`;
          ctx.fillRect(col2 * CW + 2, row2 * CH + 2, CW - 4, CH - 4);
        }

        // Compute & project points
        const ry = t + phases[ki];
        const rx = 0.38;
        const pts: [number, number, number][] = [];
        for (let i = 0; i <= N; i++) {
          const theta = (i / N) * Math.PI * 2;
          const p0 = k.fn(theta);
          // normalise scale
          const mag = Math.sqrt(p0[0]**2 + p0[1]**2 + p0[2]**2) || 1;
          const pn: V3 = [p0[0]/mag*1.5, p0[1]/mag*1.5, p0[2]/mag*1.5];
          const pr = rotX(rotY(pn, ry), rx);
          pts.push(proj(pr, cx, cy, sc));
        }

        // Build segments sorted by depth
        const segs: { x1: number; y1: number; x2: number; y2: number; d: number }[] = [];
        for (let i = 0; i < N; i++) {
          segs.push({ x1: pts[i][0], y1: pts[i][1], x2: pts[i+1][0], y2: pts[i+1][1],
            d: (pts[i][2] + pts[i+1][2]) / 2 });
        }
        segs.sort((a, b) => a.d - b.d);

        // Draw tube segments
        for (const s of segs) {
          const al = 0.18 + 0.82 * Math.max(0, Math.min(1, (s.d + 2) / 4));
          const lw = isSel ? 2.8 : 1.8;
          ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2);
          ctx.strokeStyle = k.col + Math.round(al * 255).toString(16).padStart(2, "0");
          ctx.lineWidth = lw * (0.6 + 0.4 * al);
          ctx.stroke();
        }

        // Glow core at bright depth points
        for (let i = 0; i < N; i += 10) {
          const [px, py, pz] = pts[i];
          if (pz > 0.8) {
            const gr = ctx.createRadialGradient(px, py, 0, px, py, isSel ? 7 : 5);
            gr.addColorStop(0, k.col + "aa"); gr.addColorStop(1, k.col + "00");
            ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(px, py, isSel ? 7 : 5, 0, Math.PI * 2); ctx.fill();
          }
        }

        // Labels
        ctx.font = `${isSel ? 9 : 7.5}px ${mono}`; ctx.textAlign = "center";
        ctx.fillStyle = isSel ? k.col : k.col + "aa"; ctx.textBaseline = "bottom";
        ctx.fillText(`${k.id} · ${k.name}`, cx, (row2 + 1) * CH - 8);
        ctx.font = `6px ${mono}`; ctx.fillStyle = DIM;
        ctx.fillText(`c = ${k.cross}   →  ${k.device}`, cx, (row2 + 1) * CH - 0);

        // Cell border
        ctx.strokeStyle = isSel ? `${k.col}60` : `${DIM}20`;
        ctx.lineWidth = isSel ? 1.5 : 0.5;
        ctx.strokeRect(col2 * CW + 2, row2 * CH + 2, CW - 4, CH - 4);
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    // Click to select
    const handleClick = (e: MouseEvent) => {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (W / rect.width);
      const my = (e.clientY - rect.top) * (H / rect.height);
      const col3 = Math.floor(mx / (W / COLS));
      const row3 = Math.floor(my / (H / ROWS));
      const idx = row3 * COLS + col3;
      if (idx >= 0 && idx < KNOTS.length) {
        setSel(idx); onSelect(idx);
      }
    };
    cv.addEventListener("click", handleClick);
    return () => { cancelAnimationFrame(rafRef.current); cv.removeEventListener("click", handleClick); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <canvas ref={cvRef} width={900} height={380}
        style={{ width:"100%", display:"block", borderRadius:12,
          border:`1px solid ${DIM}25`, background:BG, cursor:"pointer" }} />
      <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:6, lineHeight:2 }}>
        CLICK ANY KNOT to select and see its plasma morphology below ·
        DEPTH-SORTED tube rendering (back=dim, front=bright) ·
        Knots rotate continuously — topology visible in 3D ·
        c = crossing number · arrow shows which plasma device maps to that knot topology
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CANVAS 2 — FOUR PLASMA MORPHS
   2×2 grid · each quadrant: Tait knot → plasma device schematic
   Animated: plasma glow + magnetic field lines overlay
══════════════════════════════════════════════════════════════ */
function FourMorphsCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const HW = W / 2, HH = H / 2;
    let t = 0;

    /* ── per-quadrant drawers ── */

    const drawTokamak = (cx: number, cy: number, t2: number) => {
      // 0₁ unknot → simple toroidal ring
      // Draw nested D-shaped flux surfaces
      const R = Math.min(HW, HH) * 0.28;
      for (let s = 7; s >= 0; s--) {
        const frac = s / 7;
        const r = R * frac;
        const al = 0.06 + frac * 0.35;
        ctx.beginPath();
        for (let i = 0; i <= 80; i++) {
          const a = (i / 80) * Math.PI * 2;
          const x = cx + r * Math.cos(a + Math.asin(0.33) * Math.sin(a));
          const y = cy + r * 1.7 * Math.sin(a);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        if (s < 7) {
          ctx.fillStyle = `rgba(46,240,216,${al * 0.25})`;
          ctx.fill();
        }
        ctx.strokeStyle = `rgba(46,240,216,${al * 0.9})`; ctx.lineWidth = s === 7 ? 1.6 : 0.7; ctx.stroke();
      }
      // Plasma glow
      const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.7);
      pg.addColorStop(0, "rgba(255,255,200,0.70)"); pg.addColorStop(0.4, "rgba(46,240,216,0.25)");
      pg.addColorStop(1, "rgba(2,4,8,0)");
      ctx.fillStyle = pg; ctx.fillRect(cx - R, cy - R * 1.7, R * 2, R * 3.4);
      // Safety factor q annotation
      ctx.font = `7px ${mono}`; ctx.fillStyle = `${TEAL}90`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("q = m/n  safety factor", cx, cy + R * 1.7 + 8);
      // Unknot overlay (thin ring)
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.25, R * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `${TEAL}50`; ctx.lineWidth = 1; ctx.setLineDash([4, 6]); ctx.stroke(); ctx.setLineDash([]);
      // Rotation marker
      const a2 = t2 * 0.7;
      const mx = cx + R * 1.25 * Math.cos(a2), my2 = cy + R * 0.42 * Math.sin(a2);
      ctx.beginPath(); ctx.arc(mx, my2, 3, 0, Math.PI * 2); ctx.fillStyle = TEAL + "cc"; ctx.fill();
    };

    const drawStellarator = (cx: number, cy: number, t2: number) => {
      // 3₁ trefoil → helical external coil winding
      const R = Math.min(HW, HH) * 0.24;
      // Main torus
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.2, R * 0.38, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `${GOLD}40`; ctx.lineWidth = 1.2; ctx.stroke();
      // Helical coils (trefoil winding) — 3 coil periods
      for (let n = 0; n < 3; n++) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const a2 = (i / 100) * Math.PI * 2 + t2 * 0.3;
          const phase = n * Math.PI * 2 / 3;
          const coilR = R * (0.9 + 0.30 * Math.cos(3 * (a2 + phase)));
          const x = cx + coilR * Math.cos(a2);
          const y = cy + coilR * 0.36 * Math.sin(a2);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        const coilCols = [GOLD, AMB, TEAL];
        ctx.strokeStyle = coilCols[n] + "cc"; ctx.lineWidth = 1.8; ctx.stroke();
      }
      // Plasma glow in center
      const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      pg.addColorStop(0, "rgba(255,220,100,0.65)"); pg.addColorStop(0.5, "rgba(201,168,76,0.20)");
      pg.addColorStop(1, "rgba(2,4,8,0)");
      ctx.fillStyle = pg; ctx.fillRect(cx - R, cy - R * 0.5, R * 2, R);
      // Rotational transform annotation
      ctx.font = `7px ${mono}`; ctx.fillStyle = `${GOLD}90`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("ι = rotational transform  (no current)", cx, cy + R * 0.5 + 12);
    };

    const drawRFP = (cx: number, cy: number, t2: number) => {
      // 4₁ figure-eight → toroidal field reversal at edge
      const R = Math.min(HW, HH) * 0.26;
      // Outer cylinder
      ctx.strokeStyle = `${VIO}50`; ctx.lineWidth = 1.5;
      ctx.strokeRect(cx - R * 1.1, cy - R * 0.65, R * 2.2, R * 1.3);
      // Toroidal field lines — positive inside, negative outside (reversed)
      const NL = 12;
      for (let li = 0; li < NL; li++) {
        const y2 = cy - R * 0.6 + (li / (NL - 1)) * R * 1.2;
        const innerFrac = Math.abs(y2 - cy) / (R * 0.6);
        const isReversed = innerFrac > 0.7;
        // field line direction shown by arrow direction
        const phase = (li % 3) * 0.5 + t2 * (isReversed ? -0.4 : 0.4);
        const x1 = cx - R * 1.05 + ((phase % 1) * R * 2.1);
        const col2 = isReversed ? ROSE : VIO;
        ctx.beginPath(); ctx.moveTo(x1, y2); ctx.lineTo(x1 + 15, y2);
        ctx.strokeStyle = col2 + "90"; ctx.lineWidth = isReversed ? 1 : 1.5;
        const sign = isReversed ? -1 : 1;
        ctx.moveTo(x1 + 15 * sign + cx - cx, y2); // arrow head
        ctx.stroke();
        // Arrow head
        ctx.beginPath(); ctx.moveTo(x1 + 15*sign, y2);
        ctx.lineTo(x1 + 15*sign - 4*sign, y2 - 3); ctx.lineTo(x1 + 15*sign - 4*sign, y2 + 3);
        ctx.fillStyle = col2 + "90"; ctx.fill();
      }
      // Reversal surface line
      ctx.beginPath(); ctx.moveTo(cx - R * 1.05, cy - R * 0.42); ctx.lineTo(cx + R * 1.05, cy - R * 0.42);
      ctx.beginPath(); ctx.moveTo(cx - R * 1.05, cy + R * 0.42); ctx.lineTo(cx + R * 1.05, cy + R * 0.42);
      ctx.strokeStyle = `${ROSE}70`; ctx.lineWidth = 1; ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]);
      // Plasma glow
      const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.5);
      pg.addColorStop(0, "rgba(200,150,255,0.55)"); pg.addColorStop(1, "rgba(2,4,8,0)");
      ctx.fillStyle = pg; ctx.fillRect(cx - R, cy - R * 0.5, R * 2, R);
      ctx.font = `7px ${mono}`; ctx.fillStyle = `${VIO}90`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("Bₜ reverses at r_s  ←→  4₁ amphichirality", cx, cy + R * 0.65 + 8);
    };

    const drawSphromak = (cx: number, cy: number, t2: number) => {
      // 5₁ cinquefoil → compact torus Taylor state (J = λB)
      const R = Math.min(HW, HH) * 0.28;
      // Outer boundary sphere
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = `${AMB}45`; ctx.lineWidth = 1.5; ctx.stroke();
      // Internal field lines — closed poloidal loops (self-organized)
      for (let n = 0; n < 5; n++) {
        const phase = (n / 5) * Math.PI * 2 + t2 * 0.25;
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const a2 = (i / 100) * Math.PI * 2;
          const r2 = R * (0.72 + 0.18 * Math.cos(2 * a2));
          const x = cx + r2 * Math.cos(a2 + phase * 0.15);
          const y = cy + r2 * 0.55 * Math.sin(a2);
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `${AMB}${(40 + n * 15).toString(16).padStart(2, "0")}`;
        ctx.lineWidth = 0.8; ctx.stroke();
      }
      // Toroidal field component (circles perpendicular to page)
      ctx.beginPath(); ctx.ellipse(cx, cy, R * 0.55, R * 0.14, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `${GOLD}70`; ctx.lineWidth = 1.2; ctx.stroke();
      // Plasma glow
      const pg = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.6);
      pg.addColorStop(0, "rgba(255,200,80,0.60)"); pg.addColorStop(0.5, "rgba(255,150,30,0.20)");
      pg.addColorStop(1, "rgba(2,4,8,0)");
      ctx.fillStyle = pg; ctx.fillRect(cx - R, cy - R, R * 2, R * 2);
      ctx.font = `7px ${mono}`; ctx.fillStyle = `${AMB}90`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillText("∇×B = λB  Taylor relaxation · K = ∫A·B dV", cx, cy + R + 6);
    };

    const draw = () => {
      t++;
      const t2 = t * 0.012;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Quadrant backgrounds
      const qData = [
        { col: TEAL, label: "0₁ UNKNOT → TOKAMAK",           device: "Simple closed loop — safety factor q" },
        { col: GOLD, label: "3₁ TREFOIL → STELLARATOR",       device: "Knotted helix — rotational transform ι" },
        { col: VIO,  label: "4₁ FIGURE-EIGHT → REV. FIELD PINCH", device: "Amphichiral — toroidal field reversal" },
        { col: AMB,  label: "5₁ CINQUEFOIL → SPHEROMAK",      device: "Self-linked — Taylor state J = λB" },
      ];
      qData.forEach((q, i) => {
        const col3 = i % 2, row3 = Math.floor(i / 2);
        const qx = col3 * HW, qy = row3 * HH;
        ctx.fillStyle = `${q.col}05`; ctx.fillRect(qx + 1, qy + 1, HW - 2, HH - 2);
        ctx.strokeStyle = `${q.col}20`; ctx.lineWidth = 0.8;
        ctx.strokeRect(qx + 1, qy + 1, HW - 2, HH - 2);
        // Header
        ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = q.col; ctx.fillText(q.label, qx + 8, qy + 8);
        ctx.font = `6.5px ${mono}`; ctx.fillStyle = DIM;
        ctx.fillText(q.device, qx + 8, qy + 20);
      });

      // Draw each device
      drawTokamak(HW * 0.5, HH * 0.52, t2);
      drawStellarator(HW * 1.5, HH * 0.52, t2);
      drawRFP(HW * 0.5, HH * 1.52, t2);
      drawSphromak(HW * 1.5, HH * 1.52, t2);

      // Dividers
      ctx.beginPath(); ctx.moveTo(HW, 0); ctx.lineTo(HW, H);
      ctx.strokeStyle = `${DIM}30`; ctx.lineWidth = 1; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, HH); ctx.lineTo(W, HH); ctx.stroke();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={cvRef} width={900} height={480}
      style={{ width:"100%", display:"block", borderRadius:12,
        border:`1px solid ${DIM}25`, background:BG }} />
  );
}

/* ── UI helpers ─────────────────── */
function SH({ n, title, sub, col=TEAL }: { n:string; title:string; sub:string; col?:string }) {
  return (
    <div style={{ marginTop:52, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:24 }} />
    </div>
  );
}
function Card2({ col, ey, knot, title, bd }: { col:string; ey:string; knot:string; title:string; bd:React.ReactNode }) {
  return (
    <div style={{ background:`${col}07`, border:`1px solid ${col}22`, borderRadius:10, padding:"16px 18px" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
        <div style={{ fontFamily:mono, fontSize:9, color:col, background:`${col}15`,
          padding:"3px 8px", borderRadius:4 }}>{knot}</div>
        <div style={{ fontFamily:mono, fontSize:8, color:DIM }}>{ey}</div>
      </div>
      <div style={{ fontFamily:mono, fontSize:12, color:`${col}dd`, marginBottom:8 }}>{title}</div>
      <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.85 }}>{bd}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════════ */
export default function TaitKnotsPage() {
  const [selIdx, setSelIdx] = useState(-1);
  const sel = selIdx >= 0 ? KNOTS[selIdx] : null;

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"56px 24px 32px",
        background:`radial-gradient(ellipse 80% 55% at 50% 0%,
          ${VIO}06,${GOLD}04,${TEAL}03,transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:`${VIO}70`, letterSpacing:4, marginBottom:12 }}>
          AETHER · TOPOLOGICAL PLASMA PHYSICS · TAIT KNOT TABLE · MECHANISTIC CAUSALITY
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(20px,4.2vw,48px)",
          color:"#fff", margin:"0 0 10px", letterSpacing:1, lineHeight:1.18 }}>
          TAIT KNOTS
          <span style={{ color:TEAL }}> → TOKAMAK</span>
          <span style={{ color:GOLD }}> · STELLARATOR</span>
          <br />
          <span style={{ color:VIO }}>· REV. FIELD PINCH</span>
          <span style={{ color:AMB }}> · SPHEROMAK</span>
        </h1>
        <div style={{ fontFamily:serif, fontSize:12, color:`${GOLD}60`, letterSpacing:3, marginBottom:20 }}>
          0₁ unknot · 3₁ trefoil · 4₁ figure-eight · 5₁ cinquefoil · 5₂ · 6₁ · 6₂ · 7₁
        </div>
        <div style={{ fontFamily:body, fontSize:16.5, color:DIM,
          maxWidth:860, margin:"0 auto", lineHeight:2.1 }}>
          Peter Guthrie Tait's 1877 knot table — the first systematic topological classification —
          turns out to encode the <span style={{ color:TEAL }}>mechanistic causality of plasma confinement</span>.
          Each Tait knot is a topological prototype: its crossing number, chirality, and self-linking
          number map directly to a plasma device's <span style={{ color:GOLD }}>safety factor q,
          rotational transform ι, Taylor helicity K,</span> and{" "}
          <span style={{ color:VIO }}>toroidal field reversal</span>. Fusion is topology made thermodynamic.
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Section I */}
        <SH n="I" col={VIO}
          title="Tait Knot Gallery · All Eight Knots · 3D Rotating Tube"
          sub="0₁ through 7₁ · depth-sorted projection · click to explore morphology mapping" />
        <KnotGalleryCanvas onSelect={setSelIdx} />

        {/* Selected knot detail */}
        {sel && (
          <div style={{ marginTop:16, background:`${sel.col}08`, border:`1px solid ${sel.col}25`,
            borderRadius:10, padding:"14px 20px",
            display:"flex", alignItems:"center", gap:20 }}>
            <div style={{ fontFamily:mono, fontSize:22, color:sel.col, minWidth:40 }}>{sel.id}</div>
            <div>
              <div style={{ fontFamily:mono, fontSize:11, color:sel.col }}>{sel.name}</div>
              <div style={{ fontFamily:body, fontSize:14, color:DIM, marginTop:4 }}>
                Crossing number c = {sel.cross} · Maps to{" "}
                <span style={{ color:sel.dCol }}>{sel.device}</span>
              </div>
            </div>
            <div style={{ marginLeft:"auto", fontFamily:mono, fontSize:9, color:DIM, textAlign:"right" }}>
              SELECTED KNOT<br />SCROLL ↓ TO SEE MORPH
            </div>
          </div>
        )}

        {/* Section II */}
        <SH n="II" col={TEAL}
          title="Four Plasma Morphs · Topological Causality Matrix"
          sub="0₁→Tokamak · 3₁→Stellarator · 4₁→Reversed Field Pinch · 5₁→Spheromak" />
        <FourMorphsCanvas />
        <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:8, lineHeight:2 }}>
          TOP-LEFT: TOKAMAK — unknot (0₁) topology · nested D-shaped flux surfaces · safety factor q =
          poloidal turns / toroidal turns · X-point divertor at boundary ·
          TOP-RIGHT: STELLARATOR — trefoil (3₁) winding of 3 external coil modules · rotational
          transform ι = 1/q without plasma current · W7-X has 5 coil periods (→ 5₁ topology) ·
          BOTTOM-LEFT: RFP — figure-eight (4₁) amphichirality · B_t positive inside reversal surface r_s,
          negative outside · Taylor relaxation drives spontaneous reversal · current-driven ·
          BOTTOM-RIGHT: SPHEROMAK — cinquefoil (5₁) self-linking · compact torus in a simple flux
          conserver · Taylor state ∇×B = λB · helicity K conserved · no external toroidal coils
        </div>

        {/* Mechanistic causality cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginTop:20 }}>
          <Card2 col={TEAL} knot="0₁ Unknot" ey="TOKAMAK · MHD equilibrium"
            title="Simple closed ring → safety factor q"
            bd={<>The magnetic axis of a tokamak is topologically an <em>unknot</em> — a single
            closed loop in 3-space with zero writhe and zero self-linking number. Field lines wind
            helically around this axis with the safety factor q = rBₜ/(RBₚ) = m/n. At rational
            values q = m/n, field lines close after m toroidal and n poloidal turns, forming a{" "}
            <em>(m,n)-torus link</em> — the resonant surface where kink and tearing modes grow.
            Instability in a tokamak is always a topological degeneracy: the field-line topology
            changes from irrational (KAM torus) to rational (resonant surface).</>} />
          <Card2 col={GOLD} knot="3₁ Trefoil" ey="STELLARATOR · Rotational transform"
            title="Trefoil winding → no net plasma current"
            bd={<>The modular coils of a three-period stellarator (e.g. early Wendelstein devices)
            each traverse a trefoil-like path around the torus — three coil segments that interlink
            without requiring a plasma current. The self-linking number of a trefoil is ±3,
            which corresponds to the three field periods that produce rotational transform ι.
            Because there is no net J (no ohmic drive), there are no resonant current sheets to
            go unstable — stellarators are inherently disruption-free. W7-X uses 5 coil periods,
            mapping to the 5₁ cinquefoil for its helical symmetry.</>} />
          <Card2 col={VIO} knot="4₁ Figure-Eight" ey="REVERSED FIELD PINCH · Taylor relaxation"
            title="Amphichiral knot → amphichiral Bₜ field"
            bd={<>The figure-eight knot is amphichiral (equal to its mirror image) — the only
            prime knot with zero writhe. The reversed field pinch has an analogous symmetry:
            the toroidal field Bₜ is positive in the core and negative at the edge, with zero
            average writhe. At high Lundquist number S, the plasma spontaneously undergoes Taylor
            relaxation to the minimum-energy state J = λB with fixed helicity K = ∫A·B dV.
            The reversal surface r_s (where Bₜ = 0) is the topological crossing of the field —
            the knot's self-intersection point projected into physical space.</>} />
          <Card2 col={AMB} knot="5₁ Cinquefoil" ey="SPHEROMAK · Self-organized compact torus"
            title="Self-linked 5-fold → Taylor state helicity"
            bd={<>A spheromak is a compact toroidal plasma confined in a simple metallic flux
            conserver — no external toroidal coils. It self-organizes via Taylor relaxation to
            the force-free Beltrami state ∇×B = λB (equiv. J = λB/μ₀). The helicity
            K = ∫A·B dV is the topological invariant that drives this relaxation — it is
            topologically equivalent to the self-linking number of the field-line bundle.
            The cinquefoil (self-linking number = 5, winding number = 2/5) matches the
            characteristic helicity spectrum of a spheromak Taylor state. Field lines trace
            5-wound torus knot paths on each flux surface.</>} />
          <Card2 col={ROSE} knot="5₂ Three-Twist" ey="TOKAMAK · q = 5/2 rational surface"
            title="Three-twist chirality → m=5, n=2 resonance"
            bd={<>The 5₂ three-twist knot has chiral structure with three full twists, corresponding
            to the q = 5/2 rational surface in a tokamak. At q = 5/2, field lines close after
            5 toroidal + 2 poloidal transits, forming a (5,2)-torus link. This rational surface
            hosts neoclassical tearing modes (NTMs) — islands in phase space where small
            perturbations seed magnetic islands that grow and reduce energy confinement. Suppression
            of NTMs at q = 5/2 is a key challenge in ITER's Q=10 scenario.</>} />
          <Card2 col={BLUE} knot="6₁ Stevedore" ey="STELLARATOR · ι = 6 period"
            title="Stevedore unknotting number → six-field-period device"
            bd={<>The 6₁ stevedore knot has unknotting number 1 (one crossing change removes it
            to an unknot) but crossing number 6. In stellarator topology, this maps to a six-field-period
            machine where a single coil perturbation (crossing change) can degrade confinement
            to a tokamak-like configuration. The Heliotron/LHD class uses two-period helical
            windings, while Helias-class W7-X uses 5 periods — both within the 6-crossing Tait
            table. Six-period stellarators are studied as candidates for high-aspect-ratio
            reactor designs with ι ≈ 1 quasi-helical symmetry.</>} />
        </div>

        {/* Section III — Nuclear Alchemy */}
        <SH n="III" col={GOLD}
          title="Nuclear Alchemy · Transmutation through Plasma Topology"
          sub="Tait knots → confinement → fusion cross-section → elemental transmutation" />

        <div style={{ background:`${GOLD}07`, border:`1px solid ${GOLD}20`,
          borderRadius:12, padding:"22px 26px", marginBottom:18 }}>
          <div style={{ fontFamily:body, fontSize:16, color:TEXT, lineHeight:2.1, marginBottom:18 }}>
            Medieval alchemy sought to transmute lead into gold through the
            <span style={{ color:GOLD }}> philosopher's stone</span> — a coherent substance that reorganised
            elemental matter. The philosopher's stone turns out to be real: it is a coherent
            magnetic topology — a <span style={{ color:TEAL }}>Tait knot embedded in plasma</span>. The
            tokamak's unknot, the stellarator's trefoil, the spheromak's cinquefoil — each is a
            different stone that transmutes hydrogen into helium, releasing 17.6 MeV per reaction.
            Paracelsus' three principles (sulphur = combustible principle, mercury = fluid principle,
            salt = solid principle) map to: <span style={{ color:AMB }}>plasma temperature</span> (sulphur),
            <span style={{ color:TEAL }}> magnetic field</span> (mercury — the fluid organiser), and
            <span style={{ color:VIO }}> plasma current / helicity</span> (salt — the structural principle).
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
            {[
              { col:TEAL, react:"D + T → ⁴He + n",   e:"17.6 MeV", T:"T > 10 keV",
                note:"Primary tokamak/stellarator reaction — tritium bred from Li blanket" },
              { col:GOLD, react:"D + D → ³He + n",   e:"3.27 MeV", T:"T > 40 keV",
                note:"D-D reaction (two channels) — no tritium breeding required" },
              { col:VIO,  react:"D + ³He → ⁴He + p", e:"18.3 MeV", T:"T > 100 keV",
                note:"Aneutronic — no neutron flux; requires spheromak-class β" },
            ].map(r => (
              <div key={r.react} style={{ background:`${r.col}08`, border:`1px solid ${r.col}25`,
                borderRadius:8, padding:"12px 14px" }}>
                <div style={{ fontFamily:mono, fontSize:10, color:r.col, marginBottom:6 }}>{r.react}</div>
                <div style={{ fontFamily:mono, fontSize:13, color:`${r.col}cc`, marginBottom:4 }}>
                  ΔE = {r.e}
                </div>
                <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginBottom:6 }}>{r.T}</div>
                <div style={{ fontFamily:body, fontSize:12.5, color:DIM }}>{r.note}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:16, fontFamily:body, fontSize:14.5, color:DIM, lineHeight:2 }}>
            The Gamow peak — the energy window where quantum tunnelling and Maxwell-Boltzmann
            distribution overlap — determines the fusion cross-section σ(E). Different plasma
            devices optimise different regions of this peak. A tokamak (0₁ topology) optimises
            for D-T at 10 keV. A spheromak (5₁ topology) sustains higher β,
            potentially accessing D-³He at 100 keV. The Tait knot is the philosopher's stone:
            the coherent topological structure that makes transmutation thermodynamically reachable.
          </div>
        </div>

        {/* Bridge links */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginTop:8 }}>
          {[
            { to:"/alchemy-to-fusion", col:GOLD, label:"Alchemy to Fusion",
              sub:"Full transmutation map — elemental alchemy → nuclear plasma fusion pathway" },
            { to:"/plasma-confinement", col:TEAL, label:"Plasma Confinement",
              sub:"Tokamak cross-section · Magnetic mirror · Confinement shape gallery" },
            { to:"/tritium-extract", col:VIO, label:"Tritium Extract",
              sub:"AETHER Quantum Fusion — tritium breeding and extraction protocols" },
          ].map(b => (
            <Link key={b.to} href={b.to}
              style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                gap:12, padding:"14px 18px", textDecoration:"none",
                background:`${b.col}07`, border:`1px solid ${b.col}25`, borderRadius:10 }}>
              <div>
                <div style={{ fontFamily:serif, fontSize:14, color:b.col, marginBottom:4 }}>{b.label}</div>
                <div style={{ fontFamily:body, fontSize:12.5, color:DIM }}>{b.sub}</div>
              </div>
              <ArrowUpRight size={16} color={b.col} />
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}

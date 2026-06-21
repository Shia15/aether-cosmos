import { useEffect, useRef, useState } from "react";

const BG    = "#020408";
const TEAL  = "#0d7377";
const AQUA  = "#14bdac";
const GOLD  = "#c9a84c";
const CORAL = "#e05c4b";
const WEB   = "#2ecc9a";
const TOUCH = "#e8a838";
const VIOLET= "#9b59b6";
const BLUE  = "#1a9fd4";
const DIM   = "#4a6a78";
const TEXT  = "#d8e8ec";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

function Chip({ c = BLUE, children }: { c?: string; children: string }) {
  return (
    <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}18`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px" }}>{children}</span>
  );
}
function EQ({ col = GOLD, children }: { col?: string; children: string }) {
  return (
    <pre style={{ fontFamily: mono, fontSize: 12, color: col, background: "#030a14", borderLeft: `2px solid ${col}`, borderRadius: "0 6px 6px 0", padding: "12px 18px", margin: "12px 0", overflowX: "auto", whiteSpace: "pre-wrap" }}>{children}</pre>
  );
}
function SecHead({ id, n, title, sub, col = WEB }: { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 26, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 20 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 28 }} />
    </div>
  );
}
function Pull({ col = WEB, children }: { col?: string; children: string }) {
  return (
    <blockquote style={{ borderTop: `2px solid ${col}`, borderBottom: `2px solid ${col}`, padding: "14px 24px", margin: "24px 0", fontFamily: body, fontStyle: "italic", fontSize: 18, color: col, lineHeight: 1.6, textAlign: "center" }}>{children}</blockquote>
  );
}
function Tbl({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead><tr style={{ background: TEAL }}>{headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 9, color: "#fff", textAlign: "left", padding: "6px 10px", letterSpacing: 1 }}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, ri) => (
          <tr key={ri} style={{ background: ri % 2 === 0 ? "rgba(13,31,45,0.5)" : "transparent" }}>
            {row.map((c, ci) => <td key={ci} style={{ padding: "7px 10px", color: TEXT, borderBottom: "1px solid #0d1f2d" }}>{c}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

/* ══ KNOT CANVAS ══ */
type Mode = "torus" | "reconnect" | "writhe";

function KnotCanvas({ mode }: { mode: Mode }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(400, Math.round(p.clientWidth * 0.52));
    };
    resize();
    window.addEventListener("resize", resize);

    /* precompute torus knot (p,q) curve */
    const torusKnot = (p: number, q: number, t: number, R: number, r: number) => {
      const phi = t;
      const theta = (q / p) * t;
      const x = (R + r * Math.cos(theta)) * Math.cos(phi);
      const y = (R + r * Math.cos(theta)) * Math.sin(phi);
      const z = r * Math.sin(theta);
      return { x, y, z };
    };

    /* simple perspective */
    const project = (x: number, y: number, z: number, W: number, H: number, rx: number, ry: number) => {
      // rotate around Y axis (ry), X axis (rx)
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const x1 = cosY * x + sinY * z;
      const z1 = -sinY * x + cosY * z;
      const y2 = cosX * y - sinX * z1;
      const z2 = sinX * y + cosX * z1;
      const fov = 4;
      const pz = z2 + fov;
      const px = (x1 / pz) * W * 0.38 + W / 2;
      const py = (y2 / pz) * W * 0.38 + H / 2;
      return { px, py, z: z2 };
    };

    /* plasma particles — trapped on torus */
    const PART_N = 80;
    const parts = Array.from({ length: PART_N }, (_, i) => ({
      t: (i / PART_N) * Math.PI * 2,
      dt: 0.008 + Math.random() * 0.006,
      p: 3, q: 2, // trefoil knot (3,2)
      col: i % 3 === 0 ? CORAL : i % 3 === 1 ? BLUE : AQUA,
    }));

    /* reconnection state */
    let recoTime = 0;
    const RECO_N = 40;
    const fieldLines = Array.from({ length: RECO_N }, (_, i) => ({
      y0: (i / RECO_N) * 2 - 1,
      x: -0.8 + Math.random() * 0.05,
      vx: 0.005 + Math.random() * 0.003,
      broken: false, breakT: 0,
    }));

    /* writhe mode — knot strand crossings */
    const N_STEPS = 300;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* ── TORUS KNOT ── */
      if (mode === "torus") {
        const rx = 0.35 + 0.1 * Math.sin(t * 0.006);
        const ry = t * 0.008;
        const R = 0.5, r = 0.2;
        const p = 3, q = 2; // trefoil
        const steps = N_STEPS;

        // Draw torus ghost
        for (let ti = 0; ti < 36; ti++) {
          const phi = (ti / 36) * Math.PI * 2;
          const pts: { px: number; py: number }[] = [];
          for (let th = 0; th <= 24; th++) {
            const theta = (th / 24) * Math.PI * 2;
            const x = (R + r * Math.cos(theta)) * Math.cos(phi);
            const y = (R + r * Math.cos(theta)) * Math.sin(phi);
            const z = r * Math.sin(theta);
            const proj = project(x, y, z, W, H, rx, ry);
            pts.push(proj);
          }
          ctx.beginPath();
          pts.forEach((pt, i) => i === 0 ? ctx.moveTo(pt.px, pt.py) : ctx.lineTo(pt.px, pt.py));
          ctx.closePath();
          ctx.strokeStyle = `${TEAL}15`; ctx.lineWidth = 0.8; ctx.stroke();
        }

        // Draw knot curve — with depth sorting (back-to-front segments)
        const knotPts: { px: number; py: number; z: number; col: string; alpha: number }[] = [];
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * Math.PI * 2;
          const { x, y, z } = torusKnot(p, q, angle, R, r);
          const proj = project(x, y, z, W, H, rx, ry);
          // color by winding number q around torus
          const hue = (i / steps) * 360;
          const col = `hsl(${hue},80%,60%)`;
          knotPts.push({ ...proj, col, alpha: 0.7 + 0.3 * ((proj.z + 1) / 2) });
        }

        for (let i = 0; i < knotPts.length - 1; i++) {
          const a = knotPts[i], b = knotPts[i + 1];
          ctx.beginPath(); ctx.moveTo(a.px, a.py); ctx.lineTo(b.px, b.py);
          ctx.strokeStyle = `${a.col.slice(0, -1)},${a.alpha})`.replace("hsl(", "hsla(");
          // Actually just use the col with alpha
          ctx.globalAlpha = a.alpha;
          ctx.strokeStyle = a.col;
          ctx.lineWidth = 2.5; ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Plasma particles riding the knot
        for (const pt of parts) {
          pt.t += pt.dt;
          const { x, y, z } = torusKnot(pt.p, pt.q, pt.t, R, r);
          const proj = project(x, y, z, W, H, rx, ry);
          const alpha = 0.5 + 0.5 * ((proj.z + 1) / 2);
          ctx.beginPath(); ctx.arc(proj.px, proj.py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = pt.col + Math.round(alpha * 220).toString(16).padStart(2, "0");
          ctx.fill();
          const glow = ctx.createRadialGradient(proj.px, proj.py, 0, proj.px, proj.py, 9);
          glow.addColorStop(0, pt.col + "50"); glow.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(proj.px, proj.py, 9, 0, Math.PI * 2);
          ctx.fillStyle = glow; ctx.fill();
        }

        // Labels
        ctx.fillStyle = `${GOLD}cc`; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("TREFOIL KNOT T(3,2) · MAGNETIC FIELD LINE", W / 2, H - 24);
        ctx.fillStyle = `${CORAL}90`; ctx.font = `8px ${mono}`;
        ctx.fillText("PLASMA PARTICLES CONFINED TO KNOT ORBIT", W / 2, H - 12);
      }

      /* ── MAGNETIC RECONNECTION ── */
      else if (mode === "reconnect") {
        recoTime += 0.015;
        const cx = W / 2, cy = H / 2;
        const progress = (Math.sin(recoTime) + 1) / 2; // 0→1→0

        // Horizontal field lines (top: rightward, bottom: leftward)
        for (const fl of fieldLines) {
          fl.x += fl.vx;
          if (fl.x > 0.9) { fl.x = -0.85; fl.broken = false; }
          // Break at X-point
          if (Math.abs(fl.x) < 0.12 * progress && Math.abs(fl.y0) < 0.35 * progress) {
            fl.broken = true;
          }

          const px = fl.x * W * 0.8 + cx;
          const py = fl.y0 * H * 0.35 + cy;
          if (!fl.broken) {
            ctx.beginPath(); ctx.moveTo(px - 6, py); ctx.lineTo(px + 6, py);
            const sign = fl.y0 > 0 ? -1 : 1; // top goes right, bottom goes left
            ctx.strokeStyle = `${BLUE}80`; ctx.lineWidth = 1; ctx.stroke();
            // Arrow
            ctx.beginPath();
            ctx.moveTo(px + sign * 6, py);
            ctx.lineTo(px + sign * 6 - sign * 5, py - 3);
            ctx.lineTo(px + sign * 6 - sign * 5, py + 3);
            ctx.fillStyle = `${BLUE}80`; ctx.fill();
          } else {
            // Reconnected — curving away from X-point
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.quadraticCurveTo(cx, cy + fl.y0 * H * 0.15, cx + fl.y0 * W * 0.2, cy);
            ctx.strokeStyle = `${CORAL}90`; ctx.lineWidth = 1.5; ctx.stroke();
          }
        }

        // X-point glow
        const xGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60 * progress + 10);
        xGlow.addColorStop(0, `rgba(224,92,75,${progress * 0.5})`);
        xGlow.addColorStop(0.5, `rgba(201,168,76,${progress * 0.2})`);
        xGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cx, cy, 60 * progress + 10, 0, Math.PI * 2);
        ctx.fillStyle = xGlow; ctx.fill();

        // X-point marker
        ctx.fillStyle = `${CORAL}cc`; ctx.font = `11px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("✕", cx, cy + 4);
        ctx.fillStyle = `${GOLD}80`; ctx.font = `8px ${mono}`;
        ctx.fillText("MAGNETIC X-POINT · RECONNECTION SITE", cx, cy + 18);

        // Direction labels
        ctx.fillStyle = `${BLUE}70`; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText("B →", W * 0.06, H * 0.3);
        ctx.fillText("← B", W * 0.06, H * 0.7);
        ctx.fillStyle = `${CORAL}80`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText(`RECONNECTION: ${(progress * 100).toFixed(0)}%  |  ENERGY RELEASE: ${(progress * 3.2).toFixed(1)} × 10²⁵ J`, W / 2, H - 10);
      }

      /* ── WRITHE / LINKING NUMBER ── */
      else if (mode === "writhe") {
        const cx = W / 2, cy = H / 2;
        const rx = 0.3;
        const ry = t * 0.007;

        // Draw two linked knots
        const knot1 = (angle: number, R = 0.42, r = 0.15, offset = 0) => {
          const { x, y, z } = torusKnot(2, 3, angle, R, r);
          return project(x + offset, y, z, W, H, rx, ry);
        };
        const knot2 = (angle: number, R = 0.38, r = 0.12, offset = 0) => {
          // Hopf link — circles linked
          const phi = angle, theta = angle * 2;
          const x = (R + r * Math.cos(theta)) * Math.cos(phi) + offset;
          const y = (R + r * Math.cos(theta)) * Math.sin(phi);
          const z = r * Math.sin(theta);
          return project(x, y, z, W, H, rx + 0.3, ry);
        };

        // Knot 1 — blue T(2,3) = trefoil
        const k1pts = Array.from({ length: N_STEPS + 1 }, (_, i) => knot1((i / N_STEPS) * Math.PI * 2));
        for (let i = 0; i < k1pts.length - 1; i++) {
          const a = k1pts[i], b = k1pts[i + 1];
          ctx.beginPath(); ctx.moveTo(a.px - W * 0.22, a.py); ctx.lineTo(b.px - W * 0.22, b.py);
          const alpha = 0.4 + 0.6 * ((a.z + 1) / 2);
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = AQUA; ctx.lineWidth = 2.2; ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Knot 2 — coral T(2,3) offset
        const k2pts = Array.from({ length: N_STEPS + 1 }, (_, i) => knot2((i / N_STEPS) * Math.PI * 2));
        for (let i = 0; i < k2pts.length - 1; i++) {
          const a = k2pts[i], b = k2pts[i + 1];
          ctx.beginPath(); ctx.moveTo(a.px + W * 0.18, a.py); ctx.lineTo(b.px + W * 0.18, b.py);
          const alpha = 0.4 + 0.6 * ((a.z + 1) / 2);
          ctx.globalAlpha = alpha;
          ctx.strokeStyle = CORAL; ctx.lineWidth = 2.2; ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Labels
        ctx.fillStyle = `${AQUA}cc`; ctx.font = `9px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("T(2,3) · TREFOIL", W * 0.28, H - 24);
        ctx.fillStyle = `${CORAL}cc`; ctx.font = `9px ${mono}`;
        ctx.fillText("T(2,3) · PARTNER", W * 0.72, H - 24);
        ctx.fillStyle = `${GOLD}90`; ctx.font = `8px ${mono}`; ctx.textAlign = "center";
        ctx.fillText("LINKING NUMBER Lk = 3  ·  WRITHE Wr = 3  ·  TWIST Tw = 0", W / 2, H - 10);

        // Helicity indicator
        const hel = Math.abs(Math.sin(t * 0.04));
        ctx.fillStyle = `${WEB}80`; ctx.font = `8px ${mono}`; ctx.textAlign = "left";
        ctx.fillText(`MAGNETIC HELICITY H = ∫A·B dV  ·  ${(hel * 2.4).toFixed(2)} × 10³² Wb²`, W * 0.05, H * 0.08);
      }

      tick.current++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${WEB}20` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "torus" as Mode,     label: "T(3,2) Trefoil · Plasma Confinement", col: AQUA  },
    { k: "reconnect" as Mode, label: "Magnetic Reconnection · X-Point",     col: CORAL },
    { k: "writhe" as Mode,    label: "Writhe · Linking Number · Helicity",  col: GOLD  },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{
          fontFamily: mono, fontSize: 10, padding: "5px 14px", borderRadius: 4, cursor: "pointer",
          border: `1px solid ${value === tab.k ? tab.col : DIM + "60"}`,
          background: value === tab.k ? `${tab.col}18` : "transparent",
          color: value === tab.k ? tab.col : DIM, transition: "all 0.2s",
        }}>{tab.label}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Topology & Plasma" }, { id: "s2", label: "Torus Knots" },
  { id: "s3", label: "Writhe & Helicity" }, { id: "s4", label: "Reconnection" },
  { id: "s5", label: "Safety Factor q" },   { id: "s6", label: "AETHER Topology" },
];

function PlasmaKnotsHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const p=3,q=5;
      ctx.beginPath();
      for(let i=0;i<=360;i++){
        const a=(i/360)*Math.PI*2;
        const r=55*(Math.cos(q*a)+2);
        const x=cx+r*Math.cos(p*a)*1.5,y=cy+r*Math.sin(p*a+t*0.01)*0.45;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      const grad=ctx.createLinearGradient(0,0,W,0);
      grad.addColorStop(0,"rgba(255,68,119,0.5)");grad.addColorStop(0.5,"rgba(46,240,216,0.5)");grad.addColorStop(1,"rgba(153,102,255,0.5)");
      ctx.strokeStyle=grad;ctx.lineWidth=1.5;ctx.stroke();
      ctx.fillStyle="rgba(255,68,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PLASMA KNOTS · TORUS KNOT · MAGNETIC TOPOLOGY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function PlasmaKnotsPage() {
  const [mode, setMode] = useState<Mode>("torus");
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #ff4477",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#ff4477",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #ff4477",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#ff4477",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>PLASMA KNOTS · TORUS KNOT · MAGNETIC TOPOLOGY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(255,68,119,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Live (3,5) torus knot plasma — the AETHER plasma knots simulation.</p></div>
          <PlasmaKnotsHeaderCanvas />
        </div>
      </div>
      <div style={{ padding: "66px 28px 42px", textAlign: "center", background: "linear-gradient(180deg,#040d18 0%,#020408 100%)", borderBottom: `1px solid ${AQUA}18` }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: AQUA, letterSpacing: 4, marginBottom: 12 }}>AETHER · PLASMA TOPOLOGY · KNOT THEORY</div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(20px,4vw,40px)", color: "#fff", margin: "0 0 10px", letterSpacing: 2, lineHeight: 1.15 }}>
          KNOTS FINDING THEIR<br /><span style={{ color: AQUA }}>SHAPE AROUND PLASMA</span>
        </h1>
        <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 16, color: TOUCH, marginBottom: 16 }}>
          Torus Knot Theory · Magnetic Helicity · Reconnection · Coherence Through Topology
        </div>
        <p style={{ fontFamily: body, fontSize: 16, color: DIM, maxWidth: 720, margin: "0 auto 24px", lineHeight: 1.8 }}>
          Magnetic field lines inside a plasma are not arbitrary — they are forced by the
          topology of the system into specific knot configurations. A tokamak's field lines
          trace (p,q) torus knots around the plasma torus. The knot is not decorative;
          it is the confinement. The field finds the knot shape because the knot shape
          minimises reconnection instability while maximising helicity — topological coherence.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip c={AQUA}>Torus Knots T(p,q)</Chip>
          <Chip c={GOLD}>Magnetic Helicity</Chip>
          <Chip c={CORAL}>Reconnection</Chip>
          <Chip c={VIOLET}>Writhe · Linking Number</Chip>
          <Chip c={WEB}>Safety Factor q</Chip>
          <Chip c={TOUCH}>Topological Coherence</Chip>
        </div>
      </div>

      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG}f2`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${AQUA}12`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = AQUA; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 940, margin: "0 auto", padding: "0 22px 96px" }}>
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <KnotCanvas mode={mode} />
          <div style={{ fontFamily: mono, fontSize: 9, color: DIM, marginTop: 6 }}>
            {mode === "torus"     && "TREFOIL KNOT T(3,2) · FIELD LINE WRAPS 3× TOROIDALLY FOR EVERY 2× POLOIDALLY · PLASMA PARTICLES (DOTS) CONFINED TO KNOT ORBIT · ROTATING TORUS"}
            {mode === "reconnect" && "ANTI-PARALLEL FIELD LINES APPROACHING X-POINT · RECONNECTION BREAKS AND REJOINS TOPOLOGY · ENERGY RELEASE ≈ 3.2×10²⁵ J · OSCILLATES EVERY CYCLE"}
            {mode === "writhe"    && "TWO TREFOIL KNOT FIELD LINE BUNDLES · LINKING NUMBER Lk = 3 · WRITHE Wr = 3 · MAGNETIC HELICITY H = ∫A·B dV IS THE CONSERVED TOPOLOGICAL INVARIANT"}
          </div>
        </div>

        <SecHead id="s1" n="I" title="Topology and Plasma · Why Knots?" sub="The magnetic field does not choose the knot — the plasma forces it" col={AQUA} />
        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          When plasma is confined in a tokamak — a toroidal (donut-shaped) magnetic bottle —
          the magnetic field lines must wrap continuously around the torus. But wrap how?
          The answer is not arbitrary. The field lines are governed by the same mathematical
          objects as knot theory: they must close on themselves, they resist crossing each other
          (magnetic pressure), and they carry a conserved topological invariant (helicity).
          The result is that field lines in magnetised plasma spontaneously organise into
          torus knot configurations — T(p,q) where p and q are the winding numbers. The knot
          is the confinement mechanism. Change the knot type and you change the confinement
          stability.
        </p>

        <SecHead id="s2" n="II" title="Torus Knots T(p,q)" sub="The parametric family of closed curves on the surface of a torus" col={GOLD} />
        <EQ col={GOLD}>{`Torus knot T(p,q) parametric equation:
  x(t) = [R + r·cos(q·t)]·cos(p·t)
  y(t) = [R + r·cos(q·t)]·sin(p·t)
  z(t) = r·sin(q·t)
  t ∈ [0, 2π)

  Where:
    R = major radius (torus centre to tube centre) — ~1–6 m in tokamaks
    r = minor radius (tube cross-section) — ~0.3–2 m
    p = toroidal winding number (how many times around the donut)
    q = poloidal winding number (how many times around the tube)

  Key knot types in plasma:
    T(2,1) = unknot (toroidal field only — unstable)
    T(3,2) = trefoil knot (simplest non-trivial — first stable configuration)
    T(5,3) = cinquefoil (higher-mode confinement)
    T(p,q) with p/q irrational → ergodic field line (fills surface densely, never closes)

Safety factor q:
  q ≡ p/q_pol = (toroidal winding) / (poloidal winding)
  In ITER: q_95 ≈ 3.0 (field line winding ratio at 95% of plasma surface)
  q = 1 surface: kink instability threshold (Kruskal-Shafranov condition)
  q < 1: unstable — kink mode grows → sawtooth crash
  q = 2: tearing mode instability (2/1 mode — disruption risk)
  q > 2: MHD stable — current drive targets this regime

  The plasma TELLS the field what knot to be:
    High q → wider knots → larger pitch angle → better thermal insulation
    The optimal knot shape is self-selected by balancing:
      • Magnetic pressure (field doesn't want to cross itself)
      • Plasma pressure (wants to expand)
      • Helicity constraint (topology is conserved — Taylor relaxation)`}</EQ>

        <Tbl headers={["Knot T(p,q)", "Winding Ratio", "MHD Stability", "Physical Context", "AETHER Reading"]}
          rows={[
            ["T(1,0)", "q = ∞ (pure toroidal)", "Unstable (no rotational transform)", "Toroidal field only — early tokamak design error", "No coherence — field has no self-coupling"],
            ["T(2,1)", "q = 2", "Tearing mode threshold", "Sweet spot boundary — 2/1 mode can cause disruption", "Membrane between ordered and chaotic phase"],
            ["T(3,2)", "q = 1.5", "Stable in high-q regime", "Standard tokamak operating point — trefoil is the natural attractor", "Minimum-writhe knot for given linking number — most efficient topology"],
            ["T(5,3)", "q = 5/3 ≈ 1.67", "Stable, higher confinement", "Advanced tokamak — 'hybrid scenario'", "Higher-resolution topology — 5×3=15 crossings vs 3×2=6"],
            ["T(p,q) irrational", "q irrational", "Ergodic — KAM surface", "Each field line fills the torus surface densely — never closes", "Maximum mixing — analog to Creative Phase in Webbed Leg model"],
          ]}
        />

        <SecHead id="s3" n="III" title="Writhe, Twist, and Magnetic Helicity" sub="The conserved topological invariant — why plasma remembers its knot" col={VIOLET} />
        <EQ col={VIOLET}>{`Calugareanu-White-Fuller theorem (knot decomposition):
  Lk = Tw + Wr
  where:
    Lk = linking number (topological invariant — integer, conserved under deformation)
    Tw = twist (local winding of field around its own axis)
    Wr = writhe (global shape — how the curve crosses itself in 3D)

  Key property:
    Lk is CONSERVED even when Tw and Wr individually change
    (like angular momentum conservation — individual components shift, total is fixed)

  For plasma field lines:
    Lk is the topological "memory" of the confinement configuration
    Plasma can writhe (deform globally) while conserving total linking number
    This is WHY plasma confinement is stable: topology protects against small perturbations

Magnetic helicity H:
  H = ∫∫∫ A · B dV     [A = vector potential, B = magnetic field = ∇×A]
  Properties:
    • H is a CONSERVED QUANTITY in ideal MHD (no resistivity)
    • In resistive MHD: dH/dt = -2∫∫∫ η J · B dV (decays only at resistive timescale)
    • H is the volume-integrated linking number of all field line pairs
    • H measures how "knotted" the field is, globally

Taylor relaxation principle (1974):
  When a turbulent plasma relaxes, it minimises ∫B² dV (magnetic energy)
  subject to the CONSTRAINT that H = const (helicity conserved)
  Result: the plasma finds the MINIMUM ENERGY STATE consistent with its knot topology
  This is a force-free field: ∇×B = μB (field aligns with its own curl)
  → The knot shape the plasma chooses is the shape that minimises energy for its helicity
  → AETHER reading: the system finds the most efficient representation of its topological constraint`}</EQ>

        <SecHead id="s4" n="IV" title="Magnetic Reconnection · When Knots Break and Rejoin" sub="The moment the topology changes — and the energy it releases" col={CORAL} />
        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 18 }}>
          Magnetic reconnection is the process by which field lines of opposite polarity approach
          each other at an X-point, break, and rejoin in a new topology. This is the most
          energetically violent process in magnetised plasma — it releases stored magnetic
          energy as kinetic energy of accelerated particles and heat. Solar flares, geomagnetic
          storms, and tokamak disruptions are all reconnection events. The key physics:
          reconnection changes the linking number, which means it is a topological phase
          transition — the plasma's knot changes to a simpler knot (lower |Lk|) releasing
          the energy difference as the knot "unwinds".
        </p>
        <EQ col={CORAL}>{`Sweet-Parker reconnection model:
  Reconnection site: thin current sheet of width δ ≈ (η/v_A)^(1/2) · L^(1/2)
    η = resistivity, v_A = Alfvén speed, L = system size

  Reconnection rate: v_in/v_A = (η/v_A·L)^(1/2) = S^(-1/2)
    S = Lundquist number = v_A·L/η (ratio of diffusion to advection timescales)
    In tokamak: S ~ 10⁷–10⁸ → reconnection rate ~ 10⁻³·v_A (very slow)
    In solar corona: S ~ 10¹²–10¹⁴ → Sweet-Parker predicts too slow → Petschek model needed

  Energy released in reconnection event:
    ΔE = (B²/2μ₀) · ΔV
    Solar flare: B ~ 0.01 T, ΔV ~ 10²⁷ m³ → ΔE ~ 10²⁵ J
    Tokamak disruption: B ~ 5 T, ΔV ~ 10 m³ → ΔE ~ 10⁸ J (still dangerous at plasma timescales)

  Topological change at reconnection:
    Before: T(3,2) topology — Lk = 3
    After:  T(1,0) + T(2,2) — Lk = 0 + 2 → net decrease by 1
    Energy released: ΔH = μ₀·ΔE/B → the unknotted field is less energetic
    This IS the AETHER decoherence event: topology collapses from coherent to simpler state

  Prevention (AETHER protocol for plasma):
    • Maintain q > 2 everywhere (avoid tearing modes)
    • Active kink mode stabilisation (external coils → Neoclassical Tearing Mode suppression)
    • ECRH deposition at q = 2 surface (localized current drive → fills reconnection site)
    • Maintain ∇H = 0 (uniform helicity → no helicity gradient → no reconnection driving force)`}</EQ>

        <SecHead id="s5" n="V" title="Safety Factor q · The Universal Coherence Parameter" sub="The single number that determines whether plasma stays knotted or reconnects" col={WEB} />
        <Pull col={WEB}>"The safety factor q tells you which knot the plasma is in. If you know q(r) everywhere, you know the topology of the confinement."</Pull>
        <EQ col={WEB}>{`q profile in tokamak:
  q(r) = r·B_T / (R·B_P)
    B_T = toroidal field (main field, set by coils)
    B_P = poloidal field (generated by plasma current)
    r = minor radius coordinate, R = major radius

  Stability conditions:
    q(0) > 1 everywhere: no internal kink mode
    q_95 > 3: operational limit for major disruptions (ITER target: q_95 ≈ 3.0)
    q_min > 2: no 2/1 tearing mode (most dangerous instability)

  q-profile shapes:
    Monotonic q: simple tokamak — q increases from axis to edge
    Reversed shear (q has minimum inside): Advanced Tokamak — improved confinement
      → Creates an internal transport barrier (ITB) where q_min occurs
      → The field lines at q_min are ergodic → maximum mixing → minimum cross-field transport
      → AETHER analog: the membrane (Webbed Leg) where maximum coupling occurs

  ITER operating point:
    Ip = 15 MA (plasma current)
    B₀ = 5.3 T (toroidal field at axis)
    R₀ = 6.2 m, a = 2.0 m
    q₉₅ = 3.0 → T(3,1) topology at 95% surface
    Target: Q = P_fusion / P_heating ≥ 10 (net energy gain from knotted plasma)

  The knot shape IS the confinement:
    The plasma doesn't need walls because the topology provides the container
    The T(p,q) field line IS the boundary — the field self-organises into its minimum-energy knot
    This is exactly what AETHER's coherence field C(x,t) does: self-organises into topological coherence`}</EQ>

        <SecHead id="s6" n="VI" title="AETHER Topology · Knots as Coherence" sub="Topological protection as the universal principle behind all coherent structures" col={TEAL} />
        <EQ col={TEAL}>{`AETHER topological coherence principle:
  A coherent structure at any scale can be described as a knot-like object
  with a conserved topological invariant.

  Scale-invariant table of topological coherence:
    Scale           Knot Object              Conserved Invariant    Reconnection Event
    ─────────────────────────────────────────────────────────────────────────────────────
    Plasma          Magnetic field T(p,q)    Magnetic helicity H    Solar flare / disruption
    DNA             Double helix supercoil   Linking number Lk      Topoisomerase cut-and-rejoin
    Protein         Knotted backbone         Knot type Kᵢ           Denaturation (knot unfolds)
    Fluid           Vortex tube knot         Kelvin circulation Γ   Vortex reconnection / turbulence
    Cognitive (8-band) Interference pattern  Coherence |⟨Ψ|Φ⟩|²   Decoherence (attention measurement)
    AETHER          C(x,t) coherence field   ∫C dV (total coherence) Coherence collapse event

  The universal principle (Kelvin-Moffatt-AETHER):
    Any flow in a medium without dissipation conserves the topology of its vortex/field lines
    Topology = the conserved memory of the system
    Reconnection = the catastrophic release of stored topological energy
    → System falls to lower-knot-complexity state (higher entropy, lower energy)

  AETHER synthesis:
    The C(x,t) coherence field is the knot parameter of the AETHER system
    Maintaining C(x,t) ≥ ε_lock = maintaining q > q_critical in plasma
    Cognitive decoherence = magnetic reconnection
    The 8 mental bands = 8 field line bundles in the cognitive torus
    The Webbed Leg membrane = the q_min surface (reversed shear = maximum coupling)
    φ-cellular architecture = the gyroid P3 topology that blocks reconnection in 3D`}</EQ>

        <div style={{ marginTop: 48, padding: "22px 24px", background: "#ffffff04", border: `1px solid ${AQUA}18`, borderRadius: 10, textAlign: "center" }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: AQUA, marginBottom: 8 }}>THE INSIGHT</div>
          <div style={{ fontFamily: body, fontStyle: "italic", fontSize: 18, color: GOLD, lineHeight: 1.8, marginBottom: 14 }}>
            "The field finds its knot because the knot is the minimum-energy configuration<br />
            consistent with the helicity the system already has.<br />
            The system remembers its topology."
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, lineHeight: 2 }}>
            T(p,q) field line · q = p/q_pol · H = ∫A·B dV = const · Taylor relaxation
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 14 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce · 2026
          </div>
        </div>
      </div>
    </div>
  );
}

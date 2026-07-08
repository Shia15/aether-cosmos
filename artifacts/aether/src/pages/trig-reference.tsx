import { useState, useEffect, useRef } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────
const Q_COLOR = {
  I:     { bg: "rgba(96,165,250,0.08)",  border: "rgba(96,165,250,0.18)",  dot: "#60a5fa", label: "#93c5fd" },
  "I-II":{ bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.28)", dot: "#c084fc", label: "#d8b4fe" },
  II:    { bg: "rgba(45,212,191,0.08)",  border: "rgba(45,212,191,0.15)",  dot: "#2dd4bf", label: "#5eead4" },
  "II-III":{ bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.28)", dot: "#c084fc", label: "#d8b4fe" },
  III:   { bg: "rgba(242,191,101,0.08)", border: "rgba(242,191,101,0.15)", dot: "#f2bf65", label: "#fde68a" },
  "III-IV":{ bg: "rgba(192,132,252,0.12)", border: "rgba(192,132,252,0.28)", dot: "#c084fc", label: "#d8b4fe" },
  IV:    { bg: "rgba(248,113,113,0.08)", border: "rgba(248,113,113,0.15)", dot: "#f87171", label: "#fca5a5" },
  Full:  { bg: "rgba(200,195,240,0.04)", border: "rgba(200,195,240,0.1)",  dot: "#e0d8ff", label: "#e0d8ff" },
};

type QKey = keyof typeof Q_COLOR;

interface Row {
  radLabel: string;
  radVal: number;
  deg: number;
  quad: QKey;
  sin: string;
  cos: string;
  tan: string;
  sinVal: number;
  cosVal: number;
  tanVal: number | null;
}

const ROWS: Row[] = [
  { radLabel: "0",      radVal: 0,              deg: 0,   quad: "I",     sin: "0.000",  cos: "1.000",  tan: "0",         sinVal: 0,             cosVal: 1,             tanVal: 0 },
  { radLabel: "π/6",   radVal: Math.PI/6,      deg: 30,  quad: "I",     sin: "0.500",  cos: "0.866",  tan: "0.577",     sinVal: 0.5,           cosVal: Math.sqrt(3)/2, tanVal: 1/Math.sqrt(3) },
  { radLabel: "π/4",   radVal: Math.PI/4,      deg: 45,  quad: "I",     sin: "0.707",  cos: "0.707",  tan: "1",         sinVal: Math.sqrt(2)/2, cosVal: Math.sqrt(2)/2, tanVal: 1 },
  { radLabel: "π/3",   radVal: Math.PI/3,      deg: 60,  quad: "I",     sin: "0.866",  cos: "0.500",  tan: "1.732",     sinVal: Math.sqrt(3)/2, cosVal: 0.5,           tanVal: Math.sqrt(3) },
  { radLabel: "π/2",   radVal: Math.PI/2,      deg: 90,  quad: "I-II",  sin: "1.000",  cos: "0.000",  tan: "undefined", sinVal: 1,             cosVal: 0,             tanVal: null },
  { radLabel: "2π/3",  radVal: 2*Math.PI/3,    deg: 120, quad: "II",    sin: "0.866",  cos: "−0.500", tan: "−1.732",    sinVal: Math.sqrt(3)/2, cosVal: -0.5,          tanVal: -Math.sqrt(3) },
  { radLabel: "3π/4",  radVal: 3*Math.PI/4,    deg: 135, quad: "II",    sin: "0.707",  cos: "−0.707", tan: "−1",        sinVal: Math.sqrt(2)/2, cosVal: -Math.sqrt(2)/2, tanVal: -1 },
  { radLabel: "5π/6",  radVal: 5*Math.PI/6,    deg: 150, quad: "II",    sin: "0.500",  cos: "−0.866", tan: "−0.577",    sinVal: 0.5,           cosVal: -Math.sqrt(3)/2, tanVal: -1/Math.sqrt(3) },
  { radLabel: "π",     radVal: Math.PI,         deg: 180, quad: "II-III",sin: "0.000",  cos: "−1.000", tan: "0",         sinVal: 0,             cosVal: -1,            tanVal: 0 },
  { radLabel: "7π/6",  radVal: 7*Math.PI/6,    deg: 210, quad: "III",   sin: "−0.500", cos: "−0.866", tan: "0.577",     sinVal: -0.5,          cosVal: -Math.sqrt(3)/2, tanVal: 1/Math.sqrt(3) },
  { radLabel: "5π/4",  radVal: 5*Math.PI/4,    deg: 225, quad: "III",   sin: "−0.707", cos: "−0.707", tan: "1",         sinVal: -Math.sqrt(2)/2, cosVal: -Math.sqrt(2)/2, tanVal: 1 },
  { radLabel: "4π/3",  radVal: 4*Math.PI/3,    deg: 240, quad: "III",   sin: "−0.866", cos: "−0.500", tan: "1.732",     sinVal: -Math.sqrt(3)/2, cosVal: -0.5,          tanVal: Math.sqrt(3) },
  { radLabel: "3π/2",  radVal: 3*Math.PI/2,    deg: 270, quad: "III-IV",sin: "−1.000", cos: "0.000",  tan: "undefined", sinVal: -1,            cosVal: 0,             tanVal: null },
  { radLabel: "5π/3",  radVal: 5*Math.PI/3,    deg: 300, quad: "IV",    sin: "−0.866", cos: "0.500",  tan: "−1.732",    sinVal: -Math.sqrt(3)/2, cosVal: 0.5,           tanVal: -Math.sqrt(3) },
  { radLabel: "7π/4",  radVal: 7*Math.PI/4,    deg: 315, quad: "IV",    sin: "−0.707", cos: "0.707",  tan: "−1",        sinVal: -Math.sqrt(2)/2, cosVal: Math.sqrt(2)/2, tanVal: -1 },
  { radLabel: "11π/6", radVal: 11*Math.PI/6,   deg: 330, quad: "IV",    sin: "−0.500", cos: "0.866",  tan: "−0.577",    sinVal: -0.5,          cosVal: Math.sqrt(3)/2, tanVal: -1/Math.sqrt(3) },
  { radLabel: "2π",    radVal: 2*Math.PI,       deg: 360, quad: "Full",  sin: "0.000",  cos: "1.000",  tan: "0",         sinVal: 0,             cosVal: 1,             tanVal: 0 },
];

// ── Unit Circle Canvas ────────────────────────────────────────────────────────
function UnitCircle({ row, animAngle }: { row: Row; animAngle: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2;
    const R = W * 0.38;

    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = "rgba(3,5,20,0.0)";
    ctx.fillRect(0, 0, W, H);

    // Grid lines (faint)
    ctx.strokeStyle = "rgba(200,195,240,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke();

    // Quadrant labels
    const qFont = "10px Cinzel, serif";
    ctx.font = qFont;
    ctx.textAlign = "center";
    [["I", cx + R*0.5, cy - R*0.5, "#60a5fa"],
     ["II", cx - R*0.5, cy - R*0.5, "#2dd4bf"],
     ["III", cx - R*0.5, cy + R*0.5, "#f2bf65"],
     ["IV", cx + R*0.5, cy + R*0.5, "#f87171"]].forEach(([label, x, y, color]) => {
      ctx.fillStyle = color as string + "50";
      ctx.fillText(label as string, x as number, y as number);
    });

    // Circle
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 2 * Math.PI);
    ctx.strokeStyle = "rgba(192,132,252,0.25)";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Tick marks at the 16 standard angles
    ROWS.forEach(r => {
      const angle = -r.radVal; // canvas y is flipped
      const tx = cx + (R + 6) * Math.cos(angle);
      const ty = cy + (R + 6) * Math.sin(angle);
      ctx.beginPath();
      ctx.arc(tx, ty, 2, 0, 2 * Math.PI);
      ctx.fillStyle = "rgba(192,132,252,0.25)";
      ctx.fill();
    });

    // Animated angle arm
    const θ = -animAngle;
    const px = cx + R * Math.cos(θ);
    const py = cy + R * Math.sin(θ);

    // Sector fill
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R * 0.28, 0, θ, animAngle > 0);
    ctx.closePath();
    ctx.fillStyle = Q_COLOR[row.quad].dot + "18";
    ctx.fill();

    // Radius arm
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = Q_COLOR[row.quad].dot;
    ctx.lineWidth = 2;
    ctx.stroke();

    // sin (vertical) line
    ctx.beginPath();
    ctx.moveTo(px, cy);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#c084fc";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // cos (horizontal) line
    ctx.beginPath();
    ctx.moveTo(cx, py);
    ctx.lineTo(px, py);
    ctx.strokeStyle = "#60a5fa";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([3, 3]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Point on circle
    ctx.beginPath();
    ctx.arc(px, py, 5, 0, 2 * Math.PI);
    ctx.fillStyle = Q_COLOR[row.quad].dot;
    ctx.fill();
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = "rgba(200,195,240,0.6)";
    ctx.fill();

    // Axis labels
    ctx.font = "9px monospace";
    ctx.fillStyle = "rgba(200,195,240,0.4)";
    ctx.textAlign = "center";
    ctx.fillText("1", cx + R + 14, cy + 3);
    ctx.fillText("-1", cx - R - 16, cy + 3);
    ctx.fillText("1", cx - 3, cy - R - 8);
    ctx.fillText("-1", cx + 2, cy + R + 14);

    // θ label near sector
    ctx.font = "italic 11px serif";
    ctx.fillStyle = Q_COLOR[row.quad].dot + "cc";
    ctx.textAlign = "left";
    const labelR = R * 0.38;
    const midAngle = -animAngle / 2;
    ctx.fillText("θ", cx + labelR * Math.cos(midAngle) + 4, cy + labelR * Math.sin(midAngle));

    // coord label
    ctx.font = "10px monospace";
    ctx.fillStyle = "rgba(200,195,240,0.7)";
    const lx = px + (px > cx ? 8 : -8);
    const ly = py + (py > cy ? 14 : -6);
    ctx.textAlign = px > cx ? "left" : "right";
    ctx.fillText(`(${row.cos}, ${row.sin})`, lx, ly);

  }, [row, animAngle]);

  return <canvas ref={canvasRef} width={280} height={280} style={{ display: "block" }} />;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function TrigReferenceHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W*0.18,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const r=45;
      ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle="rgba(46,240,216,0.2)";ctx.lineWidth=0.5;ctx.stroke();
      const angle=t*0.03-Math.PI/2;
      const px=cx+r*Math.cos(angle),py=cy+r*Math.sin(angle);
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,cy);ctx.strokeStyle="rgba(201,168,76,0.6)";ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.moveTo(px,cy);ctx.lineTo(px,py);ctx.strokeStyle="rgba(255,68,119,0.6)";ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(px,py);ctx.strokeStyle="rgba(46,240,216,0.6)";ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fillStyle="rgba(46,240,216,0.4)";ctx.fill();
      ctx.beginPath();ctx.arc(px,py,4,0,Math.PI*2);ctx.fillStyle="rgba(153,102,255,0.8)";ctx.fill();
      const startX=cx+r+20;
      ctx.beginPath();
      for(let x=0;x<=W-startX;x+=2){
        const y=cy+35*Math.sin((x/(W-startX))*Math.PI*4+t*0.03);
        x===0?ctx.moveTo(startX+x,y):ctx.lineTo(startX+x,y);
      }
      ctx.strokeStyle="rgba(255,68,119,0.35)";ctx.lineWidth=0.8;ctx.stroke();
      ctx.beginPath();
      for(let x=0;x<=W-startX;x+=2){
        const y=cy+35*Math.cos((x/(W-startX))*Math.PI*4+t*0.03);
        x===0?ctx.moveTo(startX+x,y):ctx.lineTo(startX+x,y);
      }
      ctx.strokeStyle="rgba(201,168,76,0.35)";ctx.lineWidth=0.8;ctx.stroke();
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("TRIG REFERENCE · SINE · COSINE · UNIT CIRCLE · RADIANS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function TrigReferenceView() {
  const [selectedIdx, setSelectedIdx] = useState(3); // π/3 default
  const [animAngle, setAnimAngle] = useState(ROWS[3].radVal);
  const animRef = useRef<number>(0);
  const startAngleRef = useRef(ROWS[3].radVal);
  const targetAngleRef = useRef(ROWS[3].radVal);
  const startTimeRef = useRef(0);
  const ANIM_MS = 500;

  const selectRow = (idx: number) => {
    setSelectedIdx(idx);
    startAngleRef.current = animAngle;
    targetAngleRef.current = ROWS[idx].radVal;
    startTimeRef.current = performance.now();
    cancelAnimationFrame(animRef.current);

    const tick = () => {
      const elapsed = performance.now() - startTimeRef.current;
      const t = Math.min(1, elapsed / ANIM_MS);
      const ease = 1 - Math.pow(1 - t, 3);
      const angle = startAngleRef.current + (targetAngleRef.current - startAngleRef.current) * ease;
      setAnimAngle(angle);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
  };

  const row = ROWS[selectedIdx];
  const qc  = Q_COLOR[row.quad];

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#030514", color: "#ccc", fontFamily: "Raleway, sans-serif", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(192,132,252,0.1)", padding: "12px 28px 10px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "#c084fc", letterSpacing: "0.25em", marginBottom: 3 }}>
            SYSTEM · MATHEMATICS · TRIGONOMETRY
          </div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 18, fontWeight: 700, color: "#e0d8ff", margin: 0, letterSpacing: "0.08em" }}>
            Radians, Degrees & Trig Functions
          </h1>
          <p style={{ fontSize: 11, color: "rgba(200,195,240,0.45)", margin: "3px 0 0", letterSpacing: "0.04em" }}>
            Reference Chart · Unit Circle · sin · cos · tan
          </p>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {(["I","II","III","IV"] as const).map(q => {
            const c = q === "I" ? "#60a5fa" : q === "II" ? "#2dd4bf" : q === "III" ? "#f2bf65" : "#f87171";
            return (
              <div key={q} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: c + "40", border: `1px solid ${c}60` }} />
                <span style={{ fontSize: 9, fontFamily: "Cinzel, serif", color: c + "aa", letterSpacing: "0.12em" }}>Q{q}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* Table */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 0 16px 24px" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 2px" }}>
            <thead>
              <tr>
                {["Radians", "Degrees", "Quadrant", "sin(θ)", "cos(θ)", "tan(θ)"].map(h => (
                  <th key={h} style={{
                    padding: "8px 14px", textAlign: "center", position: "sticky", top: 0, zIndex: 2,
                    fontFamily: "Cinzel, serif", fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
                    color: "rgba(200,195,240,0.6)", background: "#0a0d1e",
                    borderBottom: "1px solid rgba(192,132,252,0.15)",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const qc = Q_COLOR[r.quad];
                const isSelected = i === selectedIdx;
                return (
                  <tr
                    key={i}
                    onClick={() => selectRow(i)}
                    style={{ cursor: "pointer", transition: "all 0.2s" }}
                  >
                    {/* Radians */}
                    <td style={{
                      padding: "9px 14px", textAlign: "center",
                      background: isSelected ? qc.bg : "rgba(3,5,20,0.5)",
                      border: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      borderRight: "none", borderRadius: "6px 0 0 6px",
                      fontFamily: "serif", fontSize: 14, color: isSelected ? qc.label : "rgba(200,195,240,0.6)",
                      transition: "all 0.2s",
                    }}>
                      {r.radLabel}
                    </td>
                    {/* Degrees */}
                    <td style={{
                      padding: "9px 14px", textAlign: "center",
                      background: isSelected ? qc.bg : "rgba(3,5,20,0.5)",
                      borderTop: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      borderBottom: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      fontFamily: "monospace", fontSize: 12, color: isSelected ? "rgba(200,195,240,0.9)" : "rgba(200,195,240,0.5)",
                      transition: "all 0.2s",
                    }}>
                      {r.deg}°
                    </td>
                    {/* Quadrant */}
                    <td style={{
                      padding: "9px 14px", textAlign: "center",
                      background: isSelected ? qc.bg : "rgba(3,5,20,0.5)",
                      borderTop: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      borderBottom: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      transition: "all 0.2s",
                    }}>
                      <span style={{
                        fontFamily: "Cinzel, serif", fontSize: 9, letterSpacing: "0.1em",
                        color: qc.dot, padding: "2px 8px", borderRadius: 10,
                        background: qc.dot + "15",
                        border: `1px solid ${qc.dot}30`,
                      }}>
                        {r.quad}
                      </span>
                    </td>
                    {/* sin */}
                    <td style={{
                      padding: "9px 14px", textAlign: "center",
                      background: isSelected ? qc.bg : "rgba(3,5,20,0.5)",
                      borderTop: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      borderBottom: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      fontFamily: "monospace", fontSize: 12,
                      color: isSelected ? "#d8b4fe" : "rgba(192,132,252,0.65)",
                      transition: "all 0.2s",
                    }}>
                      {r.sin}
                    </td>
                    {/* cos */}
                    <td style={{
                      padding: "9px 14px", textAlign: "center",
                      background: isSelected ? qc.bg : "rgba(3,5,20,0.5)",
                      borderTop: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      borderBottom: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      fontFamily: "monospace", fontSize: 12,
                      color: isSelected ? "#bfdbfe" : "rgba(96,165,250,0.65)",
                      transition: "all 0.2s",
                    }}>
                      {r.cos}
                    </td>
                    {/* tan */}
                    <td style={{
                      padding: "9px 14px", textAlign: "center",
                      background: isSelected ? qc.bg : "rgba(3,5,20,0.5)",
                      border: `1px solid ${isSelected ? qc.border : "rgba(255,255,255,0.03)"}`,
                      borderLeft: "none", borderRadius: "0 6px 6px 0",
                      fontFamily: "monospace", fontSize: 12,
                      color: r.tan === "undefined"
                        ? "rgba(248,113,113,0.6)"
                        : isSelected ? "#fef9c3" : "rgba(242,191,101,0.65)",
                      fontStyle: r.tan === "undefined" ? "italic" : "normal",
                      transition: "all 0.2s",
                    }}>
                      {r.tan}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Identity footer */}
          <div style={{ margin: "20px 0 8px", padding: "14px 16px", borderRadius: 8, border: "1px solid rgba(192,132,252,0.1)", background: "rgba(192,132,252,0.04)", display: "flex", flexWrap: "wrap", gap: 20 }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.5)", letterSpacing: "0.18em", alignSelf: "center" }}>IDENTITIES</div>
            {[
              { eq: "sin²θ + cos²θ = 1", color: "#c084fc" },
              { eq: "tan θ = sin θ / cos θ", color: "#f2bf65" },
              { eq: "sin(−θ) = −sin θ", color: "#60a5fa" },
              { eq: "cos(−θ) = cos θ", color: "#2dd4bf" },
              { eq: "sin(π − θ) = sin θ", color: "#f472b6" },
            ].map(({ eq, color }) => (
              <div key={eq} style={{ fontFamily: "monospace", fontSize: 11, color, opacity: 0.8 }}>{eq}</div>
            ))}
          </div>
        </div>

        {/* Right: Unit circle + info */}
        <div style={{ width: 320, borderLeft: "1px solid rgba(192,132,252,0.07)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.25)", flexShrink: 0 }}>

          {/* Circle */}
          <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(192,132,252,0.5)", letterSpacing: "0.18em", marginBottom: 14, alignSelf: "flex-start" }}>
              UNIT CIRCLE
            </div>
            <div style={{ border: `1px solid ${qc.border}`, borderRadius: 8, padding: 6, background: "rgba(3,5,20,0.5)", boxShadow: `0 0 24px ${qc.dot}12` }}>
              <UnitCircle row={row} animAngle={animAngle} />
            </div>
          </div>

          {/* Selected angle info */}
          <div style={{ padding: "0 20px 20px", flex: 1, overflowY: "auto" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: qc.dot + "aa", letterSpacing: "0.18em", marginBottom: 12 }}>
              SELECTED ANGLE
            </div>

            {/* Main values */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
              {[
                { label: "θ (radians)", value: row.radLabel, color: "#e0d8ff" },
                { label: "θ (degrees)", value: `${row.deg}°`, color: "#e0d8ff" },
                { label: "Quadrant", value: row.quad, color: qc.dot },
                { label: "Quadrant color", value: "──", color: qc.dot },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ padding: "9px 10px", borderRadius: 6, border: `1px solid rgba(255,255,255,0.05)`, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontSize: 9, color: "rgba(200,195,240,0.35)", marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: label.includes("radian") ? "serif" : "monospace", fontSize: 14, color, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>

            {/* sin / cos / tan */}
            {[
              { label: "sin(θ)", value: row.sin, color: "#c084fc", bar: row.sinVal, desc: "opposite / hypotenuse · vertical axis" },
              { label: "cos(θ)", value: row.cos, color: "#60a5fa", bar: row.cosVal, desc: "adjacent / hypotenuse · horizontal axis" },
              { label: "tan(θ)", value: row.tan, color: "#f2bf65", bar: row.tanVal, desc: "sin / cos · slope of radius arm" },
            ].map(({ label, value, color, bar, desc }) => (
              <div key={label} style={{ marginBottom: 12, padding: "10px 12px", borderRadius: 7, border: `1px solid ${color}20`, background: `${color}07` }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color, fontWeight: 600 }}>{label}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 13, color, fontWeight: 700 }}>{value}</span>
                </div>
                {/* Bar (centered at 0) */}
                {bar !== null && value !== "undefined" && (
                  <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", position: "relative", overflow: "hidden", marginBottom: 6 }}>
                    <div style={{
                      position: "absolute", height: "100%",
                      left: bar >= 0 ? "50%" : `${50 + bar * 50}%`,
                      width: `${Math.abs(bar || 0) * 50}%`,
                      background: color,
                      borderRadius: 2,
                      boxShadow: `0 0 4px ${color}`,
                    }} />
                    <div style={{ position: "absolute", left: "50%", top: 0, width: 1, height: "100%", background: "rgba(255,255,255,0.2)" }} />
                  </div>
                )}
                <div style={{ fontSize: 9, color: "rgba(200,195,240,0.35)", lineHeight: 1.4 }}>{desc}</div>
              </div>
            ))}

            {/* Navigation hint */}
            <div style={{ textAlign: "center", fontSize: 9, fontFamily: "monospace", color: "rgba(200,195,240,0.2)", marginTop: 8 }}>
              ← click any table row to animate →
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

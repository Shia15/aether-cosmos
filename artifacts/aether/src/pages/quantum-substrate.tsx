import { useEffect, useRef, useState, useCallback } from "react";

const C = {
  bg: "#020810", panel: "#060d1a",
  teal: "#00e5c0", violet: "#b47ef8", gold: "#c9a227",
  blue: "#4db8ff", white: "#e2e8f0", dim: "#4a6080",
};

// ─── Quantum Diagonalization Canvas ──────────────────────────────────────────
function drawDiag(
  canvas: HTMLCanvasElement,
  t: number,
  tau: number,
  matSize: number,
  eigenvalues: number[]
) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const cx = W / 2, cy = H / 2;
  const cellSz = Math.min(W, H) / (matSize + 2);

  // Draw substrate matrix (left)
  const matX = 40, matY = cy - (matSize * cellSz) / 2;
  ctx.font = `${cellSz * 0.45}px 'DM Mono',monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";

  for (let r = 0; r < matSize; r++) {
    for (let c2 = 0; c2 < matSize; c2++) {
      const phase = (r * matSize + c2) * 0.41 + t * 0.8;
      const val = Math.sin(phase) * Math.cos(t * 0.3 + r * 0.7) * (1 - Math.abs(r - c2) / matSize * 0.6);
      const abs = Math.abs(val);
      const col = r === c2 ? C.teal : C.violet;
      const px = matX + c2 * cellSz + cellSz / 2;
      const py = matY + r * cellSz + cellSz / 2;

      // Cell background
      ctx.fillStyle = r === c2
        ? `rgba(0,229,192,${0.04 + abs * 0.18})`
        : `rgba(180,126,248,${0.02 + abs * 0.08})`;
      ctx.fillRect(matX + c2 * cellSz + 2, matY + r * cellSz + 2, cellSz - 4, cellSz - 4);

      // Value text
      ctx.globalAlpha = 0.5 + abs * 0.5;
      ctx.fillStyle = col;
      ctx.fillText(val.toFixed(2), px, py);
      ctx.globalAlpha = 1;
    }
  }

  // Matrix brackets
  ctx.strokeStyle = "rgba(0,229,192,0.35)";
  ctx.lineWidth = 2;
  const bx0 = matX - 4, bx1 = matX + matSize * cellSz + 4;
  const by0 = matY - 4, by1 = matY + matSize * cellSz + 4;
  const bW = 10;
  ctx.beginPath();
  ctx.moveTo(bx0 + bW, by0); ctx.lineTo(bx0, by0); ctx.lineTo(bx0, by1); ctx.lineTo(bx0 + bW, by1);
  ctx.moveTo(bx1 - bW, by0); ctx.lineTo(bx1, by0); ctx.lineTo(bx1, by1); ctx.lineTo(bx1 - bW, by1);
  ctx.stroke();

  // Arrow: A → D
  const arrowX = matX + matSize * cellSz + 30;
  const arrowY = cy;
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2;
  ctx.setLineDash([4, 4]);
  ctx.beginPath(); ctx.moveTo(arrowX, arrowY); ctx.lineTo(arrowX + 60, arrowY); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = C.gold;
  ctx.beginPath(); ctx.moveTo(arrowX + 60, arrowY); ctx.lineTo(arrowX + 50, arrowY - 5); ctx.lineTo(arrowX + 50, arrowY + 5); ctx.fill();
  ctx.fillStyle = C.gold; ctx.font = "10px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.fillText("P⁻¹AP = D", arrowX + 30, arrowY - 14);

  // Diagonal matrix D (right)
  const diagX = arrowX + 80, diagY = cy - (matSize * cellSz) / 2;
  // Diagonal glow sweep
  const sweepEig = (Math.sin(t * 0.5) + 1) / 2 * (matSize - 1);
  for (let r = 0; r < matSize; r++) {
    for (let c2 = 0; c2 < matSize; c2++) {
      const px = diagX + c2 * cellSz + cellSz / 2;
      const py = diagY + r * cellSz + cellSz / 2;
      if (r === c2) {
        const eigV = eigenvalues[r] * Math.cos(t * 0.22 + r);
        const glow = Math.exp(-Math.abs(r - sweepEig) * 0.8);
        ctx.fillStyle = `rgba(201,162,39,${0.06 + glow * 0.25})`;
        ctx.fillRect(diagX + c2 * cellSz + 2, diagY + r * cellSz + 2, cellSz - 4, cellSz - 4);
        ctx.globalAlpha = 0.6 + glow * 0.4;
        ctx.fillStyle = C.gold;
        ctx.font = `${cellSz * 0.45}px 'DM Mono',monospace`;
        ctx.fillText(eigV.toFixed(2), px, py);
        ctx.globalAlpha = 1;
        // Eigenvalue label
        ctx.fillStyle = `rgba(201,162,39,${0.35 + glow * 0.5})`;
        ctx.font = "9px 'DM Mono',monospace";
        ctx.fillText(`λ${r + 1}`, diagX + matSize * cellSz + 14, py);
      } else {
        ctx.fillStyle = "rgba(255,255,255,0.02)";
        ctx.fillRect(diagX + c2 * cellSz + 2, diagY + r * cellSz + 2, cellSz - 4, cellSz - 4);
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.font = `${cellSz * 0.4}px 'DM Mono',monospace`;
        ctx.textAlign = "center";
        ctx.fillText("0", px, py);
      }
    }
  }

  // Brackets for D
  ctx.strokeStyle = "rgba(201,162,39,0.35)"; ctx.lineWidth = 2;
  const dx0 = diagX - 4, dx1 = diagX + matSize * cellSz + 4;
  ctx.beginPath();
  ctx.moveTo(dx0 + bW, by0); ctx.lineTo(dx0, by0); ctx.lineTo(dx0, by1); ctx.lineTo(dx0 + bW, by1);
  ctx.moveTo(dx1 - bW, by0); ctx.lineTo(dx1, by0); ctx.lineTo(dx1, by1); ctx.lineTo(dx1 - bW, by1);
  ctx.stroke();

  // Eigenvector flow lines
  ctx.lineWidth = 0.8;
  for (let r = 0; r < matSize; r++) {
    const alpha = 0.15 + Math.sin(t * 0.6 + r * 0.9) * 0.1;
    ctx.strokeStyle = r % 2 === 0 ? `rgba(0,229,192,${alpha})` : `rgba(180,126,248,${alpha})`;
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.moveTo(matX + matSize * cellSz + 4, matY + r * cellSz + cellSz / 2);
    ctx.lineTo(diagX - 4, diagY + r * cellSz + cellSz / 2);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Label
  ctx.fillStyle = "rgba(0,229,192,0.35)";
  ctx.font = "10px 'DM Mono',monospace"; ctx.textAlign = "left";
  ctx.fillText("SUBSTRATE MATRIX  A", matX, matY - 16);
  ctx.fillStyle = "rgba(201,162,39,0.35)";
  ctx.fillText("DIAGONAL FORM  D = diag(λ₁…λₙ)", diagX, diagY - 16);

  // τ phase coherence bar at bottom
  const barW = W - 80, barH = 6, barX = 40, barY = H - 30;
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(barX, barY, barW, barH);
  const filled = tau * barW;
  const barG = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  barG.addColorStop(0, "#b47ef8"); barG.addColorStop(0.5, "#00e5c0"); barG.addColorStop(1, "#c9a227");
  ctx.fillStyle = barG;
  ctx.fillRect(barX, barY, filled, barH);
  ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.font = "9px 'DM Mono',monospace"; ctx.textAlign = "left";
  ctx.fillText(`τ-COHERENCE ${(tau * 100).toFixed(0)}%`, barX, barY - 6);
}

// ─── Quantum Knot Canvas ──────────────────────────────────────────────────────
type KnotType = "trefoil" | "figure8" | "torus" | "cinquefoil";

function knotPoint(type: KnotType, u: number, t: number): [number, number, number] {
  const speed = t * 0.25;
  if (type === "trefoil") {
    const a = Math.cos(u) * (2 + Math.cos(1.5 * u + speed));
    const b = Math.sin(u) * (2 + Math.cos(1.5 * u + speed));
    const c = Math.sin(1.5 * u + speed);
    return [a, b, c];
  }
  if (type === "figure8") {
    const a = (2 + Math.cos(2 * u + speed)) * Math.cos(3 * u);
    const b = (2 + Math.cos(2 * u + speed)) * Math.sin(3 * u);
    const c = Math.sin(4 * u + speed);
    return [a, b, c];
  }
  if (type === "torus") {
    const p = 2, q = 3;
    const r = Math.cos(q * u + speed) + 2;
    const a = r * Math.cos(p * u);
    const b = r * Math.sin(p * u);
    const c = -Math.sin(q * u + speed);
    return [a, b, c];
  }
  // cinquefoil
  const a = Math.cos(u) * (2 + Math.cos(2.5 * u + speed));
  const b = Math.sin(u) * (2 + Math.cos(2.5 * u + speed));
  const c = Math.sin(2.5 * u + speed);
  return [a, b, c];
}

function project(x: number, y: number, z: number, rx: number, ry: number, W: number, H: number): [number, number, number] {
  // Rotate around X
  const y1 = y * Math.cos(rx) - z * Math.sin(rx);
  const z1 = y * Math.sin(rx) + z * Math.cos(rx);
  // Rotate around Y
  const x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
  const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
  const scale = 60;
  const fov = 8;
  const depth = fov / (fov + z2 * 0.2);
  return [W / 2 + x2 * scale * depth, H / 2 + y1 * scale * depth, z2];
}

function drawKnot(canvas: HTMLCanvasElement, t: number, knotType: KnotType) {
  const ctx = canvas.getContext("2d"); if (!ctx) return;
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

  const steps = 300;
  const rx = t * 0.18;
  const ry = t * 0.27;

  // Draw knot tube
  const pts: [number, number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const u = (i / steps) * Math.PI * 2;
    const [x, y, z] = knotPoint(knotType, u, t);
    pts.push(project(x, y, z, rx, ry, W, H));
  }

  // Sort segments by z for painter's algorithm
  const segs: { z: number; i: number }[] = [];
  for (let i = 0; i < steps; i++) {
    segs.push({ z: (pts[i][2] + pts[i + 1][2]) / 2, i });
  }
  segs.sort((a, b) => a.z - b.z);

  for (const { i } of segs) {
    const [x1, y1, z1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const hue = (i / steps * 360 + t * 20) % 360;
    const depth = (z1 + 6) / 12;
    const alpha = 0.35 + depth * 0.55;
    const lw = 2 + depth * 3;
    ctx.strokeStyle = `hsla(${hue},90%,65%,${alpha})`;
    ctx.lineWidth = lw;
    ctx.shadowColor = `hsla(${hue},100%,70%,0.4)`;
    ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  }
  ctx.shadowBlur = 0;

  // Knot centre glow
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 80);
  glow.addColorStop(0, "rgba(0,229,192,0.06)"); glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

  // Label
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "10px 'DM Mono',monospace"; ctx.textAlign = "center";
  ctx.fillText(`⟐ ${knotType.toUpperCase()} KNOT`, W / 2, H - 16);
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const KNOT_TYPES: KnotType[] = ["trefoil", "figure8", "torus", "cinquefoil"];
const MAT_SIZES = [3, 4, 5];

function QuantumSubstrateHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const layers=[
      {y:20,col:"#2ef0d8",label:"QUANTUM LAYER",w:800},
      {y:52,col:"#9966ff",label:"SUBSTRATE MESH",w:620},
      {y:84,col:"#c9a84c",label:"FIELD LAYER",w:440},
      {y:116,col:"#44cc77",label:"BASE SUBSTRATE",w:260},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      layers.forEach((l,i)=>{
        const pulse=0.88+0.12*Math.sin(t*0.035+i*0.9);
        const x=(W-l.w*pulse)/2;
        for(let seg=0;seg<Math.round(l.w*pulse/18);seg++){
          const sx=x+seg*18,alpha=0.08+0.08*Math.sin(t*0.04+seg*0.3+i);
          ctx.fillStyle=l.col+Math.round(alpha*255).toString(16).padStart(2,"0");ctx.fillRect(sx,l.y-7,16,14);
        }
        ctx.strokeStyle=l.col+"55";ctx.lineWidth=0.6;ctx.strokeRect(x,l.y-7,l.w*pulse,14);
        ctx.fillStyle=l.col;ctx.font="5.5px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(l.label,W/2,l.y+2.5);ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("QUANTUM SUBSTRATE · FIELD LAYERS · MESH COHERENCE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function QuantumSubstratePage() {
  const diagRef = useRef<HTMLCanvasElement>(null);
  const knotRef = useRef<HTMLCanvasElement>(null);
  const rafDiag = useRef(0);
  const rafKnot = useRef(0);

  const [tau, setTau] = useState(0.72);
  const [matSize, setMatSize] = useState(4);
  const [knotType, setKnotType] = useState<KnotType>("trefoil");
  const [eigenvalues, setEigenvalues] = useState<number[]>([]);

  // Regenerate random eigenvalues when matrix size changes
  useEffect(() => {
    setEigenvalues(Array.from({ length: matSize }, () => (Math.random() * 2 - 1) * 2.8));
  }, [matSize]);

  // Diagonalization animation
  useEffect(() => {
    const canvas = diagRef.current; if (!canvas) return;
    const startT = Date.now();
    const animate = () => {
      const t = (Date.now() - startT) / 1000;
      drawDiag(canvas, t, tau, matSize, eigenvalues);
      rafDiag.current = requestAnimationFrame(animate);
    };
    rafDiag.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafDiag.current);
  }, [tau, matSize, eigenvalues]);

  // Knot animation
  useEffect(() => {
    const canvas = knotRef.current; if (!canvas) return;
    const startT = Date.now();
    const animate = () => {
      const t = (Date.now() - startT) / 1000;
      drawKnot(canvas, t, knotType);
      rafKnot.current = requestAnimationFrame(animate);
    };
    rafKnot.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafKnot.current);
  }, [knotType]);

  const regenerate = useCallback(() => {
    setEigenvalues(Array.from({ length: matSize }, () => (Math.random() * 2 - 1) * 2.8));
  }, [matSize]);

  const panel = { background: "rgba(6,13,26,0.9)", border: "1px solid rgba(0,229,192,0.12)", borderRadius: 12 };
  const btn = (active: boolean, color = C.teal) => ({
    fontFamily: "'DM Mono',monospace", fontSize: 10, letterSpacing: "0.18em",
    padding: "0.3rem 0.65rem", borderRadius: 6, cursor: "pointer", border: `1px solid ${active ? color : "rgba(255,255,255,0.08)"}`,
    background: active ? `${color}18` : "transparent",
    color: active ? color : "rgba(255,255,255,0.3)", textTransform: "uppercase" as const,
  });

  return (
    <div style={{ minHeight: "100%", background: C.bg, color: C.white, fontFamily: "'DM Mono',monospace", overflowY: "auto" }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>QUANTUM SUBSTRATE · FIELD LAYERS · MESH COHERENCE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>4 pulsing mesh layers — the live AETHER quantum substrate simulation.</p></div>
          <QuantumSubstrateHeaderCanvas />
        </div>
      </div>
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(0,229,192,0.1)", padding: "2rem 2.5rem 1.5rem" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.35em", color: C.teal, textTransform: "uppercase", marginBottom: 8 }}>
          AETHER · QUANTUM SUBSTRATE
        </div>
        <h1 style={{ fontSize: "2.4rem", fontFamily: "'Cinzel',serif", color: C.white, margin: "0 0 0.5rem", letterSpacing: "-0.01em" }}>
          Quantum Diagonalization &amp; Knot Theory
        </h1>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 700, lineHeight: 1.7, margin: 0 }}>
          The substrate lattice is diagonalized into eigenvalues governing coherence modes. Quantum knot invariants
          encode topological memory — the shape that cannot be untied without cutting the field.
        </p>
      </div>

      <div style={{ padding: "1.8rem 2.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

        {/* ── LEFT: Diagonalization ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ ...panel, padding: "1rem 1.2rem" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.teal, textTransform: "uppercase", marginBottom: 10 }}>
              I · Substrate Matrix Diagonalization
            </div>
            {/* Controls */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12, alignItems: "center" }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: "0.2em" }}>SIZE:</span>
              {MAT_SIZES.map(s => (
                <button key={s} onClick={() => setMatSize(s)} style={btn(matSize === s)}>{s}×{s}</button>
              ))}
              <button onClick={regenerate} style={{ ...btn(false), marginLeft: 4, borderColor: "rgba(201,162,39,0.3)", color: C.gold }}>
                ↺ REGEN
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, letterSpacing: "0.2em", color: C.dim }}>
                <span>τ-COHERENCE</span><span>{tau.toFixed(2)}</span>
              </div>
              <input type="range" min={0} max={1} step={0.01} value={tau}
                onChange={e => setTau(Number(e.target.value))}
                style={{ accentColor: C.teal, width: "100%" }} />
            </div>
            <canvas ref={diagRef} width={560} height={320}
              style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
          </div>

          {/* Eigenvalue table */}
          <div style={{ ...panel, padding: "1rem 1.2rem" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.gold, textTransform: "uppercase", marginBottom: 10 }}>
              Eigenvalue Spectrum  λ₁…λₙ
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
              {eigenvalues.map((λ, i) => (
                <div key={i} style={{ background: "rgba(201,162,39,0.06)", border: "1px solid rgba(201,162,39,0.18)", borderRadius: 8, padding: "0.6rem 0.8rem" }}>
                  <div style={{ fontSize: 8, letterSpacing: "0.25em", color: "rgba(201,162,39,0.5)", marginBottom: 4 }}>λ{i + 1}</div>
                  <div style={{ fontSize: 16, color: C.gold }}>{λ.toFixed(3)}</div>
                  <div style={{ height: 3, borderRadius: 2, background: "rgba(201,162,39,0.15)", marginTop: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${((λ + 3) / 6) * 100}%`, background: C.gold, borderRadius: 2 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theory cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            {[
              { label: "Spectral Theorem", eq: "A = PDP⁻¹", desc: "Every symmetric matrix decomposes into orthogonal eigenvectors." },
              { label: "CGLE Link", eq: "∂A/∂t = A + (1+iα)∇²A", desc: "Eigenvalues of the diffusion operator set the τ-coherence bandwidth." },
              { label: "Substrate Memory", eq: "Ψ = Σλᵢ|eᵢ⟩⟨eᵢ|", desc: "The quantum state of the substrate is encoded in the spectral decomposition." },
              { label: "Knotting Invariant", eq: "J(K,q) = VK(t)", desc: "Jones polynomial classifies knot topology — a quantum number of the substrate field." },
            ].map(c => (
              <div key={c.label} style={{ ...panel, padding: "0.85rem 1rem", borderLeft: `3px solid ${C.violet}` }}>
                <div style={{ fontSize: 8, letterSpacing: "0.2em", color: C.violet, textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
                <div style={{ fontSize: 13, color: C.gold, marginBottom: 6, letterSpacing: "0.05em" }}>{c.eq}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", lineHeight: 1.55 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: Quantum Knots ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ ...panel, padding: "1rem 1.2rem" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.violet, textTransform: "uppercase", marginBottom: 10 }}>
              II · Quantum Knot Topology
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
              {KNOT_TYPES.map(k => (
                <button key={k} onClick={() => setKnotType(k)} style={btn(knotType === k, C.violet)}>
                  {k}
                </button>
              ))}
            </div>
            <canvas ref={knotRef} width={500} height={420}
              style={{ width: "100%", height: "auto", borderRadius: 8, display: "block" }} />
          </div>

          {/* Knot classification */}
          <div style={{ ...panel, padding: "1rem 1.2rem" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.violet, textTransform: "uppercase", marginBottom: 10 }}>
              Knot Classification &amp; Invariants
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {[
                { name: "Trefoil  3₁", crossing: 3, jones: "−t⁻⁴+t⁻³+t⁻¹", alexander: "−t+3−t⁻¹", substrate: "Immune tangle — 3-fold phase lock" },
                { name: "Figure-Eight  4₁", crossing: 4, jones: "t² − t + 1 − t⁻¹ + t⁻²", alexander: "−t+3−t⁻¹", substrate: "Amphicheiral — fluid ↔ neural coupling" },
                { name: "Torus  T(2,3)", crossing: 5, jones: "−t⁻⁴(1+t²−t⁵−t⁷−t⁹)", alexander: "t² − t + 1", substrate: "Toroidal CGLE phase winding mode" },
                { name: "Cinquefoil  5₁", crossing: 5, jones: "−t⁻⁸+t⁻⁶+t⁻²", alexander: "t² − t + 1 − t⁻¹ + t⁻²", substrate: "5-fold substrate resonance pattern" },
              ].map(k => (
                <div key={k.name} style={{
                  display: "grid", gridTemplateColumns: "1fr auto",
                  background: k.name.includes(knotType.slice(0, 4)) ? "rgba(180,126,248,0.08)" : "transparent",
                  border: k.name.includes(knotType.slice(0, 4)) ? "1px solid rgba(180,126,248,0.25)" : "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 8, padding: "0.65rem 0.85rem", gap: 12, alignItems: "start",
                }}>
                  <div>
                    <div style={{ fontSize: 10, color: C.violet, letterSpacing: "0.15em", marginBottom: 3 }}>{k.name}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>Jones: {k.jones}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.22)" }}>Alexander: {k.alexander}</div>
                    <div style={{ fontSize: 9, color: C.teal, marginTop: 5, opacity: 0.6 }}>AETHER: {k.substrate}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.2em" }}>CROSS</div>
                    <div style={{ fontSize: 20, color: C.gold }}>{k.crossing}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quantum knotting mechanism */}
          <div style={{ ...panel, padding: "1rem 1.2rem", borderLeft: `3px solid ${C.gold}` }}>
            <div style={{ fontSize: 9, letterSpacing: "0.3em", color: C.gold, textTransform: "uppercase", marginBottom: 8 }}>
              Quantum Knotting Mechanism
            </div>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: "0 0 0.8rem" }}>
              In the AETHER substrate, phase fields can braid through each other in ways that create topological invariants. 
              These <span style={{ color: C.teal }}>quantum knots</span> are stable structures that cannot be removed by local operations — they are the 
              <span style={{ color: C.gold }}> memory of the substrate</span>.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
              {[
                { label: "Crossing Number", val: knotType === "trefoil" ? "3" : knotType === "figure8" ? "4" : "5" },
                { label: "Unknotting #", val: knotType === "trefoil" ? "1" : knotType === "figure8" ? "1" : "2" },
                { label: "Bridge Index", val: knotType === "trefoil" ? "2" : knotType === "figure8" ? "2" : "2" },
              ].map(s => (
                <div key={s.label} style={{ textAlign: "center", padding: "0.6rem", background: "rgba(201,162,39,0.05)", borderRadius: 8 }}>
                  <div style={{ fontSize: 22, color: C.gold }}>{s.val}</div>
                  <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.2em", marginTop: 4 }}>{s.label.toUpperCase()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

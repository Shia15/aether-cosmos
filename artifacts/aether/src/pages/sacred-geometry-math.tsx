const sacredGeometry = "/api/storage/public-objects/IMG_2001_1781448388514.png";
const cucaEquation = "/api/storage/public-objects/IMG_1999_1781448388514.png";
const integralTypes = "/api/storage/public-objects/IMG_1998_1781448388514.jpeg";
const atomicGeometry = "/api/storage/public-objects/A66C4D09-0C1D-4F7A-96A5-446A7204E678_1781448388514.png";
import { useState, useEffect, useRef } from "react";

const TABS = [
  { id: "geometry",  label: "Sacred Geometry Forms" },
  { id: "cuca",      label: "CUCA Wave Equation" },
  { id: "integrals", label: "Integral Types" },
  { id: "atomic",    label: "Atomic Geometry" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function SacredGeometryCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 420;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const cx = W*0.38, cy = H/2;
    const PHI = 1.6180339887;
    let t = 0;

    const drawCircle = (x:number,y:number,r:number,alpha:number,hue:number) => {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.strokeStyle=`hsla(${hue},85%,65%,${alpha})`; ctx.lineWidth=0.8; ctx.stroke();
    };

    const draw = () => {
      ctx.fillStyle="#020408"; ctx.fillRect(0,0,W,H);

      const seedR = 56+3*Math.sin(t*0.02);
      const pulse = 0.7+0.3*Math.sin(t*0.025);

      drawCircle(cx,cy,seedR,0.55*pulse,43);
      for (let i=0;i<6;i++){
        const a=i/6*Math.PI*2;
        drawCircle(cx+seedR*Math.cos(a),cy+seedR*Math.sin(a),seedR,0.35*pulse,43+i*8);
      }
      drawCircle(cx,cy,seedR*2,0.2*pulse,50);
      drawCircle(cx,cy,seedR*3,0.12*pulse,45);

      let r=seedR*0.35;
      let fx=cx, fy=cy;
      for (let i=0;i<13;i++){
        ctx.beginPath(); ctx.arc(fx+r,fy,r,Math.PI,Math.PI*2);
        ctx.strokeStyle=`rgba(201,168,76,${0.6*Math.pow(0.85,i)})`; ctx.lineWidth=1.2; ctx.stroke();
        ctx.beginPath(); ctx.arc(fx+r*2,fy-r,r,Math.PI*0.5,Math.PI*1.5);
        ctx.strokeStyle=`rgba(201,168,76,${0.5*Math.pow(0.85,i)})`; ctx.lineWidth=1.0; ctx.stroke();
        const nx=fx+r*2, ny=fy-r, nr=r*PHI;
        fx=nx; fy=ny; r=nr;
        if(r>320) break;
      }

      const spiral = (s:number)=>{
        ctx.beginPath();
        let sr=0.5;
        for (let a=0;a<14*Math.PI;a+=0.04){
          const px=cx-seedR*1.8+sr*Math.cos(a+t*0.01);
          const py=cy+sr*Math.sin(a+t*0.01);
          a<0.04?ctx.moveTo(px,py):ctx.lineTo(px,py);
          sr*=Math.pow(PHI,0.04/Math.PI);
        }
        ctx.strokeStyle=`rgba(201,168,76,${s})`; ctx.lineWidth=1.5; ctx.stroke();
      };
      spiral(0.5);

      const rx=W*0.68, ry=cy;
      let rw=160, rh=rw/PHI;
      for (let i=0;i<6;i++){
        ctx.strokeStyle=`rgba(201,168,76,${0.45-i*0.06})`; ctx.lineWidth=0.7;
        ctx.strokeRect(rx-rw/2,ry-rh/2,rw,rh);
        const nr=rh, nh=rh/PHI;
        rw=nr; rh=nh;
      }
      ctx.fillStyle="rgba(201,168,76,0.4)"; ctx.font="7px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText("φ = 1.618…",rx,ry+88);

      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="7.5px 'Space Mono',monospace";
      ctx.fillText("SEED OF LIFE",cx,cy+seedR*2+18); ctx.textAlign="left";
      const fibNums=[1,1,2,3,5,8,13,21,34,55];
      fibNums.forEach((n,i)=>{
        ctx.fillStyle=`rgba(201,168,76,${0.3+0.05*i})`;
        ctx.font="7px 'Space Mono',monospace";
        ctx.fillText(n.toString(),W*0.62+i*22,H-18);
      });
      ctx.fillStyle="rgba(201,168,76,0.25)"; ctx.font="7px 'Space Mono',monospace";
      ctx.fillText("FIBONACCI",W*0.62,H-6);

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />;
}

function SacredGeometryMathHeaderCanvas() {
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
      for(let i=0;i<6;i++){
        const angle=i/6*Math.PI*2+t*0.01;
        const r=55;
        const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*0.55;
        ctx.beginPath();ctx.arc(x,y,r*0.95,0,Math.PI*2);ctx.strokeStyle=`rgba(201,168,76,${0.06+i*0.015})`;ctx.lineWidth=0.5;ctx.stroke();
      }
      ctx.beginPath();ctx.arc(cx,cy,55,0,Math.PI*2);ctx.strokeStyle="rgba(201,168,76,0.2)";ctx.lineWidth=0.8;ctx.stroke();
      for(let i=0;i<6;i++){
        const a=i/6*Math.PI*2+t*0.01,r=55;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.55);ctx.strokeStyle="rgba(201,168,76,0.06)";ctx.lineWidth=0.4;ctx.stroke();
      }
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SACRED GEOMETRY · FLOWER OF LIFE · VESICA PISCIS · MATH · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SacredGeometryMathPage() {
  const [active, setActive] = useState<TabId>("geometry");

  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1c1209 50%, #0f172a 100%)", borderBottom: "1px solid #92400e", padding: "2.5rem 2rem 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "1.75rem" }}>⬡</span>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.2em", color: "#f59e0b", textTransform: "uppercase", fontWeight: 600 }}>AETHER · Mathematical Foundations</span>
          </div>
          <h1 style={{ fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, margin: "0 0 0.5rem", background: "linear-gradient(135deg, #fde68a, #f59e0b, #d97706)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Sacred Geometry &amp; Mathematics
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1rem", margin: 0, maxWidth: 680 }}>
            From the Sierpiński triangle to the CUCA plant wave equation — the mathematical language underlying AETHER's crystallization model, from atomic geometry to integral calculus.
          </p>
        </div>
      </div>

      <div style={{ padding:"1.5rem 2rem 0", maxWidth:1100, margin:"0 auto" }}>
        <div style={{ display:"inline-block", background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#fde68a", textTransform:"uppercase", marginBottom:"1rem" }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(245,158,11,0.2)",
          borderLeft:"3px solid #f59e0b", borderRadius:14, padding:"1.5rem", marginBottom:"1.5rem" }}>
          <h2 style={{ fontSize:"1.2rem", fontWeight:700, color:"#fde68a", margin:"0 0 0.35rem" }}>
            Sacred Geometry · Seed of Life + φ Spiral
          </h2>
          <p style={{ color:"#94a3b8", fontSize:"0.82rem", margin:"0 0 1rem", lineHeight:1.65 }}>
            Left: Seed of Life — the 7-circle genesis pattern (6 petals + center) underlying the Flower of Life.
            Center: the golden-ratio φ spiral that emerges from Fibonacci rectangle subdivision.
            Right: nested φ rectangles converging to the golden ratio 1.618….
          </p>
          <SacredGeometryCanvas />
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", padding: "0 2rem" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: "0.25rem", overflowX: "auto" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              style={{
                padding: "0.85rem 1.25rem",
                border: "none",
                borderBottom: active === t.id ? "2px solid #f59e0b" : "2px solid transparent",
                background: "transparent",
                color: active === t.id ? "#fde68a" : "#64748b",
                fontWeight: active === t.id ? 700 : 400,
                fontSize: "0.875rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem" }}>

        {/* ── Tab 1: Sacred Geometry Forms ── */}
        {active === "geometry" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fde68a", margin: "0 0 0.4rem" }}>Sacred Geometry · 1st &amp; 2nd Dimensions → Polyhedra → Fractals → Tilings</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                A complete visual taxonomy — from the circle and Vesica Piscis through Platonic solids, Archimedean solids, regular tilings, semi-regular tilings, fractals, and flowering geometric patterns.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f59e0b", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={sacredGeometry} alt="Sacred Geometry — Full Visual Taxonomy of Mathematical Forms" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {[
                ["1D & 2D Foundations", "Circle · Vesica Piscis · Construction of Triangle/Square/Pentagon/Hexagon · 7–12 circles · Hippocrates"],
                ["Sacred Symbols", "Sri Yantra · Yin-Yang · Trefoil · Sierpiński Triangle (D+E+F=1) · Hypotrochoid"],
                ["Space-Filling Curves", "Lévy Curve · Dragon Curve · Hilbert Curve · Gosper Curve (infinite perimeter, finite area)"],
                ["Fractal Structures", "Apollonian Gasket · Mandelbrot Set · Julia Set Fractal · Fúrme 1.5:89"],
                ["Regular Tilings (3)", "Equilateral triangles · Squares · Regular hexagons — only three regular tilings of the plane"],
                ["Semi-Regular Tilings (8)", "5 semi-regular + 3 more — combinations of 2+ regular polygons meeting at identical vertices"],
                ["Penrose Tiling", "Aperiodic tiling with 5-fold symmetry — tiles the plane without repeating"],
                ["The 5 Platonic Solids", "Tetrahedron · Octahedron · Cube · Icosahedron · Dodecahedron — only 5 possible regular polyhedra"],
                ["Archimedean Solids", "1 of 19 shown: Cuboctahedron · 2 of 13 Catalan: Rhombic Dodecahedron — truncations and expansions of Platonic solids"],
                ["Tree Fractals", "Tree fractal using Pythagorean Triangle · Tree fractal using Right Triangle · Knot showing some inversions of Dodecagon"],
                ["Flowering Patterns", "Hexagonal tiling flowers · Octagonal progressions · Decagonal blooms — the geometry of growth"],
                ["Base Polygons", "Triangle · Square · Pentagon · Hexagon · Heptagon · Octagon · Nonagon · Decagon · Undecagon · Icosagon · Triskaidecagon"],
              ].map(([title, desc]) => (
                <div key={title} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#fcd34d", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.35rem" }}>{title}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: CUCA Wave Equation ── */}
        {active === "cuca" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fde68a", margin: "0 0 0.4rem" }}>CUCA Wave Equation · Plant–Soil Quantum Entanglement · η = 0.9980</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                The governing equation of CUCA — a modified wave equation for plant-substrate coherence coupling, incorporating photonic resonance (𝒫_photo), entanglement (ℰ), damping (γ), and the R369 recursive field operator (φ·ℛ369).
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f59e0b", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={cucaEquation} alt="CUCA Wave Equation — Plant Quantum Entanglement and Photosynthesis" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            {/* Main equation display */}
            <div style={{ background: "#1c1209", border: "1px solid #92400e", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem", textAlign: "center" }}>
              <div style={{ color: "#fcd34d", fontSize: "clamp(0.75rem, 2vw, 1rem)", fontFamily: "monospace", lineHeight: 2, wordBreak: "break-word" }}>
                ∂²ψ_CUCA/∂t² = c²∇²ψ + φ·ℛ369(ψ) − γ·∂ψ/∂t + ℰ(ψ₁,ψ₂) + 𝒫_photo(ψ)
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginTop: "0.75rem", fontFamily: "monospace" }}>
                𝒫_photo = φ²·η·Σᵢ αᵢ·exp(−(λᵢ−λ_peak)²/σ²)·⟨ψ_leaf|ψ_soil⟩ · η = 0.9980
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
              {[
                ["∂²ψ_CUCA/∂t²", "Second time derivative of the CUCA field ψ — the acceleration of coherence field evolution in the plant-soil system"],
                ["c²∇²ψ", "Wave propagation term — c is the coherence propagation speed through the medium (leaf-to-soil field velocity)"],
                ["φ·ℛ369(ψ)", "The R369 recursive operator weighted by the golden ratio φ — encodes recursive field harmonics at 3,6,9 symmetry axes"],
                ["−γ·∂ψ/∂t", "Damping term with coefficient γ — energy dissipation as coherence field diffuses through lossy biological medium"],
                ["ℰ(ψ₁,ψ₂)", "Quantum entanglement term — non-local coupling between leaf field ψ₁ (ψ_leaf) and soil field ψ₂ (ψ_soil)"],
                ["𝒫_photo(ψ)", "Photosynthetic coupling term — weighted sum of spectral contributions αᵢ at wavelength λᵢ relative to peak absorption λ_peak"],
                ["⟨ψ_leaf|ψ_soil⟩", "Quantum inner product (bra-ket notation) — the overlap integral between leaf and soil coherence states measures entanglement depth"],
                ["η = 0.9980", "Photosynthetic efficiency coefficient — 99.80% conversion of absorbed photon energy into the CUCA field coupling term"],
              ].map(([sym, desc]) => (
                <div key={sym} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem" }}>
                  <div style={{ color: "#fcd34d", fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.35rem", fontFamily: "monospace" }}>{sym}</div>
                  <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 3: Integral Types ── */}
        {active === "integrals" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fde68a", margin: "0 0 0.4rem" }}>Integral Types · From Line to Volume · Open &amp; Closed Surfaces</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                A quick reference for the six integral types used throughout AETHER's mathematical framework — from simple definite integrals to closed surface and closed volume integrals over manifolds.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", alignItems: "start" }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f59e0b", borderRadius: "0.75rem", padding: "1.5rem" }}>
                <img src={integralTypes} alt="Integral Types — Definite Surface Volume Curve" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
              </div>

              <div>
                {[
                  ["∫ₐᵇ · ∫_G", "Integral", "The fundamental integral over a curve from a to b, or over a general domain G. Accumulates a scalar quantity along a 1D path."],
                  ["∬_ℱ", "Surface Integral (open)", "Integrates over a 2D surface ℱ — used for flux through open surfaces (e.g., electric flux through a face)."],
                  ["∭_V", "Volume Integral", "Triple integral over a 3D volume V — used for total mass, charge, or field energy within a region."],
                  ["∮_γ", "Curve Integral (closed)", "Integral over a closed curve γ — the ∮ symbol indicates the path returns to its starting point. Used in Stokes' theorem."],
                  ["∯_γ", "Surface Integral (closed)", "Double closed integral over a closed surface γ — used for Gauss's law (total flux through a closed surface = enclosed charge/ε₀)."],
                  ["∰_γ", "Volume Integral (closed)", "Triple closed integral over γ — integrates over a bounded closed volume. Used in divergence theorem applications."],
                ].map(([symbol, name, desc]) => (
                  <div key={name} style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1rem", marginBottom: "0.75rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "baseline", marginBottom: "0.35rem" }}>
                      <span style={{ color: "#fcd34d", fontFamily: "monospace", fontSize: "1.1rem", minWidth: 60 }}>{symbol}</span>
                      <span style={{ color: "#fde68a", fontWeight: 700, fontSize: "0.9rem" }}>{name}</span>
                    </div>
                    <div style={{ color: "#94a3b8", fontSize: "0.78rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", background: "#1c1209", border: "1px solid #92400e", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <h4 style={{ color: "#fcd34d", margin: "0 0 0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>AETHER Usage Context</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["CUCA 𝒫_photo", "Uses Σᵢ (discrete sum approximating ∫) over spectral wavelengths αᵢ — could be written as ∫ α(λ)·exp(−(λ−λ_peak)²/σ²) dλ"],
                  ["AETHER Resonance Engine", "Adaptive feedback loop integrals — ∮ over the continuous monitoring cycle = closed curve integral over time"],
                  ["Fractal Language of Light", "The unifying equation I = ∫∫∫∫∫ C·Φ dλdφdSdT uses 5-fold nested integration over the full information space"],
                  ["DAFC System Equation", "dΨ/dt = −∇V_env + λR uses the gradient operator ∇ — equivalent to the surface integral of field divergence by Gauss's theorem"],
                ].map(([context, desc]) => (
                  <div key={context} style={{ background: "#0f172a22", border: "1px solid #92400e", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#fcd34d", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>{context}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 4: Atomic Geometry ── */}
        {active === "atomic" && (
          <div>
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fde68a", margin: "0 0 0.4rem" }}>Measuring by Atom · Atomic Geometry · Precision at the Smallest Scale</h2>
              <p style={{ color: "#94a3b8", margin: 0, fontSize: "0.95rem" }}>
                Atoms are arranged in precise geometric patterns. By analyzing these patterns, we can measure distances, angles, and structures at the atomic level with sub-angstrom precision. This enables breakthroughs in technology, medicine, and our understanding of the material world.
              </p>
            </div>

            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderLeft: "4px solid #f59e0b", borderRadius: "0.75rem", padding: "1.5rem", marginBottom: "1.5rem" }}>
              <img src={atomicGeometry} alt="Measuring by Atom Using Atomic Geometry — Precision at the Smallest Scale" style={{ width: "100%", borderRadius: "0.5rem", border: "1px solid #1e293b" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#fcd34d", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>1. Atomic Arrangement</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>Atoms form a predictable geometric lattice — the crystal structure defines a repeating unit cell with characteristic bond lengths (Å) and bond angles (°). Face-centered cubic, body-centered cubic, and hexagonal close-packed are the three most common arrangements.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#fcd34d", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>2. Geometry Analysis</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>We analyze distances and angles between atoms — using advanced microscopy (STM, AFM, TEM) and atomic modeling (DFT). Highlighted bonds in orange show the measurement vectors. Sub-angstrom precision means resolving features smaller than 10⁻¹⁰ m.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#fcd34d", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>3. Precise Measurement</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>Ultra-precise measurements at the atomic scale. The gold atom in the lattice grid marks a reference dopant — its displacement from the ideal lattice position encodes strain information about local material properties.</p>
              </div>
              <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "0.75rem", padding: "1.25rem" }}>
                <h4 style={{ color: "#fcd34d", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Atomic-Scale Measurement Tool</h4>
                <p style={{ color: "#94a3b8", fontSize: "0.8rem", lineHeight: 1.5, margin: 0 }}>The probe tip (upper left) represents a Scanning Tunneling Microscope or Atomic Force Microscope tip — measuring quantum tunneling current or atomic force with sub-angstrom vertical resolution. The glowing blue contact point is the measurement junction.</p>
              </div>
            </div>

            <div style={{ background: "#1c1209", border: "1px solid #92400e", borderRadius: "0.75rem", padding: "1.25rem" }}>
              <h4 style={{ color: "#fcd34d", margin: "0 0 0.75rem", fontSize: "0.95rem", fontWeight: 700 }}>Applications in AETHER's Framework</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
                {[
                  ["Semiconductor Engineering", "Atomic precision in transistor gate geometry — sub-1nm node fabrication requires atomic-scale measurement to verify channel dimensions"],
                  ["Materials Science", "CNT composite characterization — measuring CNT wall geometry (1–50 nm diameter, ≤1 TPa modulus) requires atomic-scale imaging to verify structure"],
                  ["Nanotechnology", "String nanobot and biomolecular mechanism design — atomic geometry defines the mechanical force-coupling geometry of molecular machines"],
                  ["Quantum Computing", "Qubit placement in quantum dot arrays must be controlled to within single atom positions — atomic geometry IS the quantum circuit"],
                ].map(([domain, desc]) => (
                  <div key={domain} style={{ background: "#0f172a22", border: "1px solid #92400e", borderRadius: "0.5rem", padding: "0.75rem" }}>
                    <div style={{ color: "#fcd34d", fontSize: "0.82rem", fontWeight: 700, marginBottom: "0.25rem" }}>{domain}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.75rem", lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

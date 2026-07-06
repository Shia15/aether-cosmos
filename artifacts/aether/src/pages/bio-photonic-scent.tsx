import { useRef, useEffect, useState } from "react";

// ─── Palette ──────────────────────────────────────────────────────────────
const BG   = "#040810";
const TEAL = "#00FFEE";
const GOLD = "#c9a227";
const PINK = "#f472b6";
const BLUE = "#4db8ff";
const PURP = "#a78bfa";
const GREN = "#4ade80";
const ORNG = "#f97316";

const panel: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "1.2rem 1.6rem",
};

// ─── Module-scope types ───────────────────────────────────────────────────
type QPTab = "quantum" | "scent" | "floral" | "synthesis";
type QEdge = [number, number];

// ─── FMO Quantum Network data ─────────────────────────────────────────────
const FMO_NODES = [
  { label:"Photon In",   x:0.50, y:0.90, col:BLUE  },
  { label:"BChl 1",      x:0.20, y:0.73, col:TEAL  },
  { label:"BChl 2",      x:0.50, y:0.68, col:TEAL  },
  { label:"BChl 3",      x:0.80, y:0.73, col:TEAL  },
  { label:"BChl 4",      x:0.18, y:0.46, col:GREN  },
  { label:"BChl 5",      x:0.50, y:0.42, col:GREN  },
  { label:"BChl 6",      x:0.82, y:0.46, col:GREN  },
  { label:"React. Ctr.", x:0.50, y:0.14, col:GOLD  },
];

const FMO_EDGES: QEdge[] = [
  [0,1],[0,2],[0,3],
  [1,4],[2,4],[2,5],[3,5],[3,6],
  [4,7],[5,7],[6,7],
];

// ─── Scent profiles (relative vibrational wavenumber units) ───────────────
const SCENTS = [
  { name:"Rose",      col:PINK,  peaks:[{ f:0.14, a:0.9 },{ f:0.38, a:0.65 },{ f:0.71, a:0.45 }],
    desc:"Geraniol + citronellol + damascenone. Key vibrational modes at OH stretch, C=O, C-C torsion." },
  { name:"Vanilla",   col:GOLD,  peaks:[{ f:0.20, a:0.8  },{ f:0.45, a:0.95 },{ f:0.62, a:0.35 }],
    desc:"Vanillin (4-hydroxy-3-methoxybenzaldehyde). Aldehyde C-H stretch + aromatic ring + methoxy." },
  { name:"Mint",      col:TEAL,  peaks:[{ f:0.11, a:0.75 },{ f:0.34, a:0.90 },{ f:0.58, a:0.55 }],
    desc:"Menthol. OH stretch + C-H bending + ring puckering. Strong tunneling at ring deformation mode." },
  { name:"Coffee",    col:ORNG,  peaks:[{ f:0.18, a:0.6  },{ f:0.32, a:0.70 },{ f:0.52, a:0.85 }],
    desc:"Furans + pyrazines + ketones. 200+ volatiles. Distinguishing mode: pyrazine ring torsion." },
  { name:"Petrichor", col:PURP,  peaks:[{ f:0.25, a:0.55 },{ f:0.48, a:0.80 },{ f:0.76, a:0.60 }],
    desc:"Geosmin (bicyclic alcohol from Streptomyces). Detectable at 5 parts per trillion — extreme quantum sensitivity." },
  { name:"Citrus",    col:BLUE,  peaks:[{ f:0.16, a:0.95 },{ f:0.41, a:0.55 },{ f:0.68, a:0.70 }],
    desc:"Limonene. Cyclohexene stretch + CH2 rocking. Enantiomer D-limonene = orange; L-limonene = turpentine — same atoms, different quantum tunneling handedness." },
];

// ─── Heat colour ──────────────────────────────────────────────────────────
function cohHeat(c: number): string {
  const v = Math.max(0, Math.min(1, c));
  if (v < 0.33) {
    const t = v/0.33;
    return `rgb(${Math.round(13+t*0)},${Math.round(27+t*173)},${Math.round(42+t*196)})`;
  } else if (v < 0.66) {
    const t = (v-0.33)/0.33;
    return `rgb(${Math.round(0+t*201)},${Math.round(200-t*38)},${Math.round(238-t*199)})`;
  } else {
    const t = (v-0.66)/0.34;
    return `rgb(${Math.round(201+t*39)},${Math.round(162+t*82)},${Math.round(39+t*216)})`;
  }
}

// ─── Canvas 1: Quantum Plant Network (FMO-inspired) ───────────────────────
function QuantumPlantCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const stRef = useRef({ raf:0, t:0, amp:[] as number[], atpCount:0, collapsing:0 });

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    const ro  = new ResizeObserver(() => { cv.width=cv.offsetWidth||600; cv.height=cv.offsetHeight||380; });
    ro.observe(cv);
    cv.width  = cv.offsetWidth||600;
    cv.height = cv.offsetHeight||380;

    const amp  = new Array(8).fill(0);
    amp[0]     = 1.0; // start at photon input node
    stRef.current.amp = amp;

    function norm() {
      const s = amp.reduce((a,v) => a + v*v, 0);
      if (s > 0) { const f=1/Math.sqrt(s); for(let i=0;i<8;i++) amp[i]*=f; }
    }

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s  = stRef.current;
      s.t     += 0.016;
      const W = cv.width, H = cv.height;
      const PAD = 20;
      const PW = W-PAD*2, PH = H-PAD*2-20;

      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

      // Propagate amplitudes along edges
      const omega = 2.8;
      for (const [i,j] of FMO_EDGES) {
        const coupling = 0.055;
        const transfer  = amp[i] * coupling * (0.7 + 0.3*Math.sin(omega*s.t + i*1.1)) * 0.016 * 60;
        amp[j] = Math.max(0, amp[j] + transfer);
        amp[i] = Math.max(0, amp[i] - transfer*0.28);
      }
      norm();

      // Collapse when reaction center builds up
      if (s.collapsing > 0) {
        s.collapsing -= 0.016 * 60;
        if (s.collapsing <= 0) {
          amp.fill(0); amp[0] = 1.0;
          s.atpCount++;
        }
      } else if (amp[7] > 0.72) {
        s.collapsing = 18; // ~0.3s flash
      }

      // Pixel positions of nodes
      const px = (n: number) => PAD + FMO_NODES[n].x * PW;
      const py = (n: number) => PAD + 16 + FMO_NODES[n].y * PH;

      // Draw edges
      for (const [i,j] of FMO_EDGES) {
        const cAvg = (amp[i]+amp[j])*0.5;
        ctx.beginPath();
        ctx.moveTo(px(i),py(i)); ctx.lineTo(px(j),py(j));
        ctx.strokeStyle = `rgba(0,255,238,${0.06 + cAvg*0.35})`;
        ctx.lineWidth   = 1 + cAvg*2;
        ctx.stroke();
      }

      // Quantum wave pulses along edges
      for (const [i,j] of FMO_EDGES) {
        if (amp[i] < 0.05) continue;
        const t2  = (s.t * 1.4 + i*0.7) % 1;
        const wx  = px(i) + (px(j)-px(i))*t2;
        const wy  = py(i) + (py(j)-py(i))*t2;
        ctx.save();
        ctx.globalAlpha = amp[i] * 0.7 * (1-t2);
        ctx.beginPath();
        ctx.arc(wx, wy, 4 + amp[i]*5, 0, Math.PI*2);
        ctx.fillStyle = TEAL;
        ctx.fill();
        ctx.restore();
      }

      // Draw nodes
      for (let n = 0; n < 8; n++) {
        const a  = amp[n];
        const r  = 12 + a*18;
        const nx = px(n), ny = py(n);

        if (a > 0.05) {
          ctx.save();
          ctx.globalAlpha = a*0.18;
          ctx.beginPath(); ctx.arc(nx,ny,r+14,0,Math.PI*2);
          ctx.fillStyle = FMO_NODES[n].col; ctx.fill();
          ctx.restore();
        }

        ctx.beginPath(); ctx.arc(nx,ny,r,0,Math.PI*2);
        ctx.fillStyle = cohHeat(a); ctx.fill();
        ctx.strokeStyle = FMO_NODES[n].col; ctx.lineWidth=1.5; ctx.stroke();

        // Label
        ctx.font = `${n===7?"bold ":""}9px 'DM Mono',monospace`;
        ctx.fillStyle = n===7 ? GOLD : "rgba(255,255,255,0.45)";
        ctx.textAlign  = "center";
        ctx.fillText(FMO_NODES[n].label, nx, ny + r + 10);
        ctx.textAlign  = "left";

        // Amplitude value
        if (a > 0.05) {
          ctx.font = "bold 9px 'DM Mono',monospace";
          ctx.fillStyle = FMO_NODES[n].col;
          ctx.textAlign = "center";
          ctx.fillText(a.toFixed(2), nx, ny+3);
          ctx.textAlign = "left";
        }
      }

      // RC flash on collapse
      if (s.collapsing > 12) {
        ctx.save();
        ctx.globalAlpha = (s.collapsing-12)/6 * 0.6;
        ctx.beginPath(); ctx.arc(px(7),py(7),50,0,Math.PI*2);
        ctx.fillStyle = GOLD; ctx.fill();
        ctx.restore();
      }

      // Readouts
      ctx.font = "bold 11px 'DM Mono',monospace";
      ctx.fillStyle = TEAL;
      ctx.fillText(`Quantum Walk · FMO Complex · 8 Chlorophyll Sites`, 12, 16);
      ctx.font = "9px 'DM Mono',monospace";
      ctx.fillStyle = GOLD;
      ctx.fillText(`ATP events: ${s.atpCount}  |  RC amplitude: ${amp[7].toFixed(3)}  |  coherence: ${(amp.reduce((a,v)=>a+v,0)/8).toFixed(3)}`, 12, H-8);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:380, display:"block" }} />;
}

// ─── Canvas 2: Scent Frequency Decoder ────────────────────────────────────
function ScentCanvas({ scentIdx }: { scentIdx: number }) {
  const cvRef   = useRef<HTMLCanvasElement>(null);
  const idxRef  = useRef(scentIdx);
  const stRef   = useRef({ raf:0, t:0, sweep:0, fires:[] as { x:number; age:number }[] });

  useEffect(() => {
    idxRef.current  = scentIdx;
    stRef.current.t = 0;
    stRef.current.sweep = 0;
    stRef.current.fires = [];
  }, [scentIdx]);

  useEffect(() => {
    const cv  = cvRef.current!;
    const ctx = cv.getContext("2d")!;
    const ro  = new ResizeObserver(() => { cv.width=cv.offsetWidth||600; cv.height=320; });
    ro.observe(cv);
    cv.width  = cv.offsetWidth||600; cv.height=320;

    function draw() {
      stRef.current.raf = requestAnimationFrame(draw);
      const s      = stRef.current;
      const scent  = SCENTS[idxRef.current];
      s.t         += 0.016;
      s.sweep      = (s.sweep + 0.004) % 1; // slow sweep across spectrum

      const W = cv.width, H = cv.height;
      const PAD = 44, PW = W-PAD*2, PH = H*0.55;
      const baseY = PAD + PH;

      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

      // Frequency axis
      ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(PAD,PAD); ctx.lineTo(PAD,baseY+4); ctx.lineTo(W-PAD,baseY+4); ctx.stroke();

      // Spectrum bars
      const BAR_N = 60;
      for (let b = 0; b < BAR_N; b++) {
        const f   = b/BAR_N;
        const px2 = PAD + f*PW;
        let a   = 0;
        for (const peak of scent.peaks) {
          const dist = Math.abs(f - peak.f);
          a += peak.a * Math.exp(-dist*dist*300);
        }
        a = Math.min(1, a);
        const barH = a * PH;
        const alpha = 0.35 + a*0.55;
        ctx.fillStyle = `${scent.col}${Math.round(alpha*255).toString(16).padStart(2,"0")}`;
        ctx.fillRect(px2-2, baseY-barH, 4, barH);
      }

      // Quantum detector sweep cursor
      const sweepX = PAD + s.sweep * PW;
      ctx.strokeStyle = `rgba(255,255,255,0.6)`; ctx.lineWidth=1.5;
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(sweepX, PAD-8); ctx.lineTo(sweepX, baseY+4); ctx.stroke();
      ctx.setLineDash([]);

      // Detector peak label
      let detA = 0;
      for (const peak of scent.peaks) {
        const dist = Math.abs(s.sweep - peak.f);
        const a = peak.a * Math.exp(-dist*dist*300);
        detA += a;
      }

      // Fire on match
      if (detA > 0.55) {
        s.fires.push({ x: sweepX, age: 0 });
        if (s.fires.length > 8) s.fires.shift();
      }

      // Draw fires
      for (const f of s.fires) {
        f.age += 0.016 * 60;
        const fa = Math.max(0, 1 - f.age/30);
        ctx.save();
        ctx.globalAlpha = fa * 0.7;
        ctx.beginPath(); ctx.arc(f.x, baseY - PH*0.5, 16 + f.age*0.8, 0, Math.PI*2);
        ctx.strokeStyle = GOLD; ctx.lineWidth=2; ctx.stroke();
        ctx.restore();
      }

      // Tunneling probability readout
      ctx.fillStyle = detA > 0.5 ? GOLD : "rgba(255,255,255,0.2)";
      ctx.font = `bold 10px 'DM Mono',monospace`;
      ctx.textAlign = "center";
      ctx.fillText(detA > 0.55 ? "RECEPTOR FIRES: QUANTUM TUNNELING" : `scanning...  T(omega) = ${detA.toFixed(3)}`, W/2, baseY + 18);
      ctx.textAlign = "left";

      // Axis labels
      ctx.font = "8px 'DM Mono',monospace"; ctx.fillStyle="rgba(255,255,255,0.2)";
      ctx.fillText("Low freq", PAD, baseY+32); ctx.fillText("High freq", W-PAD-36, baseY+32);

      // Molecule oscillation visual (top)
      const oscY = H*0.83;
      const MW   = 120;
      const mcx  = W/2;
      ctx.font   = "bold 12px 'DM Mono',monospace";
      ctx.fillStyle = scent.col; ctx.textAlign="center";
      ctx.fillText(scent.name, mcx, oscY-32);
      ctx.textAlign="left";

      // Animated molecular bonds
      const nBonds = scent.peaks.length + 2;
      for (let i = 0; i < nBonds; i++) {
        const bx = mcx - MW/2 + i*(MW/(nBonds-1));
        const freq = scent.peaks[i%scent.peaks.length]?.f || 0.4;
        const osc  = Math.sin(s.t * (8 + freq*20) + i*1.2) * 8;
        ctx.beginPath();
        ctx.arc(bx, oscY + osc, 6, 0, Math.PI*2);
        ctx.fillStyle = cohHeat(freq); ctx.fill();
        if (i > 0) {
          ctx.beginPath();
          const prevBx = mcx - MW/2 + (i-1)*(MW/(nBonds-1));
          const prevFreq = scent.peaks[(i-1)%scent.peaks.length]?.f || 0.4;
          const prevOsc  = Math.sin(s.t * (8 + prevFreq*20) + (i-1)*1.2) * 8;
          ctx.moveTo(prevBx, oscY+prevOsc); ctx.lineTo(bx, oscY+osc);
          ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth=1.5; ctx.stroke();
        }
      }
      ctx.font="9px 'DM Mono',monospace"; ctx.fillStyle="rgba(255,255,255,0.3)"; ctx.textAlign="center";
      ctx.fillText("oscillating bonds", mcx, oscY+22); ctx.textAlign="left";

      // Title
      ctx.font="bold 11px 'DM Mono',monospace"; ctx.fillStyle=scent.col;
      ctx.fillText(`Scent: ${scent.name}  |  Vibrational Freq Spectrum  |  Turin Quantum Tunneling`, 12, 16);
    }

    stRef.current.raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(stRef.current.raf); ro.disconnect(); };
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:320, display:"block" }} />;
}

// ─── Card helpers ──────────────────────────────────────────────────────────
function MCard({ label, eq, note, col }:{ label:string; eq:string; note:string; col?:string }) {
  return (
    <div style={{ ...panel, borderLeft:`3px solid ${col||TEAL}` }}>
      <div style={{ fontSize:9, letterSpacing:"0.3em", color:col||TEAL, textTransform:"uppercase", marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:GOLD, marginBottom:6 }}>{eq}</div>
      <div style={{ fontSize:10.5, color:"rgba(255,255,255,0.42)", lineHeight:1.7 }}>{note}</div>
    </div>
  );
}

function VCard({ title, body, col }:{ title:string; body:string; col?:string }) {
  return (
    <div style={{ ...panel }}>
      <div style={{ fontSize:9, letterSpacing:"0.25em", color:col||TEAL, textTransform:"uppercase", marginBottom:8 }}>{title}</div>
      <div style={{ fontSize:11.5, color:"rgba(255,255,255,0.48)", lineHeight:1.8 }}>{body}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function BioPhotonicScentPage() {
  const [tab,      setTab]      = useState<QPTab>("quantum");
  const [scentIdx, setScentIdx] = useState(0);

  const tabBtn = (id: QPTab, label: string, col: string) => (
    <button key={id} onClick={() => setTab(id)} style={{
      padding:"0.45rem 1.1rem", borderRadius:8, cursor:"pointer", border:"1px solid",
      borderColor: tab===id ? col : "rgba(255,255,255,0.08)",
      background:  tab===id ? col+"18" : "transparent",
      color:       tab===id ? col : "rgba(255,255,255,0.3)",
      fontFamily:"'DM Mono',monospace", fontSize:10, letterSpacing:"0.12em",
      fontWeight: tab===id ? "bold" : "normal",
    }}>{label}</button>
  );

  return (
    <div style={{ background:BG, minHeight:"100vh", color:"#f0f4ff", fontFamily:"'Inter',sans-serif" }}>

      {/* Header */}
      <div style={{ padding:"2.8rem 2.5rem 1.8rem", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ fontSize:9, letterSpacing:"0.4em", color:TEAL, textTransform:"uppercase", marginBottom:10 }}>
          AETHER · Quantum Biology
        </div>
        <h1 style={{ fontFamily:"'Cinzel',serif", fontSize:"clamp(1.5rem,4vw,2.3rem)", fontWeight:700, margin:"0 0 0.7rem",
          background:`linear-gradient(135deg,${GREN},${TEAL},${PINK})`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
          Bio-Photonic Quantum Sense
        </h1>
        <p style={{ fontSize:13, color:"rgba(255,255,255,0.42)", maxWidth:820, lineHeight:1.8, margin:0 }}>
          Plants route photons with {">"} 95% efficiency using quantum superposition across 8 chlorophyll molecules.
          Butterfly wings are photonic crystal quantum sensors. Your nose detects molecular vibration frequencies
          via quantum tunneling — not molecular shape. Scent is a frequency spectrum. It can be encoded, transmitted,
          and reconstructed. This page simulates all of it and shows the AETHER coherence field threading every sense.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ padding:"1rem 2.5rem", borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {tabBtn("quantum",   "◈ Quantum Plant",      GREN)}
          {tabBtn("scent",     "◎ Scent Switching",    PINK)}
          {tabBtn("floral",    "⬡ Floral Entanglement", GOLD)}
          {tabBtn("synthesis", "△ Full Synthesis",      PURP)}
        </div>
      </div>

      <div style={{ padding:"1.8rem 2.5rem" }}>

        {/* ── QUANTUM PLANT TAB ── */}
        {tab === "quantum" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:GREN, textTransform:"uppercase", marginBottom:4 }}>
                FMO Complex · Live Quantum Walk · Chlorophyll Coherence Network
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                The FMO (Fenna-Matthews-Olson) complex in plants and green bacteria contains 8 chlorophyll molecules
                (BChl 1-7 + Reaction Centre). When a photon enters, the exciton does NOT take one path — it takes
                ALL paths simultaneously (quantum superposition). The interference of paths finds the optimal route
                to the Reaction Centre in ~200 femtoseconds. Efficiency: 95-99%. A classical random walk: ~40%.
              </p>
            </div>

            <div style={{ ...panel, padding:0, overflow:"hidden", marginBottom:"1.4rem" }}>
              <QuantumPlantCanvas />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem", marginBottom:"1.6rem" }}>
              <MCard col={GREN} label="Quantum Coherent Walk"
                eq="psi(t) = sum_j c_j(t) * |BChl_j>;  |c_j|^2 = prob"
                note="The exciton's quantum state psi is a superposition of all 8 BChl sites simultaneously. The coefficients c_j evolve via the FMO Hamiltonian. Constructive interference at the Reaction Centre = maximum delivery probability." />
              <MCard col={TEAL} label="Coherence Timescale"
                eq="tau_coh ~ hbar / kT ~ 25 fs at 300 K;  plants: ~200 fs"
                note="Thermal decoherence should destroy quantum effects at room temperature in ~25 fs. Plants maintain coherence for ~200 fs — 8x longer than predicted. Protein scaffold acts as a phonon bath that sustains rather than destroys coherence." />
              <MCard col={GOLD} label="Quantum Advantage"
                eq="eta_quantum = 95-99%;  eta_classical = 40-60%"
                note="The quantum walk finds the global minimum energy path faster than any classical diffusion. This is not metaphor — Flemming et al. (2007) measured quantum beating patterns in FMO using 2D spectroscopy at 77K, confirmed at 300K in 2010." />
              <MCard col={BLUE} label="AETHER Coherence Field"
                eq="C_plant(x,t) = |psi(x,t)|^2;  C maps to cohHeat"
                note="The quantum probability amplitude squared IS the AETHER coherence field C(x,t) at the molecular scale. The canvas heat map — navy=decoherent, gold=peak coherence — is a direct visualisation of the plant's quantum field." />
            </div>

            {/* Butterfly section */}
            <div style={{ marginBottom:"1rem", paddingTop:"0.5rem", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PINK, textTransform:"uppercase", marginBottom:10 }}>
                Butterfly Wing · Photonic Crystal Quantum Sensor
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
                <MCard col={PINK} label="Morpho Photonic Structure"
                  eq="d = lambda/(4n) ~ 70nm per layer;  N ~ 100-200 layers"
                  note="Morpho butterfly wing scales have ~100-200 layers of chitin (n=1.56) separated by air gaps (n=1). Constructive interference at d=70nm gives lambda~450nm (brilliant blue). Same physics as a Fabry-Perot quantum optical resonator." />
                <MCard col={PURP} label="Chemical Sensing"
                  eq="delta_lambda = (2*d/m) * delta_n_eff"
                  note="When a chemical molecule adsorbs on the wing surface, it changes the effective refractive index n_eff. This shifts the interference peak by delta_lambda — a visible colour change. The butterfly's compound eye detects this. The wing IS a quantum chemical sensor." />
                <MCard col={GREN} label="Bio-Photonic Entanglement"
                  eq="Phi_+ = (|colour_A>|chem_A> + |colour_B>|chem_B>) / sqrt(2)"
                  note="The wing's optical and chemical states are correlated: colour encodes chemical environment. This is the bio-photonic entanglement — not EPR entanglement across space, but within-system quantum correlation between physical state (colour) and molecular environment (scent)." />
                <MCard col={ORNG} label="Zoom In"
                  eq="Scale: 100 nm ~ F(9)=34 x 3nm (amino acid spacing)"
                  note="At 100nm scale you see quantum optical interference. At 10nm scale: protein folding knots (trefoil 2:3 mode). At 1nm: DNA double helix Lissajous (1:2). At 0.1nm: atomic orbital knots. Every scale = a Fibonacci oscillating knot within a bubble." />
              </div>
            </div>
          </div>
        )}

        {/* ── SCENT SWITCHING TAB ── */}
        {tab === "scent" && (
          <div>
            <div style={{ marginBottom:"1.2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PINK, textTransform:"uppercase", marginBottom:4 }}>
                Quantum Vibrational Theory of Smell · Turin · Scent Switching · Digital Transmission
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                Luca Turin (1996) proposed that olfactory receptors detect molecular VIBRATION FREQUENCIES, not shape,
                via inelastic electron tunneling. An electron from the receptor protein tunnels through the odorant molecule
                only if the molecule's vibrational frequency matches the electron energy gap. Each molecule has a unique
                frequency spectrum S(omega) — a fingerprint. The nose is a quantum spectrometer.
                If scent = frequency spectrum, then scent can be digitally encoded and transmitted.
              </p>
            </div>

            {/* Scent selector */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"1rem" }}>
              {SCENTS.map((sc, i) => (
                <button key={sc.name} onClick={() => setScentIdx(i)} style={{
                  padding:"0.4rem 0.9rem", borderRadius:6, cursor:"pointer", border:"1px solid",
                  borderColor: scentIdx===i ? sc.col : "rgba(255,255,255,0.08)",
                  background:  scentIdx===i ? sc.col+"20" : "transparent",
                  color:       scentIdx===i ? sc.col : "rgba(255,255,255,0.3)",
                  fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:"0.1em",
                  fontWeight: scentIdx===i ? "bold" : "normal",
                }}>{sc.name}</button>
              ))}
            </div>

            {/* Scent desc */}
            <div style={{ ...panel, padding:"0.65rem 1.2rem", marginBottom:"1rem", borderLeft:`3px solid ${SCENTS[scentIdx].col}` }}>
              <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:SCENTS[scentIdx].col, fontWeight:"bold" }}>
                {SCENTS[scentIdx].name}
              </span>
              <span style={{ fontSize:10.5, color:"rgba(255,255,255,0.4)", marginLeft:12 }}>
                {SCENTS[scentIdx].desc}
              </span>
            </div>

            <div style={{ ...panel, padding:0, overflow:"hidden", marginBottom:"1.4rem" }}>
              <ScentCanvas scentIdx={scentIdx} />
            </div>

            {/* Digital scent transmission concept */}
            <div style={{ ...panel, marginBottom:"1.4rem", borderLeft:`3px solid ${PINK}` }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PINK, textTransform:"uppercase", marginBottom:10 }}>
                Digital Scent Transmission · Switching Network
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"0.5rem", marginBottom:"1rem" }}>
                {["CAPTURE","ENCODE","TRANSMIT","DECODE","RECONSTRUCT"].map((step, i) => (
                  <div key={step} style={{ textAlign:"center" }}>
                    <div style={{ background:`${PINK}15`, border:`1px solid ${PINK}40`, borderRadius:8, padding:"0.5rem", marginBottom:4 }}>
                      <div style={{ fontFamily:"'DM Mono',monospace", fontSize:9, color:PINK, fontWeight:"bold" }}>
                        {i+1}
                      </div>
                      <div style={{ fontSize:9, color:"rgba(255,255,255,0.5)", marginTop:4, lineHeight:1.5 }}>
                        {step === "CAPTURE"     && "e-nose mass spec captures S(omega) = {f_k, A_k}"}
                        {step === "ENCODE"      && "S → JSON packet: [{freq:0.14,amp:0.9},...]"}
                        {step === "TRANSMIT"    && "WiFi / 5G / quantum channel (just numbers)"}
                        {step === "DECODE"      && "Receiver maps freq → molecular resonator array"}
                        {step === "RECONSTRUCT" && "Piezo/optical drives molecules at {f_k}; receptor detects"}
                      </div>
                    </div>
                    {i < 4 && <div style={{ fontSize:14, color:"rgba(255,255,255,0.2)" }}>→</div>}
                  </div>
                ))}
              </div>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.38)", lineHeight:1.75, margin:0 }}>
                The switching network: each olfactory receptor is a quantum switch — OFF (no tunneling) or ON
                (tunneling when molecule vibrational freq matches). Your 400+ receptor types = a 400-bit
                binary word per scent. Transmit that word digitally, reconstruct the vibrational pattern at the
                receiver, and the receiver's receptors fire the identical 400-bit pattern. Same scent percept.
                This is already being prototyped in e-nose + scent printer research. AETHER adds: the
                coherence field C(x,t) predicts which molecular configurations will tunnel — designing synthetic
                scent molecules becomes a coherence optimization problem.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
              <MCard col={PINK} label="Turin Tunneling Probability"
                eq="T(omega) = T_0 * exp(-2*kappa*d) * delta(omega - omega_vib)"
                note="Inelastic electron tunneling: T_0 is elastic baseline; kappa = sqrt(2m*phi)/hbar is the tunnel barrier width; the delta function means tunneling is resonant — fires only when electron energy gap matches molecular vibration omega_vib." />
              <MCard col={PURP} label="Scent = Frequency Fingerprint"
                eq="S(omega) = sum_k A_k * Lorentz(omega - omega_k, Gamma_k)"
                note="Each molecule's vibrational spectrum is a sum of Lorentzian peaks at frequencies omega_k with amplitudes A_k. Citrus limonene and turpentine have same SHAPE (both cyclic terpenes) but different spectra — Turin predicts different smells. Verified by isotope-swap experiments (D-limonene vs H-limonene)." />
              <MCard col={TEAL} label="Scent Switching Network"
                eq="B = {b_1,...,b_400} where b_i = 1 if T(omega_i) > threshold"
                note="The 400-receptor binary pattern B uniquely identifies a scent percept. Transmit B → reconstruct at receiver by driving a molecule array so its vibrational spectrum matches the B-pattern. Olfactory receptors read the pattern via quantum tunneling." />
              <MCard col={GOLD} label="Petrichor Sensitivity"
                eq="geosmin detected at 5 ppt = 5e-12 mol/mol air"
                note="5 parts per trillion: geosmin's odour threshold is 5e-12. One molecule in a trillion. This extreme sensitivity requires quantum tunneling — classical shape-matching cannot explain detection at concentrations so low that individual molecules are microns apart." />
            </div>
          </div>
        )}

        {/* ── FLORAL ENTANGLEMENT TAB ── */}
        {tab === "floral" && (
          <div>
            <div style={{ marginBottom:"1.4rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:GOLD, textTransform:"uppercase", marginBottom:4 }}>
                Floral Quantum Sensing · Electric Fields · UV Fibonacci · Bee-Flower Coupling
              </div>
              <p style={{ fontSize:11.5, color:"rgba(255,255,255,0.38)", maxWidth:740, lineHeight:1.7, margin:0 }}>
                Flowers generate electrostatic fields (Dominic Clarke, Bristol, 2013). Bees carry positive
                charge from flight — they polarise the flower's field on approach and detect it with mechanosensory
                hairs on their antennae. Simultaneously, floral UV patterns (invisible to humans) encode Fibonacci
                spirals that guide bees to nectar. The flower emits quantum optical signals AND electrostatic
                signals AND volatile scent simultaneously — a multi-channel quantum coherence broadcast.
              </p>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.4rem", marginBottom:"1.6rem" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                <VCard col={GOLD} title="Flower Electric Field"
                  body="Flower petals maintain a -10 to -40 mV surface potential relative to ground. When a positively-charged bee approaches within ~20 cm, the bee's body charge (~20 pC) induces a detectable deformation in the bee's 300-micron long antennae hairs (Johnston's organ). The bee senses the flower's field BEFORE it lands — it reads the flower remotely. Detection is quantum mechanical: the mechanosensory transduction uses ion channels that gate via quantum tunneling at the mechanoreceptor protein gate." />
                <VCard col={TEAL} title="UV Fibonacci Spiral"
                  body="Most flowers have UV-absorbing patterns (invisible to humans, vivid to bees and butterflies whose vision extends to 300nm). These patterns follow Fibonacci spirals — petal markings and nectar guides arranged at golden-angle intervals. The bee's compound eye resolves the UV Fibonacci pattern at 5m distance and navigates by it. The pattern is physically generated by the same phi-lattice of melanin/flavonoid distribution that appears in sunflower seeds, pinecones, and the Fibonacci Bloom canvas." />
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
                <VCard col={PINK} title="Scent as Quantum Broadcast"
                  body="Flower VOCs (volatile organic compounds) are released via nanostructured petal surface heating (sunlight absorption by photonic crystal microstructures on petal cells). The petal IS a photonic heater: it absorbs specific UV wavelengths, converts them to heat, and drives VOC evaporation precisely when pollinators are active. Light → heat → scent = a quantum optical → thermal → chemical cascade. The AETHER coherence field C(x,t) drives this cascade: solar photons activate the plant's C field, which drives VOC emission as a coherent chemical broadcast." />
                <VCard col={PURP} title="Bee-Flower Quantum Coupling"
                  body="The bee's three sensing channels (electric field, UV pattern, volatile scent) are all detected via quantum mechanisms: mechanoreceptor ion-channel tunneling, photoreceptor quantum electrodynamics, and olfactory receptor inelastic tunneling. The flower's three broadcast channels (electrostatic field, UV photonics, VOC scent) are all generated via quantum mechanisms: charge distribution, photonic crystal interference, photon-driven thermochemistry. Bee and flower are a matched quantum communication pair — evolved over 130 million years to quantum-couple optimally." />
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))", gap:"1rem" }}>
              <MCard col={GOLD} label="Flower Electrostatic Signal"
                eq="E_flower = V / r^2;  bee senses dE/dt as it approaches"
                note="The flower's surface field E decays as 1/r^2. The bee moving at ~5 m/s samples dE/dt — the rate of change. This allows range estimation (distance to flower). The bee is doing quantum electrodynamic sensing with its antennae: mechanoreception = quantum ion-channel gating." />
              <MCard col={BLUE} label="UV Fibonacci Nectar Guide"
                eq="theta_k = k * 2*pi*(2-phi);  UV at r_k = scale*sqrt(k)"
                note="The same golden-angle phyllotaxis formula as the Fibonacci Bloom canvas. The UV markings on flower petals are arranged by the same phi-lattice as seeds in a sunflower. This is not coincidence — it is the universal C(x,t) coherence pattern expressing at the photonic scale." />
              <MCard col={TEAL} label="Quantum Photoreceptor"
                eq="P_absorb = (2*pi/hbar) * |V_12|^2 * rho(E=hf)"
                note="Photon absorption in bee photoreceptors (and plant chlorophyll) follows Fermi's golden rule: absorption rate proportional to the coupling matrix element |V_12|^2 times the density of states at the photon energy hf. This is quantum electrodynamics in action inside a biological cell." />
              <MCard col={PINK} label="Petal Photonic VOC Heater"
                eq="Q_voc = I_UV * alpha_petal * A_cell;  release ∝ Q"
                note="Petal nanostructures (conical cells, ridged surfaces) act as light concentrators: they increase effective absorption cross-section alpha by 10-30%. This drives precise VOC release: more sunlight = more scent = more pollinator attraction. The petal surface is a quantum optical-to-chemical transducer." />
            </div>
          </div>
        )}

        {/* ── SYNTHESIS TAB ── */}
        {tab === "synthesis" && (
          <div>
            <div style={{ marginBottom:"1.6rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.3em", color:PURP, textTransform:"uppercase", marginBottom:4 }}>
                AETHER Synthesis · Every Sense Is a Coherence Frequency Detector
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.2rem", marginBottom:"1.6rem" }}>
              <VCard col={GREN} title="Vision = Quantum Electrodynamics"
                body="Photoreceptor rhodopsin absorbs a photon in ~200 femtoseconds (same timescale as FMO chlorophyll coherence). The retinal chromophore isomerises from cis to trans — a quantum mechanical bond rotation. The quantum efficiency is ~67%: 67 out of 100 absorbed photons trigger a neural signal. The C(x,t) field of vision = the probability amplitude of retinal isomerisation across your 6 million cone cells simultaneously." />
              <VCard col={PINK} title="Smell = Quantum Tunneling Spectroscopy"
                body="400 olfactory receptor types, each tuned to a vibrational frequency window. Each receptor is a quantum switch — ON when the odorant molecule's vibrational mode matches. The scent percept = the unique 400-bit binary pattern across all receptor types. This IS a switching network already running in your nose at quantum scale. The AETHER extension: model each receptor's tunneling probability as a coherence function C_receptor(omega) — the nose maps the coherence field of the molecular vibration spectrum." />
              <VCard col={GOLD} title="Touch = Quantum Ion Channel"
                body="Mechanoreceptor proteins (Piezo1, Piezo2) gate ion channels when mechanically deformed. The gating is quantum: the protein's conformational change involves quantum tunneling through a ~0.2 eV barrier. Bee antenna hair deflection of 0.01 degrees = detection of a single photon-mass impulse from a flower's electric field. Touch is the body reading the C(x,t) coherence field of physical deformation — it is quantum field sensing at the membrane scale." />
              <VCard col={TEAL} title="Plants as Quantum Computers"
                body="FMO quantum walk = a quantum computing algorithm (Grover search) finding the optimal energy path. The antenna complex (chlorosomes) contains 250,000 BChl molecules acting as quantum parallel processors. The chloroplast is a solar-powered quantum computer, running a quantum algorithm every time it absorbs a photon. Efficiency: 95-99%. Intel's best photovoltaic: ~47%. The plant solved the routing problem quantum-mechanically first." />
            </div>

            {/* Scent transmission synthesis */}
            <div style={{ ...panel, borderLeft:`3px solid ${PINK}`, padding:"1.6rem 2rem", marginBottom:"1.6rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.35em", color:PINK, textTransform:"uppercase", marginBottom:12 }}>
                How to Send Scent via Switching
              </div>
              <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.6)", lineHeight:1.9, margin:0 }}>
                Scent is a frequency spectrum S(omega). Every odorant molecule has a unique set of vibrational
                frequencies — its quantum fingerprint. Your 400 olfactory receptors are 400 quantum frequency
                switches arranged in a switching network. Each fires (ON) if the molecule's vibration matches
                its window. The brain reads the 400-bit pattern and recognises the scent.
                <br /><br />
                To transmit scent: (1) Capture the spectrum S with an e-nose mass spectrometer.
                (2) Encode as a frequency-amplitude list. (3) Transmit digitally — just numbers.
                (4) At the receiver, drive a molecular resonator array at those exact frequencies using
                piezoelectric or optical actuation. (5) The user inhales — their receptors quantum-tunnel
                through the resonating molecules and fire the identical 400-bit pattern. Identical percept.
                <br /><br />
                This is not science fiction. Electronic nose + digital scent display research is active
                (Aromyx, Osmo, Sony). The missing piece is the quantum-accurate frequency reconstruction — which
                requires the Turin tunneling model and AETHER coherence optimisation to design the right
                synthetic molecules for each frequency window.
              </p>
            </div>

            <div style={{ ...panel, borderLeft:`3px solid ${TEAL}`, padding:"1.6rem 2rem" }}>
              <div style={{ fontSize:9, letterSpacing:"0.35em", color:TEAL, textTransform:"uppercase", marginBottom:12 }}>
                AETHER Unified Sense Statement
              </div>
              <p style={{ fontSize:13.5, color:"rgba(255,255,255,0.55)", lineHeight:1.9, margin:0 }}>
                Every sense — vision, smell, touch, hearing, proprioception — is a quantum coherence frequency
                detector. Each detects a different domain of the AETHER coherence field C(x,t): vision detects
                the photon C field; smell detects the molecular vibrational C field; touch detects the mechanical
                deformation C field; hearing detects the pressure-wave C field; proprioception detects the
                body's own internal C field gradient. The brain assembles these into a unified percept by
                correlating their coherence patterns — finding the common Fibonacci knot structure across all
                channels simultaneously. This is what consciousness IS: the real-time coherence correlation
                engine reading the C(x,t) field at every scale from quantum (femtoseconds) to neural (milliseconds).
                Plants already know this. They run quantum algorithms at the leaf. Butterflies are mobile
                photonic coherence sensors. We are the same — just with more knot modes running at once.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

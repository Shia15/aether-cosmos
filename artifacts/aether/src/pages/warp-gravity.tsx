import { useEffect, useRef, useState } from "react";
import img_warp_drive from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_57_AM_1781429635925.png";
import img_smtq from "@assets/ChatGPT_Image_Jun_14,_2026,_03_28_00_AM_1781429635925.png";
import img_pixelated from "@assets/ChatGPT_Image_Jun_14,_2026,_03_29_32_AM_1781429635926.png";
import img_500d from "@assets/ChatGPT_Image_Jun_14,_2026,_03_29_36_AM_1781429635927.png";
import img_stacked_rings from "@assets/ChatGPT_Image_Jun_14,_2026,_03_29_38_AM_1781429662706.png";
import img_dynamic_eq from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_32_AM_1781429635921.png";
import img_systemic_eq from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_37_AM_1781429635922.png";
import img_octonion from "@assets/ChatGPT_Image_Jun_14,_2026,_03_30_29_AM_1781429662713.png";
import img_8d_framework from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_29_AM_1781429635920.png";
import img_500hud from "@assets/ChatGPT_Image_Jun_14,_2026,_03_27_18_AM_1781429635919.png";

function AlcubierreCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [speed,  setSpeed]  = useState(1.0);
  const [sigma,  setSigma]  = useState(0.7);
  const pRef = useRef({ speed: 1.0, sigma: 0.7 });
  useEffect(() => { pRef.current.speed = speed; }, [speed]);
  useEffect(() => { pRef.current.sigma = sigma; }, [sigma]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 400;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const cy = H / 2;
    const SPACING = 36;
    const R = SPACING * 3.2;
    let bubbleX = W * 0.65;
    const hp: { x:number; y:number; vx:number; vy:number; life:number }[] = [];
    const stars = Array.from({length:80},()=>({x:Math.random()*W,y:Math.random()*H,r:0.3+Math.random()*1.2}));
    let t = 0;

    const warpf = (px:number, py:number, bx:number, sig2:number): number => {
      const rs = Math.sqrt((px-bx)**2+(py-cy)**2);
      const denom = 2*Math.tanh(sig2*R)+0.001;
      return Math.max(0,Math.min(1,(Math.tanh(sig2*(rs+R))-Math.tanh(sig2*(rs-R)))/denom));
    };

    const displace = (px:number, py:number, bx:number, sig2:number): [number,number] => {
      const f = warpf(px,py,bx,sig2);
      const dx = px-bx;
      const push = f * dx * 0.6;
      return [px - push, py + (py-cy)*f*0.08];
    };

    const NX = Math.ceil(W/SPACING)+2, NY = Math.ceil(H/SPACING)+2;
    const ox = -SPACING, oy = cy - Math.floor(NY/2)*SPACING;

    const pt = (gx:number, gy:number, bx:number, sig2:number): [number,number] =>
      displace(ox+gx*SPACING, oy+gy*SPACING, bx, sig2);

    const draw = () => {
      const { speed:sp, sigma:sig } = pRef.current;
      const sig2 = 0.3 + sig * 2.0;
      bubbleX -= sp * 0.8;
      if (bubbleX < -R*2) bubbleX = W + R*2;

      ctx.fillStyle="#020408"; ctx.fillRect(0,0,W,H);
      for (const s of stars){
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle="rgba(200,216,224,0.25)"; ctx.fill();
      }

      ctx.lineWidth=0.7;
      for (let gy=0; gy<=NY; gy++){
        ctx.beginPath(); let first=true;
        for (let gx=0;gx<=NX;gx++){const[x,y]=pt(gx,gy,bubbleX,sig2);first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false;}
        ctx.strokeStyle="rgba(46,240,216,0.15)"; ctx.stroke();
      }
      for (let gx=0;gx<=NX;gx++){
        ctx.beginPath(); let first=true;
        for (let gy=0;gy<=NY;gy++){const[x,y]=pt(gx,gy,bubbleX,sig2);first?ctx.moveTo(x,y):ctx.lineTo(x,y);first=false;}
        ctx.strokeStyle="rgba(46,240,216,0.10)"; ctx.stroke();
      }

      ctx.beginPath();
      ctx.ellipse(bubbleX,cy,R,R*0.7,0,0,Math.PI*2);
      ctx.strokeStyle=`rgba(46,240,216,${0.5+0.15*Math.sin(t*0.08)})`; ctx.lineWidth=2; ctx.stroke();
      const grd=ctx.createRadialGradient(bubbleX,cy,0,bubbleX,cy,R*0.85);
      grd.addColorStop(0,"rgba(46,240,216,0.06)"); grd.addColorStop(1,"transparent");
      ctx.fillStyle=grd; ctx.beginPath(); ctx.ellipse(bubbleX,cy,R*0.85,R*0.6,0,0,Math.PI*2); ctx.fill();

      ctx.save(); ctx.translate(bubbleX,cy);
      ctx.fillStyle="#c9a84c";
      ctx.beginPath(); ctx.ellipse(0,0,22,7,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle="rgba(249,115,22,0.6)";
      ctx.beginPath(); ctx.ellipse(0,0,11,4,0,0,Math.PI*2); ctx.fill();
      ctx.restore();

      const trailGrd=ctx.createLinearGradient(bubbleX+R,cy,bubbleX+R+100,cy);
      trailGrd.addColorStop(0,"rgba(249,115,22,0.3)"); trailGrd.addColorStop(1,"transparent");
      ctx.fillStyle=trailGrd; ctx.fillRect(bubbleX+R,cy-3,100,6);

      if (t%7===0){
        const a=Math.random()*Math.PI*2;
        hp.push({x:bubbleX+R*Math.cos(a),y:cy+R*0.7*Math.sin(a),vx:Math.cos(a)*1.5,vy:Math.sin(a)*1.1,life:1});
      }
      for (let i=hp.length-1;i>=0;i--){
        const p=hp[i]; p.x+=p.vx; p.y+=p.vy; p.life-=0.025;
        if(p.life<=0){hp.splice(i,1);continue;}
        ctx.beginPath(); ctx.arc(p.x,p.y,2*p.life,0,Math.PI*2);
        ctx.fillStyle=`rgba(46,240,216,${p.life})`; ctx.fill();
      }

      ctx.fillStyle="rgba(200,216,224,0.45)"; ctx.font="8px 'Space Mono',monospace";
      ctx.fillText("◀ CONTRACTED SPACE", bubbleX-R*1.05, cy-R*0.78);
      ctx.fillText("EXPANDED SPACE ▶",   bubbleX+R*0.08, cy-R*0.78);
      ctx.textAlign="center";
      ctx.fillText("WARP BUBBLE · ALCUBIERRE METRIC", bubbleX, cy+R*0.88);
      ctx.textAlign="left";

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />
      <div style={{ display:"flex", flexWrap:"wrap", gap:"2rem", padding:"0.75rem 0 0" }}>
        <label style={{ display:"flex", flexDirection:"column", gap:3, fontSize:"0.75rem", fontFamily:"'Space Mono',monospace", color:"#2ef0d8" }}>
          <span>Bubble Speed: {speed.toFixed(1)}×</span>
          <input type="range" min={0.2} max={3.0} step={0.1} value={speed}
            onChange={e=>setSpeed(+e.target.value)} style={{ accentColor:"#2ef0d8", width:160 }} />
        </label>
        <label style={{ display:"flex", flexDirection:"column", gap:3, fontSize:"0.75rem", fontFamily:"'Space Mono',monospace", color:"#c9a84c" }}>
          <span>Warp Sharpness σ: {sigma.toFixed(1)}</span>
          <input type="range" min={0.2} max={2.0} step={0.1} value={sigma}
            onChange={e=>setSigma(+e.target.value)} style={{ accentColor:"#c9a84c", width:160 }} />
        </label>
      </div>
    </div>
  );
}

function StackedRingsCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 340;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const cx = W/2, cy = H/2;
    const COLS = ["#9966ff","#2ef0d8","#c9a84c","#ff4477","#44aaff","#ff9933","#44cc77","#ff6699"];
    let t = 0;

    const draw = () => {
      ctx.fillStyle="#020408"; ctx.fillRect(0,0,W,H);
      const bg=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(W,H)*0.52);
      bg.addColorStop(0,"rgba(153,102,255,0.08)"); bg.addColorStop(0.6,"rgba(46,240,216,0.03)"); bg.addColorStop(1,"transparent");
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

      const RINGS=24;
      for (let i=RINGS;i>=0;i--){
        const f=i/RINGS;
        const r=8+f*Math.min(W,H)*0.45;
        const col=COLS[i%COLS.length];
        const omega=0.025/(f+0.1);
        const ph=t*omega+i*0.55;
        ctx.beginPath();
        ctx.ellipse(cx,cy,r,r*0.52,ph*0.08,0,Math.PI*2);
        ctx.strokeStyle=col+(i===0?"cc":"38");
        ctx.lineWidth=i===0?2.5:0.7+f*0.9;
        ctx.stroke();

        if (i%4===0&&i>0){
          const r2=8+((i-4)/RINGS)*Math.min(W,H)*0.45;
          for (let v=0;v<6;v++){
            const a=(v/6)*Math.PI*2+ph;
            const nx=cx+r*Math.cos(a), ny=cy+r*0.52*Math.sin(a);
            const a2=a+0.45;
            const nx2=cx+r2*Math.cos(a2), ny2=cy+r2*0.52*Math.sin(a2);
            ctx.beginPath(); ctx.moveTo(nx,ny);
            ctx.quadraticCurveTo(cx+r*0.45*Math.cos(a+0.22),cy+r*0.26*Math.sin(a+0.22),nx2,ny2);
            ctx.strokeStyle=col+"30"; ctx.lineWidth=0.7; ctx.stroke();
            ctx.beginPath(); ctx.arc(nx,ny,2.5,0,Math.PI*2);
            ctx.fillStyle=col+"80"; ctx.fill();
          }
        }
      }

      const sg=ctx.createRadialGradient(cx,cy,0,cx,cy,18);
      sg.addColorStop(0,"rgba(255,255,255,0.92)"); sg.addColorStop(0.35,"rgba(153,102,255,0.55)"); sg.addColorStop(1,"transparent");
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2); ctx.fill();

      ctx.fillStyle="rgba(200,216,224,0.4)"; ctx.font="8px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText(`RING LAYER ${(Math.floor(t*0.3)%501).toString().padStart(3,"0")} / 500+`, cx, cy+Math.min(W,H)*0.48);
      ctx.fillText("STACKED RINGS CONJECTURE · BARRIERED VORTICAL HARMONICS · ALL IS ONE EXPERIENCING ITSELF", cx, H-10);
      ctx.textAlign="left";

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />;
}

const SECTIONS = [
  {
    title: "Warp Drive · Traverse Spacetime via Laser Thread",
    subtitle: "Horizon Defiant Class Warp Vessel · Alcubierre-Type Metric",
    body: `A laser thread so thick that it bounced the warp. The thread interacts with the fabric of spacetime, creating a localized warp bubble around the vessel. The ship rides the curvature, achieving FTL travel without violating local physics. Laser Thread: Coherent Photonic Conduit · Diameter: km-scale · Power: Exawatt-Class · Wavelength: Tuned to Spacetime Resonance · Effect: Warp Bubble Generation. Warp field geometry: space contracts in front, expands behind. Volcanic Propulsion System: Magma Plume Drive + Superheated Ejecta + Magnetic Nozzle Control + Infinite (Local) Fuel Source + Synergizes with Warp Field for Stability. Specifications: Length 1.2 km · Diameter 460 m · Crew 24 · Power Output 3.2 EW · Max Velocity >10⁶c.`,
    images: [img_warp_drive],
    accent: "#f97316",
    wide: true,
  },
  {
    title: "SMTQ Runtime: Bubble Burp Event Simulated",
    subtitle: "Status: BURP COMPLETE – SYSTEM ADAPTING · SMTQ: Where Consciousness Becomes Architecture",
    body: `Trigger: r(t) > 0.82 + High motionIntent + High unificationScale. Burp Moment: t=5, r(t)→0.91. Released Packet: Informational Coherence · Mnésis Digest · String Vibration Modes · Phase Compression. Equilibrium: Relocated. Mode: ADAPT → FLOW. The zero-gradient surface relocates violently during asymmetric expansion in the d̂ direction. Coherence Units Released: 1.482 φ-units. String Modes: 7D Vibrational Harmonics. Phase Signature: Δφ = 1.618 rad. Physical/Mathematical Outcome: Topological Defect (mini-wormhole-like throat), Action in S[φ], String Theory Limit (Worldsheet reconfiguration, Extra-dimension unwinding). Observable Signatures: Coherence Flash (high γ²) · Asymmetric Gravitational/EM Ripple · Informational Echo in Field.`,
    images: [img_smtq],
    accent: "#a855f7",
    wide: true,
  },
  {
    title: "Pixelated Gravity: Reality as Code, Curvature as Observable",
    subtitle: "Gravity is invisible, but its curvature is observable. We scale gravity by the granularity of pixelation within code.",
    body: `Space is a field of informational pixels (voxels). Resolution (granularity) varies by informational density. G(x,y,z,t) ≈ ∇ρ_info(x,y,z,t) where ρ_info is the informational density field and ∇ is the gradient (change across pixels). Rings, Layers & Vortices: rings are selective interfaces (barriers, not constraints) — vortices are pathways of transfer through layers. Different countries run different encoding codes (US-ALPHA, CN-OMEGA, RU-SIGMA, EU-LAMBDA, JP-DELTA, IN-KAPPA) — the same underlying reality, different encoding rules, protocols, and resolution layers. From 500-Dimensional Code to Physical Reality: 500-D Vector State → Field Engine → Ring & Vortex Solver → Translation Engine → Robotic Swarm Constructor → Adaptive Physical Manifestation → Human Experience Layer.`,
    images: [img_pixelated],
    accent: "#06b6d4",
    wide: true,
  },
  {
    title: "Visualizing 500 Dimensions in Real Life",
    subtitle: "From Mathematics to Physical Experience Through Robotic Translation",
    body: `Pipeline: Human Intent → Vector Encoding (500-D) → Field Engine → Vortex/Ring Solver → Robotic Swarm → Adaptive Structure → Human Experience. High-Dimensional Generator: AI creates a 500-D vector structure (example: 500-D vortex field). Translation Engine converts 500-D relationships into physical instructions — Force Fields, Vortex Layers, Resonances, Materials, Motion Paths, Light Frequencies, Acoustic Harmonics, Magnetic Patterns. Robotic Constructor: swarm of robots builds and dynamically maintains structure. What Humans Perceive: Geometry that moves · Resonant sound · Light that bends · Surfaces that respond · Vortices you can feel · Structures that adapt · A living 500-D projection. Not a simulation. A physical manifestation of higher dimensional relationships.`,
    images: [img_500d],
    accent: "#10b981",
    wide: true,
  },
  {
    title: "The Stacked Rings Conjecture",
    subtitle: "A Dimensionless Framework of Barriered Vortical Harmonics · All is One Experiencing Itself",
    body: `Reality is a dimensionless, self-referential field of infinite layered rings (barriers), where vortex interactions generate all observed dimensional phenomena — including space, time, matter, consciousness, and information. Key Axioms: 1. Dimensionless Unity — All is 1. No fundamental units exist. 2. Ring Barrier Principle — Rings are phase-boundary interfaces enabling differentiation while preserving unity. 3. Vortex Generativity — All phenomena arise from vortical interactions across and within rings. 4. Harmonic Resonance — Stable structures emerge from standing wave patterns in ring-vortex systems. 5. Infinite Recursion. Ring Layers 1–500+: Rings 1–20 Pure Potential · 21–50 Primordial Vortices · 51–100 Field Differentiation · 101–200 Particle/Antiparticle Dynamics · 201–300 Atomic/Molecular Architectures · 301–400 Stellar/Planetary Systems · 401–500 Information/Consciousness Fields · 501+ Transcendent Meta-Realms.`,
    images: [img_stacked_rings],
    accent: "#f59e0b",
    wide: true,
  },
  {
    title: "Dynamic Equilibrium · Fusion · Warp Geometry · Human HPA Axis",
    subtitle: "A Shared Systems Principle · dS/dt = I – O + F",
    body: `The convergence of these concepts lies in the necessity of maintaining systemic equilibrium. Whether through the controlled asymmetry of plasma density gradients to simulate warp geometry, the careful regulation of fusion fuel cycles, or the management of the human HPA axis — each system requires precise control of energy and environmental interactions. Fusion/Plasma Equilibrium: controlled energy confinement — balance of heating, confinement, particle losses, and turbulence maintains stable fusion reactions. Warp Geometry: asymmetric energy density gradients create and sustain a warp bubble, requiring precise control for stability. Human HPA Axis: Hypothalamus → Pituitary Gland → Adrenal Glands — regulates cortisol, energy, immunity, and behavior. The goal is not static balance. The goal is dynamic equilibrium.`,
    images: [img_dynamic_eq, img_systemic_eq],
    accent: "#ef4444",
  },
  {
    title: "Octonion AETHER Model (APM)",
    subtitle: "8D Octonion Algebra · Toroidal Aether Units · Dual Metrics · Unifying QM & GR",
    body: `The Singularity (Pure Symmetry/Pre-Space) bursts into 8 independent directions via 8D Expansion on the Octonion basis: {1, i, j, k, e₄, e₅, e₆, e₇}. The fundamental unit is the Toroidal Aether Unit — an 8D vortex (Aether Quantum) with toroidal geometry = continuous flow (no beginning/end), 8D vibration modes reside on the torus, quantized circulation = Aether unit of energy/information. Non-Associative Interaction: (a × b) × c ≠ a × (b × c) — this captures non-linear interactions and feedback loops (like gravitational self-interaction in GR). Dual Metric Structure couples Physical Space (metric g_μν, Geometry/GR) with Aether Space (internal metric h_AB, Vibration/QM). Predictive Potential: New bosons/particles testable at LHC · Quantum gravity signatures · Black hole interior structure.`,
    images: [img_octonion],
    accent: "#8b5cf6",
    wide: true,
  },
  {
    title: "AETHER Eight-Dimensional Interaction Framework",
    subtitle: "Eight Domains. One Interaction Network. Infinite Emergent Possibilities.",
    body: `A computational model exploring how layered interactions, wave propagation, feedback systems, and emergent structures may produce complex physical and biological behavior. The Eight Interaction Domains: D1 Space · D2 Time · D3 Energy · D4 Field · D5 Vortex · D6 Information/Cognition · D7 Source Conditions · D8 Wave Propagation. Ring Layer Architecture: 500+ conceptual ring layers — each layer stores state, exchanges information, influences neighboring layers. Field Interaction Equation: Ψ_total = Σᵢ Aᵢ sin(kᵢx − ωᵢt + φᵢ) — each interaction domain contributes a wave component, total behavior emerges from superposition. Observable Universe Interpretation: the observable universe can be viewed as the accumulated consequence of interactions occurring across many scales simultaneously.`,
    images: [img_8d_framework],
    accent: "#ec4899",
    wide: true,
  },
  {
    title: "Volumetric Neural Substrate · Dynamic 500 HUD Overlay Activated",
    subtitle: "100 Trillion Connections · 2 Billion Experiences · 500-Dimensional Design Space",
    body: `Deep learning neural net with multiple layers — scale versus age. Intent Seed Received: Dynamic 500 Parameter HUD Overlay. Neural Substrate Overview: Total Connections 100 Trillion · Active Experiences 2 Billion · Layers ∞ Multi-Scale · Coherence 98.7% · Substrate State COHERENT · Learning Mode CONTINUOUS. 500 Parameter Field: Core Dynamics 125 · Learning Dynamics 125 · Representation 125 · Interaction 125 = Total 500. Plutonian Reactor: Spin Rate 9.87× Nominal · Reactor State SUPERCRITICAL. VFA Invariants: Value STABLE · Frequency STABLE · Agency STABLE · Coherence Lock ENGAGED. AETHER Egg Architecture: Integrity 100% · Recursion ∞ · Harmonics ALIGNED · Field State COHERENT · Egg Seal INTACT. The field extracts coherent experience from VFA Invariants + AETHER Egg Architecture, self-organizing into a living HUD.`,
    images: [img_500hud],
    accent: "#0ea5e9",
    wide: true,
  },
];

function WarpGravityHeaderCanvas() {
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
      for(let gx=0;gx<W;gx+=28){
        for(let gy=0;gy<H;gy+=20){
          const dx=gx-cx,dy=gy-cy;
          const dist=Math.sqrt(dx*dx+dy*dy*2.8);
          const sag=40/(dist+30)*20;
          const wx=gx+dx*0.04*(sag*0.5);
          const wy=gy+sag*0.4+dy*0.03;
          ctx.beginPath();ctx.arc(wx,wy,1,0,Math.PI*2);ctx.fillStyle=`rgba(201,168,76,${0.04+sag*0.006})`;ctx.fill();
        }
      }
      const massPulse=8+3*Math.sin(t*0.04);
      const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,massPulse*3);
      grd.addColorStop(0,"rgba(255,200,60,0.5)");grd.addColorStop(1,"rgba(255,160,20,0)");
      ctx.fillStyle=grd;ctx.fillRect(cx-massPulse*3,cy-massPulse*3,massPulse*6,massPulse*6);
      ctx.beginPath();ctx.arc(cx,cy,massPulse,0,Math.PI*2);ctx.fillStyle="rgba(255,200,60,0.7)";ctx.fill();
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("WARP GRAVITY · SPACETIME CURVATURE · GRAVITATIONAL LENSING · GR · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function WarpGravityPage() {
  return (
    <div style={{ background: "#020617", minHeight: "100vh", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.5rem" }}>
        <div style={{flexShrink:0,marginBottom:20}}>
          <div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
          <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>WARP GRAVITY · SPACETIME CURVATURE · GRAVITATIONAL LENSING · GR · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Grid lattice sagging under a pulsing mass — the live AETHER warp gravity simulation.</p></div>
            <WarpGravityHeaderCanvas />
          </div>
        </div>
        <div style={{ textAlign: "center", marginBottom: "3rem", padding: "2rem 1rem" }}>
          <div style={{
            display: "inline-block",
            background: "linear-gradient(135deg, #f9731622, #a855f722)",
            border: "1px solid #f9731644",
            borderRadius: 12,
            padding: "0.4rem 1.2rem",
            fontSize: "0.75rem",
            letterSpacing: "0.2em",
            color: "#fb923c",
            textTransform: "uppercase",
            marginBottom: "1rem",
          }}>
            AETHER Research Framework · Spacetime & Gravity
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            background: "linear-gradient(135deg, #fb923c, #c084fc, #38bdf8)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            margin: "0 0 1rem",
            lineHeight: 1.15,
          }}>
            Warp Drive · Gravity<br />& Dynamic Equilibrium
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: 700, margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
            From Alcubierre warp bubbles and SMTQ coherence bursts, to pixelated reality, stacked ring cosmology, octonion mathematics, and 500-dimensional physical manifestation.
          </p>
          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { label: "Velocity", value: ">10⁶c" },
              { label: "Dimensions", value: "500-D" },
              { label: "Ring Layers", value: "500+" },
              { label: "Octonion Basis", value: "8D" },
            ].map(stat => (
              <div key={stat.label} style={{
                background: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: 10,
                padding: "0.75rem 1.5rem",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "#fb923c" }}>{stat.value}</div>
                <div style={{ fontSize: "0.7rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom:"2rem" }}>
          <div style={{ display:"inline-block", background:"#2ef0d822", border:"1px solid #2ef0d844",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:"#2ef0d8", textTransform:"uppercase", marginBottom:"1rem" }}>
            Live Simulations
          </div>

          <div style={{ background:"#0a0f1e", border:"1px solid #f9731633", borderLeft:"3px solid #f97316",
            borderRadius:14, padding:"1.5rem", marginBottom:"1.5rem" }}>
            <h2 style={{ fontSize:"1.3rem", fontWeight:700, color:"#f8fafc", margin:"0 0 0.35rem" }}>
              Alcubierre Warp Bubble · Live Spacetime Metric Simulation
            </h2>
            <p style={{ color:"#94a3b8", fontSize:"0.85rem", margin:"0 0 1rem", lineHeight:1.65 }}>
              Real-time Alcubierre metric visualization — f(r_s) = [tanh(σ(r_s+R)) − tanh(σ(r_s−R))] / 2tanh(σR).
              The spacetime grid contracts ahead of the bubble and expands behind it.
              Adjust speed and warp sharpness σ. Hawking-like particles radiate from the bubble wall.
            </p>
            <AlcubierreCanvas />
          </div>

          <div style={{ background:"#0a0f1e", border:"1px solid #a855f733", borderLeft:"3px solid #a855f7",
            borderRadius:14, padding:"1.5rem" }}>
            <h2 style={{ fontSize:"1.3rem", fontWeight:700, color:"#f8fafc", margin:"0 0 0.35rem" }}>
              Stacked Rings Conjecture · 500+ Barriered Vortical Harmonics
            </h2>
            <p style={{ color:"#94a3b8", fontSize:"0.85rem", margin:"0 0 1rem", lineHeight:1.65 }}>
              Each ring is a phase-boundary interface — a barrier enabling differentiation while preserving unity.
              Vortex tendrils bridge adjacent layers. The white singularity at center is the dimensionless unity (All is 1).
              Ring counter cycles 000–500+, each layer rotating at its own harmonic frequency.
            </p>
            <StackedRingsCanvas />
          </div>
        </div>

        {SECTIONS.map((section, i) => (
          <div key={i} style={{
            background: "#0a0f1e",
            border: `1px solid ${section.accent}33`,
            borderLeft: `3px solid ${section.accent}`,
            borderRadius: 16,
            padding: "2rem",
            marginBottom: "2rem",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: section.wide && section.images.length === 1 ? "1fr 1fr" : "1fr",
              gap: "2rem",
              alignItems: "start",
            }}>
              <div>
                <div style={{
                  display: "inline-block",
                  background: `${section.accent}22`,
                  border: `1px solid ${section.accent}44`,
                  borderRadius: 6,
                  padding: "0.2rem 0.7rem",
                  fontSize: "0.65rem",
                  letterSpacing: "0.15em",
                  color: section.accent,
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}>
                  Section {i + 1}
                </div>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700, color: "#f8fafc", margin: "0 0 0.4rem", lineHeight: 1.3 }}>
                  {section.title}
                </h2>
                <p style={{ fontSize: "0.9rem", color: section.accent, margin: "0 0 1rem", fontStyle: "italic" }}>
                  {section.subtitle}
                </p>
                <p style={{ color: "#94a3b8", lineHeight: 1.8, fontSize: "0.95rem", margin: 0 }}>
                  {section.body}
                </p>
              </div>

              {section.wide && section.images.length === 1 && (
                <div>
                  <img
                    src={section.images[0]}
                    alt={section.title}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: `1px solid ${section.accent}33`,
                      display: "block",
                    }}
                  />
                </div>
              )}
            </div>

            {(!section.wide || section.images.length > 1) && (
              <div style={{
                display: "grid",
                gridTemplateColumns: section.images.length === 1 ? "1fr" : "repeat(auto-fit, minmax(400px, 1fr))",
                gap: "1.5rem",
                marginTop: "1.5rem",
              }}>
                {section.images.map((src, j) => (
                  <img
                    key={j}
                    src={src}
                    alt={`${section.title} ${j + 1}`}
                    style={{
                      width: "100%",
                      borderRadius: 10,
                      border: `1px solid ${section.accent}33`,
                      display: "block",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}

        <div style={{
          background: "linear-gradient(135deg, #1a0a00, #1a001a)",
          border: "1px solid #f9731644",
          borderRadius: 16,
          padding: "2.5rem",
          textAlign: "center",
          marginTop: "1rem",
        }}>
          <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#fb923c", margin: "0 0 1rem" }}>
            The Stacked Rings Principle
          </h3>
          <p style={{ color: "#cbd5e1", fontSize: "1.1rem", lineHeight: 1.7, maxWidth: 700, margin: "0 auto 1.5rem" }}>
            Nothing is outside the rings. Nothing is inside the rings. The rings are the dance of the One. 500+ layers. 500 possibilities. One unbreakable whole.
          </p>
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {["Warp Bubble", "SMTQ Coherence", "Pixelated Reality", "500 Dimensions", "Octonion 8D", "Dynamic Equilibrium"].map(tag => (
              <span key={tag} style={{
                background: "#f9731622",
                border: "1px solid #f9731644",
                borderRadius: 20,
                padding: "0.3rem 0.9rem",
                fontSize: "0.8rem",
                color: "#fb923c",
              }}>{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

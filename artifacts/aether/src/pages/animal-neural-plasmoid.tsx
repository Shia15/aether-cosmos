import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ─────────────────────────────────────────── */
const BG      = "#02020b";
const PANEL   = "rgba(5,5,14,0.92)";
const BORDER  = "#1a1a3a";
const BORDER2 = "#0f0f28";
const GOLD    = "#c8a84c";
const GOLD2   = "#f0d46a";
const CYAN    = "#2ef0d8";
const VIOLET  = "#7744ee";
const EMBER   = "#ff5522";
const ROSE    = "#ff2266";
const DIM     = "#3a3a5a";
const VDIM    = "#12122a";
const TEXT    = "#b8b8d0";

/* ── Animal Profile type ─────────────────────────────── */
interface AnimalProfile {
  name: string; scientificName: string; class: string;
  locomotion: "swimming"|"walking"|"flying"|"crawling"|"undulating"|"gliding";
  neuralComplexity: number; nodeCount: number;
  primaryMedium: "solid"|"granular"|"fluid"|"diffusion"|"light";
  dominantFreqHz: number; gammaHz: number; thetaHz: number; alphaHz: number;
  bodyColor: [number,number,number];
  accentColor: [number,number,number];
  haloColor: [number,number,number];
  wavePattern: "sinusoidal"|"burst"|"ripple"|"pulse"|"spiral";
  movementStyle: "undulating"|"rhythmic"|"erratic"|"smooth"|"flocking";
  synapticDensity: number; motorNodeRatio: number;
  sensoryNodeRatio: number; inertia: number;
  description: string; plasmoidNote: string;
  pipelineSteps: string[];
  ltp: number; ltd: number; movementNote: string;
}

/* ── Built-in animal DB ──────────────────────────────── */
const ANIMAL_DB: Record<string, AnimalProfile> = {
  octopus: {
    name:"Octopus",scientificName:"Octopus vulgaris",class:"Cephalopoda",
    locomotion:"swimming",neuralComplexity:9,nodeCount:32,primaryMedium:"fluid",
    dominantFreqHz:38,gammaHz:42,thetaHz:6,alphaHz:10,
    bodyColor:[40,120,180],accentColor:[80,200,160],haloColor:[20,80,140],
    wavePattern:"burst",movementStyle:"erratic",synapticDensity:0.85,
    motorNodeRatio:0.45,sensoryNodeRatio:0.3,inertia:0.4,
    description:"Nine brains: one central, one per arm. Each arm processes signals semi-autonomously.",
    plasmoidNote:"Dense synaptic burst topology — chaotic surface, deeply ordered beneath.",
    pipelineSteps:["Retinal photoreceptors","Optic lobes","Central brain","Arm ganglia","Chromatophore motors","Mantle jet propulsion"],
    ltp:0.82,ltd:0.45,movementNote:"Jet-propelled undulation + 8-arm manipulation"
  },
  jellyfish: {
    name:"Jellyfish",scientificName:"Aurelia aurita",class:"Scyphozoa",
    locomotion:"undulating",neuralComplexity:1,nodeCount:14,primaryMedium:"diffusion",
    dominantFreqHz:1.2,gammaHz:2,thetaHz:0.8,alphaHz:1,
    bodyColor:[180,220,240],accentColor:[200,240,255],haloColor:[100,180,220],
    wavePattern:"ripple",movementStyle:"smooth",synapticDensity:0.2,
    motorNodeRatio:0.5,sensoryNodeRatio:0.4,inertia:0.9,
    description:"No brain — a nerve net. Radially symmetric, decentralized signal propagation.",
    plasmoidNote:"Pure diffusion medium. Ripple waves emanating from central ring canal.",
    pipelineSteps:["Rhopalia (sensory)","Nerve ring (circular)","Subumbrella nerve net","Coronal muscle fibers","Bell margin","Pulsed propulsion"],
    ltp:0.1,ltd:0.05,movementNote:"Rhythmic bell pulsation — purely hydraulic"
  },
  wolf: {
    name:"Wolf",scientificName:"Canis lupus",class:"Mammalia",
    locomotion:"walking",neuralComplexity:8,nodeCount:28,primaryMedium:"granular",
    dominantFreqHz:25,gammaHz:40,thetaHz:7,alphaHz:10,
    bodyColor:[160,130,90],accentColor:[220,180,100],haloColor:[120,100,70],
    wavePattern:"sinusoidal",movementStyle:"rhythmic",synapticDensity:0.7,
    motorNodeRatio:0.4,sensoryNodeRatio:0.25,inertia:0.6,
    description:"Pack-hunting predator with highly developed prefrontal cortex for social coordination.",
    plasmoidNote:"Rhythmic theta-gamma coupling — memory-driven motor patterns for coordinated pursuit.",
    pipelineSteps:["Olfactory bulb","Limbic system","Motor cortex (Layer V)","Corticospinal tract","Spinal interneurons","Limb phalanges (4-limb)"],
    ltp:0.7,ltd:0.55,movementNote:"Quadrupedal gait — diagonal limb coordination"
  },
  hummingbird: {
    name:"Hummingbird",scientificName:"Archilochus colubris",class:"Aves",
    locomotion:"flying",neuralComplexity:7,nodeCount:24,primaryMedium:"light",
    dominantFreqHz:55,gammaHz:70,thetaHz:8,alphaHz:12,
    bodyColor:[80,200,120],accentColor:[240,200,60],haloColor:[60,180,100],
    wavePattern:"pulse",movementStyle:"erratic",synapticDensity:0.65,
    motorNodeRatio:0.35,sensoryNodeRatio:0.3,inertia:0.15,
    description:"Highest metabolic rate of any bird. Wing beats 50–80/sec require extreme gamma synchrony.",
    plasmoidNote:"Light-medium emission nodes — high-freq pulse pattern drives rapid motor cycling.",
    pipelineSteps:["Visual cortex (UV)","Cerebellum","Premotor cortex","Thoracic motor neurons","Flight muscle","Wing phalanges"],
    ltp:0.6,ltd:0.7,movementNote:"Figure-8 wing stroke — hover + reverse flight"
  },
  "manta ray": {
    name:"Manta Ray",scientificName:"Mobula birostris",class:"Chondrichthyes",
    locomotion:"gliding",neuralComplexity:7,nodeCount:22,primaryMedium:"fluid",
    dominantFreqHz:14,gammaHz:20,thetaHz:5,alphaHz:9,
    bodyColor:[40,60,120],accentColor:[80,120,200],haloColor:[20,40,100],
    wavePattern:"sinusoidal",movementStyle:"smooth",synapticDensity:0.55,
    motorNodeRatio:0.3,sensoryNodeRatio:0.35,inertia:0.8,
    description:"Largest brain-to-body ratio of any fish. Self-aware — passes mirror test.",
    plasmoidNote:"Fluid sinusoidal waves — wide pectoral fin nodes as distributed lift surfaces.",
    pipelineSteps:["Ampullae of Lorenzini","Lateral line","Telencephalon","Spinal cord","Pectoral fin rays","Undulatory propulsion"],
    ltp:0.65,ltd:0.4,movementNote:"Pectoral fin undulation — efficient glide + bank"
  },
  eagle: {
    name:"Eagle",scientificName:"Aquila chrysaetos",class:"Aves",
    locomotion:"flying",neuralComplexity:7,nodeCount:22,primaryMedium:"light",
    dominantFreqHz:40,gammaHz:55,thetaHz:7,alphaHz:11,
    bodyColor:[180,140,60],accentColor:[240,200,80],haloColor:[140,100,40],
    wavePattern:"sinusoidal",movementStyle:"smooth",synapticDensity:0.6,
    motorNodeRatio:0.35,sensoryNodeRatio:0.4,inertia:0.5,
    description:"Visual acuity 4–8× human. Five types of photoreceptors; fovea resolves prey at 3km.",
    plasmoidNote:"Dual fovea vision nodes dominate — sensory-first architecture drives motor outputs.",
    pipelineSteps:["Dual fovea","Visual Wulst","Nidopallium","Motor nidopallium","Wing musculature","Talon phalanges"],
    ltp:0.6,ltd:0.5,movementNote:"Soaring + dive — wing fold for 300km/h stoop"
  },
  cheetah: {
    name:"Cheetah",scientificName:"Acinonyx jubatus",class:"Mammalia",
    locomotion:"walking",neuralComplexity:7,nodeCount:26,primaryMedium:"solid",
    dominantFreqHz:32,gammaHz:45,thetaHz:6,alphaHz:10,
    bodyColor:[220,180,80],accentColor:[240,200,100],haloColor:[160,130,50],
    wavePattern:"burst",movementStyle:"rhythmic",synapticDensity:0.72,
    motorNodeRatio:0.5,sensoryNodeRatio:0.25,inertia:0.3,
    description:"Fastest land animal. Spine acts as a spring — full extension/contraction doubles stride.",
    plasmoidNote:"Solid-core high-inertia nodes with gamma burst motor commands — max-speed locomotion.",
    pipelineSteps:["Visual cortex","Motor cortex","Reticulospinal tract","Spinal pattern gen.","Limb extensor/flexor","Phalange grip"],
    ltp:0.75,ltd:0.65,movementNote:"Gallop — spine spring mechanism; 120km/h peak"
  },
  "mantis shrimp": {
    name:"Mantis Shrimp",scientificName:"Odontodactylus scyllarus",class:"Malacostraca",
    locomotion:"swimming",neuralComplexity:8,nodeCount:30,primaryMedium:"light",
    dominantFreqHz:50,gammaHz:65,thetaHz:9,alphaHz:13,
    bodyColor:[200,80,120],accentColor:[100,200,240],haloColor:[160,60,180],
    wavePattern:"pulse",movementStyle:"erratic",synapticDensity:0.78,
    motorNodeRatio:0.42,sensoryNodeRatio:0.38,inertia:0.25,
    description:"16 types of photoreceptors. Strike speed 23m/s — 10,400g acceleration. Fastest predatory strike known.",
    plasmoidNote:"Light-spectrum maximum nodes — 16-channel color processing drives pulse-burst motor output.",
    pipelineSteps:["Hexnocular vision (16ch)","Medulla terminalis","Supraesophageal ganglion","Ventral nerve cord","Raptorial appendage","Strike club — cavitation"],
    ltp:0.8,ltd:0.6,movementNote:"Raptorial strike — cavitation bubble shockwave"
  },
  crow: {
    name:"Crow",scientificName:"Corvus corax",class:"Aves",
    locomotion:"flying",neuralComplexity:9,nodeCount:26,primaryMedium:"light",
    dominantFreqHz:35,gammaHz:50,thetaHz:8,alphaHz:11,
    bodyColor:[55,55,62],accentColor:[140,140,200],haloColor:[80,80,120],
    wavePattern:"burst",movementStyle:"erratic",synapticDensity:0.82,
    motorNodeRatio:0.32,sensoryNodeRatio:0.38,inertia:0.3,
    description:"Nidopallium Caudolaterale (NCL) is functionally equivalent to mammalian prefrontal cortex. Tool use, episodic memory, theory of mind, causal reasoning.",
    plasmoidNote:"Bilateral gamma-burst synchrony between NCL and hippocampus -- episodic memory as phase-locked burst topology.",
    pipelineSteps:["Tetrachromatic visual cortex","Nidopallium Caudolaterale (NCL)","Hippocampus (episodic)","Arcopallium","Wing + foot motor neurons","Precision talon grasp"],
    ltp:0.85,ltd:0.60,movementNote:"Flap-glide alternation + precision foot manipulation"
  },
  dolphin: {
    name:"Dolphin",scientificName:"Tursiops truncatus",class:"Mammalia",
    locomotion:"swimming",neuralComplexity:10,nodeCount:32,primaryMedium:"fluid",
    dominantFreqHz:40,gammaHz:55,thetaHz:7,alphaHz:12,
    bodyColor:[100,165,210],accentColor:[160,225,245],haloColor:[55,120,185],
    wavePattern:"burst",movementStyle:"smooth",synapticDensity:0.88,
    motorNodeRatio:0.35,sensoryNodeRatio:0.40,inertia:0.5,
    description:"Brain 3.7kg -- second highest EQ after humans. Spindle neurons (VEN cells) in insular cortex. Echolocation resolves objects at 150kHz with sub-cm resolution.",
    plasmoidNote:"Acoustic hologram front-loaded -- massive bilateral auditory nodes drive a 3D sonar reconstruction of the environment in real time.",
    pipelineSteps:["Melon acoustic lens (150kHz)","Cochlear nuclei","Auditory cortex","Insular cortex (VEN)","Prefrontal cortex","Fluke caudal oscillation"],
    ltp:0.90,ltd:0.55,movementNote:"Vertical tail-fluke oscillation -- burst swim + surface porpoising"
  },
  "slime mold": {
    name:"Slime Mold",scientificName:"Physarum polycephalum",class:"Mycetozoa",
    locomotion:"crawling",neuralComplexity:2,nodeCount:20,primaryMedium:"diffusion",
    dominantFreqHz:0.05,gammaHz:0.1,thetaHz:0.03,alphaHz:0.05,
    bodyColor:[240,200,55],accentColor:[255,225,80],haloColor:[200,160,25],
    wavePattern:"ripple",movementStyle:"smooth",synapticDensity:0.40,
    motorNodeRatio:0.0,sensoryNodeRatio:0.65,inertia:0.95,
    description:"Zero neurons. One cell, millions of nuclei. Solves shortest-path + minimum-spanning-tree via Hagen-Poiseuille cytoplasm flow. r^4 radius rule. Oscillates every 20s.",
    plasmoidNote:"Flow-network optimizer: tube radius adapts to Q (flow rate). No discrete signal -- pure continuous field. The plasmoid IS the algorithm.",
    pipelineSteps:["Chemical gradient (cAMP)","Cytoplasm oscillation (20s)","Tube thickness adaptation","Hagen-Poiseuille Q=pi*r^4*dP/8nL","Pseudopod extension","Food source engulfment"],
    ltp:0.3,ltd:0.75,movementNote:"Pseudopod extension toward attractants -- retract from repellents"
  },
  "aether substrate": {
    name:"AETHER Substrate",scientificName:"C(x,t) = 1 - ||e|| / ||S*||",class:"Plasmoid Field",
    locomotion:"gliding",neuralComplexity:10,nodeCount:40,primaryMedium:"light",
    dominantFreqHz:1000,gammaHz:1000,thetaHz:100,alphaHz:500,
    bodyColor:[0,255,178],accentColor:[0,240,224],haloColor:[0,180,160],
    wavePattern:"spiral",movementStyle:"smooth",synapticDensity:1.0,
    motorNodeRatio:0.5,sensoryNodeRatio:0.5,inertia:0.0,
    description:"The AETHER coherence field. C(x,t) -> 1 when perturbation epsilon -> 0 relative to substrate S*(x,t). SU(3) singlet -- the repair state. Zero inertia, instant phase lock.",
    plasmoidNote:"Maximal coherence: all nodes phase-locked in spiral topology. The substrate underlying all biological neural computation -- and its convergence target.",
    pipelineSteps:["Perturbation field e(x,t)","S*(x,t) substrate tensor","C(x,t) coherence operator","Knowledge graph edge","Synthesis output node","SU(3) singlet state"],
    ltp:1.0,ltd:0.0,movementNote:"Coherence field propagation -- zero inertia, instant phase lock"
  },
};

const CHIPS = ["octopus","crow","dolphin","slime mold","wolf","mantis shrimp","jellyfish","aether substrate"];

const DEFAULT_PIPELINE = ["Sensory input","Signal integration","Motor cortex","Spinal cord","Motor neurons","Limb/body output"];

/* ── Simulation node/synapse types ─────────────────── */
interface Bubble {
  x:number; y:number; r:number;
  phase:number; freq:number; signal:number; weight:number;
  vx:number; vy:number;
  isMotor:boolean; isSensory:boolean; isInter:boolean;
  color:[number,number,number]; haloColor:[number,number,number];
  wavePattern:string; movementStyle:string;
}
interface Synapse { a:number; b:number; weight:number; flash:number }
interface Pulse { a:number; b:number; t:number }
interface MotorPath { bx:number; by:number; ex:number; ey:number; phase:number; active:number }

/* ── Tour ──────────────────────────────────────────── */
interface TourStep { title:string; body:string; placement:"center"|"bottom"|"top"|"left"|"right" }
const TOUR_STEPS: TourStep[] = [
  { title:"AETHER Plasmoid Simulator", placement:"center",
    body:"Welcome to the live neural simulation environment. This interface maps any animal's <em>biological neural architecture</em> directly into a plasmoid bubble network — a core AETHER framework visualization. Each simulation is generated by Claude in real time from actual neuroscience data. Use <strong>← → arrow keys</strong> or the buttons to navigate." },
  { title:"The Search Bar", placement:"center",
    body:"Type any animal name here. Claude queries its <em>biological neuroscience database</em> — neural complexity, locomotion type, brainwave frequencies, synaptic density — and builds the entire simulation from that profile. Try <strong>octopus</strong>, <strong>jellyfish</strong>, or <strong>mantis shrimp</strong> for dramatically different results." },
  { title:"The Plasmoid Network", placement:"center",
    body:"Each <em>glowing bubble</em> is a plasmoid node. <strong>Gold nodes</strong> are motor output. <strong>Cyan nodes</strong> are sensory input. <strong>Violet nodes</strong> are interneurons. The <em>curved filaments</em> between them are synaptic connections — their thickness maps to synaptic weight. Watch them pulse as signals propagate." },
  { title:"Signal Propagation", placement:"center",
    body:"The bright <em>traveling dots</em> along filaments are action potentials — neural signals in motion. Firing rate scales with neural complexity: a jellyfish fires slowly (1–2 Hz), an octopus fires dense bursts (38 Hz). Each pulse triggers <strong>Hebbian LTP</strong> (filament thickens) or <strong>LTD</strong> (filament thins) — the network learns." },
  { title:"Wave Band Monitor", placement:"center",
    body:"The <strong>γ gamma band</strong> drives motor commands. <strong>θ theta</strong> encodes spatial memory. <strong>α alpha</strong> gates inhibitory pathways. Each animal has biologically calibrated values: a hummingbird's gamma is 70 Hz; a jellyfish barely reaches 2 Hz." },
  { title:"Signal Pipeline", placement:"center",
    body:"Watch the <em>stepped pipeline</em> advance in real time — the cortex-to-body signal path unique to each animal. For an octopus: retinal input → optic lobe → central brain → arm ganglia → chromatophores. Each step lights up as the signal propagates. The pipeline is <strong>scientifically accurate</strong> to each species." },
  { title:"Bottom Telemetry Strip", placement:"center",
    body:"Five live channels: <em>γ motor command frequency</em>, <em>θ memory trace</em>, <em>plasmoid coherence</em>, <em>synaptic plasticity</em> (average weight evolving over time), and <em>emergent field strength</em>. All values recalibrate immediately when you switch animals." },
  { title:"The AETHER Framework", placement:"center",
    body:"This simulation is the digital embodiment layer of AETHER. The thesis: <strong>simulate first, then grow</strong>. Identify which synaptic topologies produce emergent behavior in silico. Those topologies become blueprints for guided in vitro neurogenesis. <em>Wave patterns in digital wiring become blueprints for biological wiring.</em>" },
];

/* ── Helpers ─────────────────────────────────────────── */
function lookupDB(name: string): AnimalProfile | null {
  const lc = name.toLowerCase().trim();
  for (const key of Object.keys(ANIMAL_DB)) {
    if (lc.includes(key) || key.includes(lc)) return ANIMAL_DB[key];
  }
  return null;
}

function getWave(b: Bubble, t: number): number {
  switch (b.wavePattern) {
    case "burst":  return Math.pow(Math.max(0, Math.sin(t*b.freq*3+b.phase)), 2);
    case "ripple": return 0.5+0.5*Math.sin(t*b.freq*2+b.phase)*Math.sin(t*b.freq*0.3);
    case "pulse":  return Math.pow(0.5+0.5*Math.sin(t*b.freq*4+b.phase), 3);
    case "spiral": return 0.5+0.5*Math.sin(t*b.freq+b.phase);
    default:       return 0.5+0.5*Math.sin(t*b.freq+b.phase);
  }
}

function getLayout(loco: string, N: number, W: number, H: number): {x:number;y:number}[] {
  const pos: {x:number;y:number}[] = [];
  const cx = W/2, cy = H/2;
  if (loco==="swimming"||loco==="undulating") {
    for (let i=0;i<N;i++) {
      const prog = i/N;
      pos.push({
        x: W*0.12+prog*W*0.76+(Math.random()-0.5)*18,
        y: cy+Math.sin(prog*Math.PI*2.8)*H*0.24+(Math.random()-0.5)*18,
      });
    }
  } else if (loco==="flying"||loco==="gliding") {
    for (let i=0;i<N;i++) {
      const s = i<N/2?-1:1, j = i<N/2?i:i-Math.floor(N/2), prog = j/(N/2);
      pos.push({
        x: cx+s*(35+prog*W*0.3),
        y: cy-Math.sin(prog*Math.PI)*H*0.22+(Math.random()-0.5)*18,
      });
    }
  } else if (loco==="walking"||loco==="crawling") {
    const cols = 4, rows = Math.ceil(N/cols);
    for (let i=0;i<N;i++) {
      pos.push({
        x: W*0.18+(i%cols)*(W*0.64/(cols-1))+(Math.random()-0.5)*22,
        y: H*0.22+Math.floor(i/cols)*(H*0.56/(rows-1||1))+(Math.random()-0.5)*22,
      });
    }
  } else {
    for (let i=0;i<N;i++) {
      const a = (i/N)*Math.PI*2+Math.random()*0.6;
      const r = (0.12+Math.random()*0.22)*Math.min(W,H);
      pos.push({x: cx+Math.cos(a)*r, y: cy+Math.sin(a)*r});
    }
  }
  return pos;
}

/* ── Mini wave SVG helper ─────────────────────────────── */
function MiniWave({ hz, color, type }: { hz: number; color: string; type: string }) {
  const pts: string[] = [];
  for (let x=0; x<=32; x+=2) {
    let y: number;
    if (type==="burst") y = 8+6*Math.sin(x*0.5)*Math.pow(Math.abs(Math.sin(x*0.15)), 0.5);
    else if (type==="smooth") y = 8+5*Math.sin(x*0.35);
    else y = 8+5*Math.sin(x*0.45);
    pts.push(`${x},${y}`);
  }
  return (
    <svg viewBox="0 0 32 16" style={{ width:32, height:16, flexShrink:0 }}>
      <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={1} opacity={0.8} />
    </svg>
  );
}

/* ── Wireframe corners ──────────────────────────────── */
function WfCorners() {
  const s: React.CSSProperties = { position:"absolute", width:16, height:16, pointerEvents:"none", zIndex:2, borderColor:`rgba(200,168,76,0.35)`, borderStyle:"solid" };
  return (
    <>
      <div style={{ ...s, top:0, left:0, borderWidth:"1px 0 0 1px" }} />
      <div style={{ ...s, top:0, right:0, borderWidth:"1px 1px 0 0" }} />
      <div style={{ ...s, bottom:0, left:0, borderWidth:"0 0 1px 1px" }} />
      <div style={{ ...s, bottom:0, right:0, borderWidth:"0 1px 1px 0" }} />
    </>
  );
}

/* ── Spinning loader ────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ width:52, height:52, position:"relative" }}>
      <div style={{
        position:"absolute", inset:0,
        border:`1px solid ${BORDER}`, borderRadius:"50%",
      }} />
      <div style={{
        position:"absolute", inset:0,
        border:"1px solid transparent",
        borderTopColor: GOLD,
        borderRightColor: "rgba(200,168,76,0.3)",
        borderRadius:"50%",
        animation:"aetherSpin 1s linear infinite",
      }} />
      <div style={{
        position:"absolute", inset:10,
        border:"1px solid transparent",
        borderBottomColor: CYAN,
        borderRadius:"50%",
        animation:"aetherSpin 0.7s linear infinite reverse",
      }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════ */
function AnimalPlasmoidCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const specimens = [
      { label:"OCTOPUS\nNEURAL", col:"#e879f9", x:W*0.12, y:H*0.5 },
      { label:"SLIME\nMOLD", col:"#84cc16", x:W*0.28, y:H*0.5 },
      { label:"CROW\nGANGLIA", col:"#f59e0b", x:W*0.44, y:H*0.5 },
      { label:"DOLPHIN\nSONAR", col:"#22d3ee", x:W*0.60, y:H*0.5 },
      { label:"PLASMOID\nFIELD", col:"#a78bfa", x:W*0.76, y:H*0.5 },
      { label:"AETHER\nSUBSTRATE", col:"#2ef0d8", x:W*0.90, y:H*0.5 },
    ];
    const particles:{x:number;y:number;vx:number;vy:number;col:string;life:number}[]=[];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      if (t%3===0) {
        const s=specimens[Math.floor(Math.random()*specimens.length)];
        particles.push({x:s.x,y:s.y,vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*1.5,col:s.col,life:60});
      }
      for (let i=particles.length-1;i>=0;i--) {
        const p=particles[i];
        p.x+=p.vx; p.y+=p.vy; p.life--;
        if (p.life<=0) { particles.splice(i,1); continue; }
        const a=p.life/60;
        ctx.beginPath(); ctx.arc(p.x,p.y,2,0,Math.PI*2);
        ctx.fillStyle=p.col+Math.floor(a*180).toString(16).padStart(2,"0");
        ctx.shadowColor=p.col; ctx.shadowBlur=6*a; ctx.fill(); ctx.shadowBlur=0;
      }
      for (let i=0;i<specimens.length-1;i++) {
        const a=specimens[i],b=specimens[i+1];
        const pkt=(t*0.015+i*0.5)%1;
        const px=a.x+(b.x-a.x)*pkt;
        ctx.beginPath(); ctx.arc(px,a.y,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
        ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y);
        const g=ctx.createLinearGradient(a.x,a.y,b.x,b.y);
        g.addColorStop(0,a.col+"44"); g.addColorStop(1,b.col+"44");
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
      }
      specimens.forEach((s,i)=>{
        const pulse=1+0.1*Math.sin(t*0.04+i*1.1);
        const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,16*pulse);
        g.addColorStop(0,s.col+"bb"); g.addColorStop(0.5,s.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(s.x,s.y,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=s.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=s.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=s.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        s.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,s.x,s.y+18*pulse+li*9));
      });
      ctx.fillStyle="rgba(167,139,250,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("ANIMAL NEURAL PLASMOID · OCTOPUS · SLIME MOLD · CROW · DOLPHIN · AETHER SUBSTRATE",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AnimalNeuralPlasmoidPage() {

  /* ── UI state ── */
  const [inputVal, setInputVal]   = useState("");
  const [status, setStatus]       = useState<"idle"|"loading"|"live"|"error">("idle");
  const [statusTxt, setStatusTxt] = useState("Awaiting input");
  const [profile, setProfile]     = useState<AnimalProfile|null>(null);
  const [showPanels, setShowPanels] = useState(false);
  const [showEmpty, setShowEmpty] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [loaderStep, setLoaderStep] = useState(-1);
  const [tourIdx, setTourIdx]     = useState(-1);  // -1 = not active

  /* ── bottom strip live values ── */
  const [btmVals, setBtmVals] = useState(["—","—","—","—","—"]);
  /* ── metrics ── */
  const [metrics, setMetrics] = useState({ nodes:"—", syn:"—", iq:"—", coh:"—" });
  /* ── plasticity ── */
  const [plasticity, setPlasticity] = useState({ ltp:0, ltd:0, wt:"—", pulses:0 });
  /* ── pipeline step display ── */
  const [pipeDisp, setPipeDisp] = useState(-1);
  /* ── callout ── */
  const [callout, setCallout] = useState({ step:"—", type:"—", rate:"—", wave:"—", coh:"—" });

  /* ── sim refs (live, no rerender needed) ── */
  const cvGrid = useRef<HTMLCanvasElement>(null);
  const cvField = useRef<HTMLCanvasElement>(null);
  const cvMain  = useRef<HTMLCanvasElement>(null);
  const cvUI    = useRef<HTMLCanvasElement>(null);
  const btmCvs  = useRef<(HTMLCanvasElement|null)[]>([null,null,null,null,null]);

  const simRef = useRef({
    t: 0, bgT: 0,
    active: false,
    profile: null as AnimalProfile|null,
    bubbles: [] as Bubble[],
    synapses: [] as Synapse[],
    pulses: [] as Pulse[],
    motorPaths: [] as MotorPath[],
    pipelineStep: 0, pipelineT: 0,
    ltpAccum: 0, ltdAccum: 0,
    lastPulseT: 0,
    bwHist: [[],[],[],[],[]] as number[][],
    W: 0, H: 0, DPR: 1,
  });
  const rafRef = useRef(0);

  /* ── resize ── */
  const resizeCanvases = useCallback(() => {
    const stageEl = cvMain.current?.parentElement;
    if (!stageEl) return;
    const DPR = Math.min(2, window.devicePixelRatio||1);
    const W = stageEl.clientWidth;
    const H = stageEl.clientHeight;
    simRef.current.W = W;
    simRef.current.H = H;
    simRef.current.DPR = DPR;
    [cvGrid, cvField, cvMain, cvUI].forEach(ref => {
      const cv = ref.current;
      if (!cv) return;
      cv.width = W*DPR; cv.height = H*DPR;
      cv.getContext("2d")?.setTransform(DPR,0,0,DPR,0,0);
    });
    if (simRef.current.active) buildSim(simRef.current.profile!);
  }, []); // eslint-disable-line

  /* ── buildSim ── */
  function buildSim(p: AnimalProfile) {
    const { W, H } = simRef.current;
    const sim = simRef.current;
    sim.bubbles = []; sim.synapses = []; sim.pulses = []; sim.motorPaths = [];
    sim.bwHist = [[],[],[],[],[]];
    sim.pipelineStep = 0; sim.pipelineT = 0;
    sim.ltpAccum = 0; sim.ltdAccum = 0;

    const N = p.nodeCount;
    const motorN   = Math.round(N*p.motorNodeRatio);
    const sensoryN = Math.round(N*p.sensoryNodeRatio);
    const positions = getLayout(p.locomotion, N, W, H);

    positions.forEach((pos, i) => {
      const isMotor   = i < motorN;
      const isSensory = i >= N-sensoryN;
      let color: [number,number,number];
      if (isMotor) color = p.accentColor;
      else if (isSensory) color = p.haloColor;
      else color = p.bodyColor;

      sim.bubbles.push({
        x: pos.x, y: pos.y,
        r: 9+(1-i/N)*9+Math.random()*5,
        phase: Math.random()*Math.PI*2,
        freq: p.dominantFreqHz*(0.4+Math.random()*1.2)*0.06,
        signal: Math.random(),
        weight: 0.3+Math.random()*0.7,
        vx: (Math.random()-0.5)*p.inertia*0.2,
        vy: (Math.random()-0.5)*p.inertia*0.2,
        isMotor, isSensory, isInter: !isMotor&&!isSensory,
        color, haloColor: p.haloColor,
        wavePattern: p.wavePattern,
        movementStyle: p.movementStyle,
      });
    });

    // Synapses
    sim.bubbles.forEach((b, i) => {
      sim.bubbles.forEach((c, j) => {
        if (i>=j) return;
        const d = Math.hypot(b.x-c.x, b.y-c.y);
        const thresh = 150+p.synapticDensity*100;
        if (d<thresh && Math.random()<p.synapticDensity*0.45) {
          sim.synapses.push({ a:i, b:j, weight:0.2+Math.random()*0.8, flash:0 });
        }
      });
    });

    // Motor paths
    sim.bubbles.filter(b=>b.isMotor).forEach(b => {
      const angle = Math.random()*Math.PI*2;
      sim.motorPaths.push({
        bx:b.x, by:b.y,
        ex:b.x+Math.cos(angle)*50,
        ey:b.y+Math.sin(angle)*50,
        phase:Math.random()*Math.PI*2, active:0,
      });
    });

    setMetrics(m => ({ ...m, nodes: String(N), syn: String(sim.synapses.length), iq: p.neuralComplexity+"/10" }));
  }

  /* ── main rAF loop ── */
  useEffect(() => {
    const BW_LEN = 120;

    function drawGridCanvas() {
      const cv = cvGrid.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      const { W, H, t, profile: p } = simRef.current;
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);
      if (!p) return;

      // Radial lines (perspective)
      const cx=W/2, cy=H/2;
      ctx.save(); ctx.globalAlpha=0.06; ctx.strokeStyle=GOLD; ctx.lineWidth=0.5;
      for (let i=0;i<16;i++) {
        const a=(i/16)*Math.PI*2;
        ctx.beginPath(); ctx.moveTo(cx,cy);
        ctx.lineTo(cx+Math.cos(a)*W, cy+Math.sin(a)*H);
        ctx.stroke();
      }
      for (let r=60; r<Math.max(W,H); r+=80) {
        ctx.beginPath(); ctx.ellipse(cx,cy,r,r*0.45,0,0,Math.PI*2); ctx.stroke();
      }
      ctx.restore();

      // Flow lines
      const [hr,hg,hb] = p.haloColor;
      ctx.save(); ctx.globalAlpha=0.04;
      ctx.strokeStyle=`rgb(${hr},${hg},${hb})`; ctx.lineWidth=0.6;
      const lines = p.locomotion==="swimming"?10:4;
      for (let i=0;i<lines;i++) {
        ctx.beginPath();
        const y0 = H*(0.05+i*(0.9/lines));
        ctx.moveTo(0,y0);
        for (let x=0;x<=W;x+=4) {
          const y = y0+Math.sin(x*0.006+t*0.3+i*0.8)*24+Math.sin(x*0.015+t*0.15)*8;
          ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawField() {
      const cv = cvField.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      const { W, H, bubbles, profile: p } = simRef.current;
      ctx.clearRect(0,0,W,H);
      if (!p) return;
      bubbles.forEach(b => {
        if (b.signal<0.45) return;
        const [cr,cg,cb] = b.haloColor;
        const gf = ctx.createRadialGradient(b.x,b.y,0, b.x,b.y,70+b.signal*55);
        gf.addColorStop(0, `rgba(${cr},${cg},${cb},0.07)`);
        gf.addColorStop(1, "transparent");
        ctx.fillStyle = gf;
        ctx.beginPath(); ctx.arc(b.x,b.y,70+b.signal*55,0,Math.PI*2); ctx.fill();
      });
    }

    function drawMain() {
      const cv = cvMain.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      const { W, H, t, bubbles, synapses, pulses, motorPaths, profile: p } = simRef.current;
      ctx.clearRect(0,0,W,H);
      if (!p) return;

      // Synaptic filaments
      synapses.forEach(s => {
        const a = bubbles[s.a], b = bubbles[s.b];
        if (!a||!b) return;
        const [cr,cg,cb] = a.color;
        const alpha = 0.04+s.weight*0.16;
        ctx.beginPath();
        ctx.moveTo(a.x,a.y);
        ctx.quadraticCurveTo(
          (a.x+b.x)/2+Math.sin(t*0.5+s.a)*7,
          (a.y+b.y)/2+Math.cos(t*0.4+s.b)*7,
          b.x, b.y,
        );
        if (s.flash>0) {
          ctx.strokeStyle=`rgba(240,212,80,${s.flash})`; ctx.lineWidth=2; s.flash-=0.035;
        } else {
          ctx.strokeStyle=`rgba(${cr},${cg},${cb},${alpha})`; ctx.lineWidth=s.weight*0.8;
        }
        ctx.stroke();
      });

      // Pulses
      simRef.current.pulses = pulses.filter(p2=>p2.t<1);
      simRef.current.pulses.forEach(pu => {
        const a = bubbles[pu.a], b = bubbles[pu.b];
        if (!a||!b) return;
        const x=a.x+(b.x-a.x)*pu.t, y=a.y+(b.y-a.y)*pu.t;
        const [cr,cg,cb] = a.color;
        const pg = ctx.createRadialGradient(x,y,0, x,y,7);
        pg.addColorStop(0, `rgba(${cr},${cg},${cb},1)`);
        pg.addColorStop(1, "transparent");
        ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(x,y,7,0,Math.PI*2); ctx.fill();
        const speed = 0.018+(p.dominantFreqHz*0.0007);
        pu.t += speed;
      });

      // Motor paths
      motorPaths.forEach(mp => {
        const pulse = 0.15+mp.active*0.85;
        ctx.beginPath();
        ctx.moveTo(mp.bx,mp.by);
        ctx.quadraticCurveTo(
          mp.bx+(mp.ex-mp.bx)*0.5+Math.sin(t*2.5+mp.phase)*10,
          mp.by+(mp.ey-mp.by)*0.5+Math.cos(t*2+mp.phase)*10,
          mp.ex, mp.ey,
        );
        ctx.strokeStyle=`rgba(255,85,34,${pulse*0.65})`; ctx.lineWidth=1.5; ctx.stroke();
        ctx.beginPath(); ctx.arc(mp.ex,mp.ey,2.5+mp.active*2.5,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,85,34,${pulse})`; ctx.fill();
        if (mp.active>0) mp.active-=0.022;
      });

      // Bubbles
      bubbles.forEach(b => {
        const act = 0.3+0.7*b.signal;
        const wAct = getWave(b, t);
        const r = b.r+wAct*2.5;
        const [cr,cg,cb] = b.color;
        const [hr,hg,hb] = b.haloColor;

        // Outer halo
        const hR = r*(1.7+wAct*0.4);
        const hg2 = ctx.createRadialGradient(b.x,b.y,r*0.15, b.x,b.y,hR);
        hg2.addColorStop(0, `rgba(${hr},${hg},${hb},${act*0.38})`);
        hg2.addColorStop(0.5, `rgba(${hr},${hg},${hb},${act*0.1})`);
        hg2.addColorStop(1, "transparent");
        ctx.fillStyle=hg2; ctx.beginPath(); ctx.arc(b.x,b.y,hR,0,Math.PI*2); ctx.fill();

        // Wave ring
        const wR = r*(2.0+wAct*0.25);
        ctx.beginPath(); ctx.arc(b.x,b.y,wR,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${cr},${cg},${cb},${0.06+wAct*0.04})`; ctx.lineWidth=0.6; ctx.stroke();

        // Core gradient
        const cg3 = ctx.createRadialGradient(b.x-r*0.2,b.y-r*0.25,0, b.x,b.y,r);
        cg3.addColorStop(0, `rgba(${Math.min(255,cr+80)},${Math.min(255,cg+60)},${Math.min(255,cb+40)},${act})`);
        cg3.addColorStop(0.65, `rgba(${cr},${cg},${cb},${act*0.8})`);
        cg3.addColorStop(1, `rgba(${cr},${cg},${cb},${act*0.2})`);
        ctx.fillStyle=cg3; ctx.beginPath(); ctx.arc(b.x,b.y,r,0,Math.PI*2); ctx.fill();

        // Ring
        ctx.beginPath(); ctx.arc(b.x,b.y,r,0,Math.PI*2);
        ctx.strokeStyle=`rgba(${cr},${cg},${cb},${0.3+act*0.4})`; ctx.lineWidth=0.7; ctx.stroke();

        // Specular
        ctx.beginPath(); ctx.arc(b.x-r*0.28,b.y-r*0.28,r*0.22,0,Math.PI*2);
        ctx.fillStyle=`rgba(255,255,255,${act*0.08})`; ctx.fill();

        // Node type markers
        if (b.isMotor) {
          ctx.beginPath(); ctx.arc(b.x,b.y,r+6,0,Math.PI*2);
          ctx.strokeStyle="rgba(255,85,34,0.3)"; ctx.lineWidth=1;
          ctx.setLineDash([2,3]); ctx.stroke(); ctx.setLineDash([]);
        }
        if (b.isSensory) {
          ctx.beginPath(); ctx.arc(b.x,b.y,r+5+Math.sin(t*3+b.phase)*2,0,Math.PI*2);
          ctx.strokeStyle="rgba(46,240,216,0.25)"; ctx.lineWidth=0.8; ctx.stroke();
        }
      });
    }

    function drawUICanvas() {
      const cv = cvUI.current; if (!cv) return;
      const ctx = cv.getContext("2d"); if (!ctx) return;
      const { W, H, t: _t, bubbles, profile: p, pipelineStep } = simRef.current;
      ctx.clearRect(0,0,W,H);
      if (!p||bubbles.length===0) return;

      const steps = p.pipelineSteps||DEFAULT_PIPELINE;
      const stepIdx = pipelineStep%steps.length;
      const nodeIdx = Math.floor(stepIdx/steps.length*bubbles.length);
      const activeB = bubbles[nodeIdx%bubbles.length];
      if (!activeB) return;

      const x=activeB.x, y=activeB.y, rr=activeB.r+15;
      ctx.strokeStyle="rgba(200,168,76,0.5)"; ctx.lineWidth=0.7;
      [[x-rr,y,x-rr+8,y],[x+rr-8,y,x+rr,y],[x,y-rr,x,y-rr+8],[x,y+rr-8,x,y+rr]].forEach(([x1,y1,x2,y2]) => {
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });

      const label = steps[stepIdx].toUpperCase();
      ctx.font="300 10px 'DM Mono',monospace";
      ctx.fillStyle="rgba(200,168,76,0.7)";
      ctx.textAlign="left"; ctx.textBaseline="middle";
      const lx=x+rr+8;
      ctx.fillText(label, lx, y);
      ctx.beginPath(); ctx.moveTo(x+rr,y); ctx.lineTo(lx-2,y);
      ctx.strokeStyle="rgba(200,168,76,0.25)"; ctx.lineWidth=0.5; ctx.stroke();
    }

    function updateBottom() {
      const sim = simRef.current;
      if (!sim.profile) return;
      const p = sim.profile;
      const t = sim.t;
      const gamma = 0.5+0.5*Math.sin(t*p.gammaHz*0.08)*(0.7+0.3*Math.pow(Math.abs(Math.sin(t*2.1)),2));
      const theta = 0.5+0.5*Math.sin(t*p.thetaHz*0.08);
      const avgSig = sim.bubbles.reduce((s,b)=>s+b.signal,0)/(sim.bubbles.length||1);
      const avgWt  = sim.synapses.reduce((s,sy)=>s+sy.weight,0)/(sim.synapses.length||1);
      const field  = Math.min(1, sim.pulses.length/8);
      const vals   = [gamma, theta, avgSig, avgWt||0, field];
      const colors = [GOLD, CYAN, VIOLET, GOLD, ROSE];
      const fmts: ((v:number)=>string)[] = [
        v=>(v*p.gammaHz).toFixed(0),
        v=>(v*p.thetaHz).toFixed(1),
        v=>(v*100).toFixed(0),
        v=>v.toFixed(2),
        v=>(v*100).toFixed(0),
      ];

      setMetrics(m => ({ ...m, coh: (avgSig*100).toFixed(0)+"%" }));
      setPlasticity({ ltp: sim.ltpAccum, ltd: sim.ltdAccum, wt: (avgWt||0).toFixed(2), pulses: sim.pulses.length });
      setBtmVals(fmts.map((f,i)=>f(vals[i])));

      vals.forEach((v,i) => {
        sim.bwHist[i].push(v);
        if (sim.bwHist[i].length>BW_LEN) sim.bwHist[i].shift();
        const cv = btmCvs.current[i];
        if (!cv) return;
        const ctx2 = cv.getContext("2d"); if (!ctx2) return;
        const W2=cv.offsetWidth||120, H2=cv.offsetHeight||34;
        const DPR2 = sim.DPR;
        cv.width=W2*DPR2; cv.height=H2*DPR2;
        ctx2.setTransform(DPR2,0,0,DPR2,0,0);
        ctx2.clearRect(0,0,W2,H2);
        ctx2.beginPath();
        sim.bwHist[i].forEach((val2,x) => {
          const px=(x/BW_LEN)*W2, py=H2-val2*H2*0.8-H2*0.08;
          x===0?ctx2.moveTo(px,py):ctx2.lineTo(px,py);
        });
        ctx2.strokeStyle=colors[i]; ctx2.lineWidth=1.2; ctx2.stroke();
        ctx2.lineTo(W2,H2); ctx2.lineTo(0,H2); ctx2.closePath();
        ctx2.fillStyle=colors[i]+"15"; ctx2.fill();
      });
    }

    function updateSim() {
      const sim = simRef.current;
      if (!sim.profile) return;
      const p = sim.profile;
      const t = sim.t;
      const { W, H } = sim;

      sim.bubbles.forEach((b, i) => {
        let dx=0, dy=0;
        switch (b.movementStyle) {
          case "undulating": dx=Math.cos(t*b.freq*0.5+b.phase)*0.4; dy=Math.sin(t*b.freq*0.3+i*0.2)*0.3; break;
          case "erratic":    dx=(Math.random()-0.5)*0.7; dy=(Math.random()-0.5)*0.7; break;
          case "smooth":     dx=Math.cos(t*0.18+b.phase)*0.15; dy=Math.sin(t*0.14+b.phase)*0.15; break;
          case "rhythmic":   dx=Math.sin(t*b.freq*0.4+i*0.3)*0.3; dy=Math.cos(t*b.freq*0.3)*0.22; break;
          case "flocking": {
            let ax=0,ay=0,n=0;
            sim.bubbles.forEach(c=>{if(c===b)return;const d=Math.hypot(b.x-c.x,b.y-c.y);if(d<110){ax+=c.x-b.x;ay+=c.y-b.y;n++;}});
            if(n>0){dx=(ax/n)*0.002;dy=(ay/n)*0.002;}
            break;
          }
        }
        b.vx=b.vx*0.96+dx*0.06; b.vy=b.vy*0.96+dy*0.06;
        b.x+=b.vx; b.y+=b.vy;
        const pad=50;
        if(b.x<pad)b.vx+=0.04; if(b.x>W-pad)b.vx-=0.04;
        if(b.y<pad)b.vy+=0.04; if(b.y>H-pad)b.vy-=0.04;
        b.signal=0.2+0.8*(0.5+0.5*Math.sin(t*b.freq*1.3+b.phase));
      });

      sim.motorPaths.forEach((mp,mi) => {
        const mb = sim.bubbles.filter(b=>b.isMotor)[mi];
        if(mb){mp.bx+=(mb.x-mp.bx)*0.05; mp.by+=(mb.y-mp.by)*0.05;}
        if(Math.random()<0.014) mp.active=1;
      });

      const pRate = Math.max(0.15, 0.5-p.neuralComplexity*0.04);
      if(t-sim.lastPulseT>pRate && sim.synapses.length>0) {
        const s = sim.synapses[Math.floor(Math.random()*sim.synapses.length)];
        sim.pulses.push({a:s.a,b:s.b,t:0});
        s.flash=0.8;
        if(Math.random()<p.ltp){s.weight=Math.min(1,s.weight+0.04);sim.ltpAccum++;}
        else if(Math.random()<p.ltd){s.weight=Math.max(0.05,s.weight-0.02);sim.ltdAccum++;}
        sim.lastPulseT=t;
      }

      sim.pipelineT+=0.012;
      if(sim.pipelineT>0.9) {
        sim.pipelineT=0; sim.pipelineStep++;
        const steps = p.pipelineSteps||DEFAULT_PIPELINE;
        const cur = sim.pipelineStep%steps.length;
        setPipeDisp(cur);
        setCallout({
          step: steps[cur].substring(0,18).toUpperCase(),
          type: p.wavePattern.toUpperCase(),
          rate: (p.dominantFreqHz+Math.round(Math.sin(t*0.5)*4)).toFixed(0)+" Hz",
          wave: p.movementStyle.toUpperCase(),
          coh: (75+Math.round(Math.sin(t*0.3)*15))+"%",
        });
      }
    }

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      const sim = simRef.current;
      sim.t += 0.011;
      if (sim.active) updateSim();
      if (sim.bgT++%5===0) drawGridCanvas();
      drawField(); drawMain(); drawUICanvas();
      updateBottom();
    }

    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, []); // eslint-disable-line

  /* ── resize effect ── */
  useEffect(() => {
    resizeCanvases();
    window.addEventListener("resize", resizeCanvases);
    return () => window.removeEventListener("resize", resizeCanvases);
  }, [resizeCanvases]);

  /* ── keyboard tour nav ── */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (tourIdx<0) return;
      if (e.key==="ArrowRight"||e.key==="Enter") setTourIdx(i=>i>=TOUR_STEPS.length-1?-1:i+1);
      if (e.key==="ArrowLeft") setTourIdx(i=>i<=0?0:i-1);
      if (e.key==="Escape") setTourIdx(-1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [tourIdx]);

  /* ── loadAnimal ── */
  async function loadAnimal(name: string) {
    setShowLoader(true); setShowEmpty(false);
    setStatus("loading"); setStatusTxt("Loading…");
    setLoaderStep(0);

    // Step through loader visually
    for (let i=0;i<5;i++) {
      setLoaderStep(i);
      await new Promise(r=>setTimeout(r, 320));
    }

    try {
      let p = lookupDB(name);
      if (!p) {
        const res = await fetch("/api/animal-profile", {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ name }),
        });
        if (!res.ok) throw new Error("API error");
        p = await res.json() as AnimalProfile;
      }
      simRef.current.profile = p;
      simRef.current.active = true;
      buildSim(p);
      setProfile(p);
      setShowPanels(true);
      setStatus("live"); setStatusTxt("Live simulation");
      setCallout({ step:"—", type: p.wavePattern.toUpperCase(), rate:"—", wave: p.movementStyle.toUpperCase(), coh:"—" });
    } catch (e) {
      console.error(e);
      setStatus("error"); setStatusTxt("Error — retry");
      setShowEmpty(true);
    }

    setShowLoader(false);
  }

  function handleSearch() {
    if (!inputVal.trim()) return;
    loadAnimal(inputVal.trim());
  }

  /* ── Styles ── */
  const label9: React.CSSProperties = { fontSize:9, letterSpacing:"0.15em", textTransform:"uppercase", color:DIM };
  const panelTitle: React.CSSProperties = { ...label9, display:"block", marginBottom:6 };
  const pbRow: React.CSSProperties = { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 };

  const pipeSteps = profile?.pipelineSteps || DEFAULT_PIPELINE;
  const btmLabels  = ["γ Motor Command","θ Memory Trace","Plasmoid Coherence","Synaptic Plasticity","Emergent Field"];
  const btmUnits   = ["Hz","Hz","%","avg wt","%"];
  const tourStep   = tourIdx>=0 ? TOUR_STEPS[tourIdx] : null;

  return (
    <div style={{ background:BG, height:"100%", minHeight:"100%", display:"flex", flexDirection:"column", color:TEXT, fontFamily:"'DM Mono',monospace", overflow:"auto" }}>

      <div style={{ padding:"10px 16px 0", flexShrink:0 }}>
        <div style={{ display:"inline-block", background:"rgba(167,139,250,0.08)", border:"1px solid rgba(167,139,250,0.25)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#a78bfa", textTransform:"uppercase", fontFamily:"'DM Mono',monospace", marginBottom:10 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(2,4,8,0.88)", border:"1px solid rgba(167,139,250,0.12)",
          borderLeft:"3px solid #a78bfa", borderRadius:10, padding:18, marginBottom:10 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:17, color:"#e8e0ff", margin:"0 0 5px" }}>
            Animal Neural Plasmoid · Octopus · Slime Mold · Crow · Dolphin · AETHER Substrate
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:11, color:"rgba(200,195,240,0.4)", margin:"0 0 12px", lineHeight:1.65 }}>
            Six animal neural specimens chained in a plasmoid resonance bus with particle emission fields
            and photon coupling streams — the living AETHER substrate coupling Octopus/rose · Slime Mold/lime
            · Crow/amber · Dolphin/cyan · Plasmoid Field/violet to the AETHER/teal substrate.
          </p>
          <AnimalPlasmoidCanvas />
        </div>
      </div>

      {/* ── keyframe inject ── */}
      <style>{`@keyframes aetherSpin{to{transform:rotate(360deg)}}`}</style>

      {/* ══ HEADER ══ */}
      <div style={{
        height:52, flexShrink:0,
        display:"flex", alignItems:"center", gap:"1.2rem",
        padding:"0 1.5rem",
        borderBottom:`1px solid ${BORDER}`,
        background:"rgba(5,5,14,0.95)",
        position:"relative", zIndex:30,
      }}>
        {/* gradient rule on bottom */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${GOLD},${CYAN},${GOLD},transparent)`, opacity:0.4 }} />

        <div style={{ flexShrink:0 }}>
          <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.3rem", letterSpacing:"0.2em", color:GOLD2 }}>AETHER · PLASMOID</div>
          <div style={{ fontSize:"0.38rem", letterSpacing:"0.25em", color:DIM, textTransform:"uppercase" }}>Animal Neural Simulator · v2.0</div>
        </div>

        <div style={{ width:1, height:28, background:BORDER, flexShrink:0 }} />

        {/* Search */}
        <div style={{ flex:1, maxWidth:420, position:"relative" }}>
          <div style={{
            display:"flex", alignItems:"center",
            border:`1px solid ${BORDER}`,
            background:"rgba(8,8,26,0.9)",
            position:"relative",
          }}>
            {/* corner accents */}
            {[{top:"-1px",left:"-1px",borderWidth:"1px 0 0 1px"},{bottom:"-1px",right:"-1px",borderWidth:"0 1px 1px 0"}].map((s,i)=>(
              <div key={i} style={{ position:"absolute", width:8, height:8, borderColor:GOLD, borderStyle:"solid", opacity:0.6, ...s }} />
            ))}
            <input
              value={inputVal}
              onChange={e=>setInputVal(e.target.value)}
              onKeyDown={e=>{ if(e.key==="Enter") handleSearch(); }}
              placeholder="Enter any animal — octopus, wolf, manta ray, hummingbird…"
              style={{
                flex:1, background:"transparent", border:"none", outline:"none",
                fontFamily:"'DM Mono',monospace", fontSize:"0.62rem", letterSpacing:"0.1em",
                color:TEXT, padding:"0.55rem 0.9rem",
              }}
            />
            <button
              onClick={handleSearch}
              disabled={status==="loading"}
              style={{
                background:"transparent", border:"none", borderLeft:`1px solid ${BORDER}`,
                color:GOLD, fontFamily:"'Bebas Neue',sans-serif",
                fontSize:"0.8rem", letterSpacing:"0.15em",
                padding:"0 1rem", height:"100%", cursor:"pointer",
                opacity: status==="loading" ? 0.3 : 1, whiteSpace:"nowrap",
              }}
            >⬡ Simulate</button>
          </div>
        </div>

        {/* Status */}
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", whiteSpace:"nowrap" }}>
          <div style={{
            width:5, height:5, borderRadius:"50%",
            background: status==="idle"?DIM : status==="loading"?GOLD : status==="live"?CYAN : ROSE,
            boxShadow: status==="live" ? `0 0 6px ${CYAN}` : "none",
            animation: status==="loading" ? "aetherSpin 0.5s step-start infinite" : "none",
          }} />
          <span style={{ fontSize:"0.46rem", letterSpacing:"0.12em", textTransform:"uppercase", color:DIM }}>{statusTxt}</span>
        </div>

        {/* Metrics */}
        <div style={{ marginLeft:"auto", display:"flex", gap:"1.2rem", alignItems:"center" }}>
          {[["Nodes",metrics.nodes],["Synapses",metrics.syn],["Neural IQ",metrics.iq],["Coherence",metrics.coh]].map(([k,v])=>(
            <div key={k} style={{ textAlign:"center" }}>
              <span style={{ display:"block", fontSize:"0.38rem", letterSpacing:"0.15em", textTransform:"uppercase", color:DIM }}>{k}</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", color:GOLD2, letterSpacing:"0.05em" }}>{v}</span>
            </div>
          ))}
        </div>

        <button
          onClick={()=>setTourIdx(0)}
          style={{
            background:"rgba(46,240,216,0.06)", border:`1px solid rgba(46,240,216,0.2)`,
            color:CYAN, fontFamily:"'DM Mono',monospace",
            fontSize:"0.46rem", letterSpacing:"0.15em", textTransform:"uppercase",
            padding:"4px 10px", cursor:"pointer", whiteSpace:"nowrap",
          }}
        >▶ Take Tour</button>
      </div>

      {/* ══ STAGE ══ */}
      <div style={{ flex:1, position:"relative", overflow:"hidden", minHeight:0 }}>
        <WfCorners />
        <canvas ref={cvGrid} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
        <canvas ref={cvField} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
        <canvas ref={cvMain} style={{ position:"absolute", inset:0, width:"100%", height:"100%" }} />
        <canvas ref={cvUI}  style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />

        {/* ── LEFT PANEL ── */}
        <div style={{
          position:"absolute", top:"1rem", left:"1rem", zIndex:10, width:210,
          opacity: showPanels?1:0, transform: showPanels?"translateX(0)":"translateX(-10px)",
          transition:"all 0.5s",
        }}>
          {/* Animal info */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, padding:"0.8rem 0.9rem", marginBottom:"0.5rem", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,${GOLD},transparent)`, opacity:0.3 }} />
            <span style={panelTitle}>Active organism</span>
            <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:"1.5rem", fontWeight:200, color:GOLD2, letterSpacing:"0.05em", lineHeight:1 }}>{profile?.name||"—"}</div>
            <div style={{ fontSize:"0.42rem", color:DIM, letterSpacing:"0.08em", fontStyle:"italic", marginTop:2, marginBottom:"0.7rem" }}>{profile?.scientificName||"—"}</div>
            {[["Class",profile?.class],["Locomotion",profile?.locomotion,CYAN],["Neural IQ",(profile?.neuralComplexity??0)+"/10",GOLD],["Medium",profile?.primaryMedium],["Dom. Freq",(profile?.dominantFreqHz??0)+" Hz",EMBER]].map(([k,v,c])=>(
              <div key={k as string} style={pbRow}>
                <span style={label9}>{k as string}</span>
                <span style={{ fontSize:"0.52rem", color:(c as string)||TEXT }}>{(v as string)||"—"}</span>
              </div>
            ))}
            <div style={{ height:1, background:BORDER, margin:"0.5rem 0" }} />
            <div style={{ fontFamily:"'Crimson Pro',serif", fontSize:"0.6rem", color:DIM, lineHeight:1.7, fontStyle:"italic" }}>
              {profile ? `${profile.description} ${profile.plasmoidNote}` : "—"}
            </div>
          </div>

          {/* Pipeline */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, padding:"0.8rem 0.9rem", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,${GOLD},transparent)`, opacity:0.3 }} />
            <span style={panelTitle}>Signal pipeline</span>
            {pipeSteps.map((step, i) => {
              const isDone = i < pipeDisp;
              const isActive = i === pipeDisp;
              return (
                <div key={i} style={{
                  display:"flex", alignItems:"flex-start", gap:"0.5rem",
                  padding:"4px 0 4px 0.6rem",
                  borderLeft:`2px solid ${isActive?GOLD:isDone?CYAN:BORDER}`,
                  marginLeft:"0.3rem",
                }}>
                  <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.75rem", lineHeight:1.2, color:isActive?GOLD2:isDone?CYAN:DIM }}>
                    {String(i+1).padStart(2,"0")}
                  </span>
                  <div>
                    <div style={{ fontSize:"0.46rem", letterSpacing:"0.08em", textTransform:"uppercase", color:isActive?TEXT:isDone?CYAN:DIM }}>{step}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          position:"absolute", top:"1rem", right:"1rem", zIndex:10, width:185,
          opacity: showPanels?1:0, transform: showPanels?"translateX(0)":"translateX(10px)",
          transition:"all 0.5s",
        }}>
          {/* Wave bands */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, padding:"0.8rem 0.9rem", marginBottom:"0.5rem", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,${GOLD},transparent)`, opacity:0.3 }} />
            <span style={panelTitle}>Wave bands</span>
            {[
              { name:"γ Gamma", color:GOLD,   c2:GOLD2,   hz: profile?.gammaHz, type:"burst"  },
              { name:"θ Theta", color:CYAN,   c2:CYAN,    hz: profile?.thetaHz, type:"smooth" },
              { name:"α Alpha", color:VIOLET, c2:VIOLET,  hz: profile?.alphaHz, type:"sine"   },
            ].map(wv=>(
              <div key={wv.name} style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:5 }}>
                <MiniWave hz={wv.hz||0} color={wv.color} type={wv.type} />
                <div>
                  <div style={{ fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", color:wv.color }}>{wv.name}</div>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.8rem", letterSpacing:"0.05em", color:wv.c2 }}>{wv.hz?wv.hz+" Hz":"—"}</div>
                  <div style={{ fontSize:"0.38rem", color:DIM }}>{wv.name.startsWith("γ")?"Motor command":wv.name.startsWith("θ")?"Memory / learning":"Inhibitory gate"}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Node types */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, padding:"0.8rem 0.9rem", marginBottom:"0.5rem", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,${GOLD},transparent)`, opacity:0.3 }} />
            <span style={panelTitle}>Node types</span>
            {[
              [GOLD,"Motor nodes","Phalange / joint output"],
              [CYAN,"Sensory nodes","Environment input"],
              [VIOLET,"Interneurons","Relay / processing"],
              [EMBER,"Motor output","Phalange tendon fire"],
            ].map(([c,nm,sub])=>(
              <div key={nm as string} style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:4 }}>
                <div style={{ width:12, height:12, borderRadius:"50%", background:c as string, boxShadow:`0 0 6px ${c}`, flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:"0.42rem", letterSpacing:"0.06em", color:c as string }}>{nm as string}</div>
                  <div style={{ fontSize:"0.38rem", color:DIM }}>{sub as string}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Plasticity */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, padding:"0.8rem 0.9rem", position:"relative" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,${GOLD},transparent)`, opacity:0.3 }} />
            <span style={panelTitle}>Plasticity</span>
            {[["LTP rate",plasticity.ltp],["LTD rate",plasticity.ltd],["Avg weight",plasticity.wt],["Active pulses",plasticity.pulses]].map(([k,v])=>(
              <div key={k as string} style={pbRow}>
                <span style={label9}>{k as string}</span>
                <span style={{ fontSize:"0.52rem", color: (k==="Active pulses")?CYAN:TEXT }}>{String(v)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CALLOUT STRIP ── */}
        <div style={{
          position:"absolute", bottom:100, left:"50%", transform:"translateX(-50%)",
          background:"rgba(5,5,14,0.96)", border:`1px solid ${BORDER}`,
          padding:"0.5rem 1.2rem",
          display:"flex", alignItems:"center", gap:"1.5rem",
          zIndex:15,
          opacity: showPanels?1:0, transition:"opacity 0.3s",
          whiteSpace:"nowrap",
        }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${GOLD},transparent)`, opacity:0.5 }} />
          {[["Current step",callout.step],["Signal type",callout.type],["Firing rate",callout.rate],["Wave pattern",callout.wave],["Coherence",callout.coh]].map(([k,v],i,arr)=>(
            <div key={k as string} style={{ display:"flex", alignItems:"center", gap:"1.5rem" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <span style={{ fontSize:"0.38rem", letterSpacing:"0.12em", textTransform:"uppercase", color:DIM }}>{k}</span>
                <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.9rem", color:GOLD2, letterSpacing:"0.05em" }}>{v}</span>
              </div>
              {i<arr.length-1 && <div style={{ width:1, height:30, background:BORDER }} />}
            </div>
          ))}
        </div>

        {/* ── EMPTY STATE ── */}
        {showEmpty && (
          <div style={{ position:"absolute", inset:0, zIndex:5, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0.8rem" }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"3rem", letterSpacing:"0.15em", color:DIM, lineHeight:1, textAlign:"center" }}>SEARCH<br/>AN ANIMAL</div>
            <div style={{ fontSize:"0.48rem", letterSpacing:"0.2em", textTransform:"uppercase", color:VDIM }}>Neural plasmoid network generates from biological profile</div>
            <div style={{ display:"flex", gap:"0.5rem", marginTop:"0.5rem", flexWrap:"wrap", justifyContent:"center" }}>
              {CHIPS.map(name=>(
                <button key={name} onClick={()=>{setInputVal(name);loadAnimal(name);}}
                  style={{
                    fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase",
                    border:`1px solid ${BORDER}`, padding:"4px 10px", color:DIM,
                    background:"transparent", cursor:"pointer",
                    fontFamily:"'DM Mono',monospace",
                  }}>
                  {name.replace(/\b\w/g,c=>c.toUpperCase())}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── LOADER ── */}
        {showLoader && (
          <div style={{ position:"absolute", inset:0, zIndex:50, background:"rgba(2,2,11,0.92)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"1.2rem" }}>
            <Spinner />
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1rem", letterSpacing:"0.2em", color:GOLD }}>Querying AETHER</div>
            <div style={{ fontSize:"0.44rem", letterSpacing:"0.12em", color:DIM, maxWidth:280, textAlign:"center", lineHeight:1.7 }}>
              Building neural plasmoid profile for "{inputVal}"…
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:4, minWidth:220 }}>
              {["01 · Fetching biological taxonomy","02 · Mapping neural complexity","03 · Calibrating wave frequencies","04 · Building plasmoid topology","05 · Initializing signal simulation"].map((s,i)=>(
                <div key={i} style={{
                  fontSize:"0.44rem", letterSpacing:"0.08em",
                  padding:"3px 0 3px 8px",
                  borderLeft:`2px solid ${i<loaderStep?CYAN:i===loaderStep?GOLD:BORDER}`,
                  color: i<loaderStep?CYAN:i===loaderStep?GOLD2:DIM,
                }}>{s}</div>
              ))}
            </div>
          </div>
        )}

        {/* ── TOUR OVERLAY ── */}
        {tourStep && (
          <div style={{ position:"absolute", inset:0, zIndex:40, background:"rgba(2,2,11,0.82)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{
              background:"rgba(5,5,14,0.97)", border:`1px solid ${BORDER}`,
              padding:"1.2rem 1.4rem", maxWidth:380, position:"relative",
            }}>
              {/* corner accents */}
              <div style={{ position:"absolute", top:"-1px", left:"-1px", width:12, height:12, borderTop:`1px solid ${CYAN}`, borderLeft:`1px solid ${CYAN}` }} />
              <div style={{ position:"absolute", bottom:"-1px", right:"-1px", width:12, height:12, borderBottom:`1px solid ${CYAN}`, borderRight:`1px solid ${CYAN}` }} />
              <div style={{ fontSize:"0.4rem", letterSpacing:"0.2em", textTransform:"uppercase", color:CYAN, marginBottom:"0.4rem" }}>
                Step {tourIdx+1} of {TOUR_STEPS.length}
              </div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.4rem", letterSpacing:"0.1em", color:GOLD2, marginBottom:"0.5rem", lineHeight:1 }}>
                {tourStep.title}
              </div>
              <div style={{ fontSize:"0.52rem", lineHeight:1.8, color:TEXT, marginBottom:"0.9rem" }}
                dangerouslySetInnerHTML={{ __html: tourStep.body
                  .replace(/<em>/g,`<span style="color:${CYAN}">`)
                  .replace(/<\/em>/g,"</span>")
                  .replace(/<strong>/g,`<span style="color:${GOLD2};font-weight:400">`)
                  .replace(/<\/strong>/g,"</span>")
                }}
              />
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.4rem", letterSpacing:"0.1em", color:DIM }}>
                  {"●".repeat(tourIdx+1)}{"○".repeat(TOUR_STEPS.length-tourIdx-1)}
                </span>
                <div style={{ display:"flex", gap:"0.5rem" }}>
                  {tourIdx>0 && (
                    <button onClick={()=>setTourIdx(i=>i-1)} style={{ background:"transparent", border:`1px solid ${BORDER}`, color:TEXT, fontFamily:"'DM Mono',monospace", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 10px", cursor:"pointer" }}>← Prev</button>
                  )}
                  <button onClick={()=>setTourIdx(i=>i>=TOUR_STEPS.length-1?-1:i+1)} style={{ background:"transparent", border:`1px solid ${CYAN}`, color:CYAN, fontFamily:"'DM Mono',monospace", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 10px", cursor:"pointer" }}>
                    {tourIdx>=TOUR_STEPS.length-1?"Finish ✓":"Next →"}
                  </button>
                  <button onClick={()=>setTourIdx(-1)} style={{ background:"transparent", border:`1px solid ${BORDER}`, color:DIM, fontFamily:"'DM Mono',monospace", fontSize:"0.44rem", letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 10px", cursor:"pointer" }}>✕</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ BOTTOM STRIP ══ */}
      <div style={{
        height:90, flexShrink:0,
        display:"grid", gridTemplateColumns:"repeat(5,1fr)",
        borderTop:`1px solid ${BORDER}`,
        background:"rgba(5,5,14,0.97)",
        position:"relative", zIndex:5,
      }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${GOLD},${CYAN},${GOLD},transparent)`, opacity:0.25 }} />
        {btmLabels.map((lbl, i) => (
          <div key={i} style={{
            padding:"0.5rem 0.8rem",
            borderRight: i<4 ? `1px solid ${BORDER}` : "none",
            display:"flex", flexDirection:"column", gap:3,
          }}>
            <span style={{ fontSize:"0.38rem", letterSpacing:"0.15em", textTransform:"uppercase", color:DIM }}>{lbl}</span>
            <canvas ref={el=>{ btmCvs.current[i]=el; }} style={{ flex:1, display:"block", width:"100%", minHeight:32 }} />
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"0.9rem", color:GOLD2, letterSpacing:"0.05em" }}>{btmVals[i]}</span>
              <span style={{ fontSize:"0.36rem", letterSpacing:"0.1em", color:DIM }}>{btmUnits[i]}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

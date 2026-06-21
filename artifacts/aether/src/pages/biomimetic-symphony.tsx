import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Palette ────────────────────────────────────────────────────────────────────
const C = {
  teal:   "#2dd4bf",
  gold:   "#f2bf65",
  purple: "#c084fc",
  blue:   "#60a5fa",
  green:  "#4ade80",
  bg:     "#030514",
  panel:  "#07021a",
};

// ── Quantum coherence canvas ──────────────────────────────────────────────────
// Simplified FMO-inspired 7-node chromophore network
const N_CHROM = 7;

type Mode = "quantum" | "classical";

function tickQuantum(amps: number[], t: number): number[] {
  // Quantum: spread coherently, reinforce at sink (node 6)
  const next = new Array(N_CHROM).fill(0);
  for (let i = 0; i < N_CHROM; i++) {
    const prev = i > 0 ? amps[i - 1] : 0;
    const next_ = i < N_CHROM - 1 ? amps[i + 1] : 0;
    const hop = 0.22;
    const decay = i === N_CHROM - 1 ? 0.015 : 0.008; // sink absorbs
    next[i] = amps[i] * (1 - decay) + hop * (prev + next_) * 0.5;
  }
  next[0] += Math.max(0, 0.08 * Math.exp(-t * 0.04));  // photon drive
  return next;
}

function tickClassical(pos: number, t: number): number {
  // Classical: hop ± 1 randomly, can lose energy
  if (Math.random() < 0.015) return pos; // trap/decay
  const r = Math.random();
  if (r < 0.45 && pos < N_CHROM - 1) return pos + 1;
  if (r < 0.90 && pos > 0) return pos - 1;
  return pos;
}

function drawQBio(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  amps: number[], classPos: number,
  efficiency: number, classEff: number,
  mode: "both" | "quantum" | "classical"
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#03080f";
  ctx.fillRect(0, 0, W, H);

  const halfH = H / 2;
  const draw = (offsetY: number, label: string, isQuantum: boolean) => {
    const pad = 30, nodeR = 12;
    const spacing = (W - pad * 2) / (N_CHROM - 1);

    // Row label
    ctx.fillStyle = isQuantum ? C.teal : "#f2a050";
    ctx.font = "8px Cinzel,serif";
    ctx.textAlign = "left";
    ctx.fillText(label, 4, offsetY - halfH * 0.38 + 10);

    // Connections
    for (let i = 0; i < N_CHROM - 1; i++) {
      const x1 = pad + i * spacing, x2 = pad + (i + 1) * spacing;
      const a = isQuantum ? Math.min(1, (amps[i] + amps[i + 1]) * 1.5) : (classPos === i || classPos === i + 1 ? 0.6 : 0.1);
      ctx.beginPath();
      ctx.moveTo(x1, offsetY); ctx.lineTo(x2, offsetY);
      ctx.strokeStyle = isQuantum ? `rgba(45,212,191,${a * 0.5})` : `rgba(255,160,80,${a * 0.4})`;
      ctx.lineWidth = a * 2.5 + 0.5;
      ctx.stroke();
    }

    // Nodes
    for (let i = 0; i < N_CHROM; i++) {
      const x = pad + i * spacing;
      const amp = isQuantum ? Math.min(1, amps[i] * 3) : (classPos === i ? 0.9 : 0.15);
      const isRC = i === N_CHROM - 1;
      const col = isRC ? C.gold : (isQuantum ? C.teal : "#f2a050");

      // Glow
      if (amp > 0.1 || isRC) {
        ctx.beginPath(); ctx.arc(x, offsetY, nodeR + amp * 10, 0, Math.PI * 2);
        const g = ctx.createRadialGradient(x, offsetY, 0, x, offsetY, nodeR + amp * 10);
        g.addColorStop(0, col + "50"); g.addColorStop(1, "transparent");
        ctx.fillStyle = g; ctx.fill();
      }

      // Node circle
      ctx.beginPath(); ctx.arc(x, offsetY, nodeR, 0, Math.PI * 2);
      ctx.fillStyle = isRC ? C.gold : (isQuantum ? `rgba(45,212,191,${0.2 + amp * 0.7})` : `rgba(255,160,80,${0.2 + amp * 0.7})`);
      ctx.shadowBlur = amp * 14; ctx.shadowColor = col;
      ctx.fill(); ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "7px monospace"; ctx.textAlign = "center";
      ctx.fillText(isRC ? "RC" : `C${i + 1}`, x, offsetY + 24);
    }

    // Efficiency bar
    const eff = isQuantum ? efficiency : classEff;
    const barW = W - 2 * pad;
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.fillRect(pad, offsetY + 32, barW, 5);
    ctx.fillStyle = isQuantum ? C.teal : "#f2a050";
    ctx.fillRect(pad, offsetY + 32, barW * Math.min(1, eff), 5);
    ctx.fillStyle = isQuantum ? C.teal : "#f2a050";
    ctx.font = "8px Cinzel,serif"; ctx.textAlign = "right";
    ctx.fillText(`${(eff * 100).toFixed(1)}% efficiency`, W - pad + 2, offsetY + 40);
  };

  // Divider
  ctx.strokeStyle = "rgba(100,80,200,0.15)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, halfH); ctx.lineTo(W, halfH); ctx.stroke();

  draw(halfH * 0.5, "QUANTUM COHERENCE", true);
  draw(halfH * 1.5 - 10, "CLASSICAL DIFFUSION", false);
}

// ═══════════════════════════════════════════════════════════════════════════════
function BiomimeticSymphonyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const instruments = [
      { label:"MYCO\nDRUM", col:"#c9a84c", angle:0 },
      { label:"NEURAL\nHARP", col:"#a78bfa", angle:Math.PI/3 },
      { label:"LEAF\nFLUTE", col:"#34d399", angle:2*Math.PI/3 },
      { label:"SEA\nPIANO", col:"#22d3ee", angle:Math.PI },
      { label:"PLASMA\nBASS", col:"#f472b6", angle:4*Math.PI/3 },
      { label:"CELL\nSYNTH", col:"#2ef0d8", angle:5*Math.PI/3 },
    ];
    const R=96;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,8,14,0.16)"; ctx.fillRect(0,0,W,H);
      t++;
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.strokeStyle="rgba(46,240,216,0.1)"; ctx.lineWidth=1; ctx.stroke();
      for (let i=0;i<instruments.length;i++) {
        const a=instruments[i],b=instruments[(i+1)%instruments.length];
        const ax=cx+Math.cos(a.angle)*R, ay=cy+Math.sin(a.angle)*R;
        const bx=cx+Math.cos(b.angle)*R, by=cy+Math.sin(b.angle)*R;
        const g=ctx.createLinearGradient(ax,ay,bx,by);
        g.addColorStop(0,a.col+"44"); g.addColorStop(1,b.col+"44");
        ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
        const pkt=(t*0.012+i*0.3)%1;
        const px=ax+(bx-ax)*pkt, py=ay+(by-ay)*pkt;
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
      }
      instruments.forEach((inst,i)=>{
        const dx=cx+Math.cos(inst.angle)*R, dy=cy+Math.sin(inst.angle)*R;
        const pulse=1+0.1*Math.sin(t*0.04+i*1.0);
        const g=ctx.createRadialGradient(dx,dy,0,dx,dy,16*pulse);
        g.addColorStop(0,inst.col+"cc"); g.addColorStop(0.5,inst.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(dx,dy,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=inst.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=inst.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=inst.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        inst.label.split("\n").forEach((ln,li)=>ctx.fillText(ln,dx,dy+18*pulse+li*9));
      });
      ctx.fillStyle="rgba(46,240,216,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("BIOMIMETIC SYMPHONY · MYCO DRUM · NEURAL HARP · LEAF FLUTE · SEA PIANO · PLASMA BASS · CELL SYNTH",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function BiomimeticSymphonyPage() {
  const [tab, setTab] = useState<"bio" | "qbio" | "symphony" | "outlook">("bio");

  // ── Quantum bio state ──────────────────────────────────────────────────────
  const [amps, setAmps] = useState(() => {
    const a = new Array(N_CHROM).fill(0); a[0] = 1; return a;
  });
  const [classPos, setClassPos] = useState(0);
  const [qEff, setQEff] = useState(0);
  const [cEff, setCEff] = useState(0);
  const [qRunning, setQRunning] = useState(true);
  const qCanvasRef = useRef<HTMLCanvasElement>(null);
  const ampsRef = useRef(amps);
  const classPosRef = useRef(0);
  const qEffRef = useRef(0);
  const cEffRef = useRef(0);
  const tRef = useRef(0);
  const qRafRef = useRef(0);
  const qRunRef = useRef(true);

  useEffect(() => { qRunRef.current = qRunning; }, [qRunning]);

  useEffect(() => {
    const loop = () => {
      if (!qRunRef.current) { qRafRef.current = requestAnimationFrame(loop); return; }
      tRef.current++;
      const nextAmps = tickQuantum(ampsRef.current, tRef.current);
      ampsRef.current = nextAmps;
      // Quantum efficiency: accumulated at RC
      if (nextAmps[N_CHROM - 1] > 0.02) qEffRef.current = Math.min(0.99, qEffRef.current + 0.0012);
      // Classical: hop
      const cp = tickClassical(classPosRef.current, tRef.current);
      classPosRef.current = cp;
      if (cp === N_CHROM - 1) cEffRef.current = Math.min(0.72, cEffRef.current + 0.0008);
      // Reset occasionally
      if (tRef.current % 180 === 0) {
        const a = new Array(N_CHROM).fill(0); a[0] = 1;
        ampsRef.current = a; classPosRef.current = 0;
      }
      // Render
      const canvas = qCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) drawQBio(ctx, canvas.width, canvas.height, nextAmps, cp, qEffRef.current, cEffRef.current, "both");
      }
      if (tRef.current % 8 === 0) {
        setAmps([...nextAmps]); setClassPos(cp);
        setQEff(qEffRef.current); setCEff(cEffRef.current);
      }
      qRafRef.current = requestAnimationFrame(loop);
    };
    qRafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(qRafRef.current);
  }, []);

  return (
    <div className="min-h-screen text-white font-['Raleway',sans-serif] pb-10" style={{ background: C.bg }}>
      <div className="px-6 pt-4">
        <div style={{ display:"inline-block", background:"rgba(46,240,216,0.07)", border:"1px solid rgba(46,240,216,0.22)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:"#2ef0d8", textTransform:"uppercase", fontFamily:"'Cinzel',serif", marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(2,8,14,0.9)", border:"1px solid rgba(46,240,216,0.12)",
          borderLeft:"3px solid #2ef0d8", borderRadius:10, padding:20, marginBottom:14 }}>
          <h2 style={{ fontFamily:"'Cinzel',serif", fontSize:18, color:"#d0fff8", margin:"0 0 6px" }}>
            Biomimetic Symphony · Myco Drum · Neural Harp · Leaf Flute · Sea Piano · Plasma Bass · Cell Synth
          </h2>
          <p style={{ fontFamily:"'Raleway',sans-serif", fontSize:12, color:"rgba(150,240,230,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
            Six bio-instrument nodes (Myco Drum/gold · Neural Harp/violet · Leaf Flute/teal · Sea Piano/cyan · Plasma Bass/rose
            · Cell Synth/mint) in a hexagonal ring with photon coupling packets streaming between each pair —
            the living AETHER biomimetic orchestra, nature as music.
          </p>
          <BiomimeticSymphonyCanvas />
        </div>
      </div>

      {/* Header */}
      <div className="border-b border-teal-900/30 px-6 py-4 sticky top-0 z-20"
        style={{ background: C.panel + "ee" }}>
        <p className="text-[10px] tracking-[0.3em] text-teal-400/50 font-['Cinzel',serif] mb-0.5">
          SYSTEM · LIVING SYSTEMS · CIVILIZATIONAL DESIGN
        </p>
        <h1 className="text-2xl font-['Cinzel',serif] tracking-widest text-teal-100">
          BIOMIMETIC SYMPHONY · NATURE AS OPERATING SYSTEM
        </h1>
        <p className="text-xs text-teal-300/40 mt-0.5">
          3.8 Billion Years of R&amp;D · Quantum Biology · The Symphonic Protocol · 2026 Outlook
        </p>
        <div className="flex gap-4 mt-2 flex-wrap">
          {[
            { label: "Whale fin gain", value: "~40%", note: "wind turbine efficiency", col: C.teal },
            { label: "Photosynthesis", value: "≈99%", note: "exciton transport", col: C.gold },
            { label: "Firefly yield",  value: "≈100%", note: "photon efficiency", col: "#fbbf24" },
            { label: "Error threshold",value: "<11%", note: "Fibonacci anyons", col: C.purple },
            { label: "Fault-tolerant", value: "2026+", note: "QC deployment", col: C.blue },
          ].map(m => (
            <div key={m.label} className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: m.col }} />
              <span className="text-[9px] text-teal-600/50">{m.label}</span>
              <span className="text-[10px] font-['Cinzel',serif]" style={{ color: m.col }}>{m.value}</span>
              <span className="text-[8px] text-teal-700/40">{m.note}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-teal-900/20 px-6" style={{ background: C.panel + "88" }}>
        {([
          ["bio",     "BIOMIMICRY"],
          ["qbio",    "QUANTUM BIOLOGY"],
          ["symphony","THE SYMPHONY"],
          ["outlook", "2026 OUTLOOK"],
        ] as const).map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-[11px] tracking-widest font-['Cinzel',serif] border-b-2 transition-all ${
              tab === key ? "border-teal-500 text-teal-300" : "border-transparent text-teal-700/50 hover:text-teal-400"}`}>
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">

        {/* ════ BIOMIMICRY ════ */}
        {tab === "bio" && (
          <motion.div key="bio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex flex-col gap-5">

            <div className="grid grid-cols-3 gap-5">
              {/* Whale fin */}
              <div className="border border-teal-900/30 rounded-xl p-5" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/60 mb-3">🐋 HUMPBACK WHALE · TUBERCLE FINS</p>
                {/* Shape comparison SVG */}
                <svg viewBox="0 0 240 80" className="w-full mb-3">
                  {/* Smooth airfoil */}
                  <path d="M10,60 Q80,20 180,30 Q220,32 230,38 Q200,48 10,60Z"
                    fill="rgba(100,160,255,0.15)" stroke="rgba(100,160,255,0.5)" strokeWidth={1.2}/>
                  <text x={120} y={72} textAnchor="middle" fontSize={7} fill="rgba(100,160,255,0.5)">Traditional</text>
                  {/* Tubercle airfoil */}
                  <path d={`M10,45 ${Array.from({length:12},(_,i)=>{const x=10+i*18;const isUp=i%2===0;return `Q${x+9},${isUp?18:28} ${x+18},${isUp?24:22}`;}).join(' ')} Q220,20 230,26 Q200,38 10,45Z`}
                    fill="rgba(45,212,191,0.12)" stroke={C.teal} strokeWidth={1.2}/>
                  <text x={120} y={38} textAnchor="middle" fontSize={7} fill={C.teal}>Tubercle profile</text>
                </svg>
                <p className="text-[9px] text-teal-300/60 leading-4 mb-3">
                  Tubercles — the bumps on humpback pectoral fins — act as passive vortex generators, delaying stall and enabling tighter turns. Applied to wind turbine blades, they improve low-wind efficiency by ~40% and cut noise by 32%.
                </p>
                {/* Efficiency comparison */}
                {[
                  { label: "Standard blade", val: 0.35, col: "#60a5fa" },
                  { label: "Tubercle blade", val: 0.49, col: C.teal },
                ].map(b => (
                  <div key={b.label} className="mb-2">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[9px] text-teal-600/50">{b.label}</span>
                      <span className="text-[9px] font-['Cinzel',serif]" style={{ color: b.col }}>{(b.val * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-teal-900/20">
                      <motion.div className="h-full rounded-full"
                        style={{ background: b.col }}
                        initial={{ width: 0 }} animate={{ width: `${b.val * 100}%` }}
                        transition={{ duration: 1.2, ease: "easeOut" }} />
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-teal-700/40 mt-2 italic">19keys: fix the system</p>
              </div>

              {/* Shark skin */}
              <div className="border border-blue-900/30 rounded-xl p-5" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-blue-400/60 mb-3">🦈 SHARK SKIN · DERMAL DENTICLES</p>
                <svg viewBox="0 0 240 80" className="w-full mb-3">
                  {/* Smooth surface */}
                  <rect x={10} y={30} width={90} height={30} rx={2} fill="rgba(100,160,255,0.1)" stroke="rgba(100,160,255,0.4)" strokeWidth={1}/>
                  <text x={55} y={74} textAnchor="middle" fontSize={7} fill="rgba(100,160,255,0.5)">Smooth hull</text>
                  {/* Riblet surface */}
                  {Array.from({length:8},(_,i)=>(
                    <polygon key={i} points={`${140+i*13},60 ${140+i*13+6},30 ${140+i*13+12},60`}
                      fill="rgba(96,165,250,0.15)" stroke="#60a5fa" strokeWidth={0.8}/>
                  ))}
                  <text x={188} y={74} textAnchor="middle" fontSize={7} fill="#60a5fa">Denticle riblets</text>
                </svg>
                <p className="text-[9px] text-blue-300/60 leading-4 mb-3">
                  Shark dermal denticles create micro-vortices that reduce turbulent boundary layer drag. Swimsuit riblets (Speedo Fastskin) and aircraft surface coatings derived from this geometry reduce drag 6–8%. At ship-hull scale, this represents millions in fuel savings per vessel per year.
                </p>
                {[
                  { label: "Conventional hull", val: 0.0,  col: "#60a5fa", note: "baseline" },
                  { label: "Shark riblets",     val: 0.08, col: C.teal,    note: "−8% drag" },
                ].map((b, i) => (
                  <div key={b.label} className="mb-2">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[9px] text-blue-600/50">{b.label}</span>
                      <span className="text-[9px] font-['Cinzel',serif]" style={{ color: b.col }}>{b.note}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-blue-900/20">
                      <motion.div className="h-full rounded-full"
                        style={{ background: b.col, marginLeft: "20%" }}
                        initial={{ width: 0 }} animate={{ width: i === 0 ? "60%" : "52%" }}
                        transition={{ duration: 1, delay: 0.3, ease: "easeOut" }} />
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-blue-700/40 mt-2 italic">Evolution solved turbulence in 400M years</p>
              </div>

              {/* Lotus leaf */}
              <div className="border border-green-900/30 rounded-xl p-5" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-green-400/60 mb-3">🪷 LOTUS LEAF · SUPERHYDROPHOBICITY</p>
                <svg viewBox="0 0 240 80" className="w-full mb-3">
                  {/* Lotus leaf cross-section */}
                  {Array.from({length:14},(_,i)=>(
                    <g key={i}>
                      <rect x={10+i*16} y={50} width={5} height={12} rx={2}
                        fill="rgba(74,222,128,0.3)" stroke="#4ade80" strokeWidth={0.7}/>
                      <circle cx={12.5+i*16} cy={35+Math.sin(i*0.7)*8} r={6}
                        fill="rgba(150,200,255,0.25)" stroke="rgba(150,200,255,0.6)" strokeWidth={0.7}/>
                    </g>
                  ))}
                  <text x={120} y={76} textAnchor="middle" fontSize={7} fill="#4ade80">Wax microstructure + water droplets</text>
                </svg>
                <p className="text-[9px] text-green-300/60 leading-4 mb-3">
                  The lotus leaf's hierarchical wax microstructure creates a contact angle &gt; 150° — water beads up and rolls away, carrying dirt. Zero energy self-cleaning. Applied to architecture, solar panels, and medical devices. The lotus effect reduces maintenance costs by orders of magnitude.
                </p>
                {[
                  { label: "Chemical cleaning",   val: 0.6, col: "#f87171",  note: "energy cost: high" },
                  { label: "Lotus effect",         val: 0.0, col: C.green,   note: "energy cost: zero" },
                ].map(b => (
                  <div key={b.label} className="mb-2">
                    <div className="flex justify-between mb-0.5">
                      <span className="text-[9px] text-green-600/50">{b.label}</span>
                      <span className="text-[9px] font-['Cinzel',serif]" style={{ color: b.col }}>{b.note}</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden bg-green-900/20">
                      <motion.div className="h-full rounded-full" style={{ background: b.col }}
                        initial={{ width: 0 }} animate={{ width: b.val > 0 ? "60%" : "3%" }}
                        transition={{ duration: 1, delay: 0.5 }} />
                    </div>
                  </div>
                ))}
                <p className="text-[9px] text-green-700/40 mt-2 italic">Clean without cost — biomimicry's highest form</p>
              </div>
            </div>

            <div className="border border-teal-900/30 rounded-xl p-5" style={{ background: C.panel + "60" }}>
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/60 mb-3">THE 3.8 BILLION YEAR PATENT LIBRARY</p>
              <div className="grid grid-cols-4 gap-4">
                {[
                  { org: "Termite mounds", app: "Passive HVAC", gain: "90% energy reduction in Eastgate Centre, Zimbabwe", col: C.teal },
                  { org: "Kingfisher beak", app: "Bullet train nose", gain: "30% less energy, ends sonic boom tunnels (Shinkansen)", col: C.gold },
                  { org: "Spider silk", app: "Body armour / sutures", gain: "5× stronger than steel at 1/6 weight, fully biodegradable", col: C.purple },
                  { org: "Mangrove roots", app: "Coastal infrastructure", gain: "Self-reinforcing fractal networks, survive 250km/h winds", col: C.green },
                ].map(c => (
                  <div key={c.org} className="border rounded-xl p-3" style={{ borderColor: c.col + "25", background: c.col + "08" }}>
                    <p className="text-[9px] font-['Cinzel',serif] mb-1" style={{ color: c.col }}>{c.org}</p>
                    <p className="text-[10px] text-white/60 mb-1">{c.app}</p>
                    <p className="text-[9px] leading-4" style={{ color: c.col + "80" }}>{c.gain}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ QUANTUM BIOLOGY ════ */}
        {tab === "qbio" && (
          <motion.div key="qbio" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex gap-5">

            <div className="w-56 shrink-0 flex flex-col gap-3">
              <div className="border border-gold-900/30 rounded-xl p-4" style={{ background: C.panel + "80", borderColor: C.gold + "30" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>QUANTUM COHERENCE</p>
                <p className="text-[9px] leading-4" style={{ color: C.gold + "80" }}>
                  Photosynthetic complexes (FMO in green sulfur bacteria) achieve near-100% exciton transport efficiency by exploiting quantum coherence — energy explores all transfer paths simultaneously and constructively interferes at the reaction centre.
                </p>
              </div>
              <div className="border border-purple-900/30 rounded-xl p-4" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-2">PROTON TUNNELING</p>
                <p className="text-[9px] text-purple-300/50 leading-4">
                  Enzyme catalysis exploits quantum tunneling — protons pass through energy barriers classically forbidden at room temperature. Reaction rates exceed classical predictions by 10³–10⁷×. Life runs on quantum shortcuts.
                </p>
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: "#fbbf24" + "30", background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] mb-2" style={{ color: "#fbbf24" }}>🔥 FIREFLY BIOLUMINESCENCE</p>
                <p className="text-[9px] leading-4" style={{ color: "#fbbf24" + "80" }}>
                  Firefly luciferase converts chemical energy to light with near-unity photon yield (≈100%). For comparison, incandescent bulbs: 5%, LEDs: 30–50%. The firefly is more efficient at photon generation than any human-engineered device.
                </p>
              </div>
              <button onClick={() => setQRunning(r => !r)}
                className={`py-2 rounded-xl text-[9px] font-['Cinzel',serif] tracking-widest border ${
                  qRunning ? "border-teal-500/40 text-teal-400" : "border-yellow-500/40 text-yellow-400"}`}>
                {qRunning ? "⏸ PAUSE" : "▶ RUN"}
              </button>
              <div className="border border-teal-900/30 rounded-xl p-3 text-[9px] leading-4" style={{ background: C.panel + "60" }}>
                <div className="flex justify-between mb-1">
                  <span style={{ color: C.teal }}>Quantum eff.</span>
                  <span className="font-['Cinzel',serif]" style={{ color: C.teal }}>{(qEff * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-400/60">Classical eff.</span>
                  <span className="font-['Cinzel',serif] text-orange-400/60">{(cEff * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="border border-teal-900/30 rounded-xl overflow-hidden" style={{ background: "#03080f" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/50 px-4 pt-3 pb-1">
                  LIVE: PHOTOSYNTHETIC EXCITON TRANSPORT — C1→C7 → REACTION CENTRE (RC)
                </p>
                <canvas ref={qCanvasRef} width={700} height={260} className="w-full"/>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { title: "QUANTUM WALK", col: C.teal, text: "Energy spreads as a coherent wave across all chromophore pathways simultaneously. Destructive interference eliminates inefficient paths; constructive interference amplifies the route to the reaction centre. The system is not guessing — it is computing the optimal path with every photon." },
                  { title: "CLASSICAL DIFFUSION", col: "#f2a050", text: "Without quantum coherence, energy would hop randomly between chromophores — a classical random walk. Statistical thermodynamics predicts 30–40% loss to heat before reaching the reaction centre. Classical photosynthesis would be incompatible with life." },
                  { title: "THE IMPLICATION", col: C.purple, text: "Life did not stumble on quantum coherence by accident. 3.8 billion years of evolution converged on it because nothing else is efficient enough. The design philosophy: use quantum mechanics where physics allows, classical mechanics where it is sufficient." },
                ].map(c => (
                  <div key={c.title} className="border rounded-xl p-4" style={{ borderColor: c.col + "25", background: c.col + "07" }}>
                    <p className="text-[9px] font-['Cinzel',serif] mb-2" style={{ color: c.col }}>{c.title}</p>
                    <p className="text-[9px] text-purple-300/50 leading-4">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ THE SYMPHONY ════ */}
        {tab === "symphony" && (
          <motion.div key="symphony" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex gap-5">

            <div className="flex-1">
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/50 mb-4">
                FROM MECHANICAL MACHINERY → LIVING TISSUE
              </p>
              <div className="flex flex-col gap-4">
                {[
                  {
                    domain: "INFRASTRUCTURE",
                    from: { label: "Mechanical Assets", desc: "Pipes, cables, roads designed for fixed loads. Fail catastrophically when overloaded. Repaired by external intervention. Life expectancy counted in decades.", icon: "⚙️" },
                    to:   { label: "Neural Tissue",     desc: "Self-routing networks that reroute around damage. Distributed sensing identifies stress before failure. Infrastructure that heals, adapts, and learns its own usage patterns.", icon: "🧠" },
                    col: C.teal,
                  },
                  {
                    domain: "SOCIAL SECURITY",
                    from: { label: "Conditional Payments", desc: "Means-tested, bureaucratically gatekept transfers. High administrative overhead. Stigmatised access. Stops flowing the moment conditions change. Designed to exclude.", icon: "🏦" },
                    to:   { label: "Circulatory Dividends", desc: "Universal base-flow of resources moving through society as blood moves through a body — continuously, unconditionally. Healthy circulation prevents organ failure (community collapse). The system cannot starve itself.", icon: "💓" },
                    col: C.gold,
                  },
                  {
                    domain: "HEALTHCARE",
                    from: { label: "Combat Medicine", desc: "Disease as enemy. Intervention at crisis point. Reactive, expensive, and often too late. Specialist-gated. Treats symptoms when causes have already compounded. Optimised for billable events.", icon: "⚔️" },
                    to:   { label: "Environmental Tuning", desc: "Health as ecological equilibrium. Preventive signals, continuous sensing, environmental design that makes disease structurally improbable. The body in a healing context heals itself. Medicine's role: maintain the conditions for self-repair.", icon: "🌿" },
                    col: C.green,
                  },
                  {
                    domain: "GOVERNANCE",
                    from: { label: "Static Machinery", desc: "Constitutions designed for one historical moment. Laws that lag behind technology by 20-year cycles. Institutions that cannot sense the territory they govern, only receive filtered reports.", icon: "🏛️" },
                    to:   { label: "Sensing, Healing, Reorganising", desc: "Society as a living tissue capable of perceiving disruption at any scale — from household to civilizational — and reorienting in real time through regenerative, distributed networks rather than centralised command.", icon: "🌐" },
                    col: C.purple,
                  },
                ].map((item, idx) => (
                  <motion.div key={item.domain}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
                    className="border rounded-xl overflow-hidden" style={{ borderColor: item.col + "25" }}>
                    <div className="px-4 py-2 text-[9px] font-['Cinzel',serif] tracking-widest" style={{ background: item.col + "15", color: item.col }}>
                      {item.domain}
                    </div>
                    <div className="grid grid-cols-2">
                      <div className="p-4 border-r" style={{ borderColor: item.col + "15", background: "#06020f" }}>
                        <div className="flex gap-2 items-start mb-2">
                          <span className="text-lg">{item.from.icon}</span>
                          <p className="text-[10px] text-red-300/60 font-['Cinzel',serif]">{item.from.label}</p>
                        </div>
                        <p className="text-[9px] text-purple-500/45 leading-4">{item.from.desc}</p>
                      </div>
                      <div className="p-4" style={{ background: item.col + "05" }}>
                        <div className="flex gap-2 items-start mb-2">
                          <span className="text-lg">{item.to.icon}</span>
                          <p className="text-[10px] font-['Cinzel',serif]" style={{ color: item.col }}>{item.to.label}</p>
                        </div>
                        <p className="text-[9px] leading-4" style={{ color: item.col + "70" }}>{item.to.desc}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="w-64 shrink-0 flex flex-col gap-4">
              <div className="border border-teal-900/30 rounded-xl overflow-hidden">
                <img src="/symphonic-protocol.jpeg" alt="Symphonic Protocol" className="w-full object-cover" style={{ maxHeight: 180 }} />
              </div>
              <div className="border border-teal-900/30 rounded-xl p-4" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/60 mb-2">THE CORE CLAIM</p>
                <p className="text-[10px] text-teal-200/70 leading-5 italic">
                  "This synthesis isn't incremental. It's life-changing — because systems that behave like life can finally sustain life."
                </p>
              </div>
              <div className="border border-purple-900/30 rounded-xl p-4" style={{ background: C.panel + "60" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-2">AETHER INTEGRATION</p>
                <p className="text-[9px] text-purple-300/50 leading-4">
                  When integrated with AETHER's layered intelligence — physical · symbolic · experiential — these systems avoid category errors and achieve resonance. Building resilience even against cosmic disruptions: geomagnetic storms, solar flares, civilizational discontinuities.
                </p>
              </div>
              <div className="border rounded-xl p-4" style={{ borderColor: C.gold + "30", background: C.panel + "60" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] mb-2" style={{ color: C.gold }}>THREE-LAYER ARCHITECTURE</p>
                {[["🧬","Mycelial-Silicon Substrate","base computation fabric"],
                  ["🫀","Circulatory Engine Layer","data flows like blood"],
                  ["🌿","Resonant Medicine Field","emergence and coherence"],
                ].map(([icon,title,desc])=>(
                  <div key={String(title)} className="flex gap-2 mb-2">
                    <span className="text-sm">{icon}</span>
                    <div>
                      <p className="text-[9px] font-['Cinzel',serif]" style={{ color: C.gold + "99" }}>{title}</p>
                      <p className="text-[8px] text-yellow-800/40">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ════ 2026 OUTLOOK ════ */}
        {tab === "outlook" && (
          <motion.div key="outlook" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="p-5 flex flex-col gap-5">

            <div className="grid grid-cols-2 gap-5">
              {/* Quantum computing roadmap */}
              <div className="border border-blue-900/30 rounded-xl p-5" style={{ background: C.panel + "80" }}>
                <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-blue-400/60 mb-4">QUANTUM COMPUTING · 2026 TRENDS</p>
                <div className="flex flex-col gap-3">
                  {[
                    { year: "2024–25", title: "Hybrid Classical-Quantum", col: "#60a5fa", desc: "NISQ devices integrated into classical HPC pipelines. Variational quantum eigensolvers for materials science. Financial risk models and drug discovery pilots." },
                    { year: "2025–26", title: "Industrial Pilots Scale", col: C.teal, desc: "Pharma (protein folding), logistics (optimisation), materials (catalyst design). First commercial quantum advantage demonstrated in controlled verticals." },
                    { year: "2026",    title: "Error Correction Advances", col: C.gold, desc: "Surface code threshold experiments breach fault-tolerant operation. Logical qubit coherence times extend to milliseconds. Fibonacci anyon braiding in photonic systems." },
                    { year: "2026+",   title: "Fault-Tolerant Scalability", col: C.green, desc: "First fully fault-tolerant logical qubit systems operational. Real-world deployment in cryptography, climate modelling, and quantum chemistry at scale." },
                  ].map((m, i) => (
                    <motion.div key={m.title}
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                      className="flex gap-3 border-l-2 pl-3" style={{ borderColor: m.col }}>
                      <div className="shrink-0 text-right w-12">
                        <span className="text-[8px] font-['Cinzel',serif]" style={{ color: m.col + "70" }}>{m.year}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-['Cinzel',serif]" style={{ color: m.col }}>{m.title}</p>
                        <p className="text-[9px] text-purple-400/45 leading-4 mt-0.5">{m.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* AETHER synthesis */}
              <div className="flex flex-col gap-4">
                <div className="border border-purple-900/30 rounded-xl p-5" style={{ background: C.panel + "80" }}>
                  <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-purple-400/60 mb-3">AETHER SYNTHESIS</p>
                  <p className="text-[9px] text-purple-200/60 leading-5">
                    AETHER's three intelligence layers — physical · symbolic · experiential — map directly onto the three imperatives:
                  </p>
                  <div className="mt-3 flex flex-col gap-2">
                    {[
                      { layer: "Physical", map: "Biomimicry substrate", col: C.teal, desc: "Analog reservoir + quantum coherence at the hardware layer" },
                      { layer: "Symbolic", map: "φ-Architecture", col: C.gold, desc: "FQP + SOC universality class + Fibonacci quantization" },
                      { layer: "Experiential", map: "Symphonic Protocol", col: C.purple, desc: "Civilizational operating system as living tissue" },
                    ].map(l => (
                      <div key={l.layer} className="flex gap-3 p-2 rounded-lg" style={{ background: l.col + "08" }}>
                        <div className="w-20 shrink-0">
                          <p className="text-[9px] font-['Cinzel',serif]" style={{ color: l.col }}>{l.layer}</p>
                          <p className="text-[8px]" style={{ color: l.col + "60" }}>{l.map}</p>
                        </div>
                        <p className="text-[9px] text-purple-400/50 leading-4">{l.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border border-teal-900/30 rounded-xl p-5" style={{ background: C.panel + "60" }}>
                  <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/60 mb-3">GEOMAGNETIC RESILIENCE</p>
                  <p className="text-[9px] text-teal-300/50 leading-4">
                    Living-tissue infrastructure — with distributed fault tolerance, quantum error correction below the 11% threshold, and biomimetic self-repair — maintains function during events that would collapse brittle mechanical systems: solar CMEs, EMP events, coordinated infrastructure attacks. Nature has survived 4.5 billion years of cosmic disruption. The design lesson is clear.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom synthesis statement */}
            <div className="border rounded-xl p-6" style={{ borderColor: C.teal + "30", background: "linear-gradient(135deg," + C.panel + "," + "#020a0f" + ")" }}>
              <p className="text-[9px] tracking-widest font-['Cinzel',serif] text-teal-400/50 mb-3">THE CONVERGENCE</p>
              <div className="grid grid-cols-3 gap-6 text-[9px] leading-5">
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.teal }}>BIOMIMICRY</p>
                  <p className="text-teal-300/50">Translates evolutionary wins into technology. Addresses systemic design failures. Efficiency gains of 40–100× available by applying 3.8 billion years of optimisation. Aligned with 19keys' "fix the system" ethos — the system is broken because we ignored nature's engineering manual.</p>
                </div>
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.gold }}>QUANTUM BIOLOGY</p>
                  <p className="text-yellow-300/50">Nature uses quantum effects not as an accident but as design. Photosynthesis, enzyme catalysis, bird navigation, firefly efficiency — all exploit quantum mechanics where classical physics is insufficient. The boundary between biology and quantum physics is not a wall, it is a membrane that life crosses freely.</p>
                </div>
                <div>
                  <p className="font-['Cinzel',serif] mb-1" style={{ color: C.purple }}>THE SYMPHONY</p>
                  <p className="text-purple-300/50">Infrastructure as neural tissue. Social security as circulation. Healthcare as environmental tuning. Governance as distributed sensing. These aren't metaphors. They are engineering specifications. Systems that behave like life — distributed, self-healing, observable — can finally sustain life. ♾️🤖</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

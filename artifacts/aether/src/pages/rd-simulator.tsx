import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ── */
const BG    = "#020408";
const PANEL = "rgba(2,4,8,0.97)";
const BORDER= "#0e1420";
const GOLD  = "#c9a84c";
const TEXT  = "#b0c0d0";
const MUTED = "#162030";
const DIM   = "#0a1218";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";
const BIO   = "#44ee88";
const VIO   = "#9966ff";
const AMB   = "#ff9933";
const CLM   = "#2ef0d8";
const ROSE  = "#ff4477";
const LIME  = "#aaee44";
const SKY   = "#44aaff";

const N = 180; // grid cells

/* ── Presets ── */
interface Preset { name:string; label:string; color:string; F:number; k:number; desc:string; aetherRole:string; }
const PRESETS: Preset[] = [
  { name:"CORAL",     label:"Coral Growth",      color:BIO,
    F:0.0545, k:0.062,
    desc:"Branching dendritic structures. High feed sustains rapid activator production; kill rate balanced for stable bifurcation.",
    aetherRole:"Seamoss κ-carrageenan hydrogel growth topology — the same branching morphology as bioluminescent substrate nodes" },
  { name:"LABYRINTH", label:"Labyrinthine Maze",  color:CLM,
    F:0.052,  k:0.065,
    desc:"Continuous maze / labyrinthine stripe patterns. Inhibitor diffusion length balances activator to produce connected corridors.",
    aetherRole:"SOI building floor plan morphogenesis — ∂A/∂t = D_A∇²A + f(A,B) self-organises the kinetic building corridor topology" },
  { name:"NODES",     label:"Node Array",          color:VIO,
    F:0.035,  k:0.065,
    desc:"Stable hexagonal / quasi-periodic dot array. Activator crystallises into isolated coherence nodes at lowest feed rate.",
    aetherRole:"Coherence nodes C* = φ⁻¹ — each dot is an AETHER crystallisation point, stable attractor of ∂C/∂t = αS−βD" },
  { name:"WORM",      label:"Worm Mesh",            color:AMB,
    F:0.078,  k:0.061,
    desc:"Moving worm-like stripe patterns that continuously translate. High feed drives constant renewal — the pattern lives.",
    aetherRole:"Mycelium hyphal network routing bioluminescent signals — same connectivity graph as Panellus stipticus wood-wide-web" },
  { name:"RIPPLE",    label:"Traveling Wave",       color:SKY,
    F:0.0246, k:0.052,
    desc:"Expanding circular wave fronts from perturbation seeds. Propagating activator pulses.",
    aetherRole:"Torsion resonator wave propagation — the spinning field R(t)=(a√t·cos(αt), a√t·sin(αt), vt) in cross-section" },
  { name:"CRYSTAL",   label:"Crystal Seed",          color:GOLD,
    F:0.039,  k:0.058,
    desc:"Slow crystalline growth from seed points outward. Dendritic fractal edges. System approaches a frozen attractor.",
    aetherRole:"Crystallisation model of intelligence — coherence C(x,t) approaching golden attractor C* = φ⁻¹ ≈ 0.618" },
  { name:"VOID",      label:"Void Bloom",             color:ROSE,
    F:0.025,  k:0.05,
    desc:"Sparse, ghostly blooms. Long pauses between structures. Dark substrate.",
    aetherRole:"Void-ember bioluminescence (880nm) — sparse near-IR emission from carrageenan iodine absorption overtone" },
  { name:"GYROID",    label:"Gyroid Surface",         color:LIME,
    F:0.060,  k:0.063,
    desc:"Dense labyrinthine maze approaching triply-periodic minimal surface topology.",
    aetherRole:"CUCA Gyroid v3.0 photonic crystal — the reaction-diffusion field self-organises into the same periodic geometry" },
];

type CMap = "coherence"|"bioluminescent"|"void"|"substrate"|"gyroid";
const CMAPS: [CMap,string,string][] = [
  ["coherence",     "COHERENCE",      GOLD],
  ["bioluminescent","BIOLUMINESCENT",  BIO ],
  ["void",          "VOID",           VIO ],
  ["substrate",     "SUBSTRATE",      AMB ],
  ["gyroid",        "GYROID",         CLM ],
];

function mapColor(u: number, v: number, cmap: CMap): [number,number,number] {
  const t = Math.min(1, Math.max(0, v * 2.8));
  switch (cmap) {
    case "coherence": {
      if (t < 0.25) { const f=t/0.25; return [Math.round(2+f*30),Math.round(4+f*10),Math.round(8+f*60)]; }
      if (t < 0.618){ const f=(t-0.25)/0.368; return [Math.round(32+f*55),Math.round(14+f*38),Math.round(68+f*190)]; }
      const f=(t-0.618)/0.382; return [Math.round(87+f*168),Math.round(52+f*168),Math.round(258-f*210)];
    }
    case "bioluminescent": {
      if (t<0.12){ return [Math.round(t*8*20),0,0]; }
      if (t<0.28){ const f=(t-0.12)/0.16; return [Math.round(160+f*95),Math.round(f*25),0]; }
      if (t<0.48){ const f=(t-0.28)/0.20; return [255,Math.round(25+f*180),0]; }
      if (t<0.68){ const f=(t-0.48)/0.20; return [Math.round(255-f*210),Math.round(205+f*50),Math.round(f*50)]; }
      if (t<0.85){ const f=(t-0.68)/0.17; return [Math.round(45-f*45),Math.round(255-f*95),Math.round(50+f*205)]; }
      const f=(t-0.85)/0.15; return [Math.round(f*255),Math.round(160+f*95),255];
    }
    case "void": {
      if (t<0.3){ const f=t/0.3; return [Math.round(f*6),Math.round(f*4),Math.round(f*22)]; }
      const f=(t-0.3)/0.7; return [Math.round(18+f*82),Math.round(12+f*100),Math.round(66+f*180)];
    }
    case "substrate": {
      if (t<0.18){ const f=t/0.18; return [Math.round(f*20),Math.round(f*8),0]; }
      if (t<0.55){ const f=(t-0.18)/0.37; return [Math.round(100+f*130),Math.round(40+f*120),Math.round(f*22)]; }
      const f=(t-0.55)/0.45; return [Math.round(230+f*25),Math.round(160+f*80),Math.round(22+f*185)];
    }
    case "gyroid": {
      if (t<0.2){ const f=t/0.2; return [0,Math.round(f*22),Math.round(f*44)]; }
      if (t<0.65){ const f=(t-0.2)/0.45; return [0,Math.round(100+f*145),Math.round(200+f*55)]; }
      const f=(t-0.65)/0.35; return [Math.round(f*200),255,255];
    }
  }
}

/* ══════════════ SIMULATION CANVAS ══════════════ */
interface SimProps {
  preset: Preset; cmap: CMap; steps: number; running: boolean;
  onStats: (s:{uMean:number;vMean:number;frame:number})=>void;
  injectRef: React.MutableRefObject<((x:number,y:number,clear:boolean)=>void)|null>;
  resetRef: React.MutableRefObject<(()=>void)|null>;
}

function SimCanvas({ preset, cmap, steps, running, onStats, injectRef, resetRef }: SimProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const offRef     = useRef(document.createElement("canvas"));
  const rafRef     = useRef(0);

  // ── simulation buffers (two per channel for double-buffering) ──
  const uA = useRef(new Float32Array(N*N));
  const uB = useRef(new Float32Array(N*N));
  const vA = useRef(new Float32Array(N*N));
  const vB = useRef(new Float32Array(N*N));
  const uRead  = useRef(uA.current);
  const uWrite = useRef(uB.current);
  const vRead  = useRef(vA.current);
  const vWrite = useRef(vB.current);

  // keep props in refs so the loop doesn't need re-creation
  const presetRef  = useRef(preset);
  const cmapRef    = useRef(cmap);
  const stepsRef   = useRef(steps);
  const runRef     = useRef(running);
  const onStatRef  = useRef(onStats);
  const frameRef   = useRef(0);

  presetRef.current = preset;
  cmapRef.current   = cmap;
  stepsRef.current  = steps;
  runRef.current    = running;
  onStatRef.current = onStats;

  /* ── init ── */
  const init = useCallback(() => {
    uRead.current.fill(1);
    uWrite.current.fill(1);
    vRead.current.fill(0);
    vWrite.current.fill(0);
    const seeds = [[N/2,N/2],[N/4,N/4],[3*N/4,N/4],[N/4,3*N/4],[3*N/4,3*N/4],[N*0.6,N*0.3],[N*0.35,N*0.7]];
    seeds.forEach(([sy,sx]) => {
      for (let di=-9; di<9; di++) for (let dj=-9; dj<9; dj++) {
        const i=Math.floor(sy+di), j=Math.floor(sx+dj);
        if (i>=0&&i<N&&j>=0&&j<N&&di*di+dj*dj<81) {
          const idx=i*N+j;
          uRead.current[idx] = 0.5+(Math.random()-0.5)*0.25;
          vRead.current[idx] = 0.25+(Math.random()-0.5)*0.2;
        }
      }
    });
    frameRef.current = 0;
  }, []);

  /* ── expose inject + reset ── */
  useEffect(() => {
    injectRef.current = (x: number, y: number, clear: boolean) => {
      const ci = Math.round(y*N), cj = Math.round(x*N);
      for (let di=-7; di<7; di++) for (let dj=-7; dj<7; dj++) {
        const ii=(ci+di+N)%N, jj=(cj+dj+N)%N;
        const r2=di*di+dj*dj;
        if (r2<49) {
          const idx=ii*N+jj, str=(1-r2/49);
          if (clear) { uRead.current[idx]=1; vRead.current[idx]=0; }
          else       { vRead.current[idx]=Math.min(1, vRead.current[idx]+0.35*str); }
        }
      }
    };
    resetRef.current = () => { init(); };
  }, [injectRef, resetRef, init]);

  /* ── re-init when preset changes ── */
  useEffect(() => { init(); }, [preset, init]);

  /* ── main render loop ── */
  useEffect(() => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const oc = offRef.current; oc.width=N; oc.height=N;
    const oct = oc.getContext("2d")!;
    const imgData = oct.createImageData(N, N);
    const pix = imgData.data;

    const resize = () => {
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const r=cv.getBoundingClientRect();
      cv.width=r.width*dpr; cv.height=r.height*dpr;
      ctx.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);

    /* ── single Gray-Scott step ── */
    const step = () => {
      const p = presetRef.current;
      const ur = uRead.current, uw = uWrite.current;
      const vr = vRead.current, vw = vWrite.current;
      for (let i=0; i<N; i++) {
        const ip = ((i-1+N)%N)*N;
        const in_ = ((i+1)%N)*N;
        const iN = i*N;
        for (let j=0; j<N; j++) {
          const idx = iN+j;
          const u=ur[idx], v=vr[idx];
          const jl=(j-1+N)%N, jr=(j+1)%N;
          const lu = ur[ip+j]+ur[in_+j]+ur[iN+jl]+ur[iN+jr]-4*u;
          const lv = vr[ip+j]+vr[in_+j]+vr[iN+jl]+vr[iN+jr]-4*v;
          const uvv = u*v*v;
          const dU=0.20, dV=0.10;
          uw[idx] = Math.max(0,Math.min(1, u + dU*lu - uvv + p.F*(1-u)));
          vw[idx] = Math.max(0,Math.min(1, v + dV*lv + uvv - (p.F+p.k)*v));
        }
      }
      // swap read/write
      uRead.current  = uw; uWrite.current = ur;
      vRead.current  = vw; vWrite.current = vr;
    };

    const render = () => {
      rafRef.current = requestAnimationFrame(render);
      const r=cv.getBoundingClientRect(); const W=r.width, H=r.height;

      if (runRef.current) {
        for (let s=0; s<stepsRef.current; s++) step();
        frameRef.current++;
      }

      // render to ImageData
      let uSum=0, vSum=0;
      const ur=uRead.current, vr=vRead.current;
      const cm=cmapRef.current;
      for (let i=0; i<N; i++) for (let j=0; j<N; j++) {
        const idx=i*N+j;
        const u=ur[idx], v=vr[idx];
        uSum+=u; vSum+=v;
        const [r_,g_,b_]=mapColor(u,v,cm);
        const p=idx*4; pix[p]=r_; pix[p+1]=g_; pix[p+2]=b_; pix[p+3]=255;
      }
      oct.putImageData(imgData,0,0);
      ctx.imageSmoothingEnabled=false;
      ctx.drawImage(oc,0,0,W,H);

      // equation watermark
      ctx.font=`7px ${mono}`; ctx.textAlign="right"; ctx.fillStyle="rgba(255,255,255,0.07)";
      ctx.fillText("∂U/∂t = D_U∇²U − UV² + F(1−U)", W-8, H-18);
      ctx.fillText("∂V/∂t = D_V∇²V + UV² − (F+k)V",  W-8, H-6);

      if (frameRef.current%5===0) {
        onStatRef.current({ uMean:uSum/(N*N), vMean:vSum/(N*N), frame:frameRef.current });
      }
    };

    init();
    render();
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize",resize); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onPointer = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.buttons===0 || !injectRef.current) return;
    const r=e.currentTarget.getBoundingClientRect();
    injectRef.current(
      (e.clientX-r.left)/r.width,
      (e.clientY-r.top)/r.height,
      e.altKey,
    );
  };

  return (
    <canvas ref={canvasRef}
      onMouseDown={onPointer} onMouseMove={onPointer}
      style={{ display:"block", width:"100%", height:"100%",
        cursor:"crosshair", imageRendering:"pixelated" }} />
  );
}

/* ═══════════════════════ MAIN PAGE ═══════════════════════ */
function RdSimulatorHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      const cols=45,rows=7;
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        const x=c/cols*W,y=r/rows*H;
        const u=0.5+0.5*Math.sin(x*0.04+t*0.04)*Math.cos(y*0.06+t*0.03);
        const v=0.5+0.5*Math.cos(x*0.06-t*0.03)*Math.sin(y*0.04+t*0.025);
        const ru=Math.round(u*120),gu=Math.round(v*200),bu=Math.round((1-u)*180);
        ctx.fillStyle=`rgba(${ru},${gu},${bu},0.7)`;
        ctx.fillRect(x,y,W/cols+0.5,H/rows+0.5);
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("REACTION-DIFFUSION SIMULATOR · TURING PATTERNS · MORPHOGENESIS · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function RdSimulatorPage() {
  const [presetIdx, setPresetIdx] = useState(0);
  const [cmap, setCmap]     = useState<CMap>("coherence");
  const [running, setRunning] = useState(true);
  const [steps, setSteps]   = useState(8);
  const [stats, setStats]   = useState({ uMean:1, vMean:0, frame:0 });
  const injectRef = useRef<((x:number,y:number,c:boolean)=>void)|null>(null);
  const resetRef  = useRef<(()=>void)|null>(null);

  const preset = PRESETS[presetIdx];
  const phi    = 0.6180339887;
  const vNorm  = Math.min(1, stats.vMean / 0.18);

  const handleStats = useCallback((s:{uMean:number;vMean:number;frame:number})=>setStats(s),[]);

  const panelBox: React.CSSProperties = {
    background:PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px", marginBottom:8, position:"relative",
  };
  const topLine = (c=GOLD) => (
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
      background:`linear-gradient(90deg,${c},transparent)`,opacity:0.4 }} />
  );
  const SH = ({label,color=GOLD}:{label:string;color?:string}) => (
    <div style={{ fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",
      color,marginBottom:6,borderBottom:`1px solid ${BORDER}`,paddingBottom:3 }}>
      {label}
    </div>
  );

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono,
      display:"flex", flexDirection:"column" }}>
      {/* ── HEADER ── */}
      <div style={{ padding:"8px 16px 6px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(2,4,8,0.99)", flexShrink:0, position:"relative" }}>
        <div style={{ position:"absolute",bottom:0,left:0,right:0,height:1,
          background:`linear-gradient(90deg,transparent,${BIO},${GOLD},${VIO},${CLM},transparent)`,
          opacity:0.5 }} />
        <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
          <div style={{ flexShrink:0 }}>
            <div style={{ fontSize:6.5, letterSpacing:"0.2em", color:GOLD, marginBottom:1 }}>
              AETHER · REACTION-DIFFUSION · GRAY-SCOTT · TURING PATTERNS · MORPHOGENETIC FIELD
            </div>
            <div style={{ fontFamily:serif, fontSize:16, letterSpacing:2, color:"#fff" }}>
              MORPHOGENETIC FIELD SIMULATOR
            </div>
          </div>
          {/* Preset tabs */}
          <div style={{ display:"flex", gap:3, flexWrap:"wrap", flex:1 }}>
            {PRESETS.map((p,i) => (
              <button key={p.name} onClick={()=>setPresetIdx(i)} style={{
                padding:"4px 9px", fontFamily:mono, fontSize:7.5, cursor:"pointer",
                borderRadius:2, transition:"all 0.12s",
                border:`1px solid ${presetIdx===i?p.color:BORDER}`,
                background:presetIdx===i?`${p.color}22`:"transparent",
                color:presetIdx===i?p.color:MUTED }}>
                {p.name}
              </button>
            ))}
          </div>
          {/* Controls */}
          <div style={{ display:"flex", gap:6, alignItems:"center", flexShrink:0 }}>
            <button onClick={()=>setRunning(r=>!r)} style={{
              padding:"4px 10px", fontFamily:mono, fontSize:7.5, cursor:"pointer",
              border:`1px solid ${running?GOLD:BORDER}`, borderRadius:2,
              background:running?`${GOLD}20`:"transparent", color:running?GOLD:MUTED }}>
              {running?"⏸":"▶"} {running?"PAUSE":"RUN"}
            </button>
            <button onClick={()=>resetRef.current?.()} style={{
              padding:"4px 10px", fontFamily:mono, fontSize:7.5, cursor:"pointer",
              border:`1px solid ${BORDER}`, borderRadius:2, background:"transparent", color:MUTED }}>
              ↺ RESET
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:5 }}>
              <span style={{ fontSize:7, color:MUTED }}>SPEED</span>
              <input type="range" min={1} max={20} value={steps}
                onChange={e=>setSteps(+e.target.value)}
                style={{ width:55, accentColor:GOLD }} />
              <span style={{ fontSize:7.5, color:GOLD, minWidth:20 }}>{steps}×</span>
            </div>
            <div style={{ fontSize:7, color:MUTED, minWidth:60 }}>
              frame <span style={{ color:TEXT }}>{stats.frame.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ flex:1, display:"grid", gridTemplateColumns:"200px 1fr 232px",
        gap:8, padding:"8px 16px 10px", minHeight:0 }}>

        {/* ══ LEFT ══ */}
        <div style={{ overflowY:"auto", display:"flex", flexDirection:"column", gap:0 }}>

          {/* Color maps */}
          <div style={panelBox}>
            {topLine()}
            <SH label="Color Map" />
            {CMAPS.map(([id,label,c]) => (
              <button key={id} onClick={()=>setCmap(id)} style={{
                display:"block", width:"100%", padding:"5px 8px", marginBottom:3,
                fontFamily:mono, fontSize:7.5, textAlign:"left", cursor:"pointer",
                border:`1px solid ${cmap===id?c:BORDER}`, borderRadius:2,
                background:cmap===id?`${c}18`:"transparent",
                color:cmap===id?c:MUTED, transition:"all 0.12s" }}>
                ■ {label}
              </button>
            ))}
          </div>

          {/* Live stats */}
          <div style={panelBox}>
            {topLine(CLM)}
            <SH label="Live Statistics" color={CLM} />
            {[
              ["U (activator)", stats.uMean, 1,    BIO],
              ["V (inhibitor)", stats.vMean, 0.18, VIO],
            ].map(([label, val, max, c]) => (
              <div key={label as string} style={{ marginBottom:8 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <span style={{ fontSize:7, color:MUTED }}>{label}</span>
                  <span style={{ fontSize:7.5, color:c as string }}>{(val as number).toFixed(4)}</span>
                </div>
                <div style={{ height:5, background:DIM, borderRadius:2 }}>
                  <div style={{ height:"100%", borderRadius:2, transition:"width 0.3s",
                    background:c as string,
                    width:`${Math.min(100,(val as number)/(max as number)*100)}%` }} />
                </div>
              </div>
            ))}
            {/* φ coherence track */}
            <div style={{ marginBottom:4 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                <span style={{ fontSize:7, color:MUTED }}>C* = φ⁻¹ proximity</span>
                <span style={{ fontSize:7.5, color:vNorm>0.618?GOLD:MUTED }}>
                  {vNorm>0.618?"✦ ACTIVE":"—"}
                </span>
              </div>
              <div style={{ height:5, background:DIM, borderRadius:2, position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", height:"100%", borderRadius:2, transition:"width 0.3s",
                  background:vNorm>0.618?`linear-gradient(90deg,${VIO},${GOLD})`:`linear-gradient(90deg,${MUTED},${VIO}40)`,
                  width:`${vNorm*100}%` }} />
                <div style={{ position:"absolute", top:0, left:`${phi*100}%`,
                  width:1, height:"100%", background:GOLD+"80" }} />
              </div>
              <div style={{ display:"flex", justifyContent:"flex-end", marginTop:1 }}>
                <span style={{ fontSize:6, color:GOLD+"60" }}>φ⁻¹={phi.toFixed(3)}</span>
              </div>
            </div>
          </div>

          {/* Equations */}
          <div style={panelBox}>
            {topLine(AMB)}
            <SH label="Gray-Scott Equations" color={AMB} />
            <div style={{ padding:"6px 8px", background:`${AMB}08`,
              border:`1px solid ${AMB}20`, borderRadius:2, marginBottom:7 }}>
              <div style={{ fontFamily:serif, fontSize:8.5, color:AMB, lineHeight:2, letterSpacing:0.2 }}>
                ∂U/∂t = D_U∇²U − UV² + F(1−U)<br/>
                ∂V/∂t = D_V∇²V + UV² − (F+k)V
              </div>
            </div>
            <div style={{ fontFamily:body, fontSize:9.5, color:TEXT, lineHeight:1.75, marginBottom:5 }}>
              <span style={{ color:BIO }}>U</span> = activator · slow diff.<br/>
              <span style={{ color:VIO }}>V</span> = inhibitor · fast diff.<br/>
              <span style={{ color:GOLD }}>F</span> = feed rate · <span style={{ color:ROSE }}>k</span> = kill rate
            </div>
            <div style={{ padding:"5px 7px", background:`${GOLD}06`,
              border:`1px solid ${GOLD}20`, borderRadius:2 }}>
              <div style={{ fontSize:6.5, color:GOLD, marginBottom:2 }}>AETHER MAPPING</div>
              <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.7 }}>
                U → coherence activator A(x,t)<br/>
                V → decoherence inhibitor B(x,t)<br/>
                F → synchronisation S(x,t)<br/>
                k → decoherence rate β<br/>
                Pattern → field C(x,t)
              </div>
            </div>
          </div>

          {/* Interaction help */}
          <div style={{ ...panelBox, border:`1px solid ${CLM}30` }}>
            {topLine(CLM)}
            <SH label="Interaction" color={CLM} />
            <div style={{ fontSize:8, color:MUTED, lineHeight:1.9 }}>
              <span style={{ color:CLM }}>Click + drag</span> — inject V (grows pattern)<br/>
              <span style={{ color:AMB }}>Alt + drag</span> — clear region (erase)<br/>
              <span style={{ color:GOLD }}>RESET</span> — reinitialise with seeds
            </div>
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div style={{ display:"flex", flexDirection:"column", gap:7, minHeight:0 }}>
          {/* Simulation canvas (takes remaining height) */}
          <div style={{ flex:1, minHeight:0, background:"#000",
            border:`1px solid ${preset.color}50`, borderRadius:2,
            position:"relative", overflow:"hidden" }}>
            <SimCanvas
              preset={preset} cmap={cmap} steps={steps}
              running={running} onStats={handleStats}
              injectRef={injectRef} resetRef={resetRef} />
            {/* Preset overlay */}
            <div style={{ position:"absolute", top:8, left:10, pointerEvents:"none" }}>
              <div style={{ fontFamily:serif, fontSize:12, color:preset.color+"cc",
                letterSpacing:1 }}>{preset.name}</div>
              <div style={{ fontSize:6.5, color:preset.color+"60", marginTop:1 }}>{preset.label}</div>
            </div>
            {/* Parameter display */}
            <div style={{ position:"absolute", top:8, right:10, textAlign:"right",
              fontFamily:mono, fontSize:6.5, color:TEXT+"35", pointerEvents:"none", lineHeight:1.8 }}>
              <div>F={preset.F}</div><div>k={preset.k}</div>
              <div>D_U=0.20</div><div>D_V=0.10</div>
            </div>
            {/* φ active badge */}
            {vNorm>0.618 && (
              <div style={{ position:"absolute", bottom:30, left:10, pointerEvents:"none",
                fontFamily:serif, fontSize:8.5, color:GOLD+"cc" }}>
                ✦ C* = φ⁻¹ coherence active
              </div>
            )}
          </div>
          {/* Preset description bar */}
          <div style={{ ...panelBox, marginBottom:0, padding:"8px 12px" }}>
            {topLine(preset.color)}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <div style={{ fontSize:6.5, color:MUTED, marginBottom:2 }}>PATTERN</div>
                <div style={{ fontFamily:body, fontSize:10.5, color:TEXT, lineHeight:1.75 }}>{preset.desc}</div>
              </div>
              <div style={{ padding:"6px 9px", background:`${preset.color}06`,
                border:`1px solid ${preset.color}20`, borderRadius:2 }}>
                <div style={{ fontSize:6.5, color:preset.color, marginBottom:2 }}>AETHER ROLE</div>
                <div style={{ fontFamily:body, fontSize:10.5, color:TEXT, lineHeight:1.75 }}>{preset.aetherRole}</div>
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div style={{ overflowY:"auto", display:"flex", flexDirection:"column", gap:0 }}>

          {/* All presets */}
          <div style={panelBox}>
            {topLine(VIO)}
            <SH label="All Presets · F-k Phase Map" color={VIO} />
            {PRESETS.map((p,i) => (
              <div key={p.name} onClick={()=>setPresetIdx(i)} style={{
                padding:"5px 8px", marginBottom:4, cursor:"pointer",
                background:presetIdx===i?`${p.color}12`:"transparent",
                border:`1px solid ${presetIdx===i?p.color:BORDER}`,
                borderRadius:2, transition:"all 0.12s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:1 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:p.color }}>{p.name}</div>
                  <div style={{ fontSize:6.5, color:MUTED }}>F={p.F} k={p.k}</div>
                </div>
                <div style={{ fontSize:7, color:MUTED }}>{p.label}</div>
              </div>
            ))}
          </div>

          {/* Turing theory */}
          <div style={panelBox}>
            {topLine(BIO)}
            <SH label="Turing Instability" color={BIO} />
            {[
              [BIO,  "D_V > D_U",        "Inhibitor diffuses faster than activator — the key asymmetry. Activator is trapped locally; inhibitor spreads to suppress competing peaks."],
              [GOLD, "Instability",       "A perturbation grows at wavelength λ* ∝ √(D_U·D_V). That wavelength becomes the pattern spacing — no template required."],
              [VIO,  "Self-Organisation", "Coral coats, coral morphology, lung branching — all the same equation. Pattern emerges purely from local chemistry + diffusion."],
              [CLM,  "K Preservation",   "The pattern IS the coherence field C(x,t). The Integration Constant K = Φ(E,S) is conserved as the pattern evolves."],
            ].map(([c,t,d])=>(
              <div key={t as string} style={{ marginBottom:5, padding:"5px 7px",
                borderLeft:`2px solid ${(c as string)}40`, background:`${(c as string)}04` }}>
                <div style={{ fontSize:7, fontWeight:"bold", color:c as string, marginBottom:1 }}>{t}</div>
                <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.55 }}>{d}</div>
              </div>
            ))}
          </div>

          {/* AETHER connections */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}30` }}>
            {topLine()}
            <SH label="AETHER System Connections" />
            {[
              [BIO,  "SOI Building",    "∂A/∂t = D_A∇²A + f(A,B) governs kinetic building floor topology. LABYRINTH preset IS the SOI corridor self-organisation."],
              [CLM,  "Seamoss Gate",    "Ionic pattern formation in κ-carrageenan. NODE ARRAY preset maps K⁺/Ca²⁺ ion concentration standing waves."],
              [VIO,  "Bioluminescence", "U = luciferase concentration · V = product inhibition. CORAL preset traces seamoss bioluminescent growth morphology."],
              [GOLD, "Coherence Field", "Spots = C* crystallisation nodes · Labyrinths = coupled coherence domains · Spirals = torsion resonator cross-section."],
              [ROSE, "Engine Computer", "Each step fires one Newton-Raphson combustion stroke — recursive correction driving UV² toward equilibrium."],
            ].map(([c,t,d])=>(
              <div key={t as string} style={{ marginBottom:5, padding:"5px 7px",
                background:`${(c as string)}06`, border:`1px solid ${(c as string)}18`, borderRadius:2 }}>
                <div style={{ fontSize:7, color:c as string, fontWeight:"bold", marginBottom:1 }}>{t}</div>
                <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

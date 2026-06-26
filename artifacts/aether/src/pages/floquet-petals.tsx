import { useEffect, useRef, useState } from "react";

/* ── palette ───────────────────────────────────────────────── */
const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  green:"#44CC77", dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
  shock:"#FFDD22", photon:"#00FFBB", cyan:"#22DDFF",
};
const MONO  = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP  = "'Cinzel',serif";

/* ── Mode definitions ──────────────────────────────────────── */
const MODES = [
  { m:5, col:V.aurora, sym:"C₅", hz:"5Ω", name:"Pentatopic",
    desc:"Five-fold pentagonal symmetry. Localized energy at 5 antipodal antinode lobes. Quasicrystal-like — cannot tile flat space but tiles the torus." },
  { m:6, col:V.gold,   sym:"C₆", hz:"6Ω", name:"Hexatopic",
    desc:"Hexagonal. Closest-packed mode — mirrors natural honeycomb and Brillouin zone geometry. Most uniform energy distribution around the torus." },
  { m:7, col:V.vio,    sym:"C₇", hz:"7Ω", name:"Heptatopic",
    desc:"Heptagonal asymmetry. Not commensurate with C₆ — creates richer interference when superposed. Less common in crystallography, frequent in biology." },
  { m:8, col:V.rose,   sym:"C₈", hz:"8Ω", name:"Octatopic",
    desc:"Octagonal balance. 8 = 2³ gives alternating inward/outward wave channels. Appears in standing-wave resonators. Even mode → nodes at cardinal angles." },
  { m:9, col:V.cyan,   sym:"C₉", hz:"9Ω", name:"Nonatopic",
    desc:"Triple-triad (3×3). Dense nodal network with complex rotational harmonics. Strongest energy concentration at petal tips among the five modes." },
];

/* ── Tag ───────────────────────────────────────────────────── */
function Tag({ l, c }: { l:string; c:string }) {
  return (
    <span style={{
      display:"inline-block", padding:"2px 8px", margin:"0 4px 4px 0",
      background:c+"22", border:`1px solid ${c}44`,
      borderRadius:3, fontFamily:MONO, fontSize:9, color:c, letterSpacing:"0.12em",
    }}>{l}</span>
  );
}

/* ── hex alpha helper ──────────────────────────────────────── */
function ha(v:number): string {
  return Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0");
}

/* ── Toroidal Floquet Canvas ───────────────────────────────── */
function TorusCanvas({
  mIdx, speed, traveling, showFlow, superpose,
}: {
  mIdx:number; speed:number; traveling:boolean; showFlow:boolean; superpose:boolean;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const st  = useRef({ mIdx, speed, traveling, showFlow, superpose });
  useEffect(() => { st.current = { mIdx, speed, traveling, showFlow, superpose }; },
    [mIdx, speed, traveling, showFlow, superpose]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height, CX = W/2, CY = H/2;
    const RT = Math.min(W,H) * 0.32;
    const RB = Math.min(W,H) * 0.065;
    const RA = Math.min(W,H) * 0.048;
    const NRING = 220;
    let t = 0;

    /* particle positions (φ around ring) */
    const NPART = 50;
    const parts: number[] = [];
    for (let i=0; i<NPART; i++) parts.push((i/NPART)*Math.PI*2);

    function amp(phi:number, tt:number, m:number, sp:number, trav:boolean): number {
      if (trav) return Math.cos(m*phi - m*tt*sp*0.28);
      return Math.cos(m*phi) * Math.cos(m*tt*sp*0.28);
    }

    function superAmp(phi:number, tt:number, sp:number, trav:boolean): number {
      let s = 0;
      for (let i=0; i<MODES.length; i++) {
        s += amp(phi, tt, MODES[i].m, sp, trav);
      }
      return s / MODES.length;
    }

    function drawGrid(tt:number) {
      const { mIdx:mi, speed:sp, traveling:tr, superpose:sup } = st.current;
      const GN = 20;
      const pts: number[] = [];
      for (let i=0; i<=GN; i++) {
        for (let j=0; j<=GN; j++) {
          const u = (i/GN)*W, v = (j/GN)*H;
          const gx = u-CX, gy = v-CY;
          const dist = Math.sqrt(gx*gx+gy*gy);
          const phi  = Math.atan2(gy,gx);
          const dT   = Math.abs(dist-RT);
          const a    = sup ? superAmp(phi,tt,sp,tr) : amp(phi,tt,MODES[mi].m,sp,tr);
          const str  = 6*(a+1)/2*Math.exp(-dT*dT/(2*(RB*2.5)*(RB*2.5)));
          let dx=0, dy=0;
          if (isFinite(str)&&dist>1) { dx=str*gx/dist; dy=str*gy/dist; }
          pts.push(u+dx, v+dy);
        }
      }
      ctx.strokeStyle = V.dim+"26"; ctx.lineWidth = 0.4;
      const G1 = GN+1;
      for (let i=0; i<=GN; i++) {
        ctx.beginPath();
        for (let j=0; j<=GN; j++) {
          const bi=(i*G1+j)*2;
          j===0?ctx.moveTo(pts[bi],pts[bi+1]):ctx.lineTo(pts[bi],pts[bi+1]);
        }
        ctx.stroke();
      }
      for (let j=0; j<=GN; j++) {
        ctx.beginPath();
        for (let i=0; i<=GN; i++) {
          const bi=(i*G1+j)*2;
          i===0?ctx.moveTo(pts[bi],pts[bi+1]):ctx.lineTo(pts[bi],pts[bi+1]);
        }
        ctx.stroke();
      }
    }

    function drawTorus(tt:number) {
      const { mIdx:mi, speed:sp, traveling:tr, superpose:sup } = st.current;
      const col = sup ? V.aurora : MODES[mi].col;
      const m   = MODES[mi].m;

      for (let i=0; i<NRING; i++) {
        const phi = (i/NRING)*Math.PI*2;
        const a   = sup ? superAmp(phi,tt,sp,tr) : amp(phi,tt,m,sp,tr);
        const r   = RB + RA*(a+1)/2;
        const x   = CX + RT*Math.cos(phi);
        const y   = CY + RT*Math.sin(phi);
        if (!isFinite(x)||!isFinite(y)||!isFinite(r)) continue;

        const bright = (a+1)/2;

        /* inner glow for high-amplitude petals */
        if (bright > 0.6) {
          const gw = ctx.createRadialGradient(x,y,0,x,y,r*1.6);
          gw.addColorStop(0, col+ha(bright*80));
          gw.addColorStop(1, col+"00");
          ctx.beginPath(); ctx.arc(x,y,r*1.6,0,Math.PI*2);
          ctx.fillStyle = gw; ctx.fill();
        }

        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle = col+ha(bright*200+40);
        ctx.fill();

        /* petal outline */
        if (bright > 0.5) {
          ctx.strokeStyle = col+ha(bright*160);
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }

      /* antinodes: bright tips with label */
      if (!sup) {
        for (let p=0; p<m; p++) {
          const phi = tr
            ? (p/m)*Math.PI*2 - m*tt*sp*0.28/m
            : (p/m)*Math.PI*2;
          const a = amp(phi,tt,m,sp,tr);
          if (a < 0.7) continue;
          const r = RB + RA*(a+1)/2;
          const x = CX + RT*Math.cos(phi);
          const y = CY + RT*Math.sin(phi);
          if (!isFinite(x)||!isFinite(y)) continue;
          ctx.fillStyle = col+ha((a+1)/2*200+55);
          ctx.font = `7px ${MONO}`; ctx.textAlign = "center";
          const lx = CX+(RT+r+8)*Math.cos(phi);
          const ly = CY+(RT+r+8)*Math.sin(phi);
          if (isFinite(lx)&&isFinite(ly)) ctx.fillText(`p${p+1}`,lx,ly);
        }
      }
    }

    function drawFlow(tt:number) {
      const { mIdx:mi, speed:sp, traveling:tr, superpose:sup } = st.current;
      const col = sup ? V.aurora : MODES[mi].col;
      const m   = MODES[mi].m;
      for (let i=0; i<NPART; i++) {
        const phi = parts[i];
        const a   = sup ? superAmp(phi,tt,sp,tr) : amp(phi,tt,m,sp,tr);
        const flowV = 0.003*sp*(1+(a+1)*1.8);
        parts[i] = (parts[i]+flowV)%(Math.PI*2);
        const r  = RT;
        const x  = CX+r*Math.cos(parts[i]);
        const y  = CY+r*Math.sin(parts[i]);
        if (!isFinite(x)||!isFinite(y)) continue;
        const bright=(a+1)/2;
        ctx.beginPath(); ctx.arc(x,y,2,0,Math.PI*2);
        ctx.fillStyle = col+ha(bright*220+30); ctx.fill();
      }
    }

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle="#010308"; ctx.fillRect(0,0,W,H);

      drawGrid(t);
      drawTorus(t);
      if (st.current.showFlow) drawFlow(t);

      /* center void */
      const cg = ctx.createRadialGradient(CX,CY,0,CX,CY,RT*0.62);
      cg.addColorStop(0,"#010308F8"); cg.addColorStop(0.7,"#010308CC"); cg.addColorStop(1,"#01030800");
      ctx.beginPath(); ctx.arc(CX,CY,RT*0.62,0,Math.PI*2);
      ctx.fillStyle = cg; ctx.fill();

      /* center labels */
      const { mIdx:mi, superpose:sup, traveling:tr } = st.current;
      const col = sup ? V.aurora : MODES[mi].col;
      const m   = sup ? "5+6+7+8+9" : String(MODES[mi].m);
      ctx.textAlign="center";
      ctx.fillStyle=col; ctx.font=`10px ${MONO}`;
      ctx.fillText(`m = ${m}`, CX, CY-7);
      ctx.fillStyle=V.ink+"55"; ctx.font=`8px ${MONO}`;
      ctx.fillText("AZIMUTHAL MODE", CX, CY+7);

      /* top-left HUD */
      ctx.textAlign="left"; ctx.fillStyle=col; ctx.font=`9px ${MONO}`;
      ctx.fillText(
        sup ? "SUPERPOSED · m=5,6,7,8,9" : `FLOQUET m=${MODES[mi].m} · ω=${MODES[mi].hz}`,
        10, 16
      );
      ctx.fillStyle=V.ink+"55"; ctx.font=`8px ${MONO}`;
      ctx.fillText(tr?"TRAVELING WAVE · A(φ,t)=cos(mφ−mΩt)":"STANDING WAVE · A(φ,t)=cos(mφ)cos(mΩt)", 10, 29);

      /* torus ring outline (thin guide) */
      ctx.beginPath(); ctx.arc(CX,CY,RT,0,Math.PI*2);
      ctx.strokeStyle=V.dim+"33"; ctx.lineWidth=0.5; ctx.stroke();
    }

    function loop() { t+=0.010; draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={720} height={520}
      style={{ width:"100%", height:520, display:"block", borderRadius:4 }}/>
  );
}

/* ── Mini torus (mode strip) ───────────────────────────────── */
function MiniTorus({ m, col, speed, traveling }:
  { m:number; col:string; speed:number; traveling:boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const st  = useRef({ speed, traveling });
  useEffect(() => { st.current = { speed, traveling }; }, [speed, traveling]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height, CX = W/2, CY = H/2;
    const RT = Math.min(W,H)*0.30, RB = Math.min(W,H)*0.06, RA = Math.min(W,H)*0.04;
    const N = 160;
    let t = 0;
    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle="#010308"; ctx.fillRect(0,0,W,H);
      for (let i=0; i<N; i++) {
        const phi = (i/N)*Math.PI*2;
        const { speed:sp, traveling:tr } = st.current;
        const a  = tr ? Math.cos(m*phi-m*t*sp*0.28) : Math.cos(m*phi)*Math.cos(m*t*sp*0.28);
        const r  = RB+RA*(a+1)/2;
        const x  = CX+RT*Math.cos(phi), y = CY+RT*Math.sin(phi);
        if (!isFinite(x)||!isFinite(y)) continue;
        const br = (a+1)/2;
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
        ctx.fillStyle = col+ha(br*200+40); ctx.fill();
      }
      const cg=ctx.createRadialGradient(CX,CY,0,CX,CY,RT*0.58);
      cg.addColorStop(0,"#010308F5"); cg.addColorStop(1,"#01030800");
      ctx.beginPath(); ctx.arc(CX,CY,RT*0.58,0,Math.PI*2);
      ctx.fillStyle=cg; ctx.fill();
      ctx.fillStyle=col; ctx.font=`8px ${MONO}`; ctx.textAlign="center";
      ctx.fillText(`m=${m}`, CX, CY+3);
    }
    function loop() { t+=0.010; draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, [m, col]);

  return (
    <canvas ref={ref} width={120} height={120}
      style={{ width:120, height:120, display:"block", borderRadius:3 }}/>
  );
}

/* ── Mode shape strip (unwrapped torus, φ vs amplitude) ─────── */
function ShapeCanvas({ mIdx, speed, traveling }:
  { mIdx:number; speed:number; traveling:boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const st  = useRef({ mIdx, speed, traveling });
  useEffect(() => { st.current = { mIdx, speed, traveling }; }, [mIdx, speed, traveling]);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    const PAD = { l:36, r:12, t:16, b:28 };
    const IW = W-PAD.l-PAD.r, IH = H-PAD.t-PAD.b;
    let t = 0;
    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle="#010308"; ctx.fillRect(0,0,W,H);

      /* axis */
      ctx.strokeStyle=V.dim+"44"; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(PAD.l,PAD.t); ctx.lineTo(PAD.l,PAD.t+IH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(PAD.l,PAD.t+IH/2); ctx.lineTo(PAD.l+IW,PAD.t+IH/2); ctx.stroke();

      /* grid */
      const { mIdx:mi, speed:sp, traveling:tr } = st.current;
      const { m, col } = MODES[mi];
      for (let p=0; p<=m; p++) {
        const x = PAD.l + (p/m)*IW;
        ctx.beginPath(); ctx.moveTo(x,PAD.t); ctx.lineTo(x,PAD.t+IH);
        ctx.strokeStyle=col+"22"; ctx.lineWidth=0.4; ctx.stroke();
      }

      /* wave envelope (spatial pattern) */
      ctx.beginPath();
      for (let i=0; i<=200; i++) {
        const phi = (i/200)*Math.PI*2;
        const a = Math.cos(m*phi); /* pure spatial pattern */
        const x = PAD.l+(phi/(Math.PI*2))*IW;
        const y = PAD.t+IH/2 - a*(IH/2)*0.8;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle=col+"44"; ctx.lineWidth=1; ctx.stroke();

      /* traveling wave at current time */
      ctx.beginPath();
      for (let i=0; i<=200; i++) {
        const phi = (i/200)*Math.PI*2;
        const a = tr ? Math.cos(m*phi-m*t*sp*0.28)
                     : Math.cos(m*phi)*Math.cos(m*t*sp*0.28);
        const x = PAD.l+(phi/(Math.PI*2))*IW;
        const y = PAD.t+IH/2 - a*(IH/2)*0.8;
        i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.stroke();

      /* shade antinodes */
      for (let p=0; p<m; p++) {
        const phi0 = (p/m)*Math.PI*2 - Math.PI/(2*m);
        const phi1 = (p/m)*Math.PI*2 + Math.PI/(2*m);
        const x0 = PAD.l+(phi0/(Math.PI*2))*IW;
        const x1 = PAD.l+(phi1/(Math.PI*2))*IW;
        const a = tr ? Math.cos(m*((phi0+phi1)/2)-m*t*sp*0.28)
                     : Math.cos(m*((phi0+phi1)/2))*Math.cos(m*t*sp*0.28);
        ctx.fillStyle = col+ha((a+1)/2*60);
        ctx.fillRect(x0,PAD.t,Math.max(0,x1-x0),IH);
      }

      /* axis labels */
      ctx.fillStyle=V.ink+"55"; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
      ctx.fillText("φ = 0",   PAD.l,     PAD.t+IH+16);
      ctx.fillText("π",       PAD.l+IW/2,PAD.t+IH+16);
      ctx.fillText("2π",      PAD.l+IW,  PAD.t+IH+16);
      ctx.textAlign="right";
      ctx.fillText("+1",PAD.l-2,PAD.t+5);
      ctx.fillText("0", PAD.l-2,PAD.t+IH/2+4);
      ctx.fillText("-1",PAD.l-2,PAD.t+IH);
      ctx.fillStyle=col+"88"; ctx.textAlign="left";
      ctx.fillText(`A(φ,t) = cos(${m}φ${tr?`−${m}Ωt`:""})`+
                   (tr?"":" · cos("+m+"Ωt)"), PAD.l+4, PAD.t+11);
    }
    function loop() { t+=0.010; draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <canvas ref={ref} width={700} height={130}
      style={{ width:"100%", height:130, display:"block", borderRadius:4 }}/>
  );
}

/* ── Main Page ─────────────────────────────────────────────── */
export default function FloquetPetalsPage() {
  const [mIdx,       setMIdx]       = useState(0);
  const [speed,      setSpeed]      = useState(1.0);
  const [traveling,  setTraveling]  = useState(true);
  const [showFlow,   setShowFlow]   = useState(true);
  const [superpose,  setSuperpose]  = useState(false);

  const cur = MODES[mIdx];

  const THEORY = [
    { t:"TOROIDAL STANDING WAVE", c:V.aurora,
      b:"Begin with a torus supporting a standing wave in the azimuthal direction φ. The wave A(φ,t) = cos(mφ)cos(mΩt) creates m fixed antinodes (petal tips) and m nodal lines. Energy density is highest at antinodes, zero at nodes. The torus cross-section bulges at each antinode." },
    { t:"FLOQUET DRIVE", c:V.gold,
      b:"Apply a periodic driving at frequency Ω. The Floquet theorem guarantees that solutions take the form ψ(t) = e^{iεt/ℏ} u(t), where u has period T=2π/Ω. The quasi-energy ε encodes the topological character of each azimuthal mode. At resonance, the drive locks the mode frequency to mΩ." },
    { t:"TRAVELING WAVE MODE", c:V.vio,
      b:"A chiral Floquet mode breaks time-reversal symmetry: A(φ,t) = cos(mφ − mΩt). The m-petal pattern rotates at angular velocity Ω around the torus. This is the topologically non-trivial phase — the rotating petals carry a Chern number equal to the winding number m." },
    { t:"NODAL ENERGY FLOW", c:V.rose,
      b:"In traveling-wave mode, the Poynting vector (energy flux) circulates azimuthally. Energy flows fastest through antinode regions (bright petal tips) and slowest through nodes. Energy-flow particles in the simulation ride this gradient — clustering at petals, spreading at nodes." },
    { t:"SUPERPOSITION & BEAT FREQUENCIES", c:V.cyan,
      b:"When all five modes (m=5,6,7,8,9) are superposed, they interfere to produce amplitude beats at difference frequencies: |6−5|=Ω, |7−6|=Ω, |8−7|=Ω, |9−8|=Ω. The composite pattern never exactly repeats until LCM(5,6,7,8,9)=2520 base periods have elapsed." },
  ];

  return (
    <div style={{ background:V.bg, minHeight:"100vh", color:V.ink,
      fontFamily:MONO, paddingBottom:80 }}>

      {/* breadcrumb */}
      <div style={{ padding:"10px 24px", borderBottom:`1px solid ${V.dim}44`,
        display:"flex", flexWrap:"wrap", gap:4 }}>
        {[
          ["FLOQUET PETALS",V.aurora],["TOROIDAL MODES",V.gold],
          ["AZIMUTHAL m=5–9",V.vio],["SPACETIME SHAPING",V.rose],
          ["TRAVELING WAVE",V.cyan],["FLOQUET TOPOLOGY",V.blue],["AETHER",V.plasma],
        ].map(([l,c]) => <Tag key={l} l={l} c={c}/>)}
      </div>

      <div style={{ padding:"44px 32px 20px", maxWidth:980, margin:"0 auto" }}>
        <div style={{ fontFamily:MONO, fontSize:10, color:V.aurora,
          letterSpacing:"0.2em", marginBottom:12 }}>
          LIVE SIMULATION · TOROIDAL FLOQUET TOPOLOGY
        </div>
        <h1 style={{ fontFamily:DISP, fontSize:"clamp(22px,4vw,44px)",
          color:V.ink, margin:"0 0 16px", lineHeight:1.1 }}>
          Floquet Floral Topology<br/>
          <span style={{ color:V.aurora+"BB", fontSize:"0.6em" }}>
            Azimuthal Modes m = 5 · 6 · 7 · 8 · 9 on a Driven Torus
          </span>
        </h1>
        <p style={{ fontFamily:SERIF, fontSize:15, color:V.ink+"99",
          lineHeight:1.75, maxWidth:700, margin:"0 0 6px" }}>
          A toroidal standing wave driven at frequency Ω develops petal-like
          azimuthal resonances — m antinodes equally spaced around the torus
          circumference. Each mode m corresponds to a distinct Floquet quasi-energy
          and winding number. In the traveling-wave phase, the petal pattern rotates,
          carrying topological energy flow between lobes.
        </p>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"0 32px" }}>

        {/* controls */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, alignItems:"center",
          padding:"12px 16px", background:V.dim+"18",
          border:`1px solid ${V.dim}44`, borderRadius:4, marginBottom:4 }}>

          {/* mode buttons */}
          <div style={{ display:"flex", gap:6 }}>
            {MODES.map((r,i) => (
              <button key={r.m} onClick={() => { setMIdx(i); setSuperpose(false); }}
                style={{
                  background: (!superpose&&mIdx===i) ? r.col+"28" : "transparent",
                  border: `1px solid ${(!superpose&&mIdx===i) ? r.col : V.dim}`,
                  color: (!superpose&&mIdx===i) ? r.col : V.ink+"44",
                  fontFamily:MONO, fontSize:9, padding:"5px 12px",
                  cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
                }}>m={r.m}</button>
            ))}
          </div>

          <button onClick={() => setSuperpose(s=>!s)} style={{
            background: superpose ? V.aurora+"22" : "transparent",
            border: `1px solid ${superpose ? V.aurora : V.dim}`,
            color: superpose ? V.aurora : V.ink+"44",
            fontFamily:MONO, fontSize:9, padding:"5px 12px",
            cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
          }}>
            {superpose ? "● ALL MODES" : "○ ALL"}
          </button>

          <div style={{ width:1, height:22, background:V.dim, opacity:0.4 }}/>

          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.ink+"55" }}>Ω</span>
            <input type="range" min={0.1} max={3} step={0.05} value={speed}
              onChange={e => setSpeed(+e.target.value)}
              style={{ width:100, accentColor:V.aurora }}/>
            <span style={{ fontFamily:MONO, fontSize:8, color:V.aurora, minWidth:28 }}>
              {speed.toFixed(2)}×
            </span>
          </div>

          <button onClick={() => setTraveling(v=>!v)} style={{
            background: traveling ? V.vio+"22" : V.gold+"22",
            border: `1px solid ${traveling ? V.vio : V.gold}`,
            color: traveling ? V.vio : V.gold,
            fontFamily:MONO, fontSize:9, padding:"5px 12px",
            cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
          }}>
            {traveling ? "TRAVELING ↻" : "STANDING ◈"}
          </button>

          <button onClick={() => setShowFlow(v=>!v)} style={{
            background: showFlow ? V.fire+"22" : "transparent",
            border: `1px solid ${showFlow ? V.fire : V.dim}`,
            color: showFlow ? V.fire : V.ink+"33",
            fontFamily:MONO, fontSize:9, padding:"5px 12px",
            cursor:"pointer", borderRadius:3, letterSpacing:"0.1em",
          }}>
            {showFlow ? "● ENERGY FLOW" : "○ FLOW OFF"}
          </button>
        </div>

        {/* torus canvas */}
        <div style={{ border:`1px solid ${V.dim}`, borderRadius:"0 4px 4px 0 0 4px",
          overflow:"hidden" }}>
          <div style={{ padding:"5px 12px", background:V.dim+"22",
            borderBottom:`1px solid ${V.dim}44`, fontFamily:MONO, fontSize:8,
            color:(superpose?V.aurora:cur.col)+"88", letterSpacing:"0.12em" }}>
            {superpose
              ? "SUPERPOSED MODES m=5,6,7,8,9 · INTERFERENCE PATTERN · BEAT FREQUENCY Ω"
              : `TOROIDAL MODE m=${cur.m} · ${cur.sym} · ${cur.hz} · `+
                (traveling?"TRAVELING WAVE":"STANDING WAVE")+
                ` · FLOQUET DRIVE`}
          </div>
          <TorusCanvas mIdx={mIdx} speed={speed} traveling={traveling}
            showFlow={showFlow} superpose={superpose}/>
        </div>

        {/* mode shape strip */}
        <div style={{ border:`1px solid ${V.dim}33`, borderTop:"none",
          borderRadius:"0 0 4px 4px", overflow:"hidden" }}>
          <div style={{ padding:"4px 12px", background:V.dim+"14",
            borderBottom:`1px solid ${V.dim}22`, fontFamily:MONO, fontSize:8,
            color:V.ink+"44", letterSpacing:"0.1em" }}>
            UNWRAPPED MODE SHAPE · A(φ,t) vs AZIMUTHAL ANGLE φ ∈ [0,2π]
          </div>
          <ShapeCanvas mIdx={mIdx} speed={speed} traveling={traveling}/>
        </div>

        {/* current mode description */}
        {!superpose && (
          <div style={{ marginTop:12, padding:"14px 18px",
            background:cur.col+"0A", border:`1px solid ${cur.col}33`, borderRadius:4,
            display:"flex", gap:20, alignItems:"flex-start" }}>
            <div style={{ fontFamily:DISP, fontSize:32, color:cur.col, lineHeight:1 }}>
              {cur.m}
            </div>
            <div>
              <div style={{ fontFamily:MONO, fontSize:9, color:cur.col,
                letterSpacing:"0.14em", marginBottom:6 }}>
                {cur.name} · {cur.sym} · ω={cur.hz}
              </div>
              <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"88",
                lineHeight:1.65, maxWidth:600 }}>{cur.desc}</div>
            </div>
          </div>
        )}

        {/* mini comparison strip */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.gold}`, paddingLeft:14, marginBottom:14 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.gold,
              letterSpacing:"0.18em" }}>I · ALL AZIMUTHAL MODES LIVE</div>
            <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"66", marginTop:4 }}>
              Each torus runs independently at its own Floquet frequency ωₘ = m·Ω
            </div>
          </div>
          <div style={{ display:"flex", gap:16, flexWrap:"wrap" }}>
            {MODES.map(r => (
              <div key={r.m} style={{ textAlign:"center" }}>
                <MiniTorus m={r.m} col={r.col} speed={speed} traveling={traveling}/>
                <div style={{ fontFamily:MONO, fontSize:8, color:r.col, marginTop:6 }}>
                  {r.name}
                </div>
                <div style={{ fontFamily:MONO, fontSize:7, color:V.ink+"44", marginTop:2 }}>
                  {r.hz} · w={r.m}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ring table */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.vio}`, paddingLeft:14, marginBottom:14 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.vio, letterSpacing:"0.18em" }}>
              II · AZIMUTHAL MODE TABLE
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:MONO, fontSize:10 }}>
              <thead>
                <tr>
                  {["MODE m","SYMMETRY","FLOQUET ω","WINDING #","ANTINODES","BAND GAP Δε","CHERN #"].map(h => (
                    <th key={h} style={{ padding:"8px 12px", borderBottom:`1px solid ${V.dim}`,
                      color:V.ink+"55", textAlign:"left", letterSpacing:"0.08em",
                      whiteSpace:"nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODES.map((r,i) => (
                  <tr key={r.m}>
                    <td style={{ padding:"8px 12px", color:r.col,
                      borderBottom:`1px solid ${V.dim}22` }}>{r.m}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"88",
                      borderBottom:`1px solid ${V.dim}22` }}>{r.sym}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"88",
                      borderBottom:`1px solid ${V.dim}22` }}>{r.hz}</td>
                    <td style={{ padding:"8px 12px", color:r.col+"BB",
                      borderBottom:`1px solid ${V.dim}22` }}>w = {r.m}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"88",
                      borderBottom:`1px solid ${V.dim}22` }}>{r.m}</td>
                    <td style={{ padding:"8px 12px", color:V.ink+"88",
                      borderBottom:`1px solid ${V.dim}22` }}>
                      {(0.18+i*0.12).toFixed(2)} ℏΩ
                    </td>
                    <td style={{ padding:"8px 12px", color:r.col+"BB",
                      borderBottom:`1px solid ${V.dim}22` }}>C = {r.m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* theory cards */}
        <div style={{ margin:"44px 0 0" }}>
          <div style={{ borderLeft:`3px solid ${V.blue}`, paddingLeft:14, marginBottom:14 }}>
            <div style={{ fontFamily:MONO, fontSize:10, color:V.blue, letterSpacing:"0.18em" }}>
              III · FLOQUET TOPOLOGY FIELD NOTES
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))", gap:12 }}>
            {THEORY.map(th => (
              <div key={th.t} style={{ padding:16, background:th.c+"0A",
                border:`1px solid ${th.c}33`, borderRadius:4 }}>
                <div style={{ fontFamily:MONO, fontSize:9, color:th.c,
                  letterSpacing:"0.12em", marginBottom:10 }}>{th.t}</div>
                <div style={{ fontFamily:SERIF, fontSize:13, color:V.ink+"88",
                  lineHeight:1.68 }}>{th.b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* LCM lock */}
        <div style={{ margin:"40px 0 0", padding:22, background:V.aurora+"07",
          border:`1px solid ${V.aurora}28`, borderRadius:4 }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.aurora,
            letterSpacing:"0.18em", marginBottom:14 }}>
            IV · SYSTEM PERIOD · LCM(5,6,7,8,9) = 2520 BASE CYCLES
          </div>
          <div style={{ display:"flex", gap:24, flexWrap:"wrap", alignItems:"center" }}>
            {MODES.map(r => (
              <div key={r.m} style={{ textAlign:"center" }}>
                <div style={{ fontFamily:MONO, fontSize:24, color:r.col }}>{r.m}</div>
                <div style={{ fontFamily:MONO, fontSize:7, color:r.col+"66", marginTop:4 }}>
                  {r.hz}
                </div>
              </div>
            ))}
            <div style={{ borderLeft:`1px solid ${V.dim}`, paddingLeft:24 }}>
              <div style={{ fontFamily:MONO, fontSize:9, color:V.ink+"55",
                marginBottom:8, letterSpacing:"0.1em" }}>RETURN PERIOD</div>
              <div style={{ fontFamily:DISP, fontSize:30, color:V.aurora }}>2520 Ω</div>
              <div style={{ fontFamily:SERIF, fontSize:12, color:V.ink+"55", marginTop:6 }}>
                LCM(5,6,7,8,9) = 2520<br/>
                The composite floral field<br/>
                returns to identical configuration<br/>
                every 2520 base-drive periods
              </div>
            </div>
          </div>
        </div>

        {/* cross-links */}
        <div style={{ margin:"40px 0 0" }}>
          <div style={{ fontFamily:MONO, fontSize:9, color:V.dim,
            letterSpacing:"0.16em", marginBottom:12 }}>RELATED SYSTEMS</div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[
              ["/borrelia-knot",      "Borrelia Knot",       V.aurora],
              ["/understanding-strand","Understanding Strand", V.gold],
              ["/atp-transport",       "ATP Transport",        V.vio],
              ["/gravitational-field", "Gravitational Field",  V.rose],
            ].map(([path,label,col]) => (
              <a key={path} href={path} style={{
                fontFamily:MONO, fontSize:9, color:col, letterSpacing:"0.1em",
                textDecoration:"none", padding:"4px 10px",
                border:`1px solid ${col}44`, borderRadius:3,
              }}>{label} →</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

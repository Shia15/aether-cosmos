import { useEffect, useRef } from "react";
const dynImg = "/api/storage/public-objects/IMG_3602_1782496557258.png";
const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  fire:"#FF6622", ink:"#B8CCE8", dim:"#3A5060",
};
const MONO = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP  = "'Cinzel',serif";

function P(s: string) {
  return <p style={{margin:"0 0 9px",fontSize:13,color:V.ink,lineHeight:1.68,fontFamily:SERIF}}>{s}</p>;
}

// ── Macro: Cosmic Field Amplification Canvas ─────────────────────────────────
function MacroCosmicCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = 840, H = 310; cv.width = W; cv.height = H;
    const ECX = 210, ECY = 155, ER = 82;
    let t = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.28)"; ctx.fillRect(0,0,W,H);
      t++;
      // Deterministic background stars
      for (let si=0; si<40; si++) {
        const sx = (si*1373+7)%W, sy = (si*2857+13)%H;
        ctx.beginPath(); ctx.arc(sx,sy,0.9,0,Math.PI*2);
        ctx.fillStyle = "#ffffff16"; ctx.fill();
      }
      // Inner molten core
      const cg = ctx.createRadialGradient(ECX,ECY,0,ECX,ECY,ER*0.55);
      cg.addColorStop(0,"#FF9933ff"); cg.addColorStop(0.4,"#FF6622cc"); cg.addColorStop(1,"#8B340033");
      ctx.beginPath(); ctx.arc(ECX,ECY,ER*0.55,0,Math.PI*2);
      ctx.fillStyle=cg; ctx.fill();
      // Pulsing core halo
      const pulse=1+0.05*Math.sin(t*0.04);
      const pg=ctx.createRadialGradient(ECX,ECY,0,ECX,ECY,ER*0.7*pulse);
      pg.addColorStop(0,"#FF993366"); pg.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(ECX,ECY,ER*0.7*pulse,0,Math.PI*2);
      ctx.fillStyle=pg; ctx.fill();
      // Mantle/crust
      const mg=ctx.createRadialGradient(ECX-22,ECY-22,0,ECX,ECY,ER);
      mg.addColorStop(0,"#1a3a8844"); mg.addColorStop(0.7,"#0d2055aa"); mg.addColorStop(1,"#041244ee");
      ctx.beginPath(); ctx.arc(ECX,ECY,ER,0,Math.PI*2);
      ctx.fillStyle=mg; ctx.fill();
      ctx.strokeStyle="#4488FF55"; ctx.lineWidth=1.5; ctx.stroke();
      // Magnetic field line arcs (bezier dipole)
      [1.3,1.85,2.6,3.5].forEach((sc,fi) => {
        const alp=0.52-fi*0.11;
        [-1,1].forEach(side => {
          const ctX=ECX+side*ER*sc*1.35;
          ctx.beginPath();
          ctx.moveTo(ECX, ECY-ER);
          ctx.bezierCurveTo(ctX,ECY-ER*0.15, ctX,ECY+ER*0.15, ECX,ECY+ER);
          ctx.strokeStyle=`rgba(68,136,255,${alp})`;
          ctx.lineWidth=0.9; ctx.stroke();
        });
      });
      // Magnetosphere boundary oval
      ctx.beginPath();
      let mfirst=true;
      for (let a=0;a<=Math.PI*2;a+=0.04) {
        const r=ER*2.6*(0.82+0.18*Math.cos(a));
        const mx=ECX+r*Math.cos(a)*1.7, my=ECY+r*Math.sin(a)*0.6;
        if(!isFinite(mx)||!isFinite(my)) continue;
        if(mfirst){ctx.moveTo(mx,my);mfirst=false;}else ctx.lineTo(mx,my);
      }
      ctx.strokeStyle="#00FFB222"; ctx.lineWidth=1; ctx.setLineDash([3,5]); ctx.stroke(); ctx.setLineDash([]);
      // Solar wind particles
      for (let si=0;si<10;si++) {
        const spd=0.014+si*0.0009;
        const px=W-30-((t*spd+si*0.22)%1)*(W-90);
        const py=38+si*23;
        if(!isFinite(px)) continue;
        ctx.beginPath(); ctx.arc(px,py,1.8,0,Math.PI*2);
        const sc=si%2===0?"#FF9933":"#FF6622";
        ctx.fillStyle=sc+"bb"; ctx.shadowColor=sc; ctx.shadowBlur=4; ctx.fill(); ctx.shadowBlur=0;
      }
      // Sun glow top-right
      const sg=ctx.createRadialGradient(W-58,52,0,W-58,52,44);
      sg.addColorStop(0,"#FF9933ff"); sg.addColorStop(0.5,"#FF663344"); sg.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(W-58,52,44,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill();
      // Labels
      ctx.fillStyle="#00FFB2cc"; ctx.font=`bold 8px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("I.  MACRO:  COSMIC FIELD AMPLIFICATION  ·  AS ABOVE",10,14);
      ctx.fillStyle="#4488FFcc"; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
      ctx.fillText("Earth's Magnetosphere",ECX,ECY+ER+18);
      ctx.fillStyle="#FF9933cc"; ctx.textAlign="right";
      ctx.fillText("Solar / Planetary Field Alignment",W-10,16);
      ctx.fillStyle="#B8CCE844"; ctx.font=`7px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("Local Field Test  ·  Soil Sampling Rig",ECX-ER-75,ECY+ER+10);
      raf.current=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  },[]);
  return (
    <canvas ref={ref}
      style={{width:"100%",height:310,display:"block",background:"#04060E",borderRadius:6}}/>
  );
}

// ── Vortex Flow Canvas ────────────────────────────────────────────────────────
function VortexFlowCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W=840, H=310; cv.width=W; cv.height=H;
    const VX=W/2, VY=H/2;
    let t = 0;
    const draw = () => {
      ctx.fillStyle="rgba(4,6,14,0.26)"; ctx.fillRect(0,0,W,H);
      t++;
      // Cylinder vessel
      ctx.strokeStyle="#00FFB218"; ctx.lineWidth=1.5;
      ctx.strokeRect(VX-92,VY-125,184,250);
      ctx.beginPath(); ctx.ellipse(VX,VY-125,92,22,0,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(VX,VY+125,92,22,0,0,Math.PI*2); ctx.stroke();
      // Rotating vortex arms (4 arms)
      for (let arm=0;arm<4;arm++) {
        const armAng=(arm/4)*Math.PI*2+t*0.018;
        const armCols=["#00FFB2","#4488FF","#9966FF","#FF9933"];
        ctx.beginPath();
        for (let r=0;r<86;r+=2) {
          const a=armAng+r*0.09;
          const x=VX+r*Math.cos(a), y=VY+r*Math.sin(a)*0.37;
          r===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=armCols[arm]+"66"; ctx.lineWidth=1.5; ctx.stroke();
      }
      // Topological twist -- lemniscate of Bernoulli
      const a=54;
      ctx.beginPath();
      let lfirst=true;
      for (let theta=-Math.PI/4;theta<=Math.PI/4+0.01;theta+=0.022) {
        const c2=Math.cos(2*theta);
        if(c2<=0.001) continue;
        const r=a*Math.sqrt(c2);
        if(!isFinite(r)) continue;
        const x=VX+r*Math.cos(theta), y=VY+r*Math.sin(theta)*0.44;
        if(lfirst){ctx.moveTo(x,y);lfirst=false;}else ctx.lineTo(x,y);
      }
      // second lobe
      for (let theta=3*Math.PI/4;theta<=5*Math.PI/4+0.01;theta+=0.022) {
        const c2=Math.cos(2*theta);
        if(c2<=0.001) continue;
        const r=a*Math.sqrt(c2);
        if(!isFinite(r)) continue;
        const x=VX+r*Math.cos(theta), y=VY+r*Math.sin(theta)*0.44;
        ctx.lineTo(x,y);
      }
      ctx.strokeStyle="#FF9933cc"; ctx.lineWidth=2.3;
      ctx.shadowColor="#FF9933"; ctx.shadowBlur=10; ctx.stroke(); ctx.shadowBlur=0;
      // Particles flowing in from top
      for (let pi=0;pi<8;pi++) {
        const spd=0.012+pi*0.001;
        const py=VY-135+((t*spd+pi*0.3)%1)*105;
        const px=VX+(pi%2===0?-24:24)*Math.sin(t*0.04+pi);
        if(!isFinite(px)||!isFinite(py)) continue;
        ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2);
        ctx.fillStyle="#00FFB2cc"; ctx.shadowColor="#00FFB2"; ctx.shadowBlur=4; ctx.fill(); ctx.shadowBlur=0;
      }
      // Particles out from bottom
      for (let pi=0;pi<8;pi++) {
        const spd=0.01+pi*0.0012;
        const py=VY+((t*spd+pi*0.4)%1)*135;
        const px=VX+(pi%2===0?-18:18)*Math.cos(t*0.03+pi);
        if(!isFinite(px)||!isFinite(py)) continue;
        ctx.beginPath(); ctx.arc(px,py,1.7,0,Math.PI*2);
        ctx.fillStyle="#4488FFcc"; ctx.shadowColor="#4488FF"; ctx.shadowBlur=4; ctx.fill(); ctx.shadowBlur=0;
      }
      // Feedback loop arrows on flanks
      [-1,1].forEach(side => {
        const ax=VX+side*148;
        ctx.strokeStyle="#00FFB244"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(ax,VY-85); ctx.lineTo(ax,VY+85); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(ax,VY+(side>0?-85:85));
        ctx.lineTo(ax-4*side,VY+(side>0?-75:75));
        ctx.lineTo(ax+4*side,VY+(side>0?-75:75));
        ctx.fillStyle="#00FFB255"; ctx.fill();
      });
      // Labels
      ctx.fillStyle="#FF9933cc"; ctx.font=`bold 8px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("II.  LINKING MECHANISM:  VORTEX FLOW",10,14);
      ctx.fillStyle="#FF9933aa"; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
      ctx.fillText("Topological Twist",VX+68,VY-6);
      ctx.fillStyle="#00FFB266"; ctx.textAlign="left";
      ctx.fillText("Feedback Loop",14,VY+4);
      ctx.fillStyle="#B8CCE844"; ctx.textAlign="right";
      ctx.fillText("Plasma Alignment",W-10,H-10);
      raf.current=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  },[]);
  return (
    <canvas ref={ref}
      style={{width:"100%",height:310,display:"block",background:"#04060E",borderRadius:6}}/>
  );
}

// ── Micro Spacetime Lattice Canvas ────────────────────────────────────────────
function MicroLatticeCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W=840, H=310; cv.width=W; cv.height=H;
    const LX=W/2, LY=H/2;
    let t = 0;
    const draw = () => {
      ctx.fillStyle="rgba(4,6,14,0.25)"; ctx.fillRect(0,0,W,H);
      t++;
      // Warped spacetime lattice dots
      const sp=30;
      for (let gx=sp/2;gx<W;gx+=sp) {
        for (let gy=sp/2;gy<H;gy+=sp) {
          const dist=Math.hypot(gx-LX,gy-LY);
          const warp=18*Math.exp(-dist/85)*Math.sin(t*0.04+dist*0.045);
          const ang=Math.atan2(gy-LY,gx-LX);
          const dx=Math.cos(ang)*warp, dy=Math.sin(ang)*warp;
          if(!isFinite(dx)||!isFinite(dy)) continue;
          ctx.beginPath(); ctx.arc(gx+dx,gy+dy,1.2,0,Math.PI*2);
          ctx.fillStyle="#4488FF1a"; ctx.fill();
          if(gx+sp<W) {
            ctx.beginPath(); ctx.moveTo(gx+dx,gy+dy); ctx.lineTo(gx+sp+dx,gy+dy);
            ctx.strokeStyle="#4488FF0c"; ctx.lineWidth=0.5; ctx.stroke();
          }
          if(gy+sp<H) {
            ctx.beginPath(); ctx.moveTo(gx+dx,gy+dy); ctx.lineTo(gx+dx,gy+sp+dy);
            ctx.strokeStyle="#4488FF0c"; ctx.lineWidth=0.5; ctx.stroke();
          }
        }
      }
      // Alfven wave lines
      for (let wave=0;wave<4;wave++) {
        const wy=H*(0.18+wave*0.21);
        ctx.beginPath();
        for (let x=0;x<W;x++) {
          const env=Math.exp(-Math.abs(x-LX)/230)*22;
          const y=wy+env*Math.sin(x*0.062+t*0.05+wave*0.9);
          x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
        }
        ctx.strokeStyle=`rgba(0,255,178,${0.22-wave*0.04})`; ctx.lineWidth=1; ctx.stroke();
      }
      // X-point separatrices
      [[1,1],[-1,1],[1,-1],[-1,-1]].forEach(([dx,dy]) => {
        ctx.beginPath(); ctx.moveTo(LX,LY);
        ctx.lineTo(LX+dx*(72+6*Math.sin(t*0.03)),LY+dy*(72+6*Math.cos(t*0.03)));
        ctx.strokeStyle="#9966FF88"; ctx.lineWidth=1.5; ctx.stroke();
      });
      // Outflow jets (horizontal) with arrows
      [-1,1].forEach(dir => {
        const jlen=105+12*Math.sin(t*0.04);
        ctx.beginPath(); ctx.moveTo(LX,LY); ctx.lineTo(LX+dir*jlen,LY);
        ctx.strokeStyle="#FF9933cc"; ctx.lineWidth=2; ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(LX+dir*jlen,LY);
        ctx.lineTo(LX+dir*(jlen-11),LY-6);
        ctx.lineTo(LX+dir*(jlen-11),LY+6);
        ctx.fillStyle="#FF9933cc"; ctx.fill();
      });
      // Reconnection glow
      const xg=ctx.createRadialGradient(LX,LY,0,LX,LY,32);
      xg.addColorStop(0,"#FF4477cc"); xg.addColorStop(0.5,"#FF447733"); xg.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(LX,LY,32,0,Math.PI*2); ctx.fillStyle=xg; ctx.fill();
      ctx.beginPath(); ctx.arc(LX,LY,4,0,Math.PI*2);
      ctx.fillStyle="#FF4477"; ctx.shadowColor="#FF4477"; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0;
      // Quantum superposition halos
      [{x:LX-195,y:78},{x:LX+200,y:78},{x:LX-185,y:228},{x:LX+210,y:210}].forEach((ha,hi) => {
        for (let ring=1;ring<=3;ring++) {
          const rAng=t*0.022*(ring%2===0?1:-1)+hi*1.2;
          const rx=ha.x+ring*8*Math.cos(rAng);
          const ry=ha.y+ring*8*Math.sin(rAng)*0.5;
          if(!isFinite(rx)||!isFinite(ry)) continue;
          ctx.beginPath(); ctx.arc(rx,ry,ring*4.5,0,Math.PI*2);
          ctx.strokeStyle=`rgba(153,102,255,${0.28-ring*0.07})`; ctx.lineWidth=0.8; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(ha.x,ha.y,3,0,Math.PI*2);
        ctx.fillStyle="#9966FFcc"; ctx.shadowColor="#9966FF"; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
      });
      // Labels
      ctx.fillStyle="#9966FFcc"; ctx.font=`bold 8px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("III.  MICRO:  SPACETIME LATTICE & FUSION CORE  ·  SO BELOW",10,14);
      ctx.fillStyle="#9966FF88"; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
      ctx.fillText("Magnetic Reconnection Points",LX,LY+48);
      ctx.fillStyle="#4488FF77"; ctx.textAlign="right";
      ctx.fillText("Spacetime Lattice Filter",W-10,H-10);
      ctx.fillStyle="#9966FF66"; ctx.textAlign="left";
      ctx.fillText("Quantum Particles  ·  superposition halos",12,H-10);
      ctx.fillStyle="#FF9933aa"; ctx.textAlign="left";
      ctx.fillText("Alfven Wave Re-direction",LX-140,LY+14);
      raf.current=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  },[]);
  return (
    <canvas ref={ref}
      style={{width:"100%",height:310,display:"block",background:"#04060E",borderRadius:6}}/>
  );
}

// ── Plasmoid Rings Canvas ─────────────────────────────────────────────────────
function PlasmoidCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W=840, H=260; cv.width=W; cv.height=H;
    const PCX=W/2, PCY=H/2;
    let t = 0;
    const rings=[
      {ry:58,col:"#00FFB2",phase:0},
      {ry:38,col:"#4488FF",phase:1.1},
      {ry:22,col:"#9966FF",phase:2.3},
    ];
    const draw = () => {
      ctx.fillStyle="rgba(4,6,14,0.3)"; ctx.fillRect(0,0,W,H);
      t++;
      rings.forEach((ring,ri) => {
        const rx=ring.ry*3.1;
        const pulse=1+0.055*Math.sin(t*0.04+ring.phase);
        const rrx=rx*pulse, rry=ring.ry*pulse;
        if(!isFinite(rrx)||!isFinite(rry)) return;
        // Outer fill
        const tg=ctx.createRadialGradient(PCX,PCY,rry*0.35,PCX,PCY,rrx);
        tg.addColorStop(0,"transparent");
        tg.addColorStop(0.7,ring.col+"1a");
        tg.addColorStop(0.88,ring.col+"66");
        tg.addColorStop(1,ring.col+"0a");
        ctx.beginPath(); ctx.ellipse(PCX,PCY,rrx,rry,0,0,Math.PI*2);
        ctx.fillStyle=tg; ctx.fill();
        ctx.strokeStyle=ring.col+"88"; ctx.lineWidth=2*pulse; ctx.stroke();
        // Inner rim
        ctx.beginPath(); ctx.ellipse(PCX,PCY,rrx*0.6,rry*0.5,0,0,Math.PI*2);
        ctx.strokeStyle=ring.col+"33"; ctx.lineWidth=1; ctx.stroke();
        // Orbiting plasma particles
        for (let pi=0;pi<8;pi++) {
          const pAng=(pi/8)*Math.PI*2+t*0.026*(ri%2===0?1:-1)+ring.phase;
          const px=PCX+rrx*Math.cos(pAng);
          const py=PCY+rry*Math.sin(pAng)*0.54;
          if(!isFinite(px)||!isFinite(py)) continue;
          ctx.beginPath(); ctx.arc(px,py,2+ri,0,Math.PI*2);
          ctx.fillStyle=ring.col;
          ctx.shadowColor=ring.col; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
        }
      });
      // Central plasmoid core
      const cg=ctx.createRadialGradient(PCX,PCY,0,PCX,PCY,20);
      cg.addColorStop(0,"#ffffffee"); cg.addColorStop(0.4,"#00FFB2cc"); cg.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(PCX,PCY,20,0,Math.PI*2); ctx.fillStyle=cg; ctx.fill();
      ctx.fillStyle="#00FFB2cc"; ctx.font=`bold 8px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("PLASMOIDIC FIELD AMPLIFICATION  ·  NESTED CONTAINMENT RINGS",10,14);
      ctx.fillStyle="#4488FF77"; ctx.font=`7px ${MONO}`; ctx.textAlign="right";
      ctx.fillText("Topological Confinement  ·  Three-Shell Architecture",W-10,H-10);
      raf.current=requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  },[]);
  return (
    <canvas ref={ref}
      style={{width:"100%",height:260,display:"block",background:"#04060E",borderRadius:6}}/>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DynamicSynthesisPage() {
  const secLabel = (col: string) => ({
    fontSize:9, fontFamily:MONO, color:col, letterSpacing:"0.18em" as const,
  });
  const h3s = (col: string) => ({
    margin:"3px 0 0" as const, fontFamily:DISP, fontSize:17, color:"#fff",
    fontWeight:600 as const,
  });
  const borderCard = (col: string) => ({
    background:`rgba(8,12,24,0.6)` as const,
    border:`1px solid ${col}22` as const,
    borderRadius:8 as const,
    padding:"14px 16px" as const,
    marginBottom:10 as const,
  });

  return (
    <div data-testid="page-dynamic-synthesis"
      style={{background:V.bg,color:V.ink,minHeight:"100vh",
              padding:"32px 22px 48px",maxWidth:980,margin:"0 auto",fontFamily:SERIF}}>

      {/* Header */}
      <div style={{marginBottom:28}}>
        <div style={{fontSize:9,fontFamily:MONO,color:V.aurora,letterSpacing:"0.22em",marginBottom:6}}>
          WHITE PAPER  ·  DYNAMIC SYNTHESIS FRAMEWORK
        </div>
        <h1 style={{margin:0,fontFamily:DISP,fontSize:30,fontWeight:600,color:"#fff",letterSpacing:"0.04em",lineHeight:1.15}}>
          Dynamic Synthesis Framework
        </h1>
        <h2 style={{margin:"5px 0 0",fontFamily:DISP,fontSize:19,fontWeight:400,color:V.aurora,letterSpacing:"0.07em"}}>
          Plasmoidic Containment
        </h2>
        <div style={{marginTop:10,fontSize:11,color:V.dim,fontFamily:MONO,letterSpacing:"0.1em"}}>
          Macro  ·  Linking Mechanism: Vortex Flow  ·  Micro  ·  As Above So Below
        </div>
      </div>

      {/* Reference image */}
      <div style={{marginBottom:32,borderRadius:10,overflow:"hidden",border:`1px solid ${V.aurora}22`,boxShadow:`0 0 48px ${V.aurora}0a`}}>
        <img src={dynImg} alt="Dynamic Synthesis Framework whitepaper diagram"
             style={{width:"100%",display:"block"}}/>
      </div>

      {/* I. MACRO */}
      <section style={{marginBottom:36}}>
        <div style={{borderLeft:`3px solid ${V.aurora}`,paddingLeft:14,marginBottom:14}}>
          <div style={secLabel(V.aurora)}>SECTION I  ·  AS ABOVE</div>
          <h3 style={h3s(V.aurora)}>Macro: Cosmic Field Amplification</h3>
        </div>
        <div style={{...borderCard(V.aurora)}}>
          {P("The macro layer captures large-scale cosmic and planetary field dynamics. Earth's magnetosphere acts as the primary amplification structure, channelling solar and interplanetary field lines into the system. Local ground-based measurement -- the soil sampling rig -- provides the tether point between macroscale field geometry and subsurface mineral resonance.")}
          {P("Solar and planetary alignment windows create coherence spikes: moments when the geomagnetic axis, solar wind pressure, and plasmoid injection all phase-lock into a single amplification event. The magnetosphere's asymmetric teardrop shape (compressed on the sunward side, extended in the tail) reflects the dynamic balance between solar wind ram pressure and internal field pressure.")}
        </div>
        <div style={{border:`1px solid ${V.aurora}1a`,borderRadius:8,overflow:"hidden"}}>
          <MacroCosmicCanvas/>
        </div>
      </section>

      {/* II. VORTEX */}
      <section style={{marginBottom:36}}>
        <div style={{borderLeft:`3px solid ${V.amb}`,paddingLeft:14,marginBottom:14}}>
          <div style={secLabel(V.amb)}>SECTION II  ·  LINKING MECHANISM</div>
          <h3 style={h3s(V.amb)}>Vortex Flow &amp; Topological Twist</h3>
        </div>
        <div style={{...borderCard(V.amb)}}>
          {P("The central linking mechanism is a vortex flow column operating on the boundary between the macro and micro layers. The topological twist -- a lemniscatic rotation where field lines cross and exchange topology -- enables the system to act as a transformer between cosmic-scale fields and quantum-scale lattice states.")}
          {P("The feedback loop (shown on flanks) ensures self-sustaining amplification: energy injected at the macro level undergoes topological transformation in the vortex and emerges at the micro level in a compressed, structured form suitable for lattice injection. The SNOWDEN terminal monitors command-line system state throughout the feedback cycle.")}
        </div>
        <div style={{border:`1px solid ${V.amb}1a`,borderRadius:8,overflow:"hidden"}}>
          <VortexFlowCanvas/>
        </div>
      </section>

      {/* III. MICRO */}
      <section style={{marginBottom:36}}>
        <div style={{borderLeft:`3px solid ${V.vio}`,paddingLeft:14,marginBottom:14}}>
          <div style={secLabel(V.vio)}>SECTION III  ·  SO BELOW</div>
          <h3 style={h3s(V.vio)}>Micro: Spacetime Lattice &amp; Fusion Core</h3>
        </div>
        <div style={{...borderCard(V.vio)}}>
          {P("At the micro scale, the spacetime lattice acts as a filter and transducer. Alfven waves -- transverse electromagnetic oscillations propagating along magnetic field lines -- carry structured energy through the lattice nodes. Magnetic reconnection X-points at the fusion core allow field lines to break and re-form, releasing energy in directed outflow jets aligned with the Alfven wave axis.")}
          {P("Quantum particles exist in superposition halos: their localisation is distributed across multiple lattice sites simultaneously. The lattice filter selects coherence-compatible modes, allowing only phase-locked wave patterns to propagate forward to the plasmoid containment stage.")}
        </div>
        <div style={{border:`1px solid ${V.vio}1a`,borderRadius:8,overflow:"hidden"}}>
          <MicroLatticeCanvas/>
        </div>
      </section>

      {/* Plasmoid Rings */}
      <section style={{marginBottom:36}}>
        <div style={{borderLeft:`3px solid ${V.blue}`,paddingLeft:14,marginBottom:14}}>
          <div style={secLabel(V.blue)}>OUTPUT STAGE  ·  CONTAINMENT</div>
          <h3 style={h3s(V.blue)}>Plasmoidic Field Amplification</h3>
        </div>
        <div style={{...borderCard(V.blue)}}>
          {P("The output stage produces nested plasmoid rings -- self-contained magnetised plasma structures topologically equivalent to tori. Three concentric shells (aurora, blue, violet) represent successive amplification layers. The inner shell carries the highest energy density; the outer shells act as containment and harmonic stabilisation barriers.")}
          {P("Each ring rotates at a different angular velocity, creating a differential rotation that continuously shears and re-amplifies the contained field. The central plasmoid core is the culmination of the macro-to-micro synthesis chain -- a coherence node where all three framework layers converge.")}
        </div>
        <div style={{border:`1px solid ${V.blue}1a`,borderRadius:8,overflow:"hidden"}}>
          <PlasmoidCanvas/>
        </div>
      </section>

      {/* Ideal MHD Equations */}
      <section style={{marginBottom:36,background:"rgba(10,14,30,0.65)",borderRadius:12,
                       padding:"22px 24px",border:`1px solid ${V.gold}33`}}>
        <div style={{fontSize:9,fontFamily:MONO,color:V.gold,letterSpacing:"0.18em",marginBottom:14}}>
          IDEAL MHD EQUATIONS  ·  GOVERNING SYSTEM
        </div>
        <div style={{fontFamily:MONO,fontSize:13,color:V.ink,lineHeight:2.5}}>
          <div style={{color:V.gold,fontSize:9,letterSpacing:"0.12em"}}>Continuity / Mass transport:</div>
          <div style={{paddingLeft:18,color:"#e8e8e8",fontSize:13}}>
            &part;M<sub>n</sub>/&part;t = M<sub>mm</sub>
            &nbsp;=&nbsp; &part;M<sup>2</sup>/&part;t &minus; &part;/&part;t + M<sub>mv</sub>
            &nbsp;+&nbsp; &part;M<sup>3</sup>/&part;t<sup>2</sup>
            &nbsp;+&nbsp; m<sub>i</sub>v&#x20D7;<sub>i</sub> &middot; (v &minus; v<sub>j</sub>)
          </div>
          <div style={{color:V.gold,fontSize:9,letterSpacing:"0.12em",marginTop:6}}>Momentum (force balance):</div>
          <div style={{paddingLeft:18,color:"#e8e8e8",fontSize:13}}>
            d<sup>2</sup>/&part;t &middot; &part;<sup>2</sup>v/&part;t<sup>2</sup>
            &nbsp;+&nbsp; M<sub>ts</sub> &middot; &part;Fv/&part;t + M<sub>ts</sub>m
          </div>
          <div style={{color:V.gold,fontSize:9,letterSpacing:"0.12em",marginTop:6}}>Newton -- net force:</div>
          <div style={{paddingLeft:18,color:"#e8e8e8",fontSize:13}}>
            F&#x20D7; = m&#x101;
          </div>
        </div>
        <div style={{marginTop:16,fontSize:12,color:"#8899aa",fontFamily:SERIF,lineHeight:1.6}}>
          The ideal MHD equations govern the large-scale behaviour of electrically conducting fluids (plasmas) in magnetic fields. They couple the Navier-Stokes momentum equation with Maxwell's equations under the assumption of infinite conductivity -- the frozen-flux condition -- so that magnetic field lines move with the plasma bulk flow. This is the governing system of the plasmoidic containment stage.
        </div>
      </section>

      {/* Footer */}
      <div style={{borderTop:`1px solid ${V.dim}33`,paddingTop:18,
                   display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:8,fontFamily:MONO,color:V.dim,letterSpacing:"0.12em"}}>
          AETHER  ·  DYNAMIC SYNTHESIS FRAMEWORK  ·  PLASMOIDIC CONTAINMENT
        </div>
        <div style={{fontSize:8,fontFamily:MONO,color:V.dim}}>
          AS ABOVE  ·  SO BELOW
        </div>
      </div>
    </div>
  );
}

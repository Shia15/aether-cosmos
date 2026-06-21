import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const B = {
  bg: "#070918",
  ink: "#E7ECF7",
  dim: "#9AA3B8",
  gold: "#E6B85C",
  cyan: "#7CD7FF",
  green: "#7CE0B0",
  amber: "#F2A007",
  rose: "#F49AB6",
  violet: "#B49CFF",
  ice: "#BFE3FF",
  pearl: "#E8E2F2",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

/* ------------------------------------------------------------------ */
/*  Helpers (palette B)                                                 */
/* ------------------------------------------------------------------ */
function Card({ accent, children, style }: { accent: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: B.panel, border: `1px solid ${B.line}`,
      borderTop: `2px solid ${accent}`, borderRadius: 6, padding: 16, ...style,
    }}>{children}</div>
  );
}
function H({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase" }}>
        Section <span style={{ color: accent }}>{num}</span>
      </div>
      <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500 }}>{label}</h2>
    </div>
  );
}
function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  return (
    <Link
      href={to}
      data-testid={`bridge-${to.slice(1)}`}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", textDecoration: "none",
        background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `2px solid ${accent}`, borderRadius: 4,
      }}
    >
      <ArrowUpRight size={16} color={accent} />
      <div>
        <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}
function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 999,
      background: `${color}22`, color, border: `1px solid ${color}55`,
      fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase",
    }}>{children}</span>
  );
}
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      textAlign: "left", padding: "10px 12px",
      fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6,
      color: B.dim, textTransform: "uppercase", borderBottom: `1px solid ${B.line}`, fontWeight: 500,
    }}>{children}</th>
  );
}
function Td({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <td style={{
      padding: "10px 12px", fontFamily: "Inter, sans-serif", fontSize: 13,
      color: accent ?? B.ink, borderBottom: `1px solid ${B.line}`, verticalAlign: "top",
    }}>{children}</td>
  );
}
function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "Inter, sans-serif", fontSize: 13.5, lineHeight: 1.65,
      color: B.ink, margin: "0 0 10px 0",
    }}>{children}</p>
  );
}

/* ------------------------------------------------------------------ */
/*  Glyphs                                                              */
/* ------------------------------------------------------------------ */

/* The shelf — ice above, hidden ecosystem below */
function IceShelfGlyph() {
  return (
    <svg viewBox="0 0 360 220" width="100%" style={{ display: "block" }} role="img" aria-label="Cross-section of the George VI Ice Shelf — ice above, dark ocean below, sponges and a phantom jellyfish in the previously sealed cavity">
      <defs>
        <linearGradient id="iceGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={B.ice} stopOpacity={0.85} />
          <stop offset="100%" stopColor={B.cyan} stopOpacity={0.35} />
        </linearGradient>
        <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0E1A2E" stopOpacity={0.95} />
          <stop offset="100%" stopColor="#020410" stopOpacity={1} />
        </linearGradient>
      </defs>
      {/* sky */}
      <rect x={0} y={0} width={360} height={50} fill={B.bg} />
      {/* ice shelf with a broken-off chunk */}
      <path d="M0,50 L180,50 L195,70 L200,50 L360,50 L360,95 L0,95 Z" fill="url(#iceGrad)" stroke={B.ice} strokeWidth={0.8} opacity={0.95} />
      {/* drifting iceberg (the chunk that calved) */}
      <path d="M210,42 L255,42 L266,62 L255,76 L218,76 L208,62 Z" fill="url(#iceGrad)" stroke={B.ice} strokeWidth={0.8} opacity={0.85} />
      <text x={237} y={36} textAnchor="middle" fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>~ size of chicago</text>
      {/* exposed gap of ocean */}
      <rect x={195} y={70} width={13} height={25} fill="#020410" />
      {/* ocean */}
      <rect x={0} y={95} width={360} height={125} fill="url(#oceanGrad)" />
      {/* current arrows (cyan, drifting in from the sides) */}
      <path d="M8,130 Q60,118 120,132" stroke={B.cyan} strokeWidth={1} fill="none" opacity={0.55} />
      <polygon points="120,132 114,128 114,136" fill={B.cyan} opacity={0.55} />
      <path d="M352,160 Q300,150 240,164" stroke={B.cyan} strokeWidth={1} fill="none" opacity={0.55} />
      <polygon points="240,164 246,160 246,168" fill={B.cyan} opacity={0.55} />
      {/* sea floor */}
      <path d="M0,200 Q90,190 180,198 Q270,206 360,196 L360,220 L0,220 Z" fill="#0A1428" stroke={B.line} strokeWidth={0.6} />
      {/* sponges */}
      <ellipse cx={70} cy={195} rx={14} ry={10} fill={B.gold} opacity={0.55} />
      <ellipse cx={130} cy={199} rx={9} ry={6} fill={B.gold} opacity={0.45} />
      <ellipse cx={250} cy={196} rx={18} ry={11} fill={B.gold} opacity={0.6} />
      {/* tiny crab on the big sponge */}
      <circle cx={250} cy={188} r={2.4} fill={B.rose} />
      <line x1={247} y1={188} x2={244} y2={185} stroke={B.rose} strokeWidth={0.6} />
      <line x1={253} y1={188} x2={256} y2={185} stroke={B.rose} strokeWidth={0.6} />
      {/* phantom jellyfish */}
      <path d="M300,135 q12,-14 24,0 q-2,4 -6,4 q-2,-3 -6,-3 q-4,0 -6,3 q-4,0 -6,-4 z" fill={B.violet} opacity={0.55} />
      <path d="M306,141 q-3,12 -1,22" stroke={B.violet} strokeWidth={0.7} fill="none" opacity={0.65} />
      <path d="M312,141 q-1,14 2,24" stroke={B.violet} strokeWidth={0.7} fill="none" opacity={0.65} />
      <path d="M318,141 q3,12 -1,22" stroke={B.violet} strokeWidth={0.7} fill="none" opacity={0.65} />
      {/* labels */}
      <text x={90} y={62} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>george vi ice shelf</text>
      <text x={180} y={216} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>previously sealed seafloor</text>
    </svg>
  );
}

/* Phantom jellyfish portrait */
function PhantomJellyGlyph() {
  return (
    <svg viewBox="0 0 220 240" width="100%" style={{ display: "block" }} role="img" aria-label="Phantom jellyfish — large bell, four ribbon-like oral arms trailing into the dark">
      <defs>
        <radialGradient id="bellGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor={B.violet} stopOpacity={0.7} />
          <stop offset="80%" stopColor={B.violet} stopOpacity={0.05} />
          <stop offset="100%" stopColor={B.bg} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* bell */}
      <path d="M40,70 Q110,-10 180,70 Q170,90 150,90 Q140,80 130,90 Q120,80 110,90 Q100,80 90,90 Q80,80 70,90 Q50,90 40,70 Z" fill="url(#bellGrad)" stroke={B.violet} strokeWidth={1} opacity={0.85} />
      {/* oral arms (ribbon-like) */}
      <path d="M85,90 Q70,140 95,200 Q90,220 80,228" stroke={B.violet} strokeWidth={1.3} fill="none" opacity={0.7} />
      <path d="M105,90 Q100,150 110,210 Q108,222 100,230" stroke={B.violet} strokeWidth={1.3} fill="none" opacity={0.7} />
      <path d="M125,90 Q140,150 130,210 Q132,224 124,232" stroke={B.violet} strokeWidth={1.3} fill="none" opacity={0.7} />
      <path d="M145,90 Q160,140 140,200 Q144,220 152,228" stroke={B.violet} strokeWidth={1.3} fill="none" opacity={0.7} />
      {/* faint glow specks */}
      <circle cx={70} cy={50} r={1.2} fill={B.cyan} opacity={0.6} />
      <circle cx={150} cy={45} r={1.2} fill={B.cyan} opacity={0.6} />
      <circle cx={110} cy={32} r={1.2} fill={B.cyan} opacity={0.6} />
      {/* label */}
      <text x={110} y={236} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.8} style={{ textTransform: "uppercase" }}>stygiomedusa gigantea · rare</text>
    </svg>
  );
}

/* Current conveyor — currents carry nutrient parcels into the sealed cavity */
function CurrentGlyph() {
  return (
    <svg viewBox="0 0 360 180" width="100%" style={{ display: "block" }} role="img" aria-label="Hypothesis diagram — open ocean currents carrying nutrient parcels under the ice shelf into the sealed cavity">
      {/* open ocean (left) */}
      <rect x={0} y={20} width={130} height={140} fill="#0E1A2E" opacity={0.6} />
      <text x={65} y={14} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>open ocean</text>
      {/* sealed cavity (right) */}
      <path d="M130,20 L360,20 L360,160 L130,160 Z" fill="#020410" opacity={0.85} />
      {/* ice shelf overhang */}
      <path d="M130,20 L360,20 L360,55 L150,55 L130,40 Z" fill={B.ice} opacity={0.4} stroke={B.ice} strokeWidth={0.8} />
      <text x={245} y={14} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>sealed cavity</text>
      {/* current path 1 */}
      <path d="M10,80 Q70,75 130,90 Q200,100 320,95" stroke={B.cyan} strokeWidth={1.3} fill="none" opacity={0.75} />
      <polygon points="320,95 313,91 313,99" fill={B.cyan} opacity={0.85} />
      {/* nutrient parcels along path 1 */}
      <circle cx={50} cy={78} r={2.6} fill={B.green} opacity={0.85} />
      <circle cx={140} cy={92} r={2.6} fill={B.green} opacity={0.85} />
      <circle cx={230} cy={97} r={2.6} fill={B.green} opacity={0.85} />
      {/* current path 2 */}
      <path d="M10,130 Q80,125 150,135 Q230,145 320,140" stroke={B.cyan} strokeWidth={1.1} fill="none" opacity={0.55} />
      <polygon points="320,140 313,136 313,144" fill={B.cyan} opacity={0.65} />
      <circle cx={90} cy={127} r={2.2} fill={B.green} opacity={0.7} />
      <circle cx={200} cy={141} r={2.2} fill={B.green} opacity={0.7} />
      {/* sponges on the cavity floor */}
      <ellipse cx={200} cy={158} rx={8} ry={4} fill={B.gold} opacity={0.55} />
      <ellipse cx={270} cy={158} rx={11} ry={5} fill={B.gold} opacity={0.65} />
      <ellipse cx={330} cy={158} rx={6} ry={3} fill={B.gold} opacity={0.5} />
      {/* legend */}
      <circle cx={20} cy={172} r={2.6} fill={B.green} />
      <text x={28} y={175} fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>nutrient parcel</text>
      <line x1={130} y1={172} x2={150} y2={172} stroke={B.cyan} strokeWidth={1.2} />
      <text x={156} y={175} fontSize={8.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.2}>current vector</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

function UnderIceCanvas() {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = 900, H = 380;
    cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d")!;
    const ICE_H = 72;

    interface Organism { x:number; y:number; vx:number; vy:number; r:number; col:string; type:"krill"|"diatom"|"copepod" }
    const organisms: Organism[] = Array.from({length:60}, (_,i) => ({
      x: Math.random()*W, y: ICE_H+10+Math.random()*(H-ICE_H-30),
      vx: (Math.random()-0.5)*0.6, vy: (Math.random()-0.5)*0.3,
      r: 2.5+Math.random()*4, col: ["#7CD7FF","#BFE3FF","#7CE0B0","#B49CFF"][i%4],
      type: (["krill","diatom","copepod"] as const)[i%3],
    }));

    const brineChannels = Array.from({length:8}, (_,i) => ({
      x: (i+0.5)/8*W + (Math.random()-0.5)*40,
      w: 3+Math.random()*6,
      depth: 20+Math.random()*45,
    }));

    const crystals = Array.from({length:22}, (_,i) => ({
      x: (i/22)*W, y: Math.random()*ICE_H*0.7,
      size: 10+Math.random()*20, angle: Math.random()*Math.PI,
    }));

    let t = 0;

    const draw = () => {
      const bgGrd=ctx.createLinearGradient(0,ICE_H,0,H);
      bgGrd.addColorStop(0,"#010f1e"); bgGrd.addColorStop(1,"#010812");
      ctx.fillStyle=bgGrd; ctx.fillRect(0,0,W,H);

      const iceGrd=ctx.createLinearGradient(0,0,0,ICE_H);
      iceGrd.addColorStop(0,"#3a6188"); iceGrd.addColorStop(0.6,"#1a3d5c"); iceGrd.addColorStop(1,"#0e2235");
      ctx.fillStyle=iceGrd; ctx.fillRect(0,0,W,ICE_H);

      for (const c of crystals){
        const glow=0.15+0.08*Math.sin(t*0.02+c.x*0.01);
        ctx.save(); ctx.translate(c.x,c.y); ctx.rotate(c.angle+t*0.003);
        for (let arm=0;arm<6;arm++){
          ctx.rotate(Math.PI/3);
          ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,c.size);
          ctx.strokeStyle=`rgba(191,227,255,${glow})`; ctx.lineWidth=0.8; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0,c.size*0.4); ctx.lineTo(c.size*0.2,c.size*0.6);
          ctx.lineTo(-c.size*0.2,c.size*0.6); ctx.stroke();
        }
        ctx.restore();
      }

      for (const br of brineChannels){
        const brGrd=ctx.createLinearGradient(br.x,0,br.x+br.w,0);
        brGrd.addColorStop(0,"transparent"); brGrd.addColorStop(0.5,"rgba(1,12,30,0.9)"); brGrd.addColorStop(1,"transparent");
        ctx.fillStyle=brGrd; ctx.fillRect(br.x,0,br.w,br.depth);
        ctx.fillStyle="rgba(14,165,233,0.15)"; ctx.fillRect(br.x,br.depth,br.w,3);
      }

      ctx.strokeStyle="rgba(14,165,233,0.35)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,ICE_H); ctx.lineTo(W,ICE_H);
      for (let x=0;x<W;x+=4){
        const wy=ICE_H+3*Math.sin((x+t*0.5)*0.06);
        x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
      }
      ctx.stroke();
      ctx.strokeStyle="rgba(14,165,233,0.1)"; ctx.lineWidth=0.5;
      ctx.beginPath();
      for (let x=0;x<W;x+=4){
        const wy=ICE_H+8+5*Math.sin((x+t*0.4)*0.05+1);
        x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
      }
      ctx.stroke();

      for (const o of organisms){
        o.x+=o.vx; o.y+=o.vy;
        if(o.x<0)o.x=W; if(o.x>W)o.x=0;
        if(o.y<ICE_H+6||o.y>H-10){o.vy*=-0.9; o.y=Math.max(ICE_H+6,Math.min(H-10,o.y));}
        o.vx+=(Math.random()-0.5)*0.04; o.vy+=(Math.random()-0.5)*0.02;
        o.vx=Math.max(-1,Math.min(1,o.vx)); o.vy=Math.max(-0.5,Math.min(0.5,o.vy));

        const glow=0.5+0.5*Math.sin(t*0.06+o.x*0.02);
        ctx.beginPath(); ctx.arc(o.x,o.y,o.r+3*glow,0,Math.PI*2);
        ctx.fillStyle=o.col+Math.round(glow*30).toString(16).padStart(2,"0"); ctx.fill();
        ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2);
        ctx.fillStyle=o.col+Math.round(0.5*255).toString(16).padStart(2,"0"); ctx.fill();

        if(o.type==="krill"){
          ctx.beginPath(); ctx.moveTo(o.x,o.y-o.r*1.3); ctx.lineTo(o.x-o.r*0.8,o.y+o.r*0.6);
          ctx.lineTo(o.x+o.r*0.8,o.y+o.r*0.6); ctx.closePath();
          ctx.strokeStyle=o.col+"60"; ctx.lineWidth=0.5; ctx.stroke();
        }
      }

      ctx.fillStyle="rgba(191,227,255,0.2)"; ctx.font="7px 'Space Mono',monospace"; ctx.textAlign="center";
      ctx.fillText("ICE CRYSTAL LATTICE · BRINE CHANNELS · KRILL · DIATOMS · COPEPODS",W/2,H-10);
      ctx.textAlign="left";

      t++; rafRef.current=requestAnimationFrame(draw);
    };

    rafRef.current=requestAnimationFrame(draw);
    return ()=>cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={cvRef} style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />;
}

function UnderIceEcosystemHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const creatures: {x:number;y:number;vx:number;vy:number;size:number;phase:number}[]=[];
    for(let i=0;i<8;i++) creatures.push({x:Math.random()*W,y:30+Math.random()*(H-40),vx:(-0.3+Math.random()*0.6),vy:(-0.15+Math.random()*0.3),size:2+Math.random()*4,phase:Math.random()*Math.PI*2});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.28)"; ctx.fillRect(0,0,W,H);
      ctx.fillStyle="rgba(20,40,80,0.15)"; ctx.fillRect(0,0,W,H);
      ctx.beginPath();
      for(let x=0;x<=W;x+=4){
        const y=14+3*Math.sin(x*0.05+t*0.02);
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.lineTo(W,0);ctx.lineTo(0,0);ctx.closePath();ctx.fillStyle="rgba(150,200,255,0.08)";ctx.fill();
      for(let d=0;d<3;d++){
        const yp=20+d*15;
        ctx.beginPath();
        for(let x=0;x<=W;x+=6){
          const y2=yp+5*Math.sin(x*0.04+t*0.015+d*0.8);
          x===0?ctx.moveTo(x,y2):ctx.lineTo(x,y2);
        }
        ctx.strokeStyle=`rgba(100,160,255,${0.04+d*0.02})`;ctx.lineWidth=1.5;ctx.stroke();
      }
      creatures.forEach(c=>{
        c.x+=c.vx+0.1*Math.sin(t*0.03+c.phase);c.y+=c.vy+0.05*Math.cos(t*0.04+c.phase);
        if(c.x<0)c.x=W;if(c.x>W)c.x=0;if(c.y<20)c.y=H-20;if(c.y>H-10)c.y=30;
        ctx.beginPath();ctx.arc(c.x,c.y,c.size,0,Math.PI*2);ctx.fillStyle=`rgba(100,200,255,${0.25+0.2*Math.sin(t*0.05+c.phase)})`;ctx.fill();
      });
      ctx.fillStyle="rgba(68,170,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UNDER-ICE ECOSYSTEM · BIOLUMINESCENCE · HYDROTHERMAL · CRYOSPHERE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UnderIceEcosystemPage() {
  return (
    <div
      style={{ background: B.bg, color: B.ink, minHeight: "100vh", padding: "48px 24px 96px" }}
      data-testid="page-under-ice-ecosystem"
    >
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{flexShrink:0,marginBottom:20}}>
          <div style={{display:"inline-block",border:"1px solid #44aaff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44aaff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
          <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44aaff",borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44aaff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>UNDER-ICE ECOSYSTEM · BIOLUMINESCENCE · HYDROTHERMAL · CRYOSPHERE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,170,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>8 bioluminescent creatures under ice sheets — the live AETHER under-ice simulation.</p></div>
            <UnderIceEcosystemHeaderCanvas />
          </div>
        </div>
        {/* HEADER */}
        <header style={{ marginBottom: 36 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 3, color: B.dim, textTransform: "uppercase", marginBottom: 10 }}>
            AETHER · Hidden Biosphere · George VI · Jan 2025
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 44, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500, lineHeight: 1.1 }}>
            Under the Ice · A Sealed Ecosystem Surfaces
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, lineHeight: 1.7, color: B.dim, marginTop: 14, maxWidth: 760 }}>
            In January 2025 a chunk of the George VI Ice Shelf roughly the size of Chicago calved away from
            Antarctica. The Schmidt Ocean Institute's R/V <em>Falkor (Too)</em> moved in over the newly
            exposed seafloor and found life thriving in a place that, until then, no one had ever looked.
            Phantom jellyfish, sponges large enough to suggest centuries of growth, a small crab perched on
            one — and at least six new species. This page collects what was seen, what is unknown, and what
            it bridges to inside AETHER.
          </p>
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <Chip color={B.cyan}>open data · schmidt ocean institute</Chip>
            <Chip color={B.gold}>january 2025</Chip>
            <Chip color={B.violet}>return planned · 2028</Chip>
          </div>
        </header>

        <div style={{ marginBottom:36 }}>
          <div style={{ display:"inline-block", background:"rgba(124,215,255,0.1)", border:"1px solid rgba(124,215,255,0.3)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.cyan, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:B.panel, border:`1px solid ${B.line}`, borderLeft:`3px solid ${B.ice}`,
            borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:'"Cinzel",serif', fontSize:18, color:B.ink, margin:"0 0 6px", fontVariant:"small-caps" }}>
              Under-Ice Ecosystem · Crystal Lattice · Brine Channels · Organisms
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:B.dim, margin:"0 0 14px", lineHeight:1.65 }}>
              Below Antarctic ice shelves, hexagonal ice crystals (top) lock in brine channels that drain salt into the water column,
              creating currents that sustain krill, diatoms, and copepods. The newly exposed George VI seafloor hosts ecosystems
              that have not seen light in millennia.
            </p>
            <UnderIceCanvas />
          </div>
        </div>

        {/* §01 What was found */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="What Was Found" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <P>
                The George VI Ice Shelf sits on the western side of the Antarctic Peninsula. A massive
                tabular iceberg calved from it in January 2025, opening a seafloor that had been roofed
                by ice for an unknown but very long time. The Schmidt Ocean Institute's research vessel
                <em> Falkor (Too)</em> repositioned to the site and ran a remotely operated vehicle along
                the floor of the now-exposed cavity.
              </P>
              <P>
                The expectation was a sparse, slow, energy-starved scene. What the cameras returned
                instead was a structured community: large encrusting sponges, soft corals, brittle
                stars, anemones, and at least one phantom jellyfish drifting in the water column. A
                small crab was visible on top of a sponge — a casual signal that this is not a relict
                graveyard but a living assemblage.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.gold}>observed</Chip>{" "}
                <Chip color={B.violet}>predicted · centuries-old growth</Chip>
              </div>
            </Card>
            <Card accent={B.ice}>
              <IceShelfGlyph />
            </Card>
          </div>
        </section>

        {/* §02 The inhabitants */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="The Inhabitants · A Short Bestiary" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 20 }}>
            <Card accent={B.violet}>
              <PhantomJellyGlyph />
            </Card>
            <Card accent={B.violet}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-inhabitants">
                <thead>
                  <tr>
                    <Th>Creature</Th>
                    <Th>What it tells us</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td accent={B.violet}>Phantom jellyfish</Td>
                    <Td>Rare deep-water predator. Its presence implies a stable column with prey to hunt.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.gold}>Large encrusting sponges</Td>
                    <Td>Sponges grow slowly. Specimens of this size suggest the cavity has supported life for a very long stretch.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.rose}>Crab on sponge</Td>
                    <Td>An active grazer. A casual but loud signal that this is a working food web, not a fossil scene.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.green}>Soft corals · anemones · brittle stars</Td>
                    <Td>Filter-feeders and scavengers — exactly what a current-fed ecosystem is built around.</Td>
                  </tr>
                  <tr>
                    <Td accent={B.cyan}>Six new species (so far)</Td>
                    <Td>Identifications are still in progress. The number is expected to grow as samples are worked through.</Td>
                  </tr>
                </tbody>
              </table>
            </Card>
          </div>
        </section>

        {/* §03 Life without light */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="Life Without Light · The Energy Question" accent={B.amber} />
          <Card accent={B.amber}>
            <P>
              Almost every familiar food web on Earth begins with sunlight. Plants and algae photosynthesize;
              everything else eats them or eats something that did. Under hundreds of metres of permanent ice,
              none of that is available. The water is dark and cold and has been for as long as anyone can
              measure. So the question becomes blunt: what is feeding this place?
            </P>
            <P>
              Three candidate answers, in roughly the order taken seriously by the team:
            </P>
            <ol style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, lineHeight: 1.7, color: B.ink, paddingLeft: 22, margin: 0 }}>
              <li>
                <strong style={{ color: B.cyan }}>Imported organic matter.</strong> Ocean currents flow in
                from the open sea carrying particulates, plankton remains, and dissolved nutrients. The
                cavity becomes a kind of slow conveyor-fed pantry.
              </li>
              <li style={{ marginTop: 6 }}>
                <strong style={{ color: B.green }}>Chemosynthesis.</strong> Microbial communities at the
                seafloor that pull energy from chemistry rather than light — a known pattern at hydrothermal
                vents and cold seeps, plausible here at lower intensity.
              </li>
              <li style={{ marginTop: 6 }}>
                <strong style={{ color: B.violet }}>Combinations and cycles we have not named yet.</strong>
                {" "}With a previously unsampled biosphere, surprises are the baseline expectation.
              </li>
            </ol>
            <div style={{ marginTop: 12 }}>
              <Chip color={B.violet}>predicted · ranked by current evidence</Chip>
            </div>
          </Card>
        </section>

        {/* §04 Currents as conveyor */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Currents as Conveyor · The Nutrient-Delivery Hypothesis" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <P>
                The leading working hypothesis is that ocean currents — driven by the broader Antarctic
                Circumpolar system and by tidal pumping along the shelf edge — circulate water through the
                cavity, dropping off nutrient parcels along the way. The community on the floor is then a
                filter-feeder economy positioned along that flow.
              </P>
              <P>
                If this is right, two things follow. First, the community structure should mirror the
                current pattern — denser life along the inflow paths, thinner along the eddies. Second,
                shifting currents (warming, calving, melt) would directly reshape who lives there. A
                hidden biosphere becomes a sensitive read-out of the larger circulation.
              </P>
              <div style={{ marginTop: 8 }}>
                <Chip color={B.violet}>predicted · primary mechanism</Chip>{" "}
                <Chip color={B.gold}>testable in 2028 return</Chip>
              </div>
            </Card>
            <Card accent={B.cyan}>
              <CurrentGlyph />
            </Card>
          </div>
        </section>

        {/* §05 Open access */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="Open Access · Why This Discovery Travels Fast" accent={B.green} />
          <Card accent={B.green}>
            <P>
              The Schmidt Ocean Institute publishes its dive data, video, and live ROV streams under an
              open-access policy. That single design choice is doing a lot of the heavy lifting here.
              A handful of people on a ship saw these animals first; thousands of researchers around the
              world can now identify, classify, model, and argue over the same footage without waiting
              years for paywalled publications.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }} data-testid="table-open-access">
              <thead>
                <tr>
                  <Th>Asset</Th>
                  <Th>What it enables</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>Live ROV video streams</Td>
                  <Td>Anyone with internet watches discovery in real time. Reduces the lag between observation and explanation.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Open dive data archive</Td>
                  <Td>Sensor logs, navigation, water-column readings. Lets independent groups reproduce or contest interpretations.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Sample distribution</Td>
                  <Td>Specimens go to multiple institutions for parallel taxonomy. New-species counts grow accordingly.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Public communication</Td>
                  <Td>Public sees the science as it happens — not as a finished press release.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §06 Return 2028 */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="Return · 2028 · What the Next Visit Is For" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              The team plans to return in 2028. The 2025 dive was a discovery sprint — find what is there
              before currents, ice movement, or sediment redistribute it. The 2028 visit is the followup
              the discovery earned.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 6 }} data-testid="table-return-goals">
              <thead>
                <tr>
                  <Th>Goal</Th>
                  <Th>Why it matters</Th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.cyan}>Re-image the same transects</Td>
                  <Td>Three years of change. Establishes a baseline rate of community shift in a freshly opened cavity.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>Sample currents directly</Td>
                  <Td>Tests the nutrient-delivery hypothesis. Either currents carry the food, or they do not.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>Date the sponges</Td>
                  <Td>Sponge growth bands give an estimate of how long this hidden world has been operating undisturbed.</Td>
                </tr>
                <tr>
                  <Td accent={B.violet}>Sequence the new species</Td>
                  <Td>DNA barcoding tells us where these lineages branched off — and how isolated this pocket really was.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* §07 Why this is in AETHER */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="Why This Sits Inside AETHER" accent={B.rose} />
          <Card accent={B.rose}>
            <P>
              Three reasons. First, the discovery is a literal AETHER pattern: a sealed shell opens, and a
              previously hidden interior turns out to be alive and structured. Second, it argues for the
              same circulation-and-current logic that runs through the heliospheric pages — flow as the
              delivery mechanism for whatever life downstream needs. Third, it is a working example of how
              open data accelerates discovery: the recovery framing in this system rests on the same trust
              that what gets seen, gets shared.
            </P>
          </Card>
        </section>

        {/* §08 Bridges */}
        <section data-testid="section-bridges">
          <H num="08" label="Bridges · Where This Page Connects" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/biology" label="Biology Frame" sub="Life as filter and feedback — sponges as living archives." accent={B.green} />
            <Bridge to="/heliospheric-coherence" label="Heliospheric Coherence" sub="Currents as delivery — same logic, different scale." accent={B.cyan} />
            <Bridge to="/universal-grammar" label="Universal Grammar of Life" sub="A new pocket biosphere is a new sentence in the same grammar." accent={B.violet} />
            <Bridge to="/lattice" label="CGLE Lattice" sub="Distributed structure under a shared field — the lattice metaphor at sea." accent={B.cyan} />
            <Bridge to="/aether-egg-engine" label="Egg Engine · Reinforcement" sub="Sealed shell, hidden seed, opening event — the engine in geophysical form." accent={B.gold} />
            <Bridge to="/engines" label="Mastered Engines" sub="Where the broader engine roster lives." accent={B.amber} />
          </div>
        </section>

      </div>
    </div>
  );
}

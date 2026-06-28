import { useEffect, useRef, useState } from "react";

const BG    = "#04060E";
const GOLD  = "#C8A030";
const AURORA = "#00FFB2";
const MONO  = "'Space Mono', monospace";
const DISP  = "'Cinzel', serif";
const SERIF = "'Crimson Pro', serif";

/* ── Filled-area samplers (module scope) ─────────────────
   These build dense point clouds from geometric primitives,
   giving the particle swarm a solid silhouette to assemble. */
function fillEllipse(cx:number,cy:number,rx:number,ry:number,n:number):{x:number,y:number}[] {
  const pts:{x:number,y:number}[]=[];let tries=0;
  while(pts.length<n&&tries++<n*10){
    const x=cx+(Math.random()*2-1)*rx, y=cy+(Math.random()*2-1)*ry;
    if((x-cx)*(x-cx)/(rx*rx)+(y-cy)*(y-cy)/(ry*ry)<=1) pts.push({x,y});
  }
  return pts;
}
function fillTri(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,n:number):{x:number,y:number}[] {
  const pts:{x:number,y:number}[]=[];
  for(let i=0;i<n;i++){
    let r1=Math.random(),r2=Math.random();
    if(r1+r2>1){r1=1-r1;r2=1-r2;}
    pts.push({x:x1+r1*(x2-x1)+r2*(x3-x1),y:y1+r1*(y2-y1)+r2*(y3-y1)});
  }
  return pts;
}
function fillRect(x:number,y:number,w:number,h:number,n:number):{x:number,y:number}[] {
  const pts:{x:number,y:number}[]=[];
  for(let i=0;i<n;i++) pts.push({x:x+Math.random()*w,y:y+Math.random()*h});
  return pts;
}

/* ── Egyptian Sacred Animal Silhouette Point Sets ─────────
   Each function returns ~280-320 filled points so every
   particle maps to a unique interior target, producing a
   solid recognizable body rather than a sparse outline. */

function falconPts():{x:number,y:number}[] {   // Horus / Ra
  const p:{x:number,y:number}[]=[];
  p.push(...fillEllipse(0.50,-0.10, 0.12,0.12, 32));         // head
  p.push(...fillTri(0.62,-0.13, 0.96,-0.08, 0.62,-0.03, 18));// beak
  p.push(...fillEllipse(0.58,-0.14, 0.02,0.02, 6));           // eye
  p.push(...fillEllipse(0.05,0.02, 0.42,0.18, 72));           // body
  p.push(...fillEllipse(-0.06,-0.30, 0.54,0.14, 88));         // upper wing sweep
  p.push(...fillEllipse(0.10,-0.14, 0.30,0.08, 40));          // secondary wing fold
  p.push(...fillTri(-0.48,-0.10,-0.48,0.10,-0.86,0.00, 30)); // center tail
  p.push(...fillTri(-0.46,-0.03,-0.82,-0.26,-0.60,0.07, 12));// upper tail fan
  p.push(...fillTri(-0.46,0.03,-0.82,0.26,-0.60,-0.07, 12)); // lower tail fan
  p.push(...fillRect(-0.10,0.19, 0.07,0.22, 10));             // left leg
  p.push(...fillRect(0.10,0.19, 0.07,0.22, 10));              // right leg
  p.push(...fillRect(-0.14,0.40, 0.04,0.04, 5));              // left talon spread
  p.push(...fillRect(0.10,0.40, 0.04,0.04, 5));               // right talon spread
  return p;
}

function jackalPts():{x:number,y:number}[] {   // Anubis
  const p:{x:number,y:number}[]=[];
  p.push(...fillEllipse(-0.05,0.14, 0.29,0.26, 70));  // seated haunches
  p.push(...fillEllipse(0.14,-0.08, 0.14,0.24, 36));  // chest / neck
  p.push(...fillEllipse(0.22,-0.34, 0.15,0.14, 34));  // skull
  p.push(...fillTri(0.26,-0.27, 0.58,-0.34, 0.26,-0.48, 26)); // long muzzle
  p.push(...fillTri(0.12,-0.44, 0.20,-0.82, 0.30,-0.44, 20)); // left tall ear
  p.push(...fillTri(0.30,-0.42, 0.38,-0.76, 0.48,-0.42, 16)); // right ear (slightly back)
  p.push(...fillRect(0.16,0.14, 0.09,0.30, 16));   // foreleg
  p.push(...fillRect(-0.28,0.18, 0.08,0.22, 12));  // hind haunch
  // Curved tail arching upward
  for(let i=0;i<32;i++){const t=i/31,ang=0.9-t*3.1,r=0.42-t*0.10;p.push({x:-0.18+Math.cos(ang)*r,y:0.28+Math.sin(ang)*r*0.56});}
  return p;
}

function scarabPts():{x:number,y:number}[] {   // Khepri
  const p:{x:number,y:number}[]=[];
  p.push(...fillEllipse(0,0.10, 0.37,0.44, 95));            // main carapace body
  p.push(...fillEllipse(-0.19,-0.08, 0.20,0.36, 46));       // left wing case
  p.push(...fillEllipse( 0.19,-0.08, 0.20,0.36, 46));       // right wing case
  p.push(...fillEllipse(0,-0.46, 0.17,0.12, 28));           // head / clypeus
  p.push(...fillTri(-0.16,-0.50, 0.16,-0.50, 0.00,-0.68, 16)); // cephalic horn
  // Six articulated legs (3 per side)
  ([[-0.40,0.0],[-0.46,0.18],[-0.40,0.36]] as [number,number][]).forEach(([x,y])=>
    p.push(...fillRect(x-0.14,y,0.14,0.05,9)));
  ([[0.26,0.0],[0.32,0.18],[0.26,0.36]] as [number,number][]).forEach(([x,y])=>
    p.push(...fillRect(x,y,0.14,0.05,9)));
  return p;
}

function cobraPts():{x:number,y:number}[] {   // Wadjet / Uraeus
  const p:{x:number,y:number}[]=[];
  // Coiled base ring
  for(let i=0;i<55;i++){const ang=i/54*Math.PI*2,r=0.20+Math.random()*0.10;p.push({x:Math.cos(ang)*r,y:0.46+Math.sin(ang)*r*0.38});}
  // Ascending S-curve body with slight thickness
  for(let i=0;i<48;i++){const t=i/47,y=0.32-t*0.74,xc=Math.sin(t*Math.PI)*0.18*(1-t*0.48);
    p.push({x:xc+(Math.random()-0.5)*0.04,y:y+(Math.random()-0.5)*0.02});}
  // Spread hood (fan)
  p.push(...fillEllipse(0,-0.40, 0.34,0.22, 70));
  p.push(...fillTri(-0.32,-0.28, 0.32,-0.28, 0.00,-0.68, 48));
  // Head at apex
  p.push(...fillEllipse(0,-0.60, 0.10,0.12, 26));
  return p;
}

function ibisPts():{x:number,y:number}[] {   // Thoth
  const p:{x:number,y:number}[]=[];
  p.push(...fillEllipse(-0.06,0.06, 0.32,0.30, 80)); // round body
  p.push(...fillEllipse(-0.22,-0.02, 0.18,0.24, 32));// trailing wing fold
  p.push(...fillEllipse(0.13,-0.20, 0.09,0.20, 26)); // neck
  p.push(...fillEllipse(0.18,-0.43, 0.12,0.12, 28)); // small round head
  // Characteristic long downward-curved sickle beak
  for(let i=0;i<46;i++){const t=i/45,ang=-0.44-t*2.5,r=0.08+t*0.40;
    p.push({x:0.18+Math.cos(ang)*r,y:-0.43+Math.sin(ang)*r*0.72+(Math.random()-0.5)*0.03});}
  p.push(...fillRect(-0.16,0.36, 0.06,0.38, 16)); // left leg
  p.push(...fillRect(0.02,0.36, 0.06,0.38, 16));  // right leg
  // Toe spread at base
  p.push(...fillRect(-0.22,0.73, 0.12,0.03, 6));
  p.push(...fillRect(0.00,0.73, 0.12,0.03, 6));
  return p;
}

type RGB = [number,number,number];
const SOLAR:  RGB = [240,168,40];   // falcon gold
const LAPIS:  RGB = [70,100,200];   // jackal lapis
const JADE:   RGB = [36,190,140];   // scarab jade
const FIRE:   RGB = [220,70,50];    // cobra flame
const SKY:    RGB = [40,172,235];   // ibis sky

function rgbA(c:RGB,a:number){return `rgba(${c[0]},${c[1]},${c[2]},${a})`;}
function lerpCol(a:RGB,b:RGB,f:number):RGB{return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];}

const ANIMALS = [
  {
    name: "Horus Falcon", glyph: "𓅺", col: SOLAR,
    role: "Divine Kingship -- Eye of Horus -- God of the Sky",
    lore: "Horus (Heru) soared above all creation as the celestial falcon. The living pharaoh was his earthly incarnation. His right eye was the sun, his left the moon. The Eye of Horus -- the Wadjet -- became the most powerful amulet of protection in ancient Egypt, worn by the living and buried with the dead.",
    pts: falconPts(),
  },
  {
    name: "Anubis Jackal", glyph: "𓃘", col: LAPIS,
    role: "Guardian of the Dead -- Weigher of Hearts -- Embalming",
    lore: "Anubis (Inpu), the black jackal, guided souls through the Duat, the realm of the dead. He held the scales on which the heart was weighed against the feather of Ma'at. If balanced, the soul entered paradise. Anubis presided over mummification -- his priests wore jackal masks during burial rites -- for the jackal was seen prowling graveyards at dusk.",
    pts: jackalPts(),
  },
  {
    name: "Khepri Scarab", glyph: "𓆣", col: JADE,
    role: "God of Rebirth -- Morning Sun -- Resurrection",
    lore: "The scarab beetle, Khepri, rolled its dung ball across the desert just as the sun god rolled the solar disk across the sky at dawn. This simple act of rolling -- creation from nothing -- became the supreme metaphor for resurrection and regeneration. Millions of scarab amulets were carved from lapis lazuli, carnelian, and faience, placed over the hearts of mummies.",
    pts: scarabPts(),
  },
  {
    name: "Wadjet Cobra", glyph: "𓆙", col: FIRE,
    role: "Royal Uraeus -- Divine Protection -- Lower Egypt",
    lore: "Wadjet, the cobra goddess of Lower Egypt, reared from the pharaoh's brow as the Uraeus -- the rearing cobra crown ornament. She spat fire at the enemies of the king. Every pharaoh wore the Uraeus to signal divine authority. Paired with Nekhbet (the vulture of Upper Egypt) on the double crown, Wadjet united the Two Lands under one sovereign.",
    pts: cobraPts(),
  },
  {
    name: "Thoth Ibis", glyph: "𓅝", col: SKY,
    role: "God of Wisdom -- Scribes -- Moon -- Magic -- Writing",
    lore: "Thoth (Djehuty), the ibis-headed god, invented writing and mathematics. He recorded the verdict at the Weighing of the Heart. He gave humanity language, measured time with the moon, and mediated between Horus and Set. The sacred ibis was mummified by the millions at Hermopolis -- his city. To harm an ibis was a crime punishable by death.",
    pts: ibisPts(),
  },
];

const FORM_DUR = 130, HOLD_DUR = 130, DISP_DUR = 60, N = 300;

export default function AnimalSilhouettesPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const nameRef     = useRef<HTMLDivElement>(null);
  const [wellLabel, setWellLabel] = useState("Attract");
  const [loreIdx,   setLoreIdx]   = useState(0);
  const wellModeRef   = useRef<"attract"|"repel">("attract");
  const animalIdxRef  = useRef(0);
  const triggerRef    = useRef({ scatter: false, next: false });

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const DPR = Math.min(window.devicePixelRatio||1, 2);

    function resize(){
      const r = canvas!.getBoundingClientRect();
      canvas!.width  = Math.round(r.width  * DPR);
      canvas!.height = Math.round(r.height * DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    resize(); window.addEventListener("resize", resize);

    const W = () => canvas!.width  / DPR;
    const H = () => canvas!.height / DPR;

    let particles = Array.from({length:N},(_,i)=>({
      x: Math.random()*W(), y: Math.random()*H(),
      vx:(Math.random()-0.5)*1.5, vy:(Math.random()-0.5)*1.5,
      flickerPhase:Math.random()*Math.PI*2,
      flickerSpeed:0.07+Math.random()*0.10,
      tid: i,
    }));

    let phase:"form"|"hold"|"disperse" = "form";
    let phaseTimer = 0, t = 0;
    let wells:{x:number,y:number,strength:number,sign:number,alpha:number,fading:boolean}[] = [];
    let dragWell:typeof wells[0]|null = null;
    let pointerDown=false, startX=0, startY=0, startTime=0;

    function getTarget(p:typeof particles[0]){
      const animal = ANIMALS[animalIdxRef.current];
      const src = animal.pts[p.tid % animal.pts.length];
      const sc = Math.min(W(),H())*0.38;
      return {x:W()/2+src.x*sc, y:H()*0.47+src.y*sc};
    }

    function scatter(){
      particles.forEach(p=>{
        const ang=Math.random()*Math.PI*2, sp=1.6+Math.random()*2.8;
        p.vx=Math.cos(ang)*sp; p.vy=Math.sin(ang)*sp;
      });
    }

    canvas.addEventListener("pointerdown",e=>{
      pointerDown=true; dragWell=null;
      const r=canvas!.getBoundingClientRect();
      startX=e.clientX-r.left; startY=e.clientY-r.top; startTime=performance.now();
    });
    canvas.addEventListener("pointermove",e=>{
      if(!pointerDown) return;
      const r=canvas!.getBoundingClientRect();
      const mx=e.clientX-r.left, my=e.clientY-r.top;
      const dist=Math.hypot(mx-startX,my-startY), held=performance.now()-startTime;
      if(!dragWell&&(dist>9||held>160)){
        dragWell={x:mx,y:my,strength:0.4,sign:wellModeRef.current==="attract"?1:-1,alpha:1,fading:false};
        wells.push(dragWell);
        if(wells.length>2) wells[0].fading=true;
      }
      if(dragWell){dragWell.x=mx;dragWell.y=my;dragWell.strength=Math.min(dragWell.strength+0.02,1.8);}
    });
    const endP=()=>{if(dragWell){dragWell.fading=true;dragWell=null;}pointerDown=false;};
    canvas.addEventListener("pointerup",endP);
    canvas.addEventListener("pointercancel",endP);

    let rafId=0;
    function frame(){
      t++;
      const w=W(), h=H();

      // Trail fade
      ctx.fillStyle="rgba(4,6,14,0.20)"; ctx.fillRect(0,0,w,h);

      // Pyramid silhouette backdrop (very faint)
      const pw=Math.min(w*0.72,360), ph=pw*0.62, pcx=w/2, pby=h*0.88;
      ctx.beginPath(); ctx.moveTo(pcx-pw/2,pby); ctx.lineTo(pcx,pby-ph); ctx.lineTo(pcx+pw/2,pby); ctx.closePath();
      ctx.strokeStyle="rgba(200,160,48,0.035)"; ctx.lineWidth=1; ctx.stroke();
      // Horizon line
      ctx.beginPath(); ctx.moveTo(0,pby); ctx.lineTo(w,pby);
      ctx.strokeStyle="rgba(200,160,48,0.02)"; ctx.lineWidth=0.5; ctx.stroke();
      // Second small pyramid (right)
      const pw2=pw*0.48, pcx2=pcx+pw*0.68;
      ctx.beginPath(); ctx.moveTo(pcx2-pw2/2,pby); ctx.lineTo(pcx2,pby-ph*0.62); ctx.lineTo(pcx2+pw2/2,pby); ctx.closePath();
      ctx.strokeStyle="rgba(200,160,48,0.02)"; ctx.stroke();

      // Phase transitions
      phaseTimer++;
      if(triggerRef.current.scatter){
        triggerRef.current.scatter=false; scatter(); phase="disperse"; phaseTimer=0;
        if(nameRef.current) nameRef.current.innerHTML="";
      }
      if(triggerRef.current.next){
        triggerRef.current.next=false;
        const nextIdx=(animalIdxRef.current+1)%ANIMALS.length;
        animalIdxRef.current=nextIdx;
        if(nameRef.current) nameRef.current.innerHTML="";
        phase="disperse"; phaseTimer=0; scatter();
        // update lore panel via React state: we'll read it from the ref in frame
      }
      if(phase==="form"&&phaseTimer>FORM_DUR){
        phase="hold"; phaseTimer=0;
        const a=ANIMALS[animalIdxRef.current];
        if(nameRef.current) nameRef.current.innerHTML=`<span style="font-size:26px;letter-spacing:3px">${a.glyph}</span>&thinsp;${a.name}`;
      } else if(phase==="hold"&&phaseTimer>HOLD_DUR){
        phase="disperse"; phaseTimer=0;
        if(nameRef.current) nameRef.current.innerHTML="";
        scatter();
      } else if(phase==="disperse"&&phaseTimer>DISP_DUR){
        animalIdxRef.current=(animalIdxRef.current+1)%ANIMALS.length;
        phase="form"; phaseTimer=0;
      }

      wells=wells.filter(wl=>wl.alpha>0.01);
      wells.forEach(wl=>{if(wl.fading){wl.strength*=0.93;wl.alpha*=0.92;}});

      const col   = ANIMALS[animalIdxRef.current].col;
      const prev  = ANIMALS[(animalIdxRef.current+ANIMALS.length-1)%ANIMALS.length].col;
      const dispF = phase==="disperse" ? Math.min(phaseTimer/DISP_DUR,1) : 0;
      const drawCol = lerpCol(col,prev,dispF*0.5);

      ctx.save();
      ctx.globalCompositeOperation="lighter";
      particles.forEach(p=>{
        let fx=0,fy=0;
        if(phase==="form"||phase==="hold"){
          const tgt=getTarget(p);
          const jit=phase==="hold"?1.8:0;
          const tx=tgt.x+Math.sin(t*0.05+p.flickerPhase)*jit;
          const ty=tgt.y+Math.cos(t*0.05+p.flickerPhase)*jit;
          const dx=tx-p.x, dy=ty-p.y, d=Math.hypot(dx,dy)||0.01;
          const pull=Math.min(d*0.018,2.0);
          fx+=dx/d*pull; fy+=dy/d*pull;
        } else { fy+=0.015; }
        wells.forEach(wl=>{
          const dx=wl.x-p.x, dy=wl.y-p.y, d=Math.hypot(dx,dy)||0.01;
          if(d<200){const f=wl.strength*3600/(d*d+400);fx+=dx/d*f*wl.sign*0.045;fy+=dy/d*f*wl.sign*0.045;}
        });
        p.vx=(p.vx+fx)*0.87; p.vy=(p.vy+fy)*0.87;
        p.x=Math.max(2,Math.min(w-2,p.x+p.vx));
        p.y=Math.max(2,Math.min(h-2,p.y+p.vy));
        const flicker=phase==="hold"?(0.60+0.40*Math.sin(t*p.flickerSpeed+p.flickerPhase)):0.82;
        // Glow halo
        ctx.beginPath(); ctx.arc(p.x,p.y,5.5,0,Math.PI*2);
        ctx.fillStyle=rgbA(drawCol,0.07*flicker); ctx.fill();
        // Core dot
        ctx.beginPath(); ctx.arc(p.x,p.y,1.8,0,Math.PI*2);
        ctx.fillStyle=rgbA(drawCol,0.90*flicker); ctx.fill();
      });

      // Connecting lines during hold (threshold reduced to 16 for denser mesh)
      if(phase==="hold"){
        for(let i=0;i<N;i++) for(let j=i+1;j<N;j++){
          const a=particles[i], b=particles[j];
          const dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy);
          if(d<16){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=rgbA(drawCol,(1-d/16)*0.18);ctx.lineWidth=0.5;ctx.stroke();}
        }
      }

      wells.forEach(wl=>{
        const bc:RGB=wl.sign>0?[120,170,255]:[255,130,90];
        for(let k=2;k>=1;k--){ctx.beginPath();ctx.arc(wl.x,wl.y,8+k*10,0,Math.PI*2);ctx.strokeStyle=rgbA(bc,wl.alpha*0.08/k);ctx.lineWidth=0.8;ctx.stroke();}
        ctx.beginPath();ctx.arc(wl.x,wl.y,4,0,Math.PI*2);ctx.fillStyle=rgbA(bc,wl.alpha*0.7);ctx.fill();
      });
      ctx.restore();
      rafId=requestAnimationFrame(frame);
    }
    frame();
    return ()=>{cancelAnimationFrame(rafId);window.removeEventListener("resize",resize);};
  },[]);

  function toggleWell(){
    const next=wellModeRef.current==="attract"?"repel":"attract";
    wellModeRef.current=next; setWellLabel(next==="attract"?"Attract":"Repel");
  }

  const btnStyle:React.CSSProperties={
    fontFamily:MONO,fontSize:10,letterSpacing:2,textTransform:"uppercase",
    padding:"8px 18px",border:"1px solid rgba(200,160,48,0.28)",
    background:"rgba(200,160,48,0.05)",color:"#c0b080",
    cursor:"pointer",borderRadius:2,transition:"all 0.2s",
  };

  const loreDivStyle:React.CSSProperties={
    fontFamily:SERIF,fontSize:15,color:"#9a8870",lineHeight:1.75,
    maxWidth:580,textAlign:"center",
    border:"1px solid rgba(200,160,48,0.10)",
    background:"rgba(200,160,48,0.025)",
    borderRadius:4,padding:"14px 20px",
  };

  return (
    <div style={{background:BG,minHeight:"100vh",color:"#c8c0b0",fontFamily:SERIF}}>

      {/* Header */}
      <div style={{padding:"40px 40px 24px",borderBottom:"1px solid rgba(200,160,48,0.12)"}}>
        <div style={{fontFamily:MONO,fontSize:8,letterSpacing:4,color:AURORA,marginBottom:10,textTransform:"uppercase"}}>
          AETHER -- Ancient Egypt -- Sacred Bestiary -- Particle Morphogenesis
        </div>
        <h1 style={{fontFamily:DISP,fontSize:28,color:"#e8dfc8",letterSpacing:3,marginBottom:8}}>
          Egyptian Sacred Bestiary
        </h1>
        <p style={{fontFamily:SERIF,fontSize:15,color:"#887868",lineHeight:1.7,maxWidth:640,marginBottom:14}}>
          300 particles assemble the sacred animals of ancient Egypt -- Horus, Anubis, Khepri,
          Wadjet, Thoth -- into filled hieroglyphic silhouettes. Drag to open a gravity well.
          Each form crystallizes, holds, then disperses back into the void.
        </p>
        {/* Animal roster */}
        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
          {ANIMALS.map(a=>(
            <div key={a.name} style={{display:"flex",flexDirection:"column",gap:2}}>
              <span style={{fontFamily:MONO,fontSize:11,color:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.75)`,letterSpacing:1}}>
                {a.glyph} {a.name.toUpperCase()}
              </span>
              <span style={{fontFamily:SERIF,fontSize:11,color:"rgba(200,160,48,0.35)",letterSpacing:0.5}}>
                {a.role.split(" -- ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas area */}
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 40px 48px",gap:18}}>

        {/* Pyramid + canvas label */}
        <div style={{fontFamily:MONO,fontSize:7,color:"rgba(200,160,48,0.28)",letterSpacing:5,textTransform:"uppercase"}}>
          Giza · Saqqara · Karnak · Luxor · Abu Simbel
        </div>

        <canvas
          ref={canvasRef}
          style={{
            display:"block",
            width:"min(600px,100%)",
            aspectRatio:"1/1",
            borderRadius:6,
            background:"#030508",
            cursor:"crosshair",
            touchAction:"none",
            border:"1px solid rgba(200,160,48,0.14)",
            boxShadow:"0 0 60px rgba(200,160,48,0.04)",
          }}
        />

        {/* Animal name + glyph — updated by the animation loop */}
        <div ref={nameRef} style={{
          fontFamily:DISP,fontSize:20,color:"#e8dfc8",
          minHeight:32,textAlign:"center",letterSpacing:3,
        }} />

        {/* Controls */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          <button style={btnStyle} onClick={()=>{triggerRef.current.next=true;}}>
            Next Animal &#9658;
          </button>
          <button style={btnStyle} onClick={toggleWell}>
            Well: {wellLabel}
          </button>
          <button style={btnStyle} onClick={()=>{triggerRef.current.scatter=true;}}>
            &#10022; Scatter
          </button>
        </div>

        {/* Lore card for current animal (static display of all 5) */}
        <div style={{width:"100%",maxWidth:600,display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
          {ANIMALS.map((a,i)=>(
            <div key={a.name} style={{
              border:`1px solid rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.18)`,
              background:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.03)`,
              borderRadius:4,padding:"14px 18px",
            }}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6}}>
                <span style={{fontFamily:DISP,fontSize:18,color:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.9)`}}>{a.glyph}</span>
                <span style={{fontFamily:DISP,fontSize:13,color:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.85)`,letterSpacing:1}}>{a.name}</span>
                <span style={{fontFamily:MONO,fontSize:8,color:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.45)`,letterSpacing:1,textTransform:"uppercase"}}>{a.role}</span>
              </div>
              <p style={{fontFamily:SERIF,fontSize:14,color:"#8a7a68",lineHeight:1.72,margin:0}}>{a.lore}</p>
            </div>
          ))}
        </div>

        {/* World pyramid heritage note */}
        <div style={{
          width:"100%",maxWidth:600,
          border:"1px solid rgba(200,160,48,0.12)",
          background:"rgba(200,160,48,0.025)",
          borderRadius:4,padding:"16px 20px",marginTop:4,
        }}>
          <div style={{fontFamily:MONO,fontSize:8,color:"rgba(200,160,48,0.5)",letterSpacing:3,marginBottom:8,textTransform:"uppercase"}}>
            World Heritage -- Pyramid Culture
          </div>
          <p style={{fontFamily:SERIF,fontSize:14,color:"#8a7a68",lineHeight:1.75,margin:0}}>
            The Great Pyramid of Giza stood as the tallest structure on Earth for 3,800 years.
            Egypt's sacred animals were not mythology -- they were a complete cosmological system
            mapping celestial mechanics, human psychology, and natural law into symbolic form.
            The same animals appeared in Mesopotamia (Babylon's zodiac), Greece (Zeus's eagle,
            Athena's owl), and Mesoamerica (the feathered serpent Quetzalcoatl). The sacred
            bestiary is a universal language. AETHER reads it as coherence architecture.
          </p>
        </div>

        {/* Info grid */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10,width:"100%",maxWidth:600,marginTop:4}}>
          {[
            ["Particles","300"],
            ["Animals","5 sacred forms"],
            ["Phase","Form -- Hold -- Disperse"],
            ["Well Modes","Attract / Repel"],
            ["Point Method","Filled-area sampling"],
            ["Heritage","Ancient Egypt, 3100 BCE"],
          ].map(([lbl,val])=>(
            <div key={lbl} style={{border:"1px solid rgba(200,160,48,0.10)",background:"rgba(200,160,48,0.02)",padding:"12px 14px",borderRadius:2}}>
              <div style={{fontFamily:MONO,fontSize:7,color:"rgba(200,160,48,0.4)",letterSpacing:2,marginBottom:5,textTransform:"uppercase"}}>{lbl}</div>
              <div style={{fontFamily:MONO,fontSize:10,color:GOLD}}>{val}</div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

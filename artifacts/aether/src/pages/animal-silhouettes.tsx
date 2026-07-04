import { useEffect, useRef, useState } from "react";

const BG    = "#04060E";
const GOLD  = "#C8A030";
const AURORA = "#00FFB2";
const MONO  = "'Space Mono', monospace";
const DISP  = "'Cinzel', serif";
const SERIF = "'Crimson Pro', serif";

/* ── Geometric fill samplers ──────────────────────────────── */
function fillEllipse(cx:number,cy:number,rx:number,ry:number,n:number):{x:number,y:number}[]{
  const pts:{x:number,y:number}[]=[];let tries=0;
  while(pts.length<n&&tries++<n*12){
    const x=cx+(Math.random()*2-1)*rx,y=cy+(Math.random()*2-1)*ry;
    if((x-cx)*(x-cx)/(rx*rx)+(y-cy)*(y-cy)/(ry*ry)<=1)pts.push({x,y});
  }
  return pts;
}
function fillTri(x1:number,y1:number,x2:number,y2:number,x3:number,y3:number,n:number):{x:number,y:number}[]{
  const pts:{x:number,y:number}[]=[];
  for(let i=0;i<n;i++){let r1=Math.random(),r2=Math.random();if(r1+r2>1){r1=1-r1;r2=1-r2;}pts.push({x:x1+r1*(x2-x1)+r2*(x3-x1),y:y1+r1*(y2-y1)+r2*(y3-y1)});}
  return pts;
}
function fillRect(x:number,y:number,w:number,h:number,n:number):{x:number,y:number}[]{
  const pts:{x:number,y:number}[]=[];
  for(let i=0;i<n;i++)pts.push({x:x+Math.random()*w,y:y+Math.random()*h});
  return pts;
}
/* Point-in-polygon sampler — enables any complex outline */
function fillPolygon(poly:[number,number][],n:number):{x:number,y:number}[]{
  let minX=poly[0][0],maxX=minX,minY=poly[0][1],maxY=minY;
  for(const[px,py]of poly){if(px<minX)minX=px;if(px>maxX)maxX=px;if(py<minY)minY=py;if(py>maxY)maxY=py;}
  const pts:{x:number,y:number}[]=[];let tries=0;
  while(pts.length<n&&tries<n*60){
    const x=minX+Math.random()*(maxX-minX),y=minY+Math.random()*(maxY-minY);
    let inside=false;
    for(let i=0,j=poly.length-1;i<poly.length;j=i++){
      const[xi,yi]=poly[i],[xj,yj]=poly[j];
      if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside;
    }
    if(inside)pts.push({x,y});tries++;
  }
  return pts;
}

/* ── HORUS FALCON (𓅺) — perched in side profile, facing right ──
   Distinctive: round head, hooked beak, folded wings, fan tail    */
function falconPts():{x:number,y:number}[]{
  const p:{x:number,y:number}[]=[];

  // Core body + head as one traced polygon
  p.push(...fillPolygon([
    [0.16,-0.68],[0.34,-0.66],[0.52,-0.58],
    [0.70,-0.44],[0.54,-0.28],[0.42,-0.18],
    [0.38,-0.02],[0.32,0.22],[0.26,0.42],
    [0.22,0.52],[0.22,0.68],[0.12,0.74],
    [0.02,0.78],[-0.08,0.74],[-0.08,0.68],
    [-0.10,0.52],[-0.16,0.52],[-0.18,0.68],
    [-0.30,0.74],[-0.28,0.58],[-0.30,0.38],
    [-0.32,0.14],[-0.30,-0.08],[-0.26,-0.36],
    [-0.08,-0.62],[0.16,-0.68],
  ],190));

  // Wing shoulder fold (visible strip across body)
  p.push(...fillTri(-0.20,-0.34,0.20,-0.40,0.18,0.04,48));

  // Tail fan (spreading left-down from body)
  p.push(...fillPolygon([
    [-0.26,0.36],[-0.30,0.40],
    [-0.62,0.36],[-0.80,0.52],[-0.70,0.66],
    [-0.36,0.56],[-0.22,0.58],
  ],58));

  // Crown crest (small ridge on top of head)
  p.push(...fillTri(0.14,-0.64,0.22,-0.80,0.30,-0.64,10));

  // Eye dot
  p.push(...fillEllipse(0.40,-0.56,0.028,0.024,6));

  return p;
}

/* ── ANUBIS JACKAL (𓃘) — seated, side profile, facing right ──
   Distinctive: extremely tall pointed ears, long sharp muzzle      */
function jackalPts():{x:number,y:number}[]{
  const p:{x:number,y:number}[]=[];

  // Seated haunches (large base)
  p.push(...fillEllipse(-0.04,0.36,0.33,0.28,82));

  // Chest / upright body
  p.push(...fillPolygon([
    [0.08,-0.02],[0.26,-0.06],[0.28,0.18],
    [0.24,0.36],[0.04,0.38],[-0.04,0.18],[-0.06,0.00],[0.08,-0.02],
  ],46));

  // Skull
  p.push(...fillEllipse(0.18,-0.28,0.17,0.15,42));

  // Long sharp muzzle (pointing right)
  p.push(...fillPolygon([
    [0.22,-0.18],[0.30,-0.15],
    [0.74,-0.20],[0.76,-0.30],[0.74,-0.38],
    [0.32,-0.36],[0.22,-0.36],[0.22,-0.18],
  ],52));

  // LEFT ear — very tall thin triangle (most distinctive feature)
  p.push(...fillPolygon([
    [0.02,-0.38],[0.12,-0.38],
    [0.14,-1.00],[0.04,-1.00],[0.02,-0.38],
  ],34));

  // RIGHT ear (slightly back, also tall)
  p.push(...fillPolygon([
    [0.18,-0.36],[0.28,-0.36],
    [0.30,-0.90],[0.20,-0.90],[0.18,-0.36],
  ],30));

  // Foreleg (upright, seated)
  p.push(...fillRect(0.12,0.36,0.10,0.28,20));

  // Hind haunch
  p.push(...fillEllipse(-0.22,0.44,0.14,0.20,22));

  // Tail arching up behind
  for(let i=0;i<40;i++){
    const t=i/39,ang=0.6-t*3.2,r=0.48-t*0.11;
    p.push({x:-0.12+Math.cos(ang)*r,y:0.36+Math.sin(ang)*r*0.52+(Math.random()-0.5)*0.04});
  }

  return p;
}

/* ── KHEPRI SCARAB (𓆣) — top-down view ──
   Distinctive: round split elytra, 6 articulated legs, central horn */
function scarabPts():{x:number,y:number}[]{
  const p:{x:number,y:number}[]=[];

  // Left elytron (wing case)
  p.push(...fillEllipse(-0.16,0.14,0.22,0.42,72));
  // Right elytron
  p.push(...fillEllipse( 0.16,0.14,0.22,0.42,72));
  // Pronotum (thorax shield)
  p.push(...fillEllipse(0.00,-0.08,0.20,0.16,34));
  // Head / clypeus
  p.push(...fillEllipse(0.00,-0.44,0.16,0.12,28));
  // Cephalic horn (pointing straight up)
  p.push(...fillPolygon([
    [-0.06,-0.52],[0.06,-0.52],[0.04,-0.84],[-0.04,-0.84],
  ],20));

  // THREE legs per side — each as a narrow slanted polygon
  const legL:[number,number][][]=[
    [[-0.34,-0.04],[-0.38,-0.00],[-0.66,0.12],[-0.62,0.20],[-0.28,0.08],[-0.24,0.04]],
    [[-0.34,0.16],[-0.38,0.18],[-0.70,0.32],[-0.66,0.40],[-0.28,0.26],[-0.24,0.24]],
    [[-0.32,0.34],[-0.36,0.38],[-0.62,0.58],[-0.58,0.66],[-0.26,0.44],[-0.22,0.40]],
  ];
  const legR:[number,number][][]=[
    [[0.34,-0.04],[0.38,-0.00],[0.66,0.12],[0.62,0.20],[0.28,0.08],[0.24,0.04]],
    [[0.34,0.16],[0.38,0.18],[0.70,0.32],[0.66,0.40],[0.28,0.26],[0.24,0.24]],
    [[0.32,0.34],[0.36,0.38],[0.62,0.58],[0.58,0.66],[0.26,0.44],[0.22,0.40]],
  ];
  for(const leg of [...legL,...legR]) p.push(...fillPolygon(leg,18));

  return p;
}

/* ── WADJET COBRA (𓆙) — rearing with spread hood ──
   Distinctive: wide fan hood, S-curve body, coiled base             */
function cobraPts():{x:number,y:number}[]{
  const p:{x:number,y:number}[]=[];

  // HOOD — the defining feature (large teardrop fan)
  p.push(...fillPolygon([
    [0.00,-0.24],
    [-0.16,-0.22],[-0.38,-0.28],[-0.50,-0.46],
    [-0.44,-0.64],[-0.24,-0.72],[0.00,-0.74],
    [0.24,-0.72],[0.44,-0.64],
    [0.50,-0.46],[0.38,-0.28],[0.16,-0.22],
    [0.00,-0.24],
  ],118));

  // Head at apex of hood
  p.push(...fillEllipse(0.00,-0.78,0.11,0.09,22));

  // Neck transition (below hood to body)
  for(let i=0;i<18;i++){
    const t=i/17,y=-0.22+t*0.20,x=Math.sin(t*1.0)*0.07;
    p.push({x:x+(Math.random()-0.5)*0.05,y:y+(Math.random()-0.5)*0.025});
    p.push({x:x+(Math.random()-0.5)*0.05,y:y+(Math.random()-0.5)*0.025});
  }

  // S-curve body
  for(let i=0;i<50;i++){
    const t=i/49,y=0.28-t*0.52,xc=Math.sin(t*Math.PI*1.6)*0.16*(1-t*0.42);
    p.push({x:xc+(Math.random()-0.5)*0.048,y:y+(Math.random()-0.5)*0.024});
    p.push({x:xc+(Math.random()-0.5)*0.048,y:y+(Math.random()-0.5)*0.024});
  }

  // Coiled base (outer + inner)
  p.push(...fillEllipse(0.00,0.52,0.30,0.18,60));
  p.push(...fillEllipse(-0.10,0.46,0.14,0.10,24));

  return p;
}

/* ── THOTH IBIS (𓅝) — standing side profile, facing right ──
   Distinctive: round plump body, sickle beak curving DOWN-right     */
function ibisPts():{x:number,y:number}[]{
  const p:{x:number,y:number}[]=[];

  // Main round body
  p.push(...fillEllipse(-0.06,0.06,0.35,0.32,92));
  // Wing fold (on back-left of body)
  p.push(...fillEllipse(-0.24,-0.02,0.20,0.26,36));

  // Neck (thin, rises right and slightly up from body)
  for(let i=0;i<30;i++){
    const t=i/29,y=-0.20+t*0.26,x=0.22-t*0.28;
    p.push({x:x+(Math.random()-0.5)*0.052,y:y+(Math.random()-0.5)*0.024});
  }

  // Small round head
  p.push(...fillEllipse(0.18,-0.36,0.13,0.12,30));

  // BEAK — long sickle sweeping DOWN (most distinctive feature of the ibis)
  for(let i=0;i<58;i++){
    const t=i/57;
    // Arc: starts pointing right-and-slightly-down, sweeps to pointing DOWN
    const ang=-0.20-t*2.80;
    const r=0.08+t*0.46;
    const x=0.18+Math.cos(ang)*r;
    const y=-0.36+Math.sin(ang)*r*0.78;
    p.push({x:x+(Math.random()-0.5)*0.038,y:y+(Math.random()-0.5)*0.020});
  }

  // Tail (small fan behind body)
  p.push(...fillTri(-0.38,0.12,-0.56,-0.04,-0.44,0.30,24));

  // Left leg (long and thin)
  p.push(...fillRect(-0.20,0.37,0.08,0.44,20));
  // Right leg
  p.push(...fillRect(0.00,0.37,0.08,0.44,20));

  // Foot spreads
  p.push(...fillTri(-0.28,0.80,-0.08,0.80,-0.18,0.88,8));
  p.push(...fillTri(-0.08,0.80,0.14,0.80,0.04,0.88,8));

  return p;
}

type RGB=[number,number,number];
const SOLAR:RGB=[240,168,40];
const LAPIS:RGB=[70,100,200];
const JADE:RGB=[36,190,140];
const FIRE:RGB=[220,70,50];
const SKY:RGB=[40,172,235];

function rgbA(c:RGB,a:number){return `rgba(${c[0]},${c[1]},${c[2]},${a})`;}
function lerpCol(a:RGB,b:RGB,f:number):RGB{return[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,a[2]+(b[2]-a[2])*f];}

const ANIMALS=[
  {name:"Horus Falcon",glyph:"𓅺",col:SOLAR,role:"Divine Kingship -- Eye of Horus -- God of the Sky",
   lore:"Horus (Heru) soared above all creation as the celestial falcon. The living pharaoh was his earthly incarnation. His right eye was the sun, his left the moon. The Eye of Horus — the Wadjet — became the most powerful amulet of protection in ancient Egypt, worn by the living and buried with the dead.",pts:falconPts()},
  {name:"Anubis Jackal",glyph:"𓃘",col:LAPIS,role:"Guardian of the Dead -- Weigher of Hearts -- Embalming",
   lore:"Anubis (Inpu), the black jackal, guided souls through the Duat, the realm of the dead. He held the scales on which the heart was weighed against the feather of Ma'at. If balanced, the soul entered paradise. Anubis presided over mummification — his priests wore jackal masks during burial rites — for the jackal was seen prowling graveyards at dusk.",pts:jackalPts()},
  {name:"Khepri Scarab",glyph:"𓆣",col:JADE,role:"God of Rebirth -- Morning Sun -- Resurrection",
   lore:"The scarab beetle, Khepri, rolled its dung ball across the desert just as the sun god rolled the solar disk across the sky at dawn. This simple act of rolling — creation from nothing — became the supreme metaphor for resurrection and regeneration. Millions of scarab amulets were carved from lapis lazuli, carnelian, and faience, placed over the hearts of mummies.",pts:scarabPts()},
  {name:"Wadjet Cobra",glyph:"𓆙",col:FIRE,role:"Royal Uraeus -- Divine Protection -- Lower Egypt",
   lore:"Wadjet, the cobra goddess of Lower Egypt, reared from the pharaoh's brow as the Uraeus — the rearing cobra crown ornament. She spat fire at the enemies of the king. Every pharaoh wore the Uraeus to signal divine authority. Paired with Nekhbet (the vulture of Upper Egypt) on the double crown, Wadjet united the Two Lands under one sovereign.",pts:cobraPts()},
  {name:"Thoth Ibis",glyph:"𓅝",col:SKY,role:"God of Wisdom -- Scribes -- Moon -- Magic -- Writing",
   lore:"Thoth (Djehuty), the ibis-headed god, invented writing and mathematics. He recorded the verdict at the Weighing of the Heart. He gave humanity language, measured time with the moon, and mediated between Horus and Set. The sacred ibis was mummified by the millions at Hermopolis — his city. To harm an ibis was a crime punishable by death.",pts:ibisPts()},
];

const FORM_DUR=140,HOLD_DUR=140,DISP_DUR=60,N=350;

export default function AnimalSilhouettesPage(){
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const nameRef=useRef<HTMLDivElement>(null);
  const [wellLabel,setWellLabel]=useState("Attract");
  const wellModeRef=useRef<"attract"|"repel">("attract");
  const animalIdxRef=useRef(0);
  const triggerRef=useRef({scatter:false,next:false});

  useEffect(()=>{
    const canvas=canvasRef.current; if(!canvas) return;
    const ctx=canvas.getContext("2d")!;
    const DPR=Math.min(window.devicePixelRatio||1,2);

    function resize(){
      const r=canvas!.getBoundingClientRect();
      canvas!.width=Math.round(r.width*DPR); canvas!.height=Math.round(r.height*DPR);
      ctx.setTransform(DPR,0,0,DPR,0,0);
    }
    resize(); window.addEventListener("resize",resize);
    const W=()=>canvas!.width/DPR,H=()=>canvas!.height/DPR;

    let particles=Array.from({length:N},(_,i)=>({
      x:Math.random()*W(),y:Math.random()*H(),
      vx:(Math.random()-0.5)*1.5,vy:(Math.random()-0.5)*1.5,
      flickerPhase:Math.random()*Math.PI*2,
      flickerSpeed:0.07+Math.random()*0.10,
      tid:i,
    }));

    let phase:"form"|"hold"|"disperse"="form";
    let phaseTimer=0,t=0;
    let wells:{x:number,y:number,strength:number,sign:number,alpha:number,fading:boolean}[]=[];
    let dragWell:typeof wells[0]|null=null;
    let pointerDown=false,startX=0,startY=0,startTime=0;

    function getTarget(p:typeof particles[0]){
      const animal=ANIMALS[animalIdxRef.current];
      const src=animal.pts[p.tid%animal.pts.length];
      const sc=Math.min(W(),H())*0.44;
      return {x:W()/2+src.x*sc,y:H()*0.47+src.y*sc};
    }
    function scatter(){particles.forEach(p=>{const ang=Math.random()*Math.PI*2,sp=1.8+Math.random()*2.8;p.vx=Math.cos(ang)*sp;p.vy=Math.sin(ang)*sp;});}

    canvas.addEventListener("pointerdown",e=>{
      pointerDown=true;dragWell=null;
      const r=canvas!.getBoundingClientRect();
      startX=e.clientX-r.left;startY=e.clientY-r.top;startTime=performance.now();
    });
    canvas.addEventListener("pointermove",e=>{
      if(!pointerDown)return;
      const r=canvas!.getBoundingClientRect();
      const mx=e.clientX-r.left,my=e.clientY-r.top;
      const dist=Math.hypot(mx-startX,my-startY),held=performance.now()-startTime;
      if(!dragWell&&(dist>9||held>160)){
        dragWell={x:mx,y:my,strength:0.4,sign:wellModeRef.current==="attract"?1:-1,alpha:1,fading:false};
        wells.push(dragWell);
        if(wells.length>2)wells[0].fading=true;
      }
      if(dragWell){dragWell.x=mx;dragWell.y=my;dragWell.strength=Math.min(dragWell.strength+0.02,1.8);}
    });
    const endP=()=>{if(dragWell){dragWell.fading=true;dragWell=null;}pointerDown=false;};
    canvas.addEventListener("pointerup",endP);
    canvas.addEventListener("pointercancel",endP);

    let rafId=0;
    function frame(){
      t++;
      const w=W(),h=H();
      ctx.fillStyle="rgba(4,6,14,0.18)";ctx.fillRect(0,0,w,h);

      // Ghost glyph watermark behind particles
      const a=ANIMALS[animalIdxRef.current];
      ctx.save();
      ctx.font=`${Math.min(w,h)*0.52}px serif`;
      ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.globalAlpha=0.03;
      ctx.fillStyle=`rgba(${a.col[0]},${a.col[1]},${a.col[2]},1)`;
      ctx.fillText(a.glyph,w/2,h*0.47);
      ctx.restore();

      // Faint pyramid backdrop
      const pw=Math.min(w*0.70,340),ph=pw*0.60,pcx=w/2,pby=h*0.90;
      ctx.beginPath();ctx.moveTo(pcx-pw/2,pby);ctx.lineTo(pcx,pby-ph);ctx.lineTo(pcx+pw/2,pby);ctx.closePath();
      ctx.strokeStyle="rgba(200,160,48,0.03)";ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.moveTo(0,pby);ctx.lineTo(w,pby);
      ctx.strokeStyle="rgba(200,160,48,0.018)";ctx.lineWidth=0.5;ctx.stroke();

      // Phase transitions
      phaseTimer++;
      if(triggerRef.current.scatter){
        triggerRef.current.scatter=false;scatter();phase="disperse";phaseTimer=0;
        if(nameRef.current)nameRef.current.innerHTML="";
      }
      if(triggerRef.current.next){
        triggerRef.current.next=false;
        animalIdxRef.current=(animalIdxRef.current+1)%ANIMALS.length;
        if(nameRef.current)nameRef.current.innerHTML="";
        phase="disperse";phaseTimer=0;scatter();
      }
      if(phase==="form"&&phaseTimer>FORM_DUR){
        phase="hold";phaseTimer=0;
        const an=ANIMALS[animalIdxRef.current];
        if(nameRef.current)nameRef.current.innerHTML=`<span style="font-size:26px;letter-spacing:3px">${an.glyph}</span>&thinsp;${an.name}`;
      } else if(phase==="hold"&&phaseTimer>HOLD_DUR){
        phase="disperse";phaseTimer=0;
        if(nameRef.current)nameRef.current.innerHTML="";
        scatter();
      } else if(phase==="disperse"&&phaseTimer>DISP_DUR){
        animalIdxRef.current=(animalIdxRef.current+1)%ANIMALS.length;
        phase="form";phaseTimer=0;
      }

      wells=wells.filter(wl=>wl.alpha>0.01);
      wells.forEach(wl=>{if(wl.fading){wl.strength*=0.93;wl.alpha*=0.92;}});

      const col=ANIMALS[animalIdxRef.current].col;
      const prev=ANIMALS[(animalIdxRef.current+ANIMALS.length-1)%ANIMALS.length].col;
      const dispF=phase==="disperse"?Math.min(phaseTimer/DISP_DUR,1):0;
      const drawCol=lerpCol(col,prev,dispF*0.5);

      ctx.save();
      ctx.globalCompositeOperation="lighter";
      particles.forEach(p=>{
        let fx=0,fy=0;
        if(phase==="form"||phase==="hold"){
          const tgt=getTarget(p);
          const jit=phase==="hold"?1.6:0;
          const tx=tgt.x+Math.sin(t*0.05+p.flickerPhase)*jit;
          const ty=tgt.y+Math.cos(t*0.05+p.flickerPhase)*jit;
          const dx=tx-p.x,dy=ty-p.y,d=Math.hypot(dx,dy)||0.01;
          const pull=Math.min(d*0.020,2.2);
          fx+=dx/d*pull;fy+=dy/d*pull;
        } else {fy+=0.015;}
        wells.forEach(wl=>{
          const dx=wl.x-p.x,dy=wl.y-p.y,d=Math.hypot(dx,dy)||0.01;
          if(d<200){const f=wl.strength*3600/(d*d+400);fx+=dx/d*f*wl.sign*0.045;fy+=dy/d*f*wl.sign*0.045;}
        });
        p.vx=(p.vx+fx)*0.86;p.vy=(p.vy+fy)*0.86;
        p.x=Math.max(2,Math.min(w-2,p.x+p.vx));
        p.y=Math.max(2,Math.min(h-2,p.y+p.vy));
        const flicker=phase==="hold"?(0.60+0.40*Math.sin(t*p.flickerSpeed+p.flickerPhase)):0.82;
        // Glow halo
        ctx.beginPath();ctx.arc(p.x,p.y,5.5,0,Math.PI*2);
        ctx.fillStyle=rgbA(drawCol,0.07*flicker);ctx.fill();
        // Core dot
        ctx.beginPath();ctx.arc(p.x,p.y,1.8,0,Math.PI*2);
        ctx.fillStyle=rgbA(drawCol,0.92*flicker);ctx.fill();
      });

      // Connecting lines during hold
      if(phase==="hold"){
        for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
          const aa=particles[i],bb=particles[j];
          const dx=bb.x-aa.x,dy=bb.y-aa.y,d=Math.hypot(dx,dy);
          if(d<14){ctx.beginPath();ctx.moveTo(aa.x,aa.y);ctx.lineTo(bb.x,bb.y);ctx.strokeStyle=rgbA(drawCol,(1-d/14)*0.20);ctx.lineWidth=0.5;ctx.stroke();}
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
    wellModeRef.current=next;setWellLabel(next==="attract"?"Attract":"Repel");
  }
  const btnStyle:React.CSSProperties={
    fontFamily:MONO,fontSize:10,letterSpacing:2,textTransform:"uppercase",
    padding:"8px 18px",border:"1px solid rgba(200,160,48,0.28)",
    background:"rgba(200,160,48,0.05)",color:"#c0b080",
    cursor:"pointer",borderRadius:2,transition:"all 0.2s",
  };

  return (
    <div style={{background:BG,minHeight:"100vh",color:"#c8c0b0",fontFamily:SERIF}}>

      <div style={{padding:"40px 40px 24px",borderBottom:"1px solid rgba(200,160,48,0.12)"}}>
        <div style={{fontFamily:MONO,fontSize:8,letterSpacing:4,color:AURORA,marginBottom:10,textTransform:"uppercase"}}>
          AETHER -- Ancient Egypt -- Sacred Bestiary -- Particle Morphogenesis
        </div>
        <h1 style={{fontFamily:DISP,fontSize:28,color:"#e8dfc8",letterSpacing:3,marginBottom:8}}>
          Egyptian Sacred Bestiary
        </h1>
        <p style={{fontFamily:SERIF,fontSize:15,color:"#887868",lineHeight:1.7,maxWidth:640,marginBottom:14}}>
          350 particles assemble the sacred animals of ancient Egypt — Horus, Anubis, Khepri,
          Wadjet, Thoth — into precise filled silhouettes. Each outline is sampled from a traced
          polygon of the actual hieroglyph form. Drag to open a gravity well.
        </p>
        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
          {ANIMALS.map(a=>(
            <div key={a.name} style={{display:"flex",flexDirection:"column",gap:2}}>
              <span style={{fontFamily:MONO,fontSize:11,color:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.80)`,letterSpacing:1}}>
                {a.glyph} {a.name.toUpperCase()}
              </span>
              <span style={{fontFamily:SERIF,fontSize:11,color:"rgba(200,160,48,0.35)",letterSpacing:0.5}}>
                {a.role.split(" -- ")[0]}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"28px 40px 48px",gap:18}}>
        <div style={{fontFamily:MONO,fontSize:7,color:"rgba(200,160,48,0.28)",letterSpacing:5,textTransform:"uppercase"}}>
          Giza · Saqqara · Karnak · Luxor · Abu Simbel
        </div>

        <canvas ref={canvasRef} style={{
          display:"block",width:"min(620px,100%)",aspectRatio:"1/1",
          borderRadius:6,background:"#030508",cursor:"crosshair",touchAction:"none",
          border:"1px solid rgba(200,160,48,0.14)",boxShadow:"0 0 60px rgba(200,160,48,0.05)",
        }} />

        <div ref={nameRef} style={{fontFamily:DISP,fontSize:20,color:"#e8dfc8",minHeight:32,textAlign:"center",letterSpacing:3}} />

        <div style={{display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"}}>
          <button style={btnStyle} onClick={()=>{triggerRef.current.next=true;}}>Next Animal &#9658;</button>
          <button style={btnStyle} onClick={toggleWell}>Well: {wellLabel}</button>
          <button style={btnStyle} onClick={()=>{triggerRef.current.scatter=true;}}>&#10022; Scatter</button>
        </div>

        <div style={{width:"100%",maxWidth:620,display:"flex",flexDirection:"column",gap:10,marginTop:10}}>
          {ANIMALS.map(a=>(
            <div key={a.name} style={{
              border:`1px solid rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.20)`,
              background:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.03)`,
              borderRadius:4,padding:"14px 18px",
            }}>
              <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:6}}>
                <span style={{fontFamily:DISP,fontSize:20,color:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.95)`}}>{a.glyph}</span>
                <span style={{fontFamily:DISP,fontSize:13,color:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.88)`,letterSpacing:1}}>{a.name}</span>
                <span style={{fontFamily:MONO,fontSize:8,color:`rgba(${a.col[0]},${a.col[1]},${a.col[2]},0.45)`,letterSpacing:1,textTransform:"uppercase"}}>{a.role}</span>
              </div>
              <p style={{fontFamily:SERIF,fontSize:14,color:"#8a7a68",lineHeight:1.72,margin:0}}>{a.lore}</p>
            </div>
          ))}
        </div>

        <div style={{
          width:"100%",maxWidth:620,border:"1px solid rgba(200,160,48,0.12)",
          background:"rgba(200,160,48,0.025)",borderRadius:4,padding:"16px 20px",marginTop:4,
        }}>
          <div style={{fontFamily:MONO,fontSize:8,color:"rgba(200,160,48,0.5)",letterSpacing:3,marginBottom:8,textTransform:"uppercase"}}>
            World Heritage -- Pyramid Culture
          </div>
          <p style={{fontFamily:SERIF,fontSize:14,color:"#8a7a68",lineHeight:1.75,margin:0}}>
            The Great Pyramid of Giza stood as the tallest structure on Earth for 3,800 years.
            Egypt's sacred animals were not mythology — they were a complete cosmological system
            mapping celestial mechanics, human psychology, and natural law into symbolic form.
            The same animals appeared in Mesopotamia, Greece, and Mesoamerica. The sacred
            bestiary is a universal language. AETHER reads it as coherence architecture.
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:10,width:"100%",maxWidth:620,marginTop:4}}>
          {[
            ["Particles","350"],["Animals","5 sacred forms"],
            ["Shape method","Polygon + PIP sampler"],["Phase","Form -- Hold -- Disperse"],
            ["Well modes","Attract / Repel"],["Heritage","Ancient Egypt, 3100 BCE"],
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

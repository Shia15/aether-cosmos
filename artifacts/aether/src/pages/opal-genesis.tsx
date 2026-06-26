import { useEffect, useRef } from "react";
import aetherRef from "@assets/17FFC0EB-3B7D-4748-A761-80A09AA4E273_1782493826521.png";

const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  green:"#44CC77", dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
  shock:"#FFDD22", photon:"#00FFBB", cyan:"#22DDFF",
  opal1:"#E8D5FF", opal2:"#B5F0FF", opal3:"#FFDDE8", opal4:"#D0FFE0",
};
const MONO  = "'Space Mono',monospace";
const SERIF = "'Crimson Pro',serif";
const DISP  = "'Cinzel',serif";
function ha(v:number):string{return Math.round(Math.max(0,Math.min(255,v))).toString(16).padStart(2,"0");}
function Tag({l,c}:{l:string;c:string}){
  return <span style={{display:"inline-block",padding:"2px 8px",margin:"0 4px 4px 0",
    background:c+"22",border:`1px solid ${c}44`,borderRadius:3,
    fontFamily:MONO,fontSize:9,color:c,letterSpacing:"0.12em"}}>{l}</span>;
}

/* ── Pre-compute root tree (outside animation loop) ──────────── */
type Branch = { x1:number;y1:number;x2:number;y2:number;depth:number;isTerminal:boolean };

function buildRootTree(cx:number, startY:number, maxDepth:number): Branch[] {
  const mkRng=(seed:number)=>{let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};};
  const rng = mkRng(42);
  const branches: Branch[] = [];
  type Frame = { x:number;y:number;angle:number;length:number;depth:number };
  const stack: Frame[] = [
    { x:cx, y:startY, angle:Math.PI*0.5, length:52, depth:maxDepth },
  ];
  /* trunk going straight down first */
  branches.push({ x1:cx, y1:startY-10, x2:cx, y2:startY+50, depth:maxDepth+1, isTerminal:false });
  while (stack.length) {
    const fr = stack.pop()!;
    if (fr.depth <= 0 || fr.length < 4) continue;
    const x2 = fr.x + Math.cos(fr.angle) * fr.length;
    const y2 = fr.y + Math.sin(fr.angle) * fr.length;
    const isTerminal = fr.depth === 1;
    branches.push({ x1:fr.x, y1:fr.y, x2, y2, depth:fr.depth, isTerminal });
    /* branch left */
    stack.push({ x:x2, y:y2,
      angle: fr.angle - (0.28 + rng()*0.22),
      length: fr.length*(0.64+rng()*0.1), depth:fr.depth-1 });
    /* branch right */
    stack.push({ x:x2, y:y2,
      angle: fr.angle + (0.28 + rng()*0.22),
      length: fr.length*(0.64+rng()*0.1), depth:fr.depth-1 });
    /* occasionally a third mid-branch */
    if (fr.depth > 3 && rng() > 0.55) {
      stack.push({ x:x2, y:y2,
        angle: fr.angle + (rng()-0.5)*0.15,
        length: fr.length*(0.55+rng()*0.1), depth:fr.depth-2 });
    }
  }
  return branches;
}

/* ── Canvas component ─────────────────────────────────────────── */
function OpalCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    let t = 0;

    /* pre-build root tree */
    const TRUNK_X = W * 0.42;
    const TRUNK_TOP = H * 0.32;
    const roots = buildRootTree(TRUNK_X, TRUNK_TOP, 7);
    /* collect terminal tips for bacterial activity */
    const tips = roots.filter(b => b.isTerminal).map(b => ({ x:b.x2, y:b.y2 }));

    /* opal spheres — form and drift */
    type OSphere = { x:number;y:number;r:number;life:number;maxLife:number;hue:number };
    const spheres: OSphere[] = [];
    function spawnSphere(sx:number, sy:number) {
      spheres.push({ x:sx + (Math.random()-0.5)*20, y:sy - Math.random()*18,
        r:2+Math.random()*6, life:0, maxLife:120+Math.random()*200, hue:Math.random() });
    }
    /* initial spheres near tips */
    tips.slice(0,16).forEach(tip => spawnSphere(tip.x, tip.y));

    /* H₂S bubbles rising from bottom */
    type Bubble = { x:number;y:number;vy:number;r:number;alpha:number };
    const bubbles: Bubble[] = [];
    for (let i=0;i<22;i++){
      bubbles.push({ x:TRUNK_X-80+Math.random()*160,
        y:H*0.7+Math.random()*H*0.3,
        vy:-(0.3+Math.random()*0.5),
        r:2+Math.random()*3, alpha:0.6+Math.random()*0.4 });
    }

    /* photon streaks from sun */
    type Photon = { x:number;y:number;vy:number;vx:number;alpha:number;life:number };
    const photons: Photon[] = [];
    for (let i=0;i<30;i++){
      photons.push({ x:W*0.2+Math.random()*W*0.6,
        y:Math.random()*H*0.08,
        vx:(Math.random()-0.5)*0.4,
        vy:1.2+Math.random()*1.5,
        alpha:0.7+Math.random()*0.3,
        life:Math.random()*80 });
    }

    function drawSun() {
      const SX=W*0.5, SY=18;
      const sgrd=ctx.createRadialGradient(SX,SY,0,SX,SY,70);
      sgrd.addColorStop(0, V.shock+"FF");
      sgrd.addColorStop(0.35, V.amb+"BB");
      sgrd.addColorStop(0.7, V.gold+"55");
      sgrd.addColorStop(1, V.gold+"00");
      ctx.beginPath(); ctx.arc(SX,SY,70,0,Math.PI*2);
      ctx.fillStyle=sgrd; ctx.fill();
      /* rays */
      for (let i=0;i<12;i++){
        const ra=(i/12)*Math.PI*2+t*0.05;
        const r1=28, r2=55+10*Math.sin(t*2+i);
        ctx.beginPath();
        ctx.moveTo(SX+Math.cos(ra)*r1, SY+Math.sin(ra)*r1);
        ctx.lineTo(SX+Math.cos(ra)*r2, SY+Math.sin(ra)*r2);
        ctx.strokeStyle=V.shock+ha(80+40*Math.sin(t+i)); ctx.lineWidth=1.2; ctx.stroke();
      }
    }

    function drawSoilLayers() {
      /* surface-to-rock gradient zones */
      const layers:[number,number,string,string][] = [
        [0,        H*0.22, V.bg,      "00"],         /* sky/canopy */
        [H*0.22,   H*0.40, "#1A0C00", "EE"],         /* topsoil */
        [H*0.40,   H*0.62, "#120A00", "EE"],         /* subsoil */
        [H*0.62,   H*0.78, "#0C0800", "EE"],         /* parent rock */
        [H*0.78,   H,      "#060400", "EE"],         /* bedrock / H₂S zone */
      ];
      layers.forEach(([y1,y2,col,al])=>{
        const grd=ctx.createLinearGradient(0,y1,0,y2);
        grd.addColorStop(0,col+al);
        grd.addColorStop(1,col+(al==="00"?"00":"CC"));
        ctx.fillStyle=grd; ctx.fillRect(0,y1,W,y2-y1);
      });
      /* rock texture hint */
      ctx.fillStyle=V.gold+"08";
      for (let i=0;i<40;i++){
        const rx=(Math.sin(i*73)*0.5+0.5)*W;
        const ry=H*0.68+(Math.cos(i*37)*0.5+0.5)*H*0.25;
        ctx.beginPath(); ctx.arc(rx,ry,3+Math.sin(i*11)*2,0,Math.PI*2); ctx.fill();
      }
    }

    function drawTreeCanopy() {
      const CX=TRUNK_X, CY=H*0.1;
      /* canopy glow */
      const cgrd=ctx.createRadialGradient(CX,CY,0,CX,CY,W*0.28);
      cgrd.addColorStop(0,V.green+"33");
      cgrd.addColorStop(0.5,V.green+"18");
      cgrd.addColorStop(1,V.green+"00");
      ctx.beginPath(); ctx.arc(CX,CY,W*0.28,0,Math.PI*2);
      ctx.fillStyle=cgrd; ctx.fill();
      /* photon capture layer */
      for (let i=0;i<8;i++){
        const a=(i/8)*Math.PI*2+t*0.03;
        const r=W*0.14+Math.sin(t+i)*8;
        const lx=CX+Math.cos(a)*r, ly=CY+Math.sin(a)*r*0.5;
        ctx.beginPath(); ctx.arc(lx,ly,14+Math.sin(t*1.2+i)*3,0,Math.PI*2);
        ctx.fillStyle=V.green+ha(40+20*Math.sin(t+i)); ctx.fill();
      }
      /* trunk */
      ctx.beginPath();
      ctx.moveTo(TRUNK_X-6,H*0.22);
      ctx.quadraticCurveTo(TRUNK_X,H*0.28,TRUNK_X+4,TRUNK_TOP);
      ctx.strokeStyle=V.gold+ha(90); ctx.lineWidth=8; ctx.stroke();
    }

    function drawRoots() {
      roots.forEach(b=>{
        const maxD=7;
        const frac=b.depth/maxD;
        const w=0.6+frac*2.5;
        const col=b.isTerminal?V.aurora:V.gold;
        const alpha=b.isTerminal?80:40+frac*60;
        ctx.beginPath(); ctx.moveTo(b.x1,b.y1); ctx.lineTo(b.x2,b.y2);
        ctx.strokeStyle=col+ha(alpha); ctx.lineWidth=w; ctx.stroke();
      });
    }

    function drawMycorrhizal() {
      /* thin glowing filaments between nearby tips */
      for (let i=0;i<tips.length;i++){
        for (let j=i+1;j<tips.length;j++){
          const dx=tips[j].x-tips[i].x, dy=tips[j].y-tips[i].y;
          const dist=Math.hypot(dx,dy);
          if (dist>80||dist<10) continue;
          ctx.beginPath();
          ctx.moveTo(tips[i].x,tips[i].y);
          ctx.lineTo(tips[j].x,tips[j].y);
          ctx.strokeStyle=V.aurora+ha(12+8*Math.sin(t*0.8+i)); ctx.lineWidth=0.5; ctx.stroke();
        }
      }
    }

    function drawBacteria() {
      tips.forEach((tip,i)=>{
        const pulse=0.5+0.5*Math.sin(t*2.1+i*1.3);
        /* purple/green glow = phototrophic bacteria */
        const bcol=i%2===0?V.vio:V.green;
        const bgrd=ctx.createRadialGradient(tip.x,tip.y,0,tip.x,tip.y,12);
        bgrd.addColorStop(0,bcol+ha(pulse*160));
        bgrd.addColorStop(1,bcol+"00");
        ctx.beginPath(); ctx.arc(tip.x,tip.y,12,0,Math.PI*2);
        ctx.fillStyle=bgrd; ctx.fill();
        ctx.beginPath(); ctx.arc(tip.x,tip.y,3+pulse*2,0,Math.PI*2);
        ctx.fillStyle=bcol+ha(pulse*200); ctx.fill();
        /* H₂SO₄ acid drip down from bacteria */
        for (let d=0;d<3;d++){
          const dy=6+d*8+Math.sin(t*3+i+d)*3;
          const dx=(d-1)*3;
          ctx.beginPath(); ctx.arc(tip.x+dx,tip.y+dy,1.2,0,Math.PI*2);
          ctx.fillStyle=V.amb+ha(60-d*15); ctx.fill();
        }
      });
    }

    function drawH2SBubbles() {
      bubbles.forEach((b,i)=>{
        b.y+=b.vy;
        if (b.y<H*0.4){b.y=H*0.9+Math.random()*H*0.09; b.x=TRUNK_X-100+Math.random()*200;}
        const nearBac=tips.some(tip=>Math.hypot(tip.x-b.x,tip.y-b.y)<30);
        const col=nearBac?V.vio:V.rose; /* purple when hitting bacteria */
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2);
        ctx.strokeStyle=col+ha(b.alpha*100); ctx.lineWidth=0.8; ctx.stroke();
        ctx.fillStyle=col+ha(b.alpha*30); ctx.fill();
        /* label first few */
        if (i<3 && b.y<H*0.65){
          ctx.fillStyle=V.rose+ha(60);
          ctx.font=`6px ${MONO}`; ctx.textAlign="center";
          ctx.fillText("H₂S",b.x,b.y-b.r-3);
        }
      });
    }

    function drawPhotons() {
      photons.forEach(ph=>{
        ph.x+=ph.vx; ph.y+=ph.vy; ph.life++;
        if (ph.y>H*0.25){ ph.y=Math.random()*H*0.04; ph.x=W*0.1+Math.random()*W*0.8; ph.life=0; }
        const a=ph.alpha*(1-ph.life/120);
        ctx.beginPath(); ctx.moveTo(ph.x,ph.y); ctx.lineTo(ph.x-ph.vx*6,ph.y-ph.vy*6);
        ctx.strokeStyle=V.shock+ha(a*180); ctx.lineWidth=1; ctx.stroke();
        ctx.beginPath(); ctx.arc(ph.x,ph.y,1.5,0,Math.PI*2);
        ctx.fillStyle=V.shock+ha(a*220); ctx.fill();
      });
    }

    function drawOpalSpheres() {
      /* occasionally spawn new spheres near tips */
      if (Math.random()<0.04 && tips.length>0) {
        const tip=tips[Math.floor(Math.random()*tips.length)];
        spawnSphere(tip.x,tip.y);
      }
      for (let i=spheres.length-1;i>=0;i--){
        const s=spheres[i]; s.life++; s.y-=0.15;
        if (s.life>=s.maxLife){spheres.splice(i,1);continue;}
        const lf=s.life/s.maxLife;
        const alpha=lf<0.2?lf/0.2:lf>0.8?(1-lf)/0.2:1;
        /* iridescent: cycle through opal colors */
        const h=s.hue+t*0.02;
        const cols=[V.opal1,V.opal2,V.opal3,V.opal4];
        const c1=cols[Math.floor(h*4)%4], c2=cols[Math.floor(h*4+1)%4];
        const gr=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r);
        gr.addColorStop(0,c1+ha(alpha*200));
        gr.addColorStop(0.6,c2+ha(alpha*140));
        gr.addColorStop(1,V.vio+ha(alpha*60));
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=gr; ctx.fill();
        ctx.strokeStyle=V.opal2+ha(alpha*100); ctx.lineWidth=0.5; ctx.stroke();
      }
    }

    function drawSilicaLabels() {
      /* zone labels */
      const labs:[number,number,string,string][]=[
        [W*0.82,H*0.26,  "PHOTON CAPTURE",    V.shock+"88"],
        [W*0.82,H*0.38,  "ROOT EXUDATES",      V.green+"88"],
        [W*0.82,H*0.50,  "BACTERIAL ZONE",     V.vio+"88"],
        [W*0.82,H*0.62,  "ACID DISSOLUTION",   V.amb+"88"],
        [W*0.82,H*0.76,  "H₂S SOURCE",         V.rose+"55"],
        [W*0.1, H*0.58,  "OPAL FORMING ↑",     V.opal2+"88"],
      ];
      ctx.font=`7px ${MONO}`; ctx.textAlign="left";
      labs.forEach(([x,y,label,col])=>{
        if(!isFinite(x)||!isFinite(y))return;
        ctx.fillStyle=col; ctx.fillText(label,x,y);
      });
      /* energy flow arrow */
      ctx.beginPath();
      ctx.moveTo(W*0.83,H*0.24);
      ctx.lineTo(W*0.83,H*0.78);
      ctx.setLineDash([3,5]);
      ctx.strokeStyle=V.dim+"44"; ctx.lineWidth=0.8; ctx.stroke();
      ctx.setLineDash([]);
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      drawSoilLayers();
      drawSun();
      drawPhotons();
      drawTreeCanopy();
      drawRoots();
      drawMycorrhizal();
      drawBacteria();
      drawH2SBubbles();
      drawOpalSpheres();
      drawSilicaLabels();
      /* HUD */
      ctx.fillStyle=V.aurora+"66"; ctx.font=`8px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("SOLAR → BACTERIAL → ACID → SILICA → OPAL",16,H-10);
      t+=0.012;
    }

    function loop(){ draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return <canvas ref={ref} width={900} height={480}
    style={{width:"100%",height:480,display:"block",borderRadius:"0 0 4px 4px"}}/>;
}

/* ── Pathway Reaction Data ───────────────────────────────────── */
const PATHWAY_RXNS = [
  { title:"2H\u2082S + h\u03BD", sub:"\u21922S\u2070+2H\u207A+2e\u207B", col:V.vio,
    rAtoms:[[0,0,10,V.vio,"S"],[-16,-9,4.5,"#EEE","H"],[16,-9,4.5,"#EEE","H"],[0,-28,6,V.shock,"h\u03BD"]],
    pAtoms:[[0,-8,8,V.gold,"S\u2070"],[-14,8,3.5,"#EEE","H\u207A"],[14,8,3.5,"#EEE","H\u207A"],[0,20,3,"#4466FF","e\u207B"]] },
  { title:"S\u2070+O\u2082+H\u2082O", sub:"\u2192H\u2082SO\u2084", col:V.amb,
    rAtoms:[[0,0,8,V.gold,"S\u2070"],[-20,0,5,V.rose,"O"],[20,0,5,V.rose,"O"],[0,20,6,V.blue,"O"],[-10,30,3.5,"#EEE","H"],[10,30,3.5,"#EEE","H"]],
    pAtoms:[[0,0,9,V.amb,"S"],[0,-17,5,V.rose,"O"],[17,0,5,V.rose,"O"],[0,17,5,V.rose,"O"],[-17,0,5,V.rose,"O"]] },
  { title:"SiO\u2082+2H\u2082O", sub:"\u2192Si(OH)\u2084", col:V.blue,
    rAtoms:[[0,0,8,"#889AAA","Si"],[-14,0,5,V.rose,"O"],[14,0,5,V.rose,"O"],[0,22,6,V.blue,"O"],[-10,32,3.5,"#EEE","H"],[10,32,3.5,"#EEE","H"]],
    pAtoms:[[0,0,9,V.blue,"Si"],[0,-18,5,V.rose,"OH"],[18,0,5,V.rose,"OH"],[0,18,5,V.rose,"OH"],[-18,0,5,V.rose,"OH"]] },
  { title:"n Si(OH)\u2084", sub:"\u2192SiO\u2082\u00B7nH\u2082O", col:"#C8B0FF",
    rAtoms:[[-18,-14,6,V.cyan,"Si"],[18,-14,6,V.cyan,"Si"],[-18,14,6,V.cyan,"Si"],[18,14,6,V.cyan,"Si"],[0,0,4,"#EEE",""]],
    pAtoms:[[0,0,18,V.opal1,""],[0,0,14,V.opal2,""],[0,0,10,V.opal3,""]] },
  { title:"SiO\u2082\u00B7nH\u2082O", sub:"\u2192Si+O\u2082", col:V.aurora,
    rAtoms:[[0,0,16,V.opal1,""],[0,0,12,V.opal2,""],[0,0,8,V.opal3,""]],
    pAtoms:[[0,-8,9,V.aurora,"Si"],[-5,6,3,V.aurora,""],[5,6,3,V.aurora,""],[-18,4,4.5,V.rose,"O"],[18,4,4.5,V.rose,"O"]] },
];

/* ── Orbital Particle Seeds ──────────────────────────────────── */
const mkRng=(seed:number)=>{let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};};

const ORBIT_PARTS = PATHWAY_RXNS.map((_rxn,ri)=>{
  const rng=mkRng(ri*100+13);
  return Array.from({length:18},()=>({
    angle:rng()*Math.PI*2,
    radius:18+rng()*22,
    speed:(rng()-0.5)*0.012+0.008,
    lane: rng()<0.5?"r":"p",
    molIdx:Math.floor(rng()*3),
    sz:2.5+rng()*2.5,
  }));
});

/* ── Opal Pathway Canvas ─────────────────────────────────────── */
function OpalPathwayCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(()=>{
    const cv = ref.current; if(!cv) return;
    const ctx = cv.getContext("2d")!;
    const W=cv.width, H=cv.height;
    let t=0;

    const N=PATHWAY_RXNS.length;
    const CW=W/N;

    function pulse(i:number){ return Math.max(0,Math.sin(t*0.38+i*1.25))**2; }

    function drawAtoms(atoms:(number|string)[][], cx:number, cy:number, alpha:number){
      atoms.forEach((atom)=>{
        const adx=Number(atom[0]),ady=Number(atom[1]),ar=Number(atom[2]);
        const acol=String(atom[3]),albl=String(atom[4]);
        if(ar>0){
          ctx.beginPath(); ctx.arc(cx+adx,cy+ady,ar,0,Math.PI*2);
          ctx.fillStyle=acol+ha(alpha*220); ctx.fill();
          if(albl.length>0){
            ctx.fillStyle=ar>5?"#FFF8":"#0008";
            ctx.font=`${ar>6?6:5}px ${MONO}`; ctx.textAlign="center";
            ctx.fillText(albl,cx+adx,cy+ady+2);
          }
        }
      });
      /* bonds: connect each atom to atom[0] */
      const [ox,oy]=atoms[0];
      const a0x=cx+Number(ox), a0y=cy+Number(oy);
      for(let ai=1;ai<atoms.length;ai++){
        const bx2=cx+Number(atoms[ai][0]), by2=cy+Number(atoms[ai][1]);
        const bd=Math.hypot(bx2-a0x,by2-a0y);
        if(bd>0&&bd<44){
          ctx.beginPath(); ctx.moveTo(a0x,a0y); ctx.lineTo(bx2,by2);
          ctx.strokeStyle=String(atoms[ai][3])+"33"; ctx.lineWidth=1; ctx.stroke();
        }
      }
    }

    function drawChamber(i:number){
      const rxn=PATHWAY_RXNS[i];
      const col=rxn.col;
      const x0=CW*i, x1=x0+CW, cx=x0+CW*0.5;
      const ry=H*0.3, py=H*0.72;
      const pl=pulse(i);

      /* background */
      const bgGrd=ctx.createLinearGradient(x0,0,x1,H);
      bgGrd.addColorStop(0,col+"04"); bgGrd.addColorStop(0.5,col+"0E"); bgGrd.addColorStop(1,col+"04");
      ctx.fillStyle=bgGrd; ctx.fillRect(x0,0,CW,H);

      /* separator */
      if(i<N-1){
        ctx.beginPath(); ctx.moveTo(x1,8); ctx.lineTo(x1,H-8);
        ctx.strokeStyle=col+"22"; ctx.lineWidth=1; ctx.stroke();
      }

      /* orbital particles */
      ORBIT_PARTS[i].forEach(p=>{
        p.angle+=p.speed;
        const isR=p.lane==="r";
        const orbitR=isR ? p.radius*(1-pl*0.85) : p.radius*pl;
        if(orbitR<0.5) return;
        const ox=cx+Math.cos(p.angle)*orbitR;
        const oy=(isR?ry:py)+Math.sin(p.angle)*orbitR*0.45;
        if(!isFinite(ox)||!isFinite(oy)) return;
        const pCol=isR ? (rxn.rAtoms[p.molIdx%rxn.rAtoms.length][3] as string)
                       : (rxn.pAtoms[p.molIdx%rxn.pAtoms.length][3] as string);
        const palpha=(isR?0.5+0.3*(1-pl):0.5+0.3*pl);
        ctx.beginPath(); ctx.arc(ox,oy,p.sz,0,Math.PI*2);
        ctx.fillStyle=pCol+ha(palpha*190); ctx.fill();
      });

      /* reactant molecule diagram */
      const rScale=1-pl*0.7;
      ctx.save(); ctx.translate(cx,ry); ctx.scale(rScale,rScale); ctx.translate(-cx,-ry);
      drawAtoms(rxn.rAtoms, cx, ry, 0.55+0.3*(1-pl));
      ctx.restore();

      /* reaction flash + arrow */
      if(pl>0.2){
        const fl=(pl-0.2)/0.8;
        const grd=ctx.createRadialGradient(cx,H*0.5,0,cx,H*0.5,28*fl);
        grd.addColorStop(0,col+ha(fl*180)); grd.addColorStop(1,col+"00");
        ctx.beginPath(); ctx.arc(cx,H*0.5,28*fl,0,Math.PI*2);
        ctx.fillStyle=grd; ctx.fill();
      }
      /* down arrow */
      const arA=0.2+0.6*pl;
      ctx.beginPath();
      ctx.moveTo(cx-5,H*0.5-2); ctx.lineTo(cx,H*0.5+8); ctx.lineTo(cx+5,H*0.5-2);
      ctx.strokeStyle=col+ha(arA*200); ctx.lineWidth=1.5; ctx.stroke();

      /* product molecule diagram */
      const pScale=0.3+pl*0.7;
      ctx.save(); ctx.translate(cx,py); ctx.scale(pScale,pScale); ctx.translate(-cx,-py);
      drawAtoms(rxn.pAtoms, cx, py, pl*0.75);
      ctx.restore();

      /* energy label top */
      ctx.fillStyle=col+ha(120+80*pl);
      ctx.font=`6px ${MONO}`; ctx.textAlign="center";
      ctx.fillText(i===0?"PHOTON":i===1?"OXIDATION":i===2?"DISSOLUTION":i===3?"POLYMERISATION":"REDUCTION",
        cx, 13);

      /* equation labels bottom */
      ctx.fillStyle=col+ha(180); ctx.font=`6px ${MONO}`; ctx.textAlign="center";
      ctx.fillText(rxn.title, cx, H-20);
      ctx.fillStyle=col+ha(110); ctx.font=`5.5px ${MONO}`;
      ctx.fillText(rxn.sub, cx, H-10);
    }

    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,W,H);
      for(let i=0;i<N;i++) drawChamber(i);
      /* HUD */
      ctx.fillStyle=V.vio+"44"; ctx.font=`7px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("SOLAR OPAL PATHWAY \u00B7 LIVE MOLECULAR SIMULATION",14,14);
      t+=0.012;
    }

    function loop(){ draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return <canvas ref={ref} width={900} height={280}
    style={{width:"100%",height:280,display:"block",borderRadius:"0 0 4px 4px"}}/>;
}

/* ── Chain Stage Data ────────────────────────────────────────── */
const CHAIN_STAGES = [
  { label:"SOLAR PHOTON",         col:V.shock, sub:"hν · 700–1000 nm near-infrared" },
  { label:"H\u2082S + h\u03BD \u2192 S\u2070 + 2H\u207A", col:V.vio,   sub:"anoxygenic photosynthesis \u00B7 no O\u2082" },
  { label:"S\u2070 \u2192 H\u2082SO\u2084",               col:V.amb,   sub:"sulfur oxidation \u00B7 acid generation" },
  { label:"H\u2082SO\u2084 + SiO\u2082 \u2192 Si(OH)\u2084", col:V.blue, sub:"silicate dissolution \u00B7 silicic acid" },
  { label:"n Si(OH)\u2084 \u2192 SiO\u2082\u00B7nH\u2082O", col:"#C8B0FF", sub:"polymerisation \u00B7 opal precipitation" },
  { label:"SiO\u2082\u00B7nH\u2082O \u2192 Si",            col:V.aurora,sub:"dehydration \u00B7 reduction \u00B7 semiconductor" },
];

/* ── Chain Simulator Canvas ──────────────────────────────────── */
function ChainCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    let t = 0;

    const N = CHAIN_STAGES.length;
    const BOX_W = 110, BOX_H = 168;
    const PAD = 55;
    const spacing = (W - PAD * 2) / (N - 1);
    const boxCX = (i:number) => PAD + i * spacing;
    const boxTop = H * 0.5 - BOX_H * 0.5;

    const mkRng=(seed:number)=>{let s=seed;return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646;};};
    const rng = mkRng(77);
    const particles = Array.from({ length:28 }, (_,i) => ({
      pos:   (i / 28) * (N - 1) * 0.9,
      speed: 0.003 + rng() * 0.005,
      lane:  (rng() - 0.5) * 22,
    }));

    function rrect(x:number,y:number,w:number,h:number,r:number){
      ctx.beginPath();
      ctx.moveTo(x+r,y);
      ctx.lineTo(x+w-r,y); ctx.arcTo(x+w,y,x+w,y+r,r);
      ctx.lineTo(x+w,y+h-r); ctx.arcTo(x+w,y+h,x+w-r,y+h,r);
      ctx.lineTo(x+r,y+h); ctx.arcTo(x,y+h,x,y+h-r,r);
      ctx.lineTo(x,y+r); ctx.arcTo(x,y,x+r,y,r);
      ctx.closePath();
    }

    function drawMol(stage:number, cx:number, cy:number, ph:number) {
      if (stage === 0) {
        /* photon: sine wave */
        ctx.beginPath();
        for (let xi=-30; xi<=30; xi++) {
          const yi = Math.sin(xi * 0.21 + ph * 3) * 13;
          xi===-30 ? ctx.moveTo(cx+xi,cy+yi) : ctx.lineTo(cx+xi,cy+yi);
        }
        ctx.strokeStyle=V.shock+"BB"; ctx.lineWidth=2; ctx.stroke();
        const peakY = Math.sin(ph*3+1)*13;
        ctx.beginPath(); ctx.arc(cx+10,cy+peakY,5,0,Math.PI*2);
        ctx.fillStyle=V.shock+"EE"; ctx.fill();
        ctx.fillStyle=V.shock+"99"; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
        ctx.fillText("h\u03BD",cx,cy+26);
      } else if (stage === 1) {
        /* H₂S molecule */
        ctx.beginPath(); ctx.arc(cx-8,cy,10,0,Math.PI*2);
        ctx.fillStyle=V.vio+"BB"; ctx.fill();
        ctx.fillStyle="#FFF8"; ctx.font=`6px ${MONO}`; ctx.textAlign="center";
        ctx.fillText("S",cx-8,cy+2);
        [[-21,-11],[-21,11]].forEach(([dx,dy])=>{
          ctx.beginPath(); ctx.moveTo(cx-8+dx*0.4,cy+dy*0.4); ctx.lineTo(cx-8+dx,cy+dy);
          ctx.strokeStyle=V.rose+"55"; ctx.lineWidth=1; ctx.stroke();
          ctx.beginPath(); ctx.arc(cx-8+dx,cy+dy,4.5,0,Math.PI*2);
          ctx.fillStyle="#FFFFFF99"; ctx.fill();
          ctx.fillStyle="#444"; ctx.font=`5px ${MONO}`;
          ctx.fillText("H",cx-8+dx,cy+dy+2);
        });
        /* photon flash */
        const fl=0.5+0.5*Math.sin(ph*4);
        ctx.beginPath(); ctx.arc(cx+16,cy,6*fl,0,Math.PI*2);
        ctx.fillStyle=V.shock+ha(fl*160); ctx.fill();
        ctx.fillStyle=V.shock+"66"; ctx.font=`5px ${MONO}`; ctx.textAlign="center";
        ctx.fillText("h\u03BD",cx+16,cy+13);
        /* arrow */
        ctx.fillStyle=V.aurora+"88"; ctx.font=`9px ${MONO}`;
        ctx.fillText("\u2192",cx+4,cy+3);
        /* product S⁰ */
        ctx.beginPath(); ctx.arc(cx+28,cy,8,0,Math.PI*2);
        ctx.fillStyle=V.gold+"CC"; ctx.fill();
        ctx.fillStyle="#FFF8"; ctx.font=`6px ${MONO}`; ctx.textAlign="center";
        ctx.fillText("S\u2070",cx+28,cy+2);
      } else if (stage === 2) {
        /* H₂SO₄: central S + 4 O */
        ctx.beginPath(); ctx.arc(cx,cy,9,0,Math.PI*2);
        ctx.fillStyle=V.amb+"BB"; ctx.fill();
        ctx.fillStyle="#FFF8"; ctx.font=`6px ${MONO}`; ctx.textAlign="center";
        ctx.fillText("S",cx,cy+2);
        [[0,-20],[20,0],[0,20],[-20,0]].forEach(([dx,dy],oi)=>{
          ctx.beginPath(); ctx.moveTo(cx+dx*0.4,cy+dy*0.4); ctx.lineTo(cx+dx*0.82,cy+dy*0.82);
          ctx.strokeStyle=V.rose+"77"; ctx.lineWidth=1.5; ctx.stroke();
          ctx.beginPath(); ctx.arc(cx+dx,cy+dy,6,0,Math.PI*2);
          ctx.fillStyle=V.rose+"BB"; ctx.fill();
          ctx.fillStyle="#FFF8"; ctx.font=`5px ${MONO}`;
          ctx.fillText("O",cx+dx,cy+dy+2);
          if (oi===0||oi===2) {
            const hx=cx+dx+(oi===0?-9:9), hy=cy+dy+(oi===0?-5:5);
            ctx.beginPath(); ctx.moveTo(cx+dx,cy+dy); ctx.lineTo(hx,hy);
            ctx.strokeStyle="#FFFFFF33"; ctx.lineWidth=1; ctx.stroke();
            ctx.beginPath(); ctx.arc(hx,hy,3.5,0,Math.PI*2);
            ctx.fillStyle="#FFFFFF99"; ctx.fill();
          }
        });
      } else if (stage === 3) {
        /* Si(OH)₄ */
        ctx.beginPath(); ctx.arc(cx,cy,9,0,Math.PI*2);
        ctx.fillStyle=V.blue+"CC"; ctx.fill();
        ctx.strokeStyle=V.cyan+"66"; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle="#FFF8"; ctx.font=`6px ${MONO}`; ctx.textAlign="center";
        ctx.fillText("Si",cx,cy+2);
        [[0,-21],[21,0],[0,21],[-21,0]].forEach(([dx,dy])=>{
          ctx.beginPath(); ctx.moveTo(cx+dx*0.4,cy+dy*0.4); ctx.lineTo(cx+dx*0.82,cy+dy*0.82);
          ctx.strokeStyle=V.cyan+"55"; ctx.lineWidth=1.5; ctx.stroke();
          ctx.beginPath(); ctx.arc(cx+dx,cy+dy,6,0,Math.PI*2);
          ctx.fillStyle=V.rose+"AA"; ctx.fill();
          ctx.fillStyle="#FFF8"; ctx.font=`5px ${MONO}`;
          ctx.fillText("OH",cx+dx,cy+dy+2);
        });
      } else if (stage === 4) {
        /* opal sphere — iridescent */
        const OCOLS=[V.opal1,V.opal2,V.opal3,V.opal4];
        const ogrd=ctx.createRadialGradient(cx,cy,0,cx,cy,18);
        ogrd.addColorStop(0,V.opal2+"FF");
        ogrd.addColorStop(0.4,V.opal1+"EE");
        ogrd.addColorStop(0.75,V.opal3+"CC");
        ogrd.addColorStop(1,V.vio+"44");
        ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2);
        ctx.fillStyle=ogrd; ctx.fill();
        ctx.strokeStyle=OCOLS[Math.floor(ph*4)%4]+"AA"; ctx.lineWidth=1.5; ctx.stroke();
        for (let oi=0;oi<4;oi++){
          const oa=ph*2+oi*(Math.PI/2);
          ctx.beginPath(); ctx.moveTo(cx,cy);
          ctx.lineTo(cx+Math.cos(oa)*14,cy+Math.sin(oa)*14);
          ctx.strokeStyle=OCOLS[oi]+"44"; ctx.lineWidth=1; ctx.stroke();
        }
      } else if (stage === 5) {
        /* Si crystal lattice */
        const ATOMS=[[0,0],[16,0],[-16,0],[8,-14],[-8,-14],[8,14],[-8,14]];
        ATOMS.forEach(([ax,ay],ai)=>{
          if(ai>0){
            ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+ax,cy+ay);
            ctx.strokeStyle=V.aurora+"44"; ctx.lineWidth=1; ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(cx+ax,cy+ay,ai===0?8:5.5,0,Math.PI*2);
          ctx.fillStyle=V.aurora+ha(140+ai*14); ctx.fill();
          ctx.strokeStyle=V.cyan+"33"; ctx.lineWidth=0.8; ctx.stroke();
        });
        const agrd=ctx.createRadialGradient(cx,cy,0,cx,cy,26);
        agrd.addColorStop(0,V.aurora+"22"); agrd.addColorStop(1,V.aurora+"00");
        ctx.beginPath(); ctx.arc(cx,cy,26,0,Math.PI*2);
        ctx.fillStyle=agrd; ctx.fill();
        ctx.fillStyle=V.aurora+"77"; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
        ctx.fillText("Si",cx,cy+3);
      }
    }

    function draw() {
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,W,H);

      /* ── Connector lines + chain links ── */
      for (let i=0;i<N-1;i++){
        const x1=boxCX(i)+BOX_W*0.5, x2=boxCX(i+1)-BOX_W*0.5, y=H*0.5;
        const c1=CHAIN_STAGES[i].col, c2=CHAIN_STAGES[i+1].col;
        const lg=ctx.createLinearGradient(x1,y,x2,y);
        lg.addColorStop(0,c1+"66"); lg.addColorStop(1,c2+"66");
        ctx.beginPath(); ctx.moveTo(x1,y); ctx.lineTo(x2,y);
        ctx.strokeStyle=lg; ctx.lineWidth=3; ctx.stroke();
        /* chain oval at midpoint */
        const mx=(x1+x2)*0.5;
        ctx.save(); ctx.translate(mx,y);
        ctx.beginPath(); ctx.ellipse(0,0,11,5.5,0,0,Math.PI*2);
        ctx.strokeStyle=c1+ha(80+30*Math.sin(t*2+i)); ctx.lineWidth=2; ctx.stroke();
        ctx.beginPath(); ctx.ellipse(0,0,5.5,11,0,0,Math.PI*2);
        ctx.strokeStyle=c2+ha(80+30*Math.sin(t*2+i+1)); ctx.lineWidth=2; ctx.stroke();
        ctx.restore();
        /* arrowhead just before next box */
        const ax=x2-4;
        ctx.beginPath();
        ctx.moveTo(ax-7,y-4); ctx.lineTo(ax,y); ctx.lineTo(ax-7,y+4);
        ctx.strokeStyle=c2+"99"; ctx.lineWidth=1.5; ctx.stroke();
      }

      /* ── Chain boxes ── */
      CHAIN_STAGES.forEach((stage,i)=>{
        const bx=boxCX(i)-BOX_W*0.5, by=boxTop;
        /* glow */
        const ggrd=ctx.createRadialGradient(boxCX(i),H*0.5,0,boxCX(i),H*0.5,BOX_W*0.8);
        ggrd.addColorStop(0,stage.col+"1A"); ggrd.addColorStop(1,stage.col+"00");
        ctx.fillStyle=ggrd; ctx.fillRect(bx-14,by-14,BOX_W+28,BOX_H+28);
        /* box */
        rrect(bx,by,BOX_W,BOX_H,7);
        ctx.fillStyle=stage.col+"0D"; ctx.fill();
        ctx.strokeStyle=stage.col+ha(70+40*Math.sin(t*1.5+i)); ctx.lineWidth=1.5; ctx.stroke();
        /* number badge */
        ctx.beginPath(); ctx.arc(bx+14,by+14,9,0,Math.PI*2);
        ctx.fillStyle=stage.col+"28"; ctx.fill();
        ctx.strokeStyle=stage.col+"77"; ctx.lineWidth=1; ctx.stroke();
        ctx.fillStyle=stage.col; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
        ctx.fillText(String(i+1),bx+14,by+17);
        /* molecule drawing in upper portion */
        drawMol(i, boxCX(i), by+60, t);
        /* stage label */
        const lines=stage.label.split(" \u2192 ");
        const hasArrow=stage.label.includes("\u2192");
        if (hasArrow) {
          ctx.fillStyle=stage.col+ha(170); ctx.font=`5.5px ${MONO}`; ctx.textAlign="center";
          ctx.fillText(stage.label.split("\u2192")[0].trim(),boxCX(i),by+BOX_H-32);
          ctx.fillStyle=V.aurora+"66"; ctx.font=`7px ${MONO}`;
          ctx.fillText("\u2192",boxCX(i),by+BOX_H-22);
          ctx.fillStyle=stage.col+ha(170); ctx.font=`5.5px ${MONO}`;
          ctx.fillText(stage.label.split("\u2192")[1].trim(),boxCX(i),by+BOX_H-12);
        } else {
          ctx.fillStyle=stage.col+ha(180); ctx.font=`7px ${MONO}`; ctx.textAlign="center";
          ctx.fillText(stage.label,boxCX(i),by+BOX_H-18);
        }
        ctx.fillStyle=stage.col+"44"; ctx.font=`5px ${MONO}`;
        ctx.fillText(stage.sub,boxCX(i),by+BOX_H-4);
      });

      /* ── Flowing particles ── */
      particles.forEach(p=>{
        p.pos+=p.speed;
        if(p.pos>=N-0.05) p.pos=0;
        const si=Math.floor(p.pos), sf=p.pos-si;
        const ni=Math.min(si+1,N-1);
        /* only draw in gap region (not inside boxes) */
        const gapStart=boxCX(si)+BOX_W*0.5;
        const gapEnd  =boxCX(ni)-BOX_W*0.5;
        if(gapStart>=gapEnd) return;
        const px=gapStart+(gapEnd-gapStart)*sf;
        const py=H*0.5+p.lane;
        if(!isFinite(px)||!isFinite(py)) return;
        const col=CHAIN_STAGES[si].col;
        const alpha=0.7+0.3*Math.sin(t*3+p.pos*4);
        ctx.beginPath(); ctx.arc(px,py,3.5,0,Math.PI*2);
        ctx.fillStyle=col+ha(alpha*190); ctx.fill();
        /* trail */
        for(let tr=1;tr<=4;tr++){
          const tpx=px-p.speed*spacing*tr*5;
          if(!isFinite(tpx)||tpx<gapStart) continue;
          ctx.beginPath(); ctx.arc(tpx,py,3-tr*0.5,0,Math.PI*2);
          ctx.fillStyle=col+ha(alpha*80-tr*16); ctx.fill();
        }
        /* transform flash at entry to next box */
        if(sf>0.88&&si<N-1){
          const fl=(sf-0.88)/0.12;
          ctx.beginPath(); ctx.arc(gapEnd+8,H*0.5,16*fl,0,Math.PI*2);
          ctx.strokeStyle=CHAIN_STAGES[ni].col+ha(fl*130); ctx.lineWidth=2; ctx.stroke();
        }
      });

      /* HUD */
      ctx.fillStyle=V.aurora+"44"; ctx.font=`7px ${MONO}`; ctx.textAlign="left";
      ctx.fillText("CHAIN SIMULATOR \u00B7 SOLAR \u2192 BACTERIA \u2192 ACID \u2192 SILICA \u2192 OPAL \u2192 Si",14,13);
      t+=0.012;
    }

    function loop(){ draw(); raf.current=requestAnimationFrame(loop); }
    loop();
    return()=>cancelAnimationFrame(raf.current);
  },[]);

  return <canvas ref={ref} width={900} height={300}
    style={{width:"100%",height:300,display:"block",borderRadius:"0 0 4px 4px"}}/>;
}

/* ── AETHER Pipeline ─────────────────────────────────────────── */
const PIPELINE = [
  { step:"NATURAL SYSTEMS",   col:V.green, icon:"🌿",
    note:"Earth's energetic networks, life systems, H₂S geology" },
  { step:"PLANT GEOMETRY",    col:V.aurora,icon:"✦",
    note:"Tree star root architecture — blueprints of fractal efficiency" },
  { step:"MATERIAL SCIENCE",  col:V.blue,  icon:"⬡",
    note:"Opal (SiO₂·nH₂O) — bio-synthesised silica at room temperature" },
  { step:"ULTRA-PURE SILICON",col:V.vio,   icon:"◈",
    note:"SiO₂ purification to 9–11 nines via bio-inspired pathways" },
  { step:"SEMICONDUCTOR FAB", col:V.gold,  icon:"⊞",
    note:"Precision at the atomic scale — chips, solar cells, sensors" },
  { step:"ADVANCED COMPUTATION",col:V.rose,icon:"⚙",
    note:"Powering intelligence and innovation" },
  { step:"HUMANITY'S POTENTIAL",col:V.shock,icon:"☀",
    note:"Technology in service of life and consciousness" },
];

export default function OpalGenesisPage() {
  return (
    <div style={{background:V.bg,minHeight:"100vh",color:V.ink,fontFamily:MONO,paddingBottom:80}}>
      {/* tags */}
      <div style={{padding:"10px 24px",borderBottom:`1px solid ${V.dim}44`,display:"flex",flexWrap:"wrap",gap:4}}>
        {[["OPAL GENESIS",V.opal2],["SILICA SYNTHESIS",V.vio],["SULFUR BACTERIA",V.green],
          ["SOLAR UPGRADE",V.shock],["ROOT ARCHITECTURE",V.gold],["AETHER MATERIALS",V.aurora],
          ["SiO₂ → Si",V.blue],
        ].map(([l,c])=><Tag key={l} l={l} c={c}/>)}
      </div>

      {/* header */}
      <div style={{padding:"44px 32px 20px",maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:MONO,fontSize:10,color:V.aurora,letterSpacing:"0.2em",marginBottom:12}}>
          LIVE SIMULATION · OPAL GENESIS · SOLAR SILICA SYNTHESIS
        </div>
        <h1 style={{fontFamily:DISP,fontSize:"clamp(20px,3.8vw,42px)",color:V.ink,margin:"0 0 10px",lineHeight:1.1}}>
          Opal Genesis<br/>
          <span style={{color:V.vio+"BB",fontSize:"0.6em"}}>
            Solar Bacteria · Root Star · SiO₂ · Semiconductor
          </span>
        </h1>
        <p style={{fontFamily:SERIF,fontSize:15,color:V.ink+"99",lineHeight:1.75,maxWidth:720,margin:0}}>
          Opal forms when silica and acid come together — and <em>phototrophic sulfur bacteria</em>,
          eating H₂S in the absence of oxygen, powered by sunlight alone, produce precisely that acid.
          Tree root "star" fractal architecture creates the anoxic microhabitat. This is the
          solar-powered, room-temperature path from sand to semiconductor — the AETHER upgrade.
        </p>
      </div>

      <div style={{maxWidth:980,margin:"0 auto",padding:"0 32px"}}>

        {/* canvas */}
        <div style={{border:`1px solid ${V.dim}`,borderRadius:"4px 4px 0 0",overflow:"hidden"}}>
          <div style={{padding:"4px 12px",background:V.dim+"22",borderBottom:`1px solid ${V.dim}44`,
            fontFamily:MONO,fontSize:8,color:V.aurora+"66",letterSpacing:"0.12em"}}>
            LIVE · SUN PHOTONS → TREE CANOPY → ROOT STAR → PHOTOTROPHIC BACTERIA → H₂S → OPAL SPHERES
          </div>
          <OpalCanvas/>
        </div>

        {/* Chemistry equations */}
        <div style={{margin:"24px 0 0",padding:18,background:V.vio+"08",
          border:`1px solid ${V.vio}22`,borderRadius:4}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.vio,letterSpacing:"0.16em",marginBottom:14}}>
            THE CHEMISTRY · SOLAR OPAL PATHWAY
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {[
              { eq:"2 H₂S  +  hν  →  2 S⁰  +  2 H⁺  +  2 e⁻",
                col:V.vio, label:"Green/Purple sulfur bacteria — anoxygenic photosynthesis (no O₂)" },
              { eq:"S⁰  +  H₂O  +  1.5 O₂  →  H₂SO₄",
                col:V.amb, label:"Further sulfur oxidation → sulfuric acid (H₂SO₄)" },
              { eq:"SiO₂(rock)  +  2 H₂O  →  Si(OH)₄",
                col:V.blue, label:"Acid dissolves silicate → silicic acid (monomeric silica)" },
              { eq:"n Si(OH)₄  →  SiO₂·n H₂O  +  2n H₂O",
                col:V.opal2, label:"Silicic acid polymerises → amorphous opal (room temperature!)" },
              { eq:"SiO₂·nH₂O  →  SiO₂  →  Si  +  O₂",
                col:V.aurora, label:"Opal dehydration → quartz → semiconductor-grade silicon" },
            ].map(row=>(
              <div key={row.label} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                <div style={{fontFamily:MONO,fontSize:11,color:row.col,
                  background:row.col+"11",border:`1px solid ${row.col}33`,
                  borderRadius:3,padding:"4px 12px",whiteSpace:"nowrap",flexShrink:0}}>
                  {row.eq}
                </div>
                <div style={{fontFamily:SERIF,fontSize:12,color:V.ink+"66",lineHeight:1.6,paddingTop:4}}>
                  {row.label}
                </div>
              </div>
            ))}
          </div>
          {/* ── Pathway Live Simulation ── */}
          <div style={{marginTop:18,borderRadius:4,overflow:"hidden",border:`1px solid ${V.vio}22`}}>
            <div style={{padding:"6px 14px",background:V.vio+"0A",fontFamily:MONO,fontSize:8,
              color:V.vio+"88",letterSpacing:"0.14em"}}>
              LIVE · MOLECULAR SIMULATION · STAGGERED REACTION PULSES
            </div>
            <OpalPathwayCanvas />
          </div>
        </div>

        {/* ── Chain Simulator ── */}
        <div style={{margin:"40px 0 0"}}>
          <div style={{borderLeft:`3px solid ${V.aurora}`,paddingLeft:14,marginBottom:12}}>
            <div style={{fontFamily:MONO,fontSize:10,color:V.aurora,letterSpacing:"0.18em"}}>
              REACTION CHAINS · LIVE SIMULATION
            </div>
            <div style={{fontFamily:SERIF,fontSize:13,color:V.ink+"88",marginTop:4}}>
              Molecular particles flow and transform through each stage of the biological silicon pathway
            </div>
          </div>
          <div style={{borderRadius:6,overflow:"hidden",border:`1px solid ${V.aurora}22`,background:V.bg}}>
            <ChainCanvas />
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
            {CHAIN_STAGES.map((s,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:8,height:8,borderRadius:"50%",background:s.col,boxShadow:`0 0 6px ${s.col}88`}}/>
                <span style={{fontFamily:MONO,fontSize:9,color:s.col+"BB"}}>{s.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Solar Upgrade section */}
        <div style={{margin:"32px 0 0"}}>
          <div style={{borderLeft:`3px solid ${V.shock}`,paddingLeft:14,marginBottom:16}}>
            <div style={{fontFamily:MONO,fontSize:10,color:V.shock,letterSpacing:"0.18em"}}>
              THE SOLAR UPGRADE · HOW SUNLIGHT POWERS THIS
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
            {[
              { title:"PHOTOTROPHIC SULFUR BACTERIA", col:V.vio,
                body:"Green sulfur bacteria (Chlorobium) and purple sulfur bacteria (Chromatium) perform anoxygenic photosynthesis — they use H₂S instead of H₂O as an electron donor, releasing sulfur (not oxygen). They operate at 700–1000 nm light, deep red into near-infrared. No oxygen required — they thrive in exactly the anoxic zones created by deep root systems." },
              { title:"EFFICIENCY GAIN", col:V.shock,
                body:"The conventional silicon pathway requires 1500°C carbothermic reduction (SiO₂ + 2C → Si + 2CO) consuming ~120 kWh/kg. The solar-bacterial pathway operates at room temperature (20–80°C), powered by sunlight. The 'energy cost' is a photon. The reactor is the tree root system." },
              { title:"TREE ROOT STAR ARCHITECTURE", col:V.gold,
                body:"The fractal 'star' root system creates: (1) anoxic microenvironments at depth, (2) organic acid exudates (citric, oxalic, malic) that pre-acidify soil, (3) water channels transporting dissolved Si(OH)₄ upward, (4) mycorrhizal networks distributing silicic acid across the whole root zone. Nature's bioreactor is already built." },
              { title:"OPAL AS SEMICONDUCTOR PRECURSOR", col:V.opal2,
                body:"Opal (SiO₂·nH₂O) is amorphous silica — structurally superior to quartz for certain semiconductor applications. It can be dehydrated to amorphous SiO₂ (glass), then reduced to silicon. Bio-mineralised opal may contain fewer trace metal impurities than mined quartz, potentially reducing purification costs in the 9–11 nines process." },
              { title:"H₂S SOURCE GEOLOGY", col:V.rose,
                body:"H₂S is produced naturally by sulfate-reducing bacteria (SRB) deep in anoxic sediments, by volcanic degassing, and by decomposing sulfur-rich organic material. Tree roots in sulfur-rich soils (volcanic, coastal, peat bogs) naturally access H₂S. The bacteria that eat it using sunlight are already present in these soils — waiting to be cultivated." },
              { title:"UPGRADE PATH", col:V.aurora,
                body:"(1) Select sulfur-rich anoxic site with tree root access. (2) Introduce phototrophic sulfur bacteria culture. (3) Pipe/harvest dissolved Si(OH)₄ from root-zone water. (4) Allow controlled polymerisation to opal pellets. (5) Dehydrate → SiO₂. (6) Refine. The entire process is solar-powered, carbon-neutral, and uses living systems as the manufacturing infrastructure." },
            ].map(card=>(
              <div key={card.title} style={{padding:14,background:card.col+"08",
                border:`1px solid ${card.col}33`,borderRadius:4}}>
                <div style={{fontFamily:MONO,fontSize:8,color:card.col,letterSpacing:"0.12em",marginBottom:8}}>
                  {card.title}
                </div>
                <div style={{fontFamily:SERIF,fontSize:13,color:V.ink+"80",lineHeight:1.7}}>
                  {card.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AETHER Architecture Pipeline */}
        <div style={{margin:"36px 0 0"}}>
          <div style={{borderLeft:`3px solid ${V.aurora}`,paddingLeft:14,marginBottom:16}}>
            <div style={{fontFamily:MONO,fontSize:10,color:V.aurora,letterSpacing:"0.18em"}}>
              AETHER ARCHITECTURE · NATURE TO COMPUTATION
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:0,alignItems:"stretch"}}>
            {PIPELINE.map((p,i)=>(
              <div key={p.step} style={{flex:"1 1 120px",display:"flex",flexDirection:"column",alignItems:"center"}}>
                <div style={{padding:"14px 10px",background:p.col+"08",
                  border:`1px solid ${p.col}33`,borderRadius:4,
                  textAlign:"center",flex:1,width:"100%"}}>
                  <div style={{fontSize:18,marginBottom:6}}>{p.icon}</div>
                  <div style={{fontFamily:MONO,fontSize:7,color:p.col,letterSpacing:"0.1em",marginBottom:6}}>
                    {p.step}
                  </div>
                  <div style={{fontFamily:SERIF,fontSize:10,color:V.ink+"55",lineHeight:1.5}}>
                    {p.note}
                  </div>
                </div>
                {i<PIPELINE.length-1&&(
                  <div style={{fontFamily:MONO,fontSize:12,color:V.dim,padding:"4px 0",
                    alignSelf:"center",flexShrink:0}}>→</div>
                )}
              </div>
            ))}
          </div>
          <div style={{marginTop:10,fontFamily:SERIF,fontSize:13,color:V.ink+"44",
            textAlign:"center",fontStyle:"italic"}}>
            Everything is connected. Everything is energy. Everything matters.
          </div>
        </div>

        {/* Outlined in Plants */}
        <div style={{margin:"36px 0 0",padding:18,background:V.green+"06",
          border:`1px solid ${V.green}22`,borderRadius:4}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.green,letterSpacing:"0.16em",marginBottom:12}}>
            OUTLINED IN PLANTS · NATURE IS THE ORIGINAL ENGINEER
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              ["Networks that flow efficiently",    "Mycorrhizal highways + root capillary transport move silicic acid from dissolution zones to precipitation surfaces."],
              ["Fractal patterns that scale",       "Root star architecture is self-similar across 7+ orders of magnitude — from root hair to root system, identical branching logic."],
              ["Strength with minimal material",    "Opal spheres in silica sponge: maximum surface area, minimum mass. Nature's semiconductor substrate pre-forms itself."],
              ["Designs that adapt and self-optimise","Bacterial colonies adjust their sulfur uptake rate to available H₂S and light — automatic yield regulation."],
            ].map(([title,body])=>(
              <div key={title} style={{padding:12,background:V.green+"08",
                border:`1px solid ${V.green}22`,borderRadius:4}}>
                <div style={{fontFamily:MONO,fontSize:7,color:V.green,letterSpacing:"0.1em",marginBottom:6}}>
                  {title.toUpperCase()}
                </div>
                <div style={{fontFamily:SERIF,fontSize:12,color:V.ink+"70",lineHeight:1.6}}>
                  {body}
                </div>
              </div>
            ))}
          </div>
          <div style={{marginTop:10,fontFamily:SERIF,fontSize:12,color:V.ink+"33",fontStyle:"italic"}}>
            "We study. We learn. We apply." — AETHER Principle
          </div>
        </div>

        {/* Sand in US — Semiconductors context */}
        <div style={{margin:"32px 0 0",padding:18,background:V.blue+"06",
          border:`1px solid ${V.blue}22`,borderRadius:4}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.blue,letterSpacing:"0.16em",marginBottom:12}}>
            SAND → SEMICONDUCTOR · THE CONVENTIONAL CHAIN VS THE AETHER CHAIN
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
            <div>
              <div style={{fontFamily:MONO,fontSize:8,color:V.plasma,letterSpacing:"0.1em",marginBottom:8}}>
                INDUSTRIAL (CURRENT)
              </div>
              {[
                ["Mine quartz",          "SiO₂ from quartzite deposits"],
                ["Carbothermic reduction","SiO₂ + 2C → Si + 2CO at 1500°C"],
                ["Siemens process",      "Si + 3HCl → SiHCl₃ → Si at 1100°C"],
                ["Czochralski growth",   "Crystal Si at 1414°C"],
                ["Energy cost",          "~120 kWh per kg silicon"],
              ].map(([step,detail])=>(
                <div key={step} style={{display:"flex",gap:8,marginBottom:5}}>
                  <span style={{color:V.plasma,fontSize:8,marginTop:2}}>✗</span>
                  <div>
                    <span style={{fontFamily:MONO,fontSize:7,color:V.plasma}}>{step}: </span>
                    <span style={{fontFamily:SERIF,fontSize:11,color:V.ink+"55"}}>{detail}</span>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontFamily:MONO,fontSize:8,color:V.aurora,letterSpacing:"0.1em",marginBottom:8}}>
                AETHER SOLAR-BACTERIAL (PROPOSED)
              </div>
              {[
                ["Solar input",          "Photons (free, abundant, renewable)"],
                ["Phototrophic oxidation","2H₂S + hν → 2S + 2H⁺ (room temperature)"],
                ["Acid dissolution",     "SiO₂ + H₂SO₄ → Si(OH)₄ (ambient)"],
                ["Bio-precipitation",    "Si(OH)₄ → SiO₂·nH₂O (opal, 20–80°C)"],
                ["Energy cost",          "~0 kWh (solar) + tree root architecture"],
              ].map(([step,detail])=>(
                <div key={step} style={{display:"flex",gap:8,marginBottom:5}}>
                  <span style={{color:V.aurora,fontSize:8,marginTop:2}}>✓</span>
                  <div>
                    <span style={{fontFamily:MONO,fontSize:7,color:V.aurora}}>{step}: </span>
                    <span style={{fontFamily:SERIF,fontSize:11,color:V.ink+"55"}}>{detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Aether principle footer */}
        <div style={{margin:"32px 0 0",padding:"16px 20px",
          background:V.aurora+"06",border:`1px solid ${V.aurora}22`,borderRadius:4,
          textAlign:"center"}}>
          <div style={{fontFamily:DISP,fontSize:13,color:V.aurora,marginBottom:8}}>
            AETHER IS THE BRIDGE BETWEEN NATURE, SCIENCE, AND CONSCIOUSNESS
          </div>
          <div style={{fontFamily:SERIF,fontSize:13,color:V.ink+"66",fontStyle:"italic"}}>
            Understand the connections. Align with the flow. Build the future.
          </div>
          <div style={{marginTop:12,display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap"}}>
            {[["OBSERVE","See clearly. Measure what is.",V.ink+"55"],
              ["UNDERSTAND","Find patterns. Seek truth in complexity.",V.blue],
              ["RESPECT","Honor natural systems and ancient wisdom.",V.green],
              ["ALIGN","Work in rhythm with natural cycles.",V.gold],
              ["INTEGRATE","Connect disciplines. Unite systems.",V.vio],
              ["ELEVATE","Raise the bar. Create a better world.",V.aurora],
            ].map(([verb,desc,col])=>(
              <div key={verb} style={{textAlign:"center",minWidth:100}}>
                <div style={{fontFamily:MONO,fontSize:8,color:col,letterSpacing:"0.1em",marginBottom:4}}>{verb}</div>
                <div style={{fontFamily:SERIF,fontSize:10,color:V.ink+"44",lineHeight:1.4}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Reference image */}
        <div style={{margin:"40px 0 0"}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.dim,letterSpacing:"0.16em",marginBottom:12}}>
            REFERENCE SOURCE MATERIAL · AETHER ARCHITECTURE OVERVIEW
          </div>
          <img src={aetherRef} alt="AETHER Architecture"
            style={{width:"100%",borderRadius:6,border:`1px solid ${V.dim}44`,display:"block"}}/>
        </div>

        {/* cross-links */}
        <div style={{margin:"36px 0 0"}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.dim,letterSpacing:"0.16em",marginBottom:12}}>
            RELATED SYSTEMS
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {[["/earth-living-system","Earth Living System",V.green],
              ["/portal-restoration","Portal Restoration",V.aurora],
              ["/liquid-print","Liquid Print · Bio-Hybrid",V.gold],
              ["/floquet-petals","Floquet Petals",V.vio],
              ["/gut-brain","Gut-Brain Axis",V.blue],
            ].map(([path,label,col])=>(
              <a key={path} href={path} style={{fontFamily:MONO,fontSize:9,color:col,
                letterSpacing:"0.1em",textDecoration:"none",padding:"4px 10px",
                border:`1px solid ${col}44`,borderRadius:3}}>{label} →</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

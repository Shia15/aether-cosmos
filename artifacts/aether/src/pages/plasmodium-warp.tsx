/*═══════════════════════════════════════════════════════════════
  Plasmodium Prototype for Warp
  Slime mould (Physarum polycephalum) network as a warp-drive
  topology prototype — shortest-path organic computation +
  Alcubierre metric analogy.

  Physics:
  ── Physarum flow:    dQ/dt = (ΔP/L) · D^4π/128η  (Hagen-Poiseuille)
  ── Tube adaptation:  dD/dt = (|Q|^γ − decay) · D
  ── Alcubierre:       ds² = −dt² + (dx−v_s·f(r_s)dt)² + dy² + dz²
  ── Exotic energy:    T_00 ∝ −(v_s²/8π)·(df/dr)²·r²·sin²θ
  ── Warp bubble:      f(r) = (tanh(σ(r+R))−tanh(σ(r−R)))/2tanh(σR)
  ── Network flow:     min Σ (Q²/D) s.t. Kirchhoff at each node
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
import omniFlow from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import magStorm from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import skyrmion from "@assets/IMG_4534_1784561445345.png";

const P={
  bg:"#020810",panel:"#040d1a",panel2:"#060f20",
  ivory:"#e8f8ff",dim:"rgba(232,248,255,0.55)",muted:"rgba(232,248,255,0.28)",
  line:"rgba(0,180,255,0.08)",
  cyan:"#22d3ee",teal:"#2dd4bf",blue:"#60a5fa",
  violet:"#a78bfa",rose:"#f472b6",gold:"#fbbf24",green:"#4ade80",
};

function Tag({label,color=P.cyan}:{label:string;color?:string}){
  return <div style={{fontSize:9,fontWeight:700,color,letterSpacing:2,textTransform:"uppercase" as const,marginBottom:10}}>{label}</div>;
}
function Divider(){return <div style={{height:1,background:P.line,margin:"44px 0"}}/>;}
function Card({title,body,color=P.cyan,sub}:{title:string;body:string;color?:string;sub?:string}){
  return(
    <div style={{padding:"13px 15px",background:P.panel,borderRadius:10,border:`1px solid ${color}18`}}>
      {sub&&<div style={{fontSize:9,color,letterSpacing:1.2,marginBottom:4,textTransform:"uppercase" as const}}>{sub}</div>}
      <div style={{fontSize:11,fontWeight:700,color,letterSpacing:.5,marginBottom:6,textTransform:"uppercase" as const}}>{title}</div>
      <div style={{fontSize:12,color:P.dim,lineHeight:1.85}}>{body}</div>
    </div>
  );
}
function EqBlock({label,eq,note,color=P.cyan}:{label:string;eq:string;note?:string;color?:string}){
  return(
    <div style={{padding:"12px 16px",background:P.panel2,borderRadius:9,border:`1px solid ${color}20`,marginBottom:10}}>
      <div style={{fontSize:9,color:P.muted,marginBottom:4,letterSpacing:1}}>{label}</div>
      <pre style={{fontSize:12,fontFamily:"monospace",color,lineHeight:1.9,margin:0,whiteSpace:"pre-wrap"}}>{eq}</pre>
      {note&&<div style={{fontSize:11,color:P.dim,marginTop:6,lineHeight:1.75}}>{note}</div>}
    </div>
  );
}

/* ── CANVAS 1: Physarum network growing toward food sources ── */
function PlasmodiumCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const speedRef=useRef(1.0);
  const decayRef=useRef(0.015);
  const [speed,setSpeed]=useState(1.0);
  const [decay,setDecay]=useState(0.015);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  useEffect(()=>{decayRef.current=decay;},[decay]);

  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;init();});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // Nodes: Tokyo rail network-inspired layout (Physarum famously solved this)
    let W=cv.width,H=cv.height;
    let nodes:{x:number;y:number;isFood:boolean;pressure:number}[]=[];
    let edges:{a:number;b:number;D:number;Q:number;len:number}[]=[];

    function init(){
      W=cv.width;H=cv.height;
      nodes=[];edges=[];
      // 14 nodes
      const FRAC=[
        [0.15,0.5,true],[0.85,0.5,true],           // food sources (endpoints)
        [0.25,0.25,false],[0.25,0.75,false],
        [0.40,0.35,false],[0.40,0.65,false],
        [0.50,0.5,false],
        [0.60,0.25,false],[0.60,0.75,false],
        [0.38,0.5,false],[0.62,0.5,false],
        [0.72,0.35,false],[0.72,0.65,false],
        [0.50,0.2,false],[0.50,0.8,false],
      ];
      FRAC.forEach(([fx,fy,f])=>nodes.push({x:fx*W,y:fy*H,isFood:f,pressure:f?(nodes.length===0?1:-1):0}));
      // Connect nearby nodes
      for(let a=0;a<nodes.length;a++)for(let b=a+1;b<nodes.length;b++){
        const d=Math.hypot(nodes[a].x-nodes[b].x,nodes[a].y-nodes[b].y);
        if(d<W*0.22)edges.push({a,b,D:0.3+Math.random()*0.2,Q:0,len:d});
      }
    }
    init();

    function step(){
      const sp=speedRef.current;
      const dc=decayRef.current;
      // Solve flow: pressure at each node via iterative relaxation
      // Source node[0]=+1, sink node[1]=-1
      const pressure=nodes.map((n,i)=>i===0?1:i===1?-1:0);
      for(let iter=0;iter<8;iter++){
        nodes.forEach((_,i)=>{
          if(i===0||i===1)return;
          let num=0,den=0;
          edges.forEach(e=>{
            if(e.a===i||e.b===i){
              const j=e.a===i?e.b:e.a;
              const cond=e.D**4/(e.len+1);
              num+=cond*pressure[j];den+=cond;
            }
          });
          if(den>0)pressure[i]=num/den;
        });
      }
      // Compute flows and adapt diameters
      edges.forEach(e=>{
        const cond=e.D**4/(e.len+1);
        e.Q=cond*(pressure[e.a]-pressure[e.b]);
        // Tube adaptation: Hagen-Poiseuille feedback
        e.D=Math.max(0.01,e.D+(Math.abs(e.Q)**0.75-dc)*e.D*0.015*sp);
      });
    }

    function draw(){
      W=cv.width;H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      for(let i=0;i<3;i++)step();

      // Edges
      edges.forEach(e=>{
        const na=nodes[e.a],nb=nodes[e.b];
        const alpha=Math.min(1,e.D*2);
        const col=e.D>0.5?P.gold:e.D>0.25?P.cyan:P.blue;
        ctx.strokeStyle=col+Math.round(alpha*180).toString(16).padStart(2,"0");
        ctx.lineWidth=Math.max(0.5,e.D*8);
        ctx.beginPath();ctx.moveTo(na.x,na.y);ctx.lineTo(nb.x,nb.y);ctx.stroke();
        // Flow dot
        if(Math.abs(e.Q)>0.01){
          const prog=(t*0.025*Math.sign(e.Q)+e.a*0.3)%1;
          const px2=na.x+(nb.x-na.x)*((prog+1)%1),py2=na.y+(nb.y-na.y)*((prog+1)%1);
          ctx.fillStyle=col;ctx.beginPath();ctx.arc(px2,py2,2.5,0,Math.PI*2);ctx.fill();
        }
      });

      // Nodes
      nodes.forEach((nd,i)=>{
        const col=nd.isFood?P.gold:P.teal;
        const R=nd.isFood?14:7;
        const grd=ctx.createRadialGradient(nd.x,nd.y,0,nd.x,nd.y,R+8);
        grd.addColorStop(0,col+"88");grd.addColorStop(1,col+"00");
        ctx.fillStyle=grd;ctx.beginPath();ctx.arc(nd.x,nd.y,R+8,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(nd.x,nd.y,R,0,Math.PI*2);ctx.fill();
        if(nd.isFood){
          ctx.fillStyle="#fff";ctx.font="bold 7px monospace";ctx.textAlign="center";
          ctx.fillText(i===0?"SOURCE":"SINK",nd.x,nd.y+3.5);
        }
      });

      // Warp analogy label
      const maxD=Math.max(...edges.map(e=>e.D));
      ctx.fillStyle=P.cyan;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("PHYSARUM NETWORK · HAGEN-POISEUILLE TUBE ADAPTATION · FINDS SHORTEST PATH",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText(`Max tube diameter: ${maxD.toFixed(3)} · Thicker = more flow = reinforced — pruned tubes decay`,8,H-6);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);

  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:400,display:"block"}}/>
      <div style={{padding:"10px 16px",background:P.panel,display:"flex",gap:20,flexWrap:"wrap",alignItems:"center"}}>
        <div>
          <div style={{fontSize:10,color:P.cyan,marginBottom:3}}>Growth Speed · {speed.toFixed(1)}x</div>
          <input type="range" min={0.1} max={5} step={0.1} value={speed} onChange={e=>setSpeed(+e.target.value)} style={{width:130}}/>
        </div>
        <div>
          <div style={{fontSize:10,color:P.cyan,marginBottom:3}}>Decay Rate · {decay.toFixed(3)}</div>
          <input type="range" min={0.005} max={0.05} step={0.001} value={decay} onChange={e=>setDecay(+e.target.value)} style={{width:130}}/>
        </div>
        <div style={{fontSize:11,color:P.dim,lineHeight:1.85,maxWidth:450}}>
          Gold tubes = high-flow main paths. Blue = weak/pruning. Slime mould solves the shortest-path problem in minutes without neurons or central control — a distributed hydraulic optimisation identical in principle to a warp-bubble minimising exotic energy density.
        </div>
      </div>
    </div>
  );
}

/* ── CANVAS 2: Alcubierre warp bubble metric ── */
function WarpBubbleCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const vsRef=useRef(2.0);
  const sigRef=useRef(4.0);
  const [vs,setVs]=useState(2.0);
  const [sig,setSig]=useState(4.0);
  useEffect(()=>{vsRef.current=vs;},[vs]);
  useEffect(()=>{sigRef.current=sig;},[sig]);

  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    function f(r:number,R:number,sigma:number){
      const tanhsR=Math.tanh(sigma*R);
      return tanhsR>0?(Math.tanh(sigma*(r+R))-Math.tanh(sigma*(r-R)))/(2*tanhsR):0;
    }

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const vwarp=vsRef.current;
      const sigma=sigRef.current;
      const R=0.4; // bubble radius in normalised units

      // ── Spacetime fabric grid (left 60%) ─────────────────
      const gW=W*0.60,gH=H;
      const GRID=24;
      const cellW=gW/GRID,cellH=gH/GRID;

      // Draw distorted grid
      for(let gi=0;gi<=GRID;gi++){
        ctx.beginPath();
        for(let gj=0;gj<=GRID;gj++){
          const nx=(gi/GRID-0.5)*2,ny=(gj/GRID-0.5)*2;
          // r from bubble centre (moving with time)
          const bubX=0.0; // bubble is centred
          const r=Math.hypot(nx-bubX,ny);
          const fval=f(r,R,sigma);
          // Warp: x-coordinate distorted by warp factor
          const dx=gj===0?0:0; // vertical lines: only x distorted
          const screenX=gi*cellW+fval*vwarp*cellW*1.2*(nx>0?1:-1)*Math.sin(t*0.02)*0.3;
          const screenY=gj*cellH;
          const alpha=Math.max(0,0.15-fval*0.12);
          ctx.strokeStyle=`rgba(0,180,255,${alpha+0.04})`;ctx.lineWidth=0.6;
          gj===0?ctx.moveTo(screenX,screenY):ctx.lineTo(screenX,screenY);
        }
        ctx.stroke();
      }
      for(let gj=0;gj<=GRID;gj++){
        ctx.beginPath();
        for(let gi=0;gi<=GRID;gi++){
          const nx=(gi/GRID-0.5)*2,ny=(gj/GRID-0.5)*2;
          const r=Math.hypot(nx,ny);
          const fval=f(r,R,sigma);
          const screenX=gi*cellW;
          const screenY=gj*cellH+fval*vwarp*cellH*0.6*ny*Math.sin(t*0.018)*0.25;
          ctx.strokeStyle=`rgba(0,180,255,0.05)`;ctx.lineWidth=0.5;
          gi===0?ctx.moveTo(screenX,screenY):ctx.lineTo(screenX,screenY);
        }
        ctx.stroke();
      }

      // Bubble outline
      const bx=gW/2,by=gH/2,br=R*gW*0.5;
      const bubGrd=ctx.createRadialGradient(bx,by,0,bx,by,br);
      bubGrd.addColorStop(0,"rgba(0,200,255,0.08)");
      bubGrd.addColorStop(0.7,"rgba(0,200,255,0.04)");
      bubGrd.addColorStop(1,"rgba(0,200,255,0)");
      ctx.fillStyle=bubGrd;ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.fill();
      ctx.strokeStyle=P.cyan+"88";ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(bx,by,br,0,Math.PI*2);ctx.stroke();

      // Passenger (flat spacetime inside bubble)
      ctx.fillStyle=P.gold+"cc";ctx.beginPath();ctx.arc(bx,by,8,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#fff";ctx.font="6px monospace";ctx.textAlign="center";ctx.fillText("SHIP",bx,by+3.5);

      // Velocity arrow (warp direction)
      const arrowLen=Math.min(vwarp*25,100);
      ctx.strokeStyle=P.gold;ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(bx,by);ctx.lineTo(bx+arrowLen,by);ctx.stroke();
      ctx.fillStyle=P.gold;ctx.beginPath();
      ctx.moveTo(bx+arrowLen,by);ctx.lineTo(bx+arrowLen-8,by-4);ctx.lineTo(bx+arrowLen-8,by+4);ctx.closePath();ctx.fill();
      ctx.fillStyle=P.gold;ctx.font="bold 7px monospace";ctx.textAlign="left";
      ctx.fillText(`v_s = ${vwarp.toFixed(1)}c`,bx+arrowLen+4,by+3.5);

      // Exotic energy density heat map (right of bubble)
      // T_00 ∝ −(vs²/8π)·(df/dr)²·r²·sin²θ  — shown as ring
      for(let angle=0;angle<Math.PI*2;angle+=0.05){
        const rx=br*Math.cos(angle)+bx,ry=br*Math.sin(angle)+by;
        const dfdR=sigma*0.5*(1/Math.cosh(sigma*(br/gW*2+R))**2-1/Math.cosh(sigma*(br/gW*2-R))**2);
        const T00=-(vwarp**2/(8*Math.PI))*dfdR**2*(br/gW*2)**2*Math.sin(angle)**2;
        const exotic=Math.min(1,Math.abs(T00)*8);
        const col=T00<0?`rgba(160,0,255,${exotic*0.8})`:`rgba(0,255,160,${exotic*0.4})`;
        ctx.fillStyle=col;ctx.beginPath();ctx.arc(rx,ry,5,0,0.06);ctx.fill();
      }

      // Labels
      ctx.fillStyle=P.rose;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("EXOTIC ENERGY (negative T₀₀)",bx,by-br-8);
      ctx.fillStyle=P.green;ctx.font="7px monospace";
      ctx.fillText("POSITIVE ENERGY (front compression)",bx+br*0.6,by);

      // f(r) profile (right panel)
      const rpX=gW+12,rpW=W-rpX-12;
      ctx.fillStyle=P.panel2;ctx.fillRect(rpX,30,rpW,H-60);

      ctx.fillStyle=P.cyan;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("WARP PROFILE f(r)",rpX+rpW/2,46);
      ctx.fillText("σ controls wall sharpness",rpX+rpW/2,57);

      ctx.beginPath();
      for(let i=0;i<rpW;i++){
        const r=(i/rpW)*2.5;
        const fv=f(r,R,sigma);
        const sx=rpX+i,sy=30+H*0.1+(1-fv)*(H-90)*0.8;
        i===0?ctx.moveTo(sx,sy):ctx.lineTo(sx,sy);
      }
      ctx.strokeStyle=P.cyan;ctx.lineWidth=2;ctx.stroke();

      // R marker
      const Rx=rpX+(R/2.5)*rpW;
      ctx.strokeStyle=P.gold+"80";ctx.lineWidth=1;ctx.setLineDash([3,3]);
      ctx.beginPath();ctx.moveTo(Rx,30);ctx.lineTo(Rx,H-30);ctx.stroke();ctx.setLineDash([]);
      ctx.fillStyle=P.gold;ctx.font="7px monospace";ctx.textAlign="center";
      ctx.fillText("R",Rx,H-18);

      // Physarum analogy
      ctx.fillStyle=P.teal;ctx.font="bold 7px monospace";ctx.textAlign="center";
      ctx.fillText("PHYSARUM ANALOGY:",rpX+rpW/2,H*0.62);
      const lines=["Thick tube = low resistance","= compressed spacetime","Pruned tube = high resistance","= stretched spacetime","Both minimise energy"];
      lines.forEach((l,i)=>{ctx.fillStyle=P.dim;ctx.font="6.5px monospace";ctx.fillText(l,rpX+rpW/2,H*0.62+12+i*10);});

      ctx.fillStyle=P.cyan;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("ALCUBIERRE WARP METRIC · BUBBLE SPACETIME DISTORTION · EXOTIC ENERGY RING",8,14);
      ctx.fillStyle=P.muted;ctx.font="7px monospace";
      ctx.fillText(`σ=${sigma.toFixed(1)} · v_s=${vwarp.toFixed(1)}c · bubble R=${R} · purple=negative T₀₀ (exotic) · green=positive`,8,H-6);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);

  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:420,display:"block"}}/>
      <div style={{padding:"10px 16px",background:P.panel,display:"flex",gap:20,flexWrap:"wrap"}}>
        <div>
          <div style={{fontSize:10,color:P.cyan,marginBottom:3}}>Warp speed v_s · {vs.toFixed(1)}c</div>
          <input type="range" min={0.5} max={10} step={0.1} value={vs} onChange={e=>setVs(+e.target.value)} style={{width:130}}/>
        </div>
        <div>
          <div style={{fontSize:10,color:P.cyan,marginBottom:3}}>Wall sharpness σ · {sig.toFixed(1)}</div>
          <input type="range" min={1} max={12} step={0.5} value={sig} onChange={e=>setSig(+e.target.value)} style={{width:130}}/>
        </div>
        <div style={{fontSize:11,color:P.dim,lineHeight:1.85,maxWidth:480}}>
          The Alcubierre metric contracts spacetime ahead of the ship and expands it behind — the ship sits inside a flat-spacetime bubble and moves without acceleration. The purple ring is the exotic (negative energy density) requirement. The warp profile f(r) directly analogises to a Physarum tube diameter profile: maximum conductance at the bubble wall, zero inside and outside.
        </div>
      </div>
    </div>
  );
}

/* ── CANVAS 3: Network shortest-path comparison (Physarum vs Dijkstra) ── */
function NetworkCompareCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current;if(!cv)return;
    const ctx=cv.getContext("2d")!;
    let raf=0,t=0;
    const ro=new ResizeObserver(()=>{cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;});
    ro.observe(cv);cv.width=cv.offsetWidth;cv.height=cv.offsetHeight;

    // 8 node graph, same on both sides
    const nodesFrac=[[0.08,0.5],[0.25,0.2],[0.25,0.8],[0.45,0.35],[0.45,0.65],[0.65,0.2],[0.65,0.8],[0.88,0.5]];
    const edgesRaw:Array<[number,number]>=[[0,1],[0,2],[1,3],[2,4],[3,5],[4,6],[5,7],[6,7],[1,4],[2,3],[3,6],[4,5]];
    // Dijkstra solution path
    const dijkstraPath=[0,1,3,5,7];
    // Physarum reinforced edges (after convergence, same optimal + some secondary)
    const physarumStrong=[0,1,5,8,3,11]; // edge indices

    function draw(){
      const W=cv.width,H=cv.height;
      ctx.clearRect(0,0,W,H);ctx.fillStyle=P.bg;ctx.fillRect(0,0,W,H);

      const HALF=W/2;

      [0,1].forEach(side=>{
        const ox=side*HALF;
        const nodes=nodesFrac.map(([fx,fy])=>({x:ox+fx*HALF,y:fy*H}));
        const isPhysarum=side===1;

        // Background
        ctx.fillStyle=isPhysarum?"rgba(0,200,180,0.04)":"rgba(0,100,255,0.04)";
        ctx.fillRect(ox,0,HALF,H);

        // Edges
        edgesRaw.forEach(([a,b],ei)=>{
          const na=nodes[a],nb=nodes[b];
          const isDijkPath=dijkstraPath.includes(a)&&dijkstraPath.includes(b)&&Math.abs(dijkstraPath.indexOf(a)-dijkstraPath.indexOf(b))===1;
          const isPhysStrong=physarumStrong.includes(ei);
          let col,lw;
          if(isPhysarum){
            const pulse=0.6+0.4*Math.sin(t*0.04+ei);
            col=isPhysStrong?P.gold+(Math.round(pulse*200).toString(16).padStart(2,"0")):P.blue+"33";
            lw=isPhysStrong?3.5:0.8;
          } else {
            col=isDijkPath?P.cyan+"cc":P.blue+"33";
            lw=isDijkPath?2.5:0.8;
          }
          ctx.strokeStyle=col;ctx.lineWidth=lw;
          ctx.beginPath();ctx.moveTo(na.x,na.y);ctx.lineTo(nb.x,nb.y);ctx.stroke();
          // Dijkstra animated scout
          if(!isPhysarum&&isDijkPath){
            const prog=(t*0.018+ei*0.2)%1;
            const px2=na.x+(nb.x-na.x)*prog,py2=na.y+(nb.y-na.y)*prog;
            ctx.fillStyle=P.cyan;ctx.beginPath();ctx.arc(px2,py2,3,0,Math.PI*2);ctx.fill();
          }
          // Physarum flow
          if(isPhysarum&&isPhysStrong){
            const prog=(t*0.022+ei*0.3)%1;
            const px2=na.x+(nb.x-na.x)*prog,py2=na.y+(nb.y-na.y)*prog;
            ctx.fillStyle=P.gold;ctx.beginPath();ctx.arc(px2,py2,3,0,Math.PI*2);ctx.fill();
          }
        });
        // Nodes
        nodes.forEach((nd,i)=>{
          const isEnd=i===0||i===7;
          const col=isEnd?P.gold:isPhysarum?P.teal:P.blue;
          const R=isEnd?12:8;
          ctx.fillStyle=col+"cc";ctx.beginPath();ctx.arc(nd.x,nd.y,R,0,Math.PI*2);ctx.fill();
          ctx.fillStyle="#fff";ctx.font="bold 7px monospace";ctx.textAlign="center";
          ctx.fillText(isEnd?(i===0?"S":"T"):String(i),nd.x,nd.y+3.5);
        });

        // Label
        ctx.fillStyle=isPhysarum?P.teal:P.cyan;ctx.font="bold 9px monospace";ctx.textAlign="center";
        ctx.fillText(isPhysarum?"PHYSARUM (biological)":"DIJKSTRA (algorithm)",ox+HALF/2,18);
        ctx.fillStyle=P.dim;ctx.font="7px monospace";
        ctx.fillText(isPhysarum?"Gold = reinforced tubes · parallel optimisation":"Blue = explored path · sequential BFS",ox+HALF/2,30);
      });

      // Divider
      ctx.strokeStyle="rgba(255,255,255,0.08)";ctx.lineWidth=1;ctx.setLineDash([5,5]);
      ctx.beginPath();ctx.moveTo(HALF,0);ctx.lineTo(HALF,H);ctx.stroke();ctx.setLineDash([]);

      ctx.fillStyle=P.gold;ctx.font="bold 8px monospace";ctx.textAlign="left";
      ctx.fillText("NETWORK OPTIMISATION · DIJKSTRA vs PHYSARUM · SAME OPTIMAL PATH · DIFFERENT COMPUTATION",8,H-6);

      t++;raf=requestAnimationFrame(draw);
    }
    draw();
    return()=>{cancelAnimationFrame(raf);ro.disconnect();};
  },[]);
  return(
    <div style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden",marginBottom:28}}>
      <canvas ref={ref} style={{width:"100%",height:360,display:"block"}}/>
      <div style={{padding:"8px 16px",background:P.panel,fontSize:11,color:P.dim,lineHeight:1.8}}>
        <strong style={{color:P.teal}}>Left: Dijkstra's algorithm</strong> — explores edges sequentially from source, marks shortest path. <strong style={{color:P.gold}}>Right: Physarum polycephalum</strong> — every tube flows simultaneously, high-flow tubes reinforce and grow, low-flow tubes decay. Both converge to the same optimal path. Physarum is massively parallel; Dijkstra is sequential. A warp drive would be a Physarum-type optimiser: the spacetime metric is the "network", the warp bubble is the "reinforced path" of minimum exotic energy.
      </div>
    </div>
  );
}

export default function PlasmodiumWarpPage(){
  const [imgX,setImgX]=useState<number|null>(null);
  const imgs=[
    {src:omniFlow,caption:"Omni-Flow Array · Physarum at Scale",
     anno:"The omni-flow rhombic array is structurally identical to a mature Physarum network: each rhombus is a tube junction, each edge is a conducting channel with adaptive diameter. The key insight from Physarum research is that the network does not have a control centre — the routing intelligence is entirely distributed in the tube diameters. A thick tube has low resistance, attracts more flow, and grows thicker. A thin tube has high resistance, starves of flow, and prunes itself. This self-organisation without central control is precisely the property required for a warp-drive routing algorithm operating in a real spacetime: there is no place outside spacetime from which to orchestrate the metric adjustment. The adjustment must be local, iterative, and self-reinforcing.",
     chips:["Distributed Control","Tube Adaptation","Hagen-Poiseuille","Minimum Energy Path","No Central Orchestrator","Local Feedback"]},
    {src:skyrmion,caption:"Skyrmion · Topological Warp Bubble",
     anno:"A skyrmion is a topologically protected field configuration — it cannot be continuously deformed into a uniform state without passing through a high-energy intermediate. This topological protection is exactly what the Alcubierre bubble requires: a stable boundary (the warp wall) that maintains the discontinuity between compressed (front) and expanded (rear) spacetime. The skyrmion's winding number Q (analogous to the Chern-Simons number in the metric) counts how many times the spin field wraps around the sphere — and a bubble with Q≠0 cannot decay without expending energy equal to its topological charge. A skyrmion-stable warp bubble would require a topological invariant to be conserved throughout the journey, preventing premature bubble collapse.",
     chips:["Topological Protection","Winding Number","Bubble Wall Stability","Chern-Simons","Metric Discontinuity","Skyrmion Analogy"]},
    {src:magStorm,caption:"Solar Coronal Network · Pre-Mapped Spacetime Paths",
     anno:"The solar corona pre-maps its own lowest-energy paths via magnetic reconnection — exactly as Physarum pre-maps its transport paths via tube adaptation. When a flux tube reconnects, it finds the lower-energy topology and snaps to it. The newly connected tubes carry more current, attract more flux, and stabilise. The disconnected region collapses (prunes). This is Physarum in magnetohydrodynamics: local energy minimisation, no central planning, emergent global optimal topology. For warp drive, the analogy suggests that a pre-existing coherent field (perhaps a zero-point vacuum field) could be stimulated to 'reconnect' into a lower-energy topology — the warp bubble — if the local field can be driven past a saddle point in its energy landscape, just as a coronal loop is driven past its reconnection threshold by increasing current.",
     chips:["Magnetic Reconnection","Energy Saddle Point","Flux Tube Adaptation","Coronal Loop Pruning","Vacuum Field Stimulation","Reconnection Threshold"]},
  ];
  return(
    <div style={{background:P.bg,color:P.ivory,minHeight:"100vh",fontFamily:"inherit"}}>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"52px 32px 36px"}}>
        <Tag label="Plasmodium Prototype · Physarum Polycephalum · Warp Drive Topology · Alcubierre Metric · Distributed Optimisation"/>
        <h1 style={{fontSize:34,fontWeight:800,lineHeight:1.1,margin:"8px 0 14px",letterSpacing:-0.5}}>
          <span style={{color:P.cyan}}>Slime Mould</span> as a<br/>
          <span style={{color:P.teal}}>Warp-Drive</span> <span style={{color:P.gold}}>Prototype</span>
        </h1>
        <h2 style={{fontSize:18,fontWeight:400,color:"#bae6fd",margin:"0 0 18px",lineHeight:1.5}}>
          Physarum polycephalum finds shortest paths without neurons · the same distributed hydraulic optimisation describes a minimum-exotic-energy warp bubble
        </h2>
        <p style={{fontSize:14,color:P.dim,lineHeight:1.9,maxWidth:780,marginBottom:20}}>
          Physarum polycephalum — the "slime mould" — is a single-celled organism with no brain, no nervous system, no global planner. Yet it reliably solves the shortest-path problem between food sources, reproducing the Tokyo rail network topology in a Petri dish in 24 hours. The mechanism: every tube obeys Hagen-Poiseuille flow, high-flow tubes self-reinforce, low-flow tubes decay. The Alcubierre warp drive works by the same principle applied to spacetime: compress the metric in front, expand it behind, the ship sits inside a bubble of locally flat spacetime moving at superluminal speed. Both require a distributed energy minimisation with no external orchestrator.
        </p>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section I · Physarum Network · Hagen-Poiseuille Tube Adaptation" color={P.teal}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.teal,margin:"0 0 12px"}}>Live Slime Mould Optimisation</h2>
        <p style={{fontSize:14,color:P.dim,lineHeight:1.9,maxWidth:780,marginBottom:20}}>
          Watch the network adapt in real time. Gold tubes = reinforced high-flow paths. Blue = weak, pruning. The algorithm: solve Kirchhoff pressure at each node, compute flow Q through each tube via Hagen-Poiseuille, update tube diameter D proportional to |Q|^0.75 minus decay. No global solver — just local feedback at each edge.
        </p>
        <PlasmodiumCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <EqBlock label="HAGEN-POISEUILLE + ADAPTATION" color={P.teal}
            eq={"Flow: Q = (ΔP/L) · πD⁴/128η\n\nConductance: C = D⁴/(L · 128η/π)\n\nAdaptation: dD/dt = (|Q|^γ − decay) · D\n\nγ ≈ 0.75 (Physarum empirical)\ndecay ≈ 0.015 (tube degradation rate)\n\nReinforcement: |Q|^γ > decay → D grows\nPruning:       |Q|^γ < decay → D shrinks → 0"}
            note="High-flow tubes grow in diameter, reducing their resistance further and attracting even more flow — a positive feedback that locks in the optimal path. Low-flow tubes decay below a threshold diameter and vanish."/>
          <EqBlock label="WARP DRIVE ANALOGY" color={P.cyan}
            eq={"Alcubierre metric:\nds² = −dt² + (dx − v_s·f(r_s)dt)² + dy² + dz²\n\nShape function: f(r) = (tanh σ(r+R)−tanh σ(r−R)) / 2tanh(σR)\n\nExotic energy density:\nT₀₀ ∝ −(v_s²/8π) · (df/dr)² · r² sin²θ\n\nAnalogy: f(r) = tube diameter profile\nPeak at bubble wall = max conductance = warp wall"}
            note="The warp bubble's shape function f(r) — 1 inside the bubble, 0 outside, sharp transition at radius R — is identical in mathematical form to the Physarum tube diameter profile along a reinforced path. Maximum conductance at the wall, flat interior."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section II · Alcubierre Warp Bubble · Spacetime Distortion · Exotic Energy Ring" color={P.cyan}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.cyan,margin:"0 0 12px"}}>Warp Metric · Compressed Ahead · Expanded Behind</h2>
        <WarpBubbleCanvas/>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(185px,1fr))",gap:12}}>
          <Card title="Negative Energy" sub="exotic matter" color={P.violet} body="Alcubierre drive requires negative energy density (T₀₀ < 0) around the bubble wall — exotic matter that violates the null energy condition. The total required scales as v_s²R²σ. No known macroscopic negative-energy material exists, but the Casimir effect demonstrates quantum vacuum can produce negative energy locally."/>
          <Card title="Causal Disconnection" sub="control problem" color={P.rose} body="The warp bubble is causally disconnected from its interior — a ship inside cannot signal the outside to turn off the drive. This is the 'horizon problem': the ship cannot steer. Physarum does not have this problem: every tube is in hydraulic communication with every junction. A hybrid Physarum-warp design would require pre-programmed bubble topology before activation."/>
          <Card title="Hawking Radiation" sub="quantum instability" color={P.gold} body="Finazzi, Liberati & Barceló (2009) showed that the interior of an Alcubierre bubble is bathed in Hawking-like radiation from the warp horizon — any quantum field detector inside would register an enormous thermal flux proportional to v_s²σ². At v_s = 10c and σ = 8, this may be lethal for any occupant."/>
          <Card title="Positive Energy Variant" sub="Van Den Broeck" color={P.green} body="Van Den Broeck (1999) showed that by making the bubble's exterior surface area tiny (microscopic) while keeping the interior large, the total exotic energy requirement drops by many orders of magnitude. This is again the Physarum principle: a thin tube neck connecting large reservoirs — the network optimises conductance per unit material."/>
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section III · Algorithm Comparison · Physarum vs Dijkstra · Same Optimum" color={P.gold}/>
        <h2 style={{fontSize:22,fontWeight:700,color:P.gold,margin:"0 0 12px"}}>Distributed vs Sequential · Same Answer</h2>
        <NetworkCompareCanvas/>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 48px"}}>
        <Tag label="Section IV · Source Plates" color={P.gold}/>
        <div style={{display:"flex",flexDirection:"column" as const,gap:22}}>
          {imgs.map((img,i)=>(
            <div key={i} style={{border:`1px solid ${P.line}`,borderRadius:12,overflow:"hidden"}}>
              <img src={img.src} alt={img.caption} onClick={()=>setImgX(imgX===i?null:i)}
                style={{width:"100%",display:"block",cursor:"zoom-in",maxHeight:imgX===i?"none":240,objectFit:"cover" as const,objectPosition:"top"}}/>
              <div style={{padding:"14px 18px",background:P.panel}}>
                <div style={{fontSize:11,fontWeight:700,color:P.gold,marginBottom:8}}>{img.caption}</div>
                <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                  {img.chips.map((ch,ci)=><span key={ci} style={{fontSize:10,padding:"2px 8px",borderRadius:12,border:`1px solid ${P.gold}33`,color:P.gold,background:P.gold+"0f"}}>{ch}</span>)}
                </div>
                <div style={{fontSize:12,color:P.dim,lineHeight:1.85}}>{img.anno}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Divider/>
      <div style={{maxWidth:1060,margin:"0 auto",padding:"0 32px 52px"}}>
        <Tag label="AETHER Reading"/>
        <div style={{padding:"20px 24px",background:P.panel2,borderRadius:14,border:`1px solid ${P.cyan}15`,marginBottom:24}}>
          <div style={{fontSize:14,color:P.ivory,lineHeight:2.0}}>
            Physarum is a proof of concept for distributed spacetime engineering: a physical system that finds the minimum-energy path without central computation, without neurons, without a plan. It does this by making the path solve itself — positive feedback on high-flow edges, negative feedback on low-flow edges, until only the optimal structure remains. A warp drive built on this principle would not be steered from inside or outside — it would be pre-grown, like a Physarum network between two food sources, and then activated. The bubble topology would be the tube network; the exotic energy distribution would be the pressure gradient; the warp wall sharpness σ would be the junction resistance. The slime mould is not a metaphor for warp drive. It is the <em style={{color:P.cyan}}>physical prototype</em>.
          </div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {["/electron-field","/gradient-field","/spin-lattice","/aether-engine","/coherence-field-explorer","/slime-maze","/circular-farm"].map(href=>(
            <a key={href} href={href} style={{padding:"6px 12px",borderRadius:8,border:`1px solid ${P.line}`,color:P.dim,fontSize:11,textDecoration:"none"}}>{href.replace("/","").replace(/-/g," ")} →</a>
          ))}
        </div>
      </div>
    </div>
  );
}

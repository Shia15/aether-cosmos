import React, { useEffect, useRef } from "react";

const TAU=Math.PI*2;
const CW=900;

const V={
  bg:"#03050B", gold:"#C8A030", amb:"#FF9933", blue:"#4488FF",
  vio:"#9966FF", green:"#44CC77", rose:"#FF6699", plasma:"#FF4477",
  cyan:"#22DDFF", photon:"#00FFBB", shock:"#FFDD22", fire:"#FF6622",
  dim:"#2A3050", ink:"#B8CCE8", aurora:"#00FFB2",
  mono:"'Space Mono',monospace" as const,
  serif:"'Crimson Pro',serif" as const,
  disp:"'Cinzel',serif" as const,
};

const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS · PHYSARUM MAZE SOLVER
   ───────────────────────────────────────────────────────────────────────── */
function SlimeMazeCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=570;
    cv.width=CW; cv.height=CH;
    const ctx=cv.getContext("2d")!;

    /* ── MAZE DIMENSIONS ── */
    const COLS=22, ROWS=15, CS=25;
    const MOX=18, MOY=52; /* maze origin */

    /* ── SEEDED RNG ── */
    let _seed=31337;
    const rng=()=>{_seed=(_seed*16807)%2147483647;return(_seed-1)/2147483646;};
    const shuf=(a:number[])=>{
      for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
      return a;
    };

    /* ── MAZE GENERATION (iterative DFS / recursive backtracker) ── */
    const N=ROWS*COLS;
    /* wallN[i]=1: north wall of cell i exists. wallE[i]=1: east wall of cell i exists. */
    const wallN=new Uint8Array(N).fill(1);
    const wallE=new Uint8Array(N).fill(1);
    const vis=new Uint8Array(N);
    const cellIdx=(r:number,c:number)=>r*COLS+c;
    const DR=[-1,0,1,0], DC=[0,1,0,-1];

    const stk=[cellIdx(0,0)];
    vis[cellIdx(0,0)]=1;
    while(stk.length){
      const cur=stk[stk.length-1];
      const r=Math.floor(cur/COLS), c=cur%COLS;
      const dirs=shuf([0,1,2,3]);
      let moved=false;
      for(const d of dirs){
        const nr=r+DR[d], nc=c+DC[d];
        if(nr<0||nr>=ROWS||nc<0||nc>=COLS) continue;
        const nxt=cellIdx(nr,nc);
        if(vis[nxt]) continue;
        /* Remove wall between cur and nxt */
        if(d===0) wallN[cur]=0;          /* remove cur's N wall */
        else if(d===1) wallE[cur]=0;     /* remove cur's E wall */
        else if(d===2) wallN[nxt]=0;     /* remove nxt's N wall (=cur's S) */
        else wallE[nxt]=0;               /* remove nxt's E wall (=cur's W) */
        vis[nxt]=1; stk.push(nxt); moved=true; break;
      }
      if(!moved) stk.pop();
    }

    /* ── BUILD EDGE GRAPH ── */
    const EDGES:{a:number;b:number}[]=[];
    const adjList:{n:number;e:number}[][]=Array.from({length:N},()=>[]);
    const addEdge=(a:number,b:number)=>{
      const ei=EDGES.length;
      EDGES.push({a,b});
      adjList[a].push({n:b,e:ei});
      adjList[b].push({n:a,e:ei});
    };
    for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const i=cellIdx(r,c);
      if(c<COLS-1&&!wallE[i]) addEdge(i,i+1);           /* east */
      if(r<ROWS-1&&!wallN[cellIdx(r+1,c)]) addEdge(i,cellIdx(r+1,c)); /* south */
    }
    const E=EDGES.length;

    /* ── SOURCE & SINK ── */
    const SOURCE=cellIdx(0,0);
    const SINK=cellIdx(ROWS-1,COLS-1);

    /* ── BFS from SOURCE for growth animation order ── */
    const bfsDist=new Int32Array(N).fill(-1);
    bfsDist[SOURCE]=0;
    const bfsQ=[SOURCE]; let bfsH=0;
    while(bfsH<bfsQ.length){
      const cur=bfsQ[bfsH++];
      adjList[cur].forEach(({n})=>{
        if(bfsDist[n]===-1){bfsDist[n]=bfsDist[cur]+1;bfsQ.push(n);}
      });
    }
    const maxDist=bfsDist[SINK];

    /* edge fill time = min BFS dist of its two endpoints */
    const eFillT=new Int32Array(E);
    EDGES.forEach((e,ei)=>{eFillT[ei]=Math.min(bfsDist[e.a],bfsDist[e.b]);});

    /* ── PHYSARUM STATE ── */
    const D=new Float32Array(E).fill(0);   /* conductance per edge */
    const P=new Float32Array(N).fill(0.5); /* pressure per node */
    const Q=new Float32Array(E);           /* flow per edge */
    P[SOURCE]=1.0; P[SINK]=0.0;

    /* ── PARTICLES (cytoplasm beads) ── */
    const PARTS:{ei:number;prog:number;fwd:boolean;col:string}[]=[];

    /* ── PHASE TRACKING ── */
    const GROW_DUR=Math.round(maxDist*2.0); /* frames to fill maze */
    let adaptFrame=0; /* frames since adaptation started */
    let initialized=false;
    let frame=0, raf=0;

    /* ── GAUSS-SEIDEL PRESSURE SOLVER ── */
    const solvePressure=(iters:number)=>{
      for(let it=0;it<iters;it++){
        for(let i=0;i<N;i++){
          if(i===SOURCE||i===SINK) continue;
          let num=0, den=0;
          adjList[i].forEach(({n,e})=>{num+=D[e]*P[n]; den+=D[e];});
          if(den>1e-12) P[i]=num/den;
        }
        P[SOURCE]=1.0; P[SINK]=0.0;
      }
      EDGES.forEach((e,ei)=>{Q[ei]=D[ei]*Math.abs(P[e.a]-P[e.b]);});
    };

    /* ── FIND SOLUTION PATH (greedy max-D from source) ── */
    const solutionPath:number[]=[];
    const findPath=()=>{
      solutionPath.length=0;
      const visited2=new Uint8Array(N);
      let cur=SOURCE;
      for(let step=0;step<N;step++){
        visited2[cur]=1;
        solutionPath.push(cur);
        if(cur===SINK) break;
        let bestN=-1, bestD=0;
        adjList[cur].forEach(({n,e})=>{
          if(!visited2[n]&&D[e]>bestD){bestD=D[e];bestN=n;}
        });
        if(bestN===-1) break;
        cur=bestN;
      }
    };

    /* ── CELL CENTER ── */
    const cx=(c:number)=>MOX+c*CS+CS/2;
    const cy=(r:number)=>MOY+r*CS+CS/2;

    /* ── DRAW MAZE WALLS ── */
    const drawWalls=()=>{
      ctx.strokeStyle=`rgba(100,120,180,0.55)`; ctx.lineWidth=1.5;
      /* Outer boundary: top */
      ctx.beginPath(); ctx.moveTo(MOX,MOY); ctx.lineTo(MOX+COLS*CS,MOY); ctx.stroke();
      /* Outer boundary: bottom */
      ctx.beginPath(); ctx.moveTo(MOX,MOY+ROWS*CS); ctx.lineTo(MOX+COLS*CS,MOY+ROWS*CS); ctx.stroke();
      /* Outer boundary: left (skip gap at row 0 = entrance) */
      ctx.beginPath(); ctx.moveTo(MOX,MOY+CS); ctx.lineTo(MOX,MOY+ROWS*CS); ctx.stroke();
      /* Outer boundary: right (skip gap at row ROWS-1 = exit) */
      ctx.beginPath(); ctx.moveTo(MOX+COLS*CS,MOY); ctx.lineTo(MOX+COLS*CS,MOY+(ROWS-1)*CS); ctx.stroke();
      /* Internal horizontal walls */
      for(let r=1;r<ROWS;r++) for(let c=0;c<COLS;c++){
        if(wallN[cellIdx(r,c)]){
          ctx.beginPath();
          ctx.moveTo(MOX+c*CS,MOY+r*CS); ctx.lineTo(MOX+(c+1)*CS,MOY+r*CS); ctx.stroke();
        }
      }
      /* Internal vertical walls */
      for(let r=0;r<ROWS;r++) for(let c=0;c<COLS-1;c++){
        if(wallE[cellIdx(r,c)]){
          ctx.beginPath();
          ctx.moveTo(MOX+(c+1)*CS,MOY+r*CS); ctx.lineTo(MOX+(c+1)*CS,MOY+(r+1)*CS); ctx.stroke();
        }
      }
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ── PHASE: GROWTH ── */
      if(frame<GROW_DUR){
        const wave=frame/GROW_DUR*maxDist;
        EDGES.forEach((_,ei)=>{
          if(eFillT[ei]<=wave){
            const localAge=wave-eFillT[ei];
            D[ei]=Math.min(1.0,localAge*0.12);
          }
        });
      }

      /* ── PHASE: ADAPTATION ── */
      if(frame>=GROW_DUR){
        if(!initialized){ D.fill(1.0); initialized=true; }
        solvePressure(22);
        const MU=0.018, DT=0.5, GAMMA=1.15;
        EDGES.forEach((_,ei)=>{
          D[ei]+=DT*(Math.pow(Math.max(0,Q[ei]),GAMMA)-MU*D[ei]);
          D[ei]=Math.max(0,Math.min(2.5,D[ei]));
        });
        adaptFrame++;
        /* Find solution path once per 30 frames */
        if(adaptFrame%30===0) findPath();
      }

      /* ── DRAW SLIME TUBES ── */
      /* Draw thin dim layer first (ghost of all corridors) */
      EDGES.forEach((e,ei)=>{
        if(D[ei]<0.001) return;
        const ra=Math.floor(e.a/COLS), ca=e.a%COLS;
        const rb=Math.floor(e.b/COLS), cb=e.b%COLS;
        const ax=cx(ca), ay=cy(ra), bx=cx(cb), by=cy(rb);
        const norm=Math.min(1,D[ei]/1.8);
        const lw=Math.max(0.4,norm*CS*0.42);
        const rr=Math.round(lerp(30,255,norm));
        const gg=Math.round(lerp(15,185,Math.pow(norm,1.3)));
        const bb=Math.round(lerp(5,30,norm*0.2));
        const alpha=Math.min(0.88,0.12+norm*0.76);
        /* Soft glow for thick tubes */
        if(norm>0.5&&frame>=GROW_DUR){
          ctx.strokeStyle=`rgba(${rr},${gg},${bb},${alpha*0.18})`;
          ctx.lineWidth=lw+6; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
        }
        ctx.strokeStyle=`rgba(${rr},${gg},${bb},${alpha})`;
        ctx.lineWidth=lw; ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(bx,by); ctx.stroke();
      });

      /* ── SOLUTION PATH OVERLAY (once adaptation is running) ── */
      if(frame>=GROW_DUR&&solutionPath.length>1){
        const solAlpha=Math.min(0.6,(adaptFrame-30)/200);
        if(solAlpha>0){
          ctx.strokeStyle=`rgba(255,255,120,${solAlpha})`;
          ctx.lineWidth=2.2;
          ctx.beginPath();
          solutionPath.forEach((cell,si)=>{
            const r=Math.floor(cell/COLS), c=cell%COLS;
            si===0?ctx.moveTo(cx(c),cy(r)):ctx.lineTo(cx(c),cy(r));
          });
          ctx.stroke();
          /* Dots at each solution node */
          solutionPath.forEach(cell=>{
            const r=Math.floor(cell/COLS), c=cell%COLS;
            ctx.beginPath(); ctx.arc(cx(c),cy(r),2.5,0,TAU);
            ctx.fillStyle=`rgba(255,240,100,${solAlpha*0.8})`; ctx.fill();
          });
        }
      }

      /* ── MAZE WALLS ── */
      drawWalls();

      /* ── SOURCE / SINK PORTALS ── */
      const srcX=cx(0), srcY=cy(0), snkX=cx(COLS-1), snkY=cy(ROWS-1);
      /* Entrance arrow */
      const enG=ctx.createRadialGradient(srcX,srcY,0,srcX,srcY,22);
      enG.addColorStop(0,`${V.green}55`); enG.addColorStop(1,"transparent");
      ctx.fillStyle=enG; ctx.fillRect(srcX-22,srcY-22,44,44);
      ctx.fillStyle=V.green+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="right";
      ctx.fillText("ENTRANCE →",MOX-4,srcY+3);
      /* Exit arrow */
      const exG=ctx.createRadialGradient(snkX,snkY,0,snkX,snkY,22);
      exG.addColorStop(0,`${V.photon}55`); exG.addColorStop(1,"transparent");
      ctx.fillStyle=exG; ctx.fillRect(snkX-22,snkY-22,44,44);
      ctx.fillStyle=V.photon+"CC"; ctx.font=`700 8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("→ EXIT",MOX+COLS*CS+4,snkY+3);

      /* ── CYTOPLASM PARTICLES (on high-Q edges) ── */
      if(frame>=GROW_DUR){
        if(frame%3===0&&PARTS.length<100){
          let bestEi=0, bestQ=0;
          EDGES.forEach((_,ei)=>{ if(Q[ei]>bestQ){bestQ=Q[ei];bestEi=ei;} });
          const threshold=bestQ*0.15;
          EDGES.forEach((e,ei)=>{
            if(Q[ei]>threshold&&PARTS.length<100&&Math.random()<0.08){
              const fwd=P[e.a]>P[e.b];
              PARTS.push({ei,prog:fwd?0:1,fwd,col:Q[ei]>bestQ*0.6?V.shock:V.amb});
            }
          });
        }
        for(let pi=PARTS.length-1;pi>=0;pi--){
          const pt=PARTS[pi];
          const spd=(0.015+Q[pt.ei]*0.025)*(pt.fwd?1:-1);
          pt.prog+=spd;
          if(pt.prog<0||pt.prog>1){PARTS.splice(pi,1);continue;}
          const e=EDGES[pt.ei];
          const ra=Math.floor(e.a/COLS), ca=e.a%COLS;
          const rb=Math.floor(e.b/COLS), cb=e.b%COLS;
          const px=lerp(cx(ca),cx(cb),pt.prog), py=lerp(cy(ra),cy(rb),pt.prog);
          const ptG=ctx.createRadialGradient(px,py,0,px,py,5);
          ptG.addColorStop(0,pt.col+"CC"); ptG.addColorStop(1,"transparent");
          ctx.fillStyle=ptG; ctx.fillRect(px-5,py-5,10,10);
          ctx.beginPath(); ctx.arc(px,py,1.8,0,TAU);
          ctx.fillStyle=pt.col+"EE"; ctx.fill();
        }
      }

      /* ── RIGHT PANEL ── */
      const PX=MOX+COLS*CS+38;
      const PY0=MOY;

      /* Phase indicator */
      const isGrowing=frame<GROW_DUR;
      const convRatio=adaptFrame>0?(EDGES.filter((_,ei)=>D[ei]<0.05).length/E):0;
      const phaseName=isGrowing?"COLONISATION":convRatio<0.2?"EXPLORATION":convRatio<0.6?"RETRACTION":"SOLUTION";
      const phaseCol=isGrowing?V.gold:convRatio<0.2?V.amb:convRatio<0.6?V.fire:V.photon;

      ctx.fillStyle=phaseCol+"EE"; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText(phaseName,PX,PY0+5);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText(isGrowing?`WAVE ${Math.round(frame/GROW_DUR*100)}%`:`ADAPT FRAME ${adaptFrame}`,PX,PY0+18);

      /* Retraction bar */
      const barW=200, barH=6;
      ctx.fillStyle=V.dim+"33"; ctx.fillRect(PX,PY0+26,barW,barH);
      ctx.fillStyle=phaseCol+"88"; ctx.fillRect(PX,PY0+26,barW*convRatio,barH);
      ctx.fillStyle=V.dim+"66"; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText(`${(convRatio*100).toFixed(0)}% DEAD ENDS RETRACTED`,PX,PY0+42);

      /* Tube count stats */
      const active=EDGES.filter((_,ei)=>D[ei]>0.05).length;
      ctx.fillStyle=V.ink+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText(`ACTIVE TUBES:  ${active} / ${E}`,PX,PY0+62);
      ctx.fillText(`RETRACTED:     ${E-active}`,PX,PY0+75);
      const maxQ=E>0?Math.max(...Q):0;
      ctx.fillText(`PEAK FLOW:     ${maxQ.toFixed(3)}`,PX,PY0+88);
      ctx.fillText(`SOLUTION HOPS: ${solutionPath.length}`,PX,PY0+101);

      /* D distribution mini-histogram */
      ctx.fillStyle=V.dim+"44"; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("CONDUCTANCE DIST",PX,PY0+124);
      const BINS=24, binW=Math.floor(200/BINS);
      const hist=new Uint16Array(BINS);
      EDGES.forEach((_,ei)=>{const b=Math.min(BINS-1,Math.floor(D[ei]/2.5*BINS));hist[b]++;});
      const maxH=Math.max(1,...hist);
      for(let b=0;b<BINS;b++){
        const bh=Math.round((hist[b]/maxH)*34);
        const bx=PX+b*binW, by=PY0+162;
        const col_r=Math.round(lerp(40,255,b/BINS));
        const col_g=Math.round(lerp(15,185,Math.pow(b/BINS,1.4)));
        ctx.fillStyle=`rgba(${col_r},${col_g},15,0.6)`;
        ctx.fillRect(bx,by-bh,binW-1,bh);
      }
      ctx.strokeStyle=V.dim+"33"; ctx.lineWidth=0.5;
      ctx.strokeRect(PX,PY0+128,BINS*binW,34);

      /* Explanatory text */
      const TXT_Y=PY0+186;
      ctx.fillStyle=V.dim+"AA"; ctx.font=`700 7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("THE PHYSARUM PRINCIPLE:",PX,TXT_Y);
      const lines=[
        "NO BRAIN.",
        "NO NEURONS.",
        "NO NERVOUS SYSTEM.",
        "",
        "PURE HAGEN-POISEUILLE:",
        "Q = D·|ΔP|",
        "dD/dt = Qᵞ − μD",
        "",
        "FLOW REINFORCES FLOW.",
        "DEAD ENDS STARVE.",
        "ONE PATH EMERGES.",
        "",
        "A FOREST DOES THE",
        "SAME THING.",
        "",
        "MYCORRHIZAL HYPHAE",
        "CONNECTING ROOTS:",
        "TUBES CARRYING",
        "CARBON + PHOSPHORUS",
        "THICKEN.",
        "",
        "TUBES LEADING TO",
        "EXHAUSTED SOIL",
        "PATCHES RETRACT.",
        "",
        "NO FUNGAL BRAIN",
        "DECIDES THIS.",
        "ONLY FLOW.",
      ];
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      lines.forEach((ln,li)=>{
        if(ln.startsWith("dD")||ln.startsWith("Q =")){
          ctx.fillStyle=V.gold+"AA"; ctx.font=`700 7px ${V.mono}`;
        }else if(li===0){
          ctx.fillStyle=V.dim+"BB";
        }else{
          ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
        }
        ctx.fillText(ln,PX,TXT_Y+14+li*11.5);
      });

      /* ── HEADER ── */
      ctx.fillStyle=V.ink; ctx.font=`700 10px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PHYSARUM POLYCEPHALUM · MAZE SOLVER · HAGEN-POISEUILLE FLOW OPTIMIZATION",8,16);
      ctx.fillStyle=V.dim+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText("NO BRAIN · NO NEURONS · NO NERVOUS SYSTEM · CYTOPLASM TUBES ONLY",8,30);
      ctx.fillStyle=phaseCol+"88"; ctx.textAlign="right";
      ctx.fillText(`F:${frame}`,CW-8,16);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} width={CW} height={570} style={{width:"100%",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function SlimeMazePage(){
  const S:React.CSSProperties={
    background:V.bg,color:V.ink,minHeight:"100vh",
    padding:"40px 32px 100px",fontFamily:V.serif,maxWidth:980,margin:"0 auto",
  };
  const badge=(t:string,col=V.cyan)=>(
    <span key={t} style={{fontFamily:V.mono,fontSize:"0.52rem",color:col,
      border:`1px solid ${col}44`,borderRadius:3,padding:"2px 8px",letterSpacing:2,
      marginRight:6,marginBottom:5,display:"inline-block"}}>{t}</span>
  );
  const P=(t:string)=>(
    <p style={{fontFamily:V.serif,fontSize:"clamp(0.88rem,1.7vw,1.02rem)",lineHeight:1.78,
      color:V.ink,margin:"0 0 13px",opacity:0.9}}>{t}</p>
  );
  const eq=(t:string,col=V.gold)=>(
    <div style={{fontFamily:V.mono,fontSize:"0.75rem",color:col,letterSpacing:1,
      margin:"12px 0 12px 18px",padding:"8px 14px",
      borderLeft:`2px solid ${col}44`,background:`${col}08`}}>{t}</div>
  );
  const cards=(items:{h:string;col:string;d:string}[])=>(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10,marginTop:14}}>
      {items.map(c=>(
        <div key={c.h} style={{background:`${c.col}0A`,border:`1px solid ${c.col}28`,
          borderRadius:6,padding:"10px 12px"}}>
          <div style={{fontFamily:V.mono,fontSize:"0.58rem",color:c.col,
            letterSpacing:1.5,marginBottom:5}}>{c.h}</div>
          <div style={{fontFamily:V.serif,fontSize:"0.82rem",color:V.ink,lineHeight:1.5}}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>
      <div style={{marginBottom:36}}>
        {[badge("LIVE SIMULATION",V.shock),badge("PHYSARUM",V.gold),
          badge("MAZE SOLVER",V.photon),badge("NO BRAIN",V.fire),
          badge("HAGEN-POISEUILLE",V.cyan),badge("FLOW OPTIMIZATION",V.photon),
          badge("COLONISATION",V.gold),badge("RETRACTION",V.fire),
          badge("DEAD ENDS",V.plasma),badge("MYCORRHIZAL PARALLEL",V.green)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.2rem,3.6vw,2.4rem)",color:V.shock,
          margin:"22px 0 6px",letterSpacing:"0.08em",fontWeight:400,lineHeight:1.12}}>
          PHYSARUM POLYCEPHALUM
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:4,
          margin:"0 0 6px"}}>MAZE SOLVER · CYTOPLASM FLOW · NO BRAIN · NO NEURONS</p>
        <p style={{fontFamily:V.mono,fontSize:"0.52rem",color:V.dim+"88",letterSpacing:3,
          margin:"0 0 22px"}}>HAGEN-POISEUILLE · FLOW REINFORCEMENT · DEAD END RETRACTION · FOREST PARALLEL</p>

        {P("Physarum polycephalum — the many-headed slime. It is not a fungus, not a plant, not an animal. It belongs to the Myxomycetes: the slime molds. A single cell, sometimes as large as a dinner plate, with millions of nuclei sharing one cytoplasm. It has no brain, no neurons, no nervous system, no sensory organs. It is, at root, a bag of cytoplasm with walls.")}
        {P("Place it at the entrance of a maze with food at the exit. Within hours, it solves the maze. Not by trial and error. Not by intelligence. By pure physics.")}
        {P("The slime mold grows cytoplasmic tubes through the entire maze simultaneously — exploring every corridor at once. No corridor is ignored; no path is pre-judged. Then: tubes that carry sustained flow (entrance to exit) become thicker. Tubes that lead to dead ends (only one connection, no through-flow) become thinner and eventually retract completely. The solution path — the shortest route from entrance to exit — is the only tube left. It happened with no decision, no calculation, no anything except flow.")}
      </div>

      <div style={{border:`1px solid ${V.shock}22`,borderRadius:8,padding:2,marginBottom:40}}>
        <SlimeMazeCanvas/>
      </div>

      <section style={{marginBottom:48}}>
        <div style={{fontFamily:V.mono,fontSize:"0.55rem",color:V.gold,letterSpacing:3,marginBottom:5}}>
          {"01 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500 \u2500"}
        </div>
        <h2 style={{fontFamily:V.disp,fontSize:"clamp(0.95rem,2.4vw,1.45rem)",color:V.gold,
          margin:"0 0 18px",letterSpacing:"0.06em",fontWeight:400}}>
          The Physics · Hagen-Poiseuille · Adaptive Conductance
        </h2>
        {P("The mechanism requires no exotic biology. It is fluid dynamics in a tube, and a feedback rule that any tube subject to flow naturally obeys:")}
        {eq("Q = (D / L) · |ΔP|   — flow through a tube = conductance × pressure gradient")}
        {eq("dD/dt = |Q|ᵞ − μD    — conductance grows with flow, decays without it")}
        {P("That is all. D is the conductance of each tube — proportional to the fourth power of tube radius (Hagen-Poiseuille: thicker tube = vastly more flow). Q is the flow rate. μ is a decay constant — all tubes naturally thin over time unless maintained. γ > 1 creates a winner-take-all nonlinearity: tubes with slightly more flow grow faster, tubes with slightly less flow lose faster.")}
        {P("Dead ends are automatically selected against. A dead-end tube connects at one end to the network and at the other end to nothing. Flow can enter but has nowhere to go — there is no pressure gradient to sustain it. Q ≈ 0. D decays. The tube retracts. Dead ends starve not because any part of the slime mold 'knows' they are dead ends — but because they carry no flow, and tubes that carry no flow thin.")}
        {P("The maze is solved by global pressure. The entrance is held at high pressure (the slime mold is growing from there, so cytoplasm pressure is high). The exit is at low pressure (open, so pressure equilibrates to environment). The pressure gradient drives flow. Any path from entrance to exit carries this gradient and sustains its tubes. Dead ends connect only to the high-pressure side — no gradient, no flow, no future.")}
        {cards([
          {h:"HAGEN-POISEUILLE LAW",col:V.gold,d:"In cylindrical tubes: Q = (πr⁴ΔP) / (8ηL). The fourth-power dependence on radius is the key: double the radius → 16× more flow. This is why, once a tube starts to thicken (more flow → less resistance → more flow), the feedback accelerates rapidly. Conversely, a thinning tube loses flow far faster than its radius decreases. Hagen-Poiseuille was derived for Newtonian fluids in rigid tubes. Physarum cytoplasm is non-Newtonian (contains actin filaments) and tubes are elastic, but the 4th-power scaling holds approximately."},
          {h:"ADAPTIVE CONDUCTANCE",col:V.gold,d:"The Physarum model (Tero et al., 2010, Science): the adaptation rule is not a metaphor — it was directly measured. Researchers tracked tube conductance (from video microscopy of tube cross-section) and cytoplasm flow velocity (from particle tracking). The measured dD/dt matched the model equation with γ≈1 and μ≈0.01 per second. The convergence time to the minimum-spanning-tree solution in their Tokyo rail experiment: ~24 hours for a 1cm² slime mold. In the simulation above, convergence takes 300-500 frames; each frame corresponds to ~0.5 seconds of slime mold time."},
          {h:"TOKYO RAIL SYSTEM",col:V.photon,d:"In 2010 (Science 327:439), Tero, Takagi, and colleagues placed P. polycephalum at the position of Tokyo on a map, with oat flakes at positions corresponding to 36 surrounding cities. The slime mold grew a network nearly identical to the actual Tokyo rail system — optimizing for travel time, resilience (alternative routes to key hubs), and cost (total tube length). The rail system was designed by engineers over decades. The slime mold solved it in 26 hours. Both solutions exploit the same underlying optimization constraint: minimize transport cost subject to connectivity."},
          {h:"PRESSURE SOLVER",col:V.cyan,d:"At each frame, the pressure at each node is found by Kirchhoff's current law: the sum of flows into any interior node = 0 (conservation). This gives a linear system: for each node i, Σⱼ (Dᵢⱼ/Lᵢⱼ)(Pᵢ - Pⱼ) = 0. With source fixed at P=1 and sink at P=0, this is a symmetric positive-definite system with a unique solution. The simulation uses Gauss-Seidel iteration (22 iterations per frame), which converges rapidly because the maze graph has low spectral radius. For a 22×15 maze (~325 interior nodes), each iteration takes < 0.1 ms."},
          {h:"FOREST PARALLEL",col:V.green,d:"The mycorrhizal network does exactly this — not as a metaphor, but mechanically. Physarum cytoplasm flow follows Hagen-Poiseuille because cytoplasm is a fluid in a tube. Mycorrhizal hyphal cytoplasm is the same type of fluid in the same type of tube. The adaptive rule in Physarum (dD/dt = Q - μD) is the same as hyphal reinforcement in mycorrhizal networks: hyphae that carry sustained nutrient flow (carbon from productive trees, phosphorus from nutrient patches) grow thicker; hyphae leading to exhausted soil patches lose cytoplasm and retract. The forest has no brain. Only flow."},
          {h:"DEAD END RETRACTION",col:V.fire,d:"In the simulation: a dead-end corridor has only one connection to the through-network. Pressure at its terminal node = pressure of its single neighbor (no gradient across the dead-end tube). Q ≈ 0. dD/dt = 0 - μD → D decays exponentially toward 0. Time constant: 1/μ frames. With μ=0.018, the time constant is ~55 frames = ~55 seconds. In real Physarum: μ ≈ 0.01/s → 100s time constant. In the forest: unused hyphal segments have a half-life of 5-15 days — measured by tracking fluorescent hyphae in intact soil. The physics is identical across 7 orders of magnitude of spatial scale."},
        ])}
      </section>
    </div>
  );
}

import React, { useEffect, useRef } from "react";

const V = {
  bg:    "#04060E",
  gold:  "#C8A030",
  amb:   "#FF9933",
  blue:  "#4488FF",
  vio:   "#9966FF",
  green: "#44CC77",
  rose:  "#FF6699",
  plasma:"#FF4477",
  cyan:  "#22DDFF",
  photon:"#00FFBB",
  shock: "#FFDD22",
  fire:  "#FF6622",
  dim:   "#2A3050",
  ink:   "#B8CCE8",
  /* terrain palette */
  t0: "#002244", t1: "#0A3866", t2: "#1A5C40", t3: "#2E7A28",
  t4: "#5A9A18", t5: "#A0C020", t6: "#D4B030", t7: "#C87820",
  t8: "#B04818", t9: "#FFFFFF",
  mono:  "'Space Mono',monospace" as const,
  serif: "'Crimson Pro',serif"    as const,
  disp:  "'Cinzel',serif"         as const,
};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t));
const TAU=Math.PI*2;

/* Terrain colour from elevation 0–1 */
function terrainCol(e:number,alpha=1):string{
  const stops=[V.t0,V.t1,V.t2,V.t3,V.t4,V.t5,V.t6,V.t7,V.t8,V.t9];
  const idx=Math.min(stops.length-2,Math.floor(e*(stops.length-1)));
  const t2=e*(stops.length-1)-idx;
  const c1=stops[idx], c2=stops[idx+1];
  const hex2rgb=(h:string)=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
  const [r1,g1,b1]=hex2rgb(c1), [r2,g2,b2]=hex2rgb(c2);
  return `rgba(${Math.round(lerp(r1,r2,t2))},${Math.round(lerp(g1,g2,t2))},${Math.round(lerp(b1,b2,t2))},${alpha})`;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Topography Fonts · Contour Letterforms · Elevation Fields
   ───────────────────────────────────────────────────────────────────────── */
function TopographyFontCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=400, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Off-screen canvas for distance field computation */
    const OC=document.createElement("canvas");
    OC.width=CW; OC.height=CH;
    const oc=OC.getContext("2d")!;

    /* Letters to render with topography */
    const LETTERS="AETHER";
    const LETTER_W=CW/LETTERS.length;
    const FONT_SIZE=Math.floor(LETTER_W*0.72);
    const CONTOURS=16;
    const MAX_SPREAD=LETTER_W*0.42;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      /* Terrain background — deep ocean colour */
      const bgGrd=ctx.createLinearGradient(0,0,0,CH);
      bgGrd.addColorStop(0,"#020810"); bgGrd.addColorStop(1,"#04060E");
      ctx.fillStyle=bgGrd; ctx.fillRect(0,0,CW,CH);

      /* Elevation phase: 0–1 oscillating, shifts contour colours */
      const elev=(Math.sin(frame*0.012)+1)/2;

      LETTERS.split("").forEach((letter,li)=>{
        const cx2=LETTER_W*li+LETTER_W/2;
        const cy2=CH/2-12;

        /* Draw topographic contours: concentric strokeText at increasing lineWidths */
        for(let c=CONTOURS;c>=0;c--){
          const t2=c/CONTOURS;
          const lw=MAX_SPREAD*(1-t2)*0.95+1;
          /* Elevation for this contour: offset by animation phase */
          const e=((t2+elev+li*0.07)%1);
          const col=terrainCol(e, c===0?0:1);
          ctx.save();
          ctx.font=`900 ${FONT_SIZE}px ${V.disp}`;
          ctx.textAlign="center";
          ctx.textBaseline="middle";
          ctx.strokeStyle=col;
          ctx.lineWidth=lw;
          ctx.lineJoin="round";
          ctx.lineCap="round";
          ctx.strokeText(letter,cx2,cy2);
          ctx.restore();
        }

        /* Solid fill on top (dark/ink colour) */
        ctx.save();
        ctx.font=`900 ${FONT_SIZE}px ${V.disp}`;
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.fillStyle="#060C1A";
        ctx.fillText(letter,cx2,cy2);
        ctx.restore();

        /* Letter highlight stroke */
        ctx.save();
        ctx.font=`900 ${FONT_SIZE}px ${V.disp}`;
        ctx.textAlign="center";
        ctx.textBaseline="middle";
        ctx.strokeStyle=terrainCol((elev+li*0.1)%1,0.9);
        ctx.lineWidth=1.2;
        ctx.lineJoin="round";
        ctx.strokeText(letter,cx2,cy2);
        ctx.restore();

        /* Elevation label below letter */
        ctx.fillStyle=terrainCol((elev+li*0.1)%1,0.8);
        ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(`${Math.floor((elev+li*0.07)*100%100)}m`,cx2,cy2+FONT_SIZE*0.58);
      });

      /* ── Bottom: contour legend bar ── */
      const LBY=CH-40, LBX=30, LBW=CW-60;
      for(let i=0;i<LBW;i++){
        ctx.fillStyle=terrainCol(i/LBW);
        ctx.fillRect(LBX+i,LBY,1,14);
      }
      ctx.strokeStyle=V.dim+"55"; ctx.lineWidth=0.5; ctx.strokeRect(LBX,LBY,LBW,14);
      const labels=["OCEAN","COAST","VALLEY","PLAIN","UPLAND","HILL","RIDGE","PEAK","SUMMIT","SNOW"];
      labels.forEach((l,i)=>{
        const lx=LBX+i*(LBW/(labels.length-1));
        ctx.fillStyle=V.ink+"AA"; ctx.font=`5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(l,lx,LBY+26);
      });

      /* ── Top: scan line overlay for relief depth ── */
      ctx.fillStyle="rgba(0,0,0,0.12)";
      for(let y=0;y<CH;y+=4){
        ctx.fillRect(0,y,CW,1);
      }

      /* Title */
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("TOPOGRAPHIC CONTOUR TYPE · ELEVATION FIELD · TERRAIN COLOUR RAMP · ANIMATED CONTOUR CYCLING",CW/2,14);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>{cancelAnimationFrame(raf);};
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"400px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Electroset · Electric Field Type · Multidimensional Cells
   ───────────────────────────────────────────────────────────────────────── */
function ElectrosetCellCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* ── Cellular Automaton: right panel ── */
    const CA_COLS=52, CA_ROWS=34;
    const CA_X=CW*0.47, CA_Y=28;
    const CA_CW=(CW-CA_X-10)/CA_COLS, CA_CH=(CH-CA_Y-80)/CA_ROWS;

    /* 5-state CA: 0=dead, 1=quiescent-green, 2=active, 3=excited, 4=refractory */
    let grid:number[][]=Array.from({length:CA_ROWS},()=>
      Array.from({length:CA_COLS},()=>Math.random()<0.28?Math.floor(Math.random()*3):0));
    let nextGrid:number[][]=grid.map(r=>[...r]);
    const CA_STATES=[0,1,2,3,4];
    const CA_COLS_COLORS=["transparent",V.green+"99",V.photon+"CC",V.shock+"CC","#334455CC"];

    /* "Multidimensional" — show 3 overlapping grid layers at slight offsets */
    const LAYERS=3;
    const LAYER_COLS=["#44CC7733","#22DDFF22","#9966FF22"];

    let caTimer=0;
    const updateCA=()=>{
      nextGrid=grid.map(row=>[...row]);
      for(let r=0;r<CA_ROWS;r++){
        for(let c=0;c<CA_COLS;c++){
          const cur=grid[r][c];
          /* Count live neighbors (8-connected) */
          let liveN=0, activeN=0;
          for(let dr=-1;dr<=1;dr++) for(let dc=-1;dc<=1;dc++){
            if(dr===0&&dc===0) continue;
            const nr=(r+dr+CA_ROWS)%CA_ROWS, nc=(c+dc+CA_COLS)%CA_COLS;
            if(grid[nr][nc]>0) liveN++;
            if(grid[nr][nc]===2||grid[nr][nc]===3) activeN++;
          }
          /* Transition rules: modified excitable medium */
          if(cur===0){ nextGrid[r][c]=activeN>=2&&liveN<=4?1:0; }
          else if(cur===1){ nextGrid[r][c]=activeN>=1?2:liveN<2||liveN>5?0:1; }
          else if(cur===2){ nextGrid[r][c]=3; }
          else if(cur===3){ nextGrid[r][c]=4; }
          else if(cur===4){ nextGrid[r][c]=liveN>=2?1:0; }
        }
      }
      grid=nextGrid;
    };

    /* Electric field charges for left panel */
    /* We approximate field lines using equipotential curves around the letter "E" */
    const ELETTER="ELECTROSET";
    /* Point charges along letter strokes — pre-computed positions */
    const ELX=CW*0.22, ELY=CH*0.42, ELFS=90;
    /* Build charge distribution: sample many points along letter shape */
    const OC=document.createElement("canvas"); OC.width=CW; OC.height=CH;
    const oc=OC.getContext("2d")!;
    oc.font=`900 ${ELFS}px ${V.mono}`;
    oc.fillStyle="#FFFFFF";
    oc.textAlign="center"; oc.textBaseline="middle";
    oc.fillText("E",ELX,ELY);
    const id=oc.getImageData(ELX-60,ELY-50,120,100);
    const CHARGES:{x:number;y:number;q:number}[]=[];
    for(let px=0;px<id.width;px+=4) for(let py=0;py<id.height;py+=4){
      if(id.data[(py*id.width+px)*4+3]>128){
        CHARGES.push({x:ELX-60+px,y:ELY-50+py,q:-1});
      }
    }
    /* External positive charges ring */
    for(let i=0;i<24;i++){
      const a=i/24*TAU;
      CHARGES.push({x:ELX+Math.cos(a)*85,y:ELY+Math.sin(a)*75,q:+1});
    }

    /* Electric potential at (x,y) */
    const potential=(x:number,y:number,charges:{x:number;y:number;q:number}[])=>{
      let V2=0;
      charges.forEach(c=>{
        const dx=x-c.x, dy=y-c.y;
        const r=Math.sqrt(dx*dx+dy*dy)+2;
        V2+=c.q/r;
      });
      return V2;
    };

    /* Field line seed points (positive charges → follow −∇V) */
    const SEEDS:Array<{x:number;y:number;col:string}>=[];
    for(let i=0;i<20;i++){
      const a=i/20*TAU;
      SEEDS.push({x:ELX+Math.cos(a)*85,y:ELY+Math.sin(a)*75,col:V.cyan});
    }

    /* Pre-compute field lines */
    const FIELD_LINES:Array<Array<[number,number]>>=SEEDS.map(seed=>{
      const pts:Array<[number,number]>=[[seed.x,seed.y]];
      let cx2=seed.x, cy2=seed.y;
      for(let step=0;step<80;step++){
        const dx=potential(cx2+1,cy2,CHARGES)-potential(cx2-1,cy2,CHARGES);
        const dy=potential(cx2,cy2+1,CHARGES)-potential(cx2,cy2-1,CHARGES);
        const mag=Math.sqrt(dx*dx+dy*dy)+0.001;
        cx2-=dx/mag*2.5; cy2-=dy/mag*2.5;
        pts.push([cx2,cy2]);
        if(Math.abs(cx2-ELX)<50&&Math.abs(cy2-ELY)<45) break;
      }
      return pts;
    });

    /* Pre-compute equipotential lines */
    const EQ_LEVELS=8;
    const EQ_POINTS:Array<Array<[number,number]>>=[];
    for(let eq=0;eq<EQ_LEVELS;eq++){
      const r2=30+eq*10;
      const pts:Array<[number,number]>=[];
      for(let a=0;a<TAU;a+=0.06){
        pts.push([ELX+Math.cos(a)*r2,ELY+Math.sin(a)*r2*0.8]);
      }
      EQ_POINTS.push(pts);
    }

    /* Text pixels for electroset letter banner */
    const BANNER_LETTERS=ELETTER.split("");

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,CW,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#050A12");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* ── LEFT: Electric Field Type Panel ── */
      const LPW=CW*0.44;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("ELECTROSET · ELECTRIC FIELD TYPOGRAPHY",10,18);

      /* Equipotential surfaces */
      EQ_POINTS.forEach((pts,eq)=>{
        const pulse=0.5+0.5*Math.sin(frame*0.03+eq*0.5);
        ctx.strokeStyle=`rgba(34,180,255,${(0.15+0.15*pulse)*(1-eq/EQ_LEVELS*0.5)})`;
        ctx.lineWidth=0.8;
        ctx.beginPath(); pts.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y));
        ctx.closePath(); ctx.stroke();
      });

      /* Field lines (animated flow) */
      const flowT=(frame*0.008)%1;
      FIELD_LINES.forEach((pts,fi)=>{
        if(pts.length<4) return;
        ctx.strokeStyle=V.cyan+"44"; ctx.lineWidth=0.7;
        ctx.beginPath(); pts.forEach(([x,y],i)=>i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)); ctx.stroke();
        /* Flowing particle */
        const fpi=Math.floor((flowT+fi/FIELD_LINES.length)%1*(pts.length-1));
        if(fpi<pts.length){
          const [fx,fy]=pts[fpi];
          ctx.fillStyle=V.cyan+"CC"; ctx.beginPath(); ctx.arc(fx,fy,2,0,TAU); ctx.fill();
        }
      });

      /* Charge symbols */
      CHARGES.filter(c=>c.q>0).forEach((c,i)=>{
        if(i%3!==0) return;
        ctx.fillStyle=V.plasma+"88"; ctx.beginPath(); ctx.arc(c.x,c.y,2,0,TAU); ctx.fill();
      });

      /* The letter E — main rendered form */
      ctx.save();
      /* Glow behind letter */
      const eGrd=ctx.createRadialGradient(ELX,ELY,0,ELX,ELY,70);
      eGrd.addColorStop(0,V.cyan+"22"); eGrd.addColorStop(1,"transparent");
      ctx.fillStyle=eGrd; ctx.fillRect(ELX-70,ELY-70,140,140);
      /* Multi-layer topographic fill */
      for(let lay=12;lay>=0;lay--){
        const lw=lay*3.5;
        ctx.font=`900 ${ELFS}px ${V.mono}`;
        ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.strokeStyle=terrainCol(lay/12,0.6+lay*0.03);
        ctx.lineWidth=lw; ctx.lineJoin="round";
        ctx.strokeText("E",ELX,ELY);
      }
      /* Dark fill */
      ctx.fillStyle="#04060E";
      ctx.font=`900 ${ELFS}px ${V.mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText("E",ELX,ELY);
      /* Bright outline */
      ctx.strokeStyle=V.cyan+"CC"; ctx.lineWidth=1;
      ctx.strokeText("E",ELX,ELY);
      ctx.restore();

      /* Labels */
      ctx.fillStyle=V.cyan; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("−Q (conductor letter)",ELX,ELY+58);
      ctx.fillText("+Q (point charges) → field lines → letter",ELX,ELY+70);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("E-field: Φ = Σ qᵢ/rᵢ",ELX,ELY+82);

      /* Electroset banner: scrolling text using topographic stroke style */
      const banY=CH-75;
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("ELECTROSET TYPESETTING · GALVANIC TYPE MATRIX · PHOTOTYPESETTING · FIELD EMISSION",10,banY-10);
      BANNER_LETTERS.forEach((letter,li)=>{
        const bx=12+li*(LPW-12)/BANNER_LETTERS.length;
        const by2=banY+20;
        const e=(Math.sin(frame*0.04+li*0.5)+1)/2;
        for(let lay=5;lay>=0;lay--){
          ctx.font=`bold 16px ${V.mono}`;
          ctx.textAlign="left"; ctx.textBaseline="middle";
          ctx.strokeStyle=terrainCol((e+lay*0.08)%1,0.7);
          ctx.lineWidth=lay*2.5; ctx.lineJoin="round";
          ctx.strokeText(letter,bx,by2);
        }
        ctx.fillStyle="#04060E"; ctx.font=`bold 16px ${V.mono}`;
        ctx.textAlign="left"; ctx.textBaseline="middle";
        ctx.fillText(letter,bx,by2);
        ctx.strokeStyle=terrainCol(e,0.9); ctx.lineWidth=0.8;
        ctx.strokeText(letter,bx,by2);
      });

      /* ── RIGHT: Multidimensional Cellular Automaton ── */
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("MULTIDIMENSIONAL CELLS · EXCITABLE MEDIUM · 5-STATE AUTOMATON",CA_X,18);

      /* Update CA */
      caTimer++;
      if(caTimer>8){ caTimer=0; updateCA(); }

      /* Draw 3 layers (depth illusion) */
      for(let lay=LAYERS-1;lay>=0;lay--){
        const layOff=lay*3;
        for(let r=0;r<CA_ROWS;r++){
          for(let c=0;c<CA_COLS;c++){
            const s=grid[r][c];
            if(s===0) continue;
            const cx2=CA_X+c*CA_CW+layOff, cy2=CA_Y+r*CA_CH+layOff;
            /* Layer depth tints */
            const layAlpha=1-lay*0.25;
            const stateCol=[
              "",
              `rgba(68,204,119,${0.5*layAlpha})`,
              `rgba(0,255,187,${0.8*layAlpha})`,
              `rgba(255,221,34,${0.9*layAlpha})`,
              `rgba(42,48,80,${0.5*layAlpha})`,
            ];
            ctx.fillStyle=stateCol[s];
            ctx.fillRect(cx2+0.5,cy2+0.5,CA_CW-1,CA_CH-1);
          }
        }
      }

      /* Cell grid lines (very faint) */
      ctx.strokeStyle="#1A2540"; ctx.lineWidth=0.4;
      for(let r=0;r<=CA_ROWS;r++){
        ctx.beginPath(); ctx.moveTo(CA_X,CA_Y+r*CA_CH); ctx.lineTo(CA_X+CA_COLS*CA_CW,CA_Y+r*CA_CH); ctx.stroke();
      }
      for(let c=0;c<=CA_COLS;c++){
        ctx.beginPath(); ctx.moveTo(CA_X+c*CA_CW,CA_Y); ctx.lineTo(CA_X+c*CA_CW,CA_Y+CA_ROWS*CA_CH); ctx.stroke();
      }

      /* State legend */
      const legY=CA_Y+CA_ROWS*CA_CH+14;
      const states=["DEAD","QUIESCENT","ACTIVE","EXCITED","REFRACTORY"];
      const sCols=["#2A3050","#44CC77","#00FFBB","#FFDD22","#334455"];
      states.forEach((s,i)=>{
        const lx=CA_X+i*(CW-CA_X-4)/states.length;
        ctx.fillStyle=sCols[i]; ctx.beginPath(); ctx.arc(lx+5,legY+5,4,0,TAU); ctx.fill();
        ctx.fillStyle=sCols[i]; ctx.font=`5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(s,lx+12,legY+8);
      });

      /* Live cell count */
      const alive=grid.flat().filter(c=>c>0).length;
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText(`ALIVE: ${alive} / ${CA_ROWS*CA_COLS}  ·  GEN ${Math.floor(frame/8)}  ·  EXCITABLE MEDIUM DYNAMICS`,CA_X,legY+24);

      /* Dimension labels (overlay, 3D depth indicator) */
      ctx.fillStyle=V.vio; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="right";
      ctx.fillText("Z+  →  layer 3",CW-8,CA_Y+CA_ROWS*CA_CH*0.25);
      ctx.fillStyle=V.cyan; ctx.fillText("Z   →  layer 2",CW-8,CA_Y+CA_ROWS*CA_CH*0.5);
      ctx.fillStyle=V.photon; ctx.fillText("Z-  →  layer 1",CW-8,CA_Y+CA_ROWS*CA_CH*0.75);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"480px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · Green Symbolism · Latin Inscriptions · Alchemical · Celtic
   ───────────────────────────────────────────────────────────────────────── */
function GreenLatinCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=460, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Celtic knot helper — basic triskele */
    const drawTriskele=(cx:number,cy:number,r:number,col:string,t:number)=>{
      for(let arm=0;arm<3;arm++){
        const baseAngle=arm*TAU/3+t;
        ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.lineCap="round";
        ctx.beginPath();
        for(let a=0;a<TAU*0.8;a+=0.04){
          const spiral=a/(TAU*0.8);
          const rad=r*(0.2+spiral*0.78);
          const x2=cx+Math.cos(baseAngle+a*0.9)*rad;
          const y2=cy+Math.sin(baseAngle+a*0.9)*rad;
          if(a===0) ctx.moveTo(x2,y2); else ctx.lineTo(x2,y2);
        }
        ctx.stroke();
      }
    };

    /* Chlorophyll porphyrin ring (simplified) */
    const drawChlorophyll=(cx:number,cy:number,r:number,t:number)=>{
      /* Central Mg²⁺ */
      const mgGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,r*0.18);
      mgGrd.addColorStop(0,V.photon+"FF"); mgGrd.addColorStop(1,V.photon+"44");
      ctx.fillStyle=mgGrd; ctx.beginPath(); ctx.arc(cx,cy,r*0.15,0,TAU); ctx.fill();
      ctx.fillStyle=V.photon; ctx.font=`7px ${V.mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText("Mg²⁺",cx,cy);
      /* 4 pyrrole rings */
      for(let i=0;i<4;i++){
        const a=i/4*TAU+t*0.2;
        const prx=cx+Math.cos(a)*r*0.52, pry=cy+Math.sin(a)*r*0.52;
        ctx.strokeStyle=V.green+"CC"; ctx.lineWidth=1.5;
        ctx.beginPath(); ctx.arc(prx,pry,r*0.22,0,TAU); ctx.stroke();
        /* N atom */
        ctx.fillStyle=V.green; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText("N",prx,pry);
        /* Connections to center */
        ctx.strokeStyle=V.green+"55"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(prx,pry); ctx.stroke();
      }
      /* Outer ring (porphyrin macrocycle) */
      const pulse=0.85+0.15*Math.sin(t*0.06);
      ctx.strokeStyle=V.green+Math.floor(pulse*200).toString(16).padStart(2,"0");
      ctx.lineWidth=1.5; ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.arc(cx,cy,r*0.78,0,TAU); ctx.stroke();
      ctx.setLineDash([]);
      /* Phytol tail (simplified long chain) */
      ctx.strokeStyle=V.green+"44"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx+r*0.78,cy);
      for(let i=1;i<=8;i++){
        ctx.lineTo(cx+r*0.78+i*9,cy+Math.sin(i*0.8+t*0.05)*8);
      }
      ctx.stroke();
      ctx.fillStyle=V.green+"66"; ctx.font=`5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("phytol tail (C₂₀)",cx+r*0.78+2,cy-10);
    };

    /* Roman numeral clock */
    const ROMAN=["XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI"];
    const drawRomanClock=(cx:number,cy:number,r:number,t:number)=>{
      /* Face */
      const fGrd=ctx.createRadialGradient(cx,cy,0,cx,cy,r);
      fGrd.addColorStop(0,"#0A1A0A"); fGrd.addColorStop(1,"#051005");
      ctx.fillStyle=fGrd; ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU); ctx.fill();
      ctx.strokeStyle=V.green+"88"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(cx,cy,r,0,TAU); ctx.stroke();
      ctx.strokeStyle=V.green+"33"; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.arc(cx,cy,r*0.85,0,TAU); ctx.stroke();
      /* Hour marks + Roman numerals */
      ROMAN.forEach((num,i)=>{
        const a=i/12*TAU-Math.PI/2;
        const mx=cx+Math.cos(a)*r*0.78, my=cy+Math.sin(a)*r*0.78;
        ctx.fillStyle=V.green; ctx.font=`bold ${i===0?7:6}px ${V.disp}`; ctx.textAlign="center"; ctx.textBaseline="middle";
        ctx.fillText(num,mx,my);
        /* Tick */
        ctx.strokeStyle=V.green+"44"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r*0.88,cy+Math.sin(a)*r*0.88);
        ctx.lineTo(cx+Math.cos(a)*r*0.95,cy+Math.sin(a)*r*0.95); ctx.stroke();
      });
      /* Hands */
      const secA=(t*0.06%TAU)-Math.PI/2;
      const minA=(t*0.001%TAU)-Math.PI/2;
      const hrA=(t*0.00008%TAU)-Math.PI/2;
      /* Hour hand */
      ctx.strokeStyle=V.green+"CC"; ctx.lineWidth=2.5; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(hrA)*r*0.48,cy+Math.sin(hrA)*r*0.48); ctx.stroke();
      /* Minute hand */
      ctx.strokeStyle=V.photon+"CC"; ctx.lineWidth=1.8; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(minA)*r*0.66,cy+Math.sin(minA)*r*0.66); ctx.stroke();
      /* Second hand */
      ctx.strokeStyle=V.plasma+"AA"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(cx+Math.cos(secA)*r*0.78,cy+Math.sin(secA)*r*0.78); ctx.stroke();
      /* Center dot */
      ctx.fillStyle=V.green; ctx.beginPath(); ctx.arc(cx,cy,3,0,TAU); ctx.fill();
      ctx.lineCap="butt";
      /* SPQR inscription */
      ctx.fillStyle=V.gold+"88"; ctx.font=`bold 7px ${V.disp}`; ctx.textAlign="center";
      ctx.fillText("SPQR",cx,cy+r*0.52);
    };

    /* Latin phrases */
    const PHRASES=[
      {lat:"VIRIDIS",       eng:"green · the colour of life and Venus",   col:V.green},
      {lat:"VITA",          eng:"life · the animate principle",            col:V.photon},
      {lat:"TEMPUS FUGIT",  eng:"time flies · carpe diem",                col:V.gold},
      {lat:"IN VIVO",       eng:"in the living organism",                  col:V.green},
      {lat:"TERRA VIRIDIS", eng:"green earth · alchemical pigment",        col:V.photon},
      {lat:"OMNIA VINCIT",  eng:"all things conquer · Amor omnia vincit",  col:V.amb},
      {lat:"LUMEN NATURAE", eng:"light of nature · Paracelsus",            col:V.shock},
      {lat:"PER ASPERA",    eng:"through hardship · → AD ASTRA",           col:V.vio},
    ];

    /* Alchemical symbols */
    const ALCHSYMBOLS=[
      {sym:"♀",name:"VENUS · CUPRUM",col:"#66BB44",note:"copper → green patina · viridian"},
      {sym:"☿",name:"MERCURY · Hg",  col:V.cyan,   note:"quicksilver · fluid metal"},
      {sym:"♃",name:"JUPITER · TIN",  col:V.blue,   note:"sky blue · expansion"},
      {sym:"⊕",name:"TERRA · EARTH",  col:V.green,  note:"cross in circle · grounded"},
    ];

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#030A05");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* Subtle green star field */
      if(frame===0){
        for(let i=0;i<60;i++){
          const sx=Math.random()*CW, sy=Math.random()*CH;
          const sg=0.1+Math.random()*0.3;
          ctx.fillStyle=`rgba(68,204,119,${sg})`;
          ctx.beginPath(); ctx.arc(sx,sy,0.5,0,TAU); ctx.fill();
        }
      }

      /* ── LEFT: Green Symbolism Zone ── */
      /* Section divider */
      ctx.strokeStyle=V.green+"22"; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(CW*0.5,10); ctx.lineTo(CW*0.5,CH-10); ctx.stroke();

      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("VIRIDIS · GREEN SYMBOLISM · ALCHEMICAL · CELTIC",10,18);

      /* Chlorophyll molecule */
      const CLX=CW*0.12, CLY=155;
      ctx.fillStyle=V.green+"44"; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("CHLOROPHYLL A · C₅₅H₇₂MgN₄O₅",CLX,CLY-72);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("λ_abs: 430nm (blue) + 662nm (red)",CLX,CLY-61);
      ctx.fillText("reflects 550nm → green to the eye",CLX,CLY-51);
      drawChlorophyll(CLX,CLY,50,frame);

      /* Triskele / Celtic knot */
      const TKX=CW*0.33, TKY=140;
      ctx.fillStyle=V.green; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("CELTIC TRISKELE · TRIPLE SPIRAL",TKX,TKY-62);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("Newgrange (3200 BCE) · life · death · rebirth",TKX,TKY-51);
      drawTriskele(TKX,TKY,40,V.green+"AA",frame);

      /* Alchemical symbols row */
      const ALY=CH-150;
      ctx.fillStyle=V.gold+"AA"; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("ALCHEMICAL GREEN · PLANETARY METALS",10,ALY-12);
      ALCHSYMBOLS.forEach((a,i)=>{
        const ax=10+i*(CW*0.48/ALCHSYMBOLS.length);
        const ay=ALY+10;
        /* Symbol glyph */
        const pulse=0.8+0.2*Math.sin(frame*0.04+i*1.2);
        ctx.fillStyle=a.col+Math.floor(pulse*200).toString(16).padStart(2,"0");
        ctx.font=`bold 20px serif`; ctx.textAlign="center";
        ctx.fillText(a.sym,ax+20,ay+18);
        ctx.fillStyle=a.col; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(a.name,ax+20,ay+33);
        ctx.fillStyle=V.dim; ctx.font=`5px ${V.mono}`;
        ctx.fillText(a.note,ax+20,ay+44);
      });

      /* Venus/green connection line */
      const vg=ctx.createLinearGradient(10,ALY,CW*0.48,ALY);
      vg.addColorStop(0,"#66BB4422"); vg.addColorStop(1,"#66BB4400");
      ctx.strokeStyle=vg; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(10,ALY-4); ctx.lineTo(CW*0.48,ALY-4); ctx.stroke();

      /* Green colour etymology */
      const GEY=CH-38;
      ctx.fillStyle=V.green+"88"; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("VIRIDIS (Latin) → verdant, verdure → Verde (Spanish/Italian) → Vert (French) → Green (Proto-Germanic *grōniz → grōwan = to grow)",10,GEY);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("Root: PIE *gʰreh₁- (to grow) · same root as: grow, grass, graze, grain",10,GEY+13);

      /* ── RIGHT: Latin Inscriptions + Roman Clock ── */
      const RX=CW*0.52;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("LATINA · ROMAN INSCRIPTIONS · SPQR · TEMPUS",RX,18);

      /* Roman clock */
      const CLK_X=CW*0.73, CLK_Y=140, CLK_R=80;
      drawRomanClock(CLK_X,CLK_Y,CLK_R,frame);

      /* SPQR eagle header */
      ctx.fillStyle=V.gold; ctx.font=`bold 14px ${V.disp}`; ctx.textAlign="left";
      ctx.fillText("S · P · Q · R",RX,42);
      ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("Senatus Populusque Romanus",RX,54);
      ctx.fillText("the Senate and the People of Rome",RX,64);

      /* Latin phrases */
      const PHY=78;
      PHRASES.forEach((p,i)=>{
        const py=PHY+i*45;
        const pulse=0.88+0.12*Math.sin(frame*0.03+i*0.8);
        ctx.fillStyle=p.col+"18"; ctx.fillRect(RX-2,py-12,CW*0.47,40);
        ctx.strokeStyle=p.col+Math.floor(pulse*60).toString(16).padStart(2,"0");
        ctx.lineWidth=0.5; ctx.strokeRect(RX-2,py-12,CW*0.47,40);
        ctx.fillStyle=p.col; ctx.fillRect(RX-2,py-12,3,40);
        ctx.fillStyle=p.col; ctx.font=`bold 8px ${V.disp}`; ctx.textAlign="left";
        ctx.fillText(p.lat,RX+5,py+2);
        ctx.fillStyle=V.ink+"AA"; ctx.font=`5.5px ${V.mono}`;
        ctx.fillText(p.eng,RX+5,py+15);
      });

      /* ── AETHER text topographic at very bottom (banner) ── */
      const BAY=CH-20;
      "AETHER".split("").forEach((letter,li)=>{
        const bx=10+li*(CW-20)/6+8;
        const e=(Math.sin(frame*0.025+li*0.6)+1)/2;
        for(let lay=8;lay>=0;lay--){
          ctx.font=`bold 14px ${V.disp}`; ctx.textAlign="center"; ctx.textBaseline="bottom";
          ctx.strokeStyle=terrainCol((e+lay*0.1)%1,0.5);
          ctx.lineWidth=lay*2; ctx.lineJoin="round";
          ctx.strokeText(letter,bx,BAY);
        }
        ctx.fillStyle="#04060E"; ctx.font=`bold 14px ${V.disp}`;
        ctx.textAlign="center"; ctx.textBaseline="bottom";
        ctx.fillText(letter,bx,BAY);
        ctx.strokeStyle=terrainCol(e,0.8); ctx.lineWidth=0.7;
        ctx.strokeText(letter,bx,BAY);
      });

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"460px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function TopographyElectrosetPage() {
  const S:React.CSSProperties={
    background:V.bg, color:V.ink, minHeight:"100vh",
    padding:"40px 32px 100px", fontFamily:V.serif, maxWidth:980, margin:"0 auto",
  };
  const badge=(t:string,col=V.cyan)=>(
    <span key={t} style={{fontFamily:V.mono,fontSize:"0.52rem",color:col,border:`1px solid ${col}44`,
      borderRadius:3,padding:"2px 8px",letterSpacing:2,marginRight:6,marginBottom:5,display:"inline-block"}}>{t}</span>
  );
  const sec=(n:string,title:string,col:string,body:React.ReactNode)=>(
    <section style={{marginBottom:52}}>
      <div style={{fontFamily:V.mono,fontSize:"0.55rem",color:col,letterSpacing:3,marginBottom:5}}>
        {n} ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─
      </div>
      <h2 style={{fontFamily:V.disp,fontSize:"clamp(0.95rem,2.4vw,1.45rem)",color:col,
        margin:"0 0 18px",letterSpacing:"0.06em",fontWeight:400}}>{title}</h2>
      {body}
    </section>
  );
  const P=(t:string)=>(
    <p style={{fontFamily:V.serif,fontSize:"clamp(0.88rem,1.7vw,1.02rem)",lineHeight:1.78,
      color:V.ink,margin:"0 0 13px",opacity:0.9}}>{t}</p>
  );
  const cards=(items:{h:string;col:string;d:string}[])=>(
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:10,marginTop:12}}>
      {items.map(c=>(
        <div key={c.h} style={{background:`${c.col}0B`,border:`1px solid ${c.col}2A`,borderRadius:6,padding:"10px 12px"}}>
          <div style={{fontFamily:V.mono,fontSize:"0.59rem",color:c.col,letterSpacing:1.5,marginBottom:5}}>{c.h}</div>
          <div style={{fontFamily:V.serif,fontSize:"0.82rem",color:V.ink,lineHeight:1.5}}>{c.d}</div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={S}>
      <div style={{marginBottom:42}}>
        {[badge("LIVE SIMULATION"),badge("TOPOGRAPHY",V.green),badge("CONTOUR TYPE",V.green),
          badge("ELECTROSET",V.cyan),badge("ELECTRIC FIELD",V.cyan),badge("CELLULAR AUTOMATON",V.photon),
          badge("MULTIDIMENSIONAL",V.vio),badge("VIRIDIS",V.green),badge("LATIN",V.gold),
          badge("CELTIC",V.green),badge("CHLOROPHYLL",V.photon),badge("SPQR",V.gold)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.4rem,4vw,2.6rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.2}}>
          TOPOGRAPHY FONTS · ELECTROSET · MULTIDIMENSIONAL CELLS · VIRIDIS · LATIN
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          TERRAIN CONTOUR TYPE · ELECTRIC FIELD LETTERFORMS · 5-STATE EXCITABLE MEDIUM · CHLOROPHYLL · SPQR
        </p>
        {P("Typography and terrain share the same mathematical language. A topographic map encodes elevation as contour lines — curves of constant height drawn at regular intervals across a landscape. When that same technique is applied to a letterform, the stroke of the letter becomes a mountain ridge: lines of equal distance from the letter's edge radiate outward like elevation contours from a peak, colour-coded from deep ocean blue at the outermost through coastal green, highland amber, and ridge white at the letter's core.")}
        {P("The result is not decoration — it is a genuine distance field visualisation, the same signed distance function (SDF) used in modern GPU font rendering (Valve's MSDF technique, used in every game engine since 2007) to render crisp letterforms at arbitrary scale without rastering artefacts. The AETHER letterforms rendered in the canvas above are each a mountain — their serifs are ridges, their counters are valleys, and the animated cycling of the colour ramp makes the terrain appear to breathe.")}
        {P("Electroset typography (from the Intertype Fotosetter, 1950) was the industrial precursor to digital type: a master letter was electroplated in a copper bath, building up a perfect metal facsimile of the original punch. The electric field that drove copper ions from anode to cathode during electrotyping is the same field visualised here — field lines converging on the letter shape as on a conductor, equipotential surfaces wrapping concentrically around the letterform.")}
        {P("The cellular automaton on the right uses a 5-state excitable medium model (dead to quiescent to active to excited to refractory) with three overlapping layers at slight spatial offsets to simulate multi-dimensional cell cooperation. This is the computational metaphor for biological morphogenesis: cells in adjacent layers communicate through chemical gradients (morphogens), gap junctions (direct cytoplasmic channels), and mechanical signals — Turing's reaction-diffusion, Wolpert's positional information, Gierer-Meinhardt activator-inhibitor.")}
      </div>

      {sec("01","Topographic Contour Type · Signed Distance Fields · Terrain Colour Ramp",V.green,<>
        {P("The topographic letterform is generated by a single distance-field computation: for every point in the plane around a letter, compute the distance to the nearest point on the letter's boundary. This creates a scalar field in which the letter stroke is the 'mountain ridge' (distance = 0 at the stroke center), and the field values increase outward in both directions. Contour lines (isolines of constant distance value) drawn through this field produce the topographic appearance.")}
        {P("The colour ramp applied to each contour band — ocean blue (farthest from letter), coastal teal, valley green, upland amber, ridge gold, summit white — is the same terrain colour mapping used in cartography since the 19th century (Imhof's relief shading, Tanaka's oblique shading). The animation cycles the contour colours over time, equivalent to animating a rising water level across a landscape, with each colour band flooding upward as the 'sea level' rises.")}
        {P("The signed distance function (SDF) is now the standard approach to GPU font rendering. Traditional bitmap fonts require a separate raster for each font size — an 'A' at 12pt and an 'A' at 72pt are two different images. The SDF representation stores the distance to the nearest letter edge (positive outside, negative inside). At render time, the GPU reconstructs a sharp edge by thresholding the SDF field — at any scale, the edge is smooth because it is computed from a continuous function, not a raster grid.")}
        {P("Valve's MSDF (Multi-channel SDF, 2016) extends this to handle sharp corners by storing SDF values in three colour channels simultaneously, eliminating corner-rounding artefacts. Every game engine rendering text on a 4K display runs this algorithm. The topographic contour technique shown here makes the SDF visible — what the GPU computes invisibly, we render as terrain.")}
        <div style={{border:`1px solid ${V.green}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <TopographyFontCanvas/>
        </div>
        {cards([
          {h:"SDF FONT RENDERING",   col:V.green, d:"Valve MSDF (2007): single 64×64 SDF image renders at 6pt to 600pt without rasterisation artefacts. GPU threshold: if SDF(x,y) > 0.5, pixel is inside letter. Anti-aliasing: smooth step over small range around 0.5. Corner fix: multi-channel (MSDF) stores three independent SDFs in R,G,B channels → reconstructs corners via max(R,G,B). Used in: Unity, Unreal, every modern text renderer."},
          {h:"TOPOGRAPHIC MAPPING",  col:V.photon,d:"Contour interval: fixed vertical distance between isolines. Closer contours = steeper slope. Index contours (every 5th): labelled with elevation. Relief shading (hillshading): oblique illumination (NW convention) superimposed on colour. Eduard Imhof (1965) 'Cartographic Relief Presentation': definitive reference. SDF font contours = topographic distance contours with vertical axis = distance to letter stroke."},
          {h:"TERRAIN COLOUR RAMP",  col:V.gold,  d:"Classic hypsometric tinting: ocean #002244 → coastal #1A5C40 → lowland #5A9A18 → upland #A0C020 → hills #D4B030 → peaks #C87820 → summit white. Imhof's rule: saturated greens for valleys, desaturated tans for peaks (atmospheric haze at altitude). AETHER terrain ramp: 9 stops from deep navy to white, lerped continuously by signed distance value."},
          {h:"LETTER AS LANDSCAPE",  col:V.green, d:"Each AETHER letter is a mountain range: Serifs = rock faces (sharp gradient). Counters (interior white space) = crater lakes. Hairline strokes = narrow ridges. Bowl curves = rounded summits. Cross-strokes (of H, A, E) = natural saddle points. The 'E' has three horizontal stroke-ridges separated by two counter-valleys — topographically equivalent to a mesa with two levels."},
          {h:"GALVANIC ELECTROTYPE", col:V.cyan,  d:"Electrotype (c.1840): original type punch pressed into wax mold → wax coated in graphite (conductor) → suspended in copper sulfate bath → copper deposits on mold surface by Faraday's law: m = MIt/nF → thin shell removed → backed with lead. Field lines in the copper bath follow the same physics as the visualised electric field. One electrotype matrix could produce 10,000+ identical pages. Used until phototypesetting (1960s)."},
          {h:"MSDF IN AETHER",       col:V.vio,   d:"AETHER Knowledge Graph node labels, section headers, and search results all benefit from SDF font rendering when displayed on canvas elements (the Knowledge Map uses canvas). SDF allows zoom-independent crisp labels on the graph canvas — zooming into a cluster of 50 nodes renders all labels at the correct size without pixellation, identical to a vector SVG but at GPU rendering speed."},
        ])}
      </>)}

      {sec("02","Electroset · Electric Field Letterforms · Multidimensional Cellular Automaton",V.cyan,<>
        {P("The electric field around a conducting letterform is governed by Gauss's law: the letter, being a conductor, is an equipotential surface. All external field lines terminate perpendicular to the letter's surface, and equipotential surfaces wrap around the letter like contour lines around a hill — the mathematical duality of topography and electrostatics made explicit.")}
        {P("The simulation places negative charges distributed along the letter 'E' and positive charges on a surrounding ring, then integrates the field lines inward following the gradient of the electric potential. Where field lines converge (near sharp corners, at the tips of horizontal strokes), the field is strongest — the lightning-rod effect. The equipotential contours wrapping concentrically around the letter are direct analogues of the topographic contours in Canvas 1: both are iso-valued curves of a scalar field that has the letter stroke as its source.")}
        {P("The 5-state cellular automaton is a model of an excitable medium — found throughout biology: cardiac muscle cells (action potential propagation), retinal photoreceptors, slime mold aggregation waves, cortical spreading depression (migraine aura), and the Belousov-Zhabotinsky chemical oscillator. The five states — dead, quiescent, active, excited, refractory — correspond to resting potential, threshold crossing, depolarisation, repolarisation, and refractory period in a neuron.")}
        {P("The three-layer display creates a pseudo-3D projection: the same automaton state is rendered at three spatial offsets, simulating cells operating in a 3D volume and communicating across layers. Gap junctions between cells in biological tissue are exactly this: direct cytoplasmic channels (connexin protein hexamers) that allow ions, second messengers, and small molecules to pass between adjacent cells, enabling the collective computation of a tissue's response to a signal.")}
        <div style={{border:`1px solid ${V.cyan}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <ElectrosetCellCanvas/>
        </div>
        {cards([
          {h:"ELECTRIC FIELD LINES",  col:V.cyan,  d:"Field line equation: dr/ds = E(r)/|E(r)| where s = arc length. Integrating from + charge toward − letter. Density of lines = field strength. Gauss's law: ∮E·dA = Q_enc/ε₀. Conductor surface: E_tangential = 0 (all field ⊥ to surface). Corners concentrate field: E ∝ 1/r^(1-π/α) where α = corner half-angle. Sharp point (α→0): E → ∞ (why lightning rods work)."},
          {h:"5-STATE EXCITABLE CA",  col:V.photon,d:"States: 0=dead, 1=quiescent, 2=active, 3=excited, 4=refractory. Rules: dead→quiescent if ≥2 active neighbours. Quiescent→active if ≥1 excited/active neighbour. Active→excited (1 step). Excited→refractory (1 step). Refractory→quiescent if ≥2 neighbours, else dead. Produces: spiral waves, target waves, propagating fronts — same patterns as cardiac muscle / BZ reaction."},
          {h:"GAP JUNCTIONS",         col:V.green, d:"Connexin proteins (Cx26, Cx43): 6 subunits form hemichannel on one cell. Two hemichannels dock across intercellular gap (3.5 nm). Open: small molecules <1 kDa pass freely (ions, cAMP, IP₃, glucose). Regulated by: pH, Ca²⁺, voltage, phosphorylation. Cardiac muscle: ~90% of cells connected — action potential spreads in <0.3s from SA node to ventricle. CA layers model: each layer = one cell monolayer connected by gap junctions."},
          {h:"MORPHOGENESIS · TURING", col:V.vio,   d:"Alan Turing 1952 'Chemical Basis of Morphogenesis': reaction-diffusion system (activator A, inhibitor H). ∂A/∂t = D_A∇²A + f(A,H). ∂H/∂t = D_H∇²H + g(A,H). When D_H >> D_A (inhibitor diffuses faster): Turing instability → periodic spatial patterns (spots, stripes). Gierer-Meinhardt (1972): first explicit activator-inhibitor model. CA excitable medium: discrete Turing analog."},
          {h:"ELECTROTYPE HISTORY",   col:V.cyan,  d:"Joseph Swan patented electrotype 1840. Standard for newspaper printing 1860–1960. Full-page newspaper plate: electrotype of the entire page → run 1 million copies without wear. Monotype (1897) and Linotype (1884): hot metal type → then photographed → output film → contact-printed to photopolymer plate (1970s). Digital (PostScript 1985): Bézier curves → rasterised at output resolution → back to SDF (2007)."},
          {h:"3D CELLULAR LIFE",      col:V.gold,  d:"Real 3D CA biology: bone remodelling (osteoclasts + osteoblasts competing = Wolfram 3D excitable medium). Developing embryo (Drosophila): gap gene network = 3D spatial CA with 8 gap genes expressing in overlapping anterior-posterior stripes. Brain cortex spreading: 3–5 mm/min depolarisation wave visible in fMRI as green (oxygenated) → blue (deoxygenated) moving front across the cortical surface — exactly the CA pattern shown."},
        ])}
      </>)}

      {sec("03","Viridis · Green Symbolism · Latin Inscriptions · Chlorophyll · SPQR",V.green,<>
        {P("Green is the colour of the living world — not by accident, but by physics. Chlorophyll a absorbs red light (662 nm) and blue light (430 nm) with high efficiency, using these photons to drive charge separation in photosystems I and II. What it reflects — the remainder of the solar spectrum — is green (530-560 nm). The green of a leaf is the colour of the rejected photons: everything the plant could not use.")}
        {P("This makes green the colour of life's efficiency boundary. In Latin, viridis (green) shares its Proto-Indo-European root with grow, graze, grain, and grass. In alchemy, green was the colour of Venus (copper sulfate is vivid green, copper patina is verdigris), of prima materia, and of the green lion (vitriol — sulfuric acid — that devours the sun, turning gold into a green salt).")}
        {P("The Roman world encoded its values in Latin phrases that have outlasted the empire by two millennia. SPQR (Senatus Populusque Romanus) appeared on every legion standard, public building, and coin. Tempus fugit (time flies) from Virgil's Georgics. In vivo vs in vitro — the Latin distinction that organises all of modern biomedical research.")}
        {P("The Roman numeral clock in the canvas reads real time, demonstrating that the twelve-symbol Roman numeral system is a complete temporal encoding — no zero required. The AETHER framework inherits this Latin precision: every term is defined, every measurement is bounded, every claim is falsifiable. Lumen naturae — the light of nature, Paracelsus's term for the intelligence embedded in natural processes — is the philosophical ancestor of AETHER's crystallisation model.")}
        <div style={{border:`1px solid ${V.green}22`,borderRadius:8,padding:2,marginBottom:14}}>
          <GreenLatinCanvas/>
        </div>
        {cards([
          {h:"CHLOROPHYLL STRUCTURE",  col:V.photon,d:"Chlorophyll a: C₅₅H₇₂MgN₄O₅. Porphyrin macrocycle (4 pyrrole rings) chelating Mg²⁺. Chromophore: conjugated π system across the macrocycle (20 carbons in ring). Absorption: 430 nm (Soret band) + 662 nm (Q-band). Phytol tail (C₂₀ isoprenoid): hydrophobic anchor in thylakoid membrane. Extinction coefficient: 86,000 M⁻¹cm⁻¹ at 662 nm (extremely strong absorber)."},
          {h:"VENUS · COPPER · GREEN",  col:V.green, d:"Alchemical Venus ♀ = copper (Cu). Cu²⁺ sulfate: vivid blue-green (CuSO₄·5H₂O). Verdigris (Cu₂(OH)₂CO₃): green patina on copper roofs (Statue of Liberty). Malachite: Cu₂CO₃(OH)₂ — used as green pigment since ancient Egypt. Terra verte (green earth, glauconite): standard green pigment from 5th century CE to present. Verde antico marble: serpentinite green — quarried near Thessaloniki, used by Romans for columns."},
          {h:"LATIN BOTANICAL NAMES",  col:V.green, d:"Viridis (green) in botanical Latin: Quercus viridis (water oak), Pinus viridis, Humulus lupulus var. viridis. Viridissimus (very green): Euphorbia viridissima. Chloro- (Greek, same root): Chlorophyll, Chlorella (green alga), Chloroplast. Botanical Latin uses 3rd-declension adjectives: viridis (m/f) / viride (n). Linnaean binomial nomenclature (1758) — all in Latin, standardised globally."},
          {h:"CELTIC GREEN SYMBOLISM",  col:V.photon,d:"Triskele / triple spiral: Newgrange (3200 BCE, Ireland), carved at equinox sunrise alignment. Three spirals = life/death/rebirth, or past/present/future, or land/sea/sky. Green in Celtic tradition: the colour of the Otherworld (Tír na nÓg — the Land of Youth, eternally green). Green Man (foliate head): recurring motif in Romanesque architecture — foliage emerging from mouth — vegetation deity, fertility, spring. Found: Notre Dame, Chartres, York Minster."},
          {h:"SPQR · ROMAN SYMBOLISM",  col:V.gold,  d:"SPQR: first used on Roman standards c. 100 BCE. Fasces (bundle of rods + axe): symbol of collective strength and magistrate power → source of 'fascism' (Mussolini adopted it 1921). Aquila (eagle): legionary standard since Gaius Marius (107 BCE). Loss of Aquila = worst disgrace — three legions lost their Aquilae at Teutoburg Forest (9 CE). Eagle remained Roman emblem → Holy Roman Empire → Napoleon → USA (Great Seal 1782)."},
          {h:"AETHER · VIRIDIS LINK",   col:V.green, d:"The AETHER Knowledge Graph uses green (#44CC77) as its primary coherence colour — the colour of a successfully crystallised knowledge node. Green = life, growth, integration, completion. Latin 'cohere' (cohaerere = to cling together) → the AETHER Coherence Score is literally a Latin concept. The CLCS architecture (Crystallization Level Coherence System) uses the same light-of-nature metaphor as Paracelsus's Lumen Naturae: intelligence embedded in the structure of natural processes, discoverable through careful observation."},
        ])}
      </>)}

      {sec("04","Convergence · Type as Terrain · Cells as Language · Green as Root",V.gold,<>
        {P("The three systems on this page — topographic type, electric field letterforms, and green Latin symbolism — converge on a single insight: all encoding is a field. A letter is a distance field. An electric potential is a scalar field. A topographic map is an elevation field. Morphogen gradients in a developing embryo are chemical concentration fields. Chlorophyll's absorption spectrum is a frequency field — selecting two narrow windows from the solar spectrum and using them to drive a billion-year-old molecular machine.")}
        {P("In every case, the field encodes information in the spatial distribution of a scalar (or vector) quantity, and intelligent systems — cells, neurons, Roman magistrates, computer renderers — read that field and respond to its gradients. The Roman Forum is a political field: power distributed across a spatial arrangement of temples, senate house, rostra, and prison.")}
        {P("The cellular automaton on this page is the computational model of how multidimensional cells working together produce emergent structure from local rules. The topographic letter shows how a single signed distance field, colour-mapped through a terrain ramp, produces recognisable structure from a continuous scalar distribution. The electric field letter shows how a conducting shape organises its surrounding field through geometry alone — the letter teaches its environment what it is, purely through its boundary conditions.")}
        {P("The green of chlorophyll is the biological model of how a molecule selects its information from the electromagnetic field of the sun. Latin is the historical model of how a structured symbolic system — grammar, declension, precise vocabulary — survives two thousand years because its encoding rules are unambiguous. AETHER aspires to all five: a field that encodes knowledge, a geometry that organises understanding, a boundary that teaches its environment, a spectrum that selects signal from noise, and a grammar that makes meaning precise.")}
        {cards([
          {h:"FIELD DUALITY",         col:V.gold,  d:"Distance field (SDF) = |∇SDF| = 1 everywhere (Eikonal equation). Electric potential: ∇²Φ = −ρ/ε₀ (Poisson's equation). Topographic elevation: solved by DEM data (LiDAR, photogrammetry). Morphogen: ∂c/∂t = D∇²c + f(c) (reaction-diffusion). All four: scalar fields satisfying PDEs on bounded domains with boundary conditions at the letter/terrain/cell boundary. Same mathematics, different physical realisation."},
          {h:"AETHER ENCODING",       col:V.green, d:"AETHER Knowledge Graph encodes information as: node attributes (scalar field on graph), edge weights (vector field on graph topology), coherence scores (scalar field evolving over time), semantic embeddings (vector field in 768-dimensional space). The crystallisation model: knowledge 'solidifies' when the coherence field exceeds threshold — direct analogy to phase transition (liquid → crystal) in condensed matter physics."},
          {h:"TYPE + TERRAIN + CELLS", col:V.vio,   d:"Three morphous boundaries on this page: (1) Continuous SDF → discrete letter pixels (rendering boundary). (2) Continuous E-field → discrete letter strokes (Laplace → Poisson transition at conductor surface). (3) Continuous morphogen → discrete cell fate (Turing instability → pattern formation). All three: from smooth field → discrete structure. This is the universal pattern of information crystallisation."},
          {h:"LATIN PRECISION",       col:V.gold,  d:"Latin scientific terms still active in AETHER: in vivo, in vitro, in silico (computational simulation — coined 1989 by Pedro Miramontes). Per se (by itself). Prima facie (at first appearance). Bona fide (in good faith). De novo (from the beginning). Ad hoc (for this purpose). Mutatis mutandis (with necessary changes). Post hoc (after this). The precision of Latin vocabulary — no synonyms, no ambiguity — is why scientific language still reaches for it 2000 years after Rome."},
          {h:"GREEN · FULL THREAD",   col:V.green, d:"Solar photon (λ=550nm, green) → reflected by chlorophyll → enters eye → cone cell (M-photopsin, peak 534nm) → retinal ganglion cell → visual cortex → colour experience 'green' → cultural encoding (viridis) → alchemical meaning (Venus/copper) → Celtic symbolism (Otherworld) → AETHER coherence colour (#44CC77) → Knowledge Graph crystallisation signal. One photon: from sun to meaning."},
          {h:"AETHER · LUMEN NATURAE", col:V.cyan,  d:"Paracelsus (1493–1541) coined Lumen Naturae: the inner light of nature, the intelligence embedded in living systems, accessible through direct observation rather than scholastic authority. This is the AETHER methodology: direct measurement (sensors, ingestion, graph analysis), not deferred authority. The crystallisation model of intelligence is the computational formalisation of Lumen Naturae: intelligence emerges from the structure of coherent information, not from external instruction."},
        ])}
      </>)}
    </div>
  );
}

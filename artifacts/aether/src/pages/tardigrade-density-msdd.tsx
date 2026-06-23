import React, { useEffect, useRef } from "react";

const V = {
  bg:    "#04060E",
  gold:  "#C8A030",
  honey: "#D48A08",
  amb:   "#FF9933",
  blue:  "#4488FF",
  vio:   "#9966FF",
  green: "#44CC77",
  rose:  "#FF6699",
  plasma:"#FF4477",
  cyan:  "#22DDFF",
  rust:  "#C1440E",
  photon:"#00FFBB",
  shock: "#FFDD22",
  safe:  "#44CC77",
  dim:   "#2A3050",
  ink:   "#B8CCE8",
  mono:  "'Space Mono',monospace" as const,
  serif: "'Crimson Pro',serif"    as const,
  disp:  "'Cinzel',serif"         as const,
};
const lerp = (a:number,b:number,t:number)=>a+(b-a)*Math.max(0,Math.min(1,t));

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 1 · Tardigrade Morphology · Climbing Hooks · Soil Density Profile
   ───────────────────────────────────────────────────────────────────────── */
function TardigradeMorphologyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=430, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Soil types */
    const SOILS=[
      {name:"SANDY\nDESERT",cols:["#D4A870","#B8864A","#A06830","#885020"],
       pH:"6.5–7.5",cec:"2–5",org:"<1%",plants:"Cacti · Succulents",density:200,col:V.amb},
      {name:"LOAMY\nTEMPERATE",cols:["#3A2A18","#4A3220","#6A4A30","#8A6040"],
       pH:"6.0–7.0",cec:"15–25",org:"3–5%",plants:"Diverse · Trees",density:180000,col:V.green},
      {name:"CLAY\nWETLAND",cols:["#1A1A28","#2A2838","#3A3448","#4A4058"],
       pH:"4.5–6.5",cec:"25–50",org:"8–20%",plants:"Sedge · Willow",density:25000,col:V.blue},
      {name:"VOLCANIC\nPIONEER",cols:["#1A0A08","#2A1210","#3A2018","#5A3828"],
       pH:"5.0–8.0",cec:"5–12",org:"<0.5%",plants:"Pioneer Moss",density:50000,col:V.rust},
    ];

    const drawHook=(ctx:CanvasRenderingContext2D,x:number,y:number,r:number,col:string,flip=false)=>{
      const f=flip?-1:1;
      ctx.strokeStyle=col; ctx.lineWidth=1.2; ctx.lineCap="round";
      ctx.beginPath();
      ctx.moveTo(x,y);
      ctx.bezierCurveTo(x+f*r*0.8,y-r*0.2, x+f*r*1.2,y-r*0.8, x+f*r*0.9,y-r*1.3);
      ctx.stroke();
      ctx.fillStyle=col;
      ctx.beginPath(); ctx.arc(x+f*r*0.9,y-r*1.3,1.5,0,Math.PI*2); ctx.fill();
    };

    const drawTardigrade=(ctx:CanvasRenderingContext2D,cx:number,cy:number,scale:number,tun:boolean,t:number)=>{
      const S=scale*(tun?0.55:1.0);
      const seg=tun?4:5;
      /* body */
      ctx.fillStyle="#8A9860"; ctx.strokeStyle=V.green+"88"; ctx.lineWidth=1;
      if(tun){
        /* tun barrel shape */
        ctx.beginPath(); ctx.ellipse(cx,cy,S*22,S*16,0,0,Math.PI*2);
        ctx.fill(); ctx.stroke();
        /* desiccation lines */
        ctx.strokeStyle=V.dim+"88"; ctx.lineWidth=0.5;
        for(let k=-3;k<=3;k++){
          ctx.beginPath(); ctx.ellipse(cx,cy,S*(22-Math.abs(k)*3),S*(16-Math.abs(k)*2.5),0,0,Math.PI*2);
          ctx.stroke();
        }
      } else {
        /* active elongated form */
        ctx.beginPath();
        ctx.moveTo(cx-S*30,cy);
        ctx.bezierCurveTo(cx-S*32,cy-S*12, cx+S*32,cy-S*12, cx+S*30,cy);
        ctx.bezierCurveTo(cx+S*32,cy+S*12, cx-S*32,cy+S*12, cx-S*30,cy);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        /* segment lines */
        ctx.strokeStyle=V.dim+"55"; ctx.lineWidth=0.6;
        for(let sg=1;sg<seg;sg++){
          const sx=cx-S*30+sg*(S*60/seg);
          ctx.beginPath(); ctx.moveTo(sx,cy-S*10); ctx.lineTo(sx,cy+S*10); ctx.stroke();
        }
        /* head */
        ctx.fillStyle="#9AB870";
        ctx.beginPath(); ctx.ellipse(cx-S*30,cy,S*10,S*9,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
        /* pharynx / stylets */
        ctx.fillStyle=V.amb+"88";
        ctx.beginPath(); ctx.ellipse(cx-S*39,cy,S*4,S*3,0,0,Math.PI*2); ctx.fill();
        /* eye dots */
        ctx.fillStyle="#CC4422"; ctx.beginPath(); ctx.arc(cx-S*34,cy-S*4,S*1.5,0,Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(cx-S*34,cy-S*1,S*1.5,0,Math.PI*2); ctx.fill();
        /* 4 leg pairs */
        const legX=[-20,-8,6,20];
        const wobble=Math.sin(t*0.05);
        legX.forEach((lx,li)=>{
          const legWave=(li%2===0?1:-1)*wobble;
          /* leg pair: each leg has 3 claws */
          [-1,1].forEach(side=>{
            const lbx=cx+S*lx, lby=cy+S*11*side;
            ctx.strokeStyle="#6A7840"; ctx.lineWidth=1.5;
            ctx.beginPath(); ctx.moveTo(lbx,cy+S*9*side);
            ctx.lineTo(lbx+S*2*legWave,lby); ctx.stroke();
            /* 3 claws */
            for(let c=0;c<3;c++){
              const ca=(c-1)*0.3+legWave*0.2;
              drawHook(ctx,lbx+S*2*legWave,lby,6,(li<2?V.cyan:V.green),side<0);
            }
          });
        });
      }
      /* trehalose crystal overlay when tun */
      if(tun){
        const tp=(Math.sin(t*0.03)+1)/2;
        ctx.strokeStyle=V.cyan+Math.round(tp*140+60).toString(16).padStart(2,"0");
        ctx.lineWidth=0.6;
        for(let arm=0;arm<6;arm++){
          const aa=arm*Math.PI/3;
          ctx.beginPath(); ctx.moveTo(cx,cy);
          ctx.lineTo(cx+Math.cos(aa)*S*22,cy+Math.sin(aa)*S*22); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx+Math.cos(aa)*S*11,cy+Math.sin(aa)*S*11);
          ctx.lineTo(cx+Math.cos(aa+Math.PI/4)*S*7,cy+Math.sin(aa+Math.PI/4)*S*7); ctx.stroke();
        }
        ctx.fillStyle=V.cyan+"55"; ctx.font=`5px ${V.mono}`;
        ctx.fillText("TREHALOSE\nGLASS STATE",cx-22,cy+S*22);
      }
    };

    const draw=()=>{
      frame++;
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      /* ── LEFT: TARDIGRADE MORPHOLOGY ── */
      const MX=CW*0.3, MY=CH*0.35;
      /* active form */
      drawTardigrade(ctx,MX,MY,1.0,false,frame);
      ctx.fillStyle=V.green+"AA"; ctx.font=`bold 6px ${V.mono}`;
      ctx.fillText("ACTIVE STATE  ·  ~0.5mm",MX-40,MY-70);

      /* tun state (right of active) */
      const TX=CW*0.55, TY=MY;
      drawTardigrade(ctx,TX,TY,1.0,true,frame);
      ctx.fillStyle=V.cyan+"AA"; ctx.font=`bold 6px ${V.mono}`;
      ctx.fillText("CRYPTOBIOSIS\n(TUN STATE)",TX-22,TY-55);

      /* Arrow between states */
      ctx.strokeStyle=V.ink+"44"; ctx.lineWidth=1; ctx.setLineDash([4,6]);
      ctx.beginPath(); ctx.moveTo(MX+45,MY); ctx.lineTo(TX-35,TY); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle=V.dim+"88"; ctx.font=`4.5px ${V.mono}`;
      ctx.fillText("desiccation /\nradiation /\ndeep cold",MX+50,MY-10);

      /* ── HOOK ZOOM INSET ── */
      const HX=CW*0.08, HY=CH*0.72, HR=38;
      ctx.strokeStyle=V.honey+"44"; ctx.lineWidth=0.8; ctx.setLineDash([3,5]);
      ctx.beginPath(); ctx.arc(HX+HR,HY,HR,0,Math.PI*2); ctx.stroke();
      ctx.setLineDash([]);
      /* substrate lines */
      ctx.strokeStyle=V.dim+"66"; ctx.lineWidth=0.5;
      for(let k=0;k<6;k++) ctx.fillRect(HX+8,HY+30+k*2,HR*1.8,1);
      ctx.fillStyle=V.dim+"44"; ctx.font=`4.5px ${V.mono}`;
      ctx.fillText("substrate",HX+HR-16,HY+HR+8);
      /* detailed hook shapes (3 hooks) */
      for(let h=0;h<3;h++){
        const hx=HX+HR*0.3+h*20, hy=HY+20;
        ctx.strokeStyle=V.honey; ctx.lineWidth=1.5; ctx.lineCap="round";
        ctx.beginPath();
        ctx.moveTo(hx,hy);
        ctx.bezierCurveTo(hx+6,hy-4, hx+14,hy-12, hx+12,hy-22);
        ctx.stroke();
        ctx.fillStyle=V.honey;
        ctx.beginPath(); ctx.arc(hx+12,hy-22,2.5,0,Math.PI*2); ctx.fill();
        /* van der Waals contact dots */
        for(let v=0;v<5;v++){
          ctx.fillStyle=V.cyan+Math.round(100+v*25).toString(16).padStart(2,"0");
          ctx.beginPath(); ctx.arc(hx+8+v*1.5,hy+30+Math.random()*0,1,0,Math.PI*2); ctx.fill();
        }
      }
      /* hook labels */
      ctx.fillStyle=V.honey+"AA"; ctx.font=`bold 6px ${V.mono}`;
      ctx.fillText("MICRO-HOOK × 3-8/leg",HX-4,HY-HR-2);
      ctx.fillStyle=V.cyan+"77"; ctx.font=`4.5px ${V.mono}`;
      ctx.fillText("van der Waals\n+grip adhesion",HX+HR*1.1,HY+8);
      ctx.fillText("~0.5–2 μm",HX+HR*1.1,HY+28);

      /* ── SOIL DENSITY COLUMNS (right panel) ── */
      const SX=CW*0.65, SOW=(CW-SX-12)/SOILS.length-6;
      ctx.fillStyle=V.ink+"33"; ctx.font=`bold 6px ${V.mono}`;
      ctx.fillText("SOIL TYPE · TARDIGRADE DENSITY",SX,18);

      SOILS.forEach((soil,si)=>{
        const sx=SX+si*(SOW+6);
        const COL_H=CH*0.62;
        /* soil layers */
        soil.cols.forEach((col,li)=>{
          ctx.fillStyle=col;
          ctx.fillRect(sx,CH*0.06+li*(COL_H/4),SOW,COL_H/4);
        });
        /* tardigrade dots sprinkled in upper 3 layers */
        const logD=Math.log10(soil.density+1);
        for(let d=0;d<Math.min(30,Math.round(logD*6));d++){
          const dx=sx+4+Math.random()*(SOW-8);
          const dy=CH*0.06+4+Math.random()*(COL_H*0.7);
          ctx.fillStyle=soil.col+"BB";
          ctx.beginPath(); ctx.arc(dx,dy,1.5,0,Math.PI*2); ctx.fill();
        }
        /* name */
        soil.name.split("\n").forEach((line,li)=>{
          ctx.fillStyle=soil.col+"CC"; ctx.font=`5px ${V.mono}`;
          ctx.fillText(line,sx,CH*0.06+COL_H+10+li*9);
        });
        /* pH, organic, plants */
        ctx.fillStyle=V.dim+"AA"; ctx.font=`4px ${V.mono}`;
        ctx.fillText(`pH ${soil.pH}`,sx,CH*0.06+COL_H+30);
        ctx.fillText(`Org ${soil.org}`,sx,CH*0.06+COL_H+39);
        ctx.fillText(soil.plants.split("·")[0],sx,CH*0.06+COL_H+48);
        /* density bar */
        const maxLog=Math.log10(200000);
        const bh=(Math.log10(soil.density+1)/maxLog)*CH*0.14;
        const bg=ctx.createLinearGradient(sx,CH-10-bh,sx,CH-10);
        bg.addColorStop(0,soil.col+"AA"); bg.addColorStop(1,soil.col+"22");
        ctx.fillStyle=bg; ctx.fillRect(sx,CH-10-bh,SOW,bh);
        ctx.strokeStyle=soil.col+"44"; ctx.lineWidth=0.5;
        ctx.strokeRect(sx,CH-10-bh,SOW,bh);
        ctx.fillStyle=soil.col+"AA"; ctx.font=`4.5px ${V.mono}`;
        const d2=soil.density>=1000?`${(soil.density/1000).toFixed(0)}K`:`${soil.density}`;
        ctx.fillText(d2+"/L",sx,CH-12-bh);
      });
      ctx.fillStyle=V.ink+"22"; ctx.font=`6px ${V.mono}`;
      ctx.fillText("TARDIGRADE MORPHOLOGY · MICROSCOPIC CLIMBING HOOKS · SOIL DENSITY BY TYPE",8,CH-4);
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"430px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 2 · Planetary Density Profiles · Tardigrade Viability Overlay
   ───────────────────────────────────────────────────────────────────────── */
function PlanetaryDensityCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=440, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* density→color: dark red (iron/rock) → blue (gas) */
    const densityColor=(d:number)=>{
      if(d>10) return "#CC2200";
      if(d>7)  return "#E04010";
      if(d>5)  return "#C86020";
      if(d>3)  return "#887040";
      if(d>1.5)return "#4A8060";
      if(d>0.5)return "#2A6080";
      return "#1A4080";
    };

    /* Planets: {name, meanDens, radius (relative), layers:[{fraction,density,label}], surf:{T,P,rad}, tardiViability:[surface,subsurface], col} */
    const PLANETS=[
      {name:"Mercury",meanDens:5.43,r:10,col:"#AA8866",
       layers:[{f:0.42,d:11.5,l:"Fe-Ni\ncore"},{f:0.3,d:3.5,l:"silicate\nmantle"},{f:0.28,d:2.5,l:"crust"}],
       surf:{T:"−180→+430°C",P:"~0 (vacuum)",rad:"extreme solar"},viable:[0.02,0.12]},
      {name:"Venus",meanDens:5.24,r:16,col:"#D4A844",
       layers:[{f:0.45,d:10.5,l:"Fe-Ni\ncore"},{f:0.35,d:3.8,l:"silicate\nmantle"},{f:0.20,d:2.9,l:"crust"}],
       surf:{T:"+465°C",P:"9.2 MPa",rad:"low"},viable:[0.00,0.00]},
      {name:"Earth",meanDens:5.51,r:20,col:"#2244AA",
       layers:[{f:0.18,d:13,l:"inner\nFe core"},{f:0.30,d:10,l:"outer\nFe liquid"},{f:0.25,d:4.5,l:"mantle"},{f:0.27,d:2.9,l:"crust"}],
       surf:{T:"−90→+60°C",P:"0.1 MPa",rad:"moderate"},viable:[1.00,1.00]},
      {name:"Mars",meanDens:3.93,r:13,col:"#C14030",
       layers:[{f:0.35,d:6.5,l:"Fe/FeS\ncore"},{f:0.40,d:3.4,l:"silicate\nmantle"},{f:0.25,d:2.5,l:"basalt\ncrust"}],
       surf:{T:"−125→+20°C",P:"0.0006 MPa",rad:"high (no mag)"},viable:[0.05,0.38]},
      {name:"Jupiter",meanDens:1.33,r:26,col:"#C89050",
       layers:[{f:0.12,d:12,l:"rocky\ncore"},{f:0.25,d:4,l:"metallic\nH"},{f:0.63,d:0.7,l:"liquid\nH₂"}],
       surf:{T:"−110°C clouds",P:"0.1 MPa→∞",rad:"extreme"},viable:[0.00,0.01]},
      {name:"Saturn",meanDens:0.69,r:22,col:"#D4B860",
       layers:[{f:0.10,d:9,l:"rocky\ncore"},{f:0.20,d:1.8,l:"metallic\nH"},{f:0.70,d:0.3,l:"liquid\nH/He"}],
       surf:{T:"−139°C",P:"→∞",rad:"moderate"},viable:[0.00,0.00]},
      {name:"Uranus",meanDens:1.27,r:18,col:"#6AB0C0",
       layers:[{f:0.20,d:6,l:"rocky\ncore"},{f:0.50,d:1.5,l:"water/ice\nmantle"},{f:0.30,d:0.3,l:"H/He\natmos"}],
       surf:{T:"−224°C",P:"→∞",rad:"low"},viable:[0.00,0.00]},
      {name:"Neptune",meanDens:1.64,r:18,col:"#3060B0",
       layers:[{f:0.20,d:7,l:"rocky\ncore"},{f:0.50,d:1.8,l:"water/NH₃\nmantle"},{f:0.30,d:0.4,l:"H/He\natmos"}],
       surf:{T:"−214°C",P:"→∞",rad:"low"},viable:[0.00,0.00]},
      {name:"Moon",meanDens:3.34,r:9,col:"#A0A090",
       layers:[{f:0.20,d:7.5,l:"Fe\ncore"},{f:0.45,d:3.4,l:"silicate\nmantle"},{f:0.35,d:2.9,l:"anorthosite\ncrust"}],
       surf:{T:"−233→+123°C",P:"~0",rad:"extreme"},viable:[0.04,0.18]},
      {name:"Europa",meanDens:3.01,r:8,col:"#C0D0E0",
       layers:[{f:0.25,d:8,l:"Fe\ncore"},{f:0.45,d:3.5,l:"silicate\nmantle"},{f:0.30,d:1.2,l:"H₂O ice\n/ocean"}],
       surf:{T:"−160°C",P:"~0",rad:"intense Jupiter"},viable:[0.02,0.55]},
      {name:"Titan",meanDens:1.88,r:9,col:"#D0A050",
       layers:[{f:0.30,d:4,l:"rock/ice\ncore"},{f:0.40,d:1.6,l:"H₂O ice\nmantle"},{f:0.30,d:0.6,l:"N₂/CH₄\nsurface"}],
       surf:{T:"−179°C",P:"0.15 MPa",rad:"low"},viable:[0.01,0.20]},
      {name:"Enceladus",meanDens:1.61,r:6,col:"#E0F0FF",
       layers:[{f:0.35,d:3,l:"silicate\ncore"},{f:0.35,d:1.2,l:"water\nocean"},{f:0.30,d:0.9,l:"ice\ncrust"}],
       surf:{T:"−200°C",P:"~0",rad:"moderate"},viable:[0.02,0.62]},
    ];

    const COLS=4, ROWS=3;
    const CELL_W=CW/COLS, CELL_H=(CH*0.78)/ROWS;

    const draw=()=>{
      frame++;
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);
      ctx.fillStyle=V.ink+"33"; ctx.font=`bold 7px ${V.mono}`;
      ctx.fillText("PLANETARY INTERIOR DENSITY PROFILES  ·  TARDIGRADE VIABILITY OVERLAY",8,14);

      PLANETS.forEach((pl,pi)=>{
        const col=Math.floor(pi/ROWS), row=pi%ROWS;
        const cx=col*CELL_W+CELL_W*0.38, cy=row*CELL_H+CELL_H*0.45+24;
        const R=pl.r;

        /* interior layers (concentric circles, outermost first) */
        [...pl.layers].reverse().forEach((lay,li)=>{
          const ri=R*(pl.layers.slice(pl.layers.length-1-li).reduce((s,l)=>s+l.f,0));
          const lg=ctx.createRadialGradient(cx,cy,0,cx,cy,ri);
          const dc=densityColor(lay.d);
          lg.addColorStop(0,dc+"FF"); lg.addColorStop(0.7,dc+"CC"); lg.addColorStop(1,dc+"66");
          ctx.fillStyle=lg; ctx.beginPath(); ctx.arc(cx,cy,ri,0,Math.PI*2); ctx.fill();
        });
        /* atmosphere haze */
        const atmoG=ctx.createRadialGradient(cx,cy,R,cx,cy,R*1.25);
        atmoG.addColorStop(0,pl.col+"44"); atmoG.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=atmoG; ctx.beginPath(); ctx.arc(cx,cy,R*1.25,0,Math.PI*2); ctx.fill();
        /* outline */
        ctx.strokeStyle=pl.col+"88"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.stroke();

        /* tardigrade viability ring */
        const pulse=(Math.sin(frame*0.05+pi*0.8)+1)*0.5;
        const vSurf=pl.viable[0], vSub=pl.viable[1];
        if(vSub>0.05){
          const vc=vSub>0.5?V.green:vSub>0.2?V.amb:V.plasma;
          ctx.strokeStyle=vc+Math.round((0.4+pulse*0.3)*255).toString(16).padStart(2,"0");
          ctx.lineWidth=2;
          ctx.beginPath(); ctx.arc(cx,cy,R+6,0,Math.PI*2*vSub); ctx.stroke();
        }
        if(vSurf>0.05){
          ctx.strokeStyle=V.photon+"88"; ctx.lineWidth=1;
          ctx.beginPath(); ctx.arc(cx,cy,R+10,0,Math.PI*2*vSurf); ctx.stroke();
        }

        /* name + density */
        ctx.fillStyle=pl.col+"CC"; ctx.font=`bold 5.5px ${V.mono}`;
        ctx.fillText(pl.name,cx-R*0.8,cy+R+16);
        ctx.fillStyle=V.dim+"AA"; ctx.font=`4px ${V.mono}`;
        ctx.fillText(`ρ=${pl.meanDens}g/cm³`,cx-R*0.8,cy+R+25);
        ctx.fillText(`T:${pl.surf.T.substring(0,12)}`,cx-R*0.8,cy+R+34);
        /* viability numbers */
        ctx.fillStyle=pl.viable[0]>0.1?V.green+"AA":V.plasma+"88";
        ctx.fillText(`surf:${(pl.viable[0]*100).toFixed(0)}%`,cx-R*0.8,cy+R+43);
        ctx.fillStyle=pl.viable[1]>0.2?V.green+"AA":pl.viable[1]>0.05?V.amb+"AA":V.plasma+"88";
        ctx.fillText(`sub:${(pl.viable[1]*100).toFixed(0)}%`,cx-R*0.8,cy+R+52);
      });

      /* ── DENSITY LEGEND ── */
      const LX=CW*0.01, LY=CH*0.83;
      ctx.fillStyle=V.ink+"44"; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("INTERIOR DENSITY",LX,LY);
      const dents=[[13,"#CC2200","Fe inner core"],[10,"#E04010","Fe liquid"],[7,"#C86020","Fe-Ni alloy"],[4,"#887040","Silicate"],[1.5,"#4A8060","H₂O ice"],[0.5,"#2A6080","Liquid H"],[0.1,"#1A4080","Gas/atmos"]];
      dents.forEach(([d,col,label],i)=>{
        ctx.fillStyle=col as string; ctx.fillRect(LX,LY+8+i*13,10,10);
        ctx.fillStyle=V.dim+"AA"; ctx.font=`4px ${V.mono}`;
        ctx.fillText(`${d} g/cm³  ${label}`,LX+14,LY+16+i*13);
      });

      /* VIABILITY legend */
      const VX=CW*0.22, VY=LY;
      ctx.fillStyle=V.ink+"44"; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("TARDIGRADE VIABILITY",VX,VY);
      [[V.green,"  >50% subsurface viable"],[V.amb,"  20–50% (tun state marginal)"],[V.plasma,"  <5% (too extreme)"],[V.photon,"  surface arc = surface viability"]].forEach(([col,label],i)=>{
        ctx.strokeStyle=col as string; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(VX+6,VY+12+i*13,4,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle=V.dim+"AA"; ctx.font=`4px ${V.mono}`;
        ctx.fillText(label as string,VX+14,VY+16+i*13);
      });

      ctx.fillStyle=V.ink+"22"; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("12 BODIES  ·  INTERIOR DENSITY  ·  VIABILITY = surface + subsurface tardigrade persistence",8,CH-4);
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"440px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 3 · MSDD · Mutual Shared Destructional Decoherence
             · Automated Looped Command & Control Shock Response
   ───────────────────────────────────────────────────────────────────────── */
function MSDDControlCanvas() {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=440, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    const CX=CW*0.40, CY=CH*0.48;
    const NET_R=110;

    /* 6 biological subsystem nodes */
    const NODES=[
      {label:"FMO\nCOMPLEX",     unit:"quanta/s",  col:V.photon,icon:"⬡",  alpha:0.65, prot:0.80},
      {label:"TARDIGRADE\nCASH-D",unit:"gel visc",  col:V.cyan,  icon:"🐻",  alpha:0.90, prot:0.98},
      {label:"TREHALOSE\nMATRIX", unit:"Tg (°C)",   col:V.amb,   icon:"C₁₂",alpha:0.75, prot:0.92},
      {label:"SOIL\nMICROBIOME", unit:"CFU/g",      col:V.green, icon:"⚬",  alpha:0.70, prot:0.70},
      {label:"PLANT\nCYTOSKEL.", unit:"tubulin",    col:V.blue,  icon:"🌿", alpha:0.60, prot:0.65},
      {label:"DNA REPAIR\nTUNNEL",unit:"events/s",  col:V.vio,   icon:"⌀",  alpha:0.80, prot:0.88},
    ];
    const nodePos=NODES.map((_,i)=>{
      const a=i/NODES.length*Math.PI*2-Math.PI/2;
      return {x:CX+NET_R*Math.cos(a), y:CY+NET_R*Math.sin(a)};
    });

    /* 4 ALCC control nodes (outer ring) */
    const CTRL=[
      {label:"SENSE",  col:V.shock, desc:"coherence\nmonitor"},
      {label:"PROCESS",col:V.gold,  desc:"MSDD\ndetection"},
      {label:"COMMAND",col:V.amb,   desc:"CAHS-D\ntrigger"},
      {label:"ACT",    col:V.safe,  desc:"protection\nsignal"},
    ];
    const ctrlPos=CTRL.map((_,i)=>{
      const a=i/CTRL.length*Math.PI*2-Math.PI/4;
      return {x:CX+NET_R*2.0*Math.cos(a), y:CY+NET_R*2.0*Math.sin(a)};
    });

    /* State machine: NORMAL → SHOCK → MSDD → ALCC → RECOVERY → repeat */
    const PHASE_LEN=[200,60,120,80,180]; // frames per phase
    const TOTAL=PHASE_LEN.reduce((a,b)=>a+b,0);

    /* coherence states */
    let psi=new Float32Array(NODES.length).fill(1);
    let prot=new Float32Array(NODES.length).fill(0);

    const getPhase=(f:number)=>{
      const t=f%TOTAL;
      let acc=0;
      for(let i=0;i<PHASE_LEN.length;i++){
        acc+=PHASE_LEN[i];
        if(t<acc) return {phase:i, pt:(t-(acc-PHASE_LEN[i]))/PHASE_LEN[i]};
      }
      return {phase:0,pt:0};
    };

    const draw=()=>{
      frame++;
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,CW,CH);

      const {phase,pt}=getPhase(frame);
      const phaseNames=["NORMAL · QUANTUM COHERENCE","⚠ SHOCK EVENT · IMPACT/RADIATION","⚡ MSDD · MUTUAL DECOHERENCE CASCADE","◉ ALCC · AUTOMATED LOOP ACTIVATING","✓ RECOVERY · ADAPTED EQUILIBRIUM"];
      const phaseColors=[V.green,V.plasma,V.danger,V.cyan,V.photon];

      /* update psi and prot per phase */
      if(phase===0){
        for(let i=0;i<psi.length;i++){ psi[i]=lerp(psi[i],1.0,0.05); prot[i]=lerp(prot[i],0,0.05); }
      } else if(phase===1){
        /* shock onset */
        for(let i=0;i<psi.length;i++) psi[i]=lerp(psi[i],0.85,0.12);
      } else if(phase===2){
        /* MSDD cascade — mutual coupling amplifies collapse */
        const meanPsi=psi.reduce((a,b)=>a+b,0)/psi.length;
        for(let i=0;i<psi.length;i++){
          const decay=0.04+0.06*(1-psi[i])*(1-meanPsi)*3;
          psi[i]=Math.max(0.04,psi[i]-decay);
        }
      } else if(phase===3){
        /* ALCC: prot signals activate, tardigrade node (idx 1) leads */
        for(let i=0;i<NODES.length;i++){
          prot[i]=Math.min(1,prot[i]+NODES[i].prot*0.04*(1-psi[i]));
          psi[i]=Math.min(1,psi[i]+prot[i]*NODES[i].prot*0.06);
        }
      } else {
        /* recovery */
        for(let i=0;i<psi.length;i++){ psi[i]=lerp(psi[i],NODES[i].alpha,0.03); prot[i]=lerp(prot[i],0,0.02); }
      }

      /* ── BACKGROUND GLOW based on phase ── */
      const phGlow=ctx.createRadialGradient(CX,CY,0,CX,CY,NET_R*2.2);
      phGlow.addColorStop(0,phaseColors[phase]+"08"); phGlow.addColorStop(1,"rgba(0,0,0,0)");
      ctx.fillStyle=phGlow; ctx.fillRect(0,0,CW,CH);

      /* ── ALCC CONTROL RING (outer) ── */
      /* control ring circle */
      ctx.strokeStyle=V.dim+"33"; ctx.lineWidth=1; ctx.setLineDash([8,12]);
      ctx.beginPath(); ctx.arc(CX,CY,NET_R*2.0,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);

      /* ALCC control loop arrows */
      if(phase>=3){
        ctrlPos.forEach((cp,ci)=>{
          const cn=(ci+1)%ctrlPos.length;
          const nx=ctrlPos[cn];
          const loopT=(frame*0.04+ci*0.25)%1;
          const arx=lerp(cp.x,nx.x,loopT), ary=lerp(cp.y,ny.y,loopT);
          ctx.fillStyle=CTRL[ci].col+"AA";
          ctx.beginPath(); ctx.arc(arx,ary,4,0,Math.PI*2); ctx.fill();
          ctx.strokeStyle=CTRL[ci].col+"44"; ctx.lineWidth=1;
          ctx.beginPath(); ctx.moveTo(cp.x,cp.y); ctx.lineTo(nx.x,ny.y); ctx.stroke();
        });
        /* signals from ALCC to inner nodes */
        nodePos.forEach((np,ni)=>{
          if(prot[ni]>0.1){
            const signalT=(frame*0.06+ni*0.15)%1;
            const sx=lerp(ctrlPos[2].x,np.x,signalT), sy=lerp(ctrlPos[2].y,np.y,signalT);
            ctx.fillStyle=V.cyan+Math.round(prot[ni]*180).toString(16).padStart(2,"0");
            ctx.beginPath(); ctx.arc(sx,sy,3,0,Math.PI*2); ctx.fill();
          }
        });
      }

      /* control nodes */
      ctrlPos.forEach((cp,ci)=>{
        const active=phase>=3;
        ctx.fillStyle=active?CTRL[ci].col+"33":V.dim+"22";
        ctx.beginPath(); ctx.arc(cp.x,cp.y,18,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=active?CTRL[ci].col+"88":V.dim+"44"; ctx.lineWidth=1;
        ctx.beginPath(); ctx.arc(cp.x,cp.y,18,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle=(active?CTRL[ci].col:V.dim)+"AA"; ctx.font=`5.5px ${V.mono}`;
        ctx.fillText(CTRL[ci].label,cp.x-ctx.measureText(CTRL[ci].label).width/2,cp.y+2);
        ctx.fillStyle=V.dim+"66"; ctx.font=`4px ${V.mono}`;
        CTRL[ci].desc.split("\n").forEach((line,li)=>ctx.fillText(line,cp.x-ctx.measureText(line).width/2,cp.y+12+li*8));
      });

      /* ── INNER NETWORK CONNECTIONS ── */
      for(let a=0;a<NODES.length;a++){
        for(let b=a+1;b<NODES.length;b++){
          const health=Math.min(psi[a],psi[b]);
          const col=health>0.7?V.photon:health>0.3?V.amb:V.plasma;
          /* flowing quantum particle */
          const qt=(frame*0.03+a*0.5+b*0.3)%1;
          const qx=lerp(nodePos[a].x,nodePos[b].x,qt), qy=lerp(nodePos[a].y,nodePos[b].y,qt);
          ctx.strokeStyle=col+Math.round(health*80).toString(16).padStart(2,"0");
          ctx.lineWidth=0.6;
          ctx.beginPath(); ctx.moveTo(nodePos[a].x,nodePos[a].y); ctx.lineTo(nodePos[b].x,nodePos[b].y); ctx.stroke();
          if(health>0.2){
            ctx.fillStyle=col+Math.round(health*180).toString(16).padStart(2,"0");
            ctx.beginPath(); ctx.arc(qx,qy,2,0,Math.PI*2); ctx.fill();
          }
        }
      }

      /* ── INNER NODES ── */
      nodePos.forEach((np,ni)=>{
        const p=psi[ni], pr=prot[ni];
        const col=p>0.7?NODES[ni].col:p>0.3?V.amb:V.plasma;
        const R=20+p*8;
        /* prot glow */
        if(pr>0.05){
          const pg=ctx.createRadialGradient(np.x,np.y,0,np.x,np.y,R+20);
          pg.addColorStop(0,V.cyan+Math.round(pr*80).toString(16).padStart(2,"0")); pg.addColorStop(1,"rgba(0,0,0,0)");
          ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(np.x,np.y,R+20,0,Math.PI*2); ctx.fill();
        }
        /* node */
        const ng=ctx.createRadialGradient(np.x,np.y,0,np.x,np.y,R);
        ng.addColorStop(0,col+"99"); ng.addColorStop(1,col+"22");
        ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(np.x,np.y,R,0,Math.PI*2); ctx.fill();
        /* coherence arc */
        ctx.strokeStyle=col+"CC"; ctx.lineWidth=2.5;
        ctx.beginPath(); ctx.arc(np.x,np.y,R+3,-Math.PI/2,-Math.PI/2+p*Math.PI*2); ctx.stroke();
        ctx.strokeStyle=col+"44"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.arc(np.x,np.y,R+3,0,Math.PI*2); ctx.stroke();
        /* icon + label */
        ctx.fillStyle=V.ink; ctx.font=`10px ${V.mono}`;
        ctx.fillText(NODES[ni].icon,np.x-5,np.y+4);
        NODES[ni].label.split("\n").forEach((line,li)=>{
          ctx.fillStyle=col+"AA"; ctx.font=`4.5px ${V.mono}`;
          ctx.fillText(line,np.x-ctx.measureText(line).width/2,np.y+R+10+li*9);
        });
        /* coherence % */
        ctx.fillStyle=col+"CC"; ctx.font=`5px ${V.mono}`;
        ctx.fillText(`${(p*100).toFixed(0)}%`,np.x-6,np.y-R-3);
      });

      /* ── RIGHT PANEL: LOOP DIAGRAM ── */
      const PX=CW*0.76, PY=30, PW=CW*0.22;
      ctx.fillStyle=V.ink+"22"; ctx.fillRect(PX,0,PW,CH);
      ctx.strokeStyle=V.dim+"33"; ctx.lineWidth=0.6; ctx.beginPath(); ctx.moveTo(PX,0); ctx.lineTo(PX,CH); ctx.stroke();

      ctx.fillStyle=V.ink+"44"; ctx.font=`bold 6px ${V.mono}`;
      ctx.fillText("ALCC LOOP",PX+8,PY);
      ctx.fillStyle=V.dim+"88"; ctx.font=`4.5px ${V.mono}`;
      ctx.fillText("Automated Looped",PX+8,PY+10);
      ctx.fillText("Command & Control",PX+8,PY+19);

      const steps=[
        {n:"1. SENSE",    d:"Coherence\nsignature\nmonitor",col:V.shock},
        {n:"2. DETECT",   d:"MSDD onset\nthreshold\n|ψ|<0.6",col:V.plasma},
        {n:"3. COMMAND",  d:"CAHS-D\nprotein\ntrigger",col:V.amb},
        {n:"4. ACT",      d:"Gel-state\nlock\nresonance",col:V.cyan},
        {n:"5. MEASURE",  d:"Re-cohere\ntrack\nΔψ/Δt",col:V.photon},
        {n:"↺ LOOP",      d:"Continuous\nadaptive\nadjust",col:V.safe},
      ];
      steps.forEach((st,si)=>{
        const sy=PY+38+si*62;
        const active=phase===3||(phase===4&&si>3);
        ctx.fillStyle=active?st.col+"22":V.dim+"11";
        ctx.fillRect(PX+8,sy,PW-16,50);
        ctx.strokeStyle=active?st.col+"88":V.dim+"33"; ctx.lineWidth=0.8;
        ctx.strokeRect(PX+8,sy,PW-16,50);
        ctx.fillStyle=active?st.col+"CC":V.dim+"55"; ctx.font=`bold 5.5px ${V.mono}`;
        ctx.fillText(st.n,PX+12,sy+12);
        st.d.split("\n").forEach((line,li)=>{
          ctx.fillStyle=active?V.ink+"AA":V.dim+"55"; ctx.font=`4.5px ${V.mono}`;
          ctx.fillText(line,PX+12,sy+22+li*8);
        });
        /* connector arrow */
        if(si<steps.length-1){
          ctx.strokeStyle=st.col+"33"; ctx.lineWidth=0.8;
          ctx.beginPath(); ctx.moveTo(PX+PW/2,sy+50); ctx.lineTo(PX+PW/2,sy+55); ctx.stroke();
        }
      });

      /* ── PHASE INDICATOR ── */
      ctx.fillStyle=phaseColors[phase]+"AA"; ctx.font=`bold 6px ${V.mono}`;
      ctx.fillText(phaseNames[phase],CW*0.5-ctx.measureText(phaseNames[phase]).width/2,CH-22);
      /* phase progress */
      ctx.fillStyle=V.dim+"33"; ctx.fillRect(CW*0.1,CH-14,CW*0.6,6);
      ctx.fillStyle=phaseColors[phase]+"88"; ctx.fillRect(CW*0.1,CH-14,CW*0.6*pt,6);

      ctx.fillStyle=V.ink+"22"; ctx.font=`5.5px ${V.mono}`;
      ctx.fillText("MSDD · MUTUAL SHARED DESTRUCTIONAL DECOHERENCE · ALCC TARDIGRADE-INSPIRED CONTROL LOOP",8,CH-4);
      raf=requestAnimationFrame(draw);
    };
    raf=requestAnimationFrame(draw);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"440px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   PAGE
   ───────────────────────────────────────────────────────────────────────── */
export default function TardigradeDensityMSDDPage() {
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
  const cards=(items:{h:string;col:string;d:string}[],cols="repeat(auto-fit,minmax(200px,1fr))")=>(
    <div style={{display:"grid",gridTemplateColumns:cols,gap:10,marginTop:12}}>
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
        {[badge("LIVE SIMULATION"),badge("TARDIGRADES",V.green),badge("MICROSCOPIC HOOKS",V.honey),badge("CRYPTOBIOSIS",V.cyan),badge("SOIL CHEMISTRY",V.amb),badge("PLANETARY DENSITY",V.blue),badge("MSDD",V.plasma),badge("ALCC CONTROL LOOP",V.photon)]}
        <h1 style={{fontFamily:V.disp,fontSize:"clamp(1.4rem,4vw,2.6rem)",color:V.ink,
          margin:"22px 0 8px",letterSpacing:"0.06em",fontWeight:400,lineHeight:1.2}}>
          TARDIGRADES · PLANETARY DENSITY DYNAMICS · MSDD CONTROL LOOP
        </h1>
        <p style={{fontFamily:V.mono,fontSize:"0.58rem",color:V.dim,letterSpacing:3,margin:"0 0 22px"}}>
          MICROSCOPIC HOOKS · SOIL CHEMISTRY · ALL PLANETS · MUTUAL SHARED DESTRUCTIONAL DECOHERENCE · ALCC
        </p>
        {P("Tardigrades (Phylum Tardigrada, 'slow walkers') are eight-legged microscopic animals 0.1–1.5mm in length, first described by Johann August Ephraim Goeze in 1773. They inhabit every biome on Earth — from Himalayan glaciers at 6,000m to deep ocean trenches at 4,000m depth, from Antarctic ice sheets to equatorial desert sand grains — with population densities reaching 300,000 individuals per litre of damp soil or 50,000 per gram of dry moss. Their defining capability is cryptobiosis: when exposed to desiccation, freezing, radiation, or high pressure, they retract their legs, expel ~97% of their body water, and enter the 'tun' state — a dormant barrel-shape where all metabolic processes cease. In this state they have survived direct space exposure (Foton-M3 BIOPAN-6, see adjacent page), temperatures approaching absolute zero (−272.8°C), pressures up to 600 MPa (6,000 atmospheres), and radiation doses of 570,000 rads (1,000× the human lethal dose). No other animal has demonstrated this breadth of environmental tolerance.")}
        {P("The tardigrade is the natural anchor for the AETHER concept of Mutual Shared Destructional Decoherence (MSDD). When a large-scale shock event — asteroid impact, radiation burst, volcanic winter — hits a biological ecosystem, every quantum-coherent subsystem (FMO photosynthesis complex, DNA repair tunneling, cytoskeletal quantum vibration, soil microbiome quorum sensing) decoheres simultaneously. This is not independent failure — it is correlated, mutual collapse. The tardigrade's CAHS-D (Cytoplasmic Abundant Heat Soluble) proteins provide what no other organism can: a self-contained automated response that vitrifies the intracellular environment into a glass matrix, physically blocking decoherence by eliminating molecular motion. This is a biological Automated Looped Command and Control (ALCC) system — the tardigrade detects the shock, commands the CAHS proteins, acts by forming the glass, measures the outcome, and loops until the shock passes. Every other organism in the ecosystem can learn to borrow this architecture.")}
      </div>

      {sec("01","Tardigrade Morphology · Microscopic Climbing Hooks · Soil Density Dynamics",V.green,<>
        {P("The tardigrade's 8 stubby legs each terminate in 4–8 specialised hooks (claws) whose geometry varies by species and habitat: freshwater species tend toward simple double claws; moss-dwelling species develop complex multi-pronged hooks with adhesive pads. The hooks operate via two mechanisms simultaneously: mechanical interlocking with surface microstructure (moss cell walls, mineral grain boundaries, plant cuticle features at the 1–10 μm scale) and Van der Waals adhesion through dense arrays of nanoscale contact points analogous to gecko setae. This dual mechanism allows the same hook geometry to grip both wet and dry substrates — critical for organisms that transition between moss, soil, and water-film environments. Each hook is composed of a secreted protein scaffold hardened with quinone tanning (sclerotization) — the same chemistry used in insect cuticle — giving a Young's modulus of ~5 GPa: stiff enough to grip but flexible enough to conform to irregular surfaces without breaking.")}
        {P("Soil chemistry controls tardigrade density through four coupled variables: water activity (tardigrades need liquid water films for active locomotion — soil matric potential must exceed −1.5 MPa), organic carbon content (higher organic = more microbial food = higher tardigrade density), oxygen availability (most tardigrades are aerobic, though many species tolerate brief anoxia), and pH (optimal range 4.5–7.5; outside this, membrane transport fails). The result is a density gradient that spans 6 orders of magnitude across soil types: barren volcanic ash hosts pioneer moss communities supporting ~500 tardigrades per litre, while mature loamy temperate soils support up to 300,000 per litre. These density gradients directly couple to plant community structure: tardigrades consume bacteria, algae, and fungi in the rhizosphere, influencing nutrient cycling rates and ultimately which plant species can establish and how dense their root systems grow.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <TardigradeMorphologyCanvas/>
        </div>
        {cards([
          {h:"CRYPTOBIOSIS MODES",  col:V.cyan,  d:"Anhydrobiosis (water loss): tun + trehalose. Cryobiosis (freezing): ice exclusion + CAHS gel. Osmobiosis (high salt): same as anhydrobiosis. Anoxybiosis (no O₂): ATP shutdown, reversible. Cheobiosis (chemicals): most difficult, partial. Each mode uses same CAHS-D vitrification endpoint."},
          {h:"CAHS-D PROTEIN",      col:V.photon,d:"Cytoplasmic Abundant Heat Soluble protein D. Intrinsically disordered (IDP) — no fixed 3D structure in water. On desiccation: phase-transitions into rigid cross-linked gel ('bioglass'). Tg (glass transition) ~60°C above ambient — effectively locks all molecular motion. Synthetic CAHS-D is now being used to dry-preserve vaccines without refrigeration."},
          {h:"CLIMBING HOOK µ-MECH",col:V.honey, d:"Hook geometry: 0.5–2 μm tip radius. Contact angle with moss cell wall: 15–45°. Normal adhesion: ~0.1–1 μN per hook. 24 hooks × 40 μN each = 960 μN total = 100× body weight. Wet adhesion enhanced by water meniscus capillary force at hook-substrate junction (Laplace pressure ~100 Pa)."},
          {h:"SOIL DENSITY GRADIENT",col:V.green,d:"Sandy desert: 200/L. Volcanic pioneer: 50,000/L (moss surface). Clay wetland: 25,000/L (anoxia limits). Loamy temperate: 180,000/L. Peak recorded: 300,000/L in Sphagnum peat moss (constant moisture + high organic). Urban soil: <1,000/L (chemical pollution limits)."},
          {h:"RHIZOSPHERE ROLE",    col:V.amb,   d:"Tardigrades graze bacterial biofilms on root surfaces, releasing nutrients locked in biomass (N, P, K). Grazing pressure prevents single-species bacterial dominance — maintains microbial diversity → diverse enzyme activity → more plant-available nutrient forms → determines which plant species can establish."},
          {h:"PLANETARY ANALOGUE",  col:V.blue,  d:"Mars OCUM soil (see Foton-M3 page): pH 3.5–4, perchlorate ~1.2%. Tardigrades: pH floor ~4.0, perchlorate tolerance <0.5%. Conclusion: active tardigrades unlikely at Mars surface. In tun state: radiation and desiccation fine, but re-activation requires liquid water — only viable 38–65cm depth (brine pockets). Enceladus subsurface ocean: viable."},
        ])}
      </>)}

      {sec("02","Full Density Dynamics · All Planets · Interior Structure · Tardigrade Viability Map",V.blue,<>
        {P("Planetary density is the master variable that determines interior structure, volcanic activity, magnetic field generation, surface pressure, and atmospheric retention — all of which cascade to determine whether a tardigrade (or any life) can persist. The pattern across the solar system reveals two regimes: rocky bodies (Mercury, Venus, Earth, Mars, Moon) have Fe-Ni cores, silicate mantles, and thin crusts, giving mean densities of 3.3–5.5 g/cm³. Gas/ice giants (Jupiter, Saturn, Uranus, Neptune) have rocky or metallic-hydrogen cores surrounded by fluid envelopes, with mean densities of 0.69–1.64 g/cm³. Saturn is famously less dense than water (0.69 g/cm³) — it would float in a sufficiently large ocean. The subsurface oceans of Europa and Enceladus represent the most promising tardigrade-viable environments beyond Earth: liquid water confirmed (Europa by magnetic induction, Enceladus by direct sampling of plumes), moderate pressure (0.1–100 MPa at ocean depth), and likely hydrothermal chemistry providing energy.")}
        {P("The tardigrade viability overlay quantifies two probability values per body: surface viability (can a tardigrade in either active or tun state persist at the surface?) and subsurface viability (can a tardigrade persist in protected subsurface environments, in tun state if needed?). Earth scores 100% on both. Europa scores 2% surface (radiation from Jupiter's magnetosphere is lethal within days) but 55% subsurface — the highest non-Earth subsurface score, because its ocean has liquid water, moderate pH (estimated 7–8), and no perchlorate. Enceladus scores 62% subsurface because its hydrothermal plumes (directly sampled by Cassini) show H₂, CO₂, and organics — the chemical inputs for chemolithotrophic metabolism. The Moon scores only 18% subsurface because while radiation and temperature are manageable deep in lava tubes, liquid water is absent or confined to trace ice deposits. Venus scores 0% at all levels — 465°C exceeds the thermal death point of all known biology, including the tardigrade tun state.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <PlanetaryDensityCanvas/>
        </div>
        {cards([
          {h:"EARTH  ρ=5.51 g/cm³",col:V.safe,  d:"Inner Fe solid core (ρ=13): dynamo stabiliser. Outer liquid Fe (ρ=10): generates magnetic field (shields surface from cosmic radiation). Silicate mantle (ρ=3.3–5.5): plate tectonics recycles C, P, N. Crust (ρ=2.7): biosphere substrate. Magnetic field: critical for tardigrade-scale ecosystems — without it, UV/cosmic rays sterilise surface."},
          {h:"EUROPA  ρ=3.01 g/cm³",col:V.cyan,  d:"Fe-Ni core (ρ=8). Silicate mantle (ρ=3.5). H₂O ice crust + subsurface ocean (ρ=1.2, depth ~100km). Ocean: ~3× total Earth ocean volume. Temperature: ~0°C at ice-ocean interface. Salt content: MgSO₄, NaCl. Tidal heating from Jupiter's gravity drives hydrothermal circulation. BEST non-Earth subsurface candidate."},
          {h:"ENCELADUS  ρ=1.61 g/cm³",col:V.photon,d:"Silicate rock core (ρ=3). Water ocean (ρ=1.2). Ice crust (ρ=0.9). Cassini sampled plumes: H₂ (chemoautotrophic energy), CO₂, CH₄, complex organics, silica nanoparticles (hydrothermal origin), NaCl, K. All ingredients for methanogenesis. Highest astrobiology priority. 62% tardigrade viability estimate."},
          {h:"MARS  ρ=3.93 g/cm³",col:V.rust,  d:"Fe/FeS partially molten core (ρ=6.5). Silicate mantle (ρ=3.4). Basalt crust (ρ=2.5, thicker than Earth). No global magnetic field (dynamo died ~4 Ga) → cosmic ray penetration to surface. Surface: sterilising UV + perchlorate. Subsurface 38–65cm: ~38% tardigrade viable (brine + shielded). See Foton-M3/OCUM page."},
          {h:"JUPITER  ρ=1.33 g/cm³",col:V.amb,  d:"Rocky core ρ~12 (uncertain). Metallic hydrogen (ρ=4, conducts electricity, creates magnetic field 14× Earth's). Liquid molecular H (ρ=0.7). H₂ gas envelope. Magnetic field traps radiation belts — Europe's radiation environment derives from Jupiter. Cloud deck at 1 atm: −110°C. Too cold/no liquid water. Viability ≈0%."},
          {h:"SATURN  ρ=0.69 g/cm³",col:V.honey,d:"Least dense planet — less than water. Rocky core (ρ=9). Metallic H (ρ=1.8). Liquid H/He (ρ=0.3). Hexagonal polar vortex (standing wave in atmosphere). Titan (moon): N₂ atmosphere 1.5× Earth pressure, liquid methane lakes — not H₂O. Enceladus (moon): 62% viable. Saturn itself: 0%."},
          {h:"DENSITY & MAGNETIC FIELD",col:V.vio, d:"Planetary density determines core size → core determines whether dynamo possible → magnetic field determines radiation environment → radiation determines surface sterilisation risk for tardigrades. Earth: 25–65 μT field. Mars: <0.5 μT (dead core). Mercury: 400 nT (weak — 4% of Earth's despite iron-rich interior, partially solid core). Moon: none (geologically dead)."},
        ])}
      </>)}

      {sec("03","MSDD · Mutual Shared Destructional Decoherence · ALCC Tardigrade-Inspired Control Loop",V.plasma,<>
        {P("Mutual Shared Destructional Decoherence (MSDD) is an AETHER framework concept for understanding why ecosystem collapse under a shock event is not the sum of individual system failures — it is worse. The 'mutual' aspect: biological subsystems (FMO photosynthesis quantum coherence, DNA repair electron tunneling, cytoskeletal quantum vibration, soil microbiome quorum sensing) are quantum-mechanically entangled through shared biochemical intermediates. The FMO complex and the tardigrade's intracellular environment share ATP, water structure, and redox potential — when one system's quantum coherence degrades, it perturbs these shared intermediates, accelerating the decoherence of coupled systems. The 'shared' aspect: a large-scale shock (radiation burst, impact shockwave, rapid temperature change) perturbs all systems simultaneously rather than sequentially. The 'destructional' aspect: coherence loss below a critical threshold (|ψ| < ~0.6) is self-amplifying — incoherent systems can no longer execute the enzymatic reactions that maintain their own coherence. The result is a collapse cascade that is faster and more complete than any individual system's failure rate would predict.")}
        {P("The tardigrade provides the evolutionary proof-of-concept for an Automated Looped Command and Control (ALCC) system capable of resisting MSDD. When desiccation stress is detected (falling water activity), the tardigrade's stress-sensing kinases phosphorylate transcription factors that upregulate CAHS-D protein production within hours. The CAHS-D proteins rapidly accumulate to ~20% of total cellular protein, and on further desiccation, undergo a phase transition from disordered solution to a rigid glass matrix — physically immobilising all intracellular molecules and arresting all decoherence-driven reactions. This is the ALCC loop: SENSE (water activity sensors) → PROCESS (kinase cascade) → COMMAND (CAHS-D gene expression) → ACT (glass formation) → MEASURE (ongoing monitoring of cellular integrity) → loop (continuous adjustment of glass stiffness as conditions change). When conditions improve (water returns), the reverse transition occurs spontaneously — the glass melts, proteins refold, quantum coherence is restored, and the organism resumes full function within minutes.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <MSDDControlCanvas/>
        </div>
        {cards([
          {h:"MSDD MATHEMATICS",    col:V.plasma,d:"dψᵢ/dt = −γᵢ·ψᵢ − κΣⱼ(1−ψⱼ)·ψᵢ + αᵢ·pᵢ. First term: natural decoherence rate. Second: mutual coupling (collapse of j accelerates collapse of i). Third: ALCC protection signal. Critical point: when Σ(1−ψⱼ) > γ/κ, collapse is autocatalytic — the system cannot self-recover without external ALCC intervention."},
          {h:"CAHS-D VITRIFICATION", col:V.cyan,  d:"Glass transition temperature Tg ~60°C above ambient. Viscosity at tun state: >10¹² Pa·s (vs liquid water: 10⁻³ Pa·s). Molecular diffusion: effectively zero. Decoherence rate ∝ molecular velocity ∝ √T → at Tg, decoherence rate drops by factor >10⁶. Result: quantum states preserved for decades (experimentally confirmed — 30yr tun revival)."},
          {h:"ALCC LOOP TIMING",     col:V.photon,d:"Stress sensing → CAHS upregulation: 2–6 hours. CAHS accumulation to protective level: 4–12 hours. Vitrification (glass transition): minutes once desiccation threshold reached. Total ALCC response time: 6–18 hours. Tardigrade survives exposure starting from ~24hr before fatal desiccation — ALCC has adequate lead time."},
          {h:"ECOLOGICAL MSDD",     col:V.green, d:"K-Pg impact: FMO coherence lost (no photons) → ATP drops → plant cytoskeleton fails → root-microbiome signalling breaks → soil microbiome restructures → tardigrade prey disappears → tardigrades enter tun. MSDD cascade timescale: days-weeks. ALCC: tardigrades survive in tun, re-seed soil when sunlight returns."},
          {h:"ENGINEERING ALCC",    col:V.amb,   d:"Synthetic biology: transfer CAHS-D + stress-sensing cascade to crop plant cells → crops enter partial tun state during drought/frost → survive MSDD events. Biomimetic: design infrastructure systems (power grids, food supply chains) with tardigrade-like ALCC — redundant sensing, automated glass-state lockdown during shocks, restart protocol."},
          {h:"SHOCK RESONANCE",     col:V.vio,   d:"If ALCC response frequency matches shock frequency, system can amplify protection ('resonant ALCC'). If shock frequency > ALCC loop rate, MSDD wins (no time to glass-state). Critical parameter: shock recurrence interval vs ALCC cycle time. For tardigrades in soil: ~18hr ALCC cycle matches daily desiccation cycle → near-perfect resonance."},
        ])}
      </>)}

      {sec("04","System Integration · The Full Thread · What This Changes",V.photon,<>
        {P("With the tardigrade page, the AETHER knowledge system closes its biological loop. The thread now runs: solar photons → FMO quantum coherence (Quantum Ringdown Biocycles) → plant glucose → flower (K-Pg survivors) → bee (Queen Bee Diapause, Nematic Bee-Car) → ecosystem. The tardigrade operates at every node simultaneously: it grazes the soil microbiome that feeds the plant roots; it persists through every extinction event (K-Pg, Snowball Earth, Younger Dryas) that destroyed all other animals; its CAHS-D proteins are biochemically related to the heat-stress proteins that protect FMO complexes during thermal decoherence; and its cryptobiotic state is the template for life on Mars (see Foton-M3 page). The tardigrade is not peripheral — it is the system's immune system, its backup drive, its crash recovery protocol.")}
        {P("The density dynamics across all planets define which of those worlds can even host the tardigrade-grade resilience. The pattern is unambiguous: liquid water is necessary but not sufficient; a magnetic field is necessary for surface life; subsurface environments relax both requirements but require chemical energy. Europa and Enceladus meet both subsurface conditions. Mars meets neither surface condition but marginally meets subsurface conditions at 40–65cm depth. The 1-billion-year solar brightening horizon (Tunguska page) creates a closing window — Earth's surface will become uninhabitable before Mars becomes warm enough, making the subsurface ocean moons the long-term repository of tardigrade-grade life. The MSDD/ALCC framework provides the engineering language for how to design systems — biological or technological — that survive that transition.")}
        {cards([
          {h:"AETHER FULL SYSTEM",  col:V.photon,d:"Solar photons → FMO Q-coherence → glucose → flowers (K-Pg survivor) → bees → ecosystem. Tardigrade = system immune response at every node. MSDD = how the system fails. ALCC = how the tardigrade (and we) prevent that failure. All pages now form one closed causal loop."},
          {h:"TARDIGRADE + ASTEROID",col:V.fire, d:"Every mass extinction documented in the Tunguska timeline page has been survived by tardigrades. K-Pg: tun state through impact winter. Snowball Earth: ice-entombed tun state for millions of years (theoretical — no fossil evidence yet). LHB: unknown, but organisms with CAHS-like proteins may have existed. Tardigrades are the geological continuity."},
          {h:"DENSITY + CHEMISTRY",  col:V.blue,  d:"Planetary density → core size → dynamo strength → magnetic field → radiation environment → surface chemistry → soil chemistry → tardigrade density → plant community → ecosystem complexity. The chain from planetary physics to biological density is direct, quantifiable, and computable."},
          {h:"MSDD + FUTURE THREATS",col:V.plasma,d:"Next Tunguska-class event (~2300): forest ecosystem MSDD, tardigrades in tun, 90%+ survive. Chicxulub-repeat (~100My): global photosynthesis MSDD, tardigrades sole survivors for decades. Solar brightening (600My): permanent C3 photosynthesis MSDD — only C4 plants + tardigrades remain. Beyond: tardigrades in Mars/Europa subsurface — last life in solar system."},
          {h:"ALCC TECHNOLOGY",     col:V.cyan,  d:"Near-term (5 yr): CAHS-D-based dry vaccine preservation (no cold chain). 10 yr: synthetic biology transfer to crops. 20 yr: infrastructure ALCC modelled on tardigrade response cycles. 50 yr: space-settlement life-support systems using tardigrade-derived MSDD resistance. 100 yr: engineered tardigrade communities as planetary seed vaults."},
          {h:"NEMATIC + TARDIGRADE",col:V.vio,   d:"LC nematic wing membrane on bee-car (Nematic page) uses director field relaxation identical to CAHS-D protein refolding dynamics — both are order-disorder transitions driven by external field (electric for LC, water for CAHS). Tardigrade-inspired LC actuators: controlled glass-state switching for morphing wing emergency lockdown during atmospheric shock."},
        ])}
      </>)}
    </div>
  );
}

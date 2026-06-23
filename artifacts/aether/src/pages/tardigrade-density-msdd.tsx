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
  fire:  "#FF6622",
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
   CANVAS 4 · Space Vacuum · Stellar Radiation · High-Energy Entropy States
   ───────────────────────────────────────────────────────────────────────── */
function SpaceVacuumRadiationCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=460, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Stellar classes: name, T(K), L(L☉), color, radius */
    const STARS=[
      {n:"O",T:40000,L:1e6,col:"#9BB8FF",r:7},{n:"B",T:20000,L:1e4,col:"#AACCFF",r:5.5},
      {n:"A",T:9000, L:80,  col:"#EEF0FF",r:4},{n:"F",T:7000, L:5,   col:"#FFFAEE",r:3.2},
      {n:"G",T:5778, L:1,   col:"#FFE880",r:2.8,sun:true},{n:"K",T:4500,L:0.2,col:"#FFAA55",r:2.3},
      {n:"M",T:3000, L:0.01,col:"#FF6633",r:1.8},
    ] as {n:string;T:number;L:number;col:string;r:number;sun?:boolean}[];

    /* Radiation bands */
    const BANDS=[
      {label:"GAMMA / X-RAY",col:"#FF22AA",xMin:0,  xMax:0.07,lethal:true},
      {label:"EUV",          col:"#CC44FF",xMin:0.07,xMax:0.13,lethal:true},
      {label:"UV",           col:"#8844FF",xMin:0.13,xMax:0.22,lethal:false},
      {label:"VISIBLE",      col:"#44CCFF",xMin:0.22,xMax:0.42,lethal:false},
      {label:"INFRARED",     col:"#FF8833",xMin:0.42,xMax:0.65,lethal:false},
      {label:"MICROWAVE/RADIO",col:"#44FF88",xMin:0.65,xMax:0.88,lethal:false},
    ];

    /* Cosmic ray particles */
    const RAYS:Array<{x:number;y:number;vx:number;vy:number;energy:number;col:string;deflected:boolean;life:number}>=[];
    for(let i=0;i<28;i++){
      RAYS.push({x:Math.random()*CW*0.44,y:-20-Math.random()*200,vx:(Math.random()-0.5)*0.8,
        vy:1.2+Math.random()*1.8,energy:Math.random(),
        col:Math.random()<0.3?"#FF4477":Math.random()<0.5?"#9966FF":"#4488FF",
        deflected:false,life:Math.random()*200});
    }
    /* Tardigrade hit flashes */
    const HITS:Array<{x:number;y:number;age:number;max:number}>=[];
    const tardX=CW*0.32, tardY=330;

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      /* bg */
      const bg=ctx.createRadialGradient(CW*0.22,CH*0.35,0,CW*0.22,CH*0.35,CW*0.55);
      bg.addColorStop(0,"#070A18"); bg.addColorStop(1,"#04060E");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* ── LEFT PANEL: H-R Diagram ── */
      const HR_W=CW*0.44, HR_H=CH-80;
      const HR_X=30, HR_Y=40;
      ctx.strokeStyle="#2A3050"; ctx.lineWidth=0.5;
      ctx.strokeRect(HR_X,HR_Y,HR_W-60,HR_H-40);
      ctx.fillStyle="#3A4060"; ctx.font=`8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("H-R DIAGRAM · TEMPERATURE vs LUMINOSITY",HR_X+(HR_W-60)/2,HR_Y-8);

      /* Axes labels */
      ctx.fillStyle="#5A7090"; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
      const tLabels=["40K","20K","10K","5K","3K"];
      tLabels.forEach((t,i)=>{
        const px=HR_X+10+(HR_W-80)*i/(tLabels.length-1);
        ctx.fillText(t,px,HR_Y+HR_H-28);
      });
      ctx.save(); ctx.translate(HR_X-4,HR_Y+HR_H/2-40); ctx.rotate(-Math.PI/2);
      ctx.fillText("LUMINOSITY (L☉)",0,0); ctx.restore();

      /* Stars on H-R */
      STARS.forEach((s,i)=>{
        const tx=(s.T-3000)/(40000-3000);
        const px=HR_X+10+(HR_W-80)*(1-tx*0.85);
        const ly=Math.log10(Math.max(s.L,0.001)+1)/(Math.log10(1e6+1));
        const py=HR_Y+HR_H-44-(HR_H-70)*ly;
        const pulse=0.85+0.15*Math.sin(frame*0.04+i*1.2);
        const grd=ctx.createRadialGradient(px,py,0,px,py,s.r*3*pulse);
        grd.addColorStop(0,s.col+"FF"); grd.addColorStop(0.4,s.col+"88"); grd.addColorStop(1,s.col+"00");
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(px,py,s.r*3*pulse,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=s.col; ctx.beginPath(); ctx.arc(px,py,s.r*pulse,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=s.col; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
        if(s.sun) ctx.fillStyle=V.gold;
        ctx.fillText(s.n+(s.sun?" ☀":""),px+s.r+2,py+3);
        /* radiation spike for hot stars */
        if(s.T>8000){
          const spk=(s.T-8000)/32000;
          ctx.strokeStyle=s.col+"44"; ctx.lineWidth=spk*12;
          ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(HR_X,py-20); ctx.stroke();
        }
      });
      /* Main sequence band */
      ctx.strokeStyle="#FFFFFF08"; ctx.lineWidth=18;
      ctx.beginPath();
      STARS.forEach((s,i)=>{
        const tx=(s.T-3000)/(40000-3000);
        const px=HR_X+10+(HR_W-80)*(1-tx*0.85);
        const ly=Math.log10(Math.max(s.L,0.001)+1)/(Math.log10(1e6+1));
        const py=HR_Y+HR_H-44-(HR_H-70)*ly;
        if(i===0)ctx.moveTo(px,py); else ctx.lineTo(px,py);
      }); ctx.stroke();
      /* Solar label */
      ctx.fillStyle=V.gold; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText("☀ SUN  T=5778K  L=1L☉",HR_X+8,HR_Y+HR_H-52);

      /* ── RIGHT PANEL: Cosmic Ray Shower + Tardigrade ── */
      const RP_X=CW*0.47, RP_W=CW*0.5;
      ctx.fillStyle="#3A4060"; ctx.font=`8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("SPACE VACUUM · COSMIC RAY SHOWER · TARDIGRADE SURVIVAL",RP_X+RP_W*0.5,HR_Y-8);

      /* magnetic field lines (deflecting some rays) */
      ctx.strokeStyle=V.blue+"22"; ctx.lineWidth=0.8;
      for(let k=0;k<6;k++){
        const my=80+k*60;
        ctx.beginPath();
        ctx.moveTo(RP_X,my);
        for(let x=0;x<=RP_W;x+=4){
          ctx.lineTo(RP_X+x,my+Math.sin((x/RP_W)*Math.PI*3+k)*18);
        }
        ctx.stroke();
      }
      ctx.fillStyle=V.blue+"55"; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("⟵ B-FIELD SHIELD LINES",RP_X+4,CH-115);

      /* cosmic rays */
      RAYS.forEach((r,i)=>{
        r.y+=r.vy; r.x+=r.vx; r.life++;
        /* magnetic deflection for some particles */
        if(r.x>RP_X+20 && r.x<RP_X+RP_W-20 && r.energy<0.4){
          r.vx+=0.06*Math.sin(frame*0.03+i); r.vy-=0.02; r.deflected=true;
        }
        if(r.y>CH+20||r.x<RP_X||r.x>RP_X+RP_W){ r.y=-10-Math.random()*100; r.x=RP_X+Math.random()*RP_W; r.life=0; r.deflected=false; }
        /* hit tardigrade */
        const dx=r.x-tardX, dy=r.y-tardY;
        if(Math.sqrt(dx*dx+dy*dy)<18&&r.energy>0.6&&!r.deflected){
          HITS.push({x:tardX,y:tardY,age:0,max:20}); r.y=-10; r.x=RP_X+Math.random()*RP_W;
        }
        /* draw */
        const alpha=0.5+0.4*r.energy;
        ctx.strokeStyle=r.col+(Math.floor(alpha*255).toString(16).padStart(2,"0"));
        ctx.lineWidth=0.8+r.energy;
        ctx.beginPath(); ctx.moveTo(r.x,r.y); ctx.lineTo(r.x-r.vx*8,r.y-r.vy*8); ctx.stroke();
        if(r.deflected){
          ctx.fillStyle=r.col+"88"; ctx.beginPath(); ctx.arc(r.x,r.y,2,0,Math.PI*2); ctx.fill();
        }
      });

      /* Tardigrade tun state */
      const tunPulse=0.9+0.1*Math.sin(frame*0.025);
      const tgrd=ctx.createRadialGradient(tardX,tardY,0,tardX,tardY,22*tunPulse);
      tgrd.addColorStop(0,"#8A9860CC"); tgrd.addColorStop(0.5,"#8A986088"); tgrd.addColorStop(1,"#8A986000");
      ctx.fillStyle=tgrd; ctx.beginPath(); ctx.arc(tardX,tardY,22*tunPulse,0,Math.PI*2); ctx.fill();
      /* barrel body */
      ctx.fillStyle="#6A7840"; ctx.strokeStyle=V.green+"AA"; ctx.lineWidth=1.2;
      ctx.beginPath(); ctx.ellipse(tardX,tardY,14*tunPulse,10*tunPulse,0,0,Math.PI*2);
      ctx.fill(); ctx.stroke();
      /* desiccation rings */
      ctx.strokeStyle=V.dim+"88"; ctx.lineWidth=0.5;
      for(let k=1;k<=3;k++){ctx.beginPath(); ctx.ellipse(tardX,tardY,14*tunPulse-k*3.5,10*tunPulse-k*2.5,0,0,Math.PI*2); ctx.stroke();}
      ctx.fillStyle=V.green; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("TARDIGRADE · TUN STATE",tardX,tardY+30);
      ctx.fillStyle=V.dim; ctx.fillText("570,000 rad tolerance",tardX,tardY+40);

      /* hit flashes */
      HITS.forEach((h,i)=>{
        const t=h.age/h.max; h.age++;
        if(h.age>h.max){ HITS.splice(i,1); return; }
        ctx.strokeStyle=`rgba(255,200,80,${1-t})`; ctx.lineWidth=2*(1-t);
        for(let a=0;a<6;a++){
          const ang=a/6*Math.PI*2+frame*0.1;
          ctx.beginPath(); ctx.moveTo(h.x+Math.cos(ang)*16,h.y+Math.sin(ang)*12);
          ctx.lineTo(h.x+Math.cos(ang)*(16+22*t),h.y+Math.sin(ang)*(12+16*t)); ctx.stroke();
        }
      });

      /* ── BOTTOM: Radiation Spectrum + Survival Bands ── */
      const BX=HR_X, BY=CH-72, BH=50;
      BANDS.forEach((b)=>{
        const bx=BX+(b.xMin)*(CW-50), bw=(b.xMax-b.xMin)*(CW-50);
        const grd=ctx.createLinearGradient(bx,0,bx+bw,0);
        grd.addColorStop(0,b.col+"55"); grd.addColorStop(0.5,b.col+"88"); grd.addColorStop(1,b.col+"55");
        ctx.fillStyle=grd; ctx.fillRect(bx,BY,bw,BH);
        ctx.strokeStyle=b.col+"33"; ctx.lineWidth=0.5; ctx.strokeRect(bx,BY,bw,BH);
        ctx.fillStyle=b.col; ctx.font=`5.8px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(b.label,bx+bw/2,BY+10);
        if(b.lethal){ ctx.fillStyle=V.plasma; ctx.fillText("⚠ LETHAL",bx+bw/2,BY+22); }
        else if(b.label.includes("VISIBLE")){
          ctx.fillStyle=V.green; ctx.fillText("✓ TARDIGRADE OK",bx+bw/2,BY+22);
        }
      });
      /* Tardigrade survival bracket */
      ctx.strokeStyle=V.green; ctx.lineWidth=1.5;
      const svX=BX+(0.13)*(CW-50), svW=(0.65-0.13)*(CW-50);
      ctx.strokeRect(svX,BY+28,svW,16);
      ctx.fillStyle=V.green; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("TUN STATE: SURVIVES UV → IR (in tun; active tolerance: visible only)",svX+svW/2,BY+39);

      /* ── Stellar entropy gradient strip (top) ── */
      const EX=RP_X, EY=CH-72, EW=RP_W;
      const layers=[
        {name:"STELLAR CORE",T:"1.5×10⁷ K",col:"#FF2200",w:0.18},
        {name:"RADIATION ZONE",T:"2×10⁶ K", col:"#FF6600",w:0.22},
        {name:"CONVECTION ZONE",T:"5×10⁵ K",col:"#FF9933",w:0.22},
        {name:"PHOTOSPHERE",T:"5,778 K",    col:"#FFE880",w:0.20},
        {name:"CHROMOSPHERE",T:"20,000 K",  col:"#FFAAFF",w:0.10},
        {name:"CORONA",T:"1–3×10⁶ K",      col:"#AADDFF",w:0.08},
      ];
      let elx=EX;
      layers.forEach(l=>{
        const lw=l.w*EW;
        ctx.fillStyle=l.col+"33"; ctx.fillRect(elx,EY,lw,50);
        ctx.strokeStyle=l.col+"55"; ctx.lineWidth=0.5; ctx.strokeRect(elx,EY,lw,50);
        ctx.fillStyle=l.col; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(l.name,elx+lw/2,EY+10); ctx.fillText(l.T,elx+lw/2,EY+21);
        elx+=lw;
      });
      ctx.fillStyle=V.cyan; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("⚠ CORONA PARADOX: T(corona) > T(surface) × 300 — unsolved entropy reversal",EX+EW/2,EY+35);

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"460px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 5 · Bayesian Inference · Life Probability · Evidence Propagation
   ───────────────────────────────────────────────────────────────────────── */
function BayesianInferenceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=460, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Scenarios: 4 worlds */
    const SCENARIOS=[
      {name:"EARTH · LOAMY SOIL",col:V.safe,
       ev:{water:0.97,temp:0.90,radiation:0.78,pH:0.88,organics:0.96,magfield:0.95},posterior:0.9997},
      {name:"MARS · SURFACE",col:V.rust,
       ev:{water:0.03,temp:0.24,radiation:0.05,pH:0.30,organics:0.08,magfield:0.01},posterior:0.0022},
      {name:"ENCELADUS · PLUME OCEAN",col:V.photon,
       ev:{water:0.95,temp:0.55,radiation:0.70,pH:0.75,organics:0.82,magfield:0.20},posterior:0.62},
      {name:"EUROPA · SUBSURFACE OCEAN",col:V.cyan,
       ev:{water:0.92,temp:0.60,radiation:0.68,pH:0.72,organics:0.55,magfield:0.28},posterior:0.55},
    ];
    const EV_KEYS=["water","temp","radiation","pH","organics","magfield"] as const;
    const EV_LABELS=["LIQUID WATER","TEMPERATURE","RADIATION SHIELD","pH RANGE","ORGANIC CARBON","MAGNETIC FIELD"];
    const EV_COLS=[V.blue,V.amb,V.plasma,V.green,V.honey,V.vio];
    const EV_WEIGHTS=[0.30,0.15,0.15,0.10,0.15,0.15]; /* Bayesian importance weights */

    /* Bayesian network nodes */
    const PRIOR_X=CW*0.18, PRIOR_Y=90;
    const EV_X=CW*0.38;
    const POST_X=CW*0.60, POST_Y=230;
    const PHASE_DUR=180;

    /* Animated belief particles */
    const PARTICLES:Array<{x:number;y:number;tx:number;ty:number;t:number;col:string}>=[];

    const spawnParticle=(fromX:number,fromY:number,toX:number,toY:number,col:string)=>{
      PARTICLES.push({x:fromX,y:fromY,tx:toX,ty:toY,t:0,col});
    };

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,0,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#070A14");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      const si=Math.floor(frame/PHASE_DUR)%4;
      const sf=(frame%PHASE_DUR)/PHASE_DUR;
      const sc=SCENARIOS[si];
      const prev=SCENARIOS[(si+3)%4];

      /* lerp toward scenario values */
      const evNow:{[k:string]:number}={};
      EV_KEYS.forEach(k=>{ evNow[k]=lerp(prev.ev[k],sc.ev[k],Math.min(sf*2.5,1)); });
      const posterior=lerp(prev.posterior,sc.posterior,Math.min(sf*2.5,1));

      /* Title */
      ctx.fillStyle=sc.col; ctx.font=`9px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(`SCENARIO: ${sc.name}`,CW*0.5,28);
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`;
      ctx.fillText("BAYESIAN NETWORK · P(life | water, temp, radiation, pH, organics, B-field)",CW*0.5,44);

      /* ── DAG Layout ── */
      /* Prior node */
      const drawNode=(x:number,y:number,r:number,col:string,label:string,sub:string,val:number)=>{
        const grd=ctx.createRadialGradient(x,y,0,x,y,r);
        grd.addColorStop(0,col+"44"); grd.addColorStop(1,col+"08");
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=col; ctx.lineWidth=1.2; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
        /* value arc */
        ctx.strokeStyle=col; ctx.lineWidth=3; ctx.lineCap="round";
        ctx.beginPath(); ctx.arc(x,y,r-4,-Math.PI/2,-Math.PI/2+Math.PI*2*val,false); ctx.stroke();
        ctx.fillStyle=col; ctx.font=`bold 8px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(label,x,y-4);
        ctx.font=`6.5px ${V.mono}`; ctx.fillStyle=V.ink;
        ctx.fillText(sub,x,y+7);
        ctx.fillStyle=col; ctx.font=`7px ${V.mono}`;
        ctx.fillText((val*100).toFixed(0)+"%",x,y+r+13);
      };

      /* Prior node */
      drawNode(PRIOR_X,PRIOR_Y,24,V.gold,"PRIOR","P(life)=0.01",0.01);
      ctx.fillStyle=V.gold; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("(1% baseline)",PRIOR_X,PRIOR_Y+50);

      /* Evidence nodes */
      const evNodeY:number[]=[];
      EV_KEYS.forEach((k,i)=>{
        const ny=80+i*58;
        evNodeY.push(ny);
        const v=evNow[k];
        drawNode(EV_X,ny,18,EV_COLS[i],EV_LABELS[i].split(" ")[0]+"\n"+EV_LABELS[i].split(" ").slice(1).join(" "),EV_LABELS[i],v);
        /* Weight label */
        ctx.fillStyle=EV_COLS[i]+"88"; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`w=${EV_WEIGHTS[i]}`,EV_X+22,ny-6);
        /* Edge from prior to evidence */
        ctx.strokeStyle=EV_COLS[i]+"33"; ctx.lineWidth=0.8;
        ctx.beginPath(); ctx.moveTo(PRIOR_X+24,PRIOR_Y+8); ctx.lineTo(EV_X-18,ny); ctx.stroke();
        /* Edge from evidence to posterior */
        ctx.strokeStyle=EV_COLS[i]+(v>0.5?"AA":"44"); ctx.lineWidth=0.8+v*2;
        ctx.beginPath(); ctx.moveTo(EV_X+18,ny); ctx.lineTo(POST_X-32,POST_Y); ctx.stroke();
      });

      /* Posterior node */
      const postCol=posterior>0.5?V.safe:posterior>0.1?V.amb:V.plasma;
      drawNode(POST_X,POST_Y,36,postCol,"POSTERIOR","P(life|e)",posterior);
      ctx.fillStyle=postCol; ctx.font=`8px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(posterior>0.9?"HIGH VIABILITY":posterior>0.3?"POSSIBLE":"UNLIKELY",POST_X,POST_Y+52);

      /* ── RIGHT PANEL: Evidence bars + Bayesian update equation ── */
      const RP=CW*0.68;
      ctx.fillStyle=V.dim; ctx.font=`7.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("EVIDENCE PROFILE",RP,60);

      EV_KEYS.forEach((k,i)=>{
        const v=evNow[k];
        const bx=RP, by=78+i*46, bw=CW-RP-18, bh=22;
        ctx.fillStyle=EV_COLS[i]+"11"; ctx.fillRect(bx,by,bw,bh);
        ctx.fillStyle=EV_COLS[i]+(v>0.5?"CC":"55"); ctx.fillRect(bx,by,bw*v,bh);
        ctx.strokeStyle=EV_COLS[i]+"44"; ctx.lineWidth=0.5; ctx.strokeRect(bx,by,bw,bh);
        ctx.fillStyle=EV_COLS[i]; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(EV_LABELS[i],bx+3,by+8);
        ctx.textAlign="right"; ctx.fillText((v*100).toFixed(0)+"%",bx+bw-3,by+8);
        /* weighted contribution */
        ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(`contrib: ${(v*EV_WEIGHTS[i]*100).toFixed(2)}%`,bx+3,by+20);
      });

      /* Bayes theorem display */
      const eqY=CH-132;
      ctx.fillStyle=V.dim; ctx.font=`7px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("BAYES' THEOREM:",RP,eqY);
      ctx.fillStyle=V.gold; ctx.font=`7.5px ${V.mono}`;
      ctx.fillText("P(life|E) ∝ P(E|life) · P(life)",RP,eqY+14);
      ctx.fillStyle=V.ink+"AA"; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText(`P(E|life) = Π wᵢ·P(eᵢ|life)`,RP,eqY+27);
      ctx.fillText(`Prior: 0.0100  |  Likelihood: ${EV_KEYS.reduce((a,k,i)=>a*Math.pow(evNow[k],EV_WEIGHTS[i]),1).toFixed(4)}`,RP,eqY+40);
      ctx.fillStyle=postCol; ctx.font=`bold 9px ${V.mono}`;
      ctx.fillText(`Posterior P(life): ${(posterior*100).toFixed(2)}%`,RP,eqY+56);

      /* Scenario cycle indicator */
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
      const pips=SCENARIOS.map((_,i)=>i===si?"●":"○").join("  ");
      ctx.fillText(pips,CW*0.5,CH-10);
      SCENARIOS.forEach((s,i)=>{
        ctx.fillStyle=i===si?s.col:V.dim+"55";
        ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(s.name,CW*(0.12+i*0.22),CH-22);
      });

      /* Spawn belief particles occasionally */
      if(frame%25===0){
        EV_KEYS.forEach((k,i)=>{
          if(Math.random()<evNow[k]){
            spawnParticle(EV_X+18,evNodeY[i],POST_X-32,POST_Y,EV_COLS[i]);
          }
        });
      }
      /* Draw particles */
      PARTICLES.forEach((p,i)=>{
        p.t+=0.04; const t=p.t;
        if(t>1){ PARTICLES.splice(i,1); return; }
        const px=lerp(p.x,p.tx,t), py=lerp(p.y,p.ty,t);
        ctx.fillStyle=p.col+(Math.floor((1-t)*180).toString(16).padStart(2,"0"));
        ctx.beginPath(); ctx.arc(px,py,2.5,0,Math.PI*2); ctx.fill();
      });

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"460px",borderRadius:6,display:"block"}}/>;
}

/* ─────────────────────────────────────────────────────────────────────────
   CANVAS 6 · Quantitative Finance · MSDD Market Cascade · Vol Surface
   ───────────────────────────────────────────────────────────────────────── */
function QuantFinanceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const cv=ref.current; if(!cv) return;
    const CH=480, PR=window.devicePixelRatio||1;
    const CW=Math.max(cv.offsetWidth,520);
    cv.width=CW*PR; cv.height=CH*PR; cv.style.height=CH+"px";
    const ctx=cv.getContext("2d")!; ctx.scale(PR,PR);
    let frame=0, raf=0;

    /* Asset classes */
    const ASSETS=[
      {name:"EQUITIES",col:"#4488FF",ret:0.08,vol:0.18},{name:"BONDS",col:"#44CC77",ret:0.03,vol:0.06},
      {name:"COMMODITIES",col:"#FF9933",ret:0.05,vol:0.22},{name:"FX",col:"#9966FF",ret:0.02,vol:0.10},
      {name:"CRYPTO",col:"#FF6699",ret:0.25,vol:0.80},{name:"REAL ESTATE",col:"#C8A030",ret:0.07,vol:0.14},
    ];
    /* Correlation matrix (normal regime) */
    const CORR_NORMAL:number[][]=[
      [1.00, 0.15, 0.22, 0.08,-0.12, 0.35],
      [1.00, 0.00,-0.20,-0.05, 0.10],
      [1.00, 0.12, 0.08, 0.20],
      [1.00, 0.05, 0.02],
      [1.00, 0.04],
      [1.00],
    ];
    const corrNormal=(i:number,j:number)=>{
      const a=Math.min(i,j),b=Math.max(i,j);
      return CORR_NORMAL[a][b-a];
    };

    /* MSDD phases: 0=normal 1=shock 2=msdd 3=alcc 4=recovery */
    const PHASE_DUR=[200,60,120,80,180];
    const TOTAL_DUR=PHASE_DUR.reduce((a,b)=>a+b,0);
    const PHASES=["NORMAL · DIVERSIFIED","SHOCK EVENT · CORRELATION SPIKE","MSDD · SYSTEMIC COLLAPSE","ALCC · AUTOMATED RECOVERY","RECOVERY · REBALANCED"];
    const PHASE_COLS=[V.safe,V.shock,V.plasma,V.cyan,V.photon];

    /* Vol surface parameters — isometric 3D */
    const ISO_ANGLE=Math.PI/6;
    const VOL_SX=CW*0.48, VOL_SY=100;
    const STRIKES=8, MATURITIES=6;
    const ISO_CW=160, ISO_CH=90;

    const isoPoint=(xi:number,yi:number,z:number):{x:number,y:number}=>{
      const ix=(xi/STRIKES)*ISO_CW;
      const iy=(yi/MATURITIES)*ISO_CH;
      return {
        x: VOL_SX + ix*Math.cos(ISO_ANGLE) - iy*Math.cos(Math.PI/3),
        y: VOL_SY + ix*Math.sin(ISO_ANGLE) + iy*Math.sin(Math.PI/3) - z*80,
      };
    };

    /* Portfolio weights (Bayesian posterior) */
    const weights=[0.28,0.25,0.15,0.12,0.05,0.15];
    let wTarget=[...weights];

    const draw=()=>{
      ctx.clearRect(0,0,CW,CH);
      const bg=ctx.createLinearGradient(0,0,CW,CH);
      bg.addColorStop(0,"#04060E"); bg.addColorStop(1,"#080C18");
      ctx.fillStyle=bg; ctx.fillRect(0,0,CW,CH);

      /* Determine phase */
      const t=frame%TOTAL_DUR;
      let phase=0, pt=0;
      let acc=0;
      for(let i=0;i<PHASE_DUR.length;i++){
        if(t<acc+PHASE_DUR[i]){ phase=i; pt=(t-acc)/PHASE_DUR[i]; break; }
        acc+=PHASE_DUR[i];
      }
      const phName=PHASES[phase];
      const phCol=PHASE_COLS[phase];

      /* Correlation factor: 0=normal diversified, 1=all correlated = MSDD collapse */
      const corrFactor=phase===0?0:phase===1?pt*0.9:phase===2?0.9+pt*0.09:phase===3?0.99-pt*0.7:0.3*(1-pt*0.3);
      const effCorr=(i:number,j:number)=>lerp(corrNormal(i,j),0.97,corrFactor);

      /* VIX-equivalent: portfolio panic gauge */
      const vix=lerp(16,92,phase===0?0.05:phase===1?pt*0.85:phase===2?0.85+pt*0.1:phase===3?0.95-pt*0.6:0.35-pt*0.3);
      const sharpe=lerp(0.45,-2.2,corrFactor);
      const expectedReturn=(phase<2?0.07:phase===2?-0.18+pt*(-0.10):phase===3?-0.28+pt*0.12:phase===4?-0.16+pt*0.22:0.06);
      const mdd=lerp(0.12,0.52,corrFactor);

      /* ── LEFT: Asset Correlation Network ── */
      const NET_R=82, NET_CX=CW*0.22, NET_CY=200;
      ctx.fillStyle=V.dim; ctx.font=`7.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText("ASSET CORRELATION NETWORK · MSDD MARKET MODEL",NET_CX,38);
      ctx.fillStyle=phCol+"88"; ctx.font=`7px ${V.mono}`;
      ctx.fillText(phName,NET_CX,54);

      /* Draw correlation edges */
      for(let i=0;i<ASSETS.length;i++){
        for(let j=i+1;j<ASSETS.length;j++){
          const ai=ASSETS[i], aj=ASSETS[j];
          const angi=i/ASSETS.length*Math.PI*2-Math.PI/2;
          const angj=j/ASSETS.length*Math.PI*2-Math.PI/2;
          const xi=NET_CX+Math.cos(angi)*NET_R, yi=NET_CY+Math.sin(angi)*NET_R;
          const xj=NET_CX+Math.cos(angj)*NET_R, yj=NET_CY+Math.sin(angj)*NET_R;
          const ec=effCorr(i,j);
          const alpha=Math.max(0.1,ec);
          ctx.strokeStyle=phase<2?`rgba(80,120,200,${alpha*0.8})`:`rgba(255,80,80,${alpha*0.9})`;
          ctx.lineWidth=0.5+ec*4;
          ctx.beginPath(); ctx.moveTo(xi,yi); ctx.lineTo(xj,yj); ctx.stroke();
        }
      }

      /* ALCC ring when active */
      if(phase>=3){
        const rPulse=0.85+0.15*Math.sin(frame*0.08);
        ctx.strokeStyle=V.cyan+(Math.floor(pt*180).toString(16).padStart(2,"0"));
        ctx.lineWidth=1.5; ctx.setLineDash([6,4]);
        ctx.beginPath(); ctx.arc(NET_CX,NET_CY,NET_R+16*rPulse,0,Math.PI*2); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle=V.cyan+"66"; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("ALCC REBALANCING LOOP",NET_CX,NET_CY-NET_R-22);
      }

      /* Asset nodes */
      ASSETS.forEach((a,i)=>{
        const ang=i/ASSETS.length*Math.PI*2-Math.PI/2;
        const cx=NET_CX+Math.cos(ang)*NET_R, cy=NET_CY+Math.sin(ang)*NET_R;
        const pulse=0.9+0.1*Math.sin(frame*0.05+i*1.1);
        /* Weight ring */
        ctx.strokeStyle=a.col+"44"; ctx.lineWidth=2;
        ctx.beginPath(); ctx.arc(cx,cy,18*wTarget[i]*4*pulse,-Math.PI/2,-Math.PI/2+Math.PI*2,false); ctx.stroke();
        /* Node */
        const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,14);
        grd.addColorStop(0,a.col+"88"); grd.addColorStop(1,a.col+"11");
        ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,14,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=a.col; ctx.lineWidth=1; ctx.beginPath(); ctx.arc(cx,cy,14,0,Math.PI*2); ctx.stroke();
        ctx.fillStyle=a.col; ctx.font=`6px ${V.mono}`; ctx.textAlign="center";
        const labelLines=a.name.split(" ");
        labelLines.forEach((l,li)=>ctx.fillText(l,cx,cy+(li-0.5*labelLines.length+0.5)*8));
        /* Weight below node */
        ctx.fillStyle=V.dim; ctx.font=`5.5px ${V.mono}`;
        const wx=NET_CX+Math.cos(ang)*(NET_R+30);
        const wy=NET_CY+Math.sin(ang)*(NET_R+30);
        ctx.fillText(`${(wTarget[i]*100).toFixed(0)}%`,wx,wy);
      });

      /* MSDD collapse: draw center singularity */
      if(phase===2){
        const colR=20+pt*30;
        const colGrd=ctx.createRadialGradient(NET_CX,NET_CY,0,NET_CX,NET_CY,colR);
        colGrd.addColorStop(0,V.plasma+"AA"); colGrd.addColorStop(1,V.plasma+"00");
        ctx.fillStyle=colGrd; ctx.beginPath(); ctx.arc(NET_CX,NET_CY,colR,0,Math.PI*2); ctx.fill();
        ctx.fillStyle=V.plasma; ctx.font=`7px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText("ρ→1.0",NET_CX,NET_CY+4);
        ctx.fillText("COLLAPSE",NET_CX,NET_CY+14);
      }

      /* ── RIGHT: Black-Scholes Vol Surface (Isometric) ── */
      ctx.fillStyle=V.dim; ctx.font=`7.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("IMPLIED VOLATILITY SURFACE (BLACK-SCHOLES)",VOL_SX-10,30);
      ctx.fillStyle=V.dim; ctx.font=`6px ${V.mono}`;
      ctx.fillText("Strike →  /  Maturity ↗",VOL_SX-10,44);

      for(let yi=0;yi<MATURITIES;yi++){
        for(let xi=0;xi<STRIKES;xi++){
          /* BS implied vol: volatility smile + term structure */
          const moneyness=(xi/STRIKES-0.5)*2; /* -1 to +1 */
          const tau=0.1+yi/MATURITIES*2;      /* 0.1 to 2.1 years */
          const smile=0.18+0.12*moneyness*moneyness;
          const term=0.15/Math.sqrt(tau);
          const panic=phase>=1?(phase===1?pt*0.6:phase===2?0.6+pt*0.35:phase===3?0.95-pt*0.5:0.45-pt*0.35):0.02;
          const vol=smile*0.4+term*0.3+0.3*(0.20+panic*0.60)+0.05*Math.sin(frame*0.04+xi*0.5);

          const p00=isoPoint(xi,yi,vol);
          const p10=isoPoint(xi+1,yi,vol);
          const p01=isoPoint(xi,yi+1,vol);
          const p11=isoPoint(xi+1,yi+1,vol);

          /* Fill quad */
          const volCol=vol<0.25?"#2266AA":vol<0.40?"#44AA66":vol<0.55?"#AAAA22":vol<0.70?"#CC6622":"#CC2244";
          ctx.fillStyle=volCol+"AA";
          ctx.beginPath(); ctx.moveTo(p00.x,p00.y); ctx.lineTo(p10.x,p10.y);
          ctx.lineTo(p11.x,p11.y); ctx.lineTo(p01.x,p01.y); ctx.closePath(); ctx.fill();
          ctx.strokeStyle="#FFFFFF18"; ctx.lineWidth=0.4; ctx.stroke();
        }
      }
      /* Vol surface legend */
      const lgX=VOL_SX+ISO_CW+15, lgY=VOL_SY+20;
      [["<25%",V.blue],["25–40%","#44AA66"],["40–55%","#AAAA22"],["55–70%","#CC6622"],[">70%",V.plasma]].forEach(([l,c],i)=>{
        ctx.fillStyle=c as string; ctx.fillRect(lgX,lgY+i*14,12,10);
        ctx.fillStyle=V.ink; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(l as string,lgX+15,lgY+i*14+9);
      });

      /* ── GAUGES ROW ── */
      const GY=CH-130, GX=CW*0.48, GW=CW*0.5;
      const gauges=[
        {label:"VIX",val:vix,min:10,max:100,col:vix>60?V.plasma:vix>35?V.amb:V.safe,fmt:(v:number)=>v.toFixed(0)},
        {label:"SHARPE",val:sharpe,min:-3,max:2,col:sharpe>0.5?V.safe:sharpe>0?V.amb:V.plasma,fmt:(v:number)=>v.toFixed(2)},
        {label:"E[R] %/yr",val:expectedReturn*100,min:-30,max:25,col:expectedReturn>0?V.green:V.plasma,fmt:(v:number)=>v.toFixed(1)+"%"},
        {label:"MAX DD",val:mdd*100,min:0,max:60,col:mdd>0.4?V.plasma:mdd>0.2?V.amb:V.safe,fmt:(v:number)=>v.toFixed(0)+"%"},
      ];
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("PORTFOLIO RISK METRICS · BAYESIAN POSTERIOR WEIGHTS",GX,GY-10);
      gauges.forEach((g,i)=>{
        const gx=GX+(i%2)*(GW/2), gy=GY+Math.floor(i/2)*50;
        const t2=Math.max(0,Math.min(1,(g.val-g.min)/(g.max-g.min)));
        ctx.fillStyle=g.col+"11"; ctx.fillRect(gx,gy,GW/2-8,36);
        ctx.fillStyle=g.col+"44"; ctx.fillRect(gx,gy,Math.max(0,(GW/2-8)*t2),36);
        ctx.strokeStyle=g.col+"44"; ctx.lineWidth=0.5; ctx.strokeRect(gx,gy,GW/2-8,36);
        ctx.fillStyle=g.col; ctx.font=`6px ${V.mono}`; ctx.textAlign="left";
        ctx.fillText(g.label,gx+5,gy+12);
        ctx.font=`bold 11px ${V.mono}`; ctx.fillText(g.fmt(g.val),gx+5,gy+28);
      });

      /* Bayesian Portfolio Update display */
      const BPY=CH-55;
      ctx.fillStyle=V.dim; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText("BAYESIAN PORTFOLIO WEIGHTS (POSTERIOR) →",CW*0.48,BPY-10);
      ASSETS.forEach((a,i)=>{
        const tw=phase<2?weights[i]:phase===2?(weights[i]*(1-pt*0.5)+pt*0.5*(1/ASSETS.length)):phase===4?(1/ASSETS.length*(1-pt)+weights[i]*pt):1/ASSETS.length;
        wTarget[i]=lerp(wTarget[i],tw,0.05);
        const bx=CW*0.48+i*(CW*0.52/ASSETS.length);
        const bh=wTarget[i]*160;
        ctx.fillStyle=a.col+"55"; ctx.fillRect(bx,BPY+36-bh,CW*0.52/ASSETS.length-4,bh);
        ctx.strokeStyle=a.col+"88"; ctx.lineWidth=0.5; ctx.strokeRect(bx,BPY+36-bh,CW*0.52/ASSETS.length-4,bh);
        ctx.fillStyle=a.col; ctx.font=`5.5px ${V.mono}`; ctx.textAlign="center";
        ctx.fillText(`${(wTarget[i]*100).toFixed(0)}%`,bx+(CW*0.52/ASSETS.length-4)/2,BPY+48);
        ctx.fillStyle=V.dim; ctx.font=`4.5px ${V.mono}`;
        ctx.fillText(a.name.split(" ")[0].slice(0,4),bx+(CW*0.52/ASSETS.length-4)/2,BPY+58);
      });

      frame++; raf=requestAnimationFrame(draw);
    };
    draw();
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"480px",borderRadius:6,display:"block"}}/>;
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

      {sec("05","Space Vacuum · Stellar Radiation · High-Energy Entropy · Corona Paradox",V.amb,<>
        {P("Space is not empty — it is a bath of photons, charged particles, and magnetic fields spanning 20 orders of magnitude in energy. The electromagnetic spectrum runs from gamma rays (>10²⁰ Hz, E>400 keV, lethal dose in seconds) through X-ray, EUV, UV, visible light, infrared, microwave, and radio waves. Every star radiates across this full spectrum, weighted by its temperature via Planck's law (peak wavelength λ_max = 2.898×10⁻³/T). The Sun, a G-type main-sequence star at T_eff = 5,778 K, peaks in the visible green (λ=502 nm) — a window that evolution has shaped every photosynthetic organism to exploit. O-type stars at 40,000 K flood the UV and X-ray bands, sterilising any unshielded surface within hours. M-dwarf stars at 3,000 K emit mostly infrared, posing a different hazard: their habitable zones are so close that tidal locking and flare X-ray bursts replace UV as the sterilising agent. The Hertzsprung-Russell diagram encodes this energy landscape: the main sequence from lower-right (M dwarfs, dim, cool, red) to upper-left (O giants, brilliant, hot, blue) is a map of how much high-energy photon flux any potential biosphere must cope with.")}
        {P("The stellar entropy gradient from core to surface (and beyond) expresses one of astrophysics' deepest unsolved puzzles: the corona paradox. The Sun's visible surface (photosphere) sits at 5,778 K. Above it, the corona — a sparse plasma extending millions of kilometres — reaches 1–3 million K, more than 300× hotter than the surface below it. By the second law of thermodynamics, heat should not flow from cooler to hotter. The leading explanations are Alfvén wave dissipation (magnetohydrodynamic waves carry energy up magnetic field lines and deposit it in the corona through turbulent cascade) and nanoflare heating (explosive magnetic reconnection events in the corona release energy at small scales). The corona's extreme temperature creates the solar wind: a continuous stream of protons, electrons, and alpha particles escaping at 400–800 km/s, which creates the heliosphere, deflects interstellar cosmic rays, and — critically — shapes the radiation environment for every body in the solar system. Earth's magnetic field (25–65 μT) deflects most of this wind into the Van Allen belts, protecting the biosphere. The tardigrade in tun state has survived 570,000 rads — but the question of whether any biology could evolve in a chronically high-radiation environment (like close to a magnetar, emitting 10¹⁵× the Sun's magnetic energy) is open. The canvas simulates the H-R diagram of star classes, animated cosmic ray showers with magnetic deflection, the radiation survival envelope of tardigrade tun vs active states, and the full stellar entropy layering from core to corona.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <SpaceVacuumRadiationCanvas/>
        </div>
        {cards([
          {h:"STEFAN-BOLTZMANN LAW",  col:V.gold,  d:"L = 4πR²σT⁴. Luminosity scales as T⁴ — doubling T increases radiated power 16×. O stars at 40,000 K emit ~64,000× more power than G stars at 5,778 K. Consequence for life: O-star habitable zones are orders of magnitude further out; by the time a planet forms there, the star may have already left the main sequence. O-star habitable windows for life: <1 million years."},
          {h:"COSMIC RAY SPECTRUM",   col:V.vio,   d:"Cosmic rays: protons (90%), helium (9%), heavier nuclei+electrons (1%). Energies: 10⁶–10²⁰ eV (ultra-high energy cosmic rays). Flux at Earth surface: ~10⁴ particles/m²/s. Primary cosmic rays reach upper atmosphere; secondary cascade (muons, pions, photons) penetrates to sea level. Tardigrade tun LD50 for radiation: ~570,000 rad vs human LD50: ~400 rad — 1,400× more tolerant."},
          {h:"SOLAR WIND COMPOSITION",col:V.amb,   d:"Protons: 96%. Alpha particles: 4%. Speed: 400–800 km/s (slow/fast). Particle density at Earth: ~6 protons/cm³. Energy flux: ~2 nW/m². Heliosphere outer boundary (heliopause): ~123 AU. Beyond: local interstellar medium takes over. Voyager 1 crossed heliopause in 2012 — cosmic ray flux increased 3× upon exit."},
          {h:"CORONA PARADOX",        col:V.rose,  d:"Photosphere: 5,778 K. Chromosphere: 20,000 K. Corona: 1–3×10⁶ K. Temperature INCREASES with altitude — violates naive thermodynamic intuition. Leading mechanisms: Alfvén wave dissipation (MHD wave energy → thermal via turbulence) and nanoflare heating (magnetic reconnection microbursts). Total unsolved since 1939. High entropy state: corona is a low-density extremely hot plasma — high internal energy but also high entropy per particle."},
          {h:"TARDIGRADE RADIATION",  col:V.cyan,  d:"Mechanism: CAHS-D glass matrix physically stops radical diffusion. In active state: Dsup protein binds DNA directly, preventing double-strand breaks. Reactive oxygen species (ROS) scavenged by catalase/SOD enzymes (3–5× upregulated). IR (ionising radiation) LD50 in tun: 570,000 mGy. In active state: ~3,000 mGy. Space vacuum + cosmic ray exposure for 10 days (Foton-M3 BIOPAN-6): survived."},
          {h:"STELLAR ENTROPY STATES",col:V.plasma,d:"Core: T=1.5×10⁷K, ρ=150 g/cm³, pressure 2.5×10¹⁶ Pa. Maximum thermal energy density in stable stellar object. Radiation zone: energy transport by photon random walk — mean free path ~2cm, transit time ~170,000 years. Convection zone: buoyant plasma cells. Photosphere: τ=1 optical depth — last scattering surface. Corona: low ρ, extremely high T — high entropy per particle, low total energy."},
        ])}
      </>)}

      {sec("06","Bayesian Inference · Life Probability · Evidence Propagation · Soil Chemistry",V.vio,<>
        {P("Bayesian inference provides the mathematically rigorous framework for updating the probability of life given accumulating evidence. The prior probability P(life) in a new environment begins at ~1% — a generous estimate given that we have confirmed life in exactly one location (Earth) from billions of observed bodies. Each piece of evidence — liquid water activity, temperature range, radiation shielding, pH compatibility, organic carbon availability, magnetic field strength — is incorporated as a conditional likelihood P(evidence | life): the probability of observing that evidence if life were present. Bayes' theorem then states that the posterior probability P(life | evidence) is proportional to the product of all conditional likelihoods multiplied by the prior. Critically, the framework handles dependent evidence correctly — if we already know there is liquid water, the additional information from pH is less informative than if water were absent, because pH is partly determined by water chemistry. The Bayesian network makes these dependencies explicit as directed edges between evidence nodes.")}
        {P("Applied to soil chemistry, the Bayesian framework reveals why Earth's loamy temperate soil (posterior P(life) ≈ 99.97%) differs so dramatically from Mars surface regolith (posterior ≈ 0.22%) despite both having carbon and silicon chemistry. The critical bottleneck on Mars is not temperature or even radiation — it is liquid water activity (evidence score 0.03 vs 0.97 on Earth). Without liquid water, no enzyme can function, no cell membrane can exist, no chemical gradient can be maintained. The Bayesian network weights water activity at 30% of the total likelihood — the dominant evidence term. pH (range 4.5–7.5 for tardigrades) scores 0.30 on Mars (surface pH ~3.5 + perchlorate) versus 0.88 on Earth. Organics score 0.08 on Mars versus 0.96 on Earth. The compound effect of six sub-optimal evidence terms drives the Mars posterior to 0.22% — marginally above the prior, indicating the surface is weakly hostile rather than absolutely sterile. Enceladus, by contrast, scores 0.95 on water activity (plumes directly sampled), 0.55 on temperature (moderate hydrothermal), 0.70 on radiation shielding (subsurface ice cover), 0.75 on pH (slightly alkaline from carbonate), 0.82 on organics (Cassini detected complex molecules), and 0.20 on magnetic field — driving the posterior to ~62%.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <BayesianInferenceCanvas/>
        </div>
        {cards([
          {h:"BAYES' THEOREM",        col:V.vio,   d:"P(H|E) = P(E|H)·P(H) / P(E). H=life hypothesis. E=all evidence. P(E|H): likelihood of observing evidence given life is present. P(E)=P(E|H)·P(H)+P(E|¬H)·P(¬H): normalisation (law of total probability). Numerically: P(life|Earth soil)= 0.97·0.88·0.96·0.88·0.96·0.95 × 0.01 / P(E) ≈ 99.97%."},
          {h:"WATER ACTIVITY aW",     col:V.blue,  d:"aW=1.0 = pure water. Life minimum: aW ≥ 0.605 (some halophiles). Tardigrades active: aW > 0.90. Mars surface: aW < 0.01 (2×10⁻⁴ measured by Curiosity). Mars subsurface brine: aW ~0.55 (seasonal). Enceladus plume: aW ~0.98. Europa ocean: aW ~0.92. aW drives Bayesian weight: 30% of posterior because it gates all biochemistry."},
          {h:"SOIL pH vs LIFE",       col:V.green, d:"Optimal: 6.0–7.5. Tardigrade tolerance: 4.0–8.5. Mars surface: pH 3.5–4.0 (sulfuric + perchloric acid). Enceladus: pH 8.5–10.5 (Cassini mass spec) — alkaline but not lethal. Europa: pH 7–8 estimated (salt composition). Venus cloud layer at 50km: pH ~0 (H₂SO₄ 80%). Earth ocean average: pH 8.1. Every 1 pH unit outside tolerance: 50% viability reduction in Bayesian likelihood."},
          {h:"ORGANIC CARBON SCORE",  col:V.honey, d:"Earth loamy soil: 3–8% SOC (soil organic carbon). Enceladus plumes: complex organics with mass >200 Da (Cassini INMS). Europa surface: radiolytic organics (UV + cosmic rays → organics from CO₂ + H₂O). Mars: <0.5% (Viking detection threshold; Perseverance confirmed trace organics 2023). Organic presence raises P(life) Bayesian score: organics=both reactants AND products of biology."},
          {h:"MAGNETIC FIELD WEIGHT", col:V.amb,   d:"Weight=15% in Bayesian posterior — less critical than water (30%) but important. Role: deflects cosmic rays → reduces radiation dose → reduces DNA mutation rate → allows active metabolism (not just tun). Earth: 25–65 μT. Mars: <0.5 μT (global average). Enceladus: no global field but overlying ice crust shields subsurface. Europa: in Jupiter's magnetosphere — radiation intense at surface but attenuated at depth."},
          {h:"SOIL MICROBIAL ECOLOGY",col:V.photon,d:"Earth soil: 10⁹ bacteria/g + 10⁸ fungi/g + 10⁵ tardigrades/L. Rhizosphere (root zone): 10–100× higher density. Primary producers (photoautotrophs): foundation. Decomposers (heterotrophs): recycle. Predators (tardigrades, nematodes): regulate bacterial biomass. Remove tardigrades → bacterial monoculture → nitrogen lock-up → plant productivity drop 30–60%. Tardigrade = keystone predator in soil."},
        ])}
      </>)}

      {sec("07","Quantitative Finance · MSDD Market Cascade · Black-Scholes Vol Surface · Bayesian Portfolio",V.gold,<>
        {P("The same mathematical structure that describes Mutual Shared Destructional Decoherence in biological ecosystems applies to financial markets with striking precision. A diversified portfolio is analogous to a multi-node biological network with low inter-node correlation — each asset class (equities, bonds, commodities, foreign exchange, crypto, real estate) behaves semi-independently, so that shocks to one node are absorbed rather than amplified. The pairwise correlation ρᵢⱼ between asset i and asset j plays the same role as the quantum coupling constant κ in the MSDD equation: when ρ is low (normal regime, ρ ≈ 0.1–0.3 between equities and bonds), the system is robust. When a systemic shock hits (2008 financial crisis, COVID March 2020, Black Monday 1987), correlations spike to ρ → 0.9 across all asset pairs simultaneously. This is the financial MSDD event: the collapse of cross-node diversity is autocatalytic. As prices fall, leveraged funds are margin-called, forced to sell across all positions, pushing correlations higher, which triggers more margin calls. The 2008 financial MSDD: equities fell 57%, bonds initially fell (risk-off selling), corporate credit spreads exploded, commodities collapsed, real estate (the original shock node) triggered the cascade. Maximum drawdown: S&P 500 lost 57% peak-to-trough over 17 months.")}
        {P("The Black-Scholes implied volatility surface provides the market's real-time Bayesian estimate of future uncertainty. For a European option with strike K and expiry T, implied volatility σ_impl(K,T) is the value that makes the Black-Scholes formula equal to the observed market price. In a world with log-normal returns and constant volatility (the original BS assumption), σ_impl would be flat across all strikes and maturities — a flat plane. In reality, the vol surface exhibits a 'smile' (higher implied vol for deep in-the-money and deep out-of-the-money options than at-the-money) and a 'term structure' (short-dated options have higher implied vol during crises, reflecting immediate uncertainty). During MSDD market events, the entire surface shifts up and distorts: the short-dated ATM vol jumps from ~16 (VIX in calm markets) to 80+ (VIX peak in March 2020: 82.7), and the smile steepens as the market prices in fat-tail scenarios. The Bayesian portfolio updating problem — given the current vol surface as prior, new market data as likelihood, what are the posterior optimal weights? — is solved at each rebalancing step using the Markowitz mean-variance framework as a Bayesian normal-normal conjugate update: posterior weights w* = argmax E[R] − (λ/2)·w'Σw, where Σ is the covariance matrix updated from options-implied correlations.")}
        <div style={{border:`1px solid ${V.dim}44`,borderRadius:8,padding:2,marginBottom:14}}>
          <QuantFinanceCanvas/>
        </div>
        {cards([
          {h:"MARKOWITZ PORTFOLIO",   col:V.gold,  d:"Modern Portfolio Theory (1952): w* = argmin w'Σw s.t. w'μ ≥ R_target. Efficient frontier: set of (σ,R) portfolios with max R for given σ. Sharpe ratio: S=(E[R]−rf)/σ. Tangency portfolio: max Sharpe. Key insight: diversification reduces σ without reducing E[R] proportionally — free lunch via negative correlation. MSDD destroys this: when ρ→1, Σ has no off-diagonal cancellation; all eigenvalues grow."},
          {h:"BLACK-SCHOLES MODEL",   col:V.blue,  d:"dS = μS dt + σS dW (geometric Brownian motion). Call price: C = S·N(d₁) − K·e^(−rT)·N(d₂). d₁=[ln(S/K)+(r+σ²/2)T]/(σ√T). d₂=d₁−σ√T. Greek: Δ=∂C/∂S, Γ=∂²C/∂S², Θ=∂C/∂t, Vega=∂C/∂σ. Vol surface σ(K,T) deviates from BS flat-vol assumption: smile (higher vol for OTM puts) + term structure (short-dated vol higher in crisis)."},
          {h:"VOLATILITY SMILE",      col:V.vio,   d:"Implied vol smile: σ(K) is U-shaped around ATM. Deep OTM puts: high σ_impl (tail risk premium — market prices crash probability above log-normal). Deep OTM calls: high σ_impl (lottery premium). Stochastic vol models (Heston, SABR) reproduce smile. During MSDD (2008, 2020): smile steepens → OTM put σ rises 3–5× → options hedging costs spike → delta-hedging fails → gamma losses compound losses."},
          {h:"BAYESIAN PORTFOLIO",    col:V.photon,d:"Black-Litterman model: start with CAPM prior (market-cap weights). Update with investor views (likelihood) via Bayes. Posterior: w* = (τΣ)⁻¹(τΣ·w_eq + P'Ω⁻¹Q). τ: scalar for prior confidence. P: views matrix. Ω: view uncertainty. Q: view returns. Result: posterior weights blend equilibrium with private signal in proportion to their relative precision (1/variance). MSDD risk: if views are themselves correlated during panic, posterior collapses to equal-weight."},
          {h:"FINANCIAL MSDD",        col:V.plasma,d:"Financial MSDD equation: dρᵢⱼ/dt = κ·(1−ρᵢⱼ)·P_stress, where P_stress = portfolio drawdown fraction. Critical threshold: when κ·P_stress > decay_rate, ρ→1 faster than risk management can respond. 2008 timeline: Day 0 (Lehman) → Day 3: ρ_EQ-BOND spikes 0.15→0.85 → Day 10: redemptions force selling → Day 20: all ρ→0.95. ALCC analogue: circuit breakers (trading halts) + central bank liquidity injection = ALCC protection signal."},
          {h:"ALCC IN FINANCE",       col:V.cyan,  d:"Market ALCC: central banks = COMMAND node. Interest rate cuts + QE = protection signal. Speed: Fed cuts rates in hours (2020). Effectiveness: depends on whether shock is liquidity or solvency crisis. Liquidity MSDD (2020 COVID): ALCC works — markets recovered fully in 5 months. Solvency MSDD (2008): ALCC slower — required TARP + stress tests + 3 years to recover. Tardigrade analogy: CAHS-D works for desiccation (liquidity); cannot prevent hyperthermia (solvency)."},
        ])}
      </>)}
    </div>
  );
}

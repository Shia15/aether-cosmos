import { useEffect, useRef } from "react";
import earthImg from "@assets/71D32D54-9572-4BFC-9895-CFC0D17D8022_1782493532725.png";

const V = {
  bg:"#04060E", aurora:"#00FFB2", gold:"#C8A030", blue:"#4488FF",
  vio:"#9966FF", amb:"#FF9933", rose:"#FF6699", plasma:"#FF4477",
  green:"#44CC77", dim:"#3A5060", ink:"#B8CCE8", fire:"#FF6622",
  shock:"#FFDD22", photon:"#00FFBB", cyan:"#22DDFF",
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

/* Layer definitions */
const LAYERS = [
  { name:"MAGNETOSPHERE", col:V.vio,   r:0.88, desc:"Shields Earth from solar wind, guides geomagnetic storms" },
  { name:"ATMOSPHERE",    col:V.cyan,  r:0.74, desc:"Jet streams, global circulation, weather, lightning" },
  { name:"HYDROSPHERE",   col:V.blue,  r:0.62, desc:"Ocean currents, thermohaline, rivers, glaciers" },
  { name:"LITHOSPHERE",   col:V.gold,  r:0.50, desc:"Tectonic plates, fault lines, mountain belts, volcanic arcs" },
  { name:"BIOSPHERE",     col:V.green, r:0.40, desc:"Mycorrhizal networks, coral reefs, migration corridors, food webs" },
];

const KNOTS = [
  { label:"Mountain Ranges", a: -90, col:V.gold  },
  { label:"Ocean Gyres",     a: -30, col:V.blue  },
  { label:"River Confluences",a: 30, col:V.cyan  },
  { label:"Polar Regions",   a: 90,  col:V.vio   },
  { label:"Caves & Karst",   a:150,  col:V.amb   },
];

function EarthCanvas(){
  const ref=useRef<HTMLCanvasElement>(null);
  const raf=useRef(0);
  useEffect(()=>{
    const cv=ref.current; if(!cv)return;
    const ctx=cv.getContext("2d")!;
    const W=cv.width, H=cv.height;
    const CX=W*0.5, CY=H*0.5;
    const BASE=Math.min(W,H)*0.36;
    let t=0;
    /* solar particles pool */
    const N_PART=70;
    type Pt={x:number;y:number;vx:number;vy:number;alpha:number;life:number;maxLife:number;col:string};
    const parts:Pt[]=[];
    const SUN_X=W*0.08, SUN_Y=H*0.12;
    function spawnParticle(){
      const angle=Math.random()*0.5+0.1;
      const speed=0.8+Math.random()*1.2;
      const maxL=60+Math.random()*120;
      parts.push({
        x:SUN_X+Math.random()*24-12,
        y:SUN_Y+Math.random()*24-12,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed,
        alpha:0.9,life:0,maxLife:maxL,
        col:Math.random()<0.5?V.gold:V.fire,
      });
    }
    for(let i=0;i<N_PART;i++){spawnParticle();}
    /* ring particles */
    type RPt={ring:number;angle:number;speed:number};
    const ringParts:RPt[]=LAYERS.map((_,ri)=>({
      ring:ri, angle:Math.random()*Math.PI*2, speed:(0.4+Math.random()*0.6)*(Math.random()<0.5?1:-1)
    }));
    for(let i=0;i<12;i++){
      const ri=Math.floor(Math.random()*LAYERS.length);
      ringParts.push({ring:ri,angle:Math.random()*Math.PI*2,speed:(0.3+Math.random()*0.8)*(Math.random()<0.5?1:-1)});
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      ctx.fillStyle=V.bg; ctx.fillRect(0,0,W,H);
      /* ── Sun ── */
      const sgrd=ctx.createRadialGradient(SUN_X,SUN_Y,0,SUN_X,SUN_Y,36);
      sgrd.addColorStop(0,V.shock+"FF");
      sgrd.addColorStop(0.4,V.amb+"CC");
      sgrd.addColorStop(1,V.fire+"00");
      ctx.beginPath(); ctx.arc(SUN_X,SUN_Y,36,0,Math.PI*2);
      ctx.fillStyle=sgrd; ctx.fill();
      /* corona pulse */
      const cr=36+8*Math.sin(t*2);
      ctx.beginPath(); ctx.arc(SUN_X,SUN_Y,cr,0,Math.PI*2);
      ctx.strokeStyle=V.shock+ha(50+40*Math.sin(t*2)); ctx.lineWidth=1.5; ctx.stroke();
      /* ── Solar wind particles ── */
      for(let i=parts.length-1;i>=0;i--){
        const p=parts[i];
        p.x+=p.vx; p.y+=p.vy; p.life++;
        const pr=p.life/p.maxLife;
        p.alpha=1-pr;
        /* deflect near magnetosphere */
        const dist=Math.hypot(p.x-CX,p.y-CY);
        const magR=BASE*LAYERS[0].r;
        if(dist<magR*1.05){
          const nx=(p.x-CX)/dist, ny=(p.y-CY)/dist;
          p.vx-=nx*0.12; p.vy-=ny*0.12;
        }
        if(p.life>=p.maxLife){parts.splice(i,1);spawnParticle();continue;}
        ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2);
        ctx.fillStyle=p.col+ha(p.alpha*200); ctx.fill();
      }
      /* ── Layer rings ── */
      LAYERS.forEach((layer,li)=>{
        const R=BASE*layer.r;
        /* glow */
        const grd=ctx.createRadialGradient(CX,CY,R-4,CX,CY,R+8);
        grd.addColorStop(0,layer.col+ha(30+20*Math.sin(t*1.2+li)));
        grd.addColorStop(1,layer.col+"00");
        ctx.beginPath(); ctx.arc(CX,CY,R+6,0,Math.PI*2);
        ctx.strokeStyle=grd; ctx.lineWidth=10; ctx.stroke();
        /* ring */
        ctx.beginPath(); ctx.arc(CX,CY,R,0,Math.PI*2);
        ctx.strokeStyle=layer.col+ha(60+40*Math.sin(t*0.8+li*0.5));
        ctx.lineWidth=1.2; ctx.setLineDash([6,3]); ctx.stroke();
        ctx.setLineDash([]);
      });
      /* ── Ring particles (energy flow) ── */
      ringParts.forEach(rp=>{
        rp.angle+=rp.speed*0.008;
        const layer=LAYERS[rp.ring];
        const R=BASE*layer.r;
        const x=CX+R*Math.cos(rp.angle), y=CY+R*Math.sin(rp.angle);
        if(!isFinite(x)||!isFinite(y))return;
        ctx.beginPath(); ctx.arc(x,y,2.5,0,Math.PI*2);
        ctx.fillStyle=layer.col+ha(180); ctx.fill();
        /* trail */
        for(let ti=1;ti<=4;ti++){
          const pa=rp.angle-rp.speed*0.008*ti*4;
          const tx2=CX+R*Math.cos(pa), ty2=CY+R*Math.sin(pa);
          if(!isFinite(tx2)||!isFinite(ty2))continue;
          ctx.beginPath(); ctx.arc(tx2,ty2,1.5-ti*0.25,0,Math.PI*2);
          ctx.fillStyle=layer.col+ha(120-ti*25); ctx.fill();
        }
      });
      /* ── Natural Knots ── */
      KNOTS.forEach(kn=>{
        const rad=(kn.a/180)*Math.PI;
        const KR=BASE*0.95;
        const kx=CX+KR*Math.cos(rad), ky=CY+KR*Math.sin(rad);
        if(!isFinite(kx)||!isFinite(ky))return;
        /* pulse */
        const pulse=1+0.2*Math.sin(t*1.5+kn.a);
        ctx.beginPath(); ctx.arc(kx,ky,7*pulse,0,Math.PI*2);
        ctx.fillStyle=kn.col+ha(100+60*Math.sin(t*1.5+kn.a)); ctx.fill();
        ctx.beginPath(); ctx.arc(kx,ky,12*pulse,0,Math.PI*2);
        ctx.strokeStyle=kn.col+ha(60); ctx.lineWidth=1; ctx.stroke();
        /* label */
        ctx.fillStyle=kn.col; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
        const lx=CX+(KR+22)*Math.cos(rad), ly=CY+(KR+22)*Math.sin(rad);
        if(isFinite(lx)&&isFinite(ly)) ctx.fillText(kn.label,lx,ly);
      });
      /* ── Earth core ── */
      const egrd=ctx.createRadialGradient(CX,CY,0,CX,CY,BASE*0.36);
      egrd.addColorStop(0,V.gold+"AA");
      egrd.addColorStop(0.35,V.fire+"66");
      egrd.addColorStop(0.7,V.blue+"55");
      egrd.addColorStop(1,V.green+"33");
      ctx.beginPath(); ctx.arc(CX,CY,BASE*0.36,0,Math.PI*2);
      ctx.fillStyle=egrd; ctx.fill();
      ctx.strokeStyle=V.aurora+ha(60+40*Math.sin(t)); ctx.lineWidth=1.5; ctx.stroke();
      /* rotating coherence lines */
      for(let i=0;i<6;i++){
        const a=t*0.25+i*(Math.PI/3);
        ctx.beginPath();
        ctx.moveTo(CX,CY);
        ctx.lineTo(CX+BASE*0.34*Math.cos(a),CY+BASE*0.34*Math.sin(a));
        ctx.strokeStyle=V.aurora+ha(20); ctx.lineWidth=0.8; ctx.stroke();
      }
      /* ── Layer labels ── */
      LAYERS.forEach((layer,li)=>{
        const R=BASE*layer.r;
        const labelAngle=-Math.PI*0.18-li*0.08;
        const lx=CX+R*Math.cos(labelAngle)-8;
        const ly=CY+R*Math.sin(labelAngle)-4;
        if(!isFinite(lx)||!isFinite(ly))return;
        ctx.fillStyle=layer.col+ha(180);
        ctx.font=`7px ${MONO}`; ctx.textAlign="right";
        ctx.fillText(layer.name,lx,ly);
      });
      /* ── Energy flow label ── */
      ctx.fillStyle=V.ink+"33"; ctx.font=`7px ${MONO}`; ctx.textAlign="center";
      ctx.fillText("SOLAR ENERGY → MAGNETOSPHERE → ATMOSPHERE → HYDROSPHERE → LITHOSPHERE → BIOSPHERE → HUMANITY",CX,H-10);
      t+=0.012;
    }
    function loop(){draw();raf.current=requestAnimationFrame(loop);}
    loop();
    return()=>cancelAnimationFrame(raf.current);
  },[]);
  return <canvas ref={ref} width={860} height={440}
    style={{width:"100%",height:440,display:"block",borderRadius:"0 0 4px 4px"}}/>;
}

const PLANETARY_SYSTEMS = [
  { name:"LITHOSPHERE", sub:"Solid Earth", col:V.gold,
    items:["Tectonic plate boundaries","Fault lines","Mountain belts","Volcanic arcs","Rift valleys"] },
  { name:"HYDROSPHERE", sub:"Waters of Earth", col:V.blue,
    items:["Ocean currents","Thermohaline circulation","Rivers & basins","Aquifers","Glaciers"] },
  { name:"ATMOSPHERE", sub:"Air & Weather", col:V.cyan,
    items:["Jet streams","Global circulation cells","Hadley/Ferrel/Polar cells","Lightning networks","Weather systems"] },
  { name:"MAGNETOSPHERE", sub:"Magnetic Field", col:V.vio,
    items:["Earth's magnetic field","Polar auroral ovals","Radiation belts","Geomagnetic storms"] },
];

const BIO_NETWORKS = [
  { name:"Mycorrhizal Networks",  col:V.green, note:"Fungal networks connect plants and ecosystems sharing nutrients and signals." },
  { name:"Coral Reef Systems",    col:V.rose,  note:"Reefs create thriving habitats and protect coastal regions." },
  { name:"Migration Corridors",   col:V.aurora,note:"Animals follow ancient paths across land, sea, and air." },
  { name:"Pollination Networks",  col:V.gold,  note:"Plants, insects, and animals co-create life-sustaining cycles." },
  { name:"Ocean Food Webs",       col:V.blue,  note:"A vast web of life sustained by ocean connections." },
];

const ANCIENT_SITES = [
  ["Stonehenge",          V.aurora, "Solstices · Lunar cycles"],
  ["Great Pyramid of Giza",V.gold,  "Orion alignment · Cardinal directions"],
  ["Göbekli Tepe",        V.vio,   "Solar alignments · Stellar observations"],
  ["Machu Picchu",        V.green, "Solar & seasonal alignments"],
  ["Carnac Stones",       V.cyan,  "Lunar cycles · Earth energies"],
  ["Chaco Canyon",        V.rose,  "Solar standstills · Lunar cycles"],
];

const GEO_GRIDS = [
  "Ley Lines","Earth Grid Systems","Hartmann Grid",
  "Curry Grid","Becker–Hagens Grid","Icosahedral Earth Grid","Dragon Lines",
];

export default function EarthLivingSystemPage() {
  return (
    <div style={{background:V.bg,minHeight:"100vh",color:V.ink,fontFamily:MONO,paddingBottom:80}}>
      {/* tags */}
      <div style={{padding:"10px 24px",borderBottom:`1px solid ${V.dim}44`,display:"flex",flexWrap:"wrap",gap:4}}>
        {[["EARTH · LIVING SYSTEM",V.aurora],["PLANETARY LAYERS",V.blue],["BIOLOGICAL NETWORKS",V.green],
          ["ANCIENT STRUCTURES",V.gold],["GEOMETRIC GRIDS",V.vio],["NATURAL KNOTS",V.rose],["AETHER",V.cyan]
        ].map(([l,c])=><Tag key={l} l={l} c={c}/>)}
      </div>
      {/* header */}
      <div style={{padding:"44px 32px 20px",maxWidth:980,margin:"0 auto"}}>
        <div style={{fontFamily:MONO,fontSize:10,color:V.aurora,letterSpacing:"0.2em",marginBottom:12}}>
          LIVE SIMULATION · EARTH AS A LIVING INTERCONNECTED SYSTEM
        </div>
        <h1 style={{fontFamily:DISP,fontSize:"clamp(20px,3.8vw,42px)",color:V.ink,margin:"0 0 10px",lineHeight:1.1}}>
          Earth: A Living,<br/>
          <span style={{color:V.aurora}}>Interconnected System</span>
        </h1>
        <p style={{fontFamily:SERIF,fontSize:15,color:V.ink+"99",lineHeight:1.75,maxWidth:720,margin:"0 0 6px"}}>
          All structures are tied and knotted energetically. Earth is a web of interacting energies and systems.
          From the cosmic to the core, every structure, seen and unseen, is connected in a continuous flow.
        </p>
        <p style={{fontFamily:DISP,fontSize:13,color:V.aurora+"88",letterSpacing:"0.15em",margin:0}}>
          OBSERVE · UNDERSTAND · RESPECT · ALIGN
        </p>
      </div>
      <div style={{maxWidth:980,margin:"0 auto",padding:"0 32px"}}>
        {/* canvas */}
        <div style={{border:`1px solid ${V.dim}`,borderRadius:"4px 4px 0 0",overflow:"hidden"}}>
          <div style={{padding:"4px 12px",background:V.dim+"22",borderBottom:`1px solid ${V.dim}44`,
            fontFamily:MONO,fontSize:8,color:V.aurora+"66",letterSpacing:"0.12em"}}>
            LIVE · CONCENTRIC LAYER MODEL · SOLAR WIND · RING ENERGY FLOW · NATURAL KNOTS
          </div>
          <EarthCanvas/>
        </div>
        {/* AETHER Architectural View strip */}
        <div style={{marginTop:20,padding:"14px 18px",background:V.aurora+"08",
          border:`1px solid ${V.aurora}22`,borderRadius:4}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.aurora,letterSpacing:"0.16em",marginBottom:10}}>
            AETHER ARCHITECTURAL VIEW · ALL LAYERS COMMUNICATE · ALL ARE INTERDEPENDENT
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
            {[
              [V.shock,"☀","Solar Energy"],
              [V.vio,"⊕","Magnetosphere"],
              [V.cyan,"〜","Atmosphere"],
              [V.blue,"≋","Hydrosphere"],
              [V.gold,"⌇","Lithosphere"],
              [V.green,"⊛","Biosphere"],
              [V.rose,"⚡","Human Civilization"],
              [V.aurora,"◈","Conscious Observation"],
            ].map(([col,icon,label],i,arr)=>(
              <span key={label} style={{display:"flex",alignItems:"center",gap:4}}>
                <span style={{color:col,fontSize:12}}>{icon}</span>
                <span style={{fontFamily:SERIF,fontSize:12,color:col}}>{label}</span>
                {i<arr.length-1&&<span style={{color:V.dim,fontSize:10}}> → </span>}
              </span>
            ))}
          </div>
          <div style={{marginTop:8,fontFamily:SERIF,fontSize:12,color:V.ink+"55",lineHeight:1.6}}>
            Energy flows · Information flows · Life flows · Consciousness witnesses
          </div>
        </div>
        {/* Section 1: Planetary Systems */}
        <div style={{margin:"40px 0 0"}}>
          <div style={{borderLeft:`3px solid ${V.aurora}`,paddingLeft:14,marginBottom:16}}>
            <div style={{fontFamily:MONO,fontSize:10,color:V.aurora,letterSpacing:"0.18em"}}>
              1 · PLANETARY SYSTEMS (SCIENCE)
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {PLANETARY_SYSTEMS.map(ps=>(
              <div key={ps.name} style={{padding:14,background:ps.col+"0A",
                border:`1px solid ${ps.col}33`,borderRadius:4}}>
                <div style={{fontFamily:MONO,fontSize:8,color:ps.col,letterSpacing:"0.14em",marginBottom:2}}>
                  {ps.name}
                </div>
                <div style={{fontFamily:SERIF,fontSize:11,color:V.ink+"55",marginBottom:8}}>{ps.sub}</div>
                {ps.items.map(it=>(
                  <div key={it} style={{display:"flex",gap:6,marginBottom:4}}>
                    <span style={{color:ps.col,fontSize:8,marginTop:2}}>·</span>
                    <span style={{fontFamily:SERIF,fontSize:12,color:V.ink+"88",lineHeight:1.5}}>{it}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        {/* Section 2: Biological Networks */}
        <div style={{margin:"36px 0 0"}}>
          <div style={{borderLeft:`3px solid ${V.green}`,paddingLeft:14,marginBottom:16}}>
            <div style={{fontFamily:MONO,fontSize:10,color:V.green,letterSpacing:"0.18em"}}>
              2 · BIOLOGICAL NETWORKS (LIFE)
            </div>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
            {BIO_NETWORKS.map(bn=>(
              <div key={bn.name} style={{flex:"1 1 180px",padding:13,background:bn.col+"0A",
                border:`1px solid ${bn.col}33`,borderRadius:4}}>
                <div style={{fontFamily:MONO,fontSize:8,color:bn.col,letterSpacing:"0.12em",marginBottom:6}}>
                  {bn.name.toUpperCase()}
                </div>
                <div style={{fontFamily:SERIF,fontSize:12,color:V.ink+"77",lineHeight:1.6}}>{bn.note}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Section 3 & 4 side by side */}
        <div style={{margin:"36px 0 0",display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
          {/* Ancient Sites */}
          <div>
            <div style={{borderLeft:`3px solid ${V.gold}`,paddingLeft:14,marginBottom:16}}>
              <div style={{fontFamily:MONO,fontSize:10,color:V.gold,letterSpacing:"0.18em"}}>
                3 · ANCIENT HUMAN STRUCTURES
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {ANCIENT_SITES.map(([name,col,note])=>(
                <div key={name} style={{padding:"10px 12px",background:col+"0A",
                  border:`1px solid ${col}22`,borderRadius:4,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div style={{fontFamily:DISP,fontSize:11,color:col}}>{name}</div>
                  <div style={{fontFamily:SERIF,fontSize:10,color:V.ink+"55",textAlign:"right",lineHeight:1.4}}>{note}</div>
                </div>
              ))}
              <div style={{fontFamily:SERIF,fontSize:10,color:V.ink+"33",fontStyle:"italic",lineHeight:1.5,padding:"6px 0"}}>
                Astronomical alignments are well documented. A global energy grid connection is hypothetical and not proven by science.
              </div>
            </div>
          </div>
          {/* Geometric Grids */}
          <div>
            <div style={{borderLeft:`3px solid ${V.vio}`,paddingLeft:14,marginBottom:16}}>
              <div style={{fontFamily:MONO,fontSize:10,color:V.vio,letterSpacing:"0.18em"}}>
                4 · GEOMETRIC EARTH STRUCTURES
              </div>
            </div>
            <div style={{padding:14,background:V.vio+"08",border:`1px solid ${V.vio}22`,borderRadius:4,marginBottom:10}}>
              <div style={{fontFamily:SERIF,fontSize:12,color:V.ink+"77",lineHeight:1.7,marginBottom:12}}>
                Traditional and esoteric maps describe subtle grid systems that may underlie Earth's energy.
              </div>
              {GEO_GRIDS.map((g,i)=>(
                <div key={g} style={{display:"flex",gap:8,marginBottom:6}}>
                  <span style={{color:LAYERS[i%LAYERS.length].col,fontSize:9}}>◈</span>
                  <span style={{fontFamily:SERIF,fontSize:13,color:V.ink+"88"}}>{g}</span>
                </div>
              ))}
              <div style={{marginTop:10,fontFamily:SERIF,fontSize:10,color:V.ink+"33",fontStyle:"italic",lineHeight:1.5}}>
                These models are symbolic frameworks and not recognized by mainstream science.
              </div>
            </div>
          </div>
        </div>
        {/* Section 5: Natural Knots */}
        <div style={{margin:"36px 0 0"}}>
          <div style={{borderLeft:`3px solid ${V.rose}`,paddingLeft:14,marginBottom:16}}>
            <div style={{fontFamily:MONO,fontSize:10,color:V.rose,letterSpacing:"0.18em"}}>
              5 · NATURAL KNOTS — WHERE SYSTEMS CONVERGE
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10}}>
            {[
              ["Mountain Ranges",V.gold,"Uplift, weather, and water sources"],
              ["Volcanoes",V.fire,"Heat, minerals, and transformation"],
              ["River Confluences",V.blue,"Flow, sediment, and fertility"],
              ["Delta Systems",V.green,"Nutrient exchange land & sea"],
              ["Ocean Gyres",V.cyan,"Heat distribution and circulation"],
              ["Polar Regions",V.vio,"Climate regulation and reflection"],
              ["Caves & Karst",V.ink,"Subterranean waters and minerals"],
              ["Impact Basins",V.rose,"Ancient events, lasting imprints"],
            ].map(([name,col,desc])=>(
              <div key={name} style={{padding:"12px 10px",background:col+"0A",
                border:`1px solid ${col}33`,borderRadius:4,textAlign:"center"}}>
                <div style={{fontFamily:MONO,fontSize:7,color:col,letterSpacing:"0.1em",marginBottom:6}}>
                  {name}
                </div>
                <div style={{fontFamily:SERIF,fontSize:10,color:V.ink+"55",lineHeight:1.5}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
        {/* Great Interconnection footer */}
        <div style={{margin:"36px 0 0",padding:20,background:V.aurora+"06",
          border:`1px solid ${V.aurora}22`,borderRadius:4}}>
          <div style={{fontFamily:DISP,fontSize:14,color:V.aurora,marginBottom:10}}>THE GREAT INTERCONNECTION</div>
          <p style={{fontFamily:SERIF,fontSize:14,color:V.ink+"88",lineHeight:1.75,margin:0}}>
            From the cosmic to the core, from the visible to the subtle, Earth is a knotted, living network
            of energy, matter, and information. We are part of this web, not separate from it.
          </p>
        </div>
        {/* Reference image */}
        <div style={{margin:"40px 0 0"}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.dim,letterSpacing:"0.16em",marginBottom:12}}>
            REFERENCE SOURCE MATERIAL
          </div>
          <img src={earthImg} alt="Earth: A Living, Interconnected System"
            style={{width:"100%",borderRadius:6,border:`1px solid ${V.dim}44`,display:"block"}}/>
        </div>
        {/* cross-links */}
        <div style={{margin:"36px 0 0"}}>
          <div style={{fontFamily:MONO,fontSize:9,color:V.dim,letterSpacing:"0.16em",marginBottom:12}}>
            RELATED SYSTEMS
          </div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
            {[["/planetary-neural","Planetary-Neural Cascade",V.vio],
              ["/gut-brain","Gut-Brain Axis",V.blue],
              ["/stacked-rings","Stacked Rings Conjecture",V.aurora],
              ["/lunar-coherence","Lunar Coherence",V.cyan],
              ["/portal-restoration","Portal Restoration",V.gold],
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

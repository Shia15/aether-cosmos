import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";

const INK="#1a1810",PAPER="#f2ede4",PAPER2="#ece6da",PAPER3="#e4ddd0";
const GOLD="#8a6e2f",GOLD2="#b8922e",RUST="#8b3a2a",MOSS="#3a5c3a",DUSK="#4a3a6a";
const FADE="rgba(26,24,16,0.38)",FADE2="rgba(26,24,16,0.6)",BORDER="rgba(138,110,47,0.22)";

type SigKey="sleep"|"energy"|"stress"|"focus"|"atmo"|"social";
const DIALS:{key:SigKey;label:string;color:string}[]=[
  {key:"sleep",label:"Sleep quality",color:MOSS},
  {key:"energy",label:"Body energy",color:MOSS},
  {key:"stress",label:"Stress load (higher = more stress)",color:RUST},
  {key:"focus",label:"Mental focus",color:GOLD2},
  {key:"atmo",label:"Atmospheric / weather ease",color:DUSK},
  {key:"social",label:"Social field coherence",color:RUST},
];
const TAGS=["Friction in network","Collective tension","High resonance","Alignment felt","Noise / confusion","Geomagnetic storm","Storm front","Clear sky / stable","Full moon"];

function rgbFor(c:number){return c>0.7?MOSS:c>0.45?GOLD2:RUST;}

function CoherenceOrb({coupled,body,planet,social}:{coupled:number;body:number;planet:number;social:number}){
  const cvRef=useRef<HTMLCanvasElement|null>(null);
  const ref=useRef({coupled,body,planet,social});
  ref.current={coupled,body,planet,social};
  useEffect(()=>{
    const cv=cvRef.current; if(!cv)return;
    const ctx=cv.getContext("2d"); if(!ctx)return;
    let raf=0,t=0;
    const loop=()=>{
      const dpr=Math.min(2,window.devicePixelRatio||1);
      const size=cv.clientWidth||320;
      cv.width=Math.round(size*dpr); cv.height=Math.round(size*dpr);
      const W=cv.width,H=cv.height,cx=W/2,cy=H/2,R=W*0.32;
      ctx.clearRect(0,0,W,H);
      const {coupled:c,body:b,planet:p,social:s}=ref.current;
      t+=0.008;
      for(let i=3;i>0;i--){
        ctx.beginPath(); ctx.arc(cx,cy,R*(0.9+i*0.18),0,Math.PI*2);
        ctx.strokeStyle=`rgba(138,110,47,${0.04*c*(4-i)})`; ctx.lineWidth=1*dpr; ctx.stroke();
      }
      const domains=[{c:b,col:"58,92,58",a:-Math.PI/2},{c:p,col:"74,58,106",a:Math.PI/6},{c:s,col:"139,58,42",a:Math.PI*5/6}];
      domains.forEach((d,i)=>{
        ctx.beginPath(); ctx.arc(cx,cy,R*1.08+i*2*dpr,d.a,d.a+Math.PI*2/3*0.85);
        ctx.strokeStyle=`rgba(${d.col},${0.15+d.c*0.35})`; ctx.lineWidth=3*dpr; ctx.stroke();
      });
      const r=R*(0.96+0.04*Math.sin(t*1.8));
      const base=c>0.7?"58,92,58":c>0.45?"184,146,46":"139,58,42";
      const grad=ctx.createRadialGradient(cx-r*0.25,cy-r*0.25,r*0.05,cx,cy,r);
      grad.addColorStop(0,`rgba(${base},${0.18+c*0.15})`);
      grad.addColorStop(0.6,`rgba(${base},${0.08+c*0.08})`);
      grad.addColorStop(1,`rgba(${base},0.01)`);
      ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fillStyle=grad; ctx.fill();
      ctx.beginPath();
      for(let i=0;i<=120;i++){
        const a=(i/120)*Math.PI*2;
        const wave=1+0.022*Math.sin(a*3+t*2.1)+0.012*Math.sin(a*7-t*1.3);
        const xp=cx+Math.cos(a)*r*wave, yp=cy+Math.sin(a)*r*wave;
        if(i===0)ctx.moveTo(xp,yp); else ctx.lineTo(xp,yp);
      }
      ctx.closePath(); ctx.strokeStyle=`rgba(${base},${0.25+c*0.3})`; ctx.lineWidth=1.2*dpr; ctx.stroke();
      ctx.strokeStyle=`rgba(138,110,47,${0.12+c*0.15})`; ctx.lineWidth=0.7*dpr;
      ctx.beginPath();
      ctx.moveTo(cx-r*0.45,cy); ctx.lineTo(cx+r*0.45,cy);
      ctx.moveTo(cx,cy-r*0.45); ctx.lineTo(cx,cy+r*0.45); ctx.stroke();
      const phi=1.6180339887, k=Math.log(phi)/(Math.PI/2);
      ctx.beginPath(); let first=true;
      for(let i=0;i<80;i++){
        const theta=i*0.12+t*0.3;
        const sr=5*dpr*Math.exp(k*theta);
        if(sr>r*0.7)break;
        const sx=cx+Math.cos(theta)*sr, sy=cy+Math.sin(theta)*sr;
        if(first)ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy); first=false;
      }
      ctx.strokeStyle=`rgba(138,110,47,${0.08+c*0.1})`; ctx.lineWidth=0.7*dpr; ctx.stroke();
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return()=>cancelAnimationFrame(raf);
  },[]);
  return <canvas ref={cvRef} style={{width:"100%",aspectRatio:"1",display:"block"}}/>;
}

export default function DailyRitualPage(){
  const [mode,setMode]=useState<"journal"|"structured"|"voice">("structured");
  const [sig,setSig]=useState<Record<SigKey,number>>({sleep:5,energy:5,stress:5,focus:5,atmo:5,social:5});
  const [tags,setTags]=useState<Set<string>>(new Set());
  const [text,setText]=useState("");
  const [history,setHistory]=useState<{id:number;date:string;c:number}[]>([]);

  const extract=useCallback((t:string)=>{
    const s=t.toLowerCase();
    const score=(ws:string[])=>ws.filter(w=>s.includes(w)).length/ws.length;
    const body=score(["tired","exhausted","pain","headache","energized","rested","body","sleep","woke","breath"]);
    const planet=score(["weather","rain","storm","sun","moon","wind","cold","hot","pressure","sky","clouds"]);
    const social=score(["people","conversation","conflict","tension","connected","alone","friction","meeting","message"]);
    setSig(prev=>({...prev,
      energy:body>0?Math.max(0,Math.min(10,Math.round(5+(body-0.5)*6))):prev.energy,
      atmo:planet>0?Math.max(0,Math.min(10,Math.round(5+(planet-0.5)*6))):prev.atmo,
      social:social>0?Math.max(0,Math.min(10,Math.round(5+(social-0.5)*6))):prev.social,
    }));
  },[]);

  const bodyC=(sig.sleep/10)*0.3+(sig.energy/10)*0.3+(1-sig.stress/10)*0.2+(sig.focus/10)*0.2;
  let planetC=sig.atmo/10;
  if(tags.has("Geomagnetic storm"))planetC*=0.75;
  if(tags.has("Storm front"))planetC*=0.85;
  if(tags.has("Clear sky / stable"))planetC=Math.min(1,planetC*1.1);
  if(tags.has("Full moon"))planetC*=0.9;
  let socialRaw=sig.social/10;
  if(tags.has("Friction in network"))socialRaw*=0.7;
  if(tags.has("Collective tension"))socialRaw*=0.75;
  if(tags.has("High resonance"))socialRaw=Math.min(1,socialRaw*1.2);
  if(tags.has("Alignment felt"))socialRaw=Math.min(1,socialRaw*1.15);
  if(tags.has("Noise / confusion"))socialRaw*=0.8;
  const socialC=Math.max(0,Math.min(1,socialRaw));
  const coupled=Math.pow(Math.max(1e-6,bodyC*planetC*socialC),1/3);

  const narrative=coupled>=0.8?"Strong alignment across all three fields. The system is close to its natural trajectory."
    :coupled>=0.6?"Partial coherence — one or more domains pulling against the field. Worth mapping where the gap lives."
    :coupled>=0.4?"Significant incoherence detected. This is information, not failure. The pattern is telling you something."
    :"Deep misalignment across the coupled field. Rest, reduce input, let the system settle before acting.";

  const dateStr=new Date().toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"});

  const toggleTag=(t:string)=>setTags(prev=>{const n=new Set(prev); n.has(t)?n.delete(t):n.add(t); return n;});
  const record=()=>{
    const d=new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"});
    setHistory(prev=>[{id:Date.now(),date:d,c:coupled},...prev].slice(0,14));
  };

  const bar=(label:string,v:number,col:string)=>(
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:FADE2,minWidth:130}}>{label}</span>
      <div style={{flex:1,height:6,background:"rgba(26,24,16,0.08)",borderRadius:3,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${v*100}%`,background:col,borderRadius:3,transition:"width .3s"}}/>
      </div>
      <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:GOLD2,minWidth:34,textAlign:"right"}}>{(v*100).toFixed(0)}%</span>
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:PAPER,color:INK,fontFamily:"'Lora',Georgia,serif"}}>
      <div style={{maxWidth:1080,margin:"0 auto",display:"grid",gridTemplateColumns:"1fr 360px",gap:0,minHeight:"100vh"}}
        className="ritual-grid">
        {/* LEFT — entry */}
        <div style={{padding:"40px 36px",borderRight:`1px solid ${BORDER}`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"0.18em",color:FADE,textTransform:"uppercase"}}>{dateStr}</div>
            <div style={{fontStyle:"italic",fontSize:13,color:GOLD,letterSpacing:"0.08em"}}>AETHER · daily sensing ritual</div>
          </div>
          <div style={{display:"flex",gap:0,marginBottom:22,borderBottom:`1px solid ${BORDER}`}}>
            {(["journal","structured","voice"] as const).map(m=>(
              <button key={m} onClick={()=>setMode(m)} style={{
                fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",
                color:mode===m?GOLD2:FADE,padding:"6px 16px 6px 0",cursor:"pointer",background:"none",
                border:"none",borderBottom:`1.5px solid ${mode===m?GOLD2:"transparent"}`,marginBottom:-1}}>{m}</button>
            ))}
          </div>

          {mode==="structured"&&(
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {DIALS.map(d=>(
                <div key={d.key}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:FADE2,marginBottom:5}}>
                    <span>{d.label}</span>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:GOLD2}}>{sig[d.key]}</span>
                  </div>
                  <input type="range" min={0} max={10} value={sig[d.key]}
                    onChange={e=>setSig(prev=>({...prev,[d.key]:parseInt(e.target.value)}))}
                    style={{width:"100%",accentColor:d.color}}/>
                </div>
              ))}
              <div style={{marginTop:8}}>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:FADE,borderBottom:`1px solid ${BORDER}`,paddingBottom:5,marginBottom:10}}>Field markers</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
                  {TAGS.map(t=>(
                    <button key={t} onClick={()=>toggleTag(t)} style={{
                      fontFamily:"'DM Mono',monospace",fontSize:10,padding:"5px 11px",borderRadius:14,cursor:"pointer",
                      border:`1px solid ${tags.has(t)?GOLD2:BORDER}`,
                      background:tags.has(t)?"rgba(184,146,46,0.15)":"transparent",
                      color:tags.has(t)?GOLD:FADE2}}>{t}</button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {(mode==="journal"||mode==="voice")&&(
            <div>
              <div style={{fontStyle:"italic",fontSize:15,color:FADE,lineHeight:1.7,marginBottom:14}}>
                {mode==="journal"?"Where is your attention today? What is the body sensing that the mind hasn't named yet?":"Say it the way it came. Don't organize. Let the pattern emerge from the words themselves."}
              </div>
              <textarea value={text} onChange={e=>{setText(e.target.value);extract(e.target.value);}}
                placeholder={mode==="journal"?"Begin writing…":"Just speak it out…"}
                style={{width:"100%",minHeight:220,fontFamily:"'Lora',serif",fontSize:15,lineHeight:1.85,color:INK,
                  background:"transparent",border:`1px solid ${BORDER}`,borderRadius:8,padding:14,outline:"none",resize:"vertical"}}/>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:FADE,textAlign:"right",marginTop:4}}>
                {text.trim().split(/\s+/).filter(Boolean).length} words · keyword extraction maps text → body/planet/social signals
              </div>
            </div>
          )}

          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:24,paddingTop:16,borderTop:`1px solid ${BORDER}`}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:FADE,lineHeight:1.5}}>This entry maps to the coherence field.<br/>No data leaves this space.</div>
            <button onClick={record} style={{fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"0.08em",
              padding:"9px 18px",borderRadius:6,cursor:"pointer",border:`1px solid ${GOLD2}`,background:"rgba(184,146,46,0.12)",color:GOLD}}>Record signal →</button>
          </div>
        </div>

        {/* RIGHT — coherence field */}
        <div style={{padding:"40px 28px",background:PAPER2}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:FADE,marginBottom:16}}>coherence field · today</div>
          <CoherenceOrb coupled={coupled} body={bodyC} planet={planetC} social={socialC}/>
          <div style={{textAlign:"center",margin:"12px 0 20px"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:40,fontWeight:400,color:rgbFor(coupled),lineHeight:1}}>{(coupled*100).toFixed(0)}</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.2em",color:FADE,margin:"6px 0"}}>SYSTEM COHERENCE</div>
            <div style={{fontStyle:"italic",fontSize:12,color:FADE2,lineHeight:1.6,padding:"0 8px"}}>{narrative}</div>
          </div>
          <div style={{marginBottom:20}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:FADE,marginBottom:10}}><span style={{color:GOLD2}}>DOMAINS</span> — coupled signal</div>
            {bar("Body / biological",bodyC,MOSS)}
            {bar("Planetary / weather",planetC,DUSK)}
            {bar("Social / relational",socialC,RUST)}
            <div style={{borderTop:`1px solid ${BORDER}`,marginTop:6,paddingTop:8}}>
              {bar("Coupled coherence",coupled,GOLD2)}
            </div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:FADE,marginTop:4}}>coupled = (body · planet · social)^⅓ — geometric mean; every domain must align</div>
          </div>
          <div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"0.14em",color:FADE,marginBottom:10}}><span style={{color:GOLD2}}>HISTORY</span> — signal over time</div>
            {history.length===0
              ?<div style={{fontStyle:"italic",fontSize:11,color:FADE,padding:"8px 0"}}>No entries yet. Begin sensing.</div>
              :history.map((e)=>(
                <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:FADE,minWidth:42}}>{e.date}</span>
                  <div style={{flex:1,height:5,background:"rgba(26,24,16,0.08)",borderRadius:3,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${e.c*100}%`,background:rgbFor(e.c)}}/>
                  </div>
                  <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,color:FADE2,minWidth:30,textAlign:"right"}}>{(e.c*100).toFixed(0)}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1080,margin:"0 auto",padding:"18px 36px 60px",display:"flex",flexWrap:"wrap",gap:14,fontFamily:"'DM Mono',monospace",fontSize:11}}>
        <Link href="/aether-flow" style={{color:GOLD,textDecoration:"none"}}>→ AETHER Flow</Link>
        <Link href="/aether-synthesis" style={{color:MOSS,textDecoration:"none"}}>→ AETHER Synthesis</Link>
        <Link href="/graph-map" style={{color:FADE2,textDecoration:"none"}}>→ Knowledge Graph</Link>
      </div>
      <style>{`@media(max-width:820px){.ritual-grid{grid-template-columns:1fr !important;}}`}</style>
    </div>
  );
}

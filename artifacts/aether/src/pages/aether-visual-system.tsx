import { useState, useEffect, useRef, useCallback } from "react";

// ── Scenario data ──────────────────────────────────────────────────────────────
const SCENARIOS = {
  crisis:      { dims:{ valence:-0.78, intensity:0.85, clarity:0.28, conflict:0.88, arousal:0.82, tension:0.79, focus:0.35, regulation:0.22 }, agent:"Infernia",  rx:"somatic reset · 90s box breathing",    routeState:"state: unstable",      routeCoh:"coherence: low",       routeAgent:"route: infernia", cohDesc:"fragmented — dimensions misaligned",       palette:{ hot:[5,35],    cold:[220,260], neutral:[15,30],  bg:[4,6,10]  } },
  anxiety:     { dims:{ valence:-0.55, intensity:0.88, clarity:0.44, conflict:0.55, arousal:0.92, tension:0.71, focus:0.42, regulation:0.31 }, agent:"Infernia",  rx:"somatic release · breath anchor",     routeState:"state: racing",        routeCoh:"coherence: low-mid",   routeAgent:"route: infernia", cohDesc:"high arousal, weak regulation",            palette:{ hot:[30,60],   cold:[200,240], neutral:[45,55],  bg:[6,4,2]   } },
  dissociation:{ dims:{ valence:-0.18, intensity:0.12, clarity:0.14, conflict:0.22, arousal:0.09, tension:0.31, focus:0.18, regulation:0.44 }, agent:"Aletheia",  rx:"grounding sequence · 5-4-3-2-1",     routeState:"state: flat / absent",  routeCoh:"coherence: collapsed", routeAgent:"route: aletheia", cohDesc:"shutdown — near-zero activation",          palette:{ hot:[190,220], cold:[230,260], neutral:[200,215],bg:[3,4,8]   } },
  flow:        { dims:{ valence: 0.82, intensity:0.44, clarity:0.88, conflict:0.08, arousal:0.55, tension:0.18, focus:0.91, regulation:0.86 }, agent:"Reverie",   rx:"flow extension · state capture",      routeState:"state: coherent",      routeCoh:"coherence: high",      routeAgent:"route: reverie",  cohDesc:"unified — all dimensions aligned",         palette:{ hot:[140,170], cold:[180,210], neutral:[155,165],bg:[2,5,4]   } },
  grief:       { dims:{ valence:-0.88, intensity:0.62, clarity:0.38, conflict:0.44, arousal:0.28, tension:0.55, focus:0.32, regulation:0.29 }, agent:"Mnēsis",    rx:"memory capture · witness mode",       routeState:"state: collapsed",     routeCoh:"coherence: mid",       routeAgent:"route: mnesis",   cohDesc:"low-energy, high valence displacement",    palette:{ hot:[260,290], cold:[230,250], neutral:[270,280],bg:[4,3,8]   } },
} as const;
type ScenarioKey = keyof typeof SCENARIOS;

const DIM_NAMES = ["valence","intensity","clarity","conflict","arousal","tension","focus","regulation"] as const;
type DimName = typeof DIM_NAMES[number];
const DIM_HUE_OFFSETS: Record<DimName, number> = { valence:0, intensity:20, clarity:40, conflict:-20, arousal:10, tension:-10, focus:30, regulation:50 };

interface Palette { hot:[number,number]; cold:[number,number]; neutral:[number,number]; bg:[number,number,number]; }
interface DimState { [k: string]: number; }

const LAYER_IDS = ["reflection","heatmap","glyph","motion","coherence","text"] as const;
type LayerId = typeof LAYER_IDS[number];
const LAYER_LABELS: Record<LayerId,string> = { reflection:"Reflection", heatmap:"Body Field", glyph:"State Glyph", motion:"Motion", coherence:"Coherence", text:"Text" };

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }
function lerpPalette(a: Palette, b: Palette, t: number): Palette {
  return {
    hot:    [lerp(a.hot[0],    b.hot[0],    t), lerp(a.hot[1],    b.hot[1],    t)],
    cold:   [lerp(a.cold[0],   b.cold[0],   t), lerp(a.cold[1],   b.cold[1],   t)],
    neutral:[lerp(a.neutral[0],b.neutral[0],t), lerp(a.neutral[1],b.neutral[1],t)],
    bg:     [lerp(a.bg[0],     b.bg[0],     t), lerp(a.bg[1],     b.bg[1],     t), lerp(a.bg[2], b.bg[2], t)],
  };
}
function noise2(x: number, y: number, t: number) {
  return (Math.sin(x*2.1+t*0.7)*Math.cos(y*1.8+t*0.5)+Math.sin(x*3.7+t*0.3)*Math.cos(y*4.1+t*0.9)+Math.cos(x*1.3+t*1.1)*Math.sin(y*2.9+t*0.4))/3;
}

function stateCoherence(cur: DimState) {
  const align = (1-cur.conflict)*cur.clarity*cur.regulation*(1-Math.abs(cur.valence-0.5)*0.5);
  const stab  = (1-Math.abs(cur.arousal-0.5))*cur.focus;
  return clamp(align*0.6+stab*0.4,0,1);
}

function segmentColor(activation: number, pal: Palette, coh: number) {
  const cohShift = coh * 30;
  if (activation < 0.3) {
    const h = lerp(pal.cold[0],pal.cold[1],activation/0.3)+cohShift;
    return { r:`hsla(${h},${20+activation*30}%,${30+activation*18}%,`, fill:activation*0.18+0.06 };
  }
  if (activation > 0.65) {
    const t2 = (activation-0.65)/0.35;
    return { r:`hsla(${lerp(pal.hot[0],pal.hot[1],t2)},${70+t2*20}%,${48+t2*18}%,`, fill:0.18+t2*0.28 };
  }
  const t2 = (activation-0.3)/0.35;
  return { r:`hsla(${lerp(pal.neutral[0],pal.neutral[1],t2)+cohShift*0.5},${25+t2*20}%,${40+t2*12}%,`, fill:0.10+t2*0.10 };
}
function dimColor(dimName: DimName, value: number, pal: Palette) {
  const offset = DIM_HUE_OFFSETS[dimName]||0;
  if (value < 0.4) return `hsla(${pal.cold[0]+offset},50%,55%,0.8)`;
  if (value > 0.65) return `hsla(${pal.hot[0]+offset},75%,58%,0.85)`;
  return `hsla(${lerp(pal.neutral[0],pal.neutral[1],value)+offset},45%,52%,0.75)`;
}
function coherenceColor(coh: number, pal: Palette) {
  if (coh > 0.75) return { hex:`hsla(${lerp(pal.hot[1],pal.cold[0],0.3)},80%,62%,`, label:"rgba(200,190,100,0.7)" };
  if (coh > 0.42) return { hex:`hsla(${lerp(pal.neutral[0],pal.cold[0],0.5)},55%,55%,`, label:"rgba(100,150,220,0.6)" };
  return { hex:`hsla(${pal.hot[0]},70%,48%,`, label:"rgba(220,80,80,0.6)" };
}

function getBodySegments(W: number, H: number, cx: number, cy: number) {
  const s = Math.min(W,H)*0.38;
  return [
    { x:cx,          y:cy-s*0.55, rx:s*0.18, ry:s*0.20, dims:["arousal","conflict"]    as DimName[], wts:[0.6,0.4] },
    { x:cx,          y:cy-s*0.33, rx:s*0.07, ry:s*0.06, dims:["tension","regulation"]  as DimName[], wts:[0.5,0.5] },
    { x:cx,          y:cy-s*0.06, rx:s*0.22, ry:s*0.24, dims:["valence","intensity"]   as DimName[], wts:[0.5,0.5] },
    { x:cx,          y:cy+s*0.24, rx:s*0.18, ry:s*0.16, dims:["conflict","tension"]    as DimName[], wts:[0.5,0.5] },
    { x:cx-s*0.28,   y:cy-s*0.18, rx:s*0.10, ry:s*0.08, dims:["tension"]               as DimName[], wts:[1.0] },
    { x:cx+s*0.28,   y:cy-s*0.18, rx:s*0.10, ry:s*0.08, dims:["tension"]               as DimName[], wts:[1.0] },
    { x:cx-s*0.35,   y:cy+s*0.10, rx:s*0.07, ry:s*0.20, dims:["arousal","regulation"] as DimName[], wts:[0.5,0.5] },
    { x:cx+s*0.35,   y:cy+s*0.10, rx:s*0.07, ry:s*0.20, dims:["arousal","regulation"] as DimName[], wts:[0.5,0.5] },
    { x:cx-s*0.12,   y:cy+s*0.60, rx:s*0.09, ry:s*0.26, dims:["focus","arousal"]       as DimName[], wts:[0.6,0.4] },
    { x:cx+s*0.12,   y:cy+s*0.60, rx:s*0.09, ry:s*0.26, dims:["focus","arousal"]       as DimName[], wts:[0.6,0.4] },
  ];
}

export default function AetherVisualSystemPage() {
  const [scenario, setScenario]     = useState<ScenarioKey>("crisis");
  const [layers,   setLayers]       = useState<Record<LayerId,boolean>>({ reflection:true, heatmap:true, glyph:true, motion:true, coherence:true, text:true });
  const [showFocus, setShowFocus]   = useState(false);
  const [cohDisplay, setCohDisplay] = useState({ val:"0.41", label:"fragmented", color:"rgba(220,80,80,0.9)" });
  const [dimVals, setDimVals]       = useState<Record<string,number>>({});

  const canvasRef      = useRef<HTMLCanvasElement>(null);
  const mirrorAreaRef  = useRef<HTMLDivElement>(null);
  const focusGlyphRef  = useRef<HTMLCanvasElement>(null);
  const trendRef       = useRef<HTMLCanvasElement>(null);
  const frameRef       = useRef(0);
  const curRef         = useRef<DimState>(Object.fromEntries(DIM_NAMES.map(d => [d, 0.5])));
  const targetRef      = useRef<DimState>(Object.fromEntries(DIM_NAMES.map(d => [d, 0.5])));
  const palRef         = useRef<Palette>(SCENARIOS.crisis.palette as Palette);
  const targetPalRef   = useRef<Palette>(SCENARIOS.crisis.palette as Palette);
  const cohHistRef     = useRef<number[]>([]);
  const scenarioRef    = useRef<ScenarioKey>("crisis");
  const layersRef      = useRef<Record<LayerId,boolean>>({ reflection:true, heatmap:true, glyph:true, motion:true, coherence:true, text:true });

  // Keep refs in sync with state
  useEffect(() => { scenarioRef.current = scenario; }, [scenario]);
  useEffect(() => { layersRef.current = layers; }, [layers]);

  const setScenarioCb = useCallback((name: ScenarioKey) => {
    setScenario(name);
    const sc = SCENARIOS[name];
    DIM_NAMES.forEach(d => {
      const raw = sc.dims[d as keyof typeof sc.dims] ?? 0;
      targetRef.current[d] = d === "valence" ? (raw + 1) / 2 : Math.abs(raw);
    });
    targetPalRef.current = sc.palette as Palette;
  }, []);

  const toggleLayer = useCallback((id: LayerId) => {
    setLayers(prev => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // Main render loop
  useEffect(() => {
    const cv = canvasRef.current, area = mirrorAreaRef.current;
    if (!cv || !area) return;
    const ctx = cv.getContext("2d")!;
    let raf = 0;
    const resize = () => {
      cv.width = area.clientWidth; cv.height = area.clientHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(area);

    const render = () => {
      const W = cv.width, H = cv.height;
      const cx = W * 0.5, cy = H * 0.44;
      const t = frameRef.current / 60;
      const cur = curRef.current;
      const pal = palRef.current;
      const ls  = layersRef.current;

      DIM_NAMES.forEach(d => { cur[d] = lerp(cur[d], targetRef.current[d], 0.024); });
      palRef.current = lerpPalette(palRef.current, targetPalRef.current, 0.018);

      if (frameRef.current % 2 === 0) {
        cohHistRef.current.push(stateCoherence(cur));
        if (cohHistRef.current.length > 90) cohHistRef.current.shift();
      }

      // Background
      const bg = palRef.current.bg;
      ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`; ctx.fillRect(0,0,W,H);
      const vg = ctx.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*0.72);
      vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,`rgba(${Math.max(0,bg[0]-2)},${Math.max(0,bg[1]-2)},${Math.max(0,bg[2]-2)},0.88)`);
      ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);

      const coh = stateCoherence(cur);
      const cohCol = coherenceColor(coh, pal);

      // Coherence field (background glow/noise)
      if (ls.coherence) {
        if (coh > 0.55) {
          const glowSize = Math.min(W,H)*(0.38+coh*0.22), alpha=(coh-0.55)/0.45*0.13;
          const grd = ctx.createRadialGradient(cx,cy,0,cx,cy,glowSize);
          grd.addColorStop(0,cohCol.hex+(alpha*1.6)+")"); grd.addColorStop(0.55,cohCol.hex+alpha+")"); grd.addColorStop(1,cohCol.hex+"0)");
          ctx.fillStyle=grd; ctx.fillRect(0,0,W,H);
        } else if (coh < 0.35) {
          for (let i=0;i<Math.floor((0.35-coh)*55);i++) {
            const angle=Math.random()*Math.PI*2, dist=Math.random()*Math.min(W,H)*0.44;
            const h=pal.hot[0]+Math.random()*30;
            ctx.fillStyle=`hsla(${h},65%,48%,${Math.random()*0.055})`;
            ctx.beginPath(); ctx.arc(cx+Math.cos(angle)*dist,cy+Math.sin(angle)*dist,1+Math.random()*2,0,Math.PI*2); ctx.fill();
          }
        }
      }

      // Body field (heat blobs)
      if (ls.heatmap) {
        const segs = getBodySegments(W,H,cx,cy);
        const jitter = ls.motion ? (1-coh)*0.016 : 0;
        segs.forEach(seg => {
          let act=0; seg.dims.forEach((d,i)=>act+=cur[d]*seg.wts[i]); act=clamp(act,0,1);
          const col = segmentColor(act, pal, coh);
          const nx=jitter*noise2(seg.x*0.01,seg.y*0.01,t)*W*0.04;
          const ny=jitter*noise2(seg.x*0.01+10,seg.y*0.01+10,t)*H*0.04;
          const grd=ctx.createRadialGradient(seg.x+nx,seg.y+ny,0,seg.x+nx,seg.y+ny,Math.max(seg.rx,seg.ry)*(1.9+act*0.9));
          grd.addColorStop(0,col.r+(col.fill*1.5)+")"); grd.addColorStop(0.45,col.r+col.fill+")"); grd.addColorStop(1,col.r+"0)");
          ctx.fillStyle=grd; ctx.beginPath(); ctx.ellipse(seg.x+nx,seg.y+ny,seg.rx*2.4,seg.ry*2.4,0,0,Math.PI*2); ctx.fill();
        });
      }

      // Body outline
      const s = Math.min(W,H)*0.38;
      const outlineH = lerp(pal.neutral[0],pal.neutral[1],0.5);
      ctx.strokeStyle=`hsla(${outlineH},20%,65%,0.07)`; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.ellipse(cx,cy-s*0.55,s*0.18,s*0.20,0,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-s*0.22,cy-s*0.28); ctx.bezierCurveTo(cx-s*0.28,cy-s*0.10,cx-s*0.20,cy+s*0.20,cx-s*0.15,cy+s*0.38); ctx.lineTo(cx+s*0.15,cy+s*0.38); ctx.bezierCurveTo(cx+s*0.20,cy+s*0.20,cx+s*0.28,cy-s*0.10,cx+s*0.22,cy-s*0.28); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-s*0.22,cy-s*0.20); ctx.bezierCurveTo(cx-s*0.30,cy-s*0.05,cx-s*0.38,cy+s*0.18,cx-s*0.35,cy+s*0.32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+s*0.22,cy-s*0.20); ctx.bezierCurveTo(cx+s*0.30,cy-s*0.05,cx+s*0.38,cy+s*0.18,cx+s*0.35,cy+s*0.32); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx-s*0.12,cy+s*0.38); ctx.bezierCurveTo(cx-s*0.14,cy+s*0.58,cx-s*0.13,cy+s*0.72,cx-s*0.12,cy+s*0.86); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx+s*0.12,cy+s*0.38); ctx.bezierCurveTo(cx+s*0.14,cy+s*0.58,cx+s*0.13,cy+s*0.72,cx+s*0.12,cy+s*0.86); ctx.stroke();

      // Motion pulses + particles
      if (ls.motion) {
        const arousal=cur.arousal, regulation=cur.regulation;
        const chestY=cy-Math.min(W,H)*0.38*0.06, pulseSpeed=0.7+arousal*2.8;
        for (let i=0;i<3;i++) {
          const phase=((t*pulseSpeed+i/3)%1);
          ctx.beginPath(); ctx.arc(cx,chestY,phase*Math.min(W,H)*0.24,0,Math.PI*2);
          ctx.strokeStyle=`hsla(${lerp(pal.hot[0],pal.hot[1],phase)},65%,55%,${(1-phase)*0.07*arousal})`; ctx.lineWidth=1; ctx.stroke();
        }
        const numP=Math.floor(4+arousal*9);
        for (let i=0;i<numP;i++) {
          const seed=i*137.508, phase=((t*0.28+seed)%1);
          const flowDir=regulation>0.5?1:-1;
          const startY=flowDir>0?cy-s*0.4:cy+s*0.4;
          const py=lerp(startY,startY+flowDir*s*0.6,phase), px=cx+(Math.sin(seed)*s*0.28);
          ctx.fillStyle=`hsla(${regulation>0.5?pal.cold[0]:pal.hot[0]},60%,58%,${Math.sin(phase*Math.PI)*0.24*(0.3+arousal*0.7)})`;
          ctx.beginPath(); ctx.arc(px,py,1.5,0,Math.PI*2); ctx.fill();
        }
      }

      // Glyph (8D radar)
      if (ls.glyph) {
        const gs = Math.min(W,H)*0.14, gy = cy-Math.min(W,H)*0.03;
        const jitter2 = ls.motion?(1-coh)*7:0;
        ctx.save(); ctx.globalAlpha=0.78;
        const pts = DIM_NAMES.map((dim,i)=>{
          const angle=(i/8)*Math.PI*2-Math.PI/2, mag=cur[dim];
          return { px:cx+Math.cos(angle)*mag*gs+(jitter2*(Math.random()-0.5)), py:gy+Math.sin(angle)*mag*gs+(jitter2*(Math.random()-0.5)) };
        });
        const gr=ctx.createRadialGradient(cx,gy,0,cx,gy,gs);
        gr.addColorStop(0,cohCol.hex+"0.16)"); gr.addColorStop(1,cohCol.hex+"0.03)");
        ctx.fillStyle=gr; ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.px,p.py):ctx.lineTo(p.px,p.py)); ctx.closePath(); ctx.fill();
        ctx.strokeStyle=cohCol.hex+"0.52)"; ctx.lineWidth=1;
        ctx.beginPath(); pts.forEach((p,i)=>i===0?ctx.moveTo(p.px,p.py):ctx.lineTo(p.px,p.py)); ctx.closePath(); ctx.stroke();
        DIM_NAMES.forEach((_,i)=>{
          const angle=(i/8)*Math.PI*2-Math.PI/2;
          ctx.strokeStyle=`hsla(${lerp(pal.neutral[0],pal.neutral[1],0.5)},20%,60%,0.07)`; ctx.lineWidth=0.5;
          ctx.beginPath(); ctx.moveTo(cx,gy); ctx.lineTo(cx+Math.cos(angle)*gs,gy+Math.sin(angle)*gs); ctx.stroke();
          ctx.fillStyle=`hsla(${pal.hot[0]+DIM_HUE_OFFSETS[DIM_NAMES[i]]},70%,60%,0.7)`;
          ctx.beginPath(); ctx.arc(pts[i].px,pts[i].py,2,0,Math.PI*2); ctx.fill();
        });
        ctx.restore();
      }

      // Text overlay
      if (ls.text) {
        const sc = SCENARIOS[scenarioRef.current];
        const h2 = lerp(pal.neutral[0],pal.neutral[1],0.5);
        const tx = cx-Math.min(W,H)*0.38, ty = H-58;
        ctx.font="9px 'Space Mono',monospace"; ctx.textAlign="left";
        ctx.fillStyle=`hsla(${h2},20%,72%,0.2)`; ctx.fillText(sc.routeState,tx,ty);
        ctx.fillStyle=`hsla(${h2},15%,65%,0.14)`; ctx.fillText("coherence: "+coh.toFixed(2),tx,ty+15);
        ctx.fillStyle=`hsla(${h2},25%,75%,0.28)`; ctx.fillText(sc.routeAgent,tx,ty+30);
      }

      // Update sidebar every 5 frames
      if (frameRef.current % 5 === 0) {
        const hue = coh>0.75?lerp(pal.hot[1],pal.cold[0],0.3):coh>0.42?lerp(pal.neutral[0],pal.cold[0],0.5):pal.hot[0];
        const textColor = `hsla(${hue},60%,65%,0.85)`;
        const label = coh>0.75?"unified":coh>0.55?"aligning":coh>0.35?"unstable":"fragmented";
        setCohDisplay({ val: coh.toFixed(2), label, color: textColor });
        setDimVals({ ...cur });
      }

      frameRef.current++;
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  const openFocus = () => {
    setShowFocus(true);
    // Draw focus glyph and trend after state update
    requestAnimationFrame(() => {
      const fc = focusGlyphRef.current;
      const tc = trendRef.current;
      const cur = curRef.current;
      const pal = palRef.current;
      const coh = stateCoherence(cur);
      const hue = coh>0.75?lerp(pal.hot[1],pal.cold[0],0.3):coh>0.42?lerp(pal.neutral[0],pal.cold[0],0.5):pal.hot[0];

      if (fc) {
        const fctx = fc.getContext("2d")!;
        const W=fc.width, H=fc.height, cx=W/2, cy=H/2, s2=Math.min(W,H)*0.36;
        fctx.clearRect(0,0,W,H); fctx.fillStyle="rgba(3,5,10,0.85)"; fctx.fillRect(0,0,W,H);
        DIM_NAMES.forEach((_,i)=>{
          const angle=(i/8)*Math.PI*2-Math.PI/2;
          fctx.strokeStyle=`hsla(${lerp(pal.neutral[0],pal.neutral[1],0.5)},15%,55%,0.09)`; fctx.lineWidth=0.5;
          fctx.beginPath(); fctx.moveTo(cx,cy); fctx.lineTo(cx+Math.cos(angle)*s2,cy+Math.sin(angle)*s2); fctx.stroke();
          const lx=cx+Math.cos(angle)*(s2+13), ly=cy+Math.sin(angle)*(s2+13);
          fctx.font="7px 'Space Mono',monospace"; fctx.fillStyle=`hsla(${pal.hot[0]+DIM_HUE_OFFSETS[DIM_NAMES[i]]},55%,60%,0.75)`;
          fctx.textAlign="center"; fctx.textBaseline="middle"; fctx.fillText(DIM_NAMES[i].slice(0,3),lx,ly);
        });
        const pts=DIM_NAMES.map((dim,i)=>({ px:cx+Math.cos((i/8)*Math.PI*2-Math.PI/2)*cur[dim]*s2, py:cy+Math.sin((i/8)*Math.PI*2-Math.PI/2)*cur[dim]*s2 }));
        const gr=fctx.createRadialGradient(cx,cy,0,cx,cy,s2);
        gr.addColorStop(0,`hsla(${hue},55%,55%,0.14)`); gr.addColorStop(1,`hsla(${hue},55%,55%,0.03)`);
        fctx.fillStyle=gr; fctx.beginPath(); pts.forEach((p,i)=>i===0?fctx.moveTo(p.px,p.py):fctx.lineTo(p.px,p.py)); fctx.closePath(); fctx.fill();
        fctx.strokeStyle=`hsla(${hue},60%,58%,0.55)`; fctx.lineWidth=1.5;
        fctx.beginPath(); pts.forEach((p,i)=>i===0?fctx.moveTo(p.px,p.py):fctx.lineTo(p.px,p.py)); fctx.closePath(); fctx.stroke();
        pts.forEach((pt,i)=>{ fctx.fillStyle=`hsla(${pal.hot[0]+DIM_HUE_OFFSETS[DIM_NAMES[i]]},70%,60%,0.85)`; fctx.beginPath(); fctx.arc(pt.px,pt.py,2.5,0,Math.PI*2); fctx.fill(); });
      }

      if (tc) {
        const hist = cohHistRef.current;
        const tctx=tc.getContext("2d")!, W=tc.width, H=tc.height, pad=10;
        tctx.clearRect(0,0,W,H); tctx.fillStyle="rgba(3,5,10,0.6)"; tctx.fillRect(0,0,W,H);
        if (hist.length >= 2) {
          tctx.strokeStyle=`hsla(${lerp(pal.cold[0],pal.neutral[0],0.5)},50%,55%,0.55)`; tctx.lineWidth=1.5;
          tctx.beginPath();
          hist.forEach((v,i)=>{ const x=pad+(i/(hist.length-1))*(W-pad*2), y=H-pad-v*(H-pad*2); i===0?tctx.moveTo(x,y):tctx.lineTo(x,y); });
          tctx.stroke();
        }
      }
    });
  };

  const sc = SCENARIOS[scenario];
  const pal = palRef.current;

  const mono = "'Space Mono','Courier New',monospace";
  const bgPanel = "#03050a";
  const borderC = "rgba(255,255,255,0.04)";
  const textDim  = "rgba(200,210,220,0.28)";
  const textMid  = "rgba(200,210,220,0.55)";

  return (
    <div style={{ height:"100%", display:"grid", gridTemplateRows:"1fr auto", background:"#04060a", fontFamily:mono, fontSize:11, color:"rgba(200,210,220,0.7)", overflow:"hidden" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", overflow:"hidden", minHeight:0 }}>

        {/* ── Mirror / Canvas ── */}
        <div ref={mirrorAreaRef} style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden", background:"#020408", cursor:"pointer" }}
          onClick={openFocus}>
          <canvas ref={canvasRef} style={{ display:"block", position:"absolute", inset:0 }} />
        </div>

        {/* ── Sidebar ── */}
        <div style={{ borderLeft:`1px solid ${borderC}`, display:"flex", flexDirection:"column", overflow:"hidden", background:bgPanel }}>
          {/* Scenarios */}
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${borderC}` }}>
            <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:textDim, marginBottom:10 }}>Patient State</div>
            <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
              {(Object.keys(SCENARIOS) as ScenarioKey[]).map(name => (
                <button key={name} onClick={() => setScenarioCb(name)} style={{ background:"none", border:`1px solid ${scenario===name?"rgba(255,255,255,0.14)":"rgba(255,255,255,0.05)"}`, color:scenario===name?"rgba(200,210,220,0.85)":"rgba(200,210,220,0.4)", fontFamily:mono, fontSize:9, letterSpacing:1, padding:"8px 10px", cursor:"pointer", textAlign:"left", display:"flex", justifyContent:"space-between", alignItems:"center", backgroundColor:scenario===name?"rgba(255,255,255,0.02)":"transparent" }}>
                  <span>{name}</span>
                  <span style={{ fontSize:8, opacity:0.45 }}>{SCENARIOS[name].routeAgent.replace("route: ","")}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 8D State Vector */}
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${borderC}` }}>
            <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:textDim, marginBottom:10 }}>8D State Vector</div>
            {DIM_NAMES.map(d => (
              <div key={d} style={{ display:"grid", gridTemplateColumns:"72px 1fr 32px", alignItems:"center", gap:7, marginBottom:5 }}>
                <span style={{ fontSize:8, letterSpacing:1, textTransform:"uppercase", color:textDim }}>{d}</span>
                <div style={{ height:2, background:"rgba(255,255,255,0.05)", borderRadius:1, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:1, transition:"width 0.8s cubic-bezier(0.4,0,0.2,1),background 1.5s", width:Math.round((dimVals[d]??0.5)*100)+"%", background:dimColor(d as DimName, dimVals[d]??0.5, pal) }} />
                </div>
                <span style={{ fontSize:9, textAlign:"right", color:"rgba(200,210,220,0.45)" }}>{(dimVals[d]??0.5).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Layer toggles */}
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${borderC}` }}>
            <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:textDim, marginBottom:10 }}>Visual Layers</div>
            {LAYER_IDS.map(id => (
              <div key={id} onClick={() => toggleLayer(id)} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", padding:"3px 0" }}>
                <span style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:textDim }}>{LAYER_LABELS[id]}</span>
                <div style={{ width:6, height:6, borderRadius:"50%", background:layers[id]?"rgba(200,210,220,0.65)":"rgba(255,255,255,0.12)", boxShadow:layers[id]?"0 0 4px rgba(200,210,220,0.35)":undefined, transition:"all 0.2s" }} />
              </div>
            ))}
          </div>

          {/* Coherence meter */}
          <div style={{ padding:"14px 16px", borderBottom:`1px solid ${borderC}` }}>
            <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:textDim, marginBottom:10 }}>Coherence Field</div>
            <div style={{ fontSize:26, lineHeight:1, marginBottom:6, color:cohDisplay.color, transition:"color 1.2s" }}>{cohDisplay.val}</div>
            <div style={{ height:3, background:"rgba(255,255,255,0.05)", borderRadius:2, overflow:"hidden", marginBottom:6 }}>
              <div style={{ height:"100%", borderRadius:2, transition:"width 1s ease,background 1.2s", width:Math.round(parseFloat(cohDisplay.val)*100)+"%", background:cohDisplay.color.replace("0.9","0.7") }} />
            </div>
            <div style={{ fontSize:8, letterSpacing:2, textTransform:"uppercase", color:cohDisplay.color.replace("0.9","0.6") }}>{cohDisplay.label}</div>
          </div>

          {/* Route state */}
          <div style={{ padding:"12px 16px", marginTop:"auto" }}>
            <div style={{ color:"rgba(200,210,220,0.38)", marginBottom:3 }}>{sc.routeState}</div>
            <div style={{ color:"rgba(200,210,220,0.28)", marginBottom:3 }}>{sc.routeCoh}</div>
            <div style={{ color:"rgba(200,210,220,0.52)" }}>{sc.routeAgent}</div>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div style={{ padding:"9px 18px", borderTop:`1px solid ${borderC}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:bgPanel, flexShrink:0 }}>
        <span style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:"rgba(200,210,220,0.18)" }}>AETHER v0.2 · chromatic state engine · tap mirror to focus</span>
        <span style={{ fontSize:8, letterSpacing:2, color:"rgba(200,210,220,0.18)" }}>60fps</span>
      </div>

      {/* ── Focus overlay ── */}
      {showFocus && (
        <div onClick={() => setShowFocus(false)} style={{ position:"fixed", inset:0, background:"rgba(2,4,8,0.94)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100, cursor:"pointer" }}>
          <div onClick={e => e.stopPropagation()} style={{ display:"grid", gridTemplateColumns:"240px 240px", gap:20, cursor:"default" }}>
            {[
              <div key="coh" style={{ border:"1px solid rgba(255,255,255,0.06)", padding:18, background:"rgba(4,6,10,0.85)" }}>
                <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:textDim, marginBottom:12 }}>Coherence Score</div>
                <div style={{ fontSize:32, lineHeight:1, marginBottom:8, color:cohDisplay.color }}>{cohDisplay.val}</div>
                <div style={{ fontSize:9, color:"rgba(200,210,220,0.38)", lineHeight:1.8 }}>{sc.cohDesc}</div>
              </div>,
              <div key="glyph" style={{ border:"1px solid rgba(255,255,255,0.06)", padding:18, background:"rgba(4,6,10,0.85)" }}>
                <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:textDim, marginBottom:12 }}>State Glyph (8D)</div>
                <canvas ref={focusGlyphRef} width={200} height={200} />
              </div>,
              <div key="trend" style={{ border:"1px solid rgba(255,255,255,0.06)", padding:18, background:"rgba(4,6,10,0.85)" }}>
                <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:textDim, marginBottom:12 }}>Coherence Trend</div>
                <canvas ref={trendRef} width={200} height={90} />
                <div style={{ fontSize:9, color:"rgba(200,210,220,0.38)", marginTop:8, lineHeight:1.8 }}>last 30s</div>
              </div>,
              <div key="rx" style={{ border:"1px solid rgba(255,255,255,0.06)", padding:18, background:"rgba(4,6,10,0.85)" }}>
                <div style={{ fontSize:8, letterSpacing:3, textTransform:"uppercase", color:textDim, marginBottom:12 }}>Routing</div>
                <div style={{ fontSize:18, marginBottom:10, color:cohDisplay.color }}>{sc.agent}</div>
                <div style={{ fontSize:9, color:"rgba(200,210,220,0.38)", lineHeight:1.8 }}>{sc.rx}</div>
              </div>,
            ]}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";

type PresetKey =
  | "aether"
  | "lunar"
  | "boho"
  | "verdant"
  | "eris"
  | "cosmic"
  | "flower"
  | "silk"
  | "wave"
  | "sand";

interface Stop { offset: number; color: string; }
interface Preset {
  key: PresetKey;
  label: string;
  kicker: string;
  source?: string;
  // DOM rendering
  bg: string;
  textGradient: string;
  sparkleColors: string[];
  fontFamily: string;
  shadow: string;
  // Canvas export mirrors of the gradients above
  bgType: "radial" | "linear";
  bgAngle?: number;
  bgStops: Stop[];
  textAngle: number;
  textStops: Stop[];
  // Optional pulsing aura ring (radial) painted behind text
  aura?: Stop[];
  glowColor: string;
}

const PRESETS: Preset[] = [
  {
    key: "aether",
    label: "Aether",
    kicker: "Resonance · Indigo · Aura",
    source: "Resonance Core",
    bg: "radial-gradient(ellipse at 50% 35%, #2a1f5c 0%, #150a3a 45%, #060216 100%)",
    textGradient: "linear-gradient(110deg, #88e1ff 0%, #c4a8ff 28%, #ffffff 50%, #a78bfa 72%, #5fc8ff 100%)",
    sparkleColors: ["#ffffff", "#88e1ff", "#a78bfa", "#c4a8ff"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 50px rgba(167,139,250,0.6), 0 0 110px rgba(95,200,255,0.4)",
    bgType: "radial",
    bgStops: [
      { offset: 0,    color: "#2a1f5c" },
      { offset: 0.45, color: "#150a3a" },
      { offset: 1,    color: "#060216" },
    ],
    textAngle: 110,
    textStops: [
      { offset: 0,    color: "#88e1ff" },
      { offset: 0.28, color: "#c4a8ff" },
      { offset: 0.5,  color: "#ffffff" },
      { offset: 0.72, color: "#a78bfa" },
      { offset: 1,    color: "#5fc8ff" },
    ],
    aura: [
      { offset: 0,    color: "rgba(167,139,250,0.35)" },
      { offset: 0.45, color: "rgba(95,200,255,0.18)" },
      { offset: 1,    color: "rgba(0,0,0,0)" },
    ],
    glowColor: "rgba(167,139,250,0.55)",
  },
  {
    key: "lunar",
    label: "Lunar Tide",
    kicker: "Silver · Tide · Moon",
    source: "Lunar Coherence",
    bg: "radial-gradient(ellipse at 50% 30%, #1c2a4a 0%, #0a1228 50%, #02050f 100%)",
    textGradient: "linear-gradient(115deg, #e6efff 0%, #b8c8e8 25%, #ffffff 50%, #8aa3d4 75%, #d8e4ff 100%)",
    sparkleColors: ["#ffffff", "#cfd9f5", "#a8b8d8", "#e8eeff"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 38px rgba(220,232,255,0.55), 0 0 95px rgba(140,168,220,0.35)",
    bgType: "radial",
    bgStops: [
      { offset: 0,   color: "#1c2a4a" },
      { offset: 0.5, color: "#0a1228" },
      { offset: 1,   color: "#02050f" },
    ],
    textAngle: 115,
    textStops: [
      { offset: 0,    color: "#e6efff" },
      { offset: 0.25, color: "#b8c8e8" },
      { offset: 0.5,  color: "#ffffff" },
      { offset: 0.75, color: "#8aa3d4" },
      { offset: 1,    color: "#d8e4ff" },
    ],
    aura: [
      { offset: 0,    color: "rgba(220,232,255,0.32)" },
      { offset: 0.5,  color: "rgba(140,168,220,0.14)" },
      { offset: 1,    color: "rgba(0,0,0,0)" },
    ],
    glowColor: "rgba(220,232,255,0.55)",
  },
  {
    key: "boho",
    label: "Boho Bloom",
    kicker: "Cream · Terracotta · Sage",
    source: "Boho Formula",
    bg: "radial-gradient(ellipse at 45% 30%, #f4e6cf 0%, #e3c8a4 45%, #b88565 100%)",
    textGradient: "linear-gradient(110deg, #6f3a26 0%, #c47a55 25%, #e8b78a 50%, #8a9b6e 75%, #6f3a26 100%)",
    sparkleColors: ["#ffffff", "#fce8c4", "#e8b78a", "#c47a55"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 26px rgba(255,235,200,0.7), 0 2px 8px rgba(110,60,30,0.3)",
    bgType: "radial",
    bgStops: [
      { offset: 0,    color: "#f4e6cf" },
      { offset: 0.45, color: "#e3c8a4" },
      { offset: 1,    color: "#b88565" },
    ],
    textAngle: 110,
    textStops: [
      { offset: 0,    color: "#6f3a26" },
      { offset: 0.25, color: "#c47a55" },
      { offset: 0.5,  color: "#e8b78a" },
      { offset: 0.75, color: "#8a9b6e" },
      { offset: 1,    color: "#6f3a26" },
    ],
    glowColor: "rgba(255,235,200,0.6)",
  },
  {
    key: "verdant",
    label: "Verdant Spark",
    kicker: "Chlorophyll · Gold · Emerald",
    source: "Photosynthesis Spark",
    bg: "radial-gradient(ellipse at 50% 35%, #0d3a26 0%, #052216 50%, #01080a 100%)",
    textGradient: "linear-gradient(115deg, #ffe082 0%, #b6f08c 28%, #ffffff 50%, #4fcf7c 72%, #ffd860 100%)",
    sparkleColors: ["#ffffff", "#b6f08c", "#ffe082", "#7ee0a8"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 42px rgba(150,240,140,0.55), 0 0 95px rgba(255,224,130,0.35)",
    bgType: "radial",
    bgStops: [
      { offset: 0,   color: "#0d3a26" },
      { offset: 0.5, color: "#052216" },
      { offset: 1,   color: "#01080a" },
    ],
    textAngle: 115,
    textStops: [
      { offset: 0,    color: "#ffe082" },
      { offset: 0.28, color: "#b6f08c" },
      { offset: 0.5,  color: "#ffffff" },
      { offset: 0.72, color: "#4fcf7c" },
      { offset: 1,    color: "#ffd860" },
    ],
    aura: [
      { offset: 0,    color: "rgba(150,240,140,0.3)" },
      { offset: 0.5,  color: "rgba(255,224,130,0.15)" },
      { offset: 1,    color: "rgba(0,0,0,0)" },
    ],
    glowColor: "rgba(150,240,140,0.5)",
  },
  {
    key: "eris",
    label: "Eris Field",
    kicker: "Crimson · Void · Violet",
    source: "Divine Timing",
    bg: "radial-gradient(ellipse at 50% 35%, #4a0a1a 0%, #1a0210 55%, #050006 100%)",
    textGradient: "linear-gradient(115deg, #ff5577 0%, #c44f8a 28%, #ffffff 50%, #8d3fdb 72%, #ff7a7a 100%)",
    sparkleColors: ["#ffffff", "#ff8aa8", "#c4a0ff", "#ff5577"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 48px rgba(255,80,120,0.55), 0 0 110px rgba(141,63,219,0.4)",
    bgType: "radial",
    bgStops: [
      { offset: 0,    color: "#4a0a1a" },
      { offset: 0.55, color: "#1a0210" },
      { offset: 1,    color: "#050006" },
    ],
    textAngle: 115,
    textStops: [
      { offset: 0,    color: "#ff5577" },
      { offset: 0.28, color: "#c44f8a" },
      { offset: 0.5,  color: "#ffffff" },
      { offset: 0.72, color: "#8d3fdb" },
      { offset: 1,    color: "#ff7a7a" },
    ],
    aura: [
      { offset: 0,    color: "rgba(255,80,120,0.32)" },
      { offset: 0.5,  color: "rgba(141,63,219,0.16)" },
      { offset: 1,    color: "rgba(0,0,0,0)" },
    ],
    glowColor: "rgba(255,80,120,0.55)",
  },
  {
    key: "cosmic",
    label: "Cosmic Sunset",
    kicker: "Nebula · Magma · Twilight",
    bg: "radial-gradient(ellipse at 30% 20%, #2d1b4e 0%, #1a0b2e 40%, #050108 100%)",
    textGradient: "linear-gradient(120deg, #ff6b9d 0%, #ffa06b 25%, #f7d96b 50%, #c89bff 75%, #6b9dff 100%)",
    sparkleColors: ["#ff9ec7", "#ffd56b", "#c89bff", "#ffffff"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 40px rgba(255,140,200,0.55), 0 0 80px rgba(200,155,255,0.35)",
    bgType: "radial",
    bgStops: [
      { offset: 0,   color: "#2d1b4e" },
      { offset: 0.4, color: "#1a0b2e" },
      { offset: 1,   color: "#050108" },
    ],
    textAngle: 120,
    textStops: [
      { offset: 0,    color: "#ff6b9d" },
      { offset: 0.25, color: "#ffa06b" },
      { offset: 0.5,  color: "#f7d96b" },
      { offset: 0.75, color: "#c89bff" },
      { offset: 1,    color: "#6b9dff" },
    ],
    aura: [
      { offset: 0,    color: "rgba(255,140,200,0.28)" },
      { offset: 0.5,  color: "rgba(200,155,255,0.14)" },
      { offset: 1,    color: "rgba(0,0,0,0)" },
    ],
    glowColor: "rgba(255,140,200,0.5)",
  },
  {
    key: "flower",
    label: "Flower",
    kicker: "Petal · Bloom · Soft Bloom",
    bg: "radial-gradient(ellipse at 50% 30%, #f9d4e3 0%, #e8b4d2 35%, #c489a9 70%, #6f3d65 100%)",
    textGradient: "linear-gradient(110deg, #ffffff 0%, #fde8f1 25%, #e87fb0 50%, #c5468d 75%, #ffffff 100%)",
    sparkleColors: ["#ffffff", "#ffe4f0", "#ff9bcb", "#fdd6a8"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 30px rgba(255,255,255,0.65), 0 0 60px rgba(255,180,220,0.5)",
    bgType: "radial",
    bgStops: [
      { offset: 0,    color: "#f9d4e3" },
      { offset: 0.35, color: "#e8b4d2" },
      { offset: 0.7,  color: "#c489a9" },
      { offset: 1,    color: "#6f3d65" },
    ],
    textAngle: 110,
    textStops: [
      { offset: 0,    color: "#ffffff" },
      { offset: 0.25, color: "#fde8f1" },
      { offset: 0.5,  color: "#e87fb0" },
      { offset: 0.75, color: "#c5468d" },
      { offset: 1,    color: "#ffffff" },
    ],
    glowColor: "rgba(255,255,255,0.65)",
  },
  {
    key: "silk",
    label: "Silk",
    kicker: "Pearl · Mother-of-Pearl · Luster",
    bg: "linear-gradient(135deg, #e8e1d4 0%, #c9c0b0 35%, #ababab 65%, #6b6b78 100%)",
    textGradient: "linear-gradient(105deg, #ffffff 0%, #f0e8d8 25%, #d8d0c0 50%, #b8b0a0 75%, #ffffff 100%)",
    sparkleColors: ["#ffffff", "#fff8e8", "#e0d8c0", "#d8c9a4"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 25px rgba(255,255,255,0.85), 0 2px 6px rgba(0,0,0,0.18)",
    bgType: "linear",
    bgAngle: 135,
    bgStops: [
      { offset: 0,    color: "#e8e1d4" },
      { offset: 0.35, color: "#c9c0b0" },
      { offset: 0.65, color: "#ababab" },
      { offset: 1,    color: "#6b6b78" },
    ],
    textAngle: 105,
    textStops: [
      { offset: 0,    color: "#ffffff" },
      { offset: 0.25, color: "#f0e8d8" },
      { offset: 0.5,  color: "#d8d0c0" },
      { offset: 0.75, color: "#b8b0a0" },
      { offset: 1,    color: "#ffffff" },
    ],
    glowColor: "rgba(255,255,255,0.8)",
  },
  {
    key: "wave",
    label: "Wave",
    kicker: "Ocean · Cyan · Deep Tide",
    bg: "radial-gradient(ellipse at 60% 40%, #0d4762 0%, #062a3d 50%, #020812 100%)",
    textGradient: "linear-gradient(115deg, #7ad8f5 0%, #ffffff 30%, #5ec8e8 55%, #2da9c9 80%, #88e6ff 100%)",
    sparkleColors: ["#ffffff", "#a8e8ff", "#5ec8e8", "#d4f3ff"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 38px rgba(120,216,245,0.6), 0 0 80px rgba(46,169,201,0.4)",
    bgType: "radial",
    bgStops: [
      { offset: 0,   color: "#0d4762" },
      { offset: 0.5, color: "#062a3d" },
      { offset: 1,   color: "#020812" },
    ],
    textAngle: 115,
    textStops: [
      { offset: 0,    color: "#7ad8f5" },
      { offset: 0.3,  color: "#ffffff" },
      { offset: 0.55, color: "#5ec8e8" },
      { offset: 0.8,  color: "#2da9c9" },
      { offset: 1,    color: "#88e6ff" },
    ],
    aura: [
      { offset: 0,    color: "rgba(120,216,245,0.28)" },
      { offset: 0.5,  color: "rgba(46,169,201,0.14)" },
      { offset: 1,    color: "rgba(0,0,0,0)" },
    ],
    glowColor: "rgba(120,216,245,0.55)",
  },
  {
    key: "sand",
    label: "Sand",
    kicker: "Dune · Amber · Warm Grain",
    bg: "linear-gradient(160deg, #f5e3b8 0%, #d8b87a 35%, #a07a3d 70%, #4a3215 100%)",
    textGradient: "linear-gradient(115deg, #ffffff 0%, #fdf0c8 25%, #e8c478 50%, #b8843c 75%, #fff4d8 100%)",
    sparkleColors: ["#ffffff", "#fff0c0", "#f5d488", "#e8b450"],
    fontFamily: "'Cinzel', serif",
    shadow: "0 0 30px rgba(255,224,140,0.7), 0 2px 4px rgba(80,50,20,0.35)",
    bgType: "linear",
    bgAngle: 160,
    bgStops: [
      { offset: 0,    color: "#f5e3b8" },
      { offset: 0.35, color: "#d8b87a" },
      { offset: 0.7,  color: "#a07a3d" },
      { offset: 1,    color: "#4a3215" },
    ],
    textAngle: 115,
    textStops: [
      { offset: 0,    color: "#ffffff" },
      { offset: 0.25, color: "#fdf0c8" },
      { offset: 0.5,  color: "#e8c478" },
      { offset: 0.75, color: "#b8843c" },
      { offset: 1,    color: "#fff4d8" },
    ],
    glowColor: "rgba(255,224,140,0.65)",
  },
];

interface Sparkle { x: number; y: number; r: number; vx: number; vy: number; life: number; max: number; col: string; rot: number; vrot: number; }
interface Comet   { x: number; y: number; vx: number; vy: number; len: number; col: string; life: number; max: number; alpha: number; }
interface Ring    { x: number; y: number; r: number; maxR: number; life: number; max: number; col: string; }

const VIDEO_DURATIONS: { sec: number; label: string }[] = [
  { sec: 3, label: "3s" },
  { sec: 5, label: "5s" },
  { sec: 8, label: "8s" },
];

function SparkleTextHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const sparks: {x:number;y:number;life:number;maxLife:number;col:string;vx:number;vy:number}[]=[];
    const addSpark=()=>{
      const cols=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff","#ffffff"];
      sparks.push({x:W*0.1+Math.random()*W*0.8,y:H*0.1+Math.random()*H*0.8,life:1,maxLife:1,col:cols[Math.floor(Math.random()*cols.length)],vx:(Math.random()-0.5)*2,vy:(Math.random()-0.5)*2});
    };
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      if(Math.random()>0.6) addSpark();
      for(let i=sparks.length-1;i>=0;i--){
        const s=sparks[i];
        s.x+=s.vx;s.y+=s.vy;s.life-=0.02;
        if(s.life<=0){sparks.splice(i,1);continue;}
        const size=5*s.life;
        ctx.save();ctx.translate(s.x,s.y);
        for(let arm=0;arm<4;arm++){
          ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-size);ctx.strokeStyle=s.col+Math.round(s.life*255).toString(16).padStart(2,"0");ctx.lineWidth=0.8;ctx.stroke();
        }
        ctx.restore();
      }
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SPARKLE STUDIO · SHIMMER · TEXTURE · PARTICLE ART · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SparkleTextPage() {
  const [text, setText] = useState("AETHER");
  const [size, setSize] = useState(140);
  const [density, setDensity] = useState(70);
  const [presetKey, setPresetKey] = useState<PresetKey>("aether");
  const [paused, setPaused] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recCountdown, setRecCountdown] = useState(0);
  const [videoDuration, setVideoDuration] = useState<number>(5);
  const preset = useMemo(() => PRESETS.find(p => p.key === presetKey) ?? PRESETS[0]!, [presetKey]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const cometsRef   = useRef<Comet[]>([]);
  const ringsRef    = useRef<Ring[]>([]);
  const cometTimerRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(paused);
  const presetRef = useRef(preset);
  const densityRef = useRef(density);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { presetRef.current = preset; }, [preset]);
  useEffect(() => { densityRef.current = density; }, [density]);

  // ── Live sparkle animation loop (on-screen)
  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let last = performance.now();

    const resize = () => {
      const r = stage.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr;
      canvas.height = r.height * dpr;
      canvas.style.width = `${r.width}px`;
      canvas.style.height = `${r.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(stage);

    // ── draw helpers ──────────────────────────────────────────────────────────
    const drawSparkle = (s: Sparkle) => {
      const a = Math.sin((s.life / s.max) * Math.PI);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = a;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = s.col;
      ctx.shadowColor = s.col;
      ctx.shadowBlur = s.r * 5;
      ctx.beginPath();
      const r = s.r, k = s.r * 0.18;
      ctx.moveTo(0, -r); ctx.lineTo(k, -k);
      ctx.lineTo(r, 0);  ctx.lineTo(k, k);
      ctx.lineTo(0, r);  ctx.lineTo(-k, k);
      ctx.lineTo(-r, 0); ctx.lineTo(-k, -k);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawComet = (c: Comet) => {
      const progress = c.life / c.max;
      const alpha = Math.sin(progress * Math.PI) * c.alpha;
      const tailX = c.x - c.vx * c.len;
      const tailY = c.y - c.vy * c.len;
      const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
      grad.addColorStop(0, `rgba(255,255,255,0)`);
      grad.addColorStop(0.6, `${c.col}66`);
      grad.addColorStop(1, c.col);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.shadowColor = c.col;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(c.x, c.y);
      ctx.stroke();
      // bright head dot
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.shadowBlur = 18;
      ctx.arc(c.x, c.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawRing = (ring: Ring) => {
      const progress = ring.life / ring.max;
      const alpha = (1 - progress) * 0.75;
      const radius = ring.r + (ring.maxR - ring.r) * progress;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = ring.col;
      ctx.shadowColor = ring.col;
      ctx.shadowBlur = 8;
      ctx.lineWidth = 1.5 * (1 - progress * 0.7);
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    const spawnComet = (w: number, h: number, cols: string[]) => {
      // Fire from a random edge
      const edge = Math.floor(Math.random() * 4);
      let x: number, y: number;
      const speed = 6 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 0.45 + Math.PI * 0.1;
      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
      if (edge === 0)      { x = -20; y = Math.random() * h; }
      else if (edge === 1) { x = w + 20; y = Math.random() * h; vx = -vx; }
      else if (edge === 2) { x = Math.random() * w; y = -20; vy = Math.abs(vy); }
      else                 { x = Math.random() * w; y = h + 20; vy = -Math.abs(vy); }
      cometsRef.current.push({
        x, y, vx, vy,
        len: 55 + Math.random() * 60,
        col: cols[Math.floor(Math.random() * cols.length)] ?? "#fff",
        life: 0,
        max: 55 + Math.random() * 45,
        alpha: 0.7 + Math.random() * 0.3,
      });
    };

    const tick = (now: number) => {
      const dt = Math.min(50, now - last) / 16.67;
      last = now;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (!pausedRef.current) {
        const cols = presetRef.current.sparkleColors;

        // ── Spawn sparkles (faster: higher speed, lower lifetime)
        const spawn = Math.max(0, Math.round(densityRef.current / 18 * dt));
        for (let i = 0; i < spawn; i++) {
          sparklesRef.current.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 1.2 + Math.random() * 4,
            vx: (Math.random() - 0.5) * 1.4,
            vy: -0.6 - Math.random() * 1.2,
            life: 0,
            max: 28 + Math.random() * 40,
            col: cols[Math.floor(Math.random() * cols.length)] ?? "#fff",
            rot: Math.random() * Math.PI,
            vrot: (Math.random() - 0.5) * 0.14,
          });
        }
        if (sparklesRef.current.length > 900) {
          sparklesRef.current.splice(0, sparklesRef.current.length - 900);
        }

        // ── Comet timer: fire one every ~2.5–5 s
        cometTimerRef.current += dt;
        const cometInterval = 40 + Math.random() * 80;
        if (cometTimerRef.current > cometInterval) {
          spawnComet(w, h, cols);
          cometTimerRef.current = 0;
        }
      }

      // ── Advance & draw comets
      const nextComets: Comet[] = [];
      for (const c of cometsRef.current) {
        c.life += dt;
        c.x += c.vx * dt;
        c.y += c.vy * dt;
        if (c.life < c.max) {
          drawComet(c);
          nextComets.push(c);
        }
      }
      cometsRef.current = nextComets;

      // ── Advance & draw resonance drop rings
      const nextRings: Ring[] = [];
      for (const ring of ringsRef.current) {
        ring.life += dt;
        if (ring.life < ring.max) {
          drawRing(ring);
          nextRings.push(ring);
        }
      }
      ringsRef.current = nextRings;

      // ── Advance & draw sparkles; spawn rings on death
      const next: Sparkle[] = [];
      for (const s of sparklesRef.current) {
        s.life += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.rot += s.vrot * dt;
        const alive = s.life < s.max && s.y > -10 && s.y < h + 10 && s.x > -10 && s.x < w + 10;
        if (alive) {
          drawSparkle(s);
          next.push(s);
        } else if (s.life >= s.max && !pausedRef.current && Math.random() < 0.35) {
          // Resonance drop ring on sparkle death
          ringsRef.current.push({
            x: s.x, y: s.y,
            r: s.r * 0.5,
            maxR: s.r * (5 + Math.random() * 6),
            life: 0,
            max: 22 + Math.random() * 18,
            col: s.col,
          });
        }
      }
      sparklesRef.current = next;

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      sparklesRef.current = [];
      cometsRef.current = [];
      ringsRef.current = [];
    };
  }, []);

  // ── Helper: paint preset bg + aura into a ctx
  const paintBg = (ctx: CanvasRenderingContext2D, W: number, H: number, auraIntensity = 1) => {
    let g: CanvasGradient;
    if (preset.bgType === "radial") {
      g = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, Math.max(W, H) * 0.75);
    } else {
      const a = ((preset.bgAngle ?? 135) - 90) * Math.PI / 180;
      const dx = Math.cos(a) * W / 2;
      const dy = Math.sin(a) * H / 2;
      g = ctx.createLinearGradient(W / 2 - dx, H / 2 - dy, W / 2 + dx, H / 2 + dy);
    }
    preset.bgStops.forEach(s => g.addColorStop(s.offset, s.color));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    if (preset.aura) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, auraIntensity));
      const aura = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.min(W, H) * 0.55);
      preset.aura.forEach(s => aura.addColorStop(s.offset, s.color));
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }
  };

  // ── Helper: draw the glowing text into a ctx with optional shimmer phase (0..1)
  const paintText = (ctx: CanvasRenderingContext2D, W: number, H: number, scale: number, shimmer = 0) => {
    const txt = (text || "Sparkle").trim();
    let fs = Math.round(size * scale * 0.95);
    const fontFor = (n: number) => `800 ${n}px ${preset.fontFamily}`;
    ctx.font = fontFor(fs);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const maxW = W - 60 * scale;
    while (fs > 24 && ctx.measureText(txt).width > maxW) {
      fs -= 6;
      ctx.font = fontFor(fs);
    }
    const tw = ctx.measureText(txt).width;
    const ta = ((preset.textAngle ?? 110) - 90) * Math.PI / 180;
    // Shimmer: shift the gradient endpoints sideways along the gradient axis
    const shift = (shimmer - 0.5) * 0.55;
    const cx = W / 2 + Math.cos(ta) * tw * shift;
    const cy = H / 2 + Math.sin(ta) * fs * shift;
    const tdx = Math.cos(ta) * tw / 2;
    const tdy = Math.sin(ta) * fs / 2;
    const tg = ctx.createLinearGradient(cx - tdx, cy - tdy, cx + tdx, cy + tdy);
    preset.textStops.forEach(s => tg.addColorStop(s.offset, s.color));

    ctx.save();
    ctx.shadowColor = preset.glowColor;
    ctx.shadowBlur = 60 * scale / 2;
    ctx.fillStyle = tg;
    ctx.fillText(txt, W / 2, H / 2);
    ctx.shadowBlur = 30 * scale / 2;
    ctx.fillText(txt, W / 2, H / 2);
    ctx.restore();
  };

  // ── Download composed PNG (single still frame)
  const downloadPNG = async () => {
    const stage = stageRef.current;
    const liveSparkles = canvasRef.current;
    if (!stage || !liveSparkles) return;
    setExporting(true);
    try {
      try { await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* ignore */ }

      const r = stage.getBoundingClientRect();
      const scale = 2;
      const W = Math.max(800, Math.round(r.width * scale));
      const H = Math.max(500, Math.round(r.height * scale));
      const out = document.createElement("canvas");
      out.width = W;
      out.height = H;
      const ctx = out.getContext("2d");
      if (!ctx) return;

      paintBg(ctx, W, H, 0.85);
      paintText(ctx, W, H, scale, 0.5);

      // Current sparkle frame on top, scaled
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(liveSparkles, 0, 0, W, H);
      ctx.restore();

      const blob: Blob | null = await new Promise(res => out.toBlob(b => res(b), "image/png"));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = ((text || "sparkle").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "sparkle");
      a.href = url;
      a.download = `${safe}-${presetKey}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } finally {
      setExporting(false);
    }
  };

  // ── Record video (WebM via MediaRecorder + offscreen canvas)
  const downloadVideo = async () => {
    if (typeof MediaRecorder === "undefined") {
      alert("Your browser doesn't support video recording. Try Chrome, Edge, Firefox, or Safari 14.3+.");
      return;
    }
    const stage = stageRef.current;
    if (!stage) return;
    setRecording(true);
    setRecCountdown(videoDuration);
    let countdownTimer: ReturnType<typeof setInterval> | null = null;
    let rafId: number | null = null;
    let stream: MediaStream | null = null;
    try {
      try { await (document as Document & { fonts?: { ready: Promise<unknown> } }).fonts?.ready; } catch { /* ignore */ }

      const r = stage.getBoundingClientRect();
      const scale = 1.5;
      const W = Math.max(800, Math.round(r.width * scale));
      const H = Math.max(500, Math.round(r.height * scale));
      const out = document.createElement("canvas");
      out.width = W;
      out.height = H;
      const ctx = out.getContext("2d");
      if (!ctx) {
        setRecording(false);
        return;
      }

      // Pick a supported MIME type
      const candidates = [
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
      const mime = candidates.find(c => MediaRecorder.isTypeSupported(c)) ?? "video/webm";

      stream = out.captureStream(30);
      const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 5_000_000 });
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

      // Independent particle sim for the video (don't share with on-screen)
      const sparkles: Sparkle[] = [];
      const vidComets: Comet[] = [];
      const vidRings:  Ring[]  = [];
      let vidCometTimer = 0;
      const start = performance.now();
      let lastFrame = start;
      let stopFlag = false;

      const drawParticle = (s: Sparkle) => {
        const a = Math.sin((s.life / s.max) * Math.PI);
        ctx.save();
        ctx.translate(s.x, s.y); ctx.rotate(s.rot);
        ctx.globalAlpha = a; ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = s.col; ctx.shadowColor = s.col; ctx.shadowBlur = s.r * 5;
        ctx.beginPath();
        const r2 = s.r, k = s.r * 0.18;
        ctx.moveTo(0,-r2); ctx.lineTo(k,-k); ctx.lineTo(r2,0); ctx.lineTo(k,k);
        ctx.lineTo(0,r2);  ctx.lineTo(-k,k); ctx.lineTo(-r2,0); ctx.lineTo(-k,-k);
        ctx.closePath(); ctx.fill(); ctx.restore();
      };

      const drawVComet = (c: Comet) => {
        const progress = c.life / c.max;
        const alpha = Math.sin(progress * Math.PI) * c.alpha;
        const tailX = c.x - c.vx * c.len, tailY = c.y - c.vy * c.len;
        const grad = ctx.createLinearGradient(tailX, tailY, c.x, c.y);
        grad.addColorStop(0, "rgba(255,255,255,0)");
        grad.addColorStop(0.6, `${c.col}66`);
        grad.addColorStop(1, c.col);
        ctx.save();
        ctx.globalAlpha = alpha; ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = grad; ctx.lineWidth = 2.5 * scale;
        ctx.shadowColor = c.col; ctx.shadowBlur = 14 * scale;
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(c.x, c.y); ctx.stroke();
        ctx.beginPath(); ctx.fillStyle = "#fff"; ctx.shadowBlur = 20 * scale;
        ctx.arc(c.x, c.y, 2.5 * scale, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      };

      const drawVRing = (ring: Ring) => {
        const progress = ring.life / ring.max;
        const radius = ring.r + (ring.maxR - ring.r) * progress;
        ctx.save();
        ctx.globalAlpha = (1 - progress) * 0.75; ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = ring.col; ctx.shadowColor = ring.col; ctx.shadowBlur = 8 * scale;
        ctx.lineWidth = 1.5 * scale * (1 - progress * 0.7);
        ctx.beginPath(); ctx.arc(ring.x, ring.y, radius, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();
      };

      const renderFrame = (now: number) => {
        if (stopFlag) return;
        const t = (now - start) / 1000;
        const dt = Math.min(50, now - lastFrame) / 16.67;
        lastFrame = now;

        // Pulsing aura
        const phase = (Math.sin(t * Math.PI * 2 / 6 - Math.PI / 2) + 1) / 2;
        paintBg(ctx, W, H, 0.55 + 0.4 * phase);

        // Drifting border ring
        if (preset.aura) {
          ctx.save();
          ctx.translate(W / 2, H / 2);
          ctx.rotate(t * Math.PI * 2 / 28);
          ctx.strokeStyle = preset.glowColor;
          ctx.globalAlpha = 0.22;
          ctx.lineWidth = 1.5 * scale;
          ctx.setLineDash([6 * scale, 14 * scale]);
          ctx.beginPath();
          ctx.arc(0, 0, Math.min(W, H) * 0.21, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // Shimmer + flowing text offset
        const shimmer = (Math.sin(t * Math.PI * 2 / 8) + 1) / 2;
        // slight vertical flow: paint at offset Y then restore
        const flowY = Math.sin(t * Math.PI * 2 / 4) * 6 * scale;
        ctx.save(); ctx.translate(0, flowY);
        paintText(ctx, W, H, scale, shimmer);
        ctx.restore();

        // Comets
        vidCometTimer += dt;
        if (vidCometTimer > 55 + Math.random() * 80) {
          const cols = preset.sparkleColors;
          const edge = Math.floor(Math.random() * 4);
          const speed = (6 + Math.random() * 8) * scale;
          const angle = Math.random() * Math.PI * 0.45 + Math.PI * 0.1;
          let cx2 = 0, cy2 = 0;
          let cvx = Math.cos(angle) * speed;
          let cvy = Math.sin(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
          if (edge === 0)      { cx2 = -20; cy2 = Math.random() * H; }
          else if (edge === 1) { cx2 = W+20; cy2 = Math.random() * H; cvx = -cvx; }
          else if (edge === 2) { cx2 = Math.random()*W; cy2 = -20; cvy = Math.abs(cvy); }
          else                 { cx2 = Math.random()*W; cy2 = H+20; cvy = -Math.abs(cvy); }
          vidComets.push({ x:cx2, y:cy2, vx:cvx, vy:cvy, len:(55+Math.random()*60)*scale,
            col: cols[Math.floor(Math.random()*cols.length)] ?? "#fff",
            life:0, max:55+Math.random()*45, alpha:0.7+Math.random()*0.3 });
          vidCometTimer = 0;
        }
        const keptC: Comet[] = [];
        for (const c of vidComets) {
          c.life += dt; c.x += c.vx * dt; c.y += c.vy * dt;
          if (c.life < c.max) { drawVComet(c); keptC.push(c); }
        }
        vidComets.length = 0; vidComets.push(...keptC);

        // Rings
        const keptR: Ring[] = [];
        for (const ring of vidRings) {
          ring.life += dt;
          if (ring.life < ring.max) { drawVRing(ring); keptR.push(ring); }
        }
        vidRings.length = 0; vidRings.push(...keptR);

        // Sparkles (faster)
        const spawn = Math.max(1, Math.round(density / 18 * dt));
        const cols2 = preset.sparkleColors;
        for (let i = 0; i < spawn; i++) {
          sparkles.push({
            x: Math.random() * W, y: Math.random() * H,
            r: (1.2 + Math.random() * 4) * scale,
            vx: (Math.random() - 0.5) * 1.4 * scale,
            vy: (-0.6 - Math.random() * 1.2) * scale,
            life: 0, max: 28 + Math.random() * 40,
            col: cols2[Math.floor(Math.random() * cols2.length)] ?? "#fff",
            rot: Math.random() * Math.PI,
            vrot: (Math.random() - 0.5) * 0.14,
          });
        }
        if (sparkles.length > 1100) sparkles.splice(0, sparkles.length - 1100);

        const kept: Sparkle[] = [];
        for (const s of sparkles) {
          s.life += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.rot += s.vrot * dt;
          if (s.life < s.max && s.y > -20 && s.y < H + 20 && s.x > -20 && s.x < W + 20) {
            drawParticle(s); kept.push(s);
          } else if (s.life >= s.max && Math.random() < 0.35) {
            vidRings.push({ x:s.x, y:s.y, r:s.r*0.5,
              maxR:s.r*(5+Math.random()*6)*scale, life:0, max:22+Math.random()*18, col:s.col });
          }
        }
        sparkles.length = 0; sparkles.push(...kept);

        rafId = requestAnimationFrame(renderFrame);
      };

      rafId = requestAnimationFrame(renderFrame);
      rec.start();

      // Countdown UI
      countdownTimer = setInterval(() => {
        setRecCountdown(c => Math.max(0, c - 1));
      }, 1000);

      await new Promise<void>(res => setTimeout(res, videoDuration * 1000));
      stopFlag = true;
      if (rafId !== null) cancelAnimationFrame(rafId);

      const stopped = new Promise<void>(res => { rec.onstop = () => res(); });
      rec.stop();
      await stopped;

      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = ((text || "sparkle").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "sparkle");
      a.href = url;
      a.download = `${safe}-${presetKey}-${videoDuration}s.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2500);
    } finally {
      if (countdownTimer !== null) clearInterval(countdownTimer);
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach(t => t.stop());
      setRecording(false);
      setRecCountdown(0);
    }
  };

  return (
    <div data-testid="page-sparkle-text" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #0f172a 0%, #020617 55%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SPARKLE STUDIO · SHIMMER · TEXTURE · PARTICLE ART · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Live 4-arm sparkle particles — the AETHER sparkle studio simulation.</p></div>
          <SparkleTextHeaderCanvas />
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');

        /* gradient shift across text */
        @keyframes sparkleShift {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }

        /* gentle vertical float — the "flow" motion */
        @keyframes textFloat {
          0%   { transform: translateY(0px)   skewX(0deg); }
          25%  { transform: translateY(-7px)  skewX(0.4deg); }
          50%  { transform: translateY(0px)   skewX(0deg); }
          75%  { transform: translateY(6px)   skewX(-0.3deg); }
          100% { transform: translateY(0px)   skewX(0deg); }
        }

        /* letter-scale shimmer pulse */
        @keyframes textPulse {
          0%, 100% { letter-spacing: inherit; filter: brightness(1)   drop-shadow(0 0 0px transparent); }
          40%      { letter-spacing: 0.04em; filter: brightness(1.18) drop-shadow(0 0 22px currentColor); }
        }

        @keyframes auraBreathe {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.92); }
          50%      { opacity: 0.95; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes ringDrift {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes recPulse {
          0%, 100% { opacity: 0.65; }
          50%      { opacity: 1; }
        }
      `}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {/* Masthead */}
        <header style={{ marginBottom:"1.6rem" }}>
          <div style={{ fontSize:11, letterSpacing:"0.4em", color:"#a78bfa",
            fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:8 }}>AETHER · Sparkle Studio</div>
          <h1 style={{ fontSize:"clamp(1.8rem, 4vw, 2.6rem)", fontWeight:800, color:"#f1f5f9",
            margin:"0 0 0.4rem", letterSpacing:"-0.02em" }}>Sparkly Text Generator</h1>
          <p style={{ fontSize:"0.95rem", color:"#cbd5e1", maxWidth:780, lineHeight:1.6 }}>
            Type something. Pick a texture. Watch it shimmer. Ten textures pulled from across the AETHER system —
            Aether · Lunar Tide · Boho Bloom · Verdant Spark · Eris Field · Cosmic · Flower · Silk · Wave · Sand.
            Export a still PNG or a short looping WebM video.
          </p>
        </header>

        {/* Stage */}
        <div ref={stageRef} style={{
          position:"relative", borderRadius:18, overflow:"hidden",
          background: preset.bg,
          border:"1px solid rgba(255,255,255,0.1)",
          minHeight:420, padding:"3rem 1.5rem",
          display:"flex", alignItems:"center", justifyContent:"center",
          marginBottom:"1.4rem",
          transition:"background 0.6s ease",
        }}>
          {/* Aura ring — pulsing resonance core */}
          {preset.aura && (
            <>
              <div aria-hidden style={{
                position:"absolute", left:"50%", top:"50%",
                width:"68%", aspectRatio:"1 / 1",
                borderRadius:"50%",
                background: `radial-gradient(circle at 50% 50%, ${preset.aura[0]?.color ?? "rgba(167,139,250,0.35)"} 0%, ${preset.aura[1]?.color ?? "rgba(95,200,255,0.18)"} 45%, rgba(0,0,0,0) 72%)`,
                filter:"blur(8px)",
                transform:"translate(-50%, -50%)",
                animation: paused ? "none" : "auraBreathe 6s ease-in-out infinite",
                pointerEvents:"none",
                zIndex:1,
              }}/>
              <div aria-hidden style={{
                position:"absolute", left:"50%", top:"50%",
                width:"42%", aspectRatio:"1 / 1",
                borderRadius:"50%",
                border:`1px dashed ${preset.glowColor}`,
                opacity:0.22,
                transform:"translate(-50%, -50%)",
                animation: paused ? "none" : "ringDrift 28s linear infinite",
                pointerEvents:"none",
                zIndex:1,
              }}/>
            </>
          )}

          {/* sparkle canvas */}
          <canvas ref={canvasRef} style={{
            position:"absolute", inset:0, width:"100%", height:"100%",
            pointerEvents:"none",
          }}/>

          {/* the text itself — flow wrapper + gradient text */}
          <div style={{
            position:"relative", zIndex:2,
            animation: paused ? "none" : "textFloat 4s ease-in-out infinite",
            willChange: "transform",
          }}>
            <div style={{
              fontFamily: preset.fontFamily,
              fontWeight: 800,
              fontSize: `clamp(2.5rem, ${size / 10}vw, ${size}px)`,
              lineHeight: 1.05,
              textAlign:"center",
              backgroundImage: preset.textGradient,
              backgroundSize: "300% 300%",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              filter: `drop-shadow(${preset.shadow})`,
              wordBreak:"break-word",
              animation: paused ? "none"
                : "sparkleShift 8s ease-in-out infinite, textPulse 5s ease-in-out infinite",
            }}>
              {text || "Sparkle"}
            </div>
          </div>

          {/* Recording badge */}
          {recording && (
            <div data-testid="rec-badge" style={{
              position:"absolute", top:14, right:14, zIndex:3,
              display:"flex", alignItems:"center", gap:8,
              padding:"6px 12px", borderRadius:999,
              background:"rgba(0,0,0,0.55)", border:"1px solid rgba(255,80,100,0.6)",
              fontSize:12, fontFamily:"'DM Mono',monospace", letterSpacing:"0.18em",
              textTransform:"uppercase", color:"#ffd0d8",
            }}>
              <span style={{
                width:10, height:10, borderRadius:"50%", background:"#ff5060",
                boxShadow:"0 0 12px #ff5060",
                animation:"recPulse 1s ease-in-out infinite",
              }}/>
              REC · {recCountdown}s
            </div>
          )}
        </div>

        {/* Action row: PNG + Video + Pause */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:"1rem" }}>
          <button
            onClick={downloadPNG}
            disabled={exporting || recording}
            data-testid="btn-download-png"
            style={{
              flex:"1 1 200px",
              padding:"0.85rem 1.1rem", borderRadius:12,
              background: exporting
                ? "rgba(167,139,250,0.18)"
                : "linear-gradient(135deg, rgba(167,139,250,0.32), rgba(95,200,255,0.22))",
              border:"1px solid rgba(167,139,250,0.55)",
              color:"#f8fafc",
              fontSize:"0.95rem", fontWeight:700, letterSpacing:"0.04em",
              cursor: (exporting || recording) ? "not-allowed" : "pointer",
              fontFamily:"inherit",
              opacity: recording ? 0.5 : 1,
              boxShadow:"0 0 30px rgba(167,139,250,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
              transition:"transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease",
            }}>
            {exporting ? "✦ Composing PNG…" : "↓ Download PNG"}
          </button>
          <button
            onClick={downloadVideo}
            disabled={recording || exporting}
            data-testid="btn-download-video"
            style={{
              flex:"1 1 200px",
              padding:"0.85rem 1.1rem", borderRadius:12,
              background: recording
                ? "rgba(255,80,100,0.22)"
                : "linear-gradient(135deg, rgba(255,140,100,0.3), rgba(167,139,250,0.22))",
              border:`1px solid ${recording ? "rgba(255,80,100,0.6)" : "rgba(255,170,140,0.55)"}`,
              color:"#f8fafc",
              fontSize:"0.95rem", fontWeight:700, letterSpacing:"0.04em",
              cursor: (recording || exporting) ? "wait" : "pointer",
              fontFamily:"inherit",
              opacity: exporting ? 0.5 : 1,
              boxShadow:"0 0 30px rgba(255,140,100,0.18), inset 0 1px 0 rgba(255,255,255,0.08)",
              transition:"all 0.18s ease",
            }}>
            {recording ? `● Recording · ${recCountdown}s` : `▸ Download Video (${videoDuration}s · WebM)`}
          </button>
          <button
            onClick={() => setPaused(p => !p)}
            data-testid="btn-pause"
            disabled={recording}
            style={{
              flex:"1 1 180px",
              padding:"0.85rem 1.1rem", borderRadius:12,
              background: paused ? "rgba(167,139,250,0.2)" : "rgba(15,23,42,0.55)",
              border:"1px solid rgba(255,255,255,0.12)", color:"#f1f5f9",
              fontSize:"0.95rem", fontWeight:600,
              cursor: recording ? "not-allowed" : "pointer",
              fontFamily:"inherit",
              opacity: recording ? 0.5 : 1,
            }}>
            {paused ? "▶ Resume" : "⏸ Pause"}
          </button>
        </div>

        {/* Video duration pills */}
        <div style={{ display:"flex", gap:6, marginBottom:"1.2rem", alignItems:"center" }}>
          <span style={{ fontSize:11, color:"#94a3b8", fontFamily:"'DM Mono',monospace",
            letterSpacing:1.5, textTransform:"uppercase", marginRight:6 }}>Video Length</span>
          {VIDEO_DURATIONS.map(d => {
            const active = d.sec === videoDuration;
            return (
              <button key={d.sec}
                onClick={() => setVideoDuration(d.sec)}
                disabled={recording}
                data-testid={`dur-${d.sec}`}
                style={{
                  padding:"0.4rem 0.9rem", borderRadius:999,
                  background: active ? "rgba(167,139,250,0.28)" : "rgba(15,23,42,0.55)",
                  border:`1px solid ${active ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.1)"}`,
                  color:"#f1f5f9", fontSize:"0.82rem", fontWeight:600,
                  cursor: recording ? "not-allowed" : "pointer",
                  fontFamily:"inherit",
                  opacity: recording ? 0.5 : 1,
                }}>{d.label}</button>
            );
          })}
        </div>

        {/* Preset chips */}
        <div style={{ display:"grid", gap:8, marginBottom:"1.2rem",
          gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))" }}>
          {PRESETS.map(p => {
            const active = p.key === presetKey;
            return (
              <button key={p.key}
                onClick={() => setPresetKey(p.key)}
                data-testid={`preset-${p.key}`}
                style={{
                  padding:"0.7rem 0.9rem", borderRadius:12,
                  background: active
                    ? "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(56,189,248,0.14))"
                    : "rgba(15,23,42,0.55)",
                  border: `1px solid ${active ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.08)"}`,
                  color:"#f1f5f9", textAlign:"left", cursor:"pointer",
                  transition:"all 0.2s",
                }}>
                <div style={{ fontSize:10, color:"#a78bfa", fontFamily:"'DM Mono',monospace",
                  letterSpacing:1.5, textTransform:"uppercase", marginBottom:3 }}>{p.kicker}</div>
                <div style={{ fontSize:"0.95rem", fontWeight:700, display:"flex",
                  alignItems:"baseline", justifyContent:"space-between", gap:8 }}>
                  <span>{p.label}</span>
                  {p.source && (
                    <span style={{ fontSize:9, color:"#64748b", fontFamily:"'DM Mono',monospace",
                      letterSpacing:1, textTransform:"uppercase" }}>· {p.source}</span>
                  )}
                </div>
                <div style={{ marginTop:6, height:6, borderRadius:3, background: p.textGradient }} />
              </button>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{
          padding:"1.2rem 1.4rem", borderRadius:14,
          background:"rgba(15,23,42,0.55)", border:"1px solid rgba(255,255,255,0.08)",
          display:"grid", gap:"1rem",
          gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 260px), 1fr))",
        }}>
          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:11, color:"#a78bfa", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase" }}>Text</span>
            <input value={text} onChange={e => setText(e.target.value)}
              maxLength={80}
              data-testid="input-text"
              style={{ padding:"0.65rem 0.85rem", borderRadius:8,
                background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.1)",
                color:"#f1f5f9", fontSize:"0.95rem", fontFamily:"inherit" }}/>
          </label>
          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:11, color:"#a78bfa", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase" }}>Size · {size}px</span>
            <input type="range" min={48} max={240} value={size} onChange={e => setSize(Number(e.target.value))}
              data-testid="input-size" style={{ accentColor:"#a78bfa" }}/>
          </label>
          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:11, color:"#a78bfa", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase" }}>Sparkle Density · {density}</span>
            <input type="range" min={10} max={150} value={density} onChange={e => setDensity(Number(e.target.value))}
              data-testid="input-density" style={{ accentColor:"#a78bfa" }}/>
          </label>
        </div>

        <footer style={{ marginTop:"2rem", paddingTop:"1.2rem",
          borderTop:"1px solid rgba(255,255,255,0.08)",
          fontSize:"0.78rem", color:"#64748b",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.18em", textTransform:"uppercase",
          textAlign:"center" }}>
          10 textures · pulsing aura · drifting ring · 4-point sparkles · png + webm export
        </footer>
      </div>
    </div>
  );
}

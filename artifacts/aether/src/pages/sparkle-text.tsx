import { useEffect, useMemo, useRef, useState } from "react";

type PresetKey = "aether" | "cosmic" | "flower" | "silk" | "wave" | "sand";

interface Stop { offset: number; color: string; }
interface Preset {
  key: PresetKey;
  label: string;
  kicker: string;
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

export default function SparkleTextPage() {
  const [text, setText] = useState("AETHER");
  const [size, setSize] = useState(140);
  const [density, setDensity] = useState(70);
  const [presetKey, setPresetKey] = useState<PresetKey>("aether");
  const [paused, setPaused] = useState(false);
  const [exporting, setExporting] = useState(false);
  const preset = useMemo(() => PRESETS.find(p => p.key === presetKey) ?? PRESETS[0]!, [presetKey]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const sparklesRef = useRef<Sparkle[]>([]);
  const rafRef = useRef<number | null>(null);
  const pausedRef = useRef(paused);
  const presetRef = useRef(preset);
  const densityRef = useRef(density);

  useEffect(() => { pausedRef.current = paused; }, [paused]);
  useEffect(() => { presetRef.current = preset; }, [preset]);
  useEffect(() => { densityRef.current = density; }, [density]);

  // ── Sparkle animation loop
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

    const drawSparkle = (s: Sparkle) => {
      const a = Math.sin((s.life / s.max) * Math.PI);
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.globalAlpha = a;
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = s.col;
      ctx.shadowColor = s.col;
      ctx.shadowBlur = s.r * 4;
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

    const tick = (now: number) => {
      const dt = Math.min(50, now - last) / 16.67;
      last = now;
      const w = canvas.clientWidth, h = canvas.clientHeight;
      ctx.clearRect(0, 0, w, h);

      if (!pausedRef.current) {
        const spawn = Math.max(0, Math.round(densityRef.current / 30 * dt));
        for (let i = 0; i < spawn; i++) {
          const cols = presetRef.current.sparkleColors;
          sparklesRef.current.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: 1 + Math.random() * 3.5,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.15 - Math.random() * 0.3,
            life: 0,
            max: 60 + Math.random() * 90,
            col: cols[Math.floor(Math.random() * cols.length)] ?? "#fff",
            rot: Math.random() * Math.PI,
            vrot: (Math.random() - 0.5) * 0.04,
          });
        }
        if (sparklesRef.current.length > 600) {
          sparklesRef.current.splice(0, sparklesRef.current.length - 600);
        }
      }

      const next: Sparkle[] = [];
      for (const s of sparklesRef.current) {
        s.life += dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.rot += s.vrot * dt;
        if (s.life < s.max && s.y > -10 && s.y < h + 10 && s.x > -10 && s.x < w + 10) {
          drawSparkle(s);
          next.push(s);
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
    };
  }, []);

  // ── Helper: paint one of the preset gradients into a canvas ctx
  const paintBg = (ctx: CanvasRenderingContext2D, W: number, H: number) => {
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
      const aura = ctx.createRadialGradient(W * 0.5, H * 0.5, 0, W * 0.5, H * 0.5, Math.min(W, H) * 0.55);
      preset.aura.forEach(s => aura.addColorStop(s.offset, s.color));
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, W, H);
    }
  };

  // ── Download composed PNG (background + aura + text + current sparkles)
  const downloadPNG = async () => {
    const stage = stageRef.current;
    const liveSparkles = canvasRef.current;
    if (!stage || !liveSparkles) return;
    setExporting(true);
    try {
      // Best-effort: ensure Cinzel is loaded so canvas fillText uses it
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

      paintBg(ctx, W, H);

      // Text
      const txt = (text || "Sparkle").trim();
      const maxW = W - 120 * scale / 2;
      let fs = Math.round(size * scale * 0.95);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const fontFor = (n: number) => `800 ${n}px ${preset.fontFamily}`;
      ctx.font = fontFor(fs);
      while (fs > 24 && ctx.measureText(txt).width > maxW) {
        fs -= 6;
        ctx.font = fontFor(fs);
      }

      // Build text-fill gradient sized to the rendered text
      const tw = ctx.measureText(txt).width;
      const th = fs;
      const ta = ((preset.textAngle ?? 110) - 90) * Math.PI / 180;
      const tdx = Math.cos(ta) * tw / 2;
      const tdy = Math.sin(ta) * th / 2;
      const tg = ctx.createLinearGradient(W / 2 - tdx, H / 2 - tdy, W / 2 + tdx, H / 2 + tdy);
      preset.textStops.forEach(s => tg.addColorStop(s.offset, s.color));

      // Glow halo (two passes, like the CSS drop-shadow)
      ctx.save();
      ctx.shadowColor = preset.glowColor;
      ctx.shadowBlur = 60 * scale / 2;
      ctx.fillStyle = tg;
      ctx.fillText(txt, W / 2, H / 2);
      ctx.shadowBlur = 30 * scale / 2;
      ctx.fillText(txt, W / 2, H / 2);
      ctx.restore();

      // Current sparkle frame on top, scaled
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(liveSparkles, 0, 0, W, H);
      ctx.restore();

      const blob: Blob | null = await new Promise(res => out.toBlob(b => res(b), "image/png"));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safe = (txt.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 24) || "sparkle");
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

  return (
    <div data-testid="page-sparkle-text" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #0f172a 0%, #020617 55%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;800&family=DM+Mono&family=Outfit:wght@400;600;700&display=swap');
        @keyframes sparkleShift {
          0%, 100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }
        @keyframes auraBreathe {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.92); }
          50%      { opacity: 0.95; transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes ringDrift {
          0%   { transform: translate(-50%, -50%) rotate(0deg); }
          100% { transform: translate(-50%, -50%) rotate(360deg); }
        }
      `}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {/* Masthead */}
        <header style={{ marginBottom:"1.6rem" }}>
          <div style={{ fontSize:11, letterSpacing:"0.4em", color:"#a78bfa",
            fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:8 }}>AETHER · Sparkle Studio</div>
          <h1 style={{ fontSize:"clamp(1.8rem, 4vw, 2.6rem)", fontWeight:800, color:"#f1f5f9",
            margin:"0 0 0.4rem", letterSpacing:"-0.02em" }}>Sparkly Text Generator</h1>
          <p style={{ fontSize:"0.95rem", color:"#cbd5e1", maxWidth:720, lineHeight:1.6 }}>
            Type something. Pick a texture. Watch it shimmer. Aether · Cosmic Sunset · Flower · Silk · Wave · Sand. Download what you make as a PNG.
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
                border:`1px solid ${preset.glowColor}`,
                opacity:0.18,
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

          {/* the text itself */}
          <div style={{
            position:"relative", zIndex:2,
            fontFamily: preset.fontFamily,
            fontWeight: 800,
            fontSize: `clamp(2.5rem, ${size / 10}vw, ${size}px)`,
            lineHeight: 1.05,
            textAlign:"center",
            backgroundImage: preset.textGradient,
            backgroundSize: "200% 200%",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(${preset.shadow})`,
            wordBreak:"break-word",
            animation: paused ? "none" : "sparkleShift 8s ease-in-out infinite",
          }}>
            {text || "Sparkle"}
          </div>
        </div>

        {/* Action row: download + pause */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:"1.2rem" }}>
          <button
            onClick={downloadPNG}
            disabled={exporting}
            data-testid="btn-download"
            style={{
              flex:"1 1 220px",
              padding:"0.85rem 1.1rem", borderRadius:12,
              background: exporting
                ? "rgba(167,139,250,0.18)"
                : "linear-gradient(135deg, rgba(167,139,250,0.32), rgba(95,200,255,0.22))",
              border:"1px solid rgba(167,139,250,0.55)",
              color:"#f8fafc",
              fontSize:"0.95rem", fontWeight:700, letterSpacing:"0.04em",
              cursor: exporting ? "wait" : "pointer",
              fontFamily:"inherit",
              boxShadow:"0 0 30px rgba(167,139,250,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
              transition:"transform 0.18s ease, box-shadow 0.18s ease",
            }}>
            {exporting ? "✦ Composing PNG…" : "↓ Download PNG"}
          </button>
          <button
            onClick={() => setPaused(p => !p)}
            data-testid="btn-pause"
            style={{
              flex:"1 1 220px",
              padding:"0.85rem 1.1rem", borderRadius:12,
              background: paused ? "rgba(167,139,250,0.2)" : "rgba(15,23,42,0.55)",
              border:"1px solid rgba(255,255,255,0.12)", color:"#f1f5f9",
              fontSize:"0.95rem", fontWeight:600, cursor:"pointer", fontFamily:"inherit",
            }}>
            {paused ? "▶ Resume Sparkle" : "⏸ Pause Sparkle"}
          </button>
        </div>

        {/* Preset chips */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:"1.2rem" }}>
          {PRESETS.map(p => {
            const active = p.key === presetKey;
            return (
              <button key={p.key}
                onClick={() => setPresetKey(p.key)}
                data-testid={`preset-${p.key}`}
                style={{
                  flex:"1 1 180px", minWidth:160,
                  padding:"0.7rem 0.9rem", borderRadius:12,
                  background: active
                    ? "linear-gradient(135deg, rgba(167,139,250,0.18), rgba(56,189,248,0.14))"
                    : "rgba(15,23,42,0.55)",
                  border: `1px solid ${active ? "rgba(167,139,250,0.55)" : "rgba(255,255,255,0.08)"}`,
                  color:"#f1f5f9", textAlign:"left", cursor:"pointer",
                  transition:"all 0.2s",
                }}>
                <div style={{ fontSize:11, color:"#a78bfa", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase", marginBottom:3 }}>{p.kicker}</div>
                <div style={{ fontSize:"0.95rem", fontWeight:700 }}>{p.label}</div>
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
          6 textures · pulsing aura · 4-point sparkles · gradient text · png export
        </footer>
      </div>
    </div>
  );
}

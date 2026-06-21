import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const T = {
  bg: "#020108", surf: "#07050f", dim: "#0f0c1c",
  gyro: "#9333ea", morph: "#3b82f6", cham: "#22c55e",
  refl: "#06b6d4", chro: "#f97316", cutt: "#60a5fa",
  boulig: "#84cc16", pearl: "#d4af7a", crab: "#ef4444",
  kill: "#f43f5e", ok: "#4ade80", gold: "#fbbf24",
  text: "#c8b8ff", muted: "#3a2d60", white: "#f0eaff",
  mono: "'Space Mono', 'JetBrains Mono', monospace",
  display: "'Syne', 'Inter', sans-serif",
};

const GW = 52, GH = 32;
type Cell = { h: number; s: number; l: number; phase: number; gyro: number; lock: number };

function makeCells(): Cell[][] {
  return Array.from({ length: GH }, () =>
    Array.from({ length: GW }, () => ({
      h: 160 + Math.random() * 60, s: 50 + Math.random() * 30, l: 20 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2, gyro: Math.random(), lock: 0,
    }))
  );
}

const SKIN_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#9333ea"];

type LogEntry = { t: number; msg: string; type: "ok" | "w" | "e" | "g" };

function CucaGyroidCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      for(let i=0;i<6;i++){
        const ang=i*(Math.PI/3)+t*0.01;
        const r=40+20*Math.sin(t*0.025+i);
        const x=cx+r*Math.cos(ang), y=cy+r*Math.sin(ang);
        const g=ctx.createRadialGradient(x,y,0,x,y,14);
        const hue=270+i*20;
        g.addColorStop(0,`hsla(${hue},80%,60%,0.73)`); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(x,y,12,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
        ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(x,y);
        ctx.strokeStyle=`hsla(${hue},80%,60%,0.13)`; ctx.lineWidth=1; ctx.stroke();
      }
      const iso: [number,number][]=[[-70,0],[70,0],[0,60],[-70,0]];
      const skew=(x:number,y:number):[number,number]=>[cx+x+y*0.3,cy-y*0.5+20*Math.sin(t*0.02)];
      ctx.beginPath();
      iso.forEach(([ix,iy],i)=>{ const [sx,sy]=skew(ix,iy); if(i===0) ctx.moveTo(sx,sy); else ctx.lineTo(sx,sy); });
      ctx.strokeStyle="rgba(147,51,234,0.25)"; ctx.lineWidth=1.5; ctx.stroke();
      ctx.fillStyle="rgba(147,51,234,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CUCA GYROID v3.0 · TRIPLY-PERIODIC MINIMAL SURFACE · PHOTONIC SCAFFOLD · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CucaGyroidPage() {
  const cnv0 = useRef<HTMLCanvasElement | null>(null);
  const cnv1 = useRef<HTMLCanvasElement | null>(null);
  const cnv2 = useRef<HTMLCanvasElement | null>(null);
  const cnv3 = useRef<HTMLCanvasElement | null>(null);
  const cnv = [cnv0, cnv1, cnv2, cnv3];
  const synthRef = useRef<HTMLCanvasElement | null>(null);

  const [running, setRunning] = useState(false);
  const [gyroOn, setGyroOn] = useState(true);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [C, setC] = useState([0.7, 0.75, 0.8, 0.9]);

  const stateRef = useRef({
    t: 0, chessD: 0, tumorD: 0, gyroOn: true,
    skins: Array.from({ length: 4 }, () => makeCells()),
    C: [0.7, 0.75, 0.8, 0.9],
  });
  useEffect(() => { stateRef.current.gyroOn = gyroOn; }, [gyroOn]);

  useEffect(() => {
    const id = "gyroid-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const resize = () => {
      cnv.forEach(r => {
        if (!r.current) return;
        const rect = r.current.parentElement!.getBoundingClientRect();
        r.current.width = rect.width; r.current.height = 140;
      });
      if (synthRef.current) {
        const sr = synthRef.current.parentElement!.getBoundingClientRect();
        synthRef.current.width = sr.width; synthRef.current.height = 520;
      }
      drawAll(); drawSynth();
    };
    setTimeout(resize, 50);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line
  }, []);

  function log(msg: string, type: LogEntry["type"] = "ok") {
    setLogs(prev => [{ t: stateRef.current.t, msg, type }, ...prev].slice(0, 8));
  }

  function step() {
    const s = stateRef.current;
    s.t++;
    s.chessD = Math.max(0, s.chessD * 0.97);
    s.tumorD = Math.max(0, s.tumorD * 0.98);
    const env = s.chessD + s.tumorD * 0.5;

    // P8 CHROMATOPHORE
    let C0 = Math.max(0, 0.7 - env * 0.85 + Math.sin(s.t * 0.04) * 0.05 + (Math.random() - 0.5) * 0.03);
    if (s.chessD > 0.3 && C0 < 0.25) C0 = Math.max(0, C0 - 0.05);
    s.C[0] = C0;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = s.skins[0][y][x]; c.phase += 0.08 + env * 0.06;
      const wave = Math.sin(c.phase) * 0.5 + 0.5;
      let th: number, ts: number, tl: number;
      if (s.chessD > 0.4) { th = (Math.random() > 0.5 ? 0 : 180) + Math.random() * 40; ts = 20 + Math.random() * 70; tl = Math.random() > 0.5 ? 5 : 75; }
      else { th = 150 + wave * 80 + env * 40; ts = 45 + env * 30; tl = 15 + wave * 20 + env * 5; }
      c.h += (th - c.h) * 0.22; c.s += (ts - c.s) * 0.22; c.l += (tl - c.l) * 0.22;
    }

    // P4+P6 MORPHO + REFLECTIN
    const C1 = Math.max(0, 0.75 - env * 0.5 + Math.sin(s.t * 0.03) * 0.06 + (Math.random() - 0.5) * 0.02);
    s.C[1] = C1;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = s.skins[1][y][x]; c.phase += 0.06 + env * 0.04;
      const wave = Math.sin(c.phase) * 0.5 + 0.5;
      const morphoShimmer = Math.sin(x * 0.3 + s.t * 0.02) * 0.5 + 0.5;
      let th = 190 + morphoShimmer * 40 - s.chessD * 80;
      let ts = 50 + C1 * 30; let tl = 15 + wave * 25 + morphoShimmer * 15;
      if (s.chessD > 0.5) { th += Math.sin(x * 0.8) * 30; ts -= 20; }
      c.h += (th - c.h) * 0.16; c.s += (ts - c.s) * 0.16; c.l += (tl - c.l) * 0.16;
    }

    // P5+P7 NANOCRYSTAL + DISRUPTIVE
    const C2 = Math.max(0, 0.8 - env * 0.35 + Math.sin(s.t * 0.025) * 0.04 + (Math.random() - 0.5) * 0.015);
    s.C[2] = C2;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = s.skins[2][y][x]; c.phase += 0.05 + env * 0.03;
      const wave = Math.sin(c.phase) * 0.5 + 0.5;
      let th: number, ts: number, tl: number;
      if (s.chessD > 0.3) {
        const patch = ((Math.floor(x / 7) + Math.floor(y / 5)) % 2);
        th = patch ? 0 : 200; ts = 30 + C2 * 50; tl = patch ? 8 + C2 * 15 : 55 + C2 * 10;
      } else {
        th = 155 + wave * 60 + s.tumorD * 40; ts = 50 + C2 * 25; tl = 18 + wave * 22 + C2 * 12;
      }
      c.h += (th - c.h) * 0.15; c.s += (ts - c.s) * 0.15; c.l += (tl - c.l) * 0.15;
    }

    // P0–P9 FULL GYROID
    const gyroFloor = s.gyroOn ? 0.88 : 0.65;
    const C3 = Math.min(0.97, Math.max(s.gyroOn ? gyroFloor * 0.85 : 0.2,
      gyroFloor - env * (s.gyroOn ? 0.12 : 0.7) + Math.sin(s.t * 0.02) * 0.03 + (Math.random() - 0.5) * 0.01));
    s.C[3] = C3;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = s.skins[3][y][x]; c.phase += 0.05 + env * 0.02;
      const wave = Math.sin(c.phase) * 0.5 + 0.5;
      const gyX = Math.sin(x * 0.4 + s.t * 0.015), gyY = Math.sin(y * 0.4 + s.t * 0.012), gyZ = Math.sin((x + y) * 0.28 + s.t * 0.01);
      const gyro3D = (gyX + gyY + gyZ) / 3 * 0.5 + 0.5;
      c.gyro += (gyro3D - c.gyro) * (s.gyroOn ? 0.04 : 0.12);
      let th: number, ts: number, tl: number;
      if (s.chessD > 0.3) {
        const patch = ((Math.floor(x / 7) + Math.floor(y / 5)) % 2);
        const stab = s.gyroOn ? 0.85 : 0.3;
        th = patch ? 280 : 120 + c.gyro * 80;
        ts = 40 + stab * 45; tl = patch ? 12 + stab * 20 : 45 + stab * 15 + wave * 5;
      } else {
        th = 260 + c.gyro * 100 + wave * 20; ts = 55 + C3 * 30; tl = 15 + c.gyro * 30 + wave * 15 + C3 * 15;
      }
      c.h += (th - c.h) * 0.12; c.s += (ts - c.s) * 0.12; c.l += (tl - c.l) * 0.12;
    }

    if (s.t % 5 === 0) setC([...s.C]);
  }

  function drawSkin(idx: number) {
    const cv = cnv[idx].current; if (!cv || !cv.width) return;
    const s = stateRef.current;
    const ctx = cv.getContext("2d")!;
    ctx.clearRect(0, 0, cv.width, cv.height);
    const cw = cv.width / GW, ch = cv.height / GH;
    const cells = s.skins[idx];
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = cells[y][x];
      ctx.fillStyle = `hsl(${((c.h % 360) + 360) % 360},${Math.max(8, Math.min(92, c.s))}%,${Math.max(4, Math.min(84, c.l))}%)`;
      ctx.fillRect(x * cw, y * ch, cw, ch);
      if (idx === 3 && s.gyroOn && c.gyro > 0.4) {
        const gs = Math.sin(c.phase * 1.6 + x * 0.5 + y * 0.4) * 0.5 + 0.5;
        ctx.fillStyle = `hsla(${(c.h + 120) % 360},90%,75%,${c.gyro * gs * 0.25})`;
        ctx.fillRect(x * cw, y * ch, cw, ch);
        if (c.gyro > 0.65 && (x % 5 === 0 || y % 5 === 0)) {
          ctx.fillStyle = `hsla(270,80%,80%,${c.gyro * 0.15})`;
          ctx.fillRect(x * cw, y * ch, cw, ch);
        }
      }
      if (idx === 1) {
        const ms = Math.sin(x * 0.3 + s.t * 0.02) * 0.5 + 0.5;
        ctx.fillStyle = `hsla(${(c.h + 160) % 360},80%,70%,${ms * s.C[1] * 0.15})`;
        ctx.fillRect(x * cw, y * ch, cw, ch);
      }
    }
    const Cv = s.C[idx];
    ctx.fillStyle = "rgba(0,0,0,.45)"; ctx.fillRect(0, 0, cv.width, 14);
    ctx.fillStyle = SKIN_COLORS[idx] + "cc"; ctx.font = "8px 'Space Mono', monospace";
    ctx.fillText(`C=${Cv.toFixed(3)}  ${idx === 3 && s.gyroOn ? "GYROID FLOOR ACTIVE" : ""}`, 6, 10);
  }

  function drawAll() { for (let i = 0; i < 4; i++) drawSkin(i); }

  function drawSynth() {
    const cv = synthRef.current; if (!cv || !cv.width) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "rgba(147,51,234,.06)");
    bg.addColorStop(0.5, "rgba(6,182,212,.03)");
    bg.addColorStop(1, "rgba(212,175,122,.05)");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const layers = [
      { y: 0.04, h: 0.07, color: "#2d6a1e", label: "L0 AETHER FABRIC", sub: "Geomagnetic · Schumann · Bioelectric · Ionic gradients", icon: "🌍" },
      { y: 0.12, h: 0.08, color: "#1a3d6e", label: "L1 MOLECULAR SUBSTRATE", sub: "Patient autologous cells · SynHG cassette · Bouligand chitin scaffold · Pearl nacre memory", icon: "🧬" },
      { y: 0.21, h: 0.08, color: "#006d77", label: "L2 QUANTUM-BIO COMPUTATION", sub: "Squid reflectin rugate Bragg · ENAQT · Proton tunneling", icon: "⚡" },
      { y: 0.30, h: 0.08, color: "#8b6914", label: "L3 SIGNAL FIDELITY + PHOTONIC FLOOR", sub: "Lycaenid gyroid 3D bandgap (PASSIVE FLOOR) · Chameleon S-iridophore · Repressilator clock", icon: "✦" },
      { y: 0.39, h: 0.08, color: "#2e75b6", label: "L4 CLCS CONTROL", sub: "Morpho multilayer flash · Chromatophore direct control · dCas9 gate · Toggle switch", icon: "⚙️" },
      { y: 0.48, h: 0.08, color: "#4a1f6e", label: "L5 COHERENCE ENGINE", sub: "C(x,t) = f(d_gyroid) + Δ(reflectin,nano) − ‖E‖/‖X*‖ · Cuttlefish disruptive logic · ∇C gradient", icon: "🌀" },
      { y: 0.57, h: 0.08, color: "#1a5c3a", label: "L6 META-LEARNING + REPLICATION", sub: "PACE evolution · HGT plasmid Z capsule · ΔN ∝ −∇C · New circuit motifs", icon: "🧠" },
      { y: 0.66, h: 0.10, color: "#8b1a1a", label: "L7 EMBODIMENT + KILL SWITCH", sub: "Anthrobot human cells · Triple kill switch: auxotrophy + mazF + timer · Mission-complete termination", icon: "☠️" },
    ];
    layers.forEach(l => {
      const y = l.y * H, h = l.h * H;
      ctx.fillStyle = l.color + "22"; ctx.fillRect(0, y, W, h);
      ctx.strokeStyle = l.color + "55"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, y + h); ctx.lineTo(W, y + h); ctx.stroke();
      ctx.font = "16px serif"; ctx.fillText(l.icon, 12, y + h / 2 + 6);
      ctx.fillStyle = l.color + "ff"; ctx.font = "bold 9px 'Space Mono', monospace";
      ctx.fillText(l.label, 36, y + h / 2 - 2);
      ctx.fillStyle = "rgba(200,184,255,.45)"; ctx.font = "8px 'Space Mono', monospace";
      ctx.fillText(l.sub, 36, y + h / 2 + 11);
    });

    const pLayers = [
      { name: "P1\nBouligand", color: "#84cc16", x: 0.72 },
      { name: "P3\nGyroid",    color: "#9333ea", x: 0.78 },
      { name: "P4\nMorpho",    color: "#3b82f6", x: 0.84 },
      { name: "P5\nNanocrystal",color:"#22c55e", x: 0.88 },
      { name: "P6\nReflectin", color: "#06b6d4", x: 0.92 },
      { name: "P7\nDisruptive",color: "#60a5fa", x: 0.96 },
      { name: "P8\nChromato",  color: "#f97316", x: 0.993 },
    ];
    ctx.font = "7px 'Space Mono', monospace"; ctx.fillStyle = "rgba(200,184,255,.3)";
    ctx.fillText("PHOTONIC LAYERS →", W * 0.7, H * 0.03);
    pLayers.forEach(p => {
      const px = p.x * W, barW = 22;
      ctx.fillStyle = p.color + "15"; ctx.fillRect(px - barW / 2, H * 0.04, barW, H * 0.9);
      ctx.strokeStyle = p.color + "40"; ctx.lineWidth = 1;
      ctx.strokeRect(px - barW / 2, H * 0.04, barW, H * 0.9);
      ctx.fillStyle = p.color + "cc"; ctx.font = "6px 'Space Mono', monospace"; ctx.textAlign = "center";
      p.name.split("\n").forEach((l, i) => ctx.fillText(l, px, H * 0.05 + i * 9));
      ctx.textAlign = "left";
    });

    const animals = [
      { icon: "🦪", name: "Pearl",      y: 0.13, layers: [0, 1],          color: "#d4af7a" },
      { icon: "🦀", name: "Crab",       y: 0.14, layers: [0, 1, 2],       color: "#ef4444" },
      { icon: "🦋", name: "Butterfly",  y: 0.34, layers: [2, 3],          color: "#a855f7" },
      { icon: "🦎", name: "Chameleon",  y: 0.34, layers: [3, 4],          color: "#22c55e" },
      { icon: "🦑", name: "Squid",      y: 0.24, layers: [1, 2, 3],       color: "#06b6d4" },
      { icon: "🦑", name: "Cuttlefish", y: 0.44, layers: [3, 4],          color: "#60a5fa" },
      { icon: "🐙", name: "Octopus",    y: 0.44, layers: [3, 4],          color: "#f97316" },
      { icon: "✦", name: "Hybrid v3",   y: 0.64, layers: [0,1,2,3,4,5,6,7], color: "#9333ea" },
    ];
    const lYmid = (i: number) => ((layers[i].y + layers[i].h / 2) * H);
    animals.forEach(a => {
      const x = W * 0.62, y = a.y * H;
      ctx.fillStyle = a.color + "22";
      ctx.beginPath(); roundRect(ctx, x, y - 10, 58, 20, 4); ctx.fill();
      ctx.strokeStyle = a.color + "55"; ctx.lineWidth = 1;
      ctx.beginPath(); roundRect(ctx, x, y - 10, 58, 20, 4); ctx.stroke();
      ctx.font = "10px serif"; ctx.fillText(a.icon, x + 3, y + 4);
      ctx.font = "7px 'Space Mono', monospace"; ctx.fillStyle = a.color + "cc";
      ctx.fillText(a.name, x + 17, y + 4);
      a.layers.forEach(li => {
        const ly = lYmid(li);
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(W * 0.68, ly);
        ctx.strokeStyle = a.color + "25"; ctx.lineWidth = 1; ctx.stroke();
      });
    });

    // Universal spacing law card
    ctx.fillStyle = "rgba(0,0,0,.5)";
    ctx.beginPath(); roundRect(ctx, W * 0.04, H * 0.79, W * 0.55, H * 0.19, 8); ctx.fill();
    ctx.strokeStyle = "rgba(212,175,122,.3)"; ctx.lineWidth = 1;
    ctx.beginPath(); roundRect(ctx, W * 0.04, H * 0.79, W * 0.55, H * 0.19, 8); ctx.stroke();
    ctx.font = "bold 9px 'Space Mono', monospace"; ctx.fillStyle = "rgba(212,175,122,.85)";
    ctx.fillText("⬡ UNIVERSAL SPACING LAW", W * 0.06, H * 0.83);
    ctx.font = "8px 'Space Mono', monospace"; ctx.fillStyle = "rgba(160,240,255,.7)";
    ctx.fillText("C(x,t) = f(d)   where d = spacing of coupled elements", W * 0.06, H * 0.865);
    ctx.fillStyle = "rgba(200,184,255,.6)";
    ctx.fillText("Pearl nacre · Squid reflectin · Chameleon nanocrystal · Butterfly gyroid", W * 0.06, H * 0.895);
    ctx.fillText("Crab setae · Astaxanthin pocket · Chromatophore sac   →   same equation", W * 0.06, H * 0.92);
    ctx.fillStyle = "rgba(74,222,128,.6)"; ctx.font = "bold 8px 'Space Mono', monospace";
    ctx.fillText("AUTOLOGOUS: patient genome + SynHG cassette → no immune rejection", W * 0.06, H * 0.95);

    ctx.strokeStyle = "rgba(147,51,234,.4)"; ctx.lineWidth = 2;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(W * 0.005, H * 0.04); ctx.lineTo(W * 0.005, H * 0.96); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(147,51,234,.6)"; ctx.font = "7px 'Space Mono', monospace";
    ctx.save(); ctx.translate(14, H * 0.5); ctx.rotate(-Math.PI / 2);
    ctx.fillText("C(x,t) COHERENCE FIELD  ↑  STABILITY INCREASES", 0, 0);
    ctx.restore();
  }

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  // sim loop
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const tick = () => {
      if (cancelled) return;
      step(); drawAll();
      setTimeout(() => requestAnimationFrame(tick), 65);
    };
    tick();
    return () => { cancelled = true; };
  }, [running]);

  // initial
  useEffect(() => { for (let i = 0; i < 3; i++) step(); drawAll(); /* eslint-disable-next-line */ }, []);

  function applyChess() {
    stateRef.current.chessD = 0.95;
    log("♟ Chessboard — P8 chromatophore FAILS. P4+P6 partial. P5+P7 disruptive. P0–P9 gyroid STABLE.", "w");
  }
  function applyTumor() {
    stateRef.current.tumorD = 0.7;
    log("🦀 Tumor microenvironment — chaotic edges. Gyroid floor maintains C near 0.9.", "w");
  }
  function reset() {
    setRunning(false);
    const s = stateRef.current;
    s.t = 0; s.chessD = 0; s.tumorD = 0; s.gyroOn = true;
    s.skins = Array.from({ length: 4 }, () => makeCells());
    s.C = [0.7, 0.75, 0.8, 0.9];
    setGyroOn(true); setLogs([]); setC([0.7, 0.75, 0.8, 0.9]);
    for (let i = 0; i < 3; i++) step();
    drawAll();
    log("Systems reset. Gyroid floor active. C_structural = 0.88 baseline.", "ok");
  }
  function toggleGyro() {
    const next = !gyroOn; setGyroOn(next);
    log(`Gyroid floor ${next ? "ACTIVATED — C_structural floor engaged" : "DEACTIVATED — panel 4 degrades toward chromatophore behavior"}`, next ? "g" : "w");
  }

  const skinBars = [
    { color: T.chro,  label: "P8 CHROMATOPHORE ONLY" },
    { color: T.morph, label: "P4+P6 MORPHO + REFLECTIN" },
    { color: T.cham,  label: "P5+P7 NANOCRYSTAL + DISRUPTIVE" },
    { color: T.gyro,  label: "✦ P0–P9 FULL GYROID STACK v3.0" },
  ];

  return (
    <div data-testid="page-cuca-gyroid" style={{ background: T.bg, color: T.text, fontFamily: T.mono, minHeight: "100vh", position: "relative" }}>
      <div style={{ padding:"24px 24px 0", position:"relative", zIndex:1 }}>
        <div style={{ display:"inline-block", border:"1px solid #9333ea", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#9333ea", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(147,51,234,0.15)", borderLeft:"3px solid #9333ea", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            CUCA Gyroid v3.0 · Triply-Periodic Minimal Surface · Photonic Scaffold · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(147,51,234,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
            Six violet orbital nodes tracing a gyroid lattice with an isometric scaffold — the live AETHER CUCA Gyroid v3.0 photonic crystal simulation.
          </p>
          <CucaGyroidCanvas />
        </div>
      </div>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 60% 50% at 50% 40%,rgba(147,51,234,.06) 0%,transparent 60%)" }} />
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto", padding: "40px 22px 64px" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: T.muted, marginBottom: 10, textTransform: "uppercase" }}>
            // CUCA v3.0 · GYROID SIMULATION + FULL SYNTHESIS DIAGRAM · MARCH 2026
          </div>
          <h1 style={{ fontFamily: T.display, fontSize: "clamp(20px,4vw,46px)", fontWeight: 800, color: T.white, lineHeight: 1.05 }}>
            <span style={{ color: T.gyro }}>Gyroid</span> — The 3D Floor <span style={{ color: T.gold, fontSize: "55%" }}>all photonic layers · all CUCA layers · one equation</span>
          </h1>
          <div style={{ marginTop: 8, fontSize: 10, letterSpacing: 2, color: T.muted }}>
            C(x,t) = f(d_gyroid) + Δf(d_reflectin, d_nano) + u(t)_chromatophore · α(S_L0)
          </div>
        </div>

        {/* CONTROLS */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <Btn testid="btn-run" onClick={() => setRunning(r => !r)} color={T.ok} active={running}>{running ? "⏸ PAUSE" : "▶ RUN"}</Btn>
          <Btn testid="btn-gyro" onClick={toggleGyro} color={T.gyro} active={gyroOn}>{gyroOn ? "✦ GYROID FLOOR ON" : "✦ GYROID FLOOR OFF"}</Btn>
          <Btn testid="btn-chess" onClick={applyChess} color={T.kill}>♟ CHESSBOARD</Btn>
          <Btn testid="btn-tumor" onClick={applyTumor} color={T.crab}>🦀 TUMOR</Btn>
          <Btn testid="btn-reset" onClick={reset} color={T.muted}>↺ RESET</Btn>
        </div>

        {/* FOUR-PANEL SIM */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
          {skinBars.map((sb, i) => (
            <div key={i} style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 8, overflow: "hidden" }}>
              <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", padding: "7px 10px 4px", borderBottom: `1px solid ${T.dim}`, color: sb.color }}>{sb.label}</div>
              <canvas ref={cnv[i]} role="img" aria-label={sb.label} style={{ display: "block", width: "100%", height: 140 }} />
              <div style={{ display: "flex", gap: 6, padding: "5px 8px", alignItems: "center" }}>
                <div style={{ fontSize: 8, color: T.muted, flex: 1 }}>C(x,t)</div>
                <div style={{ flex: 2, height: 3, background: T.dim, borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${C[i] * 100}%`, background: sb.color, transition: "width .3s" }} />
                </div>
                <div style={{ fontSize: 9, fontWeight: 700, width: 30, textAlign: "right", color: sb.color }}>{C[i].toFixed(3)}</div>
              </div>
            </div>
          ))}
        </div>

        {/* COHERENCE READOUT */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 24 }}>
          {[
            { v: C[0], color: T.chro, lbl: "Chromatophore" },
            { v: C[1], color: T.morph, lbl: "Morpho+Reflectin" },
            { v: C[2], color: T.cham, lbl: "Nano+Disruptive" },
            { v: C[3], color: T.gyro, lbl: "Full Gyroid Stack" },
          ].map((c, i) => (
            <div key={i} style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 7, padding: "10px 12px", textAlign: "center" }}>
              <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 800, marginBottom: 3,
                color: c.v > 0.75 ? c.color : c.v > 0.45 ? T.gold : T.kill }}>{c.v.toFixed(3)}</div>
              <div style={{ fontSize: 8, letterSpacing: 1.5, color: T.muted, textTransform: "uppercase" }}>{c.lbl}</div>
            </div>
          ))}
        </div>

        {/* P0-P9 LAYER STACK TABLE (from BioEngine v3 docx) */}
        <div style={{ fontSize: 9, letterSpacing: 4, color: T.muted, textTransform: "uppercase", margin: "8px 0 14px", paddingBottom: 6, borderBottom: `1px solid ${T.dim}` }}>
          // P0–P9 PHOTONIC LAYER STACK — Bouligand · Gyroid · Reflectin · Chromatophore · Kill Switch
        </div>
        <div style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 8, overflow: "hidden", marginBottom: 24 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10 }}>
            <thead>
              <tr style={{ background: "rgba(147,51,234,.08)" }}>
                {["Layer", "Structure", "Source", "Dim", "Stability", "Timescale", "CUCA Role"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 10px", fontSize: 8, letterSpacing: 2, color: T.muted, textTransform: "uppercase", borderBottom: `1px solid ${T.dim}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { p: "P0 — Genome Substrate",      struct: "Human autologous SynHG cassette", src: "Patient cells (Anthrobot)", dim: "Biochemical foundation", stab: "Intrinsic (autologous)", tau: "Developmental", role: "L1 Molecular Substrate", color: "#1a3d6e" },
                { p: "P1 — Bouligand Chitin",      struct: "Helicoidal twisted plywood", src: "Crab exoskeleton · Butterfly scale base", dim: "3D rotational omni-stable", stab: "Maximum structural", tau: "Developmental (fixed)", role: "L1 Physical scaffold", color: T.boulig },
                { p: "P2 — Nacre Layers",          struct: "Aragonite platelets + organic matrix", src: "Pearl oyster nacre", dim: "1D multilayer (curved)", stab: "High (geological)", tau: "Months–years", role: "L0 AETHER memory layer", color: T.pearl },
                { p: "P3 — Lycaenid Gyroid",       struct: "3D photonic crystal · gyroid/inverse-opal", src: "Lycaenid butterfly wing scale lumen", dim: "3D photonic bandgap", stab: "Maximum omni-directional", tau: "Fixed after development", role: "L5 Coherence passive floor", color: T.gyro },
                { p: "P4 — Morpho Multilayer",     struct: "Ridge lamellae Christmas-tree stack", src: "Morpho butterfly wing ridge", dim: "1D multilayer directional", stab: "High (directional)", tau: "Fixed after development", role: "L5 Directional flash", color: T.morph },
                { p: "P5 — Chameleon Nanocrystal", struct: "Guanine triangular lattice S-iridophore", src: "Chameleon dermis", dim: "2D photonic lattice", stab: "High (tunable)", tau: "Seconds (active)", role: "L3 Signal Fidelity tuning", color: T.cham },
                { p: "P6 — Squid Reflectin",       struct: "Reflectin rugate / Bragg columns", src: "Squid iridocyte", dim: "1D sinusoidal gradient", stab: "Medium (dynamic)", tau: "17–32s (ACh)", role: "L2 Quantum-Bio Processing", color: T.refl },
                { p: "P7 — Cuttlefish Disruptive", struct: "Leucophore + chromatophore ratio", src: "Cuttlefish dermis", dim: "2D spatial pattern", stab: "Medium (neural)", tau: "200ms (neural)", role: "L5 Edge conflict resolution", color: T.cutt },
                { p: "P8 — Octopus Chromatophore", struct: "Elastic pigment sac · radial muscles", src: "Octopus dermis", dim: "0D point (continuous field)", stab: "Low (analog)", tau: "100ms (motor neuron)", role: "L4 Direct Control", color: T.chro },
                { p: "P9 — Kill Switch Cassette",  struct: "mazF toxin/antitoxin + auxotrophy + timer", src: "Synthetic (SynHG)", dim: "Molecular logic gate", stab: "Absolute (irreversible)", tau: "Minutes (on trigger)", role: "L7 Termination protocol", color: T.kill },
              ].map((row, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${T.dim}` }}>
                  <td style={{ padding: "8px 10px", color: row.color, fontWeight: 700 }}>{row.p}</td>
                  <td style={{ padding: "8px 10px", color: T.text }}>{row.struct}</td>
                  <td style={{ padding: "8px 10px", color: T.muted }}>{row.src}</td>
                  <td style={{ padding: "8px 10px", color: T.text }}>{row.dim}</td>
                  <td style={{ padding: "8px 10px", color: T.muted }}>{row.stab}</td>
                  <td style={{ padding: "8px 10px", color: T.muted, fontFamily: T.mono, fontSize: 9 }}>{row.tau}</td>
                  <td style={{ padding: "8px 10px", color: T.gold, fontFamily: T.mono, fontSize: 9 }}>{row.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* v3.0 COHERENCE EQUATION CARD */}
        <div style={{ background: "rgba(0,0,0,.4)", border: `1px solid ${T.gyro}55`, borderRadius: 10, padding: "20px 24px", marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.gyro, textTransform: "uppercase", marginBottom: 12 }}>
            // v3.0 COHERENCE EQUATION
          </div>
          <pre style={{ fontFamily: T.mono, fontSize: 11, color: T.text, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
{`C(x,t) = C_structural(Bouligand, gyroid)        [passive floor, always near 1]
       + ΔC_active(reflectin, nanocrystal)       [active tuning layer]
       + ΔC_neural(chromatophore, cuttlefish)    [fast analog control]
       · α(S_L0)                                 [geophysical modulator]
       − ‖E(t)‖/‖X*(t)‖                           [error term]`}
          </pre>
          <div style={{ marginTop: 12, fontSize: 10, color: T.muted, lineHeight: 1.6 }}>
            The structural floor means C(x,t) never reaches zero under chessboard-type demand. Gyroid and Bouligand
            hold C_structural near 1 regardless of environmental spatial frequency. Active and neural layers tune
            the dynamic response. The kill switch fires when C(x,t) remains below threshold for longer than the
            timer period — system determines its own coherence mission is complete.
          </div>
        </div>

        {/* SYNTHESIS CANVAS */}
        <div style={{ fontSize: 9, letterSpacing: 4, color: T.muted, textTransform: "uppercase", margin: "8px 0 14px", paddingBottom: 6, borderBottom: `1px solid ${T.dim}` }}>
          // FULL SYNTHESIS — ALL ANIMALS · ALL PHOTONIC STRUCTURES · ALL CUCA LAYERS
        </div>
        <div style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.muted, textTransform: "uppercase", padding: "12px 16px 8px", borderBottom: `1px solid ${T.dim}` }}>
            // CUCA v3.0 COMPLETE MAP — FROM PEARL NACRE TO KILL SWITCH
          </div>
          <canvas ref={synthRef} role="img" aria-label="CUCA v3.0 full synthesis diagram — all photonic layers, animals, and CUCA layers" style={{ display: "block", width: "100%", height: 520 }} />
        </div>

        {/* LOG */}
        <div style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 7, padding: "8px 12px", maxHeight: 110, overflowY: "auto", marginBottom: 24 }}>
          {logs.length === 0 ? (
            <div style={{ fontSize: 9, color: T.muted, fontStyle: "italic" }}>// log idle — press ▶ RUN, then trigger CHESSBOARD or TUMOR</div>
          ) : logs.map((l, i) => (
            <div key={i} style={{ fontSize: 9, lineHeight: 1.8, borderBottom: i < logs.length - 1 ? `1px solid ${T.dim}` : "none", color: T.muted }}>
              <span style={{ color: T.ok, marginRight: 6 }}>t={String(l.t).padStart(4, "0")}</span>
              <span style={{ color: l.type === "e" ? T.kill : l.type === "w" ? T.gold : l.type === "g" ? T.gyro : T.ok }}>{l.msg}</span>
            </div>
          ))}
        </div>

        {/* BRIDGES */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {[
            { href: "/cuca-hybrid-skin", label: "Hybrid Skin v2.1" },
            { href: "/clcs-architecture", label: "CLCS Architecture" },
            { href: "/aether-edge-constraint", label: "Edge Constraint" },
            { href: "/unified-synthesis", label: "Unified Synthesis" },
          ].map(b => (
            <Link key={b.href} href={b.href} data-testid={`bridge-${b.href.slice(1)}`} style={{
              fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
              padding: "8px 16px", border: `1px solid ${T.gyro}55`, borderRadius: 6,
              color: T.gyro, textDecoration: "none", background: "rgba(147,51,234,.06)",
            }}>→ {b.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Btn({ children, onClick, color, active, testid }: { children: React.ReactNode; onClick: () => void; color: string; active?: boolean; testid: string }) {
  return (
    <button onClick={onClick} data-testid={testid} style={{
      fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5,
      padding: "6px 13px", borderRadius: 5, border: `1px solid ${color}`,
      cursor: "pointer", textTransform: "uppercase",
      background: active ? `${color}1f` : "transparent", color,
    }}>{children}</button>
  );
}

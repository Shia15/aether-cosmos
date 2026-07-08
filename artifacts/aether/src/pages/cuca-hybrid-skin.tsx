import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";

const T = {
  bg: "#02020a", surf: "#07060f", dim: "#100d1e",
  ceph: "#00e5ff", rept: "#7cfc6e", hybr: "#c084fc",
  gold: "#fbbf24", kill: "#f43f5e", ok: "#4ade80",
  tumor: "#ff6b35", text: "#c8b8ff", muted: "#3a2d60",
  white: "#f0eaff", nano: "#a0f0ff",
  mono: "'Space Mono', 'JetBrains Mono', monospace",
  display: "'Syne', 'Inter', sans-serif",
};

const GW = 64, GH = 40;

type Cell = { h: number; s: number; l: number; papilla: number; phase: number; nano: number; lock: number; disrupt: number };
type Mode = "calm" | "chess" | "tumor" | "hunt";

function makeCells(): Cell[][] {
  return Array.from({ length: GH }, () =>
    Array.from({ length: GW }, () => ({
      h: 160 + Math.random() * 60, s: 50 + Math.random() * 30, l: 25 + Math.random() * 20,
      papilla: 0, phase: Math.random() * Math.PI * 2, nano: 0, lock: 0, disrupt: 0,
    }))
  );
}

type LogEntry = { t: number; msg: string; type: "ok" | "w" | "e" | "h" | "r" };

function CucaHybridSkinCanvas() {
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
      const N=12;
      for(let i=0;i<N;i++){
        const ang=i*(Math.PI*2/N)+t*0.008;
        const r=50+20*Math.sin(t*0.03+i);
        const x=cx+r*Math.cos(ang), y=cy+r*Math.sin(ang);
        const psi=0.5+0.5*Math.sin(t*0.04+i*0.5);
        const hue=i<4?180:i<8?260:130;
        ctx.beginPath(); ctx.arc(x,y,6+3*psi,0,Math.PI*2);
        ctx.fillStyle=`hsla(${hue},80%,60%,0.7)`; ctx.shadowColor=`hsl(${hue},80%,60%)`; ctx.shadowBlur=10*psi; ctx.fill(); ctx.shadowBlur=0;
      }
      const g=ctx.createRadialGradient(cx,cy,0,cx,cy,20);
      g.addColorStop(0,"rgba(0,229,255,0.5)"); g.addColorStop(1,"transparent");
      ctx.beginPath(); ctx.arc(cx,cy,18,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
      ctx.fillStyle="rgba(0,229,255,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CUCA HYBRID SKIN v2.1 · BIO-HYBRID CEPHALOPOD · CHROMATOPHORE LAYER · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CucaHybridSkinPage() {
  const octoRef = useRef<HTMLCanvasElement | null>(null);
  const cuttRef = useRef<HTMLCanvasElement | null>(null);
  const hybrRef = useRef<HTMLCanvasElement | null>(null);

  const [running, setRunning] = useState(false);
  const [mode, setMode] = useState<Mode>("calm");
  const [nanoOn, setNanoOn] = useState(true);
  const [octoFailed, setOctoFailed] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // metrics for UI
  const [m, setM] = useState({
    O: { arousal: 0.4, threat: 0.1, papilla: 0.3, C: 0.7 },
    Cu: { disrupt: 0.5, irid: 0.6, lock: 0.5, C: 0.75 },
    H: { chroma: 0.5, nano: 0.7, delta: 0, C: 0.8 },
  });

  // mutable sim state via refs (avoid re-render every frame)
  const stateRef = useRef({
    t: 0,
    S: { E_norm: 0.25, contrast: 0.2, freq: 0.1 },
    O: { arousal: 0.4, threat: 0.1, papilla: 0.3, C: 0.7, failed: false, cells: makeCells() },
    Cu: { disrupt: 0.5, irid: 0.6, lock: 0.5, C: 0.75, cells: makeCells() },
    H: { chroma: 0.5, nano: 0.7, delta: 0, C: 0.8, cells: makeCells() },
    mode: "calm" as Mode,
    nanoOn: true,
  });

  useEffect(() => { stateRef.current.mode = mode; }, [mode]);
  useEffect(() => { stateRef.current.nanoOn = nanoOn; }, [nanoOn]);

  useEffect(() => {
    const id = "hybrid-skin-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id; link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // resize canvases
  useEffect(() => {
    const resize = () => {
      [octoRef.current, cuttRef.current, hybrRef.current].forEach(c => {
        if (!c) return;
        const r = c.parentElement!.getBoundingClientRect();
        c.width = r.width; c.height = 200;
      });
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  function log(msg: string, type: LogEntry["type"] = "ok") {
    setLogs(prev => [{ t: stateRef.current.t, msg, type }, ...prev].slice(0, 14));
  }

  // sim step + draw
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const loop = () => {
      if (cancelled) return;
      step();
      drawAll();
      setTimeout(() => requestAnimationFrame(loop), 60);
    };
    loop();
    return () => { cancelled = true; };
  }, [running]);

  function step() {
    const s = stateRef.current;
    s.t++;
    s.S.E_norm = Math.max(0, Math.min(1, s.S.E_norm + (Math.random() - 0.5) * 0.01));

    // OCTOPUS
    const targetArousal = s.mode === "hunt" ? 0.8 : s.mode === "tumor" ? 0.6 : 0.35;
    const targetThreat  = s.mode === "tumor" ? 0.3 : s.mode === "chess" ? 0.15 : 0.05;
    s.O.arousal += (targetArousal - s.O.arousal) * 0.15 + (Math.random() - 0.5) * 0.01;
    s.O.threat  += (targetThreat - s.O.threat) * 0.15;
    s.O.papilla = s.O.arousal * 0.45 + s.O.threat * 0.3;
    const octoEdgePenalty = s.mode === "chess" ? s.S.freq * 0.9 : s.S.freq * 0.2;
    s.O.C = Math.max(0, Math.min(1, 1 - s.S.E_norm - octoEdgePenalty + (Math.random() - 0.5) * 0.03));
    if (s.mode === "chess" && s.O.C < 0.2 && !s.O.failed) {
      s.O.failed = true;
      setOctoFailed(true);
      log("🐙 Octopus: EDGE CONSTRAINT — C(x,t) → 0", "e");
    }
    const oSpeed = 0.2 + s.O.arousal * 0.15;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = s.O.cells[y][x]; c.phase += 0.07 + s.O.arousal * 0.06;
      const wave = Math.sin(c.phase) * 0.5 + 0.5;
      let th: number, ts: number, tl: number;
      if (s.mode === "chess" && s.O.failed) {
        th = (Math.random() > 0.5 ? 0 : 180) + Math.random() * 40;
        ts = 20 + Math.random() * 70; tl = Math.random() > 0.5 ? 5 : 75;
      } else {
        th = 150 + s.O.arousal * 80 + s.O.threat * 40 + wave * 30;
        ts = 45 + s.O.arousal * 40; tl = 15 + wave * 20 + s.O.papilla * 10;
      }
      c.h += (th - c.h) * oSpeed; c.s += (ts - c.s) * oSpeed; c.l += (tl - c.l) * oSpeed;
      c.papilla = s.O.papilla * 0.6 + wave * 0.15;
    }

    // CUTTLEFISH
    s.Cu.disrupt = s.mode === "chess" ? 0.85 : s.mode === "tumor" ? 0.7 : 0.4;
    s.Cu.irid = 0.5 + s.S.contrast * 0.4;
    s.Cu.lock = s.Cu.disrupt * 0.7;
    s.Cu.C = Math.max(0, Math.min(1, 1 - s.S.E_norm * 0.5 + s.Cu.lock * 0.2 - s.S.freq * 0.3));
    const cuSpeed = 0.18;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = s.Cu.cells[y][x]; c.phase += 0.05 + s.Cu.disrupt * 0.04;
      const wave = Math.sin(c.phase) * 0.5 + 0.5;
      let th: number, ts: number, tl: number;
      if (s.mode === "chess") {
        const patch = ((Math.floor(x / 8) + Math.floor(y / 6)) % 2);
        th = patch ? 0 : 200; ts = 30 + s.Cu.lock * 50;
        tl = patch ? 8 + s.Cu.lock * 15 : 60 + s.Cu.lock * 10;
      } else if (s.mode === "tumor") {
        th = Math.sin(x * 0.3 + s.t * 0.02) * 60 + 180;
        ts = 50 + s.Cu.irid * 30; tl = 20 + wave * 30;
      } else {
        th = 170 + s.Cu.irid * 60 + wave * 20; ts = 50 + s.Cu.disrupt * 20; tl = 20 + wave * 25;
      }
      c.h += (th - c.h) * cuSpeed; c.s += (ts - c.s) * cuSpeed; c.l += (tl - c.l) * cuSpeed;
      c.lock = s.Cu.lock; c.disrupt = s.Cu.disrupt;
    }

    // HYBRID
    s.H.chroma = s.O.arousal * 0.5 + 0.3;
    const targetNano = s.nanoOn ? Math.min(1, s.S.freq * 0.8 + s.S.contrast * 0.4) : 0;
    s.H.nano += (targetNano - s.H.nano) * 0.06;
    s.H.delta = s.nanoOn ? s.H.nano * 0.35 : 0;
    s.H.C = Math.max(0, Math.min(1,
      (1 - s.S.E_norm - s.S.freq * (s.nanoOn ? 0.15 : 0.7)) + s.H.delta + (Math.random() - 0.5) * 0.02
    ));
    const hSpeed = 0.18;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = s.H.cells[y][x]; c.phase += 0.07 + s.H.chroma * 0.05;
      const wave = Math.sin(c.phase) * 0.5 + 0.5;
      const nanoPhase = Math.sin(x * 0.2 + y * 0.15 + s.t * 0.01) * 0.5 + 0.5;
      c.nano = s.H.nano * nanoPhase;
      let th: number, ts: number, tl: number;
      if (s.mode === "chess") {
        const patch = ((Math.floor(x / 8) + Math.floor(y / 6)) % 2);
        const stab = s.H.delta;
        th = patch ? 0 + s.H.nano * 10 : 190 + s.H.nano * 20;
        ts = 30 + stab * 50 + s.H.chroma * 20;
        tl = patch ? 8 + stab * 18 : 55 + stab * 12;
      } else if (s.mode === "tumor") {
        th = Math.sin(x * 0.25 + s.t * 0.015) * 50 + 160 + s.H.nano * 40;
        ts = 50 + s.H.nano * 35; tl = 20 + wave * 25 + s.H.delta * 15;
      } else {
        th = 155 + s.H.chroma * 90 + s.H.nano * 30 + wave * 20;
        ts = 50 + s.H.nano * 30; tl = 18 + wave * 22 + s.H.delta * 18;
      }
      c.h += (th - c.h) * hSpeed; c.s += (ts - c.s) * hSpeed; c.l += (tl - c.l) * hSpeed;
      c.papilla = s.O.papilla * 0.5 + s.H.nano * 0.2;
    }

    if (s.t % 5 === 0) {
      setM({
        O: { arousal: s.O.arousal, threat: s.O.threat, papilla: s.O.papilla, C: s.O.C },
        Cu: { disrupt: s.Cu.disrupt, irid: s.Cu.irid, lock: s.Cu.lock, C: s.Cu.C },
        H: { chroma: s.H.chroma, nano: s.H.nano, delta: s.H.delta, C: s.H.C },
      });
    }
  }

  function overlay(ctx: CanvasRenderingContext2D, w: number, text: string, color: string) {
    ctx.fillStyle = "rgba(0,0,0,0.45)"; ctx.fillRect(0, 0, w, 18);
    ctx.fillStyle = color; ctx.font = "9px 'Space Mono', monospace";
    ctx.fillText(text, 8, 12);
  }

  function drawCells(ctx: CanvasRenderingContext2D, cv: HTMLCanvasElement, cells: Cell[][], opts: { papillaTint?: number; iridTint?: number; nano?: boolean; nanoVal?: number }) {
    const cw = cv.width / GW, ch = cv.height / GH;
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) {
      const c = cells[y][x];
      ctx.fillStyle = `hsl(${((c.h % 360) + 360) % 360},${Math.max(0, Math.min(100, c.s))}%,${Math.max(4, Math.min(85, c.l))}%)`;
      ctx.fillRect(x * cw, y * ch, cw, ch);
      if (opts.papillaTint && c.papilla > 0.15) {
        const bx = x * cw + cw / 2, by = y * ch + ch / 2, br = Math.min(cw, ch) * 0.42 * c.papilla;
        const g = ctx.createRadialGradient(bx - br * 0.2, by - br * 0.2, 0, bx, by, br);
        g.addColorStop(0, `hsla(${(c.h + 20) % 360},80%,${c.l + 22}%,${c.papilla * 0.5})`);
        g.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
      }
      if (opts.iridTint && opts.iridTint > 0.3) {
        const shimmer = Math.sin(c.phase * 1.4 + x * 0.35 + y * 0.28) * 0.5 + 0.5;
        ctx.fillStyle = `hsla(${(c.h + 150) % 360},90%,72%,${shimmer * opts.iridTint * 0.18})`;
        ctx.fillRect(x * cw, y * ch, cw, ch);
      }
      if (opts.nano && c.nano > 0.1) {
        const nShim = Math.sin(c.phase * 2 + x * 0.5 + y * 0.4) * 0.5 + 0.5;
        ctx.fillStyle = `hsla(${(c.h + 170 + c.nano * 60) % 360},95%,75%,${c.nano * nShim * 0.28})`;
        ctx.fillRect(x * cw, y * ch, cw, ch);
        if (c.nano > 0.5 && (x % 4 === 0 || y % 4 === 0)) {
          ctx.fillStyle = `hsla(200,90%,80%,${c.nano * 0.12})`;
          ctx.fillRect(x * cw, y * ch, cw, ch);
        }
      }
    }
  }

  function drawAll() {
    const s = stateRef.current;
    const o = octoRef.current, cu = cuttRef.current, h = hybrRef.current;
    if (o && o.width) {
      const ctx = o.getContext("2d")!;
      ctx.clearRect(0, 0, o.width, o.height);
      drawCells(ctx, o, s.O.cells, { papillaTint: 1 });
      overlay(ctx, o.width, `C=${s.O.C.toFixed(2)}  ${s.O.failed ? "⚠ FAILED" : "ACTIVE"}`, s.O.failed ? "rgba(244,63,94,.85)" : "rgba(0,229,255,.7)");
    }
    if (cu && cu.width) {
      const ctx = cu.getContext("2d")!;
      ctx.clearRect(0, 0, cu.width, cu.height);
      drawCells(ctx, cu, s.Cu.cells, { iridTint: s.Cu.irid });
      overlay(ctx, cu.width, `C=${s.Cu.C.toFixed(2)}  disruptive=${s.Cu.disrupt.toFixed(2)}`, "rgba(0,229,255,.7)");
    }
    if (h && h.width) {
      const ctx = h.getContext("2d")!;
      ctx.clearRect(0, 0, h.width, h.height);
      drawCells(ctx, h, s.H.cells, { papillaTint: 1, nano: s.nanoOn, nanoVal: s.H.nano });
      overlay(ctx, h.width, `C=${s.H.C.toFixed(2)}  ΔIrid=+${s.H.delta.toFixed(2)}  STABILIZED`,
        s.H.C > 0.6 ? "rgba(192,132,252,.85)" : "rgba(251,191,36,.75)");
    }
  }

  // initial draw
  useEffect(() => { for (let i = 0; i < 3; i++) step(); drawAll(); /* eslint-disable-next-line */ }, []);

  function applyChess() {
    const s = stateRef.current;
    s.mode = "chess"; s.S.freq = 0.9; s.S.contrast = 0.95; s.S.E_norm = 0.6;
    s.O.failed = false; setOctoFailed(false); setMode("chess");
    log("♟ Chessboard applied — high-freq binary demand across all axes", "w");
    log("Octopus: attempting mimicry → edge constraint imminent", "e");
    log("Cuttlefish: switching to disruptive strategy", "ok");
    log("Hybrid: nanocrystal tuning to resolve edges before overload", "h");
  }
  function applyTumor() {
    const s = stateRef.current;
    s.mode = "tumor"; s.S.freq = 0.5; s.S.contrast = 0.65; s.S.E_norm = 0.45;
    s.O.failed = false; setOctoFailed(false); setMode("tumor");
    log("🦀 Tumor microenvironment — chaotic edges, irregular cell densities", "w");
    log("Hybrid: ΔIridophore active — damping edge conflict", "h");
  }
  function applyHunt() {
    const s = stateRef.current;
    s.mode = "hunt"; s.S.freq = 0.15; s.S.contrast = 0.3; s.S.E_norm = 0.2;
    s.O.failed = false; setOctoFailed(false); setMode("hunt");
    log("🎯 Hunt mode — fast analog response, low edge demand", "ok");
  }
  function reset() {
    setRunning(false);
    const s = stateRef.current;
    s.mode = "calm"; s.S.freq = 0.1; s.S.contrast = 0.2; s.S.E_norm = 0.25;
    s.O.failed = false; s.O.cells = makeCells(); s.Cu.cells = makeCells(); s.H.cells = makeCells();
    s.t = 0; s.nanoOn = true;
    setOctoFailed(false); setMode("calm"); setNanoOn(true); setLogs([]);
    for (let i = 0; i < 3; i++) step();
    drawAll();
    log("Systems reset — hybrid v2.1 initialised", "ok");
    log("ΔIridophore layer: active · nanocrystal lattice: tuning", "h");
  }
  function toggleNano() {
    const next = !nanoOn; setNanoOn(next);
    log(`Nanocrystal lattice ${next ? "ACTIVATED — ΔIridophore stabilizing" : "DEACTIVATED — hybrid reverts to ceph-only"}`, next ? "h" : "w");
  }

  return (
    <div data-testid="page-cuca-hybrid-skin" style={{ background: T.bg, color: T.text, fontFamily: T.mono, minHeight: "100vh", position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse 50% 40% at 20% 40%,rgba(0,229,255,.04) 0%,transparent 60%),
                     radial-gradient(ellipse 50% 40% at 80% 60%,rgba(192,132,252,.04) 0%,transparent 60%),
                     radial-gradient(ellipse 30% 30% at 50% 80%,rgba(255,107,53,.03) 0%,transparent 50%)`,
      }} />
      <div style={{ position: "relative", maxWidth: 1160, margin: "0 auto", padding: "44px 24px 72px" }}>
        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontSize: 9, letterSpacing: 4, color: T.muted, marginBottom: 10, textTransform: "uppercase" }}>
            // CUCA BIO HARDWARE ENGINE v2.1 · HYBRID SKIN · MARCH 2026
          </div>
          <h1 style={{ fontFamily: T.display, fontSize: "clamp(20px,4vw,46px)", fontWeight: 800, color: T.white, lineHeight: 1.05 }}>
            <span style={{ color: T.hybr }}>Hybrid Skin</span> <span style={{ color: T.gold, fontSize: "60%" }}>Cephalopod + Reptilian Photonic Stabilizer</span>
          </h1>
          <div style={{ marginTop: 8, fontSize: 10, letterSpacing: 2, color: T.muted }}>
            OCTOPUS SPEED · CUTTLEFISH DISRUPTION · CHAMELEON PHOTONIC LATTICE · ONE CUCA COHERENCE FIELD
          </div>
        </div>

        {/* UPGRADE SUMMARY */}
        <div style={{ border: `1.5px solid ${T.hybr}`, borderRadius: 10, padding: "18px 24px", background: "rgba(192,132,252,.04)", marginBottom: 32, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {[
            { icon: "🐙", label: "Cephalopod Layer", color: T.ceph, desc: "Chromatophores + papillae. Fast analog pigment response. τ ~ 100–300ms. Instantaneous perceptual matching and texture. Vulnerable to chessboard overload.", eq: "u(t) = motor_neuron → 100ms" },
            { icon: "🦎", label: "Reptilian Layer",  color: T.rept, desc: "Tunable guanine nanocrystal lattice (chameleon S-iridophores). Spacing controlled by dCas9 + riboswitch circuit. Resolves high-edge contrast before papillae overload. τ ~ 2–10s.", eq: "ΔIridophore = f(nanocrystal_spacing)" },
            { icon: "✦", label: "Hybrid Coherence", color: T.hybr, desc: "The iridophore term actively damps high-frequency edge conflict before it reaches chromatophores. C(x,t) stays higher under chessboard/tumor chaos. The reptile stabilizes the cephalopod.", eq: "C = 1 − ‖E‖/‖X*‖ + ΔIrid" },
          ].map((u, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{u.icon}</div>
              <div style={{ fontSize: 8, letterSpacing: 2, textTransform: "uppercase", marginBottom: 4, color: u.color }}>{u.label}</div>
              <div style={{ fontSize: 9, color: T.muted, lineHeight: 1.5 }}>{u.desc}</div>
              <div style={{ fontFamily: T.mono, fontSize: 8, marginTop: 5, padding: "3px 8px", borderRadius: 3, display: "inline-block", background: `${u.color}1a`, color: u.color }}>{u.eq}</div>
            </div>
          ))}
        </div>

        {/* CONTROLS */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          <CtrlBtn testid="btn-run" onClick={() => setRunning(r => !r)} color={T.ok} active={running}>{running ? "⏸ PAUSE" : "▶ RUN"}</CtrlBtn>
          <CtrlBtn testid="btn-chess" onClick={applyChess} color={T.kill}>♟ CHESSBOARD</CtrlBtn>
          <CtrlBtn testid="btn-tumor" onClick={applyTumor} color={T.tumor}>🦀 TUMOR ENV</CtrlBtn>
          <CtrlBtn testid="btn-hunt" onClick={applyHunt} color={T.ceph}>🎯 HUNT</CtrlBtn>
          <CtrlBtn testid="btn-nano" onClick={toggleNano} color={T.nano} active={nanoOn}>{nanoOn ? "✦ NANOCRYSTAL ON" : "✦ NANOCRYSTAL OFF"}</CtrlBtn>
          <CtrlBtn testid="btn-reset" onClick={reset} color={T.muted}>↺ RESET</CtrlBtn>
        </div>

        {/* THREE PANELS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          <SkinPanel label="🐙 OCTOPUS ONLY — NO STABILIZER" canvasRef={octoRef} indicator="NANOCRYSTAL: OFF" indColor={T.muted}>
            {octoFailed && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,.75)", zIndex: 20, backdropFilter: "blur(2px)" }}>
                <div style={{ background: "#0a0a14", border: `1px solid ${T.kill}`, borderRadius: 8, padding: "14px 18px", textAlign: "center", maxWidth: 220 }}>
                  <h4 style={{ fontFamily: T.display, color: T.kill, fontSize: 12, marginBottom: 5, margin: 0 }}>⚠ Edge Constraint</h4>
                  <p style={{ fontSize: 8, color: T.text, lineHeight: 1.6, margin: "5px 0 8px" }}>‖E(t)‖ → MAX<br />C(x,t) → 0<br />Pattern destabilizes.<br /><br />No iridophore stabilizer.</p>
                  <span onClick={() => setOctoFailed(false)} style={{ fontSize: 8, letterSpacing: 1.5, color: T.kill, cursor: "pointer", border: "1px solid rgba(244,63,94,.3)", borderRadius: 3, padding: "3px 10px", display: "inline-block" }}>DISMISS</span>
                </div>
              </div>
            )}
          </SkinPanel>
          <SkinPanel label="🦑 CUTTLEFISH — DISRUPTIVE STRATEGY" canvasRef={cuttRef} indicator={`DISRUPTIVE: ${(m.Cu.disrupt * 100).toFixed(0)}%`} indColor={T.nano} />
          <SkinPanel label="✦ HYBRID v2.1 — PHOTONIC STABILIZED" canvasRef={hybrRef} indicator={`NANOCRYSTAL: ${(m.H.nano * 100).toFixed(0)}%  Δ+${m.H.delta.toFixed(2)}`} indColor={T.hybr} />
        </div>

        {/* COHERENCE EQ ROW */}
        <div style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 8, padding: "14px 18px", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <EqBlock label="Octopus C(x,t)" val={m.O.C.toFixed(3)} color={m.O.C < 0.3 ? T.kill : m.O.C < 0.6 ? T.gold : T.ok} />
          <EqBlock label="Cuttlefish C(x,t)" val={m.Cu.C.toFixed(3)} color={T.ceph} />
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.hybr, background: "rgba(192,132,252,.07)", borderRadius: 4, padding: "6px 14px", flex: 1, textAlign: "center" }}>
            C(x,t) = 1 − ‖E(t)‖/‖X*(t)‖ + ΔIridophore(nanocrystal_spacing)
          </div>
          <EqBlock label="Hybrid C(x,t)" val={m.H.C.toFixed(3)} color={m.H.C > 0.65 ? T.hybr : m.H.C > 0.4 ? T.gold : T.kill} />
          <EqBlock label="ΔIridophore" val={"+" + m.H.delta.toFixed(3)} color={T.nano} />
        </div>

        {/* METRICS */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 12 }}>
          <MetricCard title="// OCTOPUS STATE" rows={[
            { lbl: "AROUSAL", val: m.O.arousal, color: T.tumor },
            { lbl: "THREAT", val: m.O.threat, color: T.kill },
            { lbl: "PAPILLA", val: m.O.papilla, color: T.ceph },
            { lbl: "COHERENCE", val: m.O.C, color: T.ok },
          ]} />
          <MetricCard title="// CUTTLEFISH STATE" rows={[
            { lbl: "DISRUPTIVE", val: m.Cu.disrupt, color: T.white },
            { lbl: "IRIDOPHORE", val: m.Cu.irid, color: T.ceph },
            { lbl: "PATTERN LOCK", val: m.Cu.lock, color: T.gold },
            { lbl: "COHERENCE", val: m.Cu.C, color: T.ok },
          ]} />
          <MetricCard title="// HYBRID STATE" rows={[
            { lbl: "CHROMATOPHORE", val: m.H.chroma, color: T.ceph },
            { lbl: "NANOCRYSTAL", val: m.H.nano, color: T.nano },
            { lbl: "ΔIridophore", val: m.H.delta, color: T.hybr },
            { lbl: "COHERENCE", val: m.H.C, color: T.ok },
          ]} />
        </div>

        {/* LOG */}
        <div style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 8, padding: "10px 14px", maxHeight: 130, overflowY: "auto", marginBottom: 24 }}>
          {logs.length === 0 ? (
            <div style={{ fontSize: 9, color: T.muted, fontStyle: "italic" }}>// log idle — press ▶ RUN and apply a scenario</div>
          ) : logs.map((l, i) => (
            <div key={i} style={{ fontSize: 9, lineHeight: 1.8, borderBottom: i < logs.length - 1 ? `1px solid ${T.dim}` : "none", color: T.muted }}>
              <span style={{ color: T.ok, marginRight: 6 }}>t={String(l.t).padStart(4, "0")}</span>
              <span style={{ color: l.type === "e" ? T.kill : l.type === "w" ? T.tumor : l.type === "h" ? T.hybr : l.type === "r" ? T.rept : T.ceph }}>{l.msg}</span>
            </div>
          ))}
        </div>

        {/* BRIDGES */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {[
            { href: "/cuca-gyroid", label: "CUCA Gyroid v3.0" },
            { href: "/clcs-architecture", label: "CLCS Architecture" },
            { href: "/aether-edge-constraint", label: "Edge Constraint" },
            { href: "/unified-synthesis", label: "Unified Synthesis" },
          ].map(b => (
            <Link key={b.href} href={b.href} data-testid={`bridge-${b.href.slice(1)}`} style={{
              fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
              padding: "8px 16px", border: `1px solid ${T.hybr}55`, borderRadius: 6,
              color: T.hybr, textDecoration: "none", background: "rgba(192,132,252,.06)",
            }}>→ {b.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function CtrlBtn({ children, onClick, color, active, testid }: { children: React.ReactNode; onClick: () => void; color: string; active?: boolean; testid: string }) {
  return (
    <button onClick={onClick} data-testid={testid} style={{
      fontFamily: T.mono, fontSize: 9, letterSpacing: 1.5,
      padding: "7px 14px", borderRadius: 5, border: `1px solid ${color}`,
      cursor: "pointer", textTransform: "uppercase",
      background: active ? `${color}1f` : "transparent", color,
    }}>{children}</button>
  );
}

function SkinPanel({ label, canvasRef, indicator, indColor, children }: { label: string; canvasRef: React.RefObject<HTMLCanvasElement | null>; indicator: string; indColor: string; children?: React.ReactNode }) {
  return (
    <div style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 10, overflow: "hidden", position: "relative" }}>
      <div style={{ fontSize: 8, letterSpacing: 3, color: T.muted, textTransform: "uppercase", padding: "9px 12px 6px", borderBottom: `1px solid ${T.dim}` }}>{label}</div>
      <canvas ref={canvasRef} role="img" aria-label={label} style={{ display: "block", width: "100%", height: 200 }} />
      {children}
      <div style={{ position: "absolute", bottom: 8, right: 8, fontFamily: T.mono, fontSize: 8, padding: "3px 8px", borderRadius: 3, background: `${indColor}1a`, border: `1px solid ${indColor}55`, color: indColor }}>
        {indicator}
      </div>
    </div>
  );
}

function EqBlock({ label, val, color }: { label: string; val: string; color: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 8, letterSpacing: 2, color: T.muted, marginBottom: 5, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color }}>{val}</div>
    </div>
  );
}

function MetricCard({ title, rows }: { title: string; rows: { lbl: string; val: number; color: string }[] }) {
  return (
    <div style={{ background: T.surf, border: `1px solid ${T.dim}`, borderRadius: 8, padding: "12px 14px" }}>
      <div style={{ fontSize: 8, letterSpacing: 2, color: T.muted, textTransform: "uppercase", marginBottom: 10 }}>{title}</div>
      {rows.map(r => (
        <div key={r.lbl} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <div style={{ fontSize: 8, color: T.muted, width: 90, flexShrink: 0 }}>{r.lbl}</div>
          <div style={{ flex: 1, height: 4, background: T.dim, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.max(0, Math.min(1, r.val)) * 100}%`, background: r.color, borderRadius: 2, transition: "width .35s" }} />
          </div>
          <div style={{ fontSize: 9, fontWeight: 700, width: 34, textAlign: "right", color: r.color }}>{r.val.toFixed(2)}</div>
        </div>
      ))}
    </div>
  );
}

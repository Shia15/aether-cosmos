import { useEffect, useRef, useState } from "react";

const COLORS = {
  bg:        "#050a07",
  bg2:       "#0a1209",
  mycelium:  "#5dba6e",
  mycDim:    "#2e7d3a",
  ferro:     "#e8a820",
  ferroDim:  "#b8860b",
  metabolite:"#4fc3f7",
  rogue:     "#e84040",
  rogueDim:  "#8b2020",
  feedback:  "#a78bfa",
  cream:     "#e8f0e2",
  text:      "#8faa88",
  dim:       "#4a6045",
  border:    "rgba(93,186,110,0.18)",
};

type Phase = "sense" | "deliver" | "activate" | "feedback";

const PHASE_INFO: Record<Phase, { label: string; color: string; desc: string }> = {
  sense:    { label: "SENSE",    color: COLORS.mycelium,  desc: "Mycelium spatial mapping · DBiT-Plus tumor microenvironment scan" },
  deliver:  { label: "DELIVER",  color: COLORS.ferro,     desc: "Ferrofluid magnetic guidance · metabolite payload routing" },
  activate: { label: "ACTIVATE", color: COLORS.rogue,     desc: "Hyperthermia + ROS overload · selective rogue cell elimination" },
  feedback: { label: "FEEDBACK", color: COLORS.feedback,  desc: "Outcome processed · entropy reduced · model recalibrated" },
};

const PHASE_ORDER: Phase[] = ["sense", "deliver", "activate", "feedback"];
const PHASE_DUR = 220;

type LogEntry = { phase: Phase; msg: string; t: number };

export default function DiscoveryLoopView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runningRef = useRef(true);
  const phaseRef = useRef<Phase>("sense");
  const phaseTimeRef = useRef(0);
  const cycleRef = useRef(0);
  const frameRef = useRef(0);
  const timeRef = useRef(0);
  const rafRef = useRef(0);

  const myceliumNodesRef = useRef<{ x: number; y: number; r: number; phase: number; active: boolean; activeT: number }[]>([]);
  const myceliumNetRef   = useRef<{ a: number; b: number; pulse: number }[]>([]);
  const rogueRef         = useRef<{ x: number; y: number; r: number; vx: number; vy: number; alive: boolean; dyingT: number; phase: number }[]>([]);
  const ferroRef         = useRef<{ x: number; y: number; vx: number; vy: number; r: number; phase: number; loaded: boolean; deliveredT: number }[]>([]);
  const metabRef         = useRef<{ x: number; y: number; vx: number; vy: number; life: number; targetIdx: number }[]>([]);
  const burstsRef        = useRef<{ x: number; y: number; t: number; max: number }[]>([]);

  const [phaseUI, setPhaseUI] = useState<Phase>("sense");
  const [cycle, setCycle] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [killed, setKilled] = useState(0);
  const [running, setRunning] = useState(true);

  const pushLog = (phase: Phase, msg: string) => {
    setLog((l) => [{ phase, msg, t: Date.now() }, ...l].slice(0, 12));
  };

  const eventFor = (ph: Phase, c: number): string => {
    const m: Record<Phase, string[]> = {
      sense:    [`DBiT-Plus scan cycle ${c}`, "Spatial gene mapping initiated", "Tumor microenvironment observed"],
      deliver:  ["Ferrofluid vehicles mobilized", "Metabolite payload loaded", "Magnetic guidance engaged"],
      activate: ["Hyperthermia threshold reached", "ROS overload initiated", "Selective elimination in progress"],
      feedback: [`Learning cycle ${c} complete`, `Model updated · iter ${c}`, "Trial entropy reducing"],
    };
    const a = m[ph]; return a[Math.floor(Math.random() * a.length)];
  };

  const initSim = (W: number, H: number) => {
    // mycelium
    const nodes: typeof myceliumNodesRef.current = [];
    for (let i = 0; i < 28; i++) {
      nodes.push({
        x: 0.05 * W + Math.random() * 0.9 * W,
        y: 0.05 * H + Math.random() * 0.9 * H,
        r: Math.random() * 2.5 + 1,
        phase: Math.random() * Math.PI * 2,
        active: false, activeT: 0,
      });
    }
    const net: typeof myceliumNetRef.current = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (d < W * 0.22) net.push({ a: i, b: j, pulse: Math.random() });
      }
    }
    myceliumNodesRef.current = nodes;
    myceliumNetRef.current = net;
    // rogue cells
    const rogues: typeof rogueRef.current = [];
    const cx = W / 2, cy = H / 2;
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const r = W * 0.08 + Math.random() * W * 0.15;
      rogues.push({
        x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r,
        r: 6 + Math.random() * 10,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        alive: true, dyingT: 0, phase: Math.random() * Math.PI * 2,
      });
    }
    rogueRef.current = rogues;
    // ferro
    const fd: typeof ferroRef.current = [];
    for (let i = 0; i < 5; i++) {
      fd.push({
        x: W * 0.05 + Math.random() * W * 0.15,
        y: H * 0.1 + Math.random() * H * 0.8,
        vx: 0, vy: 0,
        r: 5 + Math.random() * 4,
        phase: Math.random() * Math.PI * 2,
        loaded: true, deliveredT: 0,
      });
    }
    ferroRef.current = fd;
    metabRef.current = [];
    burstsRef.current = [];
  };

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const r = c.parentElement!.getBoundingClientRect();
      c.width = r.width; c.height = Math.max(420, r.height);
    };
    resize();
    initSim(c.width, c.height);
    const onR = () => { resize(); initSim(c.width, c.height); };
    window.addEventListener("resize", onR);

    const draw = () => {
      if (!runningRef.current) { rafRef.current = requestAnimationFrame(draw); return; }
      const W = c.width, H = c.height;
      timeRef.current += 0.016;
      frameRef.current++;
      phaseTimeRef.current++;

      // phase advance
      if (phaseTimeRef.current > PHASE_DUR) {
        const idx = PHASE_ORDER.indexOf(phaseRef.current);
        const nxt = PHASE_ORDER[(idx + 1) % 4];
        phaseRef.current = nxt;
        phaseTimeRef.current = 0;
        if (nxt === "sense") cycleRef.current++;
        setPhaseUI(nxt);
        setCycle(cycleRef.current);
        pushLog(nxt, eventFor(nxt, cycleRef.current));
      }

      // bg
      ctx.fillStyle = COLORS.bg;
      ctx.fillRect(0, 0, W, H);

      // mycelium net
      const net = myceliumNetRef.current;
      const nodes = myceliumNodesRef.current;
      net.forEach((e) => {
        const a = nodes[e.a], b = nodes[e.b];
        const pulse = (Math.sin(timeRef.current * 0.6 + e.pulse * 6) + 1) / 2;
        ctx.strokeStyle = `rgba(93,186,110,${0.05 + pulse * 0.13})`;
        ctx.lineWidth = 0.6;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      nodes.forEach((n) => {
        if (n.active) { n.activeT -= 0.015; if (n.activeT <= 0) { n.active = false; n.activeT = 0; } }
        const pulse = Math.sin(timeRef.current + n.phase) * 0.5 + 0.5;
        const intensity = n.active ? n.activeT : 0.15 + pulse * 0.12;
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
        grd.addColorStop(0, `rgba(93,186,110,${intensity * 0.3})`); grd.addColorStop(1, "rgba(93,186,110,0)");
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(93,186,110,${intensity * 0.9 + 0.1})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * (n.active ? 1.4 : 1), 0, Math.PI * 2); ctx.fill();
      });

      // rogue cells
      rogueRef.current.forEach((r) => {
        if (!r.alive) {
          if (r.dyingT > 0) {
            r.dyingT -= 0.03;
            ctx.fillStyle = `rgba(232,64,64,${r.dyingT * 0.7})`;
            ctx.beginPath(); ctx.arc(r.x, r.y, r.r * (1.5 - r.dyingT), 0, Math.PI * 2); ctx.fill();
          }
          return;
        }
        r.x += r.vx; r.y += r.vy;
        if (r.x < r.r || r.x > W - r.r) r.vx *= -1;
        if (r.y < r.r || r.y > H - r.r) r.vy *= -1;
        const pulse = Math.sin(timeRef.current * 1.4 + r.phase) * 0.3 + 0.7;
        const grd = ctx.createRadialGradient(r.x, r.y, 0, r.x, r.y, r.r * 2);
        grd.addColorStop(0, `rgba(232,64,64,${0.85 * pulse})`);
        grd.addColorStop(0.6, "rgba(139,32,32,0.4)");
        grd.addColorStop(1, "rgba(139,32,32,0)");
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r * 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(232,64,64,${0.9 * pulse})`;
        ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.fill();
      });

      // ferro drops
      ferroRef.current.forEach((fd) => {
        if (phaseRef.current === "deliver" && fd.loaded) {
          // seek nearest rogue
          let best = -1, bestD = Infinity;
          rogueRef.current.forEach((r, i) => {
            if (!r.alive) return;
            const d = Math.hypot(r.x - fd.x, r.y - fd.y);
            if (d < bestD) { bestD = d; best = i; }
          });
          if (best >= 0) {
            const r = rogueRef.current[best];
            const dx = r.x - fd.x, dy = r.y - fd.y, d = Math.hypot(dx, dy) || 1;
            fd.vx += (dx / d) * 0.06; fd.vy += (dy / d) * 0.06;
            if (d < r.r + fd.r) {
              metabRef.current.push({ x: fd.x, y: fd.y, vx: dx / d * 1.2, vy: dy / d * 1.2, life: 1, targetIdx: best });
              fd.loaded = false; fd.deliveredT = 1;
            }
          }
        }
        fd.vx *= 0.94; fd.vy *= 0.94;
        fd.x += fd.vx; fd.y += fd.vy;
        fd.x = Math.max(fd.r, Math.min(W - fd.r, fd.x));
        fd.y = Math.max(fd.r, Math.min(H - fd.r, fd.y));
        // spike body
        const spikes = 6;
        const mag = Math.min(1, Math.hypot(fd.vx, fd.vy) * 10);
        ctx.save(); ctx.translate(fd.x, fd.y);
        ctx.rotate(Math.atan2(fd.vy, fd.vx));
        ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
          const a = (i / spikes) * Math.PI - Math.PI / 2;
          const r2 = i % 2 === 0 ? fd.r * (1 + mag * 0.6) : fd.r * 0.5;
          i === 0 ? ctx.moveTo(Math.cos(a) * r2, Math.sin(a) * r2) : ctx.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
        }
        ctx.closePath();
        const fg = ctx.createRadialGradient(0, 0, 0, 0, 0, fd.r * 1.5);
        fg.addColorStop(0, `rgba(232,168,32,${fd.loaded ? 0.95 : 0.4})`);
        fg.addColorStop(1, "rgba(184,134,11,0.05)");
        ctx.fillStyle = fg; ctx.fill();
        ctx.restore();
      });

      // metabolites
      metabRef.current = metabRef.current.filter((m) => m.life > 0.05);
      metabRef.current.forEach((m) => {
        m.x += m.vx; m.y += m.vy; m.life -= 0.01;
        const t = rogueRef.current[m.targetIdx];
        if (t && t.alive && Math.hypot(t.x - m.x, t.y - m.y) < t.r * 0.8) {
          if (phaseRef.current === "activate" || phaseRef.current === "deliver") {
            t.alive = false; t.dyingT = 1;
            burstsRef.current.push({ x: t.x, y: t.y, t: 1, max: t.r * 4 });
            setKilled((k) => k + 1);
            m.life = 0;
          }
        }
        ctx.fillStyle = `rgba(79,195,247,${m.life * 0.85})`;
        ctx.beginPath(); ctx.arc(m.x, m.y, 2.5, 0, Math.PI * 2); ctx.fill();
      });

      // bursts
      burstsRef.current = burstsRef.current.filter((b) => b.t > 0.05);
      burstsRef.current.forEach((b) => {
        b.t -= 0.04;
        ctx.strokeStyle = `rgba(232,64,64,${b.t * 0.6})`;
        ctx.lineWidth = 2 * b.t;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.max * (1 - b.t), 0, Math.PI * 2); ctx.stroke();
      });

      // feedback arcs (purple) when feedback phase
      if (phaseRef.current === "feedback" && phaseTimeRef.current % 8 === 0) {
        const n = nodes[Math.floor(Math.random() * nodes.length)];
        n.active = true; n.activeT = 1;
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", onR); };
  }, []);

  const togglePlay = () => {
    runningRef.current = !runningRef.current;
    setRunning(runningRef.current);
  };
  const reset = () => {
    const c = canvasRef.current; if (!c) return;
    initSim(c.width, c.height);
    cycleRef.current = 0; phaseRef.current = "sense"; phaseTimeRef.current = 0;
    setCycle(0); setPhaseUI("sense"); setKilled(0); setLog([]);
  };
  const inject = () => {
    pushLog(phaseRef.current, "User-injected metabolite burst");
    const c = canvasRef.current; if (!c) return;
    for (let i = 0; i < 6; i++) {
      const ang = Math.random() * Math.PI * 2;
      const tIdx = Math.floor(Math.random() * rogueRef.current.length);
      metabRef.current.push({
        x: c.width * 0.5 + Math.cos(ang) * 40, y: c.height * 0.5 + Math.sin(ang) * 40,
        vx: Math.cos(ang) * 1.4, vy: Math.sin(ang) * 1.4, life: 1, targetIdx: tIdx,
      });
    }
  };

  return (
    <div style={{ minHeight: "100%", background: COLORS.bg, color: COLORS.text, fontFamily: "'EB Garamond', Georgia, serif", cursor: "crosshair" }}>
      <header style={{ padding: "1.5rem 2rem", borderBottom: `1px solid ${COLORS.border}` }}>
        <div style={{ color: COLORS.mycelium, fontFamily: "monospace", fontSize: "0.62rem", letterSpacing: "0.3em", opacity: 0.6, textTransform: "uppercase" }}>
          AETHER · Bio-Intelligent Oncology · v1
        </div>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.6rem)", color: COLORS.cream, fontWeight: 800, marginTop: "0.4rem", letterSpacing: "-0.01em" }}>
          The Closed <span style={{ color: COLORS.mycelium }}>Discovery Loop</span>
        </h1>
        <div style={{ fontSize: "0.85rem", fontStyle: "italic", color: COLORS.dim, marginTop: "0.3rem" }}>
          Mycelium × Ferrofluid × Metabolite — sense, deliver, activate, learn.
        </div>
        <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.9rem", flexWrap: "wrap" }}>
          {PHASE_ORDER.map((p) => {
            const info = PHASE_INFO[p];
            const active = phaseUI === p;
            return (
              <div key={p} data-testid={`phase-${p}`} style={{
                padding: "0.35rem 0.7rem",
                border: `1px solid ${active ? info.color : "transparent"}`,
                color: active ? info.color : COLORS.dim,
                fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.14em",
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: info.color, opacity: active ? 1 : 0.4, boxShadow: active ? `0 0 6px ${info.color}` : "none" }} />
                {info.label}
              </div>
            );
          })}
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.2rem", padding: "1.2rem 2rem 2rem", alignItems: "start" }}>
        <main>
          <div style={{ display: "flex", gap: "0.5rem", padding: "0.6rem 0", borderBottom: `1px solid ${COLORS.border}`, flexWrap: "wrap" }}>
            <button onClick={togglePlay} data-testid="btn-play" style={btnStyle(running)}>{running ? "PAUSE" : "PLAY"}</button>
            <button onClick={reset} data-testid="btn-reset" style={btnStyle(false)}>RESET</button>
            <button onClick={inject} data-testid="btn-inject" style={{ ...btnStyle(false), borderColor: COLORS.ferro, color: COLORS.ferro }}>INJECT METABOLITE</button>
            <div style={{ marginLeft: "auto", display: "flex", gap: "1.2rem", color: COLORS.dim, fontFamily: "monospace", fontSize: "0.7rem", alignItems: "center", letterSpacing: "0.1em" }}>
              <div>CYCLE <span style={{ color: COLORS.cream }}>{cycle}</span></div>
              <div>KILLED <span style={{ color: COLORS.rogue }}>{killed}</span></div>
            </div>
          </div>
          <div style={{ position: "relative", border: `1px solid ${COLORS.border}`, background: COLORS.bg2, marginTop: "0.7rem", overflow: "hidden", height: 560 }}>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} data-testid="bio-canvas" />
            {(["tl","tr","bl","br"] as const).map((c) => {
              const pos: React.CSSProperties = { position: "absolute", width: 22, height: 22, opacity: 0.5 };
              if (c === "tl") Object.assign(pos, { top: 8, left: 8, borderTop: `1px solid ${COLORS.mycDim}`, borderLeft: `1px solid ${COLORS.mycDim}` });
              if (c === "tr") Object.assign(pos, { top: 8, right: 8, borderTop: `1px solid ${COLORS.mycDim}`, borderRight: `1px solid ${COLORS.mycDim}` });
              if (c === "bl") Object.assign(pos, { bottom: 8, left: 8, borderBottom: `1px solid ${COLORS.mycDim}`, borderLeft: `1px solid ${COLORS.mycDim}` });
              if (c === "br") Object.assign(pos, { bottom: 8, right: 8, borderBottom: `1px solid ${COLORS.mycDim}`, borderRight: `1px solid ${COLORS.mycDim}` });
              return <div key={c} style={pos} />;
            })}
            <div style={{ position: "absolute", top: 12, right: 14, fontFamily: "monospace", fontSize: "0.5rem", letterSpacing: "0.18em", color: COLORS.mycelium, opacity: 0.4, textAlign: "right", lineHeight: 1.7 }}>
              MICROSCOPE · 400×<br />DBiT-PLUS LAYER<br />T = {Math.floor(timeRef.current * 60)}f
            </div>
          </div>

          {/* Phase narrative */}
          <div style={{ marginTop: "1rem", padding: "0.9rem 1rem", border: `1px solid ${COLORS.border}`, background: "rgba(93,186,110,0.04)" }}>
            <div style={{ color: PHASE_INFO[phaseUI].color, fontFamily: "monospace", letterSpacing: "0.18em", fontSize: "0.6rem", textTransform: "uppercase" }}>
              CURRENT PHASE · {PHASE_INFO[phaseUI].label}
            </div>
            <div style={{ marginTop: 6, fontSize: "0.95rem", color: COLORS.cream, fontStyle: "italic" }}>
              {PHASE_INFO[phaseUI].desc}
            </div>
          </div>
        </main>

        <aside style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ border: `1px solid ${COLORS.border}`, padding: "0.9rem", background: "rgba(93,186,110,0.03)" }}>
            <div style={{ color: COLORS.dim, fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>Empirical Signals</div>
            <div style={{ marginTop: 8, color: COLORS.cream, fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 700 }}>59%</div>
            <div style={{ color: COLORS.text, fontSize: "0.78rem" }}>GBM kill rate · ferrofluid + chemo hybrids (2025 data)</div>
            <div style={{ marginTop: 12, color: COLORS.cream, fontFamily: "'Syne', sans-serif", fontSize: "1.6rem", fontWeight: 700 }}>70-80%</div>
            <div style={{ color: COLORS.text, fontSize: "0.78rem" }}>Mycelium-assisted precision response (early studies)</div>
          </div>

          <div style={{ border: `1px solid ${COLORS.border}`, padding: "0.9rem" }}>
            <div style={{ color: COLORS.dim, fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Loop Stages</div>
            {PHASE_ORDER.map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "0.45rem 0", borderTop: `1px dashed ${COLORS.border}` }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: PHASE_INFO[p].color, marginTop: 5, opacity: phaseUI === p ? 1 : 0.4, boxShadow: phaseUI === p ? `0 0 8px ${PHASE_INFO[p].color}` : "none" }} />
                <div>
                  <div style={{ color: PHASE_INFO[p].color, fontFamily: "monospace", fontSize: "0.65rem", letterSpacing: "0.12em" }}>{PHASE_INFO[p].label}</div>
                  <div style={{ color: COLORS.text, fontSize: "0.78rem" }}>{PHASE_INFO[p].desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ border: `1px solid ${COLORS.border}`, padding: "0.9rem", background: "rgba(0,0,0,0.3)" }}>
            <div style={{ color: COLORS.dim, fontFamily: "monospace", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>Event Log</div>
            <div style={{ maxHeight: 180, overflow: "auto" }} data-testid="event-log">
              {log.length === 0 && <div style={{ color: COLORS.dim, fontSize: "0.75rem", fontStyle: "italic" }}>Awaiting first signal…</div>}
              {log.map((e, i) => (
                <div key={i} style={{ fontFamily: "monospace", fontSize: "0.65rem", padding: "0.25rem 0", color: PHASE_INFO[e.phase].color, opacity: 1 - i * 0.06, letterSpacing: "0.04em" }}>
                  <span style={{ color: COLORS.dim, marginRight: 6 }}>[{PHASE_INFO[e.phase].label}]</span>{e.msg}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    fontFamily: "monospace", fontSize: "0.62rem", letterSpacing: "0.12em",
    textTransform: "uppercase",
    padding: "0.4rem 0.85rem",
    background: active ? "rgba(93,186,110,0.08)" : "transparent",
    border: `1px solid ${active ? COLORS.mycelium : COLORS.border}`,
    color: active ? COLORS.mycelium : COLORS.text,
    cursor: "pointer",
  };
}

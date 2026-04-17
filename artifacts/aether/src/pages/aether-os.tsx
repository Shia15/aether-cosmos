import { useEffect, useRef, useState } from "react";

const ENVIRONMENTS = [
  {
    id: "personal",
    title: "Personal Field",
    subtitle: "Non-Physical Field Layer",
    color: "#c084fc",
    glow: "rgba(192,132,252,0.3)",
    icon: "◎",
    desc: "A field layer visualizing protection, focus, or openness around a person. Not a settings toggle — a cognitive boundary.",
    modes: [
      { from: "Shield Mode", to: "Boundary Strength" },
      { from: "Flow Mode", to: "Creative Openness" },
      { from: "Adapt Mode", to: "Emotional Permeability" },
      { from: "Clean Mode", to: "Cognitive Reset" },
    ],
    uses: ["Digital wellbeing", "Emotional boundary viz", "Creator flow protection", "Therapy tools"],
    drawFn: (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      for (let r = 0; r < 4; r++) {
        const radius = 15 + r * 18 + Math.sin(t * 0.8 + r * 1.2) * 6;
        const alpha = 0.6 - r * 0.13;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(192,132,252,${alpha})`;
        ctx.lineWidth = 1.5 - r * 0.3;
        ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(192,132,252,0.9)"; ctx.fill();
    },
  },
  {
    id: "workspace",
    title: "Workspace",
    subtitle: "Creative Studio",
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.3)",
    icon: "⬡",
    desc: "A creative environment where ideas move through modes — not files. Mnēsis, Aletheia, and Reverie wired as workflow layers.",
    modes: [
      { from: "Idle", to: "Observe / Absorb" },
      { from: "Flow", to: "Generate" },
      { from: "Shield", to: "Block Distractions" },
      { from: "Clean", to: "Archive / Refactor" },
    ],
    uses: ["Writing", "Design", "Research mapping", "Strategic planning"],
    drawFn: (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
      ctx.clearRect(0, 0, W, H);
      const nodes = [{ x: W * 0.5, y: H * 0.5 }, { x: W * 0.2, y: H * 0.3 }, { x: W * 0.8, y: H * 0.3 }, { x: W * 0.2, y: H * 0.7 }, { x: W * 0.8, y: H * 0.7 }];
      ctx.strokeStyle = "rgba(96,165,250,0.25)";
      ctx.lineWidth = 1;
      for (let i = 1; i < nodes.length; i++) {
        ctx.beginPath(); ctx.moveTo(nodes[0].x, nodes[0].y); ctx.lineTo(nodes[i].x, nodes[i].y); ctx.stroke();
      }
      nodes.forEach((n, i) => {
        const pulse = Math.sin(t * 1.2 + i * 1.4) * 0.5 + 0.5;
        ctx.beginPath(); ctx.arc(n.x, n.y, i === 0 ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96,165,250,${0.4 + pulse * 0.5})`; ctx.fill();
      });
    },
  },
  {
    id: "knowledge",
    title: "Knowledge Vehicle",
    subtitle: "Conceptual Navigation",
    color: "#34d399",
    glow: "rgba(52,211,153,0.3)",
    icon: "▷",
    desc: "Navigation through conceptual terrain — not roads. Perception, scene ID, risk evaluation, and trajectory applied to learning.",
    modes: [
      { from: "Perception", to: "Incoming Information" },
      { from: "Scene ID", to: "Topic Detection" },
      { from: "Risk Eval", to: "Cognitive Overload" },
      { from: "Trajectory", to: "Learning Path" },
    ],
    uses: ["Learning systems", "Education platforms", "Research mapping", "Curriculum design"],
    drawFn: (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
      ctx.clearRect(0, 0, W, H);
      const points = 8;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
        const r = 30 + Math.sin(t * 0.6 + i) * 8;
        const x = W / 2 + Math.cos(angle) * r;
        const y = H / 2 + Math.sin(angle) * r;
        if (i === 0) { ctx.beginPath(); ctx.moveTo(x, y); }
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = "rgba(52,211,153,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();
      const px = W / 2 + Math.cos(t * 0.4) * 25, py = H / 2 + Math.sin(t * 0.4) * 25;
      ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(52,211,153,0.9)"; ctx.fill();
    },
  },
  {
    id: "decision",
    title: "Decision Capsule",
    subtitle: "Portable Reasoning Unit",
    color: "#fb923c",
    glow: "rgba(251,146,60,0.3)",
    icon: "◈",
    desc: "A compact reasoning engine for high-stakes thinking. Autonomous driving logic applied to human decisions.",
    modes: [
      { from: "Ego Candidates", to: "Options" },
      { from: "Risk Evaluation", to: "Tradeoffs" },
      { from: "Trajectory", to: "Consequences" },
      { from: "Tracker", to: "Feedback Loop" },
    ],
    uses: ["Founders", "Parents", "Medical decisions", "Crisis management"],
    drawFn: (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
      ctx.clearRect(0, 0, W, H);
      const branches = 4;
      for (let b = 0; b < branches; b++) {
        const angle = (b / branches) * Math.PI * 2 - Math.PI / 2;
        const pulse = Math.sin(t * 1.5 + b * 0.8) * 0.5 + 0.5;
        const len = 25 + pulse * 10;
        const x2 = W / 2 + Math.cos(angle) * len;
        const y2 = H / 2 + Math.sin(angle) * len;
        ctx.beginPath(); ctx.moveTo(W / 2, H / 2); ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(251,146,60,${0.3 + pulse * 0.4})`; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(x2, y2, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,146,60,${0.5 + pulse * 0.4})`; ctx.fill();
      }
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251,146,60,0.9)"; ctx.fill();
    },
  },
  {
    id: "city",
    title: "City Layer",
    subtitle: "Collective Resonance",
    color: "#2dd4bf",
    glow: "rgba(45,212,191,0.3)",
    icon: "⬟",
    desc: "Cities as networks of cognitive fields. Individual AETHER fields become nodes; modes become city states. Macro-scale Rootex.",
    modes: [
      { from: "Individual Fields", to: "Nodes" },
      { from: "Modes", to: "City States" },
      { from: "Shield", to: "Infrastructure Resilience" },
      { from: "Flow", to: "Economic / Cultural Movement" },
    ],
    uses: ["Urban planning", "Community wellbeing", "Emergency response", "Cultural tracking"],
    drawFn: (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
      ctx.clearRect(0, 0, W, H);
      const grid = [{ x: 0.2, y: 0.3 }, { x: 0.5, y: 0.2 }, { x: 0.8, y: 0.3 }, { x: 0.2, y: 0.7 }, { x: 0.5, y: 0.8 }, { x: 0.8, y: 0.7 }, { x: 0.5, y: 0.5 }];
      for (let i = 0; i < grid.length; i++) for (let j = i + 1; j < grid.length; j++) {
        const dist = Math.hypot((grid[i].x - grid[j].x) * W, (grid[i].y - grid[j].y) * H);
        if (dist < 60) {
          ctx.beginPath(); ctx.moveTo(grid[i].x * W, grid[i].y * H); ctx.lineTo(grid[j].x * W, grid[j].y * H);
          ctx.strokeStyle = "rgba(45,212,191,0.2)"; ctx.lineWidth = 1; ctx.stroke();
        }
      }
      grid.forEach((n, i) => {
        const pulse = Math.sin(t * 0.9 + i * 0.7) * 0.5 + 0.5;
        ctx.beginPath(); ctx.arc(n.x * W, n.y * H, 3 + pulse * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45,212,191,${0.4 + pulse * 0.5})`; ctx.fill();
      });
    },
  },
  {
    id: "children",
    title: "Children",
    subtitle: "Non-Gamified Intelligence",
    color: "#f472b6",
    glow: "rgba(244,114,182,0.3)",
    icon: "✦",
    desc: "A symbolic intelligence interface without text-heavy logic. Tokens become feelings, modes become moods — learning without pressure.",
    modes: [
      { from: "Tokens", to: "Feelings" },
      { from: "Modes", to: "Moods" },
      { from: "Clean", to: "Calm" },
      { from: "Flow", to: "Play" },
    ],
    uses: ["Emotional regulation", "Focus training", "Creative play", "Pressure-free learning"],
    drawFn: (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
      ctx.clearRect(0, 0, W, H);
      const symbols = ["✦", "◉", "▲", "●", "◆"];
      symbols.forEach((s, i) => {
        const angle = t * 0.5 + (i / symbols.length) * Math.PI * 2;
        const r = 22 + Math.sin(t + i) * 6;
        const x = W / 2 + Math.cos(angle) * r;
        const y = H / 2 + Math.sin(angle) * r;
        ctx.font = "10px serif";
        ctx.fillStyle = `rgba(244,114,182,${0.5 + Math.sin(t + i) * 0.3})`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(s, x, y);
      });
    },
  },
  {
    id: "narrative",
    title: "Narrative Engine",
    subtitle: "Stories That Navigate",
    color: "#f87171",
    glow: "rgba(248,113,113,0.3)",
    icon: "↺",
    desc: "Stories that behave like autonomous systems. Narratives adapt to the reader. Scene ID becomes plot phase; memory becomes character evolution.",
    modes: [
      { from: "Scene ID", to: "Plot Phase" },
      { from: "Risk", to: "Conflict" },
      { from: "Trajectory", to: "Story Arc" },
      { from: "Memory", to: "Character Evolution" },
    ],
    uses: ["Interactive books", "Therapy narratives", "Brand storytelling", "Personal myth-building"],
    drawFn: (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
      ctx.clearRect(0, 0, W, H);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const progress = x / W;
        const y = H / 2 + Math.sin(progress * Math.PI * 3 + t * 0.7) * 18 * (0.3 + progress * 0.7);
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "rgba(248,113,113,0.7)"; ctx.lineWidth = 2; ctx.stroke();
      const dotX = (Math.sin(t * 0.3) * 0.5 + 0.5) * W;
      const dotY = H / 2 + Math.sin((dotX / W) * Math.PI * 3 + t * 0.7) * 18 * (0.3 + (dotX / W) * 0.7);
      ctx.beginPath(); ctx.arc(dotX, dotY, 4, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(248,113,113,0.9)"; ctx.fill();
    },
  },
  {
    id: "os",
    title: "AETHER OS",
    subtitle: "System Without a Form",
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.3)",
    icon: "∞",
    desc: "AETHER does not require a device. It is a logic layer, a reasoning protocol, a symbolic runtime, a resonance engine. Rootex was the first container.",
    modes: [
      { from: "Logic Layer", to: "Universal Reasoning" },
      { from: "Protocol", to: "Symbolic Runtime" },
      { from: "Resonance Engine", to: "Any Container" },
      { from: "Rootex", to: "First Container" },
    ],
    uses: ["Car", "Workspace", "Mind", "City", "Story", "Child", "Collective"],
    drawFn: (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
      ctx.clearRect(0, 0, W, H);
      const rings = 3;
      for (let r = 0; r < rings; r++) {
        const phase = t * (0.3 + r * 0.2) + r * Math.PI / rings;
        const rx = 28 + r * 5, ry = 14 + r * 3;
        ctx.save(); ctx.translate(W / 2, H / 2); ctx.rotate(phase);
        ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251,191,36,${0.5 - r * 0.12})`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath(); ctx.arc(W / 2, H / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(251,191,36,1)"; ctx.fill();
    },
  },
];

function EnvCard({ env, expanded, onToggle }: { env: typeof ENVIRONMENTS[0]; expanded: boolean; onToggle: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      const c = canvasRef.current;
      if (c) {
        const ctx = c.getContext("2d");
        if (ctx) env.drawFn(ctx, tRef.current, c.width, c.height);
        tRef.current += 0.04;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [env]);

  return (
    <div
      onClick={onToggle}
      style={{
        background: "rgba(3,5,20,0.7)",
        border: `1px solid ${expanded ? env.color : "rgba(255,255,255,0.07)"}`,
        borderRadius: 12,
        padding: 16,
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: expanded ? `0 0 24px ${env.glow}` : "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <canvas ref={canvasRef} width={80} height={80} style={{ borderRadius: 8, background: "rgba(255,255,255,0.03)", flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 18, color: env.color }}>{env.icon}</span>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: 11, color: env.color, letterSpacing: 2, textTransform: "uppercase" }}>{env.title}</span>
          </div>
          <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 9, color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginTop: 2 }}>{env.subtitle}</div>
          <p style={{ fontFamily: "Raleway, sans-serif", fontSize: 10, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, marginTop: 6 }}>{env.desc}</p>
        </div>
      </div>

      {expanded && (
        <div style={{ display: "flex", gap: 12, marginTop: 4 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: env.color, opacity: 0.7, textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>◈ MODE MAPPING</div>
            {env.modes.map((m, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.5)", fontFamily: "monospace", minWidth: 90 }}>{m.from}</span>
                <span style={{ fontSize: 8, color: env.color, opacity: 0.5 }}>→</span>
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.75)", fontFamily: "monospace" }}>{m.to}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, color: env.color, opacity: 0.7, textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>◉ USE CASES</div>
            {env.uses.map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: env.color, flexShrink: 0, opacity: 0.7 }} />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.65)", fontFamily: "monospace" }}>{u}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AetherOS() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const bgRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const animate = () => {
      const c = bgRef.current;
      if (c) {
        const ctx = c.getContext("2d")!;
        c.width = c.offsetWidth; c.height = c.offsetHeight;
        ctx.clearRect(0, 0, c.width, c.height);
        const t = tRef.current;
        for (let i = 0; i < 40; i++) {
          const x = ((Math.sin(i * 2.3 + t * 0.1) * 0.5 + 0.5)) * c.width;
          const y = ((Math.cos(i * 1.7 + t * 0.07) * 0.5 + 0.5)) * c.height;
          const r = 1 + Math.sin(t * 0.5 + i) * 0.5;
          ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${[192, 96, 52, 45, 251][i % 5]},${[132, 165, 211, 212, 191][i % 5]},${[252, 250, 153, 191, 36][i % 5]},0.15)`;
          ctx.fill();
        }
        tRef.current += 0.5;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(3,5,20)", overflow: "hidden", position: "relative" }}>
      <canvas ref={bgRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.4, pointerEvents: "none" }} />

      {/* HEADER */}
      <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid rgba(251,191,36,0.12)", flexShrink: 0, position: "relative" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 22, letterSpacing: 8, color: "#fbbf24", fontWeight: 700, margin: 0 }}>
            AETHER <span style={{ color: "rgba(251,191,36,0.5)", fontWeight: 300 }}>OS</span>
          </h1>
          <span style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.35)", textTransform: "uppercase" }}>
            Intelligence Without a Form
          </span>
          <div style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 9, color: "rgba(251,191,36,0.4)", letterSpacing: 2 }}>
            8 CONTAINERS · 4 MODES · ∞ FORMS
          </div>
        </div>
        <div style={{ fontFamily: "Raleway, sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 6, maxWidth: 700, lineHeight: 1.6 }}>
          A mode-based intelligence system that can inhabit any container. Car → Workspace → Mind → City → Story → Child → Collective.
          Rootex was simply the <em style={{ color: "rgba(251,191,36,0.6)" }}>first place it appeared</em>.
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, alignContent: "start", position: "relative" }}>
        {ENVIRONMENTS.map(env => (
          <EnvCard
            key={env.id}
            env={env}
            expanded={expanded === env.id}
            onToggle={() => setExpanded(prev => prev === env.id ? null : env.id)}
          />
        ))}
      </div>

      {/* STRATEGIC CLARITY FOOTER */}
      <div style={{ padding: "12px 28px", borderTop: "1px solid rgba(251,191,36,0.1)", flexShrink: 0, display: "flex", gap: 32, position: "relative" }}>
        <div>
          <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(255,100,100,0.5)", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>✗ NOT BUILDING</div>
          {["A car company", "A wellness app", "A dashboard"].map(s => (
            <div key={s} style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>— {s}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 8, letterSpacing: 3, color: "rgba(251,191,36,0.6)", textTransform: "uppercase", fontFamily: "monospace", marginBottom: 4 }}>✓ BUILDING</div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 11, color: "rgba(251,191,36,0.8)", letterSpacing: 1 }}>
            A mode-based intelligence system that can inhabit any container.
          </div>
        </div>
      </div>
    </div>
  );
}

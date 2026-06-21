import { useState, useEffect, useRef, useCallback } from "react";

// ── Node definitions ──────────────────────────────────────────────────────────
const NODES = [
  {
    id: "controller",
    label: "Controller",
    color: "#60a5fa",
    glow: "#3b82f6",
    attrs: ["+route(intent: Intent)", "+manageTiming()", "+logActivity()"],
    x: 380, y: 60,
  },
  {
    id: "emotion",
    label: "EmotionSystem",
    color: "#4ade80",
    glow: "#22c55e",
    attrs: ["+moodState: String", "+evaluate(ctx: Context): Mood"],
    x: 680, y: 60,
  },
  {
    id: "interface",
    label: "InterfaceRenderer",
    color: "#e879f9",
    glow: "#a855f7",
    attrs: ["+renderText(response: String)", "+playAudio(str: String)"],
    x: 100, y: 220,
  },
  {
    id: "input",
    label: "InputHandler",
    color: "#60a5fa",
    glow: "#3b82f6",
    attrs: ["+voiceInput: String", "+gestureInput: String", "+parseRurit(): Intent"],
    x: 380, y: 220,
  },
  {
    id: "cognitive",
    label: "CognitiveLogicUnit",
    color: "#60a5fa",
    glow: "#3b82f6",
    attrs: ["+processIntent(t: Intent)", "+decideAction(): Response"],
    x: 650, y: 220,
  },
  {
    id: "response",
    label: "Response",
    color: "#f472b6",
    glow: "#ec4899",
    attrs: ["+text: String", "+priority: Int", "+emotionTag: String"],
    x: 100, y: 390,
  },
  {
    id: "intent",
    label: "Intent",
    color: "#818cf8",
    glow: "#6366f1",
    attrs: ["+type: String", "+content: String", "+confidence: Float"],
    x: 380, y: 390,
  },
  {
    id: "memory",
    label: "MemoryEngine",
    color: "#2dd4bf",
    glow: "#14b8a6",
    attrs: ["+shortTerm: List", "+longTerm: Dict", "+retrieve(): Context"],
    x: 650, y: 390,
  },
  {
    id: "context",
    label: "Context",
    color: "#4ade80",
    glow: "#22c55e",
    attrs: ["+topic: String", "+history: List"],
    x: 650, y: 540,
  },
] as const;

type NodeId = typeof NODES[number]["id"];

// ── Edge definitions ──────────────────────────────────────────────────────────
const EDGES: { from: NodeId; to: NodeId; label: string; color: string }[] = [
  { from: "controller", to: "interface",  label: "routes",    color: "#60a5fa" },
  { from: "controller", to: "input",      label: "routes",    color: "#60a5fa" },
  { from: "controller", to: "cognitive",  label: "routes",    color: "#60a5fa" },
  { from: "emotion",    to: "cognitive",  label: "influences",color: "#4ade80" },
  { from: "interface",  to: "response",   label: "renders",   color: "#e879f9" },
  { from: "input",      to: "intent",     label: "creates",   color: "#818cf8" },
  { from: "cognitive",  to: "intent",     label: "receives",  color: "#818cf8" },
  { from: "cognitive",  to: "memory",     label: "queries",   color: "#2dd4bf" },
  { from: "memory",     to: "context",    label: "returns",   color: "#4ade80" },
  { from: "emotion",    to: "context",    label: "analyzes",  color: "#4ade80" },
];

// Node width/height
const NW = 180, NH_BASE = 30, NH_ATTR = 20;
const nodeH = (n: typeof NODES[number]) => NH_BASE + n.attrs.length * NH_ATTR + 10;

// Center of node
function nc(id: NodeId): [number, number] {
  const n = NODES.find(x => x.id === id)!;
  return [n.x + NW / 2, n.y + nodeH(n) / 2];
}

// ── Particle along edge ───────────────────────────────────────────────────────
interface Particle { edgeIdx: number; t: number; speed: number }

// ── Log entries ───────────────────────────────────────────────────────────────
const LOG_MSGS = [
  "Controller.route() dispatching intent → CognitiveLogicUnit",
  "InputHandler parsed voice input: confidence=0.91",
  "EmotionSystem.evaluate() → moodState=focused",
  "CognitiveLogicUnit.processIntent() complete",
  "MemoryEngine.retrieve() → context[topic=aether]",
  "InterfaceRenderer.renderText() → response queued",
  "Intent created: type=query · confidence=0.87",
  "MemoryEngine longTerm hit: 3 entries loaded",
  "Response.priority=2 · emotionTag=curious",
  "Context.history appended · length=14",
];

// ── Component ─────────────────────────────────────────────────────────────────
function ControlPanelCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const agents=[
      { label:"EIE", col:"#2ef0d8", x:W*0.15, y:H*0.5 },
      { label:"MEMORY", col:"#9966ff", x:W*0.3, y:H*0.35 },
      { label:"PROMPT", col:"#c9a84c", x:W*0.45, y:H*0.65 },
      { label:"TRIGGER", col:"#44aaff", x:W*0.6, y:H*0.4 },
      { label:"INTEGR", col:"#44cc77", x:W*0.75, y:H*0.55 },
      { label:"AGENT", col:"#ff4477", x:W*0.88, y:H*0.5 },
    ];
    const signals: {from:number,to:number,t:number}[]=[];
    let tick=0;
    const draw=()=>{
      ctx.fillStyle="rgba(3,5,20,0.2)"; ctx.fillRect(0,0,W,H);
      tick++;
      if(tick%14===0&&signals.length<12) signals.push({ from:Math.floor(Math.random()*5), to:5, t:0 });
      for(let i=signals.length-1;i>=0;i--){
        const s=signals[i]; s.t+=0.025;
        const a=agents[s.from], b=agents[s.to];
        const x=a.x+(b.x-a.x)*s.t, y=a.y+(b.y-a.y)*s.t;
        ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2);
        ctx.fillStyle=a.col; ctx.shadowColor=a.col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        if(s.t>=1) signals.splice(i,1);
      }
      agents.forEach(a=>{
        ctx.beginPath(); ctx.arc(a.x,a.y,12,0,Math.PI*2);
        ctx.fillStyle=a.col; ctx.shadowColor=a.col; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=a.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(a.label,a.x,a.y+22);
      });
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CONTROL PANEL · EIE · MEMORY · PROMPT · TRIGGER · INTEGRATIONS · MULTI-AGENT · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function ControlPanelView() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selected, setSelected] = useState<NodeId | null>(null);
  const [active, setActive] = useState<Set<NodeId>>(new Set(["controller"]));
  const [particles, setParticles] = useState<Particle[]>([]);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(true);
  const logRef = useRef<HTMLDivElement>(null);
  const tickRef = useRef(0);

  // Spawn particles & update positions
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      tickRef.current++;

      // Spawn
      if (tickRef.current % 8 === 0) {
        const ei = Math.floor(Math.random() * EDGES.length);
        setParticles(ps => [...ps.slice(-60), { edgeIdx: ei, t: 0, speed: 0.008 + Math.random() * 0.012 }]);
      }

      // Advance
      setParticles(ps =>
        ps
          .map(p => ({ ...p, t: p.t + p.speed }))
          .filter(p => p.t <= 1)
      );

      // Activate nodes stochastically
      if (tickRef.current % 20 === 0) {
        const n = NODES[Math.floor(Math.random() * NODES.length)];
        setActive(prev => {
          const next = new Set(prev);
          next.add(n.id);
          setTimeout(() => setActive(s => { const c = new Set(s); c.delete(n.id); return c; }), 1200);
          return next;
        });
        setLog(l => {
          const entry = `[${new Date().toLocaleTimeString("en-GB", { hour12: false })}] ${LOG_MSGS[Math.floor(Math.random() * LOG_MSGS.length)]}`;
          return [...l.slice(-30), entry];
        });
      }
    }, 50);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const selectedNode = selected ? NODES.find(n => n.id === selected) : null;

  // Bezier control points for edges
  function edgePath(from: NodeId, to: NodeId): string {
    const [x1, y1] = nc(from);
    const [x2, y2] = nc(to);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 - 30;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  }

  // Point along quadratic bezier at t
  function bezierPoint(from: NodeId, to: NodeId, t: number): [number, number] {
    const [x1, y1] = nc(from);
    const [x2, y2] = nc(to);
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2 - 30;
    const x = (1 - t) * (1 - t) * x1 + 2 * (1 - t) * t * cx + t * t * x2;
    const y = (1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * cy + t * t * y2;
    return [x, y];
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#030514", color: "#ccc", fontFamily: "Raleway, sans-serif" }}>
      <div style={{ padding:"16px 28px 0", flexShrink:0 }}>
        <div style={{ display:"inline-block", border:"1px solid #2ef0d8", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#2ef0d8", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(46,240,216,0.1)", borderLeft:"3px solid #2ef0d8", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Control Panel · EIE · Memory · Prompt · Trigger · Integrations · Multi-Agent · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(46,240,216,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Six multi-agent nodes (EIE/teal · Memory/violet · Prompt/gold · Trigger/blue · Integrations/green · Agent/rose) with live signal routing — the AETHER control panel simulation.
          </p>
          <ControlPanelCanvas />
        </div>
      </div>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: "1px solid rgba(96,165,250,0.12)", padding: "14px 28px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: "#60a5fa", letterSpacing: "0.25em", marginBottom: 3 }}>
            SYSTEM · ARCHITECTURE · CONTROL
          </div>
          <h1 style={{ fontFamily: "Cinzel, serif", fontSize: 20, fontWeight: 700, color: "#e0eaff", margin: 0, letterSpacing: "0.08em" }}>
            Control Panel
          </h1>
          <p style={{ fontSize: 11, color: "rgba(200,215,255,0.45)", margin: "3px 0 0", letterSpacing: "0.04em" }}>
            Agent Architecture · UML Class Diagram · Live Signal Flow
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={() => setRunning(r => !r)}
            style={{
              padding: "6px 16px", borderRadius: 6, cursor: "pointer", fontSize: 11,
              fontFamily: "monospace", letterSpacing: "0.06em",
              border: `1px solid ${running ? "rgba(0,255,136,0.3)" : "rgba(255,255,255,0.1)"}`,
              background: running ? "rgba(0,255,136,0.08)" : "rgba(255,255,255,0.04)",
              color: running ? "#00ff88" : "rgba(200,215,255,0.4)",
            }}
          >
            {running ? "● LIVE" : "○ PAUSED"}
          </button>
          <span style={{ fontFamily: "Cinzel, serif", fontSize: 16, color: "rgba(96,165,250,0.18)", fontWeight: 700 }}>14</span>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

        {/* ── Diagram ──────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: "relative", overflow: "auto" }}>
          <svg
            ref={svgRef}
            width={900} height={680}
            style={{ display: "block", margin: "0 auto" }}
          >
            <defs>
              {NODES.map(n => (
                <filter key={`glow-${n.id}`} id={`glow-${n.id}`} x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation={active.has(n.id) ? "6" : "2"} result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="rgba(200,215,255,0.3)" />
              </marker>
              {EDGES.map((e, i) => (
                <marker key={i} id={`arrow-${i}`} markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
                  <path d="M0,0 L0,6 L7,3 z" fill={e.color + "80"} />
                </marker>
              ))}
            </defs>

            {/* Background grid */}
            <g opacity={0.04}>
              {Array.from({ length: 18 }).map((_, i) => (
                <line key={`v${i}`} x1={i * 50} y1={0} x2={i * 50} y2={680} stroke="#60a5fa" strokeWidth={0.5} />
              ))}
              {Array.from({ length: 14 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={i * 50} x2={900} y2={i * 50} stroke="#60a5fa" strokeWidth={0.5} />
              ))}
            </g>

            {/* ── Edges ──────────────────────────────────────────────────── */}
            {EDGES.map((e, i) => {
              const path = edgePath(e.from, e.to);
              const [mx, my] = bezierPoint(e.from, e.to, 0.5);
              const isHighlighted = selected === e.from || selected === e.to;
              return (
                <g key={i}>
                  <path
                    d={path}
                    fill="none"
                    stroke={isHighlighted ? e.color : e.color + "35"}
                    strokeWidth={isHighlighted ? 1.5 : 1}
                    markerEnd={`url(#arrow-${i})`}
                    style={{ transition: "stroke 0.3s, stroke-width 0.3s" }}
                  />
                  <text x={mx} y={my - 6} textAnchor="middle" fontSize={9} fill={isHighlighted ? e.color + "cc" : e.color + "55"} fontFamily="monospace" letterSpacing="0.05em" style={{ transition: "fill 0.3s" }}>
                    {e.label}
                  </text>
                </g>
              );
            })}

            {/* ── Particles ──────────────────────────────────────────────── */}
            {particles.map((p, i) => {
              const e = EDGES[p.edgeIdx];
              const [px, py] = bezierPoint(e.from, e.to, p.t);
              return (
                <circle key={i} cx={px} cy={py} r={2.5} fill={e.color} opacity={0.8 - p.t * 0.4}
                  style={{ filter: `drop-shadow(0 0 4px ${e.color})` }}
                />
              );
            })}

            {/* ── Nodes ──────────────────────────────────────────────────── */}
            {NODES.map(n => {
              const h = nodeH(n);
              const isSelected = selected === n.id;
              const isActive = active.has(n.id);
              return (
                <g
                  key={n.id}
                  transform={`translate(${n.x}, ${n.y})`}
                  onClick={() => setSelected(s => s === n.id ? null : n.id)}
                  style={{ cursor: "pointer" }}
                  filter={`url(#glow-${n.id})`}
                >
                  {/* Node body */}
                  <rect
                    width={NW} height={h} rx={6}
                    fill={isSelected ? `${n.color}18` : isActive ? `${n.color}10` : "rgba(3,5,20,0.85)"}
                    stroke={isSelected ? n.color : isActive ? n.color + "90" : n.color + "40"}
                    strokeWidth={isSelected ? 1.5 : 1}
                    style={{ transition: "all 0.3s" }}
                  />
                  {/* Header strip */}
                  <rect width={NW} height={NH_BASE} rx={5} fill={n.color + (isSelected ? "25" : "15")} />
                  <rect y={NH_BASE - 2} width={NW} height={2} fill={n.color + "50"} />

                  {/* Class name */}
                  <text x={NW / 2} y={20} textAnchor="middle" fontSize={11} fontWeight="600" fill={n.color} fontFamily="Cinzel, serif" letterSpacing="0.04em">
                    {n.label}
                  </text>

                  {/* Attributes */}
                  {n.attrs.map((attr, ai) => (
                    <text key={ai} x={8} y={NH_BASE + 16 + ai * NH_ATTR} fontSize={9} fill={isSelected ? "rgba(200,215,255,0.8)" : "rgba(200,215,255,0.45)"} fontFamily="monospace" style={{ transition: "fill 0.3s" }}>
                      {attr}
                    </text>
                  ))}

                  {/* Active pulse ring */}
                  {isActive && (
                    <rect width={NW} height={h} rx={6} fill="none" stroke={n.color} strokeWidth={2} opacity={0.4}>
                      <animate attributeName="opacity" values="0.4;0;0.4" dur="1s" repeatCount="indefinite" />
                      <animate attributeName="stroke-width" values="2;4;2" dur="1s" repeatCount="indefinite" />
                    </rect>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── Right panel ──────────────────────────────────────────────────── */}
        <div style={{ width: 260, borderLeft: "1px solid rgba(96,165,250,0.08)", display: "flex", flexDirection: "column", background: "rgba(0,0,0,0.3)", flexShrink: 0 }}>

          {/* Node detail */}
          <div style={{ padding: "18px 16px", borderBottom: "1px solid rgba(96,165,250,0.07)", minHeight: 160 }}>
            {selectedNode ? (
              <>
                <div style={{ fontFamily: "Cinzel, serif", fontSize: 10, color: selectedNode.color, letterSpacing: "0.18em", marginBottom: 8 }}>
                  SELECTED NODE
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: selectedNode.color, fontFamily: "Cinzel, serif", marginBottom: 10 }}>
                  {selectedNode.label}
                </div>
                {selectedNode.attrs.map((a, i) => (
                  <div key={i} style={{ fontFamily: "monospace", fontSize: 10, color: "rgba(200,215,255,0.65)", lineHeight: 1.9, borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: 2, marginBottom: 2 }}>
                    {a}
                  </div>
                ))}
                <div style={{ marginTop: 12, fontSize: 10, color: "rgba(200,215,255,0.3)" }}>
                  Connections: {EDGES.filter(e => e.from === selectedNode.id || e.to === selectedNode.id).length}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 11, color: "rgba(200,215,255,0.25)", fontStyle: "italic", paddingTop: 8 }}>
                Click a node to inspect
              </div>
            )}
          </div>

          {/* Component registry */}
          <div style={{ padding: "14px 16px", borderBottom: "1px solid rgba(96,165,250,0.07)" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(200,215,255,0.35)", letterSpacing: "0.18em", marginBottom: 10 }}>
              COMPONENT REGISTRY
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {NODES.map(n => (
                <div key={n.id} onClick={() => setSelected(s => s === n.id ? null : n.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 5,
                  cursor: "pointer",
                  background: selected === n.id ? `${n.color}12` : "transparent",
                  border: `1px solid ${selected === n.id ? n.color + "40" : "transparent"}`,
                  transition: "all 0.2s",
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: active.has(n.id) ? n.color : "transparent",
                    border: `1px solid ${n.color}`,
                    boxShadow: active.has(n.id) ? `0 0 6px ${n.color}` : "none",
                    flexShrink: 0, transition: "all 0.3s",
                  }} />
                  <span style={{ fontSize: 10, color: selected === n.id ? n.color : "rgba(200,215,255,0.5)", fontFamily: "monospace", transition: "color 0.2s" }}>
                    {n.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Edge legend */}
          <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(96,165,250,0.07)" }}>
            <div style={{ fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(200,215,255,0.35)", letterSpacing: "0.18em", marginBottom: 8 }}>
              SIGNAL EDGES
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {EDGES.map((e, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 8, fontSize: 9, fontFamily: "monospace",
                  color: "rgba(200,215,255,0.4)",
                }}>
                  <div style={{ width: 16, height: 1.5, background: e.color + "80", flexShrink: 0 }} />
                  <span style={{ color: e.color + "90" }}>{e.from}</span>
                  <span>→</span>
                  <span style={{ color: e.color + "70" }}>{e.label}</span>
                  <span>→</span>
                  <span style={{ color: e.color + "90" }}>{e.to}</span>
                </div>
              ))}
            </div>
          </div>

          {/* System log */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: "10px 16px 6px", fontFamily: "Cinzel, serif", fontSize: 9, color: "rgba(200,215,255,0.35)", letterSpacing: "0.18em" }}>
              SYSTEM LOG
            </div>
            <div ref={logRef} style={{ flex: 1, overflowY: "auto", padding: "0 12px 12px" }}>
              {log.length === 0 ? (
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(200,215,255,0.2)", padding: "4px 0" }}>
                  Waiting for signal flow…
                </div>
              ) : log.map((entry, i) => (
                <div key={i} style={{ fontFamily: "monospace", fontSize: 9, color: i === log.length - 1 ? "rgba(96,165,250,0.8)" : "rgba(200,215,255,0.35)", lineHeight: 1.7, borderBottom: "1px solid rgba(255,255,255,0.02)", paddingBottom: 2, marginBottom: 2 }}>
                  {entry}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

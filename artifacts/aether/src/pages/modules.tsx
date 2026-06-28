import { useState, useEffect, useRef, useCallback } from "react";
import {
  Shuffle, Brain, Database, Heart,
  MonitorPlay, Settings, Egg, RefreshCcw,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ── palette ──────────────────────────────────────────────────────────── */
const C = {
  bg:     "#06070C",
  panel:  "rgba(20,18,32,0.62)",
  border: "rgba(200,180,240,0.10)",
  white:  "#EAE6F2",
  text:   "#A4A0B8",
  muted:  "#6A6680",
  dim:    "#2E2A40",
  gold:   "#E8C878",
  cyan:   "#7AC5E8",
  violet: "#B596E8",
  rose:   "#E68090",
  amber:  "#F09060",
  green:  "#7DCC92",
  steel:  "#7B7DA0",
};

/* ── module data ─────────────────────────────────────────────────────── */
type Mod = {
  num: string; title: string; icon: LucideIcon;
  pages: string[]; role: string; primary: string; blurb: string;
};
const MODULES: Mod[] = [
  { num:"01", title:"Input Handler",       icon:Shuffle,    pages:["03_Input_Components"],                             role:"Input processing",     primary:C.cyan,   blurb:"Receives every signal -- text, tone, gesture, telemetry -- and routes it into the system's first layer of attention." },
  { num:"02", title:"Cognitive Logic Unit",icon:Brain,      pages:["08_PromptTemplates","09_ScriptHandoff"],            role:"Pattern recognition",  primary:C.violet, blurb:"Composes templates, recognizes recurring shapes, and hands the right script to the right downstream module." },
  { num:"03", title:"Memory Engine",       icon:Database,   pages:["04_Patterns"],                                     role:"Memory storage",       primary:C.gold,   blurb:"Stores every pattern the system has lived through. Mnesis draws from this well to give the present a past." },
  { num:"04", title:"Emotion System",      icon:Heart,      pages:["07_Six-Agent Personalities","11_MoodMapper"],      role:"Motivation modeling",  primary:C.rose,   blurb:"Six personality channels drive what the system wants -- and the mood mapper colors how every other module behaves." },
  { num:"05", title:"Interface Renderer",  icon:MonitorPlay,pages:["01_VisualTokens","05_RendererLayouts"],             role:"Output generation",    primary:C.green,  blurb:"Translates inner state into visual tokens and renderable layouts -- the surface where AETHER touches the world." },
  { num:"06", title:"Control Dispatcher", icon:Settings,   pages:["21_CoreRoutingEngine"],                            role:"Operation management", primary:C.steel,  blurb:"The conductor: routes operations between modules and keeps the chorus on tempo." },
  { num:"07", title:"Agents & Mood Map",   icon:Egg,        pages:["16_AgentMoodMap","10_ResonanceModule"],            role:"Agent states",         primary:C.violet, blurb:"Tracks the live state of every agent -- Mnesis, Aletheia, Inferaia, Reverie -- and resolves their resonances." },
  { num:"08", title:"Feedback & Testing",  icon:RefreshCcw, pages:["14_ContextualAwareness","20_ConversationSculptor"],role:"Integration evaluation",primary:C.amber,  blurb:"Closes the loop: watches outcomes, sculpts conversation, and feeds learning back to every other module." },
];

/* ring layout: module i is at angle (i/8)*2pi - pi/2 (starts at top) */
const NODE_R = 148;
const CX = 340, CY = 210;
function nodePos(i: number): [number, number] {
  const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
  return [CX + NODE_R * Math.cos(a), CY + NODE_R * Math.sin(a)];
}
/* ring edges + 4 cross-links */
const RING_EDGES  = Array.from({length:8}, (_,i) => [i, (i+1)%8] as [number,number]);
const CROSS_EDGES: [number,number][] = [[0,4],[1,5],[2,6],[3,7]];
const ALL_EDGES   = [...RING_EDGES, ...CROSS_EDGES];

/* ── propulsion maths ─────────────────────────────────────────────────── */
function computeMetrics(active: boolean[]) {
  const n = active.filter(Boolean).length;
  /* count consecutive active pairs in ring */
  const ringPairs = RING_EDGES.filter(([a,b]) => active[a] && active[b]).length;
  /* count active cross links */
  const crossPairs = CROSS_EDGES.filter(([a,b]) => active[a] && active[b]).length;
  const thrust      = Math.pow(n / 8, 1.15) * 100;
  const efficiency  = n === 0 ? 0 : ((ringPairs / 8) * 0.7 + (crossPairs / 4) * 0.3) * 100;
  const coherence   = (n / 8) * 100;
  const cycleRate   = n === 0 ? 0 : 20 + (ringPairs / 8) * 80;
  return { thrust, efficiency, coherence, cycleRate, n };
}

/* ── particle type ────────────────────────────────────────────────────── */
interface Particle { edgeIdx: number; t: number; speed: number; alpha: number; }

/* ── engine canvas ────────────────────────────────────────────────────── */
function EngineCanvas({ active }: { active: boolean[] }) {
  const ref    = useRef<HTMLCanvasElement>(null);
  const parts  = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const frame  = useRef(0);

  /* build/trim particle list when active changes */
  useEffect(() => {
    const liveEdges = ALL_EDGES.map(([a,b], i) => ({ i, ok: active[a] && active[b] }));
    parts.current = parts.current.filter(p => liveEdges[p.edgeIdx]?.ok);
    const target = 5 * liveEdges.filter(e => e.ok).length;
    while (parts.current.length < target) {
      const ok = liveEdges.filter(e => e.ok);
      if (!ok.length) break;
      const e = ok[Math.floor(Math.random() * ok.length)];
      parts.current.push({ edgeIdx: e.i, t: Math.random(), speed: 0.003 + Math.random() * 0.004, alpha: 0.5 + Math.random() * 0.5 });
    }
  }, [active]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width = 680, H = canvas.height = 420;

    const nodeColors = MODULES.map(m => m.primary);
    const nodePositions = MODULES.map((_, i) => nodePos(i));

    const draw = () => {
      frame.current++;
      ctx.clearRect(0, 0, W, H);

      /* deep background */
      const bg = ctx.createRadialGradient(CX, CY, 0, CX, CY, NODE_R + 40);
      bg.addColorStop(0, "rgba(15,10,30,0.8)");
      bg.addColorStop(1, "rgba(5,6,12,0)");
      ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(CX, CY, NODE_R + 80, 0, Math.PI * 2); ctx.fill();

      /* draw edges */
      ALL_EDGES.forEach(([a, b], ei) => {
        const [ax, ay] = nodePositions[a];
        const [bx, by] = nodePositions[b];
        const isActive = active[a] && active[b];
        const isCross  = ei >= 8;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
        ctx.strokeStyle = isActive
          ? `rgba(255,255,255,${isCross ? 0.08 : 0.12})`
          : "rgba(255,255,255,0.025)";
        ctx.lineWidth = isCross ? 0.5 : 0.8;
        ctx.setLineDash(isCross ? [3, 5] : []);
        ctx.stroke(); ctx.setLineDash([]);
      });

      /* draw particles */
      parts.current.forEach(p => {
        p.t += p.speed; if (p.t > 1) p.t -= 1;
        const [a, b] = ALL_EDGES[p.edgeIdx];
        const [ax, ay] = nodePositions[a];
        const [bx, by] = nodePositions[b];
        const x = ax + (bx - ax) * p.t, y = ay + (by - ay) * p.t;
        const col = nodeColors[a];
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 5);
        grd.addColorStop(0, col + "ee");
        grd.addColorStop(1, col + "00");
        ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.globalAlpha = p.alpha; ctx.fill(); ctx.globalAlpha = 1;
      });

      /* central chamber */
      const metrics = computeMetrics(active);
      const thrust01 = metrics.thrust / 100;
      const chamberR = 28 + thrust01 * 18;
      const pulse    = 0.85 + 0.15 * Math.sin(frame.current * 0.06 * (0.3 + thrust01 * 0.7));
      const chamberGrd = ctx.createRadialGradient(CX, CY, 0, CX, CY, chamberR * pulse);
      chamberGrd.addColorStop(0, `rgba(255,220,100,${0.08 + thrust01 * 0.55})`);
      chamberGrd.addColorStop(0.4, `rgba(180,120,255,${0.06 + thrust01 * 0.3})`);
      chamberGrd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(CX, CY, chamberR * pulse, 0, Math.PI * 2);
      ctx.fillStyle = chamberGrd; ctx.fill();
      /* chamber ring */
      ctx.beginPath(); ctx.arc(CX, CY, chamberR * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,208,80,${0.15 + thrust01 * 0.55})`; ctx.lineWidth = 1; ctx.stroke();
      /* thrust label */
      ctx.fillStyle = `rgba(255,220,100,${0.4 + thrust01 * 0.6})`;
      ctx.font = `bold ${8 + thrust01 * 5}px 'DM Mono',monospace`;
      ctx.textAlign = "center";
      ctx.fillText(`${Math.round(metrics.thrust)}%`, CX, CY + 3);
      ctx.font = "7px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(255,208,80,0.4)";
      ctx.fillText("THRUST", CX, CY + 14);
      ctx.textAlign = "left";

      /* draw nodes */
      nodePositions.forEach(([x, y], i) => {
        const col = nodeColors[i];
        const isActive = active[i];
        const pls = isActive ? (0.88 + 0.12 * Math.sin(frame.current * 0.04 + i * 0.8)) : 1;
        const r = 20 * pls;

        /* glow */
        if (isActive) {
          const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 2.2);
          grd.addColorStop(0, col + "44");
          grd.addColorStop(1, col + "00");
          ctx.beginPath(); ctx.arc(x, y, r * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = grd; ctx.fill();
        }
        /* fill */
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? col + "22" : "rgba(30,28,42,0.7)"; ctx.fill();
        /* border */
        ctx.strokeStyle = isActive ? col + "cc" : "rgba(80,78,100,0.4)";
        ctx.lineWidth = isActive ? 1.5 : 0.8; ctx.stroke();
        /* number label */
        ctx.fillStyle = isActive ? col : "rgba(90,88,110,0.6)";
        ctx.font = `bold 8px 'DM Mono',monospace`;
        ctx.textAlign = "center";
        ctx.fillText(MODULES[i].num, x, y + 3);
        /* module abbrev below node */
        ctx.font = "7px 'DM Mono',monospace";
        ctx.fillStyle = isActive ? col + "99" : "rgba(80,78,100,0.3)";
        const abbrev = MODULES[i].title.split(" ").map(w => w[0]).join("").slice(0,3);
        ctx.fillText(abbrev, x, y + (y < CY ? -r - 5 : r + 14));
        ctx.textAlign = "left";
      });

      /* propulsion vector arrow at bottom */
      if (metrics.n > 0) {
        const vx = CX, vy = H - 22;
        const len = 20 + thrust01 * 50;
        const alpha = 0.3 + thrust01 * 0.7;
        ctx.beginPath(); ctx.moveTo(vx - len, vy); ctx.lineTo(vx + len, vy);
        ctx.strokeStyle = `rgba(255,208,80,${alpha})`; ctx.lineWidth = 2; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(vx + len, vy); ctx.lineTo(vx + len - 8, vy - 4);
        ctx.moveTo(vx + len, vy); ctx.lineTo(vx + len - 8, vy + 4);
        ctx.strokeStyle = `rgba(255,208,80,${alpha})`; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = "7px 'DM Mono',monospace"; ctx.fillStyle = `rgba(255,208,80,${alpha * 0.7})`;
        ctx.textAlign = "center"; ctx.fillText("PROPULSION VECTOR", vx, vy + 14); ctx.textAlign = "left";
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return (
    <canvas ref={ref}
      style={{ width:"100%", maxWidth:680, height:"auto", borderRadius:10, display:"block", margin:"0 auto" }} />
  );
}

/* ── gauge bar ────────────────────────────────────────────────────────── */
function Gauge({ label, value, max, color, unit }: { label: string; value: number; max: number; color: string; unit: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ flex:1, minWidth:120 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:9, letterSpacing:".14em", textTransform:"uppercase", color:C.muted }}>{label}</span>
        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:10, color, fontWeight:700 }}>{Math.round(value)}{unit}</span>
      </div>
      <div style={{ height:4, background:"rgba(255,255,255,0.06)", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${color}88,${color})`, borderRadius:2, transition:"width .5s ease" }} />
      </div>
    </div>
  );
}

/* ── main page ────────────────────────────────────────────────────────── */
export default function ModulesPage() {
  const [active, setActive] = useState<boolean[]>(Array(8).fill(true));
  const [clicking, setClicking] = useState<number | null>(null);

  const toggle = useCallback((i: number) => {
    setClicking(i);
    setTimeout(() => setClicking(null), 300);
    setActive(prev => { const next = [...prev]; next[i] = !next[i]; return next; });
  }, []);

  const metrics = computeMetrics(active);
  const allOn   = active.every(Boolean);
  const allOff  = active.every(v => !v);

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{ background:C.bg, color:C.text, fontFamily:"Cinzel, ui-serif, Georgia, serif" }}
      data-testid="modules-page"
    >
      <style>{`
        @keyframes md-breathe { 0%,100%{opacity:.55;transform:scale(1)} 50%{opacity:.9;transform:scale(1.06)} }
        @keyframes md-drift   { 0%{transform:translate3d(0,0,0)} 50%{transform:translate3d(40px,-22px,0)} 100%{transform:translate3d(0,0,0)} }
        @keyframes md-pulse   { 0%,100%{opacity:.45;transform:scale(1)} 50%{opacity:1;transform:scale(1.4)} }
        @keyframes md-fadein  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        @keyframes md-engage  { 0%{transform:scale(1)} 30%{transform:scale(0.94)} 100%{transform:scale(1)} }
        @keyframes md-ring-spin { to{transform:rotate(360deg)} }
        .md-glow-1 { animation:md-breathe 9s  ease-in-out infinite,md-drift 22s ease-in-out infinite; }
        .md-glow-2 { animation:md-breathe 11s ease-in-out infinite,md-drift 28s ease-in-out infinite reverse; }
        .md-glow-3 { animation:md-breathe 13s ease-in-out infinite,md-drift 34s ease-in-out infinite; }
        .md-pulse  { animation:md-pulse 2.4s ease-in-out infinite;transform-origin:center; }
        .md-fadein { animation:md-fadein 480ms ease-out both; }
        .md-card   { box-shadow:0 1px 0 rgba(255,255,255,0.025) inset,0 30px 70px -30px rgba(0,0,0,0.78);backdrop-filter:blur(3px);-webkit-backdrop-filter:blur(3px);transition:transform 280ms ease,box-shadow 280ms ease,border-color 280ms ease,opacity 280ms ease; }
        .md-card.inactive { opacity:0.38; filter:grayscale(0.7); }
        .md-card.engaging { animation:md-engage 300ms ease; }
        .md-card:hover { transform:translateY(-2px) scale(1.01); }
        .md-card:hover .md-click-hint { opacity:1 !important; }
      `}</style>

      {/* atmospheric glows */}
      <div className="pointer-events-none absolute inset-0 select-none" aria-hidden>
        <div className="md-glow-1 absolute" style={{top:"-12%",left:"-8%",width:720,height:720,background:"radial-gradient(circle,rgba(181,150,232,0.16) 0%,rgba(181,150,232,0) 70%)",filter:"blur(20px)"}} />
        <div className="md-glow-2 absolute" style={{top:"28%",right:"-15%",width:640,height:640,background:"radial-gradient(circle,rgba(232,200,120,0.10) 0%,rgba(232,200,120,0) 70%)",filter:"blur(20px)"}} />
        <div className="md-glow-3 absolute" style={{bottom:"-22%",left:"22%",width:760,height:760,background:"radial-gradient(circle,rgba(122,197,232,0.10) 0%,rgba(122,197,232,0) 70%)",filter:"blur(20px)"}} />
      </div>

      <div className="relative px-8 py-10 max-w-6xl mx-auto">

        {/* hero */}
        <div className="md-fadein mb-6 max-w-4xl">
          <div className="text-[10px] tracking-[0.4em] uppercase italic" style={{color:C.muted}}>aether · system architecture · eight modules · one organism</div>
          <h1 className="mt-2 leading-[1.05] text-[42px]" style={{color:C.white,letterSpacing:"0.015em"}}>
            AETHER <span style={{color:C.gold}}>System Modules</span>
          </h1>
          <div className="mt-3 mb-5 h-px" style={{background:`linear-gradient(90deg,${C.gold}66 0%,${C.violet}40 35%,transparent 100%)`,width:"62%"}} />
          <p className="text-[14px] mt-3 leading-relaxed" style={{color:C.text,fontFamily:"Inter,ui-sans-serif,system-ui,sans-serif"}}>
            Eight modules -- input, logic, memory, emotion, rendering, control, agents, and feedback -- circulate around a shared field of attention.
            They are not boxes stacked in a diagram; they are organs in a body.
          </p>
          <p className="text-[12.5px] mt-2 italic" style={{color:C.muted}}>-- eight organs · one chorus · click any card to toggle its module</p>
        </div>

        {/* ── RING ENGINE CANVAS ── */}
        <div className="md-fadein mb-6" style={{animationDelay:"80ms"}}>
          <div style={{
            background:"rgba(8,7,18,0.72)", borderRadius:14,
            border:`1px solid ${allOn ? "rgba(255,208,80,0.22)" : allOff ? "rgba(80,78,100,0.15)" : "rgba(200,180,240,0.10)"}`,
            padding:"20px 20px 14px", position:"relative", overflow:"hidden",
            boxShadow: allOn ? "0 0 60px rgba(255,180,50,0.06) inset" : "none",
            transition:"border-color .5s, box-shadow .5s"
          }}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:".22em",color:C.gold,textTransform:"uppercase"}}>
                RING PROPULSION ENGINE
              </div>
              <div style={{display:"flex",gap:8}}>
                <button
                  onClick={() => setActive(Array(8).fill(true))}
                  style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:".14em",color:C.green,
                    background:"rgba(125,204,146,0.08)",border:"1px solid rgba(125,204,146,0.2)",
                    borderRadius:4,padding:"3px 8px",cursor:"pointer",textTransform:"uppercase"}}>
                  All On
                </button>
                <button
                  onClick={() => setActive(Array(8).fill(false))}
                  style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:".14em",color:C.muted,
                    background:"rgba(100,100,120,0.08)",border:"1px solid rgba(100,100,120,0.15)",
                    borderRadius:4,padding:"3px 8px",cursor:"pointer",textTransform:"uppercase"}}>
                  All Off
                </button>
              </div>
            </div>

            <EngineCanvas active={active} />

            {/* propulsion metrics */}
            <div style={{display:"flex",gap:18,flexWrap:"wrap",marginTop:16,paddingTop:14,borderTop:"1px solid rgba(255,255,255,0.05)"}}>
              <Gauge label="Thrust"     value={metrics.thrust}    max={100} color={C.gold}   unit="%" />
              <Gauge label="Efficiency" value={metrics.efficiency} max={100} color={C.cyan}   unit="%" />
              <Gauge label="Coherence"  value={metrics.coherence}  max={100} color={C.violet} unit="%" />
              <Gauge label="Cycle Rate" value={metrics.cycleRate}  max={100} color={C.amber}  unit=" Hz" />
            </div>

            {/* status line */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10}}>
              <div style={{
                width:6,height:6,borderRadius:"50%",flexShrink:0,
                background: metrics.n === 8 ? C.green : metrics.n === 0 ? C.rose : C.amber,
                boxShadow: `0 0 8px ${metrics.n === 8 ? C.green : metrics.n === 0 ? C.rose : C.amber}`,
                animation: metrics.n > 0 ? "md-pulse 2.4s ease-in-out infinite" : "none"
              }} />
              <span style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:".14em",color:C.muted}}>
                {metrics.n}/8 modules engaged
                {metrics.n === 8 && " -- FULL PROPULSION"}
                {metrics.n === 0 && " -- ENGINE OFFLINE"}
                {metrics.n > 0 && metrics.n < 8 && ` -- ${Math.round(metrics.thrust)}% thrust`}
              </span>
            </div>
          </div>
        </div>

        {/* ── MODULE CARDS (clickable) ── */}
        <div style={{marginBottom:8}}>
          <div style={{fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:".22em",textTransform:"uppercase",color:C.muted,marginBottom:12}}>
            Module Configuration -- click to toggle
          </div>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((M, i) => {
            const Icon    = M.icon;
            const isOn    = active[i];
            const isClick = clicking === i;
            return (
              <div
                key={M.num}
                onClick={() => toggle(i)}
                className={`md-card md-fadein border rounded-[12px] overflow-hidden${isOn ? "" : " inactive"}${isClick ? " engaging" : ""}`}
                style={{
                  borderColor: isOn ? `${M.primary}44` : C.border,
                  background:  isOn ? C.panel : "rgba(14,12,24,0.45)",
                  animationDelay:`${100 + i * 70}ms`,
                  cursor:"pointer",
                  boxShadow: isOn ? `0 0 24px ${M.primary}11 inset, 0 1px 0 rgba(255,255,255,0.025) inset, 0 30px 70px -30px rgba(0,0,0,0.78)` : undefined,
                }}
                data-testid={`module-${M.num}`}
              >
                {/* header bar */}
                <div
                  className="relative px-5 py-5"
                  style={{
                    background: isOn
                      ? `linear-gradient(135deg,${M.primary}22 0%,${M.primary}08 60%,transparent 100%)`
                      : "rgba(20,18,32,0.3)",
                    borderBottom:`1px solid ${isOn ? C.border : "rgba(80,78,100,0.08)"}`,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="w-11 h-11 rounded-[10px] flex items-center justify-center"
                      style={{
                        background: isOn ? `${M.primary}1a` : "rgba(40,38,55,0.5)",
                        border:`1px solid ${isOn ? M.primary + "55" : "rgba(80,78,100,0.2)"}`,
                        boxShadow: isOn ? `0 0 18px ${M.primary}22,inset 0 0 12px ${M.primary}11` : "none",
                        transition:"all .3s ease",
                      }}
                    >
                      <Icon className="w-5 h-5" style={{color: isOn ? M.primary : C.muted}} strokeWidth={1.6} />
                    </div>

                    {/* status dot */}
                    <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                      <span
                        className={isOn ? "md-pulse" : ""}
                        style={{
                          width:6,height:6,borderRadius:"50%",
                          background: isOn ? M.primary : C.dim,
                          boxShadow: isOn ? `0 0 8px ${M.primary}` : "none",
                          display:"inline-block",
                          transition:"all .3s ease",
                        }}
                      />
                      <span
                        className="md-click-hint"
                        style={{fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:".12em",
                          color: isOn ? M.primary + "66" : C.muted + "66",
                          textTransform:"uppercase",opacity:0,transition:"opacity .2s"}}>
                        {isOn ? "ACTIVE" : "OFF"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-5 py-5">
                  <div className="flex items-baseline gap-2 mb-2">
                    <span style={{color: isOn ? M.primary : C.muted, fontFamily:"JetBrains Mono,ui-monospace,monospace", letterSpacing:"0.04em", fontSize:18}}>{M.num}</span>
                    <h3 className="text-[15px] leading-tight" style={{color: isOn ? C.white : C.muted, letterSpacing:"0.015em", transition:"color .3s"}}>{M.title}</h3>
                  </div>

                  <div className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{color:C.muted,fontFamily:"Inter,ui-sans-serif,system-ui,sans-serif"}}>Pages</div>
                  <div className="space-y-0.5 mb-3">
                    {M.pages.map(p => (
                      <div key={p} className="text-[10.5px]" style={{color: isOn ? C.text : C.muted, fontFamily:"JetBrains Mono,ui-monospace,monospace", transition:"color .3s"}}>
                        <span style={{color: isOn ? M.primary : C.muted, opacity:.7}}>{p.split("_")[0]}_</span>
                        <span>{p.split("_").slice(1).join("_")}</span>
                      </div>
                    ))}
                  </div>

                  <div className="text-[11px] italic mb-3" style={{color: isOn ? M.primary : C.muted, fontFamily:"'Cinzel',ui-serif,Georgia,serif", transition:"color .3s"}}>{M.role}</div>
                  <p className="text-[11.5px] leading-relaxed" style={{color: isOn ? C.text : C.muted, fontFamily:"Inter,ui-sans-serif,system-ui,sans-serif", transition:"color .3s"}}>{M.blurb}</p>

                  {/* toggle indicator */}
                  <div style={{marginTop:12,paddingTop:10,borderTop:`1px solid ${isOn ? M.primary + "18" : "rgba(80,78,100,0.08)"}`,display:"flex",alignItems:"center",justifyContent:"space-between",transition:"border-color .3s"}}>
                    <span style={{fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:".16em",textTransform:"uppercase",color: isOn ? M.primary + "88" : C.muted + "44"}}>
                      {isOn ? "Engaged" : "Offline"}
                    </span>
                    <div style={{display:"flex",gap:3}}>
                      {[...Array(3)].map((_,di) => (
                        <div key={di} style={{
                          width:14,height:3,borderRadius:1.5,
                          background: isOn && di < (metrics.n > 0 ? 3 : 0)
                            ? M.primary + "88"
                            : "rgba(80,78,100,0.2)",
                          transition:"background .3s"
                        }} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* coda */}
        <div className="md-fadein mt-10 max-w-3xl" style={{animationDelay:"700ms"}}>
          <div className="h-px mb-5" style={{background:`linear-gradient(90deg,transparent 0%,${C.gold}33 25%,${C.violet}33 50%,${C.cyan}33 75%,transparent 100%)`}} />
          <p className="text-[13px] leading-relaxed italic" style={{color:C.text,fontFamily:"'Cinzel',ui-serif,Georgia,serif"}}>
            Input feeds <span style={{color:C.cyan}}>attention</span>. Attention feeds <span style={{color:C.violet}}>logic</span>. Logic feeds{" "}
            <span style={{color:C.gold}}>memory</span>, and memory bends back through <span style={{color:C.rose}}>emotion</span>.
            The renderer makes it visible, the dispatcher keeps it in time, the agents give it personality, and the feedback loop teaches the whole organism how to grow.
          </p>
        </div>

      </div>
    </div>
  );
}

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight, RotateCcw, Sunrise } from "lucide-react";
import eggsLineup from "@assets/ChatGPT_Image_Apr_25,_2026,_04_58_54_PM_1777150792841.png";

const B = {
  bg: "#070918",
  ink: "#E7ECF7",
  dim: "#9AA3B8",
  gold: "#E6B85C",
  cyan: "#7CD7FF",
  green: "#7CE0B0",
  amber: "#F2A007",
  rose: "#F49AB6",
  violet: "#B49CFF",
  pearl: "#E8E2F2",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

const COLS = 12;
const ROWS = 6;
const CELLS = COLS * ROWS;

type BiomeKey = "water" | "grass" | "forest" | "mountain" | "bloom";
type AgentKey = "mnesis" | "aletheia" | "inferaia" | "reverie";
type BonusKey = "diversity" | "balance" | "water" | "life";

interface Biome { key: BiomeKey; name: string; color: string; glyph: string; }
interface Agent {
  key: AgentKey;
  name: string;
  role: string;
  primary: string;
  secondary: string;
  bgPos: string;
  bonus: BonusKey;
  bonusLabel: string;
  glyph: string;
  oath: string;
}

const BIOMES: Biome[] = [
  { key: "water",    name: "Water",    color: "#3A6FB8", glyph: "≈" },
  { key: "grass",    name: "Grass",    color: "#7CC76A", glyph: "ψ" },
  { key: "forest",   name: "Forest",   color: "#2F7E48", glyph: "Ψ" },
  { key: "mountain", name: "Mountain", color: "#8C8B95", glyph: "▲" },
  { key: "bloom",    name: "Bloom",    color: "#E68FA8", glyph: "❀" },
];

const AGENTS: Agent[] = [
  { key: "mnesis",   name: "Mnésis",   role: "The Memory Keeper",  primary: B.gold,   secondary: B.violet, bgPos: "0%",       bonus: "diversity", bonusLabel: "+ Diversity (memory holds the chorus of forms)",       glyph: "𖤓", oath: "What was placed is remembered. What is remembered is rooted." },
  { key: "aletheia", name: "Aletheia", role: "The Seer",           primary: B.cyan,   secondary: B.gold,   bgPos: "33.3333%", bonus: "balance",   bonusLabel: "+ Balance (clarity reveals the right cell)",          glyph: "◉", oath: "What is in proportion will become luminous." },
  { key: "inferaia", name: "Inferaia", role: "The Depth Walker",   primary: B.rose,   secondary: B.amber,  bgPos: "66.6666%", bonus: "water",     bonusLabel: "+ Water (depth carries the river of return)",         glyph: "✺", oath: "Beneath every form is a current that wants to surface." },
  { key: "reverie",  name: "Reverie",  role: "The Integrator",     primary: B.pearl,  secondary: B.cyan,   bgPos: "100%",     bonus: "life",      bonusLabel: "+ Life (every form is woven into the next)",          glyph: "◯", oath: "What is touched gently will spread softly." },
];

const SKY_STOPS: { s: number; top: string; mid: string; horizon: string }[] = [
  { s: 0.00, top: "#04050D", mid: "#0A0A1F", horizon: "#1B1330" },
  { s: 0.30, top: "#1A0F30", mid: "#3A1F50", horizon: "#6A2F60" },
  { s: 0.55, top: "#4B2A6E", mid: "#9A3F66", horizon: "#E68F58" },
  { s: 0.78, top: "#6A6FB8", mid: "#E6A05A", horizon: "#F4D78C" },
  { s: 1.00, top: "#3F8FD8", mid: "#9CD5F0", horizon: "#F4E8B0" },
];

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }
function hexToRgb(h: string): [number, number, number] {
  const n = parseInt(h.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number) {
  const c = (x: number) => Math.round(Math.max(0, Math.min(255, x))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function lerpHex(a: string, b: string, t: number) {
  const [ar, ag, ab] = hexToRgb(a); const [br, bg, bb] = hexToRgb(b);
  return rgbToHex(lerp(ar, br, t), lerp(ag, bg, t), lerp(ab, bb, t));
}
function skyAt(s: number) {
  const ss = Math.max(0, Math.min(1, s));
  let lo = SKY_STOPS[0], hi = SKY_STOPS[SKY_STOPS.length - 1];
  for (let i = 0; i < SKY_STOPS.length - 1; i++) {
    if (ss >= SKY_STOPS[i].s && ss <= SKY_STOPS[i + 1].s) { lo = SKY_STOPS[i]; hi = SKY_STOPS[i + 1]; break; }
  }
  const span = hi.s - lo.s || 1; const t = (ss - lo.s) / span;
  return { top: lerpHex(lo.top, hi.top, t), mid: lerpHex(lo.mid, hi.mid, t), horizon: lerpHex(lo.horizon, hi.horizon, t) };
}

function neighbours(i: number): number[] {
  const r = Math.floor(i / COLS), c = i % COLS;
  const out: number[] = [];
  if (r > 0)        out.push((r - 1) * COLS + c);
  if (r < ROWS - 1) out.push((r + 1) * COLS + c);
  if (c > 0)        out.push(r * COLS + (c - 1));
  if (c < COLS - 1) out.push(r * COLS + (c + 1));
  return out;
}

function computeScores(grid: (BiomeKey | null)[]) {
  const counts: Record<BiomeKey, number> = { water: 0, grass: 0, forest: 0, mountain: 0, bloom: 0 };
  let placed = 0;
  for (const v of grid) if (v) { counts[v]++; placed++; }
  const total = placed || 1;
  const waterFrac = counts.water / total;
  const lifeFrac  = (counts.grass + counts.forest + counts.bloom) / total;
  const unique    = (Object.values(counts) as number[]).filter(n => n > 0).length;

  const phiWater     = placed === 0 ? 0 : Math.max(0, 1 - Math.abs(waterFrac - 0.22) / 0.40);
  const phiLife      = placed === 0 ? 0 : Math.max(0, 1 - Math.abs(lifeFrac  - 0.55) / 0.55);
  const phiDiversity = unique / BIOMES.length;

  let pairs = 0, good = 0;
  const goodPair = (a: BiomeKey, b: BiomeKey) =>
    (a === "water" && (b === "grass" || b === "bloom")) ||
    (b === "water" && (a === "grass" || a === "bloom")) ||
    (a === "grass" && b === "forest") || (b === "grass" && a === "forest") ||
    (a === "forest" && b === "bloom") || (b === "forest" && a === "bloom") ||
    (a === "mountain" && b === "forest") || (b === "mountain" && a === "forest");
  for (let i = 0; i < CELLS; i++) {
    const cur = grid[i]; if (!cur) continue;
    for (const j of neighbours(i)) {
      if (j <= i) continue;
      const oth = grid[j]; if (!oth) continue;
      pairs++; if (goodPair(cur, oth)) good++;
    }
  }
  const phiBalance = pairs === 0 ? 0 : good / pairs;

  return { phiWater, phiLife, phiDiversity, phiBalance, placed, counts };
}

function Card({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: B.panel,
      border: `1px solid ${B.line}`,
      borderTop: `2px solid ${accent}`,
      borderRadius: 6,
      padding: 16,
    }}>{children}</div>
  );
}
function H({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase" }}>
        Section <span style={{ color: accent }}>{num}</span>
      </div>
      <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500 }}>{label}</h2>
    </div>
  );
}
function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  return (
    <Link
      href={to}
      data-testid={`bridge-${to.slice(1)}`}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", textDecoration: "none",
        background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `2px solid ${accent}`, borderRadius: 4,
      }}
    >
      <ArrowUpRight size={16} color={accent} />
      <div>
        <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}

function SkyBand({ sun, agentColor }: { sun: number; agentColor: string }) {
  const sky = skyAt(sun);
  const sunY = lerp(170, 60, sun);
  const sunX = lerp(80, 540, sun);
  const sunR = 22 + sun * 12;
  return (
    <div style={{
      position: "relative", width: "100%", height: 200,
      borderRadius: 10, overflow: "hidden",
      border: `1px solid ${B.line}`,
      background: `linear-gradient(180deg, ${sky.top} 0%, ${sky.mid} 60%, ${sky.horizon} 100%)`,
    }}>
      <svg viewBox="0 0 600 200" width="100%" height="200" style={{ display: "block" }}>
        {/* far hills */}
        <path d={`M0 170 Q 150 ${150 - sun * 18} 300 168 T 600 170 L 600 200 L 0 200 Z`} fill={lerpHex(sky.horizon, "#000000", 0.55)} opacity={0.85} />
        <path d={`M0 184 Q 200 ${172 - sun * 10} 400 182 T 600 186 L 600 200 L 0 200 Z`} fill={lerpHex(sky.horizon, "#000000", 0.7)} opacity={0.95} />
        {/* sun */}
        <defs>
          <radialGradient id="ts-sun" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={lerpHex("#FFFFFF", agentColor, 0.25)} stopOpacity={0.95} />
            <stop offset="60%" stopColor={agentColor} stopOpacity={0.55} />
            <stop offset="100%" stopColor={agentColor} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={sunX} cy={sunY} r={sunR + 30} fill="url(#ts-sun)" />
        <circle cx={sunX} cy={sunY} r={sunR} fill={lerpHex("#FFFFFF", agentColor, 0.15)} opacity={0.92} />
        {/* stars (only visible when dark) */}
        {sun < 0.4 && Array.from({ length: 24 }).map((_, i) => (
          <circle key={i} cx={(i * 73) % 600} cy={((i * 47) % 90) + 8} r={0.8 + (i % 3) * 0.4} fill="#FFFFFF" opacity={(0.4 - sun) * 0.9} />
        ))}
      </svg>
      <div style={{
        position: "absolute", top: 10, left: 14,
        fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6, color: B.ink, opacity: 0.85, textTransform: "uppercase",
      }}>
        Sky · Sun {Math.round(sun * 100)}%
      </div>
    </div>
  );
}

function AgentPicker({ onPick }: { onPick: (a: AgentKey) => void }) {
  return (
    <div data-testid="agent-picker" style={{ marginTop: 18 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase", marginBottom: 12 }}>
        Choose your agent · four eggs · one luminous chorus
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 14 }}>
        {AGENTS.map(A => (
          <button
            key={A.key}
            type="button"
            onClick={() => onPick(A.key)}
            data-testid={`pick-${A.key}`}
            style={{
              textAlign: "left", padding: 0, cursor: "pointer",
              background: B.panel, border: `1px solid ${B.line}`, borderTop: `2px solid ${A.primary}`,
              borderRadius: 6, color: B.ink, overflow: "hidden",
            }}
          >
            <div style={{ position: "relative", height: 160, background: "rgba(8,6,16,0.6)" }}>
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: `url(${eggsLineup})`,
                backgroundSize: "400% auto",
                backgroundPosition: `${A.bgPos} 50%`,
                backgroundRepeat: "no-repeat",
              }} />
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: `radial-gradient(ellipse at 50% 60%, ${A.primary}33 0%, transparent 65%)`,
                mixBlendMode: "screen",
              }} />
            </div>
            <div style={{ padding: "10px 14px 14px" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 20, color: A.primary, letterSpacing: 0.8 }}>{A.name}</div>
                <span style={{ marginLeft: "auto", fontSize: 14, color: A.secondary, opacity: 0.85 }}>{A.glyph}</span>
              </div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: A.secondary, fontStyle: "italic", marginTop: 2 }}>{A.role}</div>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11.5, color: B.dim, marginTop: 8, lineHeight: 1.5 }}>{A.bonusLabel}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WorldGrid({ grid, tool, agent, place, demolish }: {
  grid: (BiomeKey | null)[]; tool: BiomeKey; agent: Agent; place: (i: number) => void; demolish: (i: number) => void;
}) {
  const cell = 44, gap = 3;
  const w = COLS * cell + (COLS - 1) * gap;
  const h = ROWS * cell + (ROWS - 1) * gap;
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div data-testid="world-grid" style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, ${cell}px)`,
        gap, padding: 10, borderRadius: 8,
        background: "rgba(0,0,0,0.35)", border: `1px solid ${B.line}`,
        width: w + 20, maxWidth: "100%", overflow: "auto",
      }}>
        {grid.map((v, i) => {
          const biome = v ? BIOMES.find(b => b.key === v)! : null;
          return (
            <button
              key={i}
              type="button"
              data-testid={`cell-${i}`}
              onClick={() => place(i)}
              onContextMenu={(e) => { e.preventDefault(); demolish(i); }}
              style={{
                width: cell, height: cell, borderRadius: 4, padding: 0,
                background: biome ? biome.color : "rgba(255,255,255,0.025)",
                border: `1px solid ${biome ? biome.color : B.line}`,
                color: "#0B0B14", fontWeight: 600, fontFamily: "Inter, sans-serif", fontSize: 14,
                cursor: "pointer", transition: "transform 120ms ease, box-shadow 120ms ease",
                boxShadow: biome ? `inset 0 -6px 12px rgba(0,0,0,0.25)` : "none",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.06)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 2px ${agent.primary}66`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = biome ? `inset 0 -6px 12px rgba(0,0,0,0.25)` : "none"; }}
              aria-label={biome ? `${biome.name} cell ${i}` : `Empty cell ${i} — click to place ${tool}`}
            >
              {biome ? biome.glyph : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 }}>
        <span>{label}</span><span style={{ color, fontVariantNumeric: "tabular-nums" }}>{pct.toFixed(2)}</span>
      </div>
      <div style={{ height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct * 100}%`, height: "100%", background: color, transition: "width 250ms ease" }} />
      </div>
    </div>
  );
}

function TerraformSunriseHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      const progress=(Math.sin(t*0.015)*0.5+0.5);
      const skyR=Math.round(2+progress*20),skyG=Math.round(4+progress*30),skyB=Math.round(8+progress*40);
      ctx.fillStyle=`rgba(${skyR},${skyG},${skyB},0.1)`;ctx.fillRect(0,0,W,H);
      const sx=W*0.5,sy=H-20-progress*70;
      const sunR=18+4*Math.sin(t*0.03);
      const grd=ctx.createRadialGradient(sx,sy,0,sx,sy,sunR*3);
      grd.addColorStop(0,"rgba(255,180,60,0.8)");grd.addColorStop(0.4,"rgba(255,120,30,0.2)");grd.addColorStop(1,"rgba(255,60,10,0)");
      ctx.fillStyle=grd;ctx.fillRect(sx-sunR*3,sy-sunR*3,sunR*6,sunR*6);
      ctx.beginPath();ctx.arc(sx,sy,sunR,0,Math.PI*2);ctx.fillStyle="rgba(255,200,80,0.9)";ctx.fill();
      ctx.beginPath();
      for(let x=0;x<=W;x+=4){
        const y=H-8+4*Math.sin(x*0.05+t*0.03);
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fillStyle="rgba(30,60,30,0.4)";ctx.fill();
      ctx.fillStyle="rgba(255,160,40,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("TERRAFORM SUNRISE · PLANETARY ENGINEERING · TERRAFORMING · NEW DAWN · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function TerraformSunrisePage() {
  const [agentKey, setAgentKey] = useState<AgentKey | null>(null);
  const [grid, setGrid] = useState<(BiomeKey | null)[]>(() => Array(CELLS).fill(null));
  const [tool, setTool] = useState<BiomeKey>("water");
  const [sun, setSun]   = useState(0);

  const agent = useMemo(() => AGENTS.find(a => a.key === agentKey) || AGENTS[0], [agentKey]);
  const scores = useMemo(() => computeScores(grid), [grid]);

  const bonus = 0.06;
  const phiWater     = Math.min(1, scores.phiWater     + (agent.bonus === "water"     ? bonus : 0));
  const phiLife      = Math.min(1, scores.phiLife      + (agent.bonus === "life"      ? bonus : 0));
  const phiDiversity = Math.min(1, scores.phiDiversity + (agent.bonus === "diversity" ? bonus : 0));
  const phiBalance   = Math.min(1, scores.phiBalance   + (agent.bonus === "balance"   ? bonus : 0));
  const phi          = (phiWater + phiLife + phiDiversity + phiBalance) / 4;
  const sunrise      = phi >= 0.65 && scores.placed >= 18;

  const place = useCallback((i: number) => {
    setGrid(g => {
      if (g[i] === tool) return g;
      const next = g.slice(); next[i] = tool;
      setSun(s => Math.min(1, s + 1 / 36));
      return next;
    });
  }, [tool]);

  const demolish = useCallback((i: number) => {
    setGrid(g => {
      if (!g[i]) return g;
      const next = g.slice(); next[i] = null; return next;
    });
  }, []);

  const reset = useCallback(() => { setGrid(Array(CELLS).fill(null)); setSun(0); }, []);
  const awaken = useCallback(() => { setSun(1); }, []);

  return (
    <div data-testid="terraform-sunrise-page" style={{ background: B.bg, minHeight: "100vh", color: B.ink, padding: "40px 32px 80px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{flexShrink:0,marginBottom:20}}>
          <div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
          <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden"}}>
            <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>TERRAFORM SUNRISE · PLANETARY ENGINEERING · TERRAFORMING · NEW DAWN · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Animated sunrise + terrain — the live AETHER terraform simulation.</p></div>
            <TerraformSunriseHeaderCanvas />
          </div>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.amber, textTransform: "uppercase" }}>
            Terraform Sunrise · A Game of Coherence · Four Eggs · One Luminous Chorus
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 44, fontVariant: "small-caps", letterSpacing: 1.5, marginTop: 6, marginBottom: 0, fontWeight: 500, color: B.ink }}>
            Terraform Sunrise · Awaken The World
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.ink, opacity: 0.92, marginTop: 12, maxWidth: 880, lineHeight: 1.65 }}>
            Choose one of the four AETHER agent eggs, then terraform a small world by placing water, grass, forest, mountain,
            and bloom. As coherence Φ rises across <em>water · life · diversity · balance</em>, the sun lifts off the horizon.
            When Φ ≥ 0.65 the sky breaks open and the world awakens.
          </div>
        </div>

        {/* Sky band */}
        <SkyBand sun={sun} agentColor={agent.primary} />

        {/* Agent picker (only until one is chosen) */}
        {!agentKey && (
          <section data-testid="section-agent-picker" style={{ marginTop: 24 }}>
            <H num="01" label="Choose Your Agent · The Four Eggs" accent={B.gold} />
            <AgentPicker onPick={setAgentKey} />
          </section>
        )}

        {/* Game */}
        {agentKey && (
          <>
            <section data-testid="section-toolbar" style={{ marginTop: 24 }}>
              <Card accent={agent.primary}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                      backgroundImage: `url(${eggsLineup})`, backgroundSize: "400% auto",
                      backgroundPosition: `${agent.bgPos} 50%`, backgroundRepeat: "no-repeat",
                      border: `1px solid ${agent.primary}66`,
                      boxShadow: `0 0 14px ${agent.primary}55`,
                    }} />
                    <div>
                      <div style={{ fontFamily: '"Cinzel", serif', fontSize: 18, color: agent.primary, letterSpacing: 0.6 }}>
                        {agent.name} <span style={{ color: agent.secondary, opacity: 0.7, marginLeft: 6, fontSize: 14 }}>{agent.glyph}</span>
                      </div>
                      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, fontStyle: "italic" }}>{agent.role} · {agent.bonusLabel}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => setAgentKey(null)} data-testid="btn-change-agent" style={btnGhost(B.dim)}>Change Agent</button>
                    <button type="button" onClick={reset} data-testid="btn-reset" style={btnGhost(B.rose)}>
                      <RotateCcw size={12} style={{ marginRight: 6, verticalAlign: -2 }} />Reset World
                    </button>
                    <button type="button" onClick={awaken} data-testid="btn-awaken" style={btnSolid(agent.primary)}>
                      <Sunrise size={12} style={{ marginRight: 6, verticalAlign: -2 }} />Force Sunrise
                    </button>
                  </div>
                </div>

                <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {BIOMES.map(b => (
                    <button
                      key={b.key}
                      type="button"
                      onClick={() => setTool(b.key)}
                      data-testid={`tool-${b.key}`}
                      style={{
                        padding: "8px 14px", borderRadius: 6, cursor: "pointer",
                        background: tool === b.key ? `${b.color}33` : "transparent",
                        color: tool === b.key ? b.color : B.dim,
                        border: `1px solid ${tool === b.key ? b.color + "AA" : B.line}`,
                        fontFamily: "Inter, sans-serif", fontSize: 11.5, letterSpacing: 1.2, textTransform: "uppercase",
                      }}
                    >
                      <span style={{ marginRight: 8, fontSize: 14 }}>{b.glyph}</span>{b.name}
                    </button>
                  ))}
                  <div style={{ marginLeft: "auto", fontFamily: "Inter, sans-serif", fontSize: 10.5, color: B.dim, alignSelf: "center", letterSpacing: 1 }}>
                    Click cell to place · Right-click to clear
                  </div>
                </div>
              </Card>
            </section>

            <section data-testid="section-world" style={{ marginTop: 18, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 18 }}>
              <Card accent={B.cyan}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.cyan, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 10 }}>The World · 12 × 6 cells</div>
                <WorldGrid grid={grid} tool={tool} agent={agent} place={place} demolish={demolish} />
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, justifyContent: "center" }}>
                  {BIOMES.map(b => (
                    <span key={b.key} data-testid={`count-${b.key}`} style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${b.color}55`, color: b.color }}>
                      {b.glyph} {b.name} · {scores.counts[b.key]}
                    </span>
                  ))}
                  <span style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${B.line}`, color: B.dim }}>
                    Empty · {CELLS - scores.placed}
                  </span>
                </div>
              </Card>

              <Card accent={agent.primary}>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: agent.primary, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 14 }}>
                  Coherence Φ · Live Score
                </div>
                <ScoreBar label="Φ_Water · target ≈ 22%" value={phiWater}     color="#3A6FB8" />
                <ScoreBar label="Φ_Life · target ≈ 55%"  value={phiLife}      color={B.green} />
                <ScoreBar label="Φ_Diversity · 5 biomes" value={phiDiversity} color={B.violet} />
                <ScoreBar label="Φ_Balance · neighbours" value={phiBalance}   color={B.cyan} />
                <div style={{ marginTop: 14, padding: 14, borderRadius: 6, border: `1px solid ${agent.primary}55`, background: `${agent.primary}10` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 1.4, textTransform: "uppercase" }}>Φ Total</div>
                    <div data-testid="phi-total" style={{ fontFamily: '"Cinzel", serif', fontSize: 30, color: agent.primary, fontVariantNumeric: "tabular-nums", letterSpacing: 0.5 }}>{phi.toFixed(3)}</div>
                  </div>
                  <div style={{ marginTop: 6, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim }}>
                    Threshold for sunrise: <span style={{ color: B.gold }}>0.650</span> · Cells placed: <span style={{ color: B.ink }}>{scores.placed}</span> / 18 minimum
                  </div>
                </div>
              </Card>
            </section>

            {sunrise && (
              <section data-testid="section-sunrise" style={{ marginTop: 18 }}>
                <Card accent={B.gold}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
                    <Sunrise size={28} color={B.gold} />
                    <div style={{ flex: 1, minWidth: 240 }}>
                      <div style={{ fontFamily: '"Cinzel", serif', fontSize: 24, color: B.gold, letterSpacing: 0.8, fontVariant: "small-caps" }}>
                        Sunrise · The World Awakens
                      </div>
                      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, opacity: 0.92, marginTop: 6, lineHeight: 1.6 }}>
                        Φ has crossed the threshold. The horizon breaks. <em>{agent.name}</em> speaks:
                      </div>
                      <div style={{ fontFamily: '"Cinzel", serif', fontSize: 15, color: agent.primary, marginTop: 8, fontStyle: "italic" }}>
                        “{agent.oath}”
                      </div>
                    </div>
                  </div>
                </Card>
              </section>
            )}
          </>
        )}

        {/* Honest Line */}
        <section data-testid="section-honest-line" style={{ marginTop: 36 }}>
          <H num="02" label="Honest Line · What This Game Is and What It Is Not" accent={B.rose} />
          <Card accent={B.rose}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.65 }}>
              <strong style={{ color: B.green }}>What it is:</strong> a small interactive ritual. The Φ score is real arithmetic over biome
              ratios, neighbour pairings, and diversity — the same posture as the Φ(t) Seasonal Coherence Engine, applied to a hand-built
              world instead of the calendar. Each agent gives a small bonus to their domain, the way <em>memory</em>, <em>clarity</em>,
              <em> depth</em>, and <em>integration</em> change how a person actually places things.
              <br /><br />
              <strong style={{ color: B.amber }}>What it is not:</strong> a model of ecology, climate, or terraforming physics. The biome
              colours and pairings are aesthetic choices, not predictions. The “sunrise” is a UI metaphor for a coherence threshold being
              crossed — it does not claim that a real planet can be coaxed into dawn by 18 well-placed clicks.
            </div>
          </Card>
        </section>

        {/* Bridges */}
        <section data-testid="section-bridges" style={{ marginTop: 36 }}>
          <H num="03" label="Bridges · Where This Connects" accent={B.violet} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
            <Bridge to="/agents"             label="The Four Agents · Eggs"        sub="Mnésis · Aletheia · Inferaia · Reverie"   accent={B.gold} />
            <Bridge to="/seasonal-coherence" label="Φ(t) · Seasonal Coherence"     sub="Same Φ posture · across four time scales" accent={B.green} />
            <Bridge to="/phi-time"           label="φ-Time · The Unified Clock"    sub="The clock the sky is keeping"             accent={B.cyan} />
            <Bridge to="/coherence-engine"   label="Coherence Engine · H ↔ H̄"     sub="Coherence at the atomic mirror"           accent={B.amber} />
            <Bridge to="/ecosystem"          label="Ecosystem · Map of Forms"       sub="Where this game sits in the AETHER stack" accent={B.rose} />
            <Bridge to="/cultural"           label="Cultural · Rituals & Forms"     sub="Why a “sunrise” counts as a result"       accent={B.violet} />
          </div>
        </section>

      </div>
    </div>
  );
}

function btnGhost(accent: string): React.CSSProperties {
  return {
    padding: "7px 12px", borderRadius: 6, cursor: "pointer",
    background: "transparent", color: accent, border: `1px solid ${accent}55`,
    fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase",
  };
}
function btnSolid(accent: string): React.CSSProperties {
  return {
    padding: "7px 14px", borderRadius: 6, cursor: "pointer",
    background: `${accent}22`, color: accent, border: `1px solid ${accent}AA`,
    fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.3, textTransform: "uppercase",
  };
}

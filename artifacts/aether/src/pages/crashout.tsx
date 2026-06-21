import { useState, useEffect, useRef, useCallback } from "react";

// ── Types ────────────────────────────────────────────────────────────────────
interface Entry {
  id: string;
  text: string;
  ts: number;        // unix ms
  color: string;
  category: string;
  words: number;
  mood: string;
  done?: boolean;
}

// ── Auto-classify by keyword ─────────────────────────────────────────────────
const CATS: { label: string; color: string; mood: string; keys: string[] }[] = [
  { label:"QUANTUM",   color:"#06b6d4", mood:"🔬", keys:["quantum","aether","coherence","fibonacci","wave","field","energy","lattice","spin","node","resonan","photon","neutron","tritium"] },
  { label:"IDEA",      color:"#fbbf24", mood:"💡", keys:["idea","build","create","design","make","could","should","what if","imagine","want to","plan","need to","let's","maybe we"] },
  { label:"DISCOVERY", color:"#22c55e", mood:"🌱", keys:["found","discover","realise","realize","understand","pattern","connect","see how","this means","answer","unlock","key","breakthrough"] },
  { label:"FEELING",   color:"#f472b6", mood:"💫", keys:["feel","tired","overwhelm","love","hate","scared","anxious","excited","happy","sad","angry","frustrated","grateful","miss","hope","fear"] },
  { label:"QUESTION",  color:"#c084fc", mood:"❓", keys:["why","how","what","when","where","does","could it","is it","can we","would","should","wonder","question","?"] },
  { label:"RAW",       color:"#f97316", mood:"🔥", keys:["ugh","wtf","okay","literally","honestly","actually","wait","no","yes","damn","wow","whoa","sick","crazy","wild","brain"] },
];

function classify(text: string): { label: string; color: string; mood: string } {
  const lower = text.toLowerCase();
  for (const cat of CATS) {
    if (cat.keys.some(k => lower.includes(k))) return cat;
  }
  return { label:"NOTE", color:"rgba(255,255,255,0.55)", mood:"📝" };
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const LS_KEY = "aether.crashout.v1";
function loadEntries(): Entry[] {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]"); }
  catch { return []; }
}
function saveEntries(entries: Entry[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(entries));
}

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
function fmtDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
function fmtDay(ts: number) {
  const d = new Date(ts);
  const today = new Date();
  if (d.toDateString() === today.toDateString()) return "TODAY";
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return "YESTERDAY";
  return fmtDate(ts);
}

// Group entries by day
function groupByDay(entries: Entry[]): { day: string; ts: number; items: Entry[] }[] {
  const map = new Map<string, { day: string; ts: number; items: Entry[] }>();
  for (const e of entries) {
    const key = fmtDay(e.ts);
    if (!map.has(key)) map.set(key, { day: key, ts: e.ts, items: [] });
    map.get(key)!.items.push(e);
  }
  return [...map.values()].sort((a, b) => b.ts - a.ts);
}

// ── Mini timeline canvas ──────────────────────────────────────────────────────
function TimelineCanvas({ entries, hovered, onHover }: {
  entries: Entry[];
  hovered: string | null;
  onHover: (id: string | null) => void;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const hovRef = useRef<string | null>(null);
  hovRef.current = hovered;

  const nodeMap = useRef<{ id: string; x: number; y: number; r: number }[]>([]);

  const draw = useCallback(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    if (!entries.length) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.font = "9px monospace";
      ctx.textAlign = "center";
      ctx.fillText("entries will map here", W / 2, H / 2);
      return;
    }

    const now = Date.now();
    const minTs = Math.min(...entries.map(e => e.ts));
    const span = Math.max(now - minTs, 1000 * 60 * 60); // at least 1h
    const PAD = 24;

    // Day dividers
    const days = new Set<string>();
    for (const e of entries) {
      const d = fmtDay(e.ts);
      if (!days.has(d)) {
        days.add(d);
        const x = PAD + ((e.ts - minTs) / span) * (W - PAD * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.06)";
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.font = "6px monospace";
        ctx.textAlign = "left";
        ctx.fillText(d, x + 2, 8);
      }
    }

    // Timeline axis
    ctx.strokeStyle = "rgba(0,255,136,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD, H / 2); ctx.lineTo(W - PAD, H / 2); ctx.stroke();

    // Nodes
    const nodes: { id: string; x: number; y: number; r: number }[] = [];
    const placed: { x: number; y: number; r: number }[] = [];
    const SEED = 42;

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const x = PAD + ((e.ts - minTs) / span) * (W - PAD * 2);
      const r = Math.max(4, Math.min(12, 4 + e.words * 0.15));

      // Avoid overlap: try multiple y offsets
      let y = H / 2;
      const offsets = [0, -20, 20, -38, 38, -56, 56, -74, 74];
      for (const dy of offsets) {
        const cy = H / 2 + dy;
        const collide = placed.some(p => Math.hypot(p.x - x, p.y - cy) < p.r + r + 2);
        if (!collide) { y = cy; break; }
      }
      placed.push({ x, y, r });
      nodes.push({ id: e.id, x, y, r });
    }
    nodeMap.current = nodes;

    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      const n = nodes[i];
      const isHov = hovRef.current === e.id;

      // Connection line to axis
      ctx.strokeStyle = `${e.color}40`;
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(n.x, H / 2); ctx.lineTo(n.x, n.y); ctx.stroke();

      // Node
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r + (isHov ? 3 : 0), 0, Math.PI * 2);
      ctx.fillStyle = isHov ? e.color : `${e.color}88`;
      ctx.fill();
      if (isHov) {
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Label
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "bold 7px monospace";
        ctx.textAlign = n.x > W / 2 ? "right" : "left";
        const lx = n.x > W / 2 ? n.x - n.r - 3 : n.x + n.r + 3;
        ctx.fillText(fmtTime(e.ts), lx, n.y - 2);
        ctx.fillStyle = e.color;
        ctx.font = "6px monospace";
        ctx.fillText(e.category, lx, n.y + 7);
      }
    }

    // "Now" marker
    const nowX = W - PAD;
    ctx.strokeStyle = "rgba(0,255,136,0.4)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(nowX, 0); ctx.lineTo(nowX, H); ctx.stroke();
    ctx.fillStyle = "rgba(0,255,136,0.6)";
    ctx.font = "6px monospace";
    ctx.textAlign = "right";
    ctx.fillText("NOW", nowX - 2, 8);
  }, [entries]);

  useEffect(() => { draw(); }, [draw, hovered]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      draw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [draw]);

  // Mouse interaction
  const onMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = ref.current; if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);
    const hit = nodeMap.current.find(n => Math.hypot(n.x - mx, n.y - my) < n.r + 4);
    onHover(hit?.id ?? null);
  }, [onHover]);

  return (
    <canvas
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => onHover(null)}
      style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────
function CrashoutCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const particles: {x:number,y:number,vx:number,vy:number,col:string,life:number}[]=[];
    let t=0;
    const spawn=()=>{
      const cx=W/2, cy=H/2;
      const ang=Math.random()*Math.PI*2, spd=1+Math.random()*3;
      particles.push({ x:cx, y:cy, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, col:`hsl(${Math.random()*60+5},90%,60%)`, life:1 });
    };
    const draw=()=>{
      ctx.fillStyle="rgba(2,8,18,0.2)"; ctx.fillRect(0,0,W,H);
      t++;
      if(t%3===0&&particles.length<80) spawn();
      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i]; p.x+=p.vx; p.y+=p.vy; p.vy+=0.05; p.life-=0.012;
        if(p.life<=0||p.x<0||p.x>W||p.y>H){ particles.splice(i,1); continue; }
        ctx.globalAlpha=p.life; ctx.beginPath(); ctx.arc(p.x,p.y,2.5,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.shadowColor=p.col; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
      }
      ctx.globalAlpha=1;
      ctx.fillStyle="rgba(255,100,30,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("CRASHOUT · SIGNAL BURST · ENTROPY CASCADE · PARTICLE DECAY · AETHER FAULT DETECTION",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function CrashoutPage() {
  const [entries, setEntries] = useState<Entry[]>(loadEntries);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [openEntry, setOpenEntry] = useState<Entry | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Persist on change
  useEffect(() => { saveEntries(entries); }, [entries]);

  // Auto-scroll to top of list when new entry added
  useEffect(() => {
    if (justAdded) listRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [justAdded]);

  const submit = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const cat = classify(trimmed);
    const entry: Entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      text: trimmed,
      ts: Date.now(),
      color: cat.color,
      category: cat.label,
      mood: cat.mood,
      words: trimmed.split(/\s+/).filter(Boolean).length,
    };
    setEntries(prev => [entry, ...prev]);
    setText("");
    setJustAdded(entry.id);
    setTimeout(() => setJustAdded(null), 1500);
    textareaRef.current?.focus();
  }, [text]);

  const deleteEntry = useCallback((id: string) => {
    setDeletingId(id);
    setTimeout(() => {
      setEntries(prev => prev.filter(e => e.id !== id));
      setDeletingId(null);
    }, 300);
  }, []);

  const toggleDone = useCallback((id: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, done: !e.done } : e));
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" && (e.metaKey || e.ctrlKey)) || (e.key === "Enter" && !e.shiftKey && text.trim().length > 0 && !e.shiftKey)) {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        // Allow newlines with plain Enter if text is short (< 120 chars) and multi-line already
        if (text.includes("\n") || text.length < 120) { e.preventDefault(); submit(); return; }
      } else {
        e.preventDefault(); submit();
      }
    }
  };

  // Filtered + searched view
  const visible = entries.filter(e =>
    (!filter || e.category === filter) &&
    (!search || e.text.toLowerCase().includes(search.toLowerCase()))
  );
  const groups = groupByDay(visible);

  // Stats
  const totalWords = entries.reduce((s, e) => s + e.words, 0);
  const todayCount = entries.filter(e => fmtDay(e.ts) === "TODAY").length;
  const doneCount  = entries.filter(e => e.done).length;
  const catCounts  = CATS.map(c => ({ ...c, count: entries.filter(e => e.category === c.label).length }));

  // Coherence % — HHI-based concentration score (100% = all same category, 0% = perfectly spread)
  const coherencePct = (() => {
    const n = entries.length;
    if (n === 0) return 0;
    const nCats = CATS.length + 1; // +1 for NOTE
    const hhi = catCounts.reduce((s, c) => s + Math.pow(c.count / n, 2), 0);
    const minHHI = 1 / nCats;
    const pct = ((hhi - minHHI) / (1 - minHHI)) * 100;
    return Math.max(0, Math.min(100, pct));
  })();

  // Coherence colour: low=rose, mid=gold, high=teal
  const coherenceColor = coherencePct >= 66 ? "#00e5c0" : coherencePct >= 33 ? "#fbbf24" : "#fb7185";

  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };
  const G = "#00ff88";
  const BRD = "rgba(0,255,136,0.1)";

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, ...mono, overflow: "hidden" }}>
      <div style={{ padding:"16px 24px 0", flexShrink:0 }}>
        <div style={{ display:"inline-block", border:"1px solid #ff6418", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#ff6418", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,8,18,0.9)", border:"1px solid rgba(255,100,30,0.15)", borderLeft:"3px solid #ff6418", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Crashout · Signal Burst · Entropy Cascade · Particle Decay · AETHER Fault Detection
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(255,100,30,0.45)", margin:"0 0 14px", lineHeight:1.65 }}>
            Hot orange particle burst erupting from centre with gravity-curved trajectories — the live AETHER crashout entropy fault simulation.
          </p>
          <CrashoutCanvas />
        </div>
      </div>

      {/* Header */}
      <div style={{ padding: "6px 16px", borderBottom: `1px solid ${BRD}`, display: "flex", alignItems: "center", gap: 14, flexShrink: 0, flexWrap: "wrap" }}>
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: 4 }}>CRASHOUT</span>
        <span style={{ fontSize: 8, opacity: 0.3, letterSpacing: 2 }}>BRAIN DUMP · IDEA GARBAGE · REAL-TIME MAP</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 16, alignItems: "center" }}>
          {/* Coherence ring indicator */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <svg width={36} height={36} viewBox="0 0 36 36">
              <circle cx={18} cy={18} r={14} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={3} />
              <circle cx={18} cy={18} r={14} fill="none"
                stroke={coherenceColor}
                strokeWidth={3}
                strokeDasharray={`${coherencePct * 0.879} 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
                style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.6s ease" }}
              />
              <text x={18} y={21} textAnchor="middle" fill={coherenceColor}
                fontSize={7} fontFamily="'Courier New',monospace" fontWeight={700}>
                {Math.round(coherencePct)}%
              </text>
            </svg>
            <div style={{ fontSize: 5, color: "rgba(255,255,255,0.25)", letterSpacing: 1 }}>COHERENCE</div>
          </div>

          <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.07)" }} />

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: G }}>{entries.length}</div>
            <div style={{ fontSize: 6, opacity: 0.4, letterSpacing: 1 }}>ENTRIES</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#00ff88" }}>
              {doneCount}<span style={{ fontSize: 9, opacity: 0.5 }}>/{entries.length}</span>
            </div>
            <div style={{ fontSize: 6, opacity: 0.4, letterSpacing: 1 }}>✓ DONE</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>{todayCount}</div>
            <div style={{ fontSize: 6, opacity: 0.4, letterSpacing: 1 }}>TODAY</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#c084fc" }}>{totalWords}</div>
            <div style={{ fontSize: 6, opacity: 0.4, letterSpacing: 1 }}>WORDS</div>
          </div>
        </div>
      </div>

      {/* Coherence + done progress bar above tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, borderBottom: `1px solid ${BRD}`, flexShrink: 0, background: "rgba(0,0,0,0.2)" }}>
        {/* Coherence bar segment */}
        <div style={{ flex: 1, padding: "4px 14px 4px", display: "flex", alignItems: "center", gap: 8, borderRight: `1px solid ${BRD}` }}>
          <span style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", letterSpacing: 2, flexShrink: 0 }}>COHERENCE</span>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: `${coherencePct}%`,
              background: `linear-gradient(90deg, ${coherenceColor}88, ${coherenceColor})`,
              transition: "width 0.6s ease, background 0.6s ease",
            }} />
          </div>
          <span style={{ fontSize: 7, color: coherenceColor, letterSpacing: 1, flexShrink: 0, minWidth: 28, textAlign: "right" }}>
            {Math.round(coherencePct)}%
          </span>
        </div>
        {/* Done checkmark bar segment */}
        <div style={{ flex: 1, padding: "4px 14px 4px", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", letterSpacing: 2, flexShrink: 0 }}>✓ RESOLVED</span>
          <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2,
              width: entries.length ? `${(doneCount / entries.length) * 100}%` : "0%",
              background: "linear-gradient(90deg, #00ff8860, #00ff88)",
              transition: "width 0.4s ease",
            }} />
          </div>
          <span style={{ fontSize: 7, color: "#00ff88", letterSpacing: 1, flexShrink: 0, minWidth: 36, textAlign: "right" }}>
            {doneCount}/{entries.length}
          </span>
        </div>
      </div>

      {/* Category filter pills */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BRD}`, flexShrink: 0, overflowX: "auto" }}>
        <button onClick={() => setFilter(null)}
          style={{ padding: "4px 14px", fontSize: 7, background: filter === null ? "rgba(0,255,136,0.1)" : "transparent", border: "none", borderRight: `1px solid ${BRD}`, color: filter === null ? G : "rgba(255,255,255,0.3)", cursor: "pointer", letterSpacing: 2, ...mono, flexShrink: 0 }}>
          ALL ({entries.length})
        </button>
        {catCounts.filter(c => c.count > 0).map(cat => (
          <button key={cat.label} onClick={() => setFilter(f => f === cat.label ? null : cat.label)}
            style={{ padding: "4px 12px", fontSize: 7, background: filter === cat.label ? `${cat.color}18` : "transparent", border: "none", borderRight: `1px solid ${BRD}`, color: filter === cat.label ? cat.color : `${cat.color}80`, cursor: "pointer", letterSpacing: 2, ...mono, flexShrink: 0 }}>
            {cat.mood} {cat.label} ({cat.count})
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="search entries..."
          style={{ padding: "4px 12px", fontSize: 8, background: "transparent", border: "none", borderLeft: `1px solid ${BRD}`, color: "rgba(255,255,255,0.5)", outline: "none", ...mono, width: 160 }}
        />
      </div>

      {/* Main split */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "340px 1fr", minHeight: 0 }}>

        {/* LEFT — Input panel */}
        <div style={{ borderRight: `1px solid ${BRD}`, display: "flex", flexDirection: "column" }}>

          {/* Textarea */}
          <div style={{ flex: 1, padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ fontSize: 7, color: "rgba(0,255,136,0.4)", letterSpacing: 2 }}>
              {new Date().toLocaleString([], { weekday: "long", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }).toUpperCase()}
            </div>

            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Crash it out here.\n\nRandom thoughts, half-ideas, observations, rants, questions — anything. It gets mapped automatically.\n\nPress Enter or ⌘Enter to save.`}
              autoFocus
              style={{
                flex: 1,
                resize: "none",
                background: "rgba(0,255,136,0.02)",
                border: `1px solid ${text.trim() ? "rgba(0,255,136,0.3)" : "rgba(0,255,136,0.08)"}`,
                borderRadius: 6,
                color: "rgba(255,255,255,0.85)",
                fontSize: 13,
                lineHeight: 1.75,
                padding: "12px 14px",
                outline: "none",
                ...mono,
                transition: "border-color 0.2s",
                caretColor: G,
              }}
            />

            {/* Live classification preview */}
            {text.trim() && (() => {
              const cat = classify(text);
              return (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 6, border: `1px solid ${cat.color}30`, background: `${cat.color}08` }}>
                  <span style={{ fontSize: 12 }}>{cat.mood}</span>
                  <span style={{ fontSize: 8, color: cat.color, letterSpacing: 2 }}>{cat.label}</span>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.3)", marginLeft: "auto" }}>{text.trim().split(/\s+/).filter(Boolean).length} words</span>
                </div>
              );
            })()}

            <button
              onClick={submit}
              disabled={!text.trim()}
              style={{
                padding: "10px",
                background: text.trim() ? "rgba(0,255,136,0.1)" : "transparent",
                border: `1px solid ${text.trim() ? "rgba(0,255,136,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 6,
                color: text.trim() ? G : "rgba(255,255,255,0.2)",
                cursor: text.trim() ? "pointer" : "not-allowed",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: 4,
                ...mono,
                transition: "all 0.2s",
              }}>
              DUMP IT  ↵
            </button>
          </div>

          {/* Mini stats */}
          <div style={{ borderTop: `1px solid ${BRD}`, padding: "8px 12px" }}>
            <div style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", letterSpacing: 2, marginBottom: 6 }}>SESSION BREAKDOWN</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {catCounts.filter(c => c.count > 0).map(cat => (
                <div key={cat.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 8 }}>{cat.mood}</span>
                  <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${(cat.count / entries.length) * 100}%`, background: cat.color, borderRadius: 2 }} />
                  </div>
                  <span style={{ fontSize: 7, color: cat.color, width: 20, textAlign: "right" }}>{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Timeline + map */}
        <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>

          {/* Visual map canvas */}
          <div style={{ height: 110, borderBottom: `1px solid ${BRD}`, position: "relative", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 4, left: 8, fontSize: 6, color: "rgba(0,255,136,0.3)", letterSpacing: 2, zIndex: 1 }}>TIMELINE MAP</div>
            <TimelineCanvas entries={visible} hovered={hovered} onHover={setHovered} />
          </div>

          {/* Entry list */}
          <div ref={listRef} style={{ flex: 1, overflowY: "auto" }}>
            {groups.length === 0 && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", opacity: 0.3, gap: 8 }}>
                <div style={{ fontSize: 32 }}>🗒️</div>
                <div style={{ fontSize: 8, letterSpacing: 3 }}>{search || filter ? "NO MATCHING ENTRIES" : "NOTHING YET · START DUMPING"}</div>
              </div>
            )}

            {groups.map(group => (
              <div key={group.day}>
                {/* Day separator */}
                <div style={{ padding: "6px 16px", background: "rgba(0,255,136,0.03)", borderBottom: `1px solid ${BRD}`, display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 2 }}>
                  <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: 3, color: G }}>{group.day}</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(0,255,136,0.1)" }} />
                  <span style={{ fontSize: 6, color: "rgba(255,255,255,0.3)" }}>{group.items.length} entries</span>
                </div>

                {group.items.map((entry, idx) => {
                  const isHov = hovered === entry.id;
                  const isNew = justAdded === entry.id;
                  const isDel = deletingId === entry.id;
                  return (
                    <div
                      key={entry.id}
                      onMouseEnter={() => setHovered(entry.id)}
                      onMouseLeave={() => setHovered(null)}
                      style={{
                        padding: "10px 16px",
                        borderBottom: `1px solid rgba(255,255,255,0.04)`,
                        borderLeft: `3px solid ${isHov ? entry.color : entry.done ? `${entry.color}50` : `${entry.color}30`}`,
                        background: isNew ? `${entry.color}10` : entry.done ? "rgba(0,255,136,0.03)" : isHov ? "rgba(255,255,255,0.02)" : "transparent",
                        transition: "all 0.25s",
                        opacity: isDel ? 0 : entry.done ? 0.5 : 1,
                        transform: isDel ? "translateX(-20px)" : isNew ? "translateX(0)" : "none",
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                        cursor: "default",
                        position: "relative",
                      }}>

                      {/* Entry number */}
                      <div style={{ fontSize: 8, color: "rgba(255,255,255,0.15)", minWidth: 24, textAlign: "right", paddingTop: 2, flexShrink: 0, ...mono }}>
                        {String(entries.indexOf(entry) + 1).padStart(3, "0")}
                      </div>

                      {/* Content */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <span style={{ fontSize: 7, color: `${entry.color}90`, letterSpacing: 1 }}>{fmtTime(entry.ts)}</span>
                          <span style={{ fontSize: 8 }}>{entry.mood}</span>
                          <span style={{ fontSize: 6, color: entry.color, letterSpacing: 1.5, padding: "1px 5px", border: `1px solid ${entry.color}30`, borderRadius: 10 }}>{entry.category}</span>
                          <span style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", marginLeft: "auto" }}>{entry.words}w</span>
                        </div>
                        <div style={{
                          fontSize: 12,
                          color: entry.done ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.78)",
                          lineHeight: 1.7,
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-word",
                          fontFamily: "system-ui, -apple-system, sans-serif",
                          fontWeight: 400,
                          textDecoration: entry.done ? "line-through" : "none",
                          textDecorationColor: "rgba(0,255,136,0.3)",
                        }}>
                          {entry.text}
                        </div>
                        {entry.done && (
                          <div style={{ fontSize: 7, color: "rgba(0,255,136,0.45)", letterSpacing: 2, marginTop: 4 }}>
                            ✓ RESOLVED
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {isHov && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
                          <button
                            onClick={() => toggleDone(entry.id)}
                            style={{
                              background: entry.done ? "rgba(0,255,136,0.18)" : "rgba(0,255,136,0.06)",
                              border: `1px solid ${entry.done ? "rgba(0,255,136,0.6)" : "rgba(0,255,136,0.25)"}`,
                              color: entry.done ? "#00ff88" : "rgba(0,255,136,0.5)",
                              cursor: "pointer", fontSize: 9,
                              padding: "2px 7px", borderRadius: 4, letterSpacing: 1,
                              fontFamily: "'Courier New', monospace", lineHeight: 1.6,
                            }}
                            title={entry.done ? "Mark undone" : "Mark done"}>
                            {entry.done ? "✓" : "○"}
                          </button>
                          <button
                            onClick={() => setOpenEntry(entry)}
                            style={{
                              background: `${entry.color}15`, border: `1px solid ${entry.color}40`,
                              color: entry.color, cursor: "pointer", fontSize: 7,
                              padding: "2px 7px", borderRadius: 4, letterSpacing: 1.5,
                              fontFamily: "'Courier New', monospace", lineHeight: 1.6,
                            }}
                            title="Open entry">
                            OPEN
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            style={{
                              background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.25)",
                              color: "rgba(255,100,100,0.7)", cursor: "pointer", fontSize: 7,
                              padding: "2px 7px", borderRadius: 4, letterSpacing: 1.5,
                              fontFamily: "'Courier New', monospace", lineHeight: 1.6,
                            }}
                            title="Remove entry">
                            DEL
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Bottom padding */}
            <div style={{ height: 40 }} />
          </div>
        </div>
      </div>

      {/* ── Open Entry Modal ── */}
      {openEntry && (
        <div
          onClick={() => setOpenEntry(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 9999,
            background: "rgba(0,0,0,0.88)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "zoom-out",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 620, width: "90vw",
              background: "rgb(4,12,24)",
              border: `1px solid ${openEntry.color}30`,
              borderLeft: `4px solid ${openEntry.color}`,
              borderRadius: 10,
              padding: "24px 28px",
              cursor: "default",
              boxShadow: `0 0 60px ${openEntry.color}12`,
              fontFamily: "'Courier New', monospace",
            }}
          >
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <span style={{ fontSize: 18 }}>{openEntry.mood}</span>
              <div>
                <div style={{ fontSize: 7, color: openEntry.color, letterSpacing: 2 }}>{openEntry.category}</div>
                <div style={{ fontSize: 7, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginTop: 2 }}>
                  {fmtDate(openEntry.ts)} · {fmtTime(openEntry.ts)} · {openEntry.words} words
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                <button
                  onClick={() => {
                    deleteEntry(openEntry.id);
                    setOpenEntry(null);
                  }}
                  style={{
                    background: "rgba(255,60,60,0.08)", border: "1px solid rgba(255,60,60,0.25)",
                    color: "rgba(255,100,100,0.7)", cursor: "pointer", fontSize: 7,
                    padding: "3px 10px", borderRadius: 4, letterSpacing: 1.5,
                    fontFamily: "'Courier New', monospace",
                  }}>
                  REMOVE
                </button>
                <button
                  onClick={() => setOpenEntry(null)}
                  style={{
                    background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
                    color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 10,
                    padding: "3px 8px", borderRadius: 4,
                    fontFamily: "'Courier New', monospace",
                  }}>
                  ×
                </button>
              </div>
            </div>

            {/* Entry text */}
            <div style={{
              fontSize: 15, lineHeight: 1.85,
              color: "rgba(255,255,255,0.88)",
              whiteSpace: "pre-wrap", wordBreak: "break-word",
              fontFamily: "system-ui, -apple-system, sans-serif",
              fontWeight: 400,
              padding: "16px 0",
              borderTop: `1px solid ${openEntry.color}15`,
              borderBottom: `1px solid ${openEntry.color}15`,
              maxHeight: "60vh", overflowY: "auto",
            }}>
              {openEntry.text}
            </div>

            {/* Nav between entries */}
            {(() => {
              const all = entries;
              const idx = all.findIndex(e => e.id === openEntry.id);
              const prev = all[idx + 1];
              const next = all[idx - 1];
              return (
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button
                    disabled={!prev}
                    onClick={() => prev && setOpenEntry(prev)}
                    style={{
                      padding: "4px 12px", borderRadius: 4,
                      border: `1px solid ${prev ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.05)"}`,
                      background: "transparent", cursor: prev ? "pointer" : "not-allowed",
                      color: prev ? "rgba(0,255,136,0.6)" : "rgba(255,255,255,0.1)",
                      fontSize: 7, letterSpacing: 1.5, fontFamily: "'Courier New', monospace",
                    }}>
                    ← OLDER
                  </button>
                  <div style={{ flex: 1, textAlign: "center", fontSize: 7, color: "rgba(255,255,255,0.15)", letterSpacing: 1, alignSelf: "center" }}>
                    {idx + 1} / {all.length}
                  </div>
                  <button
                    disabled={!next}
                    onClick={() => next && setOpenEntry(next)}
                    style={{
                      padding: "4px 12px", borderRadius: 4,
                      border: `1px solid ${next ? "rgba(0,255,136,0.2)" : "rgba(255,255,255,0.05)"}`,
                      background: "transparent", cursor: next ? "pointer" : "not-allowed",
                      color: next ? "rgba(0,255,136,0.6)" : "rgba(255,255,255,0.1)",
                      fontSize: 7, letterSpacing: 1.5, fontFamily: "'Courier New', monospace",
                    }}>
                    NEWER →
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

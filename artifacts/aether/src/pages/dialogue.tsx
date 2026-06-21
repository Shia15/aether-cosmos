import { useState, useRef, useEffect, useCallback } from "react";

/* ── Palette ──────────────────────────────────── */
const BG      = "#020408";
const PANEL   = "#050d14";
const BLUE    = "#1a9fd4";
const TEAL    = "#1fd4c8";
const VIOLET  = "#8b5cf6";
const AMBER   = "#e8a030";
const GREEN   = "#22c55e";
const ROSE    = "#e84070";
const DIM     = "#3a5060";
const TEXT    = "#c8d8e0";
const GOLD    = "#c9a84c";
const MUTED   = "#6a8898";
const STONE   = "#b0a090";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const STORAGE_KEY = "aether.dialogue.v1";

/* ── Types ────────────────────────────────────── */
type Role = "user" | "assistant";
interface Msg { id: string; role: Role; content: string; ts: number; isContext?: boolean }

interface ScanStats {
  nodes: number;
  edges: number;
  concepts: number;
  documents: number;
  globalCoherence: number | null;
}

/* ── Strategic lenses ─────────────────────────── */
const LENSES = [
  {
    group: "MOMENTUM",
    col: GREEN,
    prompts: [
      "Across all AETHER projects, which has the clearest momentum signal right now and why?",
      "What is the compounding mechanic inside AETHER that, if scaled, would build on itself fastest?",
    ],
  },
  {
    group: "FRICTION",
    col: ROSE,
    prompts: [
      "Where is energy being lost or diffused in AETHER? What would you stop or restructure first?",
      "What is the single biggest bottleneck between where AETHER is now and its first clear revenue?",
    ],
  },
  {
    group: "SYNTHESIS",
    col: VIOLET,
    prompts: [
      "What non-obvious connection between two AETHER modules could unlock a new application or market?",
      "Map the Quaternion Burst cycle to the current state of AETHER as a business — which phase are we in?",
    ],
  },
  {
    group: "EXECUTION",
    col: AMBER,
    prompts: [
      "If I had 30 focused days, which AETHER project should absorb them entirely and what would done look like?",
      "Give me 3 concrete actions I can take this week that compound long-term for AETHER.",
    ],
  },
  {
    group: "SCALE",
    col: TEAL,
    prompts: [
      "I have 100+ live AETHER pages. What is the coherent product story connecting them all?",
      "Which AETHER idea has the widest addressable market and what is its first beachhead?",
    ],
  },
  {
    group: "CLARITY",
    col: GOLD,
    prompts: [
      "What is AETHER's clearest value proposition to someone hearing about it for the first time?",
      "Where does my own vision for AETHER feel unclear to me? Help me crystallise it.",
    ],
  },
  {
    group: "DATA ANALYSIS",
    col: STONE,
    prompts: [
      "Scan all data, then tell me what the knowledge graph reveals about AETHER's intellectual center of gravity.",
      "Scan all data, then identify which concepts appear most and what domains are underrepresented.",
    ],
  },
];

/* ── Utility ──────────────────────────────────── */
function uid() { return Math.random().toString(36).slice(2, 10); }
function timeStr(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/* ── Image export ─────────────────────────────── */

/** Builds a speech-bubble canvas from a message and returns it. */
async function buildMessageCanvas(msg: Msg): Promise<HTMLCanvasElement> {
  await document.fonts.ready;

  const isUser     = msg.role === "user";
  const accent     = isUser ? "#8b5cf6" : "#1a9fd4";
  const accent2    = isUser ? "#e84070" : "#1fd4c8";
  const accentRGB  = isUser ? "139,92,246" : "26,159,212";

  const W = 860, PAD = 32;
  const FS = 17, LH = Math.round(FS * 1.78);
  const BP = 22; // bubble inner padding

  /* ── measure wrapped lines ── */
  const mc = document.createElement("canvas");
  const mx = mc.getContext("2d")!;
  mx.font = `${FS}px 'Crimson Pro', Georgia, serif`;
  const lines: string[] = [];
  for (const para of msg.content.split("\n")) {
    if (!para.trim()) { lines.push(""); continue; }
    let cur = "";
    for (const word of para.split(" ")) {
      const test = cur ? cur + " " + word : word;
      if (mx.measureText(test).width > W - PAD * 2 - BP * 2 && cur) { lines.push(cur); cur = word; }
      else cur = test;
    }
    if (cur) lines.push(cur);
  }

  const HEADER_H = 56, AVATAR_H = 42, TAIL_H = 14, FOOTER_H = 46;
  const BUBBLE_H = Math.max(80, lines.length * LH + BP * 2 + 4);
  const H = HEADER_H + AVATAR_H + BUBBLE_H + TAIL_H + 20 + FOOTER_H;

  /* ── canvas 2× retina ── */
  const cv = document.createElement("canvas");
  cv.width = W * 2; cv.height = H * 2;
  const ctx = cv.getContext("2d")!;
  ctx.scale(2, 2);

  /* background */
  ctx.fillStyle = "#020408";
  ctx.fillRect(0, 0, W, H);

  /* dot grid */
  ctx.fillStyle = "rgba(18,36,55,0.65)";
  for (let gx = 0; gx < W; gx += 28)
    for (let gy = 0; gy < H; gy += 28) {
      ctx.beginPath(); ctx.arc(gx, gy, 0.6, 0, Math.PI * 2); ctx.fill();
    }

  /* top gradient bar */
  const tg = ctx.createLinearGradient(0, 0, W, 0);
  tg.addColorStop(0, "transparent"); tg.addColorStop(0.15, accent);
  tg.addColorStop(0.5, "#c9a84c");  tg.addColorStop(0.85, accent2);
  tg.addColorStop(1, "transparent");
  ctx.fillStyle = tg; ctx.fillRect(0, 0, W, 2);

  /* ── HEADER ── */
  const hg = ctx.createLinearGradient(0, 0, 0, HEADER_H);
  hg.addColorStop(0, "rgba(3,10,18,0.97)"); hg.addColorStop(1, "rgba(2,4,8,0)");
  ctx.fillStyle = hg; ctx.fillRect(0, 0, W, HEADER_H);

  ctx.font = "8px 'Space Mono', monospace";
  ctx.fillStyle = accent + "b0"; ctx.textAlign = "left";
  ctx.fillText("AETHER  ·  DIALOGUE  CONSOLE  ·  SYNTHESIS  ENGINE", PAD, 20);

  ctx.fillStyle = "#263840"; ctx.textAlign = "right";
  ctx.fillText(new Date(msg.ts).toLocaleString(), W - PAD, 20);
  ctx.textAlign = "left";

  const dg = ctx.createLinearGradient(PAD, 0, W - PAD, 0);
  dg.addColorStop(0, accent + "55"); dg.addColorStop(1, "transparent");
  ctx.strokeStyle = dg; ctx.lineWidth = 0.7;
  ctx.beginPath(); ctx.moveTo(PAD, HEADER_H - 6); ctx.lineTo(W - PAD, HEADER_H - 6); ctx.stroke();

  /* ── AVATAR ROW ── */
  const avY  = HEADER_H + 8;
  const avCY = avY + 16;
  const avR  = 15;

  if (isUser) {
    const avCX = W - PAD - avR;
    ctx.fillStyle = `rgba(139,92,246,0.18)`;
    ctx.strokeStyle = `rgba(139,92,246,0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(avCX, avCY, avR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = "bold 9px 'Space Mono', monospace";
    ctx.fillStyle = "#b096f8"; ctx.textAlign = "center";
    ctx.fillText("SM", avCX, avCY + 3.5);
    ctx.font = "8px 'Space Mono', monospace";
    ctx.fillStyle = "#3a5060"; ctx.textAlign = "right";
    ctx.fillText(`SHIA MILLER  ·  ${timeStr(msg.ts)}`, avCX - avR - 8, avCY + 3.5);
  } else {
    const avCX = PAD + avR;
    ctx.fillStyle = `rgba(26,159,212,0.18)`;
    ctx.strokeStyle = `rgba(26,159,212,0.5)`;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(avCX, avCY, avR, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.font = "bold 9px 'Space Mono', monospace";
    ctx.fillStyle = "#5ac0e8"; ctx.textAlign = "center";
    ctx.fillText("AE", avCX, avCY + 3.5);
    ctx.font = "8px 'Space Mono', monospace";
    ctx.fillStyle = "#3a5060"; ctx.textAlign = "left";
    ctx.fillText(`AETHER DIALOGUE  ·  ${timeStr(msg.ts)}`, avCX + avR + 8, avCY + 3.5);
  }

  /* ── SPEECH BUBBLE ── */
  const bX = PAD, bY = HEADER_H + AVATAR_H;
  const bW = W - PAD * 2, bR = 16;

  ctx.fillStyle   = `rgba(${accentRGB},0.09)`;
  ctx.strokeStyle = `rgba(${accentRGB},0.32)`;
  ctx.lineWidth = 1.2;

  /* rounded rect */
  ctx.beginPath();
  ctx.moveTo(bX + bR, bY);
  ctx.arcTo(bX + bW, bY,      bX + bW, bY + BUBBLE_H, bR);
  ctx.arcTo(bX + bW, bY + BUBBLE_H, bX, bY + BUBBLE_H, bR);
  ctx.arcTo(bX,      bY + BUBBLE_H, bX, bY,             bR);
  ctx.arcTo(bX,      bY,            bX + bW, bY,         bR);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  /* tail — blends with bubble */
  ctx.fillStyle   = `rgba(${accentRGB},0.09)`;
  ctx.strokeStyle = `rgba(${accentRGB},0.28)`;
  ctx.lineWidth = 0.9;
  ctx.beginPath();
  if (isUser) {
    ctx.moveTo(bX + bW - 32, bY + BUBBLE_H);
    ctx.lineTo(bX + bW + 2,  bY + BUBBLE_H + TAIL_H);
    ctx.lineTo(bX + bW - 58, bY + BUBBLE_H);
  } else {
    ctx.moveTo(bX + 32, bY + BUBBLE_H);
    ctx.lineTo(bX - 2,  bY + BUBBLE_H + TAIL_H);
    ctx.lineTo(bX + 58, bY + BUBBLE_H);
  }
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  /* ── TEXT inside bubble ── */
  const baseCol = isUser ? "#d4c8e8" : "#c8d8e0";
  const boldCol = isUser ? "#c0a8ff" : "#2ef0d8";
  ctx.font = `${FS}px 'Crimson Pro', Georgia, serif`;
  ctx.fillStyle = baseCol;

  let ty = bY + BP + FS;
  for (const line of lines) {
    if (!line) { ty += LH * 0.5; continue; }
    let tx = bX + BP;
    for (const part of line.split(/(\*\*[^*]+\*\*)/g)) {
      if (part.startsWith("**") && part.endsWith("**")) {
        const t = part.slice(2, -2);
        ctx.font = `bold ${FS}px 'Crimson Pro', Georgia, serif`;
        ctx.fillStyle = boldCol;
        ctx.fillText(t, tx, ty); tx += ctx.measureText(t).width;
        ctx.font = `${FS}px 'Crimson Pro', Georgia, serif`;
        ctx.fillStyle = baseCol;
      } else {
        ctx.fillText(part, tx, ty); tx += ctx.measureText(part).width;
      }
    }
    ty += LH;
  }

  /* ── FOOTER ── */
  const fY = H - FOOTER_H;
  const fg = ctx.createLinearGradient(0, fY, 0, H);
  fg.addColorStop(0, "rgba(2,4,8,0)"); fg.addColorStop(1, "rgba(3,10,18,0.97)");
  ctx.fillStyle = fg; ctx.fillRect(0, fY, W, FOOTER_H);

  ctx.font = "7.5px 'Space Mono', monospace";
  ctx.fillStyle = "#1e3040"; ctx.textAlign = "left";
  ctx.fillText("AETHER KNOWLEDGE SYSTEM  ·  CRYSTALLISATION MODEL OF INTELLIGENCE", PAD, H - 13);

  ctx.fillStyle = accent;
  ctx.beginPath(); ctx.arc(W - PAD + 4, H - 13, 3, 0, Math.PI * 2); ctx.fill();

  /* bottom gradient bar */
  ctx.fillStyle = tg; ctx.fillRect(0, H - 2, W, 2);

  return cv;
}

async function copyImageToClipboard(cv: HTMLCanvasElement): Promise<void> {
  const blob = await new Promise<Blob | null>(res => cv.toBlob(res, "image/png"));
  if (!blob) throw new Error("No blob");
  await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
}

function saveImage(cv: HTMLCanvasElement, filename: string): void {
  cv.toBlob(blob => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
}
function loadMessages(): Msg[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Msg[];
  } catch { return []; }
}
function saveMessages(msgs: Msg[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs.slice(-60))); } catch { /**/ }
}

/* ── Animated dots ────────────────────────────── */
function ThinkingDots() {
  const [frame, setFrame] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 4), 400);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontFamily: mono, fontSize: 11, color: BLUE, letterSpacing: 2 }}>
      CRYSTALLISING{"...".slice(0, frame)}
    </span>
  );
}

/* ── Message bubble ───────────────────────────── */
function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  const isCtx  = msg.isContext;
  const [hovered,  setHovered]  = useState(false);
  const [copyState, setCopyState] = useState<"idle"|"loading"|"done">("idle");
  const [saveState, setSaveState] = useState<"idle"|"loading"|"done">("idle");

  const handleCopy = async () => {
    setCopyState("loading");
    try {
      const cv = await buildMessageCanvas(msg);
      await copyImageToClipboard(cv);
      setCopyState("done");
      setTimeout(() => setCopyState("idle"), 2200);
    } catch { setCopyState("idle"); }
  };

  const handleSave = async () => {
    setSaveState("loading");
    try {
      const cv = await buildMessageCanvas(msg);
      saveImage(cv, `aether-${msg.role}-${msg.id}.png`);
      setSaveState("done");
      setTimeout(() => setSaveState("idle"), 2200);
    } catch { setSaveState("idle"); }
  };

  if (isCtx) {
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{
          background: `${STONE}08`, border: `1px solid ${STONE}28`,
          borderRadius: 6, padding: "10px 14px",
        }}>
          <div style={{ fontFamily: mono, fontSize: 8, color: STONE, marginBottom: 4 }}>
            ◈ AETHER DATA SCAN INJECTED · {timeStr(msg.ts)}
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${STONE}80`, lineHeight: 1.5,
            maxHeight: 120, overflowY: "auto" }}>
            {msg.content.slice(0, 400)}{msg.content.length > 400 ? "…" : ""}
          </div>
        </div>
      </div>
    );
  }

  const accentCol = isUser ? VIOLET : BLUE;

  return (
    <div
      style={{
        display: "flex", flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        marginBottom: 20,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 5,
        flexDirection: isUser ? "row-reverse" : "row",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: isUser ? `${VIOLET}30` : `${BLUE}20`,
          border: `1px solid ${isUser ? VIOLET : BLUE}50`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: mono, fontSize: 9, color: isUser ? VIOLET : BLUE, flexShrink: 0,
        }}>
          {isUser ? "SM" : "AE"}
        </div>
        <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>
          {isUser ? "SHIA MILLER" : "AETHER DIALOGUE"} · {timeStr(msg.ts)}
        </span>
      </div>
      <div style={{
        maxWidth: "88%",
        background: isUser ? `${VIOLET}14` : `${BLUE}09`,
        border: `1px solid ${isUser ? VIOLET : BLUE}28`,
        borderRadius: isUser ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
        padding: "13px 17px",
      }}>
        {msg.content.split("\n").map((line, i) => {
          if (!line.trim()) return <br key={i} />;
          const parts = line.split(/(\*\*[^*]+\*\*)/g);
          return (
            <p key={i} style={{
              fontFamily: body, fontSize: 15, color: isUser ? "#d4c8e8" : TEXT,
              lineHeight: 1.75, margin: "0 0 4px",
            }}>
              {parts.map((p, j) =>
                p.startsWith("**") && p.endsWith("**")
                  ? <strong key={j} style={{ color: isUser ? "#c0a8ff" : TEAL, fontWeight: 600 }}>{p.slice(2, -2)}</strong>
                  : p
              )}
            </p>
          );
        })}
      </div>

      {/* ── Image export buttons ── */}
      <div style={{
        display: "flex", gap: 4,
        justifyContent: isUser ? "flex-end" : "flex-start",
        marginTop: 5,
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.18s",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        {/* COPY button */}
        <button
          onClick={handleCopy}
          disabled={copyState === "loading" || saveState === "loading"}
          title="Copy image to clipboard"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 10px 3px 8px",
            fontFamily: mono, fontSize: 8, letterSpacing: "0.05em",
            cursor: copyState === "loading" ? "wait" : "pointer",
            border: `1px solid ${copyState === "done" ? GREEN + "70" : accentCol + "35"}`,
            borderRadius: 20,
            background: copyState === "done"
              ? `${GREEN}18`
              : copyState === "loading" ? `${accentCol}10` : "transparent",
            color: copyState === "done" ? GREEN : copyState === "loading" ? accentCol : DIM,
            transition: "all 0.15s",
          }}
        >
          {copyState === "done" ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1.5,6 4.5,9 10.5,3" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
              <rect x="4" y="1" width="7" height="9" rx="1" />
              <path d="M2 3 H1.5 A0.5 0.5 0 0 0 1 3.5 V10.5 A0.5 0.5 0 0 0 1.5 11 H8.5 A0.5 0.5 0 0 0 9 10.5 V11" />
            </svg>
          )}
          {copyState === "loading" ? "BUILDING…" : copyState === "done" ? "COPIED!" : "COPY"}
        </button>

        {/* SAVE button */}
        <button
          onClick={handleSave}
          disabled={copyState === "loading" || saveState === "loading"}
          title="Save image as PNG"
          style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 10px 3px 8px",
            fontFamily: mono, fontSize: 8, letterSpacing: "0.05em",
            cursor: saveState === "loading" ? "wait" : "pointer",
            border: `1px solid ${saveState === "done" ? AMBER + "70" : accentCol + "35"}`,
            borderRadius: 20,
            background: saveState === "done"
              ? `${AMBER}18`
              : saveState === "loading" ? `${accentCol}10` : "transparent",
            color: saveState === "done" ? AMBER : saveState === "loading" ? accentCol : DIM,
            transition: "all 0.15s",
          }}
        >
          {saveState === "done" ? (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1.5,6 4.5,9 10.5,3" />
            </svg>
          ) : (
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3">
              <path d="M6 1 V7.5 M3.5 5.5 L6 8 L8.5 5.5" />
              <path d="M1.5 9.5 V10.5 A0.5 0.5 0 0 0 2 11 H10 A0.5 0.5 0 0 0 10.5 10.5 V9.5" />
            </svg>
          )}
          {saveState === "loading" ? "BUILDING…" : saveState === "done" ? "SAVED!" : "SAVE PNG"}
        </button>
      </div>
    </div>
  );
}

/* ── Sidebar lens button ─────────────────────── */
function LensPrompt({ text, col, onSend }: { text: string; col: string; onSend: (t: string) => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={() => onSend(text)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%", textAlign: "left", cursor: "pointer",
        background: hov ? `${col}14` : "transparent",
        border: `1px solid ${hov ? col + "40" : col + "18"}`,
        borderRadius: 6, padding: "8px 10px", marginBottom: 4,
        fontFamily: body, fontSize: 13, color: hov ? "#fff" : TEXT,
        lineHeight: 1.55, transition: "all 0.15s",
      }}
    >{text}</button>
  );
}

/* ── Data stats bar ───────────────────────────── */
function StatsBar({ stats, scanning, onScan }:
  { stats: ScanStats | null; scanning: boolean; onScan: () => void }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap",
      padding: "8px 14px",
      background: `${STONE}06`, borderBottom: `1px solid ${STONE}15`,
    }}>
      <div style={{ fontFamily: mono, fontSize: 8, color: STONE, letterSpacing: 2 }}>AETHER DATA</div>
      {stats ? (
        <>
          {[
            { label: "PAGES", val: "100+" },
            { label: "NODES",  val: String(stats.nodes) },
            { label: "EDGES",  val: String(stats.edges) },
            { label: "CONCEPTS", val: String(stats.concepts) },
            { label: "DOCS",   val: String(stats.documents) },
            { label: "C(x,t)", val: stats.globalCoherence != null ? stats.globalCoherence.toFixed(3) : "—" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ fontFamily: mono, fontSize: 7, color: DIM }}>{s.label}</span>
              <span style={{ fontFamily: mono, fontSize: 9, color: TEAL }}>{s.val}</span>
            </div>
          ))}
        </>
      ) : (
        <span style={{ fontFamily: mono, fontSize: 8, color: DIM }}>
          Knowledge graph + concepts + documents available
        </span>
      )}
      <div style={{ flex: 1 }} />
      <button
        onClick={onScan}
        disabled={scanning}
        style={{
          fontFamily: mono, fontSize: 8, padding: "4px 12px", borderRadius: 4, cursor: "pointer",
          border: `1px solid ${scanning ? DIM + "40" : STONE + "60"}`,
          background: scanning ? "transparent" : `${STONE}10`,
          color: scanning ? DIM : STONE,
          display: "flex", alignItems: "center", gap: 6,
        }}
      >
        {scanning ? "SCANNING…" : "◈ SCAN ALL DATA"}
      </button>
    </div>
  );
}

/* ── Main page ────────────────────────────────── */
function DialogueSimCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 200;
    const W = canvas.width, H = canvas.height;
    const cx=W/2, cy=H/2;
    const agents=[
      { x:W*0.15, y:H*0.45, col:"#2ef0d8", label:"AGENT A", msg:0 },
      { x:W*0.85, y:H*0.55, col:"#9966ff", label:"AGENT B", msg:0 },
    ];
    const packets: {x:number,y:number,tx:number,ty:number,t:number,col:string}[]=[];
    let tick=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.18)"; ctx.fillRect(0,0,W,H);
      tick++;
      if(tick%30===0&&packets.length<8){
        const from=agents[tick%2===0?0:1], to=agents[tick%2===0?1:0];
        packets.push({ x:from.x,y:from.y,tx:to.x,ty:to.y,t:0,col:from.col });
      }
      ctx.setLineDash([4,8]);
      ctx.beginPath(); ctx.moveTo(agents[0].x,agents[0].y); ctx.lineTo(agents[1].x,agents[1].y);
      ctx.strokeStyle="rgba(255,255,255,0.05)"; ctx.lineWidth=1; ctx.stroke();
      ctx.setLineDash([]);
      for(let i=packets.length-1;i>=0;i--){
        const p=packets[i]; p.t+=0.025;
        const px=p.x+(p.tx-p.x)*p.t, py=p.y+(p.ty-p.y)*p.t;
        ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.shadowColor=p.col; ctx.shadowBlur=8; ctx.fill(); ctx.shadowBlur=0;
        if(p.t>=1) packets.splice(i,1);
      }
      agents.forEach(a=>{
        ctx.beginPath(); ctx.arc(a.x,a.y,18,0,Math.PI*2);
        ctx.fillStyle=a.col; ctx.shadowColor=a.col; ctx.shadowBlur=14; ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle=a.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(a.label,a.x,a.y+32);
      });
      ctx.fillStyle="rgba(46,240,216,0.35)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("DIALOGUE · MULTI-AGENT COHERENCE · EMERGENT CONSENSUS · MESSAGE FLOW · AETHER",14,14);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function DialoguePage() {
  const [messages, setMessages]   = useState<Msg[]>(() => loadMessages());
  const [input,    setInput]      = useState("");
  const [loading,  setLoading]    = useState(false);
  const [error,    setError]      = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [scanning, setScanning]   = useState(false);
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);
  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { saveMessages(messages); }, [messages]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  /* ── Send a message to Claude ─── */
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { id: uid(), role: "user", content: trimmed, ts: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      // Only send non-context messages to Claude
      const payload = next
        .filter(m => !m.isContext)
        .map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(d.error ?? `HTTP ${res.status}`);
      }
      const d = await res.json() as { reply: string };
      setMessages(prev => [...prev, { id: uid(), role: "assistant", content: d.reply, ts: Date.now() }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [messages, loading]);

  /* ── Scan all AETHER data and inject as context ─── */
  const handleScan = useCallback(async () => {
    if (scanning) return;
    setScanning(true);
    setError(null);
    try {
      const res = await fetch("/api/dialogue/scan");
      if (!res.ok) throw new Error(`Scan failed: HTTP ${res.status}`);
      const d = await res.json() as { scanText: string; stats: ScanStats };
      setScanStats(d.stats);

      // Inject context block as a visible "context" message, then send to Claude
      const ctxMsg: Msg = {
        id: uid(), role: "user",
        content: d.scanText,
        ts: Date.now(),
        isContext: true,
      };
      const next = [...messages, ctxMsg];
      setMessages(next);
      setLoading(true);

      const payload = next
        .filter(m => !m.isContext)
        .concat({ id: uid(), role: "user", content: d.scanText, ts: Date.now() })
        .map(m => ({ role: m.role, content: m.content }));

      const apiRes = await fetch("/api/dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      if (!apiRes.ok) {
        const err = await apiRes.json().catch(() => ({})) as { error?: string };
        throw new Error(err.error ?? `HTTP ${apiRes.status}`);
      }
      const reply = await apiRes.json() as { reply: string };
      setMessages(prev => [...prev, { id: uid(), role: "assistant", content: reply.reply, ts: Date.now() }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Scan error");
    } finally {
      setScanning(false);
      setLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [scanning, messages]);

  /* ── Smart send: if message starts with "scan all data" prefix, auto-scan first ─── */
  const handleSend = useCallback(async (text: string) => {
    const lower = text.toLowerCase();
    if (lower.startsWith("scan all data")) {
      // Append the user's question after injecting the scan
      setInput("");
      await handleScan();
    } else {
      await sendMessage(text);
    }
  }, [handleScan, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const clearHistory = () => {
    if (window.confirm("Clear all dialogue history?")) {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
      setScanStats(null);
    }
  };

  const isEmpty = messages.length === 0 && !loading;

  return (
    <div style={{
      background: BG, minHeight: "100vh",
      display: "flex", flexDirection: "column",

      fontFamily: body, color: TEXT,
    }}>

      <div style={{ padding:"24px 24px 0", flexShrink:0 }}>
        <div style={{ display:"inline-block", border:"1px solid #2ef0d8", borderRadius:4, padding:"4px 14px", fontSize:10, letterSpacing:"0.28em", color:"#2ef0d8", fontFamily:"'DM Mono',monospace", marginBottom:16 }}>LIVE SIMULATION</div>
        <div style={{ background:"rgba(2,4,8,0.9)", border:"1px solid rgba(46,240,216,0.1)", borderLeft:"3px solid #2ef0d8", borderRadius:10, padding:20, marginBottom:16 }}>
          <h2 style={{ fontFamily:"'DM Mono',monospace", fontSize:18, color:"#e0f8ff", margin:"0 0 6px" }}>
            Dialogue · Multi-Agent Coherence · Emergent Consensus · Message Flow · AETHER
          </h2>
          <p style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:"rgba(46,240,216,0.35)", margin:"0 0 14px", lineHeight:1.65 }}>
            Two agent nodes exchanging live message packets across a channel — the live AETHER multi-agent dialogue simulation.
          </p>
          <DialogueSimCanvas />
        </div>
      </div>

      {/* ── Header ── */}
      <div style={{
        padding: "16px 22px 12px",
        background: `linear-gradient(180deg,#030b14 0%,${BG} 100%)`,
        borderBottom: `1px solid ${BLUE}18`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 9, color: BLUE, letterSpacing: 4, marginBottom: 4 }}>
            AETHER · STRATEGIC SYNTHESIS ENGINE · 100+ PAGES
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(18px,3vw,26px)",
            color: "#fff", margin: 0, letterSpacing: 2,
          }}>
            DIALOGUE <span style={{ color: TEAL }}>CONSOLE</span>
          </h1>
          <div style={{ fontFamily: body, fontSize: 13, color: DIM, marginTop: 3 }}>
            Strategic synthesis · Full AETHER knowledge · Live data scan
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {/* coherence indicator */}
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            background: `${GREEN}12`, border: `1px solid ${GREEN}30`,
            borderRadius: 20, padding: "4px 12px",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", background: GREEN,
              boxShadow: `0 0 6px ${GREEN}`,
            }} />
            <span style={{ fontFamily: mono, fontSize: 9, color: GREEN }}>COHERENT</span>
          </div>

          {scanStats && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: `${STONE}12`, border: `1px solid ${STONE}30`,
              borderRadius: 20, padding: "4px 12px",
            }}>
              <span style={{ fontFamily: mono, fontSize: 9, color: STONE }}>
                ◈ DATA LOADED · {scanStats.nodes}N · {scanStats.concepts}C · {scanStats.documents}D
              </span>
            </div>
          )}

          <button onClick={() => setSidebarOpen(o => !o)} style={{
            fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4,
            border: `1px solid ${DIM}40`, background: "transparent", color: DIM, cursor: "pointer",
          }}>{sidebarOpen ? "HIDE LENSES" : "SHOW LENSES"}</button>

          {messages.length > 0 && (
            <button onClick={clearHistory} style={{
              fontFamily: mono, fontSize: 9, padding: "5px 12px", borderRadius: 4,
              border: `1px solid ${ROSE}40`, background: "transparent", color: ROSE, cursor: "pointer",
            }}>CLEAR</button>
          )}
        </div>
      </div>

      {/* ── Stats / Scan bar ── */}
      <StatsBar stats={scanStats} scanning={scanning} onScan={handleScan} />

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <div style={{
            width: 280, flexShrink: 0,
            background: PANEL, borderRight: `1px solid ${BLUE}12`,
            overflowY: "auto", padding: "16px 12px",
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: DIM, letterSpacing: 3, marginBottom: 14 }}>
              STRATEGIC LENSES
            </div>

            {LENSES.map(lens => (
              <div key={lens.group} style={{ marginBottom: 20 }}>
                <div style={{
                  fontFamily: mono, fontSize: 9, color: lens.col,
                  letterSpacing: 2, marginBottom: 8,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: lens.col }} />
                  {lens.group}
                </div>
                {lens.prompts.map((p, i) => (
                  <LensPrompt key={i} text={p} col={lens.col} onSend={t => handleSend(t)} />
                ))}
              </div>
            ))}

            {/* Page count reference */}
            <div style={{
              marginTop: 8, padding: "12px", borderRadius: 8,
              background: `${STONE}07`, border: `1px solid ${STONE}18`,
              marginBottom: 12,
            }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: STONE, marginBottom: 8 }}>
                AETHER PAGE INDEX
              </div>
              {[
                { cat: "Physics & Math",     n: 15 },
                { cat: "Field Theory",       n: 11 },
                { cat: "Biology & Body",     n: 10 },
                { cat: "Earth & Substrate",  n: 9 },
                { cat: "Food & Nutrition",   n: 3 },
                { cat: "Phase & Coupling",   n: 6 },
                { cat: "Cosmology & History",n: 10 },
                { cat: "Creative & Cultural",n: 5 },
                { cat: "Education",          n: 4 },
                { cat: "Simulation Labs",    n: 8 },
                { cat: "Knowledge System",   n: 8 },
              ].map(c => (
                <div key={c.cat} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontFamily: body, fontSize: 11, color: MUTED }}>{c.cat}</span>
                  <span style={{ fontFamily: mono, fontSize: 9, color: TEAL }}>{c.n}</span>
                </div>
              ))}
              <div style={{ borderTop: `1px solid ${STONE}20`, marginTop: 6, paddingTop: 6,
                display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: mono, fontSize: 9, color: STONE }}>TOTAL</span>
                <span style={{ fontFamily: mono, fontSize: 9, color: GREEN }}>100+</span>
              </div>
            </div>

            {/* principles */}
            <div style={{
              marginTop: 0, padding: "12px", borderRadius: 8,
              background: `${BLUE}07`, border: `1px solid ${BLUE}18`,
            }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: BLUE, marginBottom: 8 }}>
                EXCHANGE PRINCIPLES
              </div>
              {[
                "Coherence over comfort",
                "Momentum over perfection",
                "Specificity over flattery",
                "Action over analysis",
                "Compounding over linear",
              ].map((p, i) => (
                <div key={i} style={{ fontFamily: body, fontSize: 12, color: MUTED, lineHeight: 1.7, display: "flex", gap: 6 }}>
                  <span style={{ color: BLUE, flexShrink: 0 }}>→</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Main chat area ── */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          {/* messages scroll area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px 8px" }}>

            {/* empty state */}
            {isEmpty && (
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", height: "100%", textAlign: "center",
                padding: "40px 20px",
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: "50%",
                  border: `1px solid ${BLUE}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: 20,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    border: `1px solid ${TEAL}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ fontFamily: serif, fontSize: 18, color: BLUE, letterSpacing: 1 }}>Æ</div>
                  </div>
                </div>

                <h2 style={{ fontFamily: serif, fontSize: 20, color: "#fff", margin: "0 0 10px", letterSpacing: 2 }}>
                  AETHER DIALOGUE
                </h2>
                <p style={{
                  fontFamily: body, fontSize: 15, color: DIM,
                  maxWidth: 520, lineHeight: 1.75, marginBottom: 10,
                }}>
                  A strategic synthesis space backed by the complete AETHER knowledge base —
                  100+ pages, live graph data, and full document context.
                  Ask anything. Or hit <span style={{ color: STONE, fontFamily: mono, fontSize: 12 }}>◈ SCAN ALL DATA</span> above
                  to inject live graph + concepts + documents before asking.
                </p>

                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 10, maxWidth: 620, width: "100%", marginTop: 18,
                }}>
                  {[
                    { q: "What has the most momentum right now?",          col: GREEN  },
                    { q: "What would you stop or restructure?",             col: ROSE   },
                    { q: "What synergy am I not seeing yet?",               col: VIOLET },
                    { q: "Give me 3 actions for this week.",                col: AMBER  },
                    { q: "Scan all data, then tell me what the graph shows.", col: STONE  },
                    { q: "Which 4 simulations are still to build and why?", col: TEAL   },
                  ].map((s, i) => (
                    <button key={i} onClick={() => handleSend(s.q)} style={{
                      textAlign: "left", cursor: "pointer",
                      background: `${s.col}09`, border: `1px solid ${s.col}30`,
                      borderRadius: 8, padding: "10px 13px",
                      fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.55,
                    }}>{s.q}</button>
                  ))}
                </div>
              </div>
            )}

            {/* messages */}
            {messages.map(m => <Bubble key={m.id} msg={m} />)}

            {/* thinking indicator */}
            {(loading || scanning) && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginBottom: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: "50%",
                    background: `${BLUE}20`, border: `1px solid ${BLUE}50`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: mono, fontSize: 9, color: BLUE,
                  }}>AE</div>
                  <span style={{ fontFamily: mono, fontSize: 9, color: DIM }}>
                    {scanning ? "SCANNING ALL AETHER DATA" : "AETHER DIALOGUE"}
                  </span>
                </div>
                <div style={{
                  background: `${BLUE}09`, border: `1px solid ${BLUE}28`,
                  borderRadius: "2px 12px 12px 12px", padding: "12px 16px",
                }}>
                  <ThinkingDots />
                  {scanning && (
                    <div style={{ fontFamily: mono, fontSize: 8, color: DIM, marginTop: 4 }}>
                      Fetching graph nodes · concepts · documents…
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* error */}
            {error && (
              <div style={{
                background: `${ROSE}10`, border: `1px solid ${ROSE}30`,
                borderRadius: 8, padding: "10px 14px", marginBottom: 16,
                fontFamily: mono, fontSize: 11, color: ROSE,
              }}>
                ERROR · {error}
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* ── Input bar ── */}
          <div style={{
            padding: "12px 22px 18px",
            borderTop: `1px solid ${BLUE}12`,
            background: `${PANEL}cc`,
            backdropFilter: "blur(10px)",
          }}>
            <div style={{
              display: "flex", gap: 10, alignItems: "flex-end",
              background: "#040e18", border: `1px solid ${BLUE}25`,
              borderRadius: 10, padding: "10px 14px",
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask anything — or type "scan all data, then…" to inject live graph data first'
                rows={2}
                disabled={loading || scanning}
                style={{
                  flex: 1, background: "transparent", border: "none", outline: "none",
                  fontFamily: body, fontSize: 15, color: TEXT, resize: "none",
                  lineHeight: 1.6, minHeight: 44,
                }}
              />
              <button
                onClick={() => handleSend(input)}
                disabled={!input.trim() || loading || scanning}
                style={{
                  flexShrink: 0, alignSelf: "flex-end",
                  background: (!input.trim() || loading || scanning) ? "transparent" : `${BLUE}20`,
                  border: `1px solid ${(!input.trim() || loading || scanning) ? DIM + "30" : BLUE + "60"}`,
                  borderRadius: 7, padding: "8px 16px", cursor: "pointer",
                  fontFamily: mono, fontSize: 10,
                  color: (!input.trim() || loading || scanning) ? DIM : BLUE,
                  transition: "all 0.15s",
                }}
              >SEND ↵</button>
            </div>
            <div style={{
              fontFamily: mono, fontSize: 9, color: DIM + "80",
              marginTop: 6, textAlign: "center",
            }}>
              ENTER to send · SHIFT+ENTER for newline · ◈ SCAN ALL DATA to inject live graph context
            </div>
          </div>
        </div>
      </div>

      <style>{`
        textarea::placeholder { color: ${DIM}; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DIM}40; border-radius: 2px; }
      `}</style>
    </div>
  );
}

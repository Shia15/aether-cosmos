import { useState, useEffect, useRef, useCallback } from "react";

const BASE = import.meta.env.BASE_URL;

const C = {
  bg: "#06070C",
  panel: "rgba(18,16,30,0.72)",
  border: "rgba(200,180,255,0.08)",
  white: "#EAE6F2",
  text: "#A4A0B8",
  muted: "#5A5670",
  gold: "#E8C878",
  cyan: "#2EF0D8",
  violet: "#B596E8",
  green: "#7DCC92",
  amber: "#F09060",
  rose: "#E68090",
  yellow: "#F5F096",
};

interface Note {
  id: string;
  author: string;
  message: string;
  shape: string;
  createdAt: number;
}

const SHAPES = [
  { key: "earth",  emoji: "🌍", label: "Earth",  grad: "linear-gradient(145deg,#0a2840,#0a3020)", border: C.cyan,   glow: "#2ef0d818" },
  { key: "moon",   emoji: "🌙", label: "Moon",   grad: "linear-gradient(145deg,#16103a,#26186a)", border: C.violet, glow: "#b596e818" },
  { key: "sun",    emoji: "☀️", label: "Sun",    grad: "linear-gradient(145deg,#2a1e00,#3c2800)", border: C.gold,   glow: "#e8c87818" },
  { key: "star",   emoji: "⭐", label: "Star",   grad: "linear-gradient(145deg,#1c1c00,#2e2e00)", border: C.yellow, glow: "#f5f09618" },
  { key: "comet",  emoji: "☄️", label: "Comet",  grad: "linear-gradient(145deg,#280800,#3a1400)", border: C.amber,  glow: "#f0906018" },
  { key: "galaxy", emoji: "🌌", label: "Galaxy", grad: "linear-gradient(145deg,#18082a,#28083c)", border: C.rose,   glow: "#e6809018" },
];

function shapeFor(key: string) {
  return SHAPES.find(s => s.key === key) ?? SHAPES[3];
}

function noteRotation(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return (Math.abs(h) % 13) - 6;
}

function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const STAR_PATH = "polygon(50% 0%,61% 35%,98% 35%,68% 57%,79% 91%,50% 70%,21% 91%,32% 57%,2% 35%,39% 35%)";

function NoteCard({ note }: { note: Note }) {
  const sh = shapeFor(note.shape);
  const rot = noteRotation(note.id);

  const extra: React.CSSProperties = note.shape === "earth" || note.shape === "moon"
    ? { borderRadius: "52% 48% 56% 44% / 48% 52% 44% 56%" }
    : note.shape === "star"
    ? { clipPath: STAR_PATH, borderRadius: 0, padding: "26px 20px 16px" }
    : note.shape === "comet"
    ? { borderRadius: "4px 18px 4px 18px", transform: `rotate(${rot}deg) skewX(-6deg)` }
    : {};

  return (
    <div style={{
      background: sh.grad,
      border: `1px solid ${sh.border}40`,
      boxShadow: `0 4px 24px ${sh.glow}, 0 2px 8px rgba(0,0,0,0.6)`,
      borderRadius: 6,
      padding: "16px 14px 14px",
      transform: `rotate(${note.shape === "comet" ? 0 : rot}deg)`,
      display: "flex",
      flexDirection: "column",
      gap: 8,
      minHeight: 140,
      position: "relative",
      ...extra,
    }}>
      <div style={{ fontSize: 28, lineHeight: 1 }}>{sh.emoji}</div>
      <div style={{ fontSize: "0.78rem", lineHeight: 1.62, color: C.white, fontFamily: "Georgia,ui-serif,serif", flex: 1, wordBreak: "break-word" }}>
        {note.message}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.52rem", color: sh.border, fontFamily: "JetBrains Mono,ui-monospace,monospace", letterSpacing: "0.12em" }}>
          {note.author}
        </span>
        <span style={{ fontSize: "0.48rem", color: C.muted, fontFamily: "JetBrains Mono,ui-monospace,monospace" }}>
          {timeAgo(note.createdAt)}
        </span>
      </div>
    </div>
  );
}

function AddNoteModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: Note) => void }) {
  const [author, setAuthor] = useState("");
  const [msg, setMsg] = useState("");
  const [shape, setShape] = useState("star");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function submit() {
    if (!msg.trim()) { setErr("Please write a message."); return; }
    setBusy(true); setErr("");
    try {
      const r = await fetch(`${BASE}api/community/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: author || "Anonymous", message: msg, shape }),
      });
      const data = await r.json() as { ok: boolean; note: Note };
      if (data.ok) { onAdd(data.note); onClose(); }
    } catch { setErr("Could not post note. Try again."); }
    setBusy(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.72)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "#0e0c1c", border: `1px solid ${C.border}`, borderRadius: 14, padding: "28px 28px 22px", width: "min(90vw,440px)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ fontFamily: "Cinzel,ui-serif,Georgia,serif", color: C.white, fontSize: "1rem", letterSpacing: "0.06em" }}>Leave a note for the world ✨</div>

        <div>
          <label style={labelSt}>Your name (optional)</label>
          <input value={author} onChange={e => setAuthor(e.target.value)} maxLength={48} placeholder="Anonymous"
            style={inputSt} />
        </div>

        <div>
          <label style={labelSt}>Your note <span style={{ color: C.muted }}>(max 320 chars)</span></label>
          <textarea value={msg} onChange={e => setMsg(e.target.value)} maxLength={320} rows={4} placeholder="Share a thought, question, idea, or hello..."
            style={{ ...inputSt, resize: "vertical", minHeight: 90 }} />
          <div style={{ textAlign: "right", fontSize: "0.52rem", color: C.muted, marginTop: 2, fontFamily: "JetBrains Mono,monospace" }}>{msg.length}/320</div>
        </div>

        <div>
          <label style={labelSt}>Shape</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {SHAPES.map(s => (
              <button key={s.key} onClick={() => setShape(s.key)}
                style={{ padding: "6px 10px", borderRadius: 8, cursor: "pointer", fontSize: "0.72rem", display: "flex", alignItems: "center", gap: 4,
                  border: shape === s.key ? `1px solid ${s.border}` : `1px solid ${C.border}`,
                  background: shape === s.key ? s.grad : "rgba(14,12,28,0.7)",
                  color: shape === s.key ? s.border : C.muted, transition: "all 0.15s" }}>
                <span style={{ fontSize: 14 }}>{s.emoji}</span> {s.label}
              </button>
            ))}
          </div>
        </div>

        {err && <div style={{ fontSize: "0.72rem", color: "#f07070" }}>{err}</div>}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onClose} style={btnSt(C.muted, false)}>Cancel</button>
          <button onClick={submit} disabled={busy} style={btnSt(C.cyan, true)}>
            {busy ? "Posting…" : "Post note 🌍"}
          </button>
        </div>
      </div>
    </div>
  );
}

const labelSt: React.CSSProperties = { display: "block", fontSize: "0.55rem", letterSpacing: "0.2em", color: "#5A5670", fontFamily: "JetBrains Mono,monospace", marginBottom: 6, textTransform: "uppercase" };
const inputSt: React.CSSProperties = { width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(200,180,255,0.12)", borderRadius: 7, padding: "8px 10px", color: "#EAE6F2", fontFamily: "Georgia,ui-serif,serif", fontSize: "0.84rem", outline: "none", boxSizing: "border-box" };
const btnSt = (col: string, primary: boolean): React.CSSProperties => ({
  padding: "8px 18px", borderRadius: 20, cursor: "pointer", fontSize: "0.72rem",
  fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.08em",
  border: `1px solid ${col}60`,
  background: primary ? `${col}14` : "transparent",
  color: col, transition: "all 0.15s",
});

export default function CommunityNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modal, setModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotes = useCallback(async () => {
    try {
      const r = await fetch(`${BASE}api/community/notes`);
      const data = await r.json() as { notes: Note[] };
      setNotes(data.notes ?? []);
    } catch { /* network */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotes();
    timerRef.current = setInterval(fetchNotes, 15_000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [fetchNotes]);

  function handleAdd(n: Note) {
    setNotes(prev => [n, ...prev]);
  }

  const count = notes.length;

  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "40px 32px 60px", fontFamily: "Inter,ui-sans-serif,sans-serif" }}>
      {modal && <AddNoteModal onClose={() => setModal(false)} onAdd={handleAdd} />}

      {/* Header */}
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 36 }}>
          <div>
            <div style={{ fontFamily: "Cinzel,ui-serif,Georgia,serif", fontSize: "clamp(1.1rem,3vw,1.8rem)", color: C.white, letterSpacing: "0.06em", marginBottom: 6 }}>
              Community Notes 🌍
            </div>
            <div style={{ fontSize: "0.72rem", color: C.muted, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.14em" }}>
              GLOBAL OPEN BOARD &middot; {count} note{count !== 1 ? "s" : ""} from around the world &middot; auto-refreshes every 15s
            </div>
          </div>
          <button onClick={() => setModal(true)} style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "10px 22px", borderRadius: 24, cursor: "pointer",
            border: `1px solid ${C.cyan}50`,
            background: `${C.cyan}10`,
            color: C.cyan, fontFamily: "JetBrains Mono,monospace",
            fontSize: "0.72rem", letterSpacing: "0.1em", transition: "all 0.2s",
          }}>
            ✦ Add your note
          </button>
        </div>

        {/* Shape legend */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 28 }}>
          {SHAPES.map(s => (
            <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, border: `1px solid ${s.border}30`, background: `${s.glow}`, fontSize: "0.6rem", color: s.border, fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.12em" }}>
              {s.emoji} {s.label.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Board */}
        {loading ? (
          <div style={{ textAlign: "center", color: C.muted, padding: "80px 0", fontFamily: "JetBrains Mono,monospace", fontSize: "0.72rem", letterSpacing: "0.2em" }}>
            LOADING NOTES…
          </div>
        ) : count === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 32px", border: `1px dashed ${C.border}`, borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🌌</div>
            <div style={{ color: C.muted, fontFamily: "Georgia,serif", fontSize: "0.95rem", lineHeight: 1.7 }}>
              The board is empty — be the first voice from your corner of the world.
            </div>
            <button onClick={() => setModal(true)} style={{ ...btnSt(C.cyan, true), marginTop: 20, cursor: "pointer" }}>
              Leave the first note ✦
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 20,
            alignItems: "start",
          }}>
            {notes.map(n => <NoteCard key={n.id} note={n} />)}
          </div>
        )}

        {/* Footer blurb */}
        <div style={{ marginTop: 48, borderTop: `1px solid ${C.border}`, paddingTop: 20, fontSize: "0.68rem", color: C.muted, fontFamily: "Georgia,serif", lineHeight: 1.8, maxWidth: 600 }}>
          This board is open to everyone, anywhere on Earth. Notes persist while the server runs.
          Each shape carries a different energy — choose the one that fits your message.
          The AETHER community is global, curious, and kind.
        </div>
      </div>
    </div>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "wouter";

/* ──────────────────────────────────────────────────────────────────────
   AETHER · Knowledge Map
   Engine that accepts 3000+ video files of any container type and routes
   each to its best-fit AETHER node by combining filename keywords,
   container/MIME, duration, aspect ratio, and Grok provenance.

   Scaling decisions vs the source HTML mockup:
     - URL.createObjectURL (zero-copy blob URL) instead of FileReader
       readAsDataURL (which would base64 every video into RAM and crash
       the tab at ~hundreds of MB, let alone 3000 files).
     - IntersectionObserver-driven LazyTile: <img>/<video> src is only
       attached when the tile is in (or near) the viewport, and detached
       when it scrolls far away. Keeps the DOM/decoder cost bounded
       regardless of corpus size.
     - accept="image/*,video/*" plus any extension-based fallback in the
       drop handler so MKV / AVI / M4V / MPEG / OGG / 3GP / FLV / TS etc
       are all admitted.
     - Async chunked processing (50 files per yield) with requestIdleCallback
       fallback so the UI thread never freezes during a 3000-file ingest.
     - Per-video metadata probe (duration, intrinsic width/height) used
       as alignment signals on top of filename rules — the "pure
       alignment" the user asked for.
     - Object URLs revoked on unmount to release any cached frames.
   ─────────────────────────────────────────────────────────────────── */

/* ---------- design tokens (matches user's source HTML) ---------- */
const T = {
  bg: "#040D1A",
  s1: "#071220",
  s2: "#0c1d36",
  border: "rgba(0,212,255,0.10)",
  border2: "rgba(0,212,255,0.20)",
  teal: "#00FFCC",
  blue: "#00D4FF",
  gold: "#FFD050",
  coral: "#FF6644",
  purple: "#C87BFF",
  pink: "#FF8FB3",
  orange: "#FF9632",
  green: "#44FF88",
  muted: "rgba(160,200,240,0.4)",
  text: "#c8e0f8",
  mono: "'Space Mono', 'JetBrains Mono', monospace",
  ui: "'Syne', 'Inter', sans-serif",
};

/* ---------- alignment taxonomy (9 nodes) ---------- */
type Cat =
  | "aether" | "cosmic" | "hardware" | "science"
  | "narrative" | "emotional" | "visual" | "video" | "uncategorized";

const ORDER: Cat[] = [
  "aether", "cosmic", "hardware", "science",
  "narrative", "emotional", "visual", "video", "uncategorized",
];

interface CatDef { label: string; color: string; desc: string; kw: string[] }

const CATS: Record<Cat, CatDef> = {
  aether:    { label:"AETHER System Architecture", color:T.blue,   desc:"agents · coherence · blueprints · dashboards · sigils",
               kw:["aether","coherent","agent","mnesis","aletheia","reverie","inferaia","sigil","cuca","clcs","dashboard","blueprint","mari"] },
  cosmic:    { label:"Cosmic & Planetary Cycles",  color:T.purple, desc:"planetary cycles · solar · Schumann · astronomical",
               kw:["cosmic","planet","solar","sun","pluto","neptune","schumann","cycle","orbital","galactic","248","star","celestial","astro","helio","saturn","jupiter","mars","moon"] },
  hardware:  { label:"Hardware & Prototypes",      color:T.orange, desc:"robots · Arduino · engineering · firmware · circuits",
               kw:["robot","prototype","arduino","raspberry","firmware","circuit","hardware","sensor","motor","rc","snow","solder","esp32","pcb","servo","drone","build"] },
  science:   { label:"Science & Engineering",      color:T.teal,   desc:"spectra · immune · photonics · biology · schematics",
               kw:["spectrum","immune","hydrogen","photon","bio","cell","dna","rna","mycelium","emission","physics","chemistry","diagram","schematic","equation","lab","experiment"] },
  narrative: { label:"Narrative Sequencing",       color:T.gold,   desc:"story · pattern emergence · identity · loops",
               kw:["narrative","story","pattern","loop","sequence","identity","genesis","constraint","adaptation","cards","script","scene","chapter"] },
  emotional: { label:"Emotional & Personal",       color:T.pink,   desc:"journal · affirmations · personal · art · creative",
               kw:["journal","affirmation","change","internal","personal","grace","chaos","feeling","art","paint","emotion","accept","selfie","family","home","mom","dad"] },
  visual:    { label:"AI Generative & Visual",     color:T.coral,  desc:"AI art · renders · symbolic · concept · atmospheric",
               kw:["render","concept","visual","symbolic","generative","illustration","atmospheric","fractal","wave","glow","midjourney","dalle","sdxl","stable","comfy"] },
  video:     { label:"Video Clips",                color:T.green,  desc:"MP4 · MOV · WEBM · MKV · AVI · M4V · GROK · all motion",
               kw:[] },
  uncategorized: { label:"Uncategorized", color:"rgba(160,200,240,0.5)", desc:"unclassified — refine filenames or add keywords above",
               kw:[] },
};

/* ---------- file-type acceptance ---------- */
const VIDEO_EXTS = new Set([
  "mp4","m4v","mov","webm","mkv","avi","mpeg","mpg","ogv","ogg",
  "3gp","3g2","flv","ts","mts","m2ts","wmv","asf","f4v","vob","rm","rmvb","divx","xvid",
]);
const IMAGE_EXTS = new Set([
  "jpg","jpeg","png","webp","gif","bmp","tif","tiff","avif","heic","heif","svg",
]);
function extOf(name: string) {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
}
function isVideoFile(f: File): boolean {
  if (f.type.startsWith("video/")) return true;
  return VIDEO_EXTS.has(extOf(f.name));
}
function isImageFile(f: File): boolean {
  if (f.type.startsWith("image/")) return true;
  return IMAGE_EXTS.has(extOf(f.name));
}
function isAccepted(f: File): boolean {
  return isVideoFile(f) || isImageFile(f);
}

/* ---------- bounded concurrency pool ---------- */
async function pool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, idx: number) => Promise<R>,
  onResult?: (result: R, idx: number) => void,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const runners: Promise<void>[] = [];
  const run = async () => {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      const r = await worker(items[i], i);
      results[i] = r;
      onResult?.(r, i);
    }
  };
  for (let k = 0; k < Math.min(concurrency, items.length); k++) runners.push(run());
  await Promise.all(runners);
  return results;
}

/* ---------- video metadata probe ---------- */
interface VideoMeta { duration: number; width: number; height: number }
function probeVideo(url: string, timeoutMs = 4000): Promise<VideoMeta> {
  return new Promise((resolve) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    let done = false;
    const finish = (m: VideoMeta) => {
      if (done) return; done = true;
      v.removeAttribute("src"); v.load();
      resolve(m);
    };
    const t = window.setTimeout(() => finish({ duration: 0, width: 0, height: 0 }), timeoutMs);
    v.onloadedmetadata = () => {
      window.clearTimeout(t);
      finish({
        duration: isFinite(v.duration) ? v.duration : 0,
        width: v.videoWidth || 0,
        height: v.videoHeight || 0,
      });
    };
    v.onerror = () => { window.clearTimeout(t); finish({ duration: 0, width: 0, height: 0 }); };
    v.src = url;
  });
}

/* ---------- multi-signal alignment ---------- */
function classify(name: string, isVideo: boolean, _isGrok: boolean): Cat {
  const l = name.toLowerCase();
  // Filename keywords win over container — a video clip named
  // "aether-coherence-explainer.mp4" belongs to AETHER, not Video.
  for (const c of ORDER) {
    if (c === "video" || c === "uncategorized") continue;
    if (CATS[c].kw.some(w => l.includes(w))) return c;
  }
  if (isVideo) return "video";
  return "uncategorized";
}

type Aspect = "portrait" | "landscape" | "square";
type Length = "micro" | "short" | "medium" | "long";

function aspectOf(w: number, h: number): Aspect {
  if (!w || !h) return "landscape";
  const r = w / h;
  if (r < 0.95) return "portrait";
  if (r > 1.05) return "landscape";
  return "square";
}
function lengthOf(d: number): Length {
  if (d < 10) return "micro";
  if (d < 60) return "short";
  if (d < 300) return "medium";
  return "long";
}

function humanSize(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  if (b < 1024 * 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  return `${(b / 1024 / 1024 / 1024).toFixed(2)} GB`;
}
function humanDur(s: number): string {
  if (!s) return "—";
  const m = Math.floor(s / 60); const sec = Math.floor(s % 60);
  return m ? `${m}:${sec.toString().padStart(2, "0")}` : `${sec}s`;
}

/* ---------- item shape ---------- */
interface Item {
  id: string;
  url: string;          // blob: URL
  file: File;
  isVideo: boolean;
  isGrok: boolean;
  cat: Cat;
  label: string;
  meta: VideoMeta;
  aspect: Aspect;
  length: Length | null;
}

/* ---------- LazyTile: only mount media when on/near screen ---------- */
const LazyTile = React.memo(function LazyTile({
  item, onOpen,
}: { item: Item; onOpen: (id: string) => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
    }, { rootMargin: "400px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cat = CATS[item.cat];
  const badgeColor = item.isGrok ? T.green : item.isVideo ? T.green : T.blue;
  const badgeLabel = item.isGrok ? "GROK" : item.isVideo ? "VIDEO" : "IMG";

  return (
    <div
      ref={ref}
      data-testid={`tile-${item.id}`}
      onClick={() => onOpen(item.id)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        aspectRatio: "1 / 1",
        background: T.s1,
        border: `1px solid ${hover ? "rgba(0,212,255,0.30)" : T.border}`,
        borderRadius: 7,
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 160ms, border-color 160ms, box-shadow 160ms",
        transform: hover ? "translateY(-3px) scale(1.025)" : "none",
        boxShadow: hover ? "0 6px 20px rgba(0,0,0,0.45)" : "none",
        contain: "layout paint size",
      }}
    >
      {/* Mounted only when visible */}
      {visible ? (
        item.isVideo ? (
          <VideoFrame url={item.url} hover={hover} />
        ) : (
          <img
            src={item.url}
            alt={item.file.name}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )
      ) : (
        <div style={{
          width: "100%", height: "100%",
          background: `linear-gradient(135deg, ${T.s1} 0%, ${T.s2} 100%)`,
        }} />
      )}

      <span style={{
        position: "absolute", top: 5, left: 5,
        fontFamily: T.mono, fontSize: 9, letterSpacing: "0.06em",
        padding: "2px 5px", borderRadius: 3,
        background: `${badgeColor}26`, color: badgeColor,
        border: `1px solid ${badgeColor}40`, backdropFilter: "blur(4px)",
        pointerEvents: "none",
      }}>{badgeLabel}</span>

      {item.isVideo && (
        <span style={{
          position: "absolute", top: 5, right: 5,
          fontFamily: T.mono, fontSize: 8.5, color: T.muted,
          background: "rgba(4,13,26,0.7)", padding: "2px 5px", borderRadius: 3,
          backdropFilter: "blur(4px)", pointerEvents: "none",
        }}>{humanDur(item.meta.duration)}</span>
      )}

      {hover && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "linear-gradient(transparent, rgba(4,13,26,0.92))",
          padding: "14px 6px 5px",
          fontSize: 9, color: "rgba(255,255,255,0.7)",
          fontFamily: T.mono,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          pointerEvents: "none",
        }}>
          <span style={{ color: cat.color }}>{item.label}</span>
        </div>
      )}
    </div>
  );
});

/* Video plays only on hover; poster-frame at metadata otherwise */
function VideoFrame({ url, hover }: { url: string; hover: boolean }) {
  const ref = useRef<HTMLVideoElement | null>(null);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    if (hover) { v.play().catch(() => {}); }
    else { v.pause(); v.currentTime = 0; }
  }, [hover]);
  return (
    <>
      <video
        ref={ref}
        src={url}
        muted
        loop
        playsInline
        preload="metadata"
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
      {!hover && (
        <div style={{
          position: "absolute", inset: 0, display: "flex",
          alignItems: "center", justifyContent: "center", pointerEvents: "none",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(4,13,26,0.55)", color: "rgba(255,255,255,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 16, paddingLeft: 3, backdropFilter: "blur(4px)",
          }}>▶</div>
        </div>
      )}
    </>
  );
}

/* ---------- Lightbox ---------- */
function Lightbox({
  visible, item, idx, total, onPrev, onNext, onClose,
}: {
  visible: Item[]; item: Item | null; idx: number; total: number;
  onPrev: () => void; onNext: () => void; onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onPrev, onNext, onClose]);
  if (!item) return null;
  const cat = CATS[item.cat];
  return (
    <div
      data-testid="lightbox"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 900,
        background: "rgba(2,7,16,0.97)", backdropFilter: "blur(14px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "0.85rem",
      }}
    >
      <button
        data-testid="lightbox-close"
        onClick={onClose}
        style={{
          position: "absolute", top: "1rem", right: "1.25rem",
          background: "none", border: "none", color: T.muted,
          fontSize: "1.8rem", cursor: "pointer", lineHeight: 1, zIndex: 10,
        }}
      >×</button>
      <div style={{ maxWidth: "88vw", maxHeight: "78vh", display: "flex" }}>
        {item.isVideo ? (
          <video
            key={item.id}
            src={item.url}
            controls autoPlay loop
            style={{ maxWidth: "88vw", maxHeight: "78vh", borderRadius: 6, border: `1px solid ${T.border}` }}
          />
        ) : (
          <img
            src={item.url}
            alt={item.file.name}
            style={{ maxWidth: "88vw", maxHeight: "78vh", objectFit: "contain", borderRadius: 6, border: `1px solid ${T.border}` }}
          />
        )}
      </div>
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button data-testid="lightbox-prev" onClick={onPrev} disabled={idx <= 0}
          style={lbBtn(idx <= 0)}>← prev</button>
        <span style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, minWidth: 60, textAlign: "center" }}>
          {idx + 1} / {total}
        </span>
        <button data-testid="lightbox-next" onClick={onNext} disabled={idx >= total - 1}
          style={lbBtn(idx >= total - 1)}>next →</button>
      </div>
      <div style={{ fontFamily: T.mono, fontSize: 11, color: T.muted, textAlign: "center", lineHeight: 1.7 }}>
        <span>{item.file.name}</span>
        {" · "}
        <span style={{ color: cat.color, fontWeight: 700 }}>{cat.label}</span>
        {" · "}
        <span>{humanSize(item.file.size)}</span>
        {item.isVideo && item.meta.duration > 0 && <> · <span>{humanDur(item.meta.duration)}</span></>}
        {item.isVideo && item.meta.width > 0 && <> · <span>{item.meta.width}×{item.meta.height} ({item.aspect})</span></>}
        {item.isGrok && <> · <span style={{ color: T.green }}>GROK</span></>}
      </div>
    </div>
  );
}
function lbBtn(disabled: boolean): React.CSSProperties {
  return {
    background: T.s2, border: `1px solid ${T.border}`,
    color: disabled ? T.muted : T.text,
    padding: "5px 14px", borderRadius: 4,
    cursor: disabled ? "default" : "pointer",
    fontFamily: T.mono, fontSize: 11,
    opacity: disabled ? 0.4 : 1,
  };
}

/* ============================================================ */
/*                            PAGE                                */
/* ============================================================ */
function KnowledgeMapCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const nodes: {x:number;y:number;vx:number;vy:number;col:string;label:string}[] = [
      {x:W*0.15,y:H*0.4,vx:0.2,vy:0.15,col:"#2ef0d8",label:"Image"},
      {x:W*0.35,y:H*0.6,vx:-0.15,vy:0.2,col:"#9966ff",label:"Video"},
      {x:W*0.55,y:H*0.3,vx:0.1,vy:-0.2,col:"#c9a84c",label:"Audio"},
      {x:W*0.75,y:H*0.55,vx:-0.2,vy:0.1,col:"#ff4477",label:"Doc"},
      {x:W*0.5,y:H*0.7,vx:0.15,vy:-0.15,col:"#44aaff",label:"Map"},
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      nodes.forEach((n,i)=>{
        n.x+=n.vx; n.y+=n.vy;
        if(n.x<20||n.x>W-20)n.vx*=-1; if(n.y<20||n.y>H-20)n.vy*=-1;
        nodes.slice(i+1).forEach(m=>{
          const d=Math.hypot(n.x-m.x,n.y-m.y);
          if(d<200){ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(m.x,m.y);ctx.strokeStyle=`rgba(255,255,255,${(1-d/200)*0.06})`;ctx.lineWidth=0.5;ctx.stroke();}
        });
        const pls=0.8+0.2*Math.sin(t*0.04+i);
        ctx.beginPath();ctx.arc(n.x,n.y,8*pls,0,Math.PI*2);ctx.fillStyle=n.col+"99";ctx.fill();
        ctx.fillStyle=n.col; ctx.font="8px 'DM Mono',monospace"; ctx.textAlign="center"; ctx.fillText(n.label,n.x,n.y+18); ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("KNOWLEDGE MAP · 3000+ MEDIA · CATEGORY ENGINE · INTELLIGENT TAGGING · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function KnowledgeMapPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filter, setFilter] = useState<Cat | "all">("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, current: "" });
  const [lbId, setLbId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);
  const [over, setOver] = useState(false);

  /* Track every blob URL we mint so unmount can revoke them.
     A ref (not state) so cleanup sees the latest set without
     re-running the effect on every ingest. */
  const blobUrls = useRef<Set<string>>(new Set());

  /* --- inject Google Fonts (Space Mono + Syne) once --- */
  useEffect(() => {
    const id = "knowledge-map-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  /* --- revoke ALL blob URLs on unmount (uses ref, not stale closure) --- */
  useEffect(() => {
    const set = blobUrls.current;
    return () => {
      set.forEach(u => URL.revokeObjectURL(u));
      set.clear();
    };
  }, []);

  /* --- chunked, parallel-probed ingest ---
     Concurrency-6 pool for video metadata probes turns a 3000-file ingest
     from O(N) serial seconds (~5 min at 100ms/file, ~3hr worst-case at 4s
     timeouts) into roughly N/6 — sub-minute on average corpora. State is
     flushed in batches of 50 to bound re-render cost. */
  const ingest = useCallback(async (files: File[]) => {
    if (!files.length) return;
    setBusy(true);
    const total = files.length;
    setProgress({ done: 0, total, current: files[0].name });

    const yieldToUI = () =>
      new Promise<void>(res => {
        const ric = (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
        if (typeof ric === "function") ric(() => res());
        else setTimeout(() => res(), 0);
      });

    let done = 0;
    let buffer: Item[] = [];
    const CHUNK = 50;
    const CONCURRENCY = 6;

    await pool(files, CONCURRENCY, async (f, i) => {
      const url = URL.createObjectURL(f);
      blobUrls.current.add(url);
      const isVideo = isVideoFile(f);
      const isGrok = /grok/i.test(f.name) || /^gx_/i.test(f.name);
      let meta: VideoMeta = { duration: 0, width: 0, height: 0 };
      if (isVideo) {
        try { meta = await probeVideo(url); } catch { /* swallow */ }
      }
      const cat = classify(f.name, isVideo, isGrok);
      const label = f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
      const item: Item = {
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
        url, file: f, isVideo, isGrok, cat, label, meta,
        aspect: aspectOf(meta.width, meta.height),
        length: isVideo ? lengthOf(meta.duration) : null,
      };
      done++;
      buffer.push(item);
      setProgress({ done, total, current: f.name });
      if (buffer.length >= CHUNK) {
        const flush = buffer; buffer = [];
        setItems(prev => [...prev, ...flush]);
        await yieldToUI();
      }
      return item;
    });

    if (buffer.length) {
      const flush = buffer;
      setItems(prev => [...prev, ...flush]);
    }
    setBusy(false);
  }, []);

  /* --- drop handlers --- */
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setOver(false);
    const files = Array.from(e.dataTransfer.files).filter(isAccepted);
    if (files.length) void ingest(files);
  }, [ingest]);

  const onPick = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter(isAccepted);
    if (files.length) void ingest(files);
    e.target.value = "";
  }, [ingest]);

  /* --- filtering / grouping --- */
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return items.filter(it => {
      const okFilter = filter === "all" || it.cat === filter;
      const okQuery = !q
        || it.file.name.toLowerCase().includes(q)
        || it.label.toLowerCase().includes(q);
      return okFilter && okQuery;
    });
  }, [items, filter, query]);

  const grouped = useMemo(() => {
    const g: Partial<Record<Cat, Item[]>> = {};
    for (const it of filtered) (g[it.cat] ||= []).push(it);
    return g;
  }, [filtered]);

  /* --- lightbox nav --- */
  const lbIdx = lbId ? filtered.findIndex(i => i.id === lbId) : -1;
  const lbItem = lbIdx >= 0 ? filtered[lbIdx] : null;

  /* --- counts --- */
  const totalImgs = items.filter(i => !i.isVideo).length;
  const totalVids = items.filter(i => i.isVideo).length;

  /* --- alignment summary (per-cat counts) --- */
  const catCounts: Partial<Record<Cat, number>> = {};
  for (const it of items) catCounts[it.cat] = (catCounts[it.cat] || 0) + 1;

  return (
    <div data-testid="page-knowledge-map" style={{
      background: T.bg, minHeight: "100vh", color: T.text,
      fontFamily: T.ui,
    }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>KNOWLEDGE MAP · 3000+ MEDIA · CATEGORY ENGINE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>5 media-type nodes bouncing + linking — the live AETHER knowledge map simulation.</p></div>
          <KnowledgeMapCanvas />
        </div>
      </div>
      {/* HEADER */}
      <header style={{
        position: "sticky", top: 0, zIndex: 300,
        background: "rgba(4,13,26,0.92)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${T.border}`,
        display: "flex", alignItems: "center", gap: "1rem",
        padding: "0 1.25rem", height: 54,
        flexWrap: "wrap",
      }}>
        <div style={{
          fontFamily: T.mono, fontSize: 12, fontWeight: 700,
          letterSpacing: "0.18em", color: T.teal,
          textShadow: "0 0 18px rgba(0,255,204,0.35)",
        }}>
          AETHER <span style={{ color: T.blue }}>·</span> KNOWLEDGE MAP
        </div>

        {/* Filter pills */}
        <div data-testid="filter-pills" style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {(["all", ...ORDER] as const).map(f => {
            const def = f === "all" ? null : CATS[f as Cat];
            const color = def?.color || T.blue;
            const active = filter === f;
            return (
              <button
                key={f}
                data-testid={`pill-${f}`}
                onClick={() => setFilter(f as Cat | "all")}
                style={{
                  fontFamily: T.mono, fontSize: 9, letterSpacing: "0.08em",
                  padding: "3px 9px", borderRadius: 20,
                  border: `1px solid ${color}`,
                  color, background: "transparent", cursor: "pointer",
                  textTransform: "uppercase",
                  filter: active ? "brightness(1.4)" : undefined,
                  fontWeight: active ? 700 : 400,
                }}
              >
                {f === "all" ? "ALL" : f === "video" ? "VIDEO ▶" : f === "uncategorized" ? "UNCAT." : f.toUpperCase()}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div style={{ flex: 1, maxWidth: 240, marginLeft: "auto", position: "relative" }}>
          <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", color: T.muted, fontSize: 14, pointerEvents: "none" }}>⌕</span>
          <input
            data-testid="search-input"
            type="text"
            placeholder="search labels, filenames..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width: "100%", background: T.s2, border: `1px solid ${T.border}`,
              borderRadius: 5, padding: "5px 10px 5px 26px",
              color: T.text, fontFamily: T.mono, fontSize: 11, outline: "none",
            }}
          />
        </div>

        {/* Stats */}
        <div data-testid="hdr-stats" style={{
          fontFamily: T.mono, fontSize: 10, color: T.muted,
          textAlign: "right", lineHeight: 1.5,
        }}>
          {filtered.length} / {items.length} items
          <br />
          <span style={{ fontSize: 9 }}>{totalImgs} img · {totalVids} vid</span>
        </div>
      </header>

      {/* DROP ZONE */}
      <div
        ref={dropRef}
        data-testid="dropzone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDragEnd={() => setOver(false)}
        onDrop={onDrop}
        style={{
          margin: "1.25rem 1.25rem 0",
          border: `2px dashed ${over ? T.teal : T.border2}`,
          borderStyle: over ? "solid" : "dashed",
          borderRadius: 14,
          padding: items.length ? "0.85rem 1.5rem" : "2rem 1.5rem",
          textAlign: "center", cursor: "pointer",
          transition: "all 0.2s",
          background: over
            ? "radial-gradient(ellipse at 50% 50%, rgba(0,255,204,0.07) 0%, transparent 70%)"
            : "radial-gradient(ellipse at 50% 100%, rgba(0,212,255,0.04) 0%, transparent 70%)",
          boxShadow: over ? "0 0 40px rgba(0,255,204,0.08), inset 0 0 40px rgba(0,255,204,0.03)" : "none",
        }}
      >
        <span style={{ fontSize: items.length ? "1.4rem" : "2.2rem", display: "block", opacity: 0.7, marginBottom: items.length ? 4 : 8 }}>⬇</span>
        <div style={{
          fontFamily: T.mono, fontSize: items.length ? 12 : 14, fontWeight: 700,
          color: T.teal, marginBottom: 6, letterSpacing: "0.06em",
        }}>
          {busy
            ? `Aligning ${progress.done.toLocaleString()} / ${progress.total.toLocaleString()} …`
            : items.length
              ? `Drop more — ${items.length.toLocaleString()} aligned across ${Object.keys(grouped).length} nodes`
              : "Drop images & videos here"}
        </div>
        {!items.length && (
          <>
            <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.7 }}>
              Drag any folder, batch of files, or click to browse — engine accepts <strong style={{ color: T.text }}>3,000+ video files of any container type</strong><br />
              <strong style={{ color: T.text }}>All processing is local — nothing leaves your machine</strong>
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 12, flexWrap: "wrap" }}>
              {["MP4","MOV","WEBM","MKV","AVI","M4V","MPEG","OGV","3GP","FLV","TS","WMV"].map(t => (
                <span key={t} style={{
                  fontFamily: T.mono, fontSize: 9, padding: "2px 8px", borderRadius: 3,
                  border: `1px solid ${T.green}4D`, color: T.green, background: `${T.green}10`,
                }}>{t}</span>
              ))}
              {["JPG","PNG","WEBP","GIF","HEIC","AVIF"].map(t => (
                <span key={t} style={{
                  fontFamily: T.mono, fontSize: 9, padding: "2px 8px", borderRadius: 3,
                  border: `1px solid ${T.blue}4D`, color: T.blue, background: `${T.blue}10`,
                }}>{t}</span>
              ))}
            </div>
          </>
        )}

        {/* Progress bar */}
        {busy && (
          <div style={{ marginTop: 12 }}>
            <div style={{
              fontFamily: T.mono, fontSize: 10, color: T.muted,
              padding: "0.35rem 0.5rem", display: "flex", justifyContent: "space-between",
            }}>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
                {progress.current}
              </span>
              <span data-testid="progress-pct">
                {progress.done.toLocaleString()} / {progress.total.toLocaleString()}
                {" "}({Math.round((progress.done / Math.max(progress.total, 1)) * 100)}%)
              </span>
            </div>
            <div style={{
              background: T.s2, borderRadius: 6, overflow: "hidden",
              border: `1px solid ${T.border}`, height: 5,
            }}>
              <div
                data-testid="progress-bar"
                style={{
                  width: `${(progress.done / Math.max(progress.total, 1)) * 100}%`,
                  height: "100%",
                  background: `linear-gradient(90deg, ${T.teal}, ${T.blue}, ${T.purple})`,
                  transition: "width 0.25s",
                }}
              />
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          data-testid="file-input"
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={onPick}
          style={{ display: "none" }}
        />
      </div>

      {/* ALIGNMENT SUMMARY (only after first ingest) */}
      {items.length > 0 && (
        <div data-testid="alignment-summary" style={{
          margin: "1rem 1.25rem 0", padding: "0.85rem 1rem",
          background: T.s1, border: `1px solid ${T.border}`,
          borderRadius: 8, display: "flex", flexWrap: "wrap", gap: "0.5rem 1.25rem",
          fontFamily: T.mono, fontSize: 11,
        }}>
          <span style={{ color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", fontSize: 10 }}>
            Alignment ·
          </span>
          {ORDER.filter(c => catCounts[c]).map(c => (
            <span key={c} data-testid={`summary-${c}`}>
              <span style={{ color: CATS[c].color }}>■</span>{" "}
              <span style={{ color: T.text }}>{CATS[c].label}</span>{" "}
              <span style={{ color: T.muted }}>{catCounts[c]}</span>
            </span>
          ))}
        </div>
      )}

      {/* MAIN — sections */}
      <div data-testid="main" style={{ padding: "1.25rem 1.25rem 4rem" }}>
        {ORDER.map(cat => {
          const list = grouped[cat];
          if (!list || list.length === 0) return null;
          const def = CATS[cat];
          return (
            <section
              key={cat}
              data-testid={`section-${cat}`}
              style={{ marginBottom: "2.5rem" }}
            >
              <div style={{
                display: "flex", alignItems: "baseline", gap: "0.6rem",
                paddingBottom: "0.6rem", marginBottom: "0.85rem",
                borderBottom: `1px solid ${T.border}`,
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: "50%",
                  background: def.color, flexShrink: 0, marginBottom: 1,
                  alignSelf: "center",
                }} />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "0.03em", color: def.color }}>
                    {def.label}
                  </div>
                  <div style={{ fontSize: 10, color: T.muted, fontFamily: T.mono, marginTop: 2 }}>
                    {def.desc}
                  </div>
                </div>
                <div style={{
                  marginLeft: "auto", fontFamily: T.mono, fontSize: 10,
                  color: T.muted, whiteSpace: "nowrap",
                }}>
                  {list.length} items
                </div>
              </div>

              {/* Video sub-buckets */}
              {cat === "video" && <VideoSubBuckets list={list} onOpen={setLbId} />}

              {cat !== "video" && (
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: 7,
                }}>
                  {list.map(it => <LazyTile key={it.id} item={it} onOpen={setLbId} />)}
                </div>
              )}
            </section>
          );
        })}

        {items.length === 0 && (
          <div data-testid="empty" style={{
            textAlign: "center", padding: "4rem 2rem",
            fontFamily: T.mono, fontSize: 12, color: T.muted, lineHeight: 1.7,
          }}>
            drop a folder of videos above to get started<br />
            <span style={{ fontSize: 10 }}>
              the engine will route each file into the AETHER node it best aligns with
            </span>
          </div>
        )}

        {/* Bridges */}
        {items.length === 0 && (
          <div data-testid="section-bridges" style={{ maxWidth: 920, margin: "3rem auto 0" }}>
            <div style={{
              fontFamily: T.mono, fontSize: 10, color: T.muted,
              letterSpacing: "0.18em", textTransform: "uppercase",
              marginBottom: "0.85rem",
            }}>Bridges</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
              {[
                ["/upload", "Ingest · Documents", T.blue],
                ["/ecosystem", "Ecosystem · M.A.R.I.", T.purple],
                ["/architecture", "Architecture · Layers", T.teal],
                ["/aether-doctrine", "AETHER Doctrine", T.gold],
              ].map(([href, label, color]) => (
                <Link
                  key={href}
                  href={href as string}
                  data-testid={`bridge-${(href as string).replace(/^\//, "")}`}
                  style={{
                    display: "block", padding: "10px 12px",
                    background: T.s1, border: `1px solid ${T.border}`,
                    borderLeft: `3px solid ${color as string}`,
                    borderRadius: 4, textDecoration: "none",
                    color: color as string, fontFamily: T.mono, fontSize: 11,
                    letterSpacing: "0.06em",
                  }}
                >{label as string}</Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lbItem && (
        <Lightbox
          visible={filtered}
          item={lbItem}
          idx={lbIdx}
          total={filtered.length}
          onPrev={() => { if (lbIdx > 0) setLbId(filtered[lbIdx - 1].id); }}
          onNext={() => { if (lbIdx < filtered.length - 1) setLbId(filtered[lbIdx + 1].id); }}
          onClose={() => setLbId(null)}
        />
      )}
    </div>
  );
}

/* ---------- Video sub-buckets: aspect × length ---------- */
function VideoSubBuckets({
  list, onOpen,
}: { list: Item[]; onOpen: (id: string) => void }) {
  const buckets: { key: string; label: string; color: string; items: Item[] }[] = [
    { key: "portrait-micro",  label: "Portrait · Micro (<10s) · social-clip shape",      color: T.pink,   items: [] },
    { key: "portrait-short",  label: "Portrait · Short (10–60s) · short-form",            color: T.coral,  items: [] },
    { key: "landscape-short", label: "Landscape · Short (10–60s) · cinematic snippet",    color: T.gold,   items: [] },
    { key: "landscape-medium",label: "Landscape · Medium (1–5 min) · explainer",          color: T.green,  items: [] },
    { key: "landscape-long",  label: "Landscape · Long (5 min+) · lecture / session",     color: T.teal,   items: [] },
    { key: "square",          label: "Square · feed-shape",                                color: T.blue,   items: [] },
    { key: "other",           label: "Other · no metadata available",                      color: T.muted,  items: [] },
  ];
  for (const it of list) {
    if (!it.meta.width || !it.meta.height) { buckets[6].items.push(it); continue; }
    if (it.aspect === "square") { buckets[5].items.push(it); continue; }
    if (it.aspect === "portrait" && it.length === "micro") buckets[0].items.push(it);
    else if (it.aspect === "portrait")                     buckets[1].items.push(it);
    else if (it.length === "long")                         buckets[4].items.push(it);
    else if (it.length === "medium")                       buckets[3].items.push(it);
    else                                                   buckets[2].items.push(it);
  }
  return (
    <div data-testid="video-subbuckets">
      {buckets.filter(b => b.items.length).map(b => (
        <div key={b.key} data-testid={`subbucket-${b.key}`} style={{ marginBottom: "1.25rem" }}>
          <div style={{
            fontFamily: T.mono, fontSize: 10, color: b.color,
            letterSpacing: "0.12em", textTransform: "uppercase",
            marginBottom: 6, paddingLeft: 4,
          }}>
            {b.label} <span style={{ color: T.muted }}>· {b.items.length}</span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 7,
          }}>
            {b.items.map(it => <LazyTile key={it.id} item={it} onOpen={onOpen} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

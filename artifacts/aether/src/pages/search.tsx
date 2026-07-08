import { useState, useMemo, useCallback } from "react";
import { Link } from "wouter";
import { useSearchConcepts, SearchConceptsType } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Hexagon, Fingerprint, Layers } from "lucide-react";

import { useEffect, useRef } from "react";

function SearchHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const nodes: {x:number;y:number;r:number;phase:number}[]=[];
    for(let i=0;i<20;i++) nodes.push({x:Math.random()*W,y:Math.random()*H,r:3+Math.random()*5,phase:Math.random()*Math.PI*2});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      nodes.forEach((n,i)=>{
        if(i>0 && Math.random()>0.98){
          const p=nodes[Math.floor(Math.random()*nodes.length)];
          ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle="rgba(46,240,216,0.08)";ctx.lineWidth=0.4;ctx.stroke();
        }
        const pls=0.85+0.15*Math.sin(t*0.04+n.phase);
        ctx.beginPath();ctx.arc(n.x,n.y,n.r*pls,0,Math.PI*2);ctx.fillStyle="rgba(46,240,216,0.1)";ctx.fill();ctx.strokeStyle="rgba(46,240,216,0.4)";ctx.lineWidth=0.5;ctx.stroke();
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SEARCH · SEMANTIC INDEX · KNOWLEDGE RETRIEVAL · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

const INTAKE_KEY = "aether_intake_v1";
const LAYER_NAMES: Record<string, string> = { N: "Note", C: "Concept", S: "System", F: "Framework", P: "Project", D: "Diagram" };

type IngestNode = {
  title?: string;
  filename?: string;
  layer?: string;
  shells?: string[];
  coherence?: { shell: string; dim: string; note: string }[];
  hasAI?: boolean;
  timestamp?: number;
};

function asStr(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function readIntakeNodes(): IngestNode[] {
  try {
    const raw = localStorage.getItem(INTAKE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((r): IngestNode => {
      const o = r && typeof r === "object" ? (r as Record<string, unknown>) : {};
      const shells = Array.isArray(o.shells)
        ? o.shells.filter((s): s is string => typeof s === "string")
        : [];
      const coherence = Array.isArray(o.coherence)
        ? o.coherence
            .filter((c): c is Record<string, unknown> => !!c && typeof c === "object")
            .map((c) => ({ shell: asStr(c.shell), dim: asStr(c.dim), note: asStr(c.note) }))
        : [];
      return {
        title: asStr(o.title),
        filename: asStr(o.filename),
        layer: asStr(o.layer) || "N",
        shells,
        coherence,
        hasAI: o.hasAI === true,
        timestamp: typeof o.timestamp === "number" && isFinite(o.timestamp) ? o.timestamp : 0,
      };
    });
  } catch {
    return [];
  }
}

function startOfTodayMs(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function OverviewStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ border: "1px solid rgba(46,240,216,0.2)", borderRadius: 6, padding: "6px 12px", background: "rgba(46,240,216,0.04)", minWidth: 78 }}>
      <div style={{ fontSize: 18, color: "#2ef0d8", fontFamily: "'DM Mono',monospace", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 8, letterSpacing: "0.18em", color: "rgba(46,240,216,0.55)", fontFamily: "'DM Mono',monospace", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function DailyIngestionOverview() {
  const [nodes, setNodes] = useState<IngestNode[]>(() => readIntakeNodes());
  const [speaking, setSpeaking] = useState(false);
  const ttsSupported = typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    const refresh = () => setNodes(readIntakeNodes());
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      if (ttsSupported) window.speechSynthesis.cancel();
    };
  }, [ttsSupported]);

  const dateLabel = new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const stats = useMemo(() => {
    const total = nodes.length;
    const today0 = startOfTodayMs();
    const todayCount = nodes.filter((n) => typeof n.timestamp === "number" && n.timestamp >= today0).length;
    const layerCounts: Record<string, number> = {};
    const shellSet = new Set<string>();
    let analyzed = 0;
    nodes.forEach((n) => {
      const l = n.layer || "N";
      layerCounts[l] = (layerCounts[l] || 0) + 1;
      (n.shells || []).forEach((s) => { if (s) shellSet.add(s); });
      (n.coherence || []).forEach((c) => { if (c && c.shell) shellSet.add(c.shell); });
      if (n.hasAI) analyzed += 1;
    });
    const sorted = [...nodes].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    const recent = sorted.slice(0, 5).map((n) => (n.title || n.filename || "Untitled").trim());
    const topLayers = Object.entries(layerCounts).sort((a, b) => b[1] - a[1]);
    return { total, todayCount, topLayers, shells: Array.from(shellSet), analyzed, recent };
  }, [nodes]);

  const overviewText = useMemo(() => {
    if (stats.total === 0) {
      return `Daily ingestion overview for ${dateLabel}. The AETHER field is currently empty - no documents have been ingested yet. Open AETHER OS Batch Intake to drop pitch decks, papers, or charts. Once ingested, this overview will summarize the learned information each day, and you can press the dot to hear it read aloud.`;
    }
    const layerPhrase = stats.topLayers
      .map(([code, count]) => `${count} ${LAYER_NAMES[code] || code}${count === 1 ? "" : "s"}`)
      .join(", ");
    const shellPhrase = stats.shells.length
      ? `spanning ${stats.shells.length} coherence ${stats.shells.length === 1 ? "shell" : "shells"} (${stats.shells.slice(0, 6).join(", ")})`
      : "with no coherence shells assigned yet";
    const todayPhrase = stats.todayCount > 0
      ? `Today, ${stats.todayCount} new ${stats.todayCount === 1 ? "node was" : "nodes were"} ingested.`
      : "No new nodes were ingested today.";
    const recentPhrase = stats.recent.length ? ` The most recent entries are: ${stats.recent.join("; ")}.` : "";
    const aiPhrase = stats.analyzed > 0
      ? ` ${stats.analyzed} ${stats.analyzed === 1 ? "node has" : "nodes have"} completed AI coherence analysis.`
      : "";
    return `Daily ingestion overview for ${dateLabel}. The AETHER field now holds ${stats.total} ingested ${stats.total === 1 ? "node" : "nodes"}: ${layerPhrase}, ${shellPhrase}. ${todayPhrase}${recentPhrase}${aiPhrase}`;
  }, [stats, dateLabel]);

  const toggleSpeak = useCallback(() => {
    if (!ttsSupported) return;
    const synth = window.speechSynthesis;
    if (speaking) {
      synth.cancel();
      setSpeaking(false);
      return;
    }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(overviewText);
    u.rate = 0.98;
    u.pitch = 1;
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(u);
  }, [overviewText, speaking, ttsSupported]);

  return (
    <div style={{ flexShrink: 0 }}>
      <div
        style={{
          position: "relative",
          background: "linear-gradient(135deg, rgba(2,4,8,0.92), rgba(4,12,16,0.92))",
          border: "1px solid rgba(46,240,216,0.3)",
          borderRadius: 10,
          padding: "16px 18px",
          marginBottom: 20,
          boxShadow: "inset 0 0 40px rgba(46,240,216,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12 }}>📌</span>
            <span style={{ fontSize: 10, letterSpacing: "0.25em", color: "#2ef0d8", fontFamily: "'DM Mono',monospace" }}>PINNED · DAILY INGESTION OVERVIEW</span>
          </div>
          <span style={{ fontSize: 9, letterSpacing: "0.15em", color: "rgba(46,240,216,0.5)", fontFamily: "'DM Mono',monospace" }}>{dateLabel.toUpperCase()}</span>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <OverviewStat label="INGESTED" value={String(stats.total)} />
          <OverviewStat label="TODAY" value={String(stats.todayCount)} />
          <OverviewStat label="SHELLS" value={String(stats.shells.length)} />
          <OverviewStat label="AI-ANALYZED" value={String(stats.analyzed)} />
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
          <button
            type="button"
            onClick={toggleSpeak}
            disabled={!ttsSupported}
            aria-label={speaking ? "Stop readout" : "Hear the readout"}
            title={ttsSupported ? (speaking ? "Stop readout" : "Hear the readout") : "Text-to-speech is not supported in this browser"}
            style={{
              position: "relative",
              flexShrink: 0,
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: `1px solid ${speaking ? "#ff7b54" : "#2ef0d8"}`,
              background: speaking ? "rgba(255,123,84,0.15)" : "rgba(46,240,216,0.12)",
              cursor: ttsSupported ? "pointer" : "not-allowed",
              opacity: ttsSupported ? 1 : 0.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              transition: "all 0.2s",
            }}
          >
            {speaking && <span className="animate-ping" style={{ position: "absolute", inset: -2, borderRadius: "50%", border: "1px solid rgba(255,123,84,0.5)" }} />}
            <span style={{ width: 12, height: 12, borderRadius: "50%", background: speaking ? "#ff7b54" : "#2ef0d8", boxShadow: `0 0 10px ${speaking ? "#ff7b54" : "#2ef0d8"}` }} />
          </button>

          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "rgba(220,255,250,0.85)", fontFamily: "'DM Mono',monospace" }}>{overviewText}</p>
            {stats.total === 0 && (
              <Link href="/aether-intake">
                <span style={{ display: "inline-block", marginTop: 10, fontSize: 11, letterSpacing: "0.1em", color: "#2ef0d8", fontFamily: "'DM Mono',monospace", cursor: "pointer", borderBottom: "1px solid rgba(46,240,216,0.4)" }}>
                  Open Batch Intake →
                </span>
              </Link>
            )}
            <p style={{ margin: "10px 0 0", fontSize: 9, color: "rgba(46,240,216,0.45)", fontFamily: "'DM Mono',monospace", letterSpacing: "0.12em" }}>
              {ttsSupported ? "▸ PRESS THE DOT TO HEAR THE READOUT" : "▸ READOUT UNAVAILABLE — TTS NOT SUPPORTED HERE"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Image engine ──────────────────────────────────────────────────────────
// The unified search also queries the static visual library (public/gpt_imgs +
// public/linkedin_imgs) via public/image-index.json (regenerate with
// `pnpm --filter @workspace/aether run build:image-index`). Categories mirror
// the Knowledge Map taxonomy so both engines share one vocabulary.
const BASE_URL = (import.meta.env.BASE_URL || "/");
const IMAGE_INDEX_URL = `${BASE_URL}image-index.json`;
const MAX_IMAGE_RESULTS = 36;

type ImageEntry = { file: string; dir: string; cat: string; video?: boolean };

const CAT_META: Record<string, { label: string; color: string }> = {
  aether: { label: "AETHER Architecture", color: "#00D4FF" },
  cosmic: { label: "Cosmic & Planetary", color: "#C87BFF" },
  hardware: { label: "Hardware & Prototypes", color: "#FF9632" },
  science: { label: "Science & Engineering", color: "#00FFCC" },
  narrative: { label: "Narrative", color: "#FFD050" },
  emotional: { label: "Emotional & Personal", color: "#FF8FB3" },
  visual: { label: "AI Generative & Visual", color: "#FF6644" },
  video: { label: "Video Clip", color: "#44FF88" },
  uncategorized: { label: "Visual Library", color: "#7fb8b0" },
};

const SOURCE_SYN: Record<string, string> = {
  gpt_imgs: "gpt openai generated ai image render visual",
  linkedin_imgs: "linkedin professional post social image visual",
};

const IMAGE_INTENT = new Set([
  "image", "images", "picture", "pictures", "pic", "pics", "photo", "photos",
  "visual", "visuals", "render", "renders", "art", "artwork", "graphic",
  "graphics", "gallery", "thumbnail", "thumbnails", "video", "videos", "clip", "clips",
]);

function imageSrc(it: ImageEntry): string {
  return `${BASE_URL}${it.dir}/${it.file}`;
}

function scoreImage(it: ImageEntry, tokens: string[], hasIntent: boolean): number {
  const cat = CAT_META[it.cat] || CAT_META.uncategorized;
  const hay = `${it.file} ${it.dir} ${SOURCE_SYN[it.dir] || ""} ${cat.label} ${it.cat} ${it.video ? "video clip motion" : ""}`.toLowerCase();
  let matched = 0;
  for (const t of tokens) if (t && hay.includes(t)) matched += 1;
  if (matched === 0 && !hasIntent) return 0;
  let rel = tokens.length ? matched / tokens.length : 0;
  if (hasIntent) rel = Math.max(rel, 0.45);
  return Math.min(1, rel);
}

function useImageIndex(): ImageEntry[] {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  useEffect(() => {
    let alive = true;
    fetch(IMAGE_INDEX_URL)
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (!alive || !Array.isArray(data)) return;
        setEntries(
          data
            .filter((d): d is Record<string, unknown> => !!d && typeof d === "object")
            .map((d) => ({
              file: asStr(d.file),
              dir: asStr(d.dir),
              cat: asStr(d.cat) || "uncategorized",
              video: d.video === true,
            }))
            .filter((d) => d.file && d.dir)
        );
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);
  return entries;
}

function ImageResultCard({ it, relevance }: { it: ImageEntry; relevance: number }) {
  const cat = CAT_META[it.cat] || CAT_META.uncategorized;
  const src = imageSrc(it);
  return (
    <a href={src} target="_blank" rel="noreferrer" className="block">
      <Card className="p-3 bg-card border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-black/40 border border-white/5 flex items-center justify-center">
            {it.video ? (
              <video src={src} muted playsInline preload="metadata" className="w-full h-full object-cover" />
            ) : (
              <img src={src} alt={it.file} loading="lazy" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="font-mono text-sm text-foreground group-hover:text-primary transition-colors truncate">{it.file}</h3>
              <Badge variant="outline" className="font-mono text-[10px] uppercase border-white/10" style={{ color: cat.color }}>
                {it.video ? "video" : "image"}
              </Badge>
            </div>
            <p className="text-muted-foreground font-mono text-[11px] truncate">
              {cat.label} · {it.dir === "gpt_imgs" ? "GPT / OpenAI" : it.dir === "linkedin_imgs" ? "LinkedIn" : it.dir}
            </p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Relevance</div>
            <div className="font-mono text-lg text-accent">{(relevance * 100).toFixed(0)}%</div>
          </div>
        </div>
      </Card>
    </a>
  );
}

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchConceptsType>("semantic");
  const [activeSearch, setActiveSearch] = useState({ q: "", type: "semantic" as SearchConceptsType });

  const imageIndex = useImageIndex();

  const { data: results, isFetching } = useSearchConcepts(
    { q: activeSearch.q, type: activeSearch.type },
    { query: { enabled: !!activeSearch.q } }
  );

  const imageMatches = useMemo(() => {
    const q = activeSearch.q.trim().toLowerCase();
    if (!q || imageIndex.length === 0) return { list: [] as { it: ImageEntry; rel: number }[], total: 0 };
    const tokens = q.split(/\s+/).filter(Boolean);
    const hasIntent = tokens.some((t) => IMAGE_INTENT.has(t));
    const scored = imageIndex
      .map((it) => ({ it, rel: scoreImage(it, tokens, hasIntent) }))
      .filter((x) => x.rel > 0)
      .sort((a, b) => b.rel - a.rel);
    return { list: scored.slice(0, MAX_IMAGE_RESULTS), total: scored.length };
  }, [activeSearch.q, imageIndex]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveSearch({ q: query.trim(), type });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 h-full flex flex-col">
      <DailyIngestionOverview />
      <header className="space-y-4 shrink-0">
        <h1 className="text-4xl font-serif tracking-tight text-foreground flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-primary" />
          Semantic Query
        </h1>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query the topology..." 
              className="pl-12 h-14 bg-card/50 border-white/10 font-mono text-lg focus-visible:ring-primary shadow-inner"
            />
          </div>
          <Button type="submit" className="h-14 px-8 font-mono tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <TypeToggle 
            active={type === "semantic"} 
            onClick={() => setType("semantic")} 
            icon={<Fingerprint className="w-4 h-4" />}
            label="Semantic" 
          />
          <TypeToggle 
            active={type === "concept"} 
            onClick={() => setType("concept")} 
            icon={<Hexagon className="w-4 h-4" />}
            label="Exact Match" 
          />
          <TypeToggle 
            active={type === "coherence"} 
            onClick={() => setType("coherence")} 
            icon={<Layers className="w-4 h-4" />}
            label="High Coherence" 
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-4 pb-8 space-y-4">
        {(() => {
          const conceptItems = (results || []).map((res, i) => ({
            kind: "concept" as const,
            rel: res.relevance,
            key: `c-${res.id}-${i}`,
            res,
          }));
          const imageItems = imageMatches.list.map((x) => ({
            kind: "image" as const,
            rel: x.rel,
            key: `i-${x.it.dir}-${x.it.file}`,
            it: x.it,
          }));
          const combined = [...conceptItems, ...imageItems].sort((a, b) => b.rel - a.rel);
          const stillLoading = isFetching && !results;

          if (stillLoading && imageItems.length === 0) {
            return (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            );
          }

          if (combined.length > 0) {
            return (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center gap-3 flex-wrap font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <span className="text-primary">{conceptItems.length} concepts</span>
                  <span className="text-white/20">·</span>
                  <span className="text-accent">{imageMatches.total} images</span>
                  {imageMatches.total > imageMatches.list.length && (
                    <span className="text-white/30 normal-case tracking-normal">(showing first {imageMatches.list.length})</span>
                  )}
                  {stillLoading && (
                    <span className="inline-block w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin ml-1" />
                  )}
                </div>
                {combined.map((item) =>
                  item.kind === "concept" ? (
                    <Card key={item.key} className="p-5 bg-card border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="font-serif text-2xl text-foreground group-hover:text-primary transition-colors">{item.res.name}</h3>
                            <Badge variant="outline" className="font-mono text-[10px] uppercase border-white/10 text-muted-foreground">
                              {item.res.type}
                            </Badge>
                          </div>
                          {item.res.snippet && (
                            <p className="text-muted-foreground font-serif text-sm leading-relaxed max-w-3xl">
                              "{item.res.snippet}"
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <div className="text-right">
                            <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Relevance</div>
                            <div className="font-mono text-lg text-accent">{(item.res.relevance * 100).toFixed(0)}%</div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Coherence</div>
                            <div className="font-mono text-sm text-foreground">{(item.res.coherence * 100).toFixed(0)}%</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ) : (
                    <ImageResultCard key={item.key} it={item.it} relevance={item.rel} />
                  )
                )}
              </div>
            );
          }

          if (activeSearch.q) {
            return (
              <div className="text-center py-20">
                <Hexagon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="font-serif text-lg text-muted-foreground italic">No topological matches found for this query.</p>
              </div>
            );
          }

          return (
            <div className="text-center py-20">
              <p className="font-mono text-sm text-muted-foreground tracking-widest uppercase">Awaiting query parameters.</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function TypeToggle({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs transition-colors border ${
        active 
          ? "bg-primary/10 border-primary/50 text-primary" 
          : "bg-transparent border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

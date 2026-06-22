import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Plus, Loader2, CheckCircle2, AlertCircle, Trash2,
  Zap, ChevronDown, ChevronUp, ExternalLink, Tag, Globe,
  Cpu, Sparkles, History, RefreshCw, AlertTriangle, ShieldCheck,
  TrendingUp, TrendingDown, Copy, BarChart3, ClipboardPaste, X,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type AetherLayer = "auto" | "mnesis" | "infernia" | "aletheia" | "reverie";

const LAYER_META: Record<AetherLayer, { label: string; symbol: string; color: string }> = {
  auto:     { label: "Auto-Detect", symbol: "~",   color: "#64748b" },
  mnesis:   { label: "MNĒSIS",      symbol: "~",   color: "#8b5cf6" },
  infernia: { label: "INFERNIA",    symbol: "|||", color: "#f97316" },
  aletheia: { label: "ALETHEIA",    symbol: "◇",   color: "#0ea5e9" },
  reverie:  { label: "REVERIE",     symbol: "✧",   color: "#eab308" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface GapResult {
  missing: string[];
  weak: { name: string; coherence: number }[];
  coverageScore: number;
}

interface ImportedLink {
  id: string;
  url: string;
  status: "queued" | "fetching" | "done" | "error" | "duplicate";
  error?: string;
  result?: {
    title: string;
    layer: AetherLayer;
    docType: string;
    charCount: number;
    conceptCount: number;
    headings: string[];
    keywords: string[];
    tags: string[];
    docId: string;
    recordId: string;
    gaps?: GapResult;
  };
  addedAt: Date;
}

interface HistoryRecord {
  id: string;
  url: string;
  title: string;
  layer: AetherLayer;
  docType: string;
  charCount: number;
  conceptCount: number;
  tags: string[];
  importedAt: string;
  lastSyncedAt: string;
  version: number;
  syncHistory: { syncedAt: string; conceptDelta: number; charDelta: number }[];
}

type Tab = "import" | "history" | "gaps";

// ── Page ──────────────────────────────────────────────────────────────────────

function SourcesHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const books: {x:number;col:string;phase:number}[]=[];
    for(let i=0;i<18;i++) books.push({x:30+i*46,col:["#2ef0d8","#9966ff","#c9a84c","#44aaff","#ff4477","#44cc77"][i%6],phase:i*0.4});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      books.forEach(b=>{
        const h=40+15*Math.sin(t*0.025+b.phase);
        const y=H-h-10;
        ctx.fillStyle=b.col+"22";ctx.fillRect(b.x,y,28,h);ctx.strokeStyle=b.col+"55";ctx.lineWidth=0.5;ctx.strokeRect(b.x,y,28,h);
        ctx.fillStyle=b.col+"88";ctx.fillRect(b.x+3,y,2,h);
      });
      ctx.fillStyle="rgba(201,168,76,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SOURCES · REFERENCE LIBRARY · CITATIONS · BIBLIOGRAPHY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SourcesPage() {
  const { toast } = useToast();
  const [tab, setTab] = useState<Tab>("import");

  // Import tab state
  const [urlInput, setUrlInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [layer, setLayer] = useState<AetherLayer>("auto");
  const [links, setLinks] = useState<ImportedLink[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // History tab state
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [resyncingId, setResyncingId] = useState<string | null>(null);
  const [resyncResults, setResyncResults] = useState<Record<string, { conceptDelta: number; charDelta: number; gaps?: GapResult }>>({});

  // Gap scan tab state
  const [gapKeywords, setGapKeywords] = useState("");
  const [gapLoading, setGapLoading] = useState(false);
  const [gapResult, setGapResult] = useState<GapResult | null>(null);

  // Paste modal state — shown when a URL is protected (Claude, Twitter, etc.)
  const [pasteModal, setPasteModal] = useState<{
    open: boolean;
    url: string;
    reason: string;
    entryId: string | null;
    title: string;
    content: string;
    submitting: boolean;
  }>({ open: false, url: "", reason: "", entryId: null, title: "", content: "", submitting: false });

  const base = () => import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

  // ── Load history when tab opens ──
  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${base()}/api/import/history`);
      const data = await res.json();
      setHistory(data.history ?? []);
    } catch {
      toast({ title: "Could not load history", variant: "destructive" });
    } finally {
      setHistoryLoading(false);
    }
  };

  // ── Import helpers ────────────────────────────────────────────────────────

  const addToQueue = (url: string): ImportedLink | null => {
    url = url.trim();
    if (!url || !url.startsWith("http")) return null;
    if (links.some(l => l.url === url && l.status !== "error")) return null;
    const entry: ImportedLink = {
      id: `${Date.now()}-${Math.random()}`,
      url,
      status: "queued",
      addedAt: new Date(),
    };
    setLinks(prev => [entry, ...prev]);
    return entry;
  };

  const updateLink = (id: string, patch: Partial<ImportedLink>) =>
    setLinks(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));

  const importLink = async (entry: ImportedLink) => {
    updateLink(entry.id, { status: "fetching" });
    try {
      const res = await fetch(`${base()}/api/import/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: entry.url, layer: layer !== "auto" ? layer : undefined }),
      });
      const data = await res.json();

      if (res.status === 409) {
        updateLink(entry.id, {
          status: "duplicate",
          error: `Already imported on ${new Date(data.record.importedAt).toLocaleDateString()} — v${data.record.version}`,
        });
        return;
      }

      // Protected URL — open paste modal so user can paste content manually
      if (res.status === 403 && data.requiresPaste) {
        updateLink(entry.id, { status: "error", error: data.error });
        setPasteModal({
          open: true,
          url: entry.url,
          reason: data.error,
          entryId: entry.id,
          title: "",
          content: "",
          submitting: false,
        });
        return;
      }

      if (!res.ok) throw new Error(data.error ?? "Import failed");

      updateLink(entry.id, {
        status: "done",
        result: {
          title: data.document.title,
          layer: data.document.layer,
          docType: data.document.docType,
          charCount: data.document.charCount,
          conceptCount: data.document.conceptCount,
          headings: data.extraction.headings,
          keywords: data.extraction.keywords,
          tags: data.document.tags,
          docId: data.document.id,
          recordId: data.record?.id ?? "",
          gaps: data.gaps,
        },
      });
      setExpandedId(entry.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      updateLink(entry.id, { status: "error", error: msg });
    }
  };

  // Submit pasted content to /api/import/text
  const handlePasteSubmit = async () => {
    if (!pasteModal.content.trim() || pasteModal.submitting) return;
    setPasteModal(p => ({ ...p, submitting: true }));
    try {
      const res = await fetch(`${base()}/api/import/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: pasteModal.url,
          title: pasteModal.title || undefined,
          content: pasteModal.content,
          layer: layer !== "auto" ? layer : undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 409) {
        toast({ title: "Already imported", description: data.message, className: "font-mono" });
        setPasteModal(p => ({ ...p, open: false, submitting: false }));
        return;
      }
      if (!res.ok) throw new Error(data.error ?? "Import failed");

      // Update the queue entry if one exists
      if (pasteModal.entryId) {
        updateLink(pasteModal.entryId, {
          status: "done",
          result: {
            title: data.document.title,
            layer: data.document.layer,
            docType: data.document.docType,
            charCount: data.document.charCount,
            conceptCount: data.document.conceptCount,
            headings: [],
            keywords: data.extraction.keywords,
            tags: data.document.tags,
            docId: data.document.id,
            recordId: data.record?.id ?? "",
            gaps: data.gaps,
          },
        });
        setExpandedId(pasteModal.entryId);
      } else {
        // Standalone paste (no URL queue entry) — add a synthetic done entry
        const synth: ImportedLink = {
          id: `paste-${Date.now()}`,
          url: pasteModal.url || "manual-paste",
          status: "done",
          addedAt: new Date(),
          result: {
            title: data.document.title,
            layer: data.document.layer,
            docType: data.document.docType,
            charCount: data.document.charCount,
            conceptCount: data.document.conceptCount,
            headings: [],
            keywords: data.extraction.keywords,
            tags: data.document.tags,
            docId: data.document.id,
            recordId: data.record?.id ?? "",
            gaps: data.gaps,
          },
        };
        setLinks(prev => [synth, ...prev]);
        setExpandedId(synth.id);
      }
      setPasteModal({ open: false, url: "", reason: "", entryId: null, title: "", content: "", submitting: false });
      toast({ title: "Crystallized from paste", description: data.document.title, className: "font-mono" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Paste import failed", description: msg, variant: "destructive" });
      setPasteModal(p => ({ ...p, submitting: false }));
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    setUrlInput("");
    const entry = addToQueue(url);
    if (entry) await importLink(entry);
  };

  const handleBulkImport = async () => {
    const urls = bulkInput.split(/[\n,]+/).map(u => u.trim()).filter(u => u.startsWith("http"));
    setBulkInput("");
    setShowBulk(false);
    const entries: ImportedLink[] = [];
    for (const url of urls) {
      const e = addToQueue(url);
      if (e) entries.push(e);
    }
    if (!entries.length) return;
    toast({ title: `Importing ${entries.length} links…`, className: "font-mono" });
    for (const e of entries) await importLink(e);
  };

  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id));

  // ── Resync ────────────────────────────────────────────────────────────────

  const handleResync = async (record: HistoryRecord) => {
    setResyncingId(record.id);
    try {
      const res = await fetch(`${base()}/api/import/resync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: record.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Resync failed");
      setResyncResults(prev => ({
        ...prev,
        [record.id]: {
          conceptDelta: data.conceptDelta,
          charDelta: data.charDelta,
          gaps: data.gaps,
        },
      }));
      toast({
        title: "Re-synced",
        description: `v${data.record.version} — ${data.conceptDelta >= 0 ? "+" : ""}${data.conceptDelta} concepts`,
        className: "font-mono",
      });
      await loadHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Resync failed", description: msg, variant: "destructive" });
    } finally {
      setResyncingId(null);
    }
  };

  // ── Gap scan ──────────────────────────────────────────────────────────────

  const handleGapScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = gapKeywords
      .split(/[\n,]+/)
      .map(k => k.trim().toLowerCase())
      .filter(k => k.length > 2);
    if (!keywords.length) return;
    setGapLoading(true);
    try {
      const res = await fetch(`${base()}/api/import/gaps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      const data = await res.json();
      setGapResult(data);
    } catch {
      toast({ title: "Gap scan failed", variant: "destructive" });
    } finally {
      setGapLoading(false);
    }
  };

  const statusCounts = {
    done: links.filter(l => l.status === "done").length,
    error: links.filter(l => l.status === "error").length,
    duplicate: links.filter(l => l.status === "duplicate").length,
    active: links.filter(l => l.status === "fetching" || l.status === "queued").length,
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #c9a84c",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#c9a84c",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #c9a84c",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#c9a84c",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SOURCES · REFERENCE LIBRARY · CITATIONS · BIBLIOGRAPHY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(201,168,76,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>18 animated reference books — the live AETHER sources simulation.</p></div>
          <SourcesHeaderCanvas />
        </div>
      </div>
      {/* ── Header ── */}
      <div className="px-8 pt-8 pb-0 shrink-0">
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
          Knowledge Source Terminal
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
          Sources
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed mb-6">
          Import · track · gap-detect · resync. Every URL crystallizes into the knowledge graph
          with full version history and gap analysis.
        </p>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border/30">
          {([
            { id: "import",  label: "Import",    icon: Zap },
            { id: "history", label: "History",   icon: History },
            { id: "gaps",    label: "Gap Scan",  icon: BarChart3 },
          ] as { id: Tab; label: string; icon: React.ElementType }[]).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-5 py-3 font-mono text-xs border-b-2 transition-all ${
                tab === t.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground/50 hover:text-muted-foreground"
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.id === "history" && history.length > 0 && (
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary/70">
                  {history.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <AnimatePresence mode="wait">

          {/* ══ IMPORT TAB ══ */}
          {tab === "import" && (
            <motion.div key="import" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 xl:grid-cols-5 gap-8">

              {/* Left: inputs */}
              <div className="xl:col-span-2 space-y-5">
                <div className="rounded-xl border border-border/40 bg-card/30 p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Link2 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">Import Link</div>
                  </div>

                  <form onSubmit={handleSingleSubmit} className="space-y-4">
                    <div className="relative">
                      <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                      <input
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        placeholder="https://claude.ai/public/artifacts/..."
                        className="w-full bg-background/60 border border-border rounded-xl pl-10 pr-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/60 focus:bg-background transition-all"
                      />
                    </div>

                    <div>
                      <label className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1.5 block">AETHER Layer</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(Object.entries(LAYER_META) as [AetherLayer, typeof LAYER_META[AetherLayer]][]).map(([k, v]) => (
                          <button key={k} type="button" onClick={() => setLayer(k)}
                            className="px-2 py-1.5 rounded-lg border font-mono text-[10px] transition-all"
                            style={layer === k
                              ? { borderColor: `${v.color}60`, backgroundColor: `${v.color}15`, color: v.color }
                              : { borderColor: "var(--border)", color: "var(--muted-foreground)", opacity: 0.5 }
                            }>
                            {v.symbol} {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" disabled={!urlInput.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      <Zap className="w-4 h-4" /> Crystallize
                    </button>
                  </form>

                  {/* Bulk */}
                  <div>
                    <button onClick={() => setShowBulk(b => !b)}
                      className="font-mono text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 flex items-center gap-1 transition-colors">
                      <Plus className="w-3 h-3" />
                      Bulk import {showBulk ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <AnimatePresence>
                      {showBulk && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3 space-y-2">
                          <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value)}
                            placeholder={"Paste URLs, one per line:\nhttps://claude.ai/public/artifacts/abc\nhttps://..."} rows={5}
                            className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/50 transition-all resize-none" />
                          <button onClick={handleBulkImport} disabled={!bulkInput.trim()}
                            className="w-full py-2 rounded-lg border border-primary/30 text-primary font-mono text-xs hover:bg-primary/5 disabled:opacity-30 transition-all">
                            Import All
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Pipeline info */}
                <div className="rounded-xl border border-border/20 p-5 space-y-3">
                  <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest">What's new</div>
                  {[
                    { icon: ShieldCheck, label: "Deduplication",  desc: "Same URL won't be imported twice — you'll see a notice instead" },
                    { icon: BarChart3,   label: "Gap Detection",   desc: "Every import auto-runs a gap scan and shows missing concepts" },
                    { icon: RefreshCw,   label: "Auto-Resync",     desc: "Re-fetch any URL from History to pull in new content" },
                    { icon: History,     label: "Version Tracking", desc: "Full sync log with concept and character deltas per version" },
                  ].map(s => (
                    <div key={s.label} className="flex items-start gap-3">
                      <s.icon className="w-3.5 h-3.5 text-primary/40 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-mono text-[10px] text-foreground/50">{s.label}</div>
                        <div className="font-mono text-[9px] text-muted-foreground/30 leading-relaxed">{s.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: link cards */}
              <div className="xl:col-span-3 space-y-4">
                {links.length > 0 && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {statusCounts.done > 0 && <span className="font-mono text-[10px] text-green-400">✓ {statusCounts.done} done</span>}
                      {statusCounts.duplicate > 0 && <span className="font-mono text-[10px] text-yellow-400">⊘ {statusCounts.duplicate} duplicate</span>}
                      {statusCounts.error > 0 && <span className="font-mono text-[10px] text-red-400">✗ {statusCounts.error} failed</span>}
                      {statusCounts.active > 0 && <span className="font-mono text-[10px] text-primary animate-pulse">◉ {statusCounts.active} active</span>}
                    </div>
                    <button onClick={() => setLinks([])} className="font-mono text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors">Clear all</button>
                  </div>
                )}

                {links.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                      <Sparkles className="w-7 h-7 text-primary/30" />
                    </div>
                    <div className="font-serif text-lg text-muted-foreground/40">No sources imported yet</div>
                    <div className="font-mono text-xs text-muted-foreground/25 max-w-xs leading-relaxed">Paste a Claude artifact link or any URL and hit Crystallize</div>
                  </div>
                )}

                <AnimatePresence initial={false}>
                  {links.map(link => (
                    <motion.div key={link.id} initial={{ opacity: 0, y: -8, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}>
                      <LinkCard link={link} isExpanded={expandedId === link.id} onToggle={() => setExpandedId(expandedId === link.id ? null : link.id)} onRemove={() => removeLink(link.id)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ══ HISTORY TAB ══ */}
          {tab === "history" && (
            <motion.div key="history" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
                  {history.length} imported source{history.length !== 1 ? "s" : ""}
                </div>
                <button onClick={loadHistory} disabled={historyLoading}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors">
                  <RefreshCw className={`w-3 h-3 ${historyLoading ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>

              {historyLoading && (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-5 h-5 animate-spin text-primary/40" />
                </div>
              )}

              {!historyLoading && history.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 space-y-3 text-center">
                  <History className="w-8 h-8 text-muted-foreground/20" />
                  <div className="font-serif text-lg text-muted-foreground/40">No import history yet</div>
                  <div className="font-mono text-xs text-muted-foreground/25">Import a URL to begin tracking versions</div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {history.map(r => {
                  const synced = resyncResults[r.id];
                  const layerMeta = LAYER_META[r.layer] ?? LAYER_META.mnesis;
                  const isResyncing = resyncingId === r.id;
                  return (
                    <motion.div key={r.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl border border-border/30 bg-card/20 p-5 space-y-4">
                      {/* Title + layer */}
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg border shrink-0 flex items-center justify-center font-mono text-xs"
                          style={{ borderColor: `${layerMeta.color}40`, color: layerMeta.color, background: `${layerMeta.color}10` }}>
                          {layerMeta.symbol}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-serif text-sm text-foreground/80 line-clamp-1">{r.title}</div>
                          <div className="font-mono text-[9px] text-muted-foreground/30 truncate mt-0.5">{r.url}</div>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="flex flex-wrap gap-3">
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded border" style={{ borderColor: `${layerMeta.color}30`, color: layerMeta.color }}>{layerMeta.label}</span>
                        <span className="font-mono text-[9px] text-muted-foreground/40">{r.conceptCount} concepts</span>
                        <span className="font-mono text-[9px] text-muted-foreground/40">{(r.charCount / 1000).toFixed(1)}k chars</span>
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-primary/5 border border-primary/15 text-primary/60">v{r.version}</span>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <div className="font-mono text-[8px] text-muted-foreground/25 uppercase tracking-widest">First imported</div>
                          <div className="font-mono text-[10px] text-muted-foreground/50">{new Date(r.importedAt).toLocaleDateString()} {new Date(r.importedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                        <div>
                          <div className="font-mono text-[8px] text-muted-foreground/25 uppercase tracking-widest">Last synced</div>
                          <div className="font-mono text-[10px] text-muted-foreground/50">{new Date(r.lastSyncedAt).toLocaleDateString()} {new Date(r.lastSyncedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                        </div>
                      </div>

                      {/* Sync history */}
                      {r.syncHistory.length > 0 && (
                        <div className="space-y-1">
                          <div className="font-mono text-[8px] text-muted-foreground/25 uppercase tracking-widest mb-1">Sync History</div>
                          {r.syncHistory.slice(-3).map((s, i) => (
                            <div key={i} className="flex items-center gap-3 text-muted-foreground/40">
                              <span className="font-mono text-[9px]">{new Date(s.syncedAt).toLocaleDateString()}</span>
                              <span className={`font-mono text-[9px] flex items-center gap-0.5 ${s.conceptDelta >= 0 ? "text-green-400/70" : "text-red-400/70"}`}>
                                {s.conceptDelta >= 0 ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                                {s.conceptDelta >= 0 ? "+" : ""}{s.conceptDelta} concepts
                              </span>
                              <span className="font-mono text-[9px] text-muted-foreground/30">
                                {s.charDelta >= 0 ? "+" : ""}{(s.charDelta / 1000).toFixed(1)}k chars
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Resync result */}
                      {synced && (
                        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-3 space-y-1">
                          <div className="font-mono text-[9px] text-green-400">↺ Resync complete</div>
                          <div className="flex gap-3">
                            <span className={`font-mono text-[9px] ${synced.conceptDelta >= 0 ? "text-green-400/70" : "text-muted-foreground/50"}`}>
                              {synced.conceptDelta >= 0 ? "+" : ""}{synced.conceptDelta} concepts
                            </span>
                            <span className="font-mono text-[9px] text-muted-foreground/40">
                              {synced.charDelta >= 0 ? "+" : ""}{(synced.charDelta / 1000).toFixed(1)}k chars
                            </span>
                          </div>
                          {synced.gaps && synced.gaps.missing.length > 0 && (
                            <div className="font-mono text-[9px] text-yellow-400/70 mt-1">
                              {synced.gaps.missing.length} gaps still detected after resync
                            </div>
                          )}
                        </div>
                      )}

                      {/* Resync button */}
                      <button onClick={() => handleResync(r)} disabled={isResyncing}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-primary/25 text-primary/60 font-mono text-xs hover:bg-primary/5 hover:text-primary disabled:opacity-40 transition-all">
                        {isResyncing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                        {isResyncing ? "Re-syncing…" : `Re-sync  ·  v${r.version} → v${r.version + 1}`}
                      </button>

                      {/* Open link */}
                      <a href={r.url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 font-mono text-[9px] text-muted-foreground/25 hover:text-muted-foreground/50 transition-colors">
                        <ExternalLink className="w-3 h-3" />
                        <span className="truncate">{r.url}</span>
                      </a>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ══ GAP SCAN TAB ══ */}
          {tab === "gaps" && (
            <motion.div key="gaps" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 xl:grid-cols-5 gap-8">

              {/* Left: keyword input */}
              <div className="xl:col-span-2 space-y-5">
                <div className="rounded-xl border border-border/40 bg-card/30 p-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <BarChart3 className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">Gap Scanner</div>
                  </div>

                  <p className="font-mono text-[11px] text-muted-foreground/40 leading-relaxed">
                    Enter keywords or concepts you expect to find in the knowledge graph.
                    AETHER will tell you which ones are missing, which are weak, and which are already covered.
                  </p>

                  <form onSubmit={handleGapScan} className="space-y-4">
                    <div>
                      <label className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1.5 block">
                        Keywords / Concepts
                      </label>
                      <textarea
                        value={gapKeywords}
                        onChange={e => setGapKeywords(e.target.value)}
                        placeholder={"crystallization, coherence, consciousness,\nimmune system, mnesis, resonance,\ngap detection, knowledge graph..."}
                        rows={7}
                        className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/50 transition-all resize-none"
                      />
                      <div className="font-mono text-[9px] text-muted-foreground/25 mt-1">
                        Comma or newline separated
                      </div>
                    </div>
                    <button type="submit" disabled={gapLoading || !gapKeywords.trim()}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
                      {gapLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BarChart3 className="w-4 h-4" />}
                      {gapLoading ? "Scanning…" : "Scan Graph"}
                    </button>
                  </form>
                </div>

                {/* What gap scan does */}
                <div className="rounded-xl border border-border/20 p-5 space-y-3">
                  <div className="font-mono text-[9px] text-muted-foreground/35 uppercase tracking-widest">How It Works</div>
                  {[
                    { label: "Missing",  desc: "Concept not found anywhere in the knowledge graph — needs new documents" },
                    { label: "Weak",     desc: "Concept exists but has coherence < 0.5 — needs more supporting sources" },
                    { label: "Present",  desc: "Concept is well-represented with strong coherence across documents" },
                    { label: "Coverage", desc: "Score = present / total keywords — higher is better" },
                  ].map(s => (
                    <div key={s.label} className="flex items-start gap-3">
                      <span className="font-mono text-[9px] text-primary/40 mt-0.5 shrink-0 w-12">{s.label}</span>
                      <div className="font-mono text-[9px] text-muted-foreground/30 leading-relaxed">{s.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: results */}
              <div className="xl:col-span-3 space-y-5">
                {!gapResult && !gapLoading && (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                      <BarChart3 className="w-7 h-7 text-primary/30" />
                    </div>
                    <div className="font-serif text-lg text-muted-foreground/40">Awaiting scan</div>
                    <div className="font-mono text-xs text-muted-foreground/25 max-w-xs leading-relaxed">Enter keywords on the left and run a scan to see what the graph is missing</div>
                  </div>
                )}

                {gapResult && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    {/* Coverage score */}
                    <div className="rounded-xl border border-border/30 bg-card/20 p-5">
                      <div className="font-mono text-[9px] text-muted-foreground/35 uppercase tracking-widest mb-3">Graph Coverage Score</div>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-serif font-medium" style={{
                          color: gapResult.coverageScore > 0.7 ? "#22c55e" : gapResult.coverageScore > 0.4 ? "#f59e0b" : "#ef4444"
                        }}>
                          {Math.round(gapResult.coverageScore * 100)}%
                        </div>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-background/60 border border-border/30 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${gapResult.coverageScore * 100}%` }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="h-full rounded-full"
                              style={{
                                background: gapResult.coverageScore > 0.7 ? "#22c55e" : gapResult.coverageScore > 0.4 ? "#f59e0b" : "#ef4444"
                              }}
                            />
                          </div>
                          <div className="font-mono text-[9px] text-muted-foreground/35 mt-1">
                            {Math.round(gapResult.coverageScore * 100)}% of keywords found in knowledge graph
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Missing concepts */}
                    {gapResult.missing.length > 0 && (
                      <div className="rounded-xl border border-red-500/15 bg-red-500/3 p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-400/70" />
                          <div className="font-mono text-[10px] text-red-400/80 uppercase tracking-widest">
                            {gapResult.missing.length} Missing — not in graph
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {gapResult.missing.map(m => (
                            <span key={m} className="font-mono text-[10px] px-2.5 py-1 rounded-lg border border-red-500/25 bg-red-500/8 text-red-400/70">
                              {m}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 font-mono text-[9px] text-muted-foreground/30">
                          Import documents covering these topics to fill the gaps.
                        </div>
                      </div>
                    )}

                    {/* Weak concepts */}
                    {gapResult.weak.length > 0 && (
                      <div className="rounded-xl border border-yellow-500/15 bg-yellow-500/3 p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-3.5 h-3.5 text-yellow-400/70" />
                          <div className="font-mono text-[10px] text-yellow-400/80 uppercase tracking-widest">
                            {gapResult.weak.length} Weak — low coherence
                          </div>
                        </div>
                        <div className="space-y-2">
                          {gapResult.weak.map(w => (
                            <div key={w.name} className="flex items-center gap-3">
                              <span className="font-mono text-[10px] text-yellow-400/70 w-32 shrink-0">{w.name}</span>
                              <div className="flex-1 h-1.5 rounded-full bg-background/60 border border-border/30 overflow-hidden">
                                <div className="h-full rounded-full bg-yellow-400/40" style={{ width: `${w.coherence * 100}%` }} />
                              </div>
                              <span className="font-mono text-[9px] text-muted-foreground/40 shrink-0">{Math.round(w.coherence * 100)}%</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 font-mono text-[9px] text-muted-foreground/30">
                          Add more documents supporting these concepts to boost coherence.
                        </div>
                      </div>
                    )}

                    {/* All good */}
                    {gapResult.missing.length === 0 && gapResult.weak.length === 0 && (
                      <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-6 flex items-center gap-4">
                        <ShieldCheck className="w-8 h-8 text-green-400/70 shrink-0" />
                        <div>
                          <div className="font-mono text-sm text-green-400 mb-1">Full coverage</div>
                          <div className="font-mono text-[10px] text-muted-foreground/40 leading-relaxed">
                            All scanned keywords are present in the knowledge graph with strong coherence.
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Paste Content Modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {pasteModal.open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(2,6,23,0.85)", backdropFilter: "blur(8px)" }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              className="w-full max-w-2xl rounded-2xl border border-primary/20 bg-card shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 bg-primary/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <ClipboardPaste className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-mono text-xs text-primary/60 uppercase tracking-widest">Protected Source</div>
                    <div className="font-serif text-sm text-foreground font-semibold">Paste Content Manually</div>
                  </div>
                </div>
                <button
                  onClick={() => setPasteModal(p => ({ ...p, open: false }))}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                {/* Reason badge */}
                <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-mono text-xs text-amber-400/80">{pasteModal.reason}</div>
                    {pasteModal.url && (
                      <div className="font-mono text-[10px] text-muted-foreground/40 mt-1 truncate">{pasteModal.url}</div>
                    )}
                  </div>
                </div>

                <div className="font-mono text-xs text-muted-foreground/60 leading-relaxed">
                  Open the artifact in your browser, select all the text, copy it, and paste it below.
                  AETHER will crystallize the content into the knowledge graph without needing server access.
                </div>

                {/* Title field */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">Title (optional)</label>
                  <input
                    type="text"
                    value={pasteModal.title}
                    onChange={e => setPasteModal(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. CGLE Pattern Formation Study"
                    className="w-full bg-background/60 border border-border/40 rounded-lg px-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* Content textarea */}
                <div className="space-y-1.5">
                  <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                    Paste Content <span className="text-primary/60">*</span>
                  </label>
                  <textarea
                    value={pasteModal.content}
                    onChange={e => setPasteModal(p => ({ ...p, content: e.target.value }))}
                    placeholder="Paste the full text content from the Claude artifact or protected page here…"
                    rows={10}
                    className="w-full bg-background/60 border border-border/40 rounded-lg px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-colors resize-none leading-relaxed"
                  />
                  <div className="font-mono text-[9px] text-muted-foreground/30 text-right">
                    {pasteModal.content.length.toLocaleString()} chars
                    {pasteModal.content.length < 20 && pasteModal.content.length > 0 && (
                      <span className="text-red-400 ml-2">— need at least 20 characters</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => setPasteModal(p => ({ ...p, open: false }))}
                    className="font-mono text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasteSubmit}
                    disabled={pasteModal.content.trim().length < 20 || pasteModal.submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-semibold hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {pasteModal.submitting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Zap className="w-3.5 h-3.5" />
                    )}
                    {pasteModal.submitting ? "Crystallizing…" : "Crystallize"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Link Card ─────────────────────────────────────────────────────────────────

function LinkCard({ link, isExpanded, onToggle, onRemove }: {
  link: ImportedLink;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const r = link.result;
  const layerMeta = r ? LAYER_META[r.layer] : null;

  const borderColor = link.status === "done" ? "border-primary/20 bg-primary/3"
    : link.status === "error" ? "border-red-500/20 bg-red-500/3"
    : link.status === "duplicate" ? "border-yellow-500/20 bg-yellow-500/3"
    : link.status === "fetching" ? "border-primary/30 bg-primary/5"
    : "border-border/30 bg-card/20";

  return (
    <div className={`rounded-xl border transition-all duration-200 ${borderColor}`}>
      <div className="flex items-start gap-3 p-4 cursor-pointer" onClick={onToggle}>
        <div className="mt-0.5 shrink-0">
          {link.status === "fetching" && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
          {link.status === "queued" && <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20" />}
          {link.status === "done" && <CheckCircle2 className="w-4 h-4 text-green-400" />}
          {link.status === "error" && <AlertCircle className="w-4 h-4 text-red-400" />}
          {link.status === "duplicate" && <Copy className="w-4 h-4 text-yellow-400" />}
        </div>
        <div className="flex-1 min-w-0">
          {r ? (
            <div className="font-serif text-sm text-foreground/80 line-clamp-1 mb-1">{r.title}</div>
          ) : (
            <div className="font-mono text-xs text-muted-foreground/50 truncate">
              {link.status === "fetching" ? "Fetching content…" : link.url}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {layerMeta && (
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
                style={{ borderColor: `${layerMeta.color}40`, color: layerMeta.color, backgroundColor: `${layerMeta.color}10` }}>
                {layerMeta.symbol} {layerMeta.label}
              </span>
            )}
            {r && <><span className="font-mono text-[9px] text-muted-foreground/40">{r.conceptCount} concepts</span><span className="font-mono text-[9px] text-muted-foreground/40">{(r.charCount / 1000).toFixed(1)}k chars</span></>}
            {link.status === "duplicate" && <span className="font-mono text-[9px] text-yellow-400/70">{link.error}</span>}
            {link.status === "error" && <span className="font-mono text-[9px] text-red-400/70">{link.error}</span>}
            <span className="font-mono text-[9px] text-muted-foreground/25 truncate max-w-[200px]">{link.url}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {r && <button onClick={e => { e.stopPropagation(); window.open(link.url, "_blank"); }} className="text-muted-foreground/20 hover:text-muted-foreground/60 transition-colors"><ExternalLink className="w-3.5 h-3.5" /></button>}
          <button onClick={e => { e.stopPropagation(); onRemove(); }} className="text-muted-foreground/20 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
          {r && <div className="text-muted-foreground/20">{isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}</div>}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && r && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-border/15 mt-1 pt-3">

              {/* Gap results inline */}
              {r.gaps && (r.gaps.missing.length > 0 || r.gaps.weak.length > 0) && (
                <div className="rounded-lg border border-yellow-500/15 bg-yellow-500/5 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="font-mono text-[9px] text-yellow-400/70 uppercase tracking-widest">Gap Analysis</div>
                    <span className="font-mono text-[9px] text-muted-foreground/40">
                      {Math.round(r.gaps.coverageScore * 100)}% coverage
                    </span>
                  </div>
                  {r.gaps.missing.length > 0 && (
                    <div>
                      <div className="font-mono text-[8px] text-muted-foreground/30 mb-1">Missing from graph:</div>
                      <div className="flex flex-wrap gap-1">
                        {r.gaps.missing.slice(0, 8).map(m => (
                          <span key={m} className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-red-500/20 text-red-400/60">{m}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {r.gaps.weak.length > 0 && (
                    <div>
                      <div className="font-mono text-[8px] text-muted-foreground/30 mb-1">Weak coverage:</div>
                      <div className="flex flex-wrap gap-1">
                        {r.gaps.weak.slice(0, 5).map(w => (
                          <span key={w.name} className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-yellow-500/20 text-yellow-400/60">{w.name} ({Math.round(w.coherence * 100)}%)</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {r.headings.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] text-muted-foreground/35 uppercase tracking-widest mb-2">Sections</div>
                  <div className="space-y-1">
                    {r.headings.slice(0, 8).map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-primary/30">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-mono text-xs text-foreground/50">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {r.keywords.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] text-muted-foreground/35 uppercase tracking-widest mb-2">Keywords</div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.keywords.slice(0, 14).map(k => (
                      <span key={k} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-primary/6 border border-primary/12 text-primary/50">{k}</span>
                    ))}
                  </div>
                </div>
              )}

              {r.recordId && (
                <div className="flex items-center gap-2 pt-1">
                  <Cpu className="w-3 h-3 text-muted-foreground/20" />
                  <span className="font-mono text-[9px] text-muted-foreground/25">Record: {r.recordId.slice(0, 16)}…</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

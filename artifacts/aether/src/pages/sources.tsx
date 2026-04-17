import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2, Plus, Loader2, CheckCircle2, AlertCircle, Trash2,
  Zap, ChevronDown, ChevronUp, ExternalLink, Tag, Globe,
  Cpu, Sparkles,
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

interface ImportedLink {
  id: string;
  url: string;
  status: "queued" | "fetching" | "done" | "error";
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
  };
  addedAt: Date;
}

const EXAMPLE_URLS = [
  "https://claude.ai/public/artifacts/...",
  "https://claude.site/artifacts/...",
  "https://en.wikipedia.org/wiki/...",
];

export default function SourcesPage() {
  const { toast } = useToast();

  const [urlInput, setUrlInput] = useState("");
  const [bulkInput, setBulkInput] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [layer, setLayer] = useState<AetherLayer>("auto");
  const [links, setLinks] = useState<ImportedLink[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addToQueue = (url: string): ImportedLink | null => {
    url = url.trim();
    if (!url || !url.startsWith("http")) return null;
    if (links.some(l => l.url === url)) return null; // dedupe
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
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/import/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: entry.url,
          layer: layer !== "auto" ? layer : undefined,
        }),
      });
      const data = await res.json();
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
        },
      });
      setExpandedId(entry.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      updateLink(entry.id, { status: "error", error: msg });
    }
  };

  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    setUrlInput("");
    const entry = addToQueue(url);
    if (entry) {
      await importLink(entry);
    } else {
      toast({ title: "Already added", description: "This URL is already in your import list.", className: "font-mono" });
    }
  };

  const handleBulkImport = async () => {
    const urls = bulkInput
      .split(/[\n,]+/)
      .map(u => u.trim())
      .filter(u => u.startsWith("http"));
    setBulkInput("");
    setShowBulk(false);
    const entries: ImportedLink[] = [];
    for (const url of urls) {
      const e = addToQueue(url);
      if (e) entries.push(e);
    }
    if (entries.length === 0) return;
    toast({ title: `Importing ${entries.length} links…`, className: "font-mono" });
    for (const e of entries) {
      await importLink(e);
    }
  };

  const removeLink = (id: string) => setLinks(prev => prev.filter(l => l.id !== id));

  const clearAll = () => setLinks([]);

  const statusCounts = {
    done: links.filter(l => l.status === "done").length,
    error: links.filter(l => l.status === "error").length,
    active: links.filter(l => l.status === "fetching" || l.status === "queued").length,
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">

      {/* ── Header ── */}
      <div>
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
          Knowledge Source Terminal
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
          Sources
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Paste Claude artifact links or any URL — AETHER fetches, parses, and
          crystallizes the content directly into the knowledge graph. Headings
          become concepts. Keywords become tags. Structure becomes coherence.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

        {/* ── Left: Input column ── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Main URL input */}
          <div className="rounded-xl border border-border/40 bg-card/30 p-6 space-y-5">

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Link2 className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest">
                Import Link
              </div>
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

              {/* Layer select */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-1.5 block">
                  AETHER Layer
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(Object.entries(LAYER_META) as [AetherLayer, typeof LAYER_META[AetherLayer]][]).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setLayer(k)}
                      className="px-2 py-1.5 rounded-lg border font-mono text-[10px] transition-all"
                      style={layer === k
                        ? { borderColor: `${v.color}60`, backgroundColor: `${v.color}15`, color: v.color }
                        : { borderColor: "var(--border)", color: "var(--muted-foreground)", opacity: 0.5 }
                      }
                    >
                      {v.symbol} {v.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!urlInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary text-primary-foreground font-mono text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <Zap className="w-4 h-4" />
                Crystallize
              </button>
            </form>

            {/* Bulk import toggle */}
            <div>
              <button
                onClick={() => setShowBulk(b => !b)}
                className="font-mono text-[10px] text-muted-foreground/40 hover:text-muted-foreground/70 flex items-center gap-1 transition-colors"
              >
                <Plus className="w-3 h-3" />
                Bulk import {showBulk ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              <AnimatePresence>
                {showBulk && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-3 space-y-2"
                  >
                    <textarea
                      value={bulkInput}
                      onChange={e => setBulkInput(e.target.value)}
                      placeholder={"Paste multiple URLs, one per line:\nhttps://claude.ai/public/artifacts/abc\nhttps://claude.ai/public/artifacts/xyz"}
                      rows={5}
                      className="w-full bg-background/60 border border-border rounded-xl px-4 py-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/25 focus:outline-none focus:border-primary/50 transition-all resize-none"
                    />
                    <button
                      onClick={handleBulkImport}
                      disabled={!bulkInput.trim()}
                      className="w-full py-2 rounded-lg border border-primary/30 text-primary font-mono text-xs hover:bg-primary/5 disabled:opacity-30 transition-all"
                    >
                      Import All
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Pipeline legend */}
          <div className="rounded-xl border border-border/20 p-5 space-y-3">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
              Crystallization Pipeline
            </div>
            {[
              { step: "01", label: "Fetch", desc: "URL retrieved with 12s timeout" },
              { step: "02", label: "Parse", desc: "HTML stripped → clean text extracted" },
              { step: "03", label: "Analyse", desc: "Headings, sections & keywords isolated" },
              { step: "04", label: "Layer", desc: "AETHER layer auto-detected from signals" },
              { step: "05", label: "Crystallize", desc: "Document + concepts seeded into graph" },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <span className="font-mono text-[9px] text-primary/40 mt-0.5 shrink-0">{s.step}</span>
                <div>
                  <div className="font-mono text-[10px] text-foreground/50">{s.label}</div>
                  <div className="font-mono text-[9px] text-muted-foreground/30">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Example URLs */}
          <div className="rounded-xl border border-border/20 p-5 space-y-3">
            <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest">
              Supported URL Patterns
            </div>
            {EXAMPLE_URLS.map(u => (
              <div key={u} className="font-mono text-[10px] text-muted-foreground/30 bg-background/40 rounded-lg px-3 py-2 border border-border/20">
                {u}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Import history ── */}
        <div className="xl:col-span-3 space-y-4">

          {/* Status bar */}
          {links.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                  {links.length} link{links.length !== 1 ? "s" : ""}
                </span>
                {statusCounts.done > 0 && (
                  <span className="font-mono text-[10px] text-green-400">
                    ✓ {statusCounts.done} done
                  </span>
                )}
                {statusCounts.error > 0 && (
                  <span className="font-mono text-[10px] text-red-400">
                    ✗ {statusCounts.error} failed
                  </span>
                )}
                {statusCounts.active > 0 && (
                  <span className="font-mono text-[10px] text-primary animate-pulse">
                    ◉ {statusCounts.active} active
                  </span>
                )}
              </div>
              <button
                onClick={clearAll}
                className="font-mono text-[10px] text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
              >
                Clear all
              </button>
            </motion.div>
          )}

          {/* Empty state */}
          {links.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 space-y-4 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-primary/30" />
              </div>
              <div className="font-serif text-lg text-muted-foreground/40">
                No sources imported yet
              </div>
              <div className="font-mono text-xs text-muted-foreground/25 max-w-xs leading-relaxed">
                Paste a Claude artifact link or any URL and hit Crystallize to begin
              </div>
            </motion.div>
          )}

          {/* Link cards */}
          <AnimatePresence initial={false}>
            {links.map(link => (
              <motion.div
                key={link.id}
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <LinkCard
                  link={link}
                  isExpanded={expandedId === link.id}
                  onToggle={() => setExpandedId(expandedId === link.id ? null : link.id)}
                  onRemove={() => removeLink(link.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Link Card ──────────────────────────────────────────────────────────────────

function LinkCard({
  link,
  isExpanded,
  onToggle,
  onRemove,
}: {
  link: ImportedLink;
  isExpanded: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const r = link.result;
  const layerMeta = r ? LAYER_META[r.layer] : null;

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      link.status === "done" ? "border-primary/20 bg-primary/3" :
      link.status === "error" ? "border-red-500/20 bg-red-500/3" :
      link.status === "fetching" ? "border-primary/30 bg-primary/5" :
      "border-border/30 bg-card/20"
    }`}>
      {/* Card header */}
      <div
        className="flex items-start gap-3 p-4 cursor-pointer"
        onClick={onToggle}
      >
        {/* Status icon */}
        <div className="mt-0.5 shrink-0">
          {link.status === "fetching" && (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          )}
          {link.status === "queued" && (
            <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/20" />
          )}
          {link.status === "done" && (
            <CheckCircle2 className="w-4 h-4 text-green-400" />
          )}
          {link.status === "error" && (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {r ? (
            <div className="font-serif text-sm text-foreground/80 line-clamp-1 mb-1">
              {r.title}
            </div>
          ) : (
            <div className="font-mono text-xs text-muted-foreground/50 truncate">
              {link.status === "fetching" ? "Fetching content…" : link.url}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-1">
            {/* Layer badge */}
            {layerMeta && (
              <span
                className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
                style={{ borderColor: `${layerMeta.color}40`, color: layerMeta.color, backgroundColor: `${layerMeta.color}10` }}
              >
                {layerMeta.symbol} {layerMeta.label}
              </span>
            )}

            {/* Stats */}
            {r && (
              <>
                <span className="font-mono text-[9px] text-muted-foreground/40">
                  {r.conceptCount} concepts
                </span>
                <span className="font-mono text-[9px] text-muted-foreground/40">
                  {(r.charCount / 1000).toFixed(1)}k chars
                </span>
              </>
            )}

            {/* Error msg */}
            {link.status === "error" && (
              <span className="font-mono text-[9px] text-red-400/80">
                {link.error}
              </span>
            )}

            {/* URL (always show small) */}
            <span className="font-mono text-[9px] text-muted-foreground/25 truncate max-w-[200px]">
              {link.url}
            </span>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {r && (
            <button
              onClick={e => { e.stopPropagation(); window.open(link.url, "_blank"); }}
              className="text-muted-foreground/20 hover:text-muted-foreground/60 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); onRemove(); }}
            className="text-muted-foreground/20 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {r && (
            <div className="text-muted-foreground/20">
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          )}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {isExpanded && r && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-0 space-y-4 border-t border-border/15 mt-1">

              {/* Headings */}
              {r.headings.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] text-muted-foreground/35 uppercase tracking-widest mb-2 mt-3">
                    Sections / Headings
                  </div>
                  <div className="space-y-1">
                    {r.headings.slice(0, 10).map((h, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="font-mono text-[9px] text-primary/30">{String(i + 1).padStart(2, "0")}</span>
                        <span className="font-mono text-xs text-foreground/50">{h}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Keywords */}
              {r.keywords.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] text-muted-foreground/35 uppercase tracking-widest mb-2">
                    Keywords Extracted
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.keywords.slice(0, 16).map(k => (
                      <span key={k} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-primary/6 border border-primary/12 text-primary/50">
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {r.tags.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] text-muted-foreground/35 uppercase tracking-widest mb-2">
                    Graph Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {r.tags.slice(0, 12).map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-background/60 border border-border/30 text-muted-foreground/40 flex items-center gap-1">
                        <Tag className="w-2 h-2" />{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Source link */}
              <div className="flex items-center gap-2 pt-1">
                <Cpu className="w-3 h-3 text-muted-foreground/20" />
                <span className="font-mono text-[9px] text-muted-foreground/25">
                  Doc ID: {r.docId}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

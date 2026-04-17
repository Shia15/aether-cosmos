import { useState, useRef, useCallback } from "react";
import { useListDocuments, useDeleteDocument } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Trash2, FolderOpen, X, Plus,
  Tag, ChevronDown, CheckCircle2, Loader2, AlertCircle, Sparkles,
  Link2, Globe, Zap,
} from "lucide-react";

type AetherLayer = "auto" | "mnesis" | "infernia" | "aletheia" | "reverie";
type DocType = "research" | "whitepaper" | "philosophical" | "technical" | "empirical" | "personal" | "other";

const LAYER_META: Record<AetherLayer, { label: string; symbol: string; color: string; desc: string }> = {
  auto:     { label: "Auto-Detect",  symbol: "~",   color: "#64748b", desc: "System assigns layer based on content" },
  mnesis:   { label: "MNĒSIS",       symbol: "~",   color: "#8b5cf6", desc: "Input substrate / raw memory field" },
  infernia: { label: "INFERNIA",     symbol: "|||", color: "#f97316", desc: "Constraint engine / compression layer" },
  aletheia: { label: "ALETHEIA",     symbol: "◇",   color: "#0ea5e9", desc: "Structural resolution / truth lattice" },
  reverie:  { label: "REVERIE",      symbol: "✧",   color: "#eab308", desc: "Radiative output / expression layer" },
};

const DOC_TYPES: { value: DocType; label: string }[] = [
  { value: "research",      label: "Research Paper" },
  { value: "whitepaper",    label: "White Paper" },
  { value: "philosophical", label: "Philosophical" },
  { value: "technical",     label: "Technical" },
  { value: "empirical",     label: "Empirical" },
  { value: "personal",      label: "Personal" },
  { value: "other",         label: "Other" },
];

interface QueuedFile {
  id: string;
  name: string;
  content: string;
  size: number;
  status: "pending" | "ingesting" | "done" | "error";
  title: string;
  layer: AetherLayer;
  docType: DocType;
  source: string;
  tags: string[];
  autoFilled?: boolean;
}

// ─── Content analyser ───────────────────────────────────────────────────────
// Reads a document's text and infers layer, docType, source, and tags
// so the queue card fields are pre-populated when a file is added.

const STOPWORDS = new Set([
  "the","and","for","are","but","not","you","all","any","can","had","her",
  "was","one","our","out","day","get","has","him","his","how","man","new",
  "now","old","see","two","way","who","its","did","let","put","say","she",
  "too","use","this","that","with","have","from","they","will","been","when",
  "more","than","into","some","what","there","their","which","about","would",
  "could","other","after","first","these","those","where","should","through",
]);

const LAYER_KEYWORDS: Record<Exclude<AetherLayer,"auto">, string[]> = {
  mnesis:   ["memory","substrate","raw","input","intake","embed","store","recall","signal","noise","entropy","multimodal","unstructured","field","mnesis"],
  infernia: ["compress","constraint","pressure","transform","pattern","infer","extract","encode","weight","parameter","gradient","loss","optimization","infernia"],
  aletheia: ["truth","coherence","resolve","lattice","stable","verify","validate","knowledge","graph","structure","crystallis","align","aletheia","logic","reason"],
  reverie:  ["output","express","emit","radiat","interpret","transmit","generat","synthesize","dream","render","reverie","response","answer","produce"],
};

const DOCTYPE_KEYWORDS: Record<Exclude<DocType,"other">, string[]> = {
  research:      ["abstract","introduction","methodology","results","conclusion","doi","arxiv","citation","references","hypothesis","experiment","findings"],
  whitepaper:    ["executive summary","whitepaper","white paper","proposal","architecture","overview","solution","framework","strategy","roadmap"],
  philosophical: ["consciousness","phenomenology","epistemic","ontolog","metaphys","being","mind","qualia","perception","intentionality","meaning","awareness"],
  technical:     ["function","class","module","api","algorithm","implementation","interface","library","code","runtime","database","system","protocol"],
  empirical:     ["dataset","measurement","observation","trial","sample","control","variable","statistic","correlation","regression","survey","quantitative"],
  personal:      ["i believe","i think","my experience","i feel","personal","journal","diary","note","reflection","memoir","autobiography"],
};

function analyzeContent(
  content: string,
  filename: string,
): { layer: AetherLayer; docType: DocType; source: string; tags: string[] } {
  const lower = content.toLowerCase();

  // ── Layer detection ──────────────────────────────────────────────────────
  const layerScores: Record<Exclude<AetherLayer,"auto">, number> = {
    mnesis: 0, infernia: 0, aletheia: 0, reverie: 0,
  };
  for (const [layer, words] of Object.entries(LAYER_KEYWORDS) as [Exclude<AetherLayer,"auto">, string[]][]) {
    for (const w of words) layerScores[layer] += (lower.match(new RegExp(w, "g")) ?? []).length;
  }
  const topLayer = (Object.entries(layerScores) as [Exclude<AetherLayer,"auto">, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const layer: AetherLayer = topLayer[1] > 0 ? topLayer[0] : "auto";

  // ── DocType detection ────────────────────────────────────────────────────
  const typeScores: Record<Exclude<DocType,"other">, number> = {
    research: 0, whitepaper: 0, philosophical: 0, technical: 0, empirical: 0, personal: 0,
  };
  for (const [type, words] of Object.entries(DOCTYPE_KEYWORDS) as [Exclude<DocType,"other">, string[]][]) {
    for (const w of words) typeScores[type] += (lower.match(new RegExp(w, "g")) ?? []).length;
  }
  const topType = (Object.entries(typeScores) as [Exclude<DocType,"other">, number][])
    .sort((a, b) => b[1] - a[1])[0];
  const docType: DocType = topType[1] > 0 ? topType[0] : "other";

  // ── Source / author detection ────────────────────────────────────────────
  let source = "";
  const authorPatterns = [
    /^author[s]?\s*[:–-]\s*(.+)/im,
    /^by\s+([A-Z][a-z]+ [A-Z][a-z]+.*)/m,
    /^written by\s+(.+)/im,
    /^([A-Z][a-z]+ [A-Z][a-z]+)\s*\n/m,  // "Firstname Lastname" on its own line
  ];
  for (const pat of authorPatterns) {
    const m = content.match(pat);
    if (m?.[1]) { source = m[1].trim().slice(0, 80); break; }
  }
  // fallback: check for URL in first 500 chars
  if (!source) {
    const urlMatch = content.slice(0, 500).match(/https?:\/\/[^\s]+/);
    if (urlMatch) source = urlMatch[0].slice(0, 80);
  }

  // ── Tag extraction ───────────────────────────────────────────────────────
  // Tokenise, filter stopwords + short words, count frequency, take top 6
  const words = lower
    .replace(/[^a-z\s-]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 4 && !STOPWORDS.has(w));

  const freq: Record<string, number> = {};
  for (const w of words) freq[w] = (freq[w] ?? 0) + 1;

  const tags = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([w]) => w.replace(/-+/g, "-").slice(0, 24))
    .filter(w => w.length > 3);

  // Also include filename-derived tags
  const fileTag = filename.replace(/\.[^/.]+$/, "").toLowerCase().replace(/[\s_]+/g, "-");
  if (fileTag && !tags.includes(fileTag) && fileTag.length > 2) tags.unshift(fileTag);
  
  return { layer, docType, source, tags: tags.slice(0, 6) };
}

export default function UploadPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: documents, isLoading } = useListDocuments();
  const deleteDoc = useDeleteDocument();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manual text entry
  const [manualTitle, setManualTitle] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [manualLayer, setManualLayer] = useState<AetherLayer>("auto");
  const [manualDocType, setManualDocType] = useState<DocType>("other");
  const [manualSource, setManualSource] = useState("");
  const [manualTags, setManualTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isIngesting, setIsIngesting] = useState(false);

  // URL import
  const [urlInput, setUrlInput] = useState("");
  const [urlLayer, setUrlLayer] = useState<AetherLayer>("auto");
  const [urlDocType, setUrlDocType] = useState<DocType>("other");
  const [urlTagInput, setUrlTagInput] = useState("");
  const [urlTags, setUrlTags] = useState<string[]>([]);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlResult, setUrlResult] = useState<{
    title: string; layer: string; docType: string; charCount: number;
    conceptCount: number; headings: string[]; keywords: string[];
  } | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  // File queue
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const readFile = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target?.result as string ?? "");
      reader.onerror = rej;
      reader.readAsText(file);
    });

  const addFilesToQueue = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f =>
      f.type === "text/plain" || f.name.endsWith(".txt") || f.name.endsWith(".md") || f.name.endsWith(".rst")
    );
    for (const file of arr) {
      const content = await readFile(file);
      const { layer, docType, source, tags } = analyzeContent(content, file.name);
      const qf: QueuedFile = {
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        content,
        size: file.size,
        status: "pending",
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " "),
        layer,
        docType,
        source,
        tags,
        autoFilled: true,
      };
      setQueue(q => [...q, qf]);
      setExpandedId(qf.id);
    }
  }, []);

  const onFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFilesToQueue(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) addFilesToQueue(e.dataTransfer.files);
  };

  const updateQueued = (id: string, patch: Partial<QueuedFile>) =>
    setQueue(q => q.map(f => f.id === id ? { ...f, ...patch } : f));

  const removeQueued = (id: string) => setQueue(q => q.filter(f => f.id !== id));

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !manualTags.includes(t)) setManualTags(prev => [...prev, t]);
    setTagInput("");
  };

  const addQueuedTag = (id: string, tag: string, current: string[]) => {
    const t = tag.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !current.includes(t)) updateQueued(id, { tags: [...current, t] });
  };

  const ingestOne = async (payload: {
    title: string; content: string; layer: AetherLayer;
    docType: DocType; source: string; tags: string[];
  }) => {
    const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
    const res = await fetch(`${base}/api/documents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Ingestion failed");
    return res.json();
  };

  const handleManualIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim() || !manualContent.trim()) {
      toast({ title: "Incomplete", description: "Title and content are required.", variant: "destructive" });
      return;
    }
    setIsIngesting(true);
    try {
      await ingestOne({ title: manualTitle, content: manualContent, layer: manualLayer, docType: manualDocType, source: manualSource, tags: manualTags });
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      toast({ title: "Ingested", description: "Document crystallized into the knowledge graph.", className: "font-mono" });
      setManualTitle(""); setManualContent(""); setManualSource(""); setManualTags([]); setManualLayer("auto"); setManualDocType("other");
    } catch {
      toast({ title: "Failed", description: "Ingestion error.", variant: "destructive" });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleUrlImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = urlInput.trim();
    if (!url) return;
    setUrlLoading(true);
    setUrlResult(null);
    setUrlError(null);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";
      const res = await fetch(`${base}/api/import/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          layer: urlLayer !== "auto" ? urlLayer : undefined,
          docType: urlDocType !== "other" ? urlDocType : undefined,
          tags: urlTags,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setUrlResult({
        title: data.document.title,
        layer: data.document.layer,
        docType: data.document.docType,
        charCount: data.document.charCount,
        conceptCount: data.document.conceptCount,
        headings: data.extraction.headings,
        keywords: data.extraction.keywords,
      });
      queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
      toast({ title: "URL Ingested", description: `"${data.document.title}" crystallized — ${data.document.conceptCount} concepts extracted.`, className: "font-mono" });
      setUrlInput("");
      setUrlTags([]);
      setUrlLayer("auto");
      setUrlDocType("other");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      setUrlError(msg);
      toast({ title: "Import Failed", description: msg, variant: "destructive" });
    } finally {
      setUrlLoading(false);
    }
  };

  const addUrlTag = () => {
    const t = urlTagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !urlTags.includes(t)) setUrlTags(prev => [...prev, t]);
    setUrlTagInput("");
  };

  const ingestQueue = async () => {
    const pending = queue.filter(f => f.status === "pending");
    for (const f of pending) {
      updateQueued(f.id, { status: "ingesting" });
      try {
        await ingestOne({ title: f.title, content: f.content, layer: f.layer, docType: f.docType, source: f.source, tags: f.tags });
        updateQueued(f.id, { status: "done" });
      } catch {
        updateQueued(f.id, { status: "error" });
      }
    }
    queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
    toast({ title: `${pending.length} file(s) ingested`, className: "font-mono" });
  };

  const handleDelete = async (id: string) => {
    await deleteDoc.mutateAsync({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() }),
    });
  };

  return (
    <div className="h-full overflow-y-auto px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <div className="font-mono text-xs text-primary tracking-[0.3em] mb-3 uppercase">
          Knowledge Ingestion Terminal
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-foreground mb-4">
          Ingest
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Feed documents into the crystallization engine. Assign each document
          to an AETHER layer, type, and tag set — the info layering controls how
          concepts are weighted and related across the knowledge graph.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* ── Left: inputs ── */}
        <div className="space-y-6">

          {/* File drop zone */}
          <div
            className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 cursor-pointer ${
              isDragging ? "border-primary bg-primary/5" : "border-border/40 hover:border-border/70"
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,.md,.rst,text/plain"
              className="hidden"
              onChange={onFileInput}
            />
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
            <div className="font-mono text-sm text-muted-foreground/60 mb-1">
              Drop files here or click to browse
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/30">
              .txt · .md · .rst — multiple files supported
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border/40 font-mono text-xs text-muted-foreground hover:text-foreground hover:border-border transition-all"
            >
              <FolderOpen className="w-3.5 h-3.5" /> Browse Files
            </button>
          </div>

          {/* File queue */}
          <AnimatePresence>
            {queue.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
                    File Queue ({queue.filter(f => f.status === "pending").length} pending)
                  </div>
                  <div className="flex gap-2">
                    {queue.some(f => f.status === "pending") && (
                      <button
                        onClick={ingestQueue}
                        className="font-mono text-[10px] px-3 py-1.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                      >
                        Ingest All
                      </button>
                    )}
                    <button
                      onClick={() => setQueue([])}
                      className="font-mono text-[10px] px-3 py-1.5 rounded border border-border/40 text-muted-foreground hover:text-foreground transition-all"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {queue.map(f => (
                  <QueueCard
                    key={f.id}
                    file={f}
                    isExpanded={expandedId === f.id}
                    onToggle={() => setExpandedId(expandedId === f.id ? null : f.id)}
                    onUpdate={(p) => updateQueued(f.id, p)}
                    onRemove={() => removeQueued(f.id)}
                    onAddTag={(tag) => addQueuedTag(f.id, tag, f.tags)}
                    onRemoveTag={(tag) => updateQueued(f.id, { tags: f.tags.filter(t => t !== tag) })}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── URL / Link Import ── */}
          <div className="rounded-xl border border-border/30 p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-primary/60" />
              <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest flex-1">
                Link Import
              </div>
              <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-primary/20 text-primary/50 bg-primary/5">
                URL → Graph
              </span>
            </div>

            <form onSubmit={handleUrlImport} className="space-y-4">
              {/* URL input */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">
                  URL
                </label>
                <div className="relative">
                  <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/30" />
                  <input
                    value={urlInput}
                    onChange={e => { setUrlInput(e.target.value); setUrlError(null); setUrlResult(null); }}
                    placeholder="https://claude.ai/public/artifacts/... or any URL"
                    className="w-full bg-background/50 border border-border rounded-lg pl-9 pr-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
                    disabled={urlLoading}
                  />
                </div>
              </div>

              {/* Layer + Type */}
              <div className="grid grid-cols-2 gap-3">
                <LayerSelect value={urlLayer} onChange={setUrlLayer} />
                <TypeSelect value={urlDocType} onChange={setUrlDocType} />
              </div>

              {/* Tags */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">
                  Tags <span className="text-muted-foreground/30">(optional)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    value={urlTagInput}
                    onChange={e => setUrlTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addUrlTag(); } }}
                    placeholder="add tag..."
                    className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
                    disabled={urlLoading}
                  />
                  <button type="button" onClick={addUrlTag}
                    className="px-3 py-2 rounded-lg border border-border/40 text-muted-foreground hover:text-foreground transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {urlTags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {urlTags.map(t => (
                      <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-primary/8 border border-primary/20 text-primary/60 flex items-center gap-1">
                        <Tag className="w-2 h-2" />{t}
                        <button type="button" onClick={() => setUrlTags(prev => prev.filter(x => x !== t))}
                          className="text-muted-foreground/40 hover:text-destructive transition-colors ml-0.5">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Error */}
              <AnimatePresence>
                {urlError && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="flex items-start gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/5">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                    <span className="font-mono text-xs text-red-400">{urlError}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <button
                type="submit"
                disabled={urlLoading || !urlInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {urlLoading
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Fetching & Crystallizing…</>
                  : <><Zap className="w-3.5 h-3.5" /> Import URL</>}
              </button>
            </form>

            {/* Result */}
            <AnimatePresence>
              {urlResult && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="font-mono text-xs text-green-400">Crystallized</span>
                  </div>
                  <div className="font-serif text-sm text-foreground/80 line-clamp-2">{urlResult.title}</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: LAYER_META[urlResult.layer as AetherLayer]?.label ?? urlResult.layer, color: LAYER_META[urlResult.layer as AetherLayer]?.color ?? "#64748b" },
                    ].map(b => (
                      <span key={b.label} className="font-mono text-[9px] px-2 py-0.5 rounded border"
                        style={{ borderColor: `${b.color}40`, color: b.color }}>
                        {b.label}
                      </span>
                    ))}
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-border/30 text-muted-foreground/50">
                      {urlResult.conceptCount} concepts
                    </span>
                    <span className="font-mono text-[9px] px-2 py-0.5 rounded border border-border/30 text-muted-foreground/50">
                      {(urlResult.charCount / 1000).toFixed(1)}k chars
                    </span>
                  </div>
                  {urlResult.headings.length > 0 && (
                    <div>
                      <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1.5">Sections Detected</div>
                      <div className="flex flex-wrap gap-1">
                        {urlResult.headings.slice(0, 8).map(h => (
                          <span key={h} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-background/60 border border-border/30 text-muted-foreground/50 line-clamp-1 max-w-[180px]">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {urlResult.keywords.length > 0 && (
                    <div>
                      <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1.5">Keywords Extracted</div>
                      <div className="flex flex-wrap gap-1">
                        {urlResult.keywords.slice(0, 12).map(k => (
                          <span key={k} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/5 border border-primary/15 text-primary/50">
                            {k}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Manual text entry */}
          <div className="rounded-xl border border-border/30 p-6 space-y-5">
            <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest">
              Manual Text Entry
            </div>

            <form onSubmit={handleManualIngest} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">Title</label>
                <input
                  value={manualTitle}
                  onChange={e => setManualTitle(e.target.value)}
                  placeholder="Document title..."
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2.5 font-serif text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              {/* Layer + Type row */}
              <div className="grid grid-cols-2 gap-3">
                <LayerSelect value={manualLayer} onChange={setManualLayer} />
                <TypeSelect value={manualDocType} onChange={setManualDocType} />
              </div>

              <div>
                <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">Source / Author</label>
                <input
                  value={manualSource}
                  onChange={e => setManualSource(e.target.value)}
                  placeholder="Author, institution, or URL..."
                  className="w-full bg-background/50 border border-border rounded-lg px-4 py-2.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">Tags</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {manualTags.map(t => (
                    <span key={t} className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border border-primary/30 text-primary bg-primary/5">
                      {t}
                      <button type="button" onClick={() => setManualTags(prev => prev.filter(x => x !== t))}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }}
                    placeholder="Add tag..."
                    className="flex-1 bg-background/50 border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <button type="button" onClick={() => addTag(tagInput)} className="px-3 py-2 rounded-lg border border-border/40 hover:border-primary/40 text-muted-foreground hover:text-primary transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5 flex justify-between">
                  <span>Content</span>
                  <span className="text-primary/40">{manualContent.length} chars</span>
                </label>
                <textarea
                  value={manualContent}
                  onChange={e => setManualContent(e.target.value)}
                  placeholder="Paste text content here..."
                  className="w-full h-40 bg-background/50 border border-border rounded-lg p-4 font-mono text-xs text-foreground placeholder:text-muted-foreground/30 resize-none focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isIngesting}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-mono text-xs tracking-widest uppercase hover:bg-primary/90 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {isIngesting ? <><Loader2 className="w-4 h-4 animate-spin" /> Ingesting...</> : "Crystallize into Graph"}
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: archive ── */}
        <div className="space-y-4">
          <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest border-b border-border pb-3 flex items-center justify-between">
            <span>Archive</span>
            {documents && <span className="text-muted-foreground/30">{documents.length} documents</span>}
          </div>

          {isLoading ? (
            [1,2,3].map(i => <div key={i} className="h-24 rounded-lg border border-border/20 animate-pulse" />)
          ) : documents?.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-border/20 rounded-xl">
              <AlertCircle className="w-8 h-8 mx-auto mb-3 text-muted-foreground/20" />
              <div className="font-serif italic text-muted-foreground/40">Archive empty.</div>
            </div>
          ) : (
            <div className="space-y-2">
              {documents?.map((doc: any) => (
                <ArchiveCard key={doc.id} doc={doc} onDelete={() => handleDelete(doc.id)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}

// ── Queue Card ──
function QueueCard({ file, isExpanded, onToggle, onUpdate, onRemove, onAddTag, onRemoveTag }: {
  file: QueuedFile;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (p: Partial<QueuedFile>) => void;
  onRemove: () => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
}) {
  const [tagInput, setTagInput] = useState("");

  const statusIcon = {
    pending:   <FileText className="w-4 h-4 text-muted-foreground/50" />,
    ingesting: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
    done:      <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    error:     <AlertCircle className="w-4 h-4 text-red-400" />,
  }[file.status];

  const layerMeta = LAYER_META[file.layer];

  return (
    <div className={`rounded-lg border overflow-hidden transition-all ${file.autoFilled ? "border-primary/20" : "border-border/40"}`}>
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/2 transition-all"
        onClick={onToggle}
      >
        {statusIcon}
        <div className="flex-1 min-w-0">
          <div className="font-mono text-xs text-foreground/80 truncate">{file.name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-[9px] text-muted-foreground/40">
              {(file.size / 1024).toFixed(1)} KB · {file.content.split(/\s+/).length} words
            </span>
            {file.autoFilled && (
              <span className="flex items-center gap-0.5 font-mono text-[9px] text-primary/50">
                <Sparkles className="w-2.5 h-2.5" /> auto-filled
              </span>
            )}
          </div>
        </div>
        <div className="font-mono text-[10px] shrink-0" style={{ color: layerMeta.color }}>
          {layerMeta.symbol} {layerMeta.label}
        </div>
        {file.status === "pending" && (
          <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-muted-foreground/30 hover:text-red-400 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {file.status === "pending" && (
          <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/30 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && file.status === "pending" && (
          <motion.div
            initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border/30 pt-3">
              {file.autoFilled && (
                <div className="flex items-center gap-1.5 font-mono text-[9px] text-primary/40 bg-primary/5 border border-primary/10 rounded px-2 py-1">
                  <Sparkles className="w-2.5 h-2.5 shrink-0" />
                  Fields detected from content — review and adjust as needed
                </div>
              )}
              <div>
                <label className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1 block">Title</label>
                <input
                  value={file.title}
                  onChange={e => onUpdate({ title: e.target.value, autoFilled: false })}
                  className="w-full bg-background/50 border border-border/40 rounded px-3 py-1.5 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <LayerSelect value={file.layer} onChange={layer => onUpdate({ layer, autoFilled: false })} compact />
                <TypeSelect value={file.docType} onChange={docType => onUpdate({ docType, autoFilled: false })} compact />
              </div>
              <div>
                <label className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1 block">Source</label>
                <input
                  value={file.source}
                  onChange={e => onUpdate({ source: e.target.value })}
                  placeholder="Author or source..."
                  className="w-full bg-background/50 border border-border/40 rounded px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div>
                <label className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-1 block">Tags</label>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {file.tags.map(t => (
                    <span key={t} className="flex items-center gap-1 font-mono text-[9px] px-1.5 py-0.5 rounded border border-primary/20 text-primary/70">
                      {t}<button onClick={() => onRemoveTag(t)}><X className="w-2 h-2" /></button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-1.5">
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); onAddTag(tagInput); setTagInput(""); } }}
                    placeholder="tag..."
                    className="flex-1 bg-background/50 border border-border/40 rounded px-2 py-1 font-mono text-[10px] text-foreground placeholder:text-muted-foreground/20 focus:outline-none focus:border-primary/50 transition-all"
                  />
                  <button onClick={() => { onAddTag(tagInput); setTagInput(""); }} className="px-2 py-1 rounded border border-border/30 text-muted-foreground/50 hover:text-primary transition-all text-[10px]">+</button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Archive Card ──
function ArchiveCard({ doc, onDelete }: { doc: any; onDelete: () => void }) {
  const layerMeta = LAYER_META[(doc.layer as AetherLayer) ?? "auto"];
  return (
    <div className="group rounded-lg border border-border/20 hover:border-border/40 p-4 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded border shrink-0 flex items-center justify-center font-mono text-xs mt-0.5"
          style={{ borderColor: `${layerMeta.color}40`, color: layerMeta.color, background: `${layerMeta.color}08` }}>
          {layerMeta.symbol}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-serif text-sm text-foreground/80 line-clamp-1 mb-1">{doc.title}</div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
              style={{ borderColor: `${layerMeta.color}30`, color: layerMeta.color }}>
              {layerMeta.label}
            </span>
            {doc.docType && doc.docType !== "other" && (
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border/30 text-muted-foreground/50">
                {DOC_TYPES.find(d => d.value === doc.docType)?.label ?? doc.docType}
              </span>
            )}
            <span className="font-mono text-[9px] text-muted-foreground/30">
              {doc.conceptCount} concepts
            </span>
            {doc.charCount && (
              <span className="font-mono text-[9px] text-muted-foreground/30">
                {(doc.charCount / 1000).toFixed(1)}k chars
              </span>
            )}
          </div>
          {doc.tags && doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {doc.tags.map((t: string) => (
                <span key={t} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/5 border border-primary/15 text-primary/60 flex items-center gap-1">
                  <Tag className="w-2 h-2" />{t}
                </span>
              ))}
            </div>
          )}
          {doc.source && (
            <div className="font-mono text-[9px] text-muted-foreground/30 mt-1 truncate">
              {doc.source}
            </div>
          )}
        </div>
        <button
          onClick={onDelete}
          className="text-muted-foreground/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Reusable selects ──
function LayerSelect({ value, onChange, compact }: { value: AetherLayer; onChange: (v: AetherLayer) => void; compact?: boolean }) {
  const meta = LAYER_META[value];
  return (
    <div>
      {!compact && <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">AETHER Layer</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value as AetherLayer)}
        className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 font-mono text-xs focus:outline-none focus:border-primary/50 transition-all appearance-none"
        style={{ color: meta.color }}
      >
        {(Object.entries(LAYER_META) as [AetherLayer, typeof LAYER_META[AetherLayer]][]).map(([k, v]) => (
          <option key={k} value={k} className="text-foreground bg-background">{v.symbol} {v.label}</option>
        ))}
      </select>
    </div>
  );
}

function TypeSelect({ value, onChange, compact }: { value: DocType; onChange: (v: DocType) => void; compact?: boolean }) {
  return (
    <div>
      {!compact && <label className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-1.5 block">Document Type</label>}
      <select
        value={value}
        onChange={e => onChange(e.target.value as DocType)}
        className="w-full bg-background/50 border border-border rounded-lg px-3 py-2 font-mono text-xs text-foreground focus:outline-none focus:border-primary/50 transition-all appearance-none"
      >
        {DOC_TYPES.map(t => (
          <option key={t.value} value={t.value} className="bg-background">{t.label}</option>
        ))}
      </select>
    </div>
  );
}

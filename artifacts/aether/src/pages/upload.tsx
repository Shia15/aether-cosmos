import { useState, useRef, useCallback, useEffect } from "react";
import { useListDocuments, useDeleteDocument } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Trash2, FolderOpen, X, Plus,
  Tag, ChevronDown, CheckCircle2, Loader2, AlertCircle, Sparkles,
  Link2, Globe, Zap, Eye, BookOpen, ArrowLeft, ExternalLink, Library,
} from "lucide-react";
import { extractPdfText, isPdfFile, isCodeFile, isTextFile, docTypFromFilename } from "@/lib/pdf-extract";

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

// ─── Seed Papers ─────────────────────────────────────────────────────────────
interface SeedPaper {
  id: string;
  title: string;
  authors: string;
  year: number;
  venue: string;
  url: string;
  layer: Exclude<AetherLayer, "auto">;
  theme: string;
  abstract: string;
}

const SEED_PAPERS: SeedPaper[] = [
  // MNĒSIS — input substrate, memory, raw signal
  {
    id: "world-models",
    title: "World Models",
    authors: "Ha, Schmidhuber",
    year: 2018, venue: "arXiv · 1803.10122",
    url: "https://arxiv.org/abs/1803.10122",
    layer: "mnesis", theme: "memory",
    abstract: "Can agents learn inside of their own dreams? A compressed generative world representation drives a controller.",
  },
  {
    id: "scaling-laws",
    title: "Scaling Laws for Neural Language Models",
    authors: "Kaplan et al.",
    year: 2020, venue: "arXiv · 2001.08361",
    url: "https://arxiv.org/abs/2001.08361",
    layer: "mnesis", theme: "substrate",
    abstract: "Power-law relationships between model size, data volume, compute budget, and cross-entropy loss.",
  },
  {
    id: "memory-networks",
    title: "Memory Networks",
    authors: "Weston, Chopra, Bordes",
    year: 2014, venue: "arXiv · 1410.3916",
    url: "https://arxiv.org/abs/1410.3916",
    layer: "mnesis", theme: "recall",
    abstract: "Long-term memory combined with inference components — an architecture for open QA tasks.",
  },
  {
    id: "retrieval-augmented",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP",
    authors: "Lewis et al.",
    year: 2020, venue: "arXiv · 2005.11401",
    url: "https://arxiv.org/abs/2005.11401",
    layer: "mnesis", theme: "retrieval",
    abstract: "RAG — parametric memory meets non-parametric retrieval from a dense vector store.",
  },
  // INFERNIA — compression, constraint, transformation
  {
    id: "attention",
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: 2017, venue: "NeurIPS",
    url: "https://arxiv.org/abs/1706.03762",
    layer: "infernia", theme: "architecture",
    abstract: "The Transformer — pure self-attention, no convolution or recurrence, trained in parallel.",
  },
  {
    id: "neural-ode",
    title: "Neural Ordinary Differential Equations",
    authors: "Chen, Rubanova, Bettencourt, Duvenaud",
    year: 2018, venue: "NeurIPS",
    url: "https://arxiv.org/abs/1806.07366",
    layer: "infernia", theme: "dynamics",
    abstract: "Hidden-state dynamics as a continuous ODE solved by black-box integrators — depth becomes a continuous variable.",
  },
  {
    id: "shannon",
    title: "A Mathematical Theory of Communication",
    authors: "Shannon",
    year: 1948, venue: "Bell System Technical Journal",
    url: "https://people.math.harvard.edu/~ctm/home/text/others/shannon/entropy/entropy.pdf",
    layer: "infernia", theme: "information",
    abstract: "Entropy, channel capacity, and the fundamental limits of lossless data transmission.",
  },
  {
    id: "diffusion-models",
    title: "Denoising Diffusion Probabilistic Models",
    authors: "Ho, Jain, Abbeel",
    year: 2020, venue: "arXiv · 2006.11239",
    url: "https://arxiv.org/abs/2006.11239",
    layer: "infernia", theme: "compression",
    abstract: "A diffusion Markov chain gradually adds noise; a learned reverse process reconstructs data.",
  },
  // ALETHEIA — truth, structure, knowledge graphs, emergence
  {
    id: "knowledge-graphs",
    title: "Knowledge Graphs",
    authors: "Hogan et al.",
    year: 2021, venue: "ACM CSUR",
    url: "https://arxiv.org/abs/2003.02320",
    layer: "aletheia", theme: "graph",
    abstract: "Comprehensive survey — knowledge graph creation, enrichment, quality assessment, and embedding.",
  },
  {
    id: "self-org-criticality",
    title: "Self-Organized Criticality",
    authors: "Bak, Tang, Wiesenfeld",
    year: 1987, venue: "Physical Review Letters",
    url: "https://link.aps.org/doi/10.1103/PhysRevLett.59.381",
    layer: "aletheia", theme: "emergence",
    abstract: "Complex systems naturally evolve to a critical state where small perturbations trigger scale-free avalanches.",
  },
  {
    id: "architecture-complexity",
    title: "The Architecture of Complexity",
    authors: "Simon",
    year: 1962, venue: "Proc. American Philosophical Society",
    url: "https://www.jstor.org/stable/985254",
    layer: "aletheia", theme: "hierarchy",
    abstract: "Complex systems are nearly-decomposable hierarchies — evolution and engineering converge on the same forms.",
  },
  {
    id: "morphogenesis",
    title: "The Chemical Basis of Morphogenesis",
    authors: "Turing",
    year: 1952, venue: "Philosophical Transactions B",
    url: "https://royalsocietypublishing.org/doi/10.1098/rstb.1952.0012",
    layer: "aletheia", theme: "pattern",
    abstract: "Reaction-diffusion systems as the mathematical mechanism behind biological pattern formation.",
  },
  // REVERIE — output, synthesis, expression, consciousness
  {
    id: "gans",
    title: "Generative Adversarial Networks",
    authors: "Goodfellow et al.",
    year: 2014, venue: "NeurIPS",
    url: "https://arxiv.org/abs/1406.2661",
    layer: "reverie", theme: "generation",
    abstract: "Two networks in adversarial game: a generative model learns the data distribution by fooling a discriminator.",
  },
  {
    id: "clip",
    title: "Learning Transferable Visual Models From Natural Language Supervision",
    authors: "Radford et al.",
    year: 2021, venue: "ICML",
    url: "https://arxiv.org/abs/2103.00020",
    layer: "reverie", theme: "multimodal",
    abstract: "CLIP — zero-shot visual recognition by training on 400M image-text pairs from the web.",
  },
  {
    id: "consciousness-matter",
    title: "Consciousness as a State of Matter",
    authors: "Tegmark",
    year: 2014, venue: "arXiv · 1401.1219",
    url: "https://arxiv.org/abs/1401.1219",
    layer: "reverie", theme: "consciousness",
    abstract: "Perceptronium — conditions under which matter is conscious, framed in terms of integrated information.",
  },
  {
    id: "iit",
    title: "Consciousness as Integrated Information: A Provisional Manifesto",
    authors: "Tononi",
    year: 2004, venue: "BMC Neuroscience",
    url: "https://bmcneurosci.biomedcentral.com/articles/10.1186/1471-2202-5-42",
    layer: "reverie", theme: "coherence",
    abstract: "Φ (phi) — a measure of integrated information as the quantity of consciousness in a system.",
  },
];

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

function UploadHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const packets: {x:number;y:number;progress:number;speed:number}[]=[];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      if(Math.random()<0.04) packets.push({x:cx-80+Math.random()*160,y:H-10,progress:0,speed:0.008+Math.random()*0.006});
      for(let i=packets.length-1;i>=0;i--){
        const p=packets[i];
        p.progress+=p.speed;
        const py=H-10-(H-20)*p.progress;
        ctx.beginPath();ctx.arc(p.x,py,2.5,0,Math.PI*2);ctx.fillStyle=`rgba(46,240,216,${0.5-p.progress*0.3})`;ctx.fill();
        if(p.progress>=1){ctx.beginPath();ctx.arc(p.x,20,5+Math.random()*8,0,Math.PI*2);ctx.fillStyle="rgba(46,240,216,0.15)";ctx.fill();packets.splice(i,1);}
      }
      ctx.beginPath();ctx.roundRect(cx-50,H-25,100,18,4);ctx.strokeStyle="rgba(46,240,216,0.3)";ctx.lineWidth=0.8;ctx.stroke();
      const pct=((t*0.3)%100)/100;
      ctx.beginPath();ctx.roundRect(cx-50,H-25,100*pct,18,4);ctx.fillStyle="rgba(46,240,216,0.08)";ctx.fill();
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UPLOAD · DOCUMENT INGESTION · KNOWLEDGE INTAKE · AETHER OS BATCH · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UploadPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: documents, isLoading } = useListDocuments();
  const deleteDoc = useDeleteDocument();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const urlFormRef = useRef<HTMLDivElement>(null);

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

  // Document viewer
  const [viewDoc, setViewDoc] = useState<any | null>(null);

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = (e) => res(e.target?.result as string ?? "");
      reader.onerror = rej;
      reader.readAsText(file);
    });

  const extractContent = async (file: File): Promise<string> => {
    if (isPdfFile(file)) {
      try {
        return await extractPdfText(file, 8000);
      } catch {
        return `[PDF: ${file.name} — text extraction failed, use manual entry]`;
      }
    }
    return readFileAsText(file);
  };

  const addFilesToQueue = useCallback(async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f =>
      isPdfFile(f) || isTextFile(f) || isCodeFile(f.name)
    );
    if (arr.length === 0) return;
    for (const file of arr) {
      const content = await extractContent(file);
      const inferredDocType = docTypFromFilename(file.name);
      const { layer, source, tags } = analyzeContent(content, file.name);
      const docType: DocType = (["research","whitepaper","philosophical","technical","empirical","personal"].includes(inferredDocType)
        ? inferredDocType
        : analyzeContent(content, file.name).docType) as DocType;
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

  const onImportPaper = (url: string) => {
    setUrlInput(url);
    setUrlResult(null);
    setUrlError(null);
    setTimeout(() => {
      urlFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 80);
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
      <div style={{flexShrink:0}}>
        <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden",marginBottom:16}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>UPLOAD · DOCUMENT INGESTION · KNOWLEDGE INTAKE · AETHER OS BATCH · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Packet stream + progress bar — the live AETHER upload ingestion simulation.</p></div>
          <UploadHeaderCanvas />
        </div>
      </div>
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
              accept=".pdf,.txt,.md,.rst,.py,.ipynb,.js,.ts,.jsx,.tsx,.r,.m,.cpp,.c,.cs,.java,.go,.rs,.sh,.sql,.tex,text/plain,application/pdf"
              className="hidden"
              onChange={onFileInput}
            />
            <Upload className="w-8 h-8 mx-auto mb-3 text-muted-foreground/40" />
            <div className="font-mono text-sm text-muted-foreground/60 mb-1">
              Drop files here or click to browse
            </div>
            <div className="font-mono text-[10px] text-muted-foreground/30 space-y-0.5">
              <div>.pdf · .txt · .md — white papers &amp; synthesis papers</div>
              <div>.py · .ipynb · .js · .ts · .r · .sh — computation programs</div>
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
          <div ref={urlFormRef} className="rounded-xl border border-border/30 p-6 space-y-5">
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
                <ArchiveCard key={doc.id} doc={doc} onDelete={() => handleDelete(doc.id)} onView={() => setViewDoc(doc)} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Seed Papers ── */}
      <SeedPapersPanel onImport={onImportPaper} />

      <div className="h-8" />

      {/* ── Document Viewer Overlay ── */}
      <AnimatePresence>
        {viewDoc && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex"
            onClick={() => setViewDoc(null)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="ml-auto w-full max-w-2xl h-full bg-background border-l border-border flex flex-col shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-6 border-b border-border/40 shrink-0">
                {(() => {
                  const lm = LAYER_META[(viewDoc.layer as AetherLayer) ?? "auto"];
                  return (
                    <div className="w-9 h-9 rounded border flex items-center justify-center font-mono text-sm shrink-0 mt-0.5"
                      style={{ borderColor: `${lm.color}40`, color: lm.color, background: `${lm.color}08` }}>
                      {lm.symbol}
                    </div>
                  );
                })()}
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-base text-foreground/90 mb-1 leading-snug">{viewDoc.title}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {(() => {
                      const lm = LAYER_META[(viewDoc.layer as AetherLayer) ?? "auto"];
                      return (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border"
                          style={{ borderColor: `${lm.color}30`, color: lm.color }}>
                          {lm.label}
                        </span>
                      );
                    })()}
                    {viewDoc.docType && viewDoc.docType !== "other" && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border/30 text-muted-foreground/50">
                        {DOC_TYPES.find((d: any) => d.value === viewDoc.docType)?.label ?? viewDoc.docType}
                      </span>
                    )}
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border/20 text-muted-foreground/30">
                      {viewDoc.conceptCount} concepts
                    </span>
                    {viewDoc.charCount && (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded border border-border/20 text-muted-foreground/30">
                        {(viewDoc.charCount / 1000).toFixed(1)}k chars
                      </span>
                    )}
                  </div>
                  {viewDoc.source && (
                    <div className="font-mono text-[9px] text-muted-foreground/30 mt-1 truncate">{viewDoc.source}</div>
                  )}
                  {viewDoc.tags && viewDoc.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {viewDoc.tags.map((t: string) => (
                        <span key={t} className="flex items-center gap-0.5 font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/5 border border-primary/15 text-primary/60">
                          <Tag className="w-2 h-2" />{t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => setViewDoc(null)}
                  className="text-muted-foreground/40 hover:text-foreground transition-colors shrink-0 p-1 -mt-1 -mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {viewDoc.content ? (
                  <pre className="font-mono text-xs text-foreground/60 whitespace-pre-wrap leading-relaxed break-words">
                    {viewDoc.content}
                  </pre>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground/30">
                    <div className="text-center">
                      <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <div className="font-mono text-xs">No content stored</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="shrink-0 px-6 py-3 border-t border-border/20 flex items-center justify-between">
                <button
                  onClick={() => setViewDoc(null)}
                  className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                >
                  <ArrowLeft className="w-3 h-3" /> Close
                </button>
                <div className="font-mono text-[9px] text-muted-foreground/20">
                  {viewDoc.createdAt ? new Date(viewDoc.createdAt).toLocaleString() : ""}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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

// ── Seed Papers Panel ──
function SeedPapersPanel({ onImport }: { onImport: (url: string) => void }) {
  const [activeLayer, setActiveLayer] = useState<Exclude<AetherLayer, "auto"> | "all">("all");

  const tabs: { key: Exclude<AetherLayer, "auto"> | "all"; label: string; color: string }[] = [
    { key: "all",      label: "All Papers",  color: "#64748b" },
    { key: "mnesis",   label: "MNĒSIS",      color: LAYER_META.mnesis.color },
    { key: "infernia", label: "INFERNIA",    color: LAYER_META.infernia.color },
    { key: "aletheia", label: "ALETHEIA",    color: LAYER_META.aletheia.color },
    { key: "reverie",  label: "REVERIE",     color: LAYER_META.reverie.color },
  ];

  const filtered = activeLayer === "all"
    ? SEED_PAPERS
    : SEED_PAPERS.filter(p => p.layer === activeLayer);

  return (
    <div className="rounded-xl border border-border/30 p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Library className="w-3.5 h-3.5 text-primary/60" />
        <div className="font-mono text-[10px] text-muted-foreground/50 uppercase tracking-widest flex-1">
          Seed Papers · Physical Literature Links
        </div>
        <span className="font-mono text-[9px] px-2 py-0.5 rounded-full border border-primary/20 text-primary/50 bg-primary/5">
          {SEED_PAPERS.length} papers
        </span>
      </div>

      <p className="font-mono text-[10px] text-muted-foreground/40 leading-relaxed max-w-2xl">
        Curated academic papers across AETHER themes. Click <span className="text-primary/60">Read</span> to open the source,
        or <span className="text-primary/60">Import ↓</span> to pre-fill the URL importer above and crystallize it into the graph.
      </p>

      {/* Layer filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveLayer(tab.key)}
            className="font-mono text-[9px] px-3 py-1 rounded border transition-all"
            style={activeLayer === tab.key ? {
              borderColor: `${tab.color}60`,
              color: tab.color,
              background: `${tab.color}12`,
            } : {
              borderColor: "rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.28)",
            }}
          >
            {tab.label}
            {tab.key !== "all" && (
              <span className="ml-1.5 opacity-50">
                {SEED_PAPERS.filter(p => p.layer === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Papers grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map(paper => {
          const lm = LAYER_META[paper.layer];
          return (
            <motion.div
              key={paper.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="group rounded-lg border border-border/20 hover:border-border/40 p-4 flex flex-col gap-3 transition-colors"
            >
              {/* Paper header */}
              <div className="flex items-start gap-2.5">
                <div
                  className="w-7 h-7 rounded border shrink-0 flex items-center justify-center font-mono text-[10px] mt-0.5"
                  style={{ borderColor: `${lm.color}40`, color: lm.color, background: `${lm.color}08` }}
                >
                  {lm.symbol}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-sm text-foreground/80 leading-snug line-clamp-2 mb-1">
                    {paper.title}
                  </div>
                  <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                    <span className="font-mono text-[9px] text-muted-foreground/45">{paper.authors}</span>
                    <span className="font-mono text-[9px] text-muted-foreground/25">·</span>
                    <span className="font-mono text-[9px] text-muted-foreground/30">{paper.year}</span>
                  </div>
                  <div className="font-mono text-[8px] text-muted-foreground/25 truncate mt-0.5">
                    {paper.venue}
                  </div>
                </div>
              </div>

              {/* Theme + abstract */}
              <div className="space-y-1.5 flex-1">
                <span
                  className="inline-block font-mono text-[8px] px-1.5 py-0.5 rounded border"
                  style={{ borderColor: `${lm.color}30`, color: `${lm.color}99` }}
                >
                  {paper.theme}
                </span>
                <p className="font-mono text-[10px] text-muted-foreground/40 leading-relaxed line-clamp-2">
                  {paper.abstract}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-1 mt-auto">
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded border border-border/30 font-mono text-[10px] text-muted-foreground/50 hover:text-foreground hover:border-border/60 transition-all"
                >
                  <ExternalLink className="w-3 h-3" /> Read
                </a>
                <button
                  onClick={() => onImport(paper.url)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded border font-mono text-[10px] transition-all"
                  style={{ borderColor: `${lm.color}30`, color: lm.color }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = `${lm.color}10`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = ""; }}
                >
                  <Zap className="w-3 h-3" /> Import ↓
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Archive Card ──
function ArchiveCard({ doc, onDelete, onView }: { doc: any; onDelete: () => void; onView: () => void }) {
  const layerMeta = LAYER_META[(doc.layer as AetherLayer) ?? "auto"];
  return (
    <div className="group rounded-lg border border-border/20 hover:border-border/40 p-4 transition-all">
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded border shrink-0 flex items-center justify-center font-mono text-xs mt-0.5"
          style={{ borderColor: `${layerMeta.color}40`, color: layerMeta.color, background: `${layerMeta.color}08` }}>
          {layerMeta.symbol}
        </div>
        <div className="flex-1 min-w-0">
          <button
            onClick={onView}
            className="font-serif text-sm text-foreground/80 line-clamp-1 mb-1 text-left hover:text-foreground transition-colors w-full"
          >
            {doc.title}
          </button>
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
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity">
          <button
            onClick={onView}
            className="p-1.5 rounded text-muted-foreground/40 hover:text-primary hover:bg-primary/5 transition-colors"
            title="Open document"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded text-muted-foreground/20 hover:text-red-400 hover:bg-red-400/5 transition-colors"
            title="Delete document"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
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

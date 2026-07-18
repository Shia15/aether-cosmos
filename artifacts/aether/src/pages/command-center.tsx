import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Link } from "wouter";
import { useSearchConcepts } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search as SearchIcon,
  Hexagon,
  Image as ImageIcon,
  FileText,
  Inbox,
  MessageSquare,
  Radar,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL || "/";
const API_BASE = BASE_URL.replace(/\/$/, "");
const IMAGE_INDEX_URL = `${BASE_URL}image-index.json`;

const GOLD = "#f5c84c";
const TEAL = "#2ef0d8";

// ── Source registry ──────────────────────────────────────────────────────────
type SourceKey = "concept" | "image" | "notion" | "intake" | "xpost";

const SOURCES: Record<SourceKey, { label: string; color: string; icon: typeof Hexagon }> = {
  concept: { label: "Concepts", color: GOLD, icon: Hexagon },
  image: { label: "Visual Library", color: "#FF9632", icon: ImageIcon },
  notion: { label: "Notion", color: "#c8b8ff", icon: FileText },
  intake: { label: "Intake Docs", color: TEAL, icon: Inbox },
  xpost: { label: "X Posts", color: "#7ec8ff", icon: MessageSquare },
};

const SOURCE_ORDER: SourceKey[] = ["concept", "image", "notion", "intake", "xpost"];

function tokenize(q: string): string[] {
  return q.toLowerCase().split(/\s+/).filter(Boolean);
}

function tokenScore(hay: string, tokens: string[]): number {
  if (!tokens.length) return 0;
  const h = hay.toLowerCase();
  let matched = 0;
  for (const t of tokens) if (h.includes(t)) matched += 1;
  return matched / tokens.length;
}

// ── Visual library ───────────────────────────────────────────────────────────
type ImageEntry = { file: string; dir: string; cat: string; video?: boolean };

const CAT_LABEL: Record<string, string> = {
  aether: "AETHER Architecture",
  cosmic: "Cosmic & Planetary",
  hardware: "Hardware & Prototypes",
  science: "Science & Engineering",
  narrative: "Narrative",
  emotional: "Emotional & Personal",
  visual: "AI Generative & Visual",
  video: "Video Clip",
  uncategorized: "Visual Library",
};

const SOURCE_SYN: Record<string, string> = {
  gpt_imgs: "gpt openai generated ai image render visual",
  linkedin_imgs: "linkedin professional post social image visual",
};

const IMAGE_INTENT = new Set([
  "image", "images", "picture", "pictures", "pic", "pics", "photo", "photos",
  "visual", "visuals", "render", "renders", "art", "artwork", "graphic",
  "graphics", "gallery", "video", "videos", "clip", "clips",
]);

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
              file: typeof d.file === "string" ? d.file : "",
              dir: typeof d.dir === "string" ? d.dir : "",
              cat: typeof d.cat === "string" && d.cat ? d.cat : "uncategorized",
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

// ── Intake docs (localStorage) ───────────────────────────────────────────────
type IntakeNode = { title: string; filename: string; layer: string; shells: string[]; hasAI: boolean; timestamp: number };

function readIntake(): IntakeNode[] {
  try {
    const raw = JSON.parse(localStorage.getItem("aether_intake_v1") ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.map((r) => {
      const o = r && typeof r === "object" ? (r as Record<string, unknown>) : {};
      return {
        title: typeof o.title === "string" ? o.title : "",
        filename: typeof o.filename === "string" ? o.filename : "",
        layer: typeof o.layer === "string" && o.layer ? o.layer : "N",
        shells: Array.isArray(o.shells) ? o.shells.filter((s): s is string => typeof s === "string") : [],
        hasAI: o.hasAI === true,
        timestamp: typeof o.timestamp === "number" && isFinite(o.timestamp) ? o.timestamp : 0,
      };
    });
  } catch {
    return [];
  }
}

// ── X posts (localStorage) ───────────────────────────────────────────────────
type XPost = { id: string; account: string; text: string; addedAt: number };

function readXPosts(): XPost[] {
  try {
    const raw = JSON.parse(localStorage.getItem("aether.xposts.v1") ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw.filter(
      (p): p is XPost =>
        !!p && typeof p === "object" &&
        typeof (p as XPost).id === "string" &&
        typeof (p as XPost).text === "string"
    );
  } catch {
    return [];
  }
}

// ── Notion search ────────────────────────────────────────────────────────────
type NotionHit = { id: string; title: string; url: string; edited: string };

type NotionRich = { plain_text?: string };
type NotionRaw = {
  id?: string;
  url?: string;
  last_edited_time?: string;
  properties?: { title?: { title?: NotionRich[] }; Name?: { title?: NotionRich[] } };
};

function notionTitle(p: NotionRaw): string {
  const arr = p.properties?.title?.title ?? p.properties?.Name?.title ?? [];
  return (arr[0]?.plain_text ?? "").trim() || "Untitled";
}

// ── Unified result type ──────────────────────────────────────────────────────
type Hit = {
  key: string;
  source: SourceKey;
  rel: number;
  title: string;
  sub: string;
  href?: string;
  external?: boolean;
  imageSrc?: string;
  isVideo?: boolean;
  snippet?: string;
};

// ── Page ─────────────────────────────────────────────────────────────────────
export default function CommandCenter() {
  const [query, setQuery] = useState("");
  const [activeQ, setActiveQ] = useState("");
  const [filter, setFilter] = useState<SourceKey | "all">("all");
  const [notionHits, setNotionHits] = useState<NotionHit[]>([]);
  const [notionLoading, setNotionLoading] = useState(false);
  const [notionError, setNotionError] = useState(false);
  const notionAbort = useRef<AbortController | null>(null);

  const imageIndex = useImageIndex();
  const [intake, setIntake] = useState<IntakeNode[]>(() => readIntake());
  const [xposts, setXposts] = useState<XPost[]>(() => readXPosts());

  useEffect(() => {
    const refresh = () => { setIntake(readIntake()); setXposts(readXPosts()); };
    window.addEventListener("storage", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("focus", refresh);
      notionAbort.current?.abort();
    };
  }, []);

  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search).get("q")?.trim();
      if (q) {
        setQuery(q);
        setActiveQ(q);
        runNotion(q);
      }
    } catch {
      // ignore malformed query strings
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: conceptResults, isFetching: conceptLoading } = useSearchConcepts(
    { q: activeQ, type: "semantic" },
    { query: { enabled: !!activeQ } }
  );

  const runNotion = useCallback((q: string) => {
    notionAbort.current?.abort();
    const ctrl = new AbortController();
    notionAbort.current = ctrl;
    setNotionHits([]);
    setNotionLoading(true);
    setNotionError(false);
    fetch(`${API_BASE}/api/notion/pages?q=${encodeURIComponent(q)}`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((data: { results?: NotionRaw[]; error?: string }) => {
        if (ctrl.signal.aborted) return;
        if (data.error) { setNotionError(true); setNotionHits([]); return; }
        setNotionHits(
          (data.results ?? [])
            .filter((p): p is NotionRaw => !!p && typeof p === "object" && typeof p.id === "string")
            .map((p) => ({
              id: p.id!,
              title: notionTitle(p),
              url: p.url ?? "",
              edited: p.last_edited_time ?? "",
            }))
        );
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setNotionError(true);
        setNotionHits([]);
      })
      .finally(() => { if (!ctrl.signal.aborted) setNotionLoading(false); });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setActiveQ(q);
    setIntake(readIntake());
    setXposts(readXPosts());
    runNotion(q);
  };

  const tokens = useMemo(() => tokenize(activeQ), [activeQ]);

  const hits = useMemo<Hit[]>(() => {
    if (!activeQ) return [];
    const out: Hit[] = [];

    (conceptResults ?? []).forEach((r, i) => {
      out.push({
        key: `c-${r.id}-${i}`,
        source: "concept",
        rel: r.relevance,
        title: r.name,
        sub: `${r.type} · coherence ${(r.coherence * 100).toFixed(0)}%`,
        snippet: r.snippet,
        href: "/graph-map",
      });
    });

    const hasIntent = tokens.some((t) => IMAGE_INTENT.has(t));
    imageIndex.forEach((it) => {
      const hay = `${it.file} ${it.dir} ${SOURCE_SYN[it.dir] ?? ""} ${CAT_LABEL[it.cat] ?? ""} ${it.cat} ${it.video ? "video clip motion" : ""}`;
      let rel = tokenScore(hay, tokens);
      if (rel === 0 && !hasIntent) return;
      if (hasIntent) rel = Math.max(rel, 0.45);
      out.push({
        key: `i-${it.dir}-${it.file}`,
        source: "image",
        rel: Math.min(1, rel),
        title: it.file,
        sub: `${CAT_LABEL[it.cat] ?? it.cat} · ${it.dir === "gpt_imgs" ? "GPT / OpenAI" : "LinkedIn"}`,
        imageSrc: `${BASE_URL}${it.dir}/${it.file}`,
        isVideo: it.video === true,
        external: true,
      });
    });

    notionHits.forEach((n) => {
      const rel = Math.max(0.5, tokenScore(n.title, tokens));
      out.push({
        key: `n-${n.id}`,
        source: "notion",
        rel,
        title: n.title,
        sub: `Notion page${n.edited ? ` · edited ${new Date(n.edited).toLocaleDateString()}` : ""}`,
        href: n.url || undefined,
        external: true,
      });
    });

    intake.forEach((d, i) => {
      const hay = `${d.title} ${d.filename} ${d.shells.join(" ")} ${d.layer}`;
      const rel = tokenScore(hay, tokens);
      if (rel === 0) return;
      out.push({
        key: `d-${i}-${d.filename || d.title}`,
        source: "intake",
        rel,
        title: d.title || d.filename || "Untitled",
        sub: `Layer ${d.layer}${d.shells.length ? ` · ${d.shells.slice(0, 3).join(", ")}` : ""}${d.hasAI ? " · AI-analyzed" : ""}`,
        href: "/aether-intake",
      });
    });

    xposts.forEach((p) => {
      const rel = tokenScore(p.text, tokens);
      if (rel === 0) return;
      out.push({
        key: `x-${p.id}`,
        source: "xpost",
        rel,
        title: p.text.length > 120 ? p.text.slice(0, 120) + "…" : p.text,
        sub: `${p.account}${p.addedAt ? ` · added ${new Date(p.addedAt).toLocaleDateString()}` : ""}`,
        href: "/x-grok",
      });
    });

    return out.sort((a, b) => b.rel - a.rel);
  }, [activeQ, conceptResults, imageIndex, notionHits, intake, xposts, tokens]);

  const counts = useMemo(() => {
    const c: Record<SourceKey, number> = { concept: 0, image: 0, notion: 0, intake: 0, xpost: 0 };
    hits.forEach((h) => { c[h.source] += 1; });
    return c;
  }, [hits]);

  const visible = useMemo(
    () => (filter === "all" ? hits : hits.filter((h) => h.source === filter)).slice(0, 120),
    [hits, filter]
  );

  const anyLoading = (conceptLoading && !conceptResults) || notionLoading;

  return (
    <div className="p-8 max-w-5xl mx-auto w-full space-y-6 h-full flex flex-col">
      <header className="space-y-4 shrink-0">
        <div className="flex items-center gap-3">
          <Radar className="w-8 h-8" style={{ color: GOLD }} />
          <div>
            <h1 className="text-4xl font-serif tracking-tight text-foreground">Command Centre</h1>
            <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mt-1">
              One query · five sources · fired in parallel
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search everything — concepts, visuals, Notion, intake docs, X posts…"
              className="pl-12 h-14 bg-card/50 border-white/10 font-mono text-lg focus-visible:ring-primary shadow-inner"
            />
          </div>
          <Button
            type="submit"
            className="h-14 px-8 font-mono tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Search All
          </Button>
        </form>

        <div className="flex gap-2 flex-wrap">
          <SourcePill
            active={filter === "all"}
            color={GOLD}
            label={`All · ${hits.length}`}
            onClick={() => setFilter("all")}
          />
          {SOURCE_ORDER.map((k) => {
            const s = SOURCES[k];
            return (
              <SourcePill
                key={k}
                active={filter === k}
                color={s.color}
                label={`${s.label} · ${counts[k]}`}
                onClick={() => setFilter(k)}
              />
            );
          })}
        </div>

        <div className="flex gap-4 flex-wrap font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span>Sources online:</span>
          <span style={{ color: GOLD }}>Knowledge Graph</span>
          <span style={{ color: SOURCES.image.color }}>{imageIndex.length} visuals</span>
          <span style={{ color: SOURCES.notion.color }}>{notionError ? "Notion — error" : "Notion live"}</span>
          <span style={{ color: SOURCES.intake.color }}>{intake.length} intake docs</span>
          <span style={{ color: SOURCES.xpost.color }}>{xposts.length} X posts</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-2 pb-8 space-y-3">
        {!activeQ && (
          <div className="text-center py-16 space-y-3">
            <Radar className="w-12 h-12 mx-auto opacity-30" style={{ color: GOLD }} />
            <p className="font-mono text-sm text-muted-foreground">
              Type a query above to search all five sources at once.
            </p>
            <p className="font-mono text-[11px] text-muted-foreground/60 max-w-lg mx-auto leading-relaxed">
              Knowledge graph concepts · 462-asset visual library · live Notion workspace ·
              Batch Intake archive · X post archive — interleaved by relevance in one list.
            </p>
          </div>
        )}

        {activeQ && anyLoading && visible.length === 0 && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {activeQ && !anyLoading && visible.length === 0 && (
          <div className="text-center py-16">
            <p className="font-mono text-sm text-muted-foreground">
              No results in {filter === "all" ? "any source" : SOURCES[filter as SourceKey].label} for "{activeQ}".
            </p>
          </div>
        )}

        {visible.length > 0 && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 flex-wrap font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span style={{ color: GOLD }}>{visible.length} results</span>
              {hits.length > visible.length && filter === "all" && (
                <span className="text-white/30 normal-case tracking-normal">(top {visible.length} shown)</span>
              )}
              {anyLoading && (
                <span className="inline-block w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              )}
            </div>
            {visible.map((h) => <HitCard key={h.key} hit={h} />)}
          </div>
        )}
      </div>
    </div>
  );
}

function SourcePill({ active, color, label, onClick }: { active: boolean; color: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-md border transition-all"
      style={{
        borderColor: active ? color : "rgba(255,255,255,0.1)",
        color: active ? color : "rgba(244,241,234,0.55)",
        background: active ? `${color}14` : "transparent",
      }}
    >
      {label}
    </button>
  );
}

function HitCard({ hit }: { hit: Hit }) {
  const s = SOURCES[hit.source];
  const Icon = s.icon;

  const body = (
    <Card className="p-4 bg-card border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
      <div className="flex items-center gap-4">
        {hit.imageSrc ? (
          <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden bg-black/40 border border-white/5">
            {hit.isVideo ? (
              <video src={hit.imageSrc} muted playsInline preload="metadata" className="w-full h-full object-cover" />
            ) : (
              <img src={hit.imageSrc} alt={hit.title} loading="lazy" className="w-full h-full object-cover" />
            )}
          </div>
        ) : (
          <div
            className="w-10 h-10 shrink-0 rounded-md flex items-center justify-center border"
            style={{ borderColor: `${s.color}33`, background: `${s.color}0d` }}
          >
            <Icon className="w-5 h-5" style={{ color: s.color }} />
          </div>
        )}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors truncate max-w-full">
              {hit.title}
            </h3>
            <Badge variant="outline" className="font-mono text-[9px] uppercase border-white/10 shrink-0" style={{ color: s.color }}>
              {s.label}
            </Badge>
            {hit.source === "notion" && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const q = encodeURIComponent(`Discuss this Notion page with me:\n\nTitle: "${hit.title}"\nURL: ${hit.href ?? ""}\n\nPlease summarise its key points and ask me what I'd like to explore.`);
                  window.location.href = `${BASE_URL}claude-chat?q=${q}`;
                }}
                className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wide border transition-colors hover:bg-white/5 cursor-pointer"
                style={{ color: "#c8b8ff", borderColor: "rgba(200,184,255,0.25)", background: "rgba(200,184,255,0.06)" }}
              >
                <MessageSquare className="w-2.5 h-2.5" />
                Claude
              </button>
            )}
          </div>
          <p className="text-muted-foreground font-mono text-[11px] truncate">{hit.sub}</p>
          {hit.snippet && (
            <p className="text-muted-foreground font-serif text-xs leading-relaxed line-clamp-2">"{hit.snippet}"</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-[9px] text-muted-foreground uppercase mb-0.5">Rel</div>
          <div className="font-mono text-base" style={{ color: s.color }}>{(hit.rel * 100).toFixed(0)}%</div>
        </div>
      </div>
    </Card>
  );

  if (hit.external && (hit.href || hit.imageSrc)) {
    return (
      <a href={hit.href || hit.imageSrc} target="_blank" rel="noreferrer" className="block">
        {body}
      </a>
    );
  }
  if (hit.href) {
    return (
      <Link href={hit.href} className="block">
        {body}
      </Link>
    );
  }
  return body;
}

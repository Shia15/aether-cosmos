import { useEffect, useState, useCallback } from "react";

/* ── palette ── */
const BG = "#04060d", PAN = "#090c18", PAN2 = "#0d1120", BORDER = "#182038";
const TEXT = "#b8cce8", MUTED = "#4a5e7c", DIM = "#2a3850";
const GOLD = "#ffb830", CYAN = "#3fd8d0", VIOLET = "#a87aff", GREEN = "#50d49a", ROSE = "#ff6b8a";

const ORCID_ID = "0009-0000-5537-1034";
const API_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

/* ── types ── */
interface OrcidWork {
  title: string;
  type: string;
  year: string | null;
  journal: string | null;
  doi: string | null;
  url: string | null;
  source: string; // 'orcid'
}

interface ArxivPaper {
  id: string;
  title: string;
  summary: string;
  authors: string[];
  published: string;
  link: string;
  category: string;
}

interface QueueEntry {
  id: string;
  title: string;
  notes: string;
  target: "nature" | "arxiv" | "other";
  status: "idea" | "drafting" | "ready";
  created: string;
}

/* ── helpers ── */
function tag(label: string, color: string) {
  return (
    <span style={{
      fontSize: 9, fontFamily: "monospace", padding: "2px 7px",
      borderRadius: 4, border: `1px solid ${color}44`, color,
      background: `${color}12`, letterSpacing: 1, textTransform: "uppercase" as const,
      whiteSpace: "nowrap" as const, flexShrink: 0,
    }}>{label}</span>
  );
}

function Section({ title, accent = CYAN, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, background: accent, borderRadius: 2, flexShrink: 0 }} />
        <h2 style={{ fontFamily: "monospace", fontSize: 13, color: accent, margin: 0, letterSpacing: 2, textTransform: "uppercase" }}>{title}</h2>
        <div style={{ flex: 1, height: 1, background: DIM }} />
      </div>
      {children}
    </section>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: PAN, border: `1px solid ${BORDER}`, borderRadius: 10,
      padding: "14px 18px", marginBottom: 10, ...style
    }}>
      {children}
    </div>
  );
}

/* ── ORCID profile banner ── */
function OrcidProfile({ person }: { person: { given: string; family: string; bio: string } | null }) {
  if (!person) return (
    <Card>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED, margin: 0 }}>Loading ORCID profile…</p>
    </Card>
  );
  return (
    <Card style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>
      {/* avatar placeholder */}
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: `${VIOLET}22`,
        border: `2px solid ${VIOLET}66`, display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontFamily: "monospace", fontSize: 20, color: VIOLET,
      }}>
        {person.given[0]}{person.family[0]}
      </div>
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
          <span style={{ fontFamily: "monospace", fontSize: 16, color: TEXT, fontWeight: 700 }}>
            {person.given} {person.family}
          </span>
          {tag("ORCID iD", GREEN)}
          <a
            href={`https://orcid.org/${ORCID_ID}`}
            target="_blank"
            rel="noreferrer"
            style={{ fontFamily: "monospace", fontSize: 11, color: GREEN, textDecoration: "none" }}
          >
            orcid.org/{ORCID_ID} ↗
          </a>
        </div>
        <p style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, margin: 0, lineHeight: 1.6 }}>
          {person.bio}
        </p>
      </div>
      {/* quick-action links */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, alignSelf: "center" }}>
        {[
          { label: "Edit ORCID Profile", url: "https://orcid.org/my-orcid", color: GREEN },
          { label: "Submit to arXiv", url: "https://arxiv.org/submit", color: CYAN },
          { label: "Research Square (Nature Preprint)", url: "https://www.researchsquare.com/submit", color: GOLD },
        ].map(l => (
          <a key={l.url} href={l.url} target="_blank" rel="noreferrer" style={{
            fontFamily: "monospace", fontSize: 10, color: l.color, textDecoration: "none",
            padding: "5px 12px", border: `1px solid ${l.color}44`, borderRadius: 5,
            background: `${l.color}10`, whiteSpace: "nowrap",
          }}>
            {l.label} ↗
          </a>
        ))}
      </div>
    </Card>
  );
}

/* ── tracked works ── */
function WorkCard({ work }: { work: OrcidWork }) {
  const typeColor: Record<string, string> = {
    "journal-article": CYAN, "book-chapter": VIOLET, "preprint": GOLD, "conference-paper": GREEN,
  };
  const col = typeColor[work.type] ?? MUTED;
  return (
    <Card>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 6 }}>
        {tag(work.type?.replace(/-/g, " ") ?? "unknown", col)}
        {work.year && tag(work.year, MUTED)}
        {work.journal && tag(work.journal, DIM)}
      </div>
      <p style={{ fontFamily: "monospace", fontSize: 13, color: TEXT, margin: "6px 0 8px", lineHeight: 1.5 }}>
        {work.title}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {work.doi && (
          <a href={`https://doi.org/${work.doi}`} target="_blank" rel="noreferrer"
            style={{ fontFamily: "monospace", fontSize: 10, color: CYAN, textDecoration: "none" }}>
            DOI: {work.doi} ↗
          </a>
        )}
        {work.url && !work.doi && (
          <a href={work.url} target="_blank" rel="noreferrer"
            style={{ fontFamily: "monospace", fontSize: 10, color: CYAN, textDecoration: "none" }}>
            View Paper ↗
          </a>
        )}
      </div>
    </Card>
  );
}

/* ── arXiv feed ── */
function ArxivCard({ paper }: { paper: ArxivPaper }) {
  const [open, setOpen] = useState(false);
  return (
    <Card style={{ cursor: "pointer" }} onClick={() => setOpen(o => !o)}>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 6 }}>
        {tag("arXiv", GOLD)}
        {tag(paper.category, MUTED)}
        <span style={{ fontFamily: "monospace", fontSize: 10, color: MUTED, marginLeft: "auto" }}>
          {paper.published.slice(0, 10)}
        </span>
      </div>
      <p style={{ fontFamily: "monospace", fontSize: 12, color: TEXT, margin: "0 0 6px", lineHeight: 1.5 }}>
        {paper.title}
      </p>
      <p style={{ fontFamily: "monospace", fontSize: 10, color: MUTED, margin: 0 }}>
        {paper.authors.slice(0, 3).join(", ")}{paper.authors.length > 3 ? ` +${paper.authors.length - 3}` : ""}
      </p>
      {open && (
        <p style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, margin: "10px 0 6px", lineHeight: 1.6, borderTop: `1px solid ${BORDER}`, paddingTop: 10 }}>
          {paper.summary.slice(0, 400)}…
        </p>
      )}
      <a href={paper.link} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
        style={{ fontFamily: "monospace", fontSize: 10, color: GOLD, textDecoration: "none", display: "block", marginTop: 8 }}>
        Read on arXiv ↗
      </a>
    </Card>
  );
}

/* ── publication queue ── */
const QUEUE_KEY = "aether-publication-queue";

function loadQueue(): QueueEntry[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]"); } catch { return []; }
}
function saveQueue(q: QueueEntry[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
}

const STATUS_COLORS: Record<QueueEntry["status"], string> = { idea: VIOLET, drafting: GOLD, ready: GREEN };
const TARGET_LABELS: Record<QueueEntry["target"], string> = { nature: "Nature / Springer", arxiv: "arXiv", other: "Other" };

function PublicationQueue() {
  const [queue, setQueue] = useState<QueueEntry[]>(loadQueue);
  const [form, setForm] = useState<Partial<QueueEntry>>({});
  const [adding, setAdding] = useState(false);

  const persist = (q: QueueEntry[]) => { setQueue(q); saveQueue(q); };

  const add = () => {
    if (!form.title?.trim()) return;
    const entry: QueueEntry = {
      id: Date.now().toString(),
      title: form.title.trim(),
      notes: form.notes ?? "",
      target: form.target ?? "nature",
      status: form.status ?? "idea",
      created: new Date().toISOString().slice(0, 10),
    };
    persist([entry, ...queue]);
    setForm({});
    setAdding(false);
  };

  const remove = (id: string) => persist(queue.filter(e => e.id !== id));

  const cycle = (id: string) => {
    const order: QueueEntry["status"][] = ["idea", "drafting", "ready"];
    persist(queue.map(e => e.id === id
      ? { ...e, status: order[(order.indexOf(e.status) + 1) % order.length] }
      : e));
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
        <button onClick={() => setAdding(a => !a)} style={{
          fontFamily: "monospace", fontSize: 11, color: CYAN, background: `${CYAN}15`,
          border: `1px solid ${CYAN}44`, borderRadius: 6, padding: "6px 16px", cursor: "pointer",
        }}>
          {adding ? "Cancel" : "+ Add Paper / Idea"}
        </button>
      </div>

      {adding && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input
              placeholder="Paper title or research idea…"
              value={form.title ?? ""}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              style={{ fontFamily: "monospace", fontSize: 12, color: TEXT, background: PAN2,
                border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", outline: "none" }}
            />
            <textarea
              placeholder="Notes, key points, what's missing online…"
              value={form.notes ?? ""}
              rows={3}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, background: PAN2,
                border: `1px solid ${BORDER}`, borderRadius: 6, padding: "8px 12px", resize: "vertical", outline: "none" }}
            />
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <select value={form.target ?? "nature"} onChange={e => setForm(f => ({ ...f, target: e.target.value as QueueEntry["target"] }))}
                style={{ fontFamily: "monospace", fontSize: 11, color: TEXT, background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 10px" }}>
                <option value="nature">Nature / Springer</option>
                <option value="arxiv">arXiv</option>
                <option value="other">Other</option>
              </select>
              <select value={form.status ?? "idea"} onChange={e => setForm(f => ({ ...f, status: e.target.value as QueueEntry["status"] }))}
                style={{ fontFamily: "monospace", fontSize: 11, color: TEXT, background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 6, padding: "6px 10px" }}>
                <option value="idea">Idea</option>
                <option value="drafting">Drafting</option>
                <option value="ready">Ready to Submit</option>
              </select>
              <button onClick={add} style={{
                fontFamily: "monospace", fontSize: 11, color: BG, background: CYAN,
                border: "none", borderRadius: 6, padding: "6px 20px", cursor: "pointer", fontWeight: 700,
              }}>
                Queue It →
              </button>
            </div>
          </div>
        </Card>
      )}

      {queue.length === 0 && !adding && (
        <Card>
          <p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED, margin: 0, textAlign: "center" }}>
            No papers queued yet — add your first idea above.
          </p>
        </Card>
      )}

      {queue.map(entry => (
        <Card key={entry.id}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", flexWrap: "wrap", marginBottom: 6 }}>
            <button onClick={() => cycle(entry.id)} style={{
              fontFamily: "monospace", fontSize: 9, color: STATUS_COLORS[entry.status],
              background: `${STATUS_COLORS[entry.status]}15`, border: `1px solid ${STATUS_COLORS[entry.status]}44`,
              borderRadius: 4, padding: "2px 8px", cursor: "pointer", textTransform: "uppercase", letterSpacing: 1,
            }}>
              {entry.status} ↻
            </button>
            {tag(TARGET_LABELS[entry.target], GOLD)}
            <span style={{ fontFamily: "monospace", fontSize: 10, color: MUTED, marginLeft: "auto" }}>{entry.created}</span>
          </div>
          <p style={{ fontFamily: "monospace", fontSize: 13, color: TEXT, margin: "4px 0 6px", lineHeight: 1.5 }}>
            {entry.title}
          </p>
          {entry.notes && (
            <p style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, margin: "0 0 8px", lineHeight: 1.6 }}>
              {entry.notes}
            </p>
          )}
          <button onClick={() => remove(entry.id)} style={{
            fontFamily: "monospace", fontSize: 10, color: ROSE, background: "transparent",
            border: "none", cursor: "pointer", padding: 0,
          }}>
            Remove
          </button>
        </Card>
      ))}
    </>
  );
}

/* ── submission guide ── */
function SubmissionGuide() {
  const steps = [
    {
      venue: "Research Square",
      role: "Nature's official preprint server — post your work publicly, get a DOI, and fast-track to Nature Portfolio journals",
      url: "https://www.researchsquare.com/submit",
      color: GOLD,
      steps: ["Create account at researchsquare.com", "Upload manuscript (Word or PDF)", "Select subject area (Computer Science → Security)", "Get a preprint DOI instantly", "Submit directly to Nature journals from the same portal"],
    },
    {
      venue: "arXiv",
      role: "Open-access preprint server for CS & security — free, immediate, indexed by Google Scholar",
      url: "https://arxiv.org/submit",
      color: CYAN,
      steps: ["Request arXiv endorsement (needed for first submission)", "Submit via web or email", "Category: cs.CR (Cryptography and Security)", "Link your ORCID in your arXiv account", "Paper appears within 1–2 business days"],
    },
    {
      venue: "Nature: Scientific Reports",
      role: "Nature's open-access mega-journal — broad scope, peer-reviewed, high impact",
      url: "https://www.nature.com/sdata/submit",
      color: VIOLET,
      steps: ["Prepare manuscript per Nature guidelines", "Submit via Editorial Manager portal", "Suggest 5 peer reviewers", "APC (article processing charge) applies for open access", "Average decision: 8–12 weeks"],
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
      {steps.map(s => (
        <Card key={s.venue} style={{ border: `1px solid ${s.color}33` }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <div style={{ width: 3, height: 14, background: s.color, borderRadius: 2 }} />
            <span style={{ fontFamily: "monospace", fontSize: 12, color: s.color, fontWeight: 700 }}>{s.venue}</span>
          </div>
          <p style={{ fontFamily: "monospace", fontSize: 10, color: MUTED, margin: "0 0 10px", lineHeight: 1.6 }}>
            {s.role}
          </p>
          <ol style={{ margin: "0 0 12px", paddingLeft: 18 }}>
            {s.steps.map((st, i) => (
              <li key={i} style={{ fontFamily: "monospace", fontSize: 10, color: TEXT, marginBottom: 3, lineHeight: 1.5 }}>
                {st}
              </li>
            ))}
          </ol>
          <a href={s.url} target="_blank" rel="noreferrer" style={{
            fontFamily: "monospace", fontSize: 10, color: s.color, textDecoration: "none",
            padding: "5px 12px", border: `1px solid ${s.color}44`, borderRadius: 5, background: `${s.color}10`,
            display: "inline-block",
          }}>
            Open Submission Portal ↗
          </a>
        </Card>
      ))}
    </div>
  );
}

/* ── main page ── */
export default function ScholarQPage() {
  const [person, setPerson] = useState<{ given: string; family: string; bio: string } | null>(null);
  const [works, setWorks] = useState<OrcidWork[]>([]);
  const [arxivPapers, setArxivPapers] = useState<ArxivPaper[]>([]);
  const [arxivQuery, setArxivQuery] = useState("cybersecurity education");
  const [arxivInput, setArxivInput] = useState("cybersecurity education");
  const [arxivLoading, setArxivLoading] = useState(false);
  const [worksLoading, setWorksLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tracked" | "arxiv" | "guide" | "queue">("tracked");

  /* fetch ORCID person + works via API proxy */
  useEffect(() => {
    (async () => {
      try {
        const [pRes, wRes] = await Promise.all([
          fetch(`${API_BASE}/api/scholar/orcid?id=${ORCID_ID}&section=person`),
          fetch(`${API_BASE}/api/scholar/orcid?id=${ORCID_ID}&section=works`),
        ]);
        const [p, w] = await Promise.all([pRes.json(), wRes.json()]);
        setPerson({
          given: p?.name?.["given-names"]?.value ?? "Shia",
          family: p?.name?.["family-name"]?.value ?? "Miller",
          bio: p?.biography?.content ?? "",
        });
        const mapped: OrcidWork[] = (w?.group ?? []).map((g: any) => {
          const s = g["work-summary"]?.[0];
          const extIds = s?.["external-ids"]?.["external-id"] ?? [];
          const doi = extIds.find((e: any) => e["external-id-type"] === "doi")?.["external-id-value"] ?? null;
          return {
            title: s?.title?.title?.value ?? "Untitled",
            type: s?.type ?? "unknown",
            year: s?.["publication-date"]?.year?.value ?? null,
            journal: s?.["journal-title"]?.value ?? null,
            doi,
            url: s?.url?.value ?? null,
            source: "orcid",
          };
        });
        setWorks(mapped);
      } catch {
        setPerson({ given: "Shia", family: "Miller", bio: "Cybersecurity researcher · Penn State Cybersecurity Analytics · ORCID: 0009-0000-5537-1034" });
      } finally {
        setWorksLoading(false);
      }
    })();
  }, []);

  /* fetch arXiv via API proxy (avoids CORS) */
  const fetchArxiv = useCallback(async (q: string) => {
    setArxivLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/scholar/arxiv?q=${encodeURIComponent(q)}&cat=cs.CR&n=8`
      );
      const data = await res.json();
      setArxivPapers((data.papers ?? []).map((p: any) => ({
        id: p.id,
        title: p.title,
        summary: p.summary,
        authors: p.authors,
        published: p.published,
        link: p.link,
        category: p.primaryCategory,
      })));
    } catch {
      setArxivPapers([]);
    } finally {
      setArxivLoading(false);
    }
  }, []);

  useEffect(() => { fetchArxiv(arxivQuery); }, [arxivQuery, fetchArxiv]);

  const TABS: { key: typeof activeTab; label: string; color: string; count?: number }[] = [
    { key: "tracked", label: "ORCID Works", color: GREEN, count: works.length },
    { key: "arxiv", label: "arXiv Feed", color: GOLD },
    { key: "guide", label: "How to Publish", color: VIOLET },
    { key: "queue", label: "My Queue", color: CYAN },
  ];

  return (
    <div style={{ background: BG, minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: "monospace", fontSize: 10, color: MUTED, letterSpacing: 2 }}>
              SCHOLAR·Q
            </span>
            {tag("LIVE", GREEN)}
            {tag(`ORCID ${ORCID_ID}`, VIOLET)}
          </div>
          <h1 style={{ fontFamily: "monospace", fontSize: 22, color: TEXT, margin: "0 0 6px", fontWeight: 700 }}>
            Research Publication Hub
          </h1>
          <p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED, margin: 0, lineHeight: 1.6 }}>
            Connected to ORCID · arXiv · Nature Portfolio · Research Square
            <span style={{ color: DIM }}> — tracks your works, feeds new cybersecurity research, and queues your ideas for publication</span>
          </p>
        </div>

        {/* ORCID profile */}
        <Section title="Your ORCID Profile" accent={GREEN}>
          <OrcidProfile person={person} />
        </Section>

        {/* tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
              fontFamily: "monospace", fontSize: 11, letterSpacing: 1,
              color: activeTab === t.key ? BG : t.color,
              background: activeTab === t.key ? t.color : `${t.color}12`,
              border: `1px solid ${t.color}44`,
              borderRadius: 6, padding: "7px 16px", cursor: "pointer",
              fontWeight: activeTab === t.key ? 700 : 400,
              transition: "all 0.15s",
            }}>
              {t.label}{t.count !== undefined ? ` (${t.count})` : ""}
            </button>
          ))}
        </div>

        {/* tab: ORCID works */}
        {activeTab === "tracked" && (
          <Section title="Works Tracked on ORCID" accent={GREEN}>
            {worksLoading
              ? <Card><p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED, margin: 0 }}>Fetching from ORCID…</p></Card>
              : works.length === 0
              ? <Card><p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED, margin: 0 }}>No works linked to this ORCID yet. Add them at <a href="https://orcid.org/my-orcid" target="_blank" rel="noreferrer" style={{ color: GREEN }}>orcid.org/my-orcid ↗</a></p></Card>
              : works.map((w, i) => <WorkCard key={i} work={w} />)
            }
            <p style={{ fontFamily: "monospace", fontSize: 10, color: DIM, marginTop: 8 }}>
              These are papers linked to your ORCID iD. To add your own research or authored works, visit orcid.org and click "Add Works".
            </p>
          </Section>
        )}

        {/* tab: arXiv */}
        {activeTab === "arxiv" && (
          <Section title="arXiv · cs.CR Cybersecurity Feed" accent={GOLD}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                value={arxivInput}
                onChange={e => setArxivInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && setArxivQuery(arxivInput)}
                placeholder="Search arXiv cs.CR…"
                style={{ flex: 1, fontFamily: "monospace", fontSize: 12, color: TEXT,
                  background: PAN2, border: `1px solid ${BORDER}`, borderRadius: 6,
                  padding: "8px 12px", outline: "none" }}
              />
              <button onClick={() => setArxivQuery(arxivInput)} style={{
                fontFamily: "monospace", fontSize: 11, color: BG, background: GOLD,
                border: "none", borderRadius: 6, padding: "8px 18px", cursor: "pointer", fontWeight: 700,
              }}>
                Search
              </button>
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {["cybersecurity education", "cyber policy", "digital forensics", "network security", "security analytics"].map(q => (
                <button key={q} onClick={() => { setArxivInput(q); setArxivQuery(q); }} style={{
                  fontFamily: "monospace", fontSize: 10, color: GOLD, background: `${GOLD}12`,
                  border: `1px solid ${GOLD}33`, borderRadius: 4, padding: "3px 10px", cursor: "pointer",
                }}>
                  {q}
                </button>
              ))}
            </div>
            {arxivLoading
              ? <Card><p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED, margin: 0 }}>Fetching from arXiv…</p></Card>
              : arxivPapers.length === 0
              ? <Card><p style={{ fontFamily: "monospace", fontSize: 12, color: MUTED, margin: 0 }}>No results — try a different search term.</p></Card>
              : arxivPapers.map(p => <ArxivCard key={p.id} paper={p} />)
            }
          </Section>
        )}

        {/* tab: submission guide */}
        {activeTab === "guide" && (
          <Section title="Publishing Pathways · Nature · arXiv · Research Square" accent={VIOLET}>
            <p style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, marginBottom: 16, lineHeight: 1.7 }}>
              Your ORCID iD is the universal link — it follows your work across every venue below.
              The fastest path to visibility: arXiv preprint first (same day), then peer-reviewed journal (Nature/Springer).
            </p>
            <SubmissionGuide />
            <Card style={{ marginTop: 16, border: `1px solid ${CYAN}33` }}>
              <p style={{ fontFamily: "monospace", fontSize: 11, color: TEXT, margin: "0 0 6px" }}>
                💡 <strong style={{ color: CYAN }}>Tip:</strong> Link your ORCID to your arXiv account so every preprint automatically appears on your ORCID profile.
              </p>
              <a href="https://info.orcid.org/arxiv/" target="_blank" rel="noreferrer"
                style={{ fontFamily: "monospace", fontSize: 10, color: CYAN, textDecoration: "none" }}>
                How to link arXiv ↔ ORCID ↗
              </a>
            </Card>
          </Section>
        )}

        {/* tab: queue */}
        {activeTab === "queue" && (
          <Section title="My Publication Queue" accent={CYAN}>
            <p style={{ fontFamily: "monospace", fontSize: 11, color: MUTED, marginBottom: 14, lineHeight: 1.7 }}>
              Add your research ideas, drafts, or papers ready to submit. Track their status from idea → drafting → ready. Your queue is saved locally in this browser.
            </p>
            <PublicationQueue />
          </Section>
        )}

      </div>
    </div>
  );
}

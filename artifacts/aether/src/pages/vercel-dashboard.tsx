import { useState, useEffect, useCallback } from "react";

const BASE = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");

const F = "'Inter',ui-sans-serif,system-ui,sans-serif";

const C = {
  bg: "#0d0d14",
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.09)",
  borderHi: "rgba(124,58,237,0.45)",
  white: "#fff",
  muted: "rgba(255,255,255,0.45)",
  dim: "rgba(255,255,255,0.22)",
  purple: "#7c3aed",
  green: "#22c55e",
  red: "#ef4444",
  amber: "#f59e0b",
  blue: "#3b82f6",
  gray: "rgba(255,255,255,0.3)",
};

type Deployment = {
  uid: string;
  name: string;
  state: string;
  url: string;
  createdAt: number;
  meta?: { githubCommitMessage?: string; githubCommitSha?: string };
};

type Project = {
  id: string;
  name: string;
  framework: string | null;
  updatedAt: number;
  alias?: { domain: string }[];
  link?: { type: string; repo?: string };
};

function stateColor(s: string) {
  if (s === "READY") return C.green;
  if (s === "ERROR" || s === "CANCELED") return C.red;
  if (s === "BUILDING" || s === "QUEUED" || s === "INITIALIZING") return C.amber;
  return C.gray;
}

function stateLabel(s: string) {
  if (s === "READY") return "● Ready";
  if (s === "ERROR") return "✕ Error";
  if (s === "CANCELED") return "◌ Canceled";
  if (s === "BUILDING") return "◎ Building";
  if (s === "QUEUED") return "◎ Queued";
  return s;
}

function timeAgo(ms: number) {
  const diff = Date.now() - ms;
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function Badge({ text, color }: { text: string; color: string }) {
  return (
    <span style={{
      fontFamily: F, fontSize: 11, fontWeight: 500,
      color, background: color + "18",
      border: `1px solid ${color}33`,
      borderRadius: 5, padding: "2px 8px",
    }}>{text}</span>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "20px 22px",
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function VercelDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const load = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [pRes, dRes] = await Promise.all([
        fetch(`${BASE}/api/vercel/projects`),
        fetch(`${BASE}/api/vercel/deployments${selectedProject ? `?projectId=${selectedProject}` : ""}`),
      ]);
      const [p, d] = await Promise.all([pRes.json(), dRes.json()]);
      if (p.error) throw new Error(p.error);
      if (d.error) throw new Error(d.error);
      setProjects(p.projects ?? []);
      setDeployments(d.deployments ?? []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedProject]);

  useEffect(() => { load(); }, [load]);

  const stats = {
    total: projects.length,
    ready: deployments.filter(d => d.state === "READY").length,
    errors: deployments.filter(d => d.state === "ERROR").length,
    latest: deployments[0],
  };

  const filteredDeploys = deployments
    .filter(d => selectedProject ? d.name === projects.find(p => p.id === selectedProject)?.name : true)
    .filter(d => showAll ? true : d.state !== "ERROR" && d.state !== "CANCELED");

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.white, fontFamily: F, padding: "32px 40px" }}>
      <style>{`
        .vd-row:hover { background: rgba(255,255,255,0.04) !important; }
        .vd-proj:hover { border-color: rgba(124,58,237,0.45) !important; background: rgba(255,255,255,0.06) !important; cursor: pointer; }
        .vd-proj.active { border-color: rgba(124,58,237,0.6) !important; background: rgba(124,58,237,0.1) !important; }
        a { text-decoration: none; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <svg width="20" height="20" viewBox="0 0 512 512" fill="white">
              <path d="M256 48L496 432H16L256 48Z" />
            </svg>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>
              Vercel
            </h1>
          </div>
          <p style={{ margin: 0, fontSize: 13, color: C.muted }}>shiam808-8124 · deployment dashboard</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          style={{
            background: "rgba(255,255,255,0.06)", border: `1px solid ${C.border}`,
            borderRadius: 8, padding: "8px 16px", color: C.muted,
            fontFamily: F, fontSize: 13, cursor: "pointer",
            opacity: refreshing ? 0.5 : 1, transition: "opacity .15s",
          }}
        >
          {refreshing ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "80px 0", color: C.muted, fontSize: 14 }}>
          Loading your Vercel data…
        </div>
      )}

      {error && (
        <Card style={{ borderColor: C.red + "44", marginBottom: 24 }}>
          <div style={{ color: C.red, fontSize: 14 }}>⚠ {error}</div>
        </Card>
      )}

      {!loading && !error && (
        <>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 28 }}>
            {[
              { label: "Projects", value: stats.total },
              { label: "Recent Deploys", value: deployments.length },
              { label: "Ready", value: stats.ready, color: C.green },
              { label: "Errors", value: stats.errors, color: stats.errors > 0 ? C.red : C.muted },
            ].map(s => (
              <Card key={s.label}>
                <div style={{ fontSize: 11, color: C.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 700, color: s.color ?? C.white }}>{s.value}</div>
              </Card>
            ))}
          </div>

          {/* Projects */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px", color: C.white }}>Projects</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 12 }}>
              {projects.map(p => (
                <div
                  key={p.id}
                  className={`vd-proj${selectedProject === p.id ? " active" : ""}`}
                  onClick={() => setSelectedProject(selectedProject === p.id ? null : p.id)}
                  style={{
                    background: C.card, border: `1px solid ${C.border}`,
                    borderRadius: 10, padding: "14px 16px",
                    transition: "border-color .15s, background .15s",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: C.white }}>{p.name}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                    {p.framework && <Badge text={p.framework} color={C.purple} />}
                  </div>
                  {p.link?.repo && (
                    <div style={{ fontSize: 11, color: C.dim }}>
                      ⎇ {p.link.repo}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: C.dim, marginTop: 4 }}>
                    Updated {timeAgo(p.updatedAt)}
                  </div>
                </div>
              ))}
            </div>
            {selectedProject && (
              <div style={{ marginTop: 8 }}>
                <button
                  onClick={() => setSelectedProject(null)}
                  style={{ background: "none", border: "none", color: C.dim, fontSize: 12, cursor: "pointer", fontFamily: F, padding: 0 }}
                >
                  ✕ Clear filter
                </button>
              </div>
            )}
          </div>

          {/* Deployments */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 style={{ fontSize: 15, fontWeight: 600, margin: 0, color: C.white }}>
                Deployments {selectedProject && <span style={{ color: C.muted, fontWeight: 400 }}>— {projects.find(p => p.id === selectedProject)?.name}</span>}
              </h2>
              <button
                onClick={() => setShowAll(v => !v)}
                style={{
                  background: showAll ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${showAll ? C.red + "44" : C.border}`,
                  borderRadius: 7, padding: "5px 12px",
                  color: showAll ? C.red : C.muted,
                  fontFamily: F, fontSize: 12, cursor: "pointer",
                  transition: "all .15s",
                }}
              >
                {showAll ? "Hide errors & canceled" : "Show all"}
              </button>
            </div>
            <Card style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: F, fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Project", "Status", "Branch / Commit", "URL", "Age"].map(h => (
                      <th key={h} style={{ padding: "12px 18px", textAlign: "left", color: C.muted, fontWeight: 500, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredDeploys.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: "24px 18px", color: C.dim, textAlign: "center" }}>No deployments found</td></tr>
                  )}
                  {filteredDeploys.map((d, i) => (
                    <tr key={d.uid} className="vd-row" style={{
                      borderBottom: i < filteredDeploys.length - 1 ? `1px solid ${C.border}` : "none",
                      transition: "background .12s",
                    }}>
                      <td style={{ padding: "13px 18px", color: C.white, fontWeight: 500 }}>{d.name}</td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ color: stateColor(d.state), fontSize: 12, fontWeight: 500 }}>
                          {stateLabel(d.state)}
                        </span>
                      </td>
                      <td style={{ padding: "13px 18px", color: C.muted, maxWidth: 200 }}>
                        {d.meta?.githubCommitMessage
                          ? <span title={d.meta.githubCommitMessage}>{d.meta.githubCommitMessage.slice(0, 40)}{d.meta.githubCommitMessage.length > 40 ? "…" : ""}</span>
                          : <span style={{ color: C.dim }}>—</span>}
                        {d.meta?.githubCommitSha && (
                          <div style={{ fontSize: 10, color: C.dim, marginTop: 2 }}>{d.meta.githubCommitSha.slice(0, 7)}</div>
                        )}
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        {d.url ? (
                          <a href={`https://${d.url}`} target="_blank" rel="noopener noreferrer"
                            style={{ color: C.blue, fontSize: 12 }}>
                            {d.url.slice(0, 38)}{d.url.length > 38 ? "…" : ""}
                          </a>
                        ) : <span style={{ color: C.dim }}>—</span>}
                      </td>
                      <td style={{ padding: "13px 18px", color: C.dim, fontSize: 12, whiteSpace: "nowrap" }}>
                        {timeAgo(d.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

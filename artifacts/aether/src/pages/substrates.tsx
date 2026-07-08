import { useMemo, useState } from "react";
import { Link } from "wouter";
import { NAV_ITEMS } from "@/components/layout";

const F = "'Inter',ui-sans-serif,system-ui,sans-serif";
const M = "'Space Mono',monospace";

const C = {
  bg: "#0b0906",
  card: "rgba(255,255,255,0.028)",
  cardHi: "rgba(255,255,255,0.05)",
  border: "rgba(255,255,255,0.08)",
  gold: "#f5c84c",
  goldDim: "rgba(245,200,76,0.55)",
  white: "#f4f1ea",
  text: "rgba(244,241,234,0.62)",
  muted: "rgba(244,241,234,0.4)",
  dim: "rgba(244,241,234,0.22)",
};

type NavItem = { href: string; label: string; icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }> };

const GROUPS: { name: string; re: RegExp }[] = [
  { name: "Substrates & Matter", re: /substrate|crystall|bismuth|carbon|atomic|lattice|quartz|mineral|diamond|ferrofluid|piezo|rhombus|material|chladni|geometry|matter/i },
  { name: "Biology & Life", re: /bio|dna|cell|neural|brain|blood|cancer|organoid|mycelium|plant|animal|food|health|body|baby|rhythm|nutri|compote|epigen|regulatory|borrelia|atp|organism/i },
  { name: "Cosmos & Fields", re: /cosmo|lunar|solar|stellar|quantum|gravity|dark|hubble|entropy|field|wave|plasma|astro|atlantis|eris|divine|timing|sky|moon|antimatter|black-hole|celestial|star/i },
  { name: "Engines & Machines", re: /engine|propulsion|drive|robot|machine|computer|chip|cli|reactor|transport|nanotube|tunnel|boat|carriage|farm|ammeter|camera|printer|print|hardware|drone/i },
  { name: "Knowledge & AI", re: /agent|claude|notion|vercel|search|intake|graph|atlas|glossary|dashboard|data|map|question|query|ingest|library|index|directory|textbook|whitepaper|research|patent|doctrine|framework|theory|lab/i },
  { name: "Brand & Story", re: /brand|book|season|story|calm|boho|children|letter|realm|sparkle|social|deploy|business|billing|flow|why|awakening|timeline|glow/i },
];

function groupOf(item: NavItem): string {
  const hay = item.href + " " + item.label;
  for (const g of GROUPS) if (g.re.test(hay)) return g.name;
  return "Explorations";
}

const GROUP_ORDER = [...GROUPS.map(g => g.name), "Explorations"];

export default function SubstratesPage() {
  const [q, setQ] = useState("");

  const items = useMemo(
    () => (NAV_ITEMS as unknown as NavItem[]).filter(i => i.href !== "/substrates"),
    []
  );

  const substrateFeatured = useMemo(
    () => items.filter(i => /substrate/i.test(i.href + i.label)),
    [items]
  );

  const grouped = useMemo(() => {
    const query = q.trim().toLowerCase();
    const filtered = query
      ? items.filter(i => (i.href + " " + i.label).toLowerCase().includes(query))
      : items;
    const map = new Map<string, NavItem[]>();
    for (const it of filtered) {
      const g = groupOf(it);
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(it);
    }
    return map;
  }, [items, q]);

  const total = items.length;

  return (
    <div className="sb-page" style={{ minHeight: "100vh", background: C.bg, fontFamily: F, color: C.white }}>
      <style>{`
        .sb-hero-glow { position:absolute; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 900px 480px at 30% -10%, rgba(245,200,76,0.13), transparent 60%),
                      radial-gradient(ellipse 700px 400px at 85% 5%, rgba(180,120,40,0.07), transparent 65%); }
        .sb-card { transition: border-color .15s, background .15s, transform .15s; }
        .sb-card:hover { border-color: rgba(245,200,76,0.4) !important; background: rgba(255,255,255,0.05) !important; transform: translateY(-2px); }
        .sb-cta:hover { background: rgba(245,200,76,0.12) !important; }
        .sb-inp { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px;
          padding: 12px 16px; font-family: ${F}; font-size: 14px; color: ${C.white}; width: 100%; box-sizing: border-box; outline: none; }
        .sb-inp::placeholder { color: rgba(244,241,234,0.28); }
        .sb-inp:focus { border-color: rgba(245,200,76,0.5); }
        .sb-page a { text-decoration: none; }
      `}</style>

      {/* ── Hero (darkcone front) ── */}
      <div style={{ position: "relative", padding: "110px 7vw 70px", overflow: "hidden" }}>
        <div className="sb-hero-glow" />
        <div style={{ position: "relative", maxWidth: 980 }}>
          <div style={{ fontFamily: M, fontSize: 12, letterSpacing: "0.35em", color: C.gold, marginBottom: 26 }}>
            AETHER · SUBSTRATES
          </div>
          <h1 style={{ margin: 0, fontFamily: F, fontSize: "clamp(44px, 7vw, 84px)", fontWeight: 800, lineHeight: 1.04, letterSpacing: "-0.03em" }}>
            Interfaces<br />
            that feel <span style={{ color: C.gold }}>alive</span>.
          </h1>
          <p style={{ margin: "26px 0 0", maxWidth: 560, fontSize: 16, lineHeight: 1.6, color: C.text }}>
            Every substrate, simulator, and interface in the AETHER system — compiled in totality.
            Aligned for meaning, flow, and integrity. Designed for clarity. Built for coherence.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 36 }}>
            <a
              href="#work"
              className="sb-cta"
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                border: `1px solid ${C.goldDim}`, borderRadius: 10,
                padding: "13px 22px", color: C.gold, fontSize: 14, fontWeight: 600,
                background: "rgba(245,200,76,0.05)", transition: "background .15s",
              }}
            >
              See the work <span aria-hidden>→</span>
            </a>
            <Link href="/" style={{ color: C.text, fontSize: 14 }}>
              Graph Map
            </Link>
          </div>
          <div style={{ display: "flex", gap: 26, marginTop: 54, fontFamily: M, fontSize: 11, color: C.muted, letterSpacing: "0.12em", flexWrap: "wrap" }}>
            <span>{total} INTERFACES</span>
            <span style={{ color: C.dim }}>—</span>
            <span>{substrateFeatured.length} SUBSTRATE SYSTEMS</span>
            <span style={{ color: C.dim }}>—</span>
            <span>{GROUP_ORDER.length} DOMAINS</span>
          </div>
        </div>
      </div>

      {/* ── Value cards ── */}
      <div style={{ padding: "0 7vw 70px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16, maxWidth: 1400 }}>
        {[
          { t: "Symbolic → Real", d: "Coherence fields, knots, and lattices translated into live, running simulations." },
          { t: "Zero-drag exploration", d: "Every page one click away. Search, filter, jump — clarity at speed." },
          { t: "In totality", d: "The complete system: all interfaces auto-compiled from the AETHER registry." },
        ].map(v => (
          <div key={v.t} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "24px 26px" }}>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{v.t}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55, color: C.text }}>{v.d}</div>
          </div>
        ))}
      </div>

      {/* ── Featured substrates ── */}
      <div style={{ padding: "0 7vw 60px" }}>
        <h2 style={{ margin: "0 0 6px", fontFamily: F, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>Substrate systems</h2>
        <p style={{ margin: "0 0 22px", fontSize: 14, color: C.muted }}>The core matter-and-computation layer of AETHER.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
          {substrateFeatured.map(it => {
            const Icon = it.icon;
            return (
              <Link key={it.href} href={it.href}>
                <div className="sb-card" style={{
                  background: "linear-gradient(160deg, rgba(245,200,76,0.06), rgba(255,255,255,0.02))",
                  border: `1px solid rgba(245,200,76,0.2)`, borderRadius: 14, padding: "20px 22px", cursor: "pointer", height: "100%", boxSizing: "border-box",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <Icon size={16} color={C.gold} strokeWidth={1.8} />
                    <span style={{ fontFamily: M, fontSize: 10, letterSpacing: "0.2em", color: C.goldDim }}>{it.href.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 600, lineHeight: 1.4, color: C.white }}>{it.label}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── The complete atlas ── */}
      <div id="work" style={{ padding: "20px 7vw 100px" }}>
        <h2 style={{ margin: "0 0 6px", fontFamily: F, fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>The complete system</h2>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: C.muted }}>
          All {total} AETHER interfaces, grouped by domain. This list compiles itself from the live navigation registry.
        </p>
        <div style={{ maxWidth: 520, marginBottom: 34 }}>
          <input
            className="sb-inp"
            aria-label="Search interfaces"
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={`Search ${total} interfaces…`}
          />
        </div>

        {GROUP_ORDER.map(gName => {
          const list = grouped.get(gName);
          if (!list || list.length === 0) return null;
          return (
            <div key={gName} style={{ marginBottom: 44 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 14 }}>
                <h3 style={{ margin: 0, fontFamily: F, fontSize: 17, fontWeight: 700 }}>{gName}</h3>
                <span style={{ fontFamily: M, fontSize: 11, color: C.dim }}>{list.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 10 }}>
                {list.map(it => {
                  const Icon = it.icon;
                  return (
                    <Link key={it.href} href={it.href}>
                      <div className="sb-card" style={{
                        background: C.card, border: `1px solid ${C.border}`, borderRadius: 10,
                        padding: "13px 15px", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 10, height: "100%", boxSizing: "border-box",
                      }}>
                        <span style={{ flexShrink: 0, marginTop: 1 }}><Icon size={14} color={C.goldDim} strokeWidth={1.8} /></span>
                        <span style={{ fontSize: 12.5, lineHeight: 1.45, color: C.text, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                          {it.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}

        {q.trim() && [...grouped.values()].every(l => l.length === 0) && (
          <div style={{ color: C.muted, fontSize: 14, padding: "30px 0" }}>No interfaces match "{q}".</div>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "30px 7vw", display: "flex", gap: 24, flexWrap: "wrap" }}>
        <Link href="/substrate-synthesis" style={{ color: C.muted, fontSize: 13 }}>Substrate Studio →</Link>
        <Link href="/crystallization-atlas" style={{ color: C.muted, fontSize: 13 }}>Crystallization Atlas →</Link>
        <Link href="/page-directory" style={{ color: C.muted, fontSize: 13 }}>Page Directory →</Link>
        <span style={{ marginLeft: "auto", fontFamily: M, fontSize: 10, letterSpacing: "0.25em", color: C.dim }}>AETHER · SUBSTRATES</span>
      </div>
    </div>
  );
}

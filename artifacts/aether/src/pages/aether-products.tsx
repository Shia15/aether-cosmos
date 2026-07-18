import { useEffect, useRef, useState } from "react";

const C = {
  bg:      "#0b0906",
  deep:    "#0f0c09",
  panel:   "#14100c",
  border:  "rgba(245,200,76,0.15)",
  border2: "rgba(245,200,76,0.35)",
  gold:    "#f5c84c",
  teal:    "#1fd4c8",
  violet:  "#8b5cf6",
  pink:    "#ec4899",
  green:   "#22c55e",
  amber:   "#f59e0b",
  red:     "#f87171",
  blue:    "#60a5fa",
  text:    "#f4f1ea",
  muted:   "#8a7a6a",
  dim:     "#3a3028",
};

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

type Status = "live" | "beta" | "building" | "planned";

interface Product {
  name: string;
  tagline: string;
  route?: string;
  price: string;
  tier: string;
  status: Status;
  completion: number;
  analysis: { depth: number; features: number; revenue: number; community: number };
  metrics: { label: string; value: string }[];
}

interface Category {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  icon: string;
  products: Product[];
}

const STATUS_META: Record<Status, { label: string; color: string }> = {
  live:     { label: "LIVE",     color: C.green  },
  beta:     { label: "BETA",     color: C.teal   },
  building: { label: "BUILDING", color: C.amber  },
  planned:  { label: "PLANNED",  color: C.muted  },
};

const CATEGORIES: Category[] = [
  {
    id: "education",
    title: "Knowledge & Education",
    subtitle: "The core course and live learning products",
    color: C.gold,
    icon: "◎",
    products: [
      {
        name: "AETHER · The Complete Course",
        tagline: "490+ interconnected pages — the full crystallization model from first principles to speculative engineering",
        route: "/billing",
        price: "$2,997",
        tier: "One-time",
        status: "live",
        completion: 88,
        analysis: { depth: 97, features: 85, revenue: 95, community: 40 },
        metrics: [
          { label: "Pages built", value: "490+" },
          { label: "Simulators", value: "62" },
          { label: "Concepts", value: "500+" },
          { label: "AI bridges", value: "3" },
        ],
      },
      {
        name: "Module Unlocks",
        tagline: "Individual concept clusters sold as standalone micro-courses — GUF, Crystallization, Dimensional Compiler, Biology Engine",
        price: "$97–$497",
        tier: "Per module",
        status: "building",
        completion: 42,
        analysis: { depth: 90, features: 45, revenue: 70, community: 20 },
        metrics: [
          { label: "Clusters ready", value: "8" },
          { label: "Clusters planned", value: "24" },
          { label: "Avg pages/module", value: "18" },
          { label: "Checkout ready", value: "No" },
        ],
      },
      {
        name: "Cohort Live Sessions",
        tagline: "4–8 week guided cohorts with live teaching, Q&A, and peer crystallization groups",
        price: "$497–$1,497",
        tier: "Per cohort",
        status: "planned",
        completion: 12,
        analysis: { depth: 80, features: 10, revenue: 85, community: 90 },
        metrics: [
          { label: "Curriculum built", value: "Yes" },
          { label: "Platform ready", value: "No" },
          { label: "Capacity/cohort", value: "25" },
          { label: "Revenue/cohort", value: "$37k+" },
        ],
      },
      {
        name: "Masterclass Recordings",
        tagline: "Single deep-dive sessions on GUF, Stacked Rings, Dimensional Compiler, Crystallization — recorded and sold permanently",
        price: "$47–$197",
        tier: "Per session",
        status: "planned",
        completion: 8,
        analysis: { depth: 92, features: 8, revenue: 60, community: 15 },
        metrics: [
          { label: "Topics ready", value: "30+" },
          { label: "Recorded", value: "0" },
          { label: "Platform", value: "Needed" },
          { label: "Est. library value", value: "$4,000+" },
        ],
      },
    ],
  },
  {
    id: "saas",
    title: "Software Tools · SaaS",
    subtitle: "Subscription products built and running inside AETHER right now",
    color: C.teal,
    icon: "⬡",
    products: [
      {
        name: "Calm Company OS",
        tagline: "1,314 posts/year content engine — 18 story buckets, 13 calendar anchors, deterministic 2×/day rotation, caption generation",
        route: "/calm-company",
        price: "$49–$97/mo",
        tier: "Subscription",
        status: "beta",
        completion: 82,
        analysis: { depth: 88, features: 80, revenue: 75, community: 30 },
        metrics: [
          { label: "Story buckets", value: "18" },
          { label: "Posts/year", value: "1,314" },
          { label: "Calendar anchors", value: "13" },
          { label: "Payment gate", value: "Needed" },
        ],
      },
      {
        name: "Social Deploy",
        tagline: "60-caption monthly calendar — approve, edit, one-click publish to X, Threads, LinkedIn, Instagram queue",
        route: "/social-deploy",
        price: "$67/mo",
        tier: "Subscription",
        status: "beta",
        completion: 78,
        analysis: { depth: 75, features: 78, revenue: 72, community: 25 },
        metrics: [
          { label: "Captions/month", value: "60" },
          { label: "Platforms", value: "4" },
          { label: "OAuth live", value: "No" },
          { label: "Intent URLs", value: "Yes" },
        ],
      },
      {
        name: "Sparkle Studio",
        tagline: "Branded text graphics with 10 textures, pulsing aura, PNG export and WebM video export — for content creators",
        route: "/sparkle-studio",
        price: "$19/mo",
        tier: "Subscription",
        status: "beta",
        completion: 85,
        analysis: { depth: 65, features: 85, revenue: 55, community: 10 },
        metrics: [
          { label: "Textures", value: "10" },
          { label: "Export formats", value: "PNG + WebM" },
          { label: "Video length", value: "3/5/8s" },
          { label: "Payment gate", value: "Needed" },
        ],
      },
      {
        name: "Command Centre",
        tagline: "5-source unified search — knowledge graph, 462 visuals, Notion, batch docs, X archive — all in one query",
        route: "/command-center",
        price: "$29/mo",
        tier: "Subscription",
        status: "beta",
        completion: 90,
        analysis: { depth: 85, features: 90, revenue: 60, community: 40 },
        metrics: [
          { label: "Sources", value: "5" },
          { label: "Visual assets", value: "462" },
          { label: "Results cap", value: "120" },
          { label: "Shareable URLs", value: "Yes" },
        ],
      },
      {
        name: "AETHER Flow",
        tagline: "Daily alignment console — mood mapping, agent map, in-browser CLI, intention setting",
        route: "/aether-flow",
        price: "$19/mo",
        tier: "Subscription",
        status: "beta",
        completion: 72,
        analysis: { depth: 70, features: 72, revenue: 50, community: 35 },
        metrics: [
          { label: "Mood states", value: "12" },
          { label: "Agent modes", value: "8" },
          { label: "CLI commands", value: "Active" },
          { label: "Persistence", value: "localStorage" },
        ],
      },
      {
        name: "Baby Rhythm",
        tagline: "Digital notebook for baby routines, feeding guides, diaper-bag checklist — a standalone lifestyle product",
        route: "/baby-rhythm",
        price: "$9/mo",
        tier: "Subscription",
        status: "beta",
        completion: 74,
        analysis: { depth: 60, features: 74, revenue: 45, community: 20 },
        metrics: [
          { label: "Tracking types", value: "4" },
          { label: "Guides", value: "Feeding + Diaper" },
          { label: "Offline ready", value: "Partial" },
          { label: "Mobile ready", value: "Needed" },
        ],
      },
    ],
  },
  {
    id: "ai",
    title: "AI Bridges",
    subtitle: "Live AI access products with AETHER context injection",
    color: C.violet,
    icon: "◈",
    products: [
      {
        name: "Claude Chat · AETHER Context",
        tagline: "Anthropic conversation pre-loaded with the full knowledge graph — query any concept with AI depth",
        route: "/claude-chat",
        price: "$29/mo",
        tier: "Subscription",
        status: "beta",
        completion: 80,
        analysis: { depth: 90, features: 78, revenue: 55, community: 30 },
        metrics: [
          { label: "Context source", value: "Notion pages" },
          { label: "URL query param", value: "Yes" },
          { label: "Payment gate", value: "Needed" },
          { label: "Model", value: "Claude 3.5" },
        ],
      },
      {
        name: "Grok Bridge · X + Archive",
        tagline: "Live Grok chat with your full post archive (400-post cap) injected as context — dual-account support",
        route: "/x-grok",
        price: "$29/mo",
        tier: "Subscription",
        status: "beta",
        completion: 83,
        analysis: { depth: 85, features: 83, revenue: 55, community: 60 },
        metrics: [
          { label: "X accounts", value: "2" },
          { label: "Post archive cap", value: "400" },
          { label: "SSE streaming", value: "Yes" },
          { label: "Model", value: "Grok-4.5" },
        ],
      },
      {
        name: "AETHER AI Research Assistant",
        tagline: "Semantic search + AI synthesis — query the entire knowledge system and get cited, structured answers",
        route: "/search",
        price: "$19/mo",
        tier: "Subscription",
        status: "building",
        completion: 55,
        analysis: { depth: 88, features: 55, revenue: 50, community: 20 },
        metrics: [
          { label: "Search modes", value: "3" },
          { label: "Image search", value: "Yes" },
          { label: "AI synthesis", value: "Partial" },
          { label: "Citation system", value: "Needed" },
        ],
      },
    ],
  },
  {
    id: "books",
    title: "Books & Publishing",
    subtitle: "Digital and print-on-demand publications from the AETHER library",
    color: C.amber,
    icon: "◻",
    products: [
      {
        name: "Computer Brains · Interactive Book",
        tagline: "9-page digital picture book about Chip the CPU — illustrated, animated, keyboard navigation, fully readable",
        route: "/computer-brains",
        price: "$4.99",
        tier: "One-time",
        status: "live",
        completion: 100,
        analysis: { depth: 70, features: 100, revenue: 30, community: 15 },
        metrics: [
          { label: "Pages", value: "9" },
          { label: "Animated spreads", value: "3" },
          { label: "Image spreads", value: "4" },
          { label: "Print-on-demand", value: "Needed" },
        ],
      },
      {
        name: "Boho Bloom / Zoom the Zipper / Flow Notebook",
        tagline: "3 children's titles in production — currently showing Coming Soon badges in the Children's Realm",
        route: "/aether-childrens-realm",
        price: "$4.99 each",
        tier: "One-time",
        status: "building",
        completion: 18,
        analysis: { depth: 50, features: 18, revenue: 25, community: 10 },
        metrics: [
          { label: "Titles", value: "3" },
          { label: "Pages written", value: "~0" },
          { label: "Illustrations", value: "Concept only" },
          { label: "Target age", value: "3–8" },
        ],
      },
      {
        name: "Learning in Layers · 5-Book Series",
        tagline: "Bakery of Prime Seeds → Doors of If → Garden of Signals → Pattern Engine → Coherence Tower — AETHER Seasons brand",
        route: "/learning-layers",
        price: "$19.99/book",
        tier: "Series",
        status: "building",
        completion: 22,
        analysis: { depth: 80, features: 22, revenue: 55, community: 30 },
        metrics: [
          { label: "Books", value: "5" },
          { label: "Core characters", value: "3" },
          { label: "Brand framework", value: "Complete" },
          { label: "Manuscript", value: "Needed" },
        ],
      },
      {
        name: "The GUF · Definitive Paper",
        tagline: "The Grand Unified Framework as a formatted research paper — PDF + hardback edition including the Dimensional Compiler",
        route: "/dimensional-compiler",
        price: "$29–$97",
        tier: "One-time",
        status: "building",
        completion: 35,
        analysis: { depth: 98, features: 35, revenue: 60, community: 20 },
        metrics: [
          { label: "Source pages", value: "40+" },
          { label: "Equations", value: "120+" },
          { label: "Formatted PDF", value: "Needed" },
          { label: "Print edition", value: "Needed" },
        ],
      },
    ],
  },
  {
    id: "assets",
    title: "Visual & Creative Assets",
    subtitle: "Image library, brand system, and generated media products",
    color: C.pink,
    icon: "◇",
    products: [
      {
        name: "462-Image Visual Library",
        tagline: "Licensed art pack — GPT-generated + LinkedIn images, categorized by 11 taxonomy keywords, full-resolution download",
        route: "/search",
        price: "$97 pack",
        tier: "One-time",
        status: "building",
        completion: 55,
        analysis: { depth: 75, features: 55, revenue: 50, community: 10 },
        metrics: [
          { label: "Total images", value: "462" },
          { label: "Categories", value: "11" },
          { label: "License defined", value: "No" },
          { label: "Download system", value: "Needed" },
        ],
      },
      {
        name: "AETHER Brand Identity Pack",
        tagline: "Darkcone palette, calligraphic Aether wordmark, design token system, typography guide — for creators and licensees",
        price: "$197",
        tier: "One-time",
        status: "planned",
        completion: 40,
        analysis: { depth: 85, features: 40, revenue: 45, community: 5 },
        metrics: [
          { label: "Tokens defined", value: "Yes" },
          { label: "Fonts", value: "Great Vibes, Cinzel, Space Mono" },
          { label: "Export package", value: "Needed" },
          { label: "Usage guide", value: "Needed" },
        ],
      },
      {
        name: "Sparkle Studio · Custom Commissions",
        tagline: "Done-for-you branded graphic and reel production — using Sparkle Studio for client deliverables",
        price: "$297+",
        tier: "Per project",
        status: "planned",
        completion: 25,
        analysis: { depth: 65, features: 25, revenue: 70, community: 5 },
        metrics: [
          { label: "Studio ready", value: "Yes" },
          { label: "Order system", value: "Needed" },
          { label: "Delivery method", value: "TBD" },
          { label: "Turnaround", value: "48hr target" },
        ],
      },
    ],
  },
  {
    id: "community",
    title: "Community & Membership",
    subtitle: "The recurring revenue engine — live sessions, notes, engagement",
    color: C.green,
    icon: "⬟",
    products: [
      {
        name: "AETHER Community Membership",
        tagline: "Monthly access to live sessions, collaborative page notes, crystallization milestones, and the mobile app",
        price: "$49–$97/mo",
        tier: "Subscription",
        status: "planned",
        completion: 10,
        analysis: { depth: 70, features: 10, revenue: 90, community: 95 },
        metrics: [
          { label: "Platform", value: "Mobile app needed" },
          { label: "Notes system", value: "Needed" },
          { label: "Live streaming", value: "Needed" },
          { label: "Est. LTV/member", value: "$588–$1,164/yr" },
        ],
      },
      {
        name: "Founding Crystallizer Tier",
        tagline: "Lifetime access + priority new modules + founding-member badge — limited seats, highest-value offering",
        price: "$4,997",
        tier: "Lifetime",
        status: "planned",
        completion: 5,
        analysis: { depth: 80, features: 5, revenue: 97, community: 60 },
        metrics: [
          { label: "Seats available", value: "TBD (limited)" },
          { label: "Includes", value: "All future modules" },
          { label: "Checkout", value: "Needed" },
          { label: "100 seats =", value: "$499,700" },
        ],
      },
      {
        name: "Creator License",
        tagline: "License to use Calm Company OS + Social Deploy for client content work — agency and freelancer tier",
        price: "$197/mo",
        tier: "License",
        status: "planned",
        completion: 8,
        analysis: { depth: 70, features: 8, revenue: 75, community: 15 },
        metrics: [
          { label: "Tools included", value: "2" },
          { label: "Client seats", value: "TBD" },
          { label: "License terms", value: "Needed" },
          { label: "Target user", value: "Content agencies" },
        ],
      },
    ],
  },
  {
    id: "licensing",
    title: "Licensing & Institutional",
    subtitle: "API access, curriculum licensing, and white-label products",
    color: C.blue,
    icon: "◬",
    products: [
      {
        name: "AETHER Knowledge Graph API",
        tagline: "Semantic engine access for researchers, educators, and builders — query 500+ concepts with structured responses",
        price: "$499/mo",
        tier: "API subscription",
        status: "planned",
        completion: 20,
        analysis: { depth: 95, features: 20, revenue: 85, community: 10 },
        metrics: [
          { label: "Concepts indexed", value: "500+" },
          { label: "API endpoints", value: "5 live" },
          { label: "Auth system", value: "Partial" },
          { label: "Rate limiting", value: "Needed" },
        ],
      },
      {
        name: "GUF Curriculum License",
        tagline: "Schools, think tanks, and educators licensing the Grand Unified Framework as a teachable curriculum",
        price: "Custom",
        tier: "Annual license",
        status: "planned",
        completion: 10,
        analysis: { depth: 98, features: 10, revenue: 80, community: 20 },
        metrics: [
          { label: "Content ready", value: "Yes" },
          { label: "Lesson plans", value: "Needed" },
          { label: "Assessment tools", value: "Needed" },
          { label: "Target", value: "Universities, think tanks" },
        ],
      },
      {
        name: "White-Label Simulation Suite",
        tagline: "Branded simulator package — organizations embed AETHER's live canvases in their own learning products",
        price: "Custom",
        tier: "Annual license",
        status: "planned",
        completion: 12,
        analysis: { depth: 90, features: 12, revenue: 90, community: 5 },
        metrics: [
          { label: "Simulators available", value: "62" },
          { label: "Embed-ready", value: "Partial" },
          { label: "License terms", value: "Needed" },
          { label: "Brand config", value: "Needed" },
        ],
      },
    ],
  },
];

/* ── summary stats ── */
const allProducts = CATEGORIES.flatMap(c => c.products);
const LIVE_COUNT     = allProducts.filter(p => p.status === "live").length;
const BETA_COUNT     = allProducts.filter(p => p.status === "beta").length;
const BUILDING_COUNT = allProducts.filter(p => p.status === "building").length;
const PLANNED_COUNT  = allProducts.filter(p => p.status === "planned").length;
const AVG_COMPLETION = Math.round(allProducts.reduce((s, p) => s + p.completion, 0) / allProducts.length);

/* ────────── Animated bar ────────── */
function Bar({ value, color, label, delay = 0 }: { value: number; color: string; label: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 120 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 1 }}>{label}</span>
        <span style={{ fontFamily: mono, fontSize: 9, color }}>{value}%</span>
      </div>
      <div style={{ height: 4, background: C.dim, borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`,
          background: `linear-gradient(90deg, ${color}99 0%, ${color} 100%)`,
          borderRadius: 2,
          transition: "width 0.9s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: `0 0 6px ${color}60`,
        }} />
      </div>
    </div>
  );
}

/* ── analysis 4-bar cluster ── */
function AnalysisBars({ a, color, delay = 0 }: {
  a: Product["analysis"]; color: string; delay?: number
}) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 6 }}>INTEGRATED ANALYSIS</div>
      <Bar value={a.depth}     color={color}   label="CONCEPT DEPTH"     delay={delay}       />
      <Bar value={a.features}  color={C.teal}  label="FEATURE COMPLETE"  delay={delay + 60}  />
      <Bar value={a.revenue}   color={C.green} label="REVENUE READINESS" delay={delay + 120} />
      <Bar value={a.community} color={C.pink}  label="COMMUNITY POTENTIAL" delay={delay + 180} />
    </div>
  );
}

/* ── progress ring ── */
function Ring({ pct, color, size = 52 }: { pct: number; color: string; size?: number }) {
  const r  = (size - 6) / 2;
  const cf = 2 * Math.PI * r;
  const [dash, setDash] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDash(pct / 100), 200);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.dim} strokeWidth={5} />
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none"
        stroke={color}
        strokeWidth={5}
        strokeDasharray={cf}
        strokeDashoffset={cf * (1 - dash)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 4px ${color}80)` }}
      />
      <text x={size/2} y={size/2+4} textAnchor="middle" fontSize={10} fontFamily={mono} fill={color}>
        {pct}%
      </text>
    </svg>
  );
}

/* ── product card ── */
function ProductCard({ p, catColor }: { p: Product; catColor: string }) {
  const [open, setOpen] = useState(false);
  const sm = STATUS_META[p.status];
  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${open ? catColor + "55" : C.border}`,
      borderRadius: 10,
      overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      {/* header row */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", cursor: "pointer" }}
      >
        <Ring pct={p.completion} color={catColor} size={52} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
            <span style={{ fontFamily: serif, fontSize: 14, color: C.text, lineHeight: 1.3 }}>{p.name}</span>
            <span style={{
              fontFamily: mono, fontSize: 9, color: sm.color,
              background: `${sm.color}18`, border: `1px solid ${sm.color}40`,
              borderRadius: 3, padding: "1px 6px", letterSpacing: 1,
            }}>{sm.label}</span>
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: catColor }}>{p.price} · {p.tier}</div>
        </div>
        <span style={{ fontFamily: mono, fontSize: 12, color: C.muted, flexShrink: 0 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>

      {open && (
        <div style={{ padding: "0 18px 18px", borderTop: `1px solid ${C.border}` }}>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, marginTop: 12, marginBottom: 14 }}>
            {p.tagline}
          </p>

          {/* metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", marginBottom: 4 }}>
            {p.metrics.map(m => (
              <div key={m.label} style={{
                background: C.deep, borderRadius: 6, padding: "8px 10px",
                border: `1px solid ${C.dim}`,
              }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 1, marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontFamily: mono, fontSize: 12, color: catColor }}>{m.value}</div>
              </div>
            ))}
          </div>

          <AnalysisBars a={p.analysis} color={catColor} />

          {p.route && (
            <a
              href={p.route}
              style={{
                display: "inline-block", marginTop: 14,
                fontFamily: mono, fontSize: 11, color: catColor,
                background: `${catColor}14`, border: `1px solid ${catColor}40`,
                borderRadius: 6, padding: "6px 14px", textDecoration: "none",
              }}
            >
              → Open in AETHER
            </a>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Overview canvas ── */
function OverviewCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;
    const nodes = CATEGORIES.map((cat, i) => {
      const angle = (i / CATEGORIES.length) * Math.PI * 2 - Math.PI / 2;
      const r = 110;
      return {
        x: 200 + Math.cos(angle) * r,
        y: 160 + Math.sin(angle) * r,
        color: cat.color,
        label: cat.icon,
        title: cat.title.split(" ")[0],
        pct: Math.round(cat.products.reduce((s, p) => s + p.completion, 0) / cat.products.length),
      };
    });

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = 200, cy = 160;

      // connections
      nodes.forEach((n, i) => {
        nodes.forEach((m, j) => {
          if (j <= i) return;
          const alpha = 0.04 + 0.04 * Math.sin(t + i + j);
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(245,200,76,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
      });

      // center
      const pulse = 1 + 0.06 * Math.sin(t * 1.4);
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 36 * pulse);
      cg.addColorStop(0, "#f5c84cee");
      cg.addColorStop(0.4, "#f5c84c55");
      cg.addColorStop(1, "#f5c84c00");
      ctx.beginPath();
      ctx.arc(cx, cy, 36 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();
      ctx.font = `bold 10px ${mono}`;
      ctx.fillStyle = "#0b0906";
      ctx.textAlign = "center";
      ctx.fillText("AETHER", cx, cy - 4);
      ctx.fillText("OS", cx, cy + 8);

      // nodes
      nodes.forEach(n => {
        // orbit ring
        ctx.beginPath();
        ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
        ctx.fillStyle = `${n.color}18`;
        ctx.fill();
        ctx.strokeStyle = `${n.color}55`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // progress arc
        const cf = 2 * Math.PI * 22;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 22, -Math.PI / 2, -Math.PI / 2 + (n.pct / 100) * Math.PI * 2);
        ctx.strokeStyle = n.color;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = `12px ${mono}`;
        ctx.fillStyle = n.color;
        ctx.textAlign = "center";
        ctx.fillText(n.label, n.x, n.y + 2);

        ctx.font = `8px ${mono}`;
        ctx.fillStyle = n.color + "bb";
        ctx.fillText(n.title, n.x, n.y + 34);
        ctx.fillText(`${n.pct}%`, n.x, n.y + 44);
      });

      ctx.textAlign = "left";
      t += 0.006;
      raf.current = requestAnimationFrame(draw);
    }
    canvas.width  = 400;
    canvas.height = 320;
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ display: "block", width: "100%", height: "auto", borderRadius: 8 }} />;
}

/* ────────── Page ────────── */
export default function AetherProductsPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const visible = activeCategory
    ? CATEGORIES.filter(c => c.id === activeCategory)
    : CATEGORIES;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: body, paddingBottom: 100 }}>

      {/* ── Hero ── */}
      <div style={{
        background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${C.gold}10 0%, transparent 70%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "64px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.gold, letterSpacing: 4, marginBottom: 14 }}>
          AETHER · PRODUCT SUITE
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(26px, 5vw, 48px)", color: "#fff", margin: "0 0 14px", lineHeight: 1.2 }}>
          Everything AETHER Can Sell
        </h1>
        <p style={{ fontSize: 16, color: C.muted, maxWidth: 600, margin: "0 auto 28px", lineHeight: 1.75 }}>
          This is only the start of the engine. Every product below is built from the same underlying coherence field —
          education, software, AI, books, community, and institutional licensing all crystallising from one system.
        </p>

        {/* stat chips */}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10 }}>
          {[
            { label: "LIVE",          val: LIVE_COUNT,     color: C.green  },
            { label: "BETA",          val: BETA_COUNT,     color: C.teal   },
            { label: "BUILDING",      val: BUILDING_COUNT, color: C.amber  },
            { label: "PLANNED",       val: PLANNED_COUNT,  color: C.muted  },
            { label: "AVG COMPLETE",  val: `${AVG_COMPLETION}%`, color: C.gold },
            { label: "TOTAL PRODUCTS",val: allProducts.length, color: C.violet },
          ].map(s => (
            <div key={s.label} style={{
              background: `${s.color}12`, border: `1px solid ${s.color}40`,
              borderRadius: 8, padding: "8px 16px",
              fontFamily: mono, fontSize: 11,
            }}>
              <span style={{ color: s.color, fontSize: 18, fontWeight: 700, marginRight: 6 }}>{s.val}</span>
              <span style={{ color: C.muted, letterSpacing: 1 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── body ── */}
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 20px" }}>

        {/* ── Overview map + tiers ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 48, alignItems: "start" }}>
          <div style={{
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: 12, padding: 16, overflow: "hidden",
          }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>PRODUCT SYSTEM MAP</div>
            <OverviewCanvas />
          </div>
          <div>
            <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>PRICE TIERS</div>
            {[
              { tier: "FREE",      desc: "Sample pages, Glossary, Computer Brains reader",       color: C.muted  },
              { tier: "$4.99–$47", desc: "Children's books, individual masterclass recordings",   color: C.green  },
              { tier: "$97–$497",  desc: "Module bundles, Sparkle Studio, AI bridges",           color: C.teal   },
              { tier: "$997–$2,997", desc: "The Complete Course, cohort programs",               color: C.gold   },
              { tier: "$49–$197/mo", desc: "Community membership, SaaS tools, Creator License", color: C.amber  },
              { tier: "$499+/mo",  desc: "API access, curriculum license, white-label suite",    color: C.violet },
              { tier: "$4,997",    desc: "Founding Crystallizer — lifetime, limited seats",      color: C.pink   },
            ].map(t => (
              <div key={t.tier} style={{
                display: "flex", alignItems: "flex-start", gap: 12,
                padding: "10px 14px", borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontFamily: mono, fontSize: 11, color: t.color, minWidth: 100, flexShrink: 0 }}>{t.tier}</span>
                <span style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Category filter pills ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 40 }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={{
              fontFamily: mono, fontSize: 10, letterSpacing: 1,
              color: activeCategory === null ? C.bg : C.muted,
              background: activeCategory === null ? C.gold : C.dim,
              border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer",
            }}
          >ALL</button>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              style={{
                fontFamily: mono, fontSize: 10, letterSpacing: 1,
                color: activeCategory === cat.id ? C.bg : cat.color,
                background: activeCategory === cat.id ? cat.color : `${cat.color}18`,
                border: `1px solid ${cat.color}40`, borderRadius: 6,
                padding: "6px 14px", cursor: "pointer",
              }}
            >
              {cat.icon} {cat.title.split(" ")[0].toUpperCase()}
            </button>
          ))}
        </div>

        {/* ── Category sections ── */}
        {visible.map(cat => (
          <div key={cat.id} style={{ marginTop: 44 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 6 }}>
              <span style={{ fontSize: 22, color: cat.color }}>{cat.icon}</span>
              <div>
                <h2 style={{ fontFamily: serif, fontSize: 20, color: "#fff", margin: 0 }}>{cat.title}</h2>
                <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, marginTop: 2 }}>{cat.subtitle}</div>
              </div>
              <div style={{
                marginLeft: "auto", fontFamily: mono, fontSize: 10,
                color: cat.color, background: `${cat.color}14`,
                border: `1px solid ${cat.color}30`, borderRadius: 6,
                padding: "4px 12px",
              }}>
                {cat.products.length} PRODUCTS
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
              {cat.products.map(p => (
                <ProductCard key={p.name} p={p} catColor={cat.color} />
              ))}
            </div>
          </div>
        ))}

        {/* ── Vision footer ── */}
        <div style={{
          marginTop: 64,
          background: `linear-gradient(135deg, ${C.gold}0e 0%, ${C.violet}0a 100%)`,
          border: `1px solid ${C.border2}`,
          borderRadius: 14, padding: "36px 40px", textAlign: "center",
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 3, marginBottom: 14 }}>THE LONG VIEW</div>
          <p style={{ fontFamily: serif, fontSize: "clamp(16px,2.5vw,22px)", color: "#fff", lineHeight: 1.6, margin: "0 0 12px" }}>
            This is only the start of the engine.
          </p>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
            Every product, tool, book, and license emerges from the same coherence field.
            As the engine builds out — material synthesis, community crystallization, institutional licensing —
            each new layer increases the value of every layer that came before it.
            The product suite is not a list. It is a living structure.
          </p>
        </div>

        <div style={{ marginTop: 40, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            { href: "/billing",     label: "→ The Course" },
            { href: "/calm-company",label: "→ Calm Company OS" },
            { href: "/social-deploy",label: "→ Social Deploy" },
            { href: "/dimensional-compiler", label: "→ Dimensional Compiler" },
            { href: "/learning-layers", label: "→ Learning in Layers" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{
              fontFamily: mono, fontSize: 11, color: C.gold,
              background: `${C.gold}10`, border: `1px solid ${C.gold}30`,
              borderRadius: 6, padding: "6px 14px", textDecoration: "none",
            }}>{l.label}</a>
          ))}
        </div>
      </div>
    </div>
  );
}

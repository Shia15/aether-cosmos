import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link } from "wouter";
import {
  ANCHORS, pickToday, pickIdea, generateCaption, isoDate,
  loadCustomAnchors, type Bucket, type Anchor,
} from "@/lib/calm-engine";

const KICKER: React.CSSProperties = { fontSize:11, letterSpacing:"0.32em", color:"#fbbf24",
  fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 };

// ── Types & storage ───────────────────────────────────────────────────────────
type Platform = "x" | "linkedin" | "threads" | "instagram";
type PostStatus = "draft" | "approved" | "skipped" | "deployed";
type Slot = "am" | "pm";
type PostState = { caption: string; status: PostStatus; deployedTo: Platform[] };
type DayState = { am: PostState; pm: PostState };
type DeployState = Record<string, DayState>; // keyed by ISO date

const STORAGE_KEY = "aether.socialdeploy.v1";

const PLATFORMS: { id: Platform; name: string; color: string; mode: "intent" | "copyOpen" | "manual"; note: string }[] = [
  { id:"x",         name:"X",         color:"#e5e7eb", mode:"intent",   note:"Opens X composer with your caption pre-filled. One click to post." },
  { id:"linkedin",  name:"LinkedIn",  color:"#60a5fa", mode:"copyOpen", note:"Caption copied to clipboard · opens LinkedIn composer · paste & post." },
  { id:"threads",   name:"Threads",   color:"#a78bfa", mode:"intent",   note:"Opens Threads composer with your caption pre-filled. One click to post." },
  { id:"instagram", name:"Instagram", color:"#f472b6", mode:"manual",   note:"Caption copied · added to manual queue (Instagram requires the app)." },
];

function loadState(): DeployState {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return (parsed && typeof parsed === "object") ? parsed as DeployState : {};
  } catch { return {}; }
}
function saveState(s: DeployState) {
  if (typeof window === "undefined") return;
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* quota */ }
}

// ── Build the next 30 days · pre-write captions for any day not already saved ─
function buildMonth(start: Date, allAnchors: Anchor[], existing: DeployState): DeployState {
  const next: DeployState = { ...existing };
  for (let i = 0; i < 30; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const key = isoDate(d);
    if (next[key]) continue; // user has already touched this day · don't clobber
    const { primary, secondary, anchor } = pickToday(d, allAnchors);
    const seedAm = i, seedPm = i + 3;
    const ami = pickIdea(primary, seedAm);
    const pmi = pickIdea(secondary, seedPm);
    next[key] = {
      am: { caption: generateCaption(primary, ami.idea, ami.format, anchor, "AM", d),
            status: "draft", deployedTo: [] },
      pm: { caption: generateCaption(secondary, pmi.idea, pmi.format, undefined, "PM", d),
            status: "draft", deployedTo: [] },
    };
  }
  return next;
}

// ── Deploy URL builders ───────────────────────────────────────────────────────
function deployUrl(p: Platform, text: string): string | null {
  const t = encodeURIComponent(text);
  switch (p) {
    case "x":         return `https://twitter.com/intent/tweet?text=${t}`;
    case "threads":   return `https://www.threads.net/intent/post?text=${t}`;
    case "linkedin":  return `https://www.linkedin.com/feed/?shareActive=true`; // text won't prefill — clipboard handles it
    case "instagram": return null; // manual
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
function SocialDeployHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const platforms=[
      {x:150,col:"#000000",bg:"#1da1f2",label:"X"},
      {x:300,col:"#000000",bg:"#c13584",label:"IG"},
      {x:450,col:"#000000",bg:"#0a66c2",label:"LI"},
      {x:600,col:"#000000",bg:"#444444",label:"TH"},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      platforms.forEach((p,i)=>{
        const pls=0.9+0.1*Math.sin(t*0.04+i*0.8);
        const r=22*pls;
        ctx.beginPath();ctx.arc(p.x,H/2,r,0,Math.PI*2);ctx.fillStyle=p.bg+"44";ctx.fill();ctx.strokeStyle=p.bg+"cc";ctx.lineWidth=0.7;ctx.stroke();
        ctx.fillStyle=p.bg;ctx.font="bold 9px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(p.label,p.x,H/2+3);ctx.textAlign="left";
        const beams=3;
        for(let b=0;b<beams;b++){
          const angle=(b/beams)*Math.PI*2+t*0.02+i;
          const x2=p.x+Math.cos(angle)*60,y2=H/2+Math.sin(angle)*35;
          ctx.beginPath();ctx.moveTo(p.x,H/2);ctx.lineTo(x2,y2);ctx.strokeStyle=p.bg+Math.round(0.04*255).toString(16).padStart(2,"0");ctx.lineWidth=0.4;ctx.stroke();
        }
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SOCIAL DEPLOY · CALM COMPANY OS · CONTENT ENGINE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SocialDeployPage() {
  const [today] = useState(() => new Date());
  const [state, setState] = useState<DeployState>({});
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // hydrate + auto-generate the next 30 days on first mount
  useEffect(() => {
    const customAnchors = loadCustomAnchors();
    const allAnchors = [...ANCHORS, ...customAnchors];
    const loaded = loadState();
    const built = buildMonth(today, allAnchors, loaded);
    setState(built);
    saveState(built);
    setHydrated(true);
  }, [today]);

  const pingToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 1800);
  }, []);

  const update = useCallback((dateISO: string, slot: Slot, patch: Partial<PostState>) => {
    setState(prev => {
      const day = prev[dateISO];
      if (!day) return prev;
      const next: DeployState = {
        ...prev,
        [dateISO]: { ...day, [slot]: { ...day[slot], ...patch } },
      };
      saveState(next);
      return next;
    });
  }, []);

  const deployTo = useCallback(async (dateISO: string, slot: Slot, platform: Platform) => {
    const day = state[dateISO]; if (!day) return;
    const post = day[slot];
    const text = post.caption;
    // 1) Always copy to clipboard first (works for all platforms)
    try { await navigator.clipboard?.writeText(text); } catch { /* no clipboard */ }
    // 2) Open the appropriate composer
    const url = deployUrl(platform, text);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    // 3) Mark deployed (additive)
    const already = post.deployedTo;
    const deployedTo = already.includes(platform) ? already : [...already, platform];
    const status: PostStatus = "deployed";
    update(dateISO, slot, { deployedTo, status });
    const platName = PLATFORMS.find(p => p.id === platform)!.name;
    if (platform === "instagram") pingToast(`Caption copied · added to Instagram manual queue.`);
    else if (platform === "linkedin") pingToast(`Caption copied · LinkedIn composer opened. Paste & post.`);
    else pingToast(`${platName} composer opened with caption pre-filled.`);
  }, [state, update, pingToast]);

  // Derived data
  const days = useMemo(() => {
    const list: { iso: string; date: Date; day: DayState; primary: Bucket; secondary: Bucket; anchor?: Anchor }[] = [];
    if (!hydrated) return list;
    const customAnchors = loadCustomAnchors();
    const allAnchors = [...ANCHORS, ...customAnchors];
    for (let i = 0; i < 30; i++) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      const iso = isoDate(d);
      const day = state[iso]; if (!day) continue;
      const { primary, secondary, anchor } = pickToday(d, allAnchors);
      list.push({ iso, date: d, day, primary, secondary, anchor });
    }
    return list;
  }, [hydrated, today, state]);

  const stats = useMemo(() => {
    let drafts = 0, approved = 0, skipped = 0, deployed = 0, igQueue = 0;
    days.forEach(({ day }) => {
      [day.am, day.pm].forEach(p => {
        if (p.status === "draft") drafts++;
        else if (p.status === "approved") approved++;
        else if (p.status === "skipped") skipped++;
        else if (p.status === "deployed") deployed++;
        if (p.deployedTo.includes("instagram")) igQueue++;
      });
    });
    return { drafts, approved, skipped, deployed, igQueue };
  }, [days]);

  // Bulk actions
  const approveAllToday = () => {
    const iso = isoDate(today);
    setState(prev => {
      const day = prev[iso]; if (!day) return prev;
      const next: DeployState = { ...prev, [iso]: {
        am: day.am.status === "skipped" || day.am.status === "deployed" ? day.am : { ...day.am, status: "approved" },
        pm: day.pm.status === "skipped" || day.pm.status === "deployed" ? day.pm : { ...day.pm, status: "approved" },
      }};
      saveState(next); return next;
    });
    pingToast("Today's pair approved.");
  };

  const resetMonth = () => {
    if (!window.confirm("Reset all 30 days? Your edits and statuses will be erased and captions re-generated.")) return;
    const customAnchors = loadCustomAnchors();
    const allAnchors = [...ANCHORS, ...customAnchors];
    const fresh = buildMonth(today, allAnchors, {});
    // wipe stored entries first so buildMonth re-creates everything
    saveState(fresh);
    setState(fresh);
    pingToast("Month reset · 60 fresh captions generated.");
  };

  return (
    <div style={{ minHeight:"100vh",
      background:"radial-gradient(ellipse at top, rgba(167,139,250,0.10), rgba(2,6,23,0.95) 50%, rgba(2,6,23,1))",
      padding:"3rem 1.5rem", color:"#e5e7eb",
      fontFamily:"system-ui, -apple-system, 'Segoe UI', sans-serif" }}>
      <div style={{flexShrink:0,marginBottom:20}}>
        <div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SOCIAL DEPLOY · CALM COMPANY OS · CONTENT ENGINE · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>4 platform beam nodes — the live AETHER social deploy simulation.</p></div>
          <SocialDeployHeaderCanvas />
        </div>
      </div>
      <div style={{ maxWidth:1200, margin:"0 auto" }}>

        {/* Header */}
        <header style={{ marginBottom:"2.4rem", padding:"1.8rem 2rem", borderRadius:18,
          background:"linear-gradient(135deg, rgba(244,114,182,0.10), rgba(96,165,250,0.06), rgba(15,23,42,0.85))",
          border:"1px solid rgba(244,114,182,0.3)" }}>
          <div style={KICKER}>AETHER · social deploy · monthly calendar</div>
          <h1 style={{ fontFamily:"'Cinzel',serif", color:"#fef3c7", fontSize:"clamp(1.6rem, 3vw, 2.4rem)",
            margin:"0 0 0.8rem", letterSpacing:"-0.01em" }}>
            One month · pre-written · ready to deploy
          </h1>
          <p style={{ color:"#cbd5e1", fontSize:"1rem", lineHeight:1.65, margin:0, maxWidth:780 }}>
            The next 30 days of posts are generated by your <Link href="/calm-company" style={{ color:"#fbbf24" }}>Calm Company</Link> rotation
            with anchor overrides applied. Edit any caption, approve what you like, then click a platform to deploy. Captions land in your clipboard
            even when the composer can't accept a pre-fill — paste once and post.
          </p>
        </header>

        {/* Honest disclosure */}
        <section style={{ marginBottom:"1.6rem", padding:"1rem 1.2rem", borderRadius:10,
          background:"rgba(251,191,36,0.06)", border:"1px solid rgba(251,191,36,0.25)" }}>
          <div style={{ ...KICKER, color:"#fbbf24" }}>How deploy works today · honest version</div>
          <ul style={{ margin:"0", paddingLeft:"1.2rem", color:"#fef3c7", fontSize:"0.88rem", lineHeight:1.65 }}>
            <li><strong>X &amp; Threads</strong> — opens their official composer with the caption pre-filled. One click to post.</li>
            <li><strong>LinkedIn</strong> — copies the caption to your clipboard and opens LinkedIn's compose window. Paste once and post (no reliable URL pre-fill exists).</li>
            <li><strong>Instagram</strong> — copies the caption and adds to a manual queue at the bottom. IG has no web composer; open the app, paste, attach your image.</li>
            <li><strong>Fully-automated OAuth posting</strong> for all four needs developer-account setup on each platform (X requires $100/mo paid tier · LinkedIn / Threads / IG need app review). When you're ready, we wire it server-side and the same Approve button becomes one-click.</li>
          </ul>
        </section>

        {/* Stats + bulk actions */}
        <section style={{ marginBottom:"1.6rem", padding:"1rem 1.2rem", borderRadius:12,
          background:"rgba(15,23,42,0.7)", border:"1px solid rgba(255,255,255,0.08)",
          display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 130px), 1fr))", gap:"0.7rem" }}>
          {[
            { label:"drafts",   value: stats.drafts,   color:"#94a3b8" },
            { label:"approved", value: stats.approved, color:"#34d399" },
            { label:"deployed", value: stats.deployed, color:"#a78bfa" },
            { label:"skipped",  value: stats.skipped,  color:"#64748b" },
            { label:"IG queue", value: stats.igQueue,  color:"#f472b6" },
          ].map(s => (
            <div key={s.label} style={{ padding:"0.6rem 0.8rem", borderRadius:8,
              background:"rgba(2,6,23,0.6)", border:`1px solid ${s.color}33` }}>
              <div style={{ fontSize:"1.6rem", color:s.color, fontFamily:"'Cinzel',serif", lineHeight:1 }}>{s.value}</div>
              <div style={{ fontSize:"0.7rem", color:"#94a3b8", fontFamily:"'DM Mono',monospace",
                letterSpacing:"0.12em", textTransform:"uppercase", marginTop:4 }}>{s.label}</div>
            </div>
          ))}
          <div style={{ display:"flex", gap:6, alignItems:"center", flexWrap:"wrap" }}>
            <button onClick={approveAllToday} data-testid="btn-approve-today"
              style={{ padding:"0.5rem 0.9rem", borderRadius:6, cursor:"pointer",
                background:"rgba(52,211,153,0.15)", border:"1px solid rgba(52,211,153,0.45)",
                color:"#a7f3d0", fontSize:"0.74rem", fontFamily:"'DM Mono',monospace",
                letterSpacing:"0.1em", textTransform:"uppercase" }}>Approve today</button>
            <button onClick={resetMonth} data-testid="btn-reset-month"
              style={{ padding:"0.5rem 0.9rem", borderRadius:6, cursor:"pointer",
                background:"rgba(239,68,68,0.10)", border:"1px solid rgba(239,68,68,0.4)",
                color:"#fda4af", fontSize:"0.74rem", fontFamily:"'DM Mono',monospace",
                letterSpacing:"0.1em", textTransform:"uppercase" }}>Reset month</button>
          </div>
        </section>

        {/* 30-day calendar */}
        <section data-testid="section-calendar">
          <div style={{ ...KICKER, marginBottom:14 }}>30 days · {days.length} days loaded · 60 posts</div>
          <div style={{ display:"grid", gap:"0.9rem" }}>
            {days.map(({ iso, date, day, primary, secondary, anchor }, i) => (
              <DayCard key={iso} iso={iso} date={date} idx={i} day={day}
                primary={primary} secondary={secondary} anchor={anchor}
                onUpdate={update} onDeploy={deployTo}/>
            ))}
          </div>
        </section>

        {/* Instagram manual queue */}
        <section style={{ marginTop:"2.4rem", padding:"1.4rem 1.5rem", borderRadius:14,
          background:"linear-gradient(135deg, rgba(244,114,182,0.10), rgba(15,23,42,0.7))",
          border:"1px solid rgba(244,114,182,0.35)" }}
          data-testid="section-ig-queue">
          <div style={{ ...KICKER, color:"#f472b6" }}>📷 Instagram · manual post queue</div>
          <h2 style={{ fontFamily:"'Cinzel',serif", color:"#fef3c7", fontSize:"1.3rem", margin:"0 0 0.6rem" }}>
            {stats.igQueue} caption{stats.igQueue === 1 ? "" : "s"} waiting for the app
          </h2>
          <p style={{ fontSize:"0.86rem", color:"#cbd5e1", lineHeight:1.6, margin:"0 0 1rem" }}>
            Instagram has no web composer that accepts pre-filled captions. When you "deploy" a post to Instagram, it gets added here.
            Open the IG app on your phone, paste, attach your image, post. Click "mark posted" once it's done.
          </p>
          {stats.igQueue === 0 && (
            <div style={{ padding:"0.9rem", textAlign:"center", color:"#64748b",
              fontSize:"0.84rem", fontStyle:"italic" }}>
              Empty — deploy a post to Instagram from the calendar above to queue it here.
            </div>
          )}
          <div style={{ display:"grid", gap:6 }}>
            {days.flatMap(({ iso, date, day }) => (["am","pm"] as Slot[]).flatMap(slot => {
              const p = day[slot];
              if (!p.deployedTo.includes("instagram")) return [];
              return [(
                <div key={`${iso}-${slot}`} style={{ display:"grid",
                  gridTemplateColumns:"110px 1fr auto auto", gap:10, alignItems:"center",
                  padding:"0.6rem 0.85rem", borderRadius:8,
                  background:"rgba(15,23,42,0.6)", border:"1px solid rgba(244,114,182,0.25)" }}>
                  <div style={{ fontFamily:"'DM Mono',monospace", color:"#f472b6", fontSize:"0.78rem" }}>
                    {date.toLocaleDateString(undefined, { month:"short", day:"numeric" })} · {slot.toUpperCase()}
                  </div>
                  <div style={{ fontSize:"0.82rem", color:"#fef3c7", lineHeight:1.4,
                    overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
                    {p.caption}
                  </div>
                  <button onClick={() => { navigator.clipboard?.writeText(p.caption); pingToast("Caption copied."); }}
                    style={{ padding:"0.3rem 0.65rem", borderRadius:5, cursor:"pointer",
                      background:"rgba(244,114,182,0.15)", border:"1px solid rgba(244,114,182,0.4)",
                      color:"#fbcfe8", fontSize:"0.7rem", fontFamily:"'DM Mono',monospace",
                      letterSpacing:"0.08em", textTransform:"uppercase" }}>copy</button>
                  <button onClick={() => update(iso, slot, {
                      deployedTo: p.deployedTo.filter(x => x !== "instagram"),
                    })}
                    style={{ padding:"0.3rem 0.65rem", borderRadius:5, cursor:"pointer",
                      background:"rgba(52,211,153,0.10)", border:"1px solid rgba(52,211,153,0.4)",
                      color:"#a7f3d0", fontSize:"0.7rem", fontFamily:"'DM Mono',monospace",
                      letterSpacing:"0.08em", textTransform:"uppercase" }}>posted ✓</button>
                </div>
              )];
            }))}
          </div>
        </section>

        {/* Roadmap */}
        <section style={{ marginTop:"2.4rem", padding:"1.4rem 1.5rem", borderRadius:14,
          background:"rgba(15,23,42,0.6)", border:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={KICKER}>NEXT · true OAuth posting</div>
          <h2 style={{ fontFamily:"'Cinzel',serif", color:"#fef3c7", fontSize:"1.3rem", margin:"0 0 0.6rem" }}>
            What it takes to make every button truly one-click
          </h2>
          <ul style={{ margin:0, paddingLeft:"1.2rem", color:"#e5e7eb", fontSize:"0.88rem", lineHeight:1.7 }}>
            <li><strong style={{ color:"#e5e7eb" }}>X</strong> · X Developer account → approved app → OAuth 2.0 PKCE → <em style={{ color:"#fda4af" }}>$100/mo Basic tier</em> · ~1 day setup once tier is paid.</li>
            <li><strong style={{ color:"#60a5fa" }}>LinkedIn</strong> · LinkedIn Developer app → <code style={{ color:"#fbbf24" }}>w_member_social</code> scope → app review (~1–3 weeks) · free.</li>
            <li><strong style={{ color:"#a78bfa" }}>Threads</strong> · Meta Developer account → Threads API app → linked Threads profile → app review (~1–2 weeks) · free.</li>
            <li><strong style={{ color:"#f472b6" }}>Instagram</strong> · Meta Developer account → IG <em>Business or Creator</em> account linked to a FB Page → <code style={{ color:"#fbbf24" }}>instagram_content_publish</code> → App Review (~2–4 weeks) · free, requires the business-account conversion.</li>
          </ul>
          <div style={{ marginTop:14, padding:"0.7rem 0.9rem", borderRadius:8,
            background:"rgba(167,139,250,0.10)", border:"1px solid rgba(167,139,250,0.3)",
            fontSize:"0.85rem", color:"#fef3c7" }}>
            When you've completed any of these, tell me which one and I'll wire its OAuth + posting endpoint server-side.
            The Approve button on the calendar will then post directly without opening a composer.
          </div>
        </section>

      </div>

      {/* Toast */}
      {toast && (
        <div role="status" data-testid="toast" style={{
          position:"fixed", bottom:24, left:"50%", transform:"translateX(-50%)",
          padding:"0.7rem 1.2rem", borderRadius:10, zIndex:50,
          background:"rgba(15,23,42,0.95)", border:"1px solid rgba(167,139,250,0.5)",
          color:"#fef3c7", fontSize:"0.86rem", fontFamily:"'DM Mono',monospace",
          letterSpacing:"0.05em", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

// ── Day card · two posts per day ──────────────────────────────────────────────
function DayCard({ iso, date, idx, day, primary, secondary, anchor, onUpdate, onDeploy }: {
  iso: string; date: Date; idx: number; day: DayState;
  primary: Bucket; secondary: Bucket; anchor?: Anchor;
  onUpdate: (iso: string, slot: Slot, patch: Partial<PostState>) => void;
  onDeploy: (iso: string, slot: Slot, p: Platform) => void;
}) {
  const dayLabel = date.toLocaleDateString(undefined, { weekday:"short", month:"short", day:"numeric" });
  const isToday = idx === 0;
  return (
    <div data-testid={`daycard-${iso}`}
      style={{ padding:"1rem 1.2rem", borderRadius:12,
        background: anchor
          ? "linear-gradient(135deg, rgba(167,139,250,0.10), rgba(15,23,42,0.75))"
          : "rgba(15,23,42,0.65)",
        border: `1px solid ${anchor ? "rgba(167,139,250,0.4)" : "rgba(255,255,255,0.07)"}`,
        boxShadow: isToday ? "0 0 0 1px rgba(251,191,36,0.5), 0 0 24px rgba(251,191,36,0.15)" : undefined }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        flexWrap:"wrap", gap:8, marginBottom:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontFamily:"'Cinzel',serif", color:"#fef3c7", fontSize:"1.05rem" }}>{dayLabel}</span>
          {isToday && <span style={{ fontSize:"0.62rem", padding:"0.15rem 0.5rem", borderRadius:99,
            background:"rgba(251,191,36,0.2)", border:"1px solid rgba(251,191,36,0.5)",
            color:"#fde68a", fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em",
            textTransform:"uppercase" }}>today</span>}
          {anchor && <span style={{ fontSize:"0.66rem", padding:"0.18rem 0.6rem", borderRadius:99,
            background:"linear-gradient(90deg, #a78bfa, #fbbf24)", color:"#020617",
            fontFamily:"'DM Mono',monospace", letterSpacing:"0.1em", textTransform:"uppercase",
            fontWeight:700 }}>★ {anchor.label}</span>}
        </div>
        <div style={{ fontSize:"0.7rem", color:"#64748b", fontFamily:"'DM Mono',monospace" }}>{iso}</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(min(100%, 360px), 1fr))", gap:10 }}>
        <PostEditor iso={iso} slot="am" bucket={primary}   post={day.am} onUpdate={onUpdate} onDeploy={onDeploy}/>
        <PostEditor iso={iso} slot="pm" bucket={secondary} post={day.pm} onUpdate={onUpdate} onDeploy={onDeploy}/>
      </div>
    </div>
  );
}

function PostEditor({ iso, slot, bucket, post, onUpdate, onDeploy }: {
  iso: string; slot: Slot; bucket: Bucket; post: PostState;
  onUpdate: (iso: string, slot: Slot, patch: Partial<PostState>) => void;
  onDeploy: (iso: string, slot: Slot, p: Platform) => void;
}) {
  const statusColor: Record<PostStatus, string> = {
    draft:"#94a3b8", approved:"#34d399", skipped:"#64748b", deployed:"#a78bfa",
  };
  return (
    <div data-testid={`post-${iso}-${slot}`}
      style={{ padding:"0.85rem 0.95rem", borderRadius:10,
        background:`linear-gradient(135deg, ${bucket.color}1a, rgba(2,6,23,0.6))`,
        border:`1px solid ${bucket.color}44`, borderLeft:`3px solid ${bucket.color}`,
        opacity: post.status === "skipped" ? 0.55 : 1 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
        marginBottom:8, flexWrap:"wrap", gap:6 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:"1.1rem", color:bucket.color }}>{bucket.glyph}</span>
          <span style={{ fontSize:"0.74rem", color:bucket.color, fontFamily:"'DM Mono',monospace",
            letterSpacing:"0.1em", textTransform:"uppercase" }}>
            {slot.toUpperCase()} · {bucket.name}
          </span>
        </div>
        <span style={{ fontSize:"0.62rem", padding:"0.15rem 0.5rem", borderRadius:99,
          background:`${statusColor[post.status]}22`, border:`1px solid ${statusColor[post.status]}66`,
          color:statusColor[post.status], fontFamily:"'DM Mono',monospace",
          letterSpacing:"0.1em", textTransform:"uppercase" }}>{post.status}</span>
      </div>
      <textarea value={post.caption}
        onChange={(e) => onUpdate(iso, slot, { caption: e.target.value, status: post.status === "deployed" ? "deployed" : "draft" })}
        data-testid={`textarea-${iso}-${slot}`}
        rows={4}
        style={{ width:"100%", padding:"0.5rem 0.6rem", borderRadius:6,
          background:"rgba(2,6,23,0.7)", border:"1px solid rgba(255,255,255,0.08)",
          color:"#fef3c7", fontSize:"0.84rem", fontFamily:"inherit", resize:"vertical",
          lineHeight:1.5, marginBottom:8 }}/>
      <div style={{ fontSize:"0.66rem", color:"#64748b", fontFamily:"'DM Mono',monospace",
        marginBottom:8, letterSpacing:"0.06em" }}>
        {post.caption.length} chars · X cap 280
      </div>

      {/* Approve / Skip */}
      <div style={{ display:"flex", gap:6, marginBottom:8 }}>
        <button onClick={() => onUpdate(iso, slot, { status: "approved" })}
          data-testid={`btn-approve-${iso}-${slot}`}
          disabled={post.status === "approved" || post.status === "deployed"}
          style={{ flex:1, padding:"0.4rem 0.6rem", borderRadius:5,
            cursor: (post.status === "approved" || post.status === "deployed") ? "not-allowed" : "pointer",
            background: post.status === "approved" ? "rgba(52,211,153,0.25)" : "rgba(52,211,153,0.10)",
            border:"1px solid rgba(52,211,153,0.45)", color:"#a7f3d0",
            fontSize:"0.7rem", fontFamily:"'DM Mono',monospace",
            letterSpacing:"0.1em", textTransform:"uppercase",
            opacity: (post.status === "deployed" || post.status === "skipped") ? 0.5 : 1 }}>
          ✓ approve
        </button>
        <button onClick={() => onUpdate(iso, slot, { status: post.status === "skipped" ? "draft" : "skipped" })}
          data-testid={`btn-skip-${iso}-${slot}`}
          style={{ flex:1, padding:"0.4rem 0.6rem", borderRadius:5, cursor:"pointer",
            background: post.status === "skipped" ? "rgba(100,116,139,0.3)" : "rgba(100,116,139,0.10)",
            border:"1px solid rgba(100,116,139,0.45)", color:"#cbd5e1",
            fontSize:"0.7rem", fontFamily:"'DM Mono',monospace",
            letterSpacing:"0.1em", textTransform:"uppercase" }}>
          {post.status === "skipped" ? "↺ unskip" : "✕ skip"}
        </button>
      </div>

      {/* Deploy buttons */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:5 }}>
        {PLATFORMS.map(p => {
          const done = post.deployedTo.includes(p.id);
          return (
            <button key={p.id} onClick={() => onDeploy(iso, slot, p.id)}
              data-testid={`btn-deploy-${p.id}-${iso}-${slot}`}
              title={p.note}
              disabled={post.status === "skipped"}
              style={{ padding:"0.4rem 0.3rem", borderRadius:5,
                cursor: post.status === "skipped" ? "not-allowed" : "pointer",
                background: done ? `${p.color}30` : "rgba(2,6,23,0.6)",
                border: `1px solid ${p.color}${done ? "aa" : "55"}`,
                color: done ? p.color : "#e5e7eb",
                fontSize:"0.66rem", fontFamily:"'DM Mono',monospace",
                letterSpacing:"0.06em", textTransform:"uppercase",
                opacity: post.status === "skipped" ? 0.4 : 1 }}>
              {done ? "✓ " : ""}{p.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const C = {
  bg: "#0B0C0F", panel: "rgba(17,19,24,0.86)",
  border: "rgba(232,200,120,0.14)", border2: "rgba(232,200,120,0.32)",
  white: "#DCD8CC", text: "#A89E88", muted: "#60607A", dim: "#383850",
  gold: "#E8C878", goldDim: "#7A6830", goldPale: "#F5E8B0",
  cyan: "#5AB8E8", green: "#6EC87A", rose: "#E06878",
  violet: "#C890E8", amber: "#E87035",
};

type TabKey = "profile" | "features" | "competitors" | "market" | "risks";
type LogEntry = { ts: string; tag: string; msg: string; col: string; };
type Insight = { id: number; tag: string; body: string; col: string; };

interface Feature { id: number; name: string; reach: number; impact: number; confidence: number; effort: number; }
interface Competitor { id: number; name: string; strength: number; price: number; reach: number; differentiation: number; }
interface Risk { id: number; name: string; prob: number; impact: number; }

const TABS: { key: TabKey; label: string; sym: string; col: string }[] = [
  { key: "profile",     label: "Profile",     sym: "◆", col: C.gold },
  { key: "features",    label: "Features · RICE", sym: "▲", col: C.cyan },
  { key: "competitors", label: "Competitors", sym: "⊞", col: C.violet },
  { key: "market",      label: "Market · TAM", sym: "○", col: C.green },
  { key: "risks",       label: "Risk Register", sym: "▼", col: C.rose },
];

function ProductResearchHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const nodes: {x:number;y:number;r:number;phase:number;col:string;label:string}[]=[
      {x:450,y:72,r:20,phase:0,col:"#2ef0d8",label:"AETHER"},
      {x:200,y:40,r:12,phase:1,col:"#c9a84c",label:"MARKET"},
      {x:700,y:40,r:12,phase:2,col:"#9966ff",label:"COMPETE"},
      {x:150,y:110,r:10,phase:3,col:"#44cc77",label:"USERS"},
      {x:350,y:115,r:10,phase:4,col:"#44aaff",label:"TRENDS"},
      {x:550,y:115,r:10,phase:5,col:"#ff4477",label:"GAPS"},
      {x:750,y:110,r:10,phase:6,col:"#c9a84c",label:"OPPS"},
    ];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      nodes.slice(1).forEach(n=>{
        ctx.beginPath();ctx.moveTo(nodes[0].x,nodes[0].y);ctx.lineTo(n.x,n.y);ctx.strokeStyle=n.col+"22";ctx.lineWidth=0.5;ctx.stroke();
      });
      nodes.forEach(n=>{
        const pls=0.85+0.15*Math.sin(t*0.04+n.phase);
        ctx.beginPath();ctx.arc(n.x,n.y,n.r*pls,0,Math.PI*2);ctx.fillStyle=n.col+"22";ctx.fill();ctx.strokeStyle=n.col+"66";ctx.lineWidth=0.7;ctx.stroke();
        ctx.fillStyle=n.col;ctx.font="5px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(n.label,n.x,n.y+2);ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("PRODUCT RESEARCH · MARKET MAP · OPPORTUNITY GRAPH · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function ProductResearchPage() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<TabKey>("profile");
  const tabRef = useRef<TabKey>("profile");
  useEffect(() => { tabRef.current = tab; }, [tab]);

  // PROFILE
  const [name, setName] = useState("New Product");
  const [category, setCategory] = useState("Productivity");
  const [audience, setAudience] = useState("Knowledge workers");
  const [problem, setProblem] = useState("Fragmented research lives in browser tabs and notes.");
  const [solution, setSolution] = useState("Unified research workbench that scores, ranks and surfaces patterns.");

  // FEATURES (RICE)
  const [features, setFeatures] = useState<Feature[]>([
    { id: 1, name: "Search across sources", reach: 800, impact: 3, confidence: 0.9, effort: 4 },
    { id: 2, name: "Auto-summarise findings", reach: 600, impact: 3, confidence: 0.7, effort: 6 },
    { id: 3, name: "Competitor matrix", reach: 400, impact: 2, confidence: 0.85, effort: 3 },
  ]);
  const featIdRef = useRef(4);

  // COMPETITORS
  const [competitors, setCompetitors] = useState<Competitor[]>([
    { id: 1, name: "Notion",  strength: 8, price: 10, reach: 9, differentiation: 4 },
    { id: 2, name: "Airtable", strength: 7, price: 20, reach: 7, differentiation: 5 },
    { id: 3, name: "Coda",     strength: 6, price: 12, reach: 5, differentiation: 6 },
  ]);
  const compIdRef = useRef(4);

  // MARKET
  const [tam, setTam] = useState(50);   // billions $
  const [samPct, setSamPct] = useState(15); // % of TAM
  const [somPct, setSomPct] = useState(8);  // % of SAM
  const [arpu, setArpu] = useState(120); // $/user/year
  const [growth, setGrowth] = useState(18); // % CAGR

  // RISKS
  const [risks, setRisks] = useState<Risk[]>([
    { id: 1, name: "Slow adoption",       prob: 0.6, impact: 0.7 },
    { id: 2, name: "Incumbent response",  prob: 0.4, impact: 0.8 },
    { id: 3, name: "Hiring shortfall",    prob: 0.5, impact: 0.5 },
    { id: 4, name: "Data privacy concerns", prob: 0.3, impact: 0.9 },
  ]);
  const riskIdRef = useRef(5);

  // QUEUE + LOG
  const [insights, setInsights] = useState<Insight[]>([]);
  const insIdRef = useRef(1);
  const [events, setEvents] = useState<LogEntry[]>([]);
  const [conf, setConf] = useState(0.42);

  function pushLog(tag: string, msg: string, col: string) {
    const ts = new Date().toLocaleTimeString("en-US", { hour12: false });
    setEvents(e => [{ ts, tag, msg, col }, ...e].slice(0, 24));
  }
  function pushInsight(tag: string, body: string, col: string) {
    setInsights(q => [{ id: insIdRef.current++, tag, body, col }, ...q].slice(0, 14));
    setConf(c => Math.min(0.99, c + 0.04 * (1 - c)));
  }

  // ==== Computations ====
  const ranked = useMemo(() => {
    return [...features]
      .map(f => ({ ...f, rice: (f.reach * f.impact * f.confidence) / Math.max(0.1, f.effort) }))
      .sort((a, b) => b.rice - a.rice);
  }, [features]);

  const compStats = useMemo(() => {
    if (competitors.length === 0) return { avgPrice: 0, avgStrength: 0, gap: 0 };
    const avgPrice = competitors.reduce((s, c) => s + c.price, 0) / competitors.length;
    const avgStrength = competitors.reduce((s, c) => s + c.strength, 0) / competitors.length;
    const avgDiff = competitors.reduce((s, c) => s + c.differentiation, 0) / competitors.length;
    return { avgPrice, avgStrength, gap: 10 - avgDiff };
  }, [competitors]);

  const market = useMemo(() => {
    const sam = tam * samPct / 100;
    const som = sam * somPct / 100;
    const usersAtCapture = (som * 1e9) / Math.max(1, arpu);
    const fiveYr = som * Math.pow(1 + growth / 100, 5);
    return { tam, sam, som, usersAtCapture, fiveYr };
  }, [tam, samPct, somPct, arpu, growth]);

  const riskScore = useMemo(() => {
    if (risks.length === 0) return { weighted: 0, top: null as Risk | null };
    const weighted = risks.reduce((s, r) => s + r.prob * r.impact, 0) / risks.length;
    const top = risks.reduce((m, r) => (r.prob * r.impact) > (m.prob * m.impact) ? r : m, risks[0]);
    return { weighted, top };
  }, [risks]);

  // ==== Canvas ====
  useEffect(() => {
    const c = cvRef.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let raf = 0;
    let phase = 0;

    function fit() {
      if (!c) return;
      const dpr = window.devicePixelRatio || 1;
      const r = c.getBoundingClientRect();
      c.width = Math.floor(r.width * dpr);
      c.height = Math.floor(r.height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    fit();
    const ro = new ResizeObserver(fit); ro.observe(c);

    function draw() {
      if (!c || !ctx) return;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = "rgba(232,200,120,0.05)";
      ctx.lineWidth = 1;
      const step = 40;
      for (let x = 0; x < w; x += step) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 0; y < h; y += step) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      const t = tabRef.current;
      if (t === "profile")     drawProfile(ctx, w, h, phase);
      else if (t === "features") drawRice(ctx, w, h);
      else if (t === "competitors") drawCompMatrix(ctx, w, h);
      else if (t === "market") drawMarket(ctx, w, h, phase);
      else if (t === "risks")  drawRiskHeat(ctx, w, h);

      phase += 0.012;
      raf = requestAnimationFrame(draw);
    }
    raf = requestAnimationFrame(draw);

    function drawProfile(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // radar over five product axes
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.36;
      const axes = ["Need", "Reach", "Margin", "Speed", "Defence"];
      const vals = [
        Math.min(1, ranked[0]?.rice / 800 || 0.4),
        Math.min(1, market.som / 5),
        Math.min(1, arpu / 300),
        Math.min(1, 1 - features.reduce((s, f) => s + f.effort, 0) / Math.max(1, features.length * 10)),
        Math.min(1, 1 - riskScore.weighted),
      ];
      // rings
      ctx.strokeStyle = "rgba(232,200,120,0.18)";
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath();
        for (let i = 0; i <= axes.length; i++) {
          const a = (i / axes.length) * Math.PI * 2 - Math.PI / 2;
          const rr = R * r / 4;
          const x = cx + Math.cos(a) * rr;
          const y = cy + Math.sin(a) * rr;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // axis lines + labels
      ctx.fillStyle = C.muted;
      ctx.font = "10px 'JetBrains Mono', monospace";
      axes.forEach((lbl, i) => {
        const a = (i / axes.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R;
        const y = cy + Math.sin(a) * R;
        ctx.strokeStyle = "rgba(96,96,122,0.3)";
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = C.muted;
        const lx = cx + Math.cos(a) * (R + 18);
        const ly = cy + Math.sin(a) * (R + 18) + 4;
        ctx.textAlign = "center";
        ctx.fillText(lbl, lx, ly);
      });
      ctx.textAlign = "left";
      // value polygon
      ctx.beginPath();
      vals.forEach((v, i) => {
        const a = (i / axes.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R * v;
        const y = cy + Math.sin(a) * R * v;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fillStyle = "rgba(232,200,120,0.18)";
      ctx.fill();
      ctx.strokeStyle = C.gold;
      ctx.lineWidth = 1.5 + 0.5 * Math.sin(p * 3);
      ctx.stroke();
      // dots
      vals.forEach((v, i) => {
        const a = (i / axes.length) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(a) * R * v;
        const y = cy + Math.sin(a) * R * v;
        ctx.fillStyle = C.goldPale;
        ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();
      });
    }

    function drawRice(ctx: CanvasRenderingContext2D, w: number, h: number) {
      // horizontal bars of RICE score, sorted
      const padL = 200, padR = 40, padT = 30, padB = 30;
      const max = ranked.reduce((m, f) => Math.max(m, f.rice), 1);
      const rowH = (h - padT - padB) / Math.max(1, ranked.length);
      ranked.forEach((f, i) => {
        const y = padT + i * rowH + 6;
        const bw = (f.rice / max) * (w - padL - padR);
        ctx.fillStyle = C.muted;
        ctx.font = "11px 'JetBrains Mono', monospace";
        ctx.fillText(f.name.slice(0, 24), 12, y + rowH * 0.5 + 4);
        // bar
        ctx.fillStyle = i === 0 ? C.gold : i < 3 ? C.cyan : C.muted;
        ctx.fillRect(padL, y + 2, bw, rowH - 16);
        // value
        ctx.fillStyle = C.goldPale;
        ctx.fillText(f.rice.toFixed(1), padL + bw + 8, y + rowH * 0.5 + 4);
      });
      // axis
      ctx.strokeStyle = "rgba(96,96,122,0.5)";
      ctx.beginPath(); ctx.moveTo(padL, padT); ctx.lineTo(padL, h - padB); ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText("RICE = (Reach × Impact × Conf) / Effort", padL, padT - 8);
    }

    function drawCompMatrix(ctx: CanvasRenderingContext2D, w: number, h: number) {
      // scatter: x = strength, y = differentiation, size = reach, color = price tier
      const padL = 60, padR = 60, padT = 40, padB = 60;
      const xMin = 0, xMax = 10, yMin = 0, yMax = 10;
      function px(v: number) { return padL + (v - xMin) / (xMax - xMin) * (w - padL - padR); }
      function py(v: number) { return h - padB - (v - yMin) / (yMax - yMin) * (h - padT - padB); }
      // axes
      ctx.strokeStyle = "rgba(96,96,122,0.5)";
      ctx.beginPath(); ctx.moveTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padL, h - padB); ctx.lineTo(padL, padT); ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("strength →", w - padR - 60, h - padB + 18);
      ctx.save();
      ctx.translate(padL - 26, padT + 80);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText("differentiation →", 0, 0);
      ctx.restore();
      // grid
      ctx.strokeStyle = "rgba(96,96,122,0.15)";
      for (let i = 1; i <= 9; i++) {
        ctx.beginPath(); ctx.moveTo(px(i), padT); ctx.lineTo(px(i), h - padB); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(padL, py(i)); ctx.lineTo(w - padR, py(i)); ctx.stroke();
      }
      // dots
      competitors.forEach(c => {
        const x = px(c.strength), y = py(c.differentiation);
        const r = 6 + c.reach * 0.8;
        const col = c.price < 12 ? C.green : c.price < 25 ? C.gold : C.rose;
        ctx.fillStyle = col + "55";
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = col;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = C.goldPale;
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(c.name, x + r + 4, y + 4);
      });
      // legend
      ctx.fillStyle = C.muted; ctx.font = "9px 'JetBrains Mono', monospace";
      ctx.fillText("price: ", w - padR - 140, padT - 20);
      ctx.fillStyle = C.green; ctx.fillText("● < $12", w - padR - 110, padT - 20);
      ctx.fillStyle = C.gold;  ctx.fillText("● < $25", w - padR - 70,  padT - 20);
      ctx.fillStyle = C.rose;  ctx.fillText("● ≥ $25", w - padR - 30,  padT - 20);
    }

    function drawMarket(ctx: CanvasRenderingContext2D, w: number, h: number, p: number) {
      // three nested circles TAM > SAM > SOM with labels and pulse
      const cx = w / 2, cy = h / 2;
      const Rmax = Math.min(w, h) * 0.4;
      const rT = Rmax;
      const rS = Rmax * Math.sqrt(samPct / 100);
      const rO = Rmax * Math.sqrt(samPct / 100) * Math.sqrt(somPct / 100);
      // TAM
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5;
      ctx.fillStyle = "rgba(232,200,120,0.07)";
      ctx.beginPath(); ctx.arc(cx, cy, rT, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // SAM
      ctx.strokeStyle = C.cyan;
      ctx.fillStyle = "rgba(90,184,232,0.10)";
      ctx.beginPath(); ctx.arc(cx, cy, rS, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // SOM (radius is strictly area-proportional; only stroke glow animates)
      const glow = 0.5 + 0.5 * (0.5 + 0.5 * Math.sin(p * 3));
      ctx.strokeStyle = C.green;
      ctx.lineWidth = 1 + 1.5 * glow;
      ctx.fillStyle = "rgba(110,200,122,0.20)";
      ctx.beginPath(); ctx.arc(cx, cy, rO, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 1.5;
      // labels
      ctx.fillStyle = C.gold;
      ctx.font = "11px 'JetBrains Mono', monospace";
      ctx.fillText(`TAM  $${market.tam.toFixed(1)}B`, cx - rT, cy - rT - 8);
      ctx.fillStyle = C.cyan;
      ctx.fillText(`SAM  $${market.sam.toFixed(2)}B`, cx - rS, cy - rS - 8);
      ctx.fillStyle = C.green;
      ctx.textAlign = "center";
      ctx.fillText(`SOM  $${market.som.toFixed(3)}B`, cx, cy + 4);
      ctx.fillText(`5-yr  $${market.fiveYr.toFixed(2)}B`, cx, cy + 18);
      ctx.textAlign = "left";
    }

    function drawRiskHeat(ctx: CanvasRenderingContext2D, w: number, h: number) {
      // probability × impact heat-map with risks plotted
      const padL = 60, padR = 40, padT = 40, padB = 60;
      // background heat gradient quadrants
      const gradW = (w - padL - padR), gradH = (h - padT - padB);
      const cellN = 10;
      const cw = gradW / cellN, ch = gradH / cellN;
      for (let i = 0; i < cellN; i++) {
        for (let j = 0; j < cellN; j++) {
          const px = padL + i * cw;
          const py = h - padB - (j + 1) * ch;
          const heat = ((i + 0.5) / cellN) * ((j + 0.5) / cellN);
          let col;
          if (heat < 0.15) col = "rgba(110,200,122,0.10)";
          else if (heat < 0.4) col = "rgba(232,200,120,0.12)";
          else if (heat < 0.7) col = "rgba(232,112,53,0.16)";
          else col = "rgba(224,104,120,0.22)";
          ctx.fillStyle = col;
          ctx.fillRect(px, py, cw - 1, ch - 1);
        }
      }
      // axes
      ctx.strokeStyle = "rgba(96,96,122,0.5)";
      ctx.beginPath(); ctx.moveTo(padL, h - padB); ctx.lineTo(w - padR, h - padB); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(padL, h - padB); ctx.lineTo(padL, padT); ctx.stroke();
      ctx.fillStyle = C.muted;
      ctx.font = "10px 'JetBrains Mono', monospace";
      ctx.fillText("probability →", w - padR - 80, h - padB + 18);
      ctx.save(); ctx.translate(padL - 26, padT + 80); ctx.rotate(-Math.PI / 2);
      ctx.fillText("impact →", 0, 0); ctx.restore();
      // risk dots
      risks.forEach(r => {
        const x = padL + r.prob * gradW;
        const y = h - padB - r.impact * gradH;
        const score = r.prob * r.impact;
        const col = score > 0.5 ? C.rose : score > 0.25 ? C.amber : C.green;
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(11,12,15,0.8)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = C.goldPale;
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillText(r.name.slice(0, 22), x + 10, y + 4);
      });
    }

    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [ranked, competitors, market, risks, features, arpu, riskScore.weighted, samPct, somPct]);

  // ==== Handlers ====
  function addFeature() {
    const f: Feature = { id: featIdRef.current++, name: `Feature ${features.length + 1}`, reach: 200, impact: 2, confidence: 0.7, effort: 3 };
    setFeatures(arr => [...arr, f]);
    pushLog("FEAT+", `Added "${f.name}"`, C.cyan);
  }
  function removeFeature(id: number) {
    setFeatures(arr => arr.filter(f => f.id !== id));
    pushLog("FEAT−", `Removed feature ${id}`, C.muted);
  }
  function updateFeature(id: number, field: keyof Feature, val: any) {
    setFeatures(arr => arr.map(f => f.id === id ? { ...f, [field]: val } : f));
  }
  function rankFeatures() {
    const top = ranked[0];
    if (!top) return;
    pushInsight("RANK", `Top feature: "${top.name}" (RICE ${top.rice.toFixed(1)})`, C.cyan);
    pushLog("RANK", `Top RICE = ${top.name} · ${top.rice.toFixed(1)}`, C.cyan);
  }

  function addCompetitor() {
    const c: Competitor = { id: compIdRef.current++, name: `Competitor ${competitors.length + 1}`, strength: 5, price: 15, reach: 5, differentiation: 5 };
    setCompetitors(arr => [...arr, c]);
    pushLog("COMP+", `Added "${c.name}"`, C.violet);
  }
  function removeCompetitor(id: number) {
    setCompetitors(arr => arr.filter(c => c.id !== id));
    pushLog("COMP−", `Removed competitor ${id}`, C.muted);
  }
  function updateCompetitor(id: number, field: keyof Competitor, val: any) {
    setCompetitors(arr => arr.map(c => c.id === id ? { ...c, [field]: val } : c));
  }
  function analyseGap() {
    pushInsight("GAP", `Avg differentiation low → ${compStats.gap.toFixed(1)}/10 of room available`, C.violet);
    pushLog("GAP", `Differentiation gap = ${compStats.gap.toFixed(1)}`, C.violet);
  }

  function addRisk() {
    const r: Risk = { id: riskIdRef.current++, name: `Risk ${risks.length + 1}`, prob: 0.3, impact: 0.5 };
    setRisks(arr => [...arr, r]);
    pushLog("RISK+", `Added "${r.name}"`, C.rose);
  }
  function removeRisk(id: number) {
    setRisks(arr => arr.filter(r => r.id !== id));
    pushLog("RISK−", `Removed risk ${id}`, C.muted);
  }
  function updateRisk(id: number, field: keyof Risk, val: any) {
    setRisks(arr => arr.map(r => r.id === id ? { ...r, [field]: val } : r));
  }
  function flagTop() {
    if (!riskScore.top) return;
    pushInsight("RISK", `Top risk: "${riskScore.top.name}" (score ${(riskScore.top.prob * riskScore.top.impact).toFixed(2)})`, C.rose);
    pushLog("RISK", `Top = ${riskScore.top.name}`, C.rose);
  }

  function snapshotMarket() {
    pushInsight("MKT", `SOM ≈ $${market.som.toFixed(3)}B · ${Math.round(market.usersAtCapture).toLocaleString()} users at $${arpu}`, C.green);
    pushLog("MKT", `SOM=${market.som.toFixed(3)}B fiveYr=${market.fiveYr.toFixed(2)}B`, C.green);
  }
  function snapshotProfile() {
    pushInsight("BRIEF", `${name} · ${category} → ${audience}`, C.gold);
    pushLog("BRIEF", `${name} captured`, C.gold);
  }

  function clearInsights() { setInsights([]); setConf(0.42); pushLog("CTRL", "Insight queue cleared", C.muted); }

  useEffect(() => {
    pushLog("INIT", "Product Research engine online", C.gold);
    pushLog("READY", "Profile · features · competitors · market · risks", C.cyan);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const active = TABS.find(t => t.key === tab)!;

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ background: C.bg, color: C.text, fontFamily: "'JetBrains Mono', monospace" }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 0",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>PRODUCT RESEARCH · MARKET MAP · OPPORTUNITY GRAPH · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>7 market nodes — the live AETHER product research simulation.</p></div>
          <ProductResearchHeaderCanvas />
        </div>
      </div>
      <header className="px-8 pt-8 pb-4 border-b" style={{ borderColor: C.border }}>
        <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: C.muted }}>
          AETHER · PRODUCT RESEARCH ENGINE · APRIL 2026
        </div>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 44, color: C.white, letterSpacing: "0.04em" }}>
          Product Research
        </div>
        <div className="text-sm mt-2" style={{ color: C.text }}>
          Profile · RICE prioritisation · competitor matrix · TAM/SAM/SOM sizing · risk register — one workbench, every signal coupled
        </div>
      </header>

      <section className="px-8 pt-6">
        <div className="flex gap-2 flex-wrap" data-testid="research-tabs">
          {TABS.map(t => {
            const isOn = tab === t.key;
            return (
              <button key={t.key}
                onClick={() => { setTab(t.key); pushLog("TAB", `Workbench → ${t.label}`, t.col); }}
                data-testid={`tab-${t.key}`}
                aria-pressed={isOn}
                aria-label={`Open ${t.label} workbench`}
                className="px-4 py-2 text-xs tracking-[0.2em] uppercase border transition-all"
                style={{
                  borderColor: isOn ? t.col : C.border,
                  color: isOn ? t.col : C.muted,
                  background: isOn ? t.col + "15" : "transparent",
                }}>
                <span style={{ marginRight: 10, fontFamily: "'Cinzel', serif" }}>{t.sym}</span>{t.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="flex-1 px-8 pt-6 pb-8 grid gap-6" style={{ gridTemplateColumns: "minmax(0, 1fr) 320px" }}>
        <div className="space-y-4 min-w-0">
          {/* CANVAS */}
          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: active.col }}>
                ◉ {active.label} · live render
              </div>
              <div className="text-[10px]" style={{ color: C.muted }}>
                insights: <span style={{ color: C.gold }}>{insights.length}</span> · confidence:&nbsp;
                <span style={{ color: C.green }}>{(conf * 100).toFixed(0)}%</span>
              </div>
            </div>
            <canvas ref={cvRef} data-testid="research-canvas" style={{ width: "100%", height: 360, display: "block" }} />
          </div>

          {tab === "profile" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.gold }}>◉ Product brief</div>
              <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <Field label="Name"     value={name}     onChange={setName}     test="input-name" />
                <Field label="Category" value={category} onChange={setCategory} test="input-category" />
                <Field label="Audience" value={audience} onChange={setAudience} test="input-audience" />
                <Field label="Problem"  value={problem}  onChange={setProblem}  test="input-problem" textarea />
                <Field label="Solution" value={solution} onChange={setSolution} test="input-solution" textarea />
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={snapshotProfile} data-testid="btn-snapshot-profile"
                  className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border"
                  style={{ borderColor: C.border2, color: C.gold }}>capture brief</button>
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                The radar above scores the brief on Need · Reach · Margin · Speed · Defence — recomputed live as you tune the other tabs.
              </div>
            </div>
          )}

          {tab === "features" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs tracking-[0.2em] uppercase" style={{ color: C.cyan }}>◉ Feature backlog · RICE scoring</div>
                <div className="flex gap-2">
                  <button onClick={addFeature} data-testid="btn-add-feature"
                    className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.cyan }}>+ feature</button>
                  <button onClick={rankFeatures} data-testid="btn-rank"
                    className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.gold }}>rank</button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="grid gap-2 text-[10px] tracking-[0.15em] uppercase" style={{ color: C.muted, gridTemplateColumns: "minmax(0,2fr) 70px 60px 70px 60px 70px 30px" }}>
                  <span>Feature</span><span>Reach</span><span>Impact</span><span>Conf</span><span>Effort</span><span style={{ color: C.gold }}>RICE</span><span></span>
                </div>
                {ranked.map(f => (
                  <div key={f.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "minmax(0,2fr) 70px 60px 70px 60px 70px 30px" }}>
                    <input value={f.name} onChange={e => updateFeature(f.id, "name", e.target.value)}
                      data-testid={`feat-name-${f.id}`} aria-label="Feature name"
                      className="bg-transparent border px-2 py-1 text-[12px]" style={{ borderColor: C.border2, color: C.goldPale }} />
                    <NumIn value={f.reach}      onChange={v => updateFeature(f.id, "reach", v)}      test={`feat-reach-${f.id}`} />
                    <NumIn value={f.impact}     onChange={v => updateFeature(f.id, "impact", v)}     step={0.5} test={`feat-impact-${f.id}`} />
                    <NumIn value={f.confidence} onChange={v => updateFeature(f.id, "confidence", v)} step={0.05} test={`feat-conf-${f.id}`} />
                    <NumIn value={f.effort}     onChange={v => updateFeature(f.id, "effort", v)}     step={0.5} test={`feat-effort-${f.id}`} />
                    <span className="text-[12px] text-right" style={{ color: C.gold }}>{f.rice.toFixed(1)}</span>
                    <button onClick={() => removeFeature(f.id)} data-testid={`feat-rm-${f.id}`} aria-label="Remove feature"
                      className="text-[14px]" style={{ color: C.muted }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "competitors" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs tracking-[0.2em] uppercase" style={{ color: C.violet }}>◉ Competitor matrix</div>
                <div className="flex gap-2">
                  <button onClick={addCompetitor} data-testid="btn-add-competitor"
                    className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.violet }}>+ competitor</button>
                  <button onClick={analyseGap} data-testid="btn-analyse-gap"
                    className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.gold }}>analyse gap</button>
                </div>
              </div>
              <div className="grid gap-2 text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: C.muted, gridTemplateColumns: "minmax(0,2fr) 70px 70px 70px 90px 30px" }}>
                <span>Name</span><span>Strength</span><span>Price $</span><span>Reach</span><span>Diff.</span><span></span>
              </div>
              {competitors.map(c => (
                <div key={c.id} className="grid gap-2 items-center mb-2" style={{ gridTemplateColumns: "minmax(0,2fr) 70px 70px 70px 90px 30px" }}>
                  <input value={c.name} onChange={e => updateCompetitor(c.id, "name", e.target.value)}
                    data-testid={`comp-name-${c.id}`} aria-label="Competitor name"
                    className="bg-transparent border px-2 py-1 text-[12px]" style={{ borderColor: C.border2, color: C.goldPale }} />
                  <NumIn value={c.strength}        onChange={v => updateCompetitor(c.id, "strength", v)}        test={`comp-str-${c.id}`} />
                  <NumIn value={c.price}           onChange={v => updateCompetitor(c.id, "price", v)}           test={`comp-price-${c.id}`} />
                  <NumIn value={c.reach}           onChange={v => updateCompetitor(c.id, "reach", v)}           test={`comp-reach-${c.id}`} />
                  <NumIn value={c.differentiation} onChange={v => updateCompetitor(c.id, "differentiation", v)} test={`comp-diff-${c.id}`} />
                  <button onClick={() => removeCompetitor(c.id)} data-testid={`comp-rm-${c.id}`} aria-label="Remove competitor"
                    className="text-[14px]" style={{ color: C.muted }}>×</button>
                </div>
              ))}
              <div className="grid gap-3 mt-4 text-[11px]" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                <Stat k="avg price" v={`$${compStats.avgPrice.toFixed(1)}`} c={C.gold} />
                <Stat k="avg strength" v={compStats.avgStrength.toFixed(1)} c={C.cyan} />
                <Stat k="diff. gap" v={`${compStats.gap.toFixed(1)} / 10`} c={C.violet} />
              </div>
            </div>
          )}

          {tab === "market" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="text-xs tracking-[0.2em] uppercase mb-4" style={{ color: C.green }}>◉ Market sizing · TAM ▷ SAM ▷ SOM</div>
              <div className="grid gap-6" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <div className="space-y-3">
                  <Slider id="tam"     label="TAM ($B)"          value={tam}     min={1}  max={500}  step={1}    col={C.gold}  fmt={v => v.toFixed(0)} onChange={setTam} />
                  <Slider id="sam"     label="SAM (% of TAM)"     value={samPct}  min={1}  max={60}   step={1}    col={C.cyan}  fmt={v => `${v.toFixed(0)} %`} onChange={setSamPct} />
                  <Slider id="som"     label="SOM (% of SAM)"     value={somPct}  min={1}  max={50}   step={1}    col={C.green} fmt={v => `${v.toFixed(0)} %`} onChange={setSomPct} />
                  <Slider id="arpu"    label="ARPU ($/yr)"        value={arpu}    min={10} max={1000} step={10}   col={C.amber} fmt={v => `$${v.toFixed(0)}`} onChange={setArpu} />
                  <Slider id="growth"  label="CAGR (%)"           value={growth}  min={0}  max={60}   step={1}    col={C.violet} fmt={v => `${v.toFixed(0)} %`} onChange={setGrowth} />
                  <button onClick={snapshotMarket} data-testid="btn-snapshot-market"
                    className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border mt-2" style={{ borderColor: C.border2, color: C.green }}>snapshot</button>
                </div>
                <div className="text-[11px] space-y-1" style={{ color: C.text }}>
                  <Row k="TAM"            v={`$${market.tam.toFixed(1)} B`}  c={C.gold} />
                  <Row k="SAM"            v={`$${market.sam.toFixed(2)} B`}  c={C.cyan} />
                  <Row k="SOM"            v={`$${market.som.toFixed(3)} B`}  c={C.green} />
                  <Row k="users @ ARPU"   v={Math.round(market.usersAtCapture).toLocaleString()} c={C.amber} />
                  <Row k="SOM in 5 yrs"   v={`$${market.fiveYr.toFixed(2)} B`} c={C.violet} />
                  <Row k="growth"         v={`${growth.toFixed(0)} % CAGR`}  c={C.muted} />
                </div>
              </div>
              <div className="text-[10px] mt-4 leading-relaxed" style={{ color: C.muted }}>
                TAM = total addressable · SAM = serviceable addressable · SOM = obtainable in 3-yr window. Areas (not radii) are proportional in the canvas.
              </div>
            </div>
          )}

          {tab === "risks" && (
            <div className="border p-5" style={{ borderColor: C.border, background: C.panel }}>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xs tracking-[0.2em] uppercase" style={{ color: C.rose }}>◉ Risk register</div>
                <div className="flex gap-2">
                  <button onClick={addRisk} data-testid="btn-add-risk"
                    className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.rose }}>+ risk</button>
                  <button onClick={flagTop} data-testid="btn-flag-top"
                    className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase border" style={{ borderColor: C.border2, color: C.gold }}>flag top</button>
                </div>
              </div>
              <div className="grid gap-2 text-[10px] tracking-[0.15em] uppercase mb-2" style={{ color: C.muted, gridTemplateColumns: "minmax(0,2fr) 110px 110px 70px 30px" }}>
                <span>Risk</span><span>Probability</span><span>Impact</span><span style={{ color: C.gold }}>Score</span><span></span>
              </div>
              {risks.map(r => (
                <div key={r.id} className="grid gap-2 items-center mb-2" style={{ gridTemplateColumns: "minmax(0,2fr) 110px 110px 70px 30px" }}>
                  <input value={r.name} onChange={e => updateRisk(r.id, "name", e.target.value)}
                    data-testid={`risk-name-${r.id}`} aria-label="Risk name"
                    className="bg-transparent border px-2 py-1 text-[12px]" style={{ borderColor: C.border2, color: C.goldPale }} />
                  <input type="range" min={0} max={1} step={0.05} value={r.prob}
                    onChange={e => updateRisk(r.id, "prob", parseFloat(e.target.value))}
                    data-testid={`risk-prob-${r.id}`} aria-label="Probability" className="w-full" />
                  <input type="range" min={0} max={1} step={0.05} value={r.impact}
                    onChange={e => updateRisk(r.id, "impact", parseFloat(e.target.value))}
                    data-testid={`risk-impact-${r.id}`} aria-label="Impact" className="w-full" />
                  <span className="text-[12px] text-right" style={{ color: r.prob * r.impact > 0.5 ? C.rose : r.prob * r.impact > 0.25 ? C.amber : C.green }}>
                    {(r.prob * r.impact).toFixed(2)}
                  </span>
                  <button onClick={() => removeRisk(r.id)} data-testid={`risk-rm-${r.id}`} aria-label="Remove risk"
                    className="text-[14px]" style={{ color: C.muted }}>×</button>
                </div>
              ))}
              <div className="text-[11px] mt-4" style={{ color: C.text }}>
                <Row k="weighted risk" v={riskScore.weighted.toFixed(3)} c={C.rose} />
                <Row k="top risk" v={riskScore.top?.name || "—"} c={C.amber} />
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="border p-4" style={{ borderColor: C.border, background: C.panel }}>
            <div className="text-xs tracking-[0.2em] uppercase mb-3" style={{ color: C.muted }}>Telemetry</div>
            <div className="text-[11px] space-y-1" style={{ color: C.text }}>
              <Row k="active workbench" v={active.label} c={active.col} />
              <Row k="features" v={features.length.toString()} c={C.cyan} />
              <Row k="competitors" v={competitors.length.toString()} c={C.violet} />
              <Row k="risks" v={risks.length.toString()} c={C.rose} />
              <Row k="SOM" v={`$${market.som.toFixed(2)} B`} c={C.green} />
              <Row k="weighted risk" v={riskScore.weighted.toFixed(2)} c={C.rose} />
              <Row k="confidence" v={`${(conf * 100).toFixed(0)} %`} c={C.gold} />
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: C.border }}>
              <div className="text-xs tracking-[0.2em] uppercase" style={{ color: C.gold }}>Insight Queue</div>
              <button onClick={clearInsights} data-testid="btn-clear-insights" aria-label="Clear insights"
                className="text-[9px] tracking-[0.2em] uppercase px-2 py-1 border" style={{ borderColor: C.border2, color: C.muted }}>
                clear
              </button>
            </div>
            <div className="p-3 space-y-2 text-[10px]" style={{ maxHeight: 220, overflowY: "auto" }} data-testid="insight-list">
              <AnimatePresence initial={false}>
                {insights.map(q => (
                  <motion.div key={q.id}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="border-l-2 pl-2" style={{ borderColor: q.col }}>
                    <div style={{ color: q.col }}>{q.tag}</div>
                    <div style={{ color: C.goldPale }}>{q.body}</div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {insights.length === 0 && <div style={{ color: C.muted }}>no insights yet — capture or rank</div>}
            </div>
          </div>

          <div className="border" style={{ borderColor: C.border, background: C.panel }}>
            <div className="px-4 py-2 border-b text-xs tracking-[0.2em] uppercase" style={{ borderColor: C.border, color: C.gold }}>Event Log</div>
            <div className="p-3 space-y-1 text-[10px]" style={{ maxHeight: 200, overflowY: "auto" }} data-testid="event-log">
              <AnimatePresence initial={false}>
                {events.map((e, i) => (
                  <motion.div key={`${e.ts}-${i}`}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}>
                    <span style={{ color: C.muted }}>{e.ts}</span>{" "}
                    <span style={{ color: e.col }}>[{e.tag}]</span>{" "}
                    <span>{e.msg}</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </aside>
      </section>

      <footer className="px-8 py-4 border-t flex items-center justify-between text-[10px] tracking-[0.3em] uppercase"
              style={{ borderColor: C.border, color: C.muted }}>
        <div>◆ &nbsp; ▲ &nbsp; ⊞ &nbsp; ○ &nbsp; ▼ &nbsp; · &nbsp; profile · features · competitors · market · risks</div>
        <div>Product Research · AETHER OS</div>
      </footer>
    </div>
  );
}

function Field({ label, value, onChange, test, textarea }: { label: string; value: string; onChange: (v: string) => void; test: string; textarea?: boolean }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.2em] uppercase mb-1" style={{ color: "#60607A" }}>{label}</div>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)}
          data-testid={test} aria-label={label} rows={2}
          className="w-full bg-transparent border px-2 py-2 text-[12px]" style={{ borderColor: "rgba(232,200,120,0.32)", color: "#F5E8B0", resize: "vertical" }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)}
          data-testid={test} aria-label={label}
          className="w-full bg-transparent border px-2 py-2 text-[12px]" style={{ borderColor: "rgba(232,200,120,0.32)", color: "#F5E8B0" }} />
      )}
    </div>
  );
}

function NumIn({ value, onChange, step, test }: { value: number; onChange: (v: number) => void; step?: number; test: string }) {
  return (
    <input type="number" value={value} step={step || 1}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      data-testid={test} aria-label="number"
      className="bg-transparent border px-2 py-1 text-[12px]" style={{ borderColor: "rgba(232,200,120,0.32)", color: "#F5E8B0" }} />
  );
}

function Row({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span style={{ color: "#60607A" }}>{k}</span>
      <span style={{ color: c, textAlign: "right" }}>{v}</span>
    </div>
  );
}

function Stat({ k, v, c }: { k: string; v: string; c: string }) {
  return (
    <div className="border p-2" style={{ borderColor: "rgba(232,200,120,0.14)" }}>
      <div className="text-[9px] tracking-[0.2em] uppercase" style={{ color: "#60607A" }}>{k}</div>
      <div style={{ color: c, fontSize: 14 }}>{v}</div>
    </div>
  );
}

function Slider({ id, label, value, min, max, step, col, onChange, fmt }:
  { id: string; label: string; value: number; min: number; max: number; step: number; col: string; onChange: (v: number) => void; fmt: (v: number) => string }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span style={{ color: "#60607A" }}>{label}</span>
        <span style={{ color: col }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        data-testid={`slider-${id}`}
        aria-label={label}
        className="w-full" />
    </div>
  );
}

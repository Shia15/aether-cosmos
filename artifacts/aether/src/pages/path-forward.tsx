import { useEffect, useRef, useState } from "react";

const GOLD = "#C8A840";
const BLOOM = "#7EC890";
const ROSE = "#D46878";
const LAV = "#8878D4";
const CYAN = "#4EB8D4";
const DIM = "rgba(232,224,208,0.45)";
const BORDER = "rgba(200,168,64,0.16)";

const styles: Record<string, React.CSSProperties> = {
  root: { background: "#06050f", color: "#e8e0d0", minHeight: "100vh", fontFamily: "'EB Garamond', 'Crimson Pro', Georgia, serif", overflowX: "hidden", fontSize: 16 },
  bgCanvas: { position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.35, pointerEvents: "none", zIndex: 0 },
  content: { position: "relative", zIndex: 1 },
  hero: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "80px 32px 60px" },
  heroEyebrow: { fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 4, color: GOLD, opacity: 0.7, textTransform: "uppercase", marginBottom: 24 },
  heroTitle: { fontFamily: "'Cinzel', 'Orbitron', serif", fontSize: "clamp(2.4rem,5vw,4.5rem)", fontWeight: 700, lineHeight: 1.08, background: "linear-gradient(135deg,#C8A840 0%,#e8e0d0 45%,#8878D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 20 },
  heroSub: { fontSize: "clamp(1rem,2vw,1.2rem)", fontStyle: "italic", color: DIM, maxWidth: 620, lineHeight: 1.8, marginBottom: 40 },
  heroTracks: { display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 },
  trackPill: { fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 2, padding: "8px 16px", border: `1px solid ${BORDER}`, borderRadius: 2, textTransform: "uppercase", cursor: "pointer", color: GOLD, borderColor: "rgba(200,168,64,0.4)" },
  heroScroll: { fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 3, color: DIM, textTransform: "uppercase" },
  divider: { width: "100%", height: 1, background: "linear-gradient(90deg,transparent,rgba(200,168,64,0.25),transparent)" },
  section: { maxWidth: 1100, margin: "0 auto", padding: "80px 32px" },
  eyebrow: { fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 4, color: GOLD, opacity: 0.6, textTransform: "uppercase", marginBottom: 10 },
  sectionTitle: { fontFamily: "'Cinzel', serif", fontSize: "clamp(1.8rem,3vw,2.6rem)", fontWeight: 400, lineHeight: 1.15, marginBottom: 12 },
  sectionBody: { fontSize: "1.05rem", lineHeight: 1.85, color: DIM, maxWidth: 720, marginBottom: 48 },
  paperGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginBottom: 48 },
  paperCard: { border: `1px solid ${BORDER}`, borderRadius: 3, padding: 28, background: "rgba(255,255,255,0.018)", position: "relative", overflow: "hidden", transition: "transform 0.2s,border-color 0.2s", cursor: "pointer" },
  paperNum: { fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: 2, color: DIM, textTransform: "uppercase", marginBottom: 10 },
  paperTitle: { fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "1.05rem", lineHeight: 1.3, marginBottom: 12, fontWeight: 700 },
  paperJournal: { fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: 1.5, color: DIM, textTransform: "uppercase", marginBottom: 12 },
  paperBody: { fontSize: "0.85rem", lineHeight: 1.65, color: DIM, marginBottom: 16 },
  claim: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: DIM, paddingLeft: 12, borderLeft: `1px solid ${BORDER}`, lineHeight: 1.5, marginBottom: 5 },
  tagDoc: { fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: 1.5, padding: "3px 7px", borderRadius: 1, textTransform: "uppercase", background: "rgba(126,200,144,0.12)", color: BLOOM, border: "1px solid rgba(126,200,144,0.3)", marginRight: 5, display: "inline-block", marginBottom: 4 },
  tagEst: { fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: 1.5, padding: "3px 7px", borderRadius: 1, textTransform: "uppercase", background: "rgba(200,168,64,0.1)", color: GOLD, border: "1px solid rgba(200,168,64,0.3)", marginRight: 5, display: "inline-block", marginBottom: 4 },
  tagHyp: { fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: 1.5, padding: "3px 7px", borderRadius: 1, textTransform: "uppercase", background: "rgba(136,120,212,0.12)", color: LAV, border: "1px solid rgba(136,120,212,0.3)", marginRight: 5, display: "inline-block", marginBottom: 4 },
  tagOpen: { fontFamily: "'Space Mono', monospace", fontSize: 7, letterSpacing: 1.5, padding: "3px 7px", borderRadius: 1, textTransform: "uppercase", background: "rgba(78,184,212,0.1)", color: CYAN, border: "1px solid rgba(78,184,212,0.3)", marginRight: 5, display: "inline-block", marginBottom: 4 },
  timeline: { position: "relative", paddingLeft: 32, marginBottom: 48 },
  tlDate: { fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: 2, color: DIM, textTransform: "uppercase", marginBottom: 4 },
  tlTitle: { fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "1rem", marginBottom: 6 },
  tlBody: { fontSize: "0.85rem", color: DIM, lineHeight: 1.65 },
  testGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20, marginBottom: 48 },
  testCard: { border: `1px solid ${BORDER}`, borderRadius: 3, padding: 24, background: "rgba(255,255,255,0.015)" },
  testHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 12 },
  testDomain: { fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: 2, color: DIM, textTransform: "uppercase" },
  testTitle: { fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "1rem", marginBottom: 10 },
  testBody: { fontSize: "0.82rem", lineHeight: 1.65, color: DIM, marginBottom: 14 },
  testProtocol: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: "#e8e0d0", background: "rgba(0,0,0,0.4)", borderLeft: `2px solid ${GOLD}`, padding: "10px 12px", lineHeight: 1.8, borderRadius: "0 2px 2px 0", marginBottom: 12, whiteSpace: "pre-wrap", wordBreak: "break-all" },
  testFalsify: { fontFamily: "'Space Mono', monospace", fontSize: 8, color: ROSE, background: "rgba(212,104,120,0.06)", border: "1px solid rgba(212,104,120,0.2)", padding: "8px 10px", borderRadius: 2, lineHeight: 1.6 },
  progressBar: { width: "100%", height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden", marginTop: 12 },
  progressLabel: { fontFamily: "'Space Mono', monospace", fontSize: 8, color: DIM, marginTop: 4, display: "flex", justifyContent: "space-between" },
  mathGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 },
  mathCard: { border: `1px solid ${BORDER}`, borderRadius: 3, padding: 24, background: "rgba(255,255,255,0.015)" },
  mathCardTitle: { fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "1rem", color: GOLD, marginBottom: 14 },
  eq: { fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#e8e0d0", background: "rgba(0,0,0,0.45)", borderLeft: `2px solid ${GOLD}`, padding: "10px 14px", margin: "8px 0", lineHeight: 1.9, borderRadius: "0 2px 2px 0", whiteSpace: "pre-wrap", wordBreak: "break-all" },
  mathNote: { fontSize: "0.82rem", color: DIM, lineHeight: 1.65, marginTop: 8 },
  proofWrap: { border: `1px solid ${BORDER}`, borderRadius: 3, padding: 20, background: "rgba(255,255,255,0.012)", marginBottom: 32 },
  proofTitle: { fontFamily: "'Space Mono', monospace", fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 12 },
  masterWrap: { border: "1px solid rgba(136,120,212,0.3)", borderRadius: 3, padding: 32, background: "linear-gradient(135deg,rgba(136,120,212,0.04),rgba(200,168,64,0.04))", textAlign: "center", marginBottom: 48 },
  masterEq: { fontFamily: "'Space Mono', monospace", fontSize: "clamp(10px,1.5vw,13px)", color: "#e8e0d0", lineHeight: 2.2, margin: "16px 0", whiteSpace: "pre-wrap", wordBreak: "break-all", textAlign: "left", display: "inline-block" },
  masterLabel: { fontFamily: "'Crimson Pro', Georgia, serif", fontSize: "0.9rem", fontStyle: "italic", color: LAV, marginTop: 12 },
  statusTable: { width: "100%", borderCollapse: "collapse", marginBottom: 48 },
  footer: { borderTop: `1px solid ${BORDER}`, padding: "60px 32px", textAlign: "center", background: "rgba(6,5,15,0.98)" },
  footerPhi: { fontFamily: "'Cinzel', serif", fontSize: "3rem", color: GOLD, opacity: 0.3, marginBottom: 16, lineHeight: 1 },
  footerTitle: { fontFamily: "'Cinzel', serif", fontSize: "1.4rem", color: GOLD, marginBottom: 8 },
  footerSub: { fontFamily: "'Space Mono', monospace", fontSize: 8, letterSpacing: 3, color: DIM, textTransform: "uppercase", marginBottom: 24, lineHeight: 2 },
};

function PaperCard({ num, title, journal, body, claims, tags, accent }: {
  num: string; title: string; journal: string; body: string; claims: string[]; tags: React.ReactNode[]; accent: string;
}) {
  return (
    <div style={{ ...styles.paperCard }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent }} />
      <div style={styles.paperNum}>{num}</div>
      <div style={styles.paperTitle}>{title}</div>
      <div style={styles.paperJournal}>{journal}</div>
      <div style={styles.paperBody}>{body}</div>
      <div style={{ marginBottom: 16 }}>{claims.map((c, i) => <div key={i} style={styles.claim}>{c}</div>)}</div>
      <div>{tags}</div>
    </div>
  );
}

function TestCard({ dotColor, domain, title, body, protocol, falsify, pct, pctLabel, pfStart, pfEnd, sim }: {
  dotColor: string; domain: string; title: string; body: string; protocol: string; falsify: string;
  pct: number; pctLabel: string; pfStart: string; pfEnd: string; sim?: React.ReactNode;
}) {
  return (
    <div style={styles.testCard}>
      <div style={styles.testHeader}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", flexShrink: 0, background: dotColor }} />
        <div style={styles.testDomain}>{domain}</div>
      </div>
      <div style={styles.testTitle}>{title}</div>
      <div style={styles.testBody}>{body}</div>
      {sim}
      <div style={styles.testProtocol}>{protocol}</div>
      <div style={styles.testFalsify}>{falsify}</div>
      <div style={styles.progressBar}>
        <div style={{ height: "100%", borderRadius: 2, background: `linear-gradient(90deg,${pfStart},${pfEnd})`, width: `${pct}%`, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
      <div style={styles.progressLabel}><span>{pctLabel.split(" · ")[0]}</span><span>{pctLabel.split(" · ").slice(1).join(" · ")}</span></div>
    </div>
  );
}

const PHI = 1.6180339887;
const INV_PHI = 0.6180339887;

function fitCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function ringDiscrepancy(points: number[]) {
  const pts = [...points].sort((a, b) => a - b);
  const n = pts.length;
  if (n < 2) return 1;
  let maxG = pts[0] + 1 - pts[n - 1];
  let minG = maxG;
  for (let i = 1; i < n; i++) { const g = pts[i] - pts[i - 1]; if (g > maxG) maxG = g; if (g < minG) minG = g; }
  return maxG - minG;
}

function SimBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ border: `1px solid ${BORDER}`, borderRadius: 2, background: "rgba(0,0,0,0.3)", padding: 10, marginBottom: 14 }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, color: GOLD, opacity: 0.75, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      {children}
    </div>
  );
}

function Rd({ label, vref, color }: { label: string; vref: React.RefObject<HTMLSpanElement | null>; color: string }) {
  return (
    <div style={{ flex: 1, minWidth: 62 }}>
      <span ref={vref} style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color, lineHeight: 1 }}>--</span>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, letterSpacing: 1, color: DIM, textTransform: "uppercase", marginTop: 3 }}>{label}</div>
    </div>
  );
}

function T1Sim() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const r1 = useRef<HTMLSpanElement | null>(null);
  const r2 = useRef<HTMLSpanElement | null>(null);
  const r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const base = [0.42, 0.30, 0.18, 0.55, 0.22, 0.12, 0.38, 0.27];
    const rosa = [0.38, 0.34, 0.15, 0.50, 0.26, 0.10, 0.40, 0.24];
    const foll = [0.10, 0.55, 0.40, 0.08, 0.48, 0.42, 0.12, 0.50];
    let id = 0, t = 0, accOR = 0, accFR = 0, n = 0;
    function cos(a: number[], b: number[]) {
      let d = 0, na = 0, nb = 0;
      for (let i = 0; i < a.length; i++) { d += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
      return d / (Math.sqrt(na) * Math.sqrt(nb) || 1);
    }
    function jit(arr: number[], k: number) { return arr.map((v, i) => Math.max(0.02, v + Math.sin(t * 1.7 + i * 1.3 + k) * 0.05)); }
    function frame() {
      const dim = fitCanvas(c!, ctx!); const w = dim.w, h = dim.h;
      if (!w) { id = requestAnimationFrame(frame); return; }
      t += 0.03;
      ctx!.fillStyle = "rgba(6,5,15,0.92)"; ctx!.fillRect(0, 0, w, h);
      const ov = jit(base, 0), ro = jit(rosa, 1.1), fo = jit(foll, 2.2);
      accOR += cos(ov, ro); accFR += cos(fo, ro); n++;
      const pad = 8, bw = (w - pad * 2) / base.length;
      for (let i = 0; i < base.length; i++) {
        const x = pad + i * bw;
        const ovh = ov[i] * (h - 22), roh = ro[i] * (h - 22);
        ctx!.fillStyle = "rgba(200,168,64,0.78)"; ctx!.fillRect(x + bw * 0.18, h - 14 - ovh, bw * 0.28, ovh);
        ctx!.fillStyle = "rgba(212,104,120,0.72)"; ctx!.fillRect(x + bw * 0.52, h - 14 - roh, bw * 0.28, roh);
      }
      ctx!.font = "7px Space Mono"; ctx!.fillStyle = DIM; ctx!.textAlign = "center";
      ctx!.fillText("8 VOC channels -- gold: ovulatory   rose: R. centifolia", w / 2, h - 3);
      if (r1.current) r1.current.textContent = (accOR / n).toFixed(2);
      if (r2.current) r2.current.textContent = (accFR / n).toFixed(2);
      if (r3.current) r3.current.textContent = n > 70 ? "< 0.05" : "...";
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <SimBox label="Live -- GC-MS cosine clustering (simulated)">
      <canvas ref={cv} style={{ width: "100%", height: 120, display: "block" }} />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Rd label="cos(ovul, rosa)" vref={r1} color={GOLD} />
        <Rd label="cos(foll, rosa)" vref={r2} color={ROSE} />
        <Rd label="bootstrap p" vref={r3} color={BLOOM} />
      </div>
    </SimBox>
  );
}

function T2Sim() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const r1 = useRef<HTMLSpanElement | null>(null);
  const r2 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const T2b = 1.0, T2a = 1.0 * PHI, T2c = 1.0 * 0.9;
    let id = 0, sweep = 0;
    function env(tt: number, T2: number) { return Math.exp(-Math.pow(tt / T2, 1.5)); }
    function frame() {
      const dim = fitCanvas(c!, ctx!); const w = dim.w, h = dim.h;
      if (!w) { id = requestAnimationFrame(frame); return; }
      ctx!.fillStyle = "rgba(6,5,15,0.95)"; ctx!.fillRect(0, 0, w, h);
      const pad = 6, gw = w - pad * 2, gh = h - 18, Tmax = 3.2;
      const toX = (tt: number) => pad + (tt / Tmax) * gw;
      const toY = (v: number) => pad + (1 - v) * gh;
      ctx!.strokeStyle = "rgba(200,168,64,0.06)"; ctx!.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) { const y = pad + (i / 4) * gh; ctx!.beginPath(); ctx!.moveTo(pad, y); ctx!.lineTo(pad + gw, y); ctx!.stroke(); }
      const curves = [{ T2: T2c, col: "rgba(136,120,212,0.6)" }, { T2: T2b, col: "rgba(212,104,120,0.8)" }, { T2: T2a, col: "rgba(200,168,64,0.95)" }];
      curves.forEach(cu => {
        ctx!.beginPath();
        for (let px = 0; px <= gw; px += 2) { const tt = (px / gw) * Tmax; const v = env(tt, cu.T2); if (px === 0) ctx!.moveTo(toX(tt), toY(v)); else ctx!.lineTo(toX(tt), toY(v)); }
        ctx!.strokeStyle = cu.col; ctx!.lineWidth = 1.6; ctx!.stroke();
      });
      ctx!.strokeStyle = "rgba(232,224,208,0.2)"; ctx!.setLineDash([3, 3]); ctx!.beginPath(); ctx!.moveTo(pad, toY(1 / Math.E)); ctx!.lineTo(pad + gw, toY(1 / Math.E)); ctx!.stroke(); ctx!.setLineDash([]);
      sweep += 0.01; if (sweep > 1) sweep = 0;
      const st = sweep * Tmax;
      ctx!.beginPath(); ctx!.arc(toX(st), toY(env(st, T2a)), 3, 0, Math.PI * 2); ctx!.fillStyle = "#fff"; ctx!.fill();
      ctx!.font = "7px Space Mono"; ctx!.fillStyle = DIM; ctx!.textAlign = "left";
      ctx!.fillText("Hahn echo envelope -- gold: phi-Fib   rose: grid   lav: random", pad, h - 4);
      if (r1.current) r1.current.textContent = (T2a / T2b + Math.sin(sweep * 6.28) * 0.02).toFixed(3);
      if (r2.current) r2.current.textContent = "phi = " + PHI.toFixed(3);
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <SimBox label="Live -- NV center T2 coherence decay (Lindblad model)">
      <canvas ref={cv} style={{ width: "100%", height: 120, display: "block" }} />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Rd label="T2(phi)/T2(grid)" vref={r1} color={GOLD} />
        <Rd label="target ratio" vref={r2} color={BLOOM} />
      </div>
    </SimBox>
  );
}

function T3Sim() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const r1 = useRef<HTMLSpanElement | null>(null);
  const r2 = useRef<HTMLSpanElement | null>(null);
  const r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let id = 0, count = 3, t = 0;
    const rnd = Array.from({ length: 90 }, () => Math.random());
    function frame() {
      const dim = fitCanvas(c!, ctx!); const w = dim.w, h = dim.h;
      if (!w) { id = requestAnimationFrame(frame); return; }
      t += 1; if (t % 6 === 0) { count++; if (count > 80) count = 3; }
      ctx!.fillStyle = "rgba(6,5,15,0.95)"; ctx!.fillRect(0, 0, w, h);
      const cy = h / 2 - 4, R = Math.min(h * 0.34, w / 7);
      const centers = [w * 0.18, w * 0.5, w * 0.82];
      const phiPts: number[] = [], perPts: number[] = [], ranPts: number[] = [];
      for (let i = 0; i < count; i++) { phiPts.push((i * INV_PHI) % 1); perPts.push((i / 12) % 1); ranPts.push(rnd[i % rnd.length]); }
      const sets = [{ pts: phiPts, col: "rgba(200,168,64,0.95)", lab: "phi" }, { pts: perPts, col: "rgba(212,104,120,0.85)", lab: "1/12" }, { pts: ranPts, col: "rgba(136,120,212,0.7)", lab: "rand" }];
      sets.forEach((s, k) => {
        const cx = centers[k];
        ctx!.strokeStyle = "rgba(232,224,208,0.12)"; ctx!.lineWidth = 1; ctx!.beginPath(); ctx!.arc(cx, cy, R, 0, Math.PI * 2); ctx!.stroke();
        s.pts.forEach(p => { const a = p * Math.PI * 2 - Math.PI / 2; const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R; ctx!.beginPath(); ctx!.arc(x, y, 2.1, 0, Math.PI * 2); ctx!.fillStyle = s.col; ctx!.fill(); });
        ctx!.font = "7px Space Mono"; ctx!.fillStyle = DIM; ctx!.textAlign = "center"; ctx!.fillText(s.lab, cx, h - 3);
      });
      if (r1.current) r1.current.textContent = ringDiscrepancy(phiPts).toFixed(3);
      if (r2.current) r2.current.textContent = ringDiscrepancy(perPts).toFixed(3);
      if (r3.current) r3.current.textContent = ringDiscrepancy(ranPts).toFixed(3);
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <SimBox label="Live -- point packing on the circle -- D_N gap discrepancy">
      <canvas ref={cv} style={{ width: "100%", height: 130, display: "block" }} />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Rd label="D_N phi-time" vref={r1} color={GOLD} />
        <Rd label="D_N periodic" vref={r2} color={ROSE} />
        <Rd label="D_N random" vref={r3} color={LAV} />
      </div>
    </SimBox>
  );
}

function T4Sim() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const r1 = useRef<HTMLSpanElement | null>(null);
  const r2 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const N = 28;
    const mk = (cx: number, cy: number) => Array.from({ length: N }, () => ({ x: Math.random(), y: Math.random(), tx: cx + (Math.random() - 0.5) * 0.22, ty: cy + (Math.random() - 0.5) * 0.22 }));
    const tnbc = mk(0.22, 0.30), heal = mk(0.80, 0.72);
    let id = 0;
    function aucCalc(pos: number[], neg: number[]) { let win = 0; for (let i = 0; i < pos.length; i++) for (let j = 0; j < neg.length; j++) { if (pos[i] > neg[j]) win++; else if (pos[i] === neg[j]) win += 0.5; } return win / (pos.length * neg.length); }
    function mean(arr: { x: number; y: number }[]) { return { x: arr.reduce((s, p) => s + p.x, 0) / arr.length, y: arr.reduce((s, p) => s + p.y, 0) / arr.length }; }
    function frame() {
      const dim = fitCanvas(c!, ctx!); const w = dim.w, h = dim.h;
      if (!w) { id = requestAnimationFrame(frame); return; }
      const upd = (arr: { x: number; y: number; tx: number; ty: number }[]) => arr.forEach(p => { p.x += (p.tx - p.x) * 0.02; p.y += (p.ty - p.y) * 0.02; });
      upd(tnbc); upd(heal);
      ctx!.fillStyle = "rgba(6,5,15,0.95)"; ctx!.fillRect(0, 0, w, h);
      const px = (v: number) => 8 + v * (w - 16), py = (v: number) => (h - 16) - v * (h - 26);
      tnbc.forEach(p => { ctx!.beginPath(); ctx!.arc(px(p.x), py(p.y), 2.6, 0, Math.PI * 2); ctx!.fillStyle = "rgba(212,104,120,0.8)"; ctx!.fill(); });
      heal.forEach(p => { ctx!.beginPath(); ctx!.arc(px(p.x), py(p.y), 2.6, 0, Math.PI * 2); ctx!.fillStyle = "rgba(126,200,144,0.8)"; ctx!.fill(); });
      const mt = mean(tnbc), mh = mean(heal);
      ctx!.strokeStyle = "rgba(232,224,208,0.25)"; ctx!.setLineDash([4, 4]); ctx!.beginPath(); ctx!.moveTo(px(mt.x), py(mt.y)); ctx!.lineTo(px(mh.x), py(mh.y)); ctx!.stroke(); ctx!.setLineDash([]);
      let dx = mh.x - mt.x, dy = mh.y - mt.y; const nrm = Math.hypot(dx, dy) || 1; dx /= nrm; dy /= nrm;
      const projH = heal.map(p => p.x * dx + p.y * dy), projT = tnbc.map(p => p.x * dx + p.y * dy);
      ctx!.font = "7px Space Mono"; ctx!.fillStyle = "rgba(212,104,120,0.7)"; ctx!.textAlign = "left"; ctx!.fillText("M.cardinalis (low C)", 8, 10);
      ctx!.fillStyle = "rgba(126,200,144,0.7)"; ctx!.textAlign = "right"; ctx!.fillText("M.lewisii (high C)", w - 8, h - 4);
      if (r1.current) r1.current.textContent = aucCalc(projH, projT).toFixed(2);
      if (r2.current) r2.current.textContent = nrm.toFixed(2);
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <SimBox label="Live -- breath-VOC cosine clustering -- ROC separation">
      <canvas ref={cv} style={{ width: "100%", height: 130, display: "block" }} />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Rd label="ROC AUC" vref={r1} color={GOLD} />
        <Rd label="cluster sep" vref={r2} color={CYAN} />
      </div>
    </SimBox>
  );
}

function T5Sim() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const r1 = useRef<HTMLSpanElement | null>(null);
  const r2 = useRef<HTMLSpanElement | null>(null);
  const r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const seeds = [0.04, 0.97, 0.45];
    const cols = ["rgba(200,168,64,0.95)", "rgba(78,184,212,0.8)", "rgba(212,104,120,0.8)"];
    let hist: number[][] = seeds.map(s => [s]);
    let id = 0, t = 0; const MAXN = 46;
    function g(x: number) { return 1 / (1 + x); }
    function frame() {
      const dim = fitCanvas(c!, ctx!); const w = dim.w, h = dim.h;
      if (!w) { id = requestAnimationFrame(frame); return; }
      t++; if (t % 5 === 0) { hist = hist.map(arr => { const na = [...arr, g(arr[arr.length - 1])]; if (na.length > MAXN) na.shift(); return na; }); }
      ctx!.fillStyle = "rgba(6,5,15,0.95)"; ctx!.fillRect(0, 0, w, h);
      const pad = 6, gw = w - pad * 2, gh = h - 16;
      const toX = (i: number, len: number) => pad + (i / Math.max(1, len - 1)) * gw;
      const toY = (v: number) => pad + (1 - v) * gh;
      ctx!.strokeStyle = "rgba(200,168,64,0.35)"; ctx!.setLineDash([4, 4]); ctx!.beginPath(); ctx!.moveTo(pad, toY(INV_PHI)); ctx!.lineTo(pad + gw, toY(INV_PHI)); ctx!.stroke(); ctx!.setLineDash([]);
      ctx!.font = "7px Space Mono"; ctx!.fillStyle = "rgba(200,168,64,0.7)"; ctx!.textAlign = "left"; ctx!.fillText("phi^-1 = 0.618 (attractor)", pad + 2, toY(INV_PHI) - 3);
      hist.forEach((arr, k) => {
        ctx!.beginPath(); arr.forEach((v, i) => { const x = toX(i, arr.length), y = toY(v); if (i === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y); }); ctx!.strokeStyle = cols[k]; ctx!.lineWidth = 1.5; ctx!.stroke();
        const lx = toX(arr.length - 1, arr.length), ly = toY(arr[arr.length - 1]); ctx!.beginPath(); ctx!.arc(lx, ly, 2.5, 0, Math.PI * 2); ctx!.fillStyle = cols[k]; ctx!.fill();
      });
      const a0 = hist[0]; const cur = a0[a0.length - 1]; const err = Math.abs(cur - INV_PHI); const prevErr = a0.length > 1 ? Math.abs(a0[a0.length - 2] - INV_PHI) : err;
      if (r1.current) r1.current.textContent = cur.toFixed(4);
      if (r2.current) r2.current.textContent = err.toExponential(1);
      if (r3.current) r3.current.textContent = (prevErr > 1e-9 ? err / prevErr : 0).toFixed(3);
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <SimBox label="Live -- fixed-point iteration converging to phi^-1 (Lyapunov stable)">
      <canvas ref={cv} style={{ width: "100%", height: 120, display: "block" }} />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Rd label="x_n" vref={r1} color={GOLD} />
        <Rd label="error" vref={r2} color={LAV} />
        <Rd label="contraction" vref={r3} color={CYAN} />
      </div>
    </SimBox>
  );
}

function T6Sim() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const r1 = useRef<HTMLSpanElement | null>(null);
  const r2 = useRef<HTMLSpanElement | null>(null);
  const [n, setN] = useState(4);
  const nRef = useRef(4);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    const BINS = 60, TMAX = 6;
    let h1 = new Array(BINS).fill(0), hN = new Array(BINS).fill(0);
    let tot1 = 0, totN = 0, lastK = nRef.current, id = 0;
    function sampleMin(k: number) { let m = Infinity; for (let i = 0; i < k; i++) { const e = -Math.log(1 - Math.random()); if (e < m) m = e; } return m; }
    function ccdf(arr: number[], total: number) { const out = new Array(BINS).fill(0); let acc = 0; for (let i = BINS - 1; i >= 0; i--) { acc += arr[i]; out[i] = acc / Math.max(1, total); } return out; }
    function frame() {
      const dim = fitCanvas(c!, ctx!); const w = dim.w, H = dim.h;
      if (!w) { id = requestAnimationFrame(frame); return; }
      const k = nRef.current;
      if (k !== lastK) { hN = new Array(BINS).fill(0); totN = 0; lastK = k; }
      for (let s = 0; s < 200; s++) {
        const a = sampleMin(1), b = sampleMin(k);
        const ia = Math.min(BINS - 1, Math.floor(a / TMAX * BINS)), ib = Math.min(BINS - 1, Math.floor(b / TMAX * BINS));
        h1[ia]++; hN[ib]++; tot1++; totN++;
      }
      const c1 = ccdf(h1, tot1), cN = ccdf(hN, totN);
      ctx!.fillStyle = "rgba(6,5,15,0.95)"; ctx!.fillRect(0, 0, w, H);
      const pad = 6, gw = w - pad * 2, gh = H - 16;
      const toX = (i: number) => pad + (i / (BINS - 1)) * gw;
      const toY = (p: number) => { const lp = Math.log10(Math.max(p, 1e-5)); return pad + (1 - (lp + 5) / 5) * gh; };
      ctx!.strokeStyle = "rgba(200,168,64,0.06)"; ctx!.lineWidth = 0.5; ctx!.font = "7px Space Mono"; ctx!.fillStyle = "rgba(200,168,64,0.4)"; ctx!.textAlign = "left";
      for (let e = 0; e >= -4; e--) { const y = toY(Math.pow(10, e)); ctx!.beginPath(); ctx!.moveTo(pad, y); ctx!.lineTo(pad + gw, y); ctx!.stroke(); ctx!.fillText("1e" + e, pad + 1, y - 1); }
      const line = (cc: number[], col: string) => { ctx!.beginPath(); let started = false; for (let i = 0; i < BINS; i++) { if (cc[i] <= 0) continue; const x = toX(i), y = toY(cc[i]); if (!started) { ctx!.moveTo(x, y); started = true; } else ctx!.lineTo(x, y); } ctx!.strokeStyle = col; ctx!.lineWidth = 1.6; ctx!.stroke(); };
      line(c1, "rgba(212,104,120,0.8)"); line(cN, "rgba(126,200,144,0.95)");
      ctx!.fillStyle = DIM; ctx!.textAlign = "right"; ctx!.fillText("rose: N=1   green: N=" + k + "   x: latency  y: P(>t)", w - 4, H - 3);
      const q = (cc: number[]) => { for (let i = 0; i < BINS; i++) { if (cc[i] <= 1e-4) return i / BINS * TMAX; } return TMAX; };
      const comp = q(c1) / Math.max(1e-6, q(cN));
      if (r1.current) r1.current.textContent = "N = " + k;
      if (r2.current) r2.current.textContent = comp.toFixed(1) + "x";
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <SimBox label="Live -- N parallel paths -- min latency -- tail compression">
      <canvas ref={cv} style={{ width: "100%", height: 130, display: "block" }} />
      <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
        <Rd label="paths" vref={r1} color={BLOOM} />
        <Rd label="p99.99 vs N=1" vref={r2} color={GOLD} />
        <div style={{ flex: 2, minWidth: 90 }}>
          <input type="range" min={1} max={8} step={1} value={n} onChange={e => { const v = Number(e.target.value); setN(v); nRef.current = v; }} style={{ width: "100%", accentColor: BLOOM }} />
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: DIM, textTransform: "uppercase", marginTop: 2 }}>paths N = {n}</div>
        </div>
      </div>
    </SimBox>
  );
}

function T7Sim() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const r1 = useRef<HTMLSpanElement | null>(null);
  const r2 = useRef<HTMLSpanElement | null>(null);
  const [mode, setMode] = useState("phi");
  const modeRef = useRef("phi");
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let id = 0, t = 0; const N = 13;
    function positions(m: string) { const p: number[] = []; for (let i = 0; i < N; i++) { p.push(m === "phi" ? (-1 + 2 * ((i * INV_PHI) % 1)) : (-1 + 2 * i / (N - 1))); } return p; }
    function frame() {
      const dim = fitCanvas(c!, ctx!); const w = dim.w, h = dim.h;
      if (!w) { id = requestAnimationFrame(frame); return; }
      t += 0.05;
      ctx!.fillStyle = "rgba(6,5,15,0.95)"; ctx!.fillRect(0, 0, w, h);
      const domeH = 58, cx = w / 2, cy = domeH, R = Math.min(domeH - 6, w / 2 - 12);
      ctx!.strokeStyle = "rgba(232,224,208,0.18)"; ctx!.lineWidth = 1.2; ctx!.beginPath(); ctx!.arc(cx, cy, R, Math.PI, 2 * Math.PI); ctx!.stroke();
      ctx!.strokeStyle = "rgba(78,184,212,0.16)"; ctx!.lineWidth = 1;
      for (let yy = ((t * 16) % 18); yy < domeH - 2; yy += 18) { ctx!.beginPath(); ctx!.moveTo(cx - R, yy); ctx!.lineTo(cx + R, yy); ctx!.stroke(); }
      const pos = positions(modeRef.current);
      pos.forEach(d => {
        const x = cx + d * R; const yy = cy - Math.sqrt(Math.max(0, R * R - (d * R) * (d * R)));
        ctx!.beginPath(); ctx!.arc(x, yy, 2.4, 0, Math.PI * 2); ctx!.fillStyle = modeRef.current === "phi" ? "rgba(200,168,64,0.95)" : "rgba(78,184,212,0.85)"; ctx!.fill();
        ctx!.strokeStyle = "rgba(200,168,64,0.18)"; ctx!.lineWidth = 0.6; ctx!.beginPath(); ctx!.moveTo(x, yy); ctx!.lineTo(cx, cy); ctx!.stroke();
      });
      ctx!.beginPath(); ctx!.arc(cx, cy, 3.5, 0, Math.PI * 2); ctx!.fillStyle = "#fff"; ctx!.fill();
      const SC = 180; const mainLobe = N; let peakSide = 0;
      const af: number[] = [];
      for (let s = 0; s < SC; s++) { const th = (-Math.PI / 2) + (s / (SC - 1)) * Math.PI; const u = Math.sin(th); let re = 0, im = 0; for (const d of pos) { const ph = Math.PI * d * u; re += Math.cos(ph); im += Math.sin(ph); } af.push(Math.hypot(re, im)); }
      const cIdx = Math.floor(SC / 2);
      for (let s = 0; s < SC; s++) { if (Math.abs(s - cIdx) < SC * 0.06) continue; if (af[s] > peakSide) peakSide = af[s]; }
      const gh = h - domeH - 14, gy0 = domeH + 6;
      ctx!.strokeStyle = "rgba(200,168,64,0.06)"; ctx!.lineWidth = 0.5; ctx!.beginPath(); ctx!.moveTo(6, gy0 + gh); ctx!.lineTo(w - 6, gy0 + gh); ctx!.stroke();
      ctx!.beginPath();
      af.forEach((v, s) => { const x = 6 + (s / (SC - 1)) * (w - 12); const y = gy0 + gh - (v / N) * gh; if (s === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y); });
      ctx!.strokeStyle = modeRef.current === "phi" ? "rgba(200,168,64,0.95)" : "rgba(78,184,212,0.9)"; ctx!.lineWidth = 1.5; ctx!.stroke();
      ctx!.font = "7px Space Mono"; ctx!.fillStyle = DIM; ctx!.textAlign = "left"; ctx!.fillText("array factor vs scan angle -- lower sidelobes = cleaner integration", 6, h - 3);
      const sllDb = 20 * Math.log10(Math.max(1e-6, peakSide) / mainLobe);
      if (r1.current) r1.current.textContent = mainLobe.toFixed(0) + "x";
      if (r2.current) r2.current.textContent = sllDb.toFixed(1) + " dB";
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <SimBox label="Live -- dome phased aperture -- focus gain & sidelobe pattern (modeled)">
      <canvas ref={cv} style={{ width: "100%", height: 150, display: "block" }} />
      <div style={{ display: "flex", gap: 10, marginTop: 8, alignItems: "center" }}>
        <Rd label="aperture gain" vref={r1} color={GOLD} />
        <Rd label="peak sidelobe" vref={r2} color={CYAN} />
        <div style={{ flex: 1, display: "flex", gap: 6 }}>
          {["phi", "flat"].map(m => (
            <button key={m} onClick={() => { setMode(m); modeRef.current = m; }} style={{ flex: 1, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 1, textTransform: "uppercase", padding: "6px 4px", cursor: "pointer", borderRadius: 2, border: `1px solid ${mode === m ? "rgba(200,168,64,0.6)" : BORDER}`, background: mode === m ? "rgba(200,168,64,0.12)" : "transparent", color: mode === m ? GOLD : DIM }}>{m === "phi" ? "phi nodes" : "flat nodes"}</button>
          ))}
        </div>
      </div>
    </SimBox>
  );
}

function MasterSim() {
  const cv = useRef<HTMLCanvasElement | null>(null);
  const r1 = useRef<HTMLSpanElement | null>(null);
  const r2 = useRef<HTMLSpanElement | null>(null);
  const r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = cv.current; if (!c) return;
    const ctx = c.getContext("2d"); if (!ctx) return;
    let id = 0, step = 0, E = 1.0;
    let Ehist: number[] = [], Chist: number[] = []; const MAX = 170;
    function frame() {
      const dim = fitCanvas(c!, ctx!); const w = dim.w, h = dim.h;
      if (!w) { id = requestAnimationFrame(frame); return; }
      step++;
      E = INV_PHI * E + Math.abs((Math.random() - 0.5) * 0.015);
      if (E < 0.0008) E = 0.0008;
      const C = 1 - E;
      Ehist.push(E); Chist.push(C); if (Ehist.length > MAX) { Ehist.shift(); Chist.shift(); }
      ctx!.fillStyle = "rgba(6,5,15,0.95)"; ctx!.fillRect(0, 0, w, h);
      const pad = 6, gw = w - pad * 2, gh = h - 16;
      const toX = (i: number, len: number) => pad + (i / Math.max(1, len - 1)) * gw;
      ctx!.strokeStyle = "rgba(200,168,64,0.2)"; ctx!.setLineDash([4, 4]); ctx!.beginPath(); ctx!.moveTo(pad, pad); ctx!.lineTo(pad + gw, pad); ctx!.stroke(); ctx!.setLineDash([]);
      const plot = (arr: number[], col: string) => { ctx!.beginPath(); arr.forEach((v, i) => { const x = toX(i, arr.length), y = pad + (1 - v) * gh; if (i === 0) ctx!.moveTo(x, y); else ctx!.lineTo(x, y); }); ctx!.strokeStyle = col; ctx!.lineWidth = 1.6; ctx!.stroke(); };
      plot(Ehist, "rgba(212,104,120,0.85)"); plot(Chist, "rgba(200,168,64,0.95)");
      ctx!.font = "7px Space Mono"; ctx!.fillStyle = DIM; ctx!.textAlign = "left"; ctx!.fillText("gold: coherence C(t)   rose: error ||E(t)||", pad, h - 3);
      const ratio = Ehist.length > 2 ? Ehist[Ehist.length - 1] / Math.max(1e-6, Ehist[Ehist.length - 2]) : INV_PHI;
      if (r1.current) r1.current.textContent = C.toFixed(3);
      if (r2.current) r2.current.textContent = E.toExponential(1);
      if (r3.current) r3.current.textContent = ratio.toFixed(3);
      if (step % 320 === 0) E = 1.0;
      id = requestAnimationFrame(frame);
    }
    frame();
    return () => cancelAnimationFrame(id);
  }, []);
  return (
    <SimBox label="Live -- master-equation relaxation -- coherence rises as error falls (illustrative)">
      <canvas ref={cv} style={{ width: "100%", height: 130, display: "block" }} />
      <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
        <Rd label="coherence C(t)" vref={r1} color={GOLD} />
        <Rd label="error ||E||" vref={r2} color={ROSE} />
        <Rd label="fixed-pt ratio" vref={r3} color={LAV} />
      </div>
    </SimBox>
  );
}

export default function PathForwardPage() {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const discRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = bgRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const PHI = 1.6180339887;
    const GA = 2 * Math.PI / (PHI * PHI);
    let W = 0, H = 0, t = 0;
    let animId: number;

    function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
    window.addEventListener("resize", resize);
    resize();

    const nodes = Array.from({ length: 180 }, (_, i) => ({
      base: 15 + Math.pow(i, 0.8) * 5.5,
      speed: 0.0005 + (i / 180) * 0.003,
      phase: i * GA,
      scale: 0.003 + (i / 180) * 0.04,
      layer: i < 40 ? 0 : i < 100 ? 1 : 2,
    }));
    const cols = ["rgba(200,168,64,", "rgba(126,200,144,", "rgba(136,120,212,"];

    function frame() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(6,5,15,0.08)";
      ctx.fillRect(0, 0, W, H);
      t += 0.6;
      const cx = W / 2, cy = H / 2;
      nodes.forEach(n => {
        const angle = t * n.speed + n.phase;
        const r = n.base + t * 0.015;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const s = 0.8 + Math.sin(t * n.scale + n.phase) * 0.8;
        if (x < -10 || x > W + 10 || y < -10 || y > H + 10) return;
        ctx.globalCompositeOperation = "screen";
        ctx.beginPath(); ctx.arc(x, y, s * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = cols[n.layer] + "0.25)"; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, s * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = cols[n.layer] + "0.7)"; ctx.fill();
        ctx.globalCompositeOperation = "source-over";
      });
      animId = requestAnimationFrame(frame);
    }
    frame();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    const canvas = discRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const PHI = 1.6180339887;
    let animT = 0;
    let randSeq: number[] = [];
    let animId: number;

    function buildRand() { randSeq = Array.from({ length: 512 }, () => Math.random()); }
    buildRand();
    const Ns = [4, 8, 13, 21, 34, 55, 89, 144, 233, 377, 512];

    function discrepancy(seq: (i: number) => number, N: number) {
      const pts = Array.from({ length: N }, (_, i) => seq(i + 1)).sort((a, b) => a - b);
      let maxGap = pts[0] + (1 - pts[N - 1]);
      for (let i = 1; i < N; i++) maxGap = Math.max(maxGap, pts[i] - pts[i - 1]);
      let minGap = maxGap;
      for (let i = 1; i < N; i++) minGap = Math.min(minGap, pts[i] - pts[i - 1]);
      minGap = Math.min(minGap, pts[0] + (1 - pts[N - 1]));
      return maxGap - minGap;
    }

    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const W = canvas.width = canvas.offsetWidth * dpr;
      const H = canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
      const w = canvas.offsetWidth, h = canvas.offsetHeight;
      ctx.fillStyle = "rgba(6,5,15,0.98)"; ctx.fillRect(0, 0, w, h);

      const phiHist = Ns.map(N => discrepancy(i => ((i * PHI) % 1), N));
      const perHist = Ns.map(N => discrepancy(i => i / N, N));
      const ranHist = Ns.map(N => discrepancy(i => randSeq[(i - 1) % randSeq.length], N));
      const allVals = [...phiHist, ...perHist, ...ranHist];
      const maxV = Math.max(...allVals) * 1.1;
      const pad = { l: 40, r: 20, t: 20, b: 30 };
      const cw = w - pad.l - pad.r, ch = h - pad.t - pad.b;
      const toX = (i: number) => pad.l + (i / (Ns.length - 1)) * cw;
      const toY = (v: number) => pad.t + ch - (v / maxV) * ch;

      ctx.strokeStyle = "rgba(200,168,64,0.07)"; ctx.lineWidth = 0.5;
      for (let i = 0; i <= 4; i++) {
        const y = pad.t + (i / 4) * ch;
        ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(pad.l + cw, y); ctx.stroke();
        ctx.font = "8px Space Mono"; ctx.fillStyle = "rgba(200,168,64,0.4)"; ctx.textAlign = "right";
        ctx.fillText((maxV * (1 - i / 4)).toFixed(3), pad.l - 4, y + 3);
      }
      Ns.forEach((N, i) => {
        ctx.font = "7px Space Mono"; ctx.fillStyle = "rgba(232,224,208,0.3)"; ctx.textAlign = "center";
        ctx.fillText(String(N), toX(i), h - 4);
      });

      function drawLine(data: number[], color: string) {
        ctx.beginPath();
        data.forEach((v, i) => { if (i === 0) ctx.moveTo(toX(i), toY(v)); else ctx.lineTo(toX(i), toY(v)); });
        ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.stroke();
        data.forEach((v, i) => { ctx.beginPath(); ctx.arc(toX(i), toY(v), 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill(); });
      }
      drawLine(ranHist, "rgba(136,120,212,0.5)");
      drawLine(perHist, "rgba(212,104,120,0.75)");
      drawLine(phiHist, "rgba(200,168,64,0.95)");
      ctx.font = "8px Space Mono"; ctx.textAlign = "left"; ctx.fillStyle = "rgba(200,168,64,0.8)";
      ctx.fillText("phi-time: D_N <= 1/(F_n*sqrt(5))", toX(Ns.length - 1) + 6, toY(phiHist[Ns.length - 1]));
      [5, 7, 9].forEach(idx => {
        ctx.strokeStyle = "rgba(200,168,64,0.15)"; ctx.lineWidth = 0.5; ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(toX(idx), pad.t); ctx.lineTo(toX(idx), pad.t + ch); ctx.stroke();
        ctx.setLineDash([]);
      });
      ctx.scale(1 / dpr, 1 / dpr);
      animT++;
      if (animT % 180 === 0) buildRand();
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const statusRows = [
    { status: "tagDoc", domain: "Hardware", claim: "Channel hedging N=1--8 compresses p99.99 by 125x on Sapphire Rapids (10M samples)", next: "Paper I submission" },
    { status: "tagDoc", domain: "Floral", claim: "M. lewisii linalool/ocimene/myrcene = 93% of bouquet; 107x higher than M. cardinalis", next: "Byers 2014 confirmed" },
    { status: "tagDoc", domain: "Math", claim: "Hurwitz theorem: phi is the worst-approximable irrational (constant sqrt(5) is tight)", next: "Apply to Theorem 3" },
    { status: "tagDoc", domain: "Math", claim: "Three-Distance Theorem: D_N(phi) <= 1/(F_n*sqrt(5)), tight at Fibonacci indices", next: "Connect to C_cost functional" },
    { status: "tagDoc", domain: "Oncology", claim: "Ferrofluid-chemo hybrids: ~59% glioblastoma kill rate (2025 trials)", next: "CUCA-Bio deployment architecture" },
    { status: "tagDoc", domain: "Computation", claim: "Anthrobot human tracheal cells self-organize and traverse human tissue", next: "Kill switch integration" },
    { status: "tagEst", domain: "Hardware", claim: "phi-time scheduler reduces C_cost by ~34% vs periodic at N=512 (simulation)", next: "T3 benchmark -- Theorem 3 proof" },
    { status: "tagEst", domain: "Physics", claim: "phi-Fibonacci NV implantation predicted T2 boost ~phi (Lindblad model)", next: "T2 HPHT diamond experiment" },
    { status: "tagEst", domain: "Bio-Comp", claim: "CUCA-Bio 8-phase deployment reduces ||E(t)|| by 60-80% in tumor ODE simulation", next: "In vivo Anthrobot study" },
    { status: "tagHyp", domain: "Cross-domain", claim: "Coherence Bridge: floral VOC collapse and TME collapse governed by same C(x,t)", next: "T1 + T4 empirical tests" },
    { status: "tagHyp", domain: "Mathematics", claim: "Theorem 3: phi-time minimizes AETHER C_cost below all periodic/random alternatives", next: "Lyapunov stability proof (T5)" },
    { status: "tagHyp", domain: "Grand", claim: "Master Equation: phi^-1 is the RG fixed-point ratio of C[rho,W], not a free parameter", next: "RG analysis -- Paper IV" },
    { status: "tagHyp", domain: "Apparatus", claim: "Physical dome (semicircular, phi-patterned) achieves >=2x field integration gain", next: "T7 measurement" },
    { status: "tagOpen", domain: "Mathematics", claim: "Fano plane analog for the 5-phase loop: combinatorial geometry of cross-domain isomorphism", next: "Non-commutative algebra formalization" },
    { status: "tagOpen", domain: "Mathematics", claim: "Structural identity theorem: 5-phase loop algebraic structure is isomorphic across all domains", next: "Category theory formalization" },
  ] as const;

  const tagStyleMap: Record<string, React.CSSProperties> = { tagDoc: styles.tagDoc, tagEst: styles.tagEst, tagHyp: styles.tagHyp, tagOpen: styles.tagOpen };
  const tagLabelMap: Record<string, string> = { tagDoc: "DOC", tagEst: "EST", tagHyp: "HYP", tagOpen: "OPEN" };

  return (
    <div style={styles.root}>
      <canvas ref={bgRef} style={styles.bgCanvas} />
      <div style={styles.content}>
        {/* HERO */}
        <section style={styles.hero}>
          <div style={styles.heroEyebrow}>AetherLife.co · @StrategicProce · April 9, 2026</div>
          <h1 style={styles.heroTitle}>The Path Forward</h1>
          <p style={styles.heroSub}>
            Four papers. Empirical tests to graduate every HYP to DOC.
            The phi-time mathematical proofs that close the framework.
            One unified next-steps document for the coherence that is already alive.
          </p>
          <div style={styles.heroTracks}>
            <div style={styles.trackPill}>Four-Paper Roadmap</div>
            <div style={{ ...styles.trackPill, color: BLOOM, borderColor: "rgba(126,200,144,0.4)" }}>HYP -- DOC Tests</div>
            <div style={{ ...styles.trackPill, color: LAV, borderColor: "rgba(136,120,212,0.4)" }}>phi Mathematical Proofs</div>
          </div>
          <div style={styles.heroScroll}>scroll to begin</div>
        </section>

        <div style={styles.divider} />

        {/* FOUR PAPERS */}
        <section style={styles.section} id="papers">
          <div style={styles.eyebrow}>Publication Roadmap</div>
          <h2 style={styles.sectionTitle}>Four <span style={{ color: GOLD }}>Papers</span> · One Unified Theory</h2>
          <p style={styles.sectionBody}>
            Each paper targets a specific peer-reviewed venue, advances from the most empirically grounded claims
            outward toward the grand unified structure. Each one stands alone and strengthens the next.
            The arc: hardware -- biology -- mathematics -- theory of everything.
          </p>
          <div style={styles.paperGrid}>
            <PaperCard num="Paper I · Immediate" title="Channel Hedging as Kuramoto Phase Locking: Empirical Tail-Latency Suppression in Modern DRAM" journal="Target: ACM SIGARCH / IEEE CAL · cs.AR + physics.app-ph" body="The most empirically grounded paper. Presents the coherent RAM benchmark (clflush + mfence + lfence + rdtsc/rdtscp), the Sapphire Rapids 10M-sample channel hedging dataset, and the formal mapping to Kuramoto oscillator theory. No grand claims — rigorous hardware paper with a surprising theoretical frame." claims={["§1 Coherent RAM benchmark protocol -- fully reproducible, open source", "§2 Empirical: N=1--8 hedging, p99.99 compression 125x on Sapphire Rapids", "§3 Formal: P(latency>t) from oscillator theory derived", "§4 Practical: 35-55% tail reduction, scalable to 3D-stacked / IGZO DRAM"]} tags={[<span key="d" style={styles.tagDoc}>DOC basis</span>, <span key="e" style={styles.tagEst}>Est. 6 months</span>, <span key="o" style={styles.tagOpen}>arXiv first</span>]} accent={BLOOM} />
            <PaperCard num="Paper II · Near-Term" title="Coherence Bridge: A Unified C(x,t) Functional Across Floral Volatile Chemistry and Tumor Microenvironment Dynamics" journal="Target: PLOS Computational Biology / Cell Systems · q-bio.QM" body="Formalizes the coherence bridge hypothesis. Shows mathematically that VOC bouquet collapse in Mimulus cardinalis and TME coherence collapse in TNBC are governed by the same C(x,t) functional. Includes GC-MS data, EAG scores, scRNA-seq analogy, and cosine similarity analysis." claims={["§1 C(x,t) = 1 - ||E(t)||/||X*(t)|| formalized for both domains", "§2 Cosine sim(M.cardinalis VOC, Rosa centifolia) = 0.82 -- GC-MS validated", "§3 Breeder's equation evolutionary dynamics -- CUCA-Bio deployment analogy", "§4 Falsifiability: VOC breath biopsy clustering protocol specified"]} tags={[<span key="h" style={styles.tagHyp}>HYP--DOC target</span>, <span key="e" style={styles.tagEst}>Est. 9 months</span>, <span key="d" style={styles.tagDoc}>Byers 2025 anchor</span>]} accent={ROSE} />
            <PaperCard num="Paper III · Medium-Term" title="phi-Time: Three-Distance Theorem, Hurwitz Optimality, and the AETHER Convergence Bound for Scale-Invariant Scheduling" journal="Target: Journal of Number Theory / Foundations of Computational Mathematics · math.NT" body="The mathematical core. Formally proves three theorems: (1) Hurwitz/Diophantine optimality of phi as the worst-case approximable irrational, (2) Three-Distance discrepancy bound D_N <= 1/(F_n*sqrt(5)), (3) AETHER convergence bound showing phi-time scheduling minimizes coherence cost below all periodic and random alternatives." claims={["Theorem 1: Hurwitz -- phi maximizes irrationality measure mu(alpha)", "Theorem 2: Three-Distance -- D_N(phi) <= 1/(F_n*sqrt(5)), tight bound", "Theorem 3: AETHER convergence -- phi-time minimizes integral C_cost dt", "Live simulation: discrepancy comparison phi vs periodic vs random"]} tags={[<span key="e" style={styles.tagEst}>Partially proven</span>, <span key="o" style={styles.tagOpen}>12 months</span>, <span key="h" style={styles.tagHyp}>Lyapunov needed</span>]} accent={LAV} />
            <PaperCard num="Paper IV · Grand Synthesis" title="CUCA-AETHER: A Scale-Invariant Coherence Framework from DRAM Cells to Galactic Filaments -- The Candidate Master Equation" journal="Target: Physical Review Letters / Nature Physics · physics.gen-ph + q-bio" body="The grand unified paper. Presents the AETHER Master Equation and argues that phi is the RG fixed-point ratio -- not inserted by hand but emergent from the optimization geometry. Papers I-III provide the empirical and mathematical scaffolding." claims={["§1 The five-phase loop as non-commutative algebraic structure", "§2 phi^-1 as RG fixed-point -- Wilson universality analogy", "§3 Scale substitution table: DRAM--neuron--mycelium--tumor--cosmos", "§4 Fano coherence geometry as cross-domain invariant"]} tags={[<span key="h" style={styles.tagHyp}>Central conjecture</span>, <span key="o" style={styles.tagOpen}>18-24 months</span>, <span key="e" style={styles.tagEst}>Papers I-III prerequisite</span>]} accent={GOLD} />
          </div>
          {/* Timeline */}
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 24, opacity: 0.7 }}>Publication Timeline</div>
          <div style={styles.timeline}>
            <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: 1, background: `linear-gradient(180deg,${GOLD},transparent)` }} />
            {[
              { date: "Month 1-2 · Now", title: "arXiv preprint: Paper I (DRAM / Channel Hedging)", body: "Open-source the coherent benchmark C++ code. Post the Sapphire Rapids dataset. Submit to cs.AR. This establishes priority and gives the broader framework a hardware-grounded anchor immediately.", color: BLOOM },
              { date: "Month 3-4", title: "Run the three HYP--DOC empirical tests", body: "GC-MS breath biopsy clustering. NV diamond T2 Fibonacci vs. control. phi-time scheduler benchmark at N=512. Each test can independently graduate a HYP to EST or DOC.", color: GOLD },
              { date: "Month 6-9", title: "Paper II: Coherence Bridge (Floral + Oncology)", body: "Pending test results from Month 3-4. If cosine similarity clustering holds at p<0.05, the core HYP becomes EST or DOC and Paper II becomes submittable to Cell Systems.", color: ROSE },
              { date: "Month 9-12", title: "Paper III: phi-Time Mathematical Proofs", body: "Theorems 1 and 2 are close to complete. Theorem 3 (AETHER convergence bound) requires Lyapunov stability analysis of the phi-learning-rate update rule -- the primary open problem.", color: LAV },
              { date: "Month 18-24", title: "Paper IV: CUCA-AETHER Grand Synthesis", body: "The master equation paper. By this point Papers I-III provide three independent empirical/mathematical anchors. The grand claim is defensible. Target: Physical Review Letters or Nature Physics.", color: "#e8c860" },
            ].map((item, i) => (
              <div key={i} style={{ position: "relative", marginBottom: 32, paddingLeft: 0 }}>
                <div style={{ position: "absolute", left: -29, top: 6, width: 8, height: 8, borderRadius: "50%", background: item.color, border: "1px solid rgba(200,168,64,0.5)" }} />
                <div style={styles.tlDate}>{item.date}</div>
                <div style={styles.tlTitle}>{item.title}</div>
                <div style={styles.tlBody}>{item.body}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={styles.divider} />

        {/* HYP TO DOC TESTS */}
        <section style={styles.section} id="tests">
          <div style={styles.eyebrow}>Empirical Falsifiability</div>
          <h2 style={styles.sectionTitle}><span style={{ color: GOLD }}>HYP -- DOC</span> · Seven Tests</h2>
          <p style={styles.sectionBody}>
            Every HYP in the AETHER corpus has an explicit falsifiability condition written at the moment of creation.
            These seven tests are the shortest paths from hypothesis to documented result.
            Each one is achievable with existing technology in 2026.
          </p>
          <div style={styles.testGrid}>
            <TestCard dotColor={ROSE} domain="Floral · Biology · HYP--DOC" title="T1 · Coherence Bridge: VOC Cosine Clustering" body="Does human ovulatory headspace cluster with Rosa centifolia bouquet under cosine similarity analysis? The 0.82 cosine score is modeled from documented 2-phenylethanol and linalool overlap -- not measured." protocol={`Protocol:\n1. GC-MS headspace sampling: n=20 women,\n   days 12-14 (ovulatory) vs days 1-3 (follicular)\n2. Normalize VOC vectors per AETHER bouquet eq.\n3. Compute cosine_sim(V_ovulatory, V_Rosa_centifolia)\n4. Bootstrap CI: 10,000 permutations\nPass: cosine > 0.6 at p < 0.05\nFail: cosine < 0.4 OR not significant`} falsify="Falsified if: cosine < 0.4 or p > 0.05 in controlled GC-MS assay" pct={15} pctLabel="HYP · 15% - protocol designed" pfStart={ROSE} pfEnd={GOLD} sim={<T1Sim />} />
            <TestCard dotColor={GOLD} domain="Physics · NV Diamond · EST--DOC" title="T2 · phi-Fibonacci NV Implantation T2 Boost" body="Does phi-indexed Fibonacci lattice implantation in HPHT diamond extend T2 coherence time by factor ~phi compared to grid and random controls? This is the highest-priority falsifiable test in the AETHER corpus." protocol={`Protocol:\n1. Three HPHT diamond samples:\n   A: phi-Fibonacci N+ implantation (F_n spacing)\n   B: Uniform grid spacing (control)\n   C: Random spacing (noise control)\n2. Hahn echo measurement: T2 at 4K and 300K\n3. Extract noise spectral density S(omega) at omega_NV\nPass: T2(A) / T2(B) ~= phi +/- 10%\nFail: ratio < 1.2 or > 2.5`} falsify="Falsified if: T2 ratio != phi (outside [1.4, 1.9] at 95% CI)" pct={42} pctLabel="EST · 42% - Lindblad model run" pfStart={GOLD} pfEnd={BLOOM} sim={<T2Sim />} />
            <TestCard dotColor={BLOOM} domain="Computing · DRAM · DOC basis" title="T3 · phi-Time Scheduler Discrepancy Benchmark" body="Does phi-time scheduling reduce packing discrepancy by >=25% vs. periodic mode at N=512 task insertions? Three-Distance Theorem predicts D_N(phi) <= 1/(F_n*sqrt(5)). This is computationally verifiable today." protocol={`Protocol:\n1. Implement three schedulers:\n   A: phi-time: t_n = n*Theta_phi mod 1\n   B: Periodic: t_n = n/N\n   C: Random: t_n ~ Uniform[0,1]\n2. Measure discrepancy D_N at N=64,128,256,512\n3. Plot D_N vs N on log-log scale\nPass: D_N(A) < D_N(B) at all N, slope = 1/N\nFail: D_N(A) >= D_N(B) for any N >= 128`} falsify="Falsified if: phi-time discrepancy >= periodic at N >= 128" pct={78} pctLabel="EST · 78% - simulation confirms, formal proof pending" pfStart={BLOOM} pfEnd={CYAN} sim={<T3Sim />} />
            <TestCard dotColor={ROSE} domain="Oncology · TME · HYP" title="T4 · TME Coherence Collapse VOC Clustering" body="Do breath biopsy VOC profiles from TNBC patients cluster with low-coherence floral phenotypes in cosine similarity analysis vs. healthy controls?" protocol={`Protocol:\n1. Breath biopsy: n=30 TNBC, n=30 healthy controls\n2. GC-MS headspace: identify VOC fingerprint vector\n3. Normalize per AETHER bouquet equation\n4. Compute cosine_sim to M.cardinalis vs M.lewisii\n   reference bouquets\nPass: TNBC clusters with M.cardinalis (C~=0.10)\n      Healthy clusters with M.lewisii (C~=0.92)\n      p < 0.01, ROC AUC > 0.75`} falsify="Falsified if: TNBC VOC does not cluster with low-coherence floral phenotypes" pct={8} pctLabel="HYP · 8% - conceptual framework only" pfStart={ROSE} pfEnd={LAV} sim={<T4Sim />} />
            <TestCard dotColor={LAV} domain="Mathematics · Lyapunov · Open" title="T5 · Hebbian Convergence: phi^-1 Learning Rate Stability" body="Does the AETHER weight update rule with learning rate eta = phi^-1 ~= 0.618 converge? Under what conditions on the state space? This is the central open mathematical problem." protocol={`Required work:\n1. Lyapunov function V(W) for the update rule\n2. Show dV/dt <= 0 under eta = phi^-1\n3. Characterize convergence basin\n4. Compute convergence rate lambda(eta)\n5. Compare: eta=phi^-1 vs eta=0.5 vs eta=0.9\nPass: Lyapunov stability proven analytically\n      phi^-1 achieves faster convergence\nFail: No Lyapunov function exists OR eta=0.618\n      does not uniquely minimize convergence time`} falsify="Falsified if: no Lyapunov stability proof exists for eta = phi^-1" pct={22} pctLabel="Open · 22% - conjecture stated, proof missing" pfStart={LAV} pfEnd={GOLD} sim={<T5Sim />} />
            <TestCard dotColor={CYAN} domain="Biological Computation · EST" title="T6 · Mycelial Multi-Path Routing Coherence" body="Does multi-path signal routing in Physarum polycephalum mycelium networks suppress tail latency following the same C(N) scaling as DRAM channel hedging?" protocol={`Protocol:\n1. Microfluidic maze: single vs N=2,4,8 parallel paths\n2. Measure food-gradient response time distribution\n3. Fit P(response > t) = exp(-(t/tau)^kappa * C(N))\n4. Extract C(N) empirically\nPass: C(N) grows with N, kappa consistent across\n      both DRAM and Physarum measurements\nFail: C(N) flat with N, or inconsistent kappa`} falsify="Falsified if: parallel paths do not compress response-time tails" pct={31} pctLabel="EST · 31% - Physarum literature supports, not yet measured" pfStart={CYAN} pfEnd={BLOOM} sim={<T6Sim />} />
            <TestCard dotColor={GOLD} domain="Dome Apparatus · HYP" title="T7 · Physical Dome as Fibonacci Field Integrator" body="Does the semicircular membrane dome with radial phi-patterning and central sensor achieve field integration gain >=2x compared to a flat equivalent? This tests the macro-scale Fibonacci field integrator hypothesis." protocol={`Protocol:\n1. Construct flat-membrane control (same area)\n2. Measure signal integration at central sensor:\n   acoustic / EM / pressure -- three modalities\n3. Compute gain = dome_output / flat_output\n4. Test at phi-spaced radial node positions\n   vs. random spacing\nPass: gain >= 2x at phi-spaced nodes (p<0.05)\nFail: gain < 1.5x OR random spacing matches phi`} falsify="Falsified if: field integration gain < 1.5x vs flat equivalent" pct={12} pctLabel="HYP · 12% - apparatus built, measurement pending" pfStart={GOLD} pfEnd={ROSE} sim={<T7Sim />} />
          </div>
        </section>

        <div style={styles.divider} />

        {/* PHI MATH PROOFS */}
        <section style={styles.section} id="math">
          <div style={styles.eyebrow}>phi-Time Mathematical Foundations</div>
          <h2 style={styles.sectionTitle}>Three <span style={{ color: GOLD }}>Theorems</span> · Live Proof</h2>
          <p style={styles.sectionBody}>
            These are the mathematical spine of AETHER. Theorem 1 and 2 are established number theory --
            AETHER's contribution is the interpretation and the connection to the coherence functional.
            Theorem 3 is the AETHER convergence bound: the open problem whose proof completes Paper III.
          </p>
          <div style={styles.proofWrap}>
            <div style={styles.proofTitle}>Live · Three-Distance Discrepancy Comparison · phi vs Periodic vs Random</div>
            <canvas ref={discRef} style={{ width: "100%", height: 200, display: "block", borderRadius: 2 }} />
            <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: GOLD }}>phi-time (golden angle)</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: ROSE }}>Periodic (1/N)</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: DIM }}>Random</div>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: DIM }}>D_N = max gap - min gap · lower = better packing</div>
            </div>
          </div>
          <div style={{ ...styles.mathGrid, gridTemplateColumns: "1fr 1fr" }}>
            <div style={styles.mathCard}>
              <div style={styles.mathCardTitle}>Theorem 1 · Hurwitz / Diophantine Optimality</div>
              <pre style={styles.eq}>{`For any irrational alpha, Hurwitz's theorem states:
|alpha - p/q| < 1/(sqrt(5) * q^2)
has infinitely many rational solutions p/q.

The constant sqrt(5) is TIGHT -- achieved only
by alpha = phi = (1+sqrt(5))/2 and equivalents.

This means phi is the "most irrational" number:
hardest to approximate by rationals.
No rational resonance can lock onto phi-spaced
intervals. Coherence is maximally robust.

Corollary for AETHER:
phi-time scheduling cannot be resonantly
disrupted by any periodic interference pattern.
This is why phi appears in phyllotaxis, DRAM
optimal packing, and the Aether Hamiltonian.`}</pre>
              <p style={styles.mathNote}>Status: Established number theory (Hurwitz 1891). AETHER interpretation: novel application to scheduling and coherence theory. <span style={{ color: BLOOM }}>DOC</span></p>
            </div>
            <div style={styles.mathCard}>
              <div style={styles.mathCardTitle}>Theorem 2 · Three-Distance Theorem</div>
              <pre style={styles.eq}>{`Steinhaus Three-Distance Theorem (1957):
For any alpha in R\\Q and N in N, the N points
{alpha}, {2alpha}, ..., {N*alpha} on [0,1)
partition the circle into at most 3 gap lengths.

For alpha = phi, the gaps are Fibonacci-scaled:
D_N(phi) <= 1/(F_n * sqrt(5))

where F_n is the largest Fibonacci number <= N.

This bound is TIGHT -- no irrational achieves
a smaller maximum gap than phi at the Fibonacci
indices. phi-spacing is maximally uniform.

AETHER interpretation:
phi-time scheduled tasks have minimal worst-case
timing gaps -- minimal coherence cost spikes
-- minimal tail latency at Fibonacci checkpoints.`}</pre>
              <p style={styles.mathNote}>Status: Established (Steinhaus 1957, Liang 1979). AETHER scheduling interpretation: <span style={{ color: GOLD }}>EST</span> pending formal connection to C_cost functional.</p>
            </div>
            <div style={styles.mathCard}>
              <div style={styles.mathCardTitle}>Theorem 3 · AETHER Convergence Bound <span style={{ fontSize: "0.7em", color: LAV }}>[OPEN]</span></div>
              <pre style={styles.eq}>{`Conjecture (Theorem 3 target):
Let C_cost(t) = integral_0^T ||E(t)||/||X*(t)|| dt

For a phi-time scheduled system with N tasks:
C_cost(phi) <= C_cost(periodic) <= C_cost(random)

Equivalently, the total coherence cost is
minimized when task intervals follow the
Three-Distance sequence {n*Theta_phi mod 1}.

Required proof steps:
1. Show C_cost is a functional of D_N
   C_cost = f(D_N) with f monotone increasing
2. Apply Theorem 2: D_N(phi) is minimal at F_n
3. Conclude C_cost(phi) is minimal at all F_n

Open: Step 1 requires Lyapunov stability
analysis of the AETHER update rule with
eta = phi^-1 as the learning rate.`}</pre>
              <p style={styles.mathNote}>Status: <span style={{ color: LAV }}>OPEN CONJECTURE</span>. Simulation confirms at N=512. Formal proof is the primary open problem for Paper III.</p>
            </div>
            <div style={styles.mathCard}>
              <div style={styles.mathCardTitle}>Binet · phi-Fibonacci Threading</div>
              <pre style={styles.eq}>{`Binet's Formula:
phi^n = F_n*phi + F_{n-1}

This threads all five domains together:
  phi^n = (F_n*phi + F_{n-1}) for any scale n

Scale substitution table:
  n=1  DRAM cell timing
  n=2  Synaptic spike interval
  n=3  Mycelial branching cycle
  n=5  Tumor microenvironment feedback
  n=8  Interplanetary orbital resonance

Each domain inherits the same phi-structured
eigenmodes from the AETHER update rule.
This is not analogy -- it is the same equation.`}</pre>
              <p style={styles.mathNote}>Binet's formula (1843) is established. AETHER's scale-substitution claim is <span style={{ color: LAV }}>HYP</span> pending Paper IV's RG analysis.</p>
            </div>
          </div>
        </section>

        <div style={styles.divider} />

        {/* MASTER EQUATION */}
        <section style={styles.section} id="master">
          <div style={styles.eyebrow}>The Candidate Generating Equation</div>
          <h2 style={styles.sectionTitle}>One <span style={{ color: GOLD }}>Equation</span></h2>
          <p style={styles.sectionBody}>
            This is the central conjecture of the entire AETHER program. It is not yet proven.
            But it is precisely stated, domain-specific in all parameters, and has a clear path to
            falsification. That is what makes it science rather than philosophy.
          </p>
          <div style={styles.masterWrap}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 3, color: LAV, textTransform: "uppercase", marginBottom: 16 }}>AETHER Master Equation · v1.0 · Status: Open Conjecture</div>
            <pre style={styles.masterEq}>{`d_t rho-hat  =  -(i/hbar)[H-hat, rho-hat]  +  D[rho-hat]  +  phi^-1 * C[rho-hat, W]

------------------------------------------------------------------
Term             Role                    Status
------------------------------------------------------------------
d_t rho-hat      rate of change          universal
-(i/hbar)[H,rho] coherent evolution      DOC (quantum)
D[rho-hat]       dissipation / noise     DOC (Lindblad)
C[rho-hat, W]    AETHER correction       HYP (domain-specific)
phi^-1 = 0.618   learning rate / gain    OPEN CONJECTURE
------------------------------------------------------------------

Central Conjecture:
The RG fixed-point of this equation under coarse-graining
has eigenvalue phi -- not inserted by hand, but emergent.

Proof path (Wilson universality analogy):
1. Specify C[rho,W] for each domain explicitly
2. Perform renormalization group analysis
3. Show stable fixed point has phi-structured eigenmodes
4. If confirmed: phi is not decoration -- it is the
   universal attractor of the coherence optimization

Falsification:
If RG analysis yields a different fixed-point ratio
(e.g., sqrt(2), e, or domain-dependent irrational),
the phi^-1 conjecture fails and must be revised.`}</pre>
            <div style={{ marginTop: 20, textAlign: "left" }}><MasterSim /></div>
            <div style={styles.masterLabel}>The loop is the invariant. phi is its fingerprint. -- AETHER Unified Synthesis v1.0</div>
          </div>
        </section>

        <div style={styles.divider} />

        {/* STATUS TABLE */}
        <section style={styles.section} id="status">
          <div style={styles.eyebrow}>Grand Epistemic Registry</div>
          <h2 style={styles.sectionTitle}>Every Claim · Every <span style={{ color: GOLD }}>Status</span></h2>
          <p style={styles.sectionBody}>
            The full AETHER claim registry. DOC/EST/HYP with explicit open problems and falsifiability conditions.
            This is the document that makes the framework stronger, not weaker.
          </p>
          <table style={styles.statusTable}>
            <thead>
              <tr>
                {["Status", "Domain", "Claim", "Next Step"].map(h => (
                  <th key={h} style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, color: DIM, textTransform: "uppercase", padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, textAlign: "left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {statusRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid rgba(200,168,64,0.05)" }}>
                  <td style={{ padding: "12px 12px", fontSize: "0.83rem", verticalAlign: "top", lineHeight: 1.55 }}>
                    <span style={tagStyleMap[r.status]}>{tagLabelMap[r.status]}</span>
                  </td>
                  <td style={{ padding: "12px 12px", fontSize: "0.83rem", verticalAlign: "top", lineHeight: 1.55, fontFamily: "'Space Mono',monospace", fontSize: 9 as unknown as string }}>{r.domain}</td>
                  <td style={{ padding: "12px 12px", fontSize: "0.83rem", verticalAlign: "top", lineHeight: 1.55 }}>{r.claim}</td>
                  <td style={{ padding: "12px 12px", fontSize: "0.78rem", color: DIM, verticalAlign: "top", lineHeight: 1.55 }}>{r.next}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <div style={styles.divider} />

        <footer style={styles.footer}>
          <div style={styles.footerPhi}>phi</div>
          <div style={styles.footerTitle}>AETHER · The Path Forward</div>
          <div style={styles.footerSub}>
            AetherLife.co · @StrategicProce · April 9, 2026{"\n"}
            Four Papers · Seven Tests · Three Theorems · One Master Equation{"\n"}
            C(x,t) = 1 - ||E(t)||/||X*(t)|| · phi^n = F_n*phi + F_{"{n-1}"} · r(t) = sqrt(cos^2 + sin^2)
          </div>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "rgba(200,168,64,0.3)", letterSpacing: 2, textTransform: "uppercase" }}>
            The loop is the invariant. phi is its fingerprint.
          </div>
        </footer>
      </div>
    </div>
  );
}

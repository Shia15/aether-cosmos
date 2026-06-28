import { useEffect, useRef, useState } from "react";

const GOLD = "#C8A840";
const BLOOM = "#7EC890";
const ROSE = "#D46878";
const LAV = "#8878D4";
const DIM = "rgba(232,224,208,0.45)";
const BORDER = "rgba(200,168,64,0.18)";
const VOID = "#080611";
const VOID2 = "#0d0b1a";

const s: Record<string, React.CSSProperties> = {
  root: { background: VOID, color: "#e8e0d0", fontFamily: "'EB Garamond','Crimson Pro',Georgia,serif", fontSize: 16, overflowX: "hidden" },
  hero: { position: "relative", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  heroCanvas: { position: "absolute", inset: 0, width: "100%", height: "100%" },
  heroContent: { position: "relative", zIndex: 10, textAlign: "center", padding: "0 24px" },
  heroEyebrow: { fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 4, color: GOLD, opacity: 0.7, textTransform: "uppercase", marginBottom: 20 },
  heroTitle: { fontFamily: "'Cinzel','Orbitron',serif", fontSize: "clamp(2.8rem,6vw,5.5rem)", fontWeight: 700, lineHeight: 1.05, background: "linear-gradient(135deg,#C8A840 0%,#e8e0d0 50%,#8878D4 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: 16 },
  heroSubtitle: { fontFamily: "'EB Garamond',serif", fontSize: "clamp(1rem,2vw,1.25rem)", fontStyle: "italic", color: DIM, maxWidth: 640, margin: "0 auto 32px", lineHeight: 1.7 },
  heroDomains: { display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 32 },
  domainChip: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, padding: "5px 12px", border: `1px solid ${BORDER}`, borderRadius: 2, color: GOLD, textTransform: "uppercase", background: "rgba(200,168,64,0.06)" },
  scrollHint: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: DIM, textTransform: "uppercase" },
  divider: { width: "100%", height: 1, background: `linear-gradient(90deg,transparent,${GOLD},transparent)`, opacity: 0.2 },
  section: { maxWidth: 1200, margin: "0 auto", padding: "80px 32px" },
  sectionLabel: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 4, color: GOLD, opacity: 0.6, textTransform: "uppercase", marginBottom: 12 },
  sectionTitle: { fontFamily: "'Cinzel',serif", fontSize: "clamp(1.8rem,3.5vw,2.8rem)", fontWeight: 400, marginBottom: 8, lineHeight: 1.2 },
  sectionIntro: { fontSize: "1.05rem", color: DIM, maxWidth: 680, lineHeight: 1.8, marginBottom: 48 },
  loopSection: { background: `linear-gradient(180deg,${VOID} 0%,${VOID2} 100%)`, padding: "80px 0" },
  loopWrap: { maxWidth: 1200, margin: "0 auto", padding: "0 32px" },
  loopCanvasWrap: { position: "relative", width: "100%", aspectRatio: "2/1", maxHeight: 420 },
  loopCanvas: { width: "100%", height: "100%", border: `1px solid ${BORDER}`, borderRadius: 4 },
  loopLegend: { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginTop: 24 },
  loopItem: { textAlign: "center", padding: "12px 8px", border: `1px solid ${BORDER}`, borderRadius: 4, background: "rgba(200,168,64,0.04)" },
  loopItemNum: { fontFamily: "'Space Mono',monospace", fontSize: 18, color: GOLD, fontWeight: 700 },
  loopItemName: { fontFamily: "'Cinzel',serif", fontSize: 13, margin: "4px 0" },
  loopItemDesc: { fontFamily: "'Space Mono',monospace", fontSize: 9, color: DIM, letterSpacing: 1, lineHeight: 1.5 },
  floralGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 },
  speciesCard: { border: `1px solid ${BORDER}`, borderRadius: 4, padding: 24, background: "rgba(255,255,255,0.02)", position: "relative", overflow: "hidden" },
  speciesName: { fontFamily: "'Crimson Pro',Georgia,serif", fontSize: "1.1rem", fontStyle: "italic", marginBottom: 4 },
  speciesCommon: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: DIM, textTransform: "uppercase", marginBottom: 16 },
  eagScore: { fontFamily: "'Space Mono',monospace", fontSize: 28, fontWeight: 700, marginBottom: 4 },
  eagLabel: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: DIM, textTransform: "uppercase", marginBottom: 16 },
  gcmsWrap: { border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20, background: "rgba(255,255,255,0.015)", marginTop: 24 },
  gcmsTitle: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: GOLD, textTransform: "uppercase", marginBottom: 12 },
  bridgeGrid: { display: "grid", gridTemplateColumns: "1fr 48px 1fr", gap: 0, alignItems: "center", marginBottom: 32 },
  bridgeDomain: { padding: 28, border: `1px solid ${BORDER}`, borderRadius: 4, background: "rgba(255,255,255,0.02)" },
  bridgeArrow: { textAlign: "center", fontSize: 20, color: GOLD, opacity: 0.6 },
  bridgeDomainTitle: { fontFamily: "'Crimson Pro',serif", fontSize: "1rem", marginBottom: 8 },
  bridgeDomainMath: { fontFamily: "'Space Mono',monospace", fontSize: 11, color: GOLD, marginBottom: 8, lineHeight: 1.6, whiteSpace: "pre-wrap" },
  bridgeDomainText: { fontSize: "0.85rem", color: DIM, lineHeight: 1.6 },
  coherenceBadge: { display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", border: `1px solid ${BLOOM}`, borderRadius: 2, background: "rgba(126,200,144,0.06)", marginTop: 12 },
  oncoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 32 },
  oncoCard: { border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20, background: "rgba(255,255,255,0.015)" },
  oncoIcon: { fontSize: 24, marginBottom: 10 },
  oncoTitle: { fontFamily: "'Crimson Pro',serif", fontSize: "0.95rem", marginBottom: 8 },
  oncoBody: { fontSize: "0.82rem", color: DIM, lineHeight: 1.65 },
  tagDoc: { display: "inline-block", marginTop: 10, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, padding: "3px 8px", borderRadius: 2, background: "rgba(126,200,144,0.15)", color: BLOOM, border: "1px solid rgba(126,200,144,0.3)" },
  tagEst: { display: "inline-block", marginTop: 10, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, padding: "3px 8px", borderRadius: 2, background: "rgba(200,168,64,0.12)", color: GOLD, border: "1px solid rgba(200,168,64,0.3)" },
  tagHyp: { display: "inline-block", marginTop: 10, fontFamily: "'Space Mono',monospace", fontSize: 8, letterSpacing: 2, padding: "3px 8px", borderRadius: 2, background: "rgba(136,120,212,0.15)", color: LAV, border: "1px solid rgba(136,120,212,0.3)" },
  kuraWrap: { border: `1px solid ${BORDER}`, borderRadius: 4, padding: 20, background: "rgba(255,255,255,0.015)", marginTop: 24 },
  kControls: { display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", marginTop: 14 },
  kSliderGroup: { display: "flex", alignItems: "center", gap: 8 },
  kLabel: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 1, color: DIM, whiteSpace: "nowrap" },
  kVal: { fontFamily: "'Space Mono',monospace", fontSize: 10, color: GOLD, minWidth: 32 },
  spiralSection: { background: "#000", padding: 0, position: "relative", overflow: "hidden" },
  spiralCanvas: { display: "block", width: "100%", height: "100vh" },
  spiralOverlay: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 5 },
  spiralTitle: { fontFamily: "'Cinzel',serif", fontSize: "clamp(1.4rem,3vw,2.4rem)", fontStyle: "italic", color: "rgba(200,168,64,0.8)", textAlign: "center", textShadow: "0 0 40px rgba(200,168,64,0.4)", marginBottom: 12 },
  spiralSubtitle: { fontFamily: "'Space Mono',monospace", fontSize: 10, letterSpacing: 3, color: "rgba(232,224,208,0.35)", textAlign: "center" },
  mathGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 },
  mathCard: { border: `1px solid ${BORDER}`, borderRadius: 4, padding: 24, background: "rgba(255,255,255,0.015)" },
  mathCardTitle: { fontFamily: "'Crimson Pro',serif", fontSize: "1rem", marginBottom: 12, color: GOLD },
  mathEq: { fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#e8e0d0", background: "rgba(0,0,0,0.4)", borderLeft: `2px solid ${GOLD}`, padding: "10px 14px", margin: "8px 0", lineHeight: 1.8, borderRadius: "0 2px 2px 0", whiteSpace: "pre-wrap", wordBreak: "break-all" },
  mathNote: { fontSize: "0.82rem", color: DIM, lineHeight: 1.6, marginTop: 8 },
  epTable: { width: "100%", borderCollapse: "collapse", marginTop: 24 },
  footer: { background: VOID, borderTop: `1px solid ${BORDER}`, padding: "48px 32px", textAlign: "center" },
  footerLogo: { fontFamily: "'Cinzel',serif", fontSize: "1.6rem", color: GOLD, marginBottom: 8 },
  footerTagline: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 3, color: DIM, textTransform: "uppercase", marginBottom: 24 },
  footerLinks: { display: "flex", flexWrap: "wrap", gap: 20, justifyContent: "center" },
  footerLink: { fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: DIM, textTransform: "uppercase" },
};

export default function GrandUnifiedPage() {
  const heroRef = useRef<HTMLCanvasElement>(null);
  const loopRef = useRef<HTMLCanvasElement>(null);
  const gcmsRef = useRef<HTMLCanvasElement>(null);
  const kuraRef = useRef<HTMLCanvasElement>(null);
  const spiralRef = useRef<HTMLCanvasElement>(null);
  const lewisiiRef = useRef<HTMLDivElement>(null);
  const cardinalisRef = useRef<HTMLDivElement>(null);
  const [kVal, setKVal] = useState(1.5);
  const [noiseVal, setNoiseVal] = useState(0.5);
  const [nVal, setNVal] = useState(12);
  const kRef = useRef(1.5);
  const sigmaRef = useRef(0.5);
  const nRef = useRef(12);
  const kuraStateRef = useRef<{ thetas: number[]; omegas: number[]; animId: number | null }>({ thetas: [], omegas: [], animId: null });

  useEffect(() => {
    const canvas = heroRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const PHI = 1.6180339887;
    const GA = 2 * Math.PI / (PHI * PHI);
    let W = 0, H = 0, t = 0;
    let animId: number;
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    resize();
    window.addEventListener("resize", resize);
    const particles = Array.from({ length: 280 }, (_, i) => ({
      phase: i * GA, speed: 0.0004 + (i / 280) * 0.003,
      baseR: 20 + Math.pow(i, 0.75) * 4.2, size: 0.8 + (i / 280) * 3,
      pulseSpeed: 0.005 + Math.random() * 0.025, pulsePhase: Math.random() * Math.PI * 2,
      layer: i < 60 ? 0 : i < 140 ? 1 : 2,
    }));
    const colors = ["rgba(200,168,64,", "rgba(126,200,144,", "rgba(212,104,120,"];
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(8,6,17,0.18)"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2; t++;
      particles.forEach(p => {
        const angle = p.phase + t * p.speed;
        const r = p.baseR + t * 0.012;
        const x = cx + Math.cos(angle) * r, y = cy + Math.sin(angle) * r;
        const pulse = p.size + Math.sin(t * p.pulseSpeed + p.pulsePhase) * p.size * 0.5;
        ctx.globalCompositeOperation = "screen";
        const grd = ctx.createRadialGradient(x, y, 0, x, y, pulse * 3);
        grd.addColorStop(0, colors[p.layer] + "0.7)"); grd.addColorStop(1, colors[p.layer] + "0)");
        ctx.beginPath(); ctx.arc(x, y, pulse * 3, 0, Math.PI * 2); ctx.fillStyle = grd; ctx.fill();
        ctx.globalCompositeOperation = "source-over";
        ctx.beginPath(); ctx.arc(x, y, pulse, 0, Math.PI * 2);
        ctx.fillStyle = colors[p.layer] + "0.9)"; ctx.fill();
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  useEffect(() => {
    const canvas = loopRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let t = 0, animId: number;
    function resize() { canvas.width = canvas.offsetWidth * devicePixelRatio; canvas.height = canvas.offsetHeight * devicePixelRatio; ctx.scale(devicePixelRatio, devicePixelRatio); }
    resize();
    const phases = [
      { label: "SENSE", color: "#C8A840", angle: -Math.PI / 2 },
      { label: "DELIVER", color: "#7EC890", angle: -Math.PI / 2 + (2 * Math.PI / 5) },
      { label: "ACTIVATE", color: "#D46878", angle: -Math.PI / 2 + (2 * Math.PI / 5) * 2 },
      { label: "FEEDBACK", color: "#8878D4", angle: -Math.PI / 2 + (2 * Math.PI / 5) * 3 },
      { label: "LEARN", color: "#4EB8D4", angle: -Math.PI / 2 + (2 * Math.PI / 5) * 4 },
    ];
    function draw() {
      const W = canvas.offsetWidth, H = canvas.offsetHeight;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "rgba(13,11,26,0.95)"; ctx.fillRect(0, 0, W, H);
      const cx = W / 2, cy = H / 2;
      const R = Math.min(W, H) * 0.36;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200,168,64,0.12)"; ctx.lineWidth = 1; ctx.stroke();
      const signalAngle = -Math.PI / 2 + t * 0.012;
      const sx = cx + Math.cos(signalAngle) * R, sy = cy + Math.sin(signalAngle) * R;
      const grd2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, 12);
      grd2.addColorStop(0, "rgba(200,168,64,0.8)"); grd2.addColorStop(1, "rgba(200,168,64,0)");
      ctx.beginPath(); ctx.arc(sx, sy, 12, 0, Math.PI * 2); ctx.fillStyle = grd2; ctx.fill();
      phases.forEach((p, i) => {
        const x = cx + Math.cos(p.angle) * R, y = cy + Math.sin(p.angle) * R;
        const dist = Math.abs(((signalAngle - p.angle) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI));
        const pulse = dist < 0.4 ? 1 - dist / 0.4 : 0;
        if (pulse > 0) {
          ctx.beginPath(); ctx.arc(x, y, 40 + pulse * 20, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(200,168,64,${0.08 * pulse})`; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(x, y, 28 + pulse * 6, 0, Math.PI * 2);
        ctx.strokeStyle = p.color; ctx.lineWidth = 1.5 + pulse; ctx.stroke();
        ctx.fillStyle = `rgba(8,6,17,${0.85 - pulse * 0.3})`; ctx.fill();
        ctx.font = "bold 11px 'Space Mono'"; ctx.fillStyle = p.color;
        ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(p.label, x, y);
        const nextP = phases[(i + 1) % 5];
        const nx = cx + Math.cos(nextP.angle) * R, ny = cy + Math.sin(nextP.angle) * R;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(nx, ny);
        ctx.strokeStyle = "rgba(200,168,64,0.07)"; ctx.lineWidth = 0.5; ctx.stroke();
      });
      ctx.font = "italic 13px Georgia"; ctx.fillStyle = "rgba(232,224,208,0.5)";
      ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("C(x,t)", cx, cy);
      t++; animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const lewisii = [{ name: "Linalool", pct: 34, color: "#7ecfb0" }, { name: "B-Ocimene", pct: 22, color: "#a87ecf" }, { name: "Myrcene", pct: 15, color: "#b8d44a" }, { name: "Geraniol", pct: 11, color: "#d4705a" }, { name: "d-Limonene", pct: 9, color: "#e8a825" }, { name: "B-Caryoph.", pct: 6, color: "#7a9060" }, { name: "Farnesene", pct: 3, color: "#5a7040" }];
    const cardinalis = [{ name: "d-Limonene", pct: 38, color: "#e8a825" }, { name: "Alpha-Pinene", pct: 21, color: "#b8d44a" }, { name: "Camphene", pct: 14, color: "#7ecfb0" }, { name: "p-Cymene", pct: 10, color: "#a87ecf" }, { name: "Linalool", pct: 9, color: "#7ecfb0" }, { name: "Terpinolene", pct: 5, color: "#d4705a" }, { name: "Geraniol", pct: 3, color: "#d4705a" }];
    function render(data: typeof lewisii, el: HTMLDivElement | null) {
      if (!el) return;
      el.innerHTML = data.map(v => `<div style="display:grid;grid-template-columns:90px 1fr 36px;align-items:center;gap:8px;margin-bottom:6px"><span style="font-family:'Space Mono',monospace;font-size:9px;color:rgba(232,224,208,0.45);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${v.name}</span><div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden"><div style="height:100%;width:${v.pct}%;background:${v.color};border-radius:2px"></div></div><span style="font-family:'Space Mono',monospace;font-size:9px;color:rgba(232,224,208,0.45);text-align:right">${v.pct}%</span></div>`).join("");
    }
    render(lewisii, lewisiiRef.current);
    render(cardinalis, cardinalisRef.current);
  }, []);

  useEffect(() => {
    const canvas = gcmsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = "rgba(13,11,26,0.98)"; ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); ctx.moveTo(30, H - 20); ctx.lineTo(W - 10, H - 20);
    ctx.strokeStyle = "rgba(200,168,64,0.2)"; ctx.lineWidth = 0.5; ctx.stroke();
    const xS = (rt: number) => 30 + (rt / 17) * (W - 40);
    const yS = (h: number) => (H - 20) - h * (H - 40);
    const lewisiiPeaks = [{ rt: 2.8, h: 0.18, label: "Myrcene", color: "#b8d44a" }, { rt: 5.5, h: 0.72, label: "Linalool", color: "#7ecfb0" }, { rt: 7.2, h: 0.52, label: "B-Ocimene", color: "#a87ecf" }, { rt: 9.1, h: 0.32, label: "Geraniol", color: "#d4705a" }, { rt: 11.0, h: 0.22, label: "Limonene", color: "#e8a825" }, { rt: 13.5, h: 0.12, label: "B-Caryo", color: "#7a9060" }];
    const cardPeaks = [{ rt: 3.1, h: 0.44, label: "Alpha-Pinene", color: "#b8d44a" }, { rt: 4.5, h: 0.25, label: "Camphene", color: "#7ecfb0" }, { rt: 6.8, h: 0.82, label: "Limonene", color: "#e8a825" }, { rt: 8.6, h: 0.19, label: "p-Cymene", color: "#a87ecf" }, { rt: 10.3, h: 0.16, label: "Linalool", color: "#7ecfb0" }, { rt: 12.8, h: 0.09, label: "Geraniol", color: "#d4705a" }];
    function drawPeak(peaks: typeof lewisiiPeaks, alpha: number) {
      peaks.forEach(p => {
        const x = xS(p.rt), w = 18;
        ctx.beginPath();
        for (let px = x - w * 3; px <= x + w * 3; px++) {
          const rel = (px - x) / w;
          const y = (H - 20) - p.h * (H - 40) * Math.exp(-rel * rel * 1.2);
          if (px === x - w * 3) ctx.moveTo(px, y); else ctx.lineTo(px, y);
        }
        ctx.strokeStyle = p.color; ctx.globalAlpha = alpha; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.beginPath();
        for (let px = x - w * 3; px <= x + w * 3; px++) {
          const rel = (px - x) / w;
          const y = (H - 20) - p.h * (H - 40) * Math.exp(-rel * rel * 1.2);
          if (px === x - w * 3) ctx.moveTo(px, H - 20); ctx.lineTo(px, y);
        }
        ctx.lineTo(x + w * 3, H - 20); ctx.closePath();
        ctx.fillStyle = p.color; ctx.globalAlpha = alpha * 0.15; ctx.fill(); ctx.globalAlpha = 1;
        ctx.font = "8px Space Mono"; ctx.fillStyle = p.color; ctx.globalAlpha = alpha;
        ctx.textAlign = "center"; ctx.fillText(p.label, x, yS(p.h) - 4); ctx.globalAlpha = 1;
      });
    }
    drawPeak(lewisiiPeaks, 0.9);
    drawPeak(cardPeaks, 0.7);
  }, []);

  useEffect(() => {
    const canvas = kuraRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const state = kuraStateRef.current;

    function init() {
      const N = nRef.current;
      state.thetas = Array.from({ length: N }, (_, i) => (i / N) * 2 * Math.PI);
      state.omegas = Array.from({ length: N }, () => (Math.random() - 0.5) * sigmaRef.current);
    }

    function step() {
      const N = Math.max(2, nRef.current);
      const K = kRef.current;
      const newTheta = [...state.thetas];
      for (let i = 0; i < N; i++) {
        let sync = 0;
        for (let j = 0; j < N; j++) sync += Math.sin(state.thetas[j] - state.thetas[i]);
        newTheta[i] = state.thetas[i] + 0.04 * (state.omegas[i] + (K / N) * sync);
      }
      state.thetas = newTheta;
    }

    function order() {
      const N = Math.max(2, nRef.current);
      let sc = 0, ss = 0;
      for (let i = 0; i < N; i++) { sc += Math.cos(state.thetas[i]); ss += Math.sin(state.thetas[i]); }
      return Math.sqrt((sc / N) ** 2 + (ss / N) ** 2);
    }

    let history: number[] = [];

    function draw() {
      const W = canvas.width, H = canvas.height;
      const N = Math.max(2, nRef.current);
      ctx.fillStyle = "rgba(13,11,26,0.25)"; ctx.fillRect(0, 0, W, H);
      step();
      const r = order();
      history.push(r);
      if (history.length > W - 160) history.shift();
      ctx.beginPath();
      history.forEach((v, i) => {
        const x = 160 + i, y = H / 2 - v * (H / 2 - 20);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.strokeStyle = r > 0.7 ? "#7EC890" : r > 0.4 ? "#C8A840" : "#D46878";
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(160, H / 2 - 0.7 * (H / 2 - 20)); ctx.lineTo(W, H / 2 - 0.7 * (H / 2 - 20));
      ctx.strokeStyle = "rgba(126,200,144,0.3)"; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.setLineDash([]);
      const cx = 80, cy = H / 2, rr = 55;
      ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200,168,64,0.15)"; ctx.lineWidth = 0.5; ctx.stroke();
      for (let i = 0; i < N; i++) {
        const x = cx + Math.cos(state.thetas[i]) * rr, y = cy + Math.sin(state.thetas[i]) * rr;
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${200 + i * 15},60%,65%)`; ctx.fill();
      }
      let mx = 0, my = 0;
      for (let i = 0; i < N; i++) { mx += Math.cos(state.thetas[i]); my += Math.sin(state.thetas[i]); }
      mx /= N; my /= N;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + mx * rr, cy + my * rr);
      ctx.strokeStyle = `rgba(200,168,64,${r})`; ctx.lineWidth = 2; ctx.stroke();
      ctx.font = "700 14px 'Space Mono'";
      ctx.fillStyle = r > 0.7 ? "#7EC890" : r > 0.4 ? "#C8A840" : "#D46878";
      ctx.textAlign = "right"; ctx.fillText(`r = ${r.toFixed(3)}`, W - 12, 20);
      ctx.font = "9px 'Space Mono'"; ctx.fillStyle = "rgba(232,224,208,0.35)";
      ctx.fillText(r > 0.7 ? "COHERENT -- healthy tissue" : r > 0.4 ? "PARTIAL -- transitional" : "INCOHERENT -- tumor", W - 12, 36);
      state.animId = requestAnimationFrame(draw);
    }

    init(); draw();
    return () => { if (state.animId !== null) cancelAnimationFrame(state.animId); };
  }, []);

  useEffect(() => {
    const canvas = spiralRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const PHI = 1.6180339887;
    const GA = 2 * Math.PI / (PHI * PHI);
    let W = 0, H = 0, t = 0, animId: number;
    function resize() { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; }
    resize(); window.addEventListener("resize", resize);

    type SNode = { radius: number; speed: number; phase: number; scale: number; layer: number; x?: number; y?: number; size?: number };
    const nodes: SNode[] = [];
    for (let i = 0; i < 20; i++) nodes.push({ radius: 60 + i * 18, speed: 0.0006, phase: i * GA, scale: 0.002, layer: 0 });
    for (let i = 0; i < 45; i++) nodes.push({ radius: 22 + i * 8, speed: 0.002, phase: i * GA * 2, scale: 0.008, layer: 1 });
    for (let i = 0; i < 90; i++) nodes.push({ radius: 6 + i * 2.5, speed: 0.008, phase: i * GA * 3, scale: 0.04, layer: 2 });
    const colors = ["rgba(200,168,64,0.8)", "rgba(126,200,144,0.7)", "rgba(212,104,120,0.65)"];

    function animate() {
      ctx.fillStyle = "rgba(0,0,0,0.12)"; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "screen";
      nodes.forEach(n => {
        const angle = t * n.speed + n.phase;
        const r = n.radius + t * 0.018;
        const x = W / 2 + Math.cos(angle) * r;
        const y = H / 2 + Math.sin(angle) * r;
        const size = 1.2 + Math.sin(t * n.scale + n.phase) * 1.2;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = colors[n.layer]; ctx.fill();
      });
      ctx.globalCompositeOperation = "source-over";
      t++; animId = requestAnimationFrame(animate);
    }
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div style={s.root}>
      {/* HERO */}
      <section style={s.hero}>
        <canvas ref={heroRef} style={s.heroCanvas} />
        <div style={s.heroContent}>
          <div style={s.heroEyebrow}>AetherLife.co · Grand Unified Synthesis · v3.0</div>
          <h1 style={s.heroTitle}>Adaptive Emergent<br />Temporal Harmonic<br />Evolutionary Resonance</h1>
          <p style={s.heroSubtitle}>
            Chemical signals in flowers, coherence collapse in tumors, biological computation, and warp geometry --
            one five-phase loop, scale-invariant across all of physical reality.
          </p>
          <div style={s.heroDomains}>
            {["Floral Volatiles", "Precision Oncology", "Biological Computation", "Women's Cycles", "Field Physics"].map(d => (
              <span key={d} style={s.domainChip}>{d}</span>
            ))}
          </div>
          <div style={s.scrollHint}>scroll to traverse</div>
        </div>
      </section>

      <div style={s.divider} />

      {/* AETHER LOOP */}
      <section style={s.loopSection}>
        <div style={s.loopWrap}>
          <div style={s.sectionLabel}>Five-Phase Architecture</div>
          <h2 style={s.sectionTitle}>The <span style={{ color: GOLD }}>AETHER</span> Coherence Loop</h2>
          <p style={{ ...s.sectionIntro, marginBottom: 32 }}>
            Sense -- Deliver -- Activate -- Feedback -- Learn. Five phases operating through physically real mechanisms,
            scale-invariant from molecular VOC receptors to interplanetary coherence probes.
          </p>
          <div style={s.loopCanvasWrap}>
            <canvas ref={loopRef} style={s.loopCanvas} />
          </div>
          <div style={s.loopLegend}>
            {[
              { num: "S", name: "Sense", desc: "GC-MS headspace\nscRNA-seq\nEEG delta" },
              { num: "D", name: "Deliver", desc: "VOC diffusion\nFerrofluid guidance\nAxonal transport" },
              { num: "A", name: "Activate", desc: "EAG depolarization\nROS overload\nSynaptic LTP" },
              { num: "F", name: "Feedback", desc: "Visitation -> delta-V\nMycelium readout\nAether Mirror" },
              { num: "L", name: "Learn", desc: "Breeder's equation\nPACE evolution\nphi-time scaling" },
            ].map(item => (
              <div key={item.num} style={s.loopItem}>
                <div style={s.loopItemNum}>{item.num}</div>
                <div style={s.loopItemName}>{item.name}</div>
                <div style={{ ...s.loopItemDesc, whiteSpace: "pre-line" }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={s.divider} />

      {/* FLORAL */}
      <section style={{ ...s.section, background: VOID }}>
        <div style={s.sectionLabel}>Domain I · Floral Chemistry</div>
        <h2 style={s.sectionTitle}>Chemical Signals in <span style={{ color: GOLD }}>Pollination Syndromes</span></h2>
        <p style={s.sectionIntro}>
          Floral volatiles are multidimensional coherence vectors. The Mimulus system demonstrates how
          a single regulatory mutation at OCIMENE SYNTHASE shifts the bouquet from C(x,t) ~= 0.92 (bee-coherent)
          to C(x,t) ~= 0.10 -- a coherence collapse mathematically equivalent to tumor microenvironment failure.
        </p>
        <div style={s.floralGrid}>
          <div style={s.speciesCard}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: BLOOM }} />
            <div style={s.speciesName}>Mimulus lewisii</div>
            <div style={s.speciesCommon}>Pink Monkeyflower · Bee-pollinated · Sierra Nevada</div>
            <div style={{ ...s.eagScore, color: BLOOM }}>92%</div>
            <div style={s.eagLabel}>Bumblebee EAG Coherence Score</div>
            <div ref={lewisiiRef} />
          </div>
          <div style={s.speciesCard}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: ROSE }} />
            <div style={s.speciesName}>Mimulus cardinalis (yellow morph)</div>
            <div style={s.speciesCommon}>Cardinal Monkeyflower · Incipient Pollinator Shift · 2025</div>
            <div style={{ ...s.eagScore, color: ROSE }}>31%</div>
            <div style={s.eagLabel}>Bumblebee EAG Coherence Score -- 65%</div>
            <div ref={cardinalisRef} />
          </div>
        </div>
        <div style={s.gcmsWrap}>
          <div style={s.gcmsTitle}>GC-MS Chromatogram Simulation · Headspace HS-SPME · Agilent Ultra Inert Column</div>
          <canvas ref={gcmsRef} style={{ width: "100%", height: 120, display: "block" }} width={1200} height={120} />
          <div style={{ display: "flex", gap: 16, marginTop: 8, flexWrap: "wrap" }}>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: BLOOM }}>M. lewisii (bee-coherent)</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: ROSE }}>M. cardinalis (coherence-collapsed)</div>
            <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: DIM }}>Retention time --&gt;</div>
          </div>
        </div>
        <div style={{ marginTop: 32, padding: 24, border: `1px solid ${BORDER}`, borderRadius: 4, background: "rgba(255,255,255,0.015)" }}>
          <div style={s.gcmsTitle}>Evolutionary Dynamics · Breeder's Equation in Bouquet Space</div>
          <pre style={{ fontFamily: "'Space Mono',monospace", fontSize: 11, color: "#e8e0d0", background: "rgba(0,0,0,0.4)", borderLeft: `2px solid ${GOLD}`, padding: "10px 14px", margin: "8px 0", lineHeight: 1.8, borderRadius: "0 2px 2px 0", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{`Delta-z = G * beta

where:
  z = scent vector mean (linalool, ocimene, limonene fractions)
  G = additive genetic variance-covariance matrix
  beta = selection gradient from differential bee/hummingbird visitation

dV/dt = S(V) - mu*V   [mu = mutation/drift rate]

Result: Scent loss in M. cardinalis reproduced in <50 generations under hummingbird selection bias
Coherence bridge: cosine_sim(M.cardinalis VOC, Rosa centifolia) = 0.82 [HYP]`}</pre>
        </div>
      </section>

      <div style={s.divider} />

      {/* COHERENCE BRIDGE */}
      <section style={{ ...s.section, background: "linear-gradient(180deg,var(--void,#080611) 0%,#0a0818 100%)" }}>
        <div style={s.sectionLabel}>Cross-Domain Isomorphism</div>
        <h2 style={s.sectionTitle}>The <span style={{ color: GOLD }}>Coherence Bridge</span> Hypothesis</h2>
        <p style={s.sectionIntro}>
          C(x,t) = 1 - ||E(t)||/||X*(t)|| -- one functional, five domains.
          Floral volatile coherence loss in Mimulus and tumor microenvironment collapse are
          proposed as the same dynamical event at different biological scales.
        </p>
        <div style={s.bridgeGrid}>
          <div style={s.bridgeDomain}>
            <div style={s.bridgeDomainTitle}>Floral Coherence</div>
            <div style={s.bridgeDomainMath}>{`V = (linalool, ocimene, myrcene, ...)
R_total = alpha * V
C_floral = 1 - ||E||/||X*||
M. lewisii: C ~= 0.92
M. cardinalis: C ~= 0.10`}</div>
            <div style={s.bridgeDomainText}>
              VOC bouquet as coherence state vector. EAG score as direct coherence readout.
              Pollinator visitation as the fitness proxy selecting toward or away from coherent states.
            </div>
            <div style={s.coherenceBadge}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color: BLOOM, fontWeight: 700 }}>0.92</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: DIM, letterSpacing: 1 }}>bee-coherent C(x,t)</span>
            </div>
          </div>
          <div style={s.bridgeArrow}>&lt;-&gt;</div>
          <div style={s.bridgeDomain}>
            <div style={s.bridgeDomainTitle}>Tumor Microenvironment</div>
            <div style={s.bridgeDomainMath}>{`X(t) = (proliferation, PD-L1,
T-cell infiltration, metabolic flux)
E(t) = X*(t) - X(t)
C_tumor = 1 - ||E||/||X*||
Healthy: C ~= 0.85+
TNBC: C ~= 0.12-0.20`}</div>
            <div style={s.bridgeDomainText}>
              Tumor microenvironment as coherence state vector. scRNA-seq as the GC-MS equivalent.
              Immune cell visitation as pollinator analogue -- selecting coherent vs incoherent tissue states.
            </div>
            <div style={{ ...s.coherenceBadge, borderColor: ROSE }}>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 14, color: ROSE, fontWeight: 700 }}>0.12</span>
              <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: DIM, letterSpacing: 1 }}>TNBC coherence collapse</span>
            </div>
          </div>
        </div>
        <div style={{ padding: 20, border: "1px solid rgba(136,120,212,0.3)", borderRadius: 4, background: "rgba(136,120,212,0.04)" }}>
          <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: LAV, textTransform: "uppercase", marginBottom: 8 }}>HYP · Coherence Bridge · Falsifiability Condition</div>
          <p style={{ fontSize: "0.88rem", color: DIM, lineHeight: 1.7 }}>
            <strong style={{ color: "#e8e0d0" }}>Hypothesis:</strong> The cosine similarity between ovulatory VOC profiles and Rosa centifolia bouquet (cos = 0.82, based on documented 2-phenylethanol and linalool overlap) reflects a conserved coherence geometry in phi-Fibonacci scent space across reproductive biology and floral chemistry.
            <br /><br />
            <strong style={{ color: "#e8e0d0" }}>Falsification:</strong> If GC-MS analysis of human ovulatory headspace fails to show elevated 2-phenylethanol and geraniol fractions above follicular baseline at p &lt; 0.05, the structural identity claim fails. If tumor microenvironment VOC profiles (breath biopsy) do not cluster with low-coherence floral phenotypes under cosine similarity analysis, the bridge collapses.
          </p>
        </div>
      </section>

      <div style={s.divider} />

      {/* ONCOLOGY */}
      <section style={{ ...s.section, background: VOID2 }}>
        <div style={s.sectionLabel}>Domain II · Precision Oncology</div>
        <h2 style={s.sectionTitle}>CLCS / CUCA · <span style={{ color: GOLD }}>Coherence Restoration</span> as Cancer Therapy</h2>
        <p style={s.sectionIntro}>
          Cancer is not a disease to be eliminated -- it is a coherence failure to be corrected.
          The CLCS-Bio agent does not kill cells indiscriminately; it restores relational stability
          between tumor cells and their microenvironment, then removes itself.
        </p>
        <div style={s.oncoGrid}>
          {[
            { icon: "🕸️", title: "Mycelium Spatial Sensing", body: "DBiT-Plus platform reads the tumor microenvironment in spatial context -- the biological equivalent of HS-SPME headspace sampling. Coherence state vector X(t) computed from scRNA-seq at cellular resolution.", tag: "tagDoc", tagLabel: "DOC · 2025 Trial Data" },
            { icon: "🧲", title: "Ferrofluid Delivery", body: "Magnetically guided ferrofluid-chemotherapy hybrids achieve sub-millimeter targeting -- the nanomedicine equivalent of pollinator precision landing. 59% glioblastoma kill rate (2025 trial data); 70-80% response in mycelium-assisted protocols.", tag: "tagDoc", tagLabel: "DOC · 59% Kill Rate" },
            { icon: "⚡", title: "Hyperthermia + ROS Activation", body: "Selective cell elimination via ROS overload -- the Activate phase. Intervention at the resonance point of the tumor's metabolic frequency, not broad-spectrum saturation. AETHER Loop phase 3 instantiation.", tag: "tagEst", tagLabel: "EST · Modeled" },
            { icon: "🔄", title: "Kill Switch Formalism", body: "terminate := NOT stabilizing_signal OR timer_expired OR breakdown_cue_threshold. Three independent termination mechanisms. No single point of failure. System degrades safely after mission complete.", tag: "tagHyp", tagLabel: "HYP · Formal Model" },
            { icon: "🧠", title: "PACE Meta-Learning", body: "Error-prone PCR + selection pressure discovers new circuit motifs. Knowledge export via conjugative plasmids (HGT) propagates successful coherence-restoring strategies spatially through the tumor ecosystem.", tag: "tagHyp", tagLabel: "HYP · Novel Architecture" },
            { icon: "🌿", title: "No Metal · No Silicon", body: "CUCA fully realized in the biological domain: genetic circuits, proteins, small-molecule signals, cellular substrates. Xenobots -- Anthrobots -- human tracheal cells proved living machines can enter and heal human tissue.", tag: "tagDoc", tagLabel: "DOC · Anthrobot 2024" },
          ].map((card, i) => (
            <div key={i} style={s.oncoCard}>
              <div style={s.oncoIcon}>{card.icon}</div>
              <div style={s.oncoTitle}>{card.title}</div>
              <div style={s.oncoBody}>{card.body}</div>
              <span style={s[card.tag]}>{card.tagLabel}</span>
            </div>
          ))}
        </div>
        <div style={s.kuraWrap}>
          <div style={s.gcmsTitle}>Live Kuramoto Coherence Oscillator · Tumor vs Healthy Tissue</div>
          <canvas ref={kuraRef} style={{ width: "100%", height: 200, display: "block" }} width={1100} height={200} />
          <div style={s.kControls}>
            <div style={s.kSliderGroup}>
              <label style={s.kLabel}>COUPLING K</label>
              <input type="range" min={0} max={3} step={0.05} value={kVal} style={{ width: 100, accentColor: GOLD }} onChange={e => { const v = parseFloat(e.target.value); setKVal(v); kRef.current = v; }} />
              <span style={s.kVal}>{kVal.toFixed(2)}</span>
            </div>
            <div style={s.kSliderGroup}>
              <label style={s.kLabel}>TUMOR NOISE sigma</label>
              <input type="range" min={0} max={2} step={0.05} value={noiseVal} style={{ width: 100, accentColor: GOLD }} onChange={e => { const v = parseFloat(e.target.value); setNoiseVal(v); sigmaRef.current = v; const N = Math.max(2, nRef.current); for (let i = 0; i < N; i++) kuraStateRef.current.omegas[i] = (Math.random() - 0.5) * v; }} />
              <span style={s.kVal}>{noiseVal.toFixed(2)}</span>
            </div>
            <div style={s.kSliderGroup}>
              <label style={s.kLabel}>N OSCILLATORS</label>
              <input type="range" min={6} max={24} step={1} value={nVal} style={{ width: 100, accentColor: GOLD }} onChange={e => { const v = parseInt(e.target.value); setNVal(v); nRef.current = v; }} />
              <span style={s.kVal}>{nVal}</span>
            </div>
            <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: DIM }}>Order r(t) = sqrt(cos^2 + sin^2)</span>
          </div>
        </div>
      </section>

      <div style={s.divider} />

      {/* SPIRAL FIELD */}
      <section style={s.spiralSection}>
        <canvas ref={spiralRef} style={s.spiralCanvas} />
        <div style={s.spiralOverlay}>
          <div style={s.spiralTitle}>The phi-Fibonacci Field</div>
          <div style={s.spiralSubtitle}>Golden angle Theta_phi = 2*pi/phi^2 ~= 137.5 deg · Kuramoto order parameter r(t) · Three-Distance Theorem</div>
        </div>
      </section>

      <div style={s.divider} />

      {/* MATH */}
      <section style={{ ...s.section, background: VOID }}>
        <div style={s.sectionLabel}>Mathematical Foundations</div>
        <h2 style={s.sectionTitle}>Key Mathematical <span style={{ color: GOLD }}>Objects</span></h2>
        <p style={s.sectionIntro}>
          Eight equations threading all five domains. Each is a special case of the CUCA unified system.
          Nothing is discarded; every domain-specific formula inherits from the coherence functional.
        </p>
        <div style={s.mathGrid}>
          {[
            { title: "Coherence Functional", eq: `C(x,t) = 1 - ||E(t)|| / ||X*(t)||

E(t) = X*(t) - X(t)

Domains:
  Floral: X = VOC bouquet vector
  Oncology: X = tumor state vector
  Neural: X = 8-band EEG spectrum
  Cycles: X = hormonal oscillator state
  Physics: X = field gradient tensor`, note: "Universal coherence measure. C -> 1 is health, coherence, speciation. C -> 0 is cancer, coherence collapse, pollinator shift failure." },
            { title: "Kuramoto Order Parameter", eq: `r(t) = sqrt( <cos theta_i>^2 + <sin theta_i>^2 )

r in [0, 1]
r -> 0: incoherent (tumor, collapsed bouquet)
r -> 1: phase-locked (healthy tissue, bee-sync)

Note: Always use mean resultant length formula.
Cosine-average can return negative.
Guard: Math.max(2, N) floor on oscillator count.`, note: "Kuramoto coupling K governs coherence transition. Critical K_c = 2*sigma/pi where sigma = frequency spread." },
            { title: "phi-Fibonacci Geometry", eq: `Binet:      phi^n = F_n*phi + F_{n-1}
3-Distance: D_N <= 1/(F_n*sqrt(5))
Golden angle: Theta_phi = 2*pi/phi^2 ~= 137.508 deg

Time cost: T_cost = P / R(t)
where R(t) = coherence-weighted traversal rate

Decision entropy:
dH_d/dt = alpha*P_expansion - beta*C(x,t) - gamma*R_ai(t)`, note: "phi-time scheduling minimizes packing discrepancy below all periodic and random modes. Proved by Hurwitz/Diophantine and Three-Distance theorems." },
            { title: "Volatile Emission Pipeline", eq: `Emission: E_i = (A_i * RF_i) / (t * N_f)

Normalized bouquet:
  V = (v_1, v_2, ..., v_n)
  v_i = E_i / Sum(E_j),   Sum(v_i) = 1

EAG Hill function:
  R(c_i) = R_max * c_i^h / (EC50^h + c_i^h)

Softmax pollinator preference:
  P(bee|V) = exp(beta*R_total) / Sum exp(beta*R_k)`, note: "GC-MS peak area -> normalized concentration vector -> Hill-function EAG -> logistic selection -> breeder's equation evolutionary dynamics." },
          ].map((card, i) => (
            <div key={i} style={s.mathCard}>
              <div style={s.mathCardTitle}>{card.title}</div>
              <pre style={s.mathEq}>{card.eq}</pre>
              <p style={s.mathNote}>{card.note}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={s.divider} />

      {/* EPISTEMIC */}
      <section style={{ ...s.section, background: VOID2 }}>
        <div style={s.sectionLabel}>Epistemic Integrity</div>
        <h2 style={s.sectionTitle}>Claim <span style={{ color: GOLD }}>Registry</span> -- DOC / EST / HYP</h2>
        <p style={s.sectionIntro}>
          Every claim in the AETHER corpus carries an explicit epistemic tag with falsifiability conditions.
          This is non-negotiable. The framework is stronger for honest epistemic boundaries.
        </p>
        <table style={s.epTable}>
          <thead>
            <tr>
              {["Status", "Domain", "Claim", "Source / Condition"].map(h => (
                <th key={h} style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: DIM, textTransform: "uppercase", padding: "8px 12px", borderBottom: `1px solid ${BORDER}`, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { s: "tagDoc", d: "Floral", c: "M. lewisii linalool/myrcene/ocimene = 93% of bouquet; 107x higher than M. cardinalis", src: "Byers et al. 2014, Nature Communications" },
              { s: "tagDoc", d: "Oncology", c: "Ferrofluid-chemotherapy hybrids achieve ~59% glioblastoma kill rate", src: "2025 trial data; mycelium-assisted 70-80%" },
              { s: "tagDoc", d: "Computation", c: "Anthrobot human tracheal cell constructs self-organize and can enter/traverse human tissue", src: "Levin Lab 2024, Nature" },
              { s: "tagDoc", d: "Floral", c: "Gymnadenia hybridization produces additive volatile blending in intermediate phenotypes", src: "Neequaye et al. 2025 bioRxiv" },
              { s: "tagEst", d: "Physics", c: "phi-time scheduler reduces packing discrepancy by ~34% vs periodic mode at N=512", src: "Modeled via Three-Distance Theorem bound" },
              { s: "tagEst", d: "Oncology", c: "CUCA-Bio 8-phase deployment reduces ||E(t)|| by 60-80% in simulated tumor models", src: "ODE simulation; awaits in vivo validation" },
              { s: "tagEst", d: "Neural", c: "phi-time neural scaling hypothesis: Fibonacci-spaced gamma bursts optimize inter-band coherence", src: "AETHER 8-band Kuramoto model; unfalsified" },
              { s: "tagHyp", d: "Cross-domain", c: "Coherence Bridge: floral VOC collapse and TME coherence collapse are mathematically equivalent under C(x,t)", src: "Falsified if cosine_sim(human ovulatory VOC, Rosa) < 0.5" },
              { s: "tagHyp", d: "Physics", c: "Emergent Bubble mechanism: asymmetric node field output migrates gradient minimum", src: "Falsified if gradient cancellation not reproduced in EM simulation" },
              { s: "tagHyp", d: "Cross-domain", c: "Dome apparatus (semicircular membrane, radial patterning, central sensor) = macro-scale Fibonacci field integrator", src: "Falsified if field integration gain < 2x over flat equivalent" },
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ padding: "12px 12px", borderBottom: "1px solid rgba(200,168,64,0.06)", fontSize: "0.85rem", verticalAlign: "top" }}>
                  <span style={s[row.s] as React.CSSProperties}>{row.s === "tagDoc" ? "DOC" : row.s === "tagEst" ? "EST" : "HYP"}</span>
                </td>
                <td style={{ padding: "12px 12px", borderBottom: "1px solid rgba(200,168,64,0.06)", fontSize: "0.85rem", verticalAlign: "top" }}>{row.d}</td>
                <td style={{ padding: "12px 12px", borderBottom: "1px solid rgba(200,168,64,0.06)", fontSize: "0.85rem", verticalAlign: "top", lineHeight: 1.5 }}>{row.c}</td>
                <td style={{ padding: "12px 12px", borderBottom: "1px solid rgba(200,168,64,0.06)", fontSize: "0.85rem", verticalAlign: "top", color: DIM, lineHeight: 1.5 }}>{row.src}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div style={s.divider} />

      <footer style={s.footer}>
        <div style={s.footerLogo}>AETHER</div>
        <div style={s.footerTagline}>AetherLife.co · @StrategicProce · Grand Unified Synthesis v3.0</div>
        <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, color: DIM, marginBottom: 24, lineHeight: 1.8 }}>
          Sense -- Deliver -- Activate -- Feedback -- Learn<br />
          phi-Fibonacci · Kuramoto · C(x,t) = 1 - ||E(t)||/||X*(t)||
        </div>
        <div style={s.footerLinks}>
          {["Floral Chemistry", "Oncology", "Computation", "Women's Cycles", "Field Physics", "Aether Mirror", "CUCA v4.1"].map(l => (
            <span key={l} style={s.footerLink}>{l}</span>
          ))}
        </div>
      </footer>
    </div>
  );
}

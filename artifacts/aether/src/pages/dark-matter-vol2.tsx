import { useEffect, useRef, useState } from "react";

const NAVY = "#080f1e";
const TEAL = "#00d4c8";
const GOLD = "#f0c040";
const ORANGE = "#ff8c42";
const VIOLET = "#9b5de5";
const PINK = "#f72585";
const GREEN = "#4ade80";
const CYAN = "#22d3ee";
const RED = "#f87171";
const TEXT = "#cdd6f4";
const MUTED = "#6b7a9a";
const BORDER = "#1e3060";
const PANEL = "#111f38";

const s: Record<string, React.CSSProperties> = {
  root: { background: NAVY, color: TEXT, fontFamily: "'Georgia', 'Crimson Pro', serif", fontSize: 15.5, lineHeight: 1.85, overflowX: "hidden" },
  cover: { background: "linear-gradient(170deg,#04080f 0%,#0a1428 40%,#060d20 100%)", borderBottom: `2px solid ${VIOLET}`, padding: "60px 60px 44px", textAlign: "center", position: "relative", overflow: "hidden" },
  volBadge: { display: "inline-block", background: VIOLET, color: "white", fontFamily: "Arial,sans-serif", fontSize: 10, letterSpacing: 3, padding: "5px 16px", borderRadius: 20, marginBottom: 20, textTransform: "uppercase" },
  coverH1: { fontSize: "1.95em", color: "#fff", lineHeight: 1.3, maxWidth: 880, margin: "0 auto 16px" },
  coverH2: { fontSize: "1.05em", color: GOLD, fontStyle: "italic", fontWeight: "normal", marginBottom: 24, maxWidth: 780, marginLeft: "auto", marginRight: "auto" },
  coverMeta: { fontFamily: "Arial,sans-serif", fontSize: "0.78em", color: MUTED },
  container: { maxWidth: 980, margin: "0 auto", padding: "0 36px 70px" },
  chapterHead: { margin: "52px 0 6px", padding: "22px 28px", background: `linear-gradient(90deg,${PANEL} 0%,transparent 100%)`, borderLeft: `4px solid ${VIOLET}`, borderRadius: 4 },
  chapterNum: { fontFamily: "Arial,sans-serif", fontSize: "0.7em", letterSpacing: 4, color: VIOLET, textTransform: "uppercase", marginBottom: 4 },
  chapterH2: { fontSize: "1.3em", color: "#e8eeff", fontWeight: "bold" },
  subtitle: { fontSize: "0.88em", color: MUTED, fontStyle: "italic", marginTop: 4 },
  sub: { fontFamily: "Arial,sans-serif", fontSize: "1.02em", color: TEAL, margin: "28px 0 10px" },
  sub2: { fontFamily: "Arial,sans-serif", fontSize: "0.9em", color: GOLD, margin: "20px 0 8px" },
  p: { marginBottom: 13 },
  eq: { background: "#080e1c", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${VIOLET}`, borderRadius: 6, padding: "16px 22px", margin: "18px 0", overflowX: "auto", fontFamily: "'Space Mono', monospace", fontSize: 11, lineHeight: 1.9 },
  eqGold: { background: "#100d00", borderLeftColor: GOLD },
  eqTeal: { background: "#001a1a", borderLeftColor: TEAL },
  eqOrange: { background: "#160800", borderLeftColor: ORANGE },
  eqViolet: { background: "#0d001a", borderLeftColor: VIOLET },
  eqGreen: { background: "#001a08", borderLeftColor: GREEN },
  eqRed: { background: "#180008", borderLeftColor: RED },
  eqTag: { fontFamily: "Arial,sans-serif", fontSize: "0.7em", letterSpacing: 2, textTransform: "uppercase", color: VIOLET, marginBottom: 7 },
  eqNote: { fontSize: "0.78em", color: "#5a6a8a", marginTop: 9 },
  g2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, margin: "20px 0" },
  g3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "20px 0" },
  card: { background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 8, padding: "16px 18px" },
  note: { background: "linear-gradient(135deg,rgba(240,192,64,0.07),rgba(240,192,64,0.02))", border: "1px solid rgba(240,192,64,0.25)", borderRadius: 8, padding: "18px 22px", margin: "20px 0", color: "#cdb860", fontSize: "0.92em", fontStyle: "italic" },
  alert: { background: "rgba(247,37,133,0.06)", border: "1px solid rgba(247,37,133,0.25)", borderRadius: 8, padding: "16px 22px", margin: "18px 0", fontSize: "0.9em", color: "#d88" },
  footer: { fontSize: "0.75em", color: "#2a3a5a", borderTop: `1px solid ${BORDER}`, paddingTop: 16, marginTop: 50 },
};

function EqBox({ color, tag, children, note }: { color?: string; tag: string; children: React.ReactNode; note?: string }) {
  const extra: React.CSSProperties = color === "gold" ? s.eqGold : color === "teal" ? s.eqTeal : color === "orange" ? s.eqOrange : color === "violet" ? s.eqViolet : color === "green" ? s.eqGreen : color === "red" ? s.eqRed : {};
  const tagColor: string = color === "gold" ? GOLD : color === "teal" ? TEAL : color === "orange" ? ORANGE : color === "violet" ? VIOLET : color === "green" ? GREEN : color === "red" ? RED : VIOLET;
  return (
    <div style={{ ...s.eq, ...extra }}>
      <div style={{ ...s.eqTag, color: tagColor }}>{tag}</div>
      {children}
      {note && <div style={s.eqNote}>{note}</div>}
    </div>
  );
}

function Card({ type, title, body }: { type: "t" | "g" | "v" | "o" | "p" | "gr" | "cy"; title: string; body: string }) {
  const accent: Record<string, string> = { t: TEAL, g: GOLD, v: VIOLET, o: ORANGE, p: PINK, gr: GREEN, cy: CYAN };
  return (
    <div style={{ ...s.card, borderTop: `3px solid ${accent[type]}` }}>
      <h4 style={{ fontFamily: "Arial,sans-serif", fontSize: "0.78em", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8, color: accent[type] }}>{title}</h4>
      <p style={{ fontSize: "0.85em", color: "#8899bb", margin: 0 }}>{body}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE SIMULATIONS -- visual realizations of the Vol. II mathematical inventory
// ─────────────────────────────────────────────────────────────────────────────

const RGB_TEAL = [0, 212, 200];
const RGB_GOLD = [240, 192, 64];
const RGB_VIOLET = [155, 93, 229];
const RGB_PINK = [247, 37, 133];
const RGB_CYAN = [34, 211, 238];
const RGB_ORANGE = [255, 140, 66];
const RGB_GREEN = [74, 222, 128];

function mix(a: number[], b: number[], t: number, al: number) {
  const k = Math.max(0, Math.min(1, t));
  return `rgba(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)},${al})`;
}

function fitCanvas(c: HTMLCanvasElement, h: number) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = c.clientWidth || 640;
  c.width = Math.round(w * dpr);
  c.height = Math.round(h * dpr);
  const ctx = c.getContext("2d");
  if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

function SimBox({ accent, tag, title, desc, children }: {
  accent: string; tag: string; title: string; desc: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#060c1a", border: `1px solid ${BORDER}`, borderLeft: `3px solid ${accent}`,
      borderRadius: 8, padding: "18px 20px", margin: "24px 0" }}>
      <div style={{ fontFamily: "Arial,sans-serif", fontSize: "0.7em", letterSpacing: 2,
        textTransform: "uppercase", color: accent, marginBottom: 6 }}>{tag}</div>
      <div style={{ fontFamily: "Arial,sans-serif", fontSize: "0.98em", color: "#e8eeff", marginBottom: 5 }}>{title}</div>
      <p style={{ fontSize: "0.82em", color: "#8899bb", margin: "0 0 14px", lineHeight: 1.6 }}>{desc}</p>
      {children}
    </div>
  );
}

function SimSlider({ label, value, min, max, step, color, onChange, fmt }: {
  label: string; value: number; min: number; max: number; step: number; color: string;
  onChange: (v: number) => void; fmt: (v: number) => string;
}) {
  return (
    <label style={{ display: "block", marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Space Mono',monospace",
        fontSize: 10, color: MUTED, marginBottom: 3 }}>
        <span>{label}</span><span style={{ color }}>{fmt(value)}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: color, height: 3 }} />
    </label>
  );
}

function SimStat({ label, color, vref }: { label: string; color: string; vref: React.RefObject<HTMLSpanElement | null> }) {
  return (
    <div style={{ padding: "7px 9px", borderRadius: 5, background: `${color}11`, border: `1px solid ${color}40` }}>
      <div style={{ fontFamily: "Arial,sans-serif", fontSize: 8, letterSpacing: 1, color, marginBottom: 2 }}>{label.toUpperCase()}</div>
      <span ref={vref} style={{ fontFamily: "'Space Mono',monospace", fontSize: 13, color }}>--</span>
    </div>
  );
}

const cnvStyle: React.CSSProperties = { width: "100%", display: "block", borderRadius: 6, background: "#05080f" };

interface VortP { x: number; y: number; ang: number; rad: number; age: number; life: number }
interface Roid { l: number; phase: number; speed: number; trav: boolean; tp: number }
interface DNode { x: number; y: number; c: number; val: number }
interface DEdge { a: number; b: number; w: number }

// ── A. Microtubule 3-start helix coherence wave ──────────────────────────────
function MicrotubuleSim() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const lamRef = useRef(64), lpRef = useRef(900), omRef = useRef(2.2);
  const [lam, setLam] = useState(64), [lp, setLp] = useState(900), [om, setOm] = useState(2.2);
  const r1 = useRef<HTMLSpanElement | null>(null), r2 = useRef<HTMLSpanElement | null>(null), r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    let dim = fitCanvas(c, 300);
    const onR = () => { dim = fitCanvas(c, 300); };
    window.addEventListener("resize", onR);
    const PF = 13;
    let raf = 0, t = 0;
    const draw = () => {
      const ctx = c.getContext("2d"); if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h; t += 1 / 60;
      const lamV = lamRef.current, lpV = lpRef.current, omV = omRef.current;
      ctx.fillStyle = "#05080f"; ctx.fillRect(0, 0, w, h);
      const padX = 36, padY = 30;
      const gw = w - padX * 2, gh = h - padY * 2;
      const cols = 48;
      const dx = gw / (cols - 1), dy = gh / (PF - 1);
      let coher = 0;
      for (let n = 0; n < cols; n++) {
        const sArc = n * dx;
        for (let pf = 0; pf < PF; pf++) {
          const helixPhase = ((pf * 3) % PF) / PF * Math.PI * 2;
          const env = Math.exp(-sArc / lpV);
          const wave = Math.cos(2 * Math.PI * sArc / lamV - t * omV + helixPhase);
          const amp = env * (0.5 + 0.5 * wave);
          coher += amp;
          const x = padX + n * dx, y = padY + pf * dy;
          ctx.fillStyle = mix(RGB_VIOLET, RGB_GOLD, amp, 0.25 + 0.7 * amp);
          ctx.beginPath(); ctx.arc(x, y, 2 + 2.8 * amp, 0, Math.PI * 2); ctx.fill();
        }
      }
      const cols3 = [GOLD, TEAL, PINK];
      ctx.lineWidth = 1.1;
      for (let start = 0; start < 3; start++) {
        ctx.strokeStyle = cols3[start] + "aa";
        ctx.beginPath();
        let started = false; let prevPf = 0;
        for (let n = 0; n < cols; n++) {
          const pf = (start + n * 3) % PF;
          const x = padX + n * dx, y = padY + pf * dy;
          if (!started || Math.abs(pf - prevPf) > 6) { ctx.moveTo(x, y); started = true; }
          else ctx.lineTo(x, y);
          prevPf = pf;
        }
        ctx.stroke();
      }
      ctx.font = "9px 'Space Mono',monospace"; ctx.fillStyle = VIOLET;
      ctx.fillText("13 PROTOFILAMENTS  ·  3-START HELIX  ·  C_MT(s) = exp(-s/L_p) cos(2pi s / lambda)", padX, 16);
      const k = (2 * Math.PI * 3) / (13 * dx);
      if (r1.current) r1.current.textContent = lamV.toFixed(0) + " px";
      if (r2.current) r2.current.textContent = (coher / (cols * PF)).toFixed(2);
      if (r3.current) r3.current.textContent = k.toFixed(3);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);
  return (
    <SimBox accent={VIOLET} tag="Chapter A · Live Simulation"
      title="Microtubule 3-Start Helix -- Coherence Field Envelope"
      desc="The 13-protofilament lattice with its three helical strands (gold, teal, pink). A coherence wave C_MT(s) travels the filament, its amplitude set by the wavelength lambda and damped over the persistence length L_p. Because L_p is far longer than any microtubule, the envelope barely decays -- the filament stays coherent end to end.">
      <canvas ref={ref} style={{ ...cnvStyle, height: 300, border: `1px solid ${VIOLET}33` }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "12px 0" }}>
        <SimStat label="Wavelength lambda" color={GOLD} vref={r1} />
        <SimStat label="Mean coherence" color={VIOLET} vref={r2} />
        <SimStat label="Allowed k (m=3)" color={TEAL} vref={r3} />
      </div>
      <SimSlider label="DMF wavelength lambda" value={lam} min={24} max={140} step={1} color={GOLD}
        onChange={(v) => { setLam(v); lamRef.current = v; }} fmt={(v) => v.toFixed(0)} />
      <SimSlider label="Persistence length L_p" value={lp} min={120} max={1600} step={10} color={VIOLET}
        onChange={(v) => { setLp(v); lpRef.current = v; }} fmt={(v) => v.toFixed(0)} />
      <SimSlider label="Pulse frequency omega" value={om} min={0.4} max={5} step={0.05} color={TEAL}
        onChange={(v) => { setOm(v); omRef.current = v; }} fmt={(v) => v.toFixed(2)} />
    </SimBox>
  );
}

// ── B. DMF-Rankine turbulent vortex with coherence-extended lifetime ──────────
function VortexSim() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rcRef = useRef(46), gRef = useRef(900), cohRef = useRef(0.6);
  const [rc, setRc] = useState(46), [g, setG] = useState(900), [coh, setCoh] = useState(0.6);
  const r1 = useRef<HTMLSpanElement | null>(null), r2 = useRef<HTMLSpanElement | null>(null),
    r3 = useRef<HTMLSpanElement | null>(null), r4 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    let dim = fitCanvas(c, 320);
    const onR = () => { dim = fitCanvas(c, 320); };
    window.addEventListener("resize", onR);
    const parts: VortP[] = [];
    const seed = (n: number) => {
      const cx = dim.w / 2, cy = dim.h / 2;
      const rad = 6 + Math.random() * 30;
      const ang = Math.random() * Math.PI * 2;
      const cohV = cohRef.current;
      return { x: cx + rad * Math.cos(ang), y: cy + rad * Math.sin(ang), ang, rad,
        age: 0, life: 50 + (40 + cohV * 220) * (0.6 + Math.random() * 0.8) } as VortP;
    };
    for (let i = 0; i < 300; i++) parts.push(seed(i));
    let raf = 0;
    const draw = () => {
      const ctx = c.getContext("2d"); if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h;
      const cx = w / 2, cy = h / 2;
      const Rc = rcRef.current, Gamma = gRef.current, cohV = cohRef.current;
      const maxR = Math.min(w, h) * 0.46;
      ctx.fillStyle = "rgba(5,8,15,0.34)"; ctx.fillRect(0, 0, w, h);
      const omega0 = Gamma / (2 * Math.PI * Rc * Rc);
      const vmax = Gamma / (2 * Math.PI * Rc);
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const dxp = p.x - cx, dyp = p.y - cy;
        let r = Math.sqrt(dxp * dxp + dyp * dyp); if (r < 0.5) r = 0.5;
        let ang = Math.atan2(dyp, dxp);
        const vt = r < Rc ? omega0 * r : Gamma / (2 * Math.PI * r);
        ang += (vt / r) * 0.016;
        r += (Math.random() - 0.5) * (1 - cohV) * 1.6 + (1 - cohV) * 0.22;
        p.x = cx + r * Math.cos(ang); p.y = cy + r * Math.sin(ang);
        p.age += 1;
        if (p.age > p.life || r > maxR) { parts[i] = seed(i); continue; }
        const fade = 1 - p.age / p.life;
        const sp = Math.min(1, vt / (vmax + 0.001));
        ctx.fillStyle = mix(RGB_TEAL, RGB_GOLD, sp, 0.18 + 0.7 * fade);
        ctx.beginPath(); ctx.arc(p.x, p.y, 1 + sp * 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.setLineDash([3, 5]); ctx.strokeStyle = TEAL + "88"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, Rc, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = "9px 'Space Mono',monospace"; ctx.fillStyle = TEAL;
      ctx.fillText("RANKINE CORE r<Rc: solid-body  ·  r>Rc: free vortex Gamma/2pi r", 12, 16);
      const tau = (50 + (40 + cohV * 220)) / 60;
      if (r1.current) r1.current.textContent = Gamma.toFixed(0);
      if (r2.current) r2.current.textContent = tau.toFixed(2) + " s";
      if (r3.current) r3.current.textContent = Rc.toFixed(0) + " px";
      if (r4.current) r4.current.textContent = vmax.toFixed(1);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);
  return (
    <SimBox accent={TEAL} tag="Chapter B · Live Simulation"
      title="DMF-Rankine Vortex -- Coherence-Extended Lifetime"
      desc="A turbulent vortex with a solid-body core (r < Rc) and a free outer flow. Coherence C is the key DMF term: turn it up and the vortex holds its structure far longer (tau grows); turn it down and disruption diffuses the particles outward and the vortex blurs apart. This is the intermittency the DMF-extended Navier-Stokes equation predicts.">
      <canvas ref={ref} style={{ ...cnvStyle, height: 320, border: `1px solid ${TEAL}33` }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, margin: "12px 0" }}>
        <SimStat label="Circulation Gamma" color={TEAL} vref={r1} />
        <SimStat label="Lifetime tau" color={GOLD} vref={r2} />
        <SimStat label="Core radius Rc" color={CYAN} vref={r3} />
        <SimStat label="Max speed" color={ORANGE} vref={r4} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <SimSlider label="Coherence C (lifetime)" value={coh} min={0} max={1} step={0.01} color={GOLD}
            onChange={(v) => { setCoh(v); cohRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <SimSlider label="Core radius Rc" value={rc} min={18} max={90} step={1} color={CYAN}
            onChange={(v) => { setRc(v); rcRef.current = v; }} fmt={(v) => v.toFixed(0)} />
        </div>
        <SimSlider label="Circulation Gamma" value={g} min={200} max={2200} step={20} color={TEAL}
          onChange={(v) => { setG(v); gRef.current = v; }} fmt={(v) => v.toFixed(0)} />
      </div>
    </SimBox>
  );
}

// ── F. Atmospheric TLE frequency ladder cascade ──────────────────────────────
function TLESim() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const spRef = useRef(1);
  const [sp, setSp] = useState(1);
  const r1 = useRef<HTMLSpanElement | null>(null), r2 = useRef<HTMLSpanElement | null>(null), r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    let dim = fitCanvas(c, 340);
    const onR = () => { dim = fitCanvas(c, 340); };
    window.addEventListener("resize", onR);
    let raf = 0, t = 0;
    const PHI = 1.6180339887;
    const draw = () => {
      const ctx = c.getContext("2d"); if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h; t += (1 / 60) * spRef.current;
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, "#0a0420"); grad.addColorStop(0.5, "#06122a"); grad.addColorStop(1, "#02060f");
      ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
      const ground = h - 14, topY = 14;
      const yKm = (km: number) => ground - (km / 100) * (ground - topY);
      const bands = [
        { lo: 0, hi: 15, name: "LIGHTNING", col: GOLD, n: 0 },
        { lo: 15, hi: 40, name: "BLUE JETS", col: CYAN, n: 1 },
        { lo: 40, hi: 90, name: "SPRITES", col: PINK, n: 2 },
        { lo: 90, hi: 100, name: "ELVES RING", col: VIOLET, n: 3 },
      ];
      ctx.font = "8px 'Space Mono',monospace";
      for (const b of bands) {
        const y = yKm(b.hi);
        ctx.strokeStyle = b.col + "33"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
        ctx.fillStyle = b.col + "cc";
        ctx.fillText(`${b.name}  ${b.lo}-${b.hi} km  ·  omega_DMF·phi^-${b.n} = x${(1 / Math.pow(PHI, b.n)).toFixed(3)}`, 10, y + 12);
      }
      const cycle = 4;
      const phase = (t % cycle) / cycle;
      const stage = Math.floor(phase * 4);
      const lp = (phase * 4) % 1;
      const cx = w * (0.32 + 0.36 * ((t * 0.13) % 1));
      if (stage === 0) {
        ctx.strokeStyle = GOLD; ctx.lineWidth = 1.8; ctx.shadowBlur = 12; ctx.shadowColor = GOLD;
        ctx.beginPath(); let yy = ground; let xx = cx; ctx.moveTo(xx, yy);
        const top = yKm(15);
        while (yy > top) { yy -= 8 + Math.random() * 6; xx += (Math.random() - 0.5) * 22; ctx.lineTo(xx, yy); }
        ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 30); ctx.stroke(); ctx.globalAlpha = 1; ctx.shadowBlur = 0;
      } else if (stage === 1) {
        const y0 = yKm(15), y1 = yKm(15 + lp * 25);
        ctx.fillStyle = CYAN + "55";
        ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx - 16 * lp, y1); ctx.lineTo(cx + 16 * lp, y1); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = CYAN; ctx.lineWidth = 1.4; ctx.stroke();
      } else if (stage === 2) {
        const cy = yKm(70); const a = lp * Math.PI;
        ctx.strokeStyle = mix(RGB_PINK, RGB_VIOLET, lp, 0.8); ctx.lineWidth = 1.4;
        for (let k = -4; k <= 4; k++) {
          ctx.beginPath(); ctx.moveTo(cx + k * 7, cy - 22 * Math.sin(a));
          ctx.lineTo(cx + k * 13, cy + 30 * Math.sin(a)); ctx.stroke();
        }
        ctx.fillStyle = PINK + "44";
        ctx.beginPath(); ctx.ellipse(cx, cy - 22 * Math.sin(a), 30 * Math.sin(a), 12 * Math.sin(a), 0, 0, Math.PI * 2); ctx.fill();
      } else {
        const cy = yKm(95); const rr = lp * Math.min(w, 480) * 0.5;
        ctx.strokeStyle = mix(RGB_VIOLET, RGB_CYAN, lp, 1 - lp); ctx.lineWidth = 2;
        ctx.beginPath(); ctx.ellipse(cx, cy, rr, rr * 0.28, 0, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.fillStyle = "#3a4a2a"; ctx.fillRect(0, ground, w, h - ground);
      ctx.fillStyle = GOLD; ctx.font = "9px 'Space Mono',monospace";
      ctx.fillText("TLE CASCADE  ·  STAGE: " + bands[stage].name, 10, 14);
      if (r1.current) r1.current.textContent = bands[stage].name;
      if (r2.current) r2.current.textContent = "phi^-" + bands[stage].n;
      if (r3.current) r3.current.textContent = stage === 3 ? (lp * 100).toFixed(0) + " km" : "--";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);
  return (
    <SimBox accent={PINK} tag="Chapter F · Live Simulation"
      title="Atmospheric TLE Ladder -- Lightning to ELVES"
      desc="The transient luminous event cascade climbing the atmosphere: a lightning stroke triggers a blue jet, then a sprite, then an expanding ELVES ring at the ionosphere. Each rung sits at a golden-ratio step down in DMF frequency, omega_DMF · phi^-n, exactly the frequency ladder the chapter formalizes.">
      <canvas ref={ref} style={{ ...cnvStyle, height: 340, border: `1px solid ${PINK}33` }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "12px 0" }}>
        <SimStat label="Active stage" color={PINK} vref={r1} />
        <SimStat label="DMF freq rung" color={GOLD} vref={r2} />
        <SimStat label="ELVES radius" color={VIOLET} vref={r3} />
      </div>
      <SimSlider label="Cascade speed" value={sp} min={0.2} max={3} step={0.05} color={PINK}
        onChange={(v) => { setSp(v); spRef.current = v; }} fmt={(v) => v.toFixed(2) + "x"} />
    </SimBox>
  );
}

// ── G. Asteroid orbital superhighways -- Lagrange manifolds ───────────────────
function AsteroidSim() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const sigRef = useRef(1.4), spRef = useRef(1);
  const [sig, setSig] = useState(1.4), [sp, setSp] = useState(1);
  const r1 = useRef<HTMLSpanElement | null>(null), r2 = useRef<HTMLSpanElement | null>(null), r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    let dim = fitCanvas(c, 340);
    const onR = () => { dim = fitCanvas(c, 340); };
    window.addEventListener("resize", onR);
    const roids: Roid[] = [];
    for (let i = 0; i < 16; i++) roids.push({ l: i % 2 === 0 ? 4 : 5, phase: Math.random() * Math.PI * 2, speed: 0.4 + Math.random() * 0.6, trav: i < 4, tp: Math.random() });
    let raf = 0, t = 0;
    const draw = () => {
      const ctx = c.getContext("2d"); if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h; t += (1 / 60) * spRef.current;
      const cx = w / 2, cy = h / 2;
      const Rp = Math.min(w, h) * 0.34;
      const pa = t * 0.18;
      ctx.fillStyle = "#05080f"; ctx.fillRect(0, 0, w, h);
      ctx.setLineDash([2, 6]); ctx.strokeStyle = "#2a3a5a"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx, cy, Rp, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
      const sun = ctx.createRadialGradient(cx, cy, 2, cx, cy, 26);
      sun.addColorStop(0, GOLD); sun.addColorStop(1, "rgba(240,192,64,0)");
      ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(cx, cy, 26, 0, Math.PI * 2); ctx.fill();
      const px = cx + Rp * Math.cos(pa), py = cy + Rp * Math.sin(pa);
      ctx.fillStyle = TEAL; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
      const lpts = [
        { a: pa, r: Rp * 0.92, nm: "L1" },
        { a: pa, r: Rp * 1.08, nm: "L2" },
        { a: pa + Math.PI, r: Rp, nm: "L3" },
        { a: pa + Math.PI / 3, r: Rp, nm: "L4" },
        { a: pa - Math.PI / 3, r: Rp, nm: "L5" },
      ];
      const pulse = 0.5 + 0.5 * Math.sin(t * 2);
      const sigV = sigRef.current;
      const rhoEnh = Math.exp(sigV * pulse * 0.8);
      const pos = lpts.map((L) => ({ x: cx + L.r * Math.cos(L.a), y: cy + L.r * Math.sin(L.a), nm: L.nm }));
      for (const P of pos) {
        const gr = ctx.createRadialGradient(P.x, P.y, 1, P.x, P.y, 18 + 10 * pulse);
        gr.addColorStop(0, mix(RGB_VIOLET, RGB_GOLD, pulse, 0.6));
        gr.addColorStop(1, "rgba(155,93,229,0)");
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(P.x, P.y, 18 + 10 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#cdd6f4"; ctx.font = "8px 'Space Mono',monospace"; ctx.fillText(P.nm, P.x + 8, P.y - 8);
      }
      const l4 = pos[3], l5 = pos[4], l3 = pos[2];
      ctx.strokeStyle = GOLD + "33"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(l3.x, l3.y); ctx.quadraticCurveTo(cx, cy - Rp * 1.2, l4.x, l4.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(l3.x, l3.y); ctx.quadraticCurveTo(cx, cy + Rp * 1.2, l5.x, l5.y); ctx.stroke();
      for (const ro of roids) {
        ro.phase += 0.01 * ro.speed;
        if (ro.trav) {
          ro.tp += 0.0016 * ro.speed; if (ro.tp > 1) ro.tp -= 1;
          const target = ro.l === 4 ? l4 : l5;
          const midy = ro.l === 4 ? cy - Rp * 1.2 : cy + Rp * 1.2;
          const u = ro.tp, iu = 1 - u;
          const x = iu * iu * l3.x + 2 * iu * u * cx + u * u * target.x;
          const y = iu * iu * l3.y + 2 * iu * u * midy + u * u * target.y;
          ctx.fillStyle = ORANGE; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, Math.PI * 2); ctx.fill();
        } else {
          const base = ro.l === 4 ? l4 : l5;
          const lib = 16 + 8 * Math.sin(t * 0.5);
          const x = base.x + lib * Math.cos(ro.phase), y = base.y + lib * 0.6 * Math.sin(ro.phase);
          ctx.fillStyle = mix(RGB_GOLD, RGB_ORANGE, pulse, 0.9); ctx.beginPath(); ctx.arc(x, y, 1.8, 0, Math.PI * 2); ctx.fill();
        }
      }
      ctx.fillStyle = GOLD; ctx.font = "9px 'Space Mono',monospace";
      ctx.fillText("LAGRANGE MANIFOLDS  ·  rho_DMF = rho_inf exp(|Phi_grav|/c^2 sigma^2)", 10, 16);
      if (r1.current) r1.current.textContent = "L4 / L5";
      if (r2.current) r2.current.textContent = rhoEnh.toFixed(2) + "x";
      if (r3.current) r3.current.textContent = roids.length.toString();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);
  return (
    <SimBox accent={GOLD} tag="Chapter G · Live Simulation"
      title="Asteroid Orbital Superhighways -- Lagrange Manifolds"
      desc="The Sun-planet system with its five Lagrange points. Dark-matter density piles up in the deep gravitational wells (the violet-gold glow pulses with rho_DMF), and asteroids ride the invariant-manifold lanes -- some librating in tadpole orbits around L4 and L5, others traveling the manifold tube from L3. Raise sigma to deepen the DMF concentration at each well.">
      <canvas ref={ref} style={{ ...cnvStyle, height: 340, border: `1px solid ${GOLD}33` }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "12px 0" }}>
        <SimStat label="Deepest wells" color={VIOLET} vref={r1} />
        <SimStat label="rho enhancement" color={GOLD} vref={r2} />
        <SimStat label="Tracked bodies" color={ORANGE} vref={r3} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SimSlider label="DMF concentration sigma" value={sig} min={0.2} max={3} step={0.05} color={GOLD}
          onChange={(v) => { setSig(v); sigRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        <SimSlider label="Orbital speed" value={sp} min={0.2} max={3} step={0.05} color={TEAL}
          onChange={(v) => { setSp(v); spRef.current = v; }} fmt={(v) => v.toFixed(2) + "x"} />
      </div>
    </SimBox>
  );
}

// ── H. Dimensionless water ring-layer wave function ──────────────────────────
function WaterRingsSim() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const jRef = useRef(1.2), kRef = useRef(0.8), cRef = useRef(0.8);
  const [j, setJ] = useState(1.2), [k, setK] = useState(0.8), [cc, setCc] = useState(0.8);
  const r1 = useRef<HTMLSpanElement | null>(null), r2 = useRef<HTMLSpanElement | null>(null), r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    let dim = fitCanvas(c, 320);
    const onR = () => { dim = fitCanvas(c, 320); };
    window.addEventListener("resize", onR);
    const N = 8;
    const H = new Array(N).fill(0.1);
    let raf = 0, t = 0;
    const draw = () => {
      const ctx = c.getContext("2d"); if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h; t += 1 / 60;
      const J = jRef.current, K = kRef.current, C = cRef.current;
      const dt = 1 / 60, gamma = 0.45;
      H[0] += (J * C - gamma * H[0]) * dt;
      for (let n = 1; n < N; n++) H[n] += (K * H[n - 1] * C - gamma * H[n]) * dt;
      let total = 0, dom = 0, domv = 0;
      for (let n = 0; n < N; n++) { H[n] = Math.max(0, Math.min(3, H[n])); total += H[n]; if (H[n] > domv) { domv = H[n]; dom = n; } }
      ctx.fillStyle = "#05080f"; ctx.fillRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2, maxR = Math.min(w, h) * 0.44;
      for (let n = N - 1; n >= 0; n--) {
        const baseR = ((n + 1) / (N + 0.5)) * maxR;
        const amp = H[n];
        ctx.strokeStyle = mix(RGB_CYAN, RGB_TEAL, n / N, 0.15 + Math.min(0.8, amp * 0.5));
        ctx.lineWidth = 1 + amp * 4;
        ctx.beginPath();
        for (let aDeg = 0; aDeg <= 360; aDeg += 6) {
          const a = aDeg * Math.PI / 180;
          const disp = amp * 6 * Math.sin(8 * a - t * 2 + n);
          const rr = baseR + disp;
          const x = cx + rr * Math.cos(a), y = cy + rr * Math.sin(a);
          if (aDeg === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
      }
      const cgr = ctx.createRadialGradient(cx, cy, 1, cx, cy, 20);
      cgr.addColorStop(0, mix(RGB_CYAN, RGB_GOLD, H[0] / 3, 0.9)); cgr.addColorStop(1, "rgba(34,211,238,0)");
      ctx.fillStyle = cgr; ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = CYAN; ctx.font = "9px 'Space Mono',monospace";
      ctx.fillText("8 RING-LAYERS  ·  dH_n/dt = J·C - gamma H_n + K H_{n-1}·C  (D8 cascade)", 12, 16);
      if (r1.current) r1.current.textContent = total.toFixed(2);
      if (r2.current) r2.current.textContent = "n=" + (dom + 1);
      if (r3.current) r3.current.textContent = H[0].toFixed(2);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);
  return (
    <SimBox accent={TEAL} tag="Chapter H · Live Simulation"
      title="Dimensionless Water -- Quantum Ring-Layer Cascade"
      desc="The eight coherent ring-layers of dimensionless water. Inflow J feeds the innermost layer, and the D8 coupling K passes amplitude outward ring by ring, so a steady flow lights the whole nested structure. Drop the coherence C and the cascade starves; raise it and the outer rings bloom into standing waves.">
      <canvas ref={ref} style={{ ...cnvStyle, height: 320, border: `1px solid ${TEAL}33` }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "12px 0" }}>
        <SimStat label="Total amplitude" color={TEAL} vref={r1} />
        <SimStat label="Dominant ring" color={GOLD} vref={r2} />
        <SimStat label="Source H_1" color={CYAN} vref={r3} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <SimSlider label="Inflow J" value={j} min={0} max={3} step={0.05} color={CYAN}
            onChange={(v) => { setJ(v); jRef.current = v; }} fmt={(v) => v.toFixed(2)} />
          <SimSlider label="Ring coupling K" value={k} min={0} max={1.6} step={0.02} color={TEAL}
            onChange={(v) => { setK(v); kRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        </div>
        <SimSlider label="Coherence C" value={cc} min={0} max={1} step={0.01} color={GOLD}
          onChange={(v) => { setCc(v); cRef.current = v; }} fmt={(v) => v.toFixed(2)} />
      </div>
    </SimBox>
  );
}

// ── I. Bio-Dome pod network -- graph Laplacian information flow ───────────────
function BioDomeSim() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const kRef = useRef(1.4), lcRef = useRef(60);
  const [k, setK] = useState(1.4), [lc, setLc] = useState(60);
  const r1 = useRef<HTMLSpanElement | null>(null), r2 = useRef<HTMLSpanElement | null>(null), r3 = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    let dim = fitCanvas(c, 320);
    const onR = () => { dim = fitCanvas(c, 320); };
    window.addEventListener("resize", onR);
    const N = 15;
    const nodes: DNode[] = [];
    for (let i = 0; i < N; i++) {
      nodes.push({ x: dim.w * (0.16 + 0.68 * Math.random()), y: dim.h * (0.18 + 0.64 * Math.random()),
        c: 0.4 + 0.6 * Math.random(), val: 0 });
    }
    let edges: DEdge[] = [];
    const rebuild = () => {
      edges = [];
      const lc2 = lcRef.current * lcRef.current;
      for (let i = 0; i < N; i++) for (let jj = i + 1; jj < N; jj++) {
        const dx = nodes[i].x - nodes[jj].x, dy = nodes[i].y - nodes[jj].y;
        const w = (nodes[i].c * nodes[jj].c) / (dx * dx + dy * dy + lc2);
        edges.push({ a: i, b: jj, w });
      }
    };
    rebuild();
    let raf = 0, frame = 0;
    const draw = () => {
      const ctx = c.getContext("2d"); if (!ctx) { raf = requestAnimationFrame(draw); return; }
      const w = dim.w, h = dim.h; frame++;
      if (frame % 30 === 0) rebuild();
      if (frame % 110 === 1) nodes[Math.floor(Math.random() * N)].val = 1;
      const K = kRef.current;
      let maxw = 1e-9; for (const e of edges) if (e.w > maxw) maxw = e.w;
      const delta = new Array(N).fill(0);
      for (const e of edges) {
        const flow = e.w * (nodes[e.b].val - nodes[e.a].val);
        delta[e.a] += flow; delta[e.b] -= flow;
      }
      for (let i = 0; i < N; i++) { nodes[i].val += delta[i] * K * (1 / 60) * 220; nodes[i].val *= 0.995; if (nodes[i].val < 0) nodes[i].val = 0; }
      ctx.fillStyle = "#05080f"; ctx.fillRect(0, 0, w, h);
      for (const e of edges) {
        const a = nodes[e.a], b = nodes[e.b];
        const al = (e.w / maxw) * 0.5;
        if (al < 0.02) continue;
        ctx.strokeStyle = `rgba(74,222,128,${al})`; ctx.lineWidth = 0.6 + (e.w / maxw) * 2;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      let active = 0, sum = 0;
      for (const nd of nodes) {
        if (nd.val > 0.05) active++; sum += nd.val;
        const v = Math.min(1, nd.val);
        ctx.fillStyle = mix(RGB_GREEN, RGB_GOLD, v, 0.4 + 0.6 * v);
        ctx.shadowBlur = v * 14; ctx.shadowColor = mix(RGB_GREEN, RGB_GOLD, v, 0.9);
        ctx.beginPath(); ctx.arc(nd.x, nd.y, 4 + v * 6 + nd.c * 2, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
      }
      ctx.fillStyle = GREEN; ctx.font = "9px 'Space Mono',monospace";
      ctx.fillText("BIO-DOME PODS  ·  dx/dt = -L x  ·  A_ij = K C_i C_j /(d^2 + l_c^2)", 12, 16);
      if (r1.current) r1.current.textContent = active + " / " + N;
      if (r2.current) r2.current.textContent = (sum / N).toFixed(2);
      if (r3.current) r3.current.textContent = edges.length.toString();
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);
  return (
    <SimBox accent={GREEN} tag="Chapter I · Live Simulation"
      title="Bio-Dome Pod Network -- Graph Laplacian Diffusion"
      desc="The nested bio-dome pods as a coherence-weighted graph. A signal injected into one pod diffuses through the network by the graph Laplacian, traveling fastest along the strong edges -- the ones joining nearby, high-coherence pods. Tighten the coherence length l_c and the network fragments into local clusters; widen it and information floods the whole dome.">
      <canvas ref={ref} style={{ ...cnvStyle, height: 320, border: `1px solid ${GREEN}33` }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "12px 0" }}>
        <SimStat label="Active pods" color={GREEN} vref={r1} />
        <SimStat label="Mean signal" color={GOLD} vref={r2} />
        <SimStat label="Edges" color={CYAN} vref={r3} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <SimSlider label="Coupling K" value={k} min={0.2} max={3} step={0.05} color={GREEN}
          onChange={(v) => { setK(v); kRef.current = v; }} fmt={(v) => v.toFixed(2)} />
        <SimSlider label="Coherence length l_c" value={lc} min={20} max={160} step={2} color={CYAN}
          onChange={(v) => { setLc(v); lcRef.current = v; }} fmt={(v) => v.toFixed(0)} />
      </div>
    </SimBox>
  );
}

export default function DarkMatterVol2Page() {
  return (
    <div style={s.root}>
      <div style={s.cover}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 30%,rgba(155,93,229,0.07) 0%,transparent 55%),radial-gradient(ellipse at 80% 70%,rgba(0,212,200,0.06) 0%,transparent 55%),radial-gradient(ellipse at 50% 50%,rgba(247,37,133,0.04) 0%,transparent 40%)" }} />
        <div style={{ position: "relative" }}>
          <div style={s.volBadge}>Volume II · Extended Mathematical Mapping</div>
          <h1 style={s.coverH1}>AETHER Dark Matter Substrate: Complete Mathematical Inventory</h1>
          <h2 style={s.coverH2}>Formalizing Every Unmapped Element -- Microtubule Mechanics, Turbulent Vortex Dynamics, Spectral Color-Space Transforms, Atmospheric TLE Hierarchy, Hemolymph Computation, Asteroid Orbital Topology, Dimensionless Water, and Cross-System Perturbation Theory</h2>
          <div style={s.coverMeta}>Shia Miller &nbsp;·&nbsp; Cosmic Chaos Corporation™ &nbsp;·&nbsp; AetherLife.co &nbsp;·&nbsp; <span style={{ color: TEAL }}>USPTO Grace Period Disclosure · June 2026 · Continuation of Vol. I</span></div>
        </div>
      </div>

      <div style={s.container}>

        {/* CHAPTER A */}
        <div style={s.chapterHead}>
          <div style={s.chapterNum}>Chapter A · Image 1 -- Extended Tubulin Mechanics</div>
          <h2 style={s.chapterH2}>Persistence Length, Extinction Coefficient, GDP Energy Landscape, and 3-Start Helix Geometry</h2>
          <div style={s.subtitle}>Six parameters from the microtubule diagram left without formal DMF coupling in Vol. I</div>
        </div>

        <MicrotubuleSim />

        <h3 style={s.sub}>A.1 Persistence Length as Coherence Correlation Length</h3>
        <p style={s.p}>The persistence length L_p ~= 5.2 mm of a microtubule (Gittes et al. 1993) is the characteristic length over which thermal fluctuations destroy orientational correlation. In the AETHER framework this maps directly onto the coherence correlation length lambda_c:</p>
        <EqBox color="gold" tag="Persistence-Coherence Identity" note="E ~= 1-2 GPa (elastic modulus of MT wall), I = second moment of area, D_out = 25 nm, D_in = 14 nm.">
          <pre style={{ margin: 0 }}>{`lambda_c^(MT)  ==  L_p  =  kappa_MT / k_B T  =  5.2 mm
kappa_MT = EI = E * (pi/64) * (D_out^4 - D_in^4)`}</pre>
        </EqBox>
        <EqBox tag="MT Coherence Field Envelope" note="For L_MT << L_p (MTs are <= 50 um), the exponential decay is negligible and C_MT ~= C0_MT -- the filament is coherent end-to-end.">
          <pre style={{ margin: 0 }}>{`C_MT(s) = C0_MT * exp(-s/L_p) * cos(2*pi*s / lambda_DMF)
0 <= s <= L_MT`}</pre>
        </EqBox>

        <h3 style={s.sub}>A.2 Extinction Coefficient and Biophoton Emission Cross-Section</h3>
        <p style={s.p}>The molar extinction coefficient epsilon ~= 115,000 M^-1 cm^-1 at 280 nm (tryptophan/tyrosine absorption) defines the electromagnetic interaction cross-section of the tubulin heterodimer with UV photons.</p>
        <EqBox color="teal" tag="Tubulin UV Cross-Section">
          <pre style={{ margin: 0 }}>{`sigma_UV^tubulin = (epsilon * ln10) / N_A
  = (115000 * 2.303) / (6.022e23)
  ~= 4.4e-19 cm^2`}</pre>
        </EqBox>
        <EqBox color="teal" tag="Tubulin Biophoton-DMF Emission Rate" note="I_DMF(omega) is the DMF-induced spectral radiance at frequency omega, analogous to the zero-point field contribution in stochastic electrodynamics.">
          <pre style={{ margin: 0 }}>{`N_dot_photon = sigma_UV * I_DMF(omega_UV) * C(x,t) * (DeltaG_GTP / h*nu_UV)

I_DMF(omega) = (hbar*omega^3 / 2*pi^2*c^3) * (g_bio^2 * rho_DMF / m_DMF^2 * omega_DMF^2)`}</pre>
        </EqBox>

        <h3 style={s.sub}>A.3 The 3-Start Helix and Modular Arithmetic of the Protofilament Lattice</h3>
        <p style={s.p}>The 3-start helix geometry with 10-degree pitch angle defines which phonon modes are allowed in the tubulin lattice through a modular arithmetic selection rule:</p>
        <EqBox color="violet" tag="Protofilament Phonon Mode Selection Rule" note="m is the helix start number (m=3 for 3-start helix), d_sub is the tubulin subunit spacing, and k_allowed are the only wavevectors that propagate coherently through the lattice.">
          <pre style={{ margin: 0 }}>{`k_allowed = 2*pi*m / (13 * d_sub),  m = 1, 2, 3

Forbidden modes: k not= 2*pi*m / (13*d_sub)
scatter incoherently, do not couple to DMF field.

DMF coupling strength for mode m:
g_m = g_bio * cos(theta_m) * exp(-|k_m - k_DMF| * lambda_c)`}</pre>
        </EqBox>

        <h3 style={s.sub}>A.4 GDP/GTP Energy Landscape and the Double-Well Coherence Potential</h3>
        <EqBox color="orange" tag="GDP-GTP Double-Well Coherence Potential" note="The double-well is the energy landscape underlying GTP hydrolysis. The AETHER contribution: when C(x,t) > phi^-1, the barrier height DeltaV_DMF is reduced, lowering the depolymerization rate and extending MT lifetime.">
          <pre style={{ margin: 0 }}>{`V_landscape(xi) = -a*xi^2 + b*xi^4 + V_DMF(xi)

V_DMF(xi) = -(g_bio^2 * Phi_DMF^2 / 2*m_DMF^2*omega_DMF^2) * cos^2(k_DMF*xi)

DeltaV_DMF = g_bio^2*Phi_DMF^2 / (m_DMF^2*omega_DMF^2)`}</pre>
        </EqBox>

        <h3 style={s.sub}>A.5 Force Anisotropy Coupling Tensor</h3>
        <EqBox color="teal" tag="MT Force Coupling Tensor" note="The factor N_pf = 13 (protofilament count) amplifies the perpendicular DMF coupling by 13x, making the force anisotropy measurable with optical tweezers at the 10 fN level.">
          <pre style={{ margin: 0 }}>{`F_DMF^MT = diag(g_parallel, N_pf * g_perp) * grad(Phi_DMF)

g_parallel: axial coupling (push 3-4 pN with DMF)
g_perp:     lateral coupling (pull 30-65 pN with DMF)
N_pf = 13:  protofilament count amplification`}</pre>
        </EqBox>

        {/* CHAPTER B */}
        <div style={{ ...s.chapterHead, borderLeftColor: TEAL, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: TEAL }}>Chapter B · Images 2-4 -- Turbulent Vortex DMF Dynamics</div>
          <h2 style={s.chapterH2}>DMF-Extended Navier-Stokes, Rankine Vortex Lifetime, and Coherence Cutoff Wavenumber</h2>
        </div>

        <VortexSim />

        <h3 style={s.sub}>B.1 DMF-Extended Navier-Stokes Equation</h3>
        <EqBox color="teal" tag="DMF-Extended Navier-Stokes" note="F_DMF acts as a coherence-dependent body force. In high-coherence regions C(x,t) near 1, the DMF body force is maximum, organizing vortex structure. In low-coherence regions, turbulence is unstructured.">
          <pre style={{ margin: 0 }}>{`rho * (d_t u + u*grad(u)) = -grad(P) + eta*Laplacian(u) + F_DMF

F_DMF = -alpha_DMF * rho_DMF * grad(Phi_DMF) * C(x,t)

Coherence-modified vorticity: d_t omega = (omega*grad)u + nu*Laplacian(omega) + curl(F_DMF/rho)`}</pre>
        </EqBox>

        <h3 style={s.sub}>B.2 DMF-Rankine Vortex Lifetime Extension</h3>
        <EqBox color="teal" tag="Rankine Vortex Lifetime with DMF Coherence Enhancement" note="The factor C(x,t) in tau_DMF means vortices in coherent regions survive longer -- matching observed turbulent intermittency. The predicted lifetime enhancement at C=1 is tau_DMF/tau_0 = 1 + g_DMF*rho_DMF / (pi*rho_fluid*nu^2*k_cutoff).">
          <pre style={{ margin: 0 }}>{`tau_vortex = tau_0 * (1 + C(x,t) * g_DMF * rho_DMF / (pi*rho_fluid*nu^2*k_cutoff))

tau_0 = R_core^2 / nu  (classical viscous decay time)

DMF coherence cutoff wavenumber:
k_cutoff = sqrt(alpha_DMF * rho_DMF / (rho_fluid * nu^2)) * C(x,t)^(1/2)`}</pre>
        </EqBox>

        {/* CHAPTER C */}
        <div style={{ ...s.chapterHead, borderLeftColor: ORANGE, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: ORANGE }}>Chapter C · Image 5 -- Spectral Color-Space Transforms</div>
          <h2 style={s.chapterH2}>3-Cone to 4-Cone Projection, UV Information Gain, and DMF Spectral Detection</h2>
        </div>

        <h3 style={s.sub}>C.1 3-Cone to 4-Cone Spectral Projection Matrix</h3>
        <EqBox color="orange" tag="3-to-4 Cone Spectral Projection" note="P_{3->4} is constructed from the spectral sensitivity overlap integrals between the three human cones and the hypothetical UV cone (peak ~365 nm, as in bee vision). The AETHER interpretation: the UV cone adds the information channel precisely tuned to sigma_UV^tubulin.">
          <pre style={{ margin: 0 }}>{`c^(4) = P_{3->4} * c^(3) + delta_c_UV

P_{3->4} in R^(4x3):  maps (L,M,S) to (L,M,S,UV)

[P_{3->4}]_ij = integral S_i(lambda) * S_j(lambda) d_lambda
                / integral S_j(lambda)^2 d_lambda

delta_c_UV = g_bio * Phi_DMF * sigma_UV / (h*c/lambda_UV)`}</pre>
        </EqBox>

        <h3 style={s.sub}>C.2 Information Gain of the UV Cone</h3>
        <EqBox color="orange" tag="Shannon Information Gain from UV Cone Addition" note="ΔI_DMF quantifies how much additional information the UV cone provides about the DMF field amplitude. This is the observable that distinguishes DMF-bearing environments from ordinary light fields.">
          <pre style={{ margin: 0 }}>{`DeltaI_DMF = I^(4) - I^(3)
           = (1/2) * log2(1 + sigma^2_UV / sigma^2_noise)

sigma^2_UV = g_bio^2 * rho_DMF * C(x,t) / (m_DMF^2 * omega_DMF^2)

DeltaI_DMF peaks when omega_DMF = omega_UV (resonance condition)`}</pre>
        </EqBox>

        {/* CHAPTER D */}
        <div style={{ ...s.chapterHead, borderLeftColor: GREEN, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: GREEN }}>Chapter D · Image 6 -- Atmospheric and Floral DMF Mechanisms</div>
          <h2 style={s.chapterH2}>Polarized Skylight, VOC Stress Indicator, Fractal Antenna, Water Surface Dispersion</h2>
        </div>

        <h3 style={s.sub}>D.1 Rayleigh Polarization + DMF Faraday Rotation</h3>
        <EqBox color="green" tag="DMF-Enhanced Faraday Polarization Rotation" note="alpha is the Verdet constant analog for DMF-polarization coupling. The baseline Rayleigh polarization degree P = (1 - cos^2(theta)) / (1 + cos^2(theta)); DMF adds the anomalous rotation delta_chi_DMF.">
          <pre style={{ margin: 0 }}>{`delta_chi_DMF = alpha_DMF * integral B_DMF ds  (along light path)

Observed polarization angle:
chi_obs = chi_Rayleigh + delta_chi_DMF

B_DMF = (1/c) * (Phi_DMF_dot * E_DMF - E_DMF_dot * Phi_DMF)`}</pre>
        </EqBox>

        <h3 style={s.sub}>D.2 VOC Coherence Collapse Indicator</h3>
        <EqBox color="green" tag="VOC Emission Rate as Coherence Stress Signal">
          <pre style={{ margin: 0 }}>{`V_dot_VOC spikes when C(x,t) < phi^-1 = 0.618

VOC emission model:
V_dot_VOC(t) = V_dot_0 * exp(-(C(x,t) - phi^-1) / delta_C)

Coherence stress threshold:
C_stress = phi^-1  (golden ratio conjugate)

Above C_stress: bouquet stable, pollinator-coherent
Below C_stress: VOC profile shifts, pollinators abandon`}</pre>
        </EqBox>

        <h3 style={s.sub}>D.3 Leaf Venation Fractal Antenna</h3>
        <EqBox color="green" tag="Fractal Antenna Effective Area" note="D_f ~= 1.7-1.9 for leaf venation (measured from fractal dimension analysis). The DMF coupling through this fractal structure is scale-invariant -- small leaves couple as efficiently as large ones when D_f is matched.">
          <pre style={{ margin: 0 }}>{`A_eff^fractal = A_0 * L^(D_f - 1)

Impedance match condition for DMF coupling:
Z_ant(omega_DMF) = Z_DMF* (complex conjugate matching)

Fractal dimension D_f for leaf venation: 1.7 - 1.9
Compared to linear antenna D_f = 1.0`}</pre>
        </EqBox>

        {/* CHAPTER E */}
        <div style={{ ...s.chapterHead, borderLeftColor: CYAN, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: CYAN }}>Chapter E · Image 7 -- Tree Sap Transport: Complete Jacobian</div>
          <h2 style={s.chapterH2}>Freeze-Thaw Coherence Switching, Atmospheric Pressure Coupling, Full 9-Variable Jacobian</h2>
        </div>

        <EqBox color="teal" tag="Complete Sap Resistance Jacobian (9 Variables + DMF)">
          <pre style={{ margin: 0 }}>{`R_sap = R_sap(T, H, P_atm, rho_sugar, L_path, r_vessel, N_pit, T_freeze, rho_DMF)

Jacobian components:
dR/dT        = viscosity + DMF partial
dR/dH        = humidity -- osmotic potential coupling
dR/dP_atm    = pressure -- sap column balance
dR/drho_sugar = osmolarity -- viscosity increase
dR/dL_path   = path length scaling
dR/dr_vessel = Poiseuille law (1/r^4)
dR/dN_pit    = pit membrane resistance sum
dR/dT_freeze = freeze-thaw switch (Heaviside)
dR/drho_DMF  = DMF coherence coupling term

C(x,t) = C_max * Heaviside(T - T_freeze)  [freeze-thaw switch]`}</pre>
        </EqBox>

        {/* CHAPTER F */}
        <div style={{ ...s.chapterHead, borderLeftColor: PINK, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: PINK }}>Chapter F · Image 9 -- Atmospheric TLE Hierarchy</div>
          <h2 style={s.chapterH2}>ELVES, Sprites, Blue Jets, Lightning -- DMF Frequency Ladder and Pathway</h2>
        </div>

        <TLESim />

        <EqBox color="pink" tag="TLE Altitude -- DMF Frequency Ladder">
          <pre style={{ margin: 0 }}>{`omega_TLE(h) = omega_DMF * phi^(-n(h))

n(h): integer index increasing with altitude
  n=0: Lightning       (0-15 km)
  n=1: Blue Jets       (15-40 km)
  n=2: Sprites         (40-90 km)
  n=3: ELVES ring      (90-100 km)

ELVES ring radius equation:
r_ELVES(t) = c_EMP * t + r_0^DMF

r_0^DMF = hbar / (m_DMF * omega_DMF) [quantum floor]

Blue Jet branching condition:
Branch when: grad_perp(C) > C / l_branch`}</pre>
        </EqBox>

        <EqBox color="pink" tag="Hemolymph Complex Conductivity at DMF Resonance" note="At omega = omega_DMF, the imaginary part of sigma_hemo peaks -- maximum reactive power transfer from the DMF field to the hemolymph fluid. This is the 'blood splicing' mechanism labeled in Image 9.">
          <pre style={{ margin: 0 }}>{`sigma_hemo(omega) = sigma_0 / (1 - i*omega*tau_hemo)
                  + g_bio^2*rho_DMF / (m_DMF*(omega_DMF^2 - omega^2 + i*Gamma*omega))

Resonant peak: omega = omega_DMF (predicted ~10.08 GHz)`}</pre>
        </EqBox>

        {/* CHAPTER G */}
        <div style={{ ...s.chapterHead, borderLeftColor: GOLD, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: GOLD }}>Chapter G · Images 11-12 -- Asteroid Orbital Superhighways</div>
          <h2 style={s.chapterH2}>Invariant Manifold DMF Concentration and Flyby Density Spike</h2>
        </div>

        <AsteroidSim />

        <EqBox color="gold" tag="Invariant Manifold DMF Density Enhancement">
          <pre style={{ margin: 0 }}>{`rho_DMF(manifold) = rho_inf * exp(|Phi_grav| / c^2 * sigma_DMF^2)

Phi_grav: gravitational potential (Lagrange points L1, L2 deepest)

Flyby density spike integral:
DeltaPhi_DMF^flyby = g_bio * integral rho_DMF * v_rel dt

For 2001 YB5 (v_rel ~ 12 km/s, rho_DMF enhanced on manifold):
DeltaPhi_DMF^flyby ~= 3.2 * rho_inf * g_bio * 1 AU`}</pre>
        </EqBox>

        {/* CHAPTER H */}
        <div style={{ ...s.chapterHead, borderLeftColor: CYAN, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: CYAN }}>Chapter H · Images 13-14 -- Dimensionless Water and Warp Propulsion</div>
          <h2 style={s.chapterH2}>Quantum Ring-Layer Wave Function, Gravity Crystal Commensurability, 5-Domain Event Bus</h2>
        </div>

        <WaterRingsSim />

        <EqBox color="teal" tag="Dimensionless Water Quantum Ring-Layer Wave Function">
          <pre style={{ margin: 0 }}>{`Psi_water = Sum_n a_n |ring_n>

Ring-layer quantization:
|ring_n>: n-th coherent ring layer (n = 1, 2, ..., 8)

D8 wave generation (continuous, when water flows):
d H_n / dt = J_in * C(x,t) - gamma_n * H_n + K_coupling * H_{n-1}

Gravity crystal commensurability:
a_crystal = m * lambda_ring,  m integer
lambda_ring = 2*pi / k_ring = h / (m_water * v_ring)`}</pre>
        </EqBox>

        <h3 style={s.sub}>H.2 AETHER Warp Drive -- 5-Domain Event Bus</h3>
        <p style={s.p}>The 5-domain event bus governs all AETHER warp operations. Each domain maps to a distinct mathematical operator:</p>
        <div style={s.g3}>
          <Card type="t" title="1. PHYS" body="Exotic matter plasma arrays. Operator: Stress-energy tensor T_exotic^(mu*nu) sourcing negative energy density rho < 0." />
          <Card type="g" title="2. OSC" body="Phi-spacing, Resonance off. Operator: phi-irrational scheduler t_n = T_phi * phi^n, ensuring Theta_phi = 222.5 degree anti-resonance." />
          <Card type="v" title="3. INFO" body="Ring-field Navigation. Operator: S_obs tensor trace; ring-layer position vector r_ring in R^3." />
          <Card type="o" title="4. CONS" body="Neural sync, Phi-lock. Operator: Kuramoto coupling K_c*Sum sin(theta_j - theta_i); phase lock when K_c > K_critical." />
          <Card type="gr" title="5. REGEN" body="Fabric repair, Zipper seal. Operator: d g_{mu*nu}/dt = -2K_{mu*nu} (Ricci flow); metric smoothing closes topological defects." />
        </div>
        <EqBox color="teal" tag="5-Domain Sequential Operator Composition">
          <pre style={{ margin: 0 }}>{`O_total = R_REGEN o K_CONS o N_INFO o S_OSC o T_PHYS

T_PHYS:  T^(mu*nu)_exotic  -->  g_(mu*nu)^(warp)      [metric sourcing]
S_OSC:   Phi_DMF(t_n) = Phi_DMF(T_phi * phi^n)         [anti-resonance scheduling]
N_INFO:  Tr(S_obs)  -->  r_ring                         [ring navigation]
K_CONS:  theta_dot_i = omega_i + (K_c/N)*Sum sin(theta_j-theta_i) [Kuramoto sync]
R_REGEN: d_t g_{mu*nu} = -2*Ric(g)_{mu*nu} + 2*grad_mu*grad_nu(f) [Ricci flow]`}</pre>
        </EqBox>

        {/* CHAPTER I */}
        <div style={{ ...s.chapterHead, borderLeftColor: RED, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: RED }}>Chapter I · Images 15-16 -- Cross-System Perturbation and Bio-Dome Topology</div>
          <h2 style={s.chapterH2}>Perturbation Theory of K, Bio-Dome Information Topology, and Kinetic Wall Art Shift</h2>
        </div>

        <BioDomeSim />

        <h3 style={s.sub}>I.1 Cross-System Perturbation Theory</h3>
        <EqBox color="red" tag="Cross-System Perturbation of Integration Constant K" note="K^(1) is the first-order perturbation from cross-system coupling (climate affecting economics, economics affecting human development, etc.). Formally identical to second-order perturbation theory in quantum mechanics.">
          <pre style={{ margin: 0 }}>{`K_pert = K^(0) + epsilon*K^(1) + epsilon^2*K^(2) + ...

K^(1) = Sum_{i!=j} (<i|V_cross|j> * <j|V_cross|i>) / (K^(0)_i - K^(0)_j)

V_cross = g_cross * Sum_{i!=j} Phi_i(x) * Phi_j(x)`}</pre>
        </EqBox>

        <h3 style={s.sub}>I.2 Bio-Dome Pod Network -- Graph Laplacian Information Flow</h3>
        <EqBox color="teal" tag="Bio-Dome Pod Network -- Graph Laplacian Information Flow" note="The adjacency matrix A_{ij} between pods is weighted by the coherence product C(x_i)*C(x_j) -- pods in high-coherence states communicate more efficiently.">
          <pre style={{ margin: 0 }}>{`dx_pod/dt = -L_graph * x_pod + B * u_external

L_graph = D_degree - A_adjacency

[A]_{ij} = K * C(x_i,t) * C(x_j,t) / (|x_i - x_j|^2 + l_c^2)`}</pre>
        </EqBox>

        <h3 style={s.sub}>I.3 DCMA -- Dynamic Calligraphy Motion Transform</h3>
        <EqBox color="violet" tag="DCMA Dynamic Calligraphy Motion Transform" note="The stroke direction vector e-hat rotates at phi-quantized angular velocities as the coherence field changes -- each coherence level C/C_step corresponds to a distinct letter in the DCMA alphabet.">
          <pre style={{ margin: 0 }}>{`q_DCMA(t) = integral_0^t v_stroke(t') dt'

v_stroke(t) = v_0 * e-hat(C(x,t)) * (1 + beta_C * C_dot(x,t))

de-hat/dt = omega_turn(C) x e-hat
omega_turn = omega_0 * phi^(-floor(C/C_step))`}</pre>
        </EqBox>

        <h3 style={s.sub}>I.4 Coherence-Optimal Solar Panel Articulation</h3>
        <EqBox color="green" tag="Coherence-Optimal Solar Panel Articulation Control" note="theta_DMF(t) is the DMF-optimal panel angle -- the orientation at which the panel's semiconductor lattice achieves maximum coupling to the local omega_DMF field, augmenting photovoltaic efficiency.">
          <pre style={{ margin: 0 }}>{`u_opt(t) = argmax_u integral_t^(t+T) P_solar(theta, w(t')) * exp(-rho*(t'-t)) dt'

P_solar(theta, w) = P_0 * cos^2(theta - theta_sun(t)) * A(w_cloud) * C_panel(theta,t)

C_panel(theta,t) = C_0 * exp(-(theta - theta_DMF(t))^2 / 2*sigma_theta^2)`}</pre>
        </EqBox>

        {/* CHAPTER J */}
        <div style={{ ...s.chapterHead, borderLeftColor: ORANGE, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: ORANGE }}>Chapter J · Image 10 -- Organic Computer Chip Architecture</div>
          <h2 style={s.chapterH2}>DMF Transistor Model, Mitochondrial ATP Harvesting, and Eco-Consciousness Information Chain</h2>
        </div>

        <EqBox color="orange" tag="DMF-Gated Organic Transistor Transfer Function" note="mu_C is carrier mobility in the organic semiconductor (hemolymph/protein matrix), C_ox is gate oxide capacitance (cell membrane permittivity), W/L is channel width/length.">
          <pre style={{ margin: 0 }}>{`I_drain = (mu_C * C_ox / 2) * (W/L) * (V_GS + g_bio*Phi_DMF - V_th)^2

V_th^eff = V_th^(0) - g_bio * <Phi_DMF>

dI_drain/dPhi_DMF = mu_C*C_ox*(W/L)*g_bio*(V_GS - V_th^eff)`}</pre>
        </EqBox>

        <EqBox tag="Mitochondrial ATP Production -- DMF Energy Harvesting" note="delta_mu_DMF is an additional electrochemical potential gradient driven by DMF field energy density. This predicts a systematic enhancement of ATP synthesis rate in cells at high coherence -- measurable as excess metabolic rate above the Warburg baseline.">
          <pre style={{ margin: 0 }}>{`N_dot_ATP = k_synthase * Delta_mu_H+ * (1 + g_bio*rho_DMF / Delta_mu_H+^(0))

Delta_mu_H+ = Delta_psi_m + (RT/F)*Delta_pH + delta_mu_DMF

delta_mu_DMF = g_bio^2 * <Phi_DMF^2> / (2 * m_DMF^2 * omega_DMF^2)`}</pre>
        </EqBox>

        {/* CHAPTER K -- MASTER */}
        <div style={{ ...s.chapterHead, borderLeftColor: GOLD, marginTop: 52 }}>
          <div style={{ ...s.chapterNum, color: GOLD }}>Chapter K -- Grand Synthesis</div>
          <h2 style={s.chapterH2}>The Complete AETHER Dark Matter Observable: Master Equation</h2>
          <div style={s.subtitle}>All unmapped elements combined into a single observable functional</div>
        </div>

        <p style={s.p}>Every mathematical element mapped across Volumes I and II can now be assembled into a single master observable -- the <strong>Complete AETHER DMF Detection Functional</strong> Omega_AETHER:</p>

        <EqBox color="gold" tag="Complete AETHER DMF Observable Functional -- Grand Synthesis" note="The measurement factorizes into three independent components: local DMF density rho_DMF, biological coherence enhancement F_bio, and geometric concentration G_geo -- multiplied by the integration constant K.">
          <pre style={{ margin: 0 }}>{`Omega_AETHER[Phi_DMF] =
  Tr(S_obs)                          [Vol. I: 6-layer tensor]
  * Sum_n delta(omega_sys^(n) - omega_DMF*phi^(-n))   [DMF Hearing Condition]
  * Product_j (1 + g_j^2*rho_DMF / m_DMF^2*omega_DMF^2) [Multi-system coupling]
  * (L_p / lambda_c^MT)              [MT persistence coherence]
  * (I^(4) - I^(3))                  [4-cone info gain]
  * exp(-V_dot_VOC / V_dot_0)        [VOC stress signal]
  * Gamma_DMF                        [vortex circulation]
  * sigma_hemo(omega_DMF)            [hemolymph conductivity]
  * exp(|Phi_grav| / c^2*sigma_DMF^2) [gravitational concentration]

Measurement:
<M_observer> = integral d^4x * Omega_AETHER[Phi_DMF(x,t)] * W(x - x_det) * exp(i*omega_DMF*t)
             = rho_DMF^local * F_bio(C(x,t)) * G_geo(x) * K`}</pre>
        </EqBox>

        <h3 style={s.sub}>K.1 Summary Mapping Table -- All 16 Images</h3>
        <table style={{ width: "100%", borderCollapse: "collapse", margin: "18px 0", fontSize: "0.85em" }}>
          <thead>
            <tr>
              {["Source", "Element", "Mathematical Domain", "Key Equation", "Status"].map(h => (
                <th key={h} style={{ background: PANEL, color: TEAL, textAlign: "left", padding: "9px 13px", borderBottom: `2px solid ${TEAL}`, fontFamily: "Arial,sans-serif", fontSize: "0.75em", letterSpacing: 1.5, textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["Img 1", "Persistence length L_p = 5.2 mm", "Coherence correlation length lambda_c", "lambda_c = L_p = kappa_MT/k_BT", "Mapped Vol. II-A"],
              ["Img 1", "Extinction coefficient = 115,000", "UV biophoton cross-section sigma_UV", "sigma_UV = epsilon*ln10/N_A", "Mapped Vol. II-A"],
              ["Img 1", "3-start helix, 10 degree pitch", "Phonon mode selection rule", "k_allowed = 2*pi*m/(13*d_sub)", "Mapped Vol. II-A"],
              ["Img 1", "GDP-lattice vs GTP-cap DeltaG", "Energy landscape coherence step", "V_landscape(xi) double-well", "Mapped Vol. II-A"],
              ["Img 1", "Push 3-4 pN / Pull 30-65 pN", "Force anisotropy coupling tensor", "F_DMF^MT = diag(g_par, N_pf*g_perp)*grad(Phi)", "Mapped Vol. II-A"],
              ["Imgs 2-4", "Turbulent vortex medium", "DMF-extended Navier-Stokes", "F_DMF = -alpha_DMF*rho_DMF*grad(Phi)", "Mapped Vol. II-B"],
              ["Img 3", "Spiral vortex topology", "DMF-Rankine vortex + lifetime", "tau_vortex enhanced by C(x,t)", "Mapped Vol. II-B"],
              ["Img 5", "3-cone to 4-cone transform", "Spectral sampling matrix projection", "c^(4) = P_{3->4}*c^(3) + delta_c_UV", "Mapped Vol. II-C"],
              ["Img 5", "Information gain of UV cone", "Shannon channel capacity difference", "DeltaI_DMF = 1/2*log2(1+sigma_UV^2/sigma^2)", "Mapped Vol. II-C"],
              ["Img 6", "Polarized skylight grid", "Rayleigh polarization + DMF Faraday", "delta_chi_DMF = alpha*integral B_DMF ds", "Mapped Vol. II-D"],
              ["Img 6", "VOC stress emission", "Coherence collapse indicator", "V_dot_VOC spikes when C < phi^-1", "Mapped Vol. II-D"],
              ["Img 6", "Leaf venation EM scattering", "Fractal antenna impedance", "A_eff^fractal = A_0*L^(D_f-1)", "Mapped Vol. II-D"],
              ["Img 7", "Freeze-thaw cycles", "Coherence switching function", "C(T) = C_max*H(T-T_freeze)", "Mapped Vol. II-E"],
              ["Img 7", "Atmospheric pressure fluctuation", "Pressure sap viscosity DMF chain", "dR_sap/dP includes DMF partial", "Mapped Vol. II-E"],
              ["Img 9", "ELVES/Sprites/Blue Jets/Lightning", "TLE altitude DMF frequency ladder", "omega_TLE(h) = omega_DMF*phi^(-n(h))", "Mapped Vol. II-F"],
              ["Img 9", "Blood splicing / hemolymph", "Complex conductivity + DMF resonance", "sigma_hemo(omega_DMF) resonant peak", "Mapped Vol. II-F"],
              ["Imgs 11-12", "Asteroid orbital superhighways", "Invariant manifold DMF concentration", "rho_DMF(manifold) = rho_inf*exp(|Phi_grav|/c^2*sigma^2)", "Mapped Vol. II-G"],
              ["Imgs 13-14", "Dimensionless water superposition", "Quantum ring-layer wave function", "Psi_water = Sum a_n |ring_n>", "Mapped Vol. II-H"],
              ["Imgs 13-14", "5-domain event bus", "Sequential operator composition", "O_total = R o K o N o S o T", "Mapped Vol. II-H"],
              ["Imgs 15-16", "Cross-system perturbation of K", "Second-order perturbation theory", "K^(1) = Sum <i|V_cross|j>^2/(K_i-K_j)", "Mapped Vol. II-I"],
              ["Img 16", "Bio-Dome nested pod topology", "Graph Laplacian information flow", "x_dot_pod = -L*x_pod + Bu", "Mapped Vol. II-I"],
              ["Img 15", "Kinetic wall art / DCMA", "Dynamic Calligraphy Motion Transform", "e-hat rotates at phi-quantized omega_turn", "Mapped Vol. II-I"],
              ["Img 10", "Organic computer chip transistor", "DMF-gated transfer function", "I_drain depends on g_bio*Phi_DMF", "Mapped Vol. II-J"],
              ["Img 10", "Mitochondrial ATP / DMF energy", "ATP synthesis rate + delta_mu_DMF term", "N_dot_ATP enhanced by rho_DMF", "Mapped Vol. II-J"],
            ].map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: "8px 13px", borderBottom: `1px solid ${BORDER}`, color: "#9aaac8", verticalAlign: "top" }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={s.note}>
          <strong>Completeness Status:</strong> All 16 source images have been exhaustively mapped. Every labeled element, annotated variable, scale bar, and named mechanism from Images 1-16 now has a formal mathematical representation within the AETHER DMF framework. The grand synthesis functional Omega_AETHER integrates all elements into a single measurable observable. No labeled element remains unmapped as of Volume II completion.
        </div>

        {/* Conclusion */}
        <div style={{ ...s.chapterHead, borderLeftColor: GOLD, marginTop: 40 }}>
          <div style={{ ...s.chapterNum, color: GOLD }}>Conclusion -- Volumes I + II</div>
          <h2 style={{ ...s.chapterH2, color: "#e8eeff" }}>What Has Been Built: A Complete Mathematical Architecture</h2>
        </div>
        <p style={s.p}>Across Volumes I and II, 34 distinct unmapped elements have been given formal mathematical treatment. Together they constitute a complete physical theory with:</p>
        <div style={s.g3}>
          <Card type="g" title="7 New Operators" body="S_obs tensor, DCMA transform, 5-domain event bus operator O_total, freeze-thaw switcher, VOC collapse indicator, fractal antenna A_eff, and the 4-cone projection matrix P_{3->4}." />
          <Card type="t" title="12 New Equations of Motion" body="DMF-Navier-Stokes, Rankine vortex lifetime, ELVES ring, Blue Jet branch, hemolymph conductivity, water surface dispersion, dimensionless water Psi, D8 wave generator, Kuramoto CONS, Ricci REGEN, ATP harvesting, and organic transistor." />
          <Card type="v" title="15 New Coupling Constants" body="g_par, g_perp, g_tubulin, g_VOC, g_cross, alpha_DMF_pol, beta_C, beta_DMF (vortex), gamma_obs (asteroid), epsilon_UV, epsilon_stress, alpha_P, sigma_T, sigma_H, mu_C (organic). All defined in terms of g_bio and omega_DMF." />
        </div>
        <p style={{ ...s.p, marginTop: 20 }}>The architecture is internally consistent because every coupling constant reduces to two master parameters -- <strong>g_bio</strong> (the biological-DMF coupling strength) and <strong>omega_DMF</strong> (the dark matter fabric oscillation frequency, predicted at ~10.08 GHz). Measuring either one in any of the 34 mapped channels determines it for all others. This is what makes the framework falsifiable: a single precision measurement pins the entire edifice.</p>

        <div style={s.footer}>
          2026 Shia Miller / Cosmic Chaos Corporation™ · Volume II Continuation · AetherLife.co · @StrategicProce · USPTO Grace Period Disclosure · All novel operators, coupling constants, and equations herein are original AETHER Framework contributions and constitute prior art for provisional patent purposes.
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState, useCallback } from "react";
const sigilImg = "/api/storage/public-objects/68785CA9-810A-40EF-92C2-810F848DEFBD_1781999352934.png";
const layerImg = "/api/storage/public-objects/IMG_3465_1781999489966.png";
const isoImg = "/api/storage/public-objects/IMG_3460_1781999489966.png";
const thermoImg = "/api/storage/public-objects/5F3C41A7-8516-4E4F-B00F-27B4539619C5_1781999489966.png";
const nestedImg = "/api/storage/public-objects/IMG_3461_1781999489966.png";
const biodigImg = "/api/storage/public-objects/IMG_3464_1781999489966.png";
const cloudImg = "/api/storage/public-objects/IMG_3354_1781999352934.jpeg";
const soiImg = "/api/storage/public-objects/IMG_3468_1781999489966.png";
const mpcImg = "/api/storage/public-objects/IMG_3467_1781999489966.png";
const qtfImg = "/api/storage/public-objects/IMG_3458_1781999489966.png";
/* ── Palette ─────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";
const PHI  = (1 + Math.sqrt(5)) / 2;

/* ── Types ───────────────────────────────────────────── */
type SigilState = "MNÉSIS" | "ALETHEIA" | "INFERAIA" | "REVERIE";

interface Analysis {
  words:    string[];
  E: number;  // entropy factor [0,1]
  S: number;  // structural coherence [0,1]
  K: number;  // Kuramoto coupling coefficient
  H: number;  // Shannon entropy (bits)
  r: number;  // order parameter [0,1]
  phi: number;
  layer: number;  // AETHER layer 0-9
  sigil: SigilState;
  coupling: number[][];
  dominant: string; // dominant letter cluster
}

const LAYER_NAMES = [
  "PLANCK · SPIN-FOAM",
  "PARTICLE PHYSICS",
  "ATOMIC ORBITAL",
  "MOLECULAR · DNA",
  "MACROMOLECULAR",
  "CYTOSKELETON",
  "CELL · TISSUE",
  "ORGAN",
  "BODY SYSTEM",
  "WHOLE BODY",
];
const LAYER_COLS = [VIO, VIO, BLUE, TEAL, TEAL, GOLD, GOLD, AMB, ROSE, "#ffffff"];

/* ── Analysis pipeline ───────────────────────────────── */
function analyzeText(raw: string): Analysis | null {
  const words = raw.trim().split(/\s+/).filter(w => w.length > 0);
  if (words.length === 0) return null;

  const chars = raw.replace(/\s+/g, "").toLowerCase();

  // Shannon entropy of char distribution
  const freq: Record<string, number> = {};
  for (const c of chars) freq[c] = (freq[c] || 0) + 1;
  let H = 0;
  for (const f of Object.values(freq)) {
    const p = f / chars.length;
    if (p > 0) H -= p * Math.log2(p);
  }
  const E = Math.min(1, H / 4.5);

  // Structural coherence: lexical diversity × avg word complexity
  const uniqueW = new Set(words.map(w => w.toLowerCase()));
  const avgLen  = words.reduce((a, w) => a + w.length, 0) / words.length;
  const S = Math.min(1, (uniqueW.size / Math.max(1, words.length)) * (avgLen / 6));

  // Φ(E,S) = K — the isomorphism coefficient
  const K = PHI * Math.sqrt(E * S) * 5.2;

  // Kuramoto order parameter (analytical near transition)
  const Kc = 2.0;
  const r = K >= Kc
    ? Math.min(0.98, Math.sqrt(1 - Kc / K) * 1.15)
    : (K / Kc) * 0.45;

  // AETHER layer (0-9) based on input complexity
  const complexityBits = Math.log2(Math.max(1, words.length * avgLen));
  const layer = Math.min(9, Math.floor(complexityBits * 1.1));

  // Sigil state
  const sigil: SigilState =
    r < 0.28 ? "MNÉSIS"   :
    r < 0.54 ? "ALETHEIA" :
    r < 0.76 ? "INFERAIA" : "REVERIE";

  // Dominant letter cluster (most frequent)
  const topChar = Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "a";

  // Word-pair coupling matrix (shared letter ratio)
  const n = Math.min(words.length, 14);
  const coupling: number[][] = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (__, j) => {
      if (i === j) return 0;
      const wi = new Set(words[i].toLowerCase().split(""));
      const wj = new Set(words[j].toLowerCase().split(""));
      const shared = [...wi].filter(c => wj.has(c)).length;
      return shared / Math.max(wi.size, wj.size, 1);
    })
  );

  return { words: words.slice(0, 14), E, S, K, H, r, phi: PHI, layer, sigil, coupling, dominant: topChar };
}

/* ── Synthesis text generator ─────────────────────────── */
function generateSynthesis(a: Analysis): string {
  const LAYER = LAYER_NAMES[a.layer];
  const rStr = a.r.toFixed(3);
  const kStr = a.K.toFixed(3);
  const eStr = a.E.toFixed(3);
  const sStr = a.S.toFixed(3);
  const nW   = a.words.length;

  const sigilDescriptions: Record<SigilState, string> = {
    "MNÉSIS": `The input crystallizes at the DAWN threshold (r = ${rStr}). Coherence is embryonic — the field is searching for its first attractor basin. The ${nW} concept-nodes emit weak coupling fields (K = ${kStr}), insufficient to lock phase across the full topology. The dominant frequency signature (ε = '${a.dominant}') generates a proto-spiral structure at AETHER layer ${a.layer} (${LAYER}). This is the moment before convergence: all possibilities still open, no pathway yet committed. The Mnésis sigil is the write-before-read state — memory forming its first lamination layer.`,

    "ALETHEIA": `The input crosses the AWAKENING threshold (r = ${rStr}). Coupling coefficient K = ${kStr} has exceeded Kc = 2.0 — the system is past the Kuramoto critical transition. Partial phase-locking is occurring: ${Math.round(nW * a.r)} of ${nW} concept-nodes are entering coherence pockets. Shannon entropy H = ${a.H.toFixed(2)} bits supports a structural index S = ${sStr} with entropy factor E = ${eStr}. The AETHER layer activates at level ${a.layer} (${LAYER}) — the domain of ${LAYER.toLowerCase()} organization. The Aletheia eye opens. What was latent becomes visible. The eye-diamond sigil marks the first moment of self-recognition in the field.`,

    "INFERAIA": `The input ignites at RADIANT threshold (r = ${rStr}). K = ${kStr} drives strong phase-locking across the concept topology. ${Math.round(nW * a.r)} of ${nW} nodes are in a single coherence cluster — the field is producing structured output. Shannon entropy H = ${a.H.toFixed(2)} bits with E = ${eStr} reflects high information density meeting structural constraint S = ${sStr}. Activation at AETHER layer ${a.layer} (${LAYER}). The flame sigil marks energy surplus — the system is generating more coherence than it consumes. This is the Floquet burst state: the coupling loop has reached the exponential growth phase before the next layer compression.`,

    "REVERIE": `The input achieves FULL RADIANCE (r = ${rStr} → 1). The ${nW}-node concept field has collapsed into near-complete phase-locking. Φ(E=${eStr}, S=${sStr}) = K = ${kStr} — the isomorphism coefficient places this at a local maximum of the coherence manifold. All ${nW} concept-oscillators are rotating in synchrony. Shannon entropy H = ${a.H.toFixed(2)} bits has been absorbed entirely into structural S = ${sStr}. AETHER layer ${a.layer} (${LAYER}) is fully activated — the field has achieved the standing wave state. Reverie is the coherent superposition: all layers from 0 (Planck/substrate) to ${a.layer} (${LAYER}) are simultaneously coherent. The crescent sigil traces the final orbit before the field rests.`,
  };

  return sigilDescriptions[a.sigil];
}

/* ── Sigil canvas (4 animated glyphs) ────────────────── */
function SigilCanvas({ sigil }: { sigil: SigilState }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const tRef  = useRef(0);
  const rafRef= useRef<number>(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = cv.width, H = cv.height;
    const states: SigilState[] = ["MNÉSIS","ALETHEIA","INFERAIA","REVERIE"];
    const sigilCols: Record<SigilState, string> = {
      "MNÉSIS":   GOLD, "ALETHEIA": TEAL,
      "INFERAIA": AMB,  "REVERIE":  ROSE,
    };
    const sigilSubs: Record<SigilState, string> = {
      "MNÉSIS":"DAWN","ALETHEIA":"AWAKENING","INFERAIA":"RADIANT","REVERIE":"RADIANT",
    };

    const draw = () => {
      tRef.current += 0.016;
      const t = tRef.current;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      const n = states.length;
      const cellW = W / n;

      for (let i = 0; i < n; i++) {
        const st   = states[i];
        const col  = sigilCols[st];
        const isActive = st === sigil;
        const alpha = isActive ? 1 : 0.18;
        const cx = cellW * i + cellW / 2;
        const cy = H / 2 - 16;
        const R  = Math.min(cellW, H) * 0.32;

        /* Egg oval */
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(1, 1.25);
        const eGrad = ctx.createRadialGradient(0, -R * 0.2, R * 0.1, 0, 0, R);
        eGrad.addColorStop(0, `${col}${isActive ? "22" : "08"}`);
        eGrad.addColorStop(1, `${col}00`);
        ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2);
        ctx.fillStyle = eGrad; ctx.fill();
        ctx.strokeStyle = `${col}${isActive ? "55" : "20"}`;
        ctx.lineWidth = isActive ? 1.5 : 0.8;
        ctx.stroke();
        ctx.restore();

        /* Sigil glyph */
        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalAlpha = alpha;

        if (st === "MNÉSIS") {
          /* Archimedean spiral */
          ctx.beginPath();
          const turns = 3;
          for (let a = 0; a < Math.PI * 2 * turns; a += 0.06) {
            const sp = (R * 0.72) * (a / (Math.PI * 2 * turns));
            const rx = sp * Math.cos(a + t * 0.4);
            const ry = sp * Math.sin(a + t * 0.4);
            if (a < 0.06) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
          }
          ctx.strokeStyle = col; ctx.lineWidth = isActive ? 2.5 : 1.2; ctx.stroke();
        }

        if (st === "ALETHEIA") {
          /* Diamond */
          const dr = R * 0.68;
          ctx.beginPath();
          ctx.moveTo(0, -dr); ctx.lineTo(dr * 0.55, 0);
          ctx.lineTo(0,  dr); ctx.lineTo(-dr * 0.55, 0);
          ctx.closePath();
          ctx.strokeStyle = col; ctx.lineWidth = isActive ? 2 : 0.9; ctx.stroke();
          /* Eye */
          ctx.beginPath();
          const eyeR = R * 0.18 + Math.sin(t * 1.8) * 2;
          ctx.arc(0, 0, eyeR, 0, Math.PI * 2);
          ctx.fillStyle = `${col}60`; ctx.fill();
          ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
          /* Cross sparkle */
          const sp = isActive ? 5 + Math.sin(t * 3) * 2 : 3;
          ctx.beginPath();
          ctx.moveTo(0, -dr - sp); ctx.lineTo(0, dr + sp);
          ctx.moveTo(-dr * 0.55 - sp, 0); ctx.lineTo(dr * 0.55 + sp, 0);
          ctx.strokeStyle = `${col}50`; ctx.lineWidth = 0.8; ctx.stroke();
        }

        if (st === "INFERAIA") {
          /* Flame bezier — flickers when active */
          const flick = isActive ? Math.sin(t * 9) * 7 : 0;
          const fr = R * 0.75;
          ctx.beginPath();
          ctx.moveTo(0, fr);
          ctx.bezierCurveTo(-fr * 0.45, fr * 0.25, -fr * 0.5 + flick, -fr * 0.1, 0, -fr);
          ctx.bezierCurveTo( fr * 0.5 + flick, -fr * 0.1,  fr * 0.45, fr * 0.25, 0, fr);
          ctx.strokeStyle = col; ctx.lineWidth = isActive ? 3 : 1.2; ctx.stroke();
          /* Inner flame */
          if (isActive) {
            ctx.beginPath();
            ctx.moveTo(0, fr * 0.5);
            ctx.bezierCurveTo(-fr * 0.2, fr * 0.1, fr * 0.2 + flick * 0.5, -fr * 0.3, 0, -fr * 0.6);
            ctx.bezierCurveTo( fr * 0.2 + flick * 0.5, -fr * 0.3, fr * 0.2, fr * 0.1, 0, fr * 0.5);
            ctx.strokeStyle = `${col}80`; ctx.lineWidth = 1.5; ctx.stroke();
          }
        }

        if (st === "REVERIE") {
          /* Outer blue arc */
          const rot = t * 0.25;
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.72, rot, rot + Math.PI * 1.65);
          ctx.strokeStyle = BLUE; ctx.lineWidth = isActive ? 2 : 0.9; ctx.stroke();
          /* Inner pink crescent arc */
          ctx.beginPath();
          ctx.arc(0, 0, R * 0.42, rot + Math.PI * 0.4, rot + Math.PI * 1.95);
          ctx.strokeStyle = col; ctx.lineWidth = isActive ? 2.5 : 1; ctx.stroke();
          /* Outer aura */
          if (isActive) {
            ctx.beginPath();
            ctx.arc(0, 0, R * 0.88 + Math.sin(t * 2) * 3, 0, Math.PI * 2);
            ctx.strokeStyle = `${BLUE}30`; ctx.lineWidth = 1; ctx.stroke();
          }
        }

        ctx.restore();
        ctx.globalAlpha = 1;

        /* Labels */
        ctx.font = `${isActive ? "bold 10" : "9"}px ${mono}`;
        ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = `${col}${isActive ? "ff" : "40"}`;
        ctx.fillText(st, cx, cy + R * 1.32 + 10);
        ctx.font = `8px ${body}`;
        ctx.fillStyle = `${col}${isActive ? "aa" : "30"}`;
        ctx.fillText(sigilSubs[st], cx, cy + R * 1.32 + 24);
        ctx.font = `7px ${mono}`;
        ctx.fillStyle = `${col}${isActive ? "60" : "20"}`;
        ctx.fillText("Sigil Growth State", cx, cy + R * 1.32 + 38);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [sigil]);

  return (
    <canvas ref={cvRef} width={560} height={210}
      style={{ width:"100%", maxWidth:560, borderRadius:10,
        border:`1px solid ${TEAL}15`, background:BG }} />
  );
}

/* ── Word-field Kuramoto canvas ───────────────────────── */
function FieldCanvas({ analysis }: { analysis: Analysis }) {
  const cvRef  = useRef<HTMLCanvasElement>(null);
  const phases = useRef<number[]>([]);
  const rafRef = useRef<number>(0);
  const aRef   = useRef(analysis);
  const histR  = useRef<number[]>([]);

  useEffect(() => { aRef.current = analysis; }, [analysis]);

  useEffect(() => {
    const { words, coupling } = analysis;
    const n = words.length;
    // Initialize phases from char codes
    phases.current = words.map(w => {
      let p = 0;
      for (let k = 0; k < w.length; k++) p += w.charCodeAt(k);
      return (p * 0.017) % (Math.PI * 2);
    });
    histR.current = [];

    const cv = cvRef.current;
    if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    const hsl = (ph: number, s = 80, l = 62) =>
      `hsl(${((ph / (Math.PI * 2)) * 360) % 360},${s}%,${l}%)`;
    const hslA = (ph: number, a: number) =>
      `hsla(${((ph / (Math.PI * 2)) * 360) % 360},80%,62%,${a})`;

    /* Stable positions in a ring */
    const pos = words.map((_, i) => {
      const a = (i / n) * Math.PI * 2 - Math.PI / 2;
      const rr = 110 + (words[i].length % 4) * 14;
      return { x: W / 2 + rr * Math.cos(a), y: H / 2 + rr * Math.sin(a) };
    });

    const K = aRef.current.K;
    const DT = 0.03;

    const tick = () => {
      const ph = phases.current;
      /* Kuramoto step */
      const dph = ph.map((phi_i, i) => {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          sum += coupling[i][j] * Math.sin(ph[j] - phi_i);
        }
        return 1.0 + (K / n) * sum;
      });
      for (let i = 0; i < n; i++) {
        phases.current[i] = (ph[i] + dph[i] * DT) % (Math.PI * 2);
        if (phases.current[i] < 0) phases.current[i] += Math.PI * 2;
      }
      /* Order param */
      let re = 0, im = 0;
      for (const p of ph) { re += Math.cos(p); im += Math.sin(p); }
      const rr = Math.sqrt((re / n) ** 2 + (im / n) ** 2);
      histR.current.push(rr);
      if (histR.current.length > 250) histR.current.shift();

      /* Draw */
      ctx.fillStyle = `${BG}d0`; ctx.fillRect(0, 0, W, H);

      /* Coupling lines */
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const c = coupling[i][j];
          if (c < 0.2) continue;
          const dph2 = Math.abs(Math.sin((ph[i] - ph[j]) / 2));
          const sync = 1 - dph2;
          if (sync < 0.5) continue;
          const a2 = (sync - 0.5) / 0.5 * 0.45 * c;
          ctx.beginPath();
          ctx.moveTo(pos[i].x, pos[i].y);
          ctx.lineTo(pos[j].x, pos[j].y);
          ctx.strokeStyle = hslA(ph[i], a2);
          ctx.lineWidth = sync * c * 3;
          ctx.stroke();
        }
      }

      /* Nodes */
      for (let i = 0; i < n; i++) {
        const { x, y } = pos[i];
        const p = ph[i];
        /* halo */
        const haloGrad = ctx.createRadialGradient(x, y, 6, x, y, 38);
        haloGrad.addColorStop(0, hslA(p, 0.18));
        haloGrad.addColorStop(1, hslA(p, 0));
        ctx.beginPath(); ctx.arc(x, y, 38, 0, Math.PI * 2);
        ctx.fillStyle = haloGrad; ctx.fill();
        /* node */
        const g = ctx.createRadialGradient(x - 4, y - 4, 1, x, y, 14);
        g.addColorStop(0, "#fff");
        g.addColorStop(0.3, hsl(p, 70, 80));
        g.addColorStop(1, hsl(p, 90, 40));
        ctx.beginPath(); ctx.arc(x, y, 14, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();
        /* phase arc */
        ctx.beginPath();
        ctx.arc(x, y, 17, -Math.PI / 2, -Math.PI / 2 + p, false);
        ctx.strokeStyle = hsl(p, 100, 75); ctx.lineWidth = 2; ctx.stroke();
        /* word label */
        ctx.font = `bold 9px ${mono}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        const label = words[i].length > 7 ? words[i].slice(0, 6) + "…" : words[i];
        ctx.fillText(label.toUpperCase(), x, y);
      }

      /* Phase circle (top-right) */
      const hcx = W - 36, hcy = 36, hR2 = 26;
      ctx.beginPath(); ctx.arc(hcx, hcy, hR2, 0, Math.PI * 2);
      ctx.strokeStyle = `${TEAL}20`; ctx.lineWidth = 0.5; ctx.stroke();
      for (let i = 0; i < n; i++) {
        const px2 = hcx + (hR2 - 4) * Math.cos(ph[i] - Math.PI / 2);
        const py2 = hcy + (hR2 - 4) * Math.sin(ph[i] - Math.PI / 2);
        ctx.beginPath(); ctx.arc(px2, py2, 3, 0, Math.PI * 2);
        ctx.fillStyle = hsl(ph[i], 90, 65); ctx.fill();
      }
      ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}50`;
      ctx.fillText("θ dist", hcx, hcy + hR2 + 3);

      /* r(t) strip */
      const HR = histR.current;
      if (HR.length > 1) {
        const chX = 12, chY = H - 44, chW = W - 24, chH = 28;
        ctx.fillStyle = "rgba(2,4,8,0.75)"; ctx.fillRect(chX, chY, chW, chH);
        ctx.strokeStyle = `${TEAL}25`; ctx.lineWidth = 0.5;
        ctx.strokeRect(chX, chY, chW, chH);
        ctx.beginPath();
        for (let k = 0; k < HR.length; k++) {
          const px3 = chX + (k / 250) * chW;
          const py3 = chY + chH - HR[k] * chH;
          if (k === 0) ctx.moveTo(px3, py3); else ctx.lineTo(px3, py3);
        }
        const last = HR[HR.length - 1] ?? 0;
        const lc = last > 0.75 ? TEAL : last > 0.5 ? GOLD : last > 0.25 ? AMB : ROSE;
        ctx.strokeStyle = lc; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.font = `8px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
        ctx.fillStyle = `${lc}90`;
        ctx.fillText(`r = ${last.toFixed(3)}  ·  Kuramoto order parameter  ·  K = ${aRef.current.K.toFixed(2)}`, chX + 4, chY + 2);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(rafRef.current);
  }, [analysis]); // eslint-disable-line

  return (
    <canvas ref={cvRef} width={560} height={420}
      style={{ width:"100%", maxWidth:560, borderRadius:10,
        border:`1px solid ${TEAL}18`, background:BG,
        boxShadow:"0 4px 40px rgba(0,0,0,0.7)" }} />
  );
}

/* ── UI helpers ──────────────────────────────────────── */
function SH({ n, title, sub, col = TEAL }: { n: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ marginTop:52, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:20 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
function MatrixCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const nodes: {x:number;y:number;col:string;label:string;phase:number;vx:number;vy:number}[] = [];
    const labels=["ENTROPY","COHERENCE","KURAMOTO","SIGIL","Φ(E,S)","K·FIELD","MNESIS","ALETHEIA"];
    const cols=["#ff4477","#2ef0d8","#9966ff","#c9a84c","#44aaff","#44cc77","#c084fc","#f472b6"];
    for (let i=0;i<8;i++) {
      nodes.push({ x:80+Math.random()*(W-160), y:40+Math.random()*(H-80), col:cols[i], label:labels[i],
        phase:Math.random()*Math.PI*2, vx:(Math.random()-0.5)*0.4, vy:(Math.random()-0.5)*0.3 });
    }
    const links: [number,number][] = [[0,4],[1,4],[2,4],[3,4],[4,5],[4,6],[4,7],[0,2],[1,3]];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(4,7,14,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      nodes.forEach(n=>{
        n.x+=n.vx; n.y+=n.vy;
        if (n.x<50||n.x>W-50) n.vx*=-1;
        if (n.y<30||n.y>H-30) n.vy*=-1;
      });
      links.forEach(([a,b])=>{
        const na=nodes[a],nb=nodes[b];
        const g=ctx.createLinearGradient(na.x,na.y,nb.x,nb.y);
        g.addColorStop(0,na.col+"44"); g.addColorStop(1,nb.col+"44");
        ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y);
        ctx.strokeStyle=g; ctx.lineWidth=1; ctx.stroke();
        const flow=(t*0.014+(a+b)*0.3)%1;
        const px=na.x+(nb.x-na.x)*flow, py=na.y+(nb.y-na.y)*flow;
        ctx.beginPath(); ctx.arc(px,py,2,0,Math.PI*2);
        ctx.fillStyle="#fff"; ctx.shadowColor="#fff"; ctx.shadowBlur=7; ctx.fill(); ctx.shadowBlur=0;
      });
      nodes.forEach(n=>{
        const pulse=1+0.1*Math.sin(t*0.04+n.phase);
        const g=ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,16*pulse);
        g.addColorStop(0,n.col+"cc"); g.addColorStop(0.5,n.col+"33"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(n.x,n.y,14*pulse,0,Math.PI*2);
        ctx.fillStyle=g; ctx.shadowColor=n.col; ctx.shadowBlur=14*pulse; ctx.fill(); ctx.shadowBlur=0;
        ctx.strokeStyle=n.col; ctx.lineWidth=1.5; ctx.stroke();
        ctx.fillStyle=n.col; ctx.font="bold 7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(n.label,n.x,n.y+18*pulse);
      });
      ctx.fillStyle="rgba(153,102,255,0.4)"; ctx.font="9px 'DM Mono',monospace"; ctx.textAlign="left";
      ctx.fillText("AETHER CREATIVE MATRIX · Φ(E,S) = K · KURAMOTO FIELD · SIGIL CRYSTALLIZATION",14,18);
      rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AetherMatrixPage() {
  const [input,     setInput]    = useState("");
  const [analysis,  setAnalysis] = useState<Analysis | null>(null);
  const [synthesis, setSynthesis]= useState("");
  const [loading,   setLoading]  = useState(false);

  const handleCrystallize = useCallback(() => {
    if (!input.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const a = analyzeText(input);
      if (a) {
        setAnalysis(a);
        setSynthesis(generateSynthesis(a));
      }
      setLoading(false);
    }, 320);
  }, [input]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleCrystallize();
  };

  const sigilCols: Record<SigilState, string> = {
    "MNÉSIS": GOLD, "ALETHEIA": TEAL, "INFERAIA": AMB, "REVERIE": ROSE,
  };
  const activeCol = analysis ? sigilCols[analysis.sigil] : TEAL;

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      <div style={{ padding:"16px 24px 0" }}>
        <div style={{ display:"inline-block", background:"rgba(153,102,255,0.08)", border:"1px solid rgba(153,102,255,0.25)",
          borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
          color:VIO, textTransform:"uppercase", fontFamily:mono, marginBottom:12 }}>
          Live Simulation
        </div>
        <div style={{ background:"rgba(4,7,14,0.85)", border:"1px solid rgba(153,102,255,0.12)",
          borderLeft:`3px solid ${VIO}`, borderRadius:10, padding:20, marginBottom:12 }}>
          <h2 style={{ fontFamily:serif, fontSize:18, color:"#fff", margin:"0 0 6px" }}>
            AETHER Creative Matrix · Φ(E,S) = K · Kuramoto Field · Sigil Crystallization
          </h2>
          <p style={{ fontFamily:body, fontSize:12, color:`${TEAL}88`, margin:"0 0 14px", lineHeight:1.65 }}>
            Eight floating concept nodes (Entropy · Coherence · Kuramoto · Sigil · Φ(E,S) · K·Field · Mnesis · Aletheia)
            drifting in slow orbital motion with flow-packet links — the living AETHER generative matrix
            topology with each node's isomorphism field pulsing in phase.
          </p>
          <MatrixCanvas />
        </div>
      </div>

      {/* Hero */}
      <div style={{ textAlign:"center", padding:"52px 24px 32px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%, ${VIO}09, ${TEAL}04, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:VIO, letterSpacing:4, marginBottom:10 }}>
          AETHER · CREATIVE MATRIX · GENERATIVE ENGINE
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(28px,5vw,54px)", color:"#fff", margin:"0 0 8px", letterSpacing:1 }}>
          TYPE TO<span style={{ color:TEAL }}>·</span>CREATE
        </h1>
        <div style={{ fontFamily:serif, fontSize:15, color:TEAL, letterSpacing:3, marginBottom:16 }}>
          Φ(E,S) = K · Kuramoto Field · Sigil Crystallization · AETHER Layer Mapping
        </div>
        <div style={{ fontFamily:body, fontSize:16, color:DIM, maxWidth:660, margin:"0 auto", lineHeight:1.88 }}>
          Enter any concept, phrase, or idea. The system decomposes it through the AETHER mathematical
          structure — computing entropy E, structural coherence S, and the isomorphism coefficient K.
          Your words become oscillator nodes in a live Kuramoto field. The coherence state determines
          your sigil growth state: Mnésis → Aletheia → Inferaia → Reverie.
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* Input terminal */}
        <div style={{ background:"#030b14", border:`1px solid ${VIO}35`, borderRadius:12,
          padding:"28px", margin:"24px 0 32px",
          boxShadow:`0 0 60px ${VIO}10, 0 4px 40px rgba(0,0,0,0.6)` }}>
          <div style={{ fontFamily:mono, fontSize:9, color:VIO, letterSpacing:3, marginBottom:12 }}>
            AETHER MATRIX · INPUT TERMINAL
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Type a concept, a question, an idea, a word, a sentence — anything you want to crystallize into AETHER structure..."
            rows={4}
            style={{
              width:"100%", boxSizing:"border-box",
              background:"transparent", border:`1px solid ${VIO}30`,
              borderRadius:8, padding:"14px 16px", resize:"vertical",
              fontFamily:body, fontSize:17, color:TEXT, lineHeight:1.85,
              outline:"none",
            }}
          />
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:14 }}>
            <div style={{ fontFamily:mono, fontSize:8, color:DIM }}>
              ⌘+Enter to crystallize  ·  {input.split(/\s+/).filter(Boolean).length} words  ·  {input.length} chars
            </div>
            <button onClick={handleCrystallize}
              disabled={loading || !input.trim()}
              style={{
                fontFamily:mono, fontSize:11, padding:"10px 28px", borderRadius:8, cursor:"pointer",
                border:`1px solid ${VIO}80`, background:loading ? `${VIO}08` : `${VIO}18`,
                color: VIO, letterSpacing:2,
                boxShadow: loading ? "none" : `0 0 20px ${VIO}20`,
                opacity: !input.trim() ? 0.4 : 1,
              }}>
              {loading ? "PROCESSING…" : "CRYSTALLIZE"}
            </button>
          </div>
        </div>

        {/* Output */}
        {analysis && (
          <>
            {/* Sigil + Math */}
            <SH n="I" title="Sigil Growth State" sub="The four AETHER crystallization states — active state determined by Kuramoto order parameter r" col={activeCol} />
            <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
              {/* Sigil canvas */}
              <div style={{ flex:"1 1 480px" }}>
                <SigilCanvas sigil={analysis.sigil} />
                <div style={{ background:`${activeCol}08`, border:`1px solid ${activeCol}25`,
                  borderRadius:8, padding:"14px 16px", marginTop:14 }}>
                  <div style={{ fontFamily:mono, fontSize:9, color:activeCol, letterSpacing:2, marginBottom:6 }}>
                    ACTIVE STATE: {analysis.sigil}
                  </div>
                  <div style={{ fontFamily:body, fontSize:15, color:TEXT, lineHeight:1.8 }}>
                    {analysis.sigil === "MNÉSIS"   && "Dawn · The spiral of emerging consciousness. First lamination. Possibility space maximally open."}
                    {analysis.sigil === "ALETHEIA" && "Awakening · The eye opens. Partial phase-locking. Coherence pockets forming across the concept topology."}
                    {analysis.sigil === "INFERAIA" && "Radiant · Flame ignition. K above critical threshold Kc. Structured output exceeds entropy input."}
                    {analysis.sigil === "REVERIE"  && "Radiant · Full coherence. Crescent orbit. Near-complete phase-locking across all concept-oscillator nodes."}
                  </div>
                </div>
              </div>

              {/* Math readout */}
              <div style={{ flex:"0 0 280px", background:"#030d18",
                border:`1px solid ${VIO}25`, borderRadius:12, padding:"22px 24px" }}>
                <div style={{ fontFamily:mono, fontSize:10, color:VIO, letterSpacing:2, marginBottom:18 }}>
                  Φ(E,S) = K · COMPUTED
                </div>

                {/* Main equation display */}
                <div style={{ background:`${VIO}08`, borderRadius:8, padding:"14px",
                  marginBottom:18, textAlign:"center" }}>
                  <div style={{ fontFamily:mono, fontSize:13, color:VIO }}>
                    Φ({analysis.E.toFixed(3)}, {analysis.S.toFixed(3)}) = {analysis.K.toFixed(3)}
                  </div>
                  <div style={{ fontFamily:mono, fontSize:9, color:DIM, marginTop:4 }}>
                    φ · √(E·S) · 5.2
                  </div>
                </div>

                {[
                  { label:"φ (GOLDEN RATIO)", val: analysis.phi.toFixed(6), col:GOLD },
                  { label:"E (SHANNON ENTROPY FACTOR)", val: analysis.E.toFixed(4), col:AMB },
                  { label:"S (STRUCTURAL COHERENCE)", val: analysis.S.toFixed(4), col:TEAL },
                  { label:"K (KURAMOTO COUPLING)",  val: analysis.K.toFixed(4), col:VIO },
                  { label:"H (ENTROPY, bits)", val: analysis.H.toFixed(3) + " bits", col:DIM },
                  { label:"r (ORDER PARAMETER)", val: analysis.r.toFixed(4), col:activeCol },
                  { label:"AETHER LAYER", val: `${analysis.layer}  —  ${LAYER_NAMES[analysis.layer]}`, col:LAYER_COLS[analysis.layer] },
                  { label:"DOMINANT FREQUENCY", val: `ε = '${analysis.dominant}'  (${analysis.words.length} nodes)`, col:ROSE },
                ].map(({ label, val, col }) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"flex-start", gap:8, marginBottom:10,
                    paddingBottom:8, borderBottom:`1px solid ${col}15` }}>
                    <div style={{ fontFamily:mono, fontSize:8, color:`${col}80`, flexShrink:0 }}>{label}</div>
                    <div style={{ fontFamily:mono, fontSize:10, color:col, textAlign:"right" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Word field */}
            <SH n="II" title="Concept-Field Simulation" sub="Your words as Kuramoto oscillator nodes — phase-locking driven by shared letter coupling K" col={TEAL} />
            <div style={{ display:"flex", gap:20, flexWrap:"wrap", alignItems:"flex-start" }}>
              <div style={{ flex:"1 1 480px" }}>
                <FieldCanvas analysis={analysis} />
                <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:1.8 }}>
                  NODES = your words  ·  COLOR = current phase θ  ·  CONNECTION = shared letter ratio {">"}0.2  ·
                  GLOW = warmth field  ·  PHASE ARC = current oscillator angle  ·
                  TOP-RIGHT = θ distribution (all same angle = fully locked)  ·
                  BOTTOM = r(t) Kuramoto order parameter
                </div>
              </div>
              <div style={{ flex:"0 0 280px", display:"flex", flexDirection:"column", gap:12 }}>
                <div style={{ background:`${TEAL}07`, border:`1px solid ${TEAL}20`,
                  borderRadius:8, padding:"14px 16px" }}>
                  <div style={{ fontFamily:mono, fontSize:9, color:TEAL, marginBottom:8 }}>COUPLING TOPOLOGY</div>
                  {analysis.words.slice(0, 8).map((w, i) => {
                    const strongest = analysis.coupling[i]
                      ? [...analysis.coupling[i].entries()].sort((a, b) => b[1] - a[1])[0]
                      : null;
                    return (
                      <div key={i} style={{ fontFamily:mono, fontSize:9, color:DIM,
                        borderBottom:`1px solid ${TEAL}10`, paddingBottom:4, marginBottom:4 }}>
                        <span style={{ color:TEAL }}>{w.toUpperCase()}</span>
                        {strongest && strongest[1] > 0.2 && analysis.words[strongest[0]]
                          ? <span> → <span style={{ color:GOLD }}>{analysis.words[strongest[0]].toUpperCase()}</span> ({(strongest[1] * 100).toFixed(0)}%)</span>
                          : <span style={{ color:DIM }}> → ISOLATED</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ background:`${VIO}07`, border:`1px solid ${VIO}20`,
                  borderRadius:8, padding:"14px 16px" }}>
                  <div style={{ fontFamily:mono, fontSize:9, color:VIO, marginBottom:6 }}>PHASE LOCK STATUS</div>
                  {analysis.r > 0.75
                    ? <div style={{ fontFamily:body, fontSize:13, color:TEAL, lineHeight:1.7 }}>
                        All {analysis.words.length} concept-nodes approaching synchrony. Coherent cluster forming.
                      </div>
                    : analysis.r > 0.45
                    ? <div style={{ fontFamily:body, fontSize:13, color:GOLD, lineHeight:1.7 }}>
                        Partial locking. {Math.round(analysis.words.length * analysis.r)} nodes in coherence pockets. {analysis.words.length - Math.round(analysis.words.length * analysis.r)} nodes drifting.
                      </div>
                    : <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.7 }}>
                        Sub-critical coupling (K = {analysis.K.toFixed(2)} {"<"} Kc = 2.0). Nodes exploring phase space. No stable cluster yet.
                      </div>}
                </div>
              </div>
            </div>

            {/* AETHER Layer bar */}
            <SH n="III" title="AETHER Layer Activation" sub="Planck/spin-foam (0) → Whole Body (9) — layer determined by input complexity and word count" col={LAYER_COLS[analysis.layer]} />
            <div style={{ background:"#030d18", border:`1px solid ${LAYER_COLS[analysis.layer]}22`,
              borderRadius:10, padding:"20px 24px", marginBottom:24 }}>
              <div style={{ display:"flex", gap:0, marginBottom:14 }}>
                {LAYER_NAMES.map((name, i) => {
                  const isActive = i === analysis.layer;
                  const col = LAYER_COLS[i];
                  return (
                    <div key={i} style={{ flex:1, textAlign:"center", padding:"8px 2px",
                      background: isActive ? `${col}18` : "transparent",
                      border:`1px solid ${col}${isActive ? "50" : "18"}`,
                      borderRadius: i === 0 ? "6px 0 0 6px" : i === 9 ? "0 6px 6px 0" : "0",
                      transition:"all 0.3s" }}>
                      <div style={{ fontFamily:mono, fontSize:7, color:`${col}${isActive ? "ff" : "40"}`, marginBottom:2 }}>
                        L{i}
                      </div>
                      <div style={{ fontFamily:mono, fontSize:6, color:`${col}${isActive ? "aa" : "25"}`,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {name.split("·")[0].trim()}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                <div style={{ flex:1, fontFamily:mono, fontSize:11,
                  color:LAYER_COLS[analysis.layer], letterSpacing:1 }}>
                  LAYER {analysis.layer}: {LAYER_NAMES[analysis.layer]}
                </div>
                <div style={{ fontFamily:body, fontSize:14, color:DIM, maxWidth:480, lineHeight:1.75 }}>
                  {[
                    "Single characters and quantum substrates. The Planck foam beneath all structure.",
                    "Particle interactions and symmetry groups. SU(3)×SU(2)×U(1) gauge structure.",
                    "Electron orbital shells and angular momentum. Spherical harmonics Yˡm(θ,φ).",
                    "DNA double helix. Backbone torsion constraints and non-covalent interactions.",
                    "Alpha helix, beta sheets, collagen triple helix. Variational fold energy minimization.",
                    "Actin filaments and microtubules. GTP hydrolysis ΔG = ΔG° + RT·ln(Q).",
                    "Hexagonal epithelial packing and cortical columns. Surface energy contact inhibition.",
                    "Helical myocardium and cochlear spiral. Functional load optimization.",
                    "Spiral helix and bilateral symmetry. Mechanical efficiency D = D₁ + D₂.",
                    "Standing wave: the coherent superposition of all layers 0–8 simultaneously.",
                  ][analysis.layer]}
                </div>
              </div>
            </div>

            {/* Synthesis output */}
            <SH n="IV" title="AETHER Synthesis" sub="Your input crystallized into AETHER mathematical language" col={activeCol} />
            <div style={{ background:`${activeCol}06`, border:`1px solid ${activeCol}28`,
              borderRadius:12, padding:"24px 28px", marginBottom:32 }}>
              <div style={{ display:"flex", gap:14, marginBottom:16, alignItems:"center" }}>
                <div style={{ fontFamily:mono, fontSize:9, color:activeCol, letterSpacing:2 }}>
                  INPUT: {analysis.words.length} CONCEPTS → {analysis.sigil} SIGIL → LAYER {analysis.layer}
                </div>
                <div style={{ height:1, flex:1, background:`${activeCol}20` }} />
                <div style={{ fontFamily:mono, fontSize:9, color:activeCol }}>
                  r = {analysis.r.toFixed(3)}
                </div>
              </div>
              <blockquote style={{ fontFamily:body, fontSize:16, color:TEXT, lineHeight:2.0,
                margin:0, borderLeft:`3px solid ${activeCol}50`, paddingLeft:20, fontStyle:"normal" }}>
                {synthesis}
              </blockquote>
            </div>

            {/* Knowledge connections */}
            <SH n="V" title="AETHER Knowledge Connections" sub="Pages activated by this input's mathematical signature" col={VIO} />
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:12, marginBottom:36 }}>
              {[
                { r:"/synchrony-field",    label:"Synchrony Field",      col:TEAL, desc:`Your K = ${analysis.K.toFixed(2)} maps to the Kuramoto coupling coefficient. ${analysis.r > 0.6 ? "Your field is above the critical threshold — coherent regime." : "Your field is below Kc = 2.0 — exploring phase space."}` },
                { r:"/stromatolite-field", label:"Stromatolite Field",   col:AMB,  desc:`Layer ${analysis.layer} activation (${LAYER_NAMES[analysis.layer]}) corresponds to the biological-geological scale of stromatolite dome formation. S = ${analysis.S.toFixed(3)} is your structural coherence.` },
                { r:"/perceptive-universe",label:"Perceptive Universe",  col:GOLD, desc:`E = ${analysis.E.toFixed(3)} entropy factor connects to the Allen-Cahn C(x,t) coherence field. ${analysis.sigil === "REVERIE" || analysis.sigil === "INFERAIA" ? "Your input is in the coherent regime (C > φ⁻¹)." : "Your input is in the decoherent regime (C < φ⁻¹)."}` },
                { r:"/core-resonance",     label:"Core Resonance",       col:VIO,  desc:`Your sigil state is ${analysis.sigil}. The CORE resonance orb corresponds to ${analysis.sigil === "REVERIE" ? "RADIANT (maximum coherence)" : analysis.sigil === "INFERAIA" ? "RADIANT ignition state" : analysis.sigil === "ALETHEIA" ? "LUCIDITY — awakening" : "ECLIPSE — dormant formation"}.` },
                { r:"/water-density",      label:"Water Density Field",  col:BLUE, desc:`Shannon entropy H = ${analysis.H.toFixed(2)} bits connects to the thermal density fluctuation analysis. ${analysis.E.toFixed(3)} entropy factor indicates ${analysis.E > 0.7 ? "high information density — complex substrate" : "low entropy — structured signal"}.` },
                { r:"/aether-core",        label:"AETHER Core Engine",   col:ROSE, desc:`Your ${analysis.words.length}-node concept field matches the Gray-Scott reaction-diffusion parameters. The dominant frequency ε = '${analysis.dominant}' seeds the pattern formation.` },
              ].map(c => (
                <a key={c.r} href={c.r} style={{ textDecoration:"none" }}>
                  <div style={{ background:`${c.col}07`, border:`1px solid ${c.col}22`,
                    borderRadius:8, padding:"12px 14px", cursor:"pointer",
                    transition:"border-color 0.2s" }}>
                    <div style={{ fontFamily:mono, fontSize:9, color:c.col, marginBottom:4 }}>→ {c.label.toUpperCase()}</div>
                    <div style={{ fontFamily:body, fontSize:12, color:DIM, lineHeight:1.7 }}>{c.desc}</div>
                  </div>
                </a>
              ))}
            </div>
          </>
        )}

        {/* Reference Matrix */}
        <SH n={analysis ? "VI" : "I"} title="AETHER Reference Matrix" sub="The visual corpus that grounds this engine — 10 reference images from the AETHER image foundation" col={DIM} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10, marginBottom:32 }}>
          {[
            { src:sigilImg,  label:"Sigil Growth States" },
            { src:layerImg,  label:"Helical Expression Scale" },
            { src:isoImg,    label:"Isomorphism Code Sim" },
            { src:thermoImg, label:"Coherent → Thermal" },
            { src:nestedImg, label:"Nested Scaling Principle" },
            { src:biodigImg, label:"Bio-Digital Perception" },
            { src:cloudImg,  label:"Cloud Streets · Convection" },
            { src:soiImg,    label:"Self-Organization Isomorphism" },
            { src:mpcImg,    label:"MPC Spatial Logistics" },
            { src:qtfImg,    label:"Quantum Firefly · Fabric" },
          ].map(({ src, label }) => (
            <div key={label} style={{ borderRadius:8, overflow:"hidden",
              border:`1px solid ${DIM}20`, background:"#030d18" }}>
              <img src={src} alt={label}
                style={{ width:"100%", height:110, objectFit:"cover", display:"block", opacity:0.82 }} />
              <div style={{ fontFamily:mono, fontSize:8, color:DIM, padding:"6px 8px", lineHeight:1.5 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Footer equation */}
        <div style={{ textAlign:"center", padding:"32px 0 0", borderTop:`1px solid ${VIO}14` }}>
          <div style={{ fontFamily:serif, fontSize:18, color:VIO, marginBottom:10 }}>
            Φ(E,S) = K · THE ISOMORPHISM
          </div>
          <div style={{ fontFamily:mono, fontSize:11, color:DIM, lineHeight:2.4 }}>
            entropy E · structure S → coupling K → coherence r → sigil state → AETHER layer
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:1.9,
            maxWidth:620, margin:"14px auto 0" }}>
            The same skeleton runs in every domain: local rules + constraint + time → irreversible structure.
            What you type is a seed. The AETHER mathematical framework grows it into a coherent field.
            The sigil is the state of that crystallization. The layer is the scale at which it operates.
          </div>
        </div>
      </div>
    </div>
  );
}

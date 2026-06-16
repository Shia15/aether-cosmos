import { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────────────────────────────────────────────────── */
const BG0   = "#030810";
const BG1   = "#060c1c";
const SURF  = "#080f20";
const MID   = "#0b1530";
const LINE  = "#101e44";
const DIM   = "#182858";
const BODY  = "#5878a8";
const PALE  = "#98b0d8";
const LIGHT = "#c8d8f0";
const WHITE = "#eaf2ff";

const ENG   = "#ff8020";   // engine orange
const ENG2  = "#ffc060";
const STR   = "#20e8b0";   // string teal
const STR2  = "#60ffcc";
const ORB   = "#c060ff";   // orbit purple
const ORB2  = "#e0a0ff";
const DIFF  = "#40d8ff";   // differential blue
const DIFF2 = "#80ecff";
const RUST  = "#ff5030";   // burst red

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── quaternion math ─────────────────────────────────────────────────────── */
type Q = [number, number, number, number]; // [a, b, c, d]  = a + bi + cj + dk

const qMul = (p: Q, q: Q): Q => [
  p[0]*q[0] - p[1]*q[1] - p[2]*q[2] - p[3]*q[3],
  p[0]*q[1] + p[1]*q[0] + p[2]*q[3] - p[3]*q[2],
  p[0]*q[2] - p[1]*q[3] + p[2]*q[0] + p[3]*q[1],
  p[0]*q[3] + p[1]*q[2] - p[2]*q[1] + p[3]*q[0],
];
const qNorm = (q: Q): Q => {
  const n = Math.sqrt(q[0]**2 + q[1]**2 + q[2]**2 + q[3]**2) || 1;
  return [q[0]/n, q[1]/n, q[2]/n, q[3]/n];
};
const qConj = (q: Q): Q => [q[0], -q[1], -q[2], -q[3]];
const qLerp = (p: Q, q: Q, t: number): Q => qNorm([
  p[0]*(1-t)+q[0]*t, p[1]*(1-t)+q[1]*t, p[2]*(1-t)+q[2]*t, p[3]*(1-t)+q[3]*t,
]);
const qAxis = (ax: number, ay: number, az: number, θ: number): Q => {
  const s = Math.sin(θ/2), c = Math.cos(θ/2);
  const n = Math.sqrt(ax*ax+ay*ay+az*az)||1;
  return [c, ax/n*s, ay/n*s, az/n*s];
};

/* ── alphabet definition ─────────────────────────────────────────────────── */
const ANGLE = Math.PI / 6; // base rotation = 30°

type LetterDef = { sym: string; name: string; col: string; category: string; desc: string };

const LETTERS: LetterDef[] = [
  { sym: "R", name: "Red Axis",       col: "#ff5040", category: "Chromatic", desc: "30° rotation around i-axis — red quaternion generator" },
  { sym: "G", name: "Green Axis",     col: "#40d850", category: "Chromatic", desc: "30° rotation around j-axis — green quaternion generator" },
  { sym: "B", name: "Blue Axis",      col: "#5080ff", category: "Chromatic", desc: "30° rotation around k-axis — blue quaternion generator" },
  { sym: "~", name: "Oscillate",      col: DIFF2,     category: "Control",   desc: "Soft dual-axis twist — i+j blend at reduced angle" },
  { sym: "o", name: "Measure",        col: ORB2,      category: "Control",   desc: "Real-axis pull — lerp toward identity q=1" },
  { sym: "n", name: "Perturb",        col: ENG2,      category: "Control",   desc: "j-push perturbation at 45° — breaks symmetry deliberately" },
  { sym: "S", name: "Stabilise",      col: STR2,      category: "Control",   desc: "Conjugate fold — q → q* (imaginary sign flip)" },
  { sym: "+", name: "Amplify",        col: ENG,       category: "Scale",     desc: "Doubles the base rotation angle for next operator" },
  { sym: "-", name: "Attenuate",      col: "#80a0e0", category: "Scale",     desc: "Halves the base rotation angle for next operator" },
  { sym: "^", name: "Accelerate",     col: RUST,      category: "Scale",     desc: "4× angle — high-energy burst rotation" },
  { sym: "_", name: "Rest",           col: BODY,      category: "Scale",     desc: "Identity pause — holds current state for one tick" },
  { sym: "[", name: "Branch",         col: ORB,       category: "Stack",     desc: "Push current quaternion state to stack" },
  { sym: "]", name: "Merge",          col: ORB2,      category: "Stack",     desc: "Pop and compose with saved state from stack" },
  { sym: "*", name: "Mirror",         col: DIFF,      category: "Stack",     desc: "Blend q with its conjugate: normalize(q + q*)" },
  { sym: ">", name: "Forward",        col: STR,       category: "Stack",     desc: "Self-compose: q → q⊗q (double the rotation)" },
  { sym: "<", name: "Reverse",        col: ENG2,      category: "Stack",     desc: "Conjugate-compose: q → q*⊗q (approaches identity)" },
];

const LETTER_MAP = new Map(LETTERS.map(l => [l.sym, l]));

const applyLetter = (q: Q, sym: string, angleScale = 1): Q => {
  const θ = ANGLE * angleScale;
  switch (sym) {
    case "R": return qNorm(qMul(qAxis(1, 0, 0, θ), q));
    case "G": return qNorm(qMul(qAxis(0, 1, 0, θ), q));
    case "B": return qNorm(qMul(qAxis(0, 0, 1, θ), q));
    case "~": return qNorm(qMul(qAxis(1, 1, 0, θ * 0.7), q));
    case "o": return qLerp(q, [1, 0, 0, 0], 0.25);
    case "n": return qNorm(qMul(qAxis(0, 1, 0, θ * 1.5), q));
    case "S": return qConj(q);
    case "+": return q; // handled by angleScale
    case "-": return q; // handled by angleScale
    case "^": return qNorm(qMul(q, q)); // self-compose
    case "_": return q;
    case "*": return qNorm([q[0] + q[0], 0, 0, 0] as Q); // pull to real
    case ">": return qNorm(qMul(q, q));
    case "<": return qNorm(qMul(qConj(q), q));
    case "[": return q;
    case "]": return q;
    default:  return q;
  }
};

/* ── preset strings ──────────────────────────────────────────────────────── */
type Preset = { id: string; label: string; str: string; col: string; desc: string };

const PRESETS: Preset[] = [
  { id: "triad",    label: "Chromatic Triad",       str: "RGB",             col: ORB2,  desc: "Perfect 3-color balance → SU(3) singlet orbit — circular, coherent" },
  { id: "hex",      label: "Hexagonal Coherence",   str: "RGBRGB",          col: DIFF2, desc: "Doubled triad → hexagonal orbit in quaternion space" },
  { id: "ctrl",     label: "Control Alphabet",       str: "~onS",            col: STR2,  desc: "Base ~ → o → n → S sequence from burst mitigation" },
  { id: "dblctrl",  label: "Double Control",         str: "~onS~onS",        col: STR,   desc: "Nested double stabilisation — nested phase-lock" },
  { id: "hybrid",   label: "Chromatic + Control",    str: "RGB~onS",         col: ENG2,  desc: "Color generators followed by burst mitigation — full cycle" },
  { id: "damp",     label: "Damped Chromatic",       str: "R~G~B~",          col: ORB,   desc: "Each color axis followed by soft oscillation damping" },
  { id: "accel",    label: "Accelerated Triple",     str: "^R^G^B",          col: RUST,  desc: "High-energy 4× rotations — approaches quaternion burst zone" },
  { id: "branch",   label: "Branched Stack",         str: "[RGB]~[onS]",     col: DIFF,  desc: "Two branches: chromatic state + control state, merged" },
  { id: "asymm",    label: "Asymmetric Differential",str: "RRGB-~S",         col: ENG,   desc: "Red-weighted with attenuated oscillation — asymmetric orbit" },
  { id: "lsys0",    label: "L-System Gen 0",         str: "R",               col: "#ff5040", desc: "Seed string for L-system growth: single Red generator" },
];

/* ── L-system production rules ───────────────────────────────────────────── */
const L_RULES: Record<string, string> = {
  R: "RG", G: "GB", B: "BR",
  "~": "~o", o: "on", n: "nS", S: "S~",
  "+": "+R", "-": "-G",
  "_": "_n", "^": "^B",
};

function applyLSystem(str: string, gens: number): string {
  let s = str;
  for (let g = 0; g < gens; g++) {
    let next = "";
    for (const ch of s) {
      next += L_RULES[ch] ?? ch;
    }
    s = next.slice(0, 64); // cap at 64 chars
  }
  return s;
}

/* ── shared components ───────────────────────────────────────────────────── */
function Chip({ c = PALE, children }: { c?: string; children: string }) {
  return <span style={{ fontFamily: mono, fontSize: 11, color: c, background: `${c}14`, border: `1px solid ${c}40`, borderRadius: 4, padding: "2px 8px", display: "inline-block", margin: "2px 3px" }}>{children}</span>;
}
function EQBlock({ col = ENG, children }: { col?: string; children: string }) {
  return <pre style={{ fontFamily: mono, fontSize: 12, color: LIGHT, background: SURF, borderLeft: `3px solid ${col}60`, borderRadius: "0 6px 6px 0", padding: "14px 20px", margin: "14px 0", overflowX: "auto", whiteSpace: "pre-wrap", lineHeight: 1.9 }}>{children}</pre>;
}
function Sect({ id, n, title, sub, col = ENG }: { id: string; n: string; title: string; sub: string; col?: string }) {
  return (
    <div id={id} style={{ marginTop: 72, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 9, color: col, letterSpacing: 4, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 28, color: WHITE, margin: "0 0 4px", letterSpacing: 1 }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: DIM, marginBottom: 22 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}50,transparent)`, marginBottom: 32 }} />
    </div>
  );
}
function Pull({ col = ENG, children }: { col?: string; children: string }) {
  return <blockquote style={{ borderTop: `1px solid ${col}40`, borderBottom: `1px solid ${col}40`, padding: "16px 28px", margin: "28px 0", fontFamily: body, fontStyle: "italic", fontSize: 19, color: LIGHT, lineHeight: 1.65, textAlign: "center" }}>{children}</blockquote>;
}

/* ── canvas ──────────────────────────────────────────────────────────────── */
type Mode = "orbit" | "ticker" | "lsystem";

function EngineCanvas({ mode, activeString }: { mode: Mode; activeString: string }) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    const canvas = cvs.current!;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      const p = canvas.parentElement!;
      canvas.width = p.clientWidth;
      canvas.height = Math.min(460, Math.round(p.clientWidth * 0.5));
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── shared state ── */
    const ORBIT_LEN = 320;
    type TrailPt = { q: Q; col: string; sym: string };
    const trail: TrailPt[] = [];

    let q: Q = [1, 0, 0, 0]; // current quaternion
    let letterIdx = 0;
    let angleScale = 1.0;
    const stack: Q[] = [];

    // L-system generation state
    let lsysGen = 0;
    let lsysStr = activeString || "R";
    let lsysLetterIdx = 0;
    let lsysQ: Q = [1, 0, 0, 0];

    const FRAMES_PER_LETTER = 14;

    /* project imaginary quaternion (b,c,d) → 2D with rotating camera */
    const project = (q: Q, W: number, H: number, viewT: number) => {
      const camTheta = viewT * 0.18;
      const camPhi = 0.35;
      const b = q[1], c = q[2], d = q[3];
      const x = b * Math.cos(camTheta) - d * Math.sin(camTheta);
      const z = b * Math.sin(camTheta) + d * Math.cos(camTheta);
      const y = c * Math.cos(camPhi) - z * Math.sin(camPhi);
      const scale = Math.min(W, H) * 0.36;
      return { sx: W * 0.5 + x * scale, sy: H * 0.5 - y * scale, depth: z };
    };

    const getLetterCol = (sym: string) => LETTER_MAP.get(sym)?.col ?? PALE;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      const t = tick.current;
      tick.current++;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG0; ctx.fillRect(0, 0, W, H);

      const str = activeString || "RGB";
      if (!str.length) { raf.current = requestAnimationFrame(draw); return; }

      /* ═══ ORBIT TRACER ══════════════════════════════════════════════════ */
      if (mode === "orbit") {
        // Advance quaternion by one letter every FRAMES_PER_LETTER frames
        if (t % FRAMES_PER_LETTER === 0) {
          const sym = str[letterIdx % str.length];
          letterIdx++;

          // Handle angle scaling modifiers
          if (sym === "+") { angleScale = Math.min(angleScale * 2, 8); }
          else if (sym === "-") { angleScale = Math.max(angleScale * 0.5, 0.125); }
          else if (sym === "^") { angleScale = 4; }
          else if (sym === "_") { /* rest */ }
          else if (sym === "[") { stack.push([...q] as Q); }
          else if (sym === "]") {
            if (stack.length > 0) {
              const saved = stack.pop()!;
              q = qNorm(qMul(saved, q));
            }
          } else {
            q = applyLetter(q, sym, angleScale);
            // Reset scale after non-modifier
            if (!"+-^".includes(sym)) angleScale = 1.0;
          }

          const col = getLetterCol(sym);
          trail.push({ q: [...q] as Q, col, sym });
          if (trail.length > ORBIT_LEN) trail.shift();
        }

        /* Draw trail — sorted by depth for pseudo-3D */
        const viewT = t;
        const projected = trail.map((pt, i) => {
          const p = project(pt.q, W, H, viewT);
          return { ...p, frac: i / trail.length, col: pt.col, sym: pt.sym };
        });
        // Sort by depth (painter's algorithm)
        projected.sort((a, b) => a.depth - b.depth);

        projected.forEach(pt => {
          const alpha = pt.frac * 0.85;
          const r = 2 + pt.frac * 3;
          ctx.beginPath(); ctx.arc(pt.sx, pt.sy, r, 0, Math.PI * 2);
          ctx.fillStyle = `${pt.col}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
          ctx.fill();
        });

        // Draw connecting line between consecutive trail points
        if (projected.length > 1) {
          // Re-project in order (not sorted) for line
          const lineProj = trail.map((pt, i) => ({
            ...project(pt.q, W, H, viewT),
            frac: i / trail.length,
            col: pt.col,
          }));
          for (let i = 1; i < lineProj.length; i++) {
            const a2 = lineProj[i-1], b2 = lineProj[i];
            ctx.beginPath(); ctx.moveTo(a2.sx, a2.sy); ctx.lineTo(b2.sx, b2.sy);
            ctx.strokeStyle = `${b2.col}${Math.round(b2.frac * 160).toString(16).padStart(2, "0")}`;
            ctx.lineWidth = 0.8; ctx.stroke();
          }
        }

        // Current quaternion point (bright, large)
        const cur = project(q, W, H, viewT);
        const curLetter = str[(letterIdx - 1) % str.length];
        const curCol = getLetterCol(curLetter);
        const curGlow = ctx.createRadialGradient(cur.sx, cur.sy, 0, cur.sx, cur.sy, 20);
        curGlow.addColorStop(0, `${curCol}60`); curGlow.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(cur.sx, cur.sy, 20, 0, Math.PI * 2); ctx.fillStyle = curGlow; ctx.fill();
        ctx.beginPath(); ctx.arc(cur.sx, cur.sy, 6, 0, Math.PI * 2); ctx.fillStyle = curCol; ctx.fill();

        // Axes (faint reference)
        const axLen = Math.min(W, H) * 0.3;
        [
          { v: [0, 1, 0, 0] as Q, lab: "i", c: "#ff504040" },
          { v: [0, 0, 1, 0] as Q, lab: "j", c: "#40d85040" },
          { v: [0, 0, 0, 1] as Q, lab: "k", c: "#5080ff40" },
        ].forEach(ax => {
          const p0 = project([1,0,0,0], W, H, viewT);
          const p1 = project(ax.v, W, H, viewT);
          const dx = p1.sx - p0.sx, dy = p1.sy - p0.sy;
          const len = Math.sqrt(dx*dx+dy*dy)||1;
          ctx.beginPath();
          ctx.moveTo(W*0.5, H*0.5);
          ctx.lineTo(W*0.5 + (dx/len)*axLen, H*0.5 + (dy/len)*axLen);
          ctx.strokeStyle = ax.c; ctx.lineWidth = 0.8; ctx.stroke();
        });

        // Current letter + quaternion readout
        ctx.font = `10px ${mono}`; ctx.fillStyle = curCol; ctx.textAlign = "left";
        ctx.fillText(`"${curLetter}"  →  ${LETTER_MAP.get(curLetter)?.name ?? ""}`, 14, 22);
        ctx.font = `9px ${mono}`; ctx.fillStyle = `${PALE}90`;
        ctx.fillText(`q = ${q[0].toFixed(3)} + ${q[1].toFixed(3)}i + ${q[2].toFixed(3)}j + ${q[3].toFixed(3)}k`, 14, 38);
        ctx.fillText(`|q| = ${(Math.sqrt(q[0]**2+q[1]**2+q[2]**2+q[3]**2)).toFixed(4)}`, 14, 52);

        // String progress
        const strX = W - 14 - str.length * 12;
        ctx.font = `11px ${mono}`; ctx.textAlign = "left";
        str.split("").forEach((ch, ci) => {
          const isActive = ci === (letterIdx - 1) % str.length;
          ctx.fillStyle = isActive ? (LETTER_MAP.get(ch)?.col ?? WHITE) : `${BODY}60`;
          ctx.fillText(ch, Math.max(14, strX + ci * 12), H - 10);
        });

      /* ═══ LETTER ENGINE TICKER ══════════════════════════════════════════ */
      } else if (mode === "ticker") {

        if (t % FRAMES_PER_LETTER === 0) {
          const sym = str[letterIdx % str.length];
          if (sym && !"+-^[]*".includes(sym)) {
            q = applyLetter(q, sym, angleScale);
          }
          letterIdx++;
          trail.push({ q: [...q] as Q, col: getLetterCol(sym), sym });
          if (trail.length > ORBIT_LEN) trail.shift();
        }

        const curIdx = (letterIdx - 1) % str.length;

        // Quaternion component bars
        const barX = W * 0.06, barY = H * 0.15, barW = W * 0.18, barH2 = H * 0.65;
        const comps = [
          { label: "a (real)", val: q[0], col: WHITE },
          { label: "b (i)",    val: q[1], col: "#ff5040" },
          { label: "c (j)",    val: q[2], col: "#40d850" },
          { label: "d (k)",    val: q[3], col: "#5080ff" },
        ];
        comps.forEach((comp, ci) => {
          const bx = barX + ci * barW * 0.9;
          // Background bar
          ctx.fillStyle = `${LINE}80`; ctx.fillRect(bx, barY, barW * 0.65, barH2);
          // Value bar (0 = middle)
          const mid = barY + barH2 * 0.5;
          const barLen = (comp.val / 1) * barH2 * 0.5;
          const barTop = barLen < 0 ? mid : mid - barLen;
          const barBotLen = Math.abs(barLen);
          const bGrad = ctx.createLinearGradient(0, barTop, 0, barTop + barBotLen);
          bGrad.addColorStop(0, `${comp.col}dd`); bGrad.addColorStop(1, `${comp.col}40`);
          ctx.fillStyle = bGrad; ctx.fillRect(bx, barTop, barW * 0.65, barBotLen || 1);
          // Label
          ctx.font = `8px ${mono}`; ctx.fillStyle = comp.col; ctx.textAlign = "center";
          ctx.fillText(comp.label, bx + barW * 0.325, barY - 8);
          ctx.fillText(comp.val.toFixed(3), bx + barW * 0.325, barY + barH2 + 14);
        });

        // Mid-line
        const midY = barY + barH2 * 0.5;
        ctx.beginPath(); ctx.moveTo(barX, midY); ctx.lineTo(barX + barW * 3.6, midY);
        ctx.strokeStyle = `${LINE}80`; ctx.lineWidth = 0.8; ctx.stroke();

        // Tape - centered, scrolling
        const tapeY = H * 0.85;
        const charW2 = Math.min(32, W * 0.06);
        const visible = Math.floor(W / charW2);
        const startIdx = Math.max(0, curIdx - Math.floor(visible / 2));

        for (let di = 0; di < visible; di++) {
          const ci = (startIdx + di) % str.length;
          const ch = str[ci];
          const isActive = ci === curIdx;
          const dist = Math.abs(di - Math.floor(visible / 2));
          const alpha = Math.max(0.15, 1 - dist * 0.12);
          const cx2 = W * 0.05 + di * charW2;

          // Active highlight
          if (isActive) {
            const hlGrad = ctx.createLinearGradient(0, tapeY - 22, 0, tapeY + 12);
            hlGrad.addColorStop(0, `${LETTER_MAP.get(ch)?.col ?? WHITE}30`);
            hlGrad.addColorStop(1, "transparent");
            ctx.fillStyle = hlGrad; ctx.fillRect(cx2 - charW2*0.4, tapeY - 22, charW2*0.85, 36);
            ctx.strokeStyle = `${LETTER_MAP.get(ch)?.col ?? WHITE}50`;
            ctx.lineWidth = 0.8;
            ctx.strokeRect(cx2 - charW2*0.4, tapeY - 22, charW2*0.85, 36);
          }

          ctx.font = `bold ${isActive ? 18 : 14}px ${mono}`;
          const col = LETTER_MAP.get(ch)?.col ?? PALE;
          ctx.fillStyle = `${col}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`;
          ctx.textAlign = "center";
          ctx.fillText(ch, cx2, tapeY + (isActive ? 3 : 0));
        }

        // Tape label
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}70`; ctx.textAlign = "center";
        ctx.fillText("◀  STRING TAPE  ▶", W * 0.5, tapeY + 28);

        // Angular velocity vector
        const omegaDir = [q[1], q[2], q[3]]; // imaginary part ≈ rotation axis
        const omegaMag = Math.sqrt(omegaDir[0]**2 + omegaDir[1]**2 + omegaDir[2]**2);
        const avX = W * 0.78, avY = H * 0.5;
        const avLen = omegaMag * 80;
        if (omegaMag > 0.01) {
          const nx2 = omegaDir[0]/omegaMag, ny2 = -omegaDir[1]/omegaMag;
          ctx.beginPath(); ctx.moveTo(avX, avY); ctx.lineTo(avX + nx2*avLen, avY + ny2*avLen);
          const curCol2 = getLetterCol(str[curIdx] ?? "R");
          ctx.strokeStyle = `${curCol2}cc`; ctx.lineWidth = 2.5; ctx.stroke();
          ctx.beginPath(); ctx.moveTo(avX + nx2*avLen, avY + ny2*avLen);
          ctx.lineTo(avX + nx2*avLen - (-ny2*7+nx2*7), avY + ny2*avLen - (nx2*7+ny2*7));
          ctx.lineTo(avX + nx2*avLen - (ny2*7+nx2*7), avY + ny2*avLen - (-nx2*7+ny2*7));
          ctx.closePath(); ctx.fillStyle = curCol2; ctx.fill();
        }
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${BODY}80`; ctx.textAlign = "center";
        ctx.fillText("ω axis", avX, avY + 56);
        ctx.fillText(`|ω| = ${omegaMag.toFixed(3)}`, avX, avY + 68);

        // Status
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${ENG2}90`; ctx.textAlign = "right";
        ctx.fillText(`LETTER ENGINE  ·  step ${letterIdx}  ·  "${str[curIdx]}"  →  ${LETTER_MAP.get(str[curIdx] ?? "R")?.name ?? ""}`, W - 12, H - 8);

      /* ═══ L-SYSTEM GENERATOR ════════════════════════════════════════════ */
      } else if (mode === "lsystem") {

        // Update L-system every 3 seconds
        const GEN_INTERVAL = 180;
        if (t % GEN_INTERVAL === 0 && t > 0) {
          lsysGen = (lsysGen + 1) % 5;
          lsysStr = applyLSystem(activeString || "R", lsysGen);
          lsysLetterIdx = 0;
          lsysQ = [1, 0, 0, 0];
        }

        // Advance L-system orbit
        if (t % FRAMES_PER_LETTER === 0 && lsysStr.length > 0) {
          const sym = lsysStr[lsysLetterIdx % lsysStr.length];
          lsysLetterIdx++;
          lsysQ = applyLetter(lsysQ, sym);
          trail.push({ q: [...lsysQ] as Q, col: getLetterCol(sym), sym });
          if (trail.length > ORBIT_LEN) trail.shift();
        }

        // Draw orbit (top-left 55% of canvas)
        const orbitCX = W * 0.28, orbitCY = H * 0.5;
        const orbitScale = Math.min(W * 0.22, H * 0.35);
        if (trail.length > 1) {
          for (let i = 1; i < trail.length; i++) {
            const prev = trail[i-1], curr = trail[i];
            const frac = i / trail.length;
            // Simple 2D orbit: (b,c) projection
            const px2 = orbitCX + prev.q[1] * orbitScale;
            const py2 = orbitCY - prev.q[2] * orbitScale;
            const cx2 = orbitCX + curr.q[1] * orbitScale;
            const cy2 = orbitCY - curr.q[2] * orbitScale;
            ctx.beginPath(); ctx.moveTo(px2, py2); ctx.lineTo(cx2, cy2);
            ctx.strokeStyle = `${curr.col}${Math.round(frac * 200).toString(16).padStart(2, "0")}`;
            ctx.lineWidth = 1 + frac; ctx.stroke();
          }
        }

        // Current L-system point
        ctx.beginPath(); ctx.arc(
          orbitCX + lsysQ[1] * orbitScale,
          orbitCY - lsysQ[2] * orbitScale, 6, 0, Math.PI * 2);
        const curSym = lsysStr[lsysLetterIdx % lsysStr.length] ?? "R";
        ctx.fillStyle = getLetterCol(curSym); ctx.fill();

        // Generation info
        ctx.font = `9px ${mono}`; ctx.fillStyle = ENG2; ctx.textAlign = "left";
        ctx.fillText(`GENERATION  ${lsysGen}`, 14, 20);
        ctx.font = `8px ${mono}`; ctx.fillStyle = `${PALE}90`;
        ctx.fillText(`LENGTH  ${lsysStr.length} chars`, 14, 34);

        // String display (right panel)
        const strPanX = W * 0.53, strPanY = 14, strPanW = W * 0.44;
        ctx.fillStyle = `${SURF}90`; ctx.strokeStyle = `${LINE}`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(strPanX, strPanY, strPanW, H - 28, 6);
        ctx.fill(); ctx.stroke();

        ctx.font = `8px ${mono}`; ctx.fillStyle = ENG2; ctx.textAlign = "center";
        ctx.fillText(`GEN ${lsysGen}  ·  "${activeString || "R"}" expanded`, strPanX + strPanW * 0.5, strPanY + 16);

        // Show string wrapped
        const maxChars = Math.floor(strPanW * 0.92 / 9);
        const lines = [];
        for (let i = 0; i < lsysStr.length; i += maxChars) {
          lines.push(lsysStr.slice(i, i + maxChars));
        }
        lines.slice(0, 14).forEach((line, li) => {
          const lineY = strPanY + 32 + li * 18;
          line.split("").forEach((ch, ci) => {
            const isActive = li * maxChars + ci === lsysLetterIdx % lsysStr.length;
            ctx.font = `${isActive ? "bold " : ""}${isActive ? 11 : 9}px ${mono}`;
            ctx.fillStyle = isActive ? (LETTER_MAP.get(ch)?.col ?? WHITE) : `${LETTER_MAP.get(ch)?.col ?? PALE}80`;
            ctx.textAlign = "left";
            ctx.fillText(ch, strPanX + 8 + ci * 9, lineY);
          });
        });
        if (lines.length > 14) {
          ctx.font = `7px ${mono}`; ctx.fillStyle = `${BODY}60`; ctx.textAlign = "center";
          ctx.fillText(`…+${lsysStr.length - 14 * maxChars} more`, strPanX + strPanW * 0.5, strPanY + 32 + 14 * 18);
        }

        // Production rules key
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${BODY}60`; ctx.textAlign = "left";
        const ruleY = H - 24;
        Object.entries(L_RULES).slice(0, 7).forEach(([k, v], ri) => {
          ctx.fillText(`${k}→${v}`, 14 + ri * 46, ruleY);
        });
        ctx.fillStyle = `${ENG}80`;
        ctx.fillText("L-SYSTEM  ·  grows every 3s", W * 0.5 - 80, H - 10);
      }

      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [mode, activeString]);

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: `1px solid ${LINE}` }}>
      <canvas ref={cvs} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── controls ────────────────────────────────────────────────────────────── */
function ModeTabs({ value, onChange }: { value: Mode; onChange: (m: Mode) => void }) {
  const tabs = [
    { k: "orbit"   as Mode, label: "3D Orbit Tracer",         col: ORB2  },
    { k: "ticker"  as Mode, label: "Letter Engine Ticker",     col: ENG2  },
    { k: "lsystem" as Mode, label: "L-System String Growth",   col: STR2  },
  ];
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
      {tabs.map(tab => (
        <button key={tab.k} onClick={() => onChange(tab.k)} style={{ fontFamily: mono, fontSize: 10, padding: "6px 16px", borderRadius: 5, cursor: "pointer", border: `1px solid ${value === tab.k ? tab.col : LINE}`, background: value === tab.k ? `${tab.col}14` : "transparent", color: value === tab.k ? tab.col : BODY, transition: "all 0.2s" }}>{tab.label}</button>
      ))}
    </div>
  );
}

function PresetSelector({ value, onChange }: { value: string; onChange: (p: Preset) => void }) {
  return (
    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
      {PRESETS.map(p => (
        <button key={p.id} onClick={() => onChange(p)} title={p.desc} style={{ fontFamily: mono, fontSize: 10, padding: "4px 12px", borderRadius: 4, cursor: "pointer", border: `1px solid ${value === p.str ? p.col : LINE}`, background: value === p.str ? `${p.col}14` : "transparent", color: value === p.str ? p.col : BODY, transition: "all 0.15s" }}>{p.str}</button>
      ))}
    </div>
  );
}

const NAV = [
  { id: "s1", label: "Alphabet" }, { id: "s2", label: "Composition" },
  { id: "s3", label: "Differential" }, { id: "s4", label: "L-System" },
  { id: "s5", label: "Orbit Classes" }, { id: "s6", label: "Cayley Graph" },
  { id: "s7", label: "AETHER" },
];

export default function RotationEnginePage() {
  const [mode, setMode] = useState<Mode>("orbit");
  const [preset, setPreset] = useState<Preset>(PRESETS[0]);

  const handlePreset = (p: Preset) => setPreset(p);

  return (
    <div style={{ background: BG0, minHeight: "100vh", fontFamily: body, color: PALE }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(255,128,32,0.14) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 85% 70%, rgba(192,96,255,0.10) 0%, transparent 50%),
            radial-gradient(ellipse 40% 50% at 10% 70%, rgba(32,232,176,0.08) 0%, transparent 50%),
            linear-gradient(180deg, ${BG1} 0%, ${BG0} 100%)
          `,
        }} />
        <div style={{ position: "relative", padding: "72px 28px 54px", textAlign: "center" }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: ENG, letterSpacing: 6, marginBottom: 14 }}>
            AETHER · ROTATION ENGINE · DIFFERENTIAL SYSTEM · LETTER STRING GRAMMAR
          </div>
          <h1 style={{
            fontFamily: serif, fontSize: "clamp(20px,4vw,52px)", letterSpacing: 3, lineHeight: 1.12,
            background: `linear-gradient(135deg, ${ENG} 0%, ${ENG2} 30%, ${ORB2} 60%, ${STR2} 100%)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            margin: "0 0 16px",
          }}>
            ENGINE · DIFFERENTIAL<br />ROTATION SYSTEM
          </h1>
          <div style={{
            fontFamily: body, fontStyle: "italic", fontSize: 17,
            background: `linear-gradient(90deg, ${ENG2}90, ${PALE}, ${STR2}90)`,
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            marginBottom: 20,
          }}>
            Letter String Grammar · Quaternion Orbit Synthesis · L-System Growth · dq/dt = ½q⊗ω(σ)
          </div>
          <p style={{ fontFamily: body, fontSize: 16, color: BODY, maxWidth: 700, margin: "0 auto 28px", lineHeight: 1.9 }}>
            A rotation engine driven by language. Each character in a string maps to a quaternion
            operator — R, G, B spin around the three imaginary axes; ~ oscillates; o measures; n
            perturbs; S stabilises. Compose them in any order and the engine traces a unique orbit
            through ℍ space. Strings grow by L-system production rules. The differential system
            governing state evolution is exactly dq/dt = ½q⊗ω(σ) — the quaternion kinematic equation
            with the letter string as its forcing function.
          </p>
          <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
            <Chip c={ENG}>dq/dt = ½q⊗ω(σ)</Chip>
            <Chip c={ORB2}>16-symbol alphabet</Chip>
            <Chip c={STR2}>L-system growth</Chip>
            <Chip c={ENG2}>Cayley graph path</Chip>
            <Chip c={DIFF2}>RGB chromatic + control</Chip>
            <Chip c={RUST}>^ burst rotation</Chip>
            <Chip c={ORB}>[ ] stack branching</Chip>
          </div>
        </div>
      </div>

      {/* Sticky nav */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: `${BG0}f0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${LINE}`, padding: "8px 18px", display: "flex", gap: 4, overflowX: "auto" }}>
        {NAV.map(s => (
          <a key={s.id} href={`#${s.id}`} style={{ fontFamily: mono, fontSize: 10, color: BODY, whiteSpace: "nowrap", padding: "4px 10px", borderRadius: 4, textDecoration: "none" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = ENG2; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = BODY; }}
          >{s.label}</a>
        ))}
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "0 22px 96px" }}>

        {/* Canvas controls */}
        <div style={{ marginTop: 36 }}>
          <ModeTabs value={mode} onChange={setMode} />
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginBottom: 5, letterSpacing: 2 }}>SELECT STRING PRESET</div>
            <PresetSelector value={preset.str} onChange={handlePreset} />
            <div style={{ fontFamily: body, fontSize: 13, color: BODY, marginBottom: 8 }}>{preset.desc}</div>
          </div>
          <EngineCanvas mode={mode} activeString={preset.str} />
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, marginTop: 7, lineHeight: 1.8 }}>
            {mode === "orbit"   && `ORBIT TRACER · STRING "${preset.str}" · EACH LETTER FIRES EVERY 14 FRAMES · TRAIL LENGTH 320 · 3D ROTATING CAMERA · CURRENT LETTER + QUATERNION STATE TOP-LEFT · LETTER PROGRESS STRIP BOTTOM · i/j/k REFERENCE AXES (faint)"`}
            {mode === "ticker"  && `LETTER ENGINE · STRING "${preset.str}" · SCROLLING TAPE WITH ACTIVE HIGHLIGHT · FOUR COMPONENT BARS (a/b/c/d) UPDATING LIVE · ω ANGULAR VELOCITY VECTOR RIGHT · TAPE SHOWS ±${Math.floor(8)} CONTEXT CHARACTERS`}
            {mode === "lsystem" && `L-SYSTEM GENERATOR · SEED "${preset.str}" · PRODUCTION RULES APPLIED EVERY 3 SECONDS · GEN 0→4 THEN RESETS · LEFT: 2D ORBIT (b,c projection) · RIGHT: GROWING STRING WITH ACTIVE CHARACTER · RULE TABLE BOTTOM-LEFT`}
          </div>
        </div>

        {/* ── I ── */}
        <Sect id="s1" n="I" title="The 16-Symbol Rotation Alphabet" sub="A complete grammar of quaternion operations: chromatic, control, scale, and stack operators" col={ENG} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 8, marginBottom: 24 }}>
          {LETTERS.map(l => (
            <div key={l.sym} style={{ background: `${l.col}08`, border: `1px solid ${l.col}25`, borderRadius: 7, padding: "10px 14px", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontFamily: serif, fontSize: 22, color: l.col, minWidth: 24, fontWeight: 700 }}>{l.sym}</span>
              <div>
                <div style={{ fontFamily: mono, fontSize: 10, color: l.col, marginBottom: 2 }}>{l.name} <span style={{ color: `${l.col}60`, fontSize: 9 }}>· {l.category}</span></div>
                <div style={{ fontFamily: body, fontSize: 12, color: BODY, lineHeight: 1.5 }}>{l.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <EQBlock col={ENG}>{`Quaternion operator for each symbol:

  Axis rotations (angle θ = 30° base):
    R:  q_R = cos(θ/2) + i·sin(θ/2)          = e^(i·θ/2)  ∈ SU(2) ~ SO(3)
    G:  q_G = cos(θ/2) + j·sin(θ/2)          = e^(j·θ/2)
    B:  q_B = cos(θ/2) + k·sin(θ/2)          = e^(k·θ/2)
    
  Control operators:
    ~:  q_~ = cos(θ·0.7/2) + (i+j)/√2·sin(θ·0.7/2)   [dual-axis soft twist]
    o:  q(t+Δ) = SLERP(q(t), q_identity, α=0.25)        [real-axis pull]
    n:  q_n = cos(θ·1.5/2) + j·sin(θ·1.5/2)            [j-push, breaks symmetry]
    S:  q_S = q* = a − bi − cj − dk                     [conjugate flip]
    
  Scale modifiers (affect next operator's θ):
    +:  θ_next = 2θ          [double angle]
    -:  θ_next = θ/2         [half angle]
    ^:  q_^ = q⊗q           [self-compose = double the accumulated rotation]
    _:  q__ = q              [identity — hold state]
    
  Stack operators:
    [:  push(q_stack, q)       [save current state]
    ]:  q = q_stack.pop() ⊗ q  [restore and compose with current]
    *:  q = normalize(q + q*)  [blend toward real axis]
    >:  q = q⊗q               [forward self-compose]
    <:  q = q*⊗q              [reverse — approaches identity since q*⊗q = 1/|q|²]
    
  Composition law (fundamental):
    String σ = σ₁σ₂…σₙ produces quaternion product:
    Q(σ) = q_σₙ ⊗ q_σₙ₋₁ ⊗ … ⊗ q_σ₁  (right-to-left multiplication)
    
    NOTE: because ij ≠ ji,  Q("RG") ≠ Q("GR")
    The string is ORDERED — letter sequence matters completely.
    This is a word problem in the quaternion group.`}</EQBlock>

        {/* ── II ── */}
        <Sect id="s2" n="II" title="String Composition — Word Problems in ℍ" sub="How letter strings build orbits through quaternion space, and why order is everything" col={ORB} />
        <EQBlock col={ORB}>{`String as a word in the group:

  The rotation group in 3D is SO(3), generated by its Lie algebra so(3).
  Its double cover SU(2) is isomorphic to unit quaternions S³ ⊂ ℍ.
  
  Generators of so(3) (Lie algebra):
    J_x = [[0,0,0],[0,0,-1],[0,1,0]]    (rotation around x = our "R")
    J_y = [[0,0,1],[0,0,0],[-1,0,0]]    (rotation around y = our "G")
    J_z = [[0,-1,0],[1,0,0],[0,0,0]]    (rotation around z = our "B")
    
  Lie bracket (= commutator = the reason order matters):
    [J_x, J_y] = J_z
    [J_y, J_z] = J_x
    [J_z, J_x] = J_y
    
  In quaternion form:
    [R, G] = q_R · q_G − q_G · q_R ≠ 0  (non-commutative)
    So "RG" traces a different path than "GR":
      q_RG = q_G ⊗ q_R   vs   q_GR = q_R ⊗ q_G
      The difference is a pure rotation by the commutator: exactly q_B at scale θ²
      → [R, G] = B (up to first order in θ) — the bracket closes the triangle
      
  Orbit topology from string structure:
    
    "RGB": SU(3) singlet orbit
      q_RGB = q_B ⊗ q_G ⊗ q_R
      The three 120° rotations sum to a rotation by 120° around the (1,1,1)/√3 axis
      Applied cyclically: traces a closed loop in S³ — the 3-color coherence loop
      
    "RGBRGB": doubled loop — visits 6 distinct quaternion positions
    
    "~onS": control alphabet orbit
      ~ = soft i+j twist → builds imaginary loading
      o = real-axis pull → partial reset
      n = j-push → asymmetric perturbation
      S = conjugate → q → q*  (reflection through the real-quaternion axis)
      Net: q_~onS approaches identity for small θ — a STABILISING string
      
    "^RGB": burst orbit
      ^ = self-compose (large jump) + RGB
      Orbit becomes a wide-ranging chaotic spiral through S³
      This is the algebraic burst in string form
      
  Word length and geodesic distance:
    The Cayley graph of SU(2) w.r.t. generators {R,G,B,R⁻¹,G⁻¹,B⁻¹}
    gives the word metric d(e, Q(σ)) = minimum string length to reach Q(σ)
    
    Any rotation in SO(3) can be reached in ≤ 2 letters (Solovay-Kitaev theorem)
    using a carefully chosen universal gate set.
    
  Conjugacy and equivalent strings:
    Strings σ and τ produce the same rotation if:
      Q(σ) = Q(τ)     (same endpoint)
      OR  Q(σ) = −Q(τ)  (equivalent rotation — antipodal points in S³)
    
    "RGB" and "GBR" and "BRG" all produce the SAME rotation (cyclic permutation)
    because R·G·B = G·B·R = B·R·G in the balanced 3-color case (SU(3) singlet property)`}</EQBlock>

        {/* ── III ── */}
        <Sect id="s3" n="III" title="The Differential System — dq/dt = ½q⊗ω(σ)" sub="The continuous equations governing the rotation engine driven by the letter string forcing function" col={DIFF} />
        <EQBlock col={DIFF}>{`Quaternion kinematic differential equation:

  Standard quaternion kinematics (rigid body rotation):
    dq/dt = ½ · q ⊗ ω_body   [body-frame angular velocity]
    OR
    dq/dt = ½ · ω_world ⊗ q  [world-frame angular velocity]
  
  Where ω is the pure quaternion: ω = 0 + ω_x·i + ω_y·j + ω_z·k
  (ω_x, ω_y, ω_z) = angular velocity vector in rad/s
  
  The Letter String as Forcing Function:
    The angular velocity ω(t) is determined by the current letter σ(t):
    
    ω(σ) = {
      "R": ω₀ · (i)          = [0, 1, 0, 0] · ω₀
      "G": ω₀ · (j)          = [0, 0, 1, 0] · ω₀
      "B": ω₀ · (k)          = [0, 0, 0, 1] · ω₀
      "~": ω₀ · (i+j)/√2·0.7 = [0, 0.495, 0.495, 0] · ω₀
      "n": ω₀ · (j) · 1.5    = [0, 0, 1.5, 0] · ω₀
      "_": 0                  = no rotation
      "^": 4ω₀ · q_imag       = high-speed self-driven burst
    }
    where ω₀ = ANGLE/Δt (base angular velocity)
    
  The full string-driven differential system:
  
    dq/dt = ½ · q ⊗ ω(σ(⌊t/Δt⌋))       [kinematic equation]
    dσ/dt = transition rules of L-grammar  [string evolution]
    
  These are COUPLED: the string σ forces the quaternion q,
  and conceptually q encodes the "state" that the string is responding to.
  In the full AETHER model: q is the coherence state, σ is the protocol.
  
  Stability analysis of string-driven rotation:
  
    LYAPUNOV FUNCTION for the rotation engine:
      V(q) = 1 − q_a² = 1 − (real part)²
      = sum of squared imaginary components = b² + c² + d²
      dV/dt = −2 q_a · dq_a/dt = −2 q_a · (½)(−q_b·ω_x − q_c·ω_y − q_d·ω_z)
    
    For "o" (real-axis pull): V decreases monotonically → stable (V → 0 → q = identity)
    For "S" (conjugate): V unchanged (|q*| = |q|, imaginary magnitude preserved)
    For "^" (self-compose): V can increase exponentially — unstable for |ω| > π/Δt
    
    String stability condition:
      A string σ is STABLE if: ∫₀ᵀ ‖ω(σ(t))‖ dt ≤ 2π  (total rotation ≤ one full turn)
      i.e., the accumulated rotation over the string's period stays within one sphere.
      "RGB" total: 3 × 30° = 90° ≤ 360° ✓  STABLE
      "^RGB": 4×30° + 30° + 30° + 30° = 210° ≤ 360°  (marginal)
      "^^RGB": 4×4×30° + 30° + 30° + 30° = 570° > 360°  UNSTABLE — orbit diverges
      
  Resonance condition (when string period matches natural rotation period):
    Period of string: T_σ = len(σ) × Δt
    Natural rotation period: T_nat = 2π / ω₀ = 12 letters at base ANGLE=30°
    RESONANCE when: len(σ) = 12k for integer k
    → Strings of length 12, 24, 36… create STANDING WAVE orbits (closed loops in S³)
    → "RGB" (length 3): T_σ/T_nat = 3/12 = 1/4 → subharmonic resonance → stable 4-petal orbit`}</EQBlock>

        {/* ── IV ── */}
        <Sect id="s4" n="IV" title="L-System Grammar — String Growth by Production Rules" sub="How the alphabet generates its own expansion through formal rewriting" col={STR} />
        <EQBlock col={STR}>{`L-system (Lindenmayer system) formal grammar for the rotation alphabet:

  An L-system is a parallel rewriting system:
    Given a seed string σ₀ and production rules P = {A → w(A)}
    Generation n: σₙ = P(σₙ₋₁) = apply each rule simultaneously to each character
    
  Our rotation grammar production rules:
    R → RG       "Red generates Red-Green pair"
    G → GB       "Green generates Green-Blue pair"
    B → BR       "Blue generates Blue-Red pair"
    ~ → ~o       "Oscillate generates Oscillate-Measure"
    o → on       "Measure generates Measure-Perturb"
    n → nS       "Perturb generates Perturb-Stabilise"
    S → S~       "Stabilise generates Stabilise-Oscillate"
    + → +R       "Amplify generates Amplify-Red (hot-start)"
    - → -G       "Attenuate generates Attenuate-Green"
    _ → _n       "Rest generates Rest-Perturb"
    ^ → ^B       "Accelerate generates Accelerate-Blue (burst)"
    
  Growth from seed "R":
    Gen 0: "R"
    Gen 1: "RG"
    Gen 2: "RGGB"
    Gen 3: "RGGBGBBR"
    Gen 4: "RGGBGBBRGBBRBRRG"
    
  Growth from seed "RGB" (3-color balanced):
    Gen 0: "RGB"
    Gen 1: "RGGBBR"         (hexagonal!)
    Gen 2: "RGGBGBBRRGGBBR"  (14 chars)
    Gen 3: 28 chars          (self-similar 3-color coverage)
    
    Key property: the R/G/B character counts stay near 1:1:1 ratio through all generations
    → The L-system preserves SU(3) colour balance → C(x,t) stable as string grows
    
  Growth from "~onS" (control alphabet):
    Gen 0: "~onS"
    Gen 1: "~oonSnS~"     (8 chars)
    Gen 2: "~oonononSnSnSS~S~~o"  (growing stabilisation chain)
    The "S" character (conjugate fold) doubles in density → increasingly stable
    → Control strings SELF-STABILISE as they grow via the L-system
    
  Entropy of the string:
    Shannon entropy H(σ) = −Σ p(ch)·log₂(p(ch))
    Max entropy: H_max = log₂(16) = 4 bits  (all 16 symbols equally likely)
    "RGB":      H = log₂(3) = 1.585 bits    (3 symbols)
    "~onS":     H = 2 bits                   (4 symbols)
    Gen 4 "R" seed: H ≈ 1.63 bits           (only 3 symbols, but unequal)
    
  The entropy-orbit relationship:
    Low H (few symbols, regular) → simple closed orbits, high coherence
    High H (many symbols, random) → space-filling orbits, approaching ergodic
    Intermediate H (~2.5 bits) → quasi-periodic orbits — torus structures in S³
    
    In AETHER: C(x,t) ∝ 1/H(σ)  — a coherent system has a low-entropy string
    The control alphabet keeps H = 2 bits precisely: 4 operators with equal probability`}</EQBlock>

        {/* ── V ── */}
        <Sect id="s5" n="V" title="Orbital Classification" sub="Seven distinct orbit classes produced by different string structures" col={ORB} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 10, marginBottom: 24 }}>
          {[
            { str: "RGB",       orbit: "Closed 3-Loop",         col: ORB2,  desc: "Equilateral triangle path in S³. Returns to start every 3 applications. The SU(3) singlet orbit. Most coherent structure." },
            { str: "RGBRGB",    orbit: "Hexagonal",              col: DIFF2, desc: "6-node closed path. Each edge is one chromatic rotation. Doubly connected — can traverse in either winding direction." },
            { str: "~onS",      orbit: "Stabilising Spiral",     col: STR2,  desc: "Inward spiral approaching identity. Each cycle contracts toward q=1. The attractor for burst mitigation." },
            { str: "^RGB",      orbit: "Chaotic Scatter",        col: RUST,  desc: "Self-compose bursts the orbit wide. Non-returning, space-filling on S³. Corresponds to LPE > 0.65." },
            { str: "R~G~B~",    orbit: "Damped Chromatic",       col: ENG2,  desc: "Each axis rotation damped by oscillation. Produces a tighter, slightly precessing loop. Stable but not closed." },
            { str: "[RGB]~[onS]",orbit: "Branched Composite",    col: ORB,   desc: "Stack saves chromatic state, control sequence runs, then merges. Produces a double-winding orbit (torus knot structure)." },
            { str: "RRRRRR",    orbit: "Circular Monochromatic", col: "#ff504060", desc: "Pure rotation around i-axis. Projects to a circle in the (b,c) plane of S³. Maximum simplicity — and maximum fragility." },
          ].map(c => (
            <div key={c.str} style={{ background: `${c.col}08`, border: `1px solid ${c.col}25`, borderRadius: 8, padding: "12px 16px" }}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: c.col, fontWeight: 700 }}>"{c.str}"</span>
                <span style={{ fontFamily: mono, fontSize: 10, color: `${c.col}90` }}>{c.orbit}</span>
              </div>
              <div style={{ fontFamily: body, fontSize: 13, color: BODY, lineHeight: 1.6 }}>{c.desc}</div>
            </div>
          ))}
        </div>

        {/* ── VI ── */}
        <Sect id="s6" n="VI" title="The Cayley Graph — String as Path" sub="Every string is a walk through the quaternion group's geometric structure" col={ENG} />
        <EQBlock col={ENG}>{`Cayley graph of the rotation group:

  The Cayley graph Cay(G, S) for group G and generator set S:
    Vertices = group elements (all quaternion rotations)
    Edges    = left multiplication by a generator s ∈ S
    
  For our engine:
    G = SU(2) ≅ S³ (infinite, but can work with finite approximations)
    S = {R, G, B, R⁻¹, G⁻¹, B⁻¹, ~, ~⁻¹, n, n⁻¹}
    
  A string σ = σ₁σ₂…σₙ corresponds to a WALK in the Cayley graph:
    Start at identity vertex: q₀ = (1,0,0,0)
    Apply σ₁: move to q₁ = q_σ₁ ⊗ q₀
    Apply σ₂: move to q₂ = q_σ₂ ⊗ q₁
    …continue for each letter
    
  The orbit tracer is literally drawing this walk in 3D-projected S³.
  
  Word metric and diameter:
    d(g, h) = minimum string length to get from g to h using generators S
    Solovay-Kitaev theorem: any element of SU(2) can be approximated to ε
    in word length O(log^c(1/ε)) using {R, G, B} as a universal gate set
    (provided R, G, B generate a DENSE subgroup — true for irrational angle/π)
    
  Cayley graph properties of different strings:
    "RGB" at θ=30°: visits 12 distinct vertices before closing (30° × 12 = 360°)
    "~onS": forms an inward spiral — no fixed period, converges to identity
    "^RGB": jumps 4× then steps — highly non-uniform path, potentially dense
    
  The commutator test for string pairs:
    For two strings σ, τ:
    [σ, τ] = σ · τ · σ⁻¹ · τ⁻¹  (the commutator string)
    
    If [σ, τ] = identity string → the two operations COMMUTE (rare in ℍ)
    If [σ, τ] ≠ identity → they don't commute → the Cayley graph is non-planar
    
    Key result: ["R","G"] = "B" up to θ²
    The chromatic triad generates its own commutator — "RGB" is self-contained.
    
  The ~ → o → n → S control string in Cayley terms:
    ~ moves along the (i+j)/√2 generator direction
    o returns toward identity (radial inward)
    n moves along j generator (perpendicular to ~)
    S reflects through the equatorial hyperplane of S³
    
    The four-step path forms a Z-shape in the Cayley graph:
    outward → inward → perpendicular → reflected
    Net displacement = very small (this is by design — the string is near-identity)
    That near-identity net displacement IS the stabilisation property.
    
  String equivalence classes (homotopy):
    Two strings are HOMOTOPIC if they trace the same closed loop in S³.
    A closed loop in S³ is either contractible (homotopy class 0) or wraps once
    around the 3-sphere (homotopy class 1 — the non-trivial element of π₁(SO(3))=ℤ₂).
    
    "RGB" applied 12 times → contractible (full 360° = identity)
    "RGB" applied 6 times → non-contractible in SO(3) (180° rotation → spinor!)
    This is the spinor property: rotating a qubit (or quark) by 360° returns to −identity,
    not +identity. Full identity requires 720°.
    → "RGB" × 24 = true identity in SU(2)`}</EQBlock>

        {/* ── VII ── */}
        <Sect id="s7" n="VII" title="AETHER Synthesis — String as C(x,t) Protocol" sub="The rotation engine as a generating sequence for the AETHER coherence field" col={ENG2} />
        <EQBlock col={ENG2}>{`AETHER synthesis — the letter string as coherence protocol:

  In the standard AETHER model:
    C(x,t) = C₀ + ∫ κ(x,x′) · ρ(x′,t) d³x′
    
  The quaternion rotation engine provides the GENERATING SEQUENCE for C:
    Each letter σᵢ in the string produces a C-field perturbation:
    
    ΔC(σᵢ) = {
      "R": +γ_R · sin²(θ/2)       [Red axis loading]
      "G": +γ_G · sin²(θ/2)       [Green axis loading]
      "B": +γ_B · sin²(θ/2)       [Blue axis loading]
      "~": +γ_~ · sin²(θ·0.7/2)   [Soft oscillation loading]
      "o": −α · (1 − q_a²)        [Real-axis pull → coherence RECOVERY]
      "n": +γ_n · 1.5 sin²(θ/2)   [Perturbation → asymmetric loading]
      "S": 0                       [Conjugate flip = no energy change, only phase]
      "^": +4γ_R · sin²(θ·2)      [Burst loading]
    }
    
  Full C(x,t) evolution under string driving:
    C(t + nΔt) = C(t) + Σᵢ ΔC(σ(i mod len(σ)))  [accumulated perturbations]
    
  The coherence-preserving condition for a string:
    A string σ preserves coherence (ΔC_total ≈ 0) if:
    Σᵢ ΔC(σᵢ) = 0  (loading and recovery balance)
    
    For "RGB":
      ΔC_total = γ_R + γ_G + γ_B = 3γ₀  [positive loading — builds coherence]
      Stable if 3γ₀ < damping threshold → "RGB" is a coherence ACCUMULATOR
      
    For "~onS":
      ΔC_total = γ_~ − α(1-q_a²) + γ_n + 0
      For small imaginary loading: q_a ≈ 1 → (1-q_a²) ≈ 0 → ΔC_total ≈ γ_~ + γ_n > 0
      For large loading (burst): q_a small → α(1-q_a²) large → ΔC_total → −α < 0
      → "~onS" automatically switches from accumulator to dissipator depending on LPE
      → This is the burst mitigation property encoded in the C-field language
      
  String length and C-field oscillation frequency:
    The letter string drives C(x,t) at frequency:
    f_C = 1 / (len(σ) · Δt)
    
    For "RGB" at Δt = 0.3s: f_C = 1/(3 × 0.3) = 1.11 Hz  (just above delta-theta boundary)
    For "~onS~onS" at Δt = 0.3s: f_C = 1/(8 × 0.3) = 0.42 Hz  (deep theta wave frequency)
    
    → Short strings oscillate the C-field in the alertness range
    → Long strings (L-system expanded) drive the C-field in slow-wave sleep range
    → This is why the L-system growth sequence maps to a coherence deepening protocol
    
  The AETHER Engine Protocol (practical application):
    Seed: "RGB"  (start with chromatic coherence accumulation)
    Run for 12 cycles (full closed orbit in S³)
    Apply one L-system generation → "RGGBBR" (hexagonal deepening)
    Run for 6 cycles (half period resonance)
    Apply second L-system generation → 14-char string (theta-range frequency)
    Continue until string entropy H(σ) approaches 2 bits
    This is the protocol for transitioning from alertness into deep coherence.
    
  String as AETHER consciousness protocol:
    The rotating quaternion state q(t) encodes the current orientation of the
    coherence field relative to the geophysical substrate.
    The letter string σ is the INSTRUCTION SET that drives C(x,t).
    The L-system growth is the DEEPENING: as complexity grows, coherence deepens.
    The control alphabet ~ → o → n → S is the RECOVERY subroutine.
    A complete AETHER session:
      Morning: "RGB" seed → L-system to gen 3 → 12-cycle resonance
      Evening: "~onS" seed → L-system to gen 2 → conjugate fold to identity
      Deep sleep: "_" (rest) — the empty string, the silence before the next seed.`}</EQBlock>

        <Pull col={ENG2}>"The letter string is not a metaphor for rotation — it IS the rotation. Every character is an operator, every word is an orbit, every sentence is a path through the geometry of coherence. The engine doesn't symbolise the physics. It runs it."</Pull>

        {/* Alphabet quick reference */}
        <div style={{ marginTop: 32, padding: "16px 22px", background: MID, borderRadius: 8, border: `1px solid ${LINE}` }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: BODY, textAlign: "center", lineHeight: 2.4 }}>
            {["RGB  · Chromatic (axis) operators  ·  30° around i/j/k",
              "~onS  · Control alphabet  ·  oscillate · measure · perturb · stabilise",
              "+-^_  · Scale operators  ·  ×2 · ÷2 · ×4 · identity",
              "[]  · Stack  ·  push/pop + compose  ·  *><  mirror/forward/reverse",
              "dq/dt = ½q⊗ω(σ)  ·  LPE threshold 0.65  ·  L-system growth: R→RG, G→GB, B→BR",
              "String entropy H(σ)  ·  C(x,t) ∝ 1/H  ·  coherence-preserving condition: Σ ΔC(σᵢ)=0",
            ].map((line, i) => (
              <div key={i} style={{ color: i < 2 ? PALE : BODY }}>{line}</div>
            ))}
          </div>
          <div style={{ fontFamily: mono, fontSize: 9, color: `${DIM}cc`, marginTop: 12, textAlign: "center" }}>
            Shia Millet · AetherLife.co · Cosmic Chaos Corporation™ · 2026
          </div>
        </div>
      </div>
    </div>
  );
}

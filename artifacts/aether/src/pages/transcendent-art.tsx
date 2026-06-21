import { useEffect, useRef, useState } from "react";

/* ── Palette ─────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";

/* ══════════════════════════════════════════════════════
   CANVAS 1 — SUPERPOSITION FIELD
   Multiple ψ waves → interference → double-slit → collapse
══════════════════════════════════════════════════════ */
function SuperpositionCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    /* double-slit accumulation dots */
    interface SlitDot { x: number; y: number; alpha: number; col: string }
    const slitDots: SlitDot[] = [];
    const SLIT_X = W * 0.72;

    /* wave sources (two slits) */
    const SLIT_Y1 = H * 0.40, SLIT_Y2 = H * 0.60;
    const SLIT_SRC_X = W * 0.52;

    let t = 0, collapseT = 0, isCollapsed = false;
    const COLLAPSE_INTERVAL = 420;

    const waveNum = (lam: number) => (2 * Math.PI) / lam;

    /* draw a snapshot of |ψ|² interference pattern on the screen plane */
    const buildInterference = () => {
      const screenX = SLIT_X + 2;
      const k = waveNum(90); // wave-number
      for (let py = 4; py < H - 4; py += 3) {
        const r1 = Math.sqrt((screenX - SLIT_SRC_X) ** 2 + (py - SLIT_Y1) ** 2);
        const r2 = Math.sqrt((screenX - SLIT_SRC_X) ** 2 + (py - SLIT_Y2) ** 2);
        const psi = Math.cos(k * r1 - t * 0.06) + Math.cos(k * r2 - t * 0.06);
        const prob = psi * psi / 4; // 0..1
        if (Math.random() < prob * 0.06) {
          slitDots.push({
            x: SLIT_X + 4 + Math.random() * (W - SLIT_X - 8),
            y: py + (Math.random() - 0.5) * 3,
            alpha: 0.5 + Math.random() * 0.4,
            col: prob > 0.7 ? TEAL : prob > 0.3 ? BLUE : VIO,
          });
          if (slitDots.length > 1800) slitDots.shift();
        }
      }
    };

    const draw = () => {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* ── background gradient field ── */
      const bg = ctx.createLinearGradient(0, 0, W, 0);
      bg.addColorStop(0, "rgba(0,10,30,0.6)"); bg.addColorStop(0.5, "rgba(0,4,20,0.0)");
      bg.addColorStop(1, "rgba(0,20,40,0.4)");
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      /* collapse logic */
      if (t % COLLAPSE_INTERVAL === 0) {
        isCollapsed = true; collapseT = 0; setCollapsed(true);
        slitDots.length = 0;
      }
      if (isCollapsed) {
        collapseT++;
        if (collapseT > 60) { isCollapsed = false; setCollapsed(false); }
      }

      const collapseAlpha = isCollapsed ? Math.max(0, 1 - collapseT / 60) : 0;
      const waveAlpha = isCollapsed ? collapseT / 60 : 1;

      /* ── THREE OVERLAPPING ψ WAVES ── */
      const waves = [
        { A: 28, k: 0.055, ω: 0.04, φ: 0,           col: TEAL, y0: H * 0.35 },
        { A: 22, k: 0.042, ω: 0.03, φ: Math.PI/3,   col: VIO,  y0: H * 0.50 },
        { A: 18, k: 0.071, ω: 0.05, φ: Math.PI*0.7, col: BLUE, y0: H * 0.65 },
      ];

      /* Superposition line */
      ctx.save(); ctx.globalAlpha = waveAlpha;
      ctx.beginPath();
      for (let x = 4; x < SLIT_SRC_X; x += 2) {
        const ψ = waves.reduce((s, w) => s + w.A * Math.sin(w.k * x - w.ω * t + w.φ), 0);
        if (x === 4) ctx.moveTo(x, H/2 + ψ); else ctx.lineTo(x, H/2 + ψ);
      }
      ctx.strokeStyle = `rgba(255,255,255,0.85)`; ctx.lineWidth = 1.8; ctx.stroke();

      /* Individual component waves */
      for (const w of waves) {
        ctx.beginPath();
        for (let x = 4; x < SLIT_SRC_X; x += 2) {
          const ψ = w.A * Math.sin(w.k * x - w.ω * t + w.φ);
          if (x === 4) ctx.moveTo(x, w.y0 + ψ); else ctx.lineTo(x, w.y0 + ψ);
        }
        ctx.strokeStyle = w.col + "70"; ctx.lineWidth = 1.2; ctx.stroke();
      }
      ctx.restore();

      /* ── PROBABILITY DENSITY FIELD |ψ|² ── */
      ctx.save(); ctx.globalAlpha = waveAlpha * 0.22;
      const ψ_max = waves.reduce((s, w) => s + w.A, 0);
      for (let x = 4; x < SLIT_SRC_X; x += 4) {
        const ψ_sum = waves.reduce((s, w) => s + w.A * Math.sin(w.k * x - w.ω * t + w.φ), 0);
        const prob = (ψ_sum / ψ_max) ** 2;
        ctx.fillStyle = prob > 0 ? `rgba(46,240,216,${prob * 0.6})` : `rgba(153,102,255,${-prob * 0.4})`;
        ctx.fillRect(x - 2, H/2 - ψ_sum, 4, ψ_sum * 2);
      }
      ctx.restore();

      /* ── BARRIER + SLITS ── */
      ctx.fillStyle = "#0a1428"; ctx.fillRect(SLIT_SRC_X - 2, 0, 5, H);
      ctx.fillStyle = BG; ctx.fillRect(SLIT_SRC_X - 3, SLIT_Y1 - 10, 7, 20);
      ctx.fillStyle = BG; ctx.fillRect(SLIT_SRC_X - 3, SLIT_Y2 - 10, 7, 20);
      ctx.strokeStyle = `${TEAL}60`; ctx.lineWidth = 1;
      ctx.strokeRect(SLIT_SRC_X - 2, 0, 5, H);

      /* Slit labels */
      ctx.font = `7px ${mono}`; ctx.textAlign = "right"; ctx.textBaseline = "middle";
      ctx.fillStyle = `${TEAL}80`; ctx.fillText("slit₁", SLIT_SRC_X - 6, SLIT_Y1);
      ctx.fillText("slit₂", SLIT_SRC_X - 6, SLIT_Y2);

      /* ── INTERFERENCE PATTERN (two-source) ── */
      ctx.save(); ctx.globalAlpha = waveAlpha * 0.18;
      const k2 = waveNum(90);
      for (let x = SLIT_SRC_X + 6; x < SLIT_X; x += 4) {
        for (let y = 4; y < H - 4; y += 4) {
          const r1 = Math.sqrt((x - SLIT_SRC_X) ** 2 + (y - SLIT_Y1) ** 2);
          const r2 = Math.sqrt((x - SLIT_SRC_X) ** 2 + (y - SLIT_Y2) ** 2);
          const psi = Math.cos(k2 * r1 - t * 0.06) + Math.cos(k2 * r2 - t * 0.06);
          const p = psi * psi / 4;
          if (p > 0.55) {
            ctx.fillStyle = `rgba(46,240,216,${p * 0.65})`;
            ctx.fillRect(x - 2, y - 2, 4, 4);
          }
        }
      }
      ctx.restore();

      /* Screen */
      ctx.fillStyle = "#0a1428"; ctx.fillRect(SLIT_X, 0, 3, H);
      ctx.strokeStyle = `${GOLD}40`; ctx.lineWidth = 0.8; ctx.strokeRect(SLIT_X, 0, 3, H);
      ctx.font = `6px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${GOLD}60`; ctx.fillText("SCREEN", SLIT_X + 5, 6);

      /* ── ACCUMULATED DOTS ── */
      buildInterference();
      ctx.save(); ctx.globalAlpha = waveAlpha;
      for (const d of slitDots) {
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = d.col + Math.round(d.alpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
      }
      ctx.restore();

      /* ── COLLAPSE FLASH ── */
      if (isCollapsed && collapseAlpha > 0) {
        const pulse = collapseAlpha;
        ctx.save(); ctx.globalAlpha = pulse * 0.7;
        ctx.fillStyle = GOLD;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
        const collapseY = SLIT_Y1 + Math.random() * (SLIT_Y2 - SLIT_Y1);
        const cg = ctx.createRadialGradient(SLIT_X - 4, collapseY, 0, SLIT_X - 4, collapseY, 80 * pulse);
        cg.addColorStop(0, `rgba(255,255,220,${pulse})`);
        cg.addColorStop(1, `rgba(255,255,220,0)`);
        ctx.fillStyle = cg; ctx.beginPath();
        ctx.arc(SLIT_X - 4, collapseY, 80 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.font = `10px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(255,240,180,${pulse})`; ctx.fillText("COLLAPSE", W * 0.3, H / 2);
        ctx.font = `8px ${mono}`; ctx.fillStyle = `rgba(255,240,180,${pulse * 0.8})`;
        ctx.fillText("ψ → |x⟩  EIGENSTATE SELECTED", W * 0.3, H / 2 + 16);
      }

      /* ── LABELS ── */
      ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      const labs = [
        { x: 6,  y: 6,  col: `${TEAL}80`, t: "ψ(x,t) = Σ aᵢψᵢ  SUPERPOSITION" },
        { x: 6,  y: 18, col: `${VIO}70`,  t: "|ψ|² = probability density" },
        { x: 6,  y: 30, col: `${BLUE}60`, t: `k = 2π/λ  ·  ω = 2πf` },
        { x: 6,  y: 42, col: `${GOLD}60`, t: `Δx·Δp ≥ ℏ/2  UNCERTAINTY` },
      ];
      for (const l of labs) {
        ctx.fillStyle = l.col; ctx.fillText(l.t, l.x, l.y);
      }
      ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${TEAL}50`; ctx.fillText(`dots: ${slitDots.length}`, 6, H - 6);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ position:"relative" }}>
      <canvas ref={cvRef} width={700} height={320}
        style={{ width:"100%", maxWidth:700, borderRadius:12,
          border:`1px solid ${TEAL}20`, background:BG,
          boxShadow:"0 0 60px rgba(0,0,0,0.9)" }} />
      {collapsed && (
        <div style={{ position:"absolute", top:8, right:12,
          fontFamily:mono, fontSize:9, color:GOLD,
          background:"rgba(0,0,0,0.7)", padding:"3px 8px", borderRadius:4,
          border:`1px solid ${GOLD}40` }}>
          WAVEFUNCTION COLLAPSED
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS 2 — SUPERNOVA NUCLEOSYNTHESIS
   Core collapse → shockwave → element synthesis → nebula
══════════════════════════════════════════════════════ */
function SupernovaCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [phase, setPhase] = useState<"stable"|"collapse"|"shockwave"|"nebula">("stable");

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;
    const cx = W / 2, cy = H / 2;

    /* elements synthesized in a supernova */
    const ELEMENTS = [
      { sym:"H",  col:"#7cc8ff", r_proc: false, mass:1  },
      { sym:"He", col:TEAL,      r_proc: false, mass:4  },
      { sym:"C",  col:GRN,       r_proc: false, mass:12 },
      { sym:"O",  col:BLUE,      r_proc: false, mass:16 },
      { sym:"Ne", col:AMB,       r_proc: false, mass:20 },
      { sym:"Si", col:ROSE,      r_proc: false, mass:28 },
      { sym:"Fe", col:GOLD,      r_proc: false, mass:56 },
      { sym:"Ni", col:GOLD,      r_proc: false, mass:58 },
      { sym:"Au", col:"#ffd700", r_proc: true,  mass:197},
      { sym:"Pt", col:"#e5e4e2", r_proc: true,  mass:195},
      { sym:"U",  col:VIO,       r_proc: true,  mass:238},
    ];

    interface Eject { x:number; y:number; vx:number; vy:number; sym:string; col:string; life:number; maxLife:number; r_proc:boolean }
    const ejecta: Eject[] = [];

    interface Ring { r:number; dr:number; alpha:number; col:string; label:string }
    const rings: Ring[] = [];

    let t = 0;
    let phaseT = 0;
    let currentPhase: "stable"|"collapse"|"shockwave"|"nebula" = "stable";
    const PHASE_LEN = { stable: 180, collapse: 80, shockwave: 240, nebula: 300 };

    const nextPhase = () => {
      const seq: Array<"stable"|"collapse"|"shockwave"|"nebula"> = ["stable","collapse","shockwave","nebula"];
      const idx = seq.indexOf(currentPhase);
      currentPhase = seq[(idx + 1) % seq.length];
      phaseT = 0;
      setPhase(currentPhase);
      if (currentPhase === "shockwave") {
        ejecta.length = 0; rings.length = 0;
        /* spawn element ejecta */
        for (let k = 0; k < 120; k++) {
          const el = ELEMENTS[Math.floor(Math.random() * ELEMENTS.length)];
          const angle = Math.random() * Math.PI * 2;
          const speed = 1.5 + Math.random() * 3.5 + (el.r_proc ? 2.5 : 0);
          ejecta.push({
            x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
            sym: el.sym, col: el.col, r_proc: el.r_proc,
            life: 0, maxLife: 200 + Math.random() * 100,
          });
        }
        /* expanding rings */
        rings.push({ r: 0, dr: 3.5, alpha: 0.9, col: ROSE,  label: "shock" });
        rings.push({ r: 0, dr: 2.5, alpha: 0.7, col: AMB,   label: "C/O"   });
        rings.push({ r: 0, dr: 1.8, alpha: 0.6, col: GOLD,  label: "Fe"    });
        rings.push({ r: 0, dr: 1.2, alpha: 0.5, col: VIO,   label: "r-proc" });
      }
    };

    const draw = () => {
      t++; phaseT++;
      if (phaseT >= PHASE_LEN[currentPhase]) nextPhase();

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* starfield */
      if (t === 1) {
        for (let k = 0; k < 200; k++) {
          const sx = Math.random() * W, sy = Math.random() * H;
          const sr = 0.4 + Math.random() * 1.0;
          ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.4})`; ctx.fill();
        }
      }

      /* ── STABLE phase ── */
      if (currentPhase === "stable") {
        const pulse = 0.92 + 0.08 * Math.sin(t * 0.04);
        const R = 55 * pulse;
        const corona = ctx.createRadialGradient(cx, cy, R * 0.5, cx, cy, R * 3);
        corona.addColorStop(0, `rgba(255,200,50,0.5)`);
        corona.addColorStop(0.4, `rgba(255,120,0,0.25)`);
        corona.addColorStop(1, "rgba(255,80,0,0)");
        ctx.fillStyle = corona; ctx.beginPath(); ctx.arc(cx, cy, R * 3, 0, Math.PI * 2); ctx.fill();

        const sg = ctx.createRadialGradient(cx - 8, cy - 8, 0, cx, cy, R);
        sg.addColorStop(0, "#fffde0"); sg.addColorStop(0.4, "#ffe060"); sg.addColorStop(1, "#ff8010");
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fillStyle = sg; ctx.fill();

        /* surface convection cells */
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2 + t * 0.008;
          const cr = R * (0.7 + 0.3 * Math.sin(a * 3 + t * 0.02));
          const cell_x = cx + Math.cos(a) * cr * 0.6, cell_y = cy + Math.sin(a) * cr * 0.6;
          ctx.beginPath(); ctx.arc(cell_x, cell_y, R * 0.12, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,160,0,0.35)`; ctx.fill();
        }

        ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = `${GOLD}80`; ctx.fillText(`M★ = 20 M☉  ·  MAIN SEQUENCE RED SUPERGIANT`, cx, 8);
        ctx.fillStyle = `${AMB}60`; ctx.fillText(`T_core ≈ 3×10⁹ K  ·  Si→Fe burning final stage`, cx, 20);

        const eta = 1 - phaseT / PHASE_LEN.stable;
        ctx.font = `7px ${mono}`; ctx.fillStyle = `${ROSE}80`;
        ctx.fillText(`CHANDRASEKHAR LIMIT APPROACH: ${(eta * 100).toFixed(0)}% remaining`, cx, H - 16);
      }

      /* ── COLLAPSE phase ── */
      if (currentPhase === "collapse") {
        const prog = phaseT / PHASE_LEN.collapse;
        const R = 55 * (1 - prog * 0.85);
        const compR = 12 + R * 0.3;

        /* imploding shells */
        for (let k = 4; k >= 1; k--) {
          const ir = R * k * 0.35 * (1 - prog * 0.6);
          ctx.beginPath(); ctx.arc(cx, cy, ir, 0, Math.PI * 2);
          ctx.strokeStyle = k === 1 ? `rgba(255,80,0,${0.6 + 0.4 * prog})`
            : `rgba(255,200,50,${0.3 - prog * 0.2})`; ctx.lineWidth = 1.5; ctx.stroke();
        }

        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, compR);
        cg.addColorStop(0, "#ffffff"); cg.addColorStop(0.3, "#fffde0");
        cg.addColorStop(1, `rgba(255,120,0,${0.6 + 0.4 * prog})`);
        ctx.beginPath(); ctx.arc(cx, cy, compR, 0, Math.PI * 2); ctx.fillStyle = cg; ctx.fill();

        /* gravitational waves (rings imploding inward) */
        for (let k = 0; k < 5; k++) {
          const wr = R * 1.8 * (1 - ((t * 0.04 + k * 0.2) % 1)) * (1 - prog * 0.5);
          if (wr > 0) {
            ctx.beginPath(); ctx.arc(cx, cy, wr, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(153,102,255,${0.3 * (1 - prog)})`; ctx.lineWidth = 0.8; ctx.stroke();
          }
        }

        ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = `${ROSE}90`; ctx.fillText("CORE COLLAPSE  ·  M > 1.44 M☉ CHANDRASEKHAR", cx, 8);
        ctx.fillStyle = `${VIO}80`; ctx.fillText(`ρ_core → 10¹⁷ kg/m³  ·  neutron degeneracy pressure`, cx, 20);
        ctx.fillStyle = `${AMB}80`; ctx.fillText(`τ_collapse ≈ 0.1 s  ·  v_infall → 0.25c`, cx, 32);
      }

      /* ── SHOCKWAVE phase ── */
      if (currentPhase === "shockwave") {
        const prog = phaseT / PHASE_LEN.shockwave;

        /* neutron star remnant */
        const NSG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 10);
        NSG.addColorStop(0, "#ffffff"); NSG.addColorStop(0.5, TEAL); NSG.addColorStop(1, `${TEAL}00`);
        ctx.beginPath(); ctx.arc(cx, cy, 14, 0, Math.PI * 2); ctx.fillStyle = NSG; ctx.fill();
        ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();

        /* expanding rings */
        for (const ring of rings) {
          ring.r += ring.dr;
          ring.alpha = Math.max(0, ring.alpha - 0.003);
          if (ring.r < Math.max(W, H)) {
            ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
            ctx.strokeStyle = ring.col + Math.round(ring.alpha * 255).toString(16).padStart(2,"0");
            ctx.lineWidth = 2.5; ctx.stroke();
            if (ring.r < 180) {
              ctx.font = `6px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
              ctx.fillStyle = ring.col + "80";
              ctx.fillText(ring.label, cx + ring.r * 0.72, cy - ring.r * 0.72);
            }
          }
        }

        /* ejecta particles */
        for (let i = ejecta.length - 1; i >= 0; i--) {
          const e = ejecta[i];
          e.x += e.vx; e.y += e.vy; e.life++;
          e.vx *= 0.998; e.vy *= 0.998;
          if (e.life > e.maxLife || e.x < -20 || e.x > W + 20 || e.y < -20 || e.y > H + 20) {
            ejecta.splice(i, 1); continue;
          }
          const alpha = Math.min(1, (e.maxLife - e.life) / 60);
          const r_size = e.r_proc ? 4 : 3;
          const eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r_size * 2);
          eg.addColorStop(0, e.col + "cc"); eg.addColorStop(1, e.col + "00");
          ctx.beginPath(); ctx.arc(e.x, e.y, r_size * 2, 0, Math.PI * 2);
          ctx.fillStyle = eg; ctx.globalAlpha = alpha; ctx.fill();
          ctx.beginPath(); ctx.arc(e.x, e.y, r_size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = e.col; ctx.fill(); ctx.globalAlpha = 1;
          if (e.life < 40 && e.r_proc) {
            ctx.font = `6px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
            ctx.fillStyle = e.col + "cc"; ctx.globalAlpha = alpha * 0.8;
            ctx.fillText(e.sym, e.x, e.y - 5); ctx.globalAlpha = 1;
          }
        }

        ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = `${ROSE}90`; ctx.fillText("TYPE II SUPERNOVA  ·  E = 10⁴⁴ J  ·  L = 10⁹ L☉", cx, 8);
        ctx.fillStyle = `${GOLD}70`;
        ctx.fillText("r-process: Au · Pt · U  synthesized in neutron-rich ejecta", cx, 20);
        ctx.fillStyle = `${VIO}70`;
        ctx.fillText("s-process: Fe → Ni → Zn → … systematic neutron capture", cx, 32);
      }

      /* ── NEBULA phase ── */
      if (currentPhase === "nebula") {
        const prog = phaseT / PHASE_LEN.nebula;

        /* expanding cloud particles from previous ejecta positions */
        for (const e of ejecta) {
          e.x += e.vx * 0.3; e.y += e.vy * 0.3;
          const dist = Math.sqrt((e.x - cx) ** 2 + (e.y - cy) ** 2);
          const alpha = Math.min(0.5, (dist / 200) * 0.5) * (1 - prog * 0.5);
          const ng = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, 8);
          ng.addColorStop(0, e.col + "55"); ng.addColorStop(1, e.col + "00");
          ctx.fillStyle = ng; ctx.globalAlpha = alpha;
          ctx.beginPath(); ctx.arc(e.x, e.y, 8, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
        }

        /* neutron star pulsar beams */
        const beamA = t * 0.05;
        for (let k = 0; k < 2; k++) {
          const ba = beamA + k * Math.PI;
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(ba);
          const bg2 = ctx.createLinearGradient(0, 0, 160, 0);
          bg2.addColorStop(0, TEAL + "60"); bg2.addColorStop(1, TEAL + "00");
          ctx.fillStyle = bg2; ctx.fillRect(0, -3, 160, 6);
          ctx.restore();
        }

        /* neutron star */
        const NSG2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
        NSG2.addColorStop(0, "#ffffff"); NSG2.addColorStop(1, TEAL);
        ctx.beginPath(); ctx.arc(cx, cy, 8, 0, Math.PI * 2); ctx.fillStyle = NSG2; ctx.fill();

        /* new star formation */
        if (prog > 0.5) {
          const starX = cx + 160 * Math.cos(2.4), starY = cy + 90 * Math.sin(1.1);
          const starR = 10 * ((prog - 0.5) * 2);
          const sfG = ctx.createRadialGradient(starX, starY, 0, starX, starY, starR * 3);
          sfG.addColorStop(0, `rgba(255,240,150,${(prog-0.5)*0.9})`);
          sfG.addColorStop(1, "rgba(255,150,0,0)");
          ctx.fillStyle = sfG; ctx.beginPath(); ctx.arc(starX, starY, starR * 3, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = "#fffde0"; ctx.beginPath(); ctx.arc(starX, starY, starR, 0, Math.PI*2); ctx.fill();
          if (prog > 0.7) {
            ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
            ctx.fillStyle = `${GOLD}90`; ctx.fillText("NEW STAR ★", starX, starY + starR + 4);
          }
        }

        ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = `${TEAL}80`; ctx.fillText("SUPERNOVA REMNANT  ·  NEUTRON STAR PULSAR  ·  NEW STAR FORMING", cx, 8);
        ctx.fillStyle = `${GOLD}60`;
        ctx.fillText("The gold in your ring was forged in this explosion", cx, 20);
        ctx.fillStyle = `${GRN}60`;
        ctx.fillText("The iron in your blood came from a dying star", cx, 32);
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const phaseColor: Record<string, string> = {
    stable:"#ffe060", collapse:ROSE, shockwave:AMB, nebula:TEAL,
  };
  const phaseDesc: Record<string, string> = {
    stable:"Main sequence — Si→Fe burning, Chandrasekhar limit approaching",
    collapse:"Core collapses in 0.1 s — neutron degeneracy pressure halts it",
    shockwave:"10⁴⁴ J released — elements scatter across the galaxy",
    nebula:"Neutron star pulsar + new star forming from the debris",
  };

  return (
    <div style={{ position:"relative" }}>
      <canvas ref={cvRef} width={700} height={360}
        style={{ width:"100%", maxWidth:700, borderRadius:12,
          border:`1px solid ${GOLD}20`, background:BG }} />
      <div style={{ position:"absolute", bottom:10, left:12,
        fontFamily:mono, fontSize:8, color:phaseColor[phase],
        background:"rgba(0,0,0,0.75)", padding:"4px 10px", borderRadius:4,
        border:`1px solid ${phaseColor[phase]}40` }}>
        {phase.toUpperCase()} — {phaseDesc[phase]}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   CANVAS 3 — EXCITATION PATHWAYS · JABLONSKI DIAGRAM
   S₀ → S₁/S₂ → fluorescence / ISC → T₁ → phosphorescence
══════════════════════════════════════════════════════ */
function ExcitationCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const [activeProcess, setActive] = useState("absorption");

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const W = cv.width, H = cv.height;
    const ctx = cv.getContext("2d")!;

    /* energy levels (x=left, y=height in canvas coords, lower y = higher energy) */
    const LVL = {
      S0:  { y: H * 0.82, col: GRN,  label: "S₀ GROUND" },
      S0v: { y: H * 0.72, col: GRN,  label: "S₀ vib" },
      S1:  { y: H * 0.50, col: BLUE, label: "S₁ SINGLET" },
      S1v: { y: H * 0.41, col: BLUE, label: "S₁ vib" },
      S2:  { y: H * 0.22, col: VIO,  label: "S₂ SINGLET" },
      T1:  { y: H * 0.58, col: AMB,  label: "T₁ TRIPLET" },
    };

    const LEVEL_X1 = W * 0.12, LEVEL_X2 = W * 0.50;
    const T_LEVEL_X1 = W * 0.55, T_LEVEL_X2 = W * 0.76;

    /* animated photons & electrons */
    interface Photon { x:number; y:number; tx:number; ty:number; t:number; col:string; type:string }
    interface Electron { x:number; y:number; vy:number; onLevel:string; transitioning:boolean; tProgress:number; ty:number }
    const photons: Photon[] = [];
    const electrons: Electron[] = [
      { x: LEVEL_X1 + (LEVEL_X2 - LEVEL_X1) * 0.5, y: LVL.S0.y - 5, vy: 0,
        onLevel: "S0", transitioning: false, tProgress: 0, ty: LVL.S0.y - 5 },
    ];

    let t = 0;
    type Process = "absorption"|"S2→S1"|"fluorescence"|"ISC"|"phosphorescence"|"vibrational";
    const SEQUENCE: Process[] = ["absorption","S2→S1","vibrational","fluorescence","ISC","phosphorescence"];
    let seqIdx = 0, stepT = 0;
    const STEP_LEN = 120;

    const spawnPhoton = (fromX: number, fromY: number, toX: number, toY: number, col: string, type: string) => {
      photons.push({ x: fromX, y: fromY, tx: toX, ty: toY, t: 0, col, type });
    };

    const drawLevel = (x1: number, x2: number, y: number, col: string, label: string, vib: boolean = false) => {
      ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y);
      ctx.strokeStyle = col; ctx.lineWidth = vib ? 0.8 : 2;
      ctx.setLineDash(vib ? [4, 3] : []); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = `6.5px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "middle";
      ctx.fillStyle = col + "cc"; ctx.fillText(label, x1 - 2, y);
    };

    const drawArrow = (x: number, y1: number, y2: number, col: string, wavy: boolean, label: string) => {
      if (wavy) {
        /* wavy (radiationless) */
        ctx.beginPath();
        const steps = 16;
        for (let k = 0; k <= steps; k++) {
          const py = y1 + (y2 - y1) * (k / steps);
          const px = x + Math.sin(k * 1.2) * 6;
          if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = col + "80"; ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]);
      } else {
        ctx.beginPath(); ctx.moveTo(x, y1); ctx.lineTo(x, y2);
        ctx.strokeStyle = col; ctx.lineWidth = 1.6; ctx.stroke();
        const dir = y2 < y1 ? -1 : 1;
        ctx.beginPath();
        ctx.moveTo(x - 4, y2 - dir * 8);
        ctx.lineTo(x, y2); ctx.lineTo(x + 4, y2 - dir * 8);
        ctx.fillStyle = col; ctx.fill();
      }
      ctx.font = `6px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillStyle = col + "90"; ctx.fillText(label, x + 16, (y1 + y2) / 2);
    };

    const draw = () => {
      t++; stepT++;

      if (stepT >= STEP_LEN) {
        stepT = 0;
        seqIdx = (seqIdx + 1) % SEQUENCE.length;
        setActive(SEQUENCE[seqIdx]);

        const proc = SEQUENCE[seqIdx];
        if (proc === "absorption") {
          spawnPhoton(8, LVL.S0.y - 5, LEVEL_X1 - 10, LVL.S0.y - 5, "#3399ff", "absorption");
        } else if (proc === "fluorescence") {
          spawnPhoton(LEVEL_X2 + 10, LVL.S1.y - 5, W - 8, LVL.S1.y - 5, "#66ddff", "emission");
        } else if (proc === "phosphorescence") {
          spawnPhoton(T_LEVEL_X2 + 10, LVL.T1.y - 5, W - 8, LVL.T1.y - 5, AMB + "dd", "emission");
        }
      }

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* Background energy levels region */
      ctx.fillStyle = "rgba(0,20,40,0.4)"; ctx.fillRect(W * 0.10, 10, W * 0.44, H - 20);
      ctx.fillStyle = "rgba(20,10,40,0.4)"; ctx.fillRect(W * 0.53, 10, W * 0.26, H - 20);

      /* ── SINGLET manifold energy levels ── */
      drawLevel(LEVEL_X1, LEVEL_X2, LVL.S0.y,  LVL.S0.col,  "← S₀");
      drawLevel(LEVEL_X1, LEVEL_X2, LVL.S0v.y, LVL.S0v.col, "← S₀*", true);
      drawLevel(LEVEL_X1, LEVEL_X2, LVL.S1.y,  LVL.S1.col,  "← S₁");
      drawLevel(LEVEL_X1, LEVEL_X2, LVL.S1v.y, LVL.S1v.col, "← S₁*", true);
      drawLevel(LEVEL_X1, LEVEL_X2, LVL.S2.y,  LVL.S2.col,  "← S₂");

      /* ── TRIPLET manifold ── */
      drawLevel(T_LEVEL_X1, T_LEVEL_X2, LVL.T1.y, LVL.T1.col, "← T₁");

      /* Manifold labels */
      ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${BLUE}60`; ctx.fillText("SINGLET", (LEVEL_X1 + LEVEL_X2) / 2, H - 4);
      ctx.fillStyle = `${AMB}60`;  ctx.fillText("TRIPLET", (T_LEVEL_X1 + T_LEVEL_X2) / 2, H - 4);

      /* ── Static pathway arrows ── */
      // Absorption S0 → S2
      drawArrow(LEVEL_X1 + 30, LVL.S0.y, LVL.S2.y, "#3399ff", false, "absorption\n3.5 eV");
      // IC S2 → S1
      drawArrow(LEVEL_X1 + 50, LVL.S2.y, LVL.S1.y, VIO, true, "IC");
      // Vib relax S1* → S1
      drawArrow(LEVEL_X1 + 60, LVL.S1v.y, LVL.S1.y, BLUE, true, "vib");
      // Fluorescence S1 → S0
      drawArrow(LEVEL_X1 + 80, LVL.S1.y, LVL.S0.y, "#66ddff", false, "fluor\n2.7 eV");
      // ISC S1 → T1
      const ISC_X = (LEVEL_X2 + T_LEVEL_X1) / 2;
      ctx.beginPath(); ctx.moveTo(LEVEL_X2, LVL.S1.y); ctx.lineTo(T_LEVEL_X1, LVL.T1.y);
      ctx.strokeStyle = `${ROSE}70`; ctx.lineWidth = 1.2; ctx.setLineDash([4, 3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `6px ${mono}`; ctx.textAlign = "center"; ctx.fillStyle = `${ROSE}80`;
      ctx.fillText("ISC", ISC_X, (LVL.S1.y + LVL.T1.y) / 2);
      // Phosphorescence T1 → S0
      ctx.beginPath(); ctx.moveTo(T_LEVEL_X1, LVL.T1.y); ctx.lineTo(LEVEL_X2, LVL.S0.y);
      ctx.strokeStyle = `${AMB}70`; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = `${AMB}80`; ctx.fillText("phos", (T_LEVEL_X1 + LEVEL_X2) / 2 - 12, (LVL.T1.y + LVL.S0.y) / 2 + 8);

      /* ── Electron on level ── */
      for (const el of electrons) {
        const proc = SEQUENCE[seqIdx];
        /* animate position */
        if (proc === "absorption" && stepT === 60) {
          el.transitioning = true; el.tProgress = 0; el.ty = LVL.S2.y - 5;
        }
        if (proc === "S2→S1" && stepT === 20) {
          el.transitioning = true; el.tProgress = 0; el.ty = LVL.S1.y - 5;
        }
        if (proc === "vibrational" && stepT === 20) {
          el.transitioning = true; el.tProgress = 0; el.ty = LVL.S1.y - 5;
        }
        if (proc === "fluorescence" && stepT === 20) {
          el.transitioning = true; el.tProgress = 0; el.ty = LVL.S0.y - 5;
        }
        if (proc === "ISC" && stepT === 20) {
          el.x = T_LEVEL_X1 + (T_LEVEL_X2 - T_LEVEL_X1) * 0.5;
          el.transitioning = true; el.tProgress = 0; el.ty = LVL.T1.y - 5;
        }
        if (proc === "phosphorescence" && stepT === 40) {
          el.x = LEVEL_X1 + (LEVEL_X2 - LEVEL_X1) * 0.5;
          el.transitioning = true; el.tProgress = 0; el.ty = LVL.S0.y - 5;
        }

        if (el.transitioning) {
          el.tProgress = Math.min(1, el.tProgress + 0.04);
          el.y = el.y + (el.ty - el.y) * 0.08;
          if (el.tProgress >= 1) el.transitioning = false;
        }

        const eg = ctx.createRadialGradient(el.x, el.y, 0, el.x, el.y, 9);
        eg.addColorStop(0, "rgba(255,255,220,0.9)"); eg.addColorStop(1, "rgba(255,255,220,0)");
        ctx.beginPath(); ctx.arc(el.x, el.y, 9, 0, Math.PI * 2); ctx.fillStyle = eg; ctx.fill();
        ctx.beginPath(); ctx.arc(el.x, el.y, 4, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill();
        ctx.font = `6px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillStyle = "#ffffff90"; ctx.fillText("e⁻", el.x, el.y - 6);
      }

      /* ── Photon packets ── */
      for (let i = photons.length - 1; i >= 0; i--) {
        const p = photons[i]; p.t = Math.min(1, p.t + 0.025);
        const ex = p.x + (p.tx - p.x) * p.t;
        const ey = p.y + (p.ty - p.y) * p.t;

        /* draw as wave packet */
        for (let k = -2; k <= 2; k++) {
          const woff = Math.sin((p.t * 20 + k) * 1.4) * 5;
          ctx.beginPath(); ctx.arc(ex + k * 5 - 10 + p.t * 20, ey + woff, 2, 0, Math.PI * 2);
          ctx.fillStyle = p.col + Math.round(0.8 * (1 - Math.abs(k) / 2.5) * 255).toString(16).padStart(2,"0");
          ctx.fill();
        }

        const label = p.type === "absorption" ? "hν ABS" : "hν EMI";
        ctx.font = `6px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillStyle = p.col + "cc"; ctx.fillText(label, ex, ey - 8);

        if (p.t >= 1) photons.splice(i, 1);
      }

      /* ── Right panel: molecule examples ── */
      const RX = W * 0.82, RY = 14;
      ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}80`; ctx.fillText("EXCITATION IN ART", RX, RY);

      const examples = [
        { mol: "Chlorophyll",    col: GRN,  φ: "0.05", τ: "1 ns",  use: "Photosynthesis" },
        { mol: "Firefly lucif.", col: GOLD, φ: "0.41", τ: "10 ns", use: "Bioluminescence" },
        { mol: "Rhodamine B",    col: ROSE, φ: "0.97", τ: "1.7 ns",use: "Laser dye" },
        { mol: "Anthracene",     col: BLUE, φ: "0.27", τ: "5 ns",  use: "Scintillator" },
        { mol: "ZnS:Cu (phos.)",col: AMB,  φ: "—",    τ: "100 ms",use: "Glow-in-dark" },
      ];
      for (let k = 0; k < examples.length; k++) {
        const e = examples[k], ey2 = RY + 22 + k * 42;
        ctx.beginPath(); ctx.arc(RX + 5, ey2 + 4, 5, 0, Math.PI * 2);
        ctx.fillStyle = e.col; ctx.fill();
        ctx.font = `7px ${mono}`; ctx.fillStyle = e.col; ctx.textBaseline = "top";
        ctx.fillText(e.mol, RX + 14, ey2);
        ctx.font = `6px ${mono}`; ctx.fillStyle = DIM + "cc";
        ctx.fillText(`Φ=${e.φ}  τ=${e.τ}`, RX + 14, ey2 + 11);
        ctx.fillText(e.use, RX + 14, ey2 + 22);
      }

      /* Energy axis */
      ctx.beginPath(); ctx.moveTo(W * 0.09, LVL.S2.y - 10); ctx.lineTo(W * 0.09, LVL.S0.y + 14);
      ctx.strokeStyle = `${TEXT}30`; ctx.lineWidth = 1; ctx.stroke();
      ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.save(); ctx.translate(W * 0.06, H / 2); ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = `${TEXT}40`; ctx.fillText("ENERGY", 0, 0); ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const processDesc: Record<string, string> = {
    absorption: "S₀ + hν → S₂ — photon absorbed, electron jumps to upper singlet (E = hν = 3.5 eV)",
    "S2→S1": "S₂ → S₁ internal conversion — ultrafast (10⁻¹³ s), vibrational energy lost as heat",
    vibrational: "S₁* → S₁ vibrational relaxation — electron settles to lowest vibrational level",
    fluorescence: "S₁ → S₀ + hν — photon emitted (Stokes shift: red-shifted vs absorption, ~2.7 eV)",
    ISC: "S₁ → T₁ intersystem crossing — forbidden spin flip (slow), populates triplet state",
    phosphorescence: "T₁ → S₀ + hν — slow emission (ms–s), glow-in-the-dark, room-temp phosphors",
  };

  return (
    <div style={{ position:"relative" }}>
      <canvas ref={cvRef} width={700} height={360}
        style={{ width:"100%", maxWidth:700, borderRadius:12,
          border:`1px solid ${VIO}20`, background:BG }} />
      <div style={{ position:"absolute", bottom:10, left:12,
        fontFamily:mono, fontSize:7, color:TEAL,
        background:"rgba(0,0,0,0.75)", padding:"4px 10px", borderRadius:4,
        border:`1px solid ${TEAL}30`, maxWidth:460 }}>
        {activeProcess.toUpperCase()} — {processDesc[activeProcess]}
      </div>
    </div>
  );
}

/* ── UI helpers ──────────────────────────────────────── */
function SH({ n, title, sub, col=TEAL }: { n:string; title:string; sub:string; col?:string }) {
  return (
    <div style={{ marginTop:56, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:24 }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════ */
export default function TranscendentArtPage() {
  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"56px 24px 32px",
        background:`radial-gradient(ellipse 80% 50% at 50% 0%,
          ${VIO}08, ${ROSE}05, ${GOLD}04, transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:`${VIO}80`, letterSpacing:4, marginBottom:12 }}>
          AETHER · TRANSCENDENT ART · SUPERPOSITION · SUPERNOVA · EXCITATION PATHWAYS
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(22px,4.5vw,52px)",
          color:"#fff", margin:"0 0 10px", letterSpacing:1.5, lineHeight:1.18 }}>
          THE PHYSICS OF
          <span style={{ color:TEAL }}> TRANSCENDENT</span>
          <span style={{ color:GOLD }}> ART</span>
        </h1>
        <div style={{ fontFamily:serif, fontSize:13, color:`${VIO}70`, letterSpacing:3, marginBottom:20 }}>
          Superposition · Supernova · Excitation Pathways · Nature as Canvas
        </div>
        <div style={{ fontFamily:body, fontSize:16.5, color:DIM,
          maxWidth:820, margin:"0 auto", lineHeight:2.1 }}>
          Three physical phenomena define what transcendent art actually
          <span style={{ color:TEAL }}> is</span>, not just what it
          <span style={{ color:VIO }}> means</span>. Superposition is the creative state — all possibilities held
          simultaneously before the collapse of commitment. The supernova is the act — beauty through total
          release, destruction that seeds every future. Excitation is the mechanism — matter absorbing light,
          rising, then emitting something new at a different frequency. Art is
          <span style={{ color:GOLD }}> matter that has been excited</span>.
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── SECTION I ── */}
        <SH n="I" col={TEAL}
          title="Superposition · All Possibilities Simultaneously"
          sub="ψ = Σ aᵢψᵢ — the quantum state holds every option until observation forces a choice" />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <SuperpositionCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:2.0 }}>
              WHITE LINE = ψ_total, the superposition of all component waves · COLORED LINES = individual
              ψ₁ (teal), ψ₂ (violet), ψ₃ (blue) component states · GLOW FIELD = |ψ|² probability density ·
              TWO SLITS produce circular waves that INTERFERE constructively (bright dots) and destructively
              (dark gaps) on the screen · PERIODIC FLASH = wavefunction COLLAPSE — observation forces the
              system into one eigenstate · accumulated DOTS build the interference pattern over time
            </div>
          </div>
          <div style={{ flex:"0 0 270px", display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { eq:"ψ = Σ aᵢψᵢ", col:TEAL,
                desc:"The general state is a linear combination of all possible eigenstates simultaneously. None is 'the state' — all are." },
              { eq:"|ψ|² = probability density", col:BLUE,
                desc:"Born rule: the squared modulus of the wavefunction gives the probability of finding the system at any location. Reality is probabilistic, not deterministic." },
              { eq:"Δx·Δp ≥ ℏ/2", col:VIO,
                desc:"Heisenberg: the more precisely you know position, the less you know momentum. Superposition requires uncertainty. Art requires the same — complete definition kills possibility." },
              { eq:"Collapse: ψ → |n⟩", col:GOLD,
                desc:"Observation selects one eigenstate from the superposition. The artist's mark is the collapse event — infinite possibility → one committed choice." },
              { eq:"E = ℏω  ·  p = ℏk", col:ROSE,
                desc:"Energy and momentum of each component wave. Different frequencies = different eigenstates. A chord is a superposition of pure tones; a painting is a superposition of pure colors." },
            ].map(e => (
              <div key={e.eq} style={{ background:`${e.col}07`, border:`1px solid ${e.col}22`,
                borderRadius:8, padding:"10px 13px" }}>
                <div style={{ fontFamily:mono, fontSize:9, color:e.col, marginBottom:5 }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:12.5, color:DIM, lineHeight:1.75 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Superposition → Art connection */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:18 }}>
          {[
            { title:"Before the Brushstroke", col:TEAL,
              text:"Every unstarted canvas is a superposition. The artist exists in a state of maximal possibility — all marks simultaneously potential. The instant the brush touches the surface, the wavefunction collapses. That contact is the measurement event." },
            { title:"Interference as Composition", col:VIO,
              text:"Harmony in music = constructive interference of frequency components. Discord = destructive interference. A composition is an interference pattern in time. The 'beautiful' chord is one where the overtones reinforce rather than cancel." },
            { title:"The Observer Effect in Art", col:GOLD,
              text:"Schrödinger's insight extends to the gallery: the work is completed by the viewer's observation. Before it is seen, all interpretations exist in superposition. The moment you look, one reading collapses into your experience — and cannot be unmade." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`, border:`1px solid ${c.col}22`,
              borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.85 }}>{c.text}</div>
            </div>
          ))}
        </div>

        {/* ── SECTION II ── */}
        <SH n="II" col={AMB}
          title="Supernova · Destruction Creates Everything"
          sub="M {'>'}  1.44 M☉ → core collapse → 10⁴⁴ J → nucleosynthesis → you" />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <SupernovaCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:2.0 }}>
              STABLE: red supergiant in final Si→Fe burning stage, Chandrasekhar limit approaching ·
              COLLAPSE: core implodes in 0.1 s when iron core exceeds 1.44 M☉, neutron degeneracy pressure
              halts collapse at nuclear density ρ = 10¹⁷ kg/m³ · SHOCKWAVE: 10⁴⁴ joules released,
              TEAL=H/He, GREEN=C/O, GOLD=Fe, VIOLET=r-process elements (Au, Pt, U) ·
              NEBULA: neutron star pulsar spinning + new star forming from the enriched debris cloud
            </div>
          </div>
          <div style={{ flex:"0 0 270px", display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { eq:"M_Ch = 1.44 M☉", col:GOLD,
                desc:"Chandrasekhar limit: above this mass, electron degeneracy pressure cannot support the core against gravity. Collapse is inevitable — and creative." },
              { eq:"E_SN ≈ 10⁴⁴ J", col:ROSE,
                desc:"Total energy of a supernova. 99% is neutrinos; ~1% becomes kinetic energy of the expanding shell — enough to outshine an entire galaxy of 10¹¹ stars for weeks." },
              { eq:"r-process: Fe → Au → U", col:VIO,
                desc:"Rapid neutron capture (r-process) in the neutron-rich ejecta creates all heavy elements above iron: gold, platinum, uranium. Your gold ring was forged in a supernova ≥ 4.5 Gyr ago." },
              { eq:"τ_collapse ≈ 0.1 s", col:AMB,
                desc:"The inner core collapses from ~1000 km to ~10 km in 0.1 seconds. The most violent known event in the universe after the Big Bang. Beauty at maximum intensity." },
              { eq:"s-process: Fe → Zr → Ba", col:BLUE,
                desc:"Slow neutron capture in AGB star envelopes creates elements 30–56 (zinc through barium). Two separate processes; both require stellar death. Elements cost lives." },
            ].map(e => (
              <div key={e.eq} style={{ background:`${e.col}07`, border:`1px solid ${e.col}22`,
                borderRadius:8, padding:"10px 13px" }}>
                <div style={{ fontFamily:mono, fontSize:9, color:e.col, marginBottom:5 }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:12.5, color:DIM, lineHeight:1.75 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:18 }}>
          {[
            { title:"You Are Supernova Ash", col:GOLD,
              text:"Every atom of iron in your blood was forged in a dying star. Every atom of carbon in your body was assembled in stellar fusion or AGB star winds. The calcium in your bones, the oxygen you breathe — all stellar products. You are the universe observing its own nucleosynthesis." },
            { title:"Destruction as Creative Act", col:ROSE,
              text:"The supernova does not destroy the star — it transmutes it. The iron core that ended the star's life becomes the seed of a neutron star. The shockwave that tears the envelope apart scatters the raw material of the next solar system. Maximum violence = maximum creation." },
            { title:"The Artist's Supernova", col:AMB,
              text:"Every major artistic breakthrough is a creative supernova: the artist destroys what they knew how to do in order to create something new. Picasso's cubism was the collapse of perspective. Cage's 4'33\" was the collapse of sound. The Chandrasekhar limit of any creative practice is the threshold past which it must transform or die." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`, border:`1px solid ${c.col}22`,
              borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.85 }}>{c.text}</div>
            </div>
          ))}
        </div>

        {/* ── SECTION III ── */}
        <SH n="III" col={VIO}
          title="Excitation Pathways · Matter Absorbs Light and Becomes Art"
          sub="S₀ + hν → S₁ → fluorescence / ISC → T₁ → phosphorescence · Jablonski diagram" />
        <div style={{ display:"flex", gap:18, flexWrap:"wrap", alignItems:"flex-start" }}>
          <div style={{ flex:"1 1 560px" }}>
            <ExcitationCanvas />
            <div style={{ fontFamily:mono, fontSize:8, color:DIM, marginTop:6, lineHeight:2.0 }}>
              GREEN LEVELS = S₀ ground + vibrational sublevel · BLUE = S₁ first excited singlet ·
              VIOLET = S₂ second excited singlet · ORANGE = T₁ triplet (forbidden spin-flip state) ·
              SOLID ARROWS = radiative transitions (photon in or out) · WAVY ARROWS = radiationless
              (heat lost to solvent/lattice) · WHITE DOT = electron jumping between levels ·
              ANIMATED PHOTON PACKETS travel in from left (absorption) and out to right (emission)
            </div>
          </div>
          <div style={{ flex:"0 0 270px", display:"flex", flexDirection:"column", gap:12 }}>
            {[
              { eq:"E_photon = hν = hc/λ", col:BLUE,
                desc:"The photon's energy determines which transition it can drive. Blue light (λ≈450nm, E≈2.75eV) reaches S₂; red light (λ≈680nm, E≈1.82eV) reaches S₁ directly." },
              { eq:"Stokes shift: λ_emit {'>'}  λ_abs", col:TEAL,
                desc:"Fluorescence is always red-shifted from absorption because energy is lost to vibrational relaxation before emission. This shift is why flowers can absorb UV and emit visible light." },
              { eq:"Φ = k_r / (k_r + k_nr)", col:VIO,
                desc:"Quantum yield: fraction of excited states that produce photons rather than heat. Rhodamine B Φ=0.97 (nearly perfect emitter). Most pigments Φ≈0.01 — most energy becomes heat." },
              { eq:"τ_S₁ ≈ 1–10 ns", col:GRN,
                desc:"Fluorescence lifetime: singlet states decay in nanoseconds. Triplet states (phosphorescence) live milliseconds to seconds — hence glow-in-the-dark materials keep emitting after the light is removed." },
              { eq:"ISC: S₁ → T₁  (forbidden)", col:AMB,
                desc:"Intersystem crossing violates spin conservation (ΔS=1) but occurs via spin-orbit coupling. The 'forbidden' process enables phosphorescence — and is essential in OLED devices." },
            ].map(e => (
              <div key={e.eq} style={{ background:`${e.col}07`, border:`1px solid ${e.col}22`,
                borderRadius:8, padding:"10px 13px" }}>
                <div style={{ fontFamily:mono, fontSize:9, color:e.col, marginBottom:5 }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:12.5, color:DIM, lineHeight:1.75 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginTop:18 }}>
          {[
            { title:"Color IS Excitation", col:VIO,
              text:"Every color you see is a record of an excitation event. The blue of lapis lazuli is the S₀→S₁ transition of the lazurite anion. Vermilion's red is the HgS semiconductor bandgap absorption. Van Gogh's lead white reflects all visible wavelengths because it lacks accessible excited states in the visible range." },
            { title:"The Artist as Quantum Engineer", col:BLUE,
              text:"Choosing a pigment is choosing an excitation pathway. Cadmium yellow (E_gap=2.55eV) absorbs blue/violet, reflects everything redward. Prussian blue has a metal-to-metal charge transfer band. The painter is engineering electronic transitions without knowing it — intuition tracks quantum mechanics." },
            { title:"Bioluminescence as Perfect Art", col:GRN,
              text:"The firefly's luciferin-luciferase reaction is a chemically driven excitation: ATP + O₂ → excited oxyluciferin (S₁) → hν at 557 nm (yellow-green). Quantum yield Φ≈0.41. No heat, only light. The organism has evolved a near-perfect light-emitting excitation pathway — nature's most efficient art." },
          ].map(c => (
            <div key={c.title} style={{ background:`${c.col}07`, border:`1px solid ${c.col}22`,
              borderRadius:10, padding:"14px 16px" }}>
              <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:8 }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.85 }}>{c.text}</div>
            </div>
          ))}
        </div>

        {/* ── SECTION IV ── */}
        <SH n="IV" col={GOLD}
          title="AETHER Synthesis · What Transcendent Art Actually Is"
          sub="Superposition (possibility) → Supernova (release) → Excitation (transmission) — the three-stage model of creation" />
        <div style={{ background:`${GOLD}06`, border:`1px solid ${GOLD}18`,
          borderRadius:12, padding:"24px 28px", marginBottom:24 }}>
          <div style={{ fontFamily:body, fontSize:16, color:TEXT, lineHeight:2.1, marginBottom:16 }}>
            Transcendent art is not an aesthetic quality — it is a
            <span style={{ color:TEAL }}> physical process</span>. The three phenomena above are not metaphors
            for creativity; they are the literal physics of what creation does to matter and to the observer.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16 }}>
            {[
              { n:"01", title:"SUPERPOSITION — the creative state", col:TEAL,
                text:"Before a work is made, the artist holds all possibilities in superposition. This is not a metaphor — neurologically, the prefrontal cortex literally maintains multiple concurrent representations before committing. The creative 'block' is premature collapse. The 'flow state' is sustained superposition: staying in the quantum fog of possibility longer than normal cognition allows." },
              { n:"02", title:"SUPERNOVA — the act of making", col:ROSE,
                text:"The moment of creation is a controlled detonation — maximum energy release producing maximum novelty. Every great work destroys something the artist knew: the comfort of the known style, the safe technique, the familiar subject. The Chandrasekhar limit is the threshold where the accumulated mass of skill and intention must either explode into something new or collapse into repetition." },
              { n:"03", title:"EXCITATION — the transmission", col:VIO,
                text:"The finished work is matter arranged to trigger excitation in the viewer. Color excites retinal pigments (11-cis-retinal photoisomerization). Music excites basilar membrane hair cells. Narrative excites neural predictive models. The work is a pump laser — it is designed to drive the receiver into a specific excited state, from which they emit their own response. Transcendence = the viewer reaches a previously inaccessible energy level." },
            ].map(c => (
              <div key={c.n} style={{ background:`${c.col}08`, border:`1px solid ${c.col}25`,
                borderRadius:10, padding:"16px" }}>
                <div style={{ fontFamily:mono, fontSize:8, color:c.col, marginBottom:6 }}>
                  STAGE {c.n} · {c.title}
                </div>
                <div style={{ fontFamily:body, fontSize:13, color:DIM, lineHeight:1.82 }}>{c.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Master equation */}
        <div style={{ textAlign:"center", padding:"28px",
          background:"#ffffff03", border:`1px solid ${VIO}15`, borderRadius:12 }}>
          <div style={{ fontFamily:serif, fontSize:18, color:VIO, marginBottom:12 }}>
            ART = Ψ_collapse × E_SN × Φ_excitation
          </div>
          <div style={{ fontFamily:mono, fontSize:9, color:DIM, lineHeight:2.8, marginBottom:10 }}>
            {"Ψ_collapse = creative choice made from superposition (dimensionless, 0–1)"}
            {"  ·  "}{"E_SN = energy of destruction / release (joules of commitment)"}
            {"  ·  "}{"Φ_excitation = quantum yield of transmission to the receiver (0–1)"}
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:2.0,
            maxWidth:700, margin:"0 auto" }}>
            Transcendence requires all three to be non-zero. A work with no collapse (uncommitted, everything tentative)
            has Ψ=0. A work with no release (technically perfect but emotionally inert) has E=0. A work that doesn't
            reach the receiver — the wrong frequency, the wrong context — has Φ=0. All zeros → silence.
            All maximal → the work that changes how you see everything after it.
          </div>
        </div>

      </div>
    </div>
  );
}

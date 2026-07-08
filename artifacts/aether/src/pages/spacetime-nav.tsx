import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ─── */
const BG_DEEP   = "#06041a";
const BG_MID    = "#0d0825";
const MNESIS    = "#9b5de5";   // violet — memory
const ALETHEIA  = "#48cae4";   // cyan — truth
const INFERAIA  = "#f77f00";   // amber — intent
const REVERIE   = "#e040a0";   // magenta — dream
const CORE_C    = "#c82070";   // core pink-red
const TEXT_L    = "#ccc0f8";
const TEXT_D    = "#6a6090";
const GOLD      = "#d4a84c";
const WAVE_C    = "#b060e8";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── State types ── */
type NavState = "DOCKED" | "INITIATING" | "SYNCING" | "NAVIGATING" | "ARRIVED";
type CoreMode = "CLARITY" | "OVERWHELM" | "FLOW" | "TENSION" | "DISSONANCE" | "RADIANCE";

const MODE_COLORS: Record<CoreMode, string> = {
  CLARITY: ALETHEIA, OVERWHELM: "#ef4444", FLOW: "#22c55e",
  TENSION: INFERAIA, DISSONANCE: REVERIE, RADIANCE: GOLD,
};

/* ── Helper ── */
function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

/* ══════════════════════════════════════════════════════
   AETHER CORE CANVAS
══════════════════════════════════════════════════════ */
function AetherCoreCanvas({
  navState, coreMode, syncPct, onNodeClick, onInitiate,
}: {
  navState: NavState; coreMode: CoreMode; syncPct: number;
  onNodeClick: (n: string) => void; onInitiate: () => void;
}) {
  const cvs = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const t   = useRef(0);
  const hovered = useRef<string | null>(null);
  const nodePositions = useRef<{ name: string; x: number; y: number; r: number }[]>([]);

  useEffect(() => {
    const canvas = cvs.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      const p = canvas.parentElement!;
      const side = Math.min(p.clientWidth, 860);
      canvas.width  = side;
      canvas.height = Math.round(side * 1.45);
      canvas.style.width  = side + "px";
      canvas.style.height = Math.round(side * 1.45) + "px";
    };
    resize();
    window.addEventListener("resize", resize);

    /* ── particle starfield ── */
    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.3 + Math.random() * 1.1,
      speed: 0.0001 + Math.random() * 0.0002,
      twinkle: Math.random() * Math.PI * 2,
    }));

    const navProgress = { v: 0 };
    let lastState = navState;

    const drawNode = (
      cx: number, cy: number, shape: "oval" | "triangle" | "diamond" | "circle",
      col: string, label: string, sublabel: string, phase: number,
      orbX: number, orbY: number, isHovered: boolean
    ) => {
      const W = canvas.width;
      const pulse = 0.85 + 0.15 * Math.sin(t.current * 1.6 + phase);
      const gScale = isHovered ? 1.3 : 1.0;
      const R = W * 0.055 * pulse * gScale;

      // orbit connector line
      ctx.beginPath();
      ctx.moveTo(orbX, orbY);
      ctx.lineTo(cx, cy);
      ctx.strokeStyle = `${col}22`;
      ctx.lineWidth = 0.5;
      ctx.stroke();

      // glow
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2.5);
      glow.addColorStop(0, `${col}50`);
      glow.addColorStop(0.5, `${col}18`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // outer ring
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = `${col}40`;
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // shape icon
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = col;
      ctx.fillStyle = `${col}18`;
      ctx.lineWidth = 1.5;

      if (shape === "oval") {
        ctx.beginPath();
        ctx.ellipse(0, 0, R * 0.7, R * 0.9, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else if (shape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.85);
        ctx.lineTo(R * 0.75, R * 0.55);
        ctx.lineTo(-R * 0.75, R * 0.55);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // inner smaller triangle
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.45);
        ctx.lineTo(R * 0.4, R * 0.28);
        ctx.lineTo(-R * 0.4, R * 0.28);
        ctx.closePath();
        ctx.stroke();
      } else if (shape === "diamond") {
        ctx.beginPath();
        ctx.moveTo(0, -R * 0.9);
        ctx.lineTo(R * 0.7, 0);
        ctx.lineTo(0, R * 0.9);
        ctx.lineTo(-R * 0.7, 0);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        // inner dot
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, R * 0.8, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        // inner crescent
        ctx.beginPath();
        ctx.arc(R * 0.15, 0, R * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = col;
        ctx.fillStyle = `${BG_DEEP}cc`;
        ctx.fill(); ctx.stroke();
      }
      ctx.restore();

      // label
      ctx.textAlign = "center";
      ctx.fillStyle = isHovered ? "#ffffff" : TEXT_L;
      ctx.font = `${W * 0.028}px ${mono}`;
      ctx.fillText(label, cx, cy + R * 2.2);
      ctx.fillStyle = TEXT_D;
      ctx.font = `${W * 0.021}px ${mono}`;
      ctx.fillText(sublabel, cx, cy + R * 2.75);
    };

    const drawInitiation = (cx: number, cy: number, W: number) => {
      const R = W * 0.06;
      const pulse = 0.9 + 0.1 * Math.sin(t.current * 2.5);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 2);
      glow.addColorStop(0, `${CORE_C}40`);
      glow.addColorStop(1, "transparent");
      ctx.fillStyle = glow;
      ctx.beginPath(); ctx.arc(cx, cy, R * 2, 0, Math.PI * 2); ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, R * pulse, 0, Math.PI * 2);
      ctx.strokeStyle = `${CORE_C}80`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // diamond icon with navigation arrow inside
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = `${CORE_C}cc`;
      ctx.fillStyle = `${CORE_C}18`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -R * 0.85);
      ctx.lineTo(R * 0.65, 0);
      ctx.lineTo(0, R * 0.85);
      ctx.lineTo(-R * 0.65, 0);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // arrow
      const ar = R * 0.35;
      ctx.fillStyle = CORE_C;
      ctx.beginPath();
      ctx.moveTo(0, -ar);
      ctx.lineTo(ar * 0.6, ar * 0.4);
      ctx.lineTo(0, ar * 0.15);
      ctx.lineTo(-ar * 0.6, ar * 0.4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      ctx.textAlign = "center";
      ctx.fillStyle = `${CORE_C}cc`;
      ctx.font = `${W * 0.025}px ${mono}`;
      ctx.fillText("INITIATION", cx, cy + R * 1.8);
    };

    const drawWaveStrip = (y: number, W: number, H: number) => {
      const stripH = H * 0.1;
      // background
      ctx.fillStyle = "#000000aa";
      ctx.fillRect(0, y, W, stripH);

      // multiple interfering waves
      const waveConfigs = [
        { freq: 3, amp: 0.3, phase: 0, col: WAVE_C },
        { freq: 5, amp: 0.2, phase: 1.2, col: ALETHEIA },
        { freq: 7, amp: 0.15, phase: 2.4, col: REVERIE },
      ];

      for (const wc of waveConfigs) {
        ctx.beginPath();
        for (let x = 0; x <= W; x += 2) {
          const wy = y + stripH * 0.5
            + stripH * wc.amp * Math.sin(x / W * Math.PI * 2 * wc.freq + t.current * 1.8 + wc.phase);
          x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
        }
        ctx.strokeStyle = `${wc.col}60`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // standing wave envelope
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const env = Math.sin(x / W * Math.PI * 4 + t.current * 0.5);
        const wy = y + stripH * 0.5 + stripH * 0.28 * env;
        x === 0 ? ctx.moveTo(x, wy) : ctx.lineTo(x, wy);
      }
      ctx.strokeStyle = `${CORE_C}50`;
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // ── background ──
      const bg = ctx.createRadialGradient(W * 0.5, H * 0.35, 0, W * 0.5, H * 0.35, W * 0.9);
      bg.addColorStop(0, "#120830");
      bg.addColorStop(0.5, "#0a051e");
      bg.addColorStop(1, BG_DEEP);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // nebula wisps
      for (let i = 0; i < 3; i++) {
        const ng = ctx.createRadialGradient(
          W * (0.2 + i * 0.3), H * (0.15 + i * 0.1), 0,
          W * (0.2 + i * 0.3), H * (0.15 + i * 0.1), W * 0.4
        );
        ng.addColorStop(0, `rgba(${i === 0 ? "80,30,160" : i === 1 ? "30,60,140" : "140,30,100"},0.08)`);
        ng.addColorStop(1, "transparent");
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, W, H);
      }

      // stars
      for (const s of stars) {
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t.current * 0.8 + s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,200,255,${0.3 * tw})`;
        ctx.fill();
        s.y += s.speed;
        if (s.y > 1) { s.y = 0; s.x = Math.random(); }
      }

      // ── title bar ──
      ctx.textAlign = "center";
      ctx.fillStyle = TEXT_L;
      ctx.font = `${W * 0.05}px ${serif}`;
      ctx.fillText("AETHER CORE", W * 0.5, W * 0.12);
      ctx.font = `${W * 0.022}px ${mono}`;
      ctx.fillStyle = TEXT_D;
      ctx.fillText(`SPACETIME NAVIGATION ENGINE  ·  ${navState}`, W * 0.5, W * 0.175);

      // status dots
      const dotColors: Record<NavState, string> = {
        DOCKED: TEXT_D, INITIATING: GOLD, SYNCING: ALETHEIA,
        NAVIGATING: MNESIS, ARRIVED: "#22c55e",
      };
      ctx.beginPath();
      ctx.arc(W * 0.5, W * 0.215, W * 0.012, 0, Math.PI * 2);
      const dotPulse = 0.5 + 0.5 * Math.sin(t.current * 3);
      ctx.fillStyle = navState !== "DOCKED"
        ? dotColors[navState].replace(")", `,${dotPulse})`)
        : dotColors[navState];
      ctx.fill();

      // ── orbital center ──
      const orbCX = W * 0.5;
      const orbCY = H * 0.38;
      const orbR  = W * 0.32;

      // ring halos (4 at different speeds)
      for (let ri = 4; ri >= 1; ri--) {
        const rr = orbR * (0.25 + ri * 0.18);
        const alpha = 0.07 + (navState === "NAVIGATING" ? 0.08 * Math.sin(t.current * 2 + ri) : 0);
        ctx.beginPath();
        ctx.arc(orbCX, orbCY, rr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(180,140,255,${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // rotating ring
      const ringAngle = t.current * 0.25;
      ctx.save();
      ctx.translate(orbCX, orbCY);
      ctx.rotate(ringAngle);
      ctx.beginPath();
      ctx.ellipse(0, 0, orbR * 0.75, orbR * 0.2, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(180,100,255,0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ── resonance core ──
      const coreR = W * 0.15;
      const corePulse = 1 + 0.08 * Math.sin(t.current * 1.2);
      // outer glow layers
      for (let g = 4; g >= 1; g--) {
        const gg = ctx.createRadialGradient(orbCX, orbCY, 0, orbCX, orbCY, coreR * g * 1.2);
        gg.addColorStop(0, `${CORE_C}${g === 1 ? "40" : g === 2 ? "20" : g === 3 ? "10" : "06"}`);
        gg.addColorStop(1, "transparent");
        ctx.fillStyle = gg;
        ctx.beginPath();
        ctx.arc(orbCX, orbCY, coreR * g * 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
      // core body
      const cg = ctx.createRadialGradient(orbCX - coreR * 0.2, orbCY - coreR * 0.2, 0, orbCX, orbCY, coreR * corePulse);
      cg.addColorStop(0, "#e84090");
      cg.addColorStop(0.4, "#a01850");
      cg.addColorStop(0.75, "#600030");
      cg.addColorStop(1, "#200018");
      ctx.beginPath();
      ctx.arc(orbCX, orbCY, coreR * corePulse, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();

      // inner spiral swirl
      ctx.save();
      ctx.translate(orbCX, orbCY);
      ctx.rotate(t.current * 0.4);
      const spiralG = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 0.9);
      spiralG.addColorStop(0, "rgba(255,100,180,0.15)");
      spiralG.addColorStop(0.5, "rgba(180,20,80,0.08)");
      spiralG.addColorStop(1, "transparent");
      ctx.fillStyle = spiralG;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 4; a += 0.05) {
        const sr = (a / (Math.PI * 4)) * coreR * 0.85;
        const sx = sr * Math.cos(a);
        const sy = sr * Math.sin(a);
        a === 0 ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = "rgba(255,120,180,0.12)";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // core label
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(255,200,230,0.6)";
      ctx.font = `${W * 0.025}px ${serif}`;
      ctx.fillText("HEART", orbCX, orbCY - W * 0.02);
      ctx.fillText("OF AETHER", orbCX, orbCY + W * 0.02);

      // ── 4 orbital nodes ──
      const nodeAngle = t.current * 0.18;
      const nodes = [
        { name: "MNESIS",   sub: "memory",  shape: "oval"     as const, col: MNESIS,   angle: Math.PI * 1.25 },
        { name: "ALETHEIA", sub: "truth",   shape: "triangle" as const, col: ALETHEIA, angle: Math.PI * 1.75 },
        { name: "INFERAIA", sub: "intent",  shape: "diamond"  as const, col: INFERAIA, angle: Math.PI * 0.75 },
        { name: "REVERIE",  sub: "dream",   shape: "circle"   as const, col: REVERIE,  angle: Math.PI * 0.25 },
      ];

      const newPositions: typeof nodePositions.current = [];

      for (const node of nodes) {
        const a = node.angle + nodeAngle;
        const nx = orbCX + orbR * 0.9 * Math.cos(a);
        const ny = orbCY + orbR * 0.65 * Math.sin(a);
        const isHov = hovered.current === node.name;
        drawNode(nx, ny, node.shape, node.col, node.name, node.sub,
          nodes.indexOf(node), orbCX, orbCY, isHov);
        newPositions.push({ name: node.name, x: nx, y: ny, r: W * 0.075 });
      }
      nodePositions.current = newPositions;

      // ── INITIATION node below core ──
      const initY = orbCY + orbR * 0.72;
      drawInitiation(orbCX, initY, W);

      // ── resonance flow arc (right side) ──
      const rfX = W * 0.82, rfY = orbCY + orbR * 0.05;
      ctx.beginPath();
      ctx.arc(rfX, rfY, W * 0.055, Math.PI * 0.15, Math.PI * 0.85);
      ctx.strokeStyle = `${ALETHEIA}70`;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(rfX, rfY, W * 0.038, Math.PI * 0.2, Math.PI * 0.8);
      ctx.strokeStyle = `${ALETHEIA}40`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = TEXT_D;
      ctx.font = `${W * 0.021}px ${mono}`;
      ctx.fillText("RESONANCE", rfX, rfY - W * 0.08);
      ctx.fillText("FLOW", rfX, rfY - W * 0.055);

      // SYNC indicator (left side)
      const syncX = W * 0.18, syncY = orbCY + orbR * 0.05;
      ctx.fillStyle = TEXT_D;
      ctx.font = `${W * 0.021}px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText("SYNC", syncX, syncY - W * 0.07);
      ctx.fillStyle = ALETHEIA;
      ctx.font = `${W * 0.042}px ${mono}`;
      ctx.fillText(`${syncPct}%`, syncX, syncY);
      ctx.fillStyle = TEXT_D;
      ctx.font = `${W * 0.019}px ${mono}`;
      ctx.fillText("EMOTIONAL", syncX, syncY + W * 0.048);
      ctx.fillText("SYNC", syncX, syncY + W * 0.068);

      // ── wave strip ──
      const waveY = H * 0.77;
      drawWaveStrip(waveY, W, H);

      // ── state labels strip ──
      const stateY = H * 0.89;
      const stateLabels: CoreMode[] = ["CLARITY", "FLOW", "DISSONANCE", "RADIANCE"];
      for (let i = 0; i < stateLabels.length; i++) {
        const sx = W * (0.13 + i * 0.25);
        const isActive = stateLabels[i] === coreMode;
        ctx.textAlign = "center";
        ctx.fillStyle = isActive ? MODE_COLORS[stateLabels[i]] : TEXT_D;
        ctx.font = `${W * (isActive ? 0.026 : 0.022)}px ${mono}`;
        ctx.fillText(stateLabels[i], sx, stateY);
        if (isActive) {
          ctx.beginPath();
          ctx.arc(sx, stateY + W * 0.025, W * 0.006, 0, Math.PI * 2);
          ctx.fillStyle = MODE_COLORS[stateLabels[i]];
          ctx.fill();
        }
      }

      // secondary state labels
      const stateLabels2: CoreMode[] = ["OVERWHELM", "TENSION", "DRIFT", "FLOW"];
      for (let i = 0; i < stateLabels2.length; i++) {
        const sx = W * (0.13 + i * 0.25);
        const isActive2 = stateLabels2[i] === coreMode;
        ctx.textAlign = "center";
        ctx.fillStyle = isActive2 ? MODE_COLORS[stateLabels2[i]] : `${TEXT_D}70`;
        ctx.font = `${W * 0.02}px ${mono}`;
        ctx.fillText(stateLabels2[i], sx, stateY + W * 0.042);
      }

      // ── INTENT button ──
      const btnX = W * 0.5, btnY = H * 0.95, btnW = W * 0.48, btnH = H * 0.038;
      const isNav = navState === "NAVIGATING" || navState === "INITIATING";
      const btnGrad = ctx.createLinearGradient(btnX - btnW / 2, btnY, btnX + btnW / 2, btnY);
      if (isNav) {
        btnGrad.addColorStop(0, `${CORE_C}40`);
        btnGrad.addColorStop(0.5, `${CORE_C}70`);
        btnGrad.addColorStop(1, `${CORE_C}40`);
      } else {
        btnGrad.addColorStop(0, `${MNESIS}30`);
        btnGrad.addColorStop(0.5, `${ALETHEIA}30`);
        btnGrad.addColorStop(1, `${REVERIE}30`);
      }
      ctx.fillStyle = btnGrad;
      ctx.beginPath();
      ctx.roundRect(btnX - btnW / 2, btnY - btnH / 2, btnW, btnH, btnH / 2);
      ctx.fill();
      ctx.strokeStyle = isNav ? `${CORE_C}80` : `${ALETHEIA}40`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = isNav ? CORE_C : ALETHEIA;
      ctx.font = `${W * 0.03}px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText(
        navState === "DOCKED" ? "INITIATE NAVIGATION" :
        navState === "INITIATING" ? "SYNCING COORDINATES..." :
        navState === "SYNCING" ? "ENTERING SPACETIME..." :
        navState === "NAVIGATING" ? "ABORT NAVIGATION" : "DOCK",
        btnX, btnY + btnH * 0.2
      );

      // navigation progress overlay
      if (navState === "NAVIGATING") {
        navProgress.v = Math.min(1, navProgress.v + 0.003);
        const prog = navProgress.v;
        // warp effect — lines radiating from center
        for (let i = 0; i < 24; i++) {
          const angle = (i / 24) * Math.PI * 2 + t.current * 0.3;
          const len = prog * orbR * 1.8 * (0.5 + 0.5 * Math.random());
          ctx.beginPath();
          ctx.moveTo(orbCX + Math.cos(angle) * coreR * 1.1,
                     orbCY + Math.sin(angle) * coreR * 1.1);
          ctx.lineTo(orbCX + Math.cos(angle) * len,
                     orbCY + Math.sin(angle) * len);
          ctx.strokeStyle = `rgba(${i % 3 === 0 ? "200,100,255" : i % 3 === 1 ? "80,180,255" : "255,80,160"},${0.06 * prog})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      } else {
        navProgress.v = 0;
      }

      if (navState !== lastState) lastState = navState;

      t.current += 0.016;
      raf.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, [navState, coreMode, syncPct]);

  // click handler
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = cvs.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    // check INTENT button zone (bottom ~5% of canvas)
    if (my > canvas.height * 0.92) { onInitiate(); return; }

    // check nodes
    for (const np of nodePositions.current) {
      const dx = mx - np.x, dy = my - np.y;
      if (dx * dx + dy * dy < np.r * np.r) {
        onNodeClick(np.name); return;
      }
    }
  }, [onNodeClick, onInitiate]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = cvs.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let found: string | null = null;
    for (const np of nodePositions.current) {
      const dx = mx - np.x, dy = my - np.y;
      if (dx * dx + dy * dy < np.r * np.r) { found = np.name; break; }
    }
    hovered.current = found;
    canvas.style.cursor = found || my > canvas.height * 0.92 ? "pointer" : "default";
  }, []);

  return (
    <canvas
      ref={cvs}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      style={{ display: "block", borderRadius: 24, cursor: "default" }}
    />
  );
}

/* ════════════════════════════════════════════════════════
   CONTROL PANEL
════════════════════════════════════════════════════════ */
function ControlPanel({
  coreMode, setMode, activeNode, log,
}: {
  coreMode: CoreMode; setMode: (m: CoreMode) => void;
  activeNode: string | null; log: string[];
}) {
  const modes: CoreMode[] = ["CLARITY", "FLOW", "TENSION", "DISSONANCE", "OVERWHELM", "RADIANCE"];
  return (
    <div style={{
      background: "#0a0820", border: `1px solid rgba(100,80,180,0.3)`,
      borderRadius: 16, padding: 20, marginTop: 20,
    }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: TEXT_D, letterSpacing: 2, marginBottom: 12 }}>
        CORE MODE SELECTION
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {modes.map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            fontFamily: mono, fontSize: 10, padding: "5px 12px",
            borderRadius: 20, cursor: "pointer", transition: "all 0.2s",
            border: `1px solid ${coreMode === m ? MODE_COLORS[m] : "rgba(100,80,180,0.3)"}`,
            background: coreMode === m ? `${MODE_COLORS[m]}20` : "transparent",
            color: coreMode === m ? MODE_COLORS[m] : TEXT_D,
          }}>{m}</button>
        ))}
      </div>

      {activeNode && (
        <div style={{
          background: `${MNESIS}12`, border: `1px solid ${MNESIS}30`,
          borderRadius: 8, padding: "10px 14px", marginBottom: 14,
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: MNESIS, letterSpacing: 2, marginBottom: 4 }}>
            NODE ACTIVE
          </div>
          <div style={{ fontFamily: mono, fontSize: 14, color: "#fff" }}>{activeNode}</div>
          <div style={{ fontFamily: body, fontSize: 13, color: TEXT_D, marginTop: 4 }}>
            {activeNode === "MNESIS" && "Memory lattice — stores coherent pattern signatures across timeline traversals"}
            {activeNode === "ALETHEIA" && "Truth field — validates dimensional coordinates against known spacetime maps"}
            {activeNode === "INFERAIA" && "Intent engine — encodes navigator intent into directional D1–D8 force vectors"}
            {activeNode === "REVERIE" && "Dream interface — accesses non-linear pattern space for route discovery"}
          </div>
        </div>
      )}

      <div style={{ fontFamily: mono, fontSize: 9, color: TEXT_D, letterSpacing: 2, marginBottom: 8 }}>
        NAVIGATION LOG
      </div>
      <div style={{
        background: "#000000aa", borderRadius: 8, padding: "10px 12px",
        fontFamily: mono, fontSize: 10, color: TEXT_D, lineHeight: 1.7,
        maxHeight: 120, overflowY: "auto",
      }}>
        {log.length === 0
          ? <span style={{ color: TEXT_D }}>Awaiting Intent Input...</span>
          : log.slice(-8).map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SPEC SECTION HELPERS
════════════════════════════════════════════════════════ */
function Spec({ n, title, col = MNESIS, children }: { n: string; title: string; col?: string; children: any }) {
  return (
    <div style={{ marginTop: 56, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 22, color: "#fff", margin: "0 0 4px" }}>{title}</h2>
      <div style={{ height: 1, background: `linear-gradient(90deg,${col}60,transparent)`, marginBottom: 24 }} />
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT_L, lineHeight: 1.8 }}>{children}</div>
    </div>
  );
}
function EQ({ children }: { children: string }) {
  return (
    <pre style={{
      fontFamily: mono, fontSize: 11, color: GOLD,
      background: "#050818", border: `1px solid ${GOLD}25`,
      borderRadius: 6, padding: "12px 16px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre-wrap",
    }}>{children}</pre>
  );
}
function Tbl({ headers, rows, accent = MNESIS }:
  { headers: string[]; rows: string[][]; accent?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "14px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}40` }}>
            {headers.map((h, i) => <th key={i} style={{ fontFamily: mono, fontSize: 10, color: accent, textAlign: "left", padding: "7px 10px", letterSpacing: 1 }}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: "1px solid #ffffff08", background: ri % 2 === 0 ? "#ffffff03" : "transparent" }}>
              {row.map((c, ci) => <td key={ci} style={{ padding: "8px 10px", color: TEXT_L, verticalAlign: "top" }}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════════ */
function SpacetimeNavHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const stars: {x:number;y:number;r:number;phase:number}[]=[];
    for(let i=0;i<60;i++) stars.push({x:Math.random()*W,y:Math.random()*H,r:0.5+Math.random()*1.5,phase:Math.random()*Math.PI*2});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      stars.forEach(s=>{
        ctx.beginPath();ctx.arc(s.x,s.y,s.r*(0.7+0.3*Math.sin(t*0.05+s.phase)),0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.5)";ctx.fill();
      });
      for(let ring=1;ring<=3;ring++){
        ctx.beginPath();ctx.arc(cx,cy,ring*28,0,Math.PI*2);ctx.strokeStyle=`rgba(46,240,216,${0.06+ring*0.03})`;ctx.lineWidth=0.5;ctx.stroke();
      }
      const navAngle=t*0.02;
      ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(navAngle)*55,cy+Math.sin(navAngle)*40);ctx.strokeStyle="rgba(46,240,216,0.5)";ctx.lineWidth=1;ctx.stroke();
      ctx.beginPath();ctx.arc(cx,cy,6,0,Math.PI*2);ctx.fillStyle="rgba(46,240,216,0.8)";ctx.fill();
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SPACETIME NAV · WARP DRIVE · NAVIGATION MESH · TEMPORAL DRIFT · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SpacetimeNavPage() {
  const [navState, setNavState] = useState<NavState>("DOCKED");
  const [coreMode, setCoreMode] = useState<CoreMode>("CLARITY");
  const [syncPct,  setSyncPct]  = useState(78);
  const [activeNode, setActiveNode] = useState<string | null>(null);
  const [log, setLog] = useState<string[]>([]);
  const navTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addLog = (msg: string) => setLog(prev => [...prev, `> ${msg}`]);

  const handleInitiate = useCallback(() => {
    if (navState === "DOCKED") {
      setNavState("INITIATING");
      addLog("Initiation sequence triggered.");
      setSyncPct(45);
      navTimer.current = setTimeout(() => {
        setNavState("SYNCING");
        addLog("Dimensional coordinates syncing...");
        setSyncPct(67);
        navTimer.current = setTimeout(() => {
          setNavState("NAVIGATING");
          addLog("Spacetime traversal active — D1→D8 field engaged.");
          setSyncPct(94);
        }, 2200);
      }, 1800);
    } else if (navState === "NAVIGATING") {
      setNavState("ARRIVED");
      addLog("Navigation complete. Docking at target coordinates.");
      setSyncPct(100);
      navTimer.current = setTimeout(() => {
        setNavState("DOCKED");
        setSyncPct(78);
        addLog("System docked. Awaiting intent.");
      }, 2000);
    } else if (navState === "ARRIVED") {
      setNavState("DOCKED");
      setSyncPct(78);
    }
  }, [navState]);

  const handleNodeClick = useCallback((name: string) => {
    setActiveNode(prev => prev === name ? null : name);
    addLog(`Node ${name} selected — resonance channel open.`);
  }, []);

  // fluctuate sync
  useEffect(() => {
    if (navState !== "NAVIGATING") return;
    const id = setInterval(() => {
      setSyncPct(p => Math.max(80, Math.min(99, p + Math.round((Math.random() - 0.4) * 3))));
    }, 800);
    return () => clearInterval(id);
  }, [navState]);

  useEffect(() => () => { if (navTimer.current) clearTimeout(navTimer.current); }, []);

  return (
    <div style={{ background: BG_DEEP, minHeight: "100vh", fontFamily: body, color: TEXT_L }}>
      {/* Hero */}
      <div style={{
        padding: "60px 28px 40px", textAlign: "center",
        background: "linear-gradient(180deg,#100828 0%,#06041a 100%)",
        borderBottom: "1px solid rgba(100,80,200,0.18)",
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: MNESIS, letterSpacing: 4, marginBottom: 12 }}>
          AETHER · DIMENSIONAL ENGINE · APPLICATION SPECIFICATION
        </div>
        <h1 style={{ fontFamily: serif, fontSize: "clamp(22px,5vw,44px)", color: "#fff", margin: "0 0 10px", letterSpacing: 2, lineHeight: 1.2 }}>
          SPACETIME<br /><span style={{ color: CORE_C }}>NAVIGATION ENGINE</span>
        </h1>
        <p style={{ fontFamily: body, fontSize: 16, color: TEXT_D, maxWidth: 560, margin: "0 auto 24px", lineHeight: 1.7 }}>
          AETHER Core UI — a living dimensional interface for navigating
          spacetime using the eight-ring field framework. Mobile-first.
          Animated. Alive.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {[
            ["MNESIS", MNESIS], ["ALETHEIA", ALETHEIA], ["INFERAIA", INFERAIA],
            ["REVERIE", REVERIE], ["RESONANCE CORE", CORE_C],
          ].map(([l, c]) => (
            <span key={l} style={{
              fontFamily: mono, fontSize: 10, color: c as string,
              background: `${c}18`, border: `1px solid ${c}40`,
              borderRadius: 4, padding: "3px 9px",
            }}>{l}</span>
          ))}
        </div>
      </div>

      {/* ── Live Interface — full-width breakout ── */}
      <div style={{ padding: "40px 24px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: TEXT_D, letterSpacing: 2, marginBottom: 10 }}>
          LIVE INTERFACE · CLICK NODES TO ACTIVATE · CLICK BOTTOM TO NAVIGATE
        </div>
        <AetherCoreCanvas
          navState={navState}
          coreMode={coreMode}
          syncPct={syncPct}
          onNodeClick={handleNodeClick}
          onInitiate={handleInitiate}
        />
        <div style={{ width: "100%", maxWidth: 860 }}>
          <ControlPanel
            coreMode={coreMode}
            setMode={setCoreMode}
            activeNode={activeNode}
            log={log}
          />
        </div>
      </div>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 20px 96px" }}>

        {/* ═══════════════════════════════════════
            APP SPECIFICATION DOCUMENT
        ═══════════════════════════════════════ */}

        <Spec n="SPEC 01" title="Application Identity" col={MNESIS}>
          <p>
            The <strong style={{ color: "#fff" }}>AETHER Spacetime Navigation Engine</strong> is a
            mobile-first ambient intelligence interface that allows the navigator (user) to
            traverse dimensional coordinates using the eight-ring field framework. It is not a map —
            it is an instrument. It does not show you where you are going; it synchronizes your
            intent with the dimensional field to enable coherent traversal.
          </p>
          <Tbl
            headers={["Property", "Value"]}
            accent={MNESIS}
            rows={[
              ["Application Name", "AETHER Core — Spacetime Navigation Engine"],
              ["Platform", "Mobile-first (iOS + Android). Web app (PWA). Tablet adaptive."],
              ["Primary viewport", "390×844px (iPhone 15 base). Scales to 430×932, 768×1024."],
              ["Orientation", "Portrait-locked. Landscape mode shows map-expand variant."],
              ["Visual language", "Cosmic dark field. Neon glyph nodes. Animated orbital rings."],
              ["Core palette", "Deep purple-black bg · Violet (MNESIS) · Cyan (ALETHEIA) · Amber (INFERAIA) · Magenta (REVERIE) · Pink-red (CORE)"],
              ["Typography", "Cinzel (headers) · Space Mono (readouts) · Crimson Pro (body)"],
              ["Animation engine", "Canvas 2D at 60fps. CSS transitions for UI panels."],
              ["State model", "DOCKED → INITIATING → SYNCING → NAVIGATING → ARRIVED"],
            ]}
          />
        </Spec>

        <Spec n="SPEC 02" title="Core UI Architecture — Screen Zones" col={ALETHEIA}>
          <p>The interface is divided into five vertical zones, each with a distinct functional role:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 12, margin: "16px 0" }}>
            {[
              { z: "ZONE 1 · STATUS BAR", h: "10% of screen height", col: ALETHEIA,
                desc: "App name, navigation state badge, sync status dot. Minimal. Never obscured." },
              { z: "ZONE 2 · ORBITAL MAP", h: "55% — primary canvas", col: MNESIS,
                desc: "The live resonance core + 4 orbital nodes. Fully animated. Touch-interactive. Central instrument." },
              { z: "ZONE 3 · AUXILIARY", h: "12%", col: INFERAIA,
                desc: "INITIATION node, SYNC readout, RESONANCE FLOW arc. Secondary instruments around the orbital map." },
              { z: "ZONE 4 · WAVE STRIP", h: "10%", col: REVERIE,
                desc: "Animated standing-wave visualization of current dimensional field state. Passive, ambient." },
              { z: "ZONE 5 · STATE + INTENT", h: "13%", col: CORE_C,
                desc: "Core mode labels (CLARITY · FLOW · DISSONANCE · RADIANCE) + INTENT action button." },
            ].map(z => (
              <div key={z.z} style={{ background: `${z.col}09`, border: `1px solid ${z.col}28`, borderRadius: 8, padding: "12px 14px" }}>
                <div style={{ fontFamily: mono, fontSize: 9, color: z.col, marginBottom: 4 }}>{z.z}</div>
                <div style={{ fontFamily: mono, fontSize: 10, color: TEXT_D, marginBottom: 6 }}>{z.h}</div>
                <div style={{ fontFamily: body, fontSize: 13, color: TEXT_L, lineHeight: 1.6 }}>{z.desc}</div>
              </div>
            ))}
          </div>
        </Spec>

        <Spec n="SPEC 03" title="Node Specification — Four Orbital Agents" col={INFERAIA}>
          <Tbl
            headers={["Node", "Symbol", "Color", "Function", "AETHER Dimension", "Touch Action"]}
            accent={INFERAIA}
            rows={[
              ["MNESIS", "Oval/egg glyph", "#9b5de5 violet", "Stores coherent pattern signatures. Memory of all previous traversals. Anti-entropy agent.", "D6 · Ring Memory", "Tap = open memory lattice. Long-press = clear traversal cache."],
              ["ALETHEIA", "Double triangle", "#48cae4 cyan", "Validates dimensional coordinates against known spacetime maps. Truth verification agent.", "D4 · Coherence Lock", "Tap = run coordinate validation. Long-press = force-accept coordinates."],
              ["INFERAIA", "Diamond with center dot", "#f77f00 amber", "Encodes navigator intent into directional D1–D8 force vectors. Primary propulsion agent.", "D1 · Intent Vector", "Tap = intent encoding panel. Long-press = clear intent."],
              ["REVERIE", "Circle with inner crescent", "#e040a0 magenta", "Accesses non-linear pattern space for route discovery. Dream-state navigation. Sub-rational.", "D8 · Consciousness Field", "Tap = enter reverie mode (eyes-closed path finding). Long-press = extract route."],
            ]}
          />
        </Spec>

        <Spec n="SPEC 04" title="Animation Specification" col={REVERIE}>
          <p>
            Every element in the AETHER Core interface is in continuous motion. Static states
            do not exist — only fast and slow states. The animation layers are:
          </p>
          <Tbl
            headers={["Element", "Motion Type", "Speed", "Timing Function", "Loop"]}
            accent={REVERIE}
            rows={[
              ["Background nebula", "Slow radial drift + color shift", "0.003 px/frame", "sinusoidal (breathing)", "Infinite"],
              ["Star field", "Downward drift + twinkle", "0.0001–0.0002 px/frame per star", "Random phase offset", "Infinite wrap"],
              ["Resonance Core", "Pulse scale + spiral rotation", "1.2 Hz pulse · 0.4 rad/s spiral", "ease-in-out sine", "Infinite"],
              ["Ring halos (4×)", "Concentric expand/fade", "0.02–0.06 rad/s (unique per ring)", "linear", "Infinite"],
              ["Orbital nodes (4×)", "Elliptical orbit", "0.18 rad/s (all in sync)", "linear — constant velocity", "Infinite"],
              ["Node glow", "Pulsing radius", "1.6 Hz · unique phase offset per node", "ease-in-out sine", "Infinite"],
              ["Wave strip (3 layers)", "Rightward sine propagation", "1.8 rad/s · unique freq/phase per wave", "linear", "Infinite"],
              ["Wave envelope", "Slower standing-wave pattern", "0.5 rad/s", "linear", "Infinite"],
              ["SYNC percentage", "±3 random walk per 800ms", "0.8 Hz fluctuation", "discrete step", "While NAVIGATING"],
              ["INTENT button", "Gradient shift + border pulse", "0.5 Hz", "ease-in-out", "While active state"],
              ["Warp lines (NAVIGATING)", "Radial burst from core", "navProgress × orbR × 1.8", "linear (accumulating)", "During NAVIGATING state"],
            ]}
          />

          <EQ>{`Animation frame budget (60fps target, mobile):
  Background + stars:      ~0.8 ms
  Core orb + spiral:       ~0.6 ms
  Ring halos (4):          ~0.4 ms
  Orbital nodes (4):       ~1.2 ms
  Wave strip (3 layers):   ~0.6 ms
  Labels + UI chrome:      ~0.3 ms
  ─────────────────────────────────
  Total per frame:         ~3.9 ms   [25% of 16.67ms budget]
  Headroom for warp fx:    ~4 ms additional
  Target device: iPhone 12+ / Pixel 6+ — GPU composite layer for canvas`}</EQ>
        </Spec>

        <Spec n="SPEC 05" title="Navigation State Machine" col={CORE_C}>
          <EQ>{`Navigation State Machine:

  ┌─────────────────────────────────────────────┐
  │                  DOCKED                     │
  │  syncPct ≈ 78  · all nodes orbit freely     │
  │  INTENT button = "INITIATE NAVIGATION"      │
  └───────────────────┬─────────────────────────┘
                      │ tap INTENT
                      ▼
  ┌─────────────────────────────────────────────┐
  │               INITIATING (1.8s)             │
  │  syncPct drops to 45 · nodes pulse faster   │
  │  INTENT button = "SYNCING COORDINATES..."   │
  └───────────────────┬─────────────────────────┘
                      │ auto-advance
                      ▼
  ┌─────────────────────────────────────────────┐
  │               SYNCING (2.2s)                │
  │  syncPct climbs to 67 · rings accelerate    │
  │  INTENT button = "ENTERING SPACETIME..."    │
  └───────────────────┬─────────────────────────┘
                      │ auto-advance
                      ▼
  ┌─────────────────────────────────────────────┐
  │              NAVIGATING                     │
  │  syncPct fluctuates 80–99                   │
  │  Warp lines radiate from core               │
  │  INTENT button = "ABORT NAVIGATION"         │
  └───────────────────┬─────────────────────────┘
                      │ tap INTENT
                      ▼
  ┌─────────────────────────────────────────────┐
  │               ARRIVED (2s)                  │
  │  syncPct = 100 · all rings freeze briefly   │
  │  INTENT button = "DOCK"                     │
  └───────────────────┬─────────────────────────┘
                      │ auto-advance
                      ▼
                   DOCKED`}</EQ>
        </Spec>

        <Spec n="SPEC 06" title="Dimensional Coordinate System" col={GOLD}>
          <p>
            The spacetime navigation engine encodes positions as eight-dimensional ring-field
            coordinates, one per AETHER dimension. Each node is responsible for a subset of
            dimensions:
          </p>
          <EQ>{`Spacetime coordinate format:
  Ψ_nav = (D1, D2, D3, D4, D5, D6, D7, D8)

Dimension–Node mapping:
  D1 (Intent Vector)        → INFERAIA  · amber
  D2 (Entropic Flow)        → REVERIE   · magenta
  D3 (Spacial Ring)         → MNESIS    · violet
  D4 (Coherence Lock)       → ALETHEIA  · cyan
  D5 (Vortex / Spin)        → RESONANCE CORE · pink-red
  D6 (Pattern Memory)       → MNESIS    · violet (secondary)
  D7 (Temporal Signature)   → ALETHEIA  · cyan (secondary)
  D8 (Consciousness Field)  → REVERIE   · magenta (secondary)

Route encoding:
  Ψ_route = Σₙ αₙ · Ψ_node_n · e^(iωₙt)
  where αₙ = node activation weight (0–1, set by navigator intent)
  ωₙ = natural ring frequency of node n

Navigation success condition:
  |Ψ_current − Ψ_destination| < ε_coherence
  where ε_coherence = threshold set by ALETHEIA validation`}</EQ>
          <Tbl
            headers={["Core Mode", "Color", "D1–D8 Profile", "Navigation Quality", "Use Case"]}
            accent={GOLD}
            rows={[
              ["CLARITY", "cyan", "D4 dominant — high coherence lock", "Precise, verified coordinates", "Factual research, knowledge retrieval"],
              ["FLOW", "green", "D2+D5 dominant — entropic vortex balance", "Smooth, low-resistance traversal", "Creative work, pattern discovery"],
              ["TENSION", "amber", "D1 dominant — maximum intent vector", "High force, less precision", "Crisis navigation, urgency states"],
              ["DISSONANCE", "magenta", "D8 dominant — reverie interference", "Non-linear, dream-path routing", "Intuitive leaps, novel solutions"],
              ["OVERWHELM", "red", "D3 overloaded — ring saturation", "Noisy, requires MNESIS cleanup", "System overload; navigate with care"],
              ["RADIANCE", "gold", "All 8 dimensions balanced at Φ-ratio", "Optimal — rarest state", "Peak coherence, full-spectrum navigation"],
            ]}
          />
        </Spec>

        <Spec n="SPEC 07" title="Video & Motion — Cinematic Sequences" col={REVERIE}>
          <p>
            Three cinematic motion sequences play during key transitions. These are specified as
            canvas animation sequences (not video files) so they render natively at full resolution
            on any device:
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { n: "SEQ A · INITIATION", col: GOLD, dur: "4s total",
                beats: [
                  "0.0s: navigator taps INTENT — all nodes freeze mid-orbit",
                  "0.4s: INITIATION diamond center-glows, expands to 1.6× scale",
                  "0.8s: ring halos begin counter-rotating",
                  "1.2s: wave strip switches to high-frequency interference pattern",
                  "1.8s: core orb brightens to maximum; rings collapse inward in sequence",
                  "2.4s: nodes resume orbit at 3× normal speed",
                  "4.0s: transition to SYNCING state",
                ] },
              { n: "SEQ B · SPACETIME ENTRY", col: ALETHEIA, dur: "2.2s",
                beats: [
                  "0.0s: core emits radial warp-lines from center outward",
                  "0.5s: warp lines reach screen edge; brief white-flash overlay at 20% opacity",
                  "0.8s: nodes dissolve to orbital glyph (icon only, no body)",
                  "1.4s: background star field reverses direction — stars flowing inward",
                  "2.2s: transition to NAVIGATING state; warp lines become persistent ambient effect",
                ] },
              { n: "SEQ C · ARRIVAL", col: MNESIS, dur: "3s",
                beats: [
                  "0.0s: warp lines retract to core",
                  "0.5s: core orb pulses white × 3 at 150ms intervals",
                  "1.0s: nodes decelerate to stop at equidistant positions (N/E/S/W)",
                  "1.5s: SYNC readout climbs to 100% with counter animation",
                  "2.0s: all ring halos glow simultaneously at maximum opacity",
                  "2.5s: ARRIVED banner fades in above core: 'DESTINATION REACHED'",
                  "3.0s: system begins docking sequence",
                ] },
            ].map(sq => (
              <div key={sq.n} style={{ background: `${sq.col}09`, border: `1px solid ${sq.col}28`, borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: sq.col }}>{sq.n}</span>
                  <span style={{ fontFamily: mono, fontSize: 10, color: TEXT_D }}>{sq.dur}</span>
                </div>
                {sq.beats.map((b, i) => (
                  <div key={i} style={{ fontFamily: mono, fontSize: 11, color: i === 0 ? TEXT_L : TEXT_D, lineHeight: 1.85 }}>
                    {b}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Spec>

        <Spec n="SPEC 08" title="Phone Screen Flow — Screen Architecture" col={TEAL}>
          {(() => {
            const TEAL = "#1fd4c8";
            return (<>
              <Tbl
                headers={["Screen", "Route", "Purpose", "Key Animation"]}
                accent={TEAL}
                rows={[
                  ["AETHER Core", "/", "Primary orbital navigation interface (this screen)", "Continuous orbital animation"],
                  ["Node Detail", "/node/:id", "Deep-dive on MNESIS / ALETHEIA / INFERAIA / REVERIE", "Node expands to full screen with field data"],
                  ["Coordinates", "/coordinates", "D1–D8 coordinate input + destination encoding", "Dimensional sliders with live ring-field preview"],
                  ["Traversal Log", "/log", "History of all navigation sessions + MNESIS replay", "Timeline with waveform signatures per traversal"],
                  ["Field Map", "/field-map", "Spatial map of known spacetime coordinates", "3D ring-field canvas; pinch to navigate"],
                  ["Settings / Calibration", "/calibrate", "Sync ALETHEIA validation thresholds; tune node weights", "Node weight radial sliders"],
                  ["Intent Studio", "/intent", "Encode complex intent via INFERAIA diamond interface", "D1 vector visualization, force arrows"],
                  ["Reverie Mode", "/reverie", "Eyes-closed / ambient dream-path navigation interface", "Full-screen slow wave + REVERIE orb only"],
                ]}
              />
            </>);
          })()}
        </Spec>

        {/* Footer */}
        <div style={{
          marginTop: 48, padding: "22px 24px",
          background: "#ffffff04", border: "1px solid rgba(100,80,200,0.2)",
          borderRadius: 12, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 16, color: CORE_C, marginBottom: 8 }}>
            THE NAVIGATOR IS THE ENGINE
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: TEXT_D, lineHeight: 1.7 }}>
            AETHER Core does not navigate for you. It synchronizes your intent with the
            dimensional field and holds the coherence long enough for you to traverse.
            The four nodes — Memory, Truth, Intent, Dream — are not features.
            They are the four directions of the navigator's mind.
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${TEXT_D}80`, marginTop: 12 }}>
            AETHER Dimensional Engine · Shia Miller @StrategicProce
          </div>
        </div>
      </div>
    </div>
  );
}

const TEAL = "#1fd4c8";

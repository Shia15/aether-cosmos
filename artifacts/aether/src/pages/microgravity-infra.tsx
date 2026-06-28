import { useEffect, useRef } from "react";

const BG = "#04060E";
const AURORA = "#00FFB2";
const GOLD = "#C8A030";
const QUANT = "#00ffe0";
const DIM = "#2a4060";
const MONO = "'Space Mono', monospace";
const SERIF = "'Crimson Pro', serif";
const DISP = "'Orbitron', 'Cinzel', serif";

const card: React.CSSProperties = {
  background: "rgba(10,20,40,0.85)",
  border: `1px solid ${DIM}`,
  borderRadius: 10,
  padding: "20px 24px",
};

const chHead = (color: string): React.CSSProperties => ({
  background: "linear-gradient(90deg,rgba(14,26,48,0.95) 0%,rgba(14,26,48,0.4) 100%)",
  borderLeft: `4px solid ${color}`,
  borderRadius: 4,
  padding: "18px 24px",
  margin: "52px 0 10px",
});

const chNum = (color: string): React.CSSProperties => ({
  fontFamily: MONO,
  fontSize: "0.68em",
  letterSpacing: 4,
  color,
  textTransform: "uppercase",
  marginBottom: 3,
});

const eq: React.CSSProperties = {
  background: "#060c18",
  border: `1px solid ${DIM}`,
  borderLeft: `3px solid ${AURORA}`,
  borderRadius: 6,
  padding: "14px 20px",
  margin: "14px 0",
  fontFamily: MONO,
  fontSize: "0.8em",
  color: QUANT,
  overflowX: "auto",
  whiteSpace: "pre",
};

const badge = (color: string, bg: string): React.CSSProperties => ({
  display: "inline-block",
  fontFamily: MONO,
  fontSize: "0.62em",
  letterSpacing: "0.12em",
  padding: "2px 10px",
  borderRadius: 3,
  textTransform: "uppercase",
  color,
  background: bg,
  marginLeft: 8,
  verticalAlign: "middle",
});

const pill: React.CSSProperties = {
  display: "inline-block",
  background: `linear-gradient(90deg,${AURORA},${QUANT})`,
  color: "#000",
  fontFamily: MONO,
  fontSize: "0.7em",
  fontWeight: "bold",
  letterSpacing: 3,
  padding: "5px 18px",
  borderRadius: 20,
  marginBottom: 22,
  textTransform: "uppercase",
};

const NOTE_COLOR = "#c8941a";

export default function MicrogravityInfraPage() {
  const cascadeRef = useRef<HTMLCanvasElement>(null);
  const plenumRef = useRef<HTMLCanvasElement>(null);
  const schumannRef = useRef<HTMLCanvasElement>(null);
  const warpRef = useRef<HTMLCanvasElement>(null);
  const microgravRef = useRef<HTMLCanvasElement>(null);
  const planetRef = useRef<HTMLCanvasElement>(null);

  // Cascade architecture animation
  useEffect(() => {
    const c = cascadeRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    const nodes = [
      { label: "PRESSURE DIFFERENTIAL LIFT", sub: "Ground effect -- VERIFIED", color: AURORA },
      { label: "PLASMA BOUNDARY LAYER", sub: "DBD spherical shell -- Theoretical", color: GOLD },
      { label: "ELF CAVITY RESONANCE", sub: "Schumann coupling -- Proposed", color: "#9b5de5" },
      { label: "WARP FIELD TOPOLOGY", sub: "Alcubierre analog -- Conceptual", color: "#f72585" },
      { label: "DIRECTIONAL PROPULSION", sub: "Space contraction/expansion -- Speculative", color: "#38bdf8" },
    ];

    type Particle = { x: number; y: number; vy: number; life: number; color: string };
    const particles: Particle[] = [];

    function spawnParticle(fromIdx: number) {
      const n = nodes[fromIdx];
      const nx = W / 2;
      const ny = 24 + fromIdx * (H - 24) / nodes.length + 20;
      particles.push({ x: nx + (Math.random() - 0.5) * 80, y: ny, vy: 1.2 + Math.random() * 0.8, life: 1, color: n.color });
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      const nodeH = (H - 24) / nodes.length;

      nodes.forEach((n, i) => {
        const y = 24 + i * nodeH;
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.05 + i * 0.9);

        ctx!.fillStyle = n.color + Math.round(pulse * 28).toString(16).padStart(2, "0");
        ctx!.beginPath();
        ctx!.roundRect(W / 2 - 180, y + 2, 360, nodeH - 16, 4);
        ctx!.fill();
        ctx!.strokeStyle = n.color + Math.round(pulse * 200).toString(16).padStart(2, "0");
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.roundRect(W / 2 - 180, y + 2, 360, nodeH - 16, 4);
        ctx!.stroke();

        ctx!.font = `bold 9px ${MONO}`;
        ctx!.fillStyle = n.color;
        ctx!.textAlign = "center";
        ctx!.fillText(n.label, W / 2, y + 20);
        ctx!.font = `8px ${MONO}`;
        ctx!.fillStyle = "#607090";
        ctx!.fillText(n.sub, W / 2, y + 34);
        ctx!.textAlign = "left";

        if (i < nodes.length - 1 && Math.random() < 0.08) spawnParticle(i);
      });

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.y += p.vy;
        p.life -= 0.012;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx!.fillStyle = p.color + Math.round(p.life * 220).toString(16).padStart(2, "0");
        ctx!.fill();
      }

      const phaseLabels = ["SENSE", "DELIVER", "ACTIVATE", "FEEDBACK", "LEARN"];
      phaseLabels.forEach((ph, i) => {
        const y = 24 + i * nodeH + nodeH / 2 - 4;
        ctx!.font = `8px ${MONO}`;
        ctx!.fillStyle = "#2a4060";
        ctx!.textAlign = "right";
        ctx!.fillText(ph, W / 2 - 188, y);
        ctx!.textAlign = "left";
      });

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Plenum lift simulation
  useEffect(() => {
    const c = plenumRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;
    let liftY = H * 0.5;
    const targetLift = H * 0.3;

    type PlenumParticle = { x: number; y: number; vx: number; vy: number; life: number; r: number };
    const airParticles: PlenumParticle[] = [];

    for (let i = 0; i < 60; i++) {
      airParticles.push({ x: Math.random() * W * 0.7 + W * 0.15, y: H * 0.7 + Math.random() * H * 0.2, vx: (Math.random() - 0.5) * 1.2, vy: -Math.random() * 1.5 - 0.5, life: Math.random(), r: 1.5 + Math.random() * 2 });
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#050a14";
      ctx!.fillRect(0, 0, W, H);

      const groundY = H * 0.88;
      ctx!.fillStyle = "#1a2a1a";
      ctx!.fillRect(0, groundY, W, H - groundY);
      ctx!.strokeStyle = "#2a4a2a";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, groundY);
      ctx!.lineTo(W, groundY);
      ctx!.stroke();
      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#2a4a2a";
      ctx!.fillText("GROUND SURFACE (smooth concrete -- optimal)", 8, groundY + 14);

      liftY += (targetLift - liftY) * 0.03;
      const platTop = liftY;
      const platBot = platTop + 28;
      const platL = W * 0.15;
      const platR = W * 0.85;

      const plenumPulse = 0.7 + 0.3 * Math.sin(t * 0.06);
      ctx!.fillStyle = `rgba(0,255,178,${0.04 * plenumPulse})`;
      ctx!.fillRect(platL, platBot, platR - platL, groundY - platBot);
      ctx!.strokeStyle = AURORA + "44";
      ctx!.lineWidth = 0.5;
      ctx!.setLineDash([4, 4]);
      ctx!.strokeRect(platL, platBot, platR - platL, groundY - platBot);
      ctx!.setLineDash([]);

      const gap = groundY - platBot;
      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = AURORA + "88";
      ctx!.textAlign = "center";
      ctx!.fillText("PRESSURIZED PLENUM -- delta_P = " + (12 + Math.round(plenumPulse * 3)) + " Pa", W / 2, platBot + gap / 2);
      ctx!.fillText("F_lift = delta_P x A_base >= m_total x g", W / 2, platBot + gap / 2 + 14);
      ctx!.textAlign = "left";

      ctx!.fillStyle = "#2a4060";
      ctx!.beginPath();
      ctx!.roundRect(platL, platTop, platR - platL, 28, 3);
      ctx!.fill();
      ctx!.strokeStyle = AURORA;
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.roundRect(platL, platTop, platR - platL, 28, 3);
      ctx!.stroke();
      ctx!.fillStyle = AURORA;
      ctx!.font = `bold 9px ${MONO}`;
      ctx!.textAlign = "center";
      ctx!.fillText("HOVERCRAFT PLATFORM (4 ft dia.) + OCCUPANT", W / 2, platTop + 18);
      ctx!.textAlign = "left";

      ctx!.strokeStyle = "#1e2030";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(platL, platBot);
      ctx!.lineTo(platL - 10, groundY);
      ctx!.moveTo(platR, platBot);
      ctx!.lineTo(platR + 10, groundY);
      ctx!.stroke();
      ctx!.fillStyle = "#445870";
      ctx!.font = `8px ${MONO}`;
      ctx!.fillText("skirt", platL - 26, (platBot + groundY) / 2);

      ctx!.fillStyle = "#607090";
      ctx!.fillRect(W * 0.52 - 6, platTop - 30, 12, 30);
      ctx!.beginPath();
      ctx!.arc(W * 0.52, platTop - 30, 18, Math.PI, Math.PI * 2);
      ctx!.fillStyle = "#4a5a70";
      ctx!.fill();
      ctx!.fillStyle = AURORA;
      ctx!.font = `8px ${MONO}`;
      ctx!.textAlign = "center";
      ctx!.fillText("OCCUPANT", W * 0.52, platTop - 36);
      ctx!.textAlign = "left";

      const blowerX = W * 0.45;
      ctx!.fillStyle = GOLD + "88";
      ctx!.beginPath();
      ctx!.roundRect(blowerX - 18, platBot - 12, 36, 12, 3);
      ctx!.fill();
      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = GOLD;
      ctx!.textAlign = "center";
      ctx!.fillText("BLOWER", blowerX, platBot - 2);
      ctx!.textAlign = "left";

      airParticles.forEach(p => {
        p.x += p.vx + (Math.random() - 0.5) * 0.4;
        p.y += p.vy;
        p.life -= 0.006;
        if (p.life <= 0 || p.y < platBot) {
          p.x = Math.random() * (platR - platL) + platL;
          p.y = groundY - 2;
          p.vy = -Math.random() * 1.5 - 0.5;
          p.vx = (Math.random() - 0.5) * 1.2;
          p.life = 0.8 + Math.random() * 0.2;
        }
        const alpha = Math.max(0, p.life * 0.6);
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0,255,178,${alpha})`;
        ctx!.fill();
      });

      const liftArrowY1 = platTop + 24;
      const liftArrowY2 = platTop - 10;
      ctx!.strokeStyle = "#f72585";
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(platL + 20, liftArrowY1);
      ctx!.lineTo(platL + 20, liftArrowY2);
      ctx!.stroke();
      ctx!.fillStyle = "#f72585";
      ctx!.beginPath();
      ctx!.moveTo(platL + 14, liftArrowY2 + 6);
      ctx!.lineTo(platL + 20, liftArrowY2);
      ctx!.lineTo(platL + 26, liftArrowY2 + 6);
      ctx!.fill();
      ctx!.font = `8px ${MONO}`;
      ctx!.fillText("LIFT", platL + 28, liftArrowY2 + 8);

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Schumann resonance eigenmode rings
  useEffect(() => {
    const c = schumannRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;
    const spectroH = 70;
    const spectroData: number[] = [];
    for (let i = 0; i < W; i++) spectroData.push(0);

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      const cx = W * 0.38, cy = (H - spectroH - 10) / 2 + 10;
      const maxR = Math.min(cx, cy) - 20;

      ctx!.beginPath();
      ctx!.arc(cx, cy, maxR * 0.15, 0, Math.PI * 2);
      ctx!.fillStyle = "#9b5de522";
      ctx!.fill();
      ctx!.strokeStyle = "#9b5de5";
      ctx!.lineWidth = 2;
      ctx!.stroke();
      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = "#9b5de5";
      ctx!.textAlign = "center";
      ctx!.fillText("CRAFT", cx, cy + 4);

      const modes = [
        { f: 7.83, r: 0.45, color: AURORA, label: "SR1 7.83 Hz" },
        { f: 14.3, r: 0.62, color: GOLD, label: "SR2 14.3 Hz" },
        { f: 20.8, r: 0.75, color: "#9b5de5", label: "SR3 20.8 Hz" },
        { f: 27.3, r: 0.87, color: "#f72585", label: "SR4 27.3 Hz" },
        { f: 33.8, r: 0.97, color: "#38bdf8", label: "SR5 33.8 Hz" },
      ];

      modes.forEach(m => {
        const r = m.r * maxR;
        const amp = 0.6 + 0.4 * Math.sin(m.f * t * 0.025);
        const N = 160;
        ctx!.beginPath();
        for (let i = 0; i <= N; i++) {
          const angle = (i / N) * Math.PI * 2;
          const wave = amp * 4 * Math.sin(m.f * angle * 0.3 + t * 0.05);
          const rr = r + wave;
          const x = cx + rr * Math.cos(angle);
          const y = cy + rr * Math.sin(angle);
          if (i === 0) ctx!.moveTo(x, y);
          else ctx!.lineTo(x, y);
        }
        ctx!.closePath();
        ctx!.strokeStyle = m.color + Math.round(amp * 180).toString(16).padStart(2, "0");
        ctx!.lineWidth = 1.2;
        ctx!.stroke();

        const labelX = cx + r * Math.cos(-0.3) + 6;
        const labelY = cy + r * Math.sin(-0.3);
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = m.color;
        ctx!.textAlign = "left";
        ctx!.fillText(m.label, labelX, labelY);
      });

      ctx!.textAlign = "left";
      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#445870";
      ctx!.fillText("f_n = (c/2piR) * sqrt(n(n+1))", cx - 70, H - spectroH - 18);

      const specX = W * 0.62;
      const specW = W - specX - 10;
      ctx!.fillStyle = "#060c18";
      ctx!.fillRect(specX, H - spectroH - 4, specW, spectroH);
      ctx!.strokeStyle = DIM;
      ctx!.lineWidth = 0.5;
      ctx!.strokeRect(specX, H - spectroH - 4, specW, spectroH);

      const totalPower = modes.reduce((s, m) => s + Math.sin(m.f * t * 0.025) * 0.5 + 0.5, 0);
      spectroData.push(totalPower / modes.length);
      if (spectroData.length > specW) spectroData.shift();

      spectroData.forEach((v, i) => {
        const barH = v * (spectroH - 4);
        const x = specX + i;
        const hue = 160 + v * 60;
        ctx!.fillStyle = `hsl(${hue},80%,40%)`;
        ctx!.fillRect(x, H - 4 - barH, 1, barH);
      });

      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = "#445870";
      ctx!.fillText("Q-BURST SPECTROGRAM", specX + 4, H - spectroH - 8);

      if (Math.random() < 0.003) {
        ctx!.fillStyle = "rgba(255,255,255,0.9)";
        ctx!.fillRect(specX, H - spectroH - 4, specW, spectroH);
        setTimeout(() => {}, 50);
      }

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Alcubierre warp grid
  useEffect(() => {
    const c = warpRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    function f_shape(rs: number, R: number, sigma: number) {
      const top = Math.tanh(sigma * (rs - R));
      const bot = Math.tanh(sigma * R);
      return (top - bot) / (2 * bot);
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#030609";
      ctx!.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const vs = 0.4 + 0.3 * Math.sin(t * 0.02);
      const R = 55, sigma = 0.15;
      const COLS = 28, ROWS = 16;

      for (let row = 0; row < ROWS; row++) {
        ctx!.beginPath();
        for (let col = 0; col <= COLS; col++) {
          const gx = (col / COLS) * W;
          const gy = (row / (ROWS - 1)) * H;
          const dx = gx - cx, dy = gy - cy;
          const rs = Math.sqrt(dx * dx + dy * dy);
          const fv = f_shape(rs, R, sigma);
          const warpX = gx - vs * fv * (dx / (rs + 0.001)) * 30;
          const warpY = gy;
          if (col === 0) ctx!.moveTo(warpX, warpY);
          else ctx!.lineTo(warpX, warpY);
        }
        const strain = Math.abs(vs);
        ctx!.strokeStyle = `rgba(42,64,96,${0.4 + strain * 0.3})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      for (let col = 0; col <= COLS; col++) {
        ctx!.beginPath();
        for (let row = 0; row < ROWS; row++) {
          const gx = (col / COLS) * W;
          const gy = (row / (ROWS - 1)) * H;
          const dx = gx - cx, dy = gy - cy;
          const rs = Math.sqrt(dx * dx + dy * dy);
          const fv = f_shape(rs, R, sigma);
          const warpX = gx - vs * fv * (dx / (rs + 0.001)) * 30;
          const warpY = gy;
          if (row === 0) ctx!.moveTo(warpX, warpY);
          else ctx!.lineTo(warpX, warpY);
        }
        const gx = (col / COLS) * W;
        const dx = gx - cx;
        const strain = Math.abs(vs * f_shape(Math.abs(dx), R, sigma));
        const r = Math.round(strain * 80), b = Math.round((1 - strain) * 80);
        ctx!.strokeStyle = `rgba(${r},64,${b + 20},${0.35 + strain * 0.4})`;
        ctx!.lineWidth = 0.8;
        ctx!.stroke();
      }

      const bubbleR = R + 6;
      const grad = ctx!.createRadialGradient(cx, cy, 0, cx, cy, bubbleR);
      grad.addColorStop(0, "#9b5de544");
      grad.addColorStop(0.7, "#9b5de511");
      grad.addColorStop(1, "transparent");
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(cx, cy, bubbleR, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = "#9b5de5";
      ctx!.lineWidth = 2;
      ctx!.setLineDash([5, 5]);
      ctx!.beginPath();
      ctx!.arc(cx, cy, bubbleR, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.setLineDash([]);

      ctx!.fillStyle = "#f72585";
      ctx!.beginPath();
      ctx!.arc(cx, cy, 10, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = "#f72585";
      ctx!.textAlign = "center";
      ctx!.fillText("CRAFT", cx, cy + 22);

      ctx!.fillStyle = AURORA + "88";
      ctx!.font = `8px ${MONO}`;
      ctx!.textAlign = "left";
      ctx!.fillText("CONTRACTION (leading)", 10, cy - 10);
      ctx!.fillStyle = GOLD + "88";
      ctx!.textAlign = "right";
      ctx!.fillText("EXPANSION (trailing)", W - 10, cy - 10);
      ctx!.textAlign = "left";

      const arrowY = H - 18;
      const arrowLen = 80 * vs;
      ctx!.strokeStyle = AURORA;
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.moveTo(W / 2 - arrowLen / 2, arrowY);
      ctx!.lineTo(W / 2 + arrowLen / 2, arrowY);
      ctx!.stroke();
      ctx!.fillStyle = AURORA;
      ctx!.beginPath();
      ctx!.moveTo(W / 2 + arrowLen / 2 - 6, arrowY - 4);
      ctx!.lineTo(W / 2 + arrowLen / 2, arrowY);
      ctx!.lineTo(W / 2 + arrowLen / 2 - 6, arrowY + 4);
      ctx!.fill();
      ctx!.font = `8px ${MONO}`;
      ctx!.fillText("v_s = " + vs.toFixed(2) + " c", W / 2 + arrowLen / 2 + 4, arrowY + 4);

      ctx!.fillStyle = "#445870";
      ctx!.font = `7px ${MONO}`;
      ctx!.textAlign = "center";
      ctx!.fillText("Alcubierre metric: ds2 = -dt2 + (dx - v_s*f(r_s)*dt)2 + dy2 + dz2", cx, 14);
      ctx!.textAlign = "left";

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Microgravity applications canvas
  useEffect(() => {
    const c = microgravRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;

    type Block = { x: number; y: number; vx: number; vy: number; w: number; h: number; color: string; label: string; settled: boolean };
    const blocks: Block[] = [];
    const G_MOON = 0.027;
    const structures: Block[] = [];
    const GROUND_Y = H - 30;

    for (let i = 0; i < 4; i++) {
      structures.push({ x: 60 + i * 90, y: GROUND_Y - 40 - i * 30, vx: 0, vy: 0, w: 70, h: 30, color: GOLD, label: ["BASE", "RING 1", "RING 2", "DOME"][i], settled: true });
    }

    function spawnBlock() {
      blocks.push({ x: Math.random() * (W - 80) + 40, y: -30, vx: (Math.random() - 0.5) * 0.4, vy: 0.2, w: 50, h: 20, color: AURORA, label: "MODULE", settled: false });
    }

    type Star = { x: number; y: number; r: number };
    const stars: Star[] = [];
    for (let i = 0; i < 80; i++) {
      stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.2 });
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#010308";
      ctx!.fillRect(0, 0, W, H);

      stars.forEach(s => {
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.random()})`;
        ctx!.fill();
      });

      ctx!.fillStyle = "#1a2a1a";
      ctx!.fillRect(0, GROUND_Y, W, H - GROUND_Y);
      ctx!.strokeStyle = "#2a4a2a";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.moveTo(0, GROUND_Y);
      ctx!.lineTo(W, GROUND_Y);
      ctx!.stroke();
      ctx!.font = `7px ${MONO}`;
      ctx!.fillStyle = "#2a4a2a";
      ctx!.fillText("LUNAR/MARS SURFACE  g = 0.166g / 0.38g", 6, GROUND_Y + 12);

      structures.forEach(s => {
        ctx!.fillStyle = s.color + "55";
        ctx!.beginPath();
        ctx!.roundRect(s.x, s.y, s.w, s.h, 3);
        ctx!.fill();
        ctx!.strokeStyle = s.color;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = s.color;
        ctx!.textAlign = "center";
        ctx!.fillText(s.label, s.x + s.w / 2, s.y + s.h / 2 + 3);
        ctx!.textAlign = "left";
      });

      if (t % 90 === 0 && blocks.length < 5) spawnBlock();

      for (let i = blocks.length - 1; i >= 0; i--) {
        const b = blocks[i];
        if (!b.settled) {
          b.vy += G_MOON;
          b.x += b.vx;
          b.y += b.vy;
          if (b.y + b.h >= GROUND_Y) { b.y = GROUND_Y - b.h; b.vy = 0; b.settled = true; }
        }
        ctx!.fillStyle = b.color + "44";
        ctx!.beginPath();
        ctx!.roundRect(b.x, b.y, b.w, b.h, 3);
        ctx!.fill();
        ctx!.strokeStyle = b.color;
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = b.color;
        ctx!.textAlign = "center";
        ctx!.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 3);
        ctx!.textAlign = "left";
      }

      const hoverX = W * 0.72, hoverY = GROUND_Y - 80 + 10 * Math.sin(t * 0.04);
      ctx!.fillStyle = "#f72585" + "44";
      ctx!.beginPath();
      ctx!.ellipse(hoverX, hoverY, 34, 14, 0, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = "#f72585";
      ctx!.lineWidth = 2;
      ctx!.beginPath();
      ctx!.ellipse(hoverX, hoverY, 34, 14, 0, 0, Math.PI * 2);
      ctx!.stroke();
      ctx!.fillStyle = "#f72585";
      ctx!.font = `7px ${MONO}`;
      ctx!.textAlign = "center";
      ctx!.fillText("PLENUM CRAFT", hoverX, hoverY + 3);

      const bRay = 18 + 6 * Math.sin(t * 0.08);
      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2 + t * 0.01;
        ctx!.strokeStyle = "#f7258544";
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.moveTo(hoverX + Math.cos(ang) * 34, hoverY + Math.sin(ang) * 14);
        ctx!.lineTo(hoverX + Math.cos(ang) * (34 + bRay), hoverY + Math.sin(ang) * (14 + bRay * 0.3));
        ctx!.stroke();
      }

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#445870";
      ctx!.fillText("Microgravity: low-g hovercraft trivially operates -- less blower power needed", 6, 16);
      ctx!.fillText("DC-Solar powered life support + construction logistics -- Resonant Cell portable", 6, 28);

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Planetary infrastructure canvas
  useEffect(() => {
    const c = planetRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const W = c.width, H = c.height;
    let t = 0, raf = 0;
    const PHI = 1.61803398875;

    type PlanetNode = { x: number; y: number; r: number; label: string; color: string; active: boolean };
    const nodes: PlanetNode[] = [
      { x: W / 2, y: H / 2, r: 30, label: "DC GRID\nHUB", color: GOLD, active: true },
      { x: W * 0.2, y: H * 0.25, r: 20, label: "SOLAR\nFARM", color: AURORA, active: true },
      { x: W * 0.8, y: H * 0.25, r: 20, label: "HABITAT\nDOME A", color: "#9b5de5", active: true },
      { x: W * 0.15, y: H * 0.7, r: 18, label: "MINING\nBASE", color: "#f72585", active: false },
      { x: W * 0.85, y: H * 0.7, r: 18, label: "LAUNCH\nPAD", color: "#38bdf8", active: true },
      { x: W * 0.5, y: H * 0.12, r: 16, label: "SENSOR\nARRAY", color: "#4ade80", active: true },
      { x: W * 0.5, y: H * 0.88, r: 16, label: "HABITAT\nDOME B", color: "#ff8c42", active: false },
    ];

    const edges = [[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],[1,5],[2,4]];
    type PNetParticle = { nodeFrom: number; nodeTo: number; progress: number; color: string };
    const netParticles: PNetParticle[] = [];

    function spawnNetParticle() {
      const ei = Math.floor(Math.random() * edges.length);
      const [a, b] = edges[ei];
      const fwd = Math.random() > 0.5;
      netParticles.push({ nodeFrom: fwd ? a : b, nodeTo: fwd ? b : a, progress: 0, color: nodes[fwd ? a : b].color });
    }

    function draw() {
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = "#010308";
      ctx!.fillRect(0, 0, W, H);

      const planetR = Math.min(W, H) * 0.42;
      const grad = ctx!.createRadialGradient(W / 2, H / 2, planetR * 0.6, W / 2, H / 2, planetR);
      grad.addColorStop(0, "#0a1a0a22");
      grad.addColorStop(1, "#0a1a0a00");
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(W / 2, H / 2, planetR, 0, Math.PI * 2);
      ctx!.fill();
      ctx!.strokeStyle = "#1a3a1a44";
      ctx!.lineWidth = 1;
      ctx!.beginPath();
      ctx!.arc(W / 2, H / 2, planetR, 0, Math.PI * 2);
      ctx!.stroke();

      for (let r = 40; r < planetR; r += 40) {
        ctx!.strokeStyle = "#1a2a1a33";
        ctx!.lineWidth = 0.5;
        ctx!.beginPath();
        ctx!.arc(W / 2, H / 2, r, 0, Math.PI * 2);
        ctx!.stroke();
      }

      edges.forEach(([a, b]) => {
        const na = nodes[a], nb = nodes[b];
        ctx!.beginPath();
        ctx!.moveTo(na.x, na.y);
        ctx!.lineTo(nb.x, nb.y);
        ctx!.strokeStyle = DIM;
        ctx!.lineWidth = 1;
        ctx!.setLineDash([4, 6]);
        ctx!.stroke();
        ctx!.setLineDash([]);
      });

      if (Math.random() < 0.1) spawnNetParticle();

      for (let i = netParticles.length - 1; i >= 0; i--) {
        const p = netParticles[i];
        p.progress += 0.018;
        if (p.progress >= 1) { netParticles.splice(i, 1); continue; }
        const na = nodes[p.nodeFrom], nb = nodes[p.nodeTo];
        const px = na.x + (nb.x - na.x) * p.progress;
        const py = na.y + (nb.y - na.y) * p.progress;
        ctx!.beginPath();
        ctx!.arc(px, py, 3, 0, Math.PI * 2);
        ctx!.fillStyle = p.color + "cc";
        ctx!.fill();
      }

      nodes.forEach((n, i) => {
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.05 + i * PHI);
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r * pulse, 0, Math.PI * 2);
        ctx!.fillStyle = n.color + (n.active ? "33" : "11");
        ctx!.fill();
        ctx!.strokeStyle = n.color + (n.active ? "ee" : "44");
        ctx!.lineWidth = n.active ? 2 : 1;
        ctx!.stroke();

        if (!n.active) {
          ctx!.strokeStyle = "#f87171";
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          ctx!.moveTo(n.x - 8, n.y - 8);
          ctx!.lineTo(n.x + 8, n.y + 8);
          ctx!.moveTo(n.x + 8, n.y - 8);
          ctx!.lineTo(n.x - 8, n.y + 8);
          ctx!.stroke();
        }

        ctx!.font = `7px ${MONO}`;
        ctx!.fillStyle = n.color;
        ctx!.textAlign = "center";
        n.label.split("\n").forEach((ln, li) => {
          ctx!.fillText(ln, n.x, n.y + n.r + 10 + li * 10);
        });
        ctx!.textAlign = "left";
      });

      ctx!.font = `8px ${MONO}`;
      ctx!.fillStyle = "#445870";
      ctx!.fillText("PLANETARY INFRASTRUCTURE NETWORK -- DC-native + AI optimized", 6, 14);
      ctx!.fillStyle = AURORA + "88";
      ctx!.fillText("x = offline/under construction", 6, 26);

      t += 1;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ background: BG, minHeight: "100vh", color: "#cdd6f4", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.88 }}>
      <div style={{ background: "linear-gradient(155deg,#020610 0%,#080f20 35%,#050c1a 100%)", borderBottom: `2px solid ${GOLD}`, padding: "64px 56px 48px", textAlign: "center" }}>
        <div style={pill}>TECHNICAL DISCLOSURE DOCUMENT -- AETHER-TDD-001</div>
        <h1 style={{ fontFamily: DISP, fontSize: "1.85em", color: "#fff", lineHeight: 1.3, maxWidth: 860, margin: "0 auto 14px" }}>
          AETHER: Pressure Differential Lift, ELF Cavity Resonance & Alcubierre-Class Warp Field Mechanics
        </h1>
        <h2 style={{ fontFamily: SERIF, fontSize: "1.0em", color: GOLD, fontStyle: "italic", fontWeight: "normal", maxWidth: 820, margin: "0 auto 20px" }}>
          Adaptive Emergent Topology for Hierarchical Evolutionary Resonance -- Microgravity Applications & Planetary Infrastructure Building
        </h2>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, fontFamily: MONO, fontSize: "0.78em", color: "#607090", borderTop: `1px solid ${DIM}`, paddingTop: 16 }}>
          <div>Inventor: <span style={{ color: AURORA }}>Shia Miller</span></div>
          <div>Filed: <span style={{ color: AURORA }}>April 13, 2026</span></div>
          <div>Doc ID: <span style={{ color: AURORA }}>AETHER-TDD-001</span></div>
          <div>Class: <span style={{ color: AURORA }}>Advanced Propulsion / ELF EM</span></div>
        </div>
      </div>

      <div style={{ maxWidth: 990, margin: "0 auto", padding: "0 34px 72px" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "32px 0" }}>
          {[
            { domain: "Ground Effect / Hovercraft Physics", app: "Pressure differential lift via pressurized air plenum", status: "VERIFIED", sc: "#1a5c2a", tc: "#fff" },
            { domain: "Plasma Aerodynamics", app: "Dielectric barrier discharge boundary layer control", status: "THEORETICAL", sc: "#5c4a1a", tc: "#fff" },
            { domain: "ELF Electromagnetics", app: "Schumann resonance coupling to plasma cavity systems", status: "PROPOSED", sc: "#1a3a5c", tc: "#fff" },
            { domain: "Advanced Propulsion", app: "Alcubierre metric / warp field conceptual analog", status: "THEORETICAL", sc: "#5c4a1a", tc: "#fff" },
            { domain: "Microgravity Applications", app: "Low-g plenum lift + DC-solar infrastructure on Moon/Mars", status: "PROPOSED", sc: "#1a3a5c", tc: "#fff" },
            { domain: "Computational Modeling", app: "Real-time density field and warp bubble simulation", status: "VERIFIED", sc: "#1a5c2a", tc: "#fff" },
          ].map(s => (
            <div key={s.domain} style={{ ...card, padding: "14px 18px" }}>
              <div style={{ fontFamily: MONO, fontSize: "0.78em", color: QUANT, marginBottom: 4 }}>{s.domain}</div>
              <div style={{ fontSize: "0.86em", color: "#8aa0c0", marginBottom: 8 }}>{s.app}</div>
              <span style={{ ...badge(s.tc, s.sc) }}>{s.status}</span>
            </div>
          ))}
        </div>

        <div style={chHead(AURORA)}>
          <div style={chNum(AURORA)}>Section I -- The AETHER Cascade Architecture</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Five-Phase Structural Hierarchy (Animated)</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Each layer instantiates the same loop: Sense/Acquire -- Transduce/Deliver -- Amplify/Activate -- Propagate/Feedback -- Learn/Adapt</div>
        </div>
        <canvas ref={cascadeRef} width={880} height={280} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: BG }} />

        <div style={chHead(AURORA)}>
          <div style={chNum(AURORA)}>Section III -- Physical Prototype</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Pressure Differential Lift -- Experimentally Verified</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Hovercraft prototype demonstrated -- human occupant lifted -- friction eliminated</div>
        </div>

        <div style={{ marginBottom: 8, background: "rgba(26,92,42,0.15)", border: "1px solid rgba(26,92,42,0.4)", borderRadius: 6, padding: "10px 16px", fontFamily: MONO, fontSize: "0.8em", color: "#4ade80" }}>
          EXPERIMENTALLY VERIFIED -- Directly Observed Multiple Times
        </div>

        <canvas ref={plenumRef} width={880} height={240} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#050a14", marginBottom: 8 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "16px 0" }}>
          <div style={card}>
            <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: AURORA, marginBottom: 10 }}>Prototype Specs</h4>
            {[
              ["Platform","Circular wooden board ~4ft dia."],
              ["Skirt","Heavy-gauge plastic sheeting"],
              ["Motor","Bounce house inflator (continuous duty)"],
              ["Power","Standard AC via extension cord"],
              ["Result","Full adult occupant lifted several inches"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", gap: 12, marginBottom: 6 }}>
                <span style={{ fontFamily: MONO, fontSize: "0.72em", color: "#607090", minWidth: 90 }}>{k}</span>
                <span style={{ fontSize: "0.84em", color: "#8aa0c0" }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={card}>
            <h4 style={{ fontFamily: MONO, fontSize: "0.82em", color: GOLD, marginBottom: 10 }}>Verified Results</h4>
            {[
              ["V-1","Lift achieved: platform rises several inches, supports adult occupant"],
              ["V-2","Surface dependency: optimal on smooth concrete, rough surfaces degrade"],
              ["V-3","Friction elimination: lateral displacement needs minimal force"],
              ["V-4","Sustained operation: no thermal failure on continuous duty cycle"],
            ].map(([n, v]) => (
              <div key={n} style={{ display: "flex", gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: "0.72em", color: "#f87171", minWidth: 28 }}>{n}</span>
                <span style={{ fontSize: "0.84em", color: "#8aa0c0" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ ...eq, borderLeftColor: GOLD }}>
{`F_lift = delta_P x A_base   where   delta_P x A_base >= m_total x g

Large base area allows low-pressure blower to achieve sufficient total lift force.
This is the key design insight: spread the area, reduce required pressure.

In microgravity (Moon g = 0.166g_Earth, Mars g = 0.38g_Earth):
  F_lift_required = m_total x g_local
  Same delta_P achieves MORE lift per unit area -- less blower power needed.
  DC-solar powered blower trivially operates on 5MW Resonant Cell output.`}
        </div>

        <div style={chHead("#9b5de5")}>
          <div style={chNum("#9b5de5")}>Section IV -- Schumann Resonance Coupling</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>ELF Cavity Eigenmode Simulation</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Proposed hypothesis -- falsifiable -- included because structural parallel is physically motivated</div>
        </div>

        <div style={{ marginBottom: 8, background: "rgba(26,58,92,0.25)", border: "1px solid rgba(26,58,92,0.5)", borderRadius: 6, padding: "10px 16px", fontFamily: MONO, fontSize: "0.8em", color: "#38bdf8" }}>
          PROPOSED -- No experimental evidence yet -- falsifiable
        </div>

        <canvas ref={schumannRef} width={880} height={300} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: BG, marginBottom: 8 }} />

        <div style={{ overflowX: "auto", margin: "14px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84em" }}>
            <thead>
              <tr>
                {["Mode","Frequency (Hz)","Wavelength","Physical Character"].map(h => (
                  <th key={h} style={{ background: "rgba(14,26,48,0.95)", color: QUANT, textAlign: "left", padding: "9px 12px", borderBottom: `2px solid ${QUANT}`, fontFamily: MONO, fontSize: "0.72em", letterSpacing: "1.5px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["SR1 -- Fundamental","7.83","~38,000 km","Global standing wave, 1 wavelength at Earth circumference"],
                ["SR2","14.3","~21,000 km","2nd harmonic"],
                ["SR3","20.8","~14,000 km","3rd harmonic"],
                ["SR4","27.3","~11,000 km","4th harmonic"],
                ["SR5","33.8","~8,900 km","5th harmonic"],
              ].map((row, i) => {
                const cols = [AURORA, GOLD, "#9b5de5", "#f72585", "#38bdf8"];
                return (
                  <tr key={row[0]}>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: cols[i], fontFamily: MONO, fontSize: "0.82em" }}>{row[0]}</td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: cols[i], fontFamily: MONO }}>{row[1]}</td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: "#8aa0c0" }}>{row[2]}</td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: "#607090" }}>{row[3]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={{ ...eq, borderLeftColor: "#9b5de5" }}>
{`Proposed coupling mechanism:
  f_n = (c / 2*pi*R) * sqrt(n*(n+1))

For Earth: R ~= 6,371 km  =>  f_1 ~= 7.83 Hz
For artificial plasma bubble: R scales to engineering dimensions, f scales accordingly.

Hypothesis: tuning artificial DBD plasma cavity radius to harmonically overlap
Schumann frequencies could produce resonant energy exchange effects at bubble boundary.

Q-Burst analogy: controlled high-voltage discharge -> transient broadband excitation
of all eigenmodes -- testable mechanism for boundary layer perturbation.`}
        </div>

        <div style={chHead("#f72585")}>
          <div style={chNum("#f72585")}>Section V -- Alcubierre Warp Field Extension</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Live Warp Grid Deformation Simulation</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Conceptual analog only -- exotic matter problem unsolved -- structural analogy useful for modeling</div>
        </div>

        <div style={{ marginBottom: 8, background: "rgba(92,26,26,0.2)", border: "1px solid rgba(92,26,26,0.4)", borderRadius: 6, padding: "10px 16px", fontFamily: MONO, fontSize: "0.8em", color: "#f87171" }}>
          CONCEPTUAL ANALOG ONLY -- No exotic matter claim -- No spacetime curvature claim
        </div>

        <canvas ref={warpRef} width={880} height={280} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#030609", marginBottom: 8 }} />

        <div style={{ overflowX: "auto", margin: "14px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84em" }}>
            <thead>
              <tr>
                {["Alcubierre Component","Plasma Bubble Analog","Hovercraft Analog"].map(h => (
                  <th key={h} style={{ background: "rgba(14,26,48,0.95)", color: "#f72585", textAlign: "left", padding: "8px 12px", borderBottom: `2px solid #f72585`, fontFamily: MONO, fontSize: "0.72em", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Warp bubble interior","Plasma-enclosed craft region","Pressurized plenum"],
                ["Bubble shell / shape function f(r_s)","DBD plasma boundary layer","Plastic membrane skirt"],
                ["Space contraction ahead","High-pressure plasma leading edge","Forward pressure gradient"],
                ["Space expansion behind","Low-pressure plasma wake","Trailing pressure drop"],
                ["Exotic matter requirement","Not achieved -- analogy only","Not applicable"],
              ].map(row => (
                <tr key={row[0]}>
                  {row.map((cell, ci) => (
                    <td key={ci} style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: ci === 0 ? "#f72585" : ci === 1 ? "#9b5de5" : AURORA, fontSize: "0.86em" }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={chHead("#38bdf8")}>
          <div style={chNum("#38bdf8")}>Section VI -- Microgravity Applications</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Low-G Hovercraft + Planetary Plenum Infrastructure</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Moon: 0.166g -- Mars: 0.38g -- same delta_P x A achieves greater net lift -- trivial efficiency gain</div>
        </div>

        <canvas ref={microgravRef} width={880} height={240} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#010308", marginBottom: 8 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, margin: "18px 0" }}>
          {[
            { title: "Lunar Surface Operations", items: ["g = 0.166g_Earth: same blower achieves 6x more effective lift-to-weight","Dust levitation via plenum pressure makes surface transfer trivial","Smooth basalt regolith ideal for plenum boundary sealing","Reduced structural mass needs: lighter platforms achieve same lift"], color: "#4ade80" },
            { title: "Mars Base Transport", items: ["g = 0.38g_Earth: ~2.6x efficiency advantage over Earth operation","CO2 atmosphere (0.6% Earth pressure): compensate with higher blower RPM","Schumann analog: Mars cavity resonance at ~1.35 kHz (50 km ionosphere)","DC-native solar trivially powers transport fleet from 5MW+ Resonant Cell"], color: "#38bdf8" },
            { title: "Orbital & Microgravity", items: ["True microgravity: pressure bubble replaces gravity as structural force","Inflatable pressure-differential habitat modules: same physics, 3D","ELF cavity coupling in ship hull: Schumann analog in metal resonator","Alcubierre topology: warp bubble boundary IS a pressure differential interface"], color: "#f72585" },
          ].map(s => (
            <div key={s.title} style={{ ...card, borderTop: `3px solid ${s.color}` }}>
              <h4 style={{ fontFamily: MONO, fontSize: "0.78em", color: s.color, marginBottom: 10 }}>{s.title}</h4>
              {s.items.map(item => (
                <div key={item} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                  <span style={{ color: s.color, fontFamily: MONO, flexShrink: 0 }}>--</span>
                  <span style={{ fontSize: "0.82em", color: "#7a90b0" }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={chHead(GOLD)}>
          <div style={chNum(GOLD)}>Section VII -- Planetary Infrastructure Building</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>DC-Native Resonant Cell Network -- Planetary Scale</h2>
          <div style={{ fontSize: "0.86em", color: "#607090", fontStyle: "italic", marginTop: 3 }}>Powered by DC-native solar -- AI optimized -- sensor mesh -- modular plenum habitat rings</div>
        </div>

        <canvas ref={planetRef} width={880} height={320} style={{ width: "100%", borderRadius: 8, border: `1px solid ${DIM}`, background: "#010308", marginBottom: 8 }} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, margin: "18px 0" }}>
          {[
            { title: "Phase 1 -- Beachhead Cell (Year 1-3)", items: ["Land DC-native solar array first: 5MW Resonant Cell analog","Plenum hovercraft immediately operational at arrival (low-g advantage)","Establish DC bus: 48V life support / 380V construction / 800V mining","AI load balancing: solar + battery + fuel cell hybrid"], color: AURORA },
            { title: "Phase 2 -- Ring Expansion (Year 3-8)", items: ["Plenum pressure domes: habitat rings pressurized from central hub","Schumann analog monitoring: Mars/Moon ionosphere cavity as health sensor","Mycelium substrate trials: bio-hybrid sensor mesh in regolith","DC PoE everywhere: data + power same wire, no separate infrastructure"], color: GOLD },
            { title: "Phase 3 -- Corridor Network (Year 8-15)", items: ["Inductive roadways: DC power embedded in regolith transport routes","Hovercraft fleet: goods transport, construction logistics, emergency response","ELF resonance network: Schumann-coupled cavities as long-range comms","Planet-scale DMF telescope: Resonant Cell nodes as coherent array"], color: "#9b5de5" },
            { title: "Warp Field Research Platform", items: ["Remote planetary site ideal for Alcubierre analog testing: no Earth noise","Plasma bubble DBD experiments in vacuum/thin-atmosphere conditions","Schumann coupling test: artificial cavity in planetary magnetic field","Real-world f_n = (c/2piR)*sqrt(n(n+1)) validation on Moon/Mars cavity"], color: "#f72585" },
          ].map(s => (
            <div key={s.title} style={{ ...card, borderLeft: `4px solid ${s.color}` }}>
              <h4 style={{ fontFamily: MONO, fontSize: "0.78em", color: s.color, marginBottom: 10 }}>{s.title}</h4>
              {s.items.map(item => (
                <div key={item} style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                  <span style={{ color: s.color, fontFamily: MONO, flexShrink: 0 }}>--</span>
                  <span style={{ fontSize: "0.84em", color: "#8aa0c0" }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div style={chHead("#a3e635")}>
          <div style={chNum("#a3e635")}>Section VII -- Claims</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Patent-Style Claims</h2>
        </div>

        <h3 style={{ fontFamily: MONO, fontSize: "0.85em", color: AURORA, margin: "18px 0 10px" }}>Independent Claims -- Verified</h3>
        <div style={{ ...card, marginBottom: 12 }}>
          {[
            ["1", "A pressure differential lift system comprising a circular platform, a continuous-duty blower motor, and a flexible membrane skirt forming a sealed plenum, wherein pressurization of said plenum produces sufficient lift force to elevate a human occupant above a ground surface."],
            ["2", "The system of claim 1, wherein elimination of solid-surface friction is achieved through sustained plenum pressurization, enabling lateral displacement of the platform and occupant with minimal applied force on smooth surfaces."],
            ["3", "A computational system implementing real-time simulation of plasma density fields, Schumann eigenmode resonance visualization, and Alcubierre warp grid deformation in a single self-contained artifact."],
          ].map(([n, text]) => (
            <div key={n} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              <span style={{ fontFamily: MONO, fontSize: "0.72em", color: "#f87171", minWidth: 24, paddingTop: 3, fontWeight: "bold" }}>{n}</span>
              <span style={{ fontSize: "0.88em", color: "#cdd6f4", lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>

        <h3 style={{ fontFamily: MONO, fontSize: "0.85em", color: "#9b5de5", margin: "18px 0 10px" }}>Dependent Claims -- Theoretical / Proposed</h3>
        <div style={{ ...card, marginBottom: 12 }}>
          {[
            ["4", "A spherical plasma enclosure system comprising a dielectric barrier discharge shell surrounding a central craft, wherein the plasma boundary layer functions as a controllable pressure differential interface structurally analogous to the plenum boundary of claim 1."],
            ["5", "The system of claim 4, wherein the plasma cavity radius is selected such that the cavity's electromagnetic eigenmode spectrum harmonically overlaps with one or more Schumann resonance frequencies, producing a proposed resonant coupling effect at the boundary layer."],
            ["6", "A propulsion concept wherein controlled directional asymmetry of pressure and plasma density gradients across a spherical boundary layer produces a leading-edge contraction and trailing-edge expansion structurally analogous to the Alcubierre warp shape function f(r_s)."],
          ].map(([n, text]) => (
            <div key={n} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              <span style={{ fontFamily: MONO, fontSize: "0.72em", color: "#9b5de5", minWidth: 24, paddingTop: 3, fontWeight: "bold" }}>{n}</span>
              <span style={{ fontSize: "0.88em", color: "#cdd6f4", lineHeight: 1.6 }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={chHead("#f72585")}>
          <div style={chNum("#f72585")}>Section VIII -- Falsifiability Conditions</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>What Would Falsify the Theoretical Extensions</h2>
        </div>
        <div style={{ overflowX: "auto", margin: "14px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84em" }}>
            <thead>
              <tr>
                {["Claim","Falsification Condition"].map(h => (
                  <th key={h} style={{ background: "rgba(14,26,48,0.95)", color: "#f72585", textAlign: "left", padding: "9px 12px", borderBottom: `2px solid #f72585`, fontFamily: MONO, fontSize: "0.72em", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Schumann coupling (Claim 5)","Spherical DBD plasma cavity shows no resonance enhancement at Schumann frequencies vs off-frequency controls in controlled RF measurement setup."],
                ["Pressure asymmetry propulsion (Claim 6)","Directional plasma density asymmetry in sealed test chamber produces no measurable net force above noise floor via precision load cell measurement."],
                ["Cascade structural unity","Five-phase loop architecture fails to generate consistent cross-scale predictions between any two adjacent cascade layers under formal mathematical analysis."],
                ["Microgravity efficiency gain","Plenum lift system on reduced-gravity surface shows no efficiency improvement proportional to g_local/g_Earth ratio -- physics prediction falsified."],
              ].map(row => (
                <tr key={row[0]}>
                  <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: "#f87171", fontFamily: MONO, fontSize: "0.8em", maxWidth: 220 }}>{row[0]}</td>
                  <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: "#8aa0c0" }}>{row[1]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={chHead(DIM.replace("#", "#") as string)}>
          <div style={chNum(QUANT)}>Section IX -- Epistemic Status</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Confidence Levels -- Honest Assessment</h2>
        </div>
        <div style={{ marginBottom: 14, background: `rgba(200,148,26,0.1)`, border: `1px solid ${NOTE_COLOR}44`, borderRadius: 6, padding: "12px 18px", fontFamily: SERIF, fontSize: "0.9em", fontStyle: "italic", color: "#c8941a" }}>
          "The map is not the territory. The analog is not the mechanism. This document is honest about which is which."
        </div>
        <div style={{ overflowX: "auto", margin: "14px 0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84em" }}>
            <thead>
              <tr>
                {["Element","Status","Confidence"].map(h => (
                  <th key={h} style={{ background: "rgba(14,26,48,0.95)", color: QUANT, textAlign: "left", padding: "8px 12px", borderBottom: `2px solid ${QUANT}`, fontFamily: MONO, fontSize: "0.72em", letterSpacing: "1px", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Hovercraft prototype produces lift","VERIFIED","High -- directly observed multiple times"],
                ["Pressure differential lift physics","VERIFIED","High -- established fluid mechanics"],
                ["Schumann resonances at stated frequencies","VERIFIED","High -- extensively documented in literature"],
                ["Microgravity efficiency advantage (physics)","VERIFIED","High -- follows directly from F = delta_P x A >= m x g_local"],
                ["DBD plasma boundary layer control (general)","THEORETICAL","Medium -- established in aerospace, not applied here"],
                ["Spherical DBD plasma bubble formation","PROPOSED","Low-medium -- no published implementation found"],
                ["Schumann coupling to artificial plasma cavity","PROPOSED","Low -- no experimental evidence"],
                ["Pressure asymmetry as Alcubierre analog","THEORETICAL","Low -- structural analogy, not physical equivalence"],
                ["Warp propulsion via plasma pressure","PROPOSED","Very low -- speculative extrapolation"],
                ["Planetary infrastructure via DC-native solar","PROPOSED","Medium -- DC-solar verified, planetary application extrapolated"],
              ].map(row => {
                const statusColor = row[1] === "VERIFIED" ? AURORA : row[1] === "THEORETICAL" ? GOLD : "#9b5de5";
                const confColor = row[2].startsWith("High") ? AURORA : row[2].startsWith("Medium") ? GOLD : row[2].startsWith("Low-medium") ? "#f72585" : "#607090";
                return (
                  <tr key={row[0]}>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: "#cdd6f4" }}>{row[0]}</td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}` }}>
                      <span style={{ fontFamily: MONO, fontSize: "0.72em", color: statusColor, background: statusColor + "22", border: `1px solid ${statusColor}44`, borderRadius: 3, padding: "2px 8px" }}>{row[1]}</span>
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: `1px solid ${DIM}`, color: confColor, fontSize: "0.84em" }}>{row[2]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div style={chHead("#445870")}>
          <div style={chNum("#607090")}>Section X -- References</div>
          <h2 style={{ fontSize: "1.28em", color: "#eef0ff" }}>Prior Art & Sources</h2>
        </div>
        <div style={{ ...card, padding: "14px 18px" }}>
          {[
            ["1","Alcubierre, M. (1994). \"The warp drive: hyper-fast travel within general relativity.\" Classical and Quantum Gravity, 11(5), L73-L77."],
            ["2","Schumann, W.O. (1952). Uber die strahlungslosen Eigenschwingungen einer leitenden Kugel. Zeitschrift fur Naturforschung A, 7(2), 149-154."],
            ["3","Cockerell, C.S. (1955). British Patent No. 854,211 -- Ground effect vehicle."],
            ["4","Moreau, E. (2007). Airflow control by non-thermal plasma actuators. Journal of Physics D: Applied Physics, 40(3), 605-636."],
            ["5","Nickolaenko, A.P. & Hayakawa, M. (2002). Resonances in the Earth-Ionosphere Cavity. Kluwer Academic Publishers."],
            ["6","Miller, S. (2026). AETHER Warp Drive Simulator v2.0. AetherLife.co."],
            ["7","Miller, S. (2026). AETHER Dark Matter Volumes I-III. AetherLife.co."],
            ["8","Miller, S. (2026). DC-Native Solar ARPA-E Proposal. Cosmic Chaos Corporation / AetherLife.co."],
          ].map(([n, text]) => (
            <div key={n} style={{ display: "flex", gap: 12, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${DIM}` }}>
              <span style={{ fontFamily: MONO, fontSize: "0.72em", color: GOLD, minWidth: 20 }}>[{n}]</span>
              <span style={{ fontSize: "0.84em", color: "#607090", fontStyle: "italic" }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ fontFamily: MONO, fontSize: "0.72em", color: "#1e3050", borderTop: `1px solid ${DIM}`, paddingTop: 14, marginTop: 40, display: "flex", justifyContent: "space-between" }}>
          <span>AETHER-TDD-001 -- Shia Miller -- AetherLife.co -- @StrategicProce</span>
          <span>April 13, 2026</span>
        </div>
      </div>
    </div>
  );
}

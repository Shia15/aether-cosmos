import { useEffect, useRef, useState, useCallback } from "react";

// ── AETHER color palette ────────────────────────────────────────────────────
const G   = "#00ff88";
const BRD = "rgba(0,255,136,0.12)";
const CYAN = "#06b6d4";
const GOLD = "#fbbf24";
const PURP = "#c084fc";
const RED  = "#f87171";

// ── Tokamak geometry (cm → canvas) ─────────────────────────────────────────
// Reference: radial 500-1300 cm, vertical -700 to 500 cm
const GEO = {
  R0: 880,   // major radius (cm) — tokamak axis
  a:  220,   // minor radius (cm)
  kappa: 1.75, // elongation
  delta: 0.35, // triangularity
  blanketThk: 80, // blanket thickness (cm)
  vesselThk: 30,  // vessel wall thickness (cm)
  rMin: 500, rMax: 1340, vMin: -720, vMax: 540,
};

// Parametric D-shape: returns [x, y] in cm
function dShape(theta: number, R0: number, a: number, kappa: number, delta: number) {
  return [
    R0 + a * Math.cos(theta + delta * Math.sin(theta)),
    kappa * a * Math.sin(theta),
  ];
}

// Map cm → canvas pixels
function toCanvas(cx: number, cy: number, W: number, H: number) {
  const px = ((cx - GEO.rMin) / (GEO.rMax - GEO.rMin)) * W;
  const py = ((GEO.vMax - cy) / (GEO.vMax - GEO.vMin)) * H;
  return [px, py];
}

// ── Types ────────────────────────────────────────────────────────────────────
interface Neutron { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; breed: boolean }
interface BreedEvent { x: number; y: number; t: number; kind: "Li6" | "Li7" }
interface AetherNode { id: number; x: number; y: number; label: string; coherence: number; pulseT: number }
interface ExtractParticle { t: number; frac: number } // frac 0→1 along extraction path

// ── AETHER circuit nodes (placed in blanket breeding zones) ─────────────────
const BASE_NODES: Omit<AetherNode, "coherence" | "pulseT">[] = [
  { id: 0, x: 880,  y:   0,  label: "DT PLASMA" },
  { id: 1, x: 1080, y:  80,  label: "BREED A" },
  { id: 2, x: 1060, y: -90,  label: "BREED B" },
  { id: 3, x: 960,  y: 280,  label: "BREED C" },
  { id: 4, x: 960,  y:-280,  label: "BREED D" },
  { id: 5, x: 820,  y: 340,  label: "BREED E" },
  { id: 6, x: 820,  y:-340,  label: "BREED F" },
  { id: 7, x: 1130, y:   0,  label: "EXTRACT" },
];
const EDGES = [[0,1],[0,2],[0,3],[0,4],[1,7],[2,7],[3,5],[4,6],[5,7],[6,7],[3,4],[1,2]];

// ── Utility ──────────────────────────────────────────────────────────────────
function rand(a: number, b: number) { return a + Math.random() * (b - a); }
function clamp(v: number, a: number, b: number) { return Math.max(a, Math.min(b, v)); }

// ── Main page ────────────────────────────────────────────────────────────────
function TritiumExtractHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const particles: {x:number;y:number;vx:number;vy:number;life:number}[]=[];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.28)"; ctx.fillRect(0,0,W,H);
      if(Math.random()<0.3) particles.push({x:W*0.5+(-1+Math.random()*2)*20,y:H*0.7,vx:(-1+Math.random()*2)*0.6,vy:-1.2-Math.random(),life:1});
      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];
        p.x+=p.vx;p.y+=p.vy;p.life-=0.018;
        const alpha=p.life*0.8;
        ctx.beginPath();ctx.arc(p.x,p.y,2,0,Math.PI*2);ctx.fillStyle=`rgba(68,170,255,${alpha})`;ctx.fill();
        if(p.life<=0) particles.splice(i,1);
      }
      for(let i=0;i<3;i++){
        const angle=i/3*Math.PI*2+t*0.02*(i+1);
        const ox=W*0.5+20*Math.cos(angle),oy=H/2+10*Math.sin(angle);
        ctx.beginPath();ctx.arc(ox,oy,4,0,Math.PI*2);ctx.fillStyle=`rgba(68,170,255,${0.3+0.3*Math.sin(t*0.05+i)})`;ctx.fill();
      }
      ctx.beginPath();ctx.arc(W*0.5,H/2,12,0,Math.PI*2);ctx.strokeStyle="rgba(68,170,255,0.2)";ctx.lineWidth=0.5;ctx.stroke();
      ctx.fillStyle="rgba(68,170,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("TRITIUM EXTRACT · HYDROGEN ISOTOPE · NUCLEAR FUSION · BETA DECAY · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function TritiumExtractPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef({
    neutrons:    [] as Neutron[],
    breedEvents: [] as BreedEvent[],
    nodes:       BASE_NODES.map(n => ({ ...n, coherence: 0.7 + Math.random() * 0.3, pulseT: 0 })) as AetherNode[],
    extractParts:[] as ExtractParticle[],
    t: 0,
    tbr: 1.08,
    extractRate: 0,
    tritiumInv: 0,
    blanketTemp: 743,
    lastExtract: 0,
    neutronFlux: 0,
  });
  const rafRef = useRef(0);

  // Live metrics state (updated every ~20 frames)
  const [metrics, setMetrics] = useState({ tbr: 1.08, extractRate: 0, tritiumInv: 0, blanketTemp: 743, flux: 3.2, coh: 0.91 });
  const [activeNode, setActiveNode] = useState<AetherNode | null>(null);
  const [log, setLog] = useState<{ t: string; msg: string; kind: string }[]>([
    { t: "00:00", msg: "AETHER quantum circuit initialised", kind: "info" },
    { t: "00:00", msg: "Li-6 breeding channel ACTIVE (⁶Li + n → T + ⁴He + 4.8 MeV)", kind: "breed" },
    { t: "00:00", msg: "Li-7 breeding channel STANDBY (⁷Li + n → T + ⁴He + n − 2.5 MeV)", kind: "li7" },
  ]);

  const addLog = useCallback((msg: string, kind: string) => {
    const now = new Date();
    const t = `${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;
    setLog(l => [{ t, msg, kind }, ...l].slice(0, 22));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Check if point inside plasma D-shape ────────────────────────────────
    function inPlasma(cx: number, cy: number) {
      // Approximate: check if point is inside the scaled D-shape
      const dx = cx - GEO.R0;
      const dy = cy;
      const normR = dx / GEO.a;
      const normZ = dy / (GEO.kappa * GEO.a);
      // Account for triangularity offset
      const shift = GEO.delta * normZ * normZ;
      return (normR - shift) * (normR - shift) + normZ * normZ < 0.85;
    }

    function inBlanket(cx: number, cy: number) {
      // Check if in annular region around plasma (blanket zone)
      const dx = cx - GEO.R0;
      const dy = cy;
      const normR = dx / (GEO.a + GEO.blanketThk);
      const normZ = dy / ((GEO.kappa * GEO.a) + GEO.blanketThk);
      const shift = GEO.delta * normZ * normZ;
      const outerIn = (normR - shift * 0.6) * (normR - shift * 0.6) + normZ * normZ < 1.0;
      return outerIn && !inPlasma(cx, cy);
    }

    // ── Spawn neutron from plasma ────────────────────────────────────────────
    function spawnNeutron() {
      // D-T plasma neutron source profile (peaked on-axis, slight outboard shift)
      const theta = rand(-Math.PI * 0.9, Math.PI * 0.9);
      const r = rand(0, 0.6);
      const cx = GEO.R0 + r * GEO.a * 0.6 * Math.cos(theta);
      const cy = r * GEO.kappa * GEO.a * 0.5 * Math.sin(theta);
      const angle = rand(0, Math.PI * 2);
      const speed = rand(2, 5); // cm/frame (scaled)
      stateRef.current.neutrons.push({
        x: cx, y: cy, vx: speed * Math.cos(angle), vy: speed * Math.sin(angle),
        life: 0, maxLife: rand(40, 90), breed: false,
      });
    }

    // ── Main draw loop ───────────────────────────────────────────────────────
    function draw() {
      const W = canvas.width, H = canvas.height;
      const ctx = canvas.getContext("2d")!;
      const s   = stateRef.current;
      s.t++;

      // Background
      ctx.fillStyle = "rgb(2,8,18)";
      ctx.fillRect(0, 0, W, H);

      // ── Draw tokamak layers ────────────────────────────────────────────────
      const N_STEPS = 200;
      const angles = Array.from({ length: N_STEPS + 1 }, (_, i) => (i / N_STEPS) * Math.PI * 2);

      // Helper: build canvas path for D-shape at scale factor sf
      function drawDPath(a: number, kappa: number, delta: number, extra = 0) {
        ctx.beginPath();
        for (let i = 0; i <= N_STEPS; i++) {
          const th = angles[i];
          const [cx, cy] = dShape(th, GEO.R0, a + extra, kappa, delta);
          const [px, py] = toCanvas(cx, cy, W, H);
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
      }

      // Vessel outer (gray fill)
      ctx.save();
      drawDPath(GEO.a + GEO.blanketThk + GEO.vesselThk, GEO.kappa + 0.04, GEO.delta, 0);
      ctx.fillStyle = "rgba(120,130,140,0.22)";
      ctx.fill();
      ctx.strokeStyle = "rgba(160,170,180,0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // Blanket (dark teal-black ring)
      ctx.save();
      drawDPath(GEO.a + GEO.blanketThk, GEO.kappa + 0.02, GEO.delta, 0);
      ctx.fillStyle = "rgba(15,40,35,0.85)";
      ctx.fill();
      ctx.strokeStyle = `rgba(0,255,136,0.25)`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Blanket glow (animated tritium activity)
      const glowPhase = Math.sin(s.t * 0.04);
      ctx.save();
      drawDPath(GEO.a + GEO.blanketThk, GEO.kappa + 0.02, GEO.delta, 0);
      ctx.clip();
      const [gc0x, gc0y] = toCanvas(GEO.R0 + GEO.a + GEO.blanketThk * 0.5, 0, W, H);
      const grad = ctx.createRadialGradient(gc0x, gc0y, 0, gc0x, gc0y, W * 0.12);
      grad.addColorStop(0, `rgba(0,255,136,${0.04 + 0.03 * glowPhase})`);
      grad.addColorStop(1, "rgba(0,255,136,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // Plasma region (D-T plasma core)
      ctx.save();
      drawDPath(GEO.a, GEO.kappa, GEO.delta, 0);
      ctx.fillStyle = "rgba(2,8,18,0.9)";
      ctx.fill();
      // Plasma gradient overlay
      const [pcx, pcy] = toCanvas(GEO.R0, 0, W, H);
      const plasmaGrad = ctx.createRadialGradient(pcx, pcy, 0, pcx, pcy, W * 0.13);
      plasmaGrad.addColorStop(0, `rgba(251,191,36,${0.15 + 0.08 * Math.sin(s.t * 0.03)})`);
      plasmaGrad.addColorStop(0.4, "rgba(251,191,36,0.04)");
      plasmaGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = plasmaGrad;
      ctx.fill();
      ctx.strokeStyle = `rgba(251,191,36,${0.3 + 0.15 * Math.sin(s.t * 0.05)})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // ── Neutron source probability heatmap dots (per image style) ──────────
      if (s.t % 3 === 0) {
        for (let d = 0; d < 3; d++) {
          const theta2 = rand(-Math.PI * 0.85, Math.PI * 0.85);
          const r2 = Math.random();
          const cx2 = GEO.R0 + r2 * GEO.a * 0.75 * Math.cos(theta2) * (1 - GEO.delta * Math.abs(Math.sin(theta2)));
          const cy2 = r2 * GEO.kappa * GEO.a * 0.75 * Math.sin(theta2);
          if (!inPlasma(cx2, cy2)) continue;
          const [px2, py2] = toCanvas(cx2, cy2, W, H);
          // Probability proportional to r2 (peaked centre) and position
          const prob = (1 - r2) * (1 - 0.3 * Math.abs(Math.sin(theta2)));
          let color: string;
          if (prob > 0.7) color = `rgba(6,182,212,${0.7 + 0.2 * prob})`;
          else if (prob > 0.5) color = `rgba(34,197,94,${0.6 + 0.2 * prob})`;
          else if (prob > 0.3) color = `rgba(220,38,38,${0.5 + 0.2 * prob})`;
          else color = `rgba(59,130,246,${0.5 + 0.2 * prob})`;
          ctx.beginPath();
          ctx.arc(px2, py2, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      // ── Spawn neutrons ────────────────────────────────────────────────────
      if (s.t % 4 === 0 && s.neutrons.length < 80) spawnNeutron();

      // ── Update + draw neutrons ────────────────────────────────────────────
      s.neutrons = s.neutrons.filter(n => n.life < n.maxLife);
      for (const n of s.neutrons) {
        n.x += n.vx; n.y += n.vy; n.life++;
        const life_frac = n.life / n.maxLife;
        const alpha = 1 - life_frac;

        if (inBlanket(n.x, n.y) && !n.breed && Math.random() < 0.08) {
          n.breed = true;
          const kind: "Li6" | "Li7" = Math.random() < 0.75 ? "Li6" : "Li7";
          s.breedEvents.push({ x: n.x, y: n.y, t: s.t, kind });
          s.neutrons.push({ x: n.x, y: n.y, vx: n.vx * 0.6 + rand(-1, 1), vy: n.vy * 0.6 + rand(-1, 1), life: 0, maxLife: 30, breed: true });
          // Update nearest node coherence
          let minD = Infinity, minN = s.nodes[0];
          for (const node of s.nodes) {
            const d = Math.hypot(node.x - n.x, node.y - n.y);
            if (d < minD) { minD = d; minN = node; }
          }
          minN.coherence = clamp(minN.coherence + 0.04, 0, 1);
          minN.pulseT = s.t;
          s.tritiumInv = Math.min(s.tritiumInv + (kind === "Li6" ? 1.0 : 0.6), 1000);
          s.tbr = clamp(s.tbr + 0.0005, 1.0, 1.25);
        }

        const [nx, ny] = toCanvas(n.x, n.y, W, H);
        ctx.beginPath(); ctx.arc(nx, ny, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = n.breed
          ? `rgba(0,255,136,${alpha * 0.9})`
          : `rgba(255,255,200,${alpha * 0.7})`;
        ctx.fill();

        // Neutron tail
        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.lineTo(nx - n.vx * 3, ny - n.vy * 3);
        ctx.strokeStyle = n.breed
          ? `rgba(0,255,136,${alpha * 0.3})`
          : `rgba(255,255,200,${alpha * 0.2})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // ── Draw breeding events (flash rings) ────────────────────────────────
      s.breedEvents = s.breedEvents.filter(e => s.t - e.t < 30);
      for (const e of s.breedEvents) {
        const age = s.t - e.t;
        const r = age * 2.5;
        const a2 = 1 - age / 30;
        const [bx, by] = toCanvas(e.x, e.y, W, H);
        ctx.beginPath(); ctx.arc(bx, by, r, 0, Math.PI * 2);
        ctx.strokeStyle = e.kind === "Li6"
          ? `rgba(0,255,136,${a2 * 0.8})`
          : `rgba(192,132,252,${a2 * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        // T label
        if (age < 12) {
          ctx.fillStyle = e.kind === "Li6" ? G : PURP;
          ctx.font = `bold ${Math.round(7 + age * 0.3)}px monospace`;
          ctx.fillText("T", bx + 4, by - 4);
        }
      }

      // ── AETHER circuit edges ──────────────────────────────────────────────
      for (const [i, j] of EDGES) {
        const ni = s.nodes[i], nj = s.nodes[j];
        const [px1, py1] = toCanvas(ni.x, ni.y, W, H);
        const [px2, py2] = toCanvas(nj.x, nj.y, W, H);
        const meanCoh = (ni.coherence + nj.coherence) / 2;
        const pulse = Math.sin(s.t * 0.06 + i * 0.8 + j * 0.5);
        ctx.beginPath(); ctx.moveTo(px1, py1); ctx.lineTo(px2, py2);
        ctx.strokeStyle = `rgba(0,255,136,${0.08 + 0.12 * meanCoh + 0.06 * pulse})`;
        ctx.lineWidth = 0.8 + meanCoh * 0.8;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Flowing information packets along edges (Fibonacci timing)
        const phi = 1.618;
        const pkFrac = ((s.t * 0.015 + i / phi + j * 0.3) % 1);
        const pkX = px1 + (px2 - px1) * pkFrac;
        const pkY = py1 + (py2 - py1) * pkFrac;
        ctx.beginPath(); ctx.arc(pkX, pkY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${0.5 + 0.4 * meanCoh})`;
        ctx.fill();
      }

      // ── AETHER circuit nodes ──────────────────────────────────────────────
      for (const node of s.nodes) {
        const [nx2, ny2] = toCanvas(node.x, node.y, W, H);
        const pulse2 = Math.sin(s.t * 0.08 + node.id * 1.1) * 0.5 + 0.5;
        const recentPulse = s.t - node.pulseT < 20;

        // Glow
        const glow = ctx.createRadialGradient(nx2, ny2, 0, nx2, ny2, recentPulse ? 16 : 8);
        glow.addColorStop(0, node.id === 0 ? `rgba(251,191,36,0.4)` : `rgba(0,255,136,${0.3 + 0.2 * pulse2})`);
        glow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath(); ctx.arc(nx2, ny2, recentPulse ? 16 : 8, 0, Math.PI * 2);
        ctx.fillStyle = glow; ctx.fill();

        // Node ring
        ctx.beginPath(); ctx.arc(nx2, ny2, 5, 0, Math.PI * 2);
        ctx.strokeStyle = node.id === 0 ? GOLD : (recentPulse ? G : `rgba(0,255,136,0.5)`);
        ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = "rgb(2,8,18)"; ctx.fill();
        // Inner dot
        ctx.beginPath(); ctx.arc(nx2, ny2, 2, 0, Math.PI * 2);
        ctx.fillStyle = node.id === 0 ? GOLD : G; ctx.fill();

        // Coherence arc
        ctx.beginPath();
        ctx.arc(nx2, ny2, 7, -Math.PI / 2, -Math.PI / 2 + node.coherence * Math.PI * 2);
        ctx.strokeStyle = `rgba(6,182,212,0.7)`; ctx.lineWidth = 1.5; ctx.stroke();

        // Label
        ctx.fillStyle = node.id === 0 ? GOLD : `rgba(0,255,136,0.8)`;
        ctx.font = "6px monospace";
        ctx.fillText(node.label, nx2 + 8, ny2 + 3);
        ctx.fillStyle = CYAN;
        ctx.font = "5px monospace";
        ctx.fillText(`${(node.coherence * 100).toFixed(0)}%`, nx2 + 8, ny2 + 10);

        // Decay coherence slowly
        node.coherence = clamp(node.coherence - 0.0008, 0.4, 1);
      }

      // ── Tritium extraction flow (periodic pulse) ──────────────────────────
      const extractPeriod = Math.round(300 / (1 + s.tbr - 1.0)); // faster at higher TBR
      if (s.t % extractPeriod === 0 && s.tritiumInv > 50) {
        s.extractParts.push({ t: s.t, frac: 0 });
        s.extractRate = s.tritiumInv * 0.18;
        s.tritiumInv = Math.max(0, s.tritiumInv - s.extractRate);
        s.lastExtract = s.t;
        const rate = s.extractRate.toFixed(1);
        addLog(`T extraction pulse: ${rate} g extracted (φ-gated timing)`, "extract");
        // Boost all node coherences on extraction
        for (const node of s.nodes) node.coherence = clamp(node.coherence + 0.12, 0, 1);
        s.nodes[7].pulseT = s.t;
      }

      // Draw extraction particles
      s.extractParts = s.extractParts.filter(ep => s.t - ep.t < 80);
      for (const ep of s.extractParts) {
        ep.frac = (s.t - ep.t) / 80;
        // Path: from EXTRACT node (node 7) outward and up
        const [ex1, ey1] = toCanvas(GEO.R0 + GEO.a + GEO.blanketThk + 30, 0, W, H);
        const [ex2, ey2] = toCanvas(GEO.rMax - 30, -100, W, H);
        const tx2 = ex1 + (ex2 - ex1) * ep.frac;
        const ty2 = ey1 + (ey2 - ey1) * ep.frac;
        ctx.beginPath(); ctx.arc(tx2, ty2, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251,191,36,${1 - ep.frac})`;
        ctx.fill();
        ctx.beginPath(); ctx.arc(tx2, ty2, 6, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(251,191,36,${(1 - ep.frac) * 0.4})`;
        ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = GOLD; ctx.font = "7px monospace";
        ctx.fillText("T", tx2 + 4, ty2 - 4);
      }

      // ── Update neutron flux metric ────────────────────────────────────────
      s.neutronFlux = s.neutrons.length * 0.042;
      s.tbr = clamp(s.tbr - 0.0001, 1.0, 1.25); // slight decay

      // Update UI metrics every 25 frames
      if (s.t % 25 === 0) {
        const meanCoh = s.nodes.reduce((a, n) => a + n.coherence, 0) / s.nodes.length;
        setMetrics({
          tbr: s.tbr,
          extractRate: s.extractRate,
          tritiumInv: s.tritiumInv,
          blanketTemp: 743 + Math.round(s.tbr * 15 + Math.random() * 4 - 2),
          flux: parseFloat(s.neutronFlux.toFixed(2)),
          coh: parseFloat(meanCoh.toFixed(3)),
        });

        // Random log events
        if (Math.random() < 0.2) {
          const msgs = [
            ["⁶Li + n → T + ⁴He  (+4.8 MeV)", "breed"],
            ["⁷Li + n → T + ⁴He + n  (−2.5 MeV)", "li7"],
            ["AETHER φ-gate: coherence lock acquired", "info"],
            [`Blanket node ${1 + Math.floor(Math.random() * 6)}: T saturation ${(50 + Math.random() * 30).toFixed(1)} appm`, "info"],
            ["Kuramoto ψ convergence detected — boosting extraction priority", "extract"],
            ["Fibonacci-timed pulse window OPEN", "extract"],
          ];
          const [msg, kind] = msgs[Math.floor(Math.random() * msgs.length)];
          addLog(msg, kind);
        }
      }

      // ── Axis labels (minimal) ─────────────────────────────────────────────
      ctx.fillStyle = "rgba(0,255,136,0.25)";
      ctx.font = "8px monospace";
      for (const r of [600, 800, 1000, 1200]) {
        const [ax, ay] = toCanvas(r, GEO.vMin + 30, W, H);
        ctx.fillText(`${r}`, ax - 8, ay);
      }
      for (const v of [-600, -300, 0, 300]) {
        const [ax2, ay2] = toCanvas(GEO.rMin + 20, v, W, H);
        ctx.fillText(`${v}`, ax2, ay2 + 3);
      }
      ctx.fillStyle = "rgba(0,255,136,0.2)";
      const [labx] = toCanvas(880, GEO.vMin + 60, W, H);
      ctx.fillText("Radial position (cm)", labx - 40, H - 4);
      ctx.save(); ctx.rotate(-Math.PI / 2);
      ctx.fillText("Vertical (cm)", -H / 2 - 20, 14);
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    // Start
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);
    rafRef.current = requestAnimationFrame(draw);
    addLog("Simulation started — D-T neutron source ONLINE (14.1 MeV)", "info");
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [addLog]);

  const mono: React.CSSProperties = { fontFamily: "'Courier New', monospace" };

  const MetricBox = ({ label, value, unit, color = G, note }: { label: string; value: string; unit: string; color?: string; note?: string }) => (
    <div style={{ padding: "8px 10px", borderBottom: `1px solid rgba(255,255,255,0.04)`, borderLeft: `2px solid ${color}30` }}>
      <div style={{ fontSize: 7, color: "rgba(255,255,255,0.35)", letterSpacing: 2, ...mono }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color, ...mono }}>{value}<span style={{ fontSize: 9, marginLeft: 4, color: `${color}80` }}>{unit}</span></div>
      {note && <div style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", ...mono }}>{note}</div>}
    </div>
  );

  const logColors: Record<string, string> = { info: "rgba(0,255,136,0.5)", breed: G, li7: PURP, extract: GOLD };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "rgb(2,8,18)", color: G, ...mono, overflow: "hidden", fontSize: 11 }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #44aaff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44aaff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44aaff",borderRadius:4,overflow:"hidden",marginBottom:8}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44aaff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>TRITIUM EXTRACT · HYDROGEN ISOTOPE · NUCLEAR FUSION · BETA DECAY · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,170,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Tritium nucleus + rising beta particles — the live AETHER tritium extract simulation.</p></div>
          <TritiumExtractHeaderCanvas />
        </div>
      </div>
      {/* Header */}
      <div style={{ padding: "6px 14px", borderBottom: `1px solid ${BRD}`, flexShrink: 0, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, letterSpacing: 4, fontWeight: 700 }}>TRITIUM EXTRACTION</span>
        <span style={{ fontSize: 8, opacity: 0.35 }}>AETHER Quantum Fusion Blanket · D-T Reactor · Li-6/7 Breeding · φ-Gated Extraction</span>
        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: G, boxShadow: `0 0 6px ${G}`, animation: "none" }} />
          <span style={{ fontSize: 7, color: G, letterSpacing: 2 }}>REACTOR ONLINE</span>
        </div>
      </div>

      {/* Nuclear reaction equations */}
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BRD}`, flexShrink: 0, overflowX: "auto" }}>
        {[
          { label: "D-T FUSION (source)", eq: "²H + ³H → ⁴He + n  (14.1 MeV)", color: GOLD },
          { label: "Li-6 BREEDING", eq: "⁶Li + n → T + ⁴He  (+4.8 MeV)", color: G },
          { label: "Li-7 BREEDING", eq: "⁷Li + n → T + ⁴He + n  (−2.5 MeV)", color: PURP },
          { label: "TBR TARGET", eq: "TBR = ∫ φ_n · N_Li · σ dV / S_n  ≥ 1.05", color: CYAN },
          { label: "AETHER GATE", eq: "G(θ) = cos²(θ mod 2π/φ) > 0.8", color: RED },
        ].map(({ label, eq, color }) => (
          <div key={label} style={{ padding: "4px 12px", borderRight: `1px solid ${BRD}`, flexShrink: 0 }}>
            <div style={{ fontSize: 6, color: `${color}70`, letterSpacing: 1 }}>{label}</div>
            <div style={{ fontSize: 8, color }}>{eq}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 200px", minHeight: 0 }}>

        {/* Left: canvas + legend */}
        <div style={{ display: "flex", flexDirection: "column", position: "relative" }}>

          {/* Legend */}
          <div style={{ position: "absolute", top: 8, left: 12, zIndex: 10, display: "flex", flexDirection: "column", gap: 3 }}>
            {[
              { color: "rgba(6,182,212,0.9)",  label: "High flux  > 0.016 %" },
              { color: "rgba(34,197,94,0.9)",  label: "Mid flux   0.008–0.016 %" },
              { color: "rgba(220,38,38,0.9)",  label: "Low flux   0.004–0.008 %" },
              { color: "rgba(59,130,246,0.9)", label: "Base flux  < 0.004 %" },
              { color: G,                       label: "⁶Li breed event" },
              { color: PURP,                    label: "⁷Li breed event" },
              { color: GOLD,                    label: "T extraction pulse" },
            ].map(({ color, label }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: color }} />
                <span style={{ fontSize: 6, color: "rgba(255,255,255,0.45)", ...mono }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Node info tooltip */}
          {activeNode && (
            <div style={{ position: "absolute", top: 8, right: 8, zIndex: 10, background: "rgba(2,8,18,0.92)", border: `1px solid ${G}40`, borderRadius: 6, padding: "8px 12px", maxWidth: 160 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: G, marginBottom: 4 }}>{activeNode.label}</div>
              <div style={{ fontSize: 7, color: CYAN }}>Coherence: {(activeNode.coherence * 100).toFixed(1)}%</div>
            </div>
          )}

          <canvas ref={canvasRef} style={{ flex: 1, width: "100%", display: "block" }} />

          {/* AETHER node selector */}
          <div style={{ padding: "4px 10px", borderTop: `1px solid ${BRD}`, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {stateRef.current.nodes.map((node, i) => (
              <button key={i} onClick={() => setActiveNode(n => n?.id === node.id ? null : node)}
                style={{ fontSize: 6, padding: "2px 7px", borderRadius: 12, border: `1px solid ${activeNode?.id === node.id ? G : "rgba(0,255,136,0.2)"}`, background: activeNode?.id === node.id ? "rgba(0,255,136,0.1)" : "transparent", color: activeNode?.id === node.id ? G : "rgba(255,255,255,0.35)", cursor: "pointer", ...mono }}>
                {node.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: metrics + log */}
        <div style={{ borderLeft: `1px solid ${BRD}`, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* Metrics */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ padding: "4px 10px", fontSize: 7, letterSpacing: 3, color: G, opacity: 0.5, borderBottom: `1px solid ${BRD}` }}>LIVE METRICS</div>
            <MetricBox label="TRITIUM BREEDING RATIO" value={metrics.tbr.toFixed(4)} unit="TBR" color={metrics.tbr >= 1.05 ? G : RED} note="Target ≥ 1.05 for fuel self-sufficiency" />
            <MetricBox label="EXTRACTION RATE" value={metrics.extractRate.toFixed(1)} unit="g/pulse" color={GOLD} note="φ-gated Fibonacci timing" />
            <MetricBox label="TRITIUM INVENTORY" value={metrics.tritiumInv.toFixed(0)} unit="g equiv." color={CYAN} />
            <MetricBox label="BLANKET TEMPERATURE" value={metrics.blanketTemp.toString()} unit="°C" color={RED} note="LiPb coolant — target 700-800°C" />
            <MetricBox label="NEUTRON FLUX" value={metrics.flux.toFixed(2)} unit="×10¹⁴ /cm²s" color={PURP} />
            <MetricBox label="AETHER COHERENCE" value={(metrics.coh * 100).toFixed(1)} unit="%" color={G} note="Quantum circuit mean coherence" />
          </div>

          {/* TBR bar */}
          <div style={{ padding: "6px 10px", borderBottom: `1px solid ${BRD}`, flexShrink: 0 }}>
            <div style={{ fontSize: 6, color: "rgba(0,255,136,0.4)", marginBottom: 4 }}>TBR PROGRESS (1.0 → 1.25)</div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
              <div style={{ height: "100%", width: `${((metrics.tbr - 1.0) / 0.25) * 100}%`, background: metrics.tbr >= 1.05 ? G : RED, borderRadius: 2, transition: "width 0.5s" }} />
            </div>
          </div>

          {/* Log */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div style={{ padding: "4px 10px", fontSize: 7, letterSpacing: 3, color: G, opacity: 0.5, borderBottom: `1px solid ${BRD}`, position: "sticky", top: 0, background: "rgb(2,8,18)" }}>EVENT LOG</div>
            {log.map((entry, i) => (
              <div key={i} style={{ padding: "3px 8px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span style={{ fontSize: 6, color: "rgba(255,255,255,0.2)", flexShrink: 0, marginTop: 1 }}>{entry.t}</span>
                <span style={{ fontSize: 7, color: logColors[entry.kind] ?? "rgba(255,255,255,0.4)", lineHeight: 1.4 }}>{entry.msg}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

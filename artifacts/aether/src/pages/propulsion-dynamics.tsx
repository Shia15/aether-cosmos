import { useEffect, useRef, useState } from "react";

const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const DIM  = "#3a5060";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

/* ─── Jet Engine / Supersonic Mass Flow Canvas ─── */
function JetEngineCanvas({ mach }: { mach: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const machRef = useRef(mach);
  machRef.current = mach;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 280;
    const W = cv.width, H = cv.height;
    let t = 0;
    const stages = [
      { label:"INTAKE",      col:BLUE, x1:20,  x2:180, ytop:H*0.27, ybot:H*0.73, detail:"Convergent duct\nramps shock wave\nat M>1" },
      { label:"COMPRESSOR",  col:TEAL, x1:180, x2:320, ytop:H*0.32, ybot:H*0.68, detail:"Axial stages\nratio up to 45:1\nsubsonic internal" },
      { label:"COMBUSTION",  col:AMB,  x1:320, x2:480, ytop:H*0.30, ybot:H*0.70, detail:"T₃ ~1800 K\nP₃ ~40 bar\nΔv up to 1000 m/s" },
      { label:"TURBINE",     col:GOLD, x1:480, x2:620, ytop:H*0.32, ybot:H*0.68, detail:"Extracts work\nto drive compressor\nT₄ ~1200 K" },
      { label:"NOZZLE",      col:ROSE, x1:620, x2:820, ytop:H*0.25, ybot:H*0.75, detail:"Converging–diverging\nexpands to M>1\natmospheric exit" },
      { label:"EXHAUST JET", col:VIO,  x1:820, x2:960, ytop:H*0.22, ybot:H*0.78, detail:"Ve ≈ 600–900 m/s\nThrust = ṁ(Ve-V0)\n+Ae(Pe-P0)" },
    ];
    type Particle = { x: number; y: number; vx: number; vy: number; col: string; r: number; life: number };
    const particles: Particle[] = [];
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const M = machRef.current;
      const massFlow = 80 + M * 120; // kg/s estimate
      const thrust   = massFlow * (M * 300 + 200); // simplified F = ṁ·ΔV

      // draw stage bodies
      stages.forEach((s, i) => {
        const grd = ctx.createLinearGradient(s.x1, 0, s.x2, 0);
        grd.addColorStop(0, s.col + "18"); grd.addColorStop(1, s.col + "08");
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.moveTo(s.x1, s.ytop); ctx.lineTo(s.x2, stages[i].ytop);
        ctx.lineTo(s.x2, stages[i].ybot); ctx.lineTo(s.x1, s.ybot);
        ctx.closePath(); ctx.fill();
        ctx.strokeStyle = s.col + "55"; ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = s.col; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
        ctx.fillText(s.label, (s.x1 + s.x2) / 2, s.ytop - 8);
        s.detail.split("\n").forEach((line, li) => {
          ctx.fillStyle = s.col + "88"; ctx.font = `6.5px ${MN}`;
          ctx.fillText(line, (s.x1 + s.x2) / 2, s.ybot + 14 + li * 10);
        });
      });

      // compressor blades
      for (let bx = 200; bx < 315; bx += 14) {
        const phase = (t * 0.06 + bx * 0.2) % (Math.PI * 2);
        ctx.save(); ctx.translate(bx, H / 2);
        ctx.rotate(phase);
        ctx.strokeStyle = TEAL + "55"; ctx.lineWidth = 1;
        for (let b = 0; b < 6; b++) {
          ctx.rotate(Math.PI / 3);
          ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, H * 0.17); ctx.stroke();
        }
        ctx.restore();
      }
      // combustion sparks
      if (Math.random() < 0.6) {
        particles.push({ x: 330 + Math.random() * 140, y: H * 0.35 + Math.random() * H * 0.3, vx: 1 + Math.random() * 3, vy: (Math.random() - 0.5) * 1.5, col: [AMB, GOLD, ROSE][Math.floor(Math.random() * 3)], r: 1 + Math.random() * 2, life: 30 + Math.floor(Math.random() * 40) });
      }
      particles.forEach((p, idx) => {
        p.x += p.vx; p.y += p.vy; p.life--;
        const alpha = p.life / 60;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.col + Math.round(alpha * 200).toString(16).padStart(2, "0"); ctx.fill();
        if (p.life <= 0) particles.splice(idx, 1);
      });
      // exhaust plume
      for (let i = 0; i < 6; i++) {
        const phase = (t * 0.05 + i * 1.1) % (Math.PI * 2);
        const ex = 820 + i * (M * 22 + 8);
        const ey = H / 2 + (Math.sin(phase) * (i + 1) * 6);
        const er = (6 - i) * (M * 0.6 + 0.5);
        const g = ctx.createRadialGradient(ex, ey, 0, ex, ey, er * 4);
        g.addColorStop(0, ROSE + "44"); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(ex, ey, er * 4, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
      }
      // shock diamonds at M>1
      if (M > 1) {
        for (let d = 0; d < Math.floor((M - 1) * 3 + 1); d++) {
          const dx = 830 + d * 38;
          const dphase = (t * 0.04 + d * 0.7) % (Math.PI * 2);
          const dalpha = 0.2 + 0.1 * Math.sin(dphase);
          ctx.strokeStyle = GOLD + Math.round(dalpha * 200).toString(16).padStart(2, "0");
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(dx - 12, H / 2); ctx.lineTo(dx, H * 0.38);
          ctx.lineTo(dx + 12, H / 2); ctx.lineTo(dx, H * 0.62);
          ctx.closePath(); ctx.stroke();
        }
      }
      // readouts
      ctx.fillStyle = "rgba(0,0,0,0.6)"; ctx.fillRect(0, 0, W, 24);
      const readouts = [
        { l:"MACH", v:`${M.toFixed(2)}`, col:TEAL },
        { l:"MASS FLOW ṁ", v:`${massFlow.toFixed(0)} kg/s`, col:BLUE },
        { l:"THRUST", v:`${(thrust / 1000).toFixed(0)} kN`, col:AMB },
        { l:"REACTION TIME", v:`${(0.8 / (M * 340 + 1)).toFixed(4)} s`, col:GOLD },
        { l:"Ve", v:`${(M * 300 + 200).toFixed(0)} m/s`, col:ROSE },
        { l:"F = ṁΔV", v:`Newton 3rd Law`, col:VIO },
      ];
      readouts.forEach((r, i) => {
        ctx.fillStyle = r.col; ctx.font = `7px ${MN}`; ctx.textAlign = "left";
        ctx.fillText(`${r.l}: ${r.v}`, 12 + i * 160, 15);
      });
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ─── Raptor Engine Full-Flow Staged Combustion ─── */
function RaptorEngineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 300;
    const W = cv.width, H = cv.height;
    let t = 0;
    type Droplet = { x: number; y: number; vx: number; vy: number; col: string; r: number; life: number };
    const droplets: Droplet[] = [];
    const addDroplet = (x: number, y: number, col: string, vx = 2, vy = 0) =>
      droplets.push({ x, y, vx: vx + (Math.random() - 0.5) * 0.8, vy: vy + (Math.random() - 0.5) * 0.6, col, r: 2 + Math.random() * 1.5, life: 40 + Math.floor(Math.random() * 30) });

    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const cy = H / 2;
      // ── LOX / CH4 tanks
      const tankH = 70;
      // LOX tank (left-top)
      ctx.fillStyle = BLUE + "22"; ctx.strokeStyle = BLUE + "66"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(20, cy - 100, 70, tankH, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = BLUE; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("LOX", 55, cy - 65); ctx.fillStyle = BLUE + "88"; ctx.font = `7px ${MN}`;
      ctx.fillText("liquid O₂", 55, cy - 52); ctx.fillText("−183 °C", 55, cy - 42);
      // CH4 tank (left-bottom)
      ctx.fillStyle = GRN + "22"; ctx.strokeStyle = GRN + "66";
      ctx.beginPath(); ctx.roundRect(20, cy + 30, 70, tankH, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = GRN; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("CH₄", 55, cy + 65); ctx.fillStyle = GRN + "88"; ctx.font = `7px ${MN}`;
      ctx.fillText("methane", 55, cy + 78); ctx.fillText("−161 °C", 55, cy + 88);

      // ── fuel-rich preburner (top)
      ctx.fillStyle = GRN + "18"; ctx.strokeStyle = GRN + "44";
      ctx.beginPath(); ctx.roundRect(120, cy - 110, 80, 50, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = GRN; ctx.font = `7px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("FUEL-RICH", 160, cy - 90); ctx.fillText("PREBURNER", 160, cy - 80);
      ctx.fillStyle = GRN + "66"; ctx.font = `6px ${MN}`;
      ctx.fillText("LOX + excess CH₄", 160, cy - 68);
      // ── oxidiser-rich preburner (bottom)
      ctx.fillStyle = BLUE + "18"; ctx.strokeStyle = BLUE + "44";
      ctx.beginPath(); ctx.roundRect(120, cy + 60, 80, 50, 4); ctx.fill(); ctx.stroke();
      ctx.fillStyle = BLUE; ctx.font = `7px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("OX-RICH", 160, cy + 80); ctx.fillText("PREBURNER", 160, cy + 90);
      ctx.fillStyle = BLUE + "66"; ctx.font = `6px ${MN}`;
      ctx.fillText("excess LOX + CH₄", 160, cy + 102);
      // ── turbopumps
      const tpump = (cx: number, cy2: number, col: string, label: string) => {
        const phase = t * 0.08;
        for (let b = 0; b < 6; b++) {
          const a = phase + b * (Math.PI / 3);
          ctx.strokeStyle = col + "99"; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(cx, cy2); ctx.lineTo(cx + Math.cos(a) * 14, cy2 + Math.sin(a) * 14); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(cx, cy2, 4, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
        ctx.fillStyle = col + "cc"; ctx.font = `6px ${MN}`; ctx.textAlign = "center";
        ctx.fillText(label, cx, cy2 + 24);
      };
      tpump(230, cy - 80, GRN, "FTP");
      tpump(230, cy + 90, BLUE, "OTP");
      // ── main combustion chamber
      ctx.fillStyle = AMB + "18"; ctx.strokeStyle = AMB + "66"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(310, cy - 70, 100, 140, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = AMB; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("MAIN", 360, cy - 45); ctx.fillText("CHAMBER", 360, cy - 33);
      ctx.fillStyle = AMB + "99"; ctx.font = `6.5px ${MN}`;
      ctx.fillText("300 bar", 360, cy - 18); ctx.fillText("3500 K", 360, cy - 6);
      ctx.fillText("F=1·MN sl", 360, cy + 8);
      // combustion glow
      const glowR = 30 + 8 * Math.sin(t * 0.07);
      const glowG = ctx.createRadialGradient(360, cy, 0, 360, cy, glowR);
      glowG.addColorStop(0, AMB + "44"); glowG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(360, cy, glowR, 0, Math.PI * 2); ctx.fillStyle = glowG; ctx.fill();
      // ── nozzle
      ctx.fillStyle = ROSE + "18"; ctx.strokeStyle = ROSE + "44"; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(410, cy - 70); ctx.lineTo(560, cy - 120);
      ctx.lineTo(560, cy + 120); ctx.lineTo(410, cy + 70);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ROSE; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("NOZZLE", 480, cy - 6); ctx.fillText("(De Laval)", 480, cy + 6);
      ctx.fillStyle = ROSE + "88"; ctx.font = `6px ${MN}`;
      ctx.fillText("M>1 exit", 480, cy + 18); ctx.fillText("Isp 363s vac", 480, cy + 30);
      // plume particles
      if (Math.random() < 0.7) {
        addDroplet(565, cy + (Math.random() - 0.5) * 60, AMB, 4 + Math.random() * 3, (Math.random() - 0.5) * 0.4);
      }
      droplets.forEach((d, idx) => {
        d.x += d.vx; d.y += d.vy; d.life--;
        const alpha = d.life / 60;
        const pg = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 3);
        pg.addColorStop(0, d.col + Math.round(alpha * 180).toString(16).padStart(2, "0")); pg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r * 3, 0, Math.PI * 2); ctx.fillStyle = pg; ctx.fill();
        if (d.life <= 0) droplets.splice(idx, 1);
      });
      // Newton labels
      ctx.fillStyle = VIO; ctx.font = `9px ${OR}`; ctx.textAlign = "left";
      ctx.fillText("F = − F'", 620, cy - 20);
      ctx.fillStyle = VIO + "77"; ctx.font = `7px ${MN}`;
      ctx.fillText("Every action has an equal", 620, cy - 6);
      ctx.fillText("and opposite reaction.", 620, cy + 6);
      ctx.fillText("Exhaust momentum = −rocket", 620, cy + 18);
      ctx.fillText("momentum. Isp = Ve / g₀", 620, cy + 30);
      ctx.fillText("Raptor Isp: 330s SL / 363s vac", 620, cy + 44);
      ctx.fillText("Chamber P: 300 bar (world record)", 620, cy + 58);
      ctx.fillText("Propellant: LOX / LCH₄", 620, cy + 72);
      ctx.fillText("Cycle: Full-Flow Staged Combustion", 620, cy + 86);
      ctx.fillText("Two preburners → zero waste", 620, cy + 100);
      ctx.fillText("Mass: 1,500 kg  Thrust: 230 tf SL", 620, cy + 114);
      // flow arrows (LOX to preburner)
      const arrowFlow = (x1: number, y1: number, x2: number, y2: number, col: string) => {
        const pulse = 0.4 + 0.3 * Math.sin(t * 0.05 + x1 * 0.01);
        ctx.strokeStyle = col + Math.round(pulse * 180).toString(16).padStart(2, "0");
        ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]); ctx.lineDashOffset = -t * 0.4;
        ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
      };
      arrowFlow(90, cy - 65, 120, cy - 85, BLUE);
      arrowFlow(90, cy + 45, 120, cy + 85, GRN);
      arrowFlow(200, cy - 85, 230, cy - 80, GRN);
      arrowFlow(200, cy + 85, 230, cy + 90, BLUE);
      arrowFlow(246, cy - 80, 310, cy - 40, AMB);
      arrowFlow(246, cy + 90, 310, cy + 40, AMB);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ─── Bio-Technology Liquid Engine Canvas ─── */
function BioEngineCanvas({ world }: { world: "mars" | "moon" }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const worldRef = useRef(world);
  worldRef.current = world;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 280;
    const W = cv.width, H = cv.height;
    let t = 0;
    type Blob = { x: number; y: number; vx: number; vy: number; r: number; col: string; life: number };
    const blobs: Blob[] = [];
    const addBlob = (x: number, y: number, col: string) =>
      blobs.push({ x, y, vx: 0.8 + Math.random() * 1.2, vy: (Math.random() - 0.5) * 0.3, r: 2 + Math.random() * 2, col, life: 60 + Math.floor(Math.random() * 40) });
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const w = worldRef.current;
      const marsMode = w === "mars";
      const envCol = marsMode ? AMB : TEAL;
      const envLabel = marsMode ? "MARS ISRU CYCLE" : "LUNAR ISRU CYCLE";
      const srcMol1 = marsMode ? "CO₂ (95% atm)" : "H₂O ice";
      const srcMol2 = marsMode ? "H₂O (ice/regolith)" : "regolith O₂";
      const fuelOut = marsMode ? "CH₄ + O₂" : "H₂ + O₂";
      const organism = marsMode ? "Methanobacterium\nthermoautotrophicum" : "Cyanobacteria\n(electrolyser assist)";
      const gravLabel = marsMode ? "g = 3.72 m/s²  Isp need: 340s" : "g = 1.62 m/s²  Isp need: 300s";

      // bioreactor
      ctx.fillStyle = GRN + "18"; ctx.strokeStyle = GRN + "55"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(30, H * 0.15, 100, H * 0.7, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = GRN; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("BIOREACTOR", 80, H * 0.22);
      organism.split("\n").forEach((l, i) => {
        ctx.fillStyle = GRN + "88"; ctx.font = `6.5px ${MN}`;
        ctx.fillText(l, 80, H * 0.35 + i * 12);
      });
      // bubbles in bioreactor
      for (let b = 0; b < 8; b++) {
        const bx = 40 + Math.random() * 80;
        const by = H * 0.25 + Math.random() * H * 0.55;
        ctx.beginPath(); ctx.arc(bx, by, 2 + Math.random() * 3, 0, Math.PI * 2);
        ctx.strokeStyle = GRN + "44"; ctx.lineWidth = 0.8; ctx.stroke();
      }

      // raw material icons
      const drawMolBox = (x: number, y: number, col: string, label: string, mol: string) => {
        ctx.fillStyle = col + "18"; ctx.strokeStyle = col + "55"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.roundRect(x, y, 80, 44, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = col; ctx.font = `7px ${OR}`; ctx.textAlign = "center";
        ctx.fillText(label, x + 40, y + 14);
        ctx.fillStyle = col + "88"; ctx.font = `7.5px ${MN}`;
        ctx.fillText(mol, x + 40, y + 30);
      };
      drawMolBox(160, H * 0.12, envCol, "SOURCE 1", srcMol1);
      drawMolBox(160, H * 0.55, BLUE, "SOURCE 2", srcMol2);

      // separator / cracker
      ctx.fillStyle = VIO + "18"; ctx.strokeStyle = VIO + "55"; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.roundRect(290, H * 0.28, 80, 90, 5); ctx.fill(); ctx.stroke();
      ctx.fillStyle = VIO; ctx.font = `7px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("ELECTRO-", 330, H * 0.38); ctx.fillText("LYSIS +", 330, H * 0.46);
      ctx.fillText("CRACKER", 330, H * 0.54);

      // propellant storage
      ctx.fillStyle = ROSE + "18"; ctx.strokeStyle = ROSE + "55"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(420, H * 0.15, 80, 130, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ROSE; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("FUEL", 460, H * 0.25); ctx.fillText("TANK", 460, H * 0.33);
      ctx.fillStyle = ROSE + "88"; ctx.font = `7px ${MN}`;
      ctx.fillText(fuelOut.split("+")[0].trim(), 460, H * 0.44);
      ctx.fillStyle = BLUE + "18"; ctx.strokeStyle = BLUE + "55"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(420, H * 0.6, 80, 120, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = BLUE; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("LOX", 460, H * 0.7); ctx.fillText("TANK", 460, H * 0.78);

      // engine bell
      ctx.fillStyle = GOLD + "18"; ctx.strokeStyle = GOLD + "66"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(560, H * 0.3); ctx.lineTo(640, H * 0.1);
      ctx.lineTo(640, H * 0.9); ctx.lineTo(560, H * 0.7);
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = GOLD; ctx.font = `8px ${OR}`; ctx.textAlign = "center";
      ctx.fillText("ENGINE", 595, H * 0.45); ctx.fillText("BELL", 595, H * 0.55);

      // exhaust
      if (Math.random() < 0.7) addBlob(645, H / 2 + (Math.random() - 0.5) * 80, [AMB, GRN, ROSE][Math.floor(Math.random() * 3)]);
      blobs.forEach((b, idx) => {
        b.x += b.vx; b.y += b.vy; b.life--;
        const alpha = b.life / 80;
        const bg = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 4);
        bg.addColorStop(0, b.col + Math.round(alpha * 160).toString(16).padStart(2, "0")); bg.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r * 4, 0, Math.PI * 2); ctx.fillStyle = bg; ctx.fill();
        if (b.life <= 0) blobs.splice(idx, 1);
      });

      // stats panel
      ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(670, 0, W - 670, H);
      ctx.strokeStyle = envCol + "22"; ctx.lineWidth = 1;
      ctx.strokeRect(670, 0, W - 670, H);
      ctx.fillStyle = envCol; ctx.font = `8px ${OR}`; ctx.textAlign = "left";
      ctx.fillText(envLabel, 680, 20);
      const stats = marsMode ? [
        ["Environment", "Mars surface 95% CO₂ atm"],
        ["g", "3.72 m/s² (38% Earth)"],
        ["ΔV to orbit", "~3.7 km/s"],
        ["Target Isp", "≥340 s (LOX/CH₄)"],
        ["Organisms", "Methanogenic archaea"],
        ["Reaction", "CO₂ + 4H₂ → CH₄ + 2H₂O"],
        ["Water source", "Polar ice / regolith brine"],
        ["Power need", "~5 kW/kg fuel/day"],
        ["NASA MOXIE", "O₂ from CO₂ confirmed 2021"],
        ["Raptor ready", "LOX/CH₄ — ISRU-compatible"],
      ] : [
        ["Environment", "Lunar surface no atmosphere"],
        ["g", "1.62 m/s² (16.5% Earth)"],
        ["ΔV to orbit", "~1.87 km/s"],
        ["Target Isp", "≥300 s (LOX/H₂)"],
        ["Source", "LCROSS confirmed water ice"],
        ["Process", "Solar electrolysis H₂O→H₂+O₂"],
        ["Bio assist", "Cyanobacteria → O₂ from regolith"],
        ["Bacteria", "Anabaena cylindrica (tested ISS)"],
        ["Power need", "~2.5 kW/kg H₂/day"],
        ["Artemis use", "ISRU propellant depot planned"],
      ];
      stats.forEach(([k, v], i) => {
        ctx.fillStyle = envCol + "88"; ctx.font = `6.5px ${MN}`; ctx.textAlign = "left";
        ctx.fillText(k, 680, 38 + i * 18);
        ctx.fillStyle = "rgba(190,210,230,0.75)"; ctx.font = `6.5px ${MN}`;
        ctx.fillText(v, 760, 38 + i * 18);
      });
      ctx.fillStyle = envCol + "55"; ctx.font = `6px ${MN}`;
      ctx.fillText(gravLabel, 680, H - 12);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [world]);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ─── Jupiter Internal Fluid Dynamics Canvas ─── */
function JupiterFluidCanvas({ layer }: { layer: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const layerRef = useRef(layer);
  layerRef.current = layer;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 320;
    const W = cv.width, H = cv.height;
    let t = 0;
    const CX = 260, CY = H / 2, CR = 220;
    const LAYERS = [
      { name:"Atmosphere",       r:1.00, col:AMB,  vel:"100–350 m/s",  P:"1 bar",      T:"165 K",   note:"Ammonia cloud bands. Alternating E/W jet streams." },
      { name:"H₂O / NH₃ Layer",  r:0.90, col:BLUE, vel:"40–120 m/s",   P:"10–50 bar",  T:"300 K",   note:"Deep water cloud layer confirmed by Juno microwave. Moist convection." },
      { name:"Molecular H₂",     r:0.75, col:TEAL, vel:"10–60 m/s",    P:"50–3M bar",  T:"2000 K",  note:"Fluid H₂. Differential rotation. Tidal dissipation measured." },
      { name:"Metallic H₂",      r:0.50, col:VIO,  vel:"1–20 m/s",     P:"3–45M bar",  T:"10000 K", note:"Electrically conductive. Dynamo region → 20,000 nT field." },
      { name:"Rock/Ice Core",    r:0.25, col:GOLD, vel:"~0 m/s",        P:"45M+ bar",   T:"30000 K", note:"Diffuse core. Juno: ~45 Earth masses. Possibly dissolved into fluid." },
    ];
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const lyr = Math.min(layerRef.current, LAYERS.length - 1);
      // draw layers from inside out
      [...LAYERS].reverse().forEach((l, i) => {
        const ri = LAYERS.length - 1 - i;
        const radius = l.r * CR;
        const isActive = ri === lyr;
        const pulse = isActive ? 1 + 0.06 * Math.sin(t * 0.06) : 1;
        const alpha = isActive ? 0.35 : 0.12;
        ctx.beginPath(); ctx.arc(CX, CY, radius * pulse, 0, Math.PI * 2);
        ctx.fillStyle = l.col + Math.round(alpha * 255).toString(16).padStart(2, "0"); ctx.fill();
        if (isActive) {
          ctx.strokeStyle = l.col + "cc"; ctx.lineWidth = 2;
        } else {
          ctx.strokeStyle = l.col + "33"; ctx.lineWidth = 0.8;
        }
        ctx.stroke();
        // velocity field lines (simplified)
        if (ri <= lyr || isActive) {
          const n = 8;
          for (let j = 0; j < n; j++) {
            const a0 = (j / n) * Math.PI * 2 + t * 0.008 * (ri % 2 === 0 ? 1 : -1);
            const r0 = radius * (0.65 + 0.3 * Math.random());
            const lx = CX + Math.cos(a0) * r0;
            const ly = CY + Math.sin(a0) * r0;
            const lx2 = CX + Math.cos(a0 + 0.3) * r0;
            const ly2 = CY + Math.sin(a0 + 0.3) * r0;
            ctx.strokeStyle = l.col + "33"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(lx2, ly2); ctx.stroke();
          }
        }
        // label on ring edge (right side)
        if (ri === lyr || ri === 0 || ri === LAYERS.length - 1) {
          const lx = CX + radius * 0.75;
          const ly = CY - radius * 0.25;
          ctx.fillStyle = l.col + "cc"; ctx.font = `7px ${MN}`; ctx.textAlign = "left";
          ctx.fillText(l.name, lx, ly);
        }
      });
      // GRS vortex (atmosphere layer indicator)
      const grsX = CX - CR * 0.55, grsY = CY - CR * 0.25;
      const grsR = CR * 0.12 + 4 * Math.sin(t * 0.04);
      for (let ring = 0; ring < 4; ring++) {
        const rAlpha = (4 - ring) / 4 * 0.3;
        ctx.beginPath(); ctx.arc(grsX, grsY, grsR + ring * 8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,80,50,${rAlpha})`; ctx.lineWidth = ring === 0 ? 2 : 1; ctx.stroke();
      }
      ctx.fillStyle = AMB; ctx.font = `6px ${MN}`; ctx.textAlign = "center";
      ctx.fillText("GRS", grsX, grsY + grsR + 20);
      // detail panel (right)
      const active = LAYERS[lyr];
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(560, 0, W - 560, H);
      ctx.strokeStyle = active.col + "22"; ctx.lineWidth = 1; ctx.strokeRect(560, 0, W - 560, H);
      ctx.fillStyle = active.col; ctx.font = `9px ${OR}`; ctx.textAlign = "left";
      ctx.fillText(`LAYER ${lyr + 1} · ${active.name.toUpperCase()}`, 574, 22);
      const details = [
        ["Velocity",    active.vel],
        ["Pressure",    active.P],
        ["Temperature", active.T],
        ["Radius",      `${(active.r * 100).toFixed(0)}% of R_J`],
        ["R_J",         "71,492 km"],
        ["Depth",       `${((1 - active.r) * 71492).toFixed(0)} km below cloud tops`],
      ];
      details.forEach(([k, v], i) => {
        ctx.fillStyle = active.col + "66"; ctx.font = `7px ${MN}`; ctx.textAlign = "left";
        ctx.fillText(k, 574, 44 + i * 18);
        ctx.fillStyle = "rgba(200,215,232,0.8)"; ctx.font = `7px ${MN}`;
        ctx.fillText(v, 660, 44 + i * 18);
      });
      ctx.fillStyle = active.col + "77"; ctx.font = `7px ${MN}`;
      const noteLines = active.note.split(". ");
      noteLines.forEach((nl, i) => ctx.fillText(nl + (i < noteLines.length - 1 ? "." : ""), 574, 158 + i * 12));
      // Tomas / Juno water structure notes
      ctx.fillStyle = TEAL + "44"; ctx.font = `6.5px ${MN}`;
      const tomasNotes = [
        "TOMAS · Juno microwave radiometer (MWR)",
        "revealed water enrichment 3–5× solar",
        "abundance at depth below ammonia clouds.",
        "Wind speed peaks at ~160 m/s in",
        "equatorial jet — deeper jets measured",
        "to >3,000 km by gravity harmonics.",
        "Juno J2/J6 coefficients: differential",
        "rotation persists to 3,000–5,000 km.",
        "Metallic H₂ transition ~1 Mbar (~90 GPa).",
        "Core: Juno gravity data → fuzzy/diffuse,",
        "not rigid — heavy element enrichment",
        "possibly eroded inward over 4.5 Gyr.",
      ];
      tomasNotes.forEach((l, i) => ctx.fillText(l, 574, 200 + i * 12));
      // layer selector dots on sphere edge
      LAYERS.forEach((l, i) => {
        const a2 = -Math.PI / 2 + (i / LAYERS.length) * Math.PI;
        const ex = CX + Math.cos(a2) * (l.r * CR + 24);
        const ey = CY + Math.sin(a2) * (l.r * CR + 24);
        ctx.beginPath(); ctx.arc(ex, ey, 4, 0, Math.PI * 2);
        ctx.fillStyle = i === lyr ? l.col : l.col + "44"; ctx.fill();
      });
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [layer]);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ─── Main Page ─────────────────────────────── */
export default function PropulsionDynamicsPage() {
  const [mach, setMach] = useState(1.4);
  const [world, setWorld] = useState<"mars" | "moon">("mars");
  const [jupLayer, setJupLayer] = useState(1);

  const card = (col = TEAL): React.CSSProperties => ({
    background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 7.5, letterSpacing: "0.18em", color: DIM,
    textTransform: "uppercase", marginBottom: 10, paddingBottom: 4,
    borderBottom: "1px solid rgba(46,240,216,0.08)",
  };
  const h2 = (col = TEAL): React.CSSProperties => ({ fontFamily: OR, fontSize: 11, color: col, letterSpacing: 1, margin: "0 0 8px" });
  const body: React.CSSProperties = { fontSize: 11.5, color: "rgba(200,215,232,0.72)", lineHeight: 1.72 };

  const jupLayers = ["Atmosphere (clouds)", "H₂O / NH₃ Deep Layer", "Molecular H₂ Fluid", "Metallic H₂ Dynamo", "Rock / Ice Core"];

  return (
    <div style={{ minHeight:"100%", background:BG, color:"#d4e4f4", fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 20px" }}>

        {/* title */}
        <div style={{ marginBottom:16 }}>
          <div style={{ display:"inline-block", border:`1px solid ${AMB}55`, padding:"3px 10px", fontSize:9, letterSpacing:"0.2em", color:`${AMB}cc`, fontFamily:MN, marginBottom:8 }}>
            PROPULSION DYNAMICS · JET ENGINE · RAPTOR · BIOTECH LIQUID ENGINE · JUPITER FLUID STRUCTURE · ISRU · NEWTON 3RD LAW
          </div>
          <h1 style={{ fontFamily:OR, fontSize:20, fontWeight:900, letterSpacing:2, color:AMB, textShadow:`0 0 24px ${AMB}44`, margin:"4px 0 6px" }}>
            Propulsion Dynamics · From Jet Engines to Jupiter
          </h1>
          <p style={{ ...body, maxWidth:860, margin:0 }}>
            Mass flow, reaction thrust, supersonic shock diamonds, full-flow staged combustion, bio-synthesised propellants for Mars and the Moon, and the deep water velocity structures inside Jupiter — all live-animated from first principles.
          </p>
        </div>

        {/* jet engine */}
        <div style={{ ...card(BLUE), marginBottom:14 }}>
          <div style={secLabel}>Jet engine · supersonic mass flow · mach number · thrust equation F=ṁΔV · shock diamonds · intake ramp · compressor · combustor · turbine · converging-diverging nozzle</div>
          <h2 style={h2(BLUE)}>Jet Engine · Supersonic Mass Flow &amp; Reaction Thrust</h2>
          <JetEngineCanvas mach={mach} />
          <div style={{ marginTop:10 }}>
            <label style={{ fontFamily:MN, fontSize:8, color:BLUE }}>
              Mach number: <strong style={{ color:GOLD }}>{mach.toFixed(2)}</strong>
              &nbsp;·&nbsp; {mach < 1 ? "SUBSONIC" : mach < 1.2 ? "TRANSONIC" : mach < 5 ? "SUPERSONIC" : "HYPERSONIC"}
              &nbsp;·&nbsp; V = <strong style={{ color:AMB }}>{(mach * 343).toFixed(0)} m/s</strong>
            </label>
            <input type="range" min={0.3} max={4.0} step={0.05} value={mach}
              onChange={e => setMach(Number(e.target.value))}
              style={{ width:"100%", accentColor:BLUE, margin:"8px 0" }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:6 }}>
            {[
              { col:TEAL, t:"Thrust = ṁ(Ve − V₀) + Ae(Pe − P₀)", b:"Thrust comes from the rate of change of momentum. ṁ is mass flow (kg/s) — the key variable. At supersonic Mach, intake ramps compress the airflow through oblique shocks before the engine face, keeping internal flow subsonic. More mass through the engine per second = more thrust. The Pratt & Whitney F135 (F-35) passes 181 kg/s at military power." },
              { col:BLUE,  t:"Supersonic Nozzle · Shock Diamonds", b:"Above Mach 1, the exhaust expands to ambient pressure through a converging-diverging (De Laval) nozzle. If exit pressure ≠ ambient, the plume undergoes repeated compression and expansion cycles — visible as shock diamonds (Mach discs). Slide the Mach up past 1.5 to see the diamond pattern appear. Used in afterburners, rockets, and ramjets." },
              { col:AMB,   t:"Reaction Time & Compressor Stall", b:"At high angles of attack or sudden throttle changes, the compression ratio can drop — compressor blades stall (separated flow). Turbofan reaction time (throttle to full thrust) is 6–8 seconds due to spool-up inertia. In a dogfight, this is critical — thrust vectoring was partly introduced because the engine can't respond fast enough to match aerodynamic demands." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 10px" }}>
                <div style={{ fontFamily:MN, fontSize:8, color:col, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:10, color:"rgba(185,205,230,0.65)", lineHeight:1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* raptor */}
        <div style={{ ...card(AMB), marginBottom:14 }}>
          <div style={secLabel}>SpaceX Raptor 3 · full-flow staged combustion · LOX/LCH₄ · 300 bar chamber · Newton 3rd law · equal and opposite reaction · Isp 363s vacuum · world record</div>
          <h2 style={h2(AMB)}>SpaceX Raptor Engine · Full-Flow Staged Combustion &amp; Newton's Third Law</h2>
          <RaptorEngineCanvas />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:12 }}>
            {[
              { col:AMB,  t:"Full-Flow Staged Combustion — Why It's Revolutionary", b:"Most rocket engines use some propellant to drive turbopumps and exhaust it 'overboard' — wasting mass. Raptor's full-flow cycle routes all propellant through two preburners (one fuel-rich, one oxidiser-rich), extracting work to drive pumps, then combines both hot-gas streams in the main chamber. Zero propellant waste. This enables the world-record 300 bar chamber pressure and highest mass-specific impulse of any CH₄ engine." },
              { col:ROSE, t:"Newton's Third Law in a Rocket", b:"Every kilogram of exhaust expelled backward at velocity Ve imparts equal forward momentum to the vehicle. Tsiolkovsky rocket equation: ΔV = Ve · ln(m₀/m₁). Raptor's exhaust velocity Ve ≈ 3560 m/s vacuum. For Starship to reach orbit, it needs ΔV ≈ 9.4 km/s. Two stages of Raptor firing continuously carry ~1200 t of propellant — burned to accelerate ~100 t of ship and payload." },
              { col:VIO,  t:"LOX / CH₄ — The Mars Propellant Choice", b:"Liquid oxygen and liquid methane are not just Raptor's choice by performance — methane can be synthesised on Mars using the Sabatier reaction (CO₂ + 4H₂ → CH₄ + 2H₂O) with water ice and atmospheric CO₂. This ISRU (In-Situ Resource Utilisation) loop means Starship can refuel on Mars without bringing propellant from Earth. Full round-trip from resources already on the planet." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 10px" }}>
                <div style={{ fontFamily:MN, fontSize:8, color:col, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:10, color:"rgba(185,205,230,0.65)", lineHeight:1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* bio engine */}
        <div style={{ ...card(GRN), marginBottom:14 }}>
          <div style={secLabel}>Biotechnology liquid engine · ISRU · Mars Sabatier CH₄ · lunar water electrolysis · cyanobacteria O₂ · methanogenic archaea · synthetic biology propulsion · Artemis · Starship</div>
          <h2 style={h2(GRN)}>Bio-Technology Liquid Engine · ISRU for Mars &amp; the Moon</h2>
          <div style={{ display:"flex", gap:8, marginBottom:10 }}>
            {(["mars","moon"] as const).map(w => (
              <button key={w} type="button" onClick={() => setWorld(w)}
                style={{ fontFamily:MN, fontSize:8, padding:"5px 14px", borderRadius:3, cursor:"pointer",
                  background: world === w ? (w === "mars" ? AMB : TEAL) + "22" : "transparent",
                  border: `1px solid ${w === "mars" ? AMB : TEAL}${world === w ? "cc" : "44"}`,
                  color: (w === "mars" ? AMB : TEAL) + (world === w ? "" : "88") }}>
                {w === "mars" ? "🔴 MARS — LOX / CH₄ via Sabatier" : "⬜ MOON — LOX / H₂ via Electrolysis"}
              </button>
            ))}
          </div>
          <BioEngineCanvas world={world} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:12 }}>
            {[
              { col:GRN, t:"Synthetic Biology as Propellant Factory", b:"Methanobacterium thermoautotrophicum converts CO₂ + H₂ → CH₄ at ~85% energy efficiency. On Mars, CO₂ is 95% of the atmosphere. Water ice exists at poles and in regolith. A 1m³ bioreactor array running on 5 kW solar could produce enough methane for a single Raptor burn in roughly 60 days. NASA ARC is actively researching this as a weight-minimal alternative to electro-chemical Sabatier reactors." },
              { col:TEAL, t:"Lunar Cyanobacteria + Electrolysis", b:"Cyanobacteria (Anabaena cylindrica) were tested on the ISS in 2021 — they survived in CO₂ + N₂ environments and produced O₂. On the Moon, water ice confirmed by LCROSS (2009) at Cabeus crater can be electrolysed into H₂ and O₂ using solar power. Bio-assist (cyanobacteria as bioreactors to pre-process regolith minerals) reduces the energy load on purely electro-chemical systems." },
              { col:VIO, t:"Why Bio Over Chemical?", b:"Traditional Sabatier reactors require rare catalysts (Ni, Ru), high temperature (300–400°C), and precise control systems. Biological reactors self-repair, self-replicate, adapt to feedstock variation, and require minimal fabricated parts. Mass penalty is dramatically lower — instead of shipping a chemical plant, you ship a 10g spore culture. For a civilisation bootstrapping off-Earth, synthetic biology is the metabolic engine of planetary settlement." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 10px" }}>
                <div style={{ fontFamily:MN, fontSize:8, color:col, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:10, color:"rgba(185,205,230,0.65)", lineHeight:1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Jupiter */}
        <div style={{ ...card(VIO), marginBottom:14 }}>
          <div style={secLabel}>Jupiter · Tomas · Juno MWR · water velocity structure · metallic hydrogen dynamo · differential rotation · deep jet streams · Great Red Spot · interior layers · gravity harmonics</div>
          <h2 style={h2(VIO)}>Jupiter Interior · Water Velocity Structures &amp; Deep Fluid Dynamics</h2>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:10 }}>
            {jupLayers.map((l, i) => (
              <button key={l} type="button" onClick={() => setJupLayer(i)}
                style={{ fontFamily:MN, fontSize:7.5, padding:"4px 10px", borderRadius:3, cursor:"pointer",
                  background: jupLayer === i ? VIO + "22" : "transparent",
                  border: `1px solid ${VIO}${jupLayer === i ? "cc" : "33"}`,
                  color: VIO + (jupLayer === i ? "" : "66") }}>
                L{i+1}: {l}
              </button>
            ))}
          </div>
          <JupiterFluidCanvas layer={jupLayer} />
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginTop:12 }}>
            {[
              { col:BLUE, t:"The Deep Water Layer · Juno MWR Discovery", b:"Juno's Microwave Radiometer (MWR) penetrated to ~350 km below Jupiter's cloud tops — the deepest atmospheric sounding ever achieved at a gas giant. It revealed water abundance 3–5× the solar reference value and confirmed that Jupiter's famous alternating east-west jet streams extend much deeper than expected. The water-rich layer shows moist convection patterns analogous to tropical Earth thunderstorms — but at 300 K and 10–50 bar." },
              { col:VIO,  t:"Differential Rotation & Gravity Harmonics", b:"Juno's gravity science measured Jupiter's J2–J8 gravitational harmonics with unprecedented precision. The result: differential rotation (the surface spinning at different rates by latitude) extends 3,000–5,000 km deep, then transitions to rigid-body rotation. This 'weather layer' sits above the metallic hydrogen zone where magnetic braking enforces solid rotation. The boundary shear zone is where the most dynamic fluid interaction occurs." },
              { col:GOLD, t:"Metallic Hydrogen Dynamo · The Magnetic Engine", b:"Below ~1 Mbar (~90 GPa, ~40,000 km depth), hydrogen undergoes a continuous transition to a metallic conducting state. This conducting fluid, driven by convection and the planet's rotation, generates Jupiter's magnetic field — 20,000 nT at the surface, 20,000× Earth's. The dynamo region is the source of Jupiter's powerful radiation belts and its auroral UV emissions. No boundary between gas and metallic H₂ — it's a gradual quantum phase crossover." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 10px" }}>
                <div style={{ fontFamily:MN, fontSize:8, color:col, marginBottom:4 }}>{t}</div>
                <div style={{ fontSize:10, color:"rgba(185,205,230,0.65)", lineHeight:1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* AETHER synthesis */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:14 }}>
          {[
            { col:TEAL, t:"Mass Flow as Information Flow", b:"Newton's third law is a constraint on information: if the exhaust carries momentum in one direction, the system must carry it in the other. This is not an accident of mechanics — it is a statement about the conservation of information in closed systems. AETHER treats mass flow, information flow, and coherence propagation as isomorphic structures. A jet engine and a thought are both shaped by the same underlying principle: action requires equal and opposite state change." },
            { col:GRN,  t:"Biology as Engine — The Deepest ISRU", b:"Earth's biosphere has been performing ISRU for 3.8 billion years: taking atmospheric gases and water and converting them to complex molecules at room temperature with no external catalyst. The bio-liquid engine for Mars is not a novelty — it is catching up to what life already does. The metabolic engine of a single cell converts chemical potential to mechanical work at ~60% thermodynamic efficiency. Human-made engines rarely exceed 45%." },
            { col:VIO,  t:"Jupiter as a Coherence Mirror", b:"Jupiter's layered fluid structure — from ammonia cloud bands to metallic hydrogen dynamo — is a physical model of AETHER's crystallisation stack. Each layer has its own coherence regime: turbulent atmosphere (L1), convective water layer (L2), structured molecular fluid (L3), magnetically-locked metallic zone (L4), compressed diffuse core (L5). The planet is a 140,000 km-wide demonstration of how coherence structure emerges at scale from the same fluid under increasing pressure." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:4, padding:"10px 14px" }}>
              <div style={{ fontFamily:OR, fontSize:9, color:col, letterSpacing:1, marginBottom:6 }}>{t}</div>
              <div style={{ fontSize:10.5, color:"rgba(200,215,232,0.65)", lineHeight:1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop:10, borderTop:"1px solid rgba(255,150,50,0.08)", fontFamily:MN, fontSize:7.5, color:DIM, letterSpacing:"0.12em", textAlign:"center" }}>
          JET ENGINE THRUST · F=ṁΔV · SUPERSONIC MACH · SHOCK DIAMONDS · RAPTOR FFSC · LOX/CH₄ · ISP 363s · NEWTON 3RD LAW · BIO-LIQUID ISRU · MARS SABATIER · LUNAR ELECTROLYSIS · CYANOBACTERIA · JUPITER JUNO MWR · METALLIC H₂ DYNAMO · TOMAS WATER LAYER · GRAVITY HARMONICS · AETHER COHERENCE
        </div>
      </div>
    </div>
  );
}

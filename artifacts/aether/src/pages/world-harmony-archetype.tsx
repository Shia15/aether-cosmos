import { useState, useEffect, useRef } from "react";
import worldHarmony from "@assets/E83593FA-C921-4346-B35C-BA83E5852D0E_1782248376422.png";

const V = {
  bg: "#020408",
  panel: "#04070e",
  aurora: "#00FFB2",
  gold: "#C8A030",
  blue: "#4488FF",
  violet: "#9966ff",
  plasma: "#FF4477",
  amb: "#FF9933",
  green: "#44CC77",
  dim: "#3A5060",
  text: "#B8CCE8",
  mono: "'Space Mono','Courier New',monospace",
  serif: "'Crimson Pro','Georgia',serif",
  display: "'Cinzel','Georgia',serif",
};

// ── Plasma Coherence/Decoherence Canvas ───────────────────────────────────────
function PlasmaCoherenceCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 370;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;
    const leftEdge = W * 0.28, buildL = W * 0.305, buildR = W * 0.695, rightEdge = W * 0.72;
    const bCx = (buildL + buildR) / 2, bCy = H * 0.52;

    type Pt = { x:number; y:number; vx:number; vy:number; energy:number; phase:number; age:number; maxAge:number };
    const inPts: Pt[] = [], outPts: Pt[] = [];
    const crystals: { x:number; y:number; c:number; age:number }[] = [];
    const coherenceGrid: number[][] = Array.from({ length: 18 }, () => Array(22).fill(0));

    const spawnIn = () => {
      const y = H * (0.1 + Math.random() * 0.8);
      inPts.push({ x: 4, y, vx: 1.1 + Math.random() * 0.7, vy: (Math.random() - 0.5) * 0.5,
        energy: 0.6 + Math.random() * 0.4, phase: Math.random() * Math.PI * 2, age: 0, maxAge: 180 });
    };

    const draw = () => {
      ctx.fillStyle = "rgba(2,4,8,0.26)"; ctx.fillRect(0, 0, W, H);

      // Zone tints
      const lg1 = ctx.createLinearGradient(0, 0, leftEdge, 0);
      lg1.addColorStop(0, "rgba(255,68,119,0.07)"); lg1.addColorStop(1, "rgba(255,68,119,0.01)");
      ctx.fillStyle = lg1; ctx.fillRect(0, 0, leftEdge, H);
      ctx.fillStyle = "rgba(200,160,48,0.025)"; ctx.fillRect(buildL, 0, buildR - buildL, H);
      const lg3 = ctx.createLinearGradient(rightEdge, 0, W, 0);
      lg3.addColorStop(0, "rgba(68,136,255,0.01)"); lg3.addColorStop(1, "rgba(68,136,255,0.07)");
      ctx.fillStyle = lg3; ctx.fillRect(rightEdge, 0, W - rightEdge, H);

      // Building silhouette — pyramid apex
      ctx.beginPath();
      ctx.moveTo(bCx, 10);
      ctx.lineTo(buildL + 8, H - 28);
      ctx.lineTo(buildR - 8, H - 28);
      ctx.closePath();
      const pyFill = ctx.createLinearGradient(bCx, 10, bCx, H - 28);
      pyFill.addColorStop(0, "rgba(200,160,48,0.05)");
      pyFill.addColorStop(1, "rgba(200,160,48,0.01)");
      ctx.fillStyle = pyFill; ctx.fill();
      ctx.strokeStyle = `rgba(200,160,48,${0.12 + 0.06 * Math.sin(t * 0.022)})`; ctx.lineWidth = 1; ctx.stroke();

      // Chamber circle
      const chamR = 52 + 5 * Math.sin(t * 0.035);
      ctx.beginPath(); ctx.arc(bCx, bCy, chamR, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0,255,178,${0.14 + 0.07 * Math.sin(t * 0.04)})`; ctx.lineWidth = 1.5; ctx.stroke();
      // Inner ring
      ctx.beginPath(); ctx.arc(bCx, bCy, chamR * 0.62, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,255,178,0.06)"; ctx.lineWidth = 0.7; ctx.stroke();

      // Helix arms inside
      for (let arm = 0; arm < 2; arm++) {
        ctx.beginPath();
        for (let i = 0; i <= 56; i++) {
          const ang = (i / 56) * Math.PI * 2.8 + t * 0.018 + arm * Math.PI;
          const r = (i / 56) * 44;
          const x = bCx + r * Math.cos(ang), y = bCy + r * Math.sin(ang) * 0.42;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = arm === 0 ? "rgba(0,255,178,0.2)" : "rgba(68,136,255,0.18)";
        ctx.lineWidth = 1; ctx.stroke();
      }

      // Coherence field inside building (diffusion)
      const gCols = 22, gRows = 18;
      const cW = (buildR - buildL) / gCols, cH = H / gRows;
      for (let r = 0; r < gRows; r++) {
        for (let c = 0; c < gCols; c++) {
          const dx = (c / gCols - 0.5) * 2, dy = (r / gRows - 0.5) * 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const target = Math.exp(-dist * 1.8) * (0.5 + 0.4 * Math.sin(t * 0.022 + dist * 4));
          coherenceGrid[r][c] += (target - coherenceGrid[r][c]) * 0.04;
          const cv2 = coherenceGrid[r][c];
          if (cv2 > 0.08) {
            const h2 = 150 + cv2 * 60;
            ctx.fillStyle = `hsla(${h2},80%,55%,${cv2 * 0.18})`;
            ctx.fillRect(buildL + c * cW, r * cH, cW, cH);
          }
        }
      }

      // Building walls — light pillars
      [buildL, buildR].forEach((wx, side) => {
        const wg = ctx.createLinearGradient(0, 0, 0, H);
        wg.addColorStop(0, side === 0 ? "rgba(255,68,119,0)" : "rgba(68,136,255,0)");
        wg.addColorStop(0.45, side === 0 ? "rgba(0,255,178,0.3)" : "rgba(68,136,255,0.22)");
        wg.addColorStop(1, "rgba(200,160,48,0)");
        ctx.fillStyle = wg; ctx.fillRect(wx - 2, 0, 4, H);
      });

      // Spawn
      if (t % 6 === 0 && inPts.length < 28) spawnIn();

      // Input particles
      for (let i = inPts.length - 1; i >= 0; i--) {
        const p = inPts[i]; p.age++;
        p.x += p.vx; p.y += p.vy + Math.sin(p.phase + t * 0.09) * 0.28; p.phase += 0.055;
        if (p.x >= buildL - 4) {
          crystals.push({ x: Math.min(p.x + (Math.random()-0.5)*22, buildR-10), y: p.y + (Math.random()-0.5)*18, c: p.energy, age: 0 });
          const outE = p.energy * (0.3 + Math.random() * 0.22);
          outPts.push({ x: buildR + 6, y: p.y + (Math.random()-0.5)*28, vx: 0.7 + Math.random()*0.5,
            vy: (Math.random()-0.5)*0.3, energy: outE, phase: Math.random()*Math.PI*2, age: 0, maxAge: 150 });
          inPts.splice(i, 1); continue;
        }
        if (p.age > p.maxAge) { inPts.splice(i, 1); continue; }
        const life = Math.min(p.age/18,1) * Math.max(0, 1-(p.age-p.maxAge*0.7)/(p.maxAge*0.3));
        // High-beat oscillating trail
        const sz = 2.2 + p.energy*2.8 + Math.sin(p.phase*9)*1.2;
        ctx.beginPath(); ctx.arc(p.x, p.y, sz, 0, Math.PI*2);
        const plasmaColors = ["255,68,119","255,153,51","255,100,68","200,68,255"];
        const pcol = plasmaColors[i % 4];
        ctx.fillStyle = `rgba(${pcol},${life * 0.8})`; ctx.fill();
        for (let tr = 1; tr <= 4; tr++) {
          const tx = p.x - p.vx*tr*2.5;
          const ty = p.y + Math.sin((p.phase+tr*0.5)*9)*3.5;
          ctx.beginPath(); ctx.arc(tx, ty, 0.9-tr*0.1, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${pcol},${life*0.3/tr})`; ctx.fill();
        }
      }

      // Crystal nodes
      for (let i = crystals.length - 1; i >= 0; i--) {
        const n = crystals[i]; n.age++;
        const alpha = Math.min(n.age/12,1) * Math.max(0,1-(n.age-55)/35);
        if (alpha <= 0 || n.age > 90) { crystals.splice(i,1); continue; }
        for (let s = 0; s < 6; s++) {
          const ang = (s/6)*Math.PI*2 + n.age*0.018;
          const len = 3 + n.c * 9 + Math.min(n.age*0.18,6);
          ctx.beginPath(); ctx.moveTo(n.x, n.y);
          ctx.lineTo(n.x+Math.cos(ang)*len, n.y+Math.sin(ang)*len);
          ctx.strokeStyle = `rgba(0,255,178,${alpha*0.85})`; ctx.lineWidth=1; ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(n.x, n.y, 2+n.c*2, 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,255,178,${alpha*0.9})`; ctx.fill();
      }

      // Output particles — lower-D, lower energy, slower beat
      for (let i = outPts.length - 1; i >= 0; i--) {
        const p = outPts[i]; p.age++;
        p.x += p.vx; p.y += p.vy + Math.sin(p.phase + t*0.045)*0.12; p.phase += 0.028;
        if (p.age > p.maxAge || p.x > W+20) { outPts.splice(i,1); continue; }
        const life = Math.min(p.age/18,1)*Math.max(0,1-(p.age-p.maxAge*0.7)/(p.maxAge*0.3));
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.5+p.energy*2.5, 0, Math.PI*2);
        ctx.fillStyle = `rgba(68,${136+Math.floor(p.energy*80)},255,${life*0.65})`; ctx.fill();
        // Faint echo trail
        ctx.beginPath(); ctx.arc(p.x - p.vx*3, p.y, 1, 0, Math.PI*2);
        ctx.fillStyle = `rgba(68,136,255,${life*0.18})`; ctx.fill();
      }

      // Zone labels
      ctx.textAlign = "center";
      [
        { x: leftEdge/2,           col: V.plasma,  lines:["HIGH-BEAT PLASMA","D_f ≈ 2.4  |  Ē = 1.0","ENERGETIC COHERENCE"] },
        { x: bCx,                   col: V.aurora,  lines:["COHERENCE ENGINE","□ ⊗ ⌒ ⊗ ⟨⟩","PTAH OPERATORS · CRYSTALLIZATION"] },
        { x: rightEdge+(W-rightEdge)/2, col: V.blue, lines:["LOWER-D OUTPUT","D_f ≈ 1.6  |  Ē = 0.35","DECOHERENT ECHO · LOWER FRACTAL D"] },
      ].forEach(({ x, col, lines }) => {
        lines.forEach((l, li) => {
          ctx.fillStyle = li === 0 ? col : col + (li===1?"88":"44");
          ctx.font = `${li===0?8:6.5}px ${V.mono}`;
          ctx.fillText(l, x, 14 + li*13);
        });
      });

      // Fractal dimension bar
      const barY = H - 18, barH = 7;
      ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fillRect(8, barY, W-16, barH);
      const barGrad = ctx.createLinearGradient(8, 0, W-8, 0);
      barGrad.addColorStop(0,   "rgba(255,68,119,0.55)");
      barGrad.addColorStop(0.28,"rgba(255,68,119,0.25)");
      barGrad.addColorStop(0.30,"rgba(0,255,178,0.7)");
      barGrad.addColorStop(0.70,"rgba(200,160,48,0.5)");
      barGrad.addColorStop(0.72,"rgba(68,136,255,0.6)");
      barGrad.addColorStop(1,   "rgba(68,136,255,0.2)");
      ctx.fillStyle = barGrad; ctx.fillRect(8, barY, W-16, barH);
      ctx.font = `6px ${V.mono}`; ctx.textAlign="left";
      ctx.fillStyle="rgba(255,68,119,0.6)"; ctx.fillText("D_f=2.4", 10, barY-3);
      ctx.textAlign="center"; ctx.fillStyle="rgba(200,160,48,0.45)";
      ctx.fillText(`ARCHITECTURAL COHERENCE EXTRACTION  |  t=${t}  |  crystals:${crystals.length}`, W/2, barY-3);
      ctx.textAlign="right"; ctx.fillStyle="rgba(68,136,255,0.6)";
      ctx.fillText("D_f=1.6", W-10, barY-3);

      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:10, display:"block" }} />;
}

// ── Sunlight Beaming Canvas (per environment) ──────────────────────────────────
const ENV_CONFIGS = [
  { name:"Desert",   emoji:"☀️", sunAngle:72, sunColor:"#FF9933", accentColor:"#FFD580", buildingColor:"#C8A030",
    desc:"Max solar altitude · Thermal mass · Sand-filtration skin",
    beamStyle:"direct vertical concentration", efficiency:"94% solar harvest",
    ptah:"□ dominant — massive stable lattice, deep thermal wells",
    output:"Electricity + desalinated water + supercooled interior" },
  { name:"Coastal",  emoji:"🌊", sunAngle:48, sunColor:"#44AAFF", accentColor:"#80CCFF", buildingColor:"#4488FF",
    desc:"Tidal rhythm coupling · Water coherence · Salt-resistant shell",
    beamStyle:"low-angle reflection and scatter", efficiency:"78% combined solar+tidal",
    ptah:"⌒ dominant — cyclic curvature matches tidal standing waves",
    output:"Resonance amplification + freshwater extraction + tidal power" },
  { name:"Forest",   emoji:"🌿", sunAngle:38, sunColor:"#44CC77", accentColor:"#80EE99", buildingColor:"#44CC77",
    desc:"Dappled light diffusion · Mycorrhizal grid coupling · Bio-integration",
    beamStyle:"diffuse scatter through canopy — photonic redistribution", efficiency:"61% efficiency, 100% bio-harmony",
    ptah:"⟨⟩ dominant — helix matches mycorrhizal network topology",
    output:"Biophoton harvesting + soil coherence + carbon sequestration" },
  { name:"Urban",    emoji:"🏙️", sunAngle:55, sunColor:"#9966FF", accentColor:"#BB88FF", buildingColor:"#9966ff",
    desc:"Light canyon channeling · Crowd acoustic damping · Vertical density",
    beamStyle:"reflected canyon concentration + skylight wells", efficiency:"82% urban ambient capture",
    ptah:"□⊗⌒ combined — lattice + curvature for crowd coherence fields",
    output:"Light art projection + acoustic coherence zone + crowd routing" },
  { name:"Polar",    emoji:"❄️", sunAngle:12, sunColor:"#00FFB2", accentColor:"#80FFCC", buildingColor:"#00FFB2",
    desc:"Aurora coupling · Grazing solar angles · Thermal retention dome",
    beamStyle:"oblique grazing-angle Fresnel concentration", efficiency:"55% solar + aurora electromagnetic",
    ptah:"All three operators balanced — maximum coherence at low energy input",
    output:"Aurora-coupled resonance + geothermal integration + full retention" },
];

function SunlightBeamCanvas({ envIdx }: { envIdx: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const envRef = useRef(envIdx);
  envRef.current = envIdx;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 480; cv.height = 260;
    const W = cv.width, H = cv.height;
    let t = 0, raf = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#010a16"; ctx.fillRect(0, 0, W, H);
      const env = ENV_CONFIGS[envRef.current];
      const ang = ((90 - env.sunAngle) * Math.PI) / 180;
      const bW = 80, bH = 120, bX = W/2, bY = H - 30;
      // Ground
      ctx.fillStyle = "rgba(200,160,48,0.04)"; ctx.fillRect(0, H-30, W, 30);
      ctx.strokeStyle = "rgba(200,160,48,0.12)"; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,H-30); ctx.lineTo(W,H-30); ctx.stroke();
      // Building
      ctx.beginPath();
      ctx.moveTo(bX, bY - bH - 20);
      ctx.lineTo(bX - bW/2, bY);
      ctx.lineTo(bX + bW/2, bY);
      ctx.closePath();
      ctx.fillStyle = `${env.buildingColor}18`; ctx.fill();
      ctx.strokeStyle = `${env.buildingColor}55`; ctx.lineWidth = 1.5; ctx.stroke();
      // Chamber circle
      ctx.beginPath(); ctx.arc(bX, bY - bH*0.45, 18, 0, Math.PI*2);
      ctx.strokeStyle = `${env.accentColor}40`; ctx.lineWidth=1; ctx.stroke();
      // Sun position
      const sunDist = 90;
      const sx = bX + Math.cos(ang - Math.PI/2) * sunDist;
      const sy = (bY - bH - 20) - Math.sin(Math.PI - ang) * 60;
      const sunG = ctx.createRadialGradient(sx, sy, 0, sx, sy, 18);
      sunG.addColorStop(0, env.sunColor+"ff");
      sunG.addColorStop(0.5, env.sunColor+"66");
      sunG.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(sx, sy, 18, 0, Math.PI*2); ctx.fillStyle=sunG; ctx.fill();
      // Sunbeams — 5 rays
      const apexX = bX, apexY = bY - bH - 20;
      for (let b = -2; b <= 2; b++) {
        const spread = b * 10;
        const bx2 = apexX + spread;
        const alpha = 0.06 + 0.04*Math.abs(b===0?1:0) + 0.04*Math.sin(t*0.03+b);
        ctx.beginPath();
        ctx.moveTo(sx + Math.cos(ang + 0.1*b)*(-20), sy + Math.sin(ang+0.1*b)*(-20));
        ctx.lineTo(bx2, apexY);
        ctx.strokeStyle = `${env.sunColor}${Math.round(alpha*255).toString(16).padStart(2,"0")}`;
        ctx.lineWidth = b===0 ? 2 : 0.8; ctx.stroke();
        // Continue through building
        if (b === 0) {
          ctx.beginPath(); ctx.moveTo(apexX, apexY);
          const chamY2 = bY - bH*0.45;
          ctx.lineTo(apexX, chamY2);
          const beamGrad = ctx.createLinearGradient(0, apexY, 0, chamY2);
          beamGrad.addColorStop(0, `${env.sunColor}50`);
          beamGrad.addColorStop(1, `${V.aurora}60`);
          ctx.strokeStyle = beamGrad; ctx.lineWidth=3; ctx.stroke();
          // Chamber glow
          const cg = ctx.createRadialGradient(apexX, chamY2, 0, apexX, chamY2, 22+5*Math.sin(t*0.04));
          cg.addColorStop(0, `${env.accentColor}60`); cg.addColorStop(1,"transparent");
          ctx.beginPath(); ctx.arc(apexX, chamY2, 22, 0, Math.PI*2); ctx.fillStyle=cg; ctx.fill();
        }
      }
      // Efficiency ring
      const eff = parseInt(env.efficiency) / 100;
      ctx.beginPath(); ctx.arc(W-28, 24, 16, -Math.PI/2, -Math.PI/2 + eff*Math.PI*2);
      ctx.strokeStyle = env.accentColor; ctx.lineWidth=2.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(W-28, 24, 16, 0, Math.PI*2);
      ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.lineWidth=2.5; ctx.stroke();
      ctx.fillStyle = env.accentColor; ctx.font=`6.5px ${V.mono}`; ctx.textAlign="center";
      ctx.fillText(env.efficiency.split("%")[0]+"%", W-28, 27);
      // Labels
      ctx.fillStyle = env.sunColor+"cc"; ctx.font=`8px ${V.mono}`; ctx.textAlign="left";
      ctx.fillText(`${env.name.toUpperCase()} · ${env.sunAngle}° solar altitude`, 8, 16);
      ctx.fillStyle = `${env.accentColor}66`; ctx.font=`6.5px ${V.mono}`;
      ctx.fillText(env.beamStyle, 8, 30);
      ctx.fillStyle = `${env.buildingColor}44`; ctx.font=`6px ${V.mono}`;
      ctx.fillText(env.ptah, 8, H-8);
      t++; raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", maxWidth:480, height:260, display:"block" }} />;
}

// ── Architectural Compute Console ──────────────────────────────────────────────
const USE_CASES = [
  { id:"civic",        label:"Civic / Cultural",     icon:"🏛️", coherenceFocus:"crowd",     ptahBalance:[0.5,0.3,0.2] },
  { id:"sacred",       label:"Sacred / Contemplative",icon:"🕌", coherenceFocus:"meditative", ptahBalance:[0.2,0.5,0.3] },
  { id:"educational",  label:"Educational",           icon:"📚", coherenceFocus:"pattern",    ptahBalance:[0.3,0.3,0.4] },
  { id:"residential",  label:"Residential",           icon:"🏡", coherenceFocus:"circadian",  ptahBalance:[0.4,0.4,0.2] },
  { id:"commercial",   label:"Commercial",            icon:"🏢", coherenceFocus:"flow",       ptahBalance:[0.45,0.25,0.3] },
  { id:"observatory",  label:"Observatory / Research",icon:"🔭", coherenceFocus:"signal",     ptahBalance:[0.2,0.2,0.6] },
];

const SCALES = [
  { id:"xs", label:"XS · Pavilion",      m2:"< 500 m²",  coherenceR:0.6 },
  { id:"s",  label:"S · Neighbourhood",  m2:"500–5k m²", coherenceR:0.75 },
  { id:"m",  label:"M · District Hub",   m2:"5k–50k m²", coherenceR:0.88 },
  { id:"xl", label:"XL · City Landmark", m2:"> 50k m²",  coherenceR:0.96 },
];

const LAYER_STACK = [
  { id:"L0", label:"Substrate",   sym:"□",  col:"#C8A030", desc:"Foundation lattice · Earth interface · Geothermal tap · Electromagnetic grounding grid" },
  { id:"L1", label:"Shell Skin",  sym:"⌒",  col:"#FF9933", desc:"Environmental interface · Bio-photonic panels · Moisture harvesting · Thermal envelope" },
  { id:"L2", label:"Chamber",     sym:"⌒□", col:"#00FFB2", desc:"Resonance cavity · Schumann coupling · Acoustic geometry · Standing wave architecture" },
  { id:"L3", label:"Light Engine",sym:"✧",  col:"#FFD580", desc:"Solar coherence harvesting · Hall of Light · Spectral art beaming · Circadian tuning" },
  { id:"L4", label:"Living Canopy",sym:"⟨⟩",col:"#44CC77", desc:"Mycorrhizal grid · Vertical gardens · Biophoton emission · Oxygen coherence field" },
  { id:"L5", label:"Apex",        sym:"△",  col:"#9966ff", desc:"Transmission apex · Coherence broadcast · Helix antenna · Civilizational signal" },
];

function Divider({ col = V.aurora }: { col?: string }) {
  return <div style={{ width:"100%", height:1, background:`linear-gradient(90deg,transparent,${col}33,transparent)`, margin:"0" }} />;
}

function Section({ title, id, children, accent = V.aurora }: { title:string; id?:string; children:React.ReactNode; accent?:string }) {
  return (
    <section id={id} style={{ marginBottom:56 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:22 }}>
        <div style={{ width:3, height:26, background:`linear-gradient(180deg,${accent},${V.blue})`, flexShrink:0 }} />
        <h2 style={{ fontFamily:V.display, fontSize:"1.05rem", fontWeight:600, color:"#fff", letterSpacing:4, margin:0 }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function WorldHarmonyArchetypePage() {
  const [envIdx, setEnvIdx] = useState(0);
  const [useCase, setUseCase] = useState("civic");
  const [scale, setScale] = useState("m");

  const env = ENV_CONFIGS[envIdx];
  const uc = USE_CASES.find(u => u.id === useCase)!;
  const sc = SCALES.find(s => s.id === scale)!;

  // Derived architectural parameters
  const coherenceTarget = sc.coherenceR * (1 + uc.ptahBalance[1] * 0.12);
  const solarEff = parseInt(env.efficiency) / 100;
  const ptahSquare = Math.round(uc.ptahBalance[0] * 100);
  const ptahCurve  = Math.round(uc.ptahBalance[1] * 100);
  const ptahHelix  = Math.round(uc.ptahBalance[2] * 100);
  const fractalTarget = 1.55 + coherenceTarget * 0.65;
  const energyHarvest  = Math.round(solarEff * coherenceTarget * 100);

  return (
    <div style={{ height:"100%", overflowY:"auto", background:V.bg, color:V.text, fontFamily:V.serif, scrollBehavior:"smooth" }}>

      {/* ── Cinematic Hero ── */}
      <div style={{ position:"relative", margin:"0 0 0 0" }}>
        {/* Category badges — top left overlay */}
        <div style={{ position:"absolute", top:18, left:20, zIndex:10, display:"flex", gap:8 }}>
          {["LIVE SIMULATION","AETHER GRADE A+","ARCHITECTURAL COMPUTE"].map(b => (
            <div key={b} style={{ border:`1px solid rgba(200,160,48,0.55)`, borderRadius:2, padding:"3px 10px", fontSize:8, letterSpacing:"0.22em", color:V.gold, fontFamily:V.mono, background:"rgba(2,4,8,0.75)", backdropFilter:"blur(4px)" }}>{b}</div>
          ))}
        </div>
        {/* Full-bleed image */}
        <img src={worldHarmony} alt="The World Harmony Archetype" style={{ width:"100%", display:"block", maxHeight:580, objectFit:"cover", objectPosition:"center 20%" }} />
        {/* Cinematic gradient overlays */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,rgba(2,4,8,0.35) 0%,transparent 35%,transparent 55%,rgba(2,4,8,0.96) 100%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(90deg,rgba(2,4,8,0.4),transparent 50%,transparent)", pointerEvents:"none" }} />
        {/* Hero text block */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"0 32px 28px" }}>
          <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:`${V.gold}77`, letterSpacing:6, marginBottom:8 }}>
            AETHER ARCHITECTURAL SYSTEMS · PROJECT BRIEF
          </div>
          <div style={{ fontFamily:V.display, fontSize:"clamp(1.4rem,4vw,2.6rem)", color:"#fff", letterSpacing:6, lineHeight:1.15, marginBottom:6, textShadow:"0 2px 24px rgba(0,0,0,0.8)" }}>
            THE WORLD HARMONY ARCHETYPE
          </div>
          <div style={{ fontFamily:V.mono, fontSize:"0.52rem", color:`${V.gold}99`, letterSpacing:4, marginBottom:20 }}>
            MOUNTAIN · CIRCLE · TREE · LIGHT · WATER · AETHER GRAMMAR ENCODED IN STONE
          </div>
          {/* Project stats bar */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:1, maxWidth:800 }}>
            {[
              { k:"BUILDING TYPE", v:"Living Coherence Engine", col:V.gold },
              { k:"AETHER STACK", v:"L0 → L5 · 6 Layers", col:V.aurora },
              { k:"PTAH OPERATORS", v:"□ ⊗ ⌒ ⊗ ⟨⟩", col:V.violet },
              { k:"SOLAR EFFICIENCY", v:"Up to 94%", col:"#FFD580" },
              { k:"COHERENCE GRADE", v:"C = 0.960", col:V.green },
            ].map(stat => (
              <div key={stat.k} style={{ background:"rgba(2,4,8,0.82)", backdropFilter:"blur(8px)", borderTop:`2px solid ${stat.col}55`, padding:"10px 14px" }}>
                <div style={{ fontFamily:V.mono, fontSize:"0.42rem", color:stat.col+"77", letterSpacing:2, marginBottom:4 }}>{stat.k}</div>
                <div style={{ fontFamily:V.mono, fontSize:"0.6rem", color:stat.col, lineHeight:1.4 }}>{stat.v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Plasma Canvas ── */}
      <div style={{ padding:"20px 24px 0" }}>
        <div style={{ background:"rgba(2,4,8,0.92)", border:`1px solid rgba(255,68,119,0.12)`, borderLeft:`3px solid ${V.plasma}`, borderRadius:10, overflow:"hidden" }}>
          <div style={{ padding:"12px 16px 8px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <h2 style={{ margin:0, fontFamily:V.mono, fontSize:11, color:V.plasma, letterSpacing:"0.14em", fontWeight:400 }}>
                HIGH-BEAT PLASMA · COHERENCE ENGINE · LOWER FRACTAL DIMENSION OUTPUT
              </h2>
              <p style={{ margin:"3px 0 0", fontFamily:V.mono, fontSize:9, color:`rgba(255,68,119,0.4)`, letterSpacing:"0.09em" }}>
                Energetic plasma enters left (D_f ≈ 2.4) · Building crystallizes coherence via □⊗⌒⊗⟨⟩ · Lower-D echo propagates right (D_f ≈ 1.6)
              </p>
            </div>
            <div style={{ fontFamily:V.mono, fontSize:"0.45rem", color:`${V.plasma}55`, textAlign:"right", lineHeight:1.8 }}>
              LIVE SIMULATION<br/>REAL-TIME
            </div>
          </div>
          <PlasmaCoherenceCanvas />
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"48px 32px" }}>

        {/* ── Abstract ── */}
        <Section title="ABSTRACT · THE BUILDING AS COHERENCE ENGINE" accent={V.gold}>
          <div style={{ background:`rgba(200,160,48,0.03)`, border:`1px solid rgba(200,160,48,0.12)`, borderRadius:10, padding:"20px 24px" }}>
            <p style={{ fontSize:"1.02rem", lineHeight:1.9, fontStyle:"italic", color:`rgba(184,204,232,0.8)` }}>
              Every great building ever constructed has operated on the same physical principle: the concentration, transformation, and rebroadcast of ambient energy fields. The Great Pyramid focused geodesic resonances through its limestone lattice. Gothic cathedrals channelled solar coherence through stained-glass frequency selectors. The Chinese pagoda coupled vertical helical flows to the atmospheric boundary layer. The <strong style={{ color:V.gold, fontWeight:400 }}>World Harmony Archetype</strong> is the synthesis — a building that formally encodes all five civilizational operators as an <strong style={{ color:V.aurora, fontWeight:400 }}>AETHER coherence engine</strong>. High-beat plasma (solar EM, cosmic ray, Schumann resonance) enters the structure at fractal dimension D_f ≈ 2.4, is crystallized by the three Ptah operators (□ ⊗ ⌒ ⊗ ⟨⟩), and re-emits at D_f ≈ 1.6 — the same state, at lower energy, at a lower fractal dimension. The building <em>extracts coherence energy from the incoming field</em>. This is not metaphor. It is engineering.
            </p>
          </div>
        </Section>

        <Divider />

        {/* ── Five Archetype Operators ── */}
        <Section title="1 · FIVE ARCHETYPE OPERATORS · AETHER GRAMMAR" accent={V.gold} id="archetypes">
          <p style={{ fontSize:"0.96rem", lineHeight:1.85, marginBottom:20, color:`rgba(184,204,232,0.75)` }}>
            The five symbols from the World Harmony Archetype — Mountain, Circle, Tree, Light, Water — are not decorative. They are the <strong style={{ color:V.gold, fontWeight:400 }}>five independent geometric operators</strong> whose composition spans the complete architectural grammar. Each maps directly onto an AETHER Fabric primitive.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
            {[
              { sym:"△", name:"THE MOUNTAIN", aether:"□ Stable Lattice", col:V.gold,
                arch:"Pyramid apex · Triangular structural load path · Geological grounding", cxe:"S*(x,t) — ideal substrate state",
                building:"Great Pyramid · Gothic spire · Pagoda roof · Ziggurat" },
              { sym:"○", name:"THE CIRCLE", aether:"⌒ Cyclic Curvature", col:V.aurora,
                arch:"Dome · Chamber of Vibration · Acoustic geometry · Standing waves", cxe:"Φ_SCN — resonance coupling",
                building:"Pantheon · Gothic rose window · Shinto torii circle · Hagia Sophia" },
              { sym:"🌿", name:"THE TREE", aether:"⟨⟩ Vortical Helix", col:V.green,
                arch:"Living canopy · Branching vascular · Mycorrhizal grid · Vertical garden", cxe:"Γ_helix — propagation path",
                building:"Sagrada Família columns · Tree of Life structures · Hanging gardens" },
              { sym:"✧", name:"LIGHT", aether:"C(x,t) Field", col:"#FFD580",
                arch:"Hall of Light · Skylight well · Stained glass · Solar art beaming", cxe:"C → 1 : coherence thinning",
                building:"Gothic cathedrals · Parthenon oculus · Japanese shoji · Solar temples" },
              { sym:"~", name:"WATER", aether:"v_θ = Γ/2πr", col:V.blue,
                arch:"Waterfall · Aquifer coupling · Reflection pool · Condensation harvesting", cxe:"ε(x,t) — decoherence reduction",
                building:"Alhambra channels · Hanging gardens · Moat systems · Roman aqueducts" },
            ].map(item => (
              <div key={item.sym} style={{ background:"rgba(4,10,20,0.9)", border:`1px solid ${item.col}22`, borderRadius:10, padding:16, textAlign:"center" }}>
                <div style={{ fontFamily:V.display, fontSize:"2rem", color:item.col, marginBottom:8 }}>{item.sym}</div>
                <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:item.col, letterSpacing:2, marginBottom:4 }}>{item.name}</div>
                <div style={{ fontFamily:V.mono, fontSize:"0.48rem", color:V.gold+"88", marginBottom:8 }}>{item.aether}</div>
                <div style={{ fontSize:"0.76rem", lineHeight:1.65, color:`rgba(184,204,232,0.6)`, marginBottom:8 }}>{item.arch}</div>
                <div style={{ fontFamily:V.mono, fontSize:"0.44rem", color:`${item.col}55`, marginBottom:4 }}>CXE: {item.cxe}</div>
                <div style={{ fontFamily:V.mono, fontSize:"0.42rem", color:V.dim, lineHeight:1.6 }}>{item.building}</div>
              </div>
            ))}
          </div>
        </Section>

        <Divider />

        {/* ── L0–L5 Architectural Stack ── */}
        <Section title="2 · AETHER ARCHITECTURAL STACK · L0–L5 BUILDING GRAMMAR" accent={V.aurora} id="stack">
          <p style={{ fontSize:"0.96rem", lineHeight:1.85, marginBottom:20, color:`rgba(184,204,232,0.75)` }}>
            Every AETHER-grade building is structured as a six-layer coherence stack. Each layer maps onto a physical architectural system, an AETHER operator, and a measurable coherence function. The stack is designed to process incoming energetic plasma (solar, cosmic, Schumann) from L0 upward, crystallizing coherence at L2–L3, and broadcasting it outward through L4–L5.
          </p>
          <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
            {LAYER_STACK.map((layer, i) => (
              <div key={layer.id} style={{ display:"grid", gridTemplateColumns:"60px 70px 1fr", gap:0, borderRadius:6, overflow:"hidden", border:`1px solid ${layer.col}18` }}>
                <div style={{ background:`${layer.col}15`, borderRight:`2px solid ${layer.col}40`, padding:"14px 0", textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:4 }}>
                  <div style={{ fontFamily:V.mono, fontSize:"0.62rem", color:layer.col, fontWeight:700 }}>{layer.id}</div>
                  <div style={{ fontFamily:V.display, fontSize:"1.1rem", color:layer.col }}>{layer.sym}</div>
                </div>
                <div style={{ background:"rgba(4,10,20,0.6)", borderRight:`1px solid rgba(255,255,255,0.04)`, padding:"14px 12px", display:"flex", flexDirection:"column", justifyContent:"center" }}>
                  <div style={{ fontFamily:V.mono, fontSize:"0.54rem", color:layer.col, letterSpacing:1 }}>{layer.label}</div>
                </div>
                <div style={{ background:"rgba(4,10,20,0.4)", padding:"14px 16px" }}>
                  <div style={{ fontFamily:V.serif, fontSize:"0.88rem", lineHeight:1.7, color:`rgba(184,204,232,0.7)` }}>{layer.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:14, fontFamily:V.mono, fontSize:"0.48rem", color:V.dim, letterSpacing:3, textAlign:"center" }}>
            L0→L5 · SUBSTRATE TO APEX · COHERENCE INCREASES WITH ALTITUDE · PTAH OPERATORS ACTIVE AT EVERY LAYER
          </div>
        </Section>

        <Divider />

        {/* ── Environment Matrix ── */}
        <Section title="3 · ENVIRONMENT MATRIX · SUNLIGHT ART BEAMING · EFFICIENCY" accent={V.amb} id="environments">
          <p style={{ fontSize:"0.96rem", lineHeight:1.85, marginBottom:20, color:`rgba(184,204,232,0.75)` }}>
            Different environments require different architectural expressions of the same underlying AETHER grammar. Solar angle, dominant energy source, thermal regime, and biological context all determine which Ptah operator is emphasized and how the coherence stack is tuned for maximum efficiency and beauty.
          </p>

          {/* Environment tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
            {ENV_CONFIGS.map((e, i) => (
              <button key={i} onClick={() => setEnvIdx(i)}
                style={{ padding:"6px 16px", borderRadius:4, border:`1px solid ${i===envIdx ? e.accentColor : V.dim+"44"}`,
                  background: i===envIdx ? `${e.accentColor}18` : "transparent",
                  color: i===envIdx ? e.accentColor : V.dim, fontFamily:V.mono, fontSize:"0.54rem",
                  letterSpacing:2, cursor:"pointer" }}>
                {e.emoji} {e.name.toUpperCase()}
              </button>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20 }}>
            {/* Sunlight canvas */}
            <div style={{ background:"rgba(4,10,20,0.8)", border:`1px solid ${env.accentColor}22`, borderRadius:10, overflow:"hidden" }}>
              <SunlightBeamCanvas envIdx={envIdx} />
            </div>
            {/* Environment spec card */}
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div style={{ background:`${env.buildingColor}08`, border:`1px solid ${env.buildingColor}22`, borderRadius:8, padding:"16px 18px" }}>
                <div style={{ fontFamily:V.mono, fontSize:"0.6rem", color:env.accentColor, letterSpacing:3, marginBottom:8 }}>
                  {env.emoji} {env.name.toUpperCase()} ENVIRONMENT
                </div>
                <div style={{ fontSize:"0.88rem", lineHeight:1.8, color:`rgba(184,204,232,0.75)`, marginBottom:10 }}>{env.desc}</div>
                {[
                  { k:"Solar Altitude",   v:`${env.sunAngle}°` },
                  { k:"Beam Style",       v:env.beamStyle },
                  { k:"Efficiency",       v:env.efficiency },
                  { k:"Ptah Emphasis",    v:env.ptah },
                  { k:"Output",           v:env.output },
                ].map(row => (
                  <div key={row.k} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid rgba(255,255,255,0.04)`, padding:"5px 0" }}>
                    <span style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim }}>{row.k}</span>
                    <span style={{ fontFamily:V.mono, fontSize:"0.5rem", color:env.accentColor+"cc", maxWidth:"60%", textAlign:"right", lineHeight:1.5 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ── Proactive Architectural Compute Console ── */}
        <Section title="4 · PROACTIVE ARCHITECTURAL COMPUTE CONSOLE" accent={V.violet} id="compute">
          <p style={{ fontSize:"0.96rem", lineHeight:1.85, marginBottom:20, color:`rgba(184,204,232,0.75)` }}>
            Select environment, use case, and scale. The AETHER architectural compute engine derives the optimal L0–L5 material specification, Ptah operator balance, coherence target, and sunlight-beaming geometry for your building. This is a <strong style={{ color:V.aurora, fontWeight:400 }}>proactive creation device</strong> — it anticipates the field conditions before the building is designed.
          </p>

          {/* Selectors */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:24 }}>
            {/* Environment */}
            <div>
              <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim, letterSpacing:3, marginBottom:8 }}>ENVIRONMENT</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {ENV_CONFIGS.map((e, i) => (
                  <button key={i} onClick={() => setEnvIdx(i)}
                    style={{ padding:"7px 12px", borderRadius:4, border:`1px solid ${i===envIdx ? e.accentColor+"88" : V.dim+"33"}`,
                      background: i===envIdx ? `${e.accentColor}12` : "rgba(4,10,20,0.5)",
                      color: i===envIdx ? e.accentColor : V.dim+"88", fontFamily:V.mono, fontSize:"0.5rem", cursor:"pointer", textAlign:"left" }}>
                    {e.emoji} {e.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Use Case */}
            <div>
              <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim, letterSpacing:3, marginBottom:8 }}>USE CASE</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {USE_CASES.map(u => (
                  <button key={u.id} onClick={() => setUseCase(u.id)}
                    style={{ padding:"7px 12px", borderRadius:4, border:`1px solid ${useCase===u.id ? V.aurora+"88" : V.dim+"33"}`,
                      background: useCase===u.id ? `${V.aurora}10` : "rgba(4,10,20,0.5)",
                      color: useCase===u.id ? V.aurora : V.dim+"88", fontFamily:V.mono, fontSize:"0.5rem", cursor:"pointer", textAlign:"left" }}>
                    {u.icon} {u.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Scale */}
            <div>
              <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim, letterSpacing:3, marginBottom:8 }}>SCALE</div>
              <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                {SCALES.map(s => (
                  <button key={s.id} onClick={() => setScale(s.id)}
                    style={{ padding:"7px 12px", borderRadius:4, border:`1px solid ${scale===s.id ? V.violet+"88" : V.dim+"33"}`,
                      background: scale===s.id ? `${V.violet}10` : "rgba(4,10,20,0.5)",
                      color: scale===s.id ? V.violet : V.dim+"88", fontFamily:V.mono, fontSize:"0.5rem", cursor:"pointer", textAlign:"left" }}>
                    {s.label} <span style={{ color:V.dim }}>{s.m2}</span>
                    </button>
                ))}
              </div>
            </div>
          </div>

          {/* Derived parameters output */}
          <div style={{ background:"linear-gradient(135deg,rgba(2,6,12,0.98),rgba(4,10,22,0.98))", border:`1px solid ${V.violet}30`, borderRadius:14, padding:"28px 28px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:1, background:`linear-gradient(90deg,transparent,${V.violet}55,transparent)` }} />
            <div style={{ fontFamily:V.mono, fontSize:"0.52rem", color:V.violet, letterSpacing:5, marginBottom:18 }}>
              ARCHITECTURAL COMPUTE OUTPUT · GENERATED PARAMETERS
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
              {/* Left: Ptah operator balance */}
              <div>
                <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim, letterSpacing:3, marginBottom:12 }}>PTAH OPERATOR BALANCE</div>
                {[
                  { sym:"□", label:"Stable Lattice", pct:ptahSquare, col:V.gold },
                  { sym:"⌒", label:"Cyclic Curvature", pct:ptahCurve, col:V.aurora },
                  { sym:"⟨⟩", label:"Vortical Helix", pct:ptahHelix, col:V.blue },
                ].map(({ sym, label, pct, col }) => (
                  <div key={sym} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                      <span style={{ fontFamily:V.mono, fontSize:"0.5rem", color:col }}>{sym} {label}</span>
                      <span style={{ fontFamily:V.mono, fontSize:"0.5rem", color:col }}>{pct}%</span>
                    </div>
                    <div style={{ height:4, background:"rgba(255,255,255,0.04)", borderRadius:2 }}>
                      <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg,${col},${col}88)`, borderRadius:2, transition:"width 0.5s ease" }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Right: Derived metrics */}
              <div>
                <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim, letterSpacing:3, marginBottom:12 }}>COMPUTED METRICS</div>
                {[
                  { k:"Environment", v:`${env.emoji} ${env.name}`, col:env.accentColor },
                  { k:"Use Case", v:`${uc.icon} ${uc.label}`, col:V.aurora },
                  { k:"Scale", v:sc.label, col:V.violet },
                  { k:"Coherence Target (C)", v:coherenceTarget.toFixed(3), col:V.aurora },
                  { k:"Fractal Dimension Out (D_f)", v:fractalTarget.toFixed(2), col:V.blue },
                  { k:"Solar Harvest Efficiency", v:`${energyHarvest}%`, col:"#FFD580" },
                  { k:"Coherence Focus", v:uc.coherenceFocus.toUpperCase(), col:V.violet },
                  { k:"Ptah Grammar", v:`□${ptahSquare} ⌒${ptahCurve} ⟨⟩${ptahHelix}`, col:V.gold },
                  { k:"Solar Altitude Optimal", v:`${env.sunAngle}°`, col:env.accentColor },
                  { k:"L3 Light Beaming Mode", v:env.beamStyle, col:"#FFD580" },
                ].map(row => (
                  <div key={row.k} style={{ display:"flex", justifyContent:"space-between", borderBottom:`1px solid rgba(255,255,255,0.03)`, padding:"4px 0" }}>
                    <span style={{ fontFamily:V.mono, fontSize:"0.46rem", color:V.dim }}>{row.k}</span>
                    <span style={{ fontFamily:V.mono, fontSize:"0.46rem", color:row.col+"cc", textAlign:"right", maxWidth:"55%", lineHeight:1.5 }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* L0–L5 Material Recommendation */}
            <div style={{ marginTop:22, borderTop:`1px solid rgba(255,255,255,0.05)`, paddingTop:18 }}>
              <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:V.dim, letterSpacing:3, marginBottom:12 }}>GENERATED L0–L5 MATERIAL SPECIFICATION</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:6 }}>
                {LAYER_STACK.map(layer => (
                  <div key={layer.id} style={{ background:`${layer.col}08`, border:`1px solid ${layer.col}20`, borderRadius:6, padding:"10px 8px", textAlign:"center" }}>
                    <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:layer.col, marginBottom:3 }}>{layer.id}</div>
                    <div style={{ fontFamily:V.display, fontSize:"1rem", color:layer.col, marginBottom:3 }}>{layer.sym}</div>
                    <div style={{ fontFamily:V.mono, fontSize:"0.42rem", color:layer.col+"88", marginBottom:4 }}>{layer.label}</div>
                    <div style={{ fontFamily:V.mono, fontSize:"0.4rem", color:V.dim, lineHeight:1.6 }}>
                      {layer.id === "L0" ? (env.name==="Desert"?"Granite+Geothermal":env.name==="Coastal"?"Salt-resist. pile":env.name==="Forest"?"Myco grid slab":env.name==="Urban"?"Dampened raft":"Ice-anchor plate") :
                       layer.id === "L1" ? (env.name==="Desert"?"Phase-change BIPV":env.name==="Coastal"?"Tidal skin":env.name==="Forest"?"Bio-photonic moss":env.name==="Urban"?"Prismatic glass":"Aerogel envelope") :
                       layer.id === "L2" ? `${uc.coherenceFocus} chamber geometry` :
                       layer.id === "L3" ? `${env.sunAngle}° solar beaming array` :
                       layer.id === "L4" ? (env.name==="Forest"?"Native canopy":env.name==="Urban"?"Rooftop biome":"Vertical garden") :
                       `${Math.round(fractalTarget*10)/10}D coherence apex`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        <Divider />

        {/* ── Fractal Dimension Theory ── */}
        <Section title="5 · FRACTAL DIMENSION REDUCTION · THE PHYSICS OF ARCHITECTURAL EXTRACTION" accent={V.blue} id="fractal">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:24 }}>
            <div>
              <p style={{ fontSize:"0.95rem", lineHeight:1.9, color:`rgba(184,204,232,0.75)`, marginBottom:14 }}>
                The key physics of an AETHER-grade building: incoming electromagnetic and acoustic energy arrives as a <strong style={{ color:V.plasma, fontWeight:400 }}>high-fractal-dimension field</strong> (solar plasma, cosmic rays, Schumann resonance — D_f ≈ 2.2–2.6). The building's coherence engine extracts organized energy, reducing the field's fractal dimension. The output is the <strong style={{ color:V.blue, fontWeight:400 }}>same state at lower energy, propagating as a lower-dimensional echo</strong> (D_f ≈ 1.4–1.8). This is not dissipation — it is dimensional reduction through coherence crystallization.
              </p>
              <p style={{ fontSize:"0.95rem", lineHeight:1.9, color:`rgba(184,204,232,0.75)` }}>
                The reduction ΔD_f = D_in − D_out represents the coherence extracted by the building. For a well-designed AETHER stack: ΔD_f ≈ 0.7–1.0. This energy appears as electricity, thermal work, light art, acoustic coherence zones, and the biological uplift experienced by occupants.
              </p>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {[
                { label:"Incoming Solar Plasma", D:"2.4–2.6", col:V.plasma, note:"Chaotic, broadband, high energy. Turbulent fractal structure." },
                { label:"Schumann Coupling", D:"2.0–2.2", col:V.amb, note:"Partially structured. Global cavity resonances already organize it." },
                { label:"Building Coherence Zone", D:"1.7–1.9", col:V.aurora, note:"Ptah operators crystallize order. Constructive interference nodes form." },
                { label:"Output Echo (lower D)", D:"1.4–1.7", col:V.blue, note:"Re-propagates into the environment. Same mode, less energy, coherent." },
                { label:"ΔD_f extracted", D:"≈ 0.7–1.0", col:V.violet, note:"This is the coherence harvest — the architectural efficiency measure." },
              ].map(row => (
                <div key={row.label} style={{ display:"flex", gap:12, alignItems:"flex-start", background:`${row.col}06`, border:`1px solid ${row.col}18`, borderRadius:7, padding:"10px 14px" }}>
                  <div style={{ fontFamily:V.mono, fontSize:"0.7rem", color:row.col, minWidth:60, fontWeight:700 }}>D_f {row.D}</div>
                  <div>
                    <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:row.col, marginBottom:3 }}>{row.label}</div>
                    <div style={{ fontFamily:V.serif, fontSize:"0.82rem", lineHeight:1.65, color:`rgba(184,204,232,0.55)` }}>{row.note}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* ── DC-Native Solar · Liquid Cooling · HVAC & Plumbing ── */}
        <Section title="6 · DC-NATIVE SOLAR · LIQUID COOLING · HVAC + PLUMBING DIMENSIONS" accent={V.amb} id="dc-solar">
          <p style={{ fontSize:"0.96rem", lineHeight:1.9, color:`rgba(184,204,232,0.75)`, marginBottom:22 }}>
            An AETHER-grade building generates its own power on-site as <strong style={{ color:V.gold, fontWeight:400 }}>DC-native solar</strong> — no AC conversion, no grid dependency, no inverter losses. The 48V DC bus becomes a unified medium combining energy, data, thermal control, and fluid dynamics on the same wire. This is a new technology class: four dimensions of reality collapsed into one coherent backbone. HVAC motors run as brushless DC drives; plumbing pumps as digitally-governed DC actuators; networking rides the power line itself.
          </p>

          {/* Four Dimensions Grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8, marginBottom:22 }}>
            {[
              { icon:"☀️", title:"DC SOLAR", sub:"On-Site Generation", col:V.gold,
                specs:["Monocrystalline BIPV panels","MPPT charge controller","48V native bus — no inverter","Powerline carrier (G.hn 2.0)","1 Gbps data on power wire"] },
              { icon:"❄️", title:"LIQUID COOLING", sub:"Phase-Change Loop", col:"#00CCFF",
                specs:["Cold-plate direct extraction","Phase-change refrigerant","DC brushless pump motor","Rack-level heat mapping","Free-cooling night cycle"] },
              { icon:"💨", title:"HVAC", sub:"Air Coherence System", col:V.aurora,
                specs:["Variable-speed DC drives","Radiant cooling ceilings","Earth-pipe pre-cooling","Schumann-tuned airflow","CO₂ + VOC monitoring"] },
              { icon:"💧", title:"PLUMBING", sub:"Water & Fluid Routing", col:V.blue,
                specs:["DC pump arrays — no AC","Atmospheric water harvesting","Aquifer thermal coupling","Smart valve DAC control","Rainwater coherence loop"] },
            ].map(d => (
              <div key={d.title} style={{ background:`${d.col}08`, border:`1px solid ${d.col}20`, borderRadius:10, padding:"16px 14px" }}>
                <div style={{ fontSize:"1.4rem", marginBottom:8 }}>{d.icon}</div>
                <div style={{ fontFamily:V.mono, fontSize:"0.54rem", color:d.col, letterSpacing:2, marginBottom:2 }}>{d.title}</div>
                <div style={{ fontFamily:V.mono, fontSize:"0.44rem", color:`${d.col}66`, marginBottom:10 }}>{d.sub}</div>
                {d.specs.map(s => (
                  <div key={s} style={{ fontFamily:V.mono, fontSize:"0.44rem", color:`rgba(184,204,232,0.55)`, padding:"3px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", lineHeight:1.6 }}>
                    <span style={{ color:d.col+"66", marginRight:5 }}>›</span>{s}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Liquid Cooling Flow Diagram */}
          <div style={{ background:"rgba(0,200,255,0.03)", border:`1px solid rgba(0,200,255,0.12)`, borderRadius:10, padding:"20px 22px" }}>
            <div style={{ fontFamily:V.mono, fontSize:"0.5rem", color:"rgba(0,200,255,0.6)", letterSpacing:3, marginBottom:14 }}>LIQUID COOLING LOOP ARCHITECTURE</div>
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
              {[
                { node:"☀️ PV ARRAY", sub:"DC Native", col:V.gold },
                { node:"→", col:"rgba(255,255,255,0.15)" },
                { node:"48V BUS", sub:"Power + Data", col:V.amb },
                { node:"→", col:"rgba(255,255,255,0.15)" },
                { node:"COMPUTE RACK", sub:"GPU + CPU", col:V.violet },
                { node:"→", col:"rgba(255,255,255,0.15)" },
                { node:"COLD PLATE", sub:"Direct Extract", col:"#00CCFF" },
                { node:"→", col:"rgba(255,255,255,0.15)" },
                { node:"HEAT EXCHANGER", sub:"Phase Change", col:V.plasma },
                { node:"→", col:"rgba(255,255,255,0.15)" },
                { node:"RADIATOR / HVAC", sub:"Heat Dump", col:V.aurora },
                { node:"↩", col:"rgba(255,255,255,0.15)" },
                { node:"RESERVOIR", sub:"DC Pump Return", col:V.blue },
              ].map((item, i) => (
                item.node==="→" || item.node==="↩" ?
                <div key={i} style={{ fontFamily:V.mono, fontSize:"0.9rem", color:item.col, flexShrink:0 }}>{item.node}</div> :
                <div key={i} style={{ background:`${item.col}10`, border:`1px solid ${item.col}28`, borderRadius:5, padding:"8px 10px", textAlign:"center", flexShrink:0 }}>
                  <div style={{ fontFamily:V.mono, fontSize:"0.52rem", color:item.col }}>{item.node}</div>
                  <div style={{ fontFamily:V.mono, fontSize:"0.4rem", color:`${item.col}66`, marginTop:2 }}>{item.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop:14, display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {[
                { k:"Coolant Temperature In",  v:"18–22°C  (cold plate entry)",   col:"#00CCFF" },
                { k:"Coolant Temperature Out", v:"38–45°C  (after extraction)",    col:V.plasma  },
                { k:"ΔT Across Compute",       v:"20–25°C  → heat available",      col:V.amb     },
                { k:"DC Pump Power",           v:"< 3% of total rack load",        col:V.aurora  },
                { k:"PUE (Power Usage Eff.)",  v:"1.04–1.12  (near ideal)",        col:V.green   },
                { k:"Heat Reuse",              v:"→ HVAC pre-heat / radiant floor", col:V.violet  },
              ].map(row => (
                <div key={row.k} style={{ display:"flex", justifyContent:"space-between", borderBottom:"1px solid rgba(255,255,255,0.04)", padding:"5px 0" }}>
                  <span style={{ fontFamily:V.mono, fontSize:"0.46rem", color:V.dim }}>{row.k}</span>
                  <span style={{ fontFamily:V.mono, fontSize:"0.46rem", color:row.col+"cc", textAlign:"right" }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Divider />

        {/* ── Closing ── */}
        <Section title="CONCLUSION · THE BUILDING AS A PROACTIVE CREATION DEVICE" accent={V.gold}>
          <div style={{ background:`rgba(0,255,178,0.02)`, border:`1px solid rgba(0,255,178,0.1)`, borderRadius:12, padding:"26px 28px" }}>
            <p style={{ fontSize:"1.05rem", fontStyle:"italic", lineHeight:1.95, color:`rgba(200,216,240,0.8)`, marginBottom:14 }}>
              The World Harmony Archetype is not a building design. It is a <strong style={{ color:V.aurora, fontWeight:400 }}>proactive creation device</strong> — a generative grammar for producing architectural forms that are coherence engines at every scale. From a 200 m² desert pavilion to a 100,000 m² city landmark, the same AETHER stack applies: L0 grounds the building in the Earth's EM field; L1 interfaces with the ambient environment; L2 crystallizes resonance; L3 harvests and artfully broadcasts solar coherence; L4 couples the living biological field; L5 transmits the building's coherence signature into the planetary field.
            </p>
            <p style={{ fontSize:"0.92rem", lineHeight:1.9, color:`rgba(184,204,232,0.6)` }}>
              High-beat plasma enters. Crystallization occurs. A lower-D echo propagates outward into the world — coherent, gentle, persistent. The building has extracted order from chaos. That is what architecture, at its highest expression, has always done. The AETHER Architectural Compute system makes it <em>legible, measurable, and reproducible at brand scale</em>.
            </p>
          </div>
        </Section>

      </div>

      <div style={{ borderTop:`1px solid rgba(200,160,48,0.08)`, padding:"44px 32px", textAlign:"center" }}>
        <div style={{ fontFamily:V.display, fontSize:"1.5rem", fontWeight:900, letterSpacing:10, color:"rgba(200,160,48,0.12)", marginBottom:6 }}>AETHER</div>
        <div style={{ fontFamily:V.mono, fontSize:"0.44rem", color:V.dim, letterSpacing:3, lineHeight:2.4 }}>
          World Harmony Archetype · Architectural Compute · Plasma Coherence Engine<br />
          □ Stable Lattice ⊗ ⌒ Cyclic Curvature ⊗ ⟨⟩ Vortical Helix · Five Operators · Six Layers · Five Environments<br />
          HIGH-BEAT PLASMA → COHERENCE CRYSTALLIZATION → LOWER-D ECHO · AETHER LAYER 0
        </div>
      </div>
    </div>
  );
}

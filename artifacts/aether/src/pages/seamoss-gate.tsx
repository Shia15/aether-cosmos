import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG     = "#020a06";
const PANEL  = "rgba(3,10,5,0.97)";
const BORDER = "#0a1a0f";
const GOLD   = "#c9a84c";
const CYAN   = "#2ef0d8";
const VIOLET = "#9966ff";
const GREEN  = "#44ee88";
const LIME   = "#a8ee44";
const TEAL   = "#1fd4c8";
const DIM    = "#1a3020";
const TEXT   = "#a8c8b0";
const MUTED  = "#2a4838";
const EMBER  = "#ff8833";
const ROSE   = "#ff55aa";
const BLUE   = "#4488ff";
const SKY    = "#66ccff";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Gate operating mode ── */
type GateMode = "off" | "threshold" | "on";

/* ── Ion species in seamoss gel layer ── */
interface Ion {
  symbol: string; name: string; charge: string;
  color: string; nernst: string; role: string;
  selectivity: number; // 0–1
}

const IONS: Ion[] = [
  { symbol:"K⁺",   name:"Potassium",  charge:"+1", color:GOLD,   nernst:"+59.2 mV/dec", role:"Primary channel-gating cation · κ-carrageenan cross-link", selectivity:0.92 },
  { symbol:"Ca²⁺", name:"Calcium",    charge:"+2", color:CYAN,   nernst:"+29.6 mV/dec", role:"Second messenger · ι-carrageenan bridge · EDL stiffener", selectivity:0.85 },
  { symbol:"Na⁺",  name:"Sodium",     charge:"+1", color:TEAL,   nernst:"+59.2 mV/dec", role:"Bulk ionic carrier · osmotic potential control", selectivity:0.70 },
  { symbol:"I⁻",   name:"Iodine",     charge:"−1", color:VIOLET, nernst:"−59.2 mV/dec", role:"Anion gate — reversal of EDL polarity · thyroid signal", selectivity:0.88 },
  { symbol:"Mg²⁺", name:"Magnesium",  charge:"+2", color:LIME,   nernst:"+29.6 mV/dec", role:"ATP cofactor gating · enzyme activation threshold", selectivity:0.65 },
  { symbol:"Fe²⁺", name:"Iron",       charge:"+2", color:EMBER,  nernst:"+29.6 mV/dec", role:"Redox gate · electron-carrier signal in channel region", selectivity:0.55 },
];

/* ── Gate material comparison ── */
const MATERIALS = [
  { name:"Silicon Dioxide",     formula:"SiO₂",       color:BLUE,
    κ:"3.9", bandgap:"8.9 eV", type:"Amorphous insulator",
    thk:"1–10 nm (modern)", cap:"~3.5 nF/cm²",
    mode:"Charge-field gating — electric field depletes/inverts Si channel",
    limit:"Tunnelling leakage below 2 nm; fixed oxide charge traps; no ion selectivity" },
  { name:"Carrageenan Hydrogel", formula:"(C₁₂H₁₄O₁₃S₂)ₙ", color:GREEN,
    κ:"~80 (H₂O-dominated)", bandgap:"None (ionic)", type:"Electrolyte — ionic conductor",
    thk:"1 µm–1 mm", cap:"10–100 µF/cm²",
    mode:"Electric double layer (EDL) gating — ionic redistribution drives channel modulation",
    limit:"AC coupling only; frequency response limited by ion mobility; requires hydration" },
  { name:"SiO₂ / Seamoss Stack", formula:"Si | SiO₂ | gel",color:GOLD,
    κ:"3.9 (SiO₂) + 80 (gel)", bandgap:"Hybrid", type:"ISFET / EGOT hybrid",
    thk:"SiO₂ 2 nm + gel 10–100 µm", cap:"Dominated by EDL (~µF/cm²)",
    mode:"SiO₂ passivates Si surface; seamoss EDL provides ionic gate; Nernst sensitivity for each ion",
    limit:"Reference electrode required; carrageenan dehydration; competitive ion binding" },
];

/* ══════════════════════════════════════════
   GATE CROSS-SECTION CANVAS
══════════════════════════════════════════ */
interface GateParticle {
  x: number; y: number; vx: number; vy: number;
  ion: Ion; life: number; alpha: number; size: number;
}

function GateCanvas({ mode }: { mode: GateMode }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const particles = useRef<GateParticle[]>([]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr; cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function spawnIon(W: number, gelY: number, gelH: number): GateParticle {
      const ion = IONS[Math.floor(Math.random() * IONS.length)];
      return {
        x: Math.random() * W,
        y: gelY + Math.random() * gelH,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.4,
        ion, life: 1, alpha: 0, size: 2.5 + Math.random() * 2,
      };
    }

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.012;
      const T = t0.current;
      const m = modeRef.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H); ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      // ── Layer definitions (top → bottom) ──
      const layers = [
        { label:"GATE ELECTRODE",   sub:"Metal (Au/Pt)",    h:0.12, color:DIM,    text:GOLD,   y:0 },
        { label:"SEAMOSS GEL",      sub:"Carrageenan (κ/ι/λ) · K⁺ Ca²⁺ I⁻", h:0.28, color:"rgba(20,80,35,0.18)", text:GREEN, y:0 },
        { label:"SiO₂",            sub:"Gate oxide · 2 nm",h:0.06, color:"rgba(60,100,200,0.15)", text:BLUE, y:0 },
        { label:"Si CHANNEL",       sub:"p-type silicon",   h:0.20, color:"rgba(30,50,120,0.12)", text:SKY, y:0 },
        { label:"Si SUBSTRATE",     sub:"p⁺ bulk",         h:0.16, color:"rgba(15,30,80,0.20)",text:VIOLET, y:0 },
      ];

      let runY = 0;
      layers.forEach(l => { l.y = runY * H; runY += l.h; });

      // Draw layers
      layers.forEach(l => {
        const lh = l.h * H;
        ctx!.fillStyle = l.color;
        ctx!.fillRect(0, l.y, W, lh);
        // Top border
        ctx!.strokeStyle = l.text + "30"; ctx!.lineWidth = 1;
        ctx!.beginPath(); ctx!.moveTo(0, l.y); ctx!.lineTo(W, l.y); ctx!.stroke();
        // Label
        ctx!.font = `8px ${serif}`; ctx!.textAlign = "left"; ctx!.fillStyle = l.text + "cc";
        ctx!.fillText(l.label, 10, l.y + lh/2 - 3);
        ctx!.font = `7px ${mono}`; ctx!.fillStyle = l.text + "66";
        ctx!.fillText(l.sub, 10, l.y + lh/2 + 8);
      });

      // ── SiO₂ passivation detail ──
      const sio2 = layers[2];
      ctx!.fillStyle = BLUE + "30";
      ctx!.fillRect(0, sio2.y, W, sio2.h * H);
      for (let x = 0; x < W; x += 18) {
        const y = sio2.y + (sio2.h * H) / 2;
        ctx!.beginPath(); ctx!.arc(x + 9, y, 2.5, 0, Math.PI*2);
        ctx!.fillStyle = SKY + "60"; ctx!.fill();
      }
      ctx!.font = `6px ${mono}`; ctx!.textAlign = "right"; ctx!.fillStyle = BLUE + "88";
      ctx!.fillText("Si–O–Si bonds · fixed oxide charge", W - 8, sio2.y + 9);

      // ── Electric double layer at gel/SiO₂ interface ──
      const gelLayer = layers[1];
      const edlY = gelLayer.y + gelLayer.h * H - 4;
      // EDL positive layer (adsorbed cations)
      const edlPulse = m === "off" ? 0.3 : m === "threshold" ? 0.7 : 1.0;
      for (let x = 12; x < W - 12; x += 16) {
        const jitter = Math.sin(T * 2 + x * 0.1) * 2;
        ctx!.beginPath(); ctx!.arc(x, edlY + jitter, 3 * edlPulse, 0, Math.PI*2);
        ctx!.fillStyle = GOLD + Math.round(edlPulse * 180).toString(16).padStart(2,"0");
        ctx!.fill();
        ctx!.font = `5px ${mono}`; ctx!.textAlign = "center"; ctx!.fillStyle = GOLD + "88";
        ctx!.fillText("+", x, edlY + jitter + 1.5);
      }
      // EDL label
      ctx!.font = `7px ${mono}`; ctx!.textAlign = "right"; ctx!.fillStyle = GOLD + "99";
      ctx!.fillText(`EDL · C_edl ≈ ${m==="off"?"5":m==="threshold"?"30":"80"} µF/cm²`, W - 8, edlY - 5);

      // ── Channel inversion (bottom of Si channel layer) ──
      const chanLayer = layers[3];
      const chanY = chanLayer.y + chanLayer.h * H;
      const chanAlpha = m === "off" ? 0.0 : m === "threshold" ? 0.3 : 0.9;
      if (chanAlpha > 0) {
        const cGrad = ctx!.createLinearGradient(0, chanLayer.y + chanLayer.h*H*0.6, 0, chanY);
        cGrad.addColorStop(0, `rgba(68,238,136,${chanAlpha*0.4})`);
        cGrad.addColorStop(1, `rgba(68,238,136,${chanAlpha*0.15})`);
        ctx!.fillStyle = cGrad;
        ctx!.fillRect(0, chanLayer.y + chanLayer.h*H*0.6, W, chanLayer.h*H*0.4);
        ctx!.font = `7px ${mono}`; ctx!.textAlign = "right"; ctx!.fillStyle = GREEN + Math.round(chanAlpha*220).toString(16).padStart(2,"0");
        ctx!.fillText(`n-CHANNEL INVERSION · I_D = ${m==="on"?"HIGH":"LOW"}`, W-8, chanY - 5);
      }

      // ── Source / Drain contacts ──
      [0, W - 60].forEach((sx, si) => {
        ctx!.fillStyle = MUTED;
        ctx!.fillRect(sx, chanLayer.y, 60, chanLayer.h * H);
        ctx!.font = `7px ${mono}`; ctx!.textAlign = "center"; ctx!.fillStyle = TEXT + "88";
        ctx!.fillText(si === 0 ? "SOURCE" : "DRAIN", sx + 30, chanLayer.y + chanLayer.h*H/2 + 3);
        // Current arrow
        if (m === "on") {
          ctx!.beginPath();
          const ay = chanLayer.y + chanLayer.h * H * 0.8;
          if (si === 0) { ctx!.moveTo(sx+60, ay); ctx!.lineTo(sx+60+20, ay); }
          else { ctx!.moveTo(sx-20, ay); ctx!.lineTo(sx, ay); }
          ctx!.strokeStyle = GREEN + "cc"; ctx!.lineWidth = 2; ctx!.stroke();
        }
      });

      // ── Current flow horizontal indicator ──
      if (m === "on") {
        const fy = chanLayer.y + chanLayer.h * H * 0.8;
        const flowT = (T * 0.5) % 1;
        ctx!.beginPath(); ctx!.arc(60 + flowT * (W - 120), fy, 3, 0, Math.PI*2);
        ctx!.fillStyle = GREEN; ctx!.fill();
      }

      // ── Ion particles in gel ──
      const gelY = gelLayer.y, gelH = gelLayer.h * H;
      const rate = m === "off" ? 0.08 : m === "threshold" ? 0.18 : 0.28;
      if (Math.random() < rate && particles.current.length < 60)
        particles.current.push(spawnIon(W, gelY, gelH));

      particles.current = particles.current.filter(p => p.life > 0.01);
      particles.current.forEach(p => {
        // Near-EDL ions drift toward interface in ON mode
        if (m === "on") p.vy += 0.04;
        if (m === "threshold") p.vy += 0.01;
        p.x += p.vx; p.y += p.vy;
        // Bounce within gel layer
        if (p.y < gelY) { p.y = gelY; p.vy *= -0.7; }
        if (p.y > gelY + gelH - 8) { p.y = gelY + gelH - 8; p.vy *= -0.8; }
        if (p.x < 0 || p.x > W) p.life = 0;
        p.life -= 0.005; p.alpha = Math.min(1, p.alpha + 0.05);
        const a = p.alpha * p.life;
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size * 2, 0, Math.PI*2);
        ctx!.fillStyle = p.ion.color + Math.round(a * 28).toString(16).padStart(2,"0"); ctx!.fill();
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx!.fillStyle = p.ion.color + Math.round(a * 220).toString(16).padStart(2,"0"); ctx!.fill();
        if (p.size > 3 && a > 0.5) {
          ctx!.font = `6px ${mono}`; ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
          ctx!.fillStyle = p.ion.color + Math.round(a * 180).toString(16).padStart(2,"0");
          ctx!.fillText(p.ion.symbol, p.x, p.y);
        }
      });
      ctx!.textBaseline = "alphabetic";

      // ── Mode readout ──
      ctx!.font = `8px ${mono}`; ctx!.textAlign = "right";
      const modeC = m==="off"?ROSE:m==="threshold"?GOLD:GREEN;
      ctx!.fillStyle = modeC + "cc";
      ctx!.fillText(`MODE: ${m.toUpperCase()}  V_G ${m==="off"?"< V_T":m==="threshold"?"= V_T":"> V_T"}`,
        W - 8, H - 10);
      ctx!.fillStyle = MUTED;
      ctx!.fillText(`V_T ≈ φ/e · ln(Na/ni)  |  Nernst: +59.2 mV/dec (K⁺)`, W - 8, H - 22);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:280 }} />;
}

/* ══════════ NERNST / EDL CANVAS ══════════ */
function NernstCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    }
    resize(); window.addEventListener("resize", resize);

    function loop() {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.012;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle = BG; ctx!.fillRect(0,0,W,H);

      const padL = 56, padR = 18, padT = 16, padB = 36;
      const pW = W-padL-padR, pH = H-padT-padB;
      const ox = padL, oy = padT+pH;

      // Grid
      for (let g=0; g<=5; g++) {
        ctx!.strokeStyle = MUTED+"30"; ctx!.lineWidth=0.5;
        ctx!.beginPath(); ctx!.moveTo(ox+(g/5)*pW,padT); ctx!.lineTo(ox+(g/5)*pW,oy); ctx!.stroke();
      }
      for (let g=0; g<=4; g++) {
        ctx!.beginPath(); ctx!.moveTo(ox,padT+(g/4)*pH); ctx!.lineTo(ox+pW,padT+(g/4)*pH); ctx!.stroke();
      }

      // Axes
      ctx!.strokeStyle = DIM+"cc"; ctx!.lineWidth=1.5;
      ctx!.beginPath(); ctx!.moveTo(ox,padT-4); ctx!.lineTo(ox,oy+12); ctx!.stroke();
      ctx!.beginPath(); ctx!.moveTo(ox-8,oy); ctx!.lineTo(ox+pW+4,oy); ctx!.stroke();
      ctx!.font=`7px ${mono}`; ctx!.textAlign="right"; ctx!.fillStyle=TEXT+"88";
      ctx!.fillText("V_gate (mV)", ox-4, padT+5);
      ctx!.textAlign="center"; ctx!.fillText("log [ion activity]  →", ox+pW/2, oy+28);

      // Y-axis ticks
      ["+300","+200","+100","0","-100"].forEach((l,i)=>{
        const y = padT+(i/4)*pH;
        ctx!.textAlign="right"; ctx!.font=`6px ${mono}`; ctx!.fillStyle=CYAN+"60";
        ctx!.fillText(l, ox-5, y+3);
      });

      // Nernst lines for each major ion
      const nernstIons = [
        { ion:IONS[0], slope: 0.592, yOffset:0.35 }, // K⁺ +59.2 mV/dec
        { ion:IONS[1], slope: 0.296, yOffset:0.55 }, // Ca²⁺ +29.6 mV/dec
        { ion:IONS[2], slope: 0.592, yOffset:0.45 }, // Na⁺ +59.2 mV/dec
        { ion:IONS[3], slope:-0.592, yOffset:0.60 }, // I⁻ -59.2 mV/dec (anion)
      ];

      nernstIons.forEach(ni => {
        ctx!.beginPath();
        for (let px=0; px<=pW; px++) {
          const xN = (px/pW) * 5 - 2.5; // log activity: -2.5 to +2.5
          const vN = ni.yOffset - ni.slope * xN * 0.4; // normalized
          const y = padT + vN * pH;
          if (px===0) ctx!.moveTo(ox+px, y);
          else ctx!.lineTo(ox+px, y);
        }
        ctx!.strokeStyle = ni.ion.color+"99"; ctx!.lineWidth=1.5; ctx!.stroke();
        // Label at right edge
        const xLast = pW, xN = 2.5;
        const vN = ni.yOffset - ni.slope * xN * 0.4;
        const yLast = padT + vN * pH;
        ctx!.font=`7px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=ni.ion.color+"cc";
        ctx!.fillText(ni.ion.symbol, ox+xLast+3, yLast+3);
      });

      // Animated probe (moving activity)
      const probeLogA = Math.sin(T*0.4)*2.0;
      const probeX = ox + ((probeLogA+2.5)/5)*pW;
      const selIon = nernstIons[0]; // K⁺
      const probeV = selIon.yOffset - selIon.slope * probeLogA * 0.4;
      const probeY = padT + probeV * pH;
      ctx!.beginPath(); ctx!.arc(probeX, probeY, 5, 0, Math.PI*2);
      ctx!.fillStyle = GOLD+"40"; ctx!.fill();
      ctx!.beginPath(); ctx!.arc(probeX, probeY, 2.5, 0, Math.PI*2);
      ctx!.fillStyle = GOLD; ctx!.fill();
      ctx!.font=`7px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=GOLD+"cc";
      ctx!.fillText(`V = ${(selIon.yOffset*300 - selIon.slope*probeLogA*0.4*300).toFixed(1)} mV`, probeX+7, probeY-3);
      ctx!.font=`6px ${mono}`; ctx!.fillStyle=MUTED;
      ctx!.fillText(`log[K⁺] = ${probeLogA.toFixed(2)}`, probeX+7, probeY+7);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:200 }} />;
}

/* ══════════ AETHER THRESHOLD CHAIN ══════════ */
const AETHER_CHAIN = [
  { sym:"C(x,t)",   label:"Coherence Field",         color:VIOLET, note:"The state of the substrate — before the gate decision" },
  { sym:"C* = φ⁻¹", label:"Threshold ≈ 0.618",      color:GOLD,   note:"The golden ratio reciprocal — the stability threshold in all AETHER systems" },
  { sym:"V_T",      label:"Gate Threshold Voltage",  color:CYAN,   note:"The seamoss gate voltage at which the channel inverts — set by ion activity" },
  { sym:"I_D > 0",  label:"Channel On — Current",    color:GREEN,  note:"Signal passes the threshold: coherence crystallizes, current flows, information is transmitted" },
  { sym:"ΔE/h",     label:"Isotope Lock (frequency)",color:TEAL,   note:"The absolute reference — seamoss iodine → thyroid frequency → the same equation as the atomic clock" },
];

/* ══════════ MAIN PAGE ══════════ */
function SeamossGateHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let x=0;x<W;x+=16){
        const h=20+30*Math.abs(Math.sin(x*0.02+t*0.02));
        const alpha=0.3+0.3*Math.abs(Math.sin(x*0.03+t*0.015));
        ctx.fillStyle=`rgba(68,204,119,${alpha*0.4})`;ctx.fillRect(x,H-h,12,h);
        ctx.beginPath();
        for(let seg=0;seg<4;seg++){
          const bx=x+6+Math.sin(seg*1.5+t*0.03)*4,by=H-h-seg*10;
          ctx.beginPath();ctx.arc(bx,by,3,0,Math.PI*2);ctx.fillStyle=`rgba(68,204,119,${alpha*0.6})`;ctx.fill();
        }
      }
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SEAMOSS GATE · ALGAE BIOREACTOR · PHOTOSYNTHESIS · SUBSTRATE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SeamossGatePage() {
  const [mode, setMode] = useState<GateMode>("threshold");
  const [activeIon, setActiveIon] = useState(0);
  const [activeMat, setActiveMat] = useState(2);

  const panelBox: React.CSSProperties = {
    background:PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px", marginBottom:10, position:"relative",
  };
  const topLine = (c = GOLD) => (
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
      background:`linear-gradient(90deg,${c},transparent)`,opacity:0.4 }} />
  );
  const SH = ({ label, color=GOLD }:{label:string;color?:string}) => (
    <div style={{ fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",
      color,marginBottom:6,borderBottom:`1px solid ${BORDER}`,paddingBottom:3 }}>
      {label}
    </div>
  );

  const modeColor = mode==="off"?ROSE:mode==="threshold"?GOLD:GREEN;
  const am = MATERIALS[activeMat];

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>
      {/* ── HEADER ── */}
      <div style={{ padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(2,8,4,0.98)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${GREEN},${CYAN},${GOLD},transparent)`,
          opacity:0.45 }} />
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:7, letterSpacing:"0.2em", color:GREEN, marginBottom:3 }}>
              AETHER · BIO-SEMICONDUCTOR · CHONDRUS CRISPUS · SiO₂ · ELECTROLYTE GATE
            </div>
            <div style={{ fontFamily:serif, fontSize:20, letterSpacing:2, color:"#fff" }}>
              SEAMOSS GATE
            </div>
            <div style={{ fontFamily:body, fontStyle:"italic", fontSize:11, color:DIM, marginTop:2 }}>
              Carrageenan gel as bio-ionic gate dielectric · SiO₂ comparison · EDL capacitance · Nernst sensitivity
            </div>
          </div>
          {/* Gate mode selector */}
          <div style={{ display:"flex", gap:4 }}>
            {([["off","OFF · V < V_T",ROSE],["threshold","THRESHOLD · V = V_T",GOLD],["on","ON · V > V_T",GREEN]] as const).map(([m,l,c])=>(
              <button key={m} onClick={()=>setMode(m)} style={{
                padding:"6px 14px", fontFamily:mono, fontSize:8, letterSpacing:"0.1em",
                cursor:"pointer", borderRadius:2, transition:"all 0.15s",
                border:`1px solid ${mode===m ? c : BORDER}`,
                background: mode===m ? `${c}18` : "transparent",
                color: mode===m ? c : MUTED,
              }}>{l}</button>
            ))}
          </div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:MUTED,
            maxWidth:210, lineHeight:1.65 }}>
            The gate is the threshold device. The seamoss sets the threshold by providing ionic charge carriers from 92 minerals.
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"14px 20px 32px",
        display:"grid", gridTemplateColumns:"230px 1fr 265px", gap:12 }}>

        {/* ══ LEFT ══ */}
        <div>
          {/* Material comparison */}
          <div style={panelBox}>
            {topLine(BLUE)}
            <SH label="Gate Dielectric · Materials" color={BLUE} />
            {MATERIALS.map((mat, i) => (
              <div key={mat.formula} onClick={() => setActiveMat(i)} style={{
                marginBottom:6, padding:"7px 9px", cursor:"pointer",
                background: activeMat===i ? `${mat.color}10` : "transparent",
                border:`1px solid ${activeMat===i ? mat.color : BORDER}`,
                borderRadius:2, transition:"all 0.15s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <div style={{ fontSize:9, fontWeight:"bold", color:mat.color }}>{mat.name}</div>
                </div>
                <div style={{ fontFamily:serif, fontSize:11, color:mat.color, marginBottom:3 }}>{mat.formula}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {[["κ",mat.κ],["Gap",mat.bandgap],["C",mat.cap]].map(([k,v])=>(
                    <div key={k} style={{ fontSize:7, padding:"2px 5px",
                      border:`1px solid ${mat.color}30`, borderRadius:1, color:MUTED }}>
                      {k}: <span style={{ color:mat.color }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {/* Active material detail */}
            <div style={{ padding:"8px 9px", background:`${am.color}07`,
              border:`1px solid ${am.color}30`, borderRadius:2 }}>
              <div style={{ fontSize:8, fontWeight:"bold", color:am.color, marginBottom:3 }}>{am.name} · Gate Mode</div>
              <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.65, marginBottom:4 }}>{am.mode}</div>
              <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}><span style={{ color:ROSE }}>Limit: </span>{am.limit}</div>
            </div>
          </div>

          {/* Work function & key equations */}
          <div style={panelBox}>
            {topLine(CYAN)}
            <SH label="Gate Physics · Key Equations" color={CYAN} />
            {[
              { label:"Threshold voltage",  eq:"V_T = Φ_ms + 2ψ_B + Q_ox/C_ox",  color:CYAN,
                note:"Φ_ms = metal-semiconductor work function difference. ψ_B = bulk potential. Q_ox = oxide charge." },
              { label:"Nernst sensitivity",  eq:"V = V₀ + (RT/nF)·ln[a_ion]",      color:GOLD,
                note:"R = gas constant, T = temperature, n = ion charge, F = Faraday. Seamoss: 59.2 mV/decade for monovalent ions." },
              { label:"EDL capacitance",    eq:"C_EDL ≈ ε₀·ε_r / λ_D",            color:GREEN,
                note:"λ_D = Debye length (nm scale in hydrogel). EDL capacitance 10,000× higher than SiO₂ at same thickness." },
              { label:"Debye length",       eq:"λ_D = √(ε·kT / 2N_A·e²·I)",       color:TEAL,
                note:"I = ionic strength of seamoss gel. Higher mineral concentration → shorter λ_D → higher C_EDL." },
              { label:"Drain current",      eq:"I_D = μ·C_EDL·(W/L)·(V_GS−V_T)²", color:VIOLET,
                note:"EDL replaces C_ox. Same MOSFET equation — but C_EDL ≫ C_ox → much lower V_T." },
            ].map(e=>(
              <div key={e.label} style={{ marginBottom:6, padding:"5px 7px",
                borderLeft:`2px solid ${e.color}50`, background:`${e.color}05`, borderRadius:2 }}>
                <div style={{ fontSize:7, color:MUTED, marginBottom:1 }}>{e.label}</div>
                <div style={{ fontFamily:serif, fontSize:10, color:e.color, marginBottom:2, letterSpacing:0.3 }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.5 }}>{e.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Gate cross-section canvas */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"6px 12px 5px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:7, color:MUTED, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                Gate Cross-Section · Electrode → Seamoss Gel → SiO₂ → Si Channel
              </div>
              <div style={{ fontSize:8, color:modeColor }}>
                {mode==="off"?"No channel inversion":mode==="threshold"?"EDL forming at interface":"Full inversion channel · I_D flows"}
              </div>
            </div>
            <GateCanvas mode={mode} />
          </div>

          {/* Ion selectivity table */}
          <div style={panelBox}>
            {topLine(GREEN)}
            <SH label="Mineral Ion Gate Carriers · Click to Inspect" color={GREEN} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:6 }}>
              {IONS.map((ion, i) => (
                <div key={ion.symbol} onClick={() => setActiveIon(i)} style={{
                  padding:"7px 9px", cursor:"pointer",
                  background: activeIon===i ? `${ion.color}10` : "transparent",
                  border:`1px solid ${activeIon===i ? ion.color : BORDER}`,
                  borderRadius:2, transition:"all 0.15s" }}>
                  <div style={{ fontFamily:serif, fontSize:14, color:ion.color, marginBottom:2 }}>{ion.symbol}</div>
                  <div style={{ fontSize:8, color:TEXT, marginBottom:2 }}>{ion.name}</div>
                  <div style={{ fontSize:8, color:ion.color, marginBottom:2 }}>{ion.nernst}</div>
                  <div style={{ height:3, background:BORDER, borderRadius:2, marginBottom:3 }}>
                    <div style={{ height:"100%", width:`${ion.selectivity*100}%`,
                      background:ion.color, borderRadius:2 }} />
                  </div>
                  <div style={{ fontSize:7, color:MUTED }}>selectivity {(ion.selectivity*100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
            {/* Active ion detail */}
            <div style={{ marginTop:8, padding:"7px 10px",
              background:`${IONS[activeIon].color}08`,
              border:`1px solid ${IONS[activeIon].color}30`, borderRadius:2 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <div style={{ fontFamily:serif, fontSize:13, color:IONS[activeIon].color }}>{IONS[activeIon].symbol} · {IONS[activeIon].name}</div>
                <div style={{ fontSize:8, color:IONS[activeIon].color }}>Charge: {IONS[activeIon].charge} · {IONS[activeIon].nernst}</div>
              </div>
              <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.7 }}>{IONS[activeIon].role}</div>
            </div>
          </div>

          {/* Nernst response curve */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"6px 12px 5px", borderBottom:`1px solid ${BORDER}` }}>
              <div style={{ fontSize:7, color:MUTED, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                Nernst Response · V vs log[ion activity] · K⁺ Ca²⁺ Na⁺ I⁻
              </div>
            </div>
            <NernstCanvas />
          </div>

          {/* SiO₂ vs seamoss comparison */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}35` }}>
            {topLine()}
            <SH label="SiO₂ vs Seamoss Gel · Head-to-Head" color={GOLD} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[MATERIALS[0], MATERIALS[1]].map(mat => (
                <div key={mat.formula} style={{ padding:"8px", background:`${mat.color}06`,
                  border:`1px solid ${mat.color}20`, borderRadius:2 }}>
                  <div style={{ fontFamily:serif, fontSize:12, color:mat.color, marginBottom:4 }}>{mat.formula}</div>
                  <div style={{ fontSize:8, color:mat.color, marginBottom:3 }}>{mat.name}</div>
                  {[["κ (dielectric)",mat.κ],["Bandgap",mat.bandgap],["Type",mat.type],["Capacitance",mat.cap]].map(([k,v])=>(
                    <div key={k} style={{ display:"flex", justifyContent:"space-between",
                      padding:"2px 0", borderBottom:`1px solid ${BORDER}` }}>
                      <span style={{ fontSize:8, color:MUTED }}>{k}</span>
                      <span style={{ fontSize:8, color:mat.color }}>{v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div style={{ marginTop:8, padding:"7px 10px",
              background:`${GOLD}07`, border:`1px solid ${GOLD}20`, borderRadius:2 }}>
              <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.75 }}>
                The seamoss gel provides <span style={{ color:GREEN }}>10,000× higher gate capacitance</span> than SiO₂ at equivalent thickness — because the electric double layer forms at the nanometer-scale Debye length, not the micrometer-scale gel thickness. Operating voltage drops from ~1 V (SiO₂) to <span style={{ color:CYAN }}>&lt;0.1 V (EDL gate)</span>. The SiO₂ layer is retained to passivate the silicon surface and prevent direct ion contamination of the channel.
              </div>
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div>
          {/* AETHER threshold chain */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}40` }}>
            {topLine()}
            <SH label="AETHER Threshold Mapping" color={GOLD} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.65 }}>
              The gate is the same operation as AETHER's coherence threshold. Below C*: no signal passes. Above C*: crystallization. The seamoss gate is a physical implementation of the AETHER decision function.
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              {AETHER_CHAIN.map((s, i) => (
                <div key={s.sym}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 9px",
                    background:`${s.color}08`, border:`1px solid ${s.color}25`, borderRadius:2 }}>
                    <div style={{ fontFamily:serif, fontSize:13, color:s.color, width:52, flexShrink:0 }}>{s.sym}</div>
                    <div>
                      <div style={{ fontSize:8, color:s.color, marginBottom:1 }}>{s.label}</div>
                      <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.4 }}>{s.note}</div>
                    </div>
                  </div>
                  {i < AETHER_CHAIN.length-1 && (
                    <div style={{ textAlign:"center", fontSize:10, color:MUTED, lineHeight:1.2 }}>↓</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Applications */}
          <div style={panelBox}>
            {topLine(CYAN)}
            <SH label="Bio-Ionic Gate Applications" color={CYAN} />
            {[
              [GREEN,  "ISFET Ion Sensor",      "Ion-Sensitive FET: seamoss gel replaces conventional ion-selective membrane. Detects K⁺/Ca²⁺/Na⁺ in body fluids with Nernst sensitivity (59.2 mV/dec)."],
              [GOLD,   "Electrolyte-Gated Organic Transistor (EGOT)", "Ultra-low voltage organic transistor: EDL capacitance allows full channel modulation at <0.1 V. Biocompatible, flexible, wearable."],
              [CYAN,   "Neural Interface Gate", "Seamoss gel at the neuron–electrode interface: matches ionic environment of cerebrospinal fluid. K⁺/Ca²⁺/Na⁺ ion activity encodes neural signal."],
              [VIOLET, "Environmental Sensor",  "Seamoss gate changes V_T with ocean/water mineral composition. A living biosensor — the seamoss updates its own gate potential with the environment."],
              [TEAL,   "SiO₂ Passivation Layer","SiO₂ protects the Si surface from direct ionic attack while allowing the EDL to form above it — preserving semiconductor integrity over time."],
              [LIME,   "Seamoss + Mycelium Gate","Mycelium network provides additional electrical pathways through the gel layer — a dual-substrate gate with extended spatial sensing."],
            ].map(([c,t,d])=>(
              <div key={t as string} style={{ marginBottom:6, padding:"5px 8px",
                borderLeft:`2px solid ${(c as string)}40` }}>
                <div style={{ fontSize:8, fontWeight:"bold", color:c as string, marginBottom:2 }}>{t}</div>
                <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>{d}</div>
              </div>
            ))}
          </div>

          {/* AETHER synthesis */}
          <div style={{ ...panelBox, border:`1px solid ${GREEN}30` }}>
            {topLine(GREEN)}
            <SH label="AETHER Synthesis" color={GREEN} />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.85 }}>
              Seamoss spent millions of years accumulating 92 minerals from the ocean — becoming a perfectly tuned ionic environment. When placed on a silicon dioxide surface, it becomes a gate. The mineral ions in the gel form an electric double layer at the SiO₂ interface. The K⁺ concentration sets the Nernst potential. The threshold voltage V_T is set by the ionic composition of the ocean — by the seamoss's history. <span style={{ color:GOLD }}>The gate remembers the ocean.</span> This is the same principle as AETHER's C(x,t): the substrate's current state encodes the history of its inputs, and that history sets the threshold for future crystallization.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

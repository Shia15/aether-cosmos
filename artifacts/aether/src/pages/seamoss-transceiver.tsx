import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG      = "#020a08";
const PANEL   = "rgba(3,12,10,0.97)";
const BORDER  = "#0a1f18";
const GOLD    = "#c9a84c";
const GOLD2   = "#f0d06a";
const TEAL    = "#1fd4a8";
const CYAN    = "#2ef0d8";
const GREEN   = "#44ee88";
const LIME    = "#a8ee44";
const VIOLET  = "#9966ff";
const ROSE    = "#ff5588";
const DIM     = "#1e3830";
const TEXT    = "#a0c8b8";
const MUTED   = "#3a6858";
const EMBER   = "#ff8833";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Transceiver modes ── */
type TxMode = "rx" | "process" | "tx";

interface Mode {
  id: TxMode; label: string; sub: string; color: string;
  detail: string;
  signals: string[];
}

const MODES: Mode[] = [
  {
    id:"rx", label:"RX · RECEIVE", sub:"Ocean → Seamoss matrix",
    color: CYAN,
    detail:"Seamoss absorbs incoming signals from the marine environment: dissolved mineral ions enter the carrageenan gel network through diffusion gradient; incident photons drive photosynthesis (light-to-chemical transduction); oscillating EM fields interact with the charged polysaccharide backbone; hydrostatic pressure variations modulate gel conformation.",
    signals:["Dissolved mineral ions (92 elements)","Solar photon flux (350–700nm)","Oceanic EM field fluctuations","Hydrostatic pressure waves","pH and salinity gradients","Tidal EM induction currents"],
  },
  {
    id:"process", label:"PROCESS · INTEGRATE", sub:"Carrageenan helix encoding",
    color: TEAL,
    detail:"The carrageenan polymer chains — sulfated galactose units in helical configuration — act as the signal processing medium. Incoming mineral ions cross-link the helices (K⁺ drives κ-carrageenan gelation; Ca²⁺ drives ι-carrageenan). The gel undergoes conformational shifts that redistribute ionic charge. pH-dependent sulfate group protonation modulates signal sensitivity. This is the integration layer: the physical state of the gel IS the memory of received signals.",
    signals:["K⁺ → κ-carrageenan gelation","Ca²⁺ → ι-carrageenan cross-link","Sulfate protonation (pH gate)","Helix ↔ coil conformational switch","Ion redistribution in polymer matrix","Gel ↔ sol phase memory state"],
  },
  {
    id:"tx", label:"TX · TRANSMIT", sub:"Seamoss → body / environment",
    color: GREEN,
    detail:"Processed signals are released as bioactive molecular broadcasts. Iodine (I⁻) is released as the thyroid endocrine signal — the primary hormonal broadcast. Carrageenan fragments signal the immune system (TLR4 pathway). Potassium ions create an electrochemical gradient that can drive membrane potential shifts in nearby cells. Fucoidan (sulfated polysaccharide) acts as an anti-coagulant signal. The seamoss has received, integrated, and re-transmitted environmental information as biochemical language.",
    signals:["I⁻ iodine → thyroid hormone precursor","κ-carrageenan → anti-inflammatory","K⁺ electrochemical gradient broadcast","Fucoidan → anti-coagulant signal","Mg²⁺ → enzyme activation cascade","Selenium → thyroid T3/T4 activation"],
  },
];

/* ── Mineral ion carriers ── */
interface MineralIon {
  symbol: string; name: string; charge: string;
  color: string; role: string; freq: number; // relative abundance
}

const IONS: MineralIon[] = [
  { symbol:"I⁻",   name:"Iodine",    charge:"−1", color:VIOLET, role:"Thyroid signal carrier · endocrine broadcast", freq:0.9 },
  { symbol:"K⁺",   name:"Potassium", charge:"+1", color:GOLD,   role:"Membrane potential · κ-carrageenan gelation", freq:0.85 },
  { symbol:"Ca²⁺", name:"Calcium",   charge:"+2", color:CYAN,   role:"Second messenger · ι-carrageenan cross-link", freq:0.75 },
  { symbol:"Mg²⁺", name:"Magnesium", charge:"+2", color:LIME,   role:"ATP cofactor · enzyme activation signal", freq:0.7 },
  { symbol:"Na⁺",  name:"Sodium",    charge:"+1", color:TEAL,   role:"Osmotic signal · electrochemical gradient", freq:0.65 },
  { symbol:"Fe²⁺", name:"Iron",      charge:"+2", color:EMBER,  role:"Electron transport · oxygen signal carrier", freq:0.6 },
  { symbol:"Se",   name:"Selenium",  charge:"0",  color:GREEN,  role:"T3/T4 thyroid hormone activation", freq:0.5 },
  { symbol:"Zn²⁺", name:"Zinc",      charge:"+2", color:ROSE,   role:"DNA transcription signal · immune activation", freq:0.45 },
];

/* ── Carrageenan types ── */
const CARRA = [
  {
    greek:"κ", name:"Kappa-carrageenan", color:GOLD,
    trigger:"K⁺", gels:"Firm, brittle gel",
    mode:"Signal LOCK — incoming K⁺ ions trigger gelation, locking the matrix into solid memory state. High signal retention.",
    structure:"1,3-β-D-galactose-4-sulfate + 1,4-3,6-anhydro-α-D-galactose",
  },
  {
    greek:"ι", name:"Iota-carrageenan", color:CYAN,
    trigger:"Ca²⁺", gels:"Elastic, soft gel",
    mode:"Signal FLEX — Ca²⁺-bridged helices allow elastic conformational memory. Signal state is reversible and tunable.",
    structure:"1,3-β-D-galactose-4-sulfate + 1,4-3,6-anhydro-α-D-galactose-2-sulfate",
  },
  {
    greek:"λ", name:"Lambda-carrageenan", color:TEAL,
    trigger:"No gel", gels:"Free-flowing solution",
    mode:"Signal BROADCAST — no gelation; dissolved polymer disperses signal freely throughout the medium. Maximum transmission range.",
    structure:"1,3-β-D-galactose-2-sulfate + 1,4-α-D-galactose-2,6-disulfate",
  },
];

/* ── AETHER layer mapping ── */
const AETHER_LAYERS = [
  { layer:"L1", name:"Molecular Substrate", color:VIOLET,
    seamoss:"Carrageenan polymer backbone — the physical scaffold encoding all signal states" },
  { layer:"L2", name:"Quantum-Bio Processing", color:CYAN,
    seamoss:"Ion-polymer interaction at sulfate groups — quantum charge transfer in helical conformation" },
  { layer:"L3", name:"Signal Fidelity Tuning", color:GOLD,
    seamoss:"κ/ι/λ ratio determines gel-state and therefore signal bandwidth and retention" },
  { layer:"L4", name:"Direct Control", color:GREEN,
    seamoss:"Iodine release rate — the primary biochemical output signal to the endocrine system" },
  { layer:"L5", name:"Coherence Passive Floor", color:TEAL,
    seamoss:"The 92-mineral ionic matrix — the baseline broadband carrier that never depletes below ocean equilibrium" },
  { layer:"L7", name:"Termination / Dispersal", color:ROSE,
    seamoss:"λ-carrageenan mode: complete dispersal of signal into environment — broadcast termination" },
];

/* ── Transceiver canvas ── */
interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  ion: MineralIon;
  phase: number; // 0=incoming, 1=in-matrix, 2=outgoing
  life: number;
  alpha: number;
  size: number;
}

function TransceiverCanvas({ mode }: { mode: TxMode }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const tRef  = useRef(0);
  const raf   = useRef(0);
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width  = r.width  * dpr;
      cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function spawnParticle(W: number, H: number, m: TxMode): Particle {
      const ion = IONS[Math.floor(Math.random() * IONS.length)];
      const cy = H / 2;
      if (m === "rx") {
        return { x: W * 0.04, y: cy + (Math.random()-0.5)*H*0.5,
          vx: 1.2+Math.random()*0.8, vy: (Math.random()-0.5)*0.4,
          ion, phase:0, life:1, alpha:0, size:2.5+Math.random()*2 };
      } else if (m === "tx") {
        return { x: W * 0.62, y: cy + (Math.random()-0.5)*H*0.35,
          vx: 1.4+Math.random()*1.0, vy: (Math.random()-0.5)*0.6,
          ion, phase:2, life:1, alpha:0, size:2+Math.random()*1.5 };
      } else {
        return { x: W*0.25 + Math.random()*W*0.3, y: cy+(Math.random()-0.5)*H*0.4,
          vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
          ion, phase:1, life:1, alpha:0, size:3+Math.random()*2 };
      }
    }

    function loop() {
      raf.current = requestAnimationFrame(loop);
      tRef.current += 0.012;
      const t = tRef.current;
      const m = modeRef.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG; ctx!.fillRect(0, 0, W, H);

      // ── Background: carrageenan polymer network ──
      ctx!.save(); ctx!.globalAlpha = 0.12;
      const netCount = 18;
      for (let i = 0; i < netCount; i++) {
        const ax = W*0.22 + (i/netCount) * W*0.56;
        const wave = Math.sin(t*0.4 + i*0.7) * H*0.08;
        ctx!.beginPath();
        ctx!.moveTo(ax, H*0.1 + wave);
        ctx!.bezierCurveTo(
          ax + Math.sin(t+i)*20, H*0.35,
          ax - Math.cos(t*0.7+i)*20, H*0.65,
          ax, H*0.9 - wave
        );
        ctx!.strokeStyle = TEAL; ctx!.lineWidth = 1; ctx!.stroke();
      }
      ctx!.restore();

      // ── Gel matrix oval ──
      const gx = W * 0.5, gy = H * 0.5;
      const grX = W * 0.18, grY = H * 0.38;
      // Outer glow
      const glow = ctx!.createRadialGradient(gx, gy, 0, gx, gy, grX);
      const glowColor = m==="rx" ? CYAN : m==="tx" ? GREEN : TEAL;
      glow.addColorStop(0, glowColor + "18");
      glow.addColorStop(0.6, glowColor + "08");
      glow.addColorStop(1, "transparent");
      ctx!.beginPath(); ctx!.ellipse(gx, gy, grX*1.4, grY*1.3, 0, 0, Math.PI*2);
      ctx!.fillStyle = glow; ctx!.fill();
      // Gel body
      const gelGrad = ctx!.createRadialGradient(gx, gy, 0, gx, gy, grX);
      gelGrad.addColorStop(0, "rgba(31,212,168,0.12)");
      gelGrad.addColorStop(0.7, "rgba(20,160,120,0.06)");
      gelGrad.addColorStop(1, "transparent");
      ctx!.beginPath(); ctx!.ellipse(gx, gy, grX, grY, 0, 0, Math.PI*2);
      ctx!.fillStyle = gelGrad; ctx!.fill();
      // Gel border
      ctx!.beginPath(); ctx!.ellipse(gx, gy, grX, grY, 0, 0, Math.PI*2);
      ctx!.strokeStyle = glowColor + "50"; ctx!.lineWidth = 1.5; ctx!.stroke();

      // ── SEAMOSS label ──
      ctx!.font = `bold 11px ${serif}`; ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
      ctx!.fillStyle = glowColor + "cc";
      ctx!.fillText("SEA MOSS", gx, gy - 6);
      ctx!.font = `7px ${mono}`; ctx!.fillStyle = MUTED;
      ctx!.fillText("Chondrus crispus", gx, gy + 8);

      // ── Mode labels ──
      ctx!.font = `7px ${mono}`; ctx!.textBaseline = "middle";
      if (m === "rx" || m === "process") {
        ctx!.fillStyle = CYAN + "99"; ctx!.textAlign = "right";
        ctx!.fillText("← OCEAN / ENV", W*0.2, H*0.18);
        ctx!.fillText("EM · IONS · PHOTONS", W*0.2, H*0.28);
      }
      if (m === "tx" || m === "process") {
        ctx!.fillStyle = GREEN + "99"; ctx!.textAlign = "left";
        ctx!.fillText("BODY / ENV →", W*0.8, H*0.18);
        ctx!.fillText("I⁻ · K⁺ · CARRAGEENAN", W*0.8, H*0.28);
      }

      // ── RX signal waves (incoming) ──
      if (m === "rx") {
        for (let w = 0; w < 4; w++) {
          const wt = (t * 0.6 + w * 0.5) % 1;
          const wx = W * 0.02 + wt * (W * 0.28);
          const alpha = (1 - wt) * 0.35;
          ctx!.beginPath();
          for (let y = H*0.05; y < H*0.95; y += 3) {
            const xOff = Math.sin(y * 0.08 + t * 2 + w) * 6;
            if (y === H*0.05) ctx!.moveTo(wx + xOff, y);
            else ctx!.lineTo(wx + xOff, y);
          }
          ctx!.strokeStyle = `rgba(46,240,216,${alpha})`;
          ctx!.lineWidth = 1.5; ctx!.stroke();
        }
      }

      // ── TX signal waves (outgoing) ──
      if (m === "tx") {
        for (let w = 0; w < 5; w++) {
          const wt = (t * 0.5 + w * 0.4) % 1;
          const wx = W * 0.68 + wt * (W * 0.28);
          const alpha = (1 - wt) * 0.3;
          ctx!.beginPath();
          ctx!.arc(W * 0.63, H/2, wt * W * 0.32, -Math.PI*0.5, Math.PI*0.5);
          ctx!.strokeStyle = `rgba(68,238,136,${alpha})`;
          ctx!.lineWidth = 1.5; ctx!.stroke();
        }
      }

      // ── Spawn particles ──
      const rate = m === "process" ? 0.18 : 0.25;
      if (Math.random() < rate && particles.current.length < 55) {
        particles.current.push(spawnParticle(W, H, m));
      }

      // ── Update & draw particles ──
      particles.current = particles.current.filter(p => p.alpha > 0.01 || p.life > 0.5);
      particles.current.forEach(p => {
        // Fade in
        if (p.life > 0.85) p.alpha = Math.min(1, p.alpha + 0.06);
        else p.alpha = Math.max(0, p.alpha - 0.02);
        p.life -= 0.004;
        p.x += p.vx; p.y += p.vy;
        // In-matrix particles orbit the gel center
        if (p.phase === 1) {
          const dx = gx - p.x, dy = gy - p.y;
          p.vx += dx * 0.002; p.vy += dy * 0.002;
          p.vx *= 0.98; p.vy *= 0.98;
        }
        // Clamp outgoing
        if (p.phase === 2 && p.x > W) p.life = 0;
        if (p.phase === 0 && p.x > W * 0.7) p.life = 0;

        const a = p.alpha * p.life;
        // Glow
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size * 2.5, 0, Math.PI*2);
        ctx!.fillStyle = p.ion.color + Math.round(a * 30).toString(16).padStart(2,"0");
        ctx!.fill();
        // Core dot
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.size, 0, Math.PI*2);
        ctx!.fillStyle = p.ion.color + Math.round(a * 255).toString(16).padStart(2,"0");
        ctx!.fill();
        // Label (only for larger particles)
        if (p.size > 3 && a > 0.4) {
          ctx!.font = `6px ${mono}`; ctx!.textAlign = "center"; ctx!.textBaseline = "middle";
          ctx!.fillStyle = p.ion.color + Math.round(a * 220).toString(16).padStart(2,"0");
          ctx!.fillText(p.ion.symbol, p.x, p.y);
        }
      });
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:220, cursor:"default" }} />;
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
function SeamossTransceiverHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let ring=1;ring<=4;ring++){
        const r=ring*18+6*Math.sin(t*0.03+ring);
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=`rgba(68,204,119,${0.05+ring*0.04})`;ctx.lineWidth=0.6;ctx.stroke();
      }
      for(let i=0;i<8;i++){
        const angle=i/8*Math.PI*2+t*0.015;
        const x=cx+Math.cos(angle)*65,y=cy+Math.sin(angle)*40;
        ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fillStyle="rgba(68,204,119,0.4)";ctx.fill();
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle="rgba(68,204,119,0.06)";ctx.lineWidth=0.4;ctx.stroke();
      }
      ctx.fillStyle="rgba(68,204,119,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SEAMOSS TRANSCEIVER · BIO-SIGNAL · ALGAE ANTENNA · TRANSMISSION · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SeamossTransceiverPage() {
  const [mode, setMode] = useState<TxMode>("rx");
  const [activeIon, setActiveIon] = useState(0);
  const activeMode = MODES.find(m => m.id === mode)!;

  const panelBox: React.CSSProperties = {
    background:PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px", marginBottom:10, position:"relative",
  };
  const topLine = (c = GOLD) => (
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
      background:`linear-gradient(90deg,${c},transparent)`,opacity:0.35 }} />
  );
  const SH = ({ label, color=GOLD }:{label:string;color?:string}) => (
    <div style={{ fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",
      color,marginBottom:6,borderBottom:`1px solid ${BORDER}`,paddingBottom:3 }}>
      {label}
    </div>
  );

  const modeColor = activeMode.color;

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>
      {/* ── HEADER ── */}
      <div style={{ padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(2,8,6,0.98)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${TEAL},${GREEN},${CYAN},transparent)`,
          opacity:0.4 }} />
        <div style={{ maxWidth:1400, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
          <div>
            <div style={{ fontSize:7, letterSpacing:"0.2em", color:TEAL, marginBottom:3 }}>
              AETHER · BIO-EM SYNTHESIS · CHONDRUS CRISPUS · SIGNAL ARCHITECTURE
            </div>
            <div style={{ fontFamily:serif, fontSize:20, letterSpacing:2, color:"#fff" }}>
              SEAMOSS TRANSCEIVER
            </div>
            <div style={{ fontFamily:body, fontStyle:"italic", fontSize:11, color:DIM, marginTop:2 }}>
              92-mineral ion matrix  ·  carrageenan helix encoding  ·  RX / PROCESS / TX signal architecture
            </div>
          </div>
          {/* Mode selector */}
          <div style={{ display:"flex", gap:4 }}>
            {MODES.map(m => (
              <button key={m.id} onClick={() => setMode(m.id)} style={{
                padding:"6px 14px", fontFamily:mono, fontSize:8, letterSpacing:"0.12em",
                cursor:"pointer", borderRadius:2, transition:"all 0.18s",
                border:`1px solid ${mode===m.id ? m.color : BORDER}`,
                background: mode===m.id ? `${m.color}18` : "transparent",
                color: mode===m.id ? m.color : MUTED,
              }}>
                {m.label}
              </button>
            ))}
          </div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:DIM, maxWidth:200, lineHeight:1.6 }}>
            The seamoss is not a passive food. It is a biological transceiver that received the ocean's signals for millennia.
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"14px 20px 32px",
        display:"grid", gridTemplateColumns:"230px 1fr 270px", gap:12 }}>

        {/* ══ LEFT ══ */}
        <div>
          {/* Mineral ion carriers */}
          <div style={panelBox}>
            {topLine(TEAL)}
            <SH label="Mineral Ion Carriers · 92 Elements" color={TEAL} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.6 }}>
              Each mineral is a distinct signal carrier — a different frequency, charge, and biochemical language. Click to inspect.
            </div>
            {IONS.map((ion, i) => (
              <div key={ion.symbol}
                onClick={() => setActiveIon(i)}
                style={{ marginBottom:4, padding:"5px 8px", cursor:"pointer",
                  background: activeIon===i ? `${ion.color}10` : "transparent",
                  border:`1px solid ${activeIon===i ? ion.color : BORDER}`,
                  borderRadius:2, transition:"all 0.15s" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:22, height:22, borderRadius:"50%",
                      background:`${ion.color}20`, border:`1px solid ${ion.color}50`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:7, color:ion.color, fontWeight:"bold" }}>
                      {ion.symbol.replace(/[⁺⁻²]/g,"")}
                    </div>
                    <div>
                      <div style={{ fontSize:8, color:activeIon===i ? ion.color : TEXT, fontWeight:"bold" }}>
                        {ion.symbol} · {ion.name}
                      </div>
                      <div style={{ fontSize:7, color:MUTED, fontFamily:body }}>{ion.charge} charge</div>
                    </div>
                  </div>
                  {/* Abundance bar */}
                  <div style={{ width:32, height:3, background:BORDER, borderRadius:2, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${ion.freq*100}%`, background:ion.color, borderRadius:2 }} />
                  </div>
                </div>
              </div>
            ))}
            {/* Active ion detail */}
            <div style={{ marginTop:8, padding:"7px 9px",
              background:`${IONS[activeIon].color}08`,
              border:`1px solid ${IONS[activeIon].color}30`, borderRadius:2 }}>
              <div style={{ fontSize:8, fontWeight:"bold", color:IONS[activeIon].color, marginBottom:3 }}>
                {IONS[activeIon].symbol} · Signal Role
              </div>
              <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.6 }}>
                {IONS[activeIon].role}
              </div>
            </div>
          </div>

          {/* Carrageenan types */}
          <div style={panelBox}>
            {topLine(GREEN)}
            <SH label="Carrageenan Signal Polymer · 3 Types" color={GREEN} />
            {CARRA.map(c => (
              <div key={c.greek} style={{ marginBottom:8, padding:"7px 9px",
                background:`${c.color}07`, border:`1px solid ${c.color}25`, borderRadius:2 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <div style={{ fontFamily:serif, fontSize:15, color:c.color }}>{c.greek}</div>
                  <div style={{ fontSize:8, color:c.color, fontWeight:"bold", letterSpacing:0.5 }}>{c.name}</div>
                </div>
                <div style={{ display:"flex", gap:8, marginBottom:4 }}>
                  <div style={{ fontSize:7, padding:"2px 5px", border:`1px solid ${c.color}30`,
                    borderRadius:1, color:c.color }}>trigger: {c.trigger}</div>
                  <div style={{ fontSize:7, padding:"2px 5px", border:`1px solid ${BORDER}`,
                    borderRadius:1, color:MUTED }}>{c.gels}</div>
                </div>
                <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.5 }}>{c.mode}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Transceiver canvas */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"7px 12px 5px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:7, color:MUTED, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                Live Signal · Chondrus crispus Transceiver
              </div>
              <div style={{ fontSize:8, color:modeColor, fontFamily:body, fontStyle:"italic" }}>
                {activeMode.label}
              </div>
            </div>
            <TransceiverCanvas mode={mode} />
          </div>

          {/* Active mode detail */}
          <div style={{ ...panelBox, border:`1px solid ${modeColor}50` }}>
            {topLine(modeColor)}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:serif, fontSize:16, color:modeColor, letterSpacing:1 }}>
                  {activeMode.label}
                </div>
                <div style={{ fontSize:9, color:MUTED }}>{activeMode.sub}</div>
              </div>
            </div>
            <div style={{ fontFamily:body, fontSize:12, color:TEXT, lineHeight:1.8, marginBottom:10 }}>
              {activeMode.detail}
            </div>
            {/* Signal list */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
              {activeMode.signals.map(s => (
                <div key={s} style={{ display:"flex", gap:6, alignItems:"flex-start", padding:"3px 0" }}>
                  <span style={{ color:modeColor, fontSize:9, marginTop:1 }}>◆</span>
                  <span style={{ fontSize:8, color:TEXT, lineHeight:1.5 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Signal pathway diagram */}
          <div style={panelBox}>
            {topLine(TEAL)}
            <SH label="Full Transceiver Signal Pathway" color={TEAL} />
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:4, padding:"8px 4px" }}>
              {[
                ["OCEAN ENV","EM · ionic\nradiation",CYAN],
                ["→",null,DIM],
                ["CARRAGEENAN\nMATRIX","Helix encoding\nκ / ι / λ",TEAL],
                ["→",null,DIM],
                ["MINERAL IONS","K⁺ Ca²⁺ I⁻\nMg²⁺ Fe²⁺",GOLD],
                ["→",null,DIM],
                ["BODY\nSYSTEM","Thyroid · immune\nneural · endocrine",GREEN],
              ].map(([label, sub, c], i) => (
                <div key={i} style={{ textAlign:"center", flex: label==="→"?"0 0 16px":1 }}>
                  {label === "→" ? (
                    <div style={{ fontSize:14, color:c as string }}>→</div>
                  ) : (
                    <div style={{ padding:"6px 4px",
                      border:`1px solid ${(c as string)}30`,
                      background:`${(c as string)}08`, borderRadius:2 }}>
                      <div style={{ fontSize:8, fontWeight:"bold", color:c as string, lineHeight:1.3 }}>{label}</div>
                      {sub && <div style={{ fontSize:7, color:MUTED, lineHeight:1.4, marginTop:2, fontFamily:body }}>{sub}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Iodine / thyroid synthesis */}
          <div style={{ ...panelBox, border:`1px solid ${VIOLET}40` }}>
            {topLine(VIOLET)}
            <SH label="Primary Transmission Channel · Iodine → Thyroid" color={VIOLET} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              <div>
                <div style={{ fontFamily:serif, fontSize:13, color:VIOLET, marginBottom:6 }}>The Iodine Broadcast</div>
                <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.75 }}>
                  Seamoss concentrates iodine from seawater at up to 1,000× ambient concentration — the biological equivalent of a signal amplifier. Released I⁻ is the primary precursor for thyroid hormones T3 (triiodothyronine) and T4 (thyroxine). Every cell in the human body has thyroid receptors. The seamoss is broadcasting to every cell simultaneously.
                </div>
              </div>
              <div>
                <div style={{ fontFamily:serif, fontSize:13, color:GREEN, marginBottom:6 }}>The Selenium Gate</div>
                <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.75 }}>
                  Selenium (also in seamoss) activates the enzyme deiodinase — which converts T4 (inactive) → T3 (active). The seamoss provides both the signal (I⁻) and the activation key (Se) in a single delivery. It is a complete endocrine transmission package.
                </div>
              </div>
            </div>
            {/* T4 → T3 chain */}
            <div style={{ marginTop:8, padding:"7px 12px",
              background:"rgba(153,102,255,0.05)", border:`1px solid ${VIOLET}25`, borderRadius:2,
              display:"flex", alignItems:"center", justifyContent:"center", gap:12, flexWrap:"wrap" }}>
              {[["I⁻",VIOLET,"Iodine precursor"],["→",DIM,""],["T4",GOLD,"Thyroxine (inactive)"],["+ Se →",TEAL,"Deiodinase enzyme"],["T3",GREEN,"Triiodothyronine (active)"],["→",DIM,""],["ALL CELLS",LIME,"Metabolic broadcast"]].map(([sym,c,note],i)=>(
                <div key={i} style={{ textAlign:"center" }}>
                  <div style={{ fontFamily:serif, fontSize:14, color:c as string }}>{sym}</div>
                  {note && <div style={{ fontSize:7, color:MUTED, marginTop:1, fontFamily:body }}>{note as string}</div>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div>
          {/* Species card */}
          <div style={{ ...panelBox, border:`1px solid ${TEAL}40` }}>
            {topLine(TEAL)}
            <SH label="Species Profile" color={TEAL} />
            <div style={{ fontFamily:serif, fontSize:14, color:TEAL, marginBottom:2 }}>Chondrus crispus</div>
            <div style={{ fontSize:8, color:MUTED, marginBottom:8 }}>Irish Moss · Red Algae · Rhodophyta</div>
            {[
              ["Habitat","North Atlantic · 0–30m depth · tidal zone"],
              ["Mineral count","~92 of 102 essential trace minerals"],
              ["Primary polymer","Carrageenan (κ, ι, λ types)"],
              ["Key signal output","Iodine · carrageenan · fucoidan"],
              ["Colour range","Greenish-yellow → dark purple"],
              ["Growth rate","2–4 cm/month · perennial"],
              ["Gel temp","κ-carrageenan gels at 40–50°C"],
              ["EM environment","Ocean EM field + tidal induction"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:8,
                padding:"3px 0", borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ fontSize:8, color:MUTED, flexShrink:0 }}>{k}</span>
                <span style={{ fontSize:8, color:TEXT, textAlign:"right" }}>{v}</span>
              </div>
            ))}
          </div>

          {/* AETHER layer mapping */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}35` }}>
            {topLine()}
            <SH label="AETHER Layer Mapping" color={GOLD} />
            {AETHER_LAYERS.map(al => (
              <div key={al.layer} style={{ marginBottom:7, padding:"6px 8px",
                background:`${al.color}07`, border:`1px solid ${al.color}20`, borderRadius:2 }}>
                <div style={{ display:"flex", gap:6, alignItems:"center", marginBottom:3 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:al.color, fontFamily:serif }}>{al.layer}</div>
                  <div style={{ fontSize:8, color:al.color }}>{al.name}</div>
                </div>
                <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.5 }}>{al.seamoss}</div>
              </div>
            ))}
          </div>

          {/* Applications */}
          <div style={panelBox}>
            {topLine(GREEN)}
            <SH label="Transceiver Applications" color={GREEN} />
            {[
              [TEAL,  "Bio-antenna substrate","Mineral-rich gel matrix as passive EM sensor in field measurement arrays"],
              [GOLD,  "Endocrine signal booster","I⁻ + Se delivery package — thyroid broadcast amplification"],
              [VIOLET,"Carrageenan signal medium","Gel-state memory for chemical signal encoding (κ/ι mode)"],
              [GREEN, "Bio-electrolyte","Ion matrix as liquid electrode in bio-battery / fuel cell contexts"],
              [CYAN,  "Mycelial interface","Seamoss + mycelium network — dual-substrate signal mesh"],
              [ROSE,  "Wound signal mediator","Carrageenan gel applied topically — immune/anti-inflammatory TX to tissue"],
            ].map(([c,title,desc])=>(
              <div key={title as string} style={{ marginBottom:6, padding:"6px 8px",
                borderLeft:`2px solid ${(c as string)}50` }}>
                <div style={{ fontSize:8, fontWeight:"bold", color:c as string, marginBottom:2 }}>{title}</div>
                <div style={{ fontFamily:body, fontSize:9, color:MUTED, lineHeight:1.5 }}>{desc}</div>
              </div>
            ))}
          </div>

          {/* AETHER synthesis */}
          <div style={{ ...panelBox, border:`1px solid ${CYAN}30` }}>
            {topLine(CYAN)}
            <SH label="AETHER Synthesis" color={CYAN} />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.8 }}>
              The seamoss spent millions of years in one of the most electromagnetically rich environments on Earth — the tidal zone, where ocean current induction, solar radiation, and mineral flux converge. What it built is not a food. It is a <span style={{ color:TEAL }}>tuned signal collector</span> — 92 minerals as broadband receivers, carrageenan helices as the encoding matrix, iodine as the primary broadcast channel to the endocrine system. <span style={{ color:GOLD }}>To eat seamoss is to consume a transceiver.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

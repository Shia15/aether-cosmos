import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG     = "#02030a";
const PANEL  = "rgba(3,5,16,0.97)";
const BORDER = "#0c1030";
const GOLD   = "#c9a84c";
const GOLD2  = "#f2d46a";
const CYAN   = "#2ef0d8";
const VIOLET = "#aa66ff";
const ROSE   = "#ff5599";
const TEAL   = "#1fd4c8";
const GREEN  = "#44ee88";
const EMBER  = "#ff6633";
const BLUE   = "#4488ff";
const DIM    = "#2a3858";
const TEXT   = "#a8bcd0";
const MUTED  = "#445566";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── 7-Layer perception stack ── */
interface PLayer {
  id: number; label: string; sub: string; color: string;
  greek: string;
  detail: string;
  fact: string;
  spectrumNote: string;
}

const LAYERS: PLayer[] = [
  {
    id:0, label:"Physical Spectrum", sub:"The electromagnetic substrate",
    greek:"Λ", color: EMBER,
    spectrumNote:"Full EM band: 1nm (X-ray) → 1m (radio). Visible: 380–730nm.",
    detail:"The physical universe makes no distinction between 'visible' and 'invisible.' The 380–730nm window is a biological accident — the solar output peak filtered through atmospheric absorption. UV and infrared carry as much information. This is Layer 0: reality before any biological interface.",
    fact:"380–730 nm visible  ·  UV < 380 nm  ·  IR > 730 nm  ·  Solar peak ≈ 500 nm",
  },
  {
    id:1, label:"Biology · Cone Trichromacy", sub:"S / M / L opponent channels",
    greek:"β", color: GREEN,
    spectrumNote:"S cone ~420nm, M ~530nm, L ~560nm. Opponent: R–G, B–Y, Lum.",
    detail:"Human retina reduces the continuous spectrum to three numbers per point — the excitation ratios of Short, Medium, and Long wavelength cones. Then three opponent channels (R–G, B–Y, luminance) encode differences. This is the first compression layer: ∞ spectral dimensions → 3 cone values → 3 opponent signals.",
    fact:"~6M cone photoreceptors  ·  ~120M rods  ·  3 opponent channels  ·  ~10M discriminable colors",
  },
  {
    id:2, label:"Device Space · sRGB", sub:"A tiny subset of biology",
    greek:"γ", color: BLUE,
    spectrumNote:"sRGB gamut covers ~35% of human-visible colors. Rec.2020 covers ~75%.",
    detail:"The sRGB color space — the default display standard — is a tiny triangular slice of human perception. It cannot represent the colors a bee sees, the colors at the edge of your peripheral vision, or colors that exist biologically but not physically. The device cube is a bottleneck, not a representation. Constraints apply pressure at the bottleneck.",
    fact:"sRGB: 35% of perceptual gamut  ·  Display-P3: 50%  ·  Rec.2020: 75%  ·  Theoretical max: 100%",
  },
  {
    id:3, label:"LAB / OKLab Manifold", sub:"Perceptual uniformity geometry",
    greek:"δ", color: TEAL,
    spectrumNote:"CIELAB L*a*b* maps equal perceptual steps to equal coordinate steps.",
    detail:"The LAB color space is the first attempt to make the geometry of color match the geometry of human perception — equal distances in LAB space correspond to equal perceived color differences. OKLab (2020) improved this further with better hue linearity. The manifold is not flat: perception is a curved space, and any flat RGB system introduces perceptual distortions.",
    fact:"ΔE = perceptual distance  ·  ΔE < 1 = imperceptible  ·  ΔE 1–2 = just noticeable  ·  OKLab: improved hue linearity",
  },
  {
    id:4, label:"Animal Vision", sub:"Bee UV · Bird tetrachromacy · Mantis 16-cone",
    greek:"ε", color: VIOLET,
    spectrumNote:"Mantis shrimp: 16 spectral channels from UV to near-IR.",
    detail:"The 3-cone human system is neither universal nor optimal. Bees have 3 cones shifted into UV. Most birds have 4 cones (tetrachromacy), seeing UV+visible. Mantis shrimp have 16 spectral channels — not for richer color space (their discrimination is surprisingly poor) but for ultra-fast parallel channel detection. Each species is a different compression algorithm for the same physical reality.",
    fact:"Bee: UV + blue + green  ·  Bird: UV + S + M + L  ·  Mantis: 16 channels  ·  Some humans: tetrachromat (rare)",
  },
  {
    id:5, label:"Impossible Colors", sub:"Stygian blue · Reddish green · Hyperbolic orange",
    greek:"ζ", color: ROSE,
    spectrumNote:"Colors that exist in perceptual space but cannot be produced by any wavelength.",
    detail:"Impossible colors are perceptual states that arise when the opponent channel system is pushed beyond its normal operating range. Stygian blue appears darker than black — it requires the blue-yellow opponent channel to fire at maximum while luminance is suppressed. Reddish green requires simultaneous maximal R–G opponent excitation in both directions — impossible from a single wavelength, possible via adaptation. These are coordinates in perception space that have no physical referent.",
    fact:"Stygian blue: darker than black  ·  Self-luminous red: brighter than white  ·  Reddish green: opponent-channel overflow  ·  Hyperbolic orange: hyper-saturated",
  },
  {
    id:6, label:"Japanese Perception", sub:"Cultural space — time · season · material",
    greek:"η", color: GOLD,
    spectrumNote:"Japanese color vocabulary encodes time of day, season, aging material, and emotional state.",
    detail:"The final layer is not physics or biology — it is culture as a compression algorithm. Classical Japanese color vocabulary (wabi-sabi colors, seasonal palettes, material-time colors like the patina of old copper or the exact grey of morning fog in Kyoto) encodes temporal, environmental, and emotional dimensions orthogonal to any purely spectral description. Color as experienced is never just wavelength — it is context, memory, material, time.",
    fact:"Wabi-sabi palette: imperfect · impermanent · incomplete  ·  Kireji: seasonal cut-word color  ·  Material time: the patina dimension",
  },
];

/* ── Impossible color definitions ── */
const IMPOSSIBLE = [
  {
    name:"Stygian Blue",
    hex:"#0011ff",
    glow: "#001aff80",
    description:"Appears darker than black. Requires blue-yellow opponent channel maximum with luminance suppressed. Cannot be produced on any standard display — this is the closest physical approximation.",
    mechanism:"Blue-yellow opponent channel fires at maximum negative. Luminance channel simultaneously near-zero. The brain produces a color it cannot receive from any wavelength.",
  },
  {
    name:"Reddish Green",
    hex:"#884422",
    glow:"#ff440044",
    description:"Simultaneous red AND green. The R–G opponent channel cannot fire both directions at once from physical stimulus. Achievable via prolonged adaptation.",
    mechanism:"Stare at a saturated red field until opponent channel adapts, then shift to green — the channel overshoots and momentarily produces both excitations.",
  },
  {
    name:"Hyperbolic Orange",
    hex:"#ff8800",
    glow:"#ff880055",
    description:"More saturated than any orange that can exist in physical light. Exists beyond the spectral locus — outside the horseshoe of real colors.",
    mechanism:"Occurs at boundary of the MacAdam limit. Physical light cannot reach this saturation level for this hue. Only achievable via opponent-channel manipulation.",
  },
];

/* ── OI architecture steps ── */
const OI_STEPS = [
  { label:"INPUTS", sub:"Electrical · Chemical · Planetary fields", color:CYAN, icon:"⚡",
    note:"MEAs deliver electrical pulses and chemical gradients. AETHER extension: planetary EM fields as complex environmental inputs." },
  { label:"MEA ARRAY", sub:"Microelectrode Array interface", color:TEAL, icon:"⊞",
    note:"High-density electrode grid reads and writes to 100,000+ neurons simultaneously. Bidirectional: record and stimulate." },
  { label:"BRAIN ORGANOID", sub:"~2mm · 100M+ neurons", color:VIOLET, icon:"◉",
    note:"Human neural tissue grown from iPSCs. Self-organizes into cortical-like layers. Adapts via Hebbian plasticity — learns." },
  { label:"BIOFEEDBACK", sub:"Adaptation loop · Closed-circuit", color:GREEN, icon:"↺",
    note:"Organoid output feeds back to modify input — continuous adaptation. Microfluidics manage nutrients, prevent necrosis." },
  { label:"FERROFLUID OUT", sub:"Neural pattern → fluid field", color:GOLD, icon:"◈",
    note:"Magnetic linear actuator translates neural firing patterns to ferrofluid displacement. Silent propulsion. Time display via fluid position." },
  { label:"MYCELIAL LAYER", sub:"Fungal network · Distributed compute", color:ROSE, icon:"⋈",
    note:"Mycelial add-on: fungal network acts as distributed low-frequency signal integrator, coupling multiple organoids into mesh." },
];

/* ── Physics connections ── */
const PHYSICS = [
  { name:"Higgs Boson", color:GOLD,
    detail:"Mass origin field. The Higgs mechanism gives particles their mass via interaction with the Higgs field permeating all space. Peter Higgs predicted it in 1964; confirmed at CERN in 2012." },
  { name:"Grand Unified Theory (GUT)", color:CYAN,
    detail:"Unifies electromagnetic + strong + weak nuclear forces into a single force above ~10¹⁵ GeV. Electroweak unification demonstrated. Full GUT unproven — proton decay would confirm it." },
  { name:"Theory of Everything (TOE)", color:VIOLET,
    detail:"GUT + gravity. The open problem: quantum field theory and general relativity are incompatible at Planck scale (10⁻³⁵ m, 10¹⁹ GeV)." },
  { name:"Superstring Theory", color:ROSE,
    detail:"Replaces point particles with 1D strings vibrating in 10–11 dimensions. Predicts mass of electron at Planck energies — in principle. Currently unfalsifiable at accessible energy scales. Down to a measurable scale today: string theory predicts specific decay patterns distinguishable at LHC energies." },
];

/* ── Spectrum canvas ── */
function SpectrumCanvas({ layerIdx }: { layerIdx: number }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const raf = useRef(0);
  const layerRef = useRef(layerIdx);
  layerRef.current = layerIdx;

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr;
      cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener("resize", resize);

    function nmToRGB(nm: number): [number,number,number] {
      let r = 0, g = 0, b = 0;
      if (nm >= 380 && nm < 440) { r = -(nm - 440) / 60; b = 1; }
      else if (nm < 490) { g = (nm - 440) / 50; b = 1; }
      else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
      else if (nm < 580) { r = (nm - 510) / 70; g = 1; }
      else if (nm < 645) { r = 1; g = -(nm - 645) / 65; }
      else if (nm <= 780) { r = 1; }
      const factor = nm < 420 ? 0.3 + 0.7*(nm-380)/40 : nm > 700 ? 0.3 + 0.7*(780-nm)/80 : 1;
      return [r*factor, g*factor, b*factor];
    }

    function loop() {
      raf.current = requestAnimationFrame(loop);
      tRef.current += 0.008;
      const t = tRef.current;
      const li = layerRef.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0, 0, W, H);
      ctx!.fillStyle = BG;
      ctx!.fillRect(0, 0, W, H);

      const specW = W * 0.85, specX = W * 0.075;
      const barH = H * 0.35, barY = H * 0.22;

      // ── Layer-specific background effects ──
      if (li === 5) {
        // Impossible colors — dark iridescent glow
        ctx!.globalAlpha = 0.15 + 0.05 * Math.sin(t);
        const ig = ctx!.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.5);
        ig.addColorStop(0, VIOLET);
        ig.addColorStop(0.4, ROSE);
        ig.addColorStop(1, "transparent");
        ctx!.fillStyle = ig; ctx!.fillRect(0, 0, W, H);
        ctx!.globalAlpha = 1;
      }

      // ── Full spectrum bar ──
      for (let x = 0; x < specW; x++) {
        // UV extension (left of visible)
        if (li === 4 || li === 5 || li === 6) {
          const uvFrac = x / specW;
          if (uvFrac < 0.08) {
            const uvAlpha = li === 4 ? 0.7 : 0.3;
            ctx!.fillStyle = `rgba(180,0,255,${uvAlpha * (0.08 - uvFrac) / 0.08 * (0.5 + 0.5 * Math.sin(t * 2))})`;
            ctx!.fillRect(specX + x - 30, barY, 1, barH);
          }
        }
        const nmMin = li === 4 ? 300 : 380;
        const nmMax = li === 4 ? 780 : 730;
        const nm = nmMin + (x / specW) * (nmMax - nmMin);
        const [rv, gv, bv] = nmToRGB(Math.max(380, Math.min(730, nm)));

        // Layer-specific alpha modulation
        let alpha = 1;
        if (li === 2) {
          // sRGB gamut: only show a triangle (mute outside)
          const frac = x / specW;
          alpha = frac < 0.1 || frac > 0.9 ? 0.2 : frac < 0.2 ? 0.5 : 1;
        } else if (li === 3) {
          // Lab manifold: gentle perceptual ripple
          alpha = 0.7 + 0.3 * Math.sin(x * 0.04 + t);
        } else if (li === 5) {
          // Impossible colors: inverted / saturated pulse
          alpha = 0.4 + 0.6 * Math.abs(Math.sin(x * 0.02 + t * 0.5));
        } else if (li === 6) {
          // Japanese perception: fade with wave-like golden tinge
          alpha = 0.5 + 0.5 * Math.sin(x * 0.015 + t * 0.3);
        }
        ctx!.fillStyle = `rgba(${Math.round(rv*255)},${Math.round(gv*255)},${Math.round(bv*255)},${alpha})`;
        ctx!.fillRect(specX + x, barY, 1, barH);
      }

      // ── Layer I markers ──
      if (li === 0) {
        [380,450,495,570,620,750].forEach((nm, i) => {
          const x = specX + ((nm - 380) / 350) * specW;
          const labels = ["380","450","495","570","620","750"];
          ctx!.beginPath(); ctx!.moveTo(x, barY + barH); ctx!.lineTo(x, barY + barH + 8);
          ctx!.strokeStyle = "rgba(255,255,255,0.4)"; ctx!.lineWidth = 1; ctx!.stroke();
          ctx!.font = `7px ${mono}`; ctx!.fillStyle = "rgba(200,200,200,0.6)";
          ctx!.textAlign = "center"; ctx!.fillText(labels[i]+"nm", x, barY + barH + 17);
        });
      }

      // ── Layer II cone responses ──
      if (li === 1) {
        const cones = [
          { peak:420, col:"rgba(180,100,255,0.7)", label:"S" },
          { peak:530, col:"rgba(100,255,120,0.7)", label:"M" },
          { peak:560, col:"rgba(255,120,80,0.7)", label:"L" },
        ];
        cones.forEach(c => {
          ctx!.beginPath();
          for (let x = 0; x < specW; x++) {
            const nm = 380 + (x / specW) * 350;
            const resp = Math.exp(-Math.pow((nm - c.peak), 2) / (2 * 1800)) * barH * 0.9;
            const y = barY + barH - resp;
            if (x === 0) ctx!.moveTo(specX + x, y); else ctx!.lineTo(specX + x, y);
          }
          ctx!.strokeStyle = c.col; ctx!.lineWidth = 2; ctx!.stroke();
          const px = specX + ((c.peak - 380) / 350) * specW;
          ctx!.font = `bold 9px ${mono}`; ctx!.fillStyle = c.col;
          ctx!.textAlign = "center"; ctx!.fillText(c.label, px, barY - 6);
        });
      }

      // ── Layer II - sRGB gamut triangle outline ──
      if (li === 2) {
        const rX = specX + ((620 - 380) / 350) * specW, rY = barY;
        const gX = specX + ((520 - 380) / 350) * specW, gY = barY + barH;
        const bX = specX + ((460 - 380) / 350) * specW, bY = barY;
        ctx!.beginPath(); ctx!.moveTo(rX, rY); ctx!.lineTo(gX, gY); ctx!.lineTo(bX, bY); ctx!.closePath();
        ctx!.strokeStyle = "rgba(255,255,255,0.5)"; ctx!.lineWidth = 1.5;
        ctx!.setLineDash([4, 3]); ctx!.stroke(); ctx!.setLineDash([]);
        ctx!.font = `8px ${mono}`; ctx!.fillStyle = "rgba(255,255,255,0.5)";
        ctx!.textAlign = "center"; ctx!.fillText("sRGB gamut", (rX+gX+bX)/3, (rY+gY+bY)/3);
      }

      // ── Layer V - UV/IR extension labels ──
      if (li === 4) {
        ctx!.font = `7px ${mono}`; ctx!.fillStyle = "rgba(180,100,255,0.7)";
        ctx!.textAlign = "left"; ctx!.fillText("← BEE UV", specX, barY + barH + 17);
        ctx!.fillStyle = "rgba(255,100,80,0.7)";
        ctx!.textAlign = "right"; ctx!.fillText("BIRD NIR →", specX + specW, barY + barH + 17);
      }

      // ── Layer VI - Impossible color pulses ──
      if (li === 5) {
        const pulses = [
          { x: specX + specW * 0.15, col:"rgba(0,0,200,0.8)", label:"Stygian\nBlue" },
          { x: specX + specW * 0.5,  col:"rgba(200,80,50,0.6)", label:"Reddish\nGreen" },
          { x: specX + specW * 0.8,  col:"rgba(255,130,0,0.8)", label:"Hyper-\norange" },
        ];
        pulses.forEach(p => {
          const pulse = 0.5 + 0.5 * Math.sin(t * 2 + p.x);
          ctx!.beginPath(); ctx!.arc(p.x, barY + barH/2, 14 * pulse, 0, Math.PI * 2);
          ctx!.fillStyle = p.col.replace("0.8", `${0.3 * pulse}`); ctx!.fill();
          ctx!.font = `7px ${mono}`; ctx!.fillStyle = "rgba(255,255,255,0.7)";
          ctx!.textAlign = "center";
          const lines = p.label.split("\n");
          lines.forEach((l, li2) => ctx!.fillText(l, p.x, barY + barH + 14 + li2 * 10));
        });
      }

      // ── Layer VII - Japanese seasonal tones ──
      if (li === 6) {
        const seasonTones = [
          { nm:410, name:"朝露", col:"rgba(200,210,255,0.9)" },
          { nm:490, name:"青磁", col:"rgba(100,200,200,0.9)" },
          { nm:545, name:"若竹", col:"rgba(100,220,140,0.9)" },
          { nm:590, name:"琥珀", col:"rgba(220,160,60,0.9)" },
          { nm:650, name:"緋色", col:"rgba(220,60,60,0.9)" },
        ];
        seasonTones.forEach(s => {
          const x = specX + ((s.nm - 380) / 350) * specW;
          ctx!.beginPath(); ctx!.moveTo(x, barY); ctx!.lineTo(x, barY + barH);
          ctx!.strokeStyle = s.col; ctx!.lineWidth = 1.5; ctx!.stroke();
          ctx!.font = `9px serif`; ctx!.fillStyle = s.col;
          ctx!.textAlign = "center"; ctx!.fillText(s.name, x, barY - 10);
        });
      }

      // ── Bottom axis label ──
      ctx!.font = `7px ${mono}`; ctx!.fillStyle = MUTED;
      ctx!.textAlign = "center";
      ctx!.fillText("wavelength (nm)   →   400nm (violet)  ·  500nm (cyan)  ·  600nm (orange)  ·  700nm (red)", W/2, H - 8);
    }
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:130 }} />;
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
function FullPerceptionCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 170;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    const layers=[
      {r:20,col:"#9966ff",label:"GAMMA",speed:0.04},
      {r:40,col:"#2ef0d8",label:"UV",speed:-0.03},
      {r:60,col:"#c9a84c",label:"VISIBLE",speed:0.025},
      {r:75,col:"#ff4477",label:"IR",speed:-0.02},
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,3,10,0.25)"; ctx.fillRect(0,0,W,H);
      layers.forEach(l=>{
        ctx.beginPath(); ctx.arc(cx,cy,l.r,0,Math.PI*2);
        ctx.strokeStyle=l.col+"55"; ctx.lineWidth=1; ctx.stroke();
        const angle=t*l.speed;
        const px=cx+l.r*Math.cos(angle),py=cy+l.r*Math.sin(angle);
        ctx.beginPath(); ctx.arc(px,py,4,0,Math.PI*2); ctx.fillStyle=l.col; ctx.fill();
        ctx.fillStyle=l.col+"88"; ctx.font="7px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(l.label,px,py-8); ctx.textAlign="left";
      });
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("FULL PERCEPTION UNIVERSE · EM SPECTRUM · GAMMA · UV · VISIBLE · IR · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function FullPerceptionUniversePage() {
  const [activeLayer, setActiveLayer] = useState(0);
  const [activeOI, setActiveOI] = useState(0);
  const layer = LAYERS[activeLayer];

  const panelBox: React.CSSProperties = {
    background: PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px",
    marginBottom:10, position:"relative",
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

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,3,10,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>FULL PERCEPTION UNIVERSE · EM SPECTRUM · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>EM spectrum bands orbiting — gamma, UV, visible, IR — live AETHER perception simulation.</p></div>
          <FullPerceptionCanvas />
        </div>
      </div>

      {/* ── HEADER ── */}
      <div style={{ padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(2,3,12,0.98)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${VIOLET},${CYAN},${ROSE},${GOLD},transparent)`,
          opacity:0.4 }} />
        <div style={{ maxWidth:1400, margin:"0 auto" }}>
          <div style={{ fontSize:7, letterSpacing:"0.2em", color:VIOLET, marginBottom:3 }}>
            AETHER · PERCEPTION SYNTHESIS · FULL PERCEPTION UNIVERSE
          </div>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:20 }}>
            <div>
              <div style={{ fontFamily:serif, fontSize:20, letterSpacing:2, color:"#fff" }}>
                FULL PERCEPTION UNIVERSE
              </div>
              <div style={{ fontFamily:body, fontStyle:"italic", fontSize:12, color:DIM, marginTop:2 }}>
                Can a system approach a "full perception universe" not by storing all of reality, but by discovering the most efficient representation of it?
              </div>
            </div>
            <div style={{ display:"flex", gap:16 }}>
              {[["Layer", `${activeLayer+1} / 7`, layer.color],["Symbol",layer.greek,layer.color],["Stage",layer.label.split("·")[0].trim(),layer.color]].map(([k,v,c])=>(
                <div key={k as string} style={{ textAlign:"center" }}>
                  <div style={{ fontSize:6, color:DIM, letterSpacing:1 }}>{k as string}</div>
                  <div style={{ fontFamily:serif, fontSize:11, color:c as string, maxWidth:120, letterSpacing:1 }}>{v as string}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1400, margin:"0 auto", padding:"14px 20px 32px",
        display:"grid", gridTemplateColumns:"220px 1fr 260px", gap:12 }}>

        {/* ══ LEFT — 7-layer selector ══ */}
        <div>
          <div style={panelBox}>
            {topLine(VIOLET)}
            <SH label="Perception Stack · 7 Layers" color={VIOLET} />
            <div style={{ fontFamily:body, fontSize:10, color:DIM, marginBottom:8, lineHeight:1.6 }}>
              From electromagnetic physics to cultural color space — each layer compresses, transforms, and extends the previous.
            </div>
            {LAYERS.map(l => (
              <button key={l.id} onClick={() => setActiveLayer(l.id)} style={{
                width:"100%", textAlign:"left", padding:"6px 8px", marginBottom:3,
                background: activeLayer===l.id ? `${l.color}12` : "transparent",
                border:`1px solid ${activeLayer===l.id ? l.color : BORDER}`,
                color: activeLayer===l.id ? l.color : MUTED,
                fontFamily:mono, fontSize:8, letterSpacing:"0.08em", cursor:"pointer", borderRadius:2,
                transition:"all 0.18s",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ fontFamily:serif, fontSize:13, opacity:0.8 }}>{l.greek}</span>
                  <div>
                    <div style={{ fontWeight:"bold", fontSize:8, letterSpacing:1 }}>L{l.id+1} · {l.label.split("·")[0]}</div>
                    <div style={{ fontSize:7, color: activeLayer===l.id ? `${l.color}99` : DIM, fontFamily:body }}>{l.sub.split("·")[0]}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* AETHER synthesis question */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}40` }}>
            {topLine()}
            <SH label="The Core Question" color={GOLD} />
            <div style={{ fontFamily:serif, fontSize:12, color:GOLD2, lineHeight:1.8, marginBottom:8 }}>
              "Efficient representation, not total storage."
            </div>
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.75 }}>
              The stack shows that every biological, cultural, and perceptual system already answers this question: they compress reality into low-dimensional manifolds that maximize information usefulness for the organism's specific niche. AETHER's coherence function C(x,t) is the same operation applied to knowledge.
            </div>
          </div>

          {/* Constraints */}
          <div style={{ ...panelBox, border:`1px solid ${EMBER}30` }}>
            {topLine(EMBER)}
            <SH label="Bottleneck Principle" color={EMBER} />
            <div style={{ fontFamily:serif, fontSize:13, color:EMBER, letterSpacing:1, marginBottom:6 }}>
              Constraints apply pressure at the bottleneck.
            </div>
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.7 }}>
              The sRGB gamut is a bottleneck. The 3-cone retina is a bottleneck. Language is a bottleneck. Each one creates selection pressure toward maximum representational efficiency — the same process that produced the gyroid in Lycaenid butterfly wings and opponent channels in primate vision.
            </div>
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Spectrum canvas */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden", marginBottom:10 }}>
            <div style={{ padding:"6px 12px 4px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:7, color:DIM, letterSpacing:"0.15em", textTransform:"uppercase" }}>
                L{activeLayer+1} · {layer.label} — Spectral View
              </div>
              <div style={{ fontSize:7, fontFamily:body, fontStyle:"italic", color:layer.color }}>
                {layer.spectrumNote}
              </div>
            </div>
            <SpectrumCanvas layerIdx={activeLayer} />
          </div>

          {/* Active layer detail */}
          <div style={{ ...panelBox, border:`1px solid ${layer.color}50` }}>
            {topLine(layer.color)}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:serif, fontSize:16, color:layer.color, letterSpacing:1 }}>
                  {layer.greek}  ·  {layer.label}
                </div>
                <div style={{ fontSize:9, color:MUTED, marginTop:1 }}>{layer.sub}</div>
              </div>
              <div style={{ fontSize:9, fontFamily:mono, padding:"3px 8px",
                border:`1px solid ${layer.color}40`, color:layer.color, borderRadius:1 }}>
                Layer {activeLayer + 1} of 7
              </div>
            </div>
            <div style={{ fontFamily:body, fontSize:12, color:TEXT, lineHeight:1.8, marginBottom:8 }}>
              {layer.detail}
            </div>
            <div style={{ padding:"5px 8px", background:`${layer.color}08`,
              border:`1px solid ${layer.color}25`, borderRadius:2,
              fontFamily:mono, fontSize:8, color:`${layer.color}cc`, lineHeight:1.7 }}>
              {layer.fact}
            </div>
          </div>

          {/* Impossible colors */}
          <div style={panelBox}>
            {topLine(ROSE)}
            <SH label="Layer VI · Impossible Colors — The Perceptual Edge" color={ROSE} />
            <div style={{ fontFamily:body, fontSize:11, color:DIM, marginBottom:10, lineHeight:1.6 }}>
              Colors that exist in perceptual space but have no physical wavelength referent. Proof that the perception manifold extends beyond the spectral locus.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
              {IMPOSSIBLE.map(ic => (
                <div key={ic.name} style={{ padding:"8px 10px",
                  background:`${ic.glow}`, border:`1px solid ${ic.hex}55`, borderRadius:2 }}>
                  {/* Color swatch — approximate */}
                  <div style={{ height:28, borderRadius:1, marginBottom:6,
                    background:`linear-gradient(135deg,${ic.hex},${ic.hex}88)`,
                    boxShadow:`0 0 12px ${ic.hex}40` }} />
                  <div style={{ fontFamily:serif, fontSize:10, color:"#fff", marginBottom:4 }}>{ic.name}</div>
                  <div style={{ fontSize:8, color:TEXT, lineHeight:1.5, marginBottom:4 }}>{ic.description}</div>
                  <div style={{ fontSize:7, color:MUTED, fontFamily:body, fontStyle:"italic", lineHeight:1.4, borderTop:`1px solid ${BORDER}`, paddingTop:4 }}>
                    {ic.mechanism}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Japanese perception callout */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}35` }}>
            {topLine()}
            <SH label="Layer VII · Japanese Perception — Time as Color Dimension" color={GOLD} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:6 }}>
              {[
                ["朝露 · Asatsuyu","Morning dew — pale blue-white with transience",CYAN],
                ["侘寂 · Wabi-sabi","Imperfect · impermanent · incomplete — the grey of aged iron",MUTED],
                ["緋色 · Hiiro","Scarlet — the colour of ceremony and urgency",ROSE],
                ["青磁 · Seiji","Celadon — time-aged ceramic glaze colour",TEAL],
                ["琥珀 · Kohaku","Amber — fossilized time, warmth, memory",GOLD],
                ["切字 · Kireji","Seasonal cut-word — a colour that carries season",GREEN],
              ].map(([name,note,c])=>(
                <div key={name as string} style={{ padding:"5px 8px", border:`1px solid ${BORDER}`, borderRadius:2 }}>
                  <div style={{ fontFamily:"serif", fontSize:11, color:c as string, marginBottom:2 }}>{(name as string).split("·")[0]}</div>
                  <div style={{ fontSize:8, color:MUTED, lineHeight:1.4, fontFamily:body }}>{note as string}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily:body, fontSize:11, color:DIM, fontStyle:"italic", lineHeight:1.6 }}>
              Japanese color vocabulary encodes time, season, material age, and emotional register — dimensions orthogonal to any spectral description. The 7th layer is proof that the perception universe includes axes that have no wavelength.
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div>
          {/* OI architecture */}
          <div style={{ ...panelBox, border:`1px solid ${CYAN}30` }}>
            {topLine(CYAN)}
            <SH label="Organoid Intelligence · Computing Architecture" color={CYAN} />
            <div style={{ fontFamily:body, fontSize:10, color:DIM, marginBottom:10, lineHeight:1.6 }}>
              Brain organoid as perceptual compute substrate. Inputs drive adaptation; outputs drive physical systems (ferrofluid actuators, propulsion).
            </div>
            {OI_STEPS.map((step, i) => (
              <div key={step.label}
                onClick={() => setActiveOI(i)}
                style={{
                  marginBottom:4, padding:"6px 8px", cursor:"pointer",
                  background: activeOI===i ? `${step.color}12` : "transparent",
                  border:`1px solid ${activeOI===i ? step.color : BORDER}`,
                  borderRadius:2, transition:"all 0.15s",
                }}>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <span style={{ fontSize:12, color:step.color }}>{step.icon}</span>
                  <div>
                    <div style={{ fontSize:8, fontWeight:"bold", color:step.color, letterSpacing:0.5 }}>{step.label}</div>
                    <div style={{ fontSize:7, color:MUTED, fontFamily:body }}>{step.sub}</div>
                  </div>
                  {i < OI_STEPS.length-1 && <div style={{ marginLeft:"auto", fontSize:9, color:DIM }}>↓</div>}
                </div>
              </div>
            ))}
            {/* Active OI step detail */}
            <div style={{ marginTop:8, padding:"7px 9px",
              background:`${OI_STEPS[activeOI].color}07`,
              border:`1px solid ${OI_STEPS[activeOI].color}30`, borderRadius:2 }}>
              <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.6 }}>
                {OI_STEPS[activeOI].note}
              </div>
            </div>
          </div>

          {/* Ferrofluid note */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}30` }}>
            {topLine()}
            <SH label="Ferrofluid · Neural-to-Physical Interface" color={GOLD} />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.75 }}>
              Organoid firing patterns control a magnetic linear actuator — coil arrays move a ferrofluid piston silently with no mechanical friction. The <span style={{ color:GOLD }}>fluid position encodes time</span> (hours via displacement, minutes via droplet constellation). A clock whose hands are neural patterns made visible in ferromagnetic liquid. AETHER OS layer extension: <span style={{ color:CYAN }}>planetary EM fields as complex environmental inputs</span> to the organoid.
            </div>
          </div>

          {/* Physics connections */}
          <div style={{ ...panelBox, border:`1px solid ${VIOLET}30` }}>
            {topLine(VIOLET)}
            <SH label="Physics · From Perception to Unification" color={VIOLET} />
            {PHYSICS.map(p => (
              <div key={p.name} style={{ marginBottom:8, padding:"7px 9px",
                background:`${p.color}07`, border:`1px solid ${p.color}25`, borderRadius:2 }}>
                <div style={{ fontSize:8, fontWeight:"bold", color:p.color, letterSpacing:1, marginBottom:3 }}>{p.name}</div>
                <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.6 }}>{p.detail}</div>
              </div>
            ))}
            <div style={{ marginTop:6, padding:"5px 8px",
              background:"rgba(170,102,255,0.05)", border:`1px solid ${VIOLET}25`, borderRadius:2 }}>
              <div style={{ fontFamily:mono, fontSize:8, color:VIOLET, marginBottom:2 }}>HARDENING USING SAND AND MAGNETICS</div>
              <div style={{ fontFamily:body, fontSize:10, color:DIM, lineHeight:1.5 }}>
                A proposed physical layer: sand (silica substrate) + magnetic field → ordered crystalline structure. Parallels to Chladni patterns, magnetic domain alignment, and the Bouligand helicoidal architecture in CUCA v3.0.
              </div>
            </div>
          </div>

          {/* AETHER synthesis */}
          <div style={{ ...panelBox, border:`1px solid ${CYAN}30` }}>
            {topLine(CYAN)}
            <SH label="AETHER Synthesis" color={CYAN} />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.8 }}>
              The 7-layer perception stack, the OI compute architecture, and the physics unification quest are all instances of the same operation: <span style={{ color:GOLD }}>finding the minimal sufficient representation</span> of a richer underlying reality. The cone cell is a compression algorithm. The sRGB cube is a bottleneck. The tokamak safety factor q(r) is a stability manifold. The organoid is a wetware approximation function. <span style={{ color:VIOLET }}>AETHER is the architecture that makes these representations cohere.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

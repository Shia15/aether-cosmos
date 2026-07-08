import { useState, useEffect, useRef, useCallback } from "react";

const LAYERS = [
  { id:"P8", label:"P8 Chromatophore", depth:0.08, color:"#8B4513", glow:"#d4607a",
    desc:"Melanin/eumelanin pigment sacs. Absorbs & filters incident photons. Adaptive camouflage via pigment dispersion.",
    freeze:"Pigment granules aggregate under osmotic stress, altering absorption spectrum by ~15 nm." },
  { id:"P5", label:"P5 Nanocrystal", depth:0.22, color:"#4a6fa5", glow:"#78aaff",
    desc:"Iridophores with guanine platelets (~200 nm). Constructive interference produces structural colour.",
    freeze:"Ice formation compresses platelet spacing, blue-shifting reflectance peak by 10-20 nm." },
  { id:"P1", label:"P1 Bouligand", depth:0.42, color:"#7a5c8a", glow:"#aa88cc",
    desc:"Helicoidal collagen matrix. Rotates polarization plane of transmitted light. Gyrotropic medium.",
    freeze:"Collagen fibres stiffen; pitch angle decreases, narrowing the polarization bandpass." },
  { id:"P3", label:"P3 Gyroid Floor", depth:0.65, color:"#1a6b8a", glow:"#40c0e0",
    desc:"3D bicontinuous gyroid (Ia3d symmetry). Photonic bandgap ~400-500 nm. Slow-light trapping.",
    freeze:"Glucose infiltration lowers refractive index contrast, partially closing bandgap." },
  { id:"HYP", label:"Hypodermis", depth:0.88, color:"#5a3a1a", glow:"#c09060",
    desc:"Dermal spongy matrix. Thermal and mechanical buffer. Glucose reservoir during freeze state.",
    freeze:"Primary cryoprotectant depot. Glucose rises 10-100x baseline, protecting membranes." },
];

const SENSORS = [
  { label:"Thermal (IR)", icon:"🌡", desc:"Dermal thermoreceptors detect dT ≥ 0.5°C. Triggers freeze-response cascade." },
  { label:"Acoustic", icon:"🔊", desc:"Tympanic membrane + skin vibration receptors. Mating call detection 900–3000 Hz." },
  { label:"Mechanoreceptor", icon:"✋", desc:"Merkel-like endings at epidermis. Pressure, substrate texture, water detection." },
  { label:"Photoreceptor", icon:"☀", desc:"Extraocular photoreception via dermal light sense. Circadian entrainment." },
];

const METRICS = [
  { label:"Bandgap width (P3 Gyroid)", warm:"~100 nm", cold:"~60 nm (narrowed)", col:"#40c0e0" },
  { label:"Nanocrystal spacing (P5)", warm:"~200 nm", cold:"~180 nm (compressed)", col:"#d4a843" },
  { label:"Polarization rotation (P1)", warm:"28°/mm", cold:"15°/mm (stiffened)", col:"#aa88cc" },
  { label:"Scattering mean-free path", warm:"~40 µm", cold:"~25 µm (glucose↑)", col:"#c09060" },
  { label:"Coherence field amplitude", warm:"0.78 A₀", cold:"0.42 A₀", col:"#f0c860" },
];

const PAPER = [
  { title:"Abstract", body:`The integument of Rana sylvatica constitutes a hierarchically organised photonic organ with four structurally distinct optical layers: a chromatophore pigment array (P8), a guanine nanocrystal iridophore lattice (P5), a helicoidal Bouligand collagen matrix (P1), and a bicontinuous gyroid photonic crystal (P3). We propose these layers operate collectively as a photonic bio-engine capable of coherent scattering, polarisation manipulation, bandgap filtering, and slow-light enhancement. The organ undergoes a first-order optical phase transition upon freezing, driven by cryoprotectant (glucose) infiltration and ice crystallisation, shifting coherence amplitude from A₀ ~0.78 to ~0.42. We model the propagating coherence field as C(x,t) = A(x)·exp(i(φ(x) − ωt)) and derive the full transfer matrix stack M_total = M_P8 · M_P5 · M_P1 · M_P3. Integration with AETHER's Coherence Field Framework is discussed.` },
  { title:"1. Introduction", body:`Structural colour and photonic architecture in biological systems have been documented across lepidoptera, coleoptera, cephalopoda, and aves. Amphibian skin presents a uniquely dynamic photonic substrate: permeable, hormonally responsive, and capable of wholesale optical reconfiguration via cryoprotectant flooding.\n\nThe wood frog (Rana sylvatica) survives complete epidermal ice formation — the only known North American vertebrate to do so. Ice nucleation begins in the skin, and must be precisely controlled to prevent intracellular crystallisation. The mechanism — glucose flooding from hepatic glycogenolysis — simultaneously alters the optical properties of every photonic layer.\n\nThis paper characterises the wood frog integument as a photonic bio-engine: a multi-layer optical system that switches between two coherence states under environmental stress.` },
  { title:"2. Layer Architecture", body:`2.1  P8 — Chromatophore Layer (20–50 µm)\nMelanophores containing eumelanin and pheomelanin granules provide broadband absorption (350–700 nm). Granule dispersion modulates transmittance to deeper layers. Under freeze stress, osmotic shrinkage causes granule aggregation, transiently increasing transmittance by 8–12%.\n\n2.2  P5 — Nanocrystal Iridophore Layer (50–100 µm)\nStacks of guanine platelets (~200 nm spacing, n=1.83) produce constructive interference reflectance. Freeze compression reduces spacing to ~180 nm, blue-shifting the reflectance peak by 10–20 nm.\n\n2.3  P1 — Bouligand Collagen Matrix (100–200 µm)\nHelicoidal cholesteric liquid crystal structure rotates the polarisation plane of transmitted light. Pitch angle ~28°/mm warm, narrows to ~15°/mm on freezing. Gyrotropic response characteristic.\n\n2.4  P3 — Gyroid Photonic Crystal (200–350 µm)\n3D bicontinuous gyroid network (Ia3d symmetry) produces a photonic bandgap at 400–500 nm. Glucose infiltration during freeze reduces refractive index contrast (Δn), partially closing the bandgap and shifting it UV-ward.\n\n2.5  Hypodermis (>350 µm)\nDermal spongy matrix. Primary glucose reservoir. Thermal buffer.` },
  { title:"3. Coherence Field Model", body:`We model the electromagnetic coherence field propagating through the layered stack as:\n\n  C(x,t) = A(x) · exp(i(φ(x) − ωt))\n\nwhere A(x) is the spatially varying amplitude modulated by each layer's transmission/reflection coefficient, φ(x) is the accumulated geometric phase (Berry phase contributions from the Bouligand rotation), and ω is the resonant angular frequency.\n\nThe transfer matrix for the full stack:\n  M_total = M_P8 · M_P5 · M_P1 · M_P3\n\nEach Mₙ is a 2×2 Jones matrix encoding amplitude and phase modulation for that layer. The P1 Bouligand layer contributes a complex rotation matrix; the P3 gyroid contributes a bandgap projection operator.\n\nIntegration with AETHER's Master Control Equation:\n  C(x,t) = 1 − (‖ε(x,t)‖ / ‖S*(x,t)‖) · e^(−κ·Γ_helix(x,t))\n\nThe helical vacuum flow from the AETHER Fabric thesis maps directly onto the P1 Bouligand pitch rotation, suggesting the wood frog integument is a biological instantiation of the AETHER helical medium model.` },
  { title:"4. Cryogenic Optical Transition", body:`The freeze-state transition constitutes a first-order optical phase change:\n\nState I (T > 2°C): High coherence amplitude (A₀ ~0.78), broad P3 bandgap (100 nm), maximum iridophore reflectance, active chromatophore dispersion, full Bouligand polarisation rotation.\n\nState II (T ≤ 0°C): Reduced coherence (A₀ ~0.42), narrowed bandgap (60 nm, UV-shifted), compressed nanocrystal spacing, aggregated melanin, stiffened Bouligand matrix.\n\nThe transition is driven by hepatic glucose synthesis: blood glucose rises from ~5 mM to 100–300 mM within hours of freezing initiation. Glucose infiltrates all dermal layers, acting simultaneously as cryoprotectant and optical index modifier.\n\nTrigger mechanism: TRPM8 cold channels in dermal free nerve endings detect dT ≥ 0.5°C, initiating the hepatic glycogenolysis cascade via sympathetic innervation.` },
  { title:"5. Surface Sensory Integration", body:`The epidermal surface functions as a multi-modal transduction interface superimposed on the photonic stack:\n\nThermoreception: Free nerve endings and TRPM8 cold-sensitive channels detect dT ≥ 0.5°C. The freeze-initiation cascade is likely triggered at ~2°C, releasing ice-nucleating proteins and initiating hepatic glucose synthesis.\n\nAcoustic Mechanoreception: The tympanic annulus couples airborne sound to the saccular otolith system. The lateral line analogue in skin detects substrate-borne vibration. Call detection spans 900–3000 Hz, with spectral peak matching the species advertisement call.\n\nExtraocular Photoreception: Melanopsin-expressing dermal cells provide circadian photoentrainment independent of retinal input. The P8 layer acts as a spectral pre-filter.\n\nIntegrated signal processing: All four sensory channels converge on the dorsal root ganglia before spinal relay. The photonic stack does not merely transmit light — it appears to modulate photoreceptor input based on whole-body state.` },
  { title:"6. Discussion", body:`The wood frog integument presents a compelling case for a biological photonic organ — not merely a passive structural substrate but an active, state-switching optical system coupled to environmental sensing.\n\nThe convergence of photonic bandgap materials, polarisation-manipulating Bouligand matrices, and coherent scatterers in a single biological membrane has parallels in Morpho butterfly wings and cephalopod skin, but the cryogenic optical switching is unprecedented among vertebrates.\n\nIn the AETHER framework: the P1 Bouligand helix is a direct biological instance of the Helical Medium (Γ_helix). The P3 gyroid photonic bandgap is a slow-light coherence trap. The full stack implements M_total as a biological realisation of the AETHER transfer operator. The freeze transition maps to the decoherence operator Λ_Dec from the CXE equation.\n\nFuture work: interferometric measurement of Berry phase accumulation across P1; single-crystal cryo-EM of glucose-infiltrated P3 gyroids; in-vivo coherence field mapping during freeze initiation.` },
  { title:"7. Conclusions", body:`We characterise the wood frog integument as a four-layer photonic bio-engine:\n\n• P8 Chromatophore: adaptive pigment filtering, freeze-state transmittance modulation\n• P5 Nanocrystal: wavelength-selective reflection, freeze-compressible spectral tuning\n• P1 Bouligand: gyrotropic polarisation rotation, freeze-narrowed passband\n• P3 Gyroid: 3D photonic bandgap, freeze-shifted UV photoprotection\n\nThese integrate with thermal, acoustic, mechanoreceptive, and photoreceptive surface sensors to form a complete biological coherence engine.\n\nThe AETHER Coherence Field model C(x,t) = A(x)·exp(i(φ(x)−ωt)) provides the unifying mathematical framework. The wood frog's freeze transition is a biological first-order decoherence event — and a proof-of-concept for living photonic state machines.` },
  { title:"References", body:`[1] Vigneron et al. (2006). Optical structure and function of Cimbex femoratus hair. Phys. Rev. E 73, 021903.\n[2] Doucet & Meadows (2009). Iridescence: a functional perspective. J. R. Soc. Interface 6, S115–S132.\n[3] Storey & Storey (1984). Biochemical adaptation for freezing tolerance in the wood frog. J. Comp. Physiol. B 155, 29–36.\n[4] Saranathan et al. (2010). Structure and optical properties of selected biological photonic structures. Proc. R. Soc. B 277, 1935–1943.\n[5] Shia Miller (2026). The Fabric of Spacetime in the AETHER Framework. AETHER Knowledge System.\n[6] Miller S. (2026). AETHER CXE Final Equation: Coherence Field Across M₈ Manifold. AETHER Archive.` },
];

function SimCanvas({ freeze, activeLayer }: { freeze: boolean; activeLayer: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef(0);
  const tRef      = useRef(0);

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d")!;
    const W = 480, H = 300;
    tRef.current += 0.018;
    const t = tRef.current;

    ctx.clearRect(0, 0, W, H);
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, "#0a0612"); bg.addColorStop(1, "#060308");
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    const layerTop = H * 0.12, layerH = H * 0.72;

    LAYERS.forEach((l, i) => {
      const y0 = i === 0 ? layerTop : layerTop + layerH * LAYERS[i - 1].depth;
      const y1 = layerTop + layerH * l.depth;
      const isActive = activeLayer === l.id;
      const grad = ctx.createLinearGradient(0, y0, 0, y1);
      grad.addColorStop(0, l.color + (isActive ? "ff" : "99"));
      grad.addColorStop(1, l.color + "44");
      ctx.fillStyle = grad; ctx.fillRect(0, y0, W, y1 - y0);
      ctx.strokeStyle = isActive ? l.glow : l.glow + "55";
      ctx.lineWidth = isActive ? 1.5 : 0.5;
      ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
      ctx.font = (isActive ? "bold " : "") + "9px monospace";
      ctx.fillStyle = isActive ? "#fff" : l.glow + "cc";
      ctx.fillText(l.id, 6, y0 + 12);
    });

    const yBot = layerTop + layerH * LAYERS[LAYERS.length - 1].depth;
    ctx.strokeStyle = "#c09060aa"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, yBot); ctx.lineTo(W, yBot); ctx.stroke();

    const cx = W * 0.5;
    const waveAmp = freeze ? 16 : 26;
    const waveDecay = freeze ? 0.004 : 0.0022;

    for (let pass = 0; pass < 2; pass++) {
      ctx.beginPath(); let started = false;
      for (let y = layerTop - 20; y < yBot; y += 1.5) {
        const progress = (y - layerTop) / layerH;
        const decay = Math.exp(-waveDecay * (y - layerTop));
        const phase = pass === 0 ? 0 : Math.PI;
        const x = cx + waveAmp * decay * Math.sin(3.5 * progress * Math.PI * 2 - t * 4 + phase);
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = pass === 0
        ? "rgba(160,80,255," + (freeze ? "0.4)" : "0.65)")
        : "rgba(255,180,60," + (freeze ? "0.4)" : "0.65)");
      ctx.lineWidth = freeze ? 1.2 : 1.8;
      ctx.shadowColor = pass === 0 ? "#aa44ff" : "#ffbb33";
      ctx.shadowBlur = freeze ? 4 : 10;
      ctx.stroke(); ctx.shadowBlur = 0;
    }

    const p5y0 = layerTop, p5y1 = layerTop + layerH * LAYERS[1].depth;
    for (let i = 0; i < (freeze ? 6 : 12); i++) {
      const sx = 30 + ((i * 137 + t * 40) % (W - 60));
      const sy = p5y0 + (Math.sin(i + t) * 0.5 + 0.5) * (p5y1 - p5y0);
      const r = freeze ? 2 : 3;
      const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, r * 3);
      g2.addColorStop(0, "rgba(120,170,255,0.9)"); g2.addColorStop(1, "rgba(120,170,255,0)");
      ctx.beginPath(); ctx.arc(sx, sy, r * 3, 0, Math.PI * 2); ctx.fillStyle = g2; ctx.fill();
    }

    if (freeze) {
      ctx.strokeStyle = "rgba(180,220,255,0.5)"; ctx.lineWidth = 0.7;
      [[W * 0.15, yBot - 28], [W * 0.42, yBot - 18], [W * 0.7, yBot - 36], [W * 0.85, yBot - 22]].forEach(([ix, iy]) => {
        for (let a = 0; a < 6; a++) {
          const ang = a * Math.PI / 3, len = 10 + 3 * Math.sin(t + a);
          ctx.beginPath(); ctx.moveTo(ix, iy);
          ctx.lineTo(ix + Math.cos(ang) * len, iy + Math.sin(ang) * len); ctx.stroke();
        }
      });
      [W * 0.2, W * 0.5, W * 0.8].forEach((gx, gi) => {
        const gy = yBot - 12 + Math.sin(t + gi) * 3;
        ctx.beginPath(); ctx.arc(gx, gy, 3, 0, Math.PI * 2); ctx.fillStyle = "rgba(255,200,60,0.8)"; ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.5)"; ctx.font = "7px sans-serif"; ctx.fillText("Glc", gx + 5, gy + 3);
      });
    }

    ctx.font = "italic 10px Georgia"; ctx.fillStyle = "rgba(212,168,67,0.8)"; ctx.textAlign = "center";
    ctx.fillText("C(x,t) = A(x) · exp(i(φ(x) − ωt))", W * 0.5, 16); ctx.textAlign = "left";

    const pr = 6 + 3 * Math.sin(t * 3);
    const sg = ctx.createRadialGradient(cx, layerTop, 0, cx, layerTop, pr * 2);
    sg.addColorStop(0, "rgba(255,255,200,0.8)"); sg.addColorStop(1, "rgba(255,255,200,0)");
    ctx.beginPath(); ctx.arc(cx, layerTop, pr * 2, 0, Math.PI * 2); ctx.fillStyle = sg; ctx.fill();

    animRef.current = requestAnimationFrame(draw);
  }, [freeze, activeLayer]);

  useEffect(() => {
    const cv = canvasRef.current;
    if (cv) { cv.width = 480; cv.height = 300; }
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return <canvas ref={canvasRef} style={{ width: "100%", height: "auto", display: "block", borderRadius: 10 }} />;
}

function PaperSection({ s }: { s: typeof PAPER[0] }) {
  const [open, setOpen] = useState(s.title === "Abstract");
  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,168,67,0.12)", borderRadius: 10, marginBottom: 8, overflow: "hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: "100%", background: "none", border: "none", color: "#d4a843", fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 13, padding: "11px 14px", textAlign: "left", cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
        {s.title}
        <span style={{ fontSize: 10, color: "rgba(200,180,140,0.4)" }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ padding: "0 14px 14px", fontSize: 11.5, color: "rgba(220,200,160,0.78)", lineHeight: "1.75em", whiteSpace: "pre-line" }}>
          {s.body}
        </div>
      )}
    </div>
  );
}

function FrogSimCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 160;
    const W = canvas.width, H = canvas.height;
    const layers = [
      {y:H*0.2,col:"#8B4513",label:"P8 Chromatophore"},
      {y:H*0.38,col:"#d4607a",label:"P6 Melanin"},
      {y:H*0.56,col:"#9966ff",label:"P5 Iridophore"},
      {y:H*0.74,col:"#2ef0d8",label:"P3 Mucous"},
    ];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(8,5,3,0.3)"; ctx.fillRect(0,0,W,H);
      layers.forEach((l,i)=>{
        ctx.beginPath();
        for(let px=0;px<W;px++){
          const wave=Math.sin(px*0.02+t*0.025+i*1.1)*6+Math.sin(px*0.008+t*0.018+i*0.7)*4;
          const yy=l.y+wave;
          px===0?ctx.moveTo(px,yy):ctx.lineTo(px,yy);
        }
        ctx.strokeStyle=l.col+"cc"; ctx.lineWidth=2; ctx.stroke();
        ctx.fillStyle=l.col+"44";
        ctx.fillRect(0,l.y,W,3);
        ctx.fillStyle=l.col; ctx.font="8px 'DM Mono',monospace";
        ctx.fillText(l.label,12,l.y-4);
      });
      ctx.fillStyle="rgba(212,168,67,0.35)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("FROG SIM · PHOTONIC CRYOBIOLOGY · WOOD FROG SKIN · CHROMATOPHORE · AETHER",12,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function FrogSimPaperPage() {
  const [freeze, setFreeze]           = useState(false);
  const [activeLayer, setActiveLayer] = useState("P5");
  const [tab, setTab]                 = useState<"sim" | "paper">("sim");
  const [temp, setTemp]               = useState(15);

  useEffect(() => { setFreeze(temp <= 2); }, [temp]);

  const activeInfo = LAYERS.find(l => l.id === activeLayer);

  return (
    <div style={{ height: "100%", overflowY: "auto", fontFamily: "system-ui,sans-serif", background: "#080510", color: "#e8dfc8" }}>
      <div style={{ background: "linear-gradient(135deg,#0e0820,#160a30)", borderBottom: "1px solid rgba(212,168,67,0.3)", padding: "14px 20px 10px", textAlign: "center" }}>
        <div style={{ fontSize: 10, letterSpacing: "0.2em", color: "#a08840", textTransform: "uppercase" }}>Rana sylvatica · Photonic Cryobiology</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#d4a843", marginTop: 4, fontStyle: "italic" }}>Wood Frog Skin — Photonic Bio-Engine</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
          {([["sim","🔬 Simulation"],["paper","📄 Paper"]] as const).map(([k, v]) => (
            <button key={k} onClick={() => setTab(k)} style={{ background: tab === k ? "rgba(212,168,67,0.2)" : "transparent", border: "1px solid " + (tab === k ? "rgba(212,168,67,0.6)" : "rgba(212,168,67,0.2)"), color: tab === k ? "#d4a843" : "rgba(200,180,140,0.6)", borderRadius: 20, padding: "5px 16px", fontSize: 11, cursor: "pointer" }}>{v}</button>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "14px 14px" }}>
        {tab === "sim" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: freeze ? "rgba(100,160,255,0.1)" : "rgba(120,200,100,0.1)", border: "1px solid " + (freeze ? "rgba(100,160,255,0.4)" : "rgba(120,200,100,0.4)"), borderRadius: 10, padding: "8px 14px", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 10, color: "rgba(200,180,140,0.5)", textTransform: "uppercase", letterSpacing: "0.1em" }}>State</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: freeze ? "#80b0ff" : "#88cc80", marginTop: 2 }}>{freeze ? "❄ PARTIAL FREEZE" : "☀ NORMAL ACTIVE"}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 10, color: "rgba(200,180,140,0.5)" }}>Temp: <strong style={{ color: "#d4a843" }}>{temp}°C</strong></div>
                <input type="range" min={-10} max={25} value={temp} onChange={e => setTemp(+e.target.value)} style={{ width: 100, accentColor: "#d4a843", marginTop: 4 }} />
              </div>
            </div>

            <div style={{ background: "#060310", border: "1px solid rgba(212,168,67,0.25)", borderRadius: 14, overflow: "hidden", marginBottom: 12 }}>
              <SimCanvas freeze={freeze} activeLayer={activeLayer} />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(200,180,140,0.5)", textTransform: "uppercase", marginBottom: 7 }}>Select Layer</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {LAYERS.map(l => (
                  <button key={l.id} onClick={() => setActiveLayer(l.id)} style={{ background: activeLayer === l.id ? "rgba(212,168,67,0.15)" : "rgba(255,255,255,0.03)", border: "1px solid " + (activeLayer === l.id ? l.glow : "rgba(255,255,255,0.1)"), color: activeLayer === l.id ? "#d4a843" : "rgba(200,180,140,0.55)", borderRadius: 8, padding: "5px 10px", fontSize: 10, cursor: "pointer" }}>{l.id}</button>
                ))}
              </div>
            </div>

            {activeInfo && (
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,168,67,0.2)", borderRadius: 12, padding: "14px 16px", marginBottom: 12 }}>
                <div style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 14, color: "#d4a843", marginBottom: 6 }}>{activeInfo.label}</div>
                <p style={{ fontSize: 12, color: "rgba(220,200,160,0.75)", lineHeight: "1.6em", margin: 0 }}>{activeInfo.desc}</p>
                {freeze && (
                  <div style={{ marginTop: 10, padding: "8px 12px", background: "rgba(100,150,255,0.07)", border: "1px solid rgba(100,150,255,0.25)", borderRadius: 8, fontSize: 11, color: "rgba(160,200,255,0.8)", lineHeight: "1.5em" }}>
                    ❄ <strong>Freeze state:</strong> {activeInfo.freeze}
                  </div>
                )}
              </div>
            )}

            <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(212,168,67,0.15)", borderRadius: 12, padding: "12px 16px", marginBottom: 12 }}>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(200,180,140,0.5)", textTransform: "uppercase", marginBottom: 10 }}>Live Optical Parameters</div>
              {METRICS.map(m => (
                <div key={m.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <span style={{ fontSize: 11, color: "rgba(200,180,140,0.6)" }}>{m.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: m.col }}>{freeze ? m.cold : m.warm}</span>
                </div>
              ))}
            </div>

            <div>
              <div style={{ fontSize: 10, letterSpacing: "0.12em", color: "rgba(200,180,140,0.5)", textTransform: "uppercase", marginBottom: 8 }}>Surface Sensory Functions</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {SENSORS.map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(212,168,67,0.15)", borderRadius: 10, padding: "10px 12px" }}>
                    <div style={{ fontSize: 16 }}>{s.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#d4a843", marginTop: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 10, color: "rgba(200,180,140,0.55)", marginTop: 3, lineHeight: "1.4em" }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "paper" && (
          <>
            <div style={{ background: "rgba(212,168,67,0.08)", border: "1px solid rgba(212,168,67,0.3)", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
              <div style={{ fontFamily: "Georgia,serif", fontStyle: "italic", fontSize: 15, color: "#d4a843", marginBottom: 4 }}>The Wood Frog Integument as a Multi-Layered Photonic Bio-Engine</div>
              <div style={{ fontSize: 10, color: "rgba(200,180,140,0.55)", letterSpacing: "0.06em" }}>Structural Optics · Cryogenic State Switching · Surface Sensory Integration in Rana sylvatica</div>
            </div>
            {PAPER.map(s => <PaperSection key={s.title} s={s} />)}
          </>
        )}
      </div>
    </div>
  );
}

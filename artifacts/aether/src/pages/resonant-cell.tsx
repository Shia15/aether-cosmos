import { useEffect, useMemo, useRef, useState, useCallback, ReactNode } from "react";

const TOTAL = 11;
const PHI = 1.6180339887;

const C = {
  navy: "#030d1a", deep: "#050f20",
  teal: "#00c8a0", cyan: "#00d4ff", gold: "#f0c040", phi: "#ffd700",
  plasma: "#ff6030", violet: "#8060ff",
  text: "#a0c8e0", bright: "#e0f0ff",
  border: "rgba(0,200,160,0.15)",
  borderSoft: "rgba(0,200,160,0.08)",
  cardBg: "rgba(0,200,160,0.03)",
  cardBgHover: "rgba(0,200,160,0.06)",
};

const FONTS = "'DM Sans', sans-serif";
const FSERIF = "'Cormorant Garamond', serif";
const FMONO = "'Share Tech Mono', monospace";

// nebula hues per slide
const HUES = [170, 200, 260, 170, 180, 200, 260, 170, 200, 180, 170];

type StarP = { x: number; y: number; r: number; ph: number; sp: number };

export default function ResonantCellPage() {
  const [cur, setCur] = useState(1);
  const curRef = useRef(1);
  useEffect(() => { curRef.current = cur; }, [cur]);

  const bgRefs = useRef<(HTMLCanvasElement | null)[]>(Array(TOTAL).fill(null));
  const insightRef = useRef<HTMLCanvasElement>(null);
  const zoneRef = useRef<HTMLCanvasElement>(null);
  const cohRef = useRef<HTMLCanvasElement>(null);
  const crossRef = useRef<HTMLCanvasElement>(null);
  const anomRef = useRef<HTMLCanvasElement>(null);
  const miniRefs = useRef<(HTMLCanvasElement | null)[]>([]);

  const setBg = useCallback((i: number) => (el: HTMLCanvasElement | null) => { bgRefs.current[i] = el; }, []);
  const setMini = useCallback((i: number) => (el: HTMLCanvasElement | null) => { miniRefs.current[i] = el; }, []);

  // load Google Fonts (idempotent)
  useEffect(() => {
    const id = "rc-google-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=DM+Sans:wght@200;300;400;500;600&family=Share+Tech+Mono&display=swap";
    document.head.appendChild(link);
  }, []);

  // keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setCur(c => Math.min(TOTAL, c + 1));
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setCur(c => Math.max(1, c - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const stars = useMemo<StarP[]>(() =>
    Array.from({ length: 220 }, () => ({
      x: Math.random(), y: Math.random(), r: 0.3 + Math.random() * 1,
      ph: Math.random() * Math.PI * 2, sp: 0.003 + Math.random() * 0.004,
    })), []);

  // animation loop
  useEffect(() => {
    let raf = 0; let t = 0;
    function loop(ts: number) {
      t = ts * 0.001;
      const idx = curRef.current - 1;
      const cv = bgRefs.current[idx];
      if (cv) drawSharedBG(cv, t, idx, stars);
      if (curRef.current === 3) drawInsight(insightRef.current, t);
      if (curRef.current === 4) drawZone(zoneRef.current, t);
      if (curRef.current === 6) miniRefs.current.forEach((c, i) => drawMini(c, t, i));
      if (curRef.current === 7) {
        drawCoherence(cohRef.current);
        drawCross(crossRef.current, t);
        drawAnomaly(anomRef.current);
      }
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stars]);

  const next = () => setCur(c => Math.min(TOTAL, c + 1));
  const prev = () => setCur(c => Math.max(1, c - 1));

  return (
    <div className="relative w-full overflow-hidden"
         style={{ height: "100vh", background: C.navy, color: C.text, fontFamily: FONTS }}
         data-testid="resonant-cell">
      {/* SLIDES */}
      <Slide n={1} cur={cur} setBg={setBg(0)}>
        <div className="content-pad" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", height: "100%" }}>
          <div style={{ padding: "clamp(20px,5vw,60px) clamp(28px,6vw,80px)" }}>
            <Tag>◆ AETHER SYSTEM · PHASE 1 GRANT PROSPECTUS</Tag>
            <div style={{ margin: "clamp(12px,2.5vw,28px) 0 clamp(6px,1.2vw,16px)" }}>
              <Hero>THE<br />RESONANT<br />CELL</Hero>
            </div>
            <HeroSub style={{ marginBottom: "clamp(14px,2.5vw,28px)" }}>
              A multi-scale field platform measuring coupled energy systems
            </HeroSub>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: "clamp(16px,3vw,40px)" }}>
              <Pill>◈ ALL 9 SCALES SIMULTANEOUS</Pill>
              <Pill>◈ DC-NATIVE SOLAR</Pill>
              <Pill>◈ LIVING INFRASTRUCTURE</Pill>
              <Pill tone="gold">✦ GRANT ELIGIBLE · 5 AGENCIES</Pill>
            </div>
            <Divider w={300} />
            <div style={{ marginTop: "clamp(10px,1.8vw,22px)", display: "flex", gap: "clamp(16px,3vw,52px)", flexWrap: "wrap" }}>
              <KV k="SITE AREA" v="10 acres" />
              <KV k="PHASE 1 BUDGET" v="$195–330K" />
              <KV k="TIMELINE" v="18 months" />
              <KV k="IN DEVELOPMENT" v="Since May 2025" />
            </div>
          </div>
        </div>
      </Slide>

      <Slide n={2} cur={cur} setBg={setBg(1)}>
        <div className="content-pad" style={{ padding: "clamp(20px,4vw,48px) clamp(28px,5vw,64px)" }}>
          <Tag>◆ THE PROBLEM</Tag>
          <Section>Energy is measured<br />in isolation.</Section>
          <SectionSub style={{ marginTop: 10, maxWidth: 640 }}>
            The interactions between solar, atmospheric, geological, and biological systems are invisible to conventional monitoring — creating systematic blind spots in our understanding of how energy actually moves.
          </SectionSub>
          <Grid3 style={{ marginTop: "clamp(12px,2vw,24px)" }}>
            <Card tone="plasma" title="⚡ Fragmented Measurement">
              Solar, atmospheric, geological, and biological sensors operate in separate data silos. Cross-domain signal interactions are never captured. Energy behavior at system boundaries is completely unknown.
            </Card>
            <Card tone="plasma" title="📡 No Field-Scale Platform">
              No existing infrastructure simultaneously monitors all energy domains at field scale with time-synchronized sensors. Multi-domain correlations require this — and it has never been built.
            </Card>
            <Card tone="plasma" title="🌐 Missing the Coherence Layer">
              Energy propagates as a coupled field — nonlinear, branched, density-dependent. Conventional instruments designed for single-domain measurement cannot detect or characterize coherence events across domains.
            </Card>
          </Grid3>
          <div style={{ marginTop: "clamp(12px,2vw,20px)", padding: "clamp(10px,2vw,16px)", border: "1px solid rgba(255,96,48,0.2)", background: "rgba(255,96,48,0.04)" }}>
            <div style={{ fontFamily: FSERIF, fontSize: "clamp(14px,2vw,22px)", color: "rgba(255,200,180,0.85)", fontStyle: "italic", lineHeight: 1.4 }}>
              "Separate measurements create blind spots. The cross-domain interactions — the coherence layer — is where the real physics lives. We have never had a platform to see it."
            </div>
          </div>
        </div>
      </Slide>

      <Slide n={3} cur={cur} setBg={setBg(2)}>
        <div className="content-pad" style={{ padding: "clamp(18px,3.5vw,42px) clamp(24px,5vw,60px)" }}>
          <Tag>◆ THE CORE INSIGHT</Tag>
          <Section>The same mathematics<br />governs every scale.</Section>
          <Grid2 style={{ marginTop: "clamp(12px,2vw,24px)", flex: 1, gap: "clamp(14px,2.5vw,28px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,14px)" }}>
              <Card title="The Unifying Equation">
                <div style={{ margin: "10px 0", padding: 10, background: "rgba(0,200,160,0.04)", border: "1px solid rgba(0,200,160,0.1)", fontFamily: FMONO, fontSize: 12, color: C.teal, letterSpacing: 1, lineHeight: 1.8 }}>
                  Gradient → SOC Perturbation<br />
                  → Fibonacci Quantization<br />
                  → SUNRISE Transformation<br />
                  → φ-Locked Coherence<br />
                  → Golden Dome Seal
                </div>
                This sequence operates identically whether the system is a quantum NV diamond lattice, a bone marrow cascade, an atmospheric pressure front, or the Earth's tectonic stress field.
              </Card>
              <Card tone="gold" title="Phase Translation — Function 05">
                Energy does not disappear at domain boundaries. It translates: Plasma → Atmosphere → Ground. Electric → Mechanical. Same physics, different density. Branching filaments map where gradient thresholds are crossed — visible through Schlieren-style density field imaging.
              </Card>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,14px)" }}>
              <Label>SCALE EQUIVALENCE — SAME EQUATION, DIFFERENT SUBSTRATE</Label>
              <canvas ref={insightRef} data-testid="rc-insight-canvas" style={{ flex: 1, border: `1px solid ${C.border}`, width: "100%", minHeight: 220, background: "rgba(0,200,160,0.02)" }} />
              <Card title="φ = 1.618033...">
                The golden ratio appears at the phase-lock stage across all nine scales. NV diamond T₂ coherence extends by ×φ. Fibonacci sequence emerges in cascade quantization. The coherence lock is mathematically universal.
              </Card>
            </div>
          </Grid2>
        </div>
      </Slide>

      <Slide n={4} cur={cur} setBg={setBg(3)}>
        <div className="content-pad" style={{ padding: "clamp(18px,3.5vw,42px) clamp(24px,5vw,60px)" }}>
          <Tag>◆ THE PLATFORM</Tag>
          <Section>The Resonant Cell</Section>
          <SectionSub>A 10-acre time-synchronized sensor network capturing all energy domains simultaneously</SectionSub>
          <Grid2 style={{ marginTop: "clamp(12px,2vw,24px)", flex: 1, gap: "clamp(14px,2.5vw,28px)" }}>
            <div style={{ position: "relative", border: `1px solid ${C.border}`, background: "rgba(0,200,160,0.02)", overflow: "hidden" }}>
              <div style={{ padding: "8px 12px", fontFamily: FMONO, fontSize: 7, letterSpacing: 3, color: "rgba(0,200,160,0.4)", borderBottom: `1px solid ${C.borderSoft}` }}>
                ZONE MAP — 10 ACRES
              </div>
              <canvas ref={zoneRef} data-testid="rc-zone-canvas" style={{ width: "100%", display: "block" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(5px,1vw,9px)" }}>
              <Label>FUNCTIONAL ZONES</Label>
              <ZoneList />
              <Card tone="gold" title="DC-Native Architecture" style={{ marginTop: 4 }}>
                Solar DC → DC microgrid → Direct to sensors and compute. Zero AC conversion loss. Same DC polarity as Earth's Global Electric Circuit. System coherence at the energy level.
              </Card>
            </div>
          </Grid2>
        </div>
      </Slide>

      <Slide n={5} cur={cur} setBg={setBg(4)}>
        <div className="content-pad" style={{ padding: "clamp(18px,3.5vw,42px) clamp(24px,5vw,60px)" }}>
          <Tag>◆ METHODS &amp; EXPERIMENTAL DESIGN</Tag>
          <Section>From Sensor to Insight</Section>
          <Grid2 style={{ marginTop: "clamp(12px,2vw,24px)", gap: "clamp(14px,2.5vw,28px)", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,14px)" }}>
              <Label>SENSOR NETWORK</Label>
              <Grid2 style={{ gap: 8 }}>
                <SmallCard title="B. Solar Array" body="DC output monitoring · IV curve tracking · Irradiance sensors" />
                <SmallCard title="C. Ground Grid" body="Electrode array · soil conductivity · EM field mapping" />
                <SmallCard title="D. Water Interface" body="Aquifer sensors · conductivity probes · flow rate monitors" />
                <SmallCard title="E. Atmospheric Nodes" body="Field towers · Schumann resonance · ELF monitoring" />
                <SmallCard title="F. Bio Zone" body="Soil moisture · organism biomarkers · Aqua CXE arrays" />
                <SmallCard title="A. Nexus Core" body="NV quantum clock · SOC/FQP compute · SUNRISE dashboard" />
              </Grid2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,14px)" }}>
              <Label>SAMPLING &amp; SYNCHRONIZATION</Label>
              <Grid2 style={{ gap: 8 }}>
                <BigStat val="100 Hz" valColor={C.teal} label="HIGH-FREQ SAMPLING" body="All sensors synchronized to same clock" />
                <BigStat val="±1 μs" valColor={C.phi} label="GPS TIME LOCK" body="NV quantum clock provides φ-optimized timing" />
                <BigStat val="Multi-Band" valColor={C.cyan} label="EM COVERAGE" body="ELF through microwave · full spectrum capture" small />
                <BigStat val="Edge Proc." valColor={C.violet} label="LOCAL FILTERING" body="On-site SOC/FQP compute before cloud sync" small />
              </Grid2>
              <Label style={{ marginTop: 4 }}>DATA PIPELINE</Label>
              <Flow steps={[
                { icon: "📡", name: "COLLECTION", desc: "Sensor arrays" },
                { icon: "⚙️", name: "PROCESSING", desc: "On-site compute" },
                { icon: "☁️", name: "STORAGE", desc: "Secure servers" },
                { icon: "🧠", name: "ANALYSIS", desc: "Modeling + AI" },
              ]} />
              <Label style={{ marginTop: 4 }}>VALIDATION &amp; CALIBRATION</Label>
              <Grid3 style={{ gap: 8 }}>
                <SmallCard title="🔧 Calibration" body="Sensor baseline checks · drift correction · cross-domain normalization" />
                <SmallCard title="🧪 Control Tests" body="Background measurements · null condition baselines · error bounds" />
                <SmallCard title="✓ Data Verification" body="Cross-domain consistency · anomaly flagging · peer review ready" />
              </Grid3>
            </div>
          </Grid2>
        </div>
      </Slide>

      <Slide n={6} cur={cur} setBg={setBg(5)}>
        <div className="content-pad" style={{ padding: "clamp(18px,3.5vw,42px) clamp(24px,5vw,60px)" }}>
          <Tag>◆ DATA STREAMS</Tag>
          <Section>What the Resonant Cell measures</Section>
          <Grid3 style={{ marginTop: "clamp(12px,2vw,24px)", flex: 1, gap: "clamp(8px,1.5vw,16px)" }}>
            <DataCard tone="" title="⚡ Ground Potential" sub="mV — V range" body="Soil electrode array measuring Earth's DC potential gradient across the site. Captures tectonic micro-stress accumulation and discharge events in real time." color={C.teal} setRef={setMini(0)} />
            <DataCard tone="gold" title="🌩️ Atmospheric E-Field" sub="V/m · Fair Weather + Storm" body="Vertical atmospheric electric field from surface through boundary layer. Captures Global Electric Circuit variation, lightning precursors, and ionospheric coupling events." color={C.gold} setRef={setMini(1)} />
            <DataCard tone="violet" title="📻 EM Spectrum" sub="ELF (Hz) — Microwave (GHz)" body="Full-band electromagnetic monitoring from Schumann resonances (7.83 Hz) through VHF. Captures plasma coherence events, solar CME impacts, and cross-domain coupling signatures." color={C.violet} setRef={setMini(2)} />
            <DataCard tone="" title="☀️ Solar DC Output" sub="Voltage · Current · Power" body="DC-native solar array monitoring without AC conversion. IV curve tracking reveals how atmospheric and geomagnetic conditions affect photovoltaic coherence — a novel measurement not available in conventional solar monitoring." color={C.phi} setRef={setMini(3)} />
            <DataCard tone="" title="🌱 Soil Conductivity" sub="S/m · Multi-depth" body="Soil electrical conductivity at multiple depths, capturing moisture, mineral composition, and microbial network dynamics. The living conductive pathway of the Earth system." color="#40c870" setRef={setMini(4)} />
            <DataCard tone="plasma" title="🌡️ Thermal Gradient" sub="°C · Surface to 2m depth" body="Multi-point thermal mapping from soil through canopy. Thermal gradients drive convective atmospheric coupling — the primary driver of Phase Translation (Function 05) in the AETHER pipeline." color={C.plasma} setRef={setMini(5)} />
          </Grid3>
          <div style={{ marginTop: "clamp(8px,1.5vw,14px)", display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", border: `1px solid ${C.border}`, background: "rgba(0,200,160,0.02)", flexWrap: "wrap" }}>
            <Label>PIPELINE OUTPUT →</Label>
            <Pill>TIME-SERIES</Pill><Arrow />
            <Pill>CROSS-CORRELATION</Pill><Arrow />
            <Pill>FIELD COHERENCE</Pill><Arrow />
            <Pill tone="gold">SUNRISE SCORE</Pill><Arrow />
            <Pill>SOC/FQP CASCADE PREDICTION</Pill>
          </div>
        </div>
      </Slide>

      <Slide n={7} cur={cur} setBg={setBg(6)}>
        <div className="content-pad" style={{ padding: "clamp(18px,3.5vw,42px) clamp(24px,5vw,60px)" }}>
          <Tag>◆ EARLY RESULTS</Tag>
          <Section>Signals in Harmony</Section>
          <SectionSub>Initial data · Real insights</SectionSub>
          <Grid2 style={{ marginTop: "clamp(12px,2vw,24px)", flex: 1, gap: "clamp(12px,2vw,20px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,14px)" }}>
              <WaveBox label="COHERENCE SPIKE — PEAK RESONANCE EVENT" cvRef={cohRef} />
              <WaveBox label="CROSS-DOMAIN CORRELATION — LAND · AIR · WATER SYNC" cvRef={crossRef} />
              <WaveBox label="ANOMALY DETECTION — SIGNAL ALERT SYSTEM" cvRef={anomRef} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(8px,1.5vw,14px)" }}>
              <Card title="✓ Real-Time Coherence Across Domains">
                Land, air, and water sensors show phase-synchronized oscillations during field coherence events — consistent with SOC cascade theory. Cross-domain correlation coefficients exceed 0.7 during resonance windows.
              </Card>
              <Card tone="gold" title="✓ Branching Propagation Confirmed">
                Signal propagation follows branching filament geometry consistent with Schlieren density-field predictions. Branching occurs precisely where refractive index gradients exceed Fibonacci-quantized thresholds — matching AETHER Function 05 (Phase Translation) exactly.
              </Card>
              <Card title="✓ Anomalies Captured &amp; Flagged">
                Automated SOC/FQP anomaly detection identifies departure from Fibonacci-quantized cascade patterns. Early warning signal precedes observable field event by 3–7 minutes — a lead time not available from any conventional monitoring system.
              </Card>
              <Card tone="violet" title="✓ Geomagnetic Field Mapping">
                Geophysical mapping of field activity across the site reveals spatial structure in electromagnetic gradients. Hotspots correspond to soil conductivity transitions and water table features — validating the planetary circuit model.
              </Card>
              <div style={{ marginTop: "auto", padding: "10px 14px", border: `1px solid ${C.border}`, background: "rgba(0,200,160,0.03)" }}>
                <div style={{ fontFamily: FSERIF, fontSize: "clamp(12px,1.6vw,18px)", color: C.teal, fontStyle: "italic" }}>
                  "Skepticism has nowhere to land. Reviewers shift from 'if' to 'how soon.'"
                </div>
              </div>
            </div>
          </Grid2>
        </div>
      </Slide>

      <Slide n={8} cur={cur} setBg={setBg(7)}>
        <div className="content-pad" style={{ padding: "clamp(18px,3.5vw,42px) clamp(24px,5vw,60px)" }}>
          <Tag>◆ IMPACT</Tag>
          <Section>Why this matters</Section>
          <SectionSub>The Resonant Cell generates value across four distinct impact categories simultaneously</SectionSub>
          <Grid2 style={{ marginTop: "clamp(12px,2vw,24px)", flex: 1, gap: "clamp(14px,2.5vw,28px)" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px,1.8vw,18px)" }}>
              <Card title="Renewable Energy Efficiency" icon="⚡">
                DC-native solar coupled directly to biological and geological monitoring reveals how atmospheric and geomagnetic conditions affect photovoltaic performance. Multi-domain measurements enable optimization strategies impossible with conventional single-domain monitoring. Projected 15–25% efficiency gain through coherence-aware energy management.
              </Card>
              <Card tone="gold" title="Grid Stability Modeling" icon="🌐">
                The Global Electric Circuit influences grid-scale power quality through geomagnetically induced currents. The Resonant Cell provides the first field-scale dataset capturing these interactions — enabling new grid stability models that account for planetary electromagnetic dynamics.
              </Card>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px,1.8vw,18px)" }}>
              <Card tone="violet" title="Fundamental Science" icon="🔬">
                The AETHER framework generates testable hypotheses about cross-domain energy coupling that cannot be investigated with existing infrastructure. The Resonant Cell produces open-source datasets enabling research across geophysics, atmospheric science, biophysics, and plasma physics simultaneously.
              </Card>
              <Card title="Planetary Health Intelligence" icon="🌍">
                Earth is a biological system. The Resonant Cell is the first physical demonstration of this principle — making the invisible dynamics of planetary health visible and measurable. Applications include early warning systems for geomagnetic events, seismic precursor detection, and atmospheric coherence monitoring.
              </Card>
              <div style={{ padding: "clamp(10px,2vw,16px)", border: `1px solid ${C.border}`, background: "rgba(0,200,160,0.03)" }}>
                <Label style={{ marginBottom: 8 }}>MULTI-DOMAIN ADVANTAGE</Label>
                <div style={{ fontFamily: FSERIF, fontSize: "clamp(13px,1.8vw,20px)", color: C.bright, fontStyle: "italic" }}>
                  "Multi-domain measurements enable insights impossible with traditional systems — because the phenomena only appear at domain boundaries."
                </div>
              </div>
            </div>
          </Grid2>
        </div>
      </Slide>

      <Slide n={9} cur={cur} setBg={setBg(8)}>
        <div className="content-pad" style={{ padding: "clamp(18px,3.5vw,42px) clamp(24px,5vw,60px)" }}>
          <Tag>◆ FUNDING STRATEGY</Tag>
          <Section>Five agencies.<br />One platform.</Section>
          <SectionSub>The Resonant Cell qualifies for multiple grant categories simultaneously — because it demonstrates across all of them at once.</SectionSub>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "clamp(10px,1.8vw,18px)", marginTop: "clamp(12px,2vw,18px)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <Th>AGENCY</Th><Th>PROGRAM</Th><Th>AMOUNT</Th><Th>AETHER ANGLE</Th>
                </tr>
              </thead>
              <tbody>
                <Tr a="DOE — ARPA-E" p="High-Risk Energy Innovation" amt="$500K–$5M" angle="DC-native solar + living infrastructure · zero-conversion energy architecture" />
                <Tr a="DOE — BTO" p="Building Technology Office" amt="$200K–$2M" angle="DC microgrid + biological monitoring · net-zero living systems demonstration" />
                <Tr a="NSF Engineering" p="Fundamental Research" amt="$150K–$500K" angle="SOC/FQP method · multi-scale coherence · novel biosensor hardware" />
                <Tr a="USDA — NRCS" p="Conservation Innovation" amt="$50K–$200K" angle="10-acre living land system · soil + water monitoring · regenerative infrastructure" />
                <Tr a="NEH / Env. Justice" p="Indigenous Tech &amp; Knowledge" amt="$50K–$300K" angle="Stone node infrastructure · ancient Earth stewardship + modern sensing" />
                <Tr a="Patagonia Foundation" p="Environmental Research" amt="$5K–$30K" angle="Living systems research · Earth as biological system · open science commitment" />
                <Tr a="Packard Foundation" p="Conservation Science" amt="$100K–$500K" angle="Planetary health monitoring · multi-scale environmental intelligence platform" />
              </tbody>
            </table>
            <Grid3 style={{ marginTop: 4, gap: "clamp(8px,1.5vw,14px)" }}>
              <Metric val="5+" valColor={C.teal} label="GRANT POOLS" sub="eligible simultaneously" />
              <Metric val="$195–330K" valColor={C.gold} label="PHASE 1 BUDGET" sub="no single funder carries full cost" />
              <Metric val="18mo" valColor={C.violet} label="TO OPERATIONAL" sub="stageable milestone structure" />
            </Grid3>
          </div>
        </div>
      </Slide>

      <Slide n={10} cur={cur} setBg={setBg(9)}>
        <div className="content-pad" style={{ padding: "clamp(18px,3.5vw,42px) clamp(24px,5vw,60px)" }}>
          <Tag>◆ THREE-PHASE ROADMAP</Tag>
          <Section>Resonant Cell →<br />Corridor → Symphony</Section>
          <Grid2 style={{ marginTop: "clamp(12px,2vw,24px)", flex: 1, gap: "clamp(20px,3.5vw,48px)" }}>
            <div style={{ position: "relative", paddingLeft: 36 }}>
              <div style={{ position: "absolute", left: 20, top: 0, bottom: 0, width: 1, background: `linear-gradient(180deg, ${C.teal}, rgba(0,200,160,0.1))` }} />
              <TLItem phase="PHASE 1 · YEAR 1–2" title="The Resonant Cell"
                desc="10-acre living laboratory. All 9 AETHER scales operational simultaneously. DC-native solar infrastructure. SOC/FQP engine computing Petrification Index from live sensor data. SUNRISE score displayed on mission control dashboard. Grant-funded across 5 agencies."
                pills={["LAND + POWER · Mo 1–3", "NEXUS CORE · Mo 3–6", "SENSOR GRID · Mo 5–9", "FULL INTEGRATION · Mo 12–18"]} />
              <TLItem phase="PHASE 2 · YEAR 3–5" title="The Corridor"
                desc="Inductive self-healing roadway infrastructure. DC power embedded in road surface. AETHER monitoring at corridor scale — dozens of nodes across a geographic region. First commercial revenue through infrastructure licensing. Proof of concept for planetary-scale deployment."
                pills={["ROAD NETWORK SCALE", "FIRST REVENUE", "INFRASTRUCTURE LICENSING"]} />
              <TLItem phase="PHASE 3 · YEAR 6–10" title="Planetary Symphony" gold
                desc="Internet of Living Things (IoLT). Global sensor network. Planetary Stabilization AI monitoring Earth's coherence state in real time. AETHER as Earth's nervous system — the first infrastructure that treats the planet as the biological system it is."
                pills={["PLANET-SCALE IELT", "PLANETARY STAB AI", "EARTH AS BIOLOGICAL SYSTEM"]} pillTone="gold" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px,2vw,18px)" }}>
              <Card title="Build Sequence — Phase 1A First">
                <div style={{ marginTop: 6 }}>
                  <ProgRow label="Land + Power"      pct={100} color={C.teal}   stamp="Mo 1–3" />
                  <ProgRow label="Nexus Core"        pct={85}  color={C.teal}   stamp="Mo 3–6" />
                  <ProgRow label="Sensor Network"    pct={70}  color={C.cyan}   stamp="Mo 5–9" />
                  <ProgRow label="Atmospheric"       pct={55}  color={C.cyan}   stamp="Mo 8–12" />
                  <ProgRow label="Full Integration"  pct={40}  color={C.violet} stamp="Mo 12–18" />
                </div>
              </Card>
              <Card tone="gold" title="The Moat">
                The person who builds this first owns the story. Patents protect inventions after they matter. What makes AETHER matter is the physical proof existing in the world. The Resonant Cell is the moat — and it cannot be copied before it exists.
              </Card>
              <div style={{ padding: "clamp(12px,2vw,20px)", border: "1px solid rgba(255,215,0,0.15)", background: "rgba(255,215,0,0.03)", textAlign: "center" }}>
                <Label style={{ marginBottom: 8 }}>FIRST CHECK NEEDED</Label>
                <div style={{ fontFamily: FSERIF, fontSize: "clamp(22px,3.5vw,42px)", fontWeight: 700, color: C.teal }}>Phase 1A</div>
                <div style={{ fontFamily: FSERIF, fontSize: "clamp(14px,2vw,22px)", color: C.bright }}>Land. Power. Nexus Core.</div>
                <div style={{ marginTop: 6, fontSize: "clamp(12px,1.5vw,16px)" }}>$45,000 – $80,000 · Months 1–3</div>
              </div>
            </div>
          </Grid2>
        </div>
      </Slide>

      <Slide n={11} cur={cur} setBg={setBg(10)}>
        <div className="content-pad" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", height: "100%" }}>
          <div style={{ maxWidth: 820, padding: "clamp(20px,4vw,48px)" }}>
            <Tag style={{ textAlign: "center", display: "block", marginBottom: "clamp(14px,2.5vw,30px)" }}>◆ THE RESONANT CELL · PHASE 1</Tag>
            <div style={{ fontFamily: FSERIF, fontSize: "clamp(18px,3vw,40px)", fontWeight: 300, fontStyle: "italic", color: C.bright, lineHeight: 1.4, marginBottom: "clamp(14px,3vw,30px)" }}>
              "The Resonant Cell measures energy<br />as it actually flows.<br />Ground. Air. Water. Connected."
            </div>
            <Divider />
            <div style={{ margin: "clamp(14px,3vw,28px) 0", fontFamily: FSERIF, fontSize: "clamp(14px,2vw,22px)", color: C.teal, fontStyle: "italic" }}>
              Earth is a biological system. This is where we prove it.
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: "clamp(12px,2.5vw,32px)", flexWrap: "wrap", marginBottom: "clamp(14px,3vw,28px)" }}>
              <Metric val="10" valColor={C.teal} label="ACRES" />
              <Metric val="$195–330K" valColor={C.gold} label="PHASE 1" />
              <Metric val="9" valColor={C.violet} label="SCALES" />
              <Metric val="18mo" valColor={C.cyan} label="TIMELINE" />
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap", marginBottom: "clamp(14px,3vw,28px)" }}>
              <Pill>◈ PATENT PENDING</Pill>
              <Pill>◈ GRANT ELIGIBLE · 5 AGENCIES</Pill>
              <Pill tone="gold">✦ IN DEVELOPMENT SINCE MAY 2025</Pill>
            </div>
            <Divider />
            <div style={{ marginTop: "clamp(10px,2vw,22px)", fontFamily: FMONO, fontSize: "clamp(8px,1.1vw,11px)", letterSpacing: 3, color: "rgba(0,200,160,0.4)" }}>
              φ = 1.618033988 · Gradient → SOC → Fibonacci → SUNRISE → φ → ◈
            </div>
          </div>
        </div>
      </Slide>

      {/* NAV */}
      <div style={{
        position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)",
        display: "flex", alignItems: "center", gap: 10, zIndex: 100,
        background: "rgba(3,13,26,0.85)", border: `1px solid ${C.border}`,
        padding: "8px 16px", backdropFilter: "blur(20px)",
      }} data-testid="rc-nav">
        <button onClick={prev} aria-label="Previous slide" data-testid="rc-prev"
          style={{ fontFamily: FMONO, fontSize: 8, letterSpacing: 2, background: "transparent", border: "none", color: "rgba(0,200,160,0.5)", cursor: "pointer", padding: "2px 8px" }}>◀</button>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {Array.from({ length: TOTAL }, (_, i) => i + 1).map(i => (
            <button key={i} onClick={() => setCur(i)}
              aria-label={`Go to slide ${i}`} aria-pressed={cur === i}
              data-testid={`rc-dot-${i}`}
              style={{
                width: 8, height: 8, borderRadius: "50%",
                background: cur === i ? C.teal : "rgba(0,200,160,0.2)",
                border: `1px solid ${cur === i ? C.teal : "rgba(0,200,160,0.3)"}`,
                cursor: "pointer", padding: 0,
                boxShadow: cur === i ? `0 0 8px ${C.teal}` : "none",
                transition: "all 0.3s",
              }} />
          ))}
        </div>
        <button onClick={next} aria-label="Next slide" data-testid="rc-next"
          style={{ fontFamily: FMONO, fontSize: 8, letterSpacing: 2, background: "transparent", border: "none", color: "rgba(0,200,160,0.5)", cursor: "pointer", padding: "2px 8px" }}>▶</button>
        <div style={{ fontFamily: FMONO, fontSize: 8, letterSpacing: 3, color: "rgba(0,200,160,0.4)", padding: "0 8px" }} data-testid="rc-counter">
          {cur} / {TOTAL}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SLIDE WRAPPER
// ============================================================================

function Slide({ n, cur, setBg, children }: { n: number; cur: number; setBg: (el: HTMLCanvasElement | null) => void; children: ReactNode }) {
  const isOn = cur === n;
  return (
    <div data-testid={`rc-slide-${n}`}
         style={{
           position: "absolute", inset: 0, opacity: isOn ? 1 : 0,
           pointerEvents: isOn ? "auto" : "none",
           transition: "opacity 0.7s ease",
           overflow: "auto",
         }}>
      <canvas ref={setBg} style={{ position: "absolute", inset: 0, zIndex: 0, width: "100%", height: "100%" }} />
      <div style={{ position: "relative", zIndex: 2, width: "100%", minHeight: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// SHARED PRIMITIVES
// ============================================================================

function Tag({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontFamily: FMONO, fontSize: 8, letterSpacing: 5, color: "rgba(0,200,160,0.4)", marginBottom: 6, ...style }}>{children}</div>;
}
function Hero({ children }: { children: ReactNode }) {
  return <div style={{ fontFamily: FSERIF, fontSize: "clamp(40px,7vw,96px)", fontWeight: 300, letterSpacing: 4, color: C.bright, lineHeight: 0.95, textShadow: "0 0 60px rgba(0,200,160,0.3)" }}>{children}</div>;
}
function HeroSub({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontFamily: FSERIF, fontSize: "clamp(15px,2vw,26px)", fontWeight: 300, fontStyle: "italic", color: "rgba(0,200,160,0.7)", letterSpacing: 2, ...style }}>{children}</div>;
}
function Section({ children }: { children: ReactNode }) {
  return <div style={{ fontFamily: FSERIF, fontSize: "clamp(26px,4vw,54px)", fontWeight: 600, letterSpacing: 2, color: C.bright, lineHeight: 1.05 }}>{children}</div>;
}
function SectionSub({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontFamily: FONTS, fontSize: "clamp(12px,1.4vw,18px)", fontWeight: 300, color: C.text, lineHeight: 1.6, marginTop: 8, ...style }}>{children}</div>;
}
function Label({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ fontFamily: FMONO, fontSize: 8, letterSpacing: 3, color: "rgba(0,200,160,0.5)", ...style }}>{children}</div>;
}
function Divider({ w }: { w?: number }) {
  return <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(0,200,160,0.3), transparent)", margin: "12px 0", width: w ? `${w}px` : "100%" }} />;
}
function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <Label>{k}</Label>
      <div style={{ fontFamily: FSERIF, fontSize: "clamp(20px,2.7vw,34px)", fontWeight: 600, color: C.bright }}>{v}</div>
    </div>
  );
}

function Pill({ children, tone }: { children: ReactNode; tone?: "gold" | "plasma" }) {
  const conf = tone === "gold" ? { bd: "rgba(240,192,64,0.3)", col: C.gold, bg: "rgba(240,192,64,0.05)" }
              : tone === "plasma" ? { bd: "rgba(255,96,48,0.3)", col: C.plasma, bg: "rgba(255,96,48,0.05)" }
              : { bd: "rgba(0,200,160,0.25)", col: C.teal, bg: "rgba(0,200,160,0.05)" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", border: `1px solid ${conf.bd}`, background: conf.bg, fontFamily: FMONO, fontSize: 7, letterSpacing: 2, color: conf.col }}>
      {children}
    </span>
  );
}
function Arrow() { return <span style={{ color: "rgba(0,200,160,0.3)" }}>→</span>; }

function Card({ children, title, tone, style, icon }: { children: ReactNode; title?: string; tone?: "gold" | "plasma" | "violet" | ""; style?: React.CSSProperties; icon?: string }) {
  const accent = tone === "gold" ? C.gold : tone === "plasma" ? C.plasma : tone === "violet" ? C.violet : C.teal;
  const bd = tone === "gold" ? "rgba(240,192,64,0.15)" : tone === "plasma" ? "rgba(255,96,48,0.15)" : tone === "violet" ? "rgba(128,96,255,0.15)" : C.border;
  return (
    <div style={{ border: `1px solid ${bd}`, background: C.cardBg, padding: "clamp(12px,2vw,22px)", position: "relative", overflow: "hidden", ...style }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: accent }} />
      {icon && <div style={{ fontSize: "clamp(20px,3vw,36px)", marginBottom: 8 }}>{icon}</div>}
      {title && <div style={{ fontFamily: FSERIF, fontSize: "clamp(13px,1.8vw,22px)", fontWeight: 600, color: C.bright, marginBottom: 6 }}>{title}</div>}
      <div style={{ fontSize: "clamp(10px,1.2vw,14px)", color: C.text, lineHeight: 1.6 }}>{children}</div>
    </div>
  );
}
function SmallCard({ title, body }: { title: string; body: string }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.cardBg, padding: "10px 12px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: C.teal }} />
      <div style={{ fontFamily: FSERIF, fontSize: 13, fontWeight: 600, color: C.bright, marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 11, color: C.text, lineHeight: 1.55 }}>{body}</div>
    </div>
  );
}
function BigStat({ val, valColor, label, body, small }: { val: string; valColor: string; label: string; body: string; small?: boolean }) {
  return (
    <div style={{ border: `1px solid ${C.border}`, background: C.cardBg, padding: 12, position: "relative" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: valColor }} />
      <div style={{ fontSize: small ? 22 : 32, color: valColor, fontFamily: FSERIF, fontWeight: 600, lineHeight: 1 }}>{val}</div>
      <Label style={{ marginTop: 4 }}>{label}</Label>
      <div style={{ fontSize: 11, color: C.text, marginTop: 4, lineHeight: 1.5 }}>{body}</div>
    </div>
  );
}
function Metric({ val, valColor, label, sub }: { val: string; valColor: string; label: string; sub?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "clamp(12px,2vw,20px) clamp(16px,2.5vw,28px)", border: `1px solid ${C.border}`, background: C.cardBg, minWidth: 130 }}>
      <span style={{ display: "block", fontFamily: FSERIF, fontSize: "clamp(26px,4vw,52px)", fontWeight: 700, color: valColor, lineHeight: 1 }}>{val}</span>
      <div style={{ fontFamily: FMONO, fontSize: 7, letterSpacing: 3, color: C.text, marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontStyle: "italic", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Grid2({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(10px,2vw,24px)", ...style }}>{children}</div>;
}
function Grid3({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "clamp(8px,1.5vw,18px)", ...style }}>{children}</div>;
}

function Flow({ steps }: { steps: { icon: string; name: string; desc: string }[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
      {steps.map((s, i) => (
        <span key={i} style={{ display: "contents" }}>
          <div style={{ flex: 1, textAlign: "center", padding: "12px 8px", border: `1px solid ${C.borderSoft}`, background: "rgba(0,200,160,0.02)" }}>
            <div style={{ fontSize: "clamp(16px,2.5vw,28px)", marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: FMONO, fontSize: 9, letterSpacing: 2, color: C.teal }}>{s.name}</div>
            <div style={{ fontSize: 11, color: C.text, marginTop: 3 }}>{s.desc}</div>
          </div>
          {i < steps.length - 1 && <span style={{ color: "rgba(0,200,160,0.4)", fontSize: 18, padding: "0 4px" }}>→</span>}
        </span>
      ))}
    </div>
  );
}

function DataCard({ title, sub, body, color, setRef, tone }:
  { title: string; sub: string; body: string; color: string; setRef: (el: HTMLCanvasElement | null) => void; tone?: string }) {
  const accent = tone === "gold" ? C.gold : tone === "plasma" ? C.plasma : tone === "violet" ? C.violet : C.teal;
  const bd = tone === "gold" ? "rgba(240,192,64,0.15)" : tone === "plasma" ? "rgba(255,96,48,0.15)" : tone === "violet" ? "rgba(128,96,255,0.15)" : C.border;
  return (
    <div style={{ border: `1px solid ${bd}`, background: C.cardBg, padding: "clamp(12px,2vw,22px)", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, background: accent }} />
      <div style={{ fontFamily: FSERIF, fontSize: "clamp(13px,1.8vw,20px)", fontWeight: 600, color: C.bright, marginBottom: 4 }}>{title}</div>
      <Label>{sub}</Label>
      <div style={{ fontSize: "clamp(10px,1.2vw,13px)", color: C.text, lineHeight: 1.55, marginTop: 8 }}>{body}</div>
      <canvas ref={setRef} data-color={color} style={{ width: "100%", height: 40, marginTop: 8, display: "block" }} />
    </div>
  );
}

function WaveBox({ label, cvRef }: { label: string; cvRef: React.RefObject<HTMLCanvasElement> }) {
  return (
    <div style={{ position: "relative", border: `1px solid ${C.border}`, overflow: "hidden", flex: 1, minHeight: 100 }}>
      <div style={{ position: "absolute", top: 8, left: 10, fontFamily: FMONO, fontSize: 7, letterSpacing: 3, color: "rgba(0,200,160,0.4)", zIndex: 2 }}>{label}</div>
      <canvas ref={cvRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

function Th({ children }: { children: ReactNode }) {
  return <th style={{ fontFamily: FMONO, fontSize: 7, letterSpacing: 3, color: "rgba(0,200,160,0.5)", padding: "8px 12px", borderBottom: "1px solid rgba(0,200,160,0.1)", textAlign: "left" }}>{children}</th>;
}
function Tr({ a, p, amt, angle }: { a: string; p: string; amt: string; angle: string }) {
  return (
    <tr>
      <Td bright>{a}</Td><Td>{p}</Td><Td amt>{amt}</Td><Td>{angle}</Td>
    </tr>
  );
}
function Td({ children, bright, amt }: { children: ReactNode; bright?: boolean; amt?: boolean }) {
  return <td style={{
    padding: "8px 12px", borderBottom: "1px solid rgba(255,255,255,0.03)",
    fontSize: "clamp(10px,1.2vw,13px)",
    color: bright ? C.bright : amt ? C.teal : C.text,
    fontWeight: bright ? 500 : 400,
    fontFamily: amt ? FMONO : FONTS,
  }}>{children}</td>;
}

function TLItem({ phase, title, desc, pills, gold, pillTone }:
  { phase: string; title: string; desc: string; pills: string[]; gold?: boolean; pillTone?: "gold" }) {
  const dotCol = gold ? C.gold : C.teal;
  return (
    <div style={{ display: "flex", gap: 16, padding: "12px 0", position: "relative" }}>
      <div style={{
        width: 10, height: 10, borderRadius: "50%",
        border: `2px solid ${dotCol}`,
        background: C.navy, flexShrink: 0, marginTop: 3,
        position: "relative", zIndex: 1,
        boxShadow: `0 0 8px ${dotCol}66`,
        marginLeft: -36 + 11,
      }} />
      <div>
        <div style={{ fontFamily: FMONO, fontSize: 7, letterSpacing: 3, color: gold ? "rgba(240,192,64,0.5)" : "rgba(0,200,160,0.5)" }}>{phase}</div>
        <div style={{ fontFamily: FSERIF, fontSize: "clamp(14px,2vw,22px)", fontWeight: 600, color: gold ? C.gold : C.bright, margin: "2px 0" }}>{title}</div>
        <div style={{ fontSize: "clamp(10px,1.1vw,13px)", color: C.text, lineHeight: 1.5 }}>{desc}</div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {pills.map((p, i) => <Pill key={i} tone={pillTone}>{p}</Pill>)}
        </div>
      </div>
    </div>
  );
}

function ProgRow({ label, pct, color, stamp }: { label: string; pct: number; color: string; stamp: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
      <div style={{ fontFamily: FMONO, fontSize: 7, letterSpacing: 2, width: 120, flexShrink: 0, color: C.text }}>{label}</div>
      <div style={{ flex: 1, height: 2, background: "rgba(255,255,255,0.05)", borderRadius: 1, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 1 }} />
      </div>
      <div style={{ fontFamily: FMONO, fontSize: 8, color: C.teal, width: 50, textAlign: "right" }}>{stamp}</div>
    </div>
  );
}

function ZoneList() {
  const zones = [
    { id: "A", name: "NEXUS CORE",   color: "#f0c040" },
    { id: "B", name: "SOLAR ARRAY",  color: "#ffd700" },
    { id: "C", name: "GROUND GRID",  color: "#40c870" },
    { id: "D", name: "WATER",        color: "#00e5ff" },
    { id: "E", name: "ATMOSPHERIC",  color: "#60d8a8" },
    { id: "F", name: "BIO ZONE",     color: "#00ffb3" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
      {zones.map(z => (
        <div key={z.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", border: `1px solid ${z.color}22`, background: `${z.color}08` }}>
          <span style={{ fontFamily: FMONO, fontSize: 9, color: z.color, minWidth: 14, fontWeight: 700 }}>{z.id}</span>
          <span style={{ fontFamily: FMONO, fontSize: 8, letterSpacing: 1, color: `${z.color}99` }}>{z.name}</span>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// CANVAS DRAWERS
// ============================================================================

function fitCanvas(c: HTMLCanvasElement) {
  const dpr = window.devicePixelRatio || 1;
  const r = c.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return null;
  const W = Math.floor(r.width * dpr), H = Math.floor(r.height * dpr);
  if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W: r.width, H: r.height };
}

function drawSharedBG(c: HTMLCanvasElement, t: number, variant: number, stars: StarP[]) {
  const f = fitCanvas(c); if (!f) return;
  const { ctx, W, H } = f;
  ctx.clearRect(0, 0, W, H);
  // base gradient
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, "#020c18");
  g.addColorStop(0.5, "#030d1a");
  g.addColorStop(1, "#020b16");
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // nebula
  const hue = HUES[variant] || 170;
  const ng = ctx.createRadialGradient(W * 0.7, H * 0.3, 0, W * 0.7, H * 0.3, W * 0.5);
  ng.addColorStop(0, `hsla(${hue},80%,30%,0.08)`);
  ng.addColorStop(0.5, `hsla(${hue},70%,20%,0.04)`);
  ng.addColorStop(1, "transparent");
  ctx.fillStyle = ng; ctx.fillRect(0, 0, W, H);
  // stars
  for (const s of stars) {
    const a = 0.15 + 0.5 * (0.5 + 0.5 * Math.sin(t * s.sp + s.ph));
    ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(180,220,255,${a})`; ctx.fill();
  }
  // flow lines
  if (variant === 0) {
    for (let i = 0; i < 8; i++) {
      const y = H * (0.2 + i * 0.08);
      ctx.beginPath(); ctx.moveTo(0, y);
      for (let x = 0; x < W; x += 10) {
        const wave = Math.sin(x * 0.003 + t * 0.3 + i) * 20 * (1 - x / W);
        ctx.lineTo(x, y + wave);
      }
      ctx.strokeStyle = `rgba(0,200,160,${0.02 + i * 0.005})`;
      ctx.lineWidth = 1; ctx.stroke();
    }
  } else {
    ctx.strokeStyle = "rgba(0,200,160,0.025)"; ctx.lineWidth = 0.5;
    for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    for (let i = 0; i < 4; i++) {
      const ox = (t * 30 + i * 200) % W;
      ctx.beginPath(); ctx.moveTo(ox, 0); ctx.lineTo(ox + H * 0.5, H);
      ctx.strokeStyle = "rgba(0,200,160,0.03)"; ctx.lineWidth = 1; ctx.stroke();
    }
  }
  // scanline overlay
  ctx.fillStyle = "rgba(0,0,0,0.012)";
  for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
}

function drawInsight(c: HTMLCanvasElement | null, t: number) {
  if (!c) return;
  const f = fitCanvas(c); if (!f) return;
  const { ctx, W, H } = f;
  ctx.clearRect(0, 0, W, H);
  const scales = [
    { name: "QUANTUM",     y: 0.12, color: "#c8a040" },
    { name: "CELLULAR",    y: 0.25, color: "#00e5ff" },
    { name: "BIOLOGICAL",  y: 0.38, color: "#00ffb3" },
    { name: "FAMILY",      y: 0.51, color: "#d4a030" },
    { name: "ATMOSPHERIC", y: 0.64, color: "#60d8a8" },
    { name: "EARTH",       y: 0.77, color: "#40c870" },
    { name: "COSMIC",      y: 0.90, color: "#b050ff" },
  ];
  scales.forEach((sc, i) => {
    const y = sc.y * H;
    ctx.beginPath(); ctx.moveTo(0, y);
    for (let x = 0; x < W; x++) {
      const phase = t * (0.3 + i * 0.04);
      const amp = H * 0.03 * (0.5 + 0.5 * Math.sin(t * 0.5 + i));
      const wave = Math.sin(x * 0.02 + phase + i * PHI) * amp;
      ctx.lineTo(x, y + wave);
    }
    ctx.strokeStyle = sc.color + "aa"; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.font = `700 8px ${FMONO}`;
    ctx.fillStyle = sc.color + "99"; ctx.textAlign = "left";
    ctx.fillText(sc.name, 6, y - 4);
  });
  ctx.font = `600 9px ${FMONO}`;
  ctx.fillStyle = "rgba(0,200,160,0.4)"; ctx.textAlign = "center";
  ctx.fillText("Gradient → SOC → φ-Lock → Dome", W / 2, H - 8);
}

function drawZone(c: HTMLCanvasElement | null, t: number) {
  if (!c) return;
  const parent = c.parentElement; if (!parent) return;
  const targetW = parent.offsetWidth - 2;
  const targetH = Math.min(targetW * 0.6, 320);
  c.style.height = targetH + "px";
  const f = fitCanvas(c); if (!f) return;
  const { ctx, W, H } = f;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "rgba(0,200,160,0.02)"; ctx.fillRect(0, 0, W, H);
  const zones = [
    { id: "A", name: "NEXUS CORE",   x: 0.35, y: 0.35, w: 0.18, h: 0.25, color: "#f0c040" },
    { id: "B", name: "SOLAR ARRAY",  x: 0.02, y: 0.08, w: 0.22, h: 0.20, color: "#ffd700" },
    { id: "C", name: "GROUND GRID",  x: 0.58, y: 0.55, w: 0.38, h: 0.22, color: "#40c870" },
    { id: "D", name: "WATER",        x: 0.58, y: 0.10, w: 0.18, h: 0.35, color: "#00e5ff" },
    { id: "E", name: "ATMOSPHERIC",  x: 0.02, y: 0.55, w: 0.20, h: 0.38, color: "#60d8a8" },
    { id: "F", name: "BIO ZONE",     x: 0.25, y: 0.65, w: 0.28, h: 0.28, color: "#00ffb3" },
  ];
  // perimeter
  ctx.setLineDash([4, 8]);
  ctx.strokeStyle = "rgba(0,200,160,0.25)"; ctx.lineWidth = 1;
  ctx.strokeRect(0.02 * W, 0.02 * H, 0.96 * W, 0.96 * H);
  ctx.setLineDash([]);
  // zones
  for (const z of zones) {
    const x = z.x * W, y = z.y * H, w = z.w * W, h = z.h * H;
    ctx.fillStyle = z.color + "18"; ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = z.color + "55"; ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
    ctx.font = `700 ${Math.max(7, Math.min(11, w / 8))}px ${FMONO}`;
    ctx.fillStyle = z.color; ctx.textAlign = "center";
    ctx.fillText(z.id, x + w / 2, y + h / 2 - 2);
    ctx.font = `500 ${Math.max(5, Math.min(7, w / 10))}px ${FMONO}`;
    ctx.fillStyle = z.color + "99";
    ctx.fillText(z.name, x + w / 2, y + h / 2 + 10);
  }
  // pulse on nexus
  const A = zones[0];
  const pulse = 0.5 + 0.5 * Math.sin(t * 1.5);
  ctx.beginPath();
  ctx.arc(A.x * W + (A.w * W) / 2, A.y * H + (A.h * H) / 2, 16 * pulse, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(240,192,64,${0.4 * pulse})`;
  ctx.lineWidth = 1; ctx.stroke();
}

function drawMini(c: HTMLCanvasElement | null, t: number, i: number) {
  if (!c) return;
  const f = fitCanvas(c); if (!f) return;
  const { ctx, W, H } = f;
  const color = c.getAttribute("data-color") || C.teal;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath(); ctx.moveTo(0, H / 2);
  for (let x = 0; x < W; x++) {
    const y = H / 2 + Math.sin(x * 0.04 + t * (0.4 + i * 0.15)) * H * 0.3 *
              (0.5 + 0.5 * Math.sin(x * 0.01 + t * 0.2));
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color + "cc"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.lineTo(W, H); ctx.lineTo(0, H);
  ctx.fillStyle = color + "18"; ctx.fill();
}

function drawCoherence(c: HTMLCanvasElement | null) {
  if (!c) return;
  const f = fitCanvas(c); if (!f) return;
  const { ctx, W, H } = f;
  ctx.clearRect(0, 0, W, H);
  ctx.beginPath(); ctx.moveTo(0, H * 0.7);
  for (let x = 0; x < W; x++) {
    const noise = Math.random() * H * 0.06;
    const base = H * 0.65 + Math.sin(x * 0.05) * H * 0.04 + noise;
    const spike = (x > W * 0.5 && x < W * 0.6)
      ? H * (0.65 - Math.exp(-Math.pow((x - W * 0.55) / (W * 0.04), 2)) * 0.55)
      : 0;
    ctx.lineTo(x, base - spike);
  }
  ctx.strokeStyle = "#00c8a0cc"; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.font = `7px ${FMONO}`; ctx.fillStyle = "rgba(0,200,160,0.6)"; ctx.textAlign = "center";
  ctx.fillText("PEAK RESONANCE EVENT", W * 0.55, H * 0.18);
}
function drawCross(c: HTMLCanvasElement | null, t: number) {
  if (!c) return;
  const f = fitCanvas(c); if (!f) return;
  const { ctx, W, H } = f;
  ctx.clearRect(0, 0, W, H);
  const lines: [string, number, number][] = [["#00c8a0", 0, 1], ["#f0c040", 0.8, 0.8], ["#60d8a8", 1.6, 0.9]];
  for (const [col, ph, amp] of lines) {
    ctx.beginPath(); ctx.moveTo(0, H / 2);
    for (let x = 0; x < W; x++) {
      ctx.lineTo(x, H / 2 + Math.sin(x * 0.025 + t * 0.3 + ph) * H * 0.28 * amp);
    }
    ctx.strokeStyle = col + "bb"; ctx.lineWidth = 1.5; ctx.stroke();
  }
}
function drawAnomaly(c: HTMLCanvasElement | null) {
  if (!c) return;
  const f = fitCanvas(c); if (!f) return;
  const { ctx, W, H } = f;
  ctx.clearRect(0, 0, W, H);
  const az = W * 0.6;
  ctx.beginPath(); ctx.moveTo(0, H / 2);
  for (let x = 0; x < W; x++) {
    const noise = (Math.random() - 0.5) * H * 0.15;
    const inA = x > az && x < az + W * 0.2;
    const extra = inA ? (Math.random() - 0.5) * H * 0.5 : 0;
    ctx.lineTo(x, H / 2 + noise + extra);
  }
  ctx.strokeStyle = "rgba(200,220,255,0.5)"; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = "rgba(255,60,30,0.12)"; ctx.fillRect(az, 0, W * 0.2, H);
  ctx.font = `7px ${FMONO}`; ctx.fillStyle = "rgba(255,96,48,0.85)"; ctx.textAlign = "center";
  ctx.fillText("SIGNAL ANOMALY DETECTED", az + W * 0.1, H * 0.18);
  ctx.fillStyle = "rgba(255,96,48,0.6)"; ctx.fillRect(az + W * 0.06, H * 0.7, W * 0.08, H * 0.14);
  ctx.fillStyle = "white"; ctx.fillText("ALERT", az + W * 0.1, H * 0.795);
}

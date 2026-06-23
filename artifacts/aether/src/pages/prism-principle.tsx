import { useEffect, useRef } from "react";
import tweetPrism  from "@assets/image_1782209138824.png";
import tweetReg    from "@assets/image_1782209603008.png";
import noteBoho    from "@assets/prism_boho_formula.jpg";
import noteMental  from "@assets/prism_mental_protocol.jpg";
import noteLaunch  from "@assets/prism_launch_sequence.jpg";
import noteAuto    from "@assets/prism_automation.jpg";

/* ── palette ─────────────────────────────────── */
const BG   = "#040407";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const RED  = "#ef4444";
const ORG  = "#f97316";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const EMR  = "#10b981";  /* emerald — boho */
const IND  = "#6366f1";  /* indigo  — aether */
const ROSE = "#f43f5e";  /* rose    — personal */
const DIM  = "#38465a";
const MN   = "'Space Mono', monospace";
const OR   = "'Orbitron', sans-serif";

/* ── 5-element system ────────────────────────── */
const ELEMENTS = [
  { name:"Boho",     col:EMR,  label:"Emerald",  desc:"Nature · Bloom · Earthy rhythm · organic beauty" },
  { name:"Cosmic",   col:GOLD, label:"Gold",      desc:"Stars · Time · Expansive wonder · celestial order" },
  { name:"AETHER",   col:IND,  label:"Indigo",    desc:"Coherence · Knowledge · Crystallised intelligence" },
  { name:"Personal", col:ROSE, label:"Rose",      desc:"Story · Mirror · Human truth in structural form" },
  { name:"Elemental",col:TEAL, label:"Teal",      desc:"Root · Grounding · Essential life pattern" },
] as const;

/* ── animated prism canvas ───────────────────── */
function PrismCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 800; cv.height = 280;
    const W = cv.width, H = cv.height;
    let t = 0;

    // prism geometry
    const px = W * 0.42, py = H * 0.5;  // prism centre
    const pr = 60;                         // prism half-width

    // output beam colours (spectrum + 5 elements merged)
    const beams = [
      { col:"#c084fc", label:"UV / 380nm" },
      { col:"#7c3aed", label:"Violet" },
      { col:"#2563eb", label:"Blue" },
      { col:EMR,       label:"Boho · Emerald" },
      { col:"#ca8a04", label:"Yellow" },
      { col:GOLD,      label:"Cosmic · Gold" },
      { col:ORG,       label:"Orange" },
      { col:ROSE,      label:"Personal · Rose" },
      { col:IND,       label:"AETHER · Indigo" },
      { col:TEAL,      label:"Elemental · Teal" },
      { col:"#dc2626", label:"Red / 780nm" },
    ];

    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // ── incoming white beam ──
      const beamY = py;
      const beamX0 = 60;
      const beamX1 = px - pr - 10;
      const beamW = 18;
      const bpulse = 0.7 + 0.3 * Math.sin(t * 0.03);
      const bgrad = ctx.createLinearGradient(beamX0, 0, beamX1, 0);
      bgrad.addColorStop(0, `rgba(255,255,255,0)`);
      bgrad.addColorStop(0.5, `rgba(255,255,255,${0.55 * bpulse})`);
      bgrad.addColorStop(1, `rgba(255,255,255,${0.3 * bpulse})`);
      ctx.fillStyle = bgrad;
      ctx.fillRect(beamX0, beamY - beamW / 2, beamX1 - beamX0, beamW);

      // ── prism triangle ──
      const pw = pr;
      ctx.beginPath();
      ctx.moveTo(px - pw, py + pw * 0.9);
      ctx.lineTo(px + pw, py + pw * 0.9);
      ctx.lineTo(px, py - pw * 0.9);
      ctx.closePath();
      const pg = ctx.createLinearGradient(px - pw, 0, px + pw, 0);
      pg.addColorStop(0, "rgba(120,160,220,0.15)");
      pg.addColorStop(0.5, "rgba(180,200,255,0.25)");
      pg.addColorStop(1, "rgba(120,160,220,0.15)");
      ctx.fillStyle = pg; ctx.fill();
      ctx.strokeStyle = "rgba(180,200,255,0.5)"; ctx.lineWidth = 1.5; ctx.stroke();

      // ── PRISM label ──
      ctx.fillStyle = "rgba(180,200,255,0.4)";
      ctx.font = "7px Orbitron"; ctx.textAlign = "center";
      ctx.fillText("PRISM", px, py + pw * 0.9 + 14);

      // ── outgoing spectrum beams ──
      const exitX = px + pw + 8;
      const totalSpread = H * 0.72;
      const yTop = py - totalSpread / 2;

      beams.forEach((beam, i) => {
        const frac = i / (beams.length - 1);
        const targetY = yTop + frac * totalSpread;
        const pulse = 0.55 + 0.3 * Math.sin(t * 0.035 + i * 0.6);

        // moving photon dot
        const dotFrac = ((t * 0.012 + i * 0.09) % 1);
        const dotX = exitX + (W * 0.9 - exitX) * dotFrac;
        const dotY = py + (targetY - py) * dotFrac;
        ctx.beginPath(); ctx.arc(dotX, dotY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = beam.col; ctx.fill();

        // beam line
        ctx.beginPath();
        ctx.moveTo(exitX, py);
        ctx.lineTo(W * 0.9, targetY);
        ctx.strokeStyle = beam.col + Math.round(pulse * 160).toString(16).padStart(2, "0");
        ctx.lineWidth = i % 3 === 0 ? 2 : 1.2;
        ctx.stroke();

        // label at right edge
        ctx.fillStyle = beam.col + "cc";
        ctx.font = `${beam.label.includes("·") ? "bold " : ""}7.5px Space Mono`;
        ctx.textAlign = "left";
        ctx.fillText(beam.label, W * 0.9 + 6, targetY + 3);
      });

      // ── "WHITE LIGHT" label ──
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.font = "8px Orbitron"; ctx.textAlign = "center";
      ctx.fillText("WHITE LIGHT", (beamX0 + beamX1) / 2, beamY - 14);

      // ── key insight ──
      ctx.fillStyle = "rgba(255,255,255,0.18)";
      ctx.font = "italic 9px Crimson Pro, Georgia, serif";
      ctx.textAlign = "center";
      ctx.fillText('"The spectrum already existed before it was resolved"', W * 0.29, H - 10);

      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── 4A mental protocol node ─────────────────── */
function FourA({ letter, word, col, desc }: { letter: string; word: string; col: string; desc: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%",
        background: `${col}20`, border: `2px solid ${col}99`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: OR, fontSize: 18, fontWeight: 900, color: col }}>
        {letter}
      </div>
      <div style={{ fontFamily: OR, fontSize: 9, color: col, letterSpacing: 1 }}>{word}</div>
      <div style={{ fontSize: 10.5, color: "rgba(180,190,210,0.65)", textAlign: "center", lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}

/* ── page ─────────────────────────────────────── */
export default function PrismPrinciplePage() {
  const card = (col = TEAL): React.CSSProperties => ({
    background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 7.5, letterSpacing: "0.2em", color: DIM,
    textTransform: "uppercase", marginBottom: 10, paddingBottom: 4,
    borderBottom: "1px solid rgba(31,212,200,0.1)",
  };
  const h2 = (col = TEAL): React.CSSProperties => ({
    fontFamily: OR, fontSize: 11, color: col, letterSpacing: 1, margin: "0 0 8px",
  });
  const body: React.CSSProperties = {
    fontSize: 11.5, color: "rgba(200,210,225,0.72)", lineHeight: 1.7,
  };
  const quote = (col = GOLD): React.CSSProperties => ({
    borderLeft: `2px solid ${col}66`, paddingLeft: 12, margin: "10px 0",
    fontStyle: "italic", fontSize: 12, color: `${col}cc`, lineHeight: 1.7,
  });

  return (
    <div style={{ minHeight: "100%", background: BG, color: "#d4e4f4", fontFamily: "'Rajdhani',sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px" }}>

        {/* ── title ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "inline-block", border: `1px solid ${VIO}66`,
            padding: "3px 10px", fontSize: 9, letterSpacing: "0.2em",
            color: `${VIO}cc`, fontFamily: MN, marginBottom: 8 }}>
            PRISM PRINCIPLE · EMERGENT UNITY · REGULATORY DEPTH
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 21, fontWeight: 900, letterSpacing: 2,
            color: VIO, textShadow: `0 0 24px ${VIO}44`, margin: "4px 0 6px" }}>
            The Prism Principle · White Light, Hidden Structure, Regulatory Depth
          </h1>
          <p style={{ ...body, maxWidth: 820, margin: 0 }}>
            White light appears unified — a prism reveals it is a <em>composition</em>. This is not chaos; it is hidden structure made visible by the right instrument. The same principle operates in biology (regulatory depth), in the AETHER system (5-element OS), and in personal operating practice (launch sequence, mental protocol). Unity is <strong style={{ color: VIO }}>emergent, not primitive</strong>.
          </p>
        </div>

        {/* ── prism canvas ── */}
        <div style={{ ...card(VIO), marginBottom: 14 }}>
          <div style={secLabel}>Prism Decomposition · White Light → Spectrum + 5 AETHER Elements · Animated</div>
          <PrismCanvas />
        </div>

        {/* ── two tweets + optic lessons ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

          {/* tweet 1 + optic lessons */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={card(VIO)}>
              <div style={secLabel}>@StrategicProce · 12/14/25 · Optics as Universal Principle</div>
              <img src={tweetPrism} alt="Prism tweet" style={{ width: "100%", borderRadius: 3, marginBottom: 10, opacity: 0.9 }} />
              <h2 style={h2(VIO)}>4 Lessons from Optics</h2>
              {[
                { n:"1", t:"Unity can be emergent, not primitive",
                  b:"White light feels like one thing. It isn't. Apparent unity is often a composition — a convergence of many frequencies that appear indistinguishable at the surface level. Systems that look monolithic are almost always stratified." },
                { n:"2", t:"Decomposition reveals structure, not chaos",
                  b:"When a prism splits white light, the result is order — the spectrum is perfectly sorted by wavelength. Decomposition is not destruction. It is resolution. It reveals the architecture that was always present." },
                { n:"3", t:"The observer's instrument determines what is revealed",
                  b:"A glass prism reveals the visible spectrum. A diffraction grating reveals finer structure. UV photography reveals what the naked eye cannot see. The instrument shapes the revelation — not the light itself. AETHER is an instrument." },
                { n:"4", t:"The spectrum already existed before it was resolved",
                  b:"Nothing was added to the white light. The spectrum was always inside it. Resolution is not creation — it is recognition. Every insight, every model, every theory: the structure was already there, waiting for the right instrument to read it." },
              ].map(({ n, t, b }) => (
                <div key={n} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                    <span style={{ fontFamily: OR, fontSize: 10, color: VIO, flexShrink: 0 }}>{n}.</span>
                    <span style={{ fontFamily: MN, fontSize: 8.5, color: VIO }}>{t}</span>
                  </div>
                  <div style={{ ...body, fontSize: 10.5, marginTop: 3, paddingLeft: 18 }}>{b}</div>
                </div>
              ))}
              <div style={quote(VIO)}>
                "This pattern repeats identically in spacetime, gravity, and quantum physics."
                <div style={{ fontFamily: MN, fontSize: 7.5, color: VIO + "88", marginTop: 4 }}>
                  — Spacetime: apparent flat geometry decomposes into curved metric · Gravity: apparent force decomposes into geodesic curvature · Quantum: apparent particle decomposes into probability amplitude
                </div>
              </div>
            </div>
          </div>

          {/* tweet 2 + regulatory depth */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={card(GRN)}>
              <div style={secLabel}>@StrategicProce · 12/17/25 · Regulatory Depth · The Real Biological Levers</div>
              <img src={tweetReg} alt="Regulatory depth tweet" style={{ width: "100%", borderRadius: 3, marginBottom: 10, opacity: 0.9 }} />
              <h2 style={h2(GRN)}>What we "need" is regulatory depth</h2>
              <div style={{ ...body, marginBottom: 10 }}>
                Genes are not the fundamental unit of biological output — <strong style={{ color: GRN }}>regulation</strong> is. The 20,000 human protein-coding genes produce &gt;100,000 distinct proteins and millions of regulatory interactions. The lever is not the gene; it is the switch that controls when and how the gene speaks.
              </div>
              {[
                { col: TEAL,  t:"Epigenetic switches",
                  sub:"When genes turn on/off",
                  b:"DNA methylation, histone acetylation, chromatin remodelling — these determine gene accessibility without changing the DNA sequence. Light, stress, diet, and experience all write to the epigenome. This is the biological equivalent of the prism: the same genome, resolved differently by different environmental instruments." },
                { col: BLUE,  t:"Alternative splicing",
                  sub:"One gene → many outputs",
                  b:"Pre-mRNA can be cut and joined in different configurations, producing different proteins from one gene template. The DSCAM gene in Drosophila can produce ~38,016 distinct isoforms from a single gene. One gene is not one function — it is a composition." },
                { col: GRN,   t:"Non-coding RNA",
                  sub:"microRNAs · lncRNAs",
                  b:"~98% of transcribed RNA is non-coding. microRNAs (~22 nt) silence specific mRNAs post-transcriptionally — one microRNA can regulate hundreds of targets simultaneously. lncRNAs regulate chromatin structure, splicing, and transcription. This is the regulatory dark matter — invisible until the right instrument is applied." },
                { col: PINK,  t:"Feedback loops across systems",
                  sub:"Immune · Neural · Hormonal",
                  b:"No biological system is isolated. The HPA axis (hypothalamic-pituitary-adrenal) connects stress perception to immune modulation to metabolic state. Cytokines cross the blood-brain barrier to modulate mood. Light suppresses melatonin, which modulates immune surveillance. Adaptability, cognition, resilience, and intuition live in these cross-system feedback loops — not in any single gene." },
              ].map(({ col, t, sub, b }) => (
                <div key={t} style={{ background: `${col}10`, border: `1px solid ${col}33`,
                  borderRadius: 4, padding: "8px 12px", marginBottom: 8 }}>
                  <div style={{ fontFamily: MN, fontSize: 8.5, color: col, fontWeight: 700 }}>{t}</div>
                  <div style={{ fontFamily: MN, fontSize: 7.5, color: col + "88", marginBottom: 4 }}>{sub}</div>
                  <div style={{ ...body, fontSize: 10.5 }}>{b}</div>
                </div>
              ))}
              <div style={quote(GRN)}>
                "This is where adaptability, cognition, resilience, and even intuition live biologically."
              </div>
            </div>
          </div>
        </div>

        {/* ── 5-element system + launch sequence ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

          {/* 5-element OS */}
          <div style={card(GOLD)}>
            <div style={secLabel}>AETHER as Emotional OS · 5-Element · 5-Time System · Handwritten Notes Oct 2025</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <img src={noteLaunch} alt="Launch sequence notes" style={{ width: "48%", borderRadius: 3, opacity: 0.85 }} />
              <img src={noteBoho}   alt="Boho formula notes"   style={{ width: "48%", borderRadius: 3, opacity: 0.85 }} />
            </div>
            <div style={quote(GOLD)}>
              "I have a 5-element, 5-time system, two architectures at once. AETHER: Emotional OS. Personal Brand: mirrors structure in human form."
            </div>
            <h2 style={{ ...h2(GOLD), marginTop: 10 }}>5 Elements · Distinct Color Tones · Content Architecture</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ELEMENTS.map(el => (
                <div key={el.name} style={{ display: "flex", gap: 10, alignItems: "center",
                  background: `${el.col}10`, border: `1px solid ${el.col}33`,
                  borderRadius: 4, padding: "7px 12px" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%",
                    background: el.col, boxShadow: `0 0 6px ${el.col}`, flexShrink: 0 }} />
                  <div>
                    <span style={{ fontFamily: OR, fontSize: 9.5, color: el.col, letterSpacing: 1 }}>{el.name}</span>
                    <span style={{ fontFamily: MN, fontSize: 7.5, color: el.col + "88", marginLeft: 8 }}>— {el.label}</span>
                    <div style={{ ...body, fontSize: 10, marginTop: 2 }}>{el.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, ...body, fontSize: 10.5 }}>
              <strong style={{ color: GOLD }}>Boho Formula slots</strong> (10/21/25): Pastel · Purple · Pink · Blue★ · Cinnamon · Turquoise★ · Terracotta · Crème. Each slot holds an infinity (∞) of iterations — starred (★) slots are priority anchors.
            </div>
          </div>

          {/* mental protocol + launch sequence */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

            {/* 4A mental protocol */}
            <div style={card(RED)}>
              <div style={secLabel}>Mental Emergency Protocol · Handwritten Oct 2025</div>
              <img src={noteMental} alt="Mental protocol notes" style={{ width: "100%", borderRadius: 3, marginBottom: 12, opacity: 0.85 }} />
              <h2 style={h2(RED)}>4A Framework · Reliable Process Under Emotional Pressure</h2>
              <div style={{ ...body, fontSize: 10.5, marginBottom: 14 }}>
                Scientist mode and Prosecutor mode are two states. Prosecutor mode = mean mode — write down what happened. The reliable process when things are emotionally heightened:
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
                <FourA letter="A" word="Acknowledge" col={BLUE}
                  desc="Name what is happening. Write it down. Scientist mode — observe without judgment." />
                <FourA letter="A" word="Analyze"     col={VIO}
                  desc="Examine the data. What is actually true vs what feels true? Separate signal from noise." />
                <FourA letter="A" word="Adjust"      col={GOLD}
                  desc="Identify the one lever to move. Not everything — the minimum effective adjustment." />
                <FourA letter="A" word="Advance"     col={GRN}
                  desc="Act from the adjusted state. Move forward. First act: not that bad." />
              </div>
              <div style={{ ...body, fontSize: 10.5, marginTop: 12, padding: "8px 10px",
                background: `${RED}12`, borderRadius: 4, borderLeft: `2px solid ${RED}55` }}>
                The 4A framework is the emotional prism: it decomposes a charged moment into structured states — each one visible, separable, actionable. Unity (the overwhelm) is emergent from four distinct phases.
              </div>
            </div>

            {/* launch sequence */}
            <div style={card(TEAL)}>
              <div style={secLabel}>Solidified Launch Sequence v1.0 · Daily Attention Protocol</div>
              <h2 style={h2(TEAL)}>Attention First 30 min · Core Morning Architecture</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {[
                  { step:"1", act:"Hydrate",                col:BLUE,  note:"Physical substrate first — the body is the operating environment" },
                  { step:"2", act:"Stretch",                col:TEAL,  note:"Kinetic coherence — proprioceptive priming for attention" },
                  { step:"3", act:"Breathe",                col:GRN,   note:"Autonomic regulation — HRV reset, vagal tone, HPA calibration" },
                  { step:"4", act:"Mentally call up elements", col:VIO,   note:"Activate the 5-element OS — call the architecture into working memory" },
                  { step:"5", act:"Do the info",            col:GOLD,  note:"Input the day's signal — what the world is saying right now" },
                ].map(({ step, act, col, note }) => (
                  <div key={step} style={{ display: "flex", gap: 10, alignItems: "flex-start",
                    background: `${col}0d`, border: `1px solid ${col}22`, borderRadius: 3, padding: "7px 10px" }}>
                    <div style={{ fontFamily: OR, fontSize: 10, color: col, minWidth: 16 }}>{step}</div>
                    <div>
                      <div style={{ fontFamily: MN, fontSize: 8.5, color: col }}>{act}</div>
                      <div style={{ ...body, fontSize: 10 }}>{note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* automation note */}
            <div style={card(ORG)}>
              <div style={secLabel}>Automation · Task Scheduler · Oct 21 2025 · 4:46PM</div>
              <div style={{ display: "flex", gap: 10 }}>
                <img src={noteAuto} alt="Automation notes" style={{ width: "42%", borderRadius: 3, opacity: 0.85 }} />
                <div style={{ flex: 1 }}>
                  <h2 style={h2(ORG)}>Windows Task Scheduler · Content Automation</h2>
                  <div style={{ ...body, fontSize: 10.5, marginBottom: 8 }}>
                    Start: <strong style={{ color: ORG }}>10/21/2025 @ 8:08:08 PM</strong><br/>
                    Sync across time zones ♥<br/>
                    Computer must be set to wake from sleep at trigger time.
                  </div>
                  <div style={{ fontFamily: MN, fontSize: 8, color: ORG + "88", lineHeight: 1.9,
                    background: "rgba(0,0,0,0.4)", borderRadius: 3, padding: "8px 10px" }}>
                    Win + R → taskschd.msc → Enter<br/>
                    Click "Task Scheduler Library"<br/>
                    Click "Create Basic Task"<br/>
                    Trigger: Daily / One-Time / Weekly<br/>
                    Set recurring module, date + time<br/>
                    <span style={{ color: RED + "aa" }}>⚠ Computer must be set to wake from sleep</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── AETHER synthesis ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { col:VIO,  t:"The Prism Principle Across Scales",
              b:"White light → prism → spectrum. DNA → regulatory apparatus → phenotype. AETHER OS → 5 elements → content + cognition. At every scale, what appears unified is a hidden composition. The instrument of resolution determines what becomes visible. AETHER is designed to be that instrument — the prism for knowledge." },
            { col:GRN,  t:"Regulatory Depth = Prism for Biology",
              b:"Genes are like white light — you can't see what's inside without the right instrument. Epigenetic switches are the prism. Alternative splicing is the diffraction grating. microRNAs are the spectrophotometer. Each instrument reveals a different layer of the hidden composition. Adaptability and intuition are not mysterious — they are the emergent output of deep regulatory architecture." },
            { col:GOLD, t:"5 Elements as Spectral Architecture",
              b:"Emerald(Boho) · Gold(Cosmic) · Indigo(AETHER) · Rose(Personal) · Teal(Elemental) — five distinct frequency bands of output, each with its own color, tone, and cadence. Together they appear as a unified personal brand. Separately they are a structured, maintainable, distinct content system. The brand is the white light. The elements are the spectrum." },
            { col:RED,  t:"4A as Emotional Decomposition",
              b:"Acknowledge, Analyze, Adjust, Advance — the 4A protocol applies the prism principle to emotional states. An emotionally heightened moment (white light — appears unified, undifferentiated) is decomposed into four distinct operations. Each is visible, manageable. The overwhelm is not the truth; it is the composite. The prism reveals the structure inside it." },
            { col:TEAL, t:"Launch Sequence as Coherence Boot",
              b:"Hydrate → Stretch → Breathe → Call Elements → Info: the sequence is a coherence boot protocol. Each step tunes a different system — physical substrate, kinetic state, autonomic tone, cognitive architecture, informational input. The 30-minute attention window is the instrument that resolves the day's potential into actionable states. Spectrum revealed before the work begins." },
            { col:BLUE, t:"Observer's Instrument = AETHER",
              b:"'The observer's instrument determines what is revealed.' AETHER is the instrument. It does not create the knowledge — the structure already exists in the world. AETHER resolves it: the Knowledge Graph decomposes the apparent unity of a domain into its constituent frequencies. Each page in this system is a beam — a distinct wavelength of structured understanding." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ ...card(col), borderColor: col + "22" }}>
              <div style={{ fontFamily: OR, fontSize: 9, color: col, letterSpacing: 1, marginBottom: 6 }}>{t}</div>
              <div style={{ ...body, fontSize: 10.5 }}>{b}</div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(31,212,200,0.08)",
          fontFamily: MN, fontSize: 7.5, color: DIM, letterSpacing: "0.12em", textAlign: "center" }}>
          PRISM PRINCIPLE · EMERGENT UNITY · 4 OPTIC LESSONS · REGULATORY DEPTH · EPIGENETICS · ALTERNATIVE SPLICING · NCRNA · FEEDBACK LOOPS · 5-ELEMENT OS · 4A PROTOCOL · LAUNCH SEQUENCE v1.0 · AETHER CRYSTALLISATION
        </div>
      </div>
    </div>
  );
}

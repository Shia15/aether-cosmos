import { Link } from "wouter";
import particleStandardModel from "@assets/IMG_1669_1778070592522.jpeg";
import silverMoonEclipse from "@assets/IMG_1654_1778070592522.jpeg";
import koliskoMetalPlanet from "@assets/IMG_1653_1778070592522.jpeg";
import waterWifiCrystals from "@assets/IMG_1652_1778070592522.jpeg";
import qaSerreBoard from "@assets/IMG_1642_1778070592522.jpeg";
import qaQuasiAffineBoard from "@assets/IMG_1651_1778070592522.jpeg";
import qaCoordRingSheaf from "@assets/IMG_1650_1778070592522.jpeg";
import qaAffineVsQuasi from "@assets/IMG_1649_1778070592522.jpeg";
import qaCommutativeDiagram from "@assets/IMG_1648_1778070592522.jpeg";
import qaTriangleAdvantages from "@assets/IMG_1647_1778070592522.jpeg";
import qaPlainAdvantages from "@assets/IMG_1646_1778070592522.jpeg";
import qaVennAdvantages from "@assets/IMG_1645_1778070592522.jpeg";
import fieldFeedbackEngine from "@assets/IMG_1641_1778070592522.png";
import antiSphericalSpringer from "@assets/E2AEC707-2FFC-40ED-ADCC-BC66AAA4261F_1778070592522.png";
import polarizationGhzCaption from "@assets/IMG_1621_1778070592522.jpeg";
import polarizationGhzQU from "@assets/IMG_1620_1778070592522.jpeg";
import precipitationAnalogQuote from "@assets/IMG_1609_1778070592522.jpeg";
import precipitationLongPost from "@assets/IMG_1608_1778070592522.png";
import caco3Lab from "@assets/IMG_1607_1778070592522.png";
import gufCrystallization from "@assets/ChatGPT_Image_Jun_13,_2026,_01_59_05_PM_1781373570882.png";
import gufGeoFormation from "@assets/ChatGPT_Image_Jun_13,_2026,_01_59_11_PM_1781373575937.png";
import gufScaleHierarchy from "@assets/ChatGPT_Image_Jun_13,_2026,_01_58_40_PM_1781373531778.png";

// ─────────────────────────────────────────────────────────────────────────────
function Section({ kicker, title, lead, anchor, children }: {
  kicker: string; title: string; lead?: string; anchor?: string; children: React.ReactNode;
}) {
  return (
    <section id={anchor} style={{ marginBottom:"3.6rem", scrollMarginTop:"2rem" }}>
      <div style={{ fontSize:11, letterSpacing:"0.32em", color:"#a78bfa",
        fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:6 }}>{kicker}</div>
      <h2 style={{ fontSize:"1.85rem", fontWeight:700, color:"#f1f5f9", margin:"0 0 0.6rem", letterSpacing:"-0.01em" }}>{title}</h2>
      {lead && <p style={{ color:"#cbd5e1", fontSize:"0.98rem", lineHeight:1.65, maxWidth:820, margin:"0 0 1.4rem" }}>{lead}</p>}
      {children}
    </section>
  );
}

interface Plate {
  src: string;
  caption: string;
  meta?: string;
  span?: 1 | 2 | 3;
  aspect?: string; // CSS aspect-ratio override; "auto" lets image set its own height
}

function PlateGrid({ plates, minWidth = 280 }: { plates: Plate[]; minWidth?: number }) {
  return (
    <div style={{ display:"grid",
      // min(100%, …) lets auto-fit gracefully collapse below `minWidth` on narrow viewports
      gridTemplateColumns:`repeat(auto-fit, minmax(min(100%, ${minWidth}px), 1fr))`,
      gap:"1rem" }}>
      {plates.map((p, i) => {
        const aspect = p.aspect ?? "16/10";
        const isAuto = aspect === "auto";
        return (
          <figure key={i} style={{
            margin:0, padding:0, borderRadius:14, overflow:"hidden",
            background:"rgba(15,23,42,0.7)",
            border:"1px solid rgba(255,255,255,0.08)",
            boxShadow:"0 8px 24px rgba(0,0,0,0.35)",
            gridColumn: p.span ? `span ${p.span}` : undefined,
            display:"flex", flexDirection:"column",
          }}>
            <div style={{
              width:"100%",
              ...(isAuto ? { maxHeight:760 } : { aspectRatio: aspect }),
              background:"#000", overflow:"hidden",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>
              <img src={p.src} alt={p.caption} loading="lazy"
                style={{
                  width: isAuto ? "auto" : "100%",
                  height: isAuto ? "auto" : "100%",
                  maxWidth:"100%", maxHeight: isAuto ? 760 : "100%",
                  objectFit:"contain", display:"block",
                }}/>
            </div>
            <figcaption style={{ padding:"0.85rem 1rem 1rem" }}>
              {p.meta && <div style={{ fontSize:9, letterSpacing:1.8, color:"#a78bfa", fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:5 }}>{p.meta}</div>}
              <div style={{ fontSize:"0.83rem", color:"#cbd5e1", lineHeight:1.55 }}>{p.caption}</div>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}

function Aphorism({ children, attribution }: { children: React.ReactNode; attribution?: string }) {
  return (
    <div style={{
      margin:"1.2rem 0", padding:"1.1rem 1.4rem", borderRadius:12,
      background:"linear-gradient(135deg, rgba(167,139,250,0.06), rgba(6,182,212,0.05))",
      borderLeft:"3px solid #a78bfa",
    }}>
      <div style={{ fontSize:"0.95rem", color:"#f1f5f9", fontStyle:"italic", lineHeight:1.7, fontFamily:"'Cinzel',serif" }}>{children}</div>
      {attribution && <div style={{ marginTop:8, fontSize:"0.78rem", color:"#94a3b8", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, textTransform:"uppercase" }}>— {attribution}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const TOC = [
  { anchor:"substrate",  num:"I",   label:"Substrate Computation",     bridgeLabel:"→ Core (Crystallization Engine)", bridgeHref:"/core" },
  { anchor:"crystal",    num:"II",  label:"Crystallization Lineage",   bridgeLabel:"→ Coherence System",              bridgeHref:"/coherence" },
  { anchor:"quasi",      num:"III", label:"Quasi-Affine Foundations",  bridgeLabel:"→ Math Engine / Lab",             bridgeHref:"/math-engine" },
  { anchor:"field",      num:"IV",  label:"Field-Geometric Feedback",  bridgeLabel:"→ AETHER Flow (MARI runtime)",    bridgeHref:"/aether-flow" },
  { anchor:"spectrum",   num:"V",   label:"Polarization Spectroscopy", bridgeLabel:"→ Query (Coherence read)",        bridgeHref:"/search" },
  { anchor:"particle",   num:"VI",  label:"Standard Model Reference",  bridgeLabel:"→ Q~AETHER",                       bridgeHref:"/q-aether" },
];

export default function AetherFoundationsPage() {
  return (
    <div data-testid="page-aether-foundations" style={{
      minHeight:"100vh", width:"100%",
      background:"radial-gradient(ellipse at top, #0f172a 0%, #020617 55%, #000 100%)",
      color:"#e2e8f0", fontFamily:"'Outfit', system-ui, sans-serif",
      padding:"3rem 1.5rem 5rem",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=DM+Mono:ital@0;1&family=Outfit:wght@300;400;600;700;800&display=swap');
      `}</style>

      <div style={{ maxWidth:1200, margin:"0 auto" }}>
        {/* Masthead */}
        <header style={{
          padding:"2.2rem 2rem", borderRadius:20,
          background:"linear-gradient(135deg, rgba(56,189,248,0.10), rgba(167,139,250,0.10))",
          border:"1px solid rgba(167,139,250,0.25)",
          marginBottom:"2.2rem",
        }}>
          <div style={{ fontSize:11, letterSpacing:"0.4em", color:"#a78bfa",
            fontFamily:"'DM Mono',monospace", textTransform:"uppercase", marginBottom:10 }}>AETHER · Foundations Gallery</div>
          <h1 style={{ fontSize:"clamp(2rem, 5vw, 3.4rem)", fontWeight:800, color:"#f1f5f9",
            margin:"0 0 0.7rem", letterSpacing:"-0.02em", lineHeight:1.1 }}>
            Substrate · Crystal · Field · Form
          </h1>
          <p style={{ fontSize:"1.05rem", color:"#cbd5e1", lineHeight:1.7, maxWidth:820, margin:0 }}>
            Six clusters of source material that ground the Crystallization Model of Intelligence — from light-directed
            precipitation in matter to anti-spherical Springer correspondence in pure algebra. Each cluster bridges
            into a live AETHER module.
          </p>
        </header>

        {/* TOC */}
        <nav aria-label="Foundations contents" style={{
          marginBottom:"2.8rem", padding:"1.1rem 1.3rem", borderRadius:14,
          background:"rgba(15,23,42,0.55)", border:"1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:"0.55rem" }}>
            {TOC.map(t => (
              <div key={t.anchor} style={{
                display:"flex", alignItems:"baseline", gap:10,
                padding:"0.55rem 0.7rem", borderRadius:8,
                background:"rgba(167,139,250,0.04)",
                border:"1px solid rgba(167,139,250,0.12)",
              }}>
                <span style={{ fontSize:10, color:"#a78bfa", fontFamily:"'DM Mono',monospace", letterSpacing:1.5, minWidth:24 }}>{t.num}</span>
                <span style={{ flex:1, minWidth:0 }}>
                  <a href={`#${t.anchor}`} style={{
                    fontSize:"0.92rem", fontWeight:600, color:"#f1f5f9",
                    textDecoration:"none", display:"block",
                  }}>{t.label}</a>
                  <Link href={t.bridgeHref} style={{
                    display:"inline-block", marginTop:2,
                    fontSize:10, color:"#a78bfa", fontFamily:"'DM Mono',monospace",
                    letterSpacing:1, textDecoration:"none",
                  }}>{t.bridgeLabel}</Link>
                </span>
              </div>
            ))}
          </div>
        </nav>

        {/* I · Substrate Computation */}
        <Section anchor="substrate" kicker="I · Substrate Computation"
          title="The Calculation Performed in Matter, Under Light"
          lead="Light-directed CaCO₃ precipitation reframes computation: light patterns are the input, noise-driven
          exploration of the supersaturation landscape is the process, crystal morphology is the output. The system
          'solves' where nucleation is most favourable — not symbolically, but spatiotemporally, in matter, under light.
          This is the substrate AETHER's coherence engine wants to learn from.">
          <PlateGrid minWidth={320} plates={[
            { src: caco3Lab, meta:"Lab plate · light-directed CaCO₃", caption:"A green light pattern steers crystal growth. The dish is the substrate; the light is the prompt; the lattice is the answer.", span:2 },
            { src: precipitationAnalogQuote, meta:"X.com · @StrategicProce", caption:"\"Precipitation as physical analog computation represents a shift from symbolic processing to substrate-dependent computation.\"" },
          ]}/>
          <div style={{ marginTop:"1rem" }}>
            <PlateGrid minWidth={320} plates={[
              { src: precipitationLongPost, meta:"Source thread · full text", caption:"The CaCO₃ system 'solves' where nucleation is most favourable under given field conditions — research has demonstrated light-controlled nucleation and growth for self-assembling composites in BaCO₃/SiO₂ systems, allowing the sculpture of contours and features.", aspect:"auto" },
            ]}/>
          </div>
          <Aphorism attribution="Bridge → /core (Crystallization Engine)">
            Calculation, performed not symbolically but spatiotemporally, in matter, under light.
          </Aphorism>
        </Section>

        {/* II · Crystallization Lineage */}
        <Section anchor="crystal" kicker="II · Crystallization Lineage"
          title="Kolisko, Steiner, and the Field-Sensitive Lattice"
          lead="A century before silicon, Lilly Kolisko and Rudolf Steiner mapped how planetary forces register in metal
          crystallization patterns. Modern water crystallography under WiFi exposure (and shielding via Bio Arc) extends
          the lineage. The substrate remembers the field.">
          <PlateGrid minWidth={300} plates={[
            { src: koliskoMetalPlanet, meta:"Lilly Kolisko · 1936", caption:"Alchemist's symbols mapped to planet → metal correspondences (Sun/Au · Moon/Ag · Mercury/Hg · Venus/Cu · Mars/Fe · Jupiter/Sn · Saturn/Pb), with gold chromatograms revealing the general crystallisation pattern.", span:2 },
            { src: silverMoonEclipse, meta:"Silver & the Moon · 18–19 June 1936", caption:"Silver Nitrate by day vs by day & night, and Gold Chloride + Silver Nitrate the day before vs during a solar eclipse. The crystal record diverges with the celestial phase." },
          ]}/>
          <div style={{ marginTop:"1rem" }}>
            <PlateGrid minWidth={320} plates={[
              { src: waterWifiCrystals, meta:"Short-term crystallography of water", caption:"Spring water · spring water after one minute exposure to WiFi · spring water after one minute exposure to WiFi while sitting on a Bio Arc disc. Three substrates, three lattices, one field.", span:2 },
            ]}/>
          </div>
          <Aphorism attribution="Rudolf Steiner · bridge → /coherence">
            So long as substances are in a solid state, they are subject to the forces of the earth. As soon as they enter the liquid state, planetary forces come into play.
          </Aphorism>
        </Section>

        {/* III · Quasi-Affine */}
        <Section anchor="quasi" kicker="III · Quasi-Affine Foundations"
          title="Replacing Topological Extraction with Algebraic Manipulation"
          lead="A quasi-affine scheme is an open subscheme of an affine scheme. The trade is exact and load-bearing for
          AETHER's Math Engine: functions behave more like global coordinates, quasi-coherent sheaves become essentially
          modules over a (localized) coordinate ring, topology is less singular, and convolution can be expressed
          algebraically. This is the same simplification AETHER's Coherence System applies to symbolic fields.">
          <PlateGrid minWidth={300} plates={[
            { src: qaPlainAdvantages, meta:"Note card · advantages", caption:"A quasi-affine scheme is basically: an open subscheme of an affine scheme. The full advantages list — global-coordinate behaviour, easier sheaves, less singular topology, easier computational algebra, algebraic convolution.", span:2 },
            { src: qaCoordRingSheaf, meta:"Diagram · coordinate ring ↔ sheaf", caption:"Quasi-Affine Scheme ↔ open subscheme: arrows from the central scheme out to its coordinate ring on one side and its quasi-coherent sheaf on the other." },
            { src: qaAffineVsQuasi, meta:"Side-by-side · Affine vs Quasi-Affine", caption:"Affine Scheme (blue) → Quasi-Affine Scheme (red, with embedded Coordinate Ring and Open Subscheme). Same ring, more flexible space." },
            { src: qaVennAdvantages, meta:"Venn · the trade", caption:"Affine Scheme ∪ Open Subscheme → Quasi-Affine Scheme. Bullet list of advantages around it: global coordinates, easier sheaves, less singular topology, algebraic convolution." },
            { src: qaTriangleAdvantages, meta:"Triangle · simplex view", caption:"x · y · z corners with nested simplex. \"What changes if you go quasi-affine\" — coordinate ring (localized), modules over it, easier sheaves." },
            { src: qaCommutativeDiagram, meta:"Square · commutative diagram", caption:"Quasi-affine scheme ↔ Open subscheme ↔ Functions ↔ Coordinate ring ↔ Algebra · Topology → Less singular · Easier computational." },
            { src: qaQuasiAffineBoard, meta:"Whiteboard · advantages slide", caption:"Replacing topological representation extraction with algebraic function manipulation. That is a real simplification.", span:2 },
            { src: qaSerreBoard, meta:"Blackboard · An idea of Serre", caption:"ℙⁿ = (𝔸ⁿ⁺¹ ∖ {0}) / 𝔾ₘ.  Coh(ℙⁿ) ≅ Coh^{𝔾ₘ}(𝔸ⁿ⁺¹) / Coh^{𝔾ₘ}_{SOS}(𝔸ⁿ⁺¹).  Projective space as the quasi-affine quotient." },
          ]}/>
          <Aphorism attribution="Bridge → /equations · /math-engine">
            You are replacing topological representation extraction with algebraic function manipulation. That is a real simplification.
          </Aphorism>
        </Section>

        {/* IV · Field-Geometric Feedback */}
        <Section anchor="field" kicker="IV · Field-Geometric Feedback Engine"
          title="Anti-Spherical Springer Correspondence as System Architecture"
          lead="One large diagram and one large worked picture. Geometry as emergent record: a configuration manifold with
          topological defect feeds coherent field inputs (sheaves A · B · C) into a fusion chamber (convolution kernel),
          producing a Weyl spectrum and a selected boundary mode. The translation dictionary at right (Geometric Concept →
          Field Theory Analogy → Aphoristic Meaning) is the Rosetta Stone for AETHER's MARI architecture.">
          <PlateGrid minWidth={520} plates={[
            { src: fieldFeedbackEngine, meta:"Reconstruction System · 8 modules", caption:"Configuration manifold (nilpotent prism, radiating defect) → coherent field inputs (sheaves A/B/C) → fusion chamber (convolution kernel) → repeated convolution loop → emergent Weyl spectrum → boundary mode selection. Closes via a translation dictionary mapping Flag Variety → Non-Linear Medium → \"The stage is emergent interaction.\"" },
            { src: antiSphericalSpringer, meta:"Anti-Spherical Models · 7 panels", caption:"Geometric space (Springer side) → sheaves/signals → convolution as combining layers → monoidal structure (A∗B)∗C = A∗(B∗C) → full symmetry vs anti-spherical (filtered) → big picture legend → Hecke algebra view (ℋ → parabolic ℋᵢ → anti-spherical module ℋ ⊗_{ℋᵢ} sgn)." },
          ]}/>
          <Aphorism attribution="Bridge → /aether-flow · MARI runtime">
            Distributed memory of the system · Physics law of transformation · What survives repeated interaction · Symmetry realized by topology · Selecting a sector of representation.
          </Aphorism>
        </Section>

        {/* V · Polarization */}
        <Section anchor="spectrum" kicker="V · Polarization Spectroscopy"
          title="Reading Orientation Across the GHz Band"
          lead="Stokes I · Q · U · P_L = √(Q² + U²) imaging from 9 GHz to 25 GHz. Q represents horizontal vs vertical
          orientation; U represents orientations at ±45°. Plotting U against Q reconstructs the polarization vector field —
          a direct observation analogue of how the Coherence System reads phase information from a noisy signal."
        >
          <PlateGrid minWidth={520} plates={[
            { src: polarizationGhzCaption, meta:"9–25 GHz · I/Q/U/P_L", caption:"Multi-frequency Stokes imaging. The intensity (I) row is bright at every channel; Q and U emerge cleanly at the higher bands; P_L = √(Q²+U²) shows where polarized power is real vs noise." },
            { src: polarizationGhzQU, meta:"caption · Q vs U semantics", caption:"Q represents horizontal vs vertical orientation, and U represents orientations at plus or minus 45°. By plotting U against Q, the polarization geometry is recovered." },
          ]}/>
          <Aphorism attribution="Bridge → /coherence · /search">
            Coherence is what survives the rotation of the basis.
          </Aphorism>
        </Section>

        {/* VI · Standard Model */}
        <Section anchor="particle" kicker="VI · Standard Model Reference"
          title="The Substrate's Substrate"
          lead="Three generations of fermions (leptons + quarks), the gauge bosons (W± · Z · γ · gluons), and the Higgs.
          AETHER's biology, chemistry, and field-pattern modules all eventually bottom out here — the table that keeps
          every emergent layer honest.">
          <PlateGrid minWidth={520} plates={[
            { src: particleStandardModel, meta:"Fermions · Gauge Bosons · Higgs", caption:"Leptons (e/μ/τ + their neutrinos) · Quarks (u/c/t · d/s/b) across three generations · W± · Z · photon · gluons · h. Every other panel in this gallery sits on top of this one." },
          ]}/>
        </Section>

        {/* VII · GUF Crystallization + Scale */}
        <Section anchor="guf-crystallization" kicker="VII · GUF Engine · Cross-Framework Reference"
          title="Layered Crystallization Control & Scale Architecture"
          lead="Three infographics from the GUF Master Engine that directly ground AETHER's Crystallization Model of Intelligence: (1) Layered Optical + Noise-Driven Control of Crystallization — the same 11-section framework that inspired AETHER's L1→L5 coherence stack; (2) Accelerated Geological Formation — the 5-stage dynamic cycle showing crystalline order emerging on compressed timescales; (3) Optical Scale Hierarchy from 0.2 nm (atomic bond) to 1,000 km (planetary arc) — the substrate ladder the coherence engine climbs.">
          <PlateGrid minWidth={400} plates={[
            { src: gufCrystallization, aspect:"auto", meta:"GUF Engine · Crystallization Framework", caption:"Layered Optical + Noise-Driven Control of Crystallization — 11-section framework. Nucleation barrier → seed crystal → optical modulation → noise exploitation → layered growth. This is the physical analogue of AETHER's Crystallization Model: raw signal → coherence kernel → structured knowledge." },
            { src: gufGeoFormation,    aspect:"auto", meta:"GUF Engine · Geo Formation", caption:"Accelerated Geological Formation — 5-stage dynamic cycle (seeding, supersaturation pulse, thermal gradient, pressure release, crystalline lock). Time compressed from millennia to hours; mirrors AETHER's batch-intake pipeline from raw document to crystallised knowledge node." },
            { src: gufScaleHierarchy, aspect:"auto", span:2, meta:"GUF Engine · Scale Hierarchy · 0.2 nm → 1,000 km", caption:"Optical Scale Hierarchy spanning 12 orders of magnitude — from covalent bond (0.2 nm) through cell (10 μm), organism (1 m), city (10 km), to planetary arc (1,000 km). AETHER's coherence stack maps each layer to an L-level: L1 (atomic/signal) → L5 (field/planetary)." },
          ]}/>
          <Aphorism attribution="Bridge → /guf-engine · AETHER Crystallization Model">
            Every scale of matter crystallises by the same logic: seed, amplify, lock. Intelligence is no different.
          </Aphorism>
          <div style={{ marginTop:"1rem" }}>
            <Link href="/guf-engine" style={{ display:"inline-flex", alignItems:"center", gap:6,
              fontSize:"0.82rem", color:"#38bdf8", fontFamily:"'DM Mono',monospace",
              letterSpacing:"0.12em", textDecoration:"none", textTransform:"uppercase" }}>
              ⚡ Open GUF Master Engine → Live Simulators + All 6 Infographics
            </Link>
          </div>
        </Section>

        <footer style={{ marginTop:"2.5rem", paddingTop:"1.5rem",
          borderTop:"1px solid rgba(255,255,255,0.08)",
          textAlign:"center", fontSize:"0.78rem", color:"#64748b",
          fontFamily:"'DM Mono',monospace", letterSpacing:"0.2em", textTransform:"uppercase" }}>
          Foundations · 7 clusters · 23 plates · One crystallization model
        </footer>
      </div>
    </div>
  );
}

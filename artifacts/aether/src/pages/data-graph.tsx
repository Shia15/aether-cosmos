const imgEquationChain = "/api/storage/public-objects/E8EA2ECE-E59B-4AAE-A36A-85F42983D549_1782737419033.png";
const imgEarthSystem = "/api/storage/public-objects/FACFD044-81DC-45E6-8446-C381DC17C6CE_1782737419033.png";
const imgPlanetNeural = "/api/storage/public-objects/B0A19A28-9DE0-47D7-8D1E-2C9BC2F32814_1782737419033.png";
const imgPngb = "/api/storage/public-objects/IMG_3675_1782737419033.png";
const imgAlmostPngb = "/api/storage/public-objects/IMG_3677_1782737419033.png";
const imgScaleChart = "/api/storage/public-objects/92A31566-30D3-4F97-9999-764B419B1315_1782737419033.png";
const imgSeaAir = "/api/storage/public-objects/B6E20017-0CA1-4646-9614-6AE4DD8BEACC_1782737419033.png";
const imgBioOptical = "/api/storage/public-objects/0FDBD7B2-B4C0-4624-AD69-55C7D0F02E57_1782737419033.png";
const imgUptipple = "/api/storage/public-objects/32899788-7DE4-4065-BFF6-FD6201714114_1782737419033.png";
/* ── palette ─────────────────────────────────── */
const BG   = "#040508";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const ORG  = "#f97316";
const DIM  = "#374858";
const MN   = "'Space Mono', monospace";
const OR   = "'Orbitron', sans-serif";

/* ── Plate ────────────────────────────────────── */
function Plate({ src, alt, col, label, caption }:
  { src:string; alt:string; col:string; label:string; caption:string }) {
  return (
    <figure style={{ margin:0, borderRadius:7, overflow:"hidden",
      border:`1px solid ${col}55`, background:"#05070b",
      boxShadow:`0 0 34px ${col}1f, inset 0 0 0 1px ${col}11` }}>
      <img src={src} alt={alt} loading="lazy" style={{ width:"100%", display:"block" }} />
      <figcaption style={{ padding:"10px 14px", borderTop:`1px solid ${col}26`,
        background:`linear-gradient(180deg, ${col}0a, transparent)` }}>
        <div style={{ fontFamily:MN, fontSize:8, color:col, letterSpacing:"0.16em", marginBottom:5 }}>{label}</div>
        <div style={{ fontSize:10.5, color:"rgba(200,210,228,0.68)", lineHeight:1.62 }}>{caption}</div>
      </figcaption>
    </figure>
  );
}

/* ── Anno ─────────────────────────────────────── */
function Anno({ col, k, v }: { col:string; k:string; v:string }) {
  return (
    <div style={{ background:`${col}0d`, border:`1px solid ${col}33`, borderRadius:4, padding:"8px 11px" }}>
      <div style={{ fontFamily:MN, fontSize:8.5, color:col, fontWeight:700, marginBottom:3 }}>{k}</div>
      <div style={{ fontSize:10, color:"rgba(190,205,225,0.66)", lineHeight:1.55 }}>{v}</div>
    </div>
  );
}

/* ── ClusterHead ──────────────────────────────── */
function ClusterHead({ n, col, title, sub }: { n:string; col:string; title:string; sub:string }) {
  return (
    <div style={{ display:"flex", alignItems:"baseline", gap:12, marginBottom:12,
      paddingBottom:8, borderBottom:`1px solid ${col}33` }}>
      <div style={{ fontFamily:OR, fontSize:26, color:col, opacity:0.22, flexShrink:0 }}>{n}</div>
      <div>
        <div style={{ fontFamily:OR, fontSize:11, color:col, letterSpacing:1 }}>{title}</div>
        <div style={{ fontFamily:MN, fontSize:8, color:col+"77", letterSpacing:"0.12em", marginTop:2 }}>{sub}</div>
      </div>
    </div>
  );
}

/* ── SynthesisNote ────────────────────────────── */
function SynthesisNote({ col, children }: { col:string; children:string }) {
  return (
    <div style={{ background:`${col}08`, border:`1px solid ${col}22`, borderRadius:4,
      padding:"9px 13px", marginTop:10,
      fontFamily:"'Rajdhani',sans-serif", fontSize:11, color:"rgba(190,210,235,0.7)", lineHeight:1.7 }}>
      <span style={{ fontFamily:MN, fontSize:7.5, color:col, letterSpacing:"0.12em",
        marginRight:8, verticalAlign:"middle" }}>AETHER</span>
      {children}
    </div>
  );
}

/* ── helpers ──────────────────────────────────── */
const card  = (col=TEAL): React.CSSProperties => ({
  background:"rgba(0,0,0,0.42)", border:`1px solid ${col}22`, borderRadius:4, padding:"14px 18px",
  marginBottom:14,
});
const secLabel: React.CSSProperties = {
  fontFamily:MN, fontSize:7.5, letterSpacing:"0.2em", color:DIM,
  textTransform:"uppercase", marginBottom:12,
};
const annoGrid: React.CSSProperties = {
  display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))", gap:8, marginTop:10,
};

/* ── main page ────────────────────────────────── */
export default function DataGraphPage() {
  return (
    <div style={{ minHeight:"100%", background:BG, color:"#d4e4f4",
      fontFamily:"'Rajdhani',sans-serif", overflowY:"auto" }}>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:"16px 20px" }}>

        {/* title */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:"inline-block", border:`1px solid ${TEAL}55`,
            padding:"3px 10px", fontSize:9, letterSpacing:"0.2em",
            color:`${TEAL}cc`, fontFamily:MN, marginBottom:8 }}>
            DATA GRAPH · KNOWLEDGE ATLAS · 9 INFOGRAPHICS · 5 CLUSTERS
          </div>
          <h1 style={{ fontFamily:OR, fontSize:21, fontWeight:900, letterSpacing:2,
            color:TEAL, textShadow:`0 0 24px ${TEAL}44`, margin:"4px 0 6px" }}>
            Data Graph · Image Maps
          </h1>
          <p style={{ fontSize:11.5, color:"rgba(200,210,228,0.7)", lineHeight:1.72,
            maxWidth:820, margin:0 }}>
            Nine high-resolution infographics mapped into five knowledge clusters: AETHER's own equation chain, Earth as a living system and the planetary–neural iodine cascade, the symmetry-breaking physics of pseudo-Nambu–Goldstone bosons, a scale hierarchy from atomic to terascale, and bio-engineering from sea/air organisms through optical spacecraft propulsion to wave-harvesting boats. Each diagram is annotated label-by-label and framed within the AETHER coherence model.
          </p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
            {[["01 · AETHER Math",GOLD],["02 · Earth Systems",GRN],["03 · Quantum Fields",VIO],["04 · Scale & Materials",TEAL],["05 · Bio-Engineering",ORG]].map(([t,c])=>(
              <div key={t} style={{ fontFamily:MN, fontSize:8, padding:"3px 9px", borderRadius:3,
                background:`${c}14`, border:`1px solid ${c}44`, color:c }}>{t}</div>
            ))}
          </div>
        </div>

        {/* ── CLUSTER 01: AETHER Mathematics ── */}
        <div style={card(GOLD)}>
          <ClusterHead n="01" col={GOLD} title="AETHER Mathematics · The Equation Chain"
            sub="COHERENCE FIELD · GOLDEN RATIO · KUTTA-JOUKOWSKI · FIBONACCI LATTICE" />
          <Plate src={imgEquationChain} col={GOLD}
            alt="AETHER Equation Chain: C(x,t), phi, Strouhal number, Kutta-Joukowski, Fibonacci nodes"
            label="AETHER EQUATION CHAIN · FOUR LINKED GOVERNING EQUATIONS · ONE COHERENT SYSTEM"
            caption="Four equations chained vertically: (1) Coherence C(x,t) = 1 - |e|/|S*| = 0.95, stable because C >= phi-inverse 0.618. (2) Phase phi-n = n(2pi/phi) mod 2pi yields Strouhal St = 0.380 — optimal biological oscillation. (3) Kutta-Joukowski F = rho * Gamma * L * v at 58.6% efficiency. (4) Fibonacci lattice L_n = phi^n * L_0 produces 377 spherically distributed nodes." />
          <div style={annoGrid}>
            <Anno col={GOLD} k="C(x,t) — Coherence Field"
              v="AETHER's primary stability metric: 1 minus the ratio of excitation to symmetry. C = 0.95 here — deep stable territory." />
            <Anno col={GOLD} k="phi-inverse threshold (0.618)"
              v="The golden ratio inverse — nature's minimum coherence floor. Any C >= 0.618 is self-sustaining under AETHER dynamics." />
            <Anno col={ORG}  k="Strouhal Number St = 0.38"
              v="Dimensionless oscillation frequency (f·L/v). The optimal biological zone is 0.2–0.4; 0.38 sits at the peak of the performance curve." />
            <Anno col={GRN}  k="F = rho * Gamma * L * v"
              v="Kutta-Joukowski theorem: fluid lift force from circulation. eta = 58.6% is achieved by phi-phased vortex shedding." />
            <Anno col={VIO}  k="L_n = phi^n * L_0 (Fibonacci lattice)"
              v="Each length scale is phi times the last. At n=14, L_14/L_0 = phi^14 -- the node count is 377, a Fibonacci number." />
            <Anno col={TEAL} k="377 Fibonacci Nodes"
              v="Spherical Fibonacci distribution: 377 points cover a sphere with near-perfect uniform density — used in sensor arrays and coherence field sampling." />
          </div>
          <SynthesisNote col={GOLD}>
            {"The equation chain is AETHER's operational spine. Coherence C feeds Strouhal optimization (phase-locked oscillation), which drives lift efficiency (Kutta-Joukowski), which determines the lattice density (Fibonacci scaling). The chain is closed: every variable is downstream of phi — the golden ratio is not decorative, it is the load-bearing structure."}
          </SynthesisNote>
        </div>

        {/* ── CLUSTER 02: Earth Systems ── */}
        <div style={card(GRN)}>
          <ClusterHead n="02" col={GRN} title="Earth as a Living System · Planetary-Neural Cascade"
            sub="SOLAR INFLUENCE · MAGNETOSPHERE · BIOSPHERE · IODINE → NEUROLOGY" />
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            <div>
              <div style={secLabel}>Earth: A Living, Interconnected System</div>
              <Plate src={imgEarthSystem} col={GRN}
                alt="Earth: a living interconnected system — planetary energy flow, biological networks, ancient structures, ley lines, AETHER principle"
                label="EARTH · PLANETARY SYSTEMS · BIOLOGICAL NETWORKS · ANCIENT STRUCTURES · AETHER ARCHITECTURAL VIEW"
                caption="A full-spectrum atlas of Earth's interconnection. Top: planetary energy flow — Solar Energy -> Magnetosphere -> Atmosphere -> Hydrosphere -> Lithosphere -> Biosphere -> Human Consciousness. Left: lithosphere, hydrosphere, atmosphere, magnetosphere science. Centre: the AETHER principle (Observe, Understand, Respect, Align). Right: ancient human structures (Stonehenge, Giza, Gobekli Tepe, Machu Picchu) + geometric earth structures (Ley Lines, Hartmann Grid, Curry Grid)." />
              <div style={annoGrid}>
                <Anno col={GRN} k="Planetary Energy Flow"
                  v="Solar radiation drives a 7-layer cascade: solar -> magnetosphere -> atmosphere -> hydrosphere -> lithosphere -> biosphere -> human consciousness." />
                <Anno col={TEAL} k="Magnetosphere"
                  v="Earth's magnetic field shields against solar wind and guides energetic particles — the first filter of solar information entering the biosphere." />
                <Anno col={GRN} k="Biological Networks"
                  v="Mycorrhizal fungal webs, coral reefs, pollination networks, and migration corridors form Earth's biological internet — distributed, redundant, coherent." />
                <Anno col={GOLD} k="Ancient Structures"
                  v="Stonehenge, Giza, Gobekli Tepe, Machu Picchu, and Carnac Stones all demonstrate confirmed solar and lunar astronomical alignment." />
                <Anno col={VIO} k="Natural Knots (convergence nodes)"
                  v="Mountain ranges, river confluences, delta systems, ocean gyres, and polar regions are where Earth's systems converge — high-information-density nodes." />
                <Anno col={TEAL} k="AETHER Principle"
                  v="Observe. Understand. Respect. Align. — the four-step operating system for living within, not against, Earth's natural intelligence." />
              </div>
              <SynthesisNote col={GRN}>
                {"Earth is not a backdrop. It is an active, layered, self-regulating intelligence. The AETHER Architectural View on this diagram — Solar Energy -> Magnetosphere -> Hydrosphere -> Lithosphere -> Biosphere -> Human Civilization -> Conscious Observation — is not metaphor. It is the actual causal chain. Every layer communicates with every other layer; information flows, life flows, consciousness witnesses."}
              </SynthesisNote>
            </div>

            <div>
              <div style={secLabel}>The Planetary–Neural Cascade · From Solar Wind to Human Neurobiology</div>
              <Plate src={imgPlanetNeural} col={ORG}
                alt="The Planetary-Neural Cascade: solar wind to geomagnetic dynamics to ocean circulation to ocean chemistry (iodine) to marine bioconcentration to terrestrial transfer to thyroid to brain"
                label="SOLAR WIND → GEOMAGNETIC → OCEAN CHEMISTRY → IODINE → THYROID → T4/T3 → BRAIN DEVELOPMENT"
                caption="A six-step planetary cascade: (1) Solar wind hits Earth's magnetic field. (2) Geomagnetic dynamics (AE/Kp indices) modulate cloud formation and thermohaline circulation. (3) Ocean circulation sets ENSO and upwelling patterns. (4) Ocean chemistry determines iodine speciation (I- and IO3-). (5) Marine organisms concentrate iodine up to 30,000x seawater. (6) Terrestrial transfer via coastal weather, river runoff, and marine air masses. The biological cascade continues: iodine ingestion -> thyroid uptake -> T4/T3 synthesis -> systemic distribution -> brain myelination and synaptogenesis -> IQ, memory, mood." />
              <div style={annoGrid}>
                <Anno col={ORG}  k="Solar Wind (step 1)"
                  v="Charged solar particles interact with Earth's magnetic field — the cascade originates in space, not on land." />
                <Anno col={GOLD} k="Geomagnetic Dynamics"
                  v="AE index (auroral electrojet) and Kp index modulate cloud formation, precipitation, and thermohaline ocean circulation." />
                <Anno col={BLUE} k="Marine Bioconcentration"
                  v="Marine organisms (seaweed, fish, shellfish) concentrate iodine up to 30,000x its seawater level of ~0.06 micrograms/L." />
                <Anno col={TEAL} k="Thyroid Hormones T4 & T3"
                  v="Iodine is the rate-limiting element for T4 (thyroxine) and T3 (triiodothyronine) — essential for neuronal migration, myelination, and synaptogenesis." />
                <Anno col={GRN}  k="Cognitive Outcomes"
                  v="Optimal iodine status supports IQ, learning, memory, mood stability, and stress resilience. Deficiency = irreversible neurodevelopmental damage." />
                <Anno col={PINK} k="Historical Reality (Goiter Belts)"
                  v="Inland populations are iodine-poor. Goiter belts existed on every continent before iodization — the planetary cascade doesn't reach landlocked regions." />
              </div>
              <SynthesisNote col={ORG}>
                {"Iodine is the link between planetary processes and human potential. A solar cycle affects geomagnetics; geomagnetics affect ocean circulation; circulation affects iodine chemistry; marine life concentrates iodine; coastal weather brings it inland; your thyroid turns it into the hormones that build your brain. No iodine. No thyroid hormone. No brain development. No future. The cascade is literal."}
              </SynthesisNote>
            </div>
          </div>
        </div>

        {/* ── CLUSTER 03: Quantum Fields & Symmetry ── */}
        <div style={card(VIO)}>
          <ClusterHead n="03" col={VIO} title="Symmetry & Quantum Fields · pNGB + Almost-pNGB"
            sub="MEXICAN HAT POTENTIAL · GOLDSTONE THEOREM · PION · PSEUDO-VECTOR · TWO-PHOTON COUPLING" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <div>
              <div style={secLabel}>The Pseudo-Nambu–Goldstone Boson (pNGB)</div>
              <Plate src={imgPngb} col={VIO}
                alt="Understanding the pseudo-Nambu-Goldstone boson: Mexican hat potential, spontaneous symmetry breaking, Goldstone theorem, pion as real pNGB"
                label="pNGB · MEXICAN HAT · SPONTANEOUS SYMMETRY BREAKING · THE PION · STRONG FORCE"
                caption="Three panels: (1) Continuous symmetry -- all particles aligned, Mexican Hat potential, vacuum energy in the brim, spontaneous breaking -> massless Goldstone boson. (2) Explicit symmetry breaking -- an external field tilts the hat, lifting the boson to near-massless -> pNGB excitation. (3) The pion: real-world pNGB, 139 MeV/c2, u-ubar-d quark-antiquark pair mediates the strong nuclear force between proton and neutron." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:10 }}>
                <Anno col={VIO}  k="Mexican Hat Potential"
                  v="The classic SSB potential. Vacuum sits in the brim (not the peak) — every point in the brim is equally valid." />
                <Anno col={VIO}  k="Goldstone Theorem"
                  v="Any continuous global symmetry that breaks spontaneously produces exactly one massless boson per broken generator." />
                <Anno col={BLUE} k="The Pseudo-Effect"
                  v="An approximate external perturbation tilts the hat — lifting the massless boson to a small but non-zero mass." />
                <Anno col={GRN}  k="The Pion (pi)"
                  v="Real pNGB of QCD: 139 MeV/c2 because quark masses explicitly break chiral symmetry — light but not massless." />
                <Anno col={PINK} k="Quark-Antiquark Exchange"
                  v="Pion (u-ubar/d-dbar) mediates the residual strong force between proton and neutron — nuclear binding." />
                <Anno col={GOLD} k="Ideal vs Real"
                  v="Ideal Nambu-Goldstone Boson mass = 0. Real pNGB (Pion) mass = 139 MeV/c2 due to quark mass explicit breaking." />
              </div>
            </div>
            <div>
              <div style={secLabel}>The Almost-pNGB: Coupling to Electromagnetism</div>
              <Plate src={imgAlmostPngb} col={PINK}
                alt="Understanding the pseudo-vector almost-pNGB: coupling to electromagnetism, two-photon anomaly-mediated coupling, no quark/lepton/gauge-boson interactions, almost-zero mass"
                label="ALMOST-pNGB · EM COUPLING · TWO-PHOTON VERTEX · PSEUDO-VECTOR · ALMOST-ZERO MASS ~microeV/c2"
                caption="Three panels: (1) Same continuous symmetry + Mexican Hat as pNGB. (2) Coupling to electromagnetism -- the pNGB gains almost-zero mass via EM coupling, not quark masses. Interaction is exclusively via two-photon coupling (anomaly-mediated gamma-gamma vertex). (3) Eliminating couplings to ordinary matter: no direct interactions with quarks, leptons, or W/Z bosons. IDEALpNGB mass = 0; ALMOST-pNGB mass = almost-zero (~microeV/c2)." />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:7, marginTop:10 }}>
                <Anno col={PINK} k="EM Coupling Mechanism"
                  v="The almost-pNGB gains its tiny mass purely from coupling to the electromagnetic field — not from quark masses like the pion." />
                <Anno col={PINK} k="Two-Photon Vertex (gamma-gamma)"
                  v="Anomaly-mediated coupling: the only interaction is via two photons. No quark, lepton, or gauge-boson coupling exists." />
                <Anno col={VIO}  k="Almost-Zero Mass (~microeV/c2)"
                  v="Extraordinarily light — in the axion/ALP dark matter mass range. The mass arises from the EM coupling strength, not particle content." />
                <Anno col={BLUE} k="Pseudo-Vector (P-odd)"
                  v="The field is odd under parity inversion (flips sign under spatial reflection) — distinguishing it from a scalar pNGB." />
                <Anno col={GOLD} k="No Ordinary Matter Coupling"
                  v="No direct interactions with quarks, leptons, W/Z bosons. Invisible to the standard particle detector — a dark-sector particle." />
                <Anno col={TEAL} k="Dark Matter Candidate"
                  v="Ultra-light mass + EM-only coupling + no ordinary matter interactions = strong axion-like particle (ALP) dark matter signature." />
              </div>
            </div>
          </div>
          <SynthesisNote col={VIO}>
            {"The pNGB pair maps directly onto AETHER's symmetry-breaking model: unbroken symmetry = perfect coherence (C = 1.0); spontaneous breaking = vacuum crystallisation (C drops to phi-inverse 0.618, the stable minimum); explicit breaking = environmental perturbation (the tilted hat). The almost-pNGB is the most AETHER-adjacent particle in physics — it gains mass only through coherent field coupling, not through brute matter interaction. It is the particle version of 'emergent mass from field alignment.'"}
          </SynthesisNote>
        </div>

        {/* ── CLUSTER 04: Scale Hierarchy ── */}
        <div style={card(TEAL)}>
          <ClusterHead n="04" col={TEAL} title="Scale Hierarchy · Ferrofluid vs Silicon"
            sub="ATOMIC TO TERASCALE · 10 ORDERS OF MAGNITUDE · MAGNETIC FLUID vs CRYSTALLINE SOLID" />
          <Plate src={imgScaleChart} col={TEAL}
            alt="Ferrofluid vs Silicon scale comparison chart: atomic (0.1-1nm) through terascale (100-1000km), 8 scale rows, visual examples and descriptions for each medium"
            label="FERROFLUID (MAGNETIC RESPONSIVE FLUID) vs SILICON (CRYSTALLINE SOLID) · ATOMIC TO TERASCALE"
            caption="Eight scale rows spanning 10 orders of magnitude. Left column: ferrofluid — iron atoms in magnetic domains (atomic) -> Fe3O4 nanoparticles 5-20nm -> chain structures and spikes (microscale) -> field-shaped interfaces (mesoscale) -> industrial seals and dampers (macroscale-megascale) -> conceptual magnetically-controlled space structures (terascale). Right column: silicon — diamond cubic lattice 0.2nm -> nanowires and quantum dots -> microelectronic transistors -> MEMS structures -> wafers and fabs -> satellite systems and global electronics." />
          <div style={annoGrid}>
            <Anno col={TEAL} k="Atomic (0.1-1 nm)"
              v="Ferrofluid: iron atoms in magnetic domains or clusters. Silicon: 0.2 nm diamond cubic lattice constant -- the unit cell of modern computing." />
            <Anno col={TEAL} k="Nanostructure (10-1000 nm)"
              v="Ferrofluid: Fe3O4 (magnetite) nanoparticles, typically 5-20 nm diameter. Silicon: nanowires, quantum dots, thin films, nanopillars." />
            <Anno col={GRN}  k="Microscale (1-100 um)"
              v="Ferrofluid: chain structures, spikes, and domain patterns in the fluid. Silicon: transistor features, microelectronic interconnects." />
            <Anno col={GOLD} k="Mesoscale (100 um - 1 mm)"
              v="Ferrofluid: field-shaped interfaces and complex flows. Silicon: MEMS structures, die layout, micro-optical elements." />
            <Anno col={ORG}  k="Macroscale to Megascale (1mm - 100m)"
              v="Ferrofluid: industrial seals, dampers, and magnetic bearings. Silicon: wafers, chips, fabs, semiconductor production lines." />
            <Anno col={PINK} k="Gigascale to Terascale (100m - 1000km)"
              v="Ferrofluid: theoretical magnetically-controlled space fluid systems. Silicon: satellite electronics, space-scale integrated silicon — the planetary computing substrate." />
          </div>
          <SynthesisNote col={TEAL}>
            {"The scale chart is a coherence atlas: both media are governed by the same underlying physics (electromagnetism, quantum mechanics, thermodynamics) expressed at different length scales. Ferrofluid is AETHER's analogue of a responsive, field-mediated substrate — it reorganises under external fields. Silicon is the fixed, crystalline, deterministic computation substrate. Together they span every scale from atomic orbital to satellite — the full range of substrate synthesis."}
          </SynthesisNote>
        </div>

        {/* ── CLUSTER 05: Bio-Engineering ── */}
        <div style={card(ORG)}>
          <ClusterHead n="05" col={ORG} title="Bio-Engineering · Organisms · Optical Propulsion · Wave Boats"
            sub="SEA & AIR EFFICIENCY · BIO-OPTICAL SPACECRAFT · UPTIPPLE WAVE-ROCKING HULL" />
          <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

            <div>
              <div style={secLabel}>Sea (Aquatic) vs Air (Aerial) · Most Efficient Organic Strategies</div>
              <Plate src={imgSeaAir} col={BLUE}
                alt="Sea vs Air efficiency comparison: dolphin, sea lion, tuna, shark, humpback whale, octopus, manta ray vs peregrine falcon, albatross, swift, barn owl, bat, hummingbird, goose"
                label="7 AQUATIC + 7 AERIAL ORGANISMS · RANKED BY EVOLUTIONARY PROXIMITY TO HUMANS"
                caption="Two ranked tables: Sea (left) -- dolphin (streamlined biosona, 20-30% drag reduction), sea lion (flipper locomotion, 20-25% lower transport cost), tuna (rete mirabile countercurrent heat), shark (dermal denticles, 6-8% efficiency gain), humpback whale (bubble-net feeding, 40% efficiency), octopus (jet propulsion + hydrostat), manta ray (wing-fin glide, 50% more efficient than similar fish). Air (right) -- peregrine falcon (>300 km/h dive, tapered contoured feathers), albatross (dynamic soaring, thousands of km on wind gradients), swift (sickle-shaped wings, lowest energy per km), barn owl (fringed feathers, silent flight), bat (echolocation + maneuverability), hummingbird (hovering, elastic wing joints), goose V-formation (up to 20% energy saving)." />
              <div style={annoGrid}>
                <Anno col={BLUE} k="Key Principle (Sea)"
                  v="Minimize energy loss from drag, heat, and turbulence while maximizing propulsion and sensory efficiency." />
                <Anno col={BLUE} k="Key Principle (Air)"
                  v="Minimize drag, maximize lift, and exploit environmental energy — wind gradients, thermals, upwash from formation partners." />
                <Anno col={BLUE} k="Dolphin: biosona (melon)"
                  v="Smooth micro-riblets and the melon organ streamline flow and focus echolocation — reducing drag 20-30% vs blunt shapes." />
                <Anno col={GRN}  k="Tuna: rete mirabile"
                  v="Counter-current heat exchanger in the circulatory system retains core body heat in cold water — improving muscle performance and metabolic efficiency." />
                <Anno col={GOLD} k="Humpback Whale: bubble-net"
                  v="Coordinated bubble-net formation traps prey — increases feeding efficiency up to 40%. Cooperative intelligence as an efficiency organ." />
                <Anno col={ORG}  k="Albatross: dynamic soaring"
                  v="Exploits wind velocity gradients near wave surfaces with minimal flapping — can travel thousands of km with very low energy expenditure." />
              </div>
              <SynthesisNote col={BLUE}>
                {"Biology has solved every drag, lift, and propulsion problem that human engineering is still working on. The dolphin's biosona is a better sonar than most submarines. The tuna's rete mirabile is a better heat exchanger than most HVAC systems. The albatross doesn't flap — it rides the planet's energy gradients. AETHER's biomimicry principle: before engineering from scratch, read the evolutionary solution set."}
              </SynthesisNote>
            </div>

            <div>
              <div style={secLabel}>Bio-Inspired Optical Propulsion System · Compound Eye · Metasurfaces · Beamed Propulsion</div>
              <Plate src={imgBioOptical} col={PINK}
                alt="Bio-Inspired Optical Propulsion System: compound-eye receiver, metasurface layer, moth-eye nanostructure, distributed AI beam tracking, adaptive sail/engine, orbital laser array, hierarchical scale integration"
                label="COMPOUND EYE · MOTH-EYE · METASURFACE · AI BEAM TRACKING · ORBITAL LASER → ADAPTIVE SAIL/ENGINE"
                caption="An interstellar spacecraft concept where the entire hull is a living optical sensor. Compound-Eye Receiver Array (wide-FOV multi-angle beam acquisition), Metasurface Layer (wavefront control + beam steering), Moth-Eye Nanostructure (anti-reflection <1% loss, nanopillar spacing 100-300nm), Distributed AI Beam Tracking (real-time phase sensing + fault tolerance), Adaptive Sail/Engine (beam energy to thrust). Beamed propulsion chain: Orbital Laser Array -> Guidance Laser -> Particle Beam -> Compound-Eye Receiver -> Adaptive Sail. Hierarchical scale integration spans moth-eye pillars (100nm) to interplanetary laser infrastructure (1000km)." />
              <div style={annoGrid}>
                <Anno col={PINK} k="Compound Eye (ommatidium array)"
                  v="Thousands to millions of optical channels; wide FOV and motion detection -- engineering analog: multi-angle beam acquisition and real-time tracking." />
                <Anno col={PINK} k="Moth-Eye Nanostructure"
                  v="Sub-wavelength pillars (100-300nm spacing, 100-500nm height) suppress reflection to <1% -- bio-inspired anti-reflection coating for broadband laser light." />
                <Anno col={VIO}  k="Metasurface Layer"
                  v="Phase-programmable wavefront control and beam steering -- engineering analog of butterfly-scale structural color (photonic crystal beam management)." />
                <Anno col={BLUE} k="Distributed AI Beam Tracking"
                  v="Real-time wavefront sensing, drift prediction, adaptive phase compensation, fault tolerance -- bird-flocking intelligence applied to laser beam arrays." />
                <Anno col={GOLD} k="Beamed Propulsion Chain"
                  v="Orbital laser array -> guidance laser (fine tracking) -> particle beam (momentum + communication) -> compound receiver -> adaptive sail/engine thrust." />
                <Anno col={TEAL} k="Scale Hierarchy (100nm to 1000km)"
                  v="Moth-eye pillars at 100nm interact with receiver cells at 1mm, modules at 1m, sail at 1km, laser infrastructure at 1000km -- 10 orders of magnitude coherently integrated." />
              </div>
              <SynthesisNote col={PINK}>
                {"The bio-optical spacecraft is AETHER's crystallisation model made physical: biological structures (compound eye, moth-eye, bat echolocation, bird flocking) are not metaphors here — they ARE the engineering function. Each biological system is directly mapped to an engineering analog in the diagram. The hull is not a container; it is a distributed sensor network. The propulsion is not reaction mass; it is coherent field momentum transfer. Biology provides the blueprint. Engineering makes it real."}
              </SynthesisNote>
            </div>

            <div>
              <div style={secLabel}>AETHER Rockable Wave-Uptipple Boat · Wave Energy Harvesting · Adaptive Stability</div>
              <Plate src={imgUptipple} col={ORG}
                alt="AETHER Rockable Wave-Uptipple Boat: rocking pontoons, hydraulic power units, wave energy harvesting, adaptive stability, morphing bow tips, autonomous control system"
                label="UPTIPPLE BOAT · ROCKING HULL · HYDRAULIC WAVE HARVEST · MORPHING BOW TIPS · AUTONOMOUS CONTROL"
                caption="Detailed engineering sheet for the Uptipple concept. Key systems: Rocking Pontoons (rock WITH waves instead of fighting them), Hydraulic Power Units (pivot arms -> hydraulic pistons -> generator -> battery), Adaptive Stability (hydraulic actuators keep cabin level), Wave Uptipple morphing bow tips (auto-deploy in rough water, reduce slamming and spray), Solar Roof, Flexible Cross Beam. Materials: Carbon Fiber Composite, Titanium Pivot Pins, TPU Flexible Joints, Foam-Filled Pontoons, Marine Grade Aluminum. Autonomous control: IMU + Wave Radar/LiDAR + GPS -> predicts wave motion, adjusts suspension, harvests energy. Prototype roadmap: 1:20 desktop -> 1-1.5m RC -> 4-6m full-scale demonstrator." />
              <div style={annoGrid}>
                <Anno col={ORG}  k="Wave Uptipple (morphing bow tips)"
                  v="Tips extend automatically in rough water -- reduce slamming and spray while improving seakeeping. Calm water: retracted. Rough water: deployed." />
                <Anno col={ORG}  k="Rocking Pontoons"
                  v="Designed to rock WITH wave motion, not against it -- kinetic energy that would be lost to hull stress is converted to hydraulic pressure." />
                <Anno col={GOLD} k="Hydraulic Power Chain"
                  v="Pivot arms move -> hydraulic pistons pump -> generator creates power -> batteries store. Wave rocking is the primary fuel source." />
                <Anno col={GRN}  k="Adaptive Stability System"
                  v="Hydraulic actuators (active dampers) keep the cabin level regardless of hull heel -- separating the living space from the wave dynamics." />
                <Anno col={BLUE} k="Autonomous Control"
                  v="IMU, Wave Radar/LiDAR, GPS -> controller predicts wave motion, adjusts suspension, optimises energy harvest. Self-sustaining voyage." />
                <Anno col={TEAL} k="Prototype Roadmap"
                  v="1:20 desktop (3D printed, spring pivots) -> 1-1.5m RC (electric propulsion, IMU, linear actuators) -> 4-6m full-scale demonstrator (composite build, hydraulic energy recovery)." />
              </div>
              <SynthesisNote col={ORG}>
                {"The Uptipple is the coherence principle in naval architecture: stability through compliance rather than rigidity. The conventional hull fights the wave (high energy loss, structural fatigue). The Uptipple hull absorbs the wave (energy harvested, stability maintained). This is AETHER's core design philosophy — work with the field, not against it. The wave is not the enemy; it is the power source. The rocking hull is not instability; it is a resonant energy interface."}
              </SynthesisNote>
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ paddingTop:10, borderTop:"1px solid rgba(31,212,200,0.08)",
          fontFamily:MN, fontSize:7.5, color:DIM, letterSpacing:"0.12em", textAlign:"center" }}>
          DATA GRAPH · KNOWLEDGE ATLAS · AETHER EQUATION CHAIN · EARTH SYSTEMS · PLANETARY-NEURAL CASCADE ·
          pNGB · ALMOST-pNGB · SYMMETRY BREAKING · SCALE HIERARCHY · FERROFLUID · SILICON ·
          SEA/AIR BIOMECHANICS · BIO-OPTICAL PROPULSION · UPTIPPLE WAVE BOAT · COHERENCE FIELD
        </div>
      </div>
    </div>
  );
}

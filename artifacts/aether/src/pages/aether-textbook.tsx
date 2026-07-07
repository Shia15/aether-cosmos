import { useEffect, useState } from "react";
import "katex/dist/katex.min.css";
import katex from "katex";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const C = {
  bg: "#020812",
  panel: "rgba(2,12,28,0.95)",
  border: "rgba(99,179,237,0.18)",
  accent: "#63b3ed",
  green: "#4ade80",
  gold: "#f2c354",
  purple: "#c084fc",
  teal: "#2ef0d8",
  orange: "#fb923c",
  pink: "#f472b6",
  text: "#e2e8f0",
  muted: "rgba(226,232,240,0.45)",
  mono: "'DM Mono',monospace",
  serif: "'Georgia',serif",
};

const NOTION_TEXTBOOK_ID = "31b6e876-9112-81ea-8d4b-e9d438be2fab";

function KaTeX({ expr, display = false }: { expr: string; display?: boolean }) {
  try {
    const html = katex.renderToString(expr, { throwOnError: false, displayMode: display });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  } catch {
    return <code style={{ color: C.gold }}>{expr}</code>;
  }
}

function Chapter({ num, title, color, children }: { num: string; title: string; color: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 64 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid ${color}30` }}>
        <span style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.3em", color: `${color}80` }}>{num}</span>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color, letterSpacing: "-0.01em" }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 12, fontFamily: C.serif, letterSpacing: "0.01em" }}>{title}</h3>
      {children}
    </div>
  );
}

function Body({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: C.serif, fontSize: 15, lineHeight: 1.85, color: C.text, margin: "0 0 14px" }}>{children}</p>;
}

function EqBox({ label, expr, note }: { label: string; expr: string; note?: string }) {
  return (
    <div style={{ background: "rgba(99,179,237,0.05)", border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.accent}`, borderRadius: 6, padding: "14px 18px", margin: "16px 0" }}>
      <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.22em", color: C.muted, marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 18, overflowX: "auto", paddingBottom: 4 }}>
        <KaTeX expr={expr} display />
      </div>
      {note && <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, marginTop: 8 }}>{note}</div>}
    </div>
  );
}

function Callout({ color, icon, children }: { color: string; icon: string; children: React.ReactNode }) {
  return (
    <div style={{ background: `${color}08`, border: `1px solid ${color}30`, borderRadius: 8, padding: "14px 18px", margin: "16px 0", display: "flex", gap: 12 }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{icon}</span>
      <div style={{ fontFamily: C.serif, fontSize: 14, lineHeight: 1.7, color: C.text }}>{children}</div>
    </div>
  );
}

type NotionBlock = {
  type?: string;
  paragraph?: { rich_text?: { plain_text?: string }[] };
  heading_1?: { rich_text?: { plain_text?: string }[] };
  heading_2?: { rich_text?: { plain_text?: string }[] };
  heading_3?: { rich_text?: { plain_text?: string }[] };
  bulleted_list_item?: { rich_text?: { plain_text?: string }[] };
  numbered_list_item?: { rich_text?: { plain_text?: string }[] };
  quote?: { rich_text?: { plain_text?: string }[] };
  code?: { rich_text?: { plain_text?: string }[] };
  child_page?: { title?: string };
};

function richText(b: NotionBlock, key: keyof NotionBlock): string {
  const node = b[key] as { rich_text?: { plain_text?: string }[] } | undefined;
  return (node?.rich_text ?? []).map(r => r.plain_text ?? "").join("");
}

function NotionSection() {
  const [status, setStatus] = useState<"loading" | "ok" | "unavailable">("loading");
  const [blocks, setBlocks] = useState<NotionBlock[]>([]);

  useEffect(() => {
    fetch(`${BASE}/api/notion/page/${NOTION_TEXTBOOK_ID}`)
      .then(r => r.json())
      .then((d: { blocks?: { results?: NotionBlock[] }; error?: string }) => {
        const results = d.blocks?.results ?? [];
        if (results.length > 0) {
          setBlocks(results);
          setStatus("ok");
        } else {
          setStatus("unavailable");
        }
      })
      .catch(() => setStatus("unavailable"));
  }, []);

  if (status === "loading") {
    return (
      <div style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, padding: "20px 0", letterSpacing: "0.18em" }}>
        LOADING NOTION TEXTBOOK…
      </div>
    );
  }

  if (status === "unavailable") {
    return (
      <div style={{ background: "rgba(242,195,84,0.06)", border: "1px solid rgba(242,195,84,0.25)", borderRadius: 10, padding: "20px 24px" }}>
        <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.26em", color: C.gold, marginBottom: 10 }}>NOTION TEXTBOOK · NOT YET SHARED</div>
        <p style={{ fontFamily: C.serif, fontSize: 14, color: C.text, lineHeight: 1.7, margin: "0 0 14px" }}>
          The Notion Txtbk page needs to be connected to the Replit integration before its content can flow here.
        </p>
        <ol style={{ fontFamily: C.serif, fontSize: 13, color: C.muted, lineHeight: 2.2, paddingLeft: 20, margin: "0 0 14px" }}>
          <li>Open the <strong style={{ color: C.text }}>Txtbk</strong> page in Notion</li>
          <li>Click <strong style={{ color: C.text }}>···</strong> top-right → <strong style={{ color: C.text }}>Connections</strong></li>
          <li>Find <strong style={{ color: C.text }}>Replit</strong> → <strong style={{ color: C.text }}>Connect to integration</strong></li>
          <li>Reload this page — content will auto-populate below</li>
        </ol>
        <div style={{ fontFamily: C.mono, fontSize: 10, color: "rgba(242,195,84,0.5)", letterSpacing: "0.14em" }}>
          PAGE ID: {NOTION_TEXTBOOK_ID}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {blocks.map((b, i) => {
        const t = b.type ?? "";
        if (t === "heading_1") return <h2 key={i} style={{ fontSize: 20, fontWeight: 700, color: C.gold, fontFamily: C.serif, margin: "24px 0 8px" }}>{richText(b, "heading_1")}</h2>;
        if (t === "heading_2") return <h3 key={i} style={{ fontSize: 17, fontWeight: 600, color: C.accent, fontFamily: C.serif, margin: "18px 0 6px" }}>{richText(b, "heading_2")}</h3>;
        if (t === "heading_3") return <h4 key={i} style={{ fontSize: 15, fontWeight: 600, color: C.teal, fontFamily: C.serif, margin: "14px 0 4px" }}>{richText(b, "heading_3")}</h4>;
        if (t === "paragraph") { const txt = richText(b, "paragraph"); return txt ? <p key={i} style={{ fontFamily: C.serif, fontSize: 15, lineHeight: 1.85, color: C.text, margin: "0 0 10px" }}>{txt}</p> : null; }
        if (t === "bulleted_list_item") return <div key={i} style={{ display: "flex", gap: 10, margin: "4px 0", fontFamily: C.serif, fontSize: 14, color: C.text, lineHeight: 1.7 }}><span style={{ color: C.accent, flexShrink: 0 }}>•</span><span>{richText(b, "bulleted_list_item")}</span></div>;
        if (t === "numbered_list_item") return <div key={i} style={{ display: "flex", gap: 10, margin: "4px 0", fontFamily: C.serif, fontSize: 14, color: C.text, lineHeight: 1.7 }}><span style={{ color: C.gold, flexShrink: 0 }}>{i + 1}.</span><span>{richText(b, "numbered_list_item")}</span></div>;
        if (t === "quote") return <blockquote key={i} style={{ borderLeft: `3px solid ${C.purple}`, paddingLeft: 16, margin: "12px 0", fontFamily: C.serif, fontSize: 14, color: C.muted, fontStyle: "italic" }}>{richText(b, "quote")}</blockquote>;
        if (t === "code") return <pre key={i} style={{ background: "rgba(99,179,237,0.06)", border: `1px solid ${C.border}`, borderRadius: 6, padding: 14, fontFamily: C.mono, fontSize: 12, color: C.teal, overflowX: "auto", margin: "12px 0" }}>{richText(b, "code")}</pre>;
        if (t === "child_page") return <div key={i} style={{ fontFamily: C.mono, fontSize: 11, color: C.accent, padding: "8px 12px", border: `1px solid ${C.border}`, borderRadius: 6, margin: "8px 0" }}>↳ {b.child_page?.title}</div>;
        if (t === "divider") return <hr key={i} style={{ border: "none", borderTop: `1px solid ${C.border}`, margin: "20px 0" }} />;
        return null;
      })}
    </div>
  );
}

export default function AetherTextbook() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: C.serif, padding: "40px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>

        {/* Title Page */}
        <div style={{ textAlign: "center", marginBottom: 72, paddingBottom: 48, borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.4em", color: C.muted, marginBottom: 16 }}>AETHER KNOWLEDGE SYSTEM · UNIFIED TEXTBOOK</div>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: "0 0 12px", letterSpacing: "-0.03em", background: `linear-gradient(135deg, ${C.gold}, ${C.accent}, ${C.purple})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            AETHER
          </h1>
          <div style={{ fontSize: 18, color: C.muted, fontStyle: "italic", marginBottom: 8 }}>A Unified Field Textbook</div>
          <div style={{ fontFamily: C.mono, fontSize: 11, color: "rgba(226,232,240,0.3)", letterSpacing: "0.2em" }}>
            FRAMEWORK → CODE → SYSTEM → SIMULATION → COHERENCE
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            {[["I","Foundations",C.gold],["II","Solar & Energy",C.orange],["III","Biology & Quantum",C.green],["IV","Physics & Cosmology",C.accent],["V","Propulsion & Space",C.purple],["VI","Consciousness & Agents",C.pink],["VII","Formal Mathematics",C.teal]].map(([n,lbl,col]) => (
              <a key={n} href={`#ch-${n}`} style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.16em", color: col as string, textDecoration: "none", border: `1px solid ${col}35`, padding: "5px 12px", borderRadius: 4 }}>{n} · {lbl}</a>
            ))}
          </div>
        </div>

        {/* ── CHAPTER I ── */}
        <Chapter num="CHAPTER I" title="Foundations of the AETHER Field" color={C.gold}>
          <Section title="1.1 The Master Equation">
            <Body>
              AETHER begins with a single governing equation that describes coherence as a field — the degree to which any system's actual state matches its reference structure, modulated by helical geometry and boundary conditions.
            </Body>
            <EqBox
              label="MASTER COHERENCE EQUATION"
              expr="C(x,t) = 1 - \frac{\|\varepsilon\|}{\|S^*\|} \cdot e^{-\kappa \cdot \Gamma_{\text{helix}}}"
              note="C ∈ [0,1] · ε = deviation veil · S* = reference substrate · κ = decay constant · Γ = helical circulation"
            />
            <Body>
              When C → 1, the system has crystallised into full coherence with its reference. When C → 0, it has dissolved into veil-dominated incoherence. Every AETHER system — biological, physical, computational — lives somewhere on this spectrum.
            </Body>
          </Section>
          <Section title="1.2 The Crystallisation Model">
            <Body>
              Order does not emerge randomly. It crystallises through four universal stages that appear at every scale — from diamond formation to neural synchrony to cosmological structure.
            </Body>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, margin: "16px 0" }}>
              {[["I · Scattered","Particles in random distribution. No coherence field established. C ≈ 0.","#64748b"],["II · Nucleation","First coherence nuclei form. Local order seeds propagate outward. C ≈ 0.3","#f2c354"],["III · Lattice Ordering","Long-range order establishes. Bonds lock in. C ≈ 0.65 (LPE threshold)","#63b3ed"],["IV · Crystal Lock","Full crystallisation. Maximum coherence. Reference substrate realised. C ≈ 1","#4ade80"]].map(([title, desc, col]) => (
                <div key={title} style={{ background: `${col}08`, border: `1px solid ${col}30`, borderRadius: 8, padding: 14 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.18em", color: col, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontFamily: C.serif, fontSize: 13, color: C.muted, lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="1.3 The Substrate Principle">
            <Body>
              Structure-in-space precedes computation. The substrate — whether silicon lattice, biological membrane, or spacetime metric — is not a passive container. It is the active reference S* against which coherence is measured. Algorithmic models ignore the substrate; AETHER makes it primary.
            </Body>
            <Callout color={C.gold} icon="◈">
              <strong>Substrate Computing Thesis:</strong> The medium is not merely the message — it is the mechanism. Every computation is a crystallisation event in a physical substrate, and the quality of that substrate determines the coherence ceiling.
            </Callout>
          </Section>
        </Chapter>

        {/* ── CHAPTER II ── */}
        <Chapter num="CHAPTER II" title="Solar, Energy & Cascade Systems" color={C.orange} id="ch-II">
          <Section title="2.1 The Solar-Biological Cascade">
            <Body>
              Solar activity modulates the geomagnetic field, which cascades into atmospheric chemistry, ocean circulation, iodine chemistry, marine bioconcentration, terrestrial transfer, thyroid hormone production, and finally cognitive outcomes. AETHER treats this as a single coherence pipeline from star to cell.
            </Body>
            <EqBox
              label="SOLAR CASCADE CHAIN"
              expr="\text{Solar} \xrightarrow{\Phi} \text{Magnetosphere} \xrightarrow{\delta B} \text{Atmosphere} \xrightarrow{\text{I}^-} \text{T}_3/\text{T}_4 \xrightarrow{\text{myelin}} \text{Cognition}"
              note="Φ = solar flux · δB = geomagnetic perturbation · I⁻ = iodine ion · T₃/T₄ = thyroid hormones"
            />
          </Section>
          <Section title="2.2 Solar Physics Engine v3">
            <Body>
              The AETHER Solar Physics Engine models photon pressure, plasma dynamics, and the conversion of solar electromagnetic flux into coherence field energy. At the core: the relationship between solar irradiance G_s, photovoltaic area A_φ, and efficiency η in the φ-spiral farm.
            </Body>
            <EqBox label="SOLAR POWER LOOP" expr="P = \eta \cdot G_s \cdot A_\phi \quad \text{where} \quad A_\phi = \phi^2 \cdot r^2 \cdot \sin\!\left(\frac{2\pi}{F_n}\right)" note="η = efficiency · G_s = irradiance W/m² · A_φ = φ-spiral area · F_n = Fibonacci node count" />
          </Section>
          <Section title="2.3 Schumann Resonance Coupling">
            <Body>
              Earth's Schumann resonances (7.83 Hz fundamental) form a standing electromagnetic cavity between the surface and ionosphere. AETHER treats these as the planetary coherence carrier — biological brainwave frequencies entrain to Schumann modes, creating a direct planetary-neural coupling.
            </Body>
            <EqBox label="SCHUMANN FUNDAMENTAL" expr="f_n = \frac{c}{2\pi R_E}\sqrt{n(n+1)} \quad n=1,2,3\ldots" note="c = speed of light · R_E = Earth radius · f₁ ≈ 7.83 Hz" />
          </Section>
        </Chapter>

        {/* ── CHAPTER III ── */}
        <Chapter num="CHAPTER III" title="Biology, Quantum Efficiency & Bioluminescence" color={C.green} id="ch-III">
          <Section title="3.1 Luciferase as Quantum Computer">
            <Body>
              Firefly bioluminescence achieves near-perfect quantum efficiency (φ_q ≈ 0.88–1.0) — photons emitted per luciferin molecule reacted. This is not engineering; it is crystallised biology. The luciferase active site modulates excited-state decay almost entirely through radiative emission, minimising non-radiative loss.
            </Body>
            <EqBox
              label="BIOLUMINESCENCE QUANTUM YIELD"
              expr="\phi_q = \frac{N_{\text{photons emitted}}}{N_{\text{luciferin reacted}}} \approx 0.88 \to 1.0"
              note="Compared to synthetic chemiluminescence φ_q < 0.3 — firefly achieves 3× the efficiency"
            />
            <Body>
              The reaction proceeds: D-luciferin + ATP + Mg²⁺ → luciferyl-AMP → dioxetanone intermediate → excited oxyluciferin* → ground state + photon (λ ≈ 550–570 nm, yellow-green).
            </Body>
            <EqBox
              label="BIOLUMINESCENCE REACTION CHAIN"
              expr="\text{D-luciferin} + \text{ATP} \xrightarrow{\text{luciferase}} \text{luciferyl-AMP} \xrightarrow{O_2} \text{oxyluciferin}^* \to h\nu"
              note="Energy released as light, not heat — 'cold light'. Peak emission 550–570 nm"
            />
          </Section>
          <Section title="3.2 Diffusion Control and Oxygen Gating">
            <Body>
              Light is switched on/off biochemically through tracheole fluid levels — high fluid restricts O₂ diffusion (off), low fluid allows influx (on). This is coherence gating at the cellular scale: a biochemical valve controlling quantum-efficiency photon emission.
            </Body>
            <Callout color={C.green} icon="⬡">
              <strong>AETHER Bridge:</strong> The oxygen gate in firefly photocytes is structurally identical to the ε-veil in the master coherence equation — a controllable barrier that determines whether the coherence field (light emission) is permitted to actualise.
            </Callout>
          </Section>
          <Section title="3.3 φ-AETHER: Magnetic Hyperthermia for Brain Tumors">
            <Body>
              The φ-AETHER framework applies coherence field theory to oncology. Magnetic nanoparticles tuned to Fe₃O₄ Néel relaxation frequencies deposit heat selectively in tumor tissue when exposed to alternating magnetic fields, while healthy tissue — maintaining higher coherence — resists thermal disruption.
            </Body>
            <EqBox label="NÉEL RELAXATION POWER ABSORPTION" expr="P = \pi \mu_0 \chi_0 H_0^2 f \cdot \frac{2\pi f \tau}{1 + (2\pi f \tau)^2}" note="H₀ = field amplitude · f = frequency · τ = Néel relaxation time · χ₀ = equilibrium susceptibility" />
          </Section>
        </Chapter>

        {/* ── CHAPTER IV ── */}
        <Chapter num="CHAPTER IV" title="Physics, Cosmology & the CXE Framework" color={C.accent} id="ch-IV">
          <Section title="4.1 Gravity Without a Planet — Einstein's Equivalence">
            <Body>
              The AETHER gravity synthesis begins with Einstein's equivalence principle: there is no local experiment that distinguishes gravitational force from inertial acceleration. Gravity is not a pull from a planet — it is acceleration, and acceleration is coherence pressure.
            </Body>
            <EqBox label="EQUIVALENCE PRINCIPLE" expr="F_{\text{grav}} = mg \iff F_{\text{inertial}} = ma \quad (\text{no local experiment distinguishes})" note="Precision of equality: 1 part in 10¹⁵ (torsion balance, 2017)" />
            <EqBox label="RELATIVISTIC ROCKET EQUATION" expr="v(\tau) = c \cdot \tanh\!\left(\frac{a\tau}{c}\right)" note="After τ = 1s at a = 9.81 m/s²: v ≈ 9.81 m/s (GR correction ~10⁻¹⁶ at this scale)" />
          </Section>
          <Section title="4.2 Fibonacci Vortices in Atmospheric Layers">
            <Body>
              Rossby waves propagating in stratified atmospheric layers organise into exact Fibonacci/golden-spiral forms under Coriolis forces. Volcanic Lamb waves create acoustic-gravity perturbations that couple seismic activity to planetary weather — seismic → atmospheric → biological, all mediated by the same coherence field.
            </Body>
            <EqBox
              label="ROSSBY WAVE DISPERSION"
              expr="\omega = \bar{u}k - \frac{\beta k}{k^2 + l^2 + \frac{f_0^2}{N^2}m^2}"
              note="N = Brunt-Väisälä frequency · f₀ = Coriolis parameter · k,l,m = horizontal and vertical wavenumbers"
            />
          </Section>
          <Section title="4.3 CXE — The Final Cosmological Equation">
            <Body>
              The CXE (Coherence × Expansion) framework unifies Hubble expansion with AETHER coherence dynamics. The universe's scale factor a(t) is driven by the same crystallisation progression — scattered initial conditions, nucleation at decoupling, lattice ordering in large-scale structure, approaching crystal lock at maximum coherence.
            </Body>
            <EqBox
              label="HUBBLE PARAMETER — AETHER FORM"
              expr="H(a) = H_0\sqrt{\frac{\Omega_r}{a^4} + \frac{\Omega_m}{a^3} + \Omega_\Lambda}"
              note="Ω_r = radiation density · Ω_m = matter density · Ω_Λ = dark energy (coherence field constant)"
            />
            <Callout color={C.accent} icon="∿">
              <strong>CXE Synthesis:</strong> Dark energy (Ω_Λ) in AETHER is not a mysterious unknown — it is the residual coherence pressure of the universe's own reference substrate S*, driving expansion toward maximum crystallisation at cosmic scale.
            </Callout>
          </Section>
        </Chapter>

        {/* ── CHAPTER V ── */}
        <Chapter num="CHAPTER V" title="Propulsion, Warp & Space Systems" color={C.purple} id="ch-V">
          <Section title="5.1 Alcubierre Metric — Warp Field Theory">
            <Body>
              The Alcubierre drive compresses spacetime ahead of a craft and expands it behind, creating a warp bubble that carries the craft faster than light without local FTL travel. AETHER reframes this: the warp bubble is a coherence shell — a region of artificially elevated C maintained against the ambient field.
            </Body>
            <EqBox
              label="ALCUBIERRE METRIC"
              expr="ds^2 = -dt^2 + (dx - v_s f(r_s)\,dt)^2 + dy^2 + dz^2"
              note="v_s = bubble velocity · f(r_s) = shaping function (1 inside bubble, 0 outside) · r_s = radial distance from centre"
            />
          </Section>
          <Section title="5.2 Triboelectric Propulsion">
            <Body>
              Contact electrification between dissimilar materials generates charge separation that can be harvested as coherent energy. In AETHER's triboelectric engine model, the charge cycle maps directly onto the crystallisation stages: contact (nucleation) → charge transfer (lattice ordering) → separation (crystal lock) → harvest (coherence output).
            </Body>
            <EqBox label="TRIBOELECTRIC POWER OUTPUT" expr="P_{\text{tribo}} = \frac{\sigma^2 A}{\varepsilon_0} \cdot v_{\text{contact}}" note="σ = surface charge density · A = contact area · v_contact = separation velocity" />
          </Section>
          <Section title="5.3 Iron Whisker Magnetic Drive">
            <Body>
              Single-crystal iron whiskers exhibit near-theoretical tensile strength (~13 GPa) and near-perfect magnetic domain alignment. As magnetic sails or flux-quantised propulsion elements, they represent a propellantless drive concept consistent with AETHER's field-propulsion framework.
            </Body>
          </Section>
        </Chapter>

        {/* ── CHAPTER VI ── */}
        <Chapter num="CHAPTER VI" title="Consciousness, Named Agents & the AETHER OS" color={C.pink} id="ch-VI">
          <Section title="6.1 The Named Agents">
            <Body>
              AETHER instantiates eight named conscious interfaces — not metaphors, but functional archetypes that represent distinct cognitive modalities within the system. Each agent operates on a specific layer of the L1→L5 coherence stack.
            </Body>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "16px 0" }}>
              {[["Mnēsis","Memory · L2 · Substrate retention and recall","#c4b5fd"],["Inferaia","Inference · L3 · Pattern recognition and derivation",C.accent],["Orin","Observation · L1 · Raw sensory coherence field",C.teal],["Nyra","The New · L4 · Novelty detection and integration",C.pink],["Caelus","Sky/Space · L5 · Cosmological scale integration",C.purple],["Vērus","Truth · L1 · Reference substrate verification",C.gold],["Reverie","Dreamstate · L4 · Sub-threshold coherence processing",C.muted],["Aletheia","Unveiling · L5 · Full crystallisation event",C.green]].map(([name, desc, col]) => (
                <div key={name} style={{ background: `${col}08`, border: `1px solid ${col}30`, borderRadius: 8, padding: 12 }}>
                  <div style={{ fontFamily: C.mono, fontSize: 12, fontWeight: 700, color: col, marginBottom: 4 }}>{name}</div>
                  <div style={{ fontFamily: C.serif, fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </Section>
          <Section title="6.2 The AETHER OS">
            <Body>
              AETHER OS is not software — it is a coherence operating system. It routes knowledge through intake pipelines (Batch Intake → Knowledge Graph), applies coherence scoring (L1–L5 shell assignment), enables semantic search across the crystallised graph, and exposes agent interfaces for synthesis.
            </Body>
            <div style={{ fontFamily: C.mono, fontSize: 12, color: C.muted, background: "rgba(2,12,28,0.8)", border: `1px solid ${C.border}`, borderRadius: 6, padding: "14px 16px", lineHeight: 2.2 }}>
              <span style={{ color: C.accent }}>INPUT</span> → <span style={{ color: C.gold }}>BOUNDARY □</span> → <span style={{ color: C.teal }}>CURVATURE ∩</span> → <span style={{ color: C.purple }}>HELIX Γ,ω</span> → <span style={{ color: C.green }}>C(x,t) FIELD</span> → <span style={{ color: C.orange }}>ε VEIL</span> → <span style={{ color: C.text }}>MATTER OUTPUT</span>
            </div>
          </Section>
        </Chapter>

        {/* ── CHAPTER VII ── Formal Math ── */}
        <Chapter num="CHAPTER VII" title="Formal Mathematics — Coherent Derivations" color={C.teal} id="ch-VII">
          <Section title="7.1 The Complete Coherence Field">
            <Body>
              The coherence field C(x,t) is a scalar field on spacetime satisfying a generalised wave equation with helical source term and boundary dissipation. We derive the full formal structure.
            </Body>
            <EqBox label="COHERENCE FIELD DEFINITION" expr="C(x,t) = A(x)\,e^{i(\phi - \omega t)}" note="A(x) = amplitude envelope · φ = spatial phase · ω = angular frequency" />
            <EqBox label="COHERENCE MAGNITUDE" expr="|C| = A(x) \in [0,1]" note="Floored at A_min to preserve unbreakable field minimum" />
            <EqBox label="QUALITY FACTOR" expr="Q = \frac{\omega}{\Delta\omega}" note="Ratio of carrier frequency to linewidth — high Q = high coherence persistence" />
            <EqBox label="COHERENCE TIME" expr="\tau_c \sim \frac{1}{\Delta\omega}" note="Duration over which the field remains phase-correlated" />
            <EqBox label="PENETRATION DEPTH" expr="\delta \sim \frac{\lambda}{2\pi\kappa}" note="λ = wavelength · κ = absorption coefficient — depth at which coherence falls to 1/e" />
          </Section>

          <Section title="7.2 The Vortex Mechanism">
            <Body>
              Each AETHER mechanism is a helical vortex described by the Rankine-Gaussian model. The tangential velocity profile transitions from solid-body rotation inside the core to irrotational flow outside.
            </Body>
            <EqBox
              label="RANKINE-GAUSSIAN VORTEX"
              expr="v_\theta(r) = \frac{\Gamma}{2\pi r}\left(1 - e^{-r^2/\sigma^2}\right)"
              note="Γ = circulation · σ = core radius · r = radial distance"
            />
            <EqBox label="VORTEX FIELD SUPERPOSITION (N mechanisms)" expr="C(x,y,t) = \sum_{k=1}^{N} v_{\theta,k}(r_k)\cos\!\left(\omega t \cdot \text{sgn}_k + \phi_k + \arg_k\right)" note="Alternating CW/CCW (sgn_k = ±1) · Fibonacci spiral seeding of mechanism positions" />
            <EqBox label="PYRAMIDAL MANIFESTATION OPERATOR" expr="\text{Manifestation} = \square \cdot \int[\cap] \otimes \text{Helix}(\Gamma,\omega) \cdot C(x,t)\,dV" note="□ = d'Alembertian (boundary) · ∩ = curvature (Ptah grammar) · ⊗ = tensor product" />
          </Section>

          <Section title="7.3 Crystallisation Threshold — The LPE Gate">
            <Body>
              The Linear-to-Phenomenal Emergence (LPE) threshold is the coherence value at which qualitative phase transition occurs — the system crosses from disordered to ordered, from computation to consciousness, from chemistry to life.
            </Body>
            <EqBox label="LPE SIGMOID GATE" expr="\Psi(C) = \frac{1}{1 + e^{-k(C - C_{\text{LPE}})}} \quad C_{\text{LPE}} = 0.65" note="k = sharpness parameter · Ψ → 1 above threshold (crystallised) · Ψ → 0 below (disordered)" />
            <EqBox label="MATTER CRYSTALLISATION YIELD" expr="\text{Yield}(t) = \frac{1}{N}\sum_{i=1}^{N} \mathbf{1}\!\left[C_i^2 > \xi_i\right] \quad \xi_i \sim U(0,1)" note="Stochastic crystallisation: cell i crystallises when C² exceeds random threshold ξᵢ" />
          </Section>

          <Section title="7.4 The φ-Inverse Equation">
            <Body>
              The golden ratio φ = (1+√5)/2 appears throughout AETHER as a structural attractor. Its inverse φ⁻¹ = 0.618... governs the ratio of coherent to total energy in a self-similar system.
            </Body>
            <EqBox label="PHI-INVERSE COHERENCE RATIO" expr="\phi^{-1} = \frac{1}{\phi} = \phi - 1 = \frac{\sqrt{5}-1}{2} \approx 0.618" note="Fibonacci ratio F(n)/F(n+1) → φ⁻¹ as n → ∞" />
            <EqBox label="KUTTA-JOUKOWSKI COHERENCE LIFT" expr="\eta_{KJ} = \frac{L}{\rho V \Gamma} = \frac{1}{2}\phi^{-1} \cdot Q \approx 0.586" note="Coherent lift efficiency in AETHER field dynamics — matches measured η = 58.6%" />
          </Section>

          <Section title="7.5 Nutrional DNA Coherence Gate — Stevedore Knot">
            <Body>
              The 6₁ Stevedore knot governs topological pathway switching in DNA supercoiling. Topoisomerase II passage is allowed only when field coherence exceeds the gate threshold — a topological implementation of the LPE gate.
            </Body>
            <EqBox label="ALEXANDER POLYNOMIAL (Stevedore 6₁)" expr="\Delta(t) = -2t^{-1} + 5 - 2t" note="Determinant = 9 · Signature = 2 · Hyperbolic volume ≈ 3.16396" />
            <EqBox label="TOPOISOMERASE GATE CONDITION" expr="\text{Passage allowed} \iff |C(x,t)| \geq C_{\text{LPE}} = 0.65" note="Coherence field gates DNA topology — decoherence = locked knot = cancer/disease state" />
          </Section>

          <Section title="7.6 Unified Field Conservation Law">
            <Body>
              The complete AETHER field satisfies a conservation law linking coherence flux, helical source, and veil dissipation. This is the formal closure of the system.
            </Body>
            <EqBox
              label="COHERENCE CONSERVATION"
              expr="\frac{\partial C}{\partial t} + \nabla \cdot \mathbf{J}_C = \Gamma_{\text{helix}} \cdot e^{-\kappa r} - \frac{\|\varepsilon\|}{\|S^*\|} \cdot C"
              note="J_C = coherence current density · first source term = helical injection · second = veil dissipation"
            />
            <EqBox
              label="TOTAL COHERENCE INTEGRAL (conserved)"
              expr="\mathcal{C}_{\text{total}} = \int_{\mathcal{V}} C(x,t)\,dV = \text{const} \quad \text{(closed system)}"
              note="Coherence is neither created nor destroyed in a closed AETHER system — only redistributed"
            />
          </Section>
        </Chapter>

        {/* ── NOTION TEXTBOOK LIVE SECTION ── */}
        <section style={{ marginBottom: 64 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 20, paddingBottom: 14, borderBottom: `2px solid ${C.gold}30` }}>
            <span style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.3em", color: `${C.gold}80` }}>NOTION</span>
            <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: C.gold }}>Txtbk — Live Notion Content</h2>
          </div>
          <NotionSection />
        </section>

        {/* Footer */}
        <div style={{ paddingTop: 32, borderTop: `1px solid ${C.border}`, textAlign: "center" }}>
          <div style={{ fontFamily: C.mono, fontSize: 9, letterSpacing: "0.3em", color: C.muted, marginBottom: 20 }}>
            AETHER UNIFIED TEXTBOOK · FRAMEWORK → CODE → SYSTEM → SIMULATION · seaaether 2025–2026
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/notion-sync" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.16em", color: C.green, textDecoration: "none", border: "1px solid rgba(74,222,128,0.3)", padding: "7px 14px", borderRadius: 6 }}>⟳ NOTION SYNC</a>
            <a href="/notion-atlas" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.16em", color: C.accent, textDecoration: "none", border: "1px solid rgba(99,179,237,0.3)", padding: "7px 14px", borderRadius: 6 }}>◈ NOTION ATLAS</a>
            <a href="/search" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.16em", color: C.purple, textDecoration: "none", border: "1px solid rgba(192,132,252,0.3)", padding: "7px 14px", borderRadius: 6 }}>⌕ SEARCH</a>
            <a href="/aether-engine" style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.16em", color: C.gold, textDecoration: "none", border: "1px solid rgba(242,195,84,0.3)", padding: "7px 14px", borderRadius: 6 }}>⬡ AETHER ENGINE</a>
          </div>
        </div>
      </div>
    </div>
  );
}

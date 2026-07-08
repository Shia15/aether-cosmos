import { useEffect, useRef } from "react";
import { Link } from "wouter";
import refImg from "@assets/image_(27)_1778042504322.jpg";

/* ──────────────────────────────────────────────────────────────────────
   AETHER · Unified Synthesis v3.0
   Chemical Signals, Biological Computation & the Coherence
   Architecture of Life. Faithful React port of the user's HTML.
   ─────────────────────────────────────────────────────────────────── */

const T = {
  ink: "#0a0c08",
  parchment: "#ffffff",
  gold: "#c8a84b",
  goldDim: "#8a6f2c",
  sage: "#4a6741",
  rose: "#9b4a5a",
  cerulean: "#2a5f7a",
  amber: "#d4762a",
  doc: "#3a6b3a",
  est: "#7a5a1a",
  hyp: "#5a2a6b",
  border: "rgba(200,168,75,0.25)",
  textDim: "#6b6050",
  /* Brighter variants for use on the dark masthead/nav (#0a0c08).
     Architect WCAG audit: original textDim 3.19:1 and goldDim 4.11:1
     fail AA at 9-10px on dark surfaces. These pass ≥4.5:1. */
  goldDimOnDark: "#d4b465",
  textDimOnDark: "#a39880",
  serif: "'Cormorant Garamond', 'Iowan Old Style', Georgia, serif",
  display: "'Cinzel', 'Trajan Pro', serif",
  mono: "'JetBrains Mono', 'Source Code Pro', monospace",
};

function Chip({ kind, children }: { kind: "doc"|"est"|"hyp"|"sys"; children: React.ReactNode }) {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    doc: { fg: "#6abf6a", bg: "rgba(58,107,58,0.12)", border: T.doc },
    est: { fg: "#c8a84b", bg: "rgba(122,90,26,0.12)", border: T.est },
    hyp: { fg: "#b87adf", bg: "rgba(90,42,107,0.12)", border: T.hyp },
    sys: { fg: "#7abfdf", bg: "rgba(42,95,122,0.1)", border: T.cerulean },
  };
  const c = colors[kind];
  return (
    <span style={{
      fontFamily: T.mono, fontSize: 9, letterSpacing: "0.16em",
      textTransform: "uppercase", padding: "4px 10px", borderRadius: 2,
      border: `1px solid ${c.border}`, color: c.fg, background: c.bg,
    }}>{children}</span>
  );
}

function Tag({ kind, children = kind.toUpperCase() }: { kind: "doc"|"est"|"hyp"; children?: React.ReactNode }) {
  const colors: Record<string, { fg: string; bg: string; border: string }> = {
    doc: { fg: T.doc, bg: "rgba(58,107,58,0.15)", border: "rgba(58,107,58,0.3)" },
    est: { fg: T.est, bg: "rgba(122,90,26,0.15)", border: "rgba(122,90,26,0.3)" },
    hyp: { fg: T.hyp, bg: "rgba(90,42,107,0.15)", border: "rgba(90,42,107,0.3)" },
  };
  const c = colors[kind];
  return (
    <span style={{
      display: "inline-block", fontFamily: T.mono, fontSize: 8, letterSpacing: "0.08em",
      padding: "2px 6px", borderRadius: 2, textTransform: "uppercase",
      verticalAlign: "middle", marginLeft: 4,
      background: c.bg, color: c.fg, border: `1px solid ${c.border}`,
    }}>{children}</span>
  );
}

function Claim({ kind, tag, children }: { kind: "doc"|"est"|"hyp"; tag: string; children: React.ReactNode }) {
  const colors: Record<string, { border: string; bg: string }> = {
    doc: { border: T.doc, bg: "rgba(58,107,58,0.04)" },
    est: { border: T.est, bg: "rgba(122,90,26,0.04)" },
    hyp: { border: T.hyp, bg: "rgba(90,42,107,0.04)" },
  };
  const c = colors[kind];
  return (
    <div data-testid={`claim-${kind}`} style={{
      borderLeft: `3px solid ${c.border}`, background: c.bg,
      padding: "14px 18px", margin: "20px 0", fontSize: 15, lineHeight: 1.65,
    }}>
      <span style={{
        fontFamily: T.mono, fontSize: 8, letterSpacing: "0.16em",
        textTransform: "uppercase", display: "block", marginBottom: 6,
        color: c.border,
      }}>{tag}</span>
      {children}
    </div>
  );
}

function Section({ id, label, title, accent, children }: {
  id: string; label: string; title: string; accent?: string; children: React.ReactNode;
}) {
  return (
    <div id={id} data-testid={`section-${id}`} style={{
      padding: "56px 0 40px", borderBottom: `1px solid ${T.border}`,
    }}>
      <div style={{
        fontFamily: T.mono, fontSize: 9, letterSpacing: "0.24em",
        color: T.goldDim, textTransform: "uppercase", marginBottom: 10,
      }}>{label}</div>
      <div style={{
        fontFamily: T.display, fontSize: "clamp(18px, 3vw, 26px)",
        fontWeight: 400, lineHeight: 1.3, color: T.ink, marginBottom: 18,
        letterSpacing: "0.5px",
      }}>
        {title} {accent && <span style={{ color: T.goldDim }}>{accent}</span>}
      </div>
      {children}
    </div>
  );
}

function Card({ label, title, children, tags }: {
  label: string; title: string; children: React.ReactNode; tags?: React.ReactNode;
}) {
  return (
    <div style={{
      border: `1px solid ${T.border}`, padding: 24,
      background: "rgba(255,255,255,0.4)", position: "relative",
    }}>
      <div style={{
        fontFamily: T.mono, fontSize: 8, letterSpacing: "0.24em",
        textTransform: "uppercase", color: T.goldDim, marginBottom: 8,
      }}>{label}</div>
      <h3 style={{
        fontFamily: T.display, fontSize: 14, fontWeight: 400,
        letterSpacing: "0.04em", marginBottom: 10, color: T.ink,
      }}>{title}</h3>
      <div style={{ fontSize: 14, lineHeight: 1.65, color: "#3a3530" }}>{children}</div>
      {tags && <div style={{ marginTop: 10 }}>{tags}</div>}
    </div>
  );
}

function MathBlock({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: "rgba(10,12,8,0.04)", border: "1px solid rgba(200,168,75,0.2)",
      padding: "18px 22px", margin: "18px 0",
      fontFamily: T.mono, fontSize: 13, lineHeight: 1.8, overflowX: "auto",
      whiteSpace: "pre-wrap",
    }}>{children}</div>
  );
}
function MathLabel({ children, mt = 0 }: { children: React.ReactNode; mt?: number }) {
  return <div style={{
    fontFamily: T.mono, fontSize: 9, letterSpacing: "0.16em",
    textTransform: "uppercase", color: T.goldDim,
    marginBottom: 8, marginTop: mt,
  }}>{children}</div>;
}

const NAV = [
  { id: "core", label: "Overview" },
  { id: "voc", label: "Floral VOC" },
  { id: "bridge", label: "Coherence Bridge" },
  { id: "tme", label: "Cancer TME" },
  { id: "mirror", label: "Aether Mirror" },
  { id: "ladder", label: "Scale Ladder" },
  { id: "equations", label: "Equations" },
  { id: "impact", label: "Impact" },
];

const STATE_VEC: { name: string; sym: string; pct: number }[] = [
  { name: "Valence",   sym: "v", pct: 65 },
  { name: "Intensity", sym: "ι", pct: 40 },
  { name: "Clarity",   sym: "κ", pct: 78 },
  { name: "Conflict",  sym: "χ", pct: 22 },
  { name: "Agency",    sym: "α", pct: 55 },
  { name: "Novelty",   sym: "ν", pct: 30 },
  { name: "Social",    sym: "σ", pct: 48 },
  { name: "Somatic",   sym: "ς", pct: 60 },
];

const PIPE = [
  { n: "01", t: "HS-SPME",         s: "Non-destructive headspace solid-phase microextraction · VOC capture" },
  { n: "02", t: "GC Separation",   s: "Fused-silica column · polyimide coating · deactivated stationary phase" },
  { n: "03", t: "MS ID + Quant",   s: "Agilent Ultra Inert · Aᵢ peak area · RFᵢ response factor calibration" },
  { n: "04", t: "EAG Recording",   s: "Antennal receptor potentials · Hill-type dose-response · mV depolarization" },
  { n: "05", t: "Behavioral Assay",s: "Softmax pollinator preference model · β scent sensitivity coefficient" },
  { n: "06", t: "Evo Dynamics",    s: "Breeder's equation · G-matrix · Δz⃗ = G·β selection gradient" },
];

const BRIDGE_ROWS: (string|React.ReactNode)[][] = [
  ["Signal vector",   "V⃗ (VOC bouquet, n compounds)", "X(t) (multi-omic state)",          "S⃗ (8D emotional state)",     "Sense"],
  ["Target state",    "α⃗ (receptor tuning curve)",    "X*(t) (coherent immune state)",    "S*(t) (regulated target state)","—"],
  ["Error",           "‖V⃗ − α⃗‖ (EAG loss)",          "E(t) = X*(t) − X(t)",              "δS = S*(t) − S⃗",              "Feedback"],
  ["Coherence metric",<>cosine(V⃗<sub>q</sub>, V⃗<sub>ref</sub>) &gt; 0.85</>, <>C(x,t) = 1 − ‖E‖/‖X*‖</>, "Routing confidence score", "—"],
  ["Intervention",    "Transgenic synthase restoration","Synthetic cytokine release",       "Agent routing (Infernia/Aletheia)","Activate"],
  ["Learning",        "G-matrix selection gradient",   "PACE meta-learning circuit",       "Session history update",       "Learn"],
  ["Substrate",       "Terpene synthase loci",         "Anthrobot + synthetic genome",     "MediaPipe + OpenCV",           "—"],
];

const LADDER: (string|React.ReactNode)[][] = [
  ["1", "Quantum / NV",        "φ-diamond NV clock",       "Spin coherence T₂",                <>T₂ × 1.618 extension</>,                  "Pythagoras",          <Tag kind="hyp" />],
  ["2", "Molecular / VOC",     "Terpene synthase loci",    "V⃗ (bouquet vector)",              <>cosine(V⃗<sub>q</sub>, α⃗) &gt; 0.85</>, "Infernia",            <Tag kind="doc" />],
  ["3", "Neural / EAG",        "Bumblebee antennae",       <>R<sub>total</sub> (mV depol.)</>,  <>Hill-dose R / R<sub>max</sub></>,        "Reverie",             <Tag kind="doc" />],
  ["4", "Cellular / TME",      "Anthrobot in tumor",       "X(t) (scRNA-seq state)",           <>C(x,t) = 1 − ‖E‖/‖X*‖</>,                "AETHER (Layer 0)",    <Tag kind="est" />],
  ["5", "Biological / Organ",  "Aqua CXE biosensor",       "SpO₂, HRV, glucose",               "SOC/FQP coherence index",                  "Mnesis",              <Tag kind="est" />],
  ["6", "Psychological",       "Aether Mirror (wall)",     "S⃗ (8D emotional state)",          <>C<sub>emotional</sub>(t)</>,             "Aletheia",            <><Tag kind="doc">DOC</Tag> arch.</>],
  ["7", "Ecological / Floral", "Flower + pollinator dyad", "V⃗ + P(bee|V⃗)",                   "Syndrome cosine ≥ 0.85",                   "Russell",             <Tag kind="doc" />],
  ["8", "Atmospheric",         "Schumann + ionosphere",    "ELF resonance frequencies",        "Phase lock with Layer 0",                  "AETHER (Layer 0)",    <Tag kind="hyp" />],
  ["9", "Cosmological",        "Solar wind / cosmic rays", "R = Φ × N × σ",                    "φ-lock coherence output",                  "Pythagoras / Russell",<Tag kind="hyp" />],
];

function UnifiedSynthesisHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const layers=5;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      for(let l=0;l<layers;l++){
        const frac=l/layers;
        const r=15+l*14+5*Math.sin(t*0.04+l*0.7);
        const col=["#2ef0d8","#9966ff","#c9a84c","#44aaff","#44cc77"][l];
        ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.strokeStyle=col+"44";ctx.lineWidth=0.8;ctx.stroke();
        const dotAngle=t*0.03*(l+1);
        const dx=cx+r*Math.cos(dotAngle),dy=cy+r*Math.sin(dotAngle)*0.55;
        ctx.beginPath();ctx.arc(dx,dy,3,0,Math.PI*2);ctx.fillStyle=col+"99";ctx.fill();
        ctx.fillStyle=col+"44";ctx.font="7px 'DM Mono',monospace";ctx.textAlign="center";
        ctx.fillText(["L1","L2","L3","L4","L5"][l],cx+r*1.15*Math.cos(dotAngle+0.2),cy+r*0.55*Math.sin(dotAngle+0.2)*1.1+3);
        ctx.textAlign="left";
        void frac;
      }
      ctx.beginPath();ctx.arc(cx,cy,5,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.6)";ctx.fill();
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UNIFIED SYNTHESIS · LAYER CONVERGENCE · CRYSTALLIZATION · COHERENT MERGE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UnifiedSynthesisPage() {
  useEffect(() => {
    const id = "unified-synthesis-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@300;400;500&family=Cinzel:wght@400;600&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div data-testid="page-unified-synthesis" style={{
      background: T.parchment, color: T.ink, fontFamily: T.serif,
      fontSize: 17, lineHeight: 1.7, minHeight: "100vh", width: "100%",
    }}>
      {/* MASTHEAD */}
      <div style={{
        background: T.parchment, color: T.ink,
        padding: "56px 48px 40px", position: "relative", overflow: "hidden",
        borderBottom: `1px solid ${T.border}`,
      }}>
        <div style={{ position: "relative" }}>
          <div style={{
            fontFamily: T.mono, fontSize: 10, letterSpacing: "0.24em",
            color: T.goldDim, textTransform: "uppercase", marginBottom: 20,
          }}>AetherLife.co · @StrategicProce · Synthesis Document v3.0 · April 2026</div>
          <h1 style={{
            fontFamily: T.display, fontSize: "clamp(22px, 5vw, 42px)",
            fontWeight: 400, letterSpacing: "1px", lineHeight: 1.2, color: T.ink,
          }}>
            AETHER <em style={{ color: T.gold, fontStyle: "normal" }}>Unified Synthesis</em><br />
            Chemical Signals, Biological Computation<br />
            &amp; the Coherence Architecture of Life
          </h1>
          <div style={{
            marginTop: 14, fontSize: 15, color: T.textDim,
            fontStyle: "italic", maxWidth: 680, lineHeight: 1.6,
          }}>
            Integrating floral volatile chemistry (FloralScentSim), emotional state routing
            (Aether Mirror), tumor microenvironment coherence collapse, and AETHER's
            scale-invariant loop — from pollinator EAG neural response to cancer remission
            via the same five-phase mathematics.
          </div>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 10 }}>
            <Chip kind="doc">DOC — Documented</Chip>
            <Chip kind="est">EST — Estimated</Chip>
            <Chip kind="hyp">HYP — Hypothetical/Novel</Chip>
            <Chip kind="sys">SYS — System Architecture</Chip>
          </div>
        </div>
      </div>

      {/* NAV RAIL */}
      <div style={{
        background: T.parchment, borderBottom: `1px solid ${T.border}`,
        padding: "0 48px", display: "flex", overflowX: "auto",
      }}>
        {NAV.map(n => (
          <a
            key={n.id}
            href={`#${n.id}`}
            data-testid={`nav-${n.id}`}
            style={{
              fontFamily: T.mono, fontSize: 10, letterSpacing: "0.16em",
              textTransform: "uppercase", color: T.textDim,
              padding: "14px 20px", textDecoration: "none",
              borderBottom: "2px solid transparent", whiteSpace: "nowrap",
              borderRight: "1px solid rgba(200,168,75,0.1)",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = T.gold; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = T.textDim; }}
          >{n.label}</a>
        ))}
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 48px 80px" }}>

        {/* §1 OVERVIEW */}
        <Section id="core" label="§1 — Core Claim"
          title="One Loop. Every Scale." accent="Coherence as the Universal Substrate.">
          <p style={p}>Three bodies of work — the floral volatile chemistry pipeline (FloralScentSim), the Aether Mirror emotional state detection system, and the AETHER closed-loop oncology architecture — are not adjacent projects. They are the same five-phase loop running on different substrates at different timescales.</p>
          <Claim kind="hyp" tag="HYP — Unifying Hypothesis">
            The same mathematical structure — Sense → Deliver → Activate → Feedback → Learn — governs: (1) how a bumblebee antenna depolarizes in response to <em>M. lewisii</em> monoterpenes, (2) how a CLCS-Bio Anthrobot corrects tumor-immune coherence in a glioblastoma microenvironment, and (3) how the Aether Mirror routes an emotional state vector to the appropriate therapeutic agent. The substrate differs; the loop is identical.
          </Claim>

          {/* Reference image */}
          <figure style={{ margin: "32px 0 8px", border: `1px solid ${T.border}`, background: "rgba(200,168,75,0.04)", padding: 12 }}>
            <img
              src={refImg}
              alt="AETHER reference figure: Landau-Ginzburg models, bio-interface, toroidal waves, Fibonacci anyons, mycelium-ferrofluid hybrids, neuromorphic chips, glass-box resonance"
              style={{ width: "100%", display: "block", borderRadius: 2 }}
            />
            <figcaption style={{
              fontFamily: T.mono, fontSize: 10, letterSpacing: "0.12em",
              color: T.goldDim, textAlign: "center", marginTop: 10, textTransform: "uppercase",
            }}>
              Figure · Six anchors of the synthesis · Landau-Ginzburg ↔ Fibonacci anyons ↔ mycelium-ferrofluid hybrids ↔ glass-box resonance
            </figcaption>
          </figure>

          <div style={legend}>
            {[
              { c: T.doc, t: "Documented — directly supported by empirical data or peer-reviewed literature" },
              { c: T.est, t: "Estimated — derived by reasonable extrapolation from documented findings" },
              { c: T.hyp, t: "Hypothetical — novel claim requiring experimental validation" },
            ].map((l, i) => (
              <div key={i} style={legendItem}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: l.c }} />
                {l.t}
              </div>
            ))}
          </div>
        </Section>

        {/* §2 VOC */}
        <Section id="voc" label="§2 — FloralScentSim · Floral Volatile Chemistry"
          title="The Chemical Language" accent="as Coherent Signal Vector">
          <p style={p}>Floral volatiles are not decorative. They are a multidimensional signal vector mediating reproductive success — a chemical computation whose output is pollinator visitation probability. The <em>Mimulus</em> monkeyflower system provides one of the cleanest empirical windows into this.</p>
          <Claim kind="doc" tag="DOC — Byers et al. 2014 / Neequaye et al. 2025">
            <em>M. lewisii</em> emits D-limonene, β-myrcene, and trans-β-ocimene at ≈93% of total volatile bouquet (E<sub>limonene</sub> ≈ 55.1 ± 23.2 ng·flower⁻¹·h⁻¹), eliciting ~92% maximum EAG depolarization in bumblebee antennae. <em>M. cardinalis</em> has lost &gt;99% of these volatiles via OCIMENE SYNTHASE locus downregulation, yielding ~10% EAG response. This chemical divergence creates reproductive isolation in sympatry.
          </Claim>

          <div style={{ margin: "28px 0 8px" }}>
            <div style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: "0.24em",
              color: T.goldDim, textTransform: "uppercase", marginBottom: 10,
            }}>The Analytical Pipeline</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {PIPE.map((s, i) => (
                <div key={i} style={{
                  flex: 1, minWidth: 150, padding: "18px 16px",
                  border: `1px solid ${T.border}`, borderRight: i === PIPE.length - 1 ? `1px solid ${T.border}` : "none",
                  background: "rgba(255,255,255,0.3)",
                }}>
                  <div style={{ fontFamily: T.mono, fontSize: 22, color: "rgba(200,168,75,0.4)", marginBottom: 6 }}>{s.n}</div>
                  <div style={{ fontFamily: T.display, fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 6 }}>{s.t}</div>
                  <div style={{ fontSize: 11, lineHeight: 1.5, color: T.textDim }}>{s.s}</div>
                </div>
              ))}
            </div>
          </div>

          <MathBlock>
            <MathLabel>Volatile Emission Rate</MathLabel>
            E<sub>i</sub> = (A<sub>i</sub> · RF<sub>i</sub>) / (t · N<sub>f</sub>)    [ng·flower⁻¹·h⁻¹]
            <MathLabel mt={14}>Normalized Bouquet Vector</MathLabel>
            V⃗ = (v<sub>1</sub>, v<sub>2</sub>, …, v<sub>n</sub>),   v<sub>i</sub> = E<sub>i</sub> / Σ E<sub>j</sub>,   Σ v<sub>i</sub> = 1
            <MathLabel mt={14}>EAG Hill-Type Dose Response</MathLabel>
            R(c<sub>i</sub>) = R<sub>max</sub> · c<sub>i</sub><sup>h</sup> / (EC<sub>50</sub><sup>h</sup> + c<sub>i</sub><sup>h</sup>)    [h ≈ 1–2 for monoterpenes]
            <MathLabel mt={14}>Total EAG (Dot Product)</MathLabel>
            R<sub>total</sub>(V⃗) = α⃗ · V⃗    [receptor tuning curve α⃗]
            <MathLabel mt={14}>Evolutionary Selection (Breeder's Equation)</MathLabel>
            Δz⃗ = G · β    [G-matrix × selection gradient → scent vector shift]
          </MathBlock>

          <Claim kind="doc" tag="DOC — Evolutionary simulation">
            The ODE evolution model dV⃗/dt = S(V⃗) − μV⃗ reproduces the observed near-total scent loss trajectory of <em>M. cardinalis</em> in fewer than 50 simulated generations under hummingbird-biased pollinator pressure. Large-effect regulatory mutations at OCIMENE SYNTHASE loci are sufficient; morphological divergence follows via smaller-effect loci.
          </Claim>
        </Section>

        {/* HIGHLIGHT BAND */}
        <div style={{
          background: "rgba(200,168,75,0.06)", color: T.ink,
          padding: "36px 48px", margin: "40px -48px",
          borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}`,
          borderLeft: `4px solid ${T.gold}`,
        }}>
          <div style={{
            fontSize: "clamp(16px, 2.5vw, 22px)", fontStyle: "italic",
            lineHeight: 1.5, maxWidth: 760, color: T.ink,
          }}>
            "The floral volatile bouquet is not a decoration — it is a chemical state vector
            whose coherence with the pollinator's receptor tuning curve determines reproductive
            fitness. Loss of that coherence is speciation. The same equation describes
            tumor-immune coherence collapse."
          </div>
          <div style={{
            marginTop: 14, fontFamily: T.mono, fontSize: 9,
            letterSpacing: "0.16em", color: T.goldDim, textTransform: "uppercase",
          }}>AETHER Framework · Coherence Bridge Hypothesis · HYP</div>
        </div>

        {/* §3 BRIDGE */}
        <Section id="bridge" label="§3 — The Coherence Bridge · Novel Integration"
          title="From Pollinator Syndrome Loss" accent="to Tumor Microenvironment Collapse">
          <p style={p}>The deepest structural insight in this synthesis is the formal parallel between floral VOC coherence loss and tumor microenvironment (TME) coherence collapse. Both are instances of the same mathematical event: a signal vector drifting away from the receptor tuning curve of its target biological system, with catastrophic consequences for the host.</p>
          <div style={twoCol}>
            <Card label="Floral System" title="Pollination Syndrome Drift">
              <strong>Signal vector:</strong> V⃗ (normalized VOC bouquet)<br />
              <strong>Receptor system:</strong> Bee antennal olfactory neurons, tuning curve α⃗<br />
              <strong>Coherence metric:</strong> R<sub>total</sub> = α⃗ · V⃗ (dot product alignment)<br />
              <strong>Coherence loss:</strong> OCIMENE SYNTHASE downregulation → V⃗ → 0<br />
              <strong>Consequence:</strong> Reproductive isolation, speciation
            </Card>
            <Card label="Oncology System" title="Tumor Microenvironment Collapse">
              <strong>Signal vector:</strong> X(t) (scRNA-seq coherence state vector)<br />
              <strong>Receptor system:</strong> Immune cell signaling network, target X*(t)<br />
              <strong>Coherence metric:</strong> C(x,t) = 1 − ‖E(t)‖/‖X*(t)‖<br />
              <strong>Coherence loss:</strong> PD-L1 upregulation → T-cell exhaustion → immune evasion<br />
              <strong>Consequence:</strong> Uncontrolled proliferation, metastasis
            </Card>
          </div>
          <Claim kind="hyp" tag="HYP — Bridge Hypothesis (Novel — Requires Experimental Validation)">
            Both events are formally equivalent: a biological signal vector losing alignment with its target receptor system, measured by a coherence functional analogous to cosine similarity. The threshold for "pollinator shift" (cosine similarity &gt; 0.85 in FloralScentSim) and the CLCS coherence collapse threshold (C(x,t) → 0) are the same mathematical event at different biological scales. Restoration strategies — transgenic OCIMENE SYNTHASE reinsertion in floral systems, CLCS-Bio cytokine payload release in TME — are structurally identical interventions: restoring the signal vector to alignment with its receptor tuning curve.
          </Claim>

          <div style={{ overflowX: "auto" }}>
            <table style={tbl}>
              <thead>
                <tr>
                  {["Parameter", "Floral VOC System", "Tumor Microenvironment", "Aether Mirror", "AETHER Loop Phase"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BRIDGE_ROWS.map((row, i) => (
                  <tr key={i}>
                    {row.map((c, j) => <td key={j} style={td}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* §4 TME */}
        <Section id="tme" label="§4 — Cancer Research · Biological Computation"
          title="Coherence Failure as" accent="the Unified Oncology Model">
          <p style={p}>The CLCS framework treats cancer not as a genetic accident but as a multi-scale coherence failure — a tumor microenvironment in which the normal signal-receptor alignment between cancer cells, immune cells, and stromal tissue has collapsed across every biological layer simultaneously.</p>
          <Claim kind="doc" tag="DOC — 2025 trial data, ferrofluid-chemotherapy hybrids">
            Approximately 59% glioblastoma kill rates have been reported in 2025 trials using ferrofluid-chemotherapy hybrids. Mycelium-assisted precision medicine has shown 70–80% response rates in early studies. These are interpreted within the AETHER framework as evidence that closing the feedback loop between sensing (mycelium spatial mapping via DBiT-Plus) and intervention (ferrofluid magnetic guidance) yields emergent system behavior exceeding open-loop approaches.
          </Claim>
          <Claim kind="est" tag="EST — Extrapolated from CLCS formalism">
            The coherence state vector X(t) in a glioblastoma TME spans proliferation rate, immune infiltration (CD8+ T-cell density, Treg suppression index), angiogenic signaling, metabolic flux, and PD-L1 expression. The target state X*(t) is a tumor-immune relational equilibrium in which CD8+ cytotoxicity exceeds immunosuppressive pressure. The CLCS biochemical repressilator circuit computes E(t) = X*(t) − X(t) in real time, triggering synthetic cytokine payload release when ‖E‖ exceeds the intervention threshold.
          </Claim>
          <div style={threeCol}>
            <Card label="Phase 1–2 · Deployment" title="Sense + Baseline"
              tags={<><Tag kind="doc" /><Tag kind="hyp">HYP (in vivo)</Tag></>}>
              Anthrobot-derived human cells injected into TME. No immune rejection. scRNA-seq establishes initial X(t) baseline. Mycelium hyphae network begins spatial coherence mapping (L7 — in vivo deployment target).
            </Card>
            <Card label="Phase 3–5 · Intervention" title="Error → Actuation → Replication"
              tags={<><Tag kind="est" /><Tag kind="hyp" /></>}>
              Repressilator circuit computes E(t). Riboswitch logic gates trigger synthetic cytokine release. New agents recruited via ΔN ∝ −∇C to incoherent zones. Ferrofluid magnetic guidance for precision delivery.
            </Card>
            <Card label="Phase 6–8 · Learning + Exit" title="Meta-Learning + Kill Switch"
              tags={<Tag kind="hyp" />}>
              PACE evolution discovers new circuit motifs. Successful circuits propagate via conjugative plasmids (HGT). Mission complete: toxin/antitoxin kill switch fires when ¬stabilizing_signal ∨ timer_expired. System degrades safely.
            </Card>
          </div>
          <Claim kind="hyp" tag="HYP — G-Matrix Cancer Analog (Novel — No Direct Experimental Confirmation)">
            The additive genetic variance-covariance matrix G in the floral evolutionary model has a structural analog in the tumor: the covariance structure of driver mutations across cells within a tumor ecosystem. Just as high heritability of monoterpene synthase activity enables rapid scent evolution under selection, high covariance between PD-L1 expression and T-cell exhaustion genes enables rapid immune evasion under therapeutic pressure. The G-matrix cancer analog predicts that therapeutic interventions targeting multiple correlated axes simultaneously will produce more durable responses than single-target approaches — matching existing empirical observations but framed here within a novel coherence-theoretic formalism.
          </Claim>
        </Section>

        {/* §5 MIRROR */}
        <Section id="mirror" label="§5 — Aether Mirror · Structured State Detection"
          title="The 8-Dimensional" accent="Emotional State Vector">
          <p style={p}>The Aether Mirror implements the AETHER feedback loop at the human-interface layer. An 8-dimensional state vector S⃗ is computed continuously from facial, postural, and vocal biomarkers. The routing decision engine maps S⃗ to the appropriate therapeutic agent — Infernia for somatic reset, Aletheia for safety protocol — using priority thresholds that are structurally identical to the CLCS intervention logic.</p>

          <div data-testid="state-vec" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 12, margin: "24px 0",
          }}>
            {STATE_VEC.map(d => (
              <div key={d.name} style={{
                border: `1px solid ${T.border}`, padding: 14, textAlign: "center",
                background: "rgba(255,255,255,0.3)",
              }}>
                <div style={{
                  fontFamily: T.mono, fontSize: 9, letterSpacing: "0.16em",
                  textTransform: "uppercase", color: T.goldDim, marginBottom: 6,
                }}>{d.name}</div>
                <div style={{
                  fontFamily: T.serif, fontSize: 22, fontStyle: "italic", color: T.ink,
                }}>{d.sym}</div>
                <div style={{
                  height: 2, background: "rgba(200,168,75,0.2)", marginTop: 8, position: "relative",
                }}>
                  <div style={{
                    position: "absolute", left: 0, top: 0, bottom: 0,
                    background: T.gold, width: `${d.pct}%`,
                  }} />
                </div>
              </div>
            ))}
          </div>

          <MathBlock>
            <MathLabel>Routing Decision Logic (12-Condition Priority Tree)</MathLabel>
            if intensity ι &gt; 0.85   → route("Infernia",  "somatic reset"){"\n"}
            elif conflict χ &gt; 0.80  → route("Aletheia", "safety protocol"){"\n"}
            elif clarity κ &lt; 0.30   → route("Mnesis",   "grounding sequence"){"\n"}
            elif agency α &lt; 0.20    → route("Reverie",  "embodiment protocol"){"\n"}
            else                    → route("Aletheia", "reflective dialogue")
            <MathLabel mt={14}>Coherence Parallel to CLCS</MathLabel>
            E<sub>emotional</sub>(t) = S*(t) − S⃗(t)    [emotional error vector]{"\n"}
            C<sub>emotional</sub>     = 1 − ‖E<sub>emotional</sub>‖ / ‖S*‖    [same functional form as tumor C(x,t)]
          </MathBlock>

          <Claim kind="doc" tag="DOC — Aether Mirror v1 Architecture">
            The Aether Mirror reports 92% routing accuracy after one week of user calibration. The 8D state vector is extracted via MediaPipe facial landmark tracking + OpenCV postural analysis + vocal tone classification. The AetherStateDetector class maps raw biomarker signals to the normalized state vector. This mirrors the InputHandler → CognitiveLogicUnit → EmotionSystem architecture of the broader AetherLife Emotion AI system.
          </Claim>
          <Claim kind="hyp" tag="HYP — State Vector Coherence as Wellbeing Metric">
            The emotional coherence functional C<sub>emotional</sub>(t) = 1 − ‖E‖/‖S*‖ provides a continuous scalar wellbeing index that is formally homologous to the tumor coherence metric. A therapist monitoring this value over time is performing the same mathematical operation as the CLCS oncology system monitoring tumor-immune relational stability. Both are measuring the distance between current state and target coherent state, and routing intervention accordingly. This suggests a unified clinical informatics platform spanning psychological and oncological domains under the same coherence formalism.
          </Claim>
        </Section>

        {/* §6 LADDER */}
        <Section id="ladder" label="§6 — The AETHER Scale Ladder"
          title="All Nine Scales." accent="One Computation.">
          <p style={p}>The unifying claim of AETHER is that the same five-phase loop — Sense, Deliver, Activate, Feedback, Learn — runs scale-invariantly across all physical substrates. The floral VOC → EAG system and the Aether Mirror are now formally integrated as two instances of this ladder.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={tbl}>
              <thead>
                <tr>
                  {["#", "Scale", "Physical Substrate", "Signal Vector", "Coherence Metric", "AETHER Layer", "Status"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {LADDER.map((row, i) => (
                  <tr key={i}>
                    {row.map((c, j) => <td key={j} style={td}>{c}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Claim kind="hyp" tag="HYP — Scale-Invariance Claim (Core Thesis of AETHER — Not Yet Formally Proven)">
            Fibonacci geometry is a geometric algorithm — not a biological driver claim. The hypothesis is that the same five-phase loop structure is preserved under domain transformation, analogously to general covariance in GR. What is preserved is the loop topology (sense → feedback → learn) and the coherence functional form C = 1 − ‖error‖/‖target‖, not any specific substrate mechanism. Formal proof requires identifying a combinatorial geometry (analogous to the Fano plane for octonions) that specifies which cross-domain mappings preserve structural identity.
          </Claim>
        </Section>

        {/* §7 EQUATIONS */}
        <Section id="equations" label="§7 — Unified Equations"
          title="The Mathematical" accent="Architecture in Full">
          <MathBlock>
            <MathLabel>I. Coherence Functional (Universal)</MathLabel>
            C(x,t) = 1 − ‖E(t)‖ / ‖X*(t)‖{"\n"}
            where E(t) = X*(t) − X(t)    [applies at all scales 1–9]
            <MathLabel mt={16}>II. Volatile Evolution ODE</MathLabel>
            dV⃗/dt = S(V⃗) − μV⃗{"\n"}
            S(V⃗) = selection operator (∝ visitation differential){"\n"}
            μ = mutation/drift rate
            <MathLabel mt={16}>III. Pollinator Selection (Softmax)</MathLabel>
            P(bee | V⃗) = exp(β·R<sub>total</sub> + γ·color + δ·shape) / Σ<sub>k</sub> exp(β·R<sub>k</sub> + ···)
            <MathLabel mt={16}>IV. Kuramoto Coupled Oscillator (Cross-Scale Synchrony)</MathLabel>
            dθ<sub>i</sub>/dt = ω<sub>i</sub> + (K/N) Σ<sub>j</sub> sin(θ<sub>j</sub> − θ<sub>i</sub>){"\n"}
            Order parameter r(t) = |N⁻¹ Σ exp(iθ<sub>j</sub>)| → coherence measure
            <MathLabel mt={16}>V. CLCS Control Signal</MathLabel>
            u(t) = K · (X*(t) − X̂(t+Δt))    [anticipatory — predictive feedback]
            <MathLabel mt={16}>VI. G-Matrix Evolutionary Response</MathLabel>
            Δz⃗ = G · β{"\n"}
            [floral: monoterpene synthase heritability; TME analog: driver mutation covariance]
            <MathLabel mt={16}>VII. Lotka-Volterra Community Extension (Circadian + VOC)</MathLabel>
            dN<sub>i</sub>/dt = r<sub>i</sub>N<sub>i</sub>(1 − N<sub>i</sub>/K<sub>i</sub> + Σ<sub>j</sub> α<sub>ij</sub> · V<sub>j</sub>/(V<sub>j</sub>+K<sub>V</sub>))
          </MathBlock>
        </Section>

        {/* §8 IMPACT */}
        <Section id="impact" label="§8 — Structural Impact & Open Questions"
          title="What the Synthesis" accent="Actually Implies">
          <div style={twoCol}>
            <div>
              <h3 style={{ fontFamily: T.display, fontWeight: 400, marginBottom: 14, fontSize: 15 }}>
                If the bridge hypothesis holds <Tag kind="hyp" />
              </h3>
              <p style={{ fontSize: 14 }}>Then the GC-EAG pipeline for measuring floral coherence loss is a macro-scale model organism for studying TME coherence collapse — with faster experimental iteration, better ecological access, and richer natural variation. <em>M. cardinalis</em> is not merely a botanical curiosity; it is a proof-of-concept for large-effect coherence loss under selection pressure, with direct implications for cancer evolution under therapeutic selection.</p>
            </div>
            <div>
              <h3 style={{ fontFamily: T.display, fontWeight: 400, marginBottom: 14, fontSize: 15 }}>
                If the Aether Mirror routing is formalized <Tag kind="doc" />
              </h3>
              <p style={{ fontSize: 14 }}>Then a unified clinical platform monitoring both C<sub>emotional</sub>(t) and C<sub>TME</sub>(t) becomes theoretically tractable — a patient's psychological coherence state informing their oncological treatment protocol, and vice versa. The documented correlation between high stress (behavioral coherence loss) and 30% elevated tumor growth rates in the morphogenetic oncology simulations provides empirical scaffolding for this integration.</p>
            </div>
          </div>
          <Claim kind="est" tag="EST — Convergent Clinical Insight">
            The Aether Mirror behavioral-coherence data (stress index 0.75, sleep quality 0.45) aligns with the morphogenetic oncology simulation showing ~130% baseline tumor growth rate at high stress and ~128% at poor sleep. This is not a causal claim — it is a measurable phase alignment between oscillators: the psychological state vector and the tumor growth rate co-vary in documented ways. The AETHER framework models this as weak coupling, not hard causation.
          </Claim>
          <div style={{ marginTop: 32 }}>
            <div style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: "0.24em",
              color: T.goldDim, textTransform: "uppercase", marginBottom: 16,
            }}>Open Experimental Questions</div>
            <div style={threeCol}>
              <Card label="Q1 — Floral Bridge" title="VOC → TME Direct Analog" tags={<Tag kind="hyp" />}>
                Can GC-EAG methodology be adapted to measure "chemical language" coherence in TME — e.g., using tumor-secreted metabolite profiles as the analogue of the floral bouquet vector V⃗ and NK-cell receptor arrays as the analogue of bumblebee antennae?
              </Card>
              <Card label="Q2 — G-Matrix Cancer" title="Driver Mutation Covariance" tags={<Tag kind="hyp" />}>
                Does the G-matrix cancer analog predict observed patterns of resistance emergence across cancer subtypes? Specifically: do cancers with higher covariance between immune evasion and proliferation gene expression evolve resistance faster under single-agent immunotherapy?
              </Card>
              <Card label="Q3 — Mirror Integration" title="Circadian VOC + Emotional Phase" tags={<Tag kind="hyp" />}>
                The ScentChrono Fourier circadian emission model maps directly onto the Aether Mirror's temporal state-tracking. Do diurnal emotional state rhythms phase-lock with circadian VOC emission curves in ways that could inform chronotherapy protocols?
              </Card>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <div style={{
          marginTop: 56, paddingTop: 28, borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between",
          flexWrap: "wrap", gap: 14, alignItems: "center",
        }}>
          <div>
            <div style={{ fontFamily: T.display, fontSize: 13, letterSpacing: "0.04em", color: T.ink }}>
              AETHER Unified Synthesis v3.0
            </div>
            <div style={{
              fontFamily: T.mono, fontSize: 9, letterSpacing: "0.16em",
              color: T.textDim, marginTop: 4, textTransform: "uppercase",
            }}>AetherLife.co · @StrategicProce · April 2026</div>
            {/* footer sits on parchment background — textDim is OK here (4.6:1) */}
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Chip kind="doc">DOC Claims: 7</Chip>
            <Chip kind="est">EST Claims: 4</Chip>
            <Chip kind="hyp">HYP Claims: 8</Chip>
          </div>
        </div>

        {/* BRIDGES */}
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${T.border}` }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: "0.24em",
            color: T.goldDim, textTransform: "uppercase", marginBottom: 12,
          }}>Bridges</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              ["/decision-entropy",       "Decision Entropy · Time-Cost Formalism"],
              ["/clcs-architecture",      "CLCS Architecture · L0 Threading"],
              ["/cancer-dynamics",        "Cancer Dynamics · Tumor Micro-environment"],
              ["/aether-doctrine",        "AETHER Doctrine"],
              ["/aether-edge-constraint", "Edge Constraint · CUCA Stack"],
              ["/quantum-living-systems", "Quantum Living Systems"],
              ["/glossary",               "Glossary · 40 Terms"],
            ].map(([href, label]) => (
              <Link key={href} href={href} data-testid={`bridge-${href.replace(/^\//, "")}`}
                style={{
                  display: "inline-block", padding: "8px 14px",
                  background: "rgba(255,255,255,0.5)", border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${T.gold}`,
                  fontFamily: T.mono, fontSize: 11, color: T.ink, textDecoration: "none",
                }}
              >{label}</Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const p: React.CSSProperties = { marginBottom: 14 };
const twoCol: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: 28, marginTop: 32,
};
const threeCol: React.CSSProperties = {
  display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 24, marginTop: 28,
};
const tbl: React.CSSProperties = {
  width: "100%", borderCollapse: "collapse", margin: "24px 0", fontSize: 13,
};
const th: React.CSSProperties = {
  fontFamily: T.mono, fontSize: 8, letterSpacing: "0.16em",
  textTransform: "uppercase", color: T.goldDim,
  padding: "10px 14px", borderBottom: `2px solid ${T.border}`,
  textAlign: "left", background: "rgba(200,168,75,0.04)",
};
const td: React.CSSProperties = {
  padding: "10px 14px", borderBottom: "1px solid rgba(200,168,75,0.1)",
  lineHeight: 1.5, verticalAlign: "top",
};
const legend: React.CSSProperties = {
  display: "flex", gap: 20, flexWrap: "wrap",
  margin: "20px 0", padding: "14px 18px",
  border: `1px solid ${T.border}`, background: "rgba(200,168,75,0.03)",
};
const legendItem: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 8,
  fontFamily: T.mono, fontSize: 9, letterSpacing: "0.06em",
  textTransform: "uppercase",
};

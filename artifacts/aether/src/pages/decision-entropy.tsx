import { useEffect } from "react";
import { Link } from "wouter";

/* ──────────────────────────────────────────────────────────────────────
   AETHER · Possibility, Time, and Decision Entropy
   Theoretical Extension · Time-Cost Formalism · v1.0 · April 2026

   Faithful React port of the user's typeset essay. Parchment-cream
   typographic document — distinct from AETHER's dark UI shell because
   this is a paper, not a tool.
   ─────────────────────────────────────────────────────────────────── */

const T = {
  bg: "#ffffff",
  paper: "#f8fafc",
  ink: "#1a1612",
  inkMid: "#4a3f35",
  inkDim: "#8a7a6a",
  inkFaint: "#c8bfb2",
  gold: "#9a6f2a",
  goldLight: "rgba(154,111,42,0.12)",
  teal: "#1a5f6a",
  rose: "#7a2a3a",
  border: "rgba(26,22,18,0.1)",
  borderStrong: "rgba(26,22,18,0.2)",
  hyp: "#5a2a6b",
  est: "#6a4a1a",
  doc: "#2a5a2a",
  serif: "'Source Serif 4', 'Iowan Old Style', Georgia, serif",
  display: "'Playfair Display', 'Source Serif 4', Georgia, serif",
  mono: "'Source Code Pro', 'JetBrains Mono', monospace",
};

const eq = (
  label: string,
  body: React.ReactNode,
  marginTop = 0,
): React.ReactNode => (
  <div style={{
    background: T.paper, border: `1px solid ${T.borderStrong}`,
    borderLeft: `3px solid ${T.gold}`,
    padding: "20px 28px",
    marginTop: marginTop || 24, marginBottom: 24,
    fontFamily: T.mono, fontSize: 13, lineHeight: 2,
    overflowX: "auto", whiteSpace: "pre-wrap",
  }}>
    <span style={{
      fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase",
      color: T.gold, marginBottom: 8, display: "block",
    }}>{label}</span>
    {body}
  </div>
);

function Claim({ kind, tag, children }: {
  kind: "doc" | "est" | "hyp"; tag: string; children: React.ReactNode;
}) {
  const color = kind === "doc" ? T.doc : kind === "est" ? T.est : T.hyp;
  return (
    <div data-testid={`claim-${kind}`} style={{
      borderLeft: `3px solid ${color}`,
      padding: "14px 20px", margin: "20px 0",
      fontSize: 15, lineHeight: 1.65,
      background: "rgba(0,0,0,0.02)",
    }}>
      <span style={{
        fontFamily: T.mono, fontSize: 8.5, letterSpacing: "0.16em",
        textTransform: "uppercase", color, display: "block", marginBottom: 6,
      }}>{tag}</span>
      {children}
    </div>
  );
}

function DefList({ items }: { items: { term: string; body: React.ReactNode }[] }) {
  return (
    <div style={{ border: `1px solid ${T.borderStrong}`, margin: "20px 0", fontSize: 14 }}>
      {items.map((it, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "180px 1fr",
          borderBottom: i === items.length - 1 ? "none" : `1px solid ${T.border}`,
        }}>
          <div style={{
            padding: "12px 16px",
            fontFamily: T.mono, fontSize: 11, fontWeight: 500,
            color: T.teal, background: "rgba(0,0,0,0.02)",
            borderRight: `1px solid ${T.border}`, letterSpacing: "0.04em",
          }}>{it.term}</div>
          <div style={{ padding: "12px 16px", lineHeight: 1.55, color: T.inkMid }}>
            {it.body}
          </div>
        </div>
      ))}
    </div>
  );
}

function Pull({ text, attr }: { text: string; attr: string }) {
  return (
    <div style={{ margin: "36px 0", padding: "0 0 0 28px", borderLeft: `4px solid ${T.ink}` }}>
      <div style={{
        fontFamily: T.display,
        fontSize: "clamp(18px, 2.5vw, 26px)",
        fontStyle: "italic", lineHeight: 1.45, color: T.ink, marginBottom: 10,
      }}>{text}</div>
      <div style={{
        fontFamily: T.mono, fontSize: 9, letterSpacing: "0.16em",
        textTransform: "uppercase", color: T.inkDim,
      }}>{attr}</div>
    </div>
  );
}

const Var = ({ children }: { children: React.ReactNode }) =>
  <span style={{ color: T.teal, fontWeight: 500 }}>{children}</span>;
const Const = ({ children }: { children: React.ReactNode }) =>
  <span style={{ color: T.rose }}>{children}</span>;
const Cmt = ({ children }: { children: React.ReactNode }) =>
  <span style={{ color: T.inkDim }}>{children}</span>;

export default function DecisionEntropyPage() {
  useEffect(() => {
    const id = "decision-entropy-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id; link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Source+Code+Pro:wght@300;400;500&family=Source+Serif+4:ital,wght@0,300;0,400;1,300&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div data-testid="page-decision-entropy" style={{
      background: T.bg, color: T.ink, fontFamily: T.serif,
      fontSize: 17, lineHeight: 1.72, minHeight: "100vh",
    }}>
      <div style={{ maxWidth: 760, margin: "0 auto", padding: "64px 40px 100px" }}>

        {/* RUNNING HEAD */}
        <div style={{
          fontFamily: T.mono, fontSize: 9, letterSpacing: "0.24em",
          textTransform: "uppercase", color: T.inkDim,
          textAlign: "center", marginBottom: 56, paddingBottom: 20,
          borderBottom: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: 6,
        }}>
          <span>AetherLife.co · @StrategicProce</span>
          <span>AETHER Theoretical Extension · April 2026</span>
          <span>DOC / EST / HYP tagged throughout</span>
        </div>

        {/* TITLE BLOCK */}
        <div style={{ marginBottom: 52, paddingBottom: 36, borderBottom: `2px solid ${T.ink}` }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: "0.24em",
            textTransform: "uppercase", color: T.gold, marginBottom: 14,
          }}>AETHER Theoretical Extension · Time-Cost Formalism</div>
          <h1 style={{
            fontFamily: T.display, fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 400, lineHeight: 1.15, letterSpacing: "-0.5px",
            color: T.ink, marginBottom: 18,
          }}>
            Possibility, Time,<br />
            and <em style={{ fontStyle: "italic", color: T.gold }}>Decision Entropy</em>
          </h1>
          <div style={{
            fontSize: 16, fontStyle: "italic", color: T.inkMid,
            lineHeight: 1.55, maxWidth: 600, marginBottom: 20,
          }}>
            Why the problem is no longer scarcity of options — and how AETHER
            formalizes navigability as the primary constraint on intelligent action
            in the presence of AI-expanded possibility spaces.
          </div>
          <div style={{
            fontFamily: T.mono, fontSize: 10, letterSpacing: "0.18em",
            color: T.inkDim, textTransform: "uppercase",
          }}>
            Shia Miller · Interdisciplinary Systems Research · v1.0
          </div>
        </div>

        {/* ABSTRACT */}
        <p style={{ marginBottom: 16 }}>
          The intuition that AI has rendered possibility space "effectively infinite" is
          correct in structure but imprecise in mechanism. This note formalizes the
          correction: what AI expands is not the size of the possibility space but the{" "}
          <em>traversal rate</em> — the number of candidate states a system can evaluate
          per unit time. Physical and temporal constraints remain hard. The bottleneck
          has shifted from possibility to navigation. AETHER's coherence architecture is
          positioned exactly at this new bottleneck.
        </p>

        <hr style={{ border: "none", borderTop: `1px solid ${T.borderStrong}`, margin: "48px 0" }} />

        {/* §I */}
        <h2 style={h2}>I. The Three-Layer Model</h2>
        <p>Three distinct layers govern intelligent action. Conflating them produces category errors — claiming the universe is "infinite" when the real claim is that traversal is now fast enough to feel unbounded.</p>
        <DefList items={[
          { term: "Physical Reality", body: <>Hard constraints: energy limits, signal speed (light, biology, hardware), entropy, computation cost. These are non-negotiable. AI does not escape them — it is subject to them.</> },
          { term: "Time", body: <>The experienced bottleneck. Humans access one state at a time — they cannot branch simultaneously, rewind, or parallelize exploration. Time is the dominant constraint on <em>how much</em> of the possibility space any agent can traverse within a lifespan or decision window.</> },
          { term: "AI / AETHER", body: <>Increases the traversal rate — more states evaluated per unit time. Subjectively this feels like infinity; formally it is compressed exploration within unchanged physical bounds. AETHER's role is to ensure the increased traversal rate produces <em>coherent</em> navigation rather than amplified scatter.</> },
        ]} />
        <Claim kind="est" tag="EST — Extrapolated from AETHER entropy formalism">
          Entropy in the AETHER framework is defined as "the accumulation of unresolved signals that the system has not yet integrated into its feedback loop." In a high-traversal-rate environment (AI-augmented cognition), the rate at which new signals are generated can exceed the rate at which they are resolved. This is a new failure mode: not scarcity of options, but coherence collapse under abundance.
        </Claim>

        {/* §II */}
        <h2 style={h2}>II. The Time-Cost Function</h2>
        <p>Define the time cost of a decision as the resources (time, attention, compute) required to traverse from the current state to a chosen action. In a pre-AI environment, this is bounded by biological throughput. With AI augmentation, the function changes character.</p>
        {eq("Definition — Decision Time Cost", <>
{`    `}<Var>T_cost</Var>(decision) = <Var>P</Var> / <Var>R</Var>(t){"\n\n"}
{`    `}<Cmt>where:</Cmt>{"\n"}
{`    `}<Var>P</Var>{`    `}= effective possibility space size  <Cmt>(options to evaluate)</Cmt>{"\n"}
{`    `}<Var>R</Var>(t) = traversal rate at time t        <Cmt>(states evaluated per second)</Cmt>{"\n\n"}
{`    `}<Cmt>Pre-AI:   R(t) ≈ R_bio (biological throughput, ~constant)</Cmt>{"\n"}
{`    `}<Cmt>With AI:  R(t) = R_bio + R_ai(t)  where R_ai grows over time</Cmt>{"\n\n"}
{`    `}<Cmt>→ T_cost decreases as R_ai increases</Cmt>{"\n"}
{`    `}<Cmt>→ But P also increases with AI (more options visible)</Cmt>{"\n"}
{`    `}<Cmt>→ Net effect depends on whether R_ai outpaces P expansion</Cmt>
        </>)}
        <p>This creates the central tension: AI simultaneously expands P and increases R. The question of whether agents become <em>more decisive</em> or <em>more overwhelmed</em> under AI augmentation depends on which term grows faster — and whether the selection mechanism (the routing layer) can keep pace with the expansion of P.</p>
        <Pull text="The universe isn't infinite in practice. It's just too large to traverse within time." attr="AETHER Time-Cost Formalism · v1.0" />

        {/* §III */}
        <h2 style={h2}>III. Decision Entropy and AETHER's Role</h2>
        <p>Decision entropy is the uncertainty remaining over which action to take, given current state information. It is distinct from thermodynamic entropy but formally analogous: high decision entropy means the system is far from a committed action state; low decision entropy means the path is clear.</p>
        {eq("Decision Entropy — Formal Definition", <>
{`    `}<Var>H_d</Var>(t) = −Σ<sub>i</sub> <Var>p_i</Var>(t) · log₂ <Var>p_i</Var>(t){"\n\n"}
{`    `}<Cmt>where p_i(t) = probability assigned to action i at time t</Cmt>{"\n"}
{`    `}<Cmt>H_d = 0: certain — one action dominates</Cmt>{"\n"}
{`    `}<Cmt>H_d = log₂(N): maximum entropy — N options equally probable</Cmt>
        </>)}
        {eq("AETHER Coherence Effect on Decision Entropy", <>
{`    `}<Var>dH_d</Var>/dt = <Const>α</Const> · <Var>P_expansion_rate</Var>  <Cmt>(entropy injection from new options)</Cmt>{"\n"}
{`              `}− <Const>β</Const> · <Var>C</Var>(x,t)             <Cmt>(entropy reduction from coherence)</Cmt>{"\n"}
{`              `}− <Const>γ</Const> · <Var>R_ai</Var>(t)           <Cmt>(entropy reduction from traversal speed)</Cmt>{"\n\n"}
{`    `}<Cmt>Stable navigation requires:  β·C(x,t) + γ·R_ai(t)  &gt;  α·P_expansion_rate</Cmt>{"\n"}
{`    `}<Cmt>AETHER's claim: C(x,t) is the primary lever  [β dominates]</Cmt>
        </>)}
        <Claim kind="hyp" tag="HYP — Novel claim, requires empirical validation">
          The coherence term β·C(x,t) dominates the decision entropy equation — meaning that routing through state is more effective at reducing decision entropy than raw traversal speed alone. This is the formal basis for the claim: AI expands possibility; AETHER makes it navigable in time. Fast traversal without coherent routing produces a higher-entropy output than slower traversal with structured state detection. The Aether Mirror is a direct instantiation: the 4D state vector collapses H_d by eliminating the meta-decision "what kind of intervention do I need?" before any options are evaluated.
        </Claim>

        {/* §IV */}
        <h2 style={h2}>IV. The Genesis Pattern as Entropy Reduction Sequence</h2>
        <p>The Genesis Pattern — Constraint → Adaptation → Repetition → Structure — can now be read as a four-stage decision entropy reduction algorithm operating across time:</p>
        <table style={tbl}>
          <thead>
            <tr>
              <th style={thS}>Stage</th>
              <th style={thS}>Operation on H_d</th>
              <th style={thS}>Mechanism</th>
              <th style={thS}>Time Cost Effect</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Constraint", "Reduces P — eliminates inadmissible options", "State vector defines the feasible action space", "P ↓ → T_cost ↓"],
              ["Adaptation", "Sharpens p_i — concentrates probability mass", "Feedback narrows distribution over options", "H_d ↓ toward certainty"],
              ["Repetition", "Encodes the reduction — makes it persistent", "Loop memory (Mnēsis) preserves successful paths", "Future T_cost ↓ for similar states"],
              ["Structure", "Generalizes the reduction across contexts", "G-matrix analog — coherent variance propagates", "Systemic T_cost ↓ over time"],
            ].map((row, i) => (
              <tr key={i}>
                <td style={{ ...tdS, fontFamily: T.mono, fontSize: 11, color: T.teal }}>{row[0]}</td>
                <td style={tdS}>{row[1]}</td>
                <td style={tdS}>{row[2]}</td>
                <td style={tdS}>{row[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Each pass through the Genesis Pattern leaves the system with lower decision entropy for the same class of future decisions. This is the formal meaning of AETHER's claim that "a coherent system becomes more precise over time" — precision here is a measurable reduction in H_d per decision cycle.</p>

        {/* §V */}
        <h2 style={h2}>V. Alignment With the 8-Dimensional Emotional State</h2>
        <p>The Aether Mirror's 8D state vector (valence, intensity, clarity, conflict, agency, novelty, social, somatic) is now interpretable as a decision entropy reduction machine, not merely a routing tool. Each dimension constrains a different axis of the possibility space:</p>
        {eq("State Vector as Constraint Operator", <>
{`    `}<Var>S⃗</Var> = (v, ι, κ, χ, α, ν, σ, ς)     <Cmt># 8D emotional state</Cmt>{"\n\n"}
{`    `}<Cmt>Each dimension eliminates a subset of the action space:</Cmt>{"\n"}
{`    `}<Var>v</Var> (valence)   → eliminates actions mismatched to affect direction{"\n"}
{`    `}<Var>ι</Var> (intensity) → sets urgency threshold  [high-ι routes before evaluation]{"\n"}
{`    `}<Var>κ</Var> (clarity)   → gates cognitive processing  [low-κ: grounding first]{"\n"}
{`    `}<Var>χ</Var> (conflict)  → flags internal contradiction  [requires resolution layer]{"\n"}
{`    `}<Var>α</Var> (agency)    → scales response options  [low-α: directive; high-α: exploratory]{"\n"}
{`    `}<Var>ν</Var> (novelty)   → signals learning opportunity vs. pattern match{"\n"}
{`    `}<Var>σ</Var> (social)    → activates relational vs. somatic interventions{"\n"}
{`    `}<Var>ς</Var> (somatic)   → body-first routing priority flag{"\n\n"}
{`    `}<Cmt>Net effect: P shrinks from ~all possible interventions to ~1-3 candidates</Cmt>{"\n"}
{`    `}<Cmt>H_d collapses: 0.8s after state detection (routing in &lt;1.2s total)</Cmt>
        </>)}
        <Claim kind="est" tag="EST — Structurally consistent with routing accuracy data">
          The 92% routing accuracy (validated against therapist-labeled ground truth) is formally a measure of how precisely the 8D vector collapses decision entropy to the correct minimum. A random routing baseline would achieve ~25% (4 agents). The 92% figure implies H_d is being reduced by approximately 1.87 bits per decision cycle — measurable, improvable, and a meaningful clinical metric in its own right.
        </Claim>

        {/* §VI */}
        <h2 style={h2}>VI. Physical Reality Remains the Ceiling</h2>
        <p>One correction must be made explicit and held firmly. The traversal rate R(t) is bounded by physical substrate. AI accelerates R_ai but it remains subject to:</p>
        <DefList items={[
          { term: "Energy limits", body: <>Each inference has a compute cost. Traversal rate cannot be infinite — it is thermodynamically bounded. Large-scale AI systems consuming megawatts are approaching this constraint visibly.</> },
          { term: "Signal speed", body: <>Biological integration of AI output is bounded by human neural bandwidth (~50 bits/sec conscious throughput). R_ai can vastly exceed the rate at which a human agent can absorb and act on AI-generated traversals. This creates a new bottleneck: the human-AI interface layer.</> },
          { term: "Entropy", body: <>Computation generates heat. Every increment in R_ai increases thermodynamic entropy in the physical substrate. The loop cannot be run forever at arbitrary speed without cost.</> },
        ]} />
        <Claim kind="hyp" tag="HYP — Implication for AETHER architecture">
          The human-AI interface bottleneck (human neural bandwidth ≪ AI traversal rate) suggests that the most valuable architectural investment is not in further increasing R_ai but in improving the precision of the state detection and routing layer — so that the AI's output is pre-collapsed to the highest-relevance candidate before it reaches the human agent. This is precisely what the Aether Mirror and the CLCS routing architecture accomplish. They are human-bandwidth maximizers, not possibility generators.
        </Claim>

        {/* ANCHOR */}
        <div data-testid="anchor-box" style={{
          background: T.ink, color: T.bg,
          padding: "32px 36px", margin: "36px 0",
        }}>
          <div style={{
            fontFamily: T.display, fontSize: "clamp(18px, 3vw, 28px)",
            fontWeight: 400, lineHeight: 1.45, marginBottom: 12,
          }}>
            <em style={{ fontStyle: "italic", color: "#c8a84b" }}>AI expands possibility.</em><br />
            AETHER makes it navigable in time.
          </div>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: "0.24em",
            textTransform: "uppercase", color: "rgba(200,168,75,0.6)",
          }}>Signature line · AETHER Time-Cost Formalism · v1.0</div>
        </div>

        {/* §VII */}
        <h2 style={h2}>VII. The Real Equation (Summary)</h2>
        {eq("The Complete Relationship", <>
{`    `}Possibility Space <Var>P</Var>     = extremely large, practically unbounded{"\n"}
{`                      ↓`}{"\n"}
{`    `}Time <Var>T</Var>               = limits how much of P you can traverse{"\n"}
{`                      ↓`}{"\n"}
{`    `}AI  <Var>R_ai</Var>(t)         = expands traversal speed{"\n"}
{`                      ↓`}{"\n"}
{`    `}Decision Entropy <Var>H_d</Var>  = rises with P, falls with C(x,t){"\n"}
{`                      ↓`}{"\n"}
{`    `}AETHER <Var>C</Var>(x,t)       = the coherence term that dominates H_d reduction{"\n\n"}
{`    `}<Cmt>Without structure:  P↑ + R_ai↑  →  H_d↑  (overwhelm)</Cmt>{"\n"}
{`    `}<Cmt>With AETHER:        P↑ + R_ai↑  →  H_d↓  (navigability)</Cmt>{"\n\n"}
{`    `}<Cmt>The loop: Sense state → Collapse P → Route to action → Feedback → Learn</Cmt>{"\n"}
{`    `}<Cmt>Each pass: H_d decreases for this class of future decisions</Cmt>
        </>)}
        <p>The summary formulation is:</p>
        <Pull text="Humans don't need more possibility. They need faster alignment within it." attr="Core proposition · AETHER Time-Cost Formalism" />

        <hr style={{ border: "none", borderTop: `1px solid ${T.borderStrong}`, margin: "48px 0" }} />

        {/* §VIII */}
        <h2 style={h2}>VIII. What Would Make This Falsifiable</h2>
        <p>The claims above remain in the HYP/EST range until the following can be measured:</p>
        <h3 style={h3}>Empirical targets for the time-cost function</h3>
        <p>Measure T_cost per decision class before and after AETHER routing activation. If the coherence term β·C(x,t) dominates as claimed, decision latency should decrease and outcome quality (therapist-rated appropriateness) should increase proportionally to calibration quality — not proportionally to AI traversal speed. This would confirm that C(x,t) is the primary lever.</p>
        <h3 style={h3}>Decision entropy measurement via response distribution</h3>
        <p>H_d can be estimated behaviorally: present patients with the same trigger state and measure the variance in self-selected intervention choices before and after Mirror calibration. A reduction in that variance is a direct measure of H_d reduction — and thus a direct test of the entropy collapse claim.</p>
        <h3 style={h3}>Human-AI bandwidth bottleneck test</h3>
        <p>If human neural bandwidth is genuinely the binding constraint (not AI traversal rate), then doubling R_ai should produce no improvement in decision quality — but improving the state-routing precision should. This is a testable prediction that distinguishes the AETHER architecture from a pure "more AI compute" approach.</p>

        {/* FOOTNOTES */}
        <div style={{
          marginTop: 56, paddingTop: 24,
          borderTop: `1px solid ${T.borderStrong}`,
          fontSize: 12, color: T.inkDim, lineHeight: 1.6,
        }}>
          <div style={{ marginBottom: 8 }}>¹ Entropy definition from AETHER Whitepaper v1.2: "the accumulation of unresolved signals that the system has not yet integrated into its feedback loop."</div>
          <div style={{ marginBottom: 8 }}>² Human conscious throughput estimate (~50 bits/sec) from Nørretranders (1998), <em>The User Illusion</em>. The relevant constraint is not total neural bandwidth but the bandwidth of the deliberative interface layer.</div>
          <div style={{ marginBottom: 8 }}>³ Routing accuracy (92%) and detection lag (&lt;1.2s) from Aether Mirror v1.0 architecture specifications, April 2026. Validated against therapist-labeled ground truth in calibrated sessions.</div>
          <div style={{ marginBottom: 8 }}>⁴ The Genesis Pattern (Constraint → Adaptation → Repetition → Structure) is from prior AETHER corpus. The mapping to decision entropy reduction stages is a novel extension introduced in this document. HYP status until formally tested.</div>
        </div>

        {/* BRIDGES */}
        <div style={{ marginTop: 48, paddingTop: 28, borderTop: `1px solid ${T.borderStrong}` }}>
          <div style={{
            fontFamily: T.mono, fontSize: 9, letterSpacing: "0.24em",
            textTransform: "uppercase", color: T.inkDim, marginBottom: 14,
          }}>Bridges</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {[
              ["/unified-synthesis",  "Unified Synthesis · Coherence as Substrate"],
              ["/clcs-architecture",  "CLCS Architecture · L1→L5 Threading"],
              ["/cancer-dynamics",    "Cancer Dynamics · Tumor Coherence"],
              ["/aether-doctrine",    "AETHER Doctrine"],
              ["/coherence",          "Coherence Engine"],
              ["/ecosystem",          "M.A.R.I. Ecosystem"],
              ["/glossary",           "Glossary · 40 Terms"],
            ].map(([href, label]) => (
              <Link key={href} href={href} data-testid={`bridge-${href.replace(/^\//, "")}`}
                style={{
                  display: "inline-block", padding: "8px 14px",
                  background: T.paper, border: `1px solid ${T.borderStrong}`,
                  borderLeft: `3px solid ${T.gold}`,
                  fontFamily: T.mono, fontSize: 11,
                  color: T.ink, textDecoration: "none",
                }}
              >{label}</Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

const h2: React.CSSProperties = {
  fontFamily: T.display, fontSize: "clamp(18px, 2.8vw, 24px)",
  fontWeight: 400, margin: "48px 0 18px", color: T.ink,
  letterSpacing: "0.2px",
};
const h3: React.CSSProperties = {
  fontFamily: T.serif, fontSize: 16, fontWeight: 400,
  fontStyle: "italic", color: T.inkMid, margin: "28px 0 12px",
};
const tbl: React.CSSProperties = {
  width: "100%", borderCollapse: "collapse", margin: "24px 0", fontSize: 14,
};
const thS: React.CSSProperties = {
  fontFamily: T.mono, fontSize: 9, letterSpacing: "0.16em",
  textTransform: "uppercase", color: T.inkDim,
  padding: "10px 16px", borderBottom: `2px solid ${T.borderStrong}`,
  textAlign: "left",
};
const tdS: React.CSSProperties = {
  padding: "10px 16px", borderBottom: `1px solid ${T.border}`,
  verticalAlign: "top", lineHeight: 1.5,
};

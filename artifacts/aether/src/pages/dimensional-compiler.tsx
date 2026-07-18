import { useEffect, useRef, useState } from "react";

const C = {
  void:    "#010408",
  deep:    "#030912",
  panel:   "#060f1e",
  border:  "rgba(46,109,164,0.22)",
  border2: "rgba(46,109,164,0.45)",
  teal:    "#1fd4c8",
  bright:  "#4a9fd4",
  gold:    "#c9a84c",
  violet:  "#8b5cf6",
  pink:    "#ec4899",
  green:   "#22c55e",
  dim:     "#3a5a7a",
  text:    "#d4e8f7",
  muted:   "#6a8fa8",
};

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const CHANNELS = [
  { range: "x₁–x₅₀",    label: "Structural Geometry",   color: C.teal,   how: "Shape of walls, arches, angles — vector field topology" },
  { range: "x₅₁–x₁₀₀",  label: "Motion of Surfaces",    color: C.bright,  how: "Moving panels, rotating elements — phase transition rates" },
  { range: "x₁₀₁–x₁₅₀", label: "Light Interference",    color: "#f59e0b", how: "Colors, interference patterns — ρ_info gradients" },
  { range: "x₁₅₁–x₂₀₀", label: "Sound Harmonics",       color: C.gold,   how: "Acoustic frequencies — H_n ring signatures" },
  { range: "x₂₀₁–x₂₅₀", label: "Magnetic Field",        color: "#a78bfa", how: "Felt in the body, orienting — vortex rotation parameters θ_n" },
  { range: "x₂₅₁–x₃₀₀", label: "Air Pressure / Vortex", color: C.violet, how: "Wind, breath — ring-crossing events" },
  { range: "x₃₀₁–x₃₅₀", label: "Temperature Gradients", color: "#f87171", how: "Hot/cold zones — constructive interference peaks" },
  { range: "x₃₅₁–x₄₀₀", label: "Haptic / Vibration",   color: "#fb923c", how: "What you feel through your feet — ring barrier thresholds" },
  { range: "x₄₀₁–x₄₅₀", label: "Biofeedback Response", color: C.green,  how: "Structure responding to heartbeat, breath, intention" },
  { range: "x₄₅₁–x₅₀₀", label: "Time Variation",        color: C.pink,   how: "Phi-Time-scheduled changes — the room evolves around you" },
];

const PIPE = [
  { n: "01", label: "500D Vector State",         eq: "v = (x₁, x₂, …, x₅₀₀)",    col: C.teal   },
  { n: "02", label: "Field Engine",              eq: "∇ρ_info from all 500 components", col: C.bright },
  { n: "03", label: "Ring / Vortex Solver",      eq: "H_n — active ring layers & crossing vortices", col: "#f59e0b" },
  { n: "04", label: "Translation Engine",        eq: "5-Domain Event Bus → physical instructions",   col: C.gold   },
  { n: "05", label: "Robotic Swarm",             eq: "builds & rebuilds structure in real time",      col: C.violet },
  { n: "06", label: "Physical Environment",      eq: "you walk inside it",                            col: "#f87171" },
  { n: "07", label: "Human Sensory Integration", eq: "10 channels → 500 relational dimensions",       col: C.pink   },
];

const ENCODINGS = [
  { code: "US-ALPHA",  lang: "English / Western",  grid: "12-tone harmonic resolution", weight: "Analytical, geometric weight distribution",    accent: C.teal   },
  { code: "CN-OMEGA",  lang: "Mandarin / Eastern", grid: "Pentatonic / 5-phase cycles", weight: "Relational, flow-state weight distribution",   accent: "#f59e0b" },
  { code: "RU-SIGMA",  lang: "Russian / Slavic",   grid: "Modal scale, dense harmonics", weight: "Tension-coherence polarity distribution",     accent: "#f87171" },
];

/* ────────── Ring Field Canvas ────────── */
function RingFieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;
    const PHI = 1.6180339887;

    const colors = CHANNELS.map(c => c.color);

    function draw() {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const cx = W / 2;
      const cy = H / 2;
      const maxR = Math.min(W, H) * 0.46;

      // Draw 10 ring bands (outer → inner)
      for (let i = 9; i >= 0; i--) {
        const outerR = maxR * ((i + 1) / 10);
        const innerR = maxR * (i / 10);
        const col = colors[i];

        // Ring fill
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
        ctx.fillStyle = `${col}10`;
        ctx.fill();

        // Ring border
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
        ctx.strokeStyle = `${col}55`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // 5 particles per ring, φ-spaced
        const midR = (outerR + innerR) / 2;
        const speed = (1 + i * 0.15) * (i % 2 === 0 ? 1 : -1);
        for (let p = 0; p < 5; p++) {
          const base = (p / 5) * Math.PI * 2;
          const angle = base + t * speed * 0.3 * (1 + p / PHI / 10);
          const px = cx + Math.cos(angle) * midR;
          const py = cy + Math.sin(angle) * midR;

          // glow
          const gr = ctx.createRadialGradient(px, py, 0, px, py, 6);
          gr.addColorStop(0, col + "ee");
          gr.addColorStop(1, col + "00");
          ctx.beginPath();
          ctx.arc(px, py, 6, 0, Math.PI * 2);
          ctx.fillStyle = gr;
          ctx.fill();
        }

        // Channel label on right side
        const labelAngle = t * speed * 0.08 + Math.PI * 0.05;
        const lx = cx + Math.cos(labelAngle) * midR + 10;
        const ly = cy + Math.sin(labelAngle) * midR;
        ctx.font = `9px ${mono}`;
        ctx.fillStyle = col + "99";
        ctx.fillText(CHANNELS[i].range, lx + maxR * 0.02, ly + 3);
      }

      // Central vortex — the human observer
      const vortexPulse = 0.85 + 0.15 * Math.sin(t * 1.8);
      const vR = maxR * 0.068 * vortexPulse;

      const vg = ctx.createRadialGradient(cx, cy, 0, cx, cy, vR * 2.2);
      vg.addColorStop(0, "#ffffffee");
      vg.addColorStop(0.3, C.teal + "cc");
      vg.addColorStop(1, C.teal + "00");
      ctx.beginPath();
      ctx.arc(cx, cy, vR * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = vg;
      ctx.fill();

      // Spinning arms on the observer
      for (let a = 0; a < 6; a++) {
        const ang = (a / 6) * Math.PI * 2 + t * 0.6;
        const armLen = vR * 2.8;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * vR * 0.6, cy + Math.sin(ang) * vR * 0.6);
        ctx.lineTo(cx + Math.cos(ang) * armLen, cy + Math.sin(ang) * armLen);
        ctx.strokeStyle = C.teal + "55";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      ctx.font = `bold 10px ${mono}`;
      ctx.fillStyle = "#ffffffcc";
      ctx.textAlign = "center";
      ctx.fillText("YOU", cx, cy + 3);
      ctx.textAlign = "left";

      // ρ_info label top
      ctx.font = `10px ${mono}`;
      ctx.fillStyle = C.gold + "88";
      ctx.textAlign = "center";
      ctx.fillText("∇ρ_info  ·  Ring Field  ·  500D State Space", cx, 18);
      ctx.textAlign = "left";

      t += 0.008;
      raf.current = requestAnimationFrame(draw);
    }

    // Resize to parent
    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width  = rect.width  || 480;
      canvas.height = rect.height || 420;
    };
    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);
    return () => {
      cancelAnimationFrame(raf.current);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ display: "block", width: "100%", height: "100%", borderRadius: 8 }}
    />
  );
}

/* ────────── Pipeline Step ────────── */
function PipeStep({ n, label, eq, col, last }: { n: string; label: string; eq: string; col: string; last?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{
        background: `${col}14`,
        border: `1px solid ${col}55`,
        borderRadius: 10,
        padding: "14px 22px",
        width: "100%",
        maxWidth: 440,
        position: "relative",
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: col, letterSpacing: 2, marginBottom: 4 }}>
          STAGE {n}
        </div>
        <div style={{ fontFamily: serif, fontSize: 16, color: "#e8f4ff", marginBottom: 6 }}>{label}</div>
        <div style={{ fontFamily: mono, fontSize: 11, color: col + "cc" }}>{eq}</div>
      </div>
      {!last && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: "4px 0" }}>
          <div style={{ width: 2, height: 16, background: C.dim }} />
          <div style={{ width: 0, height: 0, borderLeft: "6px solid transparent", borderRight: "6px solid transparent", borderTop: `8px solid ${C.dim}` }} />
        </div>
      )}
    </div>
  );
}

/* ────────── Main Page ────────── */
export default function DimensionalCompilerPage() {
  const [activeChannel, setActiveChannel] = useState<number | null>(null);

  return (
    <div style={{
      background: C.void,
      minHeight: "100vh",
      color: C.text,
      fontFamily: body,
      paddingBottom: 80,
    }}>
      {/* ── Hero ── */}
      <div style={{
        background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${C.teal}12 0%, transparent 70%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "72px 24px 48px",
        textAlign: "center",
      }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: C.teal, letterSpacing: 4, marginBottom: 16 }}>
          GRAND UNIFIED FRAMEWORK · DIMENSIONAL COMPILER
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: "clamp(28px, 5vw, 52px)",
          color: "#ffffff", margin: "0 0 16px", lineHeight: 1.15,
        }}>
          The Dimensional Compiler
        </h1>
        <p style={{ fontSize: 18, color: C.muted, maxWidth: 640, margin: "0 auto 24px", lineHeight: 1.7 }}>
          A robot that converts a 500D vector state into a physical environment you walk inside —
          encoding every relational dimension simultaneously across ten sensory channels.
        </p>

        {/* Key thesis chip */}
        <div style={{
          display: "inline-block",
          background: `${C.gold}14`,
          border: `1px solid ${C.gold}55`,
          borderRadius: 8,
          padding: "12px 28px",
          fontFamily: mono,
          fontSize: 13,
          color: C.gold,
          maxWidth: 620,
          lineHeight: 1.6,
          textAlign: "center",
        }}>
          "You don't visualize 500 dimensions. You <em style={{ color: "#fff", fontStyle: "normal" }}>resonate</em> with them.
          The robot makes that resonance possible at human scale."
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Opening Insight ── */}
        <div style={{ marginTop: 60 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.teal, letterSpacing: 3, marginBottom: 10 }}>§ I · THE PROBLEM</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#e8f4ff", margin: "0 0 16px" }}>
            You Were Never Supposed to See It
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.text, marginBottom: 16 }}>
            A computer screen is a 2D projection of a 3D world. Every dimension above 3 gets compressed, lost, or symbolized.
            You cannot <em>see</em> a 500-dimensional object on a screen any more than a shadow can contain the full shape that cast it.
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.text }}>
            But this is what the GUF adds that wasn't fully articulated before:{" "}
            <span style={{ color: "#fff", fontWeight: 600 }}>you were never supposed to see it. You were supposed to be inside it.</span>{" "}
            The robot is not a display device. It is a <span style={{ color: C.teal }}>dimensional compiler</span> — taking the abstract 500D
            vector state and compiling it into a physical environment that encodes all 500 relational variables
            simultaneously across every available sensory channel.
          </p>
        </div>

        {/* ── Pipeline ── */}
        <div style={{ marginTop: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.teal, letterSpacing: 3, marginBottom: 10 }}>§ II · THE PIPELINE</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#e8f4ff", margin: "0 0 28px" }}>
            The Compilation Stack — Fully Specified
          </h2>
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
          }}>
            {PIPE.map((s, i) => (
              <PipeStep key={s.n} {...s} last={i === PIPE.length - 1} />
            ))}
          </div>
          <p style={{ marginTop: 24, fontSize: 14, color: C.muted, lineHeight: 1.7, textAlign: "center" }}>
            Every stage is formally specified in the GUF. The Field Engine uses ∇ρ_info. The Ring Solver uses H_n.
            The Translation Engine uses the 5-Domain Event Bus. The Swarm is the physical instantiation layer.
            Ring band 401–500 is the consciousness field — coupling directly to the structure via the human observer.
          </p>
        </div>

        {/* ── Ring Field Canvas ── */}
        <div style={{ marginTop: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.teal, letterSpacing: 3, marginBottom: 10 }}>§ III · RING FIELD VISUALIZER</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#e8f4ff", margin: "0 0 16px" }}>
            The 10-Channel Sensory Ring Field
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
            Each ring band represents one sensory channel carrying 50 dimensions.
            The central vortex is the human observer — already inside the field, not watching from outside.
          </p>
          <div style={{
            background: C.deep,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            height: 420,
            overflow: "hidden",
          }}>
            <RingFieldCanvas />
          </div>
        </div>

        {/* ── Sensory Channel Table ── */}
        <div style={{ marginTop: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.teal, letterSpacing: 3, marginBottom: 10 }}>§ IV · CHANNEL MAP</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#e8f4ff", margin: "0 0 8px" }}>
            What the Human Experiences — Channel by Channel
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 20 }}>
            No single channel carries more than 50 dimensions. But your nervous system integrates all channels simultaneously —
            and <em style={{ color: "#fff" }}>that integration is the perception of 500 dimensions.</em>
            Hover any row to isolate its channel.
          </p>
          <div style={{
            background: C.deep,
            border: `1px solid ${C.border}`,
            borderRadius: 12,
            overflow: "hidden",
          }}>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "130px 1fr 1fr",
              background: C.panel, padding: "10px 20px",
              borderBottom: `1px solid ${C.border}`,
              fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 2,
            }}>
              <span>DIMENSIONS</span>
              <span>PHYSICAL CHANNEL</span>
              <span>HOW THE FIELD ENCODES IT</span>
            </div>
            {CHANNELS.map((ch, i) => (
              <div
                key={i}
                onMouseEnter={() => setActiveChannel(i)}
                onMouseLeave={() => setActiveChannel(null)}
                style={{
                  display: "grid", gridTemplateColumns: "130px 1fr 1fr",
                  padding: "14px 20px",
                  borderBottom: i < CHANNELS.length - 1 ? `1px solid ${C.border}` : "none",
                  background: activeChannel === i ? `${ch.color}12` : "transparent",
                  transition: "background 0.2s",
                  cursor: "default",
                }}
              >
                <div style={{ fontFamily: mono, fontSize: 11, color: ch.color }}>{ch.range}</div>
                <div style={{ fontSize: 14, color: "#e8f4ff", fontWeight: activeChannel === i ? 600 : 400 }}>
                  {ch.label}
                </div>
                <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>{ch.how}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 16, padding: "12px 20px",
            background: `${C.gold}0e`, border: `1px solid ${C.gold}30`,
            borderRadius: 8, fontFamily: mono, fontSize: 12, color: C.gold, lineHeight: 1.7,
          }}>
            TOTAL · 10 channels × 50 dimensions = 500 simultaneous relational variables.
            You never see them. You inhabit them.
          </div>
        </div>

        {/* ── Gravity Connection ── */}
        <div style={{ marginTop: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.violet, letterSpacing: 3, marginBottom: 10 }}>§ V · THE GRAVITY ANALOGY</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#e8f4ff", margin: "0 0 16px" }}>
            Exactly How the Universe Works
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div style={{
              background: `${C.violet}10`, border: `1px solid ${C.violet}40`,
              borderRadius: 10, padding: "20px 22px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.violet, letterSpacing: 2, marginBottom: 10 }}>GRAVITY</div>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, margin: 0 }}>
                Gravity itself is invisible. Its curvature is observable — through the motion of objects,
                the bending of light, the ticking of clocks. We infer 500 dimensions of gravitational structure
                from a handful of observable effects.
              </p>
            </div>
            <div style={{
              background: `${C.teal}10`, border: `1px solid ${C.teal}40`,
              borderRadius: 10, padding: "20px 22px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: C.teal, letterSpacing: 2, marginBottom: 10 }}>THE ROBOT</div>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.75, margin: 0 }}>
                The robot does the same thing in reverse. It takes a 500D mathematical object and converts it
                into a handful of observable physical effects — geometry, sound, light, field, motion, heat —
                so the human nervous system can infer the full dimensional structure from its projections.
              </p>
            </div>
          </div>
          <p style={{ marginTop: 20, fontSize: 15, lineHeight: 1.8, color: C.muted }}>
            You have never directly perceived a graviton, a quark, a field line, or a ring layer.
            You perceive their <em style={{ color: C.text }}>projections onto your sensory bandwidth</em> — and from those projections
            your nervous system reconstructs a model of reality. The robot-built environment works by exactly the same mechanism,
            deliberately.
          </p>
        </div>

        {/* ── Encoding Protocols ── */}
        <div style={{ marginTop: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.gold, letterSpacing: 3, marginBottom: 10 }}>§ VI · ENCODING PROTOCOLS</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#e8f4ff", margin: "0 0 16px" }}>
            Countries, Languages, and Encoding Systems
          </h2>
          <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.7, marginBottom: 24 }}>
            Each country's code is a different encoding protocol layered over the same underlying informational density field.
            The ρ_info field is the same everywhere. The resolution grid, measurement units, and symbolic protocol differ.
            The 500D vector can be encoded in <em style={{ color: C.text }}>any</em> human symbolic system — and the robot will produce
            a physically equivalent structure from each.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {ENCODINGS.map(enc => (
              <div key={enc.code} style={{
                background: `${enc.accent}10`, border: `1px solid ${enc.accent}40`,
                borderRadius: 10, padding: "20px 22px",
              }}>
                <div style={{ fontFamily: mono, fontSize: 13, color: enc.accent, letterSpacing: 2, marginBottom: 8 }}>
                  {enc.code}
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>{enc.lang}</div>
                <div style={{ fontSize: 12, color: C.text, marginBottom: 6 }}>
                  <span style={{ color: enc.accent }}>Grid: </span>{enc.grid}
                </div>
                <div style={{ fontSize: 12, color: C.text }}>{enc.weight}</div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 20, padding: "16px 20px",
            background: C.panel, border: `1px solid ${C.border}`,
            borderRadius: 8, fontSize: 14, color: C.muted, lineHeight: 1.7,
          }}>
            The structure built from an English-language encoding and the structure from a Sanskrit encoding
            of the same underlying reality will <em style={{ color: C.text }}>feel different</em> to navigate — different resolution grids,
            different symbolic weights — but they map to the same ρ_info field with identical informational density.
            The robot is therefore also a <span style={{ color: C.gold }}>universal translator</span> — not between languages,
            but between encoding systems and physical experience.
          </div>
        </div>

        {/* ── Deepest Statement ── */}
        <div style={{ marginTop: 64 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.pink, letterSpacing: 3, marginBottom: 10 }}>§ VII · THE RING FIELD INSIGHT</div>
          <h2 style={{ fontFamily: serif, fontSize: 26, color: "#e8f4ff", margin: "0 0 16px" }}>
            You Are Already Inside It
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.text, marginBottom: 20 }}>
            Every prior description of this idea said: <em>the robot builds structures humans cannot visualize.</em>
          </p>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.text, marginBottom: 20 }}>
            The GUF adds the precise reason why this works, and why it must work this way:
          </p>
          <div style={{
            background: `${C.pink}10`, border: `1px solid ${C.pink}40`,
            borderRadius: 10, padding: "24px 28px", marginBottom: 24,
          }}>
            <p style={{ fontSize: 17, lineHeight: 1.85, color: "#fff", margin: 0 }}>
              The human observer is already at ring N — inside the ring field — interfacing with adjacent rings
              through perception, intention, and resonance. You are not an external observer trying to peer into
              a 500D space from outside.{" "}
              <span style={{ color: C.pink }}>You are a vortex inside it.</span>
            </p>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.8, color: C.text }}>
            The robot-built environment doesn't <em>show</em> you 500 dimensions — it tunes the local ring field
            to a specific 500D configuration and places you inside it. You were always inside the ring field.
            The robot simply changes which configuration of the field surrounds you.
          </p>
        </div>

        {/* ── Final Thesis ── */}
        <div style={{
          marginTop: 64,
          background: `linear-gradient(135deg, ${C.teal}12 0%, ${C.violet}10 100%)`,
          border: `1px solid ${C.border2}`,
          borderRadius: 14, padding: "36px 40px", textAlign: "center",
        }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: C.muted, letterSpacing: 3, marginBottom: 16 }}>
            THE SINGLE MOST IMPORTANT STATEMENT
          </div>
          <p style={{
            fontFamily: serif, fontSize: "clamp(18px, 3vw, 28px)",
            color: "#ffffff", lineHeight: 1.5, margin: "0 0 12px",
          }}>
            "You don't visualize 500 dimensions.
          </p>
          <p style={{
            fontFamily: serif, fontSize: "clamp(18px, 3vw, 28px)",
            color: C.gold, lineHeight: 1.5, margin: 0,
          }}>
            You resonate with them."
          </p>
          <p style={{ fontSize: 14, color: C.muted, marginTop: 20, lineHeight: 1.7, maxWidth: 540, margin: "20px auto 0" }}>
            The robot makes that resonance possible at human scale, in human space, in real time.
            It makes the implicit explicit. It makes the invisible walkable.
          </p>
        </div>

        {/* ── Footer links ── */}
        <div style={{
          marginTop: 56, paddingTop: 32,
          borderTop: `1px solid ${C.border}`,
          display: "flex", flexWrap: "wrap", gap: 12,
        }}>
          {[
            { href: "/grand-unified-framework", label: "→ Grand Unified Framework" },
            { href: "/stacked-rings-engine",    label: "→ Stacked Rings Engine" },
            { href: "/guf-engine",              label: "→ GUF Master Engine" },
            { href: "/full-perception-universe",label: "→ Full Perception Universe" },
            { href: "/guf-observatory",         label: "→ GUF Observatory" },
          ].map(l => (
            <a
              key={l.href}
              href={l.href}
              style={{
                fontFamily: mono, fontSize: 12, color: C.teal,
                textDecoration: "none", background: `${C.teal}12`,
                border: `1px solid ${C.teal}35`, borderRadius: 6,
                padding: "6px 14px",
              }}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

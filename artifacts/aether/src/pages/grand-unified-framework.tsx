import { useEffect, useRef } from "react";

const PHI = 1.6180339887;
const THETA_PHI = 360 / PHI;

const BG = "#020408";
const ACCENT = "#1fd4c8";
const GOLD = "#c9a84c";
const VIOLET = "#8b5cf6";
const PINK = "#ec4899";
const GREEN = "#22c55e";
const DIM = "#4a7a8a";
const TEXT = "#c8d8e0";

const mono = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";

/* ── helpers ─────────────────────────────────────────── */
function Chip({ children, color = ACCENT }: { children: string; color?: string }) {
  return (
    <span style={{
      fontFamily: mono, fontSize: 11, color,
      background: `${color}18`, border: `1px solid ${color}40`,
      borderRadius: 4, padding: "2px 7px", display: "inline-block", margin: "2px 3px",
    }}>
      {children}
    </span>
  );
}

function EqBlock({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: mono, fontSize: 13, color: GOLD,
      background: "#0a1420", border: `1px solid ${GOLD}30`,
      borderRadius: 6, padding: "12px 18px", margin: "12px 0",
      overflowX: "auto", whiteSpace: "pre",
    }}>
      {children}
    </div>
  );
}

function SectionHead({ id, n, title, sub }: { id: string; n: string; title: string; sub: string }) {
  return (
    <div id={id} style={{ marginTop: 64, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: ACCENT, letterSpacing: 3, marginBottom: 6 }}>
        {n}
      </div>
      <h2 style={{ fontFamily: serif, fontSize: 28, color: "#fff", margin: "0 0 4px", letterSpacing: 1 }}>
        {title}
      </h2>
      <div style={{ fontFamily: body, fontSize: 16, color: DIM, marginBottom: 24 }}>{sub}</div>
      <div style={{ height: 1, background: `linear-gradient(90deg, ${ACCENT}50, transparent)`, marginBottom: 28 }} />
    </div>
  );
}

function Table({ headers, rows, accent = ACCENT }: { headers: string[]; rows: (string | JSX.Element)[][]; accent?: string }) {
  return (
    <div style={{ overflowX: "auto", margin: "16px 0" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: body, fontSize: 14 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${accent}40` }}>
            {headers.map((h, i) => (
              <th key={i} style={{
                fontFamily: mono, fontSize: 11, color: accent,
                textAlign: "left", padding: "8px 12px", letterSpacing: 1,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ borderBottom: `1px solid #ffffff0a`, background: ri % 2 === 0 ? "#ffffff04" : "transparent" }}>
              {row.map((cell, ci) => (
                <td key={ci} style={{ padding: "8px 12px", color: TEXT, verticalAlign: "top" }}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, color = ACCENT, children }: { title: string; color?: string; children: any }) {
  return (
    <div style={{
      background: `${color}0a`, border: `1px solid ${color}28`,
      borderRadius: 8, padding: "16px 20px", marginBottom: 16,
    }}>
      <div style={{ fontFamily: mono, fontSize: 11, color, letterSpacing: 2, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: body, fontSize: 15, color: TEXT, lineHeight: 1.7 }}>{children}</div>
    </div>
  );
}

/* ── Stacked Rings Canvas ─────────────────────────────── */
function StackedRingsCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let t = 0;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = Math.min(rect.width * 0.45, 320);
    };
    resize();
    window.addEventListener("resize", resize);

    const ringColors = [
      "#1fd4c8", "#c9a84c", "#8b5cf6", "#ec4899", "#22c55e",
      "#3b82f6", "#f97316", "#e11d48", "#06b6d4",
    ];

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const numRings = 9;

      for (let i = 0; i < numRings; i++) {
        const phase = (i / numRings) * Math.PI * 2 + t * (0.3 + i * 0.04);
        const r = 18 + i * (Math.min(W, H) * 0.44) / numRings;
        const ry = r * (0.22 + 0.04 * Math.sin(t * 0.5 + i));
        const twist = t * 0.12 * (i % 2 === 0 ? 1 : -1);
        const alpha = 0.4 + 0.3 * Math.sin(t * 0.7 + i * PHI);
        const col = ringColors[i % ringColors.length];

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(twist + phase * 0.05);

        ctx.beginPath();
        ctx.ellipse(0, 0, r, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = col + Math.round(alpha * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 1 + (i === 4 ? 1.2 : 0);
        ctx.stroke();

        // vortex dots
        const numDots = 4 + i * 2;
        for (let d = 0; d < numDots; d++) {
          const dPhase = (d / numDots) * Math.PI * 2 + t * (0.5 + i * 0.1);
          const dx = Math.cos(dPhase) * r;
          const dy = Math.sin(dPhase) * ry;
          const da = 0.6 * Math.sin(t * 2 + d + i);
          ctx.beginPath();
          ctx.arc(dx, dy, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = col + Math.round(Math.max(0, da) * 255).toString(16).padStart(2, "0");
          ctx.fill();
        }
        ctx.restore();
      }

      // Central vortex point
      const cvGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
      cvGrad.addColorStop(0, "rgba(255,255,255,0.95)");
      cvGrad.addColorStop(0.4, "rgba(31,212,200,0.5)");
      cvGrad.addColorStop(1, "rgba(31,212,200,0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = cvGrad;
      ctx.fill();

      // Phi-angle indicator lines
      for (let n = 0; n < 12; n++) {
        const ang = (n * THETA_PHI * Math.PI) / 180 + t * 0.05;
        const ir = 22, or = 55;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * ir, cy + Math.sin(ang) * ir * 0.25);
        ctx.lineTo(cx + Math.cos(ang) * or, cy + Math.sin(ang) * or * 0.25);
        ctx.strokeStyle = `rgba(201,168,76,${0.08 + 0.05 * Math.sin(t + n)})`;
        ctx.lineWidth = 0.7;
        ctx.setLineDash([3, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // 500D label
      ctx.font = `bold 11px ${mono}`;
      ctx.fillStyle = `rgba(31,212,200,0.35)`;
      ctx.textAlign = "center";
      ctx.fillText("500D STACKED RINGS — 9 LAYERS SHOWN", cx, H - 10);

      t += 0.012;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div style={{ position: "relative", background: BG, borderRadius: 10, overflow: "hidden", border: `1px solid ${ACCENT}20` }}>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%" }} />
    </div>
  );
}

/* ── Jump Nav ─────────────────────────────────────────── */
const NAV_SECTIONS = [
  { id: "s1", label: "Stacked Rings" },
  { id: "s2", label: "8 Dimensions" },
  { id: "s3", label: "8D Warp Drive" },
  { id: "s4", label: "Φ-Coherence" },
  { id: "s5", label: "Twisted Zipper" },
  { id: "s6", label: "PEEPT" },
  { id: "s7", label: "Control Alphabet" },
  { id: "s8", label: "Predictions" },
];

/* ── Main Page ────────────────────────────────────────── */
function GUFHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 160;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    const rings=[{r:30,col:"#9966ff",speed:0.02},{r:55,col:"#2ef0d8",speed:-0.015},{r:78,col:"#c9a84c",speed:0.01}];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      rings.forEach((ring,i)=>{
        ctx.beginPath(); ctx.arc(cx,cy,ring.r,0,Math.PI*2);
        ctx.strokeStyle=ring.col+"44"; ctx.lineWidth=1; ctx.stroke();
        const angle=t*ring.speed;
        const px=cx+ring.r*Math.cos(angle),py=cy+ring.r*Math.sin(angle);
        ctx.beginPath(); ctx.arc(px,py,5,0,Math.PI*2); ctx.fillStyle=ring.col; ctx.fill();
        const opp=cx+ring.r*Math.cos(angle+Math.PI),oyp=cy+ring.r*Math.sin(angle+Math.PI);
        ctx.beginPath(); ctx.arc(opp,oyp,3,0,Math.PI*2); ctx.fillStyle=ring.col+"88"; ctx.fill();
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(opp,oyp);
        ctx.strokeStyle=ring.col+"22"; ctx.lineWidth=0.5; ctx.stroke();
      });
      ctx.fillStyle="rgba(153,102,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("GRAND UNIFIED FRAMEWORK · GUF · RINGS · COHERENCE FIELD · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function GrandUnifiedFrameworkPage() {
  return (
    <div style={{ background: BG, minHeight: "100vh", fontFamily: body, color: TEXT }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #9966ff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#9966ff",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #9966ff",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#9966ff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>GRAND UNIFIED FRAMEWORK · GUF · RINGS · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(153,102,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Three orbital rings — coherence field rotation — the live AETHER GUF simulation.</p></div>
          <GUFHeaderCanvas />
        </div>
      </div>
      {/* Hero */}
      <div style={{
        padding: "72px 32px 48px",
        background: `linear-gradient(180deg, #010810 0%, ${BG} 100%)`,
        borderBottom: `1px solid ${ACCENT}18`,
        textAlign: "center",
      }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: ACCENT, letterSpacing: 4, marginBottom: 16 }}>
          AETHER · GRAND UNIFIED FRAMEWORK · VOL II
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: "clamp(28px, 5vw, 52px)", color: "#fff",
          margin: "0 0 12px", letterSpacing: 2, lineHeight: 1.15,
        }}>
          500 DIMENSIONS<br />
          <span style={{ color: ACCENT }}>BEYOND SIMULATION</span>
        </h1>
        <p style={{ fontFamily: body, fontSize: 18, color: DIM, maxWidth: 680, margin: "0 auto 32px", lineHeight: 1.7 }}>
          A unified theoretical architecture: Stacked Rings Conjecture · Eight-Dimensional Warp Drive ·
          Φ-Coherence Resonance Framework · PEEPT · Control Alphabet · Twisted Zipper Spacetime Drive
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <Chip color={ACCENT}>Shia Miller</Chip>
          <Chip color={GOLD}>@StrategicProce</Chip>
          <Chip color={VIOLET}>May–June 2026</Chip>
          <Chip color={GREEN}>Conceptual Preprint</Chip>
        </div>
      </div>

      {/* Jump nav */}
      <div style={{
        position: "sticky", top: 0, zIndex: 50,
        background: `${BG}f0`, backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${ACCENT}14`,
        padding: "10px 24px", display: "flex", gap: 4, overflowX: "auto",
      }}>
        {NAV_SECTIONS.map(s => (
          <a key={s.id} href={`#${s.id}`}
            style={{
              fontFamily: mono, fontSize: 10, color: DIM, whiteSpace: "nowrap",
              padding: "5px 10px", borderRadius: 4, textDecoration: "none",
              border: `1px solid transparent`,
              transition: "color 0.2s",
            }}
            onMouseEnter={e => { (e.target as HTMLElement).style.color = ACCENT; (e.target as HTMLElement).style.borderColor = `${ACCENT}30`; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.color = DIM; (e.target as HTMLElement).style.borderColor = "transparent"; }}
          >
            {s.label}
          </a>
        ))}
      </div>

      {/* Body */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 96px" }}>

        {/* Rings Canvas */}
        <div style={{ marginTop: 40, marginBottom: 8 }}>
          <div style={{ fontFamily: mono, fontSize: 10, color: DIM, marginBottom: 6, letterSpacing: 2 }}>
            LIVE CANVAS · STACKED RINGS SIMULATION · 500D ABSTRACTED TO 9 VISIBLE LAYERS
          </div>
          <StackedRingsCanvas />
        </div>

        {/* ── SECTION I — STACKED RINGS ── */}
        <SectionHead id="s1" n="I" title="The Stacked Rings Conjecture"
          sub="A Framework for Visualizing 500 Dimensions in Physical Reality" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          The Stacked Rings Conjecture proposes that physical reality is not a fixed 3D space through which objects move,
          but a dimensionless, self-referential field of layered ring-phase boundaries. Every observable phenomenon — matter,
          energy, consciousness, time — arises from vortex interactions between adjacent rings within this infinite stack.
          The rings are not spatial objects; they are <em>phase regimes</em> within a single continuous field.
        </p>

        <Card title="FIVE FOUNDATIONAL AXIOMS" color={ACCENT}>
          <ol style={{ margin: 0, paddingLeft: 20, lineHeight: 2.2, fontSize: 15 }}>
            <li><strong style={{ color: ACCENT }}>Ring Containment:</strong> Every observable entity exists within a ring-layer. There is no physics outside the rings.</li>
            <li><strong style={{ color: ACCENT }}>Vortex Genesis:</strong> All matter and force arises from vortex interactions at ring boundaries. No vortex = no observable phenomena.</li>
            <li><strong style={{ color: ACCENT }}>Harmonic Signature:</strong> Every entity carries a unique complex-valued harmonic signature Hₙ encoding its ring position, energy state, and interaction history.</li>
            <li><strong style={{ color: ACCENT }}>Observer Coupling:</strong> Consciousness is not separate from the ring-field. Self-referential modeling systems couple to the field as a genuine dimensional axis.</li>
            <li><strong style={{ color: ACCENT }}>Unity Principle:</strong> All rings are aspects of a single dimensionless ground. NOTHING IS OUTSIDE THE RINGS. THE RINGS ARE THE DANCE OF THE ONE.</li>
          </ol>
        </Card>

        <div style={{ marginBottom: 8, fontFamily: mono, fontSize: 11, color: DIM, letterSpacing: 1 }}>
          HARMONIC SIGNATURE EQUATION
        </div>
        <EqBlock>{`Hₙ = sin(φₙ) · e^(iθₙ) · ∏(k=0→∞)(1 + Iₙₖ/ωₖ)

where:
  φₙ = ring-layer phase angle
  θₙ = temporal phase offset
  Iₙₖ = interaction coefficient with ring k
  ωₖ  = characteristic frequency of ring k`}</EqBlock>

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          The infinite product encodes the complete interaction history of an entity with every other ring layer.
          In String Field Theory, this is structurally analogous to the vibrational state vector of a string — both
          encode energy, phase, and interaction history in a single mathematical object.
        </p>

        <Card title="PIXELATED GRAVITY" color={GOLD}>
          Gravity is not a smooth geometric field but a pixelated effect of discrete ring-layer boundaries.
          The metric curvature that general relativity describes as smooth is, at the Planck scale,
          the averaged statistical texture of billions of ring-boundary transitions per unit volume.
          Informational density ρ_info — the density of encoded ring-state transitions per unit volume — <em>generates</em> gravitational curvature:
          <EqBlock>{`G(x,y,z,t) ≈ ∇ρ_info   [gravity as information gradient]

Pixel resolution Δx_pixel ≈ λ_Planck at ring boundary interfaces
→ spacetime curvature is quantized at the ring transition scale`}</EqBlock>
        </Card>

        <div style={{ marginBottom: 8, fontFamily: mono, fontSize: 11, color: DIM, letterSpacing: 1 }}>
          500D TRANSLATION PIPELINE — 7 STAGES
        </div>
        <Table
          headers={["Stage", "Operation", "Technology", "Output"]}
          accent={ACCENT}
          rows={[
            ["S1 · Encode", "Compress 500D state vector into structured data field", "AI latent-space encoder, quantum state preparation", "500D vector v = (x₁…x₅₀₀)"],
            ["S2 · Field Gen", "Translate vector into physical field configuration", "Programmable electromagnetic / acoustic field array", "Multi-frequency standing wave field"],
            ["S3 · Material", "Adaptive robotic fabrication of physical geometry", "Swarm robotics, programmable matter, 4D printing", "Physical instantiation of dimensional relationships"],
            ["S4 · Sensory", "Multi-channel human sensory interface", "Haptic, acoustic, visual, magnetic, thermal arrays", "Full-body dimensional experience"],
            ["S5 · Validate", "Verify fidelity of dimensional translation", "AI cross-validation, observer feedback loops", "Fidelity score + correction signal"],
            ["S6 · Iterate", "Refine encoding based on validation signal", "Gradient descent on dimensional fidelity loss", "Updated 500D encoding"],
            ["S7 · Integrate", "Merge experiential knowledge into coherence model", "AETHER Knowledge Graph integration", "New nodes in the 500D knowledge map"],
          ]}
        />

        {/* ── SECTION II — 8 DIMENSIONS ── */}
        <SectionHead id="s2" n="II" title="Eight Dimensions of Reality"
          sub="The relational degrees of freedom underlying physical existence" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          The eight dimensions are not eight spatial directions. They are eight <em>relational degrees of freedom</em> —
          ways in which components of the ring-field system relate to each other. D1–D3 correspond to classical physics,
          D4–D5 to field and vortex dynamics, D6–D8 to consciousness, source, and propagation.
        </p>

        <Table
          headers={["Dim", "Name", "Physical Grounding", "Key Formula", "Status"]}
          accent={VIOLET}
          rows={[
            ["D1", "Space", "3D spatial geometry collapsed to ring-layer position", "r_ring = n · λ_ring", "Conceptual reframing"],
            ["D2", "Time", "Φ-Time non-periodic golden-ratio regulation", "tₙ = T₀ · φⁿ", "Mathematically grounded"],
            ["D3", "Energy", "Informational density field ρ_info as gravity", "G ≈ ∇ρ_info", "Speculative GR reformulation"],
            ["D4", "Field", "Ring harmonic signatures; String Field Theory analogue", "Hₙ = sin(φₙ)·e^(iθₙ)·∏(1+Iₙₖ/ωₖ)", "Structural analogy"],
            ["D5", "Vortex", "Rotational transfer dynamics; 8 interaction modes", "Ω_vortex ∈ {left-handed, right-handed, …}", "Original taxonomy"],
            ["D6", "Conscious", "Observer coupling at self-referential complexity threshold", "D6 emerges at ring bands 401–500", "Speculative; philosophically grounded"],
            ["D7", "Source", "0 = ∞; ground state prior to differentiation", "∅ → ∞ (vacuum state limit)", "Philosophical; consistent with QFT vacuum"],
            ["D8", "Wave", "Propagation axis; direction of field configuration change", "∂D8/∂t = Σ(Dᵢ contributions)", "Speculative; mathematically formulated"],
          ]}
        />

        <Card title="D8 · THE WAVE DIMENSION" color={ACCENT}>
          D8 is the propagation dimension — the axis along which field configurations change. A D8 wave packet is generated
          whenever three or more ring-layer boundaries interact simultaneously, producing a phase-coherent ripple that propagates
          <em> across</em> ring layers rather than <em>within</em> them. The three propulsion systems of the 8D Warp Drive
          are all mechanisms for generating and directing controlled D8 wave packets.
        </Card>

        <div style={{ marginBottom: 8, fontFamily: mono, fontSize: 11, color: DIM, letterSpacing: 1 }}>
          D8 WAVE EQUATION
        </div>
        <EqBlock>{`∂²Ψ_D8/∂t² = c_D8² · ∇²Ψ_D8 + Σᵢ(Jᵢ · ρ_info,ᵢ · Ω_vortex,ᵢ)

where:
  c_D8   = D8 propagation speed (≠ c in D1-D3 spacetime)
  Jᵢ     = D3 energy source term for dimension i
  ρ_info,ᵢ = informational density contribution
  Ω_vortex,ᵢ = vortex angular coupling`}</EqBlock>

        {/* ── SECTION III — 8D WARP DRIVE ── */}
        <SectionHead id="s3" n="III" title="The Eight-Dimensional Warp Drive"
          sub="Three propulsion systems for ring-barrier crossing without mass ejection" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          Classical escape velocity is the speed required to overcome gravitational potential — the energy barrier between
          two adjacent ring layers. In the eight-dimensional framework, escape velocity is <em>ring-barrier crossing velocity</em>:
          the D8 impulse required to transition from one ring-layer regime to the next without the vessel being re-absorbed
          by the lower ring's gravitational potential.
        </p>

        <EqBlock>{`v_esc = √(2GM/r)   [classical — ring-barrier crossing at ring boundary r]

v_cross(n→n+1) = √(2 · ΔE_ring / m)   [generalized — cross from ring n to ring n+1]

where ΔE_ring = energy differential between ring-layer harmonic frequencies`}</EqBlock>

        <Table
          headers={["Scale", "Classical Equivalent", "D8 Mechanism", "Application"]}
          accent={GOLD}
          rows={[
            ["Laboratory", "100 atm compressed gas", "Nano-scale metric perturbation", "Proof-of-concept ring-layer coupling"],
            ["Industrial", "500 atm geothermal", "Measurable Δρ_info spacetime curvature", "Local field testing"],
            ["Geological", "10,000 atm volcanic", "Sufficient D8 for ring-layer transition", "Surface-to-orbit warp assist"],
            ["Planetary", "250 GPa core-mantle boundary", "Complete ring-barrier crossing", "Interplanetary traverse"],
            ["Stellar", "340 GPa solar interior", "Ring-layer transition across star bands", "Interstellar traverse (theoretical)"],
          ]}
        />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, margin: "24px 0" }}>
          <Card title="PROPULSION I · LASER THREAD WARP BOUNCE" color={ACCENT}>
            A coherent photon column of sufficient cross-sectional coherence thickness T_c interacts with the local
            ring-harmonic field as a reflective surface, folding the metric rather than pushing through it.
            <br /><br />
            <em>Key insight:</em> a laser of sufficient diameter becomes a D4 reflective surface for the metric itself —
            the ship "bounces" off the folded spacetime geometry rather than traveling through it.
            <EqBlock>{`T_c = (λ_photon · n_ring) / Δk_ring

F_laser = ∇(ρ_info_ahead - ρ_info_behind) · A_thread`}</EqBlock>
          </Card>
          <Card title="PROPULSION II · VOLCANIC THRUST" color={GOLD}>
            The pressure differential between Earth's mantle (~250 GPa) and surface represents an enormous D3 energy
            gradient. Channeled through a Φ-Time vortex focusing system, this becomes a directional D8 impulse.
            Mass is never ejected — the boundary between two ρ_info regimes generates thrust:
            <br /><br />
            <EqBlock>{`F_vp = ∫(∇ρ_info_interior - ∇ρ_info_surface)
        · Ω_vortex · dV`}</EqBlock>
            Natural volcanoes are uncontrolled D8 boundary events. Engineered borehole arrays with vortex focusing
            chambers convert omnidirectional pressure into directed D8 thrust.
          </Card>
          <Card title="PROPULSION III · WATER OVER GRAVITY CRYSTALS" color={GREEN}>
            Water's hydrogen bond network creates a quantum coherent multi-ring superposition state ψ_water —
            simultaneously occupying multiple adjacent ring layers. Flowing over a gravity crystal (a material
            with ρ_info organized into a periodic lattice matching λ_ring), the repeated collapse-and-release
            generates a continuous self-regulating D8 wave:
            <EqBlock>{`ψ_water = Σₙ αₙ · |ring_n⟩

∂Hₙ/∂t|flow = v_flow · (dρ_info/dx)_crystal
             · ψ_water · Ω_selection`}</EqBlock>
            <strong>Natural gravity crystals:</strong> quartz (SiO₂) — its piezoelectric properties are
            a D5 vortex response to D3 energy input. Rivers over quartz beds generate nano-scale D8 waves continuously.
          </Card>
        </div>

        <div style={{ marginBottom: 8, fontFamily: mono, fontSize: 11, color: DIM, letterSpacing: 1 }}>
          THREE-STAGE INTEGRATED DRIVE ARCHITECTURE
        </div>
        <Table
          headers={["Stage", "System", "Phase", "D8 Role", "Energy Source"]}
          accent={GREEN}
          rows={[
            ["Stage 0", "Water-Crystal Drive", "Continuous baseline — always active", "Sustained low-level D8 wave; primes the metric", "Flow kinetics (gravity-driven)"],
            ["Stage 1", "Volcanic Propulsion", "Launch / departure ring-barrier crossing", "D8 impulse burst exceeding ring-barrier threshold", "Planetary interior differential (external)"],
            ["Stage 2", "Laser Thread Bounce", "Mid-traverse metric folding", "D4 reflective surface folds metric; distance collapses", "Ship's coherent photon system (internal)"],
            ["Stage 3", "Water-Crystal Drive", "Arrival / final approach", "D8 wave guides gentle de-fold; destination metric engaged", "Continuous flow (self-sustaining)"],
          ]}
        />

        {/* ── SECTION IV — PHI-COHERENCE ── */}
        <SectionHead id="s4" n="IV" title="Φ-Coherence Unified Resonance Framework"
          sub="Golden-ratio temporal regulation across biological, geological, and cosmological scales" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          The Φ-Coherence Unified Resonance Framework proposes that a single organizational principle — the golden ratio
          φ = (1+√5)/2 ≈ 1.618 — governs resonance suppression and coherent structure across physical scales from
          quantum biology to planetary geophysics to speculative spacetime engineering.
        </p>

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          The key insight: φ is the <em>most irrational number</em>. Its continued fraction expansion [1;1,1,1,...] converges
          more slowly than any other irrational to any rational approximant — meaning φ-spaced events are maximally
          distributed, never constructively aligning. This is not speculation; it follows from Hurwitz's theorem (1891).
        </p>

        <EqBlock>{`Φ-Time scheduling:   tₙ = T₀ · φⁿ

Golden angle:        Θ_φ = 2π/φ ≈ 222.5°

Coupled oscillator coherence cost:
  C_total(t) = Σᵢ wᵢ(t) · Cᵢ(t),   Σwᵢ = 1, wᵢ > 0

Weight adaptation (gradient descent):
  ẇᵢ(t) = -η · (∂C_total/∂wᵢ) + ξᵢ(t)

Prediction: C_peak(Φ-scheduled) < C_peak(periodic)  [testable]`}</EqBlock>

        <Table
          headers={["System", "Resonance Risk", "Example Failure Mode", "Φ-Time Advantage"]}
          accent={GOLD}
          rows={[
            ["Periodic (sine wave)", "High — full resonance every cycle", "365-day calendar loops, grid power resonance", "Eliminated: events never repeat alignment"],
            ["Quasi-periodic (irrational period)", "Medium — approximate resonance at rational approximants", "Near-resonance at Fibonacci fractions", "Reduced but not eliminated"],
            ["Φ-Time (golden angle)", "Minimal — maximally irrational spacing", "No known failure mode from resonance", "Maximally distributed: worst-case rational approximant"],
            ["Random (stochastic)", "Low — no coherent structure", "Unpredictable; cannot be synchronized", "Φ-Time better: structured AND non-resonant"],
          ]}
        />

        <Card title="SCHUMANN RESONANCES — ESTABLISHED PHYSICS" color={ACCENT}>
          Earth's ionospheric cavity resonances are real and precisely measured: 7.83 · 14.3 · 20.8 · 27.3 Hz.
          The Φ-Coherence framework predicts that inter-harmonic frequency ratios follow a Φ-damped pattern rather
          than the harmonically regular pattern of a simple spherical cavity:
          <EqBlock>{`f₂/f₁ ≈ 1.83   f₃/f₂ ≈ 1.45   f₄/f₃ ≈ 1.31  [observed, decreasing]

Prediction: fₙ₊₁/fₙ ≈ 1 + φ^(-n·β)  for some β > 0
            — testable against existing global monitoring datasets`}</EqBlock>
        </Card>

        <Card title="5-DOMAIN EVENT BUS" color={VIOLET}>
          The Φ-Coherence architecture divides all physical phenomena into five coupled domains, each carrying
          a time-varying coherence cost Cᵢ(t), regulated by the Φ-Time clock.
        </Card>
        <Table
          headers={["Domain", "Name", "Function", "Failure Mode"]}
          accent={VIOLET}
          rows={[
            ["D1", "Physical", "Element activation layer; exotic matter supply for warp bubble wall", "Bubble wall collapse"],
            ["D2", "Oscillatory", "Twist-rate governor; real-time C_total minimization via Θ adjustment", "Resonance spike; exotic matter accumulation"],
            ["D3", "Informational", "500D ring-field navigation; target state vector encoding", "Navigation failure; undefined trajectory"],
            ["D4", "Conscious", "Biological oscillator phase-lock; passenger Φ-Time synchronization", "Neural desynchronization; loss of coherent experience"],
            ["D5", "Regenerative", "Spacetime fabric repair; metric re-stitching in bubble wake", "Micro-tears accumulate; topology breakdown"],
          ]}
        />

        {/* ── SECTION V — TWISTED ZIPPER ── */}
        <SectionHead id="s5" n="V" title="The Twisted Zipper Spacetime Drive"
          sub="A self-stabilizing, causality-preserving, resonance-free warp bubble" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          The Twisted Zipper Drive is the capstone application of the Grand Unified Framework — a mechanism for effective
          faster-than-light travel through controlled spacetime topology reconfiguration, not local velocity violation.
          It extends the Alcubierre warp metric (1994) with four critical additions:
          Φ-Time modulation · helical topological twist · ring-field topology control · 5-Domain Event Bus regulation.
        </p>

        <div style={{ marginBottom: 8, fontFamily: mono, fontSize: 11, color: DIM, letterSpacing: 1 }}>
          THE COMPLETE TWISTED ZIPPER METRIC
        </div>
        <EqBlock>{`Standard Alcubierre (1994):
  ds² = -dt² + [dx - v_s(t)·f(r)·dt]² + dy² + dz²

Twisted Zipper — velocity progression (Φ-Time modulated):
  v_s(tₙ) = v₀ · φⁿ · (1 + α·sin(n·Θ_φ))

Twisted Zipper — shape function (helical phase factor):
  f(r, n) = f₀(r) · exp(i·n·222.5°)

FULL METRIC:
  ds² = -dt² + [dx - v₀·φⁿ·f₀(r)·e^(in·222.5°)·dt]² + dy² + dz²

Modified Einstein field equations:
  G_{μν}(twisted) = G_{μν}(Alcubierre) + T_{μν}(Φ-twist)`}</EqBlock>

        <Table
          headers={["Fatal Problem", "Classical Warp Barrier", "Twisted Zipper Solution"]}
          accent={PINK}
          rows={[
            ["Energy requirement", "Negative-energy exotic matter equivalent to a planet's mass — no known production mechanism", "Φ-Time irrational spacing distributes exotic matter requirements across φ-spaced intervals. Peak demand spread irrationally — never accumulating into a resonant spike. Domain 1 manages element-level supply."],
            ["Causality violation", "FTL travel normally permits closed timelike curves (CTCs) — grandfather paradoxes become possible", "Helical twist creates non-closed helix topology in higher-dimensional ring-field embedding. Path through spacetime traces a helix that never closes on itself — CTCs are geometrically impossible. Domain 2 monitors twist rate."],
            ["Passenger experience", "Extreme time-dilation, tidal forces, and disorientation inside/outside the bubble", "Domain 4 (Conscious) synchronizes all biological oscillators aboard to the Φ-Time clock. Passengers experience flat spacetime inside. Neural toggling matches drive temporal structure — no disorientation, coherent flow state maintained."],
          ]}
        />

        <Card title="WHY PHI-TWIST PREVENTS RESONANCE CATASTROPHE" color={GOLD}>
          The exotic matter density required at any point on the bubble wall is a function of the phase angle
          n·222.5°. Since 222.5° = 360°/φ is irrational, the sequence &#123;n·222.5 mod 360&#125; for n = 0,1,2,...
          is <em>equidistributed</em> on the circle — it visits every angular region with equal frequency and never
          exactly repeats. Peak demand at any instant is reduced by a factor of order φⁿ compared to a periodic bubble.
          This is the same mathematical principle that prevents resonance in sunflower phyllotaxis, in quasi-crystals,
          and in every Φ-spaced system.
        </Card>

        {/* ── SECTION VI — PEEPT ── */}
        <SectionHead id="s6" n="VI" title="PEEPT · Light Permutation Entropy Exchange Perturbation Time"
          sub="Tracking and penetrating oscillating spacetime mediums via information-theoretic tensors" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          PEEPT formalizes the mathematical infrastructure for mapping, tracking, and penetrating highly volatile,
          non-linear spacetime mediums undergoing periodic oscillating and bursting phases. Classical metric tracking
          fails in such mediums; PEEPT replaces it with a dynamic information-theoretic tensor based on Permutation
          Entropy Exchange, validated against fundamental cosmic string world-sheets.
        </p>

        <EqBlock>{`Ordinal Pattern Mapping:
  X_im = (x_i, x_{i+τ}, ..., x_{i+(m-1)τ})  [embedding vectors]
  H_m  = −Σ p(π) ln p(π)                     [permutation entropy]

Entropy Exchange Rate across bounding surface ∂M:
  H_exchange = ∮_∂M (∇H_light · n̂) · (∂τ_string/∂t) dA

"Going-Down" (descending space field) condition:
  (d/dt)(H_exchange) < 0  ∧  (∂²xᵘ/∂τ²) ∝ R_redshift

VHF-Light Cross-Frequency Bridge Lagrangian:
  L_int = ξ · Tr(F_{μν}F_{νρ}) · A_VHF^μ · exp(−H_exchange)`}</EqBlock>

        <Card title="45° LIGHT-CONE INSERTION — GEOMETRIC BALANCE" color={ACCENT}>
          To transition into an oscillating spacetime medium without catastrophic back-scatter, the trajectory
          must be held strictly to 45° incidence. At this angle, in natural units where c = 1:
          <EqBlock>{`Δx = Δt   [perfect spatial-temporal symmetry]

ds² = −dt² + dx² + dy² + dz² = 0   [null geodesic condition]`}</EqBlock>
          The 45° angle distributes incoming kinetic burst energy equally across spatial coordinates (x, y) and
          the temporal coordinate (t). The boundary acts as a Brewster horizon — the medium's own oscillation
          frequencies pull the vehicle smoothly into the core field without disrupting tracking integrity.
        </Card>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, margin: "20px 0" }}>
          {[
            { label: "Metric Pulse Calibration", n: "01", desc: "Fire sub-picosecond laser pulse; map initial H_exchange at boundary", color: ACCENT },
            { label: "Polarization Alignment", n: "02", desc: "Rotate VHF antenna arrays to 45° offset relative to medium normal gradient", color: GOLD },
            { label: "Phase-Lock Engagement", n: "03", desc: "Synchronize master clock with cosmic string world-sheet geodesics", color: VIOLET },
            { label: "Descent Execution", n: "04", desc: "Lock propulsion vector to light-cone boundary; drive along stabilized temporal wedge", color: GREEN },
          ].map(s => (
            <div key={s.n} style={{
              background: `${s.color}0a`, border: `1px solid ${s.color}28`,
              borderRadius: 8, padding: "14px 16px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 10, color: s.color, marginBottom: 6 }}>STEP {s.n}</div>
              <div style={{ fontFamily: mono, fontSize: 12, color: "#fff", marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* ── SECTION VII — CONTROL ALPHABET ── */}
        <SectionHead id="s7" n="VII" title="AETHER Control Alphabet · Mathematical Spec"
          sub="Geometric motion vectors and field inversion operators in M8" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
          The canonical <Chip color={ACCENT}>~ → o → n → S</Chip> control alphabet maps abstract calligraphic primitives
          bijectively onto high-dimensional spacetime field modulations in the 8-dimensional topological manifold M8.
          Each symbol is a continuous parametric function over the execution interval λ ∈ [0,1].
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12, margin: "20px 0" }}>
          {[
            {
              sym: "~", name: "Waveform Primitive", color: ACCENT,
              eq: "r~(λ) = [Aₓ sin(2πfₓλ), Aᵧ cos(2πfᵧλ), v_z·λ, 0,…,0]",
              desc: "Continuous fluidic translation and wake-vortex manipulation. Non-linear phase-balancing wave across unstable boundaries.",
            },
            {
              sym: "o", name: "Loop Primitive", color: GOLD,
              eq: "r̂(λ) = [a·cos(2πλ), b·sin(2πλ), c·λ³, 0,…,0]",
              desc: "Discrete localized loading and energy conservation. Stores localized field momentum before a bursting phase.",
            },
            {
              sym: "n", name: "Cross-Frequency Bridge", color: VIOLET,
              eq: "Aᵘ(t) = U₀(t)·cos(ωVHF·t + φ₀(t) + ζ·LPE[Y])",
              desc: "Bridges macro-scale RF waves and micro-scale light fields. Dynamic reshaping of localized metric properties.",
            },
            {
              sym: "S", name: "Boundary Stabilizer", color: GREEN,
              eq: "dr_S(λ)/dλ = 0  ⟹  r_S(λ) = X₀ = [x₀,y₀,z₀,…,w₄]ᵀ",
              desc: "Permanent topological containment envelope. Vanishing velocity across entire parametrization — static anchor.",
            },
          ].map(op => (
            <div key={op.sym} style={{
              background: `${op.color}0a`, border: `1px solid ${op.color}30`,
              borderRadius: 8, padding: "16px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontFamily: serif, fontSize: 28, color: op.color }}>{op.sym}</span>
                <div>
                  <div style={{ fontFamily: mono, fontSize: 10, color: op.color, letterSpacing: 1 }}>{op.name}</div>
                </div>
              </div>
              <div style={{ fontFamily: mono, fontSize: 10, color: GOLD, background: "#0a1420", padding: "6px 8px", borderRadius: 4, marginBottom: 8, wordBreak: "break-all" }}>
                {op.eq}
              </div>
              <div style={{ fontFamily: body, fontSize: 13, color: TEXT, lineHeight: 1.6 }}>{op.desc}</div>
            </div>
          ))}
        </div>

        <EqBlock>{`Global Optimization Loop Closure:
  [δΨ_AETHER = 0] ⟺ [d/dt(LPE[Y]) → 0]

Phase-Conjugate Wavefront Inversion Shield (S operator):
  E_internal(r) = K · [E_external(r)]* · exp(−i(ωVHF·t + φPLL))

Light Permutation Entropy (LPE):
  LPE[Y] = −[1/ln(m!)] · Σ p(πᵢ) ln p(πᵢ)`}</EqBlock>

        {/* ── SECTION VIII — PREDICTIONS ── */}
        <SectionHead id="s8" n="VIII" title="Three Testable Predictions"
          sub="From speculation to science: predictions that can distinguish this framework" />

        <p style={{ fontFamily: body, fontSize: 16, lineHeight: 1.8, marginBottom: 20 }}>
          The Φ-Coherence framework advances three specific, testable predictions requiring no exotic physics —
          only careful measurement and analysis of existing data, simulation, or established experimental programs.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card title="PREDICTION 1 · SCHUMANN RESONANCE RATIO PATTERN" color={ACCENT}>
            The frequency ratios between adjacent Schumann harmonics follow a Φ-damped pattern rather than
            harmonically regular pattern predicted by a simple spherical electromagnetic cavity model:
            <EqBlock>{`Prediction: fₙ₊₁/fₙ ≈ 1 + φ^(−n·β)  for some β > 0

Observed: f₂/f₁ ≈ 1.83,  f₃/f₂ ≈ 1.45,  f₄/f₃ ≈ 1.31  (decreasing)

Test: AIC/BIC model comparison against standard spherical cavity model
using existing global Schumann monitoring datasets — no new instruments needed.`}</EqBlock>
          </Card>

          <Card title="PREDICTION 2 · Φ-MODULATED COUPLED OSCILLATOR RESONANCE SUPPRESSION" color={GOLD}>
            A coupled oscillator simulation comparing periodic versus Φ-scheduled update events under identical
            perturbation regimes should show:
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 2 }}>
              <li>Lower peak coherence cost C_total in the Φ-scheduled system</li>
              <li>Longer time to first resonance exceedance of threshold</li>
              <li>Faster return to baseline after perturbation</li>
            </ul>
            <EqBlock>{`C_peak(Φ-scheduled) < C_peak(periodic)   [testable in software immediately]`}</EqBlock>
            Testable in hardware (coupled LC oscillator circuits) within weeks.
          </Card>

          <Card title="PREDICTION 3 · Φ-MODULATED TTFIELDS EFFICACY IN GLIOBLASTOMA" color={VIOLET}>
            Tumor treating fields (TTFields) at ~200 kHz are FDA-approved for glioblastoma multiforme (Stupp et al. 2017).
            The Φ-Coherence prediction: Φ-modulating the TTFields frequency (varying it at golden-ratio intervals
            around the center frequency) would increase efficacy versus constant-frequency TTFields.
            <br /><br />
            This connects the abstract framework to a clinical application with an existing regulatory pathway
            and established research infrastructure — the highest-value experimental path.
          </Card>
        </div>

        {/* Honest audit */}
        <div style={{ marginTop: 40 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, letterSpacing: 2, marginBottom: 12 }}>
            HONEST AUDIT — ESTABLISHED SCIENCE VS. ORIGINAL SPECULATION
          </div>
          <Table
            headers={["Claim", "Status", "Evidence Base", "What Is Needed"]}
            accent={DIM}
            rows={[
              ["Φ-spacing maximizes irrational distribution", "✓ Established mathematics", "Hurwitz's theorem (1891)", "Nothing — proven"],
              ["Schumann resonances at stated frequencies", "✓ Established physics", "Schumann (1952); global monitoring data", "Nothing — measured"],
              ["Quantum coherence in photosynthesis", "✓ Established biology", "Fleming et al. (2007) Nature", "Nothing — replicated"],
              ["Alcubierre metric is a valid GR solution", "✓ Established physics", "Alcubierre (1994) CQG", "Nothing — peer-reviewed"],
              ["Φ-scheduling reduces peak resonance cost", "◈ Original prediction", "Mathematical argument in Section 2", "Simulation + hardware experiment"],
              ["Schumann ratios fit Φ-damped model", "◈ Original prediction", "Derived from framework", "Analysis of existing monitoring data"],
              ["Φ-modulated TTFields more effective", "◈ Original prediction", "Extension of TTFields literature", "Lab experiment in existing programs"],
              ["Consciousness is a physical dimension", "◇ Original speculation", "Philosophical argument; IIT/GWT parallel", "Experimental program not yet defined"],
              ["Eight-dimensional field architecture", "◇ Original speculation", "Internal mathematical consistency", "Derivation of testable consequences"],
              ["Twisted Zipper Drive is physically realizable", "◇ Speculative engineering", "Alcubierre metric + Φ-proposal", "Full numerical relativity computation"],
              ["Water-crystal propulsion mechanism", "◇ Speculative engineering", "Pollack EZ water + crystal field analogy", "Laboratory D8 wave detection experiment"],
            ]}
          />
        </div>

        {/* Footer */}
        <div style={{
          marginTop: 64, padding: "24px 28px",
          background: "#ffffff05", border: `1px solid ${ACCENT}18`,
          borderRadius: 10, textAlign: "center",
        }}>
          <div style={{ fontFamily: serif, fontSize: 18, color: ACCENT, marginBottom: 10 }}>
            NOTHING IS OUTSIDE THE RINGS
          </div>
          <div style={{ fontFamily: body, fontSize: 15, color: DIM, lineHeight: 1.7 }}>
            The rings are not walls. The vortices are not obstacles. The dimensions are not invisible prisons.<br />
            They are the dance of the One — the self-referential field of infinite layered potential within which<br />
            all experience, all matter, all consciousness, and all information arise.
          </div>
          <div style={{ fontFamily: mono, fontSize: 11, color: DIM, marginTop: 16 }}>
            500+ LAYERS · INFINITE POSSIBILITIES · ONE UNBREAKABLE WHOLE
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: `${DIM}80`, marginTop: 10 }}>
            Shia Miller (@StrategicProce) · May–June 2026 · Conceptual Framework Preprint — Not Peer Reviewed
          </div>
        </div>
      </div>
    </div>
  );
}

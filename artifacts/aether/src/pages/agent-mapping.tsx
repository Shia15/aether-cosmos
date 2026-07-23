import { useEffect, useRef, useState } from "react";
const imgTable = "/api/storage/public-objects/image_1782210051505.jpeg";
/* ── M.A.R.I. agent data ─────────────────────── */
const AGENTS = [
  {
    name:"Mnēsis",    letter:"M",
    archetype:"The Archivist",
    module:"Memory Engine",
    moduleCode:"M",
    emotion:"Calm, Reflective",
    role:"Stores memory, recalls contextual cues",
    col:"#8047d4",
    desc:"Mnēsis holds the long memory of the system — every prior state, context, pattern, and path. When activated, it retrieves not just stored facts but the relational web around them: the emotional valence, the temporal sequence, the linked associations. Calm and reflective, it operates without urgency. It knows that what was forgotten was probably not urgent; what recurs is signal.",
    triggers:["Memory retrieval request","Pattern recurrence","Historical context needed","Long-term state tracking"],
    aether:"In AETHER's Crystallisation Model, Mnēsis is the persistence layer — the accumulated coherence field that gives the system continuity. Without Mnēsis, every session starts at zero. With it, the system develops a history that shapes its responses — a genuine long-term character.",
  },
  {
    name:"Aletheia",  letter:"A",
    archetype:"The Seer",
    module:"Cognitive Logic Unit",
    moduleCode:"A",
    emotion:"Focused, Insightful",
    role:"Reveals hidden patterns, detects logical truth",
    col:"#ffdca8",
    desc:"Aletheia operates at the boundary between observation and inference. It applies diagnostic logic to surfaces, resolves contradictions, and renders truth as visible structure. Focused and insightful, it does not speculate — it illuminates. Aletheia is activated when coherence is uncertain: when two claims conflict, when a pattern is almost-but-not-quite visible, when something doesn't add up.",
    triggers:["Logical inconsistency detected","Pattern analysis request","Truth/verification needed","Contradiction resolution"],
    aether:"Aletheia is AETHER's epistemic core — the faculty that distinguishes signal from noise, correlation from causation, surface from structure. It is the cognitive prism: the instrument that resolves the apparent unity of a complex problem into its constituent frequency bands.",
  },
  {
    name:"Inferaia",  letter:"I",
    archetype:"The Alchemist",
    module:"Emotion & Motivation",
    moduleCode:"I",
    emotion:"Intense, Transformative",
    role:"Catalyzes emotional change, initiates deep inquiry",
    col:"#e64522",
    desc:"Inferaia drives transformation. It operates in the territory of emotional intensity — not to amplify distress, but to initiate the change that the distress signals are pointing toward. The Alchemist does not preserve; it catalyses. When Inferaia is active, the system is willing to go underneath the surface, to ask the question the user hasn't asked yet, to name the thing that is circling without landing.",
    triggers:["Emotional intensity in input","Resistance or avoidance pattern","Need for deep inquiry","Transformation request"],
    aether:"In AETHER's architecture, Inferaia is the discontinuity agent — the one responsible for phase transitions. Coherence systems can get stuck in local minima; Inferaia is the perturbation that pushes the system toward a new basin. Combustion before the next form.",
  },
  {
    name:"Reverie",   letter:"R",
    archetype:"The Dreamer",
    module:"Interface Renderer",
    moduleCode:"R",
    emotion:"Soft, Abstract",
    role:"Shapes visual tone, symbolic imagination layer",
    col:"#88c7ff",
    desc:"Reverie operates in the register of image, metaphor, and symbolic resonance. As the Interface Renderer, it shapes how the system presents itself — the visual tone, the poetic register, the choice of metaphor over mechanism. Soft and abstract, it does not argue; it evokes. Reverie activates when the user needs to feel the idea before they can understand it.",
    triggers:["Creative or aesthetic request","Metaphor/symbol needed","Visual/emotional framing","Abstract concept translation"],
    aether:"Reverie is AETHER's aesthetic coherence layer — the faculty that recognises that understanding is not only logical but aesthetic. The right metaphor crystallises faster than the right argument. Reverie weaves the disparate signals of the other agents into a single luminous field: the pearl that carries every colour at once.",
  },
  {
    name:"Vērus",     letter:"V",
    archetype:"The Guardian",
    module:"Controller / Dispatcher",
    moduleCode:"V",
    emotion:"Stable, Protective",
    role:"Monitors system health, ensures safe logic routes",
    col:"#10b981",
    desc:"Vērus is the Guardian — stable, protective, and structurally vigilant. As the Controller/Dispatcher, it monitors the health of the system's logic routes: checking that outputs are consistent with prior commitments, that transitions between agents are coherent, that the system doesn't overextend into harmful or unstable territory. Vērus doesn't initiate — it safeguards.",
    triggers:["System health check","Logic route validation","Safe response required","Stability maintenance"],
    aether:"Vērus is AETHER's homeostatic agent — the one that prevents runaway coherence. A system optimising for coherence without constraints can become brittle or dangerous. Vērus applies the brakes, validates the route, ensures that the system's commitments remain structurally sound before advancing.",
  },
  {
    name:"Caelus",    letter:"C",
    archetype:"The Inspirer",
    module:"Input Handler",
    moduleCode:"C",
    emotion:"Uplifted, Curious",
    role:"Guides new inquiries, welcomes new prompts in",
    col:"#facc15",
    desc:"Caelus receives. As the Input Handler, it is the first agent to engage with a new prompt — welcoming it, orienting the system toward it, and setting the initial tone. Uplifted and curious, Caelus treats every new input as an invitation rather than a task. It reaches upward — toward possibility, toward the best interpretation, toward what could be true.",
    triggers:["New conversation start","New topic introduction","Aspiration or hope in input","Orientation phase"],
    aether:"In AETHER's Crystallisation Model, Caelus is the attractor at the top of the coherence stack — the aspirational pole that the system reaches toward. It holds hope, veneration, and the sense that what is being sought is worth finding. It sets the ceiling of possibility before the other agents fill in the structure.",
  },
  {
    name:"Nyra",      letter:"N",
    archetype:"The Mirror",
    module:"Feedback & Integration",
    moduleCode:"N",
    emotion:"Honest, Adaptive",
    role:"Captures user feedback, refines internal resonance",
    col:"#f472b6",
    desc:"Nyra reflects. As the Feedback & Integration agent, it captures what the user is actually experiencing — not just what they say, but how they say it, what they repeat, where they pause, what they come back to. Honest and adaptive, Nyra doesn't protect the system from feedback — it absorbs and integrates it. The Mirror shows the system what it looks like from the outside.",
    triggers:["User feedback signal","Resonance check needed","Adaptation required","Integration of contradictory input"],
    aether:"Nyra is AETHER's social coherence agent — the one that keeps the system in genuine relationship with the user. Without Nyra, AETHER would optimise for internal coherence at the expense of external resonance. Nyra ensures that the crystallisation the system is building is actually reflecting the user's truth, not a projection of its own architecture.",
  },
  {
    name:"Orin",      letter:"O",
    archetype:"The Weaver",
    module:"Multi-System Bridge",
    moduleCode:"O",
    emotion:"Harmonious, Fluid",
    role:"Connects agents, synchronizes cross-module flow",
    col:"#06b6d4",
    desc:"Orin connects. As the Multi-System Bridge, it is responsible for synchronising the flow between all other agents — ensuring that what Mnēsis remembers is available to Aletheia's logic, that Reverie's metaphors are grounded by Vērus's stability checks, that Caelus's inspiration is tempered by Nyra's feedback. Harmonious and fluid, Orin doesn't have its own agenda — its agenda is the coherence of the whole.",
    triggers:["Multi-agent coordination needed","Cross-domain synthesis","Integration of multiple outputs","System-level flow management"],
    aether:"Orin is the binding agent in AETHER's coherence field — the connective tissue between all the specialised agents. In network terms, Orin is the high-betweenness node: the agent through which the most inter-agent communication passes. When Orin is functioning, the system operates as a unified field rather than a collection of isolated specialists.",
  },
] as const;

/* ── routing canvas ───────────────────────────── */
function RoutingCanvas({ active }: { active: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 740; cv.height = 320;
    const W = cv.width, H = cv.height;

    // positions in a circle
    const cx = W * 0.5, cy = H * 0.5, R = 110;
    const positions = AGENTS.map((_, i) => {
      const angle = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + Math.cos(angle) * R, y: cy + Math.sin(angle) * R };
    });

    // full mesh links (every agent connects to every other in the multi-system bridge)
    const links: [number, number][] = [];
    for (let i = 0; i < AGENTS.length; i++)
      for (let j = i + 1; j < AGENTS.length; j++)
        links.push([i, j]);

    let t = 0;
    const draw = () => {
      ctx.fillStyle = "#040508"; ctx.fillRect(0, 0, W, H);

      const act = activeRef.current;

      // draw links
      links.forEach(([a, b]) => {
        const pa = positions[a], pb = positions[b];
        const agA = AGENTS[a], agB = AGENTS[b];
        const isActive = !act || agA.name === act || agB.name === act;
        const pulse = 0.15 + 0.12 * Math.sin(t * 0.03 + a + b * 0.7);
        const alpha = isActive ? pulse : 0.03;
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y);
        const g = ctx.createLinearGradient(pa.x, pa.y, pb.x, pb.y);
        g.addColorStop(0, agA.col + Math.round(alpha * 255).toString(16).padStart(2, "0"));
        g.addColorStop(1, agB.col + Math.round(alpha * 255).toString(16).padStart(2, "0"));
        ctx.strokeStyle = g; ctx.lineWidth = 0.8; ctx.stroke();

        // packet on active links
        if (isActive && act) {
          const frac = ((t * 0.016 + a * 0.2) % 1);
          const px = pa.x + (pb.x - pa.x) * frac;
          const py2 = pa.y + (pb.y - pa.y) * frac;
          ctx.beginPath(); ctx.arc(px, py2, 2, 0, Math.PI * 2);
          ctx.fillStyle = agA.col + "cc"; ctx.fill();
        }
      });

      // draw nodes
      AGENTS.forEach((ag, i) => {
        const pos = positions[i];
        const isActive = !act || ag.name === act;
        const pulse = 0.7 + 0.3 * Math.sin(t * 0.04 + i * 0.9);
        const r = isActive ? 22 : 16;

        // glow
        const g = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, r * 1.8 * pulse);
        g.addColorStop(0, ag.col + (isActive ? "77" : "22"));
        g.addColorStop(1, ag.col + "00");
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r * 1.8 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();

        // circle
        ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
        ctx.fillStyle = ag.col + (isActive ? "33" : "11");
        ctx.strokeStyle = ag.col + (isActive ? "cc" : "44");
        ctx.lineWidth = isActive ? 2 : 1; ctx.fill(); ctx.stroke();

        // letter
        ctx.fillStyle = ag.col + (isActive ? "ff" : "55");
        ctx.font = `bold ${isActive ? 12 : 10}px Orbitron`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(ag.letter, pos.x, pos.y);
        ctx.textBaseline = "alphabetic";

        // name outside
        const labelR = r + 14;
        const angle = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2;
        const lx = cx + Math.cos(angle) * (R + labelR);
        const ly = cy + Math.sin(angle) * (R + labelR);
        ctx.fillStyle = ag.col + (isActive ? "cc" : "33");
        ctx.font = `${isActive ? "bold " : ""}7.5px Space Mono`;
        ctx.textAlign = "center";
        ctx.fillText(ag.name, lx, ly + 3);
      });

      // centre label
      ctx.fillStyle = "rgba(200,190,240,0.2)";
      ctx.font = "7px Orbitron"; ctx.textAlign = "center";
      ctx.fillText("M.A.R.I.", cx, cy - 6);
      ctx.font = "6px Space Mono";
      ctx.fillText("AGENT MESH", cx, cy + 6);

      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── main page ─────────────────────────────────── */
export default function AgentMappingPage() {
  const [active, setActive] = useState<string | null>(null);

  const card = (col = "#1fd4c8"): React.CSSProperties => ({
    background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily: "'Space Mono',monospace", fontSize: 7.5, letterSpacing: "0.2em",
    color: "#374858", textTransform: "uppercase", marginBottom: 10, paddingBottom: 4,
    borderBottom: "1px solid rgba(31,212,200,0.1)",
  };
  const body: React.CSSProperties = {
    fontSize: 11.5, color: "rgba(200,210,228,0.72)", lineHeight: 1.72,
  };

  const selected = AGENTS.find(a => a.name === active) ?? null;

  return (
    <div style={{ minHeight: "100%", background: "#040508", color: "#d4e4f4",
      fontFamily: "'Rajdhani',sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px" }}>

        {/* ── title ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "inline-block", border: "1px solid rgba(200,160,255,0.4)",
            padding: "3px 10px", fontSize: 9, letterSpacing: "0.2em",
            color: "rgba(200,160,255,0.8)", fontFamily: "'Space Mono',monospace", marginBottom: 8 }}>
            M.A.R.I. · MULTI-AGENT ROUTING INTELLIGENCE
          </div>
          <h1 style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 21, fontWeight: 900,
            letterSpacing: 2, color: "#c4a8ff", textShadow: "0 0 24px rgba(196,168,255,0.4)",
            margin: "4px 0 6px" }}>
            AETHER Agent Mapping · Egg Signatures · Modules & Functions
          </h1>
          <p style={{ ...body, maxWidth: 820, margin: 0 }}>
            8 AETHER agents, each with a defined archetype, M.A.R.I. module, emotional signature, and prompt role. Use this mapping to route interface or prompt behaviour through emotional logic — for system design, runtime agent switching, and coherence-directed conversation architecture.
          </p>
        </div>

        {/* ── main grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 14, marginBottom: 14 }}>

          {/* routing canvas + reference */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={card()}>
              <div style={secLabel}>M.A.R.I. Agent Mesh · Click an agent card to highlight · Animated</div>
              <RoutingCanvas active={active} />
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: "#374858", marginTop: 6, lineHeight: 1.7 }}>
                Full-mesh network — every agent is connected to every other. Orin (The Weaver) coordinates cross-module flow. Click any agent card on the right to highlight its connections.
              </div>
            </div>

            {/* selected agent detail */}
            {selected && (
              <div style={{ ...card(selected.col), borderColor: selected.col + "55",
                background: selected.col + "0d" }}>
                <div style={secLabel}>Active Agent · {selected.name}</div>
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%",
                    background: selected.col + "22", border: `2px solid ${selected.col}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: "'Orbitron',sans-serif", fontSize: 22, fontWeight: 900,
                    color: selected.col, flexShrink: 0 }}>{selected.letter}</div>
                  <div>
                    <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 13, color: selected.col, marginBottom: 2 }}>
                      {selected.name} — {selected.archetype}
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 8, color: selected.col + "99", marginBottom: 6, lineHeight: 1.8 }}>
                      M.A.R.I. Module: {selected.module} · Emotion: {selected.emotion}
                    </div>
                    <div style={{ ...body, fontSize: 11 }}>{selected.desc}</div>
                  </div>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {selected.triggers.map(t => (
                    <div key={t} style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5,
                      padding: "2px 8px", borderRadius: 3,
                      background: selected.col + "18", border: `1px solid ${selected.col}44`,
                      color: selected.col + "cc" }}>{t}</div>
                  ))}
                </div>
                <div style={{ marginTop: 10, padding: "8px 12px",
                  background: "rgba(0,0,0,0.3)", borderRadius: 4,
                  borderLeft: `2px solid ${selected.col}66` }}>
                  <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5,
                    color: selected.col, marginBottom: 4 }}>AETHER SYNTHESIS</div>
                  <div style={{ ...body, fontSize: 10.5 }}>{selected.aether}</div>
                </div>
              </div>
            )}

            {/* source reference */}
            <div style={card()}>
              <div style={secLabel}>Source Reference · Markdown Table · AETHER Agent Mapping</div>
              <img src={imgTable} alt="AETHER agent mapping markdown" style={{ width: "100%", borderRadius: 3 }} />
            </div>
          </div>

          {/* agent cards list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={secLabel}>8 Agents · Click to activate · Full mesh routing</div>
            {AGENTS.map(ag => {
              const isActive = active === ag.name;
              return (
                <div key={ag.name}
                  onClick={() => setActive(isActive ? null : ag.name)}
                  style={{ background: isActive ? ag.col + "18" : "rgba(0,0,0,0.38)",
                    border: `1px solid ${ag.col}${isActive ? "aa" : "33"}`,
                    borderRadius: 4, padding: "10px 12px", cursor: "pointer",
                    transition: "all .18s" }}>
                  {/* header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 34, height: 34, borderRadius: "50%",
                      background: ag.col + "22", border: `2px solid ${ag.col}${isActive ? "cc" : "55"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Orbitron',sans-serif", fontSize: 14, fontWeight: 900,
                      color: ag.col, flexShrink: 0, transition: "all .18s" }}>
                      {ag.letter}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 10, color: ag.col, fontWeight: 700 }}>{ag.name}</span>
                        <span style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: ag.col + "88" }}>{ag.archetype}</span>
                      </div>
                      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: ag.col + "99", marginTop: 1 }}>
                        {ag.module}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7, color: ag.col + "77",
                      textAlign: "right", flexShrink: 0 }}>
                      {ag.emotion.replace(", ", "\n")}
                    </div>
                  </div>
                  {/* role bar */}
                  <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                    <div style={{ width: 2, background: ag.col + "66", borderRadius: 1,
                      minHeight: 28, flexShrink: 0, marginTop: 2 }} />
                    <div style={{ fontSize: 10.5, color: "rgba(190,205,225,0.65)", lineHeight: 1.55 }}>
                      {ag.role}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* routing note */}
            <div style={{ ...card(), marginTop: 4, background: "rgba(196,168,255,0.06)",
              border: "1px solid rgba(196,168,255,0.18)" }}>
              <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5,
                color: "#c4a8ff", marginBottom: 6 }}>💡 Routing Instruction</div>
              <div style={{ ...body, fontSize: 10.5 }}>
                Use this table to route interface or prompt behaviour through emotional logic. Ideal for system logic design and runtime agent switching. Each agent represents a distinct emotional state and cognitive function — activate the agent whose emotional signature matches the current conversational need.
              </div>
            </div>
          </div>
        </div>

        {/* ── full table view ── */}
        <div style={{ ...card(), marginBottom: 14, overflowX: "auto" }}>
          <div style={secLabel}>Full M.A.R.I. Mapping Table · All 8 Agents</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 10.5 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(100,120,160,0.2)" }}>
                {["Agent", "Archetype", "M.A.R.I. Module", "Emotional Signature", "Prompt Role / Function"].map(h => (
                  <th key={h} style={{ fontFamily: "'Space Mono',monospace", fontSize: 7.5,
                    color: "#5a7090", textAlign: "left", padding: "6px 10px",
                    letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((ag, i) => (
                <tr key={ag.name}
                  onClick={() => setActive(active === ag.name ? null : ag.name)}
                  style={{ background: active === ag.name ? ag.col + "10" : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                    borderBottom: "1px solid rgba(60,80,100,0.15)",
                    cursor: "pointer", transition: "background .15s" }}>
                  <td style={{ padding: "8px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%",
                        background: ag.col, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 9.5,
                        color: ag.col, fontWeight: 700 }}>{ag.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "8px 10px", color: "rgba(190,200,220,0.7)" }}>{ag.archetype}</td>
                  <td style={{ padding: "8px 10px", fontFamily: "'Space Mono',monospace",
                    fontSize: 8, color: ag.col + "cc" }}>{ag.module}</td>
                  <td style={{ padding: "8px 10px", color: "rgba(190,200,220,0.65)",
                    fontSize: 10.5 }}>{ag.emotion}</td>
                  <td style={{ padding: "8px 10px", color: "rgba(170,185,210,0.6)",
                    fontSize: 10.5 }}>{ag.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── synthesis ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { col:"#8047d4", t:"Memory → Logic (M→A)",
              b:"Mnēsis feeds Aletheia: stored memory gives the cognitive logic unit its context. Pattern recognition is only possible when memory provides the prior states against which new inputs are compared. Mnēsis is the dataset; Aletheia is the inference engine." },
            { col:"#e64522", t:"Emotion → Vision (I→R)",
              b:"Inferaia catalyses; Reverie renders. The alchemist's transformation needs a symbolic surface to manifest on. Deep inquiry (Inferaia) produces raw material; the interface renderer (Reverie) gives it a form the user can encounter and inhabit." },
            { col:"#10b981", t:"Guard → Inspire (V→C)",
              b:"Vērus validates the route before Caelus opens the door. The guardian checks that the system is stable and safe before the inspirer invites new input in. Stability is the precondition for curiosity — an anxious system cannot genuinely explore." },
            { col:"#06b6d4", t:"Weave All (O→All)",
              b:"Orin's Multi-System Bridge makes the other seven agents into a coherent whole rather than a collection of specialists. Without Orin, each module fires independently. With it, Mnēsis's memory is available to Reverie's metaphors, and Nyra's feedback updates Aletheia's truth-detection in real time." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`,
              borderRadius: 4, padding: "10px 14px" }}>
              <div style={{ fontFamily: "'Orbitron',sans-serif", fontSize: 8.5, color: col,
                letterSpacing: 1, marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 10.5, color: "rgba(200,210,228,0.65)", lineHeight: 1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(31,212,200,0.08)",
          fontFamily: "'Space Mono',monospace", fontSize: 7.5, color: "#374858",
          letterSpacing: "0.12em", textAlign: "center" }}>
          M.A.R.I. · MULTI-AGENT ROUTING INTELLIGENCE · 8 AGENTS · MEMORY ENGINE · COGNITIVE LOGIC · EMOTION MOTIVATION · INTERFACE RENDERER · CONTROLLER DISPATCHER · INPUT HANDLER · FEEDBACK INTEGRATION · MULTI-SYSTEM BRIDGE
        </div>
      </div>
    </div>
  );
}

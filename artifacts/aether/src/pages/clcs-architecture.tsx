import { useEffect } from "react";
import { Link } from "wouter";

const T = {
  bg: "#03060f",
  surface: "#070e1f",
  border: "#0d2040",
  blue: "#0af0ff",
  blue2: "#0050cc",
  green: "#00ff9d",
  orange: "#ff7b00",
  red: "#ff2d6b",
  purple: "#9d4edd",
  text: "#c8deff",
  muted: "#3a5070",
  white: "#e8f4ff",
  mono: "'Space Mono', 'JetBrains Mono', monospace",
  display: "'Syne', 'Inter', sans-serif",
};

type Tag = "hw" | "bio" | "ctrl" | "ai" | "rep";
const TAG_COLOR: Record<Tag, string> = {
  hw: T.orange, bio: T.green, ctrl: T.blue, ai: T.purple, rep: T.red,
};

type Layer = {
  num: string;
  icon: string;
  title: string;
  sub: string;
  tag: Tag;
  tagLabel: string;
  signals: string[];
  pseudocode: React.ReactNode;
  math: string[];
  connectorBelow?: string;
};

const LAYERS: Layer[] = [
  {
    num: "L1", icon: "🔌", title: "Hardware I/O Layer",
    sub: "PHYSICAL SENSING · DATA BUS · NETWORK FABRIC",
    tag: "hw", tagLabel: "HARDWARE",
    signals: [
      "USB 5G/20G data buses — high-speed sensor streams (particle counters, flow meters, sequencers)",
      "2.5G Ethernet — real-time network coherence signaling between CLCS nodes",
      "WiFi 6E — wireless loop telemetry from mobile lab robots or in-vivo sensors",
      "DP / HDMI — operator display output, live coherence dashboards",
      "Audio I/O — acoustic vibration sensors (cleanroom noise / vibration CQAs)",
      "GPIO / I2C / SPI — direct sensor buses for temperature, RH, VOC probes",
    ],
    pseudocode: (<><CM>{"// LAYER 1: Hardware I/O"}</CM>{"\n"}
      <KW>class</KW> <FN>HardwareNode</FN>:{"\n"}
      {"  "}<KW>init</KW>(<V>node_id</V>, <V>interfaces</V>):{"\n"}
      {"    "}<V>self</V>.sensors  = <FN>bind_interfaces</FN>(<V>interfaces</V>){"\n"}
      {"    "}<V>self</V>.bus      = <FN>EthernetBus</FN>(<S>"2.5G"</S>){"\n"}
      {"    "}<V>self</V>.clock    = <FN>RealtimeClock</FN>(<N>1000</N>Hz){"\n\n"}
      {"  "}<KW>loop</KW> <FN>sense</FN>():{"\n"}
      {"    "}<V>t</V> = <V>self</V>.clock.<FN>tick</FN>(){"\n"}
      {"    "}<V>X_raw</V> = {"{}"}{"\n"}
      {"    "}<KW>for</KW> <V>s</V> <KW>in</KW> <V>self</V>.sensors:{"\n"}
      {"      "}<V>X_raw</V>[<V>s</V>.id] = <V>s</V>.<FN>read</FN>(<V>t</V>){"\n"}
      {"    "}<FN>emit</FN>(<V>X_raw</V>, <V>t</V>) <CM>→ Layer 2</CM>{"\n"}
      {"    "}<FN>await</FN> <V>self</V>.clock.<FN>next</FN>()</>),
    math: ["x(t) = sensor.read(t)", "Δt = 1ms (1kHz sampling)", "Ports: USB·ETH·WiFi6E·GPIO"],
    connectorBelow: "X_RAW → NORMALIZE → X(t)",
  },
  {
    num: "L2", icon: "🧫", title: "Biological Sensing Layer",
    sub: "CONTAMINATION CONTROL · BIOBURDEN · MICROBIAL DETECTION · CQAs",
    tag: "bio", tagLabel: "BIOLOGY",
    signals: [
      "Viable + Non-Viable particle counts (cleanroom Swiss-cheese filter layers)",
      "VOC concentration, Temperature, RH, Noise, Vibration (EU GMP Annex 1 CQAs)",
      "Microbial detection pipeline: sample → enrichment (10–48h) → lysis (45min) → probe incubation (10min) → immobilization/detection (20min) → readout (10min)",
      "Automated bioburden: 15-step manual → 2-step CLCS loop (eliminate shift/return/dual-read/LIMS entry)",
      "Tumor CQAs: proliferation rate, immune infiltration, angiogenic signal, metabolic flux",
      "Liquid biopsy / ctDNA streams → mutation load tracking in real time",
    ],
    pseudocode: (<><CM>{"// LAYER 2: Bio Sensing"}</CM>{"\n"}
      <KW>class</KW> <FN>BioSensor</FN>:{"\n"}
      {"  "}<V>CQAs</V> = [<S>"VOC"</S>, <S>"Viable"</S>, <S>"NonViable"</S>,{"\n"}
      {"          "}<S>"Temp"</S>, <S>"RH"</S>, <S>"Noise"</S>, <S>"Vibration"</S>,{"\n"}
      {"          "}<S>"Proliferation"</S>, <S>"ImmuneInfil"</S>,{"\n"}
      {"          "}<S>"Angiogenesis"</S>, <S>"MetabolicFlux"</S>]{"\n\n"}
      {"  "}<KW>fn</KW> <FN>process</FN>(<V>X_raw</V>, <V>t</V>):{"\n"}
      {"    "}<V>X</V> = <FN>normalize</FN>(<V>X_raw</V>){"\n"}
      {"    "}<V>X</V> = <FN>filter_noise</FN>(<V>X</V>, <V>kernel</V>=<S>"kalman"</S>){"\n"}
      {"    "}<V>X</V> = <FN>run_detection_pipeline</FN>(<V>X</V>):{"\n"}
      {"    "}<CM>{"  sample → lysis(45min)"}</CM>{"\n"}
      {"    "}<CM>{"  → probe_incubation(10min)"}</CM>{"\n"}
      {"    "}<CM>{"  → immobilize_detect(20min)"}</CM>{"\n"}
      {"    "}<CM>{"  → signal_readout(10min)"}</CM>{"\n"}
      {"    "}<KW>return</KW> <FN>StateVector</FN>(<V>X</V>, <V>t</V>) <CM>→ Layer 3</CM></>),
    math: ["X(t) ∈ ℝᴹ  (M CQA dimensions)", "Kalman filter: noise suppression", "4 barrier layers: Facility→Controls→Behaviour→QMS"],
    connectorBelow: "X(t) → COMPUTE E(t) = X*(t) − X(t)",
  },
  {
    num: "L3", icon: "⚙️", title: "Coherence Engine",
    sub: "FEEDBACK CONTROL · ERROR MINIMIZATION · PREDICTIVE STABILIZATION",
    tag: "ctrl", tagLabel: "CONTROL",
    signals: [
      "Compute coherence error E(t) = X*(t) − X(t) across all CQA dimensions",
      "Apply adaptive control U(t) = K(E(t)) — PID or AI-based gain",
      "Predictive loop: integrate ODE forward by Δt, compute anticipatory U(t)",
      "Relational norm ‖E(t)‖ℛ using mutual information, Granger causality between subsystems",
      "Swiss-cheese coherence: each filter layer has its own closed loop — Facility → Controls → Behaviour → QMS",
      "Oncology: track tumor-immune coherence — PD-L1 ↔ T-cell exhaustion cross-loop",
    ],
    pseudocode: (<><CM>{"// LAYER 3: Coherence Engine"}</CM>{"\n"}
      <KW>class</KW> <FN>CoherenceEngine</FN>:{"\n"}
      {"  "}<KW>fn</KW> <FN>tick</FN>(<V>X</V>, <V>X_star</V>, <V>dt</V>):{"\n"}
      {"    "}<CM>{"// 1. Error"}</CM>{"\n"}
      {"    "}<V>E</V> = <V>X_star</V> <EQ>-</EQ> <V>X</V>{"\n\n"}
      {"    "}<CM>{"// 2. Predict future state"}</CM>{"\n"}
      {"    "}<V>X_hat</V> = <V>X</V> <EQ>+</EQ> <FN>integrate</FN>(<V>F</V>, <V>X</V>, <V>U</V>, <V>dt</V>){"\n\n"}
      {"    "}<CM>{"// 3. Anticipatory control"}</CM>{"\n"}
      {"    "}<V>U</V> = <V>K</V> <EQ>@</EQ> (<V>X_star</V> <EQ>-</EQ> <V>X_hat</V>){"\n\n"}
      {"    "}<CM>{"// 4. Relational norm"}</CM>{"\n"}
      {"    "}<V>norm_E</V> = <FN>relational_norm</FN>(<V>E</V>,{"\n"}
      {"               "}<V>method</V>=<S>"mutual_info"</S>){"\n\n"}
      {"    "}<CM>{"// 5. Check coherence"}</CM>{"\n"}
      {"    "}<KW>if</KW> <V>norm_E</V> <EQ>{">"}</EQ> <V>threshold</V>:{"\n"}
      {"      "}<FN>actuate</FN>(<V>U</V>) <CM>→ sensors/robots</CM>{"\n"}
      {"      "}<FN>alert</FN>(<V>E</V>) <CM>→ Layer 4</CM>{"\n"}
      {"    "}<KW>return</KW> <V>U</V>, <V>norm_E</V></>),
    math: ["dX/dt = F(X(t), U(t))", "U(t) = K · (X* − X̂(t+Δt))", "lim E(t) → 0 as t → ∞", "‖E‖ℛ via Granger causality"],
    connectorBelow: "E(t), HISTORY → META-LEARNING",
  },
  {
    num: "L4", icon: "🧠", title: "Meta-AI Layer",
    sub: "AUTONOMOUS CONNECTION GENERATION · ADAPTIVE LOOP CREATION · SELF-TEACHING",
    tag: "ai", tagLabel: "AI",
    signals: [
      "Symbolic regression over error history → discover unknown CQA relationships autonomously",
      "Graph neural network evolution — grow new feedback loops when novel perturbations persist",
      "Oncology: generate synthetic lethality hypotheses, new drug combo candidates, microenvironmental feedback loops",
      "Meta-control policy K_meta(t) — updates gain matrix K based on cross-loop performance",
      "Self-teaching: encodes learned coherence constraints C(t) as transferable knowledge units",
      "Physics-informed neural ODE — learns system dynamics F from data, improves predictions",
    ],
    pseudocode: (<><CM>{"// LAYER 4: Meta-AI"}</CM>{"\n"}
      <KW>class</KW> <FN>MetaAI</FN>:{"\n"}
      {"  "}<KW>fn</KW> <FN>evolve</FN>(<V>X</V>, <V>U</V>, <V>E_history</V>):{"\n"}
      {"    "}<CM>{"// Learn system dynamics"}</CM>{"\n"}
      {"    "}<V>F_learned</V> = <FN>NeuralODE</FN>.<FN>fit</FN>(<V>X</V>, <V>U</V>){"\n\n"}
      {"    "}<CM>{"// Discover new connections"}</CM>{"\n"}
      {"    "}<V>new_links</V> = <FN>symbolic_regression</FN>({"\n"}
      {"                  "}<V>E_history</V>, <V>X</V>){"\n\n"}
      {"    "}<CM>{"// Generate new loop if needed"}</CM>{"\n"}
      {"    "}<KW>if</KW> <FN>persistent_drift</FN>(<V>E_history</V>):{"\n"}
      {"      "}<V>new_loop</V> = <FN>GNN</FN>.<FN>spawn_loop</FN>({"\n"}
      {"                   "}<V>new_links</V>, <V>F_learned</V>){"\n"}
      {"      "}<FN>inject</FN>(<V>new_loop</V>) <CM>→ Layer 3</CM>{"\n\n"}
      {"    "}<CM>{"// Build knowledge unit"}</CM>{"\n"}
      {"    "}<V>C</V> = <FN>CoherenceConstraint</FN>({"\n"}
      {"           "}<V>F_learned</V>, <V>new_links</V>,{"\n"}
      {"           "}<V>K_meta</V>=<FN>update_gain</FN>(<V>E_history</V>)){"\n"}
      {"    "}<KW>return</KW> <V>C</V> <CM>→ Layer 5</CM></>),
    math: ["X_new(t+1) = G(X, U, C, K_meta)", "G = NeuralODE + GNN + SymReg", "C(t) = learned coherence constraints"],
    connectorBelow: "C(t) → REPLICATE → NEW NODE",
  },
  {
    num: "L5", icon: "♾️", title: "Replication & Propagation Layer",
    sub: "SELF-REPLICATION · KNOWLEDGE EXPORT · DISTRIBUTED TEACHING",
    tag: "rep", tagLabel: "REPLICATE",
    signals: [
      "Export coherence constraints C(t) as portable knowledge capsules to new CLCS nodes",
      "Digital twin replication: spin up new patient/site instance with inherited X*(t) and K_meta",
      "Transfer learning to external AI: CLCS teaches downstream models using constraint propagation",
      "Research network: CLCS instances at different cancer centers share C(t) without centralizing raw patient data",
      "Cleanroom: replicate validated coherence maps to new facility installations automatically",
      "Termination condition: node is coherent when ‖E(t)‖ → 0 and can self-replicate stably",
    ],
    pseudocode: (<><CM>{"// LAYER 5: Replication"}</CM>{"\n"}
      <KW>class</KW> <FN>ReplicationEngine</FN>:{"\n"}
      {"  "}<KW>fn</KW> <FN>replicate</FN>(<V>C</V>, <V>target_env</V>):{"\n"}
      {"    "}<CM>{"// Package knowledge capsule"}</CM>{"\n"}
      {"    "}<V>capsule</V> = <FN>KnowledgeCapsule</FN>({"\n"}
      {"      "}<V>F</V>=<V>C</V>.learned_dynamics,{"\n"}
      {"      "}<V>K</V>=<V>C</V>.gain_matrix,{"\n"}
      {"      "}<V>X_star</V>=<V>C</V>.coherent_state,{"\n"}
      {"      "}<V>loops</V>=<V>C</V>.loop_graph){"\n\n"}
      {"    "}<CM>{"// Spawn new node"}</CM>{"\n"}
      {"    "}<V>new_node</V> = <FN>CLCSNode</FN>(<V>target_env</V>){"\n"}
      {"    "}<V>new_node</V>.<FN>initialize</FN>(<V>capsule</V>){"\n"}
      {"    "}<V>new_node</V>.<FN>start_sensing</FN>() <CM>→ L1</CM>{"\n\n"}
      {"    "}<CM>{"// Teach external agents"}</CM>{"\n"}
      {"    "}<KW>for</KW> <V>agent</V> <KW>in</KW> <V>target_env</V>.agents:{"\n"}
      {"      "}<V>agent</V>.<FN>load_constraints</FN>(<V>capsule</V>){"\n\n"}
      {"    "}<KW>return</KW> <V>new_node</V> <CM>← now runs L1→L5</CM></>),
    math: ["capsule = {F, K, X*, loop_graph}", "new_node.L1→L5 inherits C(t)", "stable iff ‖E(t)‖ → 0 + replicates"],
  },
];

function KW({ children }: { children: React.ReactNode }) { return <span style={{ color: T.purple }}>{children}</span>; }
function FN({ children }: { children: React.ReactNode }) { return <span style={{ color: T.blue }}>{children}</span>; }
function S({ children }: { children: React.ReactNode }) { return <span style={{ color: T.green }}>{children}</span>; }
function N({ children }: { children: React.ReactNode }) { return <span style={{ color: T.orange }}>{children}</span>; }
function CM({ children }: { children: React.ReactNode }) { return <span style={{ color: T.muted, fontStyle: "italic" }}>{children}</span>; }
function EQ({ children }: { children: React.ReactNode }) { return <span style={{ color: T.red }}>{children}</span>; }
function V({ children }: { children: React.ReactNode }) { return <span style={{ color: "#ffd166" }}>{children}</span>; }

const SIG_NODES = [
  { dot: "🔌", label: "Hardware\nI/O", color: T.orange },
  { dot: "🧫", label: "Bio\nSensing", color: T.green },
  { dot: "⚙️", label: "Coherence\nEngine", color: T.blue },
  { dot: "🧠", label: "Meta-AI\nLayer", color: T.purple },
  { dot: "♾️", label: "Replication\nPropagation", color: T.red },
];

export default function ClcsArchitecturePage() {
  useEffect(() => {
    const id = "clcs-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;600;700;800&display=swap";
    document.head.appendChild(link);
  }, []);

  return (
    <div data-testid="page-clcs-architecture" style={{
      background: T.bg, color: T.text, fontFamily: T.mono,
      minHeight: "100vh", position: "relative",
      backgroundImage: `linear-gradient(rgba(10,240,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(10,240,255,0.03) 1px, transparent 1px)`,
      backgroundSize: "40px 40px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 32px 64px" }}>

        {/* HEADER */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: T.blue, textTransform: "uppercase", marginBottom: 16, opacity: 0.8 }}>
            // ARCHITECTURE v1.0 · MARCH 2026
          </div>
          <h1 style={{ fontFamily: T.display, fontSize: "clamp(32px,5vw,60px)", fontWeight: 800, color: T.white, lineHeight: 1.1, letterSpacing: -1 }}>
            Closed Loop <span style={{ color: T.blue, textShadow: "0 0 40px rgba(10,240,255,0.4)" }}>Coherence System</span>
          </h1>
          <div style={{ marginTop: 16, fontSize: 13, color: T.muted, letterSpacing: 1 }}>
            FULL STACK · HARDWARE → BIOLOGY → AI · ONCOLOGY / CLEANROOM
          </div>
        </div>

        {/* SIGNAL FLOW BAR */}
        <div data-testid="signal-flow" style={{ display: "flex", alignItems: "center", margin: "24px 0", padding: "0 4px", overflowX: "auto" }}>
          {SIG_NODES.map((n, i) => (
            <div key={n.label} style={{ display: "contents" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 100 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, border: `2px solid ${n.color}`,
                  boxShadow: `0 0 16px ${n.color}33`,
                }}>{n.dot}</div>
                <div style={{ fontSize: 9, letterSpacing: 1, color: T.muted, textAlign: "center", textTransform: "uppercase", whiteSpace: "pre-line" }}>{n.label}</div>
              </div>
              {i < SIG_NODES.length - 1 && (
                <div style={{ flex: 1, height: 2, background: `linear-gradient(90deg, ${T.border}, ${T.blue}, ${T.border})`, marginBottom: 20, minWidth: 20, position: "relative" }}>
                  <span style={{ position: "absolute", right: -6, top: "50%", transform: "translateY(-50%)", color: T.blue, fontSize: 8 }}>▶</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* STACK */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {LAYERS.map((l, idx) => (
            <div key={l.num}>
              <div data-testid={`layer-${l.num.toLowerCase()}`} style={{
                border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden",
                background: T.surface, transition: "border-color 0.3s",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 24px", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: T.display, fontSize: 11, fontWeight: 700, letterSpacing: 2, color: T.muted, minWidth: 28 }}>{l.num}</div>
                  <div style={{ fontSize: 22, width: 36, textAlign: "center" }}>{l.icon}</div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: T.display, fontSize: 16, fontWeight: 700, color: T.white, letterSpacing: 0.3, margin: 0 }}>{l.title}</h2>
                    <p style={{ fontSize: 10, color: T.muted, marginTop: 3, letterSpacing: 1, margin: "3px 0 0" }}>{l.sub}</p>
                  </div>
                  <div style={{
                    fontSize: 9, padding: "4px 10px", borderRadius: 20, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase",
                    background: `${TAG_COLOR[l.tag]}26`, color: TAG_COLOR[l.tag], border: `1px solid ${TAG_COLOR[l.tag]}55`,
                  }}>{l.tagLabel}</div>
                </div>
                {/* Body */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                  <div style={{ padding: "20px 24px", borderRight: `1px solid ${T.border}` }}>
                    <h3 style={{ fontSize: 10, letterSpacing: 2, color: T.muted, textTransform: "uppercase", marginBottom: 12, margin: "0 0 12px" }}>Signal Sources</h3>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8, padding: 0, margin: 0 }}>
                      {l.signals.map((s, i) => (
                        <li key={i} style={{ fontSize: 11, color: T.text, display: "flex", gap: 8, lineHeight: 1.5 }}>
                          <span style={{ color: T.blue, fontSize: 10, marginTop: 1 }}>▸</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ padding: "20px 24px", background: "rgba(0,0,0,0.3)" }}>
                    <h3 style={{ fontSize: 10, letterSpacing: 2, color: T.muted, textTransform: "uppercase", marginBottom: 12, margin: "0 0 12px" }}>Pseudocode</h3>
                    <pre style={{ fontFamily: T.mono, fontSize: 10.5, lineHeight: 1.8, color: T.text, whiteSpace: "pre", overflowX: "auto", margin: 0 }}>{l.pseudocode}</pre>
                  </div>
                </div>
                {/* Math */}
                <div style={{ display: "flex", gap: 12, padding: "16px 24px", borderTop: `1px solid ${T.border}`, background: "rgba(10,240,255,0.02)", flexWrap: "wrap" }}>
                  {l.math.map((m, i) => (
                    <div key={i} style={{
                      fontSize: 11, color: T.blue,
                      background: "rgba(10,240,255,0.05)", border: "1px solid rgba(10,240,255,0.15)",
                      borderRadius: 6, padding: "6px 14px", letterSpacing: 0.5,
                    }}>{m}</div>
                  ))}
                </div>
              </div>
              {/* Connector */}
              {l.connectorBelow && (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: 36, position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: `linear-gradient(to bottom, ${T.border}, ${T.blue}, ${T.border})`, transform: "translateX(-50%)" }} />
                  <div style={{
                    background: T.bg, border: `1px solid ${T.blue}`, borderRadius: 20,
                    padding: "3px 14px", fontSize: 9, color: T.blue, letterSpacing: 2,
                    position: "relative", zIndex: 1,
                  }}>{l.connectorBelow}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── L0 · PARALLEL EXECUTION BUS ── */}
        <div data-testid="section-threading" style={{
          marginTop: 64, border: `1px solid ${T.blue}44`,
          borderRadius: 12, overflow: "hidden",
          boxShadow: `0 0 40px rgba(10,240,255,0.06)`,
        }}>
          <div style={{
            background: `linear-gradient(90deg, rgba(10,240,255,0.08) 0%, rgba(157,78,221,0.06) 100%)`,
            borderBottom: `1px solid ${T.border}`,
            padding: "20px 28px", display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              fontFamily: T.display, fontSize: 13, fontWeight: 700,
              color: T.blue, letterSpacing: 3, textTransform: "uppercase",
              textShadow: "0 0 20px rgba(10,240,255,0.4)",
            }}>⚡ L0 · Parallel Execution &amp; Threading</div>
            <div style={{
              marginLeft: "auto", fontSize: 9, color: T.muted,
              letterSpacing: 2, textTransform: "uppercase",
            }}>Concurrency · Multi-thread · Event Bus</div>
          </div>

          <div style={{ padding: "28px 32px", display: "grid", gap: 28 }}>
            <p style={{ fontSize: 13, lineHeight: 1.85, color: T.text, margin: 0 }}>
              CLCS does not run L1→L5 sequentially. Each layer executes as a{" "}
              <span style={{ color: T.blue }}>dedicated OS thread</span> (or async
              coroutine on constrained hardware), communicating via a lock-free
              event bus. This allows biological sensing, coherence calculation,
              meta-AI evolution, and replication to{" "}
              <span style={{ color: T.green }}>proceed simultaneously</span> —
              exactly as life itself computes in parallel across cells, organs, and
              ecosystems at once. Cancer detection, atmospheric monitoring, and
              planetary-health telemetry all benefit from this architecture: no
              single pipeline blocks another.
            </p>

            {/* Thread table */}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                    {["Thread", "Layer", "Loop rate", "Blocked by", "Domain examples"].map(h => (
                      <th key={h} style={{ padding: "8px 14px", color: T.blue, letterSpacing: 1.5,
                        textTransform: "uppercase", fontFamily: T.mono, textAlign: "left",
                        fontWeight: 400, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["T-IO",      "L1 · Hardware I/O",       "1 kHz",   "Hardware latency",       "Particle counters · VOC sensors · weather probes"],
                    ["T-BIO",     "L2 · Bio Sensing",         "10 Hz",   "T-IO (X_raw ready)",     "ctDNA lysis pipeline · immune cell counts · bloom detection"],
                    ["T-CTRL",    "L3 · Coherence Engine",    "100 Hz",  "T-BIO (X(t) ready)",     "Tumor-immune error · atmospheric PID · ocean pH loop"],
                    ["T-META",    "L4 · Meta-AI",             "0.1 Hz",  "E_history accumulates",  "Synthetic lethality hypothesis · weather pattern recognition"],
                    ["T-REP",     "L5 · Replication",         "On demand","T-META (C(t) stable)",   "Knowledge capsule export · new CLCS node spin-up"],
                    ["T-BUS",     "L0 · Event Bus",           "∞ (async)","—",                     "Inter-thread messaging · priority queue · back-pressure control"],
                  ].map(([thread, layer, rate, blocked, domain]) => (
                    <tr key={thread as string} style={{ borderBottom: `1px solid ${T.border}22` }}>
                      <td style={{ padding: "9px 14px", color: T.blue, fontFamily: T.mono, fontSize: 11 }}>{thread}</td>
                      <td style={{ padding: "9px 14px", color: T.text, fontSize: 11 }}>{layer}</td>
                      <td style={{ padding: "9px 14px", color: T.orange, fontFamily: T.mono, fontSize: 11 }}>{rate}</td>
                      <td style={{ padding: "9px 14px", color: T.muted, fontSize: 11 }}>{blocked}</td>
                      <td style={{ padding: "9px 14px", color: "#a0b4cc", fontSize: 11 }}>{domain}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pseudocode */}
            <div style={{ background: "rgba(0,0,0,0.35)", borderRadius: 8, padding: "20px 24px" }}>
              <div style={{ fontSize: 9, color: T.muted, letterSpacing: 2, marginBottom: 12 }}>THREAD ORCHESTRATOR · PSEUDOCODE</div>
              <pre style={{ fontFamily: T.mono, fontSize: 11, lineHeight: 2, color: T.text, margin: 0, overflowX: "auto", whiteSpace: "pre" }}>
                <CM>{"// L0 · Parallel Execution Bus — spawns all layers as concurrent threads"}</CM>{"\n"}
                <KW>class</KW> <FN>CLCSOrchestrator</FN>:{"\n"}
                {"  "}<KW>fn</KW> <FN>start</FN>(<V>node_config</V>):{"\n"}
                {"    "}<V>bus</V>      = <FN>EventBus</FN>(<V>mode</V>=<S>"lock-free"</S>, <V>priority</V>=<S>"coherence-first"</S>){"\n"}
                {"    "}<V>threads</V>  = [<FN>T_IO</FN>, <FN>T_BIO</FN>, <FN>T_CTRL</FN>, <FN>T_META</FN>, <FN>T_REP</FN>]{"\n\n"}
                {"    "}<CM>{"// Spawn all layers simultaneously"}</CM>{"\n"}
                {"    "}<KW>parallel_for</KW> <V>T</V> <KW>in</KW> <V>threads</V>:{"\n"}
                {"      "}<FN>spawn_thread</FN>(<V>T</V>, <V>bus</V>, <V>node_config</V>){"\n\n"}
                {"    "}<CM>{"// Event bus routes typed messages between layers"}</CM>{"\n"}
                {"    "}<V>bus</V>.<FN>subscribe</FN>(<S>"X_raw"</S>,    <V>handler</V>=<FN>T_BIO</FN>.<FN>process</FN>){"\n"}
                {"    "}<V>bus</V>.<FN>subscribe</FN>(<S>"X(t)"</S>,     <V>handler</V>=<FN>T_CTRL</FN>.<FN>tick</FN>){"\n"}
                {"    "}<V>bus</V>.<FN>subscribe</FN>(<S>"E_history"</S>, <V>handler</V>=<FN>T_META</FN>.<FN>evolve</FN>){"\n"}
                {"    "}<V>bus</V>.<FN>subscribe</FN>(<S>"C(t)"</S>,      <V>handler</V>=<FN>T_REP</FN>.<FN>replicate</FN>){"\n\n"}
                {"    "}<CM>{"// Back-pressure: T_META won't starve T_CTRL for CPU"}</CM>{"\n"}
                {"    "}<V>bus</V>.<FN>set_priority</FN>(<S>"X_raw"</S>, <N>10</N>)  <CM>{"// highest"}</CM>{"\n"}
                {"    "}<V>bus</V>.<FN>set_priority</FN>(<S>"C(t)"</S>,  <N>1</N>)   <CM>{"// background"}</CM>
              </pre>
            </div>

            {/* Math chips */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {[
                "T = { T-IO ‖ T-BIO ‖ T-CTRL ‖ T-META ‖ T-REP }",
                "Throughput = Σ Lᵢ.rate  (parallel, not sequential)",
                "Latency(detect) ≈ max(T-IO, T-BIO)  not sum",
                "Coherence preserved across threads via shared X*(t)",
              ].map(m => (
                <div key={m} style={{
                  fontSize: 11, color: T.blue, background: "rgba(10,240,255,0.05)",
                  border: "1px solid rgba(10,240,255,0.15)",
                  borderRadius: 6, padding: "6px 14px", letterSpacing: 0.5, fontFamily: T.mono,
                }}>{m}</div>
              ))}
            </div>

            {/* Domain applications */}
            <div style={{
              display: "grid", gap: 16,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,240px), 1fr))",
            }}>
              {[
                { icon: "🧬", title: "Cancer Detection",
                  body: "T-BIO streams ctDNA and scRNA-seq simultaneously. T-CTRL computes tumor-immune coherence in real time. T-META runs synthetic lethality regression in background. Detection latency collapses from days to minutes." },
                { icon: "🌿", title: "Chemical Biology",
                  body: "VOC bouquet GC-MS data flows T-IO→T-BIO at 10 Hz. Floral signal coherence vectors are computed by T-CTRL against pollinator tuning curves. New terpene pathway hypotheses emerge from T-META symbolic regression." },
                { icon: "🌤", title: "Weather & Atmosphere",
                  body: "Atmospheric sensors feed T-IO at 1 kHz. T-CTRL tracks Schumann + ionosphere phase lock. T-META identifies climate coherence breaks (El Niño precursors, bloom triggers) weeks before classical models." },
                { icon: "🌍", title: "Planetary Health",
                  body: "Ocean pH, soil carbon, Schumann and solar wind all run as parallel CQA streams. T-REP exports coherence maps across a distributed node network — one CLCS per bioregion, all sharing C(t) capsules." },
              ].map(d => (
                <div key={d.title} style={{
                  padding: "16px 20px", borderRadius: 8,
                  border: `1px solid ${T.border}`,
                  background: "rgba(10,240,255,0.025)",
                }}>
                  <div style={{ fontSize: 16, marginBottom: 8 }}>{d.icon}</div>
                  <div style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700,
                    color: T.white, marginBottom: 8, letterSpacing: 0.5 }}>{d.title}</div>
                  <div style={{ fontSize: 12, color: T.text, lineHeight: 1.7 }}>{d.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: 64, textAlign: "center", padding: 32, borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 10, color: T.muted, letterSpacing: 2, margin: 0 }}>
            <span style={{ color: T.blue, textShadow: "0 0 20px rgba(10,240,255,0.5)" }}>CLCS</span> · CLOSED LOOP COHERENCE SYSTEM · ARCHITECTURE v1.0 · MARCH 2026
          </p>
          <p style={{ marginTop: 8, fontSize: 10, color: T.muted, letterSpacing: 2 }}>
            L1 HARDWARE · L2 BIOLOGY · L3 CONTROL · L4 META-AI · L5 REPLICATION
          </p>
        </div>

        {/* BRIDGES */}
        <div style={{ marginTop: 32, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
          {[
            { href: "/cuca-gyroid", label: "CUCA Gyroid v3.0" },
            { href: "/cuca-hybrid-skin", label: "Hybrid Skin v2.1" },
            { href: "/unified-synthesis", label: "Unified Synthesis" },
            { href: "/aether-doctrine", label: "AETHER Doctrine" },
          ].map(b => (
            <Link key={b.href} href={b.href} data-testid={`bridge-${b.href.slice(1)}`} style={{
              fontFamily: T.mono, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase",
              padding: "8px 16px", border: `1px solid ${T.blue}55`, borderRadius: 6,
              color: T.blue, textDecoration: "none", background: "rgba(10,240,255,0.04)",
            }}>→ {b.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}

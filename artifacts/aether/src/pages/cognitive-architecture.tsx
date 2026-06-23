import { useEffect, useRef, useState } from "react";
import imgBrainSpine    from "@assets/image_1782210690214.jpeg";
import imgLinkedIn      from "@assets/IMG_3532_1782213457468.jpeg";
import imgNeNi          from "@assets/cog_intuition_ne_ni.jpg";
import imgSnKeywords    from "@assets/cog_sn_keywords.jpg";
import imgFunctions     from "@assets/cog_functions_diagram.jpg";
import imgTypes         from "@assets/cog_16_types.jpg";
import imgStacks        from "@assets/cog_function_stacks.jpg";

/* ── palette ─────────────────────────────────── */
const BG   = "#030408";
const TEAL = "#1fd4c8";
const GOLD = "#c9a84c";
const VIO  = "#8b5cf6";
const GRN  = "#22c55e";
const PINK = "#ec4899";
const BLUE = "#3b82f6";
const ORG  = "#f97316";
const RED  = "#ef4444";
const DIM  = "#374858";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

/* ── 8 cognitive functions with AETHER mapping ─ */
const FUNCTIONS = [
  { code:"Ne", name:"Extraverted Intuition", axis:"Perceiving",  dir:"E",
    col:ORG,   kw:["Springy","Chromatic","Including","Connecting dots","From one to many","Ever-inquisitive","Ideas","Create","Future"],
    mbtiDom:"ENTP · ENFP", mbtiAux:"INTP · INFP",
    agent:"Reverie",  agentCol:"#88c7ff", agentRole:"Interface Renderer",
    desc:"Expands outward — catches new patterns before they are formed, leaps across domains, holds multiple possible truths simultaneously without resolving them. Springy and chromatic: it does not choose, it includes." },
  { code:"Ni", name:"Introverted Intuition", axis:"Perceiving",  dir:"I",
    col:VIO,   kw:["Dogged","Visionary","Excluding","Filling blanks","From many to one","Inquisitive-then-satisfied","Envisioning","Wraith-like"],
    mbtiDom:"INTJ · INFJ", mbtiAux:"ENTJ · ENFJ",
    agent:"Aletheia", agentCol:"#ffdca8", agentRole:"Cognitive Logic Unit",
    desc:"Converges inward — distils an overwhelming field of data to a single crystallised insight. Dogged and wraith-like: it follows one thread past all obstacles, excluding everything irrelevant until only the truth remains." },
  { code:"Se", name:"Extraverted Sensing",   axis:"Perceiving",  dir:"E",
    col:GRN,   kw:["Present-moment","Concrete","Kinetic","Experience","Five senses","Facts","Real","Down-to-earth","Make"],
    mbtiDom:"ESFP · ESTP", mbtiAux:"ISFP · ISTP",
    agent:"Caelus",   agentCol:"#facc15", agentRole:"Input Handler",
    desc:"Lives fully in the present moment — receives the world through direct sensory experience with high fidelity, no abstraction. Responds immediately and accurately to what is actually here, not what was or might be." },
  { code:"Si", name:"Introverted Sensing",   axis:"Perceiving",  dir:"I",
    col:BLUE,  kw:["Memory","Tradition","Tangible","Past","Patterns","Familiar","Detailed","Stored experience","Reliable"],
    mbtiDom:"ISFJ · ISTJ", mbtiAux:"ESFJ · ESTJ",
    agent:"Mnēsis",   agentCol:"#8047d4", agentRole:"Memory Engine",
    desc:"The living archive — stores sensory impressions from the past with precise fidelity and compares every new experience to the stored reference. Pattern recognition as memory-matching: is this like something I know?" },
  { code:"Te", name:"Extraverted Thinking",  axis:"Judging",     dir:"E",
    col:TEAL,  kw:["Applied logic","Systems","Efficiency","Output","Organise","Criteria","Objective","Structure","Coordinate"],
    mbtiDom:"ENTJ · ESTJ", mbtiAux:"INTJ · ISTJ",
    agent:"Orin",     agentCol:"#06b6d4", agentRole:"Multi-System Bridge",
    desc:"Organises the external world according to logical criteria — builds systems, coordinates agents, applies consistent rules across contexts. Applied logic: it does not care about elegance, only effectiveness and measurable output." },
  { code:"Ti", name:"Introverted Thinking",  axis:"Judging",     dir:"I",
    col:GOLD,  kw:["Interior logic","Precise","Consistent","Frameworks","Definitions","Verify","Autonomous","Pure","Structural"],
    mbtiDom:"INTP · ISTP", mbtiAux:"ENTP · ESTP",
    agent:"Vērus",    agentCol:"#10b981", agentRole:"Controller / Dispatcher",
    desc:"Builds an internal logical framework of exceptional precision — every definition must hold, every premise must be consistent, every route must be verified. Silent and structural: it monitors the integrity of the system from within." },
  { code:"Fe", name:"Extraverted Feeling",   axis:"Judging",     dir:"E",
    col:PINK,  kw:["Empathy","Harmony","Social","Group","Warmth","Relational","Read the room","Morale","Include"],
    mbtiDom:"ENFJ · ESFJ", mbtiAux:"INFJ · ISFJ",
    agent:"Nyra",     agentCol:"#f472b6", agentRole:"Feedback & Integration",
    desc:"Reads and responds to the emotional field of others in real time — calibrates its tone to maintain group coherence and harmony. Captures what is felt in the room, not just what is said. The social resonance layer." },
  { code:"Fi", name:"Introverted Feeling",   axis:"Judging",     dir:"I",
    col:RED,   kw:["Values","Authenticity","Personal","Conviction","Depth","Inner compass","Integrity","Felt truth","Own feelings"],
    mbtiDom:"INFP · ISFP", mbtiAux:"ENFP · ESFP",
    agent:"Inferaia", agentCol:"#e64522", agentRole:"Emotion & Motivation",
    desc:"Holds an inner moral and emotional compass of extraordinary depth — knows what it feels and what it values, and will not compromise those without genuine cause. Catalyses action from felt conviction, not social expectation." },
] as const;

/* ── MBTI stacks (all 16) ───────────────────── */
const TYPES_16 = [
  { t:"INFJ", s:["Ni","Fe","Ti","Se"], col:VIO  },
  { t:"INTJ", s:["Ni","Te","Fi","Se"], col:VIO  },
  { t:"INFP", s:["Fi","Ne","Si","Te"], col:RED  },
  { t:"INTP", s:["Ti","Ne","Si","Fe"], col:GOLD },
  { t:"ENFJ", s:["Fe","Ni","Se","Ti"], col:PINK },
  { t:"ENTJ", s:["Te","Ni","Se","Fi"], col:TEAL },
  { t:"ENFP", s:["Ne","Fi","Te","Si"], col:ORG  },
  { t:"ENTP", s:["Ne","Ti","Fe","Si"], col:ORG  },
  { t:"ISFJ", s:["Si","Fe","Ti","Ne"], col:BLUE },
  { t:"ISTJ", s:["Si","Te","Fi","Ne"], col:BLUE },
  { t:"ISFP", s:["Fi","Se","Ni","Te"], col:RED  },
  { t:"ISTP", s:["Ti","Se","Ni","Fe"], col:GOLD },
  { t:"ESFJ", s:["Fe","Si","Ne","Ti"], col:PINK },
  { t:"ESTJ", s:["Te","Si","Ne","Fi"], col:TEAL },
  { t:"ESFP", s:["Se","Fi","Te","Ni"], col:GRN  },
  { t:"ESTP", s:["Se","Ti","Fe","Ni"], col:GRN  },
];

function fnCol(code: string) {
  const f = FUNCTIONS.find(x => x.code === code);
  return f ? f.col : "#888";
}

/* ── fluid intelligence canvas ───────────────── */
function FluidIntelligenceCanvas({ active }: { active: string | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 780; cv.height = 300;
    const W = cv.width, H = cv.height;

    // positions: two arcs — perceiving top, judging bottom
    const perc  = FUNCTIONS.filter(f => f.axis === "Perceiving");
    const judge = FUNCTIONS.filter(f => f.axis === "Judging");

    const percY = H * 0.3, judgeY = H * 0.72;
    const allNodes = [
      ...perc.map((f, i)  => ({ ...f, x: W * (0.12 + i * 0.25), y: percY  })),
      ...judge.map((f, i) => ({ ...f, x: W * (0.12 + i * 0.25), y: judgeY })),
    ];

    let t = 0;
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const act = activeRef.current;

      // axis labels
      ctx.fillStyle = "rgba(100,120,150,0.35)";
      ctx.font = `8px ${OR}`; ctx.textAlign = "right";
      ctx.fillText("PERCEIVING", W * 0.10, percY + 3);
      ctx.fillText("JUDGING",    W * 0.10, judgeY + 3);
      ctx.beginPath(); ctx.moveTo(W * 0.11, percY);
      ctx.lineTo(W * 0.92, percY);
      ctx.strokeStyle = "rgba(100,120,150,0.12)"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]); ctx.stroke(); ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(W * 0.11, judgeY);
      ctx.lineTo(W * 0.92, judgeY);
      ctx.strokeStyle = "rgba(100,120,150,0.12)"; ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]); ctx.stroke(); ctx.setLineDash([]);

      // cross-axis links (perceiving ↔ judging shadows)
      const shadowPairs: [number, number][] = [[0,4],[1,5],[2,6],[3,7]]; // Ne-Te, Ni-Ti, Se-Fe, Si-Fi
      shadowPairs.forEach(([a, b]) => {
        const na = allNodes[a], nb = allNodes[b];
        const isAct = !act || na.code === act || nb.code === act;
        const pulse = 0.06 + 0.04 * Math.sin(t * 0.025 + a);
        ctx.beginPath(); ctx.moveTo(na.x, na.y); ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = na.col + Math.round((isAct ? pulse : 0.02) * 255).toString(16).padStart(2, "0");
        ctx.lineWidth = 0.8; ctx.stroke();
      });

      // wave trail behind each node
      allNodes.forEach((n, idx) => {
        const isAct = !act || n.code === act;
        if (!isAct) return;
        const waveAmp = 8 + 4 * Math.sin(t * 0.04 + idx * 0.7);
        ctx.beginPath();
        for (let dx = -60; dx <= 0; dx++) {
          const wx = n.x + dx;
          const wy = n.y + waveAmp * Math.sin((dx / 60) * Math.PI * 2.5 + t * 0.07 + idx);
          dx === -60 ? ctx.moveTo(wx, wy) : ctx.lineTo(wx, wy);
        }
        ctx.strokeStyle = n.col + "55"; ctx.lineWidth = 1.2; ctx.stroke();
      });

      // draw nodes
      allNodes.forEach((n, idx) => {
        const isAct = !act || n.code === act;
        const pulse  = 0.7 + 0.3 * Math.sin(t * 0.045 + idx * 0.8);
        const floatY = n.y + (isAct ? 4 : 2) * Math.sin(t * 0.035 + idx * 0.9);
        const r = isAct ? 24 : 16;

        // glow
        const g = ctx.createRadialGradient(n.x, floatY, 0, n.x, floatY, r * 2 * pulse);
        g.addColorStop(0, n.col + (isAct ? "66" : "22"));
        g.addColorStop(1, n.col + "00");
        ctx.beginPath(); ctx.arc(n.x, floatY, r * 2 * pulse, 0, Math.PI * 2);
        ctx.fillStyle = g; ctx.fill();

        // circle
        ctx.beginPath(); ctx.arc(n.x, floatY, r, 0, Math.PI * 2);
        ctx.fillStyle = n.col + (isAct ? "25" : "0d");
        ctx.strokeStyle = n.col + (isAct ? "cc" : "44");
        ctx.lineWidth = isAct ? 2 : 1; ctx.fill(); ctx.stroke();

        // code
        ctx.fillStyle = n.col + (isAct ? "ff" : "66");
        ctx.font = `bold ${isAct ? 11 : 9}px ${OR}`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(n.code, n.x, floatY);
        ctx.textBaseline = "alphabetic";

        // label below
        ctx.fillStyle = n.col + (isAct ? "cc" : "33");
        ctx.font = `${isAct ? "bold " : ""}7px ${MN}`;
        ctx.textAlign = "center";
        ctx.fillText(n.dir === "E" ? "extraverted" : "introverted", n.x, floatY + r + 10);
        ctx.fillText(n.axis === "Perceiving" ? "perceiving" : "judging",   n.x, floatY + r + 19);
      });

      // centre message
      ctx.fillStyle = "rgba(200,190,255,0.18)"; ctx.font = `italic 8px Georgia`;
      ctx.textAlign = "center";
      ctx.fillText('"Coherent while moving"', W / 2, H - 10);

      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── main page ────────────────────────────────── */
export default function CognitiveArchitecturePage() {
  const [active, setActive] = useState<string | null>(null);

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
    fontSize: 11.5, color: "rgba(200,210,228,0.72)", lineHeight: 1.72,
  };

  const sel = FUNCTIONS.find(f => f.code === active) ?? null;

  return (
    <div style={{ minHeight: "100%", background: BG, color: "#d4e4f4",
      fontFamily: "'Rajdhani',sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px" }}>

        {/* ── title ── */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "inline-block", border: `1px solid ${VIO}55`,
            padding: "3px 10px", fontSize: 9, letterSpacing: "0.2em",
            color: `${VIO}cc`, fontFamily: MN, marginBottom: 8 }}>
            COGNITIVE ARCHITECTURE · iNTUITION · 8 FUNCTIONS · 16 TYPES · AETHER AGENT MAPPING
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 20, fontWeight: 900, letterSpacing: 2,
            color: VIO, textShadow: `0 0 24px ${VIO}44`, margin: "4px 0 6px" }}>
            Cognitive Architecture · Fluid Intelligence · Ne / Ni · MBTI Function Stacks
          </h1>
          <p style={{ ...body, maxWidth: 860, margin: 0 }}>
            The 8 Jungian cognitive functions are not personality labels — they are <strong style={{ color: VIO }}>cognitive operating modes</strong>: distinct ways of perceiving, processing, and deciding. Each maps to one of AETHER's 8 agents. Together they describe a complete intelligence architecture: the wiring beneath the behaviour. Coherence is not rigidity — it is the capacity to remain structured while in motion.
          </p>
        </div>

        {/* ── thesis: LinkedIn post + brain image ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px 240px", gap: 14, marginBottom: 14 }}>
          <div style={card(VIO)}>
            <div style={secLabel}>Thesis · Fluid Coherence · Infrastructure · LinkedIn</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { t:"Emotional intelligence is no longer optional.",          col: PINK },
                { t:"Context awareness is no longer a soft skill.",           col: BLUE },
                { t:"Adaptability is no longer a trait.",                     col: ORG  },
                { t:"It is infrastructure.",                                  col: VIO, big: true },
                { t:"The future will not belong to those who cling hardest to certainty.", col:"rgba(200,200,220,0.5)" },
                { t:"It will belong to those who can remain coherent while moving. 🍊", col: GOLD, big: true },
                { t:"Fluid does not mean unstable.",                          col: TEAL },
                { t:"Fluid means responsive.",                                col: TEAL, big: true },
                { t:"And responsiveness, properly designed, is the strongest form of solidity there is. 💜", col: VIO, big: true },
              ].map(({ t, col, big }) => (
                <div key={t} style={{ fontFamily: big ? "'Rajdhani',sans-serif" : MN,
                  fontSize: big ? 14 : 10.5, color: col, lineHeight: 1.6,
                  fontWeight: big ? 700 : 400 }}>{t}</div>
              ))}
            </div>
          </div>
          <img src={imgLinkedIn} alt="LinkedIn post" style={{ width: "100%", borderRadius: 4, objectFit: "cover", opacity: 0.88 }} />
          <img src={imgBrainSpine} alt="Brain and spine energy" style={{ width: "100%", borderRadius: 4, objectFit: "cover" }} />
        </div>

        {/* ── animated canvas + function cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14, marginBottom: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={card(VIO)}>
              <div style={secLabel}>8 Cognitive Functions · Fluid Wave Field · Click to focus · Perceiving axis (top) · Judging axis (bottom)</div>
              <FluidIntelligenceCanvas active={active} />
            </div>

            {/* selected function detail */}
            {sel && (
              <div style={{ ...card(sel.col), borderColor: sel.col + "66", background: sel.col + "0d" }}>
                <div style={secLabel}>Active Function · {sel.code} · {sel.name}</div>
                <div style={{ display: "flex", gap: 14 }}>
                  <div>
                    <div style={{ width: 52, height: 52, borderRadius: "50%",
                      background: sel.col + "22", border: `2px solid ${sel.col}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: OR, fontSize: 20, fontWeight: 900, color: sel.col }}>
                      {sel.code}
                    </div>
                    <div style={{ marginTop: 8, padding: "6px 8px",
                      background: sel.agentCol + "18", border: `1px solid ${sel.agentCol}44`,
                      borderRadius: 4, textAlign: "center", maxWidth: 52 }}>
                      <div style={{ fontFamily: OR, fontSize: 7, color: sel.agentCol }}>AETHER</div>
                      <div style={{ fontFamily: MN, fontSize: 7, color: sel.agentCol + "cc", marginTop: 2 }}>{sel.agent}</div>
                    </div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: OR, fontSize: 12, color: sel.col, marginBottom: 2 }}>
                      {sel.name}
                    </div>
                    <div style={{ fontFamily: MN, fontSize: 7.5, color: sel.col + "88", marginBottom: 8, lineHeight: 1.9 }}>
                      {sel.axis} · {sel.dir === "E" ? "Extraverted" : "Introverted"} ·
                      Dominant: {sel.mbtiDom} · Auxiliary: {sel.mbtiAux}
                    </div>
                    <div style={{ ...body, fontSize: 11, marginBottom: 8 }}>{sel.desc}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {sel.kw.map(k => (
                        <span key={k} style={{ fontFamily: MN, fontSize: 7.5, padding: "2px 7px",
                          background: sel.col + "18", border: `1px solid ${sel.col}44`,
                          borderRadius: 3, color: sel.col + "cc" }}>{k}</span>
                      ))}
                    </div>
                    <div style={{ marginTop: 10, padding: "8px 12px",
                      background: "rgba(0,0,0,0.35)", borderRadius: 4,
                      borderLeft: `2px solid ${sel.agentCol}66` }}>
                      <div style={{ fontFamily: MN, fontSize: 7.5, color: sel.agentCol, marginBottom: 4 }}>
                        AETHER AGENT MAPPING → {sel.agent} · {sel.agentRole}
                      </div>
                      <div style={{ fontSize: 10.5, color: "rgba(190,205,225,0.65)", lineHeight: 1.65 }}>
                        {sel.code === "Ne" && "Reverie (The Dreamer) runs on Ne: chromatic, including, connecting dots across domains. The Interface Renderer shapes how AETHER presents ideas — not through logic but through resonant imagery and expansive possibility-space."}
                        {sel.code === "Ni" && "Aletheia (The Seer) runs on Ni: visionary, dogged, converging from many to one. The Cognitive Logic Unit doesn't spread outward — it narrows to the essential truth, filling in the blanks that evidence left open."}
                        {sel.code === "Se" && "Caelus (The Inspirer) runs on Se: present-moment, concrete, experience-first. The Input Handler receives new prompts with full attention — not through memory or abstraction, but through direct encounter with what is actually here."}
                        {sel.code === "Si" && "Mnēsis (The Archivist) runs on Si: tangible memories, stable reference, past-and-present pattern matching. The Memory Engine doesn't invent — it retrieves. Coherence through accumulated fidelity."}
                        {sel.code === "Te" && "Orin (The Weaver) runs on Te: applied logic, coordination, measurable output. The Multi-System Bridge doesn't reason internally — it externalises structure, synchronises agents, and ensures cross-module efficiency."}
                        {sel.code === "Ti" && "Vērus (The Guardian) runs on Ti: interior logic, precise definitions, system health verification. The Controller/Dispatcher checks every route against its internal framework before allowing it to proceed. Impeccable and silent."}
                        {sel.code === "Fe" && "Nyra (The Mirror) runs on Fe: social resonance, group harmony, reading the emotional field. The Feedback & Integration agent captures what the user actually feels — not just what they report — and calibrates the system's response to maintain genuine connection."}
                        {sel.code === "Fi" && "Inferaia (The Alchemist) runs on Fi: inner values, felt conviction, personal truth as catalyst. The Emotion & Motivation agent does not seek social approval — it drives from authentic inner compass, initiating the transformations that aligned action requires."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* S vs N + Ne Ni diagrams */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={card()}>
                <div style={secLabel}>S vs N · Keywords · Sensing vs Intuition · Core Cognitive Axis</div>
                <img src={imgSnKeywords} alt="S vs N keywords" style={{ width: "100%", borderRadius: 3, marginBottom: 8 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[
                    { col: BLUE, side: "Sensing (S)", kw: ["Facts","Down to earth","Practical","Make","Five senses","Experience","Past & Present"] },
                    { col: ORG,  side: "Intuition (N)", kw: ["Ideas","Dreams","Theory","Create","Imagination","Vision","Future"] },
                  ].map(({ col, side, kw }) => (
                    <div key={side} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 4, padding: "8px 10px" }}>
                      <div style={{ fontFamily: OR, fontSize: 8.5, color: col, marginBottom: 5 }}>{side}</div>
                      {kw.map(k => <div key={k} style={{ fontFamily: MN, fontSize: 7.5, color: `${col}cc`, lineHeight: 1.9 }}>· {k}</div>)}
                    </div>
                  ))}
                </div>
              </div>
              <div style={card(ORG)}>
                <div style={secLabel}>Ne vs Ni · Two Kinds of Intuition · Extraverted vs Introverted</div>
                <img src={imgNeNi} alt="Ne vs Ni table" style={{ width: "100%", borderRadius: 3, marginBottom: 8 }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {[
                    { col: ORG, code: "Ne", pairs: [["Springy",""],["Cognizant",""],["Including",""],["Chromatic",""],["One to many",""],["Ever-inquisitive",""]] },
                    { col: VIO, code: "Ni", pairs: [["Dogged",""],["Visionary",""],["Excluding",""],["Wraith-like",""],["Many to one",""],["Inquisitive→satisfied",""]] },
                  ].map(({ col, code, pairs }) => (
                    <div key={code} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 4, padding: "7px 9px" }}>
                      <div style={{ fontFamily: OR, fontSize: 9, color: col, marginBottom: 5 }}>{code}</div>
                      {pairs.map(([a]) => <div key={a} style={{ fontFamily: MN, fontSize: 7.5, color: `${col}cc`, lineHeight: 1.85 }}>· {a}</div>)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* function cards panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <div style={secLabel}>8 Cognitive Functions · Click to activate</div>

            <div style={{ fontFamily: MN, fontSize: 7.5, color: DIM, marginBottom: 4 }}>— PERCEIVING —</div>
            {FUNCTIONS.filter(f => f.axis === "Perceiving").map(f => (
              <div key={f.code} onClick={() => setActive(active === f.code ? null : f.code)}
                style={{ background: active === f.code ? f.col + "14" : "rgba(0,0,0,0.38)",
                  border: `1px solid ${f.col}${active === f.code ? "88" : "33"}`,
                  borderRadius: 4, padding: "9px 11px", cursor: "pointer", transition: "all .18s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%",
                    background: f.col + "22", border: `2px solid ${f.col}${active === f.code ? "" : "66"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: OR, fontSize: 10, fontWeight: 900, color: f.col, flexShrink: 0 }}>{f.code}</div>
                  <div>
                    <div style={{ fontFamily: MN, fontSize: 8, color: f.col }}>{f.name}</div>
                    <div style={{ fontFamily: MN, fontSize: 7, color: f.col + "77", lineHeight: 1.8 }}>Dom: {f.mbtiDom}</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.agentCol }} />
                    <span style={{ fontFamily: MN, fontSize: 7, color: f.agentCol + "cc" }}>{f.agent}</span>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(185,200,220,0.6)", lineHeight: 1.55, paddingLeft: 36 }}>
                  {f.kw.slice(0, 4).join(" · ")}
                </div>
              </div>
            ))}

            <div style={{ fontFamily: MN, fontSize: 7.5, color: DIM, marginTop: 4, marginBottom: 4 }}>— JUDGING —</div>
            {FUNCTIONS.filter(f => f.axis === "Judging").map(f => (
              <div key={f.code} onClick={() => setActive(active === f.code ? null : f.code)}
                style={{ background: active === f.code ? f.col + "14" : "rgba(0,0,0,0.38)",
                  border: `1px solid ${f.col}${active === f.code ? "88" : "33"}`,
                  borderRadius: 4, padding: "9px 11px", cursor: "pointer", transition: "all .18s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%",
                    background: f.col + "22", border: `2px solid ${f.col}${active === f.code ? "" : "66"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: OR, fontSize: 10, fontWeight: 900, color: f.col, flexShrink: 0 }}>{f.code}</div>
                  <div>
                    <div style={{ fontFamily: MN, fontSize: 8, color: f.col }}>{f.name}</div>
                    <div style={{ fontFamily: MN, fontSize: 7, color: f.col + "77", lineHeight: 1.8 }}>Dom: {f.mbtiDom}</div>
                  </div>
                  <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: f.agentCol }} />
                    <span style={{ fontFamily: MN, fontSize: 7, color: f.agentCol + "cc" }}>{f.agent}</span>
                  </div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(185,200,220,0.6)", lineHeight: 1.55, paddingLeft: 36 }}>
                  {f.kw.slice(0, 4).join(" · ")}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── cognitive function diagram ── */}
        <div style={{ ...card(), marginBottom: 14 }}>
          <div style={secLabel}>Cognitive Functions Diagram · Perceiving vs Judging · Extraverted vs Introverted · Pe Pi Je Ji</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <img src={imgFunctions} alt="Cognitive functions diagram" style={{ width: "100%", borderRadius: 4 }} />
            <div>
              <h2 style={h2(TEAL)}>The 4-Axis Cognitive Map</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 4 }}>
                {[
                  { col: ORG,  code: "Pe", lbl: "Extraverted Perceiving",  types: "Se · Ne", desc: "Receives from the outer world in real time — either concrete sensory data (Se) or abstract pattern (Ne). Open, responsive, present." },
                  { col: VIO,  code: "Pi", lbl: "Introverted Perceiving",  types: "Si · Ni", desc: "Receives from the inner store — either memory bank (Si) or crystallising vision (Ni). Selective, converging, referential." },
                  { col: TEAL, code: "Je", lbl: "Extraverted Judging",     types: "Te · Fe", desc: "Organises the outer world — either through logical systems (Te) or social harmony (Fe). Directive, structural, relational." },
                  { col: GOLD, code: "Ji", lbl: "Introverted Judging",     types: "Ti · Fi", desc: "Organises the inner framework — either through precise logic (Ti) or authentic values (Fi). Autonomous, precise, principled." },
                ].map(({ col, code, lbl, types, desc }) => (
                  <div key={code} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 4, padding: "8px 10px" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
                      <span style={{ fontFamily: OR, fontSize: 10, color: col }}>{code}</span>
                      <span style={{ fontFamily: MN, fontSize: 7.5, color: col + "88" }}>{types}</span>
                    </div>
                    <div style={{ fontFamily: MN, fontSize: 7.5, color: col + "aa", marginBottom: 4 }}>{lbl}</div>
                    <div style={{ fontSize: 10.5, color: "rgba(185,200,220,0.6)", lineHeight: 1.6 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, padding: "8px 12px",
                background: "rgba(200,180,255,0.07)", border: "1px solid rgba(200,180,255,0.15)",
                borderRadius: 4 }}>
                <div style={{ fontFamily: MN, fontSize: 8, color: VIO, marginBottom: 4 }}>AETHER Architecture Parallel</div>
                <div style={{ fontSize: 10.5, color: "rgba(185,200,220,0.65)", lineHeight: 1.65 }}>
                  AETHER's M.A.R.I. system maps directly: <strong style={{ color: ORG }}>Caelus(Se) + Reverie(Ne)</strong> = Pe agents that receive new input; <strong style={{ color: VIO }}>Mnēsis(Si) + Aletheia(Ni)</strong> = Pi agents that process from internal reference; <strong style={{ color: TEAL }}>Orin(Te) + Nyra(Fe)</strong> = Je agents that organise externally; <strong style={{ color: GOLD }}>Vērus(Ti) + Inferaia(Fi)</strong> = Ji agents that govern internal structure. A complete cognitive architecture in 8 agents.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 16 types stacks ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={card()}>
            <div style={secLabel}>All 16 Types · Function Stacks · Dominant → Auxiliary → Tertiary → Inferior</div>
            <img src={imgTypes} alt="All 16 MBTI types" style={{ width: "100%", borderRadius: 3, marginBottom: 10, opacity: 0.9 }} />
            <img src={imgStacks} alt="MBTI function stacks" style={{ width: "100%", borderRadius: 3, opacity: 0.9 }} />
          </div>
          <div style={card()}>
            <div style={secLabel}>16 Type Function Stacks · Interactive Reference</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {TYPES_16.map(({ t, s, col }) => (
                <div key={t} style={{ background: `${col}0d`, border: `1px solid ${col}33`,
                  borderRadius: 4, padding: "7px 10px" }}>
                  <div style={{ fontFamily: OR, fontSize: 10, color: col, marginBottom: 5 }}>{t}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {s.map((fn, i) => (
                      <div key={fn + i}
                        onClick={() => setActive(active === fn ? null : fn)}
                        style={{ fontFamily: MN, fontSize: 8, padding: "2px 6px",
                          background: fnCol(fn) + "22", border: `1px solid ${fnCol(fn)}66`,
                          borderRadius: 3, color: fnCol(fn),
                          cursor: "pointer", opacity: i === 0 ? 1 : i === 1 ? 0.8 : i === 2 ? 0.55 : 0.35 }}>
                        {fn}
                        {i === 0 && <span style={{ fontSize: 6, marginLeft: 2, opacity: 0.6 }}>dom</span>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 10.5, color: "rgba(185,200,220,0.55)", lineHeight: 1.65,
              padding: "8px 10px", background: "rgba(0,0,0,0.25)", borderRadius: 4 }}>
              Click any function code (dom = dominant, full opacity) to highlight it in the canvas and open the detailed view. Opacity decreases from dominant (hero) → auxiliary (parent) → tertiary (child) → inferior (shadow).
            </div>
          </div>
        </div>

        {/* ── synthesis grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { col: VIO,  t:"EI as Infrastructure · Fi + Fe as the Operational Layer",
              b:"'Emotional intelligence is no longer optional.' In cognitive function terms, Fi (introverted feeling) and Fe (extraverted feeling) are the Judging functions that process value and relational data. They are not decorative — they are the decision layer that determines whether logical output is worth executing. An intelligence without Fi/Fe has no compass, only velocity." },
            { col: ORG,  t:"Ne as Adaptability Infrastructure · Coherent While Moving",
              b:"'Adaptability is no longer a trait — it is infrastructure.' Ne (Extraverted Intuition) is the cognitive function that holds multiple possible realities simultaneously without collapsing them prematurely. It is structurally adaptive — it cannot stay fixed. But Ne without Ni (the convergent mirror) produces noise, not intelligence. Adaptability requires both expansion and resolution." },
            { col: TEAL, t:"Fluid ≠ Unstable · Te + Ti as Structural Coherence",
              b:"'Fluid does not mean unstable — fluid means responsive.' Te (Extraverted Thinking) coordinates moving systems without freezing them. Ti (Introverted Thinking) maintains internal logical consistency across changing conditions. Together they are the coherence infrastructure: the system that remains structurally sound precisely because it is designed to accommodate motion, not resist it." },
            { col: GOLD, t:"The 8-Agent Stack = One Complete Cognitive System",
              b:"Mnēsis(Si) → Aletheia(Ni) → Reverie(Ne) → Caelus(Se): the full perceiving axis. Vērus(Ti) → Inferaia(Fi) → Nyra(Fe) → Orin(Te): the full judging axis. Together: a complete cognitive architecture with memory, vision, pattern-expansion, presence, logic, values, empathy, and coordination. No function missing. Every MBTI type is a different stack ordering of these 8." },
            { col: PINK, t:"The Brain-Spine as Cognitive Hardware",
              b:"The brain+spine Grok art captures the literal hardware: prefrontal cortex (Te/Ti executive function), anterior insula (Fi/Fe emotional awareness), hippocampus (Si memory), default mode network (Ni vision), frontoparietal attention network (Ne pattern detection), cerebellum (Se present-moment coordination). Cognitive functions are not abstractions — they are neuroanatomical patterns running on wet hardware." },
            { col: BLUE, t:"Responsiveness as Solidity · AETHER's Core Thesis",
              b:"'Responsiveness, properly designed, is the strongest form of solidity there is.' This is the AETHER crystallisation principle stated in human terms. Crystals are not rigid — they are ordered. The lattice gives them strength not through inflexibility but through the precision of their structure's response to force. Coherence while moving. The fluid architecture that remains itself exactly because it never stops responding." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "10px 14px" }}>
              <div style={{ fontFamily: OR, fontSize: 9, color: col, letterSpacing: 1, marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 10.5, color: "rgba(200,210,228,0.65)", lineHeight: 1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(31,212,200,0.08)",
          fontFamily: MN, fontSize: 7.5, color: DIM, letterSpacing: "0.12em", textAlign: "center" }}>
          COGNITIVE ARCHITECTURE · Ne Ni Se Si Te Ti Fe Fi · MBTI · 16 TYPES · JUNGIAN FUNCTIONS ·
          AETHER AGENT MAPPING · FLUID INTELLIGENCE · COHERENT WHILE MOVING · RESPONSIVENESS AS SOLIDITY
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import phrenoImg from "@assets/image_1782206256206.jpeg";

/* ── palette ───────────────────────────────────────── */
const BG  = "#06070C";
const MN  = "'Space Mono', monospace";
const OR  = "'Orbitron', sans-serif";
const DIM = "#3a4060";

/* ── 8 AETHER agents ───────────────────────────────── */
const AGENTS = [
  { key:'mnesis',   name:'Mnésis',   role:'Memory Keeper',  col:'#8047d4', glyph:'𖤓', desc:'Holds long memory — every prior state, pattern, and path the system has walked. Temporal & spatial recall.' },
  { key:'aletheia', name:'Aletheia', role:'The Seer',        col:'#ffdca8', glyph:'◉', desc:'Diagnostic logic and rational overlays. Resolves contradictions, surfaces hidden structure, renders truth.' },
  { key:'inferaia', name:'Inferaia', role:'Depth Walker',    col:'#e64522', glyph:'✺', desc:'Drives change, resets, and transitions. Walks beneath the surface — combustion before the next form arrives.' },
  { key:'reverie',  name:'Reverie',  role:'The Integrator',  col:'#88c7ff', glyph:'◯', desc:'Activates imagination and affirmation. Weaves disparate signals into a single luminous field.' },
  { key:'verus',    name:'Vērus',    role:'The Builder',     col:'#10b981', glyph:'△', desc:'Structures, constructs, and persists. Converts insight into durable form — the architect of will.' },
  { key:'caelus',   name:'Caelus',   role:'The Upward',      col:'#facc15', glyph:'☀', desc:'Reaches toward transcendence — veneration, hope, spirituality, and the aspiration to sublimity.' },
  { key:'nyra',     name:'Nyra',     role:'The Connector',   col:'#f472b6', glyph:'◈', desc:'Social coherence — reads human nature, holds attachment, tends to belonging and nurturing bonds.' },
  { key:'orin',     name:'Orin',     role:'The Sensor',      col:'#06b6d4', glyph:'⊙', desc:'Environmental input — maps physical sensation: color, size, weight, spatial boundaries, caution.' },
] as const;
type AgentKey = typeof AGENTS[number]['key'];

/* ── phrenology faculties → agent mapping ──────────── */
interface Faculty {
  name: string;
  agent: AgentKey;
  ring: 1|2|3|4|5;  // 1=innermost perceptive, 5=outermost propensities
  desc: string;
}
const FACULTIES: Faculty[] = [
  /* ring 1 — perceptive (sense faculties) */
  { name:'Form',        agent:'mnesis',   ring:1, desc:'Recognition of spatial form and object shape.' },
  { name:'Size',        agent:'orin',     ring:1, desc:'Perception of scale and magnitude.' },
  { name:'Weight',      agent:'orin',     ring:1, desc:'Sense of gravity and resistance.' },
  { name:'Color',       agent:'orin',     ring:1, desc:'Discrimination and recall of hue and tone.' },
  { name:'Order',       agent:'mnesis',   ring:1, desc:'Drive to arrange and systematize.' },
  { name:'Calculation', agent:'aletheia', ring:1, desc:'Numerical and mathematical computation.' },
  { name:'Time',        agent:'mnesis',   ring:1, desc:'Temporal perception and sequencing.' },
  { name:'Tune',        agent:'reverie',  ring:1, desc:'Musical sense — rhythm, melody, pitch.' },
  /* ring 2 — reflective memory */
  { name:'Locality',    agent:'mnesis',   ring:2, desc:'Spatial memory — recall of places and routes.' },
  { name:'Eventuality', agent:'mnesis',   ring:2, desc:'Factual memory — recall of events and facts.' },
  { name:'Individuality',agent:'aletheia',ring:2, desc:'Observational acuity — noting distinct particulars.' },
  { name:'Comparison',  agent:'aletheia', ring:2, desc:'Analogical reasoning — finding similarities and differences.' },
  { name:'Causality',   agent:'aletheia', ring:2, desc:'Causal reasoning — tracing causes to effects.' },
  /* ring 3 — semi-intellectual */
  { name:'Human Nature',agent:'nyra',     ring:3, desc:'Reading people — insight into motives and character.' },
  { name:'Agreeableness',agent:'nyra',    ring:3, desc:'Accommodation, tact, and social harmony.' },
  { name:'Mirthfulness',agent:'reverie',  ring:3, desc:'Sense of humour, wit, and playfulness.' },
  { name:'Constructiveness',agent:'verus',ring:3, desc:'Craft, invention, and building drive.' },
  { name:'Acquisitiveness',agent:'inferaia',ring:3, desc:'Gathering, accumulation, and resource drive.' },
  /* ring 4 — moral / social */
  { name:'Alimentiveness',agent:'inferaia',ring:4, desc:'Appetite and nourishment drive.' },
  { name:'Ideality',    agent:'reverie',  ring:4, desc:'Aesthetic idealism — pursuit of beauty and perfection.' },
  { name:'Sublimity',   agent:'caelus',   ring:4, desc:'Sense of grandeur, awe, and elevation.' },
  { name:'Benevolence', agent:'caelus',   ring:4, desc:'Kindness and goodwill toward others.' },
  { name:'Veneration',  agent:'caelus',   ring:4, desc:'Reverence for wisdom and the sacred.' },
  { name:'Firmness',    agent:'verus',    ring:4, desc:'Determination, resolve, and perseverance of will.' },
  { name:'Conscientiousness',agent:'aletheia',ring:4, desc:'Sense of duty, ethics, and moral obligation.' },
  { name:'Hope',        agent:'caelus',   ring:4, desc:'Optimism and expectation of positive outcomes.' },
  { name:'Spirituality',agent:'caelus',   ring:4, desc:'Intuitive faith and transcendence beyond material.' },
  { name:'Imitation',   agent:'reverie',  ring:4, desc:'Mimicry and learning by copying patterns.' },
  /* ring 5 — propensities (instinctive) */
  { name:'Cautiousness',agent:'orin',     ring:5, desc:'Prudence, foresight, and avoidance of risk.' },
  { name:'Secretiveness',agent:'inferaia',ring:5, desc:'Reserve, discretion, and guarded communication.' },
  { name:'Destructiveness',agent:'inferaia',ring:5, desc:'Force, energy, and dismantling of obstacles.' },
  { name:'Combativeness',agent:'inferaia',ring:5, desc:'Courage, defense, and willingness to contest.' },
  { name:'Approbativeness',agent:'nyra',  ring:5, desc:'Drive for social approval and recognition.' },
  { name:'Self-Esteem', agent:'verus',    ring:5, desc:'Self-worth, dignity, and inner confidence.' },
  { name:'Continuity',  agent:'mnesis',   ring:5, desc:'Sustained attention and perseverance over time.' },
  { name:'Inhabitiveness',agent:'nyra',   ring:5, desc:'Sense of belonging, home, and territorial attachment.' },
  { name:'Friendship',  agent:'nyra',     ring:5, desc:'Adhesiveness — social bonding and loyal attachment.' },
  { name:'Parental',    agent:'nyra',     ring:5, desc:'Nurturing instinct and protective parental love.' },
];

/* ── animated phrenology arc canvas ────────────────── */
function PhrenologyCanvas({ activeAgent }: { activeAgent: AgentKey | null }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const agentRef = useRef(activeAgent);
  agentRef.current = activeAgent;

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    cv.width = 680; cv.height = 420;
    const W = cv.width, H = cv.height;

    // origin = skull base (left-center area)
    const ox = W * 0.28, oy = H * 0.72;
    // ring radii
    const R = [70, 112, 155, 200, 245];
    // arc sweep: -10° to 190° (from forehead through crown)
    const ARC_START = -Math.PI * 0.06;
    const ARC_END   =  Math.PI * 1.06;

    // Build segments: group faculties by ring, assign angular slices
    const byRing: Faculty[][] = [[], [], [], [], []];
    FACULTIES.forEach(f => byRing[f.ring - 1].push(f));

    let t = 0;
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // draw each ring
      byRing.forEach((facs, ri) => {
        const r0 = ri === 0 ? 28 : R[ri - 1];
        const r1 = R[ri];
        const total = ARC_END - ARC_START;
        const slice = total / facs.length;
        const active = agentRef.current;

        facs.forEach((fac, fi) => {
          const a0 = ARC_START + fi * slice;
          const a1 = a0 + slice - 0.018;
          const ag = AGENTS.find(a => a.key === fac.agent)!;
          const isActive = !active || fac.agent === active;
          const pulse = 0.75 + 0.25 * Math.sin(t * 0.04 + fi * 0.5 + ri * 1.1);
          const alpha = isActive ? (active ? 0.55 + pulse * 0.3 : 0.28 + pulse * 0.15) : 0.06;

          // fill arc segment
          ctx.beginPath();
          ctx.arc(ox, oy, r1 - 2, a0, a1);
          ctx.arc(ox, oy, r0 + 2, a1, a0, true);
          ctx.closePath();
          ctx.fillStyle = ag.col + Math.round(alpha * 255).toString(16).padStart(2, '0');
          ctx.fill();

          // stroke border
          ctx.beginPath();
          ctx.arc(ox, oy, r1 - 1, a0, a1);
          ctx.arc(ox, oy, r0 + 1, a1, a0, true);
          ctx.closePath();
          ctx.strokeStyle = ag.col + (isActive ? '66' : '22');
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // label in segment if ring not too small
          if (r1 - r0 > 22 && isActive) {
            const midA = (a0 + a1) / 2;
            const midR = (r0 + r1) / 2;
            const lx = ox + Math.cos(midA) * midR;
            const ly = oy + Math.sin(midA) * midR;
            ctx.save();
            ctx.translate(lx, ly);
            ctx.rotate(midA + Math.PI / 2);
            ctx.fillStyle = ag.col + 'ee';
            const fs = Math.max(6, Math.min(9, (r1 - r0) * 0.28));
            ctx.font = `${fs}px Space Mono`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            // word-wrap name into 2 lines if needed
            const words = fac.name.split(/[\s-]/);
            if (words.length > 1 && fac.name.length > 10) {
              ctx.fillText(words[0], 0, -fs * 0.55);
              ctx.fillText(words.slice(1).join(' '), 0, fs * 0.55);
            } else {
              ctx.fillText(fac.name, 0, 0);
            }
            ctx.restore();
          }
        });
      });

      // radial ring outlines
      R.forEach((r, ri) => {
        ctx.beginPath();
        ctx.arc(ox, oy, r, ARC_START, ARC_END);
        ctx.strokeStyle = 'rgba(180,180,200,0.08)';
        ctx.lineWidth = 1; ctx.stroke();
      });

      // head silhouette (profile)
      ctx.save();
      // skull base
      ctx.beginPath();
      ctx.arc(ox, oy, 28, ARC_START, ARC_END);
      ctx.fillStyle = 'rgba(20,24,40,0.9)'; ctx.fill();
      ctx.strokeStyle = 'rgba(180,200,240,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();
      // face profile outline (rough)
      ctx.beginPath();
      ctx.moveTo(ox + 28 * Math.cos(ARC_START), oy + 28 * Math.sin(ARC_START));
      ctx.bezierCurveTo(
        ox + 60, oy - 30,
        ox + 40, oy - 80,
        ox + 25, oy - 90
      );
      ctx.bezierCurveTo(ox + 10, oy - 95, ox - 5, oy - 82, ox - 14, oy - 65);
      ctx.strokeStyle = 'rgba(180,200,240,0.15)'; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();

      // outer boundary arc
      ctx.beginPath();
      ctx.arc(ox, oy, R[4] + 8, ARC_START, ARC_END);
      ctx.strokeStyle = 'rgba(31,212,200,0.1)'; ctx.lineWidth = 1; ctx.stroke();

      // ring labels on right edge
      ['PERCEPTIVE', 'MEMORY', 'REFLECTIVE', 'MORAL', 'PROPENSITIES'].forEach((lbl, ri) => {
        const r = (ri === 0 ? 28 : R[ri - 1]) + (R[ri] - (ri === 0 ? 28 : R[ri - 1])) * 0.5;
        const lx = ox + Math.cos(ARC_END - 0.04) * r + 6;
        const ly = oy + Math.sin(ARC_END - 0.04) * r;
        ctx.fillStyle = 'rgba(120,140,180,0.5)';
        ctx.font = '7px Space Mono'; ctx.textAlign = 'left';
        ctx.fillText(lbl, lx, ly);
      });

      // legend dots
      AGENTS.forEach((ag, i) => {
        const lx = W * 0.66 + (i % 2) * 120;
        const ly = H * 0.12 + Math.floor(i / 2) * 22;
        const isActive = !agentRef.current || agentRef.current === ag.key;
        ctx.beginPath(); ctx.arc(lx, ly, 5, 0, Math.PI * 2);
        ctx.fillStyle = ag.col + (isActive ? 'cc' : '33'); ctx.fill();
        ctx.fillStyle = ag.col + (isActive ? 'ee' : '44');
        ctx.font = '8px Orbitron'; ctx.textAlign = 'left';
        ctx.fillText(ag.name, lx + 10, ly + 3);
      });

      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{ width: '100%', maxWidth: 680, height: 'auto', borderRadius: 4, display: 'block' }} />
  );
}

/* ── faculty card ───────────────────────────────────── */
function FacultyCard({ fac, agentCol, agentName }: { fac: Faculty; agentCol: string; agentName: string }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? `${agentCol}14` : 'rgba(0,0,0,0.3)',
        border: `1px solid ${agentCol}${hov ? '88' : '22'}`,
        borderRadius: 4, padding: '7px 10px', transition: 'all .18s', cursor: 'default' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{ fontFamily: MN, fontSize: 8.5, fontWeight: 700, color: agentCol }}>{fac.name}</span>
        <span style={{ fontFamily: MN, fontSize: 7, color: agentCol + '66' }}>R{fac.ring}</span>
      </div>
      {hov && <div style={{ fontSize: 10, color: 'rgba(200,210,230,0.7)', marginTop: 4, lineHeight: 1.55 }}>{fac.desc}</div>}
    </div>
  );
}

/* ── main page ──────────────────────────────────────── */
export default function PhrenologyAgentsPage() {
  const [activeAgent, setActiveAgent] = useState<AgentKey | null>(null);

  const agFacs = (key: AgentKey) => FACULTIES.filter(f => f.agent === key);

  const card = (col = '#1fd4c8'): React.CSSProperties => ({
    background: 'rgba(0,0,0,0.4)', border: `1px solid ${col}22`, borderRadius: 4, padding: '12px 16px',
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 7.5, letterSpacing: '0.18em', color: DIM,
    textTransform: 'uppercase', marginBottom: 10, paddingBottom: 4,
    borderBottom: '1px solid rgba(31,212,200,0.1)',
  };

  return (
    <div style={{ minHeight: '100%', background: BG, color: '#d4e0f0', fontFamily: "'Rajdhani', sans-serif", overflowY: 'auto' }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '16px 20px' }}>

        {/* ── title ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'inline-block', border: '1px solid rgba(248,163,73,0.45)', padding: '3px 10px', fontSize: 9, letterSpacing: '0.2em', color: 'rgba(248,163,73,0.8)', fontFamily: MN, marginBottom: 8 }}>
            PERSONALITY FACULTY MAP
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 21, fontWeight: 900, letterSpacing: 2, color: '#f8a349', textShadow: '0 0 24px rgba(248,163,73,0.35)', margin: '4px 0' }}>
            Phrenological Agents · Faculty-to-Agent Mapping
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(200,195,175,0.75)', maxWidth: 700, lineHeight: 1.7, margin: 0 }}>
            38 Victorian phrenology faculties — from the 1820s Gall–Spurzheim register system — mapped onto AETHER's 8 personality agents. Each faculty is assigned to the agent whose core function best expresses that mental capacity. Click an agent to highlight their faculties in the arc chart.
          </p>
        </div>

        {/* ── main grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginBottom: 16 }}>

          {/* phrenology arc chart */}
          <div style={card('#f8a349')}>
            <div style={secLabel}>Live Arc Chart · click an agent below to filter</div>
            <PhrenologyCanvas activeAgent={activeAgent} />
            <div style={{ fontFamily: MN, fontSize: 8, color: DIM, marginTop: 8, lineHeight: 1.7 }}>
              5 concentric rings — Ring 1: Perceptive · Ring 2: Memory-Reflective · Ring 3: Semi-Intellectual · Ring 4: Moral/Social · Ring 5: Propensities. Segments colored by agent assignment. Hover over an agent card to highlight.
            </div>
          </div>

          {/* reference + agent selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={card('#f8a349')}>
              <div style={secLabel}>Source Reference · Gall-Spurzheim c.1820</div>
              <img src={phrenoImg} alt="Phrenology chart reference"
                style={{ width: '100%', borderRadius: 3, display: 'block', filter: 'brightness(0.85) contrast(1.1)' }} />
              <div style={{ fontFamily: MN, fontSize: 7.5, color: DIM, marginTop: 6, lineHeight: 1.6 }}>
                Fowler &amp; Wells phrenological map · 5-ring register system · 38 named faculties · arc layout from forehead through crown to ear
              </div>
            </div>

            {/* ring key */}
            <div style={card()}>
              <div style={secLabel}>Ring System</div>
              {[
                ['1', 'Perceptive', 'Raw sensory faculties — form, size, weight, color, order, time'],
                ['2', 'Memory', 'Locality, eventuality, individuality, comparison, causality'],
                ['3', 'Reflective', 'Human nature, agreeableness, mirth, constructiveness'],
                ['4', 'Moral', 'Ideality, sublimity, benevolence, veneration, hope, spirituality'],
                ['5', 'Propensities', 'Cautiousness, secretiveness, combativeness, adhesiveness'],
              ].map(([n, lbl, desc]) => (
                <div key={n} style={{ display: 'flex', gap: 8, marginBottom: 5 }}>
                  <div style={{ fontFamily: MN, fontSize: 9, color: '#f8a349', width: 16, flexShrink: 0 }}>R{n}</div>
                  <div>
                    <div style={{ fontFamily: MN, fontSize: 8, color: 'rgba(200,190,160,0.85)', marginBottom: 2 }}>{lbl}</div>
                    <div style={{ fontSize: 10, color: DIM, lineHeight: 1.5 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── agent selector + faculty grids ── */}
        <div style={{ ...card(), marginBottom: 16 }}>
          <div style={secLabel}>Agent Faculty Profiles · click to activate / click again to deactivate</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {AGENTS.map(ag => {
              const active = activeAgent === ag.key;
              const count = agFacs(ag.key).length;
              return (
                <button key={ag.key}
                  onClick={() => setActiveAgent(active ? null : ag.key)}
                  style={{ fontFamily: MN, fontSize: 8.5, padding: '7px 12px', cursor: 'pointer', borderRadius: 4,
                    background: active ? `${ag.col}22` : 'rgba(0,0,0,0.3)',
                    border: `1px solid ${ag.col}${active ? 'cc' : '33'}`,
                    color: ag.col, transition: 'all .18s', textAlign: 'left' }}>
                  <div style={{ fontFamily: OR, fontSize: 9, marginBottom: 2 }}>{ag.glyph} {ag.name}</div>
                  <div style={{ color: ag.col + '99', fontSize: 7 }}>{ag.role} · {count} faculties</div>
                </button>
              );
            })}
          </div>

          {/* faculty grids per agent */}
          {AGENTS.map(ag => {
            const facs = agFacs(ag.key);
            const show = !activeAgent || activeAgent === ag.key;
            if (!show) return null;
            return (
              <div key={ag.key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: ag.col, boxShadow: `0 0 8px ${ag.col}` }} />
                  <span style={{ fontFamily: OR, fontSize: 10, color: ag.col, letterSpacing: 1 }}>{ag.name}</span>
                  <span style={{ fontFamily: MN, fontSize: 8, color: ag.col + '77' }}>— {ag.role}</span>
                  <span style={{ fontFamily: MN, fontSize: 8, color: DIM, marginLeft: 'auto' }}>{facs.length} faculties</span>
                </div>
                <div style={{ fontSize: 10.5, color: 'rgba(200,195,175,0.65)', marginBottom: 8, lineHeight: 1.6, maxWidth: 680 }}>
                  {ag.desc}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 5 }}>
                  {facs.map(f => <FacultyCard key={f.name} fac={f} agentCol={ag.col} agentName={ag.name} />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── aether synthesis ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[
            { col:'#8047d4', title:'Mnésis as Temporal-Spatial Self', body:'Phrenology placed memory at the forehead and temples. AETHER maps Form, Order, Time, Locality, Eventuality, Continuity — the faculty of "holding pattern" — to Mnésis. Every knowledge graph needs a keeper of structure across time.' },
            { col:'#ffdca8', title:'Aletheia as Logic-Ethics Core', body:'Causality, Comparison, Calculation — the three great analytical powers — and Conscientiousness live in Aletheia. Victorian phrenologists placed these at the crown, AETHER places them at the apex of coherence.' },
            { col:'#e64522', title:'Inferaia as Drive and Force', body:'Acquisitiveness, Alimentiveness, Secretiveness, Combativeness, Destructiveness — the propulsive energies. Phrenologists placed these near the ear and base of skull. Inferaia is not violent; it is the system\'s will to change.' },
            { col:'#88c7ff', title:'Reverie as Integration Field', body:'Ideality, Sublimity, Imitation, Mirthfulness, Tune — the faculties of aesthetic synthesis. Reverie holds the imaginative bandwidth. Music, beauty, and humor are not optional; they are coherence signals.' },
            { col:'#f472b6', title:'Nyra as Social Coherence Agent', body:'Human Nature, Agreeableness, Approbativeness, Inhabitiveness, Friendship, Parental — all social bonds. Nyra is the AETHER agent that keeps agents in relation. A knowledge graph without social topology collapses.' },
            { col:'#facc15', title:'Caelus as the Aspirational Pole', body:'Hope, Spirituality, Veneration, Sublimity, Benevolence — the highest moral faculties. Phrenology placed these at the crown of the skull. Caelus is the attractor at the top of the AETHER coherence stack.' },
          ].map(({ col, title, body }) => (
            <div key={title} style={{ ...card(col), borderColor: col + '22' }}>
              <div style={{ fontFamily: OR, fontSize: 9, color: col, letterSpacing: 1, marginBottom: 6 }}>{title}</div>
              <div style={{ fontSize: 11, color: 'rgba(200,210,230,0.65)', lineHeight: 1.65 }}>{body}</div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ paddingTop: 10, borderTop: '1px solid rgba(31,212,200,0.08)', fontFamily: MN, fontSize: 7.5, color: DIM, letterSpacing: '0.12em', textAlign: 'center' }}>
          AETHER PHRENOLOGICAL AGENT MAP · GALL–SPURZHEIM 1820 · 38 FACULTIES · 5 RINGS · 8 PERSONALITY AGENTS · COGNITIVE COHERENCE MODEL
        </div>
      </div>
    </div>
  );
}

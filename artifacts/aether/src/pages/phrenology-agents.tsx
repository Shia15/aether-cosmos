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

/* ── opacity clock canvas ───────────────────────────── */
const CLOCK_ORDER: AgentKey[] = [
  'mnesis','aletheia','inferaia','reverie','verus','caelus','nyra','orin',
];

function OpacityClockCanvas({ activeAgent }: { activeAgent: AgentKey | null }) {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const agRef  = useRef(activeAgent);
  agRef.current = activeAgent;

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    cv.width = 400; cv.height = 400;
    const W = cv.width, H = cv.height;
    const cx = W / 2, cy = H / 2;
    const IR = 56;   // inner void radius
    const OR = 155;  // outer ring radius
    const SEG  = (Math.PI * 2) / 8;
    const SA   = -Math.PI / 2; // start at 12 o'clock

    // faculty counts
    const COUNTS: Record<string, number> = {};
    for (const ag of AGENTS) COUNTS[ag.key] = FACULTIES.filter(f => f.agent === ag.key).length;
    const MAX_C = Math.max(...Object.values(COUNTS));

    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const active = agRef.current;

      // sweep hand angle — one revolution every ~10 s at 60fps
      const handA = SA + t * 0.0105;

      // ── draw each segment ──────────────────────────────
      CLOCK_ORDER.forEach((key, i) => {
        const ag     = AGENTS.find(a => a.key === key)!;
        const count  = COUNTS[key] ?? 0;
        const base   = count / MAX_C;   // 0–1 opacity weight
        const segS   = SA + i * SEG;
        const segE   = segS + SEG;
        const midA   = segS + SEG / 2;

        // is sweep hand inside this segment?
        const norm   = ((handA - SA) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const segN   = i * SEG;
        const inSeg  = norm >= segN && norm < segN + SEG;

        const pulse  = 0.68 + 0.32 * Math.sin(t * 0.048 + i * 0.9);
        const isAct  = !active || active === key;
        let alpha: number;
        if (!active) {
          alpha = base * (0.22 + 0.12 * pulse) + (inSeg ? 0.38 : 0);
        } else if (isAct) {
          alpha = 0.45 + 0.42 * pulse;
        } else {
          alpha = 0.035;
        }
        alpha = Math.min(1, alpha);

        const fill   = ag.col + Math.round(alpha * 255).toString(16).padStart(2, '0');
        const stroke = ag.col + (isAct ? (active ? '70' : '30') : '15');

        // pie wedge
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, OR, segS + 0.022, segE - 0.022);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();

        // thin border arc
        ctx.beginPath();
        ctx.arc(cx, cy, OR - 0.5, segS + 0.02, segE - 0.02);
        ctx.arc(cx, cy, IR + 0.5, segE - 0.02, segS + 0.02, true);
        ctx.closePath();
        ctx.strokeStyle = stroke;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // hand-in-segment flash stripe
        if (inSeg) {
          const flashA = SA + norm + segN / 2; // already normalised
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, OR, segS + 0.022, segE - 0.022);
          ctx.closePath();
          ctx.clip();
          const grad = ctx.createRadialGradient(cx, cy, IR, cx, cy, OR);
          grad.addColorStop(0, ag.col + '00');
          grad.addColorStop(0.5, ag.col + '22');
          grad.addColorStop(1, ag.col + '00');
          ctx.fillStyle = grad;
          ctx.fill();
          ctx.restore();
        }

        // glyph + name inside segment
        if (isAct) {
          const glR = (IR + OR) / 2;
          const gx  = cx + Math.cos(midA) * glR;
          const gy  = cy + Math.sin(midA) * glR;

          ctx.save();
          ctx.translate(gx, gy);
          ctx.rotate(midA + Math.PI / 2);
          // glyph
          ctx.fillStyle = ag.col + (active ? 'ff' : 'bb');
          ctx.font = `${active ? 17 : 13}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ag.glyph, 0, -9);
          // name
          ctx.fillStyle = ag.col + (active ? 'cc' : '77');
          ctx.font = `6.5px Space Mono`;
          ctx.fillText(ag.name.toUpperCase(), 0, 5);
          ctx.restore();
        }
      });

      // ── outer tick ring ───────────────────────────────
      for (let ti = 0; ti < 96; ti++) {
        const tickA  = SA + (ti * Math.PI * 2) / 96;
        const isMaj  = ti % 12 === 0;  // agent boundary
        const isMed  = ti % 4 === 0;
        const tOR    = OR + 3;
        const tLen   = isMaj ? 9 : isMed ? 5 : 3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(tickA) * tOR, cy + Math.sin(tickA) * tOR);
        ctx.lineTo(cx + Math.cos(tickA) * (tOR + tLen), cy + Math.sin(tickA) * (tOR + tLen));
        ctx.strokeStyle = isMaj ? 'rgba(248,163,73,0.55)' : 'rgba(90,100,130,0.22)';
        ctx.lineWidth   = isMaj ? 1.2 : 0.6;
        ctx.stroke();
      }

      // faculty-count badge just outside each tick boundary
      CLOCK_ORDER.forEach((key, i) => {
        const active = agRef.current;
        if (active && active !== key) return;
        const ag    = AGENTS.find(a => a.key === key)!;
        const midA  = SA + i * SEG + SEG / 2;
        const badgeR = OR + 20;
        const bx = cx + Math.cos(midA) * badgeR;
        const by = cy + Math.sin(midA) * badgeR;
        ctx.fillStyle = ag.col + (active ? 'ee' : '88');
        ctx.font = '8px Space Mono';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${COUNTS[key]}`, bx, by);
      });

      // ── sweep hand ───────────────────────────────────
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(handA);
      // glow pass
      ctx.beginPath();
      ctx.moveTo(0, IR + 2);
      ctx.lineTo(0, -(OR - 5));
      ctx.strokeStyle = 'rgba(31,212,200,0.28)';
      ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.stroke();
      // sharp hand
      ctx.beginPath();
      ctx.moveTo(0, IR + 2);
      ctx.lineTo(0, -(OR - 5));
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // pivot dot
      ctx.beginPath();
      ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(31,212,200,0.9)'; ctx.fill();
      ctx.restore();

      // ── inner void / donut hole ───────────────────────
      ctx.beginPath();
      ctx.arc(cx, cy, IR, 0, Math.PI * 2);
      ctx.fillStyle = BG; ctx.fill();
      ctx.strokeStyle = 'rgba(248,163,73,0.22)'; ctx.lineWidth = 1; ctx.stroke();

      // ── center label ─────────────────────────────────
      const ag = active ? AGENTS.find(a => a.key === active) : null;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if (ag) {
        ctx.fillStyle = ag.col;
        ctx.font = '20px serif';
        ctx.fillText(ag.glyph, cx, cy - 9);
        ctx.fillStyle = ag.col + 'cc';
        ctx.font = '7px Space Mono';
        ctx.fillText(ag.name.toUpperCase(), cx, cy + 7);
        ctx.fillStyle = ag.col + '88';
        ctx.font = '6px Space Mono';
        ctx.fillText(`${COUNTS[ag.key]} FACULTIES`, cx, cy + 18);
      } else {
        ctx.fillStyle = 'rgba(248,163,73,0.65)';
        ctx.font = '8px Orbitron';
        ctx.fillText('AETHER', cx, cy - 6);
        ctx.fillStyle = 'rgba(90,110,150,0.5)';
        ctx.font = '6px Space Mono';
        ctx.fillText('OPACITY CLOCK', cx, cy + 6);

        // mini opacity legend: ring of tiny squares showing count→opacity
        const lR = IR - 16;
        for (let li = 0; li < 8; li++) {
          const la  = SA + li * SEG + SEG / 2;
          const lx  = cx + Math.cos(la) * lR;
          const ly  = cy + Math.sin(la) * lR;
          const key = CLOCK_ORDER[li];
          const ag2 = AGENTS.find(a => a.key === key)!;
          const op  = (COUNTS[key] / MAX_C) * 0.8 + 0.1;
          ctx.beginPath();
          ctx.arc(lx, ly, 3, 0, Math.PI * 2);
          ctx.fillStyle = ag2.col + Math.round(op * 255).toString(16).padStart(2, '0');
          ctx.fill();
        }
      }

      t++;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{ width: '100%', maxWidth: 400, height: 'auto', display: 'block', margin: '0 auto',
        borderRadius: '50%', boxShadow: '0 0 40px rgba(248,163,73,0.08)' }} />
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

        {/* ── opacity clock ── */}
        <div style={{ ...card('#f8a349'), marginBottom: 16 }}>
          <div style={secLabel}>Opacity Clock · faculty weight by agent · segment brightness = faculty count</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            <OpacityClockCanvas activeAgent={activeAgent} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
              <div style={{ fontFamily: MN, fontSize: 8, color: 'rgba(200,190,160,0.7)', lineHeight: 1.8 }}>
                Eight equal clock segments — one per AETHER agent — arranged clockwise from 12 o'clock.
                Segment opacity encodes the number of Gall–Spurzheim faculties assigned to that agent.
                The sweeping hand traverses all eight, brightening each segment as it passes.
                Click any agent button to lock that segment to full opacity and dim the rest.
              </div>
              {/* opacity scale legend */}
              <div style={{ fontFamily: MN, fontSize: 7.5, color: DIM, marginBottom: 6, letterSpacing: '0.1em' }}>
                FACULTY WEIGHT · OPACITY SCALE
              </div>
              {[...CLOCK_ORDER].map(key => {
                const ag = AGENTS.find(a => a.key === key)!;
                const count = FACULTIES.filter(f => f.agent === key).length;
                const maxC  = Math.max(...AGENTS.map(a => FACULTIES.filter(f => f.agent === a.key).length));
                const pct   = Math.round((count / maxC) * 100);
                const isA   = !activeAgent || activeAgent === key;
                return (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: isA ? 1 : 0.25, transition: 'opacity .2s' }}>
                    <div style={{ width: 36, height: 8, borderRadius: 2,
                      background: `linear-gradient(to right, ${ag.col}18, ${ag.col})`,
                      opacity: count / maxC,
                      border: `1px solid ${ag.col}33` }} />
                    <span style={{ fontFamily: MN, fontSize: 8, color: ag.col, width: 60 }}>{ag.name}</span>
                    <div style={{ flex: 1, height: 2, borderRadius: 1, background: `${ag.col}20`, position: 'relative' as const }}>
                      <div style={{ position: 'absolute' as const, left: 0, top: 0, height: '100%', width: `${pct}%`, background: ag.col, borderRadius: 1, transition: 'width .3s' }} />
                    </div>
                    <span style={{ fontFamily: MN, fontSize: 7.5, color: ag.col + '88', width: 24, textAlign: 'right' as const }}>{count}</span>
                  </div>
                );
              })}
              <div style={{ fontFamily: MN, fontSize: 7, color: DIM, marginTop: 4, lineHeight: 1.7 }}>
                ◆ Mnésis &amp; Nyra lead with 6 faculties each · Vērus holds fewest (3) ·
                sweep period ≈ 10 s · select an agent to isolate
              </div>
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

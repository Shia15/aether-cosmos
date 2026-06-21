import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

const B = {
  bg: "#070918",
  ink: "#E7ECF7",
  dim: "#9AA3B8",
  gold: "#E6B85C",
  cyan: "#7CD7FF",
  green: "#7CE0B0",
  amber: "#F2A007",
  rose: "#F49AB6",
  violet: "#B49CFF",
  pearl: "#E8E2F2",
  panel: "rgba(255,255,255,0.04)",
  line: "rgba(255,255,255,0.10)",
};

/* ------------------------------------------------------------------ */
/*  Helpers (palette B)                                                 */
/* ------------------------------------------------------------------ */
function Card({ accent, children, style }: { accent: string; children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: B.panel, border: `1px solid ${B.line}`,
      borderTop: `2px solid ${accent}`, borderRadius: 6, padding: 16, ...style,
    }}>{children}</div>
  );
}
function H({ num, label, accent }: { num: string; label: string; accent: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.2, color: B.dim, textTransform: "uppercase" }}>
        Section <span style={{ color: accent }}>{num}</span>
      </div>
      <h2 style={{ fontFamily: '"Cinzel", serif', fontSize: 26, color: B.ink, fontVariant: "small-caps", letterSpacing: 1, margin: 0, fontWeight: 500 }}>{label}</h2>
    </div>
  );
}
function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  return (
    <Link
      href={to}
      data-testid={`bridge-${to.slice(1)}`}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px", textDecoration: "none",
        background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `2px solid ${accent}`, borderRadius: 4,
      }}
    >
      <ArrowUpRight size={16} color={accent} />
      <div>
        <div style={{ fontFamily: '"Cinzel", serif', fontSize: 14, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.5 }}>{label}</div>
        <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 2 }}>{sub}</div>
      </div>
    </Link>
  );
}
function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 999,
      background: `${color}22`, color, border: `1px solid ${color}55`,
      fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.4, textTransform: "uppercase",
    }}>{children}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Glyphs                                                              */
/* ------------------------------------------------------------------ */

/* The Egg — the housing of the transformation engine */
function EggGlyph() {
  return (
    <svg viewBox="0 0 220 260" width="100%" style={{ display: "block" }} role="img" aria-label="The AETHER egg — outer shell, inner field, central seed">
      <defs>
        <radialGradient id="eggGlow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor={B.gold} stopOpacity={0.25} />
          <stop offset="60%" stopColor={B.violet} stopOpacity={0.10} />
          <stop offset="100%" stopColor={B.bg} stopOpacity={0} />
        </radialGradient>
      </defs>
      {/* outer egg shell */}
      <ellipse cx={110} cy={140} rx={78} ry={108} fill="url(#eggGlow)" stroke={B.gold} strokeWidth={1.4} />
      {/* inner field */}
      <ellipse cx={110} cy={140} rx={56} ry={82} fill="none" stroke={B.violet} strokeWidth={0.8} strokeDasharray="3 4" opacity={0.6} />
      {/* horizontal flow lines (filtering layers) */}
      {[80, 110, 140, 170, 200].map((y, i) => (
        <line
          key={i}
          x1={110 - Math.sqrt(Math.max(0, 82 * 82 - (y - 140) * (y - 140))) * 56 / 82}
          y1={y}
          x2={110 + Math.sqrt(Math.max(0, 82 * 82 - (y - 140) * (y - 140))) * 56 / 82}
          y2={y}
          stroke={B.cyan} strokeWidth={0.7} opacity={0.45}
        />
      ))}
      {/* seed */}
      <circle cx={110} cy={140} r={10} fill={B.gold} opacity={0.92} />
      <circle cx={110} cy={140} r={18} fill="none" stroke={B.gold} strokeWidth={0.9} opacity={0.55} />
      {/* labels */}
      <text x={110} y={36} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>shell · containment</text>
      <text x={110} y={252} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.6} style={{ textTransform: "uppercase" }}>seed · the part that remembers</text>
    </svg>
  );
}

/* The Trance — descent diagram (5 stages) */
function TranceGlyph() {
  const stages = [
    { y: 30,  label: "Encoding fault",   c: B.amber  },
    { y: 70,  label: "Forgotten moment", c: B.amber  },
    { y: 110, label: "Cognitive drift",  c: B.rose   },
    { y: 150, label: "Identity erosion", c: B.rose   },
    { y: 190, label: "Open to rewrite",  c: B.violet },
  ];
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ display: "block" }} role="img" aria-label="The trance — five-stage descent from memory fault to vulnerability">
      <line x1={20} y1={20} x2={20} y2={210} stroke={B.line} strokeWidth={1} />
      {stages.map((s, i) => (
        <g key={i}>
          <circle cx={20} cy={s.y} r={5.5} fill={s.c} />
          {i < stages.length - 1 && (
            <line x1={20} y1={s.y + 6} x2={20} y2={stages[i + 1].y - 6} stroke={s.c} strokeWidth={1.1} opacity={0.55} />
          )}
          <text x={36} y={s.y + 4} fontSize={11.5} fill={B.ink} fontFamily="Inter, sans-serif">{s.label}</text>
        </g>
      ))}
      <text x={20} y={14} fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>start</text>
    </svg>
  );
}

/* The Way Back — two-step return loop */
function WayBackGlyph() {
  return (
    <svg viewBox="0 0 320 200" width="100%" style={{ display: "block" }} role="img" aria-label="The way back — see the fog, then drop the mask">
      {/* node 1 */}
      <circle cx={70} cy={100} r={28} fill="none" stroke={B.cyan} strokeWidth={1.6} />
      <text x={70} y={96}  textAnchor="middle" fontSize={10.5} fill={B.ink} fontFamily="Inter, sans-serif" fontWeight={600}>step 01</text>
      <text x={70} y={110} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif">see the fog</text>
      {/* arrow */}
      <line x1={102} y1={100} x2={218} y2={100} stroke={B.gold} strokeWidth={1.3} />
      <polygon points="218,100 210,96 210,104" fill={B.gold} />
      {/* node 2 */}
      <circle cx={250} cy={100} r={28} fill="none" stroke={B.green} strokeWidth={1.6} />
      <text x={250} y={96}  textAnchor="middle" fontSize={10.5} fill={B.ink} fontFamily="Inter, sans-serif" fontWeight={600}>step 02</text>
      <text x={250} y={110} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif">drop the mask</text>
      {/* return loop */}
      <path d="M 250 128 Q 160 175 70 128" fill="none" stroke={B.violet} strokeWidth={1.1} strokeDasharray="4 4" opacity={0.7} />
      <polygon points="70,128 78,124 78,132" fill={B.violet} opacity={0.7} />
      <text x={160} y={170} textAnchor="middle" fontSize={9.5} fill={B.violet} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>recursive · reinforce</text>
      {/* fog */}
      <text x={70} y={42} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>perceive · don't fight</text>
      <text x={250} y={42} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" letterSpacing={1.4} style={{ textTransform: "uppercase" }}>release · don't perform</text>
    </svg>
  );
}

/* table primitives */
function Th({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <th style={{
      textAlign: "left", padding: "10px 12px",
      fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6,
      textTransform: "uppercase", color: accent || B.dim,
      borderBottom: `1px solid ${B.line}`, fontWeight: 500, whiteSpace: "nowrap",
    }}>{children}</th>
  );
}
function Td({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <td style={{
      padding: "10px 12px",
      fontFamily: "Inter, sans-serif",
      fontSize: 12.5,
      color: color || B.ink,
      borderBottom: `1px solid ${B.line}`,
      verticalAlign: "top",
      lineHeight: 1.55,
    }}>{children}</td>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
function EggEngineCanvas() {
  const ref = React.useRef<HTMLCanvasElement>(null);
  const rafRef = React.useRef(0);
  React.useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 260;
    const W = canvas.width, H = canvas.height;
    const cx = W/2, cy = H/2;
    const rings = [
      { r:28, col:"#c9a84c", label:"EGG", speed:0.000 },
      { r:52, col:"#2ef0d8", label:"SEE THE FOG", speed:0.018 },
      { r:76, col:"#9966ff", label:"DROP THE MASK", speed:-0.013 },
      { r:100, col:"#ff4477", label:"REINFORCE", speed:0.010 },
    ];
    const sparks: {ang:number;r:number;col:string;v:number}[] = [];
    for (let i=0;i<40;i++) sparks.push({ ang:Math.random()*Math.PI*2, r:rings[Math.floor(Math.random()*rings.length)].r, col:rings[Math.floor(Math.random()*rings.length)].col, v:(Math.random()-0.5)*0.06 });
    let t=0;
    const draw = () => {
      ctx.fillStyle = "rgba(4,7,14,0.18)"; ctx.fillRect(0,0,W,H);
      t++;
      rings.forEach((rn,ri) => {
        const pulse=1+0.1*Math.sin(t*0.04+ri*1.2);
        const g=ctx.createRadialGradient(cx,cy,rn.r*0.6,cx,cy,rn.r*pulse*1.3);
        g.addColorStop(0,"transparent"); g.addColorStop(0.8,rn.col+"22"); g.addColorStop(1,"transparent");
        ctx.beginPath(); ctx.arc(cx,cy,rn.r*pulse,0,Math.PI*2);
        ctx.strokeStyle=rn.col+(ri===0?"ff":"88"); ctx.lineWidth=ri===0?3:1.5;
        ctx.shadowColor=rn.col; ctx.shadowBlur=ri===0?24:12; ctx.stroke(); ctx.shadowBlur=0;
        ctx.fillStyle=g; ctx.fill();
        if (ri>0) {
          ctx.fillStyle=rn.col; ctx.font="bold 8px 'DM Mono',monospace"; ctx.textAlign="center";
          ctx.shadowColor=rn.col; ctx.shadowBlur=4;
          ctx.fillText(rn.label, cx, cy-rn.r*pulse-6); ctx.shadowBlur=0;
        }
      });
      ctx.fillStyle="#c9a84c"; ctx.font="bold 11px 'Cinzel',serif"; ctx.textAlign="center";
      ctx.shadowColor="#c9a84c"; ctx.shadowBlur=10;
      ctx.fillText("EGG", cx, cy+4); ctx.shadowBlur=0;
      sparks.forEach(s => {
        s.ang+=s.v; const r2=s.r+(Math.sin(s.ang*3)*4);
        const px=cx+Math.cos(s.ang)*r2, py=cy+Math.sin(s.ang)*r2;
        ctx.beginPath(); ctx.arc(px,py,1.5,0,Math.PI*2);
        ctx.fillStyle=s.col+"cc"; ctx.shadowColor=s.col; ctx.shadowBlur=6; ctx.fill(); ctx.shadowBlur=0;
      });
      const steps=[{l:"FOG",x:cx-260,col:"#2ef0d8"},{l:"MASK",x:cx-130,col:"#9966ff"},{l:"REINFORCE",x:cx+130,col:"#ff4477"},{l:"RETURN",x:cx+260,col:"#c9a84c"}];
      steps.forEach(s=>{
        ctx.fillStyle=s.col; ctx.font="bold 8px 'DM Mono',monospace"; ctx.textAlign="center";
        ctx.fillText(s.l,s.x,H-14);
      });
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function AetherEggEnginePage() {
  return (
    <div style={{ background: B.bg, minHeight: "100vh", color: B.ink, padding: "40px 28px 72px" }} data-testid="page-aether-egg-engine">
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        <div style={{ marginBottom:24 }}>
          <div style={{ display:"inline-block", background:"rgba(201,168,76,0.08)", border:"1px solid rgba(201,168,76,0.25)",
            borderRadius:8, padding:"0.3rem 1rem", fontSize:"0.7rem", letterSpacing:"0.2em",
            color:B.gold, textTransform:"uppercase", fontFamily:"Inter,sans-serif", marginBottom:12 }}>
            Live Simulation
          </div>
          <div style={{ background:"rgba(4,7,14,0.8)", border:"1px solid rgba(201,168,76,0.12)",
            borderLeft:`3px solid ${B.gold}`, borderRadius:10, padding:20 }}>
            <h2 style={{ fontFamily:"Cinzel,serif", fontSize:18, color:B.ink, margin:"0 0 6px" }}>
              Egg Engine · Positive Mental Reinforcement · See Fog → Drop Mask → Reinforce
            </h2>
            <p style={{ fontFamily:"Inter,sans-serif", fontSize:12, color:"rgba(200,190,150,0.5)", margin:"0 0 14px", lineHeight:1.65 }}>
              A golden EGG core radiating four concentric resonance rings (Fog/teal · Mask/violet · Reinforce/rose)
              with orbital sparks traveling along each ring — the personal operating model for the two-step return
              to clarity, as implemented inside AETHER.
            </p>
            <EggEngineCanvas />
          </div>
        </div>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 2.6, color: B.gold, textTransform: "uppercase" }}>
            AETHER · Transformation System
          </div>
          <h1 style={{ fontFamily: '"Cinzel", serif', fontSize: 40, color: B.ink, fontVariant: "small-caps", letterSpacing: 1.5, margin: "6px 0 10px", fontWeight: 500 }}>
            The Egg Engine · Positive Mental Reinforcement
          </h1>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 14, color: B.dim, lineHeight: 1.65, maxWidth: 820 }}>
            The egg is the housing. Inside it, every page in this knowledge system is gathered, filtered,
            and routed back into a single structured loop: <em>see the fog → drop the mask → reinforce the part that remembers</em>.
            What follows is not a clinical protocol — it is a personal operating model written in the same grammar as the rest of AETHER.
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Chip color={B.gold}>v0.1 · framework</Chip>
            <Chip color={B.violet}>self-applied · not therapy</Chip>
            <Chip color={B.cyan}>two-step return</Chip>
          </div>
        </div>

        {/* §01 What the Engine Is */}
        <section style={{ marginBottom: 36 }}>
          <H num="01" label="What the Egg Engine Is" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 16 }}>
            <Card accent={B.gold}>
              <EggGlyph />
            </Card>
            <Card accent={B.gold}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.7 }}>
                The egg is a <strong>containment shape</strong> with three layers:
                <ul style={{ paddingLeft: 18, marginTop: 10, marginBottom: 10 }}>
                  <li><span style={{ color: B.gold }}>Shell</span> — the boundary of the self under stress. It is not the enemy. It is what kept the seed alive while the storm passed.</li>
                  <li><span style={{ color: B.cyan }}>Field</span> — the filtering layer where every signal from the rest of the knowledge system (memory, body, season, sun, culture) is run through one question: <em>does this reinforce the seed, or distract it?</em></li>
                  <li><span style={{ color: B.gold }}>Seed</span> — the part of you that <em>remembers</em>, even after the trance. The engine is built around this premise: it is still there.</li>
                </ul>
                The engine's job is to take the descent described in §02, and route it through the two steps in §03 until reinforcement is louder than drift.
              </div>
              <div style={{ marginTop: 10 }}>
                <Chip color={B.violet}>predicted · framework, not measurement</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §02 The Trance */}
        <section style={{ marginBottom: 36 }}>
          <H num="02" label="The Trance · Five Stages of the Descent" accent={B.rose} />
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)", gap: 16 }}>
            <Card accent={B.rose}>
              <TranceGlyph />
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>
                The descent is a <em>sequence</em>, not a single event. Each stage makes the next more available.
                Naming them is already step one: you cannot leave a state you do not recognise.
              </div>
            </Card>
            <Card accent={B.rose}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-trance-stages">
                  <thead>
                    <tr>
                      <Th accent={B.rose}>Stage</Th>
                      <Th>What you feel</Th>
                      <Th>What is happening</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { s: "Encoding fault",   f: "Today blurs with last week. Details slip.",    h: "Memory consolidation under-resourced.",         c: B.amber  },
                      { s: "Forgotten moment", f: "A specific anchor — a person, a promise — drops out.", h: "Episodic recall fails to retrieve a salient cue.", c: B.amber  },
                      { s: "Cognitive drift",  f: "Not curious. Not driven. Not unhappy — just absent.", h: "Default-mode rumination outweighs goal-state activity.", c: B.rose   },
                      { s: "Identity erosion", f: "I do not feel like me.",                         h: "Self-narrative coherence loosens.",              c: B.rose   },
                      { s: "Open to rewrite",  f: "I will believe almost any frame offered to me.", h: "High suggestibility. Reduced internal signal-to-noise.", c: B.violet },
                    ].map((row, i) => (
                      <tr key={i}>
                        <Td color={row.c}>{row.s}</Td>
                        <Td>{row.f}</Td>
                        <Td>{row.h}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop: 10 }}>
                <Chip color={B.violet}>predicted · model framing, not diagnosis</Chip>
              </div>
            </Card>
          </div>
        </section>

        {/* §03 Something inside remembers */}
        <section style={{ marginBottom: 36 }}>
          <H num="03" label="Something Inside Remembers" accent={B.cyan} />
          <Card accent={B.cyan}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.7 }}>
              The descent in §02 is real, but it is not total. There are <strong>anchors that survive the drift</strong> —
              fragments of self-narrative that the engine treats as <em>load-bearing</em>:
              <ul style={{ paddingLeft: 18, marginTop: 10, marginBottom: 10 }}>
                <li><span style={{ color: B.cyan }}>Bodily memory</span> — postures, gestures, breath patterns that re-cue identity faster than language can.</li>
                <li><span style={{ color: B.cyan }}>Affective tags</span> — a song, a place, a colour that still produces a clean, undiluted recognition.</li>
                <li><span style={{ color: B.cyan }}>Repeated values</span> — the same three or four commitments that keep returning even when motivation is gone.</li>
                <li><span style={{ color: B.cyan }}>Witnessed self</span> — the people who can describe you back to you accurately, even when you cannot.</li>
              </ul>
              The engine treats these not as nostalgia but as <em>structural reinforcement</em>: signals strong enough to bias the next loop back toward the seed.
              This is consistent with a memory-reconsolidation framing — when an anchor is reactivated in a safe context, the surrounding narrative becomes editable.
            </div>
            <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Chip color={B.cyan}>load-bearing anchors</Chip>
              <Chip color={B.violet}>predicted · grounded in reconsolidation literature</Chip>
            </div>
          </Card>
        </section>

        {/* §04 The Way Back */}
        <section style={{ marginBottom: 36 }}>
          <H num="04" label="The Way Back · Two Steps, Recursive" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: 16 }}>
            <Card accent={B.green}>
              <WayBackGlyph />
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 8, lineHeight: 1.55 }}>
                The two steps are not a one-shot exit. They are a <em>loop</em> the engine runs as often as the trance returns.
                Each pass strengthens the seed and weakens the shell's grip on identity.
              </div>
            </Card>
            <div style={{ display: "grid", gap: 12 }}>
              <Card accent={B.cyan}>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 16, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.6 }}>
                  Step 01 · See the fog · Don't fight the trance
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, marginTop: 8, lineHeight: 1.65 }}>
                  Naming the state is the entire move. Not <em>fixing</em> it — <em>witnessing</em> it.
                  Fighting the trance reinforces it; recognising it as a state (not as you) drains its authority.
                  The engine logs: <em>"this is the fog, again."</em>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip color={B.cyan}>perceive</Chip>
                  <Chip color={B.cyan}>label · don't argue</Chip>
                </div>
              </Card>
              <Card accent={B.green}>
                <div style={{ fontFamily: '"Cinzel", serif', fontSize: 16, color: B.ink, fontVariant: "small-caps", letterSpacing: 0.6 }}>
                  Step 02 · Drop the mask completely
                </div>
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: B.ink, marginTop: 8, lineHeight: 1.65 }}>
                  The mask is the performance built during stages 03–05 of the descent — the version of you assembled to keep the shell intact.
                  Dropping it is not a confession to anyone else; it is a private re-alignment to the seed.
                  The engine logs: <em>"the seed speaks; the shell relaxes."</em>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Chip color={B.green}>release</Chip>
                  <Chip color={B.green}>re-align to seed</Chip>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* §05 Reinforcement Engine */}
        <section style={{ marginBottom: 36 }}>
          <H num="05" label="Positive Reinforcement · How AETHER Filters the Data" accent={B.gold} />
          <Card accent={B.gold}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.7, marginBottom: 12 }}>
              The rest of this knowledge system is <em>fuel</em>. The egg engine routes each domain into a reinforcement role
              — a small, repeatable cue that strengthens the seed when the trance returns.
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-reinforcement-routing">
                <thead>
                  <tr>
                    <Th accent={B.gold}>Source domain</Th>
                    <Th>Cue it provides</Th>
                    <Th>Reinforcement role</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { d: "Heliospheric / Seasonal Coherence", q: "Where am I in the larger cycle?",  r: "Permission to be in a low phase without panic.", c: B.amber },
                    { d: "Neuroplasticity / Health",          q: "What is my body asking for?",      r: "Concrete next action — sleep, light, movement.",  c: B.rose  },
                    { d: "M.A.R.I. · Four-Egg Engine",        q: "Which agent is louder right now?", r: "Re-balance between memory, truth, fire, dream.",  c: B.violet },
                    { d: "Universal Grammar",                 q: "Is the pattern repeating?",        r: "Recognise the descent as a known shape, not a unique disaster.", c: B.pearl },
                    { d: "Cultural / Symbolic pages",         q: "What story have humans told here before?", r: "Reduce isolation. The trance is old, not new.", c: B.cyan },
                    { d: "Personal Operating Model",          q: "What did I commit to last time I was clear?", r: "Borrow authority from the previous coherent self.", c: B.green },
                  ].map((row, i) => (
                    <tr key={i}>
                      <Td color={row.c}>{row.d}</Td>
                      <Td>{row.q}</Td>
                      <Td>{row.r}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12 }}>
              <Chip color={B.violet}>predicted · routing layer, not therapy</Chip>
            </div>
          </Card>
        </section>

        {/* §06 What positive reinforcement is NOT */}
        <section style={{ marginBottom: 36 }}>
          <H num="06" label="What Positive Reinforcement Is Not" accent={B.amber} />
          <Card accent={B.amber}>
            <div style={{ fontFamily: "Inter, sans-serif", fontSize: 13.5, color: B.ink, lineHeight: 1.7 }}>
              The egg engine is deliberate about what it <em>refuses</em> to call positive reinforcement:
              <ul style={{ paddingLeft: 18, marginTop: 10, marginBottom: 0 }}>
                <li><strong>It is not forced positivity.</strong> The trance is real. Pretending it isn't is just a new mask.</li>
                <li><strong>It is not a clinical replacement.</strong> If the descent is severe or sustained, the correct move is professional support — the engine sits alongside, not instead of.</li>
                <li><strong>It is not a quick exit.</strong> The loop is recursive on purpose. Each pass is small.</li>
                <li><strong>It is not a performance for others.</strong> Step 02 is private. The seed does not require an audience.</li>
              </ul>
            </div>
          </Card>
        </section>

        {/* §07 Bridges */}
        <section style={{ marginBottom: 36 }}>
          <H num="07" label="Bridges · The Pages This Engine Filters" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 12 }}>
            <Bridge to="/agents"                  label="Agents · Four Eggs"               sub="The original M.A.R.I. four-egg engine"     accent={B.violet} />
            <Bridge to="/mari"                    label="M.A.R.I. · Resonance Engine"      sub="Mnésis · Aletheia · Reverie · Infernia"     accent={B.rose}   />
            <Bridge to="/heliospheric-coherence"  label="Heliospheric Coherence · 11-yr"   sub="The cycle that frames low phases"            accent={B.amber}  />
            <Bridge to="/seasonal-coherence"      label="Φ(t) · Seasonal Coherence"        sub="Permission to be in a low phase"             accent={B.gold}   />
            <Bridge to="/neuroplasticity"         label="Neuro Health · Plasticity"        sub="The body's contribution to the loop"         accent={B.rose}   />
            <Bridge to="/aether-health"           label="AETHER Health · Metabolic"        sub="Concrete physical reinforcers"               accent={B.green}  />
            <Bridge to="/universal-grammar"       label="Universal Grammar · Paper"        sub="The descent as a known shape"                accent={B.pearl}  />
            <Bridge to="/personal-operating-model" label="Personal Operating Model"        sub="Borrow authority from the clear self"        accent={B.cyan}   />
          </div>
        </section>

        {/* Footer */}
        <div style={{ marginTop: 36, padding: "16px 0", borderTop: `1px solid ${B.line}`, fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 0.6, textAlign: "center" }}>
          AETHER Research Division · April 2026 · Egg Engine v0.1 · Personal framework, not clinical protocol
        </div>

      </div>
    </div>
  );
}

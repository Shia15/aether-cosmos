import React, { useEffect, useRef } from "react";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import singleStepImg from "@assets/IMG_1462_1777522469652.jpeg";
import branchTreeImg from "@assets/IMG_1467_1777522469652.jpeg";

function EniacCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    canvas.width = 700; canvas.height = 220;
    const ctx = canvas.getContext("2d")!;
    const pts: { x:number; y:number; col:string }[] = [];
    let tick = 0;
    const loop = () => {
      tick++;
      if(tick%3===0&&pts.length<400){
        const t=Math.random()*Math.PI*2, r=Math.random()*80;
        pts.push({ x:350+r*Math.cos(t), y:110+r*Math.sin(t)*0.6, col:Math.random()<0.5?"#E6B85C":"#7CD7FF" });
      }
      ctx.clearRect(0,0,700,220);
      ctx.fillStyle="#070918"; ctx.fillRect(0,0,700,220);
      ctx.font="9px 'DM Mono',monospace";
      ctx.fillStyle="rgba(230,184,92,0.08)";
      ctx.fillText("ENIAC MONTE CARLO · RANDOM SAMPLING · PROBABILISTIC COMPUTATION · AETHER",10,14);
      pts.forEach(p=>{
        ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2);
        ctx.fillStyle=p.col; ctx.globalAlpha=0.7; ctx.fill(); ctx.globalAlpha=1;
      });
      ctx.beginPath(); ctx.ellipse(350,110,80,48,0,0,Math.PI*2);
      ctx.strokeStyle="rgba(230,184,92,0.3)"; ctx.lineWidth=1; ctx.stroke();
      const inside=pts.filter(p=>{ const dx=(p.x-350)/80, dy=(p.y-110)/48; return dx*dx+dy*dy<=1; });
      const pi=4*(inside.length/Math.max(pts.length,1));
      ctx.fillStyle="#E6B85C"; ctx.font="12px 'DM Mono',monospace";
      ctx.fillText(`π ≈ ${pi.toFixed(4)}  (n=${pts.length})`,20,200);
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

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
  ember: "#FF8A5C",
  pearl: "#E8E2F2",
  panel: "rgba(255,255,255,0.04)",
  panelLite: "rgba(255,255,255,0.06)",
  line: "rgba(255,255,255,0.10)",
};

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
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
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: accent, letterSpacing: 2.4, marginBottom: 4 }}>SECTION {num}</div>
      <div style={{ fontFamily: '"Cinzel", serif', fontSize: 22, color: B.ink, fontVariant: "small-caps", letterSpacing: 1.5 }}>{label}</div>
    </div>
  );
}

function Bridge({ to, label, sub, accent }: { to: string; label: string; sub: string; accent: string }) {
  const slug = to.replace(/^\//, "");
  return (
    <Link
      href={to}
      data-testid={`bridge-${slug}`}
      style={{
        display: "block", background: B.panel, border: `1px solid ${B.line}`,
        borderLeft: `3px solid ${accent}`, padding: "12px 14px", borderRadius: 4,
        textDecoration: "none", color: B.ink, transition: "background 120ms",
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = B.panelLite)}
      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.background = B.panel)}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: '"Cinzel", serif', fontSize: 13, color: accent, fontVariant: "small-caps", letterSpacing: 1.2 }}>{label}</span>
        <ArrowUpRight size={14} color={accent} />
      </div>
      <div style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: B.dim, marginTop: 4, lineHeight: 1.4 }}>{sub}</div>
    </Link>
  );
}

function Chip({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      display: "inline-block", padding: "4px 10px", margin: "2px 4px 2px 0",
      background: `${color}1A`, border: `1px solid ${color}55`, color: color,
      borderRadius: 999, fontFamily: "Inter, sans-serif", fontSize: 11, letterSpacing: 1.4,
      fontVariant: "small-caps",
    }}>{children}</span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{
      textAlign: "left", padding: "8px 10px", borderBottom: `1px solid ${B.line}`,
      color: B.dim, fontFamily: "Inter, sans-serif", fontSize: 10.5, letterSpacing: 1.6,
      fontWeight: 600, textTransform: "uppercase",
    }}>{children}</th>
  );
}

function Td({ children, accent }: { children: React.ReactNode; accent?: string }) {
  return (
    <td style={{
      padding: "8px 10px", borderBottom: `1px solid ${B.line}`,
      color: accent ?? B.ink, fontFamily: "Inter, sans-serif", fontSize: 12.5, lineHeight: 1.5,
      verticalAlign: "top",
    }}>{children}</td>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "Inter, sans-serif", fontSize: 13.5, lineHeight: 1.7, color: B.ink,
      margin: "0 0 10px 0",
    }}>{children}</p>
  );
}

function Eq({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: '"JetBrains Mono", "Courier New", monospace', fontSize: 13,
      color: B.gold, background: "rgba(230,184,92,0.06)", border: `1px solid ${B.gold}30`,
      padding: "8px 12px", borderRadius: 4, margin: "8px 0", textAlign: "center",
    }}>{children}</div>
  );
}

/* ------------------------------------------------------------------ */
/*  Glyphs                                                              */
/* ------------------------------------------------------------------ */

/* §01 — Three regimes: k<1 (decay), k=1 (flat), k>1 (growth) */
function ThreeRegimesGlyph() {
  // Plot N(g) = k^g for g = 0..6 in three regimes
  const W = 380, H = 220;
  const x0 = 40, y0 = 180, w = 320, h = 150;
  const gens = [0, 1, 2, 3, 4, 5, 6];
  const vals = (k: number) => gens.map(g => Math.pow(k, g));
  const allMax = 6;
  const xOf = (g: number) => x0 + (g / 6) * w;
  const yOf = (v: number) => y0 - Math.min(v, allMax) / allMax * h;

  const path = (k: number) => vals(k).map((v, i) => `${i === 0 ? "M" : "L"} ${xOf(i)} ${yOf(v)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="A line chart showing three regimes of a chain reaction's expected population over generations. The horizontal axis is the generation number from zero to six. The vertical axis is the expected number of neutrons in that generation, normalised so generation zero equals one. A rose curve labelled k less than one, with k equal to nought point eight, decays steadily toward zero — a subcritical reaction. A gold horizontal line labelled k equal to one stays flat at one for every generation — a critical reaction whose expected population neither grows nor shrinks. A green curve labelled k greater than one, with k equal to one point twenty-nine matching the arithmetic average shown in the user's reference image, grows exponentially upward — a supercritical reaction. A footer caption notes that the chart shows expected populations under the law of large numbers, not the outcome of any single neutron history">
      <text x={W/2} y={16} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Three regimes · expected population per generation</text>

      {/* Axes */}
      <line x1={x0} y1={y0} x2={x0 + w} y2={y0} stroke={B.dim} strokeWidth={0.7} />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - h} stroke={B.dim} strokeWidth={0.7} />
      {gens.map(g => (
        <g key={`gx${g}`}>
          <line x1={xOf(g)} y1={y0} x2={xOf(g)} y2={y0 + 3} stroke={B.dim} strokeWidth={0.6} />
          <text x={xOf(g)} y={y0 + 14} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">{g}</text>
        </g>
      ))}
      <text x={x0 + w/2} y={y0 + 28} textAnchor="middle" fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">generation g</text>
      <text x={x0 - 28} y={y0 - h + 4} fontSize={9.5} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">N(g)</text>

      {/* Reference y=1 line */}
      <line x1={x0} y1={yOf(1)} x2={x0 + w} y2={yOf(1)} stroke={B.gold} strokeWidth={1.1} strokeDasharray="3 3" opacity={0.85} />

      {/* k=0.8 decay (rose) */}
      <path d={path(0.8)} stroke={B.rose} strokeWidth={1.6} fill="none" />
      {/* k=1 flat (gold) — overlaps reference line */}
      {/* k=1.29 growth (green) */}
      <path d={path(1.29)} stroke={B.green} strokeWidth={1.6} fill="none" />

      {/* Labels */}
      <text x={xOf(6) + 4} y={yOf(Math.pow(0.8, 6)) + 4} fontSize={10} fill={B.rose} fontFamily="Inter, sans-serif">k = 0.8</text>
      <text x={xOf(6) + 4} y={yOf(1) - 4} fontSize={10} fill={B.gold} fontFamily="Inter, sans-serif">k = 1</text>
      <text x={xOf(6) + 4} y={yOf(Math.min(Math.pow(1.29, 6), allMax)) + 4} fontSize={10} fill={B.green} fontFamily="Inter, sans-serif">k = 1.29</text>

      <text x={W/2} y={H - 6} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">expected populations under LLN — not the outcome of any single history</text>
    </svg>
  );
}

/* §02 — One neutron's life as a Markov step (recreating user's image 2) */
function NeutronStepGlyph() {
  const W = 380, H = 220;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="A schematic of a single neutron's transition probabilities at one step of its life inside fissile material, recreating the diagram in the user's reference image. A rounded rectangle on the left labelled Traveling represents a neutron currently moving through the material. From this state three arrows lead to three outcomes. A self-loop arrow at the top, labelled nought point four nought, points back to the Traveling state itself, representing the probability that the neutron continues travelling without leaving, being absorbed, or causing fission. An upper arrow labelled nought point two nought leads to a rounded rectangle labelled Leave or absorb, representing the probability that the neutron escapes the material or is captured without inducing fission. A lower arrow labelled nought point four nought leads to a rounded rectangle labelled Fission, representing the probability that the neutron strikes a fissile nucleus and triggers a fission event that releases new neutrons. The three outgoing probabilities sum to one. A footer caption notes that this is the per-step transition kernel of one neutron, and that the multiplication factor k is determined by combining the fission probability with the average number of neutrons released per fission">
      <text x={W/2} y={16} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>One neutron · per-step transition kernel</text>

      {/* Traveling node */}
      <rect x={30} y={95} width={90} height={36} rx={8} fill={B.panelLite} stroke={B.cyan} strokeWidth={1.1} />
      <text x={75} y={117} textAnchor="middle" fontSize={11} fill={B.cyan} fontFamily="Inter, sans-serif">Traveling</text>

      {/* Self-loop (top) */}
      <path d="M 60 95 Q 75 50 100 80 L 95 76 M 100 80 L 96 86" fill="none" stroke={B.amber} strokeWidth={1.1} />
      <path d="M 100 80 L 95 76" stroke={B.amber} strokeWidth={1.1} fill="none" />
      <path d="M 100 80 L 96 86" stroke={B.amber} strokeWidth={1.1} fill="none" />
      <text x={80} y={55} textAnchor="middle" fontSize={10} fill={B.amber} fontFamily="Inter, sans-serif">0.40</text>

      {/* Leave or absorb node (upper right) */}
      <rect x={250} y={55} width={120} height={36} rx={8} fill={B.panelLite} stroke={B.rose} strokeWidth={1.1} />
      <text x={310} y={77} textAnchor="middle" fontSize={11} fill={B.rose} fontFamily="Inter, sans-serif">Leave or absorb</text>

      {/* Arrow to leave */}
      <path d="M 120 105 Q 200 75 250 73" fill="none" stroke={B.rose} strokeWidth={1.1} />
      <path d="M 250 73 L 244 70 M 250 73 L 245 78" stroke={B.rose} strokeWidth={1.1} fill="none" />
      <text x={195} y={82} textAnchor="middle" fontSize={10} fill={B.rose} fontFamily="Inter, sans-serif">0.20</text>

      {/* Fission node (lower right) */}
      <rect x={250} y={155} width={120} height={36} rx={8} fill={B.panelLite} stroke={B.green} strokeWidth={1.1} />
      <text x={310} y={177} textAnchor="middle" fontSize={11} fill={B.green} fontFamily="Inter, sans-serif">Fission</text>

      {/* Arrow to fission */}
      <path d="M 120 121 Q 200 155 250 173" fill="none" stroke={B.green} strokeWidth={1.1} />
      <path d="M 250 173 L 244 170 M 250 173 L 245 178" stroke={B.green} strokeWidth={1.1} fill="none" />
      <text x={195} y={158} textAnchor="middle" fontSize={10} fill={B.green} fontFamily="Inter, sans-serif">0.40</text>

      <text x={W/2} y={H - 6} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">k = (fission probability) × (mean neutrons released per fission)</text>
    </svg>
  );
}

/* §05 — Many Monte Carlo histories converging to deterministic mean */
function MonteCarloHistoriesGlyph() {
  const W = 380, H = 220;
  const x0 = 40, y0 = 180, w = 320, h = 150;
  const gens = [0, 1, 2, 3, 4, 5, 6];
  const xOf = (g: number) => x0 + (g / 6) * w;
  const yOf = (v: number) => y0 - Math.min(v / 4, 1) * h;
  const k = 1.29;
  // Pseudo-random sample paths that scatter around k^g
  function rng(seed: number) { let s = seed; return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  const paths: number[][] = [];
  for (let i = 0; i < 12; i++) {
    const r = rng(7 + i * 13);
    const p: number[] = [1];
    for (let g = 1; g <= 6; g++) {
      const prev = p[g - 1];
      // Jittered geometric: prev * k * exp(jitter)
      const jitter = (r() - 0.5) * 0.85;
      p.push(Math.max(0.05, prev * k * Math.exp(jitter)));
    }
    paths.push(p);
  }
  const meanPath = gens.map(g => Math.pow(k, g));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }} role="img" aria-label="A chart illustrating how the law of large numbers turns a stochastic chain reaction into a smooth deterministic curve. The horizontal axis is the generation number from zero to six. Twelve thin pearl-grey curves represent twelve independent simulated neutron histories, each starting at one neutron in generation zero and scattering across a spread of populations at later generations — some growing quickly, some growing slowly, some momentarily shrinking. A thick green curve overlaid in the middle of the cloud represents the deterministic exponential expected population k to the power g, with k equal to one point twenty-nine. A footer caption notes that any single Monte Carlo history is noisy, but as the number of independent histories grows toward infinity their average converges to the deterministic curve k to the power g — this is the law of large numbers, and is what makes Monte Carlo simulation on machines like the ENIAC able to estimate criticality from sampled histories">
      <text x={W/2} y={16} textAnchor="middle" fontSize={11} fill={B.gold} fontFamily='"Cinzel", serif' fontVariant="small-caps" letterSpacing={1.4}>Many noisy histories · one smooth mean</text>

      {/* Axes */}
      <line x1={x0} y1={y0} x2={x0 + w} y2={y0} stroke={B.dim} strokeWidth={0.7} />
      <line x1={x0} y1={y0} x2={x0} y2={y0 - h} stroke={B.dim} strokeWidth={0.7} />
      {gens.map(g => (
        <g key={`gx${g}`}>
          <line x1={xOf(g)} y1={y0} x2={xOf(g)} y2={y0 + 3} stroke={B.dim} strokeWidth={0.6} />
          <text x={xOf(g)} y={y0 + 14} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif">{g}</text>
        </g>
      ))}

      {/* Sample paths */}
      {paths.map((p, i) => (
        <path key={`pp${i}`} d={p.map((v, g) => `${g === 0 ? "M" : "L"} ${xOf(g)} ${yOf(v)}`).join(" ")}
              stroke={B.pearl} strokeWidth={0.7} fill="none" opacity={0.4} />
      ))}

      {/* Mean path */}
      <path d={meanPath.map((v, g) => `${g === 0 ? "M" : "L"} ${xOf(g)} ${yOf(v)}`).join(" ")}
            stroke={B.green} strokeWidth={2.2} fill="none" />

      <text x={xOf(6) + 4} y={yOf(meanPath[6]) + 4} fontSize={10} fill={B.green} fontFamily="Inter, sans-serif">⟨N⟩ = k^g</text>
      <text x={W/2} y={H - 6} textAnchor="middle" fontSize={9} fill={B.dim} fontFamily="Inter, sans-serif" fontStyle="italic">individual histories noisy · their average → k^g as N → ∞</text>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */
export default function EniacMonteCarloPage() {
  return (
    <div data-testid="page-eniac-monte-carlo" style={{ background: B.bg, minHeight: "100vh", padding: "32px 28px", color: B.ink }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, letterSpacing: 3, marginBottom: 8 }}>
            BRANCHING PROCESSES · LAW OF LARGE NUMBERS · ENIAC 1948 · MAINSTREAM PROBABILITY + REACTOR PHYSICS
          </div>
          <h1 style={{
            fontFamily: '"Cinzel", serif', fontSize: 38, color: B.ink, fontVariant: "small-caps",
            letterSpacing: 2.2, margin: "0 0 12px 0", lineHeight: 1.15,
          }}>
            ENIAC, Monte Carlo, And The Law Of Large Numbers
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 14.5, color: B.dim, lineHeight: 1.7, maxWidth: 880, margin: 0 }}>
            The two diagrams in your reference picture out one of the cleanest
            uses of probability theory in twentieth-century physics. The single
            neutron in image 2 is a <em>Markov step</em>: at each tick of its
            life it stays travelling, leaves or is absorbed, or causes fission,
            with probabilities that sum to one. Stack many of those steps across
            many generations of neutrons and you get image 1: a{" "}
            <strong style={{ color: B.cyan }}>branching process</strong> whose
            average growth per generation is a single number,{" "}
            <strong style={{ color: B.gold }}>k</strong> — the multiplication
            factor. <strong style={{ color: B.green }}>k &lt; 1</strong> dies
            out, <strong style={{ color: B.gold }}>k = 1</strong> is the
            knife's-edge "self-sustaining" regime,{" "}
            <strong style={{ color: B.amber }}>k &gt; 1</strong> grows
            exponentially. The whole reason this is a probability problem and
            not a pencil-and-paper integral is that the underlying transport
            equations are too hard to solve in closed form for realistic
            geometries — which is why{" "}
            <strong style={{ color: B.violet }}>Stanislaw Ulam, John von Neumann, Nicholas Metropolis</strong>{" "}
            and Robert Richtmyer built the first <em>Monte Carlo</em> simulations
            on the <strong style={{ color: B.amber }}>ENIAC in 1948</strong>:
            sample many neutron histories, average them, let the law of large
            numbers do the work.
          </p>
          <div style={{ marginTop: 14 }}>
            <Chip color={B.cyan}>Markov step</Chip>
            <Chip color={B.violet}>Galton-Watson</Chip>
            <Chip color={B.gold}>k = multiplication factor</Chip>
            <Chip color={B.green}>law of large numbers</Chip>
            <Chip color={B.amber}>ENIAC · 1948</Chip>
            <Chip color={B.violet}>Ulam · von Neumann · Metropolis</Chip>
            <Chip color={B.rose}>extinction probability q</Chip>
          </div>
        </div>

        {/* §01 The question behind the picture */}
        <section style={{ marginBottom: 44 }} data-testid="section-01">
          <H num="01" label="The Question Behind The Picture · Three Regimes Of k" accent={B.gold} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.gold}>
              <P>
                The picture you've attached carries one central idea behind a lot
                of twentieth-century reactor physics, weapon physics, and modern
                Monte Carlo simulation: the long-run behaviour of a chain
                reaction is governed by a <em>single number</em>, the
                multiplication factor <strong style={{ color: B.gold }}>k</strong>,
                defined as the average number of fission-causing neutrons in
                generation <em>g + 1</em> per fission-causing neutron in
                generation <em>g</em>.
              </P>
              <P>
                Three regimes follow immediately, and the chart on the right
                draws all three on the same axes:
              </P>
              <ul style={{ fontFamily: "Inter, sans-serif", fontSize: 13, lineHeight: 1.7, color: B.ink, margin: "4px 0 0 18px" }}>
                <li><strong style={{ color: B.rose }}>k &lt; 1 · subcritical</strong> — expected population decays as k<sup>g</sup>; the reaction dies.</li>
                <li><strong style={{ color: B.gold }}>k = 1 · critical</strong> — expected population stays flat; the "self-sustaining" knife's edge.</li>
                <li><strong style={{ color: B.amber }}>k &gt; 1 · supercritical</strong> — expected population grows as k<sup>g</sup>; runaway.</li>
              </ul>
              <P>
                Your reference image labels its branching tree{" "}
                <em>k<sub>avg</sub> = 1.29</em>: a slightly supercritical run.
                That number, the way it's computed, and the question{" "}
                <em>"if k = 1, why doesn't the reaction grow?"</em>{" "}
                are what the rest of this page unpacks — first the per-neutron
                Markov step (§02), then the multiplication factor (§03), the
                Galton-Watson branching process (§04), the law of large numbers
                (§05), the ENIAC 1948 history (§06), and the genuinely subtle
                §07 distinction between <em>expected</em> survival and{" "}
                <em>almost-sure</em> extinction at exactly k = 1.
              </P>
            </Card>
            <Card accent={B.gold}>
              <ThreeRegimesGlyph />
            </Card>
          </div>
        </section>

        {/* §02 One neutron's life as a Markov step */}
        <section style={{ marginBottom: 44 }} data-testid="section-02">
          <H num="02" label="One Neutron's Life · The Per-Step Transition Kernel" accent={B.cyan} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.cyan}>
              <P>
                The first image you've shared is the simplest possible model of
                a neutron's life inside fissile material. At each step of its
                trajectory, exactly one of three things happens, with the
                probabilities written on the arrows:
              </P>
              <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-step-kernel">
                <thead>
                  <tr><Th>Outcome</Th><Th>Probability</Th><Th>What it means</Th></tr>
                </thead>
                <tbody>
                  <tr><Td accent={B.amber}>Traveling → Traveling (loop)</Td><Td>0.40</Td><Td>The neutron continues without leaving, being absorbed, or hitting a fissile nucleus.</Td></tr>
                  <tr><Td accent={B.rose}>Traveling → Leave or absorb</Td><Td>0.20</Td><Td>The neutron escapes the geometry, or is absorbed by a non-fissile capture (parasitic absorption).</Td></tr>
                  <tr><Td accent={B.green}>Traveling → Fission</Td><Td>0.40</Td><Td>The neutron strikes a fissile nucleus and triggers a fission event releasing new neutrons.</Td></tr>
                  <tr><Td accent={B.gold}>Total</Td><Td>1.00</Td><Td>Probabilities of an exhaustive set of outcomes always sum to 1 — definition of a probability distribution.</Td></tr>
                </tbody>
              </table>
              <P>
                This is a <em>Markov step</em>: the next outcome depends only on
                the current state ("Traveling"), not on the path that got the
                neutron there. The fission outcome is the only one that{" "}
                <em>creates</em> new neutrons; the other two end this neutron's
                line. To get from the per-neutron picture to the per-population
                picture (§03), you combine the fission probability with the
                average number of neutrons released per fission event.
              </P>
            </Card>
            <Card accent={B.cyan}>
              <NeutronStepGlyph />
            </Card>
          </div>
        </section>

        {/* §03 The multiplication factor */}
        <section style={{ marginBottom: 44 }} data-testid="section-03">
          <H num="03" label="The Multiplication Factor k · Three Regimes Made Precise" accent={B.cyan} />
          <Card accent={B.cyan}>
            <P>
              Define <strong style={{ color: B.gold }}>k</strong> as the
              expected number of fission-causing neutrons in the next generation
              produced by a single fission-causing neutron in this one. Two
              numbers determine it for the simple model in §02:
            </P>
            <Eq>k  =  (eventual probability that a born neutron causes a fission)  ×  (mean neutrons released per fission)</Eq>
            <P>
              The "eventual" qualifier matters. Image 2 is a{" "}
              <em>per-step Markov kernel</em> with a self-loop: at each tick a
              traveling neutron stays travelling with probability 0.40, leaves
              or is absorbed with 0.20, or fissions with 0.40. The neutron
              keeps sampling that kernel until it leaves the "Traveling" state
              for good. Its <em>eventual</em> fission probability is therefore
              an absorbing-Markov-chain hitting probability — the geometric
              sum:
            </P>
            <Eq>P(eventual fission) = 0.4 + (0.4)(0.4) + (0.4)²(0.4) + … = 0.4 / (0.4 + 0.2) = 2 / 3</Eq>
            <P>
              The mean neutrons-released-per-fission for U-235 thermal fission
              is roughly ν ≈ 2.4 in standard textbook values; for fast fission
              of Pu-239 it is higher. With ν ≈ 2.4 and P<sub>fission</sub> ≈ 2/3
              the implied k ≈ 1.6 for that toy kernel — comfortably
              supercritical. The multi-generation tree in image 1 is labelled
              k<sub>avg</sub> = 1.29, and the four fractions written across its
              top — 2, 3⁄2, 2⁄3, 2⁄2 — are the <em>realised</em> generation-to-
              generation ratios of fission counts for that one drawn run; their
              arithmetic mean is{" "}
              <strong style={{ color: B.gold }}>(2 + 3⁄2 + 2⁄3 + 2⁄2) / 4 ≈ 1.292</strong>,
              which is the displayed k<sub>avg</sub>. That is a sample average
              over four observed generations of one realised tree, not the
              stationary offspring mean of a probability distribution — a
              distinction worth keeping straight (see §05 on LLN and §07 on
              what mean-vs-realisation actually buys you).
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-regimes">
              <thead>
                <tr><Th>Regime</Th><Th>Condition</Th><Th>Expected population at generation g</Th><Th>Reactor-physics name</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.rose}>Subcritical</Td><Td>k &lt; 1</Td><Td>⟨N(g)⟩ = k<sup>g</sup> → 0 exponentially</Td><Td>Shutdown / safe regime; reactor power dies away.</Td></tr>
                <tr><Td accent={B.gold}>Critical</Td><Td>k = 1</Td><Td>⟨N(g)⟩ = 1 for all g (stable expectation)</Td><Td>Operating regime of a steady-state reactor; held at k = 1 by control rods.</Td></tr>
                <tr><Td accent={B.amber}>Supercritical</Td><Td>k &gt; 1</Td><Td>⟨N(g)⟩ = k<sup>g</sup> → ∞ exponentially</Td><Td>Power excursion regime; the regime weapon designs deliberately enter, and the regime reactor designs deliberately avoid.</Td></tr>
              </tbody>
            </table>
            <P>
              Two important qualifiers belong on this table. <em>First:</em>{" "}
              "expected" here is the probabilistic{" "}
              <strong style={{ color: B.violet }}>mean</strong> of N(g) over many
              independent histories — see §05 for why that average is the right
              object. <em>Second:</em> in real reactors the more complete
              accounting also includes <em>delayed neutrons</em> (a small
              fraction of fission neutrons emitted seconds after the event),
              which is what makes a critical reactor controllable on human
              timescales rather than on the microsecond timescale of prompt
              neutrons.
            </P>
          </Card>
        </section>

        {/* §04 Galton-Watson branching process */}
        <section style={{ marginBottom: 44 }} data-testid="section-04">
          <H num="04" label="Galton-Watson · The Branching Process Behind k" accent={B.violet} />
          <Card accent={B.violet}>
            <P>
              Image 1 — the multi-generation tree — is a classical{" "}
              <strong style={{ color: B.violet }}>Galton-Watson branching
              process</strong>. The framework was introduced by Henry Watson and
              Francis Galton in 1874 to study the extinction of family surnames
              and is one of the oldest pieces of formal probability theory still
              in heavy use. A neutron multiplication chain is just the same
              mathematical object with "neutrons that cause fissions" playing
              the role of "sons that have sons".
            </P>
            <P>
              Let <em>X</em> be the random number of fission-causing neutrons a
              single fission produces in the next generation. Let{" "}
              <em>p<sub>j</sub></em> = P(X = j) be the offspring distribution.
              Define the <em>probability generating function</em>:
            </P>
            <Eq>f(s) = E[s^X] = p₀ + p₁ s + p₂ s² + p₃ s³ + …</Eq>
            <P>
              The mean offspring number is{" "}
              <strong style={{ color: B.gold }}>μ = E[X] = f′(1) = k</strong> —
              the multiplication factor of §03 is the same number as the mean
              of the offspring distribution. The classical Galton-Watson result
              then gives the long-run behaviour cleanly:
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-galton-watson">
              <thead>
                <tr><Th>Regime</Th><Th>Mean offspring k</Th><Th>Extinction probability q</Th><Th>Long-run behaviour</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.rose}>Subcritical</Td><Td>k &lt; 1</Td><Td>q = 1</Td><Td>Lineage dies out almost surely.</Td></tr>
                <tr><Td accent={B.gold}>Critical</Td><Td>k = 1</Td><Td>q = 1 (provided variance &gt; 0)</Td><Td>Lineage <em>still</em> dies out almost surely — the surprise of §07.</Td></tr>
                <tr><Td accent={B.amber}>Supercritical</Td><Td>k &gt; 1</Td><Td>q &lt; 1, smallest non-negative root of f(s) = s</Td><Td>Lineage either dies out (with probability q) or grows without bound (with probability 1 − q).</Td></tr>
              </tbody>
            </table>
            <P>
              The supercritical row is the one that matters operationally. Even
              with k &gt; 1, an individual fission has a positive probability of
              producing zero neutrons that cause further fissions; chains can
              still die. The probability that an entire chain started by a
              single neutron eventually dies is the smallest non-negative
              solution{" "}
              <em>q</em> of the fixed-point equation{" "}
              <strong style={{ color: B.violet }}>f(q) = q</strong>. The
              probability of <em>survival</em> is 1 − q. This is exactly why
              fast-assembly weapons need many neutrons in their initiator and
              why a reactor scram works even though k can briefly exceed 1
              during transients.
            </P>
          </Card>
        </section>

        {/* §05 Law of large numbers */}
        <section style={{ marginBottom: 44 }} data-testid="section-05">
          <H num="05" label="The Law Of Large Numbers · Why Averaging Smooths The Curve" accent={B.green} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <Card accent={B.green}>
              <P>
                Your prompt names the right tool. The{" "}
                <strong style={{ color: B.green }}>law of large numbers</strong>{" "}
                (LLN), in its strong form, says: if X₁, X₂, … are independent
                identically-distributed random variables with finite mean μ,
                their sample average converges almost surely to μ as the sample
                size grows:
              </P>
              <Eq>(1/N) Σᵢ Xᵢ  →  μ   almost surely as  N → ∞</Eq>
              <P>
                Apply this to neutron histories. Each independent simulated
                history of a neutron starting at generation 0 produces some
                random count of descendants at generation g. Average those
                counts over many histories and the average converges to ⟨N(g)⟩
                = k<sup>g</sup>. <em>Any single history is noisy</em> — it can
                die early, or run hot for a while; but the average over many
                histories is nearly deterministic. The right-hand chart shows
                twelve sample histories scattered around the deterministic
                k<sup>g</sup> mean curve.
              </P>
              <P>
                LLN is the load-bearing piece of the whole Monte Carlo idea: it
                says you can <em>estimate</em> a quantity (here, k or ⟨N(g)⟩)
                that you cannot compute analytically by averaging many simulated
                samples, and that the estimator gets arbitrarily good as the
                sample size grows. The <em>rate</em> of that convergence is
                governed by the central limit theorem: standard error scales as
                1/√N, so to halve the error you simulate four times as many
                histories.
              </P>
            </Card>
            <Card accent={B.green}>
              <MonteCarloHistoriesGlyph />
            </Card>
          </div>
        </section>

        {/* §06 ENIAC history */}
        <section style={{ marginBottom: 44 }} data-testid="section-06">
          <H num="06" label="ENIAC 1948 · The First Monte Carlo Runs" accent={B.amber} />
          <Card accent={B.amber}>
            <P>
              The Monte Carlo method as we now use it was conceived by{" "}
              <strong style={{ color: B.amber }}>Stanislaw Ulam</strong> at Los
              Alamos in 1946 while convalescing from illness — the
              often-repeated origin story has Ulam trying to estimate the
              probability of winning at solitaire and realising that, where the
              combinatorics were intractable, drawing many random hands and
              counting wins would converge to the right answer. He wrote to{" "}
              <strong style={{ color: B.amber }}>John von Neumann</strong> in
              1947 with the suggestion that the same trick — sampling many
              random trajectories, averaging them, letting LLN do the work —
              could be applied to the neutron-diffusion problem the lab cared
              about for weapon and reactor design.
            </P>
            <P>
              Von Neumann, with{" "}
              <strong style={{ color: B.amber }}>Robert Richtmyer</strong>,
              wrote up the method as a programme for the{" "}
              <strong style={{ color: B.amber }}>ENIAC</strong> — by then moved
              from the University of Pennsylvania to Aberdeen Proving Ground —
              and the first runs were carried out in 1948 by von Neumann's group
              including <strong style={{ color: B.amber }}>Nicholas Metropolis</strong>.
              The method was given its name ("Monte Carlo", after the casino) by
              Metropolis. The formal introduction paper is Metropolis &amp; Ulam,
              <em> "The Monte Carlo Method"</em>, <em>Journal of the American
              Statistical Association</em> 44, 335 (1949). The standard
              historical reference for the ENIAC episode itself is Roger
              Eckhardt, <em>"Stan Ulam, John von Neumann, and the Monte Carlo
              Method"</em>, in the Stanislaw Ulam memorial issue of{" "}
              <em>Los Alamos Science</em> 15 (1987).
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-history">
              <thead>
                <tr><Th>When</Th><Th>Who</Th><Th>What</Th></tr>
              </thead>
              <tbody>
                <tr><Td accent={B.amber}>1946</Td><Td>Ulam</Td><Td>Conceives statistical-sampling idea while playing solitaire at Los Alamos.</Td></tr>
                <tr><Td accent={B.amber}>1947</Td><Td>Ulam → von Neumann (letter)</Td><Td>Proposes applying sampling to neutron-diffusion problems on ENIAC.</Td></tr>
                <tr><Td accent={B.amber}>1947</Td><Td>von Neumann + Richtmyer</Td><Td>Drafts of the method as an ENIAC programme circulated internally at Los Alamos.</Td></tr>
                <tr><Td accent={B.amber}>1948</Td><Td>Metropolis + von Neumann group</Td><Td>First Monte Carlo neutron-transport runs on ENIAC at Aberdeen Proving Ground.</Td></tr>
                <tr><Td accent={B.amber}>1949</Td><Td>Metropolis &amp; Ulam</Td><Td>"The Monte Carlo Method", <em>JASA</em> 44, 335 — the public introduction of the method.</Td></tr>
                <tr><Td accent={B.amber}>1953</Td><Td>Metropolis et al.</Td><Td>"Equation of state calculations by fast computing machines", <em>J. Chem. Phys.</em> 21, 1087 — the Metropolis algorithm; the first MCMC.</Td></tr>
                <tr><Td accent={B.amber}>1987</Td><Td>Eckhardt</Td><Td>"Stan Ulam, John von Neumann, and the Monte Carlo Method", <em>Los Alamos Science</em> 15 — the standard historical reference for the ENIAC episode.</Td></tr>
              </tbody>
            </table>
            <P>
              The ENIAC was an 18,000-vacuum-tube general-purpose electronic
              computer; its programmes were implemented by physically rewiring
              patch cables and setting switches. The Monte Carlo neutron runs
              required a software pseudo-random-number generator, which von
              Neumann produced in the form of the <em>middle-square method</em>{" "}
              (a now-obsolete generator he proposed knowing it was poor — "anyone
              who attempts to generate random numbers by deterministic means is,
              of course, living in a state of sin", as he famously wrote). The
              entire stack — branching-process model, LLN justification,
              pseudo-random sampling, and machine implementation — was put
              together end-to-end on this single set of runs.
            </P>
          </Card>
        </section>

        {/* §07 The subtle bit — k=1 doesn't grow but it doesn't survive either */}
        <section style={{ marginBottom: 44 }} data-testid="section-07">
          <H num="07" label="The Subtle Bit · What 'k = 1 Doesn't Grow' Actually Says" accent={B.gold} />
          <Card accent={B.gold}>
            <P>
              Your one-line phrasing — <em>"if k = 1 the reaction is
              self-sustaining and doesn't grow"</em> — is correct as a statement
              about the <strong style={{ color: B.violet }}>expected
              value</strong> of N(g), and that is the statement reactor-physics
              textbooks usually mean by it. It is also the operating principle
              of every steady-state nuclear reactor, which is held precisely at
              k = 1 by control rods. There is, however, a famous subtlety hiding
              behind it that is worth naming clearly because it is{" "}
              <em>exactly</em> the kind of thing the law of large numbers makes
              easy to confuse:
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-subtle">
              <thead>
                <tr><Th>What people often mean by "k = 1"</Th><Th>What is actually true</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.gold}>"At k = 1 the chain survives forever."</Td>
                  <Td>For a pure Galton-Watson branching process with k = 1 and offspring variance &gt; 0, the chain dies out with probability one. Survival is <em>not</em> guaranteed by k = 1 alone.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"At k = 1 the population stays at 1 forever."</Td>
                  <Td>The <em>expected</em> population stays at 1 forever — but individual histories have variance that grows linearly with g. Most chains go extinct; a vanishingly small fraction grow large enough to keep the mean at 1.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"A real reactor at k = 1 will keep running forever."</Td>
                  <Td>True in practice — because a real reactor contains an enormous number of simultaneous neutron lineages, not one. LLN smooths the population dynamics: with N₀ ≫ 1 starting neutrons, the relative fluctuation around k<sup>g</sup> shrinks like 1/√N₀ and the deterministic picture becomes essentially exact.</Td>
                </tr>
                <tr>
                  <Td accent={B.gold}>"A single neutron at k = 1 is just as likely to start a chain as kill one."</Td>
                  <Td>This is roughly the right intuition, and it is the reason fast-assembly weapons use neutron initiators that release many neutrons simultaneously — to push the survival probability of <em>at least one</em> chain close to 1 even when each individual chain has high extinction probability.</Td>
                </tr>
              </tbody>
            </table>
            <P>
              In short: the deterministic statement{" "}
              <em>⟨N(g)⟩ = k<sup>g</sup></em> is the law-of-large-numbers limit
              of a stochastic process, and it does not imply that a single
              realisation behaves like its mean. Reactor-physics textbooks are
              correct to use the mean-field description because real reactors
              hold so many neutrons in flight that the LLN limit is essentially
              what you observe; pure-probability textbooks are correct to flag
              that for a single chain, k = 1 still implies almost-sure
              extinction. <strong style={{ color: B.gold }}>Both
              statements are true; they describe different limits of the same
              underlying mathematics.</strong>
            </P>
          </Card>
        </section>

        {/* §08 Reception */}
        <section style={{ marginBottom: 44 }} data-testid="section-08">
          <H num="08" label="Reception · What This Picture Establishes And What It Doesn't" accent={B.green} />
          <Card accent={B.green}>
            <P>
              The branching-process / LLN / Monte Carlo stack is genuinely
              mainstream — in this case the cordon is a short one, but worth
              naming explicitly so the picture isn't asked to do work it can't.
            </P>
            <table style={{ width: "100%", borderCollapse: "collapse" }} data-testid="table-reception">
              <thead>
                <tr><Th>Sometimes claimed</Th><Th>What the framework actually establishes</Th></tr>
              </thead>
              <tbody>
                <tr>
                  <Td accent={B.green}>"Monte Carlo on ENIAC <em>solved</em> the bomb-design problem."</Td>
                  <Td>Monte Carlo gave Los Alamos a way to <em>estimate</em> neutron-transport quantities like k, leakage fractions, and energy spectra in geometries where closed-form solutions of the Boltzmann transport equation were intractable. It was a tool inside a much larger design effort, not a one-shot answer.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>"k = 1 means a reactor never deviates from steady state."</Td>
                  <Td>k = 1 is the <em>expectation</em> condition for steady state. Real reactors fluctuate around it, and engineering control loops (control rods, delayed neutrons, feedback coefficients) actively keep the running k near 1 against perturbations.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>"The branching tree picture proves the underlying nuclear cross-sections."</Td>
                  <Td>It does not. The branching picture takes the per-step probabilities (and the offspring distribution per fission) as inputs; those inputs come from measured nuclear cross-sections and ν-bar values, not from the picture itself.</Td>
                </tr>
                <tr>
                  <Td accent={B.green}>"Law of large numbers applies to any single experimental run."</Td>
                  <Td>LLN applies to averages over many independent realisations. A single experimental run is a single realisation, and any single realisation can deviate substantially from the mean — that is what variance means. Confusing the two is one of the commonest errors when reading branching-process diagrams.</Td>
                </tr>
              </tbody>
            </table>
          </Card>
        </section>

        {/* User's reference images */}
        <section style={{ marginBottom: 44 }} data-testid="section-references">
          <H num="09" label="The Two Reference Images In Your Prompt" accent={B.pearl} />
          <Card accent={B.pearl}>
            <P>
              For completeness, the two images you sent — the per-neutron Markov
              step and the multi-generation branching tree at k<sub>avg</sub> = 1.29
              — are reproduced below. The SVG glyphs above are AETHER
              redrawings of the same content in house style; the images here are
              your originals.
            </P>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 12 }}>
              <div>
                <img
                  src={singleStepImg}
                  alt="User's reference image 1: a single neutron's per-step Markov diagram showing the Traveling state with three outgoing transitions — a self-loop labelled nought point four nought back to Traveling, an arrow labelled nought point two nought to Leave or absorb, and an arrow labelled nought point four nought to Fission."
                  style={{ width: "100%", borderRadius: 4, border: `1px solid ${B.line}` }}
                  data-testid="ref-image-step-kernel"
                />
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 6, textAlign: "center", fontStyle: "italic" }}>
                  Reference 1 · single-neutron Markov step (your image)
                </div>
              </div>
              <div>
                <img
                  src={branchTreeImg}
                  alt="User's reference image 2: a four-generation branching tree of neutrons labelled with multiplication factor k subscript avg equals one point twenty-nine, with per-generation ratios of two, three over two, two over three, and two over two written above the generations."
                  style={{ width: "100%", borderRadius: 4, border: `1px solid ${B.line}` }}
                  data-testid="ref-image-branch-tree"
                />
                <div style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: B.dim, marginTop: 6, textAlign: "center", fontStyle: "italic" }}>
                  Reference 2 · multi-generation branching tree at k<sub>avg</sub> = 1.29 (your image)
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* §10 Bridges */}
        <section data-testid="section-bridges">
          <H num="10" label="Bridges" accent={B.cyan} />
          <Card accent={B.cyan} style={{ marginBottom: 16 }}>
            <P>
              This page sits in AETHER's neighbourhood of mainstream-mathematics
              + applied-physics reads. The bridges below place it among the
              other pages it speaks to most directly.
            </P>
          </Card>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
            <Bridge to="/vortex-math" label="Vortex Math · Σ" sub="Companion page on simple sums and the kind of probabilistic / combinatorial arithmetic that makes branching-process averages tractable." accent={B.violet} />
            <Bridge to="/math-engine" label="Math Engine" sub="The wider mathematical neighbourhood the LLN sits in — sums, expectations, limits." accent={B.cyan} />
            <Bridge to="/knowable-universe" label="Knowable Universe · Euler + SM" sub="The epistemic frame for reading mainstream-physics results carefully — what counts as established and what doesn't." accent={B.cyan} />
            <Bridge to="/alchemical-protocol" label="Alchemical Protocol" sub="The seven-stage source-grounded reading method this page applies to a Monte-Carlo / branching-process picture." accent={B.gold} />
            <Bridge to="/warp-drive-literature" label="Warp-Drive Literature" sub="Sister page that uses the same source-discipline on a much harder, more speculative physics literature." accent={B.cyan} />
            <Bridge to="/puthoff-metric-engineering" label="Puthoff · Metric Engineering" sub="Sister page that uses the same source-discipline on a famous-but-controversial named physicist." accent={B.violet} />
            <Bridge to="/aether-doctrine" label="AETHER Doctrine" sub="The substrate-first stance against which all of these pages are read." accent={B.gold} />
          </div>
        </section>
      </div>
    </div>
  );
}

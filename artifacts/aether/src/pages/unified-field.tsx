import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import {
  Atom, FlaskConical, Calculator, AudioWaveform, Waves,
  FunctionSquare, Compass, Sigma, ArrowUpRight, Activity,
} from "lucide-react";

// ─── Palette ──────────────────────────────────────────────────────────
const C = {
  bg:      "#04060A",
  panel:   "rgba(8,16,28,0.78)",
  border:  "rgba(110,235,224,0.14)",
  border2: "rgba(110,235,224,0.32)",
  cyan:    "#7AF0E0",
  cyanD:   "#3FB8AC",
  cyanL:   "#B8FFF2",
  text:    "#A8C4CC",
  white:   "#E0F4F0",
  muted:   "#8AA0A8",
  amber:   "#E8C878",
  rose:    "#E06878",
  violet:  "#C890E8",
};

// ─── Real, accurate equations (physics · chemistry · mathematics) ─────
type EqDomain = "physics" | "chemistry" | "math";
type EqRec = { tex: string; domain: EqDomain; weight?: number };

const EQS_BG: EqRec[] = [
  // physics
  { tex: "E = mc²",                            domain: "physics",   weight: 0.85 },
  { tex: "iℏ ∂Ψ/∂t = ĤΨ",                     domain: "physics",   weight: 0.90 },
  { tex: "∇·E = ρ/ε₀",                         domain: "physics" },
  { tex: "∇×B = μ₀J + μ₀ε₀ ∂E/∂t",            domain: "physics" },
  { tex: "F = ma",                             domain: "physics" },
  { tex: "S = k_B ln Ω",                       domain: "physics" },
  { tex: "R_μν − ½ g_μν R = (8πG/c⁴) T_μν",  domain: "physics",   weight: 0.85 },
  { tex: "ds² = c²dt² − dx² − dy² − dz²",     domain: "physics" },
  { tex: "λ f = c",                            domain: "physics" },
  { tex: "p = ℏk",                             domain: "physics" },
  { tex: "Σ F = dp/dt",                        domain: "physics" },
  { tex: "∮ B·dl = μ₀ I_enc",                 domain: "physics" },
  // chemistry
  { tex: "PV = nRT",                           domain: "chemistry", weight: 0.85 },
  { tex: "ΔG = ΔH − TΔS",                     domain: "chemistry", weight: 0.85 },
  { tex: "pH = −log[H⁺]",                      domain: "chemistry" },
  { tex: "K_eq = [C]^c[D]^d / [A]^a[B]^b",     domain: "chemistry" },
  { tex: "k = A · e^(−E_a / RT)",              domain: "chemistry" },
  { tex: "E = E° − (RT/nF) · ln Q",            domain: "chemistry" },
  { tex: "pH = pK_a + log([A⁻]/[HA])",         domain: "chemistry" },
  { tex: "ΔG° = −RT · ln K",                   domain: "chemistry" },
  // mathematics
  { tex: "e^(iπ) + 1 = 0",                    domain: "math",      weight: 0.95 },
  { tex: "∇²f = 0",                            domain: "math" },
  { tex: "∫_{−∞}^{∞} e^(−x²) dx = √π",         domain: "math" },
  { tex: "ζ(s) = Σ 1/n^s",                    domain: "math" },
  { tex: "Σ 1/n² = π²/6",                     domain: "math" },
  { tex: "φ = (1+√5)/2",                       domain: "math" },
  { tex: "a² + b² = c²",                       domain: "math" },
  { tex: "d/dx(eˣ) = eˣ",                      domain: "math" },
];

// Highlighted in the foreground near the sphere
const EQS_HERO = [
  "E = mc²",
  "iℏ ∂Ψ/∂t = ĤΨ",
  "PV = nRT",
  "ΔG = ΔH − TΔS",
  "e^(iπ) + 1 = 0",
  "∇²Ψ + (2m/ℏ²)(E−V)Ψ = 0",
];

// ─── Polyhedron helper (octahedra + cubes for the molecular eigenstates)
type PolyKind = "octa" | "cube";

function drawPolyhedron(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  size: number, rot: number,
  kind: PolyKind,
) {
  let vs: [number, number, number][] = [];
  let edges: [number, number][] = [];
  if (kind === "octa") {
    vs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
    edges = [
      [0,2],[0,3],[0,4],[0,5],
      [1,2],[1,3],[1,4],[1,5],
      [2,4],[2,5],[3,4],[3,5],
    ];
  } else {
    vs = [
      [-1,-1,-1],[ 1,-1,-1],[ 1, 1,-1],[-1, 1,-1],
      [-1,-1, 1],[ 1,-1, 1],[ 1, 1, 1],[-1, 1, 1],
    ];
    edges = [
      [0,1],[1,2],[2,3],[3,0],
      [4,5],[5,6],[6,7],[7,4],
      [0,4],[1,5],[2,6],[3,7],
    ];
  }
  const cosY = Math.cos(rot),       sinY = Math.sin(rot);
  const cosX = Math.cos(rot * 0.7), sinX = Math.sin(rot * 0.7);
  const projected = vs.map(([x,y,z]) => {
    let xx = cosY * x + sinY * z;
    let zz = -sinY * x + cosY * z;
    let yy = cosX * y - sinX * zz;
    zz = sinX * y + cosX * zz;
    return [cx + xx * size, cy + yy * size, zz] as [number, number, number];
  });

  ctx.lineWidth = 1.2;
  for (const [a, b] of edges) {
    const pa = projected[a], pb = projected[b];
    const depth = ((pa[2] + pb[2]) / 2 + 1) / 2;
    ctx.strokeStyle = `rgba(122,240,224,${(0.32 + 0.55 * depth).toFixed(3)})`;
    ctx.beginPath();
    ctx.moveTo(pa[0], pa[1]);
    ctx.lineTo(pb[0], pb[1]);
    ctx.stroke();
  }
  for (const p of projected) {
    const depth = (p[2] + 1) / 2;
    const r = 1.6 + depth * 2.2;
    const g = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 3.5);
    g.addColorStop(0, `rgba(184,255,242,${(0.78 + 0.18 * depth).toFixed(3)})`);
    g.addColorStop(0.5, `rgba(122,240,224,${(0.30 + 0.20 * depth).toFixed(3)})`);
    g.addColorStop(1, "rgba(122,240,224,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p[0], p[1], r * 3.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

// ─── PAGE ─────────────────────────────────────────────────────────────
function UnifiedFieldHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const forces=["EM","STRONG","WEAK","GRAVITY"];
    const fcols=["#44aaff","#ff4477","#44cc77","#c9a84c"];
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      forces.forEach((lb,i)=>{
        const angle=i/forces.length*Math.PI*2+t*0.008;
        const r=45+8*Math.sin(t*0.04+i);
        const x=cx+Math.cos(angle)*r,y=cy+Math.sin(angle)*r*0.55;
        ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(x,y);ctx.strokeStyle=fcols[i]+"44";ctx.lineWidth=1;ctx.stroke();
        ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fillStyle=fcols[i]+"33";ctx.fill();ctx.strokeStyle=fcols[i]+"66";ctx.lineWidth=0.8;ctx.stroke();
        ctx.fillStyle=fcols[i]+"88";ctx.font="7px 'DM Mono',monospace";ctx.textAlign="center";ctx.fillText(lb,x,y+3);ctx.textAlign="left";
      });
      ctx.beginPath();ctx.arc(cx,cy,8,0,Math.PI*2);const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,20);grd.addColorStop(0,"rgba(255,255,255,0.7)");grd.addColorStop(1,"rgba(46,240,216,0)");ctx.fillStyle=grd;ctx.fill();
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("UNIFIED FIELD · ELECTROWEAK · GRAND UNIFICATION · TOE · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function UnifiedFieldPage() {
  const cvRef  = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, currentDpr = 1, lowQ = false;
    const resize = () => {
      currentDpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      lowQ = W < 720;
      cv.width  = Math.max(1, Math.round(W * currentDpr));
      cv.height = Math.max(1, Math.round(H * currentDpr));
      ctx.setTransform(currentDpr, 0, 0, currentDpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(cv);
    // recompute on display/zoom changes
    const dprMQ = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    const onDprChange = () => resize();
    dprMQ.addEventListener?.("change", onDprChange);

    // pre-distribute equations on multiple Archimedean spiral arms
    const ARMS = 4;
    const eqsPlaced = EQS_BG.map((e, i) => {
      const arm = i % ARMS;
      const idx = Math.floor(i / ARMS);
      const baseTheta = (arm / ARMS) * Math.PI * 2;
      return {
        eq: e,
        baseTheta,
        radiusMul: 0.16 + idx * 0.075,
        thetaOffset: idx * 0.45,
        opacity: 0.16 + (e.weight ?? 0.4) * 0.22,
        size: 11 + (e.weight ?? 0.4) * 4,
      };
    });

    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      const cx  = W / 2;
      const cyy = H / 2 - 30;
      const R   = Math.min(W, H);

      // background gradient
      const bg = ctx.createRadialGradient(cx, cyy, 0, cx, cyy, R * 0.78);
      bg.addColorStop(0, "#06101A");
      bg.addColorStop(0.6, "#04080F");
      bg.addColorStop(1, "#020407");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // ── vortex rings beneath the sphere ──────────────────────────────
      ctx.save();
      ctx.translate(cx, cyy + R * 0.20);
      const rings = 8;
      for (let i = 0; i < rings; i++) {
        const f  = (i + 1) / rings;
        const rx = R * 0.40 * f;
        const ry = R * 0.075 * f;
        const a  = 0.07 + 0.10 * (1 - f) + (reduced ? 0 : 0.04 * Math.sin(t * 0.6 + i * 0.7));
        ctx.strokeStyle = `rgba(122,240,224,${a.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // ── background equation arms (slow rotation) ─────────────────────
      const armRot = reduced ? 0 : t * 0.05;
      const bgBlur = lowQ ? 0 : 6;
      for (const p of eqsPlaced) {
        const theta = p.baseTheta + p.thetaOffset + armRot;
        const r  = R * p.radiusMul;
        const ex = cx  + Math.cos(theta) * r * 1.10;
        const ey = cyy + Math.sin(theta) * r * 0.55;
        const tilt = Math.sin(theta) * 0.18;
        ctx.save();
        ctx.translate(ex, ey);
        ctx.rotate(tilt);
        ctx.font = `italic ${p.size}px ui-serif, Georgia, serif`;
        ctx.shadowColor = "rgba(122,240,224,0.5)";
        ctx.shadowBlur  = bgBlur;
        ctx.fillStyle   = `rgba(122,240,224,${p.opacity.toFixed(3)})`;
        ctx.textAlign   = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(p.eq.tex, 0, 0);
        ctx.restore();
      }

      // ── wireframe sphere (centered above well) ────────────────────────
      const sphR  = R * 0.13;
      const sphCx = cx;
      const sphCy = cyy - R * 0.05;
      const rotY  = reduced ? 0 : t * 0.25;
      const tilt  = 0.42;
      const cosT  = Math.cos(tilt), sinT = Math.sin(tilt);
      const cosY  = Math.cos(rotY), sinY = Math.sin(rotY);
      const project = (x: number, y: number, z: number) => {
        const xx = cosY * x + sinY * z;
        let   zz = -sinY * x + cosY * z;
        const yy = cosT * y - sinT * zz;
        zz = sinT * y + cosT * zz;
        return [sphCx + xx, sphCy + yy, zz] as const;
      };

      const segs = 60;
      // latitude rings
      const latRings = 7;
      for (let i = 1; i < latRings; i++) {
        const phi = (i / latRings) * Math.PI - Math.PI / 2;
        const ry  = Math.cos(phi) * sphR;
        const yyy = Math.sin(phi) * sphR;
        ctx.beginPath();
        for (let s = 0; s <= segs; s++) {
          const u = (s / segs) * Math.PI * 2;
          const [px, py] = project(Math.cos(u) * ry, yyy, Math.sin(u) * ry);
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "rgba(122,240,224,0.30)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      // meridians
      const meridians = 12;
      for (let i = 0; i < meridians; i++) {
        const lng = (i / meridians) * Math.PI * 2;
        ctx.beginPath();
        for (let s = 0; s <= segs; s++) {
          const phi = (s / segs) * Math.PI - Math.PI / 2;
          const ry  = Math.cos(phi) * sphR;
          const yyy = Math.sin(phi) * sphR;
          const [px, py] = project(Math.cos(lng) * ry, yyy, Math.sin(lng) * ry);
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = "rgba(122,240,224,0.24)";
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      // outer rim
      ctx.beginPath();
      ctx.arc(sphCx, sphCy, sphR + 0.6, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(184,255,242,0.55)";
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // ── orbiting polyhedra (4) ────────────────────────────────────────
      const POLYHEDRA: { kind: PolyKind; angle: number; radius: number; size: number; speed: number }[] = [
        { kind: "octa", angle: -Math.PI * 0.55, radius: R * 0.27, size: R * 0.050, speed:  0.55 },
        { kind: "cube", angle: -Math.PI * 0.18, radius: R * 0.30, size: R * 0.045, speed: -0.42 },
        { kind: "cube", angle:  Math.PI * 0.62, radius: R * 0.30, size: R * 0.050, speed:  0.48 },
        { kind: "octa", angle:  Math.PI * 0.95, radius: R * 0.27, size: R * 0.045, speed: -0.60 },
      ];
      for (const ph of POLYHEDRA) {
        const ox = sphCx + Math.cos(ph.angle) * ph.radius;
        const oy = sphCy + Math.sin(ph.angle) * ph.radius * 0.65;
        const ang = reduced ? ph.angle : t * ph.speed;
        drawPolyhedron(ctx, ox, oy, ph.size, ang, ph.kind);
      }

      // ── hero equations near the sphere ────────────────────────────────
      const heroPositions: [number, number, number][] = [
        [-R * 0.005, sphR + R * 0.045, 18],
        [-R * 0.205, sphR + R * 0.105, 15],
        [ R * 0.180, sphR + R * 0.115, 15],
        [-R * 0.235, sphR + R * 0.180, 14],
        [ R * 0.205, sphR + R * 0.190, 14],
        [ 0,         sphR + R * 0.230, 16],
      ];
      EQS_HERO.forEach((eqText, i) => {
        const pos = heroPositions[i];
        if (!pos) return;
        const [dx, dy, fs] = pos;
        ctx.save();
        ctx.translate(sphCx + dx, sphCy + dy);
        ctx.font = `italic ${fs}px ui-serif, Georgia, serif`;
        ctx.shadowColor = "rgba(184,255,242,0.7)";
        ctx.shadowBlur  = lowQ ? 0 : 10;
        ctx.fillStyle   = "rgba(200,255,245,0.82)";
        ctx.textAlign   = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(eqText, 0, 0);
        ctx.restore();
      });

      if (!reduced) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    if (reduced) {
      draw(performance.now());
    } else {
      rafRef.current = requestAnimationFrame(draw);
    }

    return () => {
      ro.disconnect();
      dprMQ.removeEventListener?.("change", onDprChange);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced]);

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text, fontFamily: "Cinzel, ui-serif, Georgia, serif" }}>
      {/* HERO CANVAS */}
      <section className="relative" style={{ height: "min(720px, 80vh)" }} data-testid="unified-hero">
        <canvas ref={cvRef} data-testid="unified-field-canvas"
                role="img"
                style={{ width: "100%", height: "100%", display: "block" }}
                aria-label="Unified Field hero — a wireframe sphere above a vortex of concentric rings, with four molecular polyhedra (octahedra and cubes) in orbit and a swirling field of real physics, chemistry and mathematics equations rendered in cyan glow" />
        <div className="absolute inset-x-0 top-0 px-8 py-6 pointer-events-none">
          <div className="text-[10px] tracking-[0.3em] uppercase" style={{ color: C.cyanD }}>
            aether · unified scientific framework · physics · chemistry · mathematics
          </div>
          <h1 className="text-[36px] mt-1"
              style={{ color: C.cyanL, letterSpacing: "0.02em", textShadow: `0 0 22px ${C.cyan}66` }}>
            Unified Field
          </h1>
          <p className="text-[13px] mt-2 max-w-2xl" style={{ color: C.text }}>
            One conceptual space where the laws of motion, the bonds of matter, and the structure of number share a single grammar.
            The wireframe sphere is the manifold; the rings beneath are the gravity well; the orbiting polyhedra are the molecular
            eigenstates; and the equations swirling around them are the operators that bind all three.
          </p>
        </div>
        <div className="absolute bottom-4 right-6 text-[10px] tracking-[0.25em] uppercase pointer-events-none"
             style={{ color: C.muted }}>
          live render · {reduced ? "static (reduced motion)" : "rotating manifold + spiral arms"}
        </div>
      </section>

      {/* SECTION 01 — three columns */}
      <section className="px-8 py-12 max-w-7xl mx-auto" data-testid="section-three-readings">
        <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.cyanD }}>
          Section 01 · the three readings
        </div>
        <h2 className="text-[26px] mb-2" style={{ color: C.white }}>
          Same field, three grammars.
        </h2>
        <p className="text-[13px] max-w-3xl mb-8" style={{ color: C.text, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
          Physics reads the field as wavefunctions on a manifold. Chemistry reads it as moles of energy under thermal pressure.
          Mathematics reads it as the operators themselves, prior to any interpretation. The same five equations show up in
          all three readings under different symbols.
        </p>
        <div className="grid gap-5 grid-cols-1 lg:grid-cols-3">
          <Column
            title="Physics" symbol="Ψ" color={C.cyan}
            principle={<>The world as <span style={{ color: C.cyanL }}>fields evolving on a manifold</span>. Wave equations, conservation laws, and curvature — all expressed as differential operators acting on amplitudes.</>}
            eqs={[
              { tex: "iℏ ∂Ψ/∂t = ĤΨ",                       note: "Schrödinger · time evolution of a quantum amplitude" },
              { tex: "R_μν − ½ g_μν R = (8πG/c⁴) T_μν",     note: "Einstein field equation · curvature of spacetime ↔ stress-energy" },
              { tex: "∇·E = ρ/ε₀",                           note: "Gauss · electric flux through a closed surface = enclosed charge / ε₀" },
              { tex: "E = mc²",                              note: "Mass-energy equivalence" },
              { tex: "S = k_B ln Ω",                         note: "Boltzmann · entropy as the log of accessible microstates" },
            ]}
          />
          <Column
            title="Chemistry" symbol="ΔG" color={C.amber}
            principle={<>The world as <span style={{ color: C.amber }}>matter exchanging energy under thermal pressure</span>. Reaction quotients, free-energy gradients, and bond geometry — the same operators expressed in moles and joules.</>}
            eqs={[
              { tex: "PV = nRT",                                     note: "Ideal gas law · the macroscopic state surface" },
              { tex: "ΔG = ΔH − TΔS",                               note: "Gibbs free energy · spontaneity = enthalpy − temperature × entropy" },
              { tex: "k = A · e^(−E_a / RT)",                       note: "Arrhenius · how temperature accelerates a reaction" },
              { tex: "K_eq = [C]^c [D]^d / [A]^a [B]^b",            note: "Equilibrium constant · for aA + bB ⇌ cC + dD (stoichiometric form)" },
              { tex: "E = E° − (RT/nF) · ln Q",                     note: "Nernst · cell potential under non-standard conditions" },
            ]}
          />
          <Column
            title="Mathematics" symbol="∮" color={C.violet}
            principle={<>The world as <span style={{ color: C.violet }}>structure that survives every translation</span>. Identities, integrals, and recursions — the operators themselves, prior to any physical or chemical interpretation.</>}
            eqs={[
              { tex: "e^(iπ) + 1 = 0",                  note: "Euler's identity · five fundamental constants in one line" },
              { tex: "∫_{−∞}^{∞} e^(−x²) dx = √π",      note: "Gaussian integral · the normalization of every probability cloud" },
              { tex: "ζ(s) = Σ_{n=1}^∞ 1/n^s",         note: "Riemann zeta · the spectral key to the primes" },
              { tex: "Σ_{n=1}^∞ 1/n² = π²/6",          note: "Basel problem · integer counting bridges circle geometry" },
              { tex: "φ = (1+√5)/2",                    note: "Golden ratio · the recursive minimality of growth" },
            ]}
          />
        </div>
      </section>

      {/* SECTION 02 — bridge to existing workbenches */}
      <section className="px-8 py-12 max-w-7xl mx-auto border-t" style={{ borderColor: C.border }}
               data-testid="section-bridge">
        <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.cyanD }}>
          Section 02 · where this lives in the AETHER stack
        </div>
        <h2 className="text-[26px] mb-2" style={{ color: C.white }}>
          Each domain has a working bench.
        </h2>
        <p className="text-[13px] mb-7 max-w-3xl"
           style={{ color: C.text, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
          The Unified Field is the conceptual atrium. The actual computations live in the workbenches below — each runs the
          operators of one domain on real data, and the AETHER coherence layer reads the results back as a single field.
        </p>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <BridgeLink href="/lattice"        title="CGLE Lattice"       subtitle="Complex Ginzburg–Landau · field dynamics"   icon={Waves}          col={C.cyan}   />
          <BridgeLink href="/phi-aether"     title="φ-AETHER"            subtitle="Coherent criticality · golden-ratio bands"  icon={AudioWaveform}  col={C.cyan}   />
          <BridgeLink href="/q-aether"       title="Q~AETHER"            subtitle="Quantum field workbench"                    icon={Atom}           col={C.cyan}   />
          <BridgeLink href="/equations"      title="Equations Lab"       subtitle="Symbolic generation · derivation tree"      icon={FunctionSquare} col={C.violet} />
          <BridgeLink href="/math-engine"    title="Math Engine"         subtitle="Workbench · constants · integrals"          icon={Calculator}     col={C.violet} />
          <BridgeLink href="/vortex-math"    title="Vortex Math · 144"   subtitle="Tesla 3·6·9 · digital roots · 144 grid"     icon={Sigma}          col={C.violet} />
          <BridgeLink href="/galileo-newton" title="Galileo + Newton"    subtitle="Empirical → formal lift · classical bridge" icon={Compass}        col={C.amber}  />
          <BridgeLink href="/aether-core"    title="AETHER Core"         subtitle="Crystalline intelligence engine"            icon={FlaskConical}   col={C.amber}  />
          <BridgeLink href="/coherence"      title="System Coherence"    subtitle="Unified read-back · field statistics"       icon={Activity}       col={C.cyanL}  />
        </div>
      </section>

      {/* SECTION 03 — operator atlas */}
      <section className="px-8 py-12 max-w-7xl mx-auto border-t" style={{ borderColor: C.border }}
               data-testid="section-operators">
        <div className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.cyanD }}>
          Section 03 · the shared operators
        </div>
        <h2 className="text-[26px] mb-2" style={{ color: C.white }}>
          Where the grammars overlap.
        </h2>
        <p className="text-[13px] mb-7 max-w-3xl"
           style={{ color: C.text, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
          The same eight operators appear in all three columns. Each carries a physical meaning, a chemical meaning, and a
          purely mathematical meaning. This is what makes the framework <em>unified</em>: not the answers, but the verbs.
        </p>
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {OPERATORS.map(op => <OperatorCard key={op.symbol} op={op} />)}
        </div>
      </section>

      {/* CODA */}
      <section className="px-8 py-16 max-w-3xl mx-auto" data-testid="unified-coda">
        <div className="h-px mb-6"
             style={{ background: `linear-gradient(90deg, transparent 0%, ${C.cyan}66 50%, transparent 100%)` }} />
        <p className="text-[15px] leading-relaxed italic" style={{ color: C.text }}>
          One sphere, one well, four polyhedra, and the ring of equations that holds them.
          The Unified Field is not a new theory — it is the room in which the existing theories meet.
        </p>
        <p className="mt-5 text-[18px] tracking-[0.16em]" style={{ color: C.cyanL }}>
          Ψ · ΔG · e<sup>iπ</sup> — three grammars, one field.
        </p>
      </section>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────
function Column({
  title, symbol, color, principle, eqs,
}: {
  title: string; symbol: string; color: string;
  principle: React.ReactNode;
  eqs: { tex: string; note: string }[];
}) {
  return (
    <div className="border rounded-[10px] p-5"
         style={{ borderColor: C.border, background: C.panel }}
         data-testid={`column-${title.toLowerCase()}`}>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-[28px]" style={{ color, textShadow: `0 0 14px ${color}88` }}>
          {symbol}
        </span>
        <h3 className="text-[20px]" style={{ color: C.white }}>{title}</h3>
      </div>
      <p className="text-[12.5px] leading-relaxed mb-4"
         style={{ color: C.text, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        {principle}
      </p>
      <ul className="flex flex-col gap-3">
        {eqs.map(e => (
          <li key={e.tex}>
            <div className="text-[14px] italic"
                 style={{ color: C.cyanL, fontFamily: "ui-serif, Georgia, serif" }}>
              {e.tex}
            </div>
            <div className="text-[11px] mt-0.5"
                 style={{ color: C.muted, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
              {e.note}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BridgeLink({
  href, title, subtitle, icon: Icon, col,
}: {
  href: string; title: string; subtitle: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties; strokeWidth?: number }>;
  col: string;
}) {
  return (
    <Link href={href}
          className="group border rounded-[10px] p-4 flex items-center gap-3 hover:bg-[rgba(122,240,224,0.04)] transition-colors"
          style={{ borderColor: C.border, background: C.panel }}
          data-testid={`bridge-${href.replace("/", "")}`}>
      <div className="w-9 h-9 rounded-full border flex items-center justify-center shrink-0"
           style={{ borderColor: C.border2, background: "rgba(122,240,224,0.05)" }}>
        <Icon className="w-4 h-4" style={{ color: col }} strokeWidth={1.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px]" style={{ color: C.white }}>{title}</div>
        <div className="text-[11px] mt-0.5"
             style={{ color: C.muted, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
          {subtitle}
        </div>
      </div>
      <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{ color: C.cyan }} strokeWidth={1.5} />
    </Link>
  );
}

type Op = { symbol: string; name: string; physics: string; chemistry: string; math: string };
const OPERATORS: Op[] = [
  { symbol: "∇",  name: "Nabla / del",          physics: "field gradient",                chemistry: "concentration gradient",         math: "vector differential" },
  { symbol: "∂",  name: "Partial derivative",   physics: "rate of change in space/time",  chemistry: "rate of reaction at conditions", math: "multivariable slope" },
  { symbol: "∫",  name: "Integral",             physics: "accumulated flux / action",     chemistry: "total heat exchanged",           math: "antiderivative" },
  { symbol: "Σ",  name: "Summation",            physics: "ensemble average",              chemistry: "Henderson–Hasselbalch sum",       math: "series" },
  { symbol: "∮",  name: "Closed-loop integral", physics: "Stokes / Ampère / Faraday",     chemistry: "cyclic process work",            math: "boundary integral" },
  { symbol: "⊗",  name: "Tensor product",       physics: "joint quantum state",           chemistry: "orbital basis combination",       math: "bilinear form" },
  { symbol: "⊕",  name: "Direct sum",           physics: "decoupled subspaces",           chemistry: "orthogonal symmetry components", math: "vector-space decomposition" },
  { symbol: "∇²", name: "Laplacian",            physics: "wave / diffusion / curvature",  chemistry: "concentration smoothing",         math: "second-order divergence" },
];

function OperatorCard({ op }: { op: Op }) {
  return (
    <div className="border rounded-[10px] p-4"
         style={{ borderColor: C.border, background: C.panel }}
         data-testid={`op-${op.name.replace(/\s+/g, "-").toLowerCase()}`}>
      <div className="flex items-baseline gap-3">
        <span className="text-[26px]"
              style={{ color: C.cyanL, textShadow: `0 0 12px ${C.cyan}66`, fontFamily: "ui-serif, Georgia, serif" }}>
          {op.symbol}
        </span>
        <span className="text-[12px] uppercase tracking-[0.2em]" style={{ color: C.cyanD }}>{op.name}</span>
      </div>
      <ul className="mt-3 flex flex-col gap-1.5 text-[11.5px]"
          style={{ color: C.text, fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
        <li><span style={{ color: C.cyan }}>physics</span> · {op.physics}</li>
        <li><span style={{ color: C.amber }}>chemistry</span> · {op.chemistry}</li>
        <li><span style={{ color: C.violet }}>math</span> · {op.math}</li>
      </ul>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
const imgFibTorus = "/api/storage/public-objects/image_(23)_1782754907458.jpg";
const imgPhiResonance = "/api/storage/public-objects/Gemini_Generated_Image_xru7hlxru7hlxru7_1782755291272.png";
const imgTorusField = "/api/storage/public-objects/Viergutz-Fig10_1782754632793.jpg";
/* ── palette ── */
const C = {
  bg:     "#040a04",
  deep:   "#071007",
  panel:  "#0c180c",
  border: "rgba(74,222,128,0.14)",
  gold:   "#f5c84c",
  green:  "#4ade80",
  lime:   "#86efac",
  teal:   "#1fd4c8",
  violet: "#b07ef8",
  amber:  "#f59e0b",
  pink:   "#f472b6",
  muted:  "#6a8a6a",
  dim:    "#142014",
  text:   "#e4f4e0",
};
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

const PHI          = 1.6180339887;
const GOLDEN_ANGLE = 360 * (2 - PHI); // 137.50776...°

/* ── Phyllotaxis Canvas ── */
function PhyllotaxisCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const angleRef  = useRef(GOLDEN_ANGLE);
  const [angleDeg, setAngleDeg] = useState(GOLDEN_ANGLE);
  const isGolden  = Math.abs(angleDeg - GOLDEN_ANGLE) < 0.2;

  useEffect(() => { angleRef.current = angleDeg; }, [angleDeg]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 500, H = 500;
    canvas.width = W; canvas.height = H;
    const cx = W / 2, cy = H / 2;
    const N   = 500;
    const SPC = 7.2;
    let t = 0;

    const COLORS = ["#4ade80","#86efac","#f5c84c","#6ee7b7","#fbbf24","#34d399","#a3e635","#1fd4c8","#bbf7d0"];

    function draw() {
      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, W * 0.6);
      bg.addColorStop(0, "#0e1f0e");
      bg.addColorStop(1, "#040a04");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      const aRad = angleRef.current * Math.PI / 180;
      const pulse = 1 + 0.04 * Math.sin(t * 0.04);

      for (let i = 0; i < N; i++) {
        const r = SPC * Math.sqrt(i) * pulse;
        const a = i * aRad;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        if (x < 2 || x > W - 2 || y < 2 || y > H - 2) continue;

        const dotR   = Math.max(1.2, 3.8 - r / (SPC * Math.sqrt(N)) * 3);
        const fib    = i % 13;
        const alpha  = 0.6 + 0.4 * Math.sin(t * 0.03 + i * 0.05);
        const col    = COLORS[fib % COLORS.length];
        const hex    = Math.round(alpha * 255).toString(16).padStart(2, "0");

        const gr = ctx.createRadialGradient(x, y, 0, x, y, dotR * 2.5);
        gr.addColorStop(0, col + "cc");
        gr.addColorStop(1, col + "00");
        ctx.beginPath();
        ctx.arc(x, y, dotR * 2, 0, Math.PI * 2);
        ctx.fillStyle = gr;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = col + hex;
        ctx.fill();
      }

      // Center origin pulse
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18 * pulse);
      cg.addColorStop(0, isGolden ? "#f5c84cee" : "#ffffff88");
      cg.addColorStop(1, "#00000000");
      ctx.beginPath();
      ctx.arc(cx, cy, 18 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = cg;
      ctx.fill();

      // Angle label
      ctx.font      = `10px ${mono}`;
      ctx.fillStyle = isGolden ? C.gold + "cc" : C.muted + "88";
      ctx.textAlign = "center";
      ctx.fillText(`${angleRef.current.toFixed(3)}°${isGolden ? " ← φ" : ""}`, cx, H - 10);
      ctx.textAlign = "left";

      t++;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [isGolden]);

  return (
    <div>
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "auto", borderRadius: 8 }} />
      <div style={{ padding: "12px 0 0", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontFamily: mono, fontSize: 9, color: C.muted, minWidth: 40 }}>80°</span>
        <input
          type="range" min={80} max={160} step={0.1}
          value={angleDeg}
          onChange={e => setAngleDeg(parseFloat(e.target.value))}
          style={{ flex: 1, accentColor: C.green }}
        />
        <span style={{ fontFamily: mono, fontSize: 9, color: C.muted, minWidth: 40, textAlign: "right" }}>160°</span>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        {[{v:90, l:"90°"},{v:120,l:"120°"},{v:137.508,l:"φ 137.5°"},{v:144,l:"144°"},{v:150,l:"150°"}].map(p => (
          <button
            key={p.v}
            onClick={() => setAngleDeg(p.v)}
            style={{
              fontFamily: mono, fontSize: 10,
              background: Math.abs(angleDeg - p.v) < 0.2 ? `${C.green}30` : C.dim,
              border: `1px solid ${Math.abs(angleDeg - p.v) < 0.2 ? C.green : C.muted}40`,
              color: Math.abs(angleDeg - p.v) < 0.2 ? C.green : C.muted,
              borderRadius: 4, padding: "4px 10px", cursor: "pointer",
            }}
          >{p.l}</button>
        ))}
      </div>
      <div style={{ fontFamily: body, fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.6 }}>
        {isGolden
          ? "Golden angle (137.5°) — no visible spokes. Every point has equal neighbours. This is the invisible wind's optimal packing solution."
          : "Any other angle creates visible radial spokes — some regions crowded, some empty. Nature tested all angles and found one that works."}
      </div>
    </div>
  );
}

/* ── Auxin Wave Canvas ── */
function AuxinCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 500, H = 320;
    canvas.width = W; canvas.height = H;

    let t = 0;
    const primordia: { angle: number; h: number; age: number }[] = [];
    const NUM = 22;
    for (let i = 0; i < NUM; i++) {
      const angle = i * GOLDEN_ANGLE * Math.PI / 180;
      primordia.push({ angle, h: H * 0.12 + i * (H * 0.78) / NUM, age: i * 8 });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#040a04";
      ctx.fillRect(0, 0, W, H);

      const stemX = W * 0.5;
      const stemW = 14;

      // Auxin concentration field (background heatmap)
      for (let y = 0; y < H; y += 4) {
        const auxin = 0.9 * Math.exp(-y / (H * 0.6)) + 0.1 * (0.5 + 0.5 * Math.sin(t * 0.04 - y * 0.06));
        const r = Math.round(auxin * 120);
        const g = Math.round(auxin * 60 + (1 - auxin) * 180);
        const b = Math.round((1 - auxin) * 80);
        const a = 0.15;
        ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
        ctx.fillRect(0, y, W, 4);
      }

      // Stem
      const stemGr = ctx.createLinearGradient(stemX - stemW, 0, stemX + stemW, 0);
      stemGr.addColorStop(0, "#1a3a1a");
      stemGr.addColorStop(0.5, "#2d5a2d");
      stemGr.addColorStop(1, "#1a3a1a");
      ctx.fillStyle = stemGr;
      ctx.beginPath();
      ctx.roundRect(stemX - stemW / 2, 0, stemW, H, 6);
      ctx.fill();

      // Auxin flow wave inside stem
      for (let y = 0; y < H; y += 3) {
        const wave = Math.sin(t * 0.06 - y * 0.07);
        const intensity = 0.5 + 0.5 * Math.exp(-y / (H * 0.55));
        const alpha = (0.3 + 0.3 * wave) * intensity;
        if (alpha <= 0) continue;
        const wColor = `rgba(180,220,120,${alpha.toFixed(2)})`;
        ctx.fillStyle = wColor;
        ctx.fillRect(stemX - stemW / 2 + 2, y, stemW - 4, 3);
      }

      // Growing tip glow
      const tipGr = ctx.createRadialGradient(stemX, 12, 0, stemX, 12, 32);
      tipGr.addColorStop(0, "#f5c84cee");
      tipGr.addColorStop(1, "#f5c84c00");
      ctx.beginPath();
      ctx.arc(stemX, 12, 32, 0, Math.PI * 2);
      ctx.fillStyle = tipGr;
      ctx.fill();
      ctx.font = `8px ${mono}`;
      ctx.fillStyle = C.gold + "cc";
      ctx.textAlign = "center";
      ctx.fillText("GROWING TIP", stemX, 8);

      // Primordia (leaf buds) alternating left/right at phi angles
      primordia.forEach((p, i) => {
        p.age++;
        const phase = p.age * 0.05;
        const side  = (i % 2 === 0) ? 1 : -1;
        const leafX = stemX + side * (40 + 30 * (1 - Math.exp(-p.age * 0.015)));
        const leafY = p.h;
        const scale = Math.min(1, p.age * 0.012);
        const auxin = 0.9 * Math.exp(-leafY / (H * 0.6));

        // Auxin-low glow at bud site
        const budGr = ctx.createRadialGradient(leafX, leafY, 0, leafX, leafY, 18 * scale);
        budGr.addColorStop(0, auxin < 0.35 ? "#4ade80cc" : "#f5c84c66");
        budGr.addColorStop(1, "#00000000");
        ctx.beginPath();
        ctx.arc(leafX, leafY, 18 * scale, 0, Math.PI * 2);
        ctx.fillStyle = budGr;
        ctx.fill();

        // Petiole (stem connection)
        ctx.beginPath();
        ctx.moveTo(stemX + side * (stemW / 2), leafY);
        ctx.lineTo(leafX, leafY);
        ctx.strokeStyle = "#2d5a2d";
        ctx.lineWidth = 2 * scale;
        ctx.stroke();

        // Leaf ellipse
        ctx.save();
        ctx.translate(leafX, leafY);
        ctx.rotate(side * (0.2 + 0.1 * Math.sin(phase)));
        ctx.scale(scale, scale);
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 10, 0, 0, Math.PI * 2);
        const leafGr = ctx.createRadialGradient(0, 0, 0, 0, 0, 22);
        leafGr.addColorStop(0, "#86efac");
        leafGr.addColorStop(1, "#166534");
        ctx.fillStyle = leafGr;
        ctx.fill();
        ctx.restore();

        // Angle label
        if (i < 12 && i % 2 === 0) {
          ctx.font      = `7px ${mono}`;
          ctx.fillStyle = C.green + "77";
          ctx.textAlign = side > 0 ? "left" : "right";
          ctx.fillText(`${(GOLDEN_ANGLE * (i / 2)).toFixed(0)}°`, side > 0 ? leafX + 26 * scale : leafX - 26 * scale, leafY + 3);
        }
      });

      // Auxin concentration bar (right side)
      for (let y = 0; y < H; y++) {
        const a = 0.9 * Math.exp(-y / (H * 0.55));
        const rr = Math.round(a * 180 + (1 - a) * 20);
        const gg = Math.round(a * 60 + (1 - a) * 160);
        const bb = Math.round((1 - a) * 40);
        ctx.fillStyle = `rgba(${rr},${gg},${bb},0.7)`;
        ctx.fillRect(W - 16, y, 12, 1);
      }
      ctx.font      = `7px ${mono}`;
      ctx.fillStyle = C.muted;
      ctx.textAlign = "right";
      ctx.fillText("HIGH", W - 18, 10);
      ctx.fillText("LOW",  W - 18, H - 4);
      ctx.fillStyle = C.gold + "88";
      ctx.textAlign = "center";
      ctx.fillText("AUXIN", W - 10, H / 2 - 2);
      ctx.textAlign = "left";

      t++;
      rafRef.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "auto", borderRadius: 8 }} />;
}

/* ── helpers ── */
function SecHead({ n, title, sub, color = C.green }: { n: string; title: string; sub: string; color?: string }) {
  return (
    <div style={{ marginTop: 60, scrollMarginTop: 80 }}>
      <div style={{ fontFamily: mono, fontSize: 10, color, letterSpacing: 3, marginBottom: 6 }}>{n}</div>
      <h2 style={{ fontFamily: serif, fontSize: 24, color: "#fff", margin: "0 0 6px" }}>{title}</h2>
      <div style={{ fontFamily: body, fontSize: 15, color: C.muted, marginBottom: 20 }}>{sub}</div>
    </div>
  );
}

function Eq({ children }: { children: string }) {
  return (
    <div style={{
      fontFamily: mono, fontSize: 12, color: C.green,
      background: "#071007", border: `1px solid ${C.green}25`,
      borderRadius: 6, padding: "12px 18px", margin: "10px 0",
      overflowX: "auto", whiteSpace: "pre",
    }}>{children}</div>
  );
}

function ImgPlate({ src, title, anno }: { src: string; title: string; anno: string }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
      <img src={src} alt={title} style={{ width: "100%", display: "block", maxHeight: 320, objectFit: "cover" }} />
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.green, letterSpacing: 2, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{anno}</div>
      </div>
    </div>
  );
}

/* ── Page ── */
export default function InvisibleWindPage() {
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: body, paddingBottom: 100 }}>

      {/* ── Hero ── */}
      <div style={{
        background: `radial-gradient(ellipse 80% 55% at 50% 0%, ${C.green}10 0%, ${C.teal}08 40%, transparent 70%)`,
        borderBottom: `1px solid ${C.border}`,
        padding: "72px 24px 52px", textAlign: "center",
      }}>
        <div style={{ fontFamily: mono, fontSize: 10, color: C.green, letterSpacing: 4, marginBottom: 14 }}>
          AETHER · PNEUMA · PHYLLOTAXIS · INVISIBLE GEOMETRY
        </div>
        <h1 style={{
          fontFamily: serif, fontSize: "clamp(26px, 5vw, 48px)",
          color: "#fff", margin: "0 0 16px", lineHeight: 1.15,
        }}>
          The Invisible Wind
        </h1>
        <p style={{ fontSize: 17, color: C.muted, maxWidth: 620, margin: "0 auto 28px", lineHeight: 1.75 }}>
          The same force — called pneuma, prana, qi, ruach, anima — organises matter into spirals,
          leaves, petals, and seeds. In the body it is auxin. In the cosmos it is the coherence field.
          Plants do not choose to spiral. They are shaped by an invisible wind.
        </p>
        <div style={{
          display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
        }}>
          {[
            { word: "PNEUMA",  lang: "Greek",     meaning: "breath · spirit · organizing wind" },
            { word: "PRANA",   lang: "Sanskrit",  meaning: "life-force · breath of the cosmos" },
            { word: "QI",      lang: "Chinese",   meaning: "vital energy · invisible circulation" },
            { word: "RUACH",   lang: "Hebrew",    meaning: "wind · spirit · the breath of God" },
            { word: "ANIMA",   lang: "Latin",     meaning: "soul · the animating breath" },
          ].map(t => (
            <div key={t.word} style={{
              background: `${C.green}0e`, border: `1px solid ${C.green}30`,
              borderRadius: 8, padding: "10px 16px", textAlign: "center",
            }}>
              <div style={{ fontFamily: serif, fontSize: 15, color: C.green }}>{t.word}</div>
              <div style={{ fontFamily: mono, fontSize: 8, color: C.muted, marginTop: 2 }}>{t.lang}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4, maxWidth: 140 }}>{t.meaning}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 22px" }}>

        {/* ── Phyllotaxis ── */}
        <SecHead
          n="§ I · PHYLLOTAXIS · THE SPIRAL TRACE"
          title="Why Plants Grow the Way They Do"
          sub="Drag the slider. Every angle except 137.5° creates visible spokes — crowded lines and empty gaps. The golden angle is the only angle where every point has equal neighbours."
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start" }}>
          <div style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12 }}>
            <PhyllotaxisCanvas />
          </div>
          <div>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: C.muted, margin: "0 0 16px" }}>
              Every seed in a sunflower, every scale on a pine cone, every leaf on a stem — placed at
              <strong style={{ color: C.gold }}> 137.5077°</strong> from the previous one. This is the
              golden angle: 360° × (2 − φ). Not chosen, not designed. Forced by physics.
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.8, color: C.muted, margin: "0 0 16px" }}>
              The invisible wind is the auxin concentration gradient — a pressure field flowing
              outward from the growing tip. Each new primordium forms at the lowest-auxin point,
              which is always the golden angle from the last one. The spiral is the shadow of the field.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { n: "13", c: C.green,  d: "Fibonacci spirals visible in most sunflowers (clockwise)" },
                { n: "21", c: C.lime,   d: "Fibonacci spirals counter-clockwise in same sunflower" },
                { n: "8",  c: C.teal,   d: "Fibonacci spirals in pine cone base layer" },
                { n: "φ",  c: C.gold,   d: "The ratio between consecutive Fibonacci numbers converges here" },
              ].map(x => (
                <div key={x.n} style={{
                  background: `${x.c}0e`, border: `1px solid ${x.c}30`,
                  borderRadius: 8, padding: "12px 14px", textAlign: "center",
                }}>
                  <div style={{ fontFamily: serif, fontSize: 24, color: x.c }}>{x.n}</div>
                  <div style={{ fontSize: 11, color: C.muted, marginTop: 4, lineHeight: 1.5 }}>{x.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Auxin Wave ── */}
        <SecHead
          n="§ II · AUXIN · THE BIOLOGICAL INVISIBLE WIND"
          title="The Flowing Field Inside Every Plant"
          sub="Auxin (indole-3-acetic acid) is a hormone that flows from the growing tip downward through the plant. Its concentration gradient is the invisible wind. New leaves appear where it is lowest."
        />
        <div style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 12, padding: 12, marginBottom: 20 }}>
          <AuxinCanvas />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[
            { label: "Source",      col: C.gold,  body: "The growing tip (apical meristem) produces a constant flow of auxin downward. High concentration = inhibits lateral bud growth. This is why cut the top of a plant = side branches explode." },
            { label: "Gradient",    col: C.green, body: "The gradient ∇A (direction of steepest auxin descent) determines where the next leaf primordium forms. Always at the lowest local auxin point — always at phi from the last one." },
            { label: "Wave",        col: C.teal,  body: "Auxin doesn't just diffuse — it moves by polar auxin transport (PAT), pumped by PIN proteins in a directional wave. Ca²⁺ signals co-propagate. The invisible wind has direction and speed." },
          ].map(s => (
            <div key={s.label} style={{
              background: C.panel, border: `1px solid ${s.col}25`, borderRadius: 8, padding: "16px 16px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: s.col, letterSpacing: 2, marginBottom: 8 }}>{s.label}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.7 }}>{s.body}</div>
            </div>
          ))}
        </div>

        <Eq>{"AUXIN DIFFUSION-REACTION FIELD:\n  ∂A/∂t = D∇²A − k·A + s(x,t)\n  D  = diffusion constant (PAT pumping)\n  k  = auxin degradation rate\n  s  = source term (growing tip production)\n\nNew primordium forms at: x* = argmin_x A(x,t)\n  → always at golden angle from previous: Δθ = 360° × (2−φ) = 137.5°\n\nThe Laplacian ∇² is the same operator in:\n  — Auxin gradients (biology)\n  — Gravitational field (physics)\n  — AETHER coherence field C(x,t) (unified)\nThe invisible wind is one equation at every scale."}</Eq>

        {/* ── Ancient Wisdom ── */}
        <SecHead
          n="§ III · THE ANCIENT NAMES"
          title="What Every Culture Felt"
          sub="The invisible wind was perceived independently by every major civilisation. They named it differently but described the same phenomenon — an organizing, flowing, invisible force that gives matter its form."
          color={C.violet}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[
            {
              name: "PNEUMA · Greece",   col: C.violet,
              body: "Aristotle described pneuma as the force that transmits form from parent to offspring and organises the development of living things. Not soul, not matter — but the organizing breath between them. Galen mapped it through blood vessels. Stoics said it pervades the entire cosmos as a tensile force holding all things in form.",
            },
            {
              name: "PRANA · Vedic India", col: C.pink,
              body: "The Upanishads describe prana as the first movement in the cosmos — before form, before matter, prana was already flowing. In plants it is called vyana prana — the distributing breath that moves nutrients from root to leaf to flower. The five pranas map to the five directions of auxin flow: upward (udana), downward (apana), distributed (vyana), centred (samana), outward (prana).",
            },
            {
              name: "QI · China",          col: C.teal,
              body: "Traditional Chinese medicine mapped qi flow in 12 meridians corresponding to organ systems. Plants have qi too — expressed as the life-force that determines direction of growth, flowering timing, and response to environment. Acupuncture points (acupoints) on the body correspond to regions of lowest electrical resistance — the body's equivalent of auxin low-points where new structure forms.",
            },
            {
              name: "RUACH · Hebrew",      col: C.gold,
              body: "Genesis 1:2 — 'the spirit (ruach) of God was hovering over the face of the waters.' Ruach is the same word for wind and spirit. The Kabbalistic tradition maps ruach as the organizing breath of the sefiroth, the divine blueprint that patterns matter. In Kabbalah, the tree of life (Etz Chayyim) is literally a tree — an organizational diagram of how invisible flow patterns material reality.",
            },
          ].map(s => (
            <div key={s.name} style={{
              background: C.panel, border: `1px solid ${s.col}25`, borderRadius: 10, padding: "18px 18px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 9, color: s.col, letterSpacing: 2, marginBottom: 10 }}>{s.name}</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75 }}>{s.body}</div>
            </div>
          ))}
        </div>

        {/* ── Cymatics ── */}
        <SecHead
          n="§ IV · CYMATICS · WIND MADE VISIBLE"
          title="Sound as the Visible Wind"
          sub="Cymatics is the study of visible sound — vibration (compressed air waves) organising sand, water, and powder into geometric patterns. This is the invisible wind caught in the act."
          color={C.amber}
        />
        <p style={{ fontSize: 15, lineHeight: 1.8, color: C.muted, marginBottom: 16 }}>
          Hans Jenny (1967) showed that specific sound frequencies produce specific geometric patterns in vibrated media. The patterns are not random — they follow the same mathematical principles as phyllotaxis, crystal lattices, and standing wave interference. At certain frequencies, the Chladni figures match exactly the cross-sections of plant stems, the arrangements of flower petals, and the lattice structures of minerals.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 20 }}>
          {[
            { freq: "110 Hz",  pattern: "2-fold cross",        plant: "~dicot stem cross-section" },
            { freq: "220 Hz",  pattern: "4-fold star",         plant: "~4-petal flower" },
            { freq: "432 Hz",  pattern: "6-fold hexagon",      plant: "~honeycomb / benzene ring" },
            { freq: "528 Hz",  pattern: "12-fold mandala",     plant: "~composite flower head" },
            { freq: "741 Hz",  pattern: "phi-spiral nodes",    plant: "~sunflower seed spiral" },
            { freq: "1111 Hz", pattern: "fractal branching",   plant: "~bronchial / root system" },
          ].map(c => (
            <div key={c.freq} style={{
              background: C.panel, border: `1px solid ${C.amber}20`, borderRadius: 8, padding: "12px 14px",
            }}>
              <div style={{ fontFamily: mono, fontSize: 12, color: C.amber }}>{c.freq}</div>
              <div style={{ fontSize: 12, color: C.text, margin: "4px 0" }}>{c.pattern}</div>
              <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.5 }}>{c.plant}</div>
            </div>
          ))}
        </div>

        {/* ── Liquid Print Connection ── */}
        <SecHead
          n="§ V · LIQUID PRINT · THE SAME PRESSURE"
          title="When We Replicate the Invisible Wind"
          sub="Liquid printing (rapid gel scaffold extrusion, conductive fluid deposition) works by the same pressure-gradient principle as auxin flow. The printing nozzle is the apical meristem."
          color={C.teal}
        />
        <div style={{
          background: `${C.teal}0a`, border: `1px solid ${C.teal}30`,
          borderRadius: 10, padding: "20px 24px", marginBottom: 20,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.teal, letterSpacing: 2, marginBottom: 8 }}>PLANT AUXIN FLOW</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75 }}>
                Apical meristem produces auxin → polar auxin transport (PIN proteins) → gradient forms → primordia appear at low-auxin points → structure emerges without central control. The plant does not "plan" its form — the form is the shape of the field.
              </div>
            </div>
            <div>
              <div style={{ fontFamily: mono, fontSize: 9, color: C.green, letterSpacing: 2, marginBottom: 8 }}>LIQUID PRINT EXTRUSION</div>
              <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.75 }}>
                Print head produces bioink → pressure gradient in gel medium → material deposits at pressure-minimum points → scaffold structure emerges → living cells populate the scaffold. The design is the shape of the pressure field.
              </div>
            </div>
          </div>
        </div>

        {/* ── Scale table ── */}
        <SecHead
          n="§ VI · THE INVISIBLE WIND AT EVERY SCALE"
          title="One Equation, Every Level"
          sub="The same Laplacian-governed pressure-gradient field produces phi spirals from quantum to cosmic scale."
          color={C.green}
        />
        <div style={{ background: C.deep, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden", marginBottom: 20 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr",
            background: C.panel, padding: "10px 18px",
            borderBottom: `1px solid ${C.border}`,
            fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 2,
          }}>
            <span>SCALE</span><span>MEDIUM</span><span>INVISIBLE WIND</span><span>VISIBLE TRACE</span>
          </div>
          {[
            { scale: "Quantum",    med: "quantum field",    wind: "zero-point pressure field",         trace: "electron orbital shape (s/p/d symmetry)" },
            { scale: "Molecular",  med: "protein",          wind: "hydrophobic collapse gradient",     trace: "protein fold — spiral alpha helix" },
            { scale: "Cellular",   med: "cytoplasm",        wind: "cytoskeletal tension field",        trace: "cell division axis, mitotic spindle" },
            { scale: "Plant",      med: "parenchyma",       wind: "auxin concentration gradient",     trace: "leaf spiral, petal count, root fractal" },
            { scale: "Body",       med: "interstitial fluid",wind: "bioelectric gradient (Levin field)", trace: "organ polarity, limb axis, face symmetry" },
            { scale: "Earth",      med: "atmosphere",       wind: "Coriolis pressure field",           trace: "hurricane spiral, trade wind bands" },
            { scale: "Galaxy",     med: "dark matter halo", wind: "gravitational density wave",        trace: "spiral arm phi-angle pattern" },
          ].map((r, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "120px 1fr 1fr 1fr",
              padding: "12px 18px",
              borderBottom: i < 6 ? `1px solid ${C.dim}` : "none",
            }}>
              <div style={{ fontFamily: mono, fontSize: 11, color: C.green }}>{r.scale}</div>
              <div style={{ fontSize: 12, color: C.text }}>{r.med}</div>
              <div style={{ fontSize: 12, color: C.muted }}>{r.wind}</div>
              <div style={{ fontSize: 12, color: C.lime }}>{r.trace}</div>
            </div>
          ))}
        </div>

        <Eq>{"UNIFIED INVISIBLE WIND EQUATION:\n  F = −∇U(x,t)  [force = negative gradient of potential]\n\nAt each scale, U is:\n  Quantum:   U = zero-point vacuum energy density\n  Plant:     U = auxin concentration A(x,t)\n  Body:      U = bioelectric potential V(x,t)\n  Cosmos:    U = gravitational potential Φ(x,t)\n\nIn all cases, structure forms at the MINIMUM of U (∇U → 0)\nAt the minimum, the golden angle emerges because:\n  φ = argmin_θ { overlap(θ) }  over θ ∈ [0°, 360°]\n  → unique solution: θ = 360° × (2−φ) = 137.5077°"}</Eq>

        {/* ── Image plates ── */}
        <SecHead
          n="§ VII · REFERENCE PLATES"
          title="The Field Made Visible"
          sub="Toroidal field structures, phi resonance geometry, and Fibonacci torus topology — the invisible wind frozen into image."
          color={C.muted}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <ImgPlate
            src={imgFibTorus}
            title="FIBONACCI TORUS"
            anno="The phi-spiral traced on a torus surface — the same topology as a plant stem's vascular system. The invisible wind wraps around itself."
          />
          <ImgPlate
            src={imgPhiResonance}
            title="PHI RESONANCE FIELD"
            anno="Golden ratio interference pattern — where two phi-scaled waves overlap, constructive interference creates the Fibonacci nodes that plants grow from."
          />
          <ImgPlate
            src={imgTorusField}
            title="TORUS FIELD CROSS-SECTION"
            anno="Cross-section of a toroidal field showing the return flow. Plant phloem and xylem run in opposing-direction toroidal loops — the invisible wind circulates."
          />
        </div>

        {/* ── Synthesis ── */}
        <div style={{
          marginTop: 60,
          background: `linear-gradient(135deg, ${C.green}0e 0%, ${C.teal}08 100%)`,
          border: `1px solid ${C.green}35`,
          borderRadius: 14, padding: "36px 40px", textAlign: "center",
        }}>
          <div style={{ fontFamily: mono, fontSize: 9, color: C.muted, letterSpacing: 3, marginBottom: 16 }}>
            THE SYNTHESIS
          </div>
          <p style={{ fontFamily: serif, fontSize: "clamp(15px, 2.3vw, 20px)", color: "#fff", lineHeight: 1.7, margin: "0 0 14px" }}>
            Plants do not decide to spiral. They are shaped by an invisible pressure field.
          </p>
          <p style={{ fontFamily: serif, fontSize: "clamp(15px, 2.3vw, 20px)", color: C.green, lineHeight: 1.7, margin: "0 0 14px" }}>
            That field is auxin. That field is qi. That field is pneuma. That field is ruach.
          </p>
          <p style={{ fontSize: 14, color: C.muted, maxWidth: 560, margin: "0 auto", lineHeight: 1.8 }}>
            Every culture that watched plants grow carefully enough eventually felt the same thing — an invisible organizing breath flowing through living matter, leaving spirals and fractals as its fingerprint. Modern biology calls it a diffusion-reaction field governed by the Laplacian. Ancient wisdom called it wind. Both are correct.
          </p>
        </div>

        {/* ── Footer links ── */}
        <div style={{
          marginTop: 48, paddingTop: 28, borderTop: `1px solid ${C.dim}`,
          display: "flex", flexWrap: "wrap", gap: 10,
        }}>
          {[
            { href: "/liquid-print",           label: "→ Liquid Print" },
            { href: "/fibonacci-replicant",    label: "→ Fibonacci Replicant" },
            { href: "/plant-electroactivity",  label: "→ Plant Electroactivity" },
            { href: "/plant-intel",            label: "→ Plant Intel" },
            { href: "/circular-farm",          label: "→ Circular Farm (phi-spiral)" },
            { href: "/crystallization-atlas",  label: "→ Crystallization Atlas" },
            { href: "/gradient-field",         label: "→ Gradient Field" },
          ].map(l => (
            <a key={l.href} href={l.href} style={{
              fontFamily: mono, fontSize: 11, color: C.green,
              background: `${C.green}10`, border: `1px solid ${C.green}30`,
              borderRadius: 6, padding: "6px 14px", textDecoration: "none",
            }}>{l.label}</a>
          ))}
        </div>

      </div>
    </div>
  );
}

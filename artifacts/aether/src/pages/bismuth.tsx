import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "wouter";
import imgHydrostatic from "@assets/805c76b0-3353-4c63-9310-1e7c2af8434f_1782925240255.jpg";
import imgAetherTable from "@assets/13de39eb-e52f-42ff-8b68-3035082613d5_1782925137742.jpg";

const C = {
  bg: "#05060C",
  panel: "#0b0e18",
  panel2: "#0e1224",
  border: "#1a2340",
  text: "#b8cce8",
  muted: "#5a708c",
};

const COULOMB_BARRIER = 26.4; // MeV, alpha + Bi-209

const FACTS = [
  { k: "Symbol · Z", v: "Bi · 83" },
  { k: "Atomic Mass", v: "208.98 u" },
  { k: "Class", v: "Post-transition semimetal" },
  { k: "Crystal Structure", v: "Rhombohedral R3̄m" },
  { k: "Density", v: "9.78 g/cm³" },
  { k: "Melting Point", v: "271.4 °C" },
  { k: "Magnetism", v: "Strongest natural diamagnet" },
  { k: "Oxidation States", v: "+3 (common) · +5 · −3" },
];

const MATH = [
  { eq: "²⁰⁹Bi + ⁴He → ²¹¹At + 2n", note: "The cyclotron synthesis of astatine: bismuth-209 absorbs a helium nucleus (alpha particle) and ejects two neutrons." },
  { eq: "E_c = 1.44 · Z₁Z₂ / (r₁ + r₂)   [MeV, fm]", note: "The Coulomb barrier — the electrostatic wall the alpha must climb. For α + Bi this is about 26 MeV." },
  { eq: "r = r₀ (A₁^⅓ + A₂^⅓),  r₀ = 1.2 fm ≈ 9.0 fm", note: "Nuclear touching radius set by the cube roots of the mass numbers (4 and 209)." },
  { eq: "T ∝ exp(−2πη),  η = Z₁Z₂e² / ħv", note: "Gamow tunneling factor: the probability of crossing the barrier collapses toward zero as the alpha's speed v drops." },
  { eq: "⁴₂He²⁺ = 2 protons + 2 neutrons", note: "An alpha particle IS a helium-4 nucleus — a tightly bound, doubly-magic packet of nuclear matter." },
  { eq: "²⁰⁹Bi → ²⁰⁵Tl + α,  t½ = 2.0 × 10¹⁹ yr", note: "Even 'stable' bismuth slowly alpha-decays — a half-life a billion times the age of the universe." },
];

const VERBAL = [
  { t: "The energy threshold", d: "If the alpha particle arrives with less kinetic energy than the ~26 MeV Coulomb barrier, its tunneling probability is essentially zero — the reaction cannot proceed. Not enough energy, and it cannot work well. Push past the barrier and astatine crystallizes out of the collision." },
  { t: "Why bismuth", d: "Bismuth-209 is the heaviest quasi-stable nucleus and sits exactly one alpha step below astatine on the chart of nuclides. Adding a helium nucleus and removing two neutrons lands precisely on ²¹¹At — nature's shortest path to element 85." },
  { t: "Semimetal, not semiconductor", d: "Pure bismuth is a semimetal: its conduction and valence bands barely overlap, giving it very few, very light charge carriers, a giant Hall effect, and record diamagnetism. Thin films and bismuth compounds cross fully into semiconducting behaviour." },
  { t: "The iridescent oxide", d: "Bismuth's hopper crystals grow a nanometre-thin oxide layer that splits white light into the rainbow staircase seen in the mineral specimens — thin-film interference, the same physics as a soap bubble." },
  { t: "Alpha therapy", d: "²¹¹At made this way is a targeted alpha-particle cancer therapy: its short-range, high-energy alphas destroy tumour cells within a few cell diameters while sparing tissue beyond." },
  { t: "Form and decay", d: "The same alpha particle both builds and unbuilds heavy matter: absorbed above threshold it forms new elements; emitted spontaneously it decays them. Coherence in, coherence out — the one atom rearranging itself." },
];

function hexA(h: string, a: number) {
  const n = h.replace("#", "");
  return `rgba(${parseInt(n.slice(0, 2), 16)},${parseInt(n.slice(2, 4), 16)},${parseInt(n.slice(4, 6), 16)},${a})`;
}

function fitCanvas(cv: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  const w = cv.clientWidth || 600;
  const h = cv.clientHeight || 260;
  cv.width = Math.round(w * dpr);
  cv.height = Math.round(h * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { w, h };
}

export default function BismuthPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "system-ui, Arial, sans-serif", padding: "26px 20px 70px", boxSizing: "border-box" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{
            width: 96, height: 96, borderRadius: 16, flexShrink: 0,
            border: "1px solid #c98bff", background: "linear-gradient(135deg,#2a1840,#12203a)",
            display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
            boxShadow: "0 0 30px rgba(201,139,255,0.3)",
          }}>
            <div style={{ fontSize: 11, color: "#c9a4ff", fontFamily: "monospace" }}>83</div>
            <div style={{ fontSize: 42, fontWeight: 900, color: "#e0c6ff", lineHeight: 1 }}>Bi</div>
            <div style={{ fontSize: 9, color: "#9a7bd0" }}>208.98</div>
          </div>
          <div>
            <div style={{
              fontSize: 30, fontWeight: 900, letterSpacing: 1,
              background: "linear-gradient(90deg,#c98bff,#7fd6ff,#ffcf80)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}>BISMUTH</div>
            <div style={{ color: C.muted, fontSize: 12.5, marginTop: 5, maxWidth: 560, lineHeight: 1.5 }}>
              The heaviest quasi-stable element — a rainbow-oxide semimetal, and the raw material from which astatine is forged by helium nuclei.
            </div>
          </div>
        </div>

        {/* Facts grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8, margin: "22px 0 8px" }}>
          {FACTS.map((f) => (
            <div key={f.k} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
              <div style={{ fontSize: 8.5, color: C.muted, fontFamily: "monospace", marginBottom: 3 }}>{f.k.toUpperCase()}</div>
              <div style={{ fontSize: 12.5, color: "#e6eeff", fontWeight: 600 }}>{f.v}</div>
            </div>
          ))}
        </div>

        {/* Synthesis / Coulomb barrier */}
        <Section title="Helium Nuclei · Alpha Particles · The Energy Threshold" sub="²⁰⁹Bi(α,2n)²¹¹At — drive the alpha's energy across the Coulomb barrier" accent="#ffcf80">
          <SynthesisCanvas />
          <div style={{ marginTop: 12, background: hexA("#ffcf80", 0.06), border: "1px solid #3a3320", borderRadius: 10, padding: "11px 14px", fontSize: 12.5, lineHeight: 1.6, color: "#e8d8b0" }}>
            If the alpha particle carries <b>less than ~{COULOMB_BARRIER} MeV</b>, it is repelled by the bismuth nucleus and bounces off — tunneling probability drops to almost zero, and no astatine forms. <b>If not enough energy, it cannot work well.</b> Above the barrier the alpha fuses, two neutrons boil off, and ²¹¹At is born.
          </div>
        </Section>

        {/* Alpha decay */}
        <Section title="Formation & Decay — the Two-Way Alpha" sub="The same helium nucleus that builds heavy matter also carries it away" accent="#c98bff">
          <AlphaDecayCanvas />
        </Section>

        {/* Math */}
        <Section title="The Mathematics" sub="Coulomb barrier, tunneling, and the alpha budget" accent="#7fd6ff">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 10 }}>
            {MATH.map((m, i) => (
              <div key={i} style={{ background: C.panel, border: `1px solid ${C.border}`, borderLeft: "3px solid #7fd6ff", borderRadius: 10, padding: "11px 13px" }}>
                <div style={{ fontFamily: "monospace", fontSize: 12.5, color: "#7fd6ff", marginBottom: 6, overflowX: "auto" }}>{m.eq}</div>
                <div style={{ fontSize: 11, color: "#8ea6c4", lineHeight: 1.5 }}>{m.note}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Verbal */}
        <Section title="In Words" sub="What the physics means" accent="#a68bff">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 10 }}>
            {VERBAL.map((v, i) => (
              <div key={i} style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#c8b0ff", marginBottom: 6 }}>{v.t}</div>
                <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6 }}>{v.d}</div>
              </div>
            ))}
          </div>
        </Section>

        {/* Source plates */}
        <Section title="Source Atlas" sub="Astatine, oxidation states, and the orthorhombic structure" accent="#ff6699">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12 }}>
            <Plate src={imgHydrostatic} cap="AETHER System — hydrostatic acid, orthorhombic structure, and Astatine oxidation states." />
            <Plate src={imgAetherTable} cap="AETHER periodic table — diatomics, orthorhombic semiconductor, and matter-synthesis substrates." />
          </div>
        </Section>

        {/* Footer nav */}
        <div style={{ marginTop: 40, display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/periodic-table" style={navBtn("#7fd6ff")}>← AETHER Periodic Table</Link>
          <Link href="/bioluminescence-spectrum" style={navBtn("#44ee88")}>Bioluminescence Spectrum →</Link>
        </div>
      </div>
    </div>
  );
}

function navBtn(color: string) {
  return {
    display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none",
    fontSize: 12, padding: "9px 15px", borderRadius: 8,
    border: `1px solid ${hexA(color, 0.5)}`, color, background: hexA(color, 0.1), cursor: "pointer",
  } as const;
}

function Section({ title, sub, accent, children }: { title: string; sub: string; accent: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 38 }}>
      <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 17, fontWeight: 800, color: "#fff" }}>{title}</div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 3 }}>{sub}</div>
      </div>
      {children}
    </div>
  );
}

function Plate({ src, cap }: { src: string; cap: string }) {
  return (
    <figure style={{ margin: 0, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12, overflow: "hidden" }}>
      <img src={src} alt={cap} style={{ width: "100%", display: "block", borderBottom: `1px solid ${C.border}` }} />
      <figcaption style={{ fontSize: 10.5, color: "#8ea6c4", lineHeight: 1.5, padding: "9px 11px" }}>{cap}</figcaption>
    </figure>
  );
}

function Readout({ k, v, color, refEl }: { k: string; v?: string; color: string; refEl?: React.Ref<HTMLSpanElement> }) {
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px", minWidth: 88 }}>
      <div style={{ fontSize: 8.5, color: C.muted, fontFamily: "monospace" }}>{k}</div>
      <div style={{ fontSize: 12.5, color, fontFamily: "monospace" }}>{refEl ? <span ref={refEl}>—</span> : v}</div>
    </div>
  );
}

function SynthesisCanvas() {
  const cref = useRef<HTMLCanvasElement>(null);
  const eRef = useRef(18);
  const pOut = useRef<HTMLSpanElement>(null);
  const stateOut = useRef<HTMLSpanElement>(null);
  const [energy, setEnergy] = useState(18);

  useEffect(() => {
    const cv = cref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let dim = fitCanvas(cv, ctx);
    const onR = () => { dim = fitCanvas(cv, ctx); };
    window.addEventListener("resize", onR);

    // alpha state machine
    let ax = 0;
    let phase = 0; // 0 approach, 1 success, 2 reflect
    let reset = 0;
    let lastFused = false;
    let attempted = false;
    const products: { x: number; y: number; vx: number; vy: number; life: number; kind: string }[] = [];

    const loop = () => {
      const w = dim.w;
      const h = dim.h;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0a0713";
      ctx.fillRect(0, 0, w, h);

      const E = eRef.current;
      const P = 1 / (1 + Math.exp(-(E - COULOMB_BARRIER) / 1.6));
      const likely = P >= 0.5;

      // ── potential curve V(r) ──
      const baseY = h * 0.62;
      const nucX = w * 0.72;
      const peakH = 78;
      ctx.strokeStyle = "rgba(255,207,128,0.5)";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let px = 20; px < nucX + 40; px += 2) {
        const r = Math.max(6, nucX - px);
        let V = 1.44 * 2 * 83 / (r * 0.35 + 9); // scaled Coulomb
        V = Math.min(peakH, V);
        if (px > nucX - 20) V = -40 * (1 - (nucX - px) / 20); // well inside
        const y = baseY - V;
        if (px === 20) ctx.moveTo(px, y); else ctx.lineTo(px, y);
      }
      ctx.stroke();
      // barrier label
      ctx.fillStyle = "rgba(255,207,128,0.8)";
      ctx.font = "10px monospace";
      ctx.fillText("Coulomb barrier ≈ 26 MeV", nucX - 150, baseY - peakH - 8);

      // ── energy line for the alpha ──
      const eY = baseY - (E / 40) * peakH;
      ctx.strokeStyle = likely ? "rgba(120,255,180,0.7)" : "rgba(255,110,110,0.7)";
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      ctx.moveTo(20, eY);
      ctx.lineTo(nucX, eY);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = likely ? "#8effc0" : "#ff9a9a";
      ctx.fillText(`E_α = ${E.toFixed(1)} MeV`, 24, eY - 6);

      // ── bismuth nucleus ──
      const nucY = baseY - 6;
      const ng = ctx.createRadialGradient(nucX, nucY, 2, nucX, nucY, 26);
      ng.addColorStop(0, "#e0c6ff");
      ng.addColorStop(1, "rgba(120,80,180,0.15)");
      ctx.fillStyle = ng;
      ctx.beginPath();
      ctx.arc(nucX, nucY, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2a1840";
      ctx.font = "bold 12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Bi", nucX, nucY + 4);
      ctx.textAlign = "left";

      // ── alpha particle motion ──
      if (phase === 0) {
        ax += 1.6 + E * 0.05;
        const alphaX = 24 + ax;
        if (alphaX >= nucX - 26) {
          attempted = true;
          lastFused = Math.random() < P;
          if (lastFused) {
            phase = 1;
            products.length = 0;
            products.push({ x: nucX, y: nucY, vx: 0, vy: 0, life: 60, kind: "At" });
            products.push({ x: nucX, y: nucY, vx: 2.4, vy: -1.6, life: 70, kind: "n" });
            products.push({ x: nucX, y: nucY, vx: 2.6, vy: 1.8, life: 70, kind: "n" });
          } else {
            phase = 2;
          }
        } else {
          drawAlpha(ctx, alphaX, eY);
        }
      } else if (phase === 2) {
        ax -= 3;
        const alphaX = 24 + ax;
        drawAlpha(ctx, alphaX, eY);
        if (alphaX <= 24) { phase = 0; ax = 0; }
      } else if (phase === 1) {
        for (let i = products.length - 1; i >= 0; i--) {
          const p = products[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= 1;
          if (p.kind === "At") {
            const g = ctx.createRadialGradient(p.x, p.y, 2, p.x, p.y, 24);
            g.addColorStop(0, "#ff9ac1");
            g.addColorStop(1, "rgba(255,102,153,0.1)");
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 22, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#3a0018";
            ctx.font = "bold 11px monospace";
            ctx.textAlign = "center";
            ctx.fillText("At", p.x, p.y + 4);
            ctx.textAlign = "left";
          } else {
            ctx.fillStyle = "rgba(200,220,255,0.9)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
            ctx.fill();
          }
          if (p.life <= 0 && p.kind !== "At") products.splice(i, 1);
        }
        reset += 1;
        if (reset > 90) { phase = 0; ax = 0; reset = 0; }
      }

      if (pOut.current) pOut.current.textContent = (P * 100).toFixed(P < 0.1 ? 3 : 1) + "%";
      if (stateOut.current) stateOut.current.textContent = !attempted ? "firing…" : lastFused ? "→ ²¹¹At FORMED" : "STALLED · repelled";

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);

  return (
    <div>
      <canvas ref={cref} style={{ width: "100%", height: 260, display: "block", borderRadius: 12, border: `1px solid ${C.border}`, background: "#0a0713" }} />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center", marginTop: 12 }}>
        <label style={{ fontSize: 11, color: "#8ea6c4", display: "flex", flexDirection: "column", gap: 4, minWidth: 260 }}>
          <span>Alpha kinetic energy — {energy.toFixed(1)} MeV &nbsp;(barrier ≈ {COULOMB_BARRIER})</span>
          <input type="range" min={5} max={40} step={0.5} value={energy} onChange={(e) => { const v = parseFloat(e.target.value); setEnergy(v); eRef.current = v; }} />
        </label>
        <div style={{ display: "flex", gap: 10 }}>
          <Readout k="TUNNEL P" color="#7fd6ff" refEl={pOut} />
          <Readout k="OUTCOME" color="#a8ffcf" refEl={stateOut} />
          <Readout k="BARRIER" color="#ffcf80" v={`${COULOMB_BARRIER} MeV`} />
        </div>
      </div>
    </div>
  );
}

function drawAlpha(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const g = ctx.createRadialGradient(x, y, 1, x, y, 12);
  g.addColorStop(0, "#fff2c0");
  g.addColorStop(1, "rgba(255,207,128,0.1)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5a3800";
  ctx.font = "bold 9px monospace";
  ctx.textAlign = "center";
  ctx.fillText("α", x, y + 3);
  ctx.textAlign = "left";
}

function AlphaDecayCanvas() {
  const cref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = cref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    let dim = fitCanvas(cv, ctx);
    const onR = () => { dim = fitCanvas(cv, ctx); };
    window.addEventListener("resize", onR);

    const alphas: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

    const loop = () => {
      t += 0.016;
      const w = dim.w;
      const h = dim.h;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#0a0713";
      ctx.fillRect(0, 0, w, h);

      const nx = w * 0.5;
      const ny = h * 0.5;
      const pulse = 1 + 0.06 * Math.sin(t * 3);

      // nucleus (cluster of nucleons)
      const R = 34 * pulse;
      const g = ctx.createRadialGradient(nx, ny, 4, nx, ny, R);
      g.addColorStop(0, "#e0c6ff");
      g.addColorStop(1, "rgba(120,80,180,0.12)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(nx, ny, R, 0, Math.PI * 2);
      ctx.fill();
      // nucleons
      for (let i = 0; i < 26; i++) {
        const aa = (i / 26) * Math.PI * 2 + t * 0.5;
        const rr = (R - 8) * Math.sqrt((i % 7) / 7);
        ctx.fillStyle = i % 2 ? "rgba(180,140,255,0.8)" : "rgba(120,200,255,0.8)";
        ctx.beginPath();
        ctx.arc(nx + Math.cos(aa) * rr, ny + Math.sin(aa) * rr, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }

      // periodic alpha emission
      if (Math.sin(t * 3) > 0.985 && alphas.length < 8) {
        const dir = Math.random() * Math.PI * 2;
        alphas.push({ x: nx, y: ny, vx: Math.cos(dir) * 2.4, vy: Math.sin(dir) * 2.4, life: 130 });
      }
      for (let i = alphas.length - 1; i >= 0; i--) {
        const p = alphas[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        const ag = ctx.createRadialGradient(p.x, p.y, 1, p.x, p.y, 11);
        ag.addColorStop(0, "#fff2c0");
        ag.addColorStop(1, "rgba(255,207,128,0.08)");
        ctx.fillStyle = ag;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#5a3800";
        ctx.font = "bold 8px monospace";
        ctx.textAlign = "center";
        ctx.fillText("α", p.x, p.y + 3);
        ctx.textAlign = "left";
        if (p.life <= 0 || p.x < -20 || p.x > w + 20 || p.y < -20 || p.y > h + 20) alphas.splice(i, 1);
      }

      ctx.fillStyle = "rgba(200,176,255,0.85)";
      ctx.font = "11px monospace";
      ctx.fillText("²⁰⁹Bi → ²⁰⁵Tl + α  (emit: DECAY)", 16, h - 34);
      ctx.fillStyle = "rgba(255,207,128,0.85)";
      ctx.fillText("²⁰⁹Bi + α → ²¹¹At  (absorb: FORM, needs energy)", 16, h - 16);

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onR); };
  }, []);

  return <canvas ref={cref} style={{ width: "100%", height: 260, display: "block", borderRadius: 12, border: `1px solid ${C.border}`, background: "#0a0713" }} />;
}

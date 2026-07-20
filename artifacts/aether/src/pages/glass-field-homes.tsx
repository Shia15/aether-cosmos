/*═══════════════════════════════════════════════════════════════════
  Glass Field Substrate · Living Home Housing Network
  Refractive glass-jelly homes · solar + geomagnetic + water carved
  interfaces · φ-spiral sky-rise packing · adaptive rhombus flex lattice

  Fully mathematical, navigable, manipulable home-development system.

  Governing mathematics:
  ── Snell refraction:      n₁ sinθ₁ = n₂ sinθ₂
  ── Gel index gradient:    n(z) = n₀ + Δn · f(solar, water)
  ── φ-spiral (Vogel):      θₙ = n·137.507764°,  rₙ = c√n
  ── Solar harvest:         P = η · G_s · A · cosθ_sun
  ── Geomagnetic coupling:  F = q(v × B),  water carve ∝ |∇B|
  ── Rhombus flex mesh:     adaptive resolution ∝ |∇flow|
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";
import magStorm  from "@assets/A6805E91-9684-4C59-BFC8-482EF421381D_1784561445345.png";
import omniFlow  from "@assets/72D555D1-E91E-4B74-A73B-4628B8538AA1_1784561445345.png";
import skyrmion  from "@assets/IMG_4534_1784561445345.png";

const P = {
  bg: "#04070d", panel: "#070c14", panel2: "#0b131d",
  gold: "#fbbf24", ivory: "#eef4f8", dim: "rgba(238,244,248,0.52)",
  line: "rgba(103,232,249,0.08)", muted: "rgba(238,244,248,0.28)",
  glass: "#67e8f9", violet: "#a78bfa", teal: "#2dd4bf",
  green: "#4ade80", rose: "#fb7185", blue: "#60a5fa", amber: "#fbbf24",
};

function Tag({ label, color = P.glass }: { label: string; color?: string }) {
  return <div style={{ fontSize: 9, fontWeight: 700, color, letterSpacing: 2, textTransform: "uppercase" as const, marginBottom: 10 }}>{label}</div>;
}
function Divider() { return <div style={{ height: 1, background: P.line, margin: "48px 0" }} />; }
function EqBlock({ label, eq, note, color = P.glass }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "12px 16px", background: P.panel2, borderRadius: 9, border: `1px solid ${color}20`, marginBottom: 10 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 4, letterSpacing: 1 }}>{label}</div>
      <pre style={{ fontSize: 12, fontFamily: "monospace", color, lineHeight: 1.9, margin: 0, whiteSpace: "pre-wrap" }}>{eq}</pre>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 6, lineHeight: 1.75 }}>{note}</div>}
    </div>
  );
}
function Card({ title, body, color = P.glass, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "13px 15px", background: P.panel, borderRadius: 10, border: `1px solid ${color}18` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 6, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Glass-Jelly Refractive Substrate
   Solar rays bend through stacked gel layers via Snell's law.
   n(z) gradient set by refractive index + water saturation sliders.
   Solar harvest readout P = η·G_s·A·cosθ.
════════════════════════════════════════════════════════════════ */
function GlassJellyCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nRef = useRef(1.45);
  const sunRef = useRef(0.35);
  const waterRef = useRef(0.4);
  const [n, setN] = useState(1.45);
  const [sun, setSun] = useState(0.35);
  const [water, setWater] = useState(0.4);

  useEffect(() => { nRef.current = n; }, [n]);
  useEffect(() => { sunRef.current = sun; }, [sun]);
  useEffect(() => { waterRef.current = water; }, [water]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const nGel = nRef.current, sunPos = sunRef.current, wSat = waterRef.current;
      const nAir = 1.0;

      // Sun position along top arc
      const sunAngle = Math.PI * (0.15 + sunPos * 0.7);
      const sunX = W * (0.5 - Math.cos(sunAngle) * 0.42);
      const sunY = H * 0.14 - Math.sin(sunAngle) * 8 + 8;

      // Gel layers (glass-jelly home shell), 4 stacked bands
      const LAYERS = 4;
      const gelTop = H * 0.32, gelBot = H * 0.9;
      const layerH = (gelBot - gelTop) / LAYERS;
      for (let L = 0; L < LAYERS; L++) {
        const y0 = gelTop + L * layerH;
        // Each layer index rises with depth + water saturation
        const nLayer = nGel + L * 0.04 + wSat * 0.08;
        const tint = 0.06 + L * 0.04 + wSat * 0.05;
        const grd = ctx.createLinearGradient(0, y0, 0, y0 + layerH);
        grd.addColorStop(0, `rgba(103,232,249,${tint})`);
        grd.addColorStop(1, `rgba(45,212,191,${tint + 0.04})`);
        ctx.fillStyle = grd; ctx.fillRect(0, y0, W, layerH);
        ctx.strokeStyle = `rgba(167,139,250,0.15)`; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.stroke();
        ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "left";
        ctx.fillText(`n=${nLayer.toFixed(2)}`, 6, y0 + 11);
      }
      // Water table line (carved interface)
      const waterY = gelTop + (gelBot - gelTop) * (0.55 - wSat * 0.25);
      ctx.strokeStyle = `rgba(96,165,250,${0.3 + wSat * 0.4})`; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
      ctx.beginPath();
      for (let x = 0; x <= W; x += 6) {
        const yy = waterY + Math.sin(x * 0.03 + t * 0.03) * (2 + wSat * 4);
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke(); ctx.setLineDash([]);

      // Sun glow
      const sg = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, 40);
      sg.addColorStop(0, "rgba(251,191,36,0.9)"); sg.addColorStop(1, "rgba(251,191,36,0)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(sunX, sunY, 40, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.gold; ctx.beginPath(); ctx.arc(sunX, sunY, 8, 0, Math.PI * 2); ctx.fill();

      // Trace refracting sun rays through the gel stack (Snell's law)
      const RAYS = 9;
      let totalHarvest = 0;
      for (let r = 0; r < RAYS; r++) {
        const targetX = W * (0.12 + (r / (RAYS - 1)) * 0.76);
        let px = sunX, py = sunY;
        let dx = targetX - sunX, dy = gelTop - sunY;
        const len = Math.hypot(dx, dy); dx /= len; dy /= len;
        // incidence angle from vertical
        let theta = Math.atan2(dx, dy);
        ctx.beginPath(); ctx.moveTo(px, py);
        // to gel top
        const tTop = (gelTop - py) / dy;
        px = px + dx * tTop; py = gelTop;
        ctx.lineTo(px, py);
        // refract into each layer
        let curN = nAir;
        for (let L = 0; L < LAYERS; L++) {
          const nLayer = nGel + L * 0.04 + wSat * 0.08;
          // Snell: n1 sinθ1 = n2 sinθ2
          const sinT2 = Math.max(-1, Math.min(1, (curN / nLayer) * Math.sin(theta)));
          theta = Math.asin(sinT2);
          dx = Math.sin(theta); dy = Math.cos(theta);
          const yNext = gelTop + (L + 1) * layerH;
          const tt = (yNext - py) / dy;
          px = px + dx * tt; py = yNext;
          ctx.lineTo(px, py);
          curN = nLayer;
        }
        const hue = 190 + r * 8;
        ctx.strokeStyle = `hsla(${hue},85%,65%,0.55)`; ctx.lineWidth = 1.2; ctx.stroke();
        // harvest at base ∝ cos(theta) — more vertical = more captured
        totalHarvest += Math.cos(theta);
      }
      // Home shell outline (a glass-jelly dome sitting on the gel)
      ctx.strokeStyle = `rgba(167,139,250,0.5)`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(W / 2, gelTop, W * 0.16, Math.PI, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = "rgba(167,139,250,0.06)";
      ctx.beginPath(); ctx.arc(W / 2, gelTop, W * 0.16, Math.PI, Math.PI * 2); ctx.fill();
      ctx.fillStyle = P.violet; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("GLASS-JELLY HOME SHELL", W / 2, gelTop - W * 0.11);

      // Solar harvest readout
      const eff = 0.22; const Gs = 1.0; const cosMean = totalHarvest / RAYS;
      const harvest = eff * Gs * cosMean * (1 + wSat * 0.3);
      ctx.fillStyle = P.panel2; ctx.fillRect(10, H - 22, W - 20, 13);
      ctx.fillStyle = P.gold; ctx.fillRect(10, H - 22, (W - 20) * Math.min(1, harvest * 3), 13);
      ctx.strokeStyle = P.line; ctx.strokeRect(10, H - 22, W - 20, 13);
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`SOLAR HARVEST  P = η·G_s·A·cosθ = ${(harvest).toFixed(3)}  ·  gel n=${nGel.toFixed(2)}  ·  water sat=${(wSat * 100).toFixed(0)}%`, W / 2, H - 12);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 340, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Gel refractive index n", val: n, set: setN, color: P.glass, min: 1.0, max: 1.9, step: 0.01 },
          { label: "Sun position θ_sun", val: sun, set: setSun, color: P.gold, min: 0, max: 1, step: 0.01 },
          { label: "Water saturation", val: water, set: setWater, color: P.blue, min: 0, max: 1, step: 0.01 },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 10, color: s.color, marginBottom: 3 }}>{s.label} · {s.val.toFixed(2)}</div>
            <input type="range" min={s.min} max={s.max} step={s.step} value={s.val} onChange={e => s.set(+e.target.value)} style={{ width: 130 }} />
          </div>
        ))}
        <div style={{ fontSize: 11, color: P.dim }}>Sunlight refracts through the graded glass-jelly shell (Snell's law at each layer interface). Higher index bends rays more vertical → higher harvest. Water saturation raises the index gradient and carves the internal water table.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — φ-Spiral Sky-Rise Housing Network (navigable)
   Vogel phyllotaxis: θₙ = n·137.5°, rₙ = c√n.
   Each node = one home unit. Click/hover selects a unit.
   Occupied units highlighted; radial density = interaction gradient.
════════════════════════════════════════════════════════════════ */
function PhiSpiralTowerCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const countRef = useRef(340);
  const scaleRef = useRef(0.62);
  const [count, setCount] = useState(340);
  const [scale, setScale] = useState(0.62);
  const [selected, setSelected] = useState<number | null>(null);
  const selRef = useRef<number | null>(null);
  const hoverRef = useRef<{ x: number; y: number } | null>(null);
  const nodesRef = useRef<{ x: number; y: number; n: number }[]>([]);

  useEffect(() => { countRef.current = count; }, [count]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { selRef.current = selected; }, [selected]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const GOLD_ANGLE = 137.507764 * Math.PI / 180;

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const N = Math.round(countRef.current), cScale = scaleRef.current;
      const cx = W / 2, cy = H / 2;
      const cRad = cScale * Math.min(W, H) / (2 * Math.sqrt(N));

      const nodes: { x: number; y: number; n: number }[] = [];
      // Faint spiral connective backbone
      ctx.strokeStyle = `rgba(103,232,249,0.10)`; ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const ang = i * GOLD_ANGLE;
        const rad = cRad * Math.sqrt(i);
        const x = cx + rad * Math.cos(ang), y = cy + rad * Math.sin(ang);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        nodes.push({ x, y, n: i });
      }
      ctx.stroke();
      nodesRef.current = nodes;

      const sel = selRef.current;
      const hov = hoverRef.current;
      // nearest node to hover
      let hoverIdx = -1, hoverBest = 1e9;
      if (hov) {
        nodes.forEach((nd, i) => {
          const d = Math.hypot(nd.x - hov.x, nd.y - hov.y);
          if (d < hoverBest) { hoverBest = d; hoverIdx = i; }
        });
        if (hoverBest > 20) hoverIdx = -1;
      }

      nodes.forEach((nd, i) => {
        const rFromCenter = Math.hypot(nd.x - cx, nd.y - cy);
        const norm = rFromCenter / (cRad * Math.sqrt(N));
        // occupied units (loaded qubits/homes) — deterministic pattern
        const occupied = (i * 61 % 100) < 34;
        const sz = Math.max(1, cRad * 0.42 * (1.4 - norm * 0.5));
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.04 + i * 0.5);

        let col: string;
        if (i === sel) col = P.gold;
        else if (i === hoverIdx) col = P.violet;
        else if (occupied) col = `rgba(103,232,249,${(0.5 + pulse * 0.4).toFixed(2)})`;
        else col = `rgba(45,212,191,0.30)`;

        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(nd.x, nd.y, Math.max(0.5, i === sel ? sz * 1.8 : sz), 0, Math.PI * 2); ctx.fill();

        // selected unit: show neighbor shell (interaction graph within blockade radius)
        if (i === sel) {
          const Rb = cRad * 3.2; // blockade / service radius
          ctx.strokeStyle = `rgba(251,191,36,0.45)`; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
          ctx.beginPath(); ctx.arc(nd.x, nd.y, Rb, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
          nodes.forEach((o, j) => {
            if (j === i) return;
            const d = Math.hypot(o.x - nd.x, o.y - nd.y);
            if (d < Rb) {
              ctx.strokeStyle = `rgba(251,191,36,${(0.4 * (1 - d / Rb)).toFixed(2)})`; ctx.lineWidth = 0.6;
              ctx.beginPath(); ctx.moveTo(nd.x, nd.y); ctx.lineTo(o.x, o.y); ctx.stroke();
            }
          });
        }
      });

      // Center core
      ctx.fillStyle = P.gold;
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2); ctx.fill();

      // Labels
      ctx.fillStyle = P.glass; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`φ-SPIRAL SKY-RISE · ${N} HOME UNITS · GOLDEN ANGLE 137.51°`, 10, 16);
      const occ = Math.round(N * 0.34);
      ctx.fillStyle = P.muted;
      ctx.fillText(`occupied ${occ} · vacant ${N - occ} · rₙ = c√n`, 10, 28);
      if (sel !== null) {
        ctx.fillStyle = P.gold; ctx.textAlign = "right";
        ctx.fillText(`SELECTED UNIT #${sel} · shell r = ${Math.sqrt(sel).toFixed(1)}·c · θ = ${((sel * 137.507764) % 360).toFixed(1)}°`, W - 10, 16);
      } else {
        ctx.fillStyle = P.muted; ctx.textAlign = "right";
        ctx.fillText(`click a unit to inspect its service shell`, W - 10, 16);
      }

      t++; raf = requestAnimationFrame(draw);
    }
    draw();

    function onMove(e: MouseEvent) {
      const rect = c.getBoundingClientRect();
      hoverRef.current = { x: (e.clientX - rect.left) * (c.width / rect.width), y: (e.clientY - rect.top) * (c.height / rect.height) };
    }
    function onLeave() { hoverRef.current = null; }
    function onClick(e: MouseEvent) {
      const rect = c.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (c.width / rect.width);
      const my = (e.clientY - rect.top) * (c.height / rect.height);
      let best = 1e9, idx = -1;
      nodesRef.current.forEach((nd, i) => { const d = Math.hypot(nd.x - mx, nd.y - my); if (d < best) { best = d; idx = i; } });
      setSelected(best < 22 ? (idx === selRef.current ? null : idx) : null);
    }
    c.addEventListener("mousemove", onMove);
    c.addEventListener("mouseleave", onLeave);
    c.addEventListener("click", onClick);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); c.removeEventListener("mousemove", onMove); c.removeEventListener("mouseleave", onLeave); c.removeEventListener("click", onClick); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 400, display: "block", cursor: "pointer" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.glass, marginBottom: 3 }}>Home units N · {count}</div>
          <input type="range" min={40} max={800} step={10} value={count} onChange={e => setCount(+e.target.value)} style={{ width: 150 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.teal, marginBottom: 3 }}>Radial density c · {scale.toFixed(2)}</div>
          <input type="range" min={0.3} max={1.0} step={0.01} value={scale} onChange={e => setScale(+e.target.value)} style={{ width: 150 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>Every home unit sits at a golden-angle phyllotaxis node — the same packing a sunflower uses. Zero overlaps, maximal density, uniform light. Click any unit to see its service shell (the neighbors it shares utilities/structure with, set by a blockade-style radius).</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Adaptive Rhombus Flex Lattice (structural mesh)
   Mesh of rhombus nodes that flexes to load/flow; resolution
   concentrates where the gradient is high (focus vs broad modes).
════════════════════════════════════════════════════════════════ */
function RhombusFlexCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const flexRef = useRef(0.5);
  const resRef = useRef(0.5);
  const [flex, setFlex] = useState(0.5);
  const [res, setRes] = useState(0.5);

  useEffect(() => { flexRef.current = flex; }, [flex]);
  useEffect(() => { resRef.current = res; }, [res]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H); ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);
      const flexAmt = flexRef.current, resAmt = resRef.current;

      const cols = Math.round(8 + resAmt * 16);
      const rows = Math.round(6 + resAmt * 10);
      const cx = W / 2, cy = H / 2;
      const gw = W * 0.8, gh = H * 0.7;

      // flow field the mesh flexes toward (a moving load front)
      const loadX = 0.5 + 0.35 * Math.sin(t * 0.012);
      const loadY = 0.5 + 0.25 * Math.cos(t * 0.009);

      function pt(u: number, v: number) {
        // base planar position
        let x = cx + (u - 0.5) * gw;
        let y = cy + (v - 0.5) * gh;
        // flex toward the load front — concentrate resolution where gradient is high
        const du = u - loadX, dv = v - loadY;
        const d = Math.hypot(du, dv) + 0.001;
        const pull = flexAmt * 0.35 * Math.exp(-d * d * 6);
        x -= (du / d) * pull * gw * 0.5;
        y -= (dv / d) * pull * gh * 0.5;
        // 3D deformation z (perspective squash)
        const z = flexAmt * 40 * Math.exp(-d * d * 6);
        return { x, y: y - z, z };
      }

      // draw rhombus cells
      for (let r = 0; r < rows; r++) {
        for (let cIdx = 0; cIdx < cols; cIdx++) {
          const u0 = cIdx / cols, u1 = (cIdx + 1) / cols;
          const v0 = r / rows, v1 = (r + 1) / rows;
          const a = pt(u0, v0), b = pt(u1, v0), c2 = pt(u1, v1), d = pt(u0, v1);
          const zAvg = (a.z + b.z + c2.z + d.z) / 4;
          const lit = Math.min(1, zAvg / 40);
          const hue = 190 - lit * 60; // cyan → violet at flex peaks
          ctx.strokeStyle = `hsla(${hue},80%,${55 + lit * 20}%,${0.25 + lit * 0.6})`;
          ctx.lineWidth = 0.6 + lit * 1.2;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(d.x, d.y); ctx.closePath();
          ctx.stroke();
          // node dots
          ctx.fillStyle = `hsla(${hue},85%,70%,${0.3 + lit * 0.6})`;
          ctx.beginPath(); ctx.arc(a.x, a.y, Math.max(0.5, 0.8 + lit * 2), 0, Math.PI * 2); ctx.fill();
        }
      }

      // load front marker
      const lf = pt(loadX, loadY);
      ctx.strokeStyle = `rgba(251,113,133,0.6)`; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(lf.x, lf.y, 10, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = P.rose; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("LOAD / FLOW FRONT", lf.x, lf.y - 14);

      ctx.fillStyle = P.glass; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`FLEXING RHOMBUS LATTICE · ${cols}×${rows} CELLS · ADAPTS TO GRADIENT · PRESERVES COHERENCE`, 10, 16);
      const mode = flexAmt > 0.66 ? "FOCUS MODE (high detail)" : flexAmt > 0.33 ? "BALANCE MODE" : "WIDE MODE (broad coverage)";
      ctx.fillStyle = P.amber; ctx.textAlign = "right";
      ctx.fillText(mode, W - 10, 16);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 340, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.violet, marginBottom: 3 }}>Flex amount · {flex.toFixed(2)}</div>
          <input type="range" min={0} max={1} step={0.01} value={flex} onChange={e => setFlex(+e.target.value)} style={{ width: 150 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.teal, marginBottom: 3 }}>Mesh resolution · {res.toFixed(2)}</div>
          <input type="range" min={0} max={1} step={0.01} value={res} onChange={e => setRes(+e.target.value)} style={{ width: 150 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>The structural mesh replaces the rigid box. It flexes toward the load/flow front, concentrating resolution and stiffness exactly where stress is highest — then relaxes back. Same adaptive rhombus lattice as the Omni-Flow perceptual array: adapt to gradients, allocate resolution, minimize deformation, preserve coherence.</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 4 — Geomagnetic-Carved Water Interface Field
   |∇B| field lines carve water channels; charge follows F=q(v×B).
   Shows the energy interface between geomagnetic field and water.
════════════════════════════════════════════════════════════════ */
function GeomagWaterCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bRef = useRef(0.55);
  const flowRef = useRef(0.5);
  const [B, setB] = useState(0.55);
  const [flow, setFlow] = useState(0.5);

  useEffect(() => { bRef.current = B; }, [B]);
  useEffect(() => { flowRef.current = flow; }, [flow]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const N = 260;
    const parts = Array.from({ length: N }, () => ({
      x: Math.random(), y: Math.random(), vx: 0, vy: 0,
    }));

    function draw() {
      const W = c.width, H = c.height;
      ctx.fillStyle = "rgba(4,7,13,0.22)"; ctx.fillRect(0, 0, W, H);
      const Bmag = bRef.current, flowSpd = flowRef.current;

      // Geomagnetic dipole poles
      const p1x = W * 0.3, p1y = H * 0.3;
      const p2x = W * 0.72, p2y = H * 0.68;

      function field(x: number, y: number) {
        // curl-ish field from two poles → carves channels
        const d1x = x - p1x, d1y = y - p1y, r1 = Math.hypot(d1x, d1y) + 8;
        const d2x = x - p2x, d2y = y - p2y, r2 = Math.hypot(d2x, d2y) + 8;
        // perpendicular components (B into charge motion, v×B swirl)
        const fx = (-d1y / (r1 * r1)) - (d2y / (r2 * r2));
        const fy = ( d1x / (r1 * r1)) + (d2x / (r2 * r2));
        return { fx: fx * 3000 * Bmag, fy: fy * 3000 * Bmag };
      }

      // faint field streaks
      ctx.strokeStyle = `rgba(74,222,128,${0.05 + Bmag * 0.06})`; ctx.lineWidth = 0.5;
      for (let gx = 0; gx < W; gx += 34) {
        for (let gy = 0; gy < H; gy += 34) {
          const f = field(gx, gy); const m = Math.hypot(f.fx, f.fy) + 0.001;
          ctx.beginPath(); ctx.moveTo(gx, gy);
          ctx.lineTo(gx + (f.fx / m) * 12, gy + (f.fy / m) * 12); ctx.stroke();
        }
      }

      // water particles carried by v×B
      parts.forEach(p => {
        const x = p.x * W, y = p.y * H;
        const f = field(x, y);
        p.vx = p.vx * 0.9 + f.fx * 0.00006 * (0.5 + flowSpd);
        p.vy = p.vy * 0.9 + f.fy * 0.00006 * (0.5 + flowSpd);
        p.x += p.vx / W; p.y += p.vy / H;
        if (p.x < 0) p.x += 1; if (p.x > 1) p.x -= 1;
        if (p.y < 0) p.y += 1; if (p.y > 1) p.y -= 1;
        const spd = Math.hypot(p.vx, p.vy);
        const hue = 190 + Math.min(80, spd * 3);
        ctx.fillStyle = `hsla(${hue},85%,65%,0.8)`;
        ctx.beginPath(); ctx.arc(p.x * W, p.y * H, Math.max(0.5, 1.1 + spd * 0.05), 0, Math.PI * 2); ctx.fill();
      });

      // poles
      [[p1x, p1y, P.rose, "N"], [p2x, p2y, P.blue, "S"]].forEach(([px, py, col, lbl]) => {
        const g = ctx.createRadialGradient(px as number, py as number, 2, px as number, py as number, 26);
        g.addColorStop(0, (col as string) + "cc"); g.addColorStop(1, (col as string) + "00");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(px as number, py as number, 26, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.ivory; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
        ctx.fillText(lbl as string, px as number, (py as number) + 3);
      });

      ctx.fillStyle = P.green; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(`GEOMAGNETIC-CARVED WATER · F = q(v × B) · channels ∝ |∇B|`, 10, 16);

      t++; raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 320, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.green, marginBottom: 3 }}>Geomagnetic |B| · {B.toFixed(2)}</div>
          <input type="range" min={0.1} max={1} step={0.01} value={B} onChange={e => setB(+e.target.value)} style={{ width: 150 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.blue, marginBottom: 3 }}>Water flow rate · {flow.toFixed(2)}</div>
          <input type="range" min={0} max={1} step={0.01} value={flow} onChange={e => setFlow(+e.target.value)} style={{ width: 150 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>Water carriers feel the Lorentz force F = q(v × B) between the geomagnetic poles. The field carves stable flow channels (∝ |∇B|) that become the home network's plumbing, thermal loops, and cooling interfaces — routed by the planet's own magnetic geometry.</div>
      </div>
    </div>
  );
}

/* ═══════════════ MAIN PAGE ═══════════════ */
export default function GlassFieldHomesPage() {
  const [imgExpanded, setImgExpanded] = useState<number | null>(null);

  const images = [
    {
      src: omniFlow,
      caption: "Omni-Flow Perceptual Array · The Flexing Rhombus Lattice",
      anno: "This is the master schematic for the housing network. All sensing cones merge into one 4D field (space, time, velocity, temperature, polarization, spectrum, confidence). The flexing rhombus lattice at the core replaces the rigid box — it stretches and compresses with flow and detail. Focus mode concentrates structure where load is high; wide mode spreads for broad coverage. The home network is this lattice made habitable: adaptive resolution structure spanning kilometers to atoms.",
      chips: ["Rhombus Flex Lattice", "4D Unified Field", "Adaptive Resolution", "Focus / Balance / Wide", "Multi-Scale", "Replace the Box"],
    },
    {
      src: magStorm,
      caption: "Magnetic Dust Storm · Multi-Scale Perceptual Array",
      anno: "The energy and coupling layer. Magnetic field dynamics (B/E field lines, current sheets), charge and plasma environment, surface/subsurface conductivity, depth and structure sensing all feed the flexing rhombus core with its real-time adaptive mesh. For the home network this is the live geomagnetic + solar weather feed: the system reads charge density, updraft velocity, and ground conductivity to route power, pre-flex the structure ahead of storms, and time solar harvest — a predictive model projecting +42 minutes ahead.",
      chips: ["Magnetic Field Dynamics", "Charge / Plasma", "Poynting Flux", "Helicity", "Predictive +42min", "Adaptive Core"],
    },
    {
      src: skyrmion,
      caption: "Topological Field Textures · Skyrmions, Vortices, Möbius C-points",
      anno: "The deep-physics substrate. Phase singularities (ℓ = ±1 vortices), a skyrmion texture with topological charge Q ≈ 0.996, and Möbius-strip polarization C-points show how structured light and field textures carry stable, quantized information through a medium. In the glass-jelly substrate these are the coherent modes the refractive gel supports: topologically protected light channels that route energy and signal through the home network without decay — geometry itself doing the computation.",
      chips: ["Skyrmion Q≈1", "Optical Vortices ℓ=±1", "Möbius C-points", "Topological Charge", "Phase Singularity", "Protected Modes"],
    },
  ];

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* HERO */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Glass Field Substrate · Refractive Homes · Solar + Geomagnetic + Water · φ-Spiral Sky-Rise · Adaptive Lattice" />
        <h1 style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.1, margin: "8px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.glass }}>Glass Field Substrate</span><br />
          <span style={{ color: P.gold }}>Living Home Housing Network</span>
        </h1>
        <h2 style={{ fontSize: 20, fontWeight: 400, color: P.violet, margin: "0 0 20px", lineHeight: 1.45 }}>
          Refractive glass-jelly homes · solar &amp; geomagnetic-carved water interfaces · φ-spiral sky-rise packing · adaptive rhombus flex lattice
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          A home is not a rigid box — it is a <em style={{ color: P.ivory }}>glass-field substrate</em>: a refractive glass-jelly shell whose optical index is carved live by sunlight and water saturation, sitting on an adaptive rhombus lattice that flexes toward load, arranged across a sky-rise in the sun's own golden-angle packing. Every interface is fully mathematical — Snell refraction, φ-spiral phyllotaxis, the Lorentz force carving water channels, solar harvest — and every element is manipulable. This is a navigable system for home development and sky-rise growth driven end-to-end by AETHER coherence data.
        </p>
        <div style={{ padding: "14px 18px", background: P.panel2, borderRadius: 10, border: `1px solid ${P.gold}25`, maxWidth: 760 }}>
          <div style={{ fontSize: 11, color: P.gold, fontWeight: 700, marginBottom: 6 }}>THE SYSTEM IN ONE LINE</div>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.8 }}>
            Refractive gel shell <span style={{ color: P.glass }}>(light)</span> · flexing rhombus frame <span style={{ color: P.violet }}>(structure)</span> · φ-spiral placement <span style={{ color: P.teal }}>(network)</span> · geomagnetic water channels <span style={{ color: P.green }}>(energy)</span> — one coherent, growable, sun-crystal home field.
          </div>
        </div>
      </div>

      <Divider />

      {/* SECTION I — Glass Jelly Refractive Substrate */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section I · The Glass-Jelly Shell · n₁ sinθ₁ = n₂ sinθ₂" color={P.glass} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.glass, margin: "0 0 12px" }}>
          The Refractive Living Membrane
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The home shell is a graded glass-jelly — a transparent hydrogel whose refractive index rises with depth and water saturation. Sunlight bends through each layer by Snell's law, and by tuning the index gradient the shell steers light: harvesting it for power, diffusing it for daylight, or focusing it into internal channels. The water table inside the gel is a live carved interface, not a fixed pipe. Drag the sliders below to watch the rays refract and the solar harvest respond.
        </p>
        <GlassJellyCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 20 }}>
          <EqBlock label="SNELL REFRACTION AT EACH LAYER" color={P.glass}
            eq={"n₁ sinθ₁ = n₂ sinθ₂\n\nn(z) = n₀ + Δn·z + κ·S_water\n\nz  = depth into gel\nS_water = water saturation\nκ  = index-per-saturation"}
            note="The graded index n(z) is what makes the shell a lens, a diffuser, and a light-pipe at once. Raising water saturation raises κ·S_water — bending rays more vertical and increasing captured flux at the base." />
          <EqBlock label="SOLAR HARVEST" color={P.gold}
            eq={"P = η · G_s · A · cosθ_sun\n\nη   = conversion efficiency (~0.22)\nG_s = solar irradiance\nA   = shell aperture area\nθ_sun = sun incidence angle"}
            note="Harvest peaks when refraction turns the incoming rays toward vertical (cosθ → 1) at the absorbing base layer. The gel gradient does this passively — the shell steers its own light without moving parts." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
          <Card title="Hydrogel Optics" color={P.glass} sub="material"
            body="Transparent hydrogels reach refractive indices n ≈ 1.33–1.5, tunable by water content, crosslink density, and dissolved solutes. Real materials — used in contact lenses and soft photonics. Here the whole home shell is one." />
          <Card title="Graded-Index Lensing" color={P.teal} sub="passive optics"
            body="A GRIN (graded-index) medium bends light continuously, no discrete lens needed. Fiber optics and insect eyes use it. The shell's depth gradient is a planetary-scale GRIN skin for daylighting and harvest." />
          <Card title="Water-Carved Interface" color={P.blue} sub="live geometry"
            body="The internal water table is not plumbing — it is a mobile optical + thermal interface. Its position sets the index step, the cooling loop, and the harvest depth, all responding to sun and season." />
          <Card title="Self-Steering Daylight" color={P.violet} sub="comfort"
            body="By shifting saturation the shell diffuses harsh noon light and concentrates weak winter light — homeostatic daylighting that keeps interior illumination coherent across the day." />
        </div>
      </div>

      <Divider />

      {/* SECTION II — Phi Spiral Sky-Rise */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section II · φ-Spiral Sky-Rise Network · θₙ = n·137.51°" color={P.teal} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.teal, margin: "0 0 12px" }}>
          Golden-Angle Home Packing · Navigable
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Homes are placed at golden-angle phyllotaxis nodes — the exact packing a sunflower seed head uses. Vogel's formula θₙ = n·137.507764°, rₙ = c√n gives zero overlaps, maximal density, and uniform light to every unit. Radial growth is a built-in routing gradient: dense high-coherence core, sparse airy edge. Click any unit to inspect its service shell — the neighbors it shares structure, utilities, and energy loops with, set by a blockade-style service radius.
        </p>
        <PhiSpiralTowerCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <EqBlock label="VOGEL PHYLLOTAXIS PLACEMENT" color={P.teal}
            eq={"θₙ = n · 137.507764°\nrₙ = c · √n\n\nφ = (1 + √5) / 2\ngolden angle = 360°·(1 − 1/φ)\n            = 137.507764°"}
            note="The √n radial law spaces units so each new home lands in the largest remaining gap. Uniform illumination and packing efficiency emerge automatically — the same optimum sunflowers, pinecones, and SLM tweezer arrays all converge on." />
          <EqBlock label="SERVICE SHELL (BLOCKADE RADIUS)" color={P.gold}
            eq={"R_b = (C₆ / ħΩ)^(1/6)\n\nUnits within R_b share:\n  · structural coupling\n  · energy / water loop\n  · signal routing\n\nedges = interaction graph"}
            note="Borrowed from Rydberg-blockade neutral-atom arrays: each unit's shell defines who it is directly coupled to. Geometry becomes the wiring diagram — a variable-distance interaction graph instead of a uniform grid." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
          <Card title="Zero-Overlap Density" color={P.teal} sub="packing"
            body="Golden-angle placement guarantees no two units crowd — maximal homes per footprint with uniform sun access. Add units one at a time and the pattern stays optimal at every scale." />
          <Card title="Routing Gradient" color={P.glass} sub="network"
            body="Dense center → sparse edge is a natural hierarchy: shared district infrastructure at the core, private airy homes at the rim. Information, water, and power flow down this radial gradient." />
          <Card title="Parallel Addressing" color={P.violet} sub="control"
            body="Like a holographic SLM updating all traps at once, the network can retune, reroute, or reconfigure whole shells of homes in one operation — abundant, parallel control over the field." />
          <Card title="Fault Tolerance" color={P.green} sub="resilience"
            body="Uniform spacing means no single unit is critical; the service-shell graph reroutes around any failed node. The φ-spiral's redundancy is why nature trusts it for load-bearing growth." />
        </div>
      </div>

      <Divider />

      {/* SECTION III — Rhombus Flex Lattice */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section III · Adaptive Rhombus Flex Lattice · Replace the Box" color={P.violet} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.violet, margin: "0 0 12px" }}>
          Structure That Flexes to Flow
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          The load-bearing frame is a flexing rhombus lattice — the same adaptive mesh at the core of the Omni-Flow array. Instead of rigid columns, the lattice concentrates cells and stiffness where the load or flow front is highest, then relaxes back as it moves on. Focus mode gives high local detail; wide mode spreads for broad coverage. Move the sliders to see the mesh allocate resolution to the moving load and deform in 3D while preserving overall coherence.
        </p>
        <RhombusFlexCanvas />
        <EqBlock label="ADAPTIVE MESH ALLOCATION" color={P.violet}
          eq={"resolution(x) ∝ |∇flow(x)|      allocate detail to gradient\ndeformation z(x) = A · exp(−|x − x_load|² / 2σ²)   local flex\nobjective:  min ∫ ‖deform‖ dV   s.t.  coherence preserved\n\nmodes:  FOCUS (high detail, small σ) · BALANCE · WIDE (broad, large σ)"}
          note="The mesh is a live finite-element field: it puts material where stress lives and takes it away where it does not. This is how a single lattice spans structural, thermal, and flow duty — adapt to gradients, allocate resolution, minimize deformation, preserve coherence." />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10, marginTop: 16 }}>
          <Card title="Load-Following Stiffness" color={P.violet} sub="structural"
            body="Cells densify under the load front — the frame is strongest exactly where and when it needs to be, then lightens elsewhere. Material efficiency that a fixed frame can never match." />
          <Card title="Pre-Flex for Weather" color={P.rose} sub="predictive"
            body="Fed the magnetic-storm predictive model (+42 min), the lattice pre-deforms ahead of wind and pressure fronts, spreading load before the gust arrives instead of resisting it rigidly." />
          <Card title="Coherence Preservation" color={P.teal} sub="stability"
            body="Every flex is constrained to preserve global coherence — local adaptation never fractures the whole. The rhombus geometry distributes strain smoothly across the network." />
          <Card title="Multi-Scale Span" color={P.glass} sub="range"
            body="The same lattice rule works from a single room to a whole sky-rise — kilometers to atoms. Resolution is a slider, not a redesign, so the system grows without re-architecting." />
        </div>
      </div>

      <Divider />

      {/* SECTION IV — Geomagnetic Water */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section IV · Geomagnetic-Carved Water · F = q(v × B)" color={P.green} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.green, margin: "0 0 12px" }}>
          Energy &amp; Water Routed by the Planet's Field
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.9, maxWidth: 780, marginBottom: 20 }}>
          Water carriers in the network feel the Lorentz force F = q(v × B) between the geomagnetic poles. The field carves stable flow channels wherever |∇B| is strong — and those channels become the home network's plumbing, thermal loops, and cooling interfaces, routed by the planet's own magnetic geometry rather than fixed pipes. Increase |B| to sharpen the channels; increase flow to drive the circulation.
        </p>
        <GeomagWaterCanvas />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="LORENTZ WATER ROUTING" color={P.green}
            eq={"F = q(v × B)\nchannel density ∝ |∇B|\n\nJ = σ(E + v × B)   (MHD)\ncooling loop follows field lines"}
            note="Charged and ionic water follows magnetohydrodynamic paths. The geomagnetic field is a free, always-on routing grid — the home network taps it to shape circulation with minimal pumping energy." />
          <EqBlock label="COUPLED ENERGY BUDGET" color={P.gold}
            eq={"P_net = P_solar + P_geo − P_pump − P_loss\nP_solar = η·G_s·A·cosθ   (Section I)\nP_geo   ∝ ∮ (v × B)·dl\n\ntarget:  P_net > 0  across the day"}
            note="Solar harvest through the gel shell plus geomagnetic-assisted circulation minus pumping and losses. The φ-spiral packing keeps every unit in surplus by guaranteeing uniform sun and short shared loops." />
        </div>
      </div>

      <Divider />

      {/* SECTION V — Source Plates */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 48px" }}>
        <Tag label="Section V · Source Plates · The Architecture Behind the Network" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 20px" }}>
          From Perceptual Array to Habitable Field
        </h2>
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 28 }}>
          {images.map((img, i) => (
            <div key={i} style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden" }}>
              <img
                src={img.src} alt={img.caption}
                onClick={() => setImgExpanded(imgExpanded === i ? null : i)}
                style={{ width: "100%", display: "block", cursor: "zoom-in", maxHeight: imgExpanded === i ? "none" : 340, objectFit: "cover" as const, objectPosition: "top" }}
              />
              <div style={{ padding: "14px 18px", background: P.panel }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 8 }}>{img.caption}</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 10 }}>
                  {img.chips.map((ch, ci) => (
                    <span key={ci} style={{ fontSize: 10, padding: "2px 8px", borderRadius: 12, border: `1px solid ${P.gold}33`, color: P.gold, background: P.gold + "0f" }}>{ch}</span>
                  ))}
                </div>
                <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{img.anno}</div>
                <div style={{ fontSize: 10, color: P.muted, marginTop: 6 }}>{imgExpanded === i ? "Click to collapse" : "Click to expand"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Divider />

      {/* SECTION VI — System Architecture */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 32px 52px" }}>
        <Tag label="Section VI · Full System Flow · One Coherent Home Field" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "0 0 18px" }}>
          The Complete Housing System Network
        </h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "stretch", marginBottom: 24 }}>
          {[
            { n: "01", t: "AETHER DATA", d: "Solar + geomagnetic + water coherence feed", c: P.gold },
            { n: "02", t: "GLASS-JELLY SHELL", d: "Graded-index refractive membrane · Snell harvest", c: P.glass },
            { n: "03", t: "φ-SPIRAL PLACEMENT", d: "Golden-angle unit packing · service shells", c: P.teal },
            { n: "04", t: "RHOMBUS LATTICE", d: "Adaptive flex frame · load-following", c: P.violet },
            { n: "05", t: "GEOMAG WATER", d: "Lorentz-routed loops · energy budget", c: P.green },
            { n: "06", t: "LIVING HOME FIELD", d: "Navigable · manipulable · growable sky-rise", c: P.gold },
          ].map((s, i) => (
            <div key={i} style={{ flex: "1 1 150px", minWidth: 150, padding: "14px 14px", background: P.panel, borderRadius: 10, border: `1px solid ${s.c}25` }}>
              <div style={{ fontSize: 10, color: s.c, fontWeight: 800, letterSpacing: 1, marginBottom: 6 }}>{s.n}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: s.c, marginBottom: 6 }}>{s.t}</div>
              <div style={{ fontSize: 11, color: P.dim, lineHeight: 1.7 }}>{s.d}</div>
            </div>
          ))}
        </div>

        <div style={{ padding: "20px 24px", background: P.panel, borderRadius: 14, border: `1px solid ${P.gold}30`, marginBottom: 24 }}>
          <div style={{ fontSize: 13, color: P.ivory, lineHeight: 1.95 }}>
            Every layer is <span style={{ color: P.glass }}>fully mathematical</span> and <span style={{ color: P.violet }}>manipulable</span>: refraction sets the light, the golden angle sets the network, the flex lattice sets the structure, and the Lorentz force sets the water. Nothing is decorative — the sun-crystal coherence of the whole field is what keeps every home in surplus, comfortable, and structurally sound as the sky-rise grows unit by unit.
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {["/liquid-print","/crystallized-life-synthesis","/circular-farm","/substrate-synthesis","/coherent-disturbance","/gradient-field","/aether-engine","/lunar-coherence","/resonant-tunnel","/soi-building"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 11, textDecoration: "none" }}>
              {href.replace("/", "").replace(/-/g, " ")} →
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/*═══════════════════════════════════════════════════════════════════
  Coherent Disturbance · Inverse Field Reconstruction

  "Objects are known not only by their boundaries, but by the
   coherent disturbances they induce in the media around them.
   Light, water, plasma, and spacetime become readable surfaces
   through which hidden structure is reconstructed."

  The inverse-scattering paradigm unified across all fields:
  ── Optical: obstacle → wavefront distortion → phase reconstruction
  ── Fluid:   object → wake/ripple pattern → hydrodynamic signature
  ── Plasma:  perturbation → Alfvén wave scattering → density profile
  ── Gravity: mass → metric ripple → LIGO matched-filter reconstruction

  AETHER principle: the field is the primary sensor. The object is an
  impurity in the field. All objects are reconstructed from □C ≠ 0.
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";

const P = {
  bg: "#03060b", panel: "#080d18", panel2: "#0b1122",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(100,150,255,0.07)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399",
  orange: "#fb923c", rose: "#fb7185", amber: "#fbbf24",
  muted: "rgba(244,241,234,0.28)",
};

function Sec({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ borderTop: `1px solid ${P.line}`, padding: "52px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px" }}>{children}</div>
    </section>
  );
}
function Tag({ label, color = P.cyan }: { label: string; color?: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: 1.5, textTransform: "uppercase" as const }}>{label}</span>;
}
function Card({ title, body, color = P.cyan, sub }: { title: string; body: string; color?: string; sub?: string }) {
  return (
    <div style={{ padding: "14px 16px", background: P.panel, borderRadius: 10, border: `1px solid ${color}1a` }}>
      {sub && <div style={{ fontSize: 9, color, letterSpacing: 1.2, marginBottom: 4, textTransform: "uppercase" as const }}>{sub}</div>}
      <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 0.5, marginBottom: 7, textTransform: "uppercase" as const }}>{title}</div>
      <div style={{ fontSize: 12, color: P.dim, lineHeight: 1.85 }}>{body}</div>
    </div>
  );
}
function EqBlock({ label, eq, note, color = P.cyan }: { label: string; eq: string; note?: string; color?: string }) {
  return (
    <div style={{ padding: "11px 15px", background: P.panel2, borderRadius: 8, border: `1px solid ${color}20`, marginBottom: 9 }}>
      <div style={{ fontSize: 9, color: P.muted, marginBottom: 3, letterSpacing: 1 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: "monospace", color, lineHeight: 1.7, whiteSpace: "pre-wrap" as const }}>{eq}</div>
      {note && <div style={{ fontSize: 11, color: P.dim, marginTop: 5, lineHeight: 1.7 }}>{note}</div>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 1 — Optical Coherent Disturbance
   Plane wave encounters an invisible obstacle.
   Refraction bends wavefronts → interference fringes at screen
   The fringe pattern encodes the obstacle's shape.
   User drags the obstacle: field responds in real time.
════════════════════════════════════════════════════════════════ */
function OpticalDisturbanceCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const objRef = useRef({ x: 0.5, y: 0.45, r: 0.08, n: 1.5 });
  const [objShape, setObjShape] = useState(0);
  const [refractive, setRefractive] = useState(1.5);

  useEffect(() => { objRef.current.n = refractive; }, [refractive]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const rng = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5; return x - Math.floor(x); };
    let dragging = false;
    let dragOffX = 0, dragOffY = 0;

    const onDown = (e: MouseEvent) => {
      const rect = c.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / rect.width, my = (e.clientY - rect.top) / rect.height;
      const dx = mx - objRef.current.x, dy = my - objRef.current.y;
      if (Math.sqrt(dx*dx + dy*dy) < objRef.current.r) { dragging = true; dragOffX = dx; dragOffY = dy; }
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      const rect = c.getBoundingClientRect();
      objRef.current.x = Math.max(0.08, Math.min(0.92, (e.clientX - rect.left) / rect.width + dragOffX));
      objRef.current.y = Math.max(0.15, Math.min(0.8, (e.clientY - rect.top) / rect.height + dragOffY));
    };
    const onUp = () => { dragging = false; };

    c.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const obj = objRef.current;
      const objX = obj.x * W, objY = obj.y * H;
      const objR = obj.r * Math.min(W, H);
      const k = 12; // spatial frequency
      const omega = 0.08; // temporal frequency

      // ── Phase field background ──
      const step = 4;
      for (let px = 0; px < W; px += step) {
        for (let py = 0; py < H; py += step) {
          let phase = 0;
          // Distance to obstacle
          const dx = px - objX, dy = py - objY;
          const d = Math.sqrt(dx*dx + dy*dy);

          if (d < objR) {
            // Inside obstacle: slower propagation (higher refractive index)
            phase = (px * k * obj.n + py * k * 0.3 - omega * t) * obj.n;
            const intensity = 0.5 + 0.5 * Math.cos(phase);
            const r = Math.round(96 * intensity + 10);
            const g = Math.round(160 * intensity + 20);
            const b2 = Math.round(230 * intensity + 20);
            ctx.fillStyle = `rgba(${r},${g},${b2},0.4)`;
          } else {
            // Outside obstacle: normal propagation + diffraction
            // Path-length extra phase from obstacle
            const extraPhase = d < objR * 2.5
              ? Math.exp(-(d - objR) / (objR * 0.4)) * Math.cos(Math.atan2(dy, dx) * 4) * 1.2
              : 0;
            phase = px * k + py * k * 0.3 - omega * t + extraPhase;
            const intensity = 0.5 + 0.5 * Math.cos(phase);
            const r = Math.round(79 * intensity);
            const g = Math.round(200 * intensity + 30);
            const b2 = Math.round(232 * intensity + 20);
            const alpha = Math.min(0.5, intensity * 0.8);
            ctx.fillStyle = `rgba(${r},${g},${b2},${alpha})`;
          }
          ctx.fillRect(px, py, step, step);
        }
      }

      // ── Wavefront lines (visualizing phase) ──
      for (let waveY = 0; waveY < H; waveY += 40) {
        ctx.strokeStyle = `rgba(79,232,232,0.08)`; ctx.lineWidth = 0.5;
        ctx.beginPath();
        for (let px = 0; px <= W; px += 2) {
          const dy = waveY + Math.sin((px * k - omega * t) * 0.3) * 3;
          px === 0 ? ctx.moveTo(px, dy) : ctx.lineTo(px, dy);
        }
        ctx.stroke();
      }

      // ── Obstacle outline ──
      const shapes = [
        // Circle
        () => { ctx.beginPath(); ctx.arc(objX, objY, objR, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); },
        // Ellipse
        () => { ctx.beginPath(); ctx.ellipse(objX, objY, objR * 1.4, objR * 0.7, 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); },
        // Triangle
        () => { ctx.beginPath(); ctx.moveTo(objX, objY - objR); ctx.lineTo(objX - objR, objY + objR); ctx.lineTo(objX + objR, objY + objR); ctx.closePath(); ctx.fill(); ctx.stroke(); },
      ];
      ctx.fillStyle = `rgba(6,8,16,0.85)`;
      ctx.strokeStyle = P.gold + "88"; ctx.lineWidth = 2;
      shapes[objShape % shapes.length]();

      // ── Detection screen (right side) ──
      const screenX = W * 0.88;
      const screenW = W * 0.08;
      ctx.fillStyle = P.panel; ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.fillRect(screenX, H * 0.15, screenW, H * 0.7);
      ctx.strokeRect(screenX, H * 0.15, screenW, H * 0.7);

      // Compute simulated fringe intensity at screen
      for (let sy = H * 0.15; sy < H * 0.85; sy += 2) {
        const screenY = sy;
        const dx = screenX - objX, dy = screenY - objY;
        const d = Math.sqrt(dx*dx + dy*dy);
        const pathDiff = d - Math.sqrt(screenX*screenX + (screenY - H/2)*(screenY - H/2));
        const screenPhase = k * pathDiff * 0.01 + omega * t;
        const intensity = 0.5 + 0.5 * Math.cos(screenPhase);
        const r = Math.round(245 * intensity + 10);
        const g = Math.round(200 * intensity + 20);
        const b2 = Math.round(76 * intensity + 10);
        ctx.fillStyle = `rgba(${r},${g},${b2},${0.6 + intensity * 0.4})`;
        ctx.fillRect(screenX, sy, screenW, 2);
      }

      // Labels
      ctx.fillStyle = P.cyan; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText("← PLANE WAVE", 6, H * 0.12);
      ctx.fillText("(coherent source)", 6, H * 0.12 + 12);
      ctx.fillStyle = P.gold; ctx.fillText("OBSTACLE (drag me)", objX - objR - 10, objY - objR - 5);
      ctx.fillStyle = P.purple; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText("DETECTOR", screenX + screenW/2, H * 0.85 + 16);
      ctx.fillStyle = P.muted; ctx.font = "7px monospace";
      ctx.fillText("fringe pattern", screenX + screenW/2, H * 0.85 + 26);
      ctx.fillStyle = P.dim; ctx.textAlign = "left";
      ctx.fillText("Wavefronts bend around obstacle → interference fringes → object shape reconstructed from fringe pattern", 8, H - 8);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); c.removeEventListener("mousedown", onDown); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
  }, [objShape, refractive]);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>OBSTACLE SHAPE</div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setObjShape(0)} style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${objShape===0?P.gold:P.line}`, background: objShape===0?P.gold+"22":"transparent", color: objShape===0?P.gold:P.dim, fontSize: 10, cursor: "pointer" }}>Circle</button>
            <button onClick={() => setObjShape(1)} style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${objShape===1?P.gold:P.line}`, background: objShape===1?P.gold+"22":"transparent", color: objShape===1?P.gold:P.dim, fontSize: 10, cursor: "pointer" }}>Ellipse</button>
            <button onClick={() => setObjShape(2)} style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${objShape===2?P.gold:P.line}`, background: objShape===2?P.gold+"22":"transparent", color: objShape===2?P.gold:P.dim, fontSize: 10, cursor: "pointer" }}>Triangle</button>
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>REFRACTIVE INDEX n · {refractive.toFixed(1)}</div>
          <input type="range" min={1.1} max={2.5} step={0.1} value={refractive} onChange={e => setRefractive(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>
          Drag the obstacle. Observe: wavefronts bend, interference fringes form at detector. The fringe pattern encodes obstacle shape. Higher n = stronger phase disturbance = sharper fringes. This is holography, schlieren, and interferometry unified.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Fluid / Plasma Wake Signature
   Objects moving through a wave medium create characteristic wakes:
   Sub-critical: smooth, deep wake (c/ship-speed > 1)
   Super-critical: sharp V-shaped Kelvin wake (c/ship-speed < 1)
   Gravity waves in water: c ≈ √(gh/2π) · f⁻½
   Alfvén waves in plasma: c_A = B/√(μ₀ρ)
   The wake angle encodes the Froude number / Mach-Alfvén ratio.
════════════════════════════════════════════════════════════════ */
function WakeSignatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speedRef  = useRef(0.6);
  const modeRef   = useRef(0); // 0 = water-gravity, 1 = Alfvén-plasma
  const [speed, setSpeed] = useState(0.6);
  const [mode,  setMode]  = useState(0);

  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // Wake particles (trailing behind moving source)
    const WAKE: { x: number; y: number; age: number; amp: number }[] = [];
    let srcX = 0;

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const spd = speedRef.current;
      const m = modeRef.current;
      const waterLine = H * 0.55;

      // Medium
      if (m === 0) {
        // Water
        ctx.fillStyle = "rgba(10,30,60,0.5)";
        ctx.fillRect(0, waterLine, W, H - waterLine);
        // Surface
        ctx.strokeStyle = P.blue + "33"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(0, waterLine); ctx.lineTo(W, waterLine); ctx.stroke();
      } else {
        // Plasma field
        ctx.fillStyle = "rgba(60,10,30,0.15)"; ctx.fillRect(0, 0, W, H);
        // B field direction
        const arrowY = H * 0.12;
        ctx.strokeStyle = P.purple + "44"; ctx.lineWidth = 1;
        for (let ax = 20; ax < W; ax += 50) {
          ctx.beginPath(); ctx.moveTo(ax, arrowY - 10); ctx.lineTo(ax, arrowY + 10); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(ax - 3, arrowY - 7); ctx.lineTo(ax, arrowY - 10); ctx.lineTo(ax + 3, arrowY - 7); ctx.stroke();
        }
        ctx.fillStyle = P.purple + "66"; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText("B⃗ (Alfvén guiding field)", W / 2, arrowY + 20);
      }

      // Source moves left-to-right
      srcX += spd * 2;
      if (srcX > W * 1.1) srcX = -W * 0.05;
      const sx = srcX, sy = waterLine;

      // Spawn wake particles
      const spawnRate = Math.round(3 - spd * 2);
      if (t % Math.max(1, spawnRate) === 0) {
        WAKE.push({ x: sx, y: sy, age: 0, amp: 1 });
      }

      // Draw wake
      WAKE.forEach(p => {
        p.age += 1;
        const ageNorm = p.age / 100;
        // Gravity wake: θ = arcsin(c/v) — Kelvin wake angle
        // Alfvén wake: Mach-cone angle θ = arcsin(c_A / v)
        const c0 = m === 0 ? 3 : 2; // wave speed
        const Mach = spd * 2 / c0; // v/c
        if (Mach > 1) {
          // Super-critical: V-shaped cone
          const coneAngle = Math.asin(Math.min(1, 1 / Math.max(0.01, Mach))) * 0.6;
          [-1, 1].forEach(dir => {
            const wx = p.x - p.age * 0.5 * spd * 0.8;
            const wy = p.y + dir * Math.tan(coneAngle) * p.age * 0.5 * (m === 0 ? 0.8 : 1.2);
            if (wy > 0 && wy < H) {
              const a = Math.max(0, 1 - ageNorm);
              ctx.fillStyle = (m === 0 ? P.blue : P.purple) + Math.round(a * 200).toString(16).padStart(2, "0");
              ctx.beginPath(); ctx.arc(wx, wy, 1 + a * 3, 0, Math.PI * 2); ctx.fill();
            }
          });
        } else {
          // Sub-critical: smooth trailing wake
          const wx = p.x - p.age * 0.5 * spd * 0.8;
          const wy = p.y + Math.sin(p.age * 0.15) * p.age * 0.3;
          const a = Math.max(0, 1 - ageNorm);
          ctx.fillStyle = (m === 0 ? P.teal : P.rose) + Math.round(a * 180).toString(16).padStart(2, "0");
          ctx.beginPath(); ctx.arc(wx, wy, 1 + a * 2, 0, Math.PI * 2); ctx.fill();
        }
      });
      // Prune old
      for (let i = WAKE.length - 1; i >= 0; i--) { if (WAKE[i].age > 120) WAKE.splice(i, 1); }

      // Draw source
      ctx.fillStyle = P.gold;
      ctx.beginPath(); ctx.arc(sx, sy, 8, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = P.gold; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(sx, sy, 12, 0, Math.PI * 2); ctx.stroke();

      // Speed arrow
      ctx.strokeStyle = P.gold + "88"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(sx + 15, sy); ctx.lineTo(sx + 25, sy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(sx + 22, sy - 3); ctx.lineTo(sx + 25, sy); ctx.lineTo(sx + 22, sy + 3); ctx.stroke();

      // Mach cone angle line (if super-critical)
      const c0 = m === 0 ? 3 : 2;
      const Mach = spd * 2 / c0;
      if (Mach > 1) {
        const coneAngle = Math.asin(Math.min(1, 1 / Mach)) * 0.6;
        ctx.strokeStyle = P.orange + "55"; ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        [-1, 1].forEach(dir => {
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx - 80, sy + dir * Math.tan(coneAngle) * 80);
          ctx.stroke();
        });
        ctx.setLineDash([]);
        ctx.fillStyle = P.orange; ctx.font = "8px monospace";
        ctx.fillText(`θ = ${(coneAngle * 180 / Math.PI).toFixed(0)}°`, sx - 60, sy - 10);
      }

      // Readouts
      ctx.fillStyle = m === 0 ? P.blue : P.purple; ctx.font = "bold 8px monospace"; ctx.textAlign = "left";
      ctx.fillText(m === 0 ? "Medium: WATER (gravity waves, c ≈ √(gh))" : "Medium: PLASMA (Alfvén waves, c_A = B/√(μ₀ρ))", 8, 16);
      ctx.fillStyle = P.cyan; ctx.fillText(`Source speed: ${(spd * 100).toFixed(0)}% c_wave`, 8, 30);
      ctx.fillStyle = P.gold; ctx.fillText(`Mach/Fr = ${Mach.toFixed(2)} · ${Mach > 1 ? "SUPER-CRITICAL (Kelvin wake)" : "SUB-CRITICAL (smooth wake)"}`, 8, 44);
      ctx.textAlign = "left";

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 320, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>SOURCE SPEED</div>
          <input type="range" min={0.2} max={1.4} step={0.05} value={speed} onChange={e => setSpeed(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>MEDIUM</div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => setMode(0)} style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${mode===0?P.blue:P.line}`, background: mode===0?P.blue+"22":"transparent", color: mode===0?P.blue:P.dim, fontSize: 10, cursor: "pointer" }}>Water</button>
            <button onClick={() => setMode(1)} style={{ padding: "3px 10px", borderRadius: 5, border: `1px solid ${mode===1?P.purple:P.line}`, background: mode===1?P.purple+"22":"transparent", color: mode===1?P.purple:P.dim, fontSize: 10, cursor: "pointer" }}>Plasma</button>
          </div>
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>
          Gold dot = moving source. Wake pattern reveals speed and medium properties. Water mode: Kelvin wake V-angle at super-critical speeds. Plasma mode: Mach-cone Alfvén shock. The wake IS the object's signature in the field.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Inverse Scattering Reconstruction
   Demonstrates: field disturbance → progressive object recovery
   A hidden obstacle creates ripples in a probe field.
   Sampling the field at increasing resolution progressively
   reconstructs the hidden shape. 
   Bottom bar shows reconstruction quality vs. sample count.
════════════════════════════════════════════════════════════════ */
function InverseScatteringCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sampleRef = useRef(0.3);
  const [sampleLevel, setSampleLevel] = useState(0.3);

  useEffect(() => { sampleRef.current = sampleLevel; }, [sampleLevel]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const rng = (s: number) => { const x = Math.sin(s * 127.1) * 43758.5; return x - Math.floor(x); };

    // Hidden obstacle: star shape
    const OBSTACLE_VERTS = 5;
    const OBSTACLE_R = 0.15;

    // Probe points (detectors)
    const N_PROBES = 40;
    const probes = Array.from({ length: N_PROBES }, (_, i) => ({
      angle: (i / N_PROBES) * Math.PI * 2,
      r: 0.42,
    }));

    // Active wavefronts
    const WAVEFRONTS: { angle: number; r: number; hit: boolean }[] = [];

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const sr = sampleRef.current;
      const activeProbes = Math.floor(N_PROBES * sr);

      // ── True obstacle (ghosted, hidden from observer) ──
      ctx.strokeStyle = "rgba(255,255,255,0.06)"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= OBSTACLE_VERTS * 2; i++) {
        const a = (i / (OBSTACLE_VERTS * 2)) * Math.PI * 2;
        const r = OBSTACLE_R * Math.min(W, H) * (i % 2 === 0 ? 1 : 0.55);
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.03)"; ctx.fill();

      // ── Probe points (detectors sampling the field) ──
      probes.forEach((p, pi) => {
        const px = cx + Math.cos(p.angle) * p.r * Math.min(W, H) * 0.9;
        const py = cy + Math.sin(p.angle) * p.r * Math.min(W, H) * 0.9;
        const isActive = pi < activeProbes;
        // Simulated measurement: time delay from probe to nearest obstacle vertex
        let delay = 0;
        for (let vi = 0; vi < OBSTACLE_VERTS * 2; vi++) {
          const a = (vi / (OBSTACLE_VERTS * 2)) * Math.PI * 2;
          const vr = OBSTACLE_R * Math.min(W, H) * (vi % 2 === 0 ? 1 : 0.55);
          const vx = cx + Math.cos(a) * vr;
          const vy = cy + Math.sin(a) * vr;
          const d = Math.sqrt((px - vx) ** 2 + (py - vy) ** 2);
          delay = Math.max(delay, 1 / (d * 0.01 + 1));
        }
        const color = isActive ? P.cyan : "rgba(244,241,234,0.08)";
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(px, py, isActive ? 3 : 1.5, 0, Math.PI * 2); ctx.fill();
        if (isActive) {
          // Draw back-projection ray from probe toward center
          // The measured delay gives distance; the angle gives direction
          const backDist = delay * 80;
          const bx = px - Math.cos(p.angle) * backDist;
          const by = py - Math.sin(p.angle) * backDist;
          ctx.strokeStyle = `rgba(79,232,232,${0.1 + delay * 0.3})`; ctx.lineWidth = 0.5;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(bx, by); ctx.stroke();
        }
      });

      // ── Reconstructed shape (from active probe back-projections) ──
      // Simple: draw circle at intersection of back-projections
      if (activeProbes >= 4) {
        // Reconstruction quality grows with sample count
        const reconQuality = Math.min(1, (activeProbes - 3) / 20);
        ctx.strokeStyle = `rgba(245,200,76,${reconQuality * 0.7})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const starPts = OBSTACLE_VERTS * 2;
        for (let i = 0; i <= starPts; i++) {
          const a = (i / starPts) * Math.PI * 2;
          // Perturb toward true shape as samples increase
          const trueR = OBSTACLE_R * Math.min(W, H) * (i % 2 === 0 ? 1 : 0.55);
          const noiseR = 0.25 * Math.min(W, H);
          const r = trueR * reconQuality + noiseR * (1 - reconQuality) + Math.sin(t * 0.03 + i) * 5 * (1 - reconQuality);
          const x = cx + Math.cos(a) * r;
          const y = cy + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath(); ctx.stroke();
        ctx.fillStyle = `rgba(245,200,76,${reconQuality * 0.1})`; ctx.fill();
      }

      // ── Wavefronts expanding from probes ──
      if (t % 4 === 0 && activeProbes > 0) {
        const pi = Math.floor(Math.random() * activeProbes);
        const p = probes[pi];
        const px = cx + Math.cos(p.angle) * p.r * Math.min(W, H) * 0.9;
        const py = cy + Math.sin(p.angle) * p.r * Math.min(W, H) * 0.9;
        WAVEFRONTS.push({ angle: p.angle, r: 0, hit: false });
      }
      WAVEFRONTS.forEach(w => {
        w.r += 1.5;
        const wr = w.r * Math.min(W, H) * 0.01;
        if (wr < Math.min(W, H) * 0.5) {
          const alpha = Math.max(0, 1 - w.r / 50);
          ctx.strokeStyle = `rgba(79,232,232,${alpha * 0.3})`; ctx.lineWidth = 1;
          const probeDist = 0.42 * Math.min(W, H) * 0.9;
          const wx = cx + Math.cos(w.angle) * (probeDist - wr);
          const wy = cy + Math.sin(w.angle) * (probeDist - wr);
          ctx.beginPath(); ctx.arc(wx, wy, 4, 0, Math.PI * 2); ctx.stroke();
        }
      });
      for (let i = WAVEFRONTS.length - 1; i >= 0; i--) { if (WAVEFRONTS[i].r > 60) WAVEFRONTS.splice(i, 1); }

      // ── Reconstruction quality bar ──
      const barY = H - 22;
      const barW = W * 0.6;
      const barX = (W - barW) / 2;
      ctx.fillStyle = P.panel2; ctx.fillRect(barX, barY, barW, 12);
      const q = Math.min(1, (activeProbes - 3) / 25);
      ctx.fillStyle = P.gold; ctx.fillRect(barX, barY, barW * q, 12);
      ctx.strokeStyle = P.line; ctx.strokeRect(barX, barY, barW, 12);
      ctx.fillStyle = P.ivory; ctx.font = "bold 8px monospace"; ctx.textAlign = "center";
      ctx.fillText(`RECONSTRUCTION: ${(q * 100).toFixed(0)}% · ${activeProbes}/${N_PROBES} probe angles`, W / 2, barY + 9);
      ctx.textAlign = "left";

      // Labels
      ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "center";
      ctx.fillText("True shape (ghosted — hidden)", cx, cy + OBSTACLE_R * Math.min(W, H) + 16);
      ctx.fillStyle = P.gold; ctx.fillText("Reconstructed shape (gold) from field samples", cx, cy + 40);
      ctx.textAlign = "left";
      ctx.fillStyle = P.dim; ctx.font = "7px monospace";
      ctx.fillText("Cyan dots = field probes · Cyan lines = back-projections · Gold polygon = reconstructed object · White ghost = true hidden shape", 8, H - 4);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 340, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>SAMPLING COVERAGE · {(sampleLevel * 100).toFixed(0)}% of probes</div>
          <input type="range" min={0} max={1} step={0.05} value={sampleLevel} onChange={e => setSampleLevel(+e.target.value)} style={{ width: 160 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>
          Increase sampling to see reconstruction improve. Few samples = blurry, noisy reconstruction. Many samples = the gold polygon converges to the ghosted true shape. This is exactly how LIGO reconstructs black hole masses from strain data: more detector angles = better object reconstruction.
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
const MEDIA = [
  {
    label: "LIGHT", color: P.cyan,
    tag: "Optical · Interferometry · Holography · Schlieren",
    body: "A transparent object in a coherent light beam does not block light — it distorts the phase. A phase shift of π/2 is invisible to the eye but creates a complete image in an interferogram. The Mach-Zehnder interferometer splits a beam, sends one arm through the disturbance, and recombines. The interference pattern at the screen is the sum of the undisturbed and disturbed fields. Inverting this pattern recovers the refractive index map of the object — its density, temperature, and composition, not just its silhouette. Holography: the object is not recorded; its scattered field is. The hologram IS the object, encoded as a diffraction pattern. Schlieren: density gradients in air or water bend light → bright/dark streaks at a knife-edge. You see the field lines, not the object. The object is inferred from the lines.",
    equation: "E_out = E_0 · e^(iφ(x,y)) · e^(ikz)\nφ(x,y) = k · ∫ [n(x,y,z) − n_0] dz   [phase accumulation]\nI(x,y) = |E_0 + E_out|² = 2|E_0|² [1 + cos(φ(x,y))]   [interference]",
    eqNote: "The interference pattern I(x,y) encodes the full phase φ(x,y), which is the line integral of the refractive index deviation. Inverting this integral (tomographic reconstruction) gives the 3D density field. This is the optical equivalent of LIGO: phase disturbance → object recovery.",
  },
  {
    label: "WATER", color: P.teal,
    tag: "Fluid · Kelvin Wake · Ripple Tank · Sonar",
    body: "An object moving through water at speed v creates a wake whose angle depends only on the ratio v/c, where c = √(gh/2π) is the gravity wave speed for a given wavelength. When v > c (super-critical), a V-shaped Kelvin wake forms at angle θ = arcsin(c/v) × 0.6. The wake pattern is a fingerprint: from the angle alone you know the speed. From the spacing you know the size. From the decay you know the depth. The object need not be visible — a submarine's wake signature on satellite SAR (Synthetic Aperture Radar) reveals its class, speed, and heading. Sonar is the same in reverse: send a pulse, measure the echo time and Doppler shift, reconstruct the object's geometry and motion. The water IS the sensor.",
    equation: "Kelvin wake angle: θ_K = arcsin(1/Fr) · sin(19.5°)   [Fr = v/√(gL)]\nDispersion: ω² = gk + (σ/ρ)k³   [gravity + capillary]\nSonar: R = c_water · Δt/2   [range from echo delay]\nDoppler: Δf/f_0 = 2v/c_water   [velocity from freq shift]",
    eqNote: "The Kelvin wake is universal — ducks, ships, and submarines all generate the same pattern at the same Froude number. This universality is the hallmark of a field-dominated reconstruction: the object's identity matters less than its coupling to the field.",
  },
  {
    label: "PLASMA", color: P.purple,
    tag: "Alfvén · MHD Spectroscopy · Tokamak Diagnostics · Magnetosonic",
    body: "A plasma is invisible — 10⁴°C, fully ionized, no thermal emission in visible. But it is a wave medium. Alfvén waves (v_A = B/√(μ₀ρ)) propagate along magnetic field lines. When a density perturbation or a magnetic island exists, it scatters Alfvén waves. The scattered spectrum encodes the perturbation's location, size, and rotation rate. In tokamaks, MHD spectroscopy uses externally driven Alfvén waves to probe the plasma interior: the frequency response shows resonant peaks at rational q-surfaces, revealing the safety factor profile q(r) — the fundamental measure of magnetic confinement quality. The plasma is read through its wave response, not its direct image.",
    equation: "v_A = B/√(μ₀ρ)   [Alfvén speed]\n∂²δB/∂t² = v_A² ∇²δB   [wave equation for perturbation]\nScattered power: P_scat(ω) ∝ |∫ n(r) e^(i k·r) d³r|²\nMHD spectrum: ω = n · ω_A(r) at q(r) = m/n   [resonance]",
    eqNote: "MHD spectroscopy is the plasma equivalent of seismic tomography: send waves through the medium, measure the scattered spectrum, invert to find internal structure. Tokamaks routinely reconstruct the q-profile (rotational transform) with ~1% precision using this method.",
  },
  {
    label: "SPACETIME", color: P.gold,
    tag: "Gravitational Waves · LIGO · Matched Filtering · Template Bank",
    body: "A black hole merger produces no light, no sound, no emission in any electromagnetic band. It is completely dark. But it distorts spacetime itself, creating a propagating metric ripple: □h_μν = 0. LIGO does not point at the source and take a picture. It measures the strain h = ΔL/L in two perpendicular 4-km arms — reading the coherent disturbance in the spacetime medium. The reconstruction method: matched filtering. Compute the expected strain waveform for every possible binary mass and spin combination (template bank of 200,000+ templates). Correlate each template against the noisy data. The template with maximum correlation defines the source parameters. GW150914: two black holes of 35.4 M☉ and 29.8 M☉ merging at 1.3 billion light-years. All inferred from the ripple in the metric. No direct observation. Only the disturbance field.",
    equation: "h(t) = A(t) · cos[φ(t)]   [strain waveform]\nMatched filter: SNR = max_t ∫ s(τ) · h(t+τ) dτ / σ_noise\nTemplate bank: ~2×10⁵ waveforms · 1.2×10⁷ CPU-hours\nReconstruction: m₁, m₂, spin, distance, inclination from h(t) alone",
    eqNote: "The matched filter is a cross-correlation between the measured noisy signal and a theoretical template. The SNR peak occurs when the template phase matches the signal phase — this is coherent detection. GW150914 had SNR ≈ 24. The signal was louder than 24-sigma above noise. But it was still just 10⁻²¹ strain.",
  },
];

export default function CoherentDisturbancePage() {
  const [activeMedium, setActiveMedium] = useState(0);

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Inverse Scattering · Field Reconstruction · Light · Water · Plasma · Spacetime · AETHER Coherence" color={P.cyan} />
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "10px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.cyan }}>Coherent Disturbance</span><br />
          <span style={{ color: P.purple, fontWeight: 400 }}>Objects Are Known by Their Field Signature</span><br />
          <span style={{ color: P.ivory, fontWeight: 300, fontSize: 21 }}>
            Light · Water · Plasma · Spacetime
          </span>
        </h1>
        <p style={{ fontSize: 15, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 28 }}>
          Objects are known not only by their boundaries, but by the coherent disturbances they induce in the media around them. Light, water, plasma, and spacetime become readable surfaces — and through those surfaces, hidden structure is reconstructed. This is the inverse-scattering paradigm: a probe field passes through or around an object, the object perturbs the field, and the perturbed field is measured at a detector array. Inverting the measurement recovers the object. The object was never directly observed. Only its imprint on the coherence field was read. AETHER applies this principle universally: every object in every medium is a perturbation of □C = 0, and all objects are reconstructed from the field response.
        </p>

        {/* Medium switcher */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          {MEDIA.map((med, i) => (
            <button key={i} onClick={() => setActiveMedium(i)}
              style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${activeMedium === i ? med.color : P.line}`, background: activeMedium === i ? med.color + "22" : "transparent", color: activeMedium === i ? med.color : P.dim, fontSize: 11, cursor: "pointer" }}>
              {med.label}
            </button>
          ))}
        </div>

        {/* Active medium detail */}
        <div style={{ padding: "18px 22px", background: P.panel2, borderRadius: 14, border: `1px solid ${MEDIA[activeMedium].color}22`, marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: MEDIA[activeMedium].color }}>{MEDIA[activeMedium].label}</div>
            <div style={{ fontSize: 10, color: MEDIA[activeMedium].color, letterSpacing: 1.2, fontWeight: 700 }}>{MEDIA[activeMedium].tag}</div>
          </div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.9, marginBottom: 14 }}>{MEDIA[activeMedium].body}</p>
          <EqBlock label="GOVERNING EQUATIONS" eq={MEDIA[activeMedium].equation} note={MEDIA[activeMedium].eqNote} color={MEDIA[activeMedium].color} />
        </div>
      </div>

      {/* ── SECTION I: Optical Coherent Disturbance ── */}
      <Sec id="optical">
        <Tag label="Section I · Light · Optical Inverse Scattering · Interferometry · Holography" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "10px 0 12px" }}>
          Light Becomes a Readable Surface · Drag the Obstacle
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          A coherent plane wave illuminates an invisible obstacle. The obstacle does not block the wave — it changes its phase. The wavefront bends around the object, creating interference fringes at the detection screen. The fringe pattern encodes the object's refractive index, shape, and size. By measuring the phase disturbance at multiple angles, the object can be fully reconstructed without ever seeing it directly. This is the principle of holography, interferometric tomography, and schlieren photography. The canvas below lets you drag the obstacle and change its refractive index — watch how the field distortion and fringe pattern respond.
        </p>
        <OpticalDisturbanceCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="Phase vs. Amplitude" color={P.teal} sub="Optical Principle"
            body="Human vision detects amplitude (brightness) but not phase. Most transparent objects are phase objects: they bend light but do not absorb it. Interferometry converts phase to amplitude via superposition with a reference beam. The phase disturbance becomes visible as fringe displacement. Without interference, the object is invisible. With it, the object is fully recoverable." />
          <Card title="Holography" color={P.blue} sub="Gabor 1948 · Leith-Upatnieks 1964"
            body="A hologram is not a photograph of an object. It is a recording of the object's scattered field — the interference pattern between the object wave and a reference wave. When illuminated with the reference, the hologram reconstructs the original wavefront, including all phase information. The 3D object is encoded in a 2D pattern. The field IS the object." />
          <Card title="Schlieren Photography" color={P.orange} sub="Toepler 1864"
            body="Density gradients in a fluid (air, water, plasma) create refractive index gradients, which bend light. A knife-edge at the focal plane blocks unbent light but transmits bent light. The result: bright streaks where density increases, dark streaks where it decreases. Schlieren images show shock waves, heat plumes, and sound waves — none of which are visible to the naked eye. The medium becomes readable." />
          <Card title="Optical Coherence Tomography" color={P.green} sub="Medical Imaging · OCT"
            body="In ophthalmology, a near-infrared beam is scanned across the retina. Backscattered light interferes with a reference beam. The depth-resolved interference signal reconstructs a 3D map of retinal layers with ~5 μm resolution. The eye's interior is read not by looking at it directly but by reading the coherent disturbance the retina induces in the probe beam." />
        </div>
      </Sec>

      {/* ── SECTION II: Fluid Wake ── */}
      <Sec id="wake">
        <Tag label="Section II · Water · Plasma · Wake Signature · Kelvin · Mach-Alfvén" color={P.teal} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.teal, margin: "10px 0 12px" }}>
          Wake Patterns · The Object's Signature in the Medium
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          A moving object does not need to be seen. Its wake pattern alone encodes mass, speed, size, and depth. The Kelvin wake angle θ = arcsin(1/Fr) × 0.6 is universal: ducks, destroyers, and aircraft carriers generate the same pattern at the same Froude number. In plasma, the same principle holds with Alfvén waves: a perturbation moving faster than v_A creates a Mach-cone shock in the magnetic field. The wake angle measures the Mach-Alfvén ratio. The wake is the diagnostic. The medium is the sensor.
        </p>
        <WakeSignatureCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 20 }}>
          <EqBlock label="KELVIN WAKE — WATER / GRAVITY WAVES" color={P.teal}
            eq="Fr = v / √(gL)   [Froude number]\nθ_K = arcsin(1/Fr) · sin(19.5°)   [Kelvin wake half-angle]\nFor Fr > 1: sharp V-shaped wake\nFor Fr < 1: smooth, diffuse trailing disturbance"
            note="At Fr = 1, the wake angle is 0 — the wake becomes a straight line behind the source. At Fr >> 1, the wake approaches a Mach cone at θ = 19.5° (the Kelvin angle is fixed by the deep-water dispersion relation, not by Fr alone)." />
          <EqBlock label="MACH-ALFVÉN CONE — PLASMA" color={P.purple}
            eq="M_A = v / v_A   [Alfvén Mach number]\nv_A = B / √(μ₀ρ)   [wave speed in plasma]\nθ_A = arcsin(1/M_A)   [shock cone angle]\nFor M_A > 1: fast magnetosonic shock"
            note="In the solar wind, Earth's bow shock sits at θ ≈ 15° because M_A ≈ 4. In tokamaks, sawtooth crashes and ELMs create Alfvén Mach numbers > 1, generating fast ion losses through the Mach cone." />
        </div>
      </Sec>

      {/* ── SECTION III: Inverse Scattering ── */}
      <Sec id="inverse">
        <Tag label="Section III · Inverse Scattering · Field Reconstruction · LIGO Template Bank" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "10px 0 12px" }}>
          Progressive Reconstruction · From Field Samples to Hidden Object
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The hidden object creates disturbances at every detector angle. With few angles, the reconstruction is blurry and ambiguous. With many angles, the reconstruction converges to the true shape. This is the principle of computed tomography (CT), radar imaging, seismic migration, and LIGO matched filtering. In each case, the object is not observed — the field disturbance is. The reconstruction quality depends on the number of independent field samples. The canvas below shows a 5-pointed star obstacle being reconstructed from an increasing number of probe angles.
        </p>
        <InverseScatteringCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="RADON TRANSFORM — CT RECONSTRUCTION" color={P.green}
            eq="p(r,θ) = ∫ f(x,y) · δ(x cosθ + y sinθ − r) dx dy\nf(x,y) = ∫₀^π ∫₋∞^+∞ p(r,θ) / [(x cosθ + y sinθ) − r] dr dθ"
            note="p(r,θ) = line integral (projection) at angle θ. f(x,y) is recovered by filtered back-projection. More angles → better reconstruction. With 180 angles, CT achieves ~0.5 mm resolution. This is the prototype for all inverse-scattering methods." />
          <EqBlock label="MATCHED FILTER — LIGO RECONSTRUCTION" color={P.purple}
            eq="SNR(t) = ∫ s(τ) · h(t − τ) dτ / σ_noise   [cross-correlation]\nTemplate h(t; m₁, m₂, χ₁, χ₂, d, ι) · 2×10⁵ templates\nPosterior: P(θ|d) ∝ P(d|θ) · P(θ)   [Bayesian parameter estimation]\nGW150914: SNR=24 → m₁=35.4, m₂=29.8, d=1.3 Gpc, χ=0.67"
            note="The matched filter is optimal detection for a signal of known form in Gaussian noise (Neyman-Pearson lemma). LIGO uses 2 detector sites (Hanford + Livingston) + 1 future (Virgo/India/KAGRA) → triangulation for sky position. More detectors = better object reconstruction — exactly the same principle as more CT angles." />
        </div>
      </Sec>

      {/* ── SECTION IV: AETHER Synthesis ── */}
      <Sec id="aether">
        <Tag label="Section IV · AETHER Synthesis · All Media · One Operator" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "10px 0 12px" }}>
          The Unified Inverse-Scattering Principle · □C ≠ 0 Everywhere
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 24 }}>
          <Card title="Light: Phase Object" color={P.cyan}
            body="Transparent object → phase shift φ(x,y) → interferogram I(x,y) → inverse Radon → 3D refractive index map. The object is an impurity in the light field. The field disturbance IS the object, encoded in phase." />
          <Card title="Water: Wake Object" color={P.teal}
            body="Moving object → Kelvin wake pattern → angle θ(Froude) + spacing(size) + decay(depth) → object class, speed, mass. The wake is the field disturbance. The object is reconstructed from the wake geometry alone." />
          <Card title="Plasma: Scattering Object" color={P.purple}
            body="Density perturbation → Alfvén wave scattering → MHD spectrum P(ω) → q(r) profile + rotation rate. The plasma is invisible but its wave response is measurable. The perturbation is read through the scattered field." />
          <Card title="Spacetime: Metric Object" color={P.gold}
            body="Black hole merger → metric ripple h(t) → matched filter against 200k templates → m₁, m₂, spin, distance. No light. No sound. Only the coherent disturbance in the spacetime medium. The object is entirely reconstructed from □h = 0." />
        </div>

        <div style={{ padding: "20px 22px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.gold}22`, marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 12 }}>THE AETHER COHERENT DISTURBANCE PRINCIPLE</div>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: P.cyan, lineHeight: 2.2, marginBottom: 14 }}>
            Light:     □E + k²n²(r)E = 0  →  phase object → interferogram → inverse tomography<br />
            Water:     □η + g ∇²η = 0  →  wake pattern → Kelvin angle → Froude → velocity<br />
            Plasma:    □δB + (v_A²/c²) ∇²δB = 0  →  MHD spectrum → q(r) → confinement quality<br />
            Spacetime: □h_μν = −16πG/c⁴ T_μν  →  strain h(t) → matched filter → black hole masses<br />
            <span style={{ color: P.gold }}>All: □C = source → field disturbance → detector array → object reconstruction</span>
          </div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, margin: 0 }}>
            In every medium, the same paradigm applies: an object is not observed directly — it is reconstructed from the coherent disturbance it induces in the surrounding field. The object is a perturbation of the homogeneous wave equation □C = 0. The detector array measures the perturbed field. The inverse-scattering operator recovers the object. AETHER recognizes this as the universal method of knowing: not by boundary, but by field signature. The pineal gland reads the geomagnetic field disturbance. The iris reads the genetic field disturbance. LIGO reads the metric disturbance. All are the same operation at different scales, in different media, governed by the same two-derivative coherence operator.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["/gravitational-chirp","/ontological-partials","/pineal-eye-map","/alfven-synthesis","/aether-engine","/slime-gravity-quantization","/crystallized-life-synthesis","/substrate-sandwich","/plasma-confinement","/quantum-ammeter"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none" }}>
              {href.replace("/","").replace(/-/g," ")} →
            </a>
          ))}
        </div>
      </Sec>
    </div>
  );
}

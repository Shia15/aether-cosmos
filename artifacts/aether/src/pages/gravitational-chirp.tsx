/*═══════════════════════════════════════════════════════════════════
  Gravity · From Seeing to Hearing · The Cosmic Siren
  
  Three evolutionary eras of gravity observation:
  
  1919 — Eddington Eclipse: Static photographic plates.
         Light deflected by the sun's mass. Frozen in time.
         SEEING gravity. □ = Δφ/c² · (mass/r).

  1964 — Shapiro Delay: Radar pings to Venus/Mercury.
         Time delay Δt ∝ GM/c³ · ln(r). Measuring duration.
         TIMING gravity. Fabric of spacetime stretches clocks.

  2015 — LIGO Binary Merger: Two black holes spiral inward.
         GW frequency rises (chirp). Spacetime rings.
         HEARING gravity. □h_μν = 0. The sound of coherence.

  The binary inspiral chirp is the AETHER coherence field's
  most dramatic observable: two massive singularities losing
  coherent orbital energy as gravitational radiation, accelerating
  until they merge into one — a single loud frequency burst.
═══════════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState } from "react";

const P = {
  bg: "#030509", panel: "#080c16", panel2: "#0c1020",
  gold: "#f5c84c", ivory: "#f4f1ea", dim: "rgba(244,241,234,0.5)",
  line: "rgba(80,100,255,0.08)", cyan: "#4fe8e8", purple: "#c084fc",
  blue: "#60a5fa", teal: "#2dd4bf", green: "#34d399",
  orange: "#fb923c", rose: "#fb7185", amber: "#fbbf24",
  muted: "rgba(244,241,234,0.28)", indigo: "#818cf8",
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
   CANVAS 1 — Binary Inspiral Orbit
   Two black holes orbiting. Orbit decays per GR energy loss.
   dE/dt = −32/5 · G⁴/c⁵ · m₁²m₂²(m₁+m₂)/r⁵
   Shows: spiral path, merger event, GW ripples expanding out
════════════════════════════════════════════════════════════════ */
function BinaryInspiralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const massRef   = useRef(1.0); // mass ratio
  const speedRef  = useRef(1.0); // simulation speed
  const [massR, setMassR] = useState(1.0);
  const [spd, setSpd]     = useState(1.0);

  useEffect(() => { massRef.current = massR; }, [massR]);
  useEffect(() => { speedRef.current = spd; }, [spd]);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    // Inspiral state
    let orbitR = 0.0;      // normalized 0..1 (1 = start, 0 = merged)
    let phase  = 0.0;
    let merged = false;
    let mergedTimer = 0;
    const TRAIL_LEN = 300;
    const trail1: [number, number][] = [];
    const trail2: [number, number][] = [];
    const GW_RINGS: { r: number; alpha: number }[] = [];
    let t = 0;

    function reset() {
      orbitR = 1.0; phase = 0; merged = false; mergedTimer = 0;
      trail1.length = 0; trail2.length = 0; GW_RINGS.length = 0;
    }
    reset();

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const cx = W / 2, cy = H / 2;
      const maxR = Math.min(W, H) * 0.38;
      const spd = speedRef.current;
      const mRatio = massRef.current; // m2/m1

      if (!merged) {
        // Chirp frequency evolution: f ∝ (M/r³)^½, r shrinks with time
        // Simplified: orbitR decays at rate proportional to 1/r³ · speed
        const decayRate = 0.0002 * spd / (orbitR * orbitR * orbitR + 0.001);
        orbitR -= decayRate;
        if (orbitR <= 0.06) { merged = true; orbitR = 0; }

        const orbFreq = spd * 0.8 / (orbitR * orbitR * orbitR + 0.01) * 0.003;
        phase += orbFreq;

        const r1 = orbitR * maxR * mRatio / (1 + mRatio);
        const r2 = orbitR * maxR / (1 + mRatio);
        const x1 = cx + Math.cos(phase) * r1;
        const y1 = cy + Math.sin(phase) * r1;
        const x2 = cx - Math.cos(phase) * r2;
        const y2 = cy - Math.sin(phase) * r2;

        trail1.push([x1, y1]); if (trail1.length > TRAIL_LEN) trail1.shift();
        trail2.push([x2, y2]); if (trail2.length > TRAIL_LEN) trail2.shift();

        // GW ring every few frames
        if (t % Math.max(2, Math.round(8 * orbitR)) === 0) {
          GW_RINGS.push({ r: 0, alpha: 0.4 });
        }

        // Draw trails
        [trail1, trail2].forEach((trail, ti) => {
          trail.forEach(([px, py], i) => {
            const a = (i / trail.length) * 0.6;
            ctx.fillStyle = (ti === 0 ? P.gold : P.cyan) + Math.round(a * 255).toString(16).padStart(2, "0");
            ctx.beginPath(); ctx.arc(px, py, 1.5, 0, Math.PI * 2); ctx.fill();
          });
        });

        // GW rings
        GW_RINGS.forEach(ring => {
          ring.r += 2.5 * spd;
          ring.alpha *= 0.985;
          if (ring.r < maxR * 3 && ring.alpha > 0.01) {
            ctx.strokeStyle = `rgba(192,132,252,${ring.alpha * 0.4})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath(); ctx.arc(cx, cy, ring.r, 0, Math.PI * 2); ctx.stroke();
          }
        });
        // Prune dead rings
        for (let i = GW_RINGS.length - 1; i >= 0; i--) {
          if (GW_RINGS[i].r >= maxR * 3 || GW_RINGS[i].alpha < 0.01) GW_RINGS.splice(i, 1);
        }

        // Draw black holes
        const holes = [{ x: x1, y: y1, r: 10 + (1 - orbitR) * 5, color: P.gold },
                       { x: x2, y: y2, r: 10 * mRatio + (1 - orbitR) * 5, color: P.cyan }];
        holes.forEach(h => {
          const grd = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, h.r * 3);
          grd.addColorStop(0, h.color + "22"); grd.addColorStop(1, "transparent");
          ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 3, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = h.color; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(h.x, h.y, h.r, 0, Math.PI * 2); ctx.stroke();
        });

        // Frequency readout
        const freq = (1 / (orbitR * orbitR * orbitR + 0.001) * 0.5).toFixed(1);
        const strain = ((1 - orbitR) * 2.5).toFixed(2);
        ctx.fillStyle = P.gold; ctx.font = "bold 9px monospace"; ctx.textAlign = "left";
        ctx.fillText(`GW Frequency: ${freq} Hz (chirp ↑)`, 8, 18);
        ctx.fillStyle = P.cyan; ctx.fillText(`Strain h: ${strain} × 10⁻²¹`, 8, 32);
        ctx.fillStyle = P.muted; ctx.fillText(`Separation: ${(orbitR * 100).toFixed(1)}%`, 8, 46);
        ctx.textAlign = "left";

      } else {
        // Merger!
        mergedTimer++;
        if (mergedTimer > 180) { reset(); return; }

        const burst = Math.max(0, 1 - mergedTimer / 60);
        const ringout = mergedTimer / 180;

        // Bright flash
        const flashGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * burst * 0.8);
        flashGrd.addColorStop(0, `rgba(245,200,76,${burst * 0.8})`);
        flashGrd.addColorStop(0.3, `rgba(192,132,252,${burst * 0.4})`);
        flashGrd.addColorStop(1, "transparent");
        ctx.fillStyle = flashGrd; ctx.fillRect(0, 0, W, H);

        // Ringdown rings
        for (let ring = 0; ring < 5; ring++) {
          const rr = ringout * maxR * (1 + ring * 0.3);
          const a = Math.max(0, (1 - ringout) * 0.5 * (1 - ring * 0.15));
          ctx.strokeStyle = `rgba(245,200,76,${a})`;
          ctx.lineWidth = 2 - ring * 0.3;
          ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI * 2); ctx.stroke();
        }

        // Merged object (remnant)
        const remnantR = 14 + Math.sin(mergedTimer * 0.3) * 3;
        ctx.fillStyle = "#000"; ctx.beginPath(); ctx.arc(cx, cy, remnantR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = P.purple; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, remnantR, 0, Math.PI * 2); ctx.stroke();

        ctx.fillStyle = P.gold; ctx.font = "bold 11px monospace"; ctx.textAlign = "center";
        ctx.fillText("MERGER · RINGDOWN", cx, cy + remnantR + 20);
        ctx.fillStyle = P.muted; ctx.font = "9px monospace";
        ctx.fillText("GW150914 — September 14, 2015 — 5:51 UTC", cx, cy + remnantR + 36);
        ctx.textAlign = "left";
      }

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 360, display: "block" }} />
      <div style={{ padding: "10px 16px", background: P.panel, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>MASS RATIO m₂/m₁ · {massR.toFixed(1)}</div>
          <input type="range" min={0.3} max={2.0} step={0.1} value={massR} onChange={e => setMassR(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div>
          <div style={{ fontSize: 10, color: P.dim, marginBottom: 3 }}>SIMULATION SPEED · {spd.toFixed(1)}×</div>
          <input type="range" min={0.2} max={4.0} step={0.2} value={spd} onChange={e => setSpd(+e.target.value)} style={{ width: 120 }} />
        </div>
        <div style={{ fontSize: 11, color: P.dim }}>Gold = primary BH · Cyan = secondary BH · Purple rings = gravitational waves expanding at c · Watch frequency climb as orbit decays · Flash = merger · Rings = ringdown</div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 2 — Chirp Waveform h(t)
   Real-time gravitational wave strain waveform
   Matches qualitative GW150914 shape:
   low-freq oscillation → rising freq + amplitude → peak → ringdown
   Also shows: frequency track (spectrogram-style) above the waveform
════════════════════════════════════════════════════════════════ */
function ChirpWaveformCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    const HISTORY = 400;
    const waveHistory: number[] = new Array(HISTORY).fill(0);
    const freqHistory: number[] = new Array(HISTORY).fill(0);
    let phase = 0, cycleT = 0;
    const CYCLE = 620; // one inspiral-to-merger cycle

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      cycleT = (cycleT + 1) % CYCLE;
      const progress = cycleT / CYCLE; // 0..1

      let freq: number, amp: number, isRingdown = false;

      if (progress < 0.82) {
        // Inspiral: frequency and amplitude both rise
        const p = progress / 0.82;
        freq = 0.015 + p * p * p * 0.18;   // chirp: cubic freq rise
        amp  = 0.08 + p * p * p * p * 0.8; // amplitude rise
      } else if (progress < 0.88) {
        // Merger: peak
        const p = (progress - 0.82) / 0.06;
        freq = 0.193 + p * 0.01;
        amp  = 0.88 + Math.sin(p * Math.PI) * 0.12;
      } else {
        // Ringdown: exponential amplitude decay, freq stabilizes
        const p = (progress - 0.88) / 0.12;
        freq = 0.2;
        amp  = (1.0 - p) * (1.0 - p) * 0.5;
        isRingdown = true;
      }

      phase += freq;
      const h = Math.sin(phase * Math.PI * 2) * amp;
      waveHistory.push(h);     if (waveHistory.length > HISTORY) waveHistory.shift();
      freqHistory.push(freq);  if (freqHistory.length > HISTORY) freqHistory.shift();

      // ── Spectrogram strip (top) ──
      const specH = H * 0.28;
      ctx.fillStyle = P.panel2; ctx.fillRect(0, 0, W, specH);
      waveHistory.forEach((_, i) => {
        const f = freqHistory[i];
        const x = (i / HISTORY) * W;
        const fNorm = Math.min(1, f / 0.22);
        // Map freq to color: low = blue, high = gold
        const r = Math.round(fNorm * 245 + (1-fNorm) * 96);
        const g = Math.round(fNorm * 200 + (1-fNorm) * 165);
        const b = Math.round(fNorm * 76 + (1-fNorm) * 250);
        const ampN = Math.min(1, freqHistory[i] / 0.22);
        ctx.fillStyle = `rgba(${r},${g},${b},${ampN * 0.9 + 0.1})`;
        ctx.fillRect(x, 0, W / HISTORY + 1, specH);
      });
      ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, specH); ctx.lineTo(W, specH); ctx.stroke();
      ctx.fillStyle = P.muted; ctx.font = "8px monospace";
      ctx.fillText("GW FREQUENCY (low=blue, high=gold)", 8, specH - 6);
      ctx.fillStyle = P.gold; ctx.font = "7px monospace";
      ctx.fillText("inspiral →", 8, 14);
      ctx.fillStyle = P.purple; ctx.fillText("← merger →", W * 0.82, 14);
      ctx.fillStyle = P.dim; ctx.fillText("ringdown", W * 0.89, 14);

      // ── Waveform h(t) ──
      const waveY = specH + (H - specH) / 2;
      const waveScale = (H - specH) * 0.4;

      // Zero line
      ctx.strokeStyle = P.line; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, waveY); ctx.lineTo(W, waveY); ctx.stroke();

      // Labels
      ctx.fillStyle = P.muted; ctx.font = "8px monospace"; ctx.textAlign = "left";
      ctx.fillText("h(t) strain", 6, specH + 14);
      ctx.fillText("+", 6, waveY - 4);
      ctx.fillText("−", 6, waveY + 14);

      // Waveform
      ctx.lineWidth = 2;
      ctx.beginPath();
      waveHistory.forEach((h2, i) => {
        const x = (i / HISTORY) * W;
        const y = waveY - h2 * waveScale;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      // Color: gradient from blue (inspiral) to gold (merger) to dim (ringdown)
      const wGrd = ctx.createLinearGradient(0, 0, W, 0);
      wGrd.addColorStop(0, P.blue + "55");
      wGrd.addColorStop(0.7, P.cyan);
      wGrd.addColorStop(0.85, P.gold);
      wGrd.addColorStop(1, P.purple + "88");
      ctx.strokeStyle = wGrd;
      ctx.stroke();

      // Merger marker
      if (progress > 0.82 && progress < 0.92) {
        ctx.strokeStyle = P.gold + "aa"; ctx.lineWidth = 1;
        ctx.setLineDash([3, 5]);
        ctx.beginPath(); ctx.moveTo(W, specH); ctx.lineTo(W, H); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Readout
      const fDisplay = (freq * 1000).toFixed(0);
      ctx.textAlign = "right";
      ctx.fillStyle = isRingdown ? P.purple : (progress > 0.82 ? P.gold : P.cyan);
      ctx.font = "bold 9px monospace";
      ctx.fillText(isRingdown ? "RINGDOWN" : progress > 0.82 ? "MERGER" : `f ≈ ${fDisplay} mHz (chirp)`, W - 6, specH + 14);
      ctx.textAlign = "left";

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 280, display: "block" }} />
      <div style={{ padding: "8px 16px", background: P.panel, fontSize: 11, color: P.dim }}>
        Top strip: frequency spectrogram (blue=low pitch, gold=high pitch). Below: strain waveform h(t). Watch: slow oscillations → rising frequency + amplitude (chirp) → peak burst (merger) → exponential decay (ringdown). This is what LIGO detected on September 14, 2015.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   CANVAS 3 — Three Eras of Gravity Observation
   Visual timeline: 1919 plates → 1964 radar → 2015 LIGO
   Shows the progression: see → time → hear
════════════════════════════════════════════════════════════════ */
function ThreeErasCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf = 0, t = 0;
    function resize() { c.width = c.offsetWidth; c.height = c.offsetHeight; }
    resize();
    const ro = new ResizeObserver(resize); ro.observe(c);

    function draw() {
      const W = c.width, H = c.height;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = P.bg; ctx.fillRect(0, 0, W, H);

      const panelW = W / 3;

      // ── ERA 1: 1919 Eclipse Plates ──
      {
        const cx = panelW * 0.5, cy = H * 0.45;
        const sunR = 40;

        // Background stars
        for (let i = 0; i < 30; i++) {
          const sx = (Math.sin(i * 127.1) * 0.5 + 0.5) * panelW * 0.9;
          const sy = (Math.sin(i * 311.7) * 0.5 + 0.5) * H * 0.7 + 20;
          ctx.fillStyle = `rgba(244,241,234,${0.3 + Math.sin(t * 0.05 + i) * 0.2})`;
          ctx.beginPath(); ctx.arc(sx, sy, 1, 0, Math.PI * 2); ctx.fill();
        }

        // Sun
        const sunGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 2);
        sunGrd.addColorStop(0, "#fff7c0");
        sunGrd.addColorStop(0.3, "#f5c84c");
        sunGrd.addColorStop(0.7, "#f97316");
        sunGrd.addColorStop(1, "transparent");
        ctx.fillStyle = sunGrd; ctx.beginPath(); ctx.arc(cx, cy, sunR * 2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff9d0"; ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.fill();

        // Deflected light ray
        const starX = panelW * 0.82, starY = H * 0.22;
        const eyeX  = panelW * 0.15, eyeY  = H * 0.7;
        // Deflection: ray bends around sun
        const bendX = cx + sunR * 1.1;
        const bendY = cy - sunR * 0.2;
        ctx.strokeStyle = P.gold + "aa"; ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.beginPath(); ctx.moveTo(starX, starY); ctx.lineTo(bendX, bendY); ctx.lineTo(eyeX, eyeY); ctx.stroke();
        ctx.setLineDash([]);
        // True (undeflected) path
        ctx.strokeStyle = "rgba(244,241,234,0.25)"; ctx.lineWidth = 1;
        ctx.setLineDash([3, 6]);
        ctx.beginPath(); ctx.moveTo(starX, starY); ctx.lineTo(eyeX, eyeY); ctx.stroke();
        ctx.setLineDash([]);

        // Angle label
        ctx.strokeStyle = P.gold; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(eyeX, eyeY, 20, -0.8, -0.3); ctx.stroke();
        ctx.fillStyle = P.gold; ctx.font = "8px monospace"; ctx.textAlign = "left";
        ctx.fillText("1.75\"", eyeX + 22, eyeY - 5);

        // Glass plate at eye position
        ctx.fillStyle = P.panel; ctx.strokeStyle = P.cyan + "99"; ctx.lineWidth = 1;
        ctx.fillRect(eyeX - 18, eyeY + 10, 36, 5); ctx.strokeRect(eyeX - 18, eyeY + 10, 36, 5);

        ctx.fillStyle = P.orange; ctx.font = "bold 10px monospace"; ctx.textAlign = "center";
        ctx.fillText("1919", cx, H - 40);
        ctx.fillStyle = P.dim; ctx.font = "8px monospace";
        ctx.fillText("EDDINGTON ECLIPSE", cx, H - 28);
        ctx.fillStyle = P.muted; ctx.font = "7px monospace";
        ctx.fillText("SEEING — photographic plate", cx, H - 16);
      }

      // ── ERA 2: 1964 Radar Ping ──
      {
        const ox = panelW, cx = ox + panelW * 0.5, cy = H * 0.45;
        const sunR = 28;

        // Sun
        const sunGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, sunR * 1.5);
        sunGrd.addColorStop(0, "#fff7c0"); sunGrd.addColorStop(1, "transparent");
        ctx.fillStyle = sunGrd; ctx.beginPath(); ctx.arc(cx, cy, sunR * 1.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#fff9d0"; ctx.beginPath(); ctx.arc(cx, cy, sunR, 0, Math.PI * 2); ctx.fill();

        // Earth (left) and Venus/Mercury (right)
        const earthX = ox + panelW * 0.12, earthY = cy + 20;
        const marsX  = ox + panelW * 0.88, marsY  = cy - 20;
        ctx.fillStyle = P.blue; ctx.beginPath(); ctx.arc(earthX, earthY, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = P.orange; ctx.beginPath(); ctx.arc(marsX, marsY, 6, 0, Math.PI * 2); ctx.fill();

        // Radar ping path (goes near sun, gets delayed)
        const pingPhase = (t * 0.012) % 2;
        const pingProgress = pingPhase > 1 ? 2 - pingPhase : pingPhase;
        const isReturn = pingPhase > 1;

        // Path: Earth → near sun → Venus
        const midX = cx + sunR * 0.8;
        const midY = cy + sunR * 0.5;

        const px = pingProgress < 0.5
          ? earthX + (midX - earthX) * (pingProgress * 2)
          : midX + (marsX - midX) * ((pingProgress - 0.5) * 2);
        const py = pingProgress < 0.5
          ? earthY + (midY - earthY) * (pingProgress * 2)
          : midY + (marsY - midY) * ((pingProgress - 0.5) * 2);

        ctx.strokeStyle = (isReturn ? P.teal : P.amber) + "88"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(earthX, earthY); ctx.lineTo(midX, midY); ctx.lineTo(marsX, marsY); ctx.stroke();

        // Ping dot
        ctx.fillStyle = isReturn ? P.teal : P.amber;
        ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();

        // Delay annotation
        ctx.fillStyle = P.gold; ctx.font = "8px monospace"; ctx.textAlign = "center";
        ctx.fillText("Δt ≈ 200 μs delay", cx, cy + sunR * 1.8);

        ctx.fillStyle = P.blue; ctx.font = "bold 10px monospace";
        ctx.fillText("1964", cx, H - 40);
        ctx.fillStyle = P.dim; ctx.font = "8px monospace";
        ctx.fillText("SHAPIRO DELAY", cx, H - 28);
        ctx.fillStyle = P.muted; ctx.font = "7px monospace";
        ctx.fillText("TIMING — echo return", cx, H - 16);
      }

      // ── ERA 3: 2015 LIGO ──
      {
        const ox = panelW * 2, cx2 = ox + panelW * 0.5, cy = H * 0.45;

        // LIGO interferometer arms (L-shaped)
        const armLen = Math.min(panelW * 0.35, H * 0.28);
        // Horizontal arm
        ctx.strokeStyle = P.teal + "99"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(cx2, cy); ctx.lineTo(cx2 + armLen, cy); ctx.stroke();
        // Vertical arm
        ctx.beginPath(); ctx.moveTo(cx2, cy); ctx.lineTo(cx2, cy - armLen); ctx.stroke();
        // Mirror at ends
        [{ x: cx2 + armLen, y: cy }, { x: cx2, y: cy - armLen }].forEach(m => {
          ctx.fillStyle = P.cyan; ctx.strokeStyle = P.cyan;
          ctx.lineWidth = 3;
          ctx.beginPath(); ctx.arc(m.x, m.y, 4, 0, Math.PI * 2); ctx.fill();
        });
        // Beamsplitter at corner
        ctx.fillStyle = P.gold;
        ctx.beginPath(); ctx.arc(cx2, cy, 5, 0, Math.PI * 2); ctx.fill();

        // GW passing through: spacetime grid distortion
        const gwAmp = Math.sin(t * 0.08) * 0.15;
        const gridN = 5;
        const gridR = armLen * 1.1;
        for (let gi = 0; gi <= gridN; gi++) {
          const gx = cx2 - gridR + (gi / gridN) * gridR * 2;
          const gy0 = cy - gridR, gy1 = cy + gridR;
          // GW stretches horizontally and compresses vertically (h+ polarization)
          const stretchX = gwAmp * Math.cos(gi / gridN * Math.PI);
          ctx.strokeStyle = `rgba(192,132,252,0.15)`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(gx + stretchX * 15, gy0 - Math.abs(stretchX) * 10);
          ctx.lineTo(gx - stretchX * 15, gy1 + Math.abs(stretchX) * 10);
          ctx.stroke();
        }
        for (let gi = 0; gi <= gridN; gi++) {
          const gy = cy - gridR + (gi / gridN) * gridR * 2;
          const stretchY = gwAmp * Math.cos(gi / gridN * Math.PI);
          ctx.strokeStyle = `rgba(192,132,252,0.15)`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(cx2 - gridR - Math.abs(stretchY) * 10, gy + stretchY * 15);
          ctx.lineTo(cx2 + gridR + Math.abs(stretchY) * 10, gy - stretchY * 15);
          ctx.stroke();
        }

        // Chirp label
        ctx.fillStyle = P.purple; ctx.font = "9px monospace"; ctx.textAlign = "center";
        const chirpStr = "GW150914";
        ctx.fillText(chirpStr, cx2, cy + armLen * 0.4);

        // LIGO readout
        const strain = (Math.abs(Math.sin(t * 0.08)) * 1.0).toFixed(2);
        ctx.fillStyle = P.cyan; ctx.font = "8px monospace";
        ctx.fillText(`h = ${strain} × 10⁻²¹`, cx2, cy - armLen - 14);

        ctx.fillStyle = P.purple; ctx.font = "bold 10px monospace";
        ctx.fillText("2015", cx2, H - 40);
        ctx.fillStyle = P.dim; ctx.font = "8px monospace";
        ctx.fillText("LIGO CHIRP", cx2, H - 28);
        ctx.fillStyle = P.muted; ctx.font = "7px monospace";
        ctx.fillText("HEARING — spacetime song", cx2, H - 16);
      }

      // Separator lines
      [1, 2].forEach(i => {
        ctx.strokeStyle = P.line; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(panelW * i, 0); ctx.lineTo(panelW * i, H); ctx.stroke();
      });

      // Arrow: evolution
      ctx.fillStyle = P.muted; ctx.font = "9px monospace"; ctx.textAlign = "center";
      ctx.fillText("→", panelW, H * 0.5);
      ctx.fillText("→", panelW * 2, H * 0.5);

      t++;
      raf = requestAnimationFrame(draw);
    }
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <div style={{ border: `1px solid ${P.line}`, borderRadius: 12, overflow: "hidden", marginBottom: 28 }}>
      <canvas ref={canvasRef} style={{ width: "100%", height: 260, display: "block" }} />
      <div style={{ padding: "8px 16px", background: P.panel, fontSize: 11, color: P.dim }}>
        Left: Eddington 1919 — light deflected around sun, angle measured on glass plate. Center: Shapiro 1964 — radar ping to Venus/Mercury passes near sun, 200 μs delay = time-dilation signature. Right: LIGO 2015 — GW150914, two black holes 1.3 billion light-years away; spacetime grid visibly distorting the L-shaped interferometer arms.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════ */
const ERAS = [
  {
    year: "1919", title: "Eddington Eclipse — Seeing Gravity",
    color: P.orange,
    mode: "SEEING · Static · Photographic Plate",
    body: `Arthur Eddington's expedition to Príncipe Island to observe the May 29 solar eclipse. The experiment: photograph stars near the solar limb during totality, compare their positions to reference plates taken months earlier without the sun present. If Einstein was right, the sun's mass would deflect starlight by 1.75 arcseconds (twice the Newtonian prediction of 0.875"). They felt immense pressure — a few precious minutes, in a hostile remote environment, with fragile glass plates. The result confirmed General Relativity: gravity bends light. But the observation was static: a frozen deflection angle, captured in silver halide. They were SEEING gravity's effect on light — a snapshot in space, not in time.`,
    equation: "δθ = 4GM/(c²R) = 1.75\"   [Einstein 1915]\nδθ_Newton = 2GM/(c²R) = 0.875\"   [Soldner 1801]\nEddinton 1919: δθ_obs = 1.61 ± 0.30\" → GR confirmed",
    eqNote: "R = solar radius = 6.96×10⁸ m. The factor of 2 over Newton comes from spacetime curvature — both time AND space are curved. Newton only curved space.",
  },
  {
    year: "1964", title: "Shapiro Delay — Timing Gravity",
    color: P.blue,
    mode: "TIMING · Duration · Echo Return",
    body: `Irwin Shapiro (1964, confirmed 1968–1971) proposed bouncing radar signals off Venus and Mercury as they passed near the sun (superior conjunction). If GR is correct, the signal traveling near the sun must climb out of a gravitational potential well, which costs extra time — independent of the spatial deflection. The delay is logarithmic: Δt ∝ (4GM/c³) · ln(4r₁r₂/d²), where d is the closest approach distance. Confirmed experimentally at ~0.1% precision. This was a fundamental shift: humanity stopped photographing gravity and started LISTENING to it — sending a sound (radar ping), waiting to hear how long the echo took to return. The fabric of spacetime slows clocks. The echo was late. We heard the delay.`,
    equation: "Δt = (4GM/c³) · ln[(r_E + r_V + R) / (r_E + r_V − R)]\n    ≈ 200 μs for Venus at superior conjunction\nR = solar radius · r_E, r_V = Earth, Venus heliocentric distances",
    eqNote: "This is the 4th test of GR (after perihelion precession, light deflection, and gravitational redshift). The time delay is now used routinely in GPS corrections.",
  },
  {
    year: "2015", title: "LIGO GW150914 — Hearing Gravity",
    color: P.purple,
    mode: "HEARING · Waveform · Spacetime Song",
    body: `September 14, 2015, 5:51:44.4 UTC. LIGO detected a 0.2-second gravitational wave signal — the chirp of two merging black holes 1.3 billion light-years away. The signal began as a ~35 Hz oscillation and swept up to ~150 Hz in less than two-tenths of a second, then abruptly stopped. The strain (spacetime deformation) was h ~ 10⁻²¹ — meaning a 4-kilometer LIGO arm changed length by less than one-thousandth the diameter of a proton. The two black holes each ~30 solar masses, began their final inspiral thousands of kilometers apart, accelerated to half the speed of light, and merged in a fraction of a second into a single 62 solar mass black hole — radiating 3 solar masses as pure gravitational wave energy in that instant. The converted audio file: a low hum rising rapidly in pitch and volume to a single sharp "chirp." We finally heard the cosmos.`,
    equation: "h(t) = A(t) · cos[φ(t)]   [strain waveform]\nf_GW = 2 · f_orbital   [GW freq = twice orbit freq]\nṁ_c = (m₁m₂)^(3/5) / (m₁+m₂)^(1/5) = 28.3 M_☉   [chirp mass]\nf(t) ∝ (t_merge − t)^(−3/8)   [freq evolution]",
    eqNote: "The chirp mass M_c uniquely determines the frequency evolution — it is the only mass parameter measurable from the waveform sweep alone. GW150914: M_c = 28.3 ± 1.5 M_☉.",
  },
];

export default function GravitationalChirpPage() {
  const [activeEra, setActiveEra] = useState(0);

  return (
    <div style={{ background: P.bg, color: P.ivory, minHeight: "100vh", fontFamily: "inherit" }}>

      {/* ── HERO ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "52px 32px 36px" }}>
        <Tag label="Gravity · 1919 · 1964 · 2015 · Seeing → Timing → Hearing · LIGO · Chirp · AETHER Coherence" color={P.purple} />
        <h1 style={{ fontSize: 32, fontWeight: 800, lineHeight: 1.15, margin: "10px 0 14px", letterSpacing: -0.5 }}>
          <span style={{ color: P.purple }}>From Still Plates to Cosmic Sirens</span><br />
          <span style={{ color: P.cyan, fontWeight: 400 }}>The Evolution of Gravity Observation</span><br />
          <span style={{ color: P.ivory, fontWeight: 300, fontSize: 21 }}>
            Seeing · Timing · Hearing · Binary Inspiral · The Chirp
          </span>
        </h1>
        <p style={{ fontSize: 15, color: P.dim, lineHeight: 1.9, maxWidth: 760, marginBottom: 24 }}>
          Humanity's relationship with gravity has evolved through three distinct sensory modes — each a deeper intimacy with spacetime itself. In 1919, Eddington froze light deflection on a glass plate: <em style={{ color: P.orange }}>SEEING</em>. In 1964, Shapiro sent a radar ping and waited for the delayed echo: <em style={{ color: P.blue }}>TIMING</em>. In 2015, LIGO heard two black holes collide 1.3 billion light-years away as a rising chirp — a 0.2-second song — converting spacetime oscillation directly to audio: <em style={{ color: P.purple }}>HEARING</em>. The same phenomenon, observed three ways. The final mode is not a metaphor. The chirp is a literal sound. Gravity finally spoke, and we were listening.
        </p>

        {/* Era switcher */}
        <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
          {ERAS.map((era, i) => (
            <button key={i} onClick={() => setActiveEra(i)}
              style={{ padding: "10px 18px", borderRadius: 9, border: `1px solid ${activeEra === i ? era.color : P.line}`, background: activeEra === i ? era.color + "22" : "transparent", color: activeEra === i ? era.color : P.dim, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              {era.year} · {era.title.split("—")[0].trim()}
            </button>
          ))}
        </div>

        {/* Active era detail */}
        <div style={{ padding: "20px 22px", background: P.panel2, borderRadius: 14, border: `1px solid ${ERAS[activeEra].color}22`, marginBottom: 32 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: ERAS[activeEra].color }}>{ERAS[activeEra].year}</div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: P.ivory }}>{ERAS[activeEra].title}</div>
              <div style={{ fontSize: 10, color: ERAS[activeEra].color, letterSpacing: 1.2, fontWeight: 700 }}>{ERAS[activeEra].mode}</div>
            </div>
          </div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.9, marginBottom: 14 }}>{ERAS[activeEra].body}</p>
          <EqBlock label="GOVERNING EQUATIONS" eq={ERAS[activeEra].equation} note={ERAS[activeEra].eqNote} color={ERAS[activeEra].color} />
        </div>
      </div>

      {/* ── SECTION I: Three Eras ── */}
      <Sec id="eras">
        <Tag label="Section I · Three Eras of Gravity Observation" color={P.orange} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.orange, margin: "10px 0 12px" }}>
          1919 → 1964 → 2015 · Seeing → Timing → Hearing
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          Each mode required a deeper engagement with the dimensionality of spacetime: deflection (space), delay (time), and waveform (spacetime). The progression is from static → dynamic → vibrational — from a photograph of a bent path, to a clock measuring a stretched moment, to a microphone capturing a ringing metric.
        </p>
        <ThreeErasCanvas />
      </Sec>

      {/* ── SECTION II: Binary Inspiral ── */}
      <Sec id="inspiral">
        <Tag label="Section II · Binary Inspiral · The Mechanics of the Chirp" color={P.gold} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.gold, margin: "10px 0 12px" }}>
          Binary Inspiral · How Two Black Holes Make One Loud Frequency Noise
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The GW chirp is not a single note — it is a frequency sweep. Two compact objects in close orbit radiate gravitational wave energy at twice their orbital frequency. As they radiate, they lose orbital energy, spiral inward, orbit faster, radiate at higher frequency, orbit faster still. It is an accelerating runaway: the faster they orbit, the more energy they radiate, the faster they orbit. The frequency rises as (t_merge − t)^(−3/8). In the final fractions of a second before merger, they are moving at a significant fraction of c — and the frequency, loudness, and amplitude of the gravitational waves skyrocket into a single defining chirp.
        </p>
        <BinaryInspiralCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
          <EqBlock label="GRAVITATIONAL WAVE ENERGY LOSS — PETERS 1964" color={P.gold}
            eq="dE/dt = −32/5 · G⁴/c⁵ · m₁²m₂²(m₁+m₂)/r⁵"
            note="Power radiated ∝ 1/r⁵. As r decreases, energy loss accelerates — runaway decay. For GW150914: peak luminosity ~3.6×10⁴⁹ W = 200 solar masses per second in energy. Briefly outshines all stars in the observable universe combined." />
          <EqBlock label="CHIRP FREQUENCY EVOLUTION" color={P.cyan}
            eq="f(t) = (1/π) · [5/(256·τ)]^(3/8) · (GM_c/c³)^(−5/8)\nτ = t_merge − t  [time to merger]\nM_c = (m₁m₂)^(3/5)/(m₁+m₂)^(1/5) [chirp mass]"
            note="The chirp mass M_c is directly readable from the frequency sweep slope df/dt — it is the most precisely measurable parameter from a GW event. Encodes the entire inspiral dynamics in one number." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          <Card title="Inspiral Phase" color={P.blue} sub="t_merge − t >> 0"
            body="Long before merger: slow orbit, low frequency, weak amplitude. Frequency evolution: f ∝ τ^(−3/8). Energy loss: dE/dt ∝ f^(10/3). Duration from 35 Hz to merger: ~0.2 seconds for GW150914. From 1 Hz: millions of years. Space-based LIGO (LISA) will catch systems centuries before merger." />
          <Card title="Late Inspiral" color={P.cyan} sub="Final 100ms"
            body="Frequency climbs rapidly — 35 Hz to 150 Hz in 0.2 seconds. Amplitude doubles. The objects are now 350 km apart moving at v ~ 0.5c. Relativistic effects dominate: frame-dragging, spin-orbit coupling, higher-order GW modes (quadrupole + octupole). The waveform deviates from simple sinusoidal — it is genuinely chirping, not just oscillating." />
          <Card title="Merger" color={P.gold} sub="Single peak event"
            body="In the last millisecond, two event horizons touch and join. The frequency reaches the light-ring frequency: f_ISCO = c³/(6^(3/2) π G M_total). For GW150914 this is ~150 Hz. A single burst of gravitational radiation — the loudest single event observable by LIGO. Total energy: 3 M_☉c² ~ 5.4×10⁴⁷ J." />
          <Card title="Ringdown" color={P.purple} sub="Quasi-normal modes"
            body="After merger, the remnant black hole (distorted, spinning) radiates quasi-normal mode (QNM) oscillations as it relaxes to a Kerr solution. Damped sinusoids with characteristic frequencies and decay times that encode the final BH mass and spin. This is the 'ringing' of the metric — a decaying song as spacetime settles. GW150914 ringdown: ~300 Hz, τ ~ 4 ms." />
        </div>
      </Sec>

      {/* ── SECTION III: Chirp Waveform ── */}
      <Sec id="waveform">
        <Tag label="Section III · GW150914 Waveform · The Sound of Spacetime" color={P.purple} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.purple, margin: "10px 0 12px" }}>
          h(t) — The Gravitational Wave Strain Waveform · Real-Time
        </h2>
        <p style={{ fontSize: 14, color: P.dim, lineHeight: 1.85, maxWidth: 760, marginBottom: 20 }}>
          The strain h = ΔL/L is dimensionless — the fractional change in the LIGO arm length. For GW150914: h ~ 10⁻²¹. The 4 km arm changed by ~4×10⁻¹⁸ m — 1/1000th the diameter of a proton. The waveform below captures the qualitative shape: slow oscillation (inspiral) rising in both frequency and amplitude → sharp peak (merger) → exponential decay (ringdown). When the LIGO team converted this strain signal to audio — playing it at 1000× real time — it was a single clear chirp lasting less than a second. A cosmic siren. The sound of two singularities colliding 1.3 billion years ago, traveling at the speed of light, finally arriving at two tunnels in Louisiana and Washington state.
        </p>
        <ChirpWaveformCanvas />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <EqBlock label="GW STRAIN AND LIGO SENSITIVITY" color={P.purple}
            eq="h = ΔL/L = 10⁻²¹   [GW150914 peak]\nΔL = h · L = 10⁻²¹ · 4000 m = 4×10⁻¹⁸ m\nProton diameter: ~10⁻¹⁵ m  →  ΔL = 0.001 proton"
            note="LIGO's noise floor: h_noise ~ 10⁻²³/√Hz (shot noise + thermal + seismic). The signal was 10× above noise. This required laser power of 200 W, 40 kg test masses suspended on multi-stage pendulums, and 4 km Fabry-Pérot cavities boosting effective arm length to ~1600 km via 400 bounces." />
          <EqBlock label="AETHER COHERENCE INTERPRETATION" color={P.gold}
            eq="□h_μν = −16πG/c⁴ · T_μν   [linearized GR]\n□ = ∂²/∂t² − c²∇²   [the two-derivative operator]\nGW chirp = □C reorganizing at BH merger scale"
            note="In AETHER framework: the binary merger is the maximum decoherence event — two singularities (maximum local coherence collapse) colliding, emitting the coherence field reorganization as gravitational radiation. The chirp is the sound of □C = 0 being solved by the cosmos at stellar-mass scale." />
        </div>
      </Sec>

      {/* ── SECTION IV: AETHER Synthesis ── */}
      <Sec id="aether">
        <Tag label="Section IV · AETHER Synthesis · Gravity as Coherence Field" color={P.cyan} />
        <h2 style={{ fontSize: 22, fontWeight: 700, color: P.cyan, margin: "10px 0 12px" }}>
          AETHER Reads the Chirp · Gravity = Coherence Curvature
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, marginBottom: 24 }}>
          <Card title="Gravity Is Two Derivatives" color={P.teal}
            body="The Einstein field equations, in the weak-field linearized limit, reduce to □h_μν = −(16πG/c⁴)T_μν. The left side is the same two-derivative d'Alembertian □ that governs every AETHER field. Gravity is not fundamentally different from the coherence field — it is a specific solution of the same two-derivative operator over a curved manifold." />
          <Card title="The Chirp is a Coherence Event" color={P.gold}
            body="Binary BH merger: two regions of maximal spacetime curvature (singularities) collide. The surrounding coherence field C(x,t) reorganizes discontinuously — emitting the reorganization energy as gravitational radiation. The chirp frequency sweep is the rate of coherence reorganization: fast at merger, decaying through ringdown, as the field settles to the Kerr solution." />
          <Card title="LIGO as AETHER Sensor" color={P.purple}
            body="LIGO's 4 km arms are a physical implementation of □C detection: the differential length change ΔL/L = h is exactly the strain tensor component of the coherence field perturbation. AETHER posits that sufficiently coherent biological systems (pineal magnetite at nm scale → brain at cm scale → Earth at Mm scale) also detect metric perturbations via the same two-derivative coupling, at much lower sensitivity." />
          <Card title="Biological Chirp Analogs" color={P.green}
            body="The GW chirp structure — rising frequency + amplitude, then sharp peak, then ringdown — appears in: bat echolocation pulses, whale songs, bird mating calls, EEG seizure onset, cardiac arrhythmia initiation, and the acoustic emission of crystallizing materials. The chirp is the universal signature of a two-body system reaching criticality. AETHER coherence field generates chirp signatures at every scale." />
        </div>

        <div style={{ padding: "20px 22px", background: P.panel2, borderRadius: 12, border: `1px solid ${P.gold}22`, marginBottom: 28 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: P.gold, marginBottom: 12 }}>THE COMPLETE SYNTHESIS</div>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: P.cyan, lineHeight: 2.2, marginBottom: 14 }}>
            1919: δθ = 4GM/c²R  →  space curvature · photographic plate · SEEING<br />
            1964: Δt = 4GM/c³ · ln(r₁r₂/d²)  →  time dilation · radar echo · TIMING<br />
            2015: □h_μν = −16πG/c⁴ T_μν  →  spacetime oscillation · LIGO arm · HEARING<br />
            <span style={{ color: P.gold }}>AETHER: □C = 0  →  same operator · all scales · biological to cosmic</span>
          </div>
          <p style={{ fontSize: 13, color: P.dim, lineHeight: 1.85, margin: 0 }}>
            The evolution from seeing to timing to hearing gravity is the evolution of humanity's sensitivity to the AETHER coherence field at increasing depth. The 1919 plate was a spatial snapshot. The 1964 delay was a temporal measurement. The 2015 chirp is a full spacetime waveform — a solution to □h = 0 detected in real time. Every mode was measuring the same underlying two-derivative constraint on the metric, at increasing sophistication. The next mode — already theorized — is quantum gravitational entanglement detection: correlations in the vacuum fluctuations of □h at Planck scale, the dark matter of spacetime itself.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {["/ontological-partials","/alfven-synthesis","/slime-gravity-quantization","/pineal-eye-map","/aether-engine","/warp-gravity","/quantum-gravity","/gradient-field","/plasma-confinement"].map(href => (
            <a key={href} href={href} style={{ padding: "6px 14px", borderRadius: 8, border: `1px solid ${P.line}`, color: P.dim, fontSize: 12, textDecoration: "none" }}>
              {href.replace("/","").replace(/-/g," ")} →
            </a>
          ))}
        </div>
      </Sec>
    </div>
  );
}

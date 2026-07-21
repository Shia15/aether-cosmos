/*═══════════════════════════════════════════════════════════════
  INVERSION FIELD · NEGATIVE GLOW — Fullscreen Browser Screensaver
  Each blob carries its own negative.
  Core: fades from base color → inverse (c′ = 255 − c) with Invert mix.
  Halo: always glows in the complementary hue (H + 180°).
  At full inversion the field reads as a photographic negative, lit from inside.
  Controls auto-hide after 3 s of inactivity. Click anywhere to toggle them.
═══════════════════════════════════════════════════════════════*/
import { useRef, useEffect, useState, useCallback } from "react";
import { Link } from "wouter";

// ─── helpers ────────────────────────────────────────────────
function clampHue(h: number) { return ((h % 360) + 360) % 360; }

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const hh = clampHue(h) / 360, ss = s / 100, ll = l / 100;
  const k = (n: number) => (n + hh * 12) % 12;
  const a = ss * Math.min(ll, 1 - ll);
  const f = (n: number) => ll - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;
}

// ─── tiny slider ────────────────────────────────────────────
function Slider({ label, value, min, max, step, onChange, col }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; col: string;
}) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 10, letterSpacing: "0.12em", color: col, fontFamily: "monospace" }}>{label}</span>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
          {step < 1 ? value.toFixed(2) : Math.round(value)}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: "100%", accentColor: col, cursor: "pointer" }} />
    </div>
  );
}

// ─── main ───────────────────────────────────────────────────
export default function InversionScreensaver() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // sliders — each has a ref for the rAF loop and a state for the UI
  const [speed,  setSpeed]  = useState(0.55);
  const [blobs,  setBlobs]  = useState(8);
  const [glow,   setGlow]   = useState(0.72);
  const [autoMix, setAutoMix] = useState(true);
  const [mixLocked, setMixLocked] = useState(0.5);

  const speedR    = useRef(speed);
  const blobsR    = useRef(blobs);
  const glowR     = useRef(glow);
  const autoMixR  = useRef(autoMix);
  const mixLockedR= useRef(mixLocked);

  useEffect(() => { speedR.current   = speed;     }, [speed]);
  useEffect(() => { blobsR.current   = blobs;     }, [blobs]);
  useEffect(() => { glowR.current    = glow;      }, [glow]);
  useEffect(() => { autoMixR.current = autoMix;   }, [autoMix]);
  useEffect(() => { mixLockedR.current = mixLocked;}, [mixLocked]);

  // readout refs
  const hueRef = useRef<HTMLSpanElement>(null);
  const invHueRef = useRef<HTMLSpanElement>(null);
  const mixReadRef = useRef<HTMLSpanElement>(null);

  // controls visibility — hide after 3 s inactivity
  const [controlsVisible, setControlsVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  useEffect(() => {
    showControls();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [showControls]);

  // canvas setup + rAF loop
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const reduced = prefersReducedMotion();
    let t = 0, frame = 0;

    function resize() {
      cv.width  = window.innerWidth  * devicePixelRatio;
      cv.height = window.innerHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      const W  = window.innerWidth;
      const H  = window.innerHeight;
      const sp = speedR.current;
      const n  = Math.max(2, Math.round(blobsR.current));
      const sg = glowR.current;

      // auto-cycle mix or use locked value
      const m = autoMixR.current
        ? 0.5 + 0.5 * Math.sin(t * 0.004)
        : mixLockedR.current;

      const baseHue = clampHue(t * sp * 0.35);

      // trailing smear (screensaver feel — very low alpha fill)
      ctx.fillStyle = "rgba(4,3,8,0.22)";
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "screen";

      for (let i = 0; i < n; i++) {
        // Lissajous-style orbits so blobs trace varied paths
        const ph   = t * 0.009 * (0.55 + sp) + (i * Math.PI * 2) / n;
        const ph2  = t * 0.007 * (0.4  + sp) + (i * Math.PI * 1.3) / n;
        const orbitX = W * (0.28 + 0.08 * Math.sin(t * 0.0013 * (i + 1)));
        const orbitY = H * (0.24 + 0.06 * Math.cos(t * 0.0017 * (i + 1)));
        const x  = W * 0.5 + Math.cos(ph)  * orbitX;
        const y  = H * 0.5 + Math.sin(ph2) * orbitY;

        const coreHue = clampHue(baseHue + (i * 360) / n);
        const invHue  = clampHue(coreHue + 180);

        const cCore = hslToRgb(coreHue, 92, 56);
        const cInv  = hslToRgb(invHue,  92, 56);

        // core color lerped toward its own inverse as mix rises
        const rr = Math.round(cCore[0] + (cInv[0] - cCore[0]) * m);
        const gg = Math.round(cCore[1] + (cInv[1] - cCore[1]) * m);
        const bb = Math.round(cCore[2] + (cInv[2] - cCore[2]) * m);

        // radius scales with window + glow slider
        const baseR  = Math.min(W, H) * (0.10 + sg * 0.14);
        const breath = 1 + 0.08 * Math.sin(t * 0.018 + i * 1.1);
        const radius = baseR * breath;

        // outer halo — always the complementary hue
        const haloR = radius * 2.1;
        const halo  = ctx.createRadialGradient(x, y, 0, x, y, haloR);
        const ha    = 0.12 + sg * 0.22;
        halo.addColorStop(0,   `rgba(${cInv[0]},${cInv[1]},${cInv[2]},${ha})`);
        halo.addColorStop(0.5, `rgba(${cInv[0]},${cInv[1]},${cInv[2]},${ha * 0.4})`);
        halo.addColorStop(1,   `rgba(${cInv[0]},${cInv[1]},${cInv[2]},0)`);
        ctx.fillStyle = halo;
        ctx.beginPath(); ctx.arc(x, y, haloR, 0, Math.PI * 2); ctx.fill();

        // mid glow ring — extra depth
        const midR  = radius * 1.35;
        const mid   = ctx.createRadialGradient(x, y, radius * 0.55, x, y, midR);
        mid.addColorStop(0, `rgba(${rr},${gg},${bb},${0.45 + m * 0.3})`);
        mid.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
        ctx.fillStyle = mid;
        ctx.beginPath(); ctx.arc(x, y, midR, 0, Math.PI * 2); ctx.fill();

        // bright core
        const core = ctx.createRadialGradient(x, y, 0, x, y, radius);
        core.addColorStop(0,   `rgba(${rr},${gg},${bb},0.97)`);
        core.addColorStop(0.4, `rgba(${rr},${gg},${bb},0.75)`);
        core.addColorStop(1,   `rgba(${rr},${gg},${bb},0)`);
        ctx.fillStyle = core;
        ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";

      // update readouts every 6 frames
      if (frame % 6 === 0) {
        if (hueRef.current)    hueRef.current.textContent    = `${Math.round(baseHue)}°`;
        if (invHueRef.current) invHueRef.current.textContent = `${Math.round(clampHue(baseHue + 180))}°`;
        if (mixReadRef.current) mixReadRef.current.textContent = `${Math.round(m * 100)}%`;
      }

      if (!reduced) t++;
      frame++;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 28,
    right: 28,
    width: 220,
    background: "rgba(6,4,12,0.82)",
    border: "1px solid rgba(180,120,255,0.18)",
    borderRadius: 14,
    padding: "16px 18px",
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    transition: "opacity 0.7s ease",
    opacity: controlsVisible ? 1 : 0,
    pointerEvents: controlsVisible ? "auto" : "none",
    zIndex: 10,
  };

  const titleStyle: React.CSSProperties = {
    position: "fixed",
    top: 22,
    left: 28,
    fontFamily: "'Space Mono', monospace",
    fontSize: 11,
    letterSpacing: "0.22em",
    color: "rgba(200,160,255,0.55)",
    textTransform: "uppercase",
    transition: "opacity 0.7s ease",
    opacity: controlsVisible ? 1 : 0,
    pointerEvents: "none",
    zIndex: 10,
  };

  const backStyle: React.CSSProperties = {
    position: "fixed",
    top: 22,
    right: 28,
    fontFamily: "'Space Mono', monospace",
    fontSize: 10,
    letterSpacing: "0.14em",
    color: "rgba(200,160,255,0.5)",
    textDecoration: "none",
    transition: "opacity 0.7s ease",
    opacity: controlsVisible ? 1 : 0,
    pointerEvents: controlsVisible ? "auto" : "none",
    zIndex: 10,
    background: "rgba(6,4,12,0.6)",
    border: "1px solid rgba(180,120,255,0.14)",
    borderRadius: 8,
    padding: "5px 12px",
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "#040308", cursor: "none", overflow: "hidden" }}
      onMouseMove={showControls}
      onTouchStart={showControls}
      onClick={showControls}
    >
      <canvas
        ref={cvRef}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}
      />

      {/* Title watermark */}
      <div style={titleStyle}>
        Inversion Field · Negative Glow
      </div>

      {/* Back link */}
      <Link href="/chromatic-glare" style={backStyle}>← chromatic glare</Link>

      {/* Controls panel */}
      <div style={panelStyle}>
        <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "rgba(200,160,255,0.7)", marginBottom: 14, fontFamily: "monospace" }}>
          INVERSION FIELD
        </div>

        <Slider label="Hue Drift" value={speed} min={0.05} max={2.5} step={0.05} onChange={setSpeed} col="#c084fc" />
        <Slider label="Glow Radius" value={glow} min={0.1} max={1.0} step={0.02} onChange={setGlow} col="#fb923c" />
        <Slider label="Blobs" value={blobs} min={2} max={18} step={1} onChange={setBlobs} col="#4ade80" />

        {/* Auto-mix toggle */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
            <span style={{ fontSize: 10, letterSpacing: "0.12em", color: "#f472b6", fontFamily: "monospace" }}>Invert Mix</span>
            <button
              onClick={() => setAutoMix(v => !v)}
              style={{
                fontSize: 9, fontFamily: "monospace", letterSpacing: "0.1em",
                padding: "2px 8px", borderRadius: 8, cursor: "pointer", border: "none",
                background: autoMix ? "rgba(244,114,182,0.25)" : "rgba(255,255,255,0.08)",
                color: autoMix ? "#f472b6" : "rgba(255,255,255,0.4)",
              }}
            >
              {autoMix ? "AUTO" : "LOCK"}
            </button>
          </div>
          {autoMix ? (
            <div style={{ fontSize: 10, color: "rgba(244,114,182,0.5)", fontFamily: "monospace", height: 18 }}>
              breathing 0 → 1 → 0
            </div>
          ) : (
            <input type="range" min={0} max={1} step={0.01} value={mixLocked}
              onChange={e => setMixLocked(parseFloat(e.target.value))}
              style={{ width: "100%", accentColor: "#f472b6", cursor: "pointer" }} />
          )}
        </div>

        {/* Readouts */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 4 }}>
          {[
            { label: "BASE", ref: hueRef, col: "#c084fc" },
            { label: "INV", ref: invHueRef, col: "#facc15" },
            { label: "MIX", ref: mixReadRef, col: "#f472b6" },
          ].map(r => (
            <div key={r.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "4px 0" }}>
              <div style={{ fontSize: 8, color: r.col + "99", fontFamily: "monospace", letterSpacing: "0.1em" }}>{r.label}</div>
              <span ref={r.ref} style={{ fontSize: 11, color: r.col, fontFamily: "monospace", fontWeight: 700 }}>—</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 12, fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", lineHeight: 1.5 }}>
          move mouse to show controls
        </div>
      </div>
    </div>
  );
}

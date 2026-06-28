import { useState, useEffect, useRef } from "react";
import heroImg from "@assets/grok-image-22553fb7-eff9-4b6a-aa65-8dafaa254f15_1782665615041.png";

const C = {
  bg:     "#04060E",
  panel:  "rgba(8,12,24,0.85)",
  border: "rgba(0,229,192,0.12)",
  aurora: "#00FFB2",
  gold:   "#C8A030",
  violet: "#9966ff",
  rose:   "#ff4488",
  cyan:   "#00FFEE",
  blue:   "#4488ff",
  yellow: "#ffd24a",
  green:  "#44ff88",
  red:    "#ff5544",
  dim:    "#2a4060",
  text:   "rgba(200,230,255,0.78)",
};

type Blip = { ang: number; r: number; col: string; size: number };

// ─── Color radar sweep ────────────────────────────────────────────────────────

function RadarCanvas({ altitude }: { altitude: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const blips = useRef<Blip[]>([]);
  const altRef = useRef(altitude); useEffect(() => { altRef.current = altitude; }, [altitude]);

  useEffect(() => {
    const cols = [C.red, C.green, C.yellow, C.cyan, C.rose];
    blips.current = Array.from({ length: 7 }, () => ({
      ang: Math.random() * Math.PI * 2,
      r: 0.25 + Math.random() * 0.7,
      col: cols[Math.floor(Math.random() * cols.length)],
      size: 3 + Math.random() * 4,
    }));
  }, []);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const SZ = 380;
    canvas.width = SZ; canvas.height = SZ;
    const cx = SZ / 2, cy = SZ / 2, R = SZ / 2 - 10;
    let sweep = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.18)";
      ctx.fillRect(0, 0, SZ, SZ);

      // rings
      ctx.strokeStyle = "rgba(0,255,238,0.12)"; ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, (R * i) / 4, 0, Math.PI * 2); ctx.stroke();
      }
      // cross-hairs
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
      ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();

      // sweep wedge
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, R, sweep - 0.5, sweep);
      ctx.closePath();
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, "rgba(0,255,178,0.25)");
      g.addColorStop(1, "rgba(0,255,178,0)");
      ctx.fillStyle = g; ctx.fill();
      ctx.restore();
      // sweep line
      ctx.beginPath(); ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(sweep) * R, cy + Math.sin(sweep) * R);
      ctx.strokeStyle = C.aurora; ctx.lineWidth = 1.5;
      ctx.shadowBlur = 10; ctx.shadowColor = C.aurora; ctx.stroke(); ctx.shadowBlur = 0;

      // blips -- brightness pulses as sweep passes
      blips.current.forEach(b => {
        const bx = cx + Math.cos(b.ang) * b.r * R;
        const by = cy + Math.sin(b.ang) * b.r * R;
        let diff = ((sweep - b.ang) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        const glow = Math.max(0, 1 - diff / 0.9);
        const a = 0.25 + glow * 0.75;
        ctx.beginPath(); ctx.arc(bx, by, b.size, 0, Math.PI * 2);
        ctx.fillStyle = b.col + Math.round(a * 255).toString(16).padStart(2, "0");
        if (glow > 0.1) { ctx.shadowBlur = 12 * glow; ctx.shadowColor = b.col; }
        ctx.fill(); ctx.shadowBlur = 0;
      });

      // altitude readout center
      ctx.font = "8px 'DM Mono',monospace"; ctx.textAlign = "center";
      ctx.fillStyle = C.dim;
      ctx.fillText("ALT " + Math.round(altRef.current) + "m", cx, cy - 6);

      sweep = (sweep + 0.03) % (Math.PI * 2);
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Sensory overlay waveform ─────────────────────────────────────────────────

function SensoryWave({ sensitivity }: { sensitivity: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const sRef = useRef(sensitivity); useEffect(() => { sRef.current = sensitivity; }, [sensitivity]);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 900, H = 120;
    canvas.width = W; canvas.height = H;
    let t = 0;
    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.32)";
      ctx.fillRect(0, 0, W, H);
      const amp = 10 + sRef.current * 38;
      // smooth baseline (environment)
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const y = H / 2 + Math.sin(x * 0.01 + t * 0.03) * amp * 0.55;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = C.blue + "AA"; ctx.lineWidth = 1.4;
      ctx.shadowBlur = 6; ctx.shadowColor = C.blue; ctx.stroke(); ctx.shadowBlur = 0;
      // jagged perception signal
      ctx.beginPath();
      for (let x = 0; x <= W; x += 3) {
        const noise = (Math.sin(x * 0.13 + t * 0.1) + Math.sin(x * 0.31 - t * 0.07)) * 0.5;
        const y = H / 2 + (Math.sin(x * 0.02 + t * 0.05) * 0.5 + noise) * amp;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = C.gold + "CC"; ctx.lineWidth = 1.2;
      ctx.shadowBlur = 6; ctx.shadowColor = C.gold; ctx.stroke(); ctx.shadowBlur = 0;
      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Gauge ────────────────────────────────────────────────────────────────────

function Gauge({ label, value, unit, pct, col }: { label: string; value: string; unit: string; pct: number; col: string }) {
  const r = 34, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={44} cy={44} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5} />
        <circle cx={44} cy={44} r={r} fill="none" stroke={col} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
          transform="rotate(-90 44 44)" style={{ transition: "stroke-dashoffset 0.4s", filter: `drop-shadow(0 0 4px ${col})` }} />
        <text x={44} y={42} textAnchor="middle" fontSize={15} fill={col} fontFamily="'DM Mono',monospace">{value}</text>
        <text x={44} y={56} textAnchor="middle" fontSize={7} fill={C.dim} fontFamily="'DM Mono',monospace">{unit}</text>
      </svg>
      <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.12em", textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HyperPerceptionPage() {
  const [altitude, setAltitude] = useState(1200);
  const [sensitivity, setSensitivity] = useState(0.6);

  // barometric pressure from altitude (barometric formula approx)
  const pressure = 1013.25 * Math.pow(1 - (altitude * 0.0000225577), 5.25588);
  const o2 = 100 * Math.pow(pressure / 1013.25, 1);

  const panel = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12 };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Mono',monospace" }}>
      <div style={{ padding: "2rem 2.5rem 1.2rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · ENVIRONMENTAL ANALYSIS MATRIX
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, letterSpacing: "0.1em", fontFamily: "'Orbitron','Cinzel',sans-serif",
          background: `linear-gradient(135deg, ${C.cyan}, ${C.yellow}, ${C.aurora})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          HYPER PERCEPTION
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(200,230,255,0.35)", lineHeight: 1.6, maxWidth: 660 }}>
          Air pressure vs. location dynamics -- how altitude, barometry, and geolocation reshape the sensory perception core in real time.
        </p>
      </div>

      <div style={{ padding: "1.5rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "1.4rem" }}>
          <div style={{ ...panel, overflow: "hidden", display: "flex", justifyContent: "center", padding: 12 }}>
            <RadarCanvas altitude={altitude} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ ...panel, padding: "1.2rem 1.3rem" }}>
              <div style={{ fontSize: 9, color: C.cyan, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 16 }}>
                Perception Core &middot; Live Readout
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", flexWrap: "wrap", gap: 10 }}>
                <Gauge label="Air Pressure" value={pressure.toFixed(0)} unit="hPa" pct={pressure / 1013.25} col={C.blue} />
                <Gauge label="Altitude" value={(altitude / 1000).toFixed(1)} unit="km" pct={Math.min(1, altitude / 9000)} col={C.yellow} />
                <Gauge label="O₂ Partial" value={o2.toFixed(0)} unit="%" pct={o2 / 100} col={C.aurora} />
                <Gauge label="Sensitivity" value={(sensitivity * 100).toFixed(0)} unit="gain" pct={sensitivity} col={C.rose} />
              </div>
            </div>

            <div style={{ ...panel, padding: "1.2rem 1.3rem" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 6 }}>
                  <span style={{ color: C.dim }}>ALTITUDE</span>
                  <span style={{ color: C.yellow }}>{altitude} m</span>
                </div>
                <input type="range" min={0} max={9000} step={50} value={altitude}
                  onChange={e => setAltitude(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.yellow }} />
                <div style={{ fontSize: 7.5, color: "rgba(200,230,255,0.28)", marginTop: 4 }}>
                  Sea level 0m &middot; Denver 1600m &middot; Everest base 5300m &middot; cruising 9000m
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 6 }}>
                  <span style={{ color: C.dim }}>SENSORY GAIN</span>
                  <span style={{ color: C.rose }}>{(sensitivity * 100).toFixed(0)}%</span>
                </div>
                <input type="range" min={0} max={1} step={0.01} value={sensitivity}
                  onChange={e => setSensitivity(Number(e.target.value))}
                  style={{ width: "100%", accentColor: C.rose }} />
                <div style={{ fontSize: 7.5, color: "rgba(200,230,255,0.28)", marginTop: 4 }}>
                  How sharply the perception core amplifies environmental signal over baseline.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* sensory overlay */}
        <div style={{ ...panel, overflow: "hidden", padding: "1rem 1.2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
            <div style={{ fontSize: 9, color: C.gold, letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Sensory Overlay &middot; Perception Sensitivity
            </div>
            <div style={{ fontSize: 8, color: C.dim }}>
              <span style={{ color: C.blue }}>━</span> environment &nbsp; <span style={{ color: C.gold }}>━</span> perceived signal
            </div>
          </div>
          <SensoryWave sensitivity={sensitivity} />
        </div>

        {/* hero + cards */}
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: "1.4rem" }}>
          <div style={{ ...panel, overflow: "hidden" }}>
            <img src={heroImg} alt="HYPER PERCEPTION environmental analysis matrix" style={{ width: "100%", display: "block" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            {[
              { col: C.blue,   k: "Baro-Reception", t: "The inner ear and even joints register barometric shifts. Rapid pressure drops before storms can trigger migraines and joint pain -- the body is a living barometer." },
              { col: C.yellow, k: "Altitude Hypoxia", t: "As altitude rises, partial oxygen pressure falls. Above ~2500m perception sharpens then degrades -- the brain prioritizes salient signals as resources thin." },
              { col: C.green,  k: "Geolocation Mapping", t: "Place cells anchor perception to space. The color radar models how the perception core scans the environment, tagging detected features by salience and threat." },
              { col: C.rose,   k: "Adaptive Gain", t: "Sensory systems auto-calibrate gain to context -- dilating in darkness, compressing in glare. Hyper-perception is gain pushed toward its sensitive limit without saturating." },
            ].map(c => (
              <div key={c.k} style={{ ...panel, padding: "0.9rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5 }}>{c.k}</div>
                <p style={{ fontSize: 9, color: "rgba(200,230,255,0.4)", lineHeight: 1.6, margin: 0 }}>{c.t}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

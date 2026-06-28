import { useState, useEffect, useRef } from "react";
import heroImg from "@assets/9d078267-ea6b-486a-a12a-7fed38d9897b_1782665554450.jpg";

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
  dim:    "#2a4060",
  text:   "rgba(200,230,255,0.78)",
};

type V3 = [number, number, number];
type Quat = { w: number; x: number; y: number; z: number };

// cube vertices + edges
const CUBE_V: V3[] = [
  [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
  [-1, -1, 1],  [1, -1, 1],  [1, 1, 1],  [-1, 1, 1],
];
const CUBE_E: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

function normQuat(q: Quat): Quat {
  const m = Math.sqrt(q.w * q.w + q.x * q.x + q.y * q.y + q.z * q.z) || 1;
  return { w: q.w / m, x: q.x / m, y: q.y / m, z: q.z / m };
}

function rotateByQuat(p: V3, q: Quat): V3 {
  // v' = q * v * q^-1  (q is unit)
  const { w, x, y, z } = q;
  const [px, py, pz] = p;
  // t = 2 * cross(q.xyz, p)
  const tx = 2 * (y * pz - z * py);
  const ty = 2 * (z * px - x * pz);
  const tz = 2 * (x * py - y * px);
  return [
    px + w * tx + (y * tz - z * ty),
    py + w * ty + (z * tx - x * tz),
    pz + w * tz + (x * ty - y * tx),
  ];
}

function quatFromAxisAngle(axis: V3, angle: number): Quat {
  const m = Math.sqrt(axis[0] ** 2 + axis[1] ** 2 + axis[2] ** 2) || 1;
  const s = Math.sin(angle / 2);
  return normQuat({ w: Math.cos(angle / 2), x: (axis[0] / m) * s, y: (axis[1] / m) * s, z: (axis[2] / m) * s });
}

// ─── 3D Quaternion Canvas ─────────────────────────────────────────────────────

function QuatCanvas({ quat, autoSpin }: { quat: Quat; autoSpin: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const qRef = useRef(quat); useEffect(() => { qRef.current = quat; }, [quat]);
  const spinRef = useRef(autoSpin); useEffect(() => { spinRef.current = autoSpin; }, [autoSpin]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 560, H = 480;
    canvas.width = W; canvas.height = H;
    let t = 0;
    const cx = W / 2, cy = H / 2;
    const scale = 110;
    const FOV = 4;

    const project = (p: V3): [number, number, number] => {
      const z = p[2] + FOV;
      const f = FOV / z;
      return [cx + p[0] * scale * f, cy - p[1] * scale * f, z];
    };

    const draw = () => {
      ctx.fillStyle = "rgba(4,6,14,0.28)";
      ctx.fillRect(0, 0, W, H);

      let q = qRef.current;
      if (spinRef.current) {
        const spin = quatFromAxisAngle([0.3, 1, 0.2], t * 0.012);
        // compose spin * q
        const a = spin, b = q;
        q = normQuat({
          w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
          x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
          y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
          z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
        });
      }

      const rv = CUBE_V.map(v => rotateByQuat(v, q));
      const pv = rv.map(project);

      // faces glow (subtle fill via convex-ish averaging skipped, draw edges)
      // axes i, j, k
      const axes: { v: V3; col: string; lbl: string }[] = [
        { v: [1.7, 0, 0], col: C.rose,   lbl: "i (x)" },
        { v: [0, 1.7, 0], col: C.aurora, lbl: "j (y)" },
        { v: [0, 0, 1.7], col: C.cyan,   lbl: "k (z)" },
      ];
      axes.forEach(ax => {
        const o = project([0, 0, 0]);
        const e = project(rotateByQuat(ax.v, q));
        ctx.beginPath();
        ctx.moveTo(o[0], o[1]); ctx.lineTo(e[0], e[1]);
        ctx.strokeStyle = ax.col; ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8; ctx.shadowColor = ax.col;
        ctx.stroke(); ctx.shadowBlur = 0;
        ctx.fillStyle = ax.col; ctx.font = "10px 'DM Mono',monospace";
        ctx.fillText(ax.lbl, e[0] + 4, e[1]);
      });

      // edges (depth-sorted color)
      CUBE_E.forEach(([a, b]) => {
        const za = pv[a][2], zb = pv[b][2];
        const depth = clamp01(1 - (za + zb) / 2 / 6);
        ctx.beginPath();
        ctx.moveTo(pv[a][0], pv[a][1]);
        ctx.lineTo(pv[b][0], pv[b][1]);
        ctx.strokeStyle = `rgba(153,102,255,${0.3 + depth * 0.6})`;
        ctx.lineWidth = 1 + depth * 1.2;
        ctx.stroke();
      });

      // vertices
      rv.forEach((v, i) => {
        const p = pv[i];
        const depth = clamp01(1 - p[2] / 6);
        const r = 2 + depth * 4;
        const gr = ctx.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 2);
        gr.addColorStop(0, C.gold + "DD");
        gr.addColorStop(1, C.gold + "00");
        ctx.beginPath(); ctx.arc(p[0], p[1], r * 2, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill();
        ctx.beginPath(); ctx.arc(p[0], p[1], r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = C.gold; ctx.fill();
      });

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuaternionBurstPage() {
  const [ax, setAx] = useState(0.3);
  const [ay, setAy] = useState(1);
  const [az, setAz] = useState(0.2);
  const [angle, setAngle] = useState(0.8);
  const [autoSpin, setAutoSpin] = useState(true);

  const quat = quatFromAxisAngle([ax, ay, az], angle);

  const panel = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12 };
  const slider = (label: string, val: number, set: (v: number) => void, col: string, min: number, max: number) => (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 5 }}>
        <span style={{ color: C.dim }}>{label}</span>
        <span style={{ color: col }}>{val.toFixed(2)}</span>
      </div>
      <input type="range" min={min} max={max} step={0.01} value={val}
        onChange={e => set(Number(e.target.value))}
        style={{ width: "100%", accentColor: col }} />
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Mono',monospace" }}>
      <div style={{ padding: "2rem 2.5rem 1.2rem", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 8, letterSpacing: "0.4em", color: C.dim, textTransform: "uppercase", marginBottom: 6 }}>
          AETHER · HYPERCOMPLEX ROTATION
        </div>
        <h1 style={{
          margin: 0, fontSize: 32, letterSpacing: "0.06em", fontFamily: "'Cinzel','Orbitron',sans-serif",
          background: `linear-gradient(135deg, ${C.rose}, ${C.violet}, ${C.cyan})`,
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Quaternion &middot; Burst
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 11, color: "rgba(200,230,255,0.35)", lineHeight: 1.6, maxWidth: 640 }}>
          The 4D hypercomplex number system that rotates without gimbal lock -- q = w + xi + yj + zk, the four-dimensional key to singularity-free orientation.
        </p>
      </div>

      <div style={{ padding: "1.5rem 2.5rem", display: "flex", flexDirection: "column", gap: "1.4rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.4rem" }}>
          <div style={{ ...panel, overflow: "hidden", display: "flex", justifyContent: "center", padding: 12 }}>
            <QuatCanvas quat={quat} autoSpin={autoSpin} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ ...panel, padding: "1.1rem 1.2rem" }}>
              <div style={{ fontSize: 9, color: C.violet, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12 }}>
                Quaternion State
              </div>
              <div style={{
                fontSize: 17, fontFamily: "'Crimson Pro',serif", fontStyle: "italic",
                textAlign: "center", marginBottom: 12, color: C.text,
              }}>
                q = w + x<span style={{ color: C.rose }}>i</span> + y<span style={{ color: C.aurora }}>j</span> + z<span style={{ color: C.cyan }}>k</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[
                  { l: "w", v: quat.w, c: C.gold },
                  { l: "x", v: quat.x, c: C.rose },
                  { l: "y", v: quat.y, c: C.aurora },
                  { l: "z", v: quat.z, c: C.cyan },
                ].map(q => (
                  <div key={q.l} style={{ border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 8px", textAlign: "center" }}>
                    <div style={{ fontSize: 8, color: C.dim }}>{q.l}</div>
                    <div style={{ fontSize: 13, color: q.c, fontFamily: "'DM Mono',monospace" }}>{q.v >= 0 ? "+" : ""}{q.v.toFixed(3)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ ...panel, padding: "1.1rem 1.2rem" }}>
              <div style={{ fontSize: 9, color: C.aurora, letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 14 }}>
                Axis &middot; Angle
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {slider("axis x", ax, setAx, C.rose, -1, 1)}
                {slider("axis y", ay, setAy, C.aurora, -1, 1)}
                {slider("axis z", az, setAz, C.cyan, -1, 1)}
                {slider("angle (rad)", angle, setAngle, C.gold, 0, 6.28)}
              </div>
              <button onClick={() => setAutoSpin(s => !s)} style={{
                width: "100%", marginTop: 14, padding: "0.6rem", borderRadius: 8,
                border: `1px solid ${autoSpin ? C.violet : C.dim}66`,
                background: autoSpin ? `${C.violet}18` : "transparent",
                color: autoSpin ? C.violet : C.dim,
                fontFamily: "'DM Mono',monospace", fontSize: 9.5, letterSpacing: "0.15em",
                textTransform: "uppercase", cursor: "pointer",
              }}>
                {autoSpin ? "Burst Spin: ON" : "Burst Spin: OFF"}
              </button>
            </div>
          </div>
        </div>

        {/* Concept cards + hero */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.4rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.8rem" }}>
            {[
              { col: C.rose,   k: "Beyond Euler Angles", t: "Traditional 3D Euler angles (roll, pitch, yaw) suffer gimbal lock -- when two rotation axes align, a degree of freedom collapses. Quaternions live in 4D and never lose a dimension." },
              { col: C.aurora, k: "The Hamilton Product", t: "Quaternion multiplication is non-commutative: ij = k, ji = -k. This single rule encodes all 3D rotation. Composing two rotations is one multiplication -- fast and numerically stable." },
              { col: C.cyan,   k: "Unit Sphere S3", t: "Every rotation maps to a unit quaternion on the 3-sphere. Interpolating along this sphere (slerp) yields perfectly smooth orientation blends -- the backbone of animation and spacecraft attitude control." },
              { col: C.violet, k: "Double Cover", t: "q and -q represent the same rotation -- the quaternion group double-covers SO(3). This topological subtlety is exactly why rotations are singularity-free in 4D where they cannot be in 3D." },
            ].map(c => (
              <div key={c.k} style={{ ...panel, padding: "0.9rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.13em", textTransform: "uppercase", marginBottom: 5 }}>{c.k}</div>
                <p style={{ fontSize: 9, color: "rgba(200,230,255,0.4)", lineHeight: 1.6, margin: 0 }}>{c.t}</p>
              </div>
            ))}
          </div>
          <div style={{ ...panel, overflow: "hidden" }}>
            <img src={heroImg} alt="Quaternion 4D rotation diagram" style={{ width: "100%", display: "block" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

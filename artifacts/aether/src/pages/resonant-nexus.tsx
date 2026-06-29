import { useState, useEffect, useRef, Fragment } from "react";

const C = {
  bg:       "#030814",
  panel:    "rgba(6,14,32,0.92)",
  border:   "rgba(0,180,255,0.12)",
  mnesis:   "#4488FF",
  infernia: "#CC44FF",
  aletheia: "#44FFCC",
  reverie:  "#FF8844",
  egg:      "#FFD4A0",
  core:     "#88CCFF",
  gold:     "#C8A030",
  dim:      "rgba(120,160,220,0.4)",
  text:     "rgba(180,210,255,0.85)",
};

function useLive(base: number, spread = 4, interval = 2200) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setV(x => Math.min(99, Math.max(55, x + (Math.random() - 0.5) * spread)));
    }, interval);
    return () => clearInterval(id);
  }, []);
  return Math.round(v);
}

function useSparks(n = 12): number[] {
  const [vals, setVals] = useState(() => Array.from({ length: n }, () => Math.random() * 60 + 30));
  useEffect(() => {
    const id = setInterval(() => {
      setVals(v => [...v.slice(1), Math.random() * 60 + 30]);
    }, 800);
    return () => clearInterval(id);
  }, []);
  return vals;
}

function Spark({ vals, color }: { vals: number[]; color: string }) {
  const max = Math.max(...vals, 1);
  const W = 80, H = 28;
  const pts = vals.map((v, i) => `${(i / (vals.length - 1)) * W},${H - (v / max) * H}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} style={{ display: "block" }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" opacity={0.7} />
    </svg>
  );
}

function ResonanceCoreCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 440, H = 440;
    canvas.width = W; canvas.height = H;
    const cx = W / 2, cy = H / 2;
    const R = 155;
    let t = 0;

    const proj = (x: number, y: number, z: number, rx: number, ry: number): [number, number, number] => {
      const y1 = y * Math.cos(rx) - z * Math.sin(rx);
      const z1 = y * Math.sin(rx) + z * Math.cos(rx);
      const x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
      const z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
      const fov = 900;
      const sc = fov / (fov + z2);
      return [cx + x2 * sc, cy + y1 * sc, z2];
    };

    const PHI_G = (1 + Math.sqrt(5)) / 2;
    const verts: [number, number, number][] = Array.from({ length: 32 }, (_, i) => {
      const phi = Math.acos(1 - 2 * (i + 0.5) / 32);
      const theta = 2 * Math.PI * PHI_G * i;
      return [
        R * Math.sin(phi) * Math.cos(theta),
        R * Math.cos(phi),
        R * Math.sin(phi) * Math.sin(theta),
      ];
    });

    const draw = () => {
      ctx.fillStyle = "rgba(3,8,20,0.22)";
      ctx.fillRect(0, 0, W, H);

      const rx = 0.20 + Math.sin(t * 0.006) * 0.07;
      const ry = t * 0.007;

      // Outer glow aura
      const aura = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R * 1.6);
      aura.addColorStop(0, "rgba(60,120,255,0.06)");
      aura.addColorStop(0.5, "rgba(40,80,200,0.03)");
      aura.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fillStyle = aura; ctx.fill();

      // Latitude circles
      for (let i = 0; i <= 14; i++) {
        const phi = -Math.PI / 2 + (i / 14) * Math.PI;
        const r2 = R * Math.cos(phi);
        const yOff = R * Math.sin(phi);
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= 72; j++) {
          const theta = (j / 72) * Math.PI * 2;
          const [px, py] = proj(r2 * Math.cos(theta), yOff, r2 * Math.sin(theta), rx, ry);
          first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          first = false;
        }
        const eq = 1 - Math.abs(i / 7 - 1);
        ctx.strokeStyle = `rgba(100,180,255,${0.05 + 0.08 * eq})`;
        ctx.lineWidth = i === 7 ? 1 : 0.5;
        ctx.stroke();
      }

      // Longitude lines
      for (let i = 0; i < 20; i++) {
        const theta = (i / 20) * Math.PI * 2;
        ctx.beginPath();
        let first = true;
        for (let j = 0; j <= 60; j++) {
          const phi = -Math.PI / 2 + (j / 60) * Math.PI;
          const [px, py] = proj(
            R * Math.cos(phi) * Math.cos(theta),
            R * Math.sin(phi),
            R * Math.cos(phi) * Math.sin(theta),
            rx, ry
          );
          first ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          first = false;
        }
        ctx.strokeStyle = "rgba(80,150,255,0.06)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Fibonacci vertex nodes
      verts.forEach(([x, y, z]) => {
        const [px, py, pz] = proj(x, y, z, rx, ry);
        if (pz < 80) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + x * 0.08 + y * 0.06);
          const depth = Math.max(0, 1 - (pz + 80) / 200);
          const r = (1.5 + pulse * 2.5) * depth;
          ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(160,210,255,${(0.3 + pulse * 0.6) * depth})`;
          ctx.fill();
          if (pulse > 0.7 && depth > 0.5) {
            const gr = ctx.createRadialGradient(px, py, 0, px, py, r * 5);
            gr.addColorStop(0, `rgba(120,190,255,${0.18 * pulse * depth})`);
            gr.addColorStop(1, "rgba(0,0,0,0)");
            ctx.beginPath(); ctx.arc(px, py, r * 5, 0, Math.PI * 2);
            ctx.fillStyle = gr; ctx.fill();
          }
        }
      });

      // Triangle mesh connections
      for (let i = 0; i < verts.length; i++) {
        for (let j = i + 1; j < verts.length; j++) {
          const [ax, ay, az] = verts[i], [bx, by, bz] = verts[j];
          const dist = Math.sqrt((ax-bx)**2 + (ay-by)**2 + (az-bz)**2);
          if (dist < R * 0.72) {
            const [pax, pay, paz] = proj(ax, ay, az, rx, ry);
            const [pbx, pby] = proj(bx, by, bz, rx, ry);
            if (paz < 60) {
              const pulse = 0.3 + 0.3 * Math.sin(t * 0.04 + dist * 0.05);
              ctx.beginPath(); ctx.moveTo(pax, pay); ctx.lineTo(pbx, pby);
              ctx.strokeStyle = `rgba(100,170,255,${pulse * 0.25})`;
              ctx.lineWidth = 0.6; ctx.stroke();
            }
          }
        }
      }

      // Orbital ring
      ctx.save();
      ctx.translate(cx, cy);
      const ringPulse = 0.12 + 0.04 * Math.sin(t * 0.025);
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.38, R * 0.28, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(80,160,255,${ringPulse})`;
      ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(0, 0, R * 1.52, R * 0.32, 0.05, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(60,120,255,${ringPulse * 0.5})`;
      ctx.lineWidth = 0.6; ctx.stroke();
      ctx.restore();

      // Central core glow
      const coreG = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.55);
      const cp = 0.6 + 0.4 * Math.sin(t * 0.035);
      coreG.addColorStop(0, `rgba(130,200,255,${0.14 * cp})`);
      coreG.addColorStop(0.4, `rgba(80,140,255,${0.06 * cp})`);
      coreG.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = coreG; ctx.fill();

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block" }} />;
}

type NodeDef = {
  id: string; label: string; color: string;
  sub: string; base: number; icon: string;
};

const NODES: NodeDef[] = [
  { id: "mnesis",   label: "Mnesis",   color: C.mnesis,   sub: "Living Memory Substrate",    base: 87, icon: "◈" },
  { id: "infernia", label: "Infernia", color: C.infernia, sub: "Ferrofluidic Computation",   base: 85, icon: "⬡" },
  { id: "aletheia", label: "Aletheia", color: C.aletheia, sub: "Observable Truth Layer",     base: 91, icon: "△" },
  { id: "reverie",  label: "Reverie",  color: C.reverie,  sub: "Sensory & Adaptive Flow",    base: 89, icon: "◉" },
];

function NodePod({ node, side }: { node: NodeDef; side: "left" | "right" }) {
  const sync = useLive(node.base, 3);
  const echo = useLive(node.base - 2, 4);
  const sparks = useSparks(10);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    let f = 0;
    const id = setInterval(() => { setPulse(Math.sin(f * 0.06)); f++; }, 50);
    return () => clearInterval(id);
  }, []);

  const glow = `0 0 ${20 + pulse * 12}px ${node.color}55, 0 0 ${40 + pulse * 20}px ${node.color}22`;
  const borderGlow = `${node.color}${Math.round(30 + pulse * 20).toString(16).padStart(2, "0")}`;

  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${borderGlow}`,
      borderRadius: 16,
      padding: "1.1rem",
      boxShadow: glow,
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      minWidth: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `2px solid ${node.color}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 0 12px ${node.color}66`,
          fontSize: 16, color: node.color,
          background: `${node.color}12`,
        }}>{node.icon}</div>
        <div>
          <div style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: node.color, letterSpacing: "0.12em" }}>
            {node.label}
          </div>
          <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.1em", marginTop: 1 }}>
            {node.sub.toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {[
          { lbl: "Sync",  val: sync },
          { lbl: "Echo",  val: echo },
        ].map(({ lbl, val }) => (
          <div key={lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 8, color: C.dim, letterSpacing: "0.12em" }}>{lbl}</span>
            <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: node.color }}>{val}%</span>
          </div>
        ))}
      </div>

      <div style={{ background: `${node.color}12`, borderRadius: 6, padding: "0.3rem 0.4rem" }}>
        <Spark vals={sparks} color={node.color} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <div style={{
          width: 6, height: 6, borderRadius: "50%",
          background: node.color,
          boxShadow: `0 0 6px ${node.color}`,
          animation: "pulse 2s infinite",
        }} />
        <span style={{ fontSize: 8, color: `${node.color}aa`, letterSpacing: "0.1em" }}>ACTIVE</span>
      </div>
    </div>
  );
}

function StatCell({ label, col, sparks, vals }: { label: string; col: string; sparks: number[]; vals: [number, number] }) {
  return (
    <div style={{
      background: C.panel,
      border: `1px solid ${C.border}`,
      borderRadius: 10,
      padding: "0.65rem 0.8rem",
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.15em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
        <span style={{ fontSize: 16, fontFamily: "'DM Mono',monospace", color: col }}>{vals[0]}%</span>
        <span style={{ fontSize: 11, fontFamily: "'DM Mono',monospace", color: `${col}88` }}>{vals[1]}%</span>
      </div>
      <Spark vals={sparks} color={col} />
    </div>
  );
}

function IncubationBar({ progress }: { progress: number }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, color: C.dim, letterSpacing: "0.12em" }}>
        <span>INCUBATION STATUS: ACTIVE</span>
        <span style={{ color: C.aletheia }}>{Math.round(progress)}%</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${progress}%`,
          background: `linear-gradient(90deg, ${C.mnesis}, ${C.aletheia})`,
          borderRadius: 3,
          transition: "width 1s ease",
          boxShadow: `0 0 8px ${C.aletheia}88`,
        }} />
      </div>
    </div>
  );
}

const PHI = (1 + Math.sqrt(5)) / 2;
const GOLDEN_DEG = (2 * Math.PI) / PHI;

const DOMAINS = [
  { name: "PHYSICAL",      sub: "Structure",  col: "#4488FF", t: "T0 x phi",    id: 1 },
  { name: "OSCILLATORY",   sub: "Weights",    col: "#44FFCC", t: "T0 x phi^2",  id: 2 },
  { name: "INFORMATIONAL", sub: "Pattern",    col: "#7DCC92", t: "T0 x phi^2",  id: 3 },
  { name: "CONSCIOUS",     sub: "Witness",    col: "#CC44FF", t: "T0 x phi^3",  id: 4 },
  { name: "REGENERATIVE",  sub: "Becoming",   col: "#FF8844", t: "T0 x phi^4",  id: 5 },
];

function PhiTimeCanvas({ status }: { status: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const statusRef = useRef(status);
  useEffect(() => { statusRef.current = status; }, [status]);

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const W = 340, H = 240;
    canvas.width = W; canvas.height = H;
    const cx = W / 2, cy = H / 2 + 8;
    const R = 76;
    let t = 0;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#030814";
      ctx.fillRect(0, 0, W, H);

      const grd = ctx.createRadialGradient(cx, cy, R * 0.2, cx, cy, R * 1.8);
      grd.addColorStop(0, "rgba(200,160,48,0.09)");
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.8, 0, Math.PI * 2);
      ctx.fillStyle = grd; ctx.fill();

      // golden spiral
      for (let i = 0; i < 52; i++) {
        const angle = i * GOLDEN_DEG * 0.048 + t * 0.004;
        const r2 = 3 + i * 1.2;
        const sx = cx + r2 * Math.cos(angle), sy = cy + r2 * Math.sin(angle);
        ctx.beginPath(); ctx.arc(sx, sy, 0.85, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,160,48,${0.35 - i * 0.006})`;
        ctx.fill();
      }

      const domAngles = DOMAINS.map((_, i) => -Math.PI / 2 + i * (2 * Math.PI / 5) + t * 0.004);
      const pts = domAngles.map(a => [cx + R * Math.cos(a), cy + R * Math.sin(a)] as [number,number]);

      // connecting lines
      for (let i = 0; i < 5; i++) for (let j = i + 1; j < 5; j++) {
        ctx.beginPath(); ctx.moveTo(pts[i][0], pts[i][1]); ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.strokeStyle = `rgba(200,160,48,${0.05 + 0.03 * Math.sin(t * 0.018 + i)})`;
        ctx.lineWidth = 0.6; ctx.stroke();
      }

      // orbit circle
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(200,160,48,0.18)"; ctx.lineWidth = 0.9; ctx.stroke();

      // 222.5 labels
      DOMAINS.forEach((_, i) => {
        const a1 = domAngles[i], a2 = domAngles[(i + 1) % 5];
        const mid = (a1 + a2) / 2;
        const lx = cx + (R + 15) * Math.cos(mid), ly = cy + (R + 15) * Math.sin(mid);
        ctx.font = "6.5px 'DM Mono',monospace";
        ctx.fillStyle = "rgba(200,160,48,0.45)";
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText("222.5\u00b0", lx, ly);
      });

      // domain nodes
      DOMAINS.forEach((d, i) => {
        const [px, py] = pts[i];
        const active = statusRef.current === "deployed" || statusRef.current === "sync";
        const pulse = 0.5 + 0.5 * Math.sin(t * 0.05 + i * GOLDEN_DEG);
        const nr = 13 + pulse * 3;
        const gr = ctx.createRadialGradient(px, py, 0, px, py, nr * 2.6);
        gr.addColorStop(0, d.col + (active ? "55" : "33"));
        gr.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(px, py, nr * 2.6, 0, Math.PI * 2);
        ctx.fillStyle = gr; ctx.fill();
        ctx.beginPath(); ctx.arc(px, py, nr, 0, Math.PI * 2);
        ctx.fillStyle = d.col + "18";
        ctx.strokeStyle = d.col + (active ? "bb" : "66");
        ctx.lineWidth = 1.4; ctx.fill(); ctx.stroke();
        ctx.font = `bold 10px 'DM Mono',monospace`;
        ctx.fillStyle = d.col;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(String(i + 1), px, py);
        const lr = R + 30;
        const lx = cx + lr * Math.cos(domAngles[i]), ly = cy + lr * Math.sin(domAngles[i]);
        ctx.font = "6px 'DM Mono',monospace";
        ctx.fillStyle = d.col + "cc";
        ctx.fillText(d.name, lx, ly);
      });

      // center
      ctx.font = "bold 9px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(200,160,48,0.9)";
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText("phi-TIME", cx, cy - 7);
      ctx.font = "6px 'DM Mono',monospace";
      ctx.fillStyle = "rgba(200,160,48,0.5)";
      ctx.fillText("EVENT BUS", cx, cy + 6);

      t++;
      raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return <canvas ref={ref} style={{ width: "100%", height: "auto", display: "block", borderRadius: 8 }} />;
}

function StatusPanel({ status, weights }: { status: string; weights: number[] }) {
  const PHI_STEPS = Array.from({ length: 9 }, (_, n) => {
    const t = Math.pow(PHI, n).toFixed(3);
    const deg = ((n * 222.5) % 360).toFixed(1);
    return { n, t, deg };
  });

  const descIdle = "phi-Time replaces all periodic clocks with a non-periodic, maximally incommensurate temporal scheduler governed by the golden ratio. phi-spaced update intervals suppress resonant noise coupling between domains -- the same mechanism that extends T2 coherence time in the NV Fibonacci lattice.";
  const descSync = "The five-domain loop updates at golden-angle phase offsets. Each domain fires at t_n = T0 * phi^n seconds, rotated by theta = 2pi/phi ~= 222.5 deg in phase space. No two domains share a near-harmonic update relationship -- resonant interference is structurally suppressed, not managed by tuning.";

  const colFor = (i: number) => DOMAINS[i]?.col ?? C.core;

  if (status === "idle") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.25em", color: C.gold, textTransform: "uppercase" as const }}>phi-Time -- The Unified Clock</div>
      <p style={{ fontSize: 9, color: C.text, lineHeight: 1.72, margin: 0 }}>{descIdle}</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 6, marginTop: 4 }}>
        {DOMAINS.map(d => (
          <div key={d.id} style={{ border: `1px solid ${d.col}30`, borderRadius: 7, padding: "6px 8px", background: `${d.col}08` }}>
            <div style={{ fontSize: 7, color: d.col, letterSpacing: "0.15em", marginBottom: 2 }}>{d.id}</div>
            <div style={{ fontSize: 7, color: d.col, letterSpacing: "0.1em", marginBottom: 1 }}>{d.name}</div>
            <div style={{ fontSize: 6.5, color: C.dim }}>{d.sub}</div>
            <div style={{ fontSize: 6, color: d.col + "99", marginTop: 3, fontFamily: "'DM Mono',monospace" }}>{d.t}</div>
          </div>
        ))}
      </div>
    </div>
  );

  if (status === "init") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.25em", color: C.mnesis, textTransform: "uppercase" as const }}>Initializing phi-Time Scheduler</div>
      {DOMAINS.map((d, i) => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, opacity: 0.9 }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: d.col, boxShadow: `0 0 6px ${d.col}`, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, marginBottom: 3 }}>
              <span style={{ color: d.col, letterSpacing: "0.1em" }}>Domain {d.id} -- {d.name}</span>
              <span style={{ color: C.dim }}>{d.t}</span>
            </div>
            <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${70 + i * 6}%`, background: d.col, borderRadius: 2, boxShadow: `0 0 6px ${d.col}88`, transition: "width 1.2s ease" }} />
            </div>
          </div>
          <span style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", color: d.col }}>{(70 + i * 6)}%</span>
        </div>
      ))}
      <div style={{ marginTop: 4, fontSize: 8, color: C.aletheia, letterSpacing: "0.12em" }}>phi-Time event bus: STARTING -- registering domain callbacks</div>
    </div>
  );

  if (status === "calibrate") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.25em", color: C.gold, textTransform: "uppercase" as const }}>Domain Calibration -- phi-Spaced Intervals</div>
      <p style={{ fontSize: 8, color: C.dim, margin: "0 0 6px" }}>Calibrating weight adaptation: w_dot_i = -eta * dC_total/dw_i + xi_i</p>
      {DOMAINS.map((d, i) => (
        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 8, color: d.col, width: 110, flexShrink: 0, letterSpacing: "0.08em" }}>D{d.id} {d.sub}</div>
          <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${weights[i] ?? 80}%`, background: `linear-gradient(90deg,${d.col}88,${d.col})`, borderRadius: 3, boxShadow: `0 0 8px ${d.col}66`, transition: "width 0.8s ease" }} />
          </div>
          <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: d.col, width: 36, textAlign: "right" }}>{weights[i] ?? 80}%</span>
        </div>
      ))}
      <div style={{ marginTop: 4, fontSize: 8, color: C.aletheia, letterSpacing: "0.12em" }}>C_total = w1*C1 + w2*C2 + w3*C3 + w4*C4 + w5*C5 -- minimising</div>
    </div>
  );

  if (status === "sync") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.25em", color: C.aletheia, textTransform: "uppercase" as const }}>phi-Spaced Update Schedule</div>
      <p style={{ fontSize: 8, color: C.dim, margin: "0 0 4px" }}>{descSync}</p>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr 1fr", gap: "4px 16px", alignItems: "center" }}>
        <div style={{ fontSize: 7, color: C.dim, letterSpacing: "0.15em" }}>Event n</div>
        <div style={{ fontSize: 7, color: C.dim, letterSpacing: "0.15em" }}>Time t_n = T0 * phi^n</div>
        <div style={{ fontSize: 7, color: C.dim, letterSpacing: "0.15em" }}>Phase theta_n</div>
        {PHI_STEPS.map((s, i) => (
          <Fragment key={s.n}>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: colFor(i % 5) }}>{s.n}</div>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: C.text }}>{s.t} * T0</div>
            <div style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: C.gold }}>{s.deg}&deg;</div>
          </Fragment>
        ))}
      </div>
    </div>
  );

  if (status === "deployed") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 9, letterSpacing: "0.25em", color: C.reverie, textTransform: "uppercase" as const }}>phi-Time Engine -- Deployed</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div>
          <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.12em", marginBottom: 6 }}>DOMAIN WEIGHTS -- LIVE</div>
          {DOMAINS.map((d, i) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
              <div style={{ fontSize: 7, color: d.col, width: 88, letterSpacing: "0.08em" }}>w{d.id} {d.name}</div>
              <div style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.05)", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${weights[i] ?? 82}%`, background: d.col, borderRadius: 2, boxShadow: `0 0 5px ${d.col}77` }} />
              </div>
              <span style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", color: d.col, width: 30, textAlign: "right" }}>{(weights[i] ? (weights[i] / 500).toFixed(2) : "0.20")}</span>
            </div>
          ))}
        </div>
        <div style={{ border: `1px solid ${C.reverie}30`, borderRadius: 8, padding: "10px 14px", background: `${C.reverie}08` }}>
          <div style={{ fontSize: 7, color: C.dim, letterSpacing: "0.15em", marginBottom: 6 }}>C_TOTAL OUTPUT</div>
          <div style={{ fontSize: 22, fontFamily: "'DM Mono',monospace", color: C.reverie, marginBottom: 4 }}>
            {((weights.reduce((a, b) => a + b, 0) / 500)).toFixed(3)}
          </div>
          <div style={{ fontSize: 7, color: C.dim, lineHeight: 1.7 }}>C_total = Sum_i w_i * C_i</div>
          <div style={{ fontSize: 7, color: C.dim, lineHeight: 1.7 }}>Obj: min_w C_total, sum w_i = 1</div>
          <div style={{ marginTop: 8, fontSize: 7, color: C.aletheia, letterSpacing: "0.1em" }}>STATUS: RESONANCE-FREE</div>
          <div style={{ fontSize: 7, color: C.aletheia, letterSpacing: "0.1em" }}>PERIODICITY: SUPPRESSED</div>
        </div>
      </div>
    </div>
  );

  return null;
}

export default function ResonantNexusPage() {
  const syncA = useLive(87, 3);
  const syncB = useLive(92, 3);
  const fluxA = useLive(94, 4);
  const fluxB = useLive(92, 4);
  const intA  = useLive(92, 3);
  const intB  = useLive(88, 5);
  const resA  = useLive(93, 3);
  const resB  = useLive(91, 3);
  const ctrlA = useLive(91, 4);
  const ctrlB = useLive(90, 4);
  const cohA  = useLive(91, 3);
  const cohB  = useLive(91, 3);
  const coreTemp = useLive(78, 1.5, 3000);
  const growthA  = useLive(87, 2, 3500);
  const growthB  = useLive(50, 3, 3000);
  const stability = useLive(92, 2, 3000);
  const nutrient  = useLive(89, 3, 2500);
  const envCtrl   = useLive(94, 2, 3000);
  const bioA      = useLive(94, 3, 2800);
  const bioB      = useLive(90, 3, 3200);

  const sp1 = useSparks(12); const sp2 = useSparks(12);
  const sp3 = useSparks(12); const sp4 = useSparks(12);
  const sp5 = useSparks(12); const sp6 = useSparks(12);

  const [incubation, setIncubation] = useState(64);
  const [status, setStatus] = useState<"idle"|"init"|"calibrate"|"sync"|"deployed">("idle");

  const w1 = useLive(82, 5, 1800);
  const w2 = useLive(76, 6, 2200);
  const w3 = useLive(79, 5, 1600);
  const w4 = useLive(84, 4, 2800);
  const w5 = useLive(88, 5, 2100);
  const domWeights = [w1, w2, w3, w4, w5];

  useEffect(() => {
    const id = setInterval(() => {
      setIncubation(x => Math.min(100, x + 0.05));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const actionBtn = (label: string, st: typeof status, col: string) => (
    <button onClick={() => setStatus(st)} style={{
      padding: "0.55rem 1.1rem",
      borderRadius: 8,
      border: `1px solid ${status === st ? col : C.border}`,
      background: status === st ? `${col}18` : "transparent",
      color: status === st ? col : C.dim,
      fontFamily: "'DM Mono',monospace",
      fontSize: 11,
      letterSpacing: "0.15em",
      cursor: "pointer",
      transition: "all 0.2s",
    }}>{label}</button>
  );

  const panel = { background: C.panel, border: `1px solid ${C.border}`, borderRadius: 12 };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Mono',monospace" }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0.7rem 1.5rem",
        background: "rgba(4,10,28,0.95)",
        borderBottom: `1px solid ${C.border}`,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 10, color: C.dim, letterSpacing: "0.2em" }}>AETHER</span>
          <div style={{ display: "flex", gap: 8 }}>
            {["◁","⚙","ℹ","▣"].map(ic => (
              <button key={ic} style={{
                background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
                borderRadius: 6, width: 28, height: 28, color: C.dim, fontSize: 11, cursor: "pointer",
              }}>{ic}</button>
            ))}
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 14, letterSpacing: "0.3em", color: C.core }}>AETHER CORE</div>
          <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.2em", marginTop: 2 }}>
            RESONANCE MANAGEMENT INTERFACE v2.3.1
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "rgba(0,255,180,0.1)", border: `1px solid ${C.aletheia}44`, borderRadius: 6, padding: "0.25rem 0.6rem", fontSize: 9, color: C.aletheia }}>75% ▮▮▮▯</div>
          <div style={{ background: "rgba(68,255,204,0.08)", border: `1px solid ${C.aletheia}30`, borderRadius: 6, padding: "0.25rem 0.6rem", fontSize: 9, color: C.aletheia }}>Excellent</div>
          <div style={{ background: "rgba(68,136,255,0.08)", border: `1px solid ${C.mnesis}40`, borderRadius: 6, padding: "0.25rem 0.6rem", fontSize: 9, color: C.mnesis }}>Connected</div>
        </div>
      </div>

      {/* Main body */}
      <div style={{ padding: "1.2rem 1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>

        {/* Three-column main */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 220px", gap: "1rem", alignItems: "center" }}>

          {/* Left nodes: Mnesis + Infernia */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <NodePod node={NODES[0]} side="left" />
            <NodePod node={NODES[1]} side="left" />
          </div>

          {/* Center: Resonance Core + Egg */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.35em", color: C.core, marginBottom: 4 }}>
              Resonance Core
            </div>

            {/* Sphere with connection lines overlay */}
            <div style={{ position: "relative", width: "100%", maxWidth: 440 }}>
              <ResonanceCoreCanvas />

              {/* Connection line indicators */}
              {[
                { top: "22%", left: 0, color: C.mnesis },
                { top: "68%", left: 0, color: C.infernia },
                { top: "22%", right: 0, color: C.aletheia },
                { top: "68%", right: 0, color: C.reverie },
              ].map((l, i) => (
                <div key={i} style={{
                  position: "absolute",
                  top: l.top,
                  left: (l as any).left !== undefined ? (l as any).left : undefined,
                  right: (l as any).right !== undefined ? (l as any).right : undefined,
                  width: 24, height: 1,
                  background: `linear-gradient(${(l as any).left !== undefined ? "to right" : "to left"}, transparent, ${l.color}88)`,
                }} />
              ))}
            </div>

            {/* Egg / Incubation node */}
            <div style={{
              ...panel,
              padding: "0.6rem 1.4rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              border: `1px solid ${C.egg}44`,
              boxShadow: `0 0 20px ${C.egg}22`,
            }}>
              <div style={{ fontSize: 9, color: C.egg, letterSpacing: "0.2em" }}>Egg</div>
              <div style={{ display: "flex", gap: 12 }}>
                {[
                  { lbl: "Core Temp", val: `${coreTemp}°C`, col: "#FF9944" },
                  { lbl: "Viability",  val: `${stability}%`,  col: C.egg },
                ].map(m => (
                  <div key={m.lbl} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.1em" }}>{m.lbl}</div>
                    <div style={{ fontSize: 13, color: m.col, fontFamily: "'DM Mono',monospace" }}>{m.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Control panel mini table */}
            <div style={{ ...panel, width: "100%", padding: "0.8rem 1rem" }}>
              <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.2em", marginBottom: 8 }}>
                CONTROL PANEL
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.4rem 0.8rem" }}>
                {[
                  { lbl: "Sync",      val: syncA,   col: C.mnesis },
                  { lbl: "Integrity", val: intA,    col: C.aletheia },
                  { lbl: "Flux",      val: fluxA,   col: C.infernia },
                  { lbl: "Harmonics", val: syncB,   col: C.mnesis },
                  { lbl: "Resonance", val: resA,    col: C.reverie },
                  { lbl: "Quanta",    val: cohA,    col: C.core },
                  { lbl: "Vibration", val: ctrlA,   col: C.gold },
                  { lbl: "Amplitude", val: resB,    col: C.reverie },
                  { lbl: "Waveform",  val: ctrlB,   col: C.aletheia },
                ].map(m => (
                  <div key={m.lbl} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <span style={{ fontSize: 7, color: C.dim }}>{m.lbl}</span>
                    <span style={{ fontSize: 10, color: m.col, fontFamily: "'DM Mono',monospace" }}>{m.val}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right nodes: Aletheia + Reverie */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
            <NodePod node={NODES[2]} side="right" />
            <NodePod node={NODES[3]} side="right" />
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "0.7rem" }}>
          <StatCell label="Sync"      col={C.mnesis}   sparks={sp1} vals={[syncA, syncB]} />
          <StatCell label="Energy Flux" col={C.infernia} sparks={sp2} vals={[fluxA, fluxB]} />
          <StatCell label="Integrity" col={C.aletheia} sparks={sp3} vals={[intA, intB]} />
          <StatCell label="Resilience" col={C.reverie} sparks={sp4} vals={[resA, resB]} />
          <StatCell label="Control"   col={C.gold}     sparks={sp5} vals={[ctrlA, ctrlB]} />
          <StatCell label="Coherence" col={C.core}     sparks={sp6} vals={[cohA, cohB]} />
        </div>

        {/* Right incubation panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "0.7rem" }}>

          {/* Theory cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.7rem" }}>
            {[
              { col: C.infernia, kicker: "Infernia -- Ferrofluidic Logic",
                text: "Droplet dynamics and field-driven bifurcation replace static logic gates. Magnetic transitions generate heat that feeds directly back into the energy loop -- self-healing computation." },
              { col: C.reverie,  kicker: "Reverie -- Bioluminescent Sensing",
                text: "Slow microfluidic currents seeded with bioluminescent bacteria provide environmental sensing and adaptive feedback. Chemical energy converts to light with near-zero heat loss." },
              { col: C.mnesis,   kicker: "Mnesis -- Living Memory",
                text: "Neural organoids in hydrogel nodes store memory via vibrational and photonic stimulation. Memory access itself generates kinetic energy fed back into the Resonant Nexus loop." },
              { col: C.aletheia, kicker: "Aletheia -- Observable Truth",
                text: "Data retrieval manifests as light patterns, color shifts, and spatial glow pathways. Intelligence is rendered directly into the physical domain -- the end of invisible cognition." },
            ].map(c => (
              <div key={c.kicker} style={{ ...panel, padding: "0.8rem 1rem", borderLeft: `3px solid ${c.col}` }}>
                <div style={{ fontSize: 8, color: c.col, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 4 }}>{c.kicker}</div>
                <p style={{ fontSize: 9, color: "rgba(180,210,255,0.4)", lineHeight: 1.65, margin: 0 }}>{c.text}</p>
              </div>
            ))}
          </div>

          {/* Incubation Chamber */}
          <div style={{ ...panel, padding: "1rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <div style={{ fontSize: 9, letterSpacing: "0.25em", color: C.egg, textTransform: "uppercase", marginBottom: 4 }}>
              Incubation Chamber
            </div>
            <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.12em", marginBottom: 2 }}>
              Incubation Interface
            </div>
            {[
              { lbl: "Core Temperature", val: `${coreTemp}°C`, col: "#FF9944", spark: sp1.slice(0,8) },
              { lbl: "Growth Rate",      val: `${(growthA/100).toFixed(2)}`,    col: C.aletheia, spark: sp2.slice(0,8) },
              { lbl: "Stability Index",  val: `${stability}%`,  col: C.mnesis,   spark: sp3.slice(0,8) },
              { lbl: "Nutrient Flow",    val: `${nutrient}%`,   col: C.reverie,  spark: sp4.slice(0,8) },
              { lbl: "Env. Control",     val: `${envCtrl}%`,    col: C.aletheia, spark: sp5.slice(0,8) },
              { lbl: "Biofeedback",      val: `${bioA}%`,       col: C.core,     spark: sp6.slice(0,8) },
              { lbl: "Biofeedback B",    val: `${bioB}%`,       col: C.infernia, spark: sp1.slice(4,12) },
            ].map(m => (
              <div key={m.lbl} style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "space-between" }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 8, color: C.dim, letterSpacing: "0.08em", whiteSpace: "nowrap" }}>{m.lbl}</div>
                  <Spark vals={m.spark} color={m.col} />
                </div>
                <span style={{ fontSize: 13, fontFamily: "'DM Mono',monospace", color: m.col, flexShrink: 0 }}>{m.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom action bar */}
        <div style={{
          ...panel,
          padding: "0.7rem 1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: C.dim, letterSpacing: "0.15em" }}>⬡</span>
            <span style={{ fontSize: 9, color: C.dim, letterSpacing: "0.15em" }}>Incubation</span>
            <div style={{ display: "flex", gap: 6 }}>
              {["◈","⬡","⊛"].map(s => (
                <div key={s} style={{ width: 24, height: 24, border: `1px solid ${C.border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: C.dim }}>{s}</div>
              ))}
            </div>
          </div>

          <IncubationBar progress={incubation} />

          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            {actionBtn("Initialize", "init",      C.mnesis)}
            {actionBtn("Calibrate",  "calibrate", C.gold)}
            {actionBtn("Sync",       "sync",      C.aletheia)}
            {actionBtn("Deploy",     "deployed",  C.reverie)}
          </div>
        </div>

        {/* phi-Time Engine Panel */}
        <div style={{
          ...panel,
          display: "grid",
          gridTemplateColumns: "340px 1fr",
          gap: 0,
          overflow: "hidden",
          border: `1px solid ${C.gold}30`,
        }}>
          {/* Left: canvas */}
          <div style={{ borderRight: `1px solid ${C.gold}20`, background: "#030814" }}>
            <div style={{ padding: "0.6rem 0.8rem", fontSize: 7, letterSpacing: "0.3em", color: C.gold, borderBottom: `1px solid ${C.gold}18`, textTransform: "uppercase" as const }}>
              phi-Time Unified Clock
            </div>
            <PhiTimeCanvas status={status} />
            <div style={{ padding: "0.5rem 0.8rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
              {[
                { k: "phi", v: "1.6180" },
                { k: "theta", v: "222.5 deg" },
                { k: "domains", v: "5" },
                { k: "schedule", v: "T0*phi^n" },
                { k: "C_total", v: ((domWeights.reduce((a,b)=>a+b,0)/500)).toFixed(3) },
                { k: "status", v: status.toUpperCase() },
              ].map(m => (
                <div key={m.k} style={{ background: "rgba(200,160,48,0.05)", borderRadius: 5, padding: "4px 6px", border: `1px solid rgba(200,160,48,0.1)` }}>
                  <div style={{ fontSize: 6, color: C.dim, letterSpacing: "0.15em", textTransform: "uppercase" as const }}>{m.k}</div>
                  <div style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", color: C.gold, marginTop: 2 }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Right: status panel */}
          <div style={{ padding: "1rem 1.2rem" }}>
            <StatusPanel status={status} weights={domWeights} />
          </div>
        </div>
      </div>
    </div>
  );
}

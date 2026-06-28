import { useState, useEffect, useRef } from "react";

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
      </div>
    </div>
  );
}

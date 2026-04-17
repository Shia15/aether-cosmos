import { useEffect, useRef, useState } from "react";
import { subscribeToBus, BusState, getBusState, LIVE_MS } from "@/lib/aether-bus";

const NODE_ORDER = ["phi", "cgle", "multiscale", "morpho"];
const NODE_META: Record<string, { label: string; color: string; abbr: string }> = {
  phi:        { label: "φ-AETHER",   color: "#c084fc", abbr: "φA" },
  cgle:       { label: "CGLE",       color: "#00ff88", abbr: "CG" },
  multiscale: { label: "Multi-Scale", color: "#60a5fa", abbr: "MS" },
  morpho:     { label: "Morpho",     color: "#2dd4bf", abbr: "MC" },
};

function NodeRing({ size, state }: { size: number; state: BusState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2, cy = size / 2, r = size * 0.38;
    ctx.clearRect(0, 0, size, size);

    const now = Date.now();
    const nodes = NODE_ORDER.map((id, i) => {
      const angle = (i / NODE_ORDER.length) * Math.PI * 2 - Math.PI / 2;
      const sig = state.nodes[id];
      const live = sig && now - sig.timestamp < LIVE_MS;
      const memory = sig && !live && now - sig.timestamp < 30000;
      const psi = sig ? sig.psi : 0;
      const meta = NODE_META[id];
      return { id, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), psi, live, memory, color: meta.color, abbr: meta.abbr };
    });

    // Draw edges between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        if (!a.live && !a.memory && !b.live && !b.memory) continue;
        const strength = (a.psi + b.psi) / 2;
        const opacity = (a.live || b.live) ? strength * 0.4 : strength * 0.15;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(196, 181, 253, ${opacity})`;
        ctx.lineWidth = (a.live && b.live) ? 1.0 : 0.5;
        if (a.memory || b.memory) ctx.setLineDash([2, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Draw center coherence glow
    const coh = state.systemCoherence;
    if (coh > 0.1) {
      const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.4);
      grd.addColorStop(0, `rgba(196, 181, 253, ${coh * 0.25})`);
      grd.addColorStop(1, "transparent");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw nodes
    nodes.forEach((n) => {
      const nr = n.live ? 5 + n.psi * 3 : n.memory ? 4 : 3;
      ctx.beginPath();
      ctx.arc(n.x, n.y, nr, 0, Math.PI * 2);
      if (n.live) {
        ctx.fillStyle = n.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = n.color;
      } else if (n.memory) {
        ctx.fillStyle = n.color + "60"; // 38% opacity
        ctx.shadowBlur = 0;
        // Draw dashed ring for memory indicator
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, nr + 2.5, 0, Math.PI * 2);
        ctx.setLineDash([2, 2]);
        ctx.strokeStyle = n.color + "40";
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
        ctx.font = `6px monospace`;
        ctx.fillStyle = n.color + "80";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(n.abbr, n.x, n.y);
        return;
      } else {
        ctx.fillStyle = "rgba(60,60,80,0.3)";
        ctx.shadowBlur = 0;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.font = `6px monospace`;
      ctx.fillStyle = n.live ? n.color : "rgba(100,100,130,0.4)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(n.abbr, n.x, n.y);
    });
  });

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: "block" }}
    />
  );
}

export function CoherenceHUD() {
  const [state, setState] = useState<BusState>(getBusState());
  const [collapsed, setCollapsed] = useState(false);
  const [flash, setFlash] = useState(false);
  const prevCrystal = useRef(false);
  const tickRef = useRef(0);

  // Animate flash
  useEffect(() => {
    if (state.crystallizing && !prevCrystal.current) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1200);
    }
    prevCrystal.current = state.crystallizing;
  }, [state.crystallizing]);

  // Tick for live timestamp refresh (marks stale nodes)
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++;
      setState((s) => ({ ...s })); // force re-render to recheck timestamps
    }, 800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    return subscribeToBus(setState);
  }, []);

  const pct = Math.round(state.systemCoherence * 100);
  const barColor =
    state.systemCoherence > 0.72
      ? "#c084fc"
      : state.systemCoherence > 0.45
      ? "#60a5fa"
      : "#64748b";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        zIndex: 9999,
        width: collapsed ? 160 : 200,
        background: "rgba(3, 5, 20, 0.93)",
        border: "1px solid rgba(196, 181, 253, 0.18)",
        borderRadius: 10,
        backdropFilter: "blur(12px)",
        fontFamily: "monospace",
        fontSize: 11,
        color: "rgba(200, 195, 240, 0.85)",
        boxShadow: state.crystallizing
          ? "0 0 24px rgba(196,181,253,0.35)"
          : "0 4px 24px rgba(0,0,0,0.5)",
        transition: "box-shadow 0.4s ease",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        onClick={() => setCollapsed((c) => !c)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 10px 6px",
          cursor: "pointer",
          borderBottom: collapsed ? "none" : "1px solid rgba(196,181,253,0.1)",
          userSelect: "none",
        }}
      >
        <span style={{ color: "#c084fc", letterSpacing: "0.1em" }}>
          ◈ COHERENCE BUS
        </span>
        <span style={{ color: "rgba(200,195,240,0.45)", fontSize: 9 }}>
          {collapsed ? "▲" : "▼"}
        </span>
      </div>

      {!collapsed && (
        <div style={{ padding: "8px 10px 10px" }}>
          {/* Node ring */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
            <NodeRing size={100} state={state} />
          </div>

          {/* Node chips */}
          {NODE_ORDER.map((id) => {
            const sig = state.nodes[id];
            const now = Date.now();
            const live = sig && now - sig.timestamp < LIVE_MS;
            const memory = sig && !live && now - sig.timestamp < 30000;
            const meta = NODE_META[id];
            const psi = sig ? sig.psi : null;
            return (
              <div
                key={id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                  opacity: live ? 1 : memory ? 0.5 : 0.25,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: live ? meta.color : memory ? meta.color + "70" : "#333",
                    boxShadow: live ? `0 0 6px ${meta.color}` : "none",
                    flexShrink: 0,
                  }}
                />
                <span style={{ flex: 1, color: live ? meta.color : memory ? meta.color + "aa" : "#444" }}>
                  {meta.label}
                </span>
                <span style={{ color: live ? "rgba(200,195,240,0.8)" : "rgba(200,195,240,0.4)", fontSize: 10 }}>
                  {live ? `Ψ ${psi!.toFixed(2)}` : memory ? `↺ ${psi!.toFixed(2)}` : "—"}
                </span>
              </div>
            );
          })}

          {/* System coherence bar */}
          <div style={{ marginTop: 8, borderTop: "1px solid rgba(196,181,253,0.08)", paddingTop: 8 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ color: "rgba(200,195,240,0.5)" }}>SYSTEM Ψ</span>
              <span style={{ color: barColor, fontWeight: "bold" }}>{pct}%</span>
            </div>
            <div
              style={{
                height: 4,
                background: "rgba(255,255,255,0.06)",
                borderRadius: 2,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${pct}%`,
                  background: barColor,
                  boxShadow: pct > 70 ? `0 0 8px ${barColor}` : "none",
                  transition: "width 0.6s ease, background 0.6s ease",
                  borderRadius: 2,
                }}
              />
            </div>
          </div>

          {/* Status */}
          <div style={{ marginTop: 6, textAlign: "center" }}>
            {state.crystallizing ? (
              <span
                style={{
                  color: flash ? "#c084fc" : "rgba(196,181,253,0.7)",
                  letterSpacing: "0.12em",
                  fontSize: 10,
                  textShadow: flash ? "0 0 10px #c084fc" : "none",
                  transition: "color 0.2s, text-shadow 0.2s",
                }}
              >
                ◉ CRYSTALLIZING
              </span>
            ) : state.activeCount > 0 ? (
              <span style={{ color: "rgba(150,150,180,0.55)", fontSize: 10 }}>
                {state.activeCount} LIVE · {Object.values(state.nodes).filter(n => Date.now() - n.timestamp < 30000).length - state.activeCount} IN MEMORY
              </span>
            ) : Object.keys(state.nodes).length > 0 ? (
              <span style={{ color: "rgba(150,150,180,0.35)", fontSize: 10 }}>
                ↺ {Object.values(state.nodes).filter(n => Date.now() - n.timestamp < 30000).length} IN MEMORY
              </span>
            ) : (
              <span style={{ color: "rgba(150,150,180,0.3)", fontSize: 10 }}>
                NO ACTIVE NODES
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useRef, useState } from "react";

/* ── Palette ── */
const BG    = "#02040a";
const PANEL = "rgba(4,8,18,0.96)";
const BORDER = "#0f1a2e";
const GOLD  = "#c8a84c";
const GOLD2 = "#f0d46a";
const CYAN  = "#2ef0d8";
const GREEN = "#44ffaa";
const EMBER = "#ff5522";
const VIOLET = "#7744ee";
const DIM   = "#3a4a5a";
const TEXT  = "#b8c8d8";
const MUTED = "#607080";

const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── Phase data — the synthesis core ── */
interface DronePhase {
  id: number; name: string; sub: string; color: string;
  massFlow: number;    // kg/s (0–600)
  chamberBar: number;  // 0–350
  thrustN: number;     // N (0–2.3M)
  isp: number;         // s
  propMode: string;
  nozzleMode: "off"|"subsonic"|"transonic"|"supersonic"|"burst";
  desc: string;
}

const PHASES: DronePhase[] = [
  {
    id:0, name:"EXPAND", sub:"Deploy & Engage",
    color: GOLD,
    massFlow: 580, chamberBar: 240, thrustN: 2200000, isp: 325,
    propMode: "Full-flow staged combustion · bio-CH₄/LOX",
    nozzleMode: "supersonic",
    desc: "Ignition burst. Full mass flow surges through the convergent-divergent nozzle in the supersonic regime. Bio-methane + liquid oxygen reach Mach >1 at the throat. Origami joints unfold under reaction force — thrust IS the deployment mechanism.",
  },
  {
    id:1, name:"OPERATE", sub:"Mission Execution",
    color: CYAN,
    massFlow: 420, chamberBar: 180, thrustN: 1600000, isp: 330,
    propMode: "Sustained throttle · optimal Isp band",
    nozzleMode: "supersonic",
    desc: "Sustained cruise. Mass flow settles at 420 kg/s — the optimal specific-impulse band for bio-derived propellants. Reaction force maintains altitude and sensor array deployment. Gamma band neural-sync (40 Hz) governs sensor timing.",
  },
  {
    id:2, name:"COMPRESS", sub:"Retract & Collapse",
    color: VIOLET,
    massFlow: 120, chamberBar: 60, thrustN: 460000, isp: 295,
    propMode: "Deep throttle · hydraulic actuator assist",
    nozzleMode: "subsonic",
    desc: "Throttle-down. Chamber pressure drops below 100 bar — flow becomes subsonic in the divergent section. Reduced reaction force allows hydraulic actuators to begin panel folding. The nozzle itself becomes a structural compressor.",
  },
  {
    id:3, name:"TRANSIT", sub:"Subterranean / Underwater",
    color: GREEN,
    massFlow: 18, chamberBar: 8, thrustN: 68000, isp: 280,
    propMode: "Pulse micro-thrust · buoyancy primary",
    nozzleMode: "transonic",
    desc: "Stealth mode. Bio-propellant pulses at minimal ṁ — just enough to overcome drag in water-filled channels. F = ṁ·vₑ at low mass flow produces micro-impulse bursts. Primary movement via buoyancy and terrain-mapping glide.",
  },
  {
    id:4, name:"REPEAT", sub:"Redeploy Cycle",
    color: EMBER,
    massFlow: 600, chamberBar: 252, thrustN: 2280000, isp: 328,
    propMode: "Reignition burst · full bio-propellant load",
    nozzleMode: "burst",
    desc: "Reboot pulse. The cycle completes. Bio-propellant reserves replenished from renewable substrate. Burst ignition pushes mass flow to maximum — the origami joints SNAP open under the reaction impulse. Equal and opposite: collapse becomes expansion.",
  },
];

/* ── Bio-propellants ── */
const BIO_PROPS = [
  { name:"Bio-LCH₄", color:GOLD,   note:"Biomethane from anaerobic digestion · drop-in for Raptor LOX/CH₄" },
  { name:"Bio-LH₂",  color:CYAN,   note:"Electrolytic hydrogen from algae · highest Isp biofuel known" },
  { name:"Algae-LOX", color:GREEN,  note:"Photobioreactor O₂ liquefied · zero-mining oxidizer chain" },
  { name:"Syngas",    color:VIOLET, note:"Biomass gasification · CO+H₂ blend · adjustable mixture ratio" },
];

/* ── Raptor performance table ── */
const RAPTOR = [
  ["Thrust (sea level)", "~2,300,000", "N"],
  ["Mass Flow Rate",     "~600",       "kg/s"],
  ["Exhaust Velocity",   "~3,800",     "m/s"],
  ["Specific Impulse",   "~330",       "s"],
  ["Chamber Pressure",   "~250",       "bar"],
  ["Bio-equivalent Isp", "~315–330",   "s"],
];

/* ── Nozzle canvas ── */
function drawNozzle(
  ctx: CanvasRenderingContext2D,
  W: number, H: number,
  t: number,
  mode: DronePhase["nozzleMode"],
  massFlow: number,
) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  const cy = H / 2;
  const nW = W * 0.72;
  const nH = H * 0.58;
  const nx = cx - nW / 2;

  // Nozzle geometry points
  const inletH  = nH * 0.9;
  const throatH = nH * 0.28;
  const exitH   = nH;
  const inletX  = nx;
  const throatX = nx + nW * 0.38;
  const exitX   = nx + nW;

  // Upper & lower nozzle walls
  function nozzleY(x: number, sign: number): number {
    if (x <= throatX) {
      const u = (x - inletX) / (throatX - inletX);
      const h = inletH / 2 + (throatH / 2 - inletH / 2) * u;
      return cy + sign * h;
    } else {
      const u = (x - throatX) / (exitX - throatX);
      const h = throatH / 2 + (exitH / 2 - throatH / 2) * u;
      return cy + sign * h;
    }
  }

  // Fill zones: subsonic (converging) / supersonic (diverging)
  const zonesX = [inletX, throatX, exitX];
  const zoneColors = mode === "off"
    ? ["#0a1020", "#0a1020"]
    : mode === "subsonic"
    ? ["rgba(40,80,200,0.18)", "rgba(20,40,100,0.08)"]
    : mode === "transonic"
    ? ["rgba(40,80,200,0.22)", "rgba(200,168,76,0.15)"]
    : ["rgba(40,80,200,0.2)", "rgba(255,85,34,0.22)"];

  [0, 1].forEach(seg => {
    const x0 = zonesX[seg], x1 = zonesX[seg + 1];
    ctx.beginPath();
    ctx.moveTo(x0, nozzleY(x0, -1));
    for (let x = x0; x <= x1; x += 2) ctx.lineTo(x, nozzleY(x, -1));
    for (let x = x1; x >= x0; x -= 2) ctx.lineTo(x, nozzleY(x, 1));
    ctx.closePath();
    ctx.fillStyle = zoneColors[seg];
    ctx.fill();
  });

  // Flow particles
  if (mode !== "off") {
    const pCount = mode === "burst" ? 22 : mode === "supersonic" ? 16 : mode === "subsonic" ? 8 : 10;
    for (let i = 0; i < pCount; i++) {
      const progress = ((i / pCount + t * (mode === "burst" ? 0.7 : mode === "supersonic" ? 0.55 : 0.32)) % 1);
      const px = inletX + progress * (exitX - inletX);
      const row = (i % 5) / 5 - 0.5;
      const yBound = Math.abs(nozzleY(px, -1) - cy) * 0.82;
      const py = cy + row * yBound * 2;
      const alpha = 0.4 + 0.5 * Math.sin(progress * Math.PI);

      let col: string;
      if (px < throatX) col = `rgba(46,200,240,${alpha})`;
      else if (progress < 0.6) col = `rgba(240,212,80,${alpha})`;
      else col = mode === "burst" ? `rgba(255,85,34,${alpha})` : `rgba(255,150,50,${alpha})`;

      const r = mode === "burst" ? 3.5 : 2.5;
      ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = col; ctx.fill();
    }
  }

  // Throat label
  ctx.save();
  ctx.font = `bold 10px ${mono}`;
  ctx.fillStyle = "rgba(200,168,76,0.8)";
  ctx.textAlign = "center";
  ctx.fillText("M = 1", throatX, nozzleY(throatX, -1) - 10);
  ctx.restore();

  // Nozzle walls
  ctx.beginPath();
  ctx.moveTo(inletX, nozzleY(inletX, -1));
  for (let x = inletX; x <= exitX; x += 2) ctx.lineTo(x, nozzleY(x, -1));
  ctx.strokeStyle = "rgba(200,168,76,0.55)"; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(inletX, nozzleY(inletX, 1));
  for (let x = inletX; x <= exitX; x += 2) ctx.lineTo(x, nozzleY(x, 1));
  ctx.strokeStyle = "rgba(200,168,76,0.55)"; ctx.lineWidth = 2; ctx.stroke();

  // Mach labels
  ctx.font = `9px ${mono}`; ctx.textAlign = "center";
  ctx.fillStyle = "rgba(46,240,216,0.7)"; ctx.fillText("SUBSONIC", inletX + (throatX - inletX) * 0.5, cy + 4);
  if (mode !== "off" && mode !== "subsonic") {
    ctx.fillStyle = mode === "burst" ? "rgba(255,85,34,0.8)" : "rgba(255,150,50,0.7)";
    ctx.fillText("SUPERSONIC", throatX + (exitX - throatX) * 0.5, cy + 4);
  }

  // Thrust arrow (left)
  const arrowA = mode === "off" ? 0.1 : 0.15 + (massFlow / 600) * 0.55;
  ctx.save();
  ctx.globalAlpha = arrowA;
  ctx.beginPath();
  const ax = inletX - 14, ay = cy;
  ctx.moveTo(ax, ay); ctx.lineTo(ax - 36, ay);
  ctx.strokeStyle = GREEN; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ax - 36, ay); ctx.lineTo(ax - 26, ay - 7); ctx.lineTo(ax - 26, ay + 7); ctx.closePath();
  ctx.fillStyle = GREEN; ctx.fill();
  ctx.font = `bold 9px ${mono}`; ctx.textAlign = "right"; ctx.fillStyle = GREEN;
  ctx.fillText("THRUST", ax - 40, ay - 10);
  ctx.restore();

  // Exhaust arrow (right)
  ctx.save();
  ctx.globalAlpha = arrowA;
  ctx.beginPath();
  const ex2 = exitX + 14, ey = cy;
  ctx.moveTo(ex2, ey); ctx.lineTo(ex2 + 36, ey);
  ctx.strokeStyle = EMBER; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ex2 + 36, ey); ctx.lineTo(ex2 + 26, ey - 7); ctx.lineTo(ex2 + 26, ey + 7); ctx.closePath();
  ctx.fillStyle = EMBER; ctx.fill();
  ctx.font = `bold 9px ${mono}`; ctx.textAlign = "left"; ctx.fillStyle = EMBER;
  ctx.fillText("EXHAUST", ex2 + 40, ey - 10);
  ctx.restore();
}

/* ── SVG mass-flow chart ── */
function MassFlowChart({ activePhase }: { activePhase: DronePhase }) {
  const W = 400, H = 180;
  const padL = 44, padR = 12, padT = 18, padB = 32;
  const cW = W - padL - padR, cH = H - padT - padB;
  const maxBar = 350, maxFlow = 3000, maxForce = 3e6;

  function toX(bar: number) { return padL + (bar / maxBar) * cW; }
  function toYFlow(v: number) { return padT + cH - (v / maxFlow) * cH; }
  function toYForce(v: number) { return padT + cH - (v / maxForce) * cH; }

  // Build curves: flow = bar * 8.57, force = bar * 8571
  const flowPts: string[] = [], forcePts: string[] = [];
  for (let b = 0; b <= maxBar; b += 5) {
    flowPts.push(`${toX(b)},${toYFlow(b * 8.57)}`);
    forcePts.push(`${toX(b)},${toYForce(b * 8571)}`);
  }

  // Active phase dot on flow curve
  const dotX = toX(activePhase.chamberBar);
  const dotYFlow = toYFlow(activePhase.massFlow * 5);
  const dotYForce = toYForce(activePhase.thrustN);

  // Grid lines
  const gridX = [0, 50, 100, 150, 200, 250, 300, 350];
  const gridY = [0, 500, 1000, 1500, 2000, 2500, 3000];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", maxWidth: W }}>
      {/* bg */}
      <rect x={0} y={0} width={W} height={H} fill={BG} />
      <rect x={padL} y={padT} width={cW} height={cH} fill="rgba(10,20,40,0.6)" />

      {/* Grid */}
      {gridX.map(b => (
        <line key={b} x1={toX(b)} y1={padT} x2={toX(b)} y2={padT + cH}
          stroke={BORDER} strokeWidth={0.5} />
      ))}
      {gridY.map(v => (
        <line key={v} x1={padL} y1={toYFlow(v)} x2={padL + cW} y2={toYFlow(v)}
          stroke={BORDER} strokeWidth={0.5} />
      ))}

      {/* Supersonic region fill */}
      <rect x={toX(100)} y={padT} width={toX(350) - toX(100)} height={cH}
        fill="rgba(255,85,34,0.04)" />
      <text x={toX(225)} y={padT + 12} textAnchor="middle"
        fill="rgba(255,85,34,0.4)" fontSize={8} fontFamily={mono}>Supersonic Regime (Mach &gt; 1)</text>

      {/* Force curve (dashed, secondary axis) */}
      <polyline points={forcePts.join(" ")} fill="none"
        stroke={CYAN} strokeWidth={1.2} strokeDasharray="4,3" opacity={0.7} />

      {/* Flow curve */}
      <polyline points={flowPts.join(" ")} fill="none"
        stroke={GREEN} strokeWidth={1.8} opacity={0.9} />

      {/* Active phase marker */}
      <circle cx={dotX} cy={dotYFlow} r={5} fill={activePhase.color} stroke="#fff" strokeWidth={1} opacity={0.9} />
      <circle cx={dotX} cy={dotYForce} r={4} fill={CYAN} stroke="#fff" strokeWidth={1} opacity={0.7} />
      <line x1={dotX} y1={padT} x2={dotX} y2={padT + cH}
        stroke={activePhase.color} strokeWidth={1} strokeDasharray="3,3" opacity={0.5} />

      {/* X axis labels */}
      {[0, 100, 200, 300].map(b => (
        <text key={b} x={toX(b)} y={H - 4} textAnchor="middle"
          fill={MUTED} fontSize={8} fontFamily={mono}>{b}</text>
      ))}
      <text x={padL + cW / 2} y={H} textAnchor="middle"
        fill={MUTED} fontSize={7} fontFamily={mono}>Chamber Pressure (bar)</text>

      {/* Y axis label */}
      <text x={10} y={padT + cH / 2} textAnchor="middle"
        fill={MUTED} fontSize={7} fontFamily={mono}
        transform={`rotate(-90,10,${padT + cH / 2})`}>kg/s</text>

      {/* Legend */}
      <circle cx={padL + 6} cy={padT + 8} r={3} fill={GREEN} />
      <text x={padL + 12} y={padT + 11} fill={GREEN} fontSize={7} fontFamily={mono}>Mass Flow (kg/s)</text>
      <line x1={padL + 100} y1={padT + 8} x2={padL + 116} y2={padT + 8}
        stroke={CYAN} strokeWidth={1.2} strokeDasharray="4,3" />
      <text x={padL + 120} y={padT + 11} fill={CYAN} fontSize={7} fontFamily={mono}>Reaction Force (N)</text>
    </svg>
  );
}

/* ── Phase selector button ── */
function PhaseBtn({ phase, active, onClick }: { phase: DronePhase; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: active ? `${phase.color}18` : "transparent",
      border: `1px solid ${active ? phase.color : BORDER}`,
      color: active ? phase.color : MUTED,
      fontFamily: mono, fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase",
      padding: "7px 10px", cursor: "pointer", borderRadius: 2,
      transition: "all 0.2s", textAlign: "left", width: "100%", marginBottom: 4,
    }}>
      <div style={{ fontWeight: "bold", marginBottom: 2 }}>{phase.name}</div>
      <div style={{ fontSize: 8, color: active ? `${phase.color}aa` : DIM, fontFamily: body }}>{phase.sub}</div>
    </button>
  );
}

/* ── F = ṁ·vₑ display ── */
function MomentumEquation({ phase }: { phase: DronePhase }) {
  const ve = phase.thrustN / (phase.massFlow || 1);
  return (
    <div style={{ background: "rgba(200,168,76,0.05)", border: `1px solid ${GOLD}30`, borderRadius: 2, padding: "10px 12px", marginBottom: 10 }}>
      <div style={{ fontFamily: serif, fontSize: 18, color: GOLD, letterSpacing: 1, textAlign: "center", marginBottom: 6 }}>F = ṁ · v<sub>e</sub></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          ["F  Thrust",    `${(phase.thrustN/1000).toFixed(0)} kN`, GOLD2],
          ["ṁ  Mass Flow", `${phase.massFlow} kg/s`, GREEN],
          ["vₑ  Exhaust",  `${ve.toFixed(0)} m/s`, CYAN],
          ["Isp",          `${phase.isp} s`, VIOLET],
        ].map(([k,v,c])=>(
          <div key={k as string} style={{ borderLeft: `2px solid ${c as string}40`, paddingLeft: 6 }}>
            <div style={{ fontFamily: mono, fontSize: 8, color: MUTED, letterSpacing: 1 }}>{k as string}</div>
            <div style={{ fontFamily: mono, fontSize: 11, color: c as string, fontWeight: "bold" }}>{v as string}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
export default function BioInfinityDrivePage() {
  const [activeIdx, setActiveIdx] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tRef = useRef(0);
  const rafRef = useRef(0);
  const phase = PHASES[activeIdx];

  /* ── nozzle animation ── */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    function resize() {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width * dpr;
      cv!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function loop() {
      rafRef.current = requestAnimationFrame(loop);
      tRef.current += 0.012;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      const p = PHASES[activeIdxRef.current];
      drawNozzle(ctx!, W, H, tRef.current, p.nozzleMode, p.massFlow);
    }
    loop();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // keep activeIdx accessible in rAF without stale closure
  const activeIdxRef = useRef(0);
  activeIdxRef.current = activeIdx;

  /* ── section header ── */
  const SH = ({ label, color = GOLD }: { label: string; color?: string }) => (
    <div style={{ fontSize: 8, letterSpacing: "0.2em", textTransform: "uppercase", color, marginBottom: 6, borderBottom: `1px solid ${BORDER}`, paddingBottom: 4 }}>
      {label}
    </div>
  );

  const panelBox: React.CSSProperties = { background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 2, padding: "10px 12px", marginBottom: 10, position: "relative" };
  const topLine = (c = GOLD) => <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,${c},transparent)`, opacity: 0.3 }} />;

  return (
    <div style={{ background: BG, minHeight: "100vh", color: TEXT, fontFamily: mono, overflowY: "auto" }}>

      {/* ── HEADER ── */}
      <div style={{
        padding: "14px 20px 12px",
        borderBottom: `1px solid ${BORDER}`,
        background: "rgba(4,8,18,0.98)",
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${GOLD},${CYAN},${GOLD},transparent)`, opacity: 0.4 }} />
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 8, letterSpacing: "0.2em", color: CYAN, marginBottom: 3 }}>
              AETHER · PROPULSION SYNTHESIS · BIOTECHNOLOGY × INFINITY LOOP DRIVE
            </div>
            <div style={{ fontFamily: serif, fontSize: 20, letterSpacing: 2, color: "#fff" }}>
              BIO-PROPULSION INFINITY LOOP DRIVE
            </div>
            <div style={{ fontFamily: body, fontSize: 12, color: DIM, marginTop: 2 }}>
              F = ṁ · vₑ  ·  Equal &amp; Opposite Reaction  ·  5-Phase Origami Deployment
            </div>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
            {[["Phase", phase.name, phase.color], ["Mass Flow", phase.massFlow+" kg/s", GREEN], ["Thrust", (phase.thrustN/1e6).toFixed(2)+" MN", GOLD2], ["Isp", phase.isp+" s", CYAN]].map(([k,v,c])=>(
              <div key={k as string} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 7, color: DIM, letterSpacing: 1, marginBottom: 2 }}>{k as string}</div>
                <div style={{ fontFamily: serif, fontSize: 13, color: c as string, letterSpacing: 1 }}>{v as string}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 9, fontFamily: body, fontStyle: "italic", color: DIM, maxWidth: 200, lineHeight: 1.5 }}>
            Bio-derived propellants cycle through Newton's 3rd Law across five origami drone states.
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "16px 20px 32px", display: "grid", gridTemplateColumns: "220px 1fr 260px", gap: 14 }}>

        {/* ══ LEFT PANEL ══ */}
        <div>
          {/* Phase selector */}
          <div style={panelBox}>
            {topLine()}
            <SH label="5-Phase Drive Cycle" color={GOLD} />
            {PHASES.map(p => (
              <PhaseBtn key={p.id} phase={p} active={activeIdx === p.id} onClick={() => setActiveIdx(p.id)} />
            ))}
          </div>

          {/* Newton's 3rd law */}
          <div style={panelBox}>
            {topLine(CYAN)}
            <SH label="Newton's 3rd Law" color={CYAN} />
            <div style={{ fontFamily: serif, fontSize: 13, color: GOLD2, marginBottom: 6 }}>Equal &amp; Opposite Reaction</div>
            <div style={{ fontSize: 9, color: MUTED, lineHeight: 1.7, marginBottom: 8 }}>
              For every action, there is an equal and opposite reaction.
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 8, color: GREEN }}>↑ THRUST</div>
                <div style={{ fontSize: 8, color: MUTED }}>Action</div>
              </div>
              <div style={{ width: 1, background: BORDER }} />
              <div style={{ textAlign: "center", flex: 1 }}>
                <div style={{ fontSize: 8, color: EMBER }}>↓ EXHAUST</div>
                <div style={{ fontSize: 8, color: MUTED }}>Reaction</div>
              </div>
            </div>
          </div>

          {/* F = ṁ·vₑ live */}
          <MomentumEquation phase={phase} />

          {/* Bio-propellants */}
          <div style={panelBox}>
            {topLine(GREEN)}
            <SH label="Bio-Propellants" color={GREEN} />
            {BIO_PROPS.map(bp => (
              <div key={bp.name} style={{ marginBottom: 7 }}>
                <div style={{ fontSize: 9, color: bp.color, fontWeight: "bold", letterSpacing: 1 }}>{bp.name}</div>
                <div style={{ fontSize: 8, color: DIM, lineHeight: 1.5 }}>{bp.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Nozzle canvas */}
          <div style={{ ...panelBox, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "8px 12px 4px", borderBottom: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 8, letterSpacing: "0.15em", color: DIM, textTransform: "uppercase", display: "inline-block", marginRight: 12 }}>
                Convergent-Divergent Nozzle · {phase.name}
              </div>
              <span style={{ fontSize: 8, fontFamily: body, color: phase.color }}>{phase.propMode}</span>
            </div>
            <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: 160 }} />
          </div>

          {/* Mass flow chart */}
          <div style={{ ...panelBox, padding: "10px 12px" }}>
            <SH label="Supersonic Engine Mass Flow vs. Reaction Force" color={GOLD} />
            <MassFlowChart activePhase={phase} />
            <div style={{ fontSize: 8, color: MUTED, marginTop: 6, fontFamily: body, fontStyle: "italic", lineHeight: 1.5 }}>
              As mass flow rate increases in the supersonic regime, the reaction force (thrust) increases proportionally due to the momentum of exhaust gases. Colored dot = current drive phase.
            </div>
          </div>

          {/* Active phase detail */}
          <div style={{ ...panelBox, border: `1px solid ${phase.color}50` }}>
            {topLine(phase.color)}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div>
                <div style={{ fontFamily: serif, fontSize: 16, color: phase.color, letterSpacing: 1 }}>{phase.name}</div>
                <div style={{ fontSize: 9, color: DIM }}>{phase.sub}</div>
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[["ṁ", phase.massFlow+" kg/s", GREEN],["P", phase.chamberBar+" bar", GOLD],["F", (phase.thrustN/1e6).toFixed(2)+" MN", phase.color]].map(([k,v,c])=>(
                  <div key={k as string} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 7, color: DIM }}>{k as string}</div>
                    <div style={{ fontSize: 11, color: c as string, fontWeight: "bold" }}>{v as string}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontFamily: body, fontSize: 12, color: TEXT, lineHeight: 1.7 }}>{phase.desc}</div>
          </div>

          {/* Infinity loop cycle diagram */}
          <div style={panelBox}>
            {topLine(CYAN)}
            <SH label="Infinity Loop Cycle · Propulsion State Map" color={CYAN} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", padding: "8px 0", gap: 4 }}>
              {PHASES.map((p, i) => (
                <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <div
                    onClick={() => setActiveIdx(p.id)}
                    style={{
                      textAlign: "center", cursor: "pointer",
                      padding: "6px 8px",
                      border: `1px solid ${activeIdx === p.id ? p.color : BORDER}`,
                      background: activeIdx === p.id ? `${p.color}12` : "transparent",
                      borderRadius: 2, transition: "all 0.2s", minWidth: 72,
                    }}
                  >
                    <div style={{ fontSize: 8, fontWeight: "bold", color: p.color, letterSpacing: 1 }}>{p.name}</div>
                    <div style={{ fontSize: 7, color: DIM, marginTop: 2 }}>{p.massFlow} kg/s</div>
                    <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: BORDER, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${(p.massFlow/600)*100}%`, background: p.color, borderRadius: 2 }} />
                    </div>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div style={{ fontSize: 10, color: DIM }}>→</div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 8, color: DIM, fontFamily: body, fontStyle: "italic", textAlign: "center", marginTop: 4 }}>
              Mass flow bar = propulsion intensity at each origami drive phase
            </div>
          </div>
        </div>

        {/* ══ RIGHT PANEL ══ */}
        <div>
          {/* Raptor performance table */}
          <div style={panelBox}>
            {topLine(EMBER)}
            <SH label="Raptor Engine · Performance Reference" color={EMBER} />
            <div style={{ fontFamily: serif, fontSize: 11, color: GOLD, marginBottom: 8 }}>SpaceX Raptor 2 · Bio-equivalent</div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 9 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                  {["Parameter","Value","Unit"].map(h=>(
                    <th key={h} style={{ textAlign:"left", padding:"3px 4px", color:DIM, fontWeight:"normal", letterSpacing:1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RAPTOR.map(([param,val,unit])=>(
                  <tr key={param} style={{ borderBottom:`1px solid ${BORDER}` }}>
                    <td style={{ padding:"4px 4px", color:TEXT, fontSize:8 }}>{param}</td>
                    <td style={{ padding:"4px 4px", color:GOLD2, fontFamily:serif, fontSize:10 }}>{val}</td>
                    <td style={{ padding:"4px 4px", color:DIM, fontSize:8 }}>{unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 10, padding: "6px 8px", background:"rgba(200,168,76,0.06)", border:`1px solid ${GOLD}25`, borderRadius:2 }}>
              <div style={{ fontFamily: serif, fontSize: 11, color: GOLD, letterSpacing:1 }}>2.3 × 10⁶ N ≈ 600 kg/s × 3,800 m/s</div>
              <div style={{ fontSize:8, color:DIM, marginTop:2 }}>Thrust = Mass Flow Rate × Exhaust Velocity</div>
            </div>
          </div>

          {/* Origami drone specs */}
          <div style={panelBox}>
            {topLine(CYAN)}
            <SH label="Infinity Loop Drone · System Specs" color={CYAN} />
            {[
              ["Length (compact)","0.8–1.2 m"],["Width (compact)","0.6–0.8 m"],
              ["Length (deployed)","3.5–5.0 m"],["Width (deployed)","2.5–4.0 m"],
              ["Propulsion","Electric / Bio-Hybrid"],["Endurance","12–48 hrs"],
              ["Depth rating","100 m+"],["Temp range","-10°C to 50°C"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"3px 0", borderBottom:`1px solid ${BORDER}` }}>
                <span style={{ fontSize:8, color:DIM }}>{k}</span>
                <span style={{ fontSize:8, color:TEXT }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Compression system */}
          <div style={panelBox}>
            {topLine(VIOLET)}
            <SH label="Compression System" color={VIOLET} />
            {["Hydraulic / Electric Actuators","Interlocking Panels","Pressure Seal","Ballast Adjustment","Shape Memory Composite Joints"].map(s=>(
              <div key={s} style={{ fontSize:8, color:TEXT, padding:"3px 0", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:VIOLET, fontSize:9 }}>◆</span>{s}
              </div>
            ))}
          </div>

          {/* Mission modules */}
          <div style={panelBox}>
            {topLine(GREEN)}
            <SH label="Mission Modules" color={GREEN} />
            {[
              [GREEN,"ISR Sensors + EO/IR Cameras"],
              [CYAN,"LiDAR / SAR Mapping"],
              [VIOLET,"Comms Relay + Mesh Net"],
              [GOLD,"Weapon / Tool Bay"],
              [EMBER,"Environmental Sampling"],
            ].map(([c,s])=>(
              <div key={s as string} style={{ fontSize:8, color:TEXT, padding:"3px 0", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:c as string, fontSize:9 }}>●</span>{s as string}
              </div>
            ))}
          </div>

          {/* AETHER synthesis note */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}40` }}>
            {topLine()}
            <SH label="AETHER Synthesis" color={GOLD} />
            <div style={{ fontFamily:body, fontSize:11, color:TEXT, lineHeight:1.7 }}>
              The bio-propellant engine is not merely a fuel substitution — it is the <span style={{color:GOLD}}>momentum substrate</span> of the drone's lifecycle. Each phase transition (EXPAND → OPERATE → COMPRESS → TRANSIT → REPEAT) is a Newton event: a specific ṁ × vₑ configuration that drives structural state change. <span style={{color:CYAN}}>The nozzle IS the origami hinge.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

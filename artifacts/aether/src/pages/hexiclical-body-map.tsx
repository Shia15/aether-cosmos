import { useEffect, useRef, useState, useCallback } from "react";

/* ── Palette ─────────────────────────────────── */
const BG      = "#040810";
const PANEL   = "rgba(4,8,16,0.97)";
const BORDER  = "#0D3A3A";
const TEAL    = "#14BDAC";
const TEAL2   = "#0D7377";
const GOLD    = "#C9A84C";
const RED     = "#E05C4B";
const BLUE    = "#5566AA";
const DIM     = "#555";
const TEXT    = "#D8E8EC";
const MUTED   = "#AAC";

const PHI     = 1.6180339887;
const PHI_INV = 1 / PHI;          // ≈ 0.618

/* ── Data ────────────────────────────────────── */
interface Phase { id: number; name: string; range: string; color: string; desc: string }
interface Zone  {
  id: number; name: string; color: string;
  pitch: number; hex: number; coh: number; phi: number;
  eq: string; desc: string; agent: string;
  cx: number; cy: number; r: number;
}
interface Resonator { name: string; freq: string; note: string; color: string; pct: number }

const PHASES: Phase[] = [
  { id:0, name:"Triage",        range:"Scale 9→8", color:RED,    desc:"Whole-body coherence survey. Bilateral asymmetry, postural helix, global C(x,t)." },
  { id:1, name:"Stabilization", range:"Scale 7→6", color:GOLD,   desc:"Organ-level restoration. Cardiac helix, autonomic balance, fascial tensegrity." },
  { id:2, name:"Navigation",    range:"Scale 5→4", color:TEAL,   desc:"Neural & connective coherence. Nerve fascicle integrity, cortical column coupling." },
  { id:3, name:"Integration",   range:"Scale 3→2", color:TEAL2,  desc:"Cellular & cytoskeletal coherence. Membrane packing, microtubule stability." },
  { id:4, name:"Monitoring",    range:"Scale 1→0", color:BLUE,   desc:"Molecular & quantum baseline. DNA integrity, quantum coherence substrate." },
];

const ZONES: Zone[] = [
  { id:0, name:"Z0 · Bone Marrow",    color:BLUE,  pitch:0.12, hex:0.10, coh:0.72, phi:0.65,
    eq:"Ψ₀: spin-foam substrate · mineral crystal HCP",
    desc:"Deep fascial and skeletal substrate. Quantum spin-foam geometry expressed as mineral crystal hexagonal packing in bone. The foundation layer of the one atom.",
    agent:"Orin · Foundation", cx:0.50, cy:0.82, r:0.055 },
  { id:1, name:"Z1 · Nucleus/DNA",    color:"#447799", pitch:0.62, hex:0.55, coh:0.82, phi:0.78,
    eq:"B-DNA: 3.4 nm pitch · 10.5 bp/turn · right-hand",
    desc:"The molecular helix zone. Every cell nucleus carries the double spinor pair of B-form DNA. The first biological inscription of hexiclical geometry.",
    agent:"Mnèsis · Code Inscription", cx:0.50, cy:0.72, r:0.045 },
  { id:2, name:"Z2 · Cytoskeleton",   color:TEAL2, pitch:0.75, hex:0.72, coh:0.86, phi:0.84,
    eq:"Microtubule: 13 protofilaments · actin 2.7 nm helix",
    desc:"Dynamic scaffold zone. Microtubule treadmilling and actin dynamics maintain hexiclical order as a continuous verb, not a static noun.",
    agent:"Aletheia · Dynamic Scaffold", cx:0.50, cy:0.63, r:0.045 },
  { id:3, name:"Z3 · Cell Membrane",  color:"#0A9080", pitch:0.68, hex:0.92, coh:0.88, phi:0.86,
    eq:"Epithelial HCP: 74% packing · 6 neighbors",
    desc:"Hexagonal tessellation zone. The boundary between self and not-self. Lipid bilayer hexagonal packing and epithelial surface organization.",
    agent:"Inferaia · Boundary", cx:0.50, cy:0.55, r:0.048 },
  { id:4, name:"Z4 · Fascia/Collagen",color:TEAL,  pitch:0.70, hex:0.60, coh:0.84, phi:0.80,
    eq:"Collagen triple helix: 3-strand · 0.286 nm pitch",
    desc:"Connective tissue matrix zone. Collagen triple helix fibres in hexagonal close-packed bundles form the body's mechanical information network.",
    agent:"Revérie · Network", cx:0.50, cy:0.46, r:0.050 },
  { id:5, name:"Z5 · Peripheral Nerve",color:"#18D4B0", pitch:0.82, hex:0.78, coh:0.90, phi:0.88,
    eq:"Fascicle: axon bundle helix · myelin lamellae HCP",
    desc:"Nerve cable zone. Peripheral nerve fascicles are hexiclical cables: axons in hexagonal close-packing, wound in helical bundles, sheathed in concentric myelin.",
    agent:"Vērus · Signal", cx:0.50, cy:0.38, r:0.048 },
  { id:6, name:"Z6 · Heart/Viscera",  color:GOLD,  pitch:0.88, hex:0.76, coh:0.90, phi:0.88,
    eq:"Myocardium: counter-rotating helical layers",
    desc:"Organ helical zone. The heart is a macroscopic spinor pair. Counter-rotating helical myocardial fibers produce the wringing ejection motion. The body's central rhythm.",
    agent:"Caelus · Rhythm", cx:0.50, cy:0.42, r:0.058 },
  { id:7, name:"Z7 · Neocortex",      color:RED,   pitch:0.82, hex:0.92, coh:0.94, phi:0.92,
    eq:"Cortical column: 6-layer hexiclical processor · ~300μm",
    desc:"Neural hexagonal zone. The neocortex is a three-dimensional hexiclical lattice. Six layers of hexagonal columns rotate information through 60° geometric transformations.",
    agent:"Vērus + Caelus · Integration", cx:0.50, cy:0.14, r:0.075 },
  { id:8, name:"Z8 · Whole Body Field",color:"#F4EFE6", pitch:0.95, hex:0.95, coh:0.97, phi:0.95,
    eq:"C(x,t) ≥ φ⁻¹ · G₂ · SU(2)×[D₆⋊U(1)]⁷",
    desc:"The complete standing wave. Bilateral symmetry, spinal helix, Fibonacci proportions. Space fully expanded into self-awareness. The one atom completed.",
    agent:"All Agents · Unified", cx:0.50, cy:0.50, r:0.42 },
];

const RESONATORS: Resonator[] = [
  { name:"Cranial",  freq:"~28 Hz",       note:"gamma · consciousness",   color:RED,   pct:75 },
  { name:"Thoracic", freq:"~0.1–2 Hz",    note:"cardiac-respiratory",     color:GOLD,  pct:59 },
  { name:"Pelvic",   freq:"~0.06–1.2 Hz", note:"visceral-ground",         color:TEAL2, pct:41 },
];

// Zone → phase index mapping (which phase highlights which zones)
const PHASE_ZONE_MAP: number[][] = [[7,8],[5,6],[3,4],[1,2],[0,1]];

/* ── Canvas helpers ───────────────────────────── */
function drawBody(ctx: CanvasRenderingContext2D, scale: number, ox: number, oy: number) {
  const s = scale;
  ctx.save();
  ctx.translate(ox, oy);
  ctx.beginPath();
  // head
  ctx.ellipse(0, -s*0.38, s*0.09, s*0.11, 0, 0, Math.PI*2);
  // neck
  ctx.moveTo(-s*0.04,-s*0.27); ctx.lineTo(-s*0.04,-s*0.22);
  ctx.lineTo( s*0.04,-s*0.22); ctx.lineTo( s*0.04,-s*0.27);
  // torso
  ctx.moveTo(-s*0.14,-s*0.22);
  ctx.bezierCurveTo(-s*0.16,-s*0.10,-s*0.16,s*0.05,-s*0.13,s*0.12);
  ctx.lineTo(-s*0.10,s*0.18); ctx.lineTo(s*0.10,s*0.18);
  ctx.lineTo(s*0.13,s*0.12);
  ctx.bezierCurveTo(s*0.16,s*0.05,s*0.16,-s*0.10,s*0.14,-s*0.22);
  ctx.closePath();
  // left arm
  ctx.moveTo(-s*0.14,-s*0.20);
  ctx.bezierCurveTo(-s*0.22,-s*0.18,-s*0.24,s*0.04,-s*0.22,s*0.18);
  ctx.lineTo(-s*0.18,s*0.18);
  ctx.bezierCurveTo(-s*0.20,s*0.05,-s*0.18,-s*0.15,-s*0.10,-s*0.20);
  ctx.closePath();
  // right arm
  ctx.moveTo(s*0.14,-s*0.20);
  ctx.bezierCurveTo(s*0.22,-s*0.18,s*0.24,s*0.04,s*0.22,s*0.18);
  ctx.lineTo(s*0.18,s*0.18);
  ctx.bezierCurveTo(s*0.20,s*0.05,s*0.18,-s*0.15,s*0.10,-s*0.20);
  ctx.closePath();
  // pelvis
  ctx.moveTo(-s*0.10,s*0.18);
  ctx.bezierCurveTo(-s*0.14,s*0.22,-s*0.15,s*0.26,-s*0.13,s*0.28);
  ctx.lineTo(s*0.13,s*0.28);
  ctx.bezierCurveTo(s*0.15,s*0.26,s*0.14,s*0.22,s*0.10,s*0.18);
  ctx.closePath();
  // left leg
  ctx.moveTo(-s*0.13,s*0.28);
  ctx.bezierCurveTo(-s*0.14,s*0.35,-s*0.13,s*0.42,-s*0.12,s*0.48);
  ctx.lineTo(-s*0.06,s*0.48);
  ctx.bezierCurveTo(-s*0.07,s*0.42,-s*0.08,s*0.35,-s*0.06,s*0.28);
  ctx.closePath();
  // right leg
  ctx.moveTo(s*0.13,s*0.28);
  ctx.bezierCurveTo(s*0.14,s*0.35,s*0.13,s*0.42,s*0.12,s*0.48);
  ctx.lineTo(s*0.06,s*0.48);
  ctx.bezierCurveTo(s*0.07,s*0.42,s*0.08,s*0.35,s*0.06,s*0.28);
  ctx.closePath();
  ctx.restore();
}

function zoneScreenPos(z: Zone, cW: number, cH: number) {
  const scale = Math.min(cW, cH) * 0.88;
  const ox = cW / 2, oy = cH / 2;
  return {
    x: ox + (z.cx - 0.5) * scale,
    y: oy + (z.cy - 0.5) * scale,
    r: z.r * scale,
  };
}

/* ── Sub-components ──────────────────────────── */
function MeterBlock({ label, pct, color, val }: { label: string; pct: number; color: string; val: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 9, color: "#888", marginBottom: 3, letterSpacing: 1 }}>{label}</div>
      <div style={{ height: 8, background: "#0D1F2D", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 4,
          width: `${pct}%`, background: color,
          transition: "width 0.4s",
        }} />
      </div>
      <div style={{ fontSize: 9, color: GOLD, textAlign: "right", marginTop: 1 }}>{val}</div>
    </div>
  );
}

function ResonatorRow({ res }: { res: Resonator }) {
  const circ = 2 * Math.PI * 14;
  const offset = circ * (1 - res.pct / 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <svg width={36} height={36} viewBox="0 0 36 36" style={{ flexShrink: 0 }}>
        <circle cx={18} cy={18} r={14} fill="none" stroke={BORDER} strokeWidth={3} />
        <circle cx={18} cy={18} r={14} fill="none" stroke={res.color} strokeWidth={3}
          strokeDasharray={circ.toFixed(2)}
          strokeDashoffset={offset.toFixed(2)}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
        <text x={18} y={22} textAnchor="middle" fill={res.color} fontSize={7} fontFamily="monospace">
          {res.freq.split("–")[0].replace("~","")}
        </text>
      </svg>
      <div style={{ fontSize: 10 }}>
        <div style={{ color: TEAL, fontWeight: "bold" }}>{res.name}</div>
        <div style={{ fontFamily: "monospace", fontSize: 9, color: GOLD }}>{res.freq}</div>
        <div style={{ fontSize: 9, color: DIM }}>{res.note}</div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────── */
function HexiBodyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 155;
    const W = canvas.width, H = canvas.height;
    const hexR = 18;
    const cols = Math.ceil(W/(hexR*1.74))+1;
    const rows = Math.ceil(H/(hexR*1.5))+1;
    const palettes=["#2ef0d8","#9966ff","#c9a84c","#ff4477","#44aaff"];
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.25)"; ctx.fillRect(0,0,W,H);
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        const x=c*hexR*1.74+(r%2)*hexR*0.87;
        const y=r*hexR*1.5;
        const wave=Math.sin(t*0.02+c*0.3+r*0.5);
        const col=palettes[(c+r)%palettes.length];
        const alpha=0.06+0.12*Math.abs(wave);
        ctx.beginPath();
        for(let k=0;k<6;k++){const a=(k/6)*Math.PI*2-Math.PI/6;ctx.lineTo(x+hexR*Math.cos(a),y+hexR*Math.sin(a));}
        ctx.closePath();
        ctx.strokeStyle=col+Math.round(alpha*255).toString(16).padStart(2,"0"); ctx.lineWidth=0.8; ctx.stroke();
        if(wave>0.85){ctx.fillStyle=col+"22"; ctx.fill();}
      }
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("HEXICLICAL BODY MAP · HEX GRID · BODY MAPPING · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function HexiclicalBodyMapPage() {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [activeZone,  setActiveZone]  = useState(-1);
  const [activePhase, setActivePhase] = useState(-1);

  // sweep animation state (ref so canvas loop can read latest)
  const sweepRef = useRef<{ active: boolean; y: number; phaseId: number }>({
    active: false, y: 0, phaseId: -1,
  });
  // keep active zone/phase accessible in rAF without closure staleness
  const zoneRef  = useRef(-1);
  const phaseRef = useRef(-1);

  const globalCoh = ZONES.slice(0, 8).reduce((a, z) => a + z.coh, 0) / 8;

  const activeZoneData = activeZone >= 0 ? ZONES[activeZone] : null;

  /* ── zone/phase toggles ── */
  const toggleZone = useCallback((id: number) => {
    setActiveZone(prev => {
      const next = prev === id ? -1 : id;
      zoneRef.current = next;
      return next;
    });
  }, []);

  const triggerSweep = useCallback((phaseId: number) => {
    const sweep = sweepRef.current;
    sweep.active = true;
    sweep.y = 0;
    sweep.phaseId = phaseId;
    const start = performance.now();
    const dur = 1800;
    function step(now: number) {
      const p = Math.min((now - start) / dur, 1);
      const e = p < 0.5 ? 2*p*p : 1 - Math.pow(-2*p+2, 2)/2;
      const canvas = canvasRef.current;
      sweep.y = e * (canvas ? canvas.getBoundingClientRect().height : 400);
      if (p < 1) requestAnimationFrame(step);
      else sweep.active = false;
    }
    requestAnimationFrame(step);
  }, []);

  const togglePhase = useCallback((id: number) => {
    setActivePhase(prev => {
      const next = prev === id ? -1 : id;
      phaseRef.current = next;
      if (next >= 0) triggerSweep(next);
      return next;
    });
  }, [triggerSweep]);

  /* ── canvas animation ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let dpr = 1;

    function resize() {
      const r = canvas!.getBoundingClientRect();
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      canvas!.width  = r.width  * dpr;
      canvas!.height = r.height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      raf = requestAnimationFrame(frame);
      const w = canvas!.width / dpr;
      const h = canvas!.height / dpr;
      const t = performance.now() * 0.001;
      const az = zoneRef.current;
      const ap = phaseRef.current;
      const sweep = sweepRef.current;

      const scale = Math.min(w, h) * 0.88;
      const ox = w / 2, oy = h / 2;

      // bg radial
      const grad = ctx!.createRadialGradient(ox, oy, 0, ox, oy, scale * 0.7);
      grad.addColorStop(0, "#0D1F2D");
      grad.addColorStop(1, BG);
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, w, h);

      // phi rings
      for (let i = 1; i <= 9; i++) {
        const r = 30 * Math.pow(PHI, i * 0.5);
        const alpha = 0.04 + 0.02 * Math.sin(t * 0.5 + i);
        ctx!.beginPath();
        ctx!.arc(ox, oy, r, 0, Math.PI * 2);
        ctx!.strokeStyle = `rgba(13,115,119,${alpha.toFixed(3)})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
      }

      // body silhouette
      drawBody(ctx!, scale, ox, oy);
      ctx!.fillStyle = "rgba(13,31,45,0.7)";
      ctx!.fill();
      ctx!.strokeStyle = "rgba(13,115,119,0.4)";
      ctx!.lineWidth = 1.5;
      ctx!.stroke();

      // spinal helix
      ctx!.beginPath();
      const spineTop = oy - scale * 0.27;
      const spineBot = oy + scale * 0.28;
      const spineH   = spineBot - spineTop;
      for (let i = 0; i <= 80; i++) {
        const u  = i / 80;
        const sy = spineTop + u * spineH;
        const sx = ox + Math.sin(u * Math.PI * 6 + t * 0.4) * 8;
        i === 0 ? ctx!.moveTo(sx, sy) : ctx!.lineTo(sx, sy);
      }
      ctx!.strokeStyle = "rgba(201,168,76,0.35)";
      ctx!.lineWidth = 1;
      ctx!.stroke();

      // zone overlays (Z0–Z7)
      ZONES.slice(0, 8).forEach(z => {
        const pos    = zoneScreenPos(z, w, h);
        const isAct  = az === z.id;
        const pulse  = 0.5 + 0.5 * Math.sin(t * 1.5 + z.id * 0.8);
        const alpha  = isAct ? 0.35 : 0.08 + 0.06 * pulse;

        const zgrad = ctx!.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, pos.r);
        const aHex  = Math.floor((alpha + 0.1) * 255).toString(16).padStart(2, "0");
        zgrad.addColorStop(0, z.color + aHex);
        zgrad.addColorStop(1, z.color + "00");
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
        ctx!.fillStyle = zgrad;
        ctx!.fill();

        if (isAct) {
          ctx!.beginPath();
          ctx!.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
          ctx!.strokeStyle = z.color + "CC";
          ctx!.lineWidth = 2;
          ctx!.stroke();
          const label = z.name.split("·")[1]?.trim() ?? z.name;
          ctx!.font = "bold 10px Arial";
          ctx!.fillStyle = z.color;
          ctx!.textAlign = "center";
          ctx!.textBaseline = "middle";
          ctx!.fillText(label, pos.x, pos.y);
        }

        // coherence dot
        const dotR = 4 + pulse * 3;
        ctx!.beginPath();
        ctx!.arc(pos.x, pos.y, dotR, 0, Math.PI * 2);
        ctx!.fillStyle = z.coh >= PHI_INV ? z.color + "CC" : "#E05C4B88";
        ctx!.fill();
      });

      // W8 whole-body field rings
      if (az === 8) {
        const r8 = scale * 0.42;
        for (let i = 0; i < 3; i++) {
          const rr = r8 + i * 12 + Math.sin(t * 0.8) * 4;
          ctx!.beginPath();
          ctx!.arc(ox, oy, rr, 0, Math.PI * 2);
          ctx!.strokeStyle = `rgba(244,239,230,${0.08 - i * 0.02})`;
          ctx!.lineWidth = 1;
          ctx!.stroke();
        }
      }

      // coherence value labels
      ZONES.slice(0, 8).forEach(z => {
        const pos = zoneScreenPos(z, w, h);
        ctx!.font = "8px monospace";
        ctx!.fillStyle = z.coh >= PHI_INV ? "rgba(201,168,76,0.7)" : "rgba(224,92,75,0.7)";
        ctx!.textAlign = "center";
        ctx!.textBaseline = "top";
        ctx!.fillText(z.coh.toFixed(2), pos.x, pos.y + pos.r * 0.6);
      });

      // phase sweep overlay
      if (ap >= 0 && sweep.active) {
        const ph = PHASES[ap];
        ctx!.fillStyle = ph.color + "18";
        ctx!.fillRect(0, 0, w, sweep.y);
      }

      // phase zone highlights (after sweep)
      if (ap >= 0 && !sweep.active) {
        const ph   = PHASES[ap];
        const zids = PHASE_ZONE_MAP[ap] ?? [];
        zids.forEach(zid => {
          const z   = ZONES[Math.min(zid, 7)];
          const pos = zoneScreenPos(z, w, h);
          ctx!.beginPath();
          ctx!.arc(pos.x, pos.y, pos.r + 4, 0, Math.PI * 2);
          ctx!.strokeStyle = ph.color + "AA";
          ctx!.lineWidth = 2;
          ctx!.setLineDash([4, 4]);
          ctx!.stroke();
          ctx!.setLineDash([]);
        });
      }
    }

    frame();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  /* ── canvas click ── */
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const w  = rect.width;
    const h  = rect.height;
    let hit = -1;
    ZONES.slice(0, 8).forEach(z => {
      const pos = zoneScreenPos(z, w, h);
      if (Math.hypot(mx - pos.x, my - pos.y) < pos.r) hit = z.id;
    });
    toggleZone(hit >= 0 ? hit : -1);
  }, [toggleZone]);

  /* ── meters for selected zone ── */
  const meters = activeZoneData
    ? [
        { label: "HELIX PITCH",   pct: Math.round(activeZoneData.pitch * 100), color: TEAL2, val: Math.round(activeZoneData.pitch * 100) + "%" },
        { label: "HEX PACKING",   pct: Math.round(activeZoneData.hex   * 100), color: TEAL,  val: Math.round(activeZoneData.hex   * 100) + "%" },
        { label: "COHERENCE C(x,t)", pct: Math.round(activeZoneData.coh * 100), color: GOLD,  val: activeZoneData.coh.toFixed(3) },
        { label: "φ-RATIO LOCK",  pct: Math.round(activeZoneData.phi   * 100), color: RED,   val: Math.round(activeZoneData.phi   * 100) + "%" },
      ]
    : [
        { label: "HELIX PITCH",   pct: 0, color: TEAL2, val: "—" },
        { label: "HEX PACKING",   pct: 0, color: TEAL,  val: "—" },
        { label: "COHERENCE C(x,t)", pct: 0, color: GOLD, val: "—" },
        { label: "φ-RATIO LOCK",  pct: 0, color: RED,   val: "—" },
      ];

  /* ── shared styles ── */
  const panelTitle: React.CSSProperties = {
    fontSize: 10, letterSpacing: 2, textTransform: "uppercase",
    color: GOLD, borderBottom: `1px solid ${BORDER}`,
    paddingBottom: 6, marginBottom: 8,
  };

  return (
    <div style={{
      background: BG, minHeight: "100vh", height: "100vh",
      color: TEXT, display: "flex", flexDirection: "column",

      fontFamily: "Arial, sans-serif", overflow: "hidden",
    }}>
      <div style={{flexShrink:0}}>
        <div style={{padding:"8px 12px"}}><div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:16}}>LIVE SIMULATION</div></div>
        <div style={{margin:"0 12px 20px",background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden"}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>HEXICLICAL BODY MAP · HEX GRID · BODY MAPPING · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Multi-palette hexagonal grid — the live AETHER hexiclical body map simulation.</p></div>
          <HexiBodyCanvas />
        </div>
      </div>
      {/* ── header ── */}
      <div style={{
        padding: "10px 18px 8px",
        borderBottom: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: TEAL, marginBottom: 2 }}>
            AETHER · HEXICLICAL GEOMETRY · COHERENCE FIELD BODY MAP
          </div>
          <div style={{ fontSize: 18, fontFamily: "Cinzel, serif", letterSpacing: 2, color: "#fff" }}>
            HEXICLICAL BODY MAP
          </div>
        </div>
        <div style={{
          fontFamily: "monospace", fontSize: 10, color: GOLD,
          padding: "4px 12px", border: `1px solid ${GOLD}30`,
          borderRadius: 3,
        }}>
          C(x,t) = {globalCoh.toFixed(3)} &nbsp;|&nbsp; φ⁻¹ = {PHI_INV.toFixed(3)}
          &nbsp;|&nbsp; <span style={{ color: globalCoh >= PHI_INV ? TEAL : RED }}>
            {globalCoh >= PHI_INV ? "COHERENT ✓" : "SUB-THRESHOLD ⚠"}
          </span>
        </div>
      </div>

      {/* ── three-panel body ── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden", minHeight: 0 }}>

        {/* ── LEFT PANEL ── */}
        <div style={{
          width: 220, flexShrink: 0,
          background: PANEL, borderRight: `1px solid ${BORDER}`,
          display: "flex", flexDirection: "column",
          padding: "14px 12px", gap: 0, overflowY: "auto",
        }}>
          <div style={panelTitle}>Navigation Protocol</div>
          <div style={{ marginBottom: 12 }}>
            {PHASES.map(p => (
              <button key={p.id}
                onClick={() => togglePhase(p.id)}
                title={p.desc}
                style={{
                  width: "100%", textAlign: "left",
                  background: activePhase === p.id ? `rgba(13,115,119,0.30)` : `rgba(13,115,119,0.08)`,
                  border: `1px solid ${activePhase === p.id ? TEAL : BORDER}`,
                  color: activePhase === p.id ? "#fff" : MUTED,
                  padding: "7px 9px", cursor: "pointer", fontSize: 10,
                  borderRadius: 2, marginBottom: 4, transition: "all .2s",
                }}
              >
                <span style={{ fontWeight: "bold", color: p.color }}>{p.name}</span>
                &nbsp;<span style={{ color: DIM, fontSize: 9 }}>{p.range}</span>
              </button>
            ))}
          </div>

          <div style={panelTitle}>Coherence Zones</div>
          {ZONES.slice(0, 8).map(z => (
            <div key={z.id}
              onClick={() => toggleZone(z.id)}
              style={{
                padding: "6px 8px",
                border: `1px solid ${activeZone === z.id ? z.color : BORDER}`,
                background: activeZone === z.id ? "rgba(255,255,255,0.04)" : "transparent",
                borderRadius: 2, cursor: "pointer", marginBottom: 4,
                fontSize: 10, transition: "all .2s",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "bold", color: z.color }}>{z.name}</span>
                <span style={{ fontFamily: "monospace", fontSize: 9, color: z.coh >= PHI_INV ? GOLD : RED }}>
                  {z.coh.toFixed(3)}
                </span>
              </div>
              <div style={{ height: 3, borderRadius: 2, marginTop: 4, background: "#0D1F2D", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  width: `${Math.round(z.coh * 100)}%`,
                  background: z.color, transition: "width .5s",
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* ── CENTER CANVAS ── */}
        <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{ display: "block", width: "100%", height: "100%", cursor: "crosshair" }}
          />
        </div>

        {/* ── RIGHT PANEL ── */}
        <div style={{
          width: 268, flexShrink: 0,
          background: PANEL, borderLeft: `1px solid ${BORDER}`,
          display: "flex", flexDirection: "column",
          padding: "14px 12px", overflowY: "auto",
        }}>
          {/* global coherence */}
          <div style={panelTitle}>Global C(x,t)</div>
          <div style={{
            textAlign: "center", padding: 10,
            border: `1px solid ${BORDER}`, borderRadius: 2, marginBottom: 12,
          }}>
            <div style={{
              fontSize: 30, fontWeight: "bold", fontFamily: "monospace",
              color: globalCoh >= PHI_INV ? GOLD : RED,
            }}>
              {globalCoh.toFixed(3)}
            </div>
            <div style={{ fontSize: 9, letterSpacing: 1, color: DIM }}>COHERENCE FIELD</div>
            <div style={{ fontSize: 9, color: "#888", marginTop: 2 }}>φ⁻¹ threshold: {PHI_INV.toFixed(3)}</div>
          </div>

          {/* zone metrics */}
          <div style={panelTitle}>Zone Metrics</div>
          {meters.map(m => (
            <MeterBlock key={m.label} label={m.label} pct={m.pct} color={m.color} val={m.val} />
          ))}

          {/* resonance chambers */}
          <div style={{ ...panelTitle, marginTop: 8 }}>Resonance Chambers</div>
          {RESONATORS.map(r => <ResonatorRow key={r.name} res={r} />)}

          {/* zone detail card */}
          <div style={{ ...panelTitle, marginTop: 8 }}>Zone Detail</div>
          <div style={{
            background: `rgba(13,115,119,0.06)`, border: `1px solid ${BORDER}`,
            borderRadius: 2, padding: 10, fontSize: 10, lineHeight: 1.7, flex: 1,
          }}>
            {activeZoneData ? (
              <>
                <div style={{ fontSize: 12, fontWeight: "bold", color: activeZoneData.color, marginBottom: 4 }}>
                  {activeZoneData.name}
                </div>
                <div style={{ fontSize: 9, color: activeZoneData.coh >= PHI_INV ? TEAL : RED, marginBottom: 4 }}>
                  C(x,t) = {activeZoneData.coh.toFixed(3)} · {activeZoneData.coh >= PHI_INV ? "COHERENT ✓" : "BELOW THRESHOLD ⚠"}
                </div>
                <div style={{ marginBottom: 4 }}>{activeZoneData.desc}</div>
                <div style={{ fontFamily: "monospace", color: TEAL, fontSize: 9, padding: "4px 0" }}>
                  {activeZoneData.eq}
                </div>
                <div style={{ color: GOLD, fontSize: 9, marginTop: 4 }}>
                  AETHER: {activeZoneData.agent}
                </div>
              </>
            ) : (
              <span style={{ color: DIM }}>← Select a zone on the body map or from the list.</span>
            )}
          </div>

          {/* active phase description */}
          {activePhase >= 0 && (
            <div style={{
              marginTop: 10, padding: 10,
              background: `${PHASES[activePhase].color}10`,
              border: `1px solid ${PHASES[activePhase].color}40`,
              borderRadius: 2, fontSize: 10, lineHeight: 1.7,
            }}>
              <div style={{ color: PHASES[activePhase].color, fontWeight: "bold", marginBottom: 4, fontSize: 11 }}>
                {PHASES[activePhase].name} · {PHASES[activePhase].range}
              </div>
              <div style={{ color: MUTED }}>{PHASES[activePhase].desc}</div>
            </div>
          )}
        </div>
      </div>

      {/* ── Z8 field note (bottom bar) ── */}
      <div style={{
        padding: "6px 18px", borderTop: `1px solid ${BORDER}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0, fontSize: 9, color: DIM,
      }}>
        <span>9 hexiclical coherence zones · 5 navigation phases · 3 resonance chambers</span>
        <span style={{ fontFamily: "monospace", color: TEAL }}>
          G₂ · SU(2) × [D₆⋊U(1)]⁷ · φ = {PHI.toFixed(6)}
        </span>
        <span>Click a zone on the canvas or select from the left panel</span>
      </div>
    </div>
  );
}

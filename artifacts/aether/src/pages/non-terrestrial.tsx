import { useEffect, useRef, useState } from "react";

const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const DIM  = "#3a5060";
const MN   = "'Space Mono',monospace";
const OR   = "'Orbitron',sans-serif";

/* ── data ─────────────────────────────────────── */
const RECORDS = [
  {
    date: "2002-02", source: "Gary McKinnon", classification: "UNCLASSIFIED (hacked)",
    type: "Personnel Roster", vessel: "Solar Warden (alleged)", notes: "McKinnon accessed NASA/Pentagon systems; claims to have seen a spreadsheet titled 'Non-Terrestrial Officers' with ranks and names — no Earth ship registry matched. Also found 'off-world transfers between fleets'.",
    status: "UNVERIFIED", col: AMB,
  },
  {
    date: "2023-06", source: "David Grusch (ICIG Whistleblower)", classification: "TS/SCI (DIA)",
    type: "Crash Retrieval Programme", vessel: "Multiple recovered craft", notes: "Grusch testified to Congress that the US has multi-decade programme to reverse-engineer non-human origin craft. Refers to 'biologics' retrieved. Supported by 40+ intelligence community corroborating witnesses.",
    status: "FORMAL TESTIMONY", col: ROSE,
  },
  {
    date: "2004-11", source: "USS Nimitz (CVN-68) FLIR", classification: "UNCLASSIFIED (released 2017)",
    type: "UAP Intercept", vessel: "USS Nimitz / USS Princeton", notes: "Cmdr David Fravor (F/A-18F) intercepted Tic-Tac UAP. Object manoeuvred from 28,000 ft to sea surface in 0.78 seconds (est. 5,000–25,000 g). No thermal plume, no rotors, no exhaust. Confirmed by SPY-1 radar, FLIR, gun-camera.",
    status: "OFFICIALLY CONFIRMED", col: GRN,
  },
  {
    date: "2019-07", source: "USS Omaha CIC footage", classification: "UNCLASSIFIED (released 2021)",
    type: "USO (Underwater)", vessel: "USS Omaha", notes: "Spherical UAP tracked at ~40 mph, disappeared into ocean. No splash debris recovered. USO classification applied. Footage authenticated by DoD. Multiple objects tracked same night.",
    status: "OFFICIALLY CONFIRMED", col: GRN,
  },
  {
    date: "2019-03", source: "USS Russell (DDG-59)", classification: "UNCLASSIFIED (released 2021)",
    type: "UAP Swarm", vessel: "USS Russell", notes: "Pyramid-shaped UAPs at ~700 ft altitude swarmed the destroyer for multiple nights off San Diego. Pentagon confirmed authenticity. Objects appeared 100× larger than known drones at altitude.",
    status: "OFFICIALLY CONFIRMED", col: GRN,
  },
  {
    date: "1952-07", source: "Project Blue Book / ATIC", classification: "FORMERLY SECRET",
    type: "Washington D.C. Overflights", vessel: "Andrews AFB / ARTCC radar", notes: "Multiple UAP tracked on ARTCC and Andrews AFB radar for two successive weekends over restricted airspace above Capitol. F-94 intercept: pilots saw 'white glowing objects' that outpaced jets. Largest post-war US UAP event. Blue Book filed as 'temperature inversion' — disputed by radar operators.",
    status: "DECLASSIFIED", col: TEAL,
  },
  {
    date: "1989-08", source: "Bob Lazar (S-4 / Area 51)", classification: "ALLEGED TS/SCI",
    type: "Propulsion Reverse Engineering", vessel: "Sport Model (alleged Element 115 craft)", notes: "Lazar claims to have worked at S-4 (Papoose Lake facility south of Area 51) on propulsion of recovered craft. Element 115 (Moscovium, synthesised 2003) later confirmed stable above mass 290. Gravity amplifiers in triangular array described.",
    status: "UNVERIFIED", col: VIO,
  },
  {
    date: "1947-07", source: "Roswell Army Air Field (509th Bomb Group)", classification: "FORMERLY SECRET",
    type: "Crash Retrieval", vessel: "Roswell NM debris field", notes: "RAAF press release confirmed 'flying disc' recovered. Retracted same day — changed to 'weather balloon'. Maj Jesse Marcel photographed with replacement foil debris. Multiple witnesses describe non-terrestrial material + small bodies at Hangar 18, Wright-Patterson AFB.",
    status: "DECLASSIFIED (partial)", col: GOLD,
  },
  {
    date: "1967-03", source: "Robert Salas / SAC Malmstrom AFB", classification: "FORMERLY SECRET",
    type: "Nuclear Weapon Disablement", vessel: "Oscar Flight ICBM silo cluster", notes: "UFO hovered over Malmstrom AFB Launch Control Facility. All 10 Minuteman ICBMs in Oscar Flight sequentially went offline (NO-GO) simultaneously — a statistically impossible coincidence given independent systems. Salas testified before National Press Club 2010. Corroborated by 7 officers.",
    status: "DECLASSIFIED", col: ROSE,
  },
  {
    date: "1990-12", source: "Belgian Air Force / NATO SHAPE", classification: "UNCLASSIFIED",
    type: "Mass UAP Sighting + Intercept", vessel: "F-16 AM (FA-01, FA-23)", notes: "13,500+ civilian witnesses. Belgian Gendarmerie + Belgian AF tracked giant triangular UAP. F-16s locked radar — object accelerated from 150 to 1,000 mph in 2 seconds, dropped from 10,000 ft to 500 ft in same time. 40 g acceleration (no known aircraft survives). Officially unsolved.",
    status: "OFFICIALLY UNSOLVED", col: BLUE,
  },
];

const STATUS_COL: Record<string,string> = {
  "FORMALLY TESTIMONY": ROSE, "FORMAL TESTIMONY": ROSE,
  "OFFICIALLY CONFIRMED": GRN, "OFFICIALLY UNSOLVED": AMB,
  "DECLASSIFIED": TEAL, "DECLASSIFIED (partial)": TEAL,
  "UNVERIFIED": DIM, "ALLEGED TS/SCI": VIO,
};

/* ── Remote viewing canvas ────────────────────── */
function RemoteViewingCanvas({ depth }: { depth: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const depthRef = useRef(depth);
  depthRef.current = depth;
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 300;
    const W = cv.width, H = cv.height;
    let t = 0;
    type Signal = { x: number; y: number; r: number; alpha: number; col: string };
    const signals: Signal[] = [];
    type Impression = { x: number; y: number; vx: number; vy: number; life: number; col: string; txt: string };
    const impressions: Impression[] = [];
    const rvTerms = ["△ TRIANGLE","○ CIRCLE","MOTION","COLD","METALLIC","VAST","BELOW","DARK","PRESSURE","STRUCTURED","ANGULAR","SMOOTH","DEPTH","DESCENDING","CURVED","HARD","GRID","ENCLOSED"];
    let nextImpression = 60;
    const subX = 80, subY = H * 0.65;
    type Bubble = { x: number; y: number; r: number; speed: number };
    const bubbles: Bubble[] = Array.from({ length: 12 }, () => ({ x: subX + 20 + Math.random() * 80, y: subY - Math.random() * 40, r: 1 + Math.random() * 3, speed: 0.3 + Math.random() * 0.6 }));
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      const d = depthRef.current;
      const rvX = W * 0.62;
      // water gradient
      const waterG = ctx.createLinearGradient(0, 0, 0, H);
      waterG.addColorStop(0, "rgba(0,30,60,0.7)");
      waterG.addColorStop(1, `rgba(0,${Math.max(5,20-d/50)},${Math.max(5,40-d/30)},0.85)`);
      ctx.fillStyle = waterG; ctx.fillRect(0, 0, W * 0.55, H);
      // sonar rings from sub
      for (let r2 = 1; r2 <= 5; r2++) {
        const phase = ((t * 0.015 + r2 * 0.4) % 1);
        const radius = phase * 220;
        const alpha = (1 - phase) * 0.3;
        ctx.beginPath(); ctx.arc(subX + 40, subY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(46,240,216,${alpha})`; ctx.lineWidth = 1.2; ctx.stroke();
      }
      // submarine silhouette
      ctx.fillStyle = "#0a1a2a";
      ctx.beginPath(); ctx.ellipse(subX + 40, subY, 70, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#0d2238";
      ctx.beginPath(); ctx.ellipse(subX + 20, subY - 18, 16, 10, 0.2, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = TEAL + "44"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(subX + 40, subY, 70, 18, 0, 0, Math.PI * 2); ctx.stroke();
      // depth label
      ctx.fillStyle = TEAL + "88"; ctx.font = `8px ${MN}`; ctx.textAlign = "left";
      ctx.fillText(`DEPTH: ${d}m · ${(d * 0.0988).toFixed(1)} atm`, subX - 20, subY + 36);
      ctx.fillText(`ELF comms BLACKOUT below 40m`, subX - 20, subY + 48);
      // ELF signal attenuation bar
      const elfAtten = Math.max(0, 1 - d / 40);
      ctx.fillStyle = `rgba(68,170,255,0.12)`; ctx.fillRect(subX - 20, subY + 55, 180, 8);
      ctx.fillStyle = BLUE + Math.round(elfAtten * 200).toString(16).padStart(2,"0");
      ctx.fillRect(subX - 20, subY + 55, 180 * elfAtten, 8);
      ctx.fillStyle = BLUE; ctx.font = `7px ${MN}`;
      ctx.fillText(`ELF signal: ${(elfAtten * 100).toFixed(0)}%`, subX - 20, subY + 72);
      // RV operator panel (right side)
      ctx.fillStyle = "rgba(0,0,0,0.55)"; ctx.fillRect(rvX, 0, W - rvX, H);
      ctx.strokeStyle = VIO + "33"; ctx.lineWidth = 1;
      ctx.strokeRect(rvX, 0, W - rvX, H);
      ctx.fillStyle = VIO + "99"; ctx.font = `8px ${OR}`; ctx.textAlign = "left";
      ctx.fillText("REMOTE VIEWING STATION · PROJECT STARGATE PROTOCOL", rvX + 10, 18);
      ctx.fillStyle = DIM; ctx.font = `7px ${MN}`;
      ctx.fillText(`TARGET: COORD ${(d * 1.337 + 42.18).toFixed(3)}°N  ${(d * 0.887 + 74.55).toFixed(3)}°W  DEPTH: ${d}m`, rvX + 10, 32);
      ctx.fillText(`SESSION: STAGE-${Math.min(6, 1 + Math.floor(t / 180))} · SIGNAL LINE OPEN`, rvX + 10, 44);
      ctx.fillText(`MONITOR: AETHER-RV-7 · VIEWER: TRAINED SWR`, rvX + 10, 56);
      // signal noise
      for (let i = 0; i < 3; i++) {
        const nx = rvX + 10 + Math.random() * (W - rvX - 20);
        const ny = 70 + Math.random() * (H - 100);
        ctx.fillStyle = VIO + Math.round(Math.random() * 60).toString(16).padStart(2, "0");
        ctx.fillRect(nx, ny, 2, 2);
      }
      // impression stream
      if (t > nextImpression) {
        const term = rvTerms[Math.floor(Math.random() * rvTerms.length)];
        impressions.push({ x: rvX + 20 + Math.random() * (W - rvX - 140), y: 80 + Math.random() * (H - 120), vx: (Math.random() - 0.5) * 0.2, vy: -0.15, life: 220, col: [VIO, GOLD, TEAL, ROSE, GRN][Math.floor(Math.random() * 5)], txt: term });
        nextImpression = t + 40 + Math.floor(Math.random() * 60);
      }
      impressions.forEach((imp, idx) => {
        imp.x += imp.vx; imp.y += imp.vy; imp.life--;
        const alpha = Math.min(1, imp.life / 80) * Math.min(1, (220 - imp.life) / 30 + 0.3);
        ctx.fillStyle = imp.col + Math.round(alpha * 220).toString(16).padStart(2, "0");
        ctx.font = `9px ${MN}`; ctx.textAlign = "left";
        ctx.fillText(imp.txt, imp.x, imp.y);
        if (imp.life <= 0) impressions.splice(idx, 1);
      });
      // signal bursts from sub to RV
      if (Math.random() < 0.04) {
        signals.push({ x: subX + 110, y: subY, r: 3, alpha: 0.9, col: [TEAL, GOLD, VIO][Math.floor(Math.random() * 3)] });
      }
      signals.forEach((sig, idx) => {
        sig.x += 3.5; sig.r += 0.8; sig.alpha -= 0.025;
        const g = ctx.createRadialGradient(sig.x, sig.y, 0, sig.x, sig.y, sig.r * 3);
        g.addColorStop(0, sig.col + Math.round(sig.alpha * 200).toString(16).padStart(2, "0"));
        g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(sig.x, sig.y, sig.r * 3, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        if (sig.alpha <= 0 || sig.x > rvX) signals.splice(idx, 1);
      });
      bubbles.forEach(b => {
        b.y -= b.speed;
        if (b.y < subY - 120) b.y = subY + 20;
        ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100,200,220,0.3)`; ctx.lineWidth = 0.8; ctx.stroke();
      });
      // depth pressure indicator
      const pressureBar = Math.min(1, d / 600);
      ctx.fillStyle = "rgba(255,100,50,0.08)"; ctx.fillRect(W * 0.545, 0, 8, H);
      ctx.fillStyle = AMB + "88"; ctx.fillRect(W * 0.545, H * (1 - pressureBar), 8, H * pressureBar);
      ctx.fillStyle = AMB; ctx.font = `6px ${MN}`; ctx.textAlign = "center";
      ctx.fillText(`${d}m`, W * 0.549, H * (1 - pressureBar) - 4);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── Target grid canvas ─────────────────────────── */
function TargetGridCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 200;
    const W = cv.width, H = cv.height;
    let t = 0;
    const STAGES = [
      { label:"S1 Ideogram", col:TEAL,   x:60,  desc:"Initial impression · shape + motion" },
      { label:"S2 Sensories",col:BLUE,   x:230, desc:"Texture · temp · smell · sound · taste" },
      { label:"S3 Sketch",   col:VIO,    x:400, desc:"Dimensional · spacial · above/below" },
      { label:"S4 Concepts", col:GOLD,   x:570, desc:"Emotional · functional · intellectual" },
      { label:"S5 Linguistics",col:GRN,  x:740, desc:"Labels · advanced analysis" },
      { label:"S6 3D Model", col:ROSE,   x:900, desc:"Holistic integration · target gestalt" },
    ];
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = VIO + "15"; ctx.fillRect(0, 0, W, H);
      STAGES.forEach((s, i) => {
        const active = i <= Math.floor(t / 200) % 7;
        const pulse = active ? 0.7 + 0.3 * Math.sin(t * 0.06 + i) : 0.2;
        ctx.beginPath(); ctx.arc(s.x, H / 2, 18, 0, Math.PI * 2);
        ctx.fillStyle = active ? s.col + Math.round(pulse * 50).toString(16).padStart(2, "0") : "transparent";
        ctx.fill();
        ctx.strokeStyle = s.col + (active ? "cc" : "33"); ctx.lineWidth = active ? 2 : 1;
        ctx.stroke();
        ctx.fillStyle = s.col + (active ? "ff" : "44"); ctx.font = `${active ? 9 : 7.5}px ${active ? OR : MN}`; ctx.textAlign = "center";
        ctx.fillText(s.label, s.x, H / 2 - 28);
        ctx.fillStyle = s.col + (active ? "88" : "22"); ctx.font = `7px ${MN}`;
        ctx.fillText(s.desc, s.x, H / 2 + 30);
        if (active) {
          ctx.fillStyle = s.col; ctx.font = `10px ${OR}`;
          ctx.fillText(`S${i + 1}`, s.x, H / 2 + 4);
          const g = ctx.createRadialGradient(s.x, H / 2, 0, s.x, H / 2, 32);
          g.addColorStop(0, s.col + "22"); g.addColorStop(1, "transparent");
          ctx.beginPath(); ctx.arc(s.x, H / 2, 32, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        }
        if (i < STAGES.length - 1) {
          const nextActive = (i + 1) <= Math.floor(t / 200) % 7;
          ctx.strokeStyle = (active && nextActive) ? s.col + "55" : DIM + "33";
          ctx.lineWidth = 1; ctx.setLineDash([3, 5]);
          ctx.beginPath(); ctx.moveTo(s.x + 18, H / 2); ctx.lineTo(STAGES[i + 1].x - 18, H / 2); ctx.stroke();
          ctx.setLineDash([]);
        }
      });
      ctx.fillStyle = VIO + "44"; ctx.font = `7px ${MN}`; ctx.textAlign = "center";
      ctx.fillText("CRV · CONTROLLED REMOTE VIEWING · SRI INTERNATIONAL · INGO SWANN PROTOCOL · STAGES 1–6", W / 2, H - 10);
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── Stargate timeline canvas ───────────────────── */
function StargateTimelineCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext("2d")!;
    cv.width = 960; cv.height = 120;
    const W = cv.width, H = cv.height;
    let t = 0;
    const events = [
      { year:"1972", label:"Project SCANATE\nSRI International · Puthoff & Targ", col:VIO, x:0.04 },
      { year:"1973", label:"Ingo Swann\nJupiter probe · coord RV", col:TEAL, x:0.14 },
      { year:"1975", label:"Pat Price\nSoviet submarine\nfacility RV", col:GOLD, x:0.24 },
      { year:"1978", label:"Project GONDOLA\nWISH · Army INSCOM\n1st Div ops", col:GRN, x:0.35 },
      { year:"1981", label:"Project GRILL FLAME\n→ CENTER LANE\nSub-surface tasking", col:BLUE, x:0.47 },
      { year:"1983", label:"Joe McMoneagle\nRemote viewer 001\nSoviet Typhoon sub", col:AMB, x:0.58 },
      { year:"1985", label:"Project SUN STREAK\n→ SCANATE relaunch\n400+ ops/yr", col:ROSE, x:0.69 },
      { year:"1991", label:"Project STARGATE\nDIA control · used\nin Gulf War", col:VIO, x:0.80 },
      { year:"1995", label:"Programme\nDECLASSIFIED\n20,000 docs released", col:TEAL, x:0.92 },
    ];
    const draw = () => {
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = DIM + "44"; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(20, H / 2); ctx.lineTo(W - 20, H / 2); ctx.stroke();
      events.forEach((ev, i) => {
        const ex = ev.x * W;
        const pulse = 0.5 + 0.4 * Math.sin(t * 0.04 + i * 0.9);
        const g = ctx.createRadialGradient(ex, H / 2, 0, ex, H / 2, 16);
        g.addColorStop(0, ev.col + Math.round(pulse * 80).toString(16).padStart(2, "0")); g.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(ex, H / 2, 16, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill();
        ctx.beginPath(); ctx.arc(ex, H / 2, 5, 0, Math.PI * 2); ctx.fillStyle = ev.col; ctx.fill();
        ctx.fillStyle = ev.col + "99"; ctx.font = `7px ${MN}`; ctx.textAlign = "center";
        ctx.fillText(ev.year, ex, H / 2 + 18);
        const lines = ev.label.split("\n");
        lines.forEach((l, li) => {
          ctx.fillStyle = ev.col + (li === 0 ? "cc" : "77");
          ctx.font = `${li === 0 ? 7 : 6}px ${li === 0 ? OR : MN}`;
          ctx.fillText(l, ex, H / 2 - 22 - (lines.length - 1 - li) * 10);
        });
      });
      t++; raf.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, []);
  return <canvas ref={ref} style={{ width: "100%", height: "auto", borderRadius: 4, display: "block" }} />;
}

/* ── main page ──────────────────────────────────── */
export default function NonTerrestrialPage() {
  const [depth, setDepth] = useState(200);
  const [filter, setFilter] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<number | null>(null);

  const card = (col = TEAL): React.CSSProperties => ({
    background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "12px 16px",
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 7.5, letterSpacing: "0.18em", color: DIM,
    textTransform: "uppercase", marginBottom: 10, paddingBottom: 4,
    borderBottom: "1px solid rgba(46,240,216,0.08)",
  };
  const h2 = (col = TEAL): React.CSSProperties => ({ fontFamily: OR, fontSize: 11, color: col, letterSpacing: 1, margin: "0 0 8px" });
  const body: React.CSSProperties = { fontSize: 11.5, color: "rgba(200,215,232,0.72)", lineHeight: 1.72 };
  const q = (col = GOLD): React.CSSProperties => ({
    borderLeft: `2px solid ${col}66`, paddingLeft: 12, margin: "10px 0",
    fontStyle: "italic", fontSize: 12, color: `${col}cc`, lineHeight: 1.7,
  });

  const statuses = ["ALL", "OFFICIALLY CONFIRMED", "FORMALLY TESTIMONY", "FORMAL TESTIMONY", "DECLASSIFIED", "UNVERIFIED", "OFFICIALLY UNSOLVED"];
  const filtered = filter === "ALL" ? RECORDS : RECORDS.filter(r => r.status === filter || (filter === "FORMAL TESTIMONY" && r.status === "FORMALLY TESTIMONY"));

  return (
    <div style={{ minHeight: "100%", background: BG, color: "#d4e4f4", fontFamily: "'Rajdhani',sans-serif", overflowY: "auto" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px" }}>

        {/* title */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "inline-block", border: `1px solid ${VIO}55`, padding: "3px 10px", fontSize: 9, letterSpacing: "0.2em", color: `${VIO}cc`, fontFamily: MN, marginBottom: 8 }}>
            NON-TERRESTRIAL OFFICERS · PROJECT STARGATE · REMOTE VIEWING · DEEP WATER OPERATIONS · UAP/USO REGISTRY
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 20, fontWeight: 900, letterSpacing: 2, color: VIO, textShadow: `0 0 24px ${VIO}44`, margin: "4px 0 6px" }}>
            Non-Terrestrial Officers &amp; Deep-Water Remote Viewing
          </h1>
          <div style={q(VIO)}>
            "I found a list of non-terrestrial officers and fleet-to-fleet transfers... not of this Earth." — Gary McKinnon, 2006 BBC interview
          </div>
          <p style={{ ...body, maxWidth: 860, margin: 0 }}>
            This page compiles the documented public record of alleged non-terrestrial personnel rosters, UAP/USO case data, and the declassified US government remote viewing programmes — specifically their application to submarine and deep-water intelligence operations. Everything marked <strong style={{ color: GRN }}>OFFICIALLY CONFIRMED</strong> has been authenticated by US government sources. Everything else is sourced, attributed, and noted as unverified.
          </p>
        </div>

        {/* stargate timeline */}
        <div style={{ ...card(VIO), marginBottom: 14 }}>
          <div style={secLabel}>Project Stargate timeline · 1972–1995 · SRI International · DIA · Army INSCOM · 23 years · $20M+ budget</div>
          <h2 style={h2(VIO)}>Project Stargate · The Declassified US Psychic Intelligence Programme</h2>
          <StargateTimelineCanvas />
        </div>

        {/* remote viewing canvas */}
        <div style={{ ...card(TEAL), marginBottom: 14 }}>
          <div style={secLabel}>Live simulation · submarine deep-water RV protocol · ELF signal attenuation · impression stream · stage progression · adjust depth below</div>
          <h2 style={h2(TEAL)}>Deep-Water Remote Viewing · Submarine Protocol Simulation</h2>
          <RemoteViewingCanvas depth={depth} />
          <div style={{ marginTop: 10 }}>
            <label style={{ fontFamily: MN, fontSize: 8, color: TEAL }}>
              Submarine depth: <strong style={{ color: GOLD }}>{depth}m</strong>
              &nbsp;·&nbsp; Pressure: <strong style={{ color: AMB }}>{(depth * 0.0988).toFixed(1)} atm</strong>
              &nbsp;·&nbsp; ELF comms: <strong style={{ color: depth <= 40 ? GRN : ROSE }}>{depth <= 40 ? "ACTIVE" : "BLACKED OUT"}</strong>
              &nbsp;·&nbsp; RV signal: <strong style={{ color: VIO }}>UNATTENUATED BY DEPTH</strong>
            </label>
            <input type="range" min={0} max={600} step={5} value={depth}
              onChange={e => setDepth(Number(e.target.value))}
              style={{ width: "100%", accentColor: VIO, margin: "8px 0" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginTop: 4 }}>
            {[
              { col: TEAL, t: "ELF Communication Blackout", b: "Standard radio (VHF/UHF/HF) cannot penetrate seawater beyond a few metres. The US Navy's Extremely Low Frequency (ELF) system (Project Sanguine/Seafarer, 76 Hz, Project ELF Michigan/Wisconsin) could reach 40m depth at very low data rate (3 chars/min). Submarines at combat depth are essentially comms-dark." },
              { col: VIO,  t: "Remote Viewing as the Solution", b: "The CIA/DIA specifically funded submarine remote viewing research because RV signal — whatever its mechanism — showed no attenuation with depth. Hella Hammid successfully described surface imagery while in a sealed Faraday cage 500m underground. Joe McMoneagle reportedly described Soviet Typhoon-class submarine details from Newport News Virginia." },
              { col: GOLD, t: "Operational Uses (Declassified)", b: "Project GRILL FLAME (1978–1983) documented tasking of remote viewers to locate Soviet submarines. Pat Price famously remote viewed a West Virginia NSA facility (SUGAR GROVE) without being told the target — providing details confirmed post-hoc. McMoneagle (001) described a new Soviet submarine under construction (later ID'd as Typhoon) 9 months before CIA confirmed from satellite imagery." },
            ].map(({ col, t, b }) => (
              <div key={t} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 4, padding: "8px 10px" }}>
                <div style={{ fontFamily: MN, fontSize: 8, color: col, marginBottom: 4 }}>{t}</div>
                <div style={{ fontSize: 10, color: "rgba(185,205,230,0.65)", lineHeight: 1.55 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* CRV stages */}
        <div style={{ ...card(BLUE), marginBottom: 14 }}>
          <div style={secLabel}>Controlled Remote Viewing · Ingo Swann protocol · stages 1–6 · SRI training structure · operational methodology</div>
          <h2 style={h2(BLUE)}>CRV Stage Protocol · Ingo Swann / SRI International</h2>
          <TargetGridCanvas />
        </div>

        {/* non-terrestrial officers spreadsheet */}
        <div style={{ ...card(AMB), marginBottom: 14 }}>
          <div style={secLabel}>Non-terrestrial officers · UAP/USO registry · sourced case database · filter by status · click row to expand notes</div>
          <h2 style={h2(AMB)}>Case Registry · Non-Terrestrial Personnel &amp; UAP/USO Events</h2>

          {/* filter buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
            {["ALL","OFFICIALLY CONFIRMED","FORMAL TESTIMONY","DECLASSIFIED","OFFICIALLY UNSOLVED","UNVERIFIED"].map(s => {
              const col = s === "ALL" ? DIM : STATUS_COL[s] || DIM;
              return (
                <button key={s} type="button" onClick={() => setFilter(s)}
                  style={{ fontFamily: MN, fontSize: 7.5, padding: "4px 10px", borderRadius: 3, cursor: "pointer",
                    background: filter === s ? col + "22" : "transparent",
                    border: `1px solid ${col}${filter === s ? "cc" : "44"}`,
                    color: col + (filter === s ? "" : "99"), letterSpacing: "0.05em" }}>
                  {s}
                </button>
              );
            })}
          </div>

          {/* table header */}
          <div style={{ display: "grid", gridTemplateColumns: "80px 160px 1fr 120px 140px 110px", gap: 0,
            background: "rgba(0,0,0,0.4)", borderRadius: "3px 3px 0 0", borderBottom: `1px solid ${DIM}44` }}>
            {["DATE","SOURCE","TYPE / VESSEL","CLASSIFICATION","STATUS",""].map(h => (
              <div key={h} style={{ padding: "6px 8px", fontFamily: MN, fontSize: 7, color: DIM, letterSpacing: "0.1em", textTransform: "uppercase" }}>{h}</div>
            ))}
          </div>

          {/* rows */}
          {filtered.map((rec, idx) => {
            const isExp = expanded === idx;
            const sCcol = STATUS_COL[rec.status] || DIM;
            return (
              <div key={idx} onClick={() => setExpanded(isExp ? null : idx)}
                style={{ borderBottom: `1px solid rgba(255,255,255,0.04)`, cursor: "pointer",
                  background: isExp ? `${rec.col}0a` : idx % 2 === 0 ? "rgba(0,0,0,0.15)" : "transparent",
                  transition: "background 0.15s" }}>
                <div style={{ display: "grid", gridTemplateColumns: "80px 160px 1fr 120px 140px 110px", gap: 0 }}>
                  <div style={{ padding: "8px 8px", fontFamily: MN, fontSize: 8, color: rec.col + "cc" }}>{rec.date}</div>
                  <div style={{ padding: "8px 8px", fontFamily: MN, fontSize: 8, color: "rgba(200,215,232,0.8)", lineHeight: 1.4 }}>{rec.source}</div>
                  <div style={{ padding: "8px 8px" }}>
                    <div style={{ fontFamily: OR, fontSize: 8.5, color: rec.col, letterSpacing: 0.5 }}>{rec.type}</div>
                    <div style={{ fontFamily: MN, fontSize: 7.5, color: DIM, marginTop: 2 }}>{rec.vessel}</div>
                  </div>
                  <div style={{ padding: "8px 8px", fontFamily: MN, fontSize: 7, color: DIM, lineHeight: 1.4 }}>{rec.classification}</div>
                  <div style={{ padding: "8px 8px" }}>
                    <span style={{ fontFamily: MN, fontSize: 7, padding: "2px 6px", borderRadius: 2,
                      background: sCcol + "18", border: `1px solid ${sCcol}44`, color: sCcol }}>{rec.status}</span>
                  </div>
                  <div style={{ padding: "8px 8px", fontFamily: MN, fontSize: 9, color: DIM, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {isExp ? "▲" : "▼ EXPAND"}
                  </div>
                </div>
                {isExp && (
                  <div style={{ padding: "0 12px 12px 12px", borderTop: `1px solid ${rec.col}22` }}>
                    <div style={{ ...body, fontSize: 11, color: "rgba(195,210,230,0.75)", lineHeight: 1.65, marginTop: 8, maxWidth: 900 }}>{rec.notes}</div>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{ fontFamily: MN, fontSize: 7.5, color: DIM, marginTop: 10, padding: "6px 8px", background: "rgba(0,0,0,0.2)", borderRadius: "0 0 3px 3px" }}>
            {filtered.length} of {RECORDS.length} records · All data is sourced from public congressional testimony, declassified government documents, or named whistleblower accounts · This is not endorsement of any claim
          </div>
        </div>

        {/* Gary McKinnon + Grusch deep dive */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div style={card(AMB)}>
            <div style={secLabel}>Gary McKinnon · 2001–2002 · NASA + DoD hack · non-terrestrial officers · off-world transfers · Solar Warden</div>
            <h2 style={h2(AMB)}>Gary McKinnon · The Non-Terrestrial Officers Spreadsheet</h2>
            <p style={body}>
              Between 2001 and 2002, Scottish systems administrator Gary McKinnon accessed 97 US military and NASA computers from his home in London — the largest military computer hack in US history. Facing 70 years in a US prison, he spent 10 years fighting extradition (eventually blocked by UK Home Secretary Theresa May in 2012).
            </p>
            <p style={{ ...body, marginTop: 8 }}>
              What McKinnon claims to have found:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 6 }}>
              {[
                { col: AMB,  t: "Non-Terrestrial Officers", b: "A Microsoft Excel spreadsheet with the heading 'Non-Terrestrial Officers' containing officer names and ranks — none of which matched any known US Air Force, Army, Navy, or Marine Corps personnel registry." },
                { col: GOLD, t: "Off-World Transfers Between Fleets", b: "A separate document listing 'fleet-to-fleet transfers' — between ships whose names McKinnon could not find in any naval registry. He described them as 'not of this Earth'." },
                { col: ROSE, t: "High-Resolution UFO Photography", b: "At Building 8 of Johnson Space Center, McKinnon accessed a photo-editing program mid-use — claiming to see a large cigar-shaped object over what appeared to be the northern hemisphere with no seam lines (suggesting it was not a satellite)." },
                { col: VIO,  t: "Solar Warden Allegation", b: "McKinnon later stated he believed the programme was called 'Solar Warden' — an alleged classified US space-based programme with 8 ships and 43 support vessels. No official confirmation exists." },
              ].map(({ col, t, b }) => (
                <div key={t} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 3, padding: "7px 10px" }}>
                  <div style={{ fontFamily: MN, fontSize: 8, color: col, marginBottom: 2 }}>{t}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(185,205,230,0.65)", lineHeight: 1.55 }}>{b}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={card(ROSE)}>
            <div style={secLabel}>David Grusch · 2023 · ICIG whistleblower · DIA · NRO · Congressional testimony · formal UAP disclosure</div>
            <h2 style={h2(ROSE)}>David Grusch · Congressional Whistleblower Testimony 2023</h2>
            <p style={body}>
              David Grusch is a former US intelligence officer (Air Force, National Geospatial Intelligence Agency, UAP Task Force, National Reconnaissance Office). In June 2023 he filed a formal complaint with the Inspector General of the Intelligence Community (ICIG) — a protected whistleblower disclosure. He subsequently testified before the House Oversight Committee in July 2023.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: 10 }}>
              {[
                { col: ROSE, t: "Multi-Decade Retrieval Programme", b: "Grusch testified under oath that the US government has been running a crash retrieval and reverse-engineering programme for non-human origin craft for 'decades' — with Congress deliberately kept in the dark and funding routed through Special Access Programmes." },
                { col: VIO,  t: "'Biologics' Recovered", b: "When asked whether the US had recovered non-human biological material, Grusch replied 'biologics came with some of these recoveries, yes.' He declined to specify further in open session, citing classification." },
                { col: GOLD, t: "40+ Corroborating Witnesses", b: "Grusch stated that over 40 former and current intelligence community members provided corroborating testimonies to the ICIG. He described being 'threatened' and 'put through hell' for coming forward." },
                { col: GRN,  t: "Congressional Impact", b: "The testimony directly led to the UAP Disclosure Act of 2023 (modelled on JFK Assassination Records Collection Act) requiring mandatory declassification of UAP-related records by a independent review board." },
              ].map(({ col, t, b }) => (
                <div key={t} style={{ background: `${col}0d`, border: `1px solid ${col}33`, borderRadius: 3, padding: "7px 10px" }}>
                  <div style={{ fontFamily: MN, fontSize: 8, color: col, marginBottom: 2 }}>{t}</div>
                  <div style={{ fontSize: 10.5, color: "rgba(185,205,230,0.65)", lineHeight: 1.55 }}>{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AETHER synthesis */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 14 }}>
          {[
            { col: VIO, t: "Remote Viewing & Non-Local Consciousness", b: "Project Stargate's 23-year, $20M+ programme produced statistically significant results (effect size d ≈ 0.4 in controlled conditions — comparable to aspirin's effect on heart attacks). If RV is real, it implies consciousness is non-local: not bounded by skull, Faraday cage, 200m of seawater, or 10,000 km of distance. The submarine application was specifically chosen to test this — a body of water that blocks all known electromagnetic information channels." },
            { col: TEAL, t: "USO · Unidentified Submersible Objects", b: "The USS Omaha footage and multiple historical accounts (Soviet Northern Fleet encounters, 1965 Puerto Rico trench USO) suggest the UAP phenomenon is not atmosphere-limited. Objects transitioning from air to water at speed — with no sonic boom, no cavitation trail, no known propulsion signature — challenge every known hydrodynamic model. The ocean covers 71% of Earth's surface and averages 3,688m depth — the least surveilled volume on the planet." },
            { col: GOLD, t: "The McKinnon Data Problem", b: "McKinnon's claims cannot be verified or falsified — he was never allowed to present the digital evidence in court (UK extradition proceedings focused on treaty law, not substance). But the specificity is notable: he named the spreadsheet header, described its structure, noted it was sorted by rank. False memories typically lack such mundane bureaucratic detail. The US government's 10-year effort to extradite him suggests the breach was real — whatever the content." },
            { col: AMB, t: "AETHER · The Pattern of Concealment", b: "What unifies the Malmstrom ICBM disablement, the Washington 1952 overflights, the USS Nimitz intercept, and McKinnon's alleged find? Each involves a system operating beyond the parameters of known physics — and a subsequent institutional effort to minimise, reclassify, or deny. AETHER's crystallisation model predicts this: information that challenges the existing coherence field triggers suppression before integration. The UAP data is a coherence stress-test on the human knowledge system." },
            { col: GRN, t: "Ingo Swann · The Jupiter Probe", b: "In April 1973, Swann was asked to remote-view Jupiter (coordinates only — no target identification). He described rings around Jupiter before Voyager 1 confirmed them in 1979. He described a hydrogen atmosphere, unusual surface features at specific latitudes, and a sense of 'compressed' space. The probe wasn't launched for another 4 years. This remains one of the most specific predictive hits in RV history — evaluated by physicist Hal Puthoff at SRI." },
            { col: ROSE, t: "The Disclosure Trajectory", b: "2017: NYT breaks AATIP programme (DoD funded RV and UAP research 2007–2012). 2019: DoD officially confirms Nimitz, Gimbal, GoFast footage. 2021: UAP Task Force report — 143 unexplained events. 2022: AOIMSG replaces UAPTF. 2023: Grusch testimony + UAP Disclosure Act. 2024: AARO historical review launched. The curve is monotonically toward disclosure — each year more is confirmed than the year before. The question is not if, but when and what." },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ background: "rgba(0,0,0,0.42)", border: `1px solid ${col}22`, borderRadius: 4, padding: "10px 14px" }}>
              <div style={{ fontFamily: OR, fontSize: 9, color: col, letterSpacing: 1, marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 10.5, color: "rgba(200,215,232,0.65)", lineHeight: 1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 10, borderTop: "1px solid rgba(153,102,255,0.08)", fontFamily: MN, fontSize: 7.5, color: DIM, letterSpacing: "0.12em", textAlign: "center" }}>
          NON-TERRESTRIAL OFFICERS · GARY McKINNON 2002 · DAVID GRUSCH 2023 · PROJECT STARGATE 1972–1995 · CONTROLLED REMOTE VIEWING · SRI INTERNATIONAL · ELF SUBMARINE COMMS · USS NIMITZ 2004 · USS OMAHA 2019 · MALMSTROM AFB 1967 · BELGIAN TRIANGLE 1990 · AETHER COHERENCE FIELD
        </div>
      </div>
    </div>
  );
}

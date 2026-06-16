import { useEffect, useRef, useState } from "react";
import img_soi_overview  from "@assets/IMG_2769_1781646485273.png";
import img_soi_kinetic   from "@assets/IMG_2658_1781646485273.png";
import img_soi_domains   from "@assets/IMG_2657_1781646485273.png";
import img_mpc_transport from "@assets/IMG_2758_1781646485273.png";
import img_interior      from "@assets/IMG_2660_1781646485273.png";
import img_mobile_app    from "@assets/IMG_2774_1781646485273.png";

/* ── Palette ── */
const BG     = "#03040c";
const PANEL  = "rgba(3,4,12,0.97)";
const BORDER = "#10121f";
const GOLD   = "#c9a84c";
const TEXT   = "#c0c8e0";
const MUTED  = "#22263a";
const DIM    = "#0d1020";
const mono   = "'Space Mono', monospace";
const serif  = "'Cinzel', serif";
const body   = "'Crimson Pro', Georgia, serif";

const BIO   = "#44ee88";  // Biological Dynamics
const CLM   = "#2ef0d8";  // Climate Dynamics
const ECO   = "#c9a84c";  // Economic Dynamics
const HUM   = "#9966ff";  // Human Development
const K_COL = "#ffffff";  // K node

type CanvasTab = "building" | "integration" | "mpc";

/* ── Domain data ── */
const DOMAINS = [
  { id:"bio", name:"Biological Dynamics", color:BIO,
    eq:"∂A/∂t = D_A∇²A + f(A,B)", sub:"Reaction-diffusion patterns · morphogenesis",
    sensors:["Air quality biometrics","Cell growth rate","Mycorrhizal network flux","Bioluminescent coherence"],
    response:"Biophilic wall panels rotate toward light · Living walls extend root networks · Bio-dome pressure adjusts",
    aetherLink:"Seamoss gate dielectric mediates ionic exchange between building bio-skin and interior atmosphere" },
  { id:"clm", name:"Climate Dynamics",    color:CLM,
    eq:"∂A/∂t = D_A∇²A + f(A,B)", sub:"Perturbation cascade · synced transformation",
    sensors:["Solar irradiance","Wind vector","Humidity gradient","Thermal load"],
    response:"Roof sections pivot to optimise solar gain · Modules retract on wind load · Kinetic façade shades rotate",
    aetherLink:"Torsion resonator on roof reads local geomagnetic perturbation — climate sensor node for K-field" },
  { id:"eco", name:"Economic Dynamics",   color:ECO,
    eq:"Σwᵢⱼxⱼ = θᵢ  (K-coupling)", sub:"Market data → spatial allocation",
    sensors:["Occupancy density","Market feed","Energy price signal","Transport demand"],
    response:"Modules extend/retract on financial data feeds · Office sections re-cluster as workspace demand changes · Transport paths shift on multiple levels",
    aetherLink:"Building floor-plate IS the economic neural network — each pod a weighted node in Σwᵢⱼxⱼ = θᵢ" },
  { id:"hum", name:"Human Development",   color:HUM,
    eq:"Φ(E,S) = K  [all levels unified]", sub:"Psychology · flow states · action/emotion",
    sensors:["EEG biofeedback (emotion)","Heart rate coherence","Social density","Acoustic comfort"],
    response:"Cellular study nooks retract for privacy · Kinetic wall art shifts between action/emotion modes · Therapy spaces adjust ambient light and sound",
    aetherRole:"Human flow state IS the K-preservation mechanism — when humans are in coherence, the building stabilises. Architecture as active biofeedback loop" },
];

/* ── Design principles ── */
const PRINCIPLES = [
  { n:"01", name:"Modular Mobility",          color:CLM,
    sub:"Building pods function like giant elevators on horizontal/vertical axes",
    detail:"Entire floor sections translate, rotate, and extend on robotic rail systems. The floor IS the transport. No corridors — the building routes itself around its occupants. Displacement δ(t) = A·sin(ωt+φ) + K·perturbation(t)",
    units:["Floor pods","Vertical shafts","Horizontal sleds","Diagonal pivots"] },
  { n:"02", name:"Cross-System Coupling Layer",color:GOLD,
    sub:"Integration Hub K receives all four domain sensor streams simultaneously",
    detail:"Biology Sensor → K ← Climate Sensor ← Economic Market Data ← Human Emotion/Action Interface. All inputs processed simultaneously via Φ(E,S)=K. K is not an average — it is the conserved invariant across all perturbation transforms. ∂A/∂t = D_A∇²A + f(A,B) + λ·K_coupling",
    units:["Bio sensor array","Climate transducer","Market API feed","Affective computing interface"] },
  { n:"03", name:"Perturbation Response",      color:BIO,
    sub:"Local perturbation → synced transformation of entire building",
    detail:"A weather shift on Floor 12 triggers coordinated reconfiguration across all coupled modules. The building reads: BEFORE (normal static) → perturbation detected → AFTER (modules extend, transport paths shift, sections pivot). K preserves coherence throughout. No sub-system acts alone.",
    units:["Seismic sensors","Wind load meters","Crowd-flow sensors","Thermal imaging"] },
  { n:"04", name:"Substrate & Human Layer",    color:HUM,
    sub:"Buildings as active partners — biophilic design + flow states",
    detail:"Mathematical Sketch: ∂A/∂t = D_A∇²A + f(A,B). The substrate is not passive — it is a living computational medium. Buildings embed the same reaction-diffusion dynamics as biological morphogenesis. Biophilic surfaces self-organise. Human psychology maps directly onto spatial configuration.",
    units:["Living wall panels","Resonant floor materials","Acoustic morphing surfaces","Bio-luminescent atmosphere"] },
];

/* ── Room system ── */
const ROOMS = [
  { id:"biodome",  name:"Bio-Dome Research Center",          color:BIO,
    desc:"Nested meeting pods for scientific collaboration — climate bio-dome for sensitive cell generation (climate science, genetics). Reaction-diffusion living walls respond to occupant biometrics.",
    capacity:"12–80 researchers", wing:"North",
    tech:"Seamoss carrageenan atmospheric membrane · mycelium acoustic tiles · bioluminescent ceiling" },
  { id:"econeg",   name:"Economic Dynamics Negotiation Forum",color:ECO,
    desc:"Market-data-reactive space: walls display live financial feeds as art. Table pods extend/retract as deal complexity increases. Spatial configuration IS the negotiation framework.",
    capacity:"4–200 delegates", wing:"East",
    tech:"Interactive market-data panels · kinetic table topology · acoustic isolation on demand" },
  { id:"humdev",   name:"Human Development & Psychology Center",color:HUM,
    desc:"Cellular network of individual study spaces and therapy rooms. Affective computing adjusts lighting, sound, and spatial boundaries in real time based on EEG and heart-rate coherence.",
    capacity:"1–40 individuals", wing:"West",
    tech:"EEG-responsive ambient light · heart-rate wall colour mapping · kinetic privacy screens" },
  { id:"cellular", name:"Cellular Network",                  color:CLM,
    desc:"Interconnected individual study pods — each an autonomous spatial unit that can link or isolate. The cellular network IS the building's neural layer — signals propagate pod-to-pod.",
    capacity:"1–500 (scalable)", wing:"Core",
    tech:"Modular pod coupling rails · peer-to-peer acoustic mesh · distributed coherence sensors" },
  { id:"climate",  name:"Climate Science Labs",               color:CLM,
    desc:"Atmospheric simulation chambers with real-time weather integration. The lab IS the weather model — spatial configuration tracks climate perturbation states in real time.",
    capacity:"6–30 scientists", wing:"South",
    tech:"Barometric pressure chambers · solar-gain simulation panels · wind tunnel modules" },
  { id:"knode",    name:"AETHER K-Node Hub",                  color:GOLD,
    desc:"The Integration Constant chamber — where all four domain streams converge into K. The literal centre of the building. Visible from all wings. Φ(E,S) = K is displayed as living light sculpture.",
    capacity:"All occupants (open atrium)", wing:"Centre",
    tech:"Four-domain holographic display · K-coherence field sensor array · AETHER torsion resonator node" },
];

/* ── MPC transport steps ── */
const MPC_STEPS = [
  { n:1, label:"INITIALISATION",    sub:"Area Scan & Grid Locking",        color:CLM,
    desc:"Spatial coherence projectors scan the transport zone. The local space-fabric grid is locked — all K-field perturbations mapped. The object to be transported is identified and its coherent region boundary computed. No physical contact required." },
  { n:2, label:"ISOLATION",         sub:"Creating the Coherent Region Ω",  color:BIO,
    desc:"The coherent region Ω is separated from the ambient space-fabric. The object is embedded in Ω — matter is now inside an isolated bubble of locally preserved space-fabric. The object does not move. The region around it does." },
  { n:3, label:"DISPLACEMENT PULSE",sub:"Instantaneous Spatial Shift",     color:GOLD,
    desc:"Warp-field generator fires the Matter Displacement Pulse (MDP): the coherent region Ω is translated from Location A to Location B. The space-fabric containing the object moves. The object remains stationary relative to its local reference frame." },
  { n:4, label:"DEPRESSURISATION",  sub:"Native Grid Re-Integration",      color:HUM,
    desc:"The coherent region Ω is re-integrated with the destination space-fabric. Spatial coherence projectors decompress the boundary. The object is now at Location B — fully re-integrated with local K-field. Transport cycle complete." },
];

/* ══════════════════════════════════════════
   CANVAS 1: KINETIC BUILDING ROTATION
   Animated cross-section of SOI building
   Four wings + K-node + rotating modules
══════════════════════════════════════════ */
function BuildingCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.011;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle = BG; ctx!.fillRect(0,0,W,H);

      const cx = W/2, cy = H/2;

      // ── Ground plane ──
      const grd = ctx!.createLinearGradient(0, H*0.82, 0, H);
      grd.addColorStop(0, "#11141f"); grd.addColorStop(1, "#060710");
      ctx!.fillStyle = grd; ctx!.fillRect(0, H*0.82, W, H*0.18);

      // ── Central K-node tower ──
      const towerW = 40, towerH = H*0.62;
      const towerX = cx - towerW/2, towerY = H*0.18;
      const tGrd = ctx!.createLinearGradient(0, towerY, 0, towerY+towerH);
      tGrd.addColorStop(0,"#22263a"); tGrd.addColorStop(0.5,"#1a1e30"); tGrd.addColorStop(1,"#0d1020");
      ctx!.fillStyle=tGrd; ctx!.fillRect(towerX, towerY, towerW, towerH);
      ctx!.strokeStyle=GOLD+"40"; ctx!.lineWidth=1; ctx!.strokeRect(towerX, towerY, towerW, towerH);

      // Tower floors (horizontal lines)
      for (let i=1; i<8; i++) {
        ctx!.beginPath(); ctx!.moveTo(towerX, towerY+i*(towerH/8)); ctx!.lineTo(towerX+towerW, towerY+i*(towerH/8));
        ctx!.strokeStyle=GOLD+"20"; ctx!.lineWidth=0.5; ctx!.stroke();
      }

      // ── K-node sphere at top of tower ──
      const kx = cx, ky = towerY;
      const kr = 22 + 3*Math.sin(T*1.2);
      const kgrd = ctx!.createRadialGradient(kx,ky,0,kx,ky,kr);
      kgrd.addColorStop(0,"rgba(255,255,255,0.95)");
      kgrd.addColorStop(0.3, GOLD+"cc");
      kgrd.addColorStop(0.7, GOLD+"40");
      kgrd.addColorStop(1,"transparent");
      ctx!.beginPath(); ctx!.arc(kx, ky, kr, 0, Math.PI*2);
      ctx!.fillStyle=kgrd; ctx!.fill();
      ctx!.font=`8px ${serif}`; ctx!.textAlign="center"; ctx!.fillStyle=BG+"ee";
      ctx!.fillText("K", kx, ky+3);

      // Pulsing K rings
      [1.8, 2.8, 4.0].forEach((scale, i) => {
        const pulse = ((T*0.5 + i*0.35) % 1);
        const ringR = kr * scale * pulse;
        ctx!.beginPath(); ctx!.arc(kx, ky, ringR, 0, Math.PI*2);
        ctx!.strokeStyle=GOLD+Math.round((1-pulse)*60).toString(16).padStart(2,"0");
        ctx!.lineWidth=1; ctx!.stroke();
      });

      // ── Four domain wings ──
      const domains = [
        { name:"BIO", color:BIO,    angle: Math.PI*1.5 - 0.35 + Math.sin(T*0.3)*0.08, wingLen:W*0.25 + Math.sin(T*0.7)*15 },
        { name:"CLM", color:CLM,    angle: Math.PI*1.5 + 0.35 + Math.sin(T*0.4+1)*0.07, wingLen:W*0.25 + Math.cos(T*0.6)*12 },
        { name:"ECO", color:ECO,    angle: Math.PI*0.5 - 0.3 + Math.sin(T*0.5+2)*0.09, wingLen:W*0.22 + Math.sin(T*0.8)*18 },
        { name:"HUM", color:HUM,    angle: Math.PI*0.5 + 0.3 + Math.cos(T*0.35+3)*0.06,wingLen:W*0.22 + Math.cos(T*0.9)*14 },
      ];
      const wingConnY = towerY + towerH * 0.4;

      domains.forEach(d => {
        const ex = cx + Math.cos(d.angle)*d.wingLen;
        const ey = wingConnY + Math.sin(d.angle)*d.wingLen*0.4;

        // Wing connection line (coupling stream)
        ctx!.beginPath(); ctx!.moveTo(cx, wingConnY); ctx!.lineTo(ex, ey);
        ctx!.strokeStyle=d.color+"50"; ctx!.lineWidth=2; ctx!.stroke();

        // Traveling data pulse along wing
        const tp = (T*0.7 + (d.angle*0.2)) % 1;
        const px = cx + (ex-cx)*tp, py = wingConnY + (ey-wingConnY)*tp;
        ctx!.beginPath(); ctx!.arc(px, py, 3, 0, Math.PI*2);
        ctx!.fillStyle=d.color+"cc"; ctx!.fill();

        // Wing block (the domain wing)
        const wBlockW = 70 + d.wingLen*0.1;
        const wBlockH = 28 + 6*Math.abs(Math.sin(T*0.6 + d.angle));
        ctx!.fillStyle=d.color+"18";
        ctx!.fillRect(ex-wBlockW/2, ey-wBlockH/2, wBlockW, wBlockH);
        ctx!.strokeStyle=d.color+"60"; ctx!.lineWidth=1;
        ctx!.strokeRect(ex-wBlockW/2, ey-wBlockH/2, wBlockW, wBlockH);

        // Wing label
        ctx!.font=`7px ${serif}`; ctx!.textAlign="center"; ctx!.fillStyle=d.color+"cc";
        ctx!.fillText(d.name, ex, ey+3);

        // Equation strip on wing
        const eqs: Record<string,string> = { BIO:"∂A/∂t = D∇²A+f(A,B)", CLM:"K·λ_coupling", ECO:"Σwᵢⱼxⱼ=θᵢ", HUM:"Φ(E,S)=K" };
        ctx!.font=`5px ${mono}`; ctx!.fillStyle=d.color+"50";
        ctx!.fillText(eqs[d.name]||"", ex, ey+10);
      });

      // ── Rotating robotic arms (from kinetic building image) ──
      const armAngles = [0, Math.PI/2, Math.PI, Math.PI*3/2];
      armAngles.forEach((baseAngle, ai) => {
        const armAngle = baseAngle + T*0.12 * (ai%2===0?1:-1);
        const armLen = 38;
        const armX = cx + Math.cos(armAngle)*28, armY = wingConnY + Math.sin(armAngle)*14;
        ctx!.beginPath(); ctx!.moveTo(armX, armY);
        ctx!.lineTo(armX + Math.cos(armAngle)*armLen, armY + Math.sin(armAngle)*armLen*0.5);
        ctx!.strokeStyle=GOLD+"60"; ctx!.lineWidth=1.5; ctx!.stroke();
        // Arm tip
        ctx!.beginPath(); ctx!.arc(armX+Math.cos(armAngle)*armLen, armY+Math.sin(armAngle)*armLen*0.5, 3, 0, Math.PI*2);
        ctx!.fillStyle=GOLD+"80"; ctx!.fill();
      });

      // ── Integration constant display ──
      ctx!.font=`9px ${serif}`; ctx!.textAlign="center"; ctx!.fillStyle=GOLD+"cc";
      ctx!.fillText("Φ(E,S) = K", cx, towerY + towerH + 20);
      ctx!.font=`6px ${mono}`; ctx!.fillStyle=TEXT+"30";
      ctx!.fillText("Integration Constant of Reality · Active Architectural State", cx, towerY+towerH+32);

      // ── Perturbation signal waves ──
      for (let i=0; i<4; i++) {
        const dc = [BIO,CLM,ECO,HUM][i];
        const waveY = H*0.86 + i*6;
        ctx!.beginPath();
        for (let x=0; x<W; x+=2) {
          const y = waveY + 4*Math.sin(x*0.04 + T*(0.8+i*0.15) + i*1.2);
          if (x===0) ctx!.moveTo(x,y); else ctx!.lineTo(x,y);
        }
        ctx!.strokeStyle=dc+"40"; ctx!.lineWidth=0.8; ctx!.stroke();
      }
      ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=TEXT+"20";
      ctx!.fillText("PERTURBATION SIGNALS  →  K preserves coherence", 6, H*0.84);

      // K preserves label
      ctx!.font=`6px ${serif}`; ctx!.textAlign="right"; ctx!.fillStyle=GOLD+"40";
      ctx!.fillText("K PRESERVES COHERENCE", W-6, H-8);
    };
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:280 }} />;
}

/* ══════════════════════════════════════════
   CANVAS 2: INTEGRATION CONSTANT K
   Four domain streams → K node convergence
   Based on IMG_2657 diagram
══════════════════════════════════════════ */
function IntegrationCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.012;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle = BG; ctx!.fillRect(0,0,W,H);

      const kx = W*0.52, ky = H*0.5;

      // ── Three domain streams (left side) ──
      const streams = [
        { label:"BIOLOGICAL DYNAMICS", eq:"∂A/∂t = D_A∇²A + f(A,B)", color:BIO,  y:H*0.18 },
        { label:"ECONOMIC DYNAMICS",   eq:"Σwᵢⱼxⱼ = θᵢ",            color:ECO,  y:H*0.5  },
        { label:"HUMAN DEVELOPMENT",   eq:"Φ(E,S) = K",               color:HUM,  y:H*0.82 },
      ];

      streams.forEach(s => {
        // Domain block (left)
        const bw = 120, bh = 36;
        ctx!.fillStyle=s.color+"12";
        ctx!.fillRect(10, s.y-bh/2, bw, bh);
        ctx!.strokeStyle=s.color+"40"; ctx!.lineWidth=1;
        ctx!.strokeRect(10, s.y-bh/2, bw, bh);
        ctx!.font=`6px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=s.color+"cc";
        ctx!.fillText(s.label, 10+bw/2, s.y-4);
        ctx!.font=`5.5px ${serif}`; ctx!.fillStyle=s.color+"80";
        ctx!.fillText(s.eq, 10+bw/2, s.y+6);

        // Flow stream from domain → K-node
        const streamX0 = 130;
        const cp1x = streamX0 + (kx-streamX0)*0.4, cp1y = s.y;
        const cp2x = streamX0 + (kx-streamX0)*0.7, cp2y = ky;

        // Draw wave stream
        for (let xi=0; xi<=60; xi++) {
          const t2 = xi/60;
          const bx = (1-t2)**3*streamX0 + 3*(1-t2)**2*t2*cp1x + 3*(1-t2)*t2**2*cp2x + t2**3*kx;
          const by_ = (1-t2)**3*s.y + 3*(1-t2)**2*t2*cp1y + 3*(1-t2)*t2**2*cp2y + t2**3*ky;
          const wAmp = 5*(1-t2);
          const yoffs = wAmp*Math.sin(t2*12 - T*2 + s.y*0.02);
          if (xi===0) ctx!.moveTo(bx, by_+yoffs);
          if (xi===0) ctx!.beginPath();
          ctx!.lineTo(bx, by_+yoffs);
        }
        ctx!.strokeStyle=s.color+"60"; ctx!.lineWidth=2; ctx!.stroke();

        // Traveling pulses along stream
        [0, 0.35, 0.7].forEach(offset => {
          const tp = ((T*0.5 + offset) % 1);
          const t2 = tp;
          const bx = (1-t2)**3*streamX0 + 3*(1-t2)**2*t2*cp1x + 3*(1-t2)*t2**2*cp2x + t2**3*kx;
          const by_ = (1-t2)**3*s.y + 3*(1-t2)**2*t2*cp1y + 3*(1-t2)*t2**2*cp2y + t2**3*ky;
          ctx!.beginPath(); ctx!.arc(bx, by_, 3, 0, Math.PI*2);
          ctx!.fillStyle=s.color+Math.round((1-tp)*180).toString(16).padStart(2,"0"); ctx!.fill();
        });
      });

      // ── Climate stream from top ──
      const clmSY = 0, clmEY = ky;
      for (let yi=0; yi<=50; yi++) {
        const t2 = yi/50;
        const cx2 = kx + (1-t2)*(W*0.78-kx);
        const cy2 = clmSY + t2*(clmEY-clmSY);
        const xoffs = 4*(1-t2)*Math.sin(t2*8-T*1.5);
        if (yi===0) ctx!.beginPath();
        if (yi===0) ctx!.moveTo(cx2+xoffs, cy2); else ctx!.lineTo(cx2+xoffs, cy2);
      }
      ctx!.strokeStyle=CLM+"55"; ctx!.lineWidth=1.5; ctx!.stroke();
      ctx!.font=`6px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=CLM+"80";
      ctx!.fillText("CLIMATE DYNAMICS", W*0.78, 14);

      // ── K-node ──
      const kr = 30 + 4*Math.sin(T*0.8);
      const kgrd = ctx!.createRadialGradient(kx,ky,0,kx,ky,kr);
      kgrd.addColorStop(0,"rgba(255,255,255,1)");
      kgrd.addColorStop(0.25, GOLD);
      kgrd.addColorStop(0.6, GOLD+"60");
      kgrd.addColorStop(1,"transparent");
      ctx!.beginPath(); ctx!.arc(kx,ky,kr,0,Math.PI*2);
      ctx!.fillStyle=kgrd; ctx!.fill();
      ctx!.font=`13px ${serif}`; ctx!.textAlign="center"; ctx!.fillStyle="#050810dd";
      ctx!.fillText("K", kx, ky+5);

      // K label
      ctx!.font=`6px ${mono}`; ctx!.fillStyle=GOLD+"80";
      ctx!.fillText("Integration Constant", kx, ky+kr+12);
      ctx!.fillText("of Reality", kx, ky+kr+22);

      // Pulsing K rings
      [1.5,2.2,3.2].forEach((sc,i)=>{
        const p = ((T*0.4+i*0.3)%1);
        ctx!.beginPath(); ctx!.arc(kx,ky,kr*sc*p,0,Math.PI*2);
        ctx!.strokeStyle=GOLD+Math.round((1-p)*50).toString(16).padStart(2,"0");
        ctx!.lineWidth=1.5; ctx!.stroke();
      });

      // ── Output streams (right): cross-system coupling, perturbation, synced ──
      const outputs = [
        { label:"CROSS-SYSTEM COUPLING",  y:H*0.3, color:CLM },
        { label:"MULTIPLE INSTANTIATIONS",y:H*0.5, color:GOLD},
        { label:"SYNCED TRANSFORMATION",  y:H*0.7, color:HUM },
        { label:"SUPRK DEVELOPMENT",      y:H*0.85,color:BIO },
      ];
      outputs.forEach(o => {
        const tx = kx + 48, endX = W-10;
        ctx!.beginPath(); ctx!.moveTo(tx, ky);
        ctx!.bezierCurveTo(tx+(endX-tx)*0.4, ky, tx+(endX-tx)*0.6, o.y, endX, o.y);
        ctx!.strokeStyle=o.color+"50"; ctx!.lineWidth=1.5; ctx!.stroke();
        // Traveling output pulse
        const tp = ((T*0.45)%1);
        const bx2 = tx + tp*(endX-tx);
        const by2 = ky + tp*(o.y-ky) + Math.sin(tp*Math.PI)*20;
        ctx!.beginPath(); ctx!.arc(bx2,by2,2.5,0,Math.PI*2);
        ctx!.fillStyle=o.color+"aa"; ctx!.fill();
        ctx!.font=`5.5px ${mono}`; ctx!.textAlign="right"; ctx!.fillStyle=o.color+"60";
        ctx!.fillText(o.label, endX, o.y-4);

        // Perturbation wave (right column)
        ctx!.beginPath();
        for (let x=endX-60; x<=endX; x+=2) {
          const y2 = o.y + 6*Math.sin((x-endX+60)*0.25-T*2.5);
          if (x===endX-60) ctx!.moveTo(x,y2); else ctx!.lineTo(x,y2);
        }
        ctx!.strokeStyle=o.color+"30"; ctx!.lineWidth=1; ctx!.stroke();
      });
      ctx!.font=`6px ${mono}`; ctx!.textAlign="left"; ctx!.fillStyle=TEXT+"20";
      ctx!.fillText("← perturbation", W-64, H-10);
      ctx!.fillStyle=TEXT+"15"; ctx!.fillText("K preserves →", W-64, H*0.5+8);
    };
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:280 }} />;
}

/* ══════════════════════════════════════════
   CANVAS 3: MPC TRANSPORT
   Coherent region moves around object
   Location A → Location B
══════════════════════════════════════════ */
function MpcCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const raf   = useRef(0);
  const t0    = useRef(0);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const r = cv!.getBoundingClientRect();
      cv!.width = r.width*dpr; cv!.height = r.height*dpr;
      ctx!.setTransform(dpr,0,0,dpr,0,0);
    };
    resize(); window.addEventListener("resize", resize);

    const loop = () => {
      raf.current = requestAnimationFrame(loop);
      t0.current += 0.009;
      const T = t0.current;
      const r = cv!.getBoundingClientRect();
      const W = r.width, H = r.height;
      ctx!.clearRect(0,0,W,H); ctx!.fillStyle = BG; ctx!.fillRect(0,0,W,H);

      const cycleT = (T * 0.18) % 1;
      const phase = Math.floor(cycleT * 4); // 0=init, 1=isolate, 2=pulse, 3=release

      // Space-fabric grid
      for (let gx=0; gx<W; gx+=20) {
        ctx!.beginPath(); ctx!.moveTo(gx, 0); ctx!.lineTo(gx, H);
        ctx!.strokeStyle=MUTED+"18"; ctx!.lineWidth=0.5; ctx!.stroke();
      }
      for (let gy=0; gy<H; gy+=20) {
        ctx!.beginPath(); ctx!.moveTo(0, gy); ctx!.lineTo(W, gy);
        ctx!.strokeStyle=MUTED+"18"; ctx!.lineWidth=0.5; ctx!.stroke();
      }

      // Location markers
      const locAX = W*0.18, locBX = W*0.82, locY = H*0.5;
      ctx!.font=`7px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=CLM+"60";
      ctx!.fillText("Location A", locAX, H*0.12);
      ctx!.fillStyle=BIO+"60";
      ctx!.fillText("Location B", locBX, H*0.12);

      // Object box — stationary at current position
      const objX = cycleT < 0.6 ? locAX : locAX + (locBX-locAX)*((cycleT-0.6)/0.3);
      const objY = locY;
      ctx!.fillStyle="#22263acc";
      ctx!.fillRect(objX-18, objY-16, 36, 32);
      ctx!.strokeStyle=TEXT+"40"; ctx!.lineWidth=1;
      ctx!.strokeRect(objX-18, objY-16, 36, 32);
      ctx!.font=`6px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=TEXT+"60";
      ctx!.fillText("object", objX, objY+3);

      // Coherent region bubble
      const bubblePhase = cycleT < 0.75 ? cycleT/0.75 : 1;
      const bubbleX = locAX + (locBX-locAX) * Math.min(1, Math.max(0, (cycleT-0.4)/0.35));
      const bubbleY = locY + 20*Math.sin(Math.PI*Math.min(1,(cycleT-0.4)/0.35));
      const br = 52 + 6*Math.sin(T*2);
      const bgrd = ctx!.createRadialGradient(bubbleX, bubbleY, 0, bubbleX, bubbleY, br);
      bgrd.addColorStop(0, CLM+"18");
      bgrd.addColorStop(0.6, CLM+"30");
      bgrd.addColorStop(0.85, CLM+"60");
      bgrd.addColorStop(1, "transparent");
      ctx!.beginPath(); ctx!.arc(bubbleX, bubbleY, br, 0, Math.PI*2);
      ctx!.fillStyle=bgrd; ctx!.fill();
      ctx!.beginPath(); ctx!.arc(bubbleX, bubbleY, br, 0, Math.PI*2);
      ctx!.strokeStyle=CLM+"80"; ctx!.lineWidth=1.5; ctx!.stroke();

      // Coherence projector arms (3 arms converging on bubble from below)
      if (phase <= 1) {
        [-40,0,40].forEach(xoff => {
          const armX = bubbleX + xoff;
          const armY = locY + 70;
          ctx!.beginPath();
          ctx!.moveTo(armX, armY);
          ctx!.lineTo(bubbleX+xoff*0.3, bubbleY+br*0.7);
          const agrAmt = 8;
          ctx!.strokeStyle = "#ff6600"+Math.round(agrAmt*16).toString(16).padStart(2,"0");
          ctx!.lineWidth=2; ctx!.stroke();
          // Arm base
          ctx!.beginPath(); ctx!.arc(armX, armY, 5, 0, Math.PI*2);
          ctx!.fillStyle="#ff660060"; ctx!.fill();
        });
      }

      // Displacement pulse arrow (phase 2)
      if (phase === 2 || (cycleT > 0.45 && cycleT < 0.75)) {
        const arrowY = locY - 70;
        ctx!.beginPath();
        ctx!.moveTo(locAX, arrowY);
        const progress = Math.min(1,(cycleT-0.45)/0.3);
        ctx!.lineTo(locAX + (locBX-locAX)*progress, arrowY);
        ctx!.strokeStyle=GOLD+"cc"; ctx!.lineWidth=2.5; ctx!.stroke();
        ctx!.beginPath();
        const arrowTip = locAX + (locBX-locAX)*progress;
        ctx!.moveTo(arrowTip, arrowY);
        ctx!.lineTo(arrowTip-8, arrowY-5);
        ctx!.lineTo(arrowTip-8, arrowY+5);
        ctx!.closePath(); ctx!.fillStyle=GOLD+"cc"; ctx!.fill();
        ctx!.font=`6px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=GOLD+"80";
        ctx!.fillText("MATTER DISPLACEMENT PULSE", locAX+(locBX-locAX)/2, arrowY-8);
      }

      // Space-fabric distortion around bubble (grid warping)
      for (let gx=0; gx<W; gx+=20) {
        const dist = Math.hypot(gx-bubbleX, locY-bubbleY);
        if (dist > br*0.6 && dist < br*2.5) {
          const warp = 8*Math.exp(-0.003*dist*dist)*Math.sin(T*3);
          ctx!.beginPath(); ctx!.moveTo(gx+warp, 0); ctx!.lineTo(gx+warp, H);
          ctx!.strokeStyle=CLM+"20"; ctx!.lineWidth=0.5; ctx!.stroke();
        }
      }

      // Phase label
      const phaseNames = ["INITIALISATION · Area Scan & Grid Locking","ISOLATION · Creating Coherent Region Ω","DISPLACEMENT PULSE · Instantaneous Spatial Shift","DEPRESSURISATION · Native Grid Re-Integration"];
      const phaseColors = [CLM,BIO,GOLD,HUM];
      ctx!.font=`7px ${mono}`; ctx!.textAlign="center"; ctx!.fillStyle=phaseColors[phase]+"cc";
      ctx!.fillText(phaseNames[phase], W/2, H-14);
      ctx!.fillStyle=phaseColors[phase]+"40";
      ctx!.fillText(`Phase ${phase+1}/4`, W/2, H-4);

      // Key text
      ctx!.font=`6px ${body}`; ctx!.textAlign="left"; ctx!.fillStyle=TEXT+"20";
      ctx!.fillText("MPC: coherent region moves · object stationary in local frame", 8, 14);
      ctx!.textAlign="right"; ctx!.fillStyle=CLM+"30";
      ctx!.fillText("∂A/∂t = D_A∇²A + f(A,B)", W-8, 14);
    };
    loop();
    return () => { cancelAnimationFrame(raf.current); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={cvRef} style={{ display:"block", width:"100%", height:280 }} />;
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function SoiBuildingPage() {
  const [tab, setTab]             = useState<CanvasTab>("building");
  const [activeDomain, setActiveDomain] = useState("bio");
  const [activeRoom, setActiveRoom]   = useState("knode");
  const [activePrinciple, setActivePrinciple] = useState(0);
  const [activeMpcStep, setActiveMpcStep] = useState(0);

  const panelBox: React.CSSProperties = {
    background:PANEL, border:`1px solid ${BORDER}`,
    borderRadius:2, padding:"10px 12px", marginBottom:10, position:"relative",
  };
  const topLine = (c = GOLD) => (
    <div style={{ position:"absolute",top:0,left:0,right:0,height:1,
      background:`linear-gradient(90deg,${c},transparent)`,opacity:0.4 }} />
  );
  const SH = ({ label, color=GOLD }:{label:string;color?:string}) => (
    <div style={{ fontSize:7,letterSpacing:"0.2em",textTransform:"uppercase",
      color,marginBottom:6,borderBottom:`1px solid ${BORDER}`,paddingBottom:3 }}>
      {label}
    </div>
  );

  const ad = DOMAINS.find(d=>d.id===activeDomain) || DOMAINS[0];
  const ar = ROOMS.find(r=>r.id===activeRoom) || ROOMS[5];
  const ap = PRINCIPLES[activePrinciple];

  const tabs: [CanvasTab,string,string][] = [
    ["building",    "KINETIC BUILDING",      GOLD],
    ["integration", "K INTEGRATION",         "#ffffff"],
    ["mpc",         "MPC TRANSPORT",          CLM ],
  ];

  const ImgCard = ({ src, caption, small }:{src:string;caption:string;small?:boolean}) => (
    <div style={{ marginBottom:small?6:10 }}>
      <img src={src} alt={caption} style={{
        width:"100%", display:"block", borderRadius:2,
        border:`1px solid ${BORDER}`, opacity:0.92 }} />
      <div style={{ fontFamily:body, fontStyle:"italic", fontSize:9, color:MUTED,
        marginTop:3, lineHeight:1.4 }}>{caption}</div>
    </div>
  );

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT, fontFamily:mono, overflowY:"auto" }}>

      {/* ── HEADER ── */}
      <div style={{ padding:"12px 20px 10px", borderBottom:`1px solid ${BORDER}`,
        background:"rgba(3,4,12,0.98)", position:"sticky", top:0, zIndex:20 }}>
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:1,
          background:`linear-gradient(90deg,transparent,${BIO},${GOLD},${HUM},${CLM},transparent)`,
          opacity:0.5 }} />
        <div style={{ maxWidth:1600, margin:"0 auto", display:"flex", alignItems:"center",
          justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:7, letterSpacing:"0.2em", color:GOLD, marginBottom:3 }}>
              AETHER · SELF-ORGANIZATION ISOMORPHISM · SOI · KINETIC URBAN FABRIC · Φ(E,S)=K
            </div>
            <div style={{ fontFamily:serif, fontSize:20, letterSpacing:2, color:"#fff" }}>
              SOI · KINETIC BUILDING SYSTEM
            </div>
            <div style={{ fontFamily:body, fontStyle:"italic", fontSize:11, color:MUTED, marginTop:2 }}>
              Buildings as isolation · oscillation · rotation machines · all human technology in one housing system · governed by the Integration Constant of Reality
            </div>
          </div>
          <div style={{ display:"flex", gap:4 }}>
            {tabs.map(([id,label,c])=>(
              <button key={id} onClick={()=>setTab(id)} style={{
                padding:"6px 12px", fontFamily:mono, fontSize:8, letterSpacing:"0.1em",
                cursor:"pointer", borderRadius:2, transition:"all 0.15s",
                border:`1px solid ${tab===id?c:BORDER}`,
                background:tab===id?`${c}18`:"transparent",
                color:tab===id?c:MUTED }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:10, color:MUTED,
            maxWidth:240, lineHeight:1.65 }}>
            Φ(E,S) = K — the building is not inert. It embodies the Integration Constant of Reality — an active participant in the same principles governing brains, ecosystems, and markets.
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth:1600, margin:"0 auto", padding:"14px 20px 32px",
        display:"grid", gridTemplateColumns:"270px 1fr 300px", gap:12 }}>

        {/* ══ LEFT ══ */}
        <div>
          {/* Source images */}
          <div style={panelBox}>
            {topLine()}
            <SH label="SOI Framework · Source" color={GOLD} />
            <ImgCard src={img_soi_overview} caption="SOI: Unified Framework for Kinetic Urban Fabric · Shia H. Miller · June 3, 2026" />
            <ImgCard src={img_soi_domains} caption="SOI isomorphism: Biological · Economic · Human Development streams converging through K" small />
            <ImgCard src={img_mobile_app} caption="Kinetic city: Φ(E,S)=K — buildings as active participants in the Integration Constant" small />
          </div>

          {/* Domain selector */}
          <div style={panelBox}>
            {topLine(BIO)}
            <SH label="Four Coupled Domains" color={BIO} />
            {DOMAINS.map(d=>(
              <div key={d.id} onClick={()=>setActiveDomain(d.id)} style={{
                marginBottom:5, padding:"7px 9px", cursor:"pointer",
                background:activeDomain===d.id?`${d.color}12`:"transparent",
                border:`1px solid ${activeDomain===d.id?d.color:BORDER}`,
                borderRadius:2, transition:"all 0.13s" }}>
                <div style={{ fontSize:8, fontWeight:"bold", color:d.color, marginBottom:2 }}>{d.name}</div>
                <div style={{ fontFamily:serif, fontSize:9, color:d.color, marginBottom:2, opacity:0.7 }}>{d.eq}</div>
                <div style={{ fontSize:7, color:MUTED }}>{d.sub}</div>
                {activeDomain===d.id && (
                  <div style={{ marginTop:6 }}>
                    <div style={{ fontSize:7, color:MUTED, marginBottom:3 }}>Sensors:</div>
                    {d.sensors.map(s=>(
                      <div key={s} style={{ fontSize:7, color:d.color+"90", padding:"2px 5px",
                        marginBottom:2, borderLeft:`1px solid ${d.color}40` }}>{s}</div>
                    ))}
                    <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.6, marginTop:4 }}>{d.response}</div>
                    <div style={{ fontFamily:body, fontSize:9, color:d.color+"80", lineHeight:1.5, marginTop:4,
                      padding:"4px 6px", background:`${d.color}06`, borderRadius:2 }}>{d.aetherLink}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ══ CENTER ══ */}
        <div>
          {/* Canvas */}
          <div style={{ ...panelBox, padding:0, overflow:"hidden" }}>
            <div style={{ padding:"6px 12px 5px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontSize:7, color:MUTED, letterSpacing:"0.13em" }}>
                {tab==="building"    ? "Kinetic building · four domain wings · K-node at centre · robotic articulation · perturbation signals" :
                 tab==="integration" ? "Three domain streams converge through K · cross-system coupling · synced transformation → SUPRK" :
                 "MPC transport · coherent region Ω moves around stationary object · 4-phase cycle · space-fabric displacement"}
              </div>
              <div style={{ fontSize:8, color:tab==="building"?GOLD:tab==="integration"?K_COL:CLM }}>
                {tab==="building"?"Φ(E,S)=K":tab==="integration"?"∂A/∂t=D∇²A+f+λK":"Ω coherent region transport"}
              </div>
            </div>
            {tab==="building"    && <BuildingCanvas />}
            {tab==="integration" && <IntegrationCanvas />}
            {tab==="mpc"         && <MpcCanvas />}
          </div>

          {/* Design Principles */}
          <div style={panelBox}>
            {topLine(GOLD)}
            <SH label="4 Design Principles · Kinetic Self-Reconfiguring Urban Fabric" color={GOLD} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5, marginBottom:8 }}>
              {PRINCIPLES.map((p,i)=>(
                <div key={p.n} onClick={()=>setActivePrinciple(i)} style={{
                  padding:"7px 9px", cursor:"pointer",
                  background:activePrinciple===i?`${p.color}10`:"transparent",
                  border:`1px solid ${activePrinciple===i?p.color:BORDER}`,
                  borderRadius:2, transition:"all 0.13s" }}>
                  <div style={{ display:"flex", gap:6, marginBottom:2 }}>
                    <div style={{ fontSize:8, color:p.color, width:20 }}>{p.n}</div>
                    <div style={{ fontSize:8, color:p.color, fontWeight:"bold" }}>{p.name}</div>
                  </div>
                  <div style={{ fontSize:7, color:MUTED }}>{p.sub}</div>
                </div>
              ))}
            </div>
            <div style={{ padding:"8px 10px", background:`${ap.color}08`,
              border:`1px solid ${ap.color}25`, borderRadius:2 }}>
              <div style={{ fontSize:8, fontWeight:"bold", color:ap.color, marginBottom:4 }}>
                {ap.n} · {ap.name}
              </div>
              <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.75, marginBottom:6 }}>
                {ap.detail}
              </div>
              <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                {ap.units.map(u=>(
                  <div key={u} style={{ padding:"2px 7px", fontSize:7, borderRadius:2,
                    border:`1px solid ${ap.color}30`, color:ap.color }}>
                    {u}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* MPC Transport steps */}
          <div style={{ ...panelBox, border:`1px solid ${CLM}30` }}>
            {topLine(CLM)}
            <SH label="MPC Transport System · 4-Phase Cycle" color={CLM} />
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, marginBottom:8, lineHeight:1.7 }}>
              Standard logistics: object moves through space. MPC: moves a coherent region of space-fabric <em>around</em> the object. The object is stationary in its local reference frame throughout the entire transport cycle.
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:5 }}>
              {MPC_STEPS.map((s,i)=>(
                <div key={s.n} onClick={()=>setActiveMpcStep(i)} style={{
                  padding:"7px 9px", cursor:"pointer",
                  background:activeMpcStep===i?`${s.color}10`:"transparent",
                  border:`1px solid ${activeMpcStep===i?s.color:BORDER}`,
                  borderRadius:2, transition:"all 0.13s" }}>
                  <div style={{ display:"flex", gap:6, marginBottom:2 }}>
                    <div style={{ fontFamily:serif, fontSize:12, color:s.color }}>{s.n}</div>
                    <div>
                      <div style={{ fontSize:8, color:s.color, fontWeight:"bold" }}>{s.label}</div>
                      <div style={{ fontSize:7, color:MUTED }}>{s.sub}</div>
                    </div>
                  </div>
                  {activeMpcStep===i && (
                    <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.55, marginTop:4 }}>{s.desc}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ RIGHT ══ */}
        <div>
          {/* Kinetic building image */}
          <div style={panelBox}>
            {topLine(BIO)}
            <SH label="Kinetic Building · SOI Architecture" color={BIO} />
            <ImgCard src={img_soi_kinetic} caption="SOI building: robotic articulation · rotating wings · modules extend/retract on financial feeds · K active architectural state" />
            <ImgCard src={img_mpc_transport} caption="MPC: Spatial Reconfiguration Logistics — coherent region Ω isolates and transports embedded matter via displacement pulse" />
          </div>

          {/* Interior rooms */}
          <div style={panelBox}>
            {topLine(HUM)}
            <SH label="Interior Room System · Click to Explore" color={HUM} />
            <div style={{ marginBottom:8 }}>
              <ImgCard src={img_interior}
                caption="Integration Constant of Reality interior: Bio-Dome · Economic Forum · Human Development · Cellular Network · K-Node Hub" />
            </div>
            {ROOMS.map(rm=>(
              <div key={rm.id} onClick={()=>setActiveRoom(rm.id)} style={{
                marginBottom:4, padding:"6px 8px", cursor:"pointer",
                background:activeRoom===rm.id?`${rm.color}10`:"transparent",
                border:`1px solid ${activeRoom===rm.id?rm.color:BORDER}`,
                borderRadius:2, transition:"all 0.12s" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <div style={{ fontSize:8, fontWeight:"bold", color:rm.color }}>{rm.name}</div>
                  <div style={{ fontSize:7, color:MUTED }}>{rm.wing}</div>
                </div>
                <div style={{ fontSize:7, color:MUTED }}>{rm.capacity}</div>
                {activeRoom===rm.id && (
                  <>
                    <div style={{ fontFamily:body, fontSize:9, color:TEXT, lineHeight:1.55, marginTop:4 }}>{rm.desc}</div>
                    <div style={{ marginTop:5, fontSize:7, color:rm.color+"80",
                      padding:"3px 6px", background:`${rm.color}06`, borderRadius:2 }}>
                      {rm.tech}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Core synthesis */}
          <div style={{ ...panelBox, border:`1px solid ${GOLD}35` }}>
            {topLine()}
            <SH label="AETHER · SOI Synthesis" color={GOLD} />
            <div style={{ padding:"6px 8px", background:`${GOLD}08`,
              border:`1px solid ${GOLD}20`, borderRadius:2, marginBottom:6 }}>
              <div style={{ fontFamily:serif, fontSize:13, color:GOLD, marginBottom:4, textAlign:"center" }}>
                Φ(E,S) = K
              </div>
              <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.75 }}>
                The building does not aggregate four separate functions. It recognises that all levels — biology, climate, economics, human psychology — are governed by the same Integration Constant K. A perturbation in any domain simultaneously requires a synced transformation in all others. K preserves coherence across all of them at once.
              </div>
            </div>
            <div style={{ fontFamily:body, fontSize:10, color:TEXT, lineHeight:1.8, marginBottom:6 }}>
              "Integration is not the aggregation of separate analyses. It is the recognition that all levels are governed by the same constants, and that transformation requires perturbation that reaches across all of them simultaneously."
            </div>
            <div style={{ fontFamily:body, fontSize:10, color:MUTED, lineHeight:1.8 }}>
              The AETHER connections: the <span style={{ color:BIO }}>seamoss gate</span> IS the bio-layer sensor membrane. The <span style={{ color:GOLD }}>torsion resonator</span> IS the climate sensor on the roof. The <span style={{ color:HUM }}>engine computer</span> IS the recursive self-correction that fires at each perturbation. The <span style={{ color:CLM }}>bioluminescence spectrum</span> IS the building's lighting and coherence display layer. SOI unifies them all into a single housing system.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

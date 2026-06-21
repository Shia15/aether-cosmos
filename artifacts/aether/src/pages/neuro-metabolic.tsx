import { useCallback, useEffect, useRef, useState } from "react";

/* ── Palette ─────────────────────────────────────────── */
const BG   = "#020408";
const TEAL = "#2ef0d8";
const GOLD = "#c9a84c";
const VIO  = "#9966ff";
const AMB  = "#ff9933";
const ROSE = "#ff4477";
const BLUE = "#44aaff";
const GRN  = "#44cc77";
const TEXT = "#c8d8e0";
const DIM  = "#3a5060";
const PINK = "#ff99cc";
const mono = "'Space Mono', monospace";
const serif= "'Cinzel', serif";
const body = "'Crimson Pro', Georgia, serif";

/* ══════════════════════════════════════════════════════════
   CANVAS 1 — BRAIN REGIONS · REWARD CIRCUITRY
   Brain lateral view + dopamine mesolimbic/mesocortical
══════════════════════════════════════════════════════════ */
function BrainRewardCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [rewardActive, setRewardActive] = useState(false);
  const [stressActive, setStressActive] = useState(false);
  const stateRef = useRef({ reward: false, stress: false, rewardT: 0, stressT: 0 });

  const triggerReward = useCallback(() => {
    stateRef.current.reward = true;
    stateRef.current.rewardT = 0;
    setRewardActive(true);
    setTimeout(() => { stateRef.current.reward = false; setRewardActive(false); }, 3000);
  }, []);

  const triggerStress = useCallback(() => {
    stateRef.current.stress = true;
    stateRef.current.stressT = 0;
    setStressActive(true);
    setTimeout(() => { stateRef.current.stress = false; setStressActive(false); }, 3000);
  }, []);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    cv.width  = Math.round(cv.clientWidth  * dpr);
    cv.height = Math.round(cv.clientHeight * dpr);
    const ctx = cv.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const W = cv.clientWidth, H = cv.clientHeight;

    /* ── Brain regions ── */
    const REGIONS = {
      PFC:   { x: W*0.20, y: H*0.24, rx: 48, ry: 30, col: TEAL,  label: "PFC",          long: "Prefrontal Cortex" },
      ACC:   { x: W*0.30, y: H*0.28, rx: 28, ry: 18, col: BLUE,  label: "ACC",           long: "Anterior Cingulate" },
      HIPP:  { x: W*0.42, y: H*0.56, rx: 32, ry: 16, col: GRN,   label: "HIPP",          long: "Hippocampus" },
      AMYG:  { x: W*0.35, y: H*0.56, rx: 22, ry: 14, col: ROSE,  label: "AMYG",          long: "Amygdala" },
      NAcc:  { x: W*0.33, y: H*0.46, rx: 24, ry: 16, col: GOLD,  label: "NAcc",          long: "Nucleus Accumbens" },
      HYPO:  { x: W*0.40, y: H*0.65, rx: 22, ry: 14, col: AMB,   label: "HYPO",          long: "Hypothalamus" },
      VTA:   { x: W*0.44, y: H*0.76, rx: 22, ry: 14, col: VIO,   label: "VTA",           long: "Ventral Tegmental Area" },
      SN:    { x: W*0.37, y: H*0.76, rx: 18, ry: 12, col: PINK,  label: "SN",            long: "Substantia Nigra" },
      BSTEM: { x: W*0.41, y: H*0.88, rx: 24, ry: 14, col: `${ROSE}cc`, label: "BST",    long: "Brainstem" },
      CEREB: { x: W*0.58, y: H*0.74, rx: 34, ry: 28, col: `${TEAL}88`, label: "CER",    long: "Cerebellum" },
    };

    /* ── Dopamine pathway waypoints ── */
    // Mesolimbic: VTA → NAcc (reward)
    const MESO_PATH = [
      { x: REGIONS.VTA.x,  y: REGIONS.VTA.y  },
      { x: REGIONS.VTA.x - 20, y: REGIONS.VTA.y - 40 },
      { x: REGIONS.NAcc.x, y: REGIONS.NAcc.y + 10 },
      { x: REGIONS.NAcc.x, y: REGIONS.NAcc.y },
    ];
    // Mesocortical: VTA → PFC
    const CORTICAL_PATH = [
      { x: REGIONS.VTA.x,  y: REGIONS.VTA.y  },
      { x: REGIONS.VTA.x - 30, y: REGIONS.VTA.y - 60 },
      { x: REGIONS.ACC.x + 10, y: REGIONS.ACC.y + 30 },
      { x: REGIONS.PFC.x + 20, y: REGIONS.PFC.y + 10 },
    ];
    // Nigrostriatal: SN → (motor control)
    const NIGRO_PATH = [
      { x: REGIONS.SN.x,  y: REGIONS.SN.y },
      { x: REGIONS.SN.x - 10, y: REGIONS.SN.y - 50 },
      { x: REGIONS.ACC.x - 10, y: REGIONS.ACC.y + 20 },
    ];
    // HPA: HYPO → downstream (stress cortisol)
    const HPA_PATH = [
      { x: REGIONS.HYPO.x, y: REGIONS.HYPO.y },
      { x: REGIONS.HYPO.x + 20, y: REGIONS.HYPO.y + 20 },
      { x: W * 0.65, y: H * 0.80 },
      { x: W * 0.72, y: H * 0.90 },
    ];

    /* neurotransmitter packets */
    interface Packet { path: typeof MESO_PATH; t: number; speed: number; col: string; label: string }
    const packets: Packet[] = [];

    const interpPath = (path: typeof MESO_PATH, t: number) => {
      const seg = (path.length - 1) * t;
      const i = Math.min(Math.floor(seg), path.length - 2);
      const f = seg - i;
      return {
        x: path[i].x + (path[i+1].x - path[i].x) * f,
        y: path[i].y + (path[i+1].y - path[i].y) * f,
      };
    };

    const drawPath = (path: typeof MESO_PATH, col: string, alpha: number, lw: number) => {
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let k = 1; k < path.length; k++) {
        const mx = (path[k-1].x + path[k].x) / 2;
        const my = (path[k-1].y + path[k].y) / 2;
        ctx.quadraticCurveTo(path[k-1].x, path[k-1].y, mx, my);
      }
      ctx.lineTo(path[path.length-1].x, path[path.length-1].y);
      ctx.strokeStyle = col + Math.round(alpha * 255).toString(16).padStart(2,"0");
      ctx.lineWidth = lw; ctx.stroke();
    };

    /* brain outline path */
    const drawBrain = (alpha: number) => {
      const ox = W * 0.03, oy = H * 0.04;
      ctx.save(); ctx.globalAlpha = alpha;
      // main hemisphere
      ctx.beginPath();
      ctx.moveTo(ox + 120, oy + 215);
      ctx.bezierCurveTo(ox + 75, oy + 155, ox + 90, oy + 70, ox + 200, oy + 48);
      ctx.bezierCurveTo(ox + 265, oy + 28, ox + 345, oy + 22, ox + 415, oy + 48);
      ctx.bezierCurveTo(ox + 468, oy + 68, ox + 498, oy + 95, ox + 502, oy + 138);
      ctx.bezierCurveTo(ox + 516, oy + 190, ox + 494, oy + 245, ox + 452, oy + 272);
      ctx.bezierCurveTo(ox + 398, oy + 308, ox + 295, oy + 320, ox + 188, oy + 295);
      ctx.bezierCurveTo(ox + 148, oy + 275, ox + 120, oy + 252, ox + 120, oy + 215);
      ctx.strokeStyle = `${TEXT}20`; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.fillStyle = `rgba(10,20,40,0.25)`; ctx.fill();

      // cortical sulci suggestion
      const sulci = [
        [[ox+200,oy+60],[ox+180,oy+120],[ox+200,oy+170]],
        [[ox+310,oy+40],[ox+320,oy+100],[ox+340,oy+160]],
        [[ox+400,oy+80],[ox+420,oy+140],[ox+400,oy+200]],
        [[ox+150,oy+160],[ox+200,oy+200],[ox+240,oy+240]],
      ];
      for (const s of sulci) {
        ctx.beginPath(); ctx.moveTo(s[0][0], s[0][1]);
        ctx.quadraticCurveTo(s[1][0], s[1][1], s[2][0], s[2][1]);
        ctx.strokeStyle = `${TEXT}10`; ctx.lineWidth = 0.8; ctx.stroke();
      }

      // brainstem
      ctx.beginPath();
      ctx.moveTo(ox + 340, oy + 290);
      ctx.bezierCurveTo(ox + 330, oy + 310, ox + 330, oy + 350, ox + 335, oy + 380);
      ctx.bezierCurveTo(ox + 340, oy + 405, ox + 365, oy + 415, ox + 375, oy + 405);
      ctx.bezierCurveTo(ox + 385, oy + 390, ox + 385, oy + 350, ox + 385, oy + 320);
      ctx.bezierCurveTo(ox + 385, oy + 300, ox + 370, oy + 285, ox + 340, oy + 290);
      ctx.strokeStyle = `${ROSE}30`; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = `rgba(255,68,119,0.05)`; ctx.fill();

      // cerebellum
      ctx.beginPath();
      ctx.ellipse(ox + 455, oy + 310, 55, 42, 0.2, 0, Math.PI * 2);
      ctx.strokeStyle = `${TEAL}18`; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.fillStyle = `rgba(46,240,216,0.04)`; ctx.fill();

      ctx.restore();
    };

    let t = 0;
    const draw = () => {
      t++;
      const { reward, stress, rewardT, stressT } = stateRef.current;
      if (reward) stateRef.current.rewardT++;
      if (stress) stateRef.current.stressT++;

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* brain outline */
      drawBrain(1);

      /* pathways */
      const rewardStr = reward ? Math.min(1, stateRef.current.rewardT / 30) : 0.28;
      drawPath(MESO_PATH,     VIO,  rewardStr, reward ? 2.5 : 1.2);
      drawPath(CORTICAL_PATH, TEAL, rewardStr * 0.8, reward ? 2 : 1.0);
      drawPath(NIGRO_PATH,    PINK, 0.22, 0.9);
      const stressStr = stress ? Math.min(1, stateRef.current.stressT / 30) : 0.18;
      drawPath(HPA_PATH, AMB, stressStr, stress ? 2 : 0.9);

      /* spawn packets */
      if (reward && t % 8 === 0) {
        packets.push({ path: MESO_PATH,     t: 0, speed: 0.012, col: VIO,  label: "DA" });
        packets.push({ path: CORTICAL_PATH, t: 0, speed: 0.009, col: TEAL, label: "DA" });
      }
      if (!reward && t % 80 === 0) {
        packets.push({ path: MESO_PATH, t: 0, speed: 0.006, col: VIO + "80", label: "DA" });
      }
      if (stress && t % 10 === 0) {
        packets.push({ path: HPA_PATH, t: 0, speed: 0.010, col: AMB, label: "CRH" });
      }
      if (t % 120 === 0) {
        packets.push({ path: NIGRO_PATH, t: 0, speed: 0.007, col: PINK, label: "DA" });
      }

      /* move & draw packets */
      for (let k = packets.length - 1; k >= 0; k--) {
        const p = packets[k]; p.t += p.speed;
        if (p.t >= 1) { packets.splice(k, 1); continue; }
        const pos = interpPath(p.path, p.t);
        // glow
        const pg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 10);
        pg.addColorStop(0, p.col + "cc"); pg.addColorStop(1, p.col + "00");
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = pg; ctx.fill();
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = p.col; ctx.fill();
        ctx.font = `5.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillStyle = p.col + "cc"; ctx.fillText(p.label, pos.x, pos.y - 6);
      }

      /* region ellipses */
      for (const [, r] of Object.entries(REGIONS)) {
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.03 + r.x * 0.01);
        const isRew = (r.label === "VTA" || r.label === "NAcc" || r.label === "PFC" || r.label === "ACC") && reward;
        const isStr = (r.label === "AMYG" || r.label === "HYPO" || r.label === "BST") && stress;
        const gAlpha = isRew ? 0.5 + 0.4 * Math.sin(t * 0.15) : isStr ? 0.4 + 0.4 * Math.sin(t * 0.18) : 0.18 * pulse;

        ctx.beginPath(); ctx.ellipse(r.x, r.y, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = r.col + Math.round(gAlpha * 255).toString(16).padStart(2, "0");
        ctx.fill();
        ctx.strokeStyle = r.col + (isRew || isStr ? "cc" : "50");
        ctx.lineWidth = isRew || isStr ? 1.8 : 0.9; ctx.stroke();

        ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = r.col; ctx.fillText(r.label, r.x, r.y);
      }

      /* reward burst flash */
      if (reward && rewardT < 20) {
        const alpha2 = (20 - rewardT) / 20;
        const bg2 = ctx.createRadialGradient(REGIONS.NAcc.x, REGIONS.NAcc.y, 0, REGIONS.NAcc.x, REGIONS.NAcc.y, 80 * alpha2);
        bg2.addColorStop(0, `rgba(153,102,255,${alpha2 * 0.5})`); bg2.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = bg2; ctx.beginPath(); ctx.arc(REGIONS.NAcc.x, REGIONS.NAcc.y, 80, 0, Math.PI * 2); ctx.fill();
      }

      /* right panel legend */
      const LX = W * 0.78, LY = 14;
      ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}80`; ctx.fillText("REWARD CIRCUITRY", LX, LY);
      const pathLabs = [
        { col: VIO,  label: "Mesolimbic  VTA→NAcc"    },
        { col: TEAL, label: "Mesocortical VTA→PFC"    },
        { col: PINK, label: "Nigrostriatal SN→Str"    },
        { col: AMB,  label: "HPA Axis HYPO→Pituitary" },
      ];
      for (let k = 0; k < pathLabs.length; k++) {
        const l = pathLabs[k];
        ctx.fillStyle = l.col; ctx.fillRect(LX, LY + 18 + k * 14, 8, 3);
        ctx.fillStyle = DIM + "dd"; ctx.fillText(l.label, LX + 12, LY + 14 + k * 14);
      }

      /* dopamine levels bar */
      const daLevel = reward ? Math.min(1, stateRef.current.rewardT / 60) :
                      stress ? Math.max(0.1, 0.4 - stateRef.current.stressT / 200) : 0.38;
      const cortLevel = stress ? Math.min(1, stateRef.current.stressT / 60) : 0.22;

      const readouts = [
        { label:"DOPAMINE",  val: daLevel,   col: VIO  },
        { label:"CORTISOL",  val: cortLevel, col: AMB  },
        { label:"SEROTONIN", val: stress ? 0.28 : 0.55, col: BLUE },
        { label:"GABA",      val: reward ? 0.62 : 0.48, col: GRN  },
      ];

      ctx.fillStyle = `${TEAL}80`; ctx.fillText("NEUROMOD LEVELS", LX, LY + 78);
      for (let k = 0; k < readouts.length; k++) {
        const r2 = readouts[k], ry2 = LY + 96 + k * 22;
        ctx.font = `6px ${mono}`; ctx.fillStyle = r2.col + "80"; ctx.fillText(r2.label, LX, ry2);
        ctx.fillStyle = "#0a1428"; ctx.fillRect(LX, ry2 + 8, W - LX - 12, 6);
        ctx.fillStyle = r2.col + "55"; ctx.fillRect(LX, ry2 + 8, (W - LX - 12) * r2.val, 6);
        ctx.strokeStyle = r2.col + "30"; ctx.lineWidth = 0.5; ctx.strokeRect(LX, ry2 + 8, W - LX - 12, 6);
        ctx.font = `6px ${mono}`; ctx.textAlign = "right";
        ctx.fillStyle = r2.col; ctx.fillText(`${(r2.val * 100).toFixed(0)}%`, W - 12, ry2);
        ctx.textAlign = "left";
      }

      /* RPE signal */
      const rpeY = LY + 190;
      ctx.font = `7px ${mono}`; ctx.fillStyle = `${GOLD}80`; ctx.fillText("RPE SIGNAL", LX, rpeY);
      const rpeVal = reward ? (stateRef.current.rewardT < 30 ? 1 : Math.max(0, 1 - (stateRef.current.rewardT - 30) / 30)) : 0;
      ctx.font = `14px ${mono}`; ctx.fillStyle = GOLD;
      ctx.fillText(rpeVal > 0.5 ? "+δ BURST" : rpeVal > 0.1 ? "+δ" : "TONIC",
        LX, rpeY + 14);
      ctx.font = `6px ${mono}`; ctx.fillStyle = DIM + "cc";
      ctx.fillText("Reward prediction error", LX, rpeY + 30);
      ctx.fillText("phasic DA release signal", LX, rpeY + 40);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{ position:"relative" }}>
      <canvas ref={cvRef} style={{ width:"100%", height:420, borderRadius:12,
        border:`1px solid ${VIO}20`, background:BG, display:"block" }} />
      <div style={{ display:"flex", gap:8, padding:"10px 0 0", justifyContent:"center" }}>
        <button onClick={triggerReward}
          style={{ fontFamily:mono, fontSize:9, padding:"8px 20px", borderRadius:6,
            border:`1px solid ${VIO}60`, background: rewardActive ? VIO+"22" : "transparent",
            color: rewardActive ? VIO : DIM, cursor:"pointer",
            boxShadow: rewardActive ? `0 0 12px ${VIO}40` : "none" }}>
          ▶ TRIGGER REWARD — DOPAMINE BURST
        </button>
        <button onClick={triggerStress}
          style={{ fontFamily:mono, fontSize:9, padding:"8px 20px", borderRadius:6,
            border:`1px solid ${AMB}60`, background: stressActive ? AMB+"22" : "transparent",
            color: stressActive ? AMB : DIM, cursor:"pointer",
            boxShadow: stressActive ? `0 0 12px ${AMB}40` : "none" }}>
          ▶ TRIGGER STRESS — CORTISOL SURGE
        </button>
      </div>
      <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:6, lineHeight:2.0 }}>
        VIOLET=Mesolimbic VTA→NAcc (reward salience) · TEAL=Mesocortical VTA→PFC (executive control) ·
        PINK=Nigrostriatal SN→Striatum (motor, habit) · GOLD=RPE reward prediction error (phasic DA signal) ·
        AMBER=HPA axis stress cascade · Click buttons to trigger phasic events
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS 2 — METABOLIC DYSFUNCTION
   Normal vs dysfunctional mitochondria · ETC · ROS · ATP
══════════════════════════════════════════════════════════ */
function MetabolicCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [dysfLevel, setDysfLevel] = useState(0.3);
  const dysfRef = useRef(0.3);
  useEffect(() => { dysfRef.current = dysfLevel; }, [dysfLevel]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    cv.width  = Math.round(cv.clientWidth  * dpr);
    cv.height = Math.round(cv.clientHeight * dpr);
    const ctx = cv.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const W = cv.clientWidth, H = cv.clientHeight;

    /* ETC complexes */
    const COMPLEXES = [
      { n:"I",   label:"Complex I\nNADH-DH",    x: 0.12, col: BLUE  },
      { n:"II",  label:"Complex II\nSucc-DH",   x: 0.24, col: GRN   },
      { n:"III", label:"Complex III\nCyt bc₁",  x: 0.36, col: TEAL  },
      { n:"IV",  label:"Complex IV\nCox",        x: 0.48, col: AMB   },
      { n:"V",   label:"ATP Synthase\nF₁F₀",    x: 0.62, col: GOLD  },
    ];

    /* particles */
    interface MParticle { x:number; y:number; vx:number; vy:number; col:string; label:string; life:number; maxLife:number; size:number }
    const particles: MParticle[] = [];

    const spawnElectron = (startX: number, startY: number, panel: "left"|"right") => {
      particles.push({ x: startX, y: startY,
        vx: (panel === "left" ? 1.4 : 1.1) + Math.random() * 0.6,
        vy: (Math.random() - 0.5) * 0.5,
        col: BLUE, label: "e⁻", life: 0, maxLife: 180, size: 3 });
    };

    const spawnATP = (panel: "left"|"right", cx2: number, cy2: number) => {
      particles.push({ x: cx2, y: cy2,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -1.5 - Math.random() * 1.5,
        col: GOLD, label: "ATP", life: 0, maxLife: 90, size: 3.5 });
    };

    const spawnROS = (cx2: number, cy2: number) => {
      particles.push({ x: cx2, y: cy2,
        vx: (Math.random() - 0.5) * 2.5,
        vy: (Math.random() - 0.5) * 2.5,
        col: ROSE, label: "ROS", life: 0, maxLife: 120, size: 3 });
    };

    const spawnProton = (cx2: number, cy2: number, panel: "left"|"right") => {
      particles.push({ x: cx2, y: cy2,
        vx: panel === "left" ? -0.4 : -0.3,
        vy: 0,
        col: AMB, label: "H⁺", life: 0, maxLife: 140, size: 2.5 });
    };

    let t = 0;
    const PANEL_W = W * 0.47, PANEL_H = H * 0.78;
    const LP = { x: W * 0.01, y: H * 0.12 }; // left panel origin
    const RP = { x: W * 0.52, y: H * 0.12 }; // right panel origin

    const drawMitoPanel = (ox: number, oy: number, dysf: number) => {
      const pw = PANEL_W, ph = PANEL_H;

      // outer membrane
      ctx.beginPath(); ctx.ellipse(ox + pw/2, oy + ph/2, pw/2, ph/2, 0, 0, Math.PI*2);
      ctx.strokeStyle = `${TEAL}40`; ctx.lineWidth = 1.8; ctx.stroke();
      ctx.fillStyle = `rgba(0,30,50,0.3)`; ctx.fill();

      // inner membrane (cristae)
      ctx.beginPath(); ctx.ellipse(ox + pw/2, oy + ph/2, pw/2 - 10, ph/2 - 10, 0, 0, Math.PI*2);
      ctx.strokeStyle = `${TEAL}${dysf > 0.6 ? "30" : "60"}`; ctx.lineWidth = 1.2; ctx.stroke();

      // cristae folds (become fewer with dysfunction)
      const nCristae = Math.round((1 - dysf * 0.6) * 5);
      for (let k = 0; k < nCristae; k++) {
        const cy2 = oy + ph * 0.25 + k * (ph * 0.5 / nCristae);
        const hw = (pw/2 - 12) * (0.6 + 0.4 * Math.abs(Math.sin(k)));
        ctx.beginPath(); ctx.moveTo(ox + pw/2 - hw, cy2); ctx.lineTo(ox + pw/2 + hw, cy2);
        ctx.strokeStyle = `${TEAL}28`; ctx.lineWidth = 0.8; ctx.stroke();
      }

      // matrix label
      ctx.font = `6px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}40`; ctx.fillText("MATRIX", ox + pw/2, oy + ph * 0.12);

      // ETC complexes along inner membrane floor
      const etcY = oy + ph * 0.67;
      for (const c of COMPLEXES) {
        const cx2 = ox + pw * c.x + pw * 0.06;
        const cw = pw * 0.095, ch = ph * 0.18;
        const damaged = dysf > 0.5 && (c.n === "I" || c.n === "III");

        ctx.fillStyle = damaged ? `${ROSE}18` : `${c.col}18`;
        ctx.fillRect(cx2 - cw/2, etcY - ch, cw, ch);
        ctx.strokeStyle = damaged ? `${ROSE}60` : `${c.col}60`;
        ctx.lineWidth = 0.9; ctx.strokeRect(cx2 - cw/2, etcY - ch, cw, ch);

        if (damaged) {
          ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
          ctx.fillStyle = `${ROSE}80`; ctx.fillText("✕", cx2, etcY - ch/2);
        }
        ctx.font = `5.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillStyle = damaged ? `${ROSE}80` : `${c.col}cc`;
        ctx.fillText(c.n, cx2, etcY);
      }

      // inner membrane top (proton pumps)
      const imY = oy + ph * 0.20;
      ctx.beginPath(); ctx.moveTo(ox + pw * 0.08, imY); ctx.lineTo(ox + pw * 0.92, imY);
      ctx.strokeStyle = `${GOLD}20`; ctx.lineWidth = 3.5; ctx.stroke();
      ctx.font = `5.5px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "bottom";
      ctx.fillStyle = `${GOLD}50`; ctx.fillText("←  H⁺ gradient  IMS →", ox + pw * 0.1, imY - 2);

      // mtDNA (circle in matrix)
      if (dysf < 0.8) {
        const mtX = ox + pw * 0.78, mtY = oy + ph * 0.42;
        ctx.beginPath(); ctx.arc(mtX, mtY, 8, 0, Math.PI*2);
        ctx.strokeStyle = `${GRN}50`; ctx.lineWidth = 1; ctx.stroke();
        ctx.font = `5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = `${GRN}80`; ctx.fillText("mtDNA", mtX, mtY);
      } else {
        const mtX = ox + pw * 0.78, mtY = oy + ph * 0.42;
        ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = `${ROSE}80`; ctx.fillText("✕mtDNA", mtX, mtY);
      }
    };

    const draw = () => {
      t++;
      const dysf = dysfRef.current;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* panel backgrounds */
      ctx.fillStyle = "rgba(0,20,40,0.2)"; ctx.fillRect(LP.x, LP.y, PANEL_W, PANEL_H);
      ctx.fillStyle = "rgba(40,0,10,0.2)"; ctx.fillRect(RP.x, RP.y, PANEL_W, PANEL_H);

      drawMitoPanel(LP.x, LP.y, 0.0);      // healthy (left)
      drawMitoPanel(RP.x, RP.y, dysf);     // dysfunctional (right)

      /* panel labels */
      ctx.font = `8px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${GRN}80`;  ctx.fillText("HEALTHY MITOCHONDRIA",    LP.x + PANEL_W/2, LP.y - 14);
      ctx.fillStyle = `${ROSE}80`; ctx.fillText("DYSFUNCTIONAL MITOCHONDRIA", RP.x + PANEL_W/2, RP.y - 14);

      /* spawn particles */
      // healthy: electrons hop left→right, protons pump outward, ATP from complex V
      if (t % 18 === 0) spawnElectron(LP.x + PANEL_W * 0.10, LP.y + PANEL_H * 0.67 - PANEL_H * 0.09, "left");
      if (t % 22 === 0) {
        spawnProton(LP.x + PANEL_W * 0.36, LP.y + PANEL_H * 0.35, "left");
        spawnProton(LP.x + PANEL_W * 0.54, LP.y + PANEL_H * 0.35, "left");
      }
      if (t % 30 === 0) spawnATP("left", LP.x + PANEL_W * 0.67, LP.y + PANEL_H * 0.62);

      // dysfunctional: fewer electrons, more ROS, less ATP
      const eFrac = Math.round((1 - dysf * 0.6) * 30);
      if (eFrac > 0 && t % eFrac === 0) spawnElectron(RP.x + PANEL_W * 0.10, RP.y + PANEL_H * 0.67 - PANEL_H * 0.09, "right");
      if (t % Math.max(8, Math.round(30 * (1 - dysf))) === 0) {
        // ROS leaks at complex I and III when dysfunctional
        spawnROS(RP.x + PANEL_W * 0.14, RP.y + PANEL_H * 0.60);
        if (dysf > 0.5) spawnROS(RP.x + PANEL_W * 0.38, RP.y + PANEL_H * 0.58);
      }
      if (dysf < 0.8 && t % Math.max(35, Math.round(30 / (1 - dysf * 0.6))) === 0) {
        spawnATP("right", RP.x + PANEL_W * 0.67, RP.y + PANEL_H * 0.62);
      }

      /* move particles */
      for (let k = particles.length - 1; k >= 0; k--) {
        const p = particles[k]; p.x += p.vx; p.y += p.vy; p.life++;
        if (p.life > p.maxLife) { particles.splice(k, 1); continue; }
        const alpha3 = Math.min(1, Math.min(p.life / 20, (p.maxLife - p.life) / 20));
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2.5);
        pg.addColorStop(0, p.col + "aa"); pg.addColorStop(1, p.col + "00");
        ctx.globalAlpha = alpha3;
        ctx.fillStyle = pg; ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI*2); ctx.fill();
        ctx.globalAlpha = alpha3 * 0.9;
        ctx.font = `5.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillStyle = p.col; ctx.fillText(p.label, p.x, p.y - p.size - 1);
        ctx.globalAlpha = 1;
      }

      /* right panel: readouts */
      const RX2 = W * 0.02;
      const atpCount = Math.round((1 - dysf * 0.7) * 36);
      const rosLevel = dysf * dysf;
      const memPot = -(180 * (1 - dysf * 0.5));

      ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      const stats = [
        { l:"ATP yield",       v:`${atpCount} mol/glucose`, col: GOLD  },
        { l:"ROS level",       v:`${(rosLevel * 100).toFixed(0)}%`,      col: ROSE  },
        { l:"ΔΨm",             v:`${memPot.toFixed(0)} mV`,              col: TEAL  },
        { l:"Complex I activ", v:`${((1-dysf*0.7)*100).toFixed(0)}%`,    col: BLUE  },
        { l:"Lactate",         v:`${(dysf * 14).toFixed(1)} mmol/L`,     col: AMB   },
        { l:"Glutathione",     v:`${((1-dysf)*100).toFixed(0)}%`,        col: GRN   },
      ];
      ctx.fillStyle = `${ROSE}70`; ctx.fillText("DYSFUNCTION READOUT", W * 0.02, H * 0.02);
      for (let k = 0; k < stats.length; k++) {
        const s = stats[k], sy = H * 0.02 + 18 + k * 16;
        ctx.fillStyle = s.col + "60"; ctx.font = `6px ${mono}`; ctx.fillText(s.l, RX2, sy);
        ctx.fillStyle = s.col; ctx.font = `7px ${mono}`; ctx.textAlign = "right";
        ctx.fillText(s.v, W * 0.49, sy); ctx.textAlign = "left";
      }

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width:"100%", height:340, borderRadius:12,
        border:`1px solid ${GRN}20`, background:BG, display:"block" }} />
      <div style={{ padding:"10px 0 0", display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ fontFamily:mono, fontSize:8, color:DIM, whiteSpace:"nowrap" }}>
          DYSFUNCTION LEVEL
        </div>
        <input type="range" min={0} max={1} step={0.01} value={dysfLevel}
          onChange={e => setDysfLevel(parseFloat(e.target.value))}
          aria-label="Mitochondrial dysfunction level"
          style={{ flex:1, accentColor:ROSE }} />
        <div style={{ fontFamily:mono, fontSize:8, color:ROSE, minWidth:40 }}>
          {(dysfLevel * 100).toFixed(0)}%
        </div>
      </div>
      <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:6, lineHeight:2.0 }}>
        BLUE e⁻ = electrons hopping through ETC Complexes I→II→III→IV · AMBER H⁺ = protons pumped
        across inner membrane building ΔΨm electrochemical gradient · GOLD ATP = synthesis at Complex V
        (ATP synthase) · RED ROS = reactive oxygen species leaking at Complex I / III when dysfunction
        rises · Slider raises dysfunction: cristae collapse, Complex I + III fail, ATP drops, ROS floods
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CANVAS 3 — NEURO-IMMUNE OVERLAP
   BBB · Microglia · Astrocytes · Cytokines · HPA · Vagus
══════════════════════════════════════════════════════════ */
function NeuroImmuneCanvas() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const [inflam, setInflam] = useState(0.25);
  const infRef = useRef(0.25);
  useEffect(() => { infRef.current = inflam; }, [inflam]);

  useEffect(() => {
    const cv = cvRef.current; if (!cv) return;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    cv.width  = Math.round(cv.clientWidth  * dpr);
    cv.height = Math.round(cv.clientHeight * dpr);
    const ctx = cv.getContext("2d")!;
    ctx.scale(dpr, dpr);
    const W = cv.clientWidth, H = cv.clientHeight;

    const BBB_Y = H * 0.50; // blood-brain barrier horizontal line

    /* Microglia state */
    interface Microglia { x:number; y:number; angle:number; processes:number; activated:boolean; phase:number }
    const microglia: Microglia[] = [];
    for (let k = 0; k < 5; k++) {
      microglia.push({
        x: W * 0.06 + k * W * 0.18, y: BBB_Y - H * 0.20,
        angle: Math.random() * Math.PI * 2, processes: 8,
        activated: false, phase: Math.random() * Math.PI * 2,
      });
    }

    /* Astrocytes */
    interface Astrocyte { x:number; y:number; phase:number }
    const astrocytes: Astrocyte[] = [];
    for (let k = 0; k < 4; k++) {
      astrocytes.push({ x: W * 0.12 + k * W * 0.22, y: BBB_Y - H * 0.30, phase: k * 0.8 });
    }

    /* Cytokine and signal particles */
    interface CytPkt { x:number; y:number; vx:number; vy:number; col:string; label:string; life:number; maxLife:number }
    const cytokines: CytPkt[] = [];

    const spawnCytokine = (cx2: number, cy2: number, target: "up"|"down", label: string, col: string) => {
      cytokines.push({
        x: cx2, y: cy2,
        vx: (Math.random() - 0.5) * 1.2,
        vy: target === "up" ? -1.2 - Math.random() * 0.8 : 1.2 + Math.random() * 0.8,
        col, label, life: 0, maxLife: 100,
      });
    };

    /* Neurons (above BBB) */
    interface Neuron { x:number; y:number; firing:boolean; fireT:number }
    const neurons: Neuron[] = [];
    for (let k = 0; k < 6; k++) {
      neurons.push({ x: W * 0.08 + k * W * 0.17, y: BBB_Y - H * 0.42, firing: false, fireT: 0 });
    }

    /* Blood vessel (below BBB) */
    const VESSEL_TOP = BBB_Y + H * 0.06, VESSEL_BOT = BBB_Y + H * 0.22;

    /* Peripheral immune cells */
    interface PCell { x:number; y:number; type:"monocyte"|"tcell"; vx:number; vy:number; attempting:boolean }
    const pcells: PCell[] = [];
    for (let k = 0; k < 4; k++) {
      pcells.push({
        x: Math.random() * W, y: VESSEL_TOP + (VESSEL_BOT - VESSEL_TOP) * (0.2 + Math.random() * 0.6),
        type: k % 2 === 0 ? "monocyte" : "tcell", vx: 0.6 + Math.random() * 0.4,
        vy: 0, attempting: false,
      });
    }

    let t = 0;

    const drawNeuron = (n: Neuron) => {
      const gR = 16;
      const ng = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, gR);
      ng.addColorStop(0, n.firing ? `rgba(46,240,216,0.9)` : `rgba(46,240,216,0.25)`);
      ng.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = ng; ctx.beginPath(); ctx.arc(n.x, n.y, gR, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(n.x, n.y, 7, 0, Math.PI*2);
      ctx.fillStyle = n.firing ? TEAL : "#0a2040"; ctx.fill();
      ctx.strokeStyle = `${TEAL}60`; ctx.lineWidth = 1; ctx.stroke();
      // dendrites
      for (let k = 0; k < 6; k++) {
        const da = n.angle === undefined ? (k / 6) * Math.PI * 2 : (k / 6) * Math.PI * 2;
        const a = (k / 6) * Math.PI * 2;
        ctx.beginPath(); ctx.moveTo(n.x, n.y);
        ctx.lineTo(n.x + Math.cos(a) * 20 * (n.firing ? 1.3 : 1),
                   n.y + Math.sin(a) * 20 * (n.firing ? 1.3 : 1));
        ctx.strokeStyle = `${TEAL}${n.firing ? "50" : "20"}`; ctx.lineWidth = 0.7; ctx.stroke();
      }
    };

    const drawMicroglia2 = (m: Microglia, inflLevel: number) => {
      m.activated = inflLevel > 0.5;
      const R = m.activated ? 10 : 7;
      const col = m.activated ? ROSE : GRN;
      const pulse4 = 0.6 + 0.4 * Math.sin(t * 0.04 + m.phase);

      if (m.activated) {
        // amoeboid: round
        const ag = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, R * 2);
        ag.addColorStop(0, `${ROSE}60`); ag.addColorStop(1, `${ROSE}00`);
        ctx.fillStyle = ag; ctx.beginPath(); ctx.arc(m.x, m.y, R * 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, Math.PI*2);
        ctx.fillStyle = `${ROSE}cc`; ctx.fill();
      } else {
        // ramified: star with processes
        ctx.beginPath(); ctx.arc(m.x, m.y, R, 0, Math.PI*2);
        ctx.fillStyle = `${GRN}50`; ctx.fill();
        const np = Math.round(8 * pulse4);
        for (let k = 0; k < np; k++) {
          const pa = (k / np) * Math.PI * 2 + t * 0.006 + m.phase;
          const pl = 16 + 8 * Math.sin(pa * 3 + t * 0.02);
          ctx.beginPath();
          ctx.moveTo(m.x + Math.cos(pa) * R * 0.8, m.y + Math.sin(pa) * R * 0.8);
          ctx.lineTo(m.x + Math.cos(pa) * pl, m.y + Math.sin(pa) * pl);
          ctx.strokeStyle = `${GRN}40`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }

      ctx.font = `5.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = col + "cc";
      ctx.fillText(m.activated ? "M1" : "M2", m.x, m.y + R + 3);
    };

    const draw = () => {
      t++;
      const inflLevel = infRef.current;

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      /* ── ZONES ── */
      // Parenchyma (brain tissue, above BBB)
      ctx.fillStyle = "rgba(0,10,30,0.35)"; ctx.fillRect(0, 0, W, BBB_Y);
      ctx.font = `7px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${TEAL}40`; ctx.fillText("BRAIN PARENCHYMA", 8, 6);

      // Subdiaphragmatic (below BBB)
      ctx.fillStyle = "rgba(30,5,5,0.25)"; ctx.fillRect(0, BBB_Y, W, H - BBB_Y);
      ctx.fillStyle = `${ROSE}40`; ctx.fillText("PERIPHERAL / CIRCULATION", 8, BBB_Y + 4);

      /* ── BLOOD-BRAIN BARRIER ── */
      const bbbBreached = inflLevel > 0.65;
      for (let x = 0; x < W; x += 14) {
        ctx.fillStyle = bbbBreached ? `${ROSE}35` : `${GOLD}50`;
        ctx.fillRect(x, BBB_Y - 3, 10, 6);
      }
      ctx.font = `7px ${mono}`; ctx.textAlign = "center";
      ctx.fillStyle = bbbBreached ? `${ROSE}90` : `${GOLD}70`;
      ctx.fillText(bbbBreached ? "⚠ BBB COMPROMISED" : "BLOOD-BRAIN BARRIER  ·  tight junctions", W/2, BBB_Y - 10);

      /* ── BLOOD VESSEL ── */
      const vesG = ctx.createLinearGradient(0, VESSEL_TOP, 0, VESSEL_BOT);
      vesG.addColorStop(0, `rgba(255,60,60,0.12)`);
      vesG.addColorStop(0.5, `rgba(200,10,10,0.20)`);
      vesG.addColorStop(1, `rgba(255,60,60,0.12)`);
      ctx.fillStyle = vesG; ctx.fillRect(0, VESSEL_TOP, W, VESSEL_BOT - VESSEL_TOP);
      ctx.strokeStyle = `${ROSE}30`; ctx.lineWidth = 1;
      ctx.strokeRect(0, VESSEL_TOP, W, VESSEL_BOT - VESSEL_TOP);
      ctx.font = `6px ${mono}`; ctx.textAlign = "left"; ctx.textBaseline = "top";
      ctx.fillStyle = `${ROSE}40`; ctx.fillText("BLOOD VESSEL", 8, VESSEL_TOP + 2);

      /* ── NEURONS ── */
      for (const n of neurons) {
        // occasional spontaneous firing
        if (Math.random() < 0.003) { n.firing = true; n.fireT = 0; }
        if (n.firing) { n.fireT++; if (n.fireT > 18) n.firing = false; }
        drawNeuron(n);
      }

      /* ── MICROGLIA ── */
      for (const m of microglia) {
        drawMicroglia2(m, inflLevel);
        // activated microglia spawn cytokines
        if (m.activated && t % 25 === 0) {
          const cytLabel = ["TNF-α","IL-1β","IL-6","CXCL10"][Math.floor(Math.random()*4)];
          spawnCytokine(m.x + (Math.random()-0.5)*20, m.y + (Math.random()-0.5)*10,
            Math.random() > 0.5 ? "up" : "down", cytLabel, ROSE);
        }
        // ramified microglia release IL-10 (anti-inflammatory)
        if (!m.activated && t % 60 === 0) {
          spawnCytokine(m.x, m.y, "down", "IL-10", GRN);
        }
      }

      /* ── ASTROCYTES ── */
      for (const a of astrocytes) {
        const aR = 18;
        ctx.beginPath(); ctx.arc(a.x, a.y, aR, 0, Math.PI*2);
        ctx.fillStyle = `${VIO}18`; ctx.fill();
        ctx.strokeStyle = `${VIO}35`; ctx.lineWidth = 0.8; ctx.stroke();
        // endfeet processes toward BBB
        for (let k = 0; k < 5; k++) {
          const pa = Math.PI / 2 + (k - 2) * 0.35;
          const pL = aR + 18 + 10 * Math.sin(t * 0.02 + k + a.phase);
          ctx.beginPath(); ctx.moveTo(a.x + Math.cos(pa) * aR, a.y + Math.sin(pa) * aR);
          ctx.lineTo(a.x + Math.cos(pa) * pL, a.y + Math.sin(pa) * pL);
          ctx.strokeStyle = `${VIO}25`; ctx.lineWidth = 0.8; ctx.stroke();
        }
        ctx.font = `5.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = `${VIO}60`; ctx.fillText("AST", a.x, a.y + aR + 2);
        // astrocytes release VEGF when inflamed
        if (inflLevel > 0.4 && t % 40 === 0) spawnCytokine(a.x, a.y, "down", "VEGF", VIO);
      }

      /* ── PERIPHERAL IMMUNE CELLS ── */
      for (const p of pcells) {
        p.x = (p.x + p.vx) % (W + 20);
        if (p.x > W + 20) p.x = -20;
        const col2 = p.type === "monocyte" ? AMB : BLUE;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.type === "monocyte" ? 7 : 5, 0, Math.PI*2);
        ctx.fillStyle = col2 + "88"; ctx.fill();
        ctx.strokeStyle = col2 + "cc"; ctx.lineWidth = 0.8; ctx.stroke();
        ctx.font = `5.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
        ctx.fillStyle = col2 + "cc";
        ctx.fillText(p.type === "monocyte" ? "Mo" : "Tc", p.x, p.y + 7);

        // attempt crossing when BBB is breached
        if (bbbBreached && t % 200 === 0 && p.y > VESSEL_TOP) {
          spawnCytokine(p.x, p.y - 2, "up", p.type === "monocyte" ? "CCL2" : "IFN-γ", col2);
        }
      }

      /* ── CYTOKINES ── */
      for (let k = cytokines.length - 1; k >= 0; k--) {
        const c = cytokines[k]; c.x += c.vx; c.y += c.vy; c.life++;
        if (c.life > c.maxLife) { cytokines.splice(k, 1); continue; }
        const al = Math.min(1, Math.min(c.life / 12, (c.maxLife - c.life) / 12));
        ctx.globalAlpha = al;
        ctx.beginPath(); ctx.arc(c.x, c.y, 3.5, 0, Math.PI*2);
        ctx.fillStyle = c.col; ctx.fill();
        ctx.font = `5.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
        ctx.fillStyle = c.col; ctx.fillText(c.label, c.x, c.y - 5);
        ctx.globalAlpha = 1;
      }

      /* ── HPA AXIS (right panel) ── */
      const HX = W * 0.80, HY1 = H * 0.08;
      const hpaNodes = [
        { label:"HYPO",   sub:"CRH →",   y:HY1,            col:AMB,  note:"Paraventricular nucleus" },
        { label:"PITUIT", sub:"ACTH →",  y:HY1 + H*0.18,   col:GOLD, note:"Anterior pituitary" },
        { label:"ADREN",  sub:"Cortisol",y:HY1 + H*0.36,   col:ROSE, note:"Adrenal cortex" },
        { label:"BRAIN",  sub:"GR ↑",    y:HY1 + H*0.54,   col:VIO,  note:"Glucocorticoid receptor" },
      ];

      ctx.font = `7px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "top";
      ctx.fillStyle = `${AMB}70`; ctx.fillText("HPA AXIS", HX + 20, H * 0.02);

      for (let k = 0; k < hpaNodes.length; k++) {
        const n = hpaNodes[k];
        ctx.beginPath(); ctx.ellipse(HX + 20, n.y + 10, 28, 12, 0, 0, Math.PI*2);
        ctx.fillStyle = n.col + "18"; ctx.fill();
        ctx.strokeStyle = n.col + "60"; ctx.lineWidth = 0.9; ctx.stroke();
        ctx.font = `6.5px ${mono}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = n.col; ctx.fillText(n.label, HX + 20, n.y + 10);
        ctx.font = `5.5px ${mono}`; ctx.fillStyle = n.col + "80"; ctx.fillText(n.sub, HX + 20, n.y + 22);
        if (k < hpaNodes.length - 1) {
          const ny2 = hpaNodes[k+1].y;
          ctx.beginPath(); ctx.moveTo(HX + 20, n.y + 24);
          ctx.lineTo(HX + 20, ny2 - 2);
          const aPulse = 0.4 + 0.4 * Math.sin(t * 0.06 + k);
          ctx.strokeStyle = n.col + Math.round(aPulse * 180).toString(16).padStart(2,"0");
          ctx.lineWidth = 1; ctx.stroke();
          // arrow head
          ctx.beginPath();
          ctx.moveTo(HX + 15, ny2 - 8); ctx.lineTo(HX + 20, ny2 - 1); ctx.lineTo(HX + 25, ny2 - 8);
          ctx.fillStyle = n.col + "80"; ctx.fill();
        }
      }

      // feedback arrow (cortisol back to HYPO — negative feedback)
      ctx.beginPath();
      ctx.moveTo(HX - 10, hpaNodes[2].y + 10);
      ctx.bezierCurveTo(HX - 40, hpaNodes[2].y - 20, HX - 40, hpaNodes[0].y + 30, HX - 10, hpaNodes[0].y + 10);
      ctx.strokeStyle = `${VIO}35`; ctx.lineWidth = 0.8; ctx.setLineDash([3,3]); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = `5px ${mono}`; ctx.textAlign = "right"; ctx.fillStyle = `${VIO}50`;
      ctx.fillText("−FB", HX - 42, (hpaNodes[0].y + hpaNodes[2].y)/2);

      // Vagus nerve (cholinergic anti-inflammatory)
      ctx.textAlign = "left"; ctx.textBaseline = "middle";
      const vagusY = H * 0.90;
      ctx.beginPath(); ctx.moveTo(W * 0.05, vagusY); ctx.lineTo(W * 0.70, vagusY);
      ctx.strokeStyle = `${GRN}30`; ctx.lineWidth = 0.9; ctx.stroke();
      ctx.font = `6px ${mono}`; ctx.fillStyle = `${GRN}50`;
      ctx.fillText("VAGUS NERVE  ·  cholinergic anti-inflammatory pathway  ·  ACh → ↓TNF-α", W*0.06, vagusY - 6);

      rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div>
      <canvas ref={cvRef} style={{ width:"100%", height:400, borderRadius:12,
        border:`1px solid ${ROSE}20`, background:BG, display:"block" }} />
      <div style={{ padding:"10px 0 0", display:"flex", alignItems:"center", gap:16 }}>
        <div style={{ fontFamily:mono, fontSize:8, color:DIM, whiteSpace:"nowrap" }}>
          INFLAMMATION LEVEL
        </div>
        <input type="range" min={0} max={1} step={0.01} value={inflam}
          onChange={e => setInflam(parseFloat(e.target.value))}
          aria-label="Neuroinflammation level"
          style={{ flex:1, accentColor:ROSE }} />
        <div style={{ fontFamily:mono, fontSize:8, color:ROSE, minWidth:40 }}>
          {(inflam * 100).toFixed(0)}%
        </div>
      </div>
      <div style={{ fontFamily:mono, fontSize:7, color:DIM, marginTop:6, lineHeight:2.0 }}>
        GREEN microglia = ramified (M2, surveillance mode) → RED = amoeboid M1 (activated) above 50% ·
        GOLD blocks = BBB tight junctions → ROSE = BBB compromised above 65% · AMBER = monocytes,
        BLUE = T-cells in vessel · ROSE packets = pro-inflammatory cytokines (TNF-α IL-1β IL-6) ·
        GREEN = anti-inflammatory (IL-10) · VIOLET = astrocyte VEGF · RIGHT = HPA axis stress cascade ·
        BOTTOM = vagus nerve cholinergic anti-inflammatory
      </div>
    </div>
  );
}

/* ── UI helpers ─────────────────────────────────────── */
function SH({ n, title, sub, col=TEAL }: { n:string; title:string; sub:string; col?:string }) {
  return (
    <div style={{ marginTop:56, marginBottom:4 }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, letterSpacing:3 }}>{n}</div>
      <h2 style={{ fontFamily:serif, fontSize:22, color:"#fff", margin:"6px 0 4px" }}>{title}</h2>
      <div style={{ fontFamily:body, fontSize:15, color:DIM, marginBottom:16 }}>{sub}</div>
      <div style={{ height:1, background:`linear-gradient(90deg,${col}50,transparent)`, marginBottom:24 }} />
    </div>
  );
}

function Card({ col, eyebrow, title, body: bd }: { col:string; eyebrow:string; title:string; body:React.ReactNode }) {
  return (
    <div style={{ background:`${col}07`, border:`1px solid ${col}22`, borderRadius:10, padding:"14px 16px" }}>
      <div style={{ fontFamily:mono, fontSize:8, color:col, marginBottom:6 }}>{eyebrow}</div>
      <div style={{ fontFamily:mono, fontSize:11, color:`${col}cc`, marginBottom:8 }}>{title}</div>
      <div style={{ fontFamily:body, fontSize:13.5, color:DIM, lineHeight:1.82 }}>{bd}</div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PAGE
══════════════════════════════════════════════════════════ */
export default function NeuroMetabolicPage() {
  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>
      {/* Hero */}
      <div style={{ textAlign:"center", padding:"56px 24px 32px",
        background:`radial-gradient(ellipse 80% 60% at 50% 0%,
          ${VIO}08,${ROSE}05,${AMB}04,transparent)` }}>
        <div style={{ fontFamily:mono, fontSize:10, color:`${VIO}80`, letterSpacing:4, marginBottom:12 }}>
          AETHER · BRAIN · BRAINSTEM · REWARD CIRCUITS · METABOLIC DYSFUNCTION · NEURO-IMMUNE OVERLAP
        </div>
        <h1 style={{ fontFamily:serif, fontSize:"clamp(20px,4vw,48px)",
          color:"#fff", margin:"0 0 10px", letterSpacing:1, lineHeight:1.18 }}>
          NEURAL ARCHITECTURE
          <span style={{ color:VIO }}> · REWARD</span>
          <span style={{ color:ROSE }}> · METABOLISM</span>
          <span style={{ color:AMB }}> · IMMUNITY</span>
        </h1>
        <div style={{ fontFamily:serif, fontSize:13, color:`${TEAL}60`, letterSpacing:3, marginBottom:20 }}>
          Brain · Brainstem · Reward Circuits · Metabolic Dysfunction · Neuro-Immune Overlap
        </div>
        <div style={{ fontFamily:body, fontSize:16.5, color:DIM,
          maxWidth:860, margin:"0 auto", lineHeight:2.1 }}>
          Three interlocked systems define how the brain computes, rewards, and defends itself.
          The <span style={{ color:VIO }}>reward circuitry</span> encodes prediction, motivation, and learning
          via dopamine dynamics along the mesolimbic and mesocortical pathways.
          The <span style={{ color:GRN }}>mitochondrial network</span> is the metabolic substrate — its
          dysfunction underlies depression, neurodegeneration, and fatigue.
          The <span style={{ color:ROSE }}>neuro-immune axis</span> — microglia, astrocytes, HPA, vagus —
          is the interface between the brain and the body's inflammation state.
          All three converge in conditions like
          <span style={{ color:GOLD }}> depression, chronic fatigue, PTSD, and Parkinson's</span>.
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── SECTION I — BRAIN & REWARD ── */}
        <SH n="I" col={VIO}
          title="Brain Regions · Reward Circuitry · Dopamine Dynamics"
          sub="VTA → NAcc (mesolimbic) · VTA → PFC (mesocortical) · SN → Striatum (nigrostriatal) · HPA stress cascade" />
        <BrainRewardCanvas />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:20 }}>
          <Card col={VIO} eyebrow="Mesolimbic Pathway · REWARD SALIENCE"
            title="VTA → Nucleus Accumbens"
            body="Phasic dopamine release encodes reward prediction error (RPE): δ = actual reward − predicted reward. Positive RPE (unexpected reward) = DA burst. Negative RPE (expected but absent) = DA dip. The NAcc gates approach behavior — the wanting, not the liking." />
          <Card col={TEAL} eyebrow="Mesocortical Pathway · EXECUTIVE CONTROL"
            title="VTA → Prefrontal Cortex"
            body="PFC dopamine (D1/D2 receptors) governs working memory, attention, and impulse control. Too little DA → cognitive fragmentation, poor planning (as in ADHD). Too much → noise amplification, psychotic features. Optimal DA maintains stable PFC representations." />
          <Card col={ROSE} eyebrow="HPA Axis · STRESS RESPONSE"
            title="HYPO → CRH → ACTH → Cortisol"
            body="Acute cortisol is protective: mobilises glucose, suppresses immune over-reaction, enhances memory consolidation. Chronic activation degrades the hippocampus (GR-mediated LTD), suppresses DA synthesis, and elevates baseline inflammation via NF-κB." />
          <Card col={GOLD} eyebrow="Brainstem · HOMEOSTATIC CORE"
            title="Raphe · Locus Coeruleus · PAG · NTS"
            body="The brainstem contains the origin nuclei for every monoamine: LC (norepinephrine), Raphe (serotonin), VTA/SN (dopamine). The NTS receives vagal signals from the gut microbiome, heart, and lungs — integrating visceral state into mood regulation." />
          <Card col={GRN} eyebrow="Hippocampus · MEMORY + REWARD CONTEXT"
            title="Place cells · pattern completion · LTP"
            body="The hippocampus encodes the context of reward — where and when it happened. This creates the scaffold for habit formation: context-triggered reward expectation. Stress-induced hippocampal atrophy (reduced BDNF, elevated cortisol) breaks context gating, causing generalised anxiety." />
          <Card col={AMB} eyebrow="Amygdala · SALIENCE + THREAT"
            title="Fear conditioning · emotional gating"
            body="The amygdala modulates dopamine release via direct projections to the VTA. Threat signals boost DA in the NAcc — making threatening stimuli 'wanted' in a maladaptive way (craving, compulsion). Hyperactive amygdala suppresses PFC top-down control → impulsivity." />
        </div>

        {/* ── SECTION II — METABOLIC DYSFUNCTION ── */}
        <SH n="II" col={GRN}
          title="Metabolic Dysfunction · Mitochondria · ETC · ROS"
          sub="NADH → Complex I → CoQ → Complex III → Cytochrome c → Complex IV → ΔΨm → Complex V (ATP) · ROS leak" />
        <MetabolicCanvas />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:20 }}>
          <Card col={GRN} eyebrow="Electron Transport Chain · NORMAL OPERATION"
            title="36–38 ATP per glucose molecule"
            body="Electrons from NADH/FADH₂ flow through Complexes I→III→IV, pumping H⁺ across the inner membrane. The resulting electrochemical gradient (ΔΨm ≈ −180 mV) drives ATP synthase (Complex V) at ~100 Hz, producing ~36 ATP per glucose. Neurons consume 20× more ATP per unit volume than most tissues." />
          <Card col={ROSE} eyebrow="Complex I/III Dysfunction · ROS PRODUCTION"
            title="Superoxide leak → oxidative stress cascade"
            body="When Complex I or III are inhibited (mtDNA mutations, pesticides, heavy metals, neuroinflammation), electrons leak to O₂ producing superoxide (O₂•⁻). This triggers lipid peroxidation, protein carbonylation, and mtDNA strand breaks — a self-amplifying cycle characteristic of Parkinson's and depression." />
          <Card col={AMB} eyebrow="Metabolic Reprogramming · WARBURG IN BRAIN"
            title="Aerobic glycolysis vs OXPHOS"
            body="Activated microglia and astrocytes switch to aerobic glycolysis (Warburg effect) — fast but inefficient (2 ATP/glucose). Neurons cannot make this switch; they die without OXPHOS. Chronic neuroinflammation starves neurons of ATP by out-competing them for glucose and hijacking the metabolic substrate." />
          <Card col={TEAL} eyebrow="Mitochondrial Membrane Potential · ΔΨm"
            title="The master gauge of cell health"
            body="ΔΨm (proton gradient, −180 mV in healthy) drives all mitochondrial functions. When it collapses (−100 mV or less): ATP synthesis stops, Ca²⁺ homeostasis fails, apoptosis triggers via cytochrome c release. ΔΨm can be measured with JC-1 fluorescent dye — it is the single best proxy for mitochondrial health." />
          <Card col={GOLD} eyebrow="Metabolic Psychiatry · CONVERGENCE"
            title="Depression, fatigue, and mitochondria"
            body="Major depression shows: reduced Complex I activity in PFC and hippocampus; elevated oxidative stress markers (MDA, 8-OHdG); reduced ATP in lymphocytes correlating with symptom severity. BDNF (depleted in depression) promotes mitochondrial biogenesis. Ketones (BHB) bypass Complex I and boost ΔΨm independently." />
          <Card col={VIO} eyebrow="Neurodegeneration · PARKINSON · ALZHEIMER"
            title="Progressive bioenergetic failure"
            body="Parkinson's: loss of Complex I activity in substantia nigra → ROS → α-synuclein aggregation → Lewy bodies → dopaminergic cell death. Alzheimer's: Aβ disrupts mitochondrial fission/fusion, impairs Complex IV, and blocks OXPHOS. Both diseases are fundamentally metabolic before they are synaptic." />
        </div>

        {/* ── SECTION III — NEURO-IMMUNE OVERLAP ── */}
        <SH n="III" col={ROSE}
          title="Neuro-Immune Overlap · Microglia · BBB · HPA · Vagus"
          sub="Microglia M1/M2 · Cytokine signalling · Blood-brain barrier · Astrocyte endfeet · Cholinergic anti-inflammatory" />
        <NeuroImmuneCanvas />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginTop:20 }}>
          <Card col={ROSE} eyebrow="Microglia · BRAIN RESIDENT IMMUNE CELLS"
            title="M1 (activated) vs M2 (ramified surveillance)"
            body="Microglia are 10–15% of all brain cells. In their ramified M2 state they continuously sample synapses (every hour), pruning weak connections and removing debris. When activated (M1): they retract processes, adopt amoeboid morphology, release TNF-α, IL-1β, IL-6, NO — creating a local inflammatory niche that can damage adjacent neurons." />
          <Card col={GOLD} eyebrow="Blood-Brain Barrier · SELECTIVE GATEWAY"
            title="Tight junctions + efflux pumps + pericytes"
            body="The BBB is maintained by tight junctions (claudin-5, occludin) between endothelial cells, backed by pericytes and astrocyte endfeet. Inflammation (TNF-α, IL-1β) phosphorylates tight junction proteins, opening paracellular gaps. Once breached, monocytes and T-cells enter, escalating neuroinflammation — a feedforward loop." />
          <Card col={VIO} eyebrow="Astrocyte Endfeet · GLYMPHATIC SYSTEM"
            title="AQP4 + glymphatic waste clearance"
            body="Astrocyte endfeet ensheath 99% of the BBB surface area. AQP4 water channels drive the glymphatic system: during sleep, CSF flushes through perivascular spaces, clearing Aβ, tau, and inflammatory metabolites. Sleep disruption → impaired glymphatic clearance → accelerated Aβ accumulation in hours." />
          <Card col={AMB} eyebrow="HPA Axis · CHRONIC STRESS → NEUROINFLAMMATION"
            title="Cortisol: acute protector, chronic destroyer"
            body="Acute cortisol inhibits NF-κB → anti-inflammatory. But GR downregulation after chronic stress reverses this: cortisol now fails to suppress inflammation, and even enhances IL-6 and TNF-α synthesis. This 'glucocorticoid resistance' is documented in major depression and is partially reversed by ketamine and psychedelics." />
          <Card col={GRN} eyebrow="Vagus Nerve · CHOLINERGIC ANTI-INFLAMMATORY"
            title="ACh → α7-nAChR → ↓TNF-α IL-6 IL-1β"
            body="Efferent vagal signals release acetylcholine, which binds α7-nicotinic receptors on macrophages and microglia, potently suppressing pro-inflammatory cytokine production. This cholinergic anti-inflammatory reflex is the anatomical basis for meditation, breathwork, and cold exposure reducing systemic inflammation." />
          <Card col={BLUE} eyebrow="Sickness Behaviour · CYTOKINES ACTING AS NEUROMODULATORS"
            title="IL-6, TNF-α as neurotransmitter analogues"
            body="Peripheral cytokines signal the brain via: (1) circumventricular organs (no BBB), (2) vagal afferents, (3) direct transport across BBB. In the brain, IL-1β suppresses hippocampal LTP, IL-6 reduces DA synthesis, and TNF-α increases glutamate reuptake inhibition → excitotoxicity. Infection literally produces depressive cognition as a survival mechanism." />
        </div>

        {/* ── SECTION IV — AETHER SYNTHESIS ── */}
        <SH n="IV" col={GOLD}
          title="AETHER Synthesis · The Unified Bioenergetic-Immune-Reward Model"
          sub="How metabolic dysfunction, neuro-immune activation, and reward circuit disruption form a single convergent failure mode" />
        <div style={{ background:`${GOLD}06`, border:`1px solid ${GOLD}18`,
          borderRadius:12, padding:"24px 28px", marginBottom:20 }}>
          <div style={{ fontFamily:body, fontSize:16, color:TEXT, lineHeight:2.1, marginBottom:20 }}>
            The three systems are not parallel — they are
            <span style={{ color:TEAL }}> nested</span>. Metabolic failure drives immune activation, which
            drives reward circuit dysfunction, which feeds back into metabolic failure via behavioural
            changes (reduced movement, disrupted sleep, poor nutrition). The
            <span style={{ color:ROSE }}> loop is self-sustaining</span> once established — which is why
            conditions like treatment-resistant depression, ME/CFS, and long COVID are so intractable.
            Breaking it requires intervening at
            <span style={{ color:GOLD }}> multiple nodes simultaneously</span>.
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
            <Card col={GRN} eyebrow="METABOLIC FAILURE → IMMUNE ACTIVATION"
              title="ROS → NLRP3 inflammasome → IL-1β cascade"
              body="Dysfunctional mitochondria (elevated ROS, impaired OXPHOS) activate the NLRP3 inflammasome in microglia. NLRP3 cleaves pro-IL-1β → active IL-1β, triggering a cytokine cascade. Mitochondrial ROS is the upstream driver of microglial M1 activation — metabolic and immune dysfunction are the same event." />
            <Card col={ROSE} eyebrow="IMMUNE ACTIVATION → REWARD DISRUPTION"
              title="IL-6, IL-1β → IDO1 → kynurenine → quinolinic acid"
              body="Pro-inflammatory cytokines activate indoleamine 2,3-dioxygenase (IDO1), diverting tryptophan from serotonin synthesis toward the kynurenine pathway. Kynurenic acid reduces DA and glutamate. Quinolinic acid is an NMDA agonist — excitotoxic to hippocampal neurons. This is the direct molecular path from inflammation to anhedonia." />
            <Card col={VIO} eyebrow="REWARD DISRUPTION → METABOLIC FAILURE"
              title="Anhedonia → inactivity → mitochondrial atrophy"
              body="Loss of reward motivation reduces physical activity, disrupts circadian rhythm (low melatonin → impaired mitophagy), and shifts diet toward high-glucose foods. Each of these independently impairs mitochondrial biogenesis and increases oxidative load. The reward circuit collapse drives the metabolic context that caused it — closing the loop." />
          </div>
        </div>

        {/* Intervention nodes */}
        <div style={{ marginTop:8 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:GOLD, letterSpacing:3, marginBottom:12 }}>
            INTERVENTION NODES — WHERE TO BREAK THE LOOP
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10 }}>
            {[
              { col:GRN,  node:"METABOLIC", interventions:["Ketogenic diet (BHB bypasses Complex I)","CoQ10 · NAD⁺ precursors","PGC-1α activation (exercise, cold)","Metformin · AMPK pathway","Mitophagy induction (fasting)"] },
              { col:ROSE, node:"IMMUNE",     interventions:["Low-dose naltrexone (microglial)","Omega-3 (SPMs, resolvin)","Vagal stimulation (breathwork)","TNF-α blockade (extreme cases)","NLRP3 inhibitors (MCC950)"] },
              { col:VIO,  node:"REWARD",     interventions:["Ketamine (fast AMPA potentiation)","Psilocybin (5HT2A → BDNF)","Exercise (BDNF, DA synthesis)","Social reward (oxytocin)","Light therapy (melatonin reset)"] },
              { col:AMB,  node:"HPA · STRESS",interventions:["HPA normalisation (adaptogens)","GR sensitivity restoration","Sleep architecture repair","CRH antagonism (R121919)","Cortisol rhythm restoration"] },
            ].map(g => (
              <div key={g.node} style={{ background:`${g.col}07`, border:`1px solid ${g.col}22`,
                borderRadius:10, padding:"12px 14px" }}>
                <div style={{ fontFamily:mono, fontSize:8, color:g.col, marginBottom:10 }}>{g.node}</div>
                {g.interventions.map(i => (
                  <div key={i} style={{ fontFamily:body, fontSize:12, color:DIM,
                    lineHeight:1.8, paddingLeft:8, borderLeft:`2px solid ${g.col}30`,
                    marginBottom:6 }}>{i}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Master equation */}
        <div style={{ textAlign:"center", padding:"32px",
          background:"#ffffff03", border:`1px solid ${GOLD}15`, borderRadius:12, marginTop:24 }}>
          <div style={{ fontFamily:serif, fontSize:16, color:GOLD, marginBottom:12 }}>
            Ψ_neural = f(ATP_mito) × g(Cytokine_ratio) × h(DA_RPE)
          </div>
          <div style={{ fontFamily:mono, fontSize:8, color:DIM, lineHeight:3, marginBottom:10 }}>
            {"ATP_mito = mitochondrial output (Complex I–IV flux × ΔΨm)"}
            {"   ·   "}{"Cytokine_ratio = IL-10 / (TNF-α + IL-1β + IL-6)  [anti:pro-inflammatory balance]"}
            {"   ·   "}{"DA_RPE = reward prediction error signal (VTA phasic rate)"}
          </div>
          <div style={{ fontFamily:body, fontSize:15, color:DIM, lineHeight:2.0,
            maxWidth:740, margin:"0 auto" }}>
            Optimal neural function requires all three inputs to be above threshold simultaneously.
            Any single failure creates conditions for the others to fail — the system is brittle when
            depleted and robust when all three are supported. This is the bioenergetic basis of resilience.
          </div>
        </div>

      </div>
    </div>
  );
}

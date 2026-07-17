import { useEffect } from "react";

const PAGE_CSS = `
#wcm-shell {
  --night:#08060f; --deep:#0e0a18; --panel:rgba(19,15,32,0.94);
  --moon:#e8dfc8; --moon2:#d4c8a8; --gold:#c4963c; --gold2:#e0b84a;
  --rose:#c86080; --rose2:#e87898; --teal:#3aada8; --violet:#8060c8; --violet2:#a880e8;
  --amber:#d0903a; --sage:#6a9a60; --border:rgba(196,150,60,0.16); --border2:rgba(196,150,60,0.3);
  --text:#d8d0e8; --dim:rgba(216,208,232,0.38); --mid:rgba(216,208,232,0.65);
}
#wcm-stars { position:fixed; inset:0; pointer-events:none; z-index:0; }
#wcm-shell {
  position:relative; z-index:1; width:100%; height:100vh;
  display:grid; grid-template-rows:48px 1fr 88px; grid-template-columns:260px 1fr 260px;
  background:var(--night); color:var(--text); font-family:'Space Mono',monospace; font-size:11px; overflow:hidden;
}
#wcm-header {
  grid-column:1/-1; background:rgba(13,10,22,0.96); border-bottom:1px solid var(--border);
  display:flex; align-items:center; padding:0 20px; gap:18px; backdrop-filter:blur(8px);
}
#wcm-header h1 { font-family:'Cormorant',serif; font-style:italic; font-size:18px; color:var(--moon); letter-spacing:0.06em; }
#wcm-header h1 em { color:var(--gold); font-style:normal; }
.wcm-hstat { display:flex; flex-direction:column; padding:0 14px; border-left:1px solid var(--border); }
.wcm-hstat-k { font-size:7px; letter-spacing:0.16em; color:var(--dim); text-transform:uppercase; }
.wcm-hstat-v { font-size:12px; font-weight:700; margin-top:1px; }
#wcm-live-badge { margin-left:auto; font-size:8px; letter-spacing:0.14em; color:var(--dim); display:flex; align-items:center; gap:5px; }
#wcm-live-dot { width:6px;height:6px;border-radius:50%;background:var(--rose2);box-shadow:0 0 6px var(--rose2);animation:wcmBlink 2.4s infinite; }
@keyframes wcmBlink{0%,100%{opacity:1}50%{opacity:0.3}}
#wcm-panel-left { grid-column:1; grid-row:2; background:rgba(13,10,22,0.88); border-right:1px solid var(--border); overflow-y:auto; padding:16px 14px; display:flex; flex-direction:column; gap:14px; backdrop-filter:blur(6px); }
#wcm-center { grid-column:2; grid-row:2; position:relative; overflow:hidden; }
#wcm-main-canvas { width:100%;height:100%;display:block; }
#wcm-panel-right { grid-column:3; grid-row:2; background:rgba(13,10,22,0.88); border-left:1px solid var(--border); overflow-y:auto; padding:16px 14px; display:flex; flex-direction:column; gap:14px; backdrop-filter:blur(6px); }
#wcm-bottom { grid-column:1/-1; grid-row:3; background:rgba(13,10,22,0.96); border-top:1px solid var(--border); padding:10px 20px; display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; align-items:center; }
.wcm-sec { margin-bottom:2px; }
.wcm-sec-head { font-size:7px; letter-spacing:0.18em; text-transform:uppercase; color:var(--dim); border-bottom:1px solid var(--border); padding-bottom:4px; margin-bottom:8px; }
.wcm-sec-head em { color:var(--gold2); font-style:normal; }
.wcm-mrow { display:flex; justify-content:space-between; align-items:center; margin:3px 0; }
.wcm-mk { font-size:9px; color:var(--dim); }
.wcm-mv { font-size:10px; font-weight:700; }
.wcm-bar { height:3px; background:rgba(255,255,255,0.06); border-radius:2px; margin:2px 0 6px; overflow:hidden; }
.wcm-bf { height:100%; border-radius:2px; transition:width 0.4s; }
.wcm-phase-arc { width:100%; height:56px; display:block; margin:4px 0; }
.wcm-input-row { display:flex; flex-direction:column; gap:3px; margin:4px 0 8px; }
.wcm-input-row label { font-size:8px; color:var(--dim); letter-spacing:0.1em; display:flex; justify-content:space-between; }
.wcm-input-row label span { color:var(--gold2); }
#wcm-shell input[type=range] { -webkit-appearance:none; width:100%; height:3px; background:rgba(255,255,255,0.08); border-radius:2px; outline:none; }
#wcm-shell input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:10px;height:10px; border-radius:50%; background:var(--rose2); cursor:pointer; box-shadow:0 0 5px rgba(200,120,152,0.5); }
canvas.wcm-spark { width:100%;height:36px;display:block;border:1px solid var(--border);border-radius:2px; }
.wcm-big-c { font-family:'Cormorant',serif; font-size:48px; font-weight:300; line-height:1em; display:block; }
.wcm-big-label { font-size:7px; letter-spacing:0.18em; color:var(--dim); }
.wcm-theorem { background:rgba(96,80,200,0.07); border:1px solid rgba(160,128,232,0.2); border-radius:3px; padding:9px 11px; }
.wcm-th-head { font-size:7px; letter-spacing:0.14em; color:var(--violet2); text-transform:uppercase; margin-bottom:5px; }
.wcm-th-body { font-family:'Cormorant',serif; font-size:11px; line-height:1.7em; color:var(--mid); }
.wcm-bspark { display:flex; flex-direction:column; gap:3px; }
.wcm-bspark-label { font-size:8px; color:var(--dim); letter-spacing:0.1em; }
#wcm-shell ::-webkit-scrollbar{width:3px;}
#wcm-shell ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px;}
`;

export default function WomensCoherenceMap() {
  useEffect(() => {
    const starsCV = document.getElementById("wcm-stars") as HTMLCanvasElement;
    if (starsCV) {
      const sctx = starsCV.getContext("2d");
      starsCV.width = window.innerWidth; starsCV.height = window.innerHeight;
      if (sctx) {
        for (let i = 0; i < 280; i++) {
          const x = Math.random() * starsCV.width, y = Math.random() * starsCV.height, r = Math.random() * 1.2;
          sctx.beginPath(); sctx.arc(x, y, r, 0, Math.PI * 2);
          sctx.fillStyle = `rgba(255,255,255,${0.1 + Math.random() * 0.4})`; sctx.fill();
        }
      }
    }

    function lunarPhase(date: Date) {
      const knownNew = new Date("2000-01-06T18:14:00Z");
      const lunarCycle = 29.530588853;
      const elapsed = (date.getTime() - knownNew.getTime()) / (1000 * 60 * 60 * 24);
      const phase = ((elapsed % lunarCycle) + lunarCycle) % lunarCycle;
      return phase / lunarCycle;
    }
    function lunarIllumination(phase01: number) { return (1 - Math.cos(phase01 * 2 * Math.PI)) / 2; }
    function lunarPhaseName(p: number) {
      if (p < 0.0625) return "New Moon"; if (p < 0.1875) return "Waxing Crescent";
      if (p < 0.3125) return "First Quarter"; if (p < 0.4375) return "Waxing Gibbous";
      if (p < 0.5625) return "Full Moon"; if (p < 0.6875) return "Waning Gibbous";
      if (p < 0.8125) return "Last Quarter"; if (p < 0.9375) return "Waning Crescent";
      return "New Moon";
    }
    function solarCyclePhase(date: Date) {
      const cycleStart = new Date("2019-12-01");
      const cycleLen = 11 * 365.25 * 24 * 60 * 60 * 1000;
      return ((date.getTime() - cycleStart.getTime()) % cycleLen) / cycleLen;
    }
    function estimateKp(date: Date, solarPhase: number) {
      const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
      const equinoxEffect = Math.abs(Math.sin((dayOfYear / 365.25) * 2 * Math.PI - Math.PI / 4));
      const solarBoost = Math.sin(solarPhase * Math.PI) * 2;
      const seed = date.getFullYear() * 1000 + dayOfYear;
      const pseudo = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      return Math.max(0, Math.min(9, 1.5 + solarBoost * 0.5 + equinoxEffect * 1.5 + pseudo * 2));
    }
    function schumannCoherence(kp: number, hour: number) {
      const diurnal = 0.85 + 0.1 * Math.sin(((hour - 14) / 24) * 2 * Math.PI);
      return Math.max(0.2, diurnal - kp * 0.04);
    }

    const PHASES = [
      { name: "Menstrual", days: [1, 5], color: "#c86080", desc: "Shedding. Low estrogen/progesterone. High prostaglandins. Rest phase.", sensitivity: ["Cramps", "Fatigue", "High emotional sensitivity", "Low cortisol tolerance"] },
      { name: "Follicular", days: [6, 13], color: "#d0903a", desc: "Estrogen rising. Follicle development. Energy and clarity building.", sensitivity: ["Rising energy", "Increased sociability", "Better stress tolerance", "Magnetic sensitivity elevated"] },
      { name: "Ovulation", days: [14, 16], color: "#e0b84a", desc: "LH surge. Peak estrogen. Maximum neural coherence window.", sensitivity: ["Peak energy", "High verbal fluency", "Geomagnetic sensitivity peak", "Lunar coupling strongest"] },
      { name: "Luteal", days: [17, 28], color: "#8060c8", desc: "Progesterone dominant. Body preparing. Late luteal: cortisol rises, disruption risk.", sensitivity: ["Inward focus", "Heightened intuition", "Weather sensitivity", "Pre-menstrual window: high decoherence risk"] },
    ];
    function getBioPhase(cycleDay: number, cycleLen: number, lutealLen: number) {
      const follLen = cycleLen - lutealLen - 3;
      if (cycleDay <= 5) return PHASES[0];
      if (cycleDay <= 5 + follLen) return PHASES[1];
      if (cycleDay <= 5 + follLen + 3) return PHASES[2];
      return PHASES[3];
    }
    function hormoneCoherence(cycleDay: number, cycleLen: number, lutealLen: number) {
      const phase = getBioPhase(cycleDay, cycleLen, lutealLen);
      const base: Record<string, number> = { Menstrual: 0.52, Follicular: 0.72, Ovulation: 0.92, Luteal: 0.62 };
      let c = base[phase.name];
      if (phase.name === "Luteal" && cycleDay > cycleLen - 5) c -= 0.18;
      return Math.max(0.1, c);
    }
    function kuramotoR(lunarPhase01: number, bioCyclePhase: number) {
      const thetaL = lunarPhase01 * 2 * Math.PI, thetaB = bioCyclePhase * 2 * Math.PI;
      const phaseDiff = thetaL - thetaB;
      const re = (Math.cos(thetaL) + Math.cos(thetaB)) / 2, im = (Math.sin(thetaL) + Math.sin(thetaB)) / 2;
      return { r: Math.sqrt(re * re + im * im), phaseDiff, thetaL, thetaB };
    }

    let K_gain = 0.02, prevC = 0.5;
    function updateK(C: number, dC: number) {
      if (C < 0.5) K_gain += 0.003;
      if (dC < 0) K_gain += 0.001;
      if (C > 0.80) K_gain *= 0.994;
      K_gain = Math.max(0.001, Math.min(0.12, K_gain));
      return K_gain;
    }
    function lyapunov(E: number) { return 0.5 * E * E; }
    function dLyapunov(E: number, dE: number) { return E * dE; }

    const HIST = 120;
    const hist: Record<string, number[]> = { C: [], r: [], V: [], u: [] };
    function pushHist(c: number, r: number, v: number, u: number) {
      [["C", c], ["r", r], ["V", v], ["u", u]].forEach(([k, val]) => {
        hist[k as string].push(val as number);
        if (hist[k as string].length > HIST) hist[k as string].shift();
      });
    }

    let cycleLen = 28, daysAgo = 0, lutealLen = 14;
    function computeState() {
      const now = new Date();
      const lp01 = lunarPhase(now), illum = lunarIllumination(lp01), phaseName = lunarPhaseName(lp01);
      const solPhase = solarCyclePhase(now), kp = estimateKp(now, solPhase), schumann = schumannCoherence(kp, now.getHours());
      const cycleDay = Math.max(1, Math.min(cycleLen, (daysAgo % cycleLen) + 1));
      const bioPhase = getBioPhase(cycleDay, cycleLen, lutealLen);
      const bioC = hormoneCoherence(cycleDay, cycleLen, lutealLen);
      const bioCyclePhase = (cycleDay - 1) / cycleLen;
      const kura = kuramotoR(lp01, bioCyclePhase);
      const kpCoherence = Math.max(0.2, 1 - kp / 12);
      const C = Math.pow(bioC * kura.r * kpCoherence * schumann, 0.35);
      return { lunarPhase01: lp01, lunarIllum: illum, lunarPhaseName: phaseName, solarPhase: solPhase, kp, schumann, cycleDay, cycleLen, lutealLen, bioPhase, bioC, kuramoto: kura, C: Math.max(0.05, Math.min(0.98, C)) };
    }

    const mc = document.getElementById("wcm-main-canvas") as HTMLCanvasElement;
    let animT = 0;
    function resizeMain() {
      if (!mc) return;
      mc.width = mc.offsetWidth * (window.devicePixelRatio || 1);
      mc.height = mc.offsetHeight * (window.devicePixelRatio || 1);
    }

    function drawMain(state: ReturnType<typeof computeState>) {
      if (!mc) return;
      const mctx = mc.getContext("2d"); if (!mctx) return;
      const W = mc.width, H = mc.height, cx = W / 2, cy = H / 2;
      mctx.fillStyle = "rgba(8,6,15,0.18)"; mctx.fillRect(0, 0, W, H);
      animT += 0.006;
      const dpr = window.devicePixelRatio || 1;
      const illum = state.lunarIllum;

      const lunR = Math.min(W, H) * 0.18, lunX = cx - W * 0.22, lunY = cy - H * 0.05;
      const moonGlow = mctx.createRadialGradient(lunX, lunY, lunR * 0.3, lunX, lunY, lunR * 2.2);
      moonGlow.addColorStop(0, `rgba(232,223,200,${0.06 + illum * 0.08})`); moonGlow.addColorStop(1, "transparent");
      mctx.beginPath(); mctx.arc(lunX, lunY, lunR * 2.2, 0, Math.PI * 2); mctx.fillStyle = moonGlow; mctx.fill();
      mctx.beginPath(); mctx.arc(lunX, lunY, lunR, 0, Math.PI * 2);
      const moonBase = mctx.createRadialGradient(lunX - lunR * 0.2, lunY - lunR * 0.2, 0, lunX, lunY, lunR);
      moonBase.addColorStop(0, `rgba(232,223,200,${0.3 + illum * 0.55})`); moonBase.addColorStop(1, `rgba(160,150,120,${0.1 + illum * 0.2})`);
      mctx.fillStyle = moonBase; mctx.fill();
      const shadowX = lunX + lunR * (0.5 - state.lunarPhase01 * 1) * 0.8;
      mctx.beginPath(); mctx.arc(shadowX, lunY, lunR * 0.95, 0, Math.PI * 2);
      mctx.fillStyle = `rgba(8,6,15,${0.9 - illum * 0.88})`; mctx.fill();
      mctx.font = `${8 * dpr}px Space Mono`; mctx.fillStyle = "rgba(232,223,200,0.5)"; mctx.textAlign = "center";
      mctx.fillText(state.lunarPhaseName, lunX, lunY + lunR + 14 * dpr);
      mctx.fillText((illum * 100).toFixed(0) + "%", lunX, lunY + lunR + 24 * dpr);

      const bioR = Math.min(W, H) * 0.14, bioX = cx + W * 0.22, bioY = cy - H * 0.05;
      const bioCol = state.bioPhase?.color || "#c86080";
      const bc = bioCol.replace("#", "");
      const br = parseInt(bc.substring(0, 2), 16), bg2 = parseInt(bc.substring(2, 4), 16), bb = parseInt(bc.substring(4, 6), 16);
      const bioGlow = mctx.createRadialGradient(bioX, bioY, 0, bioX, bioY, bioR * 2.5);
      bioGlow.addColorStop(0, `rgba(${br},${bg2},${bb},${0.12 + state.bioC * 0.12})`); bioGlow.addColorStop(1, "transparent");
      mctx.beginPath(); mctx.arc(bioX, bioY, bioR * 2.5, 0, Math.PI * 2); mctx.fillStyle = bioGlow; mctx.fill();
      const breathe = 0.95 + 0.05 * Math.sin(animT * 1.6);
      mctx.beginPath(); mctx.arc(bioX, bioY, bioR * breathe, 0, Math.PI * 2);
      const bioGrad = mctx.createRadialGradient(bioX - bioR * 0.2, bioY - bioR * 0.2, 0, bioX, bioY, bioR);
      bioGrad.addColorStop(0, `rgba(${br},${bg2},${bb},${0.5 + state.bioC * 0.3})`); bioGrad.addColorStop(0.6, `rgba(${br},${bg2},${bb},0.15)`); bioGrad.addColorStop(1, `rgba(${br},${bg2},${bb},0.02)`);
      mctx.fillStyle = bioGrad; mctx.fill();
      mctx.beginPath(); mctx.arc(bioX, bioY, bioR * breathe + 1.5 * dpr, 0, Math.PI * 2);
      mctx.strokeStyle = `rgba(${br},${bg2},${bb},${0.3 + state.bioC * 0.4})`; mctx.lineWidth = 1 * dpr; mctx.stroke();
      mctx.font = `${8 * dpr}px Space Mono`; mctx.fillStyle = `rgba(${br},${bg2},${bb},0.7)`; mctx.textAlign = "center";
      mctx.fillText(state.bioPhase?.name || "", bioX, bioY + bioR + 14 * dpr);
      mctx.fillText("Day " + state.cycleDay, bioX, bioY + bioR + 24 * dpr);

      const r = state.kuramoto.r;
      const steps = 60;
      for (let i = 0; i < steps; i++) {
        const prog = i / steps, x = lunX + (bioX - lunX) * prog;
        const wave = Math.sin(prog * Math.PI * 3 + animT * 2) * 20 * dpr * (1 - r);
        const y = (lunY + (bioY - lunY) * prog) + wave;
        mctx.beginPath(); mctx.arc(x, y, 1.5 * dpr, 0, Math.PI * 2);
        mctx.fillStyle = `rgba(196,150,60,${0.08 + r * 0.35})`; mctx.fill();
      }
      const midX = (lunX + bioX) / 2, midY = (lunY + bioY) / 2;
      mctx.font = `${7 * dpr}px Space Mono`; mctx.fillStyle = `rgba(196,150,60,${0.4 + r * 0.4})`; mctx.textAlign = "center";
      mctx.fillText("r = " + r.toFixed(3), midX, midY + 4 * dpr); mctx.fillText("coupling", midX, midY + 14 * dpr);

      const C = state.C;
      for (let i = 1; i <= 3; i++) {
        const ringR = Math.min(W, H) * (0.12 + i * 0.1);
        mctx.beginPath(); mctx.arc(cx, cy, ringR, 0, Math.PI * 2);
        mctx.strokeStyle = `rgba(196,150,60,${0.03 + C * 0.04})`; mctx.lineWidth = 0.8 * dpr; mctx.stroke();
      }
      const orbitR = Math.min(W, H) * 0.38;
      const lunAngle = state.lunarPhase01 * 2 * Math.PI - Math.PI / 2;
      const lunOX = cx + Math.cos(lunAngle) * orbitR * 0.85, lunOY = cy + Math.sin(lunAngle) * orbitR * 0.85;
      const bioAngle = ((state.cycleDay - 1) / state.cycleLen) * 2 * Math.PI - Math.PI / 2;
      const bioOX = cx + Math.cos(bioAngle) * orbitR * 0.6, bioOY = cy + Math.sin(bioAngle) * orbitR * 0.6;
      mctx.beginPath(); mctx.arc(cx, cy, orbitR * 0.85, 0, Math.PI * 2);
      mctx.strokeStyle = "rgba(232,223,200,0.06)"; mctx.lineWidth = 0.7 * dpr; mctx.setLineDash([3 * dpr, 6 * dpr]); mctx.stroke(); mctx.setLineDash([]);
      mctx.beginPath(); mctx.arc(cx, cy, orbitR * 0.6, 0, Math.PI * 2);
      mctx.strokeStyle = `rgba(${br},${bg2},${bb},0.08)`; mctx.lineWidth = 0.7 * dpr; mctx.setLineDash([2 * dpr, 5 * dpr]); mctx.stroke(); mctx.setLineDash([]);
      mctx.beginPath(); mctx.arc(lunOX, lunOY, 5 * dpr, 0, Math.PI * 2);
      mctx.fillStyle = `rgba(232,223,200,${0.5 + illum * 0.45})`; mctx.shadowColor = "rgba(232,223,200,0.5)"; mctx.shadowBlur = 8 * dpr; mctx.fill(); mctx.shadowBlur = 0;
      mctx.beginPath(); mctx.arc(bioOX, bioOY, 5 * dpr, 0, Math.PI * 2);
      mctx.fillStyle = `rgba(${br},${bg2},${bb},0.8)`; mctx.shadowColor = bioCol; mctx.shadowBlur = 8 * dpr; mctx.fill(); mctx.shadowBlur = 0;
      mctx.beginPath(); mctx.arc(cx, cy, orbitR * 0.72, Math.min(lunAngle, bioAngle), Math.max(lunAngle, bioAngle));
      mctx.strokeStyle = `rgba(196,150,60,${0.15 + r * 0.3})`; mctx.lineWidth = 1.5 * dpr; mctx.stroke();
      mctx.beginPath(); mctx.moveTo(lunOX, lunOY); mctx.lineTo(bioOX, bioOY);
      mctx.strokeStyle = `rgba(196,150,60,${0.12 + r * 0.25})`; mctx.lineWidth = 0.8 * dpr; mctx.stroke();

      const cColor = C > 0.75 ? "#6a9a60" : C > 0.5 ? "#e0b84a" : "#c86080";
      mctx.font = `bold ${22 * dpr}px Space Mono`; mctx.fillStyle = cColor; mctx.textAlign = "center";
      mctx.fillText((C * 100).toFixed(0) + "%", cx, cy - 4 * dpr);
      mctx.font = `${7 * dpr}px Space Mono`; mctx.fillStyle = "rgba(216,208,232,0.3)";
      mctx.fillText("\u{1D49E} coupled", cx, cy + 10 * dpr);
    }

    function drawSpark(id: string, data: number[], color: string, min = 0, max = 1) {
      const cv2 = document.getElementById(id) as HTMLCanvasElement; if (!cv2) return;
      const dpr = window.devicePixelRatio || 1;
      cv2.width = cv2.offsetWidth * dpr; cv2.height = cv2.offsetHeight * dpr;
      const ctx2 = cv2.getContext("2d"); if (!ctx2) return;
      const W2 = cv2.width, H2 = cv2.height;
      ctx2.fillStyle = "rgba(13,10,22,0.6)"; ctx2.fillRect(0, 0, W2, H2);
      if (data.length < 2) return;
      ctx2.beginPath();
      data.forEach((v, i) => {
        const x = (i / (data.length - 1)) * W2, y = H2 - ((v - min) / (max - min + 0.0001)) * H2 * 0.88 - H2 * 0.06;
        i === 0 ? ctx2.moveTo(x, y) : ctx2.lineTo(x, y);
      });
      ctx2.strokeStyle = color; ctx2.lineWidth = 1.5 * dpr; ctx2.shadowColor = color; ctx2.shadowBlur = 3 * dpr; ctx2.stroke(); ctx2.shadowBlur = 0;
    }

    function drawCycleArc(cycleDay: number, _cycleLen: number) {
      const cv2 = document.getElementById("wcm-cycle-arc") as HTMLCanvasElement; if (!cv2) return;
      const dpr = window.devicePixelRatio || 1;
      cv2.width = cv2.offsetWidth * dpr; cv2.height = 50 * dpr;
      const ctx2 = cv2.getContext("2d"); if (!ctx2) return;
      const W2 = cv2.width, H2 = cv2.height;
      ctx2.clearRect(0, 0, W2, H2);
      const colors = ["#c86080", "#d0903a", "#e0b84a", "#8060c8"];
      const phaseLens = [5, 8, 3, _cycleLen - 16];
      let dayPtr = 1;
      phaseLens.forEach((len, i) => {
        const start = (dayPtr - 1) / _cycleLen, end = (dayPtr - 1 + len) / _cycleLen;
        const x1 = start * W2, x2 = end * W2;
        ctx2.fillStyle = colors[i] + (cycleDay >= dayPtr && cycleDay < dayPtr + len ? "cc" : "44");
        ctx2.fillRect(x1, H2 * 0.3, x2 - x1 - 1 * dpr, H2 * 0.4);
        dayPtr += len;
      });
      const mx = ((cycleDay - 1) / _cycleLen) * W2;
      ctx2.fillStyle = "rgba(232,223,200,0.9)"; ctx2.fillRect(mx - 1 * dpr, H2 * 0.1, 2 * dpr, H2 * 0.8);
    }

    function updatePanels(state: ReturnType<typeof computeState>) {
      const fmt1 = (v: number) => v.toFixed(1), fmt3 = (v: number) => v.toFixed(3);
      const set = (id: string, val: string) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      const setStyle = (id: string, prop: string, val: string) => { const el = document.getElementById(id) as HTMLElement; if (el) el.style[prop as any] = val; };

      set("wcm-h-lunar", state.lunarPhaseName); set("wcm-h-cday", "Day " + state.cycleDay);
      set("wcm-h-phase", state.bioPhase?.name || ""); setStyle("wcm-h-phase", "color", state.bioPhase?.color || "#c86080");
      set("wcm-h-coupling", fmt3(state.kuramoto.r)); set("wcm-h-kp", fmt1(state.kp)); set("wcm-h-cohc", fmt3(state.C));

      set("wcm-r-lunpct", (state.lunarIllum * 100).toFixed(0) + "%"); setStyle("wcm-rb-lun", "width", (state.lunarIllum * 100) + "%");
      set("wcm-r-lunage", (state.lunarPhase01 * 29.53).toFixed(1) + " days");
      set("wcm-r-sol", (state.solarPhase * 100).toFixed(0) + "% of cycle"); setStyle("wcm-rb-sol", "width", (state.solarPhase * 100) + "%");
      set("wcm-r-kp2", fmt1(state.kp)); setStyle("wcm-rb-kp", "width", (state.kp / 9 * 100) + "%");
      set("wcm-r-schumann", fmt3(state.schumann));

      const offset = state.kuramoto.phaseDiff / (2 * Math.PI) * 29.53;
      set("wcm-r-offset", fmt1(Math.abs(offset)) + " days");
      set("wcm-r-angdist", (Math.abs(state.kuramoto.phaseDiff) * 180 / Math.PI).toFixed(1) + "°");
      set("wcm-r-kuramoto", fmt3(state.kuramoto.r)); setStyle("wcm-rb-kura", "width", (state.kuramoto.r * 100) + "%");
      const coupStr = state.kuramoto.r > 0.85 ? "LOCKED" : state.kuramoto.r > 0.65 ? "COHERENT" : state.kuramoto.r > 0.45 ? "PARTIAL" : "DECOUPLED";
      set("wcm-r-coupstr", coupStr);
      setStyle("wcm-r-coupstr", "color", state.kuramoto.r > 0.65 ? "#e0b84a" : "#e87898");

      const E = 1 - state.C, dC = state.C - prevC, K = updateK(state.C, dC);
      const V = lyapunov(E), dV = dLyapunov(E, -K * E);
      set("wcm-r-K", K.toFixed(4)); set("wcm-r-dC", (dC >= 0 ? "+" : "") + dC.toFixed(4));
      set("wcm-r-lyap", V.toFixed(4)); set("wcm-r-dV", (dV >= 0 ? "+" : "") + dV.toFixed(4));
      const stableEl = document.getElementById("wcm-r-stable");
      if (stableEl) stableEl.innerHTML = dV < 0 ? '<span style="color:#6a9a60">STABLE \u2193V</span>' : '<span style="color:#e87898">UNSTABLE \u2191V</span>';

      const bigC = document.getElementById("wcm-big-c");
      if (bigC) { bigC.textContent = (state.C * 100).toFixed(0) + "%"; bigC.style.color = state.C > 0.75 ? "#6a9a60" : state.C > 0.5 ? "#e0b84a" : "#e87898"; }

      const bp = state.bioPhase;
      if (bp) {
        const bpd = document.getElementById("wcm-bio-phase-display");
        if (bpd) bpd.innerHTML = `<div style="display:flex;align-items:center;gap:7px;margin-bottom:6px;"><span style="width:10px;height:10px;border-radius:50%;background:${bp.color};display:inline-block;box-shadow:0 0 8px ${bp.color}"></span><span style="font-family:'Cormorant',serif;font-size:14px;color:${bp.color}">${bp.name}</span></div><div style="font-family:'Cormorant',serif;font-style:italic;font-size:11px;color:rgba(216,208,232,0.65);line-height:1.6em;">${bp.desc}</div>`;
        const sm = document.getElementById("wcm-sensitivity-map");
        if (sm) sm.innerHTML = bp.sensitivity.map((s2) => `<div style="font-size:8px;color:rgba(216,208,232,0.65);padding:3px 0;border-bottom:1px solid rgba(196,150,60,0.16);display:flex;align-items:center;gap:5px;"><span style="width:4px;height:4px;border-radius:50%;background:${bp.color};display:inline-block;flex-shrink:0"></span>${s2}</div>`).join("");
      }

      const dec: { label: string; risk: string }[] = [];
      if (state.kp > 4) dec.push({ label: "Geomagnetic storm (Kp=" + fmt1(state.kp) + ")", risk: "high" });
      if (state.lunarIllum > 0.85) dec.push({ label: "Full moon — melatonin suppression risk", risk: "med" });
      if (state.lunarIllum < 0.05) dec.push({ label: "New moon — low-light rhythm reset", risk: "low" });
      if (state.kuramoto.r < 0.5) dec.push({ label: "Lunar–bio phase decoupled (r=" + fmt3(state.kuramoto.r) + ")", risk: "high" });
      if (bp?.name === "Luteal" && state.cycleDay > state.cycleLen - 5) dec.push({ label: "Late luteal — cortisol/progesterone drop", risk: "high" });
      if (state.C < 0.5) dec.push({ label: "Coupled coherence below threshold", risk: "high" });
      if (state.schumann < 0.65) dec.push({ label: "Low Schumann coherence estimate", risk: "med" });
      if (dec.length === 0) dec.push({ label: "No significant decoherence sources detected", risk: "none" });
      const riskColors: Record<string, string> = { high: "#e87898", med: "#d0903a", low: "#3aada8", none: "#6a9a60" };
      const dl = document.getElementById("wcm-decoherence-list");
      if (dl) dl.innerHTML = dec.map((d) => `<div style="font-size:8px;padding:3px 0;border-bottom:1px solid rgba(196,150,60,0.16);display:flex;align-items:center;gap:5px;"><span style="width:5px;height:5px;border-radius:50%;background:${riskColors[d.risk]};flex-shrink:0"></span><span style="color:rgba(216,208,232,0.65)">${d.label}</span></div>`).join("");

      const u2 = K * K * E * E;
      pushHist(state.C, state.kuramoto.r, V, u2);
      prevC = state.C;
      drawSpark("wcm-sp-c", hist.C, "#e0b84a");
      drawSpark("wcm-sp-r", hist.r, "#e87898");
      drawSpark("wcm-sp-v", hist.V, "#a880e8", 0, 0.5);
      drawSpark("wcm-sp-u", hist.u, "#3aada8", 0, 0.02);
      drawCycleArc(state.cycleDay, state.cycleLen);
    }

    function onCycleChange() {
      const g = (id: string) => document.getElementById(id) as HTMLInputElement;
      cycleLen = parseInt(g("wcm-sl-clen")?.value || "28");
      daysAgo = parseInt(g("wcm-sl-dago")?.value || "0");
      lutealLen = parseInt(g("wcm-sl-luteal")?.value || "14");
      const s2 = (id: string, v: string) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      s2("wcm-v-clen", String(cycleLen)); s2("wcm-v-dago", String(daysAgo)); s2("wcm-v-luteal", String(lutealLen));
    }

    let loopCount = 0, rafId: number;
    function loop() {
      rafId = requestAnimationFrame(loop);
      loopCount++;
      const state = computeState();
      drawMain(state);
      if (loopCount % 20 === 0) updatePanels(state);
    }

    const inputs = ["wcm-sl-clen", "wcm-sl-dago", "wcm-sl-luteal"];
    inputs.forEach((id) => { document.getElementById(id)?.addEventListener("input", onCycleChange); });
    const resizeObs = new ResizeObserver(resizeMain);
    const centerEl = document.getElementById("wcm-center");
    if (centerEl) resizeObs.observe(centerEl);
    window.addEventListener("resize", resizeMain);
    resizeMain();
    onCycleChange();
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      window.removeEventListener("resize", resizeMain);
      inputs.forEach((id) => { document.getElementById(id)?.removeEventListener("input", onCycleChange); });
    };
  }, []);

  return (
    <>
      <canvas id="wcm-stars" style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}></canvas>
      <div id="wcm-shell">
        <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

        <div id="wcm-header">
          <h1><em>AETHER</em> — Women's Coherence Map</h1>
          <div className="wcm-hstat"><span className="wcm-hstat-k">Lunar Phase</span><span className="wcm-hstat-v" id="wcm-h-lunar" style={{ color: "var(--moon)" }}>—</span></div>
          <div className="wcm-hstat"><span className="wcm-hstat-k">Cycle Day</span><span className="wcm-hstat-v" id="wcm-h-cday" style={{ color: "var(--rose2)" }}>—</span></div>
          <div className="wcm-hstat"><span className="wcm-hstat-k">Phase</span><span className="wcm-hstat-v" id="wcm-h-phase" style={{ color: "var(--rose)" }}>—</span></div>
          <div className="wcm-hstat"><span className="wcm-hstat-k">Lunar–Bio Coupling</span><span className="wcm-hstat-v" id="wcm-h-coupling" style={{ color: "var(--gold2)" }}>—</span></div>
          <div className="wcm-hstat"><span className="wcm-hstat-k">Kp Index (est)</span><span className="wcm-hstat-v" id="wcm-h-kp" style={{ color: "var(--teal)" }}>—</span></div>
          <div className="wcm-hstat"><span className="wcm-hstat-k">&#x1D49E; Coupled</span><span className="wcm-hstat-v" id="wcm-h-cohc" style={{ color: "var(--gold)" }}>—</span></div>
          <div id="wcm-live-badge"><div id="wcm-live-dot"></div>LIVE PLANETARY COMPUTE</div>
        </div>

        <div id="wcm-panel-left">
          <div className="wcm-sec">
            <div className="wcm-sec-head"><em>CYCLE</em> — personal input</div>
            <div className="wcm-input-row"><label>Cycle length (days) <span id="wcm-v-clen">28</span></label><input type="range" min="21" max="40" defaultValue="28" id="wcm-sl-clen" /></div>
            <div className="wcm-input-row"><label>Last period start (days ago) <span id="wcm-v-dago">0</span></label><input type="range" min="0" max="40" defaultValue="0" id="wcm-sl-dago" /></div>
            <div className="wcm-input-row"><label>Luteal length (days) <span id="wcm-v-luteal">14</span></label><input type="range" min="10" max="18" defaultValue="14" id="wcm-sl-luteal" /></div>
          </div>
          <div className="wcm-sec">
            <div className="wcm-sec-head"><em>CURRENT</em> biological phase</div>
            <div id="wcm-bio-phase-display" style={{ marginBottom: "8px" }}></div>
            <canvas className="wcm-phase-arc" id="wcm-cycle-arc"></canvas>
          </div>
          <div className="wcm-sec">
            <div className="wcm-sec-head"><em>TODAY'S</em> sensitivity windows</div>
            <div id="wcm-sensitivity-map"></div>
          </div>
          <div className="wcm-sec">
            <div className="wcm-sec-head"><em>DECOHERENCE</em> sources — today</div>
            <div id="wcm-decoherence-list"></div>
          </div>
        </div>

        <div id="wcm-center"><canvas id="wcm-main-canvas"></canvas></div>

        <div id="wcm-panel-right">
          <div className="wcm-sec">
            <div className="wcm-sec-head"><em>PLANETARY</em> field — live computed</div>
            <div className="wcm-mrow"><span className="wcm-mk">Lunar illumination</span><span className="wcm-mv" id="wcm-r-lunpct" style={{ color: "var(--moon)" }}>—</span></div>
            <div className="wcm-bar"><div className="wcm-bf" id="wcm-rb-lun" style={{ background: "var(--moon)" }}></div></div>
            <div className="wcm-mrow"><span className="wcm-mk">Lunar age (days)</span><span className="wcm-mv" id="wcm-r-lunage" style={{ color: "var(--moon2)" }}>—</span></div>
            <div className="wcm-mrow"><span className="wcm-mk">Solar cycle phase</span><span className="wcm-mv" id="wcm-r-sol" style={{ color: "var(--amber)" }}>—</span></div>
            <div className="wcm-bar"><div className="wcm-bf" id="wcm-rb-sol" style={{ background: "var(--amber)" }}></div></div>
            <div className="wcm-mrow"><span className="wcm-mk">Kp geomagnetic (est)</span><span className="wcm-mv" id="wcm-r-kp2" style={{ color: "var(--teal)" }}>—</span></div>
            <div className="wcm-bar"><div className="wcm-bf" id="wcm-rb-kp" style={{ background: "var(--teal)" }}></div></div>
            <div className="wcm-mrow"><span className="wcm-mk">Schumann coherence</span><span className="wcm-mv" id="wcm-r-schumann" style={{ color: "var(--violet2)" }}>—</span></div>
          </div>
          <div className="wcm-sec">
            <div className="wcm-sec-head"><em>COUPLING</em> — lunar &#xD7; biological</div>
            <div className="wcm-mrow"><span className="wcm-mk">Phase offset (days)</span><span className="wcm-mv" id="wcm-r-offset">—</span></div>
            <div className="wcm-mrow"><span className="wcm-mk">Angular distance</span><span className="wcm-mv" id="wcm-r-angdist">—</span></div>
            <div className="wcm-mrow"><span className="wcm-mk">Kuramoto r(t)</span><span className="wcm-mv" id="wcm-r-kuramoto" style={{ color: "var(--gold2)" }}>—</span></div>
            <div className="wcm-bar"><div className="wcm-bf" id="wcm-rb-kura" style={{ background: "linear-gradient(90deg,var(--rose),var(--gold2))" }}></div></div>
            <div className="wcm-mrow"><span className="wcm-mk">Coupling strength</span><span className="wcm-mv" id="wcm-r-coupstr" style={{ color: "var(--rose2)" }}>—</span></div>
          </div>
          <div className="wcm-sec">
            <div className="wcm-sec-head"><em>OPTIMIZER</em> — adaptive K(t)</div>
            <div className="wcm-mrow"><span className="wcm-mk">Current gain K</span><span className="wcm-mv" id="wcm-r-K" style={{ color: "var(--teal)" }}>0.020</span></div>
            <div className="wcm-mrow"><span className="wcm-mk">dC/dt</span><span className="wcm-mv" id="wcm-r-dC">—</span></div>
            <div className="wcm-mrow"><span className="wcm-mk">V(x) Lyapunov</span><span className="wcm-mv" id="wcm-r-lyap" style={{ color: "var(--violet2)" }}>—</span></div>
            <div className="wcm-mrow"><span className="wcm-mk">dV/dt</span><span className="wcm-mv" id="wcm-r-dV">—</span></div>
            <div className="wcm-mrow"><span className="wcm-mk">Stability</span><span className="wcm-mv" id="wcm-r-stable">—</span></div>
          </div>
          <div className="wcm-sec">
            <div className="wcm-sec-head"><em>COUPLED</em> coherence &#x1D49E;(t)</div>
            <div style={{ textAlign: "center", padding: "6px 0" }}>
              <span className="wcm-big-c" id="wcm-big-c">—</span>
              <div className="wcm-big-label">PLANETARY &#xD7; BIOLOGICAL</div>
            </div>
          </div>
          <div className="wcm-theorem">
            <div className="wcm-th-head">Lyapunov Stability</div>
            <div className="wcm-th-body">
              V(x) = &#xBD;&#x2016;E&#x2016;&#xB2; &nbsp;&#xB7;&nbsp; &#x116; = &#x2212;&#x1E8B;<br />
              V&#x307; = &#x2212;E&#x1D40;v(x) + K&#x2016;E&#x2016;&#xB2;<br />
              <span style={{ color: "var(--gold2)" }}>V&#x307; &#x2264; &#x2212;&#x3B5;&#x2016;E&#x2016;&#xB2; when K dominates</span><br />
              &#x2234; E(t)&#x2192;0 asymptotically
            </div>
          </div>
        </div>

        <div id="wcm-bottom">
          <div className="wcm-bspark"><div className="wcm-bspark-label">COUPLED &#x1D49E;(t)</div><canvas className="wcm-spark" id="wcm-sp-c"></canvas></div>
          <div className="wcm-bspark"><div className="wcm-bspark-label">KURAMOTO r(t) — phase sync</div><canvas className="wcm-spark" id="wcm-sp-r"></canvas></div>
          <div className="wcm-bspark"><div className="wcm-bspark-label">LYAPUNOV V(x)</div><canvas className="wcm-spark" id="wcm-sp-v"></canvas></div>
          <div className="wcm-bspark"><div className="wcm-bspark-label">CONTROL ENERGY &#x2016;u&#x2016;&#xB2;</div><canvas className="wcm-spark" id="wcm-sp-u"></canvas></div>
        </div>
      </div>
    </>
  );
}

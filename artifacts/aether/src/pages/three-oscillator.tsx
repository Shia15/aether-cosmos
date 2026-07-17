import { useEffect } from "react";

const PAGE_CSS = `
#osc-app {
  --bg: #07080f; --bg1: #0b0d18; --bg2: #0f1120;
  --p1: #3a8080; --p2: #c07840; --p3: #904898; --sync: #c8a84a;
  --text: #ccd0dc; --dim: rgba(204,208,220,0.38); --mid: rgba(204,208,220,0.62);
  --border: rgba(200,168,74,0.13); --border2: rgba(200,168,74,0.28);
}
#osc-app *,#osc-app *::before,#osc-app *::after{box-sizing:border-box;margin:0;padding:0;}
#osc-app {
  display:grid; grid-template-rows:46px 1fr 92px; grid-template-columns:236px 1fr 236px;
  width:100%; height:100vh; background:var(--bg); color:var(--text);
  font-family:'Inconsolata',monospace; font-size:11px; overflow:hidden;
}
#osc-hdr {
  grid-column:1/-1; background:var(--bg1); border-bottom:1px solid var(--border);
  display:flex; align-items:center; padding:0 18px; gap:0;
}
#osc-hdr-title { font-family:'EB Garamond',serif; font-style:italic; font-size:17px; color:#e8dfc8; letter-spacing:0.05em; margin-right:22px; }
.osc-badge { display:flex; align-items:center; gap:5px; padding:0 14px; border-left:1px solid var(--border); flex-direction:column; }
.ob-dot { width:8px; height:8px; border-radius:50%; }
.ob-name { font-size:7px; letter-spacing:0.12em; color:var(--dim); text-transform:uppercase; margin-top:1px; }
.ob-val { font-size:11px; font-weight:500; }
.ob-row { display:flex; align-items:center; gap:5px; }
.osc-eq-strip { margin-left:auto; font-family:'EB Garamond',serif; font-style:italic; font-size:12px; color:var(--dim); letter-spacing:0.02em; }
.osc-eq-strip em { color:var(--sync); font-style:normal; }
#osc-left { grid-column:1; grid-row:2; background:rgba(11,13,24,0.92); border-right:1px solid var(--border); overflow-y:auto; padding:14px 12px; display:flex; flex-direction:column; gap:13px; }
#osc-center { grid-column:2; grid-row:2; position:relative; overflow:hidden; }
#osc-cv { width:100%; height:100%; display:block; }
#osc-right { grid-column:3; grid-row:2; background:rgba(11,13,24,0.92); border-left:1px solid var(--border); overflow-y:auto; padding:14px 12px; display:flex; flex-direction:column; gap:13px; }
#osc-bot { grid-column:1/-1; grid-row:3; background:var(--bg1); border-top:1px solid var(--border); display:grid; grid-template-columns:1fr 1fr 1fr; gap:0; padding:8px 18px; }
.osc-bpanel { border-right:1px solid var(--border); padding:0 16px 0 0; }
.osc-bpanel:last-child { border-right:none; padding-right:0; padding-left:16px; }
.osc-bpanel:nth-child(2) { padding:0 16px; }
.osc-sh { font-size:7px; letter-spacing:0.18em; text-transform:uppercase; color:var(--dim); border-bottom:1px solid var(--border); padding-bottom:4px; margin-bottom:7px; }
.osc-sh em { font-style:normal; }
.osc-mrow { display:flex; justify-content:space-between; align-items:center; margin:3px 0; }
.osc-mk { font-size:9px; color:var(--dim); }
.osc-mv { font-size:10px; font-weight:500; }
.osc-bar { height:3px; background:rgba(255,255,255,0.05); border-radius:2px; margin:2px 0 6px; overflow:hidden; }
.osc-bf { height:100%; border-radius:2px; transition:width 0.35s; }
.osc-slrow { display:flex; flex-direction:column; gap:3px; margin:3px 0 7px; }
.osc-slrow label { display:flex; justify-content:space-between; font-size:8px; color:var(--dim); }
.osc-slrow label span { color:var(--sync); }
#osc-app input[type=range] { -webkit-appearance:none; width:100%; height:3px; background:rgba(255,255,255,0.07); border-radius:2px; outline:none; }
#osc-app input[type=range]::-webkit-slider-thumb { -webkit-appearance:none; width:10px; height:10px; border-radius:50%; background:var(--sync); cursor:pointer; box-shadow:0 0 4px rgba(200,168,74,0.4); }
canvas.osc-spark { width:100%; height:32px; display:block; border:1px solid var(--border); border-radius:2px; }
.osc-claim-box { border:1px solid rgba(200,168,74,0.2); border-radius:3px; padding:8px 10px; background:rgba(200,168,74,0.04); font-family:'EB Garamond',serif; font-size:11px; color:var(--mid); line-height:1.65em; }
.osc-claim-box .c-head { font-size:7px; letter-spacing:0.14em; text-transform:uppercase; color:var(--sync); margin-bottom:5px; font-family:'Inconsolata',monospace; }
.osc-claim-box .c-yes { color:#5aaa6a; }
.osc-claim-box .c-no { color:#c86060; }
.osc-sync-number { font-family:'EB Garamond',serif; font-size:38px; font-weight:400; line-height:1em; text-align:center; display:block; margin:4px 0 2px; }
.osc-sync-sub { font-size:7px; letter-spacing:0.16em; color:var(--dim); text-align:center; }
#osc-app ::-webkit-scrollbar { width:3px; }
#osc-app ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.07); border-radius:2px; }
`;

export default function ThreeOscillator() {
  useEffect(() => {
    const TAU = Math.PI * 2;
    const LUNAR_CYCLE = 29.530588853;

    function lunarPhaseAngle(date: Date) {
      const ref = new Date("2000-01-06T18:14:00Z");
      const days = (date.getTime() - ref.getTime()) / 86400000;
      return ((days % LUNAR_CYCLE) / LUNAR_CYCLE) * TAU;
    }
    function circadianAngle(date: Date) {
      const hours = date.getHours() + date.getMinutes() / 60;
      return (hours / 24) * TAU;
    }
    function solarCyclePhase(date: Date) {
      const start = new Date("2019-12-01");
      const years = (date.getTime() - start.getTime()) / (365.25 * 86400000);
      return (years % 11) / 11;
    }
    function estimateKp(date: Date) {
      const doy = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
      const equinox = Math.abs(Math.sin((doy / 365.25) * TAU - Math.PI / 4));
      const solPhase = solarCyclePhase(date);
      const solar = Math.sin(solPhase * Math.PI) * 1.8;
      const seed = date.getFullYear() * 1000 + doy;
      const pseudo = ((seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
      return Math.max(0, Math.min(9, 1.2 + solar * 0.5 + equinox * 1.2 + pseudo * 1.8));
    }

    const HPHASES = [
      { name: "Menstrual", range: [1, 5], color: "#904898", energyProfile: (d: number) => 0.35 + 0.12 * Math.sin(((d - 1) / 5) * Math.PI), note: "Low estrogen & progesterone. Rest and restoration phase. High prostaglandins." },
      { name: "Follicular", range: [6, 13], color: "#c07840", energyProfile: (d: number) => 0.55 + 0.3 * ((d - 6) / 8), note: "Rising estrogen. Follicle development. Energy and cognitive clarity building." },
      { name: "Ovulatory", range: [14, 17], color: "#c8a84a", energyProfile: (_d: number) => 0.92, note: "LH surge. Peak estrogen. Maximum neural coherence window. Highest synchrony potential." },
      { name: "Luteal", range: [18, 28], color: "#6080b0", energyProfile: (d: number) => 0.72 - 0.25 * Math.max(0, (d - 23) / 5), note: "Progesterone dominant. Inward focus. Late luteal: cortisol rises, decoherence risk." },
    ];
    function getHPhase(cycleDay: number) {
      return HPHASES.find((p) => cycleDay >= p.range[0] && cycleDay <= p.range[1]) || HPHASES[3];
    }
    function hormonalAngle(cycleDay: number, cycleLen: number) {
      return ((cycleDay - 1) / cycleLen) * TAU;
    }
    function hormonalCoherence(cycleDay: number, phase: typeof HPHASES[0]) {
      return Math.max(0.1, Math.min(1, phase.energyProfile(cycleDay)));
    }

    function kuramotoR(thetas: number[]) {
      const re = thetas.reduce((s, t) => s + Math.cos(t), 0) / thetas.length;
      const im = thetas.reduce((s, t) => s + Math.sin(t), 0) / thetas.length;
      return Math.sqrt(re * re + im * im);
    }
    function pairR(t1: number, t2: number) {
      const re = (Math.cos(t1) + Math.cos(t2)) / 2;
      const im = (Math.sin(t1) + Math.sin(t2)) / 2;
      return Math.sqrt(re * re + im * im);
    }
    function wrapAngle(a: number) {
      while (a > Math.PI) a -= TAU;
      while (a < -Math.PI) a += TAU;
      return a;
    }
    function kuramotoStep(thetas: number[], omegas: number[], K: number[][], dt = 0.016) {
      return thetas.map((ti, i) => {
        let coupling = 0;
        thetas.forEach((tj, j) => { if (i !== j) coupling += K[i][j] * Math.sin(tj - ti); });
        return ti + (omegas[i] + coupling) * dt;
      });
    }

    let params = { k12: 0.12, k13: 0.08, k23: 0.15, sleepOffset: 0.0, cycleLen: 28, daysAgo: 14 };
    let thetas = [0, 0, 0];
    let omegas = [0, 0, 0];
    let K_adapt = 0.02;
    let prevC = 0.5;
    const HIST = 150;
    const hist: Record<string, number[]> = { r: [], c: [], d12: [], d13: [], d23: [] };
    function pushHist(o: Record<string, number>) {
      Object.keys(o).forEach((k) => {
        if (!hist[k]) hist[k] = [];
        hist[k].push(o[k]);
        if (hist[k].length > HIST) hist[k].shift();
      });
    }
    let animT = 0;
    let frame = 0;

    function computeState() {
      const date = new Date();
      const lunAngle = lunarPhaseAngle(date);
      const kp = estimateKp(date);
      const circAngle = circadianAngle(date) + params.sleepOffset;
      const cycleDay = Math.max(1, Math.min(params.cycleLen, params.daysAgo + 1));
      const reproAngle = hormonalAngle(cycleDay, params.cycleLen);
      const scale = 90;
      omegas = [TAU / (LUNAR_CYCLE * scale), TAU / (1.0 * scale), TAU / (params.cycleLen * scale)];
      thetas = [lunAngle, circAngle, reproAngle];
      const Kmat = [[0, params.k12, params.k13], [params.k12, 0, params.k23], [params.k13, params.k23, 0]];
      thetas = kuramotoStep(thetas, omegas, Kmat, 1.0);
      const r_all = kuramotoR(thetas);
      const r12 = pairR(thetas[0], thetas[1]);
      const r13 = pairR(thetas[0], thetas[2]);
      const r23 = pairR(thetas[1], thetas[2]);
      const d12 = Math.abs(wrapAngle(thetas[0] - thetas[1]));
      const d13 = Math.abs(wrapAngle(thetas[0] - thetas[2]));
      const d23 = Math.abs(wrapAngle(thetas[1] - thetas[2]));
      const hPhase = getHPhase(cycleDay);
      const hC = hormonalCoherence(cycleDay, hPhase);
      const kpC = Math.max(0.2, 1 - kp / 10);
      const C = Math.pow(r_all * hC * kpC, 0.4);
      const E = 1 - C;
      const V = 0.5 * E * E;
      const dC = C - prevC;
      const dV = E * (-K_adapt * E);
      if (C < 0.5) K_adapt = Math.min(0.12, K_adapt + 0.002);
      if (C > 0.8) K_adapt = Math.max(0.005, K_adapt * 0.997);
      prevC = C;
      return { thetas, omegas, Kmat, r_all, r12, r13, r23, d12, d13, d23, lunAngle, kp, circAngle: circAngle % TAU, reproAngle, cycleDay, hPhase, hC, kpC, C, E, V, dV, K_adapt, lunarPct: (1 - Math.cos(lunAngle)) / 2 };
    }

    const cv = document.getElementById("osc-cv") as HTMLCanvasElement;
    const ctx = cv?.getContext("2d");
    function resizeCV() {
      if (!cv) return;
      cv.width = cv.offsetWidth * (devicePixelRatio || 1);
      cv.height = cv.offsetHeight * (devicePixelRatio || 1);
    }

    function drawMain(s: ReturnType<typeof computeState>) {
      if (!ctx || !cv) return;
      const W = cv.width, H = cv.height;
      const cx2 = W / 2, cy2 = H / 2;
      const dpr = devicePixelRatio || 1;
      ctx.fillStyle = "rgba(7,8,15,0.16)";
      ctx.fillRect(0, 0, W, H);
      animT += 0.007;
      const R = Math.min(W, H) * 0.34;
      const oscColors = ["#3a8080", "#c07840", "#904898"];
      const oscR = [R * 0.55, R * 0.75, R * 1.0];
      const labels = ["PLANETARY", "METABOLIC", "REPRO"];
      s.thetas.forEach((theta, i) => {
        const r2 = oscR[i];
        const x = cx2 + Math.cos(theta) * r2, y = cy2 + Math.sin(theta) * r2;
        const col = oscColors[i];
        ctx.beginPath(); ctx.arc(cx2, cy2, r2, 0, TAU);
        ctx.strokeStyle = col + "20"; ctx.lineWidth = 0.8 * dpr; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx2, cy2); ctx.lineTo(x, y);
        ctx.strokeStyle = col + "18"; ctx.lineWidth = 0.6 * dpr; ctx.stroke();
        const grd = ctx.createRadialGradient(x, y, 0, x, y, 14 * dpr);
        grd.addColorStop(0, col + "60"); grd.addColorStop(1, "transparent");
        ctx.beginPath(); ctx.arc(x, y, 14 * dpr, 0, TAU); ctx.fillStyle = grd; ctx.fill();
        const pulse = 0.9 + 0.1 * Math.sin(animT * 2 + i);
        ctx.beginPath(); ctx.arc(x, y, 6 * dpr * pulse, 0, TAU);
        ctx.fillStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 10 * dpr; ctx.fill(); ctx.shadowBlur = 0;
        const lx = cx2 + Math.cos(theta) * (r2 + 16 * dpr);
        const ly = cy2 + Math.sin(theta) * (r2 + 16 * dpr);
        ctx.font = `${6.5 * dpr}px Inconsolata`; ctx.fillStyle = col + "aa"; ctx.textAlign = "center";
        ctx.fillText(labels[i], lx, ly);
      });
      const pts = s.thetas.map((t, i) => ({ x: cx2 + Math.cos(t) * oscR[i], y: cy2 + Math.sin(t) * oscR[i] }));
      [[0, 1, s.r12, params.k12], [0, 2, s.r13, params.k13], [1, 2, s.r23, params.k23]].forEach(([a, b, r, K]) => {
        ctx.beginPath(); ctx.moveTo(pts[a as number].x, pts[a as number].y); ctx.lineTo(pts[b as number].x, pts[b as number].y);
        ctx.strokeStyle = `rgba(200,168,74,${0.08 + (r as number) * 0.3})`; ctx.lineWidth = (0.5 + (K as number) * 2) * dpr; ctx.stroke();
      });
      const rColor = s.r_all > 0.75 ? "#5aaa6a" : s.r_all > 0.5 ? "#c8a84a" : "#c06060";
      ctx.font = `bold ${18 * dpr}px Inconsolata`; ctx.fillStyle = rColor; ctx.textAlign = "center";
      ctx.fillText("r = " + s.r_all.toFixed(3), cx2, cy2 - 6 * dpr);
      ctx.font = `${7 * dpr}px Inconsolata`; ctx.fillStyle = "rgba(204,208,220,0.25)";
      ctx.fillText("phase sync", cx2, cy2 + 7 * dpr);
      const arcEnd = -Math.PI / 2 + s.r_all * TAU;
      ctx.beginPath(); ctx.arc(cx2, cy2, R * 0.25, -Math.PI / 2, arcEnd);
      ctx.strokeStyle = rColor + "88"; ctx.lineWidth = 2 * dpr; ctx.shadowColor = rColor; ctx.shadowBlur = 6 * dpr; ctx.stroke(); ctx.shadowBlur = 0;
      [[0, 1, "#3a8080", "#c07840"], [0, 2, "#3a8080", "#904898"], [1, 2, "#c07840", "#904898"]].forEach(([a, b], idx) => {
        const miniR = 18 * dpr;
        const mx = cx2 + (idx - 1) * 55 * dpr, my = cy2 + R * 0.42;
        const d = wrapAngle(s.thetas[a as number] - s.thetas[b as number]);
        ctx.beginPath(); ctx.arc(mx, my, miniR, -Math.PI / 2, -Math.PI / 2 + Math.abs(d));
        const pairKey = "r" + ((a as number) + 1) + ((b as number) + 1);
        ctx.strokeStyle = `rgba(200,168,74,${0.3 + (s as any)[pairKey] * 0.4})`; ctx.lineWidth = 1.5 * dpr; ctx.stroke();
        ctx.font = `${6 * dpr}px Inconsolata`; ctx.fillStyle = "rgba(204,208,220,0.3)"; ctx.textAlign = "center";
        ctx.fillText((Math.abs(d) * 180 / Math.PI).toFixed(0) + "°", mx, my + miniR + 9 * dpr);
      });
    }

    function drawPhasePortrait(s: ReturnType<typeof computeState>) {
      const cv2 = document.getElementById("osc-phase-portrait") as HTMLCanvasElement;
      if (!cv2) return;
      const dpr = devicePixelRatio || 1;
      cv2.width = cv2.offsetWidth * dpr; cv2.height = 100 * dpr;
      const ctx2 = cv2.getContext("2d"); if (!ctx2) return;
      const W2 = cv2.width, H2 = cv2.height;
      ctx2.clearRect(0, 0, W2, H2);
      ctx2.fillStyle = "rgba(11,13,24,0.8)"; ctx2.fillRect(0, 0, W2, H2);
      const pairs: [number, number, string, string][] = [[s.thetas[0], s.thetas[1], "#3a8080", "#c07840"], [s.thetas[0], s.thetas[2], "#3a8080", "#904898"], [s.thetas[1], s.thetas[2], "#c07840", "#904898"]];
      pairs.forEach(([t1, t2, c1, c2], i) => {
        const cx3 = W2 * (0.17 + i * 0.33), cy3 = H2 * 0.5, r2 = H2 * 0.3;
        ctx2.beginPath(); ctx2.arc(cx3, cy3, r2, 0, TAU); ctx2.strokeStyle = "rgba(255,255,255,0.05)"; ctx2.lineWidth = 0.7 * dpr; ctx2.stroke();
        const x1 = cx3 + Math.cos(t1) * r2, y1 = cy3 + Math.sin(t1) * r2;
        const x2 = cx3 + Math.cos(t2) * r2, y2 = cy3 + Math.sin(t2) * r2;
        ctx2.beginPath(); ctx2.moveTo(x1, y1); ctx2.lineTo(x2, y2); ctx2.strokeStyle = "rgba(200,168,74,0.25)"; ctx2.lineWidth = 0.8 * dpr; ctx2.stroke();
        [[x1, y1, c1], [x2, y2, c2]].forEach(([x, y, c]) => {
          ctx2.beginPath(); ctx2.arc(x as number, y as number, 3 * dpr, 0, TAU);
          ctx2.fillStyle = c as string; ctx2.shadowColor = c as string; ctx2.shadowBlur = 4 * dpr; ctx2.fill(); ctx2.shadowBlur = 0;
        });
      });
    }

    function drawSpark(id: string, _data: null, series: [number[], string][], min = 0, max = 1) {
      const cv2 = document.getElementById(id) as HTMLCanvasElement; if (!cv2) return;
      const dpr = devicePixelRatio || 1;
      cv2.width = cv2.offsetWidth * dpr; cv2.height = cv2.offsetHeight * dpr;
      const ctx2 = cv2.getContext("2d"); if (!ctx2) return;
      const W2 = cv2.width, H2 = cv2.height;
      ctx2.fillStyle = "rgba(11,13,24,0.7)"; ctx2.fillRect(0, 0, W2, H2);
      series.forEach(([arr, color]) => {
        if (!arr || arr.length < 2) return;
        ctx2.beginPath();
        arr.forEach((v, i) => {
          const x = (i / (arr.length - 1)) * W2;
          const y = H2 - ((v - min) / (max - min + 1e-6)) * H2 * 0.88 - H2 * 0.06;
          i === 0 ? ctx2.moveTo(x, y) : ctx2.lineTo(x, y);
        });
        ctx2.strokeStyle = color; ctx2.lineWidth = 1.5 * dpr; ctx2.shadowColor = color; ctx2.shadowBlur = 2 * dpr; ctx2.stroke(); ctx2.shadowBlur = 0;
      });
    }

    function updatePanels(s: ReturnType<typeof computeState>) {
      const f3 = (v: number) => v.toFixed(3), f1 = (v: number) => v.toFixed(1);
      const set = (id: string, val: string) => { const el = document.getElementById(id); if (el) el.textContent = val; };
      const setStyle = (id: string, prop: string, val: string) => { const el = document.getElementById(id) as HTMLElement; if (el) el.style[prop as any] = val; };
      set("osc-h-p1", f3(s.thetas[0] % TAU)); set("osc-h-p2", f3(s.thetas[1] % TAU)); set("osc-h-p3", f3(s.thetas[2] % TAU)); set("osc-h-r", f3(s.r_all)); set("osc-h-c", f3(s.C));
      set("osc-v-T1", "29.5 d"); set("osc-v-th1", (s.thetas[0] % TAU).toFixed(3) + " rad"); set("osc-v-lun", (s.lunarPct * 100).toFixed(0) + "% illuminated");
      set("osc-v-kp", f1(s.kp) + " (" + ["quiet","quiet","quiet","active","active","storm","storm","storm","storm","extreme"][Math.min(9, Math.floor(s.kp))] + ")");
      setStyle("osc-b-kp", "width", (s.kp / 9 * 100) + "%");
      set("osc-v-th2", (s.thetas[1] % TAU).toFixed(3) + " rad"); set("osc-v-th3", (s.thetas[2] % TAU).toFixed(3) + " rad");
      set("osc-v-hphase", s.hPhase.name); setStyle("osc-v-hphase", "color", s.hPhase.color);
      set("osc-big-r", f3(s.r_all)); setStyle("osc-big-r", "color", s.r_all > 0.75 ? "#5aaa6a" : s.r_all > 0.5 ? "#c8a84a" : "#c06060");
      set("osc-r12", f3(s.r12)); set("osc-r13", f3(s.r13)); set("osc-r23", f3(s.r23));
      setStyle("osc-b-r12", "width", s.r12 * 100 + "%"); setStyle("osc-b-r13", "width", s.r13 * 100 + "%"); setStyle("osc-b-r23", "width", s.r23 * 100 + "%");
      set("osc-dth12", (s.d12 * 180 / Math.PI).toFixed(1) + "°"); set("osc-dth13", (s.d13 * 180 / Math.PI).toFixed(1) + "°"); set("osc-dth23", (s.d23 * 180 / Math.PI).toFixed(1) + "°");
      set("osc-c-total", f3(s.C)); setStyle("osc-bc-total", "width", s.C * 100 + "%");
      set("osc-v-lyap", s.V.toFixed(4)); set("osc-v-Kadapt", s.K_adapt.toFixed(4));
      const dVEl = document.getElementById("osc-v-dV"); if (dVEl) dVEl.innerHTML = (s.dV < 0 ? '<span style="color:#5aaa6a">' : '<span style="color:#c06060">') + (s.dV >= 0 ? "+" : "") + s.dV.toFixed(5) + "</span>";
      const decoherences = [
        { cond: s.d12 > 1.2, msg: `Planet–metabolic gap: ${(s.d12 * 180 / Math.PI).toFixed(0)}°`, level: "med" },
        { cond: s.d13 > 1.4, msg: `Planet–reproductive gap: ${(s.d13 * 180 / Math.PI).toFixed(0)}°`, level: "high" },
        { cond: s.d23 > 1.0, msg: `Metabolic–reproductive gap: ${(s.d23 * 180 / Math.PI).toFixed(0)}°`, level: "high" },
        { cond: s.kp > 4, msg: `Elevated Kp=${f1(s.kp)} — geomagnetic activity`, level: "med" },
        { cond: s.r_all < 0.5, msg: `Low synchrony r=${f3(s.r_all)}`, level: "high" },
        { cond: s.hPhase.name === "Luteal" && s.cycleDay > params.cycleLen - 5, msg: "Late luteal — peak decoherence window", level: "high" },
        { cond: s.r_all > 0.78, msg: `High synchrony — low decoherence`, level: "none" },
      ];
      const colors2: Record<string, string> = { high: "#c86060", med: "#c8903a", none: "#5aaa6a" };
      const dp = document.getElementById("osc-decoherence-panel");
      if (dp) dp.innerHTML = decoherences.filter((d) => d.cond).map((d) => `<div style="font-size:8px;padding:3px 0;border-bottom:1px solid rgba(200,168,74,0.08);display:flex;align-items:center;gap:5px;"><span style="width:4px;height:4px;border-radius:50%;background:${colors2[d.level]};flex-shrink:0;display:inline-block"></span><span style="color:rgba(204,208,220,0.62)">${d.msg}</span></div>`).join("");
      const hp = document.getElementById("osc-hormone-panel");
      if (hp) hp.innerHTML = `<div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;"><span style="width:8px;height:8px;border-radius:50%;background:${s.hPhase.color};display:inline-block;box-shadow:0 0 6px ${s.hPhase.color}"></span><span style="font-family:'EB Garamond',serif;font-size:13px;color:${s.hPhase.color}">${s.hPhase.name} — Day ${s.cycleDay}</span></div><div style="font-family:'EB Garamond',serif;font-style:italic;font-size:10px;color:rgba(204,208,220,0.62);line-height:1.6em;">${s.hPhase.note}</div><div style="margin-top:6px;"><div style="display:flex;justify-content:space-between;font-size:8px;margin:2px 0;"><span style="color:rgba(204,208,220,0.38)">Hormonal coherence</span><span style="color:${s.hPhase.color}">${(s.hC * 100).toFixed(0)}%</span></div><div style="height:2px;background:rgba(255,255,255,0.05);border-radius:1px;overflow:hidden;"><div style="height:100%;width:${s.hC * 100}%;background:${s.hPhase.color};border-radius:1px;"></div></div></div>`;
      pushHist({ r: s.r_all, c: s.C, d12: s.d12 / Math.PI, d13: s.d13 / Math.PI, d23: s.d23 / Math.PI });
      drawSpark("osc-sp-r", null, [[hist.r, "#c8a84a"], [hist.r12 || [], "#3a8080"], [hist.r13 || [], "#904898"]]);
      drawSpark("osc-sp-c", null, [[hist.c, "#5aaa6a"]]);
      drawSpark("osc-sp-d", null, [[hist.d12, "#3a8080"], [hist.d13, "#904898"], [hist.d23, "#c07840"]], 0, 1);
      drawPhasePortrait(s);
    }

    function onParam() {
      const g = (id: string) => document.getElementById(id) as HTMLInputElement;
      const s2 = (id: string, v: string) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      params.k12 = parseFloat(g("osc-k12")?.value || "0.12");
      params.k13 = parseFloat(g("osc-k13")?.value || "0.08");
      params.k23 = parseFloat(g("osc-k23")?.value || "0.15");
      params.sleepOffset = parseFloat(g("osc-sl-sleep")?.value || "0");
      params.cycleLen = parseInt(g("osc-sl-clen")?.value || "28");
      params.daysAgo = parseInt(g("osc-sl-dago")?.value || "14");
      s2("osc-vk12", params.k12.toFixed(2)); s2("osc-vk13", params.k13.toFixed(2)); s2("osc-vk23", params.k23.toFixed(2));
      s2("osc-vsleep", params.sleepOffset.toFixed(1)); s2("osc-vclen", String(params.cycleLen)); s2("osc-vdago", String(params.daysAgo));
    }

    let rafId: number;
    function loop() {
      rafId = requestAnimationFrame(loop);
      frame++;
      const s = computeState();
      drawMain(s);
      if (frame % 18 === 0) updatePanels(s);
    }

    const inputs = ["osc-k12","osc-k13","osc-k23","osc-sl-sleep","osc-sl-clen","osc-sl-dago"];
    inputs.forEach((id) => { document.getElementById(id)?.addEventListener("input", onParam); });
    const resizeObs = new ResizeObserver(resizeCV);
    const centerEl = document.getElementById("osc-center");
    if (centerEl) resizeObs.observe(centerEl);
    resizeCV();
    onParam();
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      resizeObs.disconnect();
      inputs.forEach((id) => { document.getElementById(id)?.removeEventListener("input", onParam); });
    };
  }, []);

  return (
    <div id="osc-app">
      <style dangerouslySetInnerHTML={{ __html: PAGE_CSS }} />

      <div id="osc-hdr">
        <div id="osc-hdr-title">AETHER — Three-Oscillator Coherence</div>
        <div className="osc-badge">
          <div className="ob-row"><div className="ob-dot" style={{ background: "var(--p1)" }}></div><span className="ob-name">Planetary &#x3B8;&#x2081;</span></div>
          <span className="ob-val" id="osc-h-p1" style={{ color: "var(--p1)" }}>—</span>
        </div>
        <div className="osc-badge">
          <div className="ob-row"><div className="ob-dot" style={{ background: "var(--p2)" }}></div><span className="ob-name">Metabolic &#x3B8;&#x2082;</span></div>
          <span className="ob-val" id="osc-h-p2" style={{ color: "var(--p2)" }}>—</span>
        </div>
        <div className="osc-badge">
          <div className="ob-row"><div className="ob-dot" style={{ background: "var(--p3)" }}></div><span className="ob-name">Reproductive &#x3B8;&#x2083;</span></div>
          <span className="ob-val" id="osc-h-p3" style={{ color: "var(--p3)" }}>—</span>
        </div>
        <div className="osc-badge">
          <div className="ob-row"><div className="ob-dot" style={{ background: "var(--sync)" }}></div><span className="ob-name">r(t) Kuramoto</span></div>
          <span className="ob-val" id="osc-h-r" style={{ color: "var(--sync)" }}>—</span>
        </div>
        <div className="osc-badge">
          <div className="ob-row"><div className="ob-dot" style={{ background: "#5aaa6a" }}></div><span className="ob-name">&#x1D49E; coupled</span></div>
          <span className="ob-val" id="osc-h-c" style={{ color: "#5aaa6a" }}>—</span>
        </div>
        <div className="osc-eq-strip">
          &#x3B8;&#x307;&#x1D62; = &#x3C9;&#x1D62; + &#x2211;&#x2C7C; <em>K</em>&#x1D62;&#x2C7C; sin(&#x3B8;&#x2C7C; &#x2212; &#x3B8;&#x1D62;) &nbsp;&#x00B7;&nbsp; r(t) = |&#x27E8;e<sup>i&#x3B8;</sup>&#x27E9;|
        </div>
      </div>

      <div id="osc-left">
        <div>
          <div className="osc-sh"><em style={{ color: "var(--p1)" }}>OSC 1</em> — planetary / environmental</div>
          <div className="osc-mrow"><span className="osc-mk">Period T&#x2081;</span><span className="osc-mv" id="osc-v-T1" style={{ color: "var(--p1)" }}>29.5 d</span></div>
          <div className="osc-mrow"><span className="osc-mk">Current phase &#x3B8;&#x2081;</span><span className="osc-mv" id="osc-v-th1" style={{ color: "var(--p1)" }}>—</span></div>
          <div className="osc-mrow"><span className="osc-mk">Lunar illumination</span><span className="osc-mv" id="osc-v-lun">—</span></div>
          <div className="osc-mrow"><span className="osc-mk">Kp estimate</span><span className="osc-mv" id="osc-v-kp">—</span></div>
          <div className="osc-bar"><div className="osc-bf" id="osc-b-kp" style={{ background: "var(--p1)" }}></div></div>
          <div className="osc-slrow">
            <label>K&#x2081;&#x2082; coupling to metabolic <span id="osc-vk12">0.12</span></label>
            <input type="range" min="0" max="0.5" step="0.01" defaultValue="0.12" id="osc-k12" />
          </div>
          <div className="osc-slrow">
            <label>K&#x2081;&#x2083; coupling to reproductive <span id="osc-vk13">0.08</span></label>
            <input type="range" min="0" max="0.5" step="0.01" defaultValue="0.08" id="osc-k13" />
          </div>
        </div>
        <div>
          <div className="osc-sh"><em style={{ color: "var(--p2)" }}>OSC 2</em> — metabolic / circadian</div>
          <div className="osc-mrow"><span className="osc-mk">Period T&#x2082;</span><span className="osc-mv" style={{ color: "var(--p2)" }}>1.0 d (circadian)</span></div>
          <div className="osc-mrow"><span className="osc-mk">Current phase &#x3B8;&#x2082;</span><span className="osc-mv" id="osc-v-th2" style={{ color: "var(--p2)" }}>—</span></div>
          <div className="osc-slrow">
            <label>Sleep quality offset <span id="osc-vsleep">0.0</span></label>
            <input type="range" min="-1.5" max="1.5" step="0.1" defaultValue="0" id="osc-sl-sleep" />
          </div>
          <div className="osc-slrow">
            <label>K&#x2082;&#x2083; coupling to repro <span id="osc-vk23">0.15</span></label>
            <input type="range" min="0" max="0.5" step="0.01" defaultValue="0.15" id="osc-k23" />
          </div>
        </div>
        <div>
          <div className="osc-sh"><em style={{ color: "var(--p3)" }}>OSC 3</em> — reproductive / hormonal</div>
          <div className="osc-slrow">
            <label>Cycle length (days) <span id="osc-vclen">28</span></label>
            <input type="range" min="21" max="40" defaultValue="28" id="osc-sl-clen" />
          </div>
          <div className="osc-slrow">
            <label>Days since last period <span id="osc-vdago">14</span></label>
            <input type="range" min="0" max="40" defaultValue="14" id="osc-sl-dago" />
          </div>
          <div className="osc-mrow"><span className="osc-mk">Current phase &#x3B8;&#x2083;</span><span className="osc-mv" id="osc-v-th3" style={{ color: "var(--p3)" }}>—</span></div>
          <div className="osc-mrow"><span className="osc-mk">Hormonal phase</span><span className="osc-mv" id="osc-v-hphase" style={{ color: "var(--p3)" }}>—</span></div>
        </div>
        <div className="osc-claim-box">
          <div className="c-head">Scientific boundary</div>
          <span className="c-yes">&#x2713; Coupled oscillator model</span><br />
          <span className="c-yes">&#x2713; Phase alignment measurable</span><br />
          <span className="c-yes">&#x2713; Kuramoto r(t) is computable</span><br />
          <span className="c-yes">&#x2713; Decoherence = phase gap</span><br /><br />
          <span className="c-no">&#x2717; Not deterministic causation</span><br />
          <span className="c-no">&#x2717; Not planetary &#x2192; menstrual control</span><br />
          <span className="c-no">&#x2717; Coupling strengths K are estimates</span>
        </div>
      </div>

      <div id="osc-center"><canvas id="osc-cv"></canvas></div>

      <div id="osc-right">
        <div>
          <div className="osc-sh"><em style={{ color: "var(--sync)" }}>r(t)</em> — Kuramoto order parameter</div>
          <span className="osc-sync-number" id="osc-big-r">—</span>
          <div className="osc-sync-sub">PHASE SYNCHRONY (0=chaos · 1=locked)</div>
          <div style={{ marginTop: "8px" }}>
            <div className="osc-mrow"><span className="osc-mk">r&#x2081;&#x2082; (planet &#xD7; metabolic)</span><span className="osc-mv" id="osc-r12" style={{ color: "var(--p1)" }}>—</span></div>
            <div className="osc-bar"><div className="osc-bf" id="osc-b-r12" style={{ background: "var(--p1)" }}></div></div>
            <div className="osc-mrow"><span className="osc-mk">r&#x2081;&#x2083; (planet &#xD7; repro)</span><span className="osc-mv" id="osc-r13" style={{ color: "var(--p3)" }}>—</span></div>
            <div className="osc-bar"><div className="osc-bf" id="osc-b-r13" style={{ background: "var(--p3)" }}></div></div>
            <div className="osc-mrow"><span className="osc-mk">r&#x2082;&#x2083; (metabolic &#xD7; repro)</span><span className="osc-mv" id="osc-r23" style={{ color: "var(--p2)" }}>—</span></div>
            <div className="osc-bar"><div className="osc-bf" id="osc-b-r23" style={{ background: "var(--p2)" }}></div></div>
          </div>
        </div>
        <div>
          <div className="osc-sh"><em>PHASE</em> portrait — angular distances</div>
          <canvas id="osc-phase-portrait" style={{ width: "100%", height: "100px", display: "block", border: "1px solid var(--border)", borderRadius: "2px" }}></canvas>
          <div style={{ marginTop: "6px" }}>
            <div className="osc-mrow"><span className="osc-mk">&#x394;&#x3B8;&#x2081;&#x2082; (planet–metabolic)</span><span className="osc-mv" id="osc-dth12">—</span></div>
            <div className="osc-mrow"><span className="osc-mk">&#x394;&#x3B8;&#x2081;&#x2083; (planet–repro)</span><span className="osc-mv" id="osc-dth13">—</span></div>
            <div className="osc-mrow"><span className="osc-mk">&#x394;&#x3B8;&#x2082;&#x2083; (metabolic–repro)</span><span className="osc-mv" id="osc-dth23">—</span></div>
          </div>
        </div>
        <div>
          <div className="osc-sh"><em>&#x1D49E;</em> coupled coherence</div>
          <div className="osc-mrow"><span className="osc-mk">&#x1D49E;_total (geom mean)</span><span className="osc-mv" id="osc-c-total" style={{ color: "var(--sync)" }}>—</span></div>
          <div className="osc-bar"><div className="osc-bf" id="osc-bc-total" style={{ background: "var(--sync)" }}></div></div>
          <div className="osc-mrow"><span className="osc-mk">Lyapunov V(x)</span><span className="osc-mv" id="osc-v-lyap" style={{ color: "#9080c0" }}>—</span></div>
          <div className="osc-mrow"><span className="osc-mk">dV/dt</span><span className="osc-mv" id="osc-v-dV">—</span></div>
          <div className="osc-mrow"><span className="osc-mk">Adaptive K gain</span><span className="osc-mv" id="osc-v-Kadapt">—</span></div>
        </div>
        <div>
          <div className="osc-sh"><em>DECOHERENCE</em> — phase gaps today</div>
          <div id="osc-decoherence-panel"></div>
        </div>
        <div>
          <div className="osc-sh"><em>HORMONAL</em> phase context</div>
          <div id="osc-hormone-panel"></div>
        </div>
      </div>

      <div id="osc-bot">
        <div className="osc-bpanel">
          <div style={{ fontSize: "7px", letterSpacing: "0.14em", color: "var(--dim)", marginBottom: "3px" }}>r(t) KURAMOTO — phase sync history</div>
          <canvas className="osc-spark" id="osc-sp-r"></canvas>
        </div>
        <div className="osc-bpanel">
          <div style={{ fontSize: "7px", letterSpacing: "0.14em", color: "var(--dim)", marginBottom: "3px" }}>&#x1D49E; COUPLED COHERENCE — history</div>
          <canvas className="osc-spark" id="osc-sp-c"></canvas>
        </div>
        <div className="osc-bpanel">
          <div style={{ fontSize: "7px", letterSpacing: "0.14em", color: "var(--dim)", marginBottom: "3px" }}>&#x394;&#x3B8; PHASE GAPS — all three pairs</div>
          <canvas className="osc-spark" id="osc-sp-d"></canvas>
        </div>
      </div>
    </div>
  );
}

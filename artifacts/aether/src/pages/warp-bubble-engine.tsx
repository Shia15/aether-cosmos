import { useEffect, useRef, useState, useCallback } from "react";

const PHI   = 1.6180339887;
const THETA = 360 / PHI; // 222.492...°

const D_COLORS = ["#1fd4c8", "#c9a84c", "#8b5cf6", "#ec4899", "#22c55e"];
const D_NAMES  = ["D1 · PHYSICAL", "D2 · OSCILLATORY", "D3 · INFORMATIONAL", "D4 · CONSCIOUS", "D5 · REGENERATIVE"];
const D_DESC   = [
  "Exotic matter supply to bubble wall. Element activation layer. Each element contributes negative-energy density.",
  "Adjusts twist rate Θ_n in real time to maintain C_total minimum. Oscillatory governor of the drive.",
  "Encodes destination as 500D ring-field state vector. Navigation by ring-field attractor, not classical coords.",
  "Passenger neural sync to Φ-clock. Biological oscillator phase-lock. Coherent flow state.",
  "Spacetime fabric repair. Micro-tear healing in bubble wake. Metric re-stitching.",
];

const BG = "#010810";
const PANEL_BG = "#020d1a";
const BORDER = "#0d2030";
const MONO = "'Space Mono', monospace";

interface DomainSliderProps {
  idx: number;
  value: number;
  focused: boolean;
  onChange: (i: number, v: number) => void;
  onFocus: (i: number) => void;
}

function DomainSlider({ idx, value, focused, onChange, onFocus }: DomainSliderProps) {
  const col = D_COLORS[idx];
  return (
    <div
      onClick={() => onFocus(idx)}
      style={{
        background: focused ? `${col}14` : `${col}08`,
        border: `1px solid ${focused ? col + "60" : col + "25"}`,
        borderRadius: 7, padding: "10px 12px", cursor: "pointer",
        transition: "all 0.2s",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
        <span style={{ fontFamily: MONO, fontSize: 10, color: col, letterSpacing: 1 }}>{D_NAMES[idx]}</span>
      </div>
      <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: 12, color: "#4a7a8a", lineHeight: 1.4, marginBottom: 8 }}>
        {D_DESC[idx]}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input
          type="range" min={0} max={100} value={value}
          style={{ flex: 1, accentColor: col, height: 3 }}
          onInput={e => onChange(idx, parseInt((e.target as HTMLInputElement).value))}
          onClick={e => e.stopPropagation()}
        />
        <span style={{ fontFamily: MONO, fontSize: 11, color: col, width: 26, textAlign: "right" }}>{value}</span>
      </div>
    </div>
  );
}

function WarpBubbleEngineHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    const cx=W/2,cy=H/2;
    let t=0;
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.28)"; ctx.fillRect(0,0,W,H);
      for(let layer=3;layer>=1;layer--){
        const r=layer*22+5*Math.sin(t*0.04+layer);
        const compress=0.4+0.1*layer;
        ctx.beginPath();ctx.ellipse(cx-8,cy,r*0.4,r*compress,0,0,Math.PI*2);ctx.strokeStyle=`rgba(68,170,255,${0.1+layer*0.04})`;ctx.lineWidth=0.8;ctx.stroke();
        ctx.beginPath();ctx.ellipse(cx+8,cy,r*0.4,r*compress,0,0,Math.PI*2);ctx.strokeStyle=`rgba(255,100,30,${0.1+layer*0.04})`;ctx.lineWidth=0.8;ctx.stroke();
      }
      ctx.beginPath();ctx.ellipse(cx,cy,10,6,0,0,Math.PI*2);ctx.fillStyle="rgba(255,255,255,0.15)";ctx.fill();ctx.strokeStyle="rgba(255,255,255,0.4)";ctx.lineWidth=0.6;ctx.stroke();
      const wakeLen=60+20*Math.sin(t*0.03);
      ctx.beginPath();
      for(let x=0;x<=wakeLen;x+=3){
        const y=cy+5*Math.sin(x*0.1+t*0.06);
        x===0?ctx.moveTo(cx+10+x,y):ctx.lineTo(cx+10+x,y);
      }
      ctx.strokeStyle="rgba(68,170,255,0.2)";ctx.lineWidth=0.6;ctx.stroke();
      ctx.fillStyle="rgba(68,170,255,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("WARP BUBBLE ENGINE · ALCUBIERRE METRIC · SPACE COMPRESSION · EXOTIC MATTER · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function WarpBubbleEnginePage() {
  const warpRef   = useRef<HTMLCanvasElement>(null);
  const phiRef    = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const stateRef  = useRef({
    t: 0, frame: 0, step_n: 0, xpos: 0,
    warpPhase: 0, fabricIntegrity: 100,
    lastLog: 0,
  });

  const [domains,    setDomains]    = useState([80, 75, 65, 90, 70]);
  const [warpOn,     setWarpOn]     = useState(false);
  const [phiOn,      setPhiOn]      = useState(true);
  const [twistOn,    setTwistOn]    = useState(true);
  const [domainsOn,  setDomainsOn]  = useState(true);
  const [focused,    setFocused]    = useState(-1);
  const [v0,         setV0]         = useState(3.0);
  const [bubbleR,    setBubbleR]    = useState(60);
  const [wallSig,    setWallSig]    = useState(15);
  const [readouts,   setReadouts]   = useState({
    vs: "0.000c", twist: "0.0°", phi: "φ=1.6180", ctotal: "0.000",
    n: 0, xpos: "0.00",
    rho: "1.000", exotic: "0.000", grad: "0.000", causal: "SAFE", fabric: "100%", phase: "0.0°",
  });
  const [domStats,   setDomStats]   = useState([80, 75, 65, 90, 70]);
  const [frameN,     setFrameN]     = useState(0);
  const [events,     setEvents]     = useState<{ n: number; msg: string; col: string }[]>([]);

  // Keep mutable copies for canvas loop
  const domainsLive   = useRef(domains);
  const warpOnLive    = useRef(warpOn);
  const phiOnLive     = useRef(phiOn);
  const twistOnLive   = useRef(twistOn);
  const domainsOnLive = useRef(domainsOn);
  const v0Live        = useRef(v0);
  const bubbleRLive   = useRef(bubbleR);
  const wallSigLive   = useRef(wallSig);

  useEffect(() => { domainsLive.current   = domains;   }, [domains]);
  useEffect(() => { warpOnLive.current    = warpOn;    }, [warpOn]);
  useEffect(() => { phiOnLive.current     = phiOn;     }, [phiOn]);
  useEffect(() => { twistOnLive.current   = twistOn;   }, [twistOn]);
  useEffect(() => { domainsOnLive.current = domainsOn; }, [domainsOn]);
  useEffect(() => { v0Live.current        = v0;        }, [v0]);
  useEffect(() => { bubbleRLive.current   = bubbleR;   }, [bubbleR]);
  useEffect(() => { wallSigLive.current   = wallSig;   }, [wallSig]);

  const addEvent = useCallback((msg: string, col: string) => {
    setEvents(prev => [{ n: stateRef.current.step_n, msg, col }, ...prev].slice(0, 28));
  }, []);

  const handleWarpToggle = useCallback(() => {
    setWarpOn(prev => {
      const next = !prev;
      if (next) addEvent("WARP ENGAGED — Phi-Time clock synchronized", "#1fd4c8");
      else      addEvent("WARP DISENGAGED — bubble dissolved", "#ef4444");
      return next;
    });
  }, [addEvent]);

  const handlePhiToggle = useCallback(() => {
    setPhiOn(prev => {
      const next = !prev;
      addEvent(next ? "Phi-Time ACTIVE — golden angle scheduling" : "Phi-Time DISABLED — periodic mode", next ? "#c9a84c" : "#ef4444");
      return next;
    });
  }, [addEvent]);

  const handleTwistToggle = useCallback(() => {
    setTwistOn(prev => {
      const next = !prev;
      addEvent(next ? "Helical twist ENABLED — causal protection active" : "WARNING: twist DISABLED — CTC risk elevated", next ? "#22c55e" : "#ef4444");
      return next;
    });
  }, [addEvent]);

  const handleReset = useCallback(() => {
    setWarpOn(false);
    setDomains([80, 75, 65, 90, 70]);
    setV0(3.0); setBubbleR(60); setWallSig(15);
    stateRef.current = { t: 0, frame: 0, step_n: 0, xpos: 0, warpPhase: 0, fabricIntegrity: 100, lastLog: 0 };
    addEvent("SYSTEM RESET — all parameters restored", "#c8d8e0");
  }, [addEvent]);

  const handleFocus = useCallback((i: number) => {
    setFocused(prev => prev === i ? -1 : i);
  }, []);

  // Canvas loop
  useEffect(() => {
    const warpCanvas = warpRef.current;
    const phiCanvas  = phiRef.current;
    if (!warpCanvas || !phiCanvas) return;
    const ctx  = warpCanvas.getContext("2d")!;
    const pctx = phiCanvas.getContext("2d")!;

    const resize = () => {
      const rect = warpCanvas.parentElement!.getBoundingClientRect();
      warpCanvas.width  = rect.width;
      warpCanvas.height = rect.height;
    };
    resize();
    window.addEventListener("resize", resize);

    const shapeFunc = (r: number) => {
      const bR = bubbleRLive.current, wS = wallSigLive.current;
      return 0.5 * (1 - Math.tanh((r - bR) / wS));
    };

    const rhoInfo = (r: number, n: number) => {
      const twist_mod = twistOnLive.current ? Math.cos(n * THETA * Math.PI / 180) : 1;
      return 1.0 + (domainsLive.current[0] / 100) * 0.6 * shapeFunc(r) * twist_mod;
    };

    const gradRho = (r: number, n: number) => {
      const dr = 2;
      return Math.abs((rhoInfo(r + dr, n) - rhoInfo(r - dr, n)) / (2 * dr));
    };

    const drawPhiSpiral = (step_n: number, warpActive: boolean, t: number) => {
      const pw = 200, ph = 200;
      phiCanvas.width = pw; phiCanvas.height = ph;
      pctx.fillStyle = "rgba(2,8,16,0.85)";
      pctx.fillRect(0, 0, pw, ph);
      const pcx = pw / 2, pcy = ph / 2;

      for (let r = 20; r <= 90; r += 20) {
        pctx.beginPath();
        pctx.arc(pcx, pcy, r, 0, Math.PI * 2);
        pctx.strokeStyle = "rgba(46,109,164,0.12)";
        pctx.lineWidth = 0.5;
        pctx.stroke();
      }

      const maxDots = Math.min(80 + step_n, 200);
      for (let i = 0; i < maxDots; i++) {
        const angle = i * THETA * Math.PI / 180;
        const r = 4 + i * 0.42;
        if (r > 92) break;
        const px = pcx + Math.cos(angle) * r;
        const py = pcy + Math.sin(angle) * r;
        const hue = (i * 7) % 360;
        const alpha = warpActive ? 0.8 : 0.4;
        pctx.beginPath();
        pctx.arc(px, py, 1.5 + Math.sin(t + i * 0.3) * 0.5, 0, Math.PI * 2);
        pctx.fillStyle = `hsla(${hue},80%,65%,${alpha})`;
        pctx.fill();
      }

      const curAngle = step_n * THETA * Math.PI / 180;
      const curR = Math.min(4 + step_n * 0.3, 88);
      const cpx = pcx + Math.cos(curAngle) * curR;
      const cpy = pcy + Math.sin(curAngle) * curR;
      const cg = pctx.createRadialGradient(cpx, cpy, 0, cpx, cpy, 6);
      cg.addColorStop(0, "rgba(255,255,255,1)");
      cg.addColorStop(1, "rgba(31,212,200,0)");
      pctx.beginPath();
      pctx.arc(cpx, cpy, 6, 0, Math.PI * 2);
      pctx.fillStyle = cg;
      pctx.fill();

      const dispAngle = ((step_n * THETA) % 360).toFixed(1);
      pctx.fillStyle = "rgba(201,168,76,0.8)";
      pctx.font = "9px 'Space Mono'";
      pctx.fillText(`n=${step_n}`, 4, ph - 12);
      pctx.fillText(`θ=${dispAngle}°`, 4, ph - 3);
    };

    const drawBubble = (t: number, step_n: number) => {
      const W = warpCanvas.width, H = warpCanvas.height;
      const cx = W / 2, cy = H / 2;
      const doms = domainsLive.current;
      const d1 = doms[0] / 100, d2 = doms[1] / 100, d3 = doms[2] / 100, d4 = doms[3] / 100, d5 = doms[4] / 100;
      const bR = bubbleRLive.current;
      const wS = wallSigLive.current;
      const warpActive = warpOnLive.current;
      const showDoms = domainsOnLive.current;
      const twistActive = twistOnLive.current;
      const twistAngle = step_n * THETA * Math.PI / 180;
      const vs = warpActive ? v0Live.current * Math.pow(PHI, Math.min(step_n * 0.05, 8)) : 0;
      const speedFactor = Math.min(vs / 10, 1);

      // Background
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bgGrad.addColorStop(0, "#030e20");
      bgGrad.addColorStop(0.5, "#020810");
      bgGrad.addColorStop(1, "#010406");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Grid (space fabric)
      if (showDoms) {
        const gridSpacing = 40;
        const warpStrength = warpActive ? speedFactor * 0.6 : 0;
        ctx.save();
        for (let gx = -W; gx < W * 2; gx += gridSpacing) {
          ctx.beginPath();
          for (let gy = 0; gy <= H; gy += 4) {
            const dx = gx - cx, dy = gy - cy;
            const r = Math.sqrt(dx * dx + dy * dy);
            const f = shapeFunc(r);
            const warpX = warpActive ? -f * warpStrength * 80 * (dx / (r + 1)) : 0;
            const px = gx + warpX;
            gy === 0 ? ctx.moveTo(px, gy) : ctx.lineTo(px, gy);
          }
          ctx.strokeStyle = `rgba(46,109,164,${0.06 + warpStrength * 0.04})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        for (let gy = 0; gy < H; gy += gridSpacing) {
          ctx.beginPath();
          for (let gx = 0; gx <= W; gx += 4) {
            const dx = gx - cx, dy = gy - cy;
            const r = Math.sqrt(dx * dx + dy * dy);
            const f = shapeFunc(r);
            const warpY = warpActive ? -f * warpStrength * 40 * (dy / (r + 1)) : 0;
            const py = gy + warpY;
            gx === 0 ? ctx.moveTo(gx, py) : ctx.lineTo(gx, py);
          }
          ctx.strokeStyle = `rgba(46,109,164,${0.06 + warpStrength * 0.04})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        ctx.restore();
      }

      if (!warpActive) {
        for (let i = 0; i < 5; i++) {
          const r = 60 + i * 40;
          const alpha = 0.04 + 0.02 * Math.sin(t * 0.5 + i);
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 0.35, twistAngle, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(46,109,164,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        return;
      }

      // Space contraction ahead
      const contrGrad = ctx.createRadialGradient(cx - bR * 1.5, cy, 0, cx - bR * 1.5, cy, bR * 1.2);
      contrGrad.addColorStop(0, `rgba(0,0,0,${0.7 * speedFactor})`);
      contrGrad.addColorStop(0.5, `rgba(100,50,200,${0.12 * speedFactor})`);
      contrGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = contrGrad;
      ctx.beginPath();
      ctx.ellipse(cx - bR * 1.5, cy, bR * 1.3, bR * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Space expansion behind
      const expGrad = ctx.createRadialGradient(cx + bR * 1.5, cy, 0, cx + bR * 1.5, cy, bR * 1.6);
      expGrad.addColorStop(0, `rgba(201,168,76,${0.08 * speedFactor})`);
      expGrad.addColorStop(0.4, `rgba(31,212,200,${0.05 * speedFactor})`);
      expGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = expGrad;
      ctx.beginPath();
      ctx.ellipse(cx + bR * 1.5, cy, bR * 1.6, bR * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bubble wall (Phi-twisted rings)
      const numRings = 7;
      for (let i = 0; i < numRings; i++) {
        const frac = i / (numRings - 1);
        const r_ring = bR * (0.7 + frac * 0.6);
        const wallAlpha = Math.exp(-Math.pow((r_ring - bR) / wS, 2)) * 0.8;
        if (wallAlpha < 0.02) continue;
        const ringTwist = twistActive ? twistAngle + i * 0.3 : twistAngle;
        const pts = 120;
        ctx.beginPath();
        for (let j = 0; j <= pts; j++) {
          const ang = (j / pts) * Math.PI * 2;
          const rx = r_ring, ry = r_ring * (0.3 + 0.1 * speedFactor);
          const px = cx + Math.cos(ang) * rx;
          const py = cy + Math.sin(ang) * ry;
          const twistedX = cx + (px - cx) * Math.cos(ringTwist * frac * 0.2) - (py - cy) * Math.sin(ringTwist * frac * 0.1);
          const twistedY = cy + (px - cx) * Math.sin(ringTwist * frac * 0.1) + (py - cy) * Math.cos(ringTwist * frac * 0.2);
          j === 0 ? ctx.moveTo(twistedX, twistedY) : ctx.lineTo(twistedX, twistedY);
        }
        const wallColor = frac < 0.5
          ? `rgba(31,212,200,${wallAlpha * d1})`
          : `rgba(201,168,76,${wallAlpha * d1})`;
        ctx.strokeStyle = wallColor;
        ctx.lineWidth = 1 + wallAlpha;
        ctx.stroke();
      }

      // Bubble interior
      const intGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, bR * 0.85);
      intGrad.addColorStop(0, `rgba(20,40,80,${0.4 * speedFactor})`);
      intGrad.addColorStop(0.7, `rgba(10,22,50,${0.2 * speedFactor})`);
      intGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = intGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, bR * 0.85, bR * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();

      // Ship indicator
      ctx.beginPath();
      ctx.arc(cx, cy, 8, 0, Math.PI * 2);
      const shipGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 8);
      shipGrad.addColorStop(0, "rgba(255,255,255,0.9)");
      shipGrad.addColorStop(0.5, "rgba(74,159,212,0.6)");
      shipGrad.addColorStop(1, "rgba(74,159,212,0)");
      ctx.fillStyle = shipGrad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = "#fff";
      ctx.fill();

      // Domain visualizations
      if (showDoms) {
        // D1: exotic matter at bubble wall
        const numP = Math.floor(d1 * 24);
        for (let i = 0; i < numP; i++) {
          const ang = (i / numP) * Math.PI * 2 + t * 0.3;
          const r_p = bR + (Math.random() - 0.5) * wS * 2;
          const px = cx + Math.cos(ang) * r_p;
          const py = cy + Math.sin(ang) * r_p * (0.3 + 0.1 * speedFactor);
          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(31,212,200,${0.4 + 0.4 * Math.sin(t * 2 + i)})`;
          ctx.fill();
        }

        // D2: oscillatory twist lines
        for (let i = 0; i < 8; i++) {
          const ang0 = (i / 8) * Math.PI * 2 + t * 0.15;
          const twistOffset = twistActive ? i * THETA * Math.PI / 180 : 0;
          const r1 = bR * 0.6, r2 = bR * 1.4;
          const p1x = cx + Math.cos(ang0 + twistOffset) * r1;
          const p1y = cy + Math.sin(ang0 + twistOffset) * r1 * 0.32;
          const p2x = cx + Math.cos(ang0 + twistOffset + 0.4) * r2;
          const p2y = cy + Math.sin(ang0 + twistOffset + 0.4) * r2 * 0.32;
          ctx.beginPath();
          ctx.moveTo(p1x, p1y);
          ctx.lineTo(p2x, p2y);
          ctx.strokeStyle = `rgba(201,168,76,${0.15 * d2})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }

        // D3: destination lock beam (forward)
        const beamGrad = ctx.createLinearGradient(cx, cy, cx - W * 0.45, cy);
        beamGrad.addColorStop(0, `rgba(139,92,246,${0.3 * d3})`);
        beamGrad.addColorStop(1, "rgba(139,92,246,0)");
        ctx.beginPath();
        ctx.moveTo(cx - bR, cy - 8); ctx.lineTo(cx - W * 0.45, cy - 20);
        ctx.lineTo(cx - W * 0.45, cy + 20); ctx.lineTo(cx - bR, cy + 8);
        ctx.fillStyle = beamGrad;
        ctx.fill();

        // D4: consciousness aura
        for (let ring = 0; ring < 4; ring++) {
          const rr = 14 + ring * 8 + 4 * Math.sin(t * 0.8 + ring * PHI);
          ctx.beginPath();
          ctx.arc(cx, cy, rr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(236,72,153,${0.08 * d4 * (4 - ring) / 4})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // D5: repair particles in wake
        const numRepair = Math.floor(d5 * 16);
        for (let i = 0; i < numRepair; i++) {
          const repX = cx + bR * 1.2 + Math.random() * W * 0.3;
          const repY = cy + (Math.random() - 0.5) * 80;
          ctx.beginPath();
          ctx.arc(repX, repY, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34,197,94,${0.15 + 0.2 * Math.sin(t * 3 + i)})`;
          ctx.fill();
        }
      }

      // Phi-twist indicator lines
      if (twistActive) {
        const numLines = 12;
        for (let i = 0; i < numLines; i++) {
          const ang = i * THETA * Math.PI / 180 + t * 0.05;
          const ir = bR * 0.3, or2 = bR * 1.2;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * ir, cy + Math.sin(ang) * ir * 0.32);
          ctx.lineTo(cx + Math.cos(ang) * or2, cy + Math.sin(ang) * or2 * 0.32);
          ctx.strokeStyle = `rgba(74,159,212,${0.08 + 0.06 * Math.sin(t + i)})`;
          ctx.lineWidth = 0.6;
          ctx.setLineDash([3, 6]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      // Wake trail
      const trailGrad = ctx.createLinearGradient(cx + bR, cy, cx + W * 0.5, cy);
      trailGrad.addColorStop(0, `rgba(201,168,76,${0.15 * speedFactor})`);
      trailGrad.addColorStop(0.3, `rgba(31,212,200,${0.06 * speedFactor})`);
      trailGrad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.ellipse(cx + bR * 1.3, cy, W * 0.3, bR * 0.25, 0, 0, Math.PI * 2);
      ctx.fillStyle = trailGrad;
      ctx.fill();
    };

    const EVENTS_POOL: [string, string][] = [
      ["D2: twist rate adjusted → Θ_n updated", "#c9a84c"],
      ["D1: exotic matter distributed irrationally", "#1fd4c8"],
      ["D5: fabric repair active — micro-tears sealed", "#22c55e"],
      ["D4: passenger phase-lock maintained", "#ec4899"],
      ["D3: ring-field attractor locked at 500D coords", "#8b5cf6"],
      ["C_total minimized — all domains coherent", "#c8d8e0"],
    ];

    const loop = () => {
      const s = stateRef.current;
      ctx.clearRect(0, 0, warpCanvas.width, warpCanvas.height);
      drawBubble(s.t, s.step_n);
      drawPhiSpiral(s.step_n, warpOnLive.current, s.t);

      const doms = domainsLive.current;
      const warpActive = warpOnLive.current;
      const bR = bubbleRLive.current;
      const v0cur = v0Live.current;
      const twistActive = twistOnLive.current;

      const vs = warpActive ? v0cur * Math.pow(PHI, Math.min(s.step_n * 0.05, 8)) : 0;
      const twistDeg = ((s.step_n * THETA) % 360).toFixed(1);
      const ctotal = doms.reduce((a, d, i) => a + [0.25, 0.2, 0.2, 0.2, 0.15][i] * (d / 100), 0);
      const rhoVal = 1 + (warpActive ? 0.3 * (doms[0] / 100) : 0);
      const exoticVal = warpActive ? 0.4 * (doms[0] / 100) * Math.abs(Math.cos(s.step_n * THETA * Math.PI / 180)) : 0;
      const gradVal = warpActive ? Math.abs(gradRho(bR, s.step_n)) : 0;
      s.fabricIntegrity = Math.max(60, Math.min(100, s.fabricIntegrity + (doms[4] / 100) * 0.5 - (warpActive ? 0.2 : 0)));

      if (s.frame % 10 === 0) {
        setReadouts({
          vs: vs.toFixed(3) + "c", twist: twistDeg + "°", phi: "φ=1.6180",
          ctotal: ctotal.toFixed(3), n: s.step_n, xpos: s.xpos.toFixed(2),
          rho: rhoVal.toFixed(3), exotic: (-exoticVal).toFixed(3), grad: gradVal.toFixed(3),
          causal: twistActive ? "SAFE" : "RISK", fabric: s.fabricIntegrity.toFixed(0) + "%",
          phase: ((s.step_n * THETA) % 360).toFixed(1) + "°",
        });
        setDomStats([...doms]);
        setFrameN(s.frame);
      }

      if (warpActive && s.frame - s.lastLog > 40) {
        s.lastLog = s.frame;
        const ev = EVENTS_POOL[Math.floor(Math.random() * EVENTS_POOL.length)];
        setEvents(prev => [{ n: s.step_n, msg: ev[0], col: ev[1] }, ...prev].slice(0, 28));
      }

      if (warpActive) {
        const phiStep = phiOnLive.current ? 1 / PHI : 1;
        s.xpos += vs * 0.01 * phiStep;
        if (s.frame % 8 === 0) s.step_n++;
      }

      s.t += 0.016;
      s.frame++;
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []); // eslint-disable-line

  const BtnStyle = (on: boolean, col = "#1fd4c8") => ({
    fontFamily: MONO, fontSize: 10, padding: "6px 14px", borderRadius: 5, cursor: "pointer",
    letterSpacing: 1, transition: "all 0.2s", border: `1px solid ${on ? col : col + "40"}`,
    background: on ? `${col}20` : "transparent", color: on ? col : col + "80",
  });

  return (
    <div style={{
      background: BG, minHeight: "100vh", display: "flex", flexDirection: "column",
      fontFamily: MONO, color: "#c8d8e0", overflow: "hidden",
    }}>
      <div style={{flexShrink:0,padding:"8px 12px 0"}}>
        <div style={{display:"inline-block",border:"1px solid #44aaff",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#44aaff",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #44aaff",borderRadius:4,overflow:"hidden",marginBottom:8}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#44aaff",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>WARP BUBBLE ENGINE · ALCUBIERRE METRIC · SPACE COMPRESSION · EXOTIC MATTER · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(68,170,255,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>Alcubierre bubble: compressed front + expanded rear — the live AETHER warp bubble simulation.</p></div>
          <WarpBubbleEngineHeaderCanvas />
        </div>
      </div>
      {/* Top bar */}
      <div style={{
        background: PANEL_BG, borderBottom: `1px solid ${BORDER}`,
        padding: "8px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <span style={{ color: "#1fd4c8", fontSize: 11, letterSpacing: 2, marginRight: 8 }}>
          ⚡ TWISTED ZIPPER SPACETIME DRIVE
        </span>
        <button onClick={handleWarpToggle} style={BtnStyle(warpOn, "#1fd4c8")}>
          {warpOn ? "⚡ DISENGAGE" : "⚡ ENGAGE WARP"}
        </button>
        <button onClick={handlePhiToggle} style={BtnStyle(phiOn, "#c9a84c")}>Φ-TIME</button>
        <button onClick={handleTwistToggle} style={BtnStyle(twistOn, "#22c55e")}>TWIST</button>
        <button onClick={() => setDomainsOn(p => !p)} style={BtnStyle(domainsOn, "#8b5cf6")}>DOMAINS</button>
        <button onClick={handleReset} style={{ ...BtnStyle(false, "#ef4444"), marginLeft: "auto" }}>RESET</button>
        <span style={{ fontSize: 9, color: "#2e6d70" }}>FRAME {frameN}</span>
      </div>

      {/* Status equation bar */}
      <div style={{
        background: "#010d18", borderBottom: `1px solid ${BORDER}`,
        padding: "6px 20px",
        fontSize: 10, color: "#c9a84c", letterSpacing: 1, textAlign: "center",
      }}>
        ds² = −dt² + [dx − v₀·φⁿ·f(r)·e^(in·222.5°)·dt]² + dy² + dz²
        {warpOn
          ? "   ·   ⚡ TWISTED ZIPPER ACTIVE — Φ-MODULATED WARP BUBBLE ONLINE"
          : "   ·   DRIVE STANDBY — ENGAGE WARP TO ACTIVATE"}
      </div>

      {/* Main 3-panel */}
      <div style={{ flex: 1, display: "flex", minHeight: 0, overflow: "hidden" }}>

        {/* LEFT: domain controls */}
        <div style={{
          width: 220, flexShrink: 0,
          background: PANEL_BG, borderRight: `1px solid ${BORDER}`,
          overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 8,
        }}>
          <div style={{ fontSize: 9, color: "#2e6d70", letterSpacing: 2, marginBottom: 2 }}>5-DOMAIN EVENT BUS</div>
          {D_COLORS.map((_, i) => (
            <DomainSlider key={i} idx={i} value={domains[i]}
              focused={focused === i}
              onChange={(ii, v) => setDomains(prev => { const a = [...prev]; a[ii] = v; return a; })}
              onFocus={handleFocus}
            />
          ))}

          <div style={{ fontSize: 9, color: "#2e6d70", letterSpacing: 2, marginTop: 6, marginBottom: 2 }}>WARP PARAMETERS</div>
          {[
            { label: "v₀ base", min: 1, max: 10, step: 0.1, value: v0, onChange: setV0, fmt: (v: number) => v.toFixed(1) },
            { label: "bubble R", min: 20, max: 120, step: 1, value: bubbleR, onChange: setBubbleR, fmt: (v: number) => String(v) },
            { label: "σ wall", min: 5, max: 40, step: 1, value: wallSig, onChange: setWallSig, fmt: (v: number) => String(v) },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, color: "#2e6d70", width: 52 }}>{s.label}</span>
              <input
                type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                style={{ flex: 1, accentColor: "#1fd4c8", height: 3 }}
                onInput={e => s.onChange(parseFloat((e.target as HTMLInputElement).value) as never)}
              />
              <span style={{ fontSize: 9, color: "#c8d8e0", width: 26, textAlign: "right" }}>
                {s.fmt(s.value as number)}
              </span>
            </div>
          ))}
        </div>

        {/* CENTER: canvas */}
        <div style={{ flex: 1, position: "relative", minWidth: 0, background: BG }}>
          <canvas ref={warpRef} style={{ display: "block", width: "100%", height: "100%" }} />
        </div>

        {/* RIGHT: readouts + phi spiral + event log */}
        <div style={{
          width: 220, flexShrink: 0,
          background: PANEL_BG, borderLeft: `1px solid ${BORDER}`,
          overflowY: "auto", padding: 10, display: "flex", flexDirection: "column", gap: 10,
        }}>
          <div style={{ fontSize: 9, color: "#2e6d70", letterSpacing: 2 }}>FIELD READOUTS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
            {([
              ["ρ_info",    readouts.rho,    "#c8d8e0"],
              ["ρ_exotic",  readouts.exotic,  "#ef4444"],
              ["∇ρ peak",   readouts.grad,   "#c9a84c"],
              ["Causal",    readouts.causal, readouts.causal === "SAFE" ? "#22c55e" : "#ef4444"],
              ["Fabric",    readouts.fabric, "#1fd4c8"],
              ["Obs Phase", readouts.phase,  "#ec4899"],
            ] as [string, string, string][]).map(([lbl, val, col]) => (
              <div key={lbl} style={{
                background: "#020d18", borderRadius: 5, padding: "6px 8px", textAlign: "center",
                border: `1px solid #0d2030`,
              }}>
                <div style={{ fontSize: 11, fontWeight: "bold", color: col }}>{val}</div>
                <div style={{ fontSize: 9, color: "#2e6d70", marginTop: 2 }}>{lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {([
              ["v_s", readouts.vs], ["Θ_twist", readouts.twist],
              ["n", String(readouts.n)], ["x_pos", readouts.xpos],
              ["C_total", readouts.ctotal],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 10 }}>
                <span style={{ color: "#2e6d70" }}>{k}</span>
                <span style={{ color: "#c9a84c" }}>{v}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 9, color: "#2e6d70", letterSpacing: 2 }}>DOMAIN STATUS</div>
          {D_COLORS.map((col, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9, color: col, width: 16 }}>D{i + 1}</span>
              <div style={{ flex: 1, background: "#020d18", height: 4, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${domStats[i]}%`, height: "100%", background: col, transition: "width 0.2s" }} />
              </div>
              <span style={{ fontSize: 9, color: col, width: 22, textAlign: "right" }}>{domStats[i]}</span>
            </div>
          ))}

          <div style={{ fontSize: 9, color: "#2e6d70", letterSpacing: 2 }}>Φ-SPIRAL PHASE MAP</div>
          <div>
            <div style={{ fontSize: 9, color: "#c9a84c", marginBottom: 4, textAlign: "center" }}>
              GOLDEN ANGLE · 222.5°
            </div>
            <canvas ref={phiRef} width={200} height={200}
              style={{ width: "100%", display: "block", borderRadius: 5, border: `1px solid #0d2030` }}
            />
          </div>

          <div style={{ fontSize: 9, color: "#2e6d70", letterSpacing: 2 }}>EVENT LOG</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {events.map((ev, i) => (
              <div key={i} style={{
                fontSize: 9, color: ev.col || "#c8d8e0",
                borderBottom: `1px solid #0d2030`, paddingBottom: 3, lineHeight: 1.5,
              }}>
                <span style={{ color: "#2e6d70" }}>n={String(ev.n).padStart(4, "0")} </span>
                {ev.msg}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom ticker */}
      <div style={{
        background: PANEL_BG, borderTop: `1px solid ${BORDER}`,
        padding: "6px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: 9,
      }}>
        <div style={{ display: "flex", gap: 14 }}>
          {D_COLORS.map((col, i) => (
            <span key={i} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: col }} />
              <span style={{ color: "#4a7a8a" }}>D{i + 1}</span>
              <span style={{ color: "#c8d8e0", marginLeft: 2 }}>{domStats[i]}</span>
            </span>
          ))}
        </div>
        <span style={{ color: "#1fd4c8" }}>TWISTED ZIPPER SPACETIME DRIVE · Φ-COHERENCE · SHIA MILLER @StrategicProce 2026</span>
        <span style={{ color: "#2e6d70" }}>FRAME {frameN}</span>
      </div>
    </div>
  );
}

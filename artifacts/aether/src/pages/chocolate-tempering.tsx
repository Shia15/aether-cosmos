import { useEffect, useRef, useState } from "react";

/* ── palette ────────────────────────────────────────── */
const BG         = "#080402";
const CHOC_DARK  = "#1e0c04";
const CHOC_MID   = "#3a1608";
const CHOC_LIGHT = "#5a2510";
const FORM_V     = "#c9a84c";  // gold — ideal Form V, tempered
const FORM_IV    = "#8b5a24";  // amber-brown — unstable Form IV
const FORM_III   = "#6b3e18";  // dark brown — Form III
const FORM_BLOOM = "#cbb89a";  // cream — fat bloom
const TEAL       = "#2ef0d8";
const ROSE       = "#ff4477";
const GOLD       = "#e6b85c";
const mono       = "'Space Mono', monospace";
const serif      = "'Cinzel', serif";

/* ── crystal form physics ───────────────────────────── */
interface CrystalForm { id: 1|2|3|4|5|6; name: string; melt: number; col: string; stable: boolean }
const FORMS: CrystalForm[] = [
  { id:1, name:"Form I",   melt:17.3, col:"#3a2010", stable:false },
  { id:2, name:"Form II",  melt:23.3, col:"#4a2814", stable:false },
  { id:3, name:"Form III", melt:25.5, col:FORM_III,  stable:false },
  { id:4, name:"Form IV",  melt:27.3, col:FORM_IV,   stable:false },
  { id:5, name:"Form V",   melt:33.8, col:FORM_V,    stable:true  },
  { id:6, name:"Form VI",  melt:36.3, col:"#a88030",  stable:true  },
];

function stableFormAtTemp(T: number): CrystalForm {
  if (T > 36.3) return FORMS[4]; // above all melts → still seed V
  if (T > 33.8) return FORMS[5]; // Form VI territory
  if (T > 27.3) return FORMS[4]; // Form V ideal
  if (T > 25.5) return FORMS[3]; // Form IV
  if (T > 23.3) return FORMS[2]; // Form III
  if (T > 17.3) return FORMS[1]; // Form II
  return FORMS[0];                // Form I
}

/* ── crystal domain ─────────────────────────────────── */
interface Crystal {
  x: number; y: number;
  angle: number; targetAngle: number;
  size: number; maxSize: number;
  coherence: number;
  form: CrystalForm;
  age: number; dip: boolean;
}

const AXIS_ANGLE = Math.PI / 5; // Form V preferred binding axis ~36°

function makeCrystalGrid(side: "tempered"|"untempered", W: number, H: number): Crystal[] {
  const cols = 14, rows = 10;
  const crystals: Crystal[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const jitter = 0.6;
      const bx = (W / cols) * (col + 0.5) + (Math.random()-0.5)*jitter*(W/cols);
      const by = (H / rows) * (row + 0.5) + (Math.random()-0.5)*jitter*(H/rows);
      const targetAngle = side === "tempered"
        ? AXIS_ANGLE + (Math.random()-0.5)*0.18        // near binding axis
        : Math.random() * Math.PI;                      // random → disorder
      crystals.push({
        x: bx, y: by,
        angle: targetAngle + (Math.random()-0.5)*(side==="tempered"?0.5:Math.PI),
        targetAngle,
        size: 2 + Math.random()*3,
        maxSize: 14 + Math.random()*8,
        coherence: side === "tempered" ? 0.55+Math.random()*0.2 : 0.1+Math.random()*0.2,
        form: FORMS[4],
        age: Math.random()*60,
        dip: false,
      });
    }
  }
  return crystals;
}

/* ── DP coherence update ─────────────────────────────── */
function updateDP(crystals: Crystal[], side: "tempered"|"untempered",
                  T: number, dt: number) {
  const form = stableFormAtTemp(T);
  const isLiquid = T > 34.5;
  const growthRate = isLiquid ? 0 : Math.max(0, 1 - T/34.5) * 0.3;

  crystals.forEach((c, i) => {
    // Form transition
    c.form = form;

    // Crystal growth / dissolution
    if (isLiquid) {
      c.size = Math.max(0, c.size - 0.4);
      c.coherence = Math.max(0.05, c.coherence - 0.02);
    } else {
      c.size = Math.min(c.maxSize * (T < 30 ? 1.3 : 1), c.size + growthRate * (1+c.coherence));
      c.age++;
    }

    // Neighbour coupling for angle
    let wSum = 0, sinSum = 0, cosSum = 0;
    crystals.forEach((n, j) => {
      if (i === j) return;
      const dx = n.x - c.x, dy = n.y - c.y;
      const d2 = dx*dx + dy*dy;
      if (d2 > 90*90) return;
      const w = 1 / (d2 + 1);
      sinSum += Math.sin(n.angle)*w; cosSum += Math.cos(n.angle)*w; wSum += w;
    });
    const nbrAngle = wSum > 0 ? Math.atan2(sinSum/wSum, cosSum/wSum) : c.angle;

    // DP update
    if (side === "tempered") {
      // Pull toward binding axis AND neighbours
      const pullAxis = AXIS_ANGLE;
      let dAxis = pullAxis - c.angle;
      while (dAxis >  Math.PI/2) dAxis -= Math.PI;
      while (dAxis < -Math.PI/2) dAxis += Math.PI;
      let dNbr = nbrAngle - c.angle;
      while (dNbr >  Math.PI/2) dNbr -= Math.PI;
      while (dNbr < -Math.PI/2) dNbr += Math.PI;
      c.angle += (dAxis*0.06 + dNbr*0.04) * (isLiquid?0:1) + (Math.random()-0.5)*0.008;
      c.coherence = Math.min(0.96, c.coherence + 0.004 * (isLiquid?-3:1) - Math.random()*0.002);
    } else {
      // Drift with weak neighbour coupling only
      let dNbr = nbrAngle - c.angle;
      while (dNbr >  Math.PI/2) dNbr -= Math.PI;
      while (dNbr < -Math.PI/2) dNbr += Math.PI;
      c.angle += dNbr*0.012 + (Math.random()-0.5)*0.045;
      c.coherence = Math.max(0.04, c.coherence - 0.002 + Math.random()*0.003);
    }
  });
}

/* ════════════════════════════════════════════════════
   PAGE
════════════════════════════════════════════════════ */
export default function ChocolateTemperingPage() {
  const rootRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef(0);
  const sizeRef   = useRef({ W: 1000, H: 600 });

  const [temp,     setTemp]     = useState(32.0);
  const [speed,    setSpeed]    = useState(1.0);
  const [dipAnim,  setDipAnim]  = useState(true);

  const parRef = useRef({ temp, speed, dipAnim });
  parRef.current = { temp, speed, dipAnim };

  useEffect(() => {
    const cv   = canvasRef.current;
    const root = rootRef.current;
    if (!cv || !root) return;
    const ctx = cv.getContext("2d")!;

    // Build both crystal grids
    let temperedCrystals: Crystal[]   = [];
    let untemperedCrystals: Crystal[] = [];

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const W = root.clientWidth, H = root.clientHeight;
      cv.width = W*dpr; cv.height = H*dpr;
      cv.style.width = W+"px"; cv.style.height = H+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      sizeRef.current = { W, H };
      const HW = W/2 - 18;
      const CH = H - 44;
      temperedCrystals   = makeCrystalGrid("tempered",   HW, CH);
      untemperedCrystals = makeCrystalGrid("untempered", HW, CH);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(root);

    let frame = 0;
    let dipY = -80;        // bonbon y position (relative to choc surface)
    let dipPhase = "enter"; // enter → coat → lift → reset
    let dipTimer = 0;

    function drawChocolateBG(cx: number, cy: number, W: number, H: number, T: number) {
      // Gradient from top (lighter) to bottom (darker)
      const viscosity = Math.max(0, Math.min(1, (T - 26) / 9));
      const g = ctx.createLinearGradient(cx, cy, cx, cy+H);
      const alpha = 0.85 + viscosity*0.1;
      g.addColorStop(0, `rgba(${lerp(30,58,viscosity)},${lerp(12,22,viscosity)},${lerp(4,8,viscosity)},${alpha})`);
      g.addColorStop(0.5, `rgba(30,12,4,${alpha})`);
      g.addColorStop(1, `rgba(18,8,2,${alpha*0.9})`);
      ctx.fillStyle = g; ctx.fillRect(cx, cy, W, H);

      // Liquid sheen at top (when hot)
      if (viscosity > 0.4) {
        const sheenH = 12 + viscosity*18;
        const sg = ctx.createLinearGradient(cx, cy, cx, cy+sheenH);
        sg.addColorStop(0, `rgba(120,70,30,${viscosity*0.25})`);
        sg.addColorStop(1, `rgba(120,70,30,0)`);
        ctx.fillStyle = sg; ctx.fillRect(cx, cy, W, sheenH);
      }
    }

    function lerp(a: number, b: number, t: number) { return a + (b-a)*t; }

    function drawCrystal(c: Crystal, ox: number, oy: number, T: number, side: "tempered"|"untempered") {
      if (c.size < 0.5) return;
      const x = ox + c.x, y = oy + c.y;
      const col = c.size < 1 ? CHOC_MID : c.form.col;
      const alpha = Math.min(0.9, 0.25 + c.coherence*0.65) * Math.min(1, c.size/4);

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(c.angle);

      // Crystal body (elongated along axis)
      const rX = c.size * 0.38, rY = c.size * 1.0;
      ctx.beginPath(); ctx.ellipse(0, 0, rX, rY, 0, 0, Math.PI*2);
      ctx.fillStyle = col.replace("#","rgba(") + "," + alpha + ")"; // hacky but works
      // Use proper rgba instead:
      const rgb = hexToRgb(col);
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
      ctx.fill();

      // Axis line (binding axis indicator)
      if (side === "tempered" && c.coherence > 0.55) {
        ctx.strokeStyle = `rgba(201,168,76,${(c.coherence-0.55)*0.5})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0,-rY); ctx.lineTo(0,rY); ctx.stroke();
      }

      // Bloom highlight on untempered cold crystals
      if (side === "untempered" && T < 24 && c.size > 8) {
        ctx.beginPath(); ctx.ellipse(0, -rY*0.3, rX*0.6, rY*0.15, 0, 0, Math.PI*2);
        const br = hexToRgb(FORM_BLOOM);
        ctx.fillStyle = `rgba(${br[0]},${br[1]},${br[2]},${0.25*c.size/12})`;
        ctx.fill();
      }
      ctx.restore();
    }

    function hexToRgb(hex: string): [number,number,number] {
      const r = parseInt(hex.slice(1,3),16);
      const g = parseInt(hex.slice(3,5),16);
      const b = parseInt(hex.slice(5,7),16);
      return [r,g,b];
    }

    function drawBonbon(cx: number, cy: number, y: number, coated: number,
                        side: "tempered"|"untempered", T: number) {
      // bonbon oval shape
      const bW = 38, bH = 26;
      ctx.save();
      ctx.translate(cx, cy + y);

      // Chocolate coating (grows as dip progresses)
      if (coated > 0) {
        const coatThick = coated * 5;
        const coatCol = side === "tempered" ? FORM_V : FORM_IV;
        const rgb = hexToRgb(coatCol);
        ctx.beginPath(); ctx.ellipse(0,0,bW+coatThick,bH+coatThick,0,0,Math.PI*2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${coated*0.9})`; ctx.fill();

        // Bloom on untempered coating when room temp
        if (side === "untempered" && T < 23) {
          ctx.beginPath(); ctx.ellipse(0,-bH*0.3,bW*0.7,bH*0.2,0,0,Math.PI*2);
          const br = hexToRgb(FORM_BLOOM);
          ctx.fillStyle = `rgba(${br[0]},${br[1]},${br[2]},${Math.min(1,(23-T)/5)*0.6})`;
          ctx.fill();
        }
        // Gloss on tempered coating
        if (side === "tempered" && coated > 0.7) {
          ctx.beginPath(); ctx.ellipse(-bW*0.25,-bH*0.3,bW*0.15,bH*0.12,-0.3,0,Math.PI*2);
          ctx.fillStyle = `rgba(255,240,200,${coated*0.35})`; ctx.fill();
        }
      }

      // Bonbon core
      ctx.beginPath(); ctx.ellipse(0,0,bW,bH,0,0,Math.PI*2);
      ctx.fillStyle="#2a1008"; ctx.fill();
      ctx.strokeStyle="#4a2010"; ctx.lineWidth=1; ctx.stroke();

      // Holding wire
      ctx.beginPath(); ctx.moveTo(0,-bH-2); ctx.lineTo(0,-bH-28);
      ctx.strokeStyle="rgba(150,120,80,0.5)"; ctx.lineWidth=1.2; ctx.stroke();

      ctx.restore();
    }

    function drawCoherenceBar(cx: number, cy: number, W: number, coh: number, label: string, col: string) {
      ctx.fillStyle = "rgba(0,0,0,0.3)"; ctx.fillRect(cx, cy, W, 6);
      const rgb = hexToRgb(col);
      ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.75)`;
      ctx.fillRect(cx, cy, W*coh, 6);
      ctx.font = `5.5px ${mono}`; ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.5)`;
      ctx.textAlign = "left"; ctx.fillText(`${label} ${Math.round(coh*100)}%`, cx, cy-4);
    }

    function avgCoherence(crystals: Crystal[]) {
      return crystals.reduce((s,c)=>s+c.coherence,0)/crystals.length;
    }

    function draw() {
      frame++;
      const { temp: T, speed: sp, dipAnim: da } = parRef.current;
      const { W, H } = sizeRef.current;

      // Update DP (sp times per frame for speed)
      const iters = Math.round(sp);
      for (let k=0; k<iters; k++) {
        updateDP(temperedCrystals,   "tempered",   T, 1);
        updateDP(untemperedCrystals, "untempered", T, 1);
      }

      // Dip animation
      const surfaceY = 68;
      if (da) {
        dipTimer++;
        if (dipPhase === "enter") {
          dipY = Math.min(surfaceY + 20, dipY + 1.2);
          if (dipY >= surfaceY + 20) { dipPhase="coat"; dipTimer=0; }
        } else if (dipPhase === "coat") {
          if (dipTimer > 60) { dipPhase="lift"; dipTimer=0; }
        } else if (dipPhase === "lift") {
          dipY -= 1.4;
          if (dipY < -80) { dipPhase="reset"; dipTimer=0; }
        } else {
          dipY = -80; dipPhase="enter"; dipTimer=0;
        }
      }

      // Clear
      ctx.fillStyle = BG; ctx.fillRect(0,0,W,H);

      const PAD    = 14;
      const DIVW   = 4;
      const HW     = (W - 2*PAD - DIVW) / 2;
      const CH     = H - 80;
      const LEFT_X = PAD;
      const RIGHT_X= PAD + HW + DIVW;

      // ─── LEFT: TEMPERED ──────────────────────────────
      ctx.save(); ctx.beginPath(); ctx.rect(LEFT_X, 0, HW, CH+24); ctx.clip();
      drawChocolateBG(LEFT_X, 0, HW, CH, T);

      // Binding axis guide line
      if (T < 34) {
        const axGrad = ctx.createLinearGradient(
          LEFT_X + HW/2 - Math.cos(AXIS_ANGLE)*CH*0.5,
          CH*0.1,
          LEFT_X + HW/2 + Math.cos(AXIS_ANGLE)*CH*0.5,
          CH*0.9
        );
        axGrad.addColorStop(0,"rgba(201,168,76,0)");
        axGrad.addColorStop(0.5,`rgba(201,168,76,${0.05+avgCoherence(temperedCrystals)*0.08})`);
        axGrad.addColorStop(1,"rgba(201,168,76,0)");
        ctx.strokeStyle = axGrad; ctx.lineWidth=1.2; ctx.setLineDash([4,8]);
        ctx.beginPath();
        ctx.moveTo(LEFT_X+HW/2-Math.cos(AXIS_ANGLE)*CH*0.5, CH*0.05);
        ctx.lineTo(LEFT_X+HW/2+Math.cos(AXIS_ANGLE)*CH*0.5, CH*0.95);
        ctx.stroke(); ctx.setLineDash([]);
      }

      // Crystals (draw smaller ones first)
      const sortedT = [...temperedCrystals].sort((a,b)=>a.size-b.size);
      sortedT.forEach(c => drawCrystal(c, LEFT_X, 0, T, "tempered"));

      // Surface line
      const tCoherence = avgCoherence(temperedCrystals);
      ctx.fillStyle=`rgba(${lerp(40,90,tCoherence)},${lerp(18,45,tCoherence)},${lerp(6,12,tCoherence)},0.55)`;
      ctx.fillRect(LEFT_X, surfaceY-4, HW, 4);

      // Bonbon dip
      if (da) {
        const coated = dipPhase==="coat"||dipPhase==="lift" ? Math.min(1,(dipTimer)/40+0.3) : 0;
        drawBonbon(LEFT_X + HW/2, surfaceY, dipY - surfaceY, coated, "tempered", T);
      }

      ctx.restore();

      // ─── RIGHT: UNTEMPERED ──────────────────────────
      ctx.save(); ctx.beginPath(); ctx.rect(RIGHT_X, 0, HW, CH+24); ctx.clip();
      drawChocolateBG(RIGHT_X, 0, HW, CH, T);

      const sortedU = [...untemperedCrystals].sort((a,b)=>a.size-b.size);
      sortedU.forEach(c => drawCrystal(c, RIGHT_X, 0, T, "untempered"));

      // Bloom streaks on surface (untempered cold)
      if (T < 24) {
        const bloomAmt = Math.max(0,(24-T)/4);
        for (let bi=0; bi<8; bi++) {
          const bx = RIGHT_X + (bi+0.5)*HW/8 + Math.sin(frame*0.02+bi)*3;
          const bAlpha = bloomAmt * (0.08+Math.random()*0.04);
          ctx.fillStyle=`rgba(200,180,155,${bAlpha})`;
          ctx.fillRect(bx, 2, HW/14, 12+Math.random()*8);
        }
      }

      // Surface
      const uCoherence = avgCoherence(untemperedCrystals);
      ctx.fillStyle=`rgba(${lerp(35,60,uCoherence)},${lerp(14,22,uCoherence)},${lerp(4,8,uCoherence)},0.55)`;
      ctx.fillRect(RIGHT_X, surfaceY-4, HW, 4);

      // Bonbon dip (offset timer)
      if (da) {
        const coated2 = dipPhase==="coat"||dipPhase==="lift" ? Math.min(1,(dipTimer)/40+0.3) : 0;
        drawBonbon(RIGHT_X + HW/2, surfaceY, dipY - surfaceY, coated2, "untempered", T);
      }
      ctx.restore();

      // ─── CENTER DIVIDER ──────────────────────────────
      const divX = PAD + HW;
      const divG = ctx.createLinearGradient(0, 0, 0, CH);
      divG.addColorStop(0,"rgba(201,168,76,0)");
      divG.addColorStop(0.15,"rgba(201,168,76,0.25)");
      divG.addColorStop(0.5,"rgba(201,168,76,0.35)");
      divG.addColorStop(0.85,"rgba(201,168,76,0.25)");
      divG.addColorStop(1,"rgba(201,168,76,0)");
      ctx.fillStyle = divG; ctx.fillRect(divX, 0, DIVW, CH);

      // Coherence differential arrow
      const diff = tCoherence - uCoherence;
      const arrY = CH/2;
      const arrLen = Math.abs(diff)*50;
      const arrDir = diff > 0 ? -1 : 1;
      ctx.fillStyle = diff>0 ? `rgba(201,168,76,0.7)` : `rgba(255,68,119,0.7)`;
      ctx.font = `7px ${mono}`; ctx.textAlign = "center";
      ctx.fillText(diff>0?"◀ TEMPERED MORE COHERENT":"UNTEMPERED MORE COHERENT ▶", divX+DIVW/2, arrY+22);
      ctx.font = `9px ${mono}`;
      ctx.fillText(`Δ${Math.abs(diff*100).toFixed(1)}%`, divX+DIVW/2, arrY+8);

      // ─── HEADER OVERLAYS ────────────────────────────
      ctx.font = `7px ${mono}`; ctx.textAlign = "center";
      ctx.fillStyle = `rgba(201,168,76,0.55)`;
      ctx.fillText("TEMPERED · FORM V · BINDING AXIS ALIGNED", LEFT_X + HW/2, 16);
      ctx.fillStyle = `rgba(255,68,119,0.45)`;
      ctx.fillText("UNTEMPERED · MIXED FORMS · DECOHERENT CRYSTAL", RIGHT_X + HW/2, 16);

      // Form label
      const form = stableFormAtTemp(T);
      ctx.font = `6px ${mono}`; ctx.textAlign="center";
      ctx.fillStyle = "rgba(200,180,140,0.35)";
      ctx.fillText(`${form.name} · melt ${form.melt}°C · ${form.stable?"STABLE":"UNSTABLE"}`, W/2, 28);

      // ─── BOTTOM STATS BAR ────────────────────────────
      const barY = CH + 12;
      drawCoherenceBar(LEFT_X,  barY, HW*0.44, tCoherence, "TEMPERED COHERENCE", FORM_V);
      drawCoherenceBar(RIGHT_X + HW*0.55, barY, HW*0.44, uCoherence, "UNTEMPERED COHERENCE", ROSE);

      // Temperature display (center bottom)
      ctx.font = `bold 12px ${mono}`; ctx.textAlign="center";
      ctx.fillStyle = T > 34 ? "rgba(255,120,80,0.8)" : T > 31 ? "rgba(201,168,76,0.9)" : T > 27 ? "rgba(255,200,80,0.7)" : "rgba(150,180,255,0.7)";
      ctx.fillText(`${T.toFixed(1)}°C`, W/2, barY+12);

      const phaseLabel = T > 34.5 ? "FULLY LIQUID · all crystals dissolved"
        : T > 33.8 ? "WORKING RANGE · Form V stable → perfect temper"
        : T > 31.0 ? "SEEDING ZONE · Form IV+V coexist"
        : T > 27.3 ? "OVER-COOLED · Form III+IV · undesirable"
        : T > 23.3 ? "ROOM TEMP · solid · bloom forms in untempered"
        : "COLD · rapid Form I-II nucleation · grainy texture";
      ctx.font = `5.5px ${mono}`; ctx.fillStyle = "rgba(200,180,140,0.4)";
      ctx.fillText(phaseLabel, W/2, barY+25);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); ro.disconnect(); };
  }, []);

  /* ── styles ─── */
  const lbl: React.CSSProperties = {
    fontFamily: mono, fontSize: 10, color: `rgba(201,168,76,0.65)`,
    letterSpacing:"0.08em", userSelect:"none",
  };
  const val: React.CSSProperties = {
    fontFamily: mono, fontSize: 10, color: `rgba(201,168,76,0.9)`,
    minWidth: 36, textAlign:"right",
  };
  const sep: React.CSSProperties = { width:1, height:28, background:"rgba(201,168,76,0.15)" };
  const slid: React.CSSProperties = { width:88, accentColor: GOLD };

  return (
    <div style={{ width:"100%", height:"100%", position:"relative",
      overflow:"hidden", background:BG, display:"flex", flexDirection:"column" }}>

      {/* canvas area */}
      <div ref={rootRef} style={{ flex:1, position:"relative", overflow:"hidden" }}>
        <canvas ref={canvasRef} style={{ position:"absolute", inset:0 }} />

        {/* header badge */}
        <div style={{ position:"absolute", top:8, left:12, zIndex:10, pointerEvents:"none" }}>
          <div style={{
            display:"inline-block", border:`1px solid rgba(201,168,76,0.6)`,
            padding:"3px 10px", fontSize:9, letterSpacing:"0.18em",
            color:"rgba(201,168,76,0.8)", fontFamily:"'DM Mono',monospace", marginBottom:4,
          }}>LIVE SIMULATION</div>
          <div style={{
            fontFamily:"'DM Mono',monospace", fontSize:"0.52rem",
            letterSpacing:2, color:"rgba(201,168,76,0.4)",
          }}>CHOCOLATE TEMPERING · COCOA BUTTER CRYSTAL AXIS · DP COHERENCE · AETHER</div>
        </div>

        {/* crystal form legend */}
        <div style={{
          position:"absolute", bottom:44, right:12, zIndex:10, pointerEvents:"none",
          display:"flex", flexDirection:"column", gap:4,
        }}>
          {FORMS.map(f => (
            <div key={f.id} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:2, background:f.col, opacity:0.85 }}/>
              <span style={{ fontFamily:mono, fontSize:6, color:`${f.col}aa`, letterSpacing:1 }}>
                {f.name} · {f.melt}°C {f.stable?"★":""}
              </span>
            </div>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
            <div style={{ width:8, height:8, borderRadius:2, background:FORM_BLOOM, opacity:0.7 }}/>
            <span style={{ fontFamily:mono, fontSize:6, color:`${FORM_BLOOM}99`, letterSpacing:1 }}>
              Fat Bloom
            </span>
          </div>
        </div>
      </div>

      {/* controls bar */}
      <div style={{
        flexShrink:0, display:"flex", gap:16, alignItems:"center", justifyContent:"center",
        flexWrap:"wrap", background:"rgba(8,4,2,0.92)",
        borderTop:"1px solid rgba(201,168,76,0.14)",
        padding:"9px 20px",
      }}>
        <span style={lbl}>TEMPERATURE</span>
        <input type="range" min="16" max="46" step="0.2" value={temp} style={{...slid, width:120}}
          onChange={e => setTemp(parseFloat(e.target.value))} />
        <span style={val}>{temp.toFixed(1)}°C</span>

        <div style={sep}/>

        <span style={lbl}>SIM SPEED</span>
        <input type="range" min="1" max="4" step="1" value={speed} style={slid}
          onChange={e => setSpeed(parseInt(e.target.value))} />
        <span style={val}>{speed}×</span>

        <div style={sep}/>

        <button onClick={() => setDipAnim(d => !d)}
          style={{
            fontFamily: mono, fontSize: 9, letterSpacing:"0.1em",
            padding:"5px 12px", cursor:"pointer", border:"1px solid",
            borderRadius:4, background:"transparent",
            borderColor: dipAnim ? "rgba(201,168,76,0.7)" : "rgba(201,168,76,0.2)",
            color:        dipAnim ? "rgba(201,168,76,0.9)" : "rgba(201,168,76,0.35)",
          }}>
          {dipAnim ? "DIP ANIM ON" : "DIP ANIM OFF"}
        </button>

        <div style={{fontFamily:mono,fontSize:7,color:"rgba(201,168,76,0.3)",maxWidth:260,lineHeight:1.8}}>
          Ideal tempering: cool to 27°C → warm to 32°C → use.
          Form V melts at 33.8°C · Sets at room temp with gloss + snap.
        </div>
      </div>
    </div>
  );
}

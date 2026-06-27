import React, { useEffect, useRef } from "react";

/* ── palette ─────────────────────── */
const BG    = '#04060e';
const GOLD  = '#c8a030';
const QUANT = '#00ffe0';
const DIM   = '#2a4060';
const AZURE = '#6aafff';   // morning blue
const DAYLT = '#b8d8f8';   // midday
const WARM  = '#ffcc60';   // afternoon
const AMBER = '#ff8833';   // evening
const EMBER = '#dd3311';   // night
const MN    = "'Space Mono', monospace";
const OR    = "'Orbitron', sans-serif";

/* ── module-level types ───────────── */
interface PhaseData {
  name: string; time: string; cct: string; lux: string;
  col: string; cxt: string; detail: string; bio: string;
}

interface ArcPoint { x: number; y: number; r: number; g: number; b: number; }
interface TrajPoint { re: number; im: number; col: string; }

/* ── CCT to approximate display RGB ─ */
function cctToRGB(T: number): [number,number,number] {
  if (T < 2000) return [170,  35,   4];
  if (T < 3000) { const p=(T-2000)/1000; return [255, Math.round(50+80*p), Math.round(5+40*p)]; }
  if (T < 4000) { const p=(T-3000)/1000; return [255, Math.round(130+60*p), Math.round(45+80*p)]; }
  if (T < 5500) { const p=(T-4000)/1500; return [255, Math.round(190+40*p), Math.round(125+100*p)]; }
  if (T < 6500) { const p=(T-5500)/1000; return [Math.round(255-30*p), Math.round(230+12*p), Math.round(225+20*p)]; }
  return [215, 228, 255];
}

/* ── phase data ─────────────────── */
const PHASES: PhaseData[] = [
  {
    name: 'MORNING',    time: '06:00 -- 09:00',
    cct: '>6500K', lux: '>1000 lux',
    col: AZURE,
    cxt: 'Real-axis stable, null-cone maintained',
    detail: 'Blue-enriched light (>480nm) activates melanopsin in intrinsically photosensitive retinal ganglion cells (ipRGCs). Residual melatonin suppressed. SCN master clock locked to solar time. C(x,t) rises steadily along the real axis -- no imaginary perturbation because the substrate S*(x,t) is aligned with the incident field.',
    bio: 'Serotonin synthesis from tryptophan. Cortisol awakening response (CAR) peaks 30-45 min after waking. Core body temperature begins rising. HPA axis activated. Null-cone: coherence trajectory stays on the causal surface of the AETHER Minkowski-like metric.',
  },
  {
    name: 'MIDDAY',     time: '10:00 -- 14:00',
    cct: '>5000K', lux: 'natural',
    col: DAYLT,
    cxt: 'Kuramoto-locked triad, maximum coherence',
    detail: 'Bright full-spectrum light maintains peak dopaminergic tone without driving further circadian disruption. Long-term potentiation (LTP) window open -- prefrontal-hippocampal theta coherence at maximum. The Kuramoto-locked triad: serotonin, dopamine, and norepinephrine firing in synchrony, modeled as three coupled oscillators with coupling constant K > K_critical.',
    bio: 'Serotonin peak. Dopamine and norepinephrine drive attention. BDNF upregulated -- neuroplasticity window. LTP consolidation. Gut-brain axis at peak absorption efficiency. C(x,t) oscillates tightly near 1.0 -- the three locked oscillators trace small closed loops in the complex plane.',
  },
  {
    name: 'AFTERNOON',  time: '15:00 -- 18:00',
    cct: '3000--4000K', lux: 'moderate',
    col: WARM,
    cxt: 'Smooth rotational loading, no burst',
    detail: 'Warm white (3000-4000K) reduces blue-channel stimulation, allowing adenosine to accumulate without disrupting the remaining alert window. Transition from high-frequency analytical mode (dorsolateral PFC) to default mode network (medial PFC, precuneus, PCC). Rotational loading: C(x,t) traces a smooth arc in the complex plane -- real and imaginary components evolve uniformly, no sudden burst.',
    bio: 'Adenosine buildup (sleep pressure). Core temperature peaks ~17:00-18:00 then begins descent. Post-lunch dip recovery. Blue light reduction initiates serotonin-to-melatonin conversion cascade (arylalkylamine N-acetyltransferase begins activating). Parasympathetic tone rising.',
  },
  {
    name: 'EVENING',    time: '19:00 -- 21:00',
    cct: '<2700K', lux: 'dim',
    col: AMBER,
    cxt: 'Imaginary loading minimised',
    detail: 'Amber/red light (<2700K, blue blocked >50%). Melanopsin stimulation essentially zero. Pineal gland initiates melatonin synthesis. Blue light at this window shifts dim light melatonin onset (DLMO) by 1-3 hours, fragmenting sleep architecture. Imaginary loading minimised: the perturbation term epsilon(x,t) approaches zero, C(x,t) returns toward the real axis in preparation for the repair state.',
    bio: 'DLMO approximately 2h before target sleep time. N-acetyltransferase enzyme activated in pineal. Cortisol nadir. Core temperature descent begins. SCN inhibits arousal signals via VLPO. Blue >50% blocked = <30 melanopic lux equivalent.',
  },
  {
    name: 'NIGHT',      time: '21:00 -- 06:00',
    cct: 'zero blue', lux: '<10 lux',
    col: EMBER,
    cxt: 'C(x,t) --> 1 : SU(3) singlet, the repair state',
    detail: 'Zero blue exposure (candle ~1800K, salt lamp, blackout curtains). Peak melatonin 02:00-03:00. Slow-wave sleep (N3) triggers glymphatic system activation -- the aquaporin-4 channels dilate 60% and CSF-ISF exchange clears beta-amyloid and tau at 10x the waking rate. C(x,t) converges to 1: the SU(3) singlet -- a state invariant under all internal symmetry transformations. The repair state.',
    bio: 'Glymphatic clearance: 10x waking ISF flow. Growth hormone pulse (N3 stage). Synaptic homeostasis / downscaling. NK cell and T-cell trafficking consolidation. Gut repair hormones (GLP-2). DNA repair enzymes (8-oxoguanine glycosylase). Prion clearance. The body rebuilds its coherent geometry.',
  },
];

/* ═══════════════════════════════════════════════════
   I.  CIRCADIAN SUN ARC CANVAS
   06:00 --> 21:00 with CCT gradient + animated sun
   ═══════════════════════════════════════════════════ */
function CircadianArcCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv  = ref.current; if (!cv)  return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 235;
    cv.width = W; cv.height = H;
    const CX = W/2, CY = H - 22;
    const ARC_R = 168;

    // Pre-compute arc geometry and CCT colors
    const N_ARC = 200;
    const arcPts: ArcPoint[] = [];
    for (let i = 0; i < N_ARC; i++) {
      const frac = i / (N_ARC - 1);          // 0 = 06:00, 1 = 21:00
      const ang  = -Math.PI + frac * Math.PI;
      const x    = CX + ARC_R * Math.cos(ang);
      const y    = CY + ARC_R * Math.sin(ang);
      const hour = 6 + frac * 15;
      let T = 5500;
      if      (hour < 9 ) T = 6500 - 500*(hour-6)/3;
      else if (hour < 10) T = 5800;
      else if (hour < 14) T = 5500;
      else if (hour < 15) T = 5000;
      else if (hour < 18) T = 4500 - 1500*(hour-15)/3;
      else if (hour < 19) T = 3000;
      else                T = 2700 - 300*(hour-19)/2;
      const [r,g,b] = cctToRGB(Math.max(1800, T));
      arcPts.push({x, y, r, g, b});
    }

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Sky dome
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CY);
      skyGrad.addColorStop(0, 'rgba(4,10,24,0.9)');
      skyGrad.addColorStop(1, 'rgba(4,6,14,0.3)');
      ctx.fillStyle = skyGrad;
      ctx.beginPath(); ctx.arc(CX, CY, ARC_R+20, Math.PI, 2*Math.PI); ctx.fill();

      // Horizon
      ctx.strokeStyle = 'rgba(30,50,80,0.5)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(CX-ARC_R-25, CY); ctx.lineTo(CX+ARC_R+25, CY); ctx.stroke();

      // Arc dots (CCT gradient)
      for (const p of arcPts) {
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.5, 0, Math.PI*2);
        ctx.fillStyle = `rgb(${p.r},${p.g},${p.b})`; ctx.fill();
      }

      // Animated sun (600 frames = 10s cycle)
      const sunFrac = (t / 600) % 1;
      const sunAng  = -Math.PI + sunFrac * Math.PI;
      const sx = CX + ARC_R * Math.cos(sunAng);
      const sy = CY + ARC_R * Math.sin(sunAng);
      const hour    = 6 + sunFrac * 15;
      let sunT = 5500;
      if (hour < 9) sunT = 6500;
      else if (hour < 14) sunT = 5500;
      else if (hour < 18) sunT = 3500;
      else sunT = 2700;
      const [sr,sg,sb] = cctToRGB(sunT);

      const sg2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, 26);
      sg2.addColorStop(0,   `rgba(${sr},${sg},${sb},0.88)`);
      sg2.addColorStop(0.45,`rgba(${sr},${sg},${sb},0.30)`);
      sg2.addColorStop(1,   'transparent');
      ctx.beginPath(); ctx.arc(sx, sy, 26, 0, Math.PI*2); ctx.fillStyle = sg2; ctx.fill();
      ctx.beginPath(); ctx.arc(sx, sy, 7,  0, Math.PI*2);
      ctx.fillStyle = `rgb(${sr},${sg},${sb})`; ctx.fill();

      // Time label near sun
      const hh = Math.floor(hour), mm = Math.round((hour-hh)*60);
      const timeStr = hh.toString().padStart(2,'0') + ':' + mm.toString().padStart(2,'0');
      ctx.font = '8px Space Mono'; ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${sr},${sg},${sb},0.85)`;
      ctx.fillText(timeStr, sx, sy < CY-50 ? sy+22 : sy-14);

      // CCT strip below horizon
      const STRIP_Y = CY + 6, STRIP_H = 12;
      for (const p of arcPts) {
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},0.5)`;
        ctx.fillRect(p.x - 2, STRIP_Y, 4, STRIP_H);
      }

      // Phase time anchors on arc exterior
      const anchors = [
        { h: 7.5,  label1: '06--09', label2: 'MORNING',   col: AZURE },
        { h: 12.0, label1: '10--14', label2: 'MIDDAY',    col: DAYLT },
        { h: 16.5, label1: '15--18', label2: 'AFTERNOON', col: WARM  },
        { h: 20.0, label1: '19--21', label2: 'EVENING',   col: AMBER },
      ];
      ctx.font = '6.5px Space Mono'; ctx.textAlign = 'center';
      for (const a of anchors) {
        const f   = (a.h - 6) / 15;
        const ang2 = -Math.PI + f * Math.PI;
        const lx  = CX + (ARC_R + 20) * Math.cos(ang2);
        const ly  = CY + (ARC_R + 20) * Math.sin(ang2);
        ctx.fillStyle = a.col + 'aa'; ctx.fillText(a.label1, lx, ly - 5);
        ctx.fillStyle = DIM;           ctx.fillText(a.label2, lx, ly + 5);
      }

      // Night label on right
      ctx.font = '7px Space Mono'; ctx.fillStyle = EMBER + '88'; ctx.textAlign = 'left';
      ctx.fillText('21:00', CX + ARC_R + 5, CY + 3);
      ctx.textAlign = 'right';
      ctx.fillText('06:00', CX - ARC_R - 5, CY + 3);
      ctx.textAlign = 'center'; ctx.fillStyle = EMBER + '55';
      ctx.fillText('21:00 -- 06:00  NIGHT  (zero blue)', CX, CY + 20);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref} style={{width:'100%', height:'auto', display:'block', borderRadius:4}} />
  );
}

/* ═══════════════════════════════════════════════════
   II.  C(x,t) COHERENCE TRAJECTORY CANVAS
   24h complex-plane trajectory
   ═══════════════════════════════════════════════════ */
function CoherenceCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv  = ref.current; if (!cv)  return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 250;
    cv.width = W; cv.height = H;

    // Plot area (leave margins for labels)
    const ML = 55, MR = 20, MT = 20, MB = 30;
    const PW = W - ML - MR, PH = H - MT - MB;
    const RE_MIN = 0.45, RE_MAX = 1.12;
    const IM_MIN = -0.22, IM_MAX = 0.22;

    function toSX(re: number) { return ML + (re - RE_MIN) / (RE_MAX - RE_MIN) * PW; }
    function toSY(im: number) { return MT + (1 - (im - IM_MIN) / (IM_MAX - IM_MIN)) * PH; }

    // Precompute trajectory (N_TRAJ points across 24h from 06:00)
    const N_TRAJ = 480;
    const traj: TrajPoint[] = [];

    for (let i = 0; i < N_TRAJ; i++) {
      const h = (i / N_TRAJ) * 24; // hours from 06:00
      let re = 0.7, im = 0, col = DIM;

      if (h < 3) { // Morning 06--09: real-axis stable, rising
        const p = h / 3;
        re = 0.60 + 0.22 * p;
        im = 0.038 * Math.sin(Math.PI * p);
        col = AZURE;
      } else if (h < 4) { // gap 09--10
        const p = h - 3;
        re = 0.82 + 0.04 * p;
        im = 0.015 * (1 - p);
        col = '#88aacc';
      } else if (h < 8) { // Midday 10--14: Kuramoto-locked triad
        const p = (h - 4) / 4;
        re = 0.87 + 0.085 * Math.sin(2.4 * 2 * Math.PI * p);
        im = 0.040 * Math.cos(2.4 * 2 * Math.PI * p);
        col = DAYLT;
      } else if (h < 9) { // gap 14--15
        const p = h - 8;
        re = 0.87 + 0.02 * (1 - p) - 0.06 * p;
        im = 0.02 * Math.sin(Math.PI * p);
        col = '#ddcc88';
      } else if (h < 12) { // Afternoon 15--18: rotational loading
        const p = (h - 9) / 3;
        re = 0.81 + 0.08 * Math.cos(2 * Math.PI * p);
        im = 0.115 * Math.sin(2 * Math.PI * p);
        col = WARM;
      } else if (h < 13) { // gap 18--19
        const p = h - 12;
        re = 0.82 - 0.03 * p;
        im = 0.05 * (1 - p);
        col = '#ff9944';
      } else if (h < 15) { // Evening 19--21: imaginary minimised
        const p = (h - 13) / 2;
        re = 0.79 - 0.04 * p;
        im = 0.016 * Math.sin(Math.PI * p);
        col = AMBER;
      } else { // Night 21--06: C(x,t) --> 1
        const p = (h - 15) / 9;
        re = 0.75 + 0.245 * Math.pow(p, 0.58);
        im = 0.008 * Math.sin(Math.PI * p);
        col = EMBER;
      }
      traj.push({ re, im, col });
    }

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Axes
      ctx.strokeStyle = 'rgba(42,64,96,0.5)'; ctx.lineWidth = 0.6;
      // Re axis (y=0)
      ctx.beginPath(); ctx.moveTo(ML, toSY(0)); ctx.lineTo(ML+PW, toSY(0)); ctx.stroke();
      // Im axis (re=RE_MIN... actually draw at re=0.5 for visibility)
      ctx.beginPath(); ctx.moveTo(ML, MT); ctx.lineTo(ML, MT+PH); ctx.stroke();
      // Singlet target: vertical at Re=1
      ctx.strokeStyle = QUANT + '25'; ctx.lineWidth = 0.8;
      ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(toSX(1), MT); ctx.lineTo(toSX(1), MT+PH); ctx.stroke();
      ctx.setLineDash([]);

      // Axis labels
      ctx.font = '7px Space Mono'; ctx.textAlign = 'right'; ctx.fillStyle = DIM;
      const reVals = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      for (const rv of reVals) {
        ctx.fillText(rv.toFixed(1), ML - 3, toSY(0) + 3);
        ctx.fillStyle = 'rgba(42,64,96,0.35)'; ctx.lineWidth = 0.3;
        ctx.beginPath(); ctx.moveTo(ML, toSY(rv-0.5)); ctx.lineTo(ML+PW, toSY(rv-0.5)); ctx.stroke();
        ctx.fillStyle = DIM;
      }
      // Re tick marks
      for (const rv of reVals) {
        const sx = toSX(rv);
        ctx.fillStyle = 'rgba(42,64,96,0.3)'; ctx.lineWidth = 0.3;
        ctx.beginPath(); ctx.moveTo(sx, MT); ctx.lineTo(sx, MT+PH); ctx.stroke();
        ctx.fillStyle = DIM; ctx.textAlign = 'center';
        ctx.fillText(rv.toFixed(1), sx, MT + PH + 12);
      }
      // Axis titles
      ctx.font = '7.5px Space Mono'; ctx.textAlign = 'center'; ctx.fillStyle = DIM;
      ctx.fillText('Re[C(x,t)]  --  coherence', ML + PW/2, H - 2);
      ctx.save(); ctx.translate(11, MT + PH/2); ctx.rotate(-Math.PI/2);
      ctx.fillText('Im[C(x,t)]', 0, 0); ctx.restore();

      // Singlet label
      ctx.font = '6.5px Space Mono'; ctx.textAlign = 'center'; ctx.fillStyle = QUANT+'55';
      ctx.fillText('SU(3) singlet', toSX(1), MT - 4);

      // Draw full trajectory (faint, phase-colored)
      for (let i = 1; i < N_TRAJ; i++) {
        const p = traj[i-1], q = traj[i];
        ctx.strokeStyle = q.col + '55'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(toSX(p.re), toSY(p.im));
        ctx.lineTo(toSX(q.re), toSY(q.im));
        ctx.stroke();
      }

      // Animated dot (1200 frames = 20s cycle)
      const dotIdx = Math.floor(((t % 1200) / 1200) * N_TRAJ);
      const dotPt  = traj[dotIdx];
      const dx = toSX(dotPt.re), dy = toSY(dotPt.im);

      const dg = ctx.createRadialGradient(dx, dy, 0, dx, dy, 14);
      dg.addColorStop(0,   dotPt.col + 'aa');
      dg.addColorStop(1,   'transparent');
      ctx.beginPath(); ctx.arc(dx, dy, 14, 0, Math.PI*2); ctx.fillStyle = dg; ctx.fill();
      ctx.beginPath(); ctx.arc(dx, dy, 5, 0, Math.PI*2);
      ctx.fillStyle = dotPt.col; ctx.fill();

      // Phase annotations (static labels at key regions)
      const annotations = [
        { re:0.70, im:0.03,  label:'MORNING', sub:'real-axis rise', col:AZURE  },
        { re:0.93, im:0.04,  label:'MIDDAY',  sub:'Kuramoto loops', col:DAYLT  },
        { re:0.82, im:0.13,  label:'AFTERNOON',sub:'rotational arc', col:WARM  },
        { re:0.78, im:-0.04, label:'EVENING', sub:'Im minimised',   col:AMBER  },
        { re:0.98, im:0.00,  label:'NIGHT',   sub:'C --> 1',        col:EMBER  },
      ];
      ctx.font = '6px Space Mono';
      for (const a of annotations) {
        const ax = toSX(a.re), ay = toSY(a.im);
        ctx.fillStyle = a.col + 'cc'; ctx.textAlign = 'left';
        ctx.fillText(a.label, ax+6, ay-2);
        ctx.fillStyle = DIM;
        ctx.fillText(a.sub, ax+6, ay+8);
      }

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref} style={{width:'100%', height:'auto', display:'block', borderRadius:4}} />
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function BlueLightProtocolPage() {
  const card = (col = GOLD): React.CSSProperties => ({
    background: 'rgba(0,0,0,0.4)',
    border: `1px solid ${col}22`,
    borderRadius: 4,
    padding: '12px 16px',
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 7.5, letterSpacing: '0.2em',
    color: DIM, textTransform: 'uppercase', marginBottom: 10,
    paddingBottom: 4, borderBottom: '1px solid rgba(0,255,224,0.12)',
  };
  const phaseColMap: Record<string,string> = {
    MORNING: AZURE, MIDDAY: DAYLT, AFTERNOON: WARM, EVENING: AMBER, NIGHT: EMBER,
  };

  return (
    <div style={{minHeight:'100%', background:BG, color:'#d4e8f7',
      fontFamily:"'Rajdhani',sans-serif", overflowY:'auto'}}>
      <div style={{maxWidth:1100, margin:'0 auto', padding:'16px 20px'}}>

        {/* ── title ── */}
        <div style={{marginBottom:18}}>
          <div style={{display:'inline-block', border:'1px solid rgba(106,175,255,0.45)',
            padding:'3px 10px', fontSize:9, letterSpacing:'0.2em',
            color:AZURE+'cc', fontFamily:MN, marginBottom:8}}>
            AETHER CIRCADIAN PROTOCOL
          </div>
          <h1 style={{fontFamily:OR, fontSize:21, fontWeight:900, letterSpacing:2,
            color:AZURE, textShadow:'0 0 24px '+AZURE+'44', margin:'4px 0'}}>
            Blue-Light Protocol &middot; Circadian Coherence Architecture
          </h1>
          <p style={{fontSize:13, color:'rgba(200,200,220,0.75)',
            maxWidth:840, lineHeight:1.7, margin:0}}>
            A 5-phase light prescription architected around the AETHER coherence equation
            C(x,t) = 1 &minus; &#x2016;&epsilon;(x,t)&#x2016;&thinsp;/&thinsp;&#x2016;S*(x,t)&#x2016;.
            Each phase targets a specific neurochemical cascade and a specific region of the C(x,t)
            complex-plane trajectory. The night repair state C(x,t) &rarr; 1 is the SU(3) singlet --
            maximal symmetry, the substrate rebuilding itself atom by atom.
          </p>
        </div>

        {/* ── sun arc canvas ── */}
        <div style={{...card(GOLD), marginBottom:16}}>
          <div style={secLabel}>
            24h Circadian Arc &middot; Colour Temperature Gradient &middot; CCT = f(hour)
          </div>
          <CircadianArcCanvas />
          <div style={{marginTop:8, fontFamily:MN, fontSize:7.5, color:DIM, lineHeight:1.9}}>
            Arc colour represents CCT at each hour: blue-white dawn (6500K) &rarr; neutral white midday (5500K)
            &rarr; warm white afternoon (3500K) &rarr; amber evening (2700K). Night (21:00--06:00) is zero blue.
            Animated sun shows real-time position on the arc.
          </div>
        </div>

        {/* ── 5 phase cards ── */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:16}}>
          {PHASES.map(p => (
            <div key={p.name} style={{...card(p.col), borderColor:p.col+'28',
              borderTop:`2px solid ${p.col}88`}}>
              <div style={{fontFamily:OR, fontSize:8, color:p.col,
                letterSpacing:1.5, marginBottom:3}}>{p.name}</div>
              <div style={{fontFamily:MN, fontSize:7, color:p.col+'77',
                marginBottom:8, lineHeight:1.6}}>{p.time}<br/>{p.cct}<br/>{p.lux}</div>
              <div style={{fontFamily:MN, fontSize:7, color:p.col+'99',
                fontStyle:'italic', marginBottom:6, lineHeight:1.5}}>{p.cxt}</div>
              <div style={{fontSize:10, color:'rgba(180,200,220,0.62)',
                lineHeight:1.6, marginBottom:6}}>{p.detail}</div>
              <div style={{fontSize:9.5, color:'rgba(150,180,200,0.5)',
                lineHeight:1.55, borderTop:`1px solid ${p.col}18`,
                paddingTop:6}}>{p.bio}</div>
            </div>
          ))}
        </div>

        {/* ── coherence trajectory ── */}
        <div style={{...card(QUANT), marginBottom:16}}>
          <div style={secLabel}>
            C(x,t) Trajectory &middot; Complex Plane &middot; 24-Hour Coherence Field Evolution
          </div>
          <p style={{fontSize:11, color:'rgba(180,240,220,0.7)', lineHeight:1.7,
            marginBottom:12, maxWidth:820}}>
            The AETHER coherence field C(x,t) evolves through the complex plane during the 24-hour cycle.
            Morning: rising along the real axis (stable, null-cone maintained). Midday: tight Kuramoto
            oscillation loops near (1,0) -- three coupled oscillators at lock. Afternoon: a full rotational
            arc -- smooth ellipse with no burst. Evening: descending back toward the real axis, imaginary
            loading minimised. Night: smooth convergence to Re(C) = 1, Im(C) = 0 -- the SU(3) singlet.
            The animated dot shows current phase position.
          </p>
          <CoherenceCanvas />
          <div style={{marginTop:10, display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8}}>
            {([
              {col:AZURE, t:'Real-Axis Stable', b:'Morning C(x,t) rises monotonically along the real axis. Im(C) stays near zero -- the coherence field is not rotationally loaded. Null-cone maintained: the AETHER metric ds^2=0 boundary is not crossed.'},
              {col:DAYLT, t:'Kuramoto-Locked', b:'Midday: serotonin + dopamine + norepinephrine form a triad of coupled oscillators. When coupling K > K_critical (Kuramoto threshold), all three lock phase. C(x,t) traces tight loops near maximum coherence.'},
              {col:WARM,  t:'Rotational Loading', b:'Afternoon: the coherence field rotates in the complex plane -- real and imaginary components evolve uniformly. Smooth arc, no discontinuity. "No burst" means no sudden imaginary spike that would indicate a perturbation event.'},
              {col:AMBER, t:'Im Minimised', b:'Evening: amber light stops driving imaginary loading. The coherence field lands back near the real axis, preparing for the night convergence. Blue light here would push Im(C) away from zero -- measurable as melatonin suppression.'},
              {col:EMBER, t:'SU(3) Singlet', b:'Night: C(x,t) converges to 1. In SU(3) gauge theory, a singlet state is invariant under all group transformations -- the ground state. Biologically: glymphatic clearance, synaptic homeostasis, DNA repair. The field returns to its maximally symmetric configuration.'},
            ] as {col:string;t:string;b:string}[]).map(({col,t,b}) => (
              <div key={t} style={{...card(col), borderColor:col+'22', padding:'8px 10px'}}>
                <div style={{fontFamily:OR, fontSize:7, color:col, letterSpacing:1, marginBottom:4}}>{t}</div>
                <div style={{fontSize:9.5, color:'rgba(180,200,220,0.58)', lineHeight:1.6}}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── night repair section ── */}
        <div style={{...card(EMBER), marginBottom:16, borderColor:EMBER+'22',
          borderLeft:`3px solid ${EMBER}88`}}>
          <div style={secLabel}>
            Night Repair State &middot; C(x,t) &rarr; 1 &middot; SU(3) Singlet
          </div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
            <div>
              <div style={{fontFamily:OR, fontSize:12, color:EMBER, marginBottom:8,
                letterSpacing:1.5, textShadow:'0 0 16px '+EMBER+'44'}}>
                C(x,t) &rarr; 1 : the SU(3) singlet
              </div>
              <p style={{fontSize:12, color:'rgba(220,200,190,0.75)', lineHeight:1.75, margin:0}}>
                Zero blue exposure (candle ~1800K, salt lamp, blackout) opens the full repair state.
                The coherence field converges to its maximal value -- a state invariant under all internal
                symmetry transformations. This is the ultimate building block for perceptual targeting and
                intuitive design: every biological process that requires substrate coherence (neural
                integration, spatial reasoning, pattern recognition across scales) is seeded during the
                night singlet state.
              </p>
            </div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {([
                {t:'Glymphatic Clearance', b:'10x waking ISF flow rate. Aquaporin-4 channels in astrocytes dilate 60%. Beta-amyloid, tau, and metabolic waste removed from interstitial fluid via CSF exchange.'},
                {t:'Growth Hormone Pulse', b:'GH released in N3 slow-wave sleep. Anabolic state: protein synthesis, fat metabolism, cellular repair. Peak concentration at 22:00-01:00.'},
                {t:'Synaptic Homeostasis', b:'Synaptic Homeostasis Hypothesis (Tononi): excess synaptic potentiation from waking LTP is downscaled during NREM. Signal-to-noise reset for next-day learning.'},
                {t:'Substrate Rebuild', b:'DNA repair enzymes active (8-OG glycosylase, PARP1). Prion clearance. Gut epithelial renewal (GLP-2). NK and T-cell trafficking consolidation. The physical substrate of the AETHER framework rebuilds its geometric coherence.'},
              ] as {t:string;b:string}[]).map(({t,b}) => (
                <div key={t} style={{...card(EMBER), borderColor:EMBER+'22', padding:'8px 10px'}}>
                  <div style={{fontFamily:OR, fontSize:7.5, color:EMBER, letterSpacing:1, marginBottom:4}}>{t}</div>
                  <div style={{fontSize:9.5, color:'rgba(210,180,170,0.62)', lineHeight:1.6}}>{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── implementation notes ── */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16}}>
          <div style={card(AZURE)}>
            <div style={secLabel}>Hardware Implementation</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {([
                {t:'Morning Light Source', b:'Sunlight (optimal) or blue-enriched LED panel (>6500K, >1000 lux at eye level). Lightbox therapy lamps at 10,000 lux for 20-30 min. Sky-facing window exposure within 30 min of wake.'},
                {t:'Blue Blockers', b:'>50% blue blocking amber lenses from 19:00. Red lens variants (>95% block) for 20:00+. Screen software: f.lux or Night Shift maximum warmth from 17:00.'},
                {t:'Evening Lighting', b:'Salt lamps (~2200K), beeswax candles (~1800K), LED bulbs with <2700K setting. Avoid overhead LED. Dim to <10 lux in sleeping space by 20:30.'},
                {t:'Blackout Protocol', b:'Blackout curtains or sleep mask. Even 1 lux on closed eyelids suppresses melatonin measurably. Remove all indicator LEDs (tape over). Sleep in full darkness.'},
              ] as {t:string;b:string}[]).map(({t,b}) => (
                <div key={t} style={{...card(AZURE), borderColor:AZURE+'22', padding:'8px 10px'}}>
                  <div style={{fontFamily:OR, fontSize:7, color:AZURE, letterSpacing:1, marginBottom:3}}>{t}</div>
                  <div style={{fontSize:9.5, color:'rgba(160,200,240,0.6)', lineHeight:1.6}}>{b}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={card(GOLD)}>
            <div style={secLabel}>C(x,t) Phase Deviations</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {([
                {t:'Evening Blue Exposure', b:'Pushes Im(C) positive at t=evening: melatonin suppressed by 50% with 2h of standard screen light at 19:00-21:00. DLMO shifts 90 min later. Equivalent to flying 1.5 time zones west each night.'},
                {t:'No Morning Blue', b:'C(x,t) fails to rise on real axis. Serotonin pool depleted by 11:00. Cortisol awakening response attenuated. Circadian anchor drifts -- equivalent to chronic social jetlag.'},
                {t:'Midday Indoor Darkness', b:'Kuramoto lock does not engage if <100 lux indoors. Dopamine tone remains submaximal. LTP consolidation window narrow or absent. C(x,t) oscillation amplitude too small for coherent lock.'},
                {t:'Repair State Interruption', b:'Light exposure during 02:00-04:00 (peak melatonin) terminates the SU(3) singlet state. Even 3 lux (phone screen) suppresses glymphatic CSF flow. Substrate rebuild incomplete -- compounding deficit each cycle.'},
              ] as {t:string;b:string}[]).map(({t,b}) => (
                <div key={t} style={{...card(GOLD), borderColor:GOLD+'22', padding:'8px 10px'}}>
                  <div style={{fontFamily:OR, fontSize:7, color:GOLD, letterSpacing:1, marginBottom:3}}>{t}</div>
                  <div style={{fontSize:9.5, color:'rgba(220,200,150,0.6)', lineHeight:1.6}}>{b}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── footer ── */}
        <div style={{marginTop:16, paddingTop:10,
          borderTop:`1px solid ${AZURE}18`,
          fontFamily:MN, fontSize:7.5, color:DIM,
          letterSpacing:'0.12em', textAlign:'center'}}>
          AETHER &middot; BLUE-LIGHT PROTOCOL &middot; CIRCADIAN COHERENCE ARCHITECTURE &middot;
          C(x,t) TRAJECTORY &middot; KURAMOTO TRIAD &middot; SU(3) SINGLET &middot;
          GLYMPHATIC CLEARANCE &middot; MELATONIN DMLO &middot; NULL-CONE MAINTAINED
        </div>
      </div>
    </div>
  );
}

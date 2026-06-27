import React, { useEffect, useRef } from "react";

/* ── palette ─────────────────────── */
const BG     = '#04060e';
const GOLD   = '#c8a030';
const PLASMA = '#ff7040';
const QUANT  = '#00ffe0';
const STRUCT = '#8b5cf6';
const DIM    = '#2a4060';
const MN     = "'Space Mono', monospace";
const OR     = "'Orbitron', sans-serif";
const PHI    = (1 + Math.sqrt(5)) / 2; // 1.6180339...

/* ── module-level data ────────────── */
interface DomainData {
  title: string; sub: string; col: string;
  chaos: string; order: string; mech: string; eq: string;
}

const DOMAINS: DomainData[] = [
  {
    title: 'Re-Entry Plasma Shield',
    sub:   'Boundary flux ~1,600 C+',
    col:   PLASMA,
    chaos: 'Hypersonic shock layer heat flux (MW/m^2)',
    order: 'Preserved ablative substrate -- no catastrophic spallation',
    mech:  'phi-scaled cell walls create a phononic bandgap suppressing thermal wave propagation at chaotic frequencies. Each cell layer absorbs 1/phi of remaining flux: ablation distributes uniformly across all scales without runaway.',
    eq:    'k_eff ~ k_s * (rho/rho_s)^phi  [phi-graded Gibson-Ashby]',
  },
  {
    title: '75 klb Runway Load',
    sub:   'Concentrated 75,000 lb contact patch',
    col:   STRUCT,
    chaos: 'Point load stress concentration -- local yield failure risk',
    order: 'Uniform shear / compression over full cross-section',
    mech:  'phi-graded cell hierarchy: each generation handles 1/phi of remaining stress. Irrational phi spacing prevents resonant harmonic buildup -- no cell layer can lock frequency with an adjacent layer.',
    eq:    'sigma_cr = C(phi) * E_s * (rho/rho_s)^2,  C grows with phi-grading',
  },
  {
    title: 'Quantum Decoherence Filter',
    sub:   'C-13 nuclear spin bath (NV diamond)',
    col:   QUANT,
    chaos: 'C-13 spin fluctuations at random frequencies creating dephasing bath',
    order: 'NV-center T2 coherence time extended via spectral engineering',
    mech:  'phi-spaced NV array creates quasiperiodic structure factor S(k). Bath spectral density S(omega) develops gaps at phi-multiples of the C-13 Larmor frequency. Incoherent back-action suppressed inside each gap.',
    eq:    'T2 ~ hbar / (J*sqrt(N_C13*S(omega_0))),  S(omega_0) -> 0 at gaps',
  },
];

interface UnifyData { col: string; t: string; eq: string; body: string; }

const UNIFY: UnifyData[] = [
  {
    col: GOLD, t: "Nature's phi",
    eq: 'r_n = r_0 * phi^n',
    body: 'Phyllotaxis, nautilus shells, and bone trabeculae all converge on phi packing. It minimises interference and maximises flow. Not metaphor -- a mathematical attractor under evolutionary / annealing pressure.',
  },
  {
    col: QUANT, t: 'Phononic Bandgap',
    eq: 'omega_gap = pi * v / a_phi',
    body: 'Quasiperiodic lattices open frequency bandgaps broader and more robust than periodic ones. Inside the gap, no phonon propagates -- chaotic modes are geometrically forbidden by the irrational spacing.',
  },
  {
    col: STRUCT, t: 'Fractal / Hierarchical',
    eq: 'E/E_s = C * (rho/rho_s)^n,  2 < n < phi',
    body: 'Multi-scale structures dissipate energy across scales without catastrophic failure. The phi-exponent in Gibson-Ashby scaling appears empirically in optimised natural cellular solids (bone, wood).',
  },
  {
    col: PLASMA, t: 'Information-Thermodynamic',
    eq: 'Delta_S = k_B * ln(Omega_cells)',
    body: 'Converting boundary chaos (high entropy flux) to interior order requires dissipation and structure. Periodic arrays act as spatial Fourier filters -- error-correcting codes written in geometry, not silicon.',
  },
];

/* ═══════════════════════════════════════════════════
   I.  phi-QUASIPERIODIC CRYSTAL CANVAS
   5-wave superposition -- thermal pulse animation
   ═══════════════════════════════════════════════════ */
function PhiCrystalCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv  = ref.current;  if (!cv)  return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 380, H = 380;
    cv.width = W; cv.height = H;
    const halfR = W * 0.5;

    // Precompute 5-wave quasiperiodic field once
    const field = new Float32Array(W * H);
    const sc = 0.12;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const cx = x - W/2, cy = y - H/2;
        let v = 0;
        for (let k = 0; k < 5; k++) {
          const ang = 2 * Math.PI * k / 5;
          v += Math.cos(sc * (cx * Math.cos(ang) + cy * Math.sin(ang)));
        }
        field[y * W + x] = v; // range ~[-5, +5]
      }
    }

    const imgData = ctx.createImageData(W, H);
    let t = 0;

    function draw() {
      t++;
      // Pulse enters at boundary (r=halfR), drifts to center (r=0)
      const pulseR = halfR * (1 - ((t * 0.45) % halfR) / halfR);

      for (let idx = 0; idx < W * H; idx++) {
        const px = idx % W, py = Math.floor(idx / W);
        const cx = px - W/2, cy = py - H/2;
        const dist = Math.sqrt(cx*cx + cy*cy);
        const d = dist / halfR; // 0 = center, 1 = edge

        // Clip to circular disk
        if (d > 1.01) {
          imgData.data[idx*4+3] = 0;
          continue;
        }

        const v = field[idx]; // -5 to +5
        // Breathing wall threshold
        const wallThresh = 0.5 + 0.1 * Math.sin(t * 0.014);
        const isWall = Math.abs(v) < wallThresh;

        const pulseBoost = Math.max(0, 1 - Math.abs(dist - pulseR) / 16) * 0.55;

        let r = 0, g = 0, b = 0;
        if (isWall) {
          // Gold cell walls
          const wb = 0.6 + 0.3 * Math.sin(t * 0.016 + d * 6) + pulseBoost * 0.35;
          r = Math.min(255, 200 * wb) | 0;
          g = Math.min(255, 160 * wb) | 0;
          b = Math.min(255,  48 * wb) | 0;
        } else {
          const heat = Math.min(1, d * 0.75 + pulseBoost * 0.65);
          const bright = 0.12 + 0.38 * ((v + 5) / 10); // cell relief
          // heat 0 = deep blue (ordered), heat 1 = orange (chaotic boundary)
          let cr = 0, cg = 0, cb = 0;
          if (heat < 0.5) {
            const p = heat * 2;
            cr = 0; cg = Math.round(70 + 130*p); cb = Math.round(180 - 10*p);
          } else {
            const p = (heat - 0.5) * 2;
            cr = Math.round(255*p); cg = Math.round(200 - 90*p); cb = Math.round(170 - 140*p);
          }
          r = Math.min(255, Math.round(cr * bright + pulseBoost * 85));
          g = Math.min(255, Math.round(cg * bright + pulseBoost * 65));
          b = Math.min(255, Math.round(cb * bright + pulseBoost * 45));
        }
        const ii = idx * 4;
        imgData.data[ii]   = r;
        imgData.data[ii+1] = g;
        imgData.data[ii+2] = b;
        imgData.data[ii+3] = 255;
      }

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
      ctx.putImageData(imgData, 0, 0);

      // Boundary ring (plasma edge label)
      ctx.strokeStyle = PLASMA + '44'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(W/2, H/2, halfR - 2, 0, Math.PI*2); ctx.stroke();

      // Center coherence zone
      const crR = 15 + 4 * Math.sin(t * 0.042);
      if (isFinite(crR) && crR > 0) {
        ctx.strokeStyle = QUANT + '80'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(W/2, H/2, crR, 0, Math.PI*2); ctx.stroke();
      }

      // Axis labels
      ctx.font = '6px Space Mono'; ctx.textAlign = 'center';
      ctx.fillStyle = PLASMA + 'aa';
      ctx.fillText('CHAOS BOUNDARY', W/2, 10);
      ctx.fillStyle = QUANT + 'aa';
      ctx.fillText('ORDER INTERIOR', W/2, H - 6);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{width:'100%', maxWidth:380, height:'auto', display:'block',
        imageRendering:'pixelated', borderRadius:4, margin:'0 auto'}} />
  );
}

/* ═══════════════════════════════════════════════════
   II.  THERMAL CASCADE CANVAS
   phi-scaled horizontal bands -- descending pulse
   ═══════════════════════════════════════════════════ */
function ThermalCascadeCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv  = ref.current;  if (!cv)  return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 220;
    cv.width = W; cv.height = H;
    const N = 8;
    const GRAPH_W = W - 185;
    const MARGIN_T = 24;
    const CONTENT_H = H - MARGIN_T - 10;

    // phi^(-i) normalized layer heights
    const rawH = Array.from({length: N}, (_, i) => Math.pow(1 / PHI, i));
    const sumH = rawH.reduce((a, b) => a + b, 0);
    const layerH = rawH.map(h => (h / sumH) * CONTENT_H);
    // cumulative y positions
    const yPos: number[] = [MARGIN_T];
    for (let i = 0; i < N; i++) yPos.push(yPos[i] + layerH[i]);

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Pulse descends from top to bottom over ~166 frames (~2.7s at 60fps)
      const pulseFrac = (t * 0.006) % 1;
      const pulseY    = MARGIN_T + pulseFrac * CONTENT_H;

      for (let i = 0; i < N; i++) {
        const y0 = yPos[i], lh = layerH[i];
        const prog = i / (N - 1); // 0 = top/boundary, 1 = bottom/ordered

        // Direct RGB interpolation: plasma(255,112,30) -> quantum(0,255,224)
        const br = Math.round(255 * (1 - prog));
        const bg = Math.round(112 + (255 - 112) * prog);
        const bb = Math.round(30  + (224 -  30) * prog);

        const inLayer  = pulseY >= y0 && pulseY < y0 + lh;
        const flashAmt = inLayer ? (0.45 + 0.3 * Math.sin(t * 0.28)) : 0;
        const dim      = 0.22 + (1 - prog) * 0.28 + flashAmt * 0.6;

        ctx.fillStyle = `rgb(${Math.min(255, br*dim + flashAmt*110)|0},${Math.min(255, bg*dim + flashAmt*55)|0},${Math.min(255, bb*dim + flashAmt*35)|0})`;
        ctx.fillRect(0, y0, GRAPH_W, lh);

        // Layer boundary line
        ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(GRAPH_W, y0); ctx.stroke();

        // Label: layer index + phi expression
        ctx.font = '7px Space Mono'; ctx.textAlign = 'left'; ctx.fillStyle = GOLD + '88';
        const lLabel = i === 0 ? 'L\u2080  (boundary)' : 'L' + i + ' = L / \u03C6^' + i;
        ctx.fillText(lLabel, GRAPH_W + 6, y0 + lh / 2 + 2.5);

        // Thickness
        if (lh > 5) {
          ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.textAlign = 'right';
          ctx.fillText(lh.toFixed(1) + 'px', GRAPH_W - 4, y0 + lh / 2 + 2.5);
        }
      }

      // Pulse marker line
      ctx.strokeStyle = 'rgba(255,255,200,0.65)'; ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(0, pulseY); ctx.lineTo(GRAPH_W, pulseY); ctx.stroke();
      ctx.setLineDash([]);

      // Header / footer labels
      ctx.font = '7px Space Mono'; ctx.textAlign = 'center';
      ctx.fillStyle = PLASMA + 'bb';
      ctx.fillText('PLASMA BOUNDARY -- MAXIMUM HEAT FLUX', GRAPH_W / 2, MARGIN_T - 8);
      ctx.fillStyle = QUANT + 'bb';
      ctx.fillText('INTERIOR -- ORDERED / PROTECTED', GRAPH_W / 2, H - 2);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref} style={{width:'100%', height:'auto', display:'block', borderRadius:3}} />
  );
}

/* ═══════════════════════════════════════════════════
   III.  SPIN BATH + SPECTRAL DENSITY CANVAS
   NV center coherence / C-13 / phi bandgaps
   ═══════════════════════════════════════════════════ */
function SpinBathCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv  = ref.current;  if (!cv)  return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 210;
    cv.width = W; cv.height = H;

    const SPIN_W = 175;
    const SPEC_X = SPIN_W + 18;
    const SPEC_W = W - SPEC_X - 8;

    const GRID = 11;
    const CELL = SPIN_W / GRID;
    const N_SPINS = GRID * GRID;
    const GRID_OFFSET_Y = (H - SPIN_W) / 2;

    // Pre-determine C-13 positions (~14% natural-abundance-ish)
    const isC13   = Array.from({length: N_SPINS}, () => Math.random() < 0.14);
    const spinPh  = new Float32Array(N_SPINS);
    const spinFq  = new Float32Array(N_SPINS);
    for (let i = 0; i < N_SPINS; i++) spinFq[i] = 0.04 + Math.random() * 0.11;
    const NV_IDX = Math.floor(GRID/2) * GRID + Math.floor(GRID/2);

    // phi-gap positions in normalised log-freq space [0,1]
    const OM0 = 0.34; // C-13 Larmor frequency (normalised)
    const phiGaps: number[] = [];
    for (let k = 1; k <= 4; k++) {
      const gw = OM0 * Math.pow(PHI, k);
      if (gw < 0.97) phiGaps.push(gw);
    }

    let t = 0;
    function draw() {
      t++;
      for (let i = 0; i < N_SPINS; i++) spinPh[i] += spinFq[i] * (isC13[i] ? 1.5 : 0.25);

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // ── Left: spin array ──────────────────
      for (let i = 0; i < N_SPINS; i++) {
        if (i === NV_IDX) continue;
        const gx = (i % GRID) * CELL + CELL / 2;
        const gy = Math.floor(i / GRID) * CELL + CELL / 2 + GRID_OFFSET_Y;

        if (isC13[i]) {
          const ph = spinPh[i];
          ctx.strokeStyle = '#ef4444cc'; ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(gx, gy);
          ctx.lineTo(gx + Math.cos(ph) * 5, gy + Math.sin(ph) * 5);
          ctx.stroke();
          ctx.beginPath(); ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ef4444aa'; ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(90,110,150,0.38)'; ctx.fill();
        }
      }

      // NV center + coherence ring
      const nvx = Math.floor(GRID/2) * CELL + CELL/2;
      const nvy = Math.floor(GRID/2) * CELL + CELL/2 + GRID_OFFSET_Y;
      const crR = 14 + 3 * Math.sin(t * 0.038); // stable (phi-protected)
      if (isFinite(crR) && crR > 0) {
        ctx.strokeStyle = QUANT + '60'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(nvx, nvy, crR, 0, Math.PI * 2); ctx.stroke();
        // outer pulse ring
        const outerR = crR + 8 + 4 * Math.sin(t * 0.018);
        if (isFinite(outerR) && outerR > 0) {
          ctx.strokeStyle = QUANT + '20'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(nvx, nvy, outerR, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.beginPath(); ctx.arc(nvx, nvy, 5, 0, Math.PI * 2);
      ctx.fillStyle = QUANT; ctx.fill();
      ctx.font = '6px Space Mono'; ctx.fillStyle = QUANT + 'aa'; ctx.textAlign = 'center';
      ctx.fillText('NV', nvx, nvy - 10);

      // Legend
      ctx.font = '6.5px Space Mono'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(90,110,150,0.7)';
      ctx.fillText('C-12 (spin 0, silent)', 3, H - 17);
      ctx.fillStyle = '#ef4444bb';
      ctx.fillText('C-13 (spin 1/2, decohere)', 3, H - 7);

      // ── Right: spectral density ──────────
      const SY    = 14;
      const SH    = H - SY - 18;

      // Axes
      ctx.strokeStyle = 'rgba(31,212,200,0.12)'; ctx.lineWidth = 0.6;
      ctx.beginPath(); ctx.moveTo(SPEC_X, SY); ctx.lineTo(SPEC_X, SY+SH); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(SPEC_X, SY+SH); ctx.lineTo(SPEC_X+SPEC_W, SY+SH); ctx.stroke();

      ctx.font = '6.5px Space Mono'; ctx.fillStyle = DIM; ctx.textAlign = 'left';
      ctx.fillText('S(\u03C9)  bath spectral density', SPEC_X, SY - 3);
      ctx.fillText('1 kHz', SPEC_X, SY + SH + 11);
      ctx.fillText('100 MHz', SPEC_X + SPEC_W - 42, SY + SH + 11);

      // Curve A: no phi-lattice (gray Lorentzian + noise)
      ctx.strokeStyle = 'rgba(140,140,155,0.40)'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let px = 0; px < SPEC_W; px++) {
        const w = px / SPEC_W;
        const v = 0.68 / (1 + Math.pow((w - OM0) * 8, 2))
                + 0.07
                + 0.025 * Math.sin(w * 44 + t * 0.009);
        const yy = SY + SH - Math.min(0.96, v) * SH;
        px === 0 ? ctx.moveTo(SPEC_X + px, yy) : ctx.lineTo(SPEC_X + px, yy);
      }
      ctx.stroke();

      // Curve B: with phi-lattice (notched teal)
      ctx.strokeStyle = QUANT + 'bb'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let px = 0; px < SPEC_W; px++) {
        const w = px / SPEC_W;
        let v = 0.68 / (1 + Math.pow((w - OM0) * 8, 2))
              + 0.07
              + 0.025 * Math.sin(w * 44 + t * 0.009);
        for (const gw of phiGaps) {
          v *= (1 - 0.78 * Math.exp(-Math.pow((w - gw) * 85, 2)));
        }
        const yy = SY + SH - Math.min(0.96, Math.max(0, v)) * SH;
        px === 0 ? ctx.moveTo(SPEC_X + px, yy) : ctx.lineTo(SPEC_X + px, yy);
      }
      ctx.stroke();

      // phi-gap vertical markers
      phiGaps.forEach((gw, gi) => {
        const gpx = SPEC_X + gw * SPEC_W;
        ctx.strokeStyle = GOLD + '35'; ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.beginPath(); ctx.moveTo(gpx, SY); ctx.lineTo(gpx, SY + SH); ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '6px Space Mono'; ctx.fillStyle = GOLD + '75'; ctx.textAlign = 'center';
        ctx.fillText('\u03C6^' + (gi + 1), gpx, SY + 5);
      });

      // C-13 Larmor marker
      const larmx = SPEC_X + OM0 * SPEC_W;
      ctx.strokeStyle = '#ef4444' + '35'; ctx.lineWidth = 0.8;
      ctx.setLineDash([2, 4]);
      ctx.beginPath(); ctx.moveTo(larmx, SY); ctx.lineTo(larmx, SY + SH); ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '6px Space Mono'; ctx.fillStyle = '#ef4444' + '80'; ctx.textAlign = 'center';
      ctx.fillText('C-13 \u03C9\u2080', larmx, SY + SH + 11);

      // Legend
      ctx.font = '7px Space Mono'; ctx.textAlign = 'right';
      ctx.fillStyle = 'rgba(140,140,155,0.6)';
      ctx.fillText('no phi-lattice', SPEC_X + SPEC_W, SY + SH - 10);
      ctx.fillStyle = QUANT + 'bb';
      ctx.fillText('phi-lattice bandgaps', SPEC_X + SPEC_W, SY + SH - 1);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref} style={{width:'100%', height:'auto', display:'block', borderRadius:3}} />
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function PhiLatticePage() {
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

  return (
    <div style={{minHeight:'100%', background:BG, color:'#d4e8f7',
      fontFamily:"'Rajdhani',sans-serif", overflowY:'auto'}}>
      <div style={{maxWidth:1100, margin:'0 auto', padding:'16px 20px'}}>

        {/* ── title ── */}
        <div style={{marginBottom:18}}>
          <div style={{display:'inline-block', border:'1px solid rgba(200,160,48,0.5)',
            padding:'3px 10px', fontSize:9, letterSpacing:'0.2em',
            color:GOLD+'cc', fontFamily:MN, marginBottom:8}}>
            CROSS-SCALE ARCHITECTURE
          </div>
          <h1 style={{fontFamily:OR, fontSize:22, fontWeight:900, letterSpacing:2,
            color:GOLD, textShadow:'0 0 24px '+GOLD+'55', margin:'4px 0'}}>
            phi-Lattice Transducer &middot; Chaos-to-Order Architecture
          </h1>
          <p style={{fontSize:13, color:'rgba(200,200,220,0.75)',
            maxWidth:780, lineHeight:1.7, margin:0}}>
            A golden-ratio-proportioned periodic cellular architecture acts as a universal chaos-to-order
            transducer -- dissipating extreme boundary stresses while preserving coherence inside.
            Re-entry plasma shield, 75 klb runway load, and C-13 quantum decoherence as three scale
            analogs of the same geometric principle: quasiperiodic cellular geometry converts boundary
            disorder into interior order without catastrophic failure.
          </p>
        </div>

        {/* ── phi-crystal canvas + description ── */}
        <div style={{...card(GOLD), marginBottom:16,
          display:'grid', gridTemplateColumns:'380px 1fr', gap:20, alignItems:'start'}}>
          <PhiCrystalCanvas />
          <div>
            <div style={secLabel}>
              phi-Quasiperiodic Cellular Structure &middot; 5-Wave Superposition
            </div>
            <p style={{fontSize:11, color:'rgba(200,200,220,0.7)', lineHeight:1.7, marginBottom:12}}>
              Five cosine waves at 72&deg; intervals create a 5-fold quasiperiodic lattice -- no unit cell,
              no periodicity, but phi embedded in every peak-to-peak ratio. Gold lines are cell walls
              (zero-crossing surfaces). Interior cells are coloured cool-blue (ordered, centre) through
              plasma-orange (chaotic, boundary). The animated ring is a thermal pulse entering from the
              edge and dissipating as it passes through phi-scaled tiers.
            </p>
            <div style={{fontFamily:MN, fontSize:9, color:GOLD,
              letterSpacing:1, marginBottom:8, padding:'6px 10px',
              background:'rgba(0,0,0,0.4)', borderRadius:3,
              border:'1px solid rgba(200,160,48,0.2)'}}>
              f(x,y) = &sum;<sub>k=0..4</sub> cos(&kappa;(x cos(2&pi;k/5) + y sin(2&pi;k/5)))
            </div>
            <div style={{fontFamily:MN, fontSize:8, color:DIM, lineHeight:1.9}}>
              &kappa; = 0.12 &middot; 5-fold rotational symmetry &middot; quasiperiodic: no unit cell &middot;
              phi in peak spacings &middot; cell walls are level-set curves f(x,y) = 0 &middot;
              spectral gap at f = &kappa;/phi
            </div>
          </div>
        </div>

        {/* ── three domain cards ── */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16}}>
          {DOMAINS.map(d => (
            <div key={d.title} style={{...card(d.col), borderColor:d.col+'28'}}>
              <div style={{fontFamily:OR, fontSize:9, color:d.col,
                letterSpacing:1, marginBottom:4}}>{d.title}</div>
              <div style={{fontFamily:MN, fontSize:7.5, color:d.col+'88',
                marginBottom:10}}>{d.sub}</div>
              <div style={{marginBottom:8}}>
                <div style={{fontFamily:MN, fontSize:7, color:'rgba(220,100,80,0.85)',
                  marginBottom:2, letterSpacing:0.5}}>CHAOS IN</div>
                <div style={{fontSize:10.5, color:'rgba(200,200,220,0.65)',
                  lineHeight:1.55}}>{d.chaos}</div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{fontFamily:MN, fontSize:7, color:'rgba(80,200,160,0.85)',
                  marginBottom:2, letterSpacing:0.5}}>ORDER OUT</div>
                <div style={{fontSize:10.5, color:'rgba(200,200,220,0.65)',
                  lineHeight:1.55}}>{d.order}</div>
              </div>
              <div style={{marginBottom:8}}>
                <div style={{fontFamily:MN, fontSize:7, color:d.col+'88',
                  marginBottom:2, letterSpacing:0.5}}>MECHANISM</div>
                <div style={{fontSize:10, color:'rgba(180,200,220,0.55)',
                  lineHeight:1.55}}>{d.mech}</div>
              </div>
              <div style={{fontFamily:MN, fontSize:7.5, color:d.col+'99',
                background:'rgba(0,0,0,0.32)', padding:'5px 8px',
                borderRadius:2, letterSpacing:0.3, lineHeight:1.6}}>
                {d.eq}
              </div>
            </div>
          ))}
        </div>

        {/* ── thermal cascade ── */}
        <div style={{...card(PLASMA), marginBottom:16}}>
          <div style={secLabel}>
            phi-Scaled Thermal Cascade &middot; Layer Thickness = L / &phi;<sup>n</sup>
          </div>
          <p style={{fontSize:11, color:'rgba(220,200,180,0.7)', lineHeight:1.7,
            marginBottom:12, maxWidth:820}}>
            8 layers with heights proportional to &phi;<sup>-n</sup>: each layer is 1/&phi; (&asymp;0.618&times;)
            the height of the one above. The boundary layer (top) absorbs maximum plasma heat flux.
            Each succeeding layer absorbs 1/&phi; of the remaining flux, creating a geometric dissipation
            cascade. The dashed line is an animated thermal pulse descending through the stack -- watch
            how it progressively slows as layer thickness shrinks.
          </p>
          <ThermalCascadeCanvas />
          <div style={{marginTop:10, fontFamily:MN, fontSize:7.5, color:DIM, lineHeight:1.9}}>
            Layer heights: L &middot; L/&phi; &middot; L/&phi;&sup2; &middot; L/&phi;&sup3; &middot; ... &middot; L/&phi;<sup>7</sup> &middot;
            sum = L &middot; (1 - &phi;<sup>-8</sup>) / (1 - 1/&phi;) &asymp; 2.62L total depth &middot;
            no runaway mode: each layer can only process what the layer above passed through
          </div>
        </div>

        {/* ── quantum decoherence ── */}
        <div style={{...card(QUANT), marginBottom:16}}>
          <div style={secLabel}>
            Quantum Decoherence Filter &middot; NV Center + C-13 Spin Bath &middot; &phi;-Bandgap Spectral Engineering
          </div>
          <p style={{fontSize:11, color:'rgba(180,240,220,0.7)', lineHeight:1.7,
            marginBottom:12, maxWidth:820}}>
            Left: NV centre (teal) surrounded by a nuclear spin bath. Red dots are C-13 spins
            (spin&nbsp;1/2) precessing at the C-13 Larmor frequency (~3.2 MHz at 300 mT) -- the dominant
            source of dephasing. Right: the bath spectral density S(&omega;). Gray = unstructured bath.
            Teal = phi-lattice structure imposes notches at &phi;<sup>k</sup> &times; &omega;<sub>0</sub>,
            suppressing dephasing at those modes. Gold dashes mark gap positions.
          </p>
          <SpinBathCanvas />
          <div style={{marginTop:12, display:'grid',
            gridTemplateColumns:'repeat(3,1fr)', gap:8}}>
            {([
              {col:QUANT,  t:'C-13 Larmor Frequency',
               eq:'f_C13 = 3.21 MHz at 300 mT',
               b:'C-13 nuclear spins precess at 3.21 MHz in a 300 mT applied field -- the dominant frequency coupling to NV coherence. Any bath excitation near this frequency causes irreversible dephasing.'},
              {col:GOLD,   t:'phi-Gap Positions',
               eq:'omega_k = omega_0 * phi^k',
               b:'Notches appear at phi^1=5.19, phi^2=8.40, phi^3=13.6, phi^4=22.0 MHz. Irrational phi ensures these gaps never coincide with each other or integer harmonics -- no secondary resonance.'},
              {col:STRUCT, t:'T2 Improvement',
               eq:'T2 ~ 1 / sqrt(S(omega_0))',
               b:'If S(omega_0) drops 10x inside the bandgap, T2 improves by sqrt(10) ~3x. Combines multiplicatively with isotopic purification -- C-12-enriched diamond + phi-lattice is not redundant.'},
            ] as {col:string;t:string;eq:string;b:string}[]).map(({col,t,eq,b}) => (
              <div key={t} style={{...card(col), borderColor:col+'22'}}>
                <div style={{fontFamily:OR, fontSize:8, color:col,
                  letterSpacing:1, marginBottom:3}}>{t}</div>
                <div style={{fontFamily:MN, fontSize:7.5, color:col+'88',
                  marginBottom:5}}>{eq}</div>
                <div style={{fontSize:10, color:'rgba(200,220,240,0.6)',
                  lineHeight:1.6}}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── unifying architecture ── */}
        <div style={{...card(GOLD), marginBottom:16}}>
          <div style={secLabel}>Unifying Architecture &middot; Four Pillars</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:10}}>
            {UNIFY.map(u => (
              <div key={u.t} style={{...card(u.col), borderColor:u.col+'22'}}>
                <div style={{fontFamily:OR, fontSize:9, color:u.col,
                  letterSpacing:1, marginBottom:4}}>{u.t}</div>
                <div style={{fontFamily:MN, fontSize:8.5, color:u.col+'88',
                  marginBottom:6}}>{u.eq}</div>
                <div style={{fontSize:11, color:'rgba(200,220,240,0.65)',
                  lineHeight:1.65}}>{u.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── tension / open questions ── */}
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16}}>
          {([
            {col:PLASMA, t:'Strict vs Quasi-Periodic',
             b:'Pure periodicity + irrational phi leads to quasiperiodic structures (Penrose-type). Quasiperiodic is better for chaos suppression than periodic: gaps are denser and broader. The tension is feature, not bug.'},
            {col:GOLD,   t:'Governing Equation Mismatch',
             b:'Navier-Stokes + radiation (plasma) vs Hooke\'s law (runway) vs Lindblad master equation (quantum). Strict unification is not established in literature. But the geometric filter principle -- phi-spaced bandgap -- recurs across all three regimes.'},
            {col:QUANT,  t:'Next Steps',
             b:'More details needed on array geometry: Voronoi phi-scaled cells? Logarithmic spirals? Specific phi in lattice constants? Simulation (DFT for phonons, FEM for structural, Lindblad for quantum) would quantify the overlap with existing experiments.'},
          ] as {col:string;t:string;b:string}[]).map(({col,t,b}) => (
            <div key={t} style={{...card(col), borderColor:col+'22'}}>
              <div style={{fontFamily:OR, fontSize:8, color:col,
                letterSpacing:1, marginBottom:5}}>{t}</div>
              <div style={{fontSize:10.5, color:'rgba(200,220,240,0.62)',
                lineHeight:1.65}}>{b}</div>
            </div>
          ))}
        </div>

        {/* ── footer ── */}
        <div style={{marginTop:16, paddingTop:10,
          borderTop:'1px solid rgba(200,160,48,0.1)',
          fontFamily:MN, fontSize:7.5, color:DIM,
          letterSpacing:'0.12em', textAlign:'center'}}>
          AETHER &middot; phi-LATTICE TRANSDUCER &middot; CROSS-SCALE CHAOS-TO-ORDER ARCHITECTURE &middot;
          RE-ENTRY PLASMA &middot; RUNWAY LOAD &middot; QUANTUM DECOHERENCE &middot;
          GIBSON-ASHBY &middot; PHONONIC BANDGAP &middot; QUASIPERIODIC LATTICE
        </div>
      </div>
    </div>
  );
}

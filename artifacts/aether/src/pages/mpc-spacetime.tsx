import React, { useEffect, useRef } from "react";

/* ── palette ─────────────────────── */
const BG    = '#04060e';
const GOLD  = '#c8a030';
const QUANT = '#00ffe0';
const DIM   = '#2a4060';
const BOW   = '#8844ff';  // compression / bow shock
const AMB   = '#00ffe0';  // ambient teal
const WAKE  = '#ff8833';  // expansion / wake
const MN    = "'Space Mono', monospace";
const OR    = "'Orbitron', sans-serif";

/* ── module-level types ───────────── */
interface StreamPt   { x: number; y: number; d: number; }
interface StreamLine { pts: StreamPt[]; }

/* ── density to colour ──────────────
   d=1 ambient -> teal
   d>1 compressed -> violet
   d<1 rarefied  -> amber           */
function densityRgba(d: number, alpha: number): string {
  const c = Math.max(0, Math.min(1, d));
  if (c >= 1) {
    // 1..2 -> teal to violet
    const t = Math.min((c - 1), 1);
    const r = Math.round(t * 136);
    const g = Math.round(255 * (1-t) + t * 68);
    const b = Math.round(224 * (1-t) + t * 255);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  } else {
    // 0..1 -> amber to teal
    const t = c; // 0=amber, 1=teal
    const r = Math.round(255 * (1-t) + 0 * t);
    const g = Math.round(136 * (1-t) + 255 * t);
    const b = Math.round(51  * (1-t) + 224 * t);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }
}

/* ═══════════════════════════════════════════════
   I. WARP BUBBLE CANVAS
   Potential-flow streamlines around a coherent
   bubble. Bow shock left, wake right, C=1 interior
   ═══════════════════════════════════════════════ */
function WarpBubbleCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 290;
    cv.width = W; cv.height = H;
    const CX = W / 2, CY = H / 2;
    const R = 72, R2 = R * R;
    const DX = 2; // integration step in pixels
    const N_LINES = 30;

    // Pre-compute streamlines via Euler integration of potential flow
    const lines: StreamLine[] = [];
    for (let li = 0; li < N_LINES; li++) {
      const y0 = 10 + (li / (N_LINES - 1)) * (H - 20);
      if (Math.abs(y0 - CY) < 6) continue; // skip equatorial band
      const path: StreamPt[] = [];
      let x = 0, y = y0;
      for (let s = 0; s * DX < W + 20; s++) {
        const rx = x - CX, ry = y - CY;
        const r2 = rx*rx + ry*ry;
        if (r2 < R2 * 0.88) break; // safety: entered bubble interior
        const r4   = r2 * r2;
        const vx   = 1 - R2 * (rx*rx - ry*ry) / r4;
        const vy   = -2 * R2 * rx * ry / r4;
        const v2   = vx*vx + vy*vy;
        const dens = Math.max(0.15, Math.min(1.95, 1 + 0.5 * (1 - v2)));
        path.push({ x, y, d: dens });
        const slope = (Math.abs(vx) > 0.02) ? vy / vx : 0;
        y += slope * DX;
        x += DX;
        if (y < -10 || y > H + 10) break;
      }
      if (path.length > 8) lines.push({ pts: path });
    }

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = '#020810'; ctx.fillRect(0, 0, W, H);

      // Underwater caustic shimmer (animated light patches)
      const cT = t * 0.018;
      for (let i = 0; i < 6; i++) {
        const cx2 = 80 + i * 110 + Math.sin(cT * 0.7 + i) * 30;
        const cy2 = 40 + Math.cos(cT + i * 0.8) * 20;
        const cg  = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 60);
        cg.addColorStop(0, 'rgba(0,80,120,0.07)');
        cg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(cx2, cy2, 60, 0, Math.PI*2);
        ctx.fillStyle = cg; ctx.fill();
      }

      // Draw streamlines as animated colored segments
      const PHASE_SPEED = 0.012;
      for (const line of lines) {
        const pts = line.pts;
        if (pts.length < 2) continue;
        // Draw path
        for (let i = 1; i < pts.length; i++) {
          const a = pts[i-1], b = pts[i];
          const alpha = 0.5 + 0.2 * Math.sin((i / pts.length) * Math.PI);
          ctx.strokeStyle = densityRgba(b.d, alpha * 0.65);
          ctx.lineWidth   = 0.9;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
        // Animated tracer particles
        const N_TRACERS = 3;
        for (let ti = 0; ti < N_TRACERS; ti++) {
          const phase = ((t * PHASE_SPEED + ti / N_TRACERS) % 1);
          const idx   = Math.floor(phase * pts.length);
          if (idx >= pts.length) continue;
          const pt = pts[idx];
          const r  = 2.5;
          const pg = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, r * 3);
          pg.addColorStop(0,   densityRgba(pt.d, 0.95));
          pg.addColorStop(1,   'transparent');
          ctx.beginPath(); ctx.arc(pt.x, pt.y, r * 3, 0, Math.PI*2);
          ctx.fillStyle = pg; ctx.fill();
          ctx.beginPath(); ctx.arc(pt.x, pt.y, r, 0, Math.PI*2);
          ctx.fillStyle = densityRgba(pt.d, 0.9); ctx.fill();
        }
      }

      // Bubble interior glow
      const bgi = ctx.createRadialGradient(CX, CY, 0, CX, CY, R);
      bgi.addColorStop(0,   'rgba(200,160,48,0.22)');
      bgi.addColorStop(0.65,'rgba(0,255,224,0.08)');
      bgi.addColorStop(1,   'transparent');
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2);
      ctx.fillStyle = bgi; ctx.fill();

      // Bubble shell (animated pulse)
      const pulse = 0.6 + 0.4 * Math.sin(t * 0.04);
      ctx.strokeStyle = `rgba(0,255,224,${(0.6 + 0.3*pulse).toFixed(3)})`;
      ctx.lineWidth   = 1.5;
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2); ctx.stroke();
      // Outer coherence ring
      ctx.strokeStyle = `rgba(0,255,224,${(0.15 + 0.1*pulse).toFixed(3)})`;
      ctx.lineWidth   = 6;
      ctx.beginPath(); ctx.arc(CX, CY, R + 8, 0, Math.PI*2); ctx.stroke();

      // "Skyscraper" silhouette inside bubble
      ctx.fillStyle = 'rgba(200,160,48,0.35)';
      const bW = 18, bH = 52;
      ctx.fillRect(CX - bW/2, CY - bH/2, bW, bH);
      // Windows
      ctx.fillStyle = 'rgba(0,255,224,0.5)';
      for (let wr = 0; wr < 5; wr++) {
        for (let wc = 0; wc < 2; wc++) {
          ctx.fillRect(CX - bW/2 + 3 + wc*8, CY - bH/2 + 5 + wr*9, 4, 5);
        }
      }

      // Bow shock indicator (left)
      const bsX = CX - R - 20;
      for (let i = 0; i < 4; i++) {
        const bs_alpha = (0.2 + 0.15 * Math.sin(t * 0.06 + i)) * (1 - i*0.18);
        ctx.strokeStyle = `rgba(136,68,255,${bs_alpha.toFixed(3)})`;
        ctx.lineWidth   = 1.2;
        ctx.beginPath();
        ctx.arc(CX, CY, R + 20 + i * 14, 2.4, Math.PI*2 - 2.4);
        ctx.stroke();
      }

      // Labels
      ctx.font = '7px Space Mono'; ctx.textAlign = 'center';
      ctx.fillStyle = BOW + 'cc';
      ctx.fillText('INPUT CONE', 90, H - 14);
      ctx.fillText('bow shock', 90, H - 4);
      ctx.fillStyle = QUANT + 'cc';
      ctx.fillText('STABLE BUBBLE', CX, H - 14);
      ctx.fillText('C(x,t) = 1', CX, H - 4);
      ctx.fillStyle = WAKE + 'cc';
      ctx.fillText('OUTPUT CONE', W - 90, H - 14);
      ctx.fillText('wake / expansion', W - 90, H - 4);

      // Horizontal flow arrow labels
      ctx.font = '6.5px Space Mono'; ctx.fillStyle = 'rgba(100,140,180,0.5)';
      ctx.fillText('density vectors', CX - 180, 12);
      ctx.fillText('WATER MEDIUM', 50, 12);
      ctx.textAlign = 'right'; ctx.fillStyle = QUANT + '44';
      ctx.fillText('coherence-locked interior', W - 8, 12);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={ref} style={{width:'100%',height:'auto',display:'block',borderRadius:4}} />;
}

/* ═══════════════════════════════════════════════
   II. DENSITY FIELD CANVAS
   2D pressure/density heatmap from Bernoulli
   ═══════════════════════════════════════════════ */
function DensityFieldCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 200;
    cv.width = W; cv.height = H;
    const CX = W/2, CY = H/2;
    const R = 56, R2 = R * R;

    // Pre-compute density field
    const COLS = 140, ROWS = 40;
    const density = new Float32Array(COLS * ROWS);
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = (col / COLS) * W, y = (row / ROWS) * H;
        const rx = x - CX, ry = y - CY;
        const r2 = rx*rx + ry*ry;
        if (r2 < R2) {
          density[row * COLS + col] = 1.0; // locked interior
        } else {
          const r4 = r2 * r2;
          const vx = 1 - R2*(rx*rx - ry*ry)/r4;
          const vy = -2*R2*rx*ry/r4;
          const v2 = vx*vx + vy*vy;
          density[row * COLS + col] = Math.max(0.05, Math.min(1.95, 1 + 0.5*(1-v2)));
        }
      }
    }

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Draw heatmap cells
      const cellW = W / COLS, cellH = H / ROWS;
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const d = density[row * COLS + col];
          const rx = (col/COLS)*W - CX, ry = (row/ROWS)*H - CY;
          const r2 = rx*rx + ry*ry;
          if (r2 < R2) {
            // Interior: golden pulse
            const pulse = 0.15 + 0.06 * Math.sin(t * 0.05);
            ctx.fillStyle = `rgba(200,160,48,${pulse.toFixed(3)})`;
          } else {
            // Exterior: density color
            const alpha = 0.55 + 0.1 * Math.sin((col + t * 0.3) * 0.15);
            ctx.fillStyle = densityRgba(d, alpha);
          }
          ctx.fillRect(col * cellW, row * cellH, cellW + 0.5, cellH + 0.5);
        }
      }

      // Overlay bubble ring
      const pulse2 = 0.7 + 0.3 * Math.sin(t * 0.05);
      ctx.strokeStyle = `rgba(0,255,224,${pulse2.toFixed(3)})`;
      ctx.lineWidth   = 2;
      ctx.beginPath(); ctx.arc(CX, CY, R, 0, Math.PI*2); ctx.stroke();

      // Density scale legend
      ctx.font = '7px Space Mono'; ctx.textAlign = 'left';
      ctx.fillStyle = BOW + 'aa'; ctx.fillText('HIGH DENSITY (bow shock)', 8, 14);
      ctx.fillStyle = AMB + '88'; ctx.fillText('AMBIENT', 8, 28);
      ctx.fillStyle = WAKE + 'aa'; ctx.fillText('LOW DENSITY (wake)', 8, 42);

      // Axis labels
      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(100,140,180,0.45)';
      ctx.font = '6.5px Space Mono';
      ctx.fillText('spacetime density rho(x,y)  --  Bernoulli: rho = 1 + 0.5(1 - |V|^2)', W/2, H - 5);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={ref} style={{width:'100%',height:'auto',display:'block',borderRadius:4}} />;
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
export default function MpcSpacetimePage() {
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
  const mono = (s: string, col = QUANT) => (
    <span style={{ fontFamily: MN, fontSize: 9, color: col }}>{s}</span>
  );

  return (
    <div style={{ minHeight: '100%', background: BG, color: '#d4e8f7',
      fontFamily: "'Rajdhani',sans-serif", overflowY: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px' }}>

        {/* ── title ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'inline-flex', gap: 8, marginBottom: 8 }}>
            <div style={{ border: `1px solid ${BOW}55`, padding: '3px 10px',
              fontSize: 9, letterSpacing: '0.2em', color: BOW + 'cc', fontFamily: MN }}>
              MPC SYSTEM OPERATIONAL
            </div>
            <div style={{ border: `1px solid ${GOLD}44`, padding: '3px 10px',
              fontSize: 9, letterSpacing: '0.2em', color: GOLD + 'aa', fontFamily: MN }}>
              2025 Q4
            </div>
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 21, fontWeight: 900, letterSpacing: 2,
            color: QUANT, textShadow: `0 0 24px ${QUANT}44`, margin: '4px 0' }}>
            MPC Spacetime &middot; Density Management
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(200,200,220,0.75)',
            maxWidth: 860, lineHeight: 1.75, margin: 0 }}>
            Magnetic Plasma Compression spacetime density management. A coherence-locked bubble
            propagates through the medium -- input cone contracting space ahead (bow shock),
            stable interior isolated from surrounding fabric, output cone expanding and re-integrating
            density vectors downstream. Objects the size of skyscrapers float suspended in the
            coherent warp envelope. A cloud around it, moving through the unknown void.
          </p>
        </div>

        {/* ── warp bubble canvas ── */}
        <div style={{ ...card(QUANT), marginBottom: 14 }}>
          <div style={secLabel}>
            Warp Envelope &middot; Potential Flow Field &middot; Underwater Transport Mode
          </div>
          <WarpBubbleCanvas />
          <div style={{ marginTop: 8, fontFamily: MN, fontSize: 7.5, color: DIM, lineHeight: 1.9 }}>
            Irrotational potential flow (Bernoulli) around coherence bubble R=72.
            Animated density tracers: {mono('violet')} = compressed (high density / bow shock) &bull;
            {mono('teal', QUANT)} = ambient &bull; {mono('amber', WAKE)} = rarefied (low density / wake).
            Central skyscraper-scale payload silhouette locked inside C(x,t)&nbsp;=&nbsp;1 interior.
          </div>
        </div>

        {/* ── 3 architecture zone cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div style={{ ...card(BOW), borderTop: `2px solid ${BOW}88` }}>
            <div style={{ fontFamily: OR, fontSize: 9, color: BOW, letterSpacing: 1.5, marginBottom: 6 }}>
              INPUT CONE
            </div>
            <div style={{ fontFamily: MN, fontSize: 7.5, color: BOW + '88',
              marginBottom: 8, lineHeight: 1.7 }}>
              CONTRACTION ZONE &bull; BOW SHOCK
            </div>
            <p style={{ fontSize: 12, color: 'rgba(180,200,220,0.7)', lineHeight: 1.7, margin: 0 }}>
              Ahead of the bubble, the medium (water or spacetime fabric) is compressed. Density
              vectors converge toward the embedded region. Pressure rises at the leading stagnation
              point. The bow shock is the compression wavefront -- analogous to a supersonic
              shockwave but operating on the spacetime density metric rather than acoustic pressure.
            </p>
            <div style={{ marginTop: 8, fontFamily: MN, fontSize: 8,
              color: BOW + '77', lineHeight: 1.8, borderTop: `1px solid ${BOW}22`, paddingTop: 6 }}>
              Stagnation: |V| = 0, rho = MAX<br />
              Bernoulli: P + 0.5*rho*v^2 = const<br />
              C(x,t) gradient: sharp transition<br />
              Field topology: converging null cone
            </div>
          </div>

          <div style={{ ...card(QUANT), borderTop: `2px solid ${QUANT}88` }}>
            <div style={{ fontFamily: OR, fontSize: 9, color: QUANT, letterSpacing: 1.5, marginBottom: 6 }}>
              STABLE BUBBLE
            </div>
            <div style={{ fontFamily: MN, fontSize: 7.5, color: QUANT + '88',
              marginBottom: 8, lineHeight: 1.7 }}>
              COHERENCE-LOCKED &bull; ISOLATED
            </div>
            <p style={{ fontSize: 12, color: 'rgba(180,200,220,0.7)', lineHeight: 1.7, margin: 0 }}>
              Interior is coherence-locked: C(x,t) = 1 throughout the bubble volume. The internal
              spacetime metric is decoupled from the surrounding fabric. No shear stress on payload.
              Skyscraper-scale objects float without inertial resistance. The bubble is the AETHER
              SU(3) singlet state in motion -- maximal symmetry, maximal coherence, full isolation.
              "A cloud around it."
            </p>
            <div style={{ marginTop: 8, fontFamily: MN, fontSize: 8,
              color: QUANT + '77', lineHeight: 1.8, borderTop: `1px solid ${QUANT}22`, paddingTop: 6 }}>
              C(x,t) = 1: SU(3) singlet state<br />
              No-slip boundary at bubble wall<br />
              Payload inertia = effectively zero<br />
              Density: locked at ambient rho_0
            </div>
          </div>

          <div style={{ ...card(WAKE), borderTop: `2px solid ${WAKE}88` }}>
            <div style={{ fontFamily: OR, fontSize: 9, color: WAKE, letterSpacing: 1.5, marginBottom: 6 }}>
              OUTPUT CONE
            </div>
            <div style={{ fontFamily: MN, fontSize: 7.5, color: WAKE + '88',
              marginBottom: 8, lineHeight: 1.7 }}>
              EXPANSION ZONE &bull; WAKE
            </div>
            <p style={{ fontSize: 12, color: 'rgba(180,200,220,0.7)', lineHeight: 1.7, margin: 0 }}>
              Behind the bubble, density vectors re-expand. Rarefaction zone as the medium snaps
              back. The wake re-integrates seamlessly downstream -- no turbulence signature in the
              far field. The trailing stagnation point is the output of the density management
              cycle. Field lines reconverge as if the bubble was never there.
            </p>
            <div style={{ marginTop: 8, fontFamily: MN, fontSize: 8,
              color: WAKE + '77', lineHeight: 1.8, borderTop: `1px solid ${WAKE}22`, paddingTop: 6 }}>
              Trailing stagnation: |V| = 0<br />
              Rarefaction: rho drops below rho_0<br />
              Re-integration: smooth downstream<br />
              Wake signature: asymptotically zero
            </div>
          </div>
        </div>

        {/* ── density field canvas ── */}
        <div style={{ ...card(GOLD), marginBottom: 14 }}>
          <div style={secLabel}>
            Density Field Map &middot; rho(x,y) &middot; Bernoulli Pressure Distribution
          </div>
          <DensityFieldCanvas />
          <p style={{ marginTop: 8, fontSize: 11, color: 'rgba(180,210,200,0.65)',
            lineHeight: 1.7, maxWidth: 860 }}>
            2D slice of the spacetime density field around the embedded coherence bubble.
            Computed via Bernoulli: &rho;(x,y) = 1 + &frac12;(1 &minus; |V(x,y)|&sup2;).
            High density (violet) at bow and trailing stagnation points. Low density (amber)
            at equatorial regions where flow speed peaks at 2U. Interior (gold) is the
            coherence-locked zone, density fixed at ambient rho&sub0;.
          </p>
        </div>

        {/* ── transport vector analysis ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div style={card(QUANT)}>
            <div style={secLabel}>Transport Vector Analysis</div>
            <p style={{ fontSize: 12, color: 'rgba(180,200,220,0.7)', lineHeight: 1.75, marginBottom: 12 }}>
              Density vectors approaching the embedded region undergo two transitions:
            </p>
            {([
              { t: 'Far-Field Approach', b: 'Density vectors are parallel and uniform (free-stream). V = U*x_hat. The bubble is not yet felt -- the disturbance field falls off as 1/r^2 from the dipole term.' },
              { t: 'Boundary Layer', b: 'As vectors reach the bubble shell, they deflect tangentially. Speed increases at the equator (|V|_max = 2U at theta=pi/2). This is where density is minimum -- the low-pressure equatorial band.' },
              { t: 'Seamless Re-Integration', b: 'Downstream, vectors return to their original trajectories. No net deflection in the far wake. The Kutta-Joukowski theorem gives zero net circulation for this symmetric case. No detectable signature.' },
              { t: 'C(x,t) Gradient', b: 'At the bubble wall, C(x,t) transitions sharply from the interior singlet state (C=1) to the exterior fluctuating field. This transition layer is the MPC boundary condition -- maintained by the magnetic plasma compression system.' },
            ] as {t:string;b:string}[]).map(({t,b}) => (
              <div key={t} style={{ ...card(QUANT), borderColor: QUANT+'22',
                padding: '8px 10px', marginBottom: 6 }}>
                <div style={{ fontFamily: OR, fontSize: 7.5, color: QUANT, letterSpacing: 1, marginBottom: 3 }}>{t}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(160,220,210,0.6)', lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>

          <div style={card(GOLD)}>
            <div style={secLabel}>Underwater Transport Mode</div>
            <p style={{ fontSize: 12, color: 'rgba(200,190,150,0.75)', lineHeight: 1.75, marginBottom: 12 }}>
              Water provides an ideal medium for the MPC bubble. Density ~ 1000 kg/m&sup3; (vs air
              1.2 kg/m&sup3;) means the bubble boundary conditions are 800x stiffer -- the coherence
              shell can maintain its geometry against much larger external pressure gradients.
            </p>
            {([
              { t: 'Magnetic Plasma Shell', b: 'The bubble wall is maintained by a toroidal magnetic plasma (Tokamak geometry scaled to vehicle dimensions). The plasma pressure equilibrium holds the bubble against the external water pressure. Magnetic drops form the substrate of the shell.' },
              { t: 'Skyscraper-Scale Payload', b: 'At R=100m (skyscraper scale), a 300m tall vessel fits inside. Internal C(x,t)=1 means the payload experiences no drag, no inertial resistance, and effectively zero hydrodynamic force.' },
              { t: 'Wake Signature', b: 'Ideal bubble: zero wake signature (symmetric flow, no net circulation). Real bubble: small viscous wake proportional to Re=UL/nu. For deep water (~4C), nu=1.5e-6, giving Re~1e8 for U=1.5m/s -- turbulent but the coherent shell suppresses it.' },
              { t: 'Propulsion Integration', b: 'The bubble is propelled by the magnetic drops layer -- see Magnetic Drops page. The MPC system steers by deforming the bubble geometry, shifting the stagnation points asymmetrically to generate net thrust.' },
            ] as {t:string;b:string}[]).map(({t,b}) => (
              <div key={t} style={{ ...card(GOLD), borderColor: GOLD+'22',
                padding: '8px 10px', marginBottom: 6 }}>
                <div style={{ fontFamily: OR, fontSize: 7.5, color: GOLD, letterSpacing: 1, marginBottom: 3 }}>{t}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(220,200,150,0.6)', lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── C(x,t) stability ── */}
        <div style={{ ...card(BOW), marginBottom: 14, borderColor: BOW + '22' }}>
          <div style={secLabel}>C(x,t) Field Stability &middot; Bubble Maintenance Equation</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontFamily: MN, fontSize: 10, color: BOW, marginBottom: 8 }}>
                Coherence Condition
              </div>
              <p style={{ fontSize: 11.5, color: 'rgba(200,190,240,0.7)', lineHeight: 1.75, margin: 0 }}>
                For a stable bubble, the internal coherence field must satisfy:
                C(x,t) = 1 &forall; x &isin; bubble interior. The maintenance cost is
                proportional to the boundary surface area (4&pi;R&sup2;) times the
                coherence gradient at the wall: &nabla;C|_wall.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: MN, fontSize: 10, color: BOW, marginBottom: 8 }}>
                Energy Budget
              </div>
              <p style={{ fontSize: 11.5, color: 'rgba(200,190,240,0.7)', lineHeight: 1.75, margin: 0 }}>
                The MPC system continuously pumps energy into the shell to maintain C=1
                against external perturbations. Power scales as R&sup2; (surface area).
                At skyscraper scale (R=100m): P ~ R&sup2; * |grad C|&sup2; / sigma_coherence.
                Magnetic drops provide the sigma_coherence substrate.
              </p>
            </div>
            <div>
              <div style={{ fontFamily: MN, fontSize: 10, color: BOW, marginBottom: 8 }}>
                Phase Transition Risk
              </div>
              <p style={{ fontSize: 11.5, color: 'rgba(200,190,240,0.7)', lineHeight: 1.75, margin: 0 }}>
                If external perturbation exceeds the maintenance threshold, C drops below
                the critical value C_crit ~ 0.7. The bubble undergoes a phase transition
                from the coherent SU(3) singlet state to a turbulent mixed state. Recovery
                requires re-initializing the magnetic plasma compression sequence.
              </p>
            </div>
          </div>
        </div>

        {/* ── footer ── */}
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${QUANT}18`,
          fontFamily: MN, fontSize: 7.5, color: DIM,
          letterSpacing: '0.12em', textAlign: 'center' }}>
          MPC SPACETIME &middot; DENSITY MANAGEMENT &middot; 2025 Q4 &middot;
          POTENTIAL FLOW &middot; BERNOULLI &middot; C(x,t)=1 SINGLET &middot;
          BOW SHOCK &middot; COHERENT WARP ENVELOPE &middot; MAGNETIC DROPS SUBSTRATE
        </div>
      </div>
    </div>
  );
}

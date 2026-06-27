import React, { useEffect, useRef } from "react";

/* ── palette ─────────────────────── */
const BG    = '#04060e';
const GOLD  = '#c8a030';
const QUANT = '#00ffe0';
const DIM   = '#2a4060';
const MAG   = '#cc44ff';
const IRON  = '#ff6644';
const FIELD = '#4488ff';
const MN    = "'Space Mono', monospace";
const OR    = "'Orbitron', sans-serif";

/* ── module-level types ───────────── */
interface Drop {
  x: number; y: number;
  vx: number; vy: number;
  mx: number; my: number;
  phase: number;
}

interface FieldArrow {
  x: number; y: number; ax: number; ay: number; mag: number;
}

/* ── dipole B-field at (px,py) from source at (sx,sy) with moment (mx,my) ── */
function dipoleField(
  px: number, py: number,
  sx: number, sy: number,
  mx: number, my: number
): [number, number] {
  const rx = px - sx, ry = py - sy;
  const r2 = rx*rx + ry*ry;
  if (r2 < 1) return [0, 0];
  const r       = Math.sqrt(r2);
  const rn      = 1 / r2;
  const mdotr   = mx * rx/r + my * ry/r;
  const Bx      = (3 * mdotr * rx/r - mx) * rn / r;
  const By      = (3 * mdotr * ry/r - my) * rn / r;
  return [Bx, By];
}

/* ═══════════════════════════════════════════════
   I. FERROFLUID DROP FIELD CANVAS
   ═══════════════════════════════════════════════ */
function DropFieldCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 270;
    cv.width = W; cv.height = H;

    const N_DROPS = 14;
    const DAMP    = 0.91;
    const drops: Drop[] = [];

    for (let i = 0; i < N_DROPS; i++) {
      const col = i % 7, row = Math.floor(i / 7);
      drops.push({
        x: 80 + col * 82 + (Math.random() - 0.5) * 18,
        y: 80 + row * 100 + (Math.random() - 0.5) * 18,
        vx: 0, vy: 0,
        mx: Math.cos(i * 0.8),
        my: Math.sin(i * 0.8),
        phase: i * 0.45,
      });
    }

    const arrowGrid: FieldArrow[] = [];
    const GA = 20;
    for (let ax = GA; ax < W; ax += GA*2) {
      for (let ay = GA; ay < H; ay += GA*2) {
        arrowGrid.push({ x: ax, y: ay, ax: 0, ay: 0, mag: 0 });
      }
    }

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const globalAngle = t * 0.008;
      const globalMx = Math.cos(globalAngle);
      const globalMy = Math.sin(globalAngle);

      for (let i = 0; i < N_DROPS; i++) {
        const d = drops[i];
        const targetAngle = globalAngle + d.phase * 0.3;
        const tm = Math.cos(targetAngle), tn = Math.sin(targetAngle);
        d.mx += (tm - d.mx) * 0.015;
        d.my += (tn - d.my) * 0.015;
        const mLen = Math.sqrt(d.mx*d.mx + d.my*d.my) || 1;
        d.mx /= mLen; d.my /= mLen;
      }

      for (let i = 0; i < N_DROPS; i++) {
        const di = drops[i];
        let fx = 0, fy = 0;
        for (let j = 0; j < N_DROPS; j++) {
          if (i === j) continue;
          const dj = drops[j];
          const rx = di.x - dj.x, ry = di.y - dj.y;
          const r2 = rx*rx + ry*ry;
          if (r2 < 4 || r2 > 10000) continue;
          const r  = Math.sqrt(r2);
          const rn = rx/r, yn2 = ry/r;
          const mi_dot_r  = di.mx*rn + di.my*yn2;
          const mj_dot_r  = dj.mx*rn + dj.my*yn2;
          const mi_dot_mj = di.mx*dj.mx + di.my*dj.my;
          const scale = 800 / (r2 * r2);
          fx += scale * (mi_dot_r*dj.mx + mj_dot_r*di.mx + mi_dot_mj*rn - 5*mi_dot_r*mj_dot_r*rn);
          fy += scale * (mi_dot_r*dj.my + mj_dot_r*di.my + mi_dot_mj*yn2 - 5*mi_dot_r*mj_dot_r*yn2);
          if (r2 < 900) {
            const rep = 15000 / (r2 * r2);
            fx += rep * rn; fy += rep * yn2;
          }
        }
        const WM = 30;
        if (di.x < WM)   fx += (WM - di.x) * 2;
        if (di.x > W-WM) fx -= (di.x - (W-WM)) * 2;
        if (di.y < WM)   fy += (WM - di.y) * 2;
        if (di.y > H-WM) fy -= (di.y - (H-WM)) * 2;

        di.vx = (di.vx + fx * 0.0002) * DAMP;
        di.vy = (di.vy + fy * 0.0002) * DAMP;
        const spd = Math.sqrt(di.vx*di.vx + di.vy*di.vy);
        if (spd > 1.5) { di.vx *= 1.5/spd; di.vy *= 1.5/spd; }
        di.x += di.vx; di.y += di.vy;
      }

      for (const a of arrowGrid) {
        let bx = globalMx * 0.003, by = globalMy * 0.003;
        for (const d of drops) {
          const [dx, dy] = dipoleField(a.x, a.y, d.x, d.y, d.mx, d.my);
          bx += dx * 0.15; by += dy * 0.15;
        }
        a.ax = bx; a.ay = by;
        a.mag = Math.sqrt(bx*bx + by*by);
      }

      const maxMag = Math.max(...arrowGrid.map(a => a.mag), 0.001);
      for (const a of arrowGrid) {
        if (a.mag < 0.0001) continue;
        const norm  = a.mag / maxMag;
        const alpha = norm * 0.4;
        const len   = 8 * norm + 2;
        const nx    = a.ax / a.mag, ny2 = a.ay / a.mag;
        ctx.strokeStyle = `rgba(68,136,255,${alpha.toFixed(3)})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(a.x - nx*len/2, a.y - ny2*len/2);
        ctx.lineTo(a.x + nx*len/2, a.y + ny2*len/2);
        ctx.stroke();
        const hw = 2, hl = 3;
        const px2 = a.x + nx*len/2, py2 = a.y + ny2*len/2;
        ctx.beginPath();
        ctx.moveTo(px2, py2);
        ctx.lineTo(px2 - nx*hl + ny2*hw, py2 - ny2*hl - nx*hw);
        ctx.lineTo(px2 - nx*hl - ny2*hw, py2 - ny2*hl + nx*hw);
        ctx.closePath();
        ctx.fillStyle = `rgba(68,136,255,${Math.min(alpha*1.5, 0.6).toFixed(3)})`;
        ctx.fill();
      }

      for (let i = 0; i < N_DROPS; i++) {
        const di = drops[i];
        for (let j = i+1; j < N_DROPS; j++) {
          const dj = drops[j];
          const rx = dj.x - di.x, ry = dj.y - di.y;
          const r2 = rx*rx + ry*ry;
          if (r2 > 7000) continue;
          const mi_dot_mj = di.mx*dj.mx + di.my*dj.my;
          if (mi_dot_mj < 0.3) continue;
          const alpha = mi_dot_mj * 0.25 * (1 - Math.sqrt(r2)/85);
          if (alpha < 0.02) continue;
          ctx.strokeStyle = `rgba(204,68,255,${alpha.toFixed(3)})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath(); ctx.moveTo(di.x, di.y); ctx.lineTo(dj.x, dj.y); ctx.stroke();
        }
      }

      for (const d of drops) {
        const fg = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, 18);
        fg.addColorStop(0, 'rgba(204,68,255,0.18)');
        fg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(d.x, d.y, 18, 0, Math.PI*2);
        ctx.fillStyle = fg; ctx.fill();

        const dg = ctx.createRadialGradient(d.x - 2, d.y - 2, 1, d.x, d.y, 9);
        dg.addColorStop(0, '#ffeecc');
        dg.addColorStop(0.4, IRON);
        dg.addColorStop(1, '#220800');
        ctx.beginPath(); ctx.arc(d.x, d.y, 9, 0, Math.PI*2);
        ctx.fillStyle = dg; ctx.fill();

        const plen = 13;
        const nx = d.mx, ny2 = d.my;
        ctx.beginPath(); ctx.arc(d.x + nx*plen, d.y + ny2*plen, 3, 0, Math.PI*2);
        ctx.fillStyle = '#4488ff'; ctx.fill();
        ctx.beginPath(); ctx.arc(d.x - nx*plen, d.y - ny2*plen, 3, 0, Math.PI*2);
        ctx.fillStyle = '#ff4422'; ctx.fill();
        ctx.strokeStyle = 'rgba(200,160,48,0.5)'; ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(d.x - nx*plen, d.y - ny2*plen);
        ctx.lineTo(d.x + nx*plen, d.y + ny2*plen);
        ctx.stroke();
      }

      ctx.font = '7px Space Mono'; ctx.textAlign = 'left';
      ctx.fillStyle = MAG + '88';
      ctx.fillText('magnetic moment coupling lines (aligned pairs)', 8, H - 16);
      ctx.fillStyle = FIELD + '88';
      ctx.fillText('B-field arrows -- superposition of all dipoles', 8, H - 5);
      ctx.textAlign = 'right'; ctx.fillStyle = IRON + '88';
      ctx.fillText('N-pole blue  /  S-pole red', W - 8, H - 5);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={ref} style={{width:'100%',height:'auto',display:'block',borderRadius:4}} />;
}

/* ═══════════════════════════════════════════════
   II. PROPULSION WAVE CANVAS
   ═══════════════════════════════════════════════ */
function PropulsionWaveCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 200;
    cv.width = W; cv.height = H;

    const N_COLS = 18, N_ROWS = 4;
    const CELL_W = (W - 60) / N_COLS;
    const CELL_H = (H - 60) / N_ROWS;
    const OX = 30, OY = 30;

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const WAVE_SPEED = 0.04;
      const PERIOD     = N_COLS;

      for (let row = 0; row < N_ROWS; row++) {
        for (let col = 0; col < N_COLS; col++) {
          const phase      = (t * WAVE_SPEED - col * (2*Math.PI / PERIOD)) % (2*Math.PI);
          const activation = 0.5 + 0.5 * Math.sin(phase);
          const cx2 = OX + col * CELL_W + CELL_W/2;
          const cy2 = OY + row * CELL_H + CELL_H/2;

          const gR = 10 + activation * 10;
          const dg = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, gR);
          dg.addColorStop(0, `rgba(204,68,255,${(activation * 0.5).toFixed(3)})`);
          dg.addColorStop(1, 'transparent');
          ctx.beginPath(); ctx.arc(cx2, cy2, gR, 0, Math.PI*2);
          ctx.fillStyle = dg; ctx.fill();

          const dr = 6 + activation * 3;
          ctx.beginPath(); ctx.arc(cx2, cy2, dr, 0, Math.PI*2);
          ctx.fillStyle = `rgba(${Math.round(200 + activation*55)},${Math.round(60 + activation*60)},50,0.9)`;
          ctx.fill();

          const momentAngle = -Math.PI/2 + activation * Math.PI;
          const mlen = 10;
          const nmx = Math.cos(momentAngle), nmy = Math.sin(momentAngle);
          ctx.strokeStyle = `rgba(0,255,224,${(0.3 + activation * 0.5).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(cx2 - nmx*mlen/2, cy2 - nmy*mlen/2);
          ctx.lineTo(cx2 + nmx*mlen/2, cy2 + nmy*mlen/2);
          ctx.stroke();
        }
      }

      const thrustX = OX + N_COLS * CELL_W + 10;
      const thrustY = OY + (N_ROWS * CELL_H) / 2;
      const tLen    = 35;
      ctx.strokeStyle = QUANT; ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(thrustX, thrustY); ctx.lineTo(thrustX + tLen, thrustY); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(thrustX + tLen, thrustY);
      ctx.lineTo(thrustX + tLen - 8, thrustY - 5);
      ctx.lineTo(thrustX + tLen - 8, thrustY + 5);
      ctx.closePath(); ctx.fillStyle = QUANT; ctx.fill();
      ctx.font = '7px Space Mono'; ctx.textAlign = 'left'; ctx.fillStyle = QUANT + 'cc';
      ctx.fillText('THRUST', thrustX + tLen + 4, thrustY + 3);

      ctx.font = '6.5px Space Mono'; ctx.textAlign = 'center'; ctx.fillStyle = MAG + '88';
      ctx.fillText('traveling magnetic wave -->', OX + N_COLS * CELL_W / 2, OY - 12);
      ctx.fillStyle = DIM;
      ctx.fillText('phase velocity: ' + (WAVE_SPEED * 60).toFixed(1) + ' col/s  --  no moving parts', OX + N_COLS * CELL_W / 2, H - 8);

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
export default function MagneticDropsPage() {
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
    <div style={{ minHeight: '100%', background: BG, color: '#d4e8f7',
      fontFamily: "'Rajdhani',sans-serif", overflowY: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px' }}>

        {/* ── title ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'inline-flex', gap: 8, marginBottom: 8 }}>
            <div style={{ border: `1px solid ${MAG}55`, padding: '3px 10px',
              fontSize: 9, letterSpacing: '0.2em', color: MAG + 'cc', fontFamily: MN }}>
              PROPULSION SUBSTRATE
            </div>
            <div style={{ border: `1px solid ${QUANT}33`, padding: '3px 10px',
              fontSize: 9, letterSpacing: '0.2em', color: QUANT + '88', fontFamily: MN }}>
              MPC SHELL MATERIAL
            </div>
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 21, fontWeight: 900, letterSpacing: 2,
            color: MAG, textShadow: `0 0 24px ${MAG}44`, margin: '4px 0' }}>
            Magnetic Drops &middot; Material Propulsion Substrate
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(200,200,220,0.75)',
            maxWidth: 860, lineHeight: 1.75, margin: 0 }}>
            Ferrofluid magnetic drops as the physical substrate of the MPC warp envelope.
            Each drop is a coherent magnetic domain -- iron nanoparticles (~10nm) coated
            with surfactant, suspended in a carrier fluid. Programmed in a traveling-wave
            configuration, the array generates net propulsive thrust via magnetohydrodynamic
            coupling. The drops form the magnetic skin of the coherent bubble -- the interface
            between C(x,t)&nbsp;=&nbsp;1 interior and the surrounding medium.
          </p>
        </div>

        {/* ── drop field canvas ── */}
        <div style={{ ...card(MAG), marginBottom: 14, borderColor: MAG + '22' }}>
          <div style={secLabel}>
            Ferrofluid Drop Field &middot; Live Dipole-Dipole Interaction &middot; Chain Formation
          </div>
          <DropFieldCanvas />
          <div style={{ marginTop: 8, fontFamily: MN, fontSize: 7.5, color: DIM, lineHeight: 1.9 }}>
            14 magnetic drops with live dipole-dipole forces. Blue dot = N pole, red = S pole.
            Purple lines connect aligned pairs (chain formation). Background arrows = superposed B-field.
            Global moment direction rotates slowly -- drops align, chains form and break.
          </div>
        </div>

        {/* ── material cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 14 }}>
          {([
            { t: 'Ferrofluid Composition', col: IRON,
              b: 'Fe3O4 nanoparticles, diameter 8-12nm. Oleic acid surfactant coating (2nm) prevents agglomeration. Carrier: water or synthetic ester oil. Volume fraction: 5-10%. Saturation magnetization: ~400 Gauss.' },
            { t: 'Rosensweig Instability', col: MAG,
              b: 'When B > B_c = sqrt(2*mu0*rho*g*sigma), the ferrofluid surface forms regular spikes. Spike wavelength = 2pi*sqrt(sigma/(rho*g)). Used to tune MPC shell geometry and surface curvature.' },
            { t: 'Dipole Chain Formation', col: FIELD,
              b: 'In an applied field, drops form linear chains along field direction. Chain length grows with phi^(1/3)*exp(delta*Bc/kT). Chains are the load-bearing structure of the MPC bubble shell.' },
            { t: 'MHD Coupling', col: QUANT,
              b: 'Traveling B-field induces eddy currents in conductive ferrofluid, interacting with B to produce Lorentz force j x B -- net fluid acceleration. Seawater conductivity sigma ~ 4 S/m provides excellent coupling.' },
          ] as {t:string;col:string;b:string}[]).map(({ t, col, b }) => (
            <div key={t} style={{ ...card(col), borderTop: `2px solid ${col}88` }}>
              <div style={{ fontFamily: OR, fontSize: 7.5, color: col, letterSpacing: 1, marginBottom: 6 }}>{t}</div>
              <div style={{ fontSize: 10, color: 'rgba(180,200,220,0.65)', lineHeight: 1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        {/* ── propulsion wave canvas ── */}
        <div style={{ ...card(QUANT), marginBottom: 14 }}>
          <div style={secLabel}>
            Propulsion Array &middot; Traveling Magnetic Wave &middot; Net Thrust Generation
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(180,240,220,0.7)', lineHeight: 1.7,
            marginBottom: 12, maxWidth: 840 }}>
            4-row array of magnetic drops activated in a traveling-wave pattern.
            Each column activates sequentially -- a magnetic phase wave sweeps left to right.
            The interaction between the traveling B-field and the induced magnetization generates
            net Lorentz force in the propagation direction. Dot brightness = activation.
            Teal arrows = local magnetic moment direction.
          </p>
          <PropulsionWaveCanvas />
          <div style={{ marginTop: 8, fontFamily: MN, fontSize: 7.5, color: DIM, lineHeight: 1.9 }}>
            Linear induction motor principle applied to ferrofluid. Steering: modify phase gradient
            across rows (angled wave = angled thrust vector). No moving parts -- purely magnetic programming.
          </div>
        </div>

        {/* ── shell + underwater ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div style={card(MAG)}>
            <div style={secLabel}>MPC Bubble Shell Architecture</div>
            {([
              { t: 'Shell as Ferrofluid Skin', b: 'The MPC coherence bubble wall is a spherical ferrofluid layer (~1cm thick) held in toroidal magnetic confinement. The drop density gradient at the wall provides the C(x,t) transition -- coherent interior (C=1) to turbulent exterior.' },
              { t: 'Tokamak Geometry', b: 'The magnetic confinement geometry mirrors a Tokamak: toroidal field coils around the vehicle hull generate primary containment. Poloidal coils stabilize the vertical position of the ferrofluid shell against gravity and external pressure.' },
              { t: 'Drop Density Control', b: 'Local drop volume fraction varied via electromagnetic pumping channels. Thin spots lower coherence threshold; dense spots reinforce the C(x,t) boundary. Shell permeability programmed per-zone.' },
              { t: 'Dynamic Re-shaping', b: 'Steering by asymmetrically deforming the bubble -- shifting the bow stagnation point off-center. Drops rearrange (ms timescale) under reprogrammed B-field sequences, deflecting the input cone and generating lateral thrust.' },
            ] as {t:string;b:string}[]).map(({ t, b }) => (
              <div key={t} style={{ ...card(MAG), borderColor: MAG+'22',
                padding: '8px 10px', marginBottom: 6 }}>
                <div style={{ fontFamily: OR, fontSize: 7.5, color: MAG, letterSpacing: 1, marginBottom: 3 }}>{t}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(220,180,240,0.58)', lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>

          <div style={card(GOLD)}>
            <div style={secLabel}>Underwater Operation &middot; Physical Parameters</div>
            {([
              { t: 'Pressure Balance at Depth', b: 'At depth d: P_ext = rho_w*g*d. At 100m: ~1 MPa. Magnetic pressure P_mag = B^2/(2*mu0). For P_mag > P_ext: B > 1.6 Tesla at 100m depth. Achievable with superconducting coils on vehicle hull.' },
              { t: 'Seawater MHD Coupling', b: 'Seawater sigma ~ 4 S/m. Lorentz force density: f = sigma*(v x B) x B. At B=1T, v=1m/s: f ~ 4 N/m^3. At R=10m bubble volume (~4000 m^3): ~16 kN continuous thrust. Scales with R^3.' },
              { t: 'Thermal Stability', b: 'Fe3O4 Curie temperature: ~850K. Deep ocean: 2-4C. Shell operates far below Curie point -- full magnetic saturation maintained. Cold water improves magnetization (Langevin function near saturation plateau).' },
              { t: 'Biofouling Resistance', b: 'Oscillating B-field (traveling wave, 2-50 Hz) prevents marine biofouling on shell surface. No organism colonizes a surface at B > 0.5T. Shell electromagnetically self-cleaning -- zero hull maintenance.' },
            ] as {t:string;b:string}[]).map(({ t, b }) => (
              <div key={t} style={{ ...card(GOLD), borderColor: GOLD+'22',
                padding: '8px 10px', marginBottom: 6 }}>
                <div style={{ fontFamily: OR, fontSize: 7.5, color: GOLD, letterSpacing: 1, marginBottom: 3 }}>{t}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(220,200,150,0.58)', lineHeight: 1.6 }}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── equations ── */}
        <div style={{ ...card(QUANT), marginBottom: 14, borderColor: QUANT + '18' }}>
          <div style={secLabel}>Key Equations &middot; Magnetic Drop Dynamics</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {([
              { label: 'Dipole B-Field',         eq: 'B = (mu0/4pi)*(3(m.r)r/r^5 - m/r^3)', col: FIELD },
              { label: 'Rosensweig Threshold',   eq: 'B_c = sqrt(2*mu0*rho*g*sigma)',        col: MAG   },
              { label: 'MHD Thrust Density',     eq: 'f = sigma*(v x B) x B  [N/m^3]',      col: QUANT },
              { label: 'Shell Coherence',        eq: 'C_wall = 1 - |eps|/|S*|',              col: GOLD  },
            ] as {label:string;eq:string;col:string}[]).map(({ label, eq, col }) => (
              <div key={label} style={{ ...card(col), borderColor: col+'22', padding: '10px 12px' }}>
                <div style={{ fontFamily: OR, fontSize: 7, color: col, letterSpacing: 1, marginBottom: 6 }}>{label}</div>
                <div style={{ fontFamily: MN, fontSize: 9, color: col + 'bb', lineHeight: 1.8 }}>{eq}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── footer ── */}
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: `1px solid ${MAG}18`,
          fontFamily: MN, fontSize: 7.5, color: DIM,
          letterSpacing: '0.12em', textAlign: 'center' }}>
          MAGNETIC DROPS &middot; FERROFLUID PROPULSION SUBSTRATE &middot;
          DIPOLE-DIPOLE INTERACTION &middot; ROSENSWEIG INSTABILITY &middot;
          MHD COUPLING &middot; TRAVELING WAVE &middot; MPC SHELL MATERIAL &middot;
          TOKAMAK GEOMETRY &middot; C(x,t) BOUNDARY
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useRef } from "react";

/* ── palette ─────────────────────── */
const BG     = '#04060e';
const GOLD   = '#c8a030';
const QUANT  = '#00ffe0';
const STRUCT = '#8b5cf6';
const PLASMA = '#ff7040';
const GRN    = '#22c55e';
const DIM    = '#2a4060';
const PINK   = '#e879f9';
const MN     = "'Space Mono', monospace";
const OR     = "'Orbitron', sans-serif";
const PHI    = (1 + Math.sqrt(5)) / 2;

/* ── module-level types ───────────── */
interface FanoPoint { x: number; y: number; label: number; }
interface LoopStep  { label: string; short: string; col: string; detail: string; }
interface UnifyCard { col: string; t: string; eq: string; body: string; }
interface DomainCard { col: string; t: string; body: string; }

/* ── Fano plane data ─────────────── */
// 7 points at angles k*2pi/7 from top (heptagonal arrangement)
const FANO_PTS: FanoPoint[] = Array.from({length:7}, (_,i) => {
  const ang = -Math.PI/2 + i * 2*Math.PI/7;
  return { x: Math.cos(ang), y: Math.sin(ang), label: i+1 };
});

// Cyclic difference {0,1,3} construction: line_k = {k, k+1, k+3} mod 7 (1-indexed)
const FANO_LINES: [number,number,number][] = [
  [1,2,4],[2,3,5],[3,4,6],[4,5,7],[5,6,1],[6,7,2],[7,1,3],
];

/* ── discovery loop data ─────────── */
const LOOP_STEPS: LoopStep[] = [
  { label:'SENSE',    col:GRN,
    short:'Biosensors resolve metabolites atom-by-atom',
    detail:'Mycelium or quantum biosensors resolve tumor metabolites atom-by-atom via geometric signatures in water quasi-crystals. Lambda egg-shape oscillation in water clusters signals oncometabolite presence.' },
  { label:'DELIVER',  col:QUANT,
    short:'Ferrofluid via quaternion-steered torus',
    detail:'Ferrofluid nanoparticles are steered by quaternion rotations through magnetic toroidal geometries, positioning therapeutic payload with atomic precision at the tumor microenvironment boundary.' },
  { label:'ACTIVATE', col:PLASMA,
    short:'Octonionic order-dependent release',
    detail:'Metabolite-triggered release uses octonionic multiplication. Non-associativity means chaining activations is order-dependent -- mirroring how GR paths curve non-trivially. Timing is geometry.' },
  { label:'FEEDBACK', col:STRUCT,
    short:'Real-time atomic imaging to buffer',
    detail:'Real-time ptychography-like atomic imaging feeds the light-memory buffer with octonion-valued field data. Each frame updates the 8D state vector for the next delivery decision.' },
  { label:'LEARN',    col:GOLD,
    short:'Non-associative error correction',
    detail:'Adaptive update via non-associative error correction reverses fragility cascades into coherent healing. Biophoton shifts at the atomic scale signal successful loop closure -- liquid light.' },
];

/* ── unifying architecture cards ─── */
const UNIFY: UnifyCard[] = [
  { col:QUANT,  t:'Quaternions (4D)',
    eq:'q = a + bi + cj + dk,  i^2=j^2=k^2=ijk=-1',
    body:'Encode atomic orientations, spins, and color-like quantum numbers. Quaternion rotations (v->qvq^-1) steer ferrofluid nanoparticles and model electron orbital alignment. Non-commutative but associative.' },
  { col:PINK,   t:'Octonions (8D)',
    eq:'o = s + e1..e7,  non-associative: (xy)z != x(yz)',
    body:'Capture full non-associative field interactions: electron cloud bonding, non-linear field responses, and GR-mirroring path curvature. The Fano plane defines their multiplication table completely.' },
  { col:GOLD,   t:'Fano Plane',
    eq:'7 points, 7 lines -- PG(2,2) over GF(2)',
    body:'The projective plane over the 2-element field. Its 7 lines are exactly the non-zero octonion basis triples: (i,j,k) on a line means ei*ej=ek. All octonion algebra flows from this diagram.' },
  { col:GRN,    t:'Aether Unit Geometry',
    eq:'Spherical ES + toroidal/loxodrome magnetic',
    body:'Each Aether unit has a spherical electrostatic surface and a toroidal/loxodrome magnetic structure. Atoms emerge as excitations within this quantized fabric. Measuring by atom means resolving these geometries directly.' },
];

/* ── cosmic/botanical cards ─────── */
const COSMIC: DomainCard[] = [
  { col:GOLD,   t:'Bennu Molecules',
    body:'Ribose and glucose discovered on asteroid Bennu are geometric templates pre-tuned to solar system symmetries. Measurable atom-by-atom as octonionic structures: 5-carbon ring = 5-fold Fano symmetry.' },
  { col:GRN,    t:'Cosmological Botany',
    body:'Flower/bud morphologies with 3/5-fold symmetry and lambda egg-shapes are atomic-scale antennas resolving planetary field dips. Equinox alignment amplifies these measurements via magnetic cracks in water and sap.' },
  { col:QUANT,  t:'Lambda Oscillation',
    body:'Periodic modulation of the egg-likeness parameter in the bio_field: r(theta) = 1 + lambda*cos(2*theta). Lambda pulses with the equinox phase. Time blood = sap pulsation entrained to the planetary coherence window.' },
  { col:PLASMA, t:'Non-Associative GR',
    body:'Unit octonions rotate 7D vectors via v-prime = o v o^-1, but non-associativity means chaining requires care -- mirroring how GR geodesics curve non-trivially. The same algebra governs atomic paths and cosmic ones.' },
];

/* ═══════════════════════════════════════════════════
   I.  FANO PLANE CANVAS
   Animated octonion multiplication cycling
   ═══════════════════════════════════════════════════ */
function FanoPlaneCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv  = ref.current; if (!cv)  return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 340, H = 290;
    cv.width = W; cv.height = H;
    const CX = W/2, CY = H/2 + 2;
    const RAD = 108;

    let t = 0;
    function draw() {
      t++;
      const lineIdx   = Math.floor(t / 100) % 7;
      const phaseFrac = (t % 100) / 100;
      const which     = Math.floor(phaseFrac * 3);
      const line      = FANO_LINES[lineIdx];
      const [la, lb, lc] = line;

      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Outer guide circle
      ctx.strokeStyle = 'rgba(42,64,96,0.25)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.arc(CX, CY, RAD, 0, Math.PI*2); ctx.stroke();

      // Draw all 7 lines as triangles
      for (const [a,b,c] of FANO_LINES) {
        const pa = FANO_PTS[a-1], pb = FANO_PTS[b-1], pc = FANO_PTS[c-1];
        const xa = CX+pa.x*RAD, ya = CY+pa.y*RAD;
        const xb = CX+pb.x*RAD, yb = CY+pb.y*RAD;
        const xc = CX+pc.x*RAD, yc = CY+pc.y*RAD;
        const isActive = a===la && b===lb && c===lc;

        if (isActive) {
          // Fill active triangle faintly
          ctx.fillStyle = QUANT + '0a';
          ctx.beginPath(); ctx.moveTo(xa,ya); ctx.lineTo(xb,yb); ctx.lineTo(xc,yc); ctx.closePath(); ctx.fill();
        }
        ctx.strokeStyle = isActive ? QUANT+'aa' : 'rgba(42,80,130,0.35)';
        ctx.lineWidth   = isActive ? 1.5 : 0.6;
        ctx.beginPath(); ctx.moveTo(xa,ya); ctx.lineTo(xb,yb); ctx.lineTo(xc,yc); ctx.closePath(); ctx.stroke();
      }

      // Progress arc around outer circle
      ctx.strokeStyle = GOLD + '30'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CX, CY, RAD+12, -Math.PI/2, -Math.PI/2 + phaseFrac*2*Math.PI);
      ctx.stroke();

      // Draw all 7 points
      for (const p of FANO_PTS) {
        const px = CX + p.x*RAD, py = CY + p.y*RAD;
        const isA = p.label===la, isB = p.label===lb, isC = p.label===lc;
        const isActive = isA || isB || isC;
        const col = isA ? PLASMA : isB ? QUANT : isC ? STRUCT : '#3a5080';
        const dotR = isActive ? 7.5 : 4;
        ctx.beginPath(); ctx.arc(px, py, dotR, 0, Math.PI*2);
        ctx.fillStyle = col; ctx.fill();
        if (isActive) {
          ctx.strokeStyle = col + '55'; ctx.lineWidth = 4;
          ctx.beginPath(); ctx.arc(px, py, 11, 0, Math.PI*2); ctx.stroke();
        }
        ctx.font = isActive ? '8px Space Mono' : '7px Space Mono';
        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? col : '#4a6080';
        ctx.fillText('e' + p.label, px, py + (py > CY ? 22 : -14));
      }

      // Multiplication display
      const mults = [
        'e' + la + ' * e' + lb + ' = e' + lc,
        'e' + lb + ' * e' + lc + ' = e' + la,
        'e' + lc + ' * e' + la + ' = e' + lb,
      ];
      ctx.font = '10px Space Mono'; ctx.textAlign = 'center';
      ctx.fillStyle = QUANT + 'cc';
      ctx.fillText(mults[which], CX, H - 8);
      ctx.font = '7px Space Mono'; ctx.fillStyle = DIM;
      ctx.fillText('LINE ' + (lineIdx+1) + ' of 7  |  Fano plane octonion multiplication', CX, 10);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{width:'100%', maxWidth:340, height:'auto', display:'block',
        borderRadius:4, margin:'0 auto'}} />
  );
}

/* ═══════════════════════════════════════════════════
   II.  AETHER UNIT CANVAS
   Rotating torus + sphere + loxodrome
   ═══════════════════════════════════════════════════ */
function AetherUnitCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv  = ref.current; if (!cv)  return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 340, H = 290;
    cv.width = W; cv.height = H;
    const CX = W/2, CY = H/2;

    const R = 82, r = 31; // major, minor torus radius
    const TILT = 0.48;
    const cosTilt = Math.cos(TILT), sinTilt = Math.sin(TILT);

    // Pre-generate torus surface points (32 x 22 = 704 pts)
    const NU = 32, NV = 22, NPT = NU*NV;
    const pts = new Float32Array(NPT * 3);
    for (let ui = 0; ui < NU; ui++) {
      for (let vi = 0; vi < NV; vi++) {
        const u = 2*Math.PI * ui/NU;
        const v = 2*Math.PI * vi/NV;
        const ii = (ui*NV + vi) * 3;
        pts[ii]   = (R + r*Math.cos(v)) * Math.cos(u);
        pts[ii+1] = (R + r*Math.cos(v)) * Math.sin(u);
        pts[ii+2] = r * Math.sin(v);
      }
    }

    // Pre-generate loxodrome (v = 3u, 220 pts)
    const NLOX = 220;
    const lox  = new Float32Array(NLOX * 3);
    for (let i = 0; i < NLOX; i++) {
      const u = 2*Math.PI * i / (NLOX - 1);
      const v = 3 * u;
      lox[i*3]   = (R + r*Math.cos(v)) * Math.cos(u);
      lox[i*3+1] = (R + r*Math.cos(v)) * Math.sin(u);
      lox[i*3+2] = r * Math.sin(v);
    }

    const sorted = new Array<{sx:number;sy:number;sz:number}>(NPT);

    function project(x:number,y:number,z:number,cY:number,sY:number): [number,number,number] {
      const x1 = x*cY + z*sY;
      const z1 = -x*sY + z*cY;
      const y2 = y*cosTilt - z1*sinTilt;
      const z2 = y*sinTilt + z1*cosTilt;
      return [x1, y2, z2];
    }

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      const cY = Math.cos(t * 0.007), sY = Math.sin(t * 0.007);
      const depthRange = R + r;

      // Project and sort torus surface points
      for (let i = 0; i < NPT; i++) {
        const [sx,sy,sz] = project(pts[i*3], pts[i*3+1], pts[i*3+2], cY, sY);
        sorted[i] = {sx: CX+sx, sy: CY+sy, sz};
      }
      sorted.sort((a,b) => a.sz - b.sz);

      for (const p of sorted) {
        const frac = (p.sz + depthRange) / (2*depthRange); // 0=far, 1=near
        const alpha = 0.08 + frac * 0.52;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, 1.4, 0, Math.PI*2);
        ctx.fillStyle = `rgba(0,255,224,${alpha.toFixed(2)})`; ctx.fill();
      }

      // Draw loxodrome helix (gold spiral)
      ctx.strokeStyle = GOLD + 'aa'; ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let i = 0; i < NLOX; i++) {
        const [sx,sy,sz] = project(lox[i*3], lox[i*3+1], lox[i*3+2], cY, sY);
        const frac = (sz + depthRange) / (2*depthRange);
        if (frac < 0.2) continue; // hide back-side segment
        i === 0 ? ctx.moveTo(CX+sx, CY+sy) : ctx.lineTo(CX+sx, CY+sy);
      }
      ctx.stroke();

      // Animated highlight dot on loxodrome
      const loxIdx = Math.floor(t * 0.6) % NLOX;
      const [lsx,lsy] = project(lox[loxIdx*3], lox[loxIdx*3+1], lox[loxIdx*3+2], cY, sY);
      ctx.beginPath(); ctx.arc(CX+lsx, CY+lsy, 4, 0, Math.PI*2);
      ctx.fillStyle = GOLD; ctx.fill();

      // Central sphere (electrostatic core)
      const sphR = 30 + 4*Math.sin(t * 0.025);
      if (isFinite(sphR) && sphR > 0) {
        const grad = ctx.createRadialGradient(CX, CY, 0, CX, CY, sphR);
        grad.addColorStop(0, 'rgba(200,160,48,0.92)');
        grad.addColorStop(0.5, 'rgba(200,160,48,0.28)');
        grad.addColorStop(1, 'rgba(200,160,48,0)');
        ctx.beginPath(); ctx.arc(CX, CY, sphR, 0, Math.PI*2);
        ctx.fillStyle = grad; ctx.fill();
      }

      // Labels
      ctx.font = '6px Space Mono'; ctx.textAlign = 'center';
      ctx.fillStyle = GOLD + 'aa';
      ctx.fillText('Electrostatic sphere', CX, CY + 8);
      ctx.fillStyle = QUANT + '88';
      ctx.fillText('Toroidal magnetic surface', CX, H - 6);
      ctx.fillStyle = GOLD + '88';
      ctx.fillText('Loxodrome spiral (3-wrap)', CX, 11);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{width:'100%', maxWidth:340, height:'auto', display:'block',
        borderRadius:4, margin:'0 auto'}} />
  );
}

/* ═══════════════════════════════════════════════════
   III.  CLOSED DISCOVERY LOOP CANVAS
   Animated 5-step oncology cycle
   ═══════════════════════════════════════════════════ */
function DiscoveryLoopCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv  = ref.current; if (!cv)  return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 220;
    cv.width = W; cv.height = H;
    const CX = 210, CY = H/2;
    const RAD = 80;

    // Pentagon positions
    const pts = LOOP_STEPS.map((_, i) => {
      const ang = -Math.PI/2 + i * 2*Math.PI/5;
      return { x: CX + RAD*Math.cos(ang), y: CY + RAD*Math.sin(ang) };
    });

    let t = 0;
    function draw() {
      t++;
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);

      // Pentagon edges
      for (let i = 0; i < 5; i++) {
        const j = (i+1)%5;
        ctx.strokeStyle = 'rgba(42,64,96,0.65)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(pts[i].x,pts[i].y); ctx.lineTo(pts[j].x,pts[j].y); ctx.stroke();
      }

      // Animated pulse on the pentagon perimeter
      const CYCLE = 300, phase = t % CYCLE;
      const seg   = Math.floor(phase / 60);
      const frac  = (phase % 60) / 60;
      const nxt   = (seg+1)%5;
      const pulseX = pts[seg].x + (pts[nxt].x - pts[seg].x)*frac;
      const pulseY = pts[seg].y + (pts[nxt].y - pts[seg].y)*frac;
      const pc     = LOOP_STEPS[seg].col;

      // Pulse glow
      const g = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, 18);
      g.addColorStop(0, pc+'70'); g.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(pulseX, pulseY, 18, 0, Math.PI*2);
      ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); ctx.arc(pulseX, pulseY, 5, 0, Math.PI*2);
      ctx.fillStyle = pc; ctx.fill();

      // Step nodes
      for (let i = 0; i < 5; i++) {
        const {x,y} = pts[i];
        const {col, label} = LOOP_STEPS[i];
        const isActive = i===seg || i===nxt;
        const nodeR = isActive ? 10 : 6.5;
        ctx.beginPath(); ctx.arc(x, y, nodeR, 0, Math.PI*2);
        ctx.fillStyle = isActive ? col : col+'44'; ctx.fill();
        if (isActive) {
          ctx.strokeStyle = col+'55'; ctx.lineWidth = 5;
          ctx.beginPath(); ctx.arc(x, y, 15, 0, Math.PI*2); ctx.stroke();
        }
        // Label
        const isTop = y < CY - 20;
        const isBot = y > CY + 20;
        const lx = x;
        const ly = isTop ? y-16 : isBot ? y+19 : y + (x < CX ? 0 : 0);
        const yOff = isTop ? y-16 : isBot ? y+19 : (x < CX ? y+3 : y+3);
        ctx.font = isActive ? '7.5px Orbitron' : '6.5px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillStyle = isActive ? col : col+'77';
        ctx.fillText(label, lx, yOff);
      }

      // Right panel: active step detail
      const step = LOOP_STEPS[seg];
      const TX = 440, TW = W - TX - 8;
      ctx.fillStyle = 'rgba(0,0,0,0.42)';
      ctx.fillRect(TX, 8, TW, H-16);
      ctx.strokeStyle = step.col+'28'; ctx.lineWidth = 1;
      ctx.strokeRect(TX, 8, TW, H-16);

      ctx.font = '8px Orbitron'; ctx.textAlign = 'left';
      ctx.fillStyle = step.col;
      ctx.fillText('STEP ' + (seg+1) + '  --  ' + step.label, TX+10, 30);

      ctx.font = '7.5px Space Mono'; ctx.fillStyle = step.col+'60';
      ctx.fillText(step.short, TX+10, 46);

      // Word-wrap detail text
      ctx.font = '7.5px Space Mono'; ctx.fillStyle = 'rgba(180,200,220,0.58)';
      const words = step.detail.split(' ');
      let line = '', ly2 = 65;
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > TW - 18) {
          if (ly2 < H - 22) { ctx.fillText(line, TX+10, ly2); ly2 += 14; }
          line = w;
        } else { line = test; }
      }
      if (line && ly2 < H-22) ctx.fillText(line, TX+10, ly2);

      // Octonion label at top
      ctx.font = '7px Space Mono'; ctx.fillStyle = DIM; ctx.textAlign = 'center';
      ctx.fillText('CLOSED DISCOVERY LOOP  --  Atom-by-Atom AETHER Oncology Cycle', CX, 10);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{width:'100%', height:'auto', display:'block', borderRadius:3}} />
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════ */
export default function AtomicGeometryPage() {
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
          <div style={{display:'inline-block', border:'1px solid rgba(0,255,224,0.45)',
            padding:'3px 10px', fontSize:9, letterSpacing:'0.2em',
            color:QUANT+'cc', fontFamily:MN, marginBottom:8}}>
            AETHER ATOMIC GEOMETRY
          </div>
          <h1 style={{fontFamily:OR, fontSize:21, fontWeight:900, letterSpacing:2,
            color:QUANT, textShadow:'0 0 24px '+QUANT+'44', margin:'4px 0'}}>
            Measuring by Atom &middot; Atomic Geometry in the AETHER Framework
          </h1>
          <p style={{fontSize:13, color:'rgba(200,200,220,0.75)',
            maxWidth:820, lineHeight:1.7, margin:0}}>
            Atomic geometry operationalizes the AETHER infiltration phase -- atom-by-atom substitution
            from disruption to infiltration to locking cascades. It provides the foundational measurement
            tool for the Closed Discovery Loop in oncology, cosmological botany, time blood coherence,
            and equinox dip dynamics. Atoms are not point particles but structured geometric entities
            embedded in hypercomplex algebras: quaternions (4D) for orientation and spin, octonions (8D)
            for non-associative field interactions, Fano plane for triangular coherence.
          </p>
        </div>

        {/* ── hypercomplex section: Fano + AetherUnit side by side ── */}
        <div style={{display:'grid', gridTemplateColumns:'340px 1fr 340px', gap:14, marginBottom:16, alignItems:'start'}}>
          {/* Fano plane */}
          <div style={card(PINK)}>
            <div style={secLabel}>Fano Plane &middot; 7-Point Octonion Algebra</div>
            <FanoPlaneCanvas />
            <div style={{marginTop:8, fontFamily:MN, fontSize:7.5, color:DIM, lineHeight:1.9}}>
              PG(2,2) projective plane over GF(2) &middot;
              7 points, 7 lines, 3 pts per line &middot;
              line (i,j,k): e_i * e_j = e_k &middot;
              non-associative: (e_i e_j) e_k &ne; e_i (e_j e_k)
            </div>
          </div>

          {/* middle description */}
          <div>
            <div style={secLabel}>Hypercomplex Representation</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
              {UNIFY.map(u => (
                <div key={u.t} style={{...card(u.col), borderColor:u.col+'22', padding:'10px 12px'}}>
                  <div style={{fontFamily:OR, fontSize:8, color:u.col,
                    letterSpacing:1, marginBottom:3}}>{u.t}</div>
                  <div style={{fontFamily:MN, fontSize:7.5, color:u.col+'77',
                    marginBottom:6, lineHeight:1.5}}>{u.eq}</div>
                  <div style={{fontSize:10, color:'rgba(180,200,220,0.62)',
                    lineHeight:1.6}}>{u.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Aether unit */}
          <div style={card(QUANT)}>
            <div style={secLabel}>Aether Unit &middot; Sphere + Torus + Loxodrome</div>
            <AetherUnitCanvas />
            <div style={{marginTop:8, fontFamily:MN, fontSize:7.5, color:DIM, lineHeight:1.9}}>
              Gold dot = animated loxodrome position &middot;
              spiral wraps 3&times; around tube &middot;
              loxodrome: constant-angle crossing of all latitude circles &middot;
              magnetic toroidal structure enclosing electrostatic sphere
            </div>
          </div>
        </div>

        {/* ── closed discovery loop ── */}
        <div style={{...card(GRN), marginBottom:16}}>
          <div style={secLabel}>
            Closed Discovery Loop &middot; Atom-by-Atom Oncology Measurement + Delivery
          </div>
          <p style={{fontSize:11, color:'rgba(180,240,200,0.7)', lineHeight:1.7,
            marginBottom:12, maxWidth:820}}>
            The 5-step cycle converts the tumor microenvironment into a measurable, tunable atomic
            geometry system. Each step uses a different layer of the hypercomplex algebra:
            quaternion steering (DELIVER), octonionic order-dependent logic (ACTIVATE),
            non-associative error correction (LEARN). The animated pulse shows information and
            material flowing around the loop. Right panel shows the active step in detail.
          </p>
          <DiscoveryLoopCanvas />
          <div style={{marginTop:12, display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6}}>
            {LOOP_STEPS.map((s,i) => (
              <div key={s.label} style={{...card(s.col), borderColor:s.col+'22', padding:'8px 10px'}}>
                <div style={{fontFamily:OR, fontSize:7, color:s.col,
                  letterSpacing:1, marginBottom:3}}>
                  {'0'+(i+1)} {s.label}
                </div>
                <div style={{fontSize:9.5, color:'rgba(180,200,220,0.6)',
                  lineHeight:1.55}}>{s.detail}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── cosmic & botanical ties ── */}
        <div style={{...card(GOLD), marginBottom:16}}>
          <div style={secLabel}>Cosmic &amp; Botanical Ties &middot; Atom-by-Atom Across Scales</div>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10}}>
            {COSMIC.map(c => (
              <div key={c.t} style={{...card(c.col), borderColor:c.col+'22'}}>
                <div style={{fontFamily:OR, fontSize:8, color:c.col,
                  letterSpacing:1, marginBottom:5}}>{c.t}</div>
                <div style={{fontSize:10.5, color:'rgba(200,220,240,0.65)',
                  lineHeight:1.65}}>{c.body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── master control equation ── */}
        <div style={{...card(QUANT), marginBottom:16, padding:'14px 20px'}}>
          <div style={secLabel}>AETHER Master Control Equation</div>
          <div style={{display:'grid', gridTemplateColumns:'auto 1fr', gap:20, alignItems:'start'}}>
            <div style={{fontFamily:MN, fontSize:15, color:QUANT, letterSpacing:1,
              lineHeight:2.2, padding:'8px 16px', background:'rgba(0,0,0,0.4)',
              borderRadius:4, border:'1px solid '+QUANT+'22',
              whiteSpace:'nowrap'}}>
              C(x,t) = 1 &minus; &#x2016;&epsilon;(x,t)&#x2016; / &#x2016;S*(x,t)&#x2016;
            </div>
            <div>
              <p style={{fontSize:11.5, color:'rgba(180,240,220,0.7)', lineHeight:1.75, margin:'0 0 8px'}}>
                The coherence field C(x,t) measures how far the actual system state deviates from
                the ideal substrate signal S*(x,t). In atomic geometry, this operates at the atomic
                scale: epsilon(x,t) is the deviation of each atom's geometric configuration from its
                Aether unit resonance; S*(x,t) is the target octonion-valued field state.
              </p>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:6}}>
                {([
                  {col:QUANT,  t:'C = 1 (full coherence)',
                   b:'All atomic configurations aligned with Aether substrate. No deviation from resonance. Biological state: full biophoton coherence, liquid light, healing cascade.'},
                  {col:PLASMA, t:'C = 0 (incoherent)',
                   b:'Epsilon equals S*. Complete mismatch between actual and substrate. Biological state: tumor fragility cascade, atomic geometry disrupted.'},
                  {col:GRN,    t:'Infiltration phase',
                   b:'Atom-by-atom substitution drives C from 0 toward 1. Each delivered nanoparticle substitutes one incoherent atom geometry for a phi-resonant one.'},
                ] as {col:string;t:string;b:string}[]).map(({col,t,b}) => (
                  <div key={t} style={{...card(col), borderColor:col+'22', padding:'8px 10px'}}>
                    <div style={{fontFamily:OR, fontSize:7.5, color:col,
                      letterSpacing:1, marginBottom:4}}>{t}</div>
                    <div style={{fontSize:10, color:'rgba(180,200,220,0.6)',
                      lineHeight:1.6}}>{b}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── phi-lattice bridge ── */}
        <div style={{...card(GOLD), marginBottom:16}}>
          <div style={secLabel}>Bridge: phi-Lattice + Atomic Geometry</div>
          <p style={{fontSize:11.5, color:'rgba(200,200,220,0.7)', lineHeight:1.75, maxWidth:900}}>
            The phi-lattice transducer (quasiperiodic cellular architecture) and atomic geometry
            are the macro and micro scales of the same principle. At the macro scale: phi-scaled
            cell tiers dissipate plasma, runway, or quantum decoherence. At the atomic scale: the
            same phi ratio appears in the toroidal Aether unit geometry -- the loxodrome spiral
            wraps in phi-proportioned turns, the spherical-toroidal surface ratio embeds the
            golden angle (137.5 degrees = 360 minus 360/phi^2). Measuring by atom means resolving
            which tier of the phi-lattice each atom belongs to -- and correcting it atom by atom
            via the Closed Discovery Loop until C(x,t) approaches 1.
          </p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginTop:10}}>
            {([
              {col:GOLD,   t:'Golden Angle',
               body:'137.5 degrees = 360 - 360/phi^2. The loxodrome on the Aether unit torus spirals at this angle to the latitude circles. Phyllotaxis uses the same angle for optimal packing -- phi bridges torus geometry to botany.'},
              {col:QUANT,  t:'Quasiperiodic Spectrum',
               body:'phi-lattice phononic bandgaps appear at phi^k multiples. The Aether unit toroidal vibration frequencies also follow phi scaling. Both suppress chaotic back-action via the same irrational-spacing principle.'},
              {col:STRUCT, t:'Scale-Invariant Cascade',
               body:'quantum vacuum -> DNA -> pyramid -> cosmic filament -> precessional age. Each tier is a phi-scaled Aether unit nested inside the next. C(x,t) can be computed at any scale by resolving the geometry of that tier.'},
            ] as {col:string;t:string;body:string}[]).map(({col,t,body}) => (
              <div key={t} style={{...card(col), borderColor:col+'22'}}>
                <div style={{fontFamily:OR, fontSize:8, color:col, letterSpacing:1, marginBottom:4}}>{t}</div>
                <div style={{fontSize:10.5, color:'rgba(200,220,240,0.62)', lineHeight:1.65}}>{body}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── footer ── */}
        <div style={{marginTop:16, paddingTop:10,
          borderTop:'1px solid rgba(0,255,224,0.1)',
          fontFamily:MN, fontSize:7.5, color:DIM,
          letterSpacing:'0.12em', textAlign:'center'}}>
          AETHER &middot; ATOMIC GEOMETRY &middot; MEASURING BY ATOM &middot;
          FANO PLANE &middot; OCTONIONS &middot; QUATERNIONS &middot;
          TOROIDAL AETHER UNIT &middot; CLOSED DISCOVERY LOOP &middot;
          C(x,t) COHERENCE FIELD
        </div>
      </div>
    </div>
  );
}

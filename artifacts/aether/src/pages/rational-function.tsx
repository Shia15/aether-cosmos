import { useEffect, useRef, useState } from 'react';

const BG = '#04060E';
const PNL = '#080d18';
const BDR = '#1a2840';
const TXT = '#c8d8e8';
const DIM_C = '#4a6080';
const AURORA = '#00FFB2';
const GOLD = '#C8A030';
const QUANT = '#00ffe0';
const CURVE_COL = '#5090f0';
const ASYM_COL = '#c44820';
const INTER_COL = AURORA;

interface Params {
  root: number;
  pole1: number;
  pole2: number;
  k: number;
}

function evalF(x: number, p: Params): number {
  const denom = (x - p.pole1) * (x - p.pole2);
  if (Math.abs(denom) < 1e-10) return NaN;
  return p.k * (x - p.root) / denom;
}

function computeK(root: number, pole1: number, pole2: number): number {
  const denom = (0 - pole1) * (0 - pole2);
  if (Math.abs(denom) < 1e-10) return 4;
  return (2 / 3) * denom / (0 - root);
}

function yIntercept(p: Params): number {
  return evalF(0, p);
}

export default function RationalFunctionPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoverRef = useRef<{ x: number; y: number; fx: number } | null>(null);

  const [params, setParams] = useState<Params>({
    root: 1, pole1: -2, pole2: 3,
    k: 4,
  });

  const [info, setInfo] = useState({ yInt: 2 / 3, wien: 0 });

  function updateParams(newP: Params) {
    const k2 = computeK(newP.root, newP.pole1, newP.pole2);
    const next = { ...newP, k: k2 };
    setParams(next);
    const yi = evalF(0, next);
    setInfo({ yInt: isFinite(yi) ? yi : 0, wien: 0 });
  }

  function draw(p: Params) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const W = Math.floor(rect.width);
    const H = Math.floor(rect.height);
    if (canvas.width !== W * dpr || canvas.height !== H * dpr) {
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      canvas.getContext('2d')!.scale(dpr, dpr);
    }
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#060a14'; ctx.fillRect(0, 0, W, H);

    const xMin = -8, xMax = 8, yMin = -12, yMax = 12;
    const toSX = (x: number) => (x - xMin) / (xMax - xMin) * W;
    const toSY = (y: number) => (1 - (y - yMin) / (yMax - yMin)) * H;

    // Grid
    ctx.strokeStyle = '#ffffff06'; ctx.lineWidth = 1;
    for (let x = Math.ceil(xMin); x <= xMax; x++) {
      ctx.beginPath(); ctx.moveTo(toSX(x), 0); ctx.lineTo(toSX(x), H); ctx.stroke();
    }
    for (let y = Math.ceil(yMin); y <= yMax; y++) {
      ctx.beginPath(); ctx.moveTo(0, toSY(y)); ctx.lineTo(W, toSY(y)); ctx.stroke();
    }

    // Axes
    ctx.strokeStyle = '#3a5070'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, toSY(0)); ctx.lineTo(W, toSY(0)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(toSX(0), 0); ctx.lineTo(toSX(0), H); ctx.stroke();

    // Tick labels
    ctx.fillStyle = DIM_C; ctx.font = '10px Space Mono'; ctx.textAlign = 'center';
    for (let x = xMin; x <= xMax; x += 2) {
      if (x === 0) continue;
      ctx.fillText(String(x), toSX(x), toSY(0) + 14);
    }
    ctx.textAlign = 'right';
    for (let y = yMin; y <= yMax; y += 2) {
      if (y === 0) continue;
      ctx.fillText(String(y), toSX(0) - 6, toSY(y) + 4);
    }

    // Vertical asymptotes
    ctx.strokeStyle = ASYM_COL + 'cc'; ctx.lineWidth = 1.5; ctx.setLineDash([6, 5]);
    [p.pole1, p.pole2].forEach(px => {
      ctx.beginPath(); ctx.moveTo(toSX(px), 0); ctx.lineTo(toSX(px), H); ctx.stroke();
    });

    // Horizontal asymptote y=0 (already the x-axis, just highlight)
    ctx.strokeStyle = ASYM_COL + '50'; ctx.lineWidth = 1; ctx.setLineDash([4, 8]);
    ctx.beginPath(); ctx.moveTo(0, toSY(0)); ctx.lineTo(W, toSY(0)); ctx.stroke();
    ctx.setLineDash([]);

    // Draw function in 3 branches (left of pole1, between poles, right of pole2)
    const poles = [p.pole1, p.pole2].sort((a, b) => a - b);
    const branches = [
      { from: xMin, to: poles[0] - 0.05 },
      { from: poles[0] + 0.05, to: poles[1] - 0.05 },
      { from: poles[1] + 0.05, to: xMax },
    ];
    const STEPS = 600;
    branches.forEach(({ from, to }) => {
      ctx.beginPath(); let first = true;
      for (let i = 0; i <= STEPS; i++) {
        const x = from + (to - from) * (i / STEPS);
        const y = evalF(x, p);
        if (!isFinite(y) || y < yMin * 1.5 || y > yMax * 1.5) { first = true; continue; }
        const sx = toSX(x), sy = toSY(y);
        first ? ctx.moveTo(sx, sy) : ctx.lineTo(sx, sy);
        first = false;
      }
      ctx.strokeStyle = CURVE_COL; ctx.lineWidth = 2.5; ctx.stroke();
    });

    // x-intercept dot
    const xi = p.root;
    ctx.beginPath(); ctx.arc(toSX(xi), toSY(0), 6, 0, Math.PI * 2);
    ctx.fillStyle = INTER_COL; ctx.fill();
    ctx.fillStyle = INTER_COL; ctx.font = 'bold 10px Space Mono'; ctx.textAlign = 'center';
    ctx.fillText('(' + xi.toFixed(1) + ', 0)', toSX(xi), toSY(0) - 12);

    // y-intercept dot
    const yi = evalF(0, p);
    if (isFinite(yi) && yi >= yMin && yi <= yMax) {
      ctx.beginPath(); ctx.arc(toSX(0), toSY(yi), 5, 0, Math.PI * 2);
      ctx.fillStyle = GOLD; ctx.fill();
      ctx.fillStyle = GOLD; ctx.font = 'bold 10px Space Mono'; ctx.textAlign = 'left';
      ctx.fillText('(0, ' + yi.toFixed(2) + ')', toSX(0) + 8, toSY(yi) - 8);
    }

    // Asymptote labels
    ctx.font = '10px Space Mono'; ctx.setLineDash([]);
    [p.pole1, p.pole2].forEach(px => {
      ctx.fillStyle = ASYM_COL; ctx.textAlign = 'center';
      ctx.fillText('x=' + px.toFixed(1), toSX(px), 16);
    });

    // Hover crosshair
    const hv = hoverRef.current;
    if (hv && isFinite(hv.fx)) {
      ctx.strokeStyle = QUANT + '80'; ctx.lineWidth = 1; ctx.setLineDash([3, 6]);
      ctx.beginPath(); ctx.moveTo(hv.x, 0); ctx.lineTo(hv.x, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, hv.y); ctx.lineTo(W, hv.y); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = QUANT;
      ctx.font = '10px Space Mono'; ctx.textAlign = 'left';
      const mx = xMin + (hv.x / W) * (xMax - xMin);
      ctx.fillText('f(' + mx.toFixed(2) + ') = ' + hv.fx.toFixed(3), hv.x + 8, hv.y - 8);
    }

    // Function label top-right
    ctx.fillStyle = TXT; ctx.font = '11px Space Mono'; ctx.textAlign = 'right';
    const kStr = p.k.toFixed(2);
    const r = p.root.toFixed(1), p1 = p.pole1.toFixed(1), p2 = p.pole2.toFixed(1);
    ctx.fillText('f(x) = ' + kStr + '(x-' + r + ') / ((x+' + (-p.pole1).toFixed(1) + ')(x-' + p.pole2.toFixed(1) + '))', W - 8, 18);
  }

  useEffect(() => {
    draw(params);
  }, [params]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ro = new ResizeObserver(() => draw(params));
    ro.observe(canvas);

    function onMove(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const xMin = -8, xMax = 8, yMin = -12, yMax = 12;
      const W = rect.width, H = rect.height;
      const mx = xMin + (px / W) * (xMax - xMin);
      const fx = evalF(mx, params);
      const sy = isFinite(fx) ? (1 - (fx - yMin) / (yMax - yMin)) * H : py;
      hoverRef.current = { x: px, y: sy, fx };
      draw(params);
    }
    function onLeave() { hoverRef.current = null; draw(params); }
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);
    return () => { ro.disconnect(); canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('mouseleave', onLeave); };
  }, [params]);

  const slStyle: React.CSSProperties = { flex: 1, accentColor: AURORA };
  const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 };
  const labelStyle: React.CSSProperties = { fontSize: 11, color: DIM_C, minWidth: 110 };
  const valStyle: React.CSSProperties = { fontSize: 11, color: AURORA, minWidth: 40, textAlign: 'right' };

  return (
    <div style={{ background: BG, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Space Mono', monospace", color: TXT }}>

      <div style={{ background: PNL, borderBottom: `2px solid ${BDR}`, padding: '20px 32px' }}>
        <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, letterSpacing: 4, color: AURORA, textTransform: 'uppercase', marginBottom: 6 }}>
          AETHER · Mathematics
        </div>
        <div style={{ fontFamily: "'Crimson Pro', serif", fontStyle: 'italic', fontSize: 28, color: TXT, marginBottom: 4 }}>
          Rational Function Explorer
        </div>
        <div style={{ fontSize: 10, color: DIM_C, letterSpacing: 1 }}>
          f(x) = k(x - r) / ((x - p₁)(x - p₂)) &nbsp;·&nbsp; asymptotes · intercepts · domain structure
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1, minHeight: 0 }}>

        <div style={{ background: PNL, borderRight: `1px solid ${BDR}`, padding: '24px 20px', overflowY: 'auto' }}>

          <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 16 }}>Parameters</div>

          <div style={rowStyle}>
            <span style={labelStyle}>Root x-intercept</span>
            <input type="range" min={-6} max={6} step={0.1} value={params.root}
              onChange={e => updateParams({ ...params, root: +e.target.value })}
              style={slStyle} />
            <span style={valStyle}>{params.root.toFixed(1)}</span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Pole 1 (VA)</span>
            <input type="range" min={-7} max={0} step={0.1} value={params.pole1}
              onChange={e => updateParams({ ...params, pole1: +e.target.value })}
              style={slStyle} />
            <span style={{ ...valStyle, color: ASYM_COL }}>{params.pole1.toFixed(1)}</span>
          </div>

          <div style={rowStyle}>
            <span style={labelStyle}>Pole 2 (VA)</span>
            <input type="range" min={0} max={7} step={0.1} value={params.pole2}
              onChange={e => updateParams({ ...params, pole2: +e.target.value })}
              style={slStyle} />
            <span style={{ ...valStyle, color: ASYM_COL }}>{params.pole2.toFixed(1)}</span>
          </div>

          <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 16, marginTop: 8 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 12 }}>Characteristics</div>
            {[
              { label: 'x-intercept', val: '(' + params.root.toFixed(1) + ', 0)', col: INTER_COL },
              { label: 'y-intercept', val: '(0, ' + (evalF(0, params)).toFixed(3) + ')', col: GOLD },
              { label: 'Vertical asymptote 1', val: 'x = ' + params.pole1.toFixed(1), col: ASYM_COL },
              { label: 'Vertical asymptote 2', val: 'x = ' + params.pole2.toFixed(1), col: ASYM_COL },
              { label: 'Horizontal asymptote', val: 'y = 0', col: DIM_C },
              { label: 'Degree numerator', val: '1', col: DIM_C },
              { label: 'Degree denominator', val: '2', col: DIM_C },
            ].map(({ label, val, col }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: `1px solid ${BDR}22`, fontSize: 10 }}>
                <span style={{ color: DIM_C }}>{label}</span>
                <span style={{ color: col, fontWeight: 700 }}>{val}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 16, marginTop: 16 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 12 }}>Presets from Notebook</div>
            <button onClick={() => updateParams({ root: 1, pole1: -2, pole2: 3, k: 4 })}
              style={{ width: '100%', padding: '10px 16px', background: AURORA + '15', border: `1px solid ${AURORA}40`, color: AURORA, fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer', marginBottom: 6, textAlign: 'left' }}>
              f(x) = 4(x-1)/((x+2)(x-3))
              <br /><span style={{ color: DIM_C, fontSize: 9 }}>notebook example · x-int (1,0) · y-int (0, 2/3)</span>
            </button>
            <button onClick={() => updateParams({ root: 0, pole1: -3, pole2: 3, k: 1 })}
              style={{ width: '100%', padding: '10px 16px', background: GOLD + '15', border: `1px solid ${GOLD}40`, color: GOLD, fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer', marginBottom: 6, textAlign: 'left' }}>
              f(x) = x / (x²-9)  [odd symmetry]
              <br /><span style={{ color: DIM_C, fontSize: 9 }}>origin intercept · symmetric poles</span>
            </button>
            <button onClick={() => updateParams({ root: 2, pole1: -1, pole2: 1, k: computeK(2, -1, 1) })}
              style={{ width: '100%', padding: '10px 16px', background: QUANT + '10', border: `1px solid ${QUANT}40`, color: QUANT, fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: 'pointer', textAlign: 'left' }}>
              f(x) with poles at x=-1, x=1
              <br /><span style={{ color: DIM_C, fontSize: 9 }}>x-int at 2 · unit poles</span>
            </button>
          </div>

          <div style={{ borderTop: `1px solid ${BDR}`, paddingTop: 16, marginTop: 16 }}>
            <div style={{ fontSize: 8, letterSpacing: 3, textTransform: 'uppercase', color: DIM_C, marginBottom: 10 }}>{'Why deg(denom) > deg(num)?'}</div>
            <div style={{ fontSize: 10, color: DIM_C, lineHeight: 1.8 }}>
              When the denominator degree is higher, the function approaches y=0 as x grows large. No slant asymptote -- gravity pulls it flat.
            </div>
            <div style={{ marginTop: 10, fontSize: 10, color: DIM_C, lineHeight: 1.8 }}>
              The holes and poles live where the denominator vanishes. The function is undefined there -- but only just.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>

          <canvas
            ref={canvasRef}
            style={{ flex: 1, display: 'block', width: '100%', minHeight: 400, cursor: 'crosshair' }}
          />

          <div style={{ borderTop: `1px solid ${BDR}`, background: PNL, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
            {[
              { head: 'ANATOMY', body: 'Every rational function is a ratio of polynomials. The zeros of the denominator create vertical asymptotes -- the function escapes to infinity there.' },
              { head: 'HORIZONTAL ASYMPTOTE', body: 'When deg(num) < deg(denom), HA is y=0. When equal, HA is the ratio of leading coefficients. When num > denom, there is a slant asymptote.' },
              { head: 'END BEHAVIOR', body: 'As x to +/-inf, f(x) to 0. The function is bounded by its horizontal asymptote from both ends -- it cannot escape the field.' },
              { head: 'COHERENCE NOTE', body: 'The 8-14 um IR escape window in radiance-spectrum is structurally similar: a gap between poles (absorption bands) where the function stays finite and transmission survives.' },
            ].map(({ head, body }) => (
              <div key={head} style={{ padding: '12px 16px', borderRight: `1px solid ${BDR}`, fontSize: 9, lineHeight: 1.8, color: DIM_C }}>
                <strong style={{ color: TXT, display: 'block', fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{head}</strong>
                {body}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

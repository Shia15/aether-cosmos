import { useEffect, useRef, useState } from "react";
import paperImg from "@assets/image_1782205801087.jpeg";

/* ── palette — papyrus + AETHER ───────────────────── */
const BG    = "#010408";
const PAPER = "#e8d5a3";
const INK   = "#2a1806";
const INK2  = "#5a3a10";
const TEAL  = "#1fd4c8";
const GOLD  = "#c9a84c";
const VIO   = "#8b5cf6";
const GRN   = "#22c55e";
const DIM   = "#3a5a7a";
const MN    = "'Space Mono', monospace";
const OR    = "'Orbitron', sans-serif";

/* ── unicode Egyptian hieroglyphs ────────────────────
   Block U+13000–U+1342E — supported in modern browsers */
const GLYPHS = [
  '𓀀','𓀁','𓀂','𓀃','𓀄','𓀅','𓀆','𓀇','𓀈','𓀉','𓀊','𓀋','𓀌','𓀍','𓀎','𓀏',
  '𓀐','𓀑','𓀒','𓀓','𓀔','𓀕','𓀖','𓀗','𓀘','𓀙','𓀚','𓀛','𓀜','𓀝','𓀞','𓀟',
  '𓁀','𓁁','𓁂','𓁃','𓁄','𓁅','𓁆','𓁇','𓁈','𓁉','𓁊','𓁋','𓁌','𓁍','𓁎','𓁏',
  '𓂀','𓂁','𓂂','𓂃','𓂄','𓂅','𓂆','𓂇','𓂈','𓂉','𓂊','𓂋','𓂌','𓂍','𓂎','𓂏',
  '𓃀','𓃁','𓃒','𓃓','𓃔','𓃕','𓃖','𓃗','𓃘','𓃙','𓃚','𓃛','𓃜','𓃝','𓃞','𓃟',
  '𓄀','𓄁','𓄂','𓄃','𓄄','𓄅','𓄆','𓄇','𓄈','𓄉','𓄊','𓄋','𓄌','𓄍','𓄎','𓄏',
  '𓅀','𓅁','𓅂','𓅃','𓅄','𓅅','𓅆','𓅇','𓅈','𓅉','𓅊','𓅋','𓅌','𓅍','𓅎','𓅏',
  '𓆀','𓆁','𓆂','𓆃','𓆄','𓆅','𓆆','𓆇','𓆈','𓆉','𓆊','𓆋','𓆌','𓆍','𓆎','𓆏',
  '𓇳','𓇴','𓇵','𓇶','𓈗','𓈘','𓈙','𓈚','𓊪','𓊫','𓊬','𓋴','𓋵','𓌀','𓌁','𓌂',
  '𓎡','𓎢','𓎣','𓏤','𓏥','𓏦','𓏧','𓏨','𓏩','𓏪','𓏫','𓏬','𓏭','𓏮','𓏯','𓏰',
];

/* named glyphs with AETHER meanings */
const NAMED_GLYPHS = [
  { g:'𓇳', name:'Ra / Sun Disk',     aether:'Photon emission — the zero-point field collapses into coherent light',       cat:'Cosmic'  },
  { g:'𓂀', name:'Udjet / Eye of Ra', aether:'Observer collapse — measurement crystallises the wavefunction',               cat:'Quantum' },
  { g:'𓆓', name:'Wadjet / Cobra',    aether:'Kundalini field — standing wave in the DMF substrate',                       cat:'Biology' },
  { g:'𓈗', name:'Water / Nu',        aether:'Quantum vacuum — virtual particle sea beneath the classical surface',         cat:'Substrate'},
  { g:'𓅃', name:'Sacred Ibis',       aether:'Thoth / knowledge accrual — each glyph a crystallised semantic node',        cat:'Mind'    },
  { g:'𓋴', name:'Folded Cloth / S',  aether:'Entropy fold — the sheet in Hilbert space that stores coherent information',  cat:'Math'    },
  { g:'𓎡', name:'Basket / K',        aether:'Boundary condition — the Casimir plate confining the zero-point field',       cat:'Physics' },
  { g:'𓁺', name:'Seated Deity',      aether:'Attractor state — high-coherence basin in the DMF landscape',                cat:'Cosmic'  },
  { g:'𓊪', name:'Mat / P',           aether:'Substrate layer — the biological platform encoding quantum information',       cat:'Biology' },
  { g:'𓄿', name:'Vulture / A',       aether:'Apex predator of concept space — dominant eigenstate after crystallisation',  cat:'Quantum' },
  { g:'𓆑', name:'Horned Viper / F',  aether:'Fibonacci branching — the φ-lattice propagation of signal through substrate', cat:'Math'    },
  { g:'𓌀', name:'Rib / Curved',      aether:'Morphogenetic arc — the Turing curvature that shapes biological form',        cat:'Biology' },
];

const CAT_COLS: Record<string,string> = {Cosmic:GOLD,Quantum:TEAL,Biology:GRN,Substrate:VIO,Mind:'#f97316',Physics:'#ec4899',Math:'#22d3ee'};

/* ── Egyptian figure drawing ─────────────────────── */
function drawFigure(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, sz: number,
  t: number, phase: number,
  col: string, stride: number = 1
) {
  const walk = Math.sin(t * 0.045 + phase) * stride;
  ctx.strokeStyle = col; ctx.fillStyle = col;
  ctx.lineWidth = Math.max(0.8, sz * 0.08);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';

  // head (facing right — profile)
  const hx = x + sz * 0.05, hy = y - sz * 0.9;
  ctx.beginPath(); ctx.arc(hx, hy, sz * 0.13, 0, Math.PI * 2); ctx.fill();
  // neck
  ctx.beginPath(); ctx.moveTo(hx, hy + sz * 0.13); ctx.lineTo(x, y - sz * 0.65); ctx.stroke();
  // torso (slight lean)
  ctx.beginPath(); ctx.moveTo(x, y - sz * 0.65); ctx.lineTo(x - sz * 0.02, y - sz * 0.25); ctx.stroke();
  // arms (one forward one back)
  ctx.beginPath();
  ctx.moveTo(x, y - sz * 0.55);
  ctx.lineTo(x + sz * 0.22 + walk * sz * 0.08, y - sz * 0.42); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y - sz * 0.55);
  ctx.lineTo(x - sz * 0.18 - walk * sz * 0.08, y - sz * 0.40); ctx.stroke();
  // legs
  ctx.beginPath();
  ctx.moveTo(x - sz * 0.02, y - sz * 0.25);
  ctx.lineTo(x + walk * sz * 0.12, y); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - sz * 0.02, y - sz * 0.25);
  ctx.lineTo(x - walk * sz * 0.12, y); ctx.stroke();
}

function drawSeatedFigure(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, sz: number,
  t: number, col: string
) {
  const pulse = 0.97 + 0.03 * Math.sin(t * 0.02);
  ctx.strokeStyle = col; ctx.fillStyle = col;
  ctx.lineWidth = Math.max(1, sz * 0.07); ctx.lineCap = 'round';

  // crown/headdress
  ctx.beginPath();
  ctx.moveTo(x + sz * 0.06 * pulse, y - sz * 1.1);
  ctx.lineTo(x + sz * 0.06 * pulse, y - sz * 1.4);
  ctx.lineTo(x + sz * 0.18 * pulse, y - sz * 1.5);
  ctx.lineTo(x + sz * 0.18 * pulse, y - sz * 1.1); ctx.stroke();
  // head
  ctx.beginPath(); ctx.arc(x + sz * 0.1 * pulse, y - sz * 0.95, sz * 0.15, 0, Math.PI * 2); ctx.fill();
  // neck + torso
  ctx.beginPath();
  ctx.moveTo(x + sz * 0.1 * pulse, y - sz * 0.8);
  ctx.lineTo(x, y - sz * 0.3); ctx.stroke();
  // arm extended (holding scepter)
  ctx.beginPath();
  ctx.moveTo(x, y - sz * 0.65);
  ctx.lineTo(x + sz * 0.4, y - sz * 0.55); ctx.stroke();
  // scepter
  ctx.beginPath();
  ctx.moveTo(x + sz * 0.4, y - sz * 0.55);
  ctx.lineTo(x + sz * 0.4, y - sz * 0.1); ctx.stroke();
  // throne seat
  ctx.beginPath();
  ctx.moveTo(x - sz * 0.2, y - sz * 0.3);
  ctx.lineTo(x + sz * 0.15, y - sz * 0.3); ctx.stroke();
  // throne legs
  ctx.lineWidth = Math.max(1, sz * 0.05);
  ctx.beginPath();
  ctx.moveTo(x - sz * 0.2, y - sz * 0.3); ctx.lineTo(x - sz * 0.2, y); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + sz * 0.1, y - sz * 0.3); ctx.lineTo(x + sz * 0.1, y); ctx.stroke();
  // legs bent
  ctx.lineWidth = Math.max(1, sz * 0.07);
  ctx.beginPath();
  ctx.moveTo(x - sz * 0.05, y - sz * 0.3);
  ctx.lineTo(x - sz * 0.05, y); ctx.stroke();
}

/* ── papyrus simulation canvas ───────────────────── */
function PapyrusCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    cv.width = 900; cv.height = 440;
    const W = cv.width, H = cv.height;
    let t = 0;

    // pre-pick glyph sequence per row
    const glyphRows: string[][] = Array.from({ length: 7 }, (_, ri) =>
      Array.from({ length: 42 }, (__, gi) => GLYPHS[(ri * 7 + gi * 3 + 11) % GLYPHS.length])
    );

    // figure data: 6 rows of marching figures
    const figRows = [
      { y: 0.18, n: 22, sz: 0.065, col: INK,  phase: 0.0, speed: 0.28 },
      { y: 0.32, n: 26, sz: 0.058, col: INK2, phase: 1.1, speed: 0.24 },
      { y: 0.45, n: 28, sz: 0.054, col: INK,  phase: 2.2, speed: 0.22 },
      { y: 0.57, n: 30, sz: 0.050, col: INK2, phase: 0.7, speed: 0.20 },
      { y: 0.70, n: 32, sz: 0.046, col: INK,  phase: 1.5, speed: 0.18 },
      { y: 0.83, n: 34, sz: 0.042, col: INK2, phase: 0.3, speed: 0.16 },
    ];

    const draw = () => {
      // papyrus background
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#dfc990'); bg.addColorStop(0.5, '#e8d5a3'); bg.addColorStop(1, '#d4be88');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

      // papyrus fiber texture (horizontal lines)
      ctx.strokeStyle = 'rgba(160,120,60,0.08)'; ctx.lineWidth = 0.4;
      for (let fy = 0; fy < H; fy += 3) {
        ctx.beginPath(); ctx.moveTo(0, fy + Math.sin(fy * 0.3) * 0.5);
        ctx.lineTo(W, fy + Math.sin(fy * 0.3 + 1.2) * 0.5); ctx.stroke();
      }
      // vertical fibers
      ctx.strokeStyle = 'rgba(160,120,60,0.04)'; ctx.lineWidth = 0.3;
      for (let fx = 0; fx < W; fx += 8) {
        ctx.beginPath(); ctx.moveTo(fx, 0); ctx.lineTo(fx, H); ctx.stroke();
      }

      // register dividers
      const divYs = [0.08, 0.22, 0.36, 0.50, 0.63, 0.76, 0.90].map(r => r * H);
      divYs.forEach(dy => {
        ctx.strokeStyle = 'rgba(90,58,16,0.4)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(0, dy); ctx.lineTo(W, dy); ctx.stroke();
      });

      // border frame
      ctx.strokeStyle = 'rgba(90,58,16,0.7)'; ctx.lineWidth = 3;
      ctx.strokeRect(2, 2, W - 4, H - 4);

      // ── seated deity on left ─────────────────────
      const deitySz = 66;
      drawSeatedFigure(ctx, 52, H * 0.72, deitySz, t, INK);
      // supplicant before deity
      drawFigure(ctx, 130, H * 0.72, 30, t, 0.5, INK, 0);

      // throne platform
      ctx.fillStyle = 'rgba(90,58,16,0.6)';
      ctx.fillRect(18, H * 0.72 + 2, 120, 6);

      // ── hieroglyph text rows ──────────────────────
      // Row 1: top register (full width)
      const glyphY1 = H * 0.05;
      ctx.font = `${Math.floor(H * 0.055)}px serif`;
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let gi = 0; gi < 38; gi++) {
        const gx = 8 + gi * ((W - 16) / 38);
        const glyph = glyphRows[0][(gi + Math.floor(t * 0.008)) % glyphRows[0].length];
        ctx.globalAlpha = 0.75 + 0.15 * Math.sin(t * 0.03 + gi * 0.4);
        ctx.fillText(glyph, gx, glyphY1);
      }
      ctx.globalAlpha = 1;

      // Left column glyphs (beside seated deity)
      ctx.font = `${Math.floor(H * 0.042)}px serif`;
      const leftCol = [
        '𓇳','𓂀','𓆓','𓅃','𓋴','𓎡','𓊪','𓄿','𓆑','𓌀','𓀁','𓁺',
      ];
      for (let li = 0; li < leftCol.length; li++) {
        const lx = 14 + (li % 3) * 22;
        const ly = H * 0.09 + Math.floor(li / 3) * 26;
        ctx.globalAlpha = 0.6 + 0.25 * Math.sin(t * 0.04 + li * 0.8);
        ctx.fillStyle = li % 2 === 0 ? INK : INK2;
        ctx.fillText(leftCol[li], lx, ly);
      }
      ctx.globalAlpha = 1;

      // Inline glyph rows between figure rows
      const midGlyphRows = [
        { y: 0.25, start: 180, size: 0.038 },
        { y: 0.395, start: 210, size: 0.034 },
        { y: 0.535, start: 240, size: 0.032 },
        { y: 0.665, start: 270, size: 0.030 },
        { y: 0.79,  start: 300, size: 0.028 },
      ];
      midGlyphRows.forEach(({ y, start, size }, ri) => {
        ctx.font = `${Math.floor(H * size)}px serif`;
        ctx.fillStyle = INK; ctx.textAlign = 'center';
        for (let gi = 0; gi < 36; gi++) {
          const gx = start + gi * ((W - start - 8) / 36);
          const glyph = glyphRows[ri + 1][(gi + Math.floor(t * 0.006 + ri * 3)) % glyphRows[ri + 1].length];
          ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 0.035 + gi * 0.6 + ri);
          ctx.fillText(glyph, gx, y * H);
        }
        ctx.globalAlpha = 1;
      });

      // ── marching figure rows ──────────────────────
      figRows.forEach(({ y, n, sz, col, phase, speed }, ri) => {
        const fy = y * H;
        const fSz = sz * H;
        const startX = ri < 2 ? 178 : 182;
        const spacingW = (W - startX - 8) / n;
        for (let fi = 0; fi < n; fi++) {
          const offset = (t * speed + fi * 0.15) % spacingW;
          const fx = startX + fi * spacingW + offset * 0.4;
          if (fx > W - 4) continue;
          drawFigure(ctx, fx, fy, fSz, t, phase + fi * 0.22, col);
        }
      });

      // ── AETHER overlay ticks on glyphs ───────────
      if (t % 80 < 3) {
        const flashGx = 8 + Math.floor(Math.random() * 38) * ((W - 16) / 38);
        ctx.fillStyle = `rgba(31,212,200,0.18)`;
        ctx.fillRect(flashGx - 12, H * 0.02, 24, H * 0.065);
      }

      // bottom register label
      ctx.fillStyle = 'rgba(90,58,16,0.35)'; ctx.font = '8px Space Mono';
      ctx.textAlign = 'left'; ctx.globalAlpha = 1;
      ctx.fillText('AETHER CODEX · PAPYRUS SIMULATION · EGYPTIAN HIEROGLYPHS · REGISTER SYSTEM · DIGITAL ANIMATION', 8, H - 5);

      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <canvas ref={ref}
      style={{ width: '100%', height: 'auto', borderRadius: 4, display: 'block', boxShadow: '0 4px 32px rgba(0,0,0,0.6)' }} />
  );
}

/* ── glowing hieroglyph cell ─────────────────────── */
function GlyphDisplay({ g, name, aether, cat }: { g: string; name: string; aether: string; cat: string }) {
  const [hovered, setHovered] = useState(false);
  const col = CAT_COLS[cat] ?? TEAL;
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? `${col}12` : 'rgba(0,0,0,0.35)', border: `1px solid ${col}${hovered ? 'aa' : '22'}`,
        borderRadius: 4, padding: '10px 12px', cursor: 'default', transition: 'all .2s' }}>
      <div style={{ fontSize: 40, lineHeight: 1.1, marginBottom: 6, filter: hovered ? `drop-shadow(0 0 8px ${col})` : 'none', transition: 'filter .2s' }}>
        {g}
      </div>
      <div style={{ fontFamily: MN, fontSize: 8, color: col, letterSpacing: 1, marginBottom: 3 }}>{name}</div>
      <div style={{ fontFamily: MN, fontSize: 7.5, color: CAT_COLS[cat] + '88', marginBottom: 4 }}>{cat}</div>
      {hovered && <div style={{ fontSize: 10, color: 'rgba(200,220,240,0.75)', lineHeight: 1.6 }}>{aether}</div>}
    </div>
  );
}

/* ── header canvas: animated glyph ticker ─────────── */
function GlyphTickerCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    cv.width = 900; cv.height = 72;
    const W = cv.width, H = cv.height;
    let t = 0;
    const row1 = Array.from({ length: 60 }, (_, i) => GLYPHS[(i * 7 + 3) % GLYPHS.length]);
    const row2 = Array.from({ length: 60 }, (_, i) => GLYPHS[(i * 5 + 11) % GLYPHS.length]);
    const draw = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#dfc990ee'); bg.addColorStop(1, '#c8b070ee');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.font = '20px serif';
      for (let i = 0; i < 44; i++) {
        const x = ((i * 21 - t * 0.7) % (W + 21) + W + 21) % (W + 21);
        ctx.fillStyle = `rgba(42,24,6,${0.5 + 0.3 * Math.sin(t * 0.04 + i * 0.7)})`;
        ctx.fillText(row1[i % row1.length], x, 22);
      }
      ctx.font = '16px serif';
      for (let i = 0; i < 54; i++) {
        const x = ((i * 17 + t * 0.5) % (W + 17) + W + 17) % (W + 17);
        ctx.fillStyle = `rgba(90,58,16,${0.4 + 0.25 * Math.sin(t * 0.03 + i * 0.5)})`;
        ctx.fillText(row2[i % row2.length], x, 52);
      }
      // AETHER teal flash on random glyph
      if (t % 55 < 2) {
        const fx = Math.random() * W;
        ctx.fillStyle = 'rgba(31,212,200,0.22)';
        ctx.fillRect(fx - 10, 4, 20, 64);
      }
      ctx.strokeStyle = 'rgba(90,58,16,0.5)'; ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, W - 2, H - 2);
      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width: '100%', height: 'auto', borderRadius: 4, display: 'block' }} />;
}

/* ── main page ───────────────────────────────────── */
export default function EgyptianCodexPage() {
  const card = (col = TEAL): React.CSSProperties => ({
    background: 'rgba(0,0,0,0.4)', border: `1px solid ${col}22`, borderRadius: 4, padding: '12px 16px',
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 7.5, letterSpacing: '0.2em', color: DIM,
    textTransform: 'uppercase', marginBottom: 10, paddingBottom: 4,
    borderBottom: `1px solid rgba(31,212,200,0.12)`,
  };

  return (
    <div style={{ minHeight: '100%', background: BG, color: '#d4e8f7', fontFamily: "'Rajdhani', sans-serif", overflowY: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px' }}>

        {/* ── glyph ticker header ── */}
        <GlyphTickerCanvas />

        {/* ── title ── */}
        <div style={{ marginTop: 14, marginBottom: 18 }}>
          <div style={{ display: 'inline-block', border: `1px solid rgba(201,168,76,0.5)`, padding: '3px 10px', fontSize: 9, letterSpacing: '0.2em', color: `${GOLD}cc`, fontFamily: MN, marginBottom: 8 }}>
            DIGITAL SIMULATION
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 22, fontWeight: 900, letterSpacing: 2, color: GOLD, textShadow: `0 0 24px ${GOLD}55`, margin: '4px 0' }}>
            Egyptian Codex · Hieroglyphic Register System
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(200,185,140,0.75)', maxWidth: 700, lineHeight: 1.7, margin: 0 }}>
            Digital animation of the papyrus register system — 6 rows of walking figures, hieroglyphic text bands, and the seated deity scene — recomposed in real time from the 1,071-glyph Egyptian Hieroglyph Unicode block. Each symbol is mapped to an AETHER semantic node.
          </p>
        </div>

        {/* ── papyrus simulation + reference image ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16, marginBottom: 16 }}>
          <div style={card(GOLD)}>
            <div style={secLabel}>Live Papyrus Simulation · Animated Register System</div>
            <PapyrusCanvas />
            <div style={{ marginTop: 8, fontFamily: MN, fontSize: 8, color: DIM, lineHeight: 1.8 }}>
              ◆ Figures march in 6 registers at decreasing scale (perspective recession) · Hieroglyph bands between rows animate via the Unicode Egyptian block · Deity throne scene on left with scepter · Papyrus fiber texture rendered in real time
            </div>
          </div>

          {/* reference image */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={card(GOLD)}>
              <div style={secLabel}>Source Reference</div>
              <img src={paperImg} alt="Egyptian papyrus reference"
                style={{ width: '100%', borderRadius: 3, display: 'block', opacity: 0.92 }} />
              <div style={{ fontFamily: MN, fontSize: 7.5, color: DIM, marginTop: 6, lineHeight: 1.6 }}>
                Multi-register papyrus · seated deity (left) · 6 procession rows · hieroglyphic captions between registers · perspective reduction toward bottom
              </div>
            </div>
            <div style={{ ...card(TEAL), fontSize: 11, color: 'rgba(180,220,240,0.75)', lineHeight: 1.7 }}>
              <div style={{ fontFamily: OR, fontSize: 9, color: TEAL, letterSpacing: 1, marginBottom: 6 }}>AETHER · Register Model</div>
              The papyrus register system is the ancient prototype of AETHER's layered coherence stack — each row is a <em>semantic band</em>, encoding entities at decreasing abstraction. The hieroglyphs are compressed knowledge nodes; the figures are execution agents; the deity is the attractor basin. <strong style={{ color: GOLD }}>The whole scroll is a crystallised knowledge graph.</strong>
            </div>
          </div>
        </div>

        {/* ── glyph grid ── */}
        <div style={{ ...card(GOLD), marginBottom: 16 }}>
          <div style={secLabel}>Hieroglyphic Semantic Map · hover to reveal AETHER meaning</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
            {NAMED_GLYPHS.map(ng => <GlyphDisplay key={ng.g} {...ng} />)}
          </div>
        </div>

        {/* ── animated glyph stream ── */}
        <div style={{ ...card(), marginBottom: 16 }}>
          <div style={secLabel}>Unicode Egyptian Block Sample · 𓀀–𓐮 · 1,071 characters</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {GLYPHS.slice(0, 120).map((g, i) => (
              <span key={i} title={`U+${(0x13000 + i).toString(16).toUpperCase()}`}
                style={{ fontSize: 22, lineHeight: 1.2, color: `rgba(200,185,140,${0.3 + 0.5 * ((i % 7) / 7)})`,
                  cursor: 'default', padding: '0 1px', transition: 'color .15s',
                  fontFamily: 'serif' }}>
                {g}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: MN, fontSize: 8, color: DIM, marginTop: 8 }}>
            Unicode block U+13000–U+1342E · Gardiner sign list · 24 categories (A: man · B: woman · C: deity · D: body parts · E: mammals · F: reptiles · G: birds · H: insects · I: plants · K: fish · L: invertebrates · M: landscape · N: sky · O: buildings · P: ships · Q: furniture · R: temple · S: regalia · T: weapons · U: tools · V: rope · W: vessels · X: bread · Y: music · Z: geometric)
          </div>
        </div>

        {/* ── AETHER register / knowledge model ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { col: GOLD, t: 'Register Coherence', eq: 'L1 → L5 semantic bands', b: 'Each papyrus register corresponds to an AETHER coherence layer. Top register = abstract deity realm (L5 — pure eigenstate). Bottom register = physical human plane (L1 — DMF substrate). The hieroglyphs bridge registers with compressed semantic nodes.' },
            { col: TEAL, t: 'Glyph = Compressed Knowledge', eq: '𓇳 ≡ |photon⟩ attractor', b: 'Egyptian hieroglyphs are the earliest known lossy compression of reality — each sign encodes a category, sound, and concept simultaneously. In AETHER terms, each glyph is a crystallised semantic cluster collapsed from a wider probability field.' },
            { col: VIO, t: 'Figure Procession = Execution Flow', b: 'The repeating figures are not decoration — they are execution traces. Each row is a phase of a computation: offering, counting, recording. The procession is an algorithm rendered in human form. AETHER maps this to agent task sequences in the DMF field.', eq: '∑ agents → coherent output' },
            { col: GRN, t: 'Seated Deity = Attractor Basin', eq: 'ρ_deity = Tr_env(|ψ⟩⟨ψ|)', b: 'The large seated figure is a stable high-coherence state — the fixed point of the entire system. All processions lead toward it; all hieroglyphs reference it. This is AETHER\'s crystallisation attractor: the state of maximum semantic density.' },
            { col: '#f97316', t: 'Perspective Recession = Abstraction', eq: 'scale ∝ 1/(L − layer)', b: 'The bottom rows are smaller — not because figures are distant, but because they represent more abstract or subordinate roles. Egyptian registers use scale as ontological rank. AETHER uses coherence depth C(x,t) the same way.' },
            { col: '#ec4899', t: 'Hieroglyph → Qubit Analogy', eq: '𓂀 = |measure⟩ operator', b: 'The Eye of Ra (𓂀) performs measurement — collapsing a superposition of possibilities into a single seen outcome. It is the quantum measurement operator encoded in stone 3,000 years before quantum mechanics. AETHER reclaims this symbol as the observation gate.' },
          ].map(({ col, t: title, eq, b }) => (
            <div key={title} style={{ ...card(col), borderColor: col + '22' }}>
              <div style={{ fontFamily: OR, fontSize: 9, color: col, letterSpacing: 1, marginBottom: 4 }}>{title}</div>
              <div style={{ fontFamily: MN, fontSize: 8.5, color: col + '88', marginBottom: 6 }}>{eq}</div>
              <div style={{ fontSize: 11, color: 'rgba(200,220,240,0.65)', lineHeight: 1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ marginTop: 16, paddingTop: 10, borderTop: `1px solid rgba(31,212,200,0.1)`, fontFamily: MN, fontSize: 7.5, color: DIM, letterSpacing: '0.12em', textAlign: 'center' }}>
          AETHER EGYPTIAN CODEX · UNICODE HIEROGLYPH BLOCK U+13000–U+1342E · PAPYRUS REGISTER SIMULATION · KNOWLEDGE GRAPH ARCHAEOLOGY · CRYSTALLISATION MODEL
        </div>
      </div>
    </div>
  );
}

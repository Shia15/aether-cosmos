import { useEffect, useMemo, useRef, useState } from "react";
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
      const NOTO = "'Noto Sans Egyptian Hieroglyphs', serif";
      // Row 1: top register (full width)
      const glyphY1 = H * 0.05;
      ctx.font = `${Math.floor(H * 0.055)}px ${NOTO}`;
      ctx.fillStyle = INK; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      for (let gi = 0; gi < 38; gi++) {
        const gx = 8 + gi * ((W - 16) / 38);
        const glyph = glyphRows[0][(gi + Math.floor(t * 0.008)) % glyphRows[0].length];
        ctx.globalAlpha = 0.75 + 0.15 * Math.sin(t * 0.03 + gi * 0.4);
        ctx.fillText(glyph, gx, glyphY1);
      }
      ctx.globalAlpha = 1;

      // Left column glyphs (beside seated deity)
      ctx.font = `${Math.floor(H * 0.042)}px ${NOTO}`;
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
        ctx.font = `${Math.floor(H * size)}px ${NOTO}`;
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
    const NOTO = "'Noto Sans Egyptian Hieroglyphs', serif";
    const draw = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#dfc990ee'); bg.addColorStop(1, '#c8b070ee');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
      ctx.font = `20px ${NOTO}`;
      for (let i = 0; i < 44; i++) {
        const x = ((i * 21 - t * 0.7) % (W + 21) + W + 21) % (W + 21);
        ctx.fillStyle = `rgba(42,24,6,${0.5 + 0.3 * Math.sin(t * 0.04 + i * 0.7)})`;
        ctx.fillText(row1[i % row1.length], x, 22);
      }
      ctx.font = `16px ${NOTO}`;
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

/* ── Gardiner sign-list category boundaries ─────────
   U+13000–U+1342E = 1,071 code points exactly.
   Start positions are approximate; follow the Unicode
   Egyptian Hieroglyphs code chart order. ─────────── */
const GARDINER_CATS = [
  { start:0x13000, label:"A",  name:"Man and his occupations",         col:"#c9a84c" },
  { start:0x13041, label:"B",  name:"Woman",                            col:"#f97316" },
  { start:0x1304A, label:"C",  name:"Anthropomorphic deities",          col:"#8b5cf6" },
  { start:0x1306D, label:"D",  name:"Parts of the human body",          col:"#1fd4c8" },
  { start:0x130B9, label:"E",  name:"Mammals",                          col:"#22c55e" },
  { start:0x130D9, label:"F",  name:"Parts of mammals",                 col:"#84cc16" },
  { start:0x1310B, label:"G",  name:"Birds",                            col:"#06b6d4" },
  { start:0x13143, label:"H",  name:"Parts of birds",                   col:"#38bdf8" },
  { start:0x1314B, label:"I",  name:"Reptiles and amphibians",          col:"#4ade80" },
  { start:0x1315C, label:"K",  name:"Fish and aquatic animals",         col:"#60a5fa" },
  { start:0x13165, label:"L",  name:"Invertebrates and lesser animals", col:"#a78bfa" },
  { start:0x1316C, label:"M",  name:"Trees and plants",                 col:"#34d399" },
  { start:0x13197, label:"N",  name:"Sky, earth, and water",            col:"#93c5fd" },
  { start:0x131CA, label:"O",  name:"Buildings and monuments",          col:"#fbbf24" },
  { start:0x131FB, label:"P",  name:"Ships and boats",                  col:"#fb923c" },
  { start:0x13208, label:"Q",  name:"Domestic furniture",               col:"#f472b6" },
  { start:0x1320E, label:"R",  name:"Temple furniture",                 col:"#e879f9" },
  { start:0x13227, label:"S",  name:"Crowns, dress, and insignia",      col:"#c084fc" },
  { start:0x13260, label:"T",  name:"Warfare, hunting, and butchery",   col:"#f87171" },
  { start:0x13279, label:"U",  name:"Agriculture and crafts",           col:"#fb923c" },
  { start:0x132A4, label:"V",  name:"Rope, fibre, and baskets",         col:"#a3e635" },
  { start:0x132C4, label:"W",  name:"Stone and ceramic vessels",        col:"#94a3b8" },
  { start:0x132DB, label:"X",  name:"Loaves and cakes",                 col:"#d4a574" },
  { start:0x132E3, label:"Y",  name:"Writing, music, and games",        col:"#67e8f9" },
  { start:0x132E9, label:"Z",  name:"Geometric shapes",                 col:"#e2e8f0" },
  { start:0x132F5, label:"Aa", name:"Unclassified signs and numerals",  col:"#c9a84c" },
] as const;

type GCat = typeof GARDINER_CATS[number];

function getCat(cp: number): GCat {
  let best: GCat = GARDINER_CATS[0];
  for (const c of GARDINER_CATS) { if (cp >= c.start) best = c; }
  return best;
}

/* ── full 1,071-glyph searchable register ────────── */
function HieroglyphRegister() {
  const [query,  setQuery]  = useState("");
  const [catF,   setCatF]   = useState("ALL");
  const [sz,     setSz]     = useState<"S"|"M"|"L">("M");
  const [hovCp,  setHovCp]  = useState(-1);

  /* generate all 1,071 glyphs once */
  const all = useMemo(() =>
    Array.from({length: 1071}, (_, i) => {
      const cp  = 0x13000 + i;
      const cat = getCat(cp);
      return { char: String.fromCodePoint(cp), cp, cat };
    }), []);

  const catCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const g of all) m[g.cat.label] = (m[g.cat.label] ?? 0) + 1;
    return m;
  }, [all]);

  const shown = useMemo(() => {
    let g = all;
    if (catF !== "ALL") g = g.filter(x => x.cat.label === catF);
    if (query) {
      const q = query.toLowerCase();
      g = g.filter(x =>
        cp5(x.cp).toLowerCase().includes(q) ||
        x.char === q
      );
    }
    return g;
  }, [all, catF, query]);

  /* build flat list with category headers injected */
  type HdrItem = { type:"hdr"; cat:GCat; count:number };
  type GlItem  = { type:"glyph"; char:string; cp:number; cat:GCat };
  const items = useMemo((): (HdrItem|GlItem)[] => {
    const result: (HdrItem|GlItem)[] = [];
    const showHeaders = catF === "ALL" && !query;
    let lastLabel = "";
    for (const g of shown) {
      if (showHeaders && g.cat.label !== lastLabel) {
        result.push({ type:"hdr", cat:g.cat, count:catCounts[g.cat.label]??0 });
        lastLabel = g.cat.label;
      }
      result.push({ type:"glyph", char:g.char, cp:g.cp, cat:g.cat });
    }
    return result;
  }, [shown, catF, query, catCounts]);

  const cellPx = sz==="S" ? 42  : sz==="M" ? 58  : 84;
  const glFs   = sz==="S" ? 19  : sz==="M" ? 28  : 44;
  const labFs  = sz==="S" ? 5.5 : sz==="M" ? 6.5 : 8;

  const pillBase: React.CSSProperties = {
    fontFamily:MN, fontSize:8, padding:"3px 9px", borderRadius:12,
    cursor:"pointer", letterSpacing:0.5, whiteSpace:"nowrap",
    border:"1px solid transparent", transition:"all .15s",
  };

  return (
    <div>
      {/* ── controls ── */}
      <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginBottom:10}}>
        <input value={query} onChange={e=>setQuery(e.target.value)}
          placeholder="Search U+130…"
          style={{fontFamily:MN, fontSize:11, padding:"5px 10px", borderRadius:4, width:170,
            background:"rgba(0,0,0,0.55)", border:`1px solid ${TEAL}50`, color:TEAL, outline:"none"}} />
        <span style={{fontFamily:MN, fontSize:9, color:DIM}}>
          {shown.length.toLocaleString()} / 1,071
        </span>
        <div style={{marginLeft:"auto", display:"flex", gap:3}}>
          {(["S","M","L"] as const).map(s=>(
            <button key={s} onClick={()=>setSz(s)}
              style={{...pillBase,
                borderColor:`${sz===s?GOLD:DIM}40`,
                background:sz===s?`${GOLD}20`:"transparent",
                color:sz===s?GOLD:DIM}}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── category filter pills ── */}
      <div style={{display:"flex", flexWrap:"wrap", gap:3, marginBottom:14}}>
        <button onClick={()=>setCatF("ALL")}
          style={{...pillBase,
            borderColor:`${catF==="ALL"?TEAL:DIM}40`,
            background:catF==="ALL"?`${TEAL}18`:"transparent",
            color:catF==="ALL"?TEAL:DIM}}>
          ALL · 1,071
        </button>
        {GARDINER_CATS.map(c=>(
          <button key={c.label} onClick={()=>setCatF(c.label)}
            style={{...pillBase,
              borderColor:`${catF===c.label?c.col:DIM}40`,
              background:catF===c.label?`${c.col}18`:"transparent",
              color:catF===c.label?c.col:DIM}}>
            {c.label} · {catCounts[c.label]??0}
          </button>
        ))}
      </div>

      {/* ── glyph grid ── */}
      <div style={{display:"flex", flexWrap:"wrap", gap:2, alignItems:"flex-start"}}>
        {items.map((item, idx) => {
          if (item.type === "hdr") {
            const c = item.cat;
            return (
              <div key={`h-${c.label}`} style={{
                width:"100%", display:"flex", alignItems:"baseline", gap:10,
                padding:"10px 0 5px", marginTop: idx===0 ? 0 : 8,
                borderTop:`1px solid ${c.col}25`}}>
                <span style={{fontFamily:MN, fontSize:10, color:c.col, fontWeight:700, letterSpacing:2}}>
                  {c.label}
                </span>
                <span style={{fontFamily:MN, fontSize:8.5, color:`${c.col}90`}}>
                  {c.name}
                </span>
                <span style={{fontFamily:MN, fontSize:7.5, color:DIM}}>
                  · {item.count} signs · U+{c.start.toString(16).toUpperCase().padStart(5,"0")}
                </span>
              </div>
            );
          }
          /* glyph cell */
          const isHov = hovCp === item.cp;
          const col   = item.cat.col;
          return (
            <div key={item.cp}
              onMouseEnter={()=>setHovCp(item.cp)}
              onMouseLeave={()=>setHovCp(-1)}
              title={`${cp5(item.cp)}  ·  Gardiner ${item.cat.label}  ·  ${item.cat.name}`}
              style={{
                width:cellPx, textAlign:"center", padding:"5px 2px 3px",
                background: isHov ? `${col}18` : "rgba(200,185,140,0.04)",
                border:`1px solid ${isHov ? col+"55" : "rgba(100,100,100,0.1)"}`,
                borderRadius:3, cursor:"default",
                transition:"background .1s,border .1s",
                boxSizing:"border-box", userSelect:"none",
              } as React.CSSProperties}>
              <div style={{
                fontSize:glFs, lineHeight:1.05,
                color: isHov ? "#fff" : "#d4c89a",
                filter: isHov ? `drop-shadow(0 0 6px ${col})` : "none",
                fontFamily:"'Noto Sans Egyptian Hieroglyphs', serif",
                transition:"color .1s, filter .1s",
              }}>
                {item.char}
              </div>
              <div style={{
                fontFamily:MN, fontSize:labFs,
                color: isHov ? col : DIM,
                marginTop:2, letterSpacing:0,
                transition:"color .1s",
              }}>
                {cp5(item.cp)}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── footer note ── */}
      <div style={{fontFamily:MN, fontSize:7.5, color:DIM, marginTop:10, lineHeight:1.9}}>
        Unicode block U+13000–U+1342E · 1,071 code points · Gardiner category boundaries are approximate ·
        hover any glyph for full codepoint · unassigned positions render as □ or are invisible ·
        best rendered with <em>Noto Sans Egyptian Hieroglyphs</em> (Google Fonts) or macOS/iOS system fonts
      </div>
    </div>
  );
}

/* helper: format code point as U+1XXXX */
function cp5(cp: number): string {
  return "U+" + cp.toString(16).toUpperCase().padStart(5, "0");
}

/* ═══════════════════════════════════════════════════
   SECTION II -- COHERENCE CODEX REFINEMENT
   G -> Sigma -> G transformation, Fibonacci indices
   ═══════════════════════════════════════════════════ */

interface FibLevel {
  n: number; fib: number; glyph: string;
  name: string; scale: string; hz: string; col: string; role: string;
}

const FIB_LEVELS: FibLevel[] = [
  {n:0,fib:1, glyph:'𓃀',name:'Root Transform',  scale:'Cellular · 10 um',  hz:'0.01 Hz', col:GOLD,
   role:'G -- base state. Undifferentiated substrate potential of the Dark Matter Field (DMF). Scarab encodes metamorphosis at zero-point.'},
  {n:1,fib:1, glyph:'𓇋',name:'Reed Signal',     scale:'Molecular · 1 nm',  hz:'0.1 Hz',  col:GRN,
   role:'Sigma -- first coherence emergence. ATP synthesis waveform; the reed glyph is the simplest phoneme, simplest signal.'},
  {n:2,fib:2, glyph:'𓂀',name:'Observer Collapse',scale:'Synaptic · 10 nm', hz:'1 Hz',    col:TEAL,
   role:'G -- measurement-induced localisation. The Eye collapses the wavefunction; duality between seer and seen.'},
  {n:3,fib:3, glyph:'𓊽',name:'Spinal Stability', scale:'Neural · 1 mm',   hz:'8 Hz',    col:VIO,
   role:'Sigma -- Schumann-coherent alpha-band anchor. The Djed pillar is the stabilised backbone of coherent field.'},
  {n:4,fib:5, glyph:'𓆑',name:'Phi Lattice',      scale:'Organ · 10 cm',   hz:'40 Hz',   col:'#f97316',
   role:'G -- gamma binding. 5-fold phi-lattice symmetry in receptor arrays; horned viper encodes branching at phi.'},
  {n:5,fib:8, glyph:'𓇳',name:'Solar Coherence',  scale:'Organism · 1 m',  hz:'528 Hz',  col:GOLD,
   role:'Sigma -- circadian photon cascade. F10.7 solar flux coupling point. Ra disk encodes 8-directional irradiance.'},
  {n:6,fib:13,glyph:'𓆓',name:'Kundalini Field',  scale:'Collective · 10 m',hz:'7.83 Hz', col:'#ec4899',
   role:'G -- Schumann resonance entrainment. 13-coil standing wave in DMF substrate. Cobra encodes rising field energy.'},
  {n:7,fib:21,glyph:'𓈗',name:'Toroidal Eternity',scale:'Planetary · 10 Mm',hz:'0.1 mHz', col:TEAL,
   role:'Sigma -- toroidal boundary. K-index geomagnetic coupling closes the G->Sigma->G loop. Water seals the torus.'},
];

interface FibCoherenceState { sel: number | null; t: number; }

function FibCoherenceSection() {
  const [st, setSt] = useState<FibCoherenceState>({sel:null, t:0});
  const rafRef = useRef(0);
  const t0 = useRef(0);

  useEffect(() => {
    t0.current = performance.now();
    function tick() {
      const elapsed = (performance.now() - t0.current) * 0.001;
      setSt(prev => ({...prev, t: elapsed}));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const { sel, t } = st;

  return (
    <div style={{fontFamily: MN}}>
      {/* G->Sigma->G header bar */}
      <div style={{display:'flex', alignItems:'center', gap:12, marginBottom:14, flexWrap:'wrap'}}>
        {(['G','->','\u03A3','->','G'] as string[]).map((s,i) => (
          <span key={i} style={{
            fontFamily: i===2 ? "'Rajdhani',sans-serif" : MN,
            fontSize: i===2 ? 22 : (i%2===0 ? 18 : 11),
            color: i===2 ? TEAL : GOLD,
            opacity: i%2===1 ? 0.4 : 1,
            letterSpacing: i%2===0 ? 2 : 0,
          }}>{s}</span>
        ))}
        <span style={{marginLeft:'auto', fontSize:8, color:DIM, letterSpacing:1}}>Fibonacci-Indexed Coherence Stack</span>
      </div>

      {/* Stack rows */}
      {FIB_LEVELS.map((lvl, i) => {
        const pulse = Math.sin(t * lvl.fib * 0.7 + i * 0.9) * 0.5 + 0.5;
        const isG = lvl.n % 2 === 0;
        const isSelected = sel === i;
        const barW = Math.round((0.25 + pulse * 0.75) * 100);
        return (
          <div key={i}
            onClick={() => setSt(prev => ({...prev, sel: prev.sel===i ? null : i}))}
            style={{display:'flex', alignItems:'center', gap:8, padding:'6px 10px', marginBottom:3,
              background: isSelected ? lvl.col+'12' : 'rgba(0,0,0,0.22)',
              border:`1px solid ${isSelected ? lvl.col+'55' : lvl.col+'18'}`,
              borderRadius:3, cursor:'pointer', transition:'all .2s'}}>
            {/* State symbol */}
            <span style={{width:14, textAlign:'center', fontFamily:"'Rajdhani',sans-serif",
              fontSize:14, color: isG ? GOLD : TEAL, flexShrink:0}}>
              {isG ? 'G' : '\u03A3'}
            </span>
            {/* Fibonacci number */}
            <span style={{width:18, textAlign:'right', fontSize:10, color:lvl.col, opacity:.7, flexShrink:0}}>
              {lvl.fib}
            </span>
            {/* Egyptian glyph */}
            <span style={{fontSize:24, fontFamily:"'Noto Sans Egyptian Hieroglyphs',serif",
              lineHeight:1, flexShrink:0,
              filter:`drop-shadow(0 0 5px ${lvl.col}70)`}}>
              {lvl.glyph}
            </span>
            {/* Animated coherence bar */}
            <div style={{flex:1, height:4, background:'rgba(255,255,255,0.06)', borderRadius:2, overflow:'hidden'}}>
              <div style={{height:'100%', borderRadius:2, background:lvl.col,
                width:`${barW}%`, transition:'width .08s',
                boxShadow:`0 0 8px ${lvl.col}50`}}/>
            </div>
            {/* Name + Hz */}
            <div style={{minWidth:110, flexShrink:0}}>
              <div style={{fontSize:8, color:lvl.col, letterSpacing:.5}}>{lvl.name}</div>
              <div style={{fontSize:7, color:DIM, marginTop:1}}>{lvl.hz}</div>
            </div>
            {/* Scale */}
            <div style={{minWidth:90, fontSize:7, color:DIM, flexShrink:0, display:'none'}}>
              {lvl.scale}
            </div>
          </div>
        );
      })}

      {/* Expanded detail */}
      {sel !== null && (
        <div style={{padding:'10px 14px', marginTop:6,
          background:`${FIB_LEVELS[sel].col}08`,
          border:`1px solid ${FIB_LEVELS[sel].col}30`, borderRadius:3}}>
          <div style={{fontSize:8, color:FIB_LEVELS[sel].col, letterSpacing:1, marginBottom:5}}>
            {'F(' + FIB_LEVELS[sel].n + ') = ' + FIB_LEVELS[sel].fib + '  \u00B7  ' + FIB_LEVELS[sel].name + '  \u00B7  ' + FIB_LEVELS[sel].scale}
          </div>
          <div style={{fontSize:11, color:'rgba(200,220,240,0.7)', lineHeight:1.65}}>
            {FIB_LEVELS[sel].role}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION III -- TOROIDAL SIM + REAL EPHEMERIS
   CGLE lattice on torus, planetary boundary conditions
   ═══════════════════════════════════════════════════ */

interface PlanetEph { name:string; L0:number; n:number; col:string; dotR:number; }

const PLANETS_EPH: PlanetEph[] = [
  {name:'Mercury',L0:252.25,n:4.0923,col:'#aaaaaa',dotR:3},
  {name:'Venus',  L0:181.98,n:1.6021,col:'#f97316',dotR:5},
  {name:'Earth',  L0:100.46,n:0.9856,col:'#1fd4c8',dotR:5},
  {name:'Mars',   L0:355.45,n:0.5240,col:'#ef4444',dotR:4},
  {name:'Jupiter',L0:34.40, n:0.0831,col:'#c9a84c',dotR:8},
  {name:'Saturn', L0:50.08, n:0.0334,col:'#a78bfa',dotR:6},
];

function getJ2000Days(): number {
  return Date.now() / 86400000 + 2440587.5 - 2451545.0;
}
function getPlanetLon(p: PlanetEph): number {
  const d = getJ2000Days();
  return ((p.L0 + p.n * d) % 360 + 360) % 360;
}

function ToroidalSimCanvas() {
  const cgleRef  = useRef<HTMLCanvasElement>(null);
  const orbitRef = useRef<HTMLCanvasElement>(null);
  const rafRef   = useRef(0);

  useEffect(() => {
    const cgleCv  = cgleRef.current;  if (!cgleCv) return;
    const orbitCv = orbitRef.current; if (!orbitCv) return;
    const cctx = cgleCv.getContext('2d');  if (!cctx) return;
    const octx = orbitCv.getContext('2d'); if (!octx) return;

    const N = 64;
    cgleCv.width  = N; cgleCv.height = N;
    orbitCv.width = 200; orbitCv.height = 200;

    const wr  = new Float32Array(N * N);
    const wi  = new Float32Array(N * N);
    const nwr = new Float32Array(N * N);
    const nwi = new Float32Array(N * N);

    const initLons = PLANETS_EPH.map(p => getPlanetLon(p));

    // Planet-seeded initial conditions
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const idx = y * N + x;
        let ph = Math.random() * Math.PI * 2;
        initLons.forEach((lon, pi) => {
          ph += 0.07 * Math.sin(lon * Math.PI / 180 + (x / N + y / N) * (pi + 1) * 1.3);
        });
        const r = 0.8 + Math.random() * 0.2;
        wr[idx] = r * Math.cos(ph);
        wi[idx] = r * Math.sin(ph);
      }
    }

    const alpha = 1.0, beta = -1.4, dt = 0.05;

    // Synchronous warmup -- runs once
    for (let s = 0; s < 200; s++) {
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const i  = y * N + x;
          const xp = y * N + (x + 1) % N;
          const xm = y * N + (x - 1 + N) % N;
          const yp = ((y + 1) % N) * N + x;
          const ym = ((y - 1 + N) % N) * N + x;
          const lapR = wr[xp]+wr[xm]+wr[yp]+wr[ym]-4*wr[i];
          const lapI = wi[xp]+wi[xm]+wi[yp]+wi[ym]-4*wi[i];
          const absq = wr[i]*wr[i] + wi[i]*wi[i];
          nwr[i] = wr[i] + dt*(wr[i] + lapR - alpha*lapI - (wr[i]-beta*wi[i])*absq);
          nwi[i] = wi[i] + dt*(wi[i] + lapI + alpha*lapR - (wi[i]+beta*wr[i])*absq);
        }
      }
      wr.set(nwr); wi.set(nwi);
    }

    const imgData = cctx.createImageData(N, N);
    const NOTO = "'Noto Sans Egyptian Hieroglyphs',serif";
    let frame = 0;

    function draw() {
      frame++;

      // CGLE step (one step per frame)
      for (let y = 0; y < N; y++) {
        for (let x = 0; x < N; x++) {
          const i  = y*N+x;
          const xp = y*N+(x+1)%N, xm = y*N+(x-1+N)%N;
          const yp = ((y+1)%N)*N+x, ym = ((y-1+N)%N)*N+x;
          const lapR = wr[xp]+wr[xm]+wr[yp]+wr[ym]-4*wr[i];
          const lapI = wi[xp]+wi[xm]+wi[yp]+wi[ym]-4*wi[i];
          const absq = wr[i]*wr[i]+wi[i]*wi[i];
          nwr[i] = wr[i]+dt*(wr[i]+lapR-alpha*lapI-(wr[i]-beta*wi[i])*absq);
          nwi[i] = wi[i]+dt*(wi[i]+lapI+alpha*lapR-(wi[i]+beta*wr[i])*absq);
        }
      }
      wr.set(nwr); wi.set(nwi);

      // Render CGLE field (phase -> hue, amplitude -> value)
      for (let i = 0; i < N*N; i++) {
        const ph = (Math.atan2(wi[i], wr[i]) / (Math.PI*2) + 1) % 1;
        const amp = Math.min(1.0, Math.sqrt(wr[i]*wr[i]+wi[i]*wi[i]));
        const hh = ph * 6;
        const hi = Math.floor(hh), ff = hh - hi;
        const v = amp, sv = 0.9;
        const pv = v*(1-sv), qv = v*(1-sv*ff), tv = v*(1-sv*(1-ff));
        let r=0, g=0, b=0;
        if(hi===0){r=v;g=tv;b=pv;} else if(hi===1){r=qv;g=v;b=pv;}
        else if(hi===2){r=pv;g=v;b=tv;} else if(hi===3){r=pv;g=qv;b=v;}
        else if(hi===4){r=tv;g=pv;b=v;} else{r=v;g=pv;b=qv;}
        const ii = i*4;
        imgData.data[ii]   = r*255|0;
        imgData.data[ii+1] = g*255|0;
        imgData.data[ii+2] = b*255|0;
        imgData.data[ii+3] = 255;
      }
      cctx.putImageData(imgData, 0, 0);

      // Render orbit diagram
      const OW = 200, OH = 200;
      octx.fillStyle = '#010408'; octx.fillRect(0,0,OW,OH);
      const ocx = OW/2, ocy = OH/2;

      // Sun glyph
      octx.beginPath(); octx.arc(ocx, ocy, 5, 0, Math.PI*2);
      octx.fillStyle = GOLD+'40'; octx.fill();
      octx.beginPath(); octx.arc(ocx, ocy, 2.5, 0, Math.PI*2);
      octx.fillStyle = GOLD; octx.fill();

      const orbRadii = [18, 30, 42, 56, 72, 86];

      PLANETS_EPH.forEach((p, pi) => {
        const currentLon = initLons[pi] + frame * p.n * 0.06;
        const lonRad = currentLon * Math.PI / 180;
        const orbR = orbRadii[pi];

        // Orbit ring
        octx.beginPath(); octx.arc(ocx, ocy, orbR, 0, Math.PI*2);
        octx.strokeStyle = p.col + '18'; octx.lineWidth = 0.5; octx.stroke();

        // Planet dot
        const pdx = ocx + Math.cos(lonRad) * orbR;
        const pdy = ocy + Math.sin(lonRad) * orbR;
        octx.beginPath(); octx.arc(pdx, pdy, p.dotR, 0, Math.PI*2);
        octx.fillStyle = p.col; octx.fill();

        // Radial phase line to center
        octx.strokeStyle = p.col+'25'; octx.lineWidth = 0.4;
        octx.beginPath(); octx.moveTo(pdx, pdy); octx.lineTo(ocx, ocy); octx.stroke();

        // Planet name
        octx.font = '6px Space Mono';
        octx.fillStyle = p.col+'99'; octx.textAlign = 'left';
        octx.fillText(p.name.slice(0,3), pdx+p.dotR+1, pdy+2);
      });

      // Ephemeris readout + Egyptian glyph labels
      const ephGlyphs = ['𓅛','𓆻','𓇳','𓂓','𓅋','𓆣'];
      octx.font = '7px Space Mono';
      PLANETS_EPH.forEach((p, pi) => {
        const lon = ((initLons[pi] + frame * p.n * 0.06) % 360 + 360) % 360;
        octx.fillStyle = p.col+'80';
        octx.textAlign = 'left';
        octx.fillText(p.name.slice(0,3)+' '+lon.toFixed(1)+'\u00B0', 3, 10 + pi*12);
        // Egyptian glyph beside readout
        octx.font = '9px '+NOTO;
        octx.fillStyle = p.col+'55';
        octx.fillText(ephGlyphs[pi]||'', 82, 12 + pi*12);
        octx.font = '7px Space Mono';
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div style={{display:'grid', gridTemplateColumns:'1fr 200px', gap:8, alignItems:'start'}}>
      <canvas ref={cgleRef}
        style={{width:'100%', imageRendering:'pixelated', display:'block', borderRadius:3}} />
      <canvas ref={orbitRef}
        style={{width:200, height:200, display:'block', borderRadius:3}} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SECTION IV -- WET-LAB HARMONIC TIMING
   HRV / cortisol / cognition vs K-index, F10.7
   ═══════════════════════════════════════════════════ */

interface HarmonicCurve { label:string; col:string; glyph:string; desc:string; }

const HARMONIC_CURVES: HarmonicCurve[] = [
  {label:'Cortisol',  col:'#c9a84c', glyph:'𓇳', desc:'Circadian peak ~8am. Solar F10.7 modulates amplitude via HPA axis.'},
  {label:'HRV LF/HF', col:'#1fd4c8', glyph:'𓂀', desc:'Low-frequency / high-frequency ratio. Schumann coupling at 7.83 Hz.'},
  {label:'Cognition', col:'#22c55e', glyph:'𓅃', desc:'Ultradian ~90 min oscillation. Phase-locked to geomagnetic K-index.'},
  {label:'K-index',   col:'#ef4444', glyph:'𓈗', desc:'Geomagnetic storm index 0-9. Drives HRV suppression and cortisol elevation.'},
  {label:'F10.7 sfu', col:'#8b5cf6', glyph:'𓆓', desc:'Solar flux at 10.7 cm. 27-day solar rotation envelope visible in residual.'},
];

const HARMONIC_PEAKS = [
  {freq:1.16e-5, label:'Circadian 24h',   col:'#c9a84c', glyph:'𓇳'},
  {freq:1.85e-4, label:'Ultradian 90min', col:'#22c55e', glyph:'𓅃'},
  {freq:7.83e-3, label:'Schumann 7.83Hz', col:'#1fd4c8', glyph:'𓂀'},
  {freq:4e-2,    label:'Alpha 0.1Hz HRV', col:'#38bdf8', glyph:'𓋴'},
  {freq:0.5,     label:'Gamma 40Hz',      col:'#ec4899', glyph:'𓊪'},
];

function HarmonicTimingCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const frameRef = useRef(0);

  // Pre-allocated rolling buffers
  const bufs = useRef({
    cort: new Float32Array(400).fill(0),
    hrv:  new Float32Array(400).fill(0),
    cog:  new Float32Array(400).fill(0),
    kidx: new Float32Array(400).fill(0),
    f107: new Float32Array(400).fill(0),
  });

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 800, H = 280;
    cv.width = W; cv.height = H;
    const MAIN_H = 180, SPEC_H = 80, SPEC_Y = MAIN_H + 8;
    const SMP = 400;
    const b = bufs.current;
    const NOTO = "'Noto Sans Egyptian Hieroglyphs',serif";

    // Seed buffers with synthetic circadian data
    for (let i = 0; i < SMP; i++) {
      const hr = (i / SMP) * 24;
      b.cort[i] = Math.max(0.05, Math.min(0.98, 0.12 + 0.75*Math.exp(-Math.pow(hr-8,2)/16) + 0.06*Math.random()));
      b.hrv[i]  = Math.max(0.05, Math.min(0.98, 0.45 + 0.35*Math.sin(hr*0.105*Math.PI) + 0.06*Math.random() - 0.1*b.cort[i]));
      b.cog[i]  = Math.max(0.05, Math.min(0.98, 0.40 + 0.40*Math.abs(Math.sin(hr/1.5*Math.PI))*(0.5+0.5*Math.sin(hr*0.26)) + 0.07*Math.random()));
      b.kidx[i] = Math.max(0, Math.min(1, 0.28 + 0.15*Math.sin(hr*0.7+1.2) + 0.1*(Math.random()-0.5)));
      b.f107[i] = Math.max(0.1, Math.min(0.98, 0.52 + 0.12*Math.sin(hr*0.018) + 0.04*Math.random()));
    }

    function drawCurve(data: Float32Array, col: string, x0: number, x1: number, yTop: number, yH: number) {
      ctx.beginPath();
      for (let i = 0; i < data.length; i++) {
        const x = x0 + (i / data.length) * (x1 - x0);
        const y = yTop + yH - data[i] * yH;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.strokeStyle = col; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.8;
      ctx.stroke(); ctx.globalAlpha = 1;
    }

    function draw() {
      const fr = ++frameRef.current;

      // Advance rolling buffers
      if (fr % 4 === 0) {
        const t2 = fr * 0.003;
        const hr = new Date().getHours() + new Date().getMinutes()/60;
        const nw = {
          cort: Math.max(0.05, Math.min(0.98, 0.12+0.75*Math.exp(-Math.pow(hr-8,2)/16)+0.04*(Math.random()-0.5))),
          hrv:  Math.max(0.05, Math.min(0.98, 0.45+0.35*Math.sin((hr+t2)*0.4)+0.05*(Math.random()-0.5))),
          cog:  Math.max(0.05, Math.min(0.98, 0.40+0.4*Math.abs(Math.sin((hr+t2*0.5)/1.5))+0.06*(Math.random()-0.5))),
          kidx: Math.max(0, Math.min(1, b.kidx[SMP-1]+0.025*(Math.random()-0.5))),
          f107: Math.max(0.1, Math.min(0.98, 0.52+0.12*Math.sin(t2*0.008)+0.02*(Math.random()-0.5))),
        };
        for(let i=0;i<SMP-1;i++){
          b.cort[i]=b.cort[i+1]; b.hrv[i]=b.hrv[i+1]; b.cog[i]=b.cog[i+1];
          b.kidx[i]=b.kidx[i+1]; b.f107[i]=b.f107[i+1];
        }
        b.cort[SMP-1]=nw.cort; b.hrv[SMP-1]=nw.hrv; b.cog[SMP-1]=nw.cog;
        b.kidx[SMP-1]=nw.kidx; b.f107[SMP-1]=nw.f107;
      }

      ctx.fillStyle = '#010408'; ctx.fillRect(0, 0, W, H);

      // Y-axis label
      ctx.save();
      ctx.translate(12, MAIN_H/2); ctx.rotate(-Math.PI/2);
      ctx.font = '7px Space Mono'; ctx.fillStyle = DIM;
      ctx.textAlign = 'center'; ctx.fillText('NORMALISED AMPLITUDE', 0, 0);
      ctx.restore();

      // Grid lines in main area
      ctx.strokeStyle = 'rgba(31,212,200,0.05)'; ctx.lineWidth = 0.5;
      for(let gy=0.25;gy<=0.75;gy+=0.25){
        const yg = MAIN_H - gy*MAIN_H;
        ctx.beginPath(); ctx.moveTo(36, yg); ctx.lineTo(W-8, yg); ctx.stroke();
      }
      // Vertical time ticks (every 4 hours)
      for(let h=0;h<=24;h+=4){
        const xg = 36 + (h/24)*(W-44);
        ctx.strokeStyle='rgba(31,212,200,0.08)'; ctx.lineWidth=0.4;
        ctx.beginPath(); ctx.moveTo(xg,0); ctx.lineTo(xg,MAIN_H); ctx.stroke();
        ctx.font='6px Space Mono'; ctx.fillStyle=DIM; ctx.textAlign='center';
        ctx.fillText(h+'h', xg, MAIN_H+5);
      }

      // Draw 5 curves
      drawCurve(b.cort, '#c9a84c', 36, W-8, 0, MAIN_H);
      drawCurve(b.hrv,  '#1fd4c8', 36, W-8, 0, MAIN_H);
      drawCurve(b.cog,  '#22c55e', 36, W-8, 0, MAIN_H);
      drawCurve(b.kidx, '#ef4444', 36, W-8, 0, MAIN_H);
      drawCurve(b.f107, '#8b5cf6', 36, W-8, 0, MAIN_H);

      // Now cursor line
      ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=1;
      ctx.setLineDash([3,3]);
      ctx.beginPath(); ctx.moveTo(W-8,0); ctx.lineTo(W-8,MAIN_H); ctx.stroke();
      ctx.setLineDash([]);

      // Separator
      ctx.strokeStyle='rgba(31,212,200,0.12)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo(0,MAIN_H+2); ctx.lineTo(W,MAIN_H+2); ctx.stroke();

      // Spectral panel
      ctx.fillStyle='rgba(1,4,8,0.6)'; ctx.fillRect(0, SPEC_Y, W, SPEC_H);
      ctx.font='7px Space Mono'; ctx.fillStyle=DIM; ctx.textAlign='center';
      ctx.fillText('LOG FREQUENCY SPECTRUM -- RESIDUAL HARMONIC PEAKS', W/2, SPEC_Y+9);

      // Log freq axis:  0.00001 to 10 Hz -> map to pixels
      const freqToX = (f: number) => 36 + (Math.log10(f/1e-5)/Math.log10(1e7))*(W-44);
      const SPEC_BASE = SPEC_Y + SPEC_H - 6;
      const SPEC_TOP  = SPEC_Y + 14;
      const SPEC_RANGE = SPEC_BASE - SPEC_TOP;

      // Baseline
      ctx.strokeStyle='rgba(31,212,200,0.08)'; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(36, SPEC_BASE); ctx.lineTo(W-8, SPEC_BASE); ctx.stroke();

      // Background spectral noise
      ctx.strokeStyle='rgba(31,212,200,0.12)'; ctx.lineWidth=0.6;
      ctx.beginPath();
      for(let px=36; px<W-8; px+=2){
        const f = 1e-5 * Math.pow(1e7, (px-36)/(W-44));
        const noise = 0.08 + 0.04*Math.sin(px*0.3) + 0.03*(Math.sin(fr*0.02+px*0.07));
        const yy = SPEC_BASE - noise*SPEC_RANGE*0.4;
        px===36 ? ctx.moveTo(px,yy) : ctx.lineTo(px,yy);
      }
      ctx.stroke();

      // Harmonic peaks
      HARMONIC_PEAKS.forEach(pk => {
        const px = freqToX(pk.freq);
        if(px<36||px>W-8) return;
        const pkAmp = 0.6 + 0.3*Math.sin(fr*0.025+pk.freq*500);
        // Peak bar
        ctx.strokeStyle = pk.col; ctx.lineWidth=1.5;
        ctx.globalAlpha=0.7;
        ctx.beginPath(); ctx.moveTo(px, SPEC_BASE); ctx.lineTo(px, SPEC_BASE-pkAmp*SPEC_RANGE*0.9); ctx.stroke();
        ctx.globalAlpha=1;
        // Glow
        const grd = ctx.createLinearGradient(px, SPEC_BASE, px, SPEC_BASE-pkAmp*SPEC_RANGE);
        grd.addColorStop(0, pk.col+'00');
        grd.addColorStop(1, pk.col+'40');
        ctx.fillStyle = grd;
        ctx.fillRect(px-3, SPEC_BASE-pkAmp*SPEC_RANGE*0.9, 6, pkAmp*SPEC_RANGE*0.9);
        // Egyptian glyph label
        ctx.font = '11px '+NOTO;
        ctx.fillStyle = pk.col+'cc';
        ctx.textAlign = 'center';
        ctx.fillText(pk.glyph, px, SPEC_BASE-pkAmp*SPEC_RANGE*0.9-4);
        ctx.font = '6px Space Mono';
        ctx.fillStyle = pk.col+'80';
        ctx.fillText(pk.label, px, SPEC_BASE+5);
      });

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

        {/* ── full hieroglyph register ── */}
        <div style={{ ...card(), marginBottom: 16 }}>
          <div style={secLabel}>Unicode Egyptian Block · 𓀀–𓐮 · All 1,071 Characters · Gardiner A–Aa</div>
          <HieroglyphRegister />
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

        {/* ── SECTION II: Fibonacci Coherence Codex ── */}
        <div style={{ ...card(GOLD), marginTop: 16, marginBottom: 16 }}>
          <div style={{ ...secLabel }}>
            Visual Codex Refinement &middot; G &rarr; &Sigma; &rarr; G &middot; Fibonacci-Indexed Coherence States
          </div>
          <p style={{ fontSize: 11, color: 'rgba(200,185,140,0.7)', lineHeight: 1.7, marginBottom: 14, maxWidth: 780 }}>
            Each scale level in the crystallisation stack receives a canonical Egyptian glyph form. The G &rarr; &Sigma; &rarr; G loop maps to alternating odd/even Fibonacci indices: G-states are generalised (undifferentiated, high-entropy), Sigma-states are condensed (coherent, crystallised). Click any level to expand its field-theoretic role.
          </p>
          <FibCoherenceSection />
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 8 }}>
            {([
              {col:GOLD, t:'G-State (even F)', eq:'G = generalised field', b:'High-entropy substrate. Undifferentiated potential. The scarab at rest. Source of all possible crystallisations.'},
              {col:TEAL, t:'Sigma-State (odd F)', eq:'\u03A3 = crystallised node', b:'Coherent condensate. Information-dense attractor. The eye that has collapsed. Energy locked in stable form.'},
              {col:VIO,  t:'phi-Lattice Spacing', eq:'L_n = phi^n \u00B7 L_0', b:'Each scale level is phi times the previous. This is not metaphor -- biological branching ratios, receptor array geometries, and cortical column spacings all cluster near phi^n.'},
              {col:GRN,  t:'Residual Coupling', eq:'C_n = W(f_n,t)', b:'At each Fibonacci frequency, the Schumann-K-index residual shows a peak. This coupling is the experimental signature that the cascade is real, not theoretical.'},
            ] as {col:string;t:string;eq:string;b:string}[]).map(({col,t,eq,b}) => (
              <div key={t} style={{...card(col), borderColor:col+'22'}}>
                <div style={{fontFamily:OR, fontSize:8, color:col, letterSpacing:1, marginBottom:3}}>{t}</div>
                <div style={{fontFamily:MN, fontSize:7.5, color:col+'88', marginBottom:5}}>{eq}</div>
                <div style={{fontSize:10, color:'rgba(200,220,240,0.6)', lineHeight:1.6}}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION III: Toroidal Sim + Real Ephemeris ── */}
        <div style={{ ...card(TEAL), marginBottom: 16 }}>
          <div style={{ ...secLabel }}>
            Toroidal CGLE Simulation &middot; Real Ephemeris Boundary Conditions &middot; Planetary Phase Field
          </div>
          <p style={{ fontSize: 11, color: 'rgba(180,220,240,0.7)', lineHeight: 1.7, marginBottom: 12, maxWidth: 780 }}>
            The Complex Ginzburg-Landau Equation (CGLE) runs on a 64 &times; 64 toroidal lattice (&alpha; = 1.0, &beta; = -1.4, spiral-wave regime). Initial phase field is seeded by real heliocentric ecliptic longitudes computed from J2000 mean orbital elements for the current date. Watch how planetary geometry shapes the spiral topology.
          </p>
          <ToroidalSimCanvas />
          <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
            {([
              {col:GOLD, t:'Ephemeris Seeding', eq:'\u03C6(x,y) = \u03A3_p sin(L_p + k\u00B7r)', b:'Each planet injects a spatial phase wave proportional to its ecliptic longitude. The sum modulates the initial condition of the CGLE field, imprinting the planetary configuration into the spiral topology.'},
              {col:TEAL, t:'Toroidal Boundary', eq:'\u03A8(N,y) = \u03A8(0,y)', b:'Periodic boundary conditions on both axes create a mathematical torus -- the same topology as the Shen ring (𓏦). Standing waves on the torus cannot decay, only redistribute.'},
              {col:VIO,  t:'Biological Resonance', eq:'|W(f_s)| > |W(f_r)|', b:'If the ephemeris-driven initial conditions systematically produce spiral arms at Schumann-related spatial frequencies, this is evidence that planetary geometry couples to the 7.83 Hz geomagnetic mode.'},
            ] as {col:string;t:string;eq:string;b:string}[]).map(({col,t,eq,b}) => (
              <div key={t} style={{...card(col), borderColor:col+'22'}}>
                <div style={{fontFamily:OR, fontSize:8, color:col, letterSpacing:1, marginBottom:3}}>{t}</div>
                <div style={{fontFamily:MN, fontSize:7.5, color:col+'88', marginBottom:5}}>{eq}</div>
                <div style={{fontSize:10, color:'rgba(200,220,240,0.6)', lineHeight:1.6}}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── SECTION IV: Wet-Lab Harmonic Timing ── */}
        <div style={{ ...card(GRN), marginBottom: 16 }}>
          <div style={{ ...secLabel }}>
            Wet-Lab Harmonic Timing &middot; HRV &middot; Cortisol &middot; Cognition vs K-index &amp; F10.7
          </div>
          <p style={{ fontSize: 11, color: 'rgba(180,240,200,0.7)', lineHeight: 1.7, marginBottom: 12, maxWidth: 780 }}>
            Time biological assays against geomagnetic and solar drivers. Residual harmonic peaks at circadian (24h), ultradian (90 min), Schumann (7.83 Hz), and HRV-LF (0.1 Hz) frequencies confirm cascade coupling. Egyptian glyphs label each resonance: 𓇳 Cortisol/Ra &middot; 𓂀 HRV/Eye &middot; 𓅃 Cognition/Ibis &middot; 𓈗 K-index/Water &middot; 𓆓 F10.7/Cobra.
          </p>
          <HarmonicTimingCanvas />
          {/* Legend row */}
          <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {HARMONIC_CURVES.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,0,0,0.3)', border: `1px solid ${c.col}22`,
                borderRadius: 3, padding: '5px 10px' }}>
                <span style={{ fontFamily: "'Noto Sans Egyptian Hieroglyphs',serif", fontSize: 18, lineHeight: 1,
                  filter: `drop-shadow(0 0 4px ${c.col}60)` }}>{c.glyph}</span>
                <div>
                  <div style={{ fontFamily: MN, fontSize: 8, color: c.col, letterSpacing: 0.5 }}>{c.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(180,200,220,0.55)', lineHeight: 1.5, maxWidth: 200 }}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 8 }}>
            {([
              {col:GRN,  t:'Assay Protocol', eq:'HRV 5-min windows x 12/day', b:'Record HRV (LF/HF ratio), salivary cortisol, and a 3-min cognitive speed task every 2 hours for 14 days. Cross-correlate with NOAA K-index and DRAO F10.7.'},
              {col:TEAL, t:'K-index Coupling', eq:'r(HRV, K) = -0.34 expected', b:'Geomagnetic storms suppress HRV via the vagus-cardiac axis. This is measurable. K >= 4 events should produce a detectable HRV dip within 4-6 hours.'},
              {col:GOLD, t:'F10.7 Envelope', eq:'F10.7 \u2208 [50, 250] sfu', b:'27-day solar rotation modulates the F10.7 flux. Cortisol amplitude should track F10.7 with a 1-2 day lag via UV-B -> vitamin D -> HPA axis.'},
              {col:'#ec4899', t:'Residual Harmonic', eq:'\u03A9_r = \u03A9_bio - \u03A9_circadian', b:'After removing circadian and ultradian components, residual peaks at 7.83 Hz and phi-multiples would confirm Schumann entrainment as a real biological coupling channel.'},
            ] as {col:string;t:string;eq:string;b:string}[]).map(({col,t,eq,b}) => (
              <div key={t} style={{...card(col), borderColor:col+'22'}}>
                <div style={{fontFamily:OR, fontSize:8, color:col, letterSpacing:1, marginBottom:3}}>{t}</div>
                <div style={{fontFamily:MN, fontSize:7.5, color:col+'88', marginBottom:5}}>{eq}</div>
                <div style={{fontSize:10, color:'rgba(200,220,240,0.6)', lineHeight:1.6}}>{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* footer */}
        <div style={{ marginTop: 16, paddingTop: 10, borderTop: `1px solid rgba(31,212,200,0.1)`, fontFamily: MN, fontSize: 7.5, color: DIM, letterSpacing: '0.12em', textAlign: 'center' }}>
          AETHER EGYPTIAN CODEX · UNICODE HIEROGLYPH BLOCK U+13000–U+1342E · PAPYRUS REGISTER SIMULATION · KNOWLEDGE GRAPH ARCHAEOLOGY · CRYSTALLISATION MODEL
        </div>
      </div>
    </div>
  );
}

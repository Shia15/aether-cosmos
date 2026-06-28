import { useState, useEffect, useRef, useCallback } from 'react';

// ── TYPES ──
type PhaseKey = 'mens' | 'foll' | 'ovul' | 'lut';
type TabKey = 'today' | 'wheel' | 'calendar' | 'settings';

interface Scent { emoji: string; name: string; use: string; note: string; }
interface PhaseData {
  name: string; emoji: string; days: [number, number];
  tagline: string; desc: string; scents: Scent[];
  ritual: string; planets: string[]; planetNote: string;
  col: string; bg: string; border: string;
}
interface FlowerState { startDate: string | null; cycleLen: number; name: string; }

// ── DATA ──
const FIB_CYCLE = [1,1,2,3,5,8,4,3,7,1,8,9,8,8,7,6,4,1,5,6,2,8,1,9];
const PORTAL_ROOTS = new Set([3,6,9]);
const MASTER_HARMONIC = 168;
const WEEK_DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];
const PLANET_DAY_NAMES = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn'];
const STORE_KEY = 'flowerbloom-v1';

const PHASES: Record<PhaseKey, PhaseData> = {
  mens: {
    name: 'Menstrual', emoji: '🌑', days: [1, 5],
    col: 'rgba(136,120,212,1)', bg: 'rgba(136,120,212,0.08)', border: 'rgba(136,120,212,0.4)',
    tagline: 'Rest. Release. Root.',
    desc: 'Your body is shedding and renewing. Most potent time for inward reflection, intuition, and deep rest.',
    scents: [
      { emoji: '💜', name: 'Lavender', use: 'diffuse', note: 'calming cramps' },
      { emoji: '🌹', name: 'Rose', use: 'inhale', note: 'emotional ease' },
      { emoji: '🌿', name: 'Clary Sage', use: 'dilute+rub', note: 'antispasmodic' },
      { emoji: '🟤', name: 'Frankincense', use: 'diffuse', note: 'grounding' },
      { emoji: '🌸', name: 'Geranium', use: 'bath', note: 'hormone balance' },
      { emoji: '🍃', name: 'Marjoram', use: 'roll-on', note: 'cramp relief' },
    ],
    ritual: 'Draw a warm bath with 3 drops lavender + 2 drops rose in carrier oil. Breathe slowly. Let the body be heavy.',
    planets: ['Moon','Venus','Neptune'], planetNote: 'Moon energy at peak -- follow your dreams and hunches.',
  },
  foll: {
    name: 'Follicular', emoji: '🌒', days: [6, 13],
    col: 'rgba(120,168,112,1)', bg: 'rgba(120,168,112,0.08)', border: 'rgba(120,168,112,0.4)',
    tagline: 'Rise. Build. Ignite.',
    desc: 'Estrogen rises, energy returns. Brain sharper, social magnetism back on. Start new things.',
    scents: [
      { emoji: '🌿', name: 'Peppermint', use: 'inhale', note: 'mental clarity' },
      { emoji: '🌻', name: 'Rosemary', use: 'diffuse', note: 'memory + focus' },
      { emoji: '🍋', name: 'Lemon', use: 'diffuse', note: 'uplifting energy' },
      { emoji: '🟡', name: 'Ginger', use: 'roll-on', note: 'warming drive' },
      { emoji: '🌱', name: 'Basil', use: 'diffuse', note: 'motivation' },
      { emoji: '✦', name: 'Cardamom', use: 'inhale', note: 'mental warmth' },
    ],
    ritual: 'Add 4 drops peppermint + 2 drops lemon to diffuser in the morning. Three deep breaths before any new project.',
    planets: ['Sun','Mars','Mercury'], planetNote: 'Solar energy rising -- perfect for initiating, pitching, creating.',
  },
  ovul: {
    name: 'Ovulation', emoji: '🌕', days: [14, 16],
    col: 'rgba(212,168,67,1)', bg: 'rgba(212,168,67,0.08)', border: 'rgba(212,168,67,0.4)',
    tagline: 'Peak. Bloom. Radiate.',
    desc: 'Most magnetic, articulate, and creative. LH surge. Your body and voice are at full power.',
    scents: [
      { emoji: '🌹', name: 'Rose', use: 'inhale', note: 'peak sensuality' },
      { emoji: '🌺', name: 'Jasmine', use: 'diffuse', note: 'euphoric bloom' },
      { emoji: '🌑', name: 'Patchouli', use: 'roll-on', note: 'earthy, grounding' },
      { emoji: '🌼', name: 'Ylang-Ylang', use: 'bath', note: 'floral depth' },
      { emoji: '🫐', name: 'Bergamot', use: 'diffuse', note: 'joyful clarity' },
      { emoji: '🌸', name: 'Neroli', use: 'inhale', note: 'radiant confidence' },
    ],
    ritual: 'Wear rose or jasmine as a personal scent today. You are in full bloom. Let the world feel it.',
    planets: ['Sun','Venus','Jupiter'], planetNote: 'Venus at her fullest -- love, beauty, magnetism amplified.',
  },
  lut: {
    name: 'Luteal', emoji: '🌗', days: [17, 28],
    col: 'rgba(212,136,96,1)', bg: 'rgba(212,136,96,0.08)', border: 'rgba(212,136,96,0.4)',
    tagline: 'Deepen. Integrate. Rest.',
    desc: 'Progesterone rises then falls. Energy turns inward. Inner critic may speak -- this is information, not truth.',
    scents: [
      { emoji: '🌸', name: 'Geranium', use: 'diffuse', note: 'PMS balance' },
      { emoji: '💜', name: 'Lavender', use: 'bath', note: 'anxiety ease' },
      { emoji: '🫐', name: 'Bergamot', use: 'inhale', note: 'mood lift' },
      { emoji: '🌿', name: 'Palmarosa', use: 'roll-on', note: 'nervous system' },
      { emoji: '🟤', name: 'Frankincense', use: 'diffuse', note: 'centering' },
      { emoji: '🌺', name: 'Clary Sage', use: 'dilute', note: 'late-phase support' },
    ],
    ritual: 'Evening ritual: diffuse geranium + frankincense. Write three things your body did well today. No editing. Just gratitude.',
    planets: ['Moon','Saturn','Neptune'], planetNote: 'Saturn asks you to slow down and consolidate.',
  },
};

const PLANET_EMOJIS: Record<string, string> = {
  'Moon':'🌙','Venus':'♀','Neptune':'♆','Sun':'☀','Mars':'♂','Mercury':'☿','Jupiter':'♃','Saturn':'♄',
};

// ── PURE HELPERS ──
function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86400000);
}
function getCycleDay(start: Date, len: number, date: Date): number | null {
  const d = daysBetween(start, date);
  if (d < 0) return null;
  return (d % len) + 1;
}
function getPhase(cd: number): PhaseKey {
  if (cd <= 5) return 'mens';
  if (cd <= 13) return 'foll';
  if (cd <= 16) return 'ovul';
  return 'lut';
}
function getFibRoot(day: number): number { return FIB_CYCLE[(day - 1) % 24]; }
function isPortal(root: number): boolean { return PORTAL_ROOTS.has(root); }
function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function getHarmonicPct(start: Date, date: Date): number {
  const mhd = daysBetween(start, date) % MASTER_HARMONIC;
  return 1 - Math.abs(mhd - MASTER_HARMONIC / 2) / (MASTER_HARMONIC / 2);
}
function getMasterHarmonicDay(start: Date, date: Date): number {
  return daysBetween(start, date) % MASTER_HARMONIC;
}

// ── CANVAS WHEEL DRAW (module-level, no local types) ──
function drawWheel(canvas: HTMLCanvasElement, start: Date, cycleLen: number) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const DPR = window.devicePixelRatio || 1;
  const SIZE = 320;
  canvas.width = SIZE * DPR;
  canvas.height = SIZE * DPR;
  canvas.style.width = SIZE + 'px';
  canvas.style.height = SIZE + 'px';
  ctx.scale(DPR, DPR);
  const CX = SIZE / 2, CY = SIZE / 2;
  const OR = SIZE * 0.44, IR = SIZE * 0.22;

  ctx.fillStyle = '#0a0612';
  ctx.fillRect(0, 0, SIZE, SIZE);

  const phaseArcs = [
    { s: 0, e: 5 / 24, color: 'rgba(136,120,212,0.15)' },
    { s: 5 / 24, e: 13 / 24, color: 'rgba(120,168,112,0.15)' },
    { s: 13 / 24, e: 16 / 24, color: 'rgba(212,168,67,0.15)' },
    { s: 16 / 24, e: 1, color: 'rgba(212,136,96,0.15)' },
  ];
  phaseArcs.forEach(pr => {
    ctx.beginPath();
    ctx.moveTo(CX, CY);
    ctx.arc(CX, CY, OR + 10, pr.s * Math.PI * 2 - Math.PI / 2, pr.e * Math.PI * 2 - Math.PI / 2);
    ctx.closePath();
    ctx.fillStyle = pr.color;
    ctx.fill();
  });

  const today = new Date();
  const cd = getCycleDay(start, cycleLen, today) ?? 1;
  const currentFibPos = (cd - 1) % 24;

  for (let i = 0; i < 24; i++) {
    const a0 = (i / 24) * Math.PI * 2 - Math.PI / 2;
    const a1 = ((i + 1) / 24) * Math.PI * 2 - Math.PI / 2;
    const root = FIB_CYCLE[i];
    const isP = isPortal(root);
    const isCur = i === currentFibPos;
    ctx.beginPath();
    ctx.arc(CX, CY, OR, a0, a1);
    ctx.arc(CX, CY, IR, a1, a0, true);
    ctx.closePath();
    const alpha = isCur ? 0.55 : isP ? 0.22 : 0.08;
    const col = isCur || isP ? [212, 168, 67] : [200, 192, 180];
    ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
    ctx.fill();
    ctx.strokeStyle = isCur ? 'rgba(212,168,67,0.7)' : 'rgba(255,255,255,0.06)';
    ctx.lineWidth = isCur ? 1.5 : 0.5;
    ctx.stroke();
    const midA = (a0 + a1) / 2;
    const textR = (OR + IR) / 2;
    ctx.save();
    ctx.translate(CX + Math.cos(midA) * textR, CY + Math.sin(midA) * textR);
    ctx.rotate(midA + Math.PI / 2);
    ctx.font = `${isP || isCur ? '600 14px' : '11px'} serif`;
    ctx.fillStyle = isCur ? '#f0c860' : isP ? 'rgba(212,168,67,0.9)' : 'rgba(200,192,180,0.5)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(root), 0, 0);
    ctx.restore();
  }

  // Golden spiral
  const k = Math.log(1.618) / (Math.PI / 2);
  ctx.beginPath();
  let first = true;
  for (let n = 0; n < 80; n++) {
    const theta = n * 0.1;
    const r = 8 * Math.exp(k * theta);
    if (r > IR * 0.9) break;
    const x = CX + Math.cos(theta) * r, y = CY + Math.sin(theta) * r;
    if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'rgba(212,168,67,0.2)';
  ctx.lineWidth = 0.8;
  ctx.stroke();

  const centreR = IR * 0.52;
  const cg = ctx.createRadialGradient(CX, CY, 0, CX, CY, centreR);
  cg.addColorStop(0, 'rgba(212,168,67,0.25)');
  cg.addColorStop(1, 'rgba(212,168,67,0.02)');
  ctx.beginPath();
  ctx.arc(CX, CY, centreR, 0, Math.PI * 2);
  ctx.fillStyle = cg;
  ctx.fill();
  ctx.font = 'italic 16px serif';
  ctx.fillStyle = 'rgba(240,200,96,0.75)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('\u03c6', CX, CY);

  const labelR = OR + 22;
  const phLbls = [
    { t: 2.5 / 24 * Math.PI * 2 - Math.PI / 2, label: 'Menstrual', color: 'rgba(168,152,240,0.7)' },
    { t: 9 / 24 * Math.PI * 2 - Math.PI / 2, label: 'Follicular', color: 'rgba(152,200,144,0.7)' },
    { t: 14.5 / 24 * Math.PI * 2 - Math.PI / 2, label: 'Ovulation', color: 'rgba(240,200,96,0.7)' },
    { t: 22 / 24 * Math.PI * 2 - Math.PI / 2, label: 'Luteal', color: 'rgba(240,168,120,0.7)' },
  ];
  phLbls.forEach(pl => {
    ctx.save();
    ctx.translate(CX + Math.cos(pl.t) * labelR, CY + Math.sin(pl.t) * labelR);
    ctx.rotate(pl.t + Math.PI / 2);
    ctx.font = '8px sans-serif';
    ctx.fillStyle = pl.color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pl.label, 0, 0);
    ctx.restore();
  });
}

// ── STYLES ──
const S = {
  page: { background: '#0a0612', minHeight: '100vh', color: '#f0e8d8', fontFamily: 'DM Sans, system-ui, sans-serif' } as const,
  header: { background: 'rgba(22,14,31,0.97)', borderBottom: '1px solid rgba(212,168,67,0.18)', padding: '24px 20px 12px', textAlign: 'center' as const },
  h1: { fontFamily: 'Crimson Pro, Georgia, serif', fontSize: 'clamp(20px,6vw,30px)', color: '#f0c860', fontStyle: 'italic', margin: 0 },
  sub: { fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: 'rgba(240,232,216,0.4)', marginTop: 4 },
  navBar: { display: 'flex', justifyContent: 'center', gap: 4, padding: '10px 16px', background: 'rgba(10,6,18,0.9)', borderBottom: '1px solid rgba(212,168,67,0.12)', position: 'sticky' as const, top: 0, zIndex: 30 },
  tab: (on: boolean) => ({ fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase' as const, background: on ? 'rgba(212,168,67,0.15)' : 'transparent', border: `1px solid ${on ? 'rgba(212,168,67,0.35)' : 'transparent'}`, color: on ? '#f0c860' : 'rgba(240,232,216,0.5)', padding: '7px 16px', borderRadius: 20, cursor: 'pointer' }),
  body: { padding: '20px 16px 80px', maxWidth: 480, margin: '0 auto' },
  secLabel: { fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: 'rgba(240,232,216,0.35)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 },
  card: { background: '#160e1f', border: '1px solid rgba(212,168,67,0.18)', borderRadius: 16, padding: 18, marginTop: 0 },
  chipGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: 7 },
  chip: (highlight: boolean) => ({ display: 'flex', alignItems: 'center', gap: 5, background: highlight ? 'rgba(212,168,67,0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${highlight ? 'rgba(212,168,67,0.45)' : 'rgba(212,168,67,0.12)'}`, borderRadius: 20, padding: '5px 11px', fontSize: 12, color: highlight ? '#f0c860' : 'rgba(240,232,216,0.65)' }),
  ritual: { fontFamily: 'Crimson Pro, Georgia, serif', fontStyle: 'italic' as const, fontSize: 13, color: 'rgba(240,232,216,0.65)', lineHeight: '1.7em', marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(212,168,67,0.12)' },
  btn: { width: '100%', background: 'linear-gradient(135deg,#d4a843,#f0c860)', border: 'none', borderRadius: 12, color: '#0a0612', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 14, fontWeight: 500, padding: '13px', cursor: 'pointer', marginTop: 12 },
  inp: { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(212,168,67,0.3)', borderRadius: 8, color: '#f0e8d8', fontFamily: 'DM Sans, system-ui, sans-serif', fontSize: 15, padding: '10px 14px', outline: 'none', boxSizing: 'border-box' as const },
  inpLbl: { display: 'block', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'rgba(240,232,216,0.4)', marginBottom: 6 },
  disclaimer: { fontSize: 10, color: 'rgba(240,232,216,0.4)', lineHeight: '1.5em', padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,168,67,0.1)', marginTop: 20 },
};

function SectionLine() {
  return <div style={{ flex: 1, height: 1, background: 'rgba(212,168,67,0.12)' }} />;
}

// ── TODAY TAB ──
function TodayTab({ fs }: { fs: FlowerState }) {
  if (!fs.startDate) return <NeedSetup />;
  const start = new Date(fs.startDate);
  const today = new Date();
  const cd = getCycleDay(start, fs.cycleLen, today);
  if (!cd) return <NeedSetup />;
  const phKey = getPhase(cd);
  const ph = PHASES[phKey];
  const fibR = getFibRoot(cd);
  const portal = isPortal(fibR);
  const mhPct = getHarmonicPct(start, today);
  const mhDay = getMasterHarmonicDay(start, today);
  const planetDay = PLANET_DAY_NAMES[today.getDay()];
  const greeting = fs.name ? fs.name + "'s" : 'Your';
  const hilite = portal ? [0, 1, 2] : [0, 1];

  let nextPortal: { days: number; date: Date; root: number } | null = null;
  for (let i = 1; i <= 24; i++) {
    const root = getFibRoot(cd + i);
    if (isPortal(root)) {
      const d = new Date(today); d.setDate(d.getDate() + i);
      nextPortal = { days: i, date: d, root }; break;
    }
  }
  const remDays = fs.cycleLen - cd + 1;
  const nextPeriodDate = new Date(today); nextPeriodDate.setDate(today.getDate() + remDays);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>{greeting} day <SectionLine /></div>
        <div style={{ ...S.card, background: ph.bg, border: `1px solid ${ph.border}`, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'inline-block', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '5px 12px', borderRadius: 20, border: `1px solid ${ph.border}`, color: ph.col, marginBottom: 10 }}>
            {ph.emoji} {ph.name}
          </div>
          <div style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: 52, fontWeight: 400, lineHeight: '1em', color: ph.col }}>{cd}</div>
          <div style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,232,216,0.45)', marginTop: 4 }}>of {fs.cycleLen} · {ph.tagline}</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>Fibonacci 24-cycle <SectionLine /></div>
        <div style={S.card}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
            {[
              { val: fibR, lbl: 'digital root', hi: portal },
              { val: ((cd - 1) % 24) + 1, lbl: 'cycle pos', hi: false },
              { val: PLANET_EMOJIS[planetDay] ?? planetDay, lbl: 'planet day', hi: false },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: item.hi ? 'rgba(212,168,67,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${item.hi ? 'rgba(212,168,67,0.5)' : 'rgba(212,168,67,0.12)'}`, borderRadius: 10, padding: '8px 14px' }}>
                <span style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: 22, color: item.hi ? '#f0c860' : 'rgba(240,232,216,0.5)', lineHeight: '1em' }}>{item.val}</span>
                <span style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,232,216,0.35)', marginTop: 2 }}>{item.lbl}</span>
              </div>
            ))}
          </div>
          {portal && <div style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#f0c860', fontFamily: 'Crimson Pro, Georgia, serif', fontStyle: 'italic' }}>✦ Portal day -- root {fibR} · heightened resonance ✦</div>}
          <p style={{ fontSize: 12, color: 'rgba(240,232,216,0.6)', textAlign: 'center', marginTop: 8, lineHeight: '1.5em' }}>{ph.desc}</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>Today's scent ritual <SectionLine /></div>
        <div style={S.card}>
          <div style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#f0c860', marginBottom: 10 }}>
            {portal ? '✦ Portal ritual -- amplify with these' : 'Recommended oils'}
          </div>
          <div style={S.chipGrid}>
            {ph.scents.map((s, i) => (
              <div key={i} style={S.chip(hilite.includes(i))}>
                <span style={{ fontSize: 14 }}>{s.emoji}</span>
                <span>{s.name}</span>
                <span style={{ fontSize: 9, color: 'rgba(240,232,216,0.35)', marginLeft: 2 }}>{s.use}</span>
              </div>
            ))}
          </div>
          <p style={S.ritual}>{ph.ritual}</p>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>Planetary alignment <SectionLine /></div>
        <div style={S.card}>
          <div style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'rgba(168,152,240,0.9)', marginBottom: 8 }}>{ph.planets.map(p => PLANET_EMOJIS[p] + ' ' + p).join(' · ')}</div>
          <p style={{ fontSize: 12, color: 'rgba(240,232,216,0.6)', lineHeight: '1.5em' }}>{ph.planetNote}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, overflowX: 'auto' }}>
            {ph.planets.map(p => (
              <div key={p} style={{ flexShrink: 0, background: 'rgba(212,168,67,0.07)', border: '1px solid rgba(212,168,67,0.25)', borderRadius: 10, padding: '8px 14px', textAlign: 'center', minWidth: 60 }}>
                <div style={{ fontSize: 18 }}>{PLANET_EMOJIS[p]}</div>
                <div style={{ fontSize: 9, letterSpacing: '0.08em', color: 'rgba(240,232,216,0.45)', marginTop: 2 }}>{p}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>168-day master harmonic <SectionLine /></div>
        <div style={{ ...S.card, background: '#1a1030', border: '1px solid rgba(136,120,212,0.2)' }}>
          <div style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontStyle: 'italic', fontSize: 14, color: 'rgba(168,152,240,0.9)', marginBottom: 8 }}>24-Cycle × 28-Cycle Alignment</div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', margin: '4px 0 8px' }}>
            <div style={{ height: '100%', width: `${Math.round(mhPct * 100)}%`, background: 'linear-gradient(90deg,rgba(136,120,212,0.8),rgba(168,152,240,0.9))', borderRadius: 3, transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(240,232,216,0.55)' }}>
            <span>Harmonic: <strong style={{ color: 'rgba(168,152,240,1)' }}>{Math.round(mhPct * 100)}%</strong></span>
            <span>{mhDay} / {MASTER_HARMONIC} days</span>
          </div>
          {nextPortal && (
            <p style={{ fontSize: 11, color: 'rgba(240,232,216,0.45)', marginTop: 8 }}>
              Next portal: <strong style={{ color: '#f0c860' }}>{nextPortal.days === 1 ? 'Tomorrow' : 'In ' + nextPortal.days + ' days'}</strong> · {formatDate(nextPortal.date)} · root <strong style={{ color: '#f0c860' }}>{nextPortal.root}</strong>
            </p>
          )}
          <p style={{ fontSize: 11, color: 'rgba(240,232,216,0.45)', marginTop: 4 }}>
            Next cycle: <strong style={{ color: 'rgba(168,152,240,1)' }}>In {remDays} days</strong> · {formatDate(nextPeriodDate)}
          </p>
        </div>
      </div>
      <div style={S.disclaimer}>
        Aromatherapy suggestions are general holistic wellness recommendations. Always dilute essential oils in a carrier oil (1-3%). Patch test before use. This is not medical advice.
      </div>
    </div>
  );
}

// ── WHEEL TAB ──
function WheelTab({ fs }: { fs: FlowerState }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvasRef.current && fs.startDate) {
      drawWheel(canvasRef.current, new Date(fs.startDate), fs.cycleLen);
    }
  }, [fs.startDate, fs.cycleLen]);
  if (!fs.startDate) return <NeedSetup />;

  const start = new Date(fs.startDate);
  const today = new Date();
  const cd = getCycleDay(start, fs.cycleLen, today) ?? 1;
  const currentFibPos = (cd - 1) % 24;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>24-segment Fibonacci wheel <SectionLine /></div>
        <div style={{ ...S.card, padding: 20, display: 'flex', justifyContent: 'center' }}>
          <canvas ref={canvasRef} style={{ borderRadius: 8 }} />
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>Full 24-cycle sequence <SectionLine /></div>
        <div style={S.card}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {FIB_CYCLE.map((root, i) => {
              const isP = isPortal(root);
              const isCur = i === currentFibPos;
              return (
                <div key={i} style={{ width: 36, height: 44, borderRadius: 8, border: `1px solid ${isCur ? '#f0c860' : isP ? 'rgba(212,168,67,0.4)' : 'rgba(212,168,67,0.1)'}`, background: isCur ? 'rgba(212,168,67,0.15)' : isP ? 'rgba(212,168,67,0.07)' : 'rgba(255,255,255,0.03)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Crimson Pro, Georgia, serif' }}>
                  <span style={{ fontSize: 14, fontWeight: 500, color: isCur || isP ? '#f0c860' : 'rgba(240,232,216,0.5)' }}>{root}</span>
                  <span style={{ fontSize: 8, color: 'rgba(240,232,216,0.3)' }}>{i + 1}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: 'rgba(240,232,216,0.35)', marginTop: 10 }}>✦ = portal days (root 3, 6, 9) · Highlighted = your current position</p>
        </div>
      </div>
    </div>
  );
}

// ── CALENDAR TAB ──
function CalendarTab({ fs }: { fs: FlowerState }) {
  if (!fs.startDate) return <NeedSetup />;
  const start = new Date(fs.startDate);
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const phaseColors: Record<PhaseKey, string> = {
    mens: 'rgba(136,120,212,0.6)', foll: 'rgba(120,168,112,0.6)',
    ovul: 'rgba(212,168,67,0.6)', lut: 'rgba(212,136,96,0.6)',
  };

  const next7: Array<{ dayName: string; cd: number | null; phKey: PhaseKey | null; fibR: number; portal: boolean }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today); d.setDate(today.getDate() + i);
    const cd = getCycleDay(start, fs.cycleLen, d);
    const phKey = cd ? getPhase(cd) : null;
    const fibR = cd ? getFibRoot(cd) : 0;
    const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    next7.push({ dayName, cd, phKey, fibR, portal: isPortal(fibR) });
  }

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>{monthName} <SectionLine /></div>
        <div style={S.card}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {WEEK_DAYS.map(d => <div key={d} style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(240,232,216,0.35)', textAlign: 'center', padding: '4px 0' }}>{d}</div>)}
            {Array(firstDay).fill(null).map((_, i) => <div key={'e' + i} />)}
            {Array.from({ length: daysInMonth }, (_, idx) => {
              const dayNum = idx + 1;
              const date = new Date(year, month, dayNum, 12);
              const isToday = dayNum === today.getDate();
              const cd = getCycleDay(start, fs.cycleLen, date);
              const phKey = cd ? getPhase(cd) : null;
              const fibR = cd ? getFibRoot(cd) : 0;
              const portal = isPortal(fibR);
              return (
                <div key={dayNum} style={{ aspectRatio: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: 8, border: `1px solid ${isToday ? '#f0c860' : portal ? 'rgba(212,168,67,0.4)' : 'transparent'}`, background: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                  <span style={{ fontSize: 11, fontWeight: 500, color: isToday ? '#f0c860' : 'rgba(240,232,216,0.7)' }}>{dayNum}</span>
                  {cd && phKey && <div style={{ width: 5, height: 5, borderRadius: '50%', background: phaseColors[phKey], marginTop: 1 }} />}
                  {cd ? <span style={{ fontSize: 7, color: portal ? '#f0c860' : 'rgba(240,232,216,0.3)' }}>{fibR}</span> : null}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            {(Object.entries(phaseColors) as [PhaseKey, string][]).map(([k, c]) => (
              <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: 'rgba(240,232,216,0.55)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                {PHASES[k].name}
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, color: '#f0c860' }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, border: '1px solid #f0c860', background: 'rgba(212,168,67,0.15)' }} />
              Portal (3,6,9)
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <div style={S.secLabel}>Next 7 days <SectionLine /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {next7.map((item, i) => {
            if (!item.cd || !item.phKey) return null;
            const ph = PHASES[item.phKey];
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#160e1f', border: `1px solid ${item.portal ? 'rgba(212,168,67,0.4)' : 'rgba(212,168,67,0.1)'}`, borderRadius: 10, padding: '10px 14px' }}>
                <div style={{ width: 36, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontSize: 18, color: ph.col }}>{item.fibR}</div>
                  {item.portal && <div style={{ fontSize: 8, color: '#f0c860' }}>✦ portal</div>}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, color: '#f0e8d8' }}>{item.dayName}</div>
                  <div style={{ fontSize: 10, color: 'rgba(240,232,216,0.45)' }}>{ph.name} · Day {item.cd} · {ph.scents[0].emoji} {ph.scents[0].name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── SETTINGS TAB ──
function SettingsTab({ fs, onSave }: { fs: FlowerState; onSave: (s: FlowerState) => void }) {
  const [name, setName] = useState(fs.name);
  const [startDate, setStartDate] = useState(fs.startDate ? fs.startDate.split('T')[0] : '');
  const [cycleLen, setCycleLen] = useState(String(fs.cycleLen));
  const handleSave = () => {
    if (!startDate) { alert('Please enter your last period start date.'); return; }
    const s: FlowerState = { name: name.trim(), startDate: new Date(startDate + 'T12:00:00').toISOString(), cycleLen: Math.max(21, Math.min(45, parseInt(cycleLen) || 28)) };
    onSave(s);
  };
  return (
    <div>
      <div style={{ ...S.card, textAlign: 'center', marginBottom: 20 }}>
        <div style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontStyle: 'italic', fontSize: 20, color: '#f0c860', marginBottom: 6 }}>Your Cycle Settings</div>
        <p style={{ fontSize: 13, color: 'rgba(240,232,216,0.6)', lineHeight: '1.6em', marginBottom: 20 }}>Enter your last period start date. Everything is stored only on your device.</p>
        <div style={{ marginBottom: 14, textAlign: 'left' }}>
          <label style={S.inpLbl}>Your name (optional)</label>
          <input style={S.inp} type="text" placeholder="e.g. Luna" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 14, textAlign: 'left' }}>
          <label style={S.inpLbl}>Last period start date</label>
          <input style={S.inp} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div style={{ marginBottom: 14, textAlign: 'left' }}>
          <label style={S.inpLbl}>Average cycle length (days)</label>
          <input style={S.inp} type="number" min={21} max={45} value={cycleLen} onChange={e => setCycleLen(e.target.value)} />
        </div>
        <button style={S.btn} onClick={handleSave}>Save and Begin 🌸</button>
      </div>
      <div style={S.disclaimer}>
        🌿 <strong>Wellness note:</strong> 24Flower Clock is an exploratory ritual companion for fun and self-awareness. It is not medical advice. Always consult a healthcare professional for reproductive health concerns. Essential oils should be properly diluted -- never use undiluted on skin.
      </div>
    </div>
  );
}

function NeedSetup() {
  return (
    <div style={{ ...S.card, textAlign: 'center', marginTop: 20 }}>
      <div style={{ fontFamily: 'Crimson Pro, Georgia, serif', fontStyle: 'italic', fontSize: 20, color: '#f0c860', marginBottom: 8 }}>Welcome to 24Flower 🌸</div>
      <p style={{ fontSize: 13, color: 'rgba(240,232,216,0.6)', marginBottom: 14 }}>Enter your cycle details to get started.</p>
    </div>
  );
}

// ── MAIN COMPONENT ──
export default function FlowerClock() {
  const [tab, setTab] = useState<TabKey>('today');
  const [fs, setFs] = useState<FlowerState>({ startDate: null, cycleLen: 28, name: '' });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as FlowerState;
        setFs(s);
        setLoaded(true);
        return;
      }
    } catch (_) { /* noop */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!fs.startDate) { setTab('settings'); }
  }, [loaded, fs.startDate]);

  const handleSave = useCallback((s: FlowerState) => {
    setFs(s);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(s)); } catch (_) { /* noop */ }
    setTab('today');
  }, []);

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'wheel', label: 'Wheel' },
    { key: 'calendar', label: 'Calendar' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div style={S.page}>
      <header style={S.header}>
        <h1 style={S.h1}>🌸 24Flower Clock</h1>
        <p style={S.sub}>Fibonacci · Cycle · Scent Ritual</p>
      </header>
      <div style={S.navBar}>
        {tabs.map(t => <button key={t.key} style={S.tab(tab === t.key)} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>
      <div style={S.body}>
        {!loaded ? null : tab === 'today' ? <TodayTab fs={fs} /> : tab === 'wheel' ? <WheelTab fs={fs} /> : tab === 'calendar' ? <CalendarTab fs={fs} /> : <SettingsTab fs={fs} onSave={handleSave} />}
      </div>
    </div>
  );
}

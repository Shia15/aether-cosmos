import { useEffect, useRef, useState } from "react";
import img1 from "@assets/image_1782206372818.jpeg";
import img2 from "@assets/image_1782206427314.jpeg";
import img3 from "@assets/image_1782206444614.jpeg";
import img4 from "@assets/image_1782206471730.jpeg";
import img5 from "@assets/image_1782206486757.jpeg";

/* ── palette ─────────────────────────────────────── */
const BG    = "#030508";
const TEAL  = "#1fd4c8";
const VIO   = "#8b5cf6";
const GOLD  = "#c9a84c";
const GRN   = "#22c55e";
const RED   = "#ef4444";
const ORG   = "#f97316";
const PINK  = "#ec4899";
const BLUE  = "#3b82f6";
const DIM   = "#3a5060";
const MN    = "'Space Mono', monospace";
const OR    = "'Orbitron', sans-serif";

/* ── electromagnetic spectrum data ───────────────── */
const EM_BANDS = [
  { key:'gamma',   label:'Gamma',       nm:'<0.01',  col:'#c084fc', waveFreq:18, alpha:0.85 },
  { key:'xray',    label:'X-Ray',       nm:'0.01–10',col:'#818cf8', waveFreq:14, alpha:0.8  },
  { key:'uvc',     label:'UVC',         nm:'100–280',col:'#a855f7', waveFreq:10, alpha:0.9  },
  { key:'uvb',     label:'UVB',         nm:'280–315',col:'#7c3aed', waveFreq:8,  alpha:0.85 },
  { key:'uva',     label:'UVA',         nm:'315–400',col:'#6d28d9', waveFreq:6,  alpha:0.8  },
  { key:'violet',  label:'Violet',      nm:'380–440',col:'#7c3aed', waveFreq:5.5,alpha:1.0  },
  { key:'blue',    label:'Blue',        nm:'440–510',col:'#2563eb', waveFreq:4.5,alpha:1.0  },
  { key:'green',   label:'Green',       nm:'510–575',col:'#16a34a', waveFreq:3.8,alpha:1.0  },
  { key:'yellow',  label:'Yellow',      nm:'575–585',col:'#ca8a04', waveFreq:3.4,alpha:1.0  },
  { key:'orange',  label:'Orange',      nm:'585–650',col:'#ea580c', waveFreq:3.0,alpha:1.0  },
  { key:'red',     label:'Red',         nm:'650–780',col:'#dc2626', waveFreq:2.4,alpha:1.0  },
  { key:'ira',     label:'IRA Near',    nm:'780–1400',col:'#b91c1c',waveFreq:1.8,alpha:0.7  },
  { key:'irb',     label:'IRB Mid',     nm:'1400–3000',col:'#7f1d1d',waveFreq:1.2,alpha:0.6 },
] as const;

/* ── visible sub-bands for color bar ─────────────── */
const VIS_BANDS = [
  { label:'Violet',nm:'380–440',col:'#7c3aed' },
  { label:'Blue',  nm:'440–510',col:'#2563eb' },
  { label:'Green', nm:'510–575',col:'#16a34a' },
  { label:'Yellow',nm:'575–585',col:'#ca8a04' },
  { label:'Orange',nm:'585–650',col:'#ea580c' },
  { label:'Red',   nm:'650–780',col:'#dc2626' },
];

/* ── aromatic amino acids ─────────────────────────── */
const AROMATICS = [
  {
    name:'Tryptophan', code:'Trp', letter:'W', col:'#8b5cf6',
    peak:'280 nm', absorbs:'UVA/UVB', role:'Primary UV absorber in proteins — responsible for ~90% of UV absorption at 280nm. Highest molar absorptivity (ε ≈ 5,500 M⁻¹cm⁻¹). Indole side-chain is the chromophore.',
    inEye:true, ringDesc:'Bicyclic indole ring',
    aether:'Tryptophan is the serotonin-melatonin precursor — the quantum coherence molecule linking light input to circadian rhythm. In AETHER, Trp is the photon-to-signal transducer.',
  },
  {
    name:'Tyrosine',   code:'Tyr', letter:'Y', col:'#ec4899',
    peak:'274 nm', absorbs:'UVA/UVB', role:'Second strongest UV absorber (ε ≈ 1,490 M⁻¹cm⁻¹). The only aromatic AA with a hydroxyl group — making it ionisable. Precursor to dopamine and melanin.',
    inEye:true, ringDesc:'Phenol ring (OH group)',
    aether:'Tyrosine is the dopamine-thyroid-melanin nexus. In AETHER, Tyr is the UV-to-biochemical-signal converter, coupling photon absorption to neurotransmitter synthesis.',
  },
  {
    name:'Phenylalanine',code:'Phe',letter:'F',col:'#3b82f6',
    peak:'257 nm', absorbs:'UVB/UVC', role:'Weakest UV absorber of the three (ε ≈ 200 M⁻¹cm⁻¹). Simple benzene ring. Precursor to tyrosine — the first step in the aromatic AA chain.',
    inEye:true, ringDesc:'Benzene ring (pure aromatic)',
    aether:'Phenylalanine sits at the base of the aromatic cascade: Phe → Tyr → dopamine/melanin. AETHER sees it as the primary node in the photoprotection pathway.',
  },
  {
    name:'Histidine',   code:'His', letter:'H', col:'#22c55e',
    peak:'211 nm', absorbs:'UVC', role:'Minimal UV absorption. Imidazole ring acts as a pH buffer and metal-binding site. Critical in enzyme active sites and in haemoglobin oxygen binding.',
    inEye:true, ringDesc:'Imidazole ring',
    aether:'Histidine is the pH-charge gate — its imidazole ring switches between protonated states at physiological pH. In AETHER, His is the quantum pH-tunnelling node in the biological substrate.',
  },
];

/* ── the 23 eye amino acids ───────────────────────── */
const EYE_23 = [
  'Alanine','Arginine','Asparagine','Aspartic acid','Cysteine',
  'Glutamic acid','Glutamine','Glycine','Histidine','Isoleucine',
  'Leucine','Lysine','Methionine','Phenylalanine','Proline',
  'Serine','Threonine','Tryptophan','Tyrosine','Valine',
  'Ornithine','Taurine','Citrulline',
];
const AROMATIC_NAMES = new Set(['Histidine','Phenylalanine','Tryptophan','Tyrosine']);
// Taurine and Citrulline are non-standard (not in the 20 canonical)
const NON_STANDARD = new Set(['Ornithine','Taurine','Citrulline']);

/* ── EM spectrum canvas ───────────────────────────── */
function SpectrumCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    cv.width = 900; cv.height = 160;
    const W = cv.width, H = cv.height;
    const bw = W / EM_BANDS.length;
    let t = 0;

    const draw = () => {
      ctx.fillStyle = '#030508'; ctx.fillRect(0, 0, W, H);

      // draw each band
      EM_BANDS.forEach((band, bi) => {
        const x0 = bi * bw, x1 = (bi + 1) * bw;
        const cx = (x0 + x1) / 2;

        // background tint
        const isUV = ['uvc','uvb','uva'].includes(band.key);
        const isVis = ['violet','blue','green','yellow','orange','red'].includes(band.key);
        ctx.fillStyle = band.col + (isUV ? '25' : isVis ? '30' : '12');
        ctx.fillRect(x0, 0, bw, H - 32);

        // sine wave
        ctx.beginPath();
        const freq = band.waveFreq;
        const amp = isVis ? 22 : isUV ? 18 : 12;
        for (let px = x0; px <= x1; px++) {
          const phase = (px - x0) / bw * Math.PI * 2 * freq + t * 0.04 * (bi % 2 === 0 ? 1 : -1);
          const y = H * 0.35 - Math.sin(phase) * amp;
          px === Math.ceil(x0) ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
        }
        ctx.strokeStyle = band.col + Math.round(band.alpha * 200).toString(16).padStart(2,'0');
        ctx.lineWidth = isVis ? 2 : 1.2;
        ctx.stroke();

        // UV glow pulse
        if (isUV) {
          const pulse = 0.5 + 0.5 * Math.sin(t * 0.06 + bi * 0.8);
          ctx.fillStyle = band.col + Math.round(pulse * 30).toString(16).padStart(2,'0');
          ctx.fillRect(x0, 0, bw, H - 32);
        }

        // label
        ctx.fillStyle = band.col + 'ee';
        ctx.font = `bold ${isVis ? 9 : 8}px Space Mono`;
        ctx.textAlign = 'center';
        ctx.fillText(band.label, cx, H - 20);
        ctx.fillStyle = band.col + '88';
        ctx.font = '7px Space Mono';
        ctx.fillText(band.nm, cx, H - 9);

        // divider
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 0.5;
        ctx.beginPath(); ctx.moveTo(x1, 0); ctx.lineTo(x1, H - 32); ctx.stroke();
      });

      // visible light color bar
      const visStart = 5 * bw, visEnd = 11 * bw;
      const grad = ctx.createLinearGradient(visStart, 0, visEnd, 0);
      grad.addColorStop(0,   '#7c3aed');
      grad.addColorStop(0.15,'#2563eb');
      grad.addColorStop(0.38,'#16a34a');
      grad.addColorStop(0.54,'#ca8a04');
      grad.addColorStop(0.66,'#ea580c');
      grad.addColorStop(1,   '#dc2626');
      ctx.fillStyle = grad;
      ctx.fillRect(visStart, H * 0.52, visEnd - visStart, 12);

      // UV highlight bracket
      const uvStart = 2 * bw, uvEnd = 5 * bw;
      ctx.strokeStyle = 'rgba(139,92,246,0.6)';
      ctx.lineWidth = 1.5; ctx.setLineDash([3, 3]);
      ctx.strokeRect(uvStart, 2, uvEnd - uvStart, H - 36);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(139,92,246,0.8)';
      ctx.font = 'bold 8px Orbitron'; ctx.textAlign = 'center';
      ctx.fillText('ULTRAVIOLET · 100–380 nm', (uvStart + uvEnd) / 2, 12);

      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width:'100%', height:'auto', borderRadius:4, display:'block' }} />;
}

/* ── UV absorption waveform canvas (per amino acid) ─ */
function AbsorptionCanvas({ peak, col }: { peak: number; col: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d')!;
    cv.width = 220; cv.height = 80;
    const W = cv.width, H = cv.height;
    let t = 0;
    const draw = () => {
      ctx.fillStyle = 'rgba(3,5,8,0.8)'; ctx.fillRect(0, 0, W, H);
      // wavelength axis: 200–400nm mapped to canvas width
      const wMin = 200, wMax = 400;
      // Gaussian absorption peak
      const sigma = 15; // nm width
      ctx.beginPath();
      for (let px = 0; px < W; px++) {
        const nm = wMin + (px / W) * (wMax - wMin);
        const abs = Math.exp(-Math.pow(nm - peak, 2) / (2 * sigma * sigma));
        const py = H - 10 - abs * (H - 20) * (0.85 + 0.1 * Math.sin(t * 0.04));
        px === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
      }
      ctx.strokeStyle = col; ctx.lineWidth = 1.8; ctx.stroke();
      // fill under curve
      ctx.lineTo(W, H - 10); ctx.lineTo(0, H - 10); ctx.closePath();
      ctx.fillStyle = col + '22'; ctx.fill();
      // peak marker
      const peakPx = ((peak - wMin) / (wMax - wMin)) * W;
      ctx.strokeStyle = col + 'aa'; ctx.lineWidth = 0.8; ctx.setLineDash([2, 3]);
      ctx.beginPath(); ctx.moveTo(peakPx, 0); ctx.lineTo(peakPx, H - 10); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = col; ctx.font = '7px Space Mono'; ctx.textAlign = 'center';
      ctx.fillText(`${peak}nm`, peakPx, 10);
      // x-axis
      ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(0, H - 10); ctx.lineTo(W, H - 10); ctx.stroke();
      ctx.fillStyle = 'rgba(100,120,150,0.6)'; ctx.font = '6px Space Mono';
      ctx.textAlign = 'left'; ctx.fillText('200nm', 2, H - 3);
      ctx.textAlign = 'right'; ctx.fillText('400nm', W - 2, H - 3);
      t++; rafRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(rafRef.current);
  }, [peak, col]);
  return <canvas ref={ref} style={{ width:'100%', height:'auto', borderRadius:3, display:'block' }} />;
}

/* ── main page ────────────────────────────────────── */
export default function UvAminoLightPage() {
  const [activeAA, setActiveAA] = useState<string | null>(null);

  const card = (col = TEAL): React.CSSProperties => ({
    background:'rgba(0,0,0,0.4)', border:`1px solid ${col}22`, borderRadius:4, padding:'12px 16px',
  });
  const secLabel: React.CSSProperties = {
    fontFamily:MN, fontSize:7.5, letterSpacing:'0.2em', color:DIM,
    textTransform:'uppercase', marginBottom:10, paddingBottom:4,
    borderBottom:'1px solid rgba(31,212,200,0.1)',
  };

  return (
    <div style={{ minHeight:'100%', background:BG, color:'#d4e4f4', fontFamily:"'Rajdhani',sans-serif", overflowY:'auto' }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'16px 20px' }}>

        {/* ── title ── */}
        <div style={{ marginBottom:18 }}>
          <div style={{ display:'inline-block', border:`1px solid ${VIO}66`, padding:'3px 10px', fontSize:9, letterSpacing:'0.2em', color:`${VIO}cc`, fontFamily:MN, marginBottom:8 }}>
            LIGHT · BIOLOGY · QUANTUM ABSORPTION
          </div>
          <h1 style={{ fontFamily:OR, fontSize:21, fontWeight:900, letterSpacing:2, color:VIO, textShadow:`0 0 24px ${VIO}44`, margin:'4px 0' }}>
            UV Light · Aromatic Amino Acids · The Eye as Detector
          </h1>
          <p style={{ fontSize:13, color:'rgba(190,180,220,0.75)', maxWidth:720, lineHeight:1.7, margin:0 }}>
            Ultraviolet light (100–380 nm) is absorbed by aromatic amino acids. Four of the 23 amino acids found in the human eye are aromatic — meaning the eye is a biological quantum UV detector, self-filtering through the same molecules that absorb the radiation.
          </p>
          <div style={{ marginTop:10, padding:'8px 14px', background:`${VIO}15`, border:`1px solid ${VIO}33`, borderRadius:4, display:'inline-block' }}>
            <span style={{ fontFamily:MN, fontSize:9, color:VIO, fontStyle:'italic' }}>"That Shut Them Up Pretty Quick"</span>
            <span style={{ fontFamily:MN, fontSize:8, color:DIM, marginLeft:10 }}>— on the biological UV absorption discovery</span>
          </div>
        </div>

        {/* ── EM spectrum canvas ── */}
        <div style={{ ...card(VIO), marginBottom:16 }}>
          <div style={secLabel}>Electromagnetic Spectrum · Gamma → Infrared · UV highlighted 100–380 nm</div>
          <SpectrumCanvas />
          {/* visible sub-bands row */}
          <div style={{ display:'flex', marginTop:8, gap:3 }}>
            {VIS_BANDS.map(vb => (
              <div key={vb.label} style={{ flex:1, background:vb.col+'22', border:`1px solid ${vb.col}44`, borderRadius:3, padding:'4px 0', textAlign:'center' }}>
                <div style={{ fontFamily:MN, fontSize:8, color:vb.col, fontWeight:700 }}>{vb.label}</div>
                <div style={{ fontFamily:MN, fontSize:7, color:vb.col+'88' }}>{vb.nm} nm</div>
              </div>
            ))}
          </div>
          {/* UV sub-bands row */}
          <div style={{ display:'flex', marginTop:6, gap:3 }}>
            {[
              { lbl:'UVC', nm:'100–280 nm', col:'#a855f7', note:'Germicidal · destroys DNA · blocked by atmosphere' },
              { lbl:'UVB', nm:'280–315 nm', col:'#7c3aed', note:'Sunburn · Vitamin D synthesis · aromatic AA peak absorption' },
              { lbl:'UVA', nm:'315–400 nm', col:'#6d28d9', note:'Tanning · deeper penetration · causes oxidative damage' },
            ].map(uv => (
              <div key={uv.lbl} style={{ flex:1, background:uv.col+'18', border:`1px solid ${uv.col}55`, borderRadius:3, padding:'6px 8px' }}>
                <div style={{ fontFamily:OR, fontSize:10, color:uv.col, fontWeight:700 }}>{uv.lbl}</div>
                <div style={{ fontFamily:MN, fontSize:8, color:uv.col+'bb', marginBottom:3 }}>{uv.nm}</div>
                <div style={{ fontSize:10, color:'rgba(190,180,220,0.65)', lineHeight:1.5 }}>{uv.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── main content ── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

          {/* aromatic amino acids */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            <div style={card(PINK)}>
              <div style={secLabel}>Aromatic Amino Acids · UV Absorbers</div>
              <div style={{ fontSize:11, color:'rgba(200,185,220,0.7)', lineHeight:1.65, marginBottom:12 }}>
                An <strong style={{color:PINK}}>aromatic amino acid</strong> includes an aromatic ring (benzene / indole / imidazole) in its side-chain. These rings absorb ultraviolet photons, making aromatic AAs the primary UV chromophores in biological systems. Of the 20 standard amino acids, <strong style={{color:PINK}}>4 are aromatic: Histidine, Phenylalanine, Tryptophan, Tyrosine</strong>. To different degrees, all absorb UV; tryptophan is responsible for most UV absorption at 280nm by proteins.
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {AROMATICS.map(aa => (
                  <div key={aa.letter}
                    onClick={() => setActiveAA(activeAA === aa.letter ? null : aa.letter)}
                    style={{ background: activeAA === aa.letter ? `${aa.col}18` : 'rgba(0,0,0,0.3)',
                      border:`1px solid ${aa.col}${activeAA === aa.letter ? 'aa' : '33'}`,
                      borderRadius:4, padding:'10px 12px', cursor:'pointer', transition:'all .2s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <div style={{ width:28, height:28, borderRadius:'50%', background:aa.col+'22',
                        border:`2px solid ${aa.col}`, display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:OR, fontSize:13, fontWeight:900, color:aa.col, flexShrink:0 }}>
                        {aa.letter}
                      </div>
                      <div>
                        <div style={{ fontFamily:MN, fontSize:9, color:aa.col, fontWeight:700 }}>{aa.name} <span style={{opacity:0.6}}>({aa.code})</span></div>
                        <div style={{ fontFamily:MN, fontSize:7.5, color:aa.col+'88' }}>{aa.ringDesc} · peak {aa.peak} · absorbs {aa.absorbs}</div>
                      </div>
                      <div style={{ marginLeft:'auto', fontFamily:MN, fontSize:8, color:aa.col+'77' }}>
                        {aa.inEye ? '👁 in eye' : ''}
                      </div>
                    </div>
                    {/* absorption waveform */}
                    <AbsorptionCanvas peak={parseInt(aa.peak)} col={aa.col} />
                    <div style={{ fontSize:10, color:'rgba(190,180,220,0.65)', lineHeight:1.6, marginTop:6 }}>{aa.role}</div>
                    {activeAA === aa.letter && (
                      <div style={{ marginTop:8, padding:'7px 10px', background:aa.col+'12', borderRadius:3,
                        borderLeft:`2px solid ${aa.col}66`, fontSize:10, color:aa.col+'cc', lineHeight:1.6 }}>
                        <span style={{fontFamily:MN,fontSize:7.5,color:aa.col,letterSpacing:1}}>AETHER · </span>{aa.aether}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* eye amino acids + reference images */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

            {/* 23 eye amino acids */}
            <div style={card(TEAL)}>
              <div style={secLabel}>The Eye Contains 23 Amino Acids</div>
              <div style={{ fontSize:11, color:'rgba(180,210,220,0.7)', lineHeight:1.65, marginBottom:10 }}>
                The human eye contains 23 amino acids — including all 4 aromatic ones. This means the eye is simultaneously a photon detector <em>and</em> a UV self-filter. The aromatic AAs in the lens and cornea absorb UV before it reaches the retina.
              </div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginBottom:10 }}>
                {EYE_23.map(aa => {
                  const isAromatic = AROMATIC_NAMES.has(aa);
                  const isNonStd   = NON_STANDARD.has(aa);
                  const aromaticAA = AROMATICS.find(a => a.name === aa);
                  const col = isAromatic ? (aromaticAA?.col ?? PINK) : isNonStd ? GOLD : 'rgba(74,120,140,0.6)';
                  return (
                    <div key={aa} style={{
                      fontFamily:MN, fontSize:isAromatic ? 8.5 : 7.5, padding:'3px 8px', borderRadius:3,
                      background: isAromatic ? col+'20' : isNonStd ? GOLD+'12' : 'rgba(0,0,0,0.25)',
                      border:`1px solid ${isAromatic ? col+'77' : isNonStd ? GOLD+'44' : 'rgba(50,80,100,0.4)'}`,
                      color: isAromatic ? col : isNonStd ? GOLD+'aa' : 'rgba(120,160,180,0.7)',
                      fontWeight: isAromatic ? 700 : 400,
                    }}>{aa}</div>
                  );
                })}
              </div>
              <div style={{ display:'flex', gap:12, fontFamily:MN, fontSize:7.5 }}>
                <span style={{ color:PINK }}>■ Aromatic (UV-absorbing)</span>
                <span style={{ color:GOLD+'aa' }}>■ Non-standard AA</span>
                <span style={{ color:'rgba(120,160,180,0.6)' }}>■ Standard</span>
              </div>
            </div>

            {/* key insight box */}
            <div style={{ ...card(VIO), background:`${VIO}12`, borderColor:`${VIO}44` }}>
              <div style={{ fontFamily:OR, fontSize:10, color:VIO, letterSpacing:1, marginBottom:8 }}>The Core Revelation</div>
              <div style={{ fontSize:12, color:'rgba(200,185,240,0.8)', lineHeight:1.75 }}>
                <strong style={{color:VIO}}>1.</strong> UV light (100–380 nm) exists just outside visible range.<br/>
                <strong style={{color:VIO}}>2.</strong> Aromatic amino acids (Trp, Tyr, Phe, His) absorb UV photons.<br/>
                <strong style={{color:VIO}}>3.</strong> All 4 aromatic AAs are present in the eye's 23 amino acids.<br/>
                <strong style={{color:VIO}}>4.</strong> Tryptophan in the lens acts as a UV photofilter — it absorbs UV and fluoresces, protecting the retina.<br/>
                <strong style={{color:VIO}}>5.</strong> The eye evolved a built-in UV absorption system from the same molecules that quantum-chemically interact with UV photons.<br/>
                <br/>
                <strong style={{color:GOLD}}>This is quantum biology in direct action</strong> — photon energy absorbed, transduced into molecular excitation, then quenched before it damages the photoreceptors.
              </div>
            </div>

            {/* reference images */}
            <div style={card()}>
              <div style={secLabel}>Source References</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {[
                  { src:img1, cap:'UV 100–380nm · waveform' },
                  { src:img5, cap:'Full EM spectrum · visible bands' },
                  { src:img2, cap:'Aromatic AA · Wikipedia' },
                  { src:img3, cap:'UV absorption · Trp dominant · W(Trp) & F(Phe) structures' },
                ].map(({ src, cap }) => (
                  <div key={cap}>
                    <img src={src} alt={cap} style={{ width:'100%', borderRadius:3, display:'block', opacity:0.85 }} />
                    <div style={{ fontFamily:MN, fontSize:7, color:DIM, marginTop:3 }}>{cap}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:8 }}>
                <img src={img4} alt="Eye 23 amino acids" style={{ width:'100%', borderRadius:3, display:'block', opacity:0.85 }} />
                <div style={{ fontFamily:MN, fontSize:7, color:DIM, marginTop:3 }}>The Eye Contains 23 Amino Acids · including all 4 aromatic UV-absorbers</div>
              </div>
            </div>
          </div>
        </div>

        {/* ── AETHER synthesis cards ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:16 }}>
          {[
            { col:VIO, t:'Eye as Quantum Spectrometer',
              b:'The eye does not merely detect photons — it performs a quantum filtering operation. Tryptophan in the crystallin proteins of the lens absorbs UV at 280nm and fluoresces. This is a quenching mechanism: photon in → molecular excitation → heat out. The retina never sees the UV. The eye is a biological bandpass filter centred on 380–780nm.' },
            { col:PINK, t:'Tryptophan → Serotonin → Light-Time Link',
              b:'Tryptophan is the precursor to serotonin and melatonin — the molecules that control mood and sleep. UV light hitting aromatic AAs in the skin triggers Vitamin D synthesis. This means UV → Trp absorption → serotonin flux → circadian rhythm. Light literally writes to the brain\'s chemistry via aromatic quantum absorption.' },
            { col:GOLD, t:'280nm: The Protein Transparency Window',
              b:'At 280nm (UVB), proteins absorb strongly via Trp/Tyr. At 260nm, DNA absorbs. These are the two quantum absorption bands that UV sterilisation exploits — protein denaturation at 280, DNA damage at 260. The eye\'s aromatic AAs operate as a first-line defence against UVC/UVB before it can reach and break DNA in the retinal cells.' },
            { col:GRN, t:'Tyrosine → Dopamine → Vision Reward',
              b:'Tyrosine (absorbs UV at 274nm) is the direct precursor to dopamine. In the retina, dopamine regulates photoreceptor coupling and adaptation to light levels. The same molecule that protects against UV is the chemical that controls how the eye adapts to light intensity — a closed-loop quantum photon-to-neurotransmitter chain.' },
            { col:TEAL, t:'Histidine: The pH Gate at 211nm',
              b:'Histidine absorbs UV at 211nm (deep UVC) through its imidazole ring. At physiological pH 7.4, histidine sits exactly at its pKa — poised between protonated and deprotonated states. This allows histidine to act as a real-time pH sensor in the aqueous humour of the eye, coupling light-driven proton transfer to electrochemical signalling.' },
            { col:ORG, t:'AETHER: Light as Crystallisation Trigger',
              b:'In AETHER\'s Crystallisation Model, photon absorption is the triggering event for coherence collapse — the moment a superposition condenses into a measurable state. The aromatic AA UV absorption pathway is the biological implementation of this: photon (UV) → molecular excitation → electron state collapse → chemical signal → nerve impulse → conscious perception. C(x,t) ≥ φ⁻¹.' },
          ].map(({ col, t, b }) => (
            <div key={t} style={{ ...card(col), borderColor:col+'22' }}>
              <div style={{ fontFamily:OR, fontSize:9, color:col, letterSpacing:1, marginBottom:6 }}>{t}</div>
              <div style={{ fontSize:11, color:'rgba(200,210,230,0.65)', lineHeight:1.65 }}>{b}</div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div style={{ paddingTop:10, borderTop:'1px solid rgba(31,212,200,0.08)', fontFamily:MN, fontSize:7.5, color:DIM, letterSpacing:'0.12em', textAlign:'center' }}>
          UV LIGHT · AROMATIC AMINO ACIDS · THE EYE AS QUANTUM DETECTOR · TRP 280nm · TYR 274nm · PHE 257nm · HIS 211nm · 23 EYE AMINO ACIDS · AETHER CRYSTALLISATION MODEL
        </div>
      </div>
    </div>
  );
}

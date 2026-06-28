import { useEffect, useRef, useState } from "react";
import { CodeFilesPanel } from "@/components/code-files-panel";

const BG    = "#020408";
const PANEL = "#07101C";
const BORDER= "#0D1E30";
const AU    = "#00FFB2";
const GOLD  = "#C8A030";
const ORANGE= "#E06820";
const BLUE  = "#1A9FD4";
const VIOL  = "#9060E0";
const DIM   = "#2A3D54";
const TEXT  = "#B8C8D8";
const MUTED = "#3A5068";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── physics helpers ─────────────────────────────────────────────────── */
function couplingK(gap_cm: number, coil_r_cm: number) {
  const ratio = coil_r_cm / (coil_r_cm + gap_cm);
  return 0.85 * ratio * ratio * ratio;
}
function resonantEfficiency(k: number, Q: number) {
  const kQ = k * Q;
  return (kQ * kQ) / (1 + kQ * kQ);
}
function resonantFreq(L_uH: number, C_pF: number) {
  return 1 / (2 * Math.PI * Math.sqrt(L_uH * 1e-6 * C_pF * 1e-12));
}
function mutualInductance(k: number, L_uH: number) {
  return k * L_uH; // M = k * sqrt(L1*L2), L1=L2=L_uH
}

type Particle = { x: number; y: number; vx: number; speed: number; alpha: number };

/* ── main canvas ─────────────────────────────────────────────────────── */
function WirelessCanvas({
  gap_cm, freq_khz, Q, eta, k,
}: {
  gap_cm: number; freq_khz: number; Q: number; eta: number; k: number;
}) {
  const ref  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const time = useRef(0);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;

    const txX = W * 0.22;
    const rxX = W * 0.78;
    const cy  = H * 0.5;
    const coilRx = Math.min(W * 0.1, 70);
    const coilRy = coilRx * 1.5;

    // initialise particles
    if (particles.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        particles.current.push({
          x: txX + coilRx * 0.5 * (Math.random() - 0.5),
          y: cy + (Math.random() - 0.5) * coilRy * 0.8,
          vx: 1 + Math.random() * 2,
          speed: 0.5 + Math.random() * 1.5,
          alpha: Math.random(),
        });
      }
    }

    function drawCoil(cx2: number, col: string, label: string, sub: string) {
      // coil body (wound wire effect -- concentric ellipses)
      for (let n = 3; n >= 0; n--) {
        const rx = coilRx - n * 5;
        const ry = coilRy - n * 8;
        ctx.beginPath();
        ctx.ellipse(cx2, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `${col}${n===0 ? "ff" : n===1?"aa":"55"}`;
        ctx.lineWidth = n === 0 ? 2.5 : 1;
        ctx.stroke();
      }
      // glow
      const g = ctx.createRadialGradient(cx2, cy, coilRx*0.3, cx2, cy, coilRx*1.8);
      g.addColorStop(0, `${col}30`);
      g.addColorStop(1, `${col}00`);
      ctx.beginPath();
      ctx.ellipse(cx2, cy, coilRx*1.8, coilRy*1.8, 0, 0, Math.PI*2);
      ctx.fillStyle = g;
      ctx.fill();
      // labels
      ctx.fillStyle = col;
      ctx.font = `bold 11px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText(label, cx2, cy - coilRy - 18);
      ctx.fillStyle = MUTED;
      ctx.font = `9px ${mono}`;
      ctx.fillText(sub, cx2, cy - coilRy - 6);
    }

    function drawFieldLines(t: number) {
      const omega = freq_khz * 2 * Math.PI * 0.001;
      const nLines = 7;
      const gapPx = rxX - txX - coilRx * 2;

      for (let li = 0; li < nLines; li++) {
        const yOff = (li / (nLines - 1) - 0.5) * coilRy * 1.6;
        const amp = k * 40 * Math.cos(Math.PI * li / (nLines - 1));

        ctx.beginPath();
        const steps = 80;
        for (let s = 0; s <= steps; s++) {
          const frac = s / steps;
          const px = txX + coilRx + frac * gapPx;
          const wave = amp * Math.sin(frac * Math.PI * 3 + omega * t);
          const decay = Math.sin(frac * Math.PI);
          const py = cy + yOff + wave * decay;
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        const brightness = Math.floor(0x18 + k * 0xCC);
        const hex2 = brightness.toString(16).padStart(2,"0");
        ctx.strokeStyle = `#00${hex2}B2`;
        ctx.lineWidth = 0.8 + k * 0.8;
        ctx.globalAlpha = 0.3 + k * 0.5;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    function drawParticles(t: number) {
      const gapStart = txX + coilRx;
      const gapEnd   = rxX - coilRx;

      particles.current.forEach(p => {
        p.x += p.speed * eta * 3;
        p.alpha += 0.02;
        if (p.x > gapEnd + 10 || p.alpha > 1) {
          p.x = gapStart - 5;
          p.y = cy + (Math.random() - 0.5) * coilRy * 1.2;
          p.speed = 0.4 + Math.random() * 1.2;
          p.alpha = 0;
        }
        const fade = Math.min(p.alpha, 1 - p.alpha * 0.3);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `${GOLD}`;
        ctx.globalAlpha = fade * eta * 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;
      });
    }

    function drawEfficiencyBar() {
      const barW = W * 0.5;
      const barX = (W - barW) / 2;
      const barY = H - 32;
      const barH = 8;

      ctx.fillStyle = `${AU}18`;
      ctx.roundRect(barX, barY, barW, barH, 4);
      ctx.fill();

      const grad = ctx.createLinearGradient(barX, 0, barX + barW * eta, 0);
      grad.addColorStop(0, AU);
      grad.addColorStop(1, GOLD);
      ctx.fillStyle = grad;
      ctx.roundRect(barX, barY, barW * eta, barH, 4);
      ctx.fill();

      ctx.fillStyle = AU;
      ctx.font = `9px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText(`EFFICIENCY  ${(eta*100).toFixed(1)}%`, W/2, H - 40);
      ctx.fillStyle = MUTED;
      ctx.fillText(`k = ${k.toFixed(3)}   Q = ${Q}   f = ${freq_khz < 1000 ? freq_khz.toFixed(0)+"kHz" : (freq_khz/1000).toFixed(2)+"MHz"}`, W/2, H - 16);
    }

    function draw() {
      time.current += 0.016;
      const t = time.current;

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // field glow bg
      const mid = (txX + rxX) / 2;
      const gBg = ctx.createRadialGradient(mid, cy, 10, mid, cy, W * 0.4);
      gBg.addColorStop(0, `${AU}${Math.floor(k * 0x18).toString(16).padStart(2,"0")}`);
      gBg.addColorStop(1, `${AU}00`);
      ctx.fillStyle = gBg;
      ctx.fillRect(0, 0, W, H);

      drawFieldLines(t);
      drawParticles(t);
      drawCoil(txX, BLUE, "TX COIL", "transmitter");
      drawCoil(rxX, AU,   "RX COIL", "receiver");
      drawEfficiencyBar();

      // coupling arrow
      if (k > 0.05) {
        ctx.strokeStyle = `${GOLD}88`;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(txX + coilRx + 4, cy - coilRy - 30);
        ctx.lineTo(rxX - coilRx - 4, cy - coilRy - 30);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = GOLD;
        ctx.font = `8px ${mono}`;
        ctx.textAlign = "center";
        ctx.fillText(`M = ${mutualInductance(k, 10).toFixed(2)} uH`, (txX + rxX) / 2, cy - coilRy - 36);
      }

      raf.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [gap_cm, freq_khz, Q, eta, k]);

  return <canvas ref={ref} width={900} height={320} style={{ width:"100%", height:"auto", display:"block", borderRadius:8 }} />;
}

/* ── slider ──────────────────────────────────────────────────────────── */
function Slider({
  label, value, min, max, step, unit, onChange, col = AU,
}: {
  label: string; value: number; min: number; max: number; step: number;
  unit: string; onChange: (v:number)=>void; col?: string;
}) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontFamily:mono, fontSize:10, color:MUTED }}>{label}</span>
        <span style={{ fontFamily:mono, fontSize:10, color:col }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width:"100%", accentColor:col, cursor:"pointer" }} />
    </div>
  );
}

/* ── code files ──────────────────────────────────────────────────────── */
const WP_CODE_FILES = [
  {
    id:"coupling", name:"resonant_coupling.qg", icon:"Mc",
    content:`# AETHER-EM -- Resonant Inductive Coupling (WiTricity)
# Two LC resonators tuned to same frequency exchange energy via mutual inductance M.
# At resonance: coupling is maximally efficient, reactive power cancels.
# Invented: Nikola Tesla (1891) -- demonstrated wirelessly lighting bulbs.
# Modern: Kurs et al. 2007 -- resonant coupling at ~2m, 40% efficiency.

import numpy as np

MU0 = 4 * np.pi * 1e-7   # permeability of free space [H/m]

def mutual_inductance_coaxial(N1, N2, a1_m, a2_m, d_m):
    """
    Neumann formula approximation for two coaxial circular loops:
    M = mu0 * pi * (a1*a2)^2 / (2 * (d^2 + ((a1+a2)/2)^2)^(3/2))
    Valid when d >> a (far field). For d ~ a: use Nagaoka's elliptic integrals.
    Units: [H] (henries)
    """
    a_avg = (a1_m + a2_m) / 2
    return (MU0 * np.pi * (a1_m * a2_m)**2 * N1 * N2
            / (2 * (d_m**2 + a_avg**2)**1.5))

def coupling_coefficient(M, L1, L2):
    """
    k = M / sqrt(L1 * L2)
    k in [0, 1]: k=0 no coupling, k=1 perfectly coupled (transformer).
    For resonant wireless: k ~ 0.001-0.1 (weakly coupled, but Q compensates).
    """
    return M / np.sqrt(L1 * L2 + 1e-30)

def resonant_efficiency(k, Q1, Q2):
    """
    At resonance (omega = omega0 = 1/sqrt(LC)):
    eta = (k^2 * Q1 * Q2) / (1 + k^2 * Q1 * Q2)^2 -- (power gain formula)
    Peak eta when k^2 * Q1 * Q2 = 1 -> eta_max = 25% ... but
    with impedance matching: eta = (k*Q)^2 / (1 + (k*Q)^2) for Q1=Q2=Q.
    High Q compensates for small k: Q=100, k=0.01 -> kQ=1 -> eta~50%.
    """
    kQ = k * np.sqrt(Q1 * Q2)
    return kQ**2 / (1 + kQ**2)

def resonant_frequency(L_H, C_F):
    """omega0 = 1/sqrt(L*C), f0 = omega0 / (2*pi)"""
    return 1 / (2*np.pi*np.sqrt(L_H * C_F))

# Design example: Qi wireless charging (15W, 5-10mm gap)
# f = 87-205 kHz, k ~ 0.3-0.7, Q ~ 30-80
# Efficiency: 85-93% (includes rectification losses)
# WiTricity long-range: f = 10 MHz, k ~ 0.001, Q ~ 1000 -> eta ~ 50% at 2m`,
  },
  {
    id:"quality", name:"coil_quality_factor.qg", icon:"Q",
    content:`# AETHER-EM -- Coil Quality Factor Q
# Q = energy stored / energy dissipated per cycle = omega * L / R
# High Q: energy circulates many times before being lost to resistance.
# Q is the amplifier for weak coupling: effective coupling = k * Q.

import numpy as np

RHO_CU = 1.68e-8   # copper resistivity [Ohm m]
MU0    = 4e-7 * np.pi

def dc_resistance(wire_dia_m, length_m):
    """R_DC = rho * length / area"""
    area = np.pi * (wire_dia_m/2)**2
    return RHO_CU * length_m / area

def skin_depth(freq_hz):
    """
    delta = sqrt(rho / (pi * f * mu0))
    At 100 kHz in copper: delta ~ 0.21 mm
    At 10 MHz: delta ~ 21 um
    Current concentrates in surface layer -> effective resistance rises with f.
    """
    return np.sqrt(RHO_CU / (np.pi * freq_hz * MU0))

def ac_resistance(wire_dia_m, length_m, freq_hz):
    """
    For wire_dia >> 2*delta: R_AC = R_DC * wire_dia / (4*delta)
    For wire_dia <= 2*delta: R_AC ~ R_DC (full wire conducts)
    """
    delta = skin_depth(freq_hz)
    delta2 = 2 * delta
    R_dc = dc_resistance(wire_dia_m, length_m)
    if wire_dia_m <= delta2:
        return R_dc
    return R_dc * wire_dia_m / (4 * delta)

def quality_factor(L_H, C_F, R_AC, freq_hz):
    """
    Q = (1/R) * sqrt(L/C)  (at resonance: X_L = X_C -> Q = omega0*L/R)
    """
    omega0 = 1 / np.sqrt(L_H * C_F)
    return omega0 * L_H / R_AC

def litz_wire_Q(n_strands, strand_dia_m, length_m, L_H, C_F, freq_hz):
    """
    Litz wire: n parallel strands each thinner than skin depth.
    Each strand sees full wire cross-section -> R_AC ~ R_DC * sqrt(f/f_cross)
    Typical Litz: Q improvement 3-10x vs solid wire at 100 kHz-10 MHz.
    """
    strand_R = dc_resistance(strand_dia_m, length_m) / n_strands
    return quality_factor(L_H, C_F, strand_R, freq_hz)

# Practical Q values:
# Air-core coil, solid copper, 100 kHz: Q ~ 50-150
# Air-core coil, Litz wire, 100 kHz:    Q ~ 200-600
# Ferrite-core coil, 100 kHz:            Q ~ 100-400 (core loss limits)
# Superconducting coil, 10 MHz:          Q ~ 10^6 (loss -> zero)`,
  },
  {
    id:"impedance", name:"impedance_matching.qg", icon:"Zm",
    content:`# AETHER-EM -- Impedance Matching for Maximum Power Transfer
# Maximum power to load when Z_source = Z_load* (conjugate match)
# For wireless power: matching network transforms Rload to optimal value.
# Without matching: reflection coefficient Gamma = (ZL-ZS*)/(ZL+ZS) != 0

import numpy as np

class ImpedanceMatch:
    """
    L-network impedance matching between source R_s and load R_L.
    Two topologies: LOW-Q (shunt-series) and HIGH-Q (series-shunt).
    """
    def __init__(self, R_source, R_load, freq_hz):
        self.Rs = R_source
        self.Rl = R_load
        self.f  = freq_hz
        self.w  = 2 * np.pi * freq_hz

    def l_network(self):
        """
        L-network: shunt C parallel with source, series L to load.
        Q = sqrt(R_source / R_load - 1)  (required Q of L-network)
        """
        if self.Rs <= self.Rl:
            return None   # need step-up: swap source and load
        Q  = np.sqrt(self.Rs / self.Rl - 1)
        Xs = self.Rs / Q        # series element reactance [Ohm]
        Xp = self.Rs * Q        # parallel element reactance [Ohm]
        Ls = Xs / self.w        # series inductance [H]
        Cp = 1 / (self.w * Xp) # parallel capacitance [F]
        return {"Q": Q, "Ls_uH": Ls*1e6, "Cp_pF": Cp*1e12}

    def reflection_coefficient(self, ZL_real, ZL_imag):
        """Gamma = (ZL - Zs*) / (ZL + Zs) -- [0,1] is reflected power fraction"""
        ZL  = complex(ZL_real, ZL_imag)
        ZSc = complex(self.Rs, 0)   # assume source purely resistive
        return abs((ZL - ZSc) / (ZL + ZSc))**2

    def power_transfer_efficiency(self, ZL_real, ZL_imag):
        """Power delivered to load as fraction of available power."""
        return 1 - self.reflection_coefficient(ZL_real, ZL_imag)

# Adaptive impedance matching for variable-gap wireless power:
# As gap changes: k changes -> optimal load R_opt = R_source / (k*Q)^2
# Real-time matching: voltage-controlled varactor adjusts C in ~microseconds
# AETHER connection: impedance matching = coherence alignment
# Mismatched coils (wrong frequency/gap) = incoherent field -> power reflected
# Matched coils at resonance = coherence locked -> power flows`,
  },
  {
    id:"field", name:"near_field_geometry.qg", icon:"Nf",
    content:`# AETHER-EM -- Near-Field Electromagnetic Geometry
# Wireless power operates in near field (r << lambda)
# Near field: reactive (evanescent) -- energy oscillates, not radiated
# Far field: radiative -- energy propagates as EM wave (radio/radar)

import numpy as np

C_LIGHT = 3e8   # [m/s]

def wavelength(freq_hz):
    """lambda = c / f"""
    return C_LIGHT / freq_hz

def near_field_boundary(freq_hz):
    """
    Near field: r < lambda / (2*pi)  ~= lambda / 6.28
    At 100 kHz: boundary = 477 m (! enormous near field)
    At 10 MHz:  boundary = 4.77 m
    At 2.4 GHz: boundary = 0.020 m = 2 cm (WiFi is far field in your hand)
    Wireless power works in near field -> no radiation, no interference.
    """
    return C_LIGHT / (2 * np.pi * freq_hz)

def dipole_field_decay(r, r0, field_at_r0):
    """
    Near-field magnetic dipole: B(r) ~ 1/r^3 (much faster than 1/r^2 radiation)
    This is why wireless power is short-range -- field decays cubically.
    """
    return field_at_r0 * (r0 / r)**3

def bessel_coupling(a1, a2, d, freq_hz):
    """
    Exact coupling of two coaxial circular loops via Neumann formula.
    Uses complete elliptic integrals K(k) and E(k).
    k_elliptic^2 = 4*a1*a2 / ((a1+a2)^2 + d^2)
    M = mu0 * sqrt(a1*a2) * ((2/k_e - k_e)*K(k_e) - (2/k_e)*E(k_e))
    For d >> a: M ~ mu0 * pi * a1^2 * a2^2 / (2*d^3)  (dipole approximation)
    """
    k2 = 4*a1*a2 / ((a1+a2)**2 + d**2)
    # scipy would compute ellipk/ellipe here; simplified:
    k_e = np.sqrt(k2)
    K   = np.pi/2 * (1 + 0.25*k2 + 0.09375*k2**2)  # series approx K(k)
    E   = np.pi/2 * (1 - 0.25*k2 - 0.09375*k2**2)  # series approx E(k)
    return 4e-7 * np.pi * np.sqrt(a1*a2) * ((2/k_e - k_e)*K - (2/k_e)*E)

# AETHER near-field geometry table:
# Qi (phone charging): f=140kHz, r_nf=340m, gap=5-15mm, eta=85-93%
# WiTricity MagLink: f=85kHz,  r_nf=561m, gap=100-280mm, eta=93%
# MIT 2007 demo:     f=9.9MHz, r_nf=4.8m, gap=2000mm, eta=40%
# AETHER field:      f=0.1Hz,  r_nf=477Gm (resonant field = global)`,
  },
];

/* ── main page ───────────────────────────────────────────────────────── */
export default function WirelessPowerPage() {
  const [gap,   setGap  ] = useState(10);    // cm
  const [freq,  setFreq ] = useState(200);   // kHz
  const [Qval,  setQval ] = useState(100);
  const [P_in,  setPIn  ] = useState(100);   // W input

  const k   = couplingK(gap, 12);
  const eta = resonantEfficiency(k, Qval);
  const P_out = P_in * eta;
  const M     = mutualInductance(k, 10);      // L=10uH assumed
  const readouts = [
    { label:"COUPLING k",    val: k.toFixed(4),               col: BLUE },
    { label:"EFFICIENCY eta",val: `${(eta*100).toFixed(1)} %`,col: AU   },
    { label:"POWER OUT",     val: `${P_out.toFixed(1)} W`,    col: GOLD },
    { label:"MUTUAL M",      val: `${M.toFixed(3)} uH`,       col: VIOL },
    { label:"REFLECTED",     val: `${((1-eta)*P_in).toFixed(1)} W`, col: ORANGE },
    { label:"k·Q",           val: (k * Qval).toFixed(2),      col: AU   },
  ];

  return (
    <div style={{ background:BG, minHeight:"100vh", padding:"48px 24px", color:TEXT }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>

        {/* header */}
        <div style={{ marginBottom:32, borderBottom:`1px solid ${BORDER}`, paddingBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:9, letterSpacing:"0.5em", color:AU, marginBottom:10, textTransform:"uppercase" }}>
            AETHER ELECTROMAGNETIC SUBSTRATE
          </div>
          <div style={{ fontFamily:serif, fontSize:28, color:AU, marginBottom:10 }}>Wireless Power Transfer</div>
          <div style={{ fontFamily:body, fontSize:16, color:MUTED, lineHeight:1.7 }}>
            Resonant inductive coupling transfers power between two coils without physical contact.
            When both coils are tuned to the same resonant frequency, even weak magnetic coupling
            (small k) becomes highly efficient because the quality factor Q amplifies the exchange.
            Adjust the sliders to explore how gap, frequency, and coil quality interact.
          </div>
        </div>

        {/* canvas */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:12, padding:"18px 18px 10px", marginBottom:24 }}>
          <WirelessCanvas gap_cm={gap} freq_khz={freq} Q={Qval} eta={eta} k={k} />
        </div>

        {/* controls + readouts */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:28 }}>

          {/* sliders */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"20px 22px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:18, textTransform:"uppercase" }}>
              CONTROLS
            </div>
            <Slider label="COIL GAP" value={gap} min={1} max={50} step={1} unit=" cm" onChange={setGap} col={BLUE} />
            <Slider label="FREQUENCY" value={freq} min={10} max={5000} step={10} unit=" kHz" onChange={setFreq} col={AU} />
            <Slider label="Q-FACTOR" value={Qval} min={10} max={500} step={5} unit="" onChange={setQval} col={VIOL} />
            <Slider label="INPUT POWER" value={P_in} min={1} max={1000} step={1} unit=" W" onChange={setPIn} col={GOLD} />
          </div>

          {/* readouts */}
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"20px 22px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:18, textTransform:"uppercase" }}>
              LIVE READOUTS
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              {readouts.map(r => (
                <div key={r.label} style={{ padding:"10px 12px", background:`${r.col}0e`, border:`1px solid ${r.col}30`, borderRadius:7 }}>
                  <div style={{ fontFamily:mono, fontSize:8, color:MUTED, marginBottom:4, letterSpacing:"0.2em" }}>{r.label}</div>
                  <div style={{ fontFamily:mono, fontSize:15, color:r.col }}>{r.val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* physics equations */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"22px 24px", marginBottom:28 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:18, textTransform:"uppercase" }}>
            KEY EQUATIONS
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:14 }}>
            {[
              { eq:"M = k·√(L₁·L₂)",                  desc:"Mutual inductance via coupling coefficient",      col:VIOL  },
              { eq:"k = M / √(L₁L₂)  ∈ [0,1]",        desc:"Coupling: 0 = no coupling, 1 = ideal transformer",col:BLUE  },
              { eq:"η = (kQ)² / (1 + (kQ)²)",          desc:"Efficiency at resonance, Q = ω₀L / R",           col:AU    },
              { eq:"ω₀ = 1/√(LC)",                     desc:"Resonant frequency -- must match TX and RX",      col:GOLD  },
              { eq:"B(r) ∝ 1/r³",                      desc:"Near-field decay -- faster than radiation 1/r²",  col:ORANGE},
              { eq:"P_out = η · P_in",                 desc:"Delivered power = efficiency × input power",      col:AU    },
            ].map(e => (
              <div key={e.eq} style={{ padding:"10px 14px", background:`${e.col}0a`, border:`1px solid ${e.col}25`, borderRadius:7 }}>
                <div style={{ fontFamily:mono, fontSize:12, color:e.col, marginBottom:5 }}>{e.eq}</div>
                <div style={{ fontFamily:body, fontSize:12, color:MUTED, lineHeight:1.5 }}>{e.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* near-field vs far-field comparison */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:32 }}>
          {[
            { label:"Qi CHARGING",   f:"140 kHz",  d:"5-15 mm", e:"85-93%",  col:AU   },
            { label:"WiTricity CAR", f:"85 kHz",   d:"100-280 mm",e:"93%",   col:GOLD },
            { label:"MIT 2007 DEMO", f:"9.9 MHz",  d:"2000 mm", e:"40%",     col:VIOL },
          ].map(s => (
            <div key={s.label} style={{ padding:"16px", background:PANEL, border:`1px solid ${s.col}30`, borderRadius:8, textAlign:"center" }}>
              <div style={{ fontFamily:mono, fontSize:9, color:s.col, letterSpacing:"0.3em", marginBottom:8 }}>{s.label}</div>
              <div style={{ fontFamily:mono, fontSize:10, color:MUTED, lineHeight:2 }}>
                f = {s.f}<br />gap = {s.d}<br />
                <span style={{ color:s.col }}>{s.e}</span>
              </div>
            </div>
          ))}
        </div>

        {/* insight */}
        <div style={{ padding:"22px 24px", background:"#ffffff04", border:`1px solid ${AU}18`, borderRadius:10, textAlign:"center", marginBottom:0 }}>
          <div style={{ fontFamily:serif, fontSize:15, color:AU, marginBottom:8 }}>THE RESONANCE PRINCIPLE</div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:17, color:GOLD, lineHeight:1.8, marginBottom:14 }}>
            "Two things in resonance need not touch to exchange everything they have.<br />
            The field between them is not empty -- it is the medium of the transfer."
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:DIM, lineHeight:2 }}>
            k·Q = effective coupling -- small k, large Q = same result as large k, small Q
          </div>
          <div style={{ fontFamily:mono, fontSize:9, color:`${DIM}80`, marginTop:14 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce
          </div>
        </div>

        <CodeFilesPanel
          heading="Wireless Power Simulation Files"
          accentColor={AU}
          files={WP_CODE_FILES}
        />
      </div>
    </div>
  );
}

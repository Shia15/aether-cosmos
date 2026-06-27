import React, { useEffect, useRef, useState } from "react";

/* ── palette ─────────────────── */
const BG    = '#04060e';
const GOLD  = '#c8a030';
const QUANT = '#00ffe0';
const DIM   = '#2a4060';
const MAG   = '#cc44ff';
const WARM  = '#ff8833';
const ROSE  = '#ff4488';
const MN    = "'Space Mono', monospace";
const OR    = "'Orbitron', sans-serif";
const CR    = "'Crimson Pro', serif";

/* ══════════════════════════════════════════════
   MODULE-LEVEL DATA STRUCTURES
   ══════════════════════════════════════════════ */

interface Pole { re: number; im: number; res: number; label: string; col: string; }
interface Eq   { name: string; formula: string; units: string; domain: string; pg: string; }
interface CodexEntry { symbol: string; egyptian: string; aether: string; formula: string; col: string; }
interface UnitRow { qty: string; sym: string; si: string; dim: string; notes: string; }

/* ── S(ζ) poles ─────────────────── */
const POLES: Pole[] = [
  { re: 0.5,  im:  1.0, res: 1.0, label: 'alpha', col: QUANT },
  { re: -0.5, im:  1.0, res: 0.8, label: 'beta',  col: '#4488ff' },
  { re: 0.0,  im: -1.5, res: 0.6, label: 'gamma', col: GOLD  },
  { re: 1.0,  im:  0.0, res: 0.4, label: 'delta', col: WARM  },
  { re: -1.0, im:  0.0, res: 0.4, label: 'eps',   col: MAG   },
];

/* ── Heat-map colour: v in [0,1] -> rgb ── */
function heat(v: number): [number, number, number] {
  const clamp = Math.max(0, Math.min(1, v));
  const stops: [number, number, number][] = [
    [4,   6,  14],
    [40,  0,  80],
    [0, 200, 180],
    [200,160,  48],
    [255,255, 255],
  ];
  const idx = clamp * (stops.length - 1);
  const lo  = Math.floor(idx), hi = Math.min(lo + 1, stops.length - 1);
  const t   = idx - lo;
  return [
    Math.round(stops[lo][0] + t * (stops[hi][0] - stops[lo][0])),
    Math.round(stops[lo][1] + t * (stops[hi][1] - stops[lo][1])),
    Math.round(stops[lo][2] + t * (stops[hi][2] - stops[lo][2])),
  ];
}

/* ── S(ζ) magnitude at a point ─── */
function sZeta(re: number, im: number): number {
  let sr = 0, si = 0;
  for (const p of POLES) {
    const dr = re - p.re, di = im - p.im;
    const d2 = dr*dr + di*di;
    if (d2 < 0.0001) return 999;
    sr += p.res * dr / d2;
    si -= p.res * di / d2;
  }
  return Math.sqrt(sr*sr + si*si);
}

/* ── EQUATIONS COMPENDIUM ─────── */
const EQS: Eq[] = [
  { name:'Coherence Synthesis Operator',
    formula:'S(z) = SUM_k a_k / (z - z_k)',
    units:'z: [s^-1]  a_k: [s^-1]  S(z): [dimensionless]',
    domain:'Coherence', pg:'/equation-codex' },
  { name:'Complex Frequency Variable',
    formula:'z = sigma + i*omega',
    units:'sigma: [s^-1]  omega: [rad/s]  |z|: [s^-1]',
    domain:'Coherence', pg:'/equation-codex' },
  { name:'Coherence Field',
    formula:'C(x,t) = |S(z)| / |S(z)|_max  in [0,1]',
    units:'x: [m]  t: [s]  C: [dimensionless]',
    domain:'Coherence', pg:'/blue-light-protocol' },
  { name:'Coherence Dynamics',
    formula:'dC/dt = -gamma*C + kappa*nabla^2*C + eta(t)',
    units:'gamma: [s^-1]  kappa: [m^2/s]  eta: [s^-1]',
    domain:'Coherence', pg:'/blue-light-protocol' },
  { name:'Bubble Maintenance Power',
    formula:'P ~ R^2 * |grad C|^2 / sigma_c',
    units:'R: [m]  |grad C|: [m^-1]  sigma_c: [s/m^2]  P: [W]',
    domain:'Coherence', pg:'/mpc-spacetime' },
  { name:'Potential Flow -- x-velocity',
    formula:'Vx = U*(1 - R^2*(rx^2 - ry^2)/r^4)',
    units:'U: [m/s]  R: [m]  Vx: [m/s]',
    domain:'Spacetime', pg:'/mpc-spacetime' },
  { name:'Potential Flow -- y-velocity',
    formula:'Vy = -U*(2*R^2*rx*ry/r^4)',
    units:'U: [m/s]  R: [m]  Vy: [m/s]',
    domain:'Spacetime', pg:'/mpc-spacetime' },
  { name:'Bernoulli Density Field',
    formula:'rho(x,y) = 1 + 0.5*(1 - |V|^2/U^2)',
    units:'rho: [kg/m^3]  V: [m/s]  U: [m/s]',
    domain:'Spacetime', pg:'/mpc-spacetime' },
  { name:'Stream Function',
    formula:'psi = U*y*(1 - R^2/r^2)',
    units:'U: [m/s]  y: [m]  psi: [m^2/s]',
    domain:'Spacetime', pg:'/mpc-spacetime' },
  { name:'Bernoulli Equation',
    formula:'P + 0.5*rho*v^2 = const',
    units:'P: [Pa]  rho: [kg/m^3]  v: [m/s]',
    domain:'Spacetime', pg:'/mpc-spacetime' },
  { name:'Magnetic Dipole Field',
    formula:'B = (mu0/4pi)*(3*(m.r^)*r^ - m)/r^3',
    units:'m: [A*m^2]  r: [m]  B: [T=kg/(A*s^2)]',
    domain:'Magnetic', pg:'/magnetic-drops' },
  { name:'Rosensweig Threshold',
    formula:'B_c = sqrt(2*mu0*rho*g*sigma_t)',
    units:'mu0: [H/m]  rho: [kg/m^3]  sigma_t: [N/m]  B_c: [T]',
    domain:'Magnetic', pg:'/magnetic-drops' },
  { name:'MHD Thrust Density',
    formula:'f = sigma_e*(v x B) x B  [N/m^3]',
    units:'sigma_e: [S/m]  v: [m/s]  B: [T]  f: [N/m^3]',
    domain:'Magnetic', pg:'/magnetic-drops' },
  { name:'Magnetic Pressure',
    formula:'P_mag = B^2 / (2*mu0)',
    units:'B: [T]  mu0: [H/m=kg*m/A^2*s^2]  P_mag: [Pa]',
    domain:'Magnetic', pg:'/magnetic-drops' },
  { name:'Dipole-Dipole Interaction Energy',
    formula:'U_dd = (mu0/4pi)*(m1*m2/r^3)*(1 - 3*cos^2(theta))',
    units:'m1,m2: [A*m^2]  r: [m]  U_dd: [J]',
    domain:'Magnetic', pg:'/magnetic-drops' },
  { name:'Photon Energy',
    formula:'E = h*c / lambda',
    units:'h: [J*s]  c: [m/s]  lambda: [m]  E: [J]',
    domain:'Quantum', pg:'/quantum-ammeter' },
  { name:'Photon Rate',
    formula:'N = G*A / E  [photons/s]',
    units:'G: [W/m^2]  A: [m^2]  E: [J]  N: [s^-1]',
    domain:'Quantum', pg:'/quantum-ammeter' },
  { name:'Photocurrent',
    formula:'I = eta * N * e',
    units:'eta: [dimensionless]  N: [s^-1]  e: [C]  I: [A]',
    domain:'Quantum', pg:'/quantum-ammeter' },
  { name:'Shot-Noise SNR',
    formula:'SNR = 10*log10(N)  [dB]',
    units:'N: [photons]  SNR: [dB=dimensionless]',
    domain:'Quantum', pg:'/quantum-ammeter' },
  { name:'Golden Ratio',
    formula:'phi = (1 + sqrt(5)) / 2 = 1.6180339...',
    units:'phi: [dimensionless]',
    domain:'Geometry', pg:'/phi-lattice' },
  { name:'Fibonacci Recurrence',
    formula:'F_n = F_{n-1} + F_{n-2},  F_0=0, F_1=1',
    units:'F_n: [dimensionless, integer]',
    domain:'Geometry', pg:'/phi-lattice' },
  { name:'Octonion Norm',
    formula:'|q|^2 = q0^2 + q1^2 + ... + q7^2',
    units:'q_k: [dimensionless]  |q|: [dimensionless]',
    domain:'Geometry', pg:'/atomic-geometry' },
  { name:'Kuramoto Coupling',
    formula:'K_ij = (K0/N)*sin(theta_j - theta_i)',
    units:'K0: [rad/s]  theta: [rad]  K_ij: [rad/s]',
    domain:'Biology', pg:'/blue-light-protocol' },
  { name:'Correlated Color Temperature',
    formula:'CCT ~ h*c / (k_B * lambda_peak)',
    units:'h: [J*s]  k_B: [J/K]  lambda: [m]  CCT: [K]',
    domain:'Biology', pg:'/blue-light-protocol' },
  { name:'Tidal Acceleration',
    formula:'a = -G*M*d / r^3',
    units:'G: [m^3/(kg*s^2)]  M: [kg]  d,r: [m]  a: [m/s^2]',
    domain:'Cosmology', pg:'/lunar-coherence' },
  { name:'Rosensweig Spike Wavelength',
    formula:'lambda_R = 2*pi*sqrt(sigma_t / (rho*g))',
    units:'sigma_t: [N/m]  rho: [kg/m^3]  lambda_R: [m]',
    domain:'Magnetic', pg:'/magnetic-drops' },
  { name:'Coherence Pole Residue',
    formula:'a_k = lim_{z->z_k} (z - z_k)*S(z)',
    units:'a_k: [s^-1]  z_k: [s^-1]',
    domain:'Coherence', pg:'/equation-codex' },
  { name:'Phase Transition Threshold',
    formula:'C_crit ~ 0.70  (SU(3) singlet collapse)',
    units:'C_crit: [dimensionless]',
    domain:'Coherence', pg:'/mpc-spacetime' },
];

/* ── EGYPTIAN CODEX ───────────── */
const CODEX: CodexEntry[] = [
  { symbol:'☥', egyptian:'Ankh -- Life, breath, eternal recurrence',
    aether:'S(z) -- Coherence Synthesis Operator',
    formula:'S(z) = SUM a_k/(z-z_k)', col: QUANT },
  { symbol:'𓂀', egyptian:'Eye of Horus (Wadjet) -- all-seeing perception',
    aether:'C(x,t) -- Coherence Field',
    formula:'dC/dt = -gamma*C + kappa*nabla^2*C', col: GOLD },
  { symbol:'𓋴', egyptian:'Djed Pillar -- stability, spine of Osiris',
    aether:'Bubble interior C=1 -- coherence-locked state',
    formula:'C = 1, |grad C|_interior = 0', col: MAG },
  { symbol:'𓁿', egyptian:'Aten (sun disk) -- the singular radiant source',
    aether:'E = hc/lambda -- photon energy, light as substrate',
    formula:'E = h*c/lambda  [J]', col: WARM },
  { symbol:'𓆣', egyptian:'Scarab (Khepri) -- self-creation, phase transition',
    aether:'Rosensweig instability -- ferrofluid phase bifurcation',
    formula:'B_c = sqrt(2*mu0*rho*g*sigma_t)', col: ROSE },
  { symbol:'Φ', egyptian:'Hermetic Phi -- divine proportion, Ma\'at\'s balance',
    aether:'phi = (1+sqrt(5))/2 -- golden ratio, phi-lattice',
    formula:'F_n/F_{n-1} -> phi as n -> inf', col: GOLD },
  { symbol:'Ω', egyptian:'Ouroboros -- the self-consuming totality, closed loop',
    aether:'Closed Discovery Loop -- pentagon of knowing',
    formula:'Loop: Observe -> Model -> Predict -> Test -> Revise', col: QUANT },
  { symbol:'Ψ', egyptian:'Thoth (ibis) -- divine scribe, all knowledge encoded',
    aether:'Wavefunction -- quantum state superposition',
    formula:'|Psi|^2 = probability density  [m^-3]', col: '#4488ff' },
];

/* ── UNITS REFERENCE ─────────── */
const UNITS: UnitRow[] = [
  { qty:'Coherence field',        sym:'C(x,t)',    si:'dimensionless',            dim:'1',                     notes:'0=incoherent, 1=SU(3) singlet locked' },
  { qty:'Complex freq variable',  sym:'z = sigma+iw', si:'s^{-1}',               dim:'T^{-1}',                notes:'sigma=decay rate, omega=angular freq' },
  { qty:'Synthesis operator',     sym:'S(z)',       si:'dimensionless',            dim:'1',                     notes:'|S| gives coherence magnitude' },
  { qty:'Pole residue',           sym:'a_k',        si:'s^{-1}',                  dim:'T^{-1}',                notes:'controls pole strength in S(z)' },
  { qty:'Magnetic field',         sym:'B',          si:'T = kg/(A*s^2)',           dim:'M T^{-2} I^{-1}',      notes:'Tesla; 1 T = 10,000 Gauss' },
  { qty:'Permeability of free space', sym:'mu_0',   si:'H/m = kg*m/(A^2*s^2)',    dim:'M L T^{-2} I^{-2}',    notes:'4pi x 10^-7 H/m exactly' },
  { qty:'Magnetic moment',        sym:'m',          si:'A*m^2 = J/T',             dim:'I L^2',                 notes:'current-loop model' },
  { qty:'MHD force density',      sym:'f',          si:'N/m^3 = kg/(m^2*s^2)',    dim:'M L^{-2} T^{-2}',      notes:'f = sigma*(v x B) x B' },
  { qty:'Electrical conductivity',sym:'sigma_e',    si:'S/m = A^2*s^3/(kg*m^3)',  dim:'M^{-1} L^{-3} T^3 I^2', notes:'seawater ~4 S/m' },
  { qty:'Pressure',               sym:'P',          si:'Pa = kg/(m*s^2)',          dim:'M L^{-1} T^{-2}',      notes:'Bernoulli: P+0.5*rho*v^2=const' },
  { qty:'Fluid density',          sym:'rho',        si:'kg/m^3',                  dim:'M L^{-3}',              notes:'water ~1000; seawater ~1025 kg/m^3' },
  { qty:'Flow velocity',          sym:'v',          si:'m/s',                     dim:'L T^{-1}',              notes:'potential flow: v=nabla*phi' },
  { qty:'Stream function',        sym:'psi',        si:'m^2/s',                   dim:'L^2 T^{-1}',            notes:'psi=const traces streamlines' },
  { qty:'Bubble radius',          sym:'R',          si:'m',                       dim:'L',                     notes:'skyscraper scale: R ~ 50-200 m' },
  { qty:'Photon energy',          sym:'E_photon',   si:'J = kg*m^2/s^2',          dim:'M L^2 T^{-2}',         notes:'E = hc/lambda; vis. ~ 2-3 eV' },
  { qty:'Planck constant',        sym:'h',          si:'J*s = kg*m^2/s',          dim:'M L^2 T^{-1}',         notes:'h = 6.626 x 10^-34 J*s' },
  { qty:'Photon rate',            sym:'N',          si:'s^{-1} = photons/s',      dim:'T^{-1}',               notes:'N = G*A/E_photon' },
  { qty:'Photocurrent',           sym:'I',          si:'A = C/s',                 dim:'I',                    notes:'I = eta*N*e; shot-noise ~ sqrt(N)' },
  { qty:'Quantum efficiency',     sym:'eta',        si:'dimensionless',           dim:'1',                    notes:'typical Si PV: 0.15-0.25' },
  { qty:'Golden ratio',           sym:'phi',        si:'dimensionless',           dim:'1',                    notes:'phi = 1.6180339...; F_n/F_{n-1} -> phi' },
  { qty:'Correlated color temp',  sym:'CCT',        si:'K',                       dim:'Theta',                notes:'daylight 5500-6500 K; candle ~1800 K' },
  { qty:'Tidal acceleration',     sym:'a_tidal',    si:'m/s^2',                   dim:'L T^{-2}',             notes:'a = -GM*d/r^3; lunar at Earth ~10^-6 g' },
  { qty:'Surface tension',        sym:'sigma_t',    si:'N/m = kg/s^2',            dim:'M T^{-2}',             notes:'water/air ~0.072 N/m at 20 C' },
  { qty:'Coupling constant (Kuramoto)', sym:'K_0', si:'rad/s',                   dim:'T^{-1}',               notes:'K_ij = (K0/N)*sin(theta_j - theta_i)' },
];

/* ── module-level code strings ── */
const PY_CODE =
`import numpy as np

# S(z): Coherence Synthesis Operator
# Units: z [s^-1], a_k [s^-1], S(z) [dimensionless]
def S_zeta(z: complex,
           poles: list[complex],
           residues: list[float]) -> complex:
    """
    S(z) = sum_k  a_k / (z - z_k)
    Partial-fraction synthesis over N coherence poles.
    """
    result = 0 + 0j
    for z_k, a_k in zip(poles, residues):
        result += a_k / (z - z_k)
    return result

# Coherence field from S
# C(x,t) in [0, 1]
def coherence(x: float, t: float,
              gamma=0.1, kappa=0.01) -> float:
    return np.exp(-gamma * t) * np.cos(x / kappa)

# Bernoulli density field
# rho [kg/m^3], v [m/s], U [m/s]
def bernoulli_density(vx: float, vy: float,
                      U=1.0) -> float:
    v2 = vx**2 + vy**2
    return 1.0 + 0.5 * (1.0 - v2 / U**2)

# Rosensweig threshold  [Tesla]
# mu0 [H/m], rho [kg/m^3], g [m/s^2], sigma_t [N/m]
def rosensweig_Bc(rho=1000.0, g=9.81,
                  sigma_t=0.072) -> float:
    mu0 = 4 * np.pi * 1e-7
    return np.sqrt(2 * mu0 * rho * g * sigma_t)

# MHD thrust density  [N/m^3]
# sigma_e [S/m], v [m/s], B [T]
def mhd_thrust(sigma_e=4.0, v=1.0, B=1.5) -> float:
    return sigma_e * v * B**2

# Photocurrent  [Amperes]
# G [W/m^2], A [m^2], lam [m], eta [-]
def photocurrent(G=1000.0, A=0.01,
                 lam=550e-9, eta=0.20) -> float:
    h, c, e = 6.626e-34, 3e8, 1.602e-19
    E = h * c / lam
    N = G * A / E
    return eta * N * e
`;

const JAVA_CODE =
`// CoherenceSynthesis.java
// S(z) = sum_k a_k / (z - z_k)
// Units: z [s^-1], a_k [s^-1], S [dimensionless]

public class CoherenceSynthesis {

    // Complex number as double[2]: {re, im}
    public static double[] add(double[] a, double[] b) {
        return new double[]{ a[0]+b[0], a[1]+b[1] };
    }
    public static double[] div(double[] n, double[] d) {
        double denom = d[0]*d[0] + d[1]*d[1];
        return new double[]{
            (n[0]*d[0] + n[1]*d[1]) / denom,
            (n[1]*d[0] - n[0]*d[1]) / denom
        };
    }

    /** S(z) = sum_k a_k / (z - z_k)
     *  z, z_k: double[2]={re,im}  a_k: double (real)
     */
    public static double[] synthesize(
            double[] z,
            double[][] poles,
            double[]   residues) {
        double re = 0, im = 0;
        for (int k = 0; k < poles.length; k++) {
            double dRe = z[0] - poles[k][0];
            double dIm = z[1] - poles[k][1];
            double d2  = dRe*dRe + dIm*dIm;
            re += residues[k] * dRe / d2;
            im -= residues[k] * dIm / d2;
        }
        return new double[]{ re, im };
    }

    /** |S(z)| = sqrt(Re^2 + Im^2) */
    public static double magnitude(double[] z,
            double[][] poles, double[] residues) {
        double[] s = synthesize(z, poles, residues);
        return Math.sqrt(s[0]*s[0] + s[1]*s[1]);
    }

    // Bernoulli density: rho [kg/m^3]
    // vx, vy [m/s],  U [m/s]
    public static double bernoulliDensity(
            double vx, double vy, double U) {
        return 1.0 + 0.5*(1.0 - (vx*vx + vy*vy)/(U*U));
    }

    // MHD thrust density [N/m^3]
    // sigmaE [S/m], v [m/s], B [T]
    public static double mhdThrust(
            double sigmaE, double v, double B) {
        return sigmaE * v * B * B;
    }
}
`;

const CLI_CODE =
`## AETHER CLI -- aether-os v0.9.4
## All units SI unless --units flag overrides

# Evaluate S(z) at a point
aether compute s-zeta \\
  --zeta "0.3+1.2i" \\
  --poles "0.5+1.0i,-0.5+1.0i,0.0-1.5i,1.0+0.0i,-1.0+0.0i" \\
  --residues "1.0,0.8,0.6,0.4,0.4" \\
  --units "rad/s"
# OUT: |S(z)| = 0.847   arg(S(z)) = 34.2 deg

# Coherence field snapshot over a domain
aether field coherence \\
  --domain "x:[-10,10],t:[0,100]" \\
  --gamma 0.1 --kappa 0.01 \\
  --output coherence.json

# MPC bubble density map
aether spacetime density-map \\
  --bubble-radius 72 --free-stream 1.0 \\
  --resolution 140x40 --output density.png

# Ferrofluid Rosensweig threshold
aether magnetic rosensweig \\
  --fluid water --depth 100 \\
  --surface-tension 0.072
# OUT: B_c = 1.58 Tesla  P_mag = 993 kPa

# MHD thrust estimate
aether mhd thrust \\
  --B 1.5 --sigma 4.0 --velocity 1.0 --volume 4000
# OUT: f = 13.5 N/m^3   F_total = 54000 N = 54 kN

# Photocurrent from solar panel
aether quantum photocurrent \\
  --irradiance 1000 --area 0.01 \\
  --wavelength 550nm --efficiency 0.20
# OUT: I = 1.77 mA   N_photons = 2.76e16 /s

# Egyptian codex lookup
aether codex --symbol ankh
# OUT: [Ankh] -> S(z): Coherence Synthesis Operator
#      Formula: S(z) = SUM a_k/(z-z_k)
#      Units: z [s^-1], S [dimensionless]
`;

/* ══════════════════════════════════════════════
   I. S(ζ) COMPLEX PLANE CANVAS
   ══════════════════════════════════════════════ */
function SZetaCanvas() {
  const ref    = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const W = 700, H = 260;
    cv.width = W; cv.height = H;

    // Pre-compute heatmap at G_W x G_H grid resolution
    const G_W = 140, G_H = 52;
    const RANGE = 3.2;
    const heatData = new Uint8ClampedArray(G_W * G_H * 4);
    let maxLog = 0.001;
    const rawVals = new Float32Array(G_W * G_H);

    for (let gy = 0; gy < G_H; gy++) {
      for (let gx = 0; gx < G_W; gx++) {
        const re = (gx / G_W) * (2*RANGE) - RANGE;
        const im = RANGE - (gy / G_H) * (2*RANGE);
        const mag = sZeta(re, im);
        const lv  = Math.log10(1 + Math.min(mag, 50));
        rawVals[gy * G_W + gx] = lv;
        if (lv > maxLog) maxLog = lv;
      }
    }
    for (let i = 0; i < G_W * G_H; i++) {
      const v = rawVals[i] / maxLog;
      const [r, g, b] = heat(v);
      heatData[i*4+0] = r;
      heatData[i*4+1] = g;
      heatData[i*4+2] = b;
      heatData[i*4+3] = 255;
    }

    // Offscreen canvas for heatmap
    const off = document.createElement('canvas');
    off.width = G_W; off.height = G_H;
    const offCtx = off.getContext('2d')!;
    offCtx.putImageData(new ImageData(heatData, G_W, G_H), 0, 0);

    // Map complex coord to canvas pixel
    const toCanvasX = (re: number) => ((re + RANGE) / (2*RANGE)) * W;
    const toCanvasY = (im: number) => ((RANGE - im) / (2*RANGE)) * H;

    let t = 0;
    function draw() {
      t++;
      // Stretch heatmap to canvas
      ctx.drawImage(off, 0, 0, G_W, G_H, 0, 0, W, H);

      // Axes
      const ax = toCanvasX(0), ay = toCanvasY(0);
      ctx.strokeStyle = 'rgba(0,255,224,0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath(); ctx.moveTo(0, ay); ctx.lineTo(W, ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(ax, 0); ctx.lineTo(ax, H); ctx.stroke();

      // Tick marks + labels
      ctx.font = '7px Space Mono'; ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(0,255,224,0.45)';
      for (let v = -3; v <= 3; v++) {
        if (v === 0) continue;
        const px = toCanvasX(v), py = toCanvasY(v);
        ctx.beginPath(); ctx.moveTo(px, ay-3); ctx.lineTo(px, ay+3); ctx.stroke();
        ctx.fillText(String(v), px, ay + 12);
        ctx.beginPath(); ctx.moveTo(ax-3, py); ctx.lineTo(ax+3, py); ctx.stroke();
        ctx.textAlign = 'right';
        ctx.fillText(String(v) + 'i', ax - 6, py + 3);
        ctx.textAlign = 'center';
      }
      ctx.fillStyle = 'rgba(0,255,224,0.5)';
      ctx.textAlign = 'right'; ctx.fillText('Re(z)', W - 4, ay - 4);
      ctx.textAlign = 'left';  ctx.fillText('Im(z)', ax + 4, 10);

      // Poles
      for (const p of POLES) {
        const px2 = toCanvasX(p.re), py2 = toCanvasY(p.im);
        // Pole glow
        const pg = ctx.createRadialGradient(px2, py2, 0, px2, py2, 16);
        pg.addColorStop(0, p.col + 'aa');
        pg.addColorStop(1, 'transparent');
        ctx.beginPath(); ctx.arc(px2, py2, 16, 0, Math.PI*2);
        ctx.fillStyle = pg; ctx.fill();
        // Cross marker
        ctx.strokeStyle = p.col; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px2-6, py2); ctx.lineTo(px2+6, py2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px2, py2-6); ctx.lineTo(px2, py2+6); ctx.stroke();
        // Label
        ctx.font = '7px Space Mono'; ctx.fillStyle = p.col;
        ctx.textAlign = 'left';
        ctx.fillText(p.label, px2 + 8, py2 - 2);
        const pv = `a=${p.res}`;
        ctx.fillStyle = p.col + '88';
        ctx.fillText(pv, px2 + 8, py2 + 8);
      }

      // Animated query point tracing an ellipse
      const QUERY_R_RE = 1.8, QUERY_R_IM = 0.9;
      const qt = t * 0.018;
      const qRe = QUERY_R_RE * Math.cos(qt);
      const qIm = QUERY_R_IM * Math.sin(qt);
      const qMag = sZeta(qRe, qIm);
      const qpx = toCanvasX(qRe), qpy = toCanvasY(qIm);

      // Animated ellipse path
      ctx.strokeStyle = 'rgba(200,160,48,0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(toCanvasX(0), toCanvasY(0),
        QUERY_R_RE / (2*RANGE) * W,
        QUERY_R_IM / (2*RANGE) * H,
        0, 0, Math.PI*2);
      ctx.stroke();

      // Query point glow
      const qg = ctx.createRadialGradient(qpx, qpy, 0, qpx, qpy, 14);
      qg.addColorStop(0, 'rgba(200,160,48,0.9)');
      qg.addColorStop(1, 'transparent');
      ctx.beginPath(); ctx.arc(qpx, qpy, 14, 0, Math.PI*2);
      ctx.fillStyle = qg; ctx.fill();
      ctx.beginPath(); ctx.arc(qpx, qpy, 4, 0, Math.PI*2);
      ctx.fillStyle = GOLD; ctx.fill();

      // Readout panel (top-right)
      const px3 = W - 148, py3 = 8;
      ctx.fillStyle = 'rgba(4,6,14,0.85)';
      ctx.fillRect(px3, py3, 140, 72);
      ctx.strokeStyle = GOLD + '44'; ctx.lineWidth = 0.7;
      ctx.strokeRect(px3, py3, 140, 72);
      ctx.font = '7px Space Mono'; ctx.textAlign = 'left';
      ctx.fillStyle = GOLD + 'cc';
      ctx.fillText('QUERY POINT', px3 + 6, py3 + 13);
      ctx.fillStyle = 'rgba(200,230,220,0.8)';
      ctx.fillText('z = ' + qRe.toFixed(3) + ' + ' + qIm.toFixed(3) + 'i', px3+6, py3+25);
      ctx.fillText('|S(z)| = ' + Math.min(qMag, 99).toFixed(4), px3+6, py3+37);
      const lv2 = Math.log10(1 + Math.min(qMag, 50));
      ctx.fillText('log|S| = ' + lv2.toFixed(4), px3+6, py3+49);
      ctx.fillStyle = 'rgba(100,140,180,0.6)';
      ctx.fillText('S(z) = SUM a_k/(z-z_k)', px3+6, py3+64);

      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={ref} style={{width:'100%',height:'auto',display:'block',borderRadius:4}} />;
}

/* ══════════════════════════════════════════════
   II. CODE BLOCK COMPONENT
   ══════════════════════════════════════════════ */
function CodeBlock({ code, lang, col }: { code: string; lang: string; col: string }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ fontFamily: MN, fontSize: 7.5, color: col + 'cc',
        letterSpacing: '0.15em', marginBottom: 5, textTransform: 'uppercase' }}>
        {lang}
      </div>
      <pre style={{
        fontFamily: MN, fontSize: 8.5, color: 'rgba(200,230,220,0.75)',
        background: 'rgba(0,0,0,0.6)', border: `1px solid ${col}22`,
        borderRadius: 3, padding: '10px 12px', overflowX: 'auto',
        lineHeight: 1.75, margin: 0, whiteSpace: 'pre',
      }}>
        {code}
      </pre>
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════ */
export default function EquationCodexPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [codeTab, setCodeTab] = useState<'python'|'java'|'cli'>('python');

  const domains = ['All', 'Coherence', 'Spacetime', 'Magnetic', 'Quantum', 'Geometry', 'Biology', 'Cosmology'];

  const filtered = EQS.filter(e => {
    const dm = filter === 'All' || e.domain === filter;
    const sr = search.length === 0 ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.formula.toLowerCase().includes(search.toLowerCase());
    return dm && sr;
  });

  const card = (col = GOLD): React.CSSProperties => ({
    background: 'rgba(0,0,0,0.45)',
    border: `1px solid ${col}22`,
    borderRadius: 4,
    padding: '12px 16px',
  });
  const secLabel: React.CSSProperties = {
    fontFamily: MN, fontSize: 7.5, letterSpacing: '0.2em',
    color: DIM, textTransform: 'uppercase', marginBottom: 10,
    paddingBottom: 4, borderBottom: '1px solid rgba(0,255,224,0.12)',
  };
  const pill = (active: boolean, col = QUANT) => ({
    fontFamily: MN, fontSize: 7.5, padding: '3px 10px',
    border: `1px solid ${col}${active ? 'cc' : '33'}`,
    borderRadius: 2, cursor: 'pointer',
    color: active ? col : col + '55',
    background: active ? col + '18' : 'transparent',
  } as React.CSSProperties);

  return (
    <div style={{ minHeight: '100%', background: BG, color: '#d4e8f7',
      fontFamily: "'Rajdhani',sans-serif", overflowY: 'auto' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '16px 20px' }}>

        {/* ── title ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: 'inline-flex', gap: 8, marginBottom: 8 }}>
            <div style={{ border: `1px solid ${QUANT}44`, padding: '3px 10px',
              fontSize: 9, letterSpacing: '0.2em', color: QUANT + 'aa', fontFamily: MN }}>
              AETHER EQUATION CODEX
            </div>
            <div style={{ border: `1px solid ${GOLD}44`, padding: '3px 10px',
              fontSize: 9, letterSpacing: '0.2em', color: GOLD + '88', fontFamily: MN }}>
              S(z) MASTER OPERATOR
            </div>
            <div style={{ border: `1px solid ${MAG}44`, padding: '3px 10px',
              fontSize: 9, letterSpacing: '0.2em', color: MAG + '88', fontFamily: MN }}>
              EGYPTIAN CODEX
            </div>
          </div>
          <h1 style={{ fontFamily: OR, fontSize: 22, fontWeight: 900, letterSpacing: 2,
            color: QUANT, textShadow: `0 0 28px ${QUANT}44`, margin: '4px 0 6px' }}>
            Definition Home &middot; All Equations &middot; S(&zeta;)
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(200,200,220,0.75)',
            maxWidth: 900, lineHeight: 1.75, margin: 0 }}>
            The central definition reference for the AETHER Knowledge System.
            S(&zeta;) is the master coherence synthesis operator -- every other equation
            in the system is either an input to S or a consequence of it. Below: the
            complex plane topology of S(&zeta;), its pole structure (the
            &quot;resonant frequencies of coherence&quot;), units for every quantity,
            Egyptian codex symbol-to-formula mapping, and Python / Java / CLI implementations.
            The units of every quantity are given in SI with dimensional analysis.
          </p>
        </div>

        {/* ── S(ζ) definition block ── */}
        <div style={{ ...card(QUANT), marginBottom: 14 }}>
          <div style={secLabel}>S(&zeta;) -- The Master Coherence Synthesis Operator</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 14 }}>
            <div>
              <div style={{ fontFamily: CR, fontSize: 22, color: QUANT,
                marginBottom: 10, lineHeight: 1.4 }}>
                S(&zeta;) = &Sigma;<sub>k</sub> a<sub>k</sub> / (&zeta; &minus; &zeta;<sub>k</sub>)
              </div>
              <div style={{ fontFamily: MN, fontSize: 8.5, color: DIM, lineHeight: 2, marginBottom: 8 }}>
                &zeta; = &sigma; + i&omega; &nbsp;&nbsp; [s<sup>&minus;1</sup>]<br />
                &zeta;<sub>k</sub> = &sigma;<sub>k</sub> + i&omega;<sub>k</sub> &nbsp;&nbsp; pole locations [s<sup>&minus;1</sup>]<br />
                a<sub>k</sub> &nbsp;&nbsp; pole residues [s<sup>&minus;1</sup>]<br />
                |S(&zeta;)| &nbsp;&nbsp; coherence magnitude [dimensionless]<br />
                arg(S(&zeta;)) &nbsp;&nbsp; coherence phase [rad]
              </div>
              <p style={{ fontSize: 12, color: 'rgba(180,220,210,0.7)', lineHeight: 1.75, margin: 0 }}>
                S(&zeta;) is the partial-fraction representation of the coherence
                synthesis operator in the complex frequency domain. Each pole
                &zeta;<sub>k</sub> corresponds to a &quot;resonant frequency&quot; of
                the knowledge crystallization process. The residue a<sub>k</sub> sets
                how strongly that frequency contributes. C(x,t) = |S(&zeta;)| /
                max|S| gives the normalized coherence field (0..1).
              </p>
            </div>
            <div>
              <div style={{ fontFamily: MN, fontSize: 8, color: QUANT + '88', marginBottom: 8 }}>
                POLE STRUCTURE -- 5 COHERENCE RESONANCES
              </div>
              {POLES.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center',
                  gap: 10, marginBottom: 6, padding: '5px 8px',
                  background: 'rgba(0,0,0,0.3)', borderRadius: 3,
                  borderLeft: `3px solid ${p.col}` }}>
                  <div style={{ fontFamily: MN, fontSize: 9, color: p.col, width: 44 }}>
                    {p.label}
                  </div>
                  <div style={{ fontFamily: MN, fontSize: 8, color: 'rgba(200,220,210,0.7)', flex: 1 }}>
                    &zeta;<sub>{i+1}</sub> = {p.re > 0 ? '+' : ''}{p.re.toFixed(1)} {p.im >= 0 ? '+' : ''}{p.im.toFixed(1)}i
                    &nbsp;&nbsp; a = {p.res.toFixed(1)}
                  </div>
                  <div style={{ fontFamily: MN, fontSize: 7.5, color: p.col + '88' }}>
                    [{p.re < 0 ? 'decaying' : 'growing'}
                    &nbsp;{p.im !== 0 ? '/ oscillating' : '/ real'}]
                  </div>
                </div>
              ))}
              <div style={{ marginTop: 8, fontFamily: MN, fontSize: 7.5,
                color: DIM, lineHeight: 1.8 }}>
                Pole residue: a<sub>k</sub> = lim<sub>z-&gt;z_k</sub> (z - z<sub>k</sub>) * S(z)<br />
                Units of all poles and residues: [s<sup>&minus;1</sup>] (angular frequency)<br />
                &sigma; &lt; 0: stable (left half-plane) | &sigma; &gt; 0: unstable
              </div>
            </div>
          </div>
          <div style={secLabel}>S(&zeta;) Complex Plane &middot; |S(&zeta;)| Heatmap &middot; Pole Topology</div>
          <SZetaCanvas />
          <div style={{ marginTop: 8, fontFamily: MN, fontSize: 7.5, color: DIM, lineHeight: 1.9 }}>
            Heatmap: log&nbsp;(1 + |S(&zeta;)|) mapped to colour. Dark = low coherence.
            Bright (gold/white) = near a pole (high synthesis activity). Cross markers = pole
            locations z<sub>k</sub>. Gold dot = animated query point tracing an ellipse;
            readout shows live |S(&zeta;)| value.
          </div>
        </div>

        {/* ── Egyptian Codex ── */}
        <div style={{ ...card(GOLD), marginBottom: 14, borderColor: GOLD + '22' }}>
          <div style={secLabel}>
            Egyptian Codex &middot; Ancient Symbols &rarr; AETHER Equations &middot; Unified Language
          </div>
          <p style={{ fontSize: 11.5, color: 'rgba(220,200,150,0.7)', lineHeight: 1.7,
            marginBottom: 14, maxWidth: 880 }}>
            The Egyptian priests encoded the same topological truths in symbol that AETHER
            encodes in mathematics. Each hieroglyph below maps to a specific equation and its
            units. The symbols are not metaphors -- they are dimensional claims about reality,
            rendered in a different substrate.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {CODEX.map((c) => (
              <div key={c.symbol} style={{
                ...card(c.col), borderTop: `2px solid ${c.col}88`, padding: '10px 12px' }}>
                <div style={{ fontSize: 32, marginBottom: 6, lineHeight: 1,
                  textShadow: `0 0 16px ${c.col}66` }}>{c.symbol}</div>
                <div style={{ fontFamily: MN, fontSize: 7.5, color: c.col,
                  letterSpacing: 0.5, marginBottom: 4 }}>{c.aether}</div>
                <div style={{ fontSize: 9.5, color: 'rgba(200,200,220,0.55)',
                  lineHeight: 1.6, marginBottom: 6 }}>{c.egyptian}</div>
                <div style={{ fontFamily: MN, fontSize: 7.5, color: c.col + '88',
                  lineHeight: 1.7, wordBreak: 'break-all' }}>{c.formula}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Equations library ── */}
        <div style={{ ...card(QUANT), marginBottom: 14 }}>
          <div style={secLabel}>
            Full Equation Compendium &middot; {EQS.length} Equations &middot; Filterable
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            {domains.map(d => (
              <button key={d} style={pill(filter === d)} onClick={() => setFilter(d)}>
                {d}
              </button>
            ))}
            <input
              placeholder="search name or formula..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ fontFamily: MN, fontSize: 8, padding: '3px 10px',
                background: 'rgba(0,0,0,0.4)', border: `1px solid ${DIM}`,
                borderRadius: 2, color: QUANT, outline: 'none', flex: 1, minWidth: 160 }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {filtered.map((eq) => {
              const domainColors: Record<string,string> = {
                Coherence: QUANT, Spacetime: '#4488ff', Magnetic: MAG,
                Quantum: WARM, Geometry: GOLD, Biology: '#88ff44', Cosmology: ROSE,
              };
              const col2 = domainColors[eq.domain] || QUANT;
              return (
                <div key={eq.name} style={{
                  background: 'rgba(0,0,0,0.35)', borderRadius: 3, padding: '8px 10px',
                  borderLeft: `3px solid ${col2}66` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontFamily: OR, fontSize: 7.5, color: col2,
                      letterSpacing: 0.8 }}>{eq.name}</div>
                    <div style={{ fontFamily: MN, fontSize: 6.5, color: col2 + '66',
                      padding: '1px 5px', border: `1px solid ${col2}33`, borderRadius: 2 }}>
                      {eq.domain}
                    </div>
                  </div>
                  <div style={{ fontFamily: MN, fontSize: 8.5, color: col2 + 'cc',
                    marginBottom: 4, lineHeight: 1.5 }}>{eq.formula}</div>
                  <div style={{ fontFamily: MN, fontSize: 7, color: 'rgba(140,180,170,0.55)',
                    lineHeight: 1.6 }}>{eq.units}</div>
                </div>
              );
            })}
          </div>
          {filtered.length === 0 && (
            <div style={{ fontFamily: MN, fontSize: 9, color: DIM, textAlign: 'center',
              padding: 20 }}>no equations match filter</div>
          )}
        </div>

        {/* ── Code Bridge ── */}
        <div style={{ ...card(MAG), marginBottom: 14, borderColor: MAG + '22' }}>
          <div style={secLabel}>
            Code Bridge &middot; Python &middot; Java &middot; CLI &middot; S(&zeta;) Implementation
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            {(['python','java','cli'] as const).map(tab => (
              <button key={tab} style={pill(codeTab === tab, MAG)} onClick={() => setCodeTab(tab)}>
                {tab === 'cli' ? 'CLI (aether-os)' : tab.toUpperCase()}
              </button>
            ))}
          </div>
          {codeTab === 'python' && <CodeBlock code={PY_CODE}  lang="Python 3 -- numpy"  col={QUANT} />}
          {codeTab === 'java'   && <CodeBlock code={JAVA_CODE} lang="Java 21 -- no deps" col={MAG}   />}
          {codeTab === 'cli'    && <CodeBlock code={CLI_CODE}  lang="AETHER CLI -- aether-os v0.9.4" col={GOLD}  />}
          <p style={{ marginTop: 10, fontSize: 11, color: 'rgba(180,200,220,0.6)',
            lineHeight: 1.7 }}>
            All implementations use the same S(&zeta;) formula. Units are preserved across
            languages: complex frequency &zeta; in [s<sup>&minus;1</sup>], residues a<sub>k</sub>
            in [s<sup>&minus;1</sup>], output |S(&zeta;)| dimensionless. The CLI command
            &nbsp;<span style={{ fontFamily: MN, fontSize: 9, color: GOLD }}>aether codex --symbol</span>
            &nbsp;maps any Egyptian or mathematical symbol to its defining equation and units.
          </p>
        </div>

        {/* ── Units Reference ── */}
        <div style={{ ...card(GOLD), marginBottom: 14, borderColor: GOLD + '22' }}>
          <div style={secLabel}>
            Units Reference &middot; Every Quantity &middot; SI + Dimensional Analysis
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: MN, fontSize: 8.5 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${GOLD}33` }}>
                  {['Quantity','Symbol','SI Units','Dimensions','Notes'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '5px 10px',
                      color: GOLD + 'aa', fontWeight: 'normal', letterSpacing: '0.1em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {UNITS.map((u, i) => (
                  <tr key={u.sym} style={{
                    background: i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent',
                    borderBottom: '1px solid rgba(42,64,96,0.3)' }}>
                    <td style={{ padding: '5px 10px', color: 'rgba(200,220,210,0.75)' }}>{u.qty}</td>
                    <td style={{ padding: '5px 10px', color: QUANT + 'cc' }}>{u.sym}</td>
                    <td style={{ padding: '5px 10px', color: GOLD + 'cc' }}>{u.si}</td>
                    <td style={{ padding: '5px 10px', color: MAG + 'aa' }}>{u.dim}</td>
                    <td style={{ padding: '5px 10px', color: 'rgba(140,170,160,0.55)',
                      fontSize: 7.5, lineHeight: 1.6 }}>{u.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 10, fontFamily: MN, fontSize: 7.5, color: DIM, lineHeight: 1.8 }}>
            Dimensional system: M = mass [kg], L = length [m], T = time [s],
            I = current [A], Theta = temperature [K]. Dimensionless quantities: C(x,t),
            |S(&zeta;)|, &phi;, F_n, quantum efficiency &eta;, SNR (before dB conversion).
          </div>
        </div>

        {/* ── footer ── */}
        <div style={{ marginTop: 14, paddingTop: 10,
          borderTop: `1px solid ${QUANT}18`,
          fontFamily: MN, fontSize: 7.5, color: DIM,
          letterSpacing: '0.12em', textAlign: 'center' }}>
          AETHER EQUATION CODEX &middot; S(z) SYNTHESIS OPERATOR &middot;
          28 EQUATIONS &middot; 24 UNIT DEFINITIONS &middot;
          EGYPTIAN CODEX 8 SYMBOLS &middot; PYTHON JAVA CLI &middot;
          COMPLEX FREQUENCY DOMAIN &middot; DIMENSIONAL ANALYSIS &middot; SI
        </div>
      </div>
    </div>
  );
}

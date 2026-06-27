import React, { useRef, useEffect, useState, useMemo } from "react";

/* ── palette ─────────────────────────────────────────────────────────── */
const C = {
  bg:      "#04060E",
  panel:   "rgba(6,8,18,0.92)",
  sidebar: "rgba(8,10,22,0.95)",
  editor:  "rgba(5,7,15,0.98)",
  text:    "#B8C4D4",
  muted:   "#4A5568",
  white:   "#E8EFF8",
  border:  "#1C2D40",
  border2: "#2a4060",
  gold:    "#C8A030",
  amber:   "#E07820",
  cyan:    "#00FFB2",
  quant:   "#00ffe0",
  violet:  "#B090F0",
  rose:    "#F06090",
  green:   "#60C870",
  teal:    "#40D0C0",
  blue:    "#4090FF",
  red:     "#FF4455",
  dim:     "#2a4060",
};

/* ── token types ─────────────────────────────────────────────────────── */
type TokType = "kw"|"comment"|"str"|"num"|"fn"|"op"|"type"|"dec"|"lit"|"plain";
type Token = { t: TokType; s: string };

const KW = new Set(["def","class","import","from","return","if","elif","else","for","while","in","not","and","or","True","False","None","lambda","yield","pass","raise","try","except","with","as","global","assert","del","is"]);

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < line.length) {
    /* comment */
    if (line[i] === "#") {
      tokens.push({ t: "comment", s: line.slice(i) });
      break;
    }
    /* string */
    if (line[i] === '"' || line[i] === "'") {
      const q = line[i];
      let j = i + 1;
      const triple = line.slice(i, i + 3) === q + q + q;
      if (triple) { j = i + 3; while (j < line.length && line.slice(j, j+3) !== q+q+q) j++; j += 3; }
      else { while (j < line.length && line[j] !== q) j++; j++; }
      tokens.push({ t: "str", s: line.slice(i, j) });
      i = j; continue;
    }
    /* decorator */
    if (line[i] === "@") {
      let j = i + 1; while (j < line.length && /\w/.test(line[j])) j++;
      tokens.push({ t: "dec", s: line.slice(i, j) });
      i = j; continue;
    }
    /* number */
    if (/\d/.test(line[i]) || (line[i] === "." && /\d/.test(line[i+1] ?? ""))) {
      let j = i; while (j < line.length && /[\d._eExX+\-]/.test(line[j])) j++;
      tokens.push({ t: "num", s: line.slice(i, j) });
      i = j; continue;
    }
    /* word */
    if (/[a-zA-Z_]/.test(line[i])) {
      let j = i; while (j < line.length && /\w/.test(line[j])) j++;
      const w = line.slice(i, j);
      const isFn = line[j] === "(";
      const isType = /^[A-Z]/.test(w) && !KW.has(w);
      tokens.push({ t: KW.has(w) ? "kw" : isFn ? "fn" : isType ? "type" : "plain", s: w });
      i = j; continue;
    }
    /* operator */
    if (/[+\-*/%=<>!&|^~,.:;[\](){}]/.test(line[i])) {
      tokens.push({ t: "op", s: line[i] });
      i++; continue;
    }
    tokens.push({ t: "plain", s: line[i] });
    i++;
  }
  return tokens;
}

const TOK_CLR: Record<TokType, string> = {
  kw:      C.violet,
  comment: "#556070",
  str:     C.gold,
  num:     C.cyan,
  fn:      C.amber,
  op:      "#7080A0",
  type:    C.teal,
  dec:     C.rose,
  lit:     C.green,
  plain:   C.text,
};

/* ── file tree ───────────────────────────────────────────────────────── */
type FileNode = { name: string; id: string; icon: string };
type FolderNode = { name: string; icon: string; files: FileNode[] };

const FILE_TREE: FolderNode[] = [
  { name: "spacetime", icon: "🌀", files: [
    { name: "einstein_field.qg",        id: "einstein",    icon: "Ge" },
    { name: "schwarzschild_metric.qg",  id: "schwarzschild", icon: "rs" },
    { name: "gravitational_waves.qg",   id: "gravwaves",   icon: "h+" },
    { name: "geodesics.qg",             id: "geodesics",   icon: "ds" },
  ]},
  { name: "quantum", icon: "⚛", files: [
    { name: "wave_function.qg",         id: "wavefunction", icon: "psi"},
    { name: "path_integral.qg",         id: "pathintegral", icon: "S" },
    { name: "uncertainty.qg",           id: "uncertainty",  icon: "hb" },
    { name: "entanglement.qg",          id: "entangle",     icon: "EPR"},
  ]},
  { name: "unification", icon: "🔗", files: [
    { name: "loop_quantum_gravity.qg",  id: "lqg",         icon: "LQG"},
    { name: "string_theory.qg",         id: "strings",     icon: "ST" },
    { name: "holographic.qg",           id: "holographic", icon: "ADS"},
  ]},
  { name: "aether", icon: "✦", files: [
    { name: "coherence_bridge.qg",      id: "coherence",   icon: "Ac" },
    { name: "planck_substrate.qg",      id: "planck",      icon: "lP" },
  ]},
];

/* ── file contents ───────────────────────────────────────────────────── */
const FILE_CONTENTS: Record<string, string> = {

einstein: `# AETHER-COSMOS -- Einstein Field Equations
# G_mu_nu + Lambda*g_mu_nu = (8*pi*G/c^4) * T_mu_nu
# File: spacetime/einstein_field.qg

import aether.cosmos as cosmos
from aether.planck import G, c, hbar, pi

# Einstein tensor: G_mu_nu = R_mu_nu - 0.5*g_mu_nu*R
# R_mu_nu = Ricci curvature tensor (contraction of Riemann)
# R = Ricci scalar (trace of Ricci tensor)
# T_mu_nu = stress-energy-momentum tensor (matter content)

KAPPA = 8 * pi * G / c**4  # = 2.076e-43 N^-1  (coupling constant)
LAMBDA = 1.089e-52          # cosmological constant  [m^-2]

class MetricTensor:
    """4x4 symmetric tensor g_mu_nu (signature -,+,+,+)"""
    def __init__(self, coords="cartesian"):
        self.coords = coords
        self.g = self._minkowski()

    def _minkowski(self):
        # Flat spacetime: eta_mu_nu = diag(-1,1,1,1)
        return [[-1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]

    def christoffel(self, x):
        # Gamma^sigma_mu_nu = 0.5*g^sigma*rho*(d_mu g_nu_rho + d_nu g_mu_rho - d_rho g_mu_nu)
        return cosmos.christoffel_symbols(self.g, x)

def einstein_tensor(g, x):
    """G_mu_nu from metric. Satisfies Bianchi identity: nabla_nu G^mu_nu = 0"""
    R_munu = cosmos.ricci_tensor(g, x)
    R      = cosmos.ricci_scalar(R_munu, g)
    G_munu = [[R_munu[m][n] - 0.5*g[m][n]*R for n in range(4)] for m in range(4)]
    return G_munu

def field_equations(g, T_munu, Lambda=LAMBDA):
    """
    Core equation of General Relativity.
    Returns residual -- zero when spacetime geometry is self-consistent.
    Vacuum: T_munu = 0  =>  G_munu = 0  (Schwarzschild, Kerr solutions)
    """
    G_munu = einstein_tensor(g, cosmos.diff_coord(g))
    return [[G_munu[m][n] + Lambda*g[m][n] - KAPPA*T_munu[m][n]
             for n in range(4)] for m in range(4)]

# Weak-field limit: reduces to Newtonian gravity
# g_00 ~ -(1 + 2*Phi/c^2)  where  nabla^2 Phi = 4*pi*G*rho
`,

schwarzschild: `# AETHER-COSMOS -- Schwarzschild Metric
# Exact vacuum solution for spherical mass M (Birkhoff's theorem)
# File: spacetime/schwarzschild_metric.qg

from aether.planck import G, c, M_sun
import aether.geodesics as geo

def schwarzschild_radius(M):
    """r_s = 2GM/c^2  -- event horizon radius"""
    return 2 * G * M / c**2

def metric_components(r, theta, M):
    """
    ds^2 = -(1-r_s/r)*c^2*dt^2
         + (1-r_s/r)^-1 * dr^2
         + r^2*(dtheta^2 + sin^2(theta)*dphi^2)
    """
    rs = schwarzschild_radius(M)
    A  = 1 - rs / r        # lapse function
    g_tt  = -A * c**2      # time-time component (time dilation)
    g_rr  = 1.0 / A        # radial component   (spatial stretching)
    g_OO  = r**2           # angular component
    g_phph = r**2 * (cosmos.sin(theta))**2
    return g_tt, g_rr, g_OO, g_phph

class BlackHole:
    def __init__(self, mass_kg):
        self.M  = mass_kg
        self.rs = schwarzschild_radius(mass_kg)
        self.ISCO = 3 * self.rs          # innermost stable circular orbit
        self.photon_sphere = 1.5 * self.rs

    def time_dilation(self, r):
        """Gravitational redshift: clock at r ticks slower by factor sqrt(1-rs/r)"""
        if r <= self.rs: return 0.0      # inside horizon -- time stops
        return (1 - self.rs / r) ** 0.5

    def escape_velocity(self, r):
        """v_esc = c * sqrt(rs/r)  -- equals c at event horizon"""
        return c * (self.rs / r) ** 0.5

    def circular_orbit_v(self, r):
        """v_orb = c * sqrt(rs / (2*(r-rs)))  -- Keplerian analog"""
        return c * (self.rs / (2 * (r - self.rs))) ** 0.5

# Stellar-mass black hole: M ~ 10 solar masses
bh = BlackHole(mass_kg=10 * M_sun)

print(f"Schwarzschild radius: {bh.rs:.0f} m")          # ~ 29.5 km
print(f"ISCO:                 {bh.ISCO:.0f} m")         # ~ 88.5 km
print(f"Time dilation r=2rs:  {bh.time_dilation(2*bh.rs):.4f}")  # 0.7071
`,

gravwaves: `# AETHER-COSMOS -- Gravitational Waves
# Linearized GR: h_mu_nu = g_mu_nu - eta_mu_nu  (small perturbations)
# File: spacetime/gravitational_waves.qg

from aether.planck import G, c
import numpy as np

# Linearized field equation in Lorenz gauge:
# Box h_bar_mu_nu = -16*pi*G/c^4 * T_mu_nu
# h_bar_mu_nu = h_mu_nu - 0.5*eta_mu_nu * h  (trace-reversed)

class GravitationalWave:
    """
    TT-gauge (transverse-traceless) plane wave propagating in z-direction.
    Two polarization modes: h_+ and h_x
    """
    def __init__(self, h_plus, h_cross, freq_hz):
        self.hp    = h_plus    # plus polarization strain amplitude
        self.hx    = h_cross   # cross polarization strain amplitude
        self.f     = freq_hz
        self.omega = 2 * np.pi * freq_hz
        self.lam   = c / freq_hz

    def strain(self, t, z):
        """Strain tensor h_ij at (t, z)"""
        phase = self.omega * (t - z/c)
        h_plus  = self.hp * np.cos(phase)
        h_cross = self.hx * np.sin(phase)
        # Effect on ring of test particles (proper distance oscillates)
        # delta_L / L = 0.5 * h
        return h_plus, h_cross

    def luminosity(self):
        """Gravitational wave luminosity (Peters formula -- circular binary)"""
        # L_GW = 32/5 * G^4/c^5 * m1^2*m2^2*(m1+m2) / r^5
        return NotImplemented  # requires binary params

# GW150914 -- first LIGO detection (Sep 14, 2015)
GW150914 = GravitationalWave(
    h_plus  = 1.0e-21,   # strain ~ 10^-21  (1/1000 proton diameter at 4km)
    h_cross = 0.5e-21,
    freq_hz = 150.0      # chirp peak ~150 Hz
)

# Chirp mass (observable from inspiral phase)
# Mc = (m1*m2)^0.6 / (m1+m2)^0.2
# GW150914: Mc ~ 28.3 M_sun  =>  m1~36, m2~29 M_sun merging

def snr(h_strain, noise_psd, duration_s):
    """Signal-to-noise ratio for matched filter detection"""
    return (4 * np.trapz(h_strain**2 / noise_psd)) ** 0.5 * duration_s**0.5
`,

geodesics: `# AETHER-COSMOS -- Geodesics
# Shortest paths through curved spacetime: d^2x^mu/dtau^2 + Gamma^mu_nu_rho * dx^nu/dtau * dx^rho/dtau = 0
# File: spacetime/geodesics.qg

import aether.cosmos as cosmos
import numpy as np

class GeodesicIntegrator:
    """
    Integrate geodesic equation using RK4.
    4-velocity u^mu = dx^mu/dtau satisfies u^mu*u_mu = -c^2 (timelike)
    """
    def __init__(self, metric, x0, u0, dtau=1e-4):
        self.g    = metric
        self.x    = np.array(x0, dtype=float)  # initial 4-position
        self.u    = np.array(u0, dtype=float)  # initial 4-velocity
        self.dtau = dtau

    def step(self):
        """RK4 step in proper time tau"""
        x, u, dtau = self.x, self.u, self.dtau

        def f(xi, ui):
            Gamma = cosmos.christoffel_symbols(self.g, xi)
            ax = -sum(Gamma[m][n][r] * ui[n] * ui[r]
                      for n in range(4) for r in range(4))
            return ui, ax

        k1x, k1u = f(x,              u)
        k2x, k2u = f(x + dtau/2*k1x, u + dtau/2*k1u)
        k3x, k3u = f(x + dtau/2*k2x, u + dtau/2*k2u)
        k4x, k4u = f(x + dtau*k3x,   u + dtau*k3u)

        self.x += dtau/6 * (k1x + 2*k2x + 2*k3x + k4x)
        self.u += dtau/6 * (k1u + 2*k2u + 2*k3u + k4u)

# Radial free-fall from rest at r0 = 10*rs
# Proper time to reach singularity: tau_fall = pi*r0/(2*c) * sqrt(r0/rs)
rs   = 2.95e3          # Schwarzschild radius of 1 solar mass [m]
r0   = 10 * rs
tau_fall = np.pi * r0 / (2 * 3e8) * (r0/rs)**0.5
print(f"Free-fall proper time: {tau_fall*1e6:.1f} microseconds")
`,

wavefunction: `# AETHER-COSMOS -- Quantum Wave Function
# Time-dependent Schrodinger equation: i*hbar * d/dt |psi> = H |psi>
# File: quantum/wave_function.qg

from aether.planck import hbar, m_e
import numpy as np

class WaveFunction:
    """
    1D quantum state on spatial grid.
    |psi|^2 = probability density.
    Normalized: integral |psi|^2 dx = 1
    """
    def __init__(self, x_grid, psi0):
        self.x   = x_grid
        self.psi = psi0.astype(complex)
        self.dx  = x_grid[1] - x_grid[0]
        self._normalize()

    def _normalize(self):
        norm = np.sqrt(np.sum(np.abs(self.psi)**2) * self.dx)
        self.psi /= norm

    def probability(self):
        """Born rule: P(x) = |psi(x)|^2"""
        return np.abs(self.psi)**2

    def expectation(self, operator):
        """<O> = <psi|O|psi> = integral psi* O psi dx"""
        return np.real(np.sum(self.psi.conj() * operator(self.psi)) * self.dx)

    def momentum(self):
        """<p> via finite difference: p_op = -i*hbar * d/dx"""
        dpsi = np.gradient(self.psi, self.dx)
        return self.expectation(lambda _: -1j * hbar * dpsi)

class CrankNicolson:
    """Stable implicit integrator for TDSE"""
    def __init__(self, V_x, x, m=m_e):
        self.x, self.V, self.m = x, V_x, m
        self.dx = x[1] - x[0]

    def evolve(self, psi, dt, steps=1):
        # H = -hbar^2/(2m) * d^2/dx^2 + V(x)
        # Crank-Nicolson: (1 + i*dt*H/(2*hbar)) psi_{n+1} = (1 - i*dt*H/(2*hbar)) psi_n
        alpha = 1j * hbar * dt / (4 * self.m * self.dx**2)
        for _ in range(steps):
            psi = self._cn_step(psi, alpha)
        return psi

# Gaussian wave packet: psi(x) = A * exp(-(x-x0)^2/(4*sigma^2)) * exp(i*k0*x)
x     = np.linspace(-20e-9, 20e-9, 1000)   # 40 nm grid
k0    = 1e10   # central wavenumber
sigma = 1e-9   # 1 nm width
psi0  = np.exp(-(x-0)**2 / (4*sigma**2)) * np.exp(1j*k0*x)
wf    = WaveFunction(x, psi0)
print(f"<p> = {wf.momentum():.3e} kg m/s")
`,

pathintegral: `# AETHER-COSMOS -- Feynman Path Integral
# Z = integral D[x] exp(i/hbar * S[x])  -- sum over ALL paths
# File: quantum/path_integral.qg

from aether.planck import hbar, m_e, pi
import numpy as np

# The amplitude to go from x_a at t_a to x_b at t_b is:
# K(b,a) = integral D[x] exp(iS/hbar)
# S[x] = integral L(x,dx/dt) dt  (classical action)
# L = 0.5*m*(dx/dt)^2 - V(x)    (Lagrangian)

# Key insight: paths near the stationary-phase point (classical path)
# dominate -- quantum corrections are loop corrections in perturbation theory

class PathIntegral:
    """Discretized path integral via Monte Carlo sampling"""
    def __init__(self, x_a, x_b, t_a, t_b, V, m=m_e, N=50):
        self.xa, self.xb = x_a, x_b
        self.ta, self.tb = t_a, t_b
        self.V, self.m, self.N = V, m, N
        self.dt  = (t_b - t_a) / N
        self.eps = 1e-11   # path perturbation scale

    def action(self, path):
        """S[x] = sum_i [ m*(x_{i+1}-x_i)^2/(2*dt) - V(x_i)*dt ]"""
        x = path
        T_kin = self.m * np.diff(x)**2 / (2 * self.dt)
        V_pot = self.V(x[:-1]) * self.dt
        return np.sum(T_kin - V_pot)

    def amplitude(self, n_samples=10000):
        """Monte Carlo estimate of propagator K(b,a)"""
        K = 0.0 + 0j
        t = np.linspace(self.ta, self.tb, self.N + 1)
        for _ in range(n_samples):
            path = np.linspace(self.xa, self.xb, self.N + 1)
            path[1:-1] += np.random.normal(0, self.eps, self.N - 1)
            S = self.action(path)
            K += np.exp(1j * S / hbar)
        return K / n_samples

# Free particle -- exact result: K = sqrt(m/(2*pi*i*hbar*T)) * exp(im(xb-xa)^2/(2*hbar*T))
T = 1e-15   # femtosecond
K_free_exact = ((m_e/(2*pi*1j*hbar*T))**0.5) * np.exp(1j*m_e*(1e-9)**2/(2*hbar*T))
print(f"|K_free| = {abs(K_free_exact):.3e}")

# QFT: path integral over fields phi(x,t)
# Z = integral D[phi] exp(i S[phi]/hbar)
# Vacuum-to-vacuum amplitude generates all Feynman diagrams as perturbative expansion
`,

uncertainty: `# AETHER-COSMOS -- Heisenberg Uncertainty Principle
# Delta_x * Delta_p >= hbar/2
# File: quantum/uncertainty.qg

from aether.planck import hbar, c, G, pi
import numpy as np

# Robertson uncertainty relation (general):
# Delta_A * Delta_B >= 0.5 * |<[A,B]>|
# [x, p] = i*hbar  =>  canonical commutation relation

def uncertainty_product(wf_x, x_grid):
    """Compute Delta_x * Delta_p from wave function"""
    dx = x_grid[1] - x_grid[0]
    rho = np.abs(wf_x)**2

    x_mean = np.sum(x_grid * rho) * dx
    x2_mean = np.sum(x_grid**2 * rho) * dx
    delta_x = (x2_mean - x_mean**2) ** 0.5

    # Momentum via derivative operator
    dpsi = np.gradient(wf_x, dx)
    p_mean = np.real(np.sum(wf_x.conj() * (-1j*hbar*dpsi)) * dx)
    p2 = np.real(np.sum(wf_x.conj() * (-hbar**2*np.gradient(dpsi,dx))) * dx)
    delta_p = (p2 - p_mean**2) ** 0.5

    return delta_x, delta_p, delta_x * delta_p

# Energy-time uncertainty: Delta_E * Delta_t >= hbar/2
# NOT a canonical pair -- Delta_t is the lifetime of the state
# Virtual particles exist for Delta_t ~ hbar/(2*Delta_E) -- QFT consequence

# Planck scale: where quantum + gravity both matter
l_Planck = (hbar * G / c**3) ** 0.5   # 1.616e-35 m
t_Planck = l_Planck / c               # 5.391e-44 s
E_Planck = hbar / t_Planck            # 1.956e9 J = 1.22e19 GeV
m_Planck = E_Planck / c**2            # 2.176e-8 kg

print("Planck units (natural QG scale):")
print(f"  l_P = {l_Planck:.3e} m")
print(f"  t_P = {t_Planck:.3e} s")
print(f"  E_P = {E_Planck:.3e} J  ({E_Planck/1.6e-10:.3e} GeV)")
print(f"  m_P = {m_Planck:.3e} kg")
# Below l_P, spacetime itself has quantum fluctuations -- "spacetime foam"
`,

entangle: `# AETHER-COSMOS -- Quantum Entanglement
# |Phi+> = 1/sqrt(2) * (|00> + |11>)  -- Bell state (maximal entanglement)
# File: quantum/entanglement.qg

from aether.planck import hbar
import numpy as np

class Qubit:
    """Single qubit: alpha|0> + beta|1>, |alpha|^2 + |beta|^2 = 1"""
    def __init__(self, alpha=1.0+0j, beta=0.0+0j):
        norm = (abs(alpha)**2 + abs(beta)**2) ** 0.5
        self.state = np.array([alpha, beta], dtype=complex) / norm

    def bloch(self):
        """Bloch sphere coordinates (theta, phi)"""
        a, b = self.state
        theta = 2 * np.arccos(abs(a))
        phi   = np.angle(b) - np.angle(a)
        return theta, phi

class BellPair:
    """
    Two-qubit maximally entangled state.
    Bell states: Phi+, Phi-, Psi+, Psi- (EPR pairs)
    Non-local correlations: violate Bell inequality (CHSH bound S<=2, QM gives S=2*sqrt(2))
    """
    PHI_PLUS  = np.array([1,0,0,1], dtype=complex) / 2**0.5   # (|00>+|11>)/sqrt(2)
    PHI_MINUS = np.array([1,0,0,-1],dtype=complex) / 2**0.5   # (|00>-|11>)/sqrt(2)
    PSI_PLUS  = np.array([0,1,1,0], dtype=complex) / 2**0.5   # (|01>+|10>)/sqrt(2)
    PSI_MINUS = np.array([0,1,-1,0],dtype=complex) / 2**0.5   # (|01>-|10>)/sqrt(2)

    def entanglement_entropy(self, state):
        """S = -Tr(rho_A log rho_A)  -- von Neumann entropy of subsystem A"""
        rho = np.outer(state, state.conj())
        rho_A = np.array([[rho[0,0]+rho[1,1], rho[0,2]+rho[1,3]],
                          [rho[2,0]+rho[3,1], rho[2,2]+rho[3,3]]])
        evals = np.linalg.eigvalsh(rho_A)
        evals = evals[evals > 1e-15]
        return -np.sum(evals * np.log2(evals))

bp = BellPair()
S  = bp.entanglement_entropy(BellPair.PHI_PLUS)
print(f"Bell state entanglement entropy: {S:.4f} bits")  # = 1.0 (maximal)
# CHSH violation: S_QM = 2*sqrt(2) ~ 2.828 > 2 (classical limit)
print(f"CHSH quantum max: {2*2**0.5:.4f}")
`,

lqg: `# AETHER-COSMOS -- Loop Quantum Gravity
# Discretized spacetime: spin networks + spin foams
# File: unification/loop_quantum_gravity.qg

from aether.planck import hbar, G, c, pi
import numpy as np

# LQG key result: area and volume are QUANTIZED at Planck scale
# A_min = 4*pi*gamma*l_P^2 * sqrt(j*(j+1))  -- area eigenvalue
# gamma ~ 0.2375  (Barbero-Immirzi parameter, fixed by BH entropy)
# j = 0, 1/2, 1, 3/2, ...  (half-integer, SU(2) spin label)

GAMMA    = 0.2375    # Barbero-Immirzi parameter
L_PLANCK = (hbar * G / c**3) ** 0.5   # 1.616e-35 m
A_PLANCK = L_PLANCK ** 2

def area_eigenvalue(j):
    """
    Area spectrum: A(j) = 8*pi*gamma*hbar*G/c^3 * sqrt(j*(j+1))
    Smallest non-zero: j=1/2 => A_min = 4*pi*gamma*sqrt(3)*l_P^2
    """
    return 8 * pi * GAMMA * hbar * G / c**3 * (j*(j+1)) ** 0.5

def volume_eigenvalue(j_list):
    """
    Volume is more complex -- depends on intertwiner at node.
    Approximate: V ~ l_P^3 * sqrt(j_max)
    """
    j_max = max(j_list)
    return L_PLANCK**3 * j_max**0.5

# Spin network: graph G = (V, E) with edge labels j_e and node intertwiners i_v
# Each edge represents a quantum of area; each node represents a quantum of volume
# The spin foam (4D history) defines the dynamics -- discretized path integral

class SpinNetwork:
    """Simplified spin network -- quantum state of spatial geometry"""
    def __init__(self, edges, j_labels):
        self.edges = edges        # list of (v1,v2) tuples
        self.j     = j_labels     # half-integer spin for each edge

    def total_area(self):
        return sum(area_eigenvalue(j) for j in self.j)

    def area_gap(self):
        return area_eigenvalue(0.5)  # smallest non-zero area quantum

# Example: simple 4-valent node with j=1/2 on all edges
sn = SpinNetwork([(0,1),(0,2),(0,3),(0,4)], [0.5,0.5,0.5,0.5])
print(f"Area gap (j=1/2): {sn.area_gap():.3e} m^2")
print(f"= {sn.area_gap()/A_PLANCK:.2f} Planck areas")

# Black hole entropy (Bekenstein-Hawking):
# S_BH = A/(4*l_P^2)  =>  LQG reproduces this with gamma ~ 0.2375
def bh_entropy(A_horizon):
    return A_horizon / (4 * L_PLANCK**2)
`,

strings: `# AETHER-COSMOS -- String Theory Basics
# Extended 1D objects replace point particles. Vibrational modes = particles.
# File: unification/string_theory.qg

from aether.planck import hbar, c, G, pi
import numpy as np

# Nambu-Goto action (area of worldsheet):
# S = -T * integral d^2 sigma sqrt(-det(h_ab))
# T = 1/(2*pi*alpha')  -- string tension
# alpha' = l_s^2  -- Regge slope (string length squared)
# l_s ~ l_Planck  (at strong coupling, l_s >> l_Planck)

ALPHA_PRIME = (1.616e-35)**2    # string length scale ~ Planck length squared
T_STRING    = 1.0/(2*pi*ALPHA_PRIME)   # string tension [kg/s]

def mass_spectrum(n, N_bar, a=1.0):
    """
    Open string: M^2 = (N - a) / alpha'   (N = oscillator level)
    Closed string: M^2 = 4*(N + N_bar - a) / alpha' (left+right movers)
    a = normal-ordering constant (= 1 for open bosonic string)
    Ground state: N=0 => M^2 = -1/alpha' (tachyon -- cured in superstring theory)
    Massless: N=1 => M^2 = 0 (photon, graviton, gluon depending on sector)
    """
    return (n + N_bar - a) * (hbar * c) / ALPHA_PRIME

# Critical dimensions
D_BOSONIC    = 26   # bosonic string (26D spacetime -- 22 extra dims)
D_SUPERSTRING = 10  # superstring (10D -- 6 extra dims compactified)
D_M_THEORY   = 11   # M-theory unifies all 5 superstring theories

# The 5 consistent superstring theories:
THEORIES = {
    "Type I":    "open+closed, N=1 SUSY, SO(32) gauge group",
    "Type IIA":  "closed, N=2 non-chiral SUSY, U(1) gauge",
    "Type IIB":  "closed, N=2 chiral SUSY, SL(2,Z) duality",
    "Heterotic SO(32)": "closed, right-movers supersymmetric, SO(32)",
    "Heterotic E8xE8":  "closed, E8 x E8 gauge group, phenomenologically most promising",
}

def kaluza_klein_mass(n, R_compact):
    """
    Kaluza-Klein tower: M_n^2 = M_0^2 + n^2/R^2  (winding modes for strings)
    As R -> 0, KK modes become light -- T-duality R <-> alpha'/R
    """
    return ((n * hbar * c) / R_compact) ** 2

print(f"String tension: {T_STRING:.3e} N")
print(f"Massless (N=1,N_bar=1) string mass^2: {mass_spectrum(1,1):.3e}")
`,

holographic: `# AETHER-COSMOS -- Holographic Principle & AdS/CFT
# The information content of a region is bounded by its SURFACE area, not volume.
# File: unification/holographic.qg

from aether.planck import hbar, G, c, k_B
import numpy as np

# Bekenstein-Hawking entropy: S = A/(4*l_P^2) = k_B * A*c^3/(4*G*hbar)
# A = event horizon area. A 3D region encoded on its 2D boundary.
# This is the holographic bound (Bousso bound in covariant form).

L_PLANCK = (hbar * G / c**3) ** 0.5

def bh_entropy(M_kg):
    """Bekenstein-Hawking entropy of black hole with mass M"""
    rs    = 2 * G * M_kg / c**2
    A     = 4 * np.pi * rs**2
    S     = k_B * A * c**3 / (4 * G * hbar)
    return S

def hawking_temp(M_kg):
    """T_H = hbar*c^3/(8*pi*G*M*k_B) -- black holes radiate thermally"""
    return hbar * c**3 / (8 * np.pi * G * M_kg * k_B)

class AdSCFT:
    """
    Anti-de Sitter / Conformal Field Theory correspondence (Maldacena 1997).
    Type IIB string on AdS5 x S5 is DUAL to N=4 Super Yang-Mills on R^4.
    Gravity in bulk (D+1) dims <=> gauge theory on boundary (D dims).
    Strong coupling in CFT <=> weak coupling (classical GR) in AdS.
    """
    def __init__(self, N_colors, AdS_radius_L):
        self.N = N_colors      # SU(N) gauge group
        self.L = AdS_radius_L  # AdS radius of curvature

    def string_coupling(self, g_YM):
        """g_s = g_YM^2 / (4*pi)  -- string coupling from gauge coupling"""
        return g_YM**2 / (4 * np.pi)

    def tHooft(self, g_YM):
        """lambda = g_YM^2 * N  -- 't Hooft coupling (large N limit)"""
        return g_YM**2 * self.N

    def bulk_curvature(self, g_YM):
        """(L/l_s)^4 = lambda = g_YM^2 * N  -- AdS radius in string units"""
        return self.tHooft(g_YM) ** 0.25 * L_PLANCK

# Solar mass black hole
M_sun = 1.989e30
print(f"1 M_sun BH entropy: {bh_entropy(M_sun):.3e} J/K  ({bh_entropy(M_sun)/k_B:.3e} bits)")
print(f"Hawking temperature: {hawking_temp(M_sun):.3e} K  (6e-8 K -- colder than CMB)")
`,

coherence: `# AETHER-COSMOS -- AETHER Coherence Bridge
# Connecting quantum substrate to macroscopic coherence fields
# File: aether/coherence_bridge.qg

from aether.planck import hbar, c, G, k_B
from aether.kernel import CrystallizationEngine, CoherenceField
import numpy as np

# The AETHER thesis: quantum coherence does not simply decohere at macro scales.
# Biological and cognitive systems maintain coherence via substrate coupling --
# long-lived entangled states in structured water, microtubule networks,
# ion channel quantum tunneling, and morphogenetic field resonance.

# Quantum coherence time in warm biology (Frohlich condensate model):
# tau_c ~ hbar / (k_B * T * coupling_to_environment)
# But: if system is in a DRIVEN, far-from-equilibrium steady state,
# coherence can persist far longer than naive Boltzmann arguments suggest.

def coherence_time(T_kelvin, gamma_coupling):
    """
    Effective decoherence time.
    gamma_coupling: system-environment coupling strength [J]
    Quantum biology range: gamma ~ 0.1 - 10 meV at T ~ 300 K
    """
    return hbar / (gamma_coupling + k_B * T_kelvin * 0.01)

class AetherField:
    """
    Coherence field phi(x,t) obeying modified Klein-Gordon:
    (Box + m_eff^2 + lambda*phi^2) phi = J_substrate(x,t)
    m_eff : effective mass from substrate coupling
    J     : source term from biological / cognitive activity
    """
    def __init__(self, m_eff, lam, grid_size=64):
        self.m   = m_eff
        self.lam = lam
        self.phi = np.zeros((grid_size, grid_size), dtype=complex)
        self.pi  = np.zeros_like(self.phi)   # conjugate momentum

    def evolve(self, dt, J=None):
        """Leapfrog integration of field equation"""
        dx = 1.0
        laplacian = (np.roll(self.phi,1,0) + np.roll(self.phi,-1,0) +
                     np.roll(self.phi,1,1) + np.roll(self.phi,-1,1) - 4*self.phi) / dx**2
        mass_term = (self.m**2 + self.lam * np.abs(self.phi)**2) * self.phi
        source    = J if J is not None else 0.0
        self.phi += dt * self.pi
        self.pi  += dt * (laplacian - mass_term + source)

    def coherence_length(self):
        """xi = 1/m_eff -- field correlation length"""
        return 1.0 / (self.m + 1e-12)

    def crystallization_index(self):
        """Fraction of field in coherent (phi > threshold) phase"""
        return np.mean(np.abs(self.phi) > 0.5)

# AETHER Crystallization Model:
# Knowledge graph nodes become 'frozen' when coherence_index > threshold
# This mirrors biological LTP (long-term potentiation) in synaptic networks
# and the Frohlich condensate in ordered biological water.

af = AetherField(m_eff=0.1, lam=0.01)
print(f"Coherence length: {af.coherence_length():.1f} (substrate units)")
print(f"Initial crystal index: {af.crystallization_index():.4f}")
`,

planck: `# AETHER-COSMOS -- Planck Substrate
# The fabric beneath spacetime: where QM and GR must unite
# File: aether/planck_substrate.qg

from aether.planck import hbar, G, c, k_B, pi
import numpy as np

# The five Planck units define the natural scale of quantum gravity:
# Everything else is just a ratio to these.

L_P = (hbar * G / c**3) ** 0.5   # 1.616e-35 m   -- Planck length
T_P = L_P / c                    # 5.391e-44 s   -- Planck time
M_P = (hbar * c / G) ** 0.5      # 2.176e-8 kg   -- Planck mass
E_P = M_P * c**2                 # 1.956e9 J     -- Planck energy
TH_P = E_P / k_B                 # 1.417e32 K    -- Planck temperature

# At length scales < L_P, our concepts of smooth spacetime break down.
# Quantum fluctuations of the metric become O(1) -- "spacetime foam" (Wheeler 1955).
# Virtual black holes with mass M_P appear and evaporate in time T_P.

def spacetime_foam_density(r):
    """
    Metric fluctuation magnitude at scale r.
    delta_g ~ (L_P/r)^2  (from dimensional analysis + heuristic uncertainty)
    At r = L_P: delta_g ~ 1  (spacetime itself is undefined)
    """
    return (L_P / r) ** 2

class PlanckSubstrate:
    """
    AETHER model of the Planck-scale substrate.
    Treats spacetime as an emergent phenomenon from a pre-geometric quantum fluid.
    Inspired by: causal set theory, CDT, quantum graphity.
    """
    def __init__(self, N_nodes):
        self.N  = N_nodes
        self.adj = np.zeros((N_nodes, N_nodes), dtype=float)
        self.phi = np.random.randn(N_nodes) * L_P   # node position fluctuations

    def link(self, i, j, strength=1.0):
        """Create causal link between nodes i and j"""
        self.adj[i,j] = strength
        self.adj[j,i] = strength

    def emergent_dimension(self):
        """Estimate Hausdorff dimension from spectral method"""
        eigenvalues = np.linalg.eigvalsh(self.adj)
        nonzero = eigenvalues[eigenvalues > 1e-10]
        if len(nonzero) < 2: return 0.0
        return np.log(len(nonzero)) / np.log(np.max(nonzero) + 1)

    def coherence_entropy(self):
        """Von Neumann entropy of adjacency as density matrix"""
        rho = self.adj / (self.adj.sum() + 1e-12)
        evals = np.linalg.eigvalsh(rho)
        evals = evals[evals > 1e-15]
        return -np.sum(evals * np.log(evals))

ps = PlanckSubstrate(N_nodes=64)
print(f"Planck length: {L_P:.4e} m")
print(f"Planck time:   {T_P:.4e} s")
print(f"Planck mass:   {M_P:.4e} kg  ({M_P*1e6:.2f} micrograms)")
print(f"Foam at 1 fm:  delta_g = {spacetime_foam_density(1e-15):.2e}")
print(f"Foam at 1 pm:  delta_g = {spacetime_foam_density(1e-12):.2e}")
`,
};

/* ── spacetime canvas ────────────────────────────────────────────────── */
function SpacetimeCanvas({ mass, showGW }: { mass: number; showGW: boolean }) {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const tRef  = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    cv.width  = cv.offsetWidth * dpr;
    cv.height = cv.offsetHeight * dpr;
    ctx.scale(dpr, dpr);
    const W = cv.offsetWidth;
    const H = cv.offsetHeight;
    const cx = W / 2;
    const cy = H / 2;

    function curvature(x: number, y: number): number {
      const r = Math.sqrt((x-cx)**2 + (y-cy)**2);
      return r < 1 ? 1 : mass * 80 / (r + 1);
    }

    function distort(x: number, y: number): [number, number] {
      const dx = x - cx;
      const dy = y - cy;
      const r  = Math.sqrt(dx*dx + dy*dy);
      if (r < 0.1) return [cx, cy];
      const pull = curvature(x, y);
      const fac  = Math.min(0.92, pull / r);
      return [x - dx * fac, y - dy * fac];
    }

    function drawStars() {
      const stars: [number,number,number][] = [];
      for (let i = 0; i < 120; i++) {
        stars.push([Math.random()*W, Math.random()*H, Math.random()]);
      }
      stars.forEach(([sx,sy,b]) => {
        ctx.fillStyle = `rgba(180,200,240,${0.2+b*0.5})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.6+b*0.8, 0, Math.PI*2);
        ctx.fill();
      });
    }

    function draw(t: number) {
      ctx.clearRect(0, 0, W, H);

      /* background */
      const bgGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W,H)*0.7);
      bgGrad.addColorStop(0, `rgba(10,4,30,1)`);
      bgGrad.addColorStop(1, "#04060E");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      drawStars();

      /* grid lines - curved spacetime */
      const LINES = 14;
      const step  = Math.min(W, H) / (LINES - 1);

      /* vertical lines */
      for (let i = 0; i < LINES; i++) {
        const x0 = i * step;
        ctx.beginPath();
        let first = true;
        for (let ys = 0; ys <= H; ys += 4) {
          const [px, py] = distort(x0, ys);
          if (first) { ctx.moveTo(px, py); first = false; }
          else ctx.lineTo(px, py);
        }
        const alpha = 0.12 + Math.abs(i - LINES/2) / LINES * 0.06;
        ctx.strokeStyle = `rgba(80,180,255,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }
      /* horizontal lines */
      for (let j = 0; j < LINES; j++) {
        const y0 = j * step;
        ctx.beginPath();
        let first = true;
        for (let xs = 0; xs <= W; xs += 4) {
          const [px, py] = distort(xs, y0);
          if (first) { ctx.moveTo(px, py); first = false; }
          else ctx.lineTo(px, py);
        }
        const alpha = 0.12 + Math.abs(j - LINES/2) / LINES * 0.06;
        ctx.strokeStyle = `rgba(80,180,255,${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.stroke();
      }

      /* gravitational wave rings */
      if (showGW) {
        for (let k = 0; k < 5; k++) {
          const phase = ((t * 0.8 + k * 0.4) % 1);
          const r = phase * Math.min(W, H) * 0.48;
          const alpha = (1 - phase) * 0.4;
          ctx.strokeStyle = `rgba(0,255,178,${alpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI*2);
          ctx.stroke();
        }
      }

      /* event horizon */
      const rs = mass * 24;
      if (rs > 4) {
        const ehGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rs);
        ehGrad.addColorStop(0, "rgba(0,0,0,1)");
        ehGrad.addColorStop(0.85, "rgba(0,0,0,1)");
        ehGrad.addColorStop(1, "rgba(255,120,0,0)");
        ctx.fillStyle = ehGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, rs, 0, Math.PI*2);
        ctx.fill();

        /* accretion glow */
        const accGrad = ctx.createRadialGradient(cx, cy, rs*0.8, cx, cy, rs*2.2);
        accGrad.addColorStop(0, "rgba(255,140,20,0.55)");
        accGrad.addColorStop(0.4, "rgba(255,80,10,0.18)");
        accGrad.addColorStop(1, "rgba(255,60,0,0)");
        ctx.fillStyle = accGrad;
        ctx.beginPath();
        ctx.arc(cx, cy, rs*2.2, 0, Math.PI*2);
        ctx.fill();
      }

      /* photon sphere ring */
      const rph = rs * 1.5;
      if (rph > 4) {
        ctx.strokeStyle = "rgba(200,160,48,0.35)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4,6]);
        ctx.beginPath();
        ctx.arc(cx, cy, rph, 0, Math.PI*2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      /* orbiting test particle (ISCO = 3*rs) */
      const r_orbit = Math.max(rs*3.1 + 2, 40);
      const omega   = 0.4 / Math.sqrt(r_orbit + 1);
      const px = cx + r_orbit * Math.cos(t * omega);
      const py = cy + r_orbit * Math.sin(t * omega);
      ctx.fillStyle = C.quant;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI*2);
      ctx.fill();
      const trailLen = 48;
      for (let k = 1; k <= trailLen; k++) {
        const ta = t * omega - k * 0.05;
        const tx = cx + r_orbit * Math.cos(ta);
        const ty = cy + r_orbit * Math.sin(ta);
        const alpha = (1 - k/trailLen) * 0.35;
        ctx.fillStyle = `rgba(0,255,224,${alpha})`;
        ctx.beginPath();
        ctx.arc(tx, ty, 1.5, 0, Math.PI*2);
        ctx.fill();
      }

      /* labels */
      ctx.font = "9px 'DM Mono', monospace";
      ctx.fillStyle = "rgba(200,160,48,0.6)";
      if (rs > 4) ctx.fillText(`r_s = ${(mass*24).toFixed(0)}px`, cx+4, cy-rs-6);
      ctx.fillStyle = "rgba(0,255,178,0.5)";
      ctx.fillText(`ISCO = ${(r_orbit).toFixed(0)}px`, cx + r_orbit + 5, cy + 4);
      ctx.fillStyle = "rgba(80,180,255,0.35)";
      ctx.font = "8px 'DM Mono', monospace";
      ctx.fillText("SPACETIME CURVATURE", 8, H-8);
    }

    function loop() {
      tRef.current += 0.016;
      draw(tRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mass, showGW]);

  return (
    <canvas ref={cvRef} style={{ width: "100%", height: "100%", display: "block" }} />
  );
}

/* ── code renderer ───────────────────────────────────────────────────── */
function CodePane({ fileId }: { fileId: string }) {
  const content = FILE_CONTENTS[fileId] ?? "# file not found\n";
  const lines   = content.split("\n");

  return (
    <div style={{ fontFamily: "JetBrains Mono, 'DM Mono', ui-monospace, monospace", fontSize: 11.5, lineHeight: 1.7, padding: "16px 0", overflowX: "auto" }}>
      {lines.map((line, i) => {
        const tokens = tokenize(line);
        return (
          <div key={i} style={{ display: "flex", paddingRight: 24 }}>
            <span style={{ minWidth: 38, textAlign: "right", paddingRight: 16, color: "#303848", userSelect: "none", flexShrink: 0, fontSize: 10.5 }}>
              {i + 1}
            </span>
            <span style={{ whiteSpace: "pre" }}>
              {tokens.map((tk, j) => (
                <span key={j} style={{ color: TOK_CLR[tk.t], fontStyle: tk.t === "comment" ? "italic" : "normal" }}>
                  {tk.s}
                </span>
              ))}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────────────── */
const CARD: React.CSSProperties = {
  boxShadow: "0 1px 0 rgba(255,255,255,0.02) inset, 0 30px 70px -30px rgba(0,0,0,0.8)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

export default function QuantumGravityCosmosPage() {
  const [openFile, setOpenFile] = useState("einstein");
  const [openFolders, setOpenFolders] = useState<Set<string>>(new Set(["spacetime","quantum","unification","aether"]));
  const [mass, setMass]         = useState(0.5);
  const [showGW, setShowGW]     = useState(false);

  const toggleFolder = (name: string) => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const currentFile = useMemo(() => {
    for (const folder of FILE_TREE) {
      const f = folder.files.find(f => f.id === openFile);
      if (f) return { folder, file: f };
    }
    return null;
  }, [openFile]);

  return (
    <div style={{ background: C.bg, color: C.text, minHeight: "100%", fontFamily: "Cinzel, ui-serif, Georgia, serif", position: "relative", overflowX: "hidden" }}>

      <style>{`
        @keyframes qg-pulse  { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:1;transform:scale(1.5)} }
        @keyframes qg-drift  { 0%{transform:translate3d(0,0,0)} 50%{transform:translate3d(20px,-25px,0)} 100%{transform:translate3d(0,0,0)} }
        @keyframes qg-breathe{ 0%,100%{opacity:.4} 50%{opacity:.8} }
        @keyframes qg-fadein { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        .qg-pulse   { animation: qg-pulse 2.2s ease-in-out infinite; transform-origin: center; }
        .qg-glow-a  { animation: qg-breathe 12s ease-in-out infinite, qg-drift 28s ease-in-out infinite; position:absolute; }
        .qg-glow-b  { animation: qg-breathe 16s ease-in-out infinite, qg-drift 36s ease-in-out infinite reverse; position:absolute; }
        .qg-fadein  { animation: qg-fadein 0.18s ease-out both; }
      `}</style>

      {/* glow */}
      <div style={{ pointerEvents: "none", position: "absolute", inset: 0, overflow: "hidden" }} aria-hidden>
        <div className="qg-glow-a" style={{ top: "-15%", left: "-10%",  width: 650, height: 650, background: "radial-gradient(circle, rgba(80,40,200,0.14) 0%, transparent 70%)", filter: "blur(20px)" }} />
        <div className="qg-glow-b" style={{ top: "45%",  right: "-15%", width: 550, height: 550, background: "radial-gradient(circle, rgba(0,255,178,0.07) 0%, transparent 70%)", filter: "blur(20px)" }} />
      </div>

      <div style={{ position: "relative" }}>

        {/* header */}
        <div style={{ padding: "24px 28px 14px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, letterSpacing: "0.45em", textTransform: "uppercase", color: C.muted, fontStyle: "italic" }}>
            aether cosmos · quantum gravity · spacetime · unification
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 6 }}>
            <h1 style={{ fontSize: 30, margin: 0, lineHeight: 1.1, color: C.white, letterSpacing: "0.02em" }}>
              Quantum Gravity &amp; Relativity{" "}
              <span style={{ color: C.violet }}>Code Synthesis</span>
            </h1>
            <div className="qg-pulse" style={{ width: 8, height: 8, borderRadius: "50%", background: C.cyan, boxShadow: `0 0 12px ${C.cyan}`, flexShrink: 0 }} />
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12.5, lineHeight: 1.7, color: "#6A7D90", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif", maxWidth: 720 }}>
            Live simulation files for general relativity, quantum mechanics, loop quantum gravity,
            string theory, and the AETHER coherence bridge. Each file is executable pseudocode
            grounded in real physics.
          </p>
        </div>

        {/* IDE layout */}
        <div style={{ display: "grid", gridTemplateColumns: "200px minmax(0,1fr) 340px", minHeight: "calc(100vh - 120px)" }}>

          {/* file explorer */}
          <div style={{ background: C.sidebar, borderRight: `1px solid ${C.border}`, padding: "10px 0", overflowY: "auto" }}>
            <div style={{ padding: "4px 14px 10px", fontSize: 9, letterSpacing: "0.4em", textTransform: "uppercase", color: C.muted }}>
              AETHER-COSMOS
            </div>
            {FILE_TREE.map(folder => (
              <div key={folder.name}>
                <button
                  onClick={() => toggleFolder(folder.name)}
                  style={{ width: "100%", textAlign: "left", padding: "5px 14px", display: "flex", alignItems: "center", gap: 7, cursor: "pointer", background: "none", border: "none", color: openFolders.has(folder.name) ? C.text : C.muted, fontSize: 11.5, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                  aria-expanded={openFolders.has(folder.name)}>
                  <span style={{ fontSize: 9, color: C.muted }}>{openFolders.has(folder.name) ? "v" : ">"}</span>
                  <span style={{ fontSize: 13 }}>{folder.icon}</span>
                  <span style={{ fontSize: 11 }}>{folder.name}/</span>
                </button>
                {openFolders.has(folder.name) && folder.files.map(f => (
                  <button key={f.id} onClick={() => setOpenFile(f.id)}
                    style={{ width: "100%", textAlign: "left", padding: "4px 14px 4px 32px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", background: f.id === openFile ? "rgba(80,100,200,0.18)" : "none", border: "none", color: f.id === openFile ? C.cyan : "#6A8090", fontSize: 10.5, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}
                    data-testid={`file-${f.id}`} aria-pressed={f.id === openFile}>
                    <span style={{ fontSize: 9, width: 24, color: f.id === openFile ? C.gold : C.muted, flexShrink: 0, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{f.icon}</span>
                    <span style={{ fontSize: 10.5 }}>{f.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* editor pane */}
          <div style={{ background: C.editor, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {/* tab bar */}
            <div style={{ borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", background: C.sidebar, flexShrink: 0 }}>
              {currentFile && (
                <div style={{ padding: "8px 20px", fontSize: 11, color: C.cyan, borderBottom: `2px solid ${C.violet}`, fontFamily: "JetBrains Mono, ui-monospace, monospace", background: C.editor, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12 }}>{currentFile.folder.icon}</span>
                  {currentFile.file.name}
                </div>
              )}
              <div style={{ marginLeft: "auto", padding: "0 16px", fontSize: 10, color: C.muted, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                AETHER-QG v0.9.4 · Python-like
              </div>
            </div>
            {/* code */}
            <div className="qg-fadein" key={openFile} style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
              <CodePane fileId={openFile} />
            </div>
            {/* status bar */}
            <div style={{ borderTop: `1px solid ${C.border}`, background: C.violet + "22", padding: "3px 16px", display: "flex", gap: 24, fontSize: 9.5, color: "#5A6880", fontFamily: "JetBrains Mono, ui-monospace, monospace", flexShrink: 0 }}>
              <span style={{ color: C.violet }}>AETHER-QG</span>
              <span>{currentFile?.folder.name}/{currentFile?.file.name}</span>
              <span>Ln {FILE_CONTENTS[openFile]?.split("\n").length ?? 0}</span>
              <span style={{ marginLeft: "auto" }}>UTF-8 · LF · .qg</span>
            </div>
          </div>

          {/* right panel: simulation + controls */}
          <div style={{ borderLeft: `1px solid ${C.border}`, background: "rgba(6,8,20,0.95)", display: "flex", flexDirection: "column" }}>
            {/* canvas */}
            <div style={{ flex: "0 0 300px", position: "relative", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ position: "absolute", inset: 0 }}>
                <SpacetimeCanvas mass={mass} showGW={showGW} />
              </div>
              <div style={{ position: "absolute", top: 8, left: 10, fontSize: 8, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(80,180,255,0.5)", fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>
                LIVE -- SPACETIME SIM
              </div>
            </div>

            {/* controls */}
            <div style={{ padding: "14px 16px", overflowY: "auto", flex: 1 }}>
              <div style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>simulation controls</div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, marginBottom: 4 }}>
                  <span style={{ color: "#60607A" }}>black hole mass</span>
                  <span style={{ color: C.gold, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{mass.toFixed(2)} M</span>
                </div>
                <input type="range" min={0.1} max={1.5} step={0.01} value={mass} onChange={e => setMass(parseFloat(e.target.value))} aria-label="black hole mass" style={{ width: "100%", accentColor: C.gold }} />
              </div>

              <button onClick={() => setShowGW(v => !v)}
                style={{ width: "100%", padding: "8px 12px", background: showGW ? C.cyan+"22" : "rgba(20,18,32,0.6)", border: `1px solid ${showGW ? C.cyan+"66" : C.border}`, borderRadius: 6, color: showGW ? C.cyan : C.muted, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", fontFamily: "JetBrains Mono, ui-monospace, monospace", marginBottom: 16 }}>
                {showGW ? "GW rings ON" : "GW rings OFF"}
              </button>

              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                <div style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>derived quantities</div>
                {[
                  { k: "r_s (Schwarzschild)", v: `${(mass*24).toFixed(0)} px`, c: C.gold },
                  { k: "photon sphere",        v: `${(mass*36).toFixed(0)} px`, c: C.amber },
                  { k: "ISCO",                 v: `${(mass*72).toFixed(0)} px`, c: C.cyan },
                  { k: "time dilation @2r_s",  v: `${(1-(1/2))**0.5 .toFixed(4)}`, c: C.violet },
                  { k: "Hawking T (arb.)",      v: `${(1/(8*Math.PI*mass+0.1)).toFixed(3)}`, c: C.rose },
                  { k: "BH entropy (arb.)",    v: `${(Math.PI*mass**2).toFixed(3)}`, c: C.green },
                ].map(({ k, v, c }) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, alignItems: "baseline" }}>
                    <span style={{ fontSize: 10, color: C.muted, fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" }}>{k}</span>
                    <span style={{ fontSize: 11, color: c, fontFamily: "JetBrains Mono, ui-monospace, monospace" }}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, marginTop: 4 }}>
                <div style={{ fontSize: 9, letterSpacing: "0.35em", textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>file guide</div>
                {FILE_TREE.map(folder => (
                  <div key={folder.name} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 9, letterSpacing: "0.2em", color: "#5A6880", marginBottom: 4 }}>
                      {folder.icon} {folder.name}/
                    </div>
                    {folder.files.map(f => (
                      <button key={f.id} onClick={() => setOpenFile(f.id)}
                        style={{ display: "block", width: "100%", textAlign: "left", background: "none", border: "none", padding: "2px 8px", fontSize: 10, color: f.id === openFile ? C.cyan : "#4A5870", fontFamily: "JetBrains Mono, ui-monospace, monospace", cursor: "pointer", borderLeft: `2px solid ${f.id === openFile ? C.violet : "transparent"}` }}>
                        {f.icon} {f.name}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

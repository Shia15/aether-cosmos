import { useEffect, useRef, useState } from "react";
import { CodeFilesPanel } from "@/components/code-files-panel";

/* ── palette ─────────────────────────────────────────────────────────── */
const BG    = "#010308";
const PANEL = "#060F1C";
const DEEP  = "#030912";
const BORDER= "#0C1E34";
const AU    = "#00FFB2";
const GOLD  = "#C8A030";
const AMBER = "#E08020";
const VIOL  = "#9060E0";
const CORAL = "#E05048";
const BLUE  = "#1080D8";
const CYAN  = "#20C8D8";
const TEXT  = "#B8C8D8";
const MUTED = "#3A5068";
const DIM   = "#1A2D44";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── orbital physics ─────────────────────────────────────────────────── */
const MU_EARTH = 398600.4418;  // km^3/s^2 (standard gravitational parameter)
const R_EARTH  = 6371;         // km

function orbitalPeriod(a_km: number) {
  return 2 * Math.PI * Math.sqrt(a_km ** 3 / MU_EARTH) / 60; // minutes
}
function circularVelocity(r_km: number) {
  return Math.sqrt(MU_EARTH / r_km); // km/s
}
function ellipticVelocity(a_km: number, r_km: number) {
  return Math.sqrt(MU_EARTH * (2 / r_km - 1 / a_km)); // km/s vis-viva
}
function hohmannDV(r1_km: number, r2_km: number) {
  const a_t = (r1_km + r2_km) / 2;
  const v1  = circularVelocity(r1_km);
  const v2  = circularVelocity(r2_km);
  const vt1 = ellipticVelocity(a_t, r1_km);
  const vt2 = ellipticVelocity(a_t, r2_km);
  return { dv1: Math.abs(vt1 - v1), dv2: Math.abs(v2 - vt2), total: Math.abs(vt1-v1)+Math.abs(v2-vt2) };
}

/* ── section title component ─────────────────────────────────────────── */
function SectionTitle({ number, title, sub, col = AU }: { number: string; title: string; sub: string; col?: string }) {
  return (
    <div style={{ background:DEEP, border:`1px solid ${col}22`, borderLeft:`4px solid ${col}`, borderRadius:"0 8px 8px 0", padding:"28px 32px", marginBottom:28, marginTop:48 }}>
      <div style={{ fontFamily:mono, fontSize:9, color:`${col}88`, letterSpacing:"0.6em", marginBottom:8, textTransform:"uppercase" }}>
        SECTION {number}
      </div>
      <div style={{ fontFamily:serif, fontSize:26, color:col, letterSpacing:"0.05em", marginBottom:6 }}>{title}</div>
      <div style={{ fontFamily:body, fontSize:15, color:MUTED, lineHeight:1.6 }}>{sub}</div>
    </div>
  );
}

/* ── orbit table row ─────────────────────────────────────────────────── */
function OrbitRow({ name, alt, period, vel, inc, use: u, col }: {
  name:string; alt:string; period:string; vel:string; inc:string; use:string; col:string;
}) {
  return (
    <tr>
      <td style={{ padding:"10px 14px", color:col, fontFamily:mono, fontSize:11, fontWeight:"bold" }}>{name}</td>
      <td style={{ padding:"10px 14px", color:TEXT, fontFamily:mono, fontSize:10 }}>{alt}</td>
      <td style={{ padding:"10px 14px", color:TEXT, fontFamily:mono, fontSize:10 }}>{period}</td>
      <td style={{ padding:"10px 14px", color:TEXT, fontFamily:mono, fontSize:10 }}>{vel}</td>
      <td style={{ padding:"10px 14px", color:TEXT, fontFamily:mono, fontSize:10 }}>{inc}</td>
      <td style={{ padding:"10px 14px", color:MUTED, fontFamily:body, fontSize:12 }}>{u}</td>
    </tr>
  );
}

/* ── interactive orbital canvas ──────────────────────────────────────── */
function OrbitalCanvas({ ecc, a_km }: { ecc: number; a_km: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const raf = useRef(0);
  const th  = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W * 0.45;
    const cy = H * 0.5;
    const scale = Math.min(W, H) * 0.36;

    const R_Earth_px = 24;

    function drawEarth() {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R_Earth_px * 2.5);
      g.addColorStop(0, "#4080FF");
      g.addColorStop(0.4, "#1040A0");
      g.addColorStop(1, `${BLUE}00`);
      ctx.beginPath();
      ctx.arc(cx, cy, R_Earth_px * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, R_Earth_px, 0, Math.PI * 2);
      ctx.fillStyle = "#1A4080";
      ctx.fill();
      ctx.strokeStyle = "#2060D0";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function drawOrbit(a_px: number, ecc2: number, col: string, label: string, lw = 1.5) {
      const b_px = a_px * Math.sqrt(1 - ecc2 * ecc2);
      const c_px = a_px * ecc2;  // focal offset
      const ox   = cx - c_px;    // centre of ellipse (focus is at cx,cy)
      ctx.beginPath();
      ctx.ellipse(ox, cy, a_px, b_px, 0, 0, Math.PI * 2);
      ctx.strokeStyle = col;
      ctx.lineWidth = lw;
      ctx.globalAlpha = 0.55;
      ctx.stroke();
      ctx.globalAlpha = 1;
      ctx.fillStyle = `${col}88`;
      ctx.font = `9px ${mono}`;
      ctx.textAlign = "left";
      ctx.fillText(label, ox + a_px + 4, cy - b_px * 0.5);
    }

    function drawSpacecraft(a_px: number, ecc2: number, angle: number) {
      const b_px = a_px * Math.sqrt(1 - ecc2 * ecc2);
      const c_px = a_px * ecc2;
      const ox   = cx - c_px;
      const sx   = ox + a_px * Math.cos(angle);
      const sy   = cy - b_px * Math.sin(angle);
      const g2 = ctx.createRadialGradient(sx, sy, 0, sx, sy, 7);
      g2.addColorStop(0, GOLD);
      g2.addColorStop(1, `${GOLD}00`);
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fillStyle = g2;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();
    }

    function draw() {
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      // starfield
      ctx.fillStyle = "#ffffff18";
      for (let i = 0; i < 80; i++) {
        const sx = (Math.sin(i * 127.3) * 0.5 + 0.5) * W;
        const sy = (Math.sin(i * 73.1 + 1) * 0.5 + 0.5) * H;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // reference orbits (fixed background)
      const rLEO = ((200 + R_EARTH) / a_km) * scale * 0.28;
      const rGEO = 42164 / a_km * scale;
      drawOrbit(Math.min(scale * 0.22, 90),  0,    `${AU}80`,   "LEO");
      drawOrbit(Math.min(scale * 0.6,  240), 0,    `${GOLD}80`, "GEO", 1);

      // user-controlled orbit
      const a_px = Math.min(scale * 0.85, (a_km / 42164) * scale * 1.1);
      drawOrbit(a_px, ecc, AU, "USER", 2.2);

      drawEarth();
      drawSpacecraft(a_px, ecc, th.current);

      // Kepler: dtheta/dt proportional to 1/r^2 (sweep equal areas)
      const b_px = a_px * Math.sqrt(1 - ecc * ecc);
      const c_px = a_px * ecc;
      const ox2  = cx - c_px;
      const rx   = ox2 + a_px * Math.cos(th.current) - cx;
      const ry   = -(cy - b_px * Math.sin(th.current)) + cy;
      const rLen = Math.max(Math.hypot(rx, ry), 1);
      th.current += 0.018 * (scale * 0.3 / rLen);

      // periapsis / apoapsis labels
      ctx.fillStyle = `${AU}88`;
      ctx.font = `8px ${mono}`;
      ctx.textAlign = "center";
      const periR = a_km * (1 - ecc);
      const apoR  = a_km * (1 + ecc);
      ctx.fillText(`Pe ${(periR - R_EARTH).toFixed(0)} km`, cx + a_px*(1-ecc) - c_px + 0, cy + 14);
      if (ecc > 0.05) {
        ctx.fillStyle = `${GOLD}88`;
        ctx.fillText(`Ap ${(apoR - R_EARTH).toFixed(0)} km`, cx - a_px*(1+ecc) - c_px + 0, cy + 14);
      }

      raf.current = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [ecc, a_km]);

  return <canvas ref={ref} width={900} height={400} style={{ width:"100%", height:"auto", display:"block", borderRadius:8 }} />;
}

/* ── delta-v bar ─────────────────────────────────────────────────────── */
function DVBar({ label, dv, max, col }: { label:string; dv:number; max:number; col:string }) {
  const pct = Math.min(dv / max * 100, 100);
  return (
    <div style={{ marginBottom:14 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontFamily:body, fontSize:13, color:TEXT }}>{label}</span>
        <span style={{ fontFamily:mono, fontSize:11, color:col }}>{dv.toFixed(2)} km/s</span>
      </div>
      <div style={{ height:10, background:DIM, borderRadius:5, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:`linear-gradient(90deg, ${col}88, ${col})`, borderRadius:5 }} />
      </div>
    </div>
  );
}

/* ── propulsion card ─────────────────────────────────────────────────── */
function PropCard({ name, thrust, isp, dv, use: u, col }: {
  name:string; thrust:string; isp:string; dv:string; use:string; col:string;
}) {
  return (
    <div style={{ background:PANEL, border:`1px solid ${col}28`, borderTop:`2px solid ${col}`, borderRadius:10, padding:"18px 18px" }}>
      <div style={{ fontFamily:mono, fontSize:10, color:col, marginBottom:10, letterSpacing:"0.1em" }}>{name}</div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:10 }}>
        {[["THRUST", thrust, col],["Isp", isp, AU],["TOTAL DV", dv, GOLD]].map(([l,v,c]) => (
          <div key={l as string} style={{ padding:"6px 8px", background:`${c as string}0e`, borderRadius:5 }}>
            <div style={{ fontFamily:mono, fontSize:7, color:MUTED, marginBottom:3, letterSpacing:"0.2em" }}>{l}</div>
            <div style={{ fontFamily:mono, fontSize:11, color:c as string }}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{ fontFamily:body, fontSize:12, color:MUTED, lineHeight:1.5 }}>{u}</div>
    </div>
  );
}

/* ── code files ──────────────────────────────────────────────────────── */
const ORB_CODE_FILES = [
  {
    id:"kepler", name:"kepler_orbital_mechanics.qg", icon:"Kp",
    content:`# AETHER-ORB -- Kepler Orbital Mechanics
# Two-body problem: m << M -> reduced to central force problem.
# State vector: (r, v) in inertial frame -> 6 orbital elements.
# Conservation: energy E = -mu/(2a), angular momentum L = r x v.

import numpy as np

MU = 398600.4418  # Earth: km^3/s^2 (gravitational parameter)
RE = 6371.0       # Earth radius [km]

def vis_viva(r_km, a_km, mu=MU):
    """
    vis-viva equation: v^2 = mu * (2/r - 1/a)
    v: speed at any point in orbit [km/s]
    r: current distance from focus [km]
    a: semi-major axis [km]
    """
    return np.sqrt(mu * (2/r_km - 1/a_km))

def orbital_period(a_km, mu=MU):
    """T = 2*pi * sqrt(a^3 / mu)  [seconds]"""
    return 2 * np.pi * np.sqrt(a_km**3 / mu)

def eccentricity_vector(r_vec, v_vec, mu=MU):
    """
    Eccentricity vector: points from focus to periapsis, magnitude = ecc.
    e_vec = (v^2 - mu/r) * r_hat - (r.v) * v_hat / mu
    |e_vec| = 0: circle, < 1: ellipse, = 1: parabola, > 1: hyperbola
    """
    r = np.linalg.norm(r_vec)
    v = np.linalg.norm(v_vec)
    return (1/mu) * ((v**2 - mu/r)*r_vec - np.dot(r_vec, v_vec)*v_vec)

def state_to_elements(r_vec, v_vec, mu=MU):
    """
    Convert state vector (r, v) to classical orbital elements.
    Returns: (a, e, i, RAAN, omega, nu)
    a [km], e [-], i [deg], RAAN [deg], omega [deg], nu [deg]
    """
    r = np.linalg.norm(r_vec)
    v = np.linalg.norm(v_vec)
    h_vec = np.cross(r_vec, v_vec)  # angular momentum vector
    h     = np.linalg.norm(h_vec)
    e_vec = eccentricity_vector(r_vec, v_vec, mu)
    e     = np.linalg.norm(e_vec)
    a     = -mu / (2 * (v**2/2 - mu/r))  # semi-major axis
    i     = np.degrees(np.arccos(h_vec[2] / h))  # inclination
    # Node vector
    N_vec = np.cross([0,0,1], h_vec)
    N     = np.linalg.norm(N_vec)
    RAAN  = np.degrees(np.arctan2(N_vec[1], N_vec[0]))
    omega = np.degrees(np.arccos(np.dot(N_vec, e_vec) / (N*e + 1e-9)))
    nu    = np.degrees(np.arccos(np.dot(e_vec, r_vec) / (e*r + 1e-9)))
    return a, e, i, RAAN % 360, omega % 360, nu % 360`,
  },
  {
    id:"transfers", name:"orbital_transfers.qg", icon:"Tr",
    content:`# AETHER-ORB -- Orbital Transfer Mechanics
# Hohmann: minimum energy 2-burn transfer between coplanar circular orbits.
# Bi-elliptic: 3-burn, more efficient than Hohmann when r2/r1 > 11.94.
# Plane change: expensive -- better done at apoapsis (lowest velocity point).

import numpy as np

MU = 398600.4418  # km^3/s^2

def hohmann_transfer(r1_km, r2_km, mu=MU):
    """
    Two-burn Hohmann transfer: circular r1 -> elliptic transfer -> circular r2.
    DV_total = |DV1| + |DV2|  (both prograde for outer orbit, retrograde for inner)
    Most fuel-efficient 2-burn transfer for coplanar orbits.
    """
    a_t  = (r1_km + r2_km) / 2          # transfer ellipse semi-major axis
    v1   = np.sqrt(mu / r1_km)           # circular velocity at r1
    v2   = np.sqrt(mu / r2_km)           # circular velocity at r2
    vt1  = np.sqrt(mu * (2/r1_km - 1/a_t))  # transfer orbit speed at r1
    vt2  = np.sqrt(mu * (2/r2_km - 1/a_t))  # transfer orbit speed at r2
    DV1  = abs(vt1 - v1)
    DV2  = abs(v2 - vt2)
    t_tr = np.pi * np.sqrt(a_t**3 / mu)  # transfer time [s]
    return {"DV1_kms": DV1, "DV2_kms": DV2, "total_kms": DV1+DV2, "time_s": t_tr}

def bielliptic_transfer(r1, r2, rb, mu=MU):
    """
    3-burn bi-elliptic: r1 -> rb (intermediate apoapsis) -> r2.
    More efficient than Hohmann when rb >> r2 and r2/r1 > 11.94.
    DV3 at rb is small (high altitude = low speed).
    """
    a1  = (r1 + rb) / 2
    a2  = (rb + r2) / 2
    v1  = np.sqrt(mu/r1);  vb1 = np.sqrt(mu*(2/r1 - 1/a1))
    vb2 = np.sqrt(mu*(2/rb - 1/a1)); vb3 = np.sqrt(mu*(2/rb - 1/a2))
    v2  = np.sqrt(mu/r2);  vb4 = np.sqrt(mu*(2/r2 - 1/a2))
    return {"DV1": abs(vb1-v1), "DV2": abs(vb3-vb2), "DV3": abs(v2-vb4),
            "total": abs(vb1-v1)+abs(vb3-vb2)+abs(v2-vb4)}

def plane_change_dv(v_kms, delta_i_deg):
    """
    Pure plane change at constant speed v.
    DV = 2 * v * sin(delta_i / 2)
    Minimised by doing plane change at apoapsis (minimum v).
    At 200km LEO (7.78 km/s): 1-deg plane change costs 0.136 km/s
    At GEO (3.07 km/s): 1-deg plane change costs 0.054 km/s
    -> Always combined with speed change to minimise total DV.
    """
    return 2 * v_kms * np.sin(np.radians(delta_i_deg) / 2)

# Delta-V budget Earth surface -> common destinations:
DV_TABLE = {
    "Surface -> LEO":       9.4,   # [km/s] includes gravity + drag losses
    "LEO -> GEO":           3.9,
    "LEO -> TLI (Moon)":    3.1,
    "TLI -> Lunar orbit":   0.9,
    "Lunar orbit -> surface": 1.9,
    "LEO -> Mars (Hohmann)": 0.6,  # from Earth-Mars transfer orbit
    "LEO -> escape":         3.2,
    "Mars orbit -> surface": 0.9,
}`,
  },
  {
    id:"propulsion", name:"propulsion_systems.qg", icon:"Pr",
    content:`# AETHER-ORB -- Propulsion System Mechanical Outputs
# Tsiolkovsky rocket equation: DV = Isp * g0 * ln(m0/mf)
# Isp [s]: specific impulse = thrust / (mass_flow * g0)
# Higher Isp -> more efficient, less propellant mass needed.

import numpy as np

G0 = 9.80665e-3  # standard gravity [km/s^2]

def tsiolkovsky(Isp_s, mass_ratio):
    """
    DV = Isp * g0 * ln(m0/mf)
    mass_ratio = m0/mf = (propellant + dry mass) / dry mass
    Returns DV [km/s].
    """
    return Isp_s * G0 * np.log(mass_ratio)

def mass_ratio(DV_kms, Isp_s):
    """Required mass ratio for given DV and Isp."""
    return np.exp(DV_kms / (Isp_s * G0))

def propellant_fraction(DV_kms, Isp_s):
    """Propellant mass as fraction of initial mass."""
    mr = mass_ratio(DV_kms, Isp_s)
    return 1 - 1/mr

PROPULSION_SYSTEMS = {
    "Cold Gas Thruster":  {"Isp_s":  65,   "thrust_N": 1e-3,  "DV_kms": 0.05, "use": "attitude control, CubeSats"},
    "Monopropellant":     {"Isp_s": 220,   "thrust_N": 22,    "DV_kms": 0.6,  "use": "station-keeping, small maneuvers"},
    "Bipropellant":       {"Isp_s": 450,   "thrust_N": 500,   "DV_kms": 1.9,  "use": "apogee kick, GEO insertion"},
    "Kerosene/LOX":       {"Isp_s": 311,   "thrust_N": 845000,"DV_kms": 9.4,  "use": "first stage, surface to LEO"},
    "LH2/LOX":            {"Isp_s": 450,   "thrust_N": 1800,  "DV_kms": 4.0,  "use": "upper stage, TLI"},
    "Ion Thruster":       {"Isp_s": 3000,  "thrust_N": 0.092, "DV_kms": 12.0, "use": "deep space, GEO station-keeping"},
    "Hall Effect Thruster":{"Isp_s": 1600, "thrust_N": 0.5,   "DV_kms": 5.0,  "use": "commercial LEO/MEO/GEO"},
    "Nuclear Thermal":    {"Isp_s": 900,   "thrust_N": 111000,"DV_kms": 8.0,  "use": "Mars transfer, outer planets"},
    "Solar Sail":         {"Isp_s": 1e9,   "thrust_N": 6e-3,  "DV_kms": "inf","use": "deep space, no propellant"},
    "VASIMR":             {"Isp_s": 5000,  "thrust_N": 5.7,   "DV_kms": 20.0, "use": "Mars 39-day transfer (200 kW)"},
}

# For a given mission DV and Isp, propellant fraction:
for name, sys in PROPULSION_SYSTEMS.items():
    dv = sys["DV_kms"]
    if isinstance(dv, (int, float)):
        pf = propellant_fraction(dv, sys["Isp_s"])
        print(f"{name}: {pf*100:.0f}% propellant")`,
  },
  {
    id:"aether", name:"aether_orbital_coherence.qg", icon:"Ao",
    content:`# AETHER-ORB -- Orbital Coherence Field Mapping
# Keplerian orbit = perfectly coherent trajectory through curved spacetime.
# C_orbit(t) = 1 when spacecraft follows exact Keplerian path.
# Perturbations (J2, drag, solar pressure, 3-body) -> C_orbit(t) < 1.

from aether.kernel import CoherenceField
import numpy as np

MU_EARTH = 398600.4418  # km^3/s^2
RE       = 6371.0       # km
J2       = 1.08263e-3   # Earth oblateness coefficient

def j2_perturbation(r_vec, mu=MU_EARTH, J2_=J2, RE_=RE):
    """
    J2 acceleration: Earth's oblate bulge perturbs inclined orbits.
    Causes: RAAN precession (orbital plane rotates) + perigee drift.
    Magnitude: a_J2 ~ (3/2)*J2*(RE/r)^2*mu/r^2  [km/s^2]
    SSO uses J2: inclination tuned so RAAN precesses +360deg/year (sun-sync).
    """
    r = np.linalg.norm(r_vec)
    z = r_vec[2]
    factor = -3/2 * J2_ * mu * RE_**2 / r**5
    ax = factor * r_vec[0] * (1 - 5*(z/r)**2)
    ay = factor * r_vec[1] * (1 - 5*(z/r)**2)
    az = factor * r_vec[2] * (3 - 5*(z/r)**2)
    return np.array([ax, ay, az])

def drag_acceleration(r_vec, v_vec, Cd=2.2, A_m=0.01):
    """
    Atmospheric drag: major perturbation below 600 km.
    a_drag = -0.5 * rho * Cd * (A/m) * v^2 * v_hat
    rho: exponential atmosphere model rho = rho0 * exp(-(h-h0)/H)
    Drag causes orbital decay: h decreases, v increases (paradox: drag speeds up satellite)
    """
    r = np.linalg.norm(r_vec)
    h = r - RE   # altitude [km]
    rho = 1.225e-9 * np.exp(-h / 8.5)  # [kg/km^3], H=8.5km scale height
    v   = np.linalg.norm(v_vec)
    v_hat = v_vec / (v + 1e-9)
    return -0.5 * rho * Cd * A_m * v**2 * v_hat

class OrbitalCoherenceTracker:
    """
    Tracks C_orbit(t) = correlation between actual and Keplerian trajectory.
    C_orbit = 1: perfect Keplerian (vacuum, point mass, no perturbations)
    C_orbit < 1: perturbations active -- magnitude measures decoherence rate.
    """
    def __init__(self, r0, v0):
        from scipy.integrate import odeint
        self.r0, self.v0 = r0, v0
        self.elements0 = None  # initial orbital elements

    def decoherence_rate(self, perturbation_acc_kms2):
        """
        Rate of coherence loss due to perturbations.
        dC/dt = -|a_pert| / v_orbital * coherence_damping
        """
        v_orb = np.linalg.norm(self.v0)
        return np.linalg.norm(perturbation_acc_kms2) / v_orb

# AETHER mapping:
# Perfect orbit (Keplerian) = C_orbit = 1 (maximum coherence)
# J2 precession = slow orbital plane precession = C_orbit slowly rotating in element space
# Atmospheric drag = energy drain = C_orbit decaying (orbit shrinks)
# Station-keeping burns = re-crystallisation pulses restoring C_orbit to 1
# The orbit IS the crystallized path through curved spacetime.`,
  },
];

/* ── main page ───────────────────────────────────────────────────────── */
export default function OrbitalMechanicsPage() {
  const [ecc,  setEcc ] = useState(0.15);
  const [a_km, setAkm ] = useState(20000);

  const periAlt  = (a_km * (1 - ecc) - R_EARTH).toFixed(0);
  const apoAlt   = (a_km * (1 + ecc) - R_EARTH).toFixed(0);
  const period   = orbitalPeriod(a_km).toFixed(1);
  const vPeri    = ellipticVelocity(a_km, a_km*(1-ecc)).toFixed(3);
  const vApo     = ellipticVelocity(a_km, a_km*(1+ecc)).toFixed(3);
  const hoh      = hohmannDV(6571, a_km);   // LEO -> user orbit

  const DVs = [
    { label:"Surface to LEO",           dv:9.40,             col:CORAL },
    { label:"LEO to GEO",               dv:3.93,             col:GOLD  },
    { label:"LEO to Moon (TLI)",        dv:3.10,             col:AU    },
    { label:"LEO to Mars (Hohmann)",    dv:0.60,             col:CYAN  },
    { label:"LEO to user orbit",        dv:hoh.total,        col:VIOL  },
    { label:"LEO to escape velocity",   dv:3.22,             col:AMBER },
  ];
  const DVmax = Math.max(...DVs.map(d => d.dv));

  return (
    <div style={{ background:BG, minHeight:"100vh", color:TEXT }}>

      {/* ── hero title spread ── */}
      <div style={{ background:`linear-gradient(180deg, ${DEEP} 0%, ${BG} 100%)`, borderBottom:`1px solid ${BORDER}`, padding:"64px 48px 52px" }}>
        <div style={{ maxWidth:1000, margin:"0 auto" }}>
          <div style={{ fontFamily:mono, fontSize:9, letterSpacing:"0.7em", color:`${AU}66`, marginBottom:14, textTransform:"uppercase" }}>
            AETHER SYSTEMS · MECHANICAL ANALYSIS · REF-ORB-001
          </div>
          <div style={{ fontFamily:serif, fontSize:42, color:AU, letterSpacing:"0.04em", marginBottom:6, lineHeight:1.1 }}>
            MECHANICAL OUTPUT
          </div>
          <div style={{ fontFamily:serif, fontSize:28, color:GOLD, letterSpacing:"0.08em", marginBottom:20 }}>
            ORBITAL POSSIBILITY SHEET
          </div>
          <div style={{ width:80, height:2, background:`linear-gradient(90deg,${AU},${GOLD})`, marginBottom:22 }} />
          <div style={{ fontFamily:body, fontSize:17, color:MUTED, lineHeight:1.8, maxWidth:640 }}>
            A complete reference sheet for the mechanical outputs and orbital possibilities
            available to any propulsion system operating within Earth's gravity well --
            from circular parking orbits to interplanetary escape trajectories.
            Includes live orbital simulator, delta-V map, and propulsion comparison.
          </div>
          <div style={{ marginTop:24, display:"flex", gap:32, flexWrap:"wrap" }}>
            {[
              ["MU (Earth)", "398 600 km³/s²", AU],
              ["R_Earth",    "6 371 km",        GOLD],
              ["LEO velocity","7.8 km/s",       CYAN],
              ["GEO radius", "42 164 km",       VIOL],
            ].map(([l,v,c]) => (
              <div key={l as string}>
                <div style={{ fontFamily:mono, fontSize:8, color:MUTED, letterSpacing:"0.3em", marginBottom:4 }}>{l}</div>
                <div style={{ fontFamily:mono, fontSize:14, color:c as string }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth:1000, margin:"0 auto", padding:"0 24px 64px" }}>

        {/* ── SECTION 01: Orbit Classification ── */}
        <SectionTitle number="01" title="ORBIT CLASSIFICATION MATRIX" col={AU}
          sub="Standard orbit families by altitude, period, velocity, and primary mission use." />
        <div style={{ overflowX:"auto", marginBottom:8 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontFamily:mono, fontSize:10 }}>
            <thead>
              <tr style={{ background:DEEP }}>
                {["TYPE","ALTITUDE","PERIOD","VELOCITY","INCLINATION","PRIMARY USE"].map(h => (
                  <th key={h} style={{ textAlign:"left", padding:"10px 14px", color:MUTED, borderBottom:`1px solid ${BORDER}`, fontWeight:"normal", letterSpacing:"0.2em", fontSize:9 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <OrbitRow name="LEO"  alt="160-2000 km"    period="90-127 min"  vel="7.4-7.8 km/s" inc="Any"       use="ISS, Earth obs, Starlink, crewed" col={AU} />
              <OrbitRow name="SSO"  alt="600-800 km"     period="96-101 min"  vel="7.5-7.6 km/s" inc="~97-98°"   use="Weather, imaging (recurring ground track)" col={CYAN} />
              <OrbitRow name="MEO"  alt="2000-35786 km"  period="2-24 hr"     vel="3.1-6.4 km/s" inc="Any"       use="GPS, GLONASS, Galileo, radiation belt" col={BLUE} />
              <OrbitRow name="GEO"  alt="35786 km"       period="23h 56m"     vel="3.07 km/s"    inc="0° ideal"  use="Communications, weather (geostationary)" col={GOLD} />
              <OrbitRow name="GTO"  alt="250 x 35786 km" period="~10.5 hr"    vel="1.6-10.2 km/s"inc="~20-28°"   use="Transfer to GEO (launch default)" col={AMBER} />
              <OrbitRow name="HEO"  alt="500 x 39000 km" period="~12 hr"      vel="variable"     inc="~63.4°"    use="Molniya: coverage high latitudes" col={VIOL} />
              <OrbitRow name="L1-L5" alt="~1.5M km / 60°" period="1 year"     vel="varies"       inc="ecliptic"  use="Webb (L2), SOHO (L1), Trojans (L4/L5)" col={CORAL} />
              <OrbitRow name="ESCAPE" alt="C3 > 0"       period="infinite"    vel=">11.2 km/s"   inc="mission"   use="Interplanetary, solar escape" col={MUTED} />
            </tbody>
          </table>
        </div>

        {/* ── SECTION 02: Interactive Simulator ── */}
        <SectionTitle number="02" title="LIVE ORBITAL SIMULATOR" col={GOLD}
          sub="Adjust semi-major axis and eccentricity. Spacecraft moves at Kepler-accurate speed (fastest at periapsis)." />
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:12, padding:"16px", marginBottom:20 }}>
          <OrbitalCanvas ecc={ecc} a_km={a_km} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:32 }}>
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"18px 20px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:16, textTransform:"uppercase" }}>ORBIT PARAMETERS</div>
            <div style={{ marginBottom:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontFamily:mono, fontSize:10, color:MUTED }}>SEMI-MAJOR AXIS</span>
                <span style={{ fontFamily:mono, fontSize:11, color:GOLD }}>{a_km.toLocaleString()} km</span>
              </div>
              <input type="range" min={6600} max={44000} step={100} value={a_km}
                onChange={e => setAkm(Number(e.target.value))}
                style={{ width:"100%", accentColor:GOLD, cursor:"pointer" }} />
            </div>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                <span style={{ fontFamily:mono, fontSize:10, color:MUTED }}>ECCENTRICITY</span>
                <span style={{ fontFamily:mono, fontSize:11, color:AU }}>{ecc.toFixed(3)}</span>
              </div>
              <input type="range" min={0} max={0.85} step={0.01} value={ecc}
                onChange={e => setEcc(Number(e.target.value))}
                style={{ width:"100%", accentColor:AU, cursor:"pointer" }} />
            </div>
          </div>
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"18px 20px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:16, textTransform:"uppercase" }}>LIVE READOUTS</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {[
                ["PERIAPSIS ALT", `${periAlt} km`,  AU  ],
                ["APOAPSIS ALT",  `${apoAlt} km`,   GOLD],
                ["PERIOD",        `${period} min`,  CYAN],
                ["V @ PERI",      `${vPeri} km/s`,  AU  ],
                ["V @ APO",       `${vApo} km/s`,   GOLD],
                ["DV (LEO->here)",`${hoh.total.toFixed(2)} km/s`, VIOL],
              ].map(([l,v,c]) => (
                <div key={l as string} style={{ padding:"8px 10px", background:`${(c as string)}0d`, border:`1px solid ${(c as string)}22`, borderRadius:6 }}>
                  <div style={{ fontFamily:mono, fontSize:7, color:MUTED, marginBottom:3, letterSpacing:"0.2em" }}>{l}</div>
                  <div style={{ fontFamily:mono, fontSize:12, color:c as string }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── SECTION 03: Delta-V Map ── */}
        <SectionTitle number="03" title="DELTA-V POSSIBILITY MAP" col={CYAN}
          sub="Total delta-V required from LEO to each destination. Lower delta-V = more accessible from orbit." />
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"24px 28px", marginBottom:32 }}>
          {DVs.map(d => <DVBar key={d.label} label={d.label} dv={d.dv} max={DVmax*1.1} col={d.col} />)}
          <div style={{ fontFamily:body, fontSize:12, color:MUTED, marginTop:14, lineHeight:1.7 }}>
            Note: "Surface to LEO" includes gravity loss (~1.5 km/s) and atmospheric drag (~0.15 km/s).
            In-space values assume impulsive burns (instantaneous velocity change).
            Actual missions add navigation margins (5-10%) and plane-change costs.
          </div>
        </div>

        {/* ── SECTION 04: Propulsion Mechanical Outputs ── */}
        <SectionTitle number="04" title="PROPULSION SYSTEM MECHANICAL OUTPUTS" col={AMBER}
          sub="Thrust [N], specific impulse Isp [s], and attainable delta-V per propulsion family." />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:32 }}>
          <PropCard name="CHEMICAL BIPROPELLANT" thrust="100-890 000 N" isp="310-450 s" dv="1.5-9.4 km/s" use="Launch vehicles, apogee kick motors, deep-space maneuvers. High thrust -- short burns." col={CORAL} />
          <PropCard name="ION THRUSTER (GRIDDED)" thrust="0.01-0.5 N" isp="1500-10000 s" dv="10-50 km/s" use="Dawn, Hayabusa, Deep Space 1. High efficiency, months-long burns, solar power needed." col={CYAN} />
          <PropCard name="HALL EFFECT THRUSTER" thrust="0.05-5 N" isp="800-3500 s" dv="5-15 km/s" use="Starlink station-keeping, commercial GEO. Best power-to-efficiency trade for commercial ops." col={AU} />
          <PropCard name="NUCLEAR THERMAL" thrust="15 000-111 000 N" isp="800-1000 s" dv="6-10 km/s" use="Mars crewed mission concept. High thrust + high Isp = fast interplanetary transit." col={VIOL} />
          <PropCard name="SOLAR SAIL" thrust="0.001-0.1 N" isp="infinite" dv="unlimited" use="IKAROS, LightSail 2. No propellant -- limited to inner solar system. Pressure = 9 uPa at 1 AU." col={GOLD} />
          <PropCard name="VASIMR (RF PLASMA)" thrust="5 N @ 200 kW" isp="3000-30000 s" dv="20+ km/s" use="Mars in 39 days at 10 MW. Variable Isp -- trade thrust for efficiency on demand." col={AMBER} />
        </div>

        {/* ── SECTION 05: Possibility Matrix ── */}
        <SectionTitle number="05" title="MISSION POSSIBILITY MATRIX" col={VIOL}
          sub="What each delta-V budget unlocks. Stack propulsion stages to expand the possibility space." />
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:0, border:`1px solid ${BORDER}`, borderRadius:10, overflow:"hidden", marginBottom:32 }}>
          {[
            { dv:"< 1 km/s",  col:DIM,   txt:"Station-keeping, attitude control, small inclination trim, CubeSat deorbit" },
            { dv:"1-3 km/s",  col:STEEL, txt:"GEO apogee kick, Lunar flyby, MEO insertion from GTO, Moon distant retrograde orbit" },
            { dv:"3-5 km/s",  col:MUTED, txt:"GEO from LEO, Trans-Lunar Injection, Low lunar orbit, Mars Transfer Injection" },
            { dv:"5-8 km/s",  col:CYAN,  txt:"Jupiter trajectory, Venus orbit insertion, Mars orbit from TLI, Earth return from Moon" },
            { dv:"8-12 km/s", col:AU,    txt:"Jupiter orbit insertion, Saturn flyby, Uranus/Neptune trajectories, solar escape" },
            { dv:"> 12 km/s", col:GOLD,  txt:"Stellar-system probes (30-50 km/s with gravity assists), Q-thruster era deep space" },
          ].map((r,i) => (
            <>
              <div key={`dv${i}`} style={{ padding:"14px 18px", background:i%2===0?DEEP:PANEL, borderRight:`1px solid ${BORDER}`, borderBottom:i<5?`1px solid ${BORDER}`:"none" }}>
                <span style={{ fontFamily:mono, fontSize:11, color:r.col, whiteSpace:"nowrap" }}>{r.dv}</span>
              </div>
              <div key={`txt${i}`} style={{ padding:"14px 18px", background:i%2===0?DEEP:PANEL, borderBottom:i<5?`1px solid ${BORDER}`:"none" }}>
                <span style={{ fontFamily:body, fontSize:13, color:TEXT, lineHeight:1.6 }}>{r.txt}</span>
              </div>
            </>
          ))}
        </div>

        {/* insight */}
        <div style={{ padding:"24px 28px", background:"#ffffff03", border:`1px solid ${AU}18`, borderRadius:12, textAlign:"center", marginBottom:0 }}>
          <div style={{ fontFamily:serif, fontSize:15, color:AU, marginBottom:10 }}>THE ORBITAL PRINCIPLE</div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:18, color:GOLD, lineHeight:1.9, marginBottom:14 }}>
            "Every orbit is a crystallized balance between falling and flying.<br />
            Delta-V is the currency of possibility -- each km/s spent<br />
            purchases a new region of the gravitational possibility space."
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:MUTED, lineHeight:2 }}>
            vis-viva: v² = mu · (2/r - 1/a) &nbsp;|&nbsp; Hohmann: DV_total = |DV1| + |DV2| &nbsp;|&nbsp; Tsiolkovsky: DV = Isp · g0 · ln(m0/mf)
          </div>
          <div style={{ fontFamily:mono, fontSize:9, color:`${MUTED}80`, marginTop:14 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce · 2026
          </div>
        </div>

        <CodeFilesPanel
          heading="Orbital Mechanics Simulation Files"
          accentColor={AU}
          files={ORB_CODE_FILES}
        />
      </div>
    </div>
  );
}

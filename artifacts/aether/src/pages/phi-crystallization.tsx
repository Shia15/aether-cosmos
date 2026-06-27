import { useEffect, useRef, useState, useCallback } from "react";
import { CodeFilesPanel } from "@/components/code-files-panel";

/* ── palette ─────────────────────────────────────────────────────────── */
const BG    = "#020408";
const PANEL = "#07101C";
const BORDER= "#0C1E34";
const AU    = "#00FFB2";
const GOLD  = "#C8A030";
const AMBER = "#E09020";
const ROSE  = "#E060A0";
const VIOL  = "#9060E0";
const DIM   = "#1A2D44";
const STEEL = "#3A5068";
const TEXT  = "#B8C8D8";
const MUTED = "#3A5068";
const mono  = "'Space Mono', monospace";
const serif = "'Cinzel', serif";
const body  = "'Crimson Pro', Georgia, serif";

/* ── phi constants ───────────────────────────────────────────────────── */
const N           = 320;
const PHI         = (1 + Math.sqrt(5)) / 2;           // 1.6180339...
const GOLDEN_ANGLE = 2 * Math.PI * (1 - 1 / PHI);     // 2.3999... rad = 137.507...deg

/* ── deterministic random positions (module-level, stable) ───────────── */
const seeded = (s: number) => { let x = Math.sin(s * 9301 + 49297) * 233280; return x - Math.floor(x); };
const RAND_X = Array.from({ length: N }, (_, i) => seeded(i * 2));
const RAND_Y = Array.from({ length: N }, (_, i) => seeded(i * 2 + 1));

/* ── Fibonacci lattice targets (normalized, centre 0.5, radius 0.44) ── */
const FIB_R  = Array.from({ length: N }, (_, i) => Math.sqrt((i + 0.5) / N) * 0.44);
const FIB_A  = Array.from({ length: N }, (_, i) => i * GOLDEN_ANGLE);

/* ── colour lerp ─────────────────────────────────────────────────────── */
function lerpCol(c0: [number,number,number], c1: [number,number,number], t: number) {
  const r = Math.round(c0[0] + (c1[0]-c0[0])*t);
  const g = Math.round(c0[1] + (c1[1]-c0[1])*t);
  const b = Math.round(c0[2] + (c1[2]-c0[2])*t);
  return `rgb(${r},${g},${b})`;
}
const C_DIM  : [number,number,number] = [26,  45,  68 ];
const C_GOLD : [number,number,number] = [200, 160, 48 ];
const C_AU   : [number,number,number] = [0,   255, 178];

/* ── main canvas ─────────────────────────────────────────────────────── */
function PhiCanvas({
  omega0, paused,
  onC,
}: {
  omega0: number; paused: boolean;
  onC: (c: number) => void;
}) {
  const ref  = useRef<HTMLCanvasElement>(null);
  const raf  = useRef(0);
  const t    = useRef(0);
  const pRef = useRef(false);

  useEffect(() => { pRef.current = paused; }, [paused]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = canvas.width;
    const H = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const scale = Math.min(W, H) * 0.5;

    function draw() {
      if (!pRef.current) t.current += 0.012;
      const tt = t.current;
      const C  = 0.5 + 0.5 * Math.sin(PHI * omega0 * tt);
      onC(C);

      /* background */
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, W, H);

      /* centre glow */
      const glowR = scale * 0.55 * (0.3 + 0.7 * C);
      const g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      g0.addColorStop(0, `rgba(200,160,48,${0.08 + 0.12*C})`);
      g0.addColorStop(0.4, `rgba(0,255,178,${0.04 + 0.06*C})`);
      g0.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g0;
      ctx.fillRect(0, 0, W, H);

      /* spiral arm connections when coherent */
      if (C > 0.45) {
        const alpha = Math.max(0, (C - 0.45) / 0.55);
        ctx.globalAlpha = alpha * 0.35;
        for (let i = 1; i < N; i++) {
          const r0 = FIB_R[i-1] * scale; const a0 = FIB_A[i-1];
          const r1 = FIB_R[i]   * scale; const a1 = FIB_A[i];
          const lx0 = cx + r0 * Math.cos(a0);
          const ly0 = cy + r0 * Math.sin(a0);
          const lx1 = cx + r1 * Math.cos(a1);
          const ly1 = cy + r1 * Math.sin(a1);
          /* current pos */
          const px0 = cx + (RAND_X[i-1]-0.5)*W*(1-C) + (lx0-cx)*C;
          const py0 = cy + (RAND_Y[i-1]-0.5)*H*(1-C) + (ly0-cy)*C;
          const px1 = cx + (RAND_X[i]  -0.5)*W*(1-C) + (lx1-cx)*C;
          const py1 = cy + (RAND_Y[i]  -0.5)*H*(1-C) + (ly1-cy)*C;
          const dist = Math.hypot(px1-px0, py1-py0);
          if (dist < 48) {
            ctx.beginPath();
            ctx.moveTo(px0, py0);
            ctx.lineTo(px1, py1);
            ctx.strokeStyle = lerpCol(C_GOLD, C_AU, (i / N));
            ctx.lineWidth = 0.5 + alpha * 0.7;
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1;
      }

      /* particles */
      for (let i = 0; i < N; i++) {
        const fibX = cx + FIB_R[i] * scale * Math.cos(FIB_A[i]);
        const fibY = cy + FIB_R[i] * scale * Math.sin(FIB_A[i]);
        const rndX = cx + (RAND_X[i] - 0.5) * W * 0.9;
        const rndY = cy + (RAND_Y[i] - 0.5) * H * 0.85;
        const px = rndX + (fibX - rndX) * C;
        const py = rndY + (fibY - rndY) * C;

        const frac = i / N;
        const col  = frac < 0.5
          ? lerpCol(C_DIM, C_GOLD, C * (1 - frac * 0.4))
          : lerpCol(C_DIM, C_AU,   C * (0.7 + frac * 0.3));
        const sz   = 1.2 + 3.2 * C * (0.6 + 0.4 * (i / N));

        if (C > 0.6 && sz > 2.5) {
          ctx.beginPath();
          ctx.arc(px, py, sz + 3, 0, Math.PI * 2);
          ctx.fillStyle = frac < 0.5 ? `rgba(200,160,48,${0.12*C})` : `rgba(0,255,178,${0.1*C})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(px, py, sz, 0, Math.PI * 2);
        ctx.fillStyle = col;
        ctx.fill();
      }

      /* C(t) label */
      ctx.fillStyle = `rgba(26,45,68,0.7)`;
      ctx.fillRect(cx - 140, H - 44, 280, 30);
      ctx.fillStyle = lerpCol(C_DIM, C_GOLD, C);
      ctx.font = `11px ${mono}`;
      ctx.textAlign = "center";
      ctx.fillText(`C(t) = ${C.toFixed(4)}   |   phi * omega0 * t = ${(PHI * omega0 * tt).toFixed(2)}`, cx, H - 24);

      /* decoherent / coherent labels */
      ctx.font = `9px ${mono}`;
      ctx.fillStyle = STEEL;
      ctx.textAlign = "left";
      ctx.fillText("DECOHERENT", 14, H - 26);
      ctx.textAlign = "right";
      ctx.fillStyle = C > 0.5 ? GOLD : STEEL;
      ctx.fillText("COHERENT", W - 14, H - 26);
      ctx.textAlign = "center";

      /* phi label at centre */
      if (C > 0.7) {
        ctx.globalAlpha = (C - 0.7) / 0.3;
        ctx.fillStyle = GOLD;
        ctx.font = `bold 14px ${mono}`;
        ctx.fillText("phi", cx, cy + 6);
        ctx.globalAlpha = 1;
      }

      raf.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [omega0, onC]);

  return (
    <canvas ref={ref} width={900} height={560}
      style={{ width:"100%", height:"auto", display:"block", borderRadius:10 }} />
  );
}

/* ── code files ──────────────────────────────────────────────────────── */
const PHI_CODE_FILES = [
  {
    id:"crystal", name:"phi_crystallization.qg", icon:"Cc",
    content:`# AETHER -- Golden phi-Crystallization
# C(t) = 0.5 + 0.5 * sin(phi * omega0 * t)
# Oscillates N particles between random scatter and Fibonacci lattice.
# phi = (1+sqrt(5))/2 = 1.6180339...  (golden ratio)
# golden_angle = 2*pi*(1 - 1/phi) = 137.5077...deg

import numpy as np

PHI           = (1 + np.sqrt(5)) / 2
GOLDEN_ANGLE  = 2 * np.pi * (1 - 1/PHI)  # 2.39996... rad

def crystallization_C(t, omega0):
    """
    C(t) in [0, 1]: 0 = fully decoherent, 1 = fully coherent.
    Oscillation frequency = phi * omega0  (irrational multiple -> quasi-periodic)
    Using phi makes the oscillation never perfectly repeat --
    each crystallization cycle differs subtly from the last.
    """
    return 0.5 + 0.5 * np.sin(PHI * omega0 * t)

def fibonacci_lattice(N, scale=1.0):
    """
    Sunflower / Fibonacci lattice: N points packed optimally.
    r_i = sqrt((i + 0.5) / N) * scale  (uniform area distribution)
    theta_i = i * golden_angle          (golden angle spacing)
    No two points ever align radially -- maximum mutual distance.
    """
    i      = np.arange(N)
    r      = np.sqrt((i + 0.5) / N) * scale
    theta  = i * GOLDEN_ANGLE
    x      = r * np.cos(theta)
    y      = r * np.sin(theta)
    return x, y

def crystallize_positions(rand_pos, fib_pos, C):
    """
    Interpolate between random and lattice positions.
    pos(t) = (1 - C) * rand_pos + C * fib_pos
    At C=0: pure random scatter (decoherent plasma)
    At C=1: Fibonacci lattice (crystallised order)
    At C=0.5: halfway -- a diffuse floral cloud
    """
    return (1 - C) * rand_pos + C * fib_pos

# Linking number of spiral arms:
# Consecutive points in Fibonacci lattice are connected by golden spirals.
# Number of visible spiral arms = Fibonacci numbers (5, 8, 13, 21, 34...).
# Sunflower: 34 clockwise + 55 counter-clockwise arms (both Fibonacci).
# Romanesco: 13 cw + 21 ccw. Artichoke: 8 cw + 13 ccw.

N = 320
x_rand = np.random.uniform(-1, 1, N)
y_rand = np.random.uniform(-1, 1, N)
x_fib, y_fib = fibonacci_lattice(N)

for omega0 in [0.5, 1.0, 1.5]:
    for t in np.linspace(0, 4*np.pi/PHI, 200):
        C = crystallization_C(t, omega0)
        x = crystallize_positions(x_rand, x_fib, C)
        y = crystallize_positions(y_rand, y_fib, C)`,
  },
  {
    id:"drone", name:"drone_choreography.qg", icon:"Dr",
    content:`# AETHER -- Drone Formation Choreography via C(t)
# 320 drones form phi-spiral lattice synchronized to music tempo.
# Each drone receives a target position from the crystallization engine.
# Crystallization broadcasts C(t) -> drones lerp to target autonomously.

import numpy as np
from aether.drone import DroneSwarm, UWB_Mesh, TempoSync

PHI          = (1 + np.sqrt(5)) / 2
GOLDEN_ANGLE = 2 * np.pi * (1 - 1/PHI)

class DroneFormationEngine:
    """
    320-drone phi-spiral formation controller.
    Each drone is assigned a Fibonacci lattice index i in [0, 320).
    Target position: (r_i * cos(theta_i), r_i * sin(theta_i), z_alt)
    Transition: drone moves from holding position to target as C(t) rises.
    """
    def __init__(self, n=320, formation_radius_m=80.0, altitude_m=120.0):
        self.n  = n
        self.R  = formation_radius_m  # sky lattice radius [m]
        self.z  = altitude_m          # show altitude [m AGL]
        self.targets = self._compute_targets()

    def _compute_targets(self):
        """Fibonacci lattice sky positions (x, y, z)."""
        i     = np.arange(self.n)
        r     = np.sqrt((i + 0.5) / self.n) * self.R
        theta = i * GOLDEN_ANGLE
        x     = r * np.cos(theta)
        y     = r * np.sin(theta)
        z     = np.full(self.n, self.z)
        return np.stack([x, y, z], axis=1)   # shape (320, 3)

    def positions_at(self, C, rand_hold):
        """
        Drone world positions at crystallization C.
        rand_hold: initial holding positions [320, 3]
        """
        return (1 - C) * rand_hold + C * self.targets

    def led_color(self, i, C):
        """
        Drone LED colour: interpolate DIM blue -> gold -> aurora with C.
        Inner drones (small i): golden spiral arm.
        Outer drones (large i): aurora spiral arm.
        """
        frac = i / self.n
        r = int(200 * C * (1 - frac*0.4) + 26*(1-C))
        g = int(160 * C * (1 - frac) + 255 * C * frac + 45*(1-C))
        b = int(48  * C * (1 - frac) + 178 * C * frac + 68*(1-C))
        return (r, g, b)

class TempoSync:
    """
    Ties omega0 to musical beat frequency.
    omega0 = 2*pi * BPM / 60 * k  where k = sync divisor
    At 120 BPM, k=1: omega0 = 2pi * 2 = 12.57 rad/s
    One full crystallization cycle per beat.
    At k=4: one cycle per 4 beats (musical phrase boundary).
    """
    def __init__(self, bpm, k=4):
        self.bpm   = bpm
        self.k     = k
        self.omega0 = 2 * np.pi * (bpm / 60) / k

    def C(self, t):
        return 0.5 + 0.5 * np.sin(PHI * self.omega0 * t)

# Example: Beyonce -- "Cuff It" chorus
# BPM = 102, k = 4 -> omega0 = 1.335 rad/s
# One phi-crystallization per 4 beats = ~2.35 seconds
# 320 drones bloom from scatter to sunflower on chorus downbeat`,
  },
  {
    id:"mosaic", name:"sky_mosaic_protocol.qg", icon:"Sk",
    content:`# AETHER -- Sky Mosaic via Drone LED Arrays
# 320 drones with RGB LEDs form mosaic images in the night sky.
# Protocol: decompose target image into phi-spiral colour samples.
# Sampling strategy uses Fibonacci lattice -- optimal coverage, no bias.

import numpy as np
from PIL import Image

PHI          = (1 + np.sqrt(5)) / 2
GOLDEN_ANGLE = 2 * np.pi * (1 - 1/PHI)

def phi_sample_image(img_path, N=320):
    """
    Sample N pixels from an image at Fibonacci lattice positions.
    Returns: (pixel_colours, lattice_positions) for drone assignment.
    This is optimal: Fibonacci sampling has lowest discrepancy of any
    deterministic N-point set on a disk (Kuipers-Niederreiter theorem).
    """
    img = np.array(Image.open(img_path).convert("RGB"))
    H, W = img.shape[:2]

    i     = np.arange(N)
    r     = np.sqrt((i + 0.5) / N)     # [0, 1] radius
    theta = i * GOLDEN_ANGLE
    px    = np.clip((0.5 + r*np.cos(theta)/2) * W, 0, W-1).astype(int)
    py    = np.clip((0.5 + r*np.sin(theta)/2) * H, 0, H-1).astype(int)
    colors = img[py, px]    # shape (N, 3) -- RGB per drone
    return colors, np.stack([r*np.cos(theta), r*np.sin(theta)], axis=1)

class MosaicShow:
    """
    Full show program: scene sequence with crystallization transitions.
    Each scene: target LED colors (from image) + formation geometry.
    Transition between scenes: C(t) drives simultaneous position + colour fade.
    """
    def __init__(self, scenes, bpm=120):
        self.scenes = scenes   # list of (img_path, duration_beats) tuples
        self.bpm    = bpm
        self.beat   = 60 / bpm  # seconds per beat

    def scene_at(self, t_total):
        """Return current scene and phase within scene."""
        t = 0
        for img, dur in self.scenes:
            scene_duration = dur * self.beat
            if t_total < t + scene_duration:
                return img, (t_total - t) / scene_duration
            t += scene_duration
        return self.scenes[-1]

    def led_output(self, t_total, rand_hold):
        """
        Full drone command at time t:
        - positions: crystallized from rand_hold to fibonacci at C(t)
        - colors: sampled from current scene image
        """
        img_path, phase = self.scene_at(t_total)
        colors, fib_xy = phi_sample_image(img_path)
        omega0 = 2 * np.pi * self.bpm / 60 / 4
        C = 0.5 + 0.5 * np.sin(PHI * omega0 * t_total)
        return colors, C   # drone i gets colors[i] and moves by C`,
  },
  {
    id:"arch", name:"aether_crystallization_arch.qg", icon:"Ac",
    content:`# AETHER -- Crystallization Architecture: From Particles to Consciousness
# The phi-crystallization principle applies at every scale.
# Same C(t) function: particles, drones, neurons, cities, knowledge graphs.

from aether.kernel import CoherenceField, CrystallizationEngine
import numpy as np

PHI = (1 + np.sqrt(5)) / 2

# The Crystallization Model (5 scales):
SCALE_TABLE = {
    "quantum":   ("wavefunction collapse",   "psi -> |n>",     "C = |<psi|n>|^2"),
    "particle":  ("phi-lattice formation",   "scatter -> fib", "C = 1/N sum(order_i)"),
    "drone":     ("swarm crystallisation",   "hold -> target", "C = sum(|xi-ti|)/sum(|ri-ti|)"),
    "neural":    ("brainwave coherence",     "delta -> gamma", "C = |corr(EEG_band)|"),
    "cognitive": ("knowledge crystallisation","fragments->map","C = connected_edges/N^2"),
    "aether":    ("full system coherence",   "chaos -> form",  "C = product(C_i) over scales"),
}

class CrystallizationEngine:
    """
    Universal crystallization engine.
    Input: decoherent state D (scattered/random)
    Target: coherent state F (ordered/structured)
    Driver: C(t) function
    Output: intermediate state X(t) = lerp(D, F, C(t))
    """
    def __init__(self, omega0=1.0, phi_modulate=True):
        self.omega0    = omega0
        self.use_phi   = phi_modulate

    def C(self, t):
        """
        Standard: C(t) = 0.5 + 0.5*sin(omega0*t)
        Phi-modulated: C(t) = 0.5 + 0.5*sin(phi*omega0*t)
        Phi modulation: oscillation is quasi-periodic -- never exactly repeats.
        This prevents the system from locking into rigid periodicity.
        Biological systems use quasi-periodic rhythms: circadian, cardiac, neural.
        """
        freq = PHI * self.omega0 if self.use_phi else self.omega0
        return 0.5 + 0.5 * np.sin(freq * t)

    def step(self, D, F, t):
        """Single crystallization step."""
        c = self.C(t)
        return (1 - c) * D + c * F, c

    def trajectory(self, D, F, t_max, dt=0.01):
        """Full crystallization trajectory."""
        times  = np.arange(0, t_max, dt)
        states = np.array([(1 - self.C(t)) * D + self.C(t) * F for t in times])
        Cs     = np.array([self.C(t) for t in times])
        return times, states, Cs

# Why phi? The golden ratio phi is the "most irrational" number --
# it is the hardest to approximate by rationals.
# phi modulation -> field never fully locks -> remains open to new input.
# Biological analogy: cardiac rhythm is quasi-periodic (not exactly periodic)
# -> allows the heart to respond to demands without breaking resonance.
# AETHER: C(t) with phi ensures continuous learning -- order without rigidity.`,
  },
];

/* ── architecture cards ──────────────────────────────────────────────── */
const ARCH_CARDS = [
  {
    title:"Crystallization Model",
    col: GOLD,
    body:"C(t) = 0 means total disorder. C(t) = 1 means full lattice order. The phi-modulation makes each cycle subtly different -- order emerges without rigidity. This is how biological rhythms stay coherent without becoming mechanical.",
    eq:"C(t) = 1/2 + 1/2 · sin(phi · omega0 · t)",
  },
  {
    title:"Drone Sky Choreography",
    col: AU,
    body:"320 drones at 120m altitude. Each drone has a Fibonacci lattice index. The master controller broadcasts C(t) -- drones autonomously lerp from holding formation to their phi-spiral target. Bloom on the chorus downbeat.",
    eq:"pos(t) = (1-C) · hold_i + C · fib_i",
  },
  {
    title:"Sky Mosaic via LED Array",
    col: ROSE,
    body:"Each drone samples one pixel from a target image using Fibonacci sampling -- the lowest-discrepancy point set on a disk. As C rises the image assembles in the sky. Scene transitions dissolve one image into the next.",
    eq:"color_i = phi_sample(image, i)  |  N = 320",
  },
  {
    title:"Music Coherence Protocol",
    col: VIOL,
    body:"omega0 is tied to BPM: omega0 = 2pi * (BPM/60) / k where k = phrase length in beats. At 120 BPM, k=4: one crystallization bloom per musical phrase. The phi factor makes each bloom land slightly off the grid -- like swing.",
    eq:"omega0 = 2pi · BPM / 60 / k",
  },
  {
    title:"AETHER Architecture Scale",
    col: AMBER,
    body:"The same C(t) engine runs at every AETHER scale: quantum wavefunctions, neural oscillations, knowledge graph coherence. phi-crystallization is scale-invariant -- the pattern from 320 particles is the same as 320 neurons.",
    eq:"C_total = product(C_quantum, C_neural, C_cognitive)",
  },
  {
    title:"Floral Spiral Mathematics",
    col: AU,
    body:"Consecutive Fibonacci lattice points connect via golden spirals. The number of visible spiral arms is always a Fibonacci pair (8+13, 13+21, 21+34). Sunflowers: 34+55. Romanesco: 13+21. 320 points: 21+34 arm pair.",
    eq:"arms_cw = F(n)  |  arms_ccw = F(n+1)  |  ratio -> phi",
  },
];

/* ── main page ───────────────────────────────────────────────────────── */
export default function PhiCrystallizationPage() {
  const [omega0,  setOmega0 ] = useState(0.8);
  const [paused,  setPaused ] = useState(false);
  const [C,       setC      ] = useState(0.5);

  const handleC = useCallback((c: number) => setC(c), []);

  const cColor = C > 0.7 ? GOLD : C > 0.4 ? "#8A9080" : STEEL;

  return (
    <div style={{ background:BG, minHeight:"100vh", padding:"48px 24px", color:TEXT }}>
      <div style={{ maxWidth:1000, margin:"0 auto" }}>

        {/* header */}
        <div style={{ marginBottom:28, borderBottom:`1px solid ${BORDER}`, paddingBottom:24 }}>
          <div style={{ fontFamily:mono, fontSize:9, letterSpacing:"0.5em", color:GOLD, marginBottom:10, textTransform:"uppercase" }}>
            AETHER CRYSTALLIZATION ENGINE · phi-SPIRAL
          </div>
          <div style={{ fontFamily:serif, fontSize:30, color:GOLD, marginBottom:10, lineHeight:1.2 }}>
            Decoherent &#x2192; Coherent<br />
            <span style={{ fontSize:20, color:AU }}>Golden phi-Crystallization</span>
          </div>
          <div style={{ fontFamily:body, fontSize:16, color:MUTED, lineHeight:1.7 }}>
            320 particles oscillate between random scatter and a Fibonacci phi-spiral lattice
            driven by C(t) = 1/2 + 1/2 · sin(phi · omega0 · t).
            The same protocol choreographs drone formations, sky mosaics, and musical light shows --
            every bloom a floral spiral written in light.
          </div>
        </div>

        {/* formula bar */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:8, padding:"12px 20px", marginBottom:20, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{ fontFamily:mono, fontSize:12, color:GOLD }}>C(t) = 1/2 + 1/2 · sin( phi · omega0 · t )</div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontFamily:mono, fontSize:11, color:MUTED }}>C(t) =</span>
            <span style={{ fontFamily:mono, fontSize:20, color:cColor, minWidth:60, textAlign:"right" }}>{C.toFixed(4)}</span>
            <div style={{ width:140, height:6, background:DIM, borderRadius:3, overflow:"hidden" }}>
              <div style={{ height:"100%", width:`${C*100}%`, background:`linear-gradient(90deg, ${STEEL}, ${GOLD})`, borderRadius:3, transition:"width 0.1s" }} />
            </div>
          </div>
        </div>

        {/* canvas */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:12, padding:"14px", marginBottom:22, position:"relative" }}>
          <PhiCanvas omega0={omega0} paused={paused} onC={handleC} />
        </div>

        {/* controls */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:20, marginBottom:32 }}>
          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 20px" }}>
            <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:12, textTransform:"uppercase" }}>
              OMEGA0 -- CRYSTALLIZATION RATE
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <input type="range" min={0.1} max={3.0} step={0.05} value={omega0}
                onChange={e => setOmega0(Number(e.target.value))}
                style={{ flex:1, accentColor:GOLD, cursor:"pointer" }} />
              <span style={{ fontFamily:mono, fontSize:13, color:GOLD, minWidth:50 }}>{omega0.toFixed(2)}</span>
              <span style={{ fontFamily:mono, fontSize:10, color:MUTED }}>rad/s</span>
            </div>
            <div style={{ fontFamily:body, fontSize:12, color:MUTED, marginTop:8, lineHeight:1.6 }}>
              phi · omega0 = {(PHI * omega0).toFixed(3)} rad/s &nbsp;|&nbsp;
              cycle period = {((2 * Math.PI / (PHI * omega0))).toFixed(1)} s &nbsp;|&nbsp;
              BPM equiv = {Math.round(60 / (2 * Math.PI / (PHI * omega0)) * 4)} beats/phrase
            </div>
          </div>

          <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"16px 20px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, minWidth:120 }}>
            <button onClick={() => setPaused(p => !p)}
              style={{ padding:"10px 20px", fontFamily:mono, fontSize:11, background:paused ? `${GOLD}22` : `${AU}22`, border:`1px solid ${paused ? GOLD : AU}`, color: paused ? GOLD : AU, borderRadius:6, cursor:"pointer", letterSpacing:"0.2em" }}>
              {paused ? "PLAY" : "PAUSE"}
            </button>
            <div style={{ fontFamily:mono, fontSize:9, color:MUTED }}>N = {N} particles</div>
            <div style={{ fontFamily:mono, fontSize:9, color:MUTED }}>phi = {PHI.toFixed(6)}</div>
          </div>
        </div>

        {/* architecture cards */}
        <div style={{ marginBottom:14, fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.4em", textTransform:"uppercase" }}>
          AETHER ARCHITECTURAL LEARNINGS
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:32 }}>
          {ARCH_CARDS.map(c => (
            <div key={c.title} style={{ background:PANEL, border:`1px solid ${c.col}28`, borderRadius:10, padding:"18px 18px", borderTop:`2px solid ${c.col}` }}>
              <div style={{ fontFamily:mono, fontSize:10, color:c.col, marginBottom:8, letterSpacing:"0.1em" }}>{c.title}</div>
              <div style={{ fontFamily:body, fontSize:13, color:TEXT, lineHeight:1.65, marginBottom:10 }}>{c.body}</div>
              <div style={{ fontFamily:mono, fontSize:9.5, color:c.col, background:`${c.col}0e`, padding:"4px 8px", borderRadius:4 }}>{c.eq}</div>
            </div>
          ))}
        </div>

        {/* Fibonacci arm table */}
        <div style={{ background:PANEL, border:`1px solid ${BORDER}`, borderRadius:10, padding:"20px 24px", marginBottom:32 }}>
          <div style={{ fontFamily:mono, fontSize:9, color:MUTED, letterSpacing:"0.3em", marginBottom:16, textTransform:"uppercase" }}>
            FIBONACCI SPIRAL ARM PAIRS IN NATURE
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10 }}>
            {[
              {s:"Artichoke",   cw:8,  ccw:13, n:"89+"},
              {s:"Romanesco",   cw:13, ccw:21, n:"233+"},
              {s:"Sunflower",   cw:34, ccw:55, n:"~1597"},
              {s:"320 Drones",  cw:21, ccw:34, n:"320"},
              {s:"Pine Cone",   cw:5,  ccw:8,  n:"55+"},
            ].map(r => (
              <div key={r.s} style={{ textAlign:"center", padding:"12px 8px", background:`${GOLD}08`, border:`1px solid ${GOLD}20`, borderRadius:7 }}>
                <div style={{ fontFamily:mono, fontSize:9, color:GOLD, marginBottom:6 }}>{r.s}</div>
                <div style={{ fontFamily:mono, fontSize:13, color:TEXT }}>{r.cw} + {r.ccw}</div>
                <div style={{ fontFamily:mono, fontSize:8, color:MUTED, marginTop:4 }}>N ~ {r.n}</div>
              </div>
            ))}
          </div>
        </div>

        {/* insight */}
        <div style={{ padding:"24px 28px", background:"#ffffff04", border:`1px solid ${GOLD}20`, borderRadius:12, textAlign:"center", marginBottom:0 }}>
          <div style={{ fontFamily:serif, fontSize:15, color:GOLD, marginBottom:10 }}>THE FLORAL PRINCIPLE</div>
          <div style={{ fontFamily:body, fontStyle:"italic", fontSize:18, lineHeight:1.9, marginBottom:14,
            background:`linear-gradient(135deg, ${GOLD}, ${AU}, ${GOLD})`,
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
            "The sunflower does not calculate phi.<br />
            It simply grows toward light, and order crystallises<br />
            because phi is the only angle that never wastes space."
          </div>
          <div style={{ fontFamily:mono, fontSize:10, color:MUTED, lineHeight:2 }}>
            F(n+1) / F(n) &#x2192; phi as n &#x2192; infinity &nbsp;|&nbsp; arms_cw = F(n) &nbsp;|&nbsp; arms_ccw = F(n+1)
          </div>
          <div style={{ fontFamily:mono, fontSize:9, color:`${MUTED}80`, marginTop:14 }}>
            Shia Miller · AetherLife.co · Cosmic Chaos Corporation™ · @StrategicProce · 2026
          </div>
        </div>

        <CodeFilesPanel
          heading="phi-Crystallization Simulation Files"
          accentColor={GOLD}
          files={PHI_CODE_FILES}
        />
      </div>
    </div>
  );
}

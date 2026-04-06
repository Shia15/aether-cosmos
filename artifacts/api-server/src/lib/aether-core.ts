// AETHER-Core v1.0 — TypeScript port of the Python build sequence
// Architecture: Mnesis → Infernia → Aletheia → Reverie
// Fixed: proper dt-integration so Ginzburg-Landau / Gray-Scott dynamics
// converge rather than explode.

// ─── config ────────────────────────────────────────────────────────────────

export interface AetherConfig {
  gridSize: number;
  timeSteps: number;
  tau: number;
  // Gray-Scott parameters (reaction-diffusion, Infernia)
  du: number;
  dv: number;
  feed: number;
  kill: number;
  // CGLE parameters (stabilisation coupling)
  mu: number;
  alpha: number;
  beta: number;
  kappa: number;
  // integration step — CRITICAL for stability
  dt: number;
}

export const DEFAULT_CONFIG: AetherConfig = {
  gridSize: 64,
  timeSteps: 500,
  tau: 1.0,
  du: 0.16,
  dv: 0.08,
  feed: 0.060,
  kill: 0.062,
  mu: 0.5,   // reduced from 1.0 to keep linear growth below cubic damping
  alpha: 0.5,
  beta: -0.5,
  kappa: 0.8,
  dt: 0.05,  // explicit timestep — missing from the Python skeleton
};

// ─── Mnesis (memory layer) ──────────────────────────────────────────────────
// Two-component field: u (activator) and v (inhibitor) for Gray-Scott RD.
// The primary displayed field is u; v drives pattern selection.

export class Mnesis {
  u: Float64Array;  // activator (primary field — amplitude display)
  v: Float64Array;  // inhibitor (Gray-Scott second component — phase display)
  history: Float64Array[];
  readonly size: number;

  constructor(size: number) {
    this.size = size;
    const { u, v } = this.initializeFields();
    this.u = u;
    this.v = v;
    this.history = [];
  }

  private initializeFields(): { u: Float64Array; v: Float64Array } {
    const n = this.size * this.size;
    const u = new Float64Array(n).fill(1.0);   // Gray-Scott: u starts near 1
    const v = new Float64Array(n).fill(0.0);   // v starts near 0

    // Central seed: square perturbation (Python: field[c-5:c+5, c-5:c+5] = 1.0)
    const c = Math.floor(this.size / 2);
    for (let di = -5; di < 5; di++) {
      for (let dj = -5; dj < 5; dj++) {
        const row = c + di;
        const col = c + dj;
        if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
          const idx = row * this.size + col;
          u[idx] = 0.5 + (Math.random() - 0.5) * 0.1;
          v[idx] = 0.25 + (Math.random() - 0.5) * 0.1;
        }
      }
    }
    return { u, v };
  }

  store(): void {
    if (this.history.length >= 10) this.history.shift();
    this.history.push(this.u.slice());
  }

  update(u: Float64Array, v: Float64Array): void {
    this.u = u;
    this.v = v;
  }

  reset(): void {
    const { u, v } = this.initializeFields();
    this.u = u;
    this.v = v;
    this.history = [];
  }
}

// ─── Laplacian (periodic boundary, matches Python np.roll) ──────────────────

function laplacian(A: Float64Array, size: number): Float64Array {
  const L = new Float64Array(A.length);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const c     =                        i  * size + j;
      const up    = ((i - 1 + size) % size) * size + j;
      const down  = ((i + 1)        % size) * size + j;
      const left  =                        i  * size + ((j - 1 + size) % size);
      const right =                        i  * size + ((j + 1)        % size);
      L[c] = -4 * A[c] + A[up] + A[down] + A[left] + A[right];
    }
  }
  return L;
}

// ─── Infernia (hybrid dynamics engine) ─────────────────────────────────────
// Gray-Scott reaction-diffusion + real Ginzburg-Landau CGLE stabilisation.
// Both components use explicit Euler with cfg.dt for numerical stability.
//
// Gray-Scott:
//   du/dt = Du·∇²u − u·v² + F·(1−u)           [reaction-diffusion activator]
//   dv/dt = Dv·∇²v + u·v² − (F+K)·v            [reaction-diffusion inhibitor]
//
// CGLE stabilisation added to u (τ dopant coupling):
//   du/dt += μ·u − u³ + τ·κ·∇²u               [Ginzburg-Landau on u]
//
// The τ parameter gates how much CGLE correction is applied — low τ leaves
// pure Gray-Scott turbulence; high τ crystallises stable attractors.

export function evolve(
  u: Float64Array,
  v: Float64Array,
  cfg: AetherConfig,
): { u: Float64Array; v: Float64Array } {
  const { du: Du, dv: Dv, feed: F, kill: K, mu, kappa, tau, dt } = cfg;
  const size = cfg.gridSize;

  const Lu = laplacian(u, size);
  const Lv = laplacian(v, size);

  const nextU = new Float64Array(u.length);
  const nextV = new Float64Array(v.length);

  for (let i = 0; i < u.length; i++) {
    const ui = u[i];
    const vi = v[i];
    const uvv = ui * vi * vi;

    // Gray-Scott reaction-diffusion
    const rdU = Du * Lu[i] - uvv + F * (1 - ui);
    const rdV = Dv * Lv[i] + uvv - (F + K) * vi;

    // CGLE / Ginzburg-Landau stabilisation on u (τ-gated)
    // dA/dt += μA − A³ + τ·κ·∇²A
    // (real part of CGLE; field is real so |A|² = A²)
    const cgle = mu * ui - ui * ui * ui + tau * kappa * Lu[i];

    // Explicit Euler integration with dt
    let nextUi = ui + dt * (rdU + cgle);
    let nextVi = vi + dt * rdV;

    // Soft clamp — prevent runaway while preserving sign (tanh-like bounding)
    nextUi = Math.max(-2, Math.min(2, nextUi));
    nextVi = Math.max(0, Math.min(1, nextVi));

    nextU[i] = nextUi;
    nextV[i] = nextVi;
  }

  return { u: nextU, v: nextV };
}

// ─── Aletheia (stability gate) ──────────────────────────────────────────────

export function phaseCoherence(field: Float64Array): number {
  // Kuramoto order parameter ψ = |⟨e^{iθ}⟩|
  // θ_j = field_j * π  (maps [−1,1] to [−π,π] for better distribution)
  let re = 0, im = 0;
  for (let i = 0; i < field.length; i++) {
    const theta = field[i] * Math.PI;
    re += Math.cos(theta);
    im += Math.sin(theta);
  }
  const n = field.length;
  return Math.sqrt((re / n) ** 2 + (im / n) ** 2);
}

export function stabilityScore(history: Float64Array[]): number {
  if (history.length < 5) return 0;
  const recent = history.slice(-5);
  let totalDiff = 0;
  for (let t = 1; t < recent.length; t++) {
    let diff = 0;
    const len = recent[t].length;
    for (let j = 0; j < len; j++) diff += Math.abs(recent[t][j] - recent[t - 1][j]);
    totalDiff += diff / len;
  }
  // normalise: small diffs → high stability
  const raw = 1 - totalDiff / (recent.length - 1);
  return Math.max(0, Math.min(1, raw));
}

export function validate(
  field: Float64Array,
  history: Float64Array[],
  tau: number,
): { valid: boolean; score: number; psi: number; stability: number } {
  const psi = phaseCoherence(field);
  const stability = stabilityScore(history);
  const score = psi * stability;
  const threshold = 0.5 * tau;
  return { valid: score > threshold, score, psi, stability };
}

// ─── AetherCore (runtime loop) ──────────────────────────────────────────────

export interface CoreState {
  step: number;
  valid: boolean;
  score: number;
  psi: number;
  stability: number;
  field: number[];   // u-component (activator) — for amplitude canvas
  vField: number[];  // v-component (inhibitor) — for phase/coherence canvas
  config: AetherConfig;
  attractors: Array<{ step: number; score: number }>;
}

export class AetherCore {
  config: AetherConfig;
  private memory: Mnesis;
  private step: number;
  private attractors: Array<{ step: number; score: number }>;
  private lastValidation: { valid: boolean; score: number; psi: number; stability: number };

  constructor(cfg: Partial<AetherConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...cfg };
    this.memory = new Mnesis(this.config.gridSize);
    this.step = 0;
    this.attractors = [];
    this.lastValidation = { valid: false, score: 0, psi: 0, stability: 0 };
  }

  reset(cfg?: Partial<AetherConfig>): void {
    if (cfg) this.config = { ...this.config, ...cfg };
    this.memory = new Mnesis(this.config.gridSize);
    this.step = 0;
    this.attractors = [];
    this.lastValidation = { valid: false, score: 0, psi: 0, stability: 0 };
  }

  advance(n: number = 1): void {
    for (let k = 0; k < n; k++) {
      this.memory.store();
      const { u, v } = evolve(this.memory.u, this.memory.v, this.config);
      const validation = validate(u, this.memory.history, this.config.tau);
      this.lastValidation = validation;
      this.memory.update(u, v);
      this.step++;
      if (validation.valid) {
        this.attractors.push({ step: this.step, score: validation.score });
        if (this.attractors.length > 50) this.attractors.shift();
      }
    }
  }

  updateConfig(patch: Partial<AetherConfig>): void {
    const needsReset = patch.gridSize && patch.gridSize !== this.memory.size;
    this.config = { ...this.config, ...patch };
    if (needsReset) {
      const saved = this.step;
      this.reset(this.config);
      this.step = saved;
    }
  }

  getState(): CoreState {
    return {
      step: this.step,
      ...this.lastValidation,
      field: Array.from(this.memory.u),
      vField: Array.from(this.memory.v),
      config: { ...this.config },
      attractors: [...this.attractors],
    };
  }
}

export const aetherCore = new AetherCore();

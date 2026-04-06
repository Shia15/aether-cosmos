// AETHER-Core v1.0 — TypeScript port of the Python build sequence
// Architecture: Mnesis → Infernia → Aletheia → Reverie
// Matches config.py, mnesis.py, infernia.py, aletheia.py exactly

// ─── config ────────────────────────────────────────────────────────────────

export interface AetherConfig {
  gridSize: number;
  timeSteps: number;
  tau: number;
  du: number;
  dv: number;
  feed: number;
  kill: number;
  mu: number;
  alpha: number;
  beta: number;
  kappa: number;
}

export const DEFAULT_CONFIG: AetherConfig = {
  gridSize: 64,   // 64×64 — web-optimised (Python default 128)
  timeSteps: 500,
  tau: 1.0,
  du: 0.16,
  dv: 0.08,
  feed: 0.060,
  kill: 0.062,
  mu: 1.0,
  alpha: 0.5,
  beta: -0.5,
  kappa: 0.8,
};

// ─── Mnesis (memory layer) ──────────────────────────────────────────────────

export class Mnesis {
  field: Float64Array;
  history: Float64Array[];
  readonly size: number;

  constructor(size: number) {
    this.size = size;
    this.field = this.initializeField();
    this.history = [];
  }

  private initializeField(): Float64Array {
    const n = this.size * this.size;
    const f = new Float64Array(n);
    // random noise base
    for (let i = 0; i < n; i++) f[i] = Math.random();
    // central perturbation seed (matches Python: field[c-5:c+5, c-5:c+5] = 1.0)
    const c = Math.floor(this.size / 2);
    for (let di = -5; di < 5; di++) {
      for (let dj = -5; dj < 5; dj++) {
        const row = c + di;
        const col = c + dj;
        if (row >= 0 && row < this.size && col >= 0 && col < this.size) {
          f[row * this.size + col] = 1.0;
        }
      }
    }
    return f;
  }

  store(): void {
    // Keep at most 10 frames of history (memory-bounded)
    if (this.history.length >= 10) this.history.shift();
    this.history.push(this.field.slice());
  }

  update(newField: Float64Array): void {
    this.field = newField;
  }

  reset(): void {
    this.field = this.initializeField();
    this.history = [];
  }
}

// ─── Infernia (hybrid dynamics engine) ─────────────────────────────────────

function laplacian(A: Float64Array, size: number): Float64Array {
  const L = new Float64Array(A.length);
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      const c     =                       i  * size + j;
      const up    = ((i - 1 + size) % size) * size + j;
      const down  = ((i + 1) % size)        * size + j;
      const left  =                       i  * size + ((j - 1 + size) % size);
      const right =                       i  * size + ((j + 1) % size);
      L[c] = -4 * A[c] + A[up] + A[down] + A[left] + A[right];
    }
  }
  return L;
}

export function evolve(field: Float64Array, cfg: AetherConfig): Float64Array {
  const { du, mu, kappa, tau } = cfg;
  const size = cfg.gridSize;
  const L = laplacian(field, size);
  const result = new Float64Array(field.length);

  for (let i = 0; i < field.length; i++) {
    const a = field[i];
    const l = L[i];

    // Reaction-diffusion (Gray-Scott / Turing inspired)
    const reaction = du * l - a * a * a;

    // CGLE stabilisation — real part of (1 + iα)·L  → just L (since field is real)
    const diffusion_real = l;

    // real part of −(1 + iβ)·|A|²·A  → −A³  (A real → |A|² = A²)
    const nonlinear_real = -(a * a * a);

    // τ dopant coupling
    const coupling = tau * kappa * l;

    result[i] = a + mu * a + reaction + diffusion_real + nonlinear_real + coupling;
  }
  return result;
}

// ─── Aletheia (stability gate) ──────────────────────────────────────────────

export function phaseCoherence(field: Float64Array): number {
  // Kuramoto-style order parameter: ψ = |⟨e^{iθ}⟩|
  // θ_j = field_j treated as a phase angle
  let re = 0, im = 0;
  for (let i = 0; i < field.length; i++) {
    re += Math.cos(field[i]);
    im += Math.sin(field[i]);
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
  return 1 - totalDiff / (recent.length - 1);
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
  // field as flat array (gridSize²)
  field: number[];
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

  // Advance n steps (Mnesis → Infernia → Aletheia each tick)
  advance(n: number = 1): void {
    for (let k = 0; k < n; k++) {
      this.memory.store();
      const newField = evolve(this.memory.field, this.config);
      const v = validate(newField, this.memory.history, this.config.tau);
      this.lastValidation = v;
      this.memory.update(newField);
      this.step++;
      if (v.valid) {
        this.attractors.push({ step: this.step, score: v.score });
        // cap attractor log
        if (this.attractors.length > 50) this.attractors.shift();
      }
    }
  }

  updateConfig(patch: Partial<AetherConfig>): void {
    this.config = { ...this.config, ...patch };
    // gridSize change requires full reset
    if (patch.gridSize && patch.gridSize !== this.memory.size) {
      const s = this.step;
      this.reset({ ...this.config, ...patch });
      this.step = s; // keep step counter
    }
  }

  getState(): CoreState {
    return {
      step: this.step,
      ...this.lastValidation,
      field: Array.from(this.memory.field),
      config: { ...this.config },
      attractors: [...this.attractors],
    };
  }
}

// Singleton shared across requests
export const aetherCore = new AetherCore();

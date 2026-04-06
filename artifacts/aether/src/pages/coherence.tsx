import { useGetCoherenceSummary } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Zap, TrendingUp, AlertTriangle, GitMerge, BarChart2, Waves, Sigma } from "lucide-react";
import { motion } from "framer-motion";

// ─── Field-statistic helpers (computed client-side from graph data) ───────────
// These mirror the simulation engine's metrics applied to the knowledge graph's
// own coherence distribution, bridging the semantic and physical layers.

function computePE(values: number[]): number {
  // Permutation entropy (embedding dim 3) on sorted values
  if (values.length < 3) return 0;
  const patterns: Record<string, number> = {};
  for (let i = 0; i < values.length - 2; i++) {
    const a = values[i], b = values[i+1], c = values[i+2];
    const key =
      a <= b && b <= c ? "012" :
      a <= c && c <= b ? "021" :
      b <= a && a <= c ? "102" :
      b <= c && c <= a ? "120" :
      c <= a && a <= b ? "201" : "210";
    patterns[key] = (patterns[key] ?? 0) + 1;
  }
  const total = values.length - 2;
  let H = 0;
  for (const cnt of Object.values(patterns)) {
    const p = cnt / total;
    if (p > 0) H -= p * Math.log2(p);
  }
  return H / Math.log2(6); // normalise by max entropy (log2(3!) = log2(6))
}

function estimateHurst(values: number[]): number {
  // Simplified Hurst via rescaled range on coherence series
  if (values.length < 4) return 0.5;
  const n = values.length;
  const mean = values.reduce((s, v) => s + v, 0) / n;
  const devs = values.map(v => v - mean);
  let cumMax = -Infinity, cumMin = Infinity, cumSum = 0;
  for (const d of devs) {
    cumSum += d;
    cumMax = Math.max(cumMax, cumSum);
    cumMin = Math.min(cumMin, cumSum);
  }
  const R = cumMax - cumMin;
  const S = Math.sqrt(devs.reduce((s, v) => s + v*v, 0) / n) || 1e-9;
  return Math.min(1, Math.max(0, Math.log(R / S) / Math.log(n)));
}

function hillAlpha(values: number[]): number {
  // Hill estimator on top 10% of coherence values
  if (values.length < 10) return 2;
  const sorted = [...values].sort((a, b) => b - a);
  const k = Math.max(2, Math.floor(sorted.length * 0.1));
  const threshold = sorted[k] || 1e-9;
  let sum = 0;
  for (let i = 0; i < k; i++) sum += Math.log(sorted[i] / threshold);
  return k / Math.max(sum, 0.01);
}

// ─── Metric bar ───────────────────────────────────────────────────────────────
function MetricBar({ value, color, max = 1 }: { value: number; color: string; max?: number }) {
  return (
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mt-2">
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, (value / max) * 100)}%` }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />
    </div>
  );
}

export default function CoherenceView() {
  const { data: summary, isLoading } = useGetCoherenceSummary();

  if (isLoading) {
    return (
      <div className="p-8 max-w-6xl mx-auto w-full space-y-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  if (!summary) return null;

  // ── Derive field statistics from knowledge graph coherence distribution ──
  const clusterCoherences = summary.clusters.map((c: any) => c.coherence);
  const pe    = computePE(clusterCoherences);
  const hurst = estimateHurst(clusterCoherences);
  const alpha = hillAlpha(clusterCoherences);

  const globalScore = (summary.globalCoherence * 100).toFixed(1);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-12">
      <header className="space-y-2">
        <div className="font-mono text-xs text-primary tracking-[0.3em] uppercase mb-3">
          System Coherence Analysis
        </div>
        <h1 className="text-4xl font-serif tracking-tight text-foreground flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          System Coherence
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl">
          Real-time measurement of topological stability across mapped concepts. Field statistics
          (Permutation Entropy, Hurst exponent, Alpha tail index) are derived directly from the
          knowledge graph's coherence distribution.
        </p>
      </header>

      {/* Primary stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-primary/5 border-primary/20 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 opacity-5"><Activity className="w-32 h-32" /></div>
          <div className="font-mono text-xs uppercase tracking-widest text-primary mb-2">Global Resonance</div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-mono text-foreground tracking-tighter">{globalScore}</span>
            <span className="text-xl font-mono text-primary">%</span>
          </div>
          <Progress value={summary.globalCoherence * 100} className="mt-4 h-1 bg-primary/20" />
        </Card>

        <Card className="p-6 bg-card border-white/5 flex flex-col justify-center">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-accent" /> Network Density
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-3xl font-serif">{summary.nodeCount}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Nodes</div>
            </div>
            <div>
              <div className="text-3xl font-serif">{summary.edgeCount}</div>
              <div className="text-xs font-mono text-muted-foreground uppercase">Edges</div>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-card border-white/5 flex flex-col justify-center">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Corpus Volume
          </div>
          <div>
            <div className="text-4xl font-serif">{summary.documentCount}</div>
            <div className="text-xs font-mono text-muted-foreground uppercase mt-1">Source Documents</div>
          </div>
        </Card>
      </div>

      {/* Field statistics row — derived from coherence distribution */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest border-b border-border pb-3 mb-5 flex items-center gap-2">
          <BarChart2 className="w-3.5 h-3.5" /> Field Statistics — Derived from Coherence Distribution
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Permutation Entropy */}
          <Card className="p-5 bg-card/60 border-sky-500/15">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                <Waves className="w-4 h-4 text-sky-400" />
              </div>
              <div>
                <div className="font-mono text-xs text-sky-400 uppercase tracking-widest">Permutation Entropy</div>
                <div className="font-mono text-[10px] text-muted-foreground/40 mt-0.5">PE — order 3</div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="font-mono text-4xl text-foreground">{clusterCoherences.length < 3 ? "—" : (pe * 100).toFixed(1)}</div>
              {clusterCoherences.length >= 3 && <div className="font-mono text-lg text-sky-400">%</div>}
            </div>
            <MetricBar value={pe} color="#0ea5e9" />
            <div className="font-mono text-[10px] text-muted-foreground/30 mt-3 leading-relaxed">
              Measures disorder in cluster coherence ordering. Low PE = structured, predictable field. High PE = complex, unpredictable dynamics.
            </div>
          </Card>

          {/* Hurst Exponent */}
          <Card className="p-5 bg-card/60 border-violet-500/15">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-violet-400" />
              </div>
              <div>
                <div className="font-mono text-xs text-violet-400 uppercase tracking-widest">Hurst Exponent</div>
                <div className="font-mono text-[10px] text-muted-foreground/40 mt-0.5">H — rescaled range</div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="font-mono text-4xl text-foreground">{clusterCoherences.length < 4 ? "—" : hurst.toFixed(3)}</div>
            </div>
            <MetricBar value={hurst} color="#8b5cf6" />
            <div className="font-mono text-[10px] text-muted-foreground/30 mt-3 leading-relaxed">
              H &gt; 0.5 = persistent (trend-following) coherence. H &lt; 0.5 = anti-persistent (mean-reverting). H ≈ 0.5 = random walk.
            </div>
            <div className="font-mono text-[10px] mt-2" style={{ color: hurst > 0.55 ? "#8b5cf6" : hurst < 0.45 ? "#f97316" : "#64748b" }}>
              {clusterCoherences.length >= 4 ? (hurst > 0.55 ? "Persistent — trending toward coherence" : hurst < 0.45 ? "Anti-persistent — mean-reverting" : "Random walk — no memory") : "Insufficient clusters"}
            </div>
          </Card>

          {/* Alpha / Hill estimator */}
          <Card className="p-5 bg-card/60 border-amber-500/15">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Sigma className="w-4 h-4 text-amber-400" />
              </div>
              <div>
                <div className="font-mono text-xs text-amber-400 uppercase tracking-widest">Tail Index α</div>
                <div className="font-mono text-[10px] text-muted-foreground/40 mt-0.5">Hill estimator — top 10%</div>
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <div className="font-mono text-4xl text-foreground">{clusterCoherences.length < 10 ? "—" : alpha.toFixed(2)}</div>
            </div>
            <MetricBar value={Math.min(1, alpha / 5)} color="#eab308" max={1} />
            <div className="font-mono text-[10px] text-muted-foreground/30 mt-3 leading-relaxed">
              α-stable tail index of the coherence distribution. Low α = heavy tail (large coherence outliers). High α = thin tail (tight distribution).
            </div>
            <div className="font-mono text-[10px] mt-2" style={{ color: alpha < 2 ? "#eab308" : "#64748b" }}>
              {clusterCoherences.length >= 10 ? (alpha < 2 ? "Heavy tail — extreme coherence variance" : "Thin tail — stable distribution") : "Need ≥ 10 clusters"}
            </div>
          </Card>
        </div>
      </div>

      {/* Clusters + Weakest link */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-foreground border-b border-border pb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Conceptual Clusters
          </h2>
          <div className="space-y-4">
            {summary.clusters.map((cluster: any, i: number) => (
              <Card key={i} className="p-5 bg-card/50 border-white/5 hover:bg-card transition-colors">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-1 text-foreground">{cluster.name}</h3>
                    <div className="font-mono text-xs text-muted-foreground">{cluster.conceptCount} nodes mapping</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg text-primary">{(cluster.coherence * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={cluster.coherence * 100} className="h-1.5 bg-white/5" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {cluster.concepts.slice(0, 5).map((c: string) => (
                    <span key={c} className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-muted-foreground">{c}</span>
                  ))}
                  {cluster.concepts.length > 5 && (
                    <span className="px-2 py-1 rounded bg-transparent font-mono text-[10px] text-muted-foreground italic">
                      +{cluster.concepts.length - 5} more
                    </span>
                  )}
                </div>
              </Card>
            ))}
            {summary.clusters.length === 0 && (
              <div className="text-center py-12 text-muted-foreground font-serif italic border border-dashed border-white/10 rounded-xl">
                Insufficient data to form clusters.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-foreground border-b border-border pb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Top Contradiction
          </h2>
          {summary.weakestLink ? (
            <Card className="p-6 bg-destructive/5 border-destructive/20 text-center">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-4 opacity-80" />
              <div className="font-mono text-xs text-destructive/80 uppercase tracking-widest mb-4">Structural Vulnerability</div>
              <div className="space-y-4">
                <div className="p-3 bg-black/40 rounded border border-destructive/20 font-serif text-lg">{summary.weakestLink.from}</div>
                <div className="h-8 flex justify-center items-center font-mono text-xs text-muted-foreground">
                  <div className="w-px h-full bg-border" />
                  <div className="px-3 py-1 rounded-full border border-border bg-background absolute">CONFLICT</div>
                </div>
                <div className="p-3 bg-black/40 rounded border border-destructive/20 font-serif text-lg">{summary.weakestLink.to}</div>
              </div>
              <div className="mt-6 text-xs font-mono text-muted-foreground">
                Tension Weight: <span className="text-destructive font-bold">{summary.weakestLink.weight.toFixed(2)}</span>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-card/30 border-white/5 text-center">
              <div className="text-muted-foreground font-serif italic py-8">No significant structural contradictions detected.</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

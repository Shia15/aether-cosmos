import { useGetCoherenceSummary } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Zap, TrendingUp, AlertTriangle, GitMerge } from "lucide-react";

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

  const globalScore = (summary.globalCoherence * 100).toFixed(1);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-12">
      <header className="space-y-2">
        <h1 className="text-4xl font-serif tracking-tight text-foreground flex items-center gap-3">
          <Activity className="w-8 h-8 text-primary" />
          System Coherence
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl">
          Real-time measurement of topological stability across mapped concepts. High coherence indicates strong evidential alignment.
        </p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-primary/5 border-primary/20 relative overflow-hidden flex flex-col justify-center">
          <div className="absolute -right-4 -top-4 opacity-5">
            <Activity className="w-32 h-32" />
          </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Clusters */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-foreground border-b border-border pb-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Conceptual Clusters
          </h2>
          <div className="space-y-4">
            {summary.clusters.map((cluster, i) => (
              <Card key={i} className="p-5 bg-card/50 border-white/5 hover:bg-card transition-colors">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-1 text-foreground">{cluster.name}</h3>
                    <div className="font-mono text-xs text-muted-foreground">
                      {cluster.conceptCount} nodes mapping
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg text-primary">{(cluster.coherence * 100).toFixed(1)}%</div>
                  </div>
                </div>
                <Progress value={cluster.coherence * 100} className="h-1.5 bg-white/5" />
                <div className="mt-4 flex flex-wrap gap-2">
                  {cluster.concepts.slice(0, 5).map(c => (
                    <span key={c} className="px-2 py-1 rounded bg-white/5 border border-white/10 font-mono text-[10px] text-muted-foreground">
                      {c}
                    </span>
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

        {/* Weakest Link */}
        <div className="space-y-6">
          <h2 className="font-mono text-sm uppercase tracking-widest text-foreground border-b border-border pb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" /> Top Contradiction
          </h2>
          {summary.weakestLink ? (
            <Card className="p-6 bg-destructive/5 border-destructive/20 text-center">
              <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-4 opacity-80" />
              <div className="font-mono text-xs text-destructive/80 uppercase tracking-widest mb-4">Structural Vulnerability</div>
              
              <div className="space-y-4">
                <div className="p-3 bg-black/40 rounded border border-destructive/20 font-serif text-lg">
                  {summary.weakestLink.from}
                </div>
                <div className="h-8 flex justify-center items-center font-mono text-xs text-muted-foreground">
                  <div className="w-px h-full bg-border" />
                  <div className="px-3 py-1 rounded-full border border-border bg-background absolute">
                    CONFLICT
                  </div>
                </div>
                <div className="p-3 bg-black/40 rounded border border-destructive/20 font-serif text-lg">
                  {summary.weakestLink.to}
                </div>
              </div>
              <div className="mt-6 text-xs font-mono text-muted-foreground">
                Tension Weight: <span className="text-destructive font-bold">{summary.weakestLink.weight.toFixed(2)}</span>
              </div>
            </Card>
          ) : (
            <Card className="p-6 bg-card/30 border-white/5 text-center">
              <div className="text-muted-foreground font-serif italic py-8">
                No significant structural contradictions detected.
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useCallback, useEffect } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { useGetGraph, useGetConcept, useListConcepts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Zap, BrainCircuit, ActivitySquare, ArrowRight } from "lucide-react";

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"standard" | "coherence">("standard");

  const { data: rawGraphData, isLoading: isLoadingGraph } = useGetGraph();
  const { data: allConcepts } = useListConcepts();

  // Build id → name lookup
  const conceptNameMap = useCallback(
    (id: string): string => {
      if (!allConcepts) return id.substring(0, 8) + "…";
      const found = allConcepts.find((c) => c.id === id);
      return found ? found.name : id.substring(0, 8) + "…";
    },
    [allConcepts]
  );

  const graphData = rawGraphData
    ? {
        nodes: rawGraphData.nodes ?? [],
        links: (rawGraphData.edges ?? []).map((e) => ({
          source: e.source,
          target: e.target,
          weight: e.weight,
          type: e.type,
        })),
      }
    : undefined;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const navigateToNode = useCallback(
    (id: string) => {
      setSelectedNodeId(id);
      if (!fgRef.current || !graphData) return;
      const node = graphData.nodes.find((n: any) => n.id === id) as any;
      if (node?.x != null && node?.y != null) {
        fgRef.current.centerAt(node.x, node.y, 800);
        fgRef.current.zoom(8, 1000);
      }
    },
    [graphData]
  );

  const handleNodeClick = useCallback(
    (node: any) => {
      navigateToNode(node.id);
    },
    [navigateToNode]
  );

  const getNodeColor = useCallback(
    (node: any) => {
      if (node.id === selectedNodeId) return "#ffffff";
      if (viewMode === "coherence") {
        const coh = node.coherence || 0;
        if (coh > 0.8) return "#0ea5e9";
        if (coh > 0.5) return "#eab308";
        return "#64748b";
      }
      switch (node.type) {
        case "concept": return "#0ea5e9";
        case "paper":   return "#6366f1";
        case "equation":return "#eab308";
        case "claim":   return "#ec4899";
        default:        return "#64748b";
      }
    },
    [viewMode, selectedNodeId]
  );

  return (
    <div className="w-full h-full flex relative" ref={containerRef}>
      {isLoadingGraph ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-primary">
            <Zap className="w-8 h-8 animate-pulse" />
            <span className="font-mono text-sm tracking-widest animate-pulse">
              COMPILING TOPOLOGY...
            </span>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0">
          {graphData && (
            <ForceGraph2D
              ref={fgRef}
              width={dimensions.width}
              height={dimensions.height}
              graphData={graphData}
              nodeLabel="label"
              nodeColor={getNodeColor}
              nodeRelSize={6}
              linkColor={() => "rgba(255,255,255,0.08)"}
              linkWidth={1}
              onNodeClick={handleNodeClick}
              backgroundColor="transparent"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.label;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Share Tech Mono`;
                const textWidth = ctx.measureText(label).width;
                const pad = fontSize * 0.2;

                const isSelected = node.id === selectedNodeId;

                if (isSelected) {
                  ctx.shadowColor = "#0ea5e9";
                  ctx.shadowBlur = 14 / globalScale;
                }

                ctx.fillStyle = isSelected ? "rgba(14,165,233,0.15)" : "rgba(0,0,0,0.7)";
                ctx.fillRect(
                  node.x - textWidth / 2 - pad,
                  node.y - fontSize / 2 - pad,
                  textWidth + pad * 2,
                  fontSize + pad * 2
                );

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = isSelected ? "#ffffff" : getNodeColor(node);
                ctx.fillText(label, node.x, node.y);
                ctx.shadowBlur = 0;
              }}
            />
          )}
        </div>
      )}

      {/* Overlay Controls */}
      <div className="absolute top-6 left-6 flex gap-2 z-10">
        <button
          onClick={() => setViewMode("standard")}
          className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-all ${
            viewMode === "standard"
              ? "bg-primary/20 border-primary text-primary"
              : "bg-black/50 border-border text-muted-foreground hover:border-primary/50"
          }`}
        >
          <BrainCircuit className="w-3 h-3 inline-block mr-2" />
          STANDARD
        </button>
        <button
          onClick={() => setViewMode("coherence")}
          className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-all ${
            viewMode === "coherence"
              ? "bg-primary/20 border-primary text-primary"
              : "bg-black/50 border-border text-muted-foreground hover:border-primary/50"
          }`}
        >
          <ActivitySquare className="w-3 h-3 inline-block mr-2" />
          COHERENCE
        </button>
      </div>

      {/* Node count badge */}
      {graphData && (
        <div className="absolute top-6 right-6 z-10 font-mono text-[10px] text-muted-foreground/40 bg-black/40 border border-border/30 rounded px-2 py-1">
          {graphData.nodes.length} nodes · {graphData.links.length} edges
        </div>
      )}

      {/* Detail Panel */}
      {selectedNodeId && (
        <ConceptPanel
          id={selectedNodeId}
          conceptNameMap={conceptNameMap}
          onNavigate={navigateToNode}
          onClose={() => {
            setSelectedNodeId(null);
            fgRef.current?.zoomToFit(800);
          }}
        />
      )}
    </div>
  );
}

function ConceptPanel({
  id,
  conceptNameMap,
  onNavigate,
  onClose,
}: {
  id: string;
  conceptNameMap: (id: string) => string;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const { data: concept, isLoading } = useGetConcept(id, {
    query: { enabled: !!id, queryKey: ["/api/concepts", id] },
  });

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[380px] bg-background/96 backdrop-blur-md border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-right-8 duration-300 z-20">
      <div className="sticky top-0 bg-background/96 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
        <div className="font-mono text-[10px] text-primary tracking-[0.3em] uppercase">
          Node Detail
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        {isLoading || !concept ? (
          <div className="space-y-5">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        ) : (
          <div className="space-y-7">
            {/* Name + stats */}
            <div>
              <h2 className="font-serif text-2xl font-medium tracking-tight mb-3 text-foreground">
                {concept.name}
              </h2>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] border-primary/30 text-primary bg-primary/5 rounded-sm"
                >
                  COH: {(concept.coherence * 100).toFixed(1)}%
                </Badge>
                <Badge
                  variant="outline"
                  className="font-mono text-[10px] border-border text-muted-foreground rounded-sm"
                >
                  ID: {concept.id.substring(0, 8)}
                </Badge>
              </div>
            </div>

            {/* Support / Contradiction */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="font-mono text-[9px] text-muted-foreground/50 mb-1 uppercase tracking-widest">
                  Supporting
                </div>
                <div className="font-mono text-2xl text-emerald-400">
                  {concept.supportCount}
                </div>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="font-mono text-[9px] text-muted-foreground/50 mb-1 uppercase tracking-widest">
                  Contradictions
                </div>
                <div className="font-mono text-2xl text-red-400">
                  {concept.contradictCount}
                </div>
              </div>
            </div>

            {/* Related entities — resolved names, clickable */}
            <div>
              <div className="font-mono text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-widest border-b border-border pb-2 flex items-center gap-2">
                Related Entities
                <span className="text-muted-foreground/30">
                  ({concept.relatedConcepts.length})
                </span>
              </div>
              {concept.relatedConcepts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {concept.relatedConcepts.map((relId) => {
                    const name = conceptNameMap(relId);
                    return (
                      <button
                        key={relId}
                        onClick={() => onNavigate(relId)}
                        className="group flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded border border-primary/20 text-primary/70 bg-primary/5 hover:bg-primary/15 hover:text-primary hover:border-primary/40 transition-all"
                        title={`Navigate to ${name}`}
                      >
                        {name}
                        <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="font-serif text-sm text-muted-foreground/40 italic">
                  No related entities mapped.
                </div>
              )}
            </div>

            {/* Equations */}
            {concept.equations && concept.equations.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-widest border-b border-border pb-2 flex items-center gap-2">
                  Derived Equations
                  <span className="text-muted-foreground/30">
                    ({concept.equations.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {concept.equations.map((eq) => (
                    <div
                      key={eq}
                      className="p-2.5 bg-black/40 border border-white/5 font-mono text-xs text-yellow-400/80 rounded overflow-x-auto whitespace-nowrap"
                    >
                      {eq}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Document references */}
            {concept.documentIds && concept.documentIds.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/50 mb-2 uppercase tracking-widest border-b border-border pb-2">
                  Source Documents
                </div>
                <div className="space-y-1">
                  {concept.documentIds.map((docId) => (
                    <div
                      key={docId}
                      className="font-mono text-[10px] text-muted-foreground/40 truncate"
                    >
                      {docId.substring(0, 12)}…
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

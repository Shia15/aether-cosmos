import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { useGetGraph, useGetConcept, useListConcepts } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Zap, BrainCircuit, ActivitySquare, ArrowRight, Layers, GitFork, Binary } from "lucide-react";
import { Link } from "wouter";

// ─── Layer colour palette — M.A.R.I. aura colors ─────────────────────────────
const LAYER_COLORS: Record<string, string> = {
  mnesis:   "#8047d4",   // Mnēsis aura — Soft Violet Bloom
  infernia: "#e64522",   // Inferaia aura — Red-Hot Pulse
  aletheia: "#c9a84c",   // Aletheia aura — Radial Gold Glow
  reverie:  "#88c7ff",   // Reverie aura — Blue Bloom
  auto:     "#64748b",   // unclassified
};

const LAYER_META: Record<string, { label: string; symbol: string; color: string }> = {
  mnesis:   { label: "MNĒSIS",   symbol: "~",   color: "#8047d4" },
  infernia: { label: "INFERNIA", symbol: "|||", color: "#e64522" },
  aletheia: { label: "ALETHEIA", symbol: "◇",   color: "#c9a84c" },
  reverie:  { label: "REVERIE",  symbol: "✧",   color: "#88c7ff" },
  auto:     { label: "UNCLASSIFIED", symbol: "·", color: "#64748b" },
};

type ViewMode = "standard" | "layer" | "coherence" | "unify";

// ─── Colour helpers ───────────────────────────────────────────────────────────

function heatColor(t: number, from: [number,number,number], to: [number,number,number]): string {
  const r = Math.round(from[0] + t * (to[0] - from[0]));
  const g = Math.round(from[1] + t * (to[1] - from[1]));
  const b = Math.round(from[2] + t * (to[2] - from[2]));
  return `rgb(${r},${g},${b})`;
}

function getNodeColor(node: any, viewMode: ViewMode, selectedId: string | null, neighborSet: Set<string>): string {
  const isSelected  = node.id === selectedId;
  const isNeighbor  = neighborSet.has(node.id);
  const hasSelection = selectedId !== null;

  if (isSelected) return "#ffffff";

  if (hasSelection && !isNeighbor) {
    // Dim unrelated nodes
    return viewMode === "layer" ? LAYER_COLORS[node.layer ?? "auto"] + "28" : "rgba(100,116,139,0.18)";
  }

  switch (viewMode) {
    case "layer":
      return LAYER_COLORS[node.layer ?? "auto"] ?? "#64748b";

    case "coherence": {
      const t = node.coherence ?? 0;
      if (t > 0.8) return "#0ea5e9";
      if (t > 0.5) return "#eab308";
      return "#64748b";
    }

    case "unify": {
      const t = node.bridgeScore ?? 0;
      // low bridge: slate → high bridge: emerald→violet
      if (t > 0.7) return "#8b5cf6";
      if (t > 0.4) return "#10b981";
      if (t > 0.2) return "#0ea5e9";
      return "#334155";
    }

    default: // standard
      switch (node.type) {
        case "concept":  return "#0ea5e9";
        case "paper":    return "#6366f1";
        case "equation": return "#eab308";
        case "claim":    return "#ec4899";
        default:         return "#64748b";
      }
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("layer");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const { data: rawGraphData, isLoading: isLoadingGraph } = useGetGraph();
  const { data: allConcepts } = useListConcepts();

  const conceptNameMap = useCallback(
    (id: string): string => {
      if (!allConcepts) return id.substring(0, 8) + "…";
      const found = allConcepts.find((c) => c.id === id);
      return found ? found.name : id.substring(0, 8) + "…";
    },
    [allConcepts]
  );

  const graphData = useMemo(() => {
    if (!rawGraphData) return undefined;
    return {
      nodes: rawGraphData.nodes ?? [],
      links: (rawGraphData.edges ?? []).map((e) => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
        type: e.type,
      })),
    };
  }, [rawGraphData]);

  // Build adjacency index for fast neighbor lookup
  const adjacency = useMemo<Map<string, Set<string>>>(() => {
    const map = new Map<string, Set<string>>();
    if (!graphData) return map;
    for (const link of graphData.links) {
      const s = typeof link.source === "object" ? (link.source as any).id : link.source;
      const t = typeof link.target === "object" ? (link.target as any).id : link.target;
      if (!map.has(s)) map.set(s, new Set());
      if (!map.has(t)) map.set(t, new Set());
      map.get(s)!.add(t);
      map.get(t)!.add(s);
    }
    return map;
  }, [graphData]);

  const neighborSet = useMemo<Set<string>>(() => {
    const id = hoveredId ?? selectedNodeId;
    if (!id) return new Set();
    return adjacency.get(id) ?? new Set();
  }, [adjacency, selectedNodeId, hoveredId]);

  const activeId = hoveredId ?? selectedNodeId;

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const navigateToNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    if (!fgRef.current || !graphData) return;
    const node = graphData.nodes.find((n: any) => n.id === id) as any;
    if (node?.x != null && node?.y != null) {
      fgRef.current.centerAt(node.x, node.y, 800);
      fgRef.current.zoom(7, 1000);
    }
  }, [graphData]);

  const handleNodeClick = useCallback((node: any) => { navigateToNode(node.id); }, [navigateToNode]);
  const handleNodeHover = useCallback((node: any) => { setHoveredId(node?.id ?? null); }, []);

  const nodeCanvasObject = useCallback((node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const label     = node.label ?? node.id;
    const fontSize  = Math.max(9, 12 / globalScale);
    const isSelected  = node.id === selectedNodeId;
    const isNeighbor  = neighborSet.has(node.id);
    const isHovered   = node.id === hoveredId;
    const hasActive   = activeId !== null;
    const isDimmed    = hasActive && !isSelected && !isNeighbor;
    const color       = getNodeColor(node, viewMode, selectedNodeId, neighborSet);

    ctx.save();

    // Glow ring for selected
    if (isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur  = 20 / globalScale;
      ctx.beginPath();
      ctx.arc(node.x, node.y, 8 / globalScale, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth   = 1.5 / globalScale;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Neighbour pulse ring
    if (isNeighbor && !isSelected) {
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10 / globalScale;
    }

    // Node dot
    const r = isSelected ? 5 / globalScale : isNeighbor ? 4 / globalScale : 3 / globalScale;
    ctx.beginPath();
    ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isDimmed ? "rgba(100,116,139,0.12)" : color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Label
    if (globalScale > 1.5 || isSelected || isNeighbor || isHovered) {
      ctx.font = `${isSelected ? "bold " : ""}${fontSize}px monospace`;
      const tw  = ctx.measureText(label).width;
      const pad = fontSize * 0.25;
      const lx  = node.x - tw / 2;
      const ly  = node.y + r + pad + fontSize / 2;

      // Label background
      ctx.fillStyle = isSelected
        ? "rgba(0,0,0,0.85)"
        : isDimmed
          ? "rgba(0,0,0,0.0)"
          : "rgba(0,0,0,0.65)";
      ctx.fillRect(lx - pad, ly - fontSize / 2 - pad * 0.5, tw + pad * 2, fontSize + pad);

      // Label text
      ctx.textAlign    = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle    = isDimmed
        ? "rgba(100,116,139,0.25)"
        : isSelected
          ? "#ffffff"
          : isNeighbor
            ? color
            : color + "cc";
      ctx.fillText(label, node.x, ly);
    }

    ctx.restore();
  }, [viewMode, selectedNodeId, neighborSet, activeId, hoveredId]);

  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const s = typeof link.source === "object" ? link.source : { x: 0, y: 0, id: link.source };
    const t = typeof link.target === "object" ? link.target : { x: 0, y: 0, id: link.target };

    const isHighlighted = activeId && (
      (s.id === activeId || t.id === activeId) ||
      (neighborSet.has(s.id) && neighborSet.has(t.id))
    );
    const isDimmed = activeId && !isHighlighted;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(t.x, t.y);

    if (isHighlighted) {
      const nodeColor = s.id === activeId
        ? getNodeColor(t, viewMode, selectedNodeId, neighborSet)
        : getNodeColor(s, viewMode, selectedNodeId, neighborSet);
      ctx.strokeStyle = nodeColor + "cc";
      ctx.lineWidth   = 1.5;
      ctx.shadowColor = nodeColor;
      ctx.shadowBlur  = 4;
    } else {
      ctx.strokeStyle = isDimmed ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.07)";
      ctx.lineWidth   = 0.6;
    }

    ctx.stroke();
    ctx.restore();
  }, [activeId, neighborSet, viewMode, selectedNodeId]);

  const VIEW_BUTTONS: Array<{ id: ViewMode; label: string; Icon: any; tip: string }> = [
    { id: "layer",     label: "LAYER",     Icon: Layers,          tip: "Colour by AETHER layer" },
    { id: "standard",  label: "TYPE",      Icon: BrainCircuit,    tip: "Colour by node type" },
    { id: "coherence", label: "COHERENCE", Icon: ActivitySquare,  tip: "Colour by coherence score" },
    { id: "unify",     label: "UNIFY",     Icon: GitFork,         tip: "Colour by bridge/unification score" },
  ];

  return (
    <div className="w-full h-full flex relative bg-[#03050a]" ref={containerRef}>
      {isLoadingGraph ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-primary">
            <Zap className="w-8 h-8 animate-pulse" />
            <span className="font-mono text-sm tracking-widest animate-pulse">COMPILING TOPOLOGY…</span>
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
              nodeLabel=""
              nodeRelSize={4}
              onNodeClick={handleNodeClick}
              onNodeHover={handleNodeHover}
              backgroundColor="transparent"
              nodeCanvasObject={nodeCanvasObject}
              nodeCanvasObjectMode={() => "replace"}
              linkCanvasObject={linkCanvasObject}
              linkCanvasObjectMode={() => "replace"}
              cooldownTicks={120}
              d3AlphaDecay={0.02}
              d3VelocityDecay={0.3}
            />
          )}
        </div>
      )}

      {/* View mode controls */}
      <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10">
        {VIEW_BUTTONS.map(({ id, label, Icon, tip }) => (
          <button key={id} onClick={() => setViewMode(id)} title={tip}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-[10px] font-mono tracking-wider border transition-all ${
              viewMode === id
                ? "bg-primary/20 border-primary text-primary"
                : "bg-black/60 border-border/50 text-muted-foreground/60 hover:border-primary/40 hover:text-primary/70"
            }`}>
            <Icon className="w-3 h-3" />{label}
          </button>
        ))}
      </div>

      {/* Layer legend (shown in layer mode) */}
      {viewMode === "layer" && (
        <div className="absolute top-5 right-[420px] z-10 bg-black/70 border border-border/30 rounded-lg p-3 space-y-1.5 backdrop-blur-sm">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2">AETHER Layers</div>
          {Object.entries(LAYER_META).filter(([k]) => k !== "auto").map(([key, m]) => (
            <div key={key} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: m.color }} />
              <span className="font-mono text-[9px]" style={{ color: m.color }}>{m.symbol}</span>
              <span className="font-mono text-[9px] text-muted-foreground/60">{m.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Unify legend */}
      {viewMode === "unify" && (
        <div className="absolute top-5 right-[420px] z-10 bg-black/70 border border-border/30 rounded-lg p-3 space-y-1.5 backdrop-blur-sm">
          <div className="font-mono text-[9px] text-muted-foreground/40 uppercase tracking-widest mb-2">Bridge Score</div>
          {[
            { color: "#8b5cf6", label: "High unifier (>70%)" },
            { color: "#10b981", label: "Bridge node (>40%)" },
            { color: "#0ea5e9", label: "Connector (>20%)" },
            { color: "#334155", label: "Local node" },
          ].map(({ color, label }) => (
            <div key={color} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="font-mono text-[9px] text-muted-foreground/60">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Node / edge count */}
      {graphData && (
        <div className="absolute bottom-5 left-5 z-10 font-mono text-[10px] text-muted-foreground/30 bg-black/40 border border-border/20 rounded px-2.5 py-1.5 space-y-0.5">
          <div>{graphData.nodes.length} nodes</div>
          <div>{graphData.links.length} edges</div>
          {activeId && <div className="text-primary/50">{neighborSet.size} connections</div>}
        </div>
      )}

      {/* HYPERCOMPUTATION LANGUAGE — labeled portal node */}
      <Link
        href="/hypercomputation"
        data-testid="graph-hypercomputation-portal"
        className="absolute top-5 right-5 z-10 group"
      >
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/10 via-yellow-500/8 to-cyan-500/10
                        border border-purple-400/40 hover:border-purple-300/80 backdrop-blur-md
                        transition-all hover:shadow-[0_0_18px_rgba(124,92,252,0.45)]">
          <Binary className="w-4 h-4 text-purple-300 group-hover:text-purple-200" />
          <div className="flex flex-col leading-tight">
            <span className="font-mono text-[8.5px] tracking-[0.3em] uppercase text-purple-300/80">Hyper · Computation</span>
            <span className="font-serif italic text-[11px] text-yellow-300/85">True Language · v0.1</span>
          </div>
          <ArrowRight className="w-3 h-3 text-yellow-300/70 group-hover:text-yellow-200 transition-transform group-hover:translate-x-0.5" />
        </div>
        <div className="mt-1 px-2 text-[8px] font-mono tracking-[0.18em] text-muted-foreground/40 text-right">
          one clock · all scales
        </div>
      </Link>

      {/* Click hint */}
      {!selectedNodeId && graphData && graphData.nodes.length > 0 && (
        <div className="absolute bottom-5 right-5 z-10 font-mono text-[9px] text-muted-foreground/20">
          Click a node to reveal its theory threads
        </div>
      )}

      {/* Detail Panel */}
      {selectedNodeId && (
        <ConceptPanel
          id={selectedNodeId}
          conceptNameMap={conceptNameMap}
          adjacency={adjacency}
          viewMode={viewMode}
          onNavigate={navigateToNode}
          onClose={() => { setSelectedNodeId(null); fgRef.current?.zoomToFit(800); }}
        />
      )}
    </div>
  );
}

// ─── Concept detail panel ─────────────────────────────────────────────────────

function ConceptPanel({
  id, conceptNameMap, adjacency, viewMode, onNavigate, onClose,
}: {
  id: string;
  conceptNameMap: (id: string) => string;
  adjacency: Map<string, Set<string>>;
  viewMode: ViewMode;
  onNavigate: (id: string) => void;
  onClose: () => void;
}) {
  const { data: concept, isLoading } = useGetConcept(id, {
    query: { enabled: !!id, queryKey: ["/api/concepts", id] },
  });

  // Compute unification threads: neighbours grouped by their layer
  const threadsByLayer = useMemo(() => {
    if (!concept) return {};
    const neighbors = [...(adjacency.get(id) ?? [])];
    return neighbors.reduce<Record<string, string[]>>((acc, nid) => {
      acc["related"] = [...(acc["related"] ?? []), nid];
      return acc;
    }, {});
  }, [concept, id, adjacency]);

  const neighborCount = adjacency.get(id)?.size ?? 0;

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-background/97 backdrop-blur-md border-l border-border shadow-2xl overflow-y-auto z-20">
      <div className="sticky top-0 bg-background/97 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
        <div className="font-mono text-[10px] text-primary tracking-[0.3em] uppercase">Theory Thread</div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
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
            {/* Name + layer badge */}
            <div>
              <h2 className="font-serif text-2xl font-medium tracking-tight mb-3 text-foreground">{concept.name}</h2>
              <div className="flex flex-wrap gap-2">
                <LayerBadge layer={(concept as any).layer ?? "mnesis"} />
                <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary bg-primary/5 rounded-sm">
                  COH {(concept.coherence * 100).toFixed(1)}%
                </Badge>
                <Badge variant="outline" className="font-mono text-[10px] border-border text-muted-foreground/60 rounded-sm">
                  {concept.id.substring(0, 8)}
                </Badge>
              </div>
            </div>

            {/* Bridge / unification score */}
            <div className="rounded-lg border border-border/30 p-4">
              <div className="font-mono text-[10px] text-muted-foreground/40 uppercase tracking-widest mb-3 flex items-center gap-2">
                <GitFork className="w-3 h-3" /> Unification Score
              </div>
              <div className="flex items-end gap-3 mb-2">
                <div className="font-mono text-3xl text-foreground">{neighborCount}</div>
                <div className="font-mono text-xs text-muted-foreground/50 mb-1">direct theory threads</div>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, neighborCount * 5)}%`, background: neighborCount > 15 ? "#8b5cf6" : neighborCount > 8 ? "#10b981" : "#0ea5e9" }} />
              </div>
              <div className="font-mono text-[9px] text-muted-foreground/30 mt-2">
                {neighborCount > 15 ? "High unifier — bridges multiple theory clusters" : neighborCount > 8 ? "Bridge node — connects distinct domains" : neighborCount > 3 ? "Connector — locally integrated" : "Leaf concept — specialist domain"}
              </div>
            </div>

            {/* Support / contradiction */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="font-mono text-[9px] text-muted-foreground/50 mb-1 uppercase tracking-widest">Supporting</div>
                <div className="font-mono text-2xl text-emerald-400">{concept.supportCount}</div>
              </div>
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="font-mono text-[9px] text-muted-foreground/50 mb-1 uppercase tracking-widest">Contradictions</div>
                <div className="font-mono text-2xl text-red-400">{concept.contradictCount}</div>
              </div>
            </div>

            {/* Theory threads — clickable neighbor list */}
            <div>
              <div className="font-mono text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-widest border-b border-border pb-2 flex items-center gap-2">
                Connected Theories
                <span className="text-muted-foreground/30">({concept.relatedConcepts.length})</span>
              </div>
              {concept.relatedConcepts.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {concept.relatedConcepts.map((relId) => {
                    const name = conceptNameMap(relId);
                    return (
                      <button key={relId} onClick={() => onNavigate(relId)}
                        className="group flex items-center gap-1 font-mono text-[10px] px-2 py-1 rounded border border-primary/20 text-primary/70 bg-primary/5 hover:bg-primary/15 hover:text-primary hover:border-primary/40 transition-all"
                        title={`Navigate to ${name}`}>
                        {name}
                        <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="font-serif text-sm text-muted-foreground/40 italic">No related theories mapped.</div>
              )}
            </div>

            {/* Equations */}
            {concept.equations && concept.equations.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/50 mb-3 uppercase tracking-widest border-b border-border pb-2">
                  Derived Equations ({concept.equations.length})
                </div>
                <div className="space-y-2">
                  {concept.equations.map((eq) => (
                    <div key={eq} className="p-2.5 bg-black/40 border border-white/5 font-mono text-xs text-yellow-400/80 rounded overflow-x-auto whitespace-nowrap">{eq}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Source documents */}
            {concept.documentIds && concept.documentIds.length > 0 && (
              <div>
                <div className="font-mono text-[10px] text-muted-foreground/50 mb-2 uppercase tracking-widest border-b border-border pb-2">
                  Source Documents ({concept.documentIds.length})
                </div>
                <div className="space-y-1">
                  {concept.documentIds.map((docId) => (
                    <div key={docId} className="font-mono text-[10px] text-muted-foreground/40 truncate">{docId.substring(0, 12)}…</div>
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

// ─── Layer badge ──────────────────────────────────────────────────────────────

function LayerBadge({ layer }: { layer: string }) {
  const meta = LAYER_META[layer] ?? LAYER_META.auto;
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border"
      style={{ borderColor: meta.color + "50", background: meta.color + "12", color: meta.color }}>
      <span>{meta.symbol}</span>{meta.label}
    </span>
  );
}

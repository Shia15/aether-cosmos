import { useState, useRef, useCallback, useEffect } from "react";
import ForceGraph2D, { ForceGraphMethods } from "react-force-graph-2d";
import { useGetGraph, useGetConcept } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { X, Zap, BrainCircuit, ActivitySquare } from "lucide-react";

export default function GraphView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fgRef = useRef<ForceGraphMethods>();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const { data: rawGraphData, isLoading: isLoadingGraph } = useGetGraph();

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

  // Mode toggles
  const [viewMode, setViewMode] = useState<'standard' | 'coherence'>('standard');

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Handle node click
  const handleNodeClick = useCallback((node: any) => {
    setSelectedNodeId(node.id);
    
    // Zoom to node
    if (fgRef.current) {
      fgRef.current.centerAt(node.x, node.y, 1000);
      fgRef.current.zoom(8, 2000);
    }
  }, []);

  // Node coloring
  const getNodeColor = useCallback((node: any) => {
    if (viewMode === 'coherence') {
      const coh = node.coherence || 0;
      if (coh > 0.8) return '#0ea5e9'; // teal
      if (coh > 0.5) return '#eab308'; // gold
      return '#64748b'; // ash grey
    }
    
    // Standard mode by type
    switch(node.type) {
      case 'concept': return '#0ea5e9';
      case 'paper': return '#6366f1';
      case 'equation': return '#eab308';
      case 'claim': return '#ec4899';
      default: return '#64748b';
    }
  }, [viewMode]);

  return (
    <div className="w-full h-full flex relative" ref={containerRef}>
      {isLoadingGraph ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-primary">
            <Zap className="w-8 h-8 animate-pulse" />
            <span className="font-mono text-sm tracking-widest animate-pulse">COMPILING TOPOLOGY...</span>
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
              linkColor={() => 'rgba(255,255,255,0.1)'}
              linkWidth={1}
              onNodeClick={handleNodeClick}
              backgroundColor="transparent"
              nodeCanvasObject={(node: any, ctx, globalScale) => {
                const label = node.label;
                const fontSize = 12 / globalScale;
                ctx.font = `${fontSize}px Share Tech Mono`;
                const textWidth = ctx.measureText(label).width;
                const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, bckgDimensions[0], bckgDimensions[1]);

                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = getNodeColor(node);
                
                // Highlight selected
                if (node.id === selectedNodeId) {
                  ctx.fillStyle = '#ffffff';
                  ctx.shadowColor = '#0ea5e9';
                  ctx.shadowBlur = 10;
                } else {
                  ctx.shadowBlur = 0;
                }
                
                ctx.fillText(label, node.x, node.y);
              }}
            />
          )}
        </div>
      )}

      {/* Overlay Controls */}
      <div className="absolute top-6 left-6 flex gap-2">
        <button 
          onClick={() => setViewMode('standard')}
          className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-all ${
            viewMode === 'standard' 
              ? 'bg-primary/20 border-primary text-primary' 
              : 'bg-black/50 border-border text-muted-foreground hover:border-primary/50'
          }`}
        >
          <BrainCircuit className="w-3 h-3 inline-block mr-2" />
          STANDARD
        </button>
        <button 
          onClick={() => setViewMode('coherence')}
          className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider border transition-all ${
            viewMode === 'coherence' 
              ? 'bg-primary/20 border-primary text-primary' 
              : 'bg-black/50 border-border text-muted-foreground hover:border-primary/50'
          }`}
        >
          <ActivitySquare className="w-3 h-3 inline-block mr-2" />
          COHERENCE
        </button>
      </div>

      {/* Detail Panel */}
      {selectedNodeId && (
        <ConceptPanel 
          id={selectedNodeId} 
          onClose={() => {
            setSelectedNodeId(null);
            if (fgRef.current) {
              fgRef.current.zoomToFit(1000);
            }
          }} 
        />
      )}
    </div>
  );
}

function ConceptPanel({ id, onClose }: { id: string, onClose: () => void }) {
  const { data: concept, isLoading } = useGetConcept(id, { 
    query: { enabled: !!id, queryKey: ['/api/concepts', id] } 
  });

  return (
    <div className="absolute right-0 top-0 bottom-0 w-[400px] bg-background/95 backdrop-blur-md border-l border-border shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right-8 duration-300">
      <div className="flex items-center justify-between mb-8">
        <div className="font-mono text-xs text-primary tracking-widest uppercase">Node Detail</div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {isLoading || !concept ? (
        <div className="space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="font-serif text-3xl font-medium tracking-tight mb-3 text-foreground">{concept.name}</h2>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono border-primary/30 text-primary bg-primary/5 rounded-sm">
                COH: {(concept.coherence * 100).toFixed(1)}%
              </Badge>
              <Badge variant="outline" className="font-mono border-border text-muted-foreground rounded-sm">
                ID: {concept.id.substring(0,8)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-white/5 border-white/10 rounded-lg">
              <div className="font-mono text-xs text-muted-foreground mb-1">Supporting Evidence</div>
              <div className="text-2xl font-mono text-emerald-400">{concept.supportCount}</div>
            </Card>
            <Card className="p-4 bg-white/5 border-white/10 rounded-lg">
              <div className="font-mono text-xs text-muted-foreground mb-1">Contradictions</div>
              <div className="text-2xl font-mono text-destructive">{concept.contradictCount}</div>
            </Card>
          </div>

          <div>
            <div className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-widest border-b border-border pb-2">Related Entities</div>
            <div className="flex flex-wrap gap-2">
              {concept.relatedConcepts.length > 0 ? (
                concept.relatedConcepts.map(rel => (
                  <Badge key={rel} variant="secondary" className="font-mono text-xs font-normal rounded bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                    {rel}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground italic font-serif">No related entities mapped.</div>
              )}
            </div>
          </div>

          {concept.equations && concept.equations.length > 0 && (
            <div>
              <div className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-widest border-b border-border pb-2">Derived Equations</div>
              <div className="space-y-2">
                {concept.equations.map(eq => (
                  <div key={eq} className="p-3 bg-black/40 border border-white/5 font-mono text-sm text-accent rounded-md overflow-x-auto whitespace-nowrap">
                    {eq}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { useListConcepts, useGenerateEquations, useListEquations } from "@workspace/api-client-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FunctionSquare, Beaker, Zap, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getListEquationsQueryKey } from "@workspace/api-client-react";

function EquationsSimCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    canvas.width = 700; canvas.height = 180;
    const ctx = canvas.getContext("2d")!;
    const fns = [
      { label:"sin(x)",  fn:(x:number)=>Math.sin(x),          col:"#2ef0d8" },
      { label:"cos(x)",  fn:(x:number)=>Math.cos(x),          col:"#9966ff" },
      { label:"e^(-x²)", fn:(x:number)=>Math.exp(-x*x*0.3),   col:"#c9a84c" },
      { label:"tanh(x)", fn:(x:number)=>Math.tanh(x),         col:"#ff4477" },
    ];
    let tick = 0;
    const loop = () => {
      tick++;
      ctx.clearRect(0,0,700,180);
      ctx.fillStyle="#020408"; ctx.fillRect(0,0,700,180);
      ctx.font="9px 'DM Mono',monospace";
      ctx.fillStyle="rgba(46,240,216,0.08)";
      ctx.fillText("EQUATION LABORATORY · FUNCTION SYNTHESIS · CONCEPT TOPOLOGY · AETHER",10,14);
      const phase=tick*0.025;
      fns.forEach(f=>{
        ctx.beginPath();
        for(let px=0;px<700;px++){
          const x=(px/700)*10-5+phase;
          const y=90-f.fn(x)*50;
          px===0 ? ctx.moveTo(px,y) : ctx.lineTo(px,y);
        }
        ctx.strokeStyle=f.col; ctx.lineWidth=1.5; ctx.globalAlpha=0.7; ctx.stroke(); ctx.globalAlpha=1;
      });
      ctx.fillStyle="#e0f8ff"; ctx.font="8px 'DM Mono',monospace";
      fns.forEach((f,i)=>{
        ctx.fillStyle=f.col;
        ctx.fillText(f.label, 10+i*160, 170);
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  return <canvas ref={ref} style={{ width:"100%", height:"auto", borderRadius:8, display:"block" }} />;
}

export default function EquationsView() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: concepts, isLoading: loadingConcepts } = useListConcepts();
  const { data: history, isLoading: loadingHistory } = useListEquations();
  const generateEq = useGenerateEquations();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [domain, setDomain] = useState("");

  const toggleConcept = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else {
      if (next.size >= 5) {
        toast({ title: "Limit reached", description: "Maximum 5 concepts for synthesis.", variant: "destructive" });
        return;
      }
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleSynthesize = async () => {
    if (selectedIds.size < 2) {
      toast({ title: "Insufficient data", description: "Select at least 2 concepts to synthesize.", variant: "destructive" });
      return;
    }

    try {
      await generateEq.mutateAsync(
        { data: { conceptIds: Array.from(selectedIds), domain: domain || undefined } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListEquationsQueryKey() });
            setSelectedIds(new Set());
            setDomain("");
            toast({
              title: "Synthesis Complete",
              description: "New mathematical relationships formulated.",
              className: "font-mono border-accent text-accent bg-accent/10"
            });
          }
        }
      );
    } catch (e) {
      toast({ title: "Synthesis Failed", description: "Could not generate equations.", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto w-full space-y-8 h-full flex flex-col">
      <header className="space-y-2 shrink-0">
        <h1 className="text-4xl font-serif tracking-tight text-foreground flex items-center gap-3">
          <FunctionSquare className="w-8 h-8 text-accent" />
          Equation Laboratory
        </h1>
        <p className="font-mono text-sm text-muted-foreground max-w-2xl">
          Select concepts from the mapped topology. The system will attempt to formulate coherent mathematical relationships between them.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8 flex-1 min-h-0">
        {/* Input Column */}
        <div className="flex flex-col border border-white/5 bg-card/30 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Component Selection</div>
            <Badge variant="outline" className="font-mono bg-black text-muted-foreground border-white/10">
              {selectedIds.size} / 5 Selected
            </Badge>
          </div>
          
          <div className="p-4 flex-1 overflow-y-auto space-y-2">
            {loadingConcepts ? (
              <div className="text-center py-10 font-mono text-sm text-muted-foreground">Loading topology...</div>
            ) : concepts?.map(c => {
              const isSelected = selectedIds.has(c.id);
              return (
                <div 
                  key={c.id}
                  onClick={() => toggleConcept(c.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all flex justify-between items-center ${
                    isSelected 
                      ? "bg-accent/10 border-accent/50 text-accent" 
                      : "bg-black/40 border-transparent hover:border-white/10 text-foreground"
                  }`}
                >
                  <span className="font-serif text-lg">{c.name}</span>
                  <span className="font-mono text-[10px] opacity-50">{(c.coherence * 100).toFixed(0)}% COH</span>
                </div>
              )
            })}
          </div>

          <div className="p-4 border-t border-white/5 bg-black/40 space-y-4">
            <Input 
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="Optional constraint domain (e.g. Thermodynamics)"
              className="bg-black/50 border-white/10 font-mono text-sm h-10"
            />
            <Button 
              onClick={handleSynthesize}
              disabled={selectedIds.size < 2 || generateEq.isPending}
              className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-mono uppercase tracking-widest"
            >
              {generateEq.isPending ? (
                <><Zap className="w-4 h-4 mr-2 animate-pulse" /> Processing...</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Synthesize Relationships</>
              )}
            </Button>
          </div>
        </div>

        {/* Output Column */}
        <div className="flex flex-col border border-white/5 bg-card/30 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/5 bg-black/20 flex items-center gap-2">
            <Beaker className="w-4 h-4 text-primary" />
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Synthesized Candidates</div>
          </div>

          <div className="p-6 flex-1 overflow-y-auto space-y-6">
            {generateEq.isPending && (
               <div className="flex flex-col items-center justify-center py-20 text-accent opacity-50">
                 <Zap className="w-12 h-12 mb-4 animate-pulse" />
                 <div className="font-mono text-sm tracking-widest">COMPUTING VARIABLES...</div>
               </div>
            )}
            
            {!generateEq.isPending && (!history || history.length === 0) && (
              <div className="text-center py-20 text-muted-foreground/50 font-serif italic">
                No equations formulated yet.
              </div>
            )}

            {!generateEq.isPending && history?.map((eq, i) => (
              <div key={eq.id || i} className="animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-backwards" style={{ animationDelay: `${i * 100}ms`}}>
                <Card className="p-5 bg-black/60 border-white/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent/50 group-hover:bg-accent transition-colors" />
                  
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className="font-mono text-[10px] border-white/10 text-muted-foreground bg-white/5">
                      SCORE: {(eq.score * 100).toFixed(1)}
                    </Badge>
                    {eq.domain && (
                      <span className="font-mono text-[10px] uppercase text-primary/70">{eq.domain}</span>
                    )}
                  </div>

                  {/* Render plain text LaTeX simply centered and mono */}
                  <div className="my-6 py-4 px-2 text-center overflow-x-auto">
                    <code className="text-xl md:text-2xl text-foreground font-mono tracking-tight whitespace-nowrap">
                      {eq.latex}
                    </code>
                  </div>

                  <p className="font-serif text-sm text-muted-foreground leading-relaxed">
                    {eq.description}
                  </p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

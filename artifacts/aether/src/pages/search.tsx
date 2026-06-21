import { useState } from "react";
import { useSearchConcepts, SearchConceptsType } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search as SearchIcon, Hexagon, Fingerprint, Layers } from "lucide-react";

import { useEffect, useRef } from "react";

function SearchHeaderCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    canvas.width = 900; canvas.height = 145;
    const W = canvas.width, H = canvas.height;
    let t=0;
    const nodes: {x:number;y:number;r:number;phase:number}[]=[];
    for(let i=0;i<20;i++) nodes.push({x:Math.random()*W,y:Math.random()*H,r:3+Math.random()*5,phase:Math.random()*Math.PI*2});
    const draw=()=>{
      ctx.fillStyle="rgba(2,4,8,0.3)"; ctx.fillRect(0,0,W,H);
      nodes.forEach((n,i)=>{
        if(i>0 && Math.random()>0.98){
          const p=nodes[Math.floor(Math.random()*nodes.length)];
          ctx.beginPath();ctx.moveTo(n.x,n.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle="rgba(46,240,216,0.08)";ctx.lineWidth=0.4;ctx.stroke();
        }
        const pls=0.85+0.15*Math.sin(t*0.04+n.phase);
        ctx.beginPath();ctx.arc(n.x,n.y,n.r*pls,0,Math.PI*2);ctx.fillStyle="rgba(46,240,216,0.1)";ctx.fill();ctx.strokeStyle="rgba(46,240,216,0.4)";ctx.lineWidth=0.5;ctx.stroke();
      });
      ctx.fillStyle="rgba(46,240,216,0.3)"; ctx.font="9px 'DM Mono',monospace";
      ctx.fillText("SEARCH · SEMANTIC INDEX · KNOWLEDGE RETRIEVAL · AETHER",14,14);
      t++; rafRef.current=requestAnimationFrame(draw);
    };
    draw();
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);
  return <canvas ref={ref} style={{width:"100%",height:"auto",borderRadius:8,display:"block"}} />;
}

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<SearchConceptsType>("semantic");
  const [activeSearch, setActiveSearch] = useState({ q: "", type: "semantic" as SearchConceptsType });

  const { data: results, isLoading, isFetching } = useSearchConcepts(
    { q: activeSearch.q, type: activeSearch.type },
    { query: { enabled: !!activeSearch.q } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setActiveSearch({ q: query.trim(), type });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8 h-full flex flex-col">
      <div style={{flexShrink:0,padding:"0 0 0"}}>
        <div style={{display:"inline-block",border:"1px solid #2ef0d8",padding:"4px 12px",fontSize:10,letterSpacing:"0.2em",color:"#2ef0d8",fontFamily:"'DM Mono',monospace",marginBottom:12}}>LIVE SIMULATION</div>
        <div style={{background:"rgba(2,4,8,0.8)",borderLeft:"3px solid #2ef0d8",borderRadius:4,overflow:"hidden",marginBottom:20}}>
          <div style={{padding:"12px 16px 8px"}}><h2 style={{margin:0,fontSize:13,color:"#2ef0d8",fontFamily:"'DM Mono',monospace",letterSpacing:"0.15em",fontWeight:400}}>SEARCH · SEMANTIC INDEX · KNOWLEDGE RETRIEVAL · AETHER</h2><p style={{margin:"4px 0 8px",fontSize:10,color:"rgba(46,240,216,0.5)",fontFamily:"'DM Mono',monospace",letterSpacing:"0.1em"}}>20 knowledge nodes — the live AETHER semantic search simulation.</p></div>
          <SearchHeaderCanvas />
        </div>
      </div>
      <header className="space-y-4 shrink-0">
        <h1 className="text-4xl font-serif tracking-tight text-foreground flex items-center gap-3">
          <SearchIcon className="w-8 h-8 text-primary" />
          Semantic Query
        </h1>
        
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Query the topology..." 
              className="pl-12 h-14 bg-card/50 border-white/10 font-mono text-lg focus-visible:ring-primary shadow-inner"
            />
          </div>
          <Button type="submit" className="h-14 px-8 font-mono tracking-widest uppercase bg-primary hover:bg-primary/90 text-primary-foreground">
            Search
          </Button>
        </form>

        <div className="flex gap-2">
          <TypeToggle 
            active={type === "semantic"} 
            onClick={() => setType("semantic")} 
            icon={<Fingerprint className="w-4 h-4" />}
            label="Semantic" 
          />
          <TypeToggle 
            active={type === "concept"} 
            onClick={() => setType("concept")} 
            icon={<Hexagon className="w-4 h-4" />}
            label="Exact Match" 
          />
          <TypeToggle 
            active={type === "coherence"} 
            onClick={() => setType("coherence")} 
            icon={<Layers className="w-4 h-4" />}
            label="High Coherence" 
          />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pr-4 pb-8 space-y-4">
        {isFetching && !results ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : results && results.length > 0 ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {results.map((res, i) => (
              <Card key={`${res.id}-${i}`} className="p-5 bg-card border-white/5 hover:border-primary/30 transition-all cursor-pointer group">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-2xl text-foreground group-hover:text-primary transition-colors">{res.name}</h3>
                      <Badge variant="outline" className="font-mono text-[10px] uppercase border-white/10 text-muted-foreground">
                        {res.type}
                      </Badge>
                    </div>
                    {res.snippet && (
                      <p className="text-muted-foreground font-serif text-sm leading-relaxed max-w-3xl">
                        "{res.snippet}"
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="text-right">
                      <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Relevance</div>
                      <div className="font-mono text-lg text-accent">{(res.relevance * 100).toFixed(0)}%</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-[10px] text-muted-foreground uppercase mb-1">Coherence</div>
                      <div className="font-mono text-sm text-foreground">{(res.coherence * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : activeSearch.q ? (
          <div className="text-center py-20">
            <Hexagon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="font-serif text-lg text-muted-foreground italic">No topological matches found for this query.</p>
          </div>
        ) : (
           <div className="text-center py-20">
            <p className="font-mono text-sm text-muted-foreground tracking-widest uppercase">Awaiting query parameters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeToggle({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-xs transition-colors border ${
        active 
          ? "bg-primary/10 border-primary/50 text-primary" 
          : "bg-transparent border-white/10 text-muted-foreground hover:border-white/30 hover:text-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

import { Link, useLocation } from "wouter";
import { useHealthCheck } from "@workspace/api-client-react";
import { 
  Network, 
  UploadCloud, 
  Activity, 
  Search, 
  FunctionSquare,
  Cpu,
  Layers,
  Workflow,
  Waves,
  Brain,
  FlaskConical,
  Palette
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Graph Map", icon: Network },
  { href: "/ecosystem", label: "Ecosystem", icon: Brain },
  { href: "/architecture", label: "Architecture", icon: Layers },
  { href: "/pipeline", label: "Pipeline", icon: Workflow },
  { href: "/lattice", label: "CGLE Lattice", icon: Waves },
  { href: "/core", label: "Core Engine", icon: FlaskConical },
  { href: "/upload", label: "Ingest", icon: UploadCloud },
  { href: "/coherence", label: "Coherence", icon: Activity },
  { href: "/search", label: "Query", icon: Search },
  { href: "/equations", label: "Lab", icon: FunctionSquare },
  { href: "/cultural", label: "Cultural", icon: Palette },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: health } = useHealthCheck();
  const isHealthy = health?.status === "ok";

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary selection:text-primary-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar flex flex-col shrink-0">
        <div className="p-6 border-b border-border flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-serif text-xl tracking-widest text-foreground uppercase font-bold">AETHER</h1>
            <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
              <span className={cn("w-1.5 h-1.5 rounded-full", isHealthy ? "bg-primary animate-pulse" : "bg-destructive")} />
              {isHealthy ? "System Online" : "System Offline"}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer group relative overflow-hidden",
                    isActive 
                      ? "text-primary bg-primary/5" 
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary" />
                  )}
                  <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
                  <span className="font-mono text-sm tracking-wide">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <div className="text-xs font-mono text-muted-foreground/50 text-center">
            AETHER OS v1.2.0
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 relative flex flex-col min-w-0 overflow-hidden bg-background bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-background to-background">
        {children}
      </main>
    </div>
  );
}

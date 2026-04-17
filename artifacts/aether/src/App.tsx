import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";
import GraphView from "@/pages/graph-view";
import UploadView from "@/pages/upload";
import CoherenceView from "@/pages/coherence";
import SearchView from "@/pages/search";
import EquationsView from "@/pages/equations";
import ArchitectureView from "@/pages/architecture";
import PipelineView from "@/pages/pipeline";
import LatticeView from "@/pages/lattice";
import EcosystemView from "@/pages/ecosystem";
import CoreEngineView from "@/pages/core-engine";
import CulturalView from "@/pages/cultural";
import BiologyView from "@/pages/biology";
import ExperienceView from "@/pages/experience";
import ResonanceNoduleView from "@/pages/resonance-nodule";
import SourcesView from "@/pages/sources";
import DreamscapeView from "@/pages/dreamscape";
import SimulationView from "@/pages/simulation";
import QAetherView from "@/pages/q-aether";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={GraphView} />
        <Route path="/architecture" component={ArchitectureView} />
        <Route path="/upload" component={UploadView} />
        <Route path="/coherence" component={CoherenceView} />
        <Route path="/search" component={SearchView} />
        <Route path="/equations" component={EquationsView} />
        <Route path="/pipeline" component={PipelineView} />
        <Route path="/lattice" component={LatticeView} />
        <Route path="/ecosystem" component={EcosystemView} />
        <Route path="/core" component={CoreEngineView} />
        <Route path="/cultural" component={CulturalView} />
        <Route path="/biology" component={BiologyView} />
        <Route path="/experience" component={ExperienceView} />
        <Route path="/nodule" component={ResonanceNoduleView} />
        <Route path="/sources" component={SourcesView} />
        <Route path="/dreamscape" component={DreamscapeView} />
        <Route path="/simulation" component={SimulationView} />
        <Route path="/q-aether" component={QAetherView} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

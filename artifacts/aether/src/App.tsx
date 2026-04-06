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

import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Groups from "@/pages/groups";
import Friends from "@/pages/friends";
import Analytics from "@/pages/analytics";
import InviteAccept from "@/pages/invite-accept";
import OfflineIndicator from "@/components/layout/offline-indicator";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/groups" component={Groups} />
          <Route path="/friends" component={Friends} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/invite/:inviteCode" component={InviteAccept} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <OfflineIndicator />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

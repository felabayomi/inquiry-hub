import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUser } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Pages
import AuthPage from "@/pages/Auth";
import Home from "@/pages/Home";
import Inquiry from "@/pages/Inquiry";
import Resources from "@/pages/Resources";
import Meetings from "@/pages/Meetings";
import ReportBuilder from "@/pages/ReportBuilder";
import Settings from "@/pages/Settings";
import CohortOverview from "@/pages/CohortOverview";
import Account from "@/pages/Account";
import AIInsights from "@/pages/AIInsights";
import InquiryMapping from "@/pages/InquiryMapping";
import About from "@/pages/About";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Help from "@/pages/Help";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: React.ComponentType, adminOnly?: boolean }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  const [location] = useLocation();
  const { user, isLoading, isFetching, error, refetch } = useUser();
  const isPublicPage = ["/about", "/privacy", "/terms", "/help"].includes(location);

  if (!isPublicPage && error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm" role="alert">
          <h1 className="text-2xl font-serif font-bold text-slate-900">Unable to connect to Inquiry Hub</h1>
          <p className="text-slate-600">We couldn’t check your session. Please try again shortly. If this continues, contact your administrator.</p>
          <Button onClick={() => void refetch()} disabled={isFetching}>
            {isFetching ? "Connecting…" : "Try again"}
          </Button>
          <a href="/help" className="ml-4 text-sm underline text-slate-600">Visit Help</a>
        </div>
      </main>
    );
  }

  if (!isPublicPage && isLoading) {
     return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Redirect to home if logged in and trying to access auth
  if (user && location === "/auth") {
    return <Redirect to="/" />;
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      <Route path="/">
        <ProtectedRoute component={Home} />
      </Route>
      
      <Route path="/inquiry">
        <ProtectedRoute component={Inquiry} />
      </Route>
      
      <Route path="/resources">
        <ProtectedRoute component={Resources} />
      </Route>
      
      <Route path="/meetings">
        <ProtectedRoute component={Meetings} />
      </Route>
      
      <Route path="/report">
        <ProtectedRoute component={ReportBuilder} />
      </Route>
      
      <Route path="/settings">
        <ProtectedRoute component={Settings} adminOnly />
      </Route>

      <Route path="/cohort">
        <ProtectedRoute component={CohortOverview} adminOnly />
      </Route>

      <Route path="/mapping">
        <ProtectedRoute component={InquiryMapping} adminOnly />
      </Route>

      <Route path="/account">
        <ProtectedRoute component={Account} />
      </Route>

      <Route path="/ai-insights">
        <ProtectedRoute component={AIInsights} />
      </Route>

      <Route path="/about" component={About} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/help" component={Help} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

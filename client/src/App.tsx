import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";

// Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import BrowseReviews from "@/pages/browse-reviews";
import WriteReview from "@/pages/write-review";
import UserDashboard from "@/pages/user-dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Initialize categories on app start
  useEffect(() => {
    apiRequest("GET", "/api/init").catch(console.error);
  }, []);

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/browse" component={BrowseReviews} />
          <Route path="/write" component={WriteReview} />
          <Route path="/dashboard" component={UserDashboard} />
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
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initAuth } from "@/lib/api-service";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import ExplorePage from "@/pages/explore";
import EventDetailPage from "@/pages/event-detail";
import SignupPage from "@/pages/signup";
import LoginPage from "@/pages/login";
import ParticipantDashboard from "@/pages/dashboard/participant";
import OrganizerDashboard from "@/pages/dashboard/organizer";
import AdminDashboard from "@/pages/dashboard/admin";
import AnalyticsDashboard from "@/pages/dashboard/analytics";
import GalleryPage from "@/pages/gallery";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Initialize API configuration and auth on app startup
initAuth();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/explore" component={ExplorePage} />
      <Route path="/events/:id" component={EventDetailPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/dashboard/participant" component={ParticipantDashboard} />
      <Route path="/dashboard/organizer" component={OrganizerDashboard} />
      <Route path="/dashboard/admin" component={AdminDashboard} />
      <Route path="/dashboard/analytics" component={AnalyticsDashboard} />
      <Route path="/gallery" component={GalleryPage} />
      <Route component={NotFound} />
    </Switch>
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

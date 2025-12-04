import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register"; // Import the Register component
import PrivateRoute from "@/components/PrivateRoute";
import '@/lib/i18n'; // Initialize i18n

function Router() {
  return (
    <Switch>
      <PrivateRoute path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} /> {/* Add the Register route */}
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
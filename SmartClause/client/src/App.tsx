import React, { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Analyzer from "@/pages/analyzer";
import Generator from "@/pages/generator";
import QA from "@/pages/qa";
import Account from "@/pages/account";
import Login from "@/pages/auth/login";
import Signup from "@/pages/auth/signup";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useAuth } from "@/hooks/use-auth";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // Use useEffect to handle navigation to avoid setState in render error
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary border-opacity-50"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <Component {...rest} />;
}

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto md:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      
      <Route path="/">
        <AuthenticatedLayout>
          <ProtectedRoute component={Dashboard} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/dashboard">
        <AuthenticatedLayout>
          <ProtectedRoute component={Dashboard} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/analyzer">
        <AuthenticatedLayout>
          <ProtectedRoute component={Analyzer} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/generator">
        <AuthenticatedLayout>
          <ProtectedRoute component={Generator} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/qa">
        <AuthenticatedLayout>
          <ProtectedRoute component={QA} />
        </AuthenticatedLayout>
      </Route>
      
      <Route path="/account">
        <AuthenticatedLayout>
          <ProtectedRoute component={Account} />
        </AuthenticatedLayout>
      </Route>
      
      {/* Fallback to 404 */}
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

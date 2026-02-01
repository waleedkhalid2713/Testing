import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SiteLayout } from "@/components/site/SiteLayout";
import Bootcamp from "@/pages/Bootcamp";
import About from "@/pages/About";
import Resources from "@/pages/Resources";
import Contact from "@/pages/Contact";
import Legal from "@/pages/Legal";
import DailyForecastAdmin from "@/pages/DailyForecastAdmin";
import DailyForecastView from "@/pages/DailyForecastView";
import AdminLogin from "@/pages/AdminLogin";
import SignUp from "@/pages/SignUp";
import AdminDashboard from "@/pages/AdminDashboard";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import Auth from "@/pages/Auth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<SiteLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/bootcamp" element={<Bootcamp />} />
            <Route path="/about" element={<About />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/legal" element={<Legal />} />
            <Route
              path="/daily-forecast"
              element={
                <RequireAdmin>
                  <DailyForecastAdmin />
                </RequireAdmin>
              }
            />
            <Route path="/forecast" element={<DailyForecastView />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route
              path="/admin-dashboard"
              element={
                <RequireAdmin>
                  <AdminDashboard />
                </RequireAdmin>
              }
            />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

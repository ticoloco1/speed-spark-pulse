import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Racing from "./pages/Racing.tsx";
import PilotPage from "./pages/PilotPage.tsx";
import RenderTest from "./pages/RenderTest.tsx";
import Auth from "./pages/Auth.tsx";
import AuthCallback from "./pages/AuthCallback.tsx";
import PilotSetup from "./pages/PilotSetup.tsx";
import RacingProfile from "./pages/RacingProfile.tsx";
import Feed from "./pages/Feed.tsx";
import AdminSeed from "./pages/AdminSeed.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import { SubdomainGate } from "./components/SubdomainGate";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SubdomainGate />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/racing" element={<Racing />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/admin/seed" element={<AdminSeed />} />
            <Route path="/racing/render-test" element={<RenderTest />} />
            <Route path="/racing/profile/:slug" element={<RacingProfile />} />
            <Route path="/racing/profile" element={<RacingProfile />} />
            <Route path="/racing/:slug" element={<PilotPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/pilot/setup" element={<PilotSetup />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

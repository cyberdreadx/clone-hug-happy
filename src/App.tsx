import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import RSVPPage from "./pages/RSVP.tsx";
import Login from "./pages/Login.tsx";
import CheckIn from "./pages/CheckIn.tsx";
import AdminEvents from "./pages/admin/AdminEvents.tsx";
import AdminGuests from "./pages/admin/AdminGuests.tsx";
import AdminPartners from "./pages/admin/AdminPartners.tsx";
import AdminDeliverables from "./pages/admin/AdminDeliverables.tsx";
import AdminEventFlow from "./pages/admin/AdminEventFlow.tsx";
import PartnerPortal from "./pages/PartnerPortal.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rsvp" element={<RSVPPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminEvents />} />
          <Route path="/admin/guests" element={<AdminGuests />} />
          <Route path="/admin/partners" element={<AdminPartners />} />
          <Route path="/admin/deliverables" element={<AdminDeliverables />} />
          <Route path="/admin/event-flow" element={<AdminEventFlow />} />
          <Route path="/partner-portal" element={<PartnerPortal />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

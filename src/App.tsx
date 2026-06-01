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
import EventDetail from "./pages/EventDetail.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminEvents from "./pages/admin/AdminEvents.tsx";
import AdminGuests from "./pages/admin/AdminGuests.tsx";
import AdminPartners from "./pages/admin/AdminPartners.tsx";
import AdminDeliverables from "./pages/admin/AdminDeliverables.tsx";
import AdminOrders from "./pages/admin/AdminOrders.tsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.tsx";
import AdminSurveys from "./pages/admin/AdminSurveys.tsx";
import PartnerPortal from "./pages/PartnerPortal.tsx";
import PartnerRecap from "./pages/PartnerRecap.tsx";
import Survey from "./pages/Survey.tsx";
import ScrollToTop from "./components/ScrollToTop.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/rsvp" element={<RSVPPage />} />
          <Route path="/checkin" element={<CheckIn />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/events" element={<AdminEvents />} />
          <Route path="/admin/guests" element={<AdminGuests />} />
          <Route path="/admin/partners" element={<AdminPartners />} />
          <Route path="/admin/deliverables" element={<AdminDeliverables />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/surveys" element={<AdminSurveys />} />
          <Route path="/partner-portal" element={<PartnerPortal />} />
          <Route path="/recap/:recapId" element={<PartnerRecap />} />
          <Route path="/survey/:eventId" element={<Survey />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

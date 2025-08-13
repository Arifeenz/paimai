import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ItineraryProvider } from "@/contexts/ItineraryContext";
import VoiceAssistant from "@/components/chat/VoiceAssistant";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Plan from "./pages/Plan";
import AdminDashboard from "./pages/AdminDashboard";
import Category from "./pages/Category";
import ActivityDetail from "./pages/ActivityDetail";
import DestinationDetail from "./pages/DestinationDetail";
import RestaurantDetail from "./pages/RestaurantDetail";
import HotelDetail from "./pages/HotelDetail";
import PlaceDetail from "./pages/PlaceDetail";
import TransportationDetail from "./pages/TransportationDetail";
import TripDetail from "./pages/TripDetail";
import MyTrips from "./pages/MyTrips";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ItineraryProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/plan" element={<Plan />} />
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/category/:category" element={<Category />} />
                <Route path="/activity/:id" element={<ActivityDetail />} />
                <Route path="/destination/:id" element={<DestinationDetail />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/hotel/:id" element={<HotelDetail />} />
                <Route path="/place/:id" element={<PlaceDetail />} />
                <Route path="/transportation/:id" element={<TransportationDetail />} />
                <Route path="/trip/:id" element={<TripDetail />} />
                <Route path="/my-trips" element={<MyTrips />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
            <VoiceAssistant />
          </div>
        </BrowserRouter>
      </TooltipProvider>
      </ItineraryProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";
import Index from "./pages/Index";
import Prescription from "./pages/Prescription";
import Auth from "./pages/Auth";
import Products from "./pages/Products";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import BookAppointment from "./pages/BookAppointment";
import AppointmentsPage from "./pages/AppointmentsPage";
import CartPage from "./pages/CartPage";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Access role from metadata (user_metadata in typescript type, but raw_user_meta_data in actual response)
        const metadata = session.user.user_metadata || {};
        setUserRole(metadata.role || null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Access role from metadata (user_metadata in typescript type, but raw_user_meta_data in actual response)
        const metadata = session.user.user_metadata || {};
        setUserRole(metadata.role || null);
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return null; // or a loading spinner
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/auth"
              element={
                session ? 
                  userRole === 'doctor' ? 
                    <Navigate to="/doctor-dashboard" replace /> : 
                    userRole === 'admin' ?
                      <Navigate to="/admin-dashboard" replace /> :
                      <Navigate to="/" replace /> 
                  : <Auth />
              }
            />
            <Route path="/" element={<Index />} />
            <Route path="/products" element={<Products />} />
            
            {/* Protected Routes - common for all authenticated users */}
            <Route 
              path="/profile" 
              element={session ? <ProfilePage /> : <Navigate to="/auth" replace />}
            />
            
            {/* Cart Route */}
            <Route 
              path="/cart" 
              element={session ? <CartPage /> : <Navigate to="/auth" replace />}
            />
            
            {/* Doctor Routes */}
            <Route 
              path="/doctor-dashboard" 
              element={
                session && userRole === 'doctor' ? 
                  <DoctorDashboard /> : 
                  session ? <Navigate to="/" replace /> : <Navigate to="/auth" replace />
              }
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin-dashboard" 
              element={
                session && userRole === 'admin' ? 
                  <AdminDashboard /> : 
                  session ? <Navigate to="/" replace /> : <Navigate to="/auth" replace />
              }
            />
            
            {/* Patient Routes */}
            <Route
              path="/prescription"
              element={session ? <Prescription /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/book-appointment"
              element={session ? <BookAppointment /> : <Navigate to="/auth" replace />}
            />
            <Route
              path="/appointments"
              element={session ? <AppointmentsPage /> : <Navigate to="/auth" replace />}
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

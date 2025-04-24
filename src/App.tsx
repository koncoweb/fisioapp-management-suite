import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Layouts
import Layout from "@/components/Layout";

// Pages
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "./pages/NotFound";
import ProductManagement from "./pages/admin/ProductManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ProductManagement />
                </ProtectedRoute>
              } />
              <Route path="/employees" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>Employee Management (Coming soon)</div>
                </ProtectedRoute>
              } />
              <Route path="/services" element={<div>Therapy Services (Coming soon)</div>} />
              <Route path="/bookings" element={<div>Booking Management (Coming soon)</div>} />
              <Route path="/payments" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <div>Payment Records (Coming soon)</div>
                </ProtectedRoute>
              } />
              <Route path="/profile" element={<div>User Profile (Coming soon)</div>} />
            </Route>

            {/* Default route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
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
import EmployeeManagement from "./pages/admin/EmployeeManagement";
import PatientDashboard from "./pages/patients/Dashboard";
import BookingPage from "./pages/patients/BookingPage";
import BookingManagement from "./pages/admin/BookingManagement";
import Settings from "./pages/admin/Settings";
import PointOfSale from "./pages/admin/PointOfSale";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
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
                <Route path="/patients" element={<PatientDashboard />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/products" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ProductManagement />
                  </ProtectedRoute>
                } />
                <Route path="/employees" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <EmployeeManagement />
                  </ProtectedRoute>
                } />
                <Route path="/services" element={<div>Therapy Services (Coming soon)</div>} />
                <Route path="/bookings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BookingManagement />
                  </ProtectedRoute>
                } />
                <Route path="/pos" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <PointOfSale />
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={<div>Messages (Coming soon)</div>} />
                <Route path="/payments" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <div>Payment Records (Coming soon)</div>
                  </ProtectedRoute>
                } />
                <Route path="/notifications" element={<div>Notifications (Coming soon)</div>} />
                <Route path="/profile" element={<div>User Profile (Coming soon)</div>} />
                <Route path="/settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <Settings />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Default route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

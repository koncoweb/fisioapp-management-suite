
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
import KeuanganPage from "./pages/keuangan";
import AttendancePage from "./pages/AttendancePage";
import BiometricDataPage from "./pages/BiometricDataPage";
import AttendanceRekapPage from "./pages/AttendanceRekapPage";
import TherapySessionsPage from "./pages/therapist/TherapySessionsPage";
import TherapySessionsManagement from "./pages/admin/TherapySessionsManagement";
import TherapyPaymentsPage from "./pages/admin/TherapyPaymentsPage";
import TherapyReportsPage from "./pages/admin/TherapyReportsPage";
import TherapistSalaryPage from "./pages/admin/TherapistSalaryPage";

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
                <Route path="/keuangan" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <KeuanganPage />
                  </ProtectedRoute>
                } />
                <Route path="/attendance" element={
                  <ProtectedRoute allowedRoles={['admin', 'therapist', 'karyawan']}>
                    <AttendancePage />
                  </ProtectedRoute>
                } />
                <Route path="/attendance/biometric" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <BiometricDataPage />
                  </ProtectedRoute>
                } />
                <Route path="/attendance/rekap" element={
                  <ProtectedRoute allowedRoles={['admin', 'therapist', 'karyawan']}>
                    <AttendanceRekapPage />
                  </ProtectedRoute>
                } />
                <Route path="/therapy-sessions" element={
                  <ProtectedRoute allowedRoles={['therapist']}>
                    <TherapySessionsPage />
                  </ProtectedRoute>
                } />
                <Route path="/therapy-sessions-management" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TherapySessionsManagement />
                  </ProtectedRoute>
                } />
                <Route path="/therapy-payments" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TherapyPaymentsPage />
                  </ProtectedRoute>
                } />
                <Route path="/therapy-reports" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TherapyReportsPage />
                  </ProtectedRoute>
                } />
                <Route path="/therapist-salary" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <TherapistSalaryPage />
                  </ProtectedRoute>
                } />
                <Route path="/messages" element={<div>Messages (Coming soon)</div>} />
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

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Layout/Navbar';
import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';
import { TenantDashboard } from '@/pages/tenant/TenantDashboard';
import { OwnerDashboard } from '@/pages/owner/OwnerDashboard';
import { AddProperty } from '@/pages/owner/AddProperty';
import { MyProperties } from '@/pages/owner/MyProperties';
import { OwnerProperties } from '@/pages/owner/OwnerProperties';
import { OwnerRevenue } from '@/pages/owner/OwnerRevenue';
import { OwnerActivity } from '@/pages/owner/OwnerActivity';
import { OwnerTenants } from '@/pages/owner/OwnerTenants';
import { OwnerProfile } from '@/pages/owner/OwnerProfile';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminUsers } from '@/pages/admin/AdminUsers';
import { PropertyManagement } from '@/pages/admin/PropertyManagement';
import { AdminReports } from '@/pages/admin/AdminReports';
import { WatchmanDashboard } from '@/pages/watchman/WatchmanDashboard';
import { GuestPass } from '@/pages/tenant/GuestPass';
import { BookFlat } from '@/pages/tenant/BookFlat';
import { BookPG } from '@/pages/tenant/BookPG';
import { Properties } from '@/pages/tenant/Properties';
import { VerifyPass } from '@/pages/watchman/VerifyPass';
import NotFound from "./pages/NotFound";
import 'react-toastify/dist/ReactToastify.css';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles?: string[];
  redirectTo?: string;
}> = ({ 
  children, 
  allowedRoles,
  redirectTo 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Use custom redirect or default to role-specific dashboard
    const defaultRedirect = getRoleDashboard(user.role);
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  return <>{children}</>;
};

// Helper function to get role-specific dashboard
const getRoleDashboard = (role: string): string => {
  switch (role) {
    case 'TENANT':
      return '/tenant/dashboard';
    case 'OWNER':
      return '/owner/dashboard';
    case 'ADMIN':
      return '/admin/dashboard';
    case 'WATCHMAN':
      return '/watchman/dashboard';
    default:
      return '/dashboard';
  }
};

const DashboardRoute: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'TENANT':
      return <TenantDashboard />;
    case 'OWNER':
      return <OwnerDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'WATCHMAN':
      return <WatchmanDashboard />;
    default:
      return <TenantDashboard />;
  }
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {user && <Navbar />}
      <Routes>
        {/* Public Routes - Redirect authenticated users to dashboard */}
        <Route path="/" element={!user ? <Landing /> : <Navigate to={getRoleDashboard(user.role)} replace />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to={getRoleDashboard(user.role)} replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to={getRoleDashboard(user.role)} replace />} />
        
        {/* Main Dashboard Route - Auto-redirect to role-specific dashboard */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardRoute />
          </ProtectedRoute>
        } />
        
        {/* Role-specific Dashboard Routes */}
        <Route path="/tenant/dashboard" element={
          <ProtectedRoute allowedRoles={['TENANT']}>
            <TenantDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/dashboard" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/watchman/dashboard" element={
          <ProtectedRoute allowedRoles={['WATCHMAN']}>
            <WatchmanDashboard />
          </ProtectedRoute>
        } />
        
        {/* Tenant-specific Routes */}
        <Route path="/properties" element={
          <ProtectedRoute allowedRoles={['TENANT', 'ADMIN']}>
            <Properties />
          </ProtectedRoute>
        } />
        
        <Route path="/guest-pass" element={
          <ProtectedRoute allowedRoles={['TENANT']}>
            <GuestPass />
          </ProtectedRoute>
        } />
        
        <Route path="/book/flat/:id" element={
          <ProtectedRoute allowedRoles={['TENANT']}>
            <BookFlat />
          </ProtectedRoute>
        } />
        
        <Route path="/book/pg/:id" element={
          <ProtectedRoute allowedRoles={['TENANT']}>
            <BookPG />
          </ProtectedRoute>
        } />
        
        <Route path="/my-bookings" element={
          <ProtectedRoute allowedRoles={['TENANT']}>
            <Navigate to="/tenant/dashboard" replace />
          </ProtectedRoute>
        } />
        
        {/* Owner-specific Routes */}
        <Route path="/owner/add-property" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <AddProperty />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/my-properties" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <MyProperties />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/properties" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerProperties />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/revenue" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerRevenue />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/activity" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerActivity />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/tenants" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerTenants />
          </ProtectedRoute>
        } />
        
        <Route path="/owner/profile" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <OwnerProfile />
          </ProtectedRoute>
        } />
        
        <Route path="/my-properties" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <Navigate to="/owner/my-properties" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/add-property" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <Navigate to="/owner/add-property" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/tenant-requests" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <Navigate to="/owner/dashboard" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/revenue-reports" element={
          <ProtectedRoute allowedRoles={['OWNER']}>
            <Navigate to="/owner/revenue" replace />
          </ProtectedRoute>
        } />
        
        {/* Watchman-specific Routes */}
        <Route path="/verify-pass" element={
          <ProtectedRoute allowedRoles={['WATCHMAN']}>
            <VerifyPass />
          </ProtectedRoute>
        } />
        
        <Route path="/active-passes" element={
          <ProtectedRoute allowedRoles={['WATCHMAN']}>
            <Navigate to="/watchman/dashboard" replace />
          </ProtectedRoute>
        } />
        
        {/* Admin-specific Routes */}
        <Route path="/admin/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/properties" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <PropertyManagement />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/reports" element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminReports />
          </ProtectedRoute>
        } />
        
        {/* Legacy route redirections */}
        <Route path="/users" element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/dashboard">
            <Navigate to="/admin/users" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/system-settings" element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/dashboard">
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/reports" element={
          <ProtectedRoute allowedRoles={['ADMIN', 'OWNER']} redirectTo="/dashboard">
            <Navigate to={user?.role === 'ADMIN' ? '/admin/reports' : getRoleDashboard(user?.role || '')} replace />
          </ProtectedRoute>
        } />
        
        <Route path="/security" element={
          <ProtectedRoute allowedRoles={['ADMIN']} redirectTo="/admin/dashboard">
            <Navigate to="/admin/dashboard" replace />
          </ProtectedRoute>
        } />
        
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

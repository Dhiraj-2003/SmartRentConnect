import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RouteGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Verifying access...</span>
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not logged in
  if (requireAuth && !user) {
    // Save the attempted URL to redirect back after login
    sessionStorage.setItem('redirectAfterLogin', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    // Show unauthorized message
    toast.error(`Access denied. This page is restricted to ${allowedRoles.join(', ')} users.`);
    
    // Redirect to custom path or role-specific dashboard
    const defaultRedirect = getRoleDashboard(user.role);
    return <Navigate to={redirectTo || defaultRedirect} replace />;
  }

  // Render the protected content
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

// Higher-order component for easy route protection
export const withRouteGuard = (
  Component: React.ComponentType,
  allowedRoles?: string[],
  redirectTo?: string
) => {
  return (props: any) => (
    <RouteGuard allowedRoles={allowedRoles} redirectTo={redirectTo}>
      <Component {...props} />
    </RouteGuard>
  );
};

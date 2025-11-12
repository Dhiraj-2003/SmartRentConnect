import { UserRole } from '@/contexts/AuthContext';

/**
 * Comprehensive redirection utilities for SmartRentConnect
 */

// Role-based dashboard routes
export const DASHBOARD_ROUTES = {
  TENANT: '/tenant/dashboard',
  OWNER: '/owner/dashboard',
  ADMIN: '/admin/dashboard',
  WATCHMAN: '/watchman/dashboard',
} as const;

// Role-based allowed routes
export const ROLE_ROUTES: Record<UserRole, string[]> = {
  TENANT: [
    '/tenant/dashboard',
    '/properties',
    '/properties/:id',
    '/guest-pass',
    '/my-bookings',
  ],
  OWNER: [
    '/owner/dashboard',
    '/owner/properties',
    '/owner/add-property',
    '/owner/my-properties',
    '/owner/revenue',
    '/owner/activity',
    '/owner/tenants',
    '/owner/profile',
    '/add-property',
    '/my-properties',
    '/tenant-requests',
    '/revenue-reports',
    '/properties/:id', // Can view property details
  ],
  ADMIN: [
    '/admin/dashboard',
    '/admin/users',
    '/admin/properties', 
    '/admin/reports',
    '/properties', // Can view all properties
    '/properties/:id',
    '/revenue-reports',
    '/users',
    '/system-settings',
    '/reports',
    '/security',
  ],
  WATCHMAN: [
    '/watchman/dashboard',
    '/verify-pass',
    '/active-passes',
  ],
};

/**
 * Get the default dashboard route for a user role
 */
export const getDashboardRoute = (role: UserRole): string => {
  return DASHBOARD_ROUTES[role] || '/dashboard';
};

/**
 * Check if a user role has access to a specific route
 */
export const hasRouteAccess = (role: UserRole, path: string): boolean => {
  const allowedRoutes = ROLE_ROUTES[role] || [];
  
  // Check exact match first
  if (allowedRoutes.includes(path)) {
    return true;
  }
  
  // Check pattern matches (e.g., /properties/:id)
  return allowedRoutes.some((route: string) => {
    if (route.includes(':')) {
      const pattern = route.replace(/:[^/]+/g, '[^/]+');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(path);
    }
    return false;
  });
};

/**
 * Get redirect URL for unauthorized access
 */
export const getUnauthorizedRedirect = (userRole: UserRole, attemptedPath: string): string => {
  // If user tried to access a dashboard they don't have permission for
  if (attemptedPath.includes('/dashboard')) {
    return getDashboardRoute(userRole);
  }
  
  // If user tried to access admin routes
  if (attemptedPath.startsWith('/admin/')) {
    return userRole === 'ADMIN' ? '/admin/dashboard' : getDashboardRoute(userRole);
  }
  
  // If user tried to access owner routes
  if (attemptedPath.startsWith('/owner/') || attemptedPath.includes('my-properties')) {
    return userRole === 'OWNER' ? '/owner/dashboard' : getDashboardRoute(userRole);
  }
  
  // If user tried to access tenant routes
  if (attemptedPath.startsWith('/tenant/') || attemptedPath.includes('guest-pass')) {
    return userRole === 'TENANT' ? '/tenant/dashboard' : getDashboardRoute(userRole);
  }
  
  // If user tried to access watchman routes
  if (attemptedPath.startsWith('/watchman/') || attemptedPath.includes('verify-pass')) {
    return userRole === 'WATCHMAN' ? '/watchman/dashboard' : getDashboardRoute(userRole);
  }
  
  // Default to user's dashboard
  return getDashboardRoute(userRole);
};

/**
 * Handle post-login redirection
 */
export const handlePostLoginRedirect = (navigate: (path: string) => void): void => {
  // Check if there's a saved redirect URL
  const savedRedirect = sessionStorage.getItem('redirectAfterLogin');
  
  if (savedRedirect) {
    sessionStorage.removeItem('redirectAfterLogin');
    navigate(savedRedirect);
    return;
  }
  
  // Get user data and redirect to appropriate dashboard
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    const dashboardRoute = getDashboardRoute(user.role);
    navigate(dashboardRoute);
  } else {
    navigate('/dashboard'); // Fallback
  }
};

/**
 * Save current path for post-login redirect
 */
export const saveRedirectPath = (path: string): void => {
  // Don't save auth-related paths
  if (path === '/login' || path === '/register' || path === '/') {
    return;
  }
  
  sessionStorage.setItem('redirectAfterLogin', path);
};

/**
 * Clear saved redirect path
 */
export const clearRedirectPath = (): void => {
  sessionStorage.removeItem('redirectAfterLogin');
};

/**
 * Get appropriate error message for unauthorized access
 */
export const getAccessDeniedMessage = (userRole: UserRole, attemptedPath: string): string => {
  const roleNames = {
    TENANT: 'Tenant',
    OWNER: 'Owner', 
    ADMIN: 'Admin',
    WATCHMAN: 'Watchman'
  };
  
  if (attemptedPath.startsWith('/admin/')) {
    return 'This page is restricted to Admin users only.';
  }
  
  if (attemptedPath.startsWith('/owner/')) {
    return 'This page is restricted to Property Owner users only.';
  }
  
  if (attemptedPath.startsWith('/tenant/')) {
    return 'This page is restricted to Tenant users only.';
  }
  
  if (attemptedPath.startsWith('/watchman/')) {
    return 'This page is restricted to Watchman users only.';
  }
  
  return `Access denied. You are logged in as ${roleNames[userRole]} but this page requires different permissions.`;
};

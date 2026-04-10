import { UserRole } from '@/contexts/AuthContext';

/**
 * Get the dashboard route based on user role
 */
export const getDashboardRoute = (role: UserRole): string => {
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

/**
 * Navigate to role-specific dashboard after login
 */
export const navigateToRoleDashboard = (navigate: (path: string) => void) => {
  const userData = localStorage.getItem('user');
  console.log('Navigation - userData:', userData); // Debug log
  
  if (userData) {
    const user = JSON.parse(userData);
    console.log('Navigation - parsed user:', user); // Debug log
    
    const dashboardRoute = getDashboardRoute(user.role);
    console.log('Navigation - dashboard route:', dashboardRoute); // Debug log
    
    navigate(dashboardRoute);
  } else {
    console.log('Navigation - no user data, going to /dashboard'); // Debug log
    navigate('/dashboard');
  }
};

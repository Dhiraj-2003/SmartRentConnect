import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

export type UserRole = 'TENANT' | 'OWNER' | 'ADMIN' | 'WATCHMAN';

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName?: string;
  phoneNumber?: string;
  roomNumber?: string;
  // Owner-specific fields
  isProfileComplete?: boolean;
  isVerified?: boolean;
  isOnlinePaymentEnabled?: boolean;
  verificationStatus?: string;
  razorpayOnboardingStatus?: string;
  razorpayAccountId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (identifier: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  redirectToDashboard: () => string;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  role: 'tenant' | 'owner' | 'admin' | 'watchman';
  fullName: string;
  phoneNumber: string;
  roomNumber?: string;
  businessName?: string;
  gstNumber?: string;
  address?: string;
  designation?: string;
  shiftTiming?: string;
  assignedBuilding?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (identifier: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(identifier, password);
      console.log('Login response:', response.data); // Debug log
      
      const { token, username, email, roleName } = response.data;
      
      const user: User = {
        id: username, // Using username as ID for now
        username,
        email,
        role: roleName.toUpperCase() as UserRole,
      };

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
      setUser(user);
      console.log('User set:', user); // Debug log
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    try {
      let response;
      
      switch (userData.role) {
        case 'tenant':
          response = await authAPI.registerTenant({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            roomNumber: userData.roomNumber,
            address: userData.address,
          });
          break;
        case 'owner':
          response = await authAPI.registerOwner({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            businessName: userData.businessName,
            gstNumber: userData.gstNumber,
            address: userData.address,
          });
          break;
        case 'admin':
          response = await authAPI.registerAdmin({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            designation: userData.designation,
          });
          break;
        case 'watchman':
          response = await authAPI.registerWatchman({
            username: userData.username,
            email: userData.email,
            password: userData.password,
            fullName: userData.fullName,
            phoneNumber: userData.phoneNumber,
            shiftTiming: userData.shiftTiming,
            assignedBuilding: userData.assignedBuilding,
          });
          break;
        default:
          throw new Error('Invalid role');
      }

      toast.success(response.data);
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const redirectToDashboard = (): string => {
    if (!user) return '/login';
    
    switch (user.role) {
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

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    redirectToDashboard,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
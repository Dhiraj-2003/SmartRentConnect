import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/enhanced-button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { ownerAPI } from '@/lib/api';
import { 
  Home, 
  Building, 
  CreditCard, 
  MessageCircle, 
  Users, 
  FileText, 
  QrCode,
  ScanLine,
  LogOut,
  User,
  Plus,
  Calendar,
  BookOpen,
  History
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [ownerProfile, setOwnerProfile] = useState<any>(null);

  // Fetch owner profile data if user is an owner
  useEffect(() => {
    const fetchOwnerProfile = async () => {
      if (user?.role === 'OWNER') {
        try {
          const response = await ownerAPI.getProfile();
          setOwnerProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch owner profile:', error);
        }
      }
    };

    fetchOwnerProfile();
  }, [user]);

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case 'TENANT':
        return [
          { label: 'Dashboard', path: '/tenant/dashboard', icon: Home },
          { label: 'Properties', path: '/properties', icon: Building },
          { label: 'My Bookings', path: '/tenant/bookings', icon: BookOpen },
          { label: 'My Complaints', path: '/complaints', icon: FileText },
                    { label: 'Guest Pass', path: '/guest-pass', icon: QrCode },
        ];
      case 'OWNER':
        return [
          { label: 'Dashboard', path: '/owner/dashboard', icon: Home },
          { label: 'Properties', path: '/owner/properties', icon: Building },
          { label: 'Revenue', path: '/owner/revenue', icon: CreditCard },
          { label: 'Complaints', path: '/owner/activity', icon: Calendar },
          { label: 'Tenants', path: '/owner/tenants', icon: Users },
          { label: 'Profile', path: '/owner/profile', icon: User },
        ];
      case 'ADMIN':
        return [
          { label: 'Dashboard', path: '/admin/dashboard', icon: Home },
          { label: 'Users', path: '/admin/users', icon: Users },
          { label: 'Properties', path: '/admin/properties', icon: Building },
          { label: 'Reports', path: '/admin/reports', icon: FileText },
        ];
      case 'WATCHMAN':
        return [
          { label: 'Dashboard', path: '/watchman/dashboard', icon: Home },
          { label: 'Verify Pass', path: '/verify-pass', icon: ScanLine },
          { label: 'Active Passes', path: '/active-passes', icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();


  return (
    <nav className="bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Building className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">SmartRentConnect</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-smooth flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2">
                <UserAvatar
                  user={user.role === 'OWNER' && ownerProfile ? { ...user, profileImage: ownerProfile.profileImage } : user}
                  size="md"
                  showEditOverlay={user.role === 'OWNER'}
                  onClick={user.role === 'OWNER' ? () => navigate('/owner/profile') : undefined}
                />
                <span className="text-xs text-muted-foreground bg-accent px-2 py-1 rounded-full capitalize">
                  {user.role}
                </span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden border-t border-border">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-smooth flex items-center space-x-2 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

    </nav>
  );
};
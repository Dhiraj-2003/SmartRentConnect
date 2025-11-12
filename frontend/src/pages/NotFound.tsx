import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/enhanced-button';
import { Home, ArrowLeft, User, Building, Shield, Eye } from 'lucide-react';

const NotFound: React.FC = () => {
  const { user, redirectToDashboard } = useAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'TENANT':
        return User;
      case 'OWNER':
        return Building;
      case 'ADMIN':
        return Shield;
      case 'WATCHMAN':
        return Eye;
      default:
        return Home;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TENANT':
        return 'Tenant Dashboard';
      case 'OWNER':
        return 'Owner Dashboard';
      case 'ADMIN':
        return 'Admin Dashboard';
      case 'WATCHMAN':
        return 'Watchman Dashboard';
      default:
        return 'Dashboard';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md mx-auto px-4">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or you don't have permission to access it.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user ? (
            <>
              <Link to={redirectToDashboard()}>
                <Button className="w-full sm:w-auto">
                  {React.createElement(getRoleIcon(user.role), { className: "w-4 h-4 mr-2" })}
                  {getRoleLabel(user.role)}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={() => window.history.back()}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </>
          ) : (
            <>
              <Link to="/">
                <Button className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="w-full sm:w-auto">
                  <User className="w-4 h-4 mr-2" />
                  Login
                </Button>
              </Link>
            </>
          )}
        </div>

        {user && (
          <div className="mt-8 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium text-foreground">{user.username}</span> ({user.role})
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotFound;

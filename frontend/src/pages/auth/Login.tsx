import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/Layout/AuthLayout';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { navigateToRoleDashboard } from '@/utils/navigation';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', email); // Debug log
      const success = await login(email, password);
      console.log('Login success:', success); // Debug log
      
      if (success) {
        toast.success('Login successful!');
        
        // Check if there's a redirect URL saved before login
        const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
        sessionStorage.removeItem('redirectAfterLogin');
        
        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          // Navigate to role-specific dashboard
          navigateToRoleDashboard(navigate);
        }
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login component error:', error); // Debug log
      toast.error('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'tenant@test.com', role: 'Tenant' },
    { email: 'owner@test.com', role: 'Owner' },
    { email: 'admin@test.com', role: 'Admin' },
    { email: 'watchman@test.com', role: 'Watchman' },
  ];

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to your SmartRent account"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
            className="mt-1"
          />
        </div>

        <Button
          type="submit"
          variant="gradient"
          size="lg"
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="mt-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-primary hover:text-primary/80 transition-smooth"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center mb-3">
            Demo Accounts (Password: password)
          </p>
          <div className="grid grid-cols-2 gap-2">
            {demoAccounts.map((account) => (
              <Button
                key={account.email}
                variant="outline"
                size="sm"
                onClick={() => {
                  setEmail(account.email);
                  setPassword('password');
                }}
                className="text-xs"
              >
                {account.role}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};
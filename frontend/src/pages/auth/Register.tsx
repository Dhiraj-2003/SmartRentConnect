import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '@/components/Layout/AuthLayout';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'tenant' | 'owner' | 'admin' | 'watchman',
    phoneNumber: '',
    roomNumber: '',
    address: '',
    businessName: '',
    gstNumber: '',
    designation: '',
    shiftTiming: '',
    assignedBuilding: '',
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.role) {
      toast.error('Please select a role');
      return;
    }

    setLoading(true);

    try {
      const success = await register(formData);
      if (success) {
        toast.success('Registration successful!');
        navigate('/dashboard');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join SmartRent and manage your properties"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleChange('username', e.target.value)}
            placeholder="Enter your username"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="Enter your full name"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Enter your email"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleChange('phoneNumber', e.target.value)}
            placeholder="Enter your phone number"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="role">I am a</Label>
          <Select value={formData.role} onValueChange={(value) => handleChange('role', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tenant">Tenant</SelectItem>
              <SelectItem value="owner">Property Owner</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="watchman">Watchman</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Role-specific fields */}
        {formData.role === 'tenant' && (
          <>
            <div>
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                type="text"
                value={formData.roomNumber}
                onChange={(e) => handleChange('roomNumber', e.target.value)}
                placeholder="Enter your room number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter your address"
                required
                className="mt-1"
              />
            </div>
          </>
        )}

        {formData.role === 'owner' && (
          <>
            <div>
              <Label htmlFor="businessName">Business Name (Optional)</Label>
              <Input
                id="businessName"
                type="text"
                value={formData.businessName}
                onChange={(e) => handleChange('businessName', e.target.value)}
                placeholder="Enter your business name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="gstNumber">GST Number (Optional)</Label>
              <Input
                id="gstNumber"
                type="text"
                value={formData.gstNumber}
                onChange={(e) => handleChange('gstNumber', e.target.value)}
                placeholder="Enter your GST number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Enter your address"
                required
                className="mt-1"
              />
            </div>
          </>
        )}

        {formData.role === 'admin' && (
          <div>
            <Label htmlFor="designation">Designation (Optional)</Label>
            <Input
              id="designation"
              type="text"
              value={formData.designation}
              onChange={(e) => handleChange('designation', e.target.value)}
              placeholder="Enter your designation"
              className="mt-1"
            />
          </div>
        )}

        {formData.role === 'watchman' && (
          <>
            <div>
              <Label htmlFor="shiftTiming">Shift Timing</Label>
              <Select value={formData.shiftTiming} onValueChange={(value) => handleChange('shiftTiming', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select shift timing" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="assignedBuilding">Assigned Building</Label>
              <Input
                id="assignedBuilding"
                type="text"
                value={formData.assignedBuilding}
                onChange={(e) => handleChange('assignedBuilding', e.target.value)}
                placeholder="Enter assigned building"
                required
                className="mt-1"
              />
            </div>
          </>
        )}

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            placeholder="Create a password"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80 transition-smooth"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
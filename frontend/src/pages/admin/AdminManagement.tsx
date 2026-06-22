import React, { useState } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';
import { UserPlus, ArrowLeft, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminManagement: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    designation: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await adminAPI.registerAdmin({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        designation: formData.designation,
      });
      toast.success('Admin registered successfully!');
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        designation: '',
      });
    } catch (error: any) {
      console.error('Failed to register admin:', error);
      toast.error(error.response?.data?.message || 'Failed to register admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/admin/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Management
        </h1>
        <p className="text-muted-foreground">
          Add new administrators to the system
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Register New Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleChange('username', e.target.value)}
                  placeholder="Enter username"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="Enter email address"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Create password"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm password"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="designation">Designation (Optional)</Label>
                <Input
                  id="designation"
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleChange('designation', e.target.value)}
                  placeholder="E.g., Super Admin, Support Admin"
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
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Registering Admin...' : 'Register Admin'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Important Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Only existing admins can register new admins</p>
            <p>• New admins will have full system access</p>
            <p>• Use strong passwords for admin accounts</p>
            <p>• Designations help identify admin roles</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

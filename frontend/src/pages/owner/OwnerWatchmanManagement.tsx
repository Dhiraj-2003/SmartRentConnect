import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ownerAPI } from '@/lib/api';
import { UserPlus, ArrowLeft, Shield, Clock, Building, Users, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const OwnerWatchmanManagement: React.FC = () => {
  const [ownerProperties, setOwnerProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    shiftTiming: '',
    assignedBuilding: '',
  });

  useEffect(() => {
    loadOwnerProperties();
  }, []);

  const loadOwnerProperties = async () => {
    try {
      const response = await ownerAPI.getProperties();
      setOwnerProperties(response.data || []);
    } catch (error) {
      console.error('Failed to load properties:', error);
      setOwnerProperties([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!formData.username || !formData.fullName || !formData.email || !formData.phoneNumber || !formData.password || !formData.shiftTiming) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      await ownerAPI.registerWatchman({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        shiftTiming: formData.shiftTiming,
        assignedBuilding: formData.assignedBuilding,
      });
      toast.success('Watchman registered successfully!');
      setFormData({
        username: '',
        fullName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        shiftTiming: '',
        assignedBuilding: '',
      });
      setShowForm(false);
    } catch (error: any) {
      console.error('Failed to register watchman:', error);
      toast.error(error.response?.data?.message || 'Failed to register watchman. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      username: '',
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
      shiftTiming: '',
      assignedBuilding: '',
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/owner/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Manage Watchmen
        </h1>
        <p className="text-muted-foreground">
          View and manage watchmen assigned to your properties
        </p>
      </div>

      {!showForm ? (
        // List View
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Your Watchmen
              </CardTitle>
              <Button
                variant="gradient"
                onClick={() => setShowForm(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Watchman
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Shield className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Watchmen Added Yet</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't added any watchmen to manage your properties yet.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Watchman
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Important Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Watchmen will be able to scan guest passes and verify entries</p>
              <p>• Shift timing determines when the watchman is on duty</p>
              <p>• You can assign watchmen to specific properties</p>
              <p>• Watchmen will receive login credentials via email</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Form View
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="w-5 h-5 mr-2" />
                Register New Watchman
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
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
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    placeholder="Enter full name"
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
                    placeholder="Enter email"
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
                    placeholder="Enter phone number"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="shiftTiming">Shift Timing</Label>
                  <Select value={formData.shiftTiming} onValueChange={(value) => handleChange('shiftTiming', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select shift timing" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Day">Day Shift</SelectItem>
                      <SelectItem value="Night">Night Shift</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assignedBuilding">Assigned Building (Optional)</Label>
                  <Select value={formData.assignedBuilding} onValueChange={(value) => handleChange('assignedBuilding', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select building to assign" />
                    </SelectTrigger>
                    <SelectContent>
                      {ownerProperties.map((property) => (
                        <SelectItem key={property.id} value={property.title}>
                          {property.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

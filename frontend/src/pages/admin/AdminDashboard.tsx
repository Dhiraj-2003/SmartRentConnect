import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminStats } from '@/components/admin/AdminStats';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { GuestPassManagement } from '@/components/admin/GuestPassManagement';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Users, 
  Building, 
  AlertTriangle, 
  TrendingUp,
  UserPlus,
  Settings,
  FileText,
  Shield,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, usersResponse, revenueResponse] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllUsers({ page: 0, size: 10 }),
        adminAPI.getRevenueReport(),
      ]);

      setDashboardStats(statsResponse.data);
      setUsers(usersResponse.data.content || usersResponse.data);
      setRevenueData(revenueResponse.data);
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await adminAPI.getAllUsers({ page: 0, size: 50 });
      setUsers(response.data.content || response.data);
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setUsersLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    await adminAPI.deleteUser(userId.toString());
    await loadUsers();
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.username} • System administration and management
        </p>
      </div>

      {/* Stats Grid */}
      {dashboardStats && (
        <div className="mb-8">
          <AdminStats stats={dashboardStats} />
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Administrative Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/admin/users">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <UserPlus className="w-5 h-5" />
              <span className="text-sm">Manage Users</span>
            </Button>
          </Link>
          <Link to="/admin/properties">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <Building className="w-5 h-5" />
              <span className="text-sm">Manage Properties</span>
            </Button>
          </Link>
          <Link to="/admin/reports">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <FileText className="w-5 h-5" />
              <span className="text-sm">Generate Reports</span>
            </Button>
          </Link>
          <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
            <Shield className="w-5 h-5" />
            <span className="text-sm">Security Logs</span>
          </Button>
        </div>
      </div>
    </div>
  );
};
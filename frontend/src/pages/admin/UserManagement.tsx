import React, { useState, useEffect } from 'react';
import { UserManagementTable } from '@/components/admin/UserManagementTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Users, 
  UserCheck, 
  Building, 
  Shield, 
  Eye,
  RefreshCw,
  Plus,
  Download
} from 'lucide-react';

interface UserStats {
  totalUsers: number;
  totalTenants: number;
  totalOwners: number;
  totalWatchmen: number;
  totalAdmins: number;
}

export const UserManagement: React.FC = () => {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [watchmen, setWatchmen] = useState<any[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    totalTenants: 0,
    totalOwners: 0,
    totalWatchmen: 0,
    totalAdmins: 0
  });

  useEffect(() => {
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      setLoading(true);
      const [allUsersResponse, tenantsResponse, ownersResponse, watchmenResponse] = await Promise.all([
        adminAPI.getAllUsers({ page: 0, size: 1000 }),
        adminAPI.getUsersByRole('TENANT', { page: 0, size: 1000 }),
        adminAPI.getUsersByRole('OWNER', { page: 0, size: 1000 }),
        adminAPI.getUsersByRole('WATCHMAN', { page: 0, size: 1000 }),
      ]);

      const allUsersData = allUsersResponse.data.content || allUsersResponse.data;
      const tenantsData = tenantsResponse.data.content || tenantsResponse.data;
      const ownersData = ownersResponse.data.content || ownersResponse.data;
      const watchmenData = watchmenResponse.data.content || watchmenResponse.data;
      const adminsData = allUsersData.filter((user: any) => user.role === 'ADMIN');

      setAllUsers(allUsersData);
      setTenants(tenantsData);
      setOwners(ownersData);
      setWatchmen(watchmenData);
      setAdmins(adminsData);

      setStats({
        totalUsers: allUsersData.length,
        totalTenants: tenantsData.length,
        totalOwners: ownersData.length,
        totalWatchmen: watchmenData.length,
        totalAdmins: adminsData.length
      });
    } catch (error: any) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    await adminAPI.deleteUser(userId.toString());
    await loadAllUsers(); // Reload all data
  };

  const exportUsers = (users: any[], filename: string) => {
    const csvContent = [
      ['ID', 'Username', 'Email', 'Full Name', 'Role', 'Phone', 'Created At'].join(','),
      ...users.map(user => [
        user.id,
        user.username,
        user.email,
        user.fullName || '',
        user.role,
        user.phoneNumber || '',
        user.createdAt || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              User Management
            </h1>
            <p className="text-muted-foreground">
              Manage users across all roles and monitor platform activity
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadAllUsers} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <UserCheck className="w-4 h-4 mr-2" />
              Tenants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalTenants}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Owners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalOwners}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Watchmen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalWatchmen}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Shield className="w-4 h-4 mr-2" />
              Admins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.totalAdmins}</div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid w-full max-w-md grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tenants">Tenants</TabsTrigger>
            <TabsTrigger value="owners">Owners</TabsTrigger>
            <TabsTrigger value="watchmen">Watchmen</TabsTrigger>
            <TabsTrigger value="admins">Admins</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Users ({allUsers.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportUsers(allUsers, 'all-users')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserManagementTable
                users={allUsers}
                loading={loading}
                onDeleteUser={handleDeleteUser}
                onRefresh={loadAllUsers}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tenants" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tenants ({tenants.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportUsers(tenants, 'tenants')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserManagementTable
                users={tenants}
                loading={loading}
                onDeleteUser={handleDeleteUser}
                onRefresh={loadAllUsers}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="owners" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Property Owners ({owners.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportUsers(owners, 'owners')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserManagementTable
                users={owners}
                loading={loading}
                onDeleteUser={handleDeleteUser}
                onRefresh={loadAllUsers}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watchmen" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Watchmen ({watchmen.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportUsers(watchmen, 'watchmen')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserManagementTable
                users={watchmen}
                loading={loading}
                onDeleteUser={handleDeleteUser}
                onRefresh={loadAllUsers}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>System Administrators ({admins.length})</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportUsers(admins, 'admins')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <UserManagementTable
                users={admins}
                loading={loading}
                onDeleteUser={handleDeleteUser}
                onRefresh={loadAllUsers}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

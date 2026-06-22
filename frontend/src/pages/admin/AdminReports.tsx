import React, { useState, useEffect } from 'react';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Building,
  Calendar,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

interface ReportData {
  revenue: any;
  userActivity: {
    newRegistrations: {
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
    activeUsers: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    userDistribution: {
      tenants: number;
      owners: number;
      watchmen: number;
      admins: number;
      totalUsers: number;
    };
  };
  propertyStats: {
    totalListings: number;
    approvedListings: number;
    pendingApproval: number;
    rejectedListings: number;
    averageRent: number;
    occupancyRate: number;
    propertyTypeDistribution: {
      flats: number;
      pgs: number;
      total: number;
    };
  };
  guestPassStats: any;
}

export const AdminReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('last30days');

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [revenueResponse, userActivityResponse, propertyStatsResponse, guestPassResponse] = await Promise.all([
        adminAPI.getRevenueReport(),
        adminAPI.getUserActivityStats(),
        adminAPI.getPropertyStats(),
        adminAPI.getAllGuestPasses({ page: 0, size: 1000 }),
      ]);

      setReportData({
        revenue: revenueResponse.data,
        userActivity: userActivityResponse.data,
        propertyStats: propertyStatsResponse.data,
        guestPassStats: guestPassResponse.data
      });
    } catch (error: any) {
      console.error('Failed to load report data:', error);
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (reportType: string) => {
    // Mock export functionality
    toast.success(`${reportType} report exported successfully`);
  };

  const getGrowthIndicator = (growth: number) => {
    const isPositive = growth > 0;
    return (
      <div className={`flex items-center text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
        <TrendingUp className={`w-3 h-3 mr-1 ${!isPositive ? 'rotate-180' : ''}`} />
        {Math.abs(growth).toFixed(1)}%
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Admin Reports & Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive insights and performance metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 Days</SelectItem>
                <SelectItem value="last30days">Last 30 Days</SelectItem>
                <SelectItem value="last90days">Last 90 Days</SelectItem>
                <SelectItem value="lastyear">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadReportData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{reportData?.revenue?.monthlyRevenue?.toLocaleString() || '0'}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">This month</span>
              {getGrowthIndicator(reportData?.userActivity?.newRegistrations?.growth || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.userActivity?.activeUsers?.monthly || 0}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Monthly active</span>
              {getGrowthIndicator(reportData?.userActivity?.newRegistrations?.growth || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.propertyStats?.totalListings || 0}</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Total listings</span>
              {getGrowthIndicator(reportData?.userActivity?.newRegistrations?.growth || 0)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Activity className="w-4 h-4 mr-2" />
              Occupancy Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData?.propertyStats?.occupancyRate?.toFixed(1) || 0}%</div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-muted-foreground">Current rate</span>
              {getGrowthIndicator(reportData?.userActivity?.newRegistrations?.growth || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Tabs */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-4">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Revenue Analytics
                </CardTitle>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => exportReport('Revenue')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {reportData?.revenue && <RevenueChart data={reportData.revenue} />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Registration Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">New Registrations</p>
                      <p className="text-2xl font-bold">{reportData?.userActivity?.newRegistrations?.thisMonth || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">This Month</p>
                      {getGrowthIndicator(reportData?.userActivity?.newRegistrations?.growth || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Daily Active</p>
                      <p className="text-lg font-bold text-blue-600">
                        {reportData?.userActivity?.activeUsers?.daily || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Weekly Active</p>
                      <p className="text-lg font-bold text-green-600">
                        {reportData?.userActivity?.activeUsers?.weekly || 0}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Monthly Active</p>
                      <p className="text-lg font-bold text-purple-600">
                        {reportData?.userActivity?.activeUsers?.monthly || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData?.userActivity?.userDistribution && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Tenants</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-blue-200 rounded-full">
                            <div
                              className="h-2 bg-blue-600 rounded-full"
                              style={{
                                width: `${(reportData.userActivity.userDistribution.tenants / reportData.userActivity.userDistribution.totalUsers) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {reportData.userActivity.userDistribution.tenants}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Owners</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-green-200 rounded-full">
                            <div
                              className="h-2 bg-green-600 rounded-full"
                              style={{
                                width: `${(reportData.userActivity.userDistribution.owners / reportData.userActivity.userDistribution.totalUsers) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {reportData.userActivity.userDistribution.owners}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Watchmen</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-orange-200 rounded-full">
                            <div
                              className="h-2 bg-orange-600 rounded-full"
                              style={{
                                width: `${(reportData.userActivity.userDistribution.watchmen / reportData.userActivity.userDistribution.totalUsers) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {reportData.userActivity.userDistribution.watchmen}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Admins</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-2 bg-red-200 rounded-full">
                            <div
                              className="h-2 bg-red-600 rounded-full"
                              style={{
                                width: `${(reportData.userActivity.userDistribution.admins / reportData.userActivity.userDistribution.totalUsers) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {reportData.userActivity.userDistribution.admins}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Property Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-green-600">
                        {reportData?.propertyStats?.approvedListings || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {reportData?.propertyStats?.pendingApproval || 0}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">
                        {reportData?.propertyStats?.rejectedListings || 0}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {reportData?.propertyStats?.totalListings || 0}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Average Rent</p>
                    <p className="text-2xl font-bold">
                      ₹{reportData?.propertyStats?.averageRent?.toLocaleString() || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Occupancy Rate</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div
                          className="h-2 bg-green-600 rounded-full"
                          style={{ width: `${reportData?.propertyStats?.occupancyRate || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">
                        {reportData?.propertyStats?.occupancyRate?.toFixed(1) || 0}%
                      </span>
                    </div>
                  </div>

                  {reportData?.propertyStats?.propertyTypeDistribution && (
                    <div className="pt-4 border-t">
                      <p className="text-sm font-medium mb-3">Property Type Distribution</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Flats</p>
                          <p className="text-lg font-bold text-blue-600">
                            {reportData.propertyStats.propertyTypeDistribution.flats}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-muted-foreground">PGs</p>
                          <p className="text-lg font-bold text-purple-600">
                            {reportData.propertyStats.propertyTypeDistribution.pgs}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Guest Passes</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Array.isArray(reportData?.guestPassStats) ? reportData.guestPassStats.length : 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total issued</p>
                </div>

                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Active Sessions</p>
                  <p className="text-2xl font-bold text-green-600">
                    {reportData?.userActivity?.activeUsers?.daily || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Current users</p>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {reportData?.userActivity?.userDistribution?.totalUsers || 0}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Registered users</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

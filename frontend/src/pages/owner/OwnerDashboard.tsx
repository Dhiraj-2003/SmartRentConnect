import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { OwnerStats } from '@/components/owner/OwnerStats';
import { PaymentEnablementBanner } from '@/components/owner/PaymentEnablementBanner';
import { NewPropertyForm } from '@/components/owner/NewPropertyForm';
import { OwnerDashboardChatbot } from '@/components/owner/OwnerDashboardChatbot';
import { OccupancyRateChart } from '@/components/owner/OccupancyRateChart';
import { PaymentTrendsChart } from '@/components/owner/PaymentTrendsChart';
import { ComplaintAnalyticsChart } from '@/components/owner/ComplaintAnalyticsChart';
import { PropertyPerformanceChart } from '@/components/owner/PropertyPerformanceChart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ownerAPI } from '@/lib/api';
import { toast } from 'sonner';
import avatarDefault from '@/assets/avatardefault.png';
import { 
  Building, 
  CreditCard, 
  MessageCircle, 
  Users,
  Plus,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Shield,
  CheckCircle,
  User,
  UserPlus
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddProperty, setShowAddProperty] = useState(false);
  const [profileStatus, setProfileStatus] = useState({
    isProfileComplete: false,
    isVerified: false,
    verificationStatus: 'PENDING',
    rejectionReason: undefined,
    completionPercentage: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, profileResponse, analyticsResponse] = await Promise.all([
        ownerAPI.getDashboardStats(),
        ownerAPI.getProfile().catch(() => null),
        ownerAPI.getDashboardAnalytics().catch(() => null)
      ]);

      setDashboardStats(statsResponse.data);
      
      if (profileResponse) {
        updateUser({
          isProfileComplete: profileResponse.data.isProfileComplete || false,
          isVerified: profileResponse.data.isVerified || false,
          verificationStatus: profileResponse.data.verificationStatus || 'PENDING',
          razorpayAccountId: profileResponse.data.razorpayAccountId || null,
          isOnlinePaymentEnabled: profileResponse.data.isOnlinePaymentEnabled || false,
          razorpayOnboardingStatus: profileResponse.data.razorpayOnboardingStatus || null,
        });
        
        const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode', 'dateOfBirth'];
        const completedFields = requiredFields.filter(field => !!profileResponse.data[field]).length;
        const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
        
        setProfileStatus({
          isProfileComplete: profileResponse.data.isProfileComplete || false,
          isVerified: profileResponse.data.isVerified || false,
          verificationStatus: profileResponse.data.verificationStatus || 'PENDING',
          rejectionReason: profileResponse.data.rejectionReason || undefined,
          completionPercentage
        });
      } else {
        setProfileStatus({
          isProfileComplete: false,
          isVerified: false,
          verificationStatus: 'PENDING',
          rejectionReason: undefined,
          completionPercentage: 0
        });
      }
      
      if (analyticsResponse && analyticsResponse.data) {
        setRevenueData(analyticsResponse.data.revenueAnalytics);
        setAnalyticsData(analyticsResponse.data);
      } else {
        setRevenueData({
          monthlyRevenue: 0,
          monthlyGrowth: 0,
          quarterlyRevenue: 0,
          quarterlyGrowth: 0,
          averageMonthly: 0,
          yearlyRevenue: 0,
          yearlyGrowth: 0,
          monthlyCollectionData: []
        });
      }
    } catch (error: any) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardStats({
        totalProperties: 0,
        activeTenants: 0,
        pendingRequests: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddPropertySuccess = () => {
    setShowAddProperty(false);
    loadDashboardData();
    toast.success('Property submitted successfully! It will be visible to tenants once approved by admin.');
  };

  const handleAddPropertyClick = () => {
    if (!profileStatus.isProfileComplete) {
      toast.error('Please complete your profile first to add properties');
      navigate('/owner/profile');
      return;
    }
    if (!profileStatus.isVerified) {
      toast.error('Your profile is under review. You can add properties once verified by admin.');
      return;
    }
    setShowAddProperty(true);
  };

  const isAddPropertyDisabled = !profileStatus.isProfileComplete || !profileStatus.isVerified;

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

  if (showAddProperty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <NewPropertyForm 
          onSuccess={handleAddPropertySuccess}
          onCancel={() => setShowAddProperty(false)}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.username}!
        </h1>
        <p className="text-muted-foreground">
          Property Owner Dashboard • Manage your rental properties
        </p>
      </div>

      {/* Profile Status Alerts - Only show if profile is not both complete AND verified */}
      {!(profileStatus.isProfileComplete && profileStatus.isVerified) && (
        <>
          {!profileStatus.isProfileComplete && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Complete Your Profile:</strong> Your profile is {profileStatus.completionPercentage}% complete. 
                    Complete your profile and upload required documents to start adding properties.
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/owner/profile')}
                    className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Complete Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {profileStatus.isProfileComplete && !profileStatus.isVerified && profileStatus.verificationStatus !== 'REJECTED' && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Verification Pending:</strong> Your profile is complete and under admin review. 
                    You'll be able to add properties once your documents are verified.
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/owner/profile')}
                    className="ml-4 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {profileStatus.verificationStatus === 'REJECTED' && profileStatus.rejectionReason && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Verification Rejected:</strong> Your profile verification was rejected. 
                    Please review the feedback and update your profile to resubmit for verification.
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/owner/profile')}
                    className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Update Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </>
      )}

      {/* Payment Enablement Banner */}
      <PaymentEnablementBanner />

      {/* Dashboard Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Reports */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Revenue Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Monthly Revenue */}
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-success">
                    ₹{revenueData?.monthlyRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{revenueData?.monthlyGrowth || 0}% from last month
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-success" />
              </div>
              
              {/* Quarterly Revenue */}
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">This Quarter</p>
                  <p className="text-2xl font-bold text-primary">
                    ₹{revenueData?.quarterlyRevenue?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{revenueData?.quarterlyGrowth || 0}% from last quarter
                  </p>
                </div>
                <Building className="w-8 h-8 text-primary" />
              </div>
              
              {/* Average Monthly */}
              <div className="flex items-center justify-between p-4 bg-info/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Average Monthly</p>
                  <p className="text-2xl font-bold text-blue-600">
                    ₹{revenueData?.averageMonthly?.toLocaleString() || '0'}
                  </p>
                  <p className="text-xs text-muted-foreground">Last 6 months</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigate('/owner/revenue')}
                className="w-full"
              >
                View Detailed Reports
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Rent Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Monthly Rent Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Chart Area */}
              <div className="h-64 w-full">
                {revenueData?.monthlyCollectionData ? (
                  <div className="h-full flex items-end justify-between gap-2 p-4 bg-muted/10 rounded-lg">
                    {revenueData.monthlyCollectionData.map((data: any, index: number) => {
                      const collectionPercentage = (data.collected / data.expected) * 100;
                      const barHeight = (data.collected / 45000) * 100; // Max height based on expected max
                      
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center space-y-2">
                          {/* Bar */}
                          <div className="w-full flex flex-col justify-end h-48 relative">
                            {/* Expected amount (background bar) */}
                            <div className="w-full bg-muted/30 rounded-t-sm absolute bottom-0" style={{ height: '100%' }}></div>
                            {/* Collected amount (foreground bar) */}
                            <div 
                              className={`w-full rounded-t-sm transition-all duration-500 ${
                                collectionPercentage >= 100 ? 'bg-green-500' : 
                                collectionPercentage >= 80 ? 'bg-blue-500' : 'bg-yellow-500'
                              }`}
                              style={{ height: `${barHeight}%` }}
                            ></div>
                            {/* Amount label */}
                            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-center">
                              ₹{(data.collected / 1000).toFixed(0)}K
                            </div>
                          </div>
                          {/* Month label */}
                          <span className="text-xs text-muted-foreground font-medium">{data.month}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted/20 rounded-lg">
                    <div className="text-center space-y-2">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto" />
                      <p className="text-sm text-muted-foreground">Loading chart data...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Chart Legend */}
              <div className="flex items-center justify-center gap-6 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-muted-foreground">100% Collected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                  <span className="text-muted-foreground">80%+ Collected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-sm"></div>
                  <span className="text-muted-foreground">Below 80%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-muted/30 rounded-sm"></div>
                  <span className="text-muted-foreground">Expected</span>
                </div>
              </div>
              
              {/* Quick Stats Below Chart */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                  <p className="text-xl font-bold text-primary">
                    {dashboardStats?.totalProperties || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Active Tenants</p>
                  <p className="text-xl font-bold text-success">
                    {dashboardStats?.activeTenants || 0}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Pending Requests</p>
                  <p className="text-xl font-bold text-warning">
                    {dashboardStats?.pendingRequests || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      {analyticsData && (
        <><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <OccupancyRateChart
            occupancyRate={analyticsData.occupancyAnalytics.currentOccupancyRate}
            totalUnits={analyticsData.occupancyAnalytics.totalUnits}
            occupiedUnits={analyticsData.occupancyAnalytics.occupiedUnits}
            availableUnits={analyticsData.occupancyAnalytics.availableUnits}
            occupancyTrend={analyticsData.occupancyAnalytics.occupancyTrend} />
          <PaymentTrendsChart
            totalPayments={analyticsData.paymentAnalytics.totalPayments}
            successfulPayments={analyticsData.paymentAnalytics.successfulPayments}
            failedPayments={analyticsData.paymentAnalytics.failedPayments}
            pendingPayments={analyticsData.paymentAnalytics.pendingPayments}
            successRate={analyticsData.paymentAnalytics.successRate}
            totalAmount={analyticsData.paymentAnalytics.totalAmount}
            paymentMethodBreakdown={analyticsData.paymentAnalytics.paymentMethodBreakdown}
            paymentTrend={analyticsData.paymentAnalytics.paymentTrend} />
        </div><div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <ComplaintAnalyticsChart
              totalComplaints={analyticsData.complaintAnalytics.totalComplaints}
              openComplaints={analyticsData.complaintAnalytics.openComplaints}
              resolvedComplaints={analyticsData.complaintAnalytics.resolvedComplaints}
              inProgressComplaints={analyticsData.complaintAnalytics.inProgressComplaints}
              averageResolutionTime={analyticsData.complaintAnalytics.averageResolutionTime}
              complaintsByCategory={analyticsData.complaintAnalytics.complaintsByCategory}
              complaintsByStatus={analyticsData.complaintAnalytics.complaintsByStatus}
              complaintTrend={analyticsData.complaintAnalytics.complaintTrend} />
            <PropertyPerformanceChart properties={analyticsData.propertyPerformance} />
          </div></>
      )}

      {/* Quick Actions - Moved to Bottom */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button 
            variant="outline" 
            className="w-full flex flex-col h-20 space-y-2"
            onClick={() => navigate('/owner/properties')}
          >
            <Building className="w-5 h-5" />
            <span className="text-sm">My Properties</span>
          </Button>
          <Button 
            variant="outline" 
            className={`w-full flex flex-col h-20 space-y-2 ${isAddPropertyDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleAddPropertyClick}
            disabled={isAddPropertyDisabled}
          >
            <Plus className="w-5 h-5" />
            <span className="text-sm">Add Property</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex flex-col h-20 space-y-2"
            onClick={() => navigate('/owner/revenue')}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-sm">View Revenue</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex flex-col h-20 space-y-2"
            onClick={() => navigate('/owner/activity')}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-sm">Complaints</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex flex-col h-20 space-y-2"
            onClick={() => navigate('/owner/tenants')}
          >
            <Users className="w-5 h-5" />
            <span className="text-sm">Manage Tenants</span>
          </Button>
          <Button 
            variant="outline" 
            className="w-full flex flex-col h-20 space-y-2"
            onClick={() => navigate('/owner/watchmen')}
          >
            <UserPlus className="w-5 h-5" />
            <span className="text-sm">Manage Watchmen</span>
          </Button>
        </div>
      </div>
      
      {/* Floating Chatbot */}
      <OwnerDashboardChatbot />
    </div>
  );
};










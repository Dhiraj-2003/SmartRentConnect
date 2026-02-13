import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/Dashboard/StatCard';
import { PropertyCard } from '@/components/tenant/PropertyCard';
import { Button } from '@/components/ui/enhanced-button';
import { tenantAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Home, 
  CreditCard, 
  MessageCircle, 
  QrCode,
  Plus,
  Search 
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardData {
  currentProperty?: any;
  pendingPayments: number;
  openComplaints: number;
  guestPasses: number;
  recommendedProperties: any[];
}

export const TenantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getDashboard();
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { title: 'Current Property', value: dashboardData?.currentProperty ? '1' : '0', icon: Home, color: 'primary' as const },
    { title: 'Pending Payments', value: `₹${dashboardData?.pendingPayments?.toLocaleString() || '0'}`, icon: CreditCard, color: 'warning' as const },
    { title: 'Open Complaints', value: dashboardData?.openComplaints?.toString() || '0', icon: MessageCircle, color: 'destructive' as const },
    { title: 'Guest Passes', value: dashboardData?.guestPasses?.toString() || '0', icon: QrCode, color: 'success' as const },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.fullName || user?.username}!
        </h1>
        <p className="text-muted-foreground">
          Room: {user?.roomNumber || 'Not assigned'} • Manage your rental experience
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-8">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/properties">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <Search className="w-5 h-5" />
              <span className="text-sm">Search Properties</span>
            </Button>
          </Link>
          <Link to="/guest-pass">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <Plus className="w-5 h-5" />
              <span className="text-sm">Create Guest Pass</span>
            </Button>
          </Link>
          <Link to="/complaints">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">File Complaint</span>
            </Button>
          </Link>
          <Link to="/payments">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Pay Rent</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Recommended Properties */}
      {dashboardData?.recommendedProperties && dashboardData.recommendedProperties.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-foreground">Recommended Properties</h2>
            <Link to="/properties">
              <Button variant="outline">View All</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dashboardData.recommendedProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onBook={(id) => console.log('Book property:', id)}
                onView={(id) => console.log('View property:', id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
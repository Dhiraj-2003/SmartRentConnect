import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/Dashboard/StatCard';
import { PropertyCard } from '@/components/tenant/PropertyCard';
import { TenantDashboardChatbot } from '@/components/tenant/TenantDashboardChatbot';
import { Button } from '@/components/ui/enhanced-button';
import { tenantAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Home, 
  CreditCard, 
  MessageCircle, 
  QrCode,
  Plus,
  Search,
  History
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface TenantCurrentProperty {
  historyId: number;
  propertyId: number;
  propertyName: string;
  propertyType: string;
  flatNumber?: string;
  bedNumber?: string;
  roomNumber?: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  monthlyRent: number;
  depositAmount: number;
  occupancyStartDate: string;
  nextRentDueDate: string;
  lastPaidDate?: string;
  status: string;
  propertyImage?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

interface DashboardData {
  currentProperties: TenantCurrentProperty[];
  totalProperties: number;
  activeProperties: number;
  totalMonthlyRent: number;
  totalDepositPaid: number;
  pendingPayments: number;
  openComplaints: number;
  guestPasses: number;
  recentProperties: TenantCurrentProperty[];
}

export const TenantDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Get room/flat info from current properties
  const getCurrentRoomInfo = () => {
    if (!dashboardData?.currentProperties || dashboardData.currentProperties.length === 0) {
      return 'Not assigned';
    }
    
    const currentProperty = dashboardData.currentProperties[0];
    if (currentProperty.propertyType === 'FLAT') {
      return `Flat ${currentProperty.flatNumber}`;
    } else if (currentProperty.propertyType === 'PG') {
      return `Room ${currentProperty.roomNumber}, Bed ${currentProperty.bedNumber}`;
    }
    return 'Not assigned';
  };

  // Handle complaint navigation with property data
  const handleFileComplaint = () => {
    // Navigate to complaints page
    navigate('/complaints');
  };

  const stats = [
    { title: 'Active Properties', value: dashboardData?.activeProperties?.toString() || '0', icon: Home, color: 'primary' as const },
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
          {getCurrentRoomInfo()} • Manage your rental experience
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
          <Button variant="outline" className="w-full flex flex-col h-20 space-y-2" onClick={handleFileComplaint}>
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm">File Complaint</span>
          </Button>
          <Link to="/tenant/history">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <History className="w-5 h-5" />
              <span className="text-sm">Property History</span>
            </Button>
          </Link>
          <Link to="/tenant/pending-payments">
            <Button variant="outline" className="w-full flex flex-col h-20 space-y-2">
              <CreditCard className="w-5 h-5" />
              <span className="text-sm">Pay Rent</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Floating Chatbot */}
      <TenantDashboardChatbot />
    </div>
  );
};
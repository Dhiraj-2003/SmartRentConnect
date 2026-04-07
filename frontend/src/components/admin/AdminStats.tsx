import React from 'react';
import { StatCard } from '@/components/Dashboard/StatCard';
import { 
  Users, 
  Building, 
  CreditCard, 
  TrendingUp,
  UserCheck,
  Clock,
  Star,
  Shield
} from 'lucide-react';

interface AdminStatsProps {
  stats: {
    totalProperties: number;
    totalTenants: number;
    totalOwners: number;
    totalWatchmen: number;
    activeRentals: number;
    pendingApprovals: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalGuestPasses: number;
    activeGuestPasses: number;
    totalReviews: number;
    averageRating: number;
  };
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const statCards = [
    { 
      title: 'Total Properties', 
      value: stats.totalProperties.toString(), 
      icon: Building, 
      color: 'primary' as const 
    },
    { 
      title: 'Total Tenants', 
      value: stats.totalTenants.toString(), 
      icon: Users, 
      color: 'success' as const 
    },
    { 
      title: 'Total Owners', 
      value: stats.totalOwners.toString(), 
      icon: UserCheck, 
      color: 'primary' as const 
    },
    { 
      title: 'Watchmen', 
      value: stats.totalWatchmen.toString(), 
      icon: Shield, 
      color: 'primary' as const 
    },
    { 
      title: 'Active Rentals', 
      value: stats.activeRentals.toString(), 
      icon: TrendingUp, 
      color: 'success' as const 
    },
    { 
      title: 'Pending Approvals', 
      value: stats.pendingApprovals.toString(), 
      icon: Clock, 
      color: 'warning' as const 
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          color={stat.color}
        />
      ))}
    </div>
  );
};

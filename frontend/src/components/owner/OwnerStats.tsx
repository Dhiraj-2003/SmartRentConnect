import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building, 
  Users, 
  AlertTriangle
} from 'lucide-react';

interface OwnerStatsProps {
  stats: {
    totalProperties: number;
    activeTenants: number;
    pendingRequests: number;
  };
}

export const OwnerStats: React.FC<OwnerStatsProps> = ({ stats }) => {
  // Safety check to prevent errors if stats is undefined
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow animate-pulse">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <div className="w-4 h-4 mr-2 bg-muted rounded"></div>
                <div className="w-20 h-4 bg-muted rounded"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 bg-muted rounded mb-1"></div>
              <div className="w-24 h-3 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statCards = [
    { 
      title: 'Total Properties', 
      value: (stats.totalProperties || 0).toString(), 
      icon: Building, 
      color: 'primary',
      description: 'All your properties'
    },
    { 
      title: 'Active Tenants', 
      value: (stats.activeTenants || 0).toString(), 
      icon: Users, 
      color: 'primary',
      description: 'Current occupants'
    },
    { 
      title: 'Pending Requests', 
      value: (stats.pendingRequests || 0).toString(), 
      icon: AlertTriangle, 
      color: 'warning',
      description: 'Tenant requests'
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'primary':
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                <Icon className={`w-4 h-4 mr-2 ${getColorClasses(stat.color)}`} />
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

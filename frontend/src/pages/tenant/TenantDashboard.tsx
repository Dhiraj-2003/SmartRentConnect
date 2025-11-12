import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { StatCard } from '@/components/Dashboard/StatCard';
import { PropertyCard } from '@/components/Properties/PropertyCard';
import { Button } from '@/components/ui/enhanced-button';
import { 
  Home, 
  CreditCard, 
  MessageCircle, 
  QrCode,
  Plus,
  Search 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import property1 from '@/assets/property-1.jpg';
import property2 from '@/assets/property-2.jpg';

export const TenantDashboard: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Current Property', value: '1', icon: Home, color: 'primary' as const },
    { title: 'Pending Payments', value: '₹15,000', icon: CreditCard, color: 'warning' as const },
    { title: 'Open Complaints', value: '2', icon: MessageCircle, color: 'destructive' as const },
    { title: 'Guest Passes', value: '5', icon: QrCode, color: 'success' as const },
  ];

  const recentProperties = [
    {
      id: '1',
      title: 'Moonlight PG',
      location: 'Koramangala, Bangalore',
      rent: 8000,
      rating: 4.5,
      ownerName: user?.username || 'You',
      image: property1,
      bedrooms: 2,
      bathrooms: 2,
      area: 1200,
      available: true,
    },
    {
      id: '2',
      title: 'Shree Balaj PG',
      location: 'Jay Raam Nagar, Hinjewadi Pase-1',
      rent: 4000,
      rating: 4.8,
      ownerName: user?.username || 'You',
      image: property2,
      bedrooms: 3,
      bathrooms: 2,
      area: 2000,
      available: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Welcome back, {user?.fullName || user?.username}!
        </h1>
        <p className="text-muted-foreground">
          Room: {user?.roomNumber} • Manage your rental experience
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
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Recommended Properties</h2>
          <Link to="/properties">
            <Button variant="outline">View All</Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onBook={(id) => console.log('Book property:', id)}
              onView={(id) => console.log('View property:', id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
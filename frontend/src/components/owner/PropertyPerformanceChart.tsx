import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building, Star, Users, DollarSign } from 'lucide-react';

interface PropertyPerformanceChartProps {
  properties: Array<{
    propertyId: number;
    propertyName: string;
    propertyType: string;
    monthlyRevenue: number;
    occupancyRate: number;
    totalTenants: number;
    activeTenants: number;
    averageRating: number;
    totalComplaints: number;
  }>;
}

export const PropertyPerformanceChart: React.FC<PropertyPerformanceChartProps> = ({
  properties
}) => {
  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-blue-600';
    if (rating >= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Property Performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        {properties.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No properties to display</p>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <div key={property.propertyId} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{property.propertyName}</h4>
                    <p className="text-xs text-muted-foreground">{property.propertyType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      ₹{property.monthlyRevenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Monthly Revenue</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <Users className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    <p className="text-lg font-semibold">{property.activeTenants}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                    <p className="text-xs text-muted-foreground">/ {property.totalTenants}</p>
                  </div>
                  <div>
                    <div className="w-4 h-4 mx-auto mb-1 rounded-full bg-blue-500"></div>
                    <p className={`text-lg font-semibold ${getOccupancyColor(property.occupancyRate)}`}>
                      {property.occupancyRate.toFixed(0)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Occupancy</p>
                  </div>
                  <div>
                    <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                    <p className={`text-lg font-semibold ${getRatingColor(property.averageRating)}`}>
                      {property.averageRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <div className="w-4 h-4 mx-auto mb-1 rounded-full bg-red-500"></div>
                    <p className="text-lg font-semibold text-red-600">{property.totalComplaints}</p>
                    <p className="text-xs text-muted-foreground">Complaints</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

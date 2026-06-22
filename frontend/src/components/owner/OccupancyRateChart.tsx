import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home } from 'lucide-react';

interface OccupancyRateChartProps {
  occupancyRate: number;
  totalUnits: number;
  occupiedUnits: number;
  availableUnits: number;
  occupancyTrend?: Array<{
    month: string;
    occupancyRate: number;
    totalUnits: number;
    occupiedUnits: number;
  }>;
}

export const OccupancyRateChart: React.FC<OccupancyRateChartProps> = ({
  occupancyRate,
  totalUnits,
  occupiedUnits,
  availableUnits,
  occupancyTrend = []
}) => {
  const getRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-blue-600';
    if (rate >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBarColor = (rate: number) => {
    if (rate >= 80) return 'bg-green-500';
    if (rate >= 60) return 'bg-blue-500';
    if (rate >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Home className="w-5 h-5 mr-2" />
          Occupancy Rate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Occupancy */}
          <div className="text-center p-6 bg-muted/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Current Occupancy</p>
            <p className={`text-5xl font-bold ${getRateColor(occupancyRate)}`}>
              {occupancyRate.toFixed(1)}%
            </p>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Units</p>
                <p className="font-semibold text-lg">{totalUnits}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Occupied</p>
                <p className="font-semibold text-lg text-green-600">{occupiedUnits}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Available</p>
                <p className="font-semibold text-lg text-blue-600">{availableUnits}</p>
              </div>
            </div>
          </div>

          {/* Occupancy Trend */}
          {occupancyTrend.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-4">6-Month Trend</p>
              <div className="h-40 flex items-end justify-between gap-2">
                {occupancyTrend.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-muted/20 rounded-t-sm relative h-32">
                      <div
                        className={`w-full rounded-t-sm transition-all duration-300 ${getBarColor(data.occupancyRate)}`}
                        style={{ height: `${data.occupancyRate}%` }}
                      />
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                        {data.occupancyRate.toFixed(0)}%
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

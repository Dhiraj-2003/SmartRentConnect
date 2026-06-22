import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, Clock, CheckCircle } from 'lucide-react';

interface ComplaintAnalyticsChartProps {
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  averageResolutionTime: number;
  complaintsByCategory?: Record<string, number>;
  complaintsByStatus?: Record<string, number>;
  complaintTrend?: Array<{
    month: string;
    totalComplaints: number;
    resolvedComplaints: number;
  }>;
}

export const ComplaintAnalyticsChart: React.FC<ComplaintAnalyticsChartProps> = ({
  totalComplaints,
  openComplaints,
  resolvedComplaints,
  inProgressComplaints,
  averageResolutionTime,
  complaintsByCategory,
  complaintsByStatus,
  complaintTrend = []
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500';
      case 'IN_PROGRESS': return 'bg-yellow-500';
      case 'RESOLVED': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageCircle className="w-5 h-5 mr-2" />
          Complaint Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Complaint Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
              <MessageCircle className="w-6 h-6 text-red-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-red-600">{openComplaints}</p>
              <p className="text-xs text-red-700">Open</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <Clock className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-yellow-600">{inProgressComplaints}</p>
              <p className="text-xs text-yellow-700">In Progress</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-600">{resolvedComplaints}</p>
              <p className="text-xs text-green-700">Resolved</p>
            </div>
          </div>

          {/* Average Resolution Time */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Average Resolution Time</p>
            <p className="text-3xl font-bold text-blue-600">
              {averageResolutionTime.toFixed(1)} days
            </p>
          </div>

          {/* Complaints by Category */}
          {complaintsByCategory && Object.keys(complaintsByCategory).length > 0 && (
            <div className="space-y-3">
              <p className="text-sm font-medium">By Category</p>
              <div className="space-y-2">
                {Object.entries(complaintsByCategory).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground capitalize">{category.replace('_', ' ')}</span>
                    <span className="text-sm font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complaint Trend */}
          {complaintTrend.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-4">6-Month Trend</p>
              <div className="h-32 flex items-end justify-between gap-2">
                {complaintTrend.map((data, index) => {
                  const maxComplaints = Math.max(...complaintTrend.map(d => d.totalComplaints));
                  const barHeight = maxComplaints > 0 ? (data.totalComplaints / maxComplaints) * 100 : 0;
                  const resolvedHeight = maxComplaints > 0 ? (data.resolvedComplaints / maxComplaints) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-muted/20 rounded-t-sm relative h-24">
                        {/* Total complaints bar */}
                        <div
                          className="w-full bg-red-400 rounded-t-sm transition-all duration-300 absolute bottom-0"
                          style={{ height: `${barHeight}%` }}
                        />
                        {/* Resolved complaints bar */}
                        <div
                          className="w-full bg-green-500 rounded-t-sm transition-all duration-300 absolute bottom-0"
                          style={{ height: `${resolvedHeight}%` }}
                        />
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                          {data.totalComplaints}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-muted-foreground">Resolved</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                  <span className="text-muted-foreground">Total</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

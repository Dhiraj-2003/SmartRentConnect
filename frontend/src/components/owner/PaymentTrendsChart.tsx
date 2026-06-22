import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, TrendingUp } from 'lucide-react';

interface PaymentTrendsChartProps {
  totalPayments: number;
  successfulPayments: number;
  failedPayments: number;
  pendingPayments: number;
  successRate: number;
  totalAmount: number;
  paymentMethodBreakdown?: {
    ONLINE: number;
    CASH: number;
  };
  paymentTrend?: Array<{
    month: string;
    totalPayments: number;
    totalAmount: number;
    successRate: number;
  }>;
}

export const PaymentTrendsChart: React.FC<PaymentTrendsChartProps> = ({
  totalPayments,
  successfulPayments,
  failedPayments,
  pendingPayments,
  successRate,
  totalAmount,
  paymentMethodBreakdown,
  paymentTrend = []
}) => {
  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-blue-600';
    if (rate >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CreditCard className="w-5 h-5 mr-2" />
          Payment Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Payment Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700">Successful</p>
              <p className="text-2xl font-bold text-green-600">{successfulPayments}</p>
              <p className="text-xs text-green-600">{successRate.toFixed(1)}% success rate</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">Total Amount</p>
              <p className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</p>
              <p className="text-xs text-blue-600">{totalPayments} payments</p>
            </div>
          </div>

          {/* Payment Status Breakdown */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Payment Status</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Pending</span>
                <span className="text-sm font-semibold text-yellow-600">{pendingPayments}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full transition-all"
                  style={{ width: `${(pendingPayments / totalPayments) * 100}%` }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Failed</span>
                <span className="text-sm font-semibold text-red-600">{failedPayments}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${(failedPayments / totalPayments) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Payment Method Breakdown */}
          {paymentMethodBreakdown && (
            <div className="space-y-3">
              <p className="text-sm font-medium">Payment Methods</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-xs text-purple-700">Online</p>
                  <p className="text-lg font-bold text-purple-600">{paymentMethodBreakdown.ONLINE}</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-orange-700">Cash</p>
                  <p className="text-lg font-bold text-orange-600">{paymentMethodBreakdown.CASH}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Trend */}
          {paymentTrend.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-4 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                6-Month Trend
              </p>
              <div className="h-32 flex items-end justify-between gap-2">
                {paymentTrend.map((data, index) => {
                  const maxAmount = Math.max(...paymentTrend.map(d => d.totalAmount));
                  const barHeight = (data.totalAmount / maxAmount) * 100;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-muted/20 rounded-t-sm relative h-24">
                        <div
                          className="w-full bg-blue-500 rounded-t-sm transition-all duration-300"
                          style={{ height: `${barHeight}%` }}
                        />
                        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium">
                          ₹{(data.totalAmount / 1000).toFixed(0)}K
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground mt-2">{data.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

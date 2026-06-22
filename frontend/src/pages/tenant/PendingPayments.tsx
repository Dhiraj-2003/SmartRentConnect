import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { tenantAPI } from '@/lib/api';
import { 
  ArrowLeft, 
  IndianRupee, 
  Calendar, 
  Building2, 
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  CreditCard
} from 'lucide-react';

interface PendingPayment {
  historyId: number;
  propertyId: number;
  propertyName: string;
  propertyType: string;
  flatNumber?: string;
  roomNumber?: string;
  bedNumber?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  amount: number;
  dueDate: string;
  lastPaidDate?: string;
  status: string;
  lateFee?: number;
}

export const PendingPayments: React.FC = () => {
  const navigate = useNavigate();
  const [pendingPayments, setPendingPayments] = useState<PendingPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getPendingPayments();
      setPendingPayments(response.data);
    } catch (error) {
      console.error('Error fetching pending payments:', error);
      toast.error('Failed to load pending payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async (payment: PendingPayment) => {
    try {
      // Create a unique identifier for the payment
      const paymentIdentifier = `rent-${payment.historyId}`;
      
      setProcessingPayment(paymentIdentifier);
      
      // Navigate to rent payment page
      navigate('/tenant/rent-payment', {
        state: {
          historyId: payment.historyId,
          propertyId: payment.propertyId,
          propertyName: payment.propertyName,
          propertyType: payment.propertyType,
          flatNumber: payment.flatNumber,
          roomNumber: payment.roomNumber,
          bedNumber: payment.bedNumber,
          ownerName: payment.ownerName,
          ownerEmail: payment.ownerEmail,
          ownerPhone: payment.ownerPhone,
          amount: payment.amount,
          dueDate: payment.dueDate,
          lastPaidDate: payment.lastPaidDate,
          status: payment.status,
          lateFee: payment.lateFee
        }
      });
    } catch (error) {
      console.error('Error initiating payment:', error);
      toast.error('Failed to initiate payment');
      setProcessingPayment(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysOverdue = (dueDate: string) => {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const daysOverdue = getDaysOverdue(dueDate);
    
    if (status === 'PAID') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Paid</Badge>;
    } else if (status === 'OVERDUE' || daysOverdue > 0) {
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Overdue by {Math.abs(daysOverdue)} days</Badge>;
    } else if (status === 'DUE_TODAY' || daysOverdue === 0) {
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Due Today</Badge>;
    } else if (status === 'UPCOMING') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Due in {Math.abs(daysOverdue)} days</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Due in {Math.abs(daysOverdue)} days</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading pending payments...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/tenant/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Pending Payments
        </h1>
        <p className="text-muted-foreground">
          View and manage your pending rent payments
        </p>
      </div>

      {/* No Payments State */}
      {pendingPayments.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Pending Payments</h3>
            <p className="text-muted-foreground text-center mb-6">
              You're all caught up! There are no pending payments at the moment.
            </p>
            <Button onClick={() => navigate('/tenant/dashboard')}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Payments List */
        <div className="space-y-6">
          {pendingPayments.map((payment) => {
            // Create a unique identifier for the payment
            const paymentIdentifier = `rent-${payment.historyId}`;
            
            return (
            <Card key={paymentIdentifier} className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Building2 className="w-5 h-5 text-primary" />
                      {payment.propertyName}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Owner: {payment.ownerName}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(payment.status, payment.dueDate)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Property Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{payment.propertyType}</span>
                  </div>
                  {payment.flatNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Flat:</span>
                      <span className="font-medium">{payment.flatNumber}</span>
                    </div>
                  )}
                  {payment.roomNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{payment.roomNumber}</span>
                    </div>
                  )}
                  {payment.bedNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">{payment.bedNumber}</span>
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-gray-500">Amount Due</p>
                        <p className="font-semibold text-lg">
                          ₹{payment.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs text-gray-500">Due Date</p>
                        <p className="font-semibold">
                          {formatDate(payment.dueDate)}
                        </p>
                      </div>
                    </div>
                    {payment.lateFee && payment.lateFee > 0 && (
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                        <div>
                          <p className="text-xs text-gray-500">Late Fee</p>
                          <p className="font-semibold text-red-600">
                            ₹{payment.lateFee.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Owner Contact */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Owner Contact Information</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{payment.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Email:</span>
                      <span>{payment.ownerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Phone:</span>
                      <span>{payment.ownerPhone}</span>
                    </div>
                  </div>
                </div>

                {/* Pay Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    onClick={() => handlePayNow(payment)}
                    disabled={processingPayment === paymentIdentifier || payment.status === 'PAID'}
                    className="min-w-[140px]"
                  >
                    {processingPayment === paymentIdentifier ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : payment.status === 'PAID' ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Paid
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay Now
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

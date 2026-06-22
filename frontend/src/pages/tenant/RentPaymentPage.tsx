import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { tenantAPI } from '@/lib/api';
import { 
  ArrowLeft, 
  Building2, 
  Calendar, 
  User, 
  IndianRupee, 
  CheckCircle, 
  AlertCircle,
  Clock,
  CreditCard,
  Smartphone,
  Wallet,
  Banknote
} from 'lucide-react';

interface RentPaymentPageState {
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
  loading: boolean;
  paymentProcessing: boolean;
  error: string | null;
  selectedPaymentMethod: 'online' | 'cash';
  paymentFailed: boolean;
  failureReason?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const RentPaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<RentPaymentPageState>({
    historyId: 0,
    propertyId: 0,
    propertyName: '',
    propertyType: '',
    flatNumber: undefined,
    roomNumber: undefined,
    bedNumber: undefined,
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    amount: 0,
    dueDate: '',
    lastPaidDate: undefined,
    status: '',
    lateFee: 0,
    loading: true,
    paymentProcessing: false,
    error: null,
    selectedPaymentMethod: 'online',
    paymentFailed: false
  });

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Parse location state and initialize payment
  useEffect(() => {
    const locationState = location.state as any;
    
    if (locationState?.historyId) {
      setState(prev => ({
        ...prev,
        historyId: locationState.historyId,
        propertyId: locationState.propertyId,
        propertyName: locationState.propertyName,
        propertyType: locationState.propertyType,
        flatNumber: locationState.flatNumber,
        roomNumber: locationState.roomNumber,
        bedNumber: locationState.bedNumber,
        ownerName: locationState.ownerName,
        ownerEmail: locationState.ownerEmail,
        ownerPhone: locationState.ownerPhone,
        amount: locationState.amount,
        dueDate: locationState.dueDate,
        lastPaidDate: locationState.lastPaidDate,
        status: locationState.status,
        lateFee: locationState.lateFee,
        loading: false
      }));
    } else {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Invalid payment information. Please try again.' 
      }));
    }
  }, [location, navigate]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleRentPaymentFailure = async (razorpayOrderId: string, failureReason: string) => {
    try {
      setState(prev => ({ ...prev, paymentProcessing: true }));
      
      // Call backend to record payment failure
      const failureResponse = await tenantAPI.handleRentPaymentFailure(razorpayOrderId, failureReason);
      
      if (failureResponse.data.success) {
        setState(prev => ({
          ...prev,
          paymentFailed: true,
          failureReason: failureReason,
          paymentProcessing: false
        }));
        
        toast.error(`Payment failed: ${failureReason}. You can retry payment.`);
      } else {
        throw new Error(failureResponse.data.message || 'Failed to record payment failure');
      }
    } catch (error: any) {
      console.error('Failed to record payment failure:', error);
      setState(prev => ({
        ...prev,
        paymentFailed: true,
        failureReason: failureReason,
        paymentProcessing: false
      }));
      toast.error(`Payment failed: ${failureReason}. You can retry payment.`);
    }
  };

  const retryPayment = () => {
    setState(prev => ({
      ...prev,
      paymentFailed: false,
      failureReason: undefined,
      paymentProcessing: false
    }));
    toast.info('You can retry payment now.');
  };

  const initiateCashPayment = async () => {
    try {
      setState(prev => ({ ...prev, paymentProcessing: true, error: null }));

      const cashPaymentResponse = await tenantAPI.initiateCashRentPayment(state.historyId);
      
      if (cashPaymentResponse.data.success) {
        toast.success('Cash payment initiated! Please pay the amount to your owner.');
        navigate('/tenant/pending-payments', { 
          state: { 
            success: true, 
            message: 'Your cash payment request has been submitted.' 
          } 
        });
      } else {
        throw new Error(cashPaymentResponse.data.message || 'Failed to initiate cash payment');
      }
    } catch (error: any) {
      console.error('Cash payment error:', error);
      setState(prev => ({ 
        ...prev, 
        paymentProcessing: false, 
        error: error.response?.data?.message || error.message || 'Cash payment failed. Please try again.' 
      }));
      toast.error('Cash payment failed. Please try again.');
    }
  };

  const initiatePayment = async () => {
    try {
      setState(prev => ({ ...prev, paymentProcessing: true, error: null }));

      // Call backend to create Razorpay order
      const orderResponse = await tenantAPI.initiateOnlineRentPayment(state.historyId);
      const { razorpayOrderId, amount, currency, key } = orderResponse.data;

      // Load Razorpay if not already loaded
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error('Failed to load payment gateway');
      }

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        name: 'SmartRent Connect',
        description: `Rent Payment for ${state.propertyName}`,
        order_id: razorpayOrderId,
        image: '/logo.png',

        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true
        },

        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay with UPI',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['intent']
                  }
                ]
              },
              cards: {
                name: 'Credit/Debit Cards',
                instruments: [
                  {
                    method: 'card'
                  }
                ]
              },
              netbanking: {
                name: 'Net Banking',
                instruments: [
                  {
                    method: 'netbanking'
                  }
                ]
              }
            },
            sequence: ['block.upi', 'block.cards', 'block.netbanking'],
            preferences: {
              show_default_blocks: true
            }
          }
        },

        prefill: {
          name: state.ownerName,
          email: state.ownerEmail,
          contact: state.ownerPhone
        },

        notes: {
          historyId: state.historyId,
          propertyId: state.propertyId,
          paymentType: 'MONTHLY_RENT'
        },

        theme: {
          color: '#3399cc'
        },

        modal: {
          ondismiss: async () => {
            try {
              const paymentStatusResponse = await tenantAPI.getRentPaymentStatus(state.historyId);
              if (!paymentStatusResponse.data.success || paymentStatusResponse.data.status !== 'SUCCESS') {
                await handleRentPaymentFailure(razorpayOrderId, 'Payment cancelled by user');
              }
            } catch (error) {
              await handleRentPaymentFailure(razorpayOrderId, 'Payment cancelled by user');
            }
          },
          escape: true,
          backdropclose: true,
          animation: 'fade'
        },

        handler: async (response: any) => {
          try {
            console.log('=== RENT PAYMENT SUCCESS DEBUG ===');
            console.log('Razorpay Response:', response);

            const verifyResponse = await tenantAPI.verifyRentPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );

            console.log('Verification Response:', verifyResponse);

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Rent payment recorded.');
              navigate('/tenant/pending-payments', {
                state: {
                  success: true,
                  paymentMethod: 'online',
                  message: 'Your rent payment has been processed successfully.'
                }
              });
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
            setState(prev => ({ ...prev, paymentProcessing: false }));
          }
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', async (response: any) => {
        console.log('=== RENT PAYMENT FAILED EVENT ===', response);
        const failureReason = response.error?.description || response.error?.reason || 'Payment failed';
        await handleRentPaymentFailure(razorpayOrderId, failureReason);
      });

      rzp.open();
    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setState(prev => ({ 
        ...prev, 
        paymentProcessing: false, 
        error: error.response?.data?.message || error.message || 'Payment initiation failed. Please try again.' 
      }));
      toast.error('Payment initiation failed. Please try again.');
    }
  };

  const getTotalAmount = () => {
    // Backend calculates total amount including late fee
    // This is just for display purposes
    return state.amount + (state.lateFee || 0);
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading payment details...</span>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="border-red-200">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Payment Error</h3>
            <p className="text-muted-foreground text-center mb-6">{state.error}</p>
            <Button onClick={() => navigate('/tenant/pending-payments')}>
              Back to Pending Payments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/tenant/pending-payments')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Pending Payments
        </Button>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Rent Payment
        </h1>
        <p className="text-muted-foreground">
          Complete your monthly rent payment
        </p>
      </div>

      {state.paymentFailed ? (
        /* Payment Failed State */
        <Card className="border-red-200 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 text-red-500 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Payment Failed</h3>
                <p className="text-muted-foreground mb-4">
                  {state.failureReason || 'Your payment could not be processed. Please try again.'}
                </p>
                <div className="flex gap-3">
                  <Button onClick={retryPayment}>
                    Retry Payment
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/tenant/pending-payments')}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Payment Details */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Property Details Card */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Property Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{state.propertyName}</h3>
                  <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>Owner: {state.ownerName}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium">{state.propertyType}</span>
                  </div>
                  {state.flatNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Flat:</span>
                      <span className="font-medium">{state.flatNumber}</span>
                    </div>
                  )}
                  {state.roomNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Room:</span>
                      <span className="font-medium">{state.roomNumber}</span>
                    </div>
                  )}
                  {state.bedNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building2 className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">{state.bedNumber}</span>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Owner Contact Information</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{state.ownerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Email:</span>
                      <span>{state.ownerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Phone:</span>
                      <span>{state.ownerPhone}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setState(prev => ({ ...prev, selectedPaymentMethod: 'online' }))}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      state.selectedPaymentMethod === 'online'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCard className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-center">Online Payment</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      UPI, Card, Net Banking
                    </p>
                  </button>

                  <button
                    onClick={() => setState(prev => ({ ...prev, selectedPaymentMethod: 'cash' }))}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      state.selectedPaymentMethod === 'cash'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-center">Cash Payment</p>
                    <p className="text-xs text-muted-foreground text-center mt-1">
                      Pay directly to owner
                    </p>
                  </button>
                </div>

                {state.selectedPaymentMethod === 'online' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Smartphone className="w-4 h-4 text-gray-500" />
                      <span>UPI (Google Pay, PhonePe, Paytm)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span>Credit/Debit Cards</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="w-4 h-4 text-gray-500" />
                      <span>Net Banking</span>
                    </div>
                  </div>
                )}

                {state.selectedPaymentMethod === 'cash' && (
                  <div className="space-y-3 pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Please pay the amount in cash to your property owner within 24 hours.
                    </p>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-yellow-600 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          Make sure to get a receipt from your owner after payment.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="font-semibold">{formatDate(state.dueDate)}</p>
                  </div>
                </div>

                {state.lastPaidDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs text-gray-500">Last Paid</p>
                      <p className="font-semibold">{formatDate(state.lastPaidDate)}</p>
                    </div>
                  </div>
                )}

                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Rent</span>
                    <span className="font-semibold">₹{state.amount.toLocaleString()}</span>
                  </div>

                  {state.lateFee && state.lateFee > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-red-600">Late Fee</span>
                      <span className="font-semibold text-red-600">₹{state.lateFee.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg">Total Amount</span>
                      <span className="font-bold text-xl text-primary">
                        ₹{getTotalAmount().toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={state.selectedPaymentMethod === 'online' ? initiatePayment : initiateCashPayment}
                  disabled={state.paymentProcessing}
                  className="w-full"
                  size="lg"
                >
                  {state.paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : state.selectedPaymentMethod === 'online' ? (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now
                    </>
                  ) : (
                    <>
                      <Banknote className="w-4 h-4 mr-2" />
                      Request Cash Payment
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Secure payment powered by Razorpay
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

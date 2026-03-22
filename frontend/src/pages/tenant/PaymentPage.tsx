import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { tenantAPI } from '@/lib/api';
import { 
  ArrowLeft, 
  Home, 
  Building2, 
  Bed, 
  Calendar, 
  Users, 
  IndianRupee, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Clock,
  CreditCard,
  Smartphone,
  Wallet,
  Banknote,
  MapPin,
  Star,
  Wifi,
  Car,
  Utensils,
  Sofa,
  Wind,
  Shirt,
  Dumbbell,
  Droplets,
  Zap,
  Key,
  Info,
  Bath,
  RefreshCw,
  X
} from 'lucide-react';

interface PaymentPageState {
  propertyType: 'FLAT' | 'PG';
  property: any;
  bookingData: any;
  bookingId?: string;
  amount: number;
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

export const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState<PaymentPageState>({
    propertyType: 'FLAT',
    property: null,
    bookingData: null,
    amount: 0,
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
    
    // Handle BookFlat pattern (bookingId already created)
    if (locationState?.bookingId) {
      // Fetch booking details from backend
      fetchBookingDetails(locationState.bookingId);
      return;
    }
    
    // Handle BookPG pattern (booking data, need to create booking)
    if (locationState?.propertyType && locationState?.bookingData) {
      // Initialize state with booking data for PG flow
      setState(prev => ({
        ...prev,
        propertyType: locationState.propertyType,
        property: locationState.property,
        bookingData: locationState.bookingData,
        amount: locationState.amount,
        loading: false
      }));
      return;
    }
    
    // No valid data found
    setState(prev => ({ 
      ...prev, 
      loading: false, 
      error: 'Invalid booking information. Please try again.' 
    }));
  }, [location, navigate]);

  const fetchBookingDetails = async (bookingId: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      
      const token = localStorage.getItem('token');
      const response = await tenantAPI.getBookingDetails(bookingId);

      const bookingData = response.data;
      
      if (!bookingData.success) {
        throw new Error(bookingData.message || 'Failed to fetch booking details');
      }

      const booking = bookingData.booking;
      
      // Create property object from DTO data
      const propertyObject = {
        id: booking.propertyId,
        title: booking.propertyTitle,
        address: booking.propertyAddress,
        city: booking.propertyCity,
        state: booking.propertyState,
        pincode: booking.propertyPincode,
        propertyType: booking.propertyType,
        ownerName: booking.ownerName,
        description: booking.propertyDescription,
        amenities: booking.amenities,
        averageRating: booking.averageRating,
        totalRatings: booking.totalRatings,
        deposit: booking.depositAmount,
        flatDetails: booking.flatNumber ? {
          flatNumber: booking.flatNumber,
          bhkType: booking.bhkType,
          totalRooms: booking.totalRooms,
          bathrooms: booking.bathrooms,
          furnishingType: booking.furnishingType,
          rentPerMonth: booking.rentPerMonth
        } : null,
        pgDetails: booking.genderAllowed ? {
          genderAllowed: booking.genderAllowed,
          foodIncluded: booking.foodIncluded
        } : null
      };
      
      // Create booking data object
      const bookingDataObject = {
        ...booking,
        roomNumber: booking.roomNumber,
        sharingType: booking.sharingType,
        pricePerBed: booking.pricePerBed,
        bedNumber: booking.bedNumber
      };
      
      setState({
        propertyType: booking.propertyType,
        property: propertyObject,
        bookingData: bookingDataObject,
        bookingId: bookingId,
        amount: booking.depositAmount,
        loading: false,
        paymentProcessing: false,
        error: null,
        selectedPaymentMethod: 'online',
        paymentFailed: false
      });
      
    } catch (error: any) {
      console.error('Failed to fetch booking details:', error);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.response?.data?.message || error.message || 'Failed to load booking details.' 
      }));
      toast.error('Failed to load booking details.');
    }
  };

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

  const handlePaymentFailure = async (razorpayOrderId: string, failureReason: string) => {
    try {
      console.log('=== HANDLE PAYMENT FAILURE DEBUG ===');
      console.log('Order ID:', razorpayOrderId);
      console.log('Failure Reason:', failureReason);
      console.log('Booking ID:', state.bookingId);
      
      setState(prev => ({ ...prev, paymentProcessing: true }));
      
      const failureResponse = await tenantAPI.handlePaymentFailure(
        razorpayOrderId,
        state.bookingId!,
        failureReason
      );
      
      console.log('Payment failure recorded:', failureResponse);
      
      if (failureResponse.data.success) {
        setState(prev => ({
          ...prev,
          paymentFailed: true,
          failureReason: failureReason,
          paymentProcessing: false
        }));
        
        toast.error(`Payment failed: ${failureReason}. You can retry payment.`);
        console.log('Payment failure state updated successfully');
      } else {
        throw new Error(failureResponse.data.message || 'Failed to record payment failure');
      }
    } catch (error: any) {
      console.error('Failed to record payment failure:', error);
      console.error('Error response:', error.response);
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

  const cancelBooking = async () => {
    if (!state.bookingId) {
      toast.error('Invalid booking information');
      return;
    }

    try {
      setState(prev => ({ ...prev, paymentProcessing: true }));

      const cancelResponse = await tenantAPI.cancelBooking(state.bookingId);
      
      if (cancelResponse.data.success) {
        toast.success('Booking cancelled successfully.');
        navigate('/tenant/bookings', { 
          state: { 
            success: false, 
            bookingId: state.bookingId,
            message: 'Your booking has been cancelled.' 
          } 
        });
      } else {
        throw new Error(cancelResponse.data.message || 'Failed to cancel booking');
      }

    } catch (error: any) {
      console.error('Cancel booking error:', error);
      setState(prev => ({ 
        ...prev, 
        paymentProcessing: false, 
        error: error.response?.data?.message || error.message || 'Failed to cancel booking.' 
      }));
      toast.error('Failed to cancel booking. Please try again.');
    }
  };

  const initiateCashPayment = async () => {
    if (!state.bookingId) {
      toast.error('Invalid booking information');
      return;
    }

    try {
      setState(prev => ({ ...prev, paymentProcessing: true, error: null }));

      // Call backend to create cash payment record
      const cashPaymentResponse = await tenantAPI.initiateCashPayment(state.bookingId);
      
      if (cashPaymentResponse.data.success) {
        toast.success('Cash payment initiated! Please pay the amount at the property.');
        navigate('/tenant/bookings', { 
          state: { 
            success: true, 
            bookingId: state.bookingId,
            paymentMethod: 'cash',
            message: 'Your booking has been confirmed. Please pay the amount in cash at the property within 24 hours.' 
          } 
        });
      } else {
        throw new Error(cashPaymentResponse.data.message || 'Failed to initiate cash payment');
      }

    } catch (error: any) {
      console.error('Cash payment booking error:', error);
      setState(prev => ({ 
        ...prev, 
        paymentProcessing: false, 
        error: error.response?.data?.message || error.message || 'Cash payment failed. Please try again.' 
      }));
      toast.error('Cash payment failed. Please try again.');
    }
  };

  const initiatePayment = async () => {
    // Only BookFlat pattern should reach here (bookingId already created)
    if (!state.bookingId) {
      toast.error('Invalid booking information');
      return;
    }
    
    try {
      setState(prev => ({ ...prev, paymentProcessing: true, error: null }));

      // Call backend to create Razorpay order
      const orderResponse = await tenantAPI.createPaymentOrder(state.bookingId);
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
        order_id: razorpayOrderId,
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false
        },
        handler: async (response: any) => {
          try {
            console.log('=== PAYMENT SUCCESS DEBUG ===');
            console.log('Razorpay Response:', response);
            console.log('Booking ID:', state.bookingId);
            
            // On successful payment, call verification endpoint
            const verifyResponse = await tenantAPI.verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
              state.bookingId
            );
            
            console.log('Verification Response:', verifyResponse);

            if (verifyResponse.data.success) {
              toast.success('Payment successful! Booking confirmed.');
              navigate('/tenant/bookings', { 
                state: { 
                  success: true, 
                  bookingId: state.bookingId,
                  paymentMethod: 'online',
                  message: 'Your booking has been confirmed and payment processed successfully.' 
                } 
              });
            } else {
              console.log('Verification failed:', verifyResponse.data);
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            console.error('Error response:', error.response);
            toast.error('Payment verification failed. Please contact support.');
            setState(prev => ({ ...prev, paymentProcessing: false }));
          }
        },
        error: async (response: any) => {
          console.log('=== PAYMENT ERROR DEBUG ===');
          console.log('Razorpay Error Response:', response);
          console.log('Order ID:', razorpayOrderId);
          console.log('Booking ID:', state.bookingId);
          
          let failureReason = 'Payment failed';
          if (response.error && response.error.description) {
            failureReason = response.error.description;
          } else if (response.error && response.error.reason) {
            failureReason = response.error.reason;
          } else if (response.error && response.error.code) {
            failureReason = `Payment failed (Code: ${response.error.code})`;
          }
          
          console.log('Extracted failure reason:', failureReason);
          
          try {
            await handlePaymentFailure(razorpayOrderId, failureReason);
            console.log('Payment failure handled successfully');
          } catch (error) {
            console.error('Failed to handle payment failure:', error);
          }
        },
        prefill: {
          name: state.property?.ownerName || 'User',
          email: 'user@example.com',
          contact: '+919999999999'
        },
        theme: {
          color: '#3399cc'
        },
        modal: {
          ondismiss: async () => {
            console.log('=== PAYMENT MODAL DISMISSED DEBUG ===');
            console.log('Payment modal dismissed by user or due to error');
            console.log('Order ID:', razorpayOrderId);
            console.log('Booking ID:', state.bookingId);
            
            // Check if payment was actually successful by calling backend
            try {
              const paymentStatusResponse = await tenantAPI.getPaymentStatus(state.bookingId!);
              console.log('Payment status check:', paymentStatusResponse.data);
              
              // If payment is not successful, treat as failure
              if (!paymentStatusResponse.data.success || 
                  paymentStatusResponse.data.status !== 'SUCCESS') {
                await handlePaymentFailure(razorpayOrderId, 'Payment cancelled or failed');
              }
            } catch (error) {
              console.log('Could not check payment status, assuming failure:', error);
              await handlePaymentFailure(razorpayOrderId, 'Payment cancelled or failed');
            }
          },
          escape: true,
          backdropclose: true,
          animation: 'fade'
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      console.error('Payment initiation error:', error);
      setState(prev => ({ 
        ...prev, 
        paymentProcessing: false, 
        error: error.response?.data?.message || error.message || 'Payment failed. Please try again.' 
      }));
      toast.error('Payment failed. Please try again.');
    }
  };

  const renderPropertyDetails = () => {
    if (!state.property) return null;

    const renderStars = (rating: number) => {
      return Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      ));
    };

    const getAmenityIcon = (amenity: string) => {
      const iconMap: { [key: string]: React.ReactNode } = {
        'wifi': <Wifi className="w-4 h-4" />,
        'parking': <Car className="w-4 h-4" />,
        'food': <Utensils className="w-4 h-4" />,
        'security': <Shield className="w-4 h-4" />,
        'furnished': <Sofa className="w-4 h-4" />,
        'ac': <Wind className="w-4 h-4" />,
        'laundry': <Shirt className="w-4 h-4" />,
        'gym': <Dumbbell className="w-4 h-4" />,
        'water': <Droplets className="w-4 h-4" />,
        'power': <Zap className="w-4 h-4" />,
      };
      return iconMap[amenity.toLowerCase()] || <CheckCircle className="w-4 h-4" />;
    };

    return (
      <div className="space-y-6">
        {/* Property Details Card */}
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Home className="w-5 h-5 text-primary" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold mb-3">
                {state.property.title || `Property ID: ${state.property.id}`}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm sm:text-base break-words">
                  {state.property.address ? 
                    `${state.property.address}, ${state.property.city || ''}, ${state.property.state || ''} - ${state.property.pincode || ''}` : 
                    'Property details loading...'
                  }
                </span>
              </div>
              {state.property.flatDetails?.flatNumber && (
                <div className="mt-2 flex items-center gap-2 text-gray-600">
                  <Building2 className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">Flat No: {state.property.flatDetails.flatNumber}</span>
                </div>
              )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {state.propertyType === 'FLAT' ? (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <IndianRupee className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">Monthly Rent</span>
                    <p className="font-semibold text-sm">₹{state.property.flatDetails?.rentPerMonth?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Key className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">Deposit</span>
                    <p className="font-semibold text-sm">₹{state.property.deposit?.toLocaleString() || state.amount?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Bed className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">BHK</span>
                    <p className="font-semibold text-sm">{state.property.flatDetails?.bhkType || 'N/A'}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">Gender</span>
                    <p className="font-semibold text-sm">{state.property.pgDetails?.genderAllowed || 'N/A'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Utensils className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">Food</span>
                    <p className="font-semibold text-sm">{state.property.pgDetails?.foodIncluded ? 'Included' : 'Not Included'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <IndianRupee className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">Deposit</span>
                    <p className="font-semibold text-sm">₹{state.property.deposit?.toLocaleString() || state.amount?.toLocaleString() || 'N/A'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Detailed Specifications */}
            {state.propertyType === 'FLAT' && state.property.flatDetails && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Flat Specifications
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Total Rooms</p>
                      <p className="font-medium">{state.property.flatDetails.totalRooms || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Bathrooms</p>
                      <p className="font-medium">{state.property.flatDetails.bathrooms || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sofa className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Furnishing</p>
                      <p className="font-medium">{state.property.flatDetails.furnishingType || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">BHK Type</p>
                      <p className="font-medium">{state.property.flatDetails.bhkType || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PG Booking Details */}
            {state.propertyType === 'PG' && state.bookingData && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Booking Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Room Number</p>
                      <p className="font-medium">Room {state.bookingData.roomNumber || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Sharing Type</p>
                      <p className="font-medium">{state.bookingData.sharingType || 'N/A'}</p>
                    </div>
                  </div>
                  {state.bookingData.bedNumber && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Bed Number</p>
                        <p className="font-medium">Bed {state.bookingData.bedNumber}</p>
                      </div>
                    </div>
                  )}
                  {state.bookingData.pricePerBed && (
                    <div className="flex items-center gap-2">
                      <IndianRupee className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-500">Price per Bed</p>
                        <p className="font-medium">₹{state.bookingData.pricePerBed.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {state.property.description && (
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{state.property.description}</p>
              </div>
            )}

            {/* Rating */}
            {state.property.averageRating && (
              <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                <div className="flex items-center gap-1">
                  {renderStars(state.property.averageRating)}
                </div>
                <span className="text-sm text-gray-600">
                  {state.property.averageRating.toFixed(1)} ({state.property.totalRatings} {state.property.totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            )}

            {/* Owner Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Managed by</p>
              <p className="font-semibold">{state.property.ownerName || 'Property Owner'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Amenities Card */}
        {state.property.amenities && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Wifi className="w-5 h-5 text-primary" />
                Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {state.property.amenities.split(',').map((amenity, index) => {
                  const trimmedAmenity = amenity.trim();
                  return (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="flex items-center gap-1 px-3 py-1.5 text-sm hover:bg-primary/5 transition-colors"
                    >
                      {getAmenityIcon(trimmedAmenity)}
                      <span className="capitalize">{trimmedAmenity}</span>
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderPaymentSummary = () => {
    return (
      <Card className="border-primary/20">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-primary" />
            Payment Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {/* Booking Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Booking Details</h4>
            
            {state.propertyType === 'FLAT' ? (
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="font-semibold">
                    ₹{state.property?.flatDetails?.rentPerMonth?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-semibold">
                    ₹{state.property?.deposit?.toLocaleString()}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Bed Number</span>
                  <span className="font-semibold">Bed {state.bookingData?.bedNumber}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Monthly Rent</span>
                  <span className="font-semibold">
                    ₹{state.bookingData?.pricePerBed?.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-semibold">
                    ₹{state.property?.deposit?.toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Move-in Date</span>
              <span className="font-semibold">
                {state.bookingData?.moveInDate ? formatDate(state.bookingData.moveInDate) : 'N/A'}
              </span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-4 rounded-xl">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold text-primary">
                ₹{state.amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h4 className="font-semibold text-lg">Payment Methods</h4>
            <div className="grid grid-cols-1 gap-3">
              <div 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  state.selectedPaymentMethod === 'online' 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setState(prev => ({ ...prev, selectedPaymentMethod: 'online' }))}
              >
                <CreditCard className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Online Payment</p>
                  <p className="text-sm text-gray-600">Credit/Debit Card, UPI, Net Banking</p>
                </div>
                {state.selectedPaymentMethod === 'online' && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
              <div 
                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  state.selectedPaymentMethod === 'cash' 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setState(prev => ({ ...prev, selectedPaymentMethod: 'cash' }))}
              >
                <Banknote className="w-5 h-5 text-primary" />
                <div className="flex-1">
                  <p className="font-medium">Pay by Cash</p>
                  <p className="text-sm text-gray-600">Pay directly at the property</p>
                </div>
                {state.selectedPaymentMethod === 'cash' && (
                  <CheckCircle className="w-5 h-5 text-primary" />
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {state.paymentFailed ? (
              <>
                {/* Payment Failed Alert */}
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Payment Failed</h4>
                      <p className="text-sm text-red-700 mt-1">
                        {state.failureReason || 'Payment could not be processed. Please try again.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Retry and Back Buttons */}
                <div className="space-y-3">
                  <Button
                    onClick={retryPayment}
                    disabled={state.paymentProcessing}
                    className="w-full"
                    size="lg"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Retry Payment
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={cancelBooking}
                    className="w-full"
                    disabled={state.paymentProcessing}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Normal Payment Buttons */}
                <Button
                  onClick={state.selectedPaymentMethod === 'cash' ? initiateCashPayment : initiatePayment}
                  disabled={state.paymentProcessing || state.loading}
                  className="w-full"
                  size="lg"
                >
                  {state.paymentProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      {state.selectedPaymentMethod === 'cash' ? 'Processing Booking...' : 'Processing Payment...'}
                    </>
                  ) : (
                    <>
                      {state.selectedPaymentMethod === 'cash' ? (
                        <>
                          <Banknote className="w-5 h-5 mr-2" />
                          Book & Pay Cash Later
                        </>
                      ) : (
                        <>
                          <Shield className="w-5 h-5 mr-2" />
                          Pay ₹{state.amount.toLocaleString()}
                        </>
                      )}
                    </>
                  )}
                </Button>

                <Button
                  variant="destructive"
                  onClick={cancelBooking}
                  className="w-full"
                  disabled={state.paymentProcessing || state.loading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Booking
                </Button>
              </>
            )}
          </div>

          {/* Security Notice */}
          <div className={`p-4 rounded-lg ${
            state.selectedPaymentMethod === 'cash' 
              ? 'bg-amber-50 border border-amber-200' 
              : 'bg-blue-50'
          }`}>
            <div className="flex items-start gap-2">
              {state.selectedPaymentMethod === 'cash' ? (
                <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
              ) : (
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${
                  state.selectedPaymentMethod === 'cash' 
                    ? 'text-amber-900' 
                    : 'text-blue-900'
                }`}>
                  {state.selectedPaymentMethod === 'cash' ? 'Cash Payment Information' : 'Secure Payment'}
                </p>
                <p className={`text-sm mt-1 ${
                  state.selectedPaymentMethod === 'cash' 
                    ? 'text-amber-700' 
                    : 'text-blue-700'
                }`}>
                  {state.selectedPaymentMethod === 'cash' 
                    ? 'Please visit the property to complete your cash payment. The property owner will provide you with a receipt upon payment.'
                    : 'Your payment is secured by Razorpay with 256-bit encryption. All transactions are monitored for fraud protection.'
                  }
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (state.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <span className="text-gray-600">Loading payment details...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 text-red-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Payment Error</h2>
          <p className="text-gray-600 mb-6">{state.error}</p>
          <Button onClick={() => navigate('/properties')} size="lg">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Complete Payment</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Secure payment for your {state.propertyType} booking
              </p>
            </div>
            <Badge variant="outline" className="w-fit px-4 py-2 text-base">
              <Clock className="w-4 h-4 mr-1" />
              Payment Pending
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Property Details */}
          <div className="space-y-6">
            {renderPropertyDetails()}
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            {renderPaymentSummary()}
          </div>
        </div>
      </div>
    </div>
  );
};

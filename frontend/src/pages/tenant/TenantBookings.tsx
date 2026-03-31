import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  ArrowLeft, 
  Home, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  User,
  IndianRupee,
  MapPin,
  Star,
  Eye,
  X,
  CreditCard,
  Wallet
} from 'lucide-react';
import { tenantAPI } from '@/lib/api';

interface Booking {
  id: number;
  propertyType: 'FLAT' | 'PG';
  propertyId: number;
  propertyTitle: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyPincode: string;
  ownerName: string;
  depositAmount: number;
  bookingDate: string;
  moveInDate: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  // Flat specific
  flatNumber?: string;
  bhkType?: string;
  totalRooms?: number;
  bathrooms?: number;
  furnishingType?: string;
  rentPerMonth?: number;
  // PG specific
  roomNumber?: string;
  sharingType?: string;
  bedNumber?: string;
  genderAllowed?: string;
  foodIncluded?: boolean;
  pricePerBed?: number;
}

export const TenantBookings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    
    // Show success message if redirected from payment
    if (location.state?.success) {
      toast.success(location.state.message);
      // Clear the location state
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location.state]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getMyBookings();
      
      if (response.data.success) {
        setBookings(response.data.bookings || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch bookings');
      }
    } catch (error: any) {
      console.error('Error fetching bookings:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="w-4 h-4" />;
      case 'PENDING':
        return <Clock className="w-4 h-4" />;
      case 'CANCELLED':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
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

  const handlePayNow = (booking: Booking) => {
    // Navigate to payment page with booking data
    navigate('/payment', {
      state: {
        bookingId: booking.id,
        propertyType: booking.propertyType,
        property: {
          id: booking.propertyId,
          title: booking.propertyTitle,
          address: booking.propertyAddress,
          city: booking.propertyCity,
          state: booking.propertyState,
          pincode: booking.propertyPincode,
          propertyType: booking.propertyType,
          ownerName: booking.ownerName,
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
        },
        bookingData: {
          roomNumber: booking.roomNumber,
          sharingType: booking.sharingType,
          bedNumber: booking.bedNumber,
          pricePerBed: booking.pricePerBed
        },
        amount: booking.depositAmount
      }
    });
  };

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {booking.propertyType === 'FLAT' ? (
              <Building2 className="w-5 h-5 text-primary" />
            ) : (
              <Home className="w-5 h-5 text-primary" />
            )}
            <div>
              <CardTitle className="text-lg">{booking.propertyTitle}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <MapPin className="w-4 h-4" />
                <span>{booking.propertyAddress}, {booking.propertyCity}</span>
              </div>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(booking.status)} flex items-center gap-1`}
          >
            {getStatusIcon(booking.status)}
            <span className="capitalize">{booking.status.toLowerCase()}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Property Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-600">Property Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Type:</span>
                <span className="font-medium">{booking.propertyType}</span>
              </div>
              {booking.propertyType === 'FLAT' && booking.bhkType && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">BHK Type:</span>
                  <span className="font-medium">{booking.bhkType}</span>
                </div>
              )}
              {booking.propertyType === 'PG' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">Room {booking.roomNumber}</span>
                  </div>
                  {booking.bedNumber && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Bed:</span>
                      <span className="font-medium">Bed {booking.bedNumber}</span>
                    </div>
                  )}
                  {booking.sharingType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sharing:</span>
                      <span className="font-medium">{booking.sharingType}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Move-in Date:</span>
                <span className="font-medium">{formatDate(booking.moveInDate)}</span>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-gray-600">Booking Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Deposit Amount:</span>
                <span className="font-bold text-primary">
                  ₹{booking.depositAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Booked on:</span>
                <span className="font-medium">
                  {formatDate(booking.bookingDate)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-medium text-xs">#{booking.id}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/properties/${booking.propertyId}`)}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Property
          </Button>
          {booking.status === 'PENDING' && (
            <Button
              size="sm"
              onClick={() => handlePayNow(booking)}
              className="flex-1 bg-primary hover:bg-primary/600"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Pay Now
            </Button>
          )}
          {booking.status === 'CONFIRMED' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info('Contact owner functionality coming soon!')}
              className="flex-1"
            >
              <User className="w-4 h-4 mr-2" />
              Contact Owner
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <span className="text-gray-600">Loading your bookings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">My Bookings</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your property bookings and track payment status
              </p>
            </div>
            <Button
              onClick={() => navigate('/properties')}
              variant="outline"
              className="w-fit"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Properties
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
              <Home className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4">No Bookings Yet</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't made any bookings yet. Start exploring properties and book your dream home!
            </p>
            <Button onClick={() => navigate('/properties')} size="lg">
              <Home className="w-5 h-5 mr-2" />
              Explore Properties
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                Your Bookings ({bookings.length})
              </h2>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{bookings.filter(b => b.status === 'CONFIRMED').length} confirmed</span>
                <Clock className="w-4 h-4 text-yellow-500 ml-2" />
                <span>{bookings.filter(b => b.status === 'PENDING').length} pending</span>
                <X className="w-4 h-4 text-red-500 ml-2" />
                <span>{bookings.filter(b => b.status === 'CANCELLED').length} cancelled</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {bookings.map(renderBookingCard)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

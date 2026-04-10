import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { tenantAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Home, 
  MapPin, 
  IndianRupee,
  Bed,
  Bath,
  Wifi,
  Car,
  Utensils,
  Shield,
  Star,
  Calendar,
  ArrowLeft,
  Info,
  CheckCircle,
  XCircle,
  Building2,
  Users,
  Sofa,
  Key
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  propertyType: 'FLAT' | 'PG';
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  deposit: number;
  amenities: string;
  ownerName: string;
  averageRating: number;
  totalRatings: number;
  flatDetails?: {
    id: number;
    bhkType: string;
    rentPerMonth: number;
    totalRooms: number;
    bathrooms: number;
    furnishingType: string;
    flatNumber: string;
  };
}

export const BookFlat: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [formData, setFormData] = useState({
    moveInDate: '',
    message: '',
  });

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await tenantAPI.getPropertyById(id!);
      setProperty(response.data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!property) {
      toast.error('Property not found');
      return;
    }
    
    if (!formData.moveInDate) {
      toast.error('Please select a move-in date');
      return;
    }
    
    try {
      setBookingLoading(true);
      
      // Validate user
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        toast.error('Please login to continue');
        navigate('/login');
        return;
      }

      const user = JSON.parse(userStr || '{}');
      if (user.role !== 'TENANT') {
        toast.error('Only tenants can book properties');
        return;
      }

      // Create booking first
      const bookingResponse = await tenantAPI.bookFlat(
        property.flatDetails?.id?.toString() || '0', 
        formData.moveInDate
      );
      
      const bookingId = bookingResponse.data.bookingId;

      if (!bookingResponse.data.success) {
        throw new Error(bookingResponse.data.message || 'Failed to create booking');
      }

      toast.success('Booking created successfully!');
      
      // Redirect to PaymentPage with booking ID
      navigate('/payment', {
        state: {
          bookingId: bookingId
        }
      });
      
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const getAmenityIcon = (amenityId: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      wifi: <Wifi className="w-4 h-4" />,
      parking: <Car className="w-4 h-4" />,
      kitchen: <Utensils className="w-4 h-4" />,
      security: <Shield className="w-4 h-4" />,
    };
    return icons[amenityId.toLowerCase()] || <div className="w-4 h-4" />;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent"></div>
          <span className="text-gray-600">Loading property details...</span>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="bg-red-50 text-red-600 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <XCircle className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Property Not Found</h2>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist or has been removed.</p>
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
      {/* Header - Responsive with gradient background */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/properties')}
            className="mb-4 hover:bg-white/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Book Flat</h1>
              <p className="text-sm sm:text-base text-gray-600">Complete your booking details</p>
            </div>
            <Badge variant="outline" className="w-fit px-4 py-2 text-base">
              {property.propertyType}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Property Details Column */}
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
                  <h2 className="text-xl sm:text-2xl font-bold mb-3">{property.title}</h2>
                  <div className="flex flex-wrap items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm sm:text-base break-words">
                      {property.address}, {property.city}, {property.state} - {property.pincode}
                    </span>
                  </div>
                  {property.flatDetails?.flatNumber && (
                    <div className="mt-2 flex items-center gap-2 text-gray-600">
                      <Building2 className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Flat No: {property.flatDetails.flatNumber}</span>
                    </div>
                  )}
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <IndianRupee className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">Monthly Rent</span>
                    <p className="font-semibold text-sm">₹{property.flatDetails?.rentPerMonth.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Key className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">Deposit</span>
                    <p className="font-semibold text-sm">₹{property.deposit.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-center">
                    <Bed className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <span className="text-xs text-gray-600">BHK</span>
                    <p className="font-semibold text-sm">{property.flatDetails?.bhkType}</p>
                  </div>
                </div>

                {/* Flat Details */}
                {property.flatDetails && (
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
                          <p className="font-medium">{property.flatDetails.totalRooms}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Bath className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Bathrooms</p>
                          <p className="font-medium">{property.flatDetails.bathrooms}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sofa className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">Furnishing</p>
                          <p className="font-medium">{property.flatDetails.furnishingType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <div>
                          <p className="text-xs text-gray-500">BHK Type</p>
                          <p className="font-medium">{property.flatDetails.bhkType}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                {property.description && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Description
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{property.description}</p>
                  </div>
                )}

                {/* Rating */}
                <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                  <div className="flex items-center gap-1">
                    {renderStars(property.averageRating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    {property.averageRating.toFixed(1)} ({property.totalRatings} {property.totalRatings === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>

                {/* Owner Info */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Managed by</p>
                  <p className="font-semibold">{property.ownerName}</p>
                </div>
              </CardContent>
            </Card>

            {/* Amenities Card */}
            {property.amenities && (
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Wifi className="w-5 h-5 text-primary" />
                    Amenities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.split(',').map((amenity, index) => {
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

          {/* Booking Form Column */}
          <div className="space-y-6">
            <Card className="hover:shadow-lg transition-shadow border-primary/20">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Calendar className="w-5 h-5 text-primary" />
                  Complete Your Booking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="moveInDate" className="text-sm font-medium mb-1.5 block">
                        Move-in Date <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="moveInDate"
                        type="date"
                        value={formData.moveInDate}
                        onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message" className="text-sm font-medium mb-1.5 block">
                        Message to Owner (Optional)
                      </Label>
                      <textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        placeholder="Any special requirements or questions..."
                        className="w-full min-h-[100px] px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                        rows={4}
                      />
                    </div>
                  </div>

                  {/* Booking Summary */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-6 rounded-xl">
                    <h4 className="font-semibold text-base sm:text-lg mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Booking Summary
                    </h4>
                    <div className="space-y-3 text-sm sm:text-base">
                      <div className="flex justify-between py-2 border-b border-primary/10">
                        <span className="text-gray-600">Monthly Rent:</span>
                        <span className="font-semibold text-primary">
                          ₹{property.flatDetails?.rentPerMonth.toLocaleString() || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-primary/10">
                        <span className="text-gray-600">Security Deposit:</span>
                        <span className="font-semibold">
                          ₹{property.deposit.toLocaleString()}
                        </span>
                      </div>
                      {property.flatDetails && (
                        <div className="flex justify-between py-2 border-b border-primary/10">
                          <span className="text-gray-600">BHK Type:</span>
                          <span className="font-semibold">
                            {property.flatDetails.bhkType}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between pt-3 font-bold text-base sm:text-lg">
                        <span>Total Amount:</span>
                        <span className="text-primary">
                          ₹{((property.flatDetails?.rentPerMonth || 0) + property.deposit).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 text-xs text-gray-500 bg-white/50 p-3 rounded-lg">
                      <p className="flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        First month's rent + security deposit payable at booking
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => navigate('/properties')}
                      className="flex-1 order-2 sm:order-1"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="button"
                      onClick={handleBooking}
                      disabled={bookingLoading || !formData.moveInDate}
                      className="flex-1 order-1 sm:order-2"
                      size="lg"
                    >
                      {bookingLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        'Confirm Booking'
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-center text-gray-500">
                    By confirming, you agree to the booking terms and conditions
                  </p>
                </form>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 sm:p-6">
                <h4 className="font-semibold text-sm sm:text-base mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Booking Tips
                </h4>
                <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Choose a move-in date at least 3-5 days from today
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    Add special requirements in the message field
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    The owner will contact you within 24 hours
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
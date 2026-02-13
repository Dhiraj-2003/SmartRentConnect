import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  ArrowLeft
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

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      setBookingLoading(true);
      await tenantAPI.bookFlat(id!);
      toast.success('Flat booked successfully!');
      navigate('/tenant/dashboard');
    } catch (error: any) {
      console.error('Error booking flat:', error);
      toast.error(error.response?.data?.message || 'Failed to book flat');
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
    return icons[amenityId] || <div className="w-4 h-4" />;
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading property details...</span>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
          <Button onClick={() => navigate('/properties')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/properties')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Properties
        </Button>
        
        <h1 className="text-3xl font-bold mb-2">Book Flat</h1>
        <p className="text-gray-600">Complete your booking details</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Property Details */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <Home className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">{property.title}</h2>
                <Badge variant="secondary">{property.propertyType}</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.city}</span>
              </div>

              {property.flatDetails && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rent:</span>
                    <span className="font-semibold text-lg">₹{property.flatDetails.rentPerMonth.toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">BHK Type:</span>
                    <span>{property.flatDetails.bhkType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rooms:</span>
                    <span>{property.flatDetails.totalRooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bathrooms:</span>
                    <span>{property.flatDetails.bathrooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Furnishing:</span>
                    <span>{property.flatDetails.furnishingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Deposit:</span>
                    <span className="font-semibold">₹{property.deposit.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Rating */}
              <div className="flex items-center gap-2 pt-4 border-t">
                <div className="flex items-center">
                  {renderStars(property.averageRating)}
                </div>
                <span className="text-sm text-gray-600">
                  ({property.totalRatings} {property.totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          {property.amenities && (
            <Card>
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.split(',').map((amenity, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {getAmenityIcon(amenity.trim())}
                      {amenity.trim()}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <Label htmlFor="moveInDate">Move-in Date *</Label>
                  <Input
                    id="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message to Owner (Optional)</Label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Any special requirements or questions..."
                    className="w-full min-h-[100px] p-3 border rounded-md resize-none"
                    rows={4}
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Booking Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Monthly Rent:</span>
                      <span className="font-semibold">₹{property.flatDetails?.rentPerMonth.toLocaleString() || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit:</span>
                      <span className="font-semibold">₹{property.deposit.toLocaleString()}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-semibold">
                      <span>Total Amount:</span>
                      <span>₹{((property.flatDetails?.rentPerMonth || 0) + property.deposit).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/properties')}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={bookingLoading || !formData.moveInDate}
                    className="flex-1"
                  >
                    {bookingLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      'Confirm Booking'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

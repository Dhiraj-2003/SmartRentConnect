import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { tenantAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Home, 
  Users, 
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
  pgDetails?: {
    genderAllowed: string;
    foodIncluded: boolean;
    rooms: Array<{
      roomNumber: string;
      sharingType: string;
      totalBeds: number;
      bathrooms: number;
      pricePerBed: number;
      availableBeds: number;
    }>;
  };
}

interface PGAvailability {
  propertyId: number;
  rooms: Array<{
    id: string;
    roomNumber: string;
    sharingType: string;
    totalBeds: number;
    availableBeds: number;
    pricePerBed: number;
    bathrooms: number;
    beds: Array<{
      id: string;
      bedNumber: string;
      isAvailable: boolean;
    }>;
  }>;
}

export const BookPG: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [availability, setAvailability] = useState<PGAvailability | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedBed, setSelectedBed] = useState<string | null>(null);
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
      const [propertyResponse, availabilityResponse] = await Promise.all([
        tenantAPI.getPropertyById(id!),
        tenantAPI.getPGAvailability(id!)
      ]);

      setProperty(propertyResponse.data);
      setAvailability(availabilityResponse.data);
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId: string) => {
    setSelectedRoom(roomId);
    setSelectedBed(null);
  };

  const handleBedSelect = (bedId: string) => {
    setSelectedBed(bedId);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !selectedRoom || !selectedBed) return;

    try {
      setBookingLoading(true);
      await tenantAPI.bookBed(id!, selectedRoom, selectedBed);
      toast.success('Bed booked successfully!');
      navigate('/tenant/dashboard');
    } catch (error: any) {
      console.error('Error booking bed:', error);
      toast.error(error.response?.data?.message || 'Failed to book bed');
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        
        <h1 className="text-3xl font-bold mb-2">Book PG Bed</h1>
        <p className="text-gray-600">Select your preferred room and bed</p>
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
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">{property.title}</h2>
                <Badge variant="secondary">{property.propertyType}</Badge>
              </div>
              
              <div className="flex items-center gap-2 text-gray-600 mb-4">
                <MapPin className="w-4 h-4" />
                <span>{property.address}, {property.city}</span>
              </div>

              {property.pgDetails && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender Allowed:</span>
                    <span>{property.pgDetails.genderAllowed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Food:</span>
                    <span>{property.pgDetails.foodIncluded ? 'Included' : 'Not Included'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rooms:</span>
                    <span>{property.pgDetails.rooms.length}</span>
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

        {/* Room Selection */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Available Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              {availability ? (
                <div className="space-y-4">
                  {availability.rooms.map((room) => (
                    <div key={room.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
                          <p className="text-sm text-gray-600">{room.sharingType} Sharing</p>
                        </div>
                        <Badge variant={room.availableBeds > 0 ? 'default' : 'secondary'}>
                          {room.availableBeds > 0 ? `${room.availableBeds} beds available` : 'Full'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">Total Beds:</span>
                          <span className="font-medium">{room.totalBeds}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Bathrooms:</span>
                          <span className="font-medium">{room.bathrooms}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Price/Bed:</span>
                          <span className="font-medium">₹{room.pricePerBed.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Bed Selection */}
                      {room.availableBeds > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Select Bed:</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {room.beds.map((bed) => (
                              <div
                                key={bed.id}
                                className={`border rounded p-3 cursor-pointer transition-colors ${
                                  selectedBed === bed.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                onClick={() => handleBedSelect(bed.id)}
                              >
                                <div className="flex justify-between items-center">
                                  <span>Bed {bed.bedNumber}</span>
                                  <Badge variant={bed.isAvailable ? 'default' : 'secondary'}>
                                    {bed.isAvailable ? 'Available' : 'Occupied'}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No availability information found</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Form */}
          {selectedBed && (
            <Card>
              <CardHeader>
                <CardTitle>Booking Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBooking} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Move-in Date *</label>
                    <input
                      type="date"
                      value={formData.moveInDate}
                      onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3 border rounded-md"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Message to Owner (Optional)</label>
                    <textarea
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
                        <span>Selected Room:</span>
                        <span className="font-semibold">
                          {availability?.rooms.find(r => r.id === selectedRoom)?.roomNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Selected Bed:</span>
                        <span className="font-semibold">
                          {availability?.rooms.find(r => r.id === selectedRoom)?.beds.find(b => b.id === selectedBed)?.bedNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly Rent:</span>
                        <span className="font-semibold">
                          ₹{availability?.rooms.find(r => r.id === selectedRoom)?.pricePerBed.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Security Deposit:</span>
                        <span className="font-semibold">₹{property.deposit.toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total Amount:</span>
                        <span>
                          ₹{(property.deposit + (availability?.rooms.find(r => r.id === selectedRoom)?.pricePerBed || 0)).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedRoom(null);
                        setSelectedBed(null);
                      }}
                      className="flex-1"
                    >
                      Clear Selection
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
          )}
        </div>
      </div>
    </div>
  );
};

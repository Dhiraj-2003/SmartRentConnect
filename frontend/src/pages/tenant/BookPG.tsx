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
  ArrowLeft,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BookingDialog } from '@/components/tenant/BookingDialog';

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
      isOccupied: boolean;  // Using isOccupied field
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
  const [showBookingDialog, setShowBookingDialog] = useState(false);
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
    setShowBookingDialog(true);
  };

  const handleBookingComplete = () => {
    // Reset selections after successful booking
    setSelectedRoom(null);
    setSelectedBed(null);
    setFormData({ moveInDate: '', message: '' });
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property || !selectedRoom || !selectedBed) return;

    if (!formData.moveInDate) {
      toast.error('Please select a move-in date');
      return;
    }

    try {
      setBookingLoading(true);
      
      // Get room and bed details
      const room = availability?.rooms.find(r => r.id === selectedRoom);
      const bed = room?.beds.find(b => b.id === selectedBed);
      
      if (!room || !bed) {
        toast.error('Invalid room or bed selection');
        return;
      }

      // Calculate total amount (monthly rent + deposit)
      const monthlyRent = room.pricePerBed || 0;
      const deposit = property.deposit || 0;
      const totalAmount = monthlyRent + deposit;

      // Prepare booking data
      const bookingData = {
        moveInDate: formData.moveInDate,
        message: formData.message,
        roomId: selectedRoom,
        roomNumber: room.roomNumber,
        bedId: selectedBed,
        bedNumber: bed.bedNumber,
        sharingType: room.sharingType,
        pricePerBed: monthlyRent,
        deposit,
        totalAmount
      };

      // Redirect to payment page with booking data
      navigate('/payment', {
        state: {
          propertyType: 'PG',
          property,
          bookingData,
          amount: totalAmount
        }
      });
      
    } catch (error: any) {
      console.error('Error preparing booking:', error);
      toast.error(error.response?.data?.message || 'Failed to prepare booking');
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
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Book PG Bed</h1>
              <p className="text-sm sm:text-base text-gray-600">Select your preferred room and bed</p>
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
                    <span className="text-sm sm:text-base break-words">{property.address}, {property.city}, {property.state} - {property.pincode}</span>
                  </div>
                </div>

                {property.pgDetails && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <Users className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <span className="text-xs text-gray-600">Gender</span>
                      <p className="font-semibold text-sm">{property.pgDetails.genderAllowed}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <Utensils className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <span className="text-xs text-gray-600">Food</span>
                      <p className="font-semibold text-sm">{property.pgDetails.foodIncluded ? 'Included' : 'Not Included'}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg text-center">
                      <IndianRupee className="w-5 h-5 mx-auto mb-1 text-primary" />
                      <span className="text-xs text-gray-600">Deposit</span>
                      <p className="font-semibold text-sm">₹{property.deposit.toLocaleString()}</p>
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

          {/* Room Selection Column */}
          <div className="space-y-6">
            {/* Available Rooms */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-lg sm:text-xl">
                    <Bed className="w-5 h-5 text-primary" />
                    Available Rooms
                  </div>
                  {availability && (
                    <Badge variant="default" className="text-sm">
                      {availability.rooms.reduce((total, room) => 
                        total + room.beds.filter(bed => !bed.isOccupied).length, 0
                      )} beds available
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-[48rem] overflow-y-auto">
                {availability ? (
                  <div className="space-y-4">
                    {availability.rooms.map((room) => {
                      // Calculate available beds (where isOccupied is false)
                      const availableBeds = room.beds.filter(bed => !bed.isOccupied).length;
                      
                      return (
                        <div 
                          key={room.id} 
                          className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                            selectedRoom === room.id ? 'border-primary ring-2 ring-primary/20' : ''
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                            <div>
                              <h3 className="font-semibold text-lg">Room {room.roomNumber}</h3>
                              <p className="text-sm text-gray-600">{room.sharingType} Sharing</p>
                            </div>
                            <Badge 
                              variant={availableBeds > 0 ? 'default' : 'secondary'}
                              className="w-fit"
                            >
                              {availableBeds > 0 
                                ? `${availableBeds} bed${availableBeds > 1 ? 's' : ''} available` 
                                : 'Fully Occupied'}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600 block text-xs">Total Beds</span>
                              <span className="font-semibold">{room.totalBeds}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded">
                              <span className="text-gray-600 block text-xs">Bathrooms</span>
                              <span className="font-semibold">{room.bathrooms}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded col-span-2 sm:col-span-1">
                              <span className="text-gray-600 block text-xs">Price/Bed</span>
                              <span className="font-semibold">₹{room.pricePerBed.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Bed Selection */}
                          {availableBeds > 0 && (
                            <div className="border-t pt-3">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-sm">Available Beds:</h4>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRoomSelect(room.id)}
                                  className={selectedRoom === room.id ? 'bg-primary text-white hover:bg-primary/90' : ''}
                                >
                                  {selectedRoom === room.id ? 'Selected' : 'Select Room'}
                                </Button>
                              </div>
                              
                              {selectedRoom === room.id && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
                                  {room.beds.map((bed) => {
                                    const isAvailable = !bed.isOccupied; // Available if not occupied
                                    
                                    return (
                                      <div
                                        key={bed.id}
                                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                                          selectedBed === bed.id
                                            ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                                            : isAvailable
                                              ? 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                              : 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                                        }`}
                                        onClick={() => isAvailable && handleBedSelect(bed.id)}
                                      >
                                        <div className="flex flex-col items-center text-center gap-1">
                                          <Bed className={`w-4 h-4 ${isAvailable ? 'text-gray-600' : 'text-gray-400'}`} />
                                          <span className={`text-sm font-medium ${!isAvailable && 'text-gray-500'}`}>
                                            Bed {bed.bedNumber}
                                          </span>
                                          <Badge 
                                            variant={isAvailable ? 'default' : 'secondary'} 
                                            className={`text-xs ${!isAvailable && 'bg-gray-200 text-gray-600'}`}
                                          >
                                            {isAvailable ? 'Available' : 'Occupied'}
                                          </Badge>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Show message if no beds available */}
                          {availableBeds === 0 && (
                            <div className="border-t pt-3">
                              <p className="text-sm text-gray-500 text-center py-2">
                                No beds available in this room
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                      <Info className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-2">No availability information found</p>
                    <p className="text-sm text-gray-500">Please check back later or contact the owner</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Dialog */}
      <BookingDialog
        open={showBookingDialog}
        onOpenChange={setShowBookingDialog}
        property={property}
        availability={availability}
        selectedRoom={selectedRoom}
        selectedBed={selectedBed}
        onBookingComplete={handleBookingComplete}
      />
    </div>
  );
};
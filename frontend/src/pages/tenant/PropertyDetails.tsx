import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Eye,
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
  rejectionReason?: string;
  
  // Flat specific
  flatDetails?: {
    bhkType: string;
    rentPerMonth: number;
    totalRooms: number;
    bathrooms: number;
    furnishingType: string;
    flatNumber: string;
  };
  
  // PG specific
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

interface PropertyImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
}

interface PropertyDocument {
  id: number;
  documentName: string;
  documentUrl: string;
  documentType: string;
}

export const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedDocument, setSelectedDocument] = useState<PropertyDocument | null>(null);

  useEffect(() => {
    if (id) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const [propertyResponse, imagesResponse, documentsResponse] = await Promise.all([
        tenantAPI.getPropertyById(id!),
        tenantAPI.getPropertyImages(id!),
        tenantAPI.getPropertyDocuments(id!)
      ]);

      setProperty(propertyResponse.data);
      setImages(imagesResponse.data || []);
      setDocuments(documentsResponse.data || []);
    } catch (error) {
      console.error('Error fetching property details:', error);
      toast.error('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const getPropertyTypeIcon = (type: string) => {
    return type === 'FLAT' ? <Home className="w-5 h-5" /> : <Users className="w-5 h-5" />;
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

  const handleBookFlat = () => {
    if (property?.id) {
      navigate(`/book/flat/${property.id}`);
    }
  };

  const handleViewPG = () => {
    if (property?.id) {
      navigate(`/book/pg/${property.id}`);
    }
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getPropertyTypeIcon(property.propertyType)}
              <h1 className="text-3xl font-bold">{property.title}</h1>
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <Badge variant="secondary">{property.propertyType}</Badge>
              <div className="flex items-center gap-1">
                {renderStars(property.averageRating)}
                <span className="ml-2 text-sm text-gray-600">
                  ({property.totalRatings} {property.totalRatings === 1 ? 'rating' : 'ratings'})
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>{property.address}, {property.city}, {property.state}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {property.propertyType === 'FLAT' && property.flatDetails 
                ? `₹${property.flatDetails.rentPerMonth.toLocaleString()}/month`
                : property.pgDetails 
                ? `₹${Math.min(...property.pgDetails.rooms.map(r => r.pricePerBed)).toLocaleString()}/bed`
                : 'Price not available'
              }
            </div>
            <div className="text-lg text-gray-600">
              Deposit: ₹{property.deposit.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {images.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Property Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image) => (
                    <div 
                      key={image.id} 
                      className="relative cursor-pointer group"
                      onClick={() => setSelectedImage(image.imageUrl)}
                    >
                      <img 
                        src={image.imageUrl} 
                        alt={property.title}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      {image.isPrimary && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
                          Primary
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {property.description || 'No description available'}
              </p>
            </CardContent>
          </Card>

          {/* Property Type Specific Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent>
              {property.propertyType === 'FLAT' && property.flatDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span>BHK Type: <strong>{property.flatDetails.bhkType}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="w-4 h-4 text-gray-500" />
                    <span>Rooms: <strong>{property.flatDetails.totalRooms}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bath className="w-4 h-4 text-gray-500" />
                    <span>Bathrooms: <strong>{property.flatDetails.bathrooms}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-gray-500" />
                    <span>Furnishing: <strong>{property.flatDetails.furnishingType}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>Flat Number: <strong>{property.flatDetails.flatNumber}</strong></span>
                  </div>
                </div>
              ) : property.propertyType === 'PG' && property.pgDetails ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span>Gender Allowed: <strong>{property.pgDetails.genderAllowed}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-gray-500" />
                    <span>Food: <strong>{property.pgDetails.foodIncluded ? 'Included' : 'Not Included'}</strong></span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold">Available Rooms:</h4>
                    {property.pgDetails.rooms.map((room, index) => (
                      <div key={index} className="border rounded p-3">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Room {room.roomNumber}</span>
                          <Badge variant={room.availableBeds > 0 ? 'default' : 'secondary'}>
                            {room.availableBeds > 0 ? `${room.availableBeds} beds available` : 'Full'}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 mt-2">
                          <div>Sharing: {room.sharingType}</div>
                          <div>Total Beds: {room.totalBeds}</div>
                          <div>Bathrooms: {room.bathrooms}</div>
                          <div>Price per Bed: <strong>₹{room.pricePerBed.toLocaleString()}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Owner Info */}
          <Card>
            <CardHeader>
              <CardTitle>Property Owner</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="font-semibold">{property.ownerName}</h3>
                <p className="text-sm text-gray-600">Verified Owner</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          {documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-50"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span className="text-sm">{doc.documentName}</span>
                      </div>
                      <Badge variant="outline">{doc.documentType}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {property.propertyType === 'FLAT' ? (
                <Button onClick={handleBookFlat} className="w-full">
                  Book This Flat
                </Button>
              ) : (
                <Button onClick={handleViewPG} className="w-full">
                  View Available Beds
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{property.title}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img 
              src={selectedImage || ''} 
              alt={property.title}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Dialog */}
      <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.documentName}</DialogTitle>
          </DialogHeader>
          <div className="h-[70vh]">
            <iframe
              src={selectedDocument?.documentUrl}
              className="w-full h-full"
              title={selectedDocument?.documentName}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

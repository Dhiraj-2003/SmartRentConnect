import React from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Eye, Home, Utensils, Wifi, Coffee, Users2, BedDouble, Bath } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  rent: number;
  rating: number;
  ownerName: string;
  image: string;
  images?: any[];
  bedrooms: number;
  bathrooms: number;
  area: number;
  available: boolean;
  propertyType?: string;
  flatDetails?: {
    id: number;
    bhkType: string;
    rentPerMonth: number;
    totalRooms: number;
    bathrooms: number;
    furnishingType: string;
    flatNumber: string;
  };
  pgDetails?: {
    id: number;
    genderAllowed: string;
    foodIncluded: boolean;
    rooms: Array<{
      id: number;
      roomNumber: string;
      sharingType: string;
      totalBeds: number;
      bathrooms: number;
      pricePerBed: number;
      availableBeds: number;
      beds: Array<{
        id: number;
        bedNumber: string;
        isOccupied: boolean;
      }>;
    }>;
  };
}

interface PropertyCardProps {
  property: Property;
  onBook?: (propertyId: string) => void;
  onView?: (propertyId: string) => void;
  showActions?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ 
  property, 
  onBook, 
  onView,
  showActions = true 
}) => {
  const handleCardClick = () => {
    onView?.(property.id);
  };

  // Calculate PG stats
  const getPGStats = () => {
    if (!property.pgDetails?.rooms) return { totalBeds: 0, availableBeds: 0, sharingTypes: [] };
    
    const totalBeds = property.pgDetails.rooms.reduce((sum, room) => sum + room.totalBeds, 0);
    const availableBeds = property.pgDetails.rooms.reduce((sum, room) => sum + room.availableBeds, 0);
    
    // Get unique sharing types
    const sharingTypes = [...new Set(property.pgDetails.rooms.map(room => room.sharingType))];
    
    return { totalBeds, availableBeds, sharingTypes };
  };

  const pgStats = getPGStats();

  return (
    <div 
      className="bg-card rounded-lg shadow-card border border-border overflow-hidden hover:shadow-elevated transition-smooth cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative group">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        
        {/* Property Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
            {property.propertyType === 'FLAT' ? '🏠 Flat' : '🏢 PG'}
          </Badge>
        </div>
        
        {/* Eye button overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-800">
              View Photos
            </span>
          </div>
        </div>
        
        {/* Image count badge */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-1 py-1 rounded-md flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span className="text-xs font-medium">
            {property.images?.length || 1}
          </span>
        </div>
        
        <div className="absolute top-2 right-2">
          <Badge variant={property.available ? "default" : "secondary"}>
            {property.available ? 'Available' : 'Occupied'}
          </Badge>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-foreground flex-1">{property.title}</h3>
          <div className="flex items-center space-x-1 bg-card/90 backdrop-blur-sm rounded-lg px-2 py-1">
            <Star className="w-4 h-4 text-warning fill-current" />
            <span className="text-sm font-medium">{property.rating}</span>
          </div>
        </div>
        
        <div className="flex items-center text-muted-foreground mb-3">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="text-sm truncate">{property.location}</span>
        </div>

        {/* FLAT Specific Details */}
        {property.propertyType === 'FLAT' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-primary">
                ₹{property.rent.toLocaleString()}
                <span className="text-sm text-muted-foreground font-normal">/month</span>
              </div>
              <div className="text-sm text-muted-foreground">
                by {property.ownerName}
              </div>
            </div>

            {/* Flat Features */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <Home className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <span className="text-xs font-medium text-blue-700">
                  {property.flatDetails?.bhkType || `${property.bedrooms} BHK`}
                </span>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <Bath className="w-4 h-4 text-green-600 mx-auto mb-1" />
                <span className="text-xs font-medium text-green-700">
                  {property.flatDetails?.bathrooms || property.bathrooms} Bath
                </span>
              </div>
              <div className="bg-purple-50 rounded-lg p-2 text-center">
                <Users className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <span className="text-xs font-medium text-purple-700">
                  {property.flatDetails?.furnishingType || 'Standard'}
                </span>
              </div>
            </div>
          </>
        )}

        {/* PG Specific Details */}
        {property.propertyType === 'PG' && (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="text-2xl font-bold text-primary">
                ₹{property.pgDetails?.rooms?.[0]?.pricePerBed?.toLocaleString() || property.rent.toLocaleString()}
                <span className="text-sm text-muted-foreground font-normal">/bed</span>
              </div>
              {pgStats.sharingTypes.map((type, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <Users2 className="w-3 h-3 mr-1" />
                    {type}
                  </Badge>
                ))}
              <div className="text-sm text-muted-foreground">
                {pgStats.availableBeds} beds left
              </div>
            </div>

            {/* PG Features */}
            <div className="space-y-3 mb-4">
              {/* PG Amenities */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <Users className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-orange-700">
                    {pgStats.totalBeds} Beds
                  </span>
                </div>
                <div className="bg-teal-50 rounded-lg p-2 text-center">
                  <Bath className="w-4 h-4 text-teal-600 mx-auto mb-1" />
                  <span className="text-xs font-medium text-teal-700">
                    Shared Bath
                  </span>
                </div>
                <div className="bg-indigo-50 rounded-lg p-2 text-center">
                  {property.pgDetails?.foodIncluded ? (
                    <>
                      <Utensils className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <span className="text-xs font-medium text-indigo-700">
                        Food incl.
                      </span>
                    </>
                  ) : (
                    <>
                      <Coffee className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                      <span className="text-xs font-medium text-indigo-700">
                        Self Cook
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {showActions && (
          <div className="flex space-x-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation();
                onView?.(property.id);
              }}
            >
              View Details
            </Button>
            {property.available && (
              <Button
                variant="gradient"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook?.(property.id);
                }}
              >
                {property.propertyType === 'FLAT' ? 'Book Now' : 'Check Beds'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
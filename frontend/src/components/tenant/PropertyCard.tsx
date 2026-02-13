import React from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users, Eye } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  rent: number;
  rating: number;
  ownerName: string;
  image: string;
  images?: any[]; // Add images array for multiple images
  bedrooms: number;
  bathrooms: number;
  area: number;
  available: boolean;
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
        
        {/* Eye button overlay - similar to Owner's page */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-gray-800">
              View Photos
            </span>
          </div>
        </div>
        
        {/* Image count badge */}
        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center space-x-1">
          <Eye className="w-3 h-3" />
          <span className="text-xs font-medium">
            {property.images?.length || 1}
          </span>
        </div>
        
        <div className="absolute top-3 right-3">
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
        
        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="text-2xl font-bold text-primary">
            ₹{property.rent.toLocaleString()}
            <span className="text-sm text-muted-foreground font-normal">/month</span>
          </div>
          <div className="text-sm text-muted-foreground">
            by {property.ownerName}
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {property.bedrooms} BR
          </div>
          <div>{property.bathrooms} Bath</div>
          <div>{property.area} sq ft</div>
        </div>

        {showActions && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click when clicking button
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
                  e.stopPropagation(); // Prevent card click when clicking button
                  onBook?.(property.id);
                }}
              >
                Book Now
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
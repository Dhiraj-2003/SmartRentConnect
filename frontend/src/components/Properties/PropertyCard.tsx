import React from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Star, Users } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  rent: number;
  rating: number;
  ownerName: string;
  image: string;
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
  return (
    <div className="bg-card rounded-lg shadow-card border border-border overflow-hidden hover:shadow-elevated transition-smooth">
      <div className="relative">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 right-3">
          <Badge variant={property.available ? "default" : "secondary"}>
            {property.available ? 'Available' : 'Occupied'}
          </Badge>
        </div>
        <div className="absolute top-3 left-3 bg-card/90 backdrop-blur-sm rounded-lg px-2 py-1">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-warning fill-current" />
            <span className="text-sm font-medium">{property.rating}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">{property.title}</h3>
        
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
              onClick={() => onView?.(property.id)}
            >
              View Details
            </Button>
            {property.available && (
              <Button
                variant="gradient"
                size="sm"
                className="flex-1"
                onClick={() => onBook?.(property.id)}
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
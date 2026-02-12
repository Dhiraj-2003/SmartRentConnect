import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { tenantAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
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
  Eye
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

export const BrowseProperties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    propertyType: '',
    minDeposit: '',
    maxDeposit: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filters.city) params.city = filters.city;
      if (filters.propertyType) params.propertyType = filters.propertyType;
      if (filters.minDeposit) params.minDeposit = parseInt(filters.minDeposit);
      if (filters.maxDeposit) params.maxDeposit = parseInt(filters.maxDeposit);

      const response = await tenantAPI.getProperties(params);
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
      toast.error('Failed to fetch properties');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = (propertyId: number) => {
    navigate(`/properties/${propertyId}`);
  };

  const getPropertyTypeIcon = (type: string) => {
    return type === 'FLAT' ? <Home className="w-4 h-4" /> : <Users className="w-4 h-4" />;
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
        <span className="ml-2">Loading properties...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Properties</h1>
        <p className="text-gray-600 mt-2">
          Find your perfect home from our verified properties
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <Input
                placeholder="Enter city"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Type</label>
              <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="FLAT">Flat/Apartment</SelectItem>
                  <SelectItem value="PG">PG/Paying Guest</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Min Deposit</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minDeposit}
                  onChange={(e) => handleFilterChange('minDeposit', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Max Deposit</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxDeposit}
                  onChange={(e) => handleFilterChange('maxDeposit', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={fetchProperties} className="w-full">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Properties Found</h3>
            <p className="text-gray-600">Try adjusting your search filters</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getPropertyTypeIcon(property.propertyType)}
                    <CardTitle className="text-lg">{property.title}</CardTitle>
                  </div>
                  <Badge variant="secondary">{property.propertyType}</Badge>
                </div>
                
                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center">
                    {renderStars(property.averageRating)}
                  </div>
                  <span className="text-sm text-gray-600">
                    ({property.totalRatings} {property.totalRatings === 1 ? 'rating' : 'ratings'})
                  </span>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{property.address}, {property.city}</span>
                </div>

                {/* Property Type Specific Details */}
                {property.propertyType === 'FLAT' && property.flatDetails ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rent:</span>
                      <span className="font-semibold">₹{property.flatDetails.rentPerMonth.toLocaleString()}/month</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">BHK:</span>
                      <span>{property.flatDetails.bhkType}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rooms:</span>
                      <span>{property.flatDetails.totalRooms}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Bathrooms:</span>
                      <span>{property.flatDetails.bathrooms}</span>
                    </div>
                  </div>
                ) : property.propertyType === 'PG' && property.pgDetails ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Gender:</span>
                      <span>{property.pgDetails.genderAllowed}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Food:</span>
                      <span>{property.pgDetails.foodIncluded ? 'Included' : 'Not Included'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Rooms:</span>
                      <span>{property.pgDetails.rooms.length}</span>
                    </div>
                    {property.pgDetails.rooms.length > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Price Range:</span>
                        <span>
                          ₹{Math.min(...property.pgDetails.rooms.map(r => r.pricePerBed)).toLocaleString()} - 
                          ₹{Math.max(...property.pgDetails.rooms.map(r => r.pricePerBed)).toLocaleString()}/bed
                        </span>
                      </div>
                    )}
                  </div>
                ) : null}

                {/* Deposit */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Deposit:</span>
                  <span className="font-semibold">₹{property.deposit.toLocaleString()}</span>
                </div>

                {/* Amenities */}
                {property.amenities && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Amenities:</div>
                    <div className="flex flex-wrap gap-1">
                      {property.amenities.split(',').slice(0, 4).map((amenity, index) => (
                        <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                          {getAmenityIcon(amenity.trim())}
                          {amenity.trim()}
                        </Badge>
                      ))}
                      {property.amenities.split(',').length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{property.amenities.split(',').length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(property.id)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View Details
                  </Button>
                  
                  {property.propertyType === 'FLAT' ? (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/book/flat/${property.id}`)}
                      className="flex-1"
                    >
                      Book Flat
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/book/pg/${property.id}`)}
                      className="flex-1"
                    >
                      View Rooms
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

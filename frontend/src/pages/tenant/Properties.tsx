import React, { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/tenant/PropertyCard';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, X, Eye, Bed, Bath, Square, Star, MapPin as MapPinIcon, Users, Calendar, Home, Utensils, Coffee, Users2, Wifi, Tv, Award, CheckCircle, XCircle } from 'lucide-react';
import { tenantAPI } from '@/lib/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  location: string;
  rent: number;
  rating: number;
  ownerName: string;
  image: string;
  images?: string[]; // Changed to string[] for better type safety
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

export const Properties: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        console.log('Fetching all properties...');
        setLoading(true);
        const response = await tenantAPI.getAllProperties();
        console.log('API response:', response);
        
        // Add null check for response.data
        if (!response?.data) {
          throw new Error('No data received from API');
        }

        const transformedProperties = (response.data || []).map((property: any) => ({
          id: property.id?.toString() || '',
          title: property.title || 'Untitled Property',
          location: `${property.city || ''}, ${property.state || ''}`,
          rent: property.propertyType === 'FLAT' ? property.flatDetails?.rentPerMonth || 0 : 
                property.propertyType === 'PG' ? property.pgDetails?.rooms?.[0]?.pricePerBed || 0 : 0,
          rating: property.averageRating || 0,
          ownerName: property.ownerName || 'Unknown Owner',
          image: property.images && Array.isArray(property.images) && property.images.length > 0 
            ? property.images[0] 
            : '/placeholder.svg',
          images: property.images || [],
          bedrooms: property.propertyType === 'FLAT' ? property.flatDetails?.totalRooms || 1 : 
                    property.propertyType === 'PG' ? property.pgDetails?.rooms?.length || 0 : 0,
          bathrooms: property.propertyType === 'FLAT' ? property.flatDetails?.bathrooms || 1 : 
                      property.propertyType === 'PG' ? property.pgDetails?.rooms?.[0]?.bathrooms || 1 : 0,
          area: 500, // You might want to get this from API
          available: property.status === 'APPROVED',
          propertyType: property.propertyType,
          flatDetails: property.flatDetails,
          pgDetails: property.pgDetails
        }));
        
        console.log('Transformed properties:', transformedProperties);
        setProperties(transformedProperties);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching properties:', error);
        toast.error('Failed to fetch properties');
        setLoading(false);
      }
    };
    fetchAllProperties();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (state) params.state = state;
      if (city) params.city = city;
      if (pincode) params.pincode = pincode;
      if (minRent) params.minRent = parseFloat(minRent);
      if (maxRent) params.maxRent = parseFloat(maxRent);
      if (propertyType && propertyType !== 'all') params.propertyType = propertyType;
      
      const response = await tenantAPI.getProperties(params);
      
      // Add null check for response.data
      if (!response?.data) {
        throw new Error('No data received from API');
      }

      const transformedProperties = (response.data || []).map((property: any) => ({
        id: property.id?.toString() || '',
        title: property.title || 'Untitled Property',
        location: `${property.city || ''}, ${property.state || ''}`,
        rent: property.propertyType === 'FLAT' 
          ? property.flatDetails?.rentPerMonth || 0
          : property.pgDetails?.rooms?.[0]?.pricePerBed || 
            property.pgDetails?.rooms?.reduce((acc: number, room: any) => acc + (room.pricePerBed || 0), 0) || 0,
        rating: property.averageRating || 0,
        ownerName: property.ownerName || 'Unknown Owner',
        image: property.images && Array.isArray(property.images) && property.images.length > 0 
          ? property.images[0] 
          : '/placeholder.svg',
        images: property.images || [],
        bedrooms: property.propertyType === 'FLAT' ? property.flatDetails?.totalRooms || 1 : 
                  property.propertyType === 'PG' ? property.pgDetails?.rooms?.length || 0 : 0,
        bathrooms: property.propertyType === 'FLAT' ? property.flatDetails?.bathrooms || 1 : 
                    property.propertyType === 'PG' ? property.pgDetails?.rooms?.[0]?.bathrooms || 1 : 0,
        area: 500,
        available: property.status === 'APPROVED',
        propertyType: property.propertyType,
        flatDetails: property.flatDetails,
        pgDetails: property.pgDetails
      }));
      
      setProperties(transformedProperties);
      setLoading(false);
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('Search failed');
      setLoading(false);
    }
  };

  const handleBookProperty = (id: string) => {
    const property = properties.find(p => p.id === id);
    if (property) {
      if (property.propertyType === 'FLAT') {
        navigate(`/book/flat/${id}`, { state: { property } });
      } else if (property.propertyType === 'PG') {
        navigate(`/book/pg/${id}`, { state: { property } });
      } else {
        toast.info(`Booking for ${property.propertyType} properties coming soon!`);
      }
    } else {
      console.error('Property not found:', id);
      toast.error('Property not found');
    }
  };

  const handleViewDetails = (propertyId: string) => {
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setIsDialogOpen(true);
    } else {
      console.error('Property not found:', propertyId);
      toast.error('Property not found');
    }
  };

  // Calculate PG stats
  const getPGStats = (pgDetails?: Property['pgDetails']) => {
    if (!pgDetails?.rooms || pgDetails.rooms.length === 0) { 
      return { totalBeds: 0, availableBeds: 0, sharingTypes: [], minPrice: 0, maxPrice: 0 };
    }
    
    const totalBeds = pgDetails.rooms.reduce((sum, room) => sum + (room.totalBeds || 0), 0);
    const availableBeds = pgDetails.rooms.reduce((sum, room) => sum + (room.availableBeds || 0), 0);
    
    // Get unique sharing types
    const sharingTypes = [...new Set(pgDetails.rooms.map(room => room.sharingType))];
    
    // Get price range
    const prices = pgDetails.rooms.map(room => room.pricePerBed || 0).filter(price => price > 0);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
    
    return { totalBeds, availableBeds, sharingTypes, minPrice, maxPrice };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Browse Properties</h1>
        <p className="text-muted-foreground">Discover amazing properties for rent</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-8">
        <div className="flex flex-col space-y-4">
          {/* Basic Search */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by location, title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button variant="gradient" onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">State</label>
                <Input
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">City</label>
                <Input
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Pincode</label>
                <Input
                  placeholder="Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Property Type</label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="FLAT">Flat</SelectItem>
                    <SelectItem value="PG">PG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Min Rent</label>
                <Input
                  type="number"
                  placeholder="Min Rent"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Max Rent</label>
                <Input
                  type="number"
                  placeholder="Max Rent"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading properties...</span>
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg font-medium text-gray-900 mb-2">No Properties Found</p>
          <p className="text-gray-600">Check back later for new listings</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onBook={handleBookProperty}
              onView={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Property Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Property Details</span>
              <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedProperty && (
            <div className="space-y-6">
              {/* Property Images Gallery */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Home className="w-5 h-5 mr-2" />
                  Property Images ({selectedProperty.images?.length || 1})
                </h3>
                
                {/* Main Image Display */}
                <div className="relative h-64 bg-muted rounded-lg overflow-hidden">
                  <img
                    src={selectedProperty.image}
                    alt={selectedProperty.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for broken images
                      (e.target as HTMLImageElement).src = '/placeholder.svg';
                    }}
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-sm font-medium">{selectedProperty.rating}</span>
                      </div>
                    </div>
                  </div>
                  {/* Property Type Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="outline" className="bg-white/90 backdrop-blur-sm">
                      {selectedProperty.propertyType === 'FLAT' ? '🏠 Flat' : '🏢 PG'}
                    </Badge>
                  </div>
                </div>

                {/* Image Thumbnails Gallery */}
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {selectedProperty.images.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer">
                        <img
                          src={image}
                          alt={`${selectedProperty.title} - Image ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-border hover:border-primary transition-colors"
                          onClick={() => {
                            const updatedProperty = { ...selectedProperty, image };
                            setSelectedProperty(updatedProperty);
                          }}
                          onError={(e) => {
                            // Fallback for broken images
                            (e.target as HTMLImageElement).src = '/placeholder.svg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg flex items-center justify-center">
                          <Eye className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedProperty.title}</h2>
                  <div className="flex items-center text-muted-foreground mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1" />
                    <span>{selectedProperty.location}</span>
                  </div>
                </div>

                {/* Owner and Availability */}
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="font-medium">Owner: {selectedProperty.ownerName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedProperty.available ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="text-green-600 font-medium">Available</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-500" />
                        <span className="text-red-600 font-medium">Occupied</span>
                      </>
                    )}
                  </div>
                </div>

                {/* FLAT Specific Details */}
                {selectedProperty.propertyType === 'FLAT' && (
                  <>
                    {/* Rent Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Monthly Rent</p>
                      <div className="text-3xl font-bold text-primary">
                        ₹{selectedProperty.rent.toLocaleString()}
                        <span className="text-base text-muted-foreground font-normal ml-2">/month</span>
                      </div>
                    </div>

                    {/* Flat Details Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <Home className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Type</p>
                        <p className="font-semibold text-blue-700">
                          {selectedProperty.flatDetails?.bhkType || `${selectedProperty.bedrooms} BHK`}
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <Bed className="w-5 h-5 text-green-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Bedrooms</p>
                        <p className="font-semibold text-green-700">
                          {selectedProperty.flatDetails?.totalRooms || selectedProperty.bedrooms}
                        </p>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <Bath className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Bathrooms</p>
                        <p className="font-semibold text-purple-700">
                          {selectedProperty.flatDetails?.bathrooms || selectedProperty.bathrooms}
                        </p>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg text-center">
                        <Square className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                        <p className="text-xs text-gray-600">Area</p>
                        <p className="font-semibold text-orange-700">{selectedProperty.area} sq.ft</p>
                      </div>
                    </div>

                    {/* Furnishing Details */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Home className="w-4 h-4 mr-2 text-primary" />
                        Furnishing Details
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Type: {selectedProperty.flatDetails?.furnishingType || 'Standard'}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-sm">Flat No: {selectedProperty.flatDetails?.flatNumber || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* PG Specific Details */}
                {selectedProperty.propertyType === 'PG' && selectedProperty.pgDetails && (
                  <>
                    {/* Price Section */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Price</p>
                          <div className="text-3xl font-bold text-primary">
                            ₹{getPGStats(selectedProperty.pgDetails).minPrice}/bed
                          </div>
                        </div>
                        <Badge variant="outline" className="text-lg px-3 py-1">
                          {getPGStats(selectedProperty.pgDetails).availableBeds} beds left
                        </Badge>
                      </div>
                    </div>

                    {/* PG Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-lg p-3">
                        <p className="text-xs text-gray-500">Gender Allowed</p>
                        <p className="font-semibold text-gray-800">
                          {selectedProperty.pgDetails.genderAllowed === 'MALE' ? '👨 MALE Only' : 
                           selectedProperty.pgDetails.genderAllowed === 'FEMALE' ? '👩 FEMALE Only' : 
                           '👥 Co-living'}
                        </p>
                      </div>
                      <div className="border rounded-lg p-3">
                        <p className="text-xs text-gray-500">Food</p>
                        <p className="font-semibold text-gray-800 flex items-center">
                          {selectedProperty.pgDetails.foodIncluded ? (
                            <>
                              <Utensils className="w-4 h-4 mr-1 text-green-600" />
                              Included
                            </>
                          ) : (
                            <>
                              <Coffee className="w-4 h-4 mr-1 text-orange-600" />
                              Self Cook
                            </>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Room Types */}
                    <div className="border rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center">
                        <Users2 className="w-4 h-4 mr-2 text-primary" />
                        Available Room Types
                      </h4>
                      <div className="space-y-3">
                        {(() => {
                          // Deduplicate rooms by sharing type
                          const uniqueSharingTypes = new Map();
                          selectedProperty.pgDetails?.rooms?.forEach(room => {
                            if (!uniqueSharingTypes.has(room.sharingType)) {
                              uniqueSharingTypes.set(room.sharingType, room);
                            }
                          });
                          
                          const uniqueRooms = Array.from(uniqueSharingTypes.values()).sort((a, b) => {
                            const order: { [key: string]: number } = { 
                              'SINGLE': 1, 'DOUBLE': 2, 'TRIPLE': 3, 
                              'FOUR_SHARING': 4, 'FIVE_SHARING': 5, 'SIX_SHARING': 6 
                            };
                            return (order[a.sharingType] || 99) - (order[b.sharingType] || 99);
                          });
                          
                          return uniqueRooms.map((room: any) => {
                            // Calculate total beds and available beds for this sharing type
                            const allRoomsOfType = selectedProperty.pgDetails?.rooms?.filter(
                              r => r.sharingType === room.sharingType
                            ) || [];
                            const totalBedsForType = allRoomsOfType.reduce((sum, r) => sum + (r.totalBeds || 0), 0);
                            const availableBedsForType = allRoomsOfType.reduce((sum, r) => sum + (r.availableBeds || 0), 0);
                            
                            return (
                              <div key={room.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                                <div className="flex justify-between items-center mb-2">
                                  <h5 className="font-semibold text-gray-800">{room.sharingType} Sharing</h5>
                                  <Badge variant={availableBedsForType === 0 ? "secondary" : "default"}>
                                    {availableBedsForType === 0 ? 'Full' : `${availableBedsForType} beds`}
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  <div>
                                    <span className="text-gray-500">Price/bed</span>
                                    <p className="font-bold text-primary">₹{room.pricePerBed?.toLocaleString() || 0}</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Bathrooms</span>
                                    <p className="font-medium">{room.bathrooms || 1} per room</p>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">Total</span>
                                    <p className="font-medium">{totalBedsForType} beds</p>
                                  </div>
                                </div>
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4 border-t">
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={() => selectedProperty && handleBookProperty(selectedProperty.id)}
                    disabled={!selectedProperty.available}
                  >
                    {selectedProperty.available 
                      ? (selectedProperty.propertyType === 'FLAT' ? 'Book This Flat' : 'Book a Bed') 
                      : 'Not Available'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      toast.info('Contact owner functionality coming soon!');
                    }}
                  >
                    Contact Owner
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
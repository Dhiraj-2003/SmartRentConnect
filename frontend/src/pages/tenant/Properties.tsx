import React, { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/tenant/PropertyCard';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, MapPin, X, Eye, Bed, Bath, Square, Star, MapPin as MapPinIcon, Users, Calendar, Home } from 'lucide-react';
import { tenantAPI } from '@/lib/api'; // Use tenantAPI for approved properties
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
  images?: any[]; // Add images array for multiple images
  bedrooms: number;
  bathrooms: number;
  area: number;
  available: boolean;
  propertyType?: string; // Add property type to determine booking page
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
        // Initial load - no parameters to get all approved properties
        const response = await tenantAPI.getAllProperties();
        console.log('API response:', response);
        
        // Transform backend data to match PropertyCard interface
        const transformedProperties = response.data.map((property: any) => ({
          id: property.id.toString(),
          title: property.title,
          location: `${property.city}, ${property.state}`,
          rent: property.propertyType === 'FLAT' ? property.flatDetails?.rentPerMonth : 0,
          rating: property.averageRating,
          ownerName: property.ownerName,
          image: property.images && Array.isArray(property.images) && property.images.length > 0 
            ? property.images[0] 
            : '/placeholder.svg',
          images: property.images || [], // Include the full images array
          bedrooms: property.propertyType === 'FLAT' ? property.flatDetails?.totalRooms || 1 : 0,
          bathrooms: property.propertyType === 'FLAT' ? property.flatDetails?.bathrooms || 1 : 0,
          area: 500, // Default area since not provided by backend
          available: property.status === 'APPROVED',
          propertyType: property.propertyType // Include property type for booking routing
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
      
      // Transform backend data to match PropertyCard interface
      const transformedProperties = response.data.map((property: any) => ({
        id: property.id.toString(),
        title: property.title,
        location: `${property.city}, ${property.state}`,
        rent: property.propertyType === 'FLAT' ? property.flatDetails?.rentPerMonth : 0,
        rating: property.averageRating,
        ownerName: property.ownerName,
        image: property.images && Array.isArray(property.images) && property.images.length > 0 
          ? property.images[0] 
          : '/placeholder.svg',
        images: property.images || [], // Include the full images array
        bedrooms: property.propertyType === 'FLAT' ? property.flatDetails?.totalRooms || 1 : 0,
        bathrooms: property.propertyType === 'FLAT' ? property.flatDetails?.bathrooms || 1 : 0,
        area: 500, // Default area since not provided by backend
        available: property.status === 'APPROVED',
        propertyType: property.propertyType // Include property type for booking routing
      }));
      
      setProperties(transformedProperties);
      setLoading(false);
    } catch (error) {
      toast.error('Search failed');
      setLoading(false);
    }
  };

  const handleBookProperty = (id: string) => {
    // Find the property from the properties array
    const property = properties.find(p => p.id === id);
    if (property) {
      // Check property type and redirect to appropriate booking page
      if (property.propertyType === 'FLAT') {
        navigate(`/book/flat/${id}`, { state: { property } });
      } else if (property.propertyType === 'PG') {
        navigate(`/book/pg/${id}`, { state: { property } });
      } else {
        // Fallback for other property types
        toast.info(`Booking for ${property.propertyType} properties coming soon!`);
      }
    } else {
      console.error('Property not found:', id);
      toast.error('Property not found');
    }
  };

  const handleViewDetails = (propertyId: string) => {
    // Find the property from the properties array
    const property = properties.find(p => p.id === propertyId);
    if (property) {
      setSelectedProperty(property);
      setIsDialogOpen(true);
    } else {
      console.error('Property not found:', propertyId);
      toast.error('Property not found');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Browse Properties</h1>
        <p className="text-muted-foreground">Discover amazing properties for rent</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-8">
        {/* Basic Search */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search properties by title or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger>
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="FLAT">Flat</SelectItem>
                <SelectItem value="PG">PG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Button onClick={handleSearch} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center"
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
          </Button>
          
          {state || city || pincode || minRent || maxRent || propertyType ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Reset all filters
                setSearchQuery('');
                setState('');
                setCity('');
                setPincode('');
                setMinRent('');
                setMaxRent('');
                setPropertyType('');
              }}
            >
              <X className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          ) : null}
        </div>

        {/* Collapsible Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* State Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">State</label>
                <Input
                  placeholder="Enter state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  type="text"
                />
              </div>

              {/* City Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City</label>
                <Input
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  type="text"
                />
              </div>

              {/* Pincode Filter */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Pincode</label>
                <Input
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  type="text"
                  maxLength={6}
                />
              </div>

              {/* Rent Range */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Monthly Rent Range</label>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Min"
                    value={minRent}
                    onChange={(e) => setMinRent(e.target.value)}
                    type="number"
                    className="flex-1"
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    placeholder="Max"
                    value={maxRent}
                    onChange={(e) => setMaxRent(e.target.value)}
                    type="number"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${properties.length} properties found`}
          </p>
          <div className="flex items-center space-x-2">
            {state || city || pincode || minRent || maxRent || propertyType ? (
              <div className="flex items-center space-x-1">
                <span className="text-xs text-muted-foreground">Active filters:</span>
                <span className="text-xs font-medium text-primary">
                  {[state && `State: ${state}`, city && `City: ${city}`, pincode && `Pincode: ${pincode}`, minRent && `Min: ₹${minRent}`, maxRent && `Max: ₹${maxRent}`, propertyType && `Type: ${propertyType}`].filter(Boolean).join(', ')}
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
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
              <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
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
                  />
                  <div className="absolute top-3 right-3">
                    <div className="bg-card/90 backdrop-blur-sm rounded-lg px-3 py-1">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-warning fill-current" />
                        <span className="text-sm font-medium">{selectedProperty.rating}</span>
                      </div>
                    </div>
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
                            // Update main image when thumbnail is clicked
                            const updatedProperty = { ...selectedProperty, image };
                            setSelectedProperty(updatedProperty);
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="flex items-center space-x-2">
                      <Bed className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                        <p className="text-lg font-semibold">{selectedProperty.bedrooms}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="flex items-center space-x-2">
                      <Bath className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Bathrooms</p>
                        <p className="text-lg font-semibold">{selectedProperty.bathrooms}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card rounded-lg p-4 border">
                    <div className="flex items-center space-x-2">
                      <Square className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Area</p>
                        <p className="text-lg font-semibold">{selectedProperty.area} sq ft</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Rent</p>
                      <p className="text-2xl font-bold text-primary">₹{selectedProperty.rent.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Owner</p>
                      <p className="font-medium">{selectedProperty.ownerName}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${selectedProperty.available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm font-medium">
                    {selectedProperty.available ? 'Available' : 'Occupied'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={() => selectedProperty && handleBookProperty(selectedProperty.id)}
                    disabled={!selectedProperty.available}
                  >
                    {selectedProperty.available ? 'Book Now' : 'Not Available'}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      // Handle contact owner logic here
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
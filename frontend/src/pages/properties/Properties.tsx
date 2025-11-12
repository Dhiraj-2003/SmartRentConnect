import React, { useState, useEffect } from 'react';
import { PropertyCard } from '@/components/Properties/PropertyCard';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, MapPin } from 'lucide-react';
import { propertyAPI } from '@/lib/api';
import { toast } from 'sonner';

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
  description?: string;
  amenities?: string;
  images?: string;
}

export const Properties: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [minRent, setMinRent] = useState('');
  const [maxRent, setMaxRent] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await propertyAPI.getAll();
        // Transform API response to match component interface
        const transformedProperties = response.data.map((prop: any) => ({
          ...prop,
          id: prop.id.toString(),
          image: prop.images ? JSON.parse(prop.images)[0] : '/placeholder.svg',
          bedrooms: prop.bedrooms || 1,
          bathrooms: prop.bathrooms || 1,
          area: prop.area || 500,
        }));
        setProperties(transformedProperties);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to fetch properties');
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (location) params.location = location;
      if (minRent) params.minRent = parseFloat(minRent);
      if (maxRent) params.maxRent = parseFloat(maxRent);
      
      const response = await propertyAPI.search(params);
      // Transform API response to match component interface
      const transformedProperties = response.data.map((prop: any) => ({
        ...prop,
        id: prop.id.toString(),
        image: prop.images ? JSON.parse(prop.images)[0] : '/placeholder.svg',
        bedrooms: prop.bedrooms || 1,
        bathrooms: prop.bathrooms || 1,
        area: prop.area || 500,
      }));
      setProperties(transformedProperties);
      setLoading(false);
    } catch (error) {
      toast.error('Search failed');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Perfect Home</h1>
        <p className="text-muted-foreground">Discover amazing properties in your preferred location</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-lg shadow-card border border-border p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger>
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="koramangala">Koramangala</SelectItem>
                <SelectItem value="whitefield">Whitefield</SelectItem>
                <SelectItem value="indiranagar">Indiranagar</SelectItem>
                <SelectItem value="hsr">HSR Layout</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Input
              placeholder="Min Rent"
              value={minRent}
              onChange={(e) => setMinRent(e.target.value)}
              type="number"
            />
          </div>
          
          <div>
            <Input
              placeholder="Max Rent"
              value={maxRent}
              onChange={(e) => setMaxRent(e.target.value)}
              type="number"
            />
          </div>
          
          <div>
            <Button onClick={handleSearch} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {loading ? 'Loading...' : `${properties.length} properties found`}
          </p>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onBook={(id) => console.log('Book property:', id)}
            onView={(id) => console.log('View property:', id)}
          />
        ))}
      </div>
      
      {/* Map Integration Placeholder */}
      <div className="mt-8 bg-card rounded-lg shadow-card border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Map View</h2>
          <Button variant="outline" size="sm">
            <MapPin className="w-4 h-4 mr-2" />
            View on Map
          </Button>
        </div>
        <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
          <p className="text-muted-foreground">Google Maps integration coming soon</p>
        </div>
      </div>
    </div>
  );
};
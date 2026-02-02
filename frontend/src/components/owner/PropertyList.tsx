import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Star, 
  Users, 
  Bed, 
  Bath, 
  Square, 
  Trash2, 
  Edit, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle,
  Search,
  Filter,
  Eye,
  DollarSign
} from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ownerAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Property {
  id: number;
  title: string;
  description: string;
  location: string;
  city: string;
  state: string;
  pincode: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  available: boolean;
  rating: number;
  reviewCount: number;
  images: string[] | string; // Can be array of URLs or JSON string
  amenities: string;
  createdAt: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

interface PropertyListProps {
  limit?: number;
  showHeader?: boolean;
  onAddProperty?: () => void;
  verificationStatus: 'incomplete' | 'pending' | 'verified';
}

export const PropertyList: React.FC<PropertyListProps> = ({
  limit,
  showHeader = true,
  onAddProperty,
  verificationStatus
}) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Always load properties for owners (they should see all their properties regardless of verification status)
    if (verificationStatus === 'verified' || verificationStatus === 'pending') {
      loadProperties();
    }
  }, [verificationStatus]);

  // Auto-refresh properties every 30 seconds to get latest approval status
  useEffect(() => {
    if (verificationStatus === 'verified' || verificationStatus === 'pending') {
      const interval = setInterval(() => {
        loadProperties();
      }, 30000); // Refresh every 30 seconds

      return () => clearInterval(interval);
    }
  }, [verificationStatus]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getMyProperties({
        page: 0,
        size: limit || 100,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      setProperties(response.data.content || response.data);
      
      // Show feedback about property approval status
      const approvedCount = response.data.content?.filter((p: Property) => p.approvalStatus === 'APPROVED').length || 0;
      const pendingCount = response.data.content?.filter((p: Property) => p.approvalStatus === 'PENDING').length || 0;
      const rejectedCount = response.data.content?.filter((p: Property) => p.approvalStatus === 'REJECTED').length || 0;
      
      if (approvedCount > 0) {
        toast.success(`${approvedCount} property(s) approved and visible to tenants`);
      }
      if (pendingCount > 0) {
        toast.info(`${pendingCount} property(s) pending admin approval`);
      }
      if (rejectedCount > 0) {
        toast.error(`${rejectedCount} property(s) rejected. Please update and resubmit.`);
      }
      
    } catch (error: any) {
      console.error('Failed to load properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse images from JSON string or array
  const parseImages = (images: string[] | string): string[] => {
    if (!images) return [];
    
    if (Array.isArray(images)) {
      return images;
    }
    
    // If it's a string, try to parse as JSON
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // If parsing fails, return empty array
      return [];
    }
  };

  const handleDeleteProperty = async (propertyId: number) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    
    try {
      await ownerAPI.deleteProperty(propertyId.toString());
      toast.success('Property deleted successfully');
      loadProperties();
    } catch (error: any) {
      toast.error('Failed to delete property');
    }
  };

  const formatAddress = (property: Property) => {
    const parts = [
      property.location,
      property.city,
      property.state,
      property.pincode
    ].filter(Boolean); // Remove null/undefined values
    
    return parts.join(', ');
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'approved' && property.approvalStatus === 'APPROVED') ||
      (statusFilter === 'pending' && property.approvalStatus === 'PENDING') ||
      (statusFilter === 'rejected' && property.approvalStatus === 'REJECTED');
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-warning/10 text-warning"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-destructive/10 text-destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatsCards = () => {
    const totalProperties = properties.length;
    const approvedProperties = properties.filter(p => p.approvalStatus === 'APPROVED').length;
    const pendingProperties = properties.filter(p => p.approvalStatus === 'PENDING').length;
    const rejectedProperties = properties.filter(p => p.approvalStatus === 'REJECTED').length;

    return [
      { title: 'Total Properties', value: totalProperties, icon: Users, color: 'primary' },
      { title: 'Approved', value: approvedProperties, icon: CheckCircle, color: 'success' },
      { title: 'Pending Approval', value: pendingProperties, icon: Clock, color: 'warning' },
      { title: 'Rejected', value: rejectedProperties, icon: XCircle, color: 'destructive' },
    ];
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">My Properties</h2>
            <p className="text-muted-foreground">Manage your property listings</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={loadProperties} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {onAddProperty && (
              <Button onClick={onAddProperty}>
                Add Property
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {showHeader && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {getStatsCards().map((stat, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
                  <stat.icon className="w-4 h-4 mr-2" />
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No properties found</h3>
            <p className="text-muted-foreground mb-4">
              {properties.length === 0 && verificationStatus === 'verified' ? "You haven't added any properties yet." : "No properties match your search criteria."}
            </p>
            {onAddProperty && properties.length === 0 && (
              <Button onClick={onAddProperty}>
                Add Your First Property
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.slice(0, limit).map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Property Image */}
              <div className="relative h-48 bg-muted">
                {(() => {
                  const parsedImages = parseImages(property.images);
                  return parsedImages.length > 0 ? (
                    <img
                      src={parsedImages[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).style.display = 'none';
                        (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null;
                })()}
                <div className="absolute top-2 right-2">
                  {getStatusBadge(property.approvalStatus)}
                </div>
              </div>

              <CardContent className="p-4">
                {/* Property Title & Location */}
                <div className="mb-3">
                  <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3 mr-1" />
                    {formatAddress(property)}
                  </div>
                </div>

                {/* Rent */}
                <div className="flex items-center mb-3">
                  <span className="text-lg font-bold text-primary">
                    ₹{property.rent.toLocaleString()}/month
                  </span>
                </div>

                {/* Property Details */}
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Bed className="w-3 h-3 mr-1" />
                      {property.bedrooms}BR
                    </div>
                    <div className="flex items-center">
                      <Bath className="w-3 h-3 mr-1" />
                      {property.bathrooms}BA
                    </div>
                    <div className="flex items-center">
                      <Square className="w-3 h-3 mr-1" />
                      {property.area} sq ft
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {property.approvalStatus === 'APPROVED' && (
                  <div className="flex items-center mb-3">
                    <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{property.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({property.reviewCount} reviews)
                    </span>
                  </div>
                )}

                {/* Rejection Reason */}
                {property.approvalStatus === 'REJECTED' && property.rejectionReason && (
                  <div className="mb-3 p-2 bg-destructive/10 rounded-lg">
                    <p className="text-xs text-destructive">
                      <strong>Rejection Reason:</strong> {property.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteProperty(property.id)}
                    className="text-destructive border-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

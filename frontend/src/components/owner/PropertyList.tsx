import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ownerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  RefreshCw,
  MapPin,
  DollarSign,
  Star,
  Users,
  Bed,
  Bath,
  Square,
  Clock,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  Home,
  FileText,
  ExternalLink
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
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  ownerId: number;
  ownerName: string;
  createdAt: string;
  updatedAt: string;
  averageRating: number;
  totalRatings: number;
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
    genderAllowed: 'MALE' | 'FEMALE' | 'UNISEX';
    foodIncluded: boolean;
    rooms: Array<{
      id: number;
      roomNumber: string;
      sharingType: 'SINGLE' | 'DOUBLE' | 'TRIPLE' | 'FOUR_PLUS';
      totalBeds: number;
      bathrooms: number;
      pricePerBed: number;
      availableBeds: number;
    }>;
  };
  images: string[];
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
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [propertyImages, setPropertyImages] = useState<any[]>([]);
  const [propertyDocuments, setPropertyDocuments] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);

  // Helper function to get rent display based on property type
  const getRentDisplay = (property: Property) => {
    if (property.propertyType === 'FLAT' && property.flatDetails) {
      return property.flatDetails.rentPerMonth?.toLocaleString() || '0';
    } else if (property.propertyType === 'PG' && property.pgDetails && property.pgDetails.rooms && property.pgDetails.rooms.length > 0) {
      // For PG, show the price from the first room
      return property.pgDetails.rooms[0].pricePerBed?.toLocaleString() || '0';
    }
    return '0';
  };

  useEffect(() => {
    if (verificationStatus === 'verified') {
      loadProperties();
    }
  }, [verificationStatus]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await ownerAPI.getProperties();
      const properties = response.data || [];
      console.log('=== PROPERTIES LOADED ===');
      console.log('Raw response:', response);
      console.log('Loaded properties:', properties);
      console.log('Number of properties:', properties.length);
      properties.forEach((prop, index) => {
        console.log(`Property ${index + 1}:`);
        console.log('  ID:', prop.id);
        console.log('  Title:', prop.title);
        console.log('  Owner Name:', prop.ownerName);
        console.log('  Owner ID:', prop.ownerId);
        console.log('  Property Type:', prop.propertyType);
        console.log('  Status:', prop.status);
        console.log('  ---');
      });
      setProperties(properties);
    } catch (error: any) {
      console.error('Failed to load properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
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

  // Helper function to open property dialog
  const handlePropertyClick = async (property: Property) => {
    console.log('=== PROPERTY CLICKED ===');
    console.log('Property object:', property);
    console.log('Property ID:', property.id);
    console.log('Property Title:', property.title);
    console.log('Property Owner:', property.ownerName);
    console.log('Property Owner Email:', property.ownerId);
    
    setSelectedProperty(property);
    setIsDialogOpen(true);
    setLoadingMedia(true);
    
    try {
      // Fetch images and documents for this property
      const propertyId = property.id.toString();
      console.log('Fetching media for property ID:', propertyId);
      console.log('Property object:', property);
      
      const [imagesResponse, documentsResponse] = await Promise.all([
        ownerAPI.getPropertyImages(propertyId),
        ownerAPI.getPropertyDocuments(propertyId)
      ]);
      
      console.log('Images response:', imagesResponse);
      console.log('Documents response:', documentsResponse);
      
      setPropertyImages(imagesResponse.data || []);
      setPropertyDocuments(documentsResponse.data || []);
      
      console.log('Images set:', imagesResponse.data || []);
      console.log('Documents set:', documentsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch property media:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to load property media';
      
      if (error.response?.status === 404) {
        errorMessage = 'Property not found or no media available';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You don\'t have permission to view this property\'s media.';
      } else if (error.response?.status === 400) {
        errorMessage = `Bad request: ${error.response?.data?.error || 'Invalid request'}`;
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleEditProperty = (property: Property) => {
    // Navigate to edit page or open edit form
    toast.info('Edit functionality coming soon!');
    setIsDialogOpen(false);
  };

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsDocumentDialogOpen(true);
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'approved' && property.status === 'APPROVED') ||
      (statusFilter === 'pending' && property.status === 'PENDING') ||
      (statusFilter === 'rejected' && property.status === 'REJECTED');
    
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
    const approvedProperties = properties.filter(p => p.status === 'APPROVED').length;
    const pendingProperties = properties.filter(p => p.status === 'PENDING').length;
    const rejectedProperties = properties.filter(p => p.status === 'REJECTED').length;

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
            <Dialog key={property.id} open={isDialogOpen && selectedProperty?.id === property.id} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
              <DialogTrigger asChild>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handlePropertyClick(property)}>
                  {/* Property Image */}
                  <div className="relative h-48 bg-muted group">
                    {property.images && property.images.length > 0 ? (
                      <>
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover"
                        />
                        {/* Always visible view photos indicator */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
                            <Eye className="w-4 h-4 text-primary" />
                            <span className="text-sm font-medium text-gray-800">
                              View {property.images.length} {property.images.length === 1 ? 'Photo' : 'Photos'}
                            </span>
                          </div>
                        </div>
                        {/* Image count badge */}
                        <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs font-medium">
                            {property.images.length}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      {getStatusBadge(property.status)}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    {/* Property Title & Location */}
                    <div className="mb-3">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3 mr-1" />
                        {property.address}, {property.city}
                      </div>
                    </div>

                    {/* Rent */}
                    <div className="flex items-center mb-3">
                      <span className="text-lg font-bold text-primary">
                        ₹{getRentDisplay(property)}/month
                      </span>
                    </div>

                    {/* Property Details */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center space-x-3">
                        {property.propertyType === 'FLAT' ? (
                          <>
                            <div className="flex items-center">
                              <Bed className="w-3 h-3 mr-1" />
                              {property.flatDetails?.bhkType}
                            </div>
                            {property.flatDetails?.bathrooms && (
                              <div className="flex items-center">
                                <Bath className="w-3 h-3 mr-1" />
                                {property.flatDetails.bathrooms}BA
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              {property.pgDetails?.rooms && property.pgDetails.rooms.length > 0 ? property.pgDetails.rooms[0].sharingType : 'PG'}
                            </div>
                            {property.pgDetails?.genderAllowed && (
                              <div className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {property.pgDetails.genderAllowed}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Rating */}
                    {property.status === 'APPROVED' && (
                      <div className="flex items-center mb-3">
                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{property.averageRating?.toFixed(1) || '0.0'}</span>
                        <span className="text-sm text-muted-foreground ml-1">
                          ({property.totalRatings || 0} reviews)
                        </span>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {property.status === 'REJECTED' && property.rejectionReason && (
                      <div className="mb-3 p-2 bg-destructive/10 rounded-lg">
                        <p className="text-xs text-destructive">
                          <strong>Rejection Reason:</strong> {property.rejectionReason}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handlePropertyClick(property); }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); handleEditProperty(property); }}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleDeleteProperty(property.id); }}
                        className="text-destructive border-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </DialogTrigger>
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
                    {loadingMedia && (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-muted-foreground">Loading property media...</span>
                      </div>
                    )}
                    
                    {!loadingMedia && (
                      <>
                        {/* Property Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold">{selectedProperty.title}</h3>
                            <p className="text-muted-foreground flex items-center mt-2">
                              <MapPin className="w-4 h-4 mr-2" />
                              {selectedProperty.address}, {selectedProperty.city}, {selectedProperty.state} {selectedProperty.pincode}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(selectedProperty.status)}
                            <Button onClick={() => handleEditProperty(selectedProperty)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Property
                            </Button>
                          </div>
                        </div>

                    {/* Property Images */}
                    {propertyImages.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center">
                          <Home className="w-5 h-5 mr-2" />
                          Property Images ({propertyImages.length})
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {propertyImages.map((image, index) => (
                            <div key={image.id} className="relative group">
                              <img
                                src={image.imageUrl}
                                alt={`${selectedProperty.title} - Image ${index + 1}`}
                                className="w-full h-48 object-cover rounded-lg"
                              />
                              {image.isPrimary && (
                                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                  Primary
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Property Documents */}
                    {propertyDocuments.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3 flex items-center">
                          <Home className="w-5 h-5 mr-2" />
                          Property Documents ({propertyDocuments.length})
                        </h4>
                        <div className="space-y-3">
                          {propertyDocuments.map((doc, index) => (
                            <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                  <span className="text-xs font-medium text-blue-600">
                                    {doc.documentType?.charAt(0) || 'D'}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium">{doc.documentTypeDisplayName || doc.documentType}</p>
                                  <p className="text-sm text-muted-foreground">{doc.documentName}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDocument(doc)}
                                className="ml-4"
                              >
                                View Document
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Property Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basic Information */}
                      <div>
                        <h4 className="text-lg font-semibold mb-4">Basic Information</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Property Type:</span>
                            <span className="font-medium">{selectedProperty.propertyType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Status:</span>
                            <div>{getStatusBadge(selectedProperty.status)}</div>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Created:</span>
                            <span className="font-medium">{new Date(selectedProperty.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Deposit:</span>
                            <span className="font-medium">₹{selectedProperty.deposit?.toLocaleString() || '0'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Type-specific Details */}
                      <div>
                        <h4 className="text-lg font-semibold mb-4">
                          {selectedProperty.propertyType === 'FLAT' ? 'Flat Details' : 'PG Details'}
                        </h4>
                        <div className="space-y-3">
                          {selectedProperty.propertyType === 'FLAT' && selectedProperty.flatDetails ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">BHK Type:</span>
                                <span className="font-medium">{selectedProperty.flatDetails.bhkType}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Rent/Month:</span>
                                <span className="font-medium">₹{selectedProperty.flatDetails.rentPerMonth?.toLocaleString() || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Rooms:</span>
                                <span className="font-medium">{selectedProperty.flatDetails.totalRooms || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Bathrooms:</span>
                                <span className="font-medium">{selectedProperty.flatDetails.bathrooms || '0'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Furnishing Type:</span>
                                <span className="font-medium">{selectedProperty.flatDetails.furnishingType || 'N/A'}</span>
                              </div>
                            </>
                          ) : selectedProperty.pgDetails ? (
                            <>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Gender Allowed:</span>
                                <span className="font-medium">{selectedProperty.pgDetails.genderAllowed || 'N/A'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Food Included:</span>
                                <span className="font-medium">{selectedProperty.pgDetails.foodIncluded ? 'Yes' : 'No'}</span>
                              </div>
                              {selectedProperty.pgDetails.rooms && selectedProperty.pgDetails.rooms.length > 0 && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Total Rooms:</span>
                                    <span className="font-medium">{selectedProperty.pgDetails.rooms.length}</span>
                                  </div>
                                  {selectedProperty.pgDetails.rooms.map((room, index) => (
                                    <div key={room.id} className="border-t pt-3 mt-3">
                                      <div className="font-medium mb-2">Room {index + 1} Details:</div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Room Number:</span>
                                        <span className="font-medium">{room.roomNumber || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sharing Type:</span>
                                        <span className="font-medium">{room.sharingType || 'N/A'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Beds:</span>
                                        <span className="font-medium">{room.totalBeds || '0'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Available Beds:</span>
                                        <span className="font-medium">{room.availableBeds || '0'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Price/Bed:</span>
                                        <span className="font-medium">₹{room.pricePerBed?.toLocaleString() || '0'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Bathrooms:</span>
                                        <span className="font-medium">{room.bathrooms || '0'}</span>
                                      </div>
                                    </div>
                                  ))}
                                </>
                              )}
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h4 className="text-lg font-semibold mb-3">Description</h4>
                      <p className="text-muted-foreground leading-relaxed">{selectedProperty.description}</p>
                    </div>

                    {/* Amenities */}
                    {selectedProperty.amenities && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-lg font-semibold mb-3 text-gray-900">Amenities</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedProperty.amenities.split(',').map((amenity, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="px-3 py-1 text-sm bg-white border-gray-300 hover:bg-gray-100 transition-colors"
                            >
                              {amenity.trim()}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    {selectedProperty.status === 'APPROVED' && (
                      <div>
                        <h4 className="text-lg font-semibold mb-3">Rating & Reviews</h4>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-2" />
                            <span className="text-lg font-semibold">{selectedProperty.averageRating?.toFixed(1) || '0.0'}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {selectedProperty.totalRatings || 0} reviews
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {selectedProperty.status === 'REJECTED' && selectedProperty.rejectionReason && (
                      <div className="p-4 bg-destructive/10 rounded-lg">
                        <h4 className="text-lg font-semibold mb-2 text-destructive">Rejection Reason</h4>
                        <p className="text-destructive">{selectedProperty.rejectionReason}</p>
                      </div>
                    )}
                      </>
                    )}
                  </div>
                )}
              </DialogContent>
            </Dialog>
          ))}
        </div>
      )}

      {/* Document Viewer Dialog */}
      <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span className="flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {selectedDocument?.documentName || 'Document'}
              </span>
              <Button variant="outline" size="sm" onClick={() => setIsDocumentDialogOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedDocument && (
            <div className="space-y-4">
              {/* Document Info */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{selectedDocument.documentTypeDisplayName || selectedDocument.documentType}</p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded: {new Date(selectedDocument.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(selectedDocument.documentUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open in New Tab
                </Button>
              </div>
              
              {/* Document Viewer */}
              <div className="w-full h-[60vh] bg-white rounded-lg border overflow-hidden">
                <iframe
                  src={selectedDocument.documentUrl}
                  className="w-full h-full"
                  title={selectedDocument.documentName}
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

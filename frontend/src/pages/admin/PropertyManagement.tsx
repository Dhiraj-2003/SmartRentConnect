import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  Building,
  MapPin,
  IndianRupee,
  Star,
  X,
  Home,
  FileText,
  ExternalLink,
  CheckCircle,
  XCircle
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

export const PropertyManagement: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [propertyImages, setPropertyImages] = useState<any[]>([]);
  const [propertyDocuments, setPropertyDocuments] = useState<any[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [propertyToReject, setPropertyToReject] = useState<Property | null>(null);

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      console.log('=== LOADING ADMIN PROPERTIES ===');
      const response = await adminAPI.getAllProperties({
        page: 0,
        size: 100,
        sortBy: 'createdAt',
        sortDir: 'desc'
      });
      console.log('Admin properties response:', response);
      console.log('Response data:', response.data);
      console.log('Properties array:', response.data.content || response.data);
      
      const properties = response.data.content || response.data;
      setProperties(properties);
      console.log('Properties set:', properties);
    } catch (error: any) {
      console.error('Failed to load properties:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = async (property: Property) => {
    console.log('=== ADMIN PROPERTY CLICKED ===');
    console.log('Property object:', property);
    console.log('Property ID:', property.id);
    console.log('Property Title:', property.title);
    
    setSelectedProperty(property);
    setIsDialogOpen(true);
    setLoadingMedia(true);
    
    try {
      // Fetch images and documents for this property
      const propertyId = property.id.toString();
      console.log('Fetching media for property ID:', propertyId);
      
      const [imagesResponse, documentsResponse] = await Promise.all([
        adminAPI.getPropertyImages(propertyId),
        adminAPI.getPropertyDocuments(propertyId)
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

  const handleViewDocument = (document: any) => {
    setSelectedDocument(document);
    setIsDocumentDialogOpen(true);
  };

  const handleApproveProperty = async (propertyId: number) => {
    try {
      setActionLoading(propertyId);
      await adminAPI.approveProperty(propertyId.toString());
      toast.success('Property approved successfully');
      loadProperties();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error('Failed to approve property');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectProperty = async (property: Property) => {
    setPropertyToReject(property);
    setRejectionReason('');
    setIsRejectDialogOpen(true);
  };

  const confirmRejectProperty = async () => {
    if (!propertyToReject) return;
    
    try {
      setActionLoading(propertyToReject.id);
      console.log('=== ADMIN REJECTING PROPERTY ===');
      console.log('Property ID:', propertyToReject.id);
      console.log('Property Title:', propertyToReject.title);
      console.log('Rejection Reason:', rejectionReason);
      console.log('Rejection Reason Length:', rejectionReason.length);
      
      const response = await adminAPI.rejectProperty(propertyToReject.id.toString(), rejectionReason);
      console.log('Rejection response:', response);
      console.log('Response data:', response.data);
      console.log('Response status:', response.data?.status);
      console.log('Response rejection reason:', response.data?.rejectionReason);
      
      toast.success('Property rejected successfully');
      loadProperties();
      setIsRejectDialogOpen(false);
      setIsDialogOpen(false);
      setRejectionReason('');
      setPropertyToReject(null);
    } catch (error: any) {
      console.error('Failed to reject property:', error);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      toast.error('Failed to reject property');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        return <Badge className="bg-green-100 text-green-800 border-green-200">Approved</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRentDisplay = (property: Property) => {
    if (property.propertyType === 'FLAT' && property.flatDetails) {
      return property.flatDetails.rentPerMonth?.toLocaleString() || '0';
    } else if (property.propertyType === 'PG' && property.pgDetails && property.pgDetails.rooms && property.pgDetails.rooms.length > 0) {
      return property.pgDetails.rooms[0].pricePerBed?.toLocaleString() || '0';
    }
    return '0';
  };

  const getPropertyDetails = (property: Property) => {
    if (property.propertyType === 'FLAT' && property.flatDetails) {
      return `${property.flatDetails.bhkType || 'N/A'} • ${property.flatDetails.bathrooms || 0}BA`;
    } else if (property.propertyType === 'PG' && property.pgDetails && property.pgDetails.rooms && property.pgDetails.rooms.length > 0) {
      return `${property.pgDetails.rooms[0].sharingType || 'PG'} • ${property.pgDetails.rooms[0].bathrooms || 0}BA`;
    }
    return 'N/A';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Property Management
        </h1>
        <p className="text-muted-foreground">
          Manage and moderate property listings across the platform
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{properties.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {properties.filter(p => p.status === 'APPROVED').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <XCircle className="w-4 h-4 mr-2" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {properties.filter(p => p.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Avg Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {properties.length > 0 
                ? (properties.reduce((acc, p) => acc + (p.averageRating || 0), 0) / properties.length).toFixed(1)
                : '0.0'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <Card className="mb-6">
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
            <Button onClick={loadProperties} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Properties ({filteredProperties.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Property</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Rent</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading properties...
                    </TableCell>
                  </TableRow>
                ) : filteredProperties.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No properties found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProperties.map((property) => (
                    <TableRow key={property.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{property.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {property.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{property.ownerName}</div>
                          <div className="text-muted-foreground">ID: {property.ownerId}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <MapPin className="w-3 h-3 mr-1" />
                          {property.address}, {property.city}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm font-medium">
                          <IndianRupee className="w-3 h-3 mr-1" />
                          {getRentDisplay(property)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{property.propertyType}</div>
                          <div className="text-muted-foreground">{getPropertyDetails(property)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(property.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Star className="w-3 h-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {property.averageRating?.toFixed(1) || '0.0'} ({property.totalRatings || 0})
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePropertyClick(property)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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

                  {/* Admin Actions */}
                  <div className="border-t pt-6">
                    <h4 className="text-lg font-semibold mb-4">Admin Actions</h4>
                    <div className="flex items-center space-x-4">
                      {selectedProperty.status === 'PENDING' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApproveProperty(selectedProperty.id)}
                            disabled={actionLoading === selectedProperty.id}
                            className="text-green-600 border-green-600 hover:bg-green-600/10"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Property
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRejectProperty(selectedProperty)}
                            disabled={actionLoading === selectedProperty.id}
                            className="text-red-600 border-red-600 hover:bg-red-600/10"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject Property
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                    </>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>

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

          {/* Rejection Reason Dialog */}
          <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Property</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for rejecting "{propertyToReject?.title}". This reason will be visible to the property owner.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-4">
                <Label htmlFor="rejectionReason" className="text-sm font-medium">
                  Rejection Reason *
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please specify the reason for rejection..."
                  className="mt-2 min-h-[100px]"
                  required
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() => {
                    setIsRejectDialogOpen(false);
                    setRejectionReason('');
                    setPropertyToReject(null);
                  }}
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmRejectProperty}
                  disabled={!rejectionReason.trim() || actionLoading === propertyToReject?.id}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {actionLoading === propertyToReject?.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Rejecting...
                    </>
                  ) : (
                    'Reject Property'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
    </div>
  );
};

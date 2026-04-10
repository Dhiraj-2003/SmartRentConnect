import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { enhancedAdminAPI } from '@/lib/api';
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  Home, 
  MapPin, 
  IndianRupee,
  Users,
  Bed,
  Bath,
  Wifi,
  Car,
  Utensils,
  Shield
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
  ownerName: string;
  createdAt: string;
  
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

export const PropertyVerification: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

  useEffect(() => {
    fetchPendingProperties();
  }, []);

  const fetchPendingProperties = async () => {
    try {
      setLoading(true);
      const response = await enhancedAdminAPI.getPendingProperties();
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching pending properties:', error);
      toast.error('Failed to fetch pending properties');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (propertyId: number) => {
    try {
      await enhancedAdminAPI.approveProperty(propertyId.toString());
      toast.success('Property approved successfully');
      fetchPendingProperties();
      setSelectedProperty(null);
    } catch (error) {
      console.error('Error approving property:', error);
      toast.error('Failed to approve property');
    }
  };

  const handleReject = async (propertyId: number) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await enhancedAdminAPI.rejectProperty(propertyId.toString(), rejectionReason);
      toast.success('Property rejected successfully');
      fetchPendingProperties();
      setSelectedProperty(null);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting property:', error);
      toast.error('Failed to reject property');
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading pending properties...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Property Verification</h1>
        <p className="text-gray-600 mt-2">
          Review and verify properties submitted by owners
        </p>
      </div>

      {properties.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Properties</h3>
            <p className="text-gray-600">All properties have been reviewed.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Properties List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Pending Properties ({properties.length})</h2>
            {properties.map((property) => (
              <Card key={property.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getPropertyTypeIcon(property.propertyType)}
                        <h3 className="font-semibold text-lg">{property.title}</h3>
                        <Badge variant="secondary">{property.propertyType}</Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{property.address}, {property.city}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-4 h-4" />
                          <span>Deposit: ₹{property.deposit.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>Owner: {property.ownerName}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedProperty(property)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Property Details */}
          <div className="lg:sticky lg:top-8">
            {selectedProperty ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getPropertyTypeIcon(selectedProperty.propertyType)}
                    {selectedProperty.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="font-semibold mb-3">Basic Information</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Type:</strong> {selectedProperty.propertyType}</div>
                      <div><strong>Address:</strong> {selectedProperty.address}</div>
                      <div><strong>City:</strong> {selectedProperty.city}, {selectedProperty.state}</div>
                      <div><strong>Pincode:</strong> {selectedProperty.pincode}</div>
                      <div><strong>Deposit:</strong> ₹{selectedProperty.deposit.toLocaleString()}</div>
                      <div><strong>Owner:</strong> {selectedProperty.ownerName}</div>
                    </div>
                  </div>

                  {/* Description */}
                  {selectedProperty.description && (
                    <div>
                      <h4 className="font-semibold mb-3">Description</h4>
                      <p className="text-sm text-gray-600">{selectedProperty.description}</p>
                    </div>
                  )}

                  {/* Property Type Specific Details */}
                  {selectedProperty.propertyType === 'FLAT' && selectedProperty.flatDetails ? (
                    <div>
                      <h4 className="font-semibold mb-3">Flat Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><strong>BHK Type:</strong> {selectedProperty.flatDetails.bhkType}</div>
                        <div><strong>Rent/Month:</strong> ₹{selectedProperty.flatDetails.rentPerMonth.toLocaleString()}</div>
                        <div><strong>Total Rooms:</strong> {selectedProperty.flatDetails.totalRooms}</div>
                        <div><strong>Bathrooms:</strong> {selectedProperty.flatDetails.bathrooms}</div>
                        <div><strong>Furnishing:</strong> {selectedProperty.flatDetails.furnishingType}</div>
                        <div><strong>Flat Number:</strong> {selectedProperty.flatDetails.flatNumber}</div>
                      </div>
                    </div>
                  ) : selectedProperty.propertyType === 'PG' && selectedProperty.pgDetails ? (
                    <div>
                      <h4 className="font-semibold mb-3">PG Details</h4>
                      <div className="space-y-3 text-sm">
                        <div><strong>Gender Allowed:</strong> {selectedProperty.pgDetails.genderAllowed}</div>
                        <div><strong>Food Included:</strong> {selectedProperty.pgDetails.foodIncluded ? 'Yes' : 'No'}</div>
                        
                        {selectedProperty.pgDetails.rooms.length > 0 && (
                          <div>
                            <strong>Rooms:</strong>
                            <div className="mt-2 space-y-2">
                              {selectedProperty.pgDetails.rooms.map((room, index) => (
                                <div key={index} className="bg-gray-50 p-3 rounded">
                                  <div className="grid grid-cols-2 gap-2">
                                    <div><strong>Room:</strong> {room.roomNumber}</div>
                                    <div><strong>Sharing:</strong> {room.sharingType}</div>
                                    <div><strong>Price/Bed:</strong> ₹{room.pricePerBed.toLocaleString()}</div>
                                    <div><strong>Available:</strong> {room.availableBeds}/{room.totalBeds}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {/* Amenities */}
                  {selectedProperty.amenities && (
                    <div>
                      <h4 className="font-semibold mb-3">Amenities</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedProperty.amenities.split(',').map((amenity, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            {getAmenityIcon(amenity.trim())}
                            {amenity.trim()}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleApprove(selectedProperty.id)}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    
                    <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="flex-1">
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Property</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium">Rejection Reason *</label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please provide a reason for rejection..."
                              className="mt-2"
                              rows={4}
                            />
                          </div>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setIsRejectDialogOpen(false);
                                setRejectionReason('');
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(selectedProperty.id)}
                            >
                              Reject Property
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Property</h3>
                  <p className="text-gray-600">Click on a property to view its details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

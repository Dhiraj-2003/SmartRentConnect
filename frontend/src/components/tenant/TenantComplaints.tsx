import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Upload, X, FileImage, AlertCircle, CheckCircle, Clock, Filter, Home, Plus, Image as ImageIcon, XCircle, MessageSquare, Calendar } from 'lucide-react';
import { tenantAPI } from '@/lib/api';

// Enums matching backend
const COMPLAINT_CATEGORIES = {
  PLUMBING: 'Plumbing',
  ELECTRICAL: 'Electrical',
  WATER_SUPPLY: 'Water Supply',
  CLEANING: 'Cleaning',
  FURNITURE: 'Furniture',
  INTERNET: 'Internet',
  SECURITY: 'Security',
  APPLIANCE: 'Appliance',
  STRUCTURAL: 'Structural',
  OTHER: 'Other'
};

const COMPLAINT_PRIORITIES = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent'
};

const COMPLAINT_STATUSES = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  REJECTED: 'Rejected',
  CLOSED: 'Closed'
};

// Types
interface TenantProperty {
  historyId: number;
  propertyId: number;
  propertyName: string;
  propertyType: 'FLAT' | 'PG';
  flatNumber?: string;
  bedNumber?: string;
  roomNumber?: string;
  address: string;
  city: string;
  state: string;
  monthlyRent: number;
  depositAmount: number;
  occupancyStartDate: string;
  status: string;
  propertyImage?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  flatDetailsId?: number;  // ✅ Added for flat details ID
  pgBedId?: number;         // ✅ Added for PG bed ID
}

interface Complaint {
  id: number;
  title: string;
  description: string;
  category: keyof typeof COMPLAINT_CATEGORIES;
  priority: keyof typeof COMPLAINT_PRIORITIES;
  status: keyof typeof COMPLAINT_STATUSES;
  reportedDate: string;
  resolvedDate?: string;
  responseMessage?: string;
  assignedTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  tenant: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone: string;
  };
  owner: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone: string;
  };
  property: {
    id: number;
    propertyName: string;
    propertyType: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
  };
  flatDetails?: {
    id: number;
    flatNumber: string;
    floorNumber: number;
    totalArea: number;
    bedrooms: number;
    bathrooms: number;
  };
  pgBed?: {
    id: number;
    bedNumber: string;
    roomNumber: string;
    monthlyRent: number;
    available: boolean;
  };
  complaintImages: Array<{
    id: number;
    imageUrl: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    displayOrder: number;
    createdAt: string;
  }>;
}

interface FormData {
  title: string;
  description: string;
  category: string;
  priority: string;
  selectedPropertyId: number;
  images: File[];
}

export const TenantComplaints: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [currentProperties, setCurrentProperties] = useState<TenantProperty[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    category: '',
    priority: '',
    selectedPropertyId: 0,
    images: []
  });

  // Create API instance with access to currentProperties
  // const tenantAPI = createTenantAPI(currentProperties); // ✅ Removed - creating fresh instances now

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Use centralized API
      const [propertiesResponse, complaintsResponse] = await Promise.all([
        tenantAPI.getCurrentProperties(),
        tenantAPI.getComplaints()
      ]);
      
      setCurrentProperties(propertiesResponse.data);
      setComplaints(complaintsResponse.data);
      
      // Set default property if available and not already set
      if (propertiesResponse.data.length > 0 && formData.selectedPropertyId === 0) {
        setFormData(prev => ({ ...prev, selectedPropertyId: propertiesResponse.data[0].propertyId }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [formData.selectedPropertyId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.description || !formData.category || !formData.priority || !formData.selectedPropertyId) {
      toast.error('Please fill all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Use centralized API with currentProperties
      const response = await tenantAPI.createComplaint({
        ...formData,
        currentProperties: currentProperties
      });
      
      console.log('Complaint created successfully:', response); // ✅ Debug log
      
      // Show success toast and redirect immediately
      toast.success('Complaint raised successfully!');
      
      // Redirect to dashboard immediately
      navigate('/tenant/dashboard');
      
    } catch (error) {
      console.error('Error creating complaint:', error); // ✅ Debug log
      
      // Show error toast but stay on the page so user can try again
      toast.error('Failed to raise complaint. Please try again.');
      
      // Keep user on the complaints page to retry
      // No redirect - user stays on current page
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    switch (activeTab) {
      case 'open':
        return complaint.status === 'OPEN';
      case 'inProgress':
        return complaint.status === 'IN_PROGRESS';
      case 'resolved':
        return complaint.status === 'RESOLVED';
      default:
        return true;
    }
  });

  const getStatusColor = (status: keyof typeof COMPLAINT_STATUSES) => {
    switch (status) {
      case 'OPEN': return 'bg-orange-100 text-orange-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: keyof typeof COMPLAINT_PRIORITIES) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const selectedProperty = currentProperties.find(p => p.propertyId === formData.selectedPropertyId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complaints & Issues</h1>
            <p className="text-gray-600">Report and track issues with your accommodation</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Raise New Complaint
          </Button>
        </div>

        {/* Complaint Form */}
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Raise a Complaint
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Property Selection */}
                <div>
                  <Label htmlFor="property">Select Property *</Label>
                  <Select value={formData.selectedPropertyId.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, selectedPropertyId: parseInt(value) }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      {currentProperties.map((property) => (
                        <SelectItem key={property.propertyId} value={property.propertyId.toString()}>
                          <div className="flex flex-col">
                            <span className="font-medium">{property.propertyName}</span>
                            <span className="text-sm text-gray-500">
                              {property.propertyType === 'FLAT' 
                                ? `Flat ${property.flatNumber}`
                                : `Room ${property.roomNumber}, Bed ${property.bedNumber}`
                              }
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Selected Property Info */}
                {selectedProperty && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Home className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="font-medium">Selected Property</span>
                    </div>
                    <p className="text-sm text-gray-600">{selectedProperty.propertyName}</p>
                    <p className="text-sm text-gray-600">{selectedProperty.address}, {selectedProperty.city}</p>
                    <p className="text-sm text-gray-600">
                      {selectedProperty.propertyType === 'FLAT' 
                        ? `Flat ${selectedProperty.flatNumber}`
                        : `Room ${selectedProperty.roomNumber}, Bed ${selectedProperty.bedNumber}`
                      }
                    </p>
                    <p className="text-sm text-gray-600">Owner: {selectedProperty.ownerName}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Brief description of the issue"
                      className="mt-1"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(COMPLAINT_CATEGORIES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>{value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Provide detailed information about the issue"
                    rows={4}
                    className="mt-1"
                  />
                </div>

                {/* Priority */}
                <div>
                  <Label htmlFor="priority">Priority *</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(COMPLAINT_PRIORITIES).map(([key, value]) => (
                        <SelectItem key={key} value={key}>{value}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image Upload */}
                <div>
                  <Label>Issue Images (Optional)</Label>
                  <div className="mt-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm text-gray-600">Click to upload images</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB each</p>
                      </label>
                    </div>

                    {/* Image Previews */}
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Status Filter Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${
              activeTab === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setActiveTab('all')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {complaints.length}
              </div>
              <div className="text-sm text-gray-600">All Complaints</div>
              <div className="mt-2">
                <AlertCircle className="w-5 h-5 mx-auto text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${
              activeTab === 'open' ? 'ring-2 ring-orange-500 bg-orange-50' : ''
            }`}
            onClick={() => setActiveTab('open')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {complaints.filter(c => c.status === 'OPEN').length}
              </div>
              <div className="text-sm text-gray-600">Open</div>
              <div className="mt-2">
                <Clock className="w-5 h-5 mx-auto text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${
              activeTab === 'inProgress' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => setActiveTab('inProgress')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {complaints.filter(c => c.status === 'IN_PROGRESS').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
              <div className="mt-2">
                <Clock className="w-5 h-5 mx-auto text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 ${
              activeTab === 'resolved' ? 'ring-2 ring-green-500 bg-green-50' : ''
            }`}
            onClick={() => setActiveTab('resolved')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {complaints.filter(c => c.status === 'RESOLVED').length}
              </div>
              <div className="text-sm text-gray-600">Resolved</div>
              <div className="mt-2">
                <CheckCircle className="w-5 h-5 mx-auto text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Complaints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              My Complaints
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Current Filter Label */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {activeTab === 'all' && 'All Complaints'}
                  {activeTab === 'open' && 'Open Complaints'}
                  {activeTab === 'inProgress' && 'In Progress Complaints'}
                  {activeTab === 'resolved' && 'Resolved Complaints'}
                </span>
                <span className="text-sm text-gray-500">({filteredComplaints.length})</span>
              </div>
            </div>

            {/* Complaints List */}
            {filteredComplaints.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No complaints found</h3>
                <p className="text-gray-600">
                  {activeTab === 'all' 
                    ? "You haven't raised any complaints yet."
                    : `No ${activeTab.replace('_', ' ')} complaints found.`
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredComplaints.map((complaint) => (
                  <Card key={complaint.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                        {/* Left side - Main content */}
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-3">
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                                {complaint.title}
                              </h3>
                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {complaint.description}
                              </p>
                              
                              {/* Badges */}
                              <div className="flex flex-wrap gap-2 mb-3">
                                <Badge className={getStatusColor(complaint.status)}>
                                  {COMPLAINT_STATUSES[complaint.status]}
                                </Badge>
                                <Badge className={getPriorityColor(complaint.priority)}>
                                  {COMPLAINT_PRIORITIES[complaint.priority]}
                                </Badge>
                                <Badge variant="outline">
                                  {COMPLAINT_CATEGORIES[complaint.category]}
                                </Badge>
                              </div>

                              {/* Property info */}
                              <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <Home className="w-4 h-4" />
                                  <span>{complaint.property.propertyName}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>{complaint.reportedDate}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Response message */}
                          {complaint.responseMessage && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
                                <div>
                                  <p className="text-sm font-medium text-blue-900">Response</p>
                                  <p className="text-sm text-blue-800">{complaint.responseMessage}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right side - Images */}
                        {complaint.complaintImages.length > 0 && (
                          <div className="md:w-32">
                            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                              {complaint.complaintImages.slice(0, 2).map((image, index) => (
                                <div key={image.id} className="relative group cursor-pointer">
                                  <img
                                    src={image.imageUrl}
                                    alt={`Issue image ${index + 1}`}
                                    className="w-full h-20 object-cover rounded-lg"
                                  />
                                  {complaint.complaintImages.length > 2 && index === 1 && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                      <span className="text-white text-sm font-medium">
                                        +{complaint.complaintImages.length - 2}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

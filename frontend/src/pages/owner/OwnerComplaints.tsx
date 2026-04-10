import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ownerComplaintAPI } from '@/lib/api';
import { toast } from 'sonner';
import {
  Wrench,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  MapPin,
  Calendar,
  RefreshCw,
  Filter,
  Eye,
  Phone,
  Mail,
  Home,
  Star
} from 'lucide-react';

// Types matching backend DTO
interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
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

type FilterType = 'all' | 'open' | 'in_progress' | 'resolved';

const STATUS_COLORS = {
  OPEN: 'bg-red-100 text-red-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800'
};

const PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-orange-100 text-orange-800',
  HIGH: 'bg-red-100 text-red-800',
  URGENT: 'bg-purple-100 text-purple-800'
};

export const OwnerComplaints: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');

  const loadComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ownerComplaintAPI.getComplaints();
      setComplaints(response.data);
    } catch (error) {
      console.error('Error loading complaints:', error);
      toast.error('Failed to load complaints');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadComplaints();
  }, [filter, loadComplaints]);

  const filteredComplaints = complaints.filter(complaint => {
    switch (filter) {
      case 'open':
        return complaint.status === 'OPEN';
      case 'in_progress':
        return complaint.status === 'IN_PROGRESS';
      case 'resolved':
        return complaint.status === 'RESOLVED';
      default:
        return true;
    }
  });

  const handleStatusUpdate = async (complaintId: number, newStatus: string) => {
    try {
      await ownerComplaintAPI.updateStatus(complaintId.toString(), newStatus);
      toast.success('Complaint status updated successfully');
      loadComplaints();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error updating complaint status:', error);
      toast.error('Failed to update complaint status');
    }
  };

  const handleResponse = async () => {
    if (!selectedComplaint || !responseMessage.trim()) {
      toast.error('Please provide a response message');
      return;
    }

    try {
      await ownerComplaintAPI.respondToComplaint(
        selectedComplaint.id.toString(),
        responseMessage
      );
      toast.success('Response sent successfully');
      setResponseMessage('');
      setShowResponseModal(false);
      setShowDetailModal(false);
      loadComplaints();
    } catch (error) {
      console.error('Error sending response:', error);
      toast.error('Failed to send response');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'LOW':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'HIGH':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'URGENT':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Urgent</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return <Badge variant="destructive" className="bg-red-50 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Open</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'RESOLVED':
        return <Badge variant="default" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const complaintStats = [
    {
      title: 'Open Complaints',
      value: complaints.filter(c => c.status === 'OPEN').length.toString(),
      description: 'Needs attention',
      icon: AlertTriangle,
      color: 'text-red-600',
      filter: 'open' as FilterType
    },
    {
      title: 'In Progress',
      value: complaints.filter(c => c.status === 'IN_PROGRESS').length.toString(),
      description: 'Being worked on',
      icon: Clock,
      color: 'text-blue-600',
      filter: 'in_progress' as FilterType
    },
    {
      title: 'Resolved',
      value: complaints.filter(c => c.status === 'RESOLVED').length.toString(),
      description: 'This month',
      icon: CheckCircle,
      color: 'text-green-600',
      filter: 'resolved' as FilterType
    },
    {
      title: 'Total Complaints',
      value: complaints.length.toString(),
      description: 'All time',
      icon: MessageSquare,
      color: 'text-purple-600',
      filter: 'all' as FilterType
    }
  ];

  const getComplaintTypeIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'plumbing':
        return Wrench;
      case 'electrical':
        return Wrench;
      case 'hvac':
        return Wrench;
      default:
        return MessageSquare;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Complaint Management</h1>
              <p className="mt-2 text-gray-600">
                Manage and respond to tenant complaints and property issues
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={loadComplaints} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {complaintStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={index} 
                  className={`bg-white border border-gray-200 hover:shadow-md transition-all cursor-pointer ${
                    filter === stat.filter 
                      ? 'border-blue-500 ring-2 ring-blue-200 shadow-md' 
                      : 'hover:border-blue-300'
                  }`}
                  onClick={() => {
                    setFilter(stat.filter);
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${
                        stat.color.includes('red') ? 'bg-red-100' : 
                        stat.color.includes('blue') ? 'bg-blue-100' : 
                        stat.color.includes('green') ? 'bg-green-100' : 
                        'bg-purple-100'
                      }`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
                    {filter === stat.filter && (
                      <p className="mt-1 text-xs text-blue-600 font-medium">Active Filter</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Complaints Section */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Complaints & Issues</CardTitle>
                  <p className="text-sm text-gray-600">Manage tenant complaints and track resolution progress</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={filter === 'open' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('open')}
                >
                  Open
                </Button>
                <Button
                  variant={filter === 'in_progress' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('in_progress')}
                >
                  In Progress
                </Button>
                <Button
                  variant={filter === 'resolved' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('resolved')}
                >
                  Resolved
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-[470px] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredComplaints.map((complaint) => {
                  const TypeIcon = getComplaintTypeIcon(complaint.category);
                  const firstImage = complaint.complaintImages?.[0]?.imageUrl;
                  
                  return (
                    <div 
                      key={complaint.id} 
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer" 
                      onClick={() => {
                        setSelectedComplaint(complaint);
                        setShowDetailModal(true);
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        {/* Property/Complaint Image */}
                        <div className="relative flex-shrink-0">
                          {firstImage ? (
                            <img 
                              src={firstImage} 
                              alt={complaint.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="absolute -top-1 -right-1">
                            <TypeIcon className="w-4 h-4 text-white bg-blue-500 rounded-full p-0.5" />
                          </div>
                        </div>
                        
                        {/* Complaint Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-medium text-gray-900 truncate">{complaint.title}</h3>
                            <div className="flex items-center space-x-1 ml-2">
                              {getPriorityBadge(complaint.priority)}
                              {getStatusBadge(complaint.status)}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                            {complaint.description}
                          </p>
                          
                          {/* Property & Tenant Info */}
                          <div className="space-y-1 mb-3">
                            <div className="flex items-center text-xs text-gray-500">
                              <Home className="w-3 h-3 mr-1" />
                              <span className="truncate">{complaint.property.propertyName}</span>
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                              <User className="w-3 h-3 mr-1" />
                              <span>{complaint.tenant.fullName}</span>
                              {complaint.flatDetails && (
                                <span className="ml-1">- Flat {complaint.flatDetails.flatNumber}</span>
                              )}
                              {complaint.pgBed && (
                                <span className="ml-1">- Bed {complaint.pgBed.bedNumber}</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <div className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                <span>{formatDate(complaint.reportedDate)}</span>
                              </div>
                              {complaint.assignedTo && (
                                <span className="font-medium text-blue-600">
                                  Assigned: {complaint.assignedTo}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaint(complaint);
                                setShowDetailModal(true);
                              }}
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View Details
                            </Button>
                            
                            {complaint.status === 'OPEN' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedComplaint(complaint);
                                  setShowResponseModal(true);
                                }}
                              >
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Respond
                              </Button>
                            )}
                            
                            {complaint.status === 'IN_PROGRESS' && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-xs text-green-600 border-green-300 hover:bg-green-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(complaint.id, 'RESOLVED');
                                }}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Mark Resolved
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaint Detail Modal */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  {selectedComplaint?.title}
                </div>
                {selectedComplaint && (
                  <div className="flex items-center space-x-2">
                    {getPriorityBadge(selectedComplaint.priority)}
                    {getStatusBadge(selectedComplaint.status)}
                  </div>
                )}
              </DialogTitle>
            </DialogHeader>
            
            {selectedComplaint && (
              <div className="space-y-6">
                {/* Property & Tenant Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Property Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold">{selectedComplaint.property.propertyName}</p>
                        <p className="text-sm text-muted-foreground flex items-center mt-1">
                          <MapPin className="w-4 h-4 mr-1" />
                          {selectedComplaint.property.address}, {selectedComplaint.property.city}
                        </p>
                      </div>
                      <div className="text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <p className="font-medium">{selectedComplaint.property.propertyType}</p>
                      </div>
                      {selectedComplaint.flatDetails && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Flat Number:</span>
                          <p className="font-medium">{selectedComplaint.flatDetails.flatNumber}</p>
                        </div>
                      )}
                      {selectedComplaint.pgBed && (
                        <div className="text-sm">
                          <span className="text-muted-foreground">Bed/Room:</span>
                          <p className="font-medium">Bed {selectedComplaint.pgBed.bedNumber}, Room {selectedComplaint.pgBed.roomNumber}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Tenant Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="font-semibold">{selectedComplaint.tenant.fullName}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center text-sm">
                          <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{selectedComplaint.tenant.phone}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          <span>{selectedComplaint.tenant.email}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Complaint Description */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Complaint Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">{selectedComplaint.description}</p>
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <p className="font-medium capitalize">{selectedComplaint.category?.toLowerCase() || 'General'}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reported:</span>
                        <p className="font-medium">{formatDate(selectedComplaint.reportedDate)}</p>
                      </div>
                      {selectedComplaint.resolvedDate && (
                        <div>
                          <span className="text-muted-foreground">Resolved:</span>
                          <p className="font-medium">{formatDate(selectedComplaint.resolvedDate)}</p>
                        </div>
                      )}
                      {selectedComplaint.assignedTo && (
                        <div>
                          <span className="text-muted-foreground">Assigned to:</span>
                          <p className="font-medium">{selectedComplaint.assignedTo}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Complaint Images */}
                {selectedComplaint.complaintImages && selectedComplaint.complaintImages.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Complaint Images</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedComplaint.complaintImages.map((image) => (
                          <img 
                            key={image.id}
                            src={image.imageUrl} 
                            alt={`Complaint ${image.displayOrder}`}
                            className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => window.open(image.imageUrl, '_blank')}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Response Message */}
                {selectedComplaint.responseMessage && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-green-800 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Your Response
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-green-700">{selectedComplaint.responseMessage}</p>
                    </CardContent>
                  </Card>
                )}
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                  {selectedComplaint.status === 'OPEN' && (
                    <>
                      <Button 
                        onClick={() => {
                          setShowResponseModal(true);
                          setShowDetailModal(false);
                        }}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Send Response
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => handleStatusUpdate(selectedComplaint.id, 'IN_PROGRESS')}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        Mark In Progress
                      </Button>
                    </>
                  )}
                  
                  {selectedComplaint.status === 'IN_PROGRESS' && (
                    <Button 
                      onClick={() => handleStatusUpdate(selectedComplaint.id, 'RESOLVED')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Resolved
                    </Button>
                  )}
                  
                  <Button variant="outline" onClick={() => setShowDetailModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Response Modal */}
        <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Respond to Complaint</DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2">Complaint Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Title:</span>
                      <span className="text-sm">{selectedComplaint.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Tenant:</span>
                      <span className="text-sm">{selectedComplaint.tenant.fullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Property:</span>
                      <span className="text-sm">{selectedComplaint.property.propertyName}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Response
                  </label>
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    rows={5}
                    placeholder="Type your response here..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={() => setShowResponseModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleResponse}>
                    Send Response
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
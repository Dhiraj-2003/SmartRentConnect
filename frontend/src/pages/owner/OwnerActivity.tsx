import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ownerAPI } from '@/lib/api';
import { toast } from 'sonner';
import property1Image from '@/assets/property-1.jpg';
import property2Image from '@/assets/property-2.jpg';
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
  Home
} from 'lucide-react';

interface MaintenanceIssue {
  id: number;
  type: 'maintenance' | 'complaint' | 'query';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  title: string;
  description: string;
  category: 'plumbing' | 'electrical' | 'hvac' | 'appliance' | 'structural' | 'other';
  reportedDate: string;
  resolvedDate?: string;
  tenant: {
    id: number;
    name: string;
    email: string;
    phone: string;
    unitNumber: string;
  };
  property: {
    id: number;
    title: string;
    address: string;
    image: string;
  };
  images?: string[];
  estimatedCost?: number;
  assignedTo?: string;
}

export const OwnerActivity: React.FC = () => {
  const [issues, setIssues] = useState<MaintenanceIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedIssue, setSelectedIssue] = useState<MaintenanceIssue | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadIssues();
  }, [filter]);

  const loadIssues = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would come from API
      const mockIssues: MaintenanceIssue[] = [
        {
          id: 1,
          type: 'maintenance',
          priority: 'urgent',
          status: 'open',
          title: 'Water Leakage in Bathroom',
          description: 'Water is leaking from the ceiling in the main bathroom. The leak started yesterday and is getting worse. Water is dripping into the bathtub area.',
          category: 'plumbing',
          reportedDate: '2024-01-15T10:30:00Z',
          tenant: {
            id: 1,
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '+91 9876543210',
            unitNumber: 'A-101'
          },
          property: {
            id: 1,
            title: 'Luxury Villa Complex',
            address: '123 Main Street, Downtown',
            image: property1Image
          },
          images: [property1Image, property2Image],
          estimatedCost: 15000,
          assignedTo: 'Ravi Plumber Services'
        },
        {
          id: 2,
          type: 'complaint',
          priority: 'high',
          status: 'in_progress',
          title: 'Noisy Neighbors Complaint',
          description: 'The tenant in the unit above is making excessive noise during night hours. This has been ongoing for the past week and affecting sleep.',
          category: 'other',
          reportedDate: '2024-01-14T18:45:00Z',
          tenant: {
            id: 2,
            name: 'Sarah Johnson',
            email: 'sarah.johnson@email.com',
            phone: '+91 9876543211',
            unitNumber: 'B-201'
          },
          property: {
            id: 2,
            title: 'Modern Apartment Building',
            address: '456 Oak Avenue, Midtown',
            image: property2Image
          },
          assignedTo: 'Property Manager'
        },
        {
          id: 3,
          type: 'maintenance',
          priority: 'medium',
          status: 'open',
          title: 'Air Conditioner Not Cooling',
          description: 'The AC unit in the living room is running but not cooling properly. It might need gas refilling or servicing.',
          category: 'hvac',
          reportedDate: '2024-01-13T14:20:00Z',
          tenant: {
            id: 3,
            name: 'Mike Wilson',
            email: 'mike.wilson@email.com',
            phone: '+91 9876543212',
            unitNumber: 'C-301'
          },
          property: {
            id: 1,
            title: 'Luxury Villa Complex',
            address: '123 Main Street, Downtown',
            image: property1Image
          },
          estimatedCost: 8000
        },
        {
          id: 4,
          type: 'query',
          priority: 'low',
          status: 'resolved',
          title: 'Parking Space Assignment',
          description: 'Tenant requesting information about assigned parking space number and access card details.',
          category: 'other',
          reportedDate: '2024-01-12T09:15:00Z',
          resolvedDate: '2024-01-12T16:30:00Z',
          tenant: {
            id: 4,
            name: 'Emily Davis',
            email: 'emily.davis@email.com',
            phone: '+91 9876543213',
            unitNumber: 'A-102'
          },
          property: {
            id: 2,
            title: 'Modern Apartment Building',
            address: '456 Oak Avenue, Midtown',
            image: property2Image
          }
        },
        {
          id: 5,
          type: 'maintenance',
          priority: 'high',
          status: 'open',
          title: 'Kitchen Sink Blockage',
          description: 'Kitchen sink is completely blocked and water is not draining. Food particles seem to be stuck in the drain.',
          category: 'plumbing',
          reportedDate: '2024-01-11T20:00:00Z',
          tenant: {
            id: 5,
            name: 'David Brown',
            email: 'david.brown@email.com',
            phone: '+91 9876543214',
            unitNumber: 'B-202'
          },
          property: {
            id: 1,
            title: 'Luxury Villa Complex',
            address: '123 Main Street, Downtown',
            image: property1Image
          },
          images: [property2Image],
          estimatedCost: 5000
        }
      ];

      const filteredIssues = filter === 'all' 
        ? mockIssues 
        : mockIssues.filter(issue => issue.type === filter || issue.status === filter);

      setIssues(filteredIssues);
    } catch (error: any) {
      console.error('Failed to load issues:', error);
      toast.error('Failed to load maintenance issues');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return Wrench;
      case 'complaint':
        return MessageSquare;
      case 'query':
        return User;
      default:
        return AlertTriangle;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Urgent</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="destructive" className="bg-red-50 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Open</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'resolved':
        return <Badge variant="default" className="bg-green-50 text-green-700"><CheckCircle className="w-3 h-3 mr-1" />Resolved</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700">Closed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleViewDetails = (issue: MaintenanceIssue) => {
    setSelectedIssue(issue);
    setShowDetailModal(true);
  };

  const handleStatusUpdate = (issueId: number, newStatus: string) => {
    setIssues(prev => prev.map(issue => 
      issue.id === issueId ? { ...issue, status: newStatus as any } : issue
    ));
    toast.success(`Issue status updated to ${newStatus}`);
  };

  const maintenanceStats = [
    {
      title: 'Open Issues',
      value: issues.filter(i => i.status === 'open').length.toString(),
      description: 'Needs attention',
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'In Progress',
      value: issues.filter(i => i.status === 'in_progress').length.toString(),
      description: 'Being worked on',
      icon: Clock,
      color: 'text-blue-600'
    },
    {
      title: 'Resolved',
      value: issues.filter(i => i.status === 'resolved').length.toString(),
      description: 'This month',
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Total Issues',
      value: issues.length.toString(),
      description: 'All time',
      icon: Wrench,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Maintenance & Issues</h1>
              <p className="mt-2 text-gray-600">
                Track maintenance requests, tenant complaints, and property issues
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={loadIssues} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {maintenanceStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg ${stat.color.includes('red') ? 'bg-red-100' : stat.color.includes('blue') ? 'bg-blue-100' : stat.color.includes('green') ? 'bg-green-100' : 'bg-purple-100'}`}>
                        <Icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{stat.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Issues Section */}
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wrench className="w-5 h-5 mr-3 text-blue-600" />
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-900">Issues & Requests</CardTitle>
                  <p className="text-sm text-gray-600">Manage maintenance and tenant requests</p>
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
                  variant={filter === 'maintenance' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('maintenance')}
                >
                  Maintenance
                </Button>
                <Button
                  variant={filter === 'complaint' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('complaint')}
                >
                  Complaints
                </Button>
                <Button
                  variant={filter === 'query' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('query')}
                >
                  Queries
                </Button>
                <Button
                  variant={filter === 'open' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('open')}
                >
                  Open
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="max-h-[470px] overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {loading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
                        <div className="flex-1 space-y-2">
                          <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
                          <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
                          <div className="w-full h-3 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  issues.map((issue) => {
                    const TypeIcon = getTypeIcon(issue.type);
                    
                    return (
                      <div key={issue.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all cursor-pointer" onClick={() => handleViewDetails(issue)}>
                        <div className="flex items-start space-x-3">
                          {/* Property Image */}
                          <div className="relative flex-shrink-0">
                            <img 
                              src={issue.property.image} 
                              alt={issue.property.title}
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div className="absolute -top-1 -right-1">
                              <TypeIcon className="w-4 h-4 text-white bg-blue-500 rounded-full p-0.5" />
                            </div>
                          </div>
                          
                          {/* Issue Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900 truncate">{issue.title}</h3>
                              <div className="flex items-center space-x-1 ml-2">
                                {getPriorityBadge(issue.priority)}
                                {getStatusBadge(issue.status)}
                              </div>
                            </div>
                            
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {issue.description}
                            </p>
                            
                            {/* Property & Tenant Info */}
                            <div className="space-y-1 mb-3">
                              <div className="flex items-center text-xs text-gray-500">
                                <Home className="w-3 h-3 mr-1" />
                                <span className="truncate">{issue.property.title}</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-500">
                                <User className="w-3 h-3 mr-1" />
                                <span>{issue.tenant.name} - Unit {issue.tenant.unitNumber}</span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  <span>{new Date(issue.reportedDate).toLocaleDateString()}</span>
                                </div>
                                {issue.estimatedCost && (
                                  <span className="font-medium text-blue-600">
                                    ₹{issue.estimatedCost.toLocaleString()}
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
                                  handleViewDetails(issue);
                                }}
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                              
                              {issue.status === 'open' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(issue.id, 'in_progress');
                                  }}
                                >
                                  Start Work
                                </Button>
                              )}
                              
                              {issue.status === 'in_progress' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-xs text-green-600 border-green-300 hover:bg-green-50"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStatusUpdate(issue.id, 'resolved');
                                  }}
                                >
                                  Mark Resolved
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issue Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                {selectedIssue && (
                  <>
                    {React.createElement(getTypeIcon(selectedIssue.type), { className: "w-5 h-5 mr-2" })}
                    {selectedIssue.title}
                  </>
                )}
              </div>
              {selectedIssue && (
                <div className="flex items-center space-x-2">
                  {getPriorityBadge(selectedIssue.priority)}
                  {getStatusBadge(selectedIssue.status)}
                </div>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedIssue && (
            <div className="space-y-6">
              {/* Property & Tenant Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Property Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <img 
                      src={selectedIssue.property.image} 
                      alt={selectedIssue.property.title}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold">{selectedIssue.property.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {selectedIssue.property.address}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tenant Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="font-semibold">{selectedIssue.tenant.name}</p>
                      <p className="text-sm text-muted-foreground">Unit {selectedIssue.tenant.unitNumber}</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{selectedIssue.tenant.phone}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                        <span>{selectedIssue.tenant.email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Issue Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Issue Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{selectedIssue.description}</p>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium capitalize">{selectedIssue.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Reported:</span>
                      <p className="font-medium">{new Date(selectedIssue.reportedDate).toLocaleDateString()}</p>
                    </div>
                    {selectedIssue.estimatedCost && (
                      <div>
                        <span className="text-muted-foreground">Est. Cost:</span>
                        <p className="font-medium">₹{selectedIssue.estimatedCost.toLocaleString()}</p>
                      </div>
                    )}
                    {selectedIssue.assignedTo && (
                      <div>
                        <span className="text-muted-foreground">Assigned to:</span>
                        <p className="font-medium">{selectedIssue.assignedTo}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              {/* Issue Images */}
              {selectedIssue.images && selectedIssue.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Issue Images</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {selectedIssue.images.map((image, index) => (
                        <img 
                          key={index}
                          src={image} 
                          alt={`Issue ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                {selectedIssue.status === 'open' && (
                  <Button 
                    onClick={() => {
                      handleStatusUpdate(selectedIssue.id, 'in_progress');
                      setShowDetailModal(false);
                    }}
                  >
                    Start Work
                  </Button>
                )}
                
                {selectedIssue.status === 'in_progress' && (
                  <Button 
                    onClick={() => {
                      handleStatusUpdate(selectedIssue.id, 'resolved');
                      setShowDetailModal(false);
                    }}
                  >
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
      </div>
    </div>
  );
};

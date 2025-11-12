import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { adminAPI } from '@/lib/api';
import { 
  Users,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  CheckCircle,
  XCircle,
  FileText,
  Shield,
  User,
  Building
} from 'lucide-react';

interface Owner {
  id: number;
  username: string;
  email: string;
  phone: string;
  fullName: string;
  address: string;
  joinDate: string;
  isVerified: boolean;
  profileImage?: string;
  documents: {
    aadhar?: string;
    pan?: string;
  };
  totalProperties: number;
  activeRentals: number;
  totalRevenue: number;
}

export const AdminUsers: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<keyof Owner>('joinDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [stats, setStats] = useState({
    totalOwners: 0,
    verifiedOwners: 0,
    pendingVerification: 0,
    activeProperties: 0
  });

  // Mock data for demonstration
  const mockOwners: Owner[] = [
    {
      id: 1,
      username: 'rajesh_kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 9876543210',
      fullName: 'Rajesh Kumar',
      address: 'Koramangala, Bangalore',
      joinDate: '2024-01-15',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      documents: {
        aadhar: 'https://example.com/aadhar1.jpg',
        pan: 'https://example.com/pan1.jpg'
      },
      totalProperties: 3,
      activeRentals: 2,
      totalRevenue: 75000
    },
    {
      id: 2,
      username: 'priya_sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 9876543211',
      fullName: 'Priya Sharma',
      address: 'Whitefield, Bangalore',
      joinDate: '2024-02-20',
      isVerified: false,
      profileImage: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      documents: {
        aadhar: 'https://example.com/aadhar2.jpg',
        pan: 'https://example.com/pan2.jpg'
      },
      totalProperties: 1,
      activeRentals: 1,
      totalRevenue: 25000
    },
    {
      id: 3,
      username: 'amit_patel',
      email: 'amit.patel@email.com',
      phone: '+91 9876543212',
      fullName: 'Amit Patel',
      address: 'HSR Layout, Bangalore',
      joinDate: '2024-03-10',
      isVerified: true,
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      documents: {
        aadhar: 'https://example.com/aadhar3.jpg',
        pan: 'https://example.com/pan3.jpg'
      },
      totalProperties: 2,
      activeRentals: 2,
      totalRevenue: 50000
    }
  ];

  useEffect(() => {
    loadOwners();
  }, []);

  const loadOwners = async () => {
    try {
      setLoading(true);
      // In real app, this would be: const response = await adminAPI.getAllOwners();
      // For now, using mock data
      setTimeout(() => {
        setOwners(mockOwners);
        setStats({
          totalOwners: mockOwners.length,
          verifiedOwners: mockOwners.filter(o => o.isVerified).length,
          pendingVerification: mockOwners.filter(o => !o.isVerified).length,
          activeProperties: mockOwners.reduce((sum, o) => sum + o.totalProperties, 0)
        });
        setLoading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Failed to load owners:', error);
      toast.error('Failed to load owners');
      setLoading(false);
    }
  };

  const handleVerifyOwner = async (ownerId: number, ownerName: string) => {
    try {
      // In real app: await adminAPI.verifyOwner(ownerId);
      setOwners(prevOwners => 
        prevOwners.map(owner => 
          owner.id === ownerId ? { ...owner, isVerified: true } : owner
        )
      );
      setStats(prev => ({
        ...prev,
        verifiedOwners: prev.verifiedOwners + 1,
        pendingVerification: prev.pendingVerification - 1
      }));
      toast.success(`${ownerName} has been verified successfully!`);
      setShowDetailModal(false);
    } catch (error) {
      console.error('Failed to verify owner:', error);
      toast.error('Failed to verify owner. Please try again.');
    }
  };

  const handleSort = (field: keyof Owner) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleViewDetails = (owner: Owner) => {
    setSelectedOwner(owner);
    setShowDetailModal(true);
  };

  // Filter and sort owners
  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         owner.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && owner.isVerified) ||
                         (statusFilter === 'pending' && !owner.isVerified);
    
    return matchesSearch && matchesStatus;
  });

  const sortedOwners = [...filteredOwners].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedOwners.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOwners = sortedOwners.slice(startIndex, startIndex + itemsPerPage);

  const ownerStats = [
    {
      title: 'Total Owners',
      value: stats.totalOwners.toString(),
      description: 'Registered property owners',
      icon: Users,
      color: 'primary'
    },
    {
      title: 'Verified Owners',
      value: stats.verifiedOwners.toString(),
      description: 'Document verified owners',
      icon: CheckCircle,
      color: 'success'
    },
    {
      title: 'Pending Verification',
      value: stats.pendingVerification.toString(),
      description: 'Awaiting document verification',
      icon: XCircle,
      color: 'warning'
    },
    {
      title: 'Active Properties',
      value: stats.activeProperties.toString(),
      description: 'Total listed properties',
      icon: Building,
      color: 'info'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">
            Manage property owners and verify their documents
          </p>
        </div>
        <Button onClick={loadOwners} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {ownerStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search owners by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Owners Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Property Owners ({sortedOwners.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('fullName')}>
                    <div className="flex items-center">
                      Owner Details
                      <ArrowUpDown className="ml-1 w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('totalProperties')}>
                    <div className="flex items-center">
                      Properties
                      <ArrowUpDown className="ml-1 w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('totalRevenue')}>
                    <div className="flex items-center">
                      Revenue
                      <ArrowUpDown className="ml-1 w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('joinDate')}>
                    <div className="flex items-center">
                      Join Date
                      <ArrowUpDown className="ml-1 w-3 h-3" />
                    </div>
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <tr key={index} className="animate-pulse">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full mr-3"></div>
                          <div>
                            <div className="w-32 h-4 bg-gray-200 rounded mb-1"></div>
                            <div className="w-24 h-3 bg-gray-200 rounded"></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-20 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-24 h-4 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-20 h-8 bg-gray-200 rounded"></div>
                      </td>
                    </tr>
                  ))
                ) : (
                  paginatedOwners.map((owner) => (
                    <tr key={owner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={owner.profileImage || `https://ui-avatars.com/api/?name=${owner.fullName}&size=40`}
                            alt={owner.fullName}
                            className="w-10 h-10 rounded-full mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{owner.fullName}</div>
                            <div className="text-sm text-gray-500">{owner.email}</div>
                            <div className="text-xs text-gray-400">{owner.phone}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{owner.totalProperties} total</div>
                        <div className="text-xs text-gray-500">{owner.activeRentals} active</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{owner.totalRevenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(owner.joinDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge 
                          variant={owner.isVerified ? "default" : "secondary"}
                          className={owner.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
                        >
                          {owner.isVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(owner)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-3 border-t">
              <div className="text-sm text-gray-500">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, sortedOwners.length)} of {sortedOwners.length} owners
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Owner Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Owner Details - {selectedOwner?.fullName}
            </DialogTitle>
          </DialogHeader>
          
          {selectedOwner && (
            <div className="space-y-6">
              {/* Profile Section */}
              <div className="flex items-start space-x-6">
                <img
                  src={selectedOwner.profileImage || `https://ui-avatars.com/api/?name=${selectedOwner.fullName}&size=120`}
                  alt={selectedOwner.fullName}
                  className="w-32 h-32 rounded-lg object-cover border"
                />
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedOwner.fullName}</h3>
                    <p className="text-sm text-muted-foreground">@{selectedOwner.username}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Email</label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {selectedOwner.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Phone</label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {selectedOwner.phone}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Address</label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {selectedOwner.address}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Join Date</label>
                      <p className="text-sm text-gray-900 flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(selectedOwner.joinDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Property Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{selectedOwner.totalProperties}</p>
                  <p className="text-sm text-gray-600">Total Properties</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{selectedOwner.activeRentals}</p>
                  <p className="text-sm text-gray-600">Active Rentals</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">₹{selectedOwner.totalRevenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Total Revenue</p>
                </div>
              </div>

              {/* Documents Section */}
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2" />
                  Identity Documents
                </h4>
                <div className="grid grid-cols-2 gap-6">
                  {/* Aadhar Card */}
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">Aadhar Card</h5>
                    {selectedOwner.documents.aadhar ? (
                      <div className="space-y-2">
                        <img
                          src={selectedOwner.documents.aadhar}
                          alt="Aadhar Card"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedOwner.documents.aadhar, '_blank')}
                          className="w-full"
                        >
                          View Full Document
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not uploaded</p>
                    )}
                  </div>

                  {/* PAN Card */}
                  <div className="border rounded-lg p-4">
                    <h5 className="font-medium mb-2">PAN Card</h5>
                    {selectedOwner.documents.pan ? (
                      <div className="space-y-2">
                        <img
                          src={selectedOwner.documents.pan}
                          alt="PAN Card"
                          className="w-full h-32 object-cover rounded border"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(selectedOwner.documents.pan, '_blank')}
                          className="w-full"
                        >
                          View Full Document
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Verification Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Verification Status</h4>
                  <p className="text-sm text-gray-600">
                    {selectedOwner.isVerified 
                      ? 'This owner has been verified and can list properties'
                      : 'This owner is pending verification and cannot list properties yet'
                    }
                  </p>
                </div>
                <Badge 
                  variant={selectedOwner.isVerified ? "default" : "secondary"}
                  className={`${selectedOwner.isVerified 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                  } text-lg px-4 py-2`}
                >
                  {selectedOwner.isVerified ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 mr-1" />
                      Pending
                    </>
                  )}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t">
                {!selectedOwner.isVerified && (
                  <Button 
                    onClick={() => handleVerifyOwner(selectedOwner.id, selectedOwner.fullName)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Verify Owner
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
  );
};

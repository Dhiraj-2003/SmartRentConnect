import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  Filter, 
  Building, 
  Users, 
  Calendar,
  Phone,
  Mail,
  Eye,
  MessageCircle,
  UserX,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  CreditCard,
  AlertTriangle,
  ChevronDown,
  MoreHorizontal
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ownerAPI } from '@/lib/api';
import { toast } from 'sonner';
import { TenantDetailsDrawer } from './TenantDetailsDrawer';
import avatarDefault from '@/assets/avatardefault.png';

interface Tenant {
  id: string;
  tenantId: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  propertyName: string;
  propertyType: 'FLAT' | 'PG';
  flatNumber?: string;
  bedNumber?: string;
  roomNumber?: string;
  bookingDate: string;
  occupancyStartDate: string;
  status: 'ACTIVE' | 'RENT_DUE' | 'OVERDUE' | 'PENDING_CASH' | 'UPCOMING' | 'RELEASED';
  depositAmount: number;
  monthlyRent: number;
  lastPaidDate?: string;
  nextRentDueDate?: string;
  paymentMode: 'ONLINE' | 'CASH' | 'MIXED';
  releaseDate?: string;
  releaseReason?: string;
  
  // Payment information for pending cash confirmations
  paymentMethod?: string;
  paymentStatus?: string;
  paymentTransactionDate?: string;
  
  // Booking information for pending cash confirmations
  bookingId?: number;
  bookingStatus?: string;
  bookingBookingDate?: string;
  bookingMoveInDate?: string;
}

interface SummaryStats {
  activeTenants: number;
  pendingCashConfirmations: number;
  upcomingMoveIns: number;
  releasedTenants: number;
}

export const TenantsManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<Tenant[]>([]);
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    activeTenants: 0,
    pendingCashConfirmations: 0,
    upcomingMoveIns: 0,
    releasedTenants: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('All');
  const [propertyFilter, setPropertyFilter] = useState<string>('All');
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showDetailsDrawer, setShowDetailsDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  const loadTenantsData = async () => {
    try {
      setLoading(true);
      
      // Fetch both regular tenants and pending cash payments
      const [regularTenantsResponse, pendingCashResponse] = await Promise.all([
        ownerAPI.getTenants(),
        ownerAPI.getPendingCashPayments()
      ]);
      
      const regularTenants = regularTenantsResponse.data;
      const pendingCashTenants = pendingCashResponse.data;
      
      // Combine both datasets
      const allTenants = [...regularTenants, ...pendingCashTenants];
      
      setTenants(allTenants);
      
      // Calculate summary stats
      const stats = allTenants.reduce((acc: SummaryStats, tenant: Tenant) => {
        if (tenant.status === 'ACTIVE') acc.activeTenants++;
        else if (tenant.status === 'PENDING_CASH') acc.pendingCashConfirmations++;
        else if (tenant.status === 'UPCOMING') acc.upcomingMoveIns++;
        else if (tenant.status === 'RELEASED') acc.releasedTenants++;
        return acc;
      }, { activeTenants: 0, pendingCashConfirmations: 0, upcomingMoveIns: 0, releasedTenants: 0 });
      
      setSummaryStats(stats);
      
      // Get unique properties for filter
      const uniqueProperties = [...new Set(allTenants.map((t: Tenant) => t.propertyName))];
      setProperties(uniqueProperties.map(name => ({ name, id: name })));
      
    } catch (error) {
      toast.error('Failed to load tenants data');
      console.error('Error loading tenants:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenantsData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tenants, searchTerm, statusFilter, propertyTypeFilter, propertyFilter]);

  const applyFilters = () => {
    let filtered = [...tenants];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(tenant => 
        tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.phoneNumber.includes(searchTerm) ||
        tenant.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(tenant => tenant.status === statusFilter);
    }
    
    // Apply property type filter
    if (propertyTypeFilter !== 'All') {
      filtered = filtered.filter(tenant => tenant.propertyType === propertyTypeFilter);
    }
    
    // Apply property filter
    if (propertyFilter !== 'All') {
      filtered = filtered.filter(tenant => tenant.propertyName === propertyFilter);
    }
    
    setFilteredTenants(filtered);
  };

  const getTenantsByTab = (tab: string) => {
    switch (tab) {
      case 'active':
        return filteredTenants.filter(t => t.status === 'ACTIVE' || t.status === 'RENT_DUE' || t.status === 'OVERDUE');
      case 'pending':
        return filteredTenants.filter(t => t.status === 'PENDING_CASH');
      case 'upcoming':
        return filteredTenants.filter(t => t.status === 'UPCOMING');
      case 'released':
        return filteredTenants.filter(t => t.status === 'RELEASED');
      default:
        return filteredTenants;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; text: string }> = {
      'ACTIVE': { variant: 'default', text: 'ACTIVE' },
      'RENT_DUE': { variant: 'secondary', text: 'RENT_DUE' },
      'OVERDUE': { variant: 'destructive', text: 'OVERDUE' },
      'PENDING_CASH': { variant: 'secondary', text: 'PENDING CASH' },
      'UPCOMING': { variant: 'outline', text: 'UPCOMING' },
      'RELEASED': { variant: 'outline', text: 'RELEASED' }
    };
    
    const config = variants[status] || { variant: 'outline', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const handleConfirmPayment = async (tenantId: string) => {
    try {
      await ownerAPI.confirmCashPayment(tenantId);
      toast.success('Payment confirmed successfully');
      loadTenantsData();
    } catch (error) {
      toast.error('Failed to confirm payment');
      console.error('Error confirming payment:', error);
    }
  };

  const handleRejectPayment = async (tenantId: string) => {
    try {
      await ownerAPI.rejectCashPayment(tenantId);
      toast.success('Payment rejected');
      loadTenantsData();
    } catch (error) {
      toast.error('Failed to reject payment');
      console.error('Error rejecting payment:', error);
    }
  };

  const handleMarkVacated = async (tenantId: string) => {
    try {
      await ownerAPI.markTenantVacated(tenantId);
      toast.success('Tenant marked as vacated');
      loadTenantsData();
    } catch (error) {
      toast.error('Failed to mark tenant as vacated');
      console.error('Error marking vacated:', error);
    }
  };

  const handleViewDetails = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setShowDetailsDrawer(true);
  };

  const handleContact = (tenant: Tenant) => {
    window.open(`mailto:${tenant.email}?subject=Regarding your stay at ${tenant.propertyName}`);
  };

  const TenantCard = ({ tenant }: { tenant: Tenant }) => {
    const unit = tenant.propertyType === 'FLAT' ? tenant.flatNumber : tenant.bedNumber;
    
    return (
      <Card className="mb-3">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left section - Avatar and basic info */}
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={tenant.profileImage || avatarDefault} alt={tenant.fullName} />
                <AvatarFallback className="text-sm">
                  {tenant.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sm">{tenant.fullName}</h3>
                <div className="flex items-center space-x-3 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Phone className="h-3 w-3" />
                    <span>{tenant.phoneNumber}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge variant="secondary" className="text-xs">
                      {tenant.propertyType === 'FLAT' ? `Flat ${unit}` : `Bed ${unit}`}
                    </Badge>
                  </div>
                </div>
                {tenant.propertyType === 'PG' && tenant.roomNumber && (
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                    <Home className="h-3 w-3" />
                    <span>Room {tenant.roomNumber}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Middle section - Property info (desktop only) */}
            <div className="hidden md:block">
              <div className="text-xs text-gray-600 space-y-1">
                <div className="flex items-center space-x-1">
                  <Building className="h-3 w-3" />
                  <span>{tenant.propertyName}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(tenant.occupancyStartDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {/* Right section - Status and actions */}
            <div className="flex flex-col items-end space-y-2">
              {getStatusBadge(tenant.status)}
              <div className="flex space-x-1">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(tenant)}>
                  <Eye className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleContact(tenant)}>
                  <MessageCircle className="h-3 w-3" />
                </Button>
                {tenant.status === 'ACTIVE' && (
                  <Button variant="outline" size="sm" onClick={() => handleMarkVacated(tenant.id)}>
                    <UserX className="h-3 w-3" />
                  </Button>
                )}
                {tenant.status === 'PENDING_CASH' && (
                  <>
                    <Button variant="default" size="sm" onClick={() => handleConfirmPayment(tenant.id)}>
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleRejectPayment(tenant.id)}>
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Mobile property info */}
          <div className="md:hidden mt-3 pt-3 border-t">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center space-x-1">
                <Building className="h-3 w-3" />
                <span>{tenant.propertyName}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(tenant.occupancyStartDate).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Small card component for Active Tenants grid view
  const ActiveTenantCard = ({ tenant }: { tenant: Tenant }) => {
    const unit = tenant.propertyType === 'FLAT' ? tenant.flatNumber : tenant.bedNumber;
    
    const handleCardClick = () => {
      handleViewDetails(tenant);
    };
    
    return (
      <Card 
        className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-white to-gray-50 relative overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <CardContent className="p-4 relative z-10">
          {/* Header with centered avatar and status */}
          <div className="flex flex-col items-center mb-4 relative">
            <div className="relative">
              <Avatar className="h-16 w-16 ring-2 ring-white shadow-lg">
                <AvatarImage src={tenant.profileImage || avatarDefault} alt={tenant.fullName} />
                <AvatarFallback className="text-base font-semibold bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {tenant.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            {/* Status badge in upper right corner */}
            <div className="absolute top-0 right-0">
              {getStatusBadge(tenant.status)}
            </div>
          </div>
          
          {/* Tenant name with gradient */}
          <h3 className="font-bold text-sm mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-200 text-center">
            {tenant.fullName}
          </h3>
          
          {/* Contact info with icons */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
              <Phone className="h-3 w-3 text-blue-500" />
              <span className="font-medium">{tenant.phoneNumber}</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600 bg-gray-50 rounded-lg px-2 py-1">
              <Mail className="h-3 w-3 text-purple-500" />
              <span className="font-medium truncate">{tenant.email}</span>
            </div>
          </div>
          
          {/* Property info with badges */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2 text-xs text-gray-700 px-2 py-1 bg-gray-50 rounded-lg">
              <Building className="h-3 w-3 text-orange-500" />
              <span className="font-medium truncate">{tenant.propertyName}</span>
            </div>
            <div className="flex flex-wrap gap-1 justify-center">
              {tenant.propertyType === 'PG' && tenant.roomNumber && (
                <Badge variant="outline" className="border-purple-200 text-purple-700 text-xs px-2 py-1 bg-purple-50">
                  Room {tenant.roomNumber}
                </Badge>
              )}
              <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs px-2 py-1 shadow-sm">
                {tenant.propertyType === 'FLAT' ? `Flat ${unit}` : `Bed ${unit}`}
              </Badge>
            </div>
          </div>
          
          {/* Payment and Booking Information for Pending Cash Confirmations */}
          {tenant.status === 'PENDING_CASH' && (
            <div className="space-y-3 mb-4">
              
              {/* Booking Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <div className="text-xs font-semibold text-blue-700 mb-2 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  Booking Details
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Booking:</span>
                    <span className="font-medium text-blue-600">
                      {new Date(tenant.bookingBookingDate || tenant.bookingDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Move-in:</span>
                    <span className="font-medium text-blue-600">
                      {new Date(tenant.bookingMoveInDate || tenant.occupancyStartDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium text-blue-600">{tenant.bookingStatus || 'CONFIRMED'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Action buttons with hover effects */}
          {tenant.status === 'UPCOMING' && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-2 mb-3 border border-green-200">
              <div className="flex items-center justify-center">
                <Clock className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-xs font-semibold text-green-700">
                  Moving in: {Math.ceil((new Date(tenant.bookingMoveInDate || tenant.occupancyStartDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-between pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleContact(tenant);
                }}
                className="hover:bg-purple-50 hover:border-purple-300 hover:text-purple-600 transition-all duration-200 group/btn"
              >
                <MessageCircle className="h-3 w-3 group-hover/btn:scale-110 transition-transform duration-200" />
              </Button>
            </div>
            <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(tenant);
                  }}
                  className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 group/btn"
                >
                  <Eye className="h-3 w-3 group-hover/btn:scale-110 transition-transform duration-200" />
                </Button>
            </div>
          </div>
        </CardContent>
        
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-transparent rounded-bl-full"></div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => setActiveTab('active')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{summaryStats.activeTenants}</p>
                <p className="text-sm text-gray-600">Active Tenants</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => setActiveTab('pending')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{summaryStats.pendingCashConfirmations}</p>
                <p className="text-sm text-gray-600">Pending Cash Confirmations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => setActiveTab('upcoming')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{summaryStats.upcomingMoveIns}</p>
                <p className="text-sm text-gray-600">Upcoming Move-ins</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
          onClick={() => setActiveTab('released')}
        >
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <UserX className="h-8 w-8 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{summaryStats.releasedTenants}</p>
                <p className="text-sm text-gray-600">Released Tenants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by tenant name, phone, property name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <Filter className="h-4 w-4 mr-2" />
                    {statusFilter}
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('All')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('ACTIVE')}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('PENDING_CASH')}>Pending Cash</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('UPCOMING')}>Upcoming</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('RELEASED')}>Released</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <Building className="h-4 w-4 mr-2" />
                    {propertyTypeFilter}
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPropertyTypeFilter('All')}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPropertyTypeFilter('FLAT')}>Flat</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPropertyTypeFilter('PG')}>PG</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40">
                    <Home className="h-4 w-4 mr-2" />
                    {propertyFilter}
                    <ChevronDown className="h-4 w-4 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPropertyFilter('All')}>All Properties</DropdownMenuItem>
                  {properties.map((property) => (
                    <DropdownMenuItem key={property.id} onClick={() => setPropertyFilter(property.name)}>
                      {property.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">Active Tenants</TabsTrigger>
          <TabsTrigger value="pending">Pending Cash Confirmations</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Move-ins</TabsTrigger>
          <TabsTrigger value="released">Released Tenants</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getTenantsByTab('active').map((tenant) => (
              <ActiveTenantCard key={tenant.id} tenant={tenant} />
            ))}
          </div>
          {getTenantsByTab('active').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No active tenants found
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getTenantsByTab('pending').map((tenant) => (
              <ActiveTenantCard key={tenant.id} tenant={tenant} />
            ))}
          </div>
          {getTenantsByTab('pending').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No pending cash confirmations found
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {getTenantsByTab('upcoming').map((tenant) => (
              <ActiveTenantCard key={tenant.id} tenant={tenant} />
            ))}
          </div>
          {getTenantsByTab('upcoming').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No upcoming move-ins found
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="released" className="space-y-4">
          {getTenantsByTab('released').map((tenant) => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
          {getTenantsByTab('released').length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No released tenants found
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Tenant Details Drawer */}
      {selectedTenant && (
        <TenantDetailsDrawer
          tenant={selectedTenant}
          open={showDetailsDrawer}
          onClose={() => setShowDetailsDrawer(false)}
          onStatusChange={loadTenantsData}
        />
      )}
    </div>
  );
};

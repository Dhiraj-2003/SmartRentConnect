import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/enhanced-button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ownerAPI } from '@/lib/api';
import { toast } from 'sonner';
import property1Image from '@/assets/property-1.jpg';
import property2Image from '@/assets/property-2.jpg';
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Download,
  RefreshCw,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Users,
  Bell,
  Send,
  Eye,
  ArrowLeft
} from 'lucide-react';

interface PaymentData {
  pendingPayments: number;
  overduePayments: number;
  receivedThisMonth: number;
  totalRevenue: number;
  properties: Array<{
    id: number;
    title: string;
    address: string;
    monthlyRent: number;
    image?: string;
    overallStatus: 'all_paid' | 'some_pending' | 'overdue';
    tenants: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      unitNumber: string;
      monthlyRent: number;
      paymentStatus: 'paid' | 'pending' | 'overdue';
      paymentDate: string;
      dueDate: string;
    }>;
  }>;
}

interface RevenueSectionProps {
  className?: string;
}

export const RevenueSection: React.FC<RevenueSectionProps> = ({ className = '' }) => {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedProperty, setSelectedProperty] = useState<PaymentData['properties'][0] | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);

  useEffect(() => {
    loadPaymentData();
  }, [selectedPeriod]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Mock payment data for demonstration
      const mockData: PaymentData = {
        pendingPayments: 3,
        overduePayments: 2,
        receivedThisMonth: 125000,
        totalRevenue: 144000,
        properties: [
          {
            id: 1,
            title: 'Luxury Villa Complex',
            address: '123 Main Street, Downtown',
            monthlyRent: 75000,
            overallStatus: 'all_paid',
            image: property1Image,
            tenants: [
              {
                id: 1,
                name: 'John Smith',
                email: 'john@example.com',
                phone: '+91 9876543210',
                unitNumber: 'A-101',
                monthlyRent: 25000,
                paymentStatus: 'paid',
                paymentDate: '2024-01-05',
                dueDate: '2024-01-01'
              },
              {
                id: 2,
                name: 'Alice Brown',
                email: 'alice@example.com',
                phone: '+91 9876543211',
                unitNumber: 'A-102',
                monthlyRent: 25000,
                paymentStatus: 'paid',
                paymentDate: '2024-01-03',
                dueDate: '2024-01-01'
              },
              {
                id: 3,
                name: 'Robert Wilson',
                email: 'robert@example.com',
                phone: '+91 9876543212',
                unitNumber: 'A-103',
                monthlyRent: 25000,
                paymentStatus: 'paid',
                paymentDate: '2024-01-04',
                dueDate: '2024-01-01'
              }
            ]
          },
          {
            id: 2,
            title: 'Modern Apartment Building',
            address: '456 Oak Avenue, Midtown',
            monthlyRent: 45000,
            overallStatus: 'some_pending',
            image: property2Image,
            tenants: [
              {
                id: 4,
                name: 'Sarah Johnson',
                email: 'sarah@example.com',
                phone: '+91 9876543213',
                unitNumber: 'B-201',
                monthlyRent: 15000,
                paymentStatus: 'paid',
                paymentDate: '2024-01-02',
                dueDate: '2024-01-01'
              },
              {
                id: 5,
                name: 'Mike Davis',
                email: 'mike@example.com',
                phone: '+91 9876543214',
                unitNumber: 'B-202',
                monthlyRent: 15000,
                paymentStatus: 'pending',
                paymentDate: '',
                dueDate: '2024-01-01'
              },
              {
                id: 6,
                name: 'Lisa Chen',
                email: 'lisa@example.com',
                phone: '+91 9876543215',
                unitNumber: 'B-203',
                monthlyRent: 15000,
                paymentStatus: 'pending',
                paymentDate: '',
                dueDate: '2024-01-01'
              }
            ]
          },
          {
            id: 3,
            title: 'Downtown Studio Complex',
            address: '789 Pine Road, Uptown',
            monthlyRent: 24000,
            overallStatus: 'overdue',
            image: property1Image,
            tenants: [
              {
                id: 7,
                name: 'Tom Wilson',
                email: 'tom@example.com',
                phone: '+91 9876543216',
                unitNumber: 'C-301',
                monthlyRent: 8000,
                paymentStatus: 'overdue',
                paymentDate: '',
                dueDate: '2023-12-01'
              },
              {
                id: 8,
                name: 'Emma Taylor',
                email: 'emma@example.com',
                phone: '+91 9876543217',
                unitNumber: 'C-302',
                monthlyRent: 8000,
                paymentStatus: 'paid',
                paymentDate: '2024-01-01',
                dueDate: '2024-01-01'
              },
              {
                id: 9,
                name: 'James Miller',
                email: 'james@example.com',
                phone: '+91 9876543218',
                unitNumber: 'C-303',
                monthlyRent: 8000,
                paymentStatus: 'overdue',
                paymentDate: '',
                dueDate: '2023-12-01'
              }
            ]
          }
        ]
      };

      setPaymentData(mockData);
    } catch (error: any) {
      console.error('Failed to load payment data:', error);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.success('Payment report exported successfully');
  };

  const getStatusBadge = (status: 'paid' | 'pending' | 'overdue') => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return null;
    }
  };

  const getPropertyStatusBadge = (status: 'all_paid' | 'some_pending' | 'overdue') => {
    switch (status) {
      case 'all_paid':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />All Paid</Badge>;
      case 'some_pending':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" />Some Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Overdue</Badge>;
      default:
        return null;
    }
  };

  const handlePropertyClick = (property: PaymentData['properties'][0]) => {
    setSelectedProperty(property);
    setShowPropertyModal(true);
  };

  const handleNotifyAllPendingOverdue = () => {
    if (!paymentData) return;
    
    const pendingOverdueCount = paymentData.properties.reduce((count, property) => {
      return count + property.tenants.filter(tenant => 
        tenant.paymentStatus === 'pending' || tenant.paymentStatus === 'overdue'
      ).length;
    }, 0);
    
    toast.success(`Reminder sent to ${pendingOverdueCount} tenants with pending/overdue payments`);
  };

  const handleNotifyTenant = (tenantId: number, tenantName: string) => {
    toast.success(`Reminder sent to ${tenantName}`);
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Revenue & Payments</h2>
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-muted-foreground">No payment data available</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Revenue & Payments</h2>
          <p className="text-muted-foreground">Track rental payments and property revenue</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisMonth">This Month</SelectItem>
              <SelectItem value="lastMonth">Last Month</SelectItem>
              <SelectItem value="last3Months">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadPaymentData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleExportReport} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Payment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Pending Payments Card */}
        <Card className="relative overflow-hidden border border-yellow-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-50 to-yellow-100"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-yellow-700">Pending Payments</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {paymentData.pendingPayments}
                </p>
                <p className="text-xs text-yellow-600">Awaiting collection</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-200/30 rounded-full blur-lg"></div>
                <Clock className="relative w-10 h-10 text-yellow-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-yellow-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Follow up required
            </div>
          </CardContent>
        </Card>

        {/* Overdue Payments Card */}
        <Card className="relative overflow-hidden border border-red-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-red-100"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-red-700">Overdue Payments</p>
                <p className="text-3xl font-bold text-red-800">
                  {paymentData.overduePayments}
                </p>
                <p className="text-xs text-red-600">Immediate attention</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-red-200/30 rounded-full blur-lg"></div>
                <AlertCircle className="relative w-10 h-10 text-red-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-red-600">
              <AlertCircle className="w-3 h-3 mr-1" />
              Action needed now
            </div>
          </CardContent>
        </Card>

        {/* Received This Month Card */}
        <Card className="relative overflow-hidden border border-green-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-700">Received This Month</p>
                <p className="text-3xl font-bold text-green-800">
                  ₹{paymentData.receivedThisMonth.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">Successful collections</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-200/30 rounded-full blur-lg"></div>
                <CheckCircle className="relative w-10 h-10 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              On track this month
            </div>
          </CardContent>
        </Card>

        {/* Total Revenue Card */}
        <Card className="relative overflow-hidden border border-blue-200 shadow-md hover:shadow-lg transition-shadow">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100"></div>
          <CardContent className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-700">Total Expected</p>
                <p className="text-3xl font-bold text-blue-800">
                  ₹{paymentData.totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">Monthly rent receivable</p>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-blue-200/30 rounded-full blur-lg"></div>
                <DollarSign className="relative w-10 h-10 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-blue-600">
              <TrendingUp className="w-3 h-3 mr-1" />
              Total receivable
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Property Payment Cards */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Property Payment Status
            </div>
            <Button 
              onClick={handleNotifyAllPendingOverdue}
              variant="outline" 
              size="sm"
              className="flex items-center"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify All Pending/Overdue
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paymentData.properties.map((property) => (
              <div 
                key={property.id} 
                className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handlePropertyClick(property)}
              >
                <div className="aspect-video bg-muted relative">
                  <img 
                    src={property.image || property1Image} 
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    {getPropertyStatusBadge(property.overallStatus)}
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <Button size="sm" variant="secondary" className="opacity-80">
                      <Eye className="w-3 h-3 mr-1" />
                      View Details
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{property.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{property.address}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Monthly Rent:</span>
                      <span className="font-semibold">₹{property.monthlyRent.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total Tenants:</span>
                      <span className="text-sm">{property.tenants.length}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Paid:</span>
                      <span className="text-sm text-green-600">
                        {property.tenants.filter(t => t.paymentStatus === 'paid').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Pending:</span>
                      <span className="text-sm text-yellow-600">
                        {property.tenants.filter(t => t.paymentStatus === 'pending').length}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Overdue:</span>
                      <span className="text-sm text-red-600">
                        {property.tenants.filter(t => t.paymentStatus === 'overdue').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Property Detail Modal */}
      <Dialog open={showPropertyModal} onOpenChange={setShowPropertyModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowPropertyModal(false)}
                  className="mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Building className="w-5 h-5 mr-2" />
                {selectedProperty?.title} - Tenant Payment Details
              </div>
              {getPropertyStatusBadge(selectedProperty?.overallStatus || 'all_paid')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProperty && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Property Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Address:</span>
                    <p>{selectedProperty.address}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Total Monthly Rent:</span>
                    <p className="font-semibold">₹{selectedProperty.monthlyRent.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Tenant Payment Status</h4>
                  <div className="flex space-x-2">
                    {(selectedProperty.tenants.filter(t => t.paymentStatus === 'pending' || t.paymentStatus === 'overdue').length > 0) && (
                      <Button 
                        onClick={() => {
                          const pendingOverdueCount = selectedProperty.tenants.filter(t => 
                            t.paymentStatus === 'pending' || t.paymentStatus === 'overdue'
                          ).length;
                          toast.success(`Reminder sent to ${pendingOverdueCount} tenants in ${selectedProperty.title}`);
                        }}
                        variant="outline" 
                        size="sm"
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Notify All Pending/Overdue
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="grid gap-4">
                  {selectedProperty.tenants.map((tenant) => {
                    const getCardBackground = (status: 'paid' | 'pending' | 'overdue') => {
                      switch (status) {
                        case 'paid':
                          return 'bg-green-50 border-green-200';
                        case 'pending':
                          return 'bg-yellow-50 border-yellow-200';
                        case 'overdue':
                          return 'bg-red-50 border-red-200';
                        default:
                          return 'border-border';
                      }
                    };

                    return (
                    <div key={tenant.id} className={`rounded-lg p-4 border-2 shadow-sm hover:shadow-md transition-shadow ${getCardBackground(tenant.paymentStatus)}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div>
                            <h5 className="font-semibold">{tenant.name}</h5>
                            <p className="text-sm text-muted-foreground">Unit {tenant.unitNumber}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(tenant.paymentStatus)}
                          {(tenant.paymentStatus === 'pending' || tenant.paymentStatus === 'overdue') && (
                            <Button 
                              onClick={() => handleNotifyTenant(tenant.id, tenant.name)}
                              variant="outline" 
                              size="sm"
                            >
                              <Send className="w-3 h-3 mr-1" />
                              Notify
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Monthly Rent:</span>
                          <p className="font-semibold">₹{tenant.monthlyRent.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Due Date:</span>
                          <p>{new Date(tenant.dueDate).toLocaleDateString()}</p>
                        </div>
                        {tenant.paymentDate && (
                          <div>
                            <span className="text-muted-foreground">Paid On:</span>
                            <p className="text-green-600">{new Date(tenant.paymentDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-muted-foreground">Contact:</span>
                          <p>{tenant.phone}</p>
                        </div>
                      </div>
                      
                      {tenant.paymentStatus === 'overdue' && (
                        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                          <AlertCircle className="w-4 h-4 inline mr-1" />
                          Payment is overdue since {new Date(tenant.dueDate).toLocaleDateString()}. Contact immediately.
                        </div>
                      )}
                      
                      {tenant.paymentStatus === 'pending' && (
                        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                          <Clock className="w-4 h-4 inline mr-1" />
                          Payment is due. Send reminder to tenant.
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

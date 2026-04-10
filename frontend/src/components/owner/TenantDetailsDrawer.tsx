import React from 'react';
import { ownerAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  Building, 
  Home, 
  Calendar, 
  CreditCard, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageCircle,
  UserX,
  Eye,
  FileText,
  DollarSign,
  History
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import avatarDefault from '@/assets/avatardefault.png';

interface TenantDetailsDrawerProps {
  tenant: Tenant;
  open: boolean;
  onClose: () => void;
  onStatusChange: () => void;
}

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
  emergencyContact?: string;
}

export const TenantDetailsDrawer: React.FC<TenantDetailsDrawerProps> = ({
  tenant,
  open,
  onClose,
  onStatusChange
}) => {
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

  const handleConfirmPayment = async () => {
    try {
      await ownerAPI.confirmCashPayment(tenant.id);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error confirming payment:', error);
    }
  };

  const handleRejectPayment = async () => {
    try {
      await ownerAPI.rejectCashPayment(tenant.id);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error rejecting payment:', error);
    }
  };

  const handleMarkVacated = async () => {
    try {
      await ownerAPI.markTenantVacated(tenant.id);
      onStatusChange();
      onClose();
    } catch (error) {
      console.error('Error marking vacated:', error);
    }
  };

  const handleContact = () => {
    window.open(`mailto:${tenant.email}?subject=Regarding your stay at ${tenant.propertyName}`);
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Tenant Details</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </SheetTitle>
          <SheetDescription>
            Complete information about tenant and their stay
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 p-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={tenant.profileImage || avatarDefault} alt={tenant.fullName} />
                  <AvatarFallback className="text-lg">
                    {tenant.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{tenant.fullName}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                    <Phone className="h-4 w-4" />
                    <span>{tenant.phoneNumber}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{tenant.email}</span>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(tenant.status)}
                </div>
              </div>
              
              {tenant.emergencyContact && (
                <div className="border-t pt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Emergency Contact</div>
                  <div className="text-sm">{tenant.emergencyContact}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stay / Occupancy Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Home className="h-5 w-5" />
                <span>Stay / Occupancy Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Property Name</div>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-500" />
                      <span>{tenant.propertyName}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700">Property Type</div>
                    <div className="flex items-center space-x-2">
                      <Home className="h-4 w-4 text-gray-500" />
                      <span>{tenant.propertyType}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700">Unit</div>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs font-medium">
                        {tenant.propertyType === 'FLAT' ? (
                          <div className="flex items-center space-x-1">
                            <Home className="h-3 w-3" />
                            <span>Flat {tenant.flatNumber}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Home className="h-3 w-3" />
                            <span>Bed {tenant.bedNumber}</span>
                          </div>
                        )}
                      </Badge>
                    </div>
                    {tenant.propertyType === 'PG' && tenant.roomNumber && (
                      <div className="mt-2">
                        <div className="text-sm font-medium text-gray-700">Room</div>
                        <div className="mt-1">
                          <Badge variant="outline" className="text-xs font-medium">
                            <div className="flex items-center space-x-1">
                              <Home className="h-3 w-3" />
                              <span>Room {tenant.roomNumber}</span>
                            </div>
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Booking Date</div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(tenant.bookingDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700">Occupancy Start Date</div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(tenant.occupancyStartDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700">Current Status</div>
                    <div>{getStatusBadge(tenant.status)}</div>
                  </div>
                  
                  {tenant.releaseDate && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Release Date</div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(tenant.releaseDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rent / Agreement Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="h-5 w-5" />
                <span>Rent / Agreement Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Deposit Amount</div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">{tenant.depositAmount}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm font-medium text-gray-700">Monthly Rent</div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span className="font-semibold">{tenant.monthlyRent}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm font-medium text-gray-700">Payment Mode Preference</div>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                      <span>{tenant.paymentMode}</span>
                    </div>
                  </div>
                  
                  {tenant.lastPaidDate && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Last Paid Date</div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{new Date(tenant.lastPaidDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                  
                  {tenant.nextRentDueDate && tenant.status !== 'RELEASED' && (
                    <div>
                      <div className="text-sm font-medium text-gray-700">Next Rent Due Date</div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{new Date(tenant.nextRentDueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {tenant.status === 'ACTIVE' && (
                  <>
                    <Button onClick={handleContact}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact Tenant
                    </Button>
                    <div className="ml-auto">
                      <Button variant="destructive" onClick={handleMarkVacated}>
                        <UserX className="h-4 w-4 mr-2" />
                        Mark Vacated
                      </Button>
                    </div>
                  </>
                )}
                
                {tenant.status === 'PENDING_CASH' && (
                  <>
                    <Button onClick={handleConfirmPayment} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Confirm Payment Received
                    </Button>
                    <Button variant="destructive" onClick={handleRejectPayment} className="flex-1">
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Payment
                    </Button>
                  </>
                )}
                
                {tenant.status === 'UPCOMING' && (
                  <>
                    <Button onClick={handleContact}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline">
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancel Booking
                    </Button>
                  </>
                )}
                
                {tenant.status === 'RELEASED' && (
                  <Button onClick={() => console.log('View stay history for tenant:', tenant.id)}>
                    <History className="h-4 w-4 mr-2" />
                    View Stay History
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </SheetContent>
    </Sheet>
  );
};

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
import { adminAPI } from '@/lib/api';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Eye, 
  RefreshCw,
  QrCode,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar
} from 'lucide-react';

interface GuestPass {
  id: number;
  passId: string;
  visitorName: string;
  visitorMobile: string;
  visitDateTime: string;
  numberOfGuests: number;
  tenantName: string;
  tenantRoomNumber: string;
  status: string;
  entryTime?: string;
  exitTime?: string;
  verifiedBy?: string;
  createdAt: string;
  expiresAt: string;
}

interface GuestPassManagementProps {
  limit?: number;
  showHeader?: boolean;
}

export const GuestPassManagement: React.FC<GuestPassManagementProps> = ({
  limit,
  showHeader = true
}) => {
  const [guestPasses, setGuestPasses] = useState<GuestPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadGuestPasses();
  }, []);

  const loadGuestPasses = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getAllGuestPasses({
        page: 0,
        size: limit || 1000,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });
      setGuestPasses(response.data.content || response.data);
    } catch (error: any) {
      console.error('Failed to load guest passes:', error);
      toast.error('Failed to load guest passes');
    } finally {
      setLoading(false);
    }
  };

  const filteredPasses = guestPasses.filter(pass => {
    const matchesSearch = 
      pass.visitorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.passId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.visitorMobile.includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      pass.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800">Expired</Badge>;
      case 'cancelled':
        return <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString();
  };

  const getStatsCards = () => {
    const totalPasses = guestPasses.length;
    const activePasses = guestPasses.filter(p => p.status.toLowerCase() === 'active').length;
    const verifiedPasses = guestPasses.filter(p => p.status.toLowerCase() === 'verified').length;
    const expiredPasses = guestPasses.filter(p => p.status.toLowerCase() === 'expired').length;

    return [
      { title: 'Total Passes', value: totalPasses, icon: QrCode, color: 'primary' },
      { title: 'Active', value: activePasses, icon: Clock, color: 'blue' },
      { title: 'Verified', value: verifiedPasses, icon: CheckCircle, color: 'green' },
      { title: 'Expired', value: expiredPasses, icon: XCircle, color: 'red' },
    ];
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Guest Pass Management</h2>
            <p className="text-muted-foreground">Monitor and manage visitor access</p>
          </div>
          <Button onClick={loadGuestPasses} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
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
                  placeholder="Search passes..."
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Guest Passes Table */}
      <Card>
        <CardHeader>
          <CardTitle>Guest Passes ({filteredPasses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pass ID</TableHead>
                  <TableHead>Visitor</TableHead>
                  <TableHead>Tenant</TableHead>
                  <TableHead>Visit Time</TableHead>
                  <TableHead>Guests</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verified By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Loading guest passes...
                    </TableCell>
                  </TableRow>
                ) : filteredPasses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No guest passes found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPasses.slice(0, limit).map((pass) => (
                    <TableRow key={pass.id}>
                      <TableCell>
                        <div className="font-mono text-sm">{pass.passId}</div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pass.visitorName}</div>
                          <div className="text-sm text-muted-foreground">{pass.visitorMobile}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pass.tenantName}</div>
                          <div className="text-sm text-muted-foreground">Room: {pass.tenantRoomNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDateTime(pass.visitDateTime)}
                          </div>
                          {pass.entryTime && (
                            <div className="text-muted-foreground mt-1">
                              Entry: {formatDateTime(pass.entryTime)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <User className="w-3 h-3 mr-1" />
                          {pass.numberOfGuests}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(pass.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {pass.verifiedBy || '-'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Scan, 
  User, 
  Phone, 
  Calendar,
  Clock,
  Home,
  Users,
  CheckCircle,
  XCircle,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { guestPassAPI, watchmanAPI } from '@/lib/api';

interface GuestPassInfo {
  id: string;
  passId: string;
  visitorName: string;
  visitorMobile: string;
  visitDateTime: string;
  tenantName: string;
  tenantRoomNumber: string;
  numberOfGuests: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
}

export const VerifyPass: React.FC = () => {
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const [passId, setPassId] = useState('');
  const [scannedData, setScannedData] = useState<GuestPassInfo | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQrScan = async (result: any) => {
    if (result?.text) {
      try {
        // Extract pass ID from QR code data
        const qrData = result.text;
        const passIdMatch = qrData.match(/GUEST_PASS\|([^|]+)\|/);
        
        if (passIdMatch) {
          const extractedPassId = passIdMatch[1];
          await verifyPass(extractedPassId);
        } else {
          toast.error('Invalid QR code format');
        }
      } catch (error) {
        toast.error('Failed to scan QR code');
      }
    }
  };

  const verifyPass = async (passIdToVerify: string) => {
    try {
      setLoading(true);
      const response = await guestPassAPI.getByPassId(passIdToVerify);
      const passData = response.data;
      
      // Transform API response to match component interface
      const transformedData: GuestPassInfo = {
        id: passData.id,
        passId: passData.passId,
        visitorName: passData.visitorName,
        visitorMobile: passData.visitorMobile,
        visitDateTime: passData.visitDateTime,
        tenantName: passData.tenantName,
        tenantRoomNumber: passData.tenantRoomNumber,
        numberOfGuests: passData.numberOfGuests,
        status: passData.status,
      };
      
      setScannedData(transformedData);
      toast.success('Guest pass verified successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to verify guest pass');
      setScannedData(null);
    } finally {
      setLoading(false);
    }
  };


  const handleManualVerify = async () => {
    if (!passId.trim()) {
      toast.error('Please enter a pass ID');
      return;
    }
    await verifyPass(passId.trim());
  };

  const handleMarkEntry = async () => {
    if (!scannedData) return;
    
    try {
      await watchmanAPI.scanQR(scannedData.passId);
      toast.success('Guest entry marked successfully!');
      setScannedData(null);
      setPassId('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark entry');
    }
  };

  const handleDenyEntry = () => {
    toast.error('Guest entry denied');
    setScannedData(null);
    setPassId('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'EXPIRED':
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-warning" />;
      case 'USED':
        return <CheckCircle className="w-6 h-6 text-blue-500" />;
      default:
        return <XCircle className="w-6 h-6 text-destructive" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      case 'USED': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Verify Guest Pass</h1>
        <p className="text-muted-foreground">Scan QR code or enter pass ID manually</p>
      </div>

      {/* Scan Mode Toggle */}
      <div className="flex space-x-2 mb-6">
        <Button
          variant={scanMode === 'qr' ? 'default' : 'outline'}
          onClick={() => setScanMode('qr')}
          className="flex items-center space-x-2"
        >
          <Scan className="w-4 h-4" />
          <span>QR Scanner</span>
        </Button>
        <Button
          variant={scanMode === 'manual' ? 'default' : 'outline'}
          onClick={() => setScanMode('manual')}
          className="flex items-center space-x-2"
        >
          <Search className="w-4 h-4" />
          <span>Manual Entry</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Scanner/Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>
              {scanMode === 'qr' ? 'QR Code Scanner' : 'Manual Verification'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {scanMode === 'qr' ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-8 text-center">
                  <Scan className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-4">
                    QR Scanner would be implemented here with camera access
                  </p>
                  <p className="text-xs text-muted-foreground">
                    For demo purposes, use manual entry with pass IDs from the guest pass system
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="passId">Guest Pass ID</Label>
                  <Input
                    id="passId"
                    value={passId}
                    onChange={(e) => setPassId(e.target.value)}
                    placeholder="Enter pass ID (e.g., GP001)"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleManualVerify}
                  disabled={!passId || loading}
                  variant="gradient"
                  className="w-full"
                >
                  {loading ? 'Verifying...' : 'Verify Pass'}
                </Button>
                <div className="text-xs text-muted-foreground">
                  <p>Enter the guest pass ID to verify manually</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Verification Result */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Result</CardTitle>
          </CardHeader>
          <CardContent>
            {scannedData ? (
              <div className="space-y-6">
                {/* Status Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(scannedData.status)}
                    <div>
                      <h3 className="text-lg font-semibold">Pass #{scannedData.id}</h3>
                      <Badge className={getStatusColor(scannedData.status)}>
                        {scannedData.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Visitor Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{scannedData.visitorName}</p>
                        <p className="text-xs text-muted-foreground">Visitor</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{scannedData.visitorMobile}</p>
                        <p className="text-xs text-muted-foreground">Phone</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{new Date(scannedData.visitDateTime).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Visit Date</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{new Date(scannedData.visitDateTime).toLocaleTimeString()}</p>
                        <p className="text-xs text-muted-foreground">Visit Time</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Home className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{scannedData.tenantRoomNumber}</p>
                        <p className="text-xs text-muted-foreground">Room</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{scannedData.numberOfGuests}</p>
                        <p className="text-xs text-muted-foreground">Guests</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-accent/50 rounded-lg">
                    <p className="text-sm">
                      <span className="font-medium">Tenant:</span> {scannedData.tenantName}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                {scannedData.status === 'ACTIVE' && (
                  <div className="flex space-x-3">
                    <Button
                      variant="success"
                      className="flex-1"
                      onClick={handleMarkEntry}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Allow Entry
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDenyEntry}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Deny Entry
                    </Button>
                  </div>
                )}

                {scannedData.status !== 'ACTIVE' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setScannedData(null);
                      setPassId('');
                    }}
                  >
                    Clear Result
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Scan className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {scanMode === 'qr' 
                    ? 'Scan a guest pass QR code to verify' 
                    : 'Enter a guest pass ID to verify'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
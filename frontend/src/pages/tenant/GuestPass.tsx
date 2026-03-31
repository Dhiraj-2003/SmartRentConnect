import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Phone, Calendar, Clock, Users } from 'lucide-react';
import { guestPassAPI } from '@/lib/api';
import { toast } from 'sonner';

interface GuestPass {
  id: string;
  passId: string;
  visitorName: string;
  visitorMobile: string;
  visitorImage?: string;
  visitDateTime: string;
  numberOfGuests: number;
  status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'CANCELLED';
  qrCodeData: string;
  createdAt: string;
  expiresAt: string;
}

export const GuestPass: React.FC = () => {
  const [guestPasses, setGuestPasses] = useState<GuestPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    visitorName: '',
    visitorMobile: '',
    visitDateTime: '',
    numberOfGuests: 1,
  });

  useEffect(() => {
    fetchGuestPasses();
  }, []);

  const fetchGuestPasses = async () => {
    try {
      const response = await guestPassAPI.getMyPasses();
      setGuestPasses(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch guest passes');
      setLoading(false);
    }
  };

  const handleCreateGuestPass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await guestPassAPI.create({
        ...formData,
        visitDateTime: new Date(formData.visitDateTime).toISOString(),
      });
      toast.success('Guest pass created successfully!');
      setGuestPasses([response.data, ...guestPasses]);
      setShowCreateForm(false);
      setFormData({
        visitorName: '',
        visitorMobile: '',
        visitDateTime: '',
        numberOfGuests: 1,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create guest pass');
    }
  };

  const handleCancelPass = async (passId: string) => {
    try {
      await guestPassAPI.cancel(passId);
      toast.success('Guest pass cancelled');
      fetchGuestPasses();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel guest pass');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'USED': return 'bg-blue-100 text-blue-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Guest Pass Management</h1>
        <p className="text-muted-foreground">Create and manage visitor passes for your guests</p>
      </div>

      {/* Create Guest Pass Button */}
      <div className="mb-6">
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          variant="gradient"
          size="lg"
        >
          <QrCode className="w-5 h-5 mr-2" />
          Create New Guest Pass
        </Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Guest Pass</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGuestPass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visitorName">Visitor Name</Label>
                  <Input
                    id="visitorName"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({...formData, visitorName: e.target.value})}
                    placeholder="Enter visitor's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="visitorMobile">Mobile Number</Label>
                  <Input
                    id="visitorMobile"
                    value={formData.visitorMobile}
                    onChange={(e) => setFormData({...formData, visitorMobile: e.target.value})}
                    placeholder="10-digit mobile number"
                    pattern="[0-9]{10}"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="visitDateTime">Visit Date & Time</Label>
                  <Input
                    id="visitDateTime"
                    type="datetime-local"
                    value={formData.visitDateTime}
                    onChange={(e) => setFormData({...formData, visitDateTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="numberOfGuests">Number of Guests</Label>
                  <Input
                    id="numberOfGuests"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.numberOfGuests}
                    onChange={(e) => setFormData({...formData, numberOfGuests: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <Button type="submit" variant="gradient">
                  Create Guest Pass
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Guest Passes List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Your Guest Passes</h2>
        
        {loading ? (
          <div className="text-center py-8">Loading guest passes...</div>
        ) : guestPasses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No guest passes found. Create your first guest pass above.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {guestPasses.map((pass) => (
              <Card key={pass.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{pass.visitorName}</CardTitle>
                    <Badge className={getStatusColor(pass.status)}>
                      {pass.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 mr-2" />
                    {pass.visitorMobile}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(pass.visitDateTime).toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {new Date(pass.visitDateTime).toLocaleTimeString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {pass.numberOfGuests} guest{pass.numberOfGuests > 1 ? 's' : ''}
                  </div>
                  
                  {/* QR Code */}
                  {pass.qrCodeData && (
                    <div className="flex justify-center py-4">
                      <img 
                        src={`data:image/png;base64,${pass.qrCodeData}`}
                        alt="QR Code"
                        className="w-32 h-32 border rounded"
                      />
                    </div>
                  )}
                  
                  <div className="text-xs text-muted-foreground">
                    Pass ID: {pass.passId}
                  </div>
                  
                  {pass.status === 'ACTIVE' && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleCancelPass(pass.id)}
                    >
                      Cancel Pass
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/enhanced-button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Calendar, 
  Bed, 
  Home, 
  MapPin, 
  IndianRupee, 
  Users,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: any;
  availability: any;
  selectedRoom: string;
  selectedBed: string;
  onBookingComplete: () => void;
}

interface FormData {
  moveInDate: string;
}

export const BookingDialog: React.FC<BookingDialogProps> = ({
  open,
  onOpenChange,
  property,
  availability,
  selectedRoom,
  selectedBed,
  onBookingComplete
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    moveInDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setFormData({ moveInDate: '' });
    }
  }, [open]);

  const selectedRoomData = availability?.rooms.find(r => r.id === selectedRoom);
  const selectedBedData = selectedRoomData?.beds.find(b => b.id === selectedBed);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate form
      if (!formData.moveInDate) {
        setError('Please select a move-in date');
        return;
      }

      // Create booking first
      const token = localStorage.getItem('token');
      const bookingResponse = await axios.post(
        `http://localhost:8080/api/tenant/book/bed/${selectedBed}`, 
        null,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          params: {
            moveInDate: formData.moveInDate
          }
        }
      );

      const bookingData = bookingResponse.data;
      
      if (!bookingData.success) {
        throw new Error(bookingData.message || 'Failed to create booking');
      }

      // Close dialog and notify parent
      onOpenChange(false);
      onBookingComplete();
      
      // Show success message
      toast.success('Booking created! Redirecting to payment...');
      
      // Navigate to payment page with bookingId only
      navigate('/payment', { 
        state: {
          bookingId: bookingData.bookingId
        }
      });
      
    } catch (error: any) {
      console.error('Booking error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create booking');
      toast.error(error.response?.data?.message || 'Failed to create booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = property.deposit + (selectedRoomData?.pricePerBed || 0);

  if (!selectedRoomData || !selectedBedData) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Complete Your Booking
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Property Summary */}
          <Card className="border-primary/20">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{property.title}</h3>
                  <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{property.address}, {property.city}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <Bed className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-600">Room {selectedRoomData.roomNumber}</p>
                    <p className="text-sm font-medium">Bed {selectedBedData.bedNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <div>
                    <p className="text-xs text-gray-600">Sharing Type</p>
                    <p className="text-sm font-medium">{selectedRoomData.sharingType}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Move-in Date */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">
              Move-in Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.moveInDate}
              onChange={(e) => setFormData({...formData, moveInDate: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              required
            />
          </div>

          {/* Price Breakdown */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <IndianRupee className="w-4 h-4 text-primary" />
                Price Breakdown
              </h4>
              
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-primary/10">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-semibold text-primary">
                    ₹{selectedRoomData.pricePerBed.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-primary/10">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-semibold">
                    ₹{property.deposit.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-3 font-bold text-base">
                  <span>Total Amount:</span>
                  <span className="text-primary">
                    ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Important Information */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-amber-900">Important Information</p>
                <ul className="text-sm text-amber-700 mt-2 space-y-1">
                  <li>• Booking confirmation is subject to availability</li>
                  <li>• Security deposit is refundable as per terms</li>
                  <li>• Please verify all details before proceeding</li>
                  <li>• You'll be redirected to payment after confirmation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

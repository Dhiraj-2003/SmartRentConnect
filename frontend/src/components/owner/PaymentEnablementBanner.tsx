import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, CreditCard, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ownerAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { PaymentOnboardingDialog } from './PaymentOnboardingDialog';

interface PaymentEnablementBannerProps {
  onDismiss?: () => void;
}

export const PaymentEnablementBanner: React.FC<PaymentEnablementBannerProps> = ({ onDismiss }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    // Check if banner should be shown
    const shouldShowBanner = () => {
      if (!user) return false;
      
      // Only show for verified owners with complete profile
      if (user.role !== 'OWNER') return false;
      if (!user.isProfileComplete) return false;
      if (!user.isVerified) return false;
      
      // Only show if online payments are not enabled
      return user.isOnlinePaymentEnabled === false;
    };

    setShowBanner(shouldShowBanner());
  }, [user]);

  const handleDismiss = () => {
    setShowBanner(false);
    onDismiss?.();
  };

  const handleEnablePayments = () => {
    setShowDialog(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh user data to update payment status
    window.location.reload();
  };

  if (!showBanner) {
    return null;
  }

  return (
    <>
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm">
        <div className="p-6">
          {/* Header with close button */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  🔔 Start Receiving Online Payments
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Allow tenants to pay deposit and monthly rent directly to your bank account.
                </p>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>&lt; 1 minute setup</span>
            </div>
            <div className="text-sm text-gray-600">
              Powered by Razorpay
            </div>
          </div>

          {/* Action button */}
          <div className="flex items-center justify-between">
            <Button
              onClick={handleEnablePayments}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Setting up...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Enable Online Payments
                </>
              )}
            </Button>
            
            <p className="text-xs text-gray-500">
              Takes less than 1 minute. Secure & powered by Razorpay.
            </p>
          </div>
        </div>
      </Card>

      {/* Payment Onboarding Dialog */}
      <PaymentOnboardingDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

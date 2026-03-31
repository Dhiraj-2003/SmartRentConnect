import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ownerAPI } from '@/lib/api';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Banknote,
  Shield,
  Info
} from 'lucide-react';

interface PaymentOnboardingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface FormData {
  accountHolderName: string;
  accountNumber: string;
  ifsc: string;
}

interface FormErrors {
  accountHolderName?: string;
  accountNumber?: string;
  ifsc?: string;
}

export const PaymentOnboardingDialog: React.FC<PaymentOnboardingDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const [formData, setFormData] = useState<FormData>({
    accountHolderName: '',
    accountNumber: '',
    ifsc: ''
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation functions
  const validateAccountHolderName = (name: string): string | undefined => {
    if (!name.trim()) return 'Account holder name is required';
    if (name.trim().length < 3) return 'Name must be at least 3 characters long';
    if (!/^[a-zA-Z\s.]+$/.test(name)) return 'Name can only contain letters, spaces, and dots';
    return undefined;
  };

  const validateAccountNumber = (accountNumber: string): string | undefined => {
    if (!accountNumber.trim()) return 'Account number is required';
    if (!/^\d{9,18}$/.test(accountNumber.replace(/\s/g, ''))) {
      return 'Account number must be 9-18 digits';
    }
    return undefined;
  };

  const validateIFSC = (ifsc: string): string | undefined => {
    if (!ifsc.trim()) return 'IFSC code is required';
    if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase())) {
      return 'Invalid IFSC format (e.g., SBIN0001234)';
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const nameError = validateAccountHolderName(formData.accountHolderName);
    if (nameError) newErrors.accountHolderName = nameError;

    const accountError = validateAccountNumber(formData.accountNumber);
    if (accountError) newErrors.accountNumber = accountError;

    const ifscError = validateIFSC(formData.ifsc);
    if (ifscError) newErrors.ifsc = ifscError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFieldBlur = (field: keyof FormData) => {
    let error: string | undefined;
    
    switch (field) {
      case 'accountHolderName':
        error = validateAccountHolderName(formData.accountHolderName);
        break;
      case 'accountNumber':
        error = validateAccountNumber(formData.accountNumber);
        break;
      case 'ifsc':
        error = validateIFSC(formData.ifsc);
        break;
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await ownerAPI.onboardPayments(
        formData.accountHolderName.trim(),
        formData.accountNumber.replace(/\s/g, ''),
        formData.ifsc.toUpperCase().trim()
      );

      if (response.data.success) {
        toast.success('Payment onboarding initiated successfully! You will receive further updates.');
        onSuccess?.();
        onOpenChange(false);
        
        // Reset form
        setFormData({
          accountHolderName: '',
          accountNumber: '',
          ifsc: ''
        });
        setErrors({});
      } else {
        toast.error(response.data.message || 'Payment onboarding failed');
      }
    } catch (error: any) {
      console.error('Payment onboarding error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to initiate payment onboarding';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
      // Reset form after a delay to allow animation to complete
      setTimeout(() => {
        setFormData({
          accountHolderName: '',
          accountNumber: '',
          ifsc: ''
        });
        setErrors({});
      }, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Enable Online Payments
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Information Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <div className="space-y-1">
                <p className="font-medium">Secure & Fast Setup</p>
                <p className="text-sm">
                  Connect your bank account to start receiving online payments from tenants. 
                  Powered by Razorpay with bank-level security.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Account Holder Name */}
          <div className="space-y-2">
            <Label htmlFor="accountHolderName">
              Account Holder Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountHolderName"
              type="text"
              placeholder="Enter account holder name"
              value={formData.accountHolderName}
              onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
              onBlur={() => handleFieldBlur('accountHolderName')}
              className={errors.accountHolderName ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.accountHolderName && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.accountHolderName}
              </p>
            )}
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="accountNumber">
              Account Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="accountNumber"
              type="text"
              placeholder="Enter 9-18 digit account number"
              value={formData.accountNumber}
              onChange={(e) => {
                // Only allow numbers and spaces
                const value = e.target.value.replace(/[^\d\s]/g, '');
                handleInputChange('accountNumber', value);
              }}
              onBlur={() => handleFieldBlur('accountNumber')}
              className={errors.accountNumber ? 'border-red-500' : ''}
              disabled={isSubmitting}
            />
            {errors.accountNumber && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.accountNumber}
              </p>
            )}
          </div>

          {/* IFSC Code */}
          <div className="space-y-2">
            <Label htmlFor="ifsc">
              IFSC Code <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ifsc"
              type="text"
              placeholder="e.g., SBIN0001234"
              value={formData.ifsc}
              onChange={(e) => {
                // Auto-uppercase and only allow alphanumeric
                const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                handleInputChange('ifsc', value);
              }}
              onBlur={() => handleFieldBlur('ifsc')}
              className={errors.ifsc ? 'border-red-500' : ''}
              maxLength={11}
              disabled={isSubmitting}
            />
            {errors.ifsc && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.ifsc}
              </p>
            )}
          </div>

          {/* Security Notice */}
          <Alert className="border-green-200 bg-green-50">
            <Shield className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <div className="space-y-1">
                <p className="font-medium">Your Information is Secure</p>
                <p className="text-sm">
                  Bank details are encrypted and securely stored. We use industry-standard 
                  security measures to protect your financial information.
                </p>
              </div>
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
                  <Banknote className="w-4 h-4 mr-2" />
                  Enable Payments
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

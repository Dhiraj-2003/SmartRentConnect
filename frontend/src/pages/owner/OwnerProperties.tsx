import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyList } from '@/components/owner/PropertyList';
import { PropertyForm } from '@/components/owner/PropertyForm';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, ArrowLeft, AlertTriangle, Shield } from 'lucide-react';

export const OwnerProperties: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [profileStatus, setProfileStatus] = useState({
    isProfileComplete: false,
    isVerified: false
  });

  useEffect(() => {
    // Load profile status - in real app: await ownerAPI.getProfileStatus()
    setProfileStatus({
      isProfileComplete: false, // Set to false to show incomplete state
      isVerified: false
    });
  }, []);

  const handleAddPropertyClick = () => {
    if (!profileStatus.isProfileComplete) {
      toast.error('Please complete your profile first to add properties');
      navigate('/owner/profile');
      return;
    }
    if (!profileStatus.isVerified) {
      toast.error('Your profile is under review. You can add properties once verified by admin.');
      return;
    }
    setShowForm(true);
  };

  const handleBackToList = () => {
    setShowForm(false);
  };

  const handleSuccess = () => {
    setShowForm(false);
    // Optionally show a success message or refresh the property list
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  const isAddPropertyDisabled = !profileStatus.isProfileComplete || !profileStatus.isVerified;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!showForm ? (
        <>
          {/* Profile Status Alert */}
          {!profileStatus.isProfileComplete && (
            <Alert className="mb-6 border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Complete Your Profile:</strong> Please complete your profile and upload required documents to start adding properties.
              </AlertDescription>
            </Alert>
          )}

          {profileStatus.isProfileComplete && !profileStatus.isVerified && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Verification Pending:</strong> Your profile is under admin review. You'll be able to add properties once verified.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">My Properties</h1>
              <p className="text-muted-foreground">
                Manage your property listings and track their performance
              </p>
            </div>
            <Button 
              onClick={handleAddPropertyClick} 
              className={`flex items-center ${isAddPropertyDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isAddPropertyDisabled}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>

          <PropertyList showHeader={false} />
        </>
      ) : (
        <>
          <div className="mb-8">
            <Button 
              onClick={handleBackToList} 
              variant="ghost"
              className="flex items-center mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Properties
            </Button>
          </div>

          <PropertyForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PropertyList } from '@/components/owner/PropertyList';
import { NewPropertyForm } from '@/components/owner/NewPropertyForm';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Plus, ArrowLeft, AlertTriangle, Shield, User, CheckCircle } from 'lucide-react';
import { ownerAPI } from '@/lib/api';

export const OwnerProperties: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [profileStatus, setProfileStatus] = useState({
    isProfileComplete: false,
    isVerified: false,
    verificationStatus: 'PENDING',
    rejectionReason: undefined,
    completionPercentage: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfileStatus = async () => {
      try {
        const response = await ownerAPI.getProfile().catch(() => null);
        
        if (response) {
          // Calculate completion percentage based on required fields
          const requiredFields = [
            'fullName', 'phone', 'address', 'city', 'state', 'pincode', 'dateOfBirth'
          ];
          const completedFields = requiredFields.filter(
            field => !!response.data[field]
          ).length;
          const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
          
          setProfileStatus({
            isProfileComplete: response.data.isProfileComplete || false,
            isVerified: response.data.isVerified || false,
            verificationStatus: response.data.verificationStatus || 'PENDING',
            rejectionReason: response.data.rejectionReason || undefined,
            completionPercentage
          });
        } else {
          // If profile not found, set default values
          setProfileStatus({
            isProfileComplete: false,
            isVerified: false,
            verificationStatus: 'PENDING',
            rejectionReason: undefined,
            completionPercentage: 0
          });
        }
      } catch (error) {
        console.error('Error loading profile status:', error);
        toast.error('Failed to load profile status');
      } finally {
        setLoading(false);
      }
    };

    loadProfileStatus();
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
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Complete Your Profile:</strong> Your profile is {profileStatus.completionPercentage}% complete. 
                    Complete your profile and upload required documents to start adding properties.
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/owner/profile')}
                    className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Complete Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {profileStatus.isProfileComplete && !profileStatus.isVerified && profileStatus.verificationStatus !== 'REJECTED' && (
            <Alert className="mb-6 border-yellow-200 bg-yellow-50">
              <Shield className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Verification Pending:</strong> Your profile is complete and under admin review. 
                    You'll be able to add properties once your documents are verified.
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/owner/profile')}
                    className="ml-4 border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {profileStatus.verificationStatus === 'REJECTED' && profileStatus.rejectionReason && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Verification Rejected:</strong> Your profile verification was rejected. 
                    Please review the feedback and update your profile to resubmit for verification.
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/owner/profile')}
                    className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    <User className="w-4 h-4 mr-1" />
                    Update Profile
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {profileStatus.isProfileComplete && profileStatus.isVerified && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Profile Verified:</strong> Your profile is complete and verified. You can now add and manage properties!
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/owner/profile')}
                    className="ml-4 border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <User className="w-4 h-4 mr-1" />
                    View Profile
                  </Button>
                </div>
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
              disabled={isAddPropertyDisabled || loading}
              variant={isAddPropertyDisabled ? 'outline' : 'default'}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>

          <PropertyList 
            showHeader={false} 
            verificationStatus={
              !profileStatus.isProfileComplete ? 'incomplete' : 
              profileStatus.isVerified ? 'verified' : 'pending'
            }
          />
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

          <NewPropertyForm 
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </>
      )}
    </div>
  );
};

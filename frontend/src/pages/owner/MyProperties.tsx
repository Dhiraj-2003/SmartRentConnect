import React, { useState, useEffect } from 'react';
import { PropertyList } from '@/components/owner/PropertyList';
import { useNavigate } from 'react-router-dom';
import { ownerAPI } from '@/lib/api';
import { toast } from 'sonner';

export const MyProperties: React.FC = () => {
  const navigate = useNavigate();
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
      } finally {
        setLoading(false);
      }
    };

    loadProfileStatus();
  }, []);

  const handleAddProperty = () => {
    navigate('/owner/add-property');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PropertyList 
        showHeader={true}
        onAddProperty={handleAddProperty}
        verificationStatus={
          !profileStatus.isProfileComplete ? 'incomplete' : 
          profileStatus.isVerified ? 'verified' : 'pending'
        }
      />
    </div>
  );
};

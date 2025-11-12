import React from 'react';
import { PropertyForm } from '@/components/owner/PropertyForm';
import { useNavigate } from 'react-router-dom';

export const AddProperty: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/owner/dashboard');
  };

  const handleCancel = () => {
    navigate('/owner/dashboard');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PropertyForm 
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
};
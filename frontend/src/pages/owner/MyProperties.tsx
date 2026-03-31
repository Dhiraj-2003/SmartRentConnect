import React from 'react';
import { PropertyList } from '@/components/owner/PropertyList';
import { useNavigate } from 'react-router-dom';

export const MyProperties: React.FC = () => {
  const navigate = useNavigate();

  const handleAddProperty = () => {
    navigate('/owner/add-property');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PropertyList
        showHeader={true}
        onAddProperty={handleAddProperty}
        verificationStatus="pending"
      />
    </div>
  );
};

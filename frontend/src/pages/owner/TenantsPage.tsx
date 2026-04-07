import React from 'react';
import { TenantsManagement } from '@/components/owner/TenantsManagement';

export const TenantsPage: React.FC = () => {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Tenants Management</h1>
        <p className="text-muted-foreground mt-2">
          Manage all your tenants, track payments, and handle occupancy
        </p>
      </div>
      
      <TenantsManagement />
    </div>
  );
};

export default TenantsPage;

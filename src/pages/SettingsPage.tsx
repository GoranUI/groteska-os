
import React from 'react';
import { ProfileSettings } from '@/components/ProfileSettings';

const SettingsPage = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>
      
      <ProfileSettings />
    </div>
  );
};

export default SettingsPage;

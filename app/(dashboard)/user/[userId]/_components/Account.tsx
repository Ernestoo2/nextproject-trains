'use client';

import React, { useState } from "react";
import { User } from 'next-auth';
import EditProfile from './EditProfile';

interface AccountProps {
  user: User;
}

const Account: React.FC<AccountProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);

  const userDetails = {
    name: currentUser.name || 'Not set',
    email: currentUser.email || 'Not set',
    phone: 'phone' in currentUser ? (currentUser as any).phone || 'Not set' : 'Not set',
    address: 'address' in currentUser ? (currentUser as any).address || 'Not set' : 'Not set',
    dob: 'dob' in currentUser ? (currentUser as any).dob || 'Not set' : 'Not set',
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = (updatedUser: Partial<User>) => {
    setCurrentUser(prev => ({ ...prev, ...updatedUser }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <EditProfile
        user={currentUser}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Account Details</h2>
        <button 
          onClick={handleEdit}
          className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
        >
          Edit Profile
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(userDetails).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <p className="text-sm font-medium text-gray-500">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </p>
            <p className="text-base text-gray-900">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Account; 
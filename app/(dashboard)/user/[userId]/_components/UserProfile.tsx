'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'next-auth';

interface UserProfileProps {
  user: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex flex-col items-center mb-6">
        <div className="w-24 h-24 relative mb-4">
          <Image
            src={user.image || '/default-avatar.png'}
            alt={user.name || 'User avatar'}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <h2 className="text-xl font-semibold">{user.name}</h2>
        <p className="text-gray-600">{user.email}</p>
      </div>

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Account Settings</h3>
          <button className="w-full text-left py-2 px-4 hover:bg-gray-50 rounded">
            Edit Profile
          </button>
          <button className="w-full text-left py-2 px-4 hover:bg-gray-50 rounded">
            Change Password
          </button>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Preferences</h3>
          <button className="w-full text-left py-2 px-4 hover:bg-gray-50 rounded">
            Notification Settings
          </button>
          <button className="w-full text-left py-2 px-4 hover:bg-gray-50 rounded">
            Privacy Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 
"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import EditProfile from "./EditProfile";
import { UserProfile } from "@/types/shared/users";
import { toast } from "sonner";

interface AccountProps {
  user: UserProfile;
}

const Account: React.FC<AccountProps> = ({ user: initialUser }) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserProfile>(initialUser);

  // Load user data on mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      
      const data = await response.json();
      if (data.success && data.data) {
        setUser(data.data);
      }
    } catch (error) {
      toast.error('Error loading profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async (updates: Partial<UserProfile>) => {
    if (!session?.user?.id) {
      toast.error("User ID not found");
      return;
    }
    
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/user/${session.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      if (data.success && data.data) {
        setUser(data.data);
        toast.success('Profile updated successfully');
      }
      
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const userDetails = {
    name: user.name || "Not set",
    email: user.email || "Not set",
    phone: user.phone || "Not set",
    address: user.address || "Not set",
    dob: user.dob || "Not set",
  };

  if (isEditing) {
    return (
      <EditProfile
        user={user}
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
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Edit Profile'}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(userDetails).map(([key, value]) => (
          <div key={key} className="space-y-1">
            <p className="text-sm font-medium text-gray-500">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </p>
            <p className="text-base text-gray-900">{value}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>NaijaRails ID: {user.naijaRailsId}</p>
        {user.createdAt && <p>Account Created: {new Date(user.createdAt).toLocaleString()}</p>}
        {user.updatedAt && <p>Last Updated: {new Date(user.updatedAt).toLocaleString()}</p>}
      </div>
    </div>
  );
};

export default Account;

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useUser } from "@/_providers/user/UserContext";
import { UserProfile } from "@/types/shared/users";
import { toast } from "sonner";
import Image from "next/image";
import { Loader2 } from "lucide-react";

// Generate a random 12-digit ID
const generateNaijaRailsId = () => {
  const prefix = "NR";
  const randomNum = Math.floor(Math.random() * 10000000000)
    .toString()
    .padStart(10, "0");
  return `${prefix}${randomNum}`;
};

interface AccountProps {
  user: UserProfile;
}

const Account: React.FC<AccountProps> = ({ user: initialUser }) => {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserProfile>(initialUser);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: initialUser.name || "",
    phone: initialUser.phone || "",
    address: initialUser.address || "",
    dob: initialUser.dob || "",
  });

  // Fetch latest user data
  const refreshUserData = async () => {
    if (!session?.user?.id) return;
    
    try {
      setIsLoading(true);
      const response = await fetch(`/api/user/${session.user.id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        const freshData = result.data;
        setUserData(freshData);
        
        // Update form data with fresh data
        setFormData({
          name: freshData.name || "",
          phone: freshData.phone || "",
          address: freshData.address || "",
          dob: freshData.dob || "",
        });
      } else {
        throw new Error(result.message || "Failed to get user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load profile data");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user data when component mounts
  useEffect(() => {
    if (session?.user?.email) {
      refreshUserData();
    }
  }, [session?.user?.email, refreshUserData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    if (!session?.user?.id) {
      toast.error("User ID not found");
      return;
    }
    
    try {
      setIsLoading(true);

      const response = await fetch(`/api/user/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to update profile");
      }

      if (result.success && result.data) {
        setUserData(result.data);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error("No data returned from server");
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Error updating profile!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      
      // Create FormData
      const formData = new FormData();
      formData.append('image', file);
      
      // Upload image
      const response = await fetch(`/api/user/${session?.user?.id}/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        // Update user data with new image URL
        setUserData(prev => ({
          ...prev,
          image: result.data.imageUrl
        }));
        toast.success('Profile image updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update profile image');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Account Details</h2>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-white bg-[#07561A] rounded-md hover:bg-[#064e15] transition-colors"
            disabled={isLoading}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Profile Image Section */}
      <div className="mb-6 flex flex-col items-center">
        <div className="relative w-32 h-32 mb-4">
          {userData.image ? (
            <Image
              src={userData.image}
              alt="Profile"
              fill
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-4xl text-gray-500">
                {userData.name?.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
          )}
        </div>
        <button
          onClick={triggerImageUpload}
          disabled={isUploading}
          className="px-4 py-2 text-sm text-white bg-[#07561A] rounded-md hover:bg-[#064e15] transition-colors"
        >
          {isUploading ? 'Uploading...' : 'Change Profile Picture'}
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Read-only fields */}
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-600">Email</p>
            <p className="text-base break-all">{userData.email}</p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">Role</p>
            <p className="text-base break-all">
              {(userData.role ?? "").toUpperCase()}
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-600">NaijaRails ID</p>
            <p className="text-base break-all">
              {userData.naijaRailsId || "Not available"}
            </p>
          </div>
        </div>

        {/* Editable fields */}
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-600">Name</p>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#07561A]"
              />
            ) : (
              <p className="text-base">{userData.name || "Not set"}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-600">Phone</p>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#07561A]"
              />
            ) : (
              <p className="text-base">{userData.phone || "Not set"}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-600">Address</p>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#07561A]"
              />
            ) : (
              <p className="text-base">{userData.address || "Not set"}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-gray-600">Date of Birth</p>
            {isEditing ? (
              <input
                type="date"
                name="dob"
                value={formData.dob || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#07561A]"
              />
            ) : (
              <p className="text-base">
                {userData.dob
                  ? new Date(userData.dob).toLocaleDateString()
                  : "Not set"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="mt-6 space-y-2 text-sm text-gray-500">
        {userData.createdAt && (
          <p>Account Created: {new Date(userData.createdAt).toLocaleString()}</p>
        )}
        {userData.updatedAt && (
          <p>Last Updated: {new Date(userData.updatedAt).toLocaleString()}</p>
        )}
      </div>

      {/* Action buttons */}
      {isEditing && (
        <div className="mt-6 flex gap-4">
          <button
            onClick={handleUpdate}
            className="px-4 py-2 text-white bg-[#07561A] rounded-md hover:bg-[#064e15] transition-colors"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setFormData({
                name: userData.name || "",
                phone: userData.phone || "",
                address: userData.address || "",
                dob: userData.dob || "",
              });
            }}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default Account;

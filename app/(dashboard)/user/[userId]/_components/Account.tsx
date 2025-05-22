"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserProfile } from "@/types/shared/users";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface AccountProps {
  user: UserProfile;
  onProfileUpdate: (updatedData: Partial<UserProfile>) => void;
  onImageUploadSuccess: (imageUrl: string) => void;
  onImageFileSelect: (file: File) => Promise<void>;
}

interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: string;
}

export default function Account({
  user,
  onProfileUpdate,
  onImageUploadSuccess,
  onImageFileSelect,
}: AccountProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
    dob: user.dob || "",
  });

  useEffect(() => {
    setFormData({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      dob: user.dob || "",
    });
  }, [user]);

  useEffect(() => {
    return () => {
      if (previewImageUrl) {
        URL.revokeObjectURL(previewImageUrl);
      }
    };
  }, [previewImageUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    onProfileUpdate(formData);
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type', {
        description: 'Please upload an image file (JPEG, PNG, etc.)',
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: `File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 10MB limit`,
      });
      return;
    }

    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewImageUrl(newPreviewUrl);
    setIsUploading(true);

    try {
      await onImageFileSelect(file);

    } catch (error: any) {
      console.error("Error handling file selection:", error);

      let userMessage = 'There was a problem uploading your image. Please try again.';
      let errorDetails = '';

      if (error.response && error.response.data) {
        const errorData = error.response.data as ErrorResponse;
        if (typeof errorData === 'object' && errorData !== null && errorData.success === false) {
             userMessage = errorData.message || userMessage;
             errorDetails = errorData.details || '';
        } else {
            userMessage = `Upload failed: Unexpected response format.`;
            errorDetails = `Details: ${error.response.data?.toString()?.substring(0, 100) || 'N/A'}...`;
        }
      } else if (error.message) {
          userMessage = `Upload failed: ${error.message}`;
      } else {
          userMessage = 'An unknown error occurred during upload. Please try again.';
      }

      toast.error(userMessage, { description: errorDetails });

      setPreviewImageUrl(null);

    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Account Information</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Profile"}
        </button>
      </div>

      <div className="space-y-6">
        {/* Profile Image Section */}
        <div className="flex items-center space-x-4">
          <div className="relative w-24 h-24">
            {previewImageUrl ? (
              <Image
                src={previewImageUrl}
                alt="Preview"
                fill
                className="rounded-full object-cover"
              />
            ) : user.image ? (
              <Image
                src={user.image}
                alt="Profile"
                fill
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-green-100 flex items-center justify-center text-green-600 text-2xl font-bold">
                {user.name?.[0]?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <button
            onClick={triggerImageUpload}
            disabled={isUploading}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Change Photo"
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            disabled={isUploading}
          />
        </div>

        {/* Profile Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <p className="text-gray-900">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{user.phone || "Not provided"}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            {isEditing ? (
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{user.dob || "Not provided"}</p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            {isEditing ? (
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900">{user.address || "Not provided"}</p>
            )}
          </div>
      </div>
      
        {isEditing && (
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  name: user.name || "",
                  phone: user.phone || "",
                  address: user.address || "",
                  dob: user.dob || "",
                });
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpdate}
              disabled={isLoadingUpdate}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              {isLoadingUpdate && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
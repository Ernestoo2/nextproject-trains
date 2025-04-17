import React, { useState } from "react";
import { useUser } from "@/_providers/user/UserContext";
import { useSession } from "next-auth/react";
import { UserProfile } from "@/utils/type";

// Generate a random 12-digit ID
const generateNaijaRailsId = () => {
  const prefix = 'NR';
  const randomNum = Math.floor(Math.random() * 10000000000).toString().padStart(10, '0');
  return `${prefix}${randomNum}`;
};

interface AccountProps {
  user: UserProfile & {
    createdAt?: string;
    updatedAt?: string;
  };
}

const Account: React.FC<AccountProps> = ({ user }) => {
  const { updateUserProfile } = useUser();
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState<UserProfile>(user);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    address: user.address || "",
    dob: user.dob || "",
  });

  // Fetch latest user data
  const refreshUserData = async () => {
    try {
      const response = await fetch(`/api/user/${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const freshData = await response.json();
      const updatedUserProfile: UserProfile = {
        id: freshData.id || user.id,
        name: freshData.name,
        email: freshData.email,
        phone: freshData.phone,
        address: freshData.address,
        dob: freshData.dob,
        image: freshData.image,
        role: freshData.role || 'user'
      };
      setUserData(updatedUserProfile);
      updateUserProfile(updatedUserProfile);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      setIsLoading(true);
      const updatedProfile = {
        ...formData,
        email: session?.user?.email || userData.email,
      };

      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      await refreshUserData();
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error updating profile!");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Not set";
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
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
            {(userData.role ?? '').toUpperCase()}
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
                {userData.dob ? new Date(userData.dob).toLocaleDateString() : "Not set"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="mt-6 space-y-2 text-sm text-gray-500">
        {user.createdAt && (
          <p>Account Created: {new Date(user.createdAt).toLocaleString()}</p>
        )}
        {user.updatedAt && (
          <p>Last Updated: {new Date(user.updatedAt).toLocaleString()}</p>
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

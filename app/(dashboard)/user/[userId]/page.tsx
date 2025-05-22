"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Account from "./_components/Account";
import Tickets from "./_components/Tickets";
import PaymentHistory from "../_components/PaymentHistory";
import Image from "next/image";
import { UserProfile } from "@/types/shared/users";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import BookingHistory from "./_components/BookingHistory";

interface PageParams {
  userId: string;
}

export const dynamic = 'force-dynamic';

export default function UserProfilePage({ params }: { params: Promise<PageParams> }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("account");
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = React.use(params);

  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: userData?.name || "",
    phone: userData?.phone || "",
    address: userData?.address || "",
    dob: userData?.dob || "",
  });

  useEffect(() => {
    setFormData({
      name: userData?.name || "",
      phone: userData?.phone || "",
      address: userData?.address || "",
      dob: userData?.dob || "",
    });
  }, [userData]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/user/${resolvedParams.userId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        const data = await response.json();
        if (data.success && data.data) {
          setUserData(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch user data");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchUserData();
    }
  }, [session?.user, resolvedParams.userId]);

  const handleProfileUpdate = async (updatedData: Partial<UserProfile>) => {
    if (!session?.user?.id) {
      toast.error("User ID not found");
      return;
    }

    try {
      setIsLoadingUpdate(true);

      const response = await fetch(`/api/user/${session.user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
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
      setIsLoadingUpdate(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!session?.user?.id) {
        toast.error("User ID not found");
        return;
      }
      
    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/user/${session.user.id}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload image');
      }

      const result = await response.json();

      if (result.success && result.data?.imageUrl) {
        setUserData(prev => {
            if (!prev) return null;
            return { ...prev, image: result.data.imageUrl };
        });
        toast.success('Profile image updated successfully');
      } else {
        throw new Error(result.message || 'Failed to update profile image: Invalid response data');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/auth/signin");
    return null;
  }

  if (session.user.id !== resolvedParams.userId && session.user.naijaRailsId !== resolvedParams.userId) {
    router.push("/dashboard");
    return null;
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4 text-red-600">Profile not found</h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-green-600 text-white px-6 py-2 rounded-md"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow">
          <div className="w-full mx-auto relative rounded-lg bg-white">
            <div className="w-full h-48 bg-gradient-to-r from-green-400 to-green-600 rounded-t-lg"></div>
            <div className="flex flex-col justify-center items-center -mt-20 mx-auto">
              <div className="w-36 h-36 overflow-hidden bg-gray-300 border-4 border-white rounded-full">
              {userData?.image ? (
                  <Image
                  src={userData.image}
                    alt="Profile"
                    width={144}
                    height={144}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 text-2xl font-bold">
                  {userData?.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
            <h1 className="mt-4 text-xl font-bold">{userData?.name}</h1>
            <p className="text-gray-600">{userData?.email}</p>
             {userData?.naijaRailsId && <p className="text-sm text-gray-500">ID: {userData.naijaRailsId}</p>}
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2 px-4">
            <button
              onClick={() => setActiveTab("account")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === "account"
                ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === "tickets"
                ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200"}
              }`}
            >
              Tickets/Bookings
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === "payment"
                ? "bg-green-500 text-white" : "bg-gray-100 hover:bg-gray-200"}
              }`}
            >
              Payment History
            </button>
          </div>

          <div className="max-w-7xl mx-auto p-6 mt-6">
          {activeTab === "account" && userData && 
            <Account 
              user={userData} 
              onProfileUpdate={handleProfileUpdate}
              onImageUploadSuccess={(imageUrl) => {
                setUserData(prev => {
                    if (!prev) return null;
                    return { ...prev, image: imageUrl };
                });
              }}
              onImageFileSelect={handleImageUpload}
            />
          }
          {activeTab === "tickets" && <BookingHistory userId={resolvedParams.userId} />}
          {activeTab === "payment" && <PaymentHistory userId={resolvedParams.userId} />}
          </div>
        </main>
      </div>
  );
}
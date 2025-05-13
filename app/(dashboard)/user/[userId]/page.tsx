"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import HeaderUi from "@/_components/Header/HeaderUi";
import FooterPage from "@/_components/Footer";
import Account from "../_components/Account";
import Tickets from "../_components/Tickets";
import Payment from "../_components/Payment";
import Image from "next/image";
import { UserProfile } from "@/utils/type";
import { useParams, useRouter } from "next/navigation";
import ErrorBoundary from "@/_components/ErrorBoundary";

export default function UserPage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("account");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Use the useParams hook to get the userId
  const params = useParams();
  const userId = params?.userId as string;

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      // If userId is undefined or "undefined", use the session user's ID
      const effectiveUserId =
        userId === "undefined" ? session?.user?.id : userId;

      if (!effectiveUserId) {
        setError("User ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log("Fetching user with ID:", effectiveUserId);
        const response = await fetch(`/api/user/${effectiveUserId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("User not found");
          } else {
            setError(`Error: ${response.statusText}`);
          }
          setIsLoading(false);
          return;
        }

        const data = await response.json();
        console.log("User data received:", data);
        setUser(data);
        setError(null);
      } catch (error) {
        console.error("Error fetching user:", error);
        setError("Failed to fetch user data");
      } finally {
        setIsLoading(false);
      }
    };

    if (status !== "loading") {
      fetchUser();
    }
  }, [userId, session, status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  // Transform session user to UserProfile type if needed
  const sessionUser: UserProfile | null = session?.user
    ? {
        id: session.user.id || userId,
        name: session.user.name || "",
        email: session.user.email || "",
        image: session.user.image || undefined,
        role: "user",
      }
    : null;

  const displayUser = user || sessionUser;

  if (!displayUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">User not found</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <HeaderUi />
        <main className="flex-grow">
          {/* Profile Header */}
          <div className="w-full mx-auto relative rounded-lg bg-white">
            <div className="w-full h-48 bg-gradient-to-r from-green-400 to-green-600 rounded-t-lg"></div>
            <div className="flex flex-col justify-center items-center -mt-20 mx-auto">
              <div className="w-36 h-36 overflow-hidden bg-gray-300 border-4 border-white rounded-full">
                {displayUser.image ? (
                  <Image
                    src={displayUser.image}
                    alt="Profile"
                    width={144}
                    height={144}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-600 text-4xl font-bold">
                    {displayUser.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <h1 className="mt-4 text-xl font-bold">{displayUser.name}</h1>
              <p className="text-gray-600">{displayUser.email}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mt-8 space-x-2 px-4">
            <button
              onClick={() => setActiveTab("account")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === "account"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Account
            </button>
            <button
              onClick={() => setActiveTab("tickets")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === "tickets"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Tickets/Bookings
            </button>
            <button
              onClick={() => setActiveTab("payment")}
              className={`px-6 py-2 rounded-lg transition-colors ${
                activeTab === "payment"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              Payment Methods
            </button>
          </div>

          {/* Content Section */}
          <div className="max-w-7xl mx-auto p-6 mt-6">
            {activeTab === "account" && <Account user={displayUser} />}
            {activeTab === "tickets" && <Tickets userId={displayUser.id} />}
            {activeTab === "payment" && <Payment userId={displayUser.id} />}
          </div>
        </main>
        <FooterPage />
      </div>
    </ErrorBoundary>
  );
}
